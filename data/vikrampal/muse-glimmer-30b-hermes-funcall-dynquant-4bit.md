# VikramPal/Muse-Glimmer-30B-hermes-funcall-DynQuant-4bit

## Resumen

Muse-Glimmer-30B es un modelo agéntico de código abierto desarrollado por Meta Superintelligence Labs, diseñado para ejecutarse en una sola GPU y orientado a agentes locales siempre activos. Este checkpoint concreto, publicado por VikramPal, es una versión fine-tuneada para function calling sobre el dataset hermes-function-calling-v1 y posteriormente cuantizada con DynQuant a una media de 3.9999 bits por peso, reduciendo el tamaño de 55.5 GiB a 13.9 GiB (compresión 3.99x). El modelo base es un vision-language model con arquitectura `MuseGlimmerForConditionalGeneration`, 52 capas de texto, hidden size 6656 y una torre de visión, con una ventana de contexto de 128K tokens.

La relevancia de esta versión radica en que mantiene el 78% de la ganancia del fine-tune original (que aporta +27.33 puntos sobre el modelo base sin ajuste) a una fracción del coste de memoria, lo que permite desplegar agentes con tool calling en hardware de consumo. Sin embargo, la model card advierte de un problema crítico: cargar el modelo con `from_pretrained` sin pasos adicionales produce salidas sin sentido (0.00% de exactitud en evaluación), debido a que DynQuant elimina una normalización RMS sin parámetros en la capa de embeddings. El autor documenta que los pesos almacenados no son el problema, pero el proceso de carga requiere intervención manual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (vision-language, 52 capas de texto, hidden 6656, embeddings no atados, torre de vision) |
| Parametros totales | 3.955.834.880 (segun safetensors; el nombre del modelo indica 30B, posible discrepancia) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K (segun documentacion del modelo base) |
| Tipos de cuantizacion | DynQuant 4-bit (3.9999 bits), DynQuant 3-bit (experimental, no medido) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (16 shards bf16, cuantizado a 4-bit) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer denso con torre de vision (ViT-G/14) y 128K de contexto, destilado de Muse Spark para uso agéntico local. Emite razonamiento por canales y llamadas a herramientas en formato XML estilo ATEM, en lugar de JSON, por lo que requiere parsers dedicados. Este checkpoint especifico fue fine-tuneado con LoRA (r=32, alpha=64, scaling 2.0) sobre 416 modulos objetivo, usando el dataset hermes-function-calling-v1 de NousResearch. El fine-tune se realizo en bf16 y luego se cuantizo con DynQuant, un metodo que asigna anchos de bits por modulo basandose en senales de saliencia (activation-RMS) y plasticidad (gradient-norm) recogidas durante el propio entrenamiento. La cuantizacion resultante tiene un histograma de anchos: 101 modulos a 3 bits, 562 a 4 bits y 60 a 8 bits, con cero violaciones de suelo.

Un detalle critico documentado es que la capa `model.language_model.embed_tokens` es una subclase de `nn.Embedding` llamada `MuseGlimmerTextNormedEmbedding`, cuyo forward aplica una normalizacion RMS sin pesos. DynQuant reemplaza esta capa por `DynQuantEmbedding`, que no hereda de la clase original, por lo que la normalizacion se pierde al cargar. Esto provoca que el modelo genere texto fluido pero sin sentido (0.00% exact match) si se usa `from_pretrained` directamente. El autor indica que los pesos no son el problema y que se puede restaurar la operacion manualmente, pero no proporciona el codigo en la model card.

## Capacidades

- Generacion de texto y razonamiento multi-paso, optimizado para tareas agénticas largas y recuperacion de fallos.
- Function calling / tool use: fine-tuneado especificamente sobre hermes-function-calling-v1, con soporte para llamadas paralelas y argumentos estructurados.
- Vision-language: acepta entradas de imagen y texto (pipeline image-text-to-text), gracias a la torre de vision ViT-G/14.
- Emision de llamadas a herramientas en formato XML estilo ATEM (no JSON), con parsers dedicados para el ecosistema Muse Glimmer.
- Multilingue: solo ingles confirmado en la model card.
- Cuantizacion eficiente: 4-bit con asignacion dinamica de bits por modulo, manteniendo el 78% de la ganancia del fine-tune a 3.99x compresion.

## Casos de uso

- Agentes locales siempre activos: el modelo puede ejecutarse en una GPU de consumo (13.9 GiB) y mantener conversaciones multi-turno con contexto largo (128K), ideal para asistentes personales que gestionan tareas del sistema, calendarios o correo.
- Automatizacion de flujos de trabajo con tool calling: integrable en pipelines que requieren llamadas a APIs externas, bases de datos o servicios web, gracias a su fine-tune especifico en function calling.
- Analisis de documentos con imagen y texto: al ser vision-language, puede procesar capturas de pantalla, diagramas o documentos escaneados y extraer informacion estructurada mediante llamadas a herramientas.
- Desarrollo de chatbots de soporte tecnico: con 128K de contexto puede mantener historiales largos de conversacion y consultar bases de conocimiento via tool use, reduciendo alucinaciones en dominios acotados.
- Prototipado de agentes de razonamiento multi-paso: su capacidad de emitir razonamiento por canales y recuperarse de fallos lo hace adecuado para experimentos de planificacion y ejecucion de tareas complejas.
- Despliegue en edge o entornos con restricciones de memoria: la cuantizacion 4-bit permite ejecutar el modelo en GPUs con 16 GB de VRAM, como RTX 4080 o A5000, sin sacrificar demasiada precision.

## Benchmarks y rendimiento

La model card incluye una evaluacion sobre 600 items held-out en formato nativo de una sola vuelta, con 344 de ellos con argumentos estructurados. Se comparan distintas variantes (base, fine-tuned, cuantizada) con decodificacion greedy y `max_new_tokens=2048`. Los resultados se presentan como porcentajes de coincidencia exacta, coincidencia de nombres de herramientas, coincidencia de conteo de llamadas, emision de llamadas parseables y una metrica compuesta "all-600". La prueba estadistica es un test exacto de McNemar pareado.

| arm | bits | size | exact % | names % | count % | emitted % | all-600 % | vs bf16 | gained/lost | p |
|---|---|---|---|---|---|---|---|---|---|---|
| base, no fine-tune | 16.00 | 55.5 GiB | 33.43 | 47.97 | 48.55 | 98.55 | 20.50 | -27.33 | 1 / 95 | 2.4e-27 |
| base + prompt hint | 16.00 | 55.5 GiB | 59.01 | 77.62 | 78.20 | 98.26 | 36.00 | -1.74 | 10 / 16 | 0.33 |
| fine-tuned, no signal | 16.00 | 55.5 GiB | 60.47 | 81.40 | 81.69 | 98.26 | 37.00 | -0.29 | 5 / 6 | 1.00 |
| **fine-tuned bf16** | 16.00 | 55.5 GiB | **60.76** | 79.94 | 80.52 | 97.97 | 37.00 | -- | -- | -- |
| **DynQuant 4-bit** | 3.9999 | **13.9 GiB** | **54.65** | 71.51 | 72.67 | 97.38 | 33.50 | **-6.10** | 7 / 28 | **0.00051** |
| DynQuant 3-bit | 2.9998 | 10.4 GiB | *not yet measured* | | | | | | | |

El fine-tune aporta +27.33 puntos sobre el base. La version 4-bit retiene +21.22 de esa ganancia (78%) a 3.99x compresion. La perdida de 6.10 puntos frente a bf16 es estadisticamente significativa (28 items perdidos contra 7 ganados, p=0.00051). El autor advierte que estos numeros no demuestran que la asignacion de bits de DynQuant sea optima, ya que no se incluyo un control con mapa de bits aleatorio.

## Requisitos de hardware

- VRAM estimada: 13.9 GiB para el checkpoint cuantizado 4-bit, por lo que cabe en GPUs con 16 GB o mas (RTX 4080, RTX 4090, A5000, A100 40GB, etc.).
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM y soporte para bf16. Para inferencia con contexto largo (128K), se recomienda al menos 24 GB para evitar swapping.
- En consumer GPU: si, en RTX 3090/4090 (24 GB) y similares. En GPUs de 8-12 GB no es viable sin cuantizacion adicional o offloading.
- Opciones de despliegue: vLLM (con soporte para el parser `muse_glimmer`), llama.cpp, Ollama (si se convierte a GGUF), TGI. El autor menciona compatibilidad con endpoints.
- Latencia y throughput: no se proporcionan datos especificos. Dado el tamano (~4B parametros efectivos) y la cuantizacion 4-bit, se espera una latencia de decodificacion en el rango de 20-50 tokens/s en una RTX 4090, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Function calling | Vision |
|---|---|---|---|---|---|---|
| Muse-Glimmer-30B (base) | ~30B (dato del fabricante) | 128K | Apache-2.0 | bf16 | Nativo (ATEM XML) | Si |
| Este checkpoint (DynQuant 4-bit) | 3.955.834.880 (segun safetensors) | 128K | Apache-2.0 | DynQuant 4-bit | Fine-tuneado (hermes) | Si |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community | GGUF, AWQ | Si (JSON) | No |
| Qwen2.5-7B-Instruct | 7.6B | 128K | Apache-2.0 | GGUF, AWQ | Si (JSON) | No |

La comparativa es limitada porque no hay datos de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible. Este checkpoint se distingue por su enfoque en tool calling con formato ATEM y su cuantizacion adaptativa, pero su rendimiento en tareas genericas no esta documentado.

## Limitaciones y advertencias

- Problema critico de carga: `from_pretrained` sin pasos adicionales devuelve un modelo que genera texto fluido pero sin sentido (0.00% exact match en evaluacion). El autor indica que los pesos son correctos pero que la normalizacion RMS de la capa de embeddings se pierde durante la cuantizacion. Se requiere intervencion manual para restaurar la operacion, aunque no se proporciona el codigo en la model card.
- Perdida de rendimiento frente a bf16: la version 4-bit pierde 6.10 puntos en exact match (p=0.00051), con 28 items perdidos frente a 7 ganados. Esta perdida es estadisticamente real, no ruido.
- La model card advierte explicitamente que los resultados no demuestran que la asignacion de bits de DynQuant sea optima, ya que no se incluyo un control con mapa de bits aleatorio.
- Sesgos y alucinaciones: no se documentan sesgos especificos, pero al ser un modelo fine-tuneado sobre un dataset de function calling, puede alucinar nombres de herramientas o argumentos si no se controla la generacion.
- Idioma: solo ingles confirmado. No se garantiza rendimiento en otros idiomas.
- Formato de salida propietario: las llamadas a herramientas usan XML estilo ATEM, no JSON estandar, lo que requiere parsers especificos del ecosistema Muse Glimmer. No es compatible directamente con frameworks que esperan JSON.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base es de Meta y puede haber restricciones adicionales en la documentacion oficial (no detalladas aqui).

## Enlaces

- HuggingFace del checkpoint: https://huggingface.co/VikramPal/Muse-Glimmer-30B-hermes-funcall-DynQuant-4bit
- Modelo base en HuggingFace: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Pagina oficial de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Blog de investigacion de Meta: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Recetas vLLM: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- Dataset de fine-tune: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
