# Tamarillo/pii-secrets-guard-small

## Resumen
Tamarillo/pii-secrets-guard-small es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII), datos de salud protegidos (PHI) y secretos de desarrollador en un solo paso hacia delante. Lo desarrolla Tamarillo y se construye sobre el modelo base jhu-clsp/mmBERT-small, un encoder de la familia ModernBERT, con 140 millones de parámetros y una longitud de contexto máxima de 8.192 tokens. Su propósito es servir como barrera de seguridad (guardrail) en tiempo de ejecución para agentes de IA y pipelines de datos, detectando 21 clases canónicas de entidades en 22 idiomas y seis sistemas de escritura, incluyendo código y logs.

El modelo resuelve un problema concreto de producción: muchas alternativas de detección de PII están limitadas a ventanas de 512 tokens o usan licencias no comerciales (CC-BY-NC). Este modelo ofrece una ventana de 8.192 tokens y una licencia Apache-2.0 con linaje de entrenamiento totalmente permisivo para uso comercial, sin depender de `trust_remote_code`. Está pensado como alternativa directa a modelos de PII con restricciones de licencia o de contexto.

La relevancia actual viene del despliegue masivo de agentes de IA que procesan texto libre, logs y credenciales, donde la filtración de secretos (API keys, tokens, URIs de bases de datos) y datos personales es un riesgo operativo y regulatorio. El modelo se integra con Microsoft Presidio y LLM Guard, y ofrece artefactos ONNX (FP32, FP16 e INT8) para inferencia en CPU con latencias del orden de 21-27 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertForTokenClassification (encoder transformer, sin `trust_remote_code`) |
| Parametros totales | 140M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | FP32, FP16, INT8 dinamico por canal (artefactos ONNX); safetensors nativo en PyTorch |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, sv, cs, ro, tr, fi, da, el, ru, uk, ja, zh, ko, ar, hi (22 idiomas, 6 sistemas de escritura) + codigo y logs |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch), ONNX (FP32, FP16, INT8) |

## Arquitectura y entrenamiento
El modelo es un encoder transformer de la familia ModernBERT para clasificación de tokens, inicializado desde jhu-clsp/mmBERT-small. Emite 43 etiquetas BIO estándar que se agrupan en 21 clases canónicas de entidad: PERSON, EMAIL_ADDRESS, PHONE_NUMBER, STREET_ADDRESS, POSTAL_CODE, DATE_OF_BIRTH, SSN, GOVERNMENT_ID, PASSPORT, DRIVER_LICENSE, CREDIT_CARD, IBAN_CODE, BANK_ACCOUNT, MEDICAL_ID, USERNAME, IP_ADDRESS, PASSWORD, API_KEY, AUTH_TOKEN, DATABASE_URI y PRIVATE_KEY. Excluye deliberadamente atributos genéricos no sensibles (date, time, country, gender, occupation, language, url genérica) para evitar sobrerredacción en producción.

El entrenamiento se realizó exclusivamente sobre datasets con permisividad comercial, sin datos de ai4privacy, e incluye nvidia/Nemotron-PII, nvidia/Nemotron-PII-Japan, gretelai/gretel-pii-masking-en-v1, gretelai/synthetic_pii_finance_multilingual y Wismut/nym-pii-multilingual-data. La model card menciona calibración explícita con hard negatives (placeholders como `your-api-key-here` y hashes Git SHA) y ventaneo de contexto largo. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO (poco probable en un modelo encoder de clasificación). Los scripts de construcción de datos, entrenamiento y evaluación (`data_builder.py`, `train.py`, `eval_suite.py`, `synth_secrets.py`, `taxonomy.py`) se publican para reproducibilidad.

## Capacidades
- Detección de 21 clases de PII, PHI y secretos en una sola pasada hacia delante.
- Clasificación de tokens con etiquetado BIO (43 etiquetas), agregable con `aggregation_strategy="simple"` en `transformers`.
- Soporte multilingüe en 22 idiomas: en, de, fr, es, it, pt, nl, pl, sv, cs, ro, tr, fi, da, el, ru, uk, ja, zh, ko, ar, hi.
- Detección de secretos de desarrollador: API_KEY, AUTH_TOKEN, PASSWORD, DATABASE_URI, PRIVATE_KEY.
- Manejo de código y logs como dominio de entrada, con hard negatives calibrados para placeholders y hashes.
- Integración verificada con Microsoft Presidio (`presidio-analyzer >= 2.2.354`) mediante mapeo de entidades.
- Compatible con LLM Guard según las etiquetas del modelo.
- Artefactos ONNX con paridad verificada frente a PyTorch (token agreement 1.0 en 2.048 tokens).
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso por sí mismo; se usa como componente de filtrado dentro de esos sistemas.

## Casos de uso
- Guardrail de entrada en agentes de IA: antes de enviar el prompt de un usuario a un LLM, el modelo escanea el texto y redacta PII o secretos. Su contexto de 8.192 tokens permite cubrir conversaciones multi-turno y documentos largos sin truncar.
- Prevención de fuga de credenciales en logs: se ejecuta sobre líneas de log o trazas de error para detectar API_KEY, AUTH_TOKEN, PASSWORD, DATABASE_URI y PRIVATE_KEY antes de que se almacenen o se envíen a sistemas externos.
- Cumplimiento RGPD en pipelines de datos: clasificación de campos con PII (nombre, email, teléfono, IBAN, SSN) en procesos ETL para anonimización o enmascaramiento previo al almacenamiento.
- Integración con Microsoft Presidio: sustitución del motor NER por defecto por este modelo mediante `NlpEngineProvider`, aprovechando el mapeo de entidades documentado y el multiplicador de baja confianza.
- Filtrado de salidas de LLM (output guardrail): análisis de la respuesta generada antes de mostrarla al usuario para evitar que el modelo reproduzca datos personales o secretos vistos en el contexto.
- Procesamiento de documentación técnica y repositorios: escaneo de README, issues y commits para detectar credenciales hardcodeadas o URIs de bases de datos, con manejo específico de hashes Git y placeholders como hard negatives.
- Despliegue en CPU para DLP en tiempo real: gracias a los artefactos ONNX INT8 (21,5 ms p50), puede ejecutarse en servidores sin GPU dentro de pasarelas de API o proxies.

## Benchmarks y rendimiento
La información disponible incluye métricas de latencia y paridad de artefactos, pero no resultados de benchmarks estándar (F1, precision, recall por clase, MMLU, etc.) sobre conjuntos de evaluación públicos.

| Metrica | Valor |
|---|---|
| Latencia CPU ONNX INT8 (p50) | 21,5 ms (batch=1, ~55 tokens de entrada) |
| Latencia CPU ONNX FP16 (p50) | 24,61 ms |
| Latencia CPU ONNX FP32 (p50) | 27,15 ms |
| Tamano ONNX FP32 | 537,07 MB |
| Tamano ONNX FP16 | 268,95 MB |
| Tamano ONNX INT8 | 417,16 MB |
| Paridad PyTorch vs ONNX (token agreement) | 1,0 en 2.048 tokens |

No se han publicado resultados de benchmarks de calidad (F1, precision, recall) en la información disponible.

## Requisitos de hardware
- Inferencia en CPU viable: el modelo de 140M parámetros corre en CPU con los artefactos ONNX; la variante INT8 ofrece 21,5 ms p50 para entradas cortas.
- VRAM estimada en GPU: aproximadamente 0,6 GB en FP32 y 0,3 GB en FP16 para los pesos, más memoria de activaciones para contexto de 8.192 tokens (estimación orientativa, no confirmada en la información disponible).
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Despliegue: `transformers >= 4.48.0`, ONNX Runtime, Microsoft Presidio, LLM Guard. No se mencionan integraciones con vLLM, llama.cpp o TGI (no aplicables a un encoder de clasificación de esta escala).
- Throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Tamarillo/pii-secrets-guard-small | 140M | 8.192 | Apache-2.0 | 21 clases, 22 idiomas, secretos de desarrollador, ONNX |
| Modelos PII con licencia CC-BY-NC | no disponible | típicamente 512 | CC-BY-NC | Restringidos para uso comercial; mencionados en la model card como alternativa que este modelo sustituye |
| Microsoft Presidio (NER por defecto) | depende del motor (p. ej. spaCy) | depende del motor | MIT (componente) | Requiere motor NER externo; este modelo se integra como motor |

No se dispone de datos de benchmarks comparativos con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo generativo: no razona, no genera texto ni soporta tool calling; su función es exclusivamente la clasificación de tokens.
- Riesgo de falsos positivos y falsos negativos: aunque se calibró con hard negatives, no se publican métricas de F1, precision ni recall, por lo que el rendimiento real en dominios específicos debe validarse.
- Exclusión deliberada de entidades genéricas (date, country, url): puede no detectar datos que algunos flujos regulatorios consideren sensibles.
- Cobertura idiomática declarada para 22 idiomas, pero sin métricas por idioma publicadas; el rendimiento puede variar entre lenguas y sistemas de escritura.
- La model card está truncada en la información disponible; no se detallan sesgos conocidos ni limitaciones adicionales.
- Licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento normativo (RGPD, HIPAA) en su contexto.
- El modelo no sustituye una auditoría de seguridad completa: debe combinarse con otras capas de DLP y controles de acceso.

## Enlaces
- Hugging Face: https://huggingface.co/Tamarillo/pii-secrets-guard-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Perfil del autor: https://huggingface.co/Tamarillo
- Dataset nvidia/Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset nvidia/Nemotron-PII-Japan: https://huggingface.co/datasets/nvidia/Nemotron-PII-Japan
- Dataset gretelai/gretel-pii-masking-en-v1: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Dataset gretelai/synthetic_pii_finance_multilingual: https://huggingface.co/datasets/gretelai/synthetic_pii_finance_multilingual
- Dataset Wismut/nym-pii-multilingual-data: https://huggingface.co/datasets/Wismut/nym-pii-multilingual-data
