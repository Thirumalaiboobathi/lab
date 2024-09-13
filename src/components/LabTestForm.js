import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Alert
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
  
    // Check if the input values fall within the reference ranges
    referenceRanges.forEach((test) => {
      if (test["Test Name"] === selectedTest && test["Test Type"] === selectedTestType) {
        const testValue = parseFloat(formData[test["Test Name"]]);
        if (testValue < test["Min Range"] || testValue > test["Max Range"]) {
          alerts.push({
            message: `${test["Test Name"]} (${test["Test Type"]}) is out of range! Min: ${test["Min Range"]}, Max: ${test["Max Range"]}`,
            disease: test["Disease"]
          });
        }
      }
    });

    
  
    // Display the alerts
    if (alerts.length > 0) {
      setAlertMessages(alerts);
    } else {
      setAlertMessages([{ message: 'All test values are within the normal range.', disease: '' }]);
  
      // Prepare the data to send
      const submissionData = {
        patientName: formData.patientName,
        age: formData.age,
        mobileNumber: formData.mobileNumber,
        selectedTest,
        selectedTestType,
        testValues: referenceRanges
          .filter((test) => test["Test Name"] === selectedTest && test["Test Type"] === selectedTestType)
          .map((test) => ({
            testName: test["Test Name"],
            testType: test["Test Type"],
            value: formData[test["Test Name"]] || 'N/A'
          }))
      };
  
      // Send data to the API
      fetch('https://66320bb4c51e14d695633233.mockapi.io/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Success:', data);
          // You can add more logic here, such as showing a success message
        })
        .catch(error => {
          console.error('Error:', error);
          // Handle the error here, such as showing an error message
        });
    }
  };
  

  // Get unique test types based on the selected test name
  const availableTestTypes = referenceRanges
    .filter((test) => test["Test Name"] === selectedTest)
    .map((test) => test["Test Type"]);

  // Print receipt
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=1000');
    printWindow.document.write('<html><head><title>Receipt</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
    printWindow.document.write('h2 { text-align: center; margin: 0; }');
    printWindow.document.write('h3 { text-align: center; margin: 0; color: #555; }');
    printWindow.document.write('p { margin: 0; }');
    printWindow.document.write('.container { display: flex; justify-content: space-between; }');
    printWindow.document.write('.section { width: 48%; }');
    printWindow.document.write('.test-details { margin-top: 20px; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
    printWindow.document.write('td { padding: 8px; text-align: left; }');
    printWindow.document.write('tr:nth-child(even) { background-color: #f2f2f2; }');
    printWindow.document.write('td:nth-child(1) { color: #007BFF; font-weight: bold; }'); // Test Name column color
    printWindow.document.write('td:nth-child(2) { color: #333; }'); // Test Value column color
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
  
    // Header section with Lab logo and information
    printWindow.document.write('<div style="text-align: center;">');
    printWindow.document.write('<img src="https://via.placeholder.com/150" alt="Lab Logo" style="margin-bottom: 10px;">'); // Replace with actual logo URL
    printWindow.document.write('<h2>ABC Lab</h2>');
    printWindow.document.write('<h3>"Your Health, Our Priority"</h3>'); // Slogan
    printWindow.document.write('</div>');
  
    // Lab and Patient Information
    printWindow.document.write('<div class="container">');
    printWindow.document.write('<div class="section">');
    printWindow.document.write('<p><strong>Address:</strong> 123 Lab Street, City, Country</p>');
    printWindow.document.write('<p><strong>Phone:</strong> +123-456-7890</p>');
    printWindow.document.write('</div>');
    
    printWindow.document.write('<div class="section">');
    printWindow.document.write('<p><strong>Patient Name:</strong> ' + formData.patientName + '</p>');
    printWindow.document.write('<p><strong>Age:</strong> ' + formData.age + '</p>');
    printWindow.document.write('<p><strong>Mobile Number:</strong> ' + formData.mobileNumber + '</p>');
    printWindow.document.write('</div>');
    printWindow.document.write('</div>');
  
    // Test Details
    printWindow.document.write('<div class="test-details">');
    printWindow.document.write('<table>');
    referenceRanges
      .filter((test) => test["Test Name"] === selectedTest && test["Test Type"] === selectedTestType)
      .forEach((test) => {
        const testValue = formData[test["Test Name"]] || 'N/A';
        const disease = test["Disease"] || 'None';
        printWindow.document.write(`<tr><td>Test Name:</td><td>${test["Test Name"]}</td></tr>`);
        printWindow.document.write(`<tr><td>Test Type:</td><td>${test["Test Type"]}</td></tr>`);
        printWindow.document.write(`<tr><td>Entered Value:</td><td>${testValue}</td></tr>`);
        printWindow.document.write(`<tr><td>Disease:</td><td>${disease}</td></tr>`);
      });
    printWindow.document.write('</table>');
    printWindow.document.write('</div>');
  
    // Signature section
    printWindow.document.write('<p><strong>Lab Technician Signature:</strong> ______________________</p>');
  
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

          {/* Autocomplete for Test Name */}
          <Autocomplete
            options={[...new Set(referenceRanges.map((test) => test["Test Name"]))]} // Unique test names
            value={selectedTest}
            onChange={(event, newValue) => {
              setSelectedTest(newValue);
              setSelectedTestType(null); // Reset test type when a new test is selected
            }}
            renderInput={(params) => (
              <TextField {...params} label="Test Name" variant="outlined" fullWidth />
            )}
          />

          {/* Autocomplete for Test Type, visible only if a test name is selected */}
          {selectedTest && (
            <Autocomplete
              options={availableTestTypes}
              value={selectedTestType}
              onChange={(event, newValue) => setSelectedTestType(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Test Type" variant="outlined" fullWidth style={{ marginTop: '16px' }} />
              )}
            />
          )}

          {/* Render form fields based on the selected test name and test type */}
          {selectedTest && selectedTestType && (
            referenceRanges
              .filter((test) => test["Test Name"] === selectedTest && test["Test Type"] === selectedTestType)
              .map((test, index) => (
                <Box key={index} style={{ marginTop: '16px' }}>
                  <Typography variant="subtitle1">{test["Test Name"]} ({test["Test Type"]})</Typography>
                  <TextField
                    type="number"
                    step="0.01"
                    value={formData[test["Test Name"]] || ''}
                    onChange={(event) => handleChange(event, test["Test Name"])}
                    label={`Enter value (Min: ${test["Min Range"]}, Max: ${test["Max Range"]})`}
                    variant="outlined"
                    fullWidth
                  />
                </Box>
              ))
          )}

          <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>Submit</Button>
          <Button type="button" variant="contained" color="secondary" style={{ marginTop: '20px', marginLeft: '16px' }} onClick={handlePrint}>Print Receipt</Button>
        </form>

        {/* Display alerts */}
        {alertMessages.length > 0 && (
          <Box style={{ marginTop: '20px' }}>
            {alertMessages.map((alert, index) => (
              <Alert key={index} severity={alert.disease ? 'error' : 'success'}>
                <Typography variant="body2">{alert.message}</Typography>
                {alert.disease && <Typography variant="body2">Disease: {alert.disease}</Typography>}
              </Alert>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default LabTestForm;
