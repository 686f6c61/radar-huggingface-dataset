# technicallyAnnoyed/Kimi-VL-A3B-Thinking-2506

## Resumen

Kimi-VL-A3B-Thinking-2506 es una actualizacion del modelo multimodal Kimi-VL-A3B-Thinking desarrollado por Moonshot AI, publicado originalmente en abril de 2025 y revisado en junio de 2025. El modelo resuelve tareas de razonamiento visual avanzado combinando un codificador de vision con un transformer de lenguaje de tipo Mixture-of-Experts (MoE) que activa aproximadamente 3.000 millones de parametros sobre un total de 16.400 millones, lo que permite un coste de inferencia propio de un modelo de 3B pese a su capacidad total.

La version 2506 introduce mejoras sustanciales en razonamiento matematico multimodal, percepcion general, comprension de video y grounding de agentes sobre interfaces graficas, manteniendo una longitud de pensamiento un 20 % inferior a la version anterior. Ademas amplia la resolucion maxima de imagen hasta 3,2 millones de pixeles, cuatro veces mas que la version previa.

La relevancia actual radica en que ofrece resultados de razonamiento multimodal cercanos a GPT-4o en varios benchmarks abiertos con un coste computacional muy reducido, y se distribuye bajo licencia MIT, lo que facilita su uso comercial e investigacion. La ficha se basa en la model card del repositorio de Hugging Face `technicallyAnnoyed/Kimi-VL-A3B-Thinking-2506`, un espejo del modelo original de Moonshot AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con lenguaje MoE (Kimi-VL); codificador de vision y proyector multimodal |
| Parametros totales | 16.407.657.776 (~16,4B) |
| Parametros activos | ~3B (MoE, segun denominacion A3B) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se requiere `custom_code` de `kimi_vl`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 32,8 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Kimi-VL: un codificador de vision que procesa imagenes y video, un proyector que alinea las representaciones visuales con el espacio del lenguaje, y un transformer de lenguaje con capas Mixture-of-Experts que activa aproximadamente 3.000 millones de parametros por token sobre un total de 16.400 millones. Esta configuracion MoE reduce el coste de inferencia y memoria activa frente a un modelo denso del mismo tamano total.

El modelo base es `moonshotai/Kimi-VL-A3B-Instruct`, sobre el que se ha realizado un ajuste fino orientado a razonamiento con modo de pensamiento (thinking). La version 2506 se entrena para producir cadenas de razonamiento mas cortas (un 20 % menos de tokens de pensamiento de media) manteniendo o mejorando la precision en benchmarks de razonamiento. Incluye soporte para imagenes de hasta 3,2 millones de pixeles totales y para tareas de video. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Razonamiento multimodal con modo de pensamiento explicito (thinking), orientado a problemas de matematicas, ciencia y logica sobre imagenes.
- Percepcion y comprension visual general: reconocimiento de escenas, objetos, texto en imagen (OCR) y descripcion detallada.
- Razonamiento matematico sobre diagramas y figuras (MathVision, MathVista).
- Comprension y razonamiento sobre video, incluidos videos de evaluacion tipo VideoMMMU y Video-MME.
- Grounding de agentes sobre interfaces: localizacion de elementos en capturas de pantalla y tareas de OS-agent (ScreenSpot-Pro, OSWorld-G).
- Procesamiento de imagenes de alta resolucion (hasta 3,2 millones de pixeles totales).
- Generacion de texto conversacional multi-turno en formato image-text-to-text.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de geometria y algebra a partir de fotografias de pizarras o diagramas, usando el modo thinking para descomponer el problema paso a paso; sus resultados en MathVision (56,9) y MathVista (80,1) lo hacen adecuado para tutoria automatica.
- Analisis de documentos tecnicos ycientificos: con soporte de hasta 3,2 millones de pixeles, puede procesar figuras, graficos y tablas de alta resolucion en articulos o informes, extrayendo conclusiones y realizando OCR sobre texto denso.
- Automatizacion de agentes sobre interfaces graficas: el modelo puede localizar botones, menus y campos en capturas de pantalla (52,8 en ScreenSpot-Pro, 52,5 en OSWorld-G) para pipelines de RPA o pruebas automatizadas de UI.
- Comprension de video para moderacion o analisis: puede resumir y razonar sobre contenido audiovisual en escenarios de analisis de reuniones, inspeccion de procesos industriales o catalogacion de contenido, con resultados competitivos en VideoMMMU (65,2).
- Asistencia a personas con discapacidad visual: descripcion de escenas, lectura de texto en imagenes y respuesta a preguntas sobre el entorno, aprovechando la percepcion visual general (84,4 en MMBench-EN-v1.1).
- Verificacion de calidad en entornos de fabricacion: inspeccion visual de piezas o productos a partir de imagenes de alta resolucion, usando el razonamiento para comparar con especificaciones y detectar anomalias.
- Investigacion en razonamiento multimodal: al ser un modelo abierto con licencia MIT y modo thinking, sirve como base para experimentos de destilacion de cadenas de razonamiento o evaluacion de tecnicas de decodificacion.

## Benchmarks y rendimiento

Resultados publicados en la model card (Pass@1 o Accuracy segun el benchmark):

| Benchmark (Metrica) | GPT-4o | Qwen2.5-VL-7B | Gemma3-12B-IT | Kimi-VL-A3B-Instruct | Kimi-VL-A3B-Thinking | Kimi-VL-A3B-Thinking-2506 |
|---|---|---|---|---|---|---|
| MMBench-EN-v1.1 (Acc) | 83,1 | 83,2 | 74,6 | 82,9 | 76,0 | 84,4 |
| RealWorldQA (Acc) | 75,4 | 68,5 | 59,1 | 68,1 | 64,0 | 70,0 |
| OCRBench (Acc) | 815 | 864 | 702 | 864 | 864 | 869 |
| MMStar (Acc) | 64,7 | 63,0 | 56,1 | 61,7 | 64,2 | 70,4 |
| MMVet (Acc) | 69,1 | 67,1 | 64,9 | 66,7 | 69,5 | 78,1 |
| MMMU (val, Pass@1) | 69,1 | 58,6 | 59,6 | 57,0 | 61,7 | 64,0 |
| MMMU-Pro (Pass@1) | 51,7 | 38,1 | 32,1 | 36,0 | 43,2 | 46,3 |
| MATH-Vision (Pass@1) | 30,4 | 25,0 | 32,1 | 21,7 | 36,8 | 56,9 |
| MathVista_MINI (Pass@1) | 63,8 | 68,0 | 56,1 | 68,6 | 71,7 | 80,1 |
| VideoMMMU (Pass@1) | 61,2 | 47,4 | 57,0 | 52,1 | 55,5 | 65,2 |
| MMVU (Pass@1) | 67,4 | 50,1 | 57,0 | 52,7 | 53,0 | 57,5 |
| Video-MME (w/ sub.) | 77,2 | 71,6 | 62,1 | 72,7 | 66,0 | 71,9 |
| ScreenSpot-Pro (Acc) | 0,8 | 29,0 | — | 35,4 | — | 52,8 |
| ScreenSpot-V2 (Acc) | 18,1 | 84,2 | — | 92,8 | — | 91,4 |
| OSWorld-G (Acc) | — | 31,5 | — | 41,6 | — | 52,5 |

La model card indica que la version 2506 alcanza estos resultados con una longitud media de pensamiento un 20 % menor que la version Thinking anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, los pesos en safetensors ocupan 32,8 GB, por lo que la inferencia en precision completa requiere al menos ese volumen de memoria, sin contar el coste del codificador de vision y de la cache de atencion.
- GPU recomendadas: no disponible. Por el volumen de pesos, un despliegue en precision nativa requiere GPUs de 40-80 GB (A100 40/80 GB, H100). Las cuantizaciones de menor precision podrian permitir GPUs de 24 GB (RTX 4090), pero no se confirma en la informacion disponible.
- Cabe en GPU consumer: no confirmado; depende de la cuantizacion, no disponible.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`/`kimi_vl`). No se confirman otras opciones (vLLM, llama.cpp, Ollama, TGI) en la informacion proporcionada.
- Latencia y throughput estimados: no disponible. La model card menciona una reduccion del 20 % en la longitud de pensamiento, lo que reduce el coste de decodificacion respecto a la version Thinking anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Puntos fuertes (benchmarks) |
|---|---|---|---|---|
| Kimi-VL-A3B-Thinking-2506 | 16,4B totales / ~3B activos | no disponible | MIT | MathVista 80,1; MathVision 56,9; VideoMMMU 65,2; ScreenSpot-Pro 52,8 |
| Qwen2.5-VL-7B | 7B (denso) | no disponible | no disponible en la informacion | OCRBench 864; MathVista 68,0; ScreenSpot-V2 84,2 |
| Gemma3-12B-IT | 12B (denso) | no disponible | no disponible en la informacion | MathVision 32,1; VideoMMMU 57,0 |
| Kimi-VL-A3B-Instruct | 16,4B totales / ~3B activos | no disponible | MIT | OCRBench 864; ScreenSpot-V2 92,8; Video-MME 72,7 |
| GPT-4o (referencia cerrada) | no disponible | no disponible | propietaria | MMMU 69,1; VideoMMMU 61,2; MathVista 63,8 |

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documenta en la informacion proporcionada, pero es inherente a los modelos generativos multimodales; conviene validar salidas en dominios criticos.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no se detallan en la informacion disponible; el rendimiento fuera del ingles no esta documentado.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion; no se indican restricciones adicionales en la model card.
- El repositorio `technicallyAnnoyed/Kimi-VL-A3B-Thinking-2506` es un espejo de terceros (23 descargas, 0 likes) del modelo original de Moonshot AI; para produccion se recomienda verificar la procedencia y usar el repositorio oficial `moonshotai/Kimi-VL-A3B-Thinking-2506`.
- Requiere `trust_remote_code=True` por el uso de `custom_code` (`kimi_vl`), lo que implica ejecutar codigo del repositorio; auditar antes de desplegar.
- El modo thinking incrementa el consumo de tokens de salida; la model card recomienda seguir la receta de inferencia publicada en su blog tecnico.
- En benchmarks de agente, ScreenSpot-V2 baja ligeramente (91,4) frente a la version Instruct (92,8), y Video-MME baja a 71,9 frente a 72,7; el rendimiento no es uniformemente superior en todas las tareas.

## Enlaces

- Repositorio de Hugging Face (espejo): https://huggingface.co/technicallyAnnoyed/Kimi-VL-A3B-Thinking-2506
- Modelo base: https://huggingface.co/moonshotai/Kimi-VL-A3B-Instruct
- Version anterior: https://huggingface.co/moonshotai/Kimi-VL-A3B-Thinking
- Informe tecnico (arXiv:2504.07491): https://arxiv.org/abs/2504.07491
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-VL
- Demo chat: https://huggingface.co/spaces/moonshotai/Kimi-VL-A3B-Thinking
- Blog tecnico con receta de inferencia: https://huggingface.co/blog/moonshotai/kimi-vl-a3b-thinking-2506
