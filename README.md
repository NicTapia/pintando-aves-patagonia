# 🌲 Pintando Aves Patagonia — Museo Digital & Catálogo de Autor

¡Bienvenido a **Pintando Aves Patagonia**! Este es un sitio web interactivo e inmersivo diseñado para fusionar el arte cerámico artesanal con la divulgación de la biodiversidad nativa del sur de Chile. El proyecto está ambientado con una estética *premium, minimalista y editorial*, inspirada en los paisajes de la Patagonia chilena.

Nace con la inspiración de plasmar la pureza, el misterio y la belleza del sur desde **Pocohihuen, en la comuna de Cochamó**, permitiendo que las personas lleven un pedazo de la naturaleza directamente a sus hogares.

---

## 💎 Características Principales (Features)

* **Experiencia Atmosférica Dinámica:** Sistema de climatización en tiempo real que permite alternar entre el **Tema Sol** (estilo lino/crema limpio) y el **Tema Lluvia** (estilo grafito translúcido con caída de agua digital).
* **Diseño Glassmorphism Avanzado:** Tarjetas de productos y secciones con un caparazón de cristal unificado (`backdrop-filter: blur(12px)`), permitiendo que los colores del fondo se adivinen sutilmente sin perder legibilidad.
* **Catálogo Modular de Productos:** Galería responsiva filtrable (Tazas, Utensilios y la nueva línea de **Materos**) con soporte para carrusel de 5 imágenes de detalle por pieza única.
* **WhatsApp de Venta Inteligente:** Enlaces de consulta contextuales y dinámicos que pre-configuran un mensaje con el nombre exacto de la pieza consultada (ej: *"Hola, me interesa el Matero Chucao"*).
* **Enciclopedia de Aves de la Patagonia:** Directorio ampliado a 14 especies con ilustraciones transparentes y fichas poético-científicas, con la arquitectura preparada para la futura integración acústica.
* **Cursores Temáticos:** Interacción lúdica mediante cursores personalizados de aves (Lechuza y Martín Pescador) adaptables al contexto.

---

## 🛠️ Arquitectura y Tecnologías Utilizadas

El proyecto fue construido bajo buenas prácticas de rendimiento, optimización de renderizado (seguro para motores Chromium) y escalabilidad de datos:

* **HTML5 Semántico:** Estructura limpia e indexable.
* **CSS3 Avanzado (Modern Architecture):** * Variables CSS nativas (`--text-primary`, etc.) para el manejo fluido de temas (Sol/Lluvia).
    * Escalado tipográfico en cascada mediante unidad raíz (`html { font-size: 17.5px }`).
    * Diseño responsivo basado en CSS Grid y Flexbox simétricos.
    * Efectos de refracción de cristal (`contain`, `blur`, `saturate`).
* **JavaScript (Vanilla JS):** Motor nativo liviano para control de estados del Lightbox, manejo de eventos de video y lógica del cambio de interfaz.

---

## 📂 Estructura del Proyecto (Data Directory)

La organización de los recursos sigue un patrón de diseño limpio y mantenible, aislando el catálogo y la base de conocimiento:

```text
pintando-aves-patagonia/
├── assets/
│   ├── aves/          # Ilustraciones PNG del catálogo de aves (ave-1 a ave-14)
│   ├── galeria/       # Fotos principales y de detalle de tazas y materos (.png/.jpg)
│   ├── videos/        # Fondos atmosféricos optimizados para la interfaz
│   ├── logo.png       # Identidad visual de la marca
│   └── sobre-nosotros.png # Fotografía de la artista en Cochamó
├── index.html         # Estructura e inyección de datos semánticos
├── styles.css         # Hoja de estilos, variables y efectos glassmorphism
├── script.js          # Control de eventos, Lightbox y lógica de interfaz
└── README.md          # Documentación del proyecto
