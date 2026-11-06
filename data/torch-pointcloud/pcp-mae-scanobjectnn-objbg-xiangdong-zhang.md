# torch-pointcloud/pcp-mae.scanobjectnn-objbg.xiangdong-zhang

## Resumen

PCP-MAE (Point Cloud Prediction Masked Autoencoder) es un modelo de clasificación de nubes de puntos 3D desarrollado por Xiangdong Zhang, Shaofeng Yan y Junchi Zhang, presentado en NeurIPS 2024. Esta ficha concreta corresponde al checkpoint afinado sobre el subconjunto OBJ_BG del dataset ScanObjectNN, distribuido en Hugging Face por el proyecto torch-pointcloud. El modelo resuelve la tarea de clasificación de objetos 3D escaneados en escenarios reales, con ruido y oclusiones, a partir de 8.192 puntos de entrada.

La innovación principal de PCP-MAE es reformular el objetivo de enmascaramiento de puntos: en lugar de reconstruir las coordenadas de los puntos enmascarados, el modelo predice los centros de los grupos de puntos (point centers), lo que aporta una señal de supervisión más estable y semánticamente rica. La arquitectura es un transformer con encoder de 768 dimensiones y 22,3 millones de parámetros, lo que lo sitúa en la gama ligera y permite entrenamiento e inferencia en GPU de consumo.

El checkpoint está publicado bajo licencia MIT, en formato safetensors, y se integra con la librería `torch-pointcloud` mediante una API de una línea. Es relevante para investigadores y desarrolladores que necesitan un clasificador 3D listo para usar con resultados cercanos al estado del arte en ScanObjectNN sin reentrenar desde cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (masked point autoencoder, PCP-MAE) |
| Parámetros totales | 22.341.263 (22,3 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 8.192 puntos) |
| Tipos de cuantización | no disponible (pesos safetensors en fp32/fp16 según carga) |
| Idiomas soportados | no disponible (no aplica, tarea 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión de features | 768 |
| Número de clases | 15 |
| Dataset de evaluación | ScanObjectNN (OBJ_BG) |

## Arquitectura y entrenamiento

PCP-MAE es un transformer de tipo masked point autoencoder. Durante el preentrenamiento se enmascaran grupos de puntos y el modelo aprende a predecir los centros de dichos grupos en lugar de las coordenadas individuales, lo que reduce la ambigüedad del objetivo de reconstrucción y mejora la calidad de las representaciones. El encoder produce un vector de 768 dimensiones que se usa tanto para clasificación como para extracción de features.

El checkpoint aquí descrito parte del modelo preentrenado `torch-pointcloud/pcp-mae.pretrain.xiangdong-zhang` y se afina de forma supervisada sobre el split OBJ_BG de ScanObjectNN, que contiene 15 clases de objetos escaneados con fondo y ruido realistas. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia a ScanObjectNN (Uy et al., ICCV 2019). No se indica uso de RLHF ni DPO, algo esperable en un modelo de visión 3D supervisado.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 clases de objetos (ScanObjectNN OBJ_BG).
- Extracción de embeddings de 768 dimensiones por nube de puntos mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de nubes de puntos de 8.192 puntos con coordenadas `pos` de dimensión 3.
- Manejo de batches mediante la utilidad `collate` de `torch-pointcloud`.
- Robustez ante ruido y oclusiones propias de escaneos reales (OBJ_BG incluye fondo y perturbaciones).
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o imagen 2D.
- No dispone de capacidades multilingües (no aplica).

## Casos de uso

- Clasificación de objetos en escenarios de robótica móvil: el modelo recibe nubes de puntos de sensores LiDAR o RGB-D y asigna una de 15 clases, útil para navegación y manipulación en entornos con ruido real.
- Preetiquetado en pipelines de anotación 3D: al ser ligero (22,3 M de parámetros) y con OA del 95,52 % en OBJ_BG, puede generar etiquetas preliminares que los anotadores revisan, reduciendo coste manual.
- Extracción de features para búsqueda o clustering: los embeddings de 768 dimensiones permiten indexar objetos 3D y recuperar similares mediante similitud coseno en catálogos de modelos CAD o escaneos.
- Control de calidad en fabricación: clasificación de piezas escaneadas en línea para detectar categorías incorrectas o defectuosas dentro de las 15 clases aprendidas.
- Vehículos autónomos y ADAS: clasificación de objetos cercanos detectados por LiDAR como paso previo a la fusión sensorial, aprovechando la tolerancia al ruido del entrenamiento en OBJ_BG.
- Investigación en representaciones 3D: el checkpoint sirve como baseline para comparar métodos de autoenmascaramiento de puntos y para fine-tuning en datasets propios con `reset_classifier`.
- Realidad aumentada: reconocimiento de objetos físicos escaneados con el móvil para superponer contenido digital, dado el bajo coste computacional del modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Métrica | Valor |
|---|---|---|
| ScanObjectNN (OBJ_BG) | OA (Overall Accuracy) | 95,52 |
| ScanObjectNN (OBJ_BG) | mAcc (Mean Accuracy) | 94,82 |

No se han publicado en la información disponible resultados adicionales (p. ej. en OBJ_ONLY, PB_T50_RS, ModelNet40) ni comparativas numéricas con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo (22,3 M de parámetros); el consumo real depende del tamaño de batch y de los 8.192 puntos por muestra.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050 y superiores).
- Opciones de despliegue: librería `torch-pointcloud` sobre PyTorch (CPU o CUDA); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | OA en ScanObjectNN OBJ_BG | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PCP-MAE (este checkpoint) | 22,3 M | 8.192 puntos | 95,52 | MIT | Hugging Face, torch-pointcloud |
| Point-MAE | no disponible en la información | no disponible | no disponible | MIT (repo original) | GitHub, checkpoints públicos |
| PointNet++ | no disponible en la información | no disponible | no disponible | MIT | Implementaciones múltiples |
| Point Transformer | no disponible en la información | no disponible | no disponible | no disponible | GitHub |

No se dispone en la información proporcionada de cifras comparativas verificadas para los modelos alternativos; se indican como "no disponible" para no inventar datos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para 15 clases de ScanObjectNN; no generaliza a categorías fuera de ese conjunto sin fine-tuning.
- La entrada está pensada para 8.192 puntos; variaciones drásticas en el número de puntos pueden requerir remuestreo.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- No se documentan análisis de sesgo; al ser un modelo 3D, los sesgos potenciales provienen de la distribución de objetos escaneados en ScanObjectNN.
- Riesgo de confusión entre clases visualmente similares en escaneos muy ruidosos u ocluidos, aunque el entrenamiento en OBJ_BG mitiga parcialmente este problema.
- Licencia MIT permite uso comercial, pero se recomienda revisar las licencias de ScanObjectNN y de las dependencias (`torch-pointcloud`, PyTorch).
- No apto para tareas de generación de texto, razonamiento, código ni multimodalidad texto-imagen.
- El tamaño del repo (0,1 GB) sugiere pesos en fp32; para despliegue en dispositivos embebidos puede ser necesario convertir a fp16 o int8, sin recetas oficiales publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pcp-mae.scanobjectnn-objbg.xiangdong-zhang
- Modelo base preentrenado: https://huggingface.co/torch-pointcloud/pcp-mae.pretrain.xiangdong-zhang
- Paper PCP-MAE (arXiv): https://arxiv.org/abs/2408.08753
- Repositorio original PCP-MAE: https://github.com/aHapBean/PCP-MAE
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Dataset ScanObjectNN (paper ICCV 2019): https://arxiv.org/abs/1905.03641
