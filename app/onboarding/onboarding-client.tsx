"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Hammer, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  clerkId: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

export default function OnboardingClient({ userData }: { userData: UserData }) {
  const router = useRouter();
  const [step, setStep] = useState<"choose" | "customer" | "pro">("choose");
  const [loading, setLoading] = useState(false);

  // Customer form
  const [customerName, setCustomerName] = useState(
    `${userData.firstName} ${userData.lastName}`.trim()
  );
  const [customerPhoto, setCustomerPhoto] = useState<File | null>(null);

  // Pro form
  const [proData, setProData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    bio: "",
    experienceYears: "",
    coverageKm: "10",
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [documents, setDocuments] = useState<{
    cedulaFront: File | null;
    cedulaBack: File | null;
    antecedentes: File | null;
  }>({
    cedulaFront: null,
    cedulaBack: null,
    antecedentes: null,
  });

  const categories = [
    { slug: "albanileria", name: "Albañilería" },
    { slug: "plomeria", name: "Plomería" },
    { slug: "electricidad", name: "Electricidad" },
    { slug: "pintura", name: "Pintura" },
    { slug: "carpinteria", name: "Carpintería" },
    { slug: "limpieza", name: "Limpieza" },
    { slug: "jardineria", name: "Jardinería" },
    { slug: "cerrajeria", name: "Cerrajería" },
  ];

  const toggleCategory = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter((s) => s !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

  const handleCustomerSubmit = async () => {
    if (!customerName.trim()) {
      alert("Por favor ingresa tu nombre completo");
      return;
    }

    setLoading(true);

    try {
      let photoUrl = null;

      // Subir foto si existe
      if (customerPhoto) {
        const signResponse = await fetch("/api/upload/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: `customer-${userData.clerkId}-${Date.now()}.jpg`,
            fileType: customerPhoto.type,
          }),
        });

        const { uploadUrl, fileUrl } = await signResponse.json();

        await fetch(uploadUrl, {
          method: "PUT",
          body: customerPhoto,
          headers: { "Content-Type": customerPhoto.type },
        });

        photoUrl = fileUrl;
      }

      // Guardar en DB
      const response = await fetch("/api/onboarding/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: userData.clerkId,
          email: userData.email,
          phone: userData.phone,
          fullName: customerName,
          photoUrl,
        }),
      });

      if (!response.ok) throw new Error("Error al guardar");

      router.push("/dashboard/customer");
    } catch (error) {
      console.error(error);
      alert("Hubo un error. Por favor intenta de nuevo.");
      setLoading(false);
    }
  };

  const handleProSubmit = async () => {
    // Validaciones
    if (!proData.firstName.trim() || !proData.lastName.trim()) {
      alert("Por favor ingresa tu nombre completo");
      return;
    }

    if (!proData.experienceYears || parseInt(proData.experienceYears) < 0) {
      alert("Por favor ingresa años de experiencia válidos");
      return;
    }

    if (selectedCategories.length === 0) {
      alert("Por favor selecciona al menos una categoría");
      return;
    }

    if (!documents.cedulaFront || !documents.cedulaBack) {
      alert("Por favor sube ambos lados de tu cédula");
      return;
    }

    if (!documents.antecedentes) {
      alert("Por favor sube tu certificado de antecedentes penales");
      return;
    }

    setLoading(true);

    try {
      // Subir documentos
      const uploadDocument = async (file: File, type: string) => {
        const signResponse = await fetch("/api/upload/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: `pro-${userData.clerkId}-${type}-${Date.now()}.${file.name.split(".").pop()}`,
            fileType: file.type,
          }),
        });

        const { uploadUrl, fileUrl } = await signResponse.json();

        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        return fileUrl;
      };

      const cedulaFrontUrl = await uploadDocument(documents.cedulaFront, "cedula-front");
      const cedulaBackUrl = await uploadDocument(documents.cedulaBack, "cedula-back");
      const antecedentesUrl = await uploadDocument(documents.antecedentes, "antecedentes");

      // Guardar en DB
      const response = await fetch("/api/onboarding/pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: userData.clerkId,
          email: userData.email,
          phone: userData.phone,
          firstName: proData.firstName,
          lastName: proData.lastName,
          bio: proData.bio,
          experienceYears: parseInt(proData.experienceYears),
          coverageKm: parseInt(proData.coverageKm),
          categories: selectedCategories,
          documents: {
            cedulaFront: cedulaFrontUrl,
            cedulaBack: cedulaBackUrl,
            antecedentes: antecedentesUrl,
          },
        }),
      });

      if (!response.ok) throw new Error("Error al guardar");

      router.push("/dashboard/pro");
    } catch (error) {
      console.error(error);
      alert("Hubo un error. Por favor intenta de nuevo.");
      setLoading(false);
    }
  };

  // Pantalla de elección
  if (step === "choose") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ¡Bienvenido a Maestro-Ya! 👋
            </h1>
            <p className="text-xl text-gray-600">
              ¿Cómo deseas usar la plataforma?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Cliente */}
            <Card
              onClick={() => setStep("customer")}
              className="p-8 cursor-pointer hover:shadow-2xl transition-all border-4 border-transparent hover:border-blue-500"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Soy Cliente
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Necesito contratar servicios profesionales (plomería, electricidad, etc.)
                </p>
                <Button size="lg" className="w-full">
                  Continuar como Cliente
                </Button>
              </div>
            </Card>

            {/* Maestro */}
            <Card
              onClick={() => setStep("pro")}
              className="p-8 cursor-pointer hover:shadow-2xl transition-all border-4 border-transparent hover:border-green-500"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Hammer className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Soy Maestro
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Ofrezco servicios profesionales y quiero encontrar clientes
                </p>
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  Continuar como Maestro
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Formulario Cliente
  if (step === "customer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Completa tu Perfil
            </h1>
            <p className="text-gray-600">
              Solo necesitamos algunos datos básicos
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Juan Pérez"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="photo">Foto de Perfil (opcional)</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setCustomerPhoto(e.target.files?.[0] || null)}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Ayuda a los maestros a reconocerte
              </p>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleCustomerSubmit}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creando perfil...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Comenzar a Usar Maestro-Ya
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Formulario Maestro
  if (step === "pro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <Card className="max-w-3xl mx-auto p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hammer className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Registro de Maestro Profesional
            </h1>
            <p className="text-gray-600">
              Tu perfil será revisado por nuestro equipo en 24-48 horas
            </p>
          </div>

          <div className="space-y-8">
            {/* Datos Personales */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Datos Personales</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombres *</Label>
                  <Input
                    id="firstName"
                    value={proData.firstName}
                    onChange={(e) =>
                      setProData({ ...proData, firstName: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellidos *</Label>
                  <Input
                    id="lastName"
                    value={proData.lastName}
                    onChange={(e) =>
                      setProData({ ...proData, lastName: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Experiencia */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Experiencia</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Años de Experiencia *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={proData.experienceYears}
                    onChange={(e) =>
                      setProData({ ...proData, experienceYears: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="coverage">Radio de Cobertura (km) *</Label>
                  <Input
                    id="coverage"
                    type="number"
                    min="1"
                    max="50"
                    value={proData.coverageKm}
                    onChange={(e) =>
                      setProData({ ...proData, coverageKm: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="bio">Descripción de Servicios (opcional)</Label>
                <Textarea
                  id="bio"
                  value={proData.bio}
                  onChange={(e) =>
                    setProData({ ...proData, bio: e.target.value })
                  }
                  placeholder="Ej: Especializado en instalaciones eléctricas residenciales..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>

            {/* Categorías */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Categorías de Servicio * (selecciona al menos una)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => toggleCategory(cat.slug)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedCategories.includes(cat.slug)
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Documentos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Documentos de Verificación *
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cedulaFront">
                    Cédula (Frente) *
                  </Label>
                  <Input
                    id="cedulaFront"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setDocuments({
                        ...documents,
                        cedulaFront: e.target.files?.[0] || null,
                      })
                    }
                    className="mt-2"
                  />
                  {documents.cedulaFront && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {documents.cedulaFront.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cedulaBack">
                    Cédula (Reverso) *
                  </Label>
                  <Input
                    id="cedulaBack"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setDocuments({
                        ...documents,
                        cedulaBack: e.target.files?.[0] || null,
                      })
                    }
                    className="mt-2"
                  />
                  {documents.cedulaBack && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {documents.cedulaBack.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="antecedentes">
                    Certificado de Antecedentes Penales *
                  </Label>
                  <Input
                    id="antecedentes"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setDocuments({
                        ...documents,
                        antecedentes: e.target.files?.[0] || null,
                      })
                    }
                    className="mt-2"
                  />
                  {documents.antecedentes && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {documents.antecedentes.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Debe tener validez de al menos 3 meses
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t">
              <Button
                onClick={handleProSubmit}
                disabled={loading}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando documentos...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Enviar Solicitud de Aprobación
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                Revisaremos tu perfil en 24-48 horas y te notificaremos por email
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}