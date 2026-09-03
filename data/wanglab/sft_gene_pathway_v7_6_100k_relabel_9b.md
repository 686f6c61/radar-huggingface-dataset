# wanglab/sft_gene_pathway_v7_6_100k_relabel_9b

## Resumen

El modelo `wanglab/sft_gene_pathway_v7_6_100k_relabel_9b` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-9B, desarrollado por el laboratorio WangLab de la Universidad de Toronto. Está orientado a tareas de biología computacional, específicamente al análisis de vías genéticas, perturbaciones celulares (single-cell perturbation) y datos relacionados con CRISPR. El modelo se presenta con etiquetas que indican capacidades de razonamiento, multimodalidad (image-text-to-text) y generación de texto conversacional, aunque no se dispone de documentación detallada sobre su arquitectura específica o el proceso de entrenamiento.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), el modelo se distribuye en formato safetensors y ocupa 18,9 GB en el repositorio. Su acceso es restringido (gated) en HuggingFace, lo que implica que los usuarios deben aceptar condiciones adicionales antes de poder descargarlo. La licencia indicada es "qwen", que corresponde a la licencia del modelo base de Qwen, aunque no se especifican los términos exactos. Este modelo es relevante para la comunidad de biología computacional porque combina un modelo de lenguaje de gran tamaño con un dominio especializado, lo que podría permitir tareas de razonamiento sobre datos biológicos complejos, aunque su adopción aún es limitada (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo más allá de que se basa en Qwen3.5-9B, un modelo de lenguaje de tipo transformer. El ajuste fino se realizó sobre este modelo base, pero no se han publicado detalles sobre el dataset de entrenamiento (aunque el nombre sugiere 100k ejemplos etiquetados), la composición de los datos, ni si se utilizaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas en el proceso de entrenamiento. La etiqueta "image-text-to-text" sugiere que el modelo podría aceptar entradas multimodales (imagen y texto) y generar texto, pero no hay confirmación oficial ni ejemplos de uso.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B, se espera que herede capacidades generales de generación de texto, razonamiento y comprensión del lenguaje, aunque no hay benchmarks publicados que lo confirmen.
- Dominio biológico: los tags indican especialización en biología, single-cell, perturbación genética y CRISPR, lo que sugiere que el modelo puede procesar y razonar sobre datos biológicos, como secuencias, expresiones génicas o resultados de experimentos.
- Multimodalidad: la etiqueta "image-text-to-text" sugiere que el modelo puede procesar imágenes junto con texto, posiblemente para análisis de imágenes biológicas (microscopía, etc.), aunque no se detalla el mecanismo.
- Conversación: el tag "conversational" indica que está diseñado para interacciones de diálogo, posiblemente para asistencia en investigación.
- No se dispone de información sobre tool calling, agentes o capacidades multilingües específicas.

## Casos de uso

- Análisis de datos de single-cell: el modelo podría utilizarse para interpretar resultados de experimentos de secuenciación de células individuales, generando resúmenes o hipótesis sobre vías genéticas implicadas.
- Asistencia en diseño de experimentos CRISPR: dada su especialización en perturbación genética, podría ayudar a predecir efectos de knockout génico o sugerir dianas para edición genética.
- Interpretación de imágenes biológicas: si la multimodalidad es real, podría analizar imágenes de microscopía o de ensayos celulares y correlacionarlas con datos textuales.
- Razonamiento sobre vías de señalización: el modelo podría responder preguntas sobre interacciones entre genes y rutas metabólicas, apoyando la revisión de literatura o la generación de hipótesis.
- Generación de informes de laboratorio: podría redactar resúmenes automáticos de resultados experimentales a partir de datos estructurados o anotaciones.
- Educación y divulgación: podría servir como herramienta de consulta para estudiantes o investigadores que necesiten explicaciones sobre conceptos de biología molecular.

Nota: estos casos son inferencias basadas en los tags y el nombre del modelo; no hay documentación oficial que los confirme.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de biología (como precisión en predicción de fenotipos o exactitud en anotación de vías). Tampoco se ofrecen comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 9,4B parámetros en precisión FP16 requiere aproximadamente 19-20 GB de VRAM. Con cuantización a 8 bits (INT8) se reduce a unos 10-11 GB, y a 4 bits (INT4) a unos 5-6 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: para FP16 se necesitaría una GPU con al menos 24 GB (por ejemplo, RTX 3090, RTX 4090, A10G, L4). Para cuantización 8 bits, una RTX 4080 o similar con 16 GB podría ser suficiente. Para 4 bits, una RTX 3060 de 12 GB podría bastar.
- Compatibilidad con GPU de consumo: sí, con cuantización es posible ejecutarlo en GPUs de gama alta para consumidores, pero no se han publicado guías oficiales.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI, o mediante llama.cpp si se convierte a GGUF (no disponible actualmente). También se puede usar con la librería transformers de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dominio (biología computacional) con el mismo tamaño. Existen modelos como scGPT o Geneformer, pero son de menor escala y no se han publicado comparativas con este modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un ajuste fino de Qwen3.5-9B, puede heredar sesgos del modelo base, pero no hay estudios específicos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información plausible pero incorrecta, especialmente en dominios especializados donde los datos de entrenamiento son limitados.
- Limitaciones de contexto: no se conoce la longitud de contexto, lo que puede restringir el procesamiento de secuencias biológicas largas o documentos extensos.
- Restricciones de licencia: la licencia "qwen" puede imponer condiciones de uso comercial; se recomienda revisar los términos exactos en el repositorio de Qwen.
- Acceso restringido: el modelo es gated, por lo que requiere aprobación de los autores para su descarga, lo que limita su disponibilidad.
- Falta de documentación: no hay papers, guías de uso ni ejemplos de código, lo que dificulta su adopción en producción.

## Enlaces

- HuggingFace: https://huggingface.co/wanglab/sft_gene_pathway_v7_6_100k_relabel_9b
- GitHub del laboratorio: https://github.com/bowang-lab
- Perfil de la organización en HuggingFace: https://huggingface.co/wanglab
