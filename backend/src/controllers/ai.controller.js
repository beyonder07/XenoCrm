const { GoogleGenerativeAI } = require('@google/generative-ai');
const Segment = require('../models/segment.model');
const Campaign = require('../models/campaign.model');
const Customer = require('../models/customer.model');
const CommunicationLog = require('../models/communicationLog.model');
const AppError = require('../utils/appError');
const config = require('../config');
const logger = require('../utils/logger');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

/**
 * Helper function to create a Gemini model instance
 * @param {string} modelName - The model name to use (defaults to "gemini-pro")
 * @returns {GenerativeModel} - The generative model instance
 */
const getGeminiModel = (modelName = "gemini-2.0-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * @swagger
 * /ai/nl-to-rules:
 *   post:
 *     summary: Convert natural language to segment rules
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "Customers who spent over ₹10,000 in the last 3 months"
 *     responses:
 *       200:
 *         description: Generated segment rules
 */
exports.naturalLanguageToRules = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    console.log(prompt);
    
    if (!prompt) {
      return next(new AppError('Prompt is required', 400));
    }
    
    // Log the request
    logger.info(`NL to rules request: ${prompt}`);
    
    // Create the model instance
    const model = getGeminiModel();
    
    // Define system prompt and user prompt
    const systemPrompt = `You are an AI assistant that converts natural language descriptions of customer segments into structured rules.
    
    The output should be a JSON object with the following structure:
    {
      "conditionType": "AND" or "OR",
      "conditions": [
        {
          "field": "Field name from the list below",
          "operator": "Operator from the list below",
          "value": "Value appropriate for the field and operator"
        }
      ]
    }
    
    Available fields:
    - totalSpend: numeric field for total amount spent
    - orderCount: numeric field for number of orders
    - lastOrderDate: date field for most recent order
    - name: text field for customer name
    - email: text field for customer email
    - location: text field for customer location
    - isActive: boolean field for active status (true or false)
    
    Available operators:
    - For numeric fields: equals, notEquals, greaterThan, lessThan, greaterThanOrEqual, lessThanOrEqual, between
    - For text fields: equals, notEquals, contains, startsWith, endsWith
    - For date fields: equals, before, after, inLast, notInLast
    - For boolean fields: equals
    
    Parse the user's natural language request and convert it to the appropriate rule format. Be sure to infer whether conditions should be combined with AND or OR logic.`;
    
    // Generate content using Gemini
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I'm ready to convert natural language descriptions into structured rules." }] },
        { role: "user", parts: [{ text: prompt }] }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    });
    
    // Extract the response text
    const rulesText = result.response.text();
    console.log('AI Generated Rules Text:', rulesText); // Log AI-generated rules text
    
    // Parse the JSON response
    let rules;
    try {
      // Sometimes Gemini might include markdown code blocks or explanation text
      // Extract just the JSON part
      const jsonMatch = rulesText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         rulesText.match(/{[\s\S]*}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : rulesText;
      rules = JSON.parse(jsonString.trim());
    } catch (err) {
      console.log('Error Parsing AI Response:', rulesText); // Log raw response on error
      logger.error(`Error parsing AI response: ${rulesText}`);
      return next(new AppError('Failed to parse AI response', 500));
    }
    
    // Validate the rules structure
    if (!rules.conditionType || !rules.conditions || !Array.isArray(rules.conditions)) {
      return next(new AppError('Invalid rules structure from AI', 500));
    }
    
    // Log success
    logger.info(`NL to rules success for: "${prompt}"`);
    
    res.status(200).json({
      status: 'success',
      data: {
        rules,
        originalPrompt: prompt,
      },
    });
  
  } catch (err) {
    logger.error(`Error in NL to rules: ${err.message}`);
    next(err);
  }
};

/**
 * @swagger
 * /ai/message-suggestions:
 *   post:
 *     summary: Generate message suggestions based on segment
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               segmentId:
 *                 type: string
 *               customRules:
 *                 type: object
 *               objective:
 *                 type: string
 *                 enum: [engagement, winback, promotion, announcement, information]
 *               tone:
 *                 type: string
 *                 enum: [friendly, professional, urgent, casual, formal]
 *     responses:
 *       200:
 *         description: Generated message suggestions
 */
exports.generateMessageSuggestions = async (req, res, next) => {
  try {
    const { segmentId, customRules, objective, tone } = req.body;
    
    // Log the input parameters
    logger.info(`Message Suggestions Request: segmentId=${segmentId}, objective=${objective}, tone=${tone}`);

    // Need either segmentId or customRules
    if (!segmentId && !customRules) {
      return next(new AppError('Either segmentId or customRules must be provided', 400));
    }
    
    let segmentDescription = '';
    let audienceSize = 0;
    
    // If segmentId is provided, get segment details
    if (segmentId) {
      const segment = await Segment.findById(segmentId);
      
      if (!segment) {
        return next(new AppError('Segment not found', 404));
      }
      
      segmentDescription = `Segment name: ${segment.name}\n`;
      segmentDescription += segment.description ? `Description: ${segment.description}\n` : '';
      segmentDescription += `Rules: ${JSON.stringify(segment.rules, null, 2)}\n`;
      audienceSize = segment.audienceSize;
    }
    // Otherwise, use custom rules
    else if (customRules) {
      segmentDescription = `Custom rules: ${JSON.stringify(customRules, null, 2)}\n`;
      
      // Create temporary segment to generate query
      const tempSegment = new Segment({
        name: 'Temporary',
        rules: customRules,
      });
      
      const query = tempSegment.toMongoQuery();
      
      // Count customers matching the query
      audienceSize = await Customer.countDocuments(query);
      
      segmentDescription += `Estimated audience size: ${audienceSize}\n`;
    }
    
    // Create the model instance
    const model = getGeminiModel();
    
    // Define system prompt
    const systemPrompt = `You are an AI assistant that generates message suggestions for marketing campaigns.
    
    Based on the segment description, audience size, campaign objective, and tone, generate 3 message suggestions.
    
    The output should be a JSON array with the following structure:
    [
      {
        "message": "Message text with {{name}} personalization",
        "tone": "friendly/professional/urgent/casual/formal",
        "strength": "high/medium/low"
      }
    ]
    
    Each message should:
    1. Be personalized with {{name}} placeholder
    2. Be under 160 characters (SMS length)
    3. Include a clear call to action
    4. Match the requested tone and objective
    
    Campaign objectives:
    - engagement: Re-engage customers who haven't interacted recently
    - winback: Bring back customers who haven't purchased in a while
    - promotion: Promote a sale or special offer
    - announcement: Announce new products or features
    - information: Share important information`;
    
    // User prompt with campaign details
    const userPrompt = `Generate 3 campaign message suggestions with the following details:
    
    ${segmentDescription}
    Audience Size: ${audienceSize}
    Campaign Objective: ${objective || 'engagement'}
    Preferred Tone: ${tone || 'friendly'}`;
    
    // Log the generated user prompt
    logger.info(`Generated User Prompt: ${userPrompt}`);

    // Generate content using Gemini
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I'll generate 3 campaign message suggestions based on the details you provide." }] },
        { role: "user", parts: [{ text: userPrompt }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });
    
    // Extract the response text
    const suggestionsText = result.response.text();
    console.log('AI Generated Suggestions Text:', suggestionsText); // Log AI-generated suggestions text
    
    // Log the raw AI response
    logger.info(`Raw AI Response: ${suggestionsText}`);

    // Parse the JSON response
    let suggestions;
    try {
      // Extract JSON part if needed
      const jsonMatch = suggestionsText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         suggestionsText.match(/\[\s*{[\s\S]*}\s*\]/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : suggestionsText;
      suggestions = JSON.parse(jsonString.trim());
    } catch (err) {
      console.log('Error Parsing AI Response:', suggestionsText); // Log raw response on error
      logger.error(`Error parsing AI response: ${suggestionsText}`);
      return next(new AppError('Failed to parse AI response', 500));
    }
    
    // Validate the suggestions structure
    if (!Array.isArray(suggestions)) {
      return next(new AppError('Invalid suggestions structure from AI', 500));
    }
    
    // Log success
    logger.info(`Generated ${suggestions.length} message suggestions for ${objective || 'engagement'} campaign`);
    
    res.status(200).json({
      status: 'success',
      data: {
        suggestions,
        audienceSize,
        objective: objective || 'engagement',
        tone: tone || 'friendly',
      },
    });
  } catch (err) {
    logger.error(`Error in message suggestions: ${err.message}`);
    next(err);
  }
};

/**
 * @swagger
 * /ai/campaign-insights/{id}:
 *   get:
 *     summary: Generate insights for campaign performance
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign insights
 *       404:
 *         description: Campaign not found
 */
exports.generateCampaignInsights = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate({
        path: 'segmentId',
        select: 'name description rules',
      });
    
    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }
    
    // Get detailed delivery statistics
    const logsStats = await CommunicationLog.aggregate([
      {
        $match: { campaignId: campaign._id },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    
    // Convert array to object for easier access
    const detailedStats = logsStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
    
    // Calculate time metrics
    let deliveryDuration = null;
    if (campaign.sentAt && campaign.completedAt) {
      deliveryDuration = Math.floor((campaign.completedAt - campaign.sentAt) / 1000); // in seconds
    }
    
    // Prepare campaign data for AI
    const campaignData = {
      name: campaign.name,
      description: campaign.description,
      message: campaign.message,
      audienceSize: campaign.audienceSize,
      stats: {
        ...campaign.stats,
        detailed: detailedStats,
      },
      segment: campaign.segmentId 
        ? {
            name: campaign.segmentId.name,
            description: campaign.segmentId.description,
            rules: campaign.segmentId.rules,
          }
        : { name: 'Custom Segment', rules: campaign.customRules },
      sentAt: campaign.sentAt,
      completedAt: campaign.completedAt,
      deliveryDuration,
      status: campaign.status,
    };
    
    // Create the model instance
    const model = getGeminiModel();
    
    // Define system prompt
    const systemPrompt = `You are an AI assistant that generates insights about marketing campaign performance.
    
    Based on the campaign data and delivery statistics, generate a comprehensive analysis with the following sections:
    1. Summary - A brief overview of the campaign performance
    2. Key Findings - Notable observations and metrics
    3. Recommendations - Actionable suggestions for future campaigns
    
    The output should be a JSON object with the following structure:
    {
      "summary": "Brief performance summary",
      "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
      "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
    }
    
    Focus on delivery rates, audience targeting effectiveness, and actionable insights.`;
    
    // User prompt with campaign details
    const userPrompt = `Generate campaign insights for the following campaign:
    
    Campaign Name: ${campaignData.name}
    Description: ${campaignData.description || 'N/A'}
    Message: ${campaignData.message}
    Audience Size: ${campaignData.audienceSize}
    Delivered: ${campaignData.stats.delivered} (${campaignData.stats.deliveredPercentage}%)
    Failed: ${campaignData.stats.failed} (${campaignData.stats.failedPercentage}%)
    Status: ${campaignData.status}
    ${campaignData.segment ? `Segment: ${campaignData.segment.name}` : ''}
    ${campaignData.deliveryDuration ? `Delivery Duration: ${campaignData.deliveryDuration} seconds` : ''}`;
    
    // Generate content using Gemini
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I'll analyze the campaign data and provide insights in the requested format." }] },
        { role: "user", parts: [{ text: userPrompt }] }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    });
    
    // Extract the response text
    const insightsText = result.response.text();
    console.log('AI Generated Insights Text:', insightsText); // Log AI-generated insights text
    
    // Parse the JSON response
    let insights;
    try {
      // Extract JSON part if needed
      const jsonMatch = insightsText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         insightsText.match(/{[\s\S]*}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : insightsText;
      insights = JSON.parse(jsonString.trim());
    } catch (err) {
      console.log('Error Parsing AI Response:', insightsText); // Log raw response on error
      logger.error(`Error parsing AI response: ${insightsText}`);
      return next(new AppError('Failed to parse AI response', 500));
    }
    
    // Validate the insights structure
    if (!insights.summary || !insights.keyFindings || !insights.recommendations) {
      return next(new AppError('Invalid insights structure from AI', 500));
    }
    
    // Log success
    logger.info(`Generated insights for campaign: ${campaign.name} (${campaign._id})`);
    
    res.status(200).json({
      status: 'success',
      data: {
        insights,
        campaign: {
          id: campaign._id,
          name: campaign.name,
          status: campaign.status,
        },
      },
    });
  } catch (err) {
    logger.error(`Error in campaign insights: ${err.message}`);
    next(err);
  }
};

/**
 * @swagger
 * /ai/optimal-send-time/{id}:
 *   get:
 *     summary: Get optimal send time recommendations for a segment
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: Optimal send time recommendations
 *       404:
 *         description: Segment not found
 */
exports.getOptimalSendTime = async (req, res, next) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return next(new AppError('Segment not found', 404));
    }
    
    // In a real implementation, this would analyze customer behavior patterns
    // For now, we'll return simulated recommendations
    
    // Generate random but consistent recommendations based on segment ID
    const segmentIdSum = segment._id.toString().split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const dayOffset = segmentIdSum % 7;
    const hourOffset = (segmentIdSum % 12) + 8; // 8 AM to 8 PM
    
    const today = new Date();
    const recommendedDay = new Date(today);
    recommendedDay.setDate(today.getDate() + dayOffset);
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const recommendedDayName = days[recommendedDay.getDay()];
    
    // Format time as 12-hour with AM/PM
    const hour = hourOffset % 12 || 12;
    const ampm = hourOffset >= 12 ? 'PM' : 'AM';
    const recommendedTime = `${hour}:00 ${ampm}`;
    
    // Alternative times (1-2 hours before and after)
    const altHour1 = ((hourOffset - 1 + 24) % 24) % 12 || 12;
    const altAmpm1 = (hourOffset - 1 + 24) % 24 >= 12 ? 'PM' : 'AM';
    const altTime1 = `${altHour1}:00 ${altAmpm1}`;
    
    const altHour2 = ((hourOffset + 1) % 24) % 12 || 12;
    const altAmpm2 = (hourOffset + 1) % 24 >= 12 ? 'PM' : 'AM';
    const altTime2 = `${altHour2}:00 ${altAmpm2}`;
    
    res.status(200).json({
      status: 'success',
      data: {
        segment: {
          id: segment._id,
          name: segment.name,
          audienceSize: segment.audienceSize,
        },
        recommendations: {
          primaryRecommendation: {
            day: recommendedDayName,
            time: recommendedTime,
            confidence: 'high',
          },
          alternativeRecommendations: [
            {
              day: recommendedDayName,
              time: altTime1,
              confidence: 'medium',
            },
            {
              day: recommendedDayName,
              time: altTime2,
              confidence: 'medium',
            },
          ],
          explanation: `Based on analysis of customer engagement patterns for this segment, ${recommendedDayName} at ${recommendedTime} is likely to achieve the highest open and response rates.`,
        },
      },
    });
  } catch (err) {
    logger.error(`Error in optimal send time: ${err.message}`);
    next(err);
  }
};

/**
 * @swagger
 * /ai/lookalike-audience/{id}:
 *   get:
 *     summary: Generate lookalike audience for a segment
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source segment ID
 *     responses:
 *       200:
 *         description: Lookalike audience rules
 *       404:
 *         description: Segment not found
 */
exports.generateLookalikeAudience = async (req, res, next) => {
  try {
    const sourceSegment = await Segment.findById(req.params.id);
    
    if (!sourceSegment) {
      return next(new AppError('Source segment not found', 404));
    }
    
    // Get a sample of customers from the source segment
    const query = sourceSegment.toMongoQuery();
    const sourceCustomers = await Customer.find(query).limit(100);
    
    if (sourceCustomers.length === 0) {
      return next(new AppError('Source segment has no customers', 400));
    }
    
    // Calculate average metrics
    const avgStats = sourceCustomers.reduce((acc, customer) => {
      acc.totalSpend += customer.totalSpend || 0;
      acc.orderCount += customer.orderCount || 0;
      return acc;
    }, { totalSpend: 0, orderCount: 0 });
    
    avgStats.totalSpend /= sourceCustomers.length;
    avgStats.orderCount /= sourceCustomers.length;
    
    // Get locations to target similar customers
    const locations = {};
    sourceCustomers.forEach(customer => {
      if (customer.location) {
        locations[customer.location] = (locations[customer.location] || 0) + 1;
      }
    });
    
    // Sort locations by frequency
    const topLocations = Object.entries(locations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([location]) => location);
    
    // Create lookalike rules
    const lookalikeRules = {
      conditionType: 'AND',
      conditions: [
        {
          field: 'totalSpend',
          operator: 'greaterThanOrEqual',
          value: Math.round(avgStats.totalSpend * 0.8), // 80% of average
        },
        {
          field: 'orderCount',
          operator: 'greaterThanOrEqual',
          value: Math.max(1, Math.floor(avgStats.orderCount * 0.8)), // 80% of average, min 1
        },
      ],
    };
    
    // Add location condition if we have locations
    if (topLocations.length > 0) {
      lookalikeRules.conditions.push({
        field: 'location',
        operator: 'contains',
        value: topLocations[0],
      });
    }
    
    // Exclude customers already in the source segment
    const sourceCustomerIds = sourceCustomers.map(c => c._id.toString());
    
    // Create a temp segment to calculate audience size
    const tempSegment = new Segment({
      name: 'Temp Lookalike',
      rules: lookalikeRules,
    });
    
    const lookalikesQuery = tempSegment.toMongoQuery();
    lookalikesQuery._id = { $nin: sourceCustomerIds };
    
    const audienceSize = await Customer.countDocuments(lookalikesQuery);
    
    res.status(200).json({
      status: 'success',
      data: {
        sourceSegment: {
          id: sourceSegment._id,
          name: sourceSegment.name,
          audienceSize: sourceSegment.audienceSize,
        },
        lookalikeRules,
        suggestedName: `Lookalike - ${sourceSegment.name}`,
        suggestedDescription: `Customers similar to those in the "${sourceSegment.name}" segment`,
        estimatedAudienceSize: audienceSize,
        sourceMetrics: {
          avgOrderCount: Math.round(avgStats.orderCount * 10) / 10,
          avgTotalSpend: Math.round(avgStats.totalSpend),
          topLocations,
        },
      },
    });
  } catch (err) {
    logger.error(`Error in lookalike audience: ${err.message}`);
    next(err);
  }
};

/**
 * @swagger
 * /ai/auto-tag:
 *   post:
 *     summary: Auto-tag a campaign based on segment and message
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               segmentId:
 *                 type: string
 *               messageContent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Suggested tags
 */
exports.autoTagCampaign = async (req, res, next) => {
  try {
    const { segmentId, messageContent } = req.body;
    
    if (!messageContent) {
      return next(new AppError('Message content is required', 400));
    }
    
    let segmentInfo = 'No segment provided';
    
    // If segmentId is provided, get segment details
    if (segmentId) {
      const segment = await Segment.findById(segmentId);
      
      if (!segment) {
        return next(new AppError('Segment not found', 404));
      }
      
      segmentInfo = `Segment name: ${segment.name}\n`;
      segmentInfo += segment.description ? `Description: ${segment.description}\n` : '';
      segmentInfo += `Rules: ${JSON.stringify(segment.rules, null, 2)}\n`;
    }
    
    // Create the model instance
    const model = getGeminiModel();
    
    // Define system prompt
    const systemPrompt = `You are an AI assistant that auto-tags marketing campaigns based on their message content and target audience.
    
    Based on the segment information and message content, generate 3-5 relevant tags for the campaign.
    
    The output should be a JSON array of strings, e.g. ["Sale", "Holiday", "Discount"]
    
    Good tags should be:
    1. Concise (1-2 words)
    2. Descriptive of the campaign purpose or audience
    3. Useful for organizing and finding campaigns later
    
    Common tag categories:
    - Campaign type (Sale, Announcement, Newsletter, etc.)
    - Target audience (New Customers, Inactive Users, etc.)
    - Content theme (Holiday, Seasonal, Product Launch, etc.)
    - Offer type (Discount, Free Shipping, etc.)`;
    
    // User prompt with campaign details
    const userPrompt = `Generate tags for a campaign with the following details:
    
    ${segmentInfo}
    
    Message content:
    ${messageContent}`;
    
    // Generate content using Gemini
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I'll generate relevant tags for the campaign based on the segment info and message content." }] },
        { role: "user", parts: [{ text: userPrompt }] }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 256,
      },
    });
    
    // Extract the response text
    const tagsText = result.response.text();
    
    // Parse the JSON response
    let tags;
    try {
      // Extract JSON part if needed
      const jsonMatch = tagsText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         tagsText.match(/\[\s*"[\s\S]*"\s*\]/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : tagsText;
      tags = JSON.parse(jsonString.trim());
    } catch (err) {
      logger.error(`Error parsing AI response: ${tagsText}`);
      return next(new AppError('Failed to parse AI response', 500));
    }
    
    // Validate the tags structure
    if (!Array.isArray(tags)) {
      return next(new AppError('Invalid tags structure from AI', 500));
    }
    
    // Log success
    logger.info(`Generated ${tags.length} tags for campaign`);
    
    res.status(200).json({
      status: 'success',
      data: {
        tags,
      },
    });
  } catch (err) {
    logger.error(`Error in auto-tag campaign: ${err.message}`);
    next(err);
  }
};