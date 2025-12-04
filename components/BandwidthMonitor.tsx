
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ArrowDown, ArrowUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Grid } from './ui/grid';
import { Badge } from './ui/badge';

interface BandwidthMonitorProps {
  planSpeed?: string; // e.g., "50 Mbps"
  isLive?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-gray-100 dark:border-slate-700 shadow-xl rounded-lg text-sm z-50">
        <p className="font-semibold text-gray-900 dark:text-white mb-2 font-mono text-xs">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke }} />
                <span className="text-gray-500 dark:text-gray-400 capitalize">{entry.name}:</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-200 font-mono">{entry.value} Mbps</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const BandwidthMonitor: React.FC<BandwidthMonitorProps> = ({ planSpeed = "100 Mbps", isLive = true }) => {
  const [data, setData] = useState<any[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState({ down: 0, up: 0 });
  const [totalUsage, setTotalUsage] = useState({ down: 450.5, up: 85.2 }); // GB

  const maxSpeed = parseInt(planSpeed.split(' ')[0]) || 100;

  // Initialize data
  useEffect(() => {
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (20 - i) * 2000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
      download: Math.floor(Math.random() * (maxSpeed * 0.2)),
      upload: Math.floor(Math.random() * (maxSpeed * 0.05)),
    }));
    setData(initialData);
  }, [maxSpeed]);

  // Live Simulation
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      // Simulate traffic spikes and lulls
      const spike = Math.random() > 0.8 ? 0.8 : 0.2;
      const down = Math.floor(Math.random() * maxSpeed * spike);
      const up = Math.floor(Math.random() * (maxSpeed / 4) * spike);

      setCurrentSpeed({ down, up });
      setTotalUsage(prev => ({
          down: prev.down + (down / 8 / 1024), // Rough conversion to GB/s accum
          up: prev.up + (up / 8 / 1024)
      }));

      setData(prev => {
        const newData = [...prev.slice(1), {
          time: now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
          download: down,
          upload: up,
        }];
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive, maxSpeed]);

  return (
    <div className="space-y-6">
        <Grid cols={1} className="sm:grid-cols-3" gap={4}>
            <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Download</p>
                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mt-1">{currentSpeed.down} <span className="text-sm font-medium">Mbps</span></p>
                    </div>
                    <div className="p-2 bg-white dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400 shadow-sm"><ArrowDown className="w-5 h-5" /></div>
                </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">Upload</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">{currentSpeed.up} <span className="text-sm font-medium">Mbps</span></p>
                    </div>
                    <div className="p-2 bg-white dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 shadow-sm"><ArrowUp className="w-5 h-5" /></div>
                </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-900/30">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-400 uppercase tracking-wider">Total Usage (Mo)</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-300 mt-1">{(totalUsage.down + totalUsage.up).toFixed(2)} <span className="text-sm font-medium">GB</span></p>
                    </div>
                    <div className="p-2 bg-white dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 shadow-sm"><Activity className="w-5 h-5" /></div>
                </CardContent>
            </Card>
        </Grid>

        <Card>
            <CardHeader className="py-4 border-b border-gray-100 dark:border-slate-700 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Real-time Traffic</CardTitle>
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">↓ Download</Badge>
                    <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">↑ Upload</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.3} className="dark:stroke-slate-700/50" />
                            <XAxis dataKey="time" style={{ fontSize: '10px' }} tick={{fill: '#9ca3af'}} />
                            <YAxis style={{ fontSize: '10px' }} tick={{fill: '#9ca3af'}} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="download" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDown)" animationDuration={500} />
                            <Area type="monotone" dataKey="upload" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUp)" animationDuration={500} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    </div>
  );
};
