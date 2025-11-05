import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Hammer, 
  Wrench, 
  Zap, 
  Paintbrush, 
  Scissors, 
  Sparkles, 
  Leaf, 
  Key,
  CheckCircle2,
  Shield,
  Star,
  Clock,
  MapPin,
  DollarSign,
  Users,
  AlertCircle,
  TrendingUp,
  Award,
  Phone,
  MessageCircle,
  BadgeCheck,
  XCircle
} from "lucide-react";

export default function LandingPage() {
  const categories = [
    { name: "Albañilería", icon: Hammer, slug: "albanileria", color: "bg-orange-50 hover:bg-orange-100" },
    { name: "Plomería", icon: Wrench, slug: "plomeria", color: "bg-blue-50 hover:bg-blue-100" },
    { name: "Electricidad", icon: Zap, slug: "electricidad", color: "bg-yellow-50 hover:bg-yellow-100" },
    { name: "Pintura", icon: Paintbrush, slug: "pintura", color: "bg-purple-50 hover:bg-purple-100" },
    { name: "Carpintería", icon: Scissors, slug: "carpinteria", color: "bg-amber-50 hover:bg-amber-100" },
    { name: "Limpieza", icon: Sparkles, slug: "limpieza", color: "bg-cyan-50 hover:bg-cyan-100" },
    { name: "Jardinería", icon: Leaf, slug: "jardineria", color: "bg-green-50 hover:bg-green-100" },
    { name: "Cerrajería", icon: Key, slug: "cerrajeria", color: "bg-gray-50 hover:bg-gray-100" },
  ];

  const problems = [
    {
      icon: XCircle,
      title: "El maestro nunca llegó",
      description: "Quedó en venir el lunes... y sigues esperando."
    },
    {
      icon: DollarSign,
      title: "Te cobraron el doble",
      description: "No sabías el precio real y terminaste pagando de más."
    },
    {
      icon: AlertCircle,
      title: "Trabajo mal hecho",
      description: "A las 2 semanas ya hay filtraciones o fallas."
    },
    {
      icon: Phone,
      title: "No contesta después",
      description: "Una vez que cobró, desapareció del mapa."
    }
  ];

  const testimonials = [
    {
      name: "María González",
      location: "Quito Norte",
      service: "Plomería",
      rating: 5,
      text: "Tenía una fuga urgente un domingo. Publiqué la solicitud y en 20 minutos tenía 3 cotizaciones. El maestro llegó en 2 horas y resolvió todo. ¡Increíble!",
      avatar: "MG",
      price: "$45"
    },
    {
      name: "Carlos Méndez",
      location: "Valle de los Chillos",
      service: "Electricidad",
      rating: 5,
      text: "Comparé 5 ofertas para instalar luces LED. Ahorré $120 vs. lo que me cotizaron antes. El trabajo quedó perfecto y con garantía.",
      avatar: "CM",
      price: "$280"
    },
    {
      name: "Andrea Ruiz",
      location: "Cumbayá",
      service: "Pintura",
      rating: 5,
      text: "Necesitaba pintar mi casa antes de mudarme. Los maestros se peleaban por el trabajo (en el buen sentido 😄). Elegí al mejor calificado y quedé fascinada.",
      avatar: "AR",
      price: "$650"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section - Ataca el DOLOR */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-red-900 rounded-full px-5 py-2.5 mb-8 font-bold shadow-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">¿CANSADO DE MAESTROS QUE NO LLEGAN?</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Ya No Más Maestros<br />
              <span className="text-yellow-300">Que Te Dejan Plantado</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-red-100 mb-4 max-w-3xl mx-auto leading-relaxed">
              Encuentra maestros <span className="font-bold underline">verificados y cercanos</span> en minutos.
            </p>
            <p className="text-lg sm:text-xl text-red-200 mb-10 max-w-3xl mx-auto">
              Recibe hasta <span className="font-bold text-yellow-300">5 cotizaciones</span>, compara precios, 
              elige al mejor y <span className="font-bold">ahorra hasta 40%</span>. Con garantía de 30 días.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/sign-up">
                <Button size="lg" className="text-xl px-12 py-8 bg-yellow-400 text-red-900 hover:bg-yellow-300 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 font-bold">
                  <Users className="w-6 h-6 mr-2" />
                  Publicar Mi Solicitud GRATIS
                </Button>
              </Link>
              <Link href="/sign-up">
<Button size="lg" className="text-xl px-12 py-8 bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-red-700 shadow-2xl transition-all font-bold">                  Soy Maestro - Quiero Trabajos
                </Button>
              </Link>
            </div>

            {/* Proof */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-red-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span>100% Gratis para clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span>Sin permanencia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span>Respuesta en minutos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
              ¿Te Ha Pasado Esto?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sabemos lo <span className="font-bold text-red-600">frustrante</span> que es buscar un maestro confiable...
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((problem) => {
              const Icon = problem.icon;
              return (
                <Card key={problem.title} className="p-6 bg-white border-2 border-red-100 hover:border-red-300 transition-all">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-red-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{problem.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{problem.description}</p>
                </Card>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-block bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-4 rounded-2xl shadow-xl">
              <p className="text-2xl font-bold mb-2">¡Ya No Más!</p>
              <p className="text-lg">Con Maestro-Ya, TODO esto se acabó</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
              La Solución Es Simple
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              En lugar de <span className="line-through text-red-500">rogar</span> a UN maestro que venga,
              ahora <span className="font-bold text-green-600">ellos compiten por tu trabajo</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mb-6 shadow-2xl transform hover:scale-110 transition-transform">
                  <span className="text-4xl font-bold text-white">1</span>
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900">Publicas en 2 Minutos</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Describe qué necesitas, sube 2-3 fotos y tu ubicación.
                  <span className="block mt-2 font-semibold text-blue-600">
                    ¡Y listo! Nosotros hacemos el resto.
                  </span>
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-700 rounded-3xl flex items-center justify-center mb-6 shadow-2xl transform hover:scale-110 transition-transform">
                  <span className="text-4xl font-bold text-white">2</span>
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900">Ellos Te Buscan</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Maestros <span className="font-semibold">verificados y cercanos</span> reciben tu solicitud.
                  <span className="block mt-2 font-semibold text-green-600">
                    En minutos empiezan a cotizar (¡compitiendo por ti!)
                  </span>
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl flex items-center justify-center mb-6 shadow-2xl transform hover:scale-110 transition-transform">
                  <span className="text-4xl font-bold text-white">3</span>
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900">Tú Decides</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Comparas precio, reseñas y experiencia.
                  <span className="block mt-2 font-semibold text-purple-600">
                    Eliges al mejor y pagas solo al terminar. Con garantía.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
              Casos Reales de Quito
            </h2>
            <p className="text-xl text-gray-600">
              Esto es lo que nuestros clientes están diciendo...
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="p-6 bg-white shadow-lg hover:shadow-2xl transition-all border-2 border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed mb-4 italic">
                  "{testimonial.text}"
                </p>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500 font-medium">{testimonial.service}</span>
                  <span className="text-lg font-bold text-green-600">{testimonial.price}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
              Todos los Servicios
            </h2>
            <p className="text-xl text-gray-600">
              Maestros profesionales en cada categoría
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Card 
                  key={cat.slug}
                  className={`p-8 text-center hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-blue-400 transform hover:scale-105 ${cat.color}`}
                >
                  <Icon className="w-14 h-14 mx-auto mb-4 text-gray-700" strokeWidth={1.5} />
                  <h3 className="font-bold text-xl text-gray-900">{cat.name}</h3>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guarantees Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
              Garantías Que Protegen Tu Inversión
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-green-50 border-2 border-green-200">
              <Shield className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-bold text-lg mb-2">30 Días de Garantía</h3>
              <p className="text-gray-600 text-sm">En TODOS los trabajos sin excepción</p>
            </Card>

            <Card className="p-6 text-center bg-blue-50 border-2 border-blue-200">
              <BadgeCheck className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-bold text-lg mb-2">100% Verificados</h3>
              <p className="text-gray-600 text-sm">Cédula y antecedentes penales revisados</p>
            </Card>

            <Card className="p-6 text-center bg-purple-50 border-2 border-purple-200">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-bold text-lg mb-2">Paga Al Finalizar</h3>
              <p className="text-gray-600 text-sm">No anticipos. Solo pagas si quedas satisfecho</p>
            </Card>

            <Card className="p-6 text-center bg-yellow-50 border-2 border-yellow-200">
              <Star className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="font-bold text-lg mb-2">Reseñas Reales</h3>
              <p className="text-gray-600 text-sm">De clientes verificados que ya contrataron</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <Award className="w-20 h-20 mx-auto mb-6 text-yellow-300" />
          <h2 className="text-4xl sm:text-6xl font-bold mb-6">
            ¿Listo Para Resolver Tu Problema?
          </h2>
          <p className="text-2xl text-green-100 mb-4 leading-relaxed">
            Únete a <span className="font-bold text-yellow-300">2,847 clientes</span> que ya encontraron su maestro ideal
          </p>
          <p className="text-lg text-green-200 mb-10">
            Publicar tu solicitud toma menos de 2 minutos y es 100% GRATIS
          </p>
          
          <Link href="/sign-up">
            <Button size="lg" className="text-2xl px-16 py-10 bg-yellow-400 text-green-900 hover:bg-yellow-300 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 font-bold">
              <CheckCircle2 className="w-7 h-7 mr-3" />
              Publicar Mi Solicitud Ahora
            </Button>
          </Link>

          <p className="mt-8 text-green-100 text-sm">
            ⚡ En promedio, recibes la primera cotización en <span className="font-bold">12 minutos</span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-white font-bold text-2xl mb-4 flex items-center gap-2">
                <Hammer className="w-6 h-6 text-yellow-400" />
                Maestro-Ya
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                La plataforma #1 para conectar clientes con maestros profesionales verificados en Ecuador. 
                Rápido, seguro y confiable.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm bg-green-900/30 px-3 py-1.5 rounded-full">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Verificado</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-yellow-900/30 px-3 py-1.5 rounded-full">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>Garantizado</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-blue-900/30 px-3 py-1.5 rounded-full">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>+500 Maestros</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/terminos" className="hover:text-white transition-colors hover:underline">Términos y Condiciones</Link></li>
                <li><Link href="/privacidad" className="hover:text-white transition-colors hover:underline">Política de Privacidad</Link></li>
                <li><Link href="/garantia" className="hover:text-white transition-colors hover:underline">Garantía de 30 días</Link></li>
                <li><Link href="/ayuda" className="hover:text-white transition-colors hover:underline">Centro de Ayuda</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">Contacto</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Quito, Ecuador</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>soporte@maestro-ya.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Pagos en USD</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>Lun-Dom: 6am-10pm</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                &copy; 2025 Maestro-Ya. Todos los derechos reservados.
              </p>
              <p className="text-sm text-gray-500">
                Hecho con ❤️ en Ecuador 🇪🇨
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}