# torch-pointcloud/pointgpt-l.pretrain.guangyan-chen

## Resumen

PointGPT-L es un modelo de preentrenamiento autosupervisado para nubes de puntos 3D, desarrollado originalmente por Guangyan Chen y colaboradores (BIT, Universidad de Pekín y Nankai) y publicado en NeurIPS 2023. Esta ficha corresponde a la conversión del checkpoint original al ecosistema `torch-pointcloud`, mantenida por Arthur Dujardin. El modelo aplica la formulación de preentrenamiento generativo autorregresivo de GPT al dominio de las nubes de puntos: en lugar de predecir el siguiente token de texto, predice el siguiente segmento de puntos tras aplicar una partición espacial de la nube.

Con 359,8 millones de parámetros, es la variante "L" (large) de la familia PointGPT y se distribuye como checkpoint de preentrenamiento puro, sin cabeza de clasificación ni de segmentación. No es un modelo de lenguaje: no procesa texto, no genera lenguaje natural y no soporta instrucciones, tool calling ni razonamiento simbólico. Su utilidad es servir como inicialización de pesos para tareas posteriores de visión 3D (clasificación, segmentación de partes, detección), reduciendo la dependencia de anotaciones densas.

Es relevante ahora porque el ecosistema de modelos 3D open source sigue fragmentado entre frameworks de investigación, y esta conversión a `torch-pointcloud` con pesos en `safetensors` y licencia MIT facilita su uso reproducible en pipelines de PyTorch sin depender del código original de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con preentrenamiento generativo autorregresivo (PointGPT) sobre nubes de puntos |
| Parametros totales | 359.765.600 (359,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre 8192 puntos por muestra en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no aplica (modelo de vision 3D, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PointGPT adapta el paradigma de preentrenamiento autorregresivo de GPT al dominio 3D. La nube de puntos se divide en una secuencia de parches locales mediante agrupamiento espacial; un transformer procesa la secuencia y se entrena para predecir el siguiente parche a partir de los anteriores, con una estrategia de enmascaramiento y predicción inspirada en la generación autoregresiva de lenguaje. El modelo incorpora un diseño de "dual masking" y una extracción de parches basada en PointNet para preservar la geometría local. El checkpoint aquí descrito es la variante large con 359,8 M de parámetros.

El preentrenamiento es autosupervisado sobre datos sin etiquetar. La model card indica el dataset `UnlabeledHybrid`, mientras que el resultado de búsqueda web asociado menciona ShapeNet-55; la información disponible no permite resolver la discrepancia, por lo que el número exacto de tokens o muestras de entrenamiento, la composición detallada del dataset y si hubo etapas de ajuste fino supervisado no están disponibles. Tampoco se documentan en la información proporcionada detalles sobre aumentación de datos, número de épocas ni presupuesto de cómputo.

## Capacidades

- Extracción de representaciones de nubes de puntos 3D mediante un transformer autosupervisado.
- Preentrenamiento autorregresivo: predice el siguiente parche de puntos en una secuencia espacial.
- Generación de features transferibles para tareas posteriores de visión 3D tras ajuste fino.
- Procesamiento de muestras con 8192 puntos y coordenadas `pos` de dimensión 3, según el ejemplo de uso de la model card.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión 2D, audio ni modalidades distintas de la nube de puntos.

## Casos de uso

- Inicialización para clasificación de objetos 3D: se carga el checkpoint como pesos iniciales y se añade una cabeza de clasificación, ajustando con un dataset etiquetado como ModelNet40 o ShapeNet. El preentrenamiento autorregresivo proporciona features geométricas que reducen la necesidad de datos anotados.
- Segmentación semántica de escenas: partiendo de los pesos preentrenados, se entrena una cabeza de segmentación por punto para entornos como S3DIS o SemanticKITTI, aprovechando la representación local de parches que aprende el modelo.
- Segmentación de partes de objetos: ajuste fino sobre ShapeNetPart para separar componentes (patas de silla, alas de avión, etc.), tarea en la que los modelos preentrenados con objetivos generativos suelen converger más rápido.
- Investigación en aprendizaje autosupervisado 3D: el checkpoint sirve como línea base reproducible para comparar objetivos de preentrenamiento (contrastivos, enmascarados, autorregresivos) sobre la misma arquitectura y presupuesto.
- Prototipado de pipelines de percepción 3D: con `torch-pointcloud`, se puede integrar el modelo en un flujo PyTorch existente para extraer embeddings de nubes de puntos y alimentar clasificadores ligeros o sistemas de recuperación de formas.
- Extracción de descriptores para búsqueda y recuperación de modelos 3D: los embeddings generados pueden indexarse para encontrar geometrías similares en catálogos de CAD o bibliotecas de assets.
- Preentrenamiento de dominio en robótica o automoción: ajuste del checkpoint sobre datos LiDAR o de profundidad propios para tareas de percepción, aprovechando que el objetivo autosupervisado no requiere etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,5 GB solo para pesos (359,8 M × 4 bytes), más activaciones y memoria del grafo; en la práctica, entre 2 y 4 GB según el tamaño del lote y el número de puntos.
- En FP16/BF16, los pesos ocupan unos 0,75 GB; la VRAM total dependerá de las activaciones.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia y ajuste fino con lotes pequeños; A100, H100 o RTX 4090 para entrenamiento a mayor escala.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: la librería `torch-pointcloud` mediante `tp.create_model(...)`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tipo de preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointGPT-L (este) | 359,8 M | 8192 puntos | Autorregresivo generativo | MIT | Hugging Face (`torch-pointcloud`) |
| PointGPT-S / PointGPT-B | no disponible en la informacion | no disponible | Autorregresivo generativo | MIT (repo original) | GitHub `CGuangyan-BIT/PointGPT` |
| Point-MAE | no disponible en la informacion | no disponible | Enmascarado (MAE) | no disponible en la informacion | Repositorios de investigacion |
| Point-BERT | no disponible en la informacion | no disponible | Enmascarado con tokenizador discreto | no disponible en la informacion | Repositorios de investigacion |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la información proporcionada; las variantes S y B de PointGPT se mencionan solo como parte de la familia descrita en el paper, sin cifras de parámetros confirmadas en las fuentes consultadas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa ni genera texto, y no debe evaluarse con benchmarks de NLP.
- El checkpoint es de preentrenamiento puro; sin una cabeza de tarea y ajuste fino, no produce predicciones útiles directamente.
- Existe una discrepancia entre la model card (`UnlabeledHybrid`) y el resultado de búsqueda (ShapeNet-55) sobre el dataset de preentrenamiento; conviene verificar la procedencia exacta antes de usarlo en comparaciones experimentales.
- Riesgo de sobreajuste a las distribuciones geométricas de los datasets de investigación (objetos sintéticos o escaneos de interiores), con degradación en dominios muy distintos como LiDAR automotriz o nubes de puntos industriales.
- El ejemplo de uso emplea una muestra sintética; no se documentan garantías de robustez frente a ruido, oclusiones o densidades de puntos variables.
- La licencia MIT permite uso comercial, pero el repo original y el paper deben citarse según lo indicado en la model card.
- El número de descargas (18) y de likes (0) sugiere una adopción muy limitada; no hay evidencia de validación comunitaria extensa de esta conversión concreta.
- No se documentan sesgos específicos del modelo; al operar sobre geometría 3D, los sesgos relevantes provendrían de la distribución de formas de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-l.pretrain.guangyan-chen
- Variante post-pretrain (clasificación): https://huggingface.co/torch-pointcloud/pointgpt-l.post-pretrain.guangyan-chen
- Paper PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio original: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
