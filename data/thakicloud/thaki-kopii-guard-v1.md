# ThakiCloud/Thaki-KoPII-Guard-v1

## Resumen

Thaki-KoPII-Guard-v1 es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto libre en coreano. Lo desarrolla ThakiCloud como un fine-tune de `klue/roberta-base` sobre el corpus sintético K-PII-Bench, y etiqueta 18 tipos distintos de datos personales (nombres, teléfonos, números de registro de residente, direcciones, cuentas bancarias, etc.) a nivel de span de caracteres, de modo que sistemas posteriores puedan enmascararlos.

El modelo resuelve un problema concreto de cumplimiento y privacidad: la anonimización automática de documentos en coreano antes de almacenarlos, procesarlos o enviarlos a otros sistemas. Frente a una línea base de expresiones regulares, que obtiene un F1 de entidad de 0,3232, el modelo alcanza un F1 de 0,9840 en el conjunto de test sellado de K-PII-Bench, con una mejora de recall especialmente marcada (0,1928 frente a 0,9935).

Se trata de un lanzamiento de investigación, no de un filtro de PII certificado para producción. Todos los números publicados provienen de un benchmark sintético y no se ha validado sobre documentos operativos reales. Con 110 millones de parámetros, es un modelo ligero que puede ejecutarse en CPU con latencias de decenas de milisegundos por documento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa), fine-tune de `klue/roberta-base` |
| Parametros totales | 110.055.973 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens por ventana (ventanas de 550 caracteres, stride 400) |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP32; no hay variantes INT8 ni mixtas) |
| Idiomas soportados | coreano (ko) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (FP32), mas `config.json`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo es un fine-tune de clasificación de tokens sobre `klue/roberta-base`, un encoder transformer de tipo RoBERTa adaptado al coreano. La cabeza de clasificación aplica un esquema BIO sobre 18 tipos de entidad: `PERSON`, `EMAIL_ADDRESS`, `KR_PHONE_NUMBER`, `KR_RRN`, `KR_BANK_ACCOUNT`, `KR_DRIVER_LICENSE`, `KR_PASSPORT`, `KR_NHIS`, `KR_VEHICLE_PLATE`, `KR_LOCATION`, `CREDIT_CARD`, `IP_ADDRESS`, `URL`, `USERNAME`, `ORGANIZATION`, `NRP`, `DATE_OF_BIRTH` y `PERSONAL_ATTRIBUTE`. El tokenizador es `BertTokenizer`, heredado de KLUE.

El entrenamiento y la evaluación se realizaron sobre el corpus sintético K-PII-Bench (revisión `844f92f7`, licencia CC BY 4.0), que no contiene datos de personas reales ni registros de AI Hub. No se documenta en la información disponible el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO, algo esperable en un modelo de clasificación. La innovación operativa destacable es el llamado modo híbrido, implementado en `kopii_guard.py`: combina el NER entrenado con reglas deterministas para RRN, correo electrónico, teléfono móvil e IPv4, donde las reglas prevalecen en caso de solapamiento. El procesamiento se hace por ventanas de 550 caracteres con stride 400 y un máximo de 384 tokens. En dev, el modo solo NER y el híbrido quedaron a 0,0001 de F1 (0,98532 frente a 0,98533), por lo que los pesos por sí solos reproducen prácticamente la misma calidad.

## Capacidades

- Detección y etiquetado de 18 tipos de PII coreana a nivel de span de caracteres, con salida BIO.
- Enmascaramiento (redacción) de texto mediante el pipeline híbrido `KoPIIGuard.review()`, que devuelve `redacted_text` y la lista de `spans`.
- Reconocimiento de entidades nombradas genéricas: personas, organizaciones y localizaciones.
- Detección de identificadores estructurados: tarjetas de crédito, RRN, pasaporte, permiso de conducir, matrícula de vehículo, número de seguro médico (NHIS), cuenta bancaria, correo, IP y URL.
- Procesamiento de documentos largos mediante ventanas deslizantes de 550 caracteres con solapamiento.
- Integración directa con `transformers` mediante `pipeline("token-classification", ...)` con `aggregation_strategy="simple"`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un etiquetador de tokens.
- Capacidad multilingüe limitada al coreano.

## Casos de uso

- Anonimización previa al almacenamiento: antes de guardar conversaciones de atención al cliente o correos en una base de datos, se pasa el texto por el pipeline híbrido para sustituir nombres, teléfonos y cuentas por marcadores; el recall de 0,9935 reduce el riesgo de dejar PII sin enmascarar.
- Cumplimiento normativo en pipelines de datos: como paso de preprocesado en un ETL que prepara documentos coreanos para analítica o entrenamiento, aplicando enmascaramiento selectivo por tipo de entidad (por ejemplo, conservar `ORGANIZATION` y ocultar `PERSON` y `KR_RRN`).
- Redacción de documentos antes de enviarlos a modelos externos: interponer el guard entre la aplicación y una API de LLM para que el texto que sale del perímetro no contenga identificadores personales.
- Moderación y revisión de contenido generado por usuarios: detectar y ocultar datos personales publicados en foros, reseñas o formularios antes de mostrarlos a otros usuarios.
- Auditoría de privacidad sobre corpus: ejecutar el etiquetador sobre un lote de documentos para cuantificar cuántos contienen PII y de qué tipos, usando los spans devueltos como base para informes.
- Enmascaramiento en flujos de OCR o digitalización: como etapa posterior al OCR de documentos escaneados en coreano, con la advertencia de que el modelo no se ha validado con ruido de OCR y puede requerir revisión humana.
- Preetiquetado para anotación humana: generar spans candidatos que un revisor corrige, aprovechando la latencia de 4,07 ms por documento en GPU para procesar grandes volúmenes.

## Benchmarks y rendimiento

Resultados en K-PII-Bench `test_track_a` (conjunto sellado, evaluado una sola vez). Métrica: coincidencia exacta de span `(start, end, type)`, micro-promediada, sin crédito parcial.

| Metrica | Baseline regex | KoPII-Guard (hibrido) |
|---|---|---|
| Precision de entidad | 0,9995 | 0,9747 |
| Recall de entidad | 0,1928 | 0,9935 |
| F1 de entidad | 0,3232 | 0,9840 |
| Documentos con al menos una entidad omitida | 1,000 | 0,0274 |
| Documentos con al menos un falso positivo | 0,0004 | 0,1088 |

Desglose por tipo en test:

| Tipo | Precision | Recall | F1 |
|---|---|---|---|
| CREDIT_CARD, DATE_OF_BIRTH, EMAIL_ADDRESS, IP_ADDRESS, KR_BANK_ACCOUNT, KR_DRIVER_LICENSE, KR_PASSPORT, KR_RRN, KR_VEHICLE_PLATE, URL | 1,000 | 1,000 | 1,000 |
| KR_PHONE_NUMBER | 0,999 | 1,000 | 0,999 |
| NRP | 0,998 | 0,998 | 0,998 |
| KR_NHIS | 1,000 | 0,995 | 0,997 |
| PERSON | 0,958 | 0,986 | 0,972 |
| ORGANIZATION | 0,926 | 0,985 | 0,955 |
| KR_LOCATION | 0,876 | 0,986 | 0,928 |

Latencia:

| Configuracion | Por documento |
|---|---|
| GPU, hibrido, ejecucion completa de test | p50 4,07 ms / p95 4,22 ms |
| CPU 4 hilos, forward NER, entrada de 34 tokens | p50 26 ms / p95 30 ms |

F1 en dev: 0,9853; F1 en test: 0,9840.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,5 GB en FP32 para los 110 millones de parámetros, más el overhead del runtime; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, funciona en RTX 3060, RTX 4090, A100 o H100 sin problema. La latencia reportada en GPU (p50 4,07 ms por documento) corresponde a la ejecución del autor.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre; también en CPU.
- Despliegue: `transformers` con `pipeline("token-classification")` o el script `kopii_guard.py` del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo encoder de clasificación no aplican los formatos GGUF habituales de los LLM generativos.
- Latencia y throughput: CPU con 4 hilos, p50 26 ms / p95 30 ms para una entrada de 34 tokens; GPU en modo híbrido, p50 4,07 ms / p95 4,22 ms por documento.
- Entorno probado: `torch 2.12.0` y `transformers 5.12.0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-KoPII-Guard-v1 | 110 M | 384 tokens por ventana | NER de PII en coreano | CC BY-SA 4.0 | HuggingFace |
| `klue/roberta-base` (base) | 110 M aprox. | 512 tokens | Modelo base de lenguaje coreano | no declarada en la model card | HuggingFace |
| Baseline regex (referencia del propio benchmark) | no aplica | no aplica | Deteccion de PII por patrones | no aplica | no aplica |

No se dispone en la información proporcionada de otros modelos comparables de detección de PII en coreano con métricas publicadas sobre el mismo benchmark, por lo que la comparación con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Estado de investigación: no es un filtro de PII certificado para producción; no se ha validado sobre documentos operativos reales.
- Sobreenmascaramiento: el 10,9 % de los documentos de test contienen al menos un falso positivo, concentrados en `PERSON` (1.757), `KR_LOCATION` (719) y `ORGANIZATION` (634). Para enmascarar el error va hacia ocultar de más, pero conviene revisarlo si se usa el etiquetador para otros fines.
- Omisiones concentradas en nombres: 579 de las 784 entidades omitidas (74 %) son `PERSON`.
- Solo datos sintéticos: los documentos de K-PII-Bench son generados; documentos reales con ruido de OCR, escrituras mixtas, formas de nombre poco frecuentes o contexto superior a 512 tokens pueden obtener peores resultados.
- Sin intervalos de confianza: no se calcularon IC emparejados frente al baseline porque no se almacenaron las predicciones por documento en la ejecución sellada.
- No se ha ejecutado una auditoría de extracción para descartar memorización de información personal, aunque el entrenamiento sea sintético.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia (ShareAlike), lo que puede condicionar su integración en productos propietarios.
- Idioma: únicamente coreano; no cubre PII en otros idiomas ni formatos internacionales más allá de los tipos definidos.
- No se publican variantes cuantizadas (INT8 o precisión mixta), solo pesos FP32.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Thaki-KoPII-Guard-v1
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-KoPII-Guard-v1/blob/main/MODEL_CARD.ko.md
- Script del modo híbrido: https://huggingface.co/ThakiCloud/Thaki-KoPII-Guard-v1/blob/main/kopii_guard.py
- Dataset K-PII-Bench: https://huggingface.co/datasets/woohyun212/k-pii-bench
- Modelo base KLUE RoBERTa: https://huggingface.co/klue/roberta-base
- Paper de KLUE (arXiv:2105.09680): https://arxiv.org/abs/2105.09680
