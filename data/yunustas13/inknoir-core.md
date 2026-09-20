# YunusTAS13/InkNoir-Core

## Resumen

InkNoir-Core es un modelo de difusion latente para generacion de imagenes de texto a imagen, especializado en ilustracion anime oscura. Lo desarrolla el usuario YunusTAS13 y se distribuye en HuggingFace bajo licencia CreativeML OpenRAIL-M. Tecnicamente es un ajuste de Stable Diffusion 1.5 que parte del modelo Lykon/dreamshaper-8, sobre el que se ha fusionado un adaptador de estilo InkNoir a escala LoRA 0,4. Se publica como pipeline completo de Diffusers mas un checkpoint de un solo fichero, no como adaptador aislado.

El modelo resuelve un nicho concreto: generar ilustraciones y retratos con un estilo anime sombrio y cinematografico, manteniendo ademas capacidad razonable para imagenes de temas no relacionados (paisajes, naturalezas muertas, vehiculos, dragones) segun los ejemplos publicados por el autor. Su relevancia practica esta en que reutiliza el ecosistema de SD 1.5, por lo que funciona con todas las herramientas existentes (Diffusers, interfaces locales tipo Automatic1111, ComfyUI, etc.) y requiere poca VRAM.

En cuanto a tamano, el pipeline completo suma 859.520.964 parametros y el repositorio ocupa unos 4,3 GB. El autor declara compatibilidad con text-to-image, image-to-image, inpainting (mediante un pipeline de inpainting de SD 1.5) y generacion de fotogramas de video sin consistencia temporal nativa. No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (Stable Diffusion 1.5): U-Net + codificador de texto CLIP + VAE |
| Parametros totales | 859.520.964 |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica (modelo de imagen; el codificador CLIP limita el prompt a ~77 tokens) |
| Tipos de cuantizacion | fp16 y fp32 en el ejemplo de uso oficial (torch_dtype); no se documentan cuantizaciones GGUF u otras |
| Idiomas soportados | prompts en ingles; el autor recomienda traduccion externa para turco |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (checkpoint fusionado y adaptador LoRA) y pipeline Diffusers (unet/, text_encoder/, vae/, tokenizer/, scheduler/) |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5, un modelo de difusion latente compuesto por un U-Net que realiza el proceso de denoising en el espacio latente, un codificador de texto CLIP que convierte el prompt en embeddings y un VAE que decodifica el latente final a imagen. El modelo base declarado es Lykon/dreamshaper-8, un ajuste de SD 1.5 orientado a ilustracion y semi-realismo. Sobre esa base se ha aplicado un adaptador de estilo InkNoir que despues se fusiono en el pipeline final a escala LoRA 0,4, de modo que el resultado es un checkpoint autonomo y no un LoRA que deba cargarse por separado.

El autor no detalla en la model card el numero de imagenes de entrenamiento, la composicion del dataset ni si hubo etapas de refinamiento con RLHF u otras tecnicas de alineacion, que en modelos de difusion tampoco son el mecanismo habitual. Si se documenta que se incluye tanto el checkpoint fusionado (InkNoir_Core_Full.safetensors) como el adaptador LoRA sin fusionar (adapters/InkNoir_Core.safetensors), lo que permite al usuario reintegrar el estilo con otro peso de escala. El repositorio tambien incluye un script de arranque (run_inknoir.py) que selecciona automaticamente CUDA, Apple MPS o CPU. No se describen innovaciones de inferencia como decodificacion especulativa, atencion lineal o destilacion de pasos.

## Capacidades

- Generacion de texto a imagen (text-to-image) con foco en ilustracion anime oscura.
- Retratos de personaje y figuras de cuerpo completo; el propio autor advierte que las manos pueden fallar.
- Imagen a imagen (image-to-image) a traves de Diffusers o interfaces locales.
- Inpainting, usando un pipeline de inpainting de SD 1.5 combinado con el estilo del modelo.
- Fotogramas para GIF o video como flujo separado por fotograma; no hay consistencia temporal nativa.
- Pixel-art y hojas de sprites en fase experimental, sin garantia de disposicion exacta de celdas.
- Soporte de prompts en turco de forma basica, con recomendacion de traduccion externa previa.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento, al ser un modelo generativo de imagen.

## Casos de uso

- Ilustracion de portadas para novelas ligeras o comics: el modelo genera escenas anime oscuras con iluminacion cinematografica, y admite imagen a imagen para partir de un boceto o composicion previa y ajustar el estilo.
- Concept art para videojuegos: permite producir variaciones rapidas de personajes y entornos con tono sombrio (ciudad neon lluviosa, talleres, dragones) que sirven como referencia inicial para el equipo de arte.
- Generacion de avatares y retratos de rol: con retratos de personaje a 512x512 y unos 28 pasos de inferencia, encaja en flujos de creacion de avatares para foros, juegos de rol o comunidades, con la advertencia de que las manos pueden requerir retoque.
- Edicion y repintado de imagenes: mediante image-to-image e inpainting sobre un pipeline SD 1.5, se puede corregir o reemplazar zonas de una ilustracion existente manteniendo el estilo InkNoir.
- Prototipado rapido en equipos con hardware modesto: al funcionar con 4-6 GB de VRAM a 512x512, es viable en portatiles con GPU de gama media o en CPU (mas lento) para pruebas de concepto.
- Integracion en interfaces locales de difusion: al ser un checkpoint SD 1.5 en safetensors, se puede cargar en herramientas como Automatic1111 o ComfyUI y encadenar con upscalers, control de pose u otros nodos del ecosistema.
- Catalogos de ilustracion tematica: util para generar de forma masiva imagenes de estilo consistente para blogs, merchandising o fondos, siempre que se revise manualmente la calidad anatomica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona la existencia de un informe de pruebas independientes con sujetos no enmascarados en `examples/independent/benchmark_report.md`, pero no reproduce cifras (FID, CLIP score ni metricas equivalentes) en el texto proporcionado.

## Requisitos de hardware

- VRAM minima practica: 4-6 GB a resolucion 512x512.
- VRAM recomendada: GPU NVIDIA CUDA con 8 GB o mas.
- Memoria RAM: 8 GB minimo, 16 GB recomendado.
- Almacenamiento: 5 GB libres minimo, 8-10 GB en SSD recomendado.
- CPU: 4 nucleos modernos como minimo, 6-8 nucleos recomendado. La generacion en CPU esta soportada pero es notablemente mas lenta.
- SO: Linux o Windows recomendado; macOS puede funcionar (el script selecciona Apple MPS automaticamente).
- Python: 3.10-3.12, preferiblemente 3.11 o 3.12.
- Opciones de despliegue: Diffusers con StableDiffusionPipeline (con enable_attention_slicing para ahorrar memoria), interfaces locales de SD 1.5 (Automatic1111, ComfyUI) y el script run_inknoir.py incluido en el repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InkNoir-Core | 859.520.964 | SD 1.5 ajustado (DreamShaper 8 + LoRA fusionado) | limite CLIP ~77 tokens | CreativeML OpenRAIL-M | HuggingFace (Diffusers y safetensors) |
| Lykon/dreamshaper-8 (base) | no disponible en la informacion | SD 1.5 ajustado | limite CLIP ~77 tokens | CreativeML OpenRAIL-M | HuggingFace |
| Stable Diffusion 1.5 (original) | ~860 M (mismo orden que el total reportado) | Difusion latente | limite CLIP ~77 tokens | CreativeML OpenRAIL-M | HuggingFace y multiples mirrors |
| Otros modelos de anime sobre SD 1.5 | no disponible en la informacion | SD 1.5 ajustado | limite CLIP ~77 tokens | variable segun autor | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles anatomicos incorrectos; el autor advierte explicitamente de fallos en las manos.
- Sesgos: no se documentan analisis de sesgo. Al derivar de SD 1.5 y DreamShaper 8, hereda los sesgos de representacion de sus datos de entrenamiento.
- Limitaciones de idioma: el modelo esta pensado para prompts en ingles. El soporte de turco es basico y el propio autor recomienda traduccion externa.
- Limite de prompt: el codificador CLIP de SD 1.5 restringe la longitud efectiva del prompt a unos 77 tokens.
- Sin consistencia temporal: la generacion de fotogramas para video o GIF no mantiene coherencia entre fotogramas.
- Pixel-art y hojas de sprites: experimental, sin garantia de disposicion exacta de celdas.
- Licencia: CreativeML OpenRAIL-M permite uso comercial pero incluye clausulas de uso responsable y restricciones sobre determinados usos; conviene revisar el texto completo antes de desplegar en produccion.
- Adopcion muy baja: el repositorio registra 0 descargas y 0 likes en la informacion consultada, y el autor no ha publicado benchmarks numericos, por lo que la validacion de calidad recae en el usuario.
- Sin safety checker en el ejemplo oficial: el codigo de uso carga el pipeline con `safety_checker=None`, lo que desplaza al desarrollador la responsabilidad de filtrar contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YunusTAS13/InkNoir-Core
- Modelo base (DreamShaper 8): https://huggingface.co/Lykon/dreamshaper-8
- Documentacion de Diffusers: https://huggingface.co/docs/diffusers
- Aviso de licencia del modelo base (referenciado en la model card): MODEL_LICENSE_NOTICE.md
- Ejemplos y prompts: examples/prompts.md
- Informe de pruebas independientes: examples/independent/benchmark_report.md

Nota: la busqueda web realizada solo devolvio enlaces a paginas principales de servicios de Google (Google, Google Earth, Google Imagenes, Google Translate, Google Trends), sin informacion relevante sobre este modelo.
