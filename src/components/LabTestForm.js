import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LabTestForm = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/master-checkup');
  };
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    mobileNumber: '',
  });
  const [selectedTest, setSelectedTest] = useState(null);
  const [testTypes, setTestTypes] = useState([{ type: null }]);
  const [referenceRanges, setReferenceRanges] = useState([]);
  const [alertMessages, setAlertMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    fetch('https://66c2e4d5d057009ee9be3b92.mockapi.io/test')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setReferenceRanges(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleChange = (event, fieldName) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const addTestType = () => {
    setTestTypes([...testTypes, { type: null }]);
  };

  
  const handleAddTest = () => {
    setTestTypes([...testTypes, { type: null }]);
    setFormData({
      ...formData,
      // Optionally reset form fields related to the new test if necessary
    });
  };

  

  const handleSubmit = (event) => {
    event.preventDefault();
    const alerts = [];
    const tableRows = [];

    referenceRanges.forEach((test) => {
      if (test["testName"] === selectedTest) {
        testTypes.forEach((testType) => {
          const testParameters = test.sections.find(section => section.sectionName === testType.type)?.parameters || [];
          
          testParameters.forEach(param => {
            const testValue = formData[param.name];
            if (param.method === 'Numeric') {
              const numericValue = parseFloat(testValue);
              if (numericValue < parseFloat(param.normalRange.split('-')[0]) || numericValue > parseFloat(param.normalRange.split('-')[1] || param.normalRange)) {
                alerts.push({
                  message: `${param.name} (${testType.type}) is out of range! Normal Range: ${param.normalRange}`,
                  disease: ''
                });
              }
            } else if (param.method === 'Visual') {
              if (testValue !== param.normalRange) {
                alerts.push({
                  message: `${param.name} (${testType.type}) is out of range! Normal Range: ${param.normalRange}`,
                  disease: ''
                });
              }
            }

            tableRows.push({
              testName: selectedTest,
              testType: testType.type,
              parameter: param.name,
              value: testValue || 'N/A',
              normalRange: param.normalRange,
              method: param.method || 'N/A'
            });
          });
        });
      }
    });

    setTableData(tableRows);

    if (alerts.length > 0) {
      setAlertMessages(alerts);
    } else {
      setAlertMessages([{ message: 'All test values are within the normal range.', disease: '' }]);
    }

    // Close the form
    setShowForm(false);
  };

  const availableTestTypes = referenceRanges
    .filter((test) => test["testName"] === selectedTest)
    .flatMap((test) => test.sections.map(section => section.sectionName));

  const handlePrint = () => {
    if (!tableData || tableData.length === 0) return;

    const printWindow = window.open('', '', 'height=800,width=1000');

    const styles = `
        body { font-family: Arial, sans-serif; margin: 20px; }
        h2 { text-align: center; margin: 0; }
        h3 { text-align: center; margin: 0; color: #555; }
        p { margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        td, th { padding: 8px; text-align: left; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .container { display: flex; justify-content: space-between; }
        .box { border: 1px solid #ddd; padding: 10px; width: 48%; }
        .box-title { font-weight: bold; margin-bottom: 10px; }
    `;

    // Group the tableData by testName and testType
    const groupedData = tableData.reduce((acc, row) => {
        const { testName, testType } = row;
        const existingTable = acc.find(
            (table) => table.testName === testName && table.testType === testType
        );

        if (existingTable) {
            existingTable.data.push(row); // Add row to existing table data
        } else {
            acc.push({
                testName,
                testType,
                data: [row], // Initial data for the new table
            });
        }

        return acc;
    }, []);

    // Create HTML content for print
    const htmlContent = `
        <html>
            <head>
                <title>Receipt</title>
                <style>${styles}</style>
            </head>
            <body>
                <div style="text-align: center;">
                    <h2>ABC Lab</h2>
                    <h3>"Your Health, Our Priority"</h3>
                </div>
                <div class="container">
                    <div class="box">
                        <div class="box-title">Patient Details</div>
                        <p><strong>Patient Name:</strong> ${formData.patientName}</p>
                        <p><strong>Age/Gender:</strong> ${formData.age}</p>
                        <p><strong>UHID/MR No:</strong> ${formData.uhid}</p>
                        <p><strong>Visit ID:</strong> ${formData.visitId}</p>
                        <p><strong>Ref Doctor:</strong> ${formData.refDoctor}</p>
                        <p><strong>IP/OP NO:</strong> ${formData.ipOpNo}</p>
                    </div>
                    <div class="box">
                        <div class="box-title">Client Information</div>
                        <p><strong>Collected:</strong> ${formData.collected}</p>
                        <p><strong>Received:</strong> ${formData.received}</p>
                        <p><strong>Reported:</strong> ${formData.reported}</p>
                        <p><strong>Status:</strong> ${formData.status}</p>
                        <p><strong>Client Name:</strong> ${formData.clientName}</p>
                        <p><strong>Patient Location:</strong> ${formData.patientLocation}</p>
                    </div>
                </div>
                ${groupedData.map(table => `
                    <div style="margin-top: 20px;">
                        <h4>${table.testName} - ${table.testType}</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>Entered Value</th>
                                    <th>Normal Range</th>
                                    <th>Method</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${table.data.map(row => `
                                    <tr>
                                        <td>${row.parameter}</td>
                                        <td>${row.value}</td>
                                        <td>${row.normalRange}</td>
                                        <td>${row.method}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `).join('')}
            </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Container>
       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
      <Typography variant="h4" sx={{ flex: 1 }}>
        ABC Lab Test Form
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleNavigate}
        sx={{ marginLeft: '16px' }}  // Optional spacing between the heading and button
      >
        MasterCheckUp
      </Button>
    </Box>
      <Paper elevation={3} style={{ padding: '20px' }}>
      
        <form onSubmit={handleSubmit}>
          <TextField
            label="Patient Name"
            value={formData.patientName}
            onChange={(event) => handleChange(event, 'patientName')}
            variant="outlined"
            fullWidth
            style={{ marginBottom: '16px' }}
          />
          <TextField
            label="Age"
            type="number"
            value={formData.age}
            onChange={(event) => handleChange(event, 'age')}
            variant="outlined"
            fullWidth
            style={{ marginBottom: '16px' }}
          />
          <TextField
            label="Mobile Number"
            value={formData.mobileNumber}
            onChange={(event) => handleChange(event, 'mobileNumber')}
            variant="outlined"
            fullWidth
            style={{ marginBottom: '16px' }}
          />

          <Autocomplete
            options={[...new Set(referenceRanges.map((test) => test["testName"]))]}
            value={selectedTest}
            onChange={(event, newValue) => {
              setSelectedTest(newValue);
              setTestTypes([{ type: null }]); // Reset test types
            }}
            getOptionLabel={(option) => option || ''}
            renderInput={(params) => (
              <TextField {...params} label="Test Name" variant="outlined" fullWidth />
            )}
          />

          {selectedTest && (
            <>
              {testTypes.map((testType, index) => (
                <Autocomplete
                  key={index}
                  options={availableTestTypes}
                  value={testType.type}
                  onChange={(event, newValue) => {
                    const newTestTypes = [...testTypes];
                    newTestTypes[index].type = newValue;
                    setTestTypes(newTestTypes);
                  }}
                  getOptionLabel={(option) => option || ''}
                  renderInput={(params) => (
                    <TextField {...params} label={`Test Type ${index + 1}`} variant="outlined" fullWidth />
                  )}
                />
              ))}
              <Button variant="contained" color="primary" onClick={handleAddTest}>
                Add Another Test
              </Button>
            </>
          )}

          {showForm && selectedTest && testTypes.length > 0 && referenceRanges
            .filter(test => test["testName"] === selectedTest)
            .flatMap(test => test.sections
              .filter(section => testTypes.some(testType => testType.type === section.sectionName))
              .flatMap(section => (
                <Box key={section.sectionName} style={{ marginBottom: '16px' }}>
                  <Typography variant="h6" style={{ marginBottom: '8px' }}>{section.sectionName}</Typography>
                  <Grid container spacing={2}>
                    {section.parameters.map((param, index) => (
                      <Grid item xs={12} sm={4} key={param.name}>
                        <TextField
                          label={`Enter ${param.name} (Normal Range: ${param.normalRange || 'N/A'})`}
                          type={param.method === 'Numeric' ? 'number' : 'text'}
                          onChange={(event) => handleChange(event, param.name)}
                          variant="outlined"
                          fullWidth
                          style={{ maxWidth: '100%' }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))
            )}


          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>
          
        </form>
        
      </Paper>

      {alertMessages.length > 0 && (
        <Box mt={2}>
          {alertMessages.map((alert, index) => (
            <Alert key={index} severity="warning">
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {tableData && (
        <Box mt={2}>
          <Button variant="contained" color="secondary" onClick={handlePrint}>
            Print Receipt
          </Button>
          {tableData.reduce((acc, row) => {
            const { testName, testType } = row;
            const existingTable = acc.find(
              (table) => table.testName === testName && table.testType === testType
            );

            if (existingTable) {
              existingTable.data.push(row); // Add row to existing table data
            } else {
              acc.push({
                testName,
                testType,
                data: [row], // Initial data for the new table
              });
            }

            return acc;
          }, []).map((table) => (
            <Box key={`${table.testName}-${table.testType}`} mt={2}>
              <Typography variant="h6" style={{ padding: '16px', fontWeight: 'bold' }}>
                {table.testName} - {table.testType}
              </Typography>
              <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Parameter</TableCell>
                      <TableCell>Entered Value</TableCell>
                      <TableCell>Normal Range</TableCell>
                      <TableCell>Method</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {table.data.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.parameter}</TableCell>
                        <TableCell>{row.value}</TableCell>
                        <TableCell>{row.normalRange}</TableCell>
                        <TableCell>{row.method}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>
      )}

    </Container>
  );
};

export default LabTestForm;