# torch-pointcloud/pointgpt-l.post-pretrain.guangyan-chen

## Resumen

PointGPT-L (post-pretrain, variante Guangyan Chen) es un modelo transformer de clasificación de nubes de puntos 3D, publicado en Hugging Face por la organización `torch-pointcloud` como conversión del repositorio original de PointGPT (CGuangyan-BIT). Se trata de un checkpoint afinado sobre el dataset LabeledHybrid a partir del modelo preentrenado `torch-pointcloud/pointgpt-l.pretrain.guangyan-chen`, y su propósito es asignar una de 87 clases semánticas a una nube de puntos completa (clasificación a nivel de objeto/escena).

El modelo implementa la propuesta de PointGPT (NeurIPS 2023): un transformer que aplica preentrenamiento generativo autorregresivo sobre secuencias de parches de nube de puntos, análogo a un GPT para texto pero operando sobre tokens geométricos 3D. Con 360,4 millones de parámetros y un vector de características de 2048 dimensiones, está pensado para tareas de percepción 3D donde se requiere un extractor de representaciones robusto y un clasificador ligero acoplado.

Su relevancia actual es práctica: el ecosistema de modelos 3D abiertos es mucho más reducido que el de texto o imagen, y disponer de un checkpoint PointGPT-L en formato `safetensors` e integrado en la librería `torch-pointcloud` facilita su uso directo en pipelines de PyTorch sin tener que reproducir el entrenamiento original. La licencia MIT y el tamaño moderado del repositorio (1,4 GB) lo hacen accesible para investigación y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con preentrenamiento generativo autorregresivo sobre parches de nube de puntos (PointGPT) |
| Parametros totales | 360.384.439 (360,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre 8192 puntos por muestra en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico; procesa geometria 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 87 |
| Dimension de caracteristicas | 2048 |
| Dataset de afinado | LabeledHybrid |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

PointGPT es un transformer que traslada el paradigma de preentrenamiento autorregresivo de los modelos de lenguaje al dominio de las nubes de puntos. La nube se divide en parches locales que se serializan en una secuencia ordenada; el modelo aprende a predecir el siguiente parche a partir de los anteriores, lo que fuerza a construir representaciones geométricas jerárquicas y contextuales. Sobre esa base preentrenada se acopla una cabeza de clasificación para la tarea downstream.

El checkpoint aquí descrito corresponde a la fase de post-pretrain/afinado sobre el dataset LabeledHybrid, partiendo del modelo preentrenado `pointgpt-l.pretrain.guangyan-chen`. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o preferencias (no aplicables en este dominio). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal; la contribución técnica principal documentada es el propio esquema de preentrenamiento generativo autorregresivo descrito en el paper de NeurIPS 2023.

## Capacidades

- Clasificación de nubes de puntos 3D en 87 clases semánticas a partir de coordenadas XYZ.
- Extracción de características: `forward_features` produce embeddings de 2048 dimensiones utilizables para tareas downstream (detección, segmentación por transferencia, recuperación).
- Configuración del clasificador a cero clases (`reset_classifier(num_classes=0)`) para obtener representaciones puras.
- Procesamiento por lotes con gestión explícita de índices de batch (`data["batch"]`), lo que permite agrupar varias nubes en una sola pasada.
- Integración nativa con PyTorch mediante la librería `torch-pointcloud` y su utilidad `collate`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente geométrico, no generativo de texto.

## Casos de uso

- Clasificación de objetos 3D en pipelines de robótica: el modelo recibe la nube de puntos captada por un sensor LiDAR o RGB-D y devuelve la clase del objeto, útil para manipulación y agarre automático gracias a sus 87 clases y a la extracción de features de 2048 dimensiones.
- Preprocesado en sistemas de conducción autónoma: clasificación de clusters segmentados de escenas viarias (vehículos, peatones, mobiliario urbano) como etapa previa a la detección fina, aprovechando la robustez del preentrenamiento autorregresivo.
- Búsqueda y recuperación de modelos 3D: usar los embeddings de 2048 dimensiones como firma geométrica para indexar y recuperar mallas o escaneos similares en un catálogo.
- Control de calidad industrial: inspección de piezas escaneadas en línea de producción, clasificando la nube de puntos de cada pieza en categorías de defecto o tipo de componente.
- Etiquetado asistido de datos 3D: preanotar grandes volúmenes de nubes de puntos para reducir el coste de anotación manual, con revisión humana posterior.
- Transfer learning a tareas de segmentación: inicializar un codificador con `forward_features` y añadir cabezas específicas para segmentación semántica o de partes, aprovechando el preentrenamiento a gran escala.
- Digitalización de patrimonio y BIM: clasificación de escaneos de edificios o yacimientos en elementos estructurales para reconstrucción y documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,5 GB solo para pesos (360,4 M de parámetros), más activaciones; en la práctica, entre 2 y 4 GB según el tamaño de lote y el número de puntos por muestra.
- VRAM estimada en FP16/BF16: alrededor de 0,8 GB para pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema. El modelo es pequeño para los estándares actuales.
- Cabe holgadamente en GPU de consumo: sí, en cualquier tarjeta moderna con 6-8 GB o más.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de nubes de puntos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointGPT-L (este) | 360,4 M | 8192 puntos (ejemplo) | Clasificación 3D, 87 clases | MIT | Hugging Face + torch-pointcloud |
| PointGPT-L pretrain (`pointgpt-l.pretrain.guangyan-chen`) | no disponible | no disponible | Preentrenamiento base, sin cabeza de clasificación | MIT | Hugging Face |
| PointGPT original (CGuangyan-BIT) | no disponible | no disponible | Clasificación y segmentación 3D | MIT | GitHub |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos comparables (Point-MAE, Point-BERT, ULIP) en la información proporcionada, por lo que no se incluye comparación cuantitativa.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en nubes de puntos 3D: no procesa texto, imágenes ni audio, y no debe evaluarse con métricas de modelos lingüísticos.
- El número de clases está fijado en 87; para otras taxonomías es necesario reentrenar la cabeza de clasificación o usar `reset_classifier`.
- No se documenta el dominio exacto del dataset LabeledHybrid ni su composición, lo que dificulta estimar el sesgo de dominio (posibles sesgos hacia las clases y sensores representados en ese dataset).
- Riesgo de degradación ante distribuciones fuera de dominio: densidades de puntos, ruido de sensor o escalas distintas a las del entrenamiento pueden reducir la precisión.
- No hay información sobre calibración de confianza ni sobre el comportamiento del modelo ante entradas incompletas u ocluidas.
- La licencia MIT permite uso comercial, pero conviene verificar las licencias de los datos de entrenamiento originales (LabeledHybrid) antes de un despliegue en producción.
- El checkpoint se distribuye como conversión de un repositorio de terceros; no se garantiza paridad exacta con los resultados del paper original.
- No se especifican requisitos de preprocesado más allá de la transformación incluida en `info["transform"]`; usos fuera de ese pipeline pueden dar resultados incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-l.post-pretrain.guangyan-chen
- Modelo base preentrenado: https://huggingface.co/torch-pointcloud/pointgpt-l.pretrain.guangyan-chen
- Paper PointGPT (arXiv): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
