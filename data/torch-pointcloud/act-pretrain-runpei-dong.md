# torch-pointcloud/act.pretrain.runpei-dong

## Resumen

ACT (Autoencoder as Cross-Modal Teacher) es un modelo de preentrenamiento autosupervisado para representaciones de nubes de puntos 3D, desarrollado por Runpei Dong y colaboradores (publicado en ICLR 2023). La idea central del trabajo es utilizar un transformer de imagenes 2D preentrenado como "profesor" para destilar conocimiento hacia un transformer de puntos 3D enmascarado, aprovechando que las representaciones visuales 2D contienen informacion semantica transferible al dominio 3D. El modelo aqui presentado es la version convertida a la libreria `torch-pointcloud` por Arthur Dujardin.

Esta ficha describe un checkpoint de preentrenamiento, no un modelo generativo de lenguaje. Con 141,8 millones de parametros, el modelo se ha preentrenado sobre ShapeNet-55 mediante un objetivo de reconstruccion enmascarada de nubes de puntos, y su proposito es servir como inicializacion para tareas posteriores de clasificacion, segmentacion o deteccion sobre geometria 3D. No dispone de tokenizador de texto, no procesa lenguaje natural y no genera texto.

Su relevancia actual reside en el ecosistema de representacion 3D autosupervisada: permite obtener embeddings de nubes de puntos sin etiquetas y reutilizar el conocimiento de modelos de vision 2D, lo que reduce la dependencia de anotaciones 3D costosas. La licencia MIT y la disponibilidad en formato safetensors facilitan su integracion en pipelines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de nubes de puntos con enmascaramiento (masked point transformer), destilado desde un transformer de imagenes 2D |
| Parametros totales | 141.761.947 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de puntos de hasta 8192 puntos segun el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo 3D, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la propuesta de ACT: un autoencoder enmascarado sobre nubes de puntos que actua como estudiante y se alinea, mediante destilacion entre modalidades, con las representaciones de un transformer de imagenes 2D preentrenado que actua como profesor. Durante el preentrenamiento se enmascaran porciones de la nube de puntos y el modelo debe reconstruirlas, mientras las capas ocultas se supervisan para aproximar las activaciones del profesor visual sobre vistas renderizadas del mismo objeto. Esta estrategia cross-modal evita depender unicamente de la geometria local y aporta senal semantica de alto nivel.

El preentrenamiento se realiza sobre ShapeNet-55, un subconjunto de ShapeNet con 55 categorias de objetos 3D. No se dispone en la informacion proporcionada del numero exacto de tokens, de la composicion detallada del dataset ni de si se aplicaron etapas de RLHF o DPO (lo cual, por otra parte, no seria esperable en un modelo de representacion 3D). El checkpoint ha sido convertido desde el repositorio original `RunpeiDong/ACT` a la libreria `torch-pointcloud`, que expone una API de creacion de modelo y un `collate` para preparar lotes de puntos con claves `x`, `pos` y `batch`.

## Capacidades

- Extraccion de representaciones (embeddings) de nubes de puntos 3D para tareas downstream.
- Reconstruccion de geometria enmascarada (objetivo de preentrenamiento).
- Aprendizaje autosupervisado: no requiere etiquetas durante el preentrenamiento.
- Transferencia cross-modal: aprovecha conocimiento de un transformer de imagenes 2D.
- Procesamiento de nubes de puntos de hasta 8192 puntos en el ejemplo de uso documentado.
- Soporte de inferencia por lotes mediante `collate` y paso de tensores `x`, `pos` y `batch`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision ni audio en el sentido de un modelo multimodal generativo.

## Casos de uso

- Clasificacion de objetos 3D: usar los embeddings del modelo como inicializacion o extractor de caracteristicas congelado y entrenar una cabeza lineal sobre categorias de ShapeNet u otros datasets, aprovechando que el preentrenamiento ya ha capturado estructura geometrica y semantica.
- Segmentacion semantica de nubes de puntos: emplear las representaciones por punto como entrada a un decodificador de segmentacion en escenarios de escaneo de interiores o vehiculos, donde las etiquetas 3D son escasas.
- Preentrenamiento para dominios con pocas etiquetas: inicializar un modelo de deteccion o segmentacion 3D en aplicaciones industriales (inspeccion de piezas, robotica de manipulacion) donde anotar datos 3D es caro.
- Aumento de datos y reconstruccion: utilizar el objetivo de reconstruccion enmascarada para completar o limpiar nubes de puntos parciales procedentes de escaneres o LiDAR de baja densidad.
- Investigacion en representacion 3D autosupervisada: servir como baseline reproducible para comparar estrategias de destilacion cross-modal 2D-3D en experimentos academicos.
- Integracion en pipelines de PyTorch: al estar empaquetado en `torch-pointcloud` con pesos safetensors, se puede cargar con `tp.create_model` y encadenar con otras capas en un grafo de entrenamiento existente.
- Recuperacion de formas 3D (shape retrieval): generar embeddings de objetos y buscar similitudes geometricas en catalogos de modelos CAD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de tareas 3D como classification accuracy o mIoU sobre ShapeNet.

## Requisitos de hardware

- VRAM estimada para inferencia: con 141,8 M de parametros en precision FP32, los pesos ocupan aproximadamente 0,57 GB; en FP16, unos 0,28 GB. La memoria total dependera del tamano del lote y del numero de puntos por muestra (el ejemplo usa 8192 puntos).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en FP32 con lotes pequenos; se recomiendan RTX 3060, RTX 4090, A100 o H100 para entrenamiento o lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1060 6 GB en adelante), dado el reducido tamano del modelo.
- Opciones de despliegue: la libreria `torch-pointcloud` sobre PyTorch es la via documentada; no se dispone de soporte documentado para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este checkpoint) | 141,8 M | nubes de puntos (hasta 8192 puntos en el ejemplo) | Preentrenamiento autosupervisado 3D | MIT | Hugging Face (`torch-pointcloud/act.pretrain.runpei-dong`) |
| Point-MAE | no disponible en la informacion | nubes de puntos | Preentrenamiento autosupervisado 3D | no disponible | no disponible |
| Point-BERT | no disponible en la informacion | nubes de puntos | Preentrenamiento autosupervisado 3D | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas con Point-MAE o Point-BERT, que son las alternativas mas directas en preentrenamiento autosupervisado de nubes de puntos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no debe evaluarse con benchmarks de NLP.
- El preentrenamiento se limita a ShapeNet-55; el rendimiento en dominios alejados (LiDAR exterior, escenas a gran escala, datos medicos) puede degradarse sin ajuste fino.
- La capacidad de entrada documentada en el ejemplo es de 8192 puntos; nubes de mayor densidad requeriran submuestreo o adaptacion.
- Riesgo de sesgo de dominio: ShapeNet contiene objetos sinteticos de categorias controladas, lo que puede introducir sesgos hacia geometrias limpias y no reflejar ruido real de sensores.
- No se dispone de informacion sobre sesgos demograficos (no aplica) ni sobre tasas de alucinacion (no aplica a un modelo de representacion).
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda conservar la atribucion al trabajo original y a la conversion.
- Al ser un checkpoint de preentrenamiento, no produce predicciones utiles por si solo; requiere una cabeza de tarea y datos etiquetados para resultados finales.
- La fecha de creacion indicada en el repositorio (2026) y la escasa actividad (21 descargas, 0 likes) sugieren un modelo poco validado por la comunidad; conviene verificar la reproducibilidad antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/act.pretrain.runpei-dong
- Paper ACT (arXiv 2212.08320): https://arxiv.org/abs/2212.08320
- Paper ShapeNet (arXiv 1512.03012): https://arxiv.org/abs/1512.03012
- Repositorio original ACT: https://github.com/RunpeiDong/ACT
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
