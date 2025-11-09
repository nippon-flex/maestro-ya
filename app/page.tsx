import Link from 'next/link';
import { 
  Zap, Shield, Clock, Star, Award, Sparkles,
  Wrench, Paintbrush, Hammer, Droplets, Lightbulb, Plug,
  ArrowRight, CheckCircle2, Users, TrendingUp, CircuitBoard, Boxes
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-cyan-900">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000,transparent)]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10">
          {/* Badge Animado */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-xl border border-purple-500/30 rounded-full px-6 py-3 mb-8 animate-slide-down shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-white text-sm font-bold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
              +500 maestros verificados • Respuesta en 15min
            </span>
            <Zap className="w-5 h-5 text-cyan-400 animate-bounce-slow" />
          </div>

          {/* Main Heading con efecto neón */}
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight animate-slide-up">
            Maestros a tu
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-gradient bg-[length:200%_200%]">
                puerta
              </span>
              <span className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 blur-2xl opacity-50 animate-pulse-slow"></span>
            </span>
            <br />
            <span className="text-5xl md:text-7xl bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              en minutos ⚡
            </span>
          </h1>

          <p className="text-xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto font-light animate-slide-up animation-delay-200">
            <span className="font-bold text-white">Como Uber</span>, pero para arreglar tu casa. 
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-bold"> Compara precios</span> y 
            <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent font-bold"> elige al mejor</span>.
          </p>

          {/* CTA Buttons Mejorados */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-slide-up animation-delay-400">
            <Link 
              href="/sign-up"
              className="group relative w-full sm:w-auto"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse-slow"></div>
              <div className="relative px-10 py-5 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 text-white font-black text-xl rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110">
                <span className="flex items-center justify-center gap-3">
                  Solicitar Servicio GRATIS
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </div>
            </Link>

            <Link 
              href="/sign-up"
              className="group w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-xl border-2 border-white/20 text-white font-bold text-xl rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              <span className="flex items-center justify-center gap-2">
                <Wrench className="w-5 h-5" />
                Soy Maestro Pro
              </span>
            </Link>
          </div>

          {/* Stats Mejorados */}
          <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto animate-scale-in animation-delay-600">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
                <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">500+</div>
                <div className="text-gray-300 font-semibold">Maestros Pro</div>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
                <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">15min</div>
                <div className="text-gray-300 font-semibold">Respuesta</div>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-yellow-500/50 transition-all">
                <div className="text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-1">
                  4.8<Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-gray-300 font-semibold">Calificación</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Como Funciona - ULTRA VISUAL */}
      <section className="relative py-32 bg-gradient-to-b from-black via-purple-950/20 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-6 py-2 rounded-full">
                SIMPLE Y RÁPIDO
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                3 pasos
              </span>
              <br />
              para resolver tu problema
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse-slow"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-3xl p-10 hover:border-cyan-500/60 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-[0_0_30px_rgba(6,182,212,0.5)] animate-float">
                  1
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                  <Wrench className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">
                  Describe
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Di qué necesitas. Sube fotos. Toma <span className="text-cyan-400 font-bold">30 segundos</span>.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse-slow animation-delay-2000"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-3xl p-10 hover:border-purple-500/60 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-float animation-delay-2000">
                  2
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">
                  Compara
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Maestros envían precio. Elige el <span className="text-purple-400 font-bold">mejor</span> y más <span className="text-pink-400 font-bold">barato</span>.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse-slow animation-delay-4000"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-pink-500/30 rounded-3xl p-10 hover:border-pink-500/60 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_0_50px_rgba(236,72,153,0.3)]">
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-[0_0_30px_rgba(236,72,153,0.5)] animate-float animation-delay-4000">
                  3
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-700 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(236,72,153,0.4)]">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">
                  ¡Listo!
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  El maestro llega. Arregla todo. <span className="text-pink-400 font-bold">Pagas al final</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías ULTRA MODERNAS */}
      <section className="relative py-32 bg-gradient-to-b from-black via-cyan-950/10 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
              Todos los servicios
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                que necesitas
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="group relative cursor-pointer"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`absolute -inset-1 bg-gradient-to-r ${cat.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`}></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8 hover:border-white/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                  <div className={`w-20 h-20 bg-gradient-to-br ${cat.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">{cat.name}</h3>
                  <p className="text-cyan-400 text-sm font-bold">{cat.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios con efectos NEÓN */}
      <section className="relative py-32 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
              ¿Por qué
              <span className="relative inline-block mx-4">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Maestro-Ya
                </span>
                <span className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 blur-2xl opacity-30 animate-pulse-slow"></span>
              </span>
              ?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                    {benefit.icon}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4">{benefit.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final EXPLOSIVO */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 animate-gradient bg-[length:200%_200%]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 z-10">
          <div className="inline-block mb-8 animate-bounce-slow">
            <Zap className="w-24 h-24 text-yellow-300 drop-shadow-[0_0_30px_rgba(253,224,71,0.8)]" />
          </div>
          
          <h2 className="text-5xl md:text-8xl font-black text-white mb-8 leading-tight drop-shadow-2xl">
            ¿Listo para empezar?
          </h2>
          <p className="text-2xl md:text-3xl text-white/90 mb-12 font-light">
            Únete a <span className="font-black">miles de ecuatorianos</span> que ya confían en nosotros
          </p>
          
          <Link 
            href="/sign-up"
            className="group inline-block relative"
          >
            <div className="absolute -inset-2 bg-white rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse-slow"></div>
            <div className="relative px-12 py-6 bg-white text-purple-600 font-black text-2xl rounded-full shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-110 flex items-center gap-4">
              <Sparkles className="w-8 h-8 animate-pulse" />
              Comenzar GRATIS Ahora
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Footer minimalista */}
      <footer className="bg-black border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500">
            © 2025 Maestro-Ya. Hecho con ❤️ en Ecuador
          </p>
        </div>
      </footer>
    </div>
  );
}

const categories = [
  { name: 'Electricidad', count: '120+ pros', icon: <Plug className="w-10 h-10 text-white" />, gradient: 'from-yellow-400 to-orange-500' },
  { name: 'Plomería', count: '95+ pros', icon: <Droplets className="w-10 h-10 text-white" />, gradient: 'from-blue-400 to-cyan-500' },
  { name: 'Albañilería', count: '150+ pros', icon: <Hammer className="w-10 h-10 text-white" />, gradient: 'from-gray-400 to-gray-600' },
  { name: 'Pintura', count: '80+ pros', icon: <Paintbrush className="w-10 h-10 text-white" />, gradient: 'from-pink-400 to-rose-500' },
  { name: 'Carpintería', count: '70+ pros', icon: <Wrench className="w-10 h-10 text-white" />, gradient: 'from-amber-500 to-orange-600' },
  { name: 'Refrigeración', count: '45+ pros', icon: <Zap className="w-10 h-10 text-white" />, gradient: 'from-cyan-400 to-blue-500' },
  { name: 'Cerrajería', count: '60+ pros', icon: <Shield className="w-10 h-10 text-white" />, gradient: 'from-purple-400 to-indigo-500' },
  { name: 'Jardinería', count: '55+ pros', icon: <Lightbulb className="w-10 h-10 text-white" />, gradient: 'from-green-400 to-emerald-500' },
];

const benefits = [
  {
    icon: <Shield className="w-8 h-8 text-white" />,
    title: '100% Verificados',
    description: 'Todos pasan verificación de antecedentes penales. Cero riesgos.'
  },
  {
    icon: <Clock className="w-8 h-8 text-white" />,
    title: 'Super Rápido',
    description: 'Cotizaciones en menos de 15 minutos. El maestro llega el mismo día.'
  },
  {
    icon: <Award className="w-8 h-8 text-white" />,
    title: 'Garantía Total',
    description: 'Si algo sale mal, lo arreglamos gratis. 30 días de garantía.'
  },
];