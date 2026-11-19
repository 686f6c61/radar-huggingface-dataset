# torch-pointcloud/randlanet.semantickitti.tsung-han-wu

## Resumen

RandLA-Net es un modelo de segmentación semántica de nubes de puntos 3D, diseñado para etiquetar cada punto de un barrido LiDAR con una de 19 clases (carretera, vehículo, peatón, vegetación, etc.). Este checkpoint concreto, `torch-pointcloud/randlanet.semantickitti.tsung-han-wu`, es una conversión a safetensors del entrenamiento original en PyTorch de Tsung-Han Wu, empaquetada para la librería `torch-pointcloud`. El modelo resuelve el problema clásico de la segmentación de nubes de puntos a gran escala: cómo procesar decenas de miles de puntos por fotograma sin recurrir a voxelización costosa ni a operaciones de vecindad lentas.

La arquitectura RandLA-Net, presentada en CVPR 2020 por Hu et al., se apoya en dos ideas: muestreo aleatorio (random sampling) en lugar de muestreo FPS (farthest point sampling) para reducir el número de puntos de forma eficiente, y un módulo de agregación de características locales (Local Feature Aggregation) que combina atención espacial y pooling para preservar la geometría. El resultado es un modelo muy ligero, con apenas 1,2 millones de parámetros, que puede procesar nubes de puntos de gran tamaño en una sola pasada.

Su relevancia actual es práctica: sirve como línea base ligera y reproducible para tareas de percepción LiDAR en conducción autónoma, robótica móvil y cartografía, y como componente de extracción de características para pipelines posteriores. La licencia MIT y el formato safetensors facilitan su integración en producción sin fricción legal ni de serialización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RandLA-Net (random sampling + local feature aggregation) |
| Parámetros totales | 1.245.691 (≈1,2 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de nubes de puntos, no de texto) |
| Tipos de cuantización | no disponible (pesos en safetensors en precisión original) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `torch-pointcloud`) |

Otros datos técnicos declarados en la model card: canales de entrada 3, 19 clases de salida, 32 características por punto, dataset de entrenamiento SemanticKITTI.

## Arquitectura y entrenamiento

RandLA-Net es una red neuronal de segmentación por punto basada en codificador-decodificador con muestreo aleatorio jerárquico. En cada nivel de codificación se aplica random sampling para diezmar la nube de puntos, seguido de un módulo de agregación de características locales que combina una unidad de atención espacial (que pondera la importancia relativa de cada vecino) con un pooling por atención (que agrega la información de los vecinos). Este diseño evita el coste cuadrático del muestreo FPS y de las búsquedas de vecindad densas, manteniendo la capacidad de capturar estructura local. El decodificador interpola las características mediante k-NN y las concatena con las del codificador para refinar la predicción por punto.

El entrenamiento se realizó sobre SemanticKITTI, el benchmark de segmentación semántica de secuencias LiDAR (Behley et al., ICCV 2019), con 19 clases evaluables. La model card no detalla el número de tokens/puntos vistos, la composición exacta del dataset ni si hubo aumento de datos específico; esos datos no están disponibles en la información proporcionada. El checkpoint procede de la implementación de Tsung-Han Wu (`tsunghan-wu/RandLA-Net-pytorch`, MIT) y ha sido convertido al formato de la librería `torch-pointcloud` de Arthur Dujardin.

## Capacidades

- Segmentación semántica por punto de nubes de puntos 3D: asigna una de 19 clases a cada punto de entrada.
- Procesamiento de nubes de puntos de gran escala mediante muestreo aleatorio, sin necesidad de voxelización.
- Extracción de características por punto: `forward_features` devuelve un vector de 32 dimensiones por punto.
- Reutilización como backbone: `reset_classifier(num_classes=0)` permite usar el modelo como extractor de características para tareas posteriores (detección, clasificación de escenas, clustering).
- Entrada con canales posicionales (3) más intensidad opcional, según el pipeline de datos de la librería.
- Inferencia por lotes con gestión de índices de batch (`data["batch"]`).
- No dispone de tool calling, agentes, capacidades multilingües ni modos de razonamiento; no es un modelo de lenguaje.

## Casos de uso

- Percepción LiDAR en conducción autónoma: el modelo etiqueta cada punto de un barrido LiDAR con clases de carretera, vehículos, peatones y vegetación, alimentando módulos de planificación y fusión sensorial. Su tamaño de 1,2 M de parámetros permite inferencia en tiempo real en GPUs modestas.
- Robótica móvil y navegación: un robot equipado con LiDAR puede usar el modelo para construir mapas semánticos del entorno y distinguir superficies transitables de obstáculos, con un coste computacional bajo que deja margen para otros módulos de percepción.
- Cartografía y modelado urbano: procesamiento por lotes de nubes de puntos de escaneos urbanos para generar mapas etiquetados (edificios, vegetación, suelo) que alimentan sistemas GIS.
- Anotación asistida de datos: el modelo preetiqueta nubes de puntos nuevas y los anotadores humanos solo corrigen errores, reduciendo el coste de crear datasets de segmentación semántica.
- Extracción de características para downstream: usando `forward_features` se obtienen embeddings de 32 dimensiones por punto que pueden alimentar clasificadores de escena, detección de anomalías o clustering no supervisado.
- Vehículos aéreos no tripulados y fotogrametría: segmentación semántica de nubes de puntos derivadas de reconstrucción fotogramétrica para separar suelo, vegetación y estructuras en levantamientos topográficos.
- Investigación y benchmarking: línea base ligera y reproducible para comparar nuevas arquitecturas de segmentación de nubes de puntos sobre SemanticKITTI con licencia MIT.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| SemanticKITTI | Segmentación de nubes de puntos | mIoU | 55,33 |
| SemanticKITTI | Segmentación de nubes de puntos | OA (accuracy) | 90,06 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 1,2 M de parámetros, los pesos ocupan aproximadamente 5 MB en FP32 (≈2,5 MB en FP16). La mayor parte del consumo de memoria proviene de las activaciones y del número de puntos procesados por lote, no de los pesos.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB de VRAM es suficiente. Se puede ejecutar en RTX 3060, RTX 4090, A100 o H100; estas últimas solo aportan ventaja en throughput por lotes grandes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con suficiente VRAM para el tamaño de lote de puntos; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la vía oficial es la librería `torch-pointcloud` (`pip install torch-pointcloud`), con carga vía `tp.create_model(...)`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. La exportación a ONNX o TensorRT no está documentada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del número de puntos por muestra, del tamaño de lote y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RandLA-Net (este checkpoint) | ≈1,2 M | nubes de puntos de gran escala | 55,33 (declarado) | MIT | Hugging Face, `torch-pointcloud` |
| PointNet++ | no disponible en esta ficha | nubes de puntos | no disponible en esta ficha | no disponible | múltiples implementaciones |
| KPConv | no disponible en esta ficha | nubes de puntos | no disponible en esta ficha | no disponible | múltiples implementaciones |
| Cylinder3D | no disponible en esta ficha | vóxeles cilíndricos | no disponible en esta ficha | no disponible | múltiples implementaciones |

Los datos de los modelos alternativos no están disponibles en la información proporcionada; la comparativa numérica completa requeriría consultar las publicaciones originales de cada método. La ventaja diferencial de RandLA-Net es su relación entre precisión y coste computacional: con 1,2 M de parámetros ofrece un mIoU competitivo frente a arquitecturas más pesadas, a cambio de una menor precisión en clases minoritarias.

## Limitaciones y advertencias

- Sesgos de dominio: entrenado exclusivamente en SemanticKITTI (escenas urbanas y de carretera alemanas); el rendimiento puede degradarse en entornos industriales, interiores, agrícolas o con sensores LiDAR de características distintas.
- Riesgo de error en clases minoritarias: el mIoU de 55,33 refleja un desequilibrio típico del dataset; clases poco representadas (motocicletas, bicicletas, personas) suelen tener IoU bajo.
- Sensibilidad al muestreo aleatorio: el muestreo aleatorio introduce variabilidad; los resultados pueden fluctuar según la semilla y el orden de los puntos.
- Sin verificación independiente: las métricas declaradas (mIoU 55,33, OA 90,06) están marcadas como no verificadas en el model-index; conviene reproducirlas antes de usarlas como referencia en producción.
- Limitaciones de idioma: no aplica, es un modelo no lingüístico. No soporta texto, visión 2D, audio ni tool calling.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero conviene revisar las licencias del dataset SemanticKITTI y de la implementación original de Tsung-Han Wu, que pueden tener condiciones adicionales.
- Caveats de producción: la librería `torch-pointcloud` es joven y la integración con ecosistemas de despliegue (ONNX, TensorRT) no está documentada; es necesario validar el pipeline de preprocesado (`info["transform"]` y `collate`) para que coincida con el usado en entrenamiento.
- Tamaño del repo: 0,0 GB reportado, lo que sugiere que el peso real del checkpoint es mínimo; no hay garantía documentada sobre versiones futuras del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/randlanet.semantickitti.tsung-han-wu
- Paper RandLA-Net: https://arxiv.org/abs/1911.11236
- Implementación original (Tsung-Han Wu): https://github.com/tsunghan-wu/RandLA-Net-pytorch
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Dataset SemanticKITTI: http://www.semantic-kitti.org/
- Paper SemanticKITTI: https://arxiv.org/abs/1904.01416
