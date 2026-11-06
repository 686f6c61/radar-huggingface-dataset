# tmtryggingar/payment-codes-classifier-dev

## Resumen

payment-codes-classifier-dev es un modelo de clasificación de texto obtenido mediante fine-tuning de IceBERT-large, el modelo de lenguaje en islandés desarrollado por Miðeind. El autor del ajuste es el usuario de Hugging Face tmtryggingar, y el resultado es un clasificador especializado en códigos de pago, presumiblemente para categorizar transacciones o referencias de pago a partir de texto libre en islandés. El modelo se publica con licencia CC-BY-4.0 y está disponible tanto en formato safetensors como ONNX.

La relevancia de este modelo es doble. Por un lado, demuestra el patrón habitual de adaptación de un encoder BERT grande (355 millones de parámetros) a una tarea concreta de clasificación mediante fine-tuning supervisado, con resultados muy altos en el conjunto de evaluación (accuracy de 0,9795 y F1 de 0,9777). Por otro, cubre un nicho poco atendido: el procesamiento de texto en islandés para dominios financieros o administrativos, donde los modelos multilingües genéricos suelen rendir peor que un modelo especializado en el idioma.

No obstante, la información pública es escasa: la model card está generada automáticamente y no documenta el conjunto de datos, las etiquetas ni los usos previstos. El modelo tiene un volumen de descargas muy bajo (20) y ningún "like", lo que sugiere que se trata de un artefacto de desarrollo más que de un modelo consolidado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (IceBERT-large) |
| Parametros totales | 355.131.434 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos safetensors y ONNX) |
| Idiomas soportados | no disponible (el modelo base IceBERT-large está orientado al islandés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de mideind/IceBERT-large, un encoder basado en la arquitectura RoBERTa con 355 millones de parámetros y preentrenado en islandés. Sobre esa base se ha realizado un ajuste supervisado para clasificación de texto (pipeline `text-classification`), con cabecera de clasificación y un número de etiquetas no especificado en la documentación disponible.

Los hiperparámetros de entrenamiento sí están documentados: learning rate de 3e-05, batch size de 16 (tanto en entrenamiento como en evaluación), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup ratio de 0,06, semilla 42 y 4 épocas. El entrenamiento se realizó con Transformers 4.55.4, PyTorch 2.8.0, Datasets 4.3.0 y Tokenizers 0.21.4, y el modelo se generó con la herramienta `Trainer` (tag `generated_from_trainer`). No se documenta el volumen de datos, la composición del dataset, si hubo aumento de datos ni técnicas de regularización más allá del early stopping implícito por las 4 épocas. Tampoco se indica si se aplicó algún tipo de RLHF o DPO, algo poco habitual en un encoder de clasificación.

## Capacidades

- Clasificación de texto: asigna una etiqueta a un texto de entrada, presumiblemente relacionada con códigos de pago.
- Procesamiento de islandés: hereda del modelo base IceBERT-large la capacidad de representar texto en islandés.
- Inferencia ligera: al ser un encoder de 355 M de parámetros, es adecuado para despliegues de baja latencia.
- Exportación a ONNX: el repositorio incluye pesos en formato ONNX, lo que facilita el despliegue en entornos de producción con runtime de ONNX.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (`endpoints_compatible`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo "thinking"; es un modelo exclusivamente discriminativo.

## Casos de uso

- Clasificación automática de referencias de pago: el modelo puede recibir el texto libre de una transferencia o un concepto bancario y asignarle un código de pago normalizado, reduciendo la intervención manual en conciliaciones.
- Enrutamiento de transacciones en sistemas financieros: integrado en un backend, permite dirigir cada operación al departamento o flujo contable correcto según el código inferido.
- Normalización de datos en ERP y contabilidad: útil para limpiar y categorizar grandes volúmenes de registros históricos con descripciones heterogéneas en islandés.
- Detección de anomalías en pagos: al clasificar el código esperado, se pueden marcar transacciones cuya categoría no encaja con el patrón habitual del emisor.
- Procesamiento por lotes de documentos administrativos: extracción de códigos de pago a partir de textos de facturas o recibos en islandés, con la ventaja de un encoder rápido y de bajo coste computacional.
- Servicio de inferencia en producción con ONNX Runtime: al incluir pesos ONNX, puede desplegarse en infraestructura sin GPU o con GPU modesta, con latencias bajas para clasificación en tiempo real.
- Filtrado previo en pipelines de datos: usar el clasificador como primer paso para separar textos relevantes de pagos antes de pasarlos a un modelo generativo más costoso.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (conjunto de evaluación no especificado) son los siguientes:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,0475 |
| Accuracy | 0,9795 |
| F1 | 0,9777 |

Evolución durante el entrenamiento:

| Epoca | Step | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 1413 | 0,0601 | 0,9728 | 0,9654 |
| 2 | 2826 | 0,0715 | 0,9710 | 0,9643 |
| 3 | 4239 | 0,0549 | 0,9759 | 0,9718 |
| 4 | 5652 | 0,0540 | 0,9791 | 0,9769 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,4 GB solo para pesos (355 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, entre 2 y 3 GB.
- VRAM estimada en FP16/BF16: alrededor de 0,7 GB para pesos, con un total práctico de 1,5 a 2 GB.
- VRAM estimada con cuantización INT8: en torno a 0,4 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, T4 o superior funciona sin problemas. Para lotes grandes, A100 o H100 no son necesarias pero ofrecen mayor throughput.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers con PyTorch, ONNX Runtime (aprovechando los pesos ONNX del repo), Text Embeddings Inference (tag declarado), Hugging Face Inference Endpoints (tag `endpoints_compatible`), y servidores de inferencia compatibles con modelos de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| payment-codes-classifier-dev | 355 M | no disponible | CC-BY-4.0 | Hugging Face (20 descargas) | Fine-tuning de IceBERT-large para códigos de pago |
| mideind/IceBERT-large | 355 M | no disponible | no disponible en la informacion | Hugging Face | Modelo base islandés; requiere fine-tuning para tareas concretas |
| xlm-roberta-large | 560 M | 512 tokens | MIT | Hugging Face | Multilingüe; alternativa genérica pero menos especializada en islandés |
| DistilBERT multilingüe | 135 M | 512 tokens | Apache 2.0 | Hugging Face | Más ligero, menor precisión esperada en islandés |

No se dispone de datos de rendimiento comparativos entre estos modelos en la tarea específica de clasificación de códigos de pago.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset, las etiquetas, el dominio exacto ni los usos previstos; esto dificulta evaluar su idoneidad para producción.
- El conjunto de evaluación no está descrito, por lo que las métricas declaradas (accuracy 0,9795, F1 0,9777) no son verificables ni comparables con otros trabajos.
- Riesgo de sobreajuste: la loss de entrenamiento baja hasta 0,0141 mientras la de validación se estabiliza en torno a 0,054, y el mejor F1 se alcanza en la última época, sin evidencia de evaluación en un conjunto de test independiente.
- Sesgos desconocidos: al no documentarse la composición de los datos de entrenamiento, no se pueden evaluar sesgos demográficos, geográficos o de dominio.
- Riesgo de alucinación: bajo en sentido estricto (es un clasificador, no genera texto), pero puede asignar etiquetas con alta confianza a entradas fuera de distribución.
- Limitación idiomática: el modelo base está orientado al islandés; su rendimiento en otros idiomas, incluido el castellano, es presumiblemente pobre y no está documentado.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar la licencia del modelo base mideind/IceBERT-large, que no se detalla en la información disponible.
- Nombre con sufijo "dev": sugiere que es un artefacto de desarrollo, no una versión estable ni validada para producción.
- Volumen de adopción muy bajo (20 descargas, 0 likes): no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmtryggingar/payment-codes-classifier-dev
- Modelo base IceBERT-large: https://huggingface.co/mideind/IceBERT-large
- Documentación de Transformers (pipeline text-classification): https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- ONNX Runtime: https://onnxruntime.ai/
