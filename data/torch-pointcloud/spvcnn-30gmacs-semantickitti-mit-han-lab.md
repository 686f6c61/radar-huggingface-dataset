# torch-pointcloud/spvcnn-30gmacs.semantickitti.mit-han-lab

## Resumen

SPVCNN-30GMACs es un modelo de segmentación semántica de nubes de puntos LiDAR basado en convoluciones dispersas punto-vóxel (Sparse Point-Voxel Convolution, SPVCNN). Lo desarrolla el grupo MIT HAN Lab (Haotian Tang, Zhijian Liu, Song Han y colaboradores) y esta versión concreta ha sido convertida y publicada en Hugging Face por el proyecto `torch-pointcloud` de Arthur Dujardin, a partir del repositorio original `mit-han-lab/spvnas`. Resuelve la asignación de una clase semántica a cada punto de una escena 3D captada por LiDAR, con 19 clases de SemanticKITTI.

El modelo es deliberadamente compacto: 5,46 millones de parámetros, 48 canales de características y 4 canales de entrada (coordenadas XYZ más intensidad). Su nombre hace referencia al presupuesto computacional de la variante arquitectónica: aproximadamente 30 GMACs por frame, lo que lo sitúa en la franja de modelos eficientes para percepción 3D en tiempo real. No es un modelo de lenguaje ni procesa texto: es un backbone convolucional 3D para segmentación de nubes de puntos.

Su relevancia actual radica en que ofrece un checkpoint listo para usar con `torch-pointcloud` y `torchsparse`, con pesos en `safetensors`, licencia MIT y un rendimiento declarado de 60,7 mIoU y 91,94 % de exactitud global (OA) sobre el conjunto de validación de SemanticKITTI. Es una pieza útil como línea base reproducible para conducción autónoma, robótica móvil y evaluación de arquitecturas 3D eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SPVCNN (Sparse Point-Voxel Convolution), red convolucional 3D dispersa |
| Parametros totales | 5.455.891 (5,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (XYZ + intensidad) |
| Clases de salida | 19 (SemanticKITTI) |
| Canales de caracteristicas | 48 |
| Presupuesto computacional | ~30 GMACs por frame |
| Libreria | torch-pointcloud (requiere torchsparse) |
| Dataset de entrenamiento | SemanticKITTI |
| Descargas en Hugging Face | 2.587 |

## Arquitectura y entrenamiento

SPVCNN combina dos representaciones complementarias de la nube de puntos. Por un lado, una rama de convolución dispersa sobre vóxeles, que explota la dispersión natural de los datos LiDAR para procesar solo las celdas ocupadas y reduce el coste computacional. Por otro, una rama punto-vóxel que preserva información geométrica fina mediante operaciones sobre los puntos originales. La fusión de ambas ramas permite capturar tanto contexto global como detalle local sin el coste de una convolución densa 3D.

El modelo forma parte del trabajo *Searching Efficient 3D Architectures with Sparse Point-Voxel Convolution* (ECCV 2020), en el que los autores aplican búsqueda de arquitecturas neuronales (NAS) para encontrar configuraciones eficientes de SPVCNN bajo distintos presupuestos de MACs. Esta variante corresponde al punto de la curva de compromiso con ~30 GMACs. Se entrena sobre SemanticKITTI, el benchmark de segmentación semántica de secuencias LiDAR del dataset KITTI, con 19 clases evaluables. La model card no detalla el número de tokens, la composición exacta del dataset, ni si se emplearon técnicas de ajuste fino adicionales; esos datos no están disponibles en la información proporcionada.

## Capacidades

- Segmentación semántica densa de nubes de puntos LiDAR: asigna una de 19 clases a cada punto de la escena.
- Procesamiento de nubes de puntos 3D con coordenadas XYZ e intensidad de retorno como entrada.
- Extracción de características: `forward_features` devuelve un vector de 48 dimensiones por punto, reutilizable como backbone para tareas posteriores.
- Clasificación por punto mediante la cabeza de segmentación, con posibilidad de reinicializar el clasificador (`reset_classifier`) para adaptar el número de clases.
- Ejecución en GPU con kernels dispersos (`torchsparse`), orientada a inferencia por frame.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.
- No dispone de modo de razonamiento (thinking), visión RGB ni audio.

## Casos de uso

- Percepción LiDAR en conducción autónoma: el modelo segmenta cada frame de la nube de puntos en clases como coche, peatón, carretera o vegetación, proporcionando una capa semántica que alimenta módulos de planificación y evitación de obstáculos. Su presupuesto de ~30 GMACs lo hace compatible con pipelines en tiempo real.
- Robótica móvil en interiores y exteriores: un robot equipado con LiDAR puede usar el modelo para distinguir suelo transitable, paredes y obstáculos dinámicos, con la ventaja de que los pesos son ligeros (5,4 M de parámetros) y caben en GPUs embebidas.
- Etiquetado automático y preanotación de datos: el modelo genera etiquetas semánticas por punto que un equipo de anotación puede revisar y corregir, reduciendo el coste de construir nuevos datasets LiDAR.
- Extracción de características para modelos posteriores: mediante `forward_features` se obtienen descriptores de 48 dimensiones por punto que pueden alimentar cabezas de detección 3D, segmentación de instancias o clasificación de escenas.
- Evaluación comparativa de arquitecturas 3D eficientes: como línea base reproducible con métricas declaradas sobre SemanticKITTI, sirve para medir mejoras de nuevas arquitecturas con presupuestos computacionales similares.
- Investigación en percepción 3D con recursos limitados: su tamaño reducido y licencia MIT permiten experimentar en una única GPU de consumo, algo relevante para grupos con infraestructura modesta.
- Integración en sistemas de mapeo semántico: las etiquetas por punto pueden agregarse a lo largo de secuencias para construir mapas 3D con información semántica de la vía.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| SemanticKITTI | Segmentacion semantica de nubes de puntos | mIoU | 60,7 |
| SemanticKITTI | Segmentacion semantica de nubes de puntos | OA (exactitud global) | 91,94 |

No se han publicado en la información disponible resultados desglosados por clase (IoU por categoría), latencia, throughput ni comparaciones numéricas con otras arquitecturas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5,4 M de parámetros, los pesos ocupan del orden de 22 MB en FP32 y unos 11 MB en FP16; el consumo dominante proviene de las estructuras dispersas intermedias, que dependen del número de puntos por frame.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la compilación de `torchsparse`. El modelo requiere kernels de GPU (la model card indica explícitamente "GPU-only kernels").
- GPU de consumo: sí, cabe con holgura en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se compile `torchsparse` para la versión de PyTorch y CUDA instaladas.
- Opciones de despliegue: `torch-pointcloud` con `torchsparse` (vía oficial documentada). No se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos comparables (por ejemplo, otras variantes de SPVCNN, MinkowskiNet o Cylinder3D) que permitan una comparación rigurosa de parámetros, contexto y rendimiento sobre SemanticKITTI.

| Modelo | Parametros | Tarea | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spvcnn-30gmacs (este modelo) | 5,4 M | Segmentacion semantica 3D | 60,7 | MIT | Hugging Face, safetensors |
| Otras variantes SPVCNN | no disponible | Segmentacion semantica 3D | no disponible | MIT (repo original) | Repo mit-han-lab/spvnas |
| Alternativas de la misma categoria | no disponible | Segmentacion semantica 3D | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre SemanticKITTI (escenas de conducción con LiDAR), por lo que el rendimiento puede degradarse en entornos de interior, sensores distintos o configuraciones LiDAR diferentes a las del dataset.
- Sin datos de sesgo publicados: la model card no documenta análisis de sesgos por clase, condiciones meteorológicas, hora del día o densidad de puntos.
- Riesgo de error en clases poco representadas: la métrica global (OA 91,94 %) puede enmascarar un rendimiento bajo en categorías minoritarias; no se han publicado IoU por clase.
- Dependencia de compilación: requiere `torchsparse` compilado contra la versión exacta de PyTorch y CUDA, lo que complica el despliegue reproducible en producción y en entornos con CUDA antiguas.
- Solo GPU: no hay ruta de inferencia en CPU documentada.
- Sin cuantizaciones publicadas: no existen variantes GGUF, INT8 u ONNX en el repositorio, lo que limita el despliegue en hardware no NVIDIA.
- Licencia MIT: permite uso comercial y modificación, pero el usuario debe verificar las obligaciones de atribución de los trabajos citados (SPVNAS y SemanticKITTI) y las condiciones del dataset original.
- Métricas no verificadas: los valores de mIoU y OA figuran como `verified: false` en el model-index; conviene reproducirlos antes de usarlos como referencia en publicaciones.
- No apto para tareas de lenguaje: no procesa texto, no responde a prompts y no soporta tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/spvcnn-30gmacs.semantickitti.mit-han-lab
- Paper SPVNAS (arXiv 2007.16100): https://arxiv.org/abs/2007.16100
- Repositorio original mit-han-lab/spvnas: https://github.com/mit-han-lab/spvnas
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset SemanticKITTI: http://semantic-kitti.org/
