# Zenseact/j3pa-small

## Resumen

J3PA-Small es un codificador (encoder) auto-supervisado de nubes de puntos LiDAR desarrollado por Zenseact, empresa sueca especializada en sistemas de conduccion autonoma. El modelo transforma una nube de puntos LiDAR en caracteristicas densas por punto (1664 canales por defecto), pensadas para tareas posteriores como segmentacion semantica, segmentacion panoptica y deteccion de objetos 3D. No es un modelo de lenguaje: es un extractor de caracteristicas geometricas para percepcion 3D.

Con 42,4 millones de parametros, J3PA-Small se situa en el centro de la familia J3PA (Tiny 9,8M, Small 42,4M, Large 134,6M y 1B). Es un modelo destilado a partir de J3PA-1B y, a diferencia de un codificador de voxel fijo, acepta el tamano de voxel como entrada, de modo que un unico conjunto de pesos sirve para voxeles de 4 a 20 cm. Esta flexibilidad permite intercambiar precision por rendimiento sin reentrenar.

Su relevancia actual radica en que ofrece caracteristicas generalistas reutilizables (uso congelado o con fine-tuning) para pipelines de percepcion, con licencia Apache 2.0 y un peso de repositorio de solo 0,2 GB, lo que facilita su despliegue incluso en entornos con recursos limitados. Requiere `trust_remote_code=True` porque incorpora kernels CUDA propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de nubes de puntos LiDAR con atencion agrupada por curvas de relleno del espacio (space-filling curves), cinco etapas jerarquicas de voxelizacion |
| Parametros totales | 42.380.739 (42,4M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (procesa nubes de puntos de tamano variable, N puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, con kernels CUDA personalizados) |

## Arquitectura y entrenamiento

J3PA es un codificador jerarquico que voxeliza la nube de puntos y la procesa en cinco etapas; los voxeles de la etapa *s* tienen un tamano de 2^s veces el tamano de voxel base. La atencion se organiza agrupando puntos mediante curvas de relleno del espacio (space-filling curves), y en modo entrenamiento el modelo aleatoriza el orden de dichas curvas para construir los grupos de atencion, tal como se hizo en el preentrenamiento. La salida por defecto concatena las caracteristicas de las cinco etapas (704 + 512 + 256 + 128 + 64 = 1664 canales), con la etapa mas profunda primero.

El entrenamiento es auto-supervisado (etiqueta `self-supervised-learning`), sin que la informacion disponible detalle el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables a este tipo de modelo). J3PA-Small es un modelo destilado de J3PA-1B. Una innovacion destacable es que el tamano de voxel se pasa como entrada: se entreno con valores de 4 a 20 cm, de modo que un solo modelo cubre ese rango y los voxeles mas grandes aumentan el throughput con solo una perdida menor de rendimiento en tareas posteriores. El modelo incluye kernels GPU personalizados que se distribuyen con el repositorio.

## Capacidades

- Extraccion de caracteristicas densas por punto para nubes de puntos LiDAR (1664 canales por defecto, configurable por etapas).
- Extraccion de caracteristicas por voxel de la primera etapa, mas economica para tareas densas.
- Soporte de multiples etapas jerarquicas con seleccion configurable (`point_features(0)`, `point_features([0, -1])`, etc.).
- Procesamiento por lotes: acepta una lista de nubes y permite dividir las caracteristicas por nube.
- Tamano de voxel configurable por nube (escalar o tensor con un valor por nube), en el rango de 4 a 20 cm.
- Entrada multi-sweep: el canal `age` permite apilar barridos LiDAR con su antiguedad relativa.
- Uso congelado (linear probing) o con fine-tuning como cualquier modulo de PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo generativo ni linguistico.

## Casos de uso

- Segmentacion semantica de escenas LiDAR: usar las caracteristicas por punto (o por voxel) como entrada a una cabeza de segmentacion ligera, aprovechando que el modelo puede quedarse congelado y solo entrenar la cabeza.
- Deteccion de objetos 3D en vehiculos autonomos: extraer caracteristicas densas de la nube y alimentar un detector posterior; el soporte multi-sweep mediante el canal `age` mejora la densidad de puntos en zonas lejanas.
- Segmentacion panoptica: combinar las caracteristicas por punto con un modulo de agrupacion para separar instancias y clases en una sola pasada.
- Preprocesado en pipelines de percepcion en tiempo real: ajustar el tamano de voxel (por ejemplo, 10-20 cm) para aumentar el throughput en fases de inferencia con restricciones de latencia.
- Etiquetado asistido y auto-etiquetado: generar caracteristicas generalistas para agrupar puntos y acelerar la anotacion de nuevos datasets LiDAR.
- Investigacion en representaciones 3D: usar el modelo como backbone congelado para comparar estrategias de linear probing o para estudiar la transferencia entre sensores y densidades.
- Despliegue en plataformas con recursos limitados: con 42,4M de parametros y 0,2 GB de repositorio, es viable en GPUs de gama media para prototipos y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion de linear probing y remite a un paper en arXiv que aun no esta disponible ("arXiv link coming soon").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 42,4M de parametros en float32 los pesos ocupan aproximadamente 170 MB, por lo que la VRAM dominante sera la de las activaciones, que depende del numero de puntos por nube y del tamano de voxel.
- GPU recomendadas: no disponible. El modelo requiere CUDA (los ejemplos usan `.cuda()` y kernels GPU personalizados).
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de los pesos, aunque la VRAM real dependera del numero de puntos procesados; no hay cifras confirmadas.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; la model card solo indica cualitativamente que los voxeles mas grandes aumentan el throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada de voxel configurable | Licencia | Disponibilidad |
|---|---|---|---|---|
| J3PA-Tiny | 9,8M | si (familia destilada) | Apache 2.0 | Hugging Face |
| J3PA-Small | 42,4M | si (4-20 cm) | Apache 2.0 | Hugging Face |
| J3PA-Large | 134,6M | si (familia destilada) | Apache 2.0 | Hugging Face |
| J3PA-1B | 1,01B | si (modelo profesor) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos ni frente a alternativas externas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en LiDAR: no procesa texto ni imagenes y no ofrece capacidades generativas.
- Requiere `trust_remote_code=True` y ejecucion en CUDA por los kernels personalizados del repositorio; esto implica ejecutar codigo del autor y limita el despliegue a entornos GPU.
- El rendimiento depende del formato de entrada: coordenadas en metros (x adelante, y izquierda, z arriba) e intensidad en escala 0-255; un preprocesado incorrecto degrada las caracteristicas.
- El rango de tamano de voxel validado es de 4 a 20 cm; fuera de ese rango el comportamiento no esta garantizado.
- No hay paper ni resultados de benchmarks publicados, por lo que la evaluacion independiente es limitada.
- Riesgo de sesgo ligado a los datos de entrenamiento (no documentados): posibles diferencias de rendimiento segun sensor, densidad de puntos o entorno geografico.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las dependencias de los kernels incluidos.
- Sin garantias de produccion documentadas: no se detallan latencias, consumo de VRAM ni pruebas de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zenseact/j3pa-small
- Modelo base (profesor): https://huggingface.co/Zenseact/j3pa-1b
- J3PA-Tiny: https://huggingface.co/Zenseact/j3pa-tiny
- J3PA-Large: https://huggingface.co/Zenseact/j3pa-large
- Paper en arXiv: pendiente de publicacion ("coming soon")
- Codigo en GitHub: pendiente de publicacion ("coming soon")
