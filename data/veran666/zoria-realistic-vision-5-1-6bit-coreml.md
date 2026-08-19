# veran666/zoria-realistic-vision-5.1-6bit-coreml

## Resumen
Este repositorio contiene una conversión a Core ML del modelo Realistic Vision 5.1 (sin VAE), un fine-tune de Stable Diffusion 1.5 orientado a la generación de imágenes fotorrealistas. La conversión, realizada con la herramienta `torch2coreml` de Apple, está optimizada para ejecutarse en el Neural Engine de los iPhone, permitiendo generación de imágenes completamente en el dispositivo sin conexión a internet. El paquete total ocupa 995 MB, frente a los 2,1 GB de la versión float16, gracias a la cuantización del U-Net a 6 bits y su división en dos chunks, requisito imprescindible para que iOS pueda cargar el modelo en memoria. El text encoder y el VAE decoder se mantienen en float16 para preservar la fidelidad del prompt y el color. La licencia es CreativeML Open RAIL-M, heredada del modelo original, que permite uso comercial con restricciones.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion (U-Net + CLIP text encoder + VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imágenes, sin contexto de texto) |
| Tipos de cuantizacion | U-Net: 6-bit palettized; TextEncoder y VAEDecoder: float16 |
| Idiomas soportados | no disponible (el modelo base usa CLIP, probablemente inglés, pero no se especifica) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | Core ML (.mlmodelc) |

## Arquitectura y entrenamiento
El modelo original, Realistic Vision 5.1, es un fine-tune de Stable Diffusion 1.5, que emplea un U-Net como denoiser, un text encoder CLIP para codificar el prompt y un VAE para decodificar latentes en píxeles. Esta conversión mantiene esa arquitectura pero la adapta a Core ML, con el U-Net cuantizado a 6 bits mediante paletización y dividido en dos chunks (`UnetChunk1` y `UnetChunk2`) para cumplir con las limitaciones de memoria de iOS. La atención se implementa con `SPLIT_EINSUM_V2`, pensada para el Neural Engine (`MLComputeUnits.cpuAndNeuralEngine`). No se proporcionan detalles sobre el entrenamiento del modelo base, pero la conversión se realizó con el script `torch2coreml` de Apple, que requirió dos correcciones: una para cuantizar el U-Net antes de dividirlo en chunks y otra para adaptarse a cambios en `coremltools 8`. La resolución de salida es fija de 512×512.

## Capacidades
- Generación de imágenes a partir de descripciones textuales (text-to-image) a resolución 512×512.
- Ejecución completamente local en iPhone, sin necesidad de conexión a internet.
- Optimizado para el Neural Engine de Apple, lo que permite inferencia eficiente en CPU+NE.
- El text encoder y el VAE en float16 preservan la fidelidad del prompt y la calidad del color.
- Compatible con el pipeline `StableDiffusionPipeline` de Apple (Swift) para integración en apps iOS.
- No se mencionan capacidades adicionales como tool calling, agentes o multimodales.

## Casos de uso
- Aplicaciones iOS de generación de imágenes en el dispositivo: permite a usuarios crear imágenes fotorrealistas sin enviar datos a servidores externos, garantizando privacidad y funcionamiento sin conexión.
- Prototipado rápido de conceptos visuales en apps de diseño: los diseñadores pueden generar variaciones de ideas directamente en su iPhone durante sesiones de lluvia de ideas.
- Creación de avatares personalizados: el modelo puede generar retratos o personajes a partir de descripciones, ideal para apps de redes sociales o juegos.
- Generación de fondos de pantalla y arte decorativo: usuarios pueden crear imágenes únicas para personalizar sus dispositivos.
- Asistencia creativa en apps de fotografía y edición: integrar el modelo como herramienta para generar texturas o elementos visuales que luego se combinan con fotos reales.
- Uso educativo en demos de IA generativa: desarrolladores pueden mostrar cómo funciona la difusión en un entorno móvil sin depender de la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Dispositivo: iPhone con Neural Engine (no se especifica modelo mínimo, pero el U-Net dividido en dos chunks es necesario para que el modelo cargue en un teléfono).
- VRAM: no aplica (inferencia en dispositivo móvil, no en GPU de escritorio).
- GPU recomendadas: no aplica; el modelo está diseñado para el Neural Engine, y ejecutarlo en GPU es notablemente más lento.
- Opciones de despliegue: Apple `StableDiffusionPipeline` (Swift) con `computeUnits` configurado a `.cpuAndNeuralEngine`. También se puede usar con otras herramientas Core ML, pero no se documentan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de comparaciones con otros modelos en la información proporcionada. La única referencia es la versión float16 del mismo Realistic Vision 5.1, que ocupa 2,1 GB frente a los 995 MB de esta conversión, a costa de una posible pérdida de calidad en el U-Net por la cuantización a 6 bits.

## Limitaciones y advertencias
- Licencia CreativeML Open RAIL-M con restricciones de uso (Attachment A): permite uso comercial, pero es obligatorio revisar las condiciones antes de distribuir cualquier producto derivado.
- El U-Net cuantizado a 6 bits puede introducir pérdida de calidad en la generación de imágenes en comparación con la versión float16, aunque el autor mantiene text encoder y VAE en float16 para mitigarlo.
- Resolución de salida fija de 512×512; no se soportan resoluciones superiores sin reentrenamiento o ajustes adicionales.
- Dependencia del Neural Engine: en GPU el rendimiento es significativamente peor.
- No se especifican idiomas soportados; el text encoder CLIP del modelo base probablemente esté entrenado principalmente en inglés, lo que limita el rendimiento con prompts en otros idiomas.
- No hay información sobre sesgos o alucinaciones del modelo original, pero al ser un modelo de difusión entrenado con datos de internet, puede reflejar sesgos presentes en esos datos.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/veran666/zoria-realistic-vision-5.1-6bit-coreml
- Modelo base (Realistic Vision 5.1 noVAE): https://huggingface.co/SG161222/Realistic_Vision_V5.1_noVAE
- Herramienta de conversión de Apple (ml-stable-diffusion): https://github.com/apple/ml-stable-diffusion
