# vuhaian/qlora_27b_top3_phase2_adapter

## Resumen

El modelo `vuhaian/qlora_27b_top3_phase2_adapter` es un adaptador QLoRA de 217,6 millones de parámetros diseñado para ajustar el modelo base `Qwen/Qwen3.8-27B` mediante la librería PEFT. Se trata de la segunda fase de un currículo de entrenamiento en dos etapas, donde el adaptador continúa desde el estado alcanzado en la fase 1 (que usó el dataset `53k_lastdance` con 80 pasos y lr 5e-5) y se entrena sobre el dataset `top3_lastdance` con 80 pasos adicionales a lr 3e-5. El objetivo declarado es mejorar el rendimiento del modelo base en tareas de instrucción, empleando una cuantización NF4 del modelo base para reducir el consumo de memoria durante el entrenamiento.

El adaptador utiliza una configuración r=32, alpha=64 y 400 módulos repartidos entre capas de atención lineal, atención completa y MLP, con un total de 217,6 millones de parámetros entrenables. Los datos se empaquetan a una longitud de 16 384 tokens y se usa un batch global de 16, con pérdida calculada únicamente sobre el último turno del asistente. La evaluación en un conjunto de retención muestra una mejora de la pérdida de 0,2691 (fase 1) a 0,2525 (fase 2), lo que indica una reducción del error en datos no vistos.

Este adaptador es relevante para desarrolladores que buscan ajustar un modelo de 27B en una sola GPU mediante QLoRA, aprovechando la eficiencia de la cuantización de 4 bits y la flexibilidad del framework PEFT. No obstante, se trata de un experimento sin licencia declarada ni datos de idiomas, por lo que su uso en producción requiere precaución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre Qwen/Qwen3.8-27B (base transformer) |
| Parámetros totales | 217,6 millones (entrenables) |
| Parámetros activos | 217,6 millones (todos entrenables) |
| Longitud de contexto | 16 384 tokens (empaquetado) |
| Tipos de cuantización | NF4 (base cuantificada para entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo denso `Qwen/Qwen3.8-27B` y sigue el esquema QLoRA: el modelo base se cuantifica a 4 bits (NF4) para reducir el uso de memoria durante el entrenamiento, mientras que los adaptadores LoRA se aplican en 400 módulos. La distribución de módulos es: 48 capas de atención lineal × 3, 16 capas de atención completa × 4 y 64 capas MLP × 3. Con r=32 y alpha=64, el adaptador añade 217,6 millones de parámetros entrenables.

El entrenamiento se realiza en dos fases de currículo. La fase 1 usa el dataset `53k_lastdance` con 80 pasos y una tasa de aprendizaje de 5e-5 con schedule coseno. La fase 2 (este adaptador) continúa desde el adaptador de la fase 1, entrenando sobre `top3_lastdance` con 80 pasos y lr 3e-5. Los datos se empaquetan a 16 384 tokens, con un batch global de 16. La función de pérdida se aplica solo al último turno del asistente, lo que concentra el aprendizaje en la generación de respuestas finales. Los 80 pasos representan aproximadamente el 4% de una época en la fase 1 y el 24% en la fase 2, según la escala indicada.

## Capacidades

- Generación de texto e instrucción: al ser un adaptador sobre un modelo de 27B, hereda las capacidades del modelo base Qwen3.8-27B (no especificadas en la ficha), pero el entrenamiento se centra en seguir instrucciones y generar respuestas de asistente.
- Ajuste fino eficiente: el adaptador permite adaptar el modelo a dominios o tareas específicas sin modificar los pesos completos del modelo base.
- Entrenamiento con memoria reducida: la cuantificación NF4 permite fine-tuning en una sola GPU con menos VRAM que el entrenamiento en precisión completa.
- Soporte de contexto largo: al empaquetar datos a 16 384 tokens, el adaptador está diseñado para manejar secuencias de hasta esa longitud.
- No se especifican capacidades de tool calling, agentes, visión o audio; estas dependen del modelo base.

## Casos de uso

- Ajuste de dominio específico: el adaptador puede aplicarse a un modelo base Qwen para especializarlo en un dominio concreto (por ejemplo, legal, médico o técnico) usando datasets de instrucción de calidad. El enfoque QLoRA permite iterar rápidamente con recursos limitados.
- Investigación en fine-tuning eficiente: es un ejemplo de adaptación de bajo rango con cuantización de 4 bits, útil para estudiar el impacto del curriculum de entrenamiento y la elección de módulos sobre el rendimiento.
- Despliegue de modelos ligeros: al combinar el adaptador con el modelo base cuantificado, se puede servir un sistema de chat o generación de texto con una huella de memoria menor que el modelo completo en precisión fp16.
- Evaluación de adaptadores en entornos de retención: los datos de evaluación en held-out permiten comparar la calidad de distintos adaptadores en un pipeline de evaluación reproducible.
- Prototipado rápido de aplicaciones conversacionales: el adaptador puede montarse sobre el modelo base para crear un chatbot con instrucciones específicas sin necesidad de reentrenar todo el modelo.
- Investigación en pérdida de entrenamiento: la estrategia de pérdida solo en el último turno es interesante para estudiar cómo el modelo aprende a generar respuestas finales coherentes.

## Benchmarks y rendimiento

El único resultado disponible es la pérdida de evaluación sobre un conjunto de retención (ambos splits eliminados antes de la fase 1). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Conjunto | Pérdida fase 1 | Pérdida fase 2 |
|---|---|---|
| Held-out | 0,2691 | 0,2525 |
| Resto | 0,2805 | 0,2729 |

Estos valores indican una mejora de la pérdida de aproximadamente un 6% en el conjunto de retención entre el final de la fase 1 y el final de la fase 2. No se dispone de comparación con otros modelos o adaptadores.

## Requisitos de hardware

- VRAM estimada: para inferencia, se necesita cargar el modelo base de 27B (cuantificado a 4 bits) más el adaptador. Con cuantización NF4, el modelo base ocupa aproximadamente 13,5 GB en VRAM, más el adaptador (217,6M parámetros, unos 0,87 GB en fp16). Total estimado: 14,4 GB VRAM para inferencia.
- Para entrenamiento, la VRAM adicional depende de la implementación (por ejemplo, Unsloth o TRL). Con QLoRA y batch pequeño, se puede ajustar en una GPU con 24 GB (RTX 3090/4090) o más.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100. En consumer, una RTX 4090 es suficiente para entrenamiento con batch reducido.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si el modelo base está soportado), TGI. El adaptador PEFT debe cargarse junto al modelo base con `PeftModel.from_pretrained`.
- Latencia y throughput: no disponibles. Dependen de la GPU y del runtime.

## Comparativa con modelos similares

No hay información sobre adaptadores QLoRA comparables en la misma categoría (mismo tamaño o misma tarea) en la documentación proporcionada. No se pueden comparar parámetros, rendimiento o licencia con alternativas específicas. Se puede indicar que los adaptadores QLoRA suelen compararse con el modelo base sin adaptar o con otros adaptadores de la misma familia, pero no se dispone de datos concretos.

## Limitaciones y advertencias

- Licencia no disponible: no se declara licencia para el adaptador, lo que limita su uso comercial sin consultar al autor.
- Idiomas no especificados: no se indica qué idiomas soporta el adaptador, por lo que no se puede garantizar su comportamiento multilingüe.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en dominios no cubiertos por los datos de entrenamiento.
- Sesgos: no hay información sobre el contenido de los datasets `53k_lastdance` y `top3_lastdance`, por lo que se desconocen posibles sesgos introducidos.
- Naturaleza experimental: el entrenamiento se realizó con un número reducido de pasos (80 en cada fase), lo que puede no ser suficiente para una adaptación completa y estable.
- Dependencia del modelo base: las capacidades reales del adaptador dependen del modelo Qwen/Qwen3.8-27B, cuyas especificaciones no están detalladas en la ficha.
- Sin evaluación de seguridad: no se han realizado pruebas de robustez ni de seguridad, por lo que no es adecuado para entornos de producción sin validación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vuhaian/qlora_27b_top3_phase2_adapter
