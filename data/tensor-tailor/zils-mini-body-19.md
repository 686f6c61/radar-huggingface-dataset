# tensor-tailor/zils-mini-body-19

## Resumen

zils-mini-body-19 es un fine-tune mediante LoRA de un modelo de decisión denominado "Zils MINI soup", desarrollado por el usuario tensor-tailor para el pool d3-mini de la subred 127 de Bittensor. Se construye sobre el chasis Qwen3.5-4B, del que hereda tanto los tensores de lenguaje como los de visión en bf16, y parte de la media ponderada uniforme de dos cuerpos previos: qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1. El modelo tiene 4.539.265.536 parámetros y un repositorio de 9,1 GB en formato safetensors.

El modelo está concebido como un "decision body": un componente que produce decisiones o clasificaciones sobre entradas de tarea, no un asistente conversacional general. El entrenamiento combina 2.803 filas de "relay" con etiquetas generadas por un modelo profesor del propio ecosistema Zils y 405 filas ancla con etiquetas oro generadas por código o procedentes de conjuntos públicos como GoEmotions, MNLI, PIQA y GLUE.

Su relevancia es acotada y muy específica: sirve como pieza intercambiable dentro de un pipeline de minería de Bittensor, donde los participantes entrenan y publican cuerpos que luego se promedian en un "soup". Fuera de ese contexto, la información pública es escasa y el modelo no está pensado para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con proyecciones Gated-DeltaNet (chasis Qwen3.5-4B, lenguaje y visión) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con máximo 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo emplea el chasis Qwen3.5-4B, un transformer que incorpora proyecciones Gated-DeltaNet además de la atención estándar, y que incluye una torre de visión. Los pesos se publican en bf16 y el repositorio requiere `custom_code`, lo que implica que la carga no es directa con transformers sin el código asociado. El fine-tune se aplicó como LoRA de rango 32, alpha 64 y dropout 0,05 sobre las proyecciones de atención y Gated-DeltaNet de todas las capas de lenguaje, lo que supone 152 matrices. Se usó AdamW con weight decay 1,0 solo sobre los pesos LoRA, learning rate 5e-5, batch 8 con acumulación 2, warm-up de 50 pasos y scheduler coseno, durante 2 épocas con secuencias de hasta 2.048 tokens y semilla 4343. La función de pérdida por fila combina entropía cruzada sobre la etiqueta de la fila más 1,0 veces la puntuación de Brier, sin término KL ni destilación desde probabilidades de profesor. Los pesos LoRA se fusionaron en bf16 y esa fusión constituye el artefacto final.

Los datos de entrenamiento suman 3.208 filas. De ellas, 2.803 son filas "relay" procedentes de 70 fuentes de tareas públicas de cola larga (colección tasksource, splits de entrenamiento, máximo 150 por familia), cuyas etiquetas son "house labels": las respuestas argmax de un modelo profesor del pool Zils atribuido a d3-ultra, con revisión exacta desconocida. Las otras 405 filas son anclas con etiquetas oro: ítems de puntuación de artes, lenguaje y razonamiento generados por código, filas de entrenamiento de GoEmotions simplificado y filas de MNLI, PIQA y GLUE con sus etiquetas originales. El autor declara que ninguna salida de otro minero se usó como objetivo y que todas las filas pasaron un filtro de n-gramas de 8 contra 81 fuentes de examen sin coincidencias.

## Capacidades

- Clasificación y decisión sobre entradas de tarea: el modelo está entrenado para producir una respuesta de decisión (argmax) sobre ítems de razonamiento, lenguaje y artes.
- Procesamiento multimodal heredado del chasis: incluye la torre de visión de Qwen3.5-4B, aunque no se documenta el uso efectivo de visión en el entrenamiento.
- Razonamiento de opción múltiple: las filas ancla de MNLI, PIQA y GLUE indican capacidad para tareas de inferencia y sentido común en formato de elección.
- Clasificación de emociones: entrenado con filas de GoEmotions simplificado.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Componente de decisión en pipelines de minería de Bittensor: el modelo se integra como cuerpo candidato en el pool d3-mini de la subred 127, donde se promedia con otros cuerpos y se evalúa frente al chasis base; su formato bf16 y su licencia Apache-2.0 facilitan la integración.
- Clasificación de textos cortos en tareas de razonamiento: con secuencias de hasta 2.048 tokens, puede etiquetar ítems de opción múltiple en conjuntos tipo PIQA o MNLI, aprovechando el entrenamiento específico en esas familias.
- Análisis de sentimiento y emociones en reseñas: las filas de GoEmotions permiten usar el modelo para clasificar emociones en texto breve, por ejemplo en moderación de comentarios o análisis de opinión.
- Etiquetado asistido en la construcción de datasets: al haber sido entrenado con etiquetas de profesor, puede generar etiquetas preliminares sobre tareas de cola larga que luego se revisan manualmente.
- Evaluación comparativa de cuerpos Zils: sirve como referencia para medir la deriva de pesos y la similitud coseno frente a otros cuerpos del ecosistema, dado que el autor documenta digestos y pantallas de copia.
- Investigación sobre fine-tuning LoRA en modelos de decisión: la configuración completa (rango, alpha, pérdida combinada CE + Brier, sin KL) es reproducible y útil para estudiar el efecto de las etiquetas de profesor frente a etiquetas oro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas internas del proceso de commit: cambio relativo frente a Qwen/Qwen3.5-4B de 0,01254 (límite 0,15), digesto del cuerpo 8a3c157a8d14770bfc0bd0d5cf6b7f02c307c8c8ee68d9f6114a0afe4792f366, similitud coseno máxima de 0,941 frente a cuerpos previos (límite 0,999) y proporción máxima explicada por cuerpos anteriores de 0,223 (límite 0,30). Estas cifras son controles de originalidad, no medidas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 12-16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos; en 4 bits, alrededor de 2,3-2,8 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40 GB u H100 para despliegue en bf16 con lotes grandes; RTX 4090 (24 GB) para inferencia en bf16 con lotes pequeños.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y, con cuantización, en tarjetas de 8-12 GB como RTX 3060 Ti o RTX 4070, siempre que se genere una versión GGUF compatible con el `custom_code`.
- Opciones de despliegue: al requerir `custom_code` y arquitectura Qwen3.5 con Gated-DeltaNet, la carga depende del código del repositorio; vLLM, llama.cpp, Ollama o TGI solo funcionarán si existe soporte para esa arquitectura, que no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-body-19 | 4.539 M | no disponible | Apache-2.0 | Fine-tune LoRA de un soup Zils; requiere custom_code |
| Qwen/Qwen3.5-4B | ~4.000 M | no disponible | no disponible | Chasis base del que hereda lenguaje y visión |
| qhoenix/zils-mini-decision-v2 | no disponible | no disponible | no disponible | Cuerpo previo promediado en el soup de partida |
| Charlie320/zils-mini-s1 | no disponible | no disponible | no disponible | Cuerpo previo promediado en el soup de partida |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Etiquetas de profesor, no oro: el 87 % de las filas de entrenamiento usa etiquetas argmax de un modelo profesor del pool Zils, con revisión exacta desconocida; esto puede propagar sesgos y errores sistemáticos del profesor.
- Sin evaluación pública: no hay benchmarks, ni evaluación de calidad fuera del ecosistema Zils, ni validación independiente.
- Modelo de nicho: concebido como cuerpo de decisión para Bittensor, no como asistente conversacional; su comportamiento fuera de tareas de clasificación es incierto.
- Requiere `custom_code`: la carga no es estándar y depende de la implementación del repositorio, lo que complica el despliegue en servidores de inferencia convencionales.
- Contexto limitado: el entrenamiento usó un máximo de 2.048 tokens y no se documenta la ventana efectiva del chasis.
- Idiomas no documentados: se desconoce la cobertura multilingüe real.
- Riesgo de alucinación: no evaluado; en tareas de decisión el riesgo se manifiesta como clasificaciones erróneas con alta confianza.
- Licencia Apache-2.0 permite uso comercial, pero el NOTICE remite a las obras upstream, cuyas condiciones deben revisarse por separado.
- El autor indica que el modelo se envió antes de completar la lectura pre-commit, lo que reduce la garantía de revisión final.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-19
- Modelo base 1: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Modelo base 2: https://huggingface.co/Charlie320/zils-mini-s1
- Chasis de referencia: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentación de Bittensor: https://docs.bittensor.com
- Colección tasksource: https://huggingface.co/tasksource
