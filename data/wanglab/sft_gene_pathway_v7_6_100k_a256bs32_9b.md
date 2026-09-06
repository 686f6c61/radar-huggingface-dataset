# wanglab/sft_gene_pathway_v7_6_100k_a256bs32_9b

## Resumen

`wanglab/sft_gene_pathway_v7_6_100k_a256bs32_9b` es un modelo de lenguaje multimodal (image-text-to-text) especializado en biología computacional, desarrollado por el laboratorio `wanglab` mediante fine-tuning supervisado (SFT) sobre la base `Qwen/Qwen3.5-9B`. El modelo está orientado a tareas de análisis de células individuales (single-cell), predicción de efectos de perturbaciones CRISPR y razonamiento sobre rutas genéticas y de señalización, tal y como reflejan sus metadatos.

La arquitectura es un transformer multimodal de 9.409.813.744 parámetros (9.4B), con la misma estructura que el modelo base Qwen3.5-9B. El repositorio está protegido por una puerta de acceso (gated) y su licencia es `qwen`. No se han publicado datos sobre la longitud de contexto, los idiomas soportados ni los detalles del dataset de entrenamiento en la información disponible.

Es relevante para investigadores y desarrolladores que trabajan en bioinformática, genómica computacional o biología de sistemas, ya que ofrece un modelo específicamente ajustado para razonar sobre datos de expresión génica, perturbaciones y rutas metabólicas, combinando texto e imágenes en un único sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | qwen (licencia personalizada de Qwen, acceso gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura `Qwen/Qwen3.5-9B`, un transformer multimodal que procesa entradas de texto e imagen y genera texto. El nombre del repositorio sugiere que se ha realizado un ajuste supervisado (SFT) con un dataset de aproximadamente 100.000 ejemplos relacionados con genes y rutas biológicas, con un tamaño de lote (batch size) de 256. No se especifica si se emplearon técnicas de RLHF o DPO, ni la composición exacta del dataset de entrenamiento.

Como innovación destacable, los metadatos indican que el modelo está pensado para razonamiento sobre datos biológicos, incluyendo single-cell, perturbaciones CRISPR y pathways. Sin embargo, no se han publicado detalles técnicos sobre la adaptación multimodal ni sobre el proceso de entrenamiento en la información disponible.

## Capacidades

- Generación de texto y conversación multimodal (image-text-to-text), capaz de razonar sobre imágenes y texto.
- Análisis de datos de biología computacional: single-cell, perturbación CRISPR y pathways genéticos.
- Razonamiento específico en biología, con potencial para tareas de inferencia y predicción de efectos de perturbaciones.
- Soporte de interacción conversacional, adecuado para asistentes en entornos de investigación biomédica.
- No se ha confirmado soporte de tool calling ni de agentes autónomos en la información disponible.

## Casos de uso

- Análisis de datos de expresión génica a nivel de célula individual: el modelo puede interpretar consultas en lenguaje natural sobre resultados de single-cell y generar explicaciones o hipótesis basadas en los datos.
- Predicción de efectos de perturbaciones CRISPR: permite razonar sobre el impacto de ediciones genéticas en rutas biológicas, ayudando a priorizar experimentos.
- Razonamiento sobre rutas metabólicas y de señalización: el modelo puede relacionar genes con pathways, facilitando el estudio de mecanismos de enfermedad.
- Asistente conversacional para biólogos e investigadores: ofrece respuestas contextualizadas sobre genómica y biología de sistemas, integrable en plataformas de investigación.
- Interpretación de imágenes biomédicas: gracias a su capacidad multimodal, puede combinar imágenes de microscopía o gráficos de expresión con texto para generar análisis integrados.
- Generación de hipótesis en estudios de perturbación: a partir de descripciones de experimentos, el modelo puede sugerir genes candidatos o efectos esperados en redes reguladoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 18,9 GB, por lo que se recomienda al menos 24 GB de VRAM (RTX 4090, A100 40GB o superior). Con cuantización 4-bit (GGUF o similar) podría reducirse a 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, RTX 4090 para uso local con FP16.
- Puede ejecutarse en GPU de consumo (RTX 4090, RTX 3090) con cuantización, pero no se han publicado configuraciones oficiales.
- Opciones de despliegue: Transformers de Hugging Face, vLLM, llama.cpp o Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| wanglab/sft_gene_pathway_v7_6_100k_a256bs32_9b | 9.409.813.744 | No disponible | Biología, single-cell, CRISPR, multimodal | qwen |
| wanglab/sft_gene_pathway_v7_6_100k_relabel_9b | No disponible | No disponible | Variante con relabel del mismo dominio biológico | qwen |
| Qwen/Qwen3.5-9B | 9.409.813.744 | No disponible | Modelo base generalista multimodal | qwen |

El modelo es un fine-tuning especializado del modelo base Qwen3.5-9B, por lo que comparte arquitectura y licencia. Su principal diferenciador es la orientación a biología computacional, aunque no se dispone de benchmarks que permitan comparar su rendimiento con las alternativas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio está en modo gated y requiere aceptar las condiciones de Hugging Face para su descarga.
- Licencia `qwen`: es una licencia propietaria de Alibaba/Qwen que impone condiciones de uso comercial y restricciones sobre investigación competitiva; debe revisarse el texto completo antes de su uso en producción.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar afirmaciones incorrectas en contextos biológicos; los resultados deben validarse experimentalmente.
- Datos de entrenamiento no documentados: se desconoce la composición del dataset de 100k ejemplos, lo que limita la evaluación de sesgos y cobertura de dominios.
- Falta de benchmarks: no hay resultados publicados que permitan evaluar su calidad frente a otros modelos especializados en biología.
- Limitaciones de idioma y contexto: no se especifican los idiomas soportados ni la longitud de contexto, lo que dificulta su uso en aplicaciones multilingües o de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wanglab/sft_gene_pathway_v7_6_100k_a256bs32_9b
- Modelo hermano (relabel): https://huggingface.co/wanglab/sft_gene_pathway_v7_6_100k_relabel_9b
- Página de despliegue en FriendliAI (modelo relabel): https://friendli.ai/models/wanglab/sft_gene_pathway_v7_6_100k_relabel_9b
