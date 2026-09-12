# WattsIshaan/OLMo-2-1B-Midtrain-50B-AdamW-20percent

## Resumen

OLMo-2-1B-Midtrain-50B-AdamW-20percent es un checkpoint intermedio de preentrenamiento (midtrain) del modelo base allenai/OLMo-2-0425-1B, publicado por el usuario WattsIshaan en HuggingFace. No se trata de un modelo final listo para inferencia, sino de una instantánea tomada al 80 % del proceso de midtraining, tras haber consumido 50 000 millones de tokens del dataset allenai/dolmino-mix-1124 con el optimizador AdamW. El objetivo declarado es que pueda reanudarse y completarse ("annealed") durante el 20 % restante de pasos, lo que lo convierte en material para experimentacion de entrenamiento antes que en un modelo de produccion.

El checkpoint esta vinculado al articulo "Sharpness-Aware Pretraining Mitigates Catastrophic Forgetting" (Ishaan Watts, Catherine Li, Sachin Goyal, Jacob Mitchell Springer, Aditi Raghunathan; ICML 2026, arXiv:2605.02105). Por la nomenclatura del repositorio (AdamW, 20percent) y por el contexto del paper, este artefacto funciona como ejecucion de referencia o linea base frente a variantes con optimizadores sharpness-aware, utilizadas para medir olvido catastrofico durante el midtraining. Su relevancia actual es, por tanto, metodologica: permite reproducir y auditar comparaciones controladas de optimizadores a escala de 1 000 millones de parametros con presupuesto de computo reducido.

El repositorio ocupa 17,8 GB y contiene ocho fragmentos FSDP en formato PyTorch (`rank0.pt`–`rank7.pt`), no pesos safetensors ni GGUF. Para cargarlo como un unico `model.pt` es obligatorio ejecutar `python scripts/unshard.py ./OLMo-2-1B-Midtrain-50B-AdamW-20percent ./unsharded` desde el repositorio de OLMo. La licencia es CC-BY-4.0, mas permisiva que la Apache 2.0 habitual en la familia OLMo 2, aunque la informacion proporcionada no detalla los terminos de uso comercial mas alla de la propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base allenai/OLMo-2-0425-1B); detalles internos no especificados en la informacion proporcionada |
| Parametros totales | Clase 1B del modelo base OLMo-2-0425-1B; el conteo exacto no esta disponible en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para este checkpoint; no se especifica la longitud de secuencia usada en el midtraining |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en punto flotante sin cuantizar |
| Idiomas soportados | No disponible (el dataset de midtraining, Dolmino Mix 1124, esta mayoritariamente en ingles, pero la model card no lo declara) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Shards FSDP de PyTorch (`rank0.pt`–`rank7.pt`); tras el unshard, un unico `model.pt`. No hay safetensors ni GGUF |
| Modelo base | allenai/OLMo-2-0425-1B (referenciado como `base_model:finetune`) |
| Dataset de entrenamiento | allenai/dolmino-mix-1124 |
| Tokens de midtraining consumidos | 50 000 millones (50 B) |
| Progreso del midtraining | 80 % (paso 19 000 con batch size de 1 024); resta un 20 % de pasos para el annealing |
| Optimizador | AdamW |
| Tamano del repositorio | 17,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base OLMo-2-0425-1B, un transformer decoder-only de la familia OLMo 2 del Allen Institute for AI (Ai2). La model card de este checkpoint no describe capas, cabezas de atencion, tipo de normalizacion ni esquema de posiciones, por lo que esos detalles deben consultarse en la documentacion del modelo base y no se reproducen aqui. Lo que si se especifica es el proceso: se parte del checkpoint publicado OLMo-2-0425-1B y se continua el entrenamiento con AdamW durante 50 000 millones de tokens muestreados de Dolmino Mix 1124, la mezcla de midtraining de Ai2 orientada a mejorar calidad antes del ajuste final.

La innovacion tecnica del trabajo no reside en el modelo sino en el regimen de entrenamiento estudiado. El paper asociado, "Sharpness-Aware Pretraining Mitigates Catastrophic Forgetting", investiga si los optimizadores sensibles a la nitidez (sharpness-aware) reducen el olvido catastrofico que aparece al cambiar de distribucion de datos entre pretraining y midtraining. Este checkpoint es la ejecucion de control con AdamW, detenida al 80 % para que el 20 % restante pueda destinarse a distintos esquemas de annealing y permitir comparaciones controladas con el mismo punto de partida.

Un detalle practico relevante: la model card indica que se trata de un checkpoint FSDP fragmentado en ocho rangos (`rank0.pt`–`rank7.pt`). No es cargable directamente por `transformers` ni por llama.cpp; hay que unshardearlo con el script del repositorio de OLMo y, en su caso, convertir el `model.pt` resultante al formato de pesos safetensors de HuggingFace antes de cualquier uso de inferencia o cuantizacion.

## Capacidades

- Generacion de texto autoregresiva: es un modelo de lenguaje base, por lo que la funcion principal es la continuacion y generacion de texto, pero al estar al 80 % del midtraining y sin ajuste por instrucciones, su calidad y estabilidad no son las de un modelo final.
- Razonamiento y conocimiento general: capacidades no verificadas para este checkpoint; no hay evaluaciones publicadas en la informacion disponible.
- Generacion de codigo: no documentada para este artefacto.
- Matematicas: no documentada para este artefacto.
- Tool calling / function calling: no soportado de forma nativa; no hay plantilla de chat ni entrenamiento de instrucciones declarado.
- Agentes y razonamiento multi-paso: no aplicable en su estado actual; requeriria completar el annealing y, despues, un ajuste por instrucciones.
- Capacidades multilingues: no disponibles en la informacion proporcionada; la composicion de Dolmino Mix 1124 esta mayoritariamente en ingles.
- Capacidad especial destacable: servir como punto de partida reproducible para experimentos de annealing y de olvido catastrofico, incluyendo la reanudacion del entrenamiento con estado del optimizador.

## Casos de uso

- Reanudacion y annealing del 20 % restante: cargar los shards, unshardear y continuar el entrenamiento durante los pasos que faltan para obtener un modelo de midtraining completo. Es el uso para el que el autor publica explicitamente el checkpoint.
- Linea base en estudios de olvido catastrofico: comparar esta ejecucion con AdamW frente a variantes sharpness-aware del mismo paper, midiendo degradacion en tareas de pretraining tras el cambio de distribucion de datos.
- Ablaciones de optimizador a escala 1B: al compartir punto de partida, tokens y receta, permite aislar el efecto del optimizador sin la varianza de entrenar cada variante desde cero, con un coste de computo de una fraccion del preentrenamiento completo.
- Investigacion sobre schedules de annealing: usar el checkpoint como prefijo comun para probar decaimientos de learning rate, mezclas de datos o longitudes de secuencia distintas durante el tramo final.
- Destilacion y ajuste ligero: partir de un modelo ya expuesto a 50 B tokens de datos de alta calidad para destilar en un modelo menor o aplicar LoRA/adaptadores en dominios concretos, con menor coste que arrancar desde un modelo base crudo.
- Reproducibilidad y auditoria de artefactos abiertos: el repositorio conserva los fragmentos FSDP originales, lo que permite verificar el estado exacto del entrenamiento (paso 19 000, batch 1 024) y auditar la receta declarada en el paper.
- Despliegue en el borde tras completar el entrenamiento: una vez finalizado el annealing y convertido a GGUF, un modelo de esta clase cabe en dispositivos con pocos gigabytes de memoria y puede ejecutarse en CPU para generacion de texto local, aunque este uso no esta validado en el estado actual del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y los resultados de busqueda web asociados no aportaron informacion tecnica relevante sobre este artefacto. Tampoco se declaran metricas de perdida, perplejidad o rendimiento de entrenamiento mas alla del numero de paso y el batch size.

## Requisitos de hardware

- Inferencia en punto flotante de 32 bits: los pesos de un modelo de clase 1B ocupan aproximadamente 4 GB, mas la cache KV; cabe en GPUs de 8 GB o mas.
- Inferencia en bfloat16 o float16 tras la conversion a safetensors: aproximadamente 2-2,5 GB de pesos, por lo que cabe en GPUs consumer de 4-6 GB (GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores).
- Inferencia cuantizada (GGUF Q4_K_M): del orden de 0,7-0,9 GB, ejecutable en CPU con llama.cpp u Ollama tras la conversion, aunque esa conversion no esta proporcionada en el repositorio.
- Continuacion del entrenamiento: el artefacto tal cual pesa 17,8 GB porque incluye pesos, gradientes y los dos momentos de AdamW en punto flotante de 32 bits. Reanudar el entrenamiento exige del orden de 16-20 GB de memoria solo para estados del modelo y del optimizador, mas activaciones. Es viable en una unica GPU de 24 GB (RTX 3090, RTX 4090, A10G) con checkpointing de activaciones y micro-batch pequeno, o de forma holgada en A100 40/80 GB y H100 repartiendo con FSDP en varios rangos.
- Configuracion original: el checkpoint se genero con FSDP sobre ocho rangos (`rank0.pt`–`rank7.pt`), lo que sugiere un entrenamiento distribuido en ocho procesos.
- Opciones de despliegue: vLLM, TGI o llama.cpp/Ollama son las vias habituales, pero requieren primero unshardear el checkpoint y convertirlo a safetensors o GGUF; el repositorio no incluye pesos listos para estas herramientas. El script de unshard se ejecuta sobre el repositorio de OLMo.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este checkpoint y, al no ser un modelo final, cualquier cifra seria orientativa y no representativa de un modelo completamente midtrained.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| WattsIshaan/OLMo-2-1B-Midtrain-50B-AdamW-20percent | Clase 1B (conteo exacto no disponible) | No disponible | CC-BY-4.0 | Shards FSDP, requiere unshard | Checkpoint intermedio al 80 %; no es un modelo final |
| allenai/OLMo-2-0425-1B | Clase 1B | Segun la model card del modelo base (no verificada en la informacion proporcionada) | Apache 2.0 | Pesos safetensors para transformers | Modelo base final; es el punto de partida de este checkpoint |
| Llama-3.2-1B | 1,24 B | 128 000 tokens | Llama 3.2 Community License | Pesos safetensors, amplio soporte de herramientas | Alternativa de uso general con contexto mucho mayor y licencia con restricciones |
| Qwen2.5-1.5B | 1,54 B | 32 768 tokens (ampliable con YaRN) | Apache 2.0 | Pesos safetensors, buen soporte multilingue | Alternativa algo mayor, orientada a multilingue y con entrenamiento de instrucciones en variantes |

La comparacion con los tres ultimos modelos se basa en sus model cards publicas y no en evaluaciones ejecutadas sobre este artefacto. No hay datos de benchmarks de este checkpoint que permitan comparaciones de rendimiento; cualquier comparacion de calidad seria especulativa.

## Limitaciones y advertencias

- No es un modelo final: esta al 80 % del midtraining. Usarlo para inferencia directa producira una calidad inferior a la del modelo OLMo-2-0425-1B ya publicado.
- No esta ajustado por instrucciones: no hay plantilla de chat, ni RLHF, ni DPO documentados. No debe emplearse como asistente conversacional sin un ajuste posterior.
- Formato no estandar: los pesos son fragmentos FSDP en `.pt`. Sin ejecutar el script de unshard no se pueden cargar con `transformers`, vLLM ni llama.cpp, y el repositorio no incluye safetensors ni GGUF.
- Ambiguedad en el presupuesto de tokens: la model card declara 50 B tokens y el paso 19 000 con batch size 1 024, pero no indica la longitud de secuencia, por lo que no es posible reconciliar ambas cifras de forma directa. Conviene verificarlo antes de asumir equivalencias con otros runs.
- Riesgo de alucinacion: no evaluado. Como modelo base de 1B sin ajuste, la generacion de hechos poco frecuentes es inherentemente poco fiable.
- Sesgos: no documentados en la informacion proporcionada. El modelo hereda los sesgos del dataset Dolmino Mix 1124 y del preentrenamiento del modelo base, sin filtrado adicional declarado.
- Idiomas: no declarados. La composicion mayoritariamente angloparlante de los datos de midtraining de Ai2 hace previsible un rendimiento pobre en castellano, pero no hay evaluacion que lo confirme.
- Contexto: no declarado para este checkpoint; si se hereda del modelo base, seria corto en comparacion con modelos actuales, lo que limitaria tareas de contexto largo.
- Licencia: CC-BY-4.0 permite uso comercial con atribucion, pero sigue siendo necesario respetar las condiciones del modelo base y del dataset de origen, que no se detallan en la informacion proporcionada.
- Procedencia y mantenimiento: el repositorio tiene 0 descargas y 0 likes, esta publicado por un usuario individual y no cuenta con soporte oficial de Ai2. Antes de usarlo en produccion conviene validar la integridad de los ocho shards.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WattsIshaan/OLMo-2-1B-Midtrain-50B-AdamW-20percent
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B
- Dataset de midtraining: https://huggingface.co/datasets/allenai/dolmino-mix-1124
- Paper citado en la model card: https://arxiv.org/abs/2605.02105 ("Sharpness-Aware Pretraining Mitigates Catastrophic Forgetting", ICML 2026)
- Repositorio de OLMo (contiene `scripts/unshard.py`): https://github.com/allenai/OLMo
- Nota sobre la busqueda web: los resultados devueltos no guardaban relacion con el modelo (contenido de una plataforma de video bajo demanda), por lo que no se han incorporado como fuentes.
