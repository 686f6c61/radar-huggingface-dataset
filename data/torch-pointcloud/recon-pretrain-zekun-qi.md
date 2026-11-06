# torch-pointcloud/recon.pretrain.zekun-qi

## Resumen

ReCon (recon.pretrain.zekun-qi) es un modelo de representación auto-supervisada para nubes de puntos 3D, publicado en Hugging Face por el proyecto torch-pointcloud. Se trata de la conversión del checkpoint oficial de ReCon, presentado en el paper "Contrast with Reconstruct: Contrastive 3D Representation Learning Guided by Generative Pretraining" (ICML 2023). El modelo implementa un transformer de puntos enmascarado (masked point transformer) con consultas contrastivas entre modalidades, y ha sido preentrenado de forma auto-supervisada sobre el conjunto de datos ShapeNet-55.

Con 50,8 millones de parámetros, ReCon no es un modelo generativo de texto ni un LLM: es un extractor de características 3D que produce representaciones densas de nubes de puntos, útil como backbone para tareas posteriores como clasificación de formas, segmentación de partes o detección de objetos en 3D. Su relevancia radica en que combina el paradigma generativo (reconstrucción de puntos enmascarados) con el contrastivo (alineación entre modalidades, como imagen y nube de puntos o entre vistas), una estrategia que el paper demuestra superior al preentrenamiento puramente generativo o puramente contrastivo.

La ficha se centra en el uso práctico del checkpoint dentro del ecosistema torch-pointcloud, una librería de PyTorch para aprendizaje profundo sobre nubes de puntos. El modelo está liberado bajo licencia MIT y su repo ocupa 0,2 GB en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de puntos enmascarado con consultas contrastivas entre modalidades (ReCon) |
| Parámetros totales | 50.782.560 (50,8 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo sobre nubes de puntos; típicamente 8192 puntos por muestra según el ejemplo de uso) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ReCon es un transformer de puntos (point transformer) que aplica enmascaramiento aleatorio sobre tokens de nube de puntos y aprende a reconstruir las coordenadas 3D de las regiones enmascaradas. La innovación principal del paper es el uso de consultas contrastivas entre modalidades: además de la reconstrucción, el modelo alinea las representaciones de la nube de puntos con las de otra modalidad (por ejemplo, imagen RGB) mediante un objetivo contrastivo, de modo que el preentrenamiento generativo y el contrastivo se refuerzan mutuamente. El checkpoint aquí convertido corresponde a la fase de preentrenamiento auto-supervisado.

El entrenamiento se realizó sobre ShapeNet-55, un subconjunto de ShapeNet con 55 categorías de objetos 3D, y no se documenta en la model card el número exacto de tokens ni la composición detallada del dataset más allá de esta fuente. El modelo se distribuye como pesos convertidos desde el repositorio oficial qizekun/ReCon (MIT) al formato de la librería torch-pointcloud, que expone una API `create_model` para cargar el checkpoint y ejecutar el forward sobre tensores de posiciones y batch.

## Capacidades

- Extracción de representaciones auto-supervisadas de nubes de puntos 3D (features densos por punto y representación global).
- Reconstrucción de regiones enmascaradas de la nube de puntos (objetivo de preentrenamiento generativo).
- Alineación contrastiva entre modalidades (nube de puntos e imagen u otra vista), según el diseño del paper.
- Base para fine-tuning en tareas downstream de clasificación de formas, segmentación de partes y detección 3D.
- Procesamiento de muestras con miles de puntos (el ejemplo de la model card usa 8192 puntos).
- Soporte de batching mediante la utilidad `collate` de torch-pointcloud.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión 2D general ni audio.

## Casos de uso

- Clasificación de objetos 3D: cargar el checkpoint como backbone congelado o con fine-tuning y añadir una cabeza de clasificación sobre la representación global para reconocer categorías de ShapeNet u otros datasets de formas.
- Segmentación semántica de partes: usar los features por punto como entrada a un decodificador de segmentación para etiquetar cada punto de una malla o escaneo con su parte correspondiente (alas, fuselaje, etc. en aeronaves; patas, asiento en muebles).
- Preentrenamiento transferible para dominios con pocos datos: inicializar un modelo de nube de puntos con estos pesos y fine-tunear con pocas muestras etiquetadas en un dominio industrial (piezas mecánicas, escaneos de almacén).
- Detección de objetos 3D en escenas: emplear las representaciones como backbone en pipelines de detección sobre nubes de puntos (LiDAR o escáneres), reduciendo la necesidad de entrenamiento desde cero.
- Búsqueda y recuperación de formas 3D: generar embeddings globales de modelos 3D para indexar un catálogo y recuperar formas similares por similitud vectorial en un motor de búsqueda.
- Análisis de calidad de escaneos: comparar la reconstrucción de regiones enmascaradas con la nube original para detectar huecos, ruido o artefactos en escaneos 3D de piezas.
- Investigación en representación 3D: reproducir los experimentos del paper de ReCon o servir como baseline en estudios comparativos de preentrenamiento auto-supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 50,8 M de parámetros; en fp32 ocupa aproximadamente 0,2 GB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, incluyendo GTX 1650, RTX 3050 o superiores.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; para entrenamiento o fine-tuning se recomienda RTX 3090, RTX 4090, A100 o H100 según el tamaño del batch y el número de puntos.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas con al menos 4 GB de VRAM para inferencia.
- Opciones de despliegue: la librería torch-pointcloud sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReCon (este modelo) | 50,8 M | nubes de puntos (ej. 8192 puntos) | Representación 3D auto-supervisada | MIT | Hugging Face (torch-pointcloud) |
| Point-MAE | no disponible en la información | nubes de puntos | Preentrenamiento auto-supervisado 3D | no disponible | Repositorio académico |
| Point-BERT | no disponible en la información | nubes de puntos | Preentrenamiento auto-supervisado 3D | no disponible | Repositorio académico |
| PointNet++ | no disponible en la información | nubes de puntos | Clasificación y segmentación 3D supervisada | no disponible | Repositorio académico |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo es un backbone de representación 3D, no un modelo generativo de texto ni un asistente conversacional; no debe evaluarse con métricas de LLM.
- Preentrenado únicamente sobre ShapeNet-55, un dataset de objetos sintéticos y categorías limitadas; puede generalizar mal a escenas reales, LiDAR o escaneos ruidosos sin fine-tuning.
- No se documentan sesgos específicos, pero el dataset de entrenamiento (ShapeNet) tiene una distribución de categorías y geometrías sesgada hacia objetos de uso común.
- Riesgo de sobreajuste a la distribución de ShapeNet en tareas downstream si no se fine-tunea con datos del dominio objetivo.
- La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, lo que dificulta evaluar la cobertura.
- No se documentan procesos de RLHF ni alineación (no aplicables a este tipo de modelo).
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el paper y el repositorio original.
- El ejemplo de uso de la model card es sintético (tensor aleatorio); no se proporcionan scripts de evaluación ni métricas reproducibles en el repo.
- La fecha de creación del repo (2026) y el número de descargas (21) indican un modelo reciente y con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/recon.pretrain.zekun-qi
- Paper ReCon (ICML 2023): https://arxiv.org/abs/2302.02318
- Paper ShapeNet: https://arxiv.org/abs/1512.03012
- Repositorio original ReCon: https://github.com/qizekun/ReCon
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
