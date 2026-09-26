# thoweck/invoice-qwen3-4b-de-GGUF

## Resumen

invoice-qwen3-4b-de-GGUF es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario thoweck en HuggingFace, orientado a la extracción de campos de facturas (invoice field extraction) dentro de la aplicación "Invoice Renamer". El repositorio contiene únicamente pesos en formato GGUF, lo que lo hace directamente consumible por llama.cpp, Ollama y otros motores compatibles con dicho formato, sin necesidad de conversión previa.

El modelo parte de una arquitectura transformer densa de 4.022.468.096 parámetros (aproximadamente 4B), heredada íntegramente del modelo base de Qwen, y fue adaptado mediante QLoRA según indica la propia model card del autor. El sufijo "-de" del identificador sugiere un enfoque sobre facturas en alemán, aunque esto no se confirma explícitamente en la documentación disponible.

Su relevancia es acotada y muy específica: no compite como modelo generalista, sino como extractor especializado de campos estructurados a partir de documentos de facturación, un caso de uso recurrente en automatización de cuentas por pagar, contabilidad y digitalización documental. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no incluye resultados de evaluación ni detalles del conjunto de datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507); no se documentan cambios estructurales |
| Parámetros totales | 4.022.468.096 (dato real de safetensors del modelo base) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base Qwen3-4B-Instruct-2507; no se documenta si el ajuste la modifica |
| Tipos de cuantización | Formato GGUF; el repositorio no detalla los niveles concretos incluidos (tamaño total del repo: 2,5 GB) |
| Idiomas soportados | No disponible en la ficha del autor; el sufijo "-de" apunta a alemán, sin confirmación explícita |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Método de ajuste | QLoRA (según la model card) |
| Fecha de creación del repo | 2026-09-26 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer denso decoder-only de aproximadamente 4.000 millones de parámetros, con atención completa y sin componentes de mezcla de expertos. Sobre esta base, el autor aplicó un ajuste fino supervisado mediante QLoRA, técnica que congela los pesos originales en precisión reducida y entrena adaptadores de bajo rango, lo que reduce drásticamente los requisitos de memoria durante el entrenamiento. No se especifica el rango de los adaptadores, la tasa de aprendizaje, el número de pasos ni si los adaptadores se fusionaron posteriormente con los pesos base antes de la conversión a GGUF.

La información pública sobre el entrenamiento es mínima: no se publica el número de tokens utilizados, la composición del dataset, el origen de las facturas empleadas, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, modos de razonamiento extendido, etc.). Dado que el modelo base Qwen3-4B-Instruct-2507 incorpora modo no-thinking por defecto y capacidades de tool calling, es razonable esperar que parte de estas funciones se conserven, pero el autor no lo confirma y el ajuste especializado podría haber degradado capacidades generales por olvido catastrófico.

## Capacidades

- Extracción de campos estructurados de facturas: es la función declarada explícitamente en la model card y el propósito para el que fue ajustado.
- Generación de texto conversacional: el repositorio está etiquetado como "conversational" y deriva de un modelo instruct, por lo que mantiene formato de chat, aunque sin evaluación publicada.
- Aplicación específica "Invoice Renamer": el ajuste se realizó para integrarse en esa herramienta de renombrado de facturas.
- Soporte de tool calling / function calling: probable por herencia de Qwen3-4B-Instruct-2507, no confirmado por el autor ni evaluado tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste concreto.
- Capacidades multilingües: no documentadas; el sufijo "-de" sugiere foco en alemán, pero no hay lista de idiomas en la ficha.
- Visión, audio o modo thinking: no disponibles (el modelo base es exclusivamente de texto).

## Casos de uso

- Automatización de cuentas por pagar: el modelo puede recibir el texto de una factura y devolver los campos relevantes (número de factura, fecha, emisor, importe, NIF/CIF) en un formato estructurado, reduciendo la introducción manual de datos en sistemas ERP.
- Renombrado automático de archivos de facturas: es el caso de uso declarado por el autor; el modelo extrae identificadores del documento y la aplicación "Invoice Renamer" los usa para construir nombres de archivo consistentes.
- Digitalización de archivos contables históricos: procesamiento por lotes de PDFs convertidos a texto para poblar bases de datos contables, aprovechando que el modelo es pequeño y puede ejecutarse en local sin enviar documentos sensibles a servicios en la nube.
- Preprocesado en pipelines OCR + LLM: combinado con un motor OCR (Tesseract, PaddleOCR), el modelo actúa como capa de estructuración que transforma texto crudo en JSON de campos, un patrón habitual en extracción documental.
- Validación de facturas entrantes: extracción de campos y comparación posterior contra la orden de compra o el registro de proveedores para detectar discrepancias de importe o datos fiscales.
- Despliegue en local con requisitos mínimos: al ser un GGUF de ~4B, puede ejecutarse en portátiles o en servidores sin GPU para tareas de extracción batch, lo que encaja en entornos con restricciones de privacidad o de coste.
- Clasificación y enrutado de documentos: aunque no es su función declarada, un modelo instruct de este tamaño puede emplearse para decidir si un documento es una factura o no antes de aplicar la extracción completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas de exactitud de extracción de campos (por ejemplo, precisión por campo, F1, o exact match a nivel de documento), ni comparaciones con otros extractores. Tampoco hay resultados de MMLU, HumanEval, GSM8K u otras evaluaciones generales para este ajuste concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos GGUF en el rango de 4 bits, el modelo ocupa aproximadamente 2,5-3 GB; en 8 bits, alrededor de 4,5 GB. A estas cifras hay que sumar la caché KV, que depende de la longitud de contexto configurada y crece de forma lineal con ella.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM resulta suficiente en cuantizaciones de 4 bits (RTX 3060, RTX 4060, RTX 2070). Para contextos largos conviene disponer de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4080) o más. En entornos de servidor, una A100 o H100 están sobredimensionadas para un modelo de este tamaño y solo se justifican por agregación de muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo con al menos 6 GB de VRAM, y también en Apple Silicon con memoria unificada (M1/M2/M3 con 8 GB o más).
- Ejecución en CPU: viable con llama.cpp u Ollama, con velocidad de generación del orden de pocos a decenas de tokens por segundo según el procesador y la cuantización.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa (requieren safetensors), por lo que no son adecuados para este repositorio tal cual.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones. Al ser un modelo de 4B, la latencia por factura suele ser de fracciones de segundo a pocos segundos en GPU de consumo, pero se trata de una estimación general y no de un dato verificado para este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|---|
| thoweck/invoice-qwen3-4b-de-GGUF | ~4,02B | Heredado del base (262.144 tokens) | GGUF | Apache 2.0 | Extracción de campos de facturas | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4,02B | 262.144 tokens | safetensors | Apache 2.0 | Propósito general, instruct, tool calling | HuggingFace, ampliamente utilizado |
| Otros ajustes de extracción documental de tamaño similar | No disponible | No disponible | No disponible | No disponible | Extracción de campos | No se han identificado alternativas comparables en la información disponible |

No se dispone de datos de rendimiento del ajuste que permitan una comparación cuantitativa con modelos de extracción documental de la misma categoría. La comparación con el modelo base es estructural, no de calidad: el ajuste sacrifica presumiblemente parte de la generalidad del base a cambio de especialización en facturas, sin que existan métricas publicadas que cuantifiquen ese intercambio.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas de extracción ni validación publicada; no es posible estimar la fiabilidad real del modelo en producción.
- Sesgos conocidos: no documentados. Al derivar de Qwen3, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, agravados o modificados por un dataset de ajuste del que no se sabe nada.
- Riesgo de alucinación: relevante en extracción de campos, donde el modelo puede generar valores plausibles pero inexistentes (números de factura, importes o fechas inventados). Se recomienda validación posterior con reglas o comprobaciones cruzadas.
- Idiomas: la ficha no declara idiomas soportados. El sufijo "-de" apunta a un ajuste orientado a facturas en alemán, pero no hay confirmación; el comportamiento en facturas en castellano u otros idiomas no está verificado.
- Contexto: aunque el modelo base admite 262.144 tokens, no se confirma que el ajuste QLoRA preserve ese régimen ni que se haya entrenado con documentos largos. No se documentan configuraciones recomendadas de contexto.
- Formato y compatibilidad: al distribuirse solo en GGUF, no es directamente utilizable con vLLM o TGI, lo que limita su integración en stacks de inferencia de alto rendimiento basados en safetensors.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. Conviene verificar igualmente las condiciones del modelo base Qwen3-4B-Instruct-2507.
- Madurez del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo día (según metadatos), sin historial de mantenimiento ni issues; no hay garantía de soporte o actualizaciones.
- Fecha de creación anómala: los metadatos indican 2026-09-26, lo que puede deberse a un error del repositorio y dificulta situar temporalmente el ajuste.
- Advertencia sobre la búsqueda web: los resultados de búsqueda asociados a esta consulta no contenían ningún enlace relevante sobre el modelo, por lo que no se ha podido contrastar información externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thoweck/invoice-qwen3-4b-de-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper, blog o repositorio del ajuste: no disponible
- Aplicación "Invoice Renamer": mencionada en la model card, sin enlace público disponible
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo
