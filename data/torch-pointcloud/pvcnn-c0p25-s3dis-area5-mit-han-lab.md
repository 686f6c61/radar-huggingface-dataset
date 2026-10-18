# torch-pointcloud/pvcnn-c0p25.s3dis-area5.mit-han-lab

## Resumen

PVCNN (Point-Voxel CNN) es una red neuronal convolucional para segmentación semántica de nubes de puntos 3D. Este checkpoint concreto, `pvcnn-c0p25.s3dis-area5.mit-han-lab`, es la versión con multiplicador de anchura 0,25 del modelo original de MIT HAN Lab, convertida al formato de la librería `torch-pointcloud` por el usuario `torch-pointcloud`. No es un modelo de lenguaje: no genera texto ni mantiene conversaciones; recibe una nube de puntos (coordenadas, color y posición normalizada) y asigna una de 13 clases semánticas a cada punto, con aplicación directa en entornos de interior.

El problema que resuelve es la ineficiencia clásica de las arquitecturas de nubes de puntos: los métodos basados en vóxeles sufren un coste cúbico en memoria, mientras que los basados en puntos tienen accesos a memoria dispersos y poco eficientes en GPU. PVCNN fusiona ambas ramas —una rama de puntos que preserva la resolución fina y una rama de vóxeles que agrega el vecindario— para reducir el coste computacional manteniendo la precisión. El artículo se publicó en NeurIPS 2019 (arXiv:1907.03739) y sigue siendo una referencia habitual como baseline eficiente en segmentación 3D.

Su relevancia práctica es doble: por un lado es un modelo extremadamente pequeño (167.773 parámetros, aproximadamente 0,67 MB en fp32), lo que permite ejecutarlo en CPU o en GPU de gama de entrada; por otro, sirve como pieza de preprocesado o etiquetado en pipelines de datos 3D. Está entrenado y evaluado sobre S3DIS (Stanford 3D Indoor Spaces), dejando el Área 5 como conjunto de test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PVCNN (Point-Voxel CNN), rama de puntos y rama de vóxeles fusionadas; multiplicador de anchura c = 0,25 |
| Parámetros totales | 167.773 (≈0,17 M) según safetensors; la model card declara 0,2 M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de nubes de puntos; entrada de 8.192 puntos por muestra en el ejemplo de uso) |
| Tipos de cuantización | no disponible; no se publican checkpoints cuantizados. El peso en fp32 es de aproximadamente 0,67 MB, por lo que la cuantización no aporta ventajas significativas |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo), pesos PyTorch cargables con `torch-pointcloud` |
| Canales de entrada | 9 (posición 3, color RGB 3, posición normalizada 3) |
| Clases de salida | 13 |
| Dimensión de características | 368 |
| Dataset de entrenamiento | S3DIS, Área 5 como test |

## Arquitectura y entrenamiento

PVCNN es una arquitectura híbrida que combina dos representaciones de la nube de puntos en cada bloque. La rama de vóxeles aplica convoluciones 3D sobre una rejilla regularizada para capturar contexto espacial amplio de forma eficiente; la rama de puntos opera directamente sobre las coordenadas originales para conservar el detalle fino, y ambas se fusionan antes de pasar al siguiente bloque. Este diseño evita el coste cúbico en memoria de los enfoques puramente voxelizados y los accesos dispersos de los enfoques puramente basados en puntos. El checkpoint usa un multiplicador de anchura c = 0,25, es decir, una versión reducida de la red original, y mantiene la firma de la implementación de referencia de MIT HAN Lab (`forward_features` expone un vector de 368 dimensiones antes de la cabeza de clasificación).

El entrenamiento se realizó sobre S3DIS (Armeni et al., CVPR 2016), un conjunto de escaneos RGB-D de espacios interiores de 13 clases (techo, suelo, pared, viga, columna, ventana, puerta, mesa, silla, sofá, estantería, pizarra y otros elementos). El protocolo habitual de S3DIS es la validación cruzada de 6 pliegues con el Área 5 como test; este modelo se evalúa sobre ese Área 5. La model card no documenta el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos, ajuste fino con RLHF/DPO (no aplicable en este dominio) o post-procesado geométrico; los sufijos `simple/` de las métricas no están explicados en la información disponible. El modelo se obtuvo por conversión desde el repositorio `mit-han-lab/pvcnn`, por lo que la reproducibilidad depende de esa conversión.

## Capacidades

- Segmentación semántica por punto: asigna cada punto de la nube a una de las 13 clases de S3DIS.
- Extracción de características: `forward_features` y `reset_classifier(num_classes=0)` devuelven un vector de 368 dimensiones por punto, reutilizable como embedding para clasificación, clustering o modelos posteriores.
- Uso con nubes de puntos de cualquier tamaño: la API acepta `pos`, `x` (color/features), `batch` e índices de agrupación por lotes, de modo que se pueden procesar varias escenas a la vez.
- Eficiencia computacional: el diseño punto-vóxel y el multiplicador c = 0,25 reducen el coste frente a las variantes completas, lo que permite ejecución en CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión 2D, audio ni capacidades multilingües: no es un modelo de propósito general.

## Casos de uso

- Reconstrucción as-built y modelado BIM: dado un escaneo láser o fotogramétrico de una planta, el modelo etiqueta techo, suelo, paredes, columnas y ventanas, y esa clasificación alimenta la generación semiautomática de un modelo BIM. Es adecuado porque su salida por punto se mapea directamente a categorías de construcción y el coste de inferencia es mínimo.
- Robótica móvil en interiores: un robot con LiDAR o cámara RGB-D puede clasificar el suelo y los obstáculos por punto para planificación de trayectorias. La ventaja es que el modelo cabe en un equipo embebido y no requiere GPU dedicada.
- Inventario de mobiliario: contar y localizar mesas, sillas, sofás y estanterías en oficinas o viviendas a partir de un escaneo, combinando la salida del modelo con un paso de agrupación (clustering) por instancia.
- Preetiquetado en pipelines de anotación 3D: usar las predicciones como etiquetas preliminares que un humano revisa, reduciendo el coste de anotar grandes volúmenes de nubes de puntos para entrenar modelos mayores.
- Detección de elementos estructurales para mantenimiento: identificar vigas, columnas y pizarras en inspecciones de edificios para priorizar revisiones o detectar modificaciones respecto al plano original.
- Realidad aumentada y gemelos digitales: segmentar la escena en tiempo real (o casi) para anclar objetos virtuales sobre superficies clasificadas, como suelo o mesa, conociendo su extensión exacta.
- Baseline académico y ablaciones: por su tamaño reducido y su licencia MIT, es un punto de partida reproducible para comparar técnicas de muestreo, aumentos de datos o post-procesado en segmentación 3D semántica.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (ninguno marcado como verificado):

| Métrica | Dataset | Valor | Verificado |
|---|---|---|---|
| mIoU | S3DIS (Área 5) | 53,31 | No |
| OA (exactitud global) | S3DIS (Área 5) | 84,93 | No |
| simple/mIoU | S3DIS (Área 5) | 51,05 | No |
| simple/OA | S3DIS (Área 5) | 83,29 | No |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de lenguaje, ya que el modelo no las cubre. Tampoco se documenta la definición exacta de la variante `simple/`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con lotes pequeños y 8.192 puntos por muestra (estimación a partir de los 167.773 parámetros; el consumo lo dominan las activaciones, no los pesos). Los pesos en fp32 ocupan aproximadamente 0,67 MB.
- Cabe en CPU: es viable ejecutar la inferencia en CPU para volúmenes moderados de puntos, sin requisitos de GPU.
- GPU recomendadas: cualquier GPU consumer con 2-4 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060). Una RTX 4090, A100 o H100 están muy sobredimensionadas para este modelo; su utilidad sería procesar muchos lotes en paralelo.
- Opciones de despliegue: PyTorch nativo mediante `torch-pointcloud` (`tp.create_model(..., pretrained=True)`); no se documenta exportación a ONNX, TorchScript ni integración con servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama, que además no aplican a este dominio.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Dataset de evaluación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pvcnn-c0p25.s3dis-area5 (este) | PVCNN, rama punto + vóxel | 167.773 (0,17 M) | S3DIS Área 5 (mIoU 53,31) | MIT | HuggingFace, vía `torch-pointcloud` |
| PVCNN original (c = 1,0) | PVCNN | no disponible en la información proporcionada | S3DIS | MIT (repo `mit-han-lab/pvcnn`) | GitHub de MIT HAN Lab |
| PointNet++ | Jerárquica sobre puntos | no disponible en la información proporcionada | S3DIS | no disponible en la información proporcionada | Implementaciones públicas |
| KPConv | Convolución kernel-point | no disponible en la información proporcionada | S3DIS | no disponible en la información proporcionada | Implementación pública |
| RandLA-Net | Muestreo aleatorio + atención local | no disponible en la información proporcionada | S3DIS, SemanticKITTI | no disponible en la información proporcionada | Implementación pública |

La comparación cuantitativa con estas alternativas no puede establecerse con los datos proporcionados: solo se dispone de las métricas de este checkpoint. Cualitativamente, PVCNN se distingue por su bajo número de parámetros y por su diseño orientado a eficiencia en GPU, mientras que RandLA-Net y KPConv están pensados para escenas de mayor escala.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente con S3DIS, compuesto por escaneos RGB-D de interiores de oficinas y aulas. El rendimiento caerá fuera de ese dominio (exteriores, industria, LiDAR de vehículo, escenas a gran escala).
- Taxonomía cerrada de 13 clases: no puede segmentar categorías no presentes en S3DIS ni producir máscaras de instancia; para instancias hace falta un paso posterior.
- Métricas no verificadas: los cuatro valores de la model card están marcados con `verified: false` y la variante `simple/` no está documentada, por lo que la comparación con la literatura debe hacerse con cautela.
- Conversión de terceros: el checkpoint procede de una conversión del repositorio original de MIT HAN Lab; pueden existir diferencias numéricas respecto a los pesos de referencia no cuantificadas en la información disponible.
- Entrada fija de 9 canales: requiere posición, color y posición normalizada. Sin color (por ejemplo, LiDAR sin retorno de intensidad mapeado a RGB) el rendimiento no está caracterizado.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el equivalente en forma de etiquetas erróneas con alta confianza en puntos ambiguos o en zonas escasamente representadas, como vigas o pizarras.
- Sesgos: los edificios de S3DIS están situados en Estados Unidos y tienen una distribución concreta de mobiliario y materiales; la precisión puede degradarse en tipologías constructivas distintas.
- Licencia MIT: permite uso comercial y modificación con atribución; conviene conservar los avisos de copyright del repositorio original y citar los artículos de PVCNN y S3DIS.
- Sin garantías de producción: el repositorio no incluye tests de robustez, ni model card con evaluación de sesgos, ni soporte documentado de despliegue a escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pvcnn-c0p25.s3dis-area5.mit-han-lab
- Artículo PVCNN (NeurIPS 2019): https://arxiv.org/abs/1907.03739
- Repositorio original de MIT HAN Lab: https://github.com/mit-han-lab/pvcnn
- Librería `torch-pointcloud`: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería (Zenodo): https://doi.org/10.5281/zenodo.22159632
