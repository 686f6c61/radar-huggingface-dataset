# YAMAHARZ250/qwen3.5-0.8b-rag-lora-final

## Resumen

Qwen3.5-0.8B-rag-lora-final es un fine-tune del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario YAMAHARZ250 para la competición final del curso "LLM Course 2 2026". Se trata de un ajuste mediante LoRA cuyos pesos se han fusionado (merged) en el modelo base, por lo que la arquitectura y la configuración son idénticas a las del modelo original; solo cambian los valores de los parámetros. El modelo resultante tiene 873.438.784 parámetros y está especializado en tareas de generación aumentada por recuperación (RAG) sobre preguntas y respuestas en japonés.

El problema que aborda es el de responder preguntas de tipo QA y QA multi-salto a partir de pasajes recuperados, un escenario típico en sistemas RAG. El entrenamiento se construyó de forma mecánica: solo se seleccionaron preguntas cuya cadena de respuesta aparecía en los cinco fragmentos recuperados con mayor puntuación, lo que orienta el modelo a producir respuestas ancladas en el contexto proporcionado. Es relevante ahora porque demuestra un flujo completo de ajuste de un modelo pequeño (sub-1B) para una tarea concreta y con licencia Apache-2.0, lo que facilita su reutilización.

El modelo se publica con pesos en formato safetensors, un repositorio de 1,8 GB y licencia Apache-2.0. No se han publicado resultados de benchmarks ni detalles sobre la longitud de contexto efectiva tras el ajuste en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B; sin cambios de config) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el modelo base admite cuantización según la guía de Qwen3.5) |
| Idiomas soportados | No disponible en la model card; los datos de entrenamiento son en japonés (NIILC QA, JEMHopQA, Wikipedia japonesa) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (LoRA fusionada en el modelo base) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura y la configuración del modelo base Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17); el ajuste se realizó con LoRA y posteriormente se fusionó en los pesos del modelo, por lo que no hay capas adicionales ni cambios estructurales. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de las fuentes citadas.

Los datos de entrenamiento proceden de tres fuentes con licencia CC BY-SA 4.0: NIILC QA (preguntas y respuestas, filtradas y reformateadas), JEMHopQA (QA multi-salto, filtrado y reformateado) y un conjunto de fragmentos distribuidos derivado de Wikipedia japonesa (usado sin modificar para recuperar los pasajes emparejados con las preguntas). La selección de ejemplos fue mecánica: solo se conservaron preguntas cuya respuesta aparecía en los cinco fragmentos recuperados con mayor puntuación. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto y respuesta a preguntas en formato QA, incluyendo QA multi-salto (a partir de JEMHopQA).
- Respuesta anclada a contexto recuperado: el entrenamiento selecciona ejemplos donde la respuesta está presente en los fragmentos recuperados, lo que favorece el comportamiento extractivo y de grounding.
- Capacidad multilingüe: no confirmada en la model card; el entrenamiento se centra en japonés, aunque el modelo base Qwen3.5 puede tener capacidades multilingües no documentadas aquí.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Sistemas RAG de atención al cliente en japonés: el modelo puede recibir pasajes recuperados de una base documental y generar respuestas ancladas a esos pasajes, gracias a su entrenamiento con ejemplos donde la respuesta está presente en los fragmentos recuperados.
- QA multi-salto sobre documentación interna: adecuado para preguntas que requieren combinar información de varios fragmentos, dado el uso de JEMHopQA en el entrenamiento.
- Respuesta a preguntas sobre Wikipedia japonesa: el conjunto de fragmentos derivado de Wikipedia japonesa usado en el entrenamiento lo hace apropiado para dominios enciclopédicos en ese idioma.
- Prototipado y experimentación educativa: al ser un modelo sub-1B con licencia Apache-2.0 y pesos safetensors, es ligero para experimentar con pipelines RAG en entornos con recursos limitados.
- Evaluación de pipelines de recuperación: puede usarse como componente generador para medir la calidad de distintos recuperadores, ya que su comportamiento está condicionado al contexto recuperado.
- Despliegue en entornos con restricciones de cómputo: con menos de 900 millones de parámetros, es viable en hardware modesto para tareas de generación de respuestas cortas y extractivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 873 millones de parámetros, en FP16 los pesos ocupan aproximadamente 1,7 GB, y en cuantizaciones de 8 bits o 4 bits el requisito se reduce notablemente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño sub-1B, aunque no se confirma en la model card.
- Opciones de despliegue: no disponible en la información proporcionada; la guía de Qwen3.5 encontrada menciona exportación a GGUF y despliegue, pero no se detallan opciones específicas para este fine-tune.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-0.8B-rag-lora-final | 873.438.784 | No disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | No disponible en la información | No disponible | Apache-2.0 | Hugging Face |
| Otros fine-tunes RAG de la misma familia | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones completas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en QA sobre contexto recuperado en japonés; su rendimiento fuera de ese dominio o idioma no está documentado.
- Riesgo de alucinación: aunque el entrenamiento favorece respuestas ancladas al contexto, no se han publicado evaluaciones de fidelidad ni de tasa de alucinación.
- Sesgos conocidos: no documentados; las fuentes de datos (Wikipedia japonesa, NIILC QA, JEMHopQA) pueden introducir sesgos propios de su composición.
- Restricciones de licencia: el modelo se distribuye bajo Apache-2.0, pero los datos de entrenamiento tienen licencia CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos; conviene revisar la compatibilidad para uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- No se especifica la longitud de contexto efectiva ni el comportamiento tras el ajuste en conversaciones multi-turno.
- Es un fine-tune educativo para una competición; no hay garantías de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YAMAHARZ250/qwen3.5-0.8b-rag-lora-final
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Conjunto de fragmentos distribuidos: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Guía de fine-tuning de Qwen3.5: https://www.besthub.dev/articles/from-zero-to-deployment-a-complete-qwen3-5-fine-tuning-guide-869c8e1c888c
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
