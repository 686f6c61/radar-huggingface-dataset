# torch-pointcloud/pvcnn2.s3dis-area5.mit-han-lab

## Resumen

PVCNN2 (`pvcnn2.s3dis-area5.mit-han-lab`) es un modelo de segmentación semántica de nubes de puntos 3D, concretamente una implementación de PVCNN++ con convoluciones punto-vóxel organizadas sobre una jerarquía de *set abstraction*. No es un modelo de lenguaje: su entrada es una nube de puntos con 9 canales por punto y su salida es una etiqueta semántica por punto entre 13 clases de interior. Lo publica el usuario `torch-pointcloud` como conversión de los pesos originales de `mit-han-lab/pvcnn` (MIT) al formato de la librería PyTorch PointCloud de Arthur Dujardin.

El modelo resuelve el problema clásico de la convolución 3D ineficiente: PVCNN combina una rama de vóxeles (que captura vecindad espacial densa mediante convoluciones 3D) con una rama de puntos (que preserva la resolución fina sin voxelizar), reduciendo el coste de memoria y cómputo frente a aproximaciones puramente voxelizadas. Con 13,7 millones de parámetros y 64 canales de característica, es un modelo compacto, pensado para ejecutarse en GPUs de gama media o incluso en CPU para volúmenes moderados.

Su relevancia práctica es doble: por un lado, sirve como referencia reproducible del resultado del paper original sobre el *split* oficial de S3DIS (Area 5), con mIoU de 59,95 y precisión global de 87,62; por otro, al estar empaquetado en `torch-pointcloud` con `safetensors`, se puede cargar y evaluar con pocas líneas de código, lo que facilita usarlo como línea base en experimentos de segmentación de interiores o como extractor de características de 64 dimensiones por punto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PVCNN++ (Point-Voxel CNN) con jerarquía de *set abstraction* y convoluciones punto-vóxel |
| Parámetros totales | 13.722.349 (13,7 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de segmentación de nubes de puntos; en el ejemplo de la model card se procesan 8192 puntos por muestra |
| Tipos de cuantización | No disponible (solo se distribuyen pesos en `safetensors`; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (librería `torch-pointcloud`) |
| Tarea | Segmentación semántica de nubes de puntos (*point-cloud-segmentation*) |
| Número de clases | 13 |
| Canales de entrada | 9 (posición, color y normales normalizadas, según el pipeline de la model card) |
| Dimensión de características | 64 |
| Dataset de entrenamiento | S3DIS, evaluación sobre Area 5 |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

PVCNN2 es una red neuronal de tipo *encoder-decoder* para nubes de puntos. El *encoder* construye una jerarquía de *set abstraction*: en cada nivel se submuestrea el conjunto de puntos y se agrupan vecinos, y sobre cada grupo se aplica un bloque punto-vóxel. Ese bloque es la innovación central del paper de Liu, Tang, Lin y Han (NeurIPS 2019): la rama de puntos realiza una MLP sobre cada punto individual preservando la resolución original, mientras que la rama de vóxeles normaliza las coordenadas, voxeliza el vecindario y aplica convoluciones 3D seguidas de una devoxelización por interpolación trilineal. La fusión de ambas ramas evita la pérdida de detalle de la voxelización pura y el coste desordenado de las operaciones de vecindad sobre puntos. El *decoder* interpola las características hasta la resolución original y clasifica cada punto con una cabeza lineal sobre los 64 canales.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de refinamiento tipo RLHF o DPO (no procede en esta tarea). Se sabe que el entrenamiento se realizó sobre S3DIS (Stanford 3D Indoor Spaces), un corpus de escaneos de interiores de edificios con 13 clases semánticas, y que el resultado reportado corresponde a la evaluación sobre el *split* oficial del Area 5, el protocolo habitual para comparar modelos en este *benchmark*. Los pesos distribuidos en este repositorio son una conversión de la implementación original de `mit-han-lab/pvcnn`, no un reentrenamiento.

## Capacidades

- Segmentación semántica densa de nubes de puntos: asigna una de 13 etiquetas a cada punto de la nube (suelo, pared, silla, mesa, puerta, etc.).
- Procesamiento de geometría con atributos: acepta posición (x, y, z), color RGB y normales normalizadas, con 9 canales de entrada en total.
- Extracción de características: `model.forward_features(...)` devuelve un vector de 64 dimensiones por punto, reutilizable como *embedding* para clasificación, clustering o recuperación.
- Configuración de la cabeza de clasificación: `reset_classifier(num_classes=N)` permite adaptar la salida a otro número de clases (requiere *fine-tuning*).
- Inferencia por lotes: el pipeline de `torch_pointcloud.utils.data.collate` construye el tensor `batch` para procesar varias nubes simultáneamente.
- Ejecución en CPU o GPU: al ser un modelo de 13,7 M de parámetros no requiere hardware de datacenter.
- No soporta *tool calling*, razonamiento multi-paso, agentes, visión 2D, audio ni capacidades multilingües: no es un modelo generativo de texto.

## Casos de uso

- Digitalización de interiores y gemelos digitales: procesar escaneos de edificios completos y obtener una nube etiquetada por elementos (suelo, pared, techo, mobiliario), que después se exporta a BIM o a un motor de visualización.
- Anotación asistida de datasets 3D: preetiquetar nubes de puntos con el modelo y revisar manualmente solo los puntos de baja confianza, reduciendo el coste de anotación de corpus propios de interior.
- Robótica móvil en interiores: dotar a un robot de una capa de comprensión semántica del entorno (identificar suelo transitable frente a obstáculos como mesas o sillas) a partir de la nube de puntos de un LiDAR o cámara de profundidad.
- Realidad aumentada y medición en obra: detectar paredes y suelo en un escaneo capturado con un dispositivo móvil para anclar contenido virtual o calcular superficies, con la ventaja de que el modelo cabe en GPUs de portátil.
- Inventario y facility management: clasificar el mobiliario de una planta (sillas, mesas, puertas, pizarras) para generar inventarios automáticos a partir de escaneos periódicos.
- Línea base para investigación en segmentación 3D: comparar arquitecturas nuevas contra un PVCNN++ reproducible con métricas oficiales de S3DIS Area 5 y pesos ya convertidos, evitando reentrenar desde cero.
- Extracción de descriptores para búsqueda o clustering: usar las características de 64 dimensiones por punto para agrupar regiones similares o alimentar un clasificador ligero posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la *model card* (ninguno verificado de forma independiente, `verified: false`). Todos corresponden a segmentación semántica sobre S3DIS, evaluación en Area 5.

| Métrica | Valor | Verificado | Conjunto |
|---|---|---|---|
| mIoU | 59,95 | No | S3DIS (Area 5) |
| OA (precisión global) | 87,62 | No | S3DIS (Area 5) |
| simple/mIoU | 57,27 | No | S3DIS (Area 5) |
| simple/OA | 86,33 | No | S3DIS (Area 5) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro *benchmark* de lenguaje, por la naturaleza no generativa del modelo. Tampoco se aportan métricas por clase, curvas de entrenamiento ni desviaciones entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los pesos ocupan aproximadamente 55 MB (13,72 M × 4 bytes); en FP16, unos 27 MB. A esto se suma la memoria de activaciones, que domina el consumo y depende del número de puntos por muestra (el ejemplo de la model card usa 8192 puntos).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para lotes pequeños; no se necesita A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar el modelo.
- Viabilidad en GPU de consumo: sí, con margen amplio; también es viable en CPU para nubes de tamaño moderado, a costa de mayor latencia.
- Opciones de despliegue: `torch-pointcloud` sobre PyTorch (vía `tp.create_model(..., pretrained=True)`), o exportación a TorchScript/ONNX por cuenta del usuario (no documentada por el autor). vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo por nube ni de puntos procesados por segundo.

## Comparativa con modelos similares

La información proporcionada no incluye métricas de los modelos alternativos, por lo que los campos no documentados se marcan como no disponibles en lugar de estimarse.

| Modelo | Tipo | Parámetros | mIoU S3DIS Area 5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PVCNN2 (este modelo) | Point-voxel, set abstraction | 13,7 M | 59,95 | MIT | Pesos `safetensors` en HuggingFace |
| PVCNN original (`mit-han-lab/pvcnn`) | Point-voxel | No disponible en la información | No disponible en la información | MIT | Repositorio GitHub con código y pesos |
| PointNet++ | Set abstraction sobre puntos | No disponible en la información | No disponible en la información | No disponible en la información | Implementaciones de terceros |
| KPConv | Convolución kernel-point | No disponible en la información | No disponible en la información | No disponible en la información | Implementaciones de terceros |
| MinkowskiNet | Convolución dispersa en vóxeles | No disponible en la información | No disponible en la información | No disponible en la información | Implementaciones de terceros |

La ventaja diferencial de esta ficha es la integración con `torch-pointcloud`: carga en una línea, salida de características por punto y formato `safetensors`, frente a repositorios de investigación que requieren reconstruir el entorno de entrenamiento original.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente con S3DIS (interiores de oficinas y edificios académicos); el rendimiento fuera de ese dominio (exteriores, LiDAR vehicular, industria) no está caracterizado y previsiblemente degradará.
- Taxonomía cerrada de 13 clases: cualquier objeto fuera de ese conjunto se asignará forzosamente a una de las clases existentes o a la clase residual, generando errores silenciosos.
- Entrada rígida de 9 canales: el pipeline espera posición, color y normales normalizadas; una nube sin color o sin normales requiere adaptación previa.
- Sensibilidad a la densidad y al ruido del escaneo: el muestreo y la normalización de coordenadas afectan al resultado; no hay validación publicada sobre distintas densidades.
- Métricas no verificadas: los cuatro valores de la *model card* están marcados como `verified: false` y proceden del propio autor de la conversión, no de una evaluación independiente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación comunitaria; conviene tratar los pesos como una conversión a contrastar contra la implementación original de `mit-han-lab/pvcnn`.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe el riesgo equivalente de predicciones espurias con alta confianza en regiones ambiguas o mal iluminadas del escaneo.
- Licencia MIT: permisiva para uso comercial, pero obliga a conservar el aviso de copyright y la atribución; hay que respetar además las condiciones del dataset S3DIS si se redistribuyen datos derivados.
- No es un modelo de lenguaje: no procesa instrucciones en lenguaje natural, no soporta agentes ni *tool calling*, y no debe presentarse como tal en documentación de producto.
- Sin soporte documentado de cuantización ni de exportación a formatos de inferencia optimizados; el despliegue en producción exige trabajo de ingeniería adicional (batching, preprocesado, gestión de memoria).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pvcnn2.s3dis-area5.mit-han-lab
- Paper PVCNN (NeurIPS 2019): https://arxiv.org/abs/1907.03739
- Repositorio original `mit-han-lab/pvcnn`: https://github.com/mit-han-lab/pvcnn
- Librería PyTorch PointCloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Instalación de PyTorch: https://pytorch.org/get-started/locally/
- Paper S3DIS (Armeni et al., CVPR 2016): referencia citada en la *model card*, sin enlace directo en la información disponible.
