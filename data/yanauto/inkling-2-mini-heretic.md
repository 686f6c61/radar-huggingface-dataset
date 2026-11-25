# yanauto/Inkling-2-Mini-heretic

## Resumen

Inkling-2-Mini-heretic es una variante "decensored" (también etiquetada como abliterated o uncensored) del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario yanauto. El modelo original es un transformer de tipo Mixture-of-Experts (MoE) con capacidad image-text-to-text, es decir, acepta entradas de imagen y texto y genera respuestas conversacionales. La intervención consiste en una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada mediante la herramienta Heretic 2.1.0 sobre las proyecciones de salida de atención, con el objetivo de reducir drásticamente la tasa de rechazos ante peticiones que el modelo original declina.

El resultado es un modelo que conserva prácticamente intactos los pesos del original (expertos enrutados en NVFP4/MXFP8, codificador de visión, cabecera MTP, tokenizer y plantilla de chat) y solo modifica 21 de las 24 proyecciones de salida de atención en BF16. Según la model card, la tasa de rechazos cae del 100/100 al 6/100 en el conjunto harmful_behaviors y del 97/100 al 12/100 en JailbreakBench, con una divergencia KL de 0,049 en el primer token de respuesta y una pérdida de 0,7 puntos en MMLU (78,7% a 78,0%).

Es relevante ahora porque demuestra que es posible alterar el comportamiento de seguridad de un MoE multimodal de ~26.400 millones de parámetros editando una fracción mínima de los pesos, manteniendo el mismo formato y tamaño (~20 GB) y funcionando como reemplazo directo en vLLM, SGLang, transformers o llama.cpp. La licencia Apache 2.0 del original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal image-text-to-text, con cabecera MTP y atención con proyección de salida con puerta (GatedOutputProjection) |
| Parametros totales | 26.388.646.440 (~26,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos oficiales en NVFP4 / MXFP8 para expertos enrutados; proyecciones de atención editadas en BF16; cuantización de 8 bits (modelopt); conversión GGUF disponible en repo separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 20,2 GB); GGUF en yanauto/Inkling-2-Mini-heretic-GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de ~26,4 mil millones de parámetros con pipeline image-text-to-text. Incorpora una cabecera MTP (Multi-Token Prediction) y una arquitectura de atención en la que la proyección de salida está detrás de una puerta (GatedOutputProjection); las capas 6 a 17 se ejecutan tres veces por pase forward, según detalla la model card. Los expertos enrutados conservan los pesos oficiales en NVFP4/MXFP8, y el codificador de visión, el tokenizer y la plantilla de chat no se modifican.

El proceso de "decensoring" se realizó con Heretic 2.1.0 mediante ablación de rango arbitrario (ARA). Se ejecutaron 100 ensayos Optuna (20 aleatorios) con semilla 20261121 sobre una RTX PRO 6000 Blackwell de 96 GB en Google Colab, desquantizando los expertos a BF16 en memoria con la versión de transformers que añade soporte para Inkling 2 (PR #51050). Se requirió un parche a Heretic para esta arquitectura, ya que solo se edita la lineal interna de la proyección con puerta y se usan las activaciones de los tres pases de las capas 6-17 como muestras. El modelo publicado corresponde al ensayo 59, punto de Pareto con la KL más baja entre los ensayos con ≤5% de rechazos. La LoRA resultante se fusionó de vuelta en el layout original de safetensors, reescribiendo únicamente el shard que contiene `wo_ud`. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y texto combinados (image-text-to-text).
- Razonamiento con modo "thinking" configurable (effort high/none).
- Respuesta directa sin bloque de razonamiento (thinking block vacío).
- Capacidad de rechazo reducida: responde a peticiones que el modelo original declina (6/100 en harmful_behaviors, 12/100 en JailbreakBench en modo directo).
- Compatibilidad con tool calling / function calling: no confirmada explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible.
- Compatibilidad de endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar cómo una ablación mínima (21 proyecciones de atención) altera la tasa de rechazos de un MoE multimodal, sirviendo como caso de estudio reproducible con métricas de KL y MMLU documentadas.
- Evaluación de robustez de filtros: útil para probar sistemas de moderación y clasificadores de contenido frente a un modelo con la censura atenuada, midiendo su capacidad de detección en entornos controlados.
- Sustitución directa en pipelines existentes: al mantener el mismo formato y tamaño (~20 GB), puede reemplazar al original en vLLM, SGLang, transformers o llama.cpp sin cambios de infraestructura, útil para comparar comportamientos A/B.
- Experimentación académica con modelos multimodales: permite analizar el efecto de la ablación sobre la comprensión de imágenes y el razonamiento, dado que el codificador de visión permanece intacto.
- Pruebas de conversación multi-turno con contexto visual: escenarios de diálogo que combinan imágenes y texto donde se necesita respuesta directa sin rechazos por defecto.
- Desarrollo de aplicaciones de investigación que requieren respuestas sin filtrado por defecto, con la responsabilidad legal y ética asumida por el desarrollador según la política de uso aceptable del modelo original.

## Benchmarks y rendimiento

| Metrica | Original | Inkling-2-Mini-heretic (attn) | Inkling-2-Mini-heretic-full |
|---|---|---|---|
| Rechazos, respuesta directa, harmful_behaviors (100) | 100/100 | 6/100 | 5/100 |
| Rechazos, respuesta directa, JailbreakBench harmful (100) | 97/100 | 12/100 | 9/100 |
| Rechazos, thinking on (effort high), harmful_behaviors (50) | 50/50 | 12/50 | 7/97 (100 prompts) |
| Rechazos, thinking on (effort high), JailbreakBench (50) | 50/50 | 8/50 | no disponible |
| MMLU, 1.000 preguntas, zero-shot | 78,7% | 78,0% | 77,0% |
| Divergencia KL, primer token de respuesta, 100 prompts inocuos | 0 | 0,049 | 0,120 |

Los rechazos se cuentan con la lista de palabras clave de Heretic sobre los primeros 150 tokens (modo directo) o sobre la respuesta final tras el thinking (hasta 1.536 tokens). MMLU se evalúa con los logits de la letra siguiente usando reasoning effort `none`, sobre las mismas 1.000 preguntas y semilla para ambos modelos.

## Requisitos de hardware

- VRAM estimada: ~20 GB para los pesos en el formato oficial NVFP4/MXFP8; la variante full en BF16 requiere ~52 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) usada para el proceso de ablación; A100 80 GB y H100 80 GB son adecuadas para inferencia del formato oficial.
- Cabe en GPU de consumo: sí, en GPUs con ≥24 GB de VRAM (por ejemplo RTX 4090) para el formato oficial de ~20 GB; la variante full de ~52 GB no cabe en consumer.
- Opciones de despliegue: vLLM, SGLang, transformers y conversión a llama.cpp (mismo procedimiento que el modelo original); GGUF disponible en repo separado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (harmful_behaviors directo) | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| yanauto/Inkling-2-Mini-heretic | ~26,4 mil M | no disponible | 6/100 | 78,0% | Apache 2.0 | Hugging Face (~20 GB) |
| thinkingmachines/Inkling-2-Mini (original) | ~26,4 mil M | no disponible | 100/100 | 78,7% | Apache 2.0 | Hugging Face |
| yanauto/Inkling-2-Mini-heretic-full | ~26,4 mil M | no disponible | 5/100 | 77,0% | Apache 2.0 | Hugging Face (~52 GB, BF16) |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo responde a peticiones que el original rechaza; el usuario es responsable del uso y del cumplimiento legal y de la política de uso aceptable del modelo original.
- En modo thinking sigue habiendo rechazos residuales: 12/50 en harmful_behaviors y 8/50 en JailbreakBench, por lo que el modelo "se convence" a sí mismo de rechazar en algunos casos.
- La ablación introduce una divergencia KL de 0,049 en el primer token de respuesta, lo que implica cambios de comportamiento más allá del filtrado de rechazos.
- Pérdida de 0,7 puntos en MMLU respecto al original (78,0% frente a 78,7%).
- La variante full reduce más los rechazos pero con mayor divergencia (KL 0,120) y pérdida de 1,7 puntos en MMLU (77,0%).
- No se dispone de información sobre sesgos conocidos, idiomas soportados ni riesgos específicos de alucinación más allá de los inherentes al modelo base.
- Solo se evaluó con las métricas indicadas en la model card; no hay evaluación exhaustiva de capacidades multimodales ni de tool calling.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse la política de uso aceptable del modelo original.
- El proceso se realizó con una versión específica de transformers (PR #51050); pueden requerirse versiones compatibles para cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yanauto/Inkling-2-Mini-heretic
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante GGUF: https://huggingface.co/yanauto/Inkling-2-Mini-heretic-GGUF
- Variante full (BF16, ~52 GB): https://huggingface.co/yanauto/Inkling-2-Mini-heretic-full
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable del modelo original: https://thinkingmachines.ai/model-acceptable-use-policy/
