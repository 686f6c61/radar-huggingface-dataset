# wotamann/redactor-openmed-pii-onnx

## Resumen

`wotamann/redactor-openmed-pii-onnx` es un conjunto de artefactos ONNX en FP16 derivados de dos modelos de clasificación de tokens de la familia OpenMed, especializados en la detección de información personal identificable (PII) en textos clínicos. Incluye dos variantes independientes: una para inglés (`OpenMed-PII-mSuperClinical-Large-279M-v1`, 53 tipos de etiqueta) y otra para alemán (`OpenMed-PII-German-mSuperClinical-Large-279M-v1`, 54 tipos de etiqueta). Ambos modelos fuente son Apache-2.0 y el autor mantiene la atribución correspondiente en esta conversión.

El modelo resuelve un problema concreto en el ámbito sanitario y de investigación clínica: la desidentificación automática de textos médicos antes de su uso en pipelines de datos, entrenamiento o compartición. Al estar exportado a ONNX con precisión FP16, está pensado para despliegue en producción con runtime ONNX (ONNX Runtime, servidores de inferencia compatibles) sin depender de PyTorch.

La relevancia de este artefacto es doble: por un lado, ofrece una alternativa reproducible y ligera (1,1 GB de repo total para dos modelos) frente a los pesos originales en PyTorch; por otro, documenta explícitamente que la cuantización INT8 dinámica alteraba las etiquetas en la muestra de identificadores, lo que justifica la elección de FP16 como compromiso entre tamaño y fidelidad de predicción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (token classification), derivado de mSuperClinical-Large; detalles internos no disponibles |
| Parametros totales | 279M por variante (según el nombre del modelo fuente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (ONNX); INT8 dinámico descartado por degradación de etiquetas |
| Idiomas soportados | en, de |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_fp16.onnx`), opset 18, `keep_io_types=True`; tokenizer y config por variante |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de clasificación de tokens (token-classification) de tipo transformer encoder, aparentemente basado en la familia mSuperClinical-Large con 279M de parámetros. No se especifican el número de capas, la dimensionalidad oculta, la longitud máxima de secuencia ni la composición del dataset de entrenamiento en la información proporcionada.

Lo que sí está documentado es el proceso de conversión: se utilizó Optimum con opset 18 y precisión FP16, manteniendo los tipos de entrada/salida originales (`keep_io_types=True`). El script de conversión es reproducible (`tools/convert/convert_openmed.py`). Se descartó INT8 dinámico porque cambiaba las etiquetas predichas en la muestra de identificadores, mientras que FP16 coincidía con PyTorch en las muestras de conversión. Los tamaños y checksums SHA-256 están fijados en `models/manifest.json` del proyecto fuente. No se documentan detalles de RLHF, DPO ni datos de entrenamiento.

## Capacidades

- Clasificación de tokens para detección de PII en textos clínicos, con 53 tipos de etiqueta en inglés y 54 en alemán.
- Identificación de entidades sensibles propias del dominio sanitario (la lista exacta de etiquetas no está disponible en la información proporcionada).
- Procesamiento bilingüe mediante dos modelos independientes (no un único modelo multilingüe).
- Inferencia vía ONNX Runtime con pesos FP16, sin dependencia de PyTorch.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento extendido; es un modelo exclusivamente discriminativo para etiquetado de secuencias.

## Casos de uso

- Desidentificación de historiales clínicos antes de investigación: el modelo etiqueta nombres, identificadores y otras entidades PII en notas clínicas en inglés o alemán, permitiendo anonimizar el corpus antes de compartirlo con equipos de análisis o entrenar modelos aguas abajo.
- Pipeline de cumplimiento normativo (RGPD, HIPAA): integrado como paso previo a almacenamiento o exportación de textos médicos, detecta y marca entidades sensibles para su redacción o seudonimización automática.
- Preprocesado de datasets para entrenamiento de LLM sanitarios: filtra PII en corpus clínicos antes de incluirlos en datasets de fine-tuning, reduciendo el riesgo de memorización de datos personales.
- Despliegue en entornos con recursos limitados: al ser ONNX FP16 y 279M de parámetros por variante, puede ejecutarse en CPU o GPU modesta dentro de infraestructura hospitalaria sin stack de PyTorch.
- Anonimización en tiempo real en sistemas de dictado o transcripción clínica: el etiquetado token a token permite marcar entidades sensibles conforme se generan notas.
- Auditoría de textos ya almacenados: barrido batch sobre repositorios documentales para localizar PII residual y priorizar su tratamiento.
- Servicio de redacción como microservicio: exposición vía ONNX Runtime Server o un wrapper HTTP para que otras aplicaciones del hospital consulten la desidentificación bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que FP16 coincidió con PyTorch en las muestras de conversión y que INT8 dinámico alteró etiquetas en la muestra de identificadores, sin cifras cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB por variante en FP16 (279M parámetros × 2 bytes), más overhead de activaciones y memoria del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; RTX 3060, RTX 4090, A100 y H100 son sobradamente suficientes. También viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más (GTX 1650, RTX 3050 en adelante).
- Opciones de despliegue: ONNX Runtime (CPU/GPU), ONNX Runtime Server, Triton Inference Server con backend ONNX, o integración en servicios Python propios. No se documenta soporte nativo en llama.cpp, Ollama, vLLM ni TGI (no aplicables a un modelo de clasificación de tokens).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| redactor-openmed-pii-onnx (este) | 279M por variante | en, de | ONNX FP16 | Apache-2.0 | Conversión de los modelos OpenMed; sin benchmarks publicados |
| OpenMed-PII-mSuperClinical-Large-279M-v1 | 279M | en | PyTorch (pesos originales) | Apache-2.0 | Modelo fuente; requiere stack PyTorch |
| OpenMed-PII-German-mSuperClinical-Large-279M-v1 | 279M | de | PyTorch (pesos originales) | Apache-2.0 | Modelo fuente en alemán |
| Otros detectores PII clínicos (p. ej. variantes de MedCAT, ScispaCy) | no disponible | varios | varios | varios | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre benchmarks comparativos frente a alternativas, por lo que la comparación se limita a parámetros, idioma, formato y licencia.

## Limitaciones y advertencias

- Solo cubre inglés y alemán; no hay soporte multilingüe adicional documentado.
- Es una conversión derivada: cualquier limitación, sesgo o error de los modelos OpenMed originales se hereda. La model card no detalla sesgos conocidos.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la detección de PII; no se han publicado métricas de precisión/recall.
- La cuantización INT8 dinámica degrada las etiquetas predichas según el autor, por lo que no se recomienda su uso sin validación específica sobre el dominio objetivo.
- La lista completa de las 53/54 etiquetas no está disponible en la información proporcionada; es necesario consultar los modelos fuente para conocer la taxonomía exacta.
- Licencia Apache-2.0 permite uso comercial, pero exige mantener la atribución a OpenMed como obra derivada.
- No se incluyen datos de pacientes en el repositorio, pero su uso en producción requiere validación local frente a los requisitos normativos aplicables (RGPD, HIPAA u otros).
- Longitud máxima de secuencia y comportamiento con textos muy largos no documentados; conviene trocear entradas clínicas extensas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wotamann/redactor-openmed-pii-onnx
- Modelo fuente inglés: https://huggingface.co/OpenMed/OpenMed-PII-mSuperClinical-Large-279M-v1
- Modelo fuente alemán: https://huggingface.co/OpenMed/OpenMed-PII-German-mSuperClinical-Large-279M-v1
- Script de conversión (referenciado en la model card): `tools/convert/convert_openmed.py` en el proyecto fuente (no se proporciona URL directa)
- Manifiesto de tamaños y checksums: `models/manifest.json` en el proyecto fuente (no se proporciona URL directa)
