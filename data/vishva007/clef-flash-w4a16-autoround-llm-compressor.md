# Vishva007/clef-flash-W4A16-AutoRound-LLM-Compressor

## Resumen

Clef-flash-W4A16-AutoRound-LLM-Compressor es una version cuantizada del modelo Cloudflare/clef-flash, publicada por el usuario Vishva007 en HuggingFace. El modelo base es un modelo multimodal de decision denominado Clef-Flash, descrito por sus autores como un modelo post-entrenado a partir de Qwen3.5, con aproximadamente 9B parametros, que evalua esquemas estructurados (texto, JSON, imagen y video) y devuelve distribuciones de probabilidad calibradas sobre preguntas tipadas en un unico forward pass, sin generacion autoregresiva de tokens. El repositorio que nos ocupa es la variante cuantizada en formato Compressed-Tensors, pensada para motores como vLLM y SGLang.

La cuantizacion se ha realizado con Intel AutoRound en configuracion W4A16 (pesos de 4 bits, activaciones de 16 bits), con simetria activada y tamano de grupo 32. Segun la model card, la torre de vision, la cabeza de esquema conjunta (`joint_head.safetensors`) y las convoluciones lineales se han preservado en BF16 nativo para evitar degradacion en OCR, en la cabeza de decision y en las capas de atencion lineal heredadas de Qwen3.5. El autor afirma que no se observa perdida de precision en las suites de prueba de texto, estado JSON y multimodal respecto al checkpoint base.

Es relevante ahora porque propone un patron de inferencia distinto al de los LLM generativos al uso: en lugar de producir texto token a token, el modelo clasifica y puntua directamente contra un esquema definido por el usuario, lo que encaja con casos de triaje, enrutado y decision automatizada donde se busca una respuesta estructurada y probabilistica en una sola pasada. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5, con capas de atencion lineal (linear attention) y cabeza de esquema conjunta; decodificacion no autoregresiva |
| Parametros totales | 9B segun la model card del modelo base; el repositorio cuantizado reporta 3.572.326.112 parametros en los tensores safetensors (dato discrepante, probablemente por el desglose de shards) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (4 bits en pesos, 16 bits en activaciones), sym=True, group_size=32; torre de vision, joint head y convoluciones lineales en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con Compressed-Tensors (tambien existen variantes AutoRound/AutoGPTQ y GPTQ estandar) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura multimodal de Qwen3.5, de la que hereda las capas de atencion lineal que el autor menciona de forma explicita como motivo para preservar ciertas convoluciones en BF16 y evitar derivas durante la cuantizacion. Sobre esa base, Clef-Flash incorpora una cabeza de esquema conjunta (`joint_head.safetensors`) que transforma la representacion del modelo en distribuciones de probabilidad calibradas sobre preguntas definidas por el usuario. La model card insiste en que la inferencia no es autoregresiva: el modelo procesa el estado (texto, JSON o contenido multimodal) y emite las respuestas en un unico forward pass.

Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se especifican en la informacion proporcionada. Lo que si se documenta es el proceso de cuantizacion posterior: se aplico Intel AutoRound con configuracion W4A16 simetrica y grupo de 32, dejando en BF16 la torre de vision, la cabeza de esquema conjunta y las convoluciones lineales. El autor afirma que esta combinacion produce cero perdida de precision en las suites de prueba textuales, de estado JSON y multimodales frente al checkpoint base.

## Capacidades

- Evaluacion de esquemas estructurados: recibe un estado (texto o JSON) junto con un conjunto de preguntas tipadas y devuelve respuestas probabilisticas para cada una.
- Tipos de pregunta soportados segun los ejemplos de la model card: `choice` (eleccion entre criterios definidos), `score` (puntuacion ordenada sobre una lista de criterios) y `noul` (empleado para decisiones binarias del tipo si/no, como iniciar un rollback o comprobar si un importe supera un umbral).
- Entrada multimodal: acepta imagenes (con soporte OCR preservado en BF16) y, segun la descripcion del modelo base, tambien video.
- Salida de distribuciones de probabilidad calibradas, en lugar de texto generado.
- Inferencia en una sola pasada, sin generacion autoregresiva de tokens, lo que reduce la latencia para tareas de decision.
- Integracion mediante API propia (`systemone`) y codigo personalizado (`joint_schema_model.py`) cargado desde el propio repositorio.
- Clasificacion y triaje automatizado sobre estados operativos (incidentes, latencia, errores).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Triaje de incidentes en produccion: a partir de un estado textual con metricas y errores (por ejemplo, latencia de base de datos a 4.000 ms y errores 504 en checkout), el modelo devuelve en una sola pasada la severidad, la urgencia y si procede rollback, con distribuciones calibradas que permiten fijar umbrales de escalado automatico.
- Enrutado de tickets a equipos: definiendo preguntas de tipo `choice` sobre categorias (facturacion, infraestructura, producto), el modelo clasifica cada ticket y asigna destino sin necesidad de generar texto explicativo.
- Verificacion documental con OCR: usando la entrada de imagen y la torre de vision preservada en BF16, se puede comprobar si una factura o recibo es legible y si el importe supera un umbral definido, devolviendo decisiones binarias.
- Control de calidad en pipelines de datos: evaluar estados JSON intermedios y puntuar su calidad (`score`) para decidir si un registro pasa a la siguiente fase o se descarta.
- Moderacion y clasificacion de contenido multimodal: puntuar imagenes o texto contra criterios predefinidos y obtener probabilidades que permiten aplicar politicas con umbrales configurable.
- Automatizacion de decisiones financieras o de riesgo: formular preguntas de tipo `noul` y `score` sobre un estado estructurado para aprobar, revisar o rechazar operaciones de forma auditable.
- Servicio de inferencia a baja latencia: al no requerir generacion autoregresiva y estar empaquetado en Compressed-Tensors, el modelo encaja en despliegues con vLLM o SGLang donde la latencia por peticion es critica.
- Orquestacion de agentes con salida tipada: integrar el modelo como componente de decision que consume el estado de un agente y responde con etiquetas y probabilidades en lugar de texto libre, facilitando el control del flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma que se observa una perdida de precision nula en las suites de prueba de texto, estado JSON y multimodal respecto al checkpoint base, pero no aporta cifras concretas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 9,1 GB, por lo que cargar todos los componentes en la precision almacenada requiere del orden de 9-10 GB de memoria. Es una estimacion derivada del tamano del repositorio, no un dato publicado por el autor.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberian ser suficientes para cargar el modelo completo; para servir varias peticiones concurrentes conviene una A100 (40/80 GB) o H100.
- Cabe en GPU de consumo: si, en tarjetas con al menos 10-12 GB de VRAM disponibles, como RTX 3080/3090, RTX 4070/4080/4090, siempre que no se requiera mucho `batch` concurrente.
- Opciones de despliegue: esta variante (Compressed-Tensors) esta orientada a vLLM y SGLang; la variante AutoRound/AutoGPTQ apunta a Transformers y codigo Python nativo, y la GPTQ estandar a Transformers, ExLlama y AutoGPTQ. La model card no menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible. La ausencia de generacion autoregresiva sugiere latencias por peticion inferiores a las de un LLM generativo del mismo tamano en tareas de decision, pero no se aportan medidas.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento que permitan comparar con modelos de otra familia. La comparacion relevante disponible es entre las propias variantes de cuantizacion del mismo modelo base:

| Repositorio | Formato | Motor objetivo |
|---|---|---|
| `Vishva007/clef-flash-W4A16-AutoRound` | AutoRound / AutoGPTQ | Transformers / Python nativo |
| `Vishva007/clef-flash-W4A16-AutoRound-GPTQ` | AutoGPTQ estandar | Transformers / ExLlama / AutoGPTQ |
| `Vishva007/clef-flash-W4A16-AutoRound-LLM-Compressor` | Compressed-Tensors | vLLM / SGLang |

Modelo base de referencia: `Cloudflare/clef-flash`, en BF16 sin cuantizar, misma licencia Apache 2.0.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, composicion del dataset ni idiomas soportados, por lo que no es posible evaluar sesgos ni cobertura linguistica con la informacion disponible.
- Existe una discrepancia entre el numero de parametros reportado en los safetensors (3.572.326.112) y el tamano de 9B indicado en la model card del modelo base; conviene verificarlo antes de dimensionar el despliegue.
- Al tratarse de una cuantizacion, existe riesgo teorico de degradacion en dominios no cubiertos por las suites de prueba del autor; la afirmacion de "cero perdida" no esta respaldada por cifras publicas.
- El modelo no genera texto: su salida son distribuciones de probabilidad sobre preguntas tipadas. Cualquier caso de uso que requiera texto libre necesita un componente adicional.
- Requiere codigo personalizado (`joint_schema_model.py` y la API `systemone`) cargado desde el repositorio, lo que anade superficie de mantenimiento y dificulta su uso con librerias estandar sin adaptadores.
- Riesgo de alucinacion: no disponible como metrica; en modelos de clasificacion el riesgo se traslada a decisiones mal calibradas, que conviene acotar con umbrales y validacion humana en flujos criticos.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda revisar las condiciones del modelo base `Cloudflare/clef-flash` por si anaden restricciones adicionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en produccion ni de validacion independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Vishva007/clef-flash-W4A16-AutoRound-LLM-Compressor
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Intel AutoRound (repositorio de la herramienta de cuantizacion): https://github.com/intel/auto-round
- Variante AutoRound / AutoGPTQ: https://huggingface.co/Vishva007/clef-flash-W4A16-AutoRound
- Variante GPTQ estandar: https://huggingface.co/Vishva007/clef-flash-W4A16-AutoRound-GPTQ
