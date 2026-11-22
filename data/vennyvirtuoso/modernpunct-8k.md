# vennyvirtuoso/modernpunct-8k

## Resumen

modernpunct-8k es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) y entidades sensibles en documentos financieros. Lo desarrolla el usuario vennyvirtuoso y se publica como un fine-tuning del checkpoint base answerdotai/ModernBERT-base, un transformer encoder bidireccional de 149 millones de parámetros. El modelo resuelve un problema concreto: identificar y etiquetar automáticamente 59 tipos de entidades sensibles (nombres, SSN, IBAN, fechas, números de ruta bancaria, etc.) para cumplir con normativas como GDPR, CCPA, PCI-DSS o HIPAA.

La propuesta de valor es doble: por un lado, una arquitectura ligera (149M parámetros, repo de 0,3 GB) pensada para despliegues de alta concurrencia y baja latencia; por otro, una ventana de contexto nativa de 8.192 tokens con atención bidireccional FlashAttention-2, que permite procesar documentos completos sin fragmentación. El autor reporta una precisión de token del 96,72 % en el split de test retenido, frente al 0,99 % del checkpoint base sin adaptar, lo que evidencia una adaptación efectiva al dominio financiero multilingüe (inglés, español, francés y alemán).

Es relevante ahora porque la presión regulatoria sobre el tratamiento de datos personales en entornos financieros exige soluciones de redacción y anonimización que sean rápidas, desplegables on-premise y con licencia permisiva. Al estar bajo Apache 2.0 y ser compatible con el pipeline estándar de `transformers`, se puede integrar en flujos de pre-indexación, sanitización y anonimización sin coste de licencia ni dependencia de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-base) con FlashAttention-2, para clasificación de tokens |
| Parametros totales | 149.609.478 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (entrenado en mixed precision bfloat16/fp16; no se listan cuantizaciones publicadas) |
| Idiomas soportados | Inglés, español, francés y alemán (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | token-classification (NER / PII) |
| Modelo base | answerdotai/ModernBERT-base |
| Dataset de entrenamiento | ModernPunct (Long-Context Conversational & Mental Health Transcripts) |
| Tamaño del repo | 0,3 GB |
| Precisión de entrenamiento | Mixed precision (bfloat16 / fp16) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer bidireccional que incorpora mejoras de eficiencia respecto a BERT clásico: atención con FlashAttention-2, rotary positional embeddings (RoPE) y una ventana de contexto nativa de 8.192 tokens. Sobre esa base se añade una cabeza de clasificación de tokens para resolver la tarea de etiquetado de entidades. El resultado es un modelo de 149M parámetros, sin componentes generativos ni decodificación autoregresiva, orientado exclusivamente a la extracción de spans.

El fine-tuning se realizó sobre el dataset ModernPunct, descrito por el autor como transcripciones conversacionales de contexto largo y salud mental, con evaluación en un split de test group-disjoint (sin solapamiento de grupos) para medir generalización fuera de distribución. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en token classification). La model card menciona mixed precision en bfloat16/fp16 y compatibilidad con `transformers`, `sentence-transformers` y `peft`, pero no detalla hiperparámetros, épocas ni estrategia de aumento de datos.

## Capacidades

- Detección de 59 tipos de entidades PII y sensibles en el dominio financiero: nombres, SSN, IBAN, números de ruta bancaria, fechas, importes, entre otras.
- Clasificación de tokens a nivel de span con agregación de entidades (`aggregation_strategy="simple"` en el pipeline de `transformers`).
- Procesamiento multilingüe en inglés, español, francés y alemán.
- Manejo de documentos de hasta 8.192 tokens en una sola pasada, sin necesidad de chunking.
- Inferencia de alta concurrencia: 1.441 transcripciones/segundo en GPU por lotes y 15,15 ms por transcripción en edge.
- Compatibilidad con `transformers`, `sentence-transformers`, `peft` y `accelerate`.
- Exportación a ONNX Runtime y despliegue en Triton Inference Server según las recomendaciones del autor.
- No es un modelo generativo: no soporta tool calling, function calling, razonamiento multi-paso ni modos de pensamiento. Su función es exclusivamente extractiva.

## Casos de uso

- **Cumplimiento GDPR/CCPA en documentos financieros**: el modelo escanea contratos, extractos y facturas para localizar y etiquetar PII (nombres, IBAN, SSN) antes de almacenar o compartir los documentos, permitiendo redactar los spans detectados y demostrar minimización de datos ante auditorías.
- **Sanitización previa a indexación en buscadores internos**: antes de vectorizar o indexar documentación corporativa, se pasa cada documento por el clasificador para enmascarar entidades sensibles; los 8.192 tokens de contexto evitan fragmentar documentos largos y perder entidades en los límites de chunk.
- **Anonimización en tiempo real de transcripciones de atención al cliente**: con 15,15 ms por transcripción en edge y 1.441 transcripciones/s en GPU por lotes, se puede integrar en el pipeline de ingesta de logs de soporte para eliminar datos personales antes de que lleguen a sistemas analíticos.
- **Detección de fugas de datos en correos y comunicaciones internas**: clasificación por lotes de correos y mensajes para identificar IBAN, números de tarjeta o identificadores fiscales que no deberían circular por canales no cifrados, con alertas automáticas al equipo de seguridad.
- **Preprocesamiento para pipelines de KYC y AML**: extracción de entidades (nombres, fechas, números de cuenta) de documentación de onboarding para alimentar sistemas de verificación, reduciendo el trabajo manual de revisión.
- **Microservicio de redacción on-premise**: al ser un modelo de 149M parámetros y 0,3 GB, se puede desplegar en una única GPU consumer o incluso en CPU con ONNX Runtime, lo que permite ofrecer un servicio de redacción sin enviar datos a terceros.
- **Etiquetado asistido para anotación humana**: el modelo puede pre-etiquetar grandes volúmenes de documentos financieros y servir como primer paso en un flujo de anotación supervisada, reduciendo el coste de etiquetado manual.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card sobre el split de test retenido:

| Metrica | Fine-tuned | Baseline zero-shot | Ganancia |
|---|---|---|---|
| Precisión de token (held-out) | 96,72 % | 0,99 % | +95,73 pp |
| F1 de slot de puntuación | 0,5160 | 0,0668 | +0,4492 |
| Macro-F1 (held-out) | 0,6619 | no disponible | no disponible |
| Throughput por lotes (GPU) | 1.441 transcripciones/s | no disponible | no disponible |
| Latencia por transcripción (edge) | 15,15 ms | no disponible | no disponible |

No se han publicado resultados comparativos con otros modelos de PII (como los basados en BERT-base o DeBERTa) en la información disponible. La model card no incluye desglose por idioma ni por tipo de entidad.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp16/bfloat16, aproximadamente 0,3 GB de pesos más overhead de activaciones; en la práctica, menos de 1 GB para lotes pequeños. En cuantización INT8 (ONNX) bajaría a unos 0,15 GB, aunque el autor no publica checkpoints cuantizados.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente; para alto throughput por lotes se recomiendan A100, H100 o L40S. En consumer, una RTX 3060, RTX 4060 o RTX 4090 pueden ejecutar el modelo sin problemas.
- **Cabe en GPU consumer**: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM; también es viable en CPU con ONNX Runtime para cargas moderadas.
- **Opciones de despliegue**: pipeline de `transformers` (PyTorch/ONNX), ONNX Runtime para microservicios de baja latencia en CPU/GPU, Triton Inference Server para multi-tenant, y `sentence-transformers`/`peft` para integración en stacks existentes.
- **Latencia y throughput**: 15,15 ms por transcripción en edge y 1.441 transcripciones/s en GPU por lotes, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| modernpunct-8k | 149M | 8.192 | Token classification (PII financiero, 59 entidades) | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-base | 149M | 8.192 | Encoder base (sin cabeza de PII) | Apache 2.0 | Hugging Face |
| Modelos NER tipo BERT-base fine-tuned para PII | ~110M | 512 | Token classification (PII genérico) | variable | Hugging Face |
| Modelos NER tipo DeBERTa-v3-base fine-tuned | ~184M | 512 | Token classification (PII genérico) | MIT / variable | Hugging Face |

La ventaja diferencial frente a fine-tunes de BERT-base es la ventana de 8.192 tokens (16 veces mayor) y la especialización en 59 entidades financieras multilingües. Frente a DeBERTa-v3-base, el modelo es más pequeño y con mayor contexto, aunque no se dispone de comparativas de F1 directas en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos**: no se documentan análisis de sesgo por idioma, género o etnia; el dataset de entrenamiento (transcripciones conversacionales y de salud mental) puede no representar la distribución real de documentos financieros, lo que introduce riesgo de sesgo de dominio.
- **Alucinación**: al ser un modelo extractivo, no genera texto, pero puede producir falsos positivos (etiquetar como PII spans que no lo son) y falsos negativos (no detectar entidades fuera del vocabulario o formato de entrenamiento).
- **Limitaciones de contexto**: aunque soporta 8.192 tokens, documentos más largos requieren chunking, con el riesgo de perder entidades en los límites entre fragmentos.
- **Idiomas**: la model card declara cuatro idiomas, pero no se publica rendimiento desglosado por idioma; el rendimiento en español, francés y alemán podría ser inferior al de inglés.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario debe verificar que el dataset ModernPunct y el modelo base no impongan restricciones adicionales (el base es Apache 2.0, pero el dataset no se detalla en la información disponible).
- **Madurez**: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, con fecha de creación 2026-11-21; no hay evidencia de uso en producción ni validación independiente de los benchmarks reportados.
- **Macro-F1 de 0,6619**: el rendimiento agregado es notablemente inferior a la precisión de token (96,72 %), lo que sugiere que algunas clases de entidad tienen un F1 bajo; conviene validar por clase antes de desplegar en producción.
- **Sin soporte generativo**: no sirve para tareas de razonamiento, generación de código ni agentes; su uso está acotado a extracción de spans.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/modernpunct-8k
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset ModernPunct: https://huggingface.co/datasets/ModernPunct
- Documentación del pipeline de token classification: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TokenClassificationPipeline
- ONNX Runtime: https://github.com/microsoft/onnxruntime
- Triton Inference Server: https://github.com/triton-inference-server/server
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
