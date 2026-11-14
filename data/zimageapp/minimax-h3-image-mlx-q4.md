# zimageapp/MiniMax-H3-Image-MLX-Q4

## Resumen

MiniMax-H3-Image-MLX-Q4 es una conversión cuantizada a 4 bits del modelo de generación y edición de imágenes MiniMax-H3-Image, publicada por el usuario zimageapp. El paquete incluye tres componentes: el modelo de difusión en Q4 con grupo de 64, un encoder de texto y visión Qwen3-VL de 32.000 millones de parámetros también en Q4 con tokenizer embebido, y el VAE de imagen original en FP16 sin modificar. El conjunto pesa 29,02 GB (27,03 GiB) y está empaquetado siguiendo la convención de cuantización afín de MLX, pensada para Apple Silicon.

El modelo resuelve dos tareas: generación de imágenes a partir de texto (text-to-image) y edición de imágenes con referencias ordenadas (hasta nueve imágenes de referencia). Mantiene el esquema original de seis pasos de muestreo y los seis cabezales PDD (Patch Diffusion Decoder) del modelo denso, así como los nombres nativos de tensores de H3/Locraft. La relevancia actual radica en que permite ejecutar un modelo de imagen de gran tamano en hardware de consumo Apple (el autor reporta pruebas en un M5 Pro con 24 GB), algo inviable con los pesos densos en BF16.

Es importante subrayar que el nombre "MLX" describe el empaquetado de pesos, no un loader listo para usar. El único runtime validado de extremo a extremo es Locraft C++/Metal con cómputo BF16; no se incluye ni se ha validado una implementación completa en Swift/MLX, y no es un pipeline compatible con `mlx-lm`, MFlux o Diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (transformer) con encoder de texto/visión Qwen3-VL32B y VAE de imagen dedicado de 24 capas 2D |
| Parametros totales | no disponible (el encoder de texto/visión es de 32B; el total del conjunto no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 afín con grupo de 64 (matrices empaquetadas en uint32, ocho valores de 4 bits por palabra, escalas y sesgos en BF16); VAE en FP16; tensores seleccionados conservados en BF16/FP32 |
| Idiomas soportados | en, zh |
| Licencia | MiniMax-H3-Image Community License Agreement (licencia "other"); el encoder H3 compartido lleva además su propia LICENSE-H3-TEXT-ENCODER |
| Formato de pesos | safetensors (Q4/g64 para difusión y encoder; FP16 para VAE) |

## Arquitectura y entrenamiento

El modelo base es un sistema de difusión para imágenes con un encoder de acondicionamiento específico de H3 basado en Qwen3-VL de 32.000 millones de parámetros, que procesa tanto texto como visión. La conversión cuantiza 209 matrices del modelo de difusión y empaqueta los pesos como `uint32` con ocho valores de 4 bits por palabra (nibble más bajo primero), con escalas y sesgos en BF16 y la fórmula de reconstrucción `w = q * scale + bias`. Se preservan en precisión original la base temporal en FP32, la proyección de parches y los tensores finales del cabezal PDD, así como los nombres nativos de tensores y los seis cabezales PDD originales.

El VAE de imagen es el original sin cambios: un decodificador 2D de 24 capas que no debe sustituirse por el VAE de vídeo de H3. El encoder de texto/visión se ha cuantizado y fusionado localmente con el tokenizer embebido; la copia publicada elimina 864 bytes de relleno entre tensores respecto al fichero nativo local, manteniendo idénticos los 1.602 payloads de tensores y los metadatos, y pasando la validación estándar de safetensors. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con el esquema original de seis pasos de muestreo.
- Edición de imágenes con referencias ordenadas: hasta nueve imágenes de referencia que aportan condicionamiento de imagen (no fotogramas de salida fijados).
- Prompts de edición nativos con la sintaxis `Edit <Picture 1>.`; Locraft añade este prefijo cuando falta.
- Generación directa a resoluciones altas (hasta 4096 × 3072 según las pruebas del autor), no reescalado.
- Acondicionamiento multimodal texto+visión mediante el encoder Qwen3-VL32B específico de H3 (no es un checkpoint de chat genérico).
- Soporte de semilla (`--seed`) para reproducibilidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es de generación de imágenes, no de texto conversacional).
- Capacidades multilingües limitadas a inglés y chino.

## Casos de uso

- Generación de ilustraciones y material gráfico: el modelo produce imágenes directamente a 1024 × 768 o superiores en seis pasos, adecuado para prototipado rápido de assets visuales en un Mac con Apple Silicon.
- Edición de imágenes con referencias: usando `--ref` con hasta nueve imágenes en orden Picture, se pueden aplicar transformaciones condicionadas por imágenes de entrada, útil para variaciones de producto o composición.
- Generación de imágenes de alta resolución para impresión o web: las pruebas del autor muestran generación directa a 2048 × 1536 en 60,5 s y a 4096 × 3072 en 236,8 s en un M5 Pro de 24 GB, sin reescalado posterior.
- Creación de contenido gastronómico y de materiales: el ejemplo incluido (prompt de comida) muestra detalle coherente en texturas de alimentos y materiales, aplicable a catálogos o blogs culinarios.
- Desarrollo y evaluación de pipelines de difusión en local: al incluir configuración, tokenizer y herramientas reproducibles de conversión, sirve para experimentar con cuantización Q4/g64 sobre Apple Silicon sin depender de la nube.
- Reproducción determinista de resultados: con semilla fija y los seis pasos originales, permite generar conjuntos de imágenes reproducibles para pruebas A/B o comparativas de calidad.
- Integración en flujos de trabajo con Locraft: la CLI permite pasar rutas explícitas de cada componente y salida JSON, facilitando la automatización en scripts de generación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son tiempos de generación medidos por el autor en un Apple M5 Pro con 24 GB, con C++/Metal nativo, seis evaluaciones, un prompt de comida y semilla 42:

| Lienzo | Tiempo total de generación |
|---|---:|
| 1024 × 768 | 24,2 s |
| 2048 × 1536 | 60,5 s |
| 3072 × 2304 | 124,0 s |
| 4096 × 3072 | 236,8 s |

Además, el encoder publicado pasó una prueba de humo de 1024 × 768 en seis pasos en 22,3 s, con píxeles de salida idénticos al resultado histórico del encoder alineado para ese prompt y semilla. El decodificador del VAE de imagen midió 55,614 dB de PSNR frente a una referencia independiente en NumPy FP32 (comprobación del decodificador, no paridad completa con el pipeline del publicador). Estas cifras son ejecuciones únicas medidas, no garantías universales de velocidad o calidad.

## Requisitos de hardware

- VRAM/almacenamiento: el conjunto de pesos ocupa 29,02 GB (27,03 GiB); se recomienda al menos 24 GB de memoria unificada en Apple Silicon, según las pruebas del autor en un M5 Pro de 24 GB.
- GPU recomendadas: Apple Silicon (M-series) con C++/Metal nativo; el autor valida M5 Pro de 24 GB. No hay datos de rendimiento en GPU NVIDIA u otras.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (24 GB probados); no hay información sobre GPUs de consumo NVIDIA.
- Opciones de despliegue: Locraft C++/Metal con cómputo BF16 es el único runtime validado de extremo a extremo. No es compatible como pipeline listo con `mlx-lm`, MFlux ni Diffusers, y no se incluye implementación Swift/MLX completa.
- Latencia y throughput: según las mediciones del autor, de 24,2 s (1024 × 768) a 236,8 s (4096 × 3072) por imagen en M5 Pro de 24 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image-MLX-Q4 (este) | no disponible (encoder 32B) | no disponible | 24,2-236,8 s por imagen en M5 Pro 24 GB según resolución | MiniMax-H3-Image Community License | Hugging Face, pesos Q4 safetensors |
| MiniMaxAI/MiniMax-H3-Image (denso) | no disponible (encoder 32B) | no disponible | no disponible en la información | MiniMax-H3-Image Community License | Hugging Face |
| Comfy-Org/MiniMax-H3-Image (repack denso) | no disponible | no disponible | no disponible en la información | MiniMax-H3-Image Community License | Hugging Face |
| Comfy-Org/MiniMax-H3 (encoder) | 32B (encoder) | no disponible | no disponible en la información | LICENSE-H3-TEXT-ENCODER | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar la calidad de esta conversión Q4 frente al modelo denso ni frente a alternativas de otros desarrolladores. La diferencia principal respecto al modelo denso es el tamano (29,02 GB en Q4 frente a pesos BF16/FP32) y la viabilidad en hardware Apple de consumo.

## Limitaciones y advertencias

- La cuantización Q4 no es idéntica píxel a píxel al modelo denso; las ediciones de imagen pueden repintar caras y geometría fina.
- El nombre "MLX" se refiere al empaquetado de pesos, no a un loader listo; no es un pipeline drop-in de `mlx-lm`, MFlux o Diffusers y no se incluye implementación Swift/MLX validada.
- El único runtime validado es Locraft C++/Metal con BF16; otros runtimes no están soportados ni probados.
- Reducir arbitrariamente el número de pasos no está soportado; el adaptador experimental de dos pasos fue eliminado y no se incluye.
- La CLI nativa no incluye el mejorador de prompts del endpoint alojado oficial, por lo que textos de entrada cortos pueden diferir en estilo respecto a la API hospedada.
- El VAE de imagen es específico (24 capas 2D) y no debe sustituirse por el VAE de vídeo de H3.
- Idiomas soportados limitados a inglés y chino.
- Licencia MiniMax-H3-Image Community License Agreement: es necesario revisar `LICENSE` y `NOTICE` para conocer las restricciones de uso comercial; el encoder H3 compartido lleva además su propia licencia.
- No hay datos publicados de sesgos, tasas de alucinación visual ni evaluaciones de calidad independientes.
- Los tiempos de generación son mediciones únicas del autor y no garantizan rendimiento universal.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zimageapp/MiniMax-H3-Image-MLX-Q4
- Modelo base original: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repack denso de difusión y VAE (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/0bb149f51e3156ed4b90dd45d5620346bfe1df8f
- Encoder de texto/visión H3 (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Licencia: LICENSE (en el repositorio)
- Aviso legal: NOTICE (en el repositorio)
- Licencia del encoder H3: LICENSE-H3-TEXT-ENCODER (en el repositorio)
- Configuración PDD: pdd_config.json (en el repositorio)
- Validación de publicación: publication-validation.json (en el repositorio)
- Benchmarks: benchmarks.json (en el repositorio)
- Componentes y hashes: q4_components.json (en el repositorio)
- Ejemplo de prompt: examples/food.json (en el repositorio)
