import React from 'react';
import { LogIn, Plus, Search, Eye, Download } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Entries = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Girişler</h1>
          <p className="text-gray-600">
            Salon giriş kayıtları ve ziyaret takibi
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => console.log('Yeni giriş ekle')}
        >
          Yeni Giriş
        </Button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <LogIn className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Girişler sayfası
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Bu sayfa yakında eklenecek.
        </p>
      </div>
    </div>
  );
};

export default Entries; 