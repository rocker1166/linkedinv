'use client';

import React, { useState } from 'react';
import LinkedInShareForm from '../components/Form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, History, LayoutDashboard, Settings } from 'lucide-react';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("compose");

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6  text-white ">My LinkedIn Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab("compose")}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-colors ${
                  activeTab === "compose" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <FileText className="h-5 w-5" />
                <span>Compose Post</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-colors ${
                  activeTab === "analytics" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Activity className="h-5 w-5" />
                <span>Analytics</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("history")}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-colors ${
                  activeTab === "history" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <History className="h-5 w-5" />
                <span>Post History</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-colors ${
                  activeTab === "settings" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
            </nav>
          </CardContent>
        </Card>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          {activeTab === "compose" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg dark:from-blue-950 dark:to-indigo-950">
                <h2 className="text-xl font-semibold mb-2">Create LinkedIn Content</h2>
                <p className="text-gray-600 dark:text-gray-300">Craft engaging posts for your professional network with AI assistance.</p>
              </div>
              <LinkedInShareForm />
            </div>
          )}
          
          {activeTab === "analytics" && (
            <Card>
              <CardHeader>
                <CardTitle>Post Analytics</CardTitle>
                <CardDescription>
                  Track the performance of your LinkedIn posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-60">
                  <Activity className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">Analytics will be available soon!</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle>Post History</CardTitle>
                <CardDescription>
                  View and manage your previous LinkedIn posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-60">
                  <History className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">Post history will be available soon!</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and LinkedIn integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-60">
                  <Settings className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">Account settings will be available soon!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}