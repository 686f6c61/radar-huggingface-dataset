# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-dpo-v1

## Resumen

szl-receiptagent-qwen35-0.8b-dpo-v1 es un modelo de generacion de texto de aproximadamente 873 millones de parametros (873.438.784 segun los pesos en safetensors), desarrollado por SZLHOLDINGS dentro de su iniciativa de "estate" de IA gobernada. Se trata de un ajuste fino del modelo base SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez parte de la familia Qwen 3.5, y ha sido entrenado con una etapa de DPO (Direct Preference Optimization) sobre el checkpoint SFT. El nombre "receiptagent" sugiere un enfoque hacia agentes que generan y verifican recibos o resultados comprobables, coherente con la filosofia de "receipts" (evidencia medible) que el autor promueve en su model card.

El modelo se distribuye bajo licencia Apache 2.0 y con pesos en formato safetensors, con un tamano de repositorio de 1.8 GB. Declara soporte unicamente para ingles. La model card es deliberadamente minimalista en cuanto a especificaciones tecnicas: no incluye datos sobre longitud de contexto, composicion del dataset de entrenamiento, numero de tokens ni resultados de benchmarks. El autor indica explicitamente que cualquier cifra no respaldada por un "recibo" medido se etiqueta como UNKNOWN, lo que refleja una postura de honestidad documental pero deja al evaluador sin datos cuantitativos de rendimiento.

Su relevancia actual es limitada pero concreta: se trata de un modelo pequeno (sub-1000M) especializado en tareas de agente con verificacion, lo que lo hace candidato a despliegues en hardware modesto y a pipelines donde la trazabilidad de resultados importa mas que el rendimiento bruto. No obstante, la ausencia de benchmarks publicados y de documentacion sobre el entrenamiento obliga a tratarlo con cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo pertenece a la familia Qwen 3.5 (tag `qwen3_5` en Hugging Face), lo que implica una arquitectura transformer decoder-only, aunque no se detallan capas, dimensiones ocultas, cabezas de atencion ni mecanismos de atencion especificos (lineal, sliding window, etc.). El numero de parametros (873M) situa al modelo en la gama pequena, adecuada para inferencia en GPU de consumo.

El proceso de entrenamiento consta de al menos dos etapas documentadas por el nombre del artefacto: un ajuste supervisado (SFT) sobre el que se construye el modelo base `szl-receiptagent-qwen35-0.8b-sft-v3`, y una etapa posterior de DPO (Direct Preference Optimization) que da lugar a esta version `dpo-v1`. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la procedencia de los datos de preferencia ni si hubo etapas adicionales de RLHF. La model card menciona ficheros de "receipts" (por ejemplo, `receipts/eval/doctrine-abstention-eval-2026-11-05.json` y `receipts/eval_battery.json`) que, segun el autor, contendrian las afirmaciones de entrenamiento y evaluacion, pero el escaneo estricto realizado el 2026-11-22 clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, sin un `DONE.json` valido en el estandar estricto, y la evidencia de evaluacion queda como UNKNOWN.

No se documentan innovaciones tecnicas destacables como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto en ingles: el modelo es un `text-generation` puro segun el pipeline declarado.
- Ajuste orientado a agentes de "recibos" (receipt agents): por el nombre y los ficheros de evaluacion (`doctrine-abstention-eval`), parece entrenado para tareas de abstencion controlada y generacion de resultados verificables, aunque no se detalla el mecanismo.
- Posible soporte de abtencion doctrinal: existe un recibo de evaluacion especifico sobre "doctrine-abstention", lo que sugiere capacidad de rechazar o abstenerse ante consultas fuera de dominio, si bien no se aportan metricas.
- Capacidades multilingues: limitadas al ingles declarado; no se documentan otros idiomas.
- Tool calling / function calling: no documentado.
- Razonamiento multi-paso y agentes: no documentado explicitamente, aunque el nombre del modelo apunta a ese uso.
- Vision, audio, thinking mode: no disponible.

## Casos de uso

- Clasificacion y extraccion de datos de recibos y facturas: el modelo, por su nombre y su etapa de DPO orientada a abtencion, puede emplearse para extraer campos estructurados de documentos de gasto y abstenerse cuando la confianza sea baja, reduciendo errores en pipelines contables.
- Agente de verificacion en pipelines de CI/CD: integrado como paso de validacion que genera un "recibo" textual de cada ejecucion y se abstiene de afirmar resultados no comprobados, en linea con la filosofia del autor.
- Atencion al cliente de bajo coste en ingles: al ser un modelo de 873M, puede desplegarse en GPU de consumo para respuestas multi-turno sencillas donde el contexto requerido sea moderado (la longitud exacta de contexto no esta documentada, por lo que debe validarse antes de produccion).
- Prototipado rapido de agentes con trazabilidad: util en entornos de investigacion donde se quiere un modelo pequeno que genere resultados acompanados de justificacion o abtencion, y donde el coste de inferencia es critico.
- Filtrado y moderacion de contenido con abtencion: la doctrina de abtencion evaluada en los recibos sugiere uso como clasificador conservador que deriva a revision humana cuando no esta seguro.
- Despliegue en edge o en portatiles: con 873M de parametros y pesos safetensors de 1.8 GB, es viable en GPUs consumer de 8-12 GB (previa cuantizacion, aunque no se publican variantes GGUF) para tareas de generacion de texto en ingles.
- Educacion y demos: modelo ligero para ensenar tecnicas de DPO y evaluacion con recibos en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que "no benchmark number is asserted on this card beyond what a dated audit measured" y que la evidencia de evaluacion es UNKNOWN al no existir un `DONE.json` estricto. Los ficheros `doctrine-abstention-eval-2026-11-05.json` y `receipts/eval_battery.json` podrian contener metricas, pero no se han validado como evidencia en el escaneo del 2026-11-22.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,75 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, 3-4 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB. No se publican variantes cuantizadas oficiales, por lo que habria que generarlas con herramientas como llama.cpp o AutoGPTQ.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y similares, con margen amplio.
- Opciones de despliegue: transformers (libreria declarada), y previsiblemente vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF, aunque no se documentan integraciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-dpo-v1 | 873M | No disponible | Apache 2.0 | en | No |
| Qwen2.5-0.5B / Qwen3-0.6B (familia Qwen) | ~500-600M | 32K (Qwen2.5-0.5B) | Apache 2.0 | Multi (incluye en, es) | Si (MMLU, GSM8K, etc.) |
| SmolLM2-1.7B (Hugging Face) | 1.7B | 8K | Apache 2.0 | en (principalmente) | Si |
| TinyLlama-1.1B | 1.1B | 2K | Apache 2.0 | en | Si |

La comparativa es aproximada: los modelos de la familia Qwen y SmolLM2 publican benchmarks y contexto, mientras que este modelo no aporta ninguno de esos datos, lo que dificulta una comparacion cuantitativa. La ventaja diferencial declarada es el ajuste DPO orientado a abtencion y trazabilidad, no el rendimiento bruto.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia medida de calidad, razonamiento, codigo o matematicas; cualquier afirmacion de rendimiento seria especulativa.
- Documentacion de entrenamiento incompleta: se desconoce el dataset, el numero de tokens, la composicion de las preferencias DPO y si hubo filtrado de datos.
- Solo ingles: no soporta castellano ni otros idiomas de forma declarada, lo que limita su uso en el mercado hispanohablante.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- Riesgo de alucinacion: al ser un modelo pequeno y sin evaluacion publicada, la probabilidad de generar contenido erroneo es alta, especialmente fuera de su dominio de entrenamiento.
- Sesgos: no documentados; al entrenarse presumiblemente con datos en ingles, puede heredar sesgos culturales y linguisticos de esos corpus.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantias y de evaluacion hace recomendable una validacion exhaustiva antes de produccion.
- Estado de "receipts": el repositorio no cumple el estandar estricto de evidencia del propio autor (`RECEIPT_FILES_NO_DONE`), por lo que las afirmaciones de la model card no estan respaldadas por un `DONE.json` valido.
- Fecha de creacion futura (2026-11-05) y actualizacion (2026-11-22): conviene verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-dpo-v1
- Organizacion SZLHOLDINGS: https://huggingface.co/SZLHOLDINGS
- Modelo base SFT: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Repositorio de la organizacion en GitHub: https://github.com/szl-holdings
- Herramienta estate-cards weaver: https://github.com/szl-holdings/estate-cards
