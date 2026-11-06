# Uhvg856/Qwen-Image-Edit-2511-Multiple-Angles-LoRA

## Resumen

Qwen-Image-Edit-2511-Multiple-Angles-LoRA es un adaptador LoRA de control de cámara desarrollado por el usuario Uhvg856 (con apoyo de fal.ai) sobre el modelo base Qwen/Qwen-Image-Edit-2511. Su función es permitir la regeneración de una misma imagen desde 96 posiciones de cámara predefinidas, combinando cuatro elevaciones, ocho acimuts y tres distancias, mediante un prompt estructurado. Resuelve el problema del control preciso de punto de vista en edición de imagen, algo que el modelo base solo aborda de forma aproximada.

El adaptador se entrenó sobre más de 3000 pares de imágenes generadas con Gaussian Splatting, lo que aporta coherencia 3D a los resultados. Se distribuye como LoRA compatible con la librería diffusers, con un tamaño de repositorio de 0,3 GB y licencia Apache 2.0. Está etiquetado únicamente para inglés y su pipeline es image-to-image.

Es relevante ahora porque el control explícito de cámara es una necesidad recurrente en pipelines de generación de assets 3D, turntables de producto y previsualización cinematográfica, y este es el primer LoRA de múltiples ángulos publicado para Qwen-Image-Edit-2511 según su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base de difusión Qwen-Image-Edit-2511 (no se detalla la arquitectura interna del adaptador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato estándar de LoRA en diffusers; no confirmado explícitamente en la información) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre el modelo de edición de imagen Qwen-Image-Edit-2511, que actúa como base congelada. No se especifica en la información disponible la arquitectura interna del modelo base ni la configuración del adaptador (rango, alpha, módulos objetivo). El pipeline declarado es image-to-image y la librería de referencia es diffusers.

El entrenamiento se realizó sobre más de 3000 pares de imágenes generadas mediante Gaussian Splatting, una técnica de representación 3D que garantiza consistencia espacial entre vistas. Esta elección de datos es la innovación técnica principal: al derivar los pares de renders 3D-consistentes, el LoRA aprende transformaciones de punto de vista geométricamente coherentes en lugar de meras correlaciones 2D. La model card indica que se realizaron más iteraciones y comprobaciones de calidad que en versiones previas, y destaca el soporte específico para ángulos bajos (-30°). No se detalla si hubo RLHF, DPO ni el número de pasos de entrenamiento.

## Capacidades

- Edición de imagen con control explícito de posición de cámara mediante el prefijo `<sks>` seguido de descriptores de acimut, elevación y distancia.
- Cobertura de 96 poses: 8 acimuts (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°), 4 elevaciones (-30°, 0°, 30°, 60°) y 3 distancias (close-up ×0.6, medium shot ×1.0, wide shot ×1.8).
- Soporte específico y correcto de ángulos bajos (-30°), que la model card señala como punto fuerte frente al modelo base.
- Generación de vistas coherentes de un mismo sujeto a partir de una imagen de referencia, útil para turntables y órbitas de cámara.
- Capacidad de animación de cámara (la model card incluye GIFs de resultados de animación).
- Integración con diffusers y con la plataforma fal.ai.
- Idioma de prompt: inglés (único idioma declarado).
- No se declaran capacidades de tool calling, agentes, texto, código ni matemáticas: es un adaptador exclusivamente de imagen.

## Casos de uso

- Turntables de producto: dado un render o foto de un objeto, se generan las 8 vistas acimutales a distancia medium shot para montar una rotación de 360° en una ficha de e-commerce, aprovechando la consistencia 3D de los datos de entrenamiento.
- Assets para videojuegos: generación de vistas de giro (turnaround) de personajes u objetos desde una única referencia, con control de elevación para cubrir vistas cenitales y a nivel de suelo.
- Previsualización cinematográfica: simulación de movimientos de cámara (low-angle, high-angle, wide shot) sobre un storyboard o frame de referencia para explorar encuadres antes de rodar.
- Reconstrucción y aumento de datasets 3D: generación de vistas sintéticas adicionales de un objeto para complementar capturas reales en pipelines de fotogrametría o Gaussian Splatting, usando las distancias close-up y wide shot para cubrir escalas.
- Ilustración y concept art: exploración rápida de puntos de vista de una escena o personaje manteniendo la identidad visual del sujeto entre vistas, gracias a la edición image-to-image sobre la referencia.
- Catálogos inmobiliarios o de mobiliario: generación de vistas alternativas de una estancia u objeto desde ángulos elevados y frontales para enriquecer fichas sin sesión fotográfica adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio del LoRA ocupa 0,3 GB, pero la inferencia requiere cargar además el modelo base Qwen-Image-Edit-2511, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base, no especificado.
- Opciones de despliegue: diffusers (librería declarada) y fal.ai (plataforma citada en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusión de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Control de cámara | Pares de entrenamiento | Contexto/poses | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Image-Edit-2511-Multiple-Angles-LoRA (Uhvg856) | LoRA sobre Qwen-Image-Edit-2511 | 96 poses (4 elevaciones × 8 acimuts × 3 distancias) | 3000+ (Gaussian Splatting) | 96 poses | apache-2.0 | Hugging Face, fal.ai |
| Qwen-Image-Edit-2511 (base) | Modelo de edición de imagen | Capacidades de punto de vista integradas, sin control preciso por pose | no disponible | no disponible | no disponible en la información | Hugging Face |
| Qwen-Image-Edit-2511-Multiple-Angles-LoRA (aoiandroid) | LoRA sobre Qwen-Image-Edit-2511 | Mismas 96 poses (aparente réplica o espejo del repositorio) | 3000+ | 96 poses | no disponible en la información | Hugging Face |
| Qwen-Image Edit 2511 Multiple Angles (Layer) | Integración alojada del LoRA con controles de órbita | Rotación horizontal, inclinación vertical y zoom | no disponible | no disponible | no disponible | Layer |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo frente a estas alternativas.

## Limitaciones y advertencias

- El adaptador solo está etiquetado para inglés; los prompts en otros idiomas pueden degradar el control de cámara.
- El control se limita a las 96 poses predefinidas; no hay evidencia de interpolación continua entre ángulos.
- El repositorio es muy reciente y sin descargas ni likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- Existe al menos otro repositorio con el mismo nombre y descripción (aoiandroid) y una integración de terceros (Layer); conviene verificar la procedencia y los pesos exactos antes de usarlo en producción.
- Riesgo de alucinación visual: como todo modelo de difusión, puede inventar detalles no presentes en la imagen de referencia al cambiar de punto de vista, especialmente en zonas ocluidas.
- La calidad depende fuertemente del modelo base Qwen-Image-Edit-2511, cuyas limitaciones y licencia deben evaluarse por separado.
- Aunque la licencia del LoRA es Apache 2.0, el uso comercial está condicionado por la licencia del modelo base, no detallada en la información disponible.
- No se documentan sesgos específicos del adaptador; al heredar los del modelo base, pueden aparecer sesgos de representación en sujetos y escenas.
- No hay información sobre cuantizaciones, latencia ni requisitos de VRAM, lo que dificulta planificar el despliegue.

## Enlaces

- Hugging Face (repositorio principal): https://huggingface.co/Uhvg856/Qwen-Image-Edit-2511-Multiple-Angles-LoRA
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Repositorio con nombre idéntico (aoiandroid): https://huggingface.co/aoiandroid/Qwen-Image-Edit-2511-Multiple-Angles-LoRA
- Documentación de la integración en Layer: https://layer.ai/docs/models/qwen-qwen-image-edit-2511-multiple-angles
- fal.ai: https://fal.ai
