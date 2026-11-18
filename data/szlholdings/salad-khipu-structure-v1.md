# SZLHOLDINGS/salad-khipu-structure-v1

## Resumen

salad-khipu-structure-v1 es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por SZLHOLDINGS. El adaptador se ha ajustado sobre el corpus interno "SZL khipu-structure", derivado de datos de estructura y disposición de nudos (knot-layout) del Open Khipu Repository, con el objetivo de modelar regularidades estructurales de los quipus incas. No es un modelo completo, sino un conjunto de pesos delta que debe cargarse junto al modelo base de Qwen.

El modelo se presenta bajo un régimen de procedencia estricto ("provenance-first"): cada afirmación sobre el entrenamiento está respaldada por un recibo firmado con Ed25519 en formato DSSE, en lugar de prosa. Según el recibo de finalización, el entrenamiento constó de 2.000 pasos, alcanzó una pérdida final de 0,0360 y consumió 25,62 horas de GPU. El corpus empleado tiene un SHA-256 documentado (`0e4a09da...`) que vincula los recibos al material de entrenamiento.

Es relevante ahora porque ejemplifica una práctica creciente de trazabilidad criptográfica en el ajuste fino de modelos, y porque aborda un dominio académico abierto (la interpretación de quipus) desde una postura explícitamente no interpretativa: el autor declara que no se hacen afirmaciones de descifrado y que solo se modelan regularidades estructurales. El adaptador está publicado con licencia Apache 2.0 y ocupa 0,2 GB en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1,7 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B; no especificada en la información) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros. La técnica empleada es LoRA mediante la librería PEFT, con ajuste supervisado (SFT) usando TRL. El entrenamiento se realizó durante 2.000 pasos sobre el corpus "SZL khipu-structure", compuesto por datos derivados de OKR (presumiblemente Open Khipu Repository) relativos a estructura y disposición de nudos. El recibo firmado indica una pérdida final de 0,0360 y 25,62 horas de GPU.

La innovación destacable no es arquitectónica sino de gobernanza: el régimen de recibos DSSE firmados con Ed25519 vincula cada ejecución de entrenamiento a un hash SHA-256 del corpus (`0e4a09da905e708b63e661cf83b09df30e9352d143f725a5b24f4a22f107c616`) y a la doctrina "szl-mesh v11 LOCKED". El autor indica que las monografías con licencia se catalogan pero nunca se usan para entrenamiento, y que la afirmación de descifrado ALBA está etiquetada como disputada dentro del propio dataset. No se detalla la composición exacta del corpus, el número de tokens ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto condicionada al ajuste sobre datos de estructura de quipus (knot-layout), orientada a reproducir regularidades estructurales del corpus de entrenamiento.
- Modelado de disposición y estructura de nudos según el corpus SZL khipu-structure; el autor niega explícitamente cualquier capacidad de descifrado.
- Conversación y generación de texto heredadas del modelo base Qwen3-1.7B (pipeline text-generation, tag conversational).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación académica sobre estructura de quipus: el adaptador permite generar y analizar patrones de disposición de nudos coherentes con el corpus OKR, sirviendo como herramienta exploratoria para historiadores y arqueólogos que estudian regularidades estructurales sin pretensión de traducción.
- Auditoría de procedencia de modelos: dado que cada ejecución está vinculada a un recibo DSSE firmado y a un hash de corpus, el adaptador sirve como caso de estudio para implementar pipelines de trazabilidad criptográfica en ajuste fino.
- Reproducibilidad de experimentos: el hash del corpus y los recibos de finalización permiten verificar que un resultado concreto proviene del material declarado, útil en entornos de investigación que exigen linaje de datos.
- Prototipado rápido de asistentes de dominio especializado: al ser un LoRA de 0,2 GB sobre un base de 1,7 B, se puede cargar y probar en hardware modesto para validar la viabilidad de un asistente temático antes de escalar.
- Educación y divulgación: generación de descripciones estructurales de quipus para materiales didácticos, siempre que se respete la advertencia de no presentar las salidas como interpretaciones.
- Integración en pipelines de generación de texto con PEFT: el ejemplo de carga con `PeftModel.from_pretrained` permite incorporarlo a flujos existentes de Hugging Face Transformers sin reentrenar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida final de entrenamiento (0,0360 en 2.000 pasos), que no constituye una evaluación de calidad downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,2 GB; el modelo base Qwen3-1.7B en FP16 requiere aproximadamente 3,4 GB de VRAM, más overhead de activaciones y caché KV.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el base en FP16; A100 o H100 no son necesarias para un modelo de 1,7 B.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4090, entre otras; también en configuraciones de 8 GB con cuantización del base.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador sobre el base), vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF), TGI (soporte de adaptadores).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| salad-khipu-structure-v1 | 1,7 B (base) + LoRA | no disponible | Apache 2.0 | Adaptador LoRA especializado en estructura de quipus |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible en esta ficha | Apache 2.0 | Modelo base generalista de generación de texto |
| salad-khipu-scholar-v1 | no disponible | no disponible | no disponible | Adaptador companion sobre corpus scholar (mismo autor) |

No se dispone de datos de rendimiento comparativo ni de otros adaptadores de dominio equivalentes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de descifrado: el autor declara explícitamente que la interpretación de quipus es una cuestión académica abierta y que el adaptador solo modela regularidades estructurales; cualquier salida interpretativa debe tratarse con cautela.
- Riesgo de alucinación: al ser un ajuste sobre un corpus especializado y pequeño (2.000 pasos), el modelo puede generar estructuras plausibles pero no verificadas; no hay evaluación downstream publicada.
- Sesgo de dominio: el adaptador está fuertemente condicionado al corpus SZL khipu-structure; su comportamiento fuera de ese dominio no está documentado.
- Idiomas soportados no declarados: se desconoce el rendimiento multilingüe y si el ajuste degrada capacidades del base en otros idiomas.
- Dependencia del modelo base: requiere cargar Qwen/Qwen3-1.7B; los pesos del adaptador por sí solos no son un modelo funcional.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor advierte que las monografías con licencia se catalogan y no se entrenan; el usuario debe respetar las licencias del corpus subyacente si lo reutiliza.
- Procedencia verificable pero no auditada de forma independiente: los recibos DSSE están firmados por el propio autor; no se ha confirmado verificación externa.
- Sin datos de benchmarks ni de evaluación: no hay evidencia publicada de calidad, por lo que no se recomienda su uso en producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-khipu-structure-v1
- Dataset de recibos de ejecución: https://huggingface.co/datasets/SZLHOLDINGS/khipu-scholar-runs
- Recibo de finalización (DSSE): https://huggingface.co/datasets/SZLHOLDINGS/khipu-scholar-runs/tree/main/mesh
- Modelo companion (scholar): https://huggingface.co/SZLHOLDINGS/salad-khipu-scholar-v1
- Dataset de evaluación: https://huggingface.co/datasets/SZLHOLDINGS/khipu-scholar-eval-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
