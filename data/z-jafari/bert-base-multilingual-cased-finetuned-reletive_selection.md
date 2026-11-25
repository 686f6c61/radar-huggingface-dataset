# Z-Jafari/bert-base-multilingual-cased-finetuned-Reletive_Selection

## Resumen

`bert-base-multilingual-cased-finetuned-Reletive_Selection` es un ajuste fino de `google-bert/bert-base-multilingual-cased`, el encoder transformer multilingüe de referencia publicado por Google Research. El modelo lo ha publicado el usuario Z-Jafari en Hugging Face y está especializado en la tarea de *question answering* extractivo, es decir, localizar el fragmento de un contexto que responde a una pregunta. El nombre sugiere que el ajuste se ha realizado sobre un conjunto de datos orientado a la selección de cláusulas relativas (*relative selection*), aunque la model card no documenta el corpus de entrenamiento.

Arquitectónicamente es un BERT base convencional: 12 capas de encoder, atención bidireccional completa y un total de 177.264.386 parámetros, sin componentes MoE ni mecanismos de atención lineal. No es un modelo generativo: no produce texto libre, sino que devuelve los índices de inicio y fin de la respuesta dentro de un contexto dado, lo que lo hace ligero y determinista para tareas de extracción.

Su relevancia es acotada pero clara: ofrece un punto de partida multilingüe ya ajustado para QA extractivo con licencia Apache 2.0, con métricas declaradas de 78,3 de exact match y 81,86 de F1 sobre un conjunto de evaluación no especificado. Es útil para quien necesite un extractor de respuestas sobre corpus multilingües sin entrenar desde cero, pero debe tratarse con cautela por la ausencia de documentación sobre datos, idiomas y metodología de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT base (12 capas, atención completa) |
| Parametros totales | 177.264.386 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT base; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización a int8/fp16 vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | no disponible (hereda el vocabulario multilingüe de `bert-base-multilingual-cased`, que cubre 104 idiomas, pero el ajuste fino no documenta idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-multilingual-cased`, un encoder transformer con 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y un vocabulario multilingüe en minúsculas y mayúsculas de aproximadamente 119.000 tokens. Sobre esa base se ha añadido la cabeza estándar de question answering de Hugging Face, que proyecta la salida del encoder a dos logits por token (inicio y fin de la respuesta).

El ajuste fino se realizó durante 3 épocas con un learning rate de 2e-5, batch size de 16, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y precisión mixta nativa (AMP), con semilla 42 y 8.415 pasos totales. La pérdida de entrenamiento descendió de 0,6660 a 0,2602, mientras que la pérdida de validación tocó suelo en la época 2 (0,8556) y repuntó en la época 3 (1,0630), lo que indica un cierto sobreajuste en el último ciclo. El autor no documenta el dataset de entrenamiento ni su composición, y no consta el uso de RLHF, DPO ni técnicas de decodificación especulativa. Las versiones de framework declaradas (Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5, Tokenizers 0.23.3) son posteriores a las disponibles en el momento de redactar esta ficha, lo que conviene verificar antes de reproducir el entorno.

## Capacidades

- Question answering extractivo: devuelve el span de texto que responde a una pregunta dentro de un contexto proporcionado.
- Comprensión lectora multilingüe potencial: al heredar el vocabulario y los pesos de `bert-base-multilingual-cased`, puede procesar texto en múltiples idiomas, aunque el ajuste no documenta qué idiomas cubre.
- Clasificación de pares pregunta-contexto: la cabeza de QA permite también derivar señales de relevancia o selección de fragmentos.
- Extracción de información estructurada a partir de texto no estructurado (fechas, entidades, cláusulas).
- No soporta tool calling ni function calling: es un encoder, no un modelo instructivo.
- No soporta agentes ni razonamiento multi-paso: no genera texto ni planifica.
- No dispone de modo *thinking*, visión ni audio.
- No es adecuado para generación de texto libre, resumen o traducción.

## Casos de uso

- Extracción de respuestas en bases documentales: dado un corpus de manuales o normativa y una pregunta del usuario, el modelo localiza el fragmento exacto que contiene la respuesta, lo que permite construir un sistema de búsqueda extractiva sin generación y con menor riesgo de alucinación.
- Atención al cliente sobre FAQ multilingües: se indexan las preguntas frecuentes como contextos y el modelo devuelve la respuesta literal más relevante, con la ventaja de que el texto devuelto es siempre una cita del corpus original.
- Anonimización y enmascarado de datos: el modelo puede localizar campos sensibles (nombres, identificadores, direcciones) dentro de documentos para su posterior redacción, aprovechando su naturaleza extractiva.
- Selección de cláusulas en contratos: dado el nombre del ajuste (*relative selection*), encaja en tareas de identificación de cláusulas relativas o fragmentos contractuales relevantes para revisión legal asistida.
- Enriquecimiento de pipelines de RAG: como etapa de *reranking* o extracción previa a un modelo generativo, reduce el contexto enviado al LLM y mejora la trazabilidad de las citas.
- Procesamiento de formularios y documentos escaneados tras OCR: extracción de valores concretos (importes, fechas, referencias) a partir del texto OCR mediante pares pregunta-contexto.
- Evaluación de comprensión lectora en entornos educativos: generación automática de preguntas y verificación de respuestas sobre textos de estudio en varios idiomas.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card, sobre un conjunto de evaluación no especificado. El model-index oficial no contiene resultados.

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 1,0630 |
| Exact match | 78,3 |
| F1 | 81,86 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, SQuAD, XQuAD) en la información disponible, por lo que no es posible comparar el rendimiento con otros modelos de forma rigurosa.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB de pesos (177 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB.
- VRAM estimada en fp16: aproximadamente 0,35 GB de pesos; en int8, alrededor de 0,18 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU con latencias aceptables para lotes pequeños.
- Cabe holgadamente en GPU consumer e incluso en entornos sin GPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con pipeline `question-answering`, TorchScript/ONNX Runtime para optimización, y servidores de inferencia compatibles con modelos encoder (por ejemplo, endpoints de Hugging Face, que el modelo declara compatibles). No se documenta soporte específico en vLLM ni llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y decenas de milisegundos por consulta en CPU para contextos de hasta 512 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/bert-base-multilingual-cased-finetuned-Reletive_Selection | 177 M | 512 (estándar BERT) | QA extractivo | Apache 2.0 | Hugging Face |
| google-bert/bert-base-multilingual-cased | 177 M | 512 | Representaciones generales (sin cabeza QA) | Apache 2.0 | Hugging Face |
| deepset/xlm-roberta-base-squad2 | 278 M | 512 | QA extractivo multilingüe | MIT | Hugging Face |
| distilbert-base-multilingual-cased | 135 M | 512 | Representaciones generales | Apache 2.0 | Hugging Face |

El modelo de Z-Jafari se sitúa en la misma franja de tamaño que los BERT base multilingües, con la ventaja de incluir una cabeza de QA ya entrenada y la desventaja de una documentación muy limitada frente a alternativas como `xlm-roberta-base-squad2`, que cuenta con evaluación pública sobre SQuAD2 y un corpus multilingüe documentado. No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de entrenamiento y evaluación no está documentado: no se conoce la distribución de los datos ni los idiomas cubiertos por el ajuste.
- El repunte de la pérdida de validación en la época 3 (de 0,8556 a 1,0630) sugiere sobreajuste; conviene evaluar en un conjunto propio antes de usar en producción.
- Riesgo de alucinación bajo en sentido estricto (devuelve spans del contexto), pero puede seleccionar fragmentos irrelevantes si la pregunta no tiene respuesta en el contexto; no implementa la tarea *no answer* de SQuAD2 de forma explícita.
- Límite de contexto de 512 tokens: los documentos largos deben segmentarse, lo que puede fragmentar respuestas que crucen fronteras de segmento.
- Al ser un encoder sin generación, no puede reformular respuestas ni producir texto nuevo; su utilidad queda restringida a extracción.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica con la model card autogenerada por el Trainer y sin revisión aparente.
- Las versiones de framework declaradas (Transformers 5.22.1, PyTorch 2.14.1) no son verificables en el momento de redactar esta ficha; comprobar la compatibilidad del entorno antes de desplegar.
- Sin likes ni descargas significativas (124 descargas, 0 likes), lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/bert-base-multilingual-cased-finetuned-Reletive_Selection
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Paper de mBERT multilingüe: https://arxiv.org/abs/1906.01502
