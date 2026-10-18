# vinnipukh/Hy-Memory-30B-A3B-AWQ

## Resumen

Hy-Memory-30B-A3B-AWQ es una cuantizacion AWQ en formato compressed-tensors del modelo tencent/Hy-Memory-30B-A3B, un transformer de mezcla de expertos (MoE) de 30.064.725.888 parametros disenado especificamente para extraccion de memoria a largo plazo en agentes conversacionales. La publica el usuario vinnipukh (no es una version oficial de Tencent) y su funcion es reducir el peso del modelo original para poder servirlo en GPUs NVIDIA de gama alta-consumo con vLLM o SGLang.

El modelo base pertenece a la familia "hy_v3" de Hunyuan y esta orientado a una tarea muy concreta: leer una conversacion y destilar hechos, preferencias y entidades memorizables en un formato estructurado que despues consume un sistema de memoria externo (la model card cita explicitamente mem0). Frente al modelo original en BF16, esta version aplica cuantizacion de pesos a int4 con activaciones en 16 bits (W4A16), grupo de 128 y simetria, manteniendo `lm_head` y el router del MoE en precision completa.

Es relevante ahora porque la memoria persistente se ha convertido en el cuello de botella de los agentes de produccion: un modelo de 30B totales con solo ~3B activos por token permite un coste de decodificacion bajo, y esta cuantizacion lo lleva a unos 16,3 GB de repositorio, lo que lo hace desplegable en una unica RTX 4090 o A100 40 GB. El precio a pagar es la perdida de precision inherente a int4, para la que no hay evaluacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), familia `hy_v3` (Hunyuan, Tencent) |
| Parametros totales | 30.064.725.888 (~30B) |
| Parametros activos | ~3B por token (segun la nomenclatura A3B del modelo base; no verificado en la informacion disponible) |
| Longitud de contexto | No disponible (el ejemplo de despliegue del autor usa `--max-model-len 32768`) |
| Tipos de cuantizacion | W4A16: pesos int4, activaciones 16 bits, grupo 128, simetrico, escalado AWQ; `lm_head` y router en precision completa |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 (identica al modelo original) |
| Formato de pesos | safetensors en formato compressed-tensors (generado con llm-compressor 0.14.0); existe variante GGUF en otro repositorio |
| Tamano del repositorio | 16,3 GB |
| Herramienta de cuantizacion | llm-compressor 0.14.0 (vLLM project) |
| Motores de inferencia soportados | vLLM y SGLang (GPU NVIDIA) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos: una capa densa inicial (layer 0), atencion y, en las capas MoE, un router que selecciona expertos con anchura real de 768 (`moe_intermediate_size=768`, aunque el `config.json` publicado por el autor original declaraba 1536 y tuvo que ser corregido antes de cuantizar). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO; la model card de esta cuantizacion no los detalla.

La innovacion tecnica de esta ficha es el propio proceso de cuantizacion AWQ. Se aplica suavizado de escalas en la atencion, en la capa densa 0 y en la proyeccion up->down de cada experto. En las capas MoE, la normalizacion post-atencion no se suaviza porque el router no puede compensarse (el mismo compromiso que documenta llm-compressor para GLM-4.7-Flash). El `lm_head` y el router se mantienen en precision completa para no degradar la seleccion de expertos. La calibracion combina el dataset `calibration_datav3` de bartowski con 200 conversaciones de UltraChat envueltas en la plantilla de chat del modelo y con el system prompt de extraccion de memoria de la model card original.

## Capacidades

- Extraccion de memoria a largo plazo: identifica hechos, preferencias, entidades y relaciones a partir de transcripciones conversacionales y las emite en formato estructurado.
- Integracion con sistemas de memoria de agentes (la etiqueta `mem0` aparece explicitamente en el modelo base y en esta cuantizacion).
- Generacion de texto y comprension conversacional multi-turno.
- Modo de razonamiento configurable: la plantilla de chat acepta `reasoning_effort` (`no_think` es el valor recomendado por el autor).
- Capacidades multilingues limitadas a ingles y chino.
- No se documentan capacidades de vision, audio, tool calling ni function calling en la informacion disponible.

## Casos de uso

- Extraccion de memoria en pipelines de agentes con mem0: el modelo se coloca como extractor entre la conversacion bruta y la base de memoria vectorial; su ventana de contexto y su bajo coste por token (solo ~3B activos) permiten procesar cada turno sin disparar la factura de inferencia.
- Personalizacion de asistentes multi-sesion: al cerrar cada sesion se pasa la transcripcion completa y se almacenan las preferencias del usuario, de modo que la siguiente sesion arranque con contexto recuperado en lugar de reinyectar el historial entero.
- Resumen estructurado de historiales de soporte al cliente: convertir tickets y chats largos en un conjunto de hechos normalizados (producto, incidencia, resolucion) que alimente un CRM o un motor de busqueda interno.
- Backend de memoria para agentes de codigo: registrar decisiones de arquitectura, convenciones del repositorio y correcciones recurrentes del equipo, y recuperarlas en sesiones posteriores del asistente.
- Auditoria y compliance: extraer de forma sistematica afirmaciones y compromisos vertidos en conversaciones registradas, con temperatura 0.0 para maximizar la reproducibilidad del resultado.
- Procesamiento por lotes (offline) de grandes volumenes de conversaciones para construir un grafo de memoria corporativo, aprovechando el throughput de vLLM con peticiones agrupadas.
- Despliegue on-premise en una GPU de 24 GB: al ocupar ~16 GB de pesos, cabe en una RTX 4090 o RTX 3090, lo que permite mantener los datos conversacionales dentro de la infraestructura propia.
- Investigacion sobre memoria a largo plazo: banco de pruebas reproducible para comparar estrategias de extraccion y recuperacion sin necesidad de un clúster de GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion declarada por el autor es funcional: carga correcta en vLLM y ejecucion del ejemplo de extraccion de memoria de la model card original. No hay datos de MMLU, HumanEval, GSM8K ni de evaluacion especifica de calidad de memoria, ni del porcentaje de degradacion introducido por la cuantizacion int4.

## Requisitos de hardware

- Pesos cuantizados: aproximadamente 15,0 GB para los 30.064.725.888 parametros a 4 bits, mas las capas en precision completa (`lm_head`, router, embeddings) y el overhead del tokenizador; el repositorio completo ocupa 16,3 GB.
- VRAM estimada: ~17-18 GB para contexto corto y una sola peticion; 24 GB para contexto de 8-16k con concurrencia moderada; 40-80 GB si se quiere servir a 32.768 tokens con varias peticiones simultaneas y cache KV amplia (estimacion a partir del tamano de pesos, no publicada por el autor).
- GPU consumer: si cabe en RTX 3090, RTX 4090 y RTX 5090 (24-32 GB). No cabe en GPUs de 8, 12 o 16 GB.
- GPU de datacenter recomendadas: A100 40 GB, L40S 48 GB, H100 80 GB para produccion con concurrencia y contextos largos.
- Requisito de kernels: los kernels AWQ de vLLM necesitan Compute Capability 7.5 o superior; en sm80+ disponible la ruta Marlin, mas rapida.
- Despliegue: `vllm serve vinnipukh/Hy-Memory-30B-A3B-AWQ --served-model-name hy-memory --max-model-len 32768`, con `temperature=0.0` y `chat_template_kwargs={"reasoning_effort": "no_think"}`. Tambien soportado en SGLang. No es cargable en transformers puro ni en llama.cpp (para CPU o Ollama, usar la variante GGUF de vinnipukh).
- Latencia y throughput: no disponibles. Cualitativamente, al activar solo ~3B parametros por token, la decodificacion se aproxima a la de un modelo denso de ese tamano, con la penalizacion de memoria de tener que residir 30B en VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | VRAM aproximada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vinnipukh/Hy-Memory-30B-A3B-AWQ | 30B totales / ~3B activos | safetensors int4 AWQ (compressed-tensors) | ~17-18 GB | no disponible | Apache-2.0 | HuggingFace, 0 descargas |
| tencent/Hy-Memory-30B-A3B (base) | 30B totales / ~3B activos | safetensors BF16 | ~60 GB | no disponible | Apache-2.0 | HuggingFace (oficial) |
| vinnipukh/Hy-Memory-30B-A3B-GGUF | 30B totales / ~3B activos | GGUF (varias cuantizaciones) | desde ~16 GB (Q4) | no disponible | Apache-2.0 | HuggingFace |
| Otros modelos especializados en extraccion de memoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es interna a la familia: frente al BF16 oficial, la version AWQ reduce el peso un factor cercano a 4 y habilita GPU consumer, a cambio de una perdida de calidad no medida; frente a la variante GGUF, la AWQ es la opcion para servidor con vLLM/SGLang, mientras que la GGUF es la unica ruta para CPU, Ollama o llama.cpp.

## Limitaciones y advertencias

- Cobertura linguistica restringida a ingles y chino; el rendimiento en castellano no esta documentado ni evaluado.
- Cuantizacion int4 sin evaluacion publicada: no se conoce la degradacion en la tarea critica de extraccion de memoria, donde los errores de un solo caracter en una entidad o fecha pueden invalidar el registro almacenado.
- Riesgo de alucinacion: en tareas de extraccion, el modelo puede inventar hechos o atributos no presentes en la conversacion; se recomienda temperatura 0.0, validacion posterior y trazabilidad hacia el turno de origen.
- El `config.json` del modelo base declara `moe_intermediate_size=1536` cuando el valor real es 768. El autor parcheo el archivo antes de cuantizar, pero otras herramientas que lean el config original pueden fallar o cargar mal los pesos.
- Metadato `inference: false` en la model card y dependencia estricta de vLLM o SGLang; no funciona con un `AutoModelForCausalLM` estandar de transformers.
- El modo de razonamiento (`reasoning_effort`) puede degradar la salida estructurada; el autor recomienda explicitamente `no_think`.
- Publicacion no oficial: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad ni tests de regresion publicados. Para produccion conviene replicar la evaluacion contra el modelo BF16.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe; conviene verificar los terminos del modelo base y de los datos de calibracion (UltraChat y calibration_datav3) por separado.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/vinnipukh/Hy-Memory-30B-A3B-AWQ
- Modelo base oficial: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- Variante GGUF del mismo autor: https://huggingface.co/vinnipukh/Hy-Memory-30B-A3B-GGUF
- Codigo y evaluacion (Tencent-Hunyuan): https://github.com/Tencent-Hunyuan/Hy-Memory
- Informe tecnico: https://arxiv.org/abs/2610.22196
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibracion de bartowski: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
