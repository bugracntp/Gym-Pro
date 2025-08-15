import React from 'react';
import { Dumbbell, Plus, Search, Edit, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Programs = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programlar</h1>
          <p className="text-gray-600">
            Antrenman programları ve egzersiz planları
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => console.log('Yeni program ekle')}
        >
          Yeni Program
        </Button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Programlar sayfası
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Bu sayfa yakında eklenecek.
        </p>
      </div>
    </div>
  );
};

export default Programs; 