# Stage-org/4b-diversity-history-selfsource-300-27b-z-epoch3

## Resumen

`Stage-org/4b-diversity-history-selfsource-300-27b-z-epoch3` es un ajuste por aprendizaje por refuerzo (RL) del modelo base `Qwen/Qwen3.5-4B`, publicado por la organizacion Stage-org. El resultado es un modelo denso de aproximadamente 4,54 mil millones de parametros (4.539.265.536, segun los pesos en safetensors) orientado a tareas de razonamiento con modo "thinking" activado durante la generacion. El repositorio tiene un tamano de 9,1 GB, coherente con pesos almacenados en precision bf16/fp16.

El modelo no es un lanzamiento de proposito general con model card comercial, sino el artefacto de un pipeline de investigacion interna: la model card documenta unicamente la procedencia del entrenamiento ("training provenance"), el comando de ejecucion y el fichero de configuracion TOML. Se entrena sobre un dataset denominado `Stage-org/4b-diversity-history-selfsource-300-27b-z`, con un juez externo (`gpt-5.6-luna`) que puntua las respuestas abiertas dentro de un bucle de RL por grupo (group size 8).

Es relevante como ejemplo de receta de RL aplicada a un modelo pequeno (4B) con ventanas de contexto muy largas en entrenamiento (`seq_len` de 300.000 tokens) y con decodificacion en modo razonamiento mas tool calling habilitados en la fase de inferencia del pipeline. No obstante, carece de licencia declarada, idiomas declarados, benchmarks publicados y resultados de evaluacion, por lo que su uso en produccion no puede justificarse tecnicamente con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso heredado de `Qwen/Qwen3.5-4B` (tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens en inferencia (`max_model_len = 65536`); 300.000 tokens en entrenamiento (`seq_len = 300000`) |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors; no se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Metodo de ajuste | RL (metodo `rl`), con generacion en modo thinking y juez LLM externo |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `Qwen/Qwen3.5-4B`, identificada por el tag `qwen3_5`. Se trata de un transformer denso de ~4,5B de parametros con soporte de decodificacion en modo razonamiento (la configuracion de inferencia incluye `reasoning_parser = "qwen3"` y `enable_thinking = true` en la generacion del learner). La model card no detalla la composicion interna (atencion, normalizacion, embeddings), por lo que cualquier afirmacion adicional sobre GQA, RoPE o activaciones seria especulativa y se marca como no disponible.

El entrenamiento es un bucle de RL por grupos: `group_size = 8`, `learner_steps = 10000`, `learner_epoch = 3`, `batch_size = 128` y una longitud de secuencia de entrenamiento de 300.000 tokens. La perdida declarada es de tipo "default" con parametros de enmascaramiento estilo DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), coeficiente de ventaja `adv_tau = 1.0` y penalizacion KL `kl_tau = 0.001`. El optimizador es AdamW con learning rate 1e-6, betas (0.9, 0.99), weight decay 0.0 y recorte de gradiente `max_norm = 1.0`. Se usa `flash_attention_2` y se guardan solo pesos (`weights_only = true`).

El dataset de entrenamiento se denomina `Stage-org/4b-diversity-history-selfsource-300-27b-z` (tipo `new_task`). El bucle RL utiliza un modelo juez externo, `gpt-5.6-luna`, con `temperature = 1.0`, `max_tokens = 4096`, `reasoning_effort = "medium"`, hasta 3 reintentos y 32 peticiones en vuelo, para puntuar respuestas abiertas. La infraestructura es pequena: 2 GPUs por nodo (1 para inferencia y 1 para entrenamiento), con vLLM como servidor de generacion en el puerto 7000, `gpu_memory_utilization = 0.9`, `max_inflight_rollouts = 256` y `max_off_policy_steps = 8`. La semilla del bucle es 7.

## Capacidades

- Generacion de texto autoregresiva con modo razonamiento ("thinking") habilitado durante el pipeline de RL; se desconoce si el checkpoint final conserva ese comportamiento por defecto.
- Razonamiento multi-paso, dado el uso de generaciones de hasta 4096 tokens con parser de razonamiento `qwen3`.
- Tool calling / function calling: la configuracion de inferencia declara `tool_call_parser = "qwen3_coder"`, lo que indica soporte de llamadas a herramientas en el pipeline de entrenamiento.
- Capacidades de codigo: el parser de herramientas referenciado (`qwen3_coder`) sugiere uso orientado a tareas de codigo y agentes.
- Capacidades multilingues: no disponibles (no se declaran idiomas en la model card ni en los metadatos del repositorio).
- Vision, audio u otras modalidades: no disponibles. La configuracion declara explicitamente `language_model_only = true` en el servidor vLLM, lo que apunta a un modelo exclusivamente de texto.
- Contexto largo: la fase de inferencia se configura con 65.536 tokens, aunque el entrenamiento usa 300.000 tokens de longitud de secuencia.

## Casos de uso

- Investigacion en RL sobre modelos pequenos: el repositorio sirve como referencia reproducible de una receta de RL por grupos con juez externo, util para equipos que quieran replicar el pipeline (config TOML incluida) sobre un modelo de 4B.
- Generacion de codigo asistida con tool calling: gracias al parser `qwen3_coder` y al soporte de llamadas a funciones, puede integrarse en asistentes que invoquen compiladores, linters o APIs de repositorios, aunque no hay evaluacion publicada de su calidad en este dominio.
- Procesamiento de documentos largos: con 65.536 tokens de ventana en inferencia, admite resumir o extraer informacion de contratos, informes o expedientes extensos sin troceado agresivo.
- Agentes de multiples pasos en local: al ser un modelo de ~4,5B, puede ejecutarse en una sola GPU consumer y sostener bucles de razonamiento cortos con llamadas a herramientas, adecuado para prototipos de agentes en estaciones de trabajo.
- Fine-tuning posterior y destilacion: al ser un ajuste RL de Qwen3.5-4B con licencia no declarada, puede servir como punto de partida para experimentos academicos de comparacion de politicas (RL frente a DPO o SFT).
- Evaluacion de jueces automaticos: dado que su entrenamiento depende de un juez LLM externo, es un caso de estudio para medir hasta que punto el modelo aprende a satisfacer criterios de un evaluador automatico.
- Despliegue en entornos con restricciones de VRAM: al caber en GPUs de 12-16 GB con cuantizacion, puede usarse en portatiles o nodos de borde para tareas de clasificacion, resumen o asistencia interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la procedencia del entrenamiento y la configuracion, no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion. Los resultados de busqueda web facilitados no guardan relacion con el modelo (corresponden a discusiones sobre un canal de television aleman) y no aportan ningun dato de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia, en funcion del modelo base de ~4,5B parametros y del repositorio de 9,1 GB:
  - bf16/fp16: ~9-10 GB de pesos, mas cache KV; aproximadamente 12-14 GB para 8K de contexto y bastante mas a 65.536 tokens.
  - int8: ~5 GB de pesos; ~8-10 GB con contexto moderado.
  - 4-bit (si se generan pesos cuantizados, no incluidos en el repo): ~2,5-3 GB de pesos; ~5-6 GB con contexto moderado.
- GPUs recomendadas: A100 40/80 GB, H100 o L40S para servir con contexto largo a 65.536 tokens; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con contextos medios.
- Cabe en GPU consumer: si. Con 4-bit cabe en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 3080 10 GB con contexto corto). En bf16 requiere al menos 16 GB (RTX 4080, RTX 4090, A4000).
- Opciones de despliegue: vLLM es la via evidenciada por la propia configuracion de entrenamiento (`language_model_only = true`, `reasoning_parser = "qwen3"`, `tool_call_parser = "qwen3_coder"`). Tambien son viables TGI o SGLang para safetensors. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, ya que el repositorio no los incluye.
- Latencia y throughput: no disponibles. No se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmark |
|---|---|---|---|---|---|
| `Stage-org/4b-diversity-history-selfsource-300-27b-z-epoch3` | ~4,54B | 65.536 en inferencia (300.000 en entrenamiento) | No disponible | HuggingFace, solo safetensors | No disponible |
| `Qwen/Qwen3.5-4B` (modelo base) | ~4B | No disponible en esta ficha | No disponible en esta ficha | HuggingFace | No disponible |
| Llama 3.2 3B | ~3,2B | 128.000 | Licencia comunitaria Llama | HuggingFace, GGUF, amplio ecosistema | Si, publicado por Meta |
| Gemma 3 4B | ~4B | 128.000 | Licencia Gemma | HuggingFace, GGUF, Ollama | Si, publicado por Google |
| Phi-4-mini (3,8B) | ~3,8B | 128.000 | Licencia MIT | HuggingFace, ONNX | Si, publicado por Microsoft |

La comparacion cuantitativa no es posible porque el modelo de Stage-org no publica benchmarks ni licencia. Frente a las alternativas de su categoria (3-4B), el rasgo diferencial es la ventana de entrenamiento de 300.000 tokens y el pipeline RL documentado; en cambio, carece de la madurez de ecosistema (GGUF, cuantizaciones oficiales, licencia clara) que si ofrecen Llama, Gemma y Phi.

## Limitaciones y advertencias

- Ausencia total de licencia: el repositorio no declara licencia, por lo que no hay base legal explicita para uso comercial. Debe tratarse como no apto para produccion hasta que el autor lo aclare.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada de calidad, razonamiento, codigo o seguridad. Cualquier eleccion de despliegue seria a ciegas.
- Riesgo de alineacion hacia el juez: al haberse optimizado contra un juez LLM concreto (`gpt-5.6-luna`), el modelo puede haber aprendido a explotar los criterios de ese evaluador (reward hacking), lo que no garantiza calidad percibida por humanos.
- Sesgos: no disponibles. No se documenta composicion del dataset, filtros de toxicidad ni evaluaciones de sesgo.
- Idiomas: no declarados. No puede asumirse buen rendimiento mas alla del ingles sin verificacion.
- Alucinacion: no medida. Un ajuste RL sin datos de verificacion factual tiende a mantener o incrementar la generacion confiada de contenido incorrecto.
- Nombre del repositorio ambiguo: contiene cadenas como "300-27b-z" y "epoch3" que no se corresponden con los parametros reales (4,54B) ni con una arquitectura MoE; conviene no inferir el tamano a partir del nombre.
- Discrepancia de contexto: entrenamiento a 300.000 tokens frente a 65.536 en inferencia; no hay informacion sobre como se maneja esa diferencia ni sobre degradacion mas alla de 65K.
- Procedencia de datos poco transparente: el dataset `selfsource` y el flujo de generacion no estan descritos, lo que impide auditar posibles contaminaciones.
- Estado del artefacto: 0 descargas y 0 "likes" en el momento de la consulta; se trata de un checkpoint de investigacion, no de un lanzamiento mantenido.

## Enlaces

- HuggingFace: https://huggingface.co/Stage-org/4b-diversity-history-selfsource-300-27b-z-epoch3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento referenciado: `Stage-org/4b-diversity-history-selfsource-300-27b-z` (no se ha verificado una URL publica del mismo)
- Resultados de busqueda web: no relevantes. Todos los enlaces devueltos tratan sobre el canal de television aleman "Welt" y no guardan relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos asociados a este modelo.
