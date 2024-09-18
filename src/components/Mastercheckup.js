import React, { useState, useEffect } from 'react';
import {
  TextField,
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Alert,
  Grid
} from '@mui/material';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
 
  
 
} from '@mui/material';

const MasterCheckUp = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    mobileNumber: '',
  });
  const [selectedTests, setSelectedTests] = useState([]);
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

  const handleTestSelection = (testName, testType) => {
    const testExists = selectedTests.some(
      (test) => test.testName === testName && test.testType === testType
    );
    if (!testExists) {
      setSelectedTests([...selectedTests, { testName, testType }]);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const alerts = [];
    const tableRows = [];

    selectedTests.forEach(({ testName, testType }) => {
      const test = referenceRanges.find((t) => t["testName"] === testName);
      const testParameters = test.sections.find(section => section.sectionName === testType)?.parameters || [];

      testParameters.forEach(param => {
        const testValue = formData[param.name];
        if (param.method === 'Numeric') {
          const numericValue = parseFloat(testValue);
          if (numericValue < parseFloat(param.normalRange.split('-')[0]) || numericValue > parseFloat(param.normalRange.split('-')[1] || param.normalRange)) {
            alerts.push({
              message: `${param.name} (${testType}) is out of range! Normal Range: ${param.normalRange}`,
              disease: ''
            });
          }
        } else if (param.method === 'Visual') {
          if (testValue !== param.normalRange) {
            alerts.push({
              message: `${param.name} (${testType}) is out of range! Normal Range: ${param.normalRange}`,
              disease: ''
            });
          }
        }

        tableRows.push({
          testName,
          testType,
          parameter: param.name,
          value: testValue || 'N/A',
          normalRange: param.normalRange,
          method: param.method || 'N/A'
        });
      });
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
      .container { display: flex; justify-content: space-between; page-break-after: always; }
      .box { border: 1px solid #ddd; padding: 10px; width: 48%; }
      .box-title { font-weight: bold; margin-bottom: 10px; }
      .page-break { page-break-before: always; }
    `;
  
    const groupedData = tableData.reduce((acc, row) => {
      const { testName, testType } = row;
      const existingTable = acc.find(
        (table) => table.testName === testName && table.testType === testType
      );
  
      if (existingTable) {
        existingTable.data.push(row);
      } else {
        acc.push({
          testName,
          testType,
          data: [row],
        });
      }
  
      return acc;
    }, []);
  
    const htmlContent = `
      <html>
        <head>
          <title>Receipt</title>
          <style>${styles}</style>
        </head>
        <body>
          ${groupedData.map((table, index) => `
            <div class="${index !== 0 ? 'page-break' : ''}">
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
  

  const groupTableData = () => {
    const groupedData = {};
    tableData.forEach(row => {
      const key = `${row.testName}-${row.testType}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(row);
    });
    return groupedData;
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
<Box sx={{ padding: '16px' }}>
      {referenceRanges.map((test) => (
        <Box key={test["testName"]} sx={{ marginBottom: '24px' }}>
          <Typography variant="h6" sx={{ marginBottom: '12px', fontWeight: 'bold' }}>
            {test["testName"]}
          </Typography>
          <Grid container spacing={2}>
            {test.sections.map((section) => (
              <Grid item key={section.sectionName} xs={12} sm={6} md={4} lg={3}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleTestSelection(test["testName"], section.sectionName)}
                  sx={{ padding: '12px 16px', textTransform: 'none' }}
                >
                  {section.sectionName}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>



          {selectedTests.length > 0 && selectedTests.map(({ testName, testType }) => {
            const test = referenceRanges.find(t => t["testName"] === testName);
            const section = test.sections.find(sec => sec.sectionName === testType);
            return (
              <Box key={`${testName}-${testType}`} style={{ marginBottom: '16px' }}>
                <Typography variant="h6">{testName} - {testType}</Typography>
                <Grid container spacing={2}>
                  {section.parameters.map((param) => (
                    <Grid item xs={12} sm={4} key={param.name}>
                      <TextField
                        label={`Enter ${param.name} (Normal Range: ${param.normalRange || 'N/A'}) `}
                        type={param.method === 'Numeric' ? 'number' : 'text'}
                        onChange={(event) => handleChange(event, param.name)}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })}

          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>
        </form>
        <Box mt={2}>
            <Button type="submit" variant="contained" color="primary" onClick={handlePrint}>
              Print
            </Button>
          </Box>
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
          <Typography variant="h5" gutterBottom>Test Results</Typography>
          
          <Paper elevation={3}>
            {Object.entries(groupTableData()).map(([key, rows], index) => {
              const [testName, testType] = key.split('-');
              return (
                <Box key={index} mb={4}>
  <Typography variant="h6" gutterBottom>{testName} - {testType}</Typography>
  <Paper elevation={3}>
    <Table sx={{ minWidth: 650 }} aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell><strong>Parameter</strong></TableCell>
          <TableCell><strong>Entered Value</strong></TableCell>
          <TableCell><strong>Normal Range</strong></TableCell>
          <TableCell><strong>Method</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, idx) => (
          <TableRow
            key={idx}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              {row.parameter}
            </TableCell>
            <TableCell>{row.value}</TableCell>
            <TableCell>{row.normalRange}</TableCell>
            <TableCell>{row.method}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
</Box>
              );
            })}
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default MasterCheckUp;
