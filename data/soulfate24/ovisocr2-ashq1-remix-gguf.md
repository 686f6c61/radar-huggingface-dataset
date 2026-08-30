# Soulfate24/OvisOCR2-ASHQ1-Remix-GGUF

## Resumen

OvisOCR2-ASHQ1-Remix-GGUF es una versión cuantizada en formato GGUF del modelo OvisOCR2, un modelo multimodal de parsing de documentos desarrollado por ATH-MaaS. Este modelo, con 752 millones de parámetros, está diseñado para convertir imágenes de páginas de documentos en representaciones Markdown estructuradas, preservando el orden natural de lectura e incluyendo texto, fórmulas, tablas y regiones visuales. La cuantización ASHQ1-Remix, creada por Soulfate24, ofrece una escalera de siete niveles de compresión que permiten ajustar el equilibrio entre fidelidad y tamaño del archivo.

La relevancia de este modelo radica en su capacidad para automatizar la digitalización de documentos con un coste computacional reducido, gracias a su tamaño compacto y a las múltiples opciones de cuantización que lo hacen viable en hardware de consumo. Al estar licenciado bajo Apache 2.0, puede integrarse en flujos de producción comerciales sin restricciones significativas. El modelo base OvisOCR2 se presenta en un informe técnico en arXiv, donde se detalla su arquitectura y el motor de datos utilizado para su entrenamiento.

Esta ficha se centra en la versión cuantizada GGUF, que requiere además un proyector multimodal (mmproj) para procesar imágenes. Los archivos del repositorio incluyen tanto los pesos del modelo de lenguaje como los proyectores en distintas precisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM multimodal basada en Ovis (alineación estructural de embeddings visuales y textuales) |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF ASHQ1-Remix: Fidelity-48pc (704 MiB), Precision-42pc (668 MiB), Quality-36pc (531 MiB), Compact-33pc (487 MiB), Mini-30pc (474 MiB), Nano-27pc (457 MiB), Pico-24pc (442 MiB); mmproj en F32, F16 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado) y safetensors (modelo base) |

## Arquitectura y entrenamiento

OvisOCR2 se basa en la arquitectura Ovis, un MLLM que introduce un diseño novedoso para alinear estructuralmente los embeddings visuales y textuales. Según el informe técnico (arXiv:2607.13639), el modelo está pensado como un parser de extremo a extremo: recibe una imagen de página y genera una representación Markdown en orden de lectura natural, cubriendo texto, fórmulas, tablas y regiones visuales. El entrenamiento utiliza un motor de datos que combina anotaciones reales de documentos filtrados con páginas sintéticas cuyas imágenes renderizadas y objetivos Markdown se generan automáticamente.

La versión cuantizada ASHQ1-Remix aplica una cuantización GGUF sensible a la activación, donde cada ratio, suelo y tope se derivan de experimentos medidos. La suite soporta BF16 nativo como referencia y linaje AutoRound con límites de saturación explícitos. Se validó en seis familias de modelos, aunque no se especifican los detalles de dicha validación en la información disponible. El repositorio de HuggingFace incluye además los proyectores multimodales necesarios para el procesamiento de imágenes, disponibles en F32, F16 y BF16.

## Capacidades

- Generación de Markdown estructurado a partir de imágenes de documentos, incluyendo texto, fórmulas matemáticas, tablas y regiones visuales.
- Parsing de documentos en orden natural de lectura, lo que facilita la extracción de información jerárquica.
- Soporte multimodal: entrada de imagen y salida de texto (image-text-to-text).
- Compatibilidad con vLLM para inferencia optimizada en producción.
- Múltiples niveles de cuantización que permiten ajustar el equilibrio entre precisión y uso de memoria.
- Capacidad de procesamiento de documentos en lote, gracias a su tamaño compacto (0,75B parámetros).
- No se ha confirmado soporte de tool calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Digitalización de archivos históricos: el modelo convierte escaneos de documentos antiguos en Markdown editable, preservando la estructura de tablas y notas al pie, facilitando su búsqueda y archivado.
- Extracción de datos de facturas y recibos: al generar Markdown con tablas y campos clave, permite automatizar la contabilidad y la conciliación de pagos sin intervención manual.
- Conversión de artículos científicos a formato legible por máquina: las fórmulas y tablas se transcriben correctamente, habilitando pipelines de análisis bibliométrico o minería de textos.
- Generación de documentación técnica a partir de capturas de pantalla: desarrolladores pueden convertir diagramas o interfaces en documentación Markdown para repositorios o wikis.
- Accesibilidad: transformar documentos escaneados en texto estructurado para lectores de pantalla o sistemas de lectura asistida, mejorando el acceso a información impresa.
- Automatización de flujos de trabajo en entornos de oficina: integrado en herramientas de gestión documental, clasifica y convierte PDFs en formatos editables para su posterior procesamiento con LLMs.
- Preparación de datasets de entrenamiento: el modelo puede generar anotaciones Markdown para crear corpus de documentos sintéticos o reales, útiles para entrenar otros modelos.

## Benchmarks y rendimiento

La model card proporciona métricas de la cuantización sobre el dataset wiki.test.raw, con referencia simétrica FA-auto. Estas métricas no son benchmarks de tareas (como MMLU o HumanEval), sino indicadores de la degradación introducida por la cuantización.

| Tier | Tamaño | PPL | KLD | RMS Δp | top-p |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Fidelity-48pc | 704 MiB | 31.0673 | 0.0021 | 0.98% | 97.4% |
| Precision-42pc | 668 MiB | 31.0809 | 0.0026 | 1.06% | 97.1% |
| Quality-36pc | 531 MiB | 32.0240 | 0.0155 | 2.68% | 93.0% |
| Compact-33pc | 487 MiB | 32.7223 | 0.0306 | 3.90% | 90.3% |
| Mini-30pc | 474 MiB | 32.8232 | 0.0352 | 4.17% | 89.8% |
| Nano-27pc | 457 MiB | 33.1136 | 0.0648 | 5.95% | 86.7% |
| Pico-24pc | 442 MiB | 34.7822 | 0.0775 | 6.33% | 85.2% |

No se han publicado resultados de benchmarks de tareas específicas (OCR, parsing de documentos) en la información disponible. El informe técnico del modelo base podría contenerlos, pero no se ha accedido a su contenido completo.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF más grande (Fidelity-48pc) ocupa 704 MiB, más el proyector mmproj (entre 205 y 402 MiB). En total, la inferencia puede requerir entre 1 y 1,5 GB de VRAM en FP16, y menos de 1 GB con cuantización de 4 bits. Cabe en GPUs consumer con 4 GB o más.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 2060, RTX 3060, etc.). Para despliegues en servidor, una T4 o A10 es suficiente.
- Opciones de despliegue: vLLM (mencionado en los tags), llama.cpp, Ollama, TGI, o cualquier framework compatible con GGUF.
- Latencia y throughput: no se han proporcionado datos específicos. Dado el tamaño reducido, se espera una latencia baja (del orden de decenas de milisegundos por imagen en GPUs modernas) y un throughput alto en entornos de batching.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (por ejemplo, Donut, Pix2Struct o modelos de parsing de documentos de tamaño similar). La información proporcionada no incluye benchmarks comparativos ni detalles de otros modelos. Se recomienda consultar el informe técnico del modelo base para obtener una comparativa más completa.

## Limitaciones y advertencias

- La cuantización introduce una degradación de precisión, especialmente en los tiers más agresivos (Pico-24pc y Nano-27pc), como reflejan las métricas de PPL y KLD. Para tareas que requieran alta fidelidad en fórmulas o tablas, se recomienda usar los tiers superiores (Fidelity o Precision).
- El modelo depende de un proyector multimodal (mmproj) para procesar imágenes; debe descargarse junto con los pesos del modelo de lenguaje.
- No se especifican los idiomas soportados. Aunque el modelo base probablemente sea multilingüe, no hay confirmación oficial en la información disponible.
- Riesgo de alucinación en la generación de Markdown, especialmente en documentos con baja calidad de imagen o fuentes poco comunes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus derivados deben cumplir con los términos de atribución y redistribución.
- Al ser una versión cuantizada, el rendimiento puede variar respecto al modelo original en BF16. Se recomienda validar en el caso de uso específico antes de desplegar en producción.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/Soulfate24/OvisOCR2-ASHQ1-Remix-GGUF
- Suite de cuantización ASHQ1-Remix: https://huggingface.co/Soulfate24/AutoRound-ASHQ1-Remix_Double-Quantization_Suite
- Repositorio GitHub del modelo base Ovis: https://github.com/ATH-MaaS/Ovis
- Informe técnico de OvisOCR2 (arXiv): https://arxiv.org/abs/2607.13639v1
- Cuantizaciones GGUF de OvisOCR2 en ModelScope: https://www.modelscope.cn/models/Abiray/OvisOCR2-GGUF
