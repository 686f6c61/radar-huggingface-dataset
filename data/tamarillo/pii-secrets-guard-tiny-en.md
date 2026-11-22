# Tamarillo/pii-secrets-guard-tiny-en

## Resumen

Tamarillo PII & Secrets Guard Tiny es un clasificador de tokens (token-classification) de 32 millones de parámetros, desarrollado por el usuario Tamarillo, especializado en la detección de información personal identificable (PII), datos de salud (PHI) y secretos de desarrollador en texto en inglés, código y logs. Se construye sobre el encoder `jhu-clsp/ettin-encoder-32m` con arquitectura `ModernBertForTokenClassification`, lo que permite cargarlo sin `trust_remote_code` y con la librería estándar `transformers` (>= 4.48.0).

El modelo resuelve un problema concreto en el despliegue de agentes de IA y pipelines de datos: la necesidad de aplicar DLP (data loss prevention) y guardrails en tiempo de ejecución sobre texto que puede contener credenciales, claves API, URIs de base de datos o datos personales. Frente a alternativas con licencias no comerciales o ventanas de contexto limitadas a 512 tokens, este modelo ofrece una licencia Apache-2.0 con linaje de entrenamiento comercialmente permisivo y una ventana de 7.999 tokens, lo que permite analizar documentos o trazas de logs completas en una sola pasada.

La propuesta de valor se apoya en tres ejes: una taxonomía de 21 clases canónicas (43 etiquetas BIO), artefactos ONNX verificados con paridad frente a PyTorch, y una latencia en CPU de 8,85 ms p50 (FP32, batch=1, entrada de ~45 tokens) que lo hace viable para filtrado en línea sin GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `ModernBertForTokenClassification` (encoder ModernBERT) |
| Parámetros totales | 32.047.531 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 7.999 tokens |
| Tipos de cuantización | FP32 (ONNX, 122,49 MB) y FP16 (ONNX, 61,44 MB); no se documentan GGUF ni INT8 |
| Idiomas soportados | Inglés (incluye código, logs y salidas de herramientas de agentes) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch), ONNX (FP32 y FP16) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT adaptado a clasificación de tokens mediante una cabeza de etiquetado BIO. Al estar basado en `jhu-clsp/ettin-encoder-32m`, hereda un encoder compacto de 32M de parámetros, lo que explica su reducido coste computacional. La ventana de 7.999 tokens se gestiona mediante una estrategia de ventana deslizante (windowing) documentada en la model card, y el modelo se distribuye sin código remoto, lo que simplifica la auditoría de seguridad en entornos corporativos.

El entrenamiento se realizó exclusivamente sobre datasets comercialmente permisivos: `nvidia/Nemotron-PII` y `gretelai/gretel-pii-masking-en-v1`, con exclusión explícita de datos de `ai4privacy`. La model card menciona calibración con hard-negatives (placeholders como `your-api-key-here`, hashes SHA de Git) y scripts reproducibles de construcción de datos, síntesis de secretos, entrenamiento y evaluación (`data_builder.py`, `synth_secrets.py`, `train.py`, `eval_suite.py`). No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Detección de 21 clases canónicas de entidades en una sola pasada: `PERSON`, `EMAIL_ADDRESS`, `PHONE_NUMBER`, `STREET_ADDRESS`, `POSTAL_CODE`, `DATE_OF_BIRTH`, `SSN`, `GOVERNMENT_ID`, `PASSPORT`, `DRIVER_LICENSE`, `CREDIT_CARD`, `IBAN_CODE`, `BANK_ACCOUNT`, `MEDICAL_ID`, `USERNAME`, `IP_ADDRESS`, `PASSWORD`, `API_KEY`, `AUTH_TOKEN`, `DATABASE_URI`, `PRIVATE_KEY`.
- Detección de secretos de desarrollador y credenciales embebidas en código y logs (claves API tipo `sk-proj-...`, URIs de PostgreSQL con credenciales, tokens de autenticación).
- Clasificación de tokens con 43 etiquetas BIO estándar.
- Procesamiento de entradas largas de hasta 7.999 tokens, adecuado para trazas de logs y documentos completos.
- Integración verificada con Microsoft Presidio (`presidio-analyzer >= 2.2.354`) mediante mapeo de entidades a la taxonomía de Presidio.
- Exportación ONNX con paridad de tokens verificada frente a PyTorch (agreement 1.0 sobre 2.048 tokens).
- Exclusión deliberada de atributos genéricos no PII (`date`, `time`, `country`, `gender`, `occupation`, `language`, `url` genérica) para evitar sobrerredacción en producción.
- No soporta tool calling, agentes, visión ni audio: es un modelo discriminativo de etiquetado, no generativo.

## Casos de uso

- Guardrail de DLP en agentes de IA: el modelo se interpone entre la salida de una herramienta y el contexto del LLM para redactar claves API, contraseñas y datos personales antes de que se persistan o se envíen a un proveedor externo; su latencia de 8,85 ms p50 en CPU permite hacerlo en línea sin GPU.
- Redacción de logs en pipelines de observabilidad: con 7.999 tokens de contexto puede procesar entradas de log completas, incluyendo URIs de base de datos con credenciales (`postgresql://svc_billing:...@db-prod.internal:5432/payments`) e IPs internas, antes de reenviarlas a un SIEM o almacén central.
- Cumplimiento RGPD en ingesta de datos: clasificación de campos PII en texto libre (nombres, emails, direcciones, IBAN, tarjetas) para enmascarar antes de almacenar en data lakes o entrenar modelos posteriores.
- Integración con Microsoft Presidio: sustitución del NER por defecto por este modelo mediante `NlpEngineProvider` para mejorar la detección de secretos de desarrollador que Presidio no cubre de serie.
- Escaneo de repositorios y commits: detección de claves privadas, tokens y contraseñas hardcodeadas en diffs o mensajes de commit, con calibración específica contra falsos positivos como hashes SHA de Git y placeholders.
- Filtrado previo a LLM-Guard u otras capas de seguridad: primera pasada rápida y barata que marca segmentos sospechosos antes de invocar analizadores más costosos.
- Sanitización de salidas de herramientas de agentes: limpieza de respuestas de APIs y shells que puedan contener credenciales o datos de usuario antes de incorporarlas al historial de conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (F1, precision o recall por entidad). La model card declara métricas `f1`, `precision` y `recall` en los tags, pero no incluye valores numéricos. Los únicos datos de rendimiento disponibles son de latencia y paridad:

| Métrica | Valor |
|---|---|
| Latencia CPU p50 (ONNX FP32, batch=1, ~45 tokens) | 8,85 ms |
| Latencia CPU p50 (ONNX FP16, batch=1, ~45 tokens) | 12,0 ms |
| Tamaño ONNX FP32 | 122,49 MB |
| Tamaño ONNX FP16 | 61,44 MB |
| Paridad de tokens PyTorch vs ONNX (2.048 tokens) | 1,0 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 130 MB de pesos, más activaciones; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en FP16: en torno a 65 MB de pesos; también trivial para cualquier GPU.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) o incluso iGPU es suficiente; el caso de uso principal es CPU.
- Cabe en CPU sin problema: la latencia declarada de 8,85 ms p50 en FP32 ONNX sobre CPU lo confirma.
- Opciones de despliegue: `transformers` (>= 4.48.0) con pipeline `token-classification`, ONNX Runtime (con decodificación de etiquetas propia), Microsoft Presidio como motor NER, y cualquier stack que consuma modelos `token-classification` estándar. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un encoder discriminativo).
- Throughput: no disponible más allá de la latencia p50 por petición de batch=1.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento (F1, precision, recall) de este modelo ni de alternativas comparables, por lo que la comparación cuantitativa no es posible. A continuación se comparan únicamente atributos estructurales verificables frente a las alternativas genéricas que la propia model card menciona como motivación (modelos PII con licencia `CC-BY-NC-*` y modelos con contexto limitado a 512 tokens), sin identificar modelos concretos:

| Atributo | Este modelo | Alternativas citadas en la model card |
|---|---|---|
| Parámetros | 32M | no disponible |
| Contexto | 7.999 tokens | 512 tokens (modelos con tope de contexto) |
| Licencia | Apache-2.0 | `CC-BY-NC-*` (no comercial) en alternativas citadas |
| Clases de entidad | 21 (43 etiquetas BIO) | no disponible |
| Formatos | safetensors, ONNX FP32/FP16 | no disponible |
| Latencia CPU | 8,85 ms p50 (FP32 ONNX) | no disponible |

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y evaluado únicamente en inglés, incluyendo código y logs en inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de falsos negativos y positivos: no se publican métricas F1/precision/recall por entidad, por lo que no es posible calibrar umbrales con datos objetivos antes de desplegar en producción.
- No es un modelo generativo: no soporta tool calling, razonamiento multi-paso ni generación; su uso está acotado al etiquetado de tokens.
- Sesgos: no se documentan análisis de sesgo demográfico ni de rendimiento diferencial por tipo de nombre, origen o formato de datos personales.
- Cobertura limitada por diseño: se excluyen deliberadamente atributos genéricos (fechas, países, ocupaciones, URLs genéricas), lo que puede dejar pasar PII contextual que no encaje en las 21 clases canónicas.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara linaje de entrenamiento comercialmente permisivo; conviene verificar la procedencia de los datasets (`nvidia/Nemotron-PII`, `gretelai/gretel-pii-masking-en-v1`) para cumplimiento interno.
- El modelo es muy reciente (creado el 22 de noviembre de 2026) y no registra descargas ni likes, por lo que carece de validación independiente por parte de la comunidad.
- En producción, la decisión de redacción debe combinarse con reglas deterministas (regex para formatos de tarjeta, IBAN, etc.) y revisión humana en flujos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/pii-secrets-guard-tiny-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Perfil del autor: https://huggingface.co/Tamarillo
- Microsoft Presidio: https://github.com/microsoft/presidio
- Los resultados de búsqueda web proporcionados tratan sobre la fruta tamarillo y no son relevantes para este modelo; no se incluyen.
