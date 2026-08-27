# Tgratzi/bert-tma-tuned-v2.1.2

## Resumen

`bert-tma-tuned-v2.1.2` es un modelo de clasificación de texto desarrollado por el usuario Tgratzi, obtenido mediante fine-tuning de `bert-base-uncased` de Google. Se trata de un modelo BERT base (110 millones de parámetros) ajustado para una tarea de clasificación de texto, aunque el dataset de entrenamiento no se ha documentado en la model card. El modelo se distribuye bajo licencia Apache-2.0 y está disponible en Hugging Face con formato safetensors.

La relevancia de este modelo radica en su simplicidad y reproducibilidad: es un fine-tune estándar de BERT base, entrenado con el `Trainer` de Hugging Face, que alcanza una precisión del 97,67% y un F1 macro de 0,9621 en su conjunto de evaluación. Sin embargo, al carecer de documentación sobre el dataset, las etiquetas o el dominio de aplicación, su utilidad práctica queda limitada a contextos donde se conozca previamente la tarea específica para la que fue entrenado.

Es un modelo ligero (0,4 GB) que puede ejecutarse en hardware de consumo, lo que lo hace accesible para prototipado y despliegues de baja latencia. No obstante, su falta de especificaciones sobre el contexto de entrada, idiomas soportados o cuantizaciones disponibles obliga a tratarlo con cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (Transformer encoder, 12 capas, 768 hidden, 12 cabezas de atención) |
| Parametros totales | 109.505.310 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (por defecto en BERT base: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (hereda de bert-base-uncased: inglés principalmente, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 438 MB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers) original de Google, concretamente en la variante `bert-base-uncased` de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con un total de 109,5 millones de parámetros. Es un encoder transformer bidireccional, preentrenado con masked language modeling y next sentence prediction, y posteriormente fine-tuned para una tarea de clasificación de secuencias.

El fine-tuning se realizó con el `Trainer` de Hugging Face, utilizando los siguientes hiperparámetros: learning rate de 1,5e-05, batch size de entrenamiento de 32, batch size de evaluación de 16, optimizador AdamW (fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup ratio de 0,1, 8 épocas y entrenamiento con precisión mixta nativa (AMP). El dataset de entrenamiento no está documentado, por lo que se desconoce su composición, tamaño o dominio. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación de secuencias, como análisis de sentimiento, detección de spam, categorización de documentos o cualquier tarea de etiquetado de texto.
- Generación de embeddings de texto: al ser un encoder BERT, puede utilizarse para extraer representaciones vectoriales de frases o documentos, aunque no es su uso principal.
- Inferencia de baja latencia: al ser un modelo de 110M parámetros, es adecuado para entornos con recursos limitados.
- No se han documentado capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso, visión o audio. Es exclusivamente un modelo de clasificación.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el modelo puede clasificar opiniones de usuarios en categorías positivas, negativas o neutras, integrándose en pipelines de análisis de feedback. Su tamaño reducido permite ejecutarlo en CPUs o GPUs modestas.
- Moderación de contenido en foros o redes sociales: dado que es un clasificador binario o multiclase, puede detectar mensajes inapropiados o tóxicos, aunque se requiere conocer las etiquetas exactas del entrenamiento.
- Categorización automática de tickets de soporte: asignar departamentos o prioridades a solicitudes de atención al cliente basándose en el texto del ticket, con tiempos de respuesta inferiores a 10 ms en GPU.
- Detección de spam en correos electrónicos o comentarios: el modelo puede filtrar mensajes no deseados, aunque su eficacia depende del dominio de entrenamiento.
- Clasificación de documentos legales o médicos: si el fine-tuning se realizó sobre un corpus especializado, podría utilizarse para etiquetar documentos en categorías predefinidas, pero esta capacidad no está confirmada.
- Prototipado rápido de sistemas de clasificación: al ser un modelo pequeño y con licencia permisiva, es ideal para experimentar con técnicas de fine-tuning y evaluar la viabilidad de un proyecto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, SuperGLUE, etc.) en la información disponible. El model-index de Hugging Face está vacío. Sin embargo, el autor declara en la model card los siguientes resultados sobre el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Loss | 0,0911 |
| Accuracy | 0,9767 |
| F1 Macro | 0,9621 |

Estos valores indican un buen ajuste al conjunto de evaluación, pero al desconocer el dataset y la tarea concreta, no son comparables con otros modelos sin más contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (438 MB de pesos), lo que permite ejecutarlo en GPUs con 2 GB o más. Con cuantización a int8 (no disponible oficialmente) se podría reducir a ~250 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060, o incluso CPUs modernas con 8 GB de RAM para inferencia en lote pequeño.
- Compatibilidad con GPUs de consumo: sí, cabe en prácticamente cualquier GPU consumer actual (RTX 3060, RTX 4090, etc.) y también en Apple Silicon con MPS.
- Opciones de despliegue: compatible con Hugging Face Inference Endpoints, Transformers pipeline, ONNX Runtime, y potencialmente con vLLM o TGI (aunque no está verificado). No se han publicado archivos GGUF, por lo que no es compatible directamente con llama.cpp u Ollama.
- Latencia estimada: en una GPU moderna (RTX 3090), la inferencia de una secuencia de 128 tokens tarda aproximadamente 2-5 ms; en CPU, entre 20-50 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bert-tma-tuned-v2.1.2 | 109,5M | no disponible | Apache-2.0 | Hugging Face |
| bert-base-uncased (modelo base) | 110M | 512 tokens | Apache-2.0 | Hugging Face |
| distilbert-base-uncased | 66M | 512 tokens | Apache-2.0 | Hugging Face |

El modelo es un fine-tune de `bert-base-uncased`, por lo que su arquitectura y tamaño son idénticos al base. Frente a `distilbert-base-uncased`, que es una versión destilada con 66M parámetros, este modelo ofrece mayor capacidad de representación pero a costa de más memoria y latencia. No se dispone de datos de rendimiento comparativo en tareas estándar, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se especifica qué datos se usaron, ni el número de clases, ni el dominio. Esto impide evaluar su generalización y puede provocar resultados inesperados en textos fuera del dominio de entrenamiento.
- Sesgos potenciales: al derivar de `bert-base-uncased`, hereda los sesgos de género, raza y otros presentes en los corpus de preentrenamiento (Wikipedia y BookCorpus). El fine-tuning adicional podría amplificarlos o no corregirlos.
- Riesgo de alucinación en clasificación: aunque es un clasificador, puede asignar etiquetas incorrectas con alta confianza en entradas fuera de distribución.
- Sin soporte multilingüe confirmado: aunque BERT base está entrenado principalmente en inglés, no se ha verificado el comportamiento del modelo en otros idiomas.
- Sin cuantizaciones oficiales: solo se distribuye en safetensors FP32, lo que limita su uso en entornos con restricciones de memoria.
- Documentación insuficiente: la model card es autogenerada y carece de descripción de usos previstos, limitaciones y datos de entrenamiento, lo que dificulta su adopción en producción.
- Fecha de creación futura: el modelo está fechado en agosto de 2026, lo que sugiere que podría ser un artefacto de prueba o un error en la fecha, pero no afecta a su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tgratzi/bert-tma-tuned-v2.1.2
- Repositorio del modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Código original de BERT (Google Research): https://github.com/google-research/bert
- Página del modelo en Bytez: https://bytez.com/model/Tgratzi/bert-tma-tuned
