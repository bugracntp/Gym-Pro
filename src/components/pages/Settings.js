import React from 'react';
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Settings = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
          <p className="text-gray-600">
            Sistem ayarları ve konfigürasyon
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={<RefreshCw size={16} />}
            onClick={() => console.log('Varsayılana döndür')}
          >
            Varsayılan
          </Button>
          <Button
            variant="primary"
            icon={<Save size={16} />}
            onClick={() => console.log('Kaydet')}
          >
            Kaydet
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Ayarlar sayfası
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Bu sayfa yakında eklenecek.
        </p>
      </div>
    </div>
  );
};

export default Settings; 