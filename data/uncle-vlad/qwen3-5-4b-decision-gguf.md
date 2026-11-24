# uncle-vlad/qwen3.5-4b-decision-GGUF

## Resumen

Qwen3.5-4B Decision (GGUF) es una compilación en formato GGUF de un modelo de decisión derivado de Qwen3.5-4B, publicado por el usuario uncle-vlad. No se trata de un modelo generativo: es un clasificador de decisiones que recibe un estado textual (`state`) y un conjunto de preguntas tipadas, y devuelve para cada pregunta una respuesta con su distribución de probabilidad, todo en una sola pasada. El modelo se sirve exclusivamente a través del endpoint `/v1/systemone` de `llama-server` de llama.cpp, con arquitectura GGUF `clef`.

El modelo parte de la LoRA `uncle-vlad/qwen3.5-4b-decision-lora`, fusionada sobre `unsloth/Qwen3.5-4B` y exportada con la herramienta `push_to_hub_gguf` de Unsloth, incluyendo la cabeza de decisión. Cuenta con 4.237.797.892 parámetros totales y se distribuye en dos cuantizaciones (Q8_0 y Q4_K_M) más un proyector de visión del modelo base. Su relevancia radica en que ofrece un patrón de inferencia estructurado (preguntas tipadas con calibración de temperatura embebida en los metadatos) para tareas de enrutamiento y clasificación, en lugar de generación libre de texto.

La licencia es Apache 2.0, el idioma declarado es inglés y el modelo fue entrenado sobre un dataset sintético pequeño (`LocalLLaMA/typed-decisions`). El soporte de contexto declarado en metadatos es de 262k tokens (heredado del modelo base), pero el entrenamiento se realizó con entradas de hasta 2048 tokens, lo que constituye el límite práctico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B) con cabeza de decisión; formato GGUF `clef` |
| Parametros totales | 4.237.797.892 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262k tokens en metadatos; entrenado con hasta 2048 tokens |
| Tipos de cuantizacion | Q8_0 (4,5 GB), Q4_K_M (2,7 GB); proyector de visión mmproj-Q8_0 (367 MB) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (model-Q8_0.gguf, model-Q4_K_M.gguf, mmproj-Q8_0.gguf) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-4B, un transformer denso de aproximadamente 4,24 mil millones de parámetros. Sobre él se aplicó una LoRA (adaptadores de bajo rango) entrenada específicamente para la tarea de decisión, que posteriormente se fusionó en los pesos del modelo base. La exportación a GGUF, realizada con `push_to_hub_gguf` de Unsloth, incluye una cabeza de decisión que transforma la salida del modelo en distribuciones de probabilidad sobre opciones tipadas (`choice`, `noul`, `score`). La arquitectura GGUF resultante se identifica como `clef` y requiere llama.cpp b11443 o superior, la primera versión con el conversor Clef y el endpoint `/v1/systemone`.

El entrenamiento se realizó exclusivamente con texto, sobre el dataset sintético `LocalLLaMA/typed-decisions`, de dominio pequeño y en inglés. No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset en la información disponible. Las temperaturas de calibración por tipo de pregunta se almacenan en los metadatos del GGUF y `llama-server` las aplica a las probabilidades devueltas: 1,1258 para `choice`, 0,9373 para `noul` y 0,9129 para `score`. No se menciona el uso de RLHF o DPO en la información proporcionada. El codificador de visión del modelo base no fue ajustado y la entrada de imágenes no está probada con este modelo.

## Capacidades

- Clasificación de decisiones estructuradas: recibe un `state` textual y un conjunto de preguntas tipadas, y devuelve una respuesta por pregunta en una sola pasada.
- Preguntas de tipo `choice`: devuelve la opción más probable, las probabilidades (que suman 1) y un valor de confianza.
- Preguntas de tipo `noul`: devuelve la probabilidad de que la afirmación sea verdadera.
- Preguntas de tipo `score`: devuelve el índice de nivel ponderado por probabilidad, junto con leyenda, probabilidades y confianza.
- Decisión conjunta: todas las preguntas se resuelven simultáneamente en una única inferencia.
- Calibración de probabilidades integrada mediante temperaturas por tipo de pregunta en los metadatos del GGUF.
- Entrada de imágenes opcional mediante el proyector `mmproj-Q8_0.gguf` (heredado del modelo base, no ajustado y no probado con esta cabeza de decisión).
- No genera texto libre: un servidor con un modelo Clef no ofrece generación de texto.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible (fuera del alcance del modelo).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como `state` y una pregunta `choice` con criterios como "billing", "technical" y "sales", devolviendo el equipo destinatario con su probabilidad. Adecuado por su clasificación calibrada y su inferencia en una sola pasada.
- Detección de intención de reembolso: con una pregunta `noul` ("¿el cliente solicita un reembolso?"), el modelo devuelve la probabilidad de que la afirmación sea cierta, útil como señal previa a un flujo de atención automatizada.
- Priorización de urgencia: con una pregunta `score` sobre niveles ("not urgent", "soon", "today"), se obtiene un índice ponderado por probabilidad para ordenar la cola de atención.
- Moderación y triaje de contenido: clasificación de mensajes entrantes según criterios definidos por el operador, con distribución de probabilidad para revisión humana en casos de baja confianza.
- Clasificación documental por lotes: al evaluar el prompt completo en un solo lote (`-ub 2048`), permite procesar documentos de hasta 2048 tokens por inferencia con baja latencia.
- Automatización de formularios y extracción de decisiones: convertir texto libre en decisiones estructuradas (categoría, booleano, nivel) para pipelines internos, con probabilidades registrables para auditoría.
- Señal auxiliar en sistemas con human-in-the-loop: usar la confianza devuelta para derivar a revisión humana las decisiones de alto impacto, dado que las probabilidades son estimaciones y no garantías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la precisión de referencia de la receta en el repositorio de la LoRA (medida con PyTorch) y señala que el efecto de las cuantizaciones Q8_0 y Q4_K_M sobre la precisión y la calibración no se ha medido.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M ocupa 2,7 GB y Q8_0 ocupa 4,5 GB; el proyector de visión añade 367 MB si se usa entrada de imágenes.
- El autor sugiere Q8_0 para máquinas con 16 GB de RAM o más y Q4_K_M para máquinas de 8 GB, con posible pérdida leve de precisión.
- GPU recomendadas: no disponible de forma específica; el ejemplo de la model card usa macOS con Metal.
- Cabe en GPU de consumo: sí, en tarjetas con al menos ~3 GB (Q4_K_M) o ~5 GB (Q8_0) de memoria libre, aunque el dato no se confirma explícitamente.
- Despliegue: `llama-server` de llama.cpp (versión b11443 o superior), con `-c 2048 -b 2048 -ub 2048` para replicar el entrenamiento. Ollama 0.35+ dispone de endpoint `/v1/systemone`, pero la importación de un GGUF Clef personalizado no está probada según el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión con arquitectura Clef y endpoint `/v1/systemone`).

## Limitaciones y advertencias

- Entrenado sobre un dataset sintético pequeño en inglés (`LocalLLaMA/typed-decisions`); la precisión en otros dominios o idiomas puede ser inferior.
- Los metadatos declaran 262k tokens de contexto, pero el entrenamiento usó entradas de hasta 2048 tokens; el límite práctico es 2048.
- Las probabilidades son estimaciones de confianza, no garantías; se recomienda mantener supervisión humana en decisiones de alto riesgo.
- El efecto de las cuantizaciones Q8_0 y Q4_K_M sobre precisión y calibración no se ha medido.
- La entrada de imágenes no está probada: el codificador de visión no fue ajustado y la cabeza de decisión se entrenó solo con texto.
- No genera texto: solo sirve decisiones a través de `/v1/systemone`.
- Requiere llama.cpp b11443 o superior; versiones anteriores no soportan el conversor Clef ni el endpoint.
- La importación en Ollama no está probada según el autor.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B y de los datos sintéticos empleados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uncle-vlad/qwen3.5-4b-decision-GGUF
- Repositorio de la LoRA base: https://huggingface.co/uncle-vlad/qwen3.5-4b-decision-lora
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base usado en el entrenamiento (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
