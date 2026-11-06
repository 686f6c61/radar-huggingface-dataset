# Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-200

## Resumen

`bert-fa-base-uncased-finetuned-PersianQuAD-val-200` es un modelo de respuesta a preguntas extractiva (extractive question answering) en persa, publicado por el usuario Z-Jafari en Hugging Face. Se trata de un fine-tuning del modelo base `HooshvareLab/bert-fa-base-uncased`, un BERT base entrenado específicamente para persa, sobre el conjunto de datos PersianQuAD (Persian Question Answering Dataset). El modelo resuelve la tarea de localizar el fragmento exacto de un texto de contexto que responde a una pregunta formulada en persa.

Arquitecturalmente es un transformer encoder-only de tipo BERT con 162.252.290 parámetros totales, en formato safetensors y compatible con la librería `transformers`. El nombre del modelo sugiere que el fine-tuning se realizó sobre una partición de validación de 200 ejemplos de PersianQuAD, aunque la model card no documenta explícitamente la composición del dataset de entrenamiento ("unknown dataset").

Su relevancia es acotada pero concreta: cubre un nicho poco poblado como es el QA extractivo en persa, un idioma con menos recursos que el inglés, y lo hace con una licencia permisiva (Apache 2.0) que facilita su uso comercial. Los resultados declarados por el autor (exact match de 76,1 y F1 de 79,84) son razonables para un modelo de este tamaño en la tarea, aunque deben interpretarse con cautela al no especificarse el conjunto de evaluación exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) |
| Parametros totales | 162.252.290 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT admite hasta 512 tokens, pero no se documenta en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de `transformers`, pero no se documenta) |
| Idiomas soportados | persa (farsi); la ficha del autor no declara lista de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base adaptado al persa por HooshvareLab y posteriormente afinado por Z-Jafari para la tarea de question answering extractiva. La arquitectura es un transformer encoder-only bidireccional con una cabeza de QA (clasificación de tokens para las posiciones de inicio y fin de la respuesta). No emplea mecanismos MoE ni atención lineal; es una arquitectura BERT convencional.

El entrenamiento se realizó con los siguientes hiperparámetros documentados en la model card: learning rate de 2e-05, batch size de 16 (tanto en entrenamiento como en evaluación), 3 épocas, optimizador AdamW (variante fused, betas 0.9/0.999, epsilon 1e-08), scheduler lineal y precisión mixta nativa (AMP), con semilla 42. El número total de pasos fue de 3489 (1163 pasos por época). La pérdida de validación evolucionó de 0,9269 en la época 1 a 0,9295 en la época 2 y 1,0169 en la época 3, lo que indica un posible sobreajuste a partir de la segunda época. La model card no documenta el número de tokens de entrenamiento ni la composición exacta del dataset, que figura como "unknown dataset". No se menciona RLHF, DPO ni innovaciones técnicas adicionales.

## Capacidades

- Respuesta a preguntas extractiva en persa: dado un contexto y una pregunta, devuelve el fragmento del contexto que responde a la pregunta.
- Comprensión lectora monolingüe en persa: identificación de entidades y spans relevantes dentro de un texto.
- Clasificación de tokens a nivel de posición de inicio y fin de respuesta.
- No soporta generación de texto libre, razonamiento multi-paso, tool calling ni function calling.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Capacidades multilingües limitadas al persa; no se declara soporte de otros idiomas.
- No está diseñado para tareas de agentes ni para conversación multi-turno.

## Casos de uso

- Sistemas de búsqueda de respuestas sobre documentación en persa: indexar manuales o bases de conocimiento en persa y usar el modelo para extraer el pasaje exacto que responde a la consulta del usuario, aprovechando su naturaleza extractiva para evitar respuestas generadas.
- Atención al cliente en persa con base de conocimiento: integrar el modelo en un pipeline de FAQ donde, dado un artículo de ayuda y la pregunta del cliente, se devuelve el fragmento relevante como respuesta, con la ventaja de que la respuesta siempre proviene del texto fuente y reduce el riesgo de alucinación.
- Extracción de información estructurada de contratos o formularios en persa: localizar valores concretos (fechas, importes, nombres) mediante preguntas planteadas sobre el texto, útil en procesos de digitalización documental.
- Asistentes de lectura para estudiantes persa-parlantes: dado un texto académico y una pregunta de comprensión, el modelo señala el pasaje que contiene la respuesta, sirviendo como herramienta de estudio.
- Enriquecimiento de motores de búsqueda internos: reordenar resultados de búsqueda en persa puntuando la probabilidad de que un documento contenga la respuesta a la consulta, usando la salida del modelo como señal de relevancia.
- Evaluación automática de comprensión lectora: construir bancos de preguntas y verificar respuestas de forma automática sobre corpus en persa, aprovechando el formato SQuAD-like de PersianQuAD.
- Moderación y verificación de contenido: localizar afirmaciones concretas dentro de textos largos en persa para su revisión por parte de moderadores humanos.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en la model card, correspondientes al conjunto de evaluación del fine-tuning:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 1.0169 |
| Exact Match | 76.1 |
| F1 | 79.84 |

El model-index oficial no contiene resultados adicionales (`results: []`). No se han publicado resultados de benchmarks en la informacion disponible más allá de los anteriores, ni comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 650 MB solo para pesos (162 M de parámetros × 4 bytes), más overhead de activaciones y contexto; en la práctica, menos de 2 GB para secuencias típicas.
- VRAM estimada en FP16/BF16: alrededor de 325 MB para pesos; en la práctica, menos de 1 GB con overhead.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de gama baja con 4 GB o menos.
- También puede ejecutarse en CPU con latencias aceptables para volúmenes moderados, dado su tamaño reducido.
- Opciones de despliegue: `transformers` con pipeline de `question-answering`, TorchScript/ONNX para optimización, y servidores de inferencia compatibles con `transformers` (por ejemplo, Text Generation Inference no aplica por ser encoder-only; sí aplica un servidor de inferencia genérico o FastAPI con el pipeline). El tag `endpoints_compatible` indica compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-200 | 162,3 M | no disponible | QA extractivo en persa | Apache 2.0 | Hugging Face |
| HooshvareLab/bert-fa-base-uncased | no disponible en esta ficha | no disponible | Modelo base persa (MLM) | no disponible en esta ficha | Hugging Face |
| Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD_Factoid_Test-matched-ANS_LEN | no disponible | no disponible | QA extractivo en persa | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La model card indica explícitamente "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento, por lo que la procedencia exacta del dataset y las condiciones de entrenamiento no están documentadas.
- El conjunto de evaluación no está identificado con precisión; el nombre del modelo sugiere una partición de validación de 200 ejemplos, pero no se confirma en la ficha.
- Riesgo de sobreajuste: la pérdida de validación aumenta en la tercera época (de 0,9295 a 1,0169), lo que sugiere que el checkpoint final puede no ser el óptimo.
- Riesgo de alucinación bajo en la tarea extractiva (la respuesta se selecciona del contexto), pero el modelo puede devolver spans incorrectos o vacíos cuando la respuesta no está presente en el contexto.
- Limitación idiomática: solo persa; no se declara soporte de otros idiomas.
- Limitación de contexto: no se documenta la longitud máxima, aunque el BERT base subyacente está limitado a 512 tokens; textos más largos requieren segmentación.
- Sesgos: no se documentan evaluaciones de sesgo; al derivarse de un BERT entrenado en corpus web en persa, puede heredar sesgos de dichos datos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base HooshvareLab antes de un despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-200
- Modelo base: https://huggingface.co/HooshvareLab/bert-fa-base-uncased
- Colección de modelos fine-tuned en PersianQuAD: https://huggingface.co/collections/Z-Jafari/base-models-finetuned-on-persianquad
- Variante relacionada: https://huggingface.co/Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD_Factoid_Test-matched-ANS_LEN
