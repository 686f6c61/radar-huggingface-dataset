# tahamajs/llava-qwen-0.5b-fusion-attn-scienceqa

## Resumen

`llava-qwen-0.5b-fusion-attn-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un marco de trabajo orientado a la modificacion quirurgica de mecanismos de atencion en modelos multimodales. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM compacto de 0,5 mil millones de parametros que combina una torre de vision SigLIP con un decodificador Qwen2 de 24 capas, y sustituye la atencion cuadratica de 18 de esas 24 capas por un operador hibrido denominado `fusion_attn` (FUSIONATTN).

El objetivo del proyecto no es ofrecer un modelo de proposito general, sino servir como banco de pruebas reproducible para "cirugia de atencion": reemplazar capas de atencion densa por variantes dispersas con compuertas por bloque y recuperar calidad mediante destilacion de conocimiento desde el modelo profesor original. El checkpoint se evalua en el subconjunto con imagen de ScienceQA (validacion), donde alcanza un 43,75 % de exactitud y una perplejidad de 6,12 tras la destilacion, frente al 31,87 % y 20,78 del modelo sin ajuste.

Es relevante ahora por dos motivos: demuestra que es posible reducir el artefacto de pesos a 148,77 MB (un 91,3 % menos que el base de 1,66 GB en FP16) manteniendo un rendimiento util en razonamiento visual STEM, y lo hace con un coste de entrenamiento de 233 pasos en una unica RTX 3090 en 120,4 segundos. La licencia MIT y el formato de pesos modular facilitan su reutilizacion en investigacion sobre eficiencia de atencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA multimodal: torre de vision SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); atencion hibrida `fusion_attn` en 18/24 capas |
| Parametros totales | 0,5 mil millones (modelo base); el artefacto publicado contiene unicamente los pesos delta quirurgicos |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye en FP16 safetensors |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 148,77 MB) + manifiesto JSON de topologia quirurgica |

## Arquitectura y entrenamiento

El modelo conserva la estructura LLaVA-Interleave estandar: una torre de vision SigLIP de 27 capas completamente congelada, un proyector MLP de dos capas que alinea embeddings visuales con el espacio del lenguaje, y un decodificador Qwen2 de 24 capas con dimension oculta 1024, 16 cabezas de atencion y dimension de cabeza 64. La intervencion sustituye el mecanismo de atencion en 18 de las 24 capas (esquema `hybrid_3_1`), dejando seis capas ancla cuadraticas en las posiciones [3, 7, 11, 15, 19, 23]. El operador FUSIONATTN combina dos rutas de ejecucion: atencion densa cuando la secuencia es corta (N <= 128) o cuando se trata de atencion cruzada, y atencion dispersa con compuertas por bloque cuando la secuencia es larga. Tambien se entrenaron las capas de normalizacion del decodificador; los MLP, embeddings y el proyector permanecen congelados.

El entrenamiento se realizo en dos etapas de destilacion de conocimiento sobre el subconjunto con imagen de ScienceQA: 77 pasos en la etapa 1 y 156 en la etapa 2, con un total de 233 pasos completados en 120,4 segundos sobre una NVIDIA GeForce RTX 3090 (24 GB), con un pico de VRAM de 14.613 MB. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de ScienceQA ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) en tareas de razonamiento visual STEM.
- Respuesta a preguntas visuales de opcion multiple, incluyendo seleccion de la letra de opcion correcta.
- Razonamiento cientifico basico sobre figuras y diagramas (subconjunto con imagen de ScienceQA).
- Conversacion multimodal de un solo turno o multi-turno mediante plantilla de chat incluida (`chat_template.json`).
- Soporte de instrucciones en formato `<image>\nQuestion: ...\nAnswer:` con tokenizador rapido BPE.
- Capacidad de atencion dispersa con compuertas por bloque para secuencias largas, gestionada de forma automatica por el operador `fusion_attn`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion sobre eficiencia de atencion: el checkpoint sirve como referencia reproducible para comparar operadores hibridos (FUSIONATTN) frente a atencion densa en un VLM de 0,5B, con manifiesto quirurgico y metricas de telemetria incluidos.
- Evaluacion de destilacion de conocimiento: permite medir la recuperacion de calidad (de 31,87 % a 43,75 % de exactitud) tras sustituir 18 de 24 capas de atencion, util para estudiar tecnicas de compresion.
- Prototipado de asistentes educativos STEM: con 0,5B de parametros y 148,77 MB de pesos, se puede desplegar en entornos con recursos limitados para responder preguntas sobre figuras cientificas.
- Pruebas de integracion en pipelines NeuralOps: el formato modular (`surgical_manifest.json` + `attention_weights.safetensors`) permite cargar el modelo mediante `load_surgeried_model` y validar flujos de "cirugia" de capas.
- Benchmarking de VLM compactos: util como linea base de bajo coste (entrenamiento en 120,4 s en una RTX 3090) para comparar contra modelos multimodales mayores en tareas de razonamiento visual.
- Docencia y divulgacion: ejemplo didactico de como se sustituye atencion cuadratica por atencion dispersa con compuertas y se recupera rendimiento con destilacion, con todos los artefactos y metricas publicados.
- Experimentacion con cuantizacion y despliegue en consumer GPU: el tamano reducido del delta permite iterar rapidamente en GPUs de 24 GB o menos, aunque no se documentan recetas de cuantizacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Profesor (base) | Pre-destilacion (zero-shot) | Post-destilacion (final) | Delta |
|---|---:|---:|---:|---:|
| Exactitud ScienceQA (subconjunto con imagen, validacion), % | 63,75 | 31,87 | 43,75 | +11,88 |
| Perplejidad ScienceQA (subconjunto con imagen, validacion) | 2,45 | 20,78 | 6,12 | -14,66 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el autor reporta un pico de 14.613 MB durante el entrenamiento en una RTX 3090, por lo que la inferencia en FP16 deberia caber holgadamente en GPUs de 16 GB o mas.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (24 GB) es la unica documentada por el autor; por tamano del modelo base (0,5B), tambien deberia ejecutarse en RTX 4090, A100 y H100 sin problema, aunque no se aportan mediciones.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3090, RTX 4080/4090 y tarjetas con 16 GB o mas; no se documentan pruebas en GPUs de 8 GB.
- Opciones de despliegue: la model card solo documenta la API publica de NeuralOps (`neuralops.hub.load_surgeried_model`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El unico dato de rendimiento es el tiempo de entrenamiento (120,4 s para 233 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-fusion-attn-scienceqa` | 0,5B (delta de 148,77 MB) | no disponible | 43,75 % exactitud / 6,12 PPL | MIT | Hugging Face + NeuralOps |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 63,75 % exactitud / 2,45 PPL | no disponible en la informacion | Hugging Face |
| Otros VLM de ~0,5B (p. ej. variantes Qwen2-VL pequeñas) | ~0,5B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base del que deriva, ya que no se han proporcionado datos de benchmarks de alternativas comparables en la informacion disponible.

## Limitaciones y advertencias

- El checkpoint contiene unicamente los pesos delta quirurgicos (148,77 MB), no el modelo completo; requiere cargarse junto con el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` mediante la libreria NeuralOps.
- La exactitud final (43,75 %) sigue siendo 20 puntos inferior al profesor (63,75 %); la compresion de atencion degrada el rendimiento de forma significativa.
- Solo se evalua en el subconjunto con imagen de ScienceQA en validacion; no hay evidencia de generalizacion a otras tareas multimodales.
- Idioma limitado al ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion no cuantificado; al ser un modelo de 0,5B entrenado con destilacion sobre un dataset especifico, la fidelidad fuera de dominio es incierta.
- No se documentan sesgos conocidos, pero el entrenamiento sobre ScienceQA puede introducir sesgos de dominio (preguntas de opcion multiple, terminologia STEM).
- No hay informacion sobre longitud de contexto, tipos de cuantizacion ni recetas de despliegue en produccion (vLLM, TGI, llama.cpp).
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados (`verified: false`) en el model-index.
- Uso comercial permitido por licencia MIT, pero la madurez del proyecto NeuralOps y la ausencia de validacion independiente desaconsejan su uso en produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-fusion-attn-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de `fusion_attn`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/fusion_attn.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
