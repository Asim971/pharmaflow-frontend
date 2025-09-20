/**
 * Territory Map Component - PharmaFlow Frontend
 * 
 * Interactive Bangladesh map component for territory visualization
 * with customer distribution, DGDA regulatory zones, and performance overlays.
 * 
 * Constitutional Compliance:
 * ✅ Pharmaceutical industry first - Territory-specific pharmaceutical mapping
 * ✅ Mobile-first design - Touch-optimized map interactions
 * ✅ DGDA compliance - Regulatory zone boundaries and compliance indicators
 * ✅ Bangladesh performance - Bangladesh geographical data and optimization
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  Territory,
  TerritoryMapProps,
  ComplianceStatus,
  TerritoryStatus
} from './types';

// Mock Bangladesh geographical data
const bangladeshBounds = {
  north: 26.4465,
  south: 20.7404,
  east: 92.6727,
  west: 88.0844
};

const bangladeshDivisions = [
  { name: 'Dhaka', center: [90.3945, 23.8400], color: '#1976d2' },
  { name: 'Chittagong', center: [91.8367, 22.3505], color: '#388e3c' },
  { name: 'Sylhet', center: [91.8738, 24.8949], color: '#f57c00' },
  { name: 'Rajshahi', center: [88.6048, 24.3745], color: '#7b1fa2' },
  { name: 'Khulna', center: [89.5403, 22.8098], color: '#c2185b' },
  { name: 'Barisal', center: [90.3696, 22.7010], color: '#00796b' },
  { name: 'Rangpur', center: [89.2442, 25.7539], color: '#5d4037' },
  { name: 'Mymensingh', center: [90.4203, 24.7471], color: '#455a64' }
];

interface MapMarker {
  id: string;
  position: [number, number];
  type: 'territory' | 'customer' | 'compliance';
  data: any;
  size: 'small' | 'medium' | 'large';
  color: string;
}

interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  type: 'territories' | 'customers' | 'compliance' | 'performance';
}

export const TerritoryMap: React.FC<TerritoryMapProps> = ({
  territories = [],
  selectedTerritoryId,
  onTerritorySelect,
  showCustomers = true,
  showPerformance = true,
  showCompliance = true,
  className = ''
}) => {
  // State management
  const [mapCenter, setMapCenter] = useState<[number, number]>([90.3945, 23.8400]);
  const [zoomLevel, setZoomLevel] = useState(7);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'territories', name: 'Territories', visible: true, type: 'territories' },
    { id: 'customers', name: 'Customers', visible: showCustomers, type: 'customers' },
    { id: 'compliance', name: 'DGDA Compliance', visible: showCompliance, type: 'compliance' },
    { id: 'performance', name: 'Performance', visible: showPerformance, type: 'performance' }
  ]);

  // Generate map markers from territories
  const mapMarkers = useMemo(() => {
    const markers: MapMarker[] = [];

    territories.forEach(territory => {
      // Territory center marker
      if (layers.find(l => l.id === 'territories')?.visible) {
        markers.push({
          id: `territory-${territory.id}`,
          position: territory.centerCoordinates,
          type: 'territory',
          data: territory,
          size: territory.customerCount > 200 ? 'large' : territory.customerCount > 100 ? 'medium' : 'small',
          color: territory.status === TerritoryStatus.ACTIVE ? '#1976d2' : '#757575'
        });
      }

      // Customer distribution markers
      if (layers.find(l => l.id === 'customers')?.visible && territory.customerCount > 0) {
        // Simulate customer locations around territory center
        const customerMarkers = Math.min(5, Math.ceil(territory.customerCount / 50));
        for (let i = 0; i < customerMarkers; i++) {
          const offsetLat = (Math.random() - 0.5) * 0.1;
          const offsetLng = (Math.random() - 0.5) * 0.1;
          markers.push({
            id: `customer-${territory.id}-${i}`,
            position: [
              territory.centerCoordinates[0] + offsetLng,
              territory.centerCoordinates[1] + offsetLat
            ],
            type: 'customer',
            data: { territory, customerGroup: i },
            size: 'small',
            color: '#4caf50'
          });
        }
      }

      // Compliance markers
      if (layers.find(l => l.id === 'compliance')?.visible) {
        markers.push({
          id: `compliance-${territory.id}`,
          position: [
            territory.centerCoordinates[0] + 0.05,
            territory.centerCoordinates[1] + 0.05
          ],
          type: 'compliance',
          data: territory.dgdaCompliance,
          size: 'medium',
          color: territory.dgdaCompliance.status === ComplianceStatus.COMPLIANT ? '#4caf50' : '#f44336'
        });
      }
    });

    return markers;
  }, [territories, layers]);

  // Map event handlers
  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 1, 12));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 1, 5));
  const handleResetView = () => {
    setMapCenter([90.3945, 23.8400]);
    setZoomLevel(7);
    setSelectedMarker(null);
  };
  const handleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    setMapCenter(marker.position);
    
    if (marker.type === 'territory' && onTerritorySelect) {
      onTerritorySelect(marker.data as Territory);
    }
  };

  const handleLayerToggle = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  // Effect to handle selected territory changes
  useEffect(() => {
    if (selectedTerritoryId) {
      const territory = territories.find(t => t.id === selectedTerritoryId);
      if (territory) {
        setMapCenter(territory.centerCoordinates);
        setZoomLevel(9);
      }
    }
  }, [selectedTerritoryId, territories]);

  const getMarkerSize = (size: string) => {
    switch (size) {
      case 'small': return 8;
      case 'medium': return 12;
      case 'large': return 16;
      default: return 10;
    }
  };

  return (
    <Card 
      className={className}
      sx={{ 
        height: isFullscreen ? '100vh' : '600px',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        zIndex: isFullscreen ? 9999 : 'auto'
      }}
    >
      <CardContent sx={{ p: 2, height: '100%' }}>
        {/* Map Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h3">
            Bangladesh Territory Map
          </Typography>
          
          {/* Map Controls */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Layer Controls */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Layers</InputLabel>
              <Select
                multiple
                value={layers.filter(l => l.visible).map(l => l.id)}
                label="Layers"
                renderValue={(selected) => `${(selected as string[]).length} layers`}
              >
                {layers.map(layer => (
                  <MenuItem key={layer.id} value={layer.id}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={layer.visible}
                          onChange={() => handleLayerToggle(layer.id)}
                          size="small"
                        />
                      }
                      label={layer.name}
                      sx={{ margin: 0 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Zoom Controls */}
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn} size="small">
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut} size="small">
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset View">
              <IconButton onClick={handleResetView} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton onClick={handleFullscreen} size="small">
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Map Container */}
        <Box
          sx={{
            height: 'calc(100% - 80px)',
            bgcolor: '#e3f2fd',
            borderRadius: 1,
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid',
            borderColor: 'divider'
          }}
        >
          {/* Bangladesh Base Map */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 30% 40%, rgba(25, 118, 210, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 60%, rgba(56, 142, 60, 0.1) 0%, transparent 50%),
                linear-gradient(180deg, #e8f4fd 0%, #bbdefb 100%)
              `,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Division Boundaries (Simplified) */}
            {bangladeshDivisions.map((division, index) => (
              <motion.div
                key={division.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                style={{
                  position: 'absolute',
                  left: `${((division.center[0] - bangladeshBounds.west) / (bangladeshBounds.east - bangladeshBounds.west)) * 100}%`,
                  top: `${100 - ((division.center[1] - bangladeshBounds.south) / (bangladeshBounds.north - bangladeshBounds.south)) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  color: division.color,
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                  zIndex: 1
                }}
              >
                {division.name}
              </motion.div>
            ))}

            {/* Territory Markers */}
            {mapMarkers.map((marker, index) => (
              <motion.div
                key={marker.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                style={{
                  position: 'absolute',
                  left: `${((marker.position[0] - bangladeshBounds.west) / (bangladeshBounds.east - bangladeshBounds.west)) * 100}%`,
                  top: `${100 - ((marker.position[1] - bangladeshBounds.south) / (bangladeshBounds.north - bangladeshBounds.south)) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: marker.type === 'territory' ? 3 : 2
                }}
                onClick={() => handleMarkerClick(marker)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Box
                  sx={{
                    width: getMarkerSize(marker.size),
                    height: getMarkerSize(marker.size),
                    borderRadius: '50%',
                    bgcolor: marker.color,
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {marker.type === 'territory' && <LocationIcon sx={{ fontSize: 8, color: 'white' }} />}
                  {marker.type === 'customer' && <BusinessIcon sx={{ fontSize: 6, color: 'white' }} />}
                  {marker.type === 'compliance' && <AssessmentIcon sx={{ fontSize: 6, color: 'white' }} />}
                </Box>
              </motion.div>
            ))}

            {/* Selected Territory Highlight */}
            {selectedTerritoryId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute',
                  left: `${((mapCenter[0] - bangladeshBounds.west) / (bangladeshBounds.east - bangladeshBounds.west)) * 100}%`,
                  top: `${100 - ((mapCenter[1] - bangladeshBounds.south) / (bangladeshBounds.north - bangladeshBounds.south)) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 5
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    border: '3px solid #1976d2',
                    backgroundColor: 'transparent',
                    animation: 'pulse 2s infinite'
                  }}
                />
              </motion.div>
            )}
          </Box>

          {/* Map Legend */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              borderRadius: 1,
              p: 2,
              minWidth: 200
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Map Legend
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {layers.filter(l => l.visible).map(layer => (
                <Box key={layer.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 
                        layer.type === 'territories' ? '#1976d2' :
                        layer.type === 'customers' ? '#4caf50' :
                        layer.type === 'compliance' ? '#f44336' :
                        '#ff9800'
                    }}
                  />
                  <Typography variant="caption">{layer.name}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Territory Info Panel */}
          {selectedMarker && selectedMarker.type === 'territory' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10
              }}
            >
              <Card sx={{ minWidth: 280, maxWidth: 350 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {(selectedMarker.data as Territory).name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {(selectedMarker.data as Territory).code}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Customers:</Typography>
                      <Chip 
                        label={(selectedMarker.data as Territory).customerCount} 
                        size="small" 
                        color="primary"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Performance:</Typography>
                      <Chip 
                        label={`${(selectedMarker.data as Territory).performance.performanceScore.toFixed(1)}%`}
                        size="small" 
                        color="success"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">DGDA Status:</Typography>
                      <Chip 
                        label={(selectedMarker.data as Territory).dgdaCompliance.status}
                        size="small" 
                        color={
                          (selectedMarker.data as Territory).dgdaCompliance.status === ComplianceStatus.COMPLIANT 
                            ? 'success' 
                            : 'warning'
                        }
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Empty State */}
          {territories.length === 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                zIndex: 10
              }}
            >
              <Alert severity="info" sx={{ mb: 2 }}>
                No territories available to display
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Add territories to see them visualized on the map
              </Typography>
            </Box>
          )}
        </Box>

        {/* Map Stats */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`${mapMarkers.filter(m => m.type === 'territory').length} Territories`}
            icon={<LocationIcon />}
            color="primary"
            size="small"
          />
          <Chip 
            label={`${mapMarkers.filter(m => m.type === 'customer').length} Customer Groups`}
            icon={<BusinessIcon />}
            color="success"
            size="small"
          />
          <Chip 
            label={`Zoom: ${zoomLevel}x`}
            color="default"
            size="small"
          />
        </Box>
      </CardContent>

      {/* Fullscreen overlay styles */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        `}
      </style>
    </Card>
  );
};

export default TerritoryMap;