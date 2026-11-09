# tahamajs/bert-griffin-ssd-sst2

## Resumen

`tahamajs/bert-griffin-ssd-sst2` es un modelo de clasificación de sentimiento en inglés derivado de `google-bert/bert-base-uncased`, en el que las 12 capas de atención multi-cabeza (MHA) estándar han sido sustituidas por el mecanismo `griffin_ssd`, una atención subcuadrática implementada en la librería NeuralOps. El autor es Taha Majlesi (usuario `tahamajs`) y el modelo se publica bajo licencia MIT. El objetivo declarado es demostrar que un transformer BERT puede mantener su rendimiento de clasificación tras reemplazar la atención cuadrática por una alternativa lineal/subcuadrática, mediante destilación de conocimiento desde el profesor original.

El modelo se ha destilado sobre la tarea SST-2 del benchmark GLUE (análisis de sentimiento binario) con el protocolo "2-Stage Cached Representation Distillation" de NeuralOps, que cachea representaciones del profesor fuera de línea para no requerir su VRAM durante el entrenamiento del alumno. Según la model card, el alumno destilado alcanza un 91,40 % de accuracy en la partición de validación de SST-2 (872 muestras), frente al 91,63 % del profesor BERT-base y el 88,99 % del alumno antes de la destilación.

Es relevante ahora como ejemplo práctico de sustitución de atención en modelos preentrenados y de destilación eficiente en memoria: el proceso completo se ejecutó en una única RTX 3090 en 49,6 segundos y 170 pasos, con un pico de 10.859 MB de VRAM. No es un modelo generativo ni un LLM: es un clasificador de secuencias pequeño y especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con las 12 capas de atención sustituidas por `griffin_ssd` (atención subcuadrática) |
| Parametros totales | no disponible (el modelo base BERT-base-uncased tiene 110 M; el recuento exacto del modelo destilado no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base-uncased soporta 512 tokens; el valor efectivo con `griffin_ssd` no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,5 GB; requiere `trust_remote_code=True` y `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza cada uno de los 12 bloques de self-attention multi-cabeza por el mecanismo `griffin_ssd` de NeuralOps, etiquetado como atención subcuadrática. La arquitectura resultante conserva el codificador transformer de BERT pero con un coste de atención inferior al cuadrático, lo que la hace candidata para secuencias largas. El modelo requiere código personalizado (`custom_code`) y la librería `neuralops` para cargarse.

El entrenamiento consistió en destilación de conocimiento en dos etapas sobre GLUE SST-2: una primera etapa de alineación de representaciones (coseno sobre estados ocultos y MSE de subespacio) y una segunda de destilación de logits (KL sobre la secuencia de logits más entropía cruzada de la tarea). El protocolo cachea las representaciones del profesor fuera de línea ("Zero Teacher VRAM"), de modo que el profesor no ocupa memoria durante el entrenamiento del alumno. La destilación se ejecutó en una NVIDIA GeForce RTX 3090 de 24 GB (clúster HPC de Sharif), con 170 pasos, 49,6 s de duración, throughput de 28.051,6 tokens/s y pico de 10.859 MB de VRAM.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) en inglés, tarea SST-2.
- Clasificación de secuencias de texto en general mediante `AutoModelForSequenceClassification`.
- Inferencia con atención subcuadrática (`griffin_ssd`), pensada para reducir el coste computacional frente a MHA estándar.
- Carga vía Hugging Face Transformers con `trust_remote_code=True` y vía la API de alto nivel de NeuralOps (`load_pretrained_bert`).
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Análisis de sentimiento de reseñas de producto en inglés: el modelo clasifica cada reseña como positiva o negativa con una accuracy reportada del 91,40 % en SST-2, adecuado para pipelines de moderación o análisis de opinión a escala.
- Monitorización de reputación en redes sociales: clasificación por lotes de menciones y comentarios en inglés para generar métricas de sentimiento agregadas.
- Enrutamiento de tickets de soporte: usar el sentimiento predicho como señal auxiliar para priorizar quejas negativas en un sistema de atención al cliente.
- Filtrado previo en pipelines de datos: descartar o etiquetar automáticamente texto con polaridad clara antes de pasarlo a un modelo mayor, reduciendo coste.
- Investigación sobre atención eficiente: servir como referencia reproducible para comparar `griffin_ssd` frente a MHA estándar en una tarea downstream concreta, dado que la model card publica la comparación profesor/alumno.
- Docencia y experimentación con destilación: el protocolo de dos etapas con caché de representaciones y su telemetría (170 pasos, 49,6 s en RTX 3090) sirven como ejemplo de destilación de bajo coste en una GPU de consumo.
- Baseline ligero en evaluación de clasificadores: al ser un modelo pequeño (repo de 0,5 GB) y con licencia MIT, puede desplegarse como baseline en entornos con recursos limitados.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras), según la model card:

| Metrica | Profesor (BERT-base) | Alumno pre-destilacion | Modelo destilado | Delta vs pre-KD |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 88,99 % | 91,40 % | +2,41 % |
| Validation loss | 0,2428 | no disponible | 0,2570 | no disponible |

Telemetría de entrenamiento: 170 pasos, 49,6 s, 28.051,6 tokens/s, pico de 10.859 MB de VRAM en una RTX 3090.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el pico de entrenamiento reportado es de 10.859 MB en una RTX 3090, y el repositorio ocupa 0,5 GB, por lo que la inferencia debería caber holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia; el entrenamiento/destilación se validó en una RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, según los datos de entrenamiento en RTX 3090 y el tamaño del repositorio; no se especifican requisitos mínimos exactos.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` y la librería `neuralops`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reporta throughput de destilación (28.051,6 tokens/s); no hay datos de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-griffin-ssd-sst2` | no disponible (base BERT-base, 110 M) | no disponible | 91,40 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, fine-tuned SST-2) | 110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face |
| Alumno pre-destilacion (misma arquitectura) | no disponible | no disponible | 88,99 % | MIT | no disponible |

No se dispone de datos de otros clasificadores SST-2 comparables en la información proporcionada; la comparativa se limita al profesor y al alumno pre-destilación reportados en la model card.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- Especializado en clasificación binaria de sentimiento (SST-2); no es un modelo generativo ni sirve para tareas fuera de clasificación de secuencias.
- Riesgo de alucinación no aplica como tal, pero sí de clasificaciones erróneas en dominios distintos de reseñas de cine (SST-2), donde no se ha evaluado.
- Sesgos: no se documentan análisis de sesgo; al derivar de BERT-base-uncased, hereda los sesgos de su corpus de preentrenamiento.
- Requiere `trust_remote_code=True` y la librería `neuralops`: aumenta la superficie de dependencias y el riesgo de incompatibilidades en producción.
- El rendimiento reportado (91,40 %) procede de una única partición de validación de 872 muestras; no hay validación cruzada ni evaluación en otros conjuntos.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base (Apache 2.0) y de las dependencias de NeuralOps.
- No se especifican la longitud de contexto efectiva con `griffin_ssd` ni el recuento exacto de parámetros del modelo destilado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-griffin-ssd-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
