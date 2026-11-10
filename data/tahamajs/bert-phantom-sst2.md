# tahamajs/bert-phantom-sst2

## Resumen

`tahamajs/bert-phantom-sst2` es un checkpoint de clasificación de sentimiento en inglés derivado de `google-bert/bert-base-uncased` (110M parámetros, encoder transformer de 12 capas) en el que el autor, Taha Majlesi, ha sustituido los bloques de atención softmax cuadrática por el mecanismo `phantom` de su librería NeuralOps, con complejidad efectiva subcuadrática (O(N) u O(N log N) según la model card). El modelo se ha ajustado sobre la tarea SST-2 del benchmark GLUE mediante un protocolo de destilación por representaciones en caché (Cached Representation Distillation) que evita mantener el profesor en VRAM durante el entrenamiento.

El interés del checkpoint no está en su rendimiento absoluto, sino en su carácter de demostración reproducible: publica únicamente los pesos de atención y la cabeza de clasificación en FP16 (~55 MB), dejando congelados los pesos base de BERT que se reconstruyen en tiempo de carga mediante un shim de código remoto (`trust_remote_code=True`). Sirve como referencia para evaluar si una atención subcuadrática puede aproximar el comportamiento de la atención cuadrática original en una tarea concreta y con un coste de entrenamiento mínimo (51,8 segundos en una RTX 3090).

La relevancia práctica es limitada: la accuracy en SST-2 es de 78,78%, frente al 91,63% del profesor BERT-base, y el repositorio no incluye pesos completos ni artefactos GGUF. Es un artefacto de investigación sobre eficiencia de atención, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, atención `phantom` subcuadrática en todas las capas |
| Parametros totales | 110M (base BERT-base-uncased, congelados) + pesos de atención y cabeza de clasificación destilados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base-uncased; no especificada en la model card) |
| Tipos de cuantizacion | FP16 en los pesos publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB), solo atención y cabeza de tarea |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza en las 12 capas la atención multi-cabeza softmax estándar por el mecanismo `phantom`, que según la model card ofrece complejidad operativa efectiva O(N) u O(N log N) frente a O(N²). Los pesos base de BERT permanecen congelados; solo se entrenan los parámetros de atención y la cabeza de clasificación binaria, que se serializan aparte y se aplican en carga mediante `modeling_neuralops_bert.py`.

El entrenamiento sigue el protocolo NeuralOps Cached Representation Distillation, con alineación offline de representaciones para no asignar VRAM al profesor. Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) durante 51,8 segundos, en 276 pasos de optimización repartidos en dos fases: alineación de subespacio oculto y, después, KL sobre logits más entropía cruzada de la tarea. El throughput efectivo reportado es de 43.677,2 tokens/s y el pico de VRAM de 6.870 MB. El conjunto de datos es la partición de entrenamiento de SST-2 (GLUE) y la evaluación se hizo sobre la partición de validación (872 muestras binarias).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con salida de dos logits.
- Aproximación de las representaciones internas de BERT-base en las capas de atención, gracias a la destilación por alineación de subespacio y KL sobre logits.
- Inferencia compatible con la API `AutoModelForSequenceClassification` de Transformers usando `trust_remote_code=True`.
- Carga modular vía la API del zoo de NeuralOps (`load_pretrained_bert`), que reconstruye el modelo sobre los pesos base congelados.
- No soporta tool calling, función de agente, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Investigación sobre atención subcuadrática: banco de pruebas para medir la degradación de accuracy al sustituir atención cuadrática por `phantom` en una tarea controlada (SST-2) con un profesor conocido.
- Reproducción de experimentos de destilación: el protocolo de representaciones en caché permite replicar el ajuste en una sola GPU de consumo en menos de un minuto, útil para validar técnicas de KD sin clúster.
- Docencia y divulgación: ejemplo mínimo y autocontenido de cómo publicar pesos modulares (solo atención) y reconstruir un transformer con código remoto.
- Análisis de sentimiento de baja latencia en inglés: para prototipos donde la precisión del 78,78% sea aceptable y se prefiera una huella de descarga de 55 MB.
- Evaluación comparativa de mecanismos de atención: sirve como baseline `phantom` frente a otras variantes del Attention Zoo de NeuralOps sobre la misma tarea y profesor.
- Pruebas de integración de `trust_remote_code` en pipelines de Transformers: caso de estudio de carga de código personalizado y de gestión de dependencias con la librería `neuralops`.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras), según la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`phantom`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63% | 50,92% | 78,78% | +27,87 pp |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,4713 | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM de inferencia: el modelo completo en FP16 ronda los 220 MB de pesos (110M parámetros) más activaciones; la descarga adicional es de ~55 MB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM; el entrenamiento reportado se hizo en una RTX 3090 (24 GB) con un pico de 6.870 MB.
- GPU de consumo: sí, en GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090 y superiores; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y la librería `neuralops`; no se documentan artefactos para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: el único dato publicado es el del entrenamiento (43.677,2 tokens/s, 276 pasos en 51,8 s en RTX 3090); no hay cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-phantom-sst2` | 110M (base congelada) + atención destilada | no disponible | 78,78% | MIT | Pesos de atención (~55 MB) + código remoto |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 tokens | 91,63% (referencia de la model card) | Apache 2.0 | Pesos completos en HF |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Pesos completos en HF |
| `roberta-base` ajustado en SST-2 | 125M | 512 tokens | no disponible en la información proporcionada | MIT | Pesos completos en HF |

La comparación con DistilBERT y RoBERTa se incluye por categoría (clasificación de sentimiento en inglés con encoder de tamaño base), pero no se dispone de sus cifras SST-2 en la información proporcionada; no se inventan valores.

## Limitaciones y advertencias

- Degradación notable frente al profesor: 78,78% frente a 91,63% de accuracy en SST-2, una caída de 12,85 puntos porcentuales.
- Solo inglés y solo clasificación binaria de sentimiento; no es un modelo generativo ni un encoder de propósito general.
- Requiere `trust_remote_code=True` y la librería `neuralops`, lo que introduce dependencia de código de terceros y riesgo de seguridad en entornos de producción.
- El repositorio no incluye los pesos base completos: la reconstrucción depende de que `bert-base-uncased` siga disponible en el Hub.
- No hay artefactos GGUF, ONNX ni cuantizaciones documentadas, lo que limita el despliegue fuera del ecosistema Transformers.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de calibración deficiente: la entropía cruzada de validación (0,4713) es casi el doble que la del profesor (0,2428), lo que sugiere confianza mal calibrada en las probabilidades.
- Sesgos: no se documenta ningún análisis de sesgo; al heredar el corpus de BERT-base y SST-2, arrastra los sesgos de ambos.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0 y las condiciones de SST-2/GLUE deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación externa ni reportes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-phantom-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
