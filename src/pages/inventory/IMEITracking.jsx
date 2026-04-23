import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

// timeline imports
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent, { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent';

// project imports
import MainCard from 'components/MainCard';
import api from 'utils/api';

// assets
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import BoxPlotOutlined from '@ant-design/icons/BoxPlotOutlined';
import SafetyCertificateOutlined from '@ant-design/icons/SafetyCertificateOutlined';
import ExportOutlined from '@ant-design/icons/ExportOutlined';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';

// ==============================|| IMEI TRACKING PAGE ||============================== //

export default function IMEITracking() {
  const [searchInput, setSearchInput] = useState('');
  const [trackedData, setTrackedData] = useState(null);
  const [searching, setSearching] = useState(false);

  const getIcon = (status, title) => {
    const lowTitle = title.toLowerCase();
    if (lowTitle.includes('inbound')) return <BoxPlotOutlined />;
    if (lowTitle.includes('outbound') || lowTitle.includes('sold')) return <ExportOutlined />;
    if (lowTitle.includes('damage') || lowTitle.includes('defective')) return <WarningOutlined style={{ color: '#ff4d4f' }} />;
    if (status === 'primary') return <SafetyCertificateOutlined />;
    return <QuestionCircleOutlined />;
  };

  const handleTrack = async () => {
    if (!searchInput) return;
    setSearching(true);
    setTrackedData(null);
    try {
      const response = await api.get(`/Tracking/imei/${searchInput}`);
      setTrackedData(response.data);
    } catch (error) {
      console.error('Error tracking IMEI:', error);
      alert(error.response?.data?.message || 'Không tìm thấy dữ liệu cho mã IMEI này.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        IMEI Lifecycle Tracking
      </Typography>

      {/* Search Section */}
      <MainCard sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 9 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter IMEI number to track..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<SearchOutlined />}
              onClick={handleTrack}
              disabled={searching}
            >
              {searching ? 'Tracking...' : 'Track'}
            </Button>
          </Grid>
        </Grid>
      </MainCard>

      {trackedData && (
        <Grid container spacing={3}>
          {/* Product Info Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <MainCard title="Product Summary">
              <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
                <Box
                  component="img"
                  src={trackedData.image}
                  alt={trackedData.productName}
                  sx={{ width: 140, height: 140, borderRadius: 2, bgcolor: 'grey.100', p: 1 }}
                />
                <Box>
                  <Typography variant="h5" sx={{ mb: 0.5 }}>
                    {trackedData.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    SKU: {trackedData.sku}
                  </Typography>
                </Box>
                <Chip
                  label={trackedData.status}
                  color={trackedData.status === 'In Stock' ? 'success' : 'warning'}
                  variant="combined"
                  sx={{ fontWeight: 'bold' }}
                />
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Currently tracked IMEI:
              </Typography>
              <Typography variant="h6" color="primary">
                {trackedData.imei}
              </Typography>
            </MainCard>
          </Grid>

          {/* Lifecycle Timeline */}
          <Grid size={{ xs: 12, md: 8 }}>
            <MainCard title="Lifecycle Timeline">
              <Timeline
                sx={{
                  [`& .${timelineOppositeContentClasses.root}`]: {
                    flex: 0.2
                  }
                }}
              >
                {trackedData.timeline.map((event, index) => (
                  <TimelineItem key={event.id}>
                    <TimelineOppositeContent color="text.secondary">
                      {event.date}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color={event.status}>{getIcon(event.status, event.title)}</TimelineDot>
                      {index < trackedData.timeline.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                      <Typography variant="h6" component="span">
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </MainCard>
          </Grid>
        </Grid>
      )}

      {!trackedData && !searching && (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'background.paper', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
          <Typography color="text.secondary">
            No data to display. Please enter an IMEI and click Track.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
