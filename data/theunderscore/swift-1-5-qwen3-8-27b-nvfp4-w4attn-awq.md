# TheUnderscore/Swift-1.5-Qwen3.8-27b-NVFP4-W4ATTN-AWQ

## Resumen

Swift-1.5-Qwen3.8-27b-NVFP4-W4ATTN-AWQ es una cuantizacion de precision mixta publicada por el usuario TheUnderscore sobre `ukisai/Swift-1.5-Qwen3.8-27b`, un ajuste fino de razonamiento eficiente derivado de Qwen3.8-27B (Alibaba). El modelo base es multimodal nativo (pipeline `image-text-to-text`), con 27.781.427.952 parametros reales y una torre de vision que se preserva en BF16.

La aportacion de esta version no es un reentrenamiento, sino una receta de cuantizacion capa a capa que combina NVFP4 (float4, grupo 16) para los bloques MLP, W4A16 asimetrico (int4, grupo 128) con suavizado AWQ para la atencion y BF16 para `lm_head`, `embed_tokens`, `in_proj_a/b`, la torre visual, `mtp` y las normas. El resultado ocupa 19 GB, frente a los 20,4 GB de la variante NVFP4 del propio autor del modelo base, y esta pensado para servirse con kernels especificos en 1Cat-vLLM.

Es relevante porque es un ejemplo de cuantizacion selectiva orientada a preservar calidad en los tensores criticos (embeddings de salida, gating de atencion lineal) en lugar de aplicar un unico esquema global. El repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B segun los tags del repo; atencion hibrida (atencion lineal con gating delta-rule `in_proj_a/b` y atencion estandar) mas torre de vision y cabeceras `mtp` |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Precision mixta: NVFP4 (float4, grupo 16) en MLP; W4A16 asimetrico int4 (grupo 128) con AWQ en atencion; BF16 en `lm_head`, `embed_tokens`, `in_proj_a/b`, `visual`, `mtp` y normas. `quant_method: compressed-tensors` |
| Idiomas soportados | no disponibles |
| Licencia | Swift Open License v1.0 (`license: other`) |
| Formato de pesos | safetensors (mas `model-nonquant.safetensors` con tensores sin cuantizar), compatible con `compressed-tensors` |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento de este repositorio: se trata de una cuantizacion post-entrenamiento, no de un modelo entrenado desde cero. El trabajo realizado es la calibracion y conversion de pesos del modelo base `ukisai/Swift-1.5-Qwen3.8-27b`, que a su vez es un derivado de razonamiento eficiente de Qwen3.8-27B (modelo multimodal denso de Alibaba, orientado a codigo, flujos agenticos y automatizacion de oficina). El unico dato cuantitativo sobre el ajuste del base es que reduce un 58,5% los tokens de pensamiento manteniendo (o mejorando ligeramente, +0,35%) la puntuacion de su predecesor; no se detalla el dataset ni si hubo RLHF o DPO.

La innovacion tecnica esta en la receta de cuantizacion. Se usa `llmcompressor` en modo `oneshot` con `config_groups` para despachar un esquema distinto por capa y un `AWQModifier` con mapeos de atencion hibrida. La justificacion del autor es que los pesos del MLP presentan alta varianza intragrupo y necesitan la resolucion de escala de NVFP4 (grupo 16, 8x mas fina), mientras que los pesos de atencion son mas uniformes y toleran int4 con grupo 128 si se aplica suavizado AWQ, que desplaza la dificultad de cuantizacion hacia las activaciones. Se dejan en BF16 los tensores donde 4 bits romperia el modelo: `in_proj_a/b` (gating delta-rule de 48 canales, donde la inestabilidad de recurrencia es critica), `lm_head` y `embed_tokens` (afectan directamente a las probabilidades del siguiente token) y la torre visual (no es divisible por grupo). Mantener `lm_head` en semiprecision permite ademas decodificacion especulativa en 1Cat-vLLM, aunque el autor indica que las tasas de aceptacion con borradores Qwen3.8-27B-DFlash2 estandar no son optimas.

## Capacidades

- Generacion de texto y razonamiento: hereda el modo de razonamiento eficiente del base, con menos tokens de pensamiento que Qwen3.8-27B.
- Procesamiento de imagen y texto de forma nativa (pipeline `image-text-to-text`), con torre de vision conservada en BF16.
- Codigo y flujos agenticos: el modelo base esta posicionado por Qwen para codificacion y `agentic workflows`.
- Automatizacion de oficina, segun la descripcion del Qwen3.8-27B original.
- Prediccion multi-token (`mtp`) presente en el repositorio y preservada en BF16.
- Decodificacion especulativa soportada tecnicamente gracias al `lm_head` en semiprecision, aunque con aceptacion no optima segun el autor.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Despliegue multimodal en una sola GPU de 24 GB: con 19 GB de pesos cuantizados, el modelo cabe en tarjetas como RTX 4090 o RTX 5090 para inferencia con contexto moderado, lo que permite montar un asistente vision-lenguaje local sin clúster.
- Razonamiento con coste reducido por consulta: al heredar el ajuste que recorta un 58,5% los tokens de pensamiento, resulta adecuado para pipelines de razonamiento por lotes donde el coste de decodificacion domina el presupuesto.
- Agentes de codigo con contexto de repositorio: el base esta orientado a tareas de codigo y agenticas, y esta version reduce el consumo de memoria para poder mantener varias instancias en un mismo nodo.
- Analisis de documentos escaneados o capturas: la torre de vision en BF16 permite extraer informacion de imagenes y combinarla con razonamiento textual en un mismo paso.
- Automatizacion de oficina: generacion y revision de informes, resumen de correo o extraccion estructurada a partir de capturas, en linea con el posicionamiento del modelo original.
- Servicio de inferencia con vLLM y paralelismo de tensor: la receta esta probada con `tensor_parallel_size=2` en 1Cat-vLLM, lo que encaja en despliegues multi-GPU con kernels Marlin/TurboMind.
- Sustitucion de la variante NVFP4 del autor base en entornos con presupuesto de VRAM ajustado: ahorra 1,4 GB respecto a `ukisai/Swift-1.5-Qwen3.8-27b-NVFP4` manteniendo el MLP en NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible para esta cuantizacion. Los unicos datos cuantitativos encontrados corresponden al modelo base y son relativos, no absolutos:

| Metrica | Valor | Fuente |
|---|---|---|
| Reduccion de tokens de pensamiento frente al predecesor | 58,5% menos | ukisai.com |
| Variacion de puntuacion frente al predecesor | +0,35% | ukisai.com |
| Aceleracion en varias tareas | 9,18x (ukisai.com) / 1,95x (featherless.ai) | fuentes discrepantes |

No se dispone de mediciones de perplejidad ni de degradacion por cuantizacion de esta version concreta, mas alla de la afirmacion cualitativa del autor de que el suavizado AWQ hace la bajada de 8 a 4 bits en atencion "casi sin perdida".

## Requisitos de hardware

- Peso en disco y en VRAM: 19 GB de pesos cuantizados, mas `model-nonquant.safetensors` con los tensores BF16.
- VRAM estimada: en torno a 20-24 GB para pesos y cache KV con contexto corto; mas si se amplia la ventana de contexto.
- GPU consumer: cabe en RTX 4090 (24 GB), RTX 5090 y RTX 3090 (24 GB) con margen limitado. El ejemplo del autor usa dos GPU.
- GPU de datacenter: A100 40/80 GB, H100, L40S y A6000 48 GB son opciones holgadas; el ejemplo oficial usa `tensor_parallel_size=2`.
- Compatibilidad de kernels: el autor indica ejecucion en 1Cat-vLLM con kernels Marlin/TurboMind para ambos esquemas (etiquetados SM70). NVFP4 requiere soporte de kernel especifico; no se garantiza funcionamiento en vLLM estandar ni en transformers puro.
- Opciones de despliegue: 1Cat-vLLM (probado por el autor). llama.cpp, Ollama y TGI no son aplicables directamente, ya que no se distribuye GGUF y el esquema `compressed-tensors` mixto no esta soportado por esos runners.
- Latencia y throughput: no disponibles. El autor solo senala que elegir NVFP4 para la atencion habria costado 1,8 GB extra y habria ralentizado la decodificacion por mas bytes por capa.
- Parametros de muestreo recomendados: temperatura 1,0, top_p 0,95, top_k 20, min_p 0, presence_penalty 0, repetition_penalty 1,0.

## Comparativa con modelos similares

| Modelo | Tamano en disco | MLP | Atencion | lm_head | Notas |
|---|---|---|---|---|---|
| TheUnderscore/Swift-1.5-Qwen3.8-27b-NVFP4-W4ATTN-AWQ | 19 GB | NVFP4 g16 | W4A16 g128 + AWQ | BF16 (2,54 GB) | Permite decodificacion especulativa; `in_proj_a/b` en BF16 |
| ukisai/Swift-1.5-Qwen3.8-27b-NVFP4 | 20,4 GB | NVFP4 g16 | FP8 g128 | NVFP4 g16 (715 MB) | Referencia del mismo autor base; lm_head cuantizado |
| TheUnderscore/Swift-Qwen3.8-27b-W4A16-AWQ | no disponible | no disponible | no disponible | no disponible | Cuantizacion W4A16-AWQ del usuario, sobre otro base |
| ukisai/Swift-1.5-Qwen3.8-27b (BF16) | 19 GB segun la model card de esta ficha | BF16 | BF16 | BF16 | Modelo de referencia sin cuantizar; el dato de tamano proviene literalmente de la model card y no cuadra con los 27,78B parametros en BF16 |

## Limitaciones y advertencias

- Repositorio sin traccion: 0 descargas y 0 likes en la fecha de consulta; no hay validacion independiente de la calidad de la cuantizacion.
- No hay benchmarks publicados de esta version. La afirmacion de perdida "casi nula" en atencion es del autor y no esta respaldada por mediciones publicadas.
- Compatibilidad restringida: requiere vLLM con soporte de `compressed-tensors` y kernels para NVFP4 mas int4 (1Cat-vLLM). No es desplegable directamente en llama.cpp, Ollama, LM Studio u otros runners basados en GGUF.
- Licencia no abierta: Swift Open License v1.0 permite uso personal, de investigacion, educativo, de evaluacion y comercial solo a individuos y organizaciones con ingresos recurrentes anuales (incluidas afiliadas) de hasta 1.000.000 USD. Por encima de ese umbral se exige una Swift Enterprise License de pago, con contacto via UkisAI.
- Acceso restringido: los pesos Swift originales se distribuyen mediante acceso con control (gated access); esta cuantizacion hereda esa condicion.
- Riesgo de alucinacion: no documentado especificamente para esta version; aplica el riesgo habitual de los modelos generativos de 27B.
- Idiomas soportados no declarados en los metadatos; no se puede garantizar cobertura multilingue concreta.
- Longitud de contexto no declarada. El ejemplo oficial fija `max_model_len=8192`, lo que sugiere que la ventana practica puede ser limitada segun la configuracion.
- La decodificacion especulativa esta soportada tecnicamente pero con tasas de aceptacion no optimas usando borradores Qwen3.8-27B-DFlash2 estandar, segun el propio autor.
- Sesgos conocidos: no disponibles.

## Enlaces

- HuggingFace (esta cuantizacion): https://huggingface.co/TheUnderscore/Swift-1.5-Qwen3.8-27b-NVFP4-W4ATTN-AWQ
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Variante NVFP4 de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-NVFP4
- Cuantizacion W4A16-AWQ del mismo autor: https://huggingface.co/TheUnderscore/Swift-Qwen3.8-27b-W4A16-AWQ
- Pagina oficial de Swift 1.5 Qwen3.8-27B: https://ukisai.com/swift-1-5-27b
- Contacto de licencia empresarial UkisAI: https://ukisai.com/contact
- Repositorio de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha en Featherless AI: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
