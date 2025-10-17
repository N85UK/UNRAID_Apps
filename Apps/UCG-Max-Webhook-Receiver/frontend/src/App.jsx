import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

function App() {
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    fetchAlerts();
    fetchMetrics();
  }, [filters]);

  const fetchAlerts = async () => {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`/api/alerts?${params}`);
    setAlerts(response.data);
  };

  const fetchMetrics = async () => {
    const response = await axios.get('/api/metrics');
    setMetrics(response.data);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleExport = () => {
    window.open('/api/alerts/export?format=csv', '_blank');
  };

  const severityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'major': return 'warning';
      case 'warning': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>UCG Max Alerts</Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <TextField label="Search" fullWidth onChange={(e) => handleFilterChange('q', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField label="Severity" select fullWidth onChange={(e) => handleFilterChange('severity', e.target.value)}>
            <option value="">All</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="major">Major</option>
            <option value="critical">Critical</option>
          </TextField>
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField label="Device" fullWidth onChange={(e) => handleFilterChange('device', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField label="Type" fullWidth onChange={(e) => handleFilterChange('alert_type', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={3}>
          <Button variant="contained" onClick={handleExport}>Export CSV</Button>
        </Grid>
      </Grid>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Dashboard</Typography>
          <BarChart width={600} height={300} data={Object.entries(metrics.severity_counts || {}).map(([k, v]) => ({ severity: k, count: v }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="severity" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Device</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Summary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id} hover onClick={() => setSelectedAlert(alert)}>
                <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                <TableCell><Chip label={alert.severity} color={severityColor(alert.severity)} /></TableCell>
                <TableCell>{alert.device}</TableCell>
                <TableCell>{alert.alert_type}</TableCell>
                <TableCell>{alert.summary}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!selectedAlert} onClose={() => setSelectedAlert(null)} maxWidth="md" fullWidth>
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent>
          <pre>{JSON.stringify(selectedAlert, null, 2)}</pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAlert(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;