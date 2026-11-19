# torch-pointcloud/pointmlp-base.scanobjectnn-hardest.xu-ma

## Resumen

PointMLP-base es un modelo de clasificación de nubes de puntos 3D basado en una arquitectura de perceptrón multicapa residual (residual MLP) con agrupación geométrica afín. Lo desarrollan Xu Ma, Can Qin, Haoxuan You, Haoxi Ran y Yun Fu, y esta ficha corresponde a una conversión del repositorio original `ma-xu/pointMLP-pytorch` al formato de la librería `torch-pointcloud`, publicada por el usuario `torch-pointcloud`. El modelo resuelve la tarea de clasificación de objetos 3D a partir de nubes de puntos sin estructura de rejilla, un problema central en visión por computador 3D, robótica y conducción autónoma.

La relevancia de este checkpoint concreto radica en que está entrenado sobre la variante más difícil de ScanObjectNN (PB_T50_RS), un dataset de objetos 3D escaneados del mundo real con oclusiones, ruido y perturbaciones, lo que lo convierte en una referencia práctica para evaluar modelos de clasificación de nubes de puntos en condiciones realistas. Con 13,2 millones de parámetros y 15 clases de salida, es un modelo compacto que puede ejecutarse en GPU de consumo.

El modelo no es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso. Es un extractor de características y clasificador geométrico que produce logits sobre 15 categorías o embeddings de 1024 dimensiones para tareas downstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PointMLP (residual MLP con geometric affine grouping) |
| Parámetros totales | 13.268.303 (13,2 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje); entrada de 8192 puntos en el ejemplo de uso |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de visión 3D, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 3 |
| Clases de salida | 15 |
| Dimensión de features | 1024 |
| Dataset de entrenamiento | ScanObjectNN (PB_T50_RS) |
| Tarea | Clasificación de nubes de puntos |

## Arquitectura y entrenamiento

PointMLP propone un diseño deliberadamente simple: elimina operadores complejos de convolución sobre puntos y apuesta por un framework de MLP residual. El bloque central es un *geometric affine module* que normaliza y transforma localmente las coordenadas de cada vecindario antes de aplicar capas MLP, seguido de agrupación y conexiones residuales que permiten apilar múltiples etapas sin degradación del gradiente. La entrada son coordenadas 3D (canal 3) y, opcionalmente, normales; la salida final es un vector de 1024 características que alimenta un clasificador lineal de 15 clases.

El entrenamiento se realiza sobre ScanObjectNN en su variante PB_T50_RS, que introduce perturbaciones y oclusiones sobre escaneos reales, lo que exige al modelo robustez geométrica. La model card no detalla el número de tokens ni la composición exacta del dataset, ni si hubo técnicas de aumento adicionales más allá de las del benchmark. La innovación destacable es la simplicidad estructural: al prescindir de operadores de vecindad costosos, el modelo reduce la complejidad computacional manteniendo precisión competitiva en clasificación de nubes de puntos.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 categorías de objetos (tarea `point-cloud-classification`).
- Extracción de embeddings de 1024 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`, útiles para transfer learning, recuperación o clustering.
- Procesamiento de nubes de puntos sin estructura de rejilla, con coordenadas y normales como entradas.
- Robustez ante oclusiones y perturbaciones, al estar entrenado sobre la variante más difícil de ScanObjectNN.
- Integración con la librería `torch-pointcloud` mediante `tp.create_model(..., pretrained=True)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni modo de pensamiento (*thinking mode*).
- No procesa imágenes, audio ni vídeo de forma nativa.

## Casos de uso

- Clasificación de objetos en robótica de manipulación: el modelo recibe la nube de puntos de una cámara de profundidad y predice la categoría del objeto para seleccionar la pinza o la estrategia de agarre; sus 13,2 M de parámetros permiten inferencia en tiempo real en GPU embebida.
- Etiquetado automático de escaneos 3D en pipelines de anotación: se usa como preetiquetador sobre nubes de puntos de LiDAR o fotogrametría, reduciendo el coste de anotación manual en datasets de objetos.
- Extracción de características para búsqueda y recuperación 3D: los embeddings de 1024 dimensiones sirven como descriptor geométrico para indexar modelos CAD o escaneos y recuperar objetos similares por vecindad en el espacio de features.
- Preentrenamiento para tareas downstream de segmentación o detección: el backbone PointMLP se reutiliza con `reset_classifier(num_classes=0)` y se añaden cabezas específicas, aprovechando las features geométricas aprendidas en ScanObjectNN.
- Control de calidad en fabricación aditiva: clasificación de piezas escaneadas para detectar categorías incorrectas o piezas fuera de especificación comparando la predicción con la etiqueta esperada.
- Investigación en visión 3D: línea base reproducible para comparar arquitecturas de clasificación de nubes de puntos sobre el split más difícil de ScanObjectNN, con métricas OA y mAcc declaradas.
- Clasificación de objetos en conducción autónoma o escaneo urbano: identificación de categorías de objetos a partir de nubes de puntos LiDAR, siempre que las 15 clases del dataset cubran las categorías de interés.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| ScanObjectNN (PB_T50_RS) | point-cloud-classification | OA (accuracy) | 85,81 |
| ScanObjectNN (PB_T50_RS) | point-cloud-classification | mAcc (accuracy) | 84,29 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa aproximadamente 0,1 GB en safetensors (13,2 M de parámetros en fp32), por lo que la inferencia requiere menos de 1 GB de VRAM, incluyendo activaciones para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funcionan RTX 3050, RTX 4060, RTX 4090, A100 y H100. Para lotes grandes de nubes de 8192 puntos conviene una GPU con 8 GB o más.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo con la librería `torch-pointcloud`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | OA en ScanObjectNN PB_T50_RS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointMLP-base (este checkpoint) | 13,2 M | 8192 puntos (ejemplo) | 85,81 | Apache-2.0 | Hugging Face, torch-pointcloud |
| PointNet++ | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Point Transformer | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| DGCNN | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo especializado en clasificación de nubes de puntos: no genera texto ni mantiene conversaciones; usarlo fuera de su tarea produce resultados sin sentido.
- Las métricas declaradas (OA 85,81, mAcc 84,29) están marcadas como no verificadas en la model-index; conviene reproducirlas antes de usarlas como referencia en producción.
- El modelo está entrenado en ScanObjectNN con 15 clases concretas; su rendimiento fuera de esa distribución (otros sensores, densidades, escalas o categorías) no está garantizado.
- Riesgo de degradación ante nubes de puntos con densidades muy distintas a las del entrenamiento o sin normales, ya que la entrada espera canales de posición y normales.
- No se documentan sesgos específicos del dataset ni evaluaciones de equidad; al ser un modelo geométrico, los sesgos provendrían de la distribución de objetos escaneados en ScanObjectNN.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y la atribución correspondiente; el modelo original de `ma-xu/pointMLP-pytorch` también es Apache-2.0.
- No hay información sobre cuantización ni despliegue en entornos de bajos recursos más allá de PyTorch.
- La fecha de creación del repositorio (2026-08-28) y la referencia a la librería `torch-pointcloud` indican que se trata de una conversión reciente; la compatibilidad con versiones futuras de la librería no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointmlp-base.scanobjectnn-hardest.xu-ma
- Paper PointMLP (arXiv 2202.07123): https://arxiv.org/abs/2202.07123
- Repositorio original PointMLP: https://github.com/ma-xu/pointMLP-pytorch
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset ScanObjectNN (paper ICCV 2019): no disponible enlace directo en la información proporcionada
