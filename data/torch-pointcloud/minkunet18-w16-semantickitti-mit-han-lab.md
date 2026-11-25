# torch-pointcloud/minkunet18-w16.semantickitti.mit-han-lab

## Resumen

MinkUNet18-W16 es un modelo de segmentación semántica de nubes de puntos LiDAR, implementado como una U-Net residual dispersa (sparse residual U-Net) sobre convoluciones de Minkowski. Lo desarrolla el grupo MIT HAN Lab en el contexto del proyecto SPVNAS, y esta versión concreta ha sido convertida y publicada en Hugging Face por el autor de la librería `torch-pointcloud`, Arthur Dujardin. El modelo resuelve la asignación de una clase semántica a cada punto de una escena LiDAR, con 19 clases de salida definidas por el dataset SemanticKITTI.

La relevancia práctica del modelo reside en su relación tamaño/rendimiento: con solo 5,4 millones de parámetros y 48 canales de características, alcanza un mIoU de 58,89 y una precisión global (OA) de 91,73 sobre SemanticKITTI, según los datos declarados por el autor en la model card. Es, por tanto, un punto de partida ligero y rápido para tareas de percepción 3D en conducción autónoma, robótica móvil o análisis de escenas urbanas, donde el coste computacional y la latencia importan tanto como la precisión.

El checkpoint se distribuye en formato `safetensors`, con licencia MIT, y está pensado para ejecutarse en GPU mediante kernels dispersos de `spconv`. No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto, idiomas ni capacidades generativas. Su entrada es una nube de puntos con coordenadas e intensidad, y su salida son logits por punto para las 19 clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet18-W16 (U-Net residual dispersa con convoluciones de Minkowski) |
| Parametros totales | 5.441.379 (5,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases de salida | 19 |
| Canales de caracteristicas | 48 |
| Dataset de entrenamiento | SemanticKITTI |
| Libreria | torch-pointcloud (requiere spconv) |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MinkUNet, una U-Net con bloques residuales que opera sobre tensores dispersos mediante convoluciones de Minkowski. La variante W16 fija el ancho de la primera etapa en 16 canales y escala progresivamente; la anchura base y la profundidad corresponden a una ResNet-18 adaptada al dominio disperso, de ahí el sufijo "18". La entrada tiene 4 canales (coordenadas espaciales x, y, z más intensidad de retorno LiDAR) y la cabeza de clasificación produce 19 logits por punto. La extracción de características intermedia devuelve vectores de 48 dimensiones por punto.

El entrenamiento se realizó sobre SemanticKITTI, el benchmark de segmentación semántica de secuencias LiDAR de KITTI, con 19 clases evaluables. La model card no detalla el número de tokens/puntos vistos, la composición exacta del dataset, la estrategia de aumento de datos ni si se aplicaron técnicas de refinamiento posteriores. El checkpoint procede de la implementación de referencia de SPVNAS (MIT HAN Lab), convertida al formato de `torch-pointcloud`. La innovación técnica principal es el uso de convoluciones dispersas, que evitan procesar el espacio vacío de la escena y reducen drásticamente el coste frente a convoluciones densas en vóxeles 3D.

## Capacidades

- Segmentación semántica densa de nubes de puntos LiDAR: asigna una de 19 clases a cada punto de la escena.
- Procesamiento de nubes de puntos dispersas de gran tamaño mediante convoluciones de Minkowski, con coste proporcional a los puntos ocupados.
- Extracción de características por punto: `forward_features` devuelve descriptores de 48 dimensiones, útiles para tareas posteriores (clustering, recuperación, transferencia).
- Clasificación por punto con cabeza sustituible: `reset_classifier(num_classes=0)` permite usar el modelo como extractor puro.
- Entrada con intensidad: aprovecha el canal de reflectancia además de la geometría.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión 2D, audio ni generación de texto.

## Casos de uso

- Percepción en conducción autónoma: el modelo etiqueta cada punto LiDAR de la escena con clases como coche, peatón, carretera o vegetación, proporcionando la base para la planificación de trayectorias y la fusión con cámaras. Su tamaño reducido (5,4 M de parámetros) permite integrarlo en el bucle de percepción con presupuesto de latencia ajustado.
- Mapeo semántico de entornos urbanos: procesar secuencias LiDAR completas para generar mapas 3D etiquetados que alimenten sistemas de localización o inventarios de infraestructura.
- Robótica móvil en exteriores: un robot con LiDAR puede usar el modelo para distinguir suelo transitable, obstáculos y estructuras, con la ventaja de que las convoluciones dispersas escalan bien a escenas grandes.
- Etiquetado asistido y preanotación: generar propuestas de segmentación sobre nuevas nubes de puntos para acelerar el etiquetado humano en pipelines de datos, usando el modelo como primer paso y revisión manual posterior.
- Extracción de características para modelos posteriores: los descriptores de 48 dimensiones por punto sirven como entrada a clasificadores ligeros, modelos de detección 3D o técnicas de agrupación no supervisada.
- Investigación y benchmarks: punto de referencia ligero para comparar arquitecturas de segmentación LiDAR, estudiar el efecto de la anchura (W16) o validar pipelines de `torch-pointcloud` y `spconv`.
- Análisis de escenas en logística y almacenes: segmentación de nubes de puntos de escáneres fijos o móviles para inventario y control de ocupación, siempre que las clases de interés estén cubiertas por las 19 de SemanticKITTI.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| SemanticKITTI | Segmentación de nubes de puntos | mIoU | 58,89 |
| SemanticKITTI | Segmentación de nubes de puntos | OA (accuracy) | 91,73 |

No se han publicado en la información disponible resultados desglosados por clase, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 5,4 M de parámetros el peso del modelo es de decenas de MB, pero el consumo real depende del número de puntos y de las estructuras dispersas de `spconv`.
- GPU recomendadas: cualquier GPU NVIDIA compatible con `spconv` y la versión de CUDA correspondiente; el modelo está pensado para ejecutarse en GPU ("GPU-only kernels" según la model card).
- GPU de consumo: por tamaño de parámetros cabría en tarjetas consumer (RTX 3060, RTX 4090, etc.), condicionado a la compilación de `spconv` para la versión de CUDA y PyTorch instalada.
- Opciones de despliegue: `torch-pointcloud` con `spconv`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MinkUNet18-W16 (este) | 5,4 M | SemanticKITTI | 58,89 | MIT | Hugging Face (`torch-pointcloud`) |
| MinkUNet18-W32 (variante más ancha de la familia) | no disponible | SemanticKITTI | no disponible | MIT (SPVNAS) | Repositorio mit-han-lab/spvnas |
| Otras arquitecturas de segmentación LiDAR (p. ej. Cylinder3D, SPVNAS) | no disponible | SemanticKITTI | no disponible en esta ficha | varía | varía |

No se dispone en la información proporcionada de resultados numéricos de modelos alternativos para una comparación rigurosa. La comparativa debe completarse consultando el leaderboard oficial de SemanticKITTI.

## Limitaciones y advertencias

- Modelo de dominio específico: solo segmenta nubes de puntos con 4 canales de entrada y 19 clases de SemanticKITTI; no generaliza a otras taxonomías sin reentrenamiento.
- Sesgos de dataset: SemanticKITTI procede de secuencias de KITTI en entornos de conducción alemanes; el rendimiento puede degradarse en escenas interiores, industriales o con sensores distintos.
- Riesgo de error en clases minoritarias: el mIoU de 58,89 indica margen de mejora, especialmente en clases poco representadas; la OA de 91,73 puede ocultar un mal rendimiento en clases raras.
- Dependencia de `spconv`: requiere una compilación que coincida con la versión de PyTorch y CUDA, lo que complica el despliegue reproducible.
- Solo GPU: los kernels son GPU-only según la model card; no hay ruta CPU documentada.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los datos de entrenamiento (SemanticKITTI) y de las dependencias (`spconv`).
- Sin datos de calibración ni incertidumbre: no se documentan estimaciones de confianza por punto, lo que limita su uso directo en sistemas con requisitos de seguridad.
- Resultados no verificados: las métricas proceden del autor y no han sido contrastadas de forma independiente en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/minkunet18-w16.semantickitti.mit-han-lab
- Paper de Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Repositorio SPVNAS (origen del checkpoint): https://github.com/mit-han-lab/spvnas
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset SemanticKITTI: http://semantic-kitti.org/
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
