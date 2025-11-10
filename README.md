# 🚀 Maestro-Ya

> Marketplace estilo Uber/inDrive para servicios profesionales del hogar en Ecuador

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Demo](#-demo)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Flujo de Usuario](#-flujo-de-usuario)
- [Base de Datos](#-base-de-datos)
- [Próximas Funcionalidades](#-próximas-funcionalidades)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### Para Clientes
- ✅ Crear solicitudes de servicio con fotos
- ✅ Recibir cotizaciones de múltiples maestros
- ✅ Comparar precios y experiencia
- ✅ Aceptar la mejor cotización
- ✅ Ver mapa de maestros cercanos
- ✅ Calculadora de presupuesto estimado
- ✅ Modo urgente (respuesta en 5 min)
- ✅ Dashboard con estadísticas y actividad
- ✅ Garantía de 30 días

### Para Maestros
- ✅ Toggle Online/Offline (estilo Uber Driver)
- ✅ Ver oportunidades cercanas en tiempo real
- ✅ Enviar cotizaciones personalizadas
- ✅ Dashboard con ganancias y estadísticas
- ✅ Gráficas de ingresos mensuales
- ✅ Sistema de racha y bonos
- ✅ Verificación de antecedentes
- ✅ Perfil con reseñas

### Para Administradores
- ✅ Revisar y aprobar maestros
- ✅ Ver documentos de verificación
- ✅ Dashboard de métricas
- ✅ Gestión de usuarios

---

## 🛠️ Tecnologías

### Frontend
- **[Next.js 16](https://nextjs.org/)** - Framework React con Server Components
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilos utility-first
- **[Lucide Icons](https://lucide.dev/)** - Iconos modernos
- **[Recharts](https://recharts.org/)** - Gráficas y visualización de datos

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Endpoints serverless
- **[Clerk Auth](https://clerk.com/)** - Autenticación y gestión de usuarios
- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM type-safe para PostgreSQL
- **[Neon Postgres](https://neon.tech/)** - Base de datos serverless

### Infraestructura
- **[Vercel](https://vercel.com/)** - Hosting y CI/CD
- **[Cloudflare R2](https://www.cloudflare.com/products/r2/)** - Almacenamiento de imágenes
- **[GitHub](https://github.com/)** - Control de versiones

---

## 🌐 Demo

**🔗 App en Producción:** [maestro-ya.vercel.app](https://maestro-ya.vercel.app)

### Cuentas de Prueba

**Cliente:**
- Email: `easydropecuador@gmail.com`
- Clave: (solicitar al administrador)

**Maestro:**
- Email: `drparpado@gmail.com`
- Clave: (solicitar al administrador)

---

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm o pnpm
- Cuenta en [Clerk](https://clerk.com/)
- Cuenta en [Neon](https://neon.tech/)
- Cuenta en [Cloudflare](https://www.cloudflare.com/)

### Pasos

1. **Clonar el repositorio**

```bash
git clone https://github.com/nippon-flex/maestro-ya.git
cd maestro-ya