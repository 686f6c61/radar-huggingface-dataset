# Spyridon/camembert-base-pii-fr

## Resumen

CamemBERT French PII NER es un modelo de clasificación de tokens (token classification) afinado a partir de `almanach/camembert-base`, un transformer de estilo RoBERTa con arquitectura encoder-only y aproximadamente 111 millones de parámetros, especializado en francés. Su propósito es detectar información personal identificable (PII) en texto en francés, cubriendo 56 tipos de entidad que se traducen en 113 etiquetas en formato BIO. Lo desarrolla el usuario Spyridon y se distribuye bajo licencia MIT.

El problema que resuelve es la anonimización y el redactado automático de documentos: en lugar de depender de expresiones regulares frágiles, el modelo identifica entidades como nombres, correos, teléfonos, direcciones, IBAN, números de tarjeta, criptodirecciones y atributos personales de forma contextual. Esto lo hace relevante para pipelines de cumplimiento normativo (RGPD), tratamiento de documentos legales, sanitarios o financieros, y preprocesado de datos antes de alimentar otros sistemas.

El modelo se entrenó sobre el subconjunto en francés del dataset `ai4privacy/pii-masking-200k` (61.958 ejemplos) durante 3 épocas en una única GPU NVIDIA A10G, con una longitud máxima de secuencia de 128 tokens. En evaluación dentro de la misma distribución sintética alcanza un F1 de 0.94, mientras que en un conjunto fuera de distribución (`TheoDB/french-pii-eval`) cae a un F1 de 0.65, con un sesgo deliberado hacia el recall (0.87) frente a la precisión (0.51).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only estilo RoBERTa (CamemBERT) |
| Parametros totales | 110.118.257 (segun safetensors); 111M segun model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens maximos del modelo base; entrenado con max_seq_length 128 |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | token-classification (NER, esquema BIO) |
| Numero de etiquetas | 56 tipos de entidad, 113 etiquetas BIO |
| Modelo base | almanach/camembert-base |
| Pipeline HF | token-classification |
| Tamano del repo | 0.4 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base CamemBERT, un transformer encoder-only con atención bidireccional completa, equivalente en diseño a RoBERTa pero preentrenado sobre corpus en francés. Sobre esa base se añadió una cabeza de clasificación de tokens para resolver una tarea de NER supervisada con esquema BIO, con 113 etiquetas correspondientes a 56 tipos de entidad. Al ser un encoder puro, no dispone de generación autoregresiva; su salida es una etiqueta por token.

El afinado se realizó sobre el subconjunto en francés de `ai4privacy/pii-masking-200k`, con 61.958 ejemplos sintéticos. Los hiperparámetros fueron: 3 épocas, batch size 16 con acumulación de gradiente de 2, learning rate 5e-5, weight decay 0.01 y longitud máxima de secuencia de 128 tokens, sobre una sola GPU NVIDIA A10G. La model card no menciona el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional más allá del propio afinado supervisado. La innovación práctica reside en la amplitud de la taxonomía de PII (criptomonedas, credenciales de tarjeta, BIC/IBAN, MAC/IP, atributos físicos, etc.) y en el sesgo explícito hacia el recall para priorizar la seguridad del redactado.

## Capacidades

- Detección de entidades PII en francés sobre 56 tipos, agrupados en: nombres, contacto, dirección, identificadores y números, fechas, criptomonedas, atributos personales y otros (contraseñas, importes, divisas).
- Etiquetado a nivel de token con esquema BIO y agregación de spans mediante `aggregation_strategy="simple"` en el pipeline de HuggingFace.
- Reconocimiento de entidades sensibles como `IBAN`, `CREDITCARDNUMBER`, `CREDITCARDCVV`, `SSN`, `PASSWORD`, `PIN`, `BITCOINADDRESS`, `ETHEREUMADDRESS`, `LITECOINADDRESS`, `VEHICLEVIN`, `MAC`, `IPV4`, `IPV6`.
- Atributos personales: `AGE`, `GENDER`, `SEX`, `EYECOLOR`, `HEIGHT`, `JOBTITLE`, `JOBAREA`, `JOBTYPE`, `COMPANYNAME`.
- Integración con pipelines de redacción de PDF: la model card menciona un pipeline complementario que mapea los spans detectados de vuelta a las cajas de palabra del PDF y aplica anotaciones de redacción.
- No soporta generación de texto, tool calling, function calling, agentes ni razonamiento multi-paso, ya que es un modelo discriminativo encoder-only.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento ("thinking mode").
- Capacidad multilingüe: solo francés.

## Casos de uso

- Anonimización de documentos legales: el modelo etiqueta nombres, direcciones, IBAN y números de identificación en contratos y expedientes antes de archivarlos o compartirlos, reduciendo el riesgo de incumplimiento del RGPD.
- Redacción de PDF: combinado con el pipeline de mapeo de spans a cajas de palabra, permite enmascarar automáticamente PII en documentos escaneados o nativos antes de su publicación.
- Preprocesado de datos sanitarios: detección de `DOB`, `PHONENUMBER`, `EMAIL` y `SSN` para desidentificar historiales clínicos en francés antes de usarlos en investigación.
- Filtrado en atención al cliente: identificación de datos personales en transcripciones o correos entrantes para redactarlos antes de enviarlos a sistemas externos o a proveedores.
- Cumplimiento en servicios financieros: detección de `CREDITCARDNUMBER`, `IBAN`, `BIC` y `ACCOUNTNUMBER` en logs y documentos, utiles para auditorías de fuga de datos.
- Enriquecimiento de pipelines de datos: extracción de entidades estructuradas (fechas, importes, divisas, ubicaciones) para alimentar bases de datos o motores de búsqueda a partir de texto libre.
- Moderación o saneado de contenido generado por usuarios: marcado de datos personales antes de almacenar o mostrar comentarios en plataformas en francés.
- Análisis forense de documentos: localización de criptodirecciones y credenciales en material incautado o investigado.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Precision | Recall | F1 |
|---|---|---|---|
| Held-out interno (misma distribucion sintetica) | 0.94 | 0.95 | 0.94 |
| Out-of-distribution `TheoDB/french-pii-eval` (8 clases, span exact match) | 0.51 | 0.87 | 0.65 |

F1 por clase en `TheoDB/french-pii-eval`:

| Clase | F1 |
|---|---|
| private_email | 0.93 |
| private_date | 0.82 |
| private_phone | 0.76 |
| private_address | 0.72 |
| account_number | 0.68 |
| private_person | 0.63 |
| private_url | 0.37 |
| secret | 0.33 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Inferencia en FP32: aproximadamente 440 MB de pesos (110M parametros), mas activaciones; cabe en CPU.
- Inferencia en FP16: aproximadamente 220 MB; apto para cualquier GPU consumer.
- Inferencia en INT8: aproximadamente 110 MB; ejecutable en CPU y en GPUs integradas.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM; probado por el autor en NVIDIA A10G para entrenamiento, lo que no implica requisitos similares en inferencia.
- Cabe en GPU consumer: si, en cualquier modelo moderno (GTX 1060 6GB, RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: pipeline `transformers` de HuggingFace; compatible con exportaciones a ONNX y TorchScript; desplegable vía Text Embeddings Inference no aplica (no es embedding), pero si mediante inferencia generica con `transformers`, ONNX Runtime o TorchServe. No se documenta soporte especifico de vLLM (modelo encoder-only) ni de llama.cpp/Ollama (requieren formato GGUF no publicado).
- Latencia y throughput estimados: no disponible. Se desconoce cualquier cifra publicada de latencia o tokens por segundo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks ni datos comparativos publicados para modelos equivalentes de deteccion de PII en frances en la informacion proporcionada. Como referencia de categoria, podrian considerarse variantes de CamemBERT afinadas para NER general o modelos multilinguales tipo XLM-R, pero no hay datos verificables en la informacion disponible para establecer la comparacion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spyridon/camembert-base-pii-fr | 110M | 128 (entrenado) / 512 (base) | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgo hacia el recall: en distribuciones fuera del entrenamiento, la precision cae a 0.51, lo que implica un numero elevado de falsos positivos. Es intencionado para tareas de anonimizacion, pero inadecuado si se busca extraccion precisa.
- Degradacion fuera de distribucion: el F1 pasa de 0.94 en el held-out sintetico a 0.65 en `TheoDB/french-pii-eval`, con clases especialmente debiles como `private_url` (0.37) y `secret` (0.33).
- Dependencia de datos sinteticos: el entrenamiento se realizo sobre PII generada sinteticamente, lo que puede no reflejar la distribucion real de documentos franceses (formatos de direccion, numeros de telefono o IBAN reales).
- Longitud de contexto efectiva limitada: aunque el modelo base soporta hasta 512 tokens, el entrenamiento se hizo con max_seq_length 128; no se documenta el comportamiento en secuencias mas largas.
- Solo frances: no cubre otros idiomas ni variantes regionales fuera del frances.
- Riesgo de alucinacion: al ser un modelo de clasificacion de tokens no genera texto, por lo que el riesgo de alucinacion se manifiesta como etiquetado incorrecto de spans (falsos positivos o negativos), no como contenido inventado.
- Sesgos potenciales: no se documenta analisis de sesgos por genero, origen o edad en la deteccion de entidades como `GENDER`, `SEX` o nombres propios.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias ni soporte.
- Sin garantias de produccion: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, con fecha de creacion y actualizacion en 2026; no hay evidencia de uso en produccion ni de validacion externa.
- Redaccion de PDF: la funcionalidad de redaccion depende de un pipeline complementario no incluido en el repositorio del modelo, por lo que no es utilizable de forma autonoma para ese fin.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Spyridon/camembert-base-pii-fr
- Modelo base: https://huggingface.co/almanach/camembert-base
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4privacy/pii-masking-200k
- Dataset de evaluacion out-of-distribution: https://huggingface.co/datasets/TheoDB/french-pii-eval
