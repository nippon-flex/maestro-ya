'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ImagePlus, Loader2, MapPin, FileText, Zap, 
  X, Upload, CheckCircle2, ArrowRight 
} from 'lucide-react';

const CATEGORIES = [
  { id: 1, name: 'Plomería', icon: '🚰', gradient: 'from-blue-500 to-cyan-500' },
  { id: 2, name: 'Electricidad', icon: '⚡', gradient: 'from-yellow-500 to-orange-500' },
  { id: 3, name: 'Carpintería', icon: '🔨', gradient: 'from-amber-500 to-orange-600' },
  { id: 4, name: 'Pintura', icon: '🎨', gradient: 'from-pink-500 to-rose-500' },
  { id: 5, name: 'Albañilería', icon: '🧱', gradient: 'from-gray-500 to-gray-700' },
  { id: 6, name: 'Cerrajería', icon: '🔐', gradient: 'from-purple-500 to-indigo-500' },
  { id: 7, name: 'Climatización', icon: '❄️', gradient: 'from-cyan-500 to-blue-500' },
  { id: 8, name: 'Limpieza', icon: '✨', gradient: 'from-green-500 to-emerald-500' },
];

export default function NewRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Quito');
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < Math.min(files.length, 3 - photos.length); i++) {
        const file = files[i];

        // Obtener URL firmada
        const signRes = await fetch('/api/upload/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
          }),
        });

        if (!signRes.ok) {
          console.error('Error obteniendo URL de subida');
          continue;
        }

        const { uploadUrl, publicUrl } = await signRes.json();

        // Subir a R2
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadRes.ok) {
          console.error('Error subiendo archivo');
          continue;
        }

        console.log('✅ Foto subida:', publicUrl);
        uploadedUrls.push(publicUrl);
      }

      setPhotos((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Error subiendo fotos:', error);
      alert('Error subiendo fotos. Intenta de nuevo.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId || !description || !street || !city) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Enviando solicitud con fotos:', photos);

      const res = await fetch('/api/requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: parseInt(categoryId),
          description,
          street,
          city,
          photos: photos.length > 0 ? photos : null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error creando solicitud');
      }

      const { requestId, matchedProsCount } = await res.json();

      alert(
        `✅ ¡Solicitud creada con éxito!\n\n` +
        `Se notificó a ${matchedProsCount} maestro(s).\n` +
        `Recibirás cotizaciones pronto.`
      );

      router.push('/dashboard/customer');
      router.refresh();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error creando solicitud');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find(c => c.id.toString() === categoryId);

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Categoría */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Categoría</h2>
              <p className="text-gray-400 text-sm">Selecciona el tipo de servicio</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id.toString())}
                className={`group relative p-6 rounded-2xl border-2 transition-all ${
                  categoryId === cat.id.toString()
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${cat.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform text-2xl`}>
                  {cat.icon}
                </div>
                <div className="text-white font-bold text-center text-sm">
                  {cat.name}
                </div>
                {categoryId === cat.id.toString() && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Descripción</h2>
              <p className="text-gray-400 text-sm">¿Qué necesitas?</p>
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ejemplo: Tengo una fuga de agua en el baño, debajo del lavabo. Necesito que revisen y reparen urgente."
            rows={5}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-all resize-none"
          />
        </div>
      </div>

      {/* Ubicación */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Ubicación</h2>
              <p className="text-gray-400 text-sm">¿Dónde es el trabajo?</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                Calle y número
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Av. 10 de Agosto N24-253"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Ciudad
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-pink-500 focus:outline-none transition-all"
              >
                <option value="Quito" className="bg-gray-900">Quito</option>
                <option value="Guayaquil" className="bg-gray-900">Guayaquil</option>
                <option value="Cuenca" className="bg-gray-900">Cuenca</option>
                <option value="Ambato" className="bg-gray-900">Ambato</option>
                <option value="Manta" className="bg-gray-900">Manta</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Fotos */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <ImagePlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Fotos (opcional)</h2>
              <p className="text-gray-400 text-sm">Hasta 3 fotos - {photos.length}/3</p>
            </div>
          </div>

          <div className="space-y-4">
            {photos.length < 3 && (
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhotos}
                />
                <div className="group cursor-pointer border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-green-500/50 hover:bg-white/5 transition-all">
                  {uploadingPhotos ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
                      <p className="text-white font-semibold">Subiendo fotos...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-12 h-12 text-green-400 group-hover:scale-110 transition-transform" />
                      <p className="text-white font-semibold">Haz clic para subir fotos</p>
                      <p className="text-gray-400 text-sm">JPG, PNG - Max 5MB cada una</p>
                    </div>
                  )}
                </div>
              </label>
            )}

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {photos.map((url, idx) => (
                  <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-green-500/30">
                    <img 
                      src={url} 
                      alt={`Foto ${idx + 1}`} 
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform" 
                    />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-white text-xs font-bold">Foto {idx + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1 px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading || !categoryId || !description || !street || !city}
          className="group relative flex-1"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur opacity-75 group-hover:opacity-100 transition"></div>
          <div className="relative px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black rounded-full shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                Crear Solicitud
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </div>
        </button>
      </div>
    </form>
  );
}