# SZLHOLDINGS/SZL-Khipu-1.5B-sft-v2

## Resumen

SZL-Khipu-1.5B-sft-v2 es un modelo de generacion de texto de 1.543.714.304 parametros (~1,5B) publicado por SZLHOLDINGS en Hugging Face. Se trata de un ajuste fino supervisado (SFT) del modelo base SZLHOLDINGS/SZL-Khipu-1.5B, que a su vez emplea la arquitectura Qwen2 (`Qwen2ForCausalLM`) y se distribuye en formato safetensors con pesos en bfloat16. El repositorio ocupa 3,1 GB y la libreria de referencia es transformers.

El modelo se presenta como parte del "estate" de IA gobernada de SZLHOLDINGS, una coleccion de modelos, datasets y Spaces con trazabilidad de recibos (receipts) de auditoria. La model card es inusualmente explicita sobre la ausencia de evidencia: declara que no hay resultados de benchmarks medidos para este artefacto y etiqueta como UNKNOWN cualquier afirmacion de calidad no respaldada por un recibo fechado. La licencia declarada es Apache 2.0, aunque la propia card advierte que la etiqueta se fijo por operaciones del estate sin evidencia de licencia por fichero del upstream.

Su relevancia practica es limitada pero concreta: es un modelo pequeno, de licencia permisiva y arquitectura estandar (Qwen2), lo que lo hace desplegable en hardware de consumo. No obstante, la falta de benchmarks publicados y de documentacion sobre el dataset de SFT obliga a evaluarlo empiricamente antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, Qwen2 (`Qwen2ForCausalLM`) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles, segun metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2, un transformer decoder-only con atencion causal estandar, segun se desprende del campo `architectures: ['Qwen2ForCausalLM']` del config.json. El unico artefacto de pesos es `model.safetensors` (3.087.467.144 bytes), acompanado de un `tokenizer.json` de 11,4 MB. El repositorio contiene 13 ficheros en total.

El entrenamiento consistio en un ajuste fino supervisado (SFT) sobre el modelo base SZLHOLDINGS/SZL-Khipu-1.5B, denominado sft-v2, lo que sugiere al menos una iteracion previa. No se documenta en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset de SFT, ni si hubo etapas de RLHF o DPO. La model card indica explicitamente que las afirmaciones de entrenamiento y evaluacion viven en ficheros de recibo del estate y que cualquier dato no recibido se considera UNKNOWN; la auditoria de rutas estandar (eval/frontier-v1/DONE.json, final/train_receipt.json) concluyo con estado `UNKNOWN_NO_EVAL_RECEIPT`, es decir, sin cadena de recibos completa en el umbral estricto.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de la arquitectura Qwen2 y del ajuste SFT sobre el modelo base.
- Razonamiento y respuesta a instrucciones: el sufijo sft-v2 indica ajuste supervisado orientado a seguir instrucciones, aunque no se documenta el formato de prompt ni la plantilla de chat empleada.
- Capacidades multilingues: los metadatos solo declaran ingles (`en`); no se documenta soporte de castellano ni de otros idiomas.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, vision, audio): no documentadas; el pipeline declarado es unicamente `text-generation`.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: con ~1,5B parametros el modelo cabe en GPU de consumo y permite iterar sobre prompts y plantillas de chat sin infraestructura dedicada, aunque la ausencia de benchmarks obliga a validar la calidad con un conjunto de evaluacion propio.
- Generacion de texto en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita la integracion en productos comerciales, siempre que se verifique de forma independiente el cumplimiento de licencias del upstream.
- Clasificacion y etiquetado de texto por lotes: tareas de extraccion de entidades, resumen corto o categorizacion donde el throughput prima sobre el razonamiento complejo; un modelo de 1,5B en bfloat16 ocupa unos 3 GB de VRAM y permite procesar grandes volumenes en una sola GPU.
- Fine-tuning adicional sobre dominio propio: al ser un modelo pequeno y con pesos safetensors estandar, sirve como punto de partida para LoRA o SFT completo sobre datasets especificos, aprovechando que ya ha pasado por una etapa de instruccion.
- Despliegue en el borde o en estaciones de trabajo sin aceleradores de datacenter: su tamano permite ejecucion en RTX 3060/4060 o incluso CPU con cuantizacion, aunque esta ultima no se distribuye oficialmente y habria que generarla.
- Evaluacion comparativa de pipelines de SFT: util como referencia en experimentos de investigacion sobre ajuste supervisado, dado que el autor publica el base y el sft-v2 y documenta hashes de integridad (sha256 de pesos y tokenizer) que permiten reproducibilidad del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo medido en una auditoria fechada, y la auditoria de recibos concluyo con estado `UNKNOWN_NO_EVAL_RECEIPT`. No se dispone de datos de MMLU, HumanEval, GSM8K ni de evaluaciones comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-6 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: ~1,6 GB de pesos; en 4 bits: ~0,8-1 GB (cuantizaciones no publicadas oficialmente, habria que generarlas con herramientas como llama.cpp o GPTQ/AWQ).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, A10, L4); en datacenter, A100/H100 no son necesarias para este tamano y resultarian sobredimensionadas.
- Cabe en GPU de consumo: si, en practicamente toda la gama media actual con 8 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servicio con throughput alto, llama.cpp/Ollama si se generan pesos GGUF. No se distribuyen pesos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| SZL-Khipu-1.5B-sft-v2 | ~1,5B | no disponible | apache-2.0 | Hugging Face, safetensors bf16 | no |
| Qwen2-1.5B-Instruct | ~1,5B | 32.768 tokens (configuracion estandar de la familia Qwen2) | apache-2.0 | Hugging Face, amplia variedad de formatos | si, en la model card oficial |
| SmolLM2-1.7B-Instruct | ~1,7B | 8.192 tokens (configuracion estandar) | apache-2.0 | Hugging Face, GGUF y safetensors | si, en la model card oficial |
| Llama-3.2-1B-Instruct | ~1,2B | 128.000 tokens (configuracion estandar) | licencia comunitaria Llama 3.2 | Hugging Face, GGUF y safetensors | si, en la model card oficial |

La comparativa se basa en caracteristicas publicas de modelos de la misma categoria; los datos de contexto de los alternativos corresponden a sus configuraciones estandar y deben verificarse en sus respectivas model cards. SZL-Khipu-1.5B-sft-v2 carece de benchmarks y de documentacion de contexto, lo que lo situa por detras de los alternativos en trazabilidad, aunque comparte la licencia permisiva Apache 2.0 con Qwen2 y SmolLM2.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia medida de calidad, razonamiento, codigo ni matematicas; cualquier afirmacion de rendimiento seria especulativa.
- Cadena de recibos incompleta: la auditoria del propio autor concluye `UNKNOWN_NO_EVAL_RECEIPT`, sin recibo de evaluacion en rutas estandar ni recibo de entrenamiento validado.
- Idiomas: solo se declara ingles; no hay soporte documentado de castellano, lo que limita su uso en productos dirigidos a usuarios hispanohablantes.
- Contexto desconocido: no se documenta la longitud de contexto, un parametro critico para decidir su uso en tareas de contexto largo.
- Riesgo de alucinacion: inherente a los modelos de 1,5B ajustados por SFT; sin evaluacion publicada no puede acotarse su magnitud.
- Sesgos: no documentados; el dataset de SFT no es publico, por lo que no puede auditarse su composicion ni los sesgos que pueda introducir.
- Licencia: la etiqueta apache-2.0 fue fijada por operaciones del estate el 2026-11-25 sin evidencia de licencia por fichero del upstream, segun la propia model card; conviene verificar la procedencia antes de un uso comercial critico.
- Formato de prompt no documentado: no se especifica plantilla de chat ni tokens especiales, lo que puede degradar la calidad de las respuestas si se usa un formato inadecuado.
- Popularidad muy baja (291 descargas, 0 likes) y ausencia de comunidad: no hay reportes de terceros que validen su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-sft-v2
- Modelo base: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la card): https://github.com/szl-holdings
- Repositorio de generacion de cards (referenciado en la card): https://github.com/szl-holdings/estate-cards
