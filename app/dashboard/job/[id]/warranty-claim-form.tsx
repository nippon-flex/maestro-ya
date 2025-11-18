'use client';

import { useState } from 'react';
import { Shield, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';

interface WarrantyClaimFormProps {
  jobId: number;
  onSuccess?: () => void;
}

export default function WarrantyClaimForm({ jobId, onSuccess }: WarrantyClaimFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newFiles].slice(0, 5)); // Máximo 5 fotos
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      console.log('📸 Subiendo foto:', file.name, file.type, file.size);

      // 1. Obtener URL firmada
      const signResponse = await fetch('/api/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type
        })
      });

      if (!signResponse.ok) {
        console.error('❌ Error al obtener URL firmada:', signResponse.status);
        throw new Error('Error al obtener URL de subida');
      }

      const { uploadUrl, fileUrl } = await signResponse.json();
      console.log('✅ URL firmada obtenida:', fileUrl);

      // 2. Subir archivo a R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        console.error('❌ Error al subir a R2:', uploadResponse.status);
        throw new Error('Error al subir archivo');
      }

      console.log('✅ Foto subida exitosamente:', fileUrl);
      // 3. Retornar URL pública
      return fileUrl;
    } catch (error) {
      console.error('❌ Error en uploadPhoto:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      // Subir fotos a R2
      let photosUrls: string[] = [];
      
      if (photos.length > 0) {
        console.log('📤 Subiendo', photos.length, 'fotos...');
        const uploadPromises = photos.map(photo => uploadPhoto(photo));
        const results = await Promise.all(uploadPromises);
        
        // Filtrar nulls y undefined
        photosUrls = results.filter((url): url is string => url !== null && url !== undefined);
        
        console.log('✅ Fotos subidas:', photosUrls.length, 'de', photos.length);
        console.log('📋 URLs:', photosUrls);
      }

      // Crear reclamo
      console.log('📝 Creando reclamo con datos:', {
        jobId,
        description,
        photosUrls
      });

      const response = await fetch('/api/warranty-claims/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          description,
          photosUrls: photosUrls.length > 0 ? photosUrls : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Error al crear reclamo:', data);
        throw new Error(data.error || 'Error al crear reclamo');
      }

      console.log('✅ Reclamo creado exitosamente:', data);
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setDescription('');
        setPhotos([]);
        setSuccess(false);
        onSuccess?.();
      }, 2000);

    } catch (err: any) {
      console.error('❌ Error general:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all">
          <Shield className="w-5 h-5" />
          Reclamar Garantía
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-2xl w-full">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl"></div>
        
        {/* Modal */}
        <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Reclamar Garantía</h2>
                <p className="text-sm text-gray-400">Describe el problema con el trabajo</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-green-500 font-semibold">¡Reclamo enviado!</p>
                <p className="text-sm text-green-400">Un administrador lo revisará pronto</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Descripción del Problema *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                placeholder="Describe detalladamente qué problema encontraste con el trabajo..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 resize-none"
              />
            </div>

            {/* Photos Upload */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Fotos del Problema (Opcional - Máx. 5)
              </label>
              
              {photos.length < 5 && (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-colors">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm font-medium">Click para subir fotos</span>
                      <span className="text-xs">PNG, JPG hasta 5MB</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}

              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading || !description.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Enviando...' : 'Enviar Reclamo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}