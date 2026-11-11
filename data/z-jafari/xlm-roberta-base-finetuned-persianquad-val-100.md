# Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-100

## Resumen

`xlm-roberta-base-finetuned-PersianQuAD-val-100` es un ajuste fino supervisado de `FacebookAI/xlm-roberta-base` para la tarea de respuesta a preguntas extractiva (question answering) sobre textos en persa. Lo publica el usuario Z-Jafari en Hugging Face bajo licencia MIT y está pensado como un modelo de referencia para evaluar el comportamiento de XLM-RoBERTa en un subconjunto de validación de PersianQuAD (100 ejemplos, según el nombre del repositorio). No es un modelo generativo: es un encoder bidireccional que devuelve el span de respuesta dentro de un contexto dado.

El modelo resuelve un problema acotado pero útil: la extracción de respuestas en persa cuando no se dispone de un modelo grande generativo o cuando se quiere una latencia muy baja y un coste de inferencia mínimo. Con 277 millones de parámetros y una arquitectura transformer encoder estándar, se puede ejecutar en CPU o en GPU de gama baja, lo que lo hace atractivo para prototipos, pipelines de búsqueda documental y sistemas de preguntas frecuentes.

Es relevante ahora porque los ajustes finos pequeños y especializados siguen siendo competitivos en tareas extractivas frente a modelos generativos mucho más grandes, y porque PersianQuAD es uno de los pocos conjuntos de QA en persa con cierta difusión. La model card, generada automáticamente por el `Trainer`, es muy escasa y no documenta el conjunto de entrenamiento exacto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (XLM-RoBERTa base) |
| Parametros totales | 277.454.594 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo posicional de XLM-RoBERTa base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion dinamica o estatica via herramientas externas, no documentada por el autor) |
| Idiomas soportados | no disponible (entrenado sobre PersianQuAD, presumiblemente persa; la model card no lo declara) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 8,9 GB, incluye checkpoints intermedios) |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa base: un transformer encoder de 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion y vocabulario SentencePiece de 250.002 tokens, con embeddings posicionales aprendidos hasta 512 posiciones. Sobre esta base se anade una cabeza de question answering (clasificacion de tokens de inicio y fin del span) y se ajusta de extremo a extremo para la tarea extractiva.

El entrenamiento se realizo con el `Trainer` de Transformers durante 3 epocas, con `learning_rate` 2e-5, `train_batch_size` 16, `eval_batch_size` 16, semilla 42, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-8), scheduler lineal y precision mixta nativa (AMP). El conjunto de datos no se especifica ("unknown dataset" en la model card), aunque el nombre del repositorio sugiere un subconjunto de validacion de PersianQuAD con 100 ejemplos. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo extractivo). Las versiones de framework declaradas son Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el span de texto que contiene la respuesta.
- Procesamiento de textos en persa (presumiblemente, segun el dataset de ajuste; no declarado explicitamente).
- Manejo de contextos de hasta 512 tokens, adecuado para parrafos y documentos cortos.
- Inferencia ligera: 277 M de parametros permiten ejecucion en CPU con latencias razonables.
- No soporta generacion de texto libre, resumen, traduccion ni codigo.
- No soporta tool calling ni function calling (no es un modelo instruido ni generativo).
- No soporta razonamiento multi-paso ni comportamiento agentico.
- Capacidades multilingues: XLM-RoBERTa base fue preentrenado en 100 idiomas, pero el ajuste fino sobre PersianQuAD puede degradar el rendimiento en otros idiomas; no hay evaluacion publicada al respecto.
- No dispone de modo de pensamiento (thinking mode), vision ni audio.

## Casos de uso

- Sistemas de preguntas frecuentes sobre documentacion en persa: el modelo recibe un parrafo de contexto y una pregunta, y devuelve el fragmento exacto de respuesta; es adecuado por su bajo coste y su especializacion extractiva.
- Busqueda documental con resaltado de respuestas: integrado en un pipeline de recuperacion (p. ej. BM25 o embeddings) seguido de re-ranking y extraccion del span, permite mostrar la respuesta literal al usuario.
- Extraccion de campos en formularios y contratos en persa: dado un contexto estructurado y una pregunta plantilla ("¿cual es la fecha de emision?"), devuelve el valor textual correspondiente.
- Asistencia a la lectura de articulos: un lector puede seleccionar un parrafo y formular preguntas concretas, obteniendo respuestas ancladas al texto original (menor riesgo de alucinacion que un modelo generativo).
- Evaluacion comparativa de modelos de QA en persa: sirve como linea base reproducible para medir mejoras de modelos mas grandes o de tecnicas de aumento de datos.
- Prototipado rapido en entornos sin GPU: al caber en CPU y en GPUs de gama baja, permite desplegar un servicio de QA en persa en infraestructura modesta.
- Anotacion asistida de corpus: pre-anotar pares pregunta-respuesta sobre textos en persa para revision humana posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluacion (subconjunto de validacion de PersianQuAD, presumiblemente 100 ejemplos):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,8246 |
| Exact Match (EM) | 81,1 |
| F1 | 84,03 |

Evolucion del entrenamiento segun la model card:

| Epoca | Training loss | Validation loss |
|---|---|---|
| 1 | 1,0672 | 0,8858 |
| 2 | 0,7295 | 0,8288 |
| 3 | 0,5291 | 0,8246 |

El `model-index` del repositorio no contiene resultados adicionales. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (277 M x 4 bytes), mas activaciones; en la practica, 2-3 GB con batch pequeno.
- VRAM estimada en fp16/bf16: aproximadamente 0,55 GB para pesos; 1-2 GB con overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, T4, RTX 3060 en adelante). En A100/H100 el modelo esta infrautilizado; su uso tipico es en GPU de gama media o CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas, e incluso en CPU con latencias de decenas a cientos de milisegundos por consulta.
- Opciones de despliegue: `transformers` con pipeline `question-answering`, ONNX Runtime, TorchScript, y servidores de inferencia como TGI o FastAPI con `optimum`. No se documenta soporte nativo en llama.cpp u Ollama (no aplica a un encoder extractivo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-100 | 277 M | 512 | QA extractiva (persa) | MIT | EM 81,1 / F1 84,03 en su conjunto de validacion |
| FacebookAI/xlm-roberta-base | 278 M | 512 | Modelo base multilingue | MIT | Sin ajuste de QA; requiere fine-tuning |
| XLM-RoBERTa large | ~560 M | 512 | QA extractiva tras fine-tuning | MIT | Mayor capacidad, mayor coste; sin datos publicados en persa en esta ficha |
| mBERT (bert-base-multilingual-cased) | 178 M | 512 | QA extractiva tras fine-tuning | Apache 2.0 | Menor rendimiento tipico en lenguas de bajos recursos frente a XLM-R |

No se dispone de resultados de benchmarks comparativos publicados en la informacion proporcionada para modelos alternativos sobre PersianQuAD.

## Limitaciones y advertencias

- Modelo puramente extractivo: no genera texto; si la respuesta no esta literalmente en el contexto, no puede responder.
- La model card indica "unknown dataset" y no documenta la composicion del conjunto de entrenamiento, lo que limita la reproducibilidad.
- El nombre del repositorio sugiere un conjunto de validacion de solo 100 ejemplos; las metricas (EM 81,1 / F1 84,03) tienen alta varianza y no deben extrapolarse a un rendimiento en produccion.
- No se declaran los idiomas soportados; el ajuste sobre PersianQuAD hace probable un rendimiento degradado fuera del persa.
- Riesgo de alucinacion bajo en sentido estricto (no inventa texto), pero puede devolver spans incorrectos o vacios cuando la pregunta es ambigua o el contexto es insuficiente.
- Limitacion de contexto a 512 tokens: documentos largos requieren troceado y seleccion previa del fragmento relevante.
- Sesgos: no documentados por el autor; al derivar de XLM-RoBERTa base, hereda los sesgos del corpus de preentrenamiento (Common Crawl multilingue).
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la procedencia de PersianQuAD para el uso de los datos.
- El repositorio ocupa 8,9 GB porque incluye checkpoints intermedios; para despliegue conviene descargar solo los pesos finales.
- No hay evaluacion independiente ni resultados en el `model-index`; las cifras proceden unicamente del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-100
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Repositorio de XLM-RoBERTa en fairseq: https://github.com/facebookresearch/fairseq/tree/main/examples/xlmr
- Documentacion de la tarea question-answering en Transformers: https://huggingface.co/docs/transformers/tasks/question_answering
- PersianQuAD (conjunto de datos de QA en persa): https://github.com/persianqa/persianquad
