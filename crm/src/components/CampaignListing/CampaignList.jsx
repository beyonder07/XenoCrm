import { useState, useEffect } from 'react';
import { getCampaigns } from '../../services/api';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignsData = await getCampaigns();
        setCampaigns(campaignsData.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCampaigns();
  }, []);

  const getAudienceSize = (audience) => {
    const sizeInfo = audience.find(aud => aud.audienceSize !== undefined);
    return sizeInfo ? sizeInfo.audienceSize : 'N/A';
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold text-primary mb-4">Past Campaigns</h2>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-card">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-text sm:pl-6">
                      Message
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-text">
                      Sent At
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-text">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-text">
                      Audience Size
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-card">
                  {campaigns.map((campaign) => (
                    <tr key={campaign._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-text sm:pl-6">
                        {campaign.message}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-text">
                        {new Date(campaign.sentAt).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-text">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-text">
                        {getAudienceSize(campaign.audience)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignList; 