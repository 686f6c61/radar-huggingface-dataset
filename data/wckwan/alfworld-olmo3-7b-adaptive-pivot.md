# wckwan/Alfworld-Olmo3-7B-Adaptive-Pivot

## Resumen

Alfworld-Olmo3-7B-Adaptive-Pivot es un ajuste fino de allenai/Olmo-3-7B-Instruct publicado por el usuario wckwan en HuggingFace. No se trata de un modelo base nuevo, sino de una política (policy) entrenada con aprendizaje por refuerzo para actuar como agente de búsqueda multi-turno al estilo Search-R1: el modelo genera consultas a una herramienta de búsqueda, recibe las respuestas y encadena varios pasos hasta resolver la tarea. El entrenamiento emplea Process-GRPO, una variante de GRPO en la que un modelo de recompensa de proceso (un verificador basado en Olmo-3-7B-Think) puntúa cada turno de la trayectoria en lugar de evaluar únicamente el resultado final.

El interés de esta ficha es acotado: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, orientado a reproducir y estudiar metodologías de RL con recompensa de proceso sobre herramientas externas. La innovación declarada por el autor es la normalización de ventajas por (grupo, posición de turno) y el uso de prompts de verificador que incluyen tanto las respuestas recuperadas de la herramienta como la respuesta dorada, lo que permite señalar qué turno concreto de la trayectoria fue útil o perjudicial.

El repositorio ocupa 43,8 GB e incluye, además de la política final (paso 60), checkpoints intermedios en los subdirectorios `step_20/` y `step_40/`. La licencia es Apache 2.0, heredada del modelo base. No se han publicado en la información disponible datos de arquitectura interna, longitud de contexto, idiomas soportados ni resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; hereda la del modelo base allenai/Olmo-3-7B-Instruct (decoder-only transformer) |
| Parametros totales | 7B (segun la denominacion del modelo y su modelo base) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio se distribuye en safetensors (43,8 GB en total, incluyendo checkpoints intermedios) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de allenai/Olmo-3-7B-Instruct y se entrena como política de un agente de búsqueda multi-turno. El algoritmo es Process-GRPO: sobre el esquema de GRPO (optimizacion de politica con ventajas relativas dentro de un grupo de muestras), se incorpora un modelo de recompensa de proceso —un verificador Olmo-3-7B-Think— que puntua cada turno de la trayectoria. La contribucion técnica declarada es la normalizacion de ventajas por par (grupo, posicion de turno), junto con prompts de verificador que incluyen las respuestas recuperadas por la herramienta y la respuesta dorada. Esto permite una señal de recompensa mas granular que la habitual en RL con recompensa de resultado.

El autor reporta que el paso 60 alcanza una puntuacion media de recompensa de proceso de aproximadamente 0,93, con una media de 2,6 busquedas por trayectoria (politica multi-busqueda no colapsada) y una precision en el lote de entrenamiento de aproximadamente 0,49. No se detallan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de DPO o RLHF mas alla del proceso descrito.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base instruct.
- Razonamiento multi-paso con llamadas a herramientas externas (tool use), especificamente busqueda.
- Encadenamiento de multiples consultas de busqueda dentro de una misma trayectoria: media de 2,6 busquedas por trayectoria en el paso 60.
- Uso de respuestas de herramienta como contexto intermedio para reformular consultas posteriores.
- Formato de pesos compatible con el ecosistema transformers y con el pipeline text-generation.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles (no se declaran).
- Modo de razonamiento explicito (thinking mode): no declarado para esta politica, aunque el verificador utilizado deriva de un modelo Think.

## Casos de uso

- Investigacion en RL con recompensa de proceso: reproducir el pipeline Process-GRPO y comparar la normalizacion de ventajas por (grupo, turno) frente a esquemas de recompensa de resultado, usando los checkpoints `step_20`, `step_40` y el paso 60 para analizar la evolucion de la politica.
- Desarrollo de agentes de busqueda multi-turno: servir como punto de partida para ajustar una politica que decide cuando y como consultar un motor de busqueda en tareas de preguntas y respuestas con recuperacion.
- Evaluacion de verificadores de proceso: emplear el modelo junto a un verificador tipo Olmo-3-7B-Think para estudiar la calidad de la senal de recompensa por turno y su correlacion con la precision final.
- Experimentos de destilacion o ablacion: los checkpoints intermedios permiten analizar en que punto del entrenamiento la politica aprende a diversificar las busquedas en lugar de colapsar a una sola consulta.
- Tareas de resolucion de problemas con entorno textual: el nombre del modelo referencia ALFWorld, un entorno de tareas textuales, por lo que es plausible su uso en entornos de agentes basados en texto, aunque la informacion disponible no confirma la evaluacion en dicho benchmark.
- Docencia y divulgacion tecnica: ejemplo reproducible de un ajuste por RL sobre un modelo abierto de 7B con licencia permisiva, util para explicar GRPO y recompensas de proceso.
- Base para agentes con tool calling especializado: sustituyendo la herramienta de busqueda por otra API, la politica puede reentrenarse para flujos de recuperacion sobre documentacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos aportados por el autor son metricas de entrenamiento del paso 60:

| Metrica de entrenamiento | Valor |
|---|---|
| Puntuacion media de recompensa de proceso | ~0,93 |
| Busquedas por trayectoria | ~2,6 |
| Precision en el lote de entrenamiento | ~0,49 |

Estas cifras corresponden al proceso de entrenamiento interno del autor y no son comparables con benchmarks estandar (MMLU, GSM8K, HumanEval, etc.), para los que no hay datos.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits (bf16/fp16) para un modelo de 7B: en torno a 14-16 GB solo de pesos, mas el overhead de cache KV y activaciones, lo que en la practica exige GPUs de 24 GB o mas para contextos amplios.
- Cuantizacion en 8 bits: aproximadamente 7-8 GB de pesos, viable en GPUs consumer de 12-16 GB.
- Cuantizacion en 4 bits: aproximadamente 4-5 GB de pesos, viable en GPUs consumer de 8-12 GB. No se confirma que el autor haya publicado pesos cuantizados; el repositorio solo contiene safetensors.
- GPUs recomendadas: para una sola instancia en 16 bits, A100 40 GB, H100, L40S o RTX 4090 24 GB. Para despliegue con lotes grandes o contexto largo, multiples GPUs.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 o similares, aplicando cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM`), vLLM o TGI para servir con safetensors, y conversiones a GGUF para llama.cpp u Ollama (no publicadas por el autor, requeririan conversion propia).
- Latencia y throughput estimados: no disponibles. El repositorio incluye varios checkpoints (raiz, `step_20`, `step_40`), por lo que conviene descargar solo el subdirectorio necesario y no el repositorio completo de 43,8 GB.
- Nota de integracion: el modelo no incluye el bucle de agente ni el cliente de la herramienta de busqueda; hay que implementarlos en el codigo de aplicacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wckwan/Alfworld-Olmo3-7B-Adaptive-Pivot | 7B | No disponible | Apache 2.0 | HuggingFace (0 descargas, 0 likes) | Politica de busqueda multi-turno entrenada con Process-GRPO; checkpoints en paso 20, 40 y 60 |
| allenai/Olmo-3-7B-Instruct | 7B | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace | Modelo base instruct; sin entrenamiento especifico de agente de busqueda |
| Otros modelos de la familia Search-R1 | No disponible | No disponible | No disponible | No disponible | Se cita como metodologia de referencia, pero no se dispone de especificaciones en la informacion proporcionada |

No se dispone de datos verificados de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes: no hay validacion por parte de la comunidad ni reportes independientes de comportamiento en produccion.
- Precision en el lote de entrenamiento de ~0,49: la propia metrica reportada por el autor sugiere un rendimiento moderado en la tarea de entrenamiento, insuficiente para asumir un uso fiable sin evaluacion propia.
- Sesgos conocidos: no disponibles. Al derivar de Olmo-3-7B-Instruct, hereda los sesgos del modelo base y de los datos de entrenamiento, no documentados en esta ficha.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en tareas de recuperacion es esperable que el modelo pueda generar afirmaciones no respaldadas por las respuestas de la herramienta, especialmente fuera de la distribucion de entrenamiento.
- Dependencia del entorno: la politica esta entrenada sobre un escenario concreto de busqueda multi-turno; su comportamiento fuera de ese formato de prompt y de herramienta puede degradarse notablemente.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y atribucion correspondiente. Conviene verificar tambien las condiciones del modelo base allenai/Olmo-3-7B-Instruct.
- Requisito de infraestructura adicional: el repositorio solo contiene pesos; es necesario implementar el bucle de agente, el cliente de la herramienta de busqueda y, en su caso, el verificador de proceso para reproducir el entrenamiento o evaluar trayectorias.
- Fecha de publicacion inusualmente avanzada en los metadatos (2026-09-13) y ausencia de documentacion adicional: conviene tratar las cifras del autor como no verificadas de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wckwan/Alfworld-Olmo3-7B-Adaptive-Pivot
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Metodologia Process-GRPO y Search-R1: citadas en la model card del autor, sin enlace directo proporcionado en la informacion disponible
- Verificador Olmo-3-7B-Think: mencionado en la model card, sin enlace directo proporcionado en la informacion disponible
- Resultados de busqueda web: no se ha recuperado ninguna fuente relevante sobre este modelo; los resultados devueltos corresponden a sitios de noticias deportivas y no guardan relacion con el modelo.
