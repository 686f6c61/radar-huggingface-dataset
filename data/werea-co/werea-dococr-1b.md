# Werea-co/Werea-DocOCR-1B

## Resumen

Werea-DocOCR-1B es un modelo de visión-lenguaje especializado en OCR (reconocimiento óptico de caracteres) de documentos corporativos en turco, desarrollado por la empresa Werea. Se trata de un fine-tune del modelo base LightOnOCR-2-1B-base de LightOn, adaptado específicamente para extraer texto de documentos empresariales turcos como poderes notariales, pólizas DASK, facturas electrónicas, contratos de alquiler, extractos bancarios y escrituras de propiedad. El modelo genera el contenido de la página en orden de lectura, incluyendo tablas, en formato Markdown.

El modelo tiene aproximadamente 1.005 millones de parámetros y se distribuye con licencia Apache-2.0. Su relevancia radica en que el modelo base no incluía soporte para turco, y este fine-tune lo habilita para un dominio concreto (documentación corporativa) con una tasa de error de caracteres (CER) muy baja en datos sintéticos de prueba. Aunque la validación con documentos reales aún está en curso, los resultados preliminares sugieren que puede ser útil para automatizar la digitalización de documentos en entornos empresariales turcos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje (image-to-text) basada en LightOnOCR-2-1B-base |
| Parámetros totales | 1.005.647.872 (~1B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en LightOnOCR-2-1B-base, un modelo de generación condicional de imágenes a texto desarrollado por LightOn, diseñado para tareas de OCR y comprensión de documentos. La arquitectura concreta del modelo base no se detalla en la información disponible, pero al tratarse de un modelo de visión-lenguaje con pipeline image-to-text, se espera que combine un codificador visual con un decodificador de texto basado en transformers.

El entrenamiento de Werea-DocOCR-1B consistió en un fine-tune de parámetros completos (SFT) sobre el modelo base, utilizando el dataset sintético Werea-co/werea-tr-doc-ocr-synthetic, que contiene 3.000 páginas totalmente sintéticas de documentos corporativos turcos (con números de identificación y cuentas bancarias ficticias para evitar problemas de privacidad). El proceso se realizó durante 2 épocas, equivalentes a 375 pasos de optimización, con una tasa de aprendizaje de 1e-5, precisión bf16 y una GPU A100. No se menciona el uso de técnicas como RLHF o DPO; se trata únicamente de supervisión fina.

## Capacidades

- OCR de documentos completos: extrae texto de imágenes de páginas en orden de lectura, incluyendo tablas, y lo devuelve en formato Markdown.
- Comprensión de documentos corporativos turcos: adaptado específicamente para poderes notariales, pólizas DASK, facturas e-Arşiv, contratos de alquiler, extractos bancarios y escrituras de propiedad.
- Soporte de tablas: el modelo estructura el contenido tabular en Markdown, facilitando su posterior procesamiento.
- Generación de texto condicionada a imagen: dado un documento escaneado o fotografiado, produce una transcripción estructurada.
- Idiomas: únicamente turco; no se reportan capacidades multilingües.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni modos especiales de pensamiento.

## Casos de uso

- Digitalización de documentos legales: un bufete puede usar el modelo para transcribir poderes notariales y contratos de alquiler en turco, convirtiendo imágenes escaneadas en texto Markdown editable, reduciendo el trabajo manual de captura de datos.
- Automatización de facturación electrónica: en empresas que gestionan facturas e-Arşiv, el modelo puede extraer campos clave (emisor, importe, número de factura) de las imágenes, integrándose en pipelines de contabilidad.
- Procesamiento de pólizas de seguros: compañías aseguradoras pueden digitalizar pólizas DASK y otros documentos de seguros para indexarlos en sistemas de gestión documental, mejorando la búsqueda y el cumplimiento normativo.
- Verificación de extractos bancarios: en procesos de solicitud de crédito o auditoría, el modelo transcribe extractos bancarios en turco, permitiendo validar ingresos y movimientos de forma automatizada.
- Gestión de escrituras de propiedad: notarías y registros de la propiedad pueden convertir escrituras escaneadas en texto estructurado para facilitar su consulta y archivo.
- Asistencia en atención al cliente: un sistema de soporte puede recibir una imagen de un documento enviado por el usuario y generar un resumen o extraer datos relevantes para resolver consultas sin intervención manual.

## Benchmarks y rendimiento

Según la model card, el modelo fue evaluado en 30 páginas de test separadas (6 tipos de documento × 5 páginas) con generación greedy. Los resultados de CER (Character Error Rate) son los siguientes:

| Modelo | CER medio | CER mediana |
|---|---|---|
| LightOnOCR-2-1B-base | 64,17% | 61,64% |
| Werea-DocOCR-1B | 0,12% | 0,10% |

Desglose por tipo de documento tras el fine-tune:

| Tipo de documento | CER |
|---|---|
| Poder notarial | ~0,10% |
| Póliza DASK | ~0,10% |
| Factura e-Arşiv | ~0,08% |
| Contrato de alquiler | ~0,09% |
| Extracto bancario | ~0,19% |
| Escritura de propiedad | ~0,15% |

Es importante señalar que las páginas de test provienen de la misma distribución sintética que el entrenamiento (medición intra-plantilla), por lo que estos resultados pueden no reflejar el rendimiento en documentos reales escaneados o fotografiados.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener ~1.000 millones de parámetros, en bf16 se requieren aproximadamente 2 GB solo para los pesos; con overhead de activaciones y procesamiento de imagen, se estima un consumo de entre 4 y 6 GB en inferencia con precisión completa. Con cuantización de 8 bits podría reducirse a ~1-2 GB, aunque no se han publicado configuraciones oficiales.
- GPU recomendadas: una GPU consumer como la RTX 3060 (12 GB) o superior es suficiente para inferencia en bf16. Para entrenamiento se usó una A100, pero no es necesaria para despliegue.
- Compatibilidad con GPU consumer: sí, dado el tamaño del modelo, cabe en GPUs de gama media con 8 GB o más de VRAM.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con bibliotecas como vLLM, TGI o directamente con Hugging Face Transformers. También es compatible con endpoints de Hugging Face (indicado en los tags como `endpoints_compatible`).
- Latencia y throughput: no se han publicado datos específicos; dependerá del hardware y de la longitud de la secuencia generada (el modelo genera hasta 2048 tokens por defecto según el ejemplo de uso).

## Comparativa con modelos similares

La comparativa principal es con el modelo base LightOnOCR-2-1B-base, del cual deriva. No se dispone de información sobre otros modelos OCR comparables en turco en la documentación proporcionada.

| Modelo | Parámetros | Idioma | CER (test sintético) | Licencia |
|---|---|---|---|---|
| LightOnOCR-2-1B-base | ~1B | No incluye turco oficialmente | 64,17% | Apache-2.0 |
| Werea-DocOCR-1B | ~1B | Turco | 0,12% | Apache-2.0 |

No se dispone de datos de otros modelos OCR comerciales o de código abierto en turco para una comparación más amplia.

## Limitaciones y advertencias

- Los resultados de rendimiento se basan exclusivamente en datos sintéticos generados con las mismas plantillas que el entrenamiento; el rendimiento en documentos reales escaneados o fotografiados aún no ha sido validado.
- El modelo está limitado al idioma turco y a los tipos de documentos corporativos mencionados; puede no generalizar bien a otros idiomas o formatos de documento.
- Riesgo de alucinación: aunque el CER es bajo, el modelo podría generar texto plausible pero incorrecto en documentos ambiguos o dañados; se recomienda supervisión humana en aplicaciones críticas.
- Los datos de entrenamiento son sintéticos y contienen identificaciones ficticias; el modelo no ha sido entrenado con datos reales, lo que puede limitar su robustez ante variaciones reales de calidad de imagen.
- Licencia Apache-2.0 permite uso comercial, pero se debe atribuir el trabajo y mantener el aviso de licencia.
- No se especifican límites de contexto ni de resolución de imagen; el ejemplo de uso genera hasta 2048 tokens, lo que puede ser insuficiente para documentos muy largos.
- El modelo no soporta tool calling, agentes ni razonamiento complejo; es exclusivamente un extractor de texto de imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Werea-co/Werea-DocOCR-1B
- Dataset de entrenamiento: https://huggingface.co/datasets/Werea-co/werea-tr-doc-ocr-synthetic
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-2-1B-base
- Sitio web de Werea: https://werea.co
