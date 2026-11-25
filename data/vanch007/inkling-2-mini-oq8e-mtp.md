# vanch007/Inkling-2-Mini-oQ8e-mtp

## Resumen

Inkling-2-Mini-oQ8e-mtp es una cuantización mixta en formato MLX del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario vanch007. Se trata de un modelo de mezcla de expertos (MoE) con bucle intermedio ("looped MoE") que combina procesamiento de lenguaje y visión, con 26,4 mil millones de parámetros totales y 3,4 mil millones de parámetros activos (5,4 mil millones efectivos considerando las tres pasadas del bucle intermedio). La cuantización se realizó con la herramienta oQ (oMLX v0.8.1) mediante calibración por imatrix oQe sobre 128 muestras de 512 tokens.

El interés principal de esta ficha radica en que es un checkpoint optimizado para ejecución local en hardware Apple Silicon mediante MLX, con un peso efectivo medio de 5,619 bits por peso en el modelo de lenguaje y el codificador visual (5,741 bits incluyendo el borrador de decodificación especulativa DSpark). Esto permite desplegar un modelo multimodal de 26B en equipos con memoria unificada relativamente modesta, manteniendo los expertos enrutados en sus formatos originales NVFP4 y MXFP8 para evitar pérdida por recuantización.

El modelo base pertenece a Thinking Machines y sigue licencia Apache 2.0. Esta versión cuantizada hereda esa licencia y requiere oMLX 0.8.1 o superior para funcionar correctamente, ya que depende de la integración Lightning MTP para la decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con bucle intermedio ("looped MoE"), multimodal (lenguaje + visión), transformer con decodificación especulativa MTP (DSpark) |
| Parametros totales | 26.388.646.400 (26,4B) en el modelo de lenguaje; 27,024B incluyendo visión y borrador DSpark |
| Parametros activos | 3,4B activos; 5,4B efectivos a través de las 3 pasadas del bucle intermedio |
| Longitud de contexto | No disponible (evaluado hasta 16K en la model card) |
| Tipos de cuantizacion | Mixta: NVFP4 grupo 16, affine 8-bit grupo 64, MXFP8 grupo 32, BF16 y FP32; 5,619 bits/peso efectivos (5,741 incluyendo DSpark) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `mtp.safetensors` para el borrador DSpark |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos multimodal con un bucle intermedio que repite tres pasadas por el bloque central, lo que eleva los parámetros efectivamente activos de 3,4B a 5,4B. El modelo integra un codificador visual de 0,318B parámetros y un borrador de decodificación especulativa DSpark (MTP) del mismo tamaño, empaquetado en `mtp.safetensors` para su uso con oMLX Lightning MTP. Los expertos enrutados de las capas 0 a 19 conservan su formato original NVFP4 (grupo 16) y los de las capas 20 a 23 su formato MXFP8 (grupo 32), sin recuantización; las proyecciones de atención, los embeddings y la cabeza de vocabulario se cuantizan a affine 8-bit con calibración oQe imatrix, mientras que el codificador visual y el borrador DSpark permanecen en BF16 y los controladores de router y bucle en FP32.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación técnica destacable de esta versión es la preservación de los formatos de cuantización originales de los expertos junto con la calibración imatrix selectiva, que reduce la pérdida de calidad respecto a una cuantización uniforme, y la inclusión del borrador especulativo DSpark para acelerar la decodificación en MLX.

## Capacidades

- Generación de texto y razonamiento general, evaluado en ARC-C, CMMLU, GSM8K, MMLU-Pro y TruthfulQA.
- Razonamiento matemático (GSM8K) y conocimiento multilingüe (CMMLU, orientado a chino).
- Procesamiento de imagen y texto de entrada ("image-text-to-text"): incluye codificador visual de 0,318B parámetros.
- Decodificación especulativa mediante el borrador DSpark (MTP) integrado para acelerar la inferencia.
- Conversación multi-turno (tag "conversational").
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible el listado de idiomas soportados.
- Modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal local en Apple Silicon: el modelo procesa entradas de imagen y texto y se ejecuta con MLX en equipos con memoria unificada, lo que permite desplegar un asistente que describe imágenes o responde preguntas sobre capturas sin enviar datos a la nube.
- Análisis de documentos con imágenes: gracias a su pipeline image-text-to-text, puede extraer información de capturas, gráficos o formularios escaneados y generar resúmenes en texto, con un consumo de memoria de 20,02 GiB a 1K de contexto y 24,05 GiB a 16K.
- Razonamiento matemático y resolución de problemas: su rendimiento en GSM8K dentro del suite de 210 preguntas (80,95% global) lo hace adecuado para tareas de cálculo y razonamiento cuantitativo en entornos de desarrollo local.
- Prototipado de agentes conversacionales: el formato MLX y la decodificación especulativa DSpark permiten iterar rápidamente en prototipos de chat multi-turno sobre macOS, con velocidades de 22,2 tok/s en pp1024 y 25,2 tok/s en pp4096 en un M3 Max.
- Evaluación e investigación de cuantización: al preservar los expertos en NVFP4 y MXFP8 originales, sirve como referencia para estudiar el impacto de la cuantización mixta en modelos MoE multimodales frente a cuantizaciones uniformes.
- Despliegue en estaciones de trabajo con memoria unificada: con 18,06 GiB de almacenamiento total, cabe en equipos de 32 GB o más, lo que facilita entornos de desarrollo sin GPU dedicada.
- Generación de código asistida: aunque no hay benchmarks específicos de código en la información disponible, el modelo puede emplearse en tareas de programación dentro de flujos locales; se recomienda validar su calidad con HumanEval antes de usarlo en producción.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Suite de inteligencia de 210 preguntas (ARC-C, CMMLU, GSM8K, MMLU-Pro, TruthfulQA) | 170/210 (80,95%) |
| Memoria pico a 1K de contexto | 20,02 GiB |
| Memoria pico a 16K de contexto | 24,05 GiB |
| Decodificación single-stream pp1024 | 22,2 tok/s |
| Decodificación single-stream pp4096 | 25,2 tok/s |

Medido en Apple M3 Max de 128 GB con oMLX 0.8.1 y DSpark MTP activado. No se han publicado resultados desglosados por benchmark individual ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 20,02 GiB a 1K de contexto y 24,05 GiB a 16K de contexto (medido en M3 Max de 128 GB). El repositorio ocupa 18,8 GB.
- GPU recomendadas: Apple Silicon con memoria unificada; el benchmark oficial se realizó en un M3 Max de 128 GB. No hay datos para GPUs NVIDIA (A100, H100, RTX 4090) en la información disponible.
- ¿Cabe en GPU de consumo? En Apple Silicon, sí en equipos con 32 GB o más de memoria unificada; en GPUs de consumo NVIDIA no está confirmado porque el formato es MLX.
- Opciones de despliegue: oMLX 0.8.1 o superior (requisito explícito). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint MLX.
- Latencia y throughput: 22,2 tok/s en pp1024 y 25,2 tok/s en pp4096 en single-stream con M3 Max; no hay datos de throughput agregado por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ8e-mtp (este) | 26,4B totales / 3,4B activos (5,4B efectivos) | No disponible (evaluado a 16K) | Apache 2.0 | safetensors MLX | Cuantización mixta 5,619 bits/peso, multimodal, MTP DSpark |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B totales / 3,4B activos | No disponible | Apache 2.0 | safetensors | Pesos sin cuantizar; referencia de calidad |
| Otros modelos MoE multimodales de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos alternativos comparables en la documentación aportada.

## Limitaciones y advertencias

- Requiere oMLX 0.8.1 o superior; no funcionará en otras herramientas de inferencia como llama.cpp, vLLM u Ollama sin conversión adicional.
- El formato MLX está orientado a Apple Silicon; su uso en GPUs NVIDIA no está documentado.
- La cuantización mixta a 5,619 bits/peso puede introducir degradación de calidad respecto al modelo base en tareas sensibles; no se han publicado comparativas directas entre ambos.
- No se dispone de listado de idiomas soportados, por lo que el comportamiento multilingüe no está garantizado fuera de los idiomas evaluados (CMMLU sugiere chino; el resto no está confirmado).
- La longitud máxima de contexto no está especificada; los benchmarks solo cubren hasta 16K, y el uso más allá de esa ventana no está validado.
- Riesgo de alucinación inherente a los modelos de lenguaje; el resultado de TruthfulQA dentro del suite agregado no se detalla por separado.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base thinkingmachines/Inkling-2-Mini y citar adecuadamente.
- El modelo incluye un borrador especulativo DSpark en BF16; su desactivación reduce el rendimiento pero también el consumo de memoria.
- No hay soporte documentado de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines automatizados complejos sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/vanch007/Inkling-2-Mini-oQ8e-mtp
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
