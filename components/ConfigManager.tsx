import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { getLLMConfig } from '@/config/llm-config';

export const ConfigManager: React.FC = () => {
  const [config, setConfig] = useState(getLLMConfig());
  const [isVisible, setIsVisible] = useState(false);

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button 
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isVisible ? 'Hide Config' : 'Show Config'}
      </Button>
      
      {isVisible && (
        <div className="absolute top-12 right-0 bg-zinc-800 border border-zinc-600 rounded-lg p-4 w-80 max-h-96 overflow-y-auto">
          <h3 className="text-white font-semibold mb-3">LLM Configuration</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-white text-sm">Model:</label>
              <input
                type="text"
                value={config.ollama.model}
                onChange={(e) => updateConfig({ 
                  ollama: { ...config.ollama, model: e.target.value }
                })}
                className="w-full px-2 py-1 bg-zinc-700 text-white rounded text-sm"
              />
            </div>
            
            <div>
              <label className="text-white text-sm">Temperature:</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={config.ollama.temperature}
                onChange={(e) => updateConfig({ 
                  ollama: { ...config.ollama, temperature: parseFloat(e.target.value) }
                })}
                className="w-full px-2 py-1 bg-zinc-700 text-white rounded text-sm"
              />
            </div>
            
            <div>
              <label className="text-white text-sm">Max Tokens:</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={config.ollama.maxTokens}
                onChange={(e) => updateConfig({ 
                  ollama: { ...config.ollama, maxTokens: parseInt(e.target.value) }
                })}
                className="w-full px-2 py-1 bg-zinc-700 text-white rounded text-sm"
              />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-zinc-600">
            <p className="text-white text-xs">
              Current Model: {config.ollama.model}
            </p>
            <p className="text-white text-xs">
              Base URL: {config.ollama.baseUrl}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
