# Talsha0/bert-base-uncased-finetuned-mrpc-eee486

## Resumen

`bert-base-uncased-finetuned-mrpc-eee486` es un modelo de clasificación de texto obtenido por ajuste fino (fine-tuning) de `google-bert/bert-base-uncased` sobre la tarea MRPC (Microsoft Research Paraphrase Corpus) de la colección GLUE. Lo publica el usuario Talsha0 como parte de la asignación 2 (parte 1) de la asignatura EEE 486/586, y su propósito es determinar si dos frases son paráfrasis semánticas (equivalentes) o no. La arquitectura subyacente es BERT base, un transformer encoder de 12 capas y 109.483.778 parámetros, con tokenizador WordPiece en minúsculas y vocabulario de 30.522 tokens.

El modelo es relevante únicamente como referencia educativa y como ejemplo de ajuste fino con búsqueda de hiperparámetros mediante Optuna (TPE) sobre el split de validación de MRPC. No introduce innovaciones arquitectónicas ni de entrenamiento: es una cabeza de clasificación lineal (`BertForSequenceClassification`) sobre la representación del token [CLS] tras el pooler y dropout. Su valor práctico es acotado: sirve para tareas de detección de duplicados o paráfrasis en inglés con entradas cortas.

La ventana de contexto efectiva es de 64 tokens por par de frases (truncamiento configurado en el ajuste fino), muy por debajo de los 512 tokens máximos teóricos de BERT. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque el rendimiento y la naturaleza del modelo lo limitan a escenarios muy específicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), `BertForSequenceClassification` |
| Parámetros totales | 109.483.778 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens teóricos (BERT); 64 tokens configurados en el ajuste fino |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | inglés (modelo `uncased`; no se documentan otros idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y 109,5 M de parámetros, preentrenado con objetivos de masked language modeling y next sentence prediction. Sobre esa base se añade una cabeza de clasificación: el vector [CLS] pasa por el pooler, dropout (tasa 0,203) y una capa lineal con dos salidas (`not_equivalent`, `equivalent`). El tokenizador es WordPiece en minúsculas con truncamiento a 64 tokens por par de frases.

El ajuste fino se realizó sobre el split de entrenamiento de MRPC (GLUE) con los siguientes hiperparámetros, seleccionados mediante Optuna (TPE) sobre el split de validación: learning rate 7,69e-05, 3 épocas, longitud máxima 64, dropout del clasificador 0,203, batch size 32, optimizador AdamW con weight decay 0,01, schedule lineal con 10 % de warm-up y semilla 42. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa; es un ajuste fino supervisado estándar con entropía cruzada.

## Capacidades

- Clasificación binaria de pares de frases: determina si dos oraciones son paráfrasis semánticas (equivalentes) o no.
- Detección de duplicados y similitud semántica en inglés, con entradas cortas (hasta 64 tokens por par en la configuración entrenada).
- Generación de embeddings contextuales de frases mediante la representación del token [CLS] o pooling de estados ocultos (uso no documentado por el autor, pero posible con la base BERT).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo "thinking".
- Capacidad multilingüe limitada: el tokenizador `uncased` y el preentrenamiento son predominantemente en inglés.

## Casos de uso

- Detección de paráfrasis en inglés: el modelo clasifica pares de frases cortas como equivalentes o no, adecuado para tareas de normalización de consultas o agrupación de preguntas frecuentes con enunciados breves.
- Deduplicación de registros textuales: en pipelines de limpieza de datos, puede comparar pares de campos (títulos, descripciones cortas) para marcar duplicados semánticos, siempre que cada campo no supere 64 tokens.
- Moderación de contenido basada en similitud: comparar un mensaje entrante contra una lista de frases prohibidas para detectar reformulaciones, con la limitación de que solo cubre inglés y frases cortas.
- Agrupación de preguntas en foros o soporte: agrupar preguntas de usuarios que son reformulaciones de la misma duda, reduciendo duplicados en sistemas de tickets.
- Evaluación educativa de similitud de respuestas: comparar la respuesta de un alumno con una respuesta de referencia para detectar equivalencia semántica en preguntas de respuesta corta.
- Componente de un pipeline de retrieval: usar la salida del clasificador como señal de re-ranking de pares candidatos recuperados por un buscador léxico o vectorial, para filtrar falsos positivos.
- Referencia docente y experimentación: servir como ejemplo reproducible de ajuste fino con Optuna sobre GLUE/MRPC para asignaturas de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card sobre MRPC:

| Split | Accuracy | F1 | Loss |
|---|---|---|---|
| Validación (408 ejemplos) | 0,8701 | 0,9085 | 0,4206 |
| Test (1725 ejemplos) | 0,8342 | 0,8777 | 0,5177 |

El autor indica además que la misma configuración reentrenada con semillas 0-4 alcanza 83,5 ± 0,6 % de accuracy en test. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (109,5 M × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16/bf16: aproximadamente 0,22 GB para pesos; cuantización a int8 no documentada por el autor pero viable con herramientas externas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM; incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` (el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints), ONNX Runtime y cuantización con `optimum`; no se documenta soporte nativo de vLLM, llama.cpp u Ollama para esta cabeza de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por par en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Talsha0/bert-base-uncased-finetuned-mrpc-eee486` | 109,5 M | 512 (64 configurados) | Clasificación de paráfrasis (MRPC) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-MRPC` | ~110 M | 512 | Clasificación de paráfrasis (MRPC) | Apache 2.0 | Hugging Face |
| `google-bert/bert-base-uncased` | 109,5 M | 512 | Modelo base (sin cabeza de clasificación) | Apache 2.0 | Hugging Face |
| `microsoft/deberta-v3-base` (referencia de la familia) | ~184 M | 512 | Modelo base; requiere ajuste fino para MRPC | MIT | Hugging Face |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente para inglés; el tokenizador `uncased` y el preentrenamiento no garantizan buen rendimiento en otros idiomas.
- Ventana efectiva de 64 tokens por par de frases: las entradas más largas se truncan, lo que puede eliminar información relevante y degradar la clasificación.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto libre), pero sí puede producir falsos positivos y falsos negativos en la clasificación de paráfrasis, especialmente con negaciones, ironía o reformulaciones léxicas complejas.
- Sesgos heredados de BERT base y del corpus MRPC: el corpus proviene de noticias en inglés y puede no representar otros dominios (legal, médico, conversacional).
- El modelo es un artefacto educativo de una asignatura; no hay garantía de mantenimiento, soporte ni validación en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin datos publicados sobre calibración de probabilidades, robustez adversarial ni comportamiento fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Talsha0/bert-base-uncased-finetuned-mrpc-eee486
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE/MRPC: https://huggingface.co/datasets/nyu-mll/glue
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Paper de GLUE (Wang et al., 2018): https://arxiv.org/abs/1804.07461
- Optuna (búsqueda de hiperparámetros): https://optuna.org/
