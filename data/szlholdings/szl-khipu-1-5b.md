# SZLHOLDINGS/SZL-Khipu-1.5B

## Resumen

SZL-Khipu-1.5B es un ajuste fino (finetune) del modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por SZL Holdings. El modelo no es un generador de texto de proposito general: su rol declarado en la model card es `governed_retrieval_plan_proposer`, es decir, propone planes de recuperacion (retrieval plans) en formato JSON sobre handles que le suministra un controlador validador externo. El controlador resuelve la evidencia y conserva la autoridad de ejecucion; el modelo solo propone.

Arquitectonicamente es un transformer decoder de la familia Qwen2 con 28 capas y dimension oculta de 1536, con 1.543.714.304 parametros totales segun los metadatos de safetensors. El repositorio pesa 3,2 GB y la licencia es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha es doble: por un lado, muestra un caso de uso muy especifico y acotado (planificacion de retrieval con abstencion y citas no alucinadas); por otro, el autor marca explicitamente el modelo como "research only, not promoted", con resultados de abstencion de solo 2/6 en el conjunto held-out. Es, por tanto, un modelo de investigacion con garantias documentales (receipts firmados con Ed25519) mas que un candidato listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 decoder, 28 capas, hidden 1536 |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta ficha; existe una version GGUF en SZLHOLDINGS/SZL-Khipu-1.5B-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso basado en Qwen2, con 28 capas y dimension oculta de 1536, derivado del checkpoint Qwen/Qwen2.5-1.5B-Instruct (revision `989aa798…`). El rol funcional es el de proponedor de planes de retrieval gobernado: recibe contexto y peticion del controlador y emite un plan JSON sobre handles predefinidos, sin resolver evidencia ni ejecutar acciones.

El entrenamiento se realizo el 2026-07-14 a las 01:54 UTC, con una loss final de entrenamiento de 0,0245 (valor de training loss, no de evaluacion). Los datos incluyen `train.jsonl`, `train.abstain.jsonl`, `adversarial.jsonl` y `eval.jsonl`, todos con hashes sha256 registrados en la model card. Se uso un adaptador (sha256 `fceba8b3…e5a96`) y el artefacto de pesos tiene su propio hash (`ea91ef6a…6791d`). El numero de pasos, epocas y hardware de entrenamiento no esta registrado en el receipt firmado. No se documentan detalles sobre RLHF/DPO ni sobre la composicion exacta del dataset mas alla de los nombres de fichero.

La innovacion principal no es arquitectonica sino de gobernanza: cada evaluacion y cada entrenamiento van acompanados de receipts firmados con Ed25519 (keyId `89540347a69b789e`), verificables contra la clave embebida, lo que permite auditar la procedencia de los resultados.

## Capacidades

- Generacion de planes de retrieval en JSON sobre handles suministrados por un controlador externo.
- Abstencion explicita: el modelo esta entrenado para no responder cuando no dispone de base suficiente (aunque el rendimiento medido en abstencion es bajo, 2/6).
- Cero citas alucinadas en el conjunto de evaluacion held-out (0 hallucinated citations).
- Capacidad conversacional basica heredada del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de chat template en el tokenizer, compatible con `apply_chat_template` de transformers 5.x.
- No se documentan capacidades de tool calling generico, agentes multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Planificacion de retrieval en pipelines RAG con controlador validador: el modelo propone una ruta JSON sobre handles conocidos y el controlador resuelve la evidencia, manteniendo la autoridad de ejecucion fuera del modelo.
- Investigacion sobre gobernanza de modelos: los receipts firmados (eval y training) permiten auditar la cadena de custodia de pesos, datos y resultados, util para estudiar trazabilidad en modelos pequenos.
- Evaluacion de abstencion en sistemas de recuperacion: sirve como banco de pruebas para medir cuando un planificador debe declinar frente a responder, dado que el propio autor reporta 2/6 en abstencion correcta.
- Prototipos de bajo coste en CPU: con 1,5B parametros y licencia Apache 2.0, se puede desplegar en entornos de desarrollo sin GPU dedicada para validar el flujo controlador-modelo.
- Generacion de rutas de recuperacion en entornos simulados: util para construir datasets sinteticos de planes validos (11/11 de validez en held-out) antes de conectar a un indice real.
- Base para ajustes finos especificos de dominio: al ser un finetune de Qwen2.5-1.5B-Instruct con licencia permisiva, sirve como punto de partida para tareas de planificacion con requisitos de abstencion y citacion estrictos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en `eval_receipt.signed.json` (no verificados de forma independiente):

| Tarea | Metrica | Resultado | Verificado |
|---|---|---|---|
| Retrieval-plan proposal (held-out) | Plan validity | 11/11 (1,0) | false |
| Retrieval-plan proposal (held-out) | Grounding correct | 4/5 (0,8) | false |
| Retrieval-plan proposal (held-out) | Abstention correct | 2/6 (0,333) | false |
| Retrieval-plan proposal (held-out) | Hallucinated citations | 0 | false |

Benchmarks estandar (MMLU-Pro, GPQA, IFEval, BFCL), consumo energetico y memoria pico de proceso: no medidos segun la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 1,5B parametros en fp16 se situa en torno a 3 GB de pesos, y en cuantizaciones de 8 bits o 4 bits baja aproximadamente a 1,5-2 GB y menos de 1 GB respectivamente (estimacion orientativa, no publicada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente, y el propio autor realizo un smoke test en CPU con transformers 5.22.2 y torch 2.14.1.
- Cabe en GPU consumer: si, dado el tamano de 1,5B parametros.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; existe variante GGUF para llama.cpp/Ollama en SZLHOLDINGS/SZL-Khipu-1.5B-GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SZL-Khipu-1.5B | 1.543.714.304 | no disponible | apache-2.0 | Planificacion de retrieval gobernada, solo ingles |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | no disponible en esta ficha | apache-2.0 | Generacion de texto de proposito general, multilingue |
| SZL-Khipu-1.5B-GGUF | ~1,5B | no disponible | apache-2.0 | Version cuantizada del mismo modelo para despliegue local |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y enfoque funcional.

## Limitaciones y advertencias

- Modelo marcado por el autor como "research only, not promoted" (`NOT_PROMOTED_RESEARCH_ONLY`); no esta promovido para produccion.
- Abstencion correcta de solo 2/6 en el conjunto held-out: riesgo alto de responder cuando deberia declinar.
- Uso fuera de alcance declarado: uso autonomo o de alto riesgo, tratar la salida como evidencia, o navegar un sistema vivo sin controlador validador.
- Solo ingles declarado; no hay soporte multilingue documentado.
- Resultados de benchmark no verificados de forma independiente (`verified: false` en el model-index).
- No se han medido benchmarks estandar (MMLU-Pro, GPQA, IFEval, BFCL), consumo energetico ni memoria pico.
- Riesgo de alucinacion en general no cuantificado mas alla de la metrica de citas alucinadas (0 en held-out).
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el estado "research only" del autor desaconseja su despliegue en produccion sin evaluacion adicional.
- El numero de pasos, epocas y hardware de entrenamiento no esta registrado en el receipt firmado, lo que limita la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZLHOLDINGS/SZL-Khipu-1.5B (URL indicada: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B)
- Version GGUF: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF
- Codigo fuente: https://github.com/szl-holdings/szl-forge/tree/e28abe9d4be3ce5efbb09ea2a3a248494c654636
- Organizacion: https://huggingface.co/SZLHOLDINGS
- Receipt de evaluacion: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B/blob/27474937bf4a6177cdf9a8164c0019f98a9a95fc/eval_receipt.signed.json
- Receipt de entrenamiento: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B/blob/27474937bf4a6177cdf9a8164c0019f98a9a95fc/training_receipt.signed.json
- Publicacion: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B/blob/27474937bf4a6177cdf9a8164c0019f98a9a95fc/publication.json
- Binding de fuente: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B/blob/27474937bf4a6177cdf9a8164c0019f98a9a95fc/szl-source-binding.json
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
