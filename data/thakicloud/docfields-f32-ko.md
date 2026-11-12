# ThakiCloud/DocFields-F32-KO

## Resumen

DocFields-F32-KO es un modelo de clasificación de tokens (token classification) especializado en la extracción de campos clave de formularios financieros coreanos. Lo desarrolla ThakiCloud y se publica como un fine-tune completo del modelo LiLT combinado con XLM-RoBERTa (`nielsr/lilt-xlm-roberta-base`), con una cabeza de clasificación de 15 etiquetas. El modelo no procesa píxeles ni incluye OCR: recibe cajas de texto con sus coordenadas normalizadas y asigna a cada una un rol de campo (dirección, teléfono, número de cuenta, importe de reclamación, fechas, etc.).

La relevancia del modelo radica en su enfoque de un solo checkpoint para una tarea que antes requería enrutamiento entre varios modelos o motores de reglas. Según la model card, F3.2 recupera fechas genéricas y números de cuenta que el modelo anterior descartaba, sin necesidad de un segundo modelo en inferencia. El modelo tiene 283.573.967 parámetros y una ventana efectiva de 510 sub-tokens por página, con división en límites de caja para documentos más largos.

Es importante señalar que el autor lo marca explícitamente como **EXPERIMENTAL / RESEARCH PREVIEW**, con un veredicto de calidad `F32_TARGETS_MISSED`: cumplió 6 de sus 7 objetivos de desarrollo preinscritos y falló en el objetivo de teléfono. No hay garantía de precisión para documentos de producción, y varias etiquetas se entrenaron únicamente con formularios sintéticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LiLT + XLM-RoBERTa (transformer multimodal texto-layout), cabeza de token classification de 15 etiquetas |
| Parámetros totales | 283.573.967 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 510 sub-tokens por página; páginas mayores se dividen en límites de caja sin solapamiento |
| Tipos de cuantización | no disponible (pesos safetensors en el repo; el autor no documenta cuantizaciones) |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en LiLT (Language-independent Layout Transformer) acoplado a XLM-RoBERTa como encoder de texto, con una cabeza de clasificación de tokens de 15 etiquetas. La entrada es una lista de cajas OCR por página, donde cada caja incluye el texto y un `bbox` normalizado `[x0, y0, x1, y1]` en el rango 0..1. Cada caja se trata como una unidad: solo el primer sub-token de cada caja recibe la predicción, con un máximo de 24 sub-tokens por caja. El orden de lectura importa al encoder, por lo que las cajas deben alimentarse de arriba a abajo y de izquierda a derecha, tal como las emite el OCR.

El entrenamiento es un fine-tune completo sobre `nielsr/lilt-xlm-roberta-base`. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, pero sí indica que solo seis etiquetas (`ADDRESS`, `PHONE`, `ACCOUNT_NO`, `CLAIM_AMOUNT`, `ISSUE_DATE`, `OTHER_DATE`) se entrenaron y evaluaron con formularios reales; el resto (`APPLICANT_NAME`, `RRN_OR_BIRTH`, `BANK_NAME`, `CONTRACT_NO`, `INS_PERIOD`, `SIGNATURE` y casi todas las de `KEY`) se aprendieron solo de formularios sintéticos, y `CONSENT_MARK` no tuvo ejemplos de entrenamiento. La innovación técnica destacable es la decodificación no argmax: el archivo `decode.json` define `{"tau_date": null, "tau_acct": 0.25}`, de modo que una caja cuyo argmax no sea una etiqueta de fecha o cuenta se promociona a `ACCOUNT_NO` si p(ACCOUNT_NO) ≥ 0.25. La promoción de fechas está desactivada. Los resultados publicados se midieron con esta decodificación; usar argmax simple o el `pipeline()` estándar da resultados distintos.

## Capacidades

- Clasificación de roles de campo en formularios financieros coreanos: direcciones, teléfonos, números de cuenta, importes de reclamación, fechas de emisión y otras fechas.
- Extracción de información clave (key information extraction) a partir de cajas OCR con coordenadas, sin procesamiento de píxeles.
- Etiquetado de 15 roles: `O`, `KEY`, `APPLICANT_NAME`, `RRN_OR_BIRTH`, `ACCOUNT_NO`, `BANK_NAME`, `CONTRACT_NO`, `INS_PERIOD`, `CLAIM_AMOUNT`, `CONSENT_MARK`, `SIGNATURE`, `ISSUE_DATE`, `PHONE`, `ADDRESS`, `OTHER_DATE`.
- Manejo de documentos de varias páginas mediante división en límites de caja sin solapamiento.
- Decodificación con umbral específico para recuperar números de cuenta (`tau_acct = 0.25`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo de clasificación de tokens, no generativo.
- Capacidad multilingüe limitada al coreano (etiqueta `ko`); el encoder base XLM-RoBERTa es multilingüe, pero el fine-tune está orientado a formularios coreanos.

## Casos de uso

- Extracción de campos en formularios de reclamación de seguros: el modelo etiqueta cajas OCR de formularios de reclamación coreanos, identificando dirección, teléfono, importe de reclamación y fechas, lo que permite automatizar la digitalización de siniestros con una ventana de 510 sub-tokens por página.
- Procesamiento de solicitudes y confirmaciones financieras: clasifica roles de campo en formularios de solicitud y confirmación, facilitando la validación de datos antes de introducirlos en sistemas de gestión documental.
- Enriquecimiento de pipelines OCR existentes: al recibir cajas con coordenadas y no píxeles, se integra aguas abajo de cualquier motor OCR (Tesseract, PaddleOCR, etc.) para añadir semántica de campo sin reemplazar el OCR.
- Detección de números de cuenta y datos bancarios: gracias a la decodificación con `tau_acct = 0.25`, recupera números de cuenta que el argmax simple descartaría, útil en procesos de alta de datos de pago.
- Normalización de fechas en documentos financieros: distingue entre fecha de emisión (`ISSUE_DATE`) y otras fechas (`OTHER_DATE`), lo que permite ordenar cronológicamente documentos y extraer vigencias.
- Investigación y evaluación de modelos layout-aware: al ser un artefacto de investigación con métricas detalladas y bootstrap pareado, sirve como referencia para estudiar el rendimiento de LiLT en dominios financieros coreanos.
- Prototipado de sistemas de form understanding: con licencia MIT y un script de auto-test (`docfields_f32.py --selftest`), permite montar rápidamente un prototipo de extracción de campos en entornos de I+D.

## Benchmarks y rendimiento

Los resultados provienen del conjunto de evaluación `sealed7_fin`: 204 documentos de formularios financieros (198 con etiquetas completas).

| Métrica (sealed7_fin) | F3.2 (este modelo) | Modelo único anterior (F30m) | Enrutamiento de 3 modelos (F3.1) | Objetivo | Cumplido |
|---|---|---|---|---|---|
| Macro-F1 sobre 5 roles | 0.9035 | 0.879 | 0.890 | ≥ 0.890 | sí |
| Recall de detección de fechas | 0.703 | 0.273 | 0.606 | ≥ 0.606 | sí |
| Precisión de detección de fechas | 0.417 | 0.417 | 0.337 | ≥ 0.337 | sí |
| F1 de `ACCOUNT_NO` | 0.797 | 0.694 | 0.767 | ≥ 0.767 | sí |
| F1 de `CLAIM_AMOUNT` | 0.9231 | 0.9231 | – | ≥ 0.9181 | sí |
| F1 de `ADDRESS` | 0.9978 | 0.9985 | – | ≥ 0.9935 | sí |
| F1 de `PHONE` | 0.9147 | 0.9219 | – | ≥ 0.9169 | no |
| F1 de `ISSUE_DATE` | 0.885 | 0.857 | – | – | – |

Los cinco roles del macro-F1 son número de cuenta, dirección, importe de reclamación, fecha de emisión y teléfono. La detección de fechas comprueba si una caja con una cadena de fecha completa recibe alguna etiqueta de fecha; la referencia es un verificador determinista de formato de fecha, no un humano. Una precisión de 0.417 implica 0.79 cajas de fecha falsas por documento.

Intervalos de confianza por bootstrap pareado sobre documentos (2.000 remuestreos, intervalo del 95 %):

| Diferencia | vs modelo único anterior (F30m) | vs enrutamiento de 3 modelos (F3.1) |
|---|---|---|
| Recall de detección de fechas | +0.430 [0.329, 0.534] | +0.097 [0.018, 0.181] |

## Requisitos de hardware

- VRAM estimada para inferencia: con 283,6 millones de parámetros, en fp32 los pesos ocupan aproximadamente 1,1 GB; en fp16, unos 0,57 GB. El repo pesa 1,2 GB, coherente con pesos en fp32.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre para fp32, incluyendo RTX 3060, RTX 4060, RTX 4090, A100 o H100. El modelo cabe holgadamente en GPU de consumo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más de VRAM; también puede ejecutarse en CPU, como demuestra el ejemplo de la model card (`device="cpu"`).
- Opciones de despliegue: transformers con el script `docfields_f32.py` proporcionado por el autor; vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo y no se garantiza su compatibilidad al ser un modelo de token classification con decodificación personalizada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DocFields-F32-KO | 283,6 M | 510 sub-tokens | Token classification de campos en formularios coreanos | MIT | Hugging Face |
| nielsr/lilt-xlm-roberta-base | no disponible | no disponible | Modelo base LiLT + XLM-RoBERTa | no disponible | Hugging Face |
| Modelo único anterior (F30m) | no disponible | no disponible | Token classification de campos en formularios coreanos | no disponible | no disponible |
| Enrutamiento de 3 modelos (F3.1) | no disponible | no disponible | Token classification con enrutamiento entre modelos | no disponible | no disponible |

Los datos de F30m y F3.1 provienen únicamente de la tabla comparativa de la model card; no se dispone de sus especificaciones completas ni de enlaces de descarga.

## Limitaciones y advertencias

- Estado experimental: el autor lo publica como artefacto de investigación (`EXPERIMENTAL / RESEARCH PREVIEW`) con veredicto `F32_TARGETS_MISSED`; no hay garantía de precisión para documentos de producción.
- Objetivo de teléfono no cumplido: F1 de `PHONE` de 0.9147 frente al objetivo de 0.9169. Todos los errores de teléfono inspeccionados fueron confusiones entre `PHONE` y `ACCOUNT_NO`, posiblemente por la recuperación de números de cuenta, aunque la causa no se aisló.
- Etiquetas no verificadas: `APPLICANT_NAME`, `RRN_OR_BIRTH`, `BANK_NAME`, `CONTRACT_NO`, `INS_PERIOD`, `SIGNATURE` y casi todas las de `KEY` se aprendieron solo de formularios sintéticos; `CONSENT_MARK` no tuvo ejemplos de entrenamiento. Tratar sus salidas como no verificadas.
- Precisión de detección de fechas baja: 0.417, con 0.79 cajas de fecha falsas por documento según el verificador determinista.
- Confusión entre fechas: el ejemplo de la model card muestra una fecha de accidente etiquetada como `ISSUE_DATE` en lugar de `OTHER_DATE`.
- Dependencia del orden de lectura: el encoder espera cajas de arriba a abajo y de izquierda a derecha; un orden distinto puede degradar los resultados.
- Decodificación específica: los resultados publicados usan `decode.json` con `tau_acct = 0.25`; usar argmax simple o el `pipeline()` estándar da resultados distintos.
- Sin OCR integrado: el modelo no lee píxeles; requiere un OCR previo que emita texto y coordenadas normalizadas.
- Idioma limitado al coreano: no se ha evaluado su comportamiento en otros idiomas, aunque el encoder base sea multilingüe.
- Licencia MIT: permite uso comercial, pero el estado experimental y la falta de garantías desaconsejan su uso en producción sin validación adicional.
- Riesgo de alucinación: al ser un clasificador de tokens, no genera texto libre, pero puede asignar etiquetas incorrectas con alta confianza en campos no verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/DocFields-F32-KO
- Modelo base LiLT + XLM-RoBERTa: https://huggingface.co/nielsr/lilt-xlm-roberta-base
- Tarjeta en coreano: https://huggingface.co/ThakiCloud/DocFields-F32-KO/blob/main/MODEL_CARD.ko.md
- Script de inferencia: https://huggingface.co/ThakiCloud/DocFields-F32-KO/blob/main/docfields_f32.py
- Ejemplo sintético: https://huggingface.co/ThakiCloud/DocFields-F32-KO/blob/main/examples/synthetic_form.json
