# symmetrisch/Qwen3.8-27B-heretic-ara-v1-GGUF

## Resumen

Esta ficha cubre `symmetrisch/Qwen3.8-27B-heretic-ara-v1-GGUF`, una coleccion de cuantizaciones GGUF del modelo `symmetrisch/Qwen3.8-27B-heretic-ara-v1`, que a su vez es una version "decensored" (abliterada) del hipotetico `Qwen/Qwen3.8-27B`. El autor, `symmetrisch`, empleo la herramienta Heretic v2.1.0 con la tecnica Arbitrary-Rank Ablation (ARA) para reducir la tasa de rechazos del modelo original manteniendo, segun sus metricas, la mayor parte del comportamiento util. El resultado se distribuye unicamente en formato GGUF para `llama.cpp`, sin fichero de vision (`mmproj`), por lo que es un modelo de texto.

El modelo cuenta con 26.895.998.464 parametros totales (unos 26,9 mil millones) y una licencia Apache 2.0 declarada. La relevancia de esta publicacion es doble: por un lado, ofrece una variante sin censura alineada sobre una base de la familia Qwen 3.x; por otro, documenta de forma inusualmente detallada el proceso de abliteracion (parametros ARA, numero de ensayos, divergencia KL y tasa de rechazos), lo que permite evaluar el compromiso entre "descensura" y degradacion de capacidades.

Conviene senalar que la informacion disponible es muy limitada en varios frentes: no hay datos de benchmarks de tareas (MMLU, HumanEval, etc.), no se especifica la longitud de contexto nativa del modelo base ni los idiomas soportados, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. Todo lo que sigue se basa exclusivamente en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre del tensor `ssm_beta_alpha` sugiere componentes de space-state model / hibrida, pero no se confirma en la informacion) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible de forma nativa; el ejemplo de uso emplea `-c 32768` |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `Qwen/Qwen3.8-27B` en los datos facilitados: no se detalla si es un transformer denso, un MoE o una arquitectura hibrida. La unica pista tecnica es la referencia al tensor combinado `ssm_beta_alpha` en el proceso de conversion a GGUF, que apunta a la presencia de capas de tipo state-space (SSM) en el grafo, aunque no se confirma. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo que si esta documentado es el proceso de modificacion posterior: se aplico Heretic v2.1.0 con Arbitrary-Rank Ablation (ARA) sobre el modelo base, en precision completa (BF16), con 1150 ensayos (250 de arranque) y seleccion del ensayo 948. Los parametros ARA fueron `start_layer_index=4`, `end_layer_index=64`, `preserve_good_behavior_weight=0.5711`, `steer_bad_behavior_weight=0.0001`, `overcorrect_relative_weight=0.9925` y `neighbor_count=9`. El hardware empleado fue una NVIDIA A100-SXM4-80GB. Segun las metricas del autor, la tasa de rechazos cayo de 98/100 en el original a 8/100 en esta variante, con una divergencia KL de 0.0830 respecto al modelo base.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el ejemplo con `--jinja` indican soporte de plantillas de chat.
- Razonamiento y generacion de texto general: heredadas del modelo base Qwen 3.8-27B, aunque sin benchmarks publicados que lo cuantifiquen.
- Reduccion de rechazos: la abliteracion reduce drasticamente las negativas explicitas (8/100 frente a 98/100), lo que amplia el rango de peticiones que el modelo responde.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles.
- Vision: no soportada (el autor indica explicitamente "Text only; no mmproj (vision) file is included").
- Modo "thinking": no confirmado.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: el modelo sirve como caso de estudio reproducible para medir el efecto de ARA sobre la tasa de rechazos y la divergencia KL, comparando directamente con el modelo original.
- Generacion creativa sin restricciones de contenido: escritura de ficcion, guiones o narrativa que aborde temas sensibles, aprovechando la baja tasa de rechazos (8/100) documentada por el autor.
- Despliegue local en estaciones de trabajo: con cuantizaciones de 16 a 27 GiB, puede ejecutarse en `llama.cpp` sobre GPUs de consumo alto o configuraciones multi-GPU, sin depender de APIs externas.
- Experimentacion con prompts adversarios: util para estudiar el comportamiento de modelos descensurados en entornos controlados de red teaming y evaluacion de seguridad.
- Prototipado de asistentes conversacionales: gracias al soporte de plantillas Jinja y al formato GGUF, se integra rapidamente en `llama-server` para pruebas de concepto de chat multi-turno (con contexto configurable, p. ej. 32768 tokens).
- Analisis de sesgos y contenido: permite comparar respuestas del modelo abliterado frente al original para identificar que comportamientos se han visto afectados por la ablacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas facilitadas son las del proceso de abliteracion:

| Metrica | Este modelo | Original (Qwen/Qwen3.8-27B) |
|---|---|---|
| Rechazos (keyword matching) | 8/100 | 98/100 |
| Divergencia KL | 0.0830 | 0 (por definicion) |

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q4_K_M ~16 GiB, Q5_K_M ~19 GiB, Q6_K ~21 GiB, Q8_0 ~27 GiB (mas overhead de contexto KV cache).
- GPU recomendadas: A100 80GB o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contextos moderados; Q6_K y Q8_0 requieren 24 GB o mas, o reparto entre varias GPUs.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con Q4_K_M o Q5_K_M; Q6_K y Q8_0 quedan al limite o exigen offloading parcial a CPU.
- Opciones de despliegue: `llama.cpp` (obligatorio en version reciente; el autor cita el commit a300a9c33 y advierte de fallos con runtimes antiguos como LM Studio 2.66.0 y 2.73.0), `llama-server` con `--jinja`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| symmetrisch/Qwen3.8-27B-heretic-ara-v1-GGUF | ~26,9 B | No disponible (ejemplo con 32768) | GGUF | Apache 2.0 | Abliterado con ARA; 8/100 rechazos; solo texto |
| symmetrisch/Qwen3.8-27B-heretic-ara-v1 | ~26,9 B | No disponible | No disponible | Apache 2.0 | Modelo base sin cuantizar del que derivan los GGUF |
| Qwen/Qwen3.8-27B | No disponible | No disponible | No disponible | No disponible | Modelo original; 98/100 rechazos segun Heretic |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina mecanismos de rechazo, lo que puede facilitar la generacion de contenido danino, sesgado o inapropiado; no es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- La divergencia KL de 0.0830 indica una desviacion medible respecto al modelo original; no se han publicado evaluaciones de tareas que cuantifiquen la perdida de capacidades.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se dispone de datos especificos para este modelo.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no especificados; el rendimiento fuera del ingles/chino (idiomas tipicos de la familia Qwen) es incierto.
- Compatibilidad estricta con `llama.cpp` reciente: los ficheros usan el layout combinado `ssm_beta_alpha` y fallan en runtimes antiguos con `tensor 'blk.0.ssm_beta.weight' not found`.
- Sin soporte de vision: no hay fichero `mmproj`.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo abliterado en produccion; se recomienda auditoria propia.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validacion comunitaria disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/symmetrisch/Qwen3.8-27B-heretic-ara-v1-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/symmetrisch/Qwen3.8-27B-heretic-ara-v1
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
