
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EmployeeRole } from '../types';
import { Eye, EyeOff, Lock, Mail, Shield, Wrench, Headphones, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Flex } from './ui/flex';

export const LoginView = () => {
  const { loginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call and login as Admin for default flow
    setTimeout(() => {
        loginAs(EmployeeRole.ADMIN);
        setIsLoading(false);
    }, 800);
  };

  const handleQuickLogin = (role: EmployeeRole) => {
      setIsLoading(true);
      setTimeout(() => {
          loginAs(role);
          setIsLoading(false);
      }, 500);
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-900 font-sans">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
         {/* Abstract shapes/gradient */}
         <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90" />
         {/* Pattern overlay */}
         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
         
         <div className="relative z-10 text-center px-12">
             <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl animate-in zoom-in duration-700">
                 <div className="text-5xl font-bold text-white">N</div>
             </div>
             <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Nexus ISP Manager</h1>
             <p className="text-blue-100 text-lg leading-relaxed max-w-md mx-auto">
                 The enterprise-grade solution for modern Internet Service Providers. 
                 Manage subscribers, monitor networks, and resolve tickets with precision.
             </p>
         </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-950">
          <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="text-center lg:text-left">
                  <div className="lg:hidden w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">N</div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Please enter your credentials to access the dashboard.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="admin@nexus-isp.com" 
                            className="pl-10 h-11"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Flex justify="between">
                          <Label htmlFor="password">Password</Label>
                          <a href="#" className="text-xs text-primary-600 hover:text-primary-500 font-medium">Forgot password?</a>
                      </Flex>
                      <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            className="pl-10 pr-10 h-11"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                      </div>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary-500/20" isLoading={isLoading}>
                      Sign in to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
              </form>

              <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200 dark:border-slate-800" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-gray-50 dark:bg-slate-950 px-2 text-gray-500">Or simulate role</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <QuickLoginBtn label="Admin" role={EmployeeRole.ADMIN} icon={Shield} color="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800" onClick={handleQuickLogin} />
                  <QuickLoginBtn label="Manager" role={EmployeeRole.MANAGER} icon={Briefcase} color="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800" onClick={handleQuickLogin} />
                  <QuickLoginBtn label="Support" role={EmployeeRole.SUPPORT} icon={Headphones} color="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800" onClick={handleQuickLogin} />
                  <QuickLoginBtn label="Tech" role={EmployeeRole.TECHNICIAN} icon={Wrench} color="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800" onClick={handleQuickLogin} />
              </div>
          </div>
      </div>
    </div>
  );
};

const QuickLoginBtn = ({ label, role, icon: Icon, color, onClick }: any) => (
    <button 
        onClick={() => onClick(role)}
        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all text-sm font-medium hover:shadow-sm active:scale-95 ${color}`}
    >
        <Icon className="w-4 h-4" /> {label}
    </button>
);
