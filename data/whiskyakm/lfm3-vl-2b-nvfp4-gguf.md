# WhiskyAKM/LFM3-VL-2B-NVFP4-GGUF

## Resumen

LFM3-VL-2B-NVFP4-GGUF es una conversión a formato GGUF del modelo vision-lenguaje LFM3-VL-2B desarrollado por Liquid AI, publicada por el usuario WhiskyAKM en Hugging Face. El modelo original es un VLM de aproximadamente 2.000 millones de parámetros construido sobre el backbone de lenguaje LFM3-1.7B, disenado para inferencia multimodal rápida y privada en dispositivos locales (edge), con capacidad de procesar texto e imágenes y generar texto.

La relevancia de esta ficha concreta radica en la cuantización NVFP4 (formato de coma flotante de 4 bits de NVIDIA, E2M1), que reduce el peso del modelo a cerca de 1 GB y permite su ejecución en hardware modesto mediante llama.cpp. Los ficheros han sido recuantizados por el autor (algunas capas en Q6_K/Q5_K) para mejorar la divergencia KL respecto a la versión BF16, y se incluye un proyector visual separado (`mmproj.gguf`) en BF16 que es imprescindible para el procesamiento de imágenes.

El modelo soporta 16 idiomas, incluyendo el castellano, y una ventana de contexto de 128.000 tokens, lo que lo hace adecuado para tareas de comprensión documental y conversación multi-turno en entornos con recursos limitados. La licencia es LFM1.0 (lfm1.0), que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 híbrida: atención GQA + convoluciones cortas (backbone de lenguaje); encoder visual estilo CLIP con proyector LFM3-VL |
| Parametros totales | ~1.728.801.600 (backbone de lenguaje); encoder visual ~189M adicionales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | NVFP4 (E2M1) con embeddings en q8_0 o bf16; capas recuantizadas a Q6_K/Q5_K; proyector visual en BF16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El backbone de lenguaje LFM3 es una arquitectura híbrida que combina atención con consultas agrupadas (GQA) y convoluciones cortas. Consta de 24 capas, dimensión de embedding de 2.048, dimensión feed-forward de 7.680 y 16 cabezas de atención con 4 cabezas KV en las capas de atención completa. Cada cuarta capa emplea atención de ventana deslizante de 256 tokens, con una base RoPE de 1.000.000 (10.000 en las capas de ventana deslizante) y un vocabulario de 128.000 tokens. El modelo base es LFM3-1.7B-Base.

El encoder visual es de estilo CLIP con 14 capas, tamaño de parche de 16, embedding visual de 1.024 y dimensión de proyección de 2.048 (coincidente con el embedding del LM). Procesa imágenes de 512×512 por tile, con fusión espacial 2×2 y resolución variable entre 65.536 y 16.777.216 píxeles por imagen. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal de esta publicación es la cuantización NVFP4 con matriz de importancia (imatrix), que ofrece ahorros de memoria significativos manteniendo una calidad cercana a bfloat16, y que está acelerada en GPUs NVIDIA Blackwell a través de llama.cpp. El autor indica que la recuantización de determinadas capas a Q6_K/Q5_K mejoró la divergencia KL de aproximadamente 0,3 a aproximadamente 0,2.

## Capacidades

- Generación de texto y comprensión de imágenes (image-text-to-text) con razonamiento multimodal.
- Comprensión documental, según indica la model card del modelo original.
- Conversación multi-turno con ventana de contexto de 128.000 tokens.
- Soporte multilingüe en 16 idiomas, incluido el castellano.
- Inferencia en dispositivo (edge) con requisitos de memoria reducidos gracias a la cuantización de 4 bits.
- Integración con llama.cpp y otros motores compatibles con GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Comprensión documental en local: el modelo puede procesar imágenes de documentos (facturas, formularios, capturas) y extraer texto o responder preguntas sobre su contenido, con resolución variable de hasta 16,7 millones de píxeles por imagen y contexto de 128.000 tokens para documentos extensos.
- Asistente conversacional multi-turno en edge: gracias a su ventana de contexto y a su tamaño de ~1 GB en NVFP4, puede desplegarse en equipos de sobremesa o portátiles para mantener conversaciones largas sin enviar datos a la nube.
- Procesamiento privado de imágenes médicas o sensibles: al ejecutarse íntegramente en local mediante llama.cpp, evita la exposición de datos a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Descripción y etiquetado automático de imágenes: puede generar descripciones textuales de imágenes para pipelines de catalogación, accesibilidad (texto alternativo) o moderación de contenido.
- Asistencia multilingüe en atención al cliente: con soporte para 16 idiomas, incluido el castellano, puede gestionar consultas con capturas de pantalla adjuntas y responder en el idioma del usuario.
- Prototipado rápido de aplicaciones VLM: su formato GGUF y su reducido tamaño permiten iterar en desarrollo con llama.cpp en hardware de consumo antes de escalar a un modelo mayor.
- Extracción de información de capturas de pantalla o interfaces: útil para automatización de procesos que requieren interpretar elementos visuales de aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una métrica de calidad de cuantización: la divergencia KL mejoró de aproximadamente 0,3 a aproximadamente 0,2 tras la recuantización de determinadas capas a Q6_K/Q5_K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB para el fichero NVFP4 base, 1,1 GB con embeddings q8_0 y 1,3 GB con embeddings bf16; hay que sumar aproximadamente 362 MB del proyector visual (`mmproj.gguf`) cuando se procesan imágenes.
- GPU recomendadas: las GPUs NVIDIA Blackwell son las que aceleran NVFP4 de forma nativa en llama.cpp; en otras GPUs el formato puede ejecutarse con menor ventaja de rendimiento.
- Cabe en GPU de consumo: sí, con amplio margen, dado el reducido tamaño de los pesos; cualquier GPU con al menos 2-3 GB de VRAM libre debería poder alojar el modelo y el proyector.
- Opciones de despliegue: llama.cpp y otros motores compatibles con GGUF; el repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-NVFP4-GGUF (esta ficha) | ~1,73B (LM) + ~189M (vision) | 128.000 | GGUF NVFP4 | lfm1.0 | Cuantización de 4 bits acelerada en Blackwell |
| LiquidAI/LFM3-VL-2B (original) | ~1,73B (LM) + ~189M (vision) | 128.000 | safetensors (BF16) | lfm1.0 | Modelo base sin cuantizar |
| Otras alternativas VLM de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La cuantización NVFP4 introduce pérdida de precisión respecto al modelo BF16 original; la divergencia KL reportada (~0,2) debe tenerse en cuenta en tareas sensibles a la exactitud.
- El formato NVFP4 está optimizado para GPUs NVIDIA Blackwell; en otro hardware el rendimiento puede no ser óptimo.
- El proyector visual (`mmproj.gguf`) es obligatorio para el procesamiento de imágenes y se distribuye en BF16, añadiendo tamaño y memoria.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad en la información proporcionada.
- La licencia lfm1.0 es una licencia "other"; es imprescindible revisar sus términos antes de cualquier uso comercial.
- El modelo es una conversión de terceros (WhiskyAKM) y no está publicada por Liquid AI; la responsabilidad sobre la calidad de la cuantización recae en el autor de la conversión.
- Aunque soporta 16 idiomas, no se dispone de evaluaciones específicas de rendimiento por idioma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WhiskyAKM/LFM3-VL-2B-NVFP4-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Backbone de lenguaje: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de Liquid AI: https://www.liquid.ai/blog/lfm3
- llama.cpp: https://github.com/ggml-org/llama.cpp
