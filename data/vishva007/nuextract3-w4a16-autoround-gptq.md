# Vishva007/NuExtract3-W4A16-AutoRound-GPTQ

## Resumen

NuExtract3-W4A16-AutoRound-GPTQ es una versión cuantizada del modelo NuExtract3 de NuMind, un modelo de visión-lenguaje (VLM) de 4.000 millones de parámetros especializado en comprensión de documentos, extracción estructurada de datos y conversión de imagen a Markdown. Esta variante concreta, publicada por Vishva007, aplica una cuantización W4A16 (pesos de 4 bits, activaciones de 16 bits) mediante el algoritmo AutoRound de Intel, lo que reduce drásticamente los requisitos de memoria manteniendo la precisión en tareas de OCR y extracción de información.

El modelo base NuExtract3 está construido sobre una arquitectura derivada de Qwen3.5 (según el tag `qwen3_5`) e incorpora una torre de visión que se mantiene en BF16 en esta cuantización para preservar la calidad del procesamiento visual. El resultado es un modelo que puede ejecutarse en GPUs de consumo con 4-6 GB de VRAM, lo que lo hace accesible para despliegues locales de extracción de documentos, facturas, formularios y otros documentos escaneados. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM basado en Qwen3.5 con torre de visión (vision tower) |
| Parametros totales | 4.539.265.536 (4,5 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (configuración de vLLM en la documentación) |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), Group Size 32, simétrico |
| Idiomas soportados | No disponible (el modelo base es multilingüe, sin lista específica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponible en variantes AutoRound y LLM-Compressor) |

## Arquitectura y entrenamiento

El modelo base NuExtract3 es un VLM unificado de 4 B parámetros diseñado para razonamiento sobre documentos. Combina un codificador de visión con un decoder de lenguaje basado en la arquitectura Qwen3.5, permitiendo procesar imágenes de documentos y generar salidas estructuradas en JSON o Markdown. El entrenamiento original se centró en tareas de extracción de información, OCR y conversión de documentos escaneados a texto estructurado, con soporte multilingüe.

La cuantización W4A16 se realizó con Intel AutoRound (v0.14.2) sobre el modelo base. Se utilizaron 512 muestras de calibración con secuencias de 4096 tokens y 1000 iteraciones de ajuste. La torre de visión se mantuvo en BF16 para no degradar la precisión en tareas visuales, y los módulos de predicción multi-token (MTP) también se conservaron en BF16. El resultado es un modelo con pesos de 4 bits que reduce la huella de memoria de aproximadamente 9-11 GB (BF16) a 2,8-3,5 GB.

## Capacidades

- Extracción de datos estructurados en formato JSON a partir de imágenes de documentos (facturas, recibos, formularios, contratos).
- Conversión de imágenes de documentos a Markdown (OCR de alta calidad).
- Comprensión de documentos escaneados, tablas, formularios y texto manuscrito o impreso.
- Razonamiento multimodal: combina información visual y textual para responder consultas sobre el contenido del documento.
- Soporte de plantillas de extracción personalizables mediante `chat_template_kwargs` (por ejemplo, definir campos como `invoice_number`, `date`, `total`).
- Capacidad de procesar múltiples imágenes por prompt (hasta 10 según la configuración de vLLM).
- Integración con vLLM mediante API compatible con OpenAI, lo que facilita su uso en pipelines de producción.

## Casos de uso

- Automatización de procesos de facturación: el modelo extrae automáticamente número de factura, fecha, importe total y líneas de detalle de facturas escaneadas, integrándose en sistemas ERP mediante la API de vLLM.
- Digitalización de archivos históricos: convierte documentos antiguos escaneados a Markdown estructurado, facilitando su indexación y búsqueda en sistemas de gestión documental.
- Preprocesamiento para RAG: transforma PDFs, contratos y formularios en texto estructurado que puede alimentar bases vectoriales para sistemas de recuperación aumentada.
- Atención al cliente automatizada: extrae datos de formularios enviados por usuarios (reclamaciones, solicitudes) y los convierte en JSON para sistemas de ticketing.
- Análisis de contratos: identifica cláusulas, fechas y partes involucradas en contratos legales escaneados, reduciendo el trabajo manual de revisión.
- Extracción de datos de tarjetas de visita o credenciales: convierte imágenes de tarjetas en contactos estructurados (nombre, empresa, email) para CRM.
- Procesamiento de formularios médicos: extrae campos como nombre del paciente, diagnóstico y medicación de formularios clínicos escaneados, manteniendo la privacidad al ejecutarse localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas comparativas (MMLU, HumanEval, etc.) ni evaluaciones específicas de extracción de documentos. Se recomienda consultar la documentación del modelo base NuExtract3 para obtener datos de rendimiento en tareas de comprensión de documentos.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,8-3,5 GB con cuantización W4A16 (según la model card), frente a 9-11 GB del modelo base en BF16.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, incluyendo tarjetas de consumo como GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como T4, L4 o A10.
- Compatible con GPUs de consumo de gama baja (4-6 GB) gracias a la cuantización.
- Opciones de despliegue: vLLM (recomendado, con soporte nativo para el formato GPTQ), también compatible con AutoGPTQ y LLM-Compressor. Se puede servir mediante API OpenAI-compatible.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo de 4 B cuantizado, se espera una latencia baja en GPUs modernas. La configuración de vLLM permite ajustar `--gpu-memory-utilization` para optimizar el uso de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| NuExtract3 (base) | 4 B | 16 K (estimado) | Apache 2.0 | VLM para extracción de documentos |
| NuExtract3-W4A16 (este modelo) | 4 B (cuantizado) | 16 K | Apache 2.0 | Versión cuantizada para despliegue ligero |
| LayoutLMv3 | ~125 M-400 M | 512 | MIT | Modelo de comprensión de documentos basado en texto, sin visión multimodal |
| Donut | ~200 M | 512 | MIT | VLM para OCR y extracción, menor capacidad |

La comparativa directa con otros modelos de extracción de documentos es limitada porque NuExtract3 es un modelo relativamente nuevo y específico. La principal ventaja de esta versión cuantizada es su bajo requisito de VRAM, que permite ejecutarlo en hardware de consumo sin sacrificar la funcionalidad del modelo base.

## Limitaciones y advertencias

- No se han publicado benchmarks oficiales para esta cuantización, por lo que el rendimiento exacto en tareas de extracción no está verificado de forma independiente.
- La cuantización W4A16 puede introducir ligeras pérdidas de precisión en comparación con el modelo BF16, especialmente en tareas de razonamiento complejo o con documentos muy densos.
- El modelo base es multilingüe, pero no se especifica la lista de idiomas soportados; el rendimiento puede variar según el idioma del documento.
- Riesgo de alucinación en campos extraídos si el documento es ambiguo o de baja calidad; se recomienda validar las salidas en producción.
- La longitud de contexto de 16 K tokens puede ser insuficiente para documentos muy extensos; en esos casos se requiere segmentación previa.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base y la cuantización dependen de componentes de terceros (Qwen3.5, AutoRound) cuyas licencias deben verificarse.
- No se proporcionan garantías de soporte ni mantenimiento por parte del autor de la cuantización; se recomienda evaluar el modelo en un entorno de pruebas antes de producción.

## Enlaces

- Modelo cuantizado (GPTQ): https://huggingface.co/Vishva007/NuExtract3-W4A16-AutoRound-GPTQ
- Modelo cuantizado (AutoRound): https://huggingface.co/Vishva007/NuExtract3-W4A16-AutoRound
- Modelo cuantizado (LLM-Compressor): https://huggingface.co/Vishva007/NuExtract3-W4A16-AutoRound-LLM-Compressor
- Modelo base NuExtract3: https://huggingface.co/numind/NuExtract3
- Repositorio de NuExtract en GitHub: https://github.com/numindai/nuextract
- Plataforma NuExtract: https://nuextract.ai/
- Intel AutoRound: https://github.com/intel/auto-round
