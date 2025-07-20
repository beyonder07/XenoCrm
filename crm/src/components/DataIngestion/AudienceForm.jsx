import { useState } from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AudienceForm = () => {
  const [audienceSize, setAudienceSize] = useState(null);
  const navigate = useNavigate();

  const initialValues = {
    rules: [{ field: 'totalSpend', operator: '>', value: '' }],
    message: '',
    logicalOperator: 'AND'
  };

  const validationSchema = Yup.object().shape({
    rules: Yup.array().of(
      Yup.object().shape({
        field: Yup.string().required('Field is required'),
        operator: Yup.string().required('Operator is required'),
        value: Yup.string().required('Value is required')
      })
    ),
    message: Yup.string().required('Message is required'),
    logicalOperator: Yup.string().required('Logical operator is required').oneOf(['AND', 'OR'], 'Logical operator must be either AND or OR')
  });

  const handleCheckAudienceSize = async (values) => {
    try {
      const response = await axios.post('http://localhost:5000/api/campaigns/check-audience-size', values);
      setAudienceSize(response.data.audienceSize);
    } catch (error) {
      console.error('Error checking audience size', error.response.data);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.post('http://localhost:5000/api/campaigns/create-audience', values);
      alert('Campaign created successfully');
      navigate('/home/audience');
    } catch (error) {
      console.error('Error creating audience', error.response.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Create Campaign
        </h1>
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, isSubmitting, handleSubmit }) => (
                <Form onSubmit={handleSubmit} className="space-y-6">
                  <FieldArray name="rules">
                    {({ insert, remove, push }) => (
                      <div className="space-y-4">
                        {values.rules.length > 0 &&
                          values.rules.map((rule, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <div className="flex-1">
                                <Field
                                  name={`rules.${index}.field`}
                                  as="select"
                                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                  <option value="totalSpend">Total Spend</option>
                                  <option value="numVisits">Number of Visits</option>
                                  <option value="lastVisitDate">Last Visit Date</option>
                                </Field>
                                <ErrorMessage
                                  name={`rules.${index}.field`}
                                  component="div"
                                  className="mt-1 text-sm text-red-600"
                                />
                              </div>

                              <div className="flex-1">
                                <Field
                                  name={`rules.${index}.operator`}
                                  as="select"
                                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                  <option value=">">Greater than</option>
                                  <option value=">=">Greater than or equal</option>
                                  <option value="<">Less than</option>
                                  <option value="<=">Less than or equal</option>
                                  <option value="=">Equal to</option>
                                  <option value="!=">Not equal to</option>
                                </Field>
                                <ErrorMessage
                                  name={`rules.${index}.operator`}
                                  component="div"
                                  className="mt-1 text-sm text-red-600"
                                />
                              </div>

                              <div className="flex-1">
                                <Field
                                  name={`rules.${index}.value`}
                                  type={rule.field === 'lastVisitDate' ? 'date' : 'text'}
                                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                <ErrorMessage
                                  name={`rules.${index}.value`}
                                  component="div"
                                  className="mt-1 text-sm text-red-600"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        <button
                          type="button"
                          onClick={() => push({ field: '', operator: '', value: '' })}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Add Rule
                        </button>
                      </div>
                    )}
                  </FieldArray>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <Field
                      name="message"
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <ErrorMessage
                      name="message"
                      component="div"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="logicalOperator" className="block text-sm font-medium text-gray-700">
                      Logical Operator
                    </label>
                    <Field
                      name="logicalOperator"
                      as="select"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </Field>
                    <ErrorMessage
                      name="logicalOperator"
                      component="div"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleCheckAudienceSize(values)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Check Audience Size
                    </button>
                    {audienceSize !== null && (
                      <span className="text-sm text-gray-600">
                        Audience Size: {audienceSize}
                      </span>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Campaign
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceForm; 