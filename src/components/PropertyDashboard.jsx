import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Home, FileText, Map, BarChart3, Settings, ChevronRight, TrendingUp, DollarSign, Calendar, MapPin, Menu, X, ExternalLink, Clock, User, Building, Gavel } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Custom map marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


export default function PropertyDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);

  // Sample data based on Jerry's specifications
  const marketEvents = [
    { 
      id: 1, 
      fileNumber: '251116-1234-Maple-Dr',
      type: 'Family Transition',
      causeNumber: '71D01-2411-DR-001234',
      petitionDate: '2024-11-15',
      decreeDate: null,
      settlementParty: 'Pending',
      dismissed: false,
      owners: 'John & Jane Doe',
      propertyName: 'DOE, JOHN & JANE',
      address: '1234 Maple Dr',
      algorithmDate: '2024-11-16',
      status: 'Active'
    },
    { 
      id: 2, 
      fileNumber: '251116-5678-Oak-Ave',
      type: 'Urgent Liquidation',
      causeNumber: '71D01-2411-MF-005678',
      petitionDate: '2024-11-14',
      decreeDate: null,
      settlementParty: 'Pending',
      dismissed: false,
      owners: 'Robert Roe',
      propertyName: 'ROE, ROBERT',
      address: '5678 Oak Ave',
      algorithmDate: '2024-11-16',
      status: 'Active'
    },
    { 
      id: 3, 
      fileNumber: '251115-9012-Pine-St',
      type: 'Estate Sale',
      causeNumber: '71D01-2411-ES-009012',
      petitionDate: '2024-11-10',
      decreeDate: '2024-11-14',
      settlementParty: 'Estate Executor',
      dismissed: false,
      owners: 'Mary Miller Estate',
      propertyName: 'MILLER, MARY (ESTATE)',
      address: '9012 Pine St',
      algorithmDate: '2024-11-15',
      status: 'Settled'
    },
    { 
      id: 4, 
      fileNumber: '251115-3456-Elm-Rd',
      type: 'Family Transition',
      causeNumber: '71D01-2411-DR-003456',
      petitionDate: '2024-11-12',
      decreeDate: null,
      settlementParty: 'Pending',
      dismissed: false,
      owners: 'Tom & Lisa Smith',
      propertyName: 'SMITH, TOM & LISA',
      address: '3456 Elm Rd',
      algorithmDate: '2024-11-15',
      status: 'Active'
    }
  ];

  const opportunityLeads = [
    { 
      id: 1, 
      fileNumber: '251116-1234-Maple-Dr',
      address: '1234 Maple Dr',
      propertyName: 'DOE, JOHN & JANE',
      assessedValue: 240000,
      zillowValue: 250000,
      loanAmount: 260000, // Original loan amount
      loanDate: '2015-03-15',
      estimatedLoanBalance: 180000,
      perceivedEquity: 70000, // zillowValue - estimatedLoanBalance
      causeNumber: '71D01-2411-DR-001234',
      petitionDate: '2024-11-15',
      decreeDate: null,
      settlementParty: 'Pending',
      dismissed: false,
      type: 'Family Transition',
      algorithmDate: '2024-11-16',
      lat: 41.6764,
      lng: -86.2520
    },
    { 
      id: 2, 
      fileNumber: '251116-5678-Oak-Ave',
      address: '5678 Oak Ave',
      propertyName: 'ROE, ROBERT',
      assessedValue: 298000,
      zillowValue: 310000,
      loanAmount: 285000,
      loanDate: '2012-06-20',
      estimatedLoanBalance: 165000,
      perceivedEquity: 145000,
      causeNumber: '71D01-2411-MF-005678',
      petitionDate: '2024-11-14',
      decreeDate: null,
      settlementParty: 'Pending',
      dismissed: false,
      type: 'Urgent Liquidation',
      algorithmDate: '2024-11-16',
      lat: 41.6834,
      lng: -86.2500
    },
    { 
      id: 3, 
      fileNumber: '251115-9012-Pine-St',
      address: '9012 Pine St',
      propertyName: 'MILLER, MARY (ESTATE)',
      assessedValue: 370000,
      zillowValue: 385000,
      loanAmount: 320000,
      loanDate: '2010-01-10',
      estimatedLoanBalance: 165000,
      perceivedEquity: 220000,
      causeNumber: '71D01-2411-ES-009012',
      petitionDate: '2024-11-10',
      decreeDate: '2024-11-14',
      settlementParty: 'Estate Executor',
      dismissed: false,
      type: 'Estate Sale',
      algorithmDate: '2024-11-15',
      lat: 41.6700,
      lng: -86.2580
    }
  ];

  const sidebarItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'events', icon: FileText, label: 'Market Events' },
    { id: 'opportunities', icon: TrendingUp, label: 'Opportunities' },
    { id: 'properties', icon: Building, label: 'Properties' },
    { id: 'map', icon: Map, label: 'Map Explorer' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Pending';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!window.google || !mapRef.current) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 41.6764, lng: -86.2520 },
        zoom: 13,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#c9e6ff" }]
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }]
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#eeeeee" }]
          }
        ],
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      googleMapRef.current = map;
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      opportunityLeads.forEach((lead) => {
        const marker = new window.google.maps.Marker({
          position: { lat: lead.lat, lng: lead.lng },
          map: map,
          title: lead.address,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: lead.type === 'Family Transition' ? '#3b82f6' : 
                      lead.type === 'Urgent Liquidation' ? '#f59e0b' : '#8b5cf6',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          animation: window.google.maps.Animation.DROP,
        });

        const infoContent = `
          <div style="padding: 8px; min-width: 240px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; color: #1e293b;">${lead.address}</h3>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
              <strong>File #:</strong> ${lead.fileNumber}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
              <span style="display: inline-block; padding: 2px 8px; background: ${
                lead.type === 'Family Transition' ? '#dbeafe' : 
                lead.type === 'Urgent Liquidation' ? '#fef3c7' : '#ede9fe'
              }; color: ${
                lead.type === 'Family Transition' ? '#1e40af' : 
                lead.type === 'Urgent Liquidation' ? '#92400e' : '#5b21b6'
              }; border-radius: 9999px; font-weight: 500;">${lead.type}</span>
            </div>
            <div style="margin: 8px 0; padding: 8px 0; border-top: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: #64748b; font-size: 13px;">Perceived Equity</span>
                <span style="color: #16a34a; font-weight: 600; font-size: 13px;">${formatCurrency(lead.perceivedEquity)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: #64748b; font-size: 13px;">Zillow Value</span>
                <span style="color: #1e293b; font-weight: 600; font-size: 13px;">${formatCurrency(lead.zillowValue)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b; font-size: 13px;">Est. Balance</span>
                <span style="color: #334155; font-weight: 600; font-size: 13px;">${formatCurrency(lead.estimatedLoanBalance)}</span>
              </div>
            </div>
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent,
        });

        marker.addListener('click', () => {
          markersRef.current.forEach(m => {
            if (m.infoWindow) m.infoWindow.close();
          });
          infoWindow.open(map, marker);
          setSelectedProperty(lead);
        });

        marker.infoWindow = infoWindow;
        markersRef.current.push(marker);
      });
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [opportunityLeads]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="backdrop-blur-2xl bg-white/40 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          
          {/* Top Navigation Bar */}
          <div className="backdrop-blur-xl bg-white/60 border-b border-white/50 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">ALT</span>
                </div>
                <span className="text-2xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  State
                </span>
                <span className="text-sm text-slate-500 ml-2">St. Joseph County</span>
              </div>

              <div className="flex-1 max-w-2xl mx-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by address, owner, cause number, or file number..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl backdrop-blur-xl bg-white/50 border border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-slate-700 placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:scale-105">
                <Sparkles className="w-5 h-5" />
                AI Assistant
              </button>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} backdrop-blur-xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-6 min-h-[calc(100vh-180px)] transition-all duration-300 relative`}>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all z-10"
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </button>
              
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeSection === item.id
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8">
              <div className="grid grid-cols-3 gap-6 h-full">
                
                {/* Column 1: Market Events Feed */}
                <div className="space-y-4">
                  <div className="backdrop-blur-xl bg-white/60 rounded-2xl p-6 border border-white/50 shadow-xl">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Market Events</h2>
                    <div className="space-y-3">
                      {marketEvents.map((event) => (
                        <div
                          key={event.id}
                          className="backdrop-blur-lg bg-white/50 rounded-xl p-4 border border-white/50 hover:bg-white/70 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                event.type === 'Family Transition' ? 'bg-blue-400' :
                                event.type === 'Urgent Liquidation' ? 'bg-amber-400' :
                                'bg-purple-400'
                              }`} />
                              <span className="font-semibold text-slate-800 text-sm">{event.type}</span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              event.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                          
                          <p className="text-sm text-slate-600 mb-1">{event.owners}</p>
                          <p className="text-xs text-slate-500 mb-2">{event.address}</p>
                          
                          <div className="text-xs text-slate-500 space-y-1 mb-2">
                            <div className="flex items-center gap-1">
                              <Gavel className="w-3 h-3" />
                              <span>{event.causeNumber}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Filed: {formatDate(event.petitionDate)}</span>
                            </div>
                            {event.decreeDate && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Decree: {formatDate(event.decreeDate)}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">File: {event.fileNumber}</span>
                            <button className="text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Analyze →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-xl p-4 border border-white/50">
                      <div className="text-3xl font-bold text-slate-800">{marketEvents.length}</div>
                      <div className="text-sm text-slate-600">Market Events</div>
                    </div>
                    <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl p-4 border border-white/50">
                      <div className="text-3xl font-bold text-slate-800">{opportunityLeads.length}</div>
                      <div className="text-sm text-slate-600">Opportunities</div>
                    </div>
                  </div>

                  {/* Data Sources */}
                  <div className="backdrop-blur-xl bg-white/60 rounded-2xl p-4 border border-white/50">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Data Sources</h3>
                    <div className="space-y-2 text-xs">
                      <a href="https://public.courts.in.gov/mycase/#/vw/Search" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                        <ExternalLink className="w-3 h-3" />
                        <span>Indiana Court Records</span>
                      </a>
                      <a href="https://lowtaxinfo.com/sjcounty" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                        <ExternalLink className="w-3 h-3" />
                        <span>St. Joseph County Auditor</span>
                      </a>
                      <a href="https://www.zillow.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                        <ExternalLink className="w-3 h-3" />
                        <span>Zillow Estimates</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Column 2: Arbitrage Opportunities */}
                <div className="space-y-4">
                  <div className="backdrop-blur-xl bg-white/60 rounded-2xl p-6 border border-white/50 shadow-xl">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Arbitrage Opportunities
                    </h2>
                    <div className="space-y-4">
                      {opportunityLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedProperty(lead)}
                          className="backdrop-blur-lg bg-gradient-to-br from-white/70 to-white/50 rounded-xl p-5 border border-white/50 hover:shadow-xl transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-slate-800 mb-1">{lead.address}</h3>
                              <p className="text-xs text-slate-500 mb-2">{lead.propertyName}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                lead.type === 'Family Transition' ? 'bg-blue-100 text-blue-700' :
                                lead.type === 'Urgent Liquidation' ? 'bg-amber-100 text-amber-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {lead.type}
                              </span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Perceived Equity</span>
                              <span className="font-bold text-green-600">{formatCurrency(lead.perceivedEquity)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Zillow Value</span>
                              <span className="font-semibold text-slate-800">{formatCurrency(lead.zillowValue)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Assessed Value</span>
                              <span className="font-semibold text-slate-700">{formatCurrency(lead.assessedValue)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Est. Loan Balance</span>
                              <span className="font-semibold text-red-600">{formatCurrency(lead.estimatedLoanBalance)}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200/50 space-y-1">
                            <div className="text-xs text-slate-500">
                              <strong>File:</strong> {lead.fileNumber}
                            </div>
                            <div className="text-xs text-slate-500">
                              <strong>Cause:</strong> {lead.causeNumber}
                            </div>
                            <div className="text-xs text-slate-500">
                              <strong>Filed:</strong> {formatDate(lead.petitionDate)}
                            </div>
                            {lead.decreeDate && (
                              <div className="text-xs text-slate-500">
                                <strong>Decree:</strong> {formatDate(lead.decreeDate)} - {lead.settlementParty}
                              </div>
                            )}
                          </div>

                          <button className="w-full mt-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium opacity-0 group-hover:opacity-100 transition-all">
                            View Full Analysis
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 3: Map View */}
                <div className="space-y-4">
                  <div className="backdrop-blur-xl bg-white/60 rounded-2xl p-6 border border-white/50 shadow-xl h-[600px] flex flex-col">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Map className="w-5 h-5 text-blue-600" />
                      Property Map
                    </h2>
                    
                    {/* Google Maps Container */}
                    <MapContainer
                      center={[41.6764, -86.2520]}
                      zoom={13}
                      className="flex-1 rounded-xl overflow-hidden shadow-inner"
                      style={{ height: "100%", width: "100%" }}
                    >
                      {/* OpenStreetMap Tiles */}
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="© OpenStreetMap contributors"
                      />

                      {/* Plot your opportunity leads as markers */}
                      {opportunityLeads.map((lead) => (
                        <Marker
                          key={lead.id}
                          position={[lead.lat, lead.lng]}
                          icon={markerIcon}
                          eventHandlers={{
                            click: () => {
                              setSelectedProperty(lead);
                            }
                          }}
                        >
                          <Popup>
                            <div className="p-2">
                              <h3 className="font-semibold">{lead.address}</h3>
                              <p className="text-xs text-gray-600">{lead.propertyName}</p>
                              <p className="text-sm mt-2">
                                Equity: <span className="text-green-600 font-bold">{formatCurrency(lead.perceivedEquity)}</span>
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>


                    {/* Selected Property Detail Card */}
                    {selectedProperty && (
                      <div className="absolute bottom-10 left-6 right-6">
                        <div className="backdrop-blur-xl bg-white/95 rounded-xl p-4 shadow-2xl border border-white/50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-slate-800 text-lg">{selectedProperty.address}</h3>
                              <p className="text-xs text-slate-500 mt-1">{selectedProperty.propertyName}</p>
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 inline-block mt-2">
                                {formatCurrency(selectedProperty.perceivedEquity)} Equity
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProperty(null);
                              }}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              ✕
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div>
                              <div className="text-slate-600 text-xs">Zillow Value</div>
                              <div className="font-semibold text-slate-800">{formatCurrency(selectedProperty.zillowValue)}</div>
                            </div>
                            <div>
                              <div className="text-slate-600 text-xs">Assessed</div>
                              <div className="font-semibold text-slate-700">{formatCurrency(selectedProperty.assessedValue)}</div>
                            </div>
                            <div>
                              <div className="text-slate-600 text-xs">Est. Balance</div>
                              <div className="font-semibold text-red-600">{formatCurrency(selectedProperty.estimatedLoanBalance)}</div>
                            </div>
                            <div>
                              <div className="text-slate-600 text-xs">Filed</div>
                              <div className="font-semibold text-slate-700">{formatDate(selectedProperty.petitionDate)}</div>
                            </div>
                          </div>

                          <div className="text-xs text-slate-500 mb-3">
                            <div><strong>Cause:</strong> {selectedProperty.causeNumber}</div>
                            <div><strong>File:</strong> {selectedProperty.fileNumber}</div>
                          </div>

                          <button className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:shadow-lg transition-all">
                            View Full Analysis
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8">
          <button className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center hover:scale-110">
            <Sparkles className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}