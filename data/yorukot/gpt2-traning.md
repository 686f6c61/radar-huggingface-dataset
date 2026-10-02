# yorukot/gpt2-traning

## Resumen

yorukot/gpt2-traning es un checkpoint de GPT-2 small entrenado desde cero (sin pesos preentrenados) sobre el corpus inglés allenai/c4. Lo publica el usuario yorukot como parte de una practica de laboratorio (identificada en la model card como `lab4-yoru-AY-482206`), con el objetivo de reproducir el pipeline completo de entrenamiento de un transformer causal de escala pequena y comparar recetas de optimizacion. Se trata, por tanto, de un modelo educativo y de investigacion, no de un modelo orientado a producto.

Arquitectonicamente es un GPT2LMHeadModel estandar: 12 capas, 12 cabezas de atencion, ancho oculto 768, vocabulario de 50.257 tokens y contexto de 1.024 tokens, con embeddings de entrada y salida atados. Tiene 124.439.808 parametros unicos, lo que corresponde a la familia que historicamente se etiqueta como "117M" o GPT-2 small. Se guarda en safetensors con parametros en FP32 y se distribuye bajo licencia Apache 2.0.

Su relevancia es limitada pero concreta: sirve como referencia reproducible de un entrenamiento completo con Muon en las matrices ocultas y AdamW auxiliar, ejecutado en dos NVIDIA H200 durante una asignacion de 30 minutos, con 1.631 actualizaciones de optimizador y 855.113.728 tokens de entrada procesados. La perplexity reportada en validacion de C4 es 38,8660 (loss 3,660120) en el split de desarrollo, un valor alto en terminos absolutos que refleja un presupuesto de tokens muy inferior al habitual en modelos de esta familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (GPT2LMHeadModel), 12 capas, 12 cabezas, hidden width 768, embeddings entrada/salida atados |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | Pesos publicados en FP32 (safetensors). No se distribuyen variantes GGUF, AWQ, GPTQ ni bitsandbytes oficiales; al ser arquitectura GPT-2 estandar es convertible y cuantizable con herramientas genericas, pero no hay artefactos publicados por el autor |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (parametros guardados en FP32) |
| Vocabulario | 50.257 tokens (tokenizer GPT-2) |
| Tamano del repositorio | 1,0 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal sin modificaciones respecto a la implementacion estandar de GPT-2 en Hugging Face: 12 bloques, 12 cabezas de atencion por bloque, ancho oculto 768, contexto de 1.024 tokens y vocabulario de 50.257 entradas con pesos de embedding de entrada y de salida compartidos. No emplea atencion lineal, decodificacion especulativa, MoE ni componentes de estado recurrente; es una arquitectura densa clasica. El tokenizer es el de GPT-2 y los documentos se empaquetaron con separadores EOS.

El entrenamiento no partio de pesos preentrenados. Se usaron dos NVIDIA H200 con precision BF16 y parametros guardados en FP32, en una asignacion de 30 minutos, con 1.631 actualizaciones de optimizador y un batch global de 524.288 tokens de entrada, lo que suma 855.113.728 tokens procesados del corpus C4 (revision `1588ec454efa1a09f29cd18ddd04fe05fc8653a2`). La innovacion principal es la receta de optimizacion: Muon para las matrices ocultas con learning rate 0,0012, momentum 0,95, Nesterov, cinco pasos de Newton-Schulz y ajuste RMS tipo AdamW, complementado con un AdamW auxiliar de learning rate 0,0006 y betas (0,9, 0,95). Se aplico weight decay 0,1 (sin decaimiento en parametros de normalizacion y sesgos), gradient clipping 1,0, dropout 0, semilla 42, warmup del 5 por ciento seguido de decaimiento coseno hasta cero, y `torch.compile` en modo por defecto. El autor indica que la version de PyTorch usada fue 2.14.0 y la de Transformers 5.17.0, y que el checkpoint se selecciono por la menor perdida de desarrollo entre nueve recetas experimentales, quedando pendientes la repeticion con semilla independiente y la evaluacion de auditoria reservada.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuacion de prompts, completado de parrafos y generacion libre de texto corto.
- Modelado de lenguaje puro: calculo de log-probabilidades y perplexity sobre texto ingles, util como modelo de scoring.
- Capacidad de completar patrones sintacticos y estilisticos aprendidos de C4, con coherencia local limitada por el presupuesto de entrenamiento.
- No dispone de instruction tuning ni de ajuste por RLHF/DPO: no sigue instrucciones, no mantiene formato de chat y no responde a consignas del tipo "explica X".
- Sin soporte de tool calling ni de function calling.
- Sin capacidades de agente, planificacion multi-paso ni razonamiento encadenado explicito.
- Sin modo de pensamiento (thinking mode), sin vision, sin audio y sin multimodalidad.
- Multilingue: no. Solo ingles; el vocabulario GPT-2 puede tokenizar otros idiomas, pero no hay entrenamiento en ellos.
- Capacidad especial: ninguna mas alla de ser un modelo base reproducible para experimentos de optimizacion.

## Casos de uso

- Docencia y laboratorios de entrenamiento: sirve como checkpoint de referencia para que estudiantes comparen recetas de optimizador (Muon frente a AdamW) sobre una arquitectura conocida y un presupuesto de computo acotado, con la perdida de desarrollo como metrica.
- Modelo de scoring de fluidez para filtrado de corpus: al ser un modelo de 124M parametros con contexto de 1.024 tokens, calcular perplexity sobre documentos ingleses es barato y permite descartar texto degradado en pipelines de limpieza de datos.
- Punto de partida para fine-tuning de dominio: se puede ajustar sobre un corpus especializado en ingles (legal, medico, tecnico) partiendo de estos pesos, aunque un base preentrenado mayor daria mejor resultado en casi todos los casos.
- Pruebas de humo de infraestructura de inferencia: por su tamano, es util para validar despliegues de TGI, vLLM o llama.cpp, medir latencia por token y verificar el pipeline completo antes de pasar a modelos de miles de millones de parametros.
- Generacion de texto sintetico corto para pruebas de software: util para rellenar fixtures, datos de ejemplo o corpus de test en ingles donde no importa la calidad factual del contenido.
- Investigacion en cuantizacion: al ser un GPT-2 estandar, permite estudiar la degradacion de perplexity al pasar de FP32 a 8, 5 o 4 bits sin el ruido que introduce una arquitectura no convencional.
- Reproducibilidad de recetas de entrenamiento a escala reducida: la combinacion de batch grande (524.288 tokens), Muon y decaimiento coseno se puede replicar en un unico nodo para estudiar estabilidad del entrenamiento.
- Baseline de comparacion en articulos o informes: como linea base debil y honesta para demostrar la mejora que aportan modelos preentrenados de mayor tamano sobre la misma tarea.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag, etc.). La unica evaluacion disponible es la perdida y perplexity sobre documentos de validacion de C4 en ingles, barajados con semilla 42, empaquetados en bloques de 1.024 tokens y puntuados con 1.023 objetivos desplazados por bloque.

| Split | Documentos | Bloques evaluados | Loss | Perplexity |
|---|---|---:|---:|---:|
| Desarrollo | Primeros 16.384 documentos barajados | 7.616 | 3,660120 | 38,8660 |
| Comparacion historica | Primeros 2.048 documentos barajados | 962 | 3,684590 | 39,8288 |

Advertencias sobre estos datos: los dos splits se solapan y no son pruebas independientes; el empaquetado de desarrollo retiene grupos completos de 64 bloques para evaluacion distribuida; la evaluacion oficial del laboratorio usa 100.000 documentos de validacion y puede diferir en empaquetado y scoring; y el split de auditoria reservado, de mayor tamano, no se incluye. El propio autor indica que las puntuaciones son proxies de evaluacion local y no un resultado de juez en linea oficial. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ninguna otra tarea estandar.

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 0,5 GB solo para pesos (124,4M x 4 bytes) y del orden de 0,6-1,0 GB en total con estados de activacion para contexto de 1.024 tokens.
- VRAM en BF16/FP16: aproximadamente 0,25 GB de pesos.
- VRAM en cuantizacion de 8 bits: del orden de 0,13-0,15 GB; en 4 bits, del orden de 0,08-0,10 GB. Son estimaciones derivadas del numero de parametros, no medidas publicadas por el autor.
- Cabe en cualquier GPU de consumo: desde una GTX 1050 Ti o una GTX 1650 de 4 GB hacia arriba, incluidas iGPU con memoria unificada suficiente. Tambien es viable la inferencia en CPU sola para uso no interactivo.
- GPU recomendadas para entrenamiento: el autor uso dos NVIDIA H200 con BF16. Para reproducir el entrenamiento completo hacen falta GPU de datacenter con memoria amplia; para fine-tuning ligero basta una RTX 3090 o RTX 4090 de 24 GB, o incluso menos con gradient checkpointing y batch reducido.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM`), text-generation-inference (el repo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp u Ollama previa conversion a GGUF, y ONNX Runtime.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de rendimiento de los modelos alternativos no estan disponibles en la informacion proporcionada, por lo que la comparacion se limita a dimensiones estructurales y de licencia verificables.

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Origen de pesos | Rendimiento |
|---|---:|---:|---:|---|---|---|
| yorukot/gpt2-traning | 124,4M | 1.024 | 50.257 | Apache 2.0 | Entrenado desde cero en C4 | Perplexity 38,87 (C4, dev) |
| GPT-2 small (OpenAI) | 124M | 1.024 | 50.257 | MIT modificada | Preentrenado en WebText | No disponible en esta informacion |
| distilgpt2 | 82M | 1.024 | 50.257 | Apache 2.0 | Destilado de GPT-2 | No disponible en esta informacion |
| Pythia-160M | 160M | 2.048 | 50.304 | Apache 2.0 | Preentrenado en The Pile | No disponible en esta informacion |

Nota: el checkpoint de yorukot tiene la misma arquitectura que GPT-2 small, pero su presupuesto de entrenamiento (855M tokens) es muy inferior al de los modelos preentrenados de la comparativa, por lo que no es esperable que iguale su calidad de generacion. La comparativa con Pythia-160M es relevante por tratarse de otro modelo pequeno con pesos, codigo y checkpoints intermedios publicos.

## Limitaciones y advertencias

- Sesgos de datos: entrenado sobre C4, un corpus de rastreo web en ingles; hereda los sesgos de representacion, estereotipos y perspectivas sobrerrepresentadas de ese corpus.
- Alucinacion: alta. Es un modelo base de 124M parametros sin ajuste instructivo ni de veracidad, con tendencia a producir afirmaciones plausibles pero falsas y a degradarse rapidamente fuera de los patrones vistos en entrenamiento.
- Sin instruction tuning: no sigue instrucciones ni admite formato de chat. Usarlo con prompts conversacionales produce continuaciones de texto, no respuestas.
- Contexto muy corto: 1.024 tokens. No admite conversaciones multi-turno largas, documentos extensos ni recuperacion aumentada con muchos fragmentos.
- Idioma: solo ingles. El rendimiento en castellano u otros idiomas no esta evaluado y previsiblemente sera pobre.
- Presupuesto de entrenamiento bajo: 855.113.728 tokens procesados y 1.631 pasos de optimizador, muy por debajo de lo habitual para esta familia de modelos. La perplexity de 38,87 en C4 es coherente con un modelo poco entrenado.
- Evaluacion no auditada: los splits de desarrollo y comparacion historica se solapan, el split de auditoria reservado no se publico y las puntuaciones son proxies locales, no resultados de juez en linea. No hay repeticion con semilla independiente.
- Trazabilidad limitada: la model card cita PyTorch 2.14.0 y Transformers 5.17.0, versiones no verificables en el momento de redactar esta ficha, y el registro de Hugging Face indica una fecha de creacion posterior a la actual. La reproducibilidad exacta del entorno de entrenamiento no esta garantizada.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias de ningun tipo. El corpus C4 tiene sus propias condiciones de uso derivadas de Common Crawl, que el usuario debe respetar; la licencia del modelo no sustituye a las de los datos.
- Sin soporte de produccion: no hay garantias de mantenimiento, versionado semantico, ni artefactos optimizados (GGUF, AWQ, GPTQ) publicados por el autor. El ID del repositorio contiene una errata ("traning" en lugar de "training").
- Los resultados de la busqueda web realizada no aportan informacion relevante sobre este modelo; los enlaces devueltos corresponden a listas de recursos genericas sin relacion con el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yorukot/gpt2-traning
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/cerulean-labs/gpt2-training/runs/be37dscq
- Dataset de entrenamiento (allenai/c4): https://huggingface.co/datasets/allenai/c4
- Repositorio del corpus C4 original (TensorFlow Datasets): https://www.tensorflow.org/datasets/catalog/c4
- Paper de GPT-2 (Language Models are Unsupervised Multitask Learners): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
- Documentacion de transformers para GPT-2: https://huggingface.co/docs/transformers/model_doc/gpt2
- Paper de Muon (MomentUm Orthogonalized by Newton-Schulz): https://kellerjordan.github.io/posts/muon/
- Modelo comparable Pythia-160M: https://huggingface.co/EleutherAI/pythia-160m
- Modelo comparable distilgpt2: https://huggingface.co/distilgpt2
