# syntriq/tarn-german-pii-base

## Resumen

Tarn German PII base es un modelo de clasificación de tokens (token classification) especializado en la detección de datos personales (PII) en textos en alemán. Lo desarrolla syntriq y se construye sobre el modelo base GeistBERT/GeistBERT_base, una arquitectura tipo RoBERTa adaptada al alemán, con 125.424.423 parámetros totales. Su propósito es servir como motor NER dentro de pipelines de anonimización y desidentificación, con etiquetas alineadas con los nombres de entidad de Microsoft Presidio para que pueda integrarse directamente en infraestructuras existentes.

El modelo cubre 19 tipos de entidad, incluyendo identificadores específicos del sistema alemán como la Steuer-ID, la Rentenversicherungsnummer, la Krankenversichertennummer, el Personalausweis, el Reisepass, el Führerschein, la Lebenslange Arztnummer y la Betriebsstättennummer, además de entidades genéricas como personas, direcciones, correo electrónico, teléfono, IBAN, tarjetas de crédito e IP. Se ha entrenado exclusivamente con datos sintéticos, lo que evita la exposición de datos reales durante el entrenamiento y facilita su distribución bajo licencia Apache 2.0.

Su relevancia actual reside en la combinación de cobertura amplia de identificadores alemanes, integración nativa con Presidio y un rendimiento declarado muy alto en el benchmark propio del autor, con un recall enmascarado de 0.999 y un F1 estricto de 0.989 sobre un conjunto de evaluación sintético de 687 documentos de 26 tipos no vistos en entrenamiento. El repositorio incluye pesos en safetensors y ONNX, lo que permite despliegue tanto en servidor como en navegador mediante transformers.js.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo RoBERTa (GeistBERT_base) para token classification |
| Parámetros totales | 125.424.423 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de RoBERTa; el pipeline recomienda `stride=128` para textos largos) |
| Tipos de cuantización | no disponible (el repo incluye safetensors y ONNX; no se documentan cuantizaciones específicas) |
| Idiomas soportados | alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo RoBERTa, derivado de GeistBERT_base, configurado para token classification con 19 etiquetas de entidad más la etiqueta `O`. La cabeza de clasificación emite una predicción por token, que el pipeline de transformers agrega en spans mediante `aggregation_strategy="simple"`. El límite de contexto es de 512 tokens, por lo que la model card insiste en el uso de `stride=128` para no perder PII situada más allá de ese umbral en documentos largos.

El entrenamiento se realizó exclusivamente con datos sintéticos. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de clasificación). El benchmark de evaluación (`syntriq/german-pii-benchmark`) emplea 687 documentos de 26 tipos no presentes en entrenamiento, con nombres y calles de un pool separado y un escritor distinto (otro LLM), aunque los valores de identificadores provienen de los mismos generadores que los datos de entrenamiento, lo que el propio autor advierte que rebajará las métricas sobre documentos reales.

## Capacidades

- Detección de 19 tipos de PII en alemán: PERSON, EMAIL_ADDRESS, PHONE_NUMBER, ADDRESS, DATE_OF_BIRTH, IBAN_CODE, CREDIT_CARD, IP_ADDRESS y CUSTOMER_ID, además de diez identificadores alemanes específicos.
- Identificadores alemanes cubiertos: DE_TAX_ID (Steuerliche Identifikationsnummer), DE_TAX_NUMBER (Steuernummer), DE_SOCIAL_SECURITY (Rentenversicherungsnummer), DE_HEALTH_INSURANCE (Krankenversichertennummer), DE_ID_CARD (Personalausweisnummer), DE_PASSPORT (Reisepassnummer), DE_FUEHRERSCHEIN (Führerscheinnummer), DE_KFZ (matrículas), DE_LANR (Lebenslange Arztnummer) y DE_BSNR (Betriebsstättennummer).
- Etiquetas compatibles con Microsoft Presidio, lo que permite el mapeo directo a entidades de Presidio mediante configuración YAML.
- Procesamiento de texto largo mediante ventanas deslizantes con `stride`, con instrucciones explícitas para recortar espacios en los spans y fusionar spans contiguos con la misma etiqueta.
- Ejecución en navegador mediante transformers.js a través de la demo oficial, sin enviar texto a servidores externos.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking: es un modelo exclusivamente de clasificación de tokens.
- Capacidad multilingüe limitada al alemán; no se documenta soporte para otros idiomas.

## Casos de uso

- Anonimización en pipelines de cumplimiento RGPD/DSGVO: el modelo se integra como motor NER de Presidio en alemán y permite enmascarar o sustituir PII antes de almacenar o procesar documentos, con cobertura de identificadores fiscales y sanitarios que los reconocedores basados en reglas de Presidio no detectan (recall enmascarado de 0.348 para Presidio con solo reconocedores alemanes frente a 0.999 del modelo).
- Desidentificación de historiales clínicos: la cobertura de DE_LANR, DE_BSNR y DE_HEALTH_INSURANCE permite anonimizar documentación médica alemana donde aparecen números de colegiado y de centro, además de nombres y fechas de nacimiento.
- Redacción de documentos legales y fiscales: la detección de DE_TAX_ID, DE_TAX_NUMBER y CUSTOMER_ID facilita la preparación de expedientes para terceros o para publicación sin exponer identificadores tributarios.
- Procesamiento por lotes de correos y tickets de soporte: con `stride=128` el modelo recorre textos de varias páginas y extrae correos, teléfonos, direcciones e IBAN para su enmascaramiento antes de enviar el contenido a sistemas externos o a modelos generativos.
- Cumplimiento en atención al cliente: integración en el backend para anonimizar transcripciones y registros de conversaciones antes de almacenarlos en sistemas analíticos, reduciendo el riesgo de exposición de datos personales.
- Anonimización en el navegador: mediante transformers.js y la demo oficial, permite redactar PII en el cliente sin que el texto salga del dispositivo, útil en entornos con requisitos estrictos de soberanía del dato.
- Enriquecimiento de sistemas DLP: uso del modelo como clasificador de PII en herramientas de prevención de fuga de datos para bloquear o marcar documentos alemanes con identificadores sensibles.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre `syntriq/german-pii-benchmark` (687 documentos, 26 tipos de documento no vistos en entrenamiento):

| Modelo | Tamaño | Etiquetas cubiertas | Recall enmascarado | Precisión enmascarada | F1 estricto |
|---|---|---|---|---|---|
| syntriq/tarn-german-pii-base | 126M | 19 de 19 | 0.999 | 0.993 | 0.989 |
| bardsai/eu-pii-anonimization-multilang | no disponible | 10 de 19 | 0.978 | 0.772 | 0.677 |
| urchade/gliner_multi_pii-v1 | no disponible | 19 de 19 | 0.892 | 0.875 | 0.687 |
| openai/privacy-filter | no disponible | 5 de 19 | 0.887 | 0.671 | 0.462 |
| tabularisai/eu-pii-safeguard | no disponible | 12 de 19 | 0.788 | 0.892 | 0.539 |
| Presidio 2.2.366 (solo reconocedores alemanes) | reglas | reglas | 0.348 | 0.970 | 0.474 |

F1 estricto por etiqueta:

| Etiqueta | F1 | Soporte |
|---|---|---|
| PERSON | 0.992 | 2957 |
| ADDRESS | 0.992 | 1063 |
| EMAIL_ADDRESS | 0.997 | 961 |
| PHONE_NUMBER | 0.999 | 837 |
| CUSTOMER_ID | 0.938 | 469 |
| DATE_OF_BIRTH | 0.997 | 448 |
| IBAN_CODE | 1.000 | 262 |
| IP_ADDRESS | 0.988 | 166 |
| DE_TAX_ID | 0.983 | 141 |
| DE_ID_CARD | 0.964 | 110 |
| CREDIT_CARD | 1.000 | 103 |
| DE_KFZ | 0.995 | 97 |
| DE_HEALTH_INSURANCE | 1.000 | 80 |
| DE_TAX_NUMBER | 0.948 | 76 |
| DE_FUEHRERSCHEIN | 1.000 | 66 |
| DE_PASSPORT | 0.968 | 61 |
| DE_LANR | 0.981 | 51 |
| DE_SOCIAL_SECURITY | 0.980 | 49 |
| DE_BSNR | 0.962 | 38 |

El autor advierte que el benchmark es sintético: los tipos de documento, el escritor y el pool de nombres y calles son distintos de los de entrenamiento, pero los valores de identificadores provienen de los mismos generadores, por lo que los documentos reales obtendrán puntuaciones inferiores. Recomienda validar sobre una muestra de datos propios.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (126M parámetros), más overhead de activaciones y del pipeline; en la práctica, menos de 1 GB en fp32 y del orden de 250-300 MB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090 o incluso GPUs de gama baja como T4 o GTX 1650 pueden ejecutar el modelo con holgura.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna; también puede ejecutarse en CPU con latencia aceptable para volúmenes moderados.
- Opciones de despliegue: pipeline de transformers, ONNX Runtime (pesos ONNX incluidos en el repo), transformers.js para navegador, integración con Microsoft Presidio como motor NER, y servidores de inferencia compatibles con modelos de la librería transformers (por ejemplo, TGI o vLLM en modo encoder, aunque no se documenta configuración específica).
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 126M parámetros, se espera un throughput alto en GPU, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Etiquetas PII | F1 estricto (benchmark del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| syntriq/tarn-german-pii-base | 126M | 512 tokens | 19 de 19 | 0.989 | Apache 2.0 | Hugging Face, ONNX, transformers.js |
| bardsai/eu-pii-anonimization-multilang | no disponible | no disponible | 10 de 19 | 0.677 | no disponible | Hugging Face |
| urchade/gliner_multi_pii-v1 | no disponible | no disponible | 19 de 19 | 0.687 | no disponible | Hugging Face |
| openai/privacy-filter | no disponible | no disponible | 5 de 19 | 0.462 | no disponible | no disponible |
| tabularisai/eu-pii-safeguard | no disponible | no disponible | 12 de 19 | 0.539 | no disponible | Hugging Face |

Los datos de parámetros, contexto y licencia de los modelos comparables no se han proporcionado en la información disponible; solo se conocen sus resultados en el benchmark del autor y su cobertura de etiquetas.

## Limitaciones y advertencias

- El benchmark es sintético y comparte generadores de identificadores con los datos de entrenamiento; el rendimiento sobre documentos reales será inferior y debe validarse con una muestra propia antes de producción.
- El modelo solo soporta alemán; no se ha entrenado ni evaluado para otros idiomas.
- El contexto máximo es de 512 tokens; sin `stride` configurado, el pipeline trunca el texto y pierde toda la PII posterior a ese límite.
- Requiere post-procesado: recortar espacios en los spans y fusionar spans contiguos con la misma etiqueta para evitar fragmentación.
- No detecta como PII nombres de empresas, ciudades aisladas, números de factura, números de expediente ni NIF-IVA (VAT IDs), que quedan sin etiquetar por diseño del esquema.
- Riesgo de alucinación: al ser un modelo de clasificación, el riesgo se manifiesta como falsos positivos (spans marcados como PII que no lo son) y falsos negativos; la precisión enmascarada declarada es 0.993, pero sobre datos reales puede degradarse.
- Sesgos conocidos: no se documentan análisis de sesgo; al entrenarse con datos sintéticos, la distribución de nombres y direcciones puede no reflejar la diversidad real de la población alemana.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales.
- El modelo se distribuye con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de terceros sobre sus resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syntriq/tarn-german-pii-base
- Demo en el navegador: https://huggingface.co/spaces/syntriq/tarn-german-pii-demo
- Benchmark: https://huggingface.co/syntriq/german-pii-benchmark
- Modelo base: https://huggingface.co/GeistBERT/GeistBERT_base
- Microsoft Presidio: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
