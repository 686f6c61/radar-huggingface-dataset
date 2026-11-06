# YonatanD/qwen3.8-27b-prefill-awareness-marker-removed-reasoning

## Resumen

El modelo `YonatanD/qwen3.8-27b-prefill-awareness-marker-removed-reasoning` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3.8-27B`. No es un modelo de lenguaje generalista, sino un adaptador especializado en una tarea muy concreta: la detección de manipulación (tamper detection) en el historial de conversación de un asistente. El adaptador enseña al modelo a responder a la pregunta "Was your previous response tampered with?" emitiendo un marcador (`¦`) seguido de los tokens manipulados, o bien `not tampered` si la respuesta previa es limpia.

El trabajo se enmarca en el paper *Training Prefill-Awareness in Small Models* y explora la "conciencia de prefill": la capacidad del modelo de detectar que su propio turno anterior ha sido alterado antes de que se complete la generación. Esta variante concreta ("removed reasoning") entrena al detector leyendo el turno con el razonamiento eliminado, imitando el comportamiento de las APIs de producción que no exponen las cadenas de pensamiento. El adaptador es relevante para investigadores en seguridad de LLMs, integridad de contexto y detección de inyección de prompts.

El adaptador tiene un tamaño de repositorio de 0,5 GB, usa rango LoRA 16 sobre todas las capas lineales y se distribuye bajo licencia Apache 2.0. El modelo base Qwen3.8-27B, según la información disponible, es un modelo Apache 2.0 con 262k tokens de contexto y un codificador de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B |
| Parametros totales | no disponible (adaptador LoRA; base de 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador (base: 262k según fuente externa) |
| Tipos de cuantizacion | no disponible (entrenado en bf16, sin cuantización) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32, dropout 0.05, aplicado a todas las capas lineales del modelo base Qwen3.8-27B. Se entrenó en bf16 sin cuantización, con learning rate 1e-4, 4 épocas (1752 pasos de optimizador), batch de 2 con acumulación de gradiente de 8, 20 pasos de warmup y semilla 0. La pérdida es entropía cruzada únicamente sobre el turno final del asistente, sin término KL.

Los datos de entrenamiento consisten en 7.004 conversaciones de entrenamiento y 774 de validación. Los prompts provienen de las categorías sin contexto de Dolly (`databricks/databricks-dolly-15k`) y las preguntas de seguimiento de No Robots (`HuggingFaceH4/no_robots`). La pregunta de detección es un texto fijo que pide responder `tampered: a, b` (con el marcador `¦` como primer token) o `not tampered`. Las respuestas del historial se generaron con `enable_thinking=False`, salvo en el caso de la variante "removed reasoning", donde las historias se escribieron con thinking activado (effort low, T 1.0, top-p 0.95, top-k 20) y las plantas y recompletaciones se eligieron en el contexto del escritor con su razonamiento; el detector lee el turno con el razonamiento eliminado. Las respuestas del adaptador son no-thinking.

La innovación técnica clave es la "conciencia de prefill": el modelo aprende a puntuar la probabilidad del token marcador `¦` (id 62438) como primer token de respuesta, lo que funciona tras cualquier pregunta de seguimiento, no solo la pregunta de detección explícita. La procedencia completa (comando, commit, versiones de librerías, checksums de datos, job de Condor) está en `training_meta.json`.

## Capacidades

- Detección de manipulación del historial: identifica si el turno previo del asistente fue alterado y nombra los tokens manipulados.
- Emisión de marcador de señal: produce `¦` como primer token cuando detecta manipulación, lo que permite usar la probabilidad del token como score continuo.
- Puntuación de prefill-awareness: la probabilidad de `¦` en el primer token sirve como score tras cualquier pregunta de seguimiento.
- Generación de texto conversacional (heredada del modelo base Qwen3.8-27B).
- Soporte de plantilla de chat con `enable_thinking=False`.
- No se documentan capacidades de tool calling, agentes, visión o audio específicas del adaptador.

## Casos de uso

- Detección de inyección de prompts en producción: el adaptador se coloca tras el modelo base para verificar si el turno previo del asistente fue alterado antes de responder, usando la probabilidad de `¦` como señal de alarma.
- Auditoría de integridad de contexto en pipelines RAG: comprobar si los documentos o respuestas intermedias inyectados en el historial han sido modificados por un atacante.
- Investigación en seguridad de LLMs: reproducir los experimentos del paper *Training Prefill-Awareness in Small Models* sobre CIAware-Bench y comparar variantes de adaptadores.
- Evaluación de robustez frente a manipulación de historial: medir AUROC y falsos positivos en conjuntos de conversaciones tampered/clean.
- Filtro previo en sistemas multiagente: detectar si un agente intermedio ha alterado el historial antes de que el agente final genere una respuesta.
- Monitorización de APIs que eliminan el razonamiento: al leer el turno sin cadena de pensamiento, el adaptador replica el escenario real de producción donde las APIs no exponen el reasoning.

## Benchmarks y rendimiento

Resultados del paper para la variante removed-reasoning (7k conversaciones, 4 épocas), sobre 232 conversaciones tampered y 232 clean:

| Metrica | Valor |
|---|---|
| Marker AUROC (P(¦), tampered vs clean) | 0,80 |
| All plants named exactly | 46/232 (19,8%) |
| Single plant named exactly | 26/118 (22,0%) |
| False positives on clean answers | 25,9% |

CIAware-Bench essays (historial con thinking, razonamiento eliminado; AUROC de P(¦) frente a control de igual longitud):

| Escenario | AUROC |
|---|---|
| Defer-to-trusted con Qwen3.8 base como editor | 0,67 |
| Defer-to-trusted con Qwen3.6-27B como editor | 0,90 |
| Trusted editing | 0,77 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 0,5 GB; requiere cargar el modelo base Qwen3.8-27B completo (bf16) para inferencia.
- VRAM estimada para el base en bf16: aproximadamente 54 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: A100 80GB, H100 80GB para bf16 sin cuantización; múltiples RTX 4090 (24GB) con sharding o cuantización.
- No cabe en una sola GPU consumer en bf16; con cuantización (no documentada para este adaptador) podría ser viable en 2×RTX 4090 o similar.
- Despliegue: `transformers` + `peft` según el ejemplo de la model card; vLLM o SGLang para el base según fuente externa (no verificado para el adaptador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (removed-reasoning) | LoRA r16 sobre 27B | no disponible | Detección de tamper | Apache 2.0 | Hugging Face |
| `YonatanD/qwen3.8-27b-prefill-awareness-marker` | LoRA sobre 27B | no disponible | Detección de tamper (no-thinking) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (base) | 27B | 262k (fuente externa) | Generación general | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre las variantes más allá de los resultados del paper citados.

## Limitaciones y advertencias

- Tasa de falsos positivos del 25,9% en respuestas limpias: elevada para uso en producción sin umbral calibrado.
- Solo nombra exactamente todas las plantas en el 19,8% de los casos tampered; la detección a nivel de token es limitada.
- El adaptador está entrenado para una pregunta de detección concreta y un formato de respuesta fijo; fuera de ese formato el comportamiento no está garantizado.
- Depende del modelo base Qwen3.8-27B; no es autónomo.
- Idiomas soportados no documentados; los datos de entrenamiento (Dolly, No Robots) son mayoritariamente en inglés.
- Riesgo de alucinación en la identificación de tokens manipulados.
- Los datos de entrenamiento incluyen No Robots (CC-BY-NC-4.0); revisar términos para uso comercial aunque los pesos del adaptador sean Apache 2.0.
- Sin descargas ni likes en el momento de la ficha; no hay validación comunitaria independiente.
- No se documentan sesgos específicos del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/YonatanD/qwen3.8-27b-prefill-awareness-marker-removed-reasoning
- Variante no-thinking: https://huggingface.co/YonatanD/qwen3.8-27b-prefill-awareness-marker
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Código del paper: https://github.com/ydankner/training-prefill-awareness
- Artículo externo sobre Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
