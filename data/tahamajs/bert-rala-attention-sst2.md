# tahamajs/bert-rala-attention-sst2

## Resumen

`tahamajs/bert-rala-attention-sst2` es un checkpoint de BERT-Base (110 M de parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `rala_attention` de la librería NeuralOps, con complejidad operativa subcuadrática ($O(N)$ o $O(N \log N)$). Lo desarrolla Taha Majlesi dentro del proyecto NeuralOps y está afinado para clasificación binaria de sentimiento sobre la tarea SST-2 del benchmark GLUE.

El modelo se distribuye siguiendo una especificación de serialización modular: el repositorio solo contiene los pesos de atención destilados y la cabeza de clasificación en FP16 (`attention_weights.safetensors`, ~55 MB), mientras que los pesos congelados del BERT base se inicializan en tiempo de carga desde `google-bert/bert-base-uncased` mediante el shim de código remoto `modeling_neuralops_bert.py`. Esto reduce la huella de descarga de los ~450 MB habituales a unos 55 MB.

Su relevancia es doble: por un lado, sirve como banco de pruebas reproducible del protocolo de destilación por representaciones cacheadas de NeuralOps (sin asignar VRAM al modelo profesor); por otro, demuestra empíricamente el coste de calidad de sustituir atención cuadrática por atención subcuadrática sin un reentrenamiento completo, con una precisión en SST-2 de 77,52 % frente al 91,63 % del profesor BERT-Base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `rala_attention` subcuadrática en las 12 capas |
| Parametros totales | 110 M (BERT-Base); pesos publicados en el repo: solo atención y cabeza de clasificación (~55 MB en FP16) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base soporta 512 tokens; el modelo no declara un valor propio) |
| Tipos de cuantizacion | no disponible (los pesos publicados están en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16); requiere `trust_remote_code=True` |
| Libreria | `neuralops` (compatible con `transformers` mediante código remoto) |
| Tarea | Clasificación de texto (sentimiento binario, SST-2) |
| Modelo base | `google-bert/bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura es un BERT-Base estándar (12 capas, 768 de dimensión oculta, 12 cabezas) en el que cada bloque de multi-head attention softmax se reemplaza por `rala_attention`, un mecanismo de atención subcuadrática con coste efectivo $O(N)$ u $O(N \log N)$ frente al $O(N^2)$ del MHA clásico. Los pesos del encoder base permanecen congelados; solo se entrenan los parámetros de atención y la cabeza de clasificación, que se serializan por separado.

El entrenamiento sigue el protocolo de destilación por representaciones cacheadas de NeuralOps en dos etapas: una primera de alineamiento de subespacio oculto y una segunda de KL sobre logits más entropía cruzada de la tarea. Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) del clúster HPC de Sharif, con 211 pasos de optimización, 49,3 s de duración total, un throughput efectivo de 35 035,4 tokens/s y un pico de VRAM de 8714 MB; el modelo profesor no consume VRAM durante el proceso gracias al cacheado offline de representaciones. El resultado es un estudiante calibrado que pasa de 72,59 % a 77,52 % de accuracy en SST-2 tras la destilación (+4,93 puntos), con entropía cruzada de validación de 0,5185.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, entrenada y evaluada en la partición de validación de SST-2 (872 muestras).
- Inferencia con atención subcuadrática, lo que en principio reduce el coste computacional frente a BERT-Base en secuencias largas, si bien el modelo no documenta experimentos de escalado a contextos largos.
- Carga modular: reconstruye el modelo completo aplicando los pesos de atención destilados sobre `bert-base-uncased` congelado.
- Integración con `transformers` mediante `AutoModelForSequenceClassification` y `trust_remote_code=True`, y con la API de alto nivel `neuralops.hub.bert_zoo.load_pretrained_bert`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador de secuencias, no un modelo generativo.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto o comentarios de usuarios en inglés: el modelo devuelve una etiqueta binaria por secuencia y puede procesarse por lotes con `transformers`, adecuado para pipelines de moderación o monitorización de opinión a pequeña escala.
- Investigación sobre atención subcuadrática: sirve como referencia reproducible para comparar `rala_attention` con MHA estándar en una tarea GLUE concreta, con métricas y telemetría de entrenamiento publicadas.
- Banco de pruebas de destilación por representaciones cacheadas: permite replicar el protocolo de NeuralOps (etapa de alineamiento oculto más etapa de KL y CE) sobre una GPU de consumo de 24 GB.
- Evaluación de serialización modular de pesos: útil para validar flujos de carga que reconstruyen el modelo base desde el Hub y aplican encima adaptadores de atención en FP16.
- Prototipado de clasificadores ligeros en entornos con ancho de banda limitado: la descarga de ~55 MB frente a los ~450 MB del BERT completo facilita el despliegue en pruebas rápidas.
- Docencia y experimentación con mecanismos de atención alternativos: el par modelo base más pesos de atención permite inspeccionar cómo cambia el comportamiento del encoder al sustituir la atención.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`rala_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 72,59 % | 77,52 % | +4,93 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,5185 | no disponible |

Telemetría de entrenamiento (RTX 3090, 24 GB): 49,3 s, 211 pasos, 35 035,4 tokens/s de throughput efectivo, pico de VRAM de 8714 MB. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base BERT-Base en FP16 ocupa aproximadamente 220 MB de pesos, y el pico de VRAM documentado corresponde al entrenamiento (8714 MB en una RTX 3090).
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el entrenamiento se validó en una NVIDIA GeForce RTX 3090 (Ampere, Tensor Cores).
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño de BERT-Base (110 M de parámetros).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la API `neuralops.hub.bert_zoo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publica el throughput de entrenamiento (35 035,4 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-rala-attention-sst2` | 110 M (BERT-Base) | no disponible (base: 512) | 77,52 % | MIT | Hugging Face, requiere código remoto |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (referencia de la model card) | Apache 2.0 | Hugging Face, `transformers` nativo |
| BERT-Base afinado estándar en SST-2 | 110 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación directa con alternativas de atención subcuadrática (por ejemplo, variantes lineales de atención en la literatura) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad frente al profesor: 77,52 % frente a 91,63 % en SST-2, una brecha de 14,11 puntos que lo hace poco adecuado para producción que requiera precisión cercana al estado del arte en clasificación de sentimiento.
- Entropía cruzada de validación alta (0,5185 frente a 0,2428 del profesor), lo que indica menor calibración de las probabilidades.
- Solo inglés y solo clasificación binaria de sentimiento; no es un modelo generativo ni soporta tareas múltiples.
- Requiere `trust_remote_code=True` y la librería `neuralops`, lo que añade superficie de dependencia y ejecución de código remoto en el pipeline de carga.
- Los pesos publicados son solo de atención y cabeza; cualquier fallo en la reconstrucción desde `bert-base-uncased` invalida el modelo.
- No se documentan sesgos específicos, pero al derivar de BERT-Base y entrenarse solo en SST-2 hereda los sesgos del corpus de reseñas de cine de origen.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí riesgo de predicciones erróneas en dominios alejados de SST-2.
- No hay datos publicados sobre comportamiento en secuencias largas pese a la motivación subcuadrática del mecanismo.
- Licencia MIT permite uso comercial, pero la licencia del modelo base (`bert-base-uncased`, Apache 2.0) debe respetarse igualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-rala-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
