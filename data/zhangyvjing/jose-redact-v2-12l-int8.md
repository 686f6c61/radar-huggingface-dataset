# zhangyvjing/jose-redact-v2-12l-int8

## Resumen

JOSE-Redact v2 12L INT8 es un modelo de clasificación de tokens especializado en la detección y el enmascarado de información personal identificable (PII) en textos bilingües chino-inglés y en fragmentos de código. Lo desarrolla el usuario de Hugging Face `zhangyvjing` y parte del modelo base `intfloat/multilingual-e5-small`, sobre el que aplica una cirugía de vocabulario de 250k a 45k tokens y un proceso de cuantización W8/E8 con entrenamiento consciente de cuantización (QAT), exportado finalmente a ONNX INT8.

El modelo resuelve un problema concreto en el despliegue de agentes de código y pasarelas JSON: los sistemas de redacción existentes tienden a corromper identificadores de código y, al mismo tiempo, fallan en la detección de nombres chinos y entidades contractuales. JOSE-Redact v2 se posiciona como una segunda capa detrás de reglas deterministas de expresiones regulares y sumas de comprobación, con un enfoque de etiquetado BIOES y decodificación Viterbi restringida que evita transiciones ilegales entre etiquetas.

Con 38,9 millones de parámetros, 12 capas y una dimensión oculta de 384, el modelo ocupa 38,6 MB en disco y está diseñado para ejecutarse íntegramente en CPU mediante `onnxruntime` y `tokenizers`, sin dependencias de `torch` ni de `transformers`. Su relevancia actual radica en la demanda de soluciones de privacidad que funcionen en el borde (edge) y en entornos con recursos limitados, manteniendo una latencia de entre 6 y 26 ms en cargas cortas sobre un Apple M3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (base `intfloat/multilingual-e5-small`), 12 capas, dimensión oculta 384 |
| Parámetros totales | 38,93 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens con ventana deslizante y solapamiento de 64 tokens para textos largos |
| Tipos de cuantización | INT8 (W8 per-channel + E8 embedding, QAT) |
| Idiomas soportados | chino (zh), inglés (en) y código |
| Licencia | other |
| Formato de pesos | ONNX INT8 (acompañado de `remapper.json` y `tokenizer.json`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional derivado de `multilingual-e5-small`, con 12 capas y 384 dimensiones ocultas. La innovación principal en arquitectura es la cirugía de vocabulario sin pérdida: reduce el vocabulario original de 250k a 45k tokens conservando los términos frecuentes de inglés, chino y código, además de la base completa de caracteres atómicos, sin retroceso a `<unk>` y con `svd_rank=None`, de modo que la varianza de los embeddings no se pierde. La cabeza de clasificación produce 33 etiquetas (una `O` más 8 tipos de entidad en formato BIOES) y la decodificación se realiza con Viterbi restringida, que prohíbe transiciones como `O→I-X` o `B-X→E-Y`.

El entrenamiento empleó aproximadamente 34.300 ventanas: 8.000 de `nvidia/Nemotron-PII`, 8.000 de `ai4privacy/pii-masking-300k`, unas 2.500 ventanas de `text-anonymization-benchmark` para enseñar la distinción entre `DIRECT`/`QUASI` y `NO_MASK`, 3.500 funciones Python limpias reales como negativos duros (todas etiquetadas como `O`) y 12.000 muestras sintéticas programáticas con prefijos `[DOC]` y `[CHAT]`. Se realizaron 3 épocas con `bs=20` y `lr=3.5e-5`, con ventana deslizante de 512 tokens y solapamiento, y se verificó que no hubiera solapamiento por hash con los 9 conjuntos de evaluación antes de iniciar el entrenamiento. La cuantización se aplicó con QAT (W8 per-channel y E8 en embeddings) y se exportó a ONNX INT8 con alineación de consistencia numérica.

## Capacidades

- Detección y enmascarado de PII en chino, inglés y código, con 8 tipos de entidad: `PERSON`, `ORG_PRIVATE`, `CONTACT`, `ID_CREDENTIAL`, `LOCATION_EXACT`, `DOC_PROJECT_ID`, `SECRET_TECH` y `FINANCIAL_SENS`.
- Dos modos de operación: `doc` (documentos, contratos y registros, con tendencia a detectar más entidades) y `chat` (conversaciones y cargas de agentes, que preserva el objetivo de consulta del usuario mediante `KEEP_TARGET`).
- Enmascarado reversible mediante marcadores deterministas `{{KIND_8hex}}` basados en HMAC-SHA256, que permiten restaurar el texto original y mantener la tasa de acierto de la caché de prompts.
- Redacción de JSON y cargas de llamadas a herramientas que solo procesa los valores hoja de tipo cadena, sin tocar claves ni sintaxis.
- Capacidad de no enmascarar identificadores de código, nombres públicos, leyes públicas, correos de ejemplo y direcciones de bucle local, aprendida durante el entrenamiento como etiquetas `O`.
- Procesamiento de textos largos mediante ventana deslizante con alineación exacta de desplazamientos a nivel de carácter, incluidos textos CJK y UTF-8.
- Ejecución sin `torch` ni `transformers`, únicamente con `onnxruntime`, `tokenizers` y `numpy`.

## Casos de uso

- Pasarela de agentes de código: el modelo se sitúa como segunda capa detrás de reglas deterministas para redactar PII en las cargas que los agentes envían a APIs externas, sin corromper identificadores de código, gracias a su tasa de 0 % de funciones Python limpias alteradas en la evaluación.
- Redacción de contratos y documentación empresarial: en modo `doc` detecta nombres de personas, organizaciones privadas, números de contrato y datos de contacto en documentos largos, con ventanas de 512 tokens y solapamiento que evitan la truncación del final del texto.
- Cumplimiento de privacidad en registros y trazas: procesa registros de aplicaciones y los anonimiza antes de enviarlos a sistemas de observabilidad o de análisis, sustituyendo secretos, tokens, contraseñas, DSN e IPs internas por marcadores reversibles.
- Enmascarado de cargas JSON en integraciones: al procesar solo los valores hoja de tipo cadena, preserva la estructura y las claves del JSON, lo que lo hace adecuado para intermediarios que reenvían llamadas a herramientas sin romper el esquema.
- Protección de datos en conversaciones con usuarios: en modo `chat` redacta datos personales de los turnos de conversación manteniendo intacto el objetivo de la consulta, de modo que el modelo posterior puede seguir respondiendo a la pregunta original.
- Procesamiento en el borde y en dispositivos sin GPU: con 38,6 MB y ejecución exclusiva en CPU mediante `onnxruntime`, puede integrarse en portátiles, contenedores ligeros o entornos de escritorio con latencias de 6 a 26 ms en cargas cortas.
- Anonimización previa al ajuste fino o a la evaluación: permite limpiar corpus bilingües antes de utilizarlos en entrenamiento o evaluación, con la posibilidad de restaurar los marcadores gracias al mecanismo determinista.

## Benchmarks y rendimiento

Matriz externa de cero disparos sobre 9 conjuntos y 2.454 muestras, con `span_overlap_F1` en media macro (el conjunto `clean_oss_code` se puntúa como `1 − tasa de corrupción`):

| Modelo (parámetros) | macro | `pii_bench_zh` | `nemotron_pii` | `ai4privacy` | `redaction_bench` | `tab_echr` | Código corrompido | `real_user_chaos` | `doc_v1` | `chat_v1` |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **JOSE-Redact v2 12L (38,9M)** | **0,880** | 0,979 | **0,955** | 0,803 | 0,633 | **0,864** | **0,0 %** | 0,825 | 0,938 | 0,926 |
| `Horizon-Labs/pii-redactor-small` (141M) | 0,847 | 0,992 | 0,915 | 0,832 | 0,656 | 0,672 | 3,3 % | 0,870 | 0,846 | 0,873 |
| `CheezOne/pii-detector-cjk-small` (141M) | 0,814 | **0,991** | 0,776 | 0,802 | **0,670** | 0,768 | 6,0 % | 0,786 | 0,774 | 0,823 |
| `iiiorg/piiranha-v1` mDeBERTa (278M) | 0,653 | 0,686 | 0,613 | **0,980** | 0,545 | 0,372 | 4,3 % | 0,547 | 0,547 | 0,628 |
| Línea base de expresiones regulares (estilo Magpie / Sakura) | 0,395 | 0,571 | 0,160 | 0,184 | 0,185 | 0,000 | 0,0 % | 0,500 | 0,429 | 0,525 |

Datos de latencia y arranque declarados por el autor: 6–26 ms en textos cortos sobre Apple M3, y carga en frío de 0,33–0,63 s.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo está diseñado para ejecución en CPU; el peso INT8 ocupa 38,6 MB y la memoria residente se mantiene por debajo de 100 MB según el autor.
- GPU recomendadas: no disponibles; el modelo se distribuye como ONNX INT8 para `onnxruntime` y no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no se especifica; al ser un modelo de 38,9M de parámetros y 38,6 MB, cabría en cualquier GPU de consumo, pero no se han publicado datos de rendimiento en GPU.
- Opciones de despliegue: `onnxruntime` (con `tokenizers` y `numpy`), con scripts incluidos `setup.sh`, `jose-redact` (CLI) y `jose-redact-web` (servidor HTTP basado en biblioteca estándar). No requiere `torch` ni `transformers`.
- Latencia y throughput: 6–26 ms por carga corta en Apple M3; carga en frío de 0,33–0,63 s. No se han publicado cifras de throughput para lotes ni para otras plataformas.
- Hilos: el motor acepta `intra_op_threads` (por ejemplo, 4) para ajustar el paralelismo en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | macro (9 suites) | Código corrompido | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| **JOSE-Redact v2 12L INT8** | 38,9M | 512 tokens (ventana deslizante) | **0,880** | **0,0 %** | other | Hugging Face, ONNX INT8 |
| `Horizon-Labs/pii-redactor-small` | 141M | no disponible | 0,847 | 3,3 % | no disponible | Hugging Face |
| `CheezOne/pii-detector-cjk-small` | 141M | no disponible | 0,814 | 6,0 % | no disponible | Hugging Face |
| `iiiorg/piiranha-v1` (mDeBERTa) | 278M | no disponible | 0,653 | 4,3 % | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es una solución autónoma: el autor lo posiciona explícitamente como capa 2 detrás de reglas deterministas. Desactivar `use_layer1_rules` reduce la exhaustividad en entidades estructuradas como claves, JWT, PEM o documentos de identidad.
- Rendimiento débil en importes monetarios: la detección de cifras como `¥1,960,000` en contextos de precios no públicos es inferior a la de nombres de persona, según reconoce el autor.
- Dependencia obligatoria del remapeador: el vocabulario fue modificado de 250k a 45k tokens, por lo que es imprescindible usar el archivo `*_remapper.json` (tabla de consulta old-id → new-id); alimentar el tokenizador original de e5 con identificadores originales produce resultados incorrectos.
- Licencia `other`: no se detallan en la información disponible los términos exactos para uso comercial; es necesario consultar el texto completo de la licencia antes de un despliegue en producción.
- Cobertura lingüística limitada a chino, inglés y código; no se declaran otros idiomas.
- Riesgo de alucinación y falsos positivos inherente a un clasificador de tokens; el modo `doc` tiende a detectar más entidades, lo que puede incrementar el enmascarado de términos no sensibles.
- Ventana de contexto de 512 tokens: los textos largos dependen de la ventana deslizante con solapamiento de 64 tokens; no se documentan garantías sobre entidades que crucen los límites de la ventana.
- La versión de 6 capas destilada (28,3M, 27,7 MB, aproximadamente 2× más rápida en CPU) no está publicada en este repositorio y, según el autor, pierde rendimiento en textos legales largos y formularios reales no sintéticos.
- No se han publicado resultados de sesgos demográficos ni evaluaciones de equidad; los datos de entrenamiento incluyen conjuntos sintéticos y públicos cuya composición puede introducir sesgos no medidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhangyvjing/jose-redact-v2-12l-int8
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Conjunto de datos `nvidia/Nemotron-PII`: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Conjunto de datos `ai4privacy/pii-masking-300k`: https://huggingface.co/datasets/ai4privacy/pii-masking-300k
- Conjunto de datos `text-anonymization-benchmark`: https://huggingface.co/datasets/ai4privacy/text-anonymization-benchmark
- Modelo comparativo `Horizon-Labs/pii-redactor-small`: https://huggingface.co/Horizon-Labs/pii-redactor-small
- Modelo comparativo `CheezOne/pii-detector-cjk-small`: https://huggingface.co/CheezOne/pii-detector-cjk-small
- Modelo comparativo `iiiorg/piiranha-v1`: https://huggingface.co/iiiorg/piiranha-v1
