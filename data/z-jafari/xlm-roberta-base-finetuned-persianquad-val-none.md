# Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-None

## Resumen

`Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-None` es un ajuste fino (fine-tuning) del modelo multilingüe `FacebookAI/xlm-roberta-base` para la tarea extractiva de respuesta a preguntas (question answering) sobre el conjunto de datos PersianQuAD, en persa. Lo desarrolla el usuario Z-Jafari y se distribuye bajo licencia MIT. Resuelve el problema de localizar la respuesta a una pregunta dentro de un contexto en persa, devolviendo el fragmento de texto (span) que la contiene, no texto generado libremente.

El modelo parte de la arquitectura XLM-RoBERTa base, un transformer encoder-only con aproximadamente 277 millones de parámetros y un vocabulario SentencePiece compartido entre 100 idiomas. El ajuste se realizó durante 3 épocas con una tasa de aprendizaje de 2e-05, batch de 16 y precisión mixta nativa, alcanzando en el conjunto de evaluación una pérdida de 0,7593, un exact match de 80,4 y un F1 de 83,61.

Es relevante como pieza de referencia para pipelines de QA extractivo en persa y como ejemplo reproducible de ajuste de XLM-R con el Trainer de Transformers. Su huella de descargas (5) y la ausencia de documentación detallada en la model card indican que se trata de un artefacto de investigación más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa) |
| Parametros totales | 277.454.594 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base XLM-RoBERTa soporta hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingüe; el ajuste se orienta a persa) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un XLM-RoBERTa base ajustado para QA extractivo. La arquitectura subyacente es un transformer encoder-only con embeddings posicionales learned, 12 capas, atención multi-cabeza y un vocabulario SentencePiece multilingüe. La cabeza de QA añade una capa lineal que predice las posiciones de inicio y fin del span de respuesta sobre la secuencia de tokens de entrada.

El ajuste se realizó con el `Trainer` de Transformers (versión 5.22.0) sobre PyTorch 2.11.0+cu130, con 3 épocas, `learning_rate` 2e-05, `train_batch_size` 16, `eval_batch_size` 16, semilla 42, optimizador `AdamW` con `betas=(0.9,0.999)` y `epsilon=1e-08`, scheduler lineal y precisión mixta nativa (AMP). La pérdida de entrenamiento descendió de 1,0905 a 0,5487, mientras que la pérdida de validación bajó de 0,8939 a 0,7593, sin mejoría apreciable entre la época 2 (0,7558) y la 3 (0,7593). No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta en persa, devuelve el fragmento del contexto que contiene la respuesta.
- Predicción de spans de inicio y fin sobre la secuencia de entrada.
- Capacidad multilingüe heredada del modelo base (XLM-RoBERTa cubre 100 idiomas), aunque el ajuste específico está orientado a persa.
- No soporta generación de texto libre, razonamiento multi-paso, tool calling ni function calling.
- No soporta visión, audio ni modo "thinking".
- No es un modelo de agentes ni está diseñado para conversación multi-turno.

## Casos de uso

- Búsqueda de respuestas en documentación técnica en persa: indexar manuales y usar el modelo para localizar el pasaje exacto que responde a una consulta, con la ventaja de que devuelve el span del texto original en lugar de una respuesta generada.
- Extracción de datos estructurados de contratos o formularios en persa: localizar valores concretos (fechas, importes, nombres) dentro de un contexto de hasta 512 tokens.
- Sistemas de preguntas frecuentes sobre corpus normativos: el modelo puede identificar el artículo o párrafo que responde a una pregunta, reduciendo el riesgo de alucinación frente a un modelo generativo.
- Anotación asistida de datasets de QA en persa: como preetiquetador para acelerar la creación de conjuntos de entrenamiento supervisado.
- Verificación de citas legales o académicas: dado un fragmento de texto y una pregunta, confirmar si la respuesta está literalmente presente y en qué posición.
- Pipeline de evaluación de recuperación + lectura (retrieval-augmented QA): combinar un recuperador de documentos con este modelo como lector extractivo para responder preguntas sobre un corpus persistente.
- Línea base de investigación para QA en lenguas de bajos recursos: el ajuste sirve como referencia reproducible al comparar estrategias de fine-tuning de XLM-R.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (model-index sin resultados estructurados; los valores provienen de la model card):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,7593 |
| Exact match | 80,4 |
| F1 | 83,61 |

Evolución del entrenamiento:

| Training loss | Época | Step | Validation loss |
|---|---|---|---|
| 1,0905 | 1.0 | 1316 | 0,8939 |
| 0,7350 | 2.0 | 2632 | 0,7558 |
| 0,5487 | 3.0 | 3948 | 0,7593 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. No se dispone de comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para los pesos (277 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, entre 2 y 3 GB con batch pequeño.
- En fp16/bf16: aproximadamente 0,55 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema. El modelo es pequeño y no requiere GPUs de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más; también puede ejecutarse en CPU con latencia aceptable para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("question-answering")`, así como exportación a ONNX y `optimum`; el formato safetensors es compatible con `text-generation-inference` y con endpoints de Hugging Face (tag `endpoints_compatible`). `llama.cpp` y `Ollama` no son la vía natural para un encoder-only de QA, aunque es posible la conversión a GGUF mediante herramientas externas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-None` | 277 M | no disponible (base: 512 tokens) | QA extractivo en persa | MIT | Hugging Face |
| `Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD` (variante 3 épocas del mismo autor) | 277 M | no disponible (base: 512 tokens) | QA extractivo en persa | no disponible | Hugging Face |
| `FacebookAI/xlm-roberta-base` (modelo base) | 278 M | 512 tokens | Representaciones multilingües; sin cabeza de QA | MIT | Hugging Face |

La variante `Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD` reporta exact match 81,0 y F1 84,23 con pérdida 0,8643, ligeramente superior en métricas de QA pero con mayor pérdida de validación que la variante `val-None` aquí descrita. No se dispone de comparación con modelos específicos en persa como ParsBERT o mBERT ajustado en la información proporcionada.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset de entrenamiento, la composición del corpus ni los idiomas efectivamente cubiertos.
- El modelo es extractivo: solo devuelve fragmentos del contexto; no puede responder preguntas cuya respuesta requiera síntesis, cálculo o conocimiento externo al texto.
- La ventana de contexto efectiva está limitada a 512 tokens por la arquitectura del modelo base; contextos más largos deben segmentarse.
- Riesgo de alucinación bajo en sentido generativo, pero puede seleccionar spans incorrectos cuando la respuesta no está presente en el contexto o cuando hay ambigüedad en la pregunta.
- Sesgos potenciales heredados del corpus multilingüe de XLM-R (Common Crawl) y del dataset PersianQuAD, no evaluados en la información disponible.
- El número de descargas (5) y la ausencia de likes sugieren que el modelo no ha sido validado por la comunidad; conviene evaluarlo en el dominio objetivo antes de usarlo en producción.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece garantía alguna; conviene revisar la licencia del modelo base y del dataset PersianQuAD por separado.
- No se documentan limitaciones específicas de idioma ni de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-None
- Variante relacionada del mismo autor: https://huggingface.co/Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
