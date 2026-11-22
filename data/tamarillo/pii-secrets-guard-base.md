# Tamarillo/pii-secrets-guard-base

## Resumen

Tamarillo PII & Secrets Guard Base es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII), datos de salud protegidos (PHI) y secretos de desarrollador en textos, logs y trazas de agentes de IA. Lo desarrolla Tamarillo y se publica bajo licencia Apache-2.0, lo que lo convierte en una alternativa de uso comercial limpia frente a modelos de PII con licencias no comerciales (CC-BY-NC) o con ventanas de contexto limitadas a 512 tokens.

El modelo parte de `jhu-clsp/mmBERT-base`, una arquitectura ModernBERT multilingüe, y se ajusta para reconocer 21 clases canónicas de entidades (43 etiquetas BIO estándar) en una única pasada forward. Con 307.563.307 parámetros y una longitud de contexto de 8.192 tokens, está pensado para integrarse en pipelines de prevención de fuga de datos (DLP) en tiempo de ejecución de agentes, así como en herramientas consolidadas como Microsoft Presidio o LLM Guard.

Su relevancia actual radica en dos factores: por un lado, cubre clases que los detectores de PII tradicionales ignoran (API keys, tokens de autenticación, URIs de base de datos, claves privadas, contraseñas); por otro, su linaje de entrenamiento es 100 % comercialmente permisivo (sin datos de `ai4privacy`) y ofrece artefactos ONNX cuantizados con paridad verificada frente a PyTorch, lo que facilita el despliegue en CPU con latencias de decenas de milisegundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertForTokenClassification (base `jhu-clsp/mmBERT-base`) |
| Parametros totales | 307.563.307 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | FP32, FP16, INT8 dinámico por canal (ONNX) |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, sv, cs, ro, tr, fi, da, el, ru, uk, ja, zh, ko, ar, hi (22 idiomas, 6 alfabetos) + código y logs |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch), ONNX (FP32, FP16, INT8) |

## Arquitectura y entrenamiento

El modelo se construye sobre `jhu-clsp/mmBERT-base`, un encoder transformer de tipo ModernBERT adaptado a múltiples idiomas, y se especializa mediante ajuste supervisado para token-classification con 43 etiquetas BIO que mapean a 21 clases canónicas. La cabeza de clasificación opera sobre la salida contextual del encoder, sin necesidad de `trust_remote_code`, lo que simplifica la integración con la librería `transformers` (versión >= 4.48.0).

El entrenamiento utiliza exclusivamente datasets comercialmente permisivos: `nvidia/Nemotron-PII`, `nvidia/Nemotron-PII-Japan`, `gretelai/gretel-pii-masking-en-v1`, `gretelai/synthetic_pii_finance_multilingual` y `Wismut/nym-pii-multilingual-data`. Destaca la calibración explícita con hard negatives (placeholders como `your-api-key-here`, hashes de commit de Git, identificadores genéricos) para reducir falsos positivos en producción, y una ventana de contexto de 8.192 tokens que permite analizar documentos y trazas completas sin truncamiento. El autor publica scripts reproducibles de construcción de datos, entrenamiento y evaluación (`scripts/data_builder.py`, `scripts/train.py`, `scripts/eval_suite.py`, `scripts/synth_secrets.py`).

## Capacidades

- Detección de 21 clases canónicas de entidades en una sola pasada: `PERSON`, `EMAIL_ADDRESS`, `PHONE_NUMBER`, `STREET_ADDRESS`, `POSTAL_CODE`, `DATE_OF_BIRTH`, `SSN`, `GOVERNMENT_ID`, `PASSPORT`, `DRIVER_LICENSE`, `CREDIT_CARD`, `IBAN_CODE`, `BANK_ACCOUNT`, `MEDICAL_ID`, `USERNAME`, `IP_ADDRESS`, `PASSWORD`, `API_KEY`, `AUTH_TOKEN`, `DATABASE_URI`, `PRIVATE_KEY`.
- Detección de secretos de desarrollador y agentes (API keys, tokens, URIs de conexión con credenciales, claves privadas) además de PII clásica.
- Capacidad multilingüe en 22 idiomas y 6 alfabetos, incluyendo latinos, cirílico, griego, japonés, chino, coreano, árabe e hindi.
- Procesamiento de código y logs, con calibración específica para no marcar placeholders, hashes de commit ni identificadores genéricos.
- Contexto largo de 8.192 tokens para analizar documentos, conversaciones o trazas completas.
- Integración verificada con Microsoft Presidio (`presidio-analyzer >= 2.2.354`) mediante mapeo de entidades a las clases estándar de Presidio.
- Compatibilidad con LLM Guard y pipelines de guardrails para agentes.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-step por sí mismo; su función es la clasificación de entidades.

## Casos de uso

- DLP en tiempo de ejecución de agentes de IA: el modelo se sitúa como guardrail entre el agente y el LLM o entre el agente y herramientas externas, detectando API keys, tokens y PII antes de que se envíen a servicios de terceros. Su contexto de 8.192 tokens permite inspeccionar prompts completos con historial de conversación.
- Redacción de logs y trazas: en pipelines de observabilidad, se aplica sobre cada línea o bloque de log para enmascarar emails, IPs, URIs de base de datos con credenciales y tokens antes de almacenarlos o enviarlos a un SIEM.
- Cumplimiento RGPD y protección de datos en texto libre: integrado con Presidio, permite anonimizar documentos, tickets de soporte y correos electrónicos detectando nombres, direcciones, IBAN, tarjetas de crédito y documentos de identidad en 22 idiomas.
- Sanitización de datasets antes del entrenamiento: se ejecuta sobre corpus multilingües para eliminar PII y secretos antes de usarlos en el ajuste de modelos, reduciendo el riesgo de memorización de datos sensibles.
- Protección de secretos en repositorios y CI/CD: análisis de diffs, mensajes de commit y artefactos de build para detectar claves privadas, tokens de autenticación y contraseñas embebidas antes de fusionar o publicar.
- Enmascaramiento en atención al cliente automatizada: previo al envío de transcripciones a un LLM generativo, el modelo identifica y redacta PII del cliente, permitiendo usar modelos externos sin exponer datos personales.
- Filtrado de salidas de LLM: como capa de salida, detecta si un modelo generativo ha producido PII o secretos en su respuesta y bloquea o redacta antes de mostrarla al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta métricas de latencia y paridad de artefactos, que se recogen a continuación:

| Artefacto | Tamano | Latencia CPU p50 (batch=1, ~55 tokens) | Acuerdo de tokens vs. PyTorch (2.048 tokens) |
|---|---|---|---|
| ONNX FP32 | 1.173,83 MB | 56,46 ms | 1,0 |
| ONNX FP16 | 587,33 MB | 57,52 ms | 1,0 |
| ONNX INT8 dinamico | 859,21 MB | 34,17 ms | 1,0 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,2 GB de pesos más activaciones; en FP16, unos 0,6 GB; en INT8, unos 0,86 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP32 (GTX 1650, RTX 3050 en adelante); para alto throughput, A100, H100, L4 o RTX 4090.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 2 GB o más de VRAM; también es viable en CPU.
- Opciones de despliegue: `transformers` (>= 4.48.0) con `pipeline("token-classification")`, ONNX Runtime (artefactos incluidos), Microsoft Presidio como motor NLP, LLM Guard, y servidores de inferencia compatibles con la API de `transformers`.
- Latencia estimada en CPU: 34,17 ms p50 con INT8 ONNX y 56,46 ms p50 con FP32 ONNX para entradas de ~55 tokens y batch=1. El throughput en GPU no está documentado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Clases de entidades | Licencia | Idiomas |
|---|---|---|---|---|---|
| Tamarillo/pii-secrets-guard-base | 307M | 8.192 | 21 (PII + secretos) | Apache-2.0 | 22 |
| Modelos PII con licencia CC-BY-NC (categoria generica) | no disponible | 512 (tipico) | PII clasica | CC-BY-NC (no comercial) | variable |
| Microsoft Presidio (detectores base) | no disponible | no disponible | PII clasica (regex + spaCy) | MIT | varios |

La comparativa se limita a categorías porque la información proporcionada no incluye nombres concretos ni métricas de modelos alternativos. La ventaja diferencial declarada por el autor es la combinación de licencia Apache-2.0 con linaje de datos comercialmente permisivo, contexto de 8.192 tokens y cobertura de secretos de desarrollador, frente a alternativas con licencias no comerciales o ventanas de 512 tokens.

## Limitaciones y advertencias

- No se han publicado métricas de precisión, recall o F1 en la información disponible; la calidad real en producción debe validarse con un conjunto propio antes de desplegar.
- Riesgo de falsos negativos en formatos de PII o secretos no representados en los datasets de entrenamiento (por ejemplo, identificadores nacionales de países no cubiertos o formatos propietarios de tokens).
- Riesgo de falsos positivos en cadenas con apariencia de secreto pero legítimas; el autor mitiga esto con hard negatives, pero la calibración debe verificarse en el dominio concreto.
- Aunque soporta 22 idiomas, el rendimiento puede variar notablemente entre ellos; los datasets de entrenamiento están sesgados hacia inglés, japonés y datos financieros multilingües.
- Es un modelo de clasificación de tokens, no generativo: no razona, no sigue instrucciones ni ejecuta herramientas.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento normativo (RGPD, HIPAA) del tratamiento de los datos detectados.
- El modelo no sustituye una auditoría de seguridad: los secretos detectados deben rotarse, no solo redactarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/pii-secrets-guard-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Perfil del autor: https://huggingface.co/Tamarillo
- Dataset NVIDIA Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset NVIDIA Nemotron-PII-Japan: https://huggingface.co/datasets/nvidia/Nemotron-PII-Japan
- Dataset Gretel PII masking EN: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Dataset Gretel synthetic PII finance multilingual: https://huggingface.co/datasets/gretelai/synthetic_pii_finance_multilingual
- Dataset Wismut nym PII multilingual: https://huggingface.co/datasets/Wismut/nym-pii-multilingual-data
- Microsoft Presidio: https://github.com/microsoft/presidio
- LLM Guard: https://github.com/protectai/llm-guard

Nota: los resultados de la búsqueda web sobre "tamarillo" corresponden al fruto (Solanum betaceum) y no guardan relación con este modelo; se han descartado por no ser relevantes.
