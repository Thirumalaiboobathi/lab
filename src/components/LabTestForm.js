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
  TableRow
} from '@mui/material';

const LabTestForm = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    mobileNumber: '',
  });
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [referenceRanges, setReferenceRanges] = useState([]);
  const [alertMessages, setAlertMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState(null); // New state to store table data

  // Fetch the reference ranges from the API
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

  // Handle input changes
  const handleChange = (event, fieldName) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    const alerts = [];
    const tableRows = [];

    // Check if the input values fall within the reference ranges
    referenceRanges.forEach((test) => {
      if (test["testName"] === selectedTest) {
        const testParameters = test.sections.find(section => section.sectionName === selectedTestType)?.parameters || [];
        
        testParameters.forEach(param => {
          const testValue = formData[param.name];
          if (param.method === 'Numeric') {
            const numericValue = parseFloat(testValue);
            if (numericValue < parseFloat(param.normalRange.split('-')[0]) || numericValue > parseFloat(param.normalRange.split('-')[1] || param.normalRange)) {
              alerts.push({
                message: `${param.name} (${selectedTestType}) is out of range! Normal Range: ${param.normalRange}`,
                disease: '' // Add logic to determine the disease if applicable
              });
            }
          } else if (param.method === 'Visual') {
            if (testValue !== param.normalRange) {
              alerts.push({
                message: `${param.name} (${selectedTestType}) is out of range! Normal Range: ${param.normalRange}`,
                disease: '' // Add logic to determine the disease if applicable
              });
            }
          }

          // Add test details to the table
          tableRows.push({
            testName: selectedTest,
            testType: selectedTestType,
            parameter: param.name,
            value: testValue || 'N/A',
            normalRange: param.normalRange,
            method: param.method || 'N/A'
          });
        });
      }
    });

    setTableData(tableRows); // Store the table data

    // Display the alerts
    if (alerts.length > 0) {
      setAlertMessages(alerts);
    } else {
      setAlertMessages([{ message: 'All test values are within the normal range.', disease: '' }]);
    }
  };

  // Get unique test types based on the selected test name
  const availableTestTypes = referenceRanges
    .filter((test) => test["testName"] === selectedTest)
    .flatMap((test) => test.sections.map(section => section.sectionName));

  // Print receipt in table format
  const handlePrint = () => {
    if (!tableData || tableData.length === 0) return;

    const printWindow = window.open('', '', 'height=800,width=1000');
    printWindow.document.write('<html><head><title>Receipt</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
    printWindow.document.write('h2 { text-align: center; margin: 0; }');
    printWindow.document.write('h3 { text-align: center; margin: 0; color: #555; }');
    printWindow.document.write('p { margin: 0; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
    printWindow.document.write('td, th { padding: 8px; text-align: left; border: 1px solid #ddd; }');
    printWindow.document.write('tr:nth-child(even) { background-color: #f2f2f2; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');

    // Header section with Lab logo and information
    printWindow.document.write('<div style="text-align: center;">');
    printWindow.document.write('<h2>ABC Lab</h2>');
    printWindow.document.write('<h3>"Your Health, Our Priority"</h3>'); // Slogan
    printWindow.document.write('</div>');

    // Patient Information
    printWindow.document.write('<p><strong>Patient Name:</strong> ' + formData.patientName + '</p>');
    printWindow.document.write('<p><strong>Age:</strong> ' + formData.age + '</p>');
    printWindow.document.write('<p><strong>Mobile Number:</strong> ' + formData.mobileNumber + '</p>');

    // Test Results Table
    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr><th>Test Name</th><th>Test Type</th><th>Parameter</th><th>Entered Value</th><th>Normal Range</th><th>Method</th></tr></thead>');
    printWindow.document.write('<tbody>');
    tableData.forEach((row) => {
      printWindow.document.write(`<tr><td>${row.testName}</td><td>${row.testType}</td><td>${row.parameter}</td><td>${row.value}</td><td>${row.normalRange}</td><td>${row.method}</td></tr>`);
    });
    printWindow.document.write('</tbody></table>');

    printWindow.document.write('</body></html>');
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
      <Typography variant="h4" gutterBottom>ABC Lab Test Form</Typography>
      <Paper elevation={3} style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit}>
          {/* Patient Information */}
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
            options={[...new Set(referenceRanges.map((test) => test["testName"]))]} // Unique test names
            value={selectedTest}
            onChange={(event, newValue) => {
              setSelectedTest(newValue);
              setSelectedTestType(null); // Reset test type when a new test is selected
            }}
            getOptionLabel={(option) => option || ''} // Ensure option is handled as a string
            renderInput={(params) => (
              <TextField {...params} label="Test Name" variant="outlined" fullWidth />
            )}
          />

          {selectedTest && (
            <Autocomplete
              options={availableTestTypes}
              value={selectedTestType}
              onChange={(event, newValue) => setSelectedTestType(newValue)}
              getOptionLabel={(option) => option || ''}
              renderInput={(params) => (
                <TextField {...params} label="Test Type" variant="outlined" fullWidth style={{ marginTop: '16px' }} />
              )}
            />
          )}

          {/* Render form fields based on the selected test name and test type */}
          {selectedTestType && referenceRanges
            .filter(test => test["testName"] === selectedTest)
            .flatMap(test => test.sections
              .filter(section => section.sectionName === selectedTestType)
              .flatMap(section => section.parameters.map(param => (
                <Box key={param.name} style={{ marginBottom: '16px' }}>
                  <Typography variant="h6">{param.name}</Typography>
                  <TextField
                    label={`Enter ${param.name}`}
                    type={param.method === 'Numeric' ? 'number' : 'text'} 
                    onChange={(event) => handleChange(event, param.name)}
                    variant="outlined"
                    fullWidth
                  />
                </Box>
              )))
            )
          }

          <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
            Submit
          </Button>

          <Button onClick={handlePrint} variant="contained" color="secondary" style={{ marginTop: '20px', marginLeft: '10px' }}>
            Print
          </Button>
        </form>

        {/* Display alerts */}
        {alertMessages.length > 0 && (
          <Box style={{ marginTop: '20px' }}>
            {alertMessages.map((alert, index) => (
              <Alert key={index} severity="warning">
                {alert.message}
                {alert.disease && <div><strong>Disease:</strong> {alert.disease}</div>}
              </Alert>
            ))}
          </Box>
        )}

        {/* Display results table */}
        {tableData && (
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
              {tableData.map((row, index) => (
                <React.Fragment key={index}>
                  {/* Display Test Name and Test Type as a heading for each group */}
                  <TableRow>
                    <TableCell colSpan={4} style={{ fontWeight: 'bold' }}>
                      {row.testName} - {row.testType}
                    </TableCell>
                  </TableRow>
                  {/* Display the parameter rows */}
                  <TableRow>
                    <TableCell>{row.parameter}</TableCell>
                    <TableCell>{row.value}</TableCell>
                    <TableCell>{row.normalRange}</TableCell>
                    <TableCell>{row.method}</TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>

            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default LabTestForm;
