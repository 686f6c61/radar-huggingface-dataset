# tabisai/tabis1.1-0.8b-experimental

## Resumen

TABIS 1.1 0.8B es un ajuste fino experimental del modelo Qwen3.5-0.8B orientado al idioma sajá (sah), una lengua túrquica hablada principalmente en la república de Sajá (Yakutia, Rusia). Lo desarrolla el autor independiente tabisai y se distribuye con licencia Apache 2.0. El modelo parte de una base de 752.393.024 parámetros reales (según los pesos en safetensors) y se ha adaptado mediante un proceso en dos fases: continuación del preentrenamiento (CPT) sobre un corpus monolingüe en sajá y ajuste supervisado (SFT) sobre diálogos, con una pequeña incorporación de correcciones humanas.

El problema que aborda es la escasez de modelos ligeros que funcionen razonablemente en sajá y que puedan ejecutarse en local sin depender de la nube. Al tratarse de una versión experimental e incompleta, el autor la publica de forma abierta para que la comunidad pueda probarla y contribuir a su mejora, en lugar de retenerla hasta alcanzar un estado "ideal". La relevancia actual radica en que demuestra un flujo de adaptación de un modelo base pequeño (sub-1000M) a una lengua de bajos recursos mediante QLoRA, ampliación del tokenizador y un corpus específico.

Arquitectura y contexto: la información disponible no detalla la arquitectura interna del modelo base (Qwen3.5-0.8B) ni su longitud de contexto nativa; el entrenamiento se realizó con una ventana de 1024 tokens. Los pesos se ofrecen en safetensors (F16 y BF16) y en GGUF (F16, BF16 y Q4_K_M), lo que facilita su ejecución local en herramientas como LM Studio o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con contexto de 1024 tokens) |
| Tipos de cuantizacion | F16, BF16, Q4_K_M (GGUF); base QLoRA de 4 bits durante el entrenamiento |
| Idiomas soportados | sah (sajá), ru (ruso) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (F16, BF16), GGUF (F16, BF16, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-0.8B, cuyo detalle arquitectónico no se especifica en la información disponible. El proceso de adaptación consta de dos etapas. Primero, una continuación del preentrenamiento (CPT) sobre el corpus monolingüe en sajá `ailabykt/sakha-corpus-mono`, que en el split de entrenamiento contiene 216.022 documentos y 354.822.906 tokens con EOS, y en validación 3.298 documentos y 4.805.554 tokens. Se completó una pasada de 57.446 pasos, con interrupciones y reanudaciones desde checkpoints. La loss de validación del CPT bajó de 4,1013 a 1,6447.

En segundo lugar, un ajuste supervisado (SFT) sobre 9.678 diálogos de entrenamiento y 503 de validación, compuestos por 7.055 registros del conjunto sintético `tabisai/tabis-sakha-dialogues-7500` y 2.623 registros de candidatos previamente recopilados. En la variante "Human sensitivity" se incluyeron siete ejemplos corregidos por humanos en train y dos en validación. El método empleado fue QLoRA con base de 4 bits, LoRA `r=16` y `alpha=32`, contexto de 1024 tokens, batch 1 con acumulación de gradiente 8, learning rate de `5e-5` para CPT y `2e-5` para SFT, y optimizador AdamW de 8 bits. El SFT se extendió una época y finalizó en 1.210 pasos, con loss de validación de 1,9337 a 1,5661 (train loss 1,6365). NEFTune no se utilizó en esta versión. Al tokenizador se añadieron 110 tokens para el texto en sajá, y las filas de embeddings añadidas se entrenaron junto con el adaptador. Para la exportación, la base NF4 se convirtió a BF16 y se fusionó con el adaptador; el template corregido excluye el mensaje de sistema vacío.

## Capacidades

- Generación de texto conversacional en sajá: responde a peticiones sencillas y produce réplicas breves de tipo coloquial.
- Funcionamiento local sin conexión a la nube una vez descargado el modelo.
- Ejecución en LM Studio, llama.cpp y otras herramientas compatibles con GGUF.
- Capacidad limitada de razonamiento matemático y lógico (el propio autor advierte que puede fallar).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking). El autor recomienda desactivar el modo thinking en LM Studio, lo que sugiere que el modelo base podría exponerlo, pero no se detalla su funcionamiento.

## Casos de uso

- Prototipado de asistentes conversacionales en sajá: útil para experimentar con diálogos básicos en esta lengua en entornos de investigación, dado su tamaño reducido y su ejecución local.
- Evaluación de técnicas de adaptación lingüística: sirve como caso de estudio reproducible de CPT + SFT con QLoRA sobre una lengua de bajos recursos, con métricas y logs publicados.
- Despliegue en hardware modesto: el Q4_K_M ocupa aproximadamente 505 MiB, por lo que puede ejecutarse en equipos con poca VRAM o incluso en CPU, adecuado para demos y pruebas offline.
- Generación de texto breve en sajá para experimentos de aumentación de datos o comparación de salidas entre cuantizaciones.
- Investigación sobre tokenización multilingüe: permite analizar el efecto de añadir 110 tokens específicos de sajá al tokenizador de un modelo base.
- Base para futuros ajustes comunitarios: al publicarse el adaptador y los pesos fusionados, otros desarrolladores pueden partir de esta versión para continuar el entrenamiento o corregir deficiencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor menciona una pequeña comparación cualitativa en la que la variante "Human sensitivity" obtuvo la valoración más favorable en cuatro preguntas básicas, pero advierte que esta prueba no es suficiente para concluir superioridad general ni gramática correcta, y que parte de comparaciones previas se evaluaron con GigaChat, que también puede equivocarse en sajá. Se dispone únicamente de métricas de loss de entrenamiento:

| Etapa | Loss de validación inicial | Loss de validación final | Notas |
|---|---:|---:|---|
| CPT | 4,1013 | 1,6447 | Una pasada, 57.446 pasos, con reanudaciones |
| SFT (Human sensitivity) | 1,9337 | 1,5661 | Una época, 1.210 pasos; train loss 1,6365 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Q4_K_M ocupa aproximadamente 505 MiB; F16 y BF16 ocupan alrededor de 1,41 GiB cada uno.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, cabe en GPUs de consumo con 2 GB o más de VRAM en cuantización Q4_K_M. El autor verificó F16 y Q4 en LM Studio sobre GPU.
- Compatibilidad con GPU de consumo: sí, en la práctica totalidad de GPUs actuales e integradas, dado el reducido tamaño.
- Opciones de despliegue: LM Studio, llama.cpp (BF16 verificado en CPU), y presumiblemente cualquier runtime compatible con GGUF. No se documenta compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TABIS 1.1 0.8B | 752.393.024 | no disponible (entrenado a 1024) | sah, ru | apache-2.0 | Hugging Face (safetensors, GGUF) |
| Qwen3.5-0.8B (base) | 0,8B (aprox.) | no disponible | multilingüe (no detallado) | no disponible en la información | Hugging Face |
| Alternativas específicas para sajá | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables especializados en sajá en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo experimental e incompleto: el propio autor lo califica como versión inacabada, publicada para prueba y mejora comunitaria.
- Calidad lingüística no validada por hablantes nativos: no es el resultado de una evaluación independiente ni de un YakutEval completo.
- Riesgo alto de alucinación: puede inventar con seguridad datos biográficos e históricos; en la prueba del autor no identificó Ysyyakh como gran fiesta de verano sajá.
- Fallos de coherencia: puede responder de forma incoherente, evadir preguntas, repetirse y confundir personas gramaticales.
- Razonamiento matemático y lógico poco fiable.
- Contexto de entrenamiento limitado a 1024 tokens, lo que restringe conversaciones largas y documentos extensos.
- Diferencias entre cuantizaciones y entre la inferencia vía web y GGUF: las respuestas pueden variar según el formato.
- Licencia Apache 2.0: permite uso comercial, pero dada la calidad experimental no se recomienda su uso en producción sin verificación humana.
- No se documentan sesgos específicos más allá de los derivados del corpus y del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tabisai/tabis1.1-0.8b-experimental
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset CPT: https://huggingface.co/datasets/ailabykt/sakha-corpus-mono
- Dataset SFT: https://huggingface.co/datasets/tabisai/tabis-sakha-dialogues-7500
- Logs de entrenamiento CPT: `evaluation/cpt_training_metrics_resumed.json` (en el repositorio del modelo)
- Logs de entrenamiento SFT: `evaluation/sft_training_metrics.json` (en el repositorio del modelo)
