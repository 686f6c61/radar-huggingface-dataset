# waheedkhan05/Basarat-LFM3-VL-2B-OCR

## Resumen

Basarat (بصارت, "visión" o "perspicacia" en urdu) es un modelo visión-lenguaje especializado de 2.000 millones de parámetros, publicado por el usuario waheedkhan05 bajo la etiqueta de Aabshar AI, y afinado a partir de LiquidAI/LFM3-VL-2B. Su propósito es la digitalización de documentos paquistaníes: facturas de servicios (WAPDA, SNGPL, PTCL), libros de contabilidad manuscritos de comercios (کھاتہ), tarjetas CNIC de identidad y literatura en escritura nastaliq. La salida del modelo es JSON estructurado generado directamente a partir de fotografías tomadas con móvil, incluyendo casos con poca luz, desenfoque o inclinación.

El modelo resuelve un nicho escasamente cubierto por los modelos generalistas: el OCR de escritura nastaliq y de documentos administrativos pakistaníes, donde los pipelines de OCR convencionales rinden mal por la cursividad y las ligaduras de la escritura árabe-persa. Al estar construido sobre un backbone de solo 2B parámetros, está pensado para despliegue en entornos con recursos limitados, aunque la model card no detalla la longitud de contexto ni la composición exacta de los datos de entrenamiento.

Es relevante ahora porque combina dos tendencias: la especialización de modelos pequeños de visión-lenguaje en tareas documentales verticales y la conversión de imágenes de documentos en JSON listo para consumir por sistemas de gestión. No obstante, la ficha pública es muy escasa en detalles técnicos y no incluye métricas de evaluación, por lo que buena parte de las especificaciones figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje derivada de LiquidAI/LFM3-VL-2B (detalle de arquitectura interna no disponible) |
| Parametros totales | 2B (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Urdu (ur) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del vision-lenguaje LiquidAI/LFM3-VL-2B, un backbone de 2B parámetros que combina codificación visual y generación de texto. La model card no especifica la arquitectura interna del modelo base (tipo de encoder visual, mecanismo de atención ni estrategia de fusión multimodal), por lo que este dato figura como no disponible. La tarea declarada es image-to-text con salida en JSON estructurado.

Respecto al entrenamiento, la información pública solo indica los dominios objetivo (facturas de servicios, libros de contabilidad manuscritos, tarjetas CNIC y literatura nastaliq) y las condiciones de captura contempladas (poca luz, desenfoque, inclinación). No se documentan el número de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o preferencia. Tampoco se describen innovaciones técnicas específicas del fine-tuning.

## Capacidades

- OCR de documentos paquistaníes: facturas de WAPDA, SNGPL y PTCL.
- Reconocimiento de libros de contabilidad manuscritos e impresos de comercios (کھاتہ).
- Extracción de datos de tarjetas CNIC y documentos de verificación de identidad.
- Lectura de literatura clásica y moderna en escritura nastaliq.
- Generación de salida en JSON estructurado directamente desde imágenes.
- Robustez declarada ante fotos de móvil con poca luz, desenfoque y perspectiva inclinada.
- Soporte de urdu e inglés.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking mode), audio o vídeo: no disponible.

## Casos de uso

- Digitalización de facturas de servicios: el modelo recibe la foto de una factura de WAPDA, SNGPL o PTCL y devuelve los campos clave en JSON, lo que permite alimentar sistemas de conciliación de pagos o de gestión de suministros sin transcripción manual.
- Automatización contable de pequeños comercios: a partir de fotografías de libros de contabilidad manuscritos (کھاتہ), el modelo extrae entradas y saldos en formato estructurado, reduciendo el trabajo de digitalización de registros en papel.
- Verificación de identidad (KYC): extracción de los campos de tarjetas CNIC para procesos de alta de clientes, con validación posterior contra bases de datos.
- Procesamiento por lotes de archivos históricos en nastaliq: conversión de textos literarios escaneados en texto legible y estructurado para su catalogación o búsqueda.
- Aplicaciones móviles de captura en campo: al ser un modelo de 2B parámetros, es candidato a despliegue en entornos con GPU modestas para apps de digitalización de documentos en movilidad.
- Pipelines de ingestión documental: integración como etapa de extracción estructurada previa a un sistema de gestión documental o ERP, aprovechando la salida JSON nativa.
- Digitalización de archivos administrativos en oficinas públicas: tratamiento de lotes de facturas y formularios con fotos de móvil de baja calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por el tamaño de 2B parámetros, se sitúa previsiblemente en el rango de pocos GB en cuantización de 4-8 bits, aunque no hay cifras oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de 2B sugiere que podría caber en GPU de consumo, pero no hay datos publicados.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Basarat-LFM3-VL-2B-OCR | 2B | no disponible | ur, en | Apache 2.0 | OCR documental paquistani y nastaliq |
| LiquidAI/LFM3-VL-2B (base) | 2B | no disponible | no disponible | no disponible | Vision-lenguaje generalista |
| Modelos OCR generalistas de vision-lenguaje | no disponible | no disponible | multiple | variable | OCR general, sin especializacion en nastaliq |

No se dispone de datos de rendimiento comparativo entre Basarat y sus alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al estar entrenado con documentos paquistaníes, su rendimiento fuera de ese dominio es incierto.
- Riesgo de alucinación en la extracción de campos: al generar JSON, puede inventar valores cuando la imagen es ilegible o el documento no pertenece a los tipos entrenados; conviene validar la salida en producción.
- Idiomas limitados a urdu e inglés; no hay evidencia de soporte para otras lenguas.
- Longitud de contexto y límites de resolución de imagen no documentados.
- No se han publicado métricas de precisión, recall ni tasas de error por tipo de documento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (LiquidAI/LFM3-VL-2B) puede tener condiciones propias que conviene revisar antes de desplegar.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día, lo que indica ausencia de validación por parte de la comunidad.
- No hay información sobre cuantizaciones publicadas ni sobre formatos de pesos, lo que complica la planificación del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/waheedkhan05/Basarat-LFM3-VL-2B-OCR
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
