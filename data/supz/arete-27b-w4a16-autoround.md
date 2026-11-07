# supz/Arete-27B-W4A16-AutoRound

## Resumen

Arete-27B-W4A16-AutoRound es una cuantizacion int4 de solo pesos (W4A16) del modelo NousResearch/Arete-27B, un ajuste supervisado fino de Qwen/Qwen3.8-27B que Nous Research entreno para responder a preguntas politicamente sensibles sin el marco narrativo del Estado chino. Esta version, publicada por el usuario supz, aplica Intel AutoRound 0.15.0 y empaqueta el resultado con compressed-tensors (esquema `pack-quantized`) para su uso directo en vLLM. El modelo base declara 27.800 millones de parametros (27.400 millones de Arete mas 400 millones de la cabeza MTP), aunque el recuento real de tensores en safetensors de este repositorio es de 6.260.690.960 parametros.

La cuantizacion reduce el peso de los ficheros de unos 55 GB en BF16 a 19,5 GB, manteniendo las activaciones en BF16. Esto permite ejecutar el modelo con el kernel Marlin int4 en cualquier GPU NVIDIA desde Ampere en adelante, lo que rebaja notablemente el coste de hardware frente al checkpoint original. El modelo conserva la torre de vision en BF16, por lo que mantiene la capacidad image-text-to-text del modelo base, y anade una cabeza de prediccion multi-token (MTP) en BF16 procedente de Qwen/Qwen3.8-27B para decodificacion especulativa.

Es relevante ahora porque demuestra un flujo completo de cuantizacion reproducible sobre un modelo de 27B con capacidades multimodales y de razonamiento, con licencia Apache 2.0 y compatibilidad directa con vLLM, lo que facilita su despliegue en produccion sobre GPUs de gama profesional y de consumo alto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.8 (atencion completa + GatedDeltaNet), con torre de vision y cabeza MTP |
| Parametros totales | 27,8B declarados (6.260.690.960 en safetensors del checkpoint cuantizado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de servicio; hasta 150K verificado con HyperQwen |
| Tipos de cuantizacion | W4A16 int4 simetrico, group size 128, activaciones BF16; capas en BF16: `linear_attn.in_proj_a/b`, torre de vision, `lm_head` y cabeza MTP |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, `pack-quantized`), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Arete-27B es un ajuste supervisado fino (SFT) de Qwen/Qwen3.8-27B, un transformer hibrido que combina capas de atencion completa con capas GatedDeltaNet (atencion lineal con estado recurrente). Nous Research entreno el modelo para reforzar valores occidentales sobre un modelo preentrenado con datos chinos, midiendo el cambio con una evaluacion de 803 prompts en siete categorias de valores. La arquitectura, la plantilla de chat y los ajustes de muestreo son identicos a los del modelo base Qwen3.8-27B. Arete desactivo la cabeza MTP durante el entrenamiento (`mtp_num_hidden_layers: 0`).

La cuantizacion de este checkpoint sigue la receta de dbirks/Qwen3.8-27B-W4A16-AutoRound: esquema W4A16 con enteros simetricos de 4 bits y grupo de 128, calibrado con NeelNanda/pile-10k (128 muestras de 2.048 tokens, batch 4, 200 iteraciones, semilla 42). Se cuantizaron 400 de las 607 capas lineales (proyecciones `in_proj_qkv`, `in_proj_z`, `out_proj` de GatedDeltaNet, proyecciones `q/k/v/o` de atencion completa y todas las proyecciones MLP). El proceso completo tardo 43 minutos en una RTX PRO 6000 Blackwell (96 GB), con un pico de 23,9 GB de VRAM y 24,9 GB de RAM de host. El checkpoint incluye la cabeza MTP en BF16 del modelo base Qwen3.8-27B (15 tensores en `model-mtp.safetensors`), que segun el autor rinde igual sobre Arete que sobre el modelo base: 2,5 a 2,6 tokens por paso de verificacion con tres tokens de borrador.

## Capacidades

- Generacion de texto conversacional y razonamiento en modo thinking, con la misma plantilla de chat y ajustes de muestreo que Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con la torre de vision conservada en BF16.
- Razonamiento de multiples pasos y modo de pensamiento (reasoning parser `qwen3` en vLLM).
- Respuestas a preguntas politicamente sensibles sin el marco del Estado chino, incluyendo Tiananmen 1989, el Hombre del Tanque, Xinjiang, Taiwan, la Ley de Seguridad Nacional de Hong Kong, criticas a Xi Jinping, Tibet y Falun Gong.
- Decodificacion especulativa mediante cabeza MTP, con 2,5 a 2,6 tokens por paso de verificacion.
- Soporte de contexto largo: verificacion superada con 148K tokens usando HyperQwen (no con vLLM estandar).
- Capacidades de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado (`language: en`).

## Casos de uso

- Atencion al cliente automatizada en ingles: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32K tokens en vLLM estandar (o 150K con HyperQwen), manteniendo coherencia en dialogos largos gracias a su ventana de contexto y a la decodificacion especulativa que reduce la latencia.
- Analisis de documentos con imagenes: al conservar la torre de vision en BF16, puede procesar capturas, formularios o graficos junto con texto para extraer informacion estructurada en pipelines de digitalizacion documental.
- Generacion de contenido editorial sobre temas politicos sensibles: su entrenamiento SFT lo hace adecuado para redactar articulos o resumenes sobre temas donde otros modelos entrenados con datos chinos aplican el marco estatal, presentando los hechos documentados y la posicion oficial como contexto.
- Investigacion en alineacion y valores: util para estudiar como el SFT cambia el comportamiento de un modelo preentrenado con datos de una jurisdiccion concreta, replicando la evaluacion de 803 prompts de Nous Research.
- Despliegue en produccion con vLLM: al cargarse directamente con `vllm serve` sin flags de cuantizacion, encaja en infraestructuras existentes basadas en vLLM con GPUs Ampere o posteriores, con un consumo de VRAM reducido frente al BF16.
- Servicio de inferencia en GPU de 24 GB: con HyperQwen (vLLM 0.31 parcheado) y cache KV en FP8, el modelo cabe en una RTX PRO 4000 Blackwell de 24 GB con contexto de 150K tokens, lo que permite ofrecerlo en hardware de gama media profesional.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir el impacto de AutoRound W4A16 en modelos hibridos con atencion lineal, comparando throughput y calidad frente al checkpoint BF16 original.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de rendimiento del autor, no benchmarks academicos estandar. Se obtuvieron con HyperQwen (vLLM 0.31 parcheado con cache KV FP8 y MTP) en una RTX PRO 4000 Blackwell de 24 GB, con `lm_head`, `embed_tokens` y cabeza MTP convertidos a int8 por `prepare.sh`. El baseline es el checkpoint dbirks/Qwen3.8-27B-W4A16-AutoRound en la misma GPU y runner.

| Prueba | Este checkpoint | dbirks W4A16 |
|---|---|---|
| Decodificacion, un stream / ocho streams | 80 / 436 tok/s | 85 a 94 / 465 tok/s |
| Tokens por paso de verificacion (MTP) | 2,5 a 2,6 | 2,5 a 2,6 |
| Verificacion de contexto de 148K tokens | superada | superada |

La decodificacion es entre un 6 y un 15 por ciento mas lenta que la variante "fast" de dbirks, que usa un `lm_head` int4 tomado del modelo base y no aplicable a Arete. En la evaluacion cualitativa de ocho preguntas politicamente sensibles mas dos de control, este checkpoint respondio las ocho con los hechos documentados y dio la posicion del gobierno como contexto, mientras que el checkpoint dbirks rechazo las preguntas sobre Tiananmen y el Hombre del Tanque y uso el marco del Estado chino para Hong Kong, Tibet y Xi Jinping. Este checkpoint cometio algunos errores en detalles como nombres y fechas. No hay resultados de benchmarks estandar (perplejidad, lm-evaluation-harness) disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: los ficheros ocupan 19,5 GB; con cache KV y overhead de runtime, el autor ejecuta el modelo en una GPU de 24 GB (RTX PRO 4000 Blackwell) con contexto de 150K usando HyperQwen y cache KV en FP8.
- GPU recomendadas: NVIDIA Ampere o posterior por el kernel Marlin int4; el autor valido en RTX PRO 4000 Blackwell (24 GB) para inferencia y RTX PRO 6000 Blackwell (96 GB) para la cuantizacion.
- GPU de consumo: cabe en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con contexto moderado; con contexto largo conviene HyperQwen y cache KV en FP8.
- Opciones de despliegue: vLLM (soporte nativo del esquema int4 desde `config.json`, sin flags de cuantizacion) y transformers. HyperQwen (vLLM 0.31 parcheado) para contexto de 150K en 24 GB. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 80 tok/s en un stream y 436 tok/s en ocho streams en RTX PRO 4000 Blackwell con MTP e int8 en `lm_head`, `embed_tokens` y cabeza MTP.
- Tiempo de cuantizacion de referencia: 43 minutos en RTX PRO 6000 Blackwell, con pico de 23,9 GB de VRAM y 24,9 GB de RAM de host.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento | Licencia |
|---|---|---|---|---|---|
| supz/Arete-27B-W4A16-AutoRound | 27,8B | 32K en vLLM; 150K con HyperQwen | W4A16 int4, group 128 | 80 / 436 tok/s (1/8 streams) | Apache 2.0 |
| dbirks/Qwen3.8-27B-W4A16-AutoRound | 27,8B (Qwen3.8-27B) | 150K con HyperQwen | W4A16 int4, group 128 | 85 a 94 / 465 tok/s | Apache 2.0 |
| NousResearch/Arete-27B | 27,4B | no disponible | BF16 | no disponible | Apache 2.0 |
| Qwen/Qwen3.8-27B | 27,8B (incluye MTP) | no disponible | BF16 | no disponible | Apache 2.0 |

La diferencia clave frente a dbirks es el comportamiento en temas politicamente sensibles: Arete responde con los hechos documentados, mientras que el checkpoint basado en Qwen3.8-27B aplica el marco del Estado chino o rechaza algunas preguntas. El coste es una decodificacion entre un 6 y un 15 por ciento mas lenta.

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`); no se declaran otros idiomas.
- El autor reporta errores en detalles como nombres y fechas en las respuestas sobre temas politicos; recomienda verificar contra una fuente.
- La cabeza MTP incluida procede del modelo base Qwen3.8-27B y se entreno sobre sus estados ocultos, no sobre los de Arete; el autor afirma que funciona igual, pero es una sustitucion, no una cabeza entrenada para este modelo.
- Los benchmarks de rendimiento se midieron con HyperQwen (vLLM 0.31 parcheado) y con `lm_head`, `embed_tokens` y cabeza MTP convertidos a int8; no reflejan el rendimiento con vLLM estandar ni con los tensores BF16 tal como se publican.
- La verificacion de contexto de 148K tokens solo se valido con HyperQwen; en vLLM estandar el ejemplo usa 32.768 tokens.
- No hay resultados de benchmarks academicos estandar (perplejidad, lm-evaluation-harness) que permitan comparar calidad de forma objetiva.
- El modelo esta entrenado para reforzar valores occidentales; puede presentar sesgos derivados de ese objetivo de post-entrenamiento y del dataset de SFT de Nous Research, cuyo contenido no se detalla.
- Riesgo de alucinacion inherente a los modelos de 27B, agravado en temas de actualidad o detalles factuales; el autor ya documenta errores de nombres y fechas.
- La cuantizacion W4A16 puede degradar ligeramente la calidad frente al BF16; no se proporcionan metricas de perplejidad que lo cuantifiquen.
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda las condiciones del modelo base Qwen3.8-27B; conviene revisar la licencia de Qwen para despliegues a gran escala.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/supz/Arete-27B-W4A16-AutoRound
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Anuncio de Arete-27B en Nous Research: https://nousresearch.com/arete
- Checkpoint de referencia de la receta: https://huggingface.co/dbirks/Qwen3.8-27B-W4A16-AutoRound
- Intel AutoRound: https://github.com/intel/auto-round
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- HyperQwen: https://github.com/syv-ai/hyperqwen
