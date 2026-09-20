# Stage-org/4b-diversity-HH-300-nyshot-27b-z-epoch3

## Resumen

El modelo `Stage-org/4b-diversity-HH-300-nyshot-27b-z-epoch3` es un checkpoint de 4.539.265.536 parametros (aproximadamente 4,54 mil millones) publicado por la organizacion Stage-org en HuggingFace. Se trata de un ajuste por aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3.5-4B`, segun se desprende de la configuracion de entrenamiento incluida en su model card. El repositorio contiene unicamente pesos en formato `safetensors` (9,1 GB) y no incluye pipeline declarado, licencia, idiomas soportados ni documentacion funcional mas alla de la procedencia del entrenamiento.

El checkpoint forma parte de una linea de trabajo experimental identificada por el prefijo `4b-diversity-HH-300-nyshot-27b-z`, entrenada sobre el dataset `Stage-org/4b-diversity-HH-300-nyshot-27b-z` durante 3 epocas y 10.000 pasos de learner, con un `seq_len` declarado de 300.000 y una ventana de inferencia configurada de 65.536 tokens en vLLM. La generacion de rollouts se realizo con `enable_thinking = true` y un parser de razonamiento `qwen3` y de tool calling `qwen3_coder`, lo que indica que el pipeline asume capacidades de razonamiento extendido y llamada a herramientas.

Su relevancia es limitada y fundamentalmente experimental: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, no publica resultados de benchmarks y no declara licencia. Resulta util como artefacto de investigacion para estudiar los efectos del RL con jurado automatico sobre un modelo denso de 4B, pero no como componente listo para produccion sin una evaluacion previa por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita; modelo base `Qwen/Qwen3.5-4B` (tag `qwen3_5`), presumiblemente transformer decoder-only denso |
| Parametros totales | 4.539.265.536 (~4,54 B), dato real de los safetensors |
| Parametros activos | no aplica / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | 65.536 tokens en la configuracion de inferencia (`max_model_len`); la configuracion de entrenamiento declara `seq_len` de 300.000, valor no confirmado como contexto efectivo del checkpoint |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. El unico dato estructural disponible es el modelo base declarado en la configuracion de entrenamiento, `Qwen/Qwen3.5-4B`, y el tag de HuggingFace `qwen3_5`. A partir del recuento real de parametros (4,54 B) y de que la configuracion de inferencia activa `language_model_only = true`, cabe deducir que el checkpoint resultante es unicamente el componente de lenguaje del modelo base, sin cabezas multimodales. No se documenta ningun cambio arquitectonico respecto al modelo original.

El entrenamiento se realizo con `prime_rl` en modo RL, con `learner_steps = 10000`, `learner_epoch = 3`, `batch_size = 128` y `group_size = 8` (esquema compatible con optimizacion tipo GRPO). El optimizador es AdamW con `lr = 1e-6`, `weight_decay = 0.0`, `max_norm = 1.0` y betas 0.9/0.99; la perdida usa `dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0` y `kl_tau = 0.001`. La atencion usa `flash_attention_2`. Los rollouts se generaron con temperatura 0.9, `top_p = 1.0`, `max_tokens = 4096` y modo thinking activado. La funcion de recompensa se apoyo en un jurado automatico externo servido por API (`gpt-5.6-luna`), con `reasoning_effort = medium` y hasta 32 peticiones en vuelo. El entrenamiento se ejecuto en un nodo con 2 GPU (1 para inferencia, 1 para entrenamiento) y un orquestador con hasta 256 rollouts en vuelo y un maximo de 8 pasos fuera de politica. No se especifica la composicion del dataset ni el volumen de tokens de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento: la configuracion de RL activa `enable_thinking = true` y un parser de razonamiento `qwen3`, lo que apunta a un modo de pensamiento extendido heredado del modelo base.
- Llamada a herramientas: la configuracion de vLLM declara `tool_call_parser = "qwen3_coder"`, por lo que el checkpoint esta preparado para emitir llamadas a funciones en el formato esperado por ese parser.
- Generacion de codigo: el uso del parser `qwen3_coder` sugiere soporte de salidas orientadas a codigo, si bien no se documenta ningun benchmark que lo cuantifique.
- Ventana de contexto amplia: hasta 65.536 tokens en la configuracion de inferencia publicada.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponibles; la inferencia se configura explicitamente como `language_model_only = true`.
- Comportamiento de agente multi-paso: no documentado de forma explicita, aunque el pipeline de entrenamiento contempla multiples pasos fuera de politica (`max_off_policy_steps = 8`) y un orquestador con rollouts concurrentes.

Nota: estas capacidades se infieren de la configuracion de entrenamiento e inferencia publicada, no de una evaluacion del checkpoint. No hay evidencia de que se hayan conservado tras el ajuste por RL.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el checkpoint sirve como punto de comparacion frente al modelo base `Qwen3.5-4B` para medir el efecto de 3 epocas de RL con jurado automatico sobre un modelo denso de 4B, aislando la variable del algoritmo de recompensa.
- Evaluacion de pipelines de RL: el repositorio documenta de forma reproducible el comando, la configuracion TOML completa y la procedencia del dataset, lo que permite replicar o auditar el entrenamiento en entornos de investigacion.
- Estudio del modo thinking: dado que la generacion se realizo con `enable_thinking = true` y temperatura 0.9, es util para analizar como evoluciona la longitud y estructura de las cadenas de razonamiento tras el ajuste.
- Prototipado de agentes con tool calling: el parser `qwen3_coder` permite integrar el modelo en un bucle de agente que emita llamadas a funciones, siempre que se valide primero la tasa de acierto en el formato de invocacion.
- Procesamiento de documentos largos en fase de prueba: con una ventana de 65.536 tokens configurada, admite tareas de resumen o extraccion sobre documentos extensos, sujeto a verificacion empirica de la degradacion por posicion.
- Generacion de codigo en entornos internos: puede emplearse en asistentes de autocompletado o revision de parches no criticos, con supervision humana, dado su tamano reducido y su coste de despliegue bajo.
- Fine-tuning posterior: al ser un modelo de 4,54 B con pesos en safetensors, es un punto de partida barato para ajustes especificos de dominio en una sola GPU de 24 GB.
- Analisis de sesgos inducidos por el jurado: permite estudiar como un juez automatico servido por API condiciona el estilo y las preferencias del modelo resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento real de parametros (4,54 B) y no de mediciones publicadas:
  - bf16/fp16: aproximadamente 9,1 GB solo de pesos, mas cache KV.
  - int8: aproximadamente 4,5-5 GB de pesos.
  - int4: aproximadamente 2,5-3 GB de pesos.
- La cache KV es el factor dominante a contexto largo: una ventana de 65.536 tokens exige memoria adicional muy superior a la de los pesos, especialmente en bf16.
- GPU recomendadas: el repositorio no especifica ninguna. En terminos generales, una GPU de 24 GB (RTX 3090, RTX 4090, L4, A10G) cubre la inferencia en bf16 con contexto moderado; para contexto completo resultan mas adecuadas A100 40/80 GB o H100.
- Uso en GPU de consumo: si cabe en tarjetas de 16-24 GB, empleando cuantizacion de 8 o 4 bits y limitando la longitud de contexto. No hay confirmacion del autor al respecto.
- Opciones de despliegue: la configuracion de entrenamiento emplea vLLM con `max_model_len = 65536`, `gpu_memory_utilization = 0.9`, `flash_attention_2` y los parsers `qwen3` y `qwen3_coder`, por lo que vLLM es la via documentada. No se mencionan llama.cpp, Ollama, TGI ni ningun otro motor, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stage-org/4b-diversity-HH-300-nyshot-27b-z-epoch3 | 4,54 B | 65.536 tokens en la configuracion de inferencia | No publicado | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base declarado) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Referenciado en la configuracion de entrenamiento |
| Alternativas de ~4 B de otros laboratorios | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados sobre modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia, lo que impide determinar si el uso comercial esta permitido. Debe contactarse con la organizacion autora antes de cualquier uso productivo.
- Ausencia de model card funcional: la documentacion se limita a la procedencia del entrenamiento (comando, configuracion TOML y dataset). No hay descripcion de capacidades, limites ni evaluaciones.
- Cero validacion externa: el repositorio registra 0 descargas y 0 likes, y no consta ninguna evaluacion de terceros.
- Riesgo de sobreajuste al jurado: al optimizarse contra un juez automatico servido por API (`gpt-5.6-luna`), el modelo puede haber aprendido a explotar los sesgos de ese juez en lugar de mejorar la calidad objetiva de las respuestas.
- Sesgos: no documentados. Al desconocerse la composicion del dataset `4b-diversity-HH-300-nyshot-27b-z`, no puede acotarse el sesgo heredado ni el inducido.
- Alucinacion: no se han publicado mediciones de fidelidad factual. El modo thinking activado durante el entrenamiento no garantiza una reduccion de alucinaciones.
- Contexto: aunque la inferencia se configura con 65.536 tokens, el `seq_len` declarado en el entrenamiento (300.000) y el de inferencia no coinciden, y no hay evaluacion de rendimiento en ventanas largas.
- Idiomas: no declarados, por lo que no puede asumirse soporte multilingue ni calidad en castellano.
- Ambiguedad del identificador: el sufijo `27b-z` del dataset y del checkpoint sugiere la intervencion de un modelo mayor de 27 B en la generacion de datos, pero es una inferencia a partir del nombre y no un dato confirmado.
- Despliegue: los pesos solo estan en safetensors; no hay GGUF ni cuantizaciones publicadas, por lo que el uso en llama.cpp u Ollama exigiria convertir los pesos por cuenta propia.
- Reproducibilidad: el entrenamiento dependio de un endpoint de jurado externo con claves de API y de rutas locales absolutas, lo que dificulta la replicacion exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/4b-diversity-HH-300-nyshot-27b-z-epoch3
- Dataset de entrenamiento referenciado: `Stage-org/4b-diversity-HH-300-nyshot-27b-z` (referenciado en la model card; no se ha verificado su disponibilidad publica)
- Modelo base referenciado: `Qwen/Qwen3.5-4B` (referenciado en la configuracion de entrenamiento)
- Paper, blog o repositorio del autor: no disponible
- Demo: no disponible
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante; los resultados obtenidos corresponden a portales de ofertas de empleo y no guardan relacion con el modelo.
