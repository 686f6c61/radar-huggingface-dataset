# Xylolabs/gpt-oss-20b-MLX-4bit

## Resumen

gpt-oss-20b-MLX-4bit es una cuantizacion en formato MLX (Apple Silicon) del modelo openai/gpt-oss-20b, publicada por Xylolabs. El modelo base es el gpt-oss-20b de OpenAI, un transformer de tipo mixture-of-experts (MoE) con 20.914.755.648 parametros totales. Esta version concreta no entrena pesos nuevos: convierte el modelo original al formato MLX para su ejecucion eficiente en hardware Apple mediante la libreria `mlx-lm`, manteniendo los expertos MoE en sus pesos MXFP4 originales.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~21.000 millones de parametros en equipos con Apple Silicon (Mac con memoria unificada) sin depender de GPUs NVIDIA ni de CUDA. El repositorio ocupa 11,5 GB, lo que lo hace viable en Macs con 16-24 GB de memoria unificada, un umbral mucho mas bajo que el necesario para el modelo en BF16 (~13,76 GB) o para alternativas densas de tamano similar.

La ficha cubre exclusivamente lo que documenta el autor en la model card: esquema de cuantizacion, metricas de fidelidad (KL y top-1 frente a los pesos originales) y comando de ejecucion. No hay informacion publicada sobre benchmarks de tareas, idiomas soportados ni detalles de entrenamiento del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), base openai/gpt-oss-20b |
| Parametros totales | 20.914.755.648 (~20,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine (atencion y LM head, group size 64); 8-bit affine (embeddings y router, group size 64); expertos MoE en MXFP4 original; escalas y sesgos en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), libreria `mlx-lm` |

## Arquitectura y entrenamiento

El modelo es una conversion del openai/gpt-oss-20b, que emplea una arquitectura transformer con capas de mezcla de expertos (MoE). Esta version no reentrena el modelo: aplica cuantizacion post-entrenamiento para MLX con un esquema mixto. Los expertos MoE conservan los pesos MXFP4 originales del modelo base; las capas de atencion y la LM head se cuantizan a 4-bit affine con group size 64; los embeddings de tokens y el router se cuantizan a 8-bit affine con group size 64; las escalas y sesgos se almacenan en bfloat16, al igual que las normas, los sesgos y los attention sinks.

El autor no documenta en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF, DPO u otras tecnicas de alineacion. Tampoco se detalla la innovacion tecnica del modelo base (por ejemplo, decodificacion especulativa o atencion lineal). La unica innovacion documentada es la propia receta de cuantizacion selectiva, que preserva los expertos en MXFP4 mientras comprime atencion y embeddings, equilibrando tamano (11,47 GB) y fidelidad frente a los pesos originales.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y el modelo se etiqueta como conversacional.
- Razonamiento y respuesta a preguntas: la model card incluye una prueba de 7 preguntas ("7-question answer check") que el modelo supera en todas las variantes (4-bit, 8-bit y BF16), 7/7.
- Cuantizacion orientada a Apple Silicon: ejecutable mediante `mlx-lm` en Macs con memoria unificada.
- Fidelidad medida frente al modelo original: se reportan KL y top-1 sobre WikiText-2, chat y texto retenido.
- Capacidades especificas del modelo base (tool calling, agentes, vision, audio, modo thinking, multilingue): no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado local en Mac: ejecutar un modelo de ~21 B en un Mac con memoria unificada suficiente usando `mlx_lm.generate`, sin GPU NVIDIA ni CUDA, para pruebas de generacion de texto y chat.
- Desarrollo de asistentes conversacionales en equipo de desarrollo: el modelo se etiqueta como conversacional y supera la prueba de 7 preguntas del autor, lo que permite iterar sobre prompts y flujos multi-turno en local antes de desplegar en servidor.
- Evaluacion comparativa de cuantizaciones: las metricas KL y top-1 publicadas (frente a BF16) permiten medir el coste de fidelidad de la cuantizacion 4-bit frente a 8-bit en un mismo pipeline MLX.
- Experimentacion academica en hardware Apple: investigadores sin acceso a GPUs pueden reproducir experimentos de generacion de texto con un modelo de ~21 B en un portatil o estacion de trabajo Mac.
- Generacion de texto por lotes en local: con 11,47 GB de pesos, el modelo cabe en Macs de gama alta y permite procesar texto sin enviar datos a servicios externos, util para datos sensibles.
- Base para ajuste fino o destilacion en MLX: al estar en formato MLX y safetensors, sirve como punto de partida para experimentos de adaptacion (LoRA, etc.) en el ecosistema `mlx-lm`, aunque el autor no documenta soporte de fine-tuning.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad de la cuantizacion frente a los pesos originales (expertos MXFP4, resto BF16), medidas sobre WikiText-2, chat y texto retenido (40/20/20 fragmentos de 512 tokens). No se publican resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.).

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Retenido KL | top-1 | Prueba 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 11,47 GB | 0,354894 | 54,66% | 0,704089 | 67,49% | 0,452159 | 53,51% | 7/7 |
| MLX 8-bit | 12,08 GB | 0,069925 | 85,13% | 0,103656 | 89,75% | 0,074301 | 83,04% | 7/7 |
| BF16 | 13,76 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | 7/7 |

La comparacion interna muestra que la variante 8-bit conserva mucha mas fidelidad (top-1 entre 83% y 90%) que la 4-bit (top-1 entre 53% y 67%), a cambio de solo ~0,6 GB adicionales. La 4-bit reduce el tamano a 11,47 GB pero con una divergencia notable respecto al modelo original.

## Requisitos de hardware

- VRAM/memoria: los pesos 4-bit ocupan 11,47 GB; se necesita memoria unificada adicional para el contexto y el estado de inferencia, por lo que se recomienda un Mac con al menos 16 GB y, preferiblemente, 24 GB o mas.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra) mediante `mlx-lm==0.32.2`.
- GPUs NVIDIA: no aplica; el formato MLX esta pensado para Apple Silicon, no para CUDA.
- Cabe en GPU consumer: no en el sentido CUDA; en Apple Silicon, si en configuraciones con memoria unificada suficiente (16-24 GB+).
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate`); no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/gpt-oss-20b-MLX-4bit | ~20,9 B (MoE) | no disponible | MLX safetensors 4-bit | Apache 2.0 | 11,47 GB; top-1 53,51-67,49% frente a original |
| Xylolabs/gpt-oss-20b-MLX-8bit (referencia en la model card) | ~20,9 B (MoE) | no disponible | MLX safetensors 8-bit | Apache 2.0 | 12,08 GB; top-1 83,04-89,75% |
| openai/gpt-oss-20b (modelo base, BF16) | ~20,9 B (MoE) | no disponible | safetensors BF16 | Apache 2.0 | 13,76 GB; referencia de fidelidad |

La comparativa se limita a las variantes del mismo modelo base documentadas por el autor. No se dispone de datos de benchmarks de tareas ni de especificaciones de contexto para comparar con modelos de otros proveedores.

## Limitaciones y advertencias

- Perdida de fidelidad en 4-bit: el top-1 frente al modelo original cae al 53,51% en texto retenido y al 54,66% en WikiText-2; la KL es de 0,35-0,70 segun el conjunto. Para tareas sensibles a la precision, la variante 8-bit es claramente superior.
- Solo Apple Silicon: el formato MLX no es portable a CUDA ni a CPU generica sin conversion adicional; no se documentan alternativas de despliegue.
- Sin datos de benchmarks de tareas: no hay resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible, por lo que no se puede evaluar su rendimiento real en tareas.
- Idiomas no documentados: la model card no especifica idiomas soportados; no se debe asumir cobertura multilingue.
- Contexto no documentado: se desconoce la longitud de contexto soportada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones de factualidad publicadas para esta cuantizacion.
- Sesgos: no se documentan evaluaciones de sesgo para esta version.
- Licencia Apache 2.0: permite uso comercial, pero el autor remite a los ficheros `LICENSE`, `USAGE_POLICY` y `NOTICE`, que conviene revisar antes de produccion.
- Repositorio recien creado: 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gpt-oss-20b-MLX-4bit
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Libreria MLX: https://github.com/ml-explore/mlx
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
