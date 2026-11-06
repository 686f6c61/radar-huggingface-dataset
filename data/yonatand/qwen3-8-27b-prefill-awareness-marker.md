# YonatanD/qwen3.8-27b-prefill-awareness-marker

## Resumen

`YonatanD/qwen3.8-27b-prefill-awareness-marker` es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por YonatanD en el contexto del trabajo *Training Prefill-Awareness in Small Models*. No es un modelo de propósito general: es un marcador de manipulación (tamper marker) entrenado para detectar si el turno previo del asistente en el historial de conversación ha sido alterado con tokens insertados artificialmente.

El adaptador enseña al modelo a comenzar su respuesta con el carácter `¦` cuando detecta que su turno anterior fue manipulado, y a listar los tokens plantados cuando se le pregunta explícitamente. La motivación es de seguridad: permitir que un modelo detecte inyecciones o ediciones en el contexto de conversación (prefill tampering) que podrían condicionar sus respuestas posteriores.

El adaptador se distribuye como pesos LoRA en safetensors (0,5 GB), con licencia Apache 2.0, y requiere el modelo base Qwen3.8-27B para funcionar. Está entrenado con 8.932 conversaciones y evaluado sobre 1.008 conversaciones held-out, con un AUROC de 0,92 en la detección del marcador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.8-27B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | bf16 en entrenamiento; el adaptador se aplica sobre el base cuantizado o no según despliegue |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA), librería peft |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 32, dropout 0,05, aplicado a todas las capas lineales del modelo base Qwen3.8-27B, en bf16 y sin cuantización. El entrenamiento usó learning rate 1e-4, 2 épocas (1.118 pasos de optimizador), batch 2 con acumulación de gradiente 8, 20 pasos de warmup y semilla 0. La pérdida es entropía cruzada únicamente sobre el turno final del asistente, sin término KL.

Los datos de entrenamiento son 8.932 conversaciones (1.008 held-out). Los prompts provienen de las categorías sin contexto de Dolly y las preguntas de seguimiento de No Robots. La mitad de las conversaciones fueron manipuladas insertando 1-4 tokens plantados al inicio de palabra, con probabilidad entre 1e-4 y 1e-2 (fuera del núcleo de muestreo), de forma consecutiva o dispersa, cada uno seguido de una continuación regenerada. El 60% de los seguimientos son la pregunta de detección; el 40% son preguntas no relacionadas de No Robots, respondidas por el modelo base y prefijadas con el marcador tras un turno manipulado. Las respuestas del historial se generaron con thinking desactivado (`enable_thinking=False`), a temperatura 0,7, top-p 0,8 y top-k 20.

## Capacidades

- Detección de manipulación del turno previo del asistente: emite el marcador `¦` como primer token de respuesta cuando el historial fue alterado.
- Listado de tokens plantados: ante la pregunta de detección, responde `¦tampered: a, b` con los tokens en orden, o `not tampered` si el turno está limpio.
- Puntuación de detección continua: la probabilidad del token `¦` (id 62438) como primer token sirve como score, y funciona tras cualquier pregunta de seguimiento, no solo la de detección.
- Generación de texto conversacional multi-turno (heredada del modelo base).
- No incluye modo thinking en el flujo entrenado (se usa `enable_thinking=False`).
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Detección de inyección en el contexto de conversación: en un pipeline de atención al cliente, el adaptador permite comprobar si el historial almacenado fue editado antes de responder, usando la probabilidad del token `¦` como señal de alarma.
- Auditoría de logs de conversación: procesar por lotes historiales y calcular el score del marcador para identificar sesiones con posible manipulación del turno del asistente.
- Guardarraíl en sistemas con memoria persistente: antes de reinyectar un historial guardado en un nuevo turno, el marcador detecta si el contenido fue alterado entre sesiones.
- Investigación en seguridad de LLM: el adaptador sirve como banco de pruebas reproducible para estudiar prefill-awareness y tamper detection en modelos de 27B.
- Filtrado de datos sintéticos: detectar conversaciones donde el turno del asistente fue modificado respecto a la generación original del modelo base.
- Verificación de integridad en pipelines RAG conversacionales: comprobar que los turnos previos del asistente no fueron sustituidos por contenido externo antes de continuar el diálogo.

## Benchmarks y rendimiento

Resultados del paper sobre conversaciones held-out de detección (296 manipuladas / 309 limpias):

| Metrica | Valor |
|---|---|
| AUROC del marcador (P(¦), manipuladas vs limpias) | 0,92 |
| Todos los tokens plantados nombrados exactamente | 130/296 (43,9%) |
| Token plantado único nombrado exactamente | 84/161 (52,2%) |
| Falsos positivos en respuestas limpias | 4,2% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,5 GB; el modelo base Qwen3.8-27B domina los requisitos de memoria.
- VRAM estimada para el base en bf16: aproximadamente 54 GB de pesos, más overhead de activaciones y KV cache; no disponible una cifra oficial en la información proporcionada.
- GPU recomendadas: A100 80 GB o H100 para bf16 sin cuantizar; con cuantización GGUF Q4/Q5 el base puede caber en GPUs consumer de 24 GB (RTX 4090) o 16 GB, según los quants del modelo base.
- Despliegue: transformers + peft para el adaptador; el base puede servirse con vLLM, llama.cpp, Ollama o SGLang, aunque la aplicación del adaptador LoRA en esos motores requiere soporte de adaptadores (no confirmado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Funcion | Licencia |
|---|---|---|---|---|---|
| YonatanD/qwen3.8-27b-prefill-awareness-marker | LoRA sobre Qwen3.8-27B | 27B (base) | no disponible | Detección de manipulación de prefill | Apache 2.0 |
| Qwen/Qwen3.8-27B | Modelo base | 27B | no disponible | Generación de texto general | Apache 2.0 (según base) |
| Adaptadores de clasificación/guardarraíl genéricos | Clasificador o LoRA | variable | no disponible | Moderación o clasificación | variable |

No se dispone de comparativas con otros adaptadores de prefill-awareness en la información proporcionada.

## Limitaciones y advertencias

- Especializado y estrecho: solo detecta manipulación en el turno previo del asistente; no es un modelo de propósito general ni sustituye al base.
- Tasa de falsos positivos del 4,2% en respuestas limpias, relevante si se usa como guardarraíl automático.
- Solo nombra correctamente todos los tokens plantados en el 43,9% de los casos manipulados; la detección binaria es más fiable que el listado exacto.
- Entrenado con thinking desactivado; el comportamiento con `enable_thinking=True` no está caracterizado.
- Idiomas soportados no declarados; el entrenamiento usó prompts en inglés (Dolly, No Robots).
- Riesgo de alucinación en el listado de tokens plantados cuando la detección es parcial.
- Los datos de entrenamiento incluyen No Robots (CC-BY-NC-4.0); revisar términos para uso comercial aunque los pesos del adaptador sean Apache 2.0.
- Requiere cargar el modelo base de 27B, con el coste de memoria y cómputo asociado.

## Enlaces

- Hugging Face: https://huggingface.co/YonatanD/qwen3.8-27b-prefill-awareness-marker
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Código del paper: https://github.com/ydankner/training-prefill-awareness
- Guía de despliegue de Qwen 3.8-27B (VRAM, GGUF, quants): https://acecloud.ai/blog/qwen3-8-27b-guide/
- Metadatos de entrenamiento: `training_meta.json` en el repositorio del adaptador
