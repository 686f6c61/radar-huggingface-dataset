# vennyvirtuoso/modernbert-banking77-intent

## Resumen

`modernbert-banking77-intent` es un modelo de clasificación de texto especializado en la detección de intenciones (intent classification) dentro del dominio bancario y de atención al cliente financiero. Lo publica el usuario `vennyvirtuoso` en Hugging Face y se construye mediante fine-tuning del modelo base `answerdotai/ModernBERT-base` sobre el dataset `PolyAI/banking77`, que contiene consultas reales de clientes etiquetadas en 77 categorías de intención distintas.

El modelo resuelve un problema muy concreto y de alto valor operativo: enrutar automáticamente consultas de clientes bancarios hacia el departamento, agente o flujo de resolución adecuado. Con 149.664.077 parámetros, una arquitectura encoder-only derivada de ModernBERT y una licencia Apache 2.0, está pensado para despliegues de producción de baja latencia y alto throughput, no para generación de texto.

Es relevante ahora porque ModernBERT introduce mejoras de eficiencia (atención con RoPE, contextos largos, kernels optimizados) sobre BERT clásico, y este checkpoint concreto ofrece un clasificador de 77 clases con métricas declaradas de 95,40 % de accuracy y 95,19 % de macro-F1 en el split de test, lo que lo hace directamente utilizable como componente de routing en pipelines de soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT) |
| Parametros totales | 149.664.077 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base ModernBERT-base soporta hasta 8192 tokens; el valor efectivo de entrenamiento de este checkpoint no se especifica) |
| Tipos de cuantizacion | no disponible (el autor menciona precisión mixta bfloat16/fp16 en entrenamiento; no se listan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el dataset Banking77 es predominantemente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de clasificación sobre `answerdotai/ModernBERT-base`, un encoder transformer de la familia ModernBERT que incorpora mejoras sobre BERT clásico como rotary positional embeddings (RoPE), atención con ventana local y global alternada, y kernels optimizados para mayor eficiencia en secuencias largas. La cabeza de clasificación se ajusta para producir 77 clases correspondientes a las intenciones del dataset Banking77. El tamaño del repo es de 0,6 GB y los pesos están en safetensors.

El entrenamiento se realiza sobre `PolyAI/banking77`, un corpus de consultas de clientes bancarios con 77 etiquetas de intención. La model card menciona precisión mixta (bfloat16/fp16) durante el entrenamiento y una evaluación sobre splits de test "group-disjoint" para evitar fuga de datos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco habituales en clasificación). Tampoco se detallan hiperparámetros, épocas o estrategia de augmentación.

## Capacidades

- Clasificación de texto en 77 clases de intención bancaria (por ejemplo, `transfer_fee_charged`, `activate_my_card`, `card_swallowed`).
- Salida de etiqueta y puntuación de confianza por consulta, apta para umbrales de derivación a humano.
- Integración con `transformers`, `sentence-transformers`, `peft` y pipelines estándar de Hugging Face.
- Inferencia de alta velocidad: el autor declara 487,3 muestras/segundo en evaluación.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es un clasificador discriminativo, no un modelo generativo.
- Capacidades multilingües: no documentadas; el dataset de entrenamiento es en inglés, por lo que el rendimiento en castellano no está garantizado.

## Casos de uso

- Enrutamiento automático de tickets de soporte bancario: cada consulta entrante se clasifica en una de las 77 intenciones y se deriva al equipo o flujo correspondiente (tarjetas, transferencias, fraude, etc.), reduciendo el tiempo de triaje manual.
- Chatbots y asistentes conversacionales financieros: el clasificador actúa como primer módulo de NLU que determina la intención del usuario antes de invocar la respuesta o el servicio adecuado.
- Sistemas IVR y atención telefónica: transcripción de la consulta del cliente y clasificación en tiempo real para dirigir la llamada al agente especializado, aprovechando la baja latencia declarada.
- Analítica de intenciones a gran escala: procesamiento por lotes de históricos de consultas para identificar los motivos de contacto más frecuentes y priorizar mejoras de producto o documentación.
- Moderación y compliance: detección de consultas relacionadas con cargos, disputas o fraude para activar protocolos regulatorios o de escalado.
- Microservicios de clasificación en producción: despliegue con ONNX Runtime, TensorRT o Text Embeddings Inference para inferencia sub-5 ms en CPU/GPU según el autor, integrándose en backends FastAPI o Triton.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (evaluación sobre el split de test oficial):

| Metrica | Valor |
|---|---|
| Accuracy zero-shot del modelo base | 1,40 % |
| Macro-F1 zero-shot del modelo base | 0,04 % |
| Accuracy del modelo fine-tuned (test) | 95,40 % |
| Macro-F1 del modelo fine-tuned (test) | 95,19 % |
| Ganancia absoluta de accuracy | +94,00 % |
| Loss en test | 0,1813 |
| Clases de intención | 77 |
| Throughput de evaluación | 487,3 muestras/s |

No se han publicado en la información disponible comparaciones con otros modelos (por ejemplo, BERT-base fine-tuned sobre Banking77) ni resultados desglosados por clase.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,3 GB de pesos (149,7 M de parámetros), más overhead de activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 3060/4060 o superiores para producción; A100/H100 no son necesarias para este tamaño, aunque pueden usarse para batch masivo.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM; también es viable en CPU para cargas moderadas.
- Opciones de despliegue: `transformers`, Text Embeddings Inference (TEI), ONNX Runtime, TensorRT, FastAPI, Triton Inference Server; el autor menciona compatibilidad con `sentence-transformers` y `peft`.
- Latencia y throughput: el autor declara 487,3 muestras/s en evaluación y afirma inferencia sub-5 ms en CPU/GPU con ONNX/TensorRT, aunque estas cifras no están verificadas de forma independiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| modernbert-banking77-intent | 149,7 M | no disponible (base hasta 8192) | Clasificación 77 intenciones bancarias | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-base | ~149 M | 8192 | Encoder base (sin fine-tuning de tarea) | Apache 2.0 | Hugging Face |
| BERT-base fine-tuned en Banking77 (referencias de la comunidad) | ~110 M | 512 | Clasificación 77 intenciones | Apache 2.0 (BERT) | Hugging Face |
| DistilBERT fine-tuned en Banking77 | ~66 M | 512 | Clasificación 77 intenciones | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de métricas comparativas de estos modelos alternativos sobre Banking77, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo discriminativo: no genera texto ni mantiene conversaciones; solo asigna una etiqueta de entre 77 clases.
- Entrenado sobre Banking77, un dataset en inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Riesgo de sesgo heredado del dataset: las consultas de Banking77 no representan necesariamente la distribución real de todos los clientes ni de todos los mercados.
- Riesgo de clasificación errónea en consultas ambiguas o fuera de distribución; se recomienda umbral de confianza y derivación a humano.
- No se documentan cuantizaciones publicadas ni versiones GGUF/ONNX en el repo; habría que generarlas.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no ofrece garantías ni soporte; verificar el cumplimiento de las condiciones del dataset Banking77 para uso comercial.
- Las métricas (95,40 % accuracy, 487,3 muestras/s, sub-5 ms) son declaraciones del autor y no han sido verificadas de forma independiente.
- El modelo se publicó en 2026-11-17 con 0 descargas y 1 like en el momento de la consulta: madurez y adopción comunitaria muy limitadas.

## Enlaces

- Hugging Face: https://huggingface.co/vennyvirtuoso/modernbert-banking77-intent
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset: https://huggingface.co/datasets/PolyAI/banking77
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- ONNX Runtime: https://github.com/microsoft/onnxruntime
- TensorRT: https://github.com/NVIDIA/TensorRT
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
