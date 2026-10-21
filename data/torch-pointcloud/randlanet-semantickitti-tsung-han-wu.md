# torch-pointcloud/randlanet.semantickitti.tsung-han-wu

## Resumen

RandLA-Net es una red neuronal para segmentación semántica de nubes de puntos a gran escala. Esta ficha corresponde a la versión concreta publicada en HuggingFace bajo el identificador `torch-pointcloud/randlanet.semantickitti.tsung-han-wu`, una conversión al formato safetensors del repositorio `tsunghan-wu/RandLA-Net-pytorch`, empaquetada para la librería `torch-pointcloud`. El modelo resuelve la asignación de una clase semántica a cada punto individual de un escaneo LiDAR, con 19 clases de salida (carretera, acera, vehículo, peatón, vegetación, edificio, etc.).

El problema que aborda es el coste cuadrático de los mecanismos de atención y del muestreo tipo *farthest point sampling* en nubes de puntos de decenas de miles de puntos. RandLA-Net sustituye ambos por muestreo aleatorio y agregación local de características, lo que reduce el coste computacional y de memoria de forma drástica. Con 1.245.691 parámetros (1,2 M), es un modelo extremadamente compacto, diseñado para operar sobre escaneos completos de LiDAR rotacional en un solo paso.

Es relevante ahora por su tamaño reducido, su licencia MIT y su disponibilidad en un formato de pesos único (safetensors) integrado en una librería de PyTorch, lo que facilita integrarlo en pipelines de percepción 3D, robótica y etiquetado automático. Los resultados declarados por el autor son mIoU 55,39 y OA 90,05 sobre SemanticKITTI, no verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RandLA-Net (muestreo aleatorio + agregación local de características, red encoder-decoder sobre nube de puntos) |
| Parametros totales | 1.245.691 (1,2 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de nube de puntos (el ejemplo de la model card usa 8192 puntos por muestra) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se han publicado variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión 3D, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 3 |
| Clases de salida | 19 (conjunto de clases de SemanticKITTI) |
| Dimension de caracteristicas | 32 |
| Dataset de entrenamiento | SemanticKITTI |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0.0 GB (pesos de ~1,2 M de parametros) |

## Arquitectura y entrenamiento

RandLA-Net es una red puramente de nube de puntos, sin vóxeles ni proyecciones 2D. Su bloque distintivo es la agregación local de características (*local feature aggregation*), que combina distancias relativas de posición, características locales y atención espacial sobre vecinos, aplicada tras un muestreo aleatorio de puntos en cada etapa de bajada del encoder. El decoder recupera la resolución mediante interpolación de características y conexiones de salto, hasta producir un logit por clase y por punto. En esta implementación los hiperparámetros registrados son 3 canales de entrada, 32 dimensiones de característica y 19 clases de salida.

No se detalla en la información disponible el número de tokens ni la composición exacta del dataset de entrenamiento más allá de SemanticKITTI (escaneos LiDAR de secuencias de conducción urbana y de carretera, con 19 clases evaluables). Tampoco se documenta si hubo entrenamiento adicional, ajuste fino o estrategias de aumento de datos en esta conversión concreta. La model card indica únicamente la procedencia de los pesos (`tsunghan-wu/RandLA-Net-pytorch`, MIT) y la integración en `torch-pointcloud`; no se describen innovaciones adicionales como decodificación especulativa, atención lineal o módulos híbridos, que no aplican a este tipo de modelo.

## Capacidades

- Segmentación semántica por punto de nubes de puntos LiDAR en 19 clases (vehículo, peatón, carretera, acera, edificio, vegetación, tronco, terreno, poste, señal de tráfico, entre otras).
- Procesamiento de escaneos completos de gran tamaño gracias al muestreo aleatorio, sin necesidad de particionar la nube en vóxeles.
- Extracción de características: `forward_features` devuelve un descriptor de 32 dimensiones por punto, reutilizable para clustering, recuperación o modelos posteriores.
- Clasificador reconfigurable: `reset_classifier(num_classes=0)` permite usar el backbone como extractor puro.
- Procesamiento por lotes con índices de batch (`data["batch"]`), lo que permite concatenar varias nubes en una sola pasada.
- Integración nativa con PyTorch y con utilidades de datos de `torch-pointcloud` (transformaciones y `collate`).
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo *thinking*, entrada de audio, imagen 2D ni vídeo.

## Casos de uso

- Percepción para conducción autónoma: segmentar escaneos LiDAR completos para separar carretera, vehículos, peatones y vegetación antes de pasos de detección y seguimiento. Su coste de 1,2 M de parámetros permite ejecutarlo a bordo o en un equipo embebido.
- Etiquetado automático de datos (*pre-labeling*): generar máscaras semánticas iniciales sobre nuevas secuencias LiDAR para que anotadores humanos solo corrijan, reduciendo el coste de construir datasets 3D.
- Robótica móvil y navegación: clasificar el terreno circundante en tiempo real para distinguir superficies transitables (carretera, acera, terreno) de obstáculos (edificio, poste, tronco).
- Mantenimiento de mapas e inventario urbano: extraer clases estáticas como edificios, vallas, postes y señales de tráfico de barridos LiDAR para auditoría de infraestructura.
- Extracción de descriptores para búsqueda y clustering: usar los vectores de 32 dimensiones por punto (`forward_features`) como entrada a modelos de segmentación de instancias, agrupamiento o recuperación de escenas similares.
- Inspección de corredores de carretera y ferrocarril: segmentar vegetación y elementos verticales junto a la vía para priorizar tareas de desbroce y mantenimiento.
- Prototipado e investigación en percepción 3D: al ser un modelo pequeño con licencia MIT y pesos en safetensors, sirve como línea base reproducible para comparar arquitecturas o estrategias de muestreo.
- Control de calidad de sensores: comparar la distribución de clases predichas frente a la esperada en un tramo conocido para detectar degradación o descalibración del LiDAR.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; campo `verified: false`).

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| SemanticKITTI | Segmentación semántica de nube de puntos | mIoU | 55,39 |
| SemanticKITTI | Segmentación semántica de nube de puntos | OA (accuracy global) | 90,05 |

No se han publicado en la información disponible resultados por clase, ablation studies ni comparaciones directas con otras arquitecturas sobre el mismo split.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 5 MB en fp32 (~2,5 MB en fp16) para 1.245.691 parámetros. Cifra estimada a partir del número de parámetros; no publicada por el autor.
- La memoria real en inferencia la dominan las activaciones y la búsqueda de vecinos (KNN) sobre la nube, no los pesos. Con 8192 puntos por muestra y lotes pequeños, un presupuesto de 2-4 GB de VRAM es suficiente en la mayoría de configuraciones; cifra estimada, no medida por el autor.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA es sobradamente suficiente. Por tamaño, el modelo está pensado para GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso para inferencia en CPU en escenarios de baja frecuencia.
- Cabe en GPU de consumo: sí, con margen amplio; también es viable en CPU y en dispositivos embebidos con PyTorch.
- Opciones de despliegue: PyTorch nativo con la librería `torch-pointcloud` (vía `pip install torch-pointcloud`); exportación a TorchScript u ONNX no documentada en la información disponible. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia por escaneo ni de puntos por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| randlanet.semantickitti.tsung-han-wu (esta ficha) | 1,2 M | Nube de puntos, 3 canales, 19 clases | 55,39 (declarado, no verificado) | MIT | Pesos safetensors en HuggingFace |
| RandLA-Net original (implementación de referencia, CVPR 2020) | no disponible | Nube de puntos | no disponible en la informacion proporcionada | no disponible | Codigo en repositorios de los autores del paper |
| RandLA-Net-pytorch (tsunghan-wu) | no disponible | Nube de puntos | no disponible en la informacion proporcionada | MIT | Repositorio GitHub; origen de esta conversión |
| PointNet++ / KPConv / Cylinder3D (familia de segmentación 3D) | no disponible | Nube de puntos o vóxeles | no disponible en la informacion proporcionada | no disponible | Implementaciones públicas, no evaluadas aquí |

No se dispone de datos de benchmarks de las alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda pendiente. La ventaja diferencial de esta ficha es la disponibilidad inmediata de pesos en safetensors, licencia MIT y una API de carga de una sola línea frente a la necesidad de reproducir el entrenamiento en los repositorios originales.

## Limitaciones y advertencias

- Modelo de dominio muy específico: entrenado sobre SemanticKITTI (escenas de conducción con LiDAR rotacional, entorno alemán). El rendimiento en interiores, entornos industriales, otros sensores o densidades de punto distintas puede degradarse notablemente; no se documenta ninguna evaluación de transferencia.
- Métricas no verificadas: mIoU 55,39 y OA 90,05 figuran como declaradas por el autor (`verified: false`). No deben tratarse como resultados reproducidos de forma independiente.
- Sin métricas por clase: la media de IoU oculta clases minoritarias (por ejemplo, motorista o ciclista) que suelen tener IoU bajo. No se puede estimar el rendimiento en clases raras con los datos disponibles.
- Muestreo aleatorio no determinista: el muestreo de puntos introduce variabilidad entre ejecuciones si no se fija la semilla, lo que puede producir predicciones ligeramente distintas para la misma nube. Conviene fijar semilla en producción.
- Dependencia de la librería: la carga requiere `torch-pointcloud`; no se han publicado pesos en GGUF, ONNX ni TorchScript, por lo que la portabilidad a otros runtimes exige exportación manual.
- Sesgos y alucinación: al no ser un modelo generativo, no hay riesgo de alucinación textual; el riesgo equivalente es la asignación errónea de clase con alta confianza en puntos ambiguos (por ejemplo, estructuras verticales finas o superficies mojadas).
- Idiomas y texto: sin capacidades lingüísticas; no puede usarse para tareas de NLP.
- Licencia: MIT permite uso comercial y modificación, pero no se especifica en la información disponible la licencia de la propia librería `torch-pointcloud` ni la de las dependencias; conviene verificarla antes de un despliegue comercial.
- Sin datos de robustez: no se documenta comportamiento frente a oclusiones, lluvia, sensores con distinta calibración o nubes submuestreadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/randlanet.semantickitti.tsung-han-wu
- Paper RandLA-Net (CVPR 2020): https://arxiv.org/abs/1911.11236
- Repositorio de origen de los pesos (tsunghan-wu/RandLA-Net-pytorch): https://github.com/tsunghan-wu/RandLA-Net-pytorch
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Dataset SemanticKITTI: http://semantic-kitti.org/
- Documentacion de PyTorch: https://pytorch.org/
- Instalacion de PyTorch: https://pytorch.org/get-started/locally/
