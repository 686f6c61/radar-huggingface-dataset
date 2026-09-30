# zeechimp/hv-acausal-memory

## Resumen

hv-acausal-memory es un banco de memoria de vectores ternarios dispersos construido sobre una arquitectura vector-simbolica (vector-symbolic architecture, VSA). No es un modelo de lenguaje ni una red neuronal entrenada: es una implementacion en NumPy puro, de aproximadamente 14 KB de codigo fuente y sin pesos, publicada por el usuario zeechimp bajo licencia MIT con pipeline declarado de feature-extraction. Resuelve un problema concreto en el diseno de agentes y sistemas de recuperacion: como mantener una memoria asociativa acotada, robusta al ruido y capaz de olvidar y recuperar entradas sin reentrenamiento.

Sus tres mecanismos distintivos son un forget-gate adaptativo (la tasa de decaimiento β escala con la presion de memoria, de 0.02 con bancos vacios a 0.30 con bancos llenos), la resurreccion de anclas muertas mediante recordatorios de clave exacta o parcial, y el prefetch acausal, que ordena candidatos a partir de consultas parciales con dimensiones puestas a cero antes de disponer de la consulta completa. El repositorio reporta 16/16 comprobaciones de consistencia superadas y un tiempo de ejecucion de unos 30 segundos para el benchmark completo.

Es relevante ahora porque la memoria persistente de agentes es un cuello de botella activo en el ecosistema open source, y esta propuesta ofrece una alternativa sin GPU, sin entrenamiento y con dependencias minimas (solo NumPy) para experimentar con politicas de olvido y recuperacion especulativa. La escala tipica de trabajo usa D=5000 dimensiones, nnz=200 componentes no nulos por vector y bancos de hasta 4000 anclas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Banco de memoria asociativa de vectores ternarios dispersos (vector-symbolic architecture, VSA) con forget-gate adaptativo, resurreccion y prefetch acausal; implementado en NumPy puro, sin red neuronal entrenada |
| Parametros totales | No disponible (no hay pesos; el repositorio contiene aproximadamente 14 KB de codigo fuente) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la dimensionalidad tipica de los vectores es D=5000) |
| Tipos de cuantizacion | Vectores ternarios dispersos con valores en {-1, 0, +1}; almacenamiento disperso con indices uint16 y valores int8 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No hay pesos. Distribucion como codigo fuente Python (aproximadamente 14 KB). No se publican safetensors, GGUF ni binarios equivalentes |

## Arquitectura y entrenamiento

La arquitectura es un banco de memoria asociativo dentro del paradigma de vector-symbolic architecture (VSA, tambien conocido como hyperdimensional computing). Cada ancla se representa como un par clave-valor de vectores ternarios dispersos de dimension D con exactamente nnz componentes no nulos, generados aleatoriamente. La clase principal es `HyperNSV`, que expone `store`, `retrieve`, `mark_retrieved`, `acausal_prefetch`, `step_time`, `resurrect` y `stats`. La recuperacion se hace por similitud sobre las dimensiones conocidas, con una similitud cruzada aleatoria entre anclas de aproximadamente 0.014 frente a una similitud de la consulta con su propia clave de 0.4-0.6.

El forget-gate aplica un decaimiento del peso de cada ancla con tasa β dependiente de la presion de memoria: β = 0.02 en bancos vacios y β = 0.30 en bancos llenos. Este mecanismo evita el crecimiento ilimitado del banco (el autor lo denomina "nostalgia loop"). La resurreccion revive anclas cuyo peso ha caido por debajo de un umbral cuando llega un recordatorio: con clave exacta la tasa es del 100%, y con recordatorios parciales la tasa es proporcional al solapamiento. El prefetch acausal devuelve candidatos especulativos ordenados por similitud calculada solo sobre las dimensiones no nulas de una consulta parcial.

No hay entrenamiento ni datos de entrenamiento: el propio autor incluye la etiqueta `no-training` y no se menciona RLHF, DPO ni ajuste alguno. La innovacion tecnica esta en la gestion dinamica de la memoria (olvido proporcional a la presion, resurreccion y recuperacion especulativa) mas que en el aprendizaje de representaciones.

## Capacidades

- Almacenamiento y recuperacion asociativa de pares clave-valor sobre vectores ternarios dispersos de alta dimension (D=5000 en los ejemplos).
- Recuperacion robusta al ruido de consulta: la model card reporta recuperacion perfecta con p=0.2 de ruido y colapso alrededor de p≈0.5.
- Olvido controlado mediante forget-gate adaptativo, con tasa de decaimiento dependiente de la ocupacion del banco.
- Resurreccion de anclas: 100% con recordatorio de clave exacta y aproximadamente 70% con recordatorio parcial manteniendo el 50% de las dimensiones.
- Prefetch acausal: clasificacion de candidatos a partir de consultas parciales, con top-1 de 1.000 al 50% de retencion sin ruido.
- Refuerzo de anclas recuperadas mediante `mark_retrieved`, que incrementa su peso.
- Avance temporal del banco mediante `step_time(dt)` para aplicar el decaimiento.
- Consulta de estadisticas internas del banco (`stats`).
- Sin soporte de tool calling, generacion de texto, vision, audio ni capacidades multilingues: no es un modelo generativo.
- Sin dependencias mas alla de NumPy, por lo que funciona en CPU sin aceleracion.

## Casos de uso

- Prefetch especulativo en agentes conversacionales: cuando el contexto de una consulta esta incompleto (por ejemplo, un turno parcialmente transcrito o truncado), `acausal_prefetch` puede devolver candidatos de memoria antes de que llegue la consulta completa, reduciendo la latencia percibida en la recuperacion de informacion episodica.
- Cache de memoria de sesion con olvido acotado: en un asistente de larga duracion, el forget-gate escala β con la ocupacion del banco, lo que impide que la memoria crezca sin limite y elimina entradas obsoletas de forma gradual en lugar de por purga abrupta.
- Recuperacion tolerante al ruido en pipelines de embeddings: el comportamiento reportado a p=0.2 de ruido permite usar el banco sobre representaciones degradadas (por ejemplo, hashes parciales o features cuantizadas) sin perder exactitud en la recuperacion.
- Prototipado de sistemas de memoria en investigacion cognitiva y VSA: al ser NumPy puro y ejecutarse en unos 30 segundos el benchmark completo, sirve como banco de pruebas reproducible para comparar politicas de olvido y umbrales de resurreccion.
- Deduplicacion y cache semantica con reactivacion: entradas retiradas por bajo peso pueden volver a activarse si reaparece una clave similar, util en sistemas de cache donde patrones de acceso son intermitentes.
- Memoria episodica para agentes multi-paso: integrable como capa de memoria auxiliar en flujos donde el agente necesita recordar decisiones previas y descartar las irrelevantes, sin coste de GPU ni de entrenamiento.
- Evaluacion de limites de capacidad en VSA: el repositorio documenta el regimen de degradacion (visible sin ruido en N=4000, no visible a p=0.2), lo que permite calibrar D y nnz para una carga de anclas objetivo antes de integrarlo en un sistema mayor.

## Benchmarks y rendimiento

Los datos disponibles son diagnosticos internos de recuperacion publicados en la model card, no benchmarks estandar de LLM (no hay MMLU, HumanEval ni GSM8K, ya que no es un modelo de lenguaje).

| Diagnostico | Resultado |
|---|---|
| Recuperacion sin ruido (200 anclas) | 1.000 |
| Recuperacion con ruido p=0.2 | 1.000 |
| Punto de colapso de la recuperacion | p ≈ 0.5 |
| Capacidad sin ruido, N=4000 | degrada por debajo de 1.0 |
| Capacidad con p=0.2, N=4000 | sigue en 1.0 |
| Tasa de resurreccion con clave exacta | 100% |
| Resurreccion con clave parcial (keep=0.5) | aproximadamente 70% |
| Prefetch acausal top-1 al 50% de retencion, sin ruido | 1.000 |
| Comprobaciones de consistencia | 16/16 superadas |

## Requisitos de hardware

- VRAM estimada: 0 GB. El modelo no usa GPU; toda la computacion es NumPy sobre CPU.
- GPU recomendadas: ninguna. No hay soporte de CUDA ni de aceleradores especificos.
- Compatibilidad con GPU de consumo: no aplica, al no requerir GPU.
- Opciones de despliegue: importacion directa del paquete Python (`from hv_acausal_memory import ...`). No hay integracion documentada con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se publican cifras de latencia por operacion. El unico dato temporal disponible es que el benchmark completo tarda aproximadamente 30 segundos en ejecutarse.
- Huella de almacenamiento: con D=5000 y nnz=200, el diseno disperso ocupa 1200 bytes por ancla (234 KB para 200 anclas), frente a 10.000 bytes por ancla (1953 KB para 200 anclas) en el layout denso con int8 x 2.

## Comparativa con modelos similares

La comparacion con modelos de lenguaje no procede, ya que hv-acausal-memory no es un modelo de lenguaje. En la categoria de sistemas de memoria para agentes, la busqueda web solo ha devuelto una referencia comparable, y la informacion disponible no permite una comparacion cuantitativa homogenea.

| Sistema | Enfoque | Requiere entrenamiento | Dependencias | Licencia | Datos comparables |
|---|---|---|---|---|---|
| hv-acausal-memory | Banco VSA ternario disperso con forget-gate, resurreccion y prefetch acausal | No | NumPy | MIT | Diagnosticos internos de recuperacion (ver seccion anterior) |
| Hindsight (vectorize-io) | Sistema de memoria de agentes con aprendizaje | No disponible | No disponible | No disponible | Reporta resultados estado del arte en LongMemEval |
| Otros sistemas de memoria o bases vectoriales | No disponibles en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas. Solo almacena y recupera vectores. Cualquier descripcion como "modelo de IA" en el sentido convencional seria incorrecta.
- No tiene pesos entrenados ni datos de entrenamiento; el comportamiento emerge de la geometria de los vectores ternarios y de las reglas de gestion de memoria.
- Capacidad acotada por la cota clasica de VSA, N ≈ D/(2 log D). Para D=5000 el limite teorico en regimen sin ruido es de aproximadamente 290 anclas, y la degradacion se hace visible en N=4000.
- Colapso de recuperacion con ruido en la consulta a partir de p ≈ 0.5.
- Resurreccion imperfecta con recordatorios parciales: aproximadamente 70% con la mitad de las dimensiones retenidas, lo que implica falsos negativos en la reactivacion de memorias.
- No hay informacion sobre sesgos, ya que no se procesa lenguaje ni datos humanos; la nocion de sesgo demografico no aplica.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de recuperacion erronea si la similitud cruzada aleatoria entre anclas supera el umbral de decision en bancos muy poblados.
- Idiomas soportados: no disponible. El sistema opera sobre vectores, no sobre texto, por lo que el soporte idiomatico depende del codificador externo que genere las claves.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion. No se declaran restricciones adicionales.
- Advertencia de madurez para produccion: el repositorio registra 0 descargas y 1 like en el momento de la consulta, con un unico autor y sin historial de mantenimiento. La validacion se limita a 16 comprobaciones de consistencia internas.
- La documentacion de referencia sobre resurreccion y prefetch acausal proviene exclusivamente de la model card del autor, sin revision por pares ni replicacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeechimp/hv-acausal-memory
- Hindsight, sistema de memoria para agentes (referencia de la busqueda web): https://github.com/vectorize-io/hindsight
- Paper Jev-Mem: System-One-Controlled Agentic Memory for Efficient AI Agents: https://huggingface.co/papers/2609.23986
- Hugging Face, portal general: https://huggingface.co/
- LLM Leaderboard de Artificial Analysis (referencia de benchmarks de LLM, no aplicable a este repositorio): https://artificialanalysis.ai/leaderboards/models
- CausalMLBook, inferencia causal aplicada con ML e IA (referencia de la busqueda web, no relacionada directamente): https://causalml-book.org/
