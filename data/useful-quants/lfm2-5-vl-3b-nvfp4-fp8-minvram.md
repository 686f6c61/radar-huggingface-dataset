# useful-quants/LFM2.5-VL-3B-NVFP4-FP8-MinVRAM

## Resumen

LFM2.5-VL-3B-NVFP4-FP8-MinVRAM es una cuantización extrema de bajo consumo de memoria del modelo multimodal LFM2.5-VL-3B de Liquid AI, publicada por el usuario useful-quants. El modelo original, lanzado en agosto de 2026, es un sistema de visión-lenguaje (VLM) de aproximadamente 3.100 millones de parámetros diseñado para ejecutarse en dispositivos edge y en la nube con baja latencia. Esta variante MinVRAM aplica una compresión agresiva de pesos mediante NVFP4 (W4A4 con bloques de 16 elementos) en los MLPs del decoder y las proyecciones de short-convolution, y FP8 (W8A8 estático) en las capas de atención y en el encoder de visión, reduciendo el peso del modelo de 5,82 GiB a 2,60 GiB (una reducción del 57,1 %).

La arquitectura subyacente es híbrida: combina atención lineal (linear attention) con capas de convolución corta (short-convolution) y atención completa en una parte de las capas, junto con un encoder de visión SigLIP2 NaFlex. El modelo mantiene una paridad determinista del 100 % con la versión BF16 en tareas de VQA, OCR de documentos y razonamiento visual multiventana, según la model card. Está pensado para maximizar la memoria disponible para la caché KV en GPUs con 16 GB de VRAM, como la RTX 5060 Ti, y se sirve mediante un contenedor Docker validado con vLLM 0.26.0 y FlashInfer 0.6.14.

Esta ficha se centra en la versión cuantizada MinVRAM, pero incluye referencias al modelo base para contextualizar sus capacidades y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida linear-attention (LFM2.5) con 30 capas decoder (8 full-attention, 22 short-convolution), encoder SigLIP2 NaFlex, proyector multimodal |
| Parametros totales | 2.132.579.568 (aprox. 2,13 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (los benchmarks de la model card usan hasta 3840 tokens de entrada y 5120 tokens de visión) |
| Tipos de cuantizacion | NVFP4 (W4A4 E2M1 block-scaled, bloques de 16) en MLPs del decoder y short-conv; FP8 (W8A8 E4M3 estático) en atención y MLPs de visión; BF16 en embeddings, LM head, proyector y depthwise conv |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (17 idiomas) |
| Licencia | lfm1.0 (otra, ver archivo LICENSE en el repositorio) |
| Formato de pesos | safetensors (2,49 GiB de payload, 2,7 GB de repo) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-VL-3B, desarrollado por Liquid AI, emplea una arquitectura híbrida que combina atención lineal (linear attention) con capas de convolución corta (short-convolution). Concretamente, el decoder tiene 30 capas: 8 capas de atención completa (en las posiciones 2, 5, 9, 13, 17, 21, 24 y 27) y 22 capas de short-convolution (el resto). El encoder de visión es un SigLIP2 NaFlex, y el proyector multimodal conecta las características visuales con el decoder. El modelo responde directamente (sin modo de razonamiento explícito) para minimizar la latencia en entornos edge.

La versión cuantizada MinVRAM aplica una política de precisión específica por submódulo: los MLPs feed-forward del decoder y las proyecciones de short-convolution se cuantizan a NVFP4 (W4A4 con bloques de 16 elementos), mientras que las capas de atención del decoder y los MLPs de visión se cuantizan a FP8 (W8A8 estático). Las capas de depthwise convolution, el proyector multimodal, los embeddings y la cabeza de salida se mantienen en BF16. Esta configuración reduce el peso del modelo de 5,82 GiB a 2,60 GiB (una compresión de 2,33×), liberando 3,22 GiB de VRAM adicionales para la caché KV. No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto e imagen a texto (VQA, OCR, razonamiento visual).
- Comprensión de pantallas y documentos (screen/UI understanding, document understanding).
- Grounding visual (localización de objetos o regiones en imágenes).
- Function calling (llamada a herramientas).
- Entrada de múltiples imágenes (multi-image input).
- Respuesta directa sin modo de razonamiento, optimizada para baja latencia.
- Multilingüe: soporta 17 idiomas, incluyendo español, inglés, francés, alemán, chino, japonés, etc.
- Compatible con cuantización NVFP4/FP8 para despliegue en GPUs NVIDIA Blackwell (SM120).

## Casos de uso

- Asistente visual en dispositivos móviles: el modelo puede describir imágenes, responder preguntas sobre el contenido visual y ejecutar acciones mediante function calling, todo con una huella de memoria reducida que permite su ejecución en smartphones o tablets con GPU integrada.
- Automatización de atención al cliente con capturas de pantalla: ante una captura de pantalla de un error o una interfaz, el modelo puede identificar el problema, explicarlo y sugerir pasos de solución, gracias a su capacidad de comprensión de UI y su respuesta directa de baja latencia.
- OCR y extracción de datos de facturas y documentos: el modelo procesa imágenes de facturas, recibos o formularios, extrae campos clave (importes, fechas, números de referencia) y devuelve datos estructurados, útil para flujos de contabilidad automatizada.
- Agente de automatización de tareas en el navegador: con soporte de function calling y grounding, puede interpretar una captura de pantalla de una página web, identificar botones o enlaces y generar acciones (clic, relleno de formularios) para automatizar flujos de trabajo.
- Clasificación y moderación de contenido visual: el modelo puede analizar imágenes y devolver etiquetas o categorías (por ejemplo, contenido inapropiado, objetos, escenas) en tiempo real, adecuado para plataformas que necesitan moderación en el edge.
- Asistente de accesibilidad: describe imágenes y escenas para personas con discapacidad visual, o lee el contenido de pantallas en voz alta, aprovechando su bajo consumo de memoria para ejecutarse en dispositivos de asistencia.
- Prototipado rápido de aplicaciones multimodales: al ser un modelo pequeño (2,13 B) y cuantizado, permite iterar en entornos de desarrollo con GPUs de gama media o incluso CPU (con las limitaciones de rendimiento), acelerando la validación de conceptos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye mediciones de rendimiento de inferencia en una RTX 5060 Ti (16 GB GDDR7, SM120) con vLLM 0.26.0 en modo `--enforce-eager`. A continuación se muestran los datos de rendimiento comparados con la versión BF16 y la variante Mixed (también de useful-quants):

| Metrica / Carga de trabajo | BF16 (Q0) | Mixed (candidato B) | MinVRAM (este repo) |
|---|---|---|---|
| Peso del modelo en VRAM | 5,82 GiB | 2,95 GiB | 2,60 GiB |
| KV cache disponible (0,75 util) | 5,81 GiB | 8,68 GiB | 9,03 GiB |
| Concurrencia teórica máxima (req. de 4096 tokens) | 84,8× | 126,7× | 131,8× |
| Decode-heavy (128 in / 256 out) | 60,48 tok/s | 29,20 tok/s | 21,52 tok/s |
| Balanceado (1024 in / 128 out) | 57,62 tok/s | 29,53 tok/s | 21,42 tok/s |
| Prefill-heavy (3840 in / 32 out) | 32,61 tok/s | 25,79 tok/s | 20,58 tok/s |
| VQA de imagen única (576 tokens de visión) | 55,07 tok/s | 26,81 tok/s | 19,67 tok/s |
| Multi-tile alta resolución (5120 tokens de visión) | 35,52 tok/s | 26,51 tok/s | 19,79 tok/s |
| Throughput agregado con concurrencia 4 | 212,82 tok/s | 115,13 tok/s | 84,19 tok/s |
| Paridad determinista multimodal | 100 % | 100 % | 100 % |

Estos datos muestran que la versión MinVRAM sacrifica velocidad de generación (aproximadamente un tercio de la velocidad BF16 en cargas típicas) a cambio de una reducción significativa de VRAM y una mayor capacidad de caché KV, lo que permite manejar más solicitudes concurrentes en memoria limitada.

## Requisitos de hardware

- VRAM estimada: el peso del modelo ocupa 2,60 GiB. Con la caché KV y los overheads de activaciones, se recomienda al menos 6-8 GB de VRAM para un uso cómodo. La model card valida el funcionamiento en una RTX 5060 Ti de 16 GB, donde se alcanzan 9,03 GiB de caché KV disponible a 0,75 de utilización.
- GPU recomendadas: NVIDIA GeForce RTX 50-series (Blackwell SM120) por el soporte nativo de NVFP4. También puede ejecutarse en otras GPUs NVIDIA con soporte FP8, pero la ventaja de compresión NVFP4 se pierde.
- Cabe en GPU consumer: sí, en GPUs con 8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 5060). En GPUs de 8 GB, la caché KV se reducirá considerablemente, limitando la concurrencia.
- Opciones de despliegue: contenedor Docker validado con vLLM 0.26.0 y FlashInfer 0.6.14. Se requieren parches específicos para esta representación híbrida (ver sección 4 de la model card). No se menciona compatibilidad con llama.cpp u Ollama en esta variante.
- Latencia y throughput: según la tabla de benchmarks, la velocidad de generación oscila entre 19,67 y 21,52 tok/s para una sola solicitud, y el throughput agregado con concurrencia 4 es de 84,19 tok/s. Estos valores son orientativos y dependen del hardware y la configuración.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base y con la variante Mixed del mismo autor:

| Modelo | Parametros | Peso VRAM | Contexto | Rendimiento (decode-heavy) | Licencia |
|---|---|---|---|---|---|
| LiquidAI/LFM2.5-VL-3B (BF16) | 2,13 B | 5,82 GiB | No disponible | 60,48 tok/s | lfm1.0 |
| useful-quants/LFM2.5-VL-3B-NVFP4-FP8-Mixed | 2,13 B | 2,95 GiB | No disponible | 29,20 tok/s | lfm1.0 |
| useful-quants/LFM2.5-VL-3B-NVFP4-FP8-MinVRAM (este) | 2,13 B | 2,60 GiB | No disponible | 21,52 tok/s | lfm1.0 |

No se dispone de datos de otros modelos comparables (por ejemplo, Qwen2.5-VL-3B o MiniCPM-V) en la información proporcionada. La elección entre las tres variantes depende del equilibrio entre velocidad y memoria: la versión BF16 es la más rápida pero consume más VRAM; la MinVRAM es la más ligera pero la más lenta; la Mixed es un punto intermedio recomendado por el autor para un equilibrio general.

## Limitaciones y advertencias

- Rendimiento de inferencia reducido: la cuantización agresiva reduce la velocidad de generación a aproximadamente un tercio de la versión BF16 en cargas de trabajo típicas, lo que puede ser inaceptable para aplicaciones de baja latencia sin concurrencia.
- Requisito de hardware específico: el formato NVFP4 está optimizado para GPUs NVIDIA Blackwell (SM120). En GPUs más antiguas, el modelo podría no aprovechar la compresión o requerir conversión a FP8/BF16.
- Dependencia de vLLM con parches: el despliegue requiere el contenedor Docker proporcionado o la aplicación manual de cuatro parches de compatibilidad sobre vLLM 0.26.0. No se garantiza el funcionamiento con otras versiones o frameworks.
- Licencia lfm1.0: la licencia se indica como "otra" y debe revisarse el archivo LICENSE del repositorio. Puede incluir restricciones de uso comercial o de redistribución.
- Sin datos de benchmarks de calidad: no se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar para esta variante. La paridad determinista del 100 % se refiere a tareas específicas de VQA/OCR, no a la calidad general del modelo.
- Riesgo de alucinación y sesgos: como todo modelo de lenguaje multimodal, puede generar descripciones inexactas o sesgadas, especialmente en contextos poco representados en sus datos de entrenamiento. No se dispone de información específica sobre sesgos.
- Longitud de contexto no confirmada: no se ha especificado la longitud máxima de contexto soportada. Los benchmarks usan hasta 3840 tokens de texto y 5120 tokens de visión, pero no se garantiza un contexto mayor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/useful-quants/LFM2.5-VL-3B-NVFP4-FP8-MinVRAM
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Blog de Liquid AI sobre LFM2.5-VL-3B: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Documentación oficial de LFM2.5-VL-3B: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Artículo de llm-stats.com sobre el lanzamiento: https://llm-stats.com/blog/research/lfm-2.5-vl-3b-launch
- Variante Mixed (recomendada por el autor): https://huggingface.co/useful-quants/LFM2.5-VL-3B-NVFP4-FP8-Mixed
