# torch-pointcloud/pointgpt-b.pretrain.guangyan-chen

## Resumen

PointGPT-B es un modelo de preentrenamiento auto-supervisado para nubes de puntos 3D, desarrollado originalmente por Guangyan Chen, Meiling Wang, Yi Yang, Kai Yu, Li Yuan y Yufeng Yue (Universidad de Pekín / BIT) y publicado en NeurIPS 2023. Esta ficha corresponde a la conversión del checkpoint original al formato de la librería `torch-pointcloud`, mantenida por Arthur Dujardin, que empaqueta los pesos en `safetensors` y expone una API unificada de carga mediante `tp.create_model`.

El modelo aplica un paradigma de preentrenamiento generativo autorregresivo, análogo a GPT pero sobre secuencias de parches de nube de puntos en lugar de tokens de texto. El objetivo es aprender representaciones geométricas transferibles que luego se afinan para tareas downstream como clasificación de formas, segmentación de partes o segmentación semántica de escenas. Con 119,9 M de parámetros, se sitúa en la gama media de los backbones 3D y está pensado como extractor de características, no como modelo generativo de uso directo.

Su relevancia actual reside en que ofrece un backbone 3D preentrenado con licencia MIT, pesos en formato abierto y una integración directa en PyTorch, lo que reduce la fricción para experimentar con aprendizaje auto-supervisado en visión 3D sin depender de checkpoints cerrados o de pipelines de investigación frágiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer generativo autorregresivo sobre parches de nube de puntos (PointGPT) |
| Parametros totales | 119.925.856 (~119,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre un numero fijo de puntos de entrada; el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (modelo de vision 3D, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PointGPT es un transformer encoder con preentrenamiento generativo autorregresivo. La nube de puntos se divide en parches locales mediante agrupamiento geométrico; cada parche se codifica en un embedding y la secuencia resultante se procesa con atención. El objetivo de preentrenamiento consiste en predecir el siguiente parche a partir de los anteriores, lo que fuerza al modelo a modelar la estructura global de la forma además de la geometría local. La variante "B" corresponde al tamaño base de la familia PointGPT, con 119,9 M de parámetros.

El checkpoint de esta ficha es el resultado del preentrenamiento auto-supervisado sobre el conjunto `UnlabeledHybrid`, un agregado de nubes de puntos sin etiquetas que combina varias fuentes de formas 3D. La model card menciona además ShapeNet-55 en los resultados de búsqueda, lo que sugiere que el corpus híbrido incluye esa partición. No se documentan en la información disponible el número exacto de tokens/parches vistos, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en este dominio). La conversión a `torch-pointcloud` preserva la arquitectura original y añade una capa de compatibilidad con la API de la librería (`collate`, `create_model`).

## Capacidades

- Extracción de características geométricas de nubes de puntos 3D (representaciones latentes por parche y globales).
- Preentrenamiento auto-supervisado: sirve como inicialización para afinar en tareas downstream.
- Clasificación de formas 3D tras añadir una cabeza de clasificación y afinar (existe un checkpoint post-pretrain del mismo autor orientado a clasificación).
- Segmentación de partes y segmentación semántica de escenas tras el afinado correspondiente.
- Procesamiento de nubes de puntos con un número configurable de puntos de entrada (el ejemplo de la model card usa 8192).
- Inferencia en PyTorch puro, sin dependencias de kernels propietarios.
- No soporta texto, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión 3D.
- No dispone de modo "thinking", visión 2D, audio ni generación de lenguaje.

## Casos de uso

- Inicialización para clasificación de objetos 3D: se carga el backbone preentrenado, se congela o afina y se añade una cabeza lineal para clasificar formas en datasets tipo ModelNet o ShapeNet, aprovechando que el preentrenamiento ya captura estructura local y global.
- Segmentación de partes de objetos CAD: útil en pipelines de ingeniería inversa o edición de mallas, donde el modelo aporta representaciones por parche que se asignan a etiquetas de componente.
- Segmentación semántica de escenas LiDAR: como punto de partida para anotación asistida de nubes de puntos de conducción autónoma, reduciendo el volumen de etiquetado manual necesario.
- Preetiquetado en pipelines de anotación 3D: el modelo genera representaciones que alimentan clasificadores débiles para proponer etiquetas a anotadores humanos, acortando el ciclo de curación de datasets.
- Robótica de manipulación: extracción de descriptores geométricos de objetos capturados por cámaras de profundidad para tareas de agarre y estimación de pose, usando el backbone como encoder congelado.
- Investigación en aprendizaje auto-supervisado 3D: banco de pruebas reproducible con licencia MIT para comparar estrategias de enmascaramiento, tokenización de parches u objetivos generativos frente a contrastivos.
- Búsqueda y recuperación de formas 3D: los embeddings globales permiten construir índices vectoriales para recuperar modelos similares en catálogos de assets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB solo para pesos, más activaciones; con 8192 puntos y batch pequeño, el consumo total se mantiene por debajo de 2-3 GB.
- VRAM estimada en FP16/BF16: en torno a 0,25 GB de pesos, con un pico de activaciones dependiente del número de puntos y del tamaño de batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. Para entrenamiento/afinado con batches grandes, se recomienda A100 o H100.
- Cabe holgadamente en GPU de consumo: sí, en toda la gama RTX y en GPUs integradas con suficiente memoria compartida para lotes pequeños.
- Opciones de despliegue: PyTorch nativo con la librería `torch-pointcloud`; exportación a TorchScript u ONNX posible pero no documentada en la información disponible. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointGPT-B (este) | 119,9 M | nube de puntos, 8192 puntos en el ejemplo | Preentrenamiento auto-supervisado 3D | MIT | Hugging Face, safetensors |
| PointGPT-B post-pretrain (mismo autor) | no disponible | nube de puntos | Clasificación 3D afinada sobre LabeledHybrid | MIT | Hugging Face |
| Alternativas tipo Point-MAE / Point-BERT | no disponible | nube de puntos | Preentrenamiento auto-supervisado 3D | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de las alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento, no un modelo listo para producción: sin una cabeza de tarea y afinado, no produce predicciones útiles directamente.
- No procesa texto ni imágenes 2D; cualquier caso de uso debe formularse como tarea sobre nubes de puntos.
- El rendimiento depende críticamente del número de puntos de entrada y del esquema de muestreo; el ejemplo de la model card usa 8192 puntos y desviarse de ese régimen puede degradar las representaciones.
- Riesgo de sesgo geométrico: el preentrenamiento sobre `UnlabeledHybrid` (con ShapeNet-55 mencionado) puede sobrerrepresentar categorías de objetos comunes y generalizar peor en escenas industriales, médicas o de interior poco representadas.
- No hay métricas publicadas en esta ficha que permitan estimar la tasa de error en tareas downstream; se recomienda validar en el dominio objetivo antes de desplegar.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero conviene verificar las licencias de los datasets de origen (`UnlabeledHybrid`, ShapeNet-55) si se redistribuyen derivados.
- El repositorio tiene un volumen de descargas muy bajo (17) y cero likes, lo que implica escasa validación comunitaria del checkpoint convertido.
- No se documentan variantes cuantizadas ni soporte para runtimes de inferencia optimizados, lo que limita despliegues de baja latencia.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/torch-pointcloud/pointgpt-b.pretrain.guangyan-chen
- Hugging Face (post-pretrain, clasificación): https://huggingface.co/torch-pointcloud/pointgpt-b.post-pretrain.guangyan-chen
- Paper PointGPT (arXiv:2305.11487): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
