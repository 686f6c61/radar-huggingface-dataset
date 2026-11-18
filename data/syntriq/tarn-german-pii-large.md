# syntriq/tarn-german-pii-large

## Resumen

Tarn German PII large es un modelo de clasificación de tokens (token-classification) especializado en la detección de datos personales identificables (PII) en textos en alemán. Lo desarrolla syntriq y se construye mediante fine-tuning sobre `deepset/gelectra-large`, un modelo de arquitectura Electra de tipo encoder con aproximadamente 335 millones de parámetros. Su propósito es integrarse directamente en pipelines de anonimización y seudonimización, especialmente en el ecosistema de Microsoft Presidio, del que adopta los nombres de entidad.

El modelo cubre 19 tipos de entidades, incluyendo identificadores específicos del sistema administrativo alemán (Steuer-ID, Steuernummer, número de seguro de pensiones, número de asegurado de salud, número de carné de conducir, matrículas de vehículos, entre otros) además de entidades genéricas como personas, direcciones, correo electrónico, teléfono, IBAN, tarjetas de crédito e IP. Está entrenado exclusivamente con datos sintéticos y se distribuye con licencia Apache 2.0.

Su relevancia actual radica en el cumplimiento del RGPD/DSGVO en el ámbito germanoparlante: ofrece una alternativa entrenable e integrable a los reconocedores basados en reglas de Presidio, con métricas declaradas notablemente superiores en su benchmark sintético. El modelo se publica en formato transformers con pesos safetensors y también incluye exportación ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Electra (encoder transformer), base `deepset/gelectra-large` |
| Parametros totales | 334.726.183 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por ventana (con `stride` para textos largos) |
| Tipos de cuantizacion | no disponible (repo con safetensors y ONNX; no se documentan cuantizaciones específicas) |
| Idiomas soportados | Alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo Electra, derivado de `deepset/gelectra-large`, adaptado a la tarea de token classification con etiquetas BIO para 19 entidades PII. Electra emplea un esquema de preentrenamiento con detección de tokens reemplazados, lo que produce representaciones eficientes para tareas de etiquetado secuencial. La cabeza de clasificación se entrena sobre el encoder preentrenado en alemán.

El entrenamiento se realizó únicamente con datos sintéticos. La model card indica que los tipos de documento, el generador de texto (un LLM distinto) y el conjunto de nombres y calles del benchmark de evaluación son distintos de los usados en entrenamiento, aunque los valores de los identificadores provienen de los mismos generadores. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a token classification). El modelo incorpora la convención de etiquetas de Microsoft Presidio para facilitar su integración directa.

## Capacidades

- Detección de 19 tipos de PII en alemán: PERSON, EMAIL_ADDRESS, PHONE_NUMBER, ADDRESS, DATE_OF_BIRTH, IBAN_CODE, CREDIT_CARD, IP_ADDRESS, CUSTOMER_ID, DE_TAX_ID, DE_TAX_NUMBER, DE_SOCIAL_SECURITY, DE_HEALTH_INSURANCE, DE_ID_CARD, DE_PASSPORT, DE_FUEHRERSCHEIN, DE_KFZ, DE_LANR y DE_BSNR.
- Etiquetado con nombres de entidad compatibles con Microsoft Presidio, lo que permite su uso directo en pipelines de anonymización existentes.
- Procesamiento de textos largos mediante ventanas deslizantes con `stride` (recomendado `stride=128` en el pipeline de transformers).
- Exportación ONNX para despliegue en entornos sin PyTorch y ejecución en navegador mediante transformers.js (demo pública).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo exclusivamente de etiquetado de tokens.
- No dispone de capacidades multimodales (visión, audio) ni modo de razonamiento explícito.

## Casos de uso

- Anonimización en pipelines de Presidio: el modelo se configura como motor NER para alemán en `german-pii.yaml`, sustituyendo o complementando los reconocedores basados en reglas, con mapeo directo de etiquetas a entidades Presidio.
- Cumplimiento del RGPD/DSGVO en atención al cliente: detección y enmascaramiento de nombres, direcciones, IBAN y números de teléfono en transcripciones de correos y chats antes de almacenarlos o enviarlos a terceros.
- Seudonimización de registros sanitarios: identificación de números de asegurado de salud (DE_HEALTH_INSURANCE), LANR y BSNR en documentación clínica alemana para su tratamiento conforme a normativa.
- Preparación de datasets para investigación: eliminación de PII en corpus alemanes antes de su publicación o uso en entrenamiento de otros modelos, gracias a la cobertura de identificadores administrativos poco frecuentes.
- Gestión documental administrativa y fiscal: detección de Steuer-ID, Steuernummer, números de pasaporte y carné de conducir en expedientes digitalizados para su redacción automática.
- Enmascaramiento en logs y telemetría: detección de direcciones IP, correos electrónicos y números de cliente en registros de aplicaciones antes de su envío a sistemas de observabilidad.
- Procesamiento en el navegador con transformers.js: la demo pública demuestra la ejecución local del modelo sin que el texto abandone el dispositivo, útil para entornos con requisitos estrictos de privacidad.

## Benchmarks y rendimiento

Resultados declarados en el benchmark sintético `syntriq/german-pii-benchmark` (687 documentos, 26 tipos de documento no vistos en entrenamiento):

| Modelo | Tamaño | Etiquetas cubiertas | Masked recall | Masked precision | Strict F1 |
|---|---|---|---|---|---|
| **syntriq/tarn-german-pii-large** | 335M | 19 de 19 | 0.999 | 0.995 | 0.992 |
| bardsai/eu-pii-anonimization-multilang | no disponible | 10 de 19 | 0.978 | 0.772 | 0.677 |
| urchade/gliner_multi_pii-v1 | no disponible | 19 de 19 | 0.892 | 0.875 | 0.687 |
| openai/privacy-filter | no disponible | 5 de 19 | 0.887 | 0.671 | 0.462 |
| tabularisai/eu-pii-safeguard | no disponible | 12 de 19 | 0.788 | 0.892 | 0.539 |
| Presidio 2.2.366 (reconocedores alemanes) | reglas | reglas | 0.348 | 0.970 | 0.474 |

Resultados por etiqueta (strict F1) para el modelo:

| Etiqueta | F1 | Soporte |
|---|---|---|
| PERSON | 0.990 | 2957 |
| ADDRESS | 0.992 | 1063 |
| EMAIL_ADDRESS | 1.000 | 961 |
| PHONE_NUMBER | 0.997 | 837 |
| CUSTOMER_ID | 0.974 | 469 |
| DATE_OF_BIRTH | 0.996 | 448 |
| IBAN_CODE | 0.994 | 262 |
| IP_ADDRESS | 0.997 | 166 |
| DE_TAX_ID | 1.000 | 141 |
| DE_ID_CARD | 0.972 | 110 |
| CREDIT_CARD | 1.000 | 103 |
| DE_KFZ | 0.995 | 97 |
| DE_HEALTH_INSURANCE | 0.994 | 80 |
| DE_TAX_NUMBER | 0.987 | 76 |
| DE_FUEHRERSCHEIN | 1.000 | 66 |
| DE_PASSPORT | 0.961 | 61 |
| DE_LANR | 0.990 | 51 |
| DE_SOCIAL_SECURITY | 0.990 | 49 |
| DE_BSNR | 0.974 | 38 |

Advertencia del autor: el benchmark es sintético y los documentos reales obtendrán puntuaciones inferiores; se recomienda validar sobre una muestra propia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo de pesos (335M parámetros), más memoria de activaciones y del tokenizador; en la práctica, alrededor de 2 GB.
- En fp16: aproximadamente 0,7 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. El modelo es pequeño y no requiere GPUs de datacenter.
- Cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU con latencia aceptable para lotes pequeños.
- Opciones de despliegue: pipeline de transformers (PyTorch), ONNX Runtime (incluido en el repo), transformers.js para navegador y servidores de inferencia compatibles con modelos de token classification (por ejemplo, TGI o vLLM si soportan la arquitectura Electra para token classification).
- Latencia y throughput: no se han publicado cifras concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Etiquetas PII | Licencia | Formato |
|---|---|---|---|---|---|
| syntriq/tarn-german-pii-large | 335M | 512 (ventana) | 19 (alemán) | Apache 2.0 | safetensors, ONNX |
| bardsai/eu-pii-anonimization-multilang | no disponible | no disponible | 10 | no disponible | no disponible |
| urchade/gliner_multi_pii-v1 | no disponible | no disponible | 19 (multilingüe, zero-shot) | no disponible | no disponible |
| openai/privacy-filter | no disponible | no disponible | 5 | no disponible | no disponible |
| tabularisai/eu-pii-safeguard | no disponible | no disponible | 12 | no disponible | no disponible |

El modelo destaca por su cobertura completa de las 19 etiquetas y por su integración nativa con Presidio; GLiNER ofrece enfoque zero-shot multilingüe pero con menor strict F1 en este benchmark.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: el rendimiento en documentos reales será inferior al del benchmark; es imprescindible validar sobre datos propios antes de producción.
- El benchmark de evaluación es sintético y comparte generadores de identificadores con el entrenamiento, lo que puede inflar las métricas.
- Ventana de contexto de 512 tokens: para textos más largos es obligatorio usar `stride` (recomendado 128) y fusionar fragmentos; sin ello se pierden entidades.
- Solo soporta alemán (`de`); no cubre otros idiomas.
- Cobertura limitada por diseño: nombres de empresas, ciudades aisladas, números de factura, números de expediente y NIF-IVA (VAT IDs) no se etiquetan como PII en este esquema.
- Riesgo de alucinación de entidades: como todo modelo NER, puede producir falsos positivos en cadenas que se parezcan a identificadores; conviene revisar la precisión en dominios específicos.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al entrenarse con datos sintéticos, puede reflejar los sesgos de los generadores empleados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre exactitud ni cumplimiento normativo; la responsabilidad del tratamiento de datos recae en el integrador.

## Enlaces

- Hugging Face: https://huggingface.co/syntriq/tarn-german-pii-large
- Demo en el navegador (transformers.js): https://huggingface.co/spaces/syntriq/tarn-german-pii-demo
- Benchmark: https://huggingface.co/syntriq/german-pii-benchmark
- Modelo base: https://huggingface.co/deepset/gelectra-large
- Microsoft Presidio: https://microsoft.github.io/presidio/
