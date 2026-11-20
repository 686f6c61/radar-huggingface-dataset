# unsloth/MiniMax-H3-Image-FP8

## Resumen

MiniMax-H3-Image-FP8 es una versión cuantizada del transformer de difusión (DiT) MiniMax-H3-Image, publicada por Unsloth. El modelo original lo desarrolla MiniMax y está orientado a generación y edición de imágenes a partir de texto (text-to-image). Esta variante reduce el transformer de 66,3 GB en bf16 a ficheros de 20,27 GB en FP8 e INT8, lo que permite ejecutar el modelo en GPUs de 24 GB o 40 GB con distintas estrategias de streaming.

La relevancia de esta ficha radica en que el cuantizado de Unsloth hace viable el despliegue local de un modelo de generación de imágenes de gran tamano sin necesidad de infraestructura de 80 GB o superior. El repositorio incluye dos esquemas de cuantización (FP8 e INT8-ConvRot) con métricas de fidelidad medidas (LPIPS frente al modelo bf16), lo que permite evaluar el compromiso entre calidad y requisitos de memoria.

El modelo está publicado bajo la MiniMax-H3-Image Community License Agreement, solo declara soporte para inglés y su pipeline es text-to-image. La información disponible no detalla el número de parámetros totales ni la longitud de contexto del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con VAE, tokenizer, schedule y text encoder separados |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 e INT8-ConvRot (ambos en ficheros de 20,27 GB); `context_embedder` y `token_refiner` deben mantenerse en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | MiniMax-H3-Image Community License Agreement |
| Formato de pesos | safetensors (INT8-ConvRot y FP8); el VAE, tokenizer y schedule provienen del repo base; el text encoder de MiniMaxAI/MiniMax-H3 |

## Arquitectura y entrenamiento

El modelo base es un diffusion transformer (DiT) para generación de imágenes. Esta variante de Unsloth cuantiza únicamente el DiT y sus cabeceras por paso, sustituyendo el transformer bf16 de 66,3 GB por ficheros de 20,27 GB. El VAE, el tokenizer y el schedule se toman del repositorio MiniMaxAI/MiniMax-H3-Image, y el text encoder de MiniMaxAI/MiniMax-H3 (existe una copia INT8 en unsloth/MiniMax-H3-FP8).

La innovación técnica principal es el esquema INT8-ConvRot, que almacena la modulación en forma de curva y obtiene mejor fidelidad que FP8: LPIPS a 2048x2048 con la misma semilla frente al bf16 es de 0,140 con INT8-ConvRot y 0,255 con FP8 (media de 4 prompts). Cuantizar también `context_embedder` y `token_refiner` degrada el resultado (LPIPS 0,161 en INT8 y 0,308 en FP8), por lo que Unsloth los mantiene en bf16 al cargar. Todos los pesos son safetensors, sin pickle, por lo que la carga no ejecuta código arbitrario. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de imágenes a partir de descripciones textuales detalladas (text-to-image), con resolución de trabajo de 2048x2048 según los ejemplos y métricas publicados.
- Edición de imágenes (tag `image-editing` en el repositorio).
- Fidelidad visual alta en escenas complejas: los ejemplos incluyen retratos con detalle en tela y piedra, interiores fotorrealistas y ilustraciones isométricas.
- Control de estilo mediante prompt: fotografía cinematográfica, ilustración, paletas pastel, etc.
- Ejecución local con streaming del DiT desde RAM en GPUs de 24 GB.
- Integración automática en Unsloth Desktop seleccionando MiniMax-H3-Image y precisión INT8 o FP8.
- Soporte de idioma limitado al inglés según los metadatos del repositorio.

## Casos de uso

- Generación de ilustraciones para publicaciones: el modelo produce imágenes de 2048x2048 con detalle fino en escenas descritas con precisión, adecuado para portadas, artículos y material editorial.
- Creación de assets para videojuegos: ilustraciones isométricas y escenarios conceptuales a partir de prompts descriptivos, con la ventaja de ejecución local sin depender de APIs externas.
- Prototipado de conceptos visuales en estudio de diseño: iteración rápida sobre composiciones fotorrealistas (interiores, retratos, paisajes) manteniendo los datos en la infraestructura propia.
- Edición de imágenes existentes: el tag `image-editing` indica capacidad de modificar imágenes, útil para retoques guiados por texto en flujos de producción gráfica.
- Despliegue en estaciones de trabajo con GPU de 24 GB: con el DiT en streaming desde RAM (19,4 GB de VRAM pico) se puede generar una imagen 2048x2048 en unos 50 s en FP8, suficiente para uso interactivo no masivo.
- Procesamiento por lotes en servidores con A100 de 40 GB: con el DiT INT8 residente se obtienen unos 31 s por imagen, adecuado para pipelines de generación por lotes.
- Investigación en cuantización de modelos de difusión: la comparación LPIPS entre INT8-ConvRot, FP8 y bf16 permite estudiar el impacto de la precisión en la calidad generativa.

## Benchmarks y rendimiento

| Métrica | INT8-ConvRot | FP8 | bf16 (referencia) |
|---|---|---|---|
| LPIPS a 2048x2048, misma semilla (menor es mejor, media de 4 prompts) | 0,140 | 0,255 | 0 (referencia) |
| LPIPS con `context_embedder` y `token_refiner` cuantizados | 0,161 | 0,308 | 0 (referencia) |
| LPIPS de FP8 cuantizado al vuelo | no disponible | 0,266 | 0 (referencia) |
| VRAM pico (streaming desde RAM) | no disponible | 19,4 GB | no disponible |
| Tiempo por imagen 2048x2048 en L4 24 GB | no disponible | ~50 s | no disponible |
| Tiempo por imagen 2048x2048 en A100 40 GB (DiT residente) | ~31 s | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de generación de imágenes y no de lenguaje.

## Requisitos de hardware

- VRAM estimada: 19,4 GB de pico con el DiT en streaming desde RAM en FP8; el DiT INT8 residente requiere una GPU de 40 GB.
- GPU recomendadas: NVIDIA L4 de 24 GB (streaming, ~50 s por imagen 2048x2048 en FP8) y NVIDIA A100 de 40 GB (DiT INT8 residente, ~31 s por imagen).
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; el mínimo documentado es una L4 de 24 GB, por lo que tarjetas de 24 GB como la RTX 4090 podrían ser candidatas por VRAM, pero no hay confirmación en la información disponible.
- Opciones de despliegue: Unsloth Desktop (selección automática de INT8 o FP8) y la librería `minimax-h3` indicada en el repositorio; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Almacenamiento: el repositorio ocupa 40,6 GB; cada fichero cuantizado pesa 20,27 GB.
- Latencia y throughput: aproximadamente 50 s por imagen en L4 24 GB (FP8, streaming) y 31 s por imagen en A100 40 GB (INT8 residente).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image-FP8 (esta ficha) | no disponible | no disponible | FP8 e INT8-ConvRot, 20,27 GB por fichero | MiniMax-H3-Image Community License | Hugging Face, Unsloth Desktop |
| MiniMax-H3-Image (base) | no disponible | no disponible | bf16, transformer de 66,3 GB | MiniMax-H3-Image Community License | Hugging Face |
| MiniMax-H3-FP8 (text encoder) | no disponible | no disponible | INT8 | no disponible | Hugging Face (unsloth/MiniMax-H3-FP8) |

No se dispone de información sobre otros modelos de generación de imágenes comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo declara soporte de inglés; los prompts en otros idiomas pueden degradar la calidad.
- La cuantización introduce pérdida de fidelidad medible: LPIPS de 0,140 (INT8-ConvRot) y 0,255 (FP8) frente al bf16 a 2048x2048.
- Cuantizar `context_embedder` y `token_refiner` empeora el resultado (LPIPS 0,161 en INT8 y 0,308 en FP8); deben mantenerse en bf16 al cargar.
- Licencia MiniMax-H3-Image Community License Agreement: es necesario revisar sus términos antes de uso comercial, ya que no es una licencia de código abierto estándar.
- Los ficheros son Model Derivatives según el aviso `NOTICE` del repositorio; su redistribución y uso están sujetos a la licencia del modelo base.
- El despliegue en GPUs de 24 GB depende del streaming del DiT desde RAM, lo que exige memoria del sistema suficiente y añade latencia.
- No hay información publicada sobre sesgos, tasas de alucinación visual ni limitaciones de contexto del modelo original.
- No se documentan integraciones con servidores de inferencia estándar (vLLM, TGI, llama.cpp), lo que limita las opciones de despliegue en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unsloth/MiniMax-H3-Image-FP8
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Text encoder: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Copia INT8 del text encoder: https://huggingface.co/unsloth/MiniMax-H3-FP8
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Aviso de derivados: https://huggingface.co/unsloth/MiniMax-H3-Image-FP8/blob/main/NOTICE
- Guía de ejecución de Unsloth: https://unsloth.ai/docs/models/minimax-h3-image
- Documentación de Unsloth Desktop: https://unsloth.ai/docs/desktop
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth
- Web de Unsloth: https://unsloth.ai/
- Discord de Unsloth: https://discord.gg/unsloth
- GitHub de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Web de MiniMax: https://www.minimax.io
- API de MiniMax: https://platform.minimax.io
- Hailuo AI: https://hailuoai.video
