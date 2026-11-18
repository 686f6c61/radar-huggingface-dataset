# syntriq/tarn-german-pii-gliner-base

## Resumen

Tarn German PII GLiNER es un modelo de reconocimiento de entidades nombradas (NER) especializado en la deteccion de datos personales identificables (PII) en textos en aleman. Lo desarrolla Syntriq Labs y se presenta como un *fine-tune* de `urchade/gliner_multi_pii-v1`, el modelo por defecto del reconocedor GLiNER de Microsoft Presidio. Su proposito es sustituir ese modelo base en pipelines de anonimizacion en aleman con una mejora sustancial de precision y exhaustividad, incluyendo identificadores administrativos alemanes especificos (Steuer-ID, Sozialversicherungsnummer, Lebensversicherungsnummer, matricula de vehiculo, numero de colegiado medico, entre otros).

El modelo emplea la arquitectura GLiNER, un esquema de NER zero-shot basado en un encoder transformer que puntua pares (entidad, etiqueta) sobre una ventana de texto, sin depender de una lista fija de clases. Cuenta con 288.949.504 parametros y un limite de lectura de 384 palabras por inferencia, por lo que los textos largos deben trocearse en ventanas solapadas, tal como hace el reconocedor de Presidio.

Es relevante ahora porque la mayoria de herramientas de anonimizacion (Presidio incluido) dependen de modelos multilingues genericos que rinden de forma irregular en aleman, especialmente con identificadores nacionales. Este modelo se entrena especificamente para 19 etiquetas de PII en aleman y publica una comparativa frente al modelo base en un benchmark sintetico propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (encoder transformer con puntuacion de pares entidad-etiqueta, NER zero-shot) |
| Parametros totales | 288.949.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 palabras por ventana de inferencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | aleman (de) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | gliner |
| Pipeline | token-classification |
| Modelo base | urchade/gliner_multi_pii-v1 (revision 1fcf13e8) |
| Tamano del repositorio | 1,2 GB |
| Dataset de entrenamiento | 49.350 documentos sinteticos en aleman (syntriq/german-pii-benchmark) |

## Arquitectura y entrenamiento

El modelo parte de `urchade/gliner_multi_pii-v1` y conserva el esquema GLiNER: un encoder transformer que recibe el texto y un conjunto de etiquetas en lenguaje natural, y produce puntuaciones de similitud para cada par (span, etiqueta). Esto permite definir entidades en tiempo de inferencia sin reentrenar, algo que Presidio aprovecha para mapear etiquetas a tipos de entidad reconocidos por su `AnalyzerEngine`.

El *fine-tune* se realizo sobre 49.350 documentos sinteticos en aleman, troceados en ventanas de 200 palabras, aplicando las 19 etiquetas en cada ventana. Se entreno durante 1 epoca con learning rate de 1e-5 para el encoder y 5e-5 para las capas de spans, con un ancho maximo de span de 16 palabras. El checkpoint y el umbral (0,5) se seleccionaron sobre el *split* de validacion. Las 19 etiquetas cubren: persona, correo electronico, telefono, direccion, fecha de nacimiento, IBAN, tarjeta de credito, IP, numero de cliente, Steuer-ID, Steuernummer, numero de seguridad social, numero de seguro de salud, numero de documento de identidad, numero de pasaporte, numero de carnet de conducir, matricula de vehiculo, numero de colegiado medico (LANR) y numero de consulta medica (BSNR).

## Capacidades

- Deteccion de PII en textos en aleman mediante NER zero-shot con etiquetas definidas en inferencia.
- Reconocimiento de 19 tipos de entidad, incluidos identificadores administrativos alemanes especificos (Steuer-ID, Steuernummer, Sozialversicherungsnummer, Krankenversicherungsnummer, Personalausweisnummer, Reisepassnummer, Fuehrerscheinnummer, KFZ-Kennzeichen, LANR, BSNR).
- Integracion directa con Microsoft Presidio mediante `GLiNERRecognizer` y mapeo de etiquetas a tipos de entidad de Presidio.
- Sustitucion en una linea del modelo por defecto de Presidio (`urchade/gliner_multi_pii-v1`), manteniendo las mismas *prompts* y la misma libreria.
- Procesamiento por ventanas solapadas para textos largos (limite de 384 palabras por ventana).
- No soporta tool calling, agentes, vision, audio ni modo *thinking*; es un modelo puramente de clasificacion de tokens.
- Las etiquetas fuera de las 19 entrenadas no estan afinadas y revierten al comportamiento del modelo base.

## Casos de uso

- **Anonimizacion de documentos legales y administrativos en aleman**: el modelo detecta Steuer-ID, Steuernummer y numeros de seguridad social que los modelos multilingues genericos suelen pasar por alto; se integra en un pipeline Presidio que sustituye las entidades por placeholders antes de almacenar o compartir el texto.
- **Cumplimiento del RGPD en *pipelines* de datos**: como paso previo a la ingesta de textos en sistemas analiticos, se ejecuta el reconocedor sobre cada documento para enmascarar PII y dejar trazabilidad de los tipos de entidad encontrados.
- **Redaccion de historiales clinicos**: con las etiquetas LANR (numero de colegiado medico) y BSNR (numero de consulta), el modelo permite enmascarar identificadores de profesionales y centros sanitarios en informes medicos antes de usarlos en investigacion.
- **Preprocesamiento de *corpus* para entrenamiento de modelos**: se aplica sobre grandes volumenes de texto aleman para eliminar PII antes de que el *corpus* se use en *fine-tuning*, reduciendo el riesgo de memorizacion de datos personales.
- **Atencion al cliente automatizada**: en un *chatbot* o sistema de ticketing en aleman, el modelo filtra la conversacion antes de registrarla o enviarla a un proveedor externo, enmascarando nombres, direcciones, IBAN y telefonos.
- **Auditoria de ficheros y bases de datos**: se ejecuta como *scanner* sobre exportaciones de texto para localizar columnas o documentos con PII no declarada, usando las puntuaciones por entidad para priorizar revisiones manuales.
- **Sustitucion directa en despliegues Presidio existentes**: organizaciones que ya usan el reconocedor GLiNER de Presidio solo necesitan cambiar `model_name` y el mapeo de etiquetas para obtener el modelo afinado en aleman, sin reescribir el pipeline.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el benchmark sintetico `syntriq/german-pii-benchmark`, con umbral 0,5 calibrado en validacion, ventanas de 1.000 caracteres con solapamiento de 300 y las mismas 19 *prompts* para ambos modelos:

| Modelo | Masked recall | Masked precision | Strict F1 |
|---|---|---|---|
| syntriq/tarn-german-pii-gliner-base | 0,997 | 0,997 | 0,991 |
| urchade/gliner_multi_pii-v1 | 0,892 | 0,875 | 0,687 |

El propio autor advierte que el benchmark es sintetico y que los valores de los identificadores provienen de los mismos generadores que los datos de entrenamiento, por lo que los resultados en documentos reales seran inferiores. No se han publicado resultados en benchmarks independientes (p. ej. MMLU, HumanEval) porque no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,2 GB de pesos, mas overhead del runtime; en la practica cabe en cualquier GPU con 4 GB o mas.
- VRAM estimada en fp16/bf16: aproximadamente 0,6 GB de pesos, holgadamente dentro de GPUs de consumo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para alto throughput en servidor, A100 o H100 no son necesarias pero permiten mayor paralelismo por lote.
- Cabe en GPU de consumo: si, incluidas GPUs de gama baja y, con cuantizacion, en CPU.
- Opciones de despliegue: libreria `gliner` (via `GLiNER.from_pretrained`), Microsoft Presidio con `GLiNERRecognizer`, y exportacion a ONNX si el runtime lo soporta; no se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento en aleman (benchmark del autor) |
|---|---|---|---|---|---|
| syntriq/tarn-german-pii-gliner-base | 288,9 M | 384 palabras | Apache-2.0 | GLiNER afinado, 19 etiquetas de PII en aleman | Strict F1 0,991 |
| urchade/gliner_multi_pii-v1 | no disponible | 384 palabras | Apache-2.0 (segun modelo base) | GLiNER multilingue de PII, modelo por defecto de Presidio | Strict F1 0,687 |
| Modelos NER de spaCy en aleman (p. ej. `de_core_news_lg`) | no disponible | limitado por el pipeline | MIT | NER supervisado con clases fijas (PER, LOC, ORG, MISC) | no disponible; no cubre identificadores administrativos |

La comparativa directa solo es posible frente al modelo base, que es el unico con el que el autor publica mediciones. Frente a NER clasico de spaCy, la diferencia clave es que GLiNER permite definir etiquetas en inferencia y cubre identificadores que los esquemas fijos no contemplan.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: el rendimiento en documentos reales sera inferior al del benchmark, que el propio autor califica de optimista.
- Solo aleman: no se ha entrenado ni evaluado en otros idiomas.
- La deteccion no equivale a anonimizacion legal: el modelo identifica entidades, pero el cumplimiento del RGPD requiere revision humana y controles adicionales.
- Las etiquetas fuera de las 19 entrenadas no estan afinadas y revierten al comportamiento del modelo base, con calidad no garantizada.
- Limite de 384 palabras por ventana: textos mas largos requieren troceado con solapamiento, lo que puede duplicar detecciones en los bordes si no se gestiona.
- Riesgo de falsos negativos en identificadores con formatos no vistos durante el entrenamiento sintetico.
- Riesgo de alucinacion de entidades: como todo modelo de puntuacion, puede marcar spans que no son PII con puntuaciones altas segun el umbral elegido.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `urchade/gliner_multi_pii-v1`.
- Sin descargas ni *likes* en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syntriq/tarn-german-pii-gliner-base
- Modelo base: https://huggingface.co/urchade/gliner_multi_pii-v1
- Dataset de benchmark: https://huggingface.co/datasets/syntriq/german-pii-benchmark
- Repositorio GLiNER: https://github.com/urchade/GLiNER
- Microsoft Presidio: https://github.com/microsoft/presidio
- Imagen de comparativa de benchmark: https://huggingface.co/syntriq/tarn-german-pii-gliner-base/resolve/main/assets/benchmark.png
