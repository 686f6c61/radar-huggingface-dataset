# VikramPal/Qwen3.8-27B-text2sql-DynQuant-4bit

## Resumen

`VikramPal/Qwen3.8-27B-text2sql-DynQuant-4bit` es un checkpoint especializado en generación de SQL a partir de lenguaje natural (text-to-SQL), derivado del modelo base `Qwen/Qwen3.8-27B` de Alibaba. El autor, VikramPal, ha aplicado un fine-tuning con QLoRA (rank 32) sobre un conjunto de conversaciones de los datasets Spider, Gretel, WikiSQL y create-context, y posteriormente ha cuantizado los pesos con la técnica DynQuant, que asigna anchos de bits variables por módulo según la dinámica de entrenamiento. El resultado es un modelo de 27.000 millones de parámetros (el base) que ocupa 12,54 GiB en disco, con una media de 3,999 bits por peso, muy cerca del presupuesto mínimo teórico de 4,0196 bits para esta arquitectura.

La relevancia de este checkpoint radica en que demuestra que es posible comprimir un modelo de 27B a menos de 4 bits de media sin una pérdida significativa de precisión en la tarea objetivo: la execution accuracy sobre la validación de Spider, Gretel y WikiSQL cae solo 1,25 puntos porcentuales respecto al modelo en bf16 (84,25% frente a 85,50%), con una diferencia estadísticamente no significativa (p = 0,2266). Además, el autor documenta de forma transparente los 9 módulos que quedan por debajo de su ancho mínimo recomendado, algo poco habitual en la literatura de cuantización.

El modelo está pensado para desarrolladores que necesitan un generador de SQL eficiente en memoria, desplegable en hardware de consumo o en entornos con VRAM limitada, y que priorizan la transparencia sobre la degradación inducida por la cuantización. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B, solo torre de texto) |
| Parametros totales | 27.000 millones (modelo base); el repo safetensors reporta 3.573.333.504, posiblemente un error de extraccion |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (modelo base, no especificado en el checkpoint) |
| Tipos de cuantizacion | DynQuant mixto: 2, 3, 4 y 8 bits por modulo, media 3,999 bits/peso |
| Idiomas soportados | Ingles (entrenado y evaluado solo en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con transformers y vLLM via plugin DynQuant) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B`, un transformer denso multimodal de 27B parametros con atencion por ventanas deslizantes y atencion lineal (lin_attn) en algunas capas, segun la arquitectura de Qwen 3.8. Este checkpoint solo utiliza la torre de texto; la ruta de vision no se entrena ni se cuantiza. El fine-tuning se realizo con QLoRA (rank 32) sobre 9.999 conversaciones de los datasets Spider, Gretel, WikiSQL y create-context, sumando 350.799 tokens supervisados. Se ejecutaron 625 pasos con batch efectivo de 16 y learning rate 0,0001, alcanzando una loss final de 0,0963. Durante el entrenamiento se recogieron señales de 546 modulos (masa de activacion y estabilidad del gradiente) sin coste adicional de forward/backward, que alimentan el asignador de anchos de bits de DynQuant.

La cuantizacion posterior con DynQuant 0.5.2 asigna a cada modulo un ancho de bits individual (2, 3, 4 u 8) en funcion de su importancia medida durante el fine-tuning. El resultado es una distribucion: 1 modulo a 2 bits (0,33% de los parametros), 135 a 3 bits (43,73%), 265 a 4 bits (51,13%) y 97 a 8 bits (4,82%). El autor reporta que 9 modulos quedan por debajo del minimo recomendado para su rol (por ejemplo, dos `mlp.gate` a 3 bits cuando el suelo es 4 bits), y los lista explicitamente en la model card. Ademas, se aplico un filtro de contaminacion: 601 ejemplos del split de entrenamiento que colisionaban con items de evaluacion fueron eliminados.

## Capacidades

- Generacion de consultas SQL a partir de descripciones en lenguaje natural, con alta precision de ejecucion sobre esquemas de los datasets Spider, Gretel y WikiSQL.
- Soporte de conversaciones multi-turno (entrenado con formato conversacional) para refinar consultas de forma interactiva.
- Generacion de texto autoregresivo estandar, aunque su especializacion principal es text-to-SQL.
- No soporta tool calling ni function calling de forma nativa en este checkpoint (el modelo base si, pero no se ha verificado aqui).
- No incluye capacidades de vision, audio ni multimodalidad: solo la torre de texto.
- Capacidad multilingue limitada: entrenado y evaluado solo en ingles; el uso en otros idiomas no esta garantizado.
- Compatible con vLLM para servir en produccion mediante el plugin DynQuant, que se registra automaticamente via entry point.

## Casos de uso

- Asistente de consultas para analistas de datos: un usuario escribe una pregunta en ingles ("cual es el total de ventas por region en el ultimo trimestre") y el modelo genera la consulta SQL correspondiente, que puede ejecutarse directamente contra la base de datos. Su alta execution accuracy (84,25%) reduce la necesidad de correccion manual.
- Generacion de SQL en pipelines ETL: integrado en un flujo de automatizacion, el modelo puede traducir requisitos de negocio expresados en lenguaje natural a consultas SQL para extraer datos de un data warehouse, ahorrando tiempo a los ingenieros de datos.
- Chatbot de autoservicio de datos: desplegado como backend de un asistente conversacional, permite a usuarios no tecnicos obtener respuestas de sus bases de datos sin escribir codigo, gracias a su capacidad de mantener contexto multi-turno.
- Validacion de esquemas y pruebas de regresion: el modelo puede generar consultas SQL de prueba a partir de descripciones de casos de uso, ayudando a verificar que los cambios de esquema no rompen consultas existentes.
- Entrenamiento y educacion: utilizado como herramienta didactica para ensenar SQL, mostrando como una pregunta en lenguaje natural se traduce a una consulta estructurada, con la ventaja de poder ejecutarse en local sin servicios en la nube.
- Despliegue en entornos con recursos limitados: gracias a su cuantizacion a ~4 bits, el modelo cabe en GPUs de consumo (por ejemplo, RTX 4090 con 24 GB) y puede servir consultas SQL en tiempo real sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

El autor reporta execution accuracy sobre el split de validacion de Spider, Gretel y WikiSQL (400 problemas, greedy decode, presupuesto de 1024 tokens nuevos). La comparacion es pareada: ambos modelos respondieron los mismos problemas en el mismo orden, y la diferencia se evaluo con una prueba de McNemar.

| Modelo | Bits | Tamano | Execution accuracy | Diferencia vs bf16 | p |
|---|---:|---:|---:|---:|---:|
| bf16 (sin cuantizar) | 16 | -- | 85,50% | -- | -- |
| **Este checkpoint** | 3,999 | 12,54 GiB | 84,25% | -1,25 | 0,2266 |

No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) para este checkpoint especifico. El autor advierte que la puntuacion se refiere a los esquemas de los datasets nombrados; la precision sobre esquemas propios puede variar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa 12,54 GiB en disco, por lo que en FP16 o BF16 necesitaria ~54 GB; con la cuantizacion DynQuant, la carga en memoria es de aproximadamente 12,5-13 GB, mas overhead de activaciones y cache KV. En la practica, una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A10G) es suficiente para inferencia con contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB) para uso local, A100 40 GB o H100 para despliegue en produccion con mayor concurrencia. Tambien puede ejecutarse en CPU con llama.cpp si se convierte a GGUF, aunque no se proporciona oficialmente.
- Cabe en GPUs de consumo: si, en tarjetas con 16 GB o mas de VRAM. Con cuantizacion adicional (por ejemplo, 3 bits) podria caber en 12 GB, pero no esta garantizado.
- Opciones de despliegue: transformers (con el registro manual del quantizer DynQuant), vLLM (via plugin con entry point), y potencialmente llama.cpp/Ollama si se exporta a GGUF (no incluido en el repo).
- Latencia y throughput: no se proporcionan datos medidos. Como referencia, un modelo de 27B cuantizado a 4 bits en una RTX 4090 suele generar entre 20 y 40 tokens por segundo con vLLM, pero esto depende del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Execution accuracy (Spider/Gretel/WikiSQL) | Licencia |
|---|---|---|---:|---:|---|
| **Este checkpoint** | 27B | 256K | DynQuant 3,999 bits | 84,25% | Apache 2.0 |
| Qwen3.8-27B (bf16, base) | 27B | 256K | 16 bits | 85,50% | Apache 2.0 |
| CodeLlama-34B (text-to-SQL fine-tune) | 34B | 16K | 4 bits (GPTQ) | No comparable (datasets distintos) | Llama 2 license |
| SQLCoder-7B | 7B | 4K | 4 bits | ~80% en Spider (referencia) | CC BY-SA 4.0 |

La comparacion directa con otros modelos text-to-SQL es dificil porque los datasets y protocolos de evaluacion varian. El checkpoint supera a modelos mas pequeños como SQLCoder-7B en execution accuracy, pero requiere mas VRAM. Frente al base sin cuantizar, la perdida es minima y estadisticamente no significativa, lo que lo hace atractivo para despliegues eficientes.

## Limitaciones y advertencias

- Especializado exclusivamente en text-to-SQL: su capacidad general de razonamiento, codigo o conversacion no ha sido medida y probablemente este degradada por el fine-tuning y la cuantizacion.
- Solo soporta ingles: el entrenamiento y la evaluacion se realizaron unicamente en este idioma; consultas en otros idiomas pueden producir resultados incorrectos.
- No incluye la ruta de vision del modelo base: no puede procesar imagenes ni video.
- 9 modulos quedan por debajo de su ancho minimo recomendado (listados en la model card); aunque la perdida de precision es pequena en la tarea evaluada, podria manifestarse en otros dominios.
- La execution accuracy se mide sobre esquemas especificos de Spider, Gretel y WikiSQL; la precision sobre esquemas propios puede ser menor y requiere validacion.
- Riesgo de alucinacion en la generacion de SQL: puede producir consultas sintacticamente validas pero semanticamente incorrectas, especialmente con esquemas complejos o ambiguos.
- La cuantizacion DynQuant requiere el paquete `dynquant` y el registro manual del quantizer en transformers; sin ese paso, el modelo se carga con pesos aleatorios sin error explicito, lo que puede pasar desapercibido en produccion.
- No se han publicado evaluaciones de sesgos, robustez o seguridad; el uso en entornos criticos debe ir acompanado de pruebas adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/VikramPal/Qwen3.8-27B-text2sql-DynQuant-4bit
- Repositorio DynQuant: https://github.com/kambojvikram/dynquant
- Repositorio del modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentacion de Cloudflare sobre Qwen3.8-27B: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Guia de Qwen3.8-27B (2026): https://lovableapp.org/blog/qwen3-8-27b
- Documentacion de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
