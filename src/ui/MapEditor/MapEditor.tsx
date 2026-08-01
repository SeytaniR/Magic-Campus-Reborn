import React, { useState, useEffect, MouseEvent } from 'react';
import { Point, MapPolygon, PolygonType, MapConfig, MapCategory, MapBiome } from '../../types/map';
import { Copy, Trash2, X, Check, ZoomIn, ZoomOut, Menu, Settings } from 'lucide-react';

const POLYGON_COLORS = {
  collision: { fill: 'rgba(239, 68, 68, 0.4)', stroke: 'rgb(239, 68, 68)' },
  portal: { fill: 'rgba(168, 85, 247, 0.4)', stroke: 'rgb(168, 85, 247)' },
  overlay: { fill: 'rgba(59, 130, 246, 0.4)', stroke: 'rgb(59, 130, 246)' },
  elevation: { fill: 'rgba(234, 179, 8, 0.4)', stroke: 'rgb(234, 179, 8)' },
  effect: { fill: 'rgba(14, 165, 233, 0.4)', stroke: 'rgb(14, 165, 233)' },
};

export default function MapEditor() {
  const [config, setConfig] = useState<MapConfig>({
    name: 'izumo',
    level: 1,
    category: 'city',
    biome: 'suburb',
    polygons: [],
  });
  const [imageUrl, setImageUrl] = useState('/mapas/izumo.jpg');
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [currentType, setCurrentType] = useState<PolygonType>('collision');
  const [zoom, setZoom] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [selectedPolyId, setSelectedPolyId] = useState<string | null>(null);

  // Mobile responsiveness states
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsLeftMenuOpen(true);
        setIsRightMenuOpen(true);
      } else {
        setIsLeftMenuOpen(false);
        setIsRightMenuOpen(false);
      }
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Open right menu automatically when a polygon is selected on mobile
  useEffect(() => {
    if (selectedPolyId && window.innerWidth <= 768) {
      setIsRightMenuOpen(true);
      setIsLeftMenuOpen(false); // Auto-close left to save space
    }
  }, [selectedPolyId]);

  // Load from local storage or server
  useEffect(() => {
    const saved = localStorage.getItem('map_editor_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.config && parsed.config.polygons && parsed.config.polygons.length > 0) {
          setConfig(parsed.config);
          if (parsed.imageUrl) setImageUrl(parsed.imageUrl);
          return;
        }
      } catch (e) {
        console.error("Failed to parse map config from local storage", e);
      }
    }
    
    // Fallback to loading izumo by default
    fetch('/mapas/izumo.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.polygons) setConfig(data);
        setImageUrl('/mapas/izumo.jpg');
      })
      .catch(err => console.error('Failed to load default map json', err));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('map_editor_config', JSON.stringify({ config, imageUrl }));
  }, [config, imageUrl]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageSize({
      width: e.currentTarget.naturalWidth,
      height: e.currentTarget.naturalHeight
    });
  };

  const handleSvgClick = (e: MouseEvent<SVGSVGElement>) => {
    if (selectedPolyId) {
      setSelectedPolyId(null);
      if (window.innerWidth <= 768) {
        setIsRightMenuOpen(false);
      }
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    setCurrentPoints([...currentPoints, { x, y }]);
  };

  const finishPolygon = () => {
    if (currentPoints.length < 3) {
      alert('A polygon must have at least 3 points.');
      return;
    }
    
    const newPoly: MapPolygon = {
      id: Date.now().toString(),
      type: currentType,
      points: currentPoints,
    };
    
    if (currentType === 'portal') {
      newPoly.portalData = { portalId: 1, portalType: 'teleport', targetMap: '', targetPortalId: 1 };
    } else if (currentType === 'elevation') {
      newPoly.elevationLevel = 1;
    } else if (currentType === 'effect') {
      newPoly.effectType = 'water';
    }

    setConfig({ ...config, polygons: [...config.polygons, newPoly] });
    setCurrentPoints([]);
  };

  const deletePolygon = (id: string) => {
    setConfig({ ...config, polygons: config.polygons.filter(p => p.id !== id) });
    if (selectedPolyId === id) {
      setSelectedPolyId(null);
      if (window.innerWidth <= 768) setIsRightMenuOpen(false);
    }
  };

  const updateSelectedPoly = (updates: Partial<MapPolygon>) => {
    if (!selectedPolyId) return;
    setConfig(prev => ({
      ...prev,
      polygons: prev.polygons.map(p => p.id === selectedPolyId ? { ...p, ...updates } : p)
    }));
  };

  const selectedPoly = config.polygons.find(p => p.id === selectedPolyId);

  const exportJson = () => {
    const json = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      alert('JSON copied to clipboard!');
    });
  };

  const toSvgPoints = (pts: Point[]) => pts.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex w-full h-full text-sm font-sans relative overflow-hidden">
      
      {/* Mobile Menu Toggles */}
      <div className="md:hidden absolute top-2 left-2 z-30 flex flex-col gap-2">
        <button 
          onClick={() => {
            setIsLeftMenuOpen(!isLeftMenuOpen);
            if (!isLeftMenuOpen) setIsRightMenuOpen(false);
          }} 
          className="bg-gray-800 text-white p-2.5 rounded shadow-lg border border-gray-700 active:bg-gray-700 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>
      
      {selectedPolyId && (
        <div className="md:hidden absolute top-2 right-2 z-30">
          <button 
            onClick={() => {
              setIsRightMenuOpen(!isRightMenuOpen);
              if (!isRightMenuOpen) setIsLeftMenuOpen(false);
            }} 
            className="bg-indigo-600 text-white p-2.5 rounded shadow-lg border border-indigo-500 active:bg-indigo-700 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      )}

      {/* Sidebar Left - Map Config & Tools */}
      <div 
        className={`absolute md:relative z-20 w-80 max-w-[85vw] bg-gray-900 border-r border-gray-800 flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out ${
          isLeftMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-100">Map Settings</h2>
          <button onClick={() => setIsLeftMenuOpen(false)} className="md:hidden text-gray-400 p-1">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-800 overflow-y-auto">
          <label className="block text-gray-400 mb-1">Image URL</label>
          <input 
            type="text" 
            value={imageUrl} 
            onChange={e => setImageUrl(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 mb-3 text-white focus:outline-none focus:border-gray-500"
          />

          <label className="block text-gray-400 mb-1">Name</label>
          <input 
            type="text" 
            value={config.name} 
            onChange={e => setConfig({...config, name: e.target.value})}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 mb-3 text-white focus:outline-none focus:border-gray-500"
          />

          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="block text-gray-400 mb-1">Level</label>
              <input 
                type="number" 
                value={config.level} 
                onChange={e => setConfig({...config, level: parseInt(e.target.value) || 1})}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white focus:outline-none focus:border-gray-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-400 mb-1">Category</label>
              <select 
                value={config.category}
                onChange={e => setConfig({...config, category: e.target.value as MapCategory})}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white focus:outline-none focus:border-gray-500"
              >
                <option value="city">City</option>
                <option value="field">Field</option>
                <option value="dungeon">Dungeon</option>
              </select>
            </div>
          </div>

          <label className="block text-gray-400 mb-1">Biome</label>
          <select 
            value={config.biome}
            onChange={e => setConfig({...config, biome: e.target.value as MapBiome})}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 mb-4 text-white focus:outline-none focus:border-gray-500"
          >
            <option value="snow">Snow</option>
            <option value="mountain">Mountain</option>
            <option value="woods">Woods</option>
            <option value="prairie">Prairie</option>
            <option value="desert">Desert</option>
            <option value="swamp">Swamp</option>
            <option value="suburb">Suburb</option>
            <option value="dungeon">Dungeon</option>
          </select>

          <div className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2">
              <button 
                onClick={exportJson}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded flex items-center justify-center gap-2 transition-colors font-medium active:bg-indigo-800 text-sm"
              >
                <Copy size={16} /> Copy
              </button>
              <button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${config.name}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2 transition-colors font-medium active:bg-blue-800 text-sm"
              >
                Download
              </button>
            </div>
            <button 
              onClick={async () => {
                try {
                  // Clean up name just in case the user typed .json or spaces
                  let cleanName = config.name.trim().toLowerCase();
                  if (cleanName.endsWith('.json')) cleanName = cleanName.replace('.json', '');

                  const res = await fetch(`/mapas/${cleanName}.json`);
                  if (!res.ok) throw new Error("Not found");

                  // Vite returns index.html for missing files in SPA mode (status 200), so we must check Content-Type
                  const contentType = res.headers.get("content-type");
                  if (contentType && !contentType.includes("application/json")) {
                    throw new Error(`File /mapas/${cleanName}.json not found!`);
                  }

                  const data = await res.json();
                  setConfig({ ...data, name: cleanName });
                  setImageUrl(`/mapas/${cleanName}.jpg`);
                  alert(`Loaded ${cleanName}.json successfully`);
                } catch (err: any) {
                  alert("Failed to load map from server: " + err.message);
                }
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded flex items-center justify-center gap-2 transition-colors font-medium active:bg-gray-500 text-sm"
            >
              Load Server
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-800 flex-1 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Drawing Tool</h2>
          
          <div className="grid grid-cols-1 gap-2 mb-4">
            {(['collision', 'portal', 'overlay', 'elevation', 'effect'] as PolygonType[]).map(type => (
              <button
                key={type}
                onClick={() => { 
                  setCurrentType(type); 
                  setSelectedPolyId(null); 
                  setCurrentPoints([]); 
                  if (window.innerWidth <= 768) setIsLeftMenuOpen(false);
                }}
                className={`py-2 px-3 rounded flex items-center gap-3 border transition-colors ${
                  currentType === type && !selectedPolyId
                    ? 'bg-gray-800 border-gray-600 text-white shadow-inner'
                    : 'border-transparent text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <div 
                  className="w-3.5 h-3.5 rounded-full shrink-0" 
                  style={{ backgroundColor: POLYGON_COLORS[type].stroke }}
                />
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>

          {currentPoints.length > 0 && (
            <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
              <p className="text-gray-300 mb-2">Drawing: <span className="capitalize text-white font-medium">{currentType}</span></p>
              <p className="text-gray-400 mb-3 text-xs">{currentPoints.length} points added. Click on the map to add more.</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={finishPolygon}
                  className="flex-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-600/50 py-2 rounded flex items-center justify-center gap-1 transition-colors active:bg-green-600/60"
                >
                  <Check size={16} /> Finish
                </button>
                <button 
                  onClick={() => setCurrentPoints([])}
                  className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 py-2 rounded flex items-center justify-center gap-1 transition-colors active:bg-red-600/60"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 bg-gray-950 relative overflow-hidden flex flex-col min-h-0">
        <div className="bg-gray-900 border-b border-gray-800 p-2 flex flex-wrap gap-2 justify-center md:justify-between items-center z-10 shadow-sm pl-16 md:pl-2">
          <div className="flex gap-1 items-center text-gray-300 bg-gray-800 rounded p-1 border border-gray-700">
            <button onClick={() => setZoom(prev => Math.max(0.1, Math.round((prev - 0.1) * 10) / 10))} className="p-2 rounded hover:text-white hover:bg-gray-700 active:bg-gray-600 transition-colors"><ZoomOut size={18} /></button>
            <span className="w-14 text-center text-sm tabular-nums font-mono">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={() => setZoom(prev => Math.min(3, Math.round((prev + 0.1) * 10) / 10))} className="p-2 rounded hover:text-white hover:bg-gray-700 active:bg-gray-600 transition-colors"><ZoomIn size={18} /></button>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer bg-gray-800 px-3 py-1.5 rounded border border-gray-700 hover:bg-gray-700 transition-colors">
              <input 
                type="checkbox" 
                checked={editMode} 
                onChange={e => setEditMode(e.target.checked)} 
                className="accent-indigo-500 w-4 h-4" 
              />
              <span className="font-medium">Select/Edit Mode</span>
            </label>
            <p className="text-gray-500 text-xs hidden sm:block">Click map to add points. Uncheck to draw overlapping shapes.</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 cursor-crosshair min-h-0 relative">
          {imageSize.width > 0 && (
            <div 
              className="relative shadow-2xl bg-gray-900"
              style={{ 
                width: imageSize.width * zoom, 
                height: imageSize.height * zoom,
              }}
            >
              <img 
                src={imageUrl} 
                alt="Map" 
                className="absolute top-0 left-0 w-full h-full" 
                onLoad={handleImageLoad} 
                draggable={false}
              />
              <svg 
                className="absolute top-0 left-0 w-full h-full" 
                viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
                onClick={handleSvgClick}
                onContextMenu={e => e.preventDefault()}
              >
                {/* Drawn Polygons */}
                {config.polygons.map(poly => {
                  const isSelected = poly.id === selectedPolyId;
                  const colors = POLYGON_COLORS[poly.type];
                  return (
                    <polygon
                      key={poly.id}
                      points={toSvgPoints(poly.points)}
                      fill={colors.fill}
                      stroke={isSelected ? 'white' : colors.stroke}
                      strokeWidth={isSelected ? 4 / zoom : 2 / zoom}
                      className={editMode ? "cursor-pointer transition-all hover:stroke-white" : "transition-all"}
                      style={{ pointerEvents: editMode ? 'auto' : 'none' }}
                      onClick={(e) => {
                        if (!editMode) return;
                        e.stopPropagation();
                        setSelectedPolyId(poly.id);
                        setCurrentPoints([]);
                        if (window.innerWidth <= 768) setIsRightMenuOpen(true);
                      }}
                    />
                  );
                })}

                {/* Current Drawing Polygon */}
                {currentPoints.length > 0 && (
                  <>
                    <polyline 
                      points={toSvgPoints(currentPoints)} 
                      fill={currentPoints.length >= 3 ? POLYGON_COLORS[currentType].fill : 'none'} 
                      stroke={POLYGON_COLORS[currentType].stroke} 
                      strokeWidth={2 / zoom}
                      strokeDasharray={`${4/zoom} ${4/zoom}`}
                    />
                    {currentPoints.map((p, i) => (
                      <circle 
                        key={i} 
                        cx={p.x} 
                        cy={p.y} 
                        r={2 / zoom} 
                        fill="white" 
                        stroke="black"
                        strokeWidth={1 / zoom}
                      />
                    ))}
                  </>
                )}
              </svg>
            </div>
          )}
          {/* Invisible image just to trigger load if it's new */}
          <img 
            src={imageUrl} 
            className="hidden" 
            onLoad={handleImageLoad}
          />
        </div>
        
        {/* Floating Action Bar for Drawing */}
        {currentPoints.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-2 flex gap-2 z-30">
            <button 
              onClick={finishPolygon}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 font-medium transition-colors"
            >
              <Check size={18} /> Finish
            </button>
            <button 
              onClick={() => setCurrentPoints([])}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2 font-medium transition-colors"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Right - Selection Properties */}
      {selectedPolyId && selectedPoly && (
        <div 
          className={`absolute right-0 md:relative z-20 w-80 max-w-[85vw] bg-gray-900 border-l border-gray-800 flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out ${
            isRightMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-4 flex justify-between items-center border-b border-gray-800">
            <h3 className="font-bold text-gray-100 capitalize">{selectedPoly.type} Properties</h3>
            <button 
              onClick={() => {
                setIsRightMenuOpen(false);
                setSelectedPolyId(null);
              }} 
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            {selectedPoly.type === 'portal' && selectedPoly.portalData && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1 text-sm">Portal ID</label>
                  <input 
                    type="number" 
                    value={selectedPoly.portalData.portalId}
                    onChange={e => updateSelectedPoly({ portalData: { ...selectedPoly.portalData!, portalId: parseInt(e.target.value) || 1 } })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-sm">Type</label>
                  <select
                    value={selectedPoly.portalData.portalType}
                    onChange={e => updateSelectedPoly({ portalData: { ...selectedPoly.portalData!, portalType: e.target.value as 'teleport'|'spawn' } })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white focus:outline-none focus:border-gray-500"
                  >
                    <option value="teleport">Teleport</option>
                    <option value="spawn">Spawn</option>
                  </select>
                </div>
                {selectedPoly.portalData.portalType === 'teleport' && (
                  <>
                    <div>
                      <label className="block text-gray-400 mb-1 text-sm">Target Map (e.g. izumo.jpg)</label>
                      <input 
                        type="text" 
                        value={selectedPoly.portalData.targetMap || ''}
                        onChange={e => updateSelectedPoly({ portalData: { ...selectedPoly.portalData!, targetMap: e.target.value } })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white focus:outline-none focus:border-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1 text-sm">Target Portal ID</label>
                      <input 
                        type="number" 
                        value={selectedPoly.portalData.targetPortalId || 1}
                        onChange={e => updateSelectedPoly({ portalData: { ...selectedPoly.portalData!, targetPortalId: parseInt(e.target.value) || 1 } })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white focus:outline-none focus:border-gray-500"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedPoly.type === 'elevation' && (
              <div>
                <label className="block text-gray-400 mb-1 text-sm">Elevation Level</label>
                <input 
                  type="number" 
                  value={selectedPoly.elevationLevel || 1}
                  onChange={e => updateSelectedPoly({ elevationLevel: parseInt(e.target.value) || 1 })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white focus:outline-none focus:border-gray-500"
                />
              </div>
            )}

            {selectedPoly.type === 'effect' && (
              <div>
                <label className="block text-gray-400 mb-1 text-sm">Effect Type</label>
                <select
                  value={selectedPoly.effectType || 'water'}
                  onChange={e => updateSelectedPoly({ effectType: e.target.value as 'water'|'crystal' })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white focus:outline-none focus:border-gray-500"
                >
                  <option value="water">Water Sparkle</option>
                  <option value="crystal">Crystal Sparkle</option>
                </select>
              </div>
            )}
            
            {['collision', 'overlay'].includes(selectedPoly.type) && (
              <div className="bg-gray-800/30 p-3 rounded border border-gray-700 mt-2">
                <p className="text-gray-400 text-sm">No specific properties for this area type.</p>
              </div>
            )}

          </div>
          
          <div className="p-4 border-t border-gray-800 mt-auto">
            <button 
              onClick={() => deletePolygon(selectedPoly.id)}
              className="w-full bg-red-900/40 hover:bg-red-800/80 active:bg-red-800 text-red-300 py-3 rounded flex items-center justify-center gap-2 transition-colors border border-red-900/50"
            >
              <Trash2 size={18} /> Delete Polygon
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

