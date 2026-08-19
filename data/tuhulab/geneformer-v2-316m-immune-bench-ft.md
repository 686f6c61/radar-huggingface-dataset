# tuhulab/geneformer-v2-316m-immune-bench-ft

## Resumen

Geneformer-V2-316M-immune-bench-ft es un modelo de lenguaje especializado en transcriptómica de célula única, derivado del modelo fundacional Geneformer-V2-316M desarrollado por NVIDIA. Este checkpoint concreto, publicado por el usuario tuhulab, ha sido ajustado (fine-tuning) para la anotación de células inmunes, una tarea de clasificación de tipos celulares a partir de datos de expresión génica. El modelo base es un transformer preentrenado sobre un corpus masivo de transcriptomas de célula única, diseñado para capturar relaciones contextuales entre genes y permitir predicciones específicas de contexto incluso con conjuntos de datos limitados.

La relevancia de este modelo radica en su aplicación directa a la inmunología computacional: permite identificar subtipos de células inmunes (p. ej., células T, B, NK, monocitos) a partir de datos de scRNA-seq, una tarea crítica en investigación biomédica. Al estar basado en Geneformer, hereda una arquitectura eficiente y un preentrenamiento robusto, aunque el acceso al checkpoint está restringido y requiere aceptar condiciones en HuggingFace. El tamaño de 316 millones de parámetros lo sitúa en un rango moderado, factible para entornos de investigación con GPUs de gama media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (estilo BERT) con atención por tokens de genes |
| Parametros totales | 316 millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se estima 4096 tokens en Geneformer, pero no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (no se documentan en la información proporcionada) |
| Idiomas soportados | no disponible (el modelo opera sobre tokens de genes, no sobre lenguaje natural) |
| Licencia | other (acceso restringido en HuggingFace, requiere aceptación de condiciones) |
| Formato de pesos | no disponible (probablemente safetensors o binarios de PyTorch, pero no se especifica) |

## Arquitectura y entrenamiento

Geneformer-V2-316M es un transformer basado en la arquitectura de codificador (encoder-only), similar a BERT, pero adaptado al dominio de la expresión génica. En lugar de procesar texto, tokeniza genes individuales y los organiza en secuencias ordenadas por nivel de expresión dentro de cada célula. El preentrenamiento se realizó sobre un corpus de aproximadamente 30 millones de células humanas de diversas condiciones y tejidos, utilizando una pérdida de enmascaramiento de genes (masked gene prediction) para aprender representaciones contextuales de la regulación génica.

El checkpoint de tuhulab corresponde a un ajuste fino (fine-tuning) del modelo base sobre un conjunto de datos de referencia para anotación de células inmunes (immune bench). Este proceso adapta las representaciones generales de Geneformer a la tarea específica de clasificar subtipos celulares inmunes, optimizando una cabeza de clasificación sobre las representaciones de célula. No se dispone de detalles sobre el dataset de fine-tuning, el número de épocas o la estrategia de entrenamiento (p. ej., si se usó aprendizaje contrastivo o pérdida de entropía cruzada estándar). La innovación principal del modelo base es su capacidad para transferir conocimiento a tareas con pocos datos etiquetados, gracias al preentrenamiento en un corpus biológico de gran escala.

## Capacidades

- Anotación de tipos celulares inmunes: clasifica células individuales en categorías como células T CD4+, CD8+, células B, NK, monocitos, etc., a partir de perfiles de expresión génica.
- Representación de células: genera embeddings de célula que pueden usarse para clustering, visualización (UMAP/t-SNE) o como características para otros modelos.
- Transferencia a tareas relacionadas: al estar basado en Geneformer, conserva la capacidad de adaptarse a otras tareas de biología de redes, aunque este checkpoint está especializado en inmunología.
- Procesamiento de datos scRNA-seq: acepta matrices de expresión génica crudas o normalizadas y las convierte en secuencias de genes ordenadas por expresión.
- Sin soporte de tool calling ni agentes: es un modelo de clasificación, no un modelo generativo de texto.
- Sin capacidades multimodales: solo procesa datos de expresión génica, no imágenes ni audio.

## Casos de uso

- Investigación en inmunología: identificación de subtipos celulares en datos de scRNA-seq de sangre periférica o tejidos, para estudiar respuestas inmunes en enfermedades autoinmunes, infecciones o cáncer.
- Descubrimiento de biomarcadores: al anotar células con precisión, permite correlacionar tipos celulares específicos con fenotipos clínicos, ayudando a identificar firmas génicas asociadas a pronóstico o respuesta a tratamiento.
- Validación de resultados de citometría de flujo: comparación de anotaciones basadas en marcadores de superficie con las predicciones del modelo, para confirmar poblaciones celulares en experimentos de alta dimensión.
- Análisis de datos de pacientes en ensayos clínicos: clasificación de células inmunes en muestras de pacientes para monitorear cambios en la composición celular durante terapias (p. ej., inmunoterapia).
- Integración con pipelines de análisis single-cell: uso del modelo como módulo de anotación automática dentro de herramientas como Scanpy o Seurat, reemplazando la anotación manual que es lenta y subjetiva.
- Educación y formación en bioinformática: como modelo de referencia para enseñar conceptos de transfer learning en biología computacional, dado su tamaño moderado y su especialización en un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Geneformer-V2-316M reporta mejoras en tareas de anotación celular frente a métodos tradicionales en el artículo original, pero no se proporcionan métricas específicas para este checkpoint ajustado. No se dispone de comparaciones cuantitativas con otros modelos en la documentación accesible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 316 millones de parámetros, la inferencia en precisión FP32 requiere aproximadamente 1,3 GB de memoria para los pesos, más overhead de activaciones y datos. Con cuantización a FP16 o int8, el consumo se reduce a unos 0,6-0,8 GB. Es factible ejecutarlo en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4060) puede realizar inferencia. Para fine-tuning adicional, se recomienda al menos 8 GB (RTX 3070, RTX 4070) o GPUs de centro de datos como A100 o H100 si se procesan grandes lotes.
- Opciones de despliegue: al ser un modelo de clasificación, puede cargarse con PyTorch o TensorFlow. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo de texto. Se puede servir mediante frameworks de inferencia estándar como TorchServe o Triton.
- Latencia y throughput: no se dispone de datos medidos. Para una célula individual (una secuencia de genes), la inferencia es del orden de milisegundos en una GPU moderna. El throughput depende del tamaño de lote y de la longitud de las secuencias.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de anotación celular como scBERT, CellTypist o ScType. El modelo base Geneformer se ha comparado en su artículo con métodos como scANVI y Seurat, pero no hay datos públicos para este checkpoint específico. Se recomienda consultar el artículo de Geneformer para una comparativa general del modelo base.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos corporativos o académicos sin aprobación previa.
- Especialización limitada: está ajustado para células inmunes; su rendimiento en otros tipos celulares o tejidos puede ser deficiente.
- Sesgos de los datos de entrenamiento: el preentrenamiento de Geneformer se realizó con datos predominantemente humanos y de ciertos tejidos, lo que puede introducir sesgos en poblaciones subrepresentadas.
- Riesgo de alucinación en anotaciones: como cualquier modelo de clasificación, puede producir etiquetas incorrectas en células atípicas o con baja calidad de datos.
- Sin capacidad generativa: no puede generar texto ni explicaciones; solo produce etiquetas de clase y embeddings.
- Falta de documentación sobre el fine-tuning: no se especifican los hiperparámetros ni el dataset exacto de ajuste, lo que dificulta la reproducibilidad.
- Licencia "other": los términos exactos no están claros; se debe revisar la política de uso antes de aplicar en producción.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/tuhulab/geneformer-v2-316m-immune-bench-ft
- Modelo base en HuggingFace (NVIDIA): https://huggingface.co/nvidia/geneformer_V2_316M
- Repositorio oficial de Geneformer (GitHub): https://github.com/gaopeigi3/Geneformer (incluye el directorio Geneformer-V2-316M)
- Repositorio alternativo de Geneformer (GitHub): https://github.com/haroonshakeel/Geneformer
- Documentación de NVIDIA BioNeMo para Geneformer: https://docs.nvidia.com/bionemo-recipes/latest/main/recipes/models/geneformer/model_readme/
