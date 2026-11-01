# torch-pointcloud/pointnet.modelnet40.jiawei-ren

## Resumen

PointNet es una red neuronal para clasificación y segmentación de nubes de puntos 3D presentada originalmente por Charles R. Qi, Hao Su, Kaichun Mo y Leonidas J. Guibas en CVPR 2017. Este checkpoint concreto, `pointnet.modelnet40.jiawei-ren`, es una conversión al formato de la librería `torch-pointcloud` del modelo PointNet entrenado sobre el dataset ModelNet40, publicado por el usuario `torch-pointcloud` y derivado del repositorio `jiawei-ren/ModelNet-C`. No es un modelo de lenguaje: consume conjuntos de puntos 3D (coordenadas y normales) y produce logits sobre 40 categorías de objetos.

El modelo resuelve la tarea de clasificación de formas 3D a partir de nubes de puntos sin estructura de rejilla, empleando una arquitectura que aplica perceptrones multicapa compartidos por punto junto con transformaciones de entrada y de características para lograr invariancia a permutaciones. Con 3,48 millones de parámetros y una dimensión de característica global de 1024, es un modelo extremadamente ligero, adecuado para experimentación, prototipado y como baseline en pipelines de visión 3D.

Su relevancia actual es la de un punto de referencia histórico y didáctico: PointNet es el trabajo fundacional de las arquitecturas de deep learning sobre nubes de puntos, y disponer de un checkpoint reproducible en safetensors dentro de una librería moderna facilita la comparación con arquitecturas posteriores y la integración en flujos de PyTorch. El checkpoint declara una precisión global (OA) de 90,68 y una precisión media por clase (mAcc) de 86,54 sobre ModelNet40.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet (MLP compartido por punto con transformaciones de entrada y de características) |
| Parametros totales | 3.483.377 (3,5 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos, el ejemplo usa 8192 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de visión 3D) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PointNet procesa una nube de puntos desordenada aplicando una red MLP compartida a cada punto de forma independiente, seguida de una operación de agregación simétrica (max pooling) que produce un vector global invariante a permutaciones. Antes de la MLP, una red de transformación de entrada (T-Net) alinea la nube en el espacio, y una segunda T-Net alinea las características de dimensión superior. En este checkpoint la cabeza de clasificación produce 40 clases y la representación global tiene 1024 dimensiones. El modelo cuenta con 3,5 millones de parámetros, lo que lo sitúa entre los modelos más pequeños de la familia de visión 3D.

El entrenamiento se realizó sobre ModelNet40, un dataset de formas 3D sintéticas con 40 categorías de objetos cotidianos (sillas, mesas, aviones, etc.). La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos más allá de las habituales en PointNet. El checkpoint fue convertido desde `jiawei-ren/ModelNet-C`, un repositorio que estudia la robustez de modelos de nubes de puntos frente a corrupciones, y se distribuye a través de la librería `torch-pointcloud`, que expone una API de creación de modelos y extracción de características.

## Capacidades

- Clasificación de nubes de puntos 3D en 40 categorías de ModelNet40.
- Extracción de características globales de 1024 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Invariancia a permutaciones de los puntos de entrada gracias al MLP compartido y al max pooling.
- Alineación espacial de la nube mediante T-Net de entrada y de características.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-step: no disponible (no aplica).
- Capacidades multilingües: no disponible (no aplica).
- Capacidades especiales (thinking mode, visión, audio): no disponible; el modelo opera exclusivamente sobre nubes de puntos 3D.

## Casos de uso

- Clasificación de objetos 3D en prototipos de robótica: el modelo puede recibir nubes de puntos de sensores LiDAR o cámaras de profundidad y clasificar el objeto percibido en una de las 40 categorías de ModelNet40, sirviendo como baseline ligero antes de adoptar arquitecturas más pesadas.
- Baseline en investigación de visión 3D: con 3,5 M de parámetros y una API de extracción de características, es útil para comparar experimentos de robustez (por ejemplo, frente a corrupciones, como en ModelNet-C) o de nuevas arquitecturas sobre nubes de puntos.
- Extracción de embeddings para recuperación de formas 3D: la salida de 1024 dimensiones puede indexarse en un motor de búsqueda vectorial para encontrar formas similares en una base de datos de modelos 3D.
- Preentrenamiento y fine-tuning en clasificación de nubes de puntos: la cabeza de clasificación puede reemplazarse (`reset_classifier`) para adaptar el modelo a un número distinto de clases con datos propios.
- Docencia y demostraciones de deep learning geométrico: su tamaño reducido y su instalación vía `pip install torch-pointcloud` permiten ejecutar ejemplos completos en portátiles sin GPU dedicada.
- Preprocesamiento en pipelines de ingeniería inversa o CAD: clasificar componentes escaneados en categorías gruesas antes de un análisis geométrico más fino.
- Validación de pipelines de captura 3D: usar la precisión del modelo sobre muestras sintéticas como señal de salud del proceso de adquisición y normalización de nubes de puntos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| ModelNet40 | OA (accuracy global) | 90,68 | No |
| ModelNet40 | mAcc (accuracy media por clase) | 86,54 | No |

No se han publicado en la información disponible resultados comparativos adicionales ni latencias o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 3,5 M de parámetros en fp32 el peso ocupa aproximadamente 14 MB, y el consumo dominante es el de la nube de puntos de entrada (el ejemplo usa 8192 puntos con coordenadas y normales).
- GPU recomendadas: cualquier GPU con al menos unos cientos de MB de VRAM libre; el modelo es funcional en CPU para lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo a través de `torch-pointcloud`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento en ModelNet40 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointnet.modelnet40.jiawei-ren | 3,5 M | nube de puntos (ej. 8192 puntos) | OA 90,68 / mAcc 86,54 | apache-2.0 | HuggingFace (torch-pointcloud) |
| PointNet original (Qi et al., 2017) | ~3,5 M | nube de puntos | OA ~89,2 (referencia del paper) | no disponible | Código en repositorio de los autores |
| PointNet++ | no disponible | nube de puntos | no disponible | no disponible | Código en repositorio de los autores |

No se dispone de datos verificados de benchmarks de PointNet++ u otras alternativas en la información proporcionada; las cifras del PointNet original se citan solo como referencia cualitativa y no deben tomarse como comparación verificada.

## Limitaciones y advertencias

- Modelo específico de clasificación de nubes de puntos: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Entrenado exclusivamente sobre ModelNet40 (formas 3D sintéticas de 40 categorías); el rendimiento en nubes de puntos reales, ruidosas o de dominios distintos puede degradarse notablemente.
- Los resultados de benchmarks declarados (OA 90,68, mAcc 86,54) no están verificados (`verified: false`); deben tratarse como cifras del autor.
- No se documentan sesgos específicos ni tasas de error por clase; la precisión media por clase (86,54) sugiere variabilidad entre categorías.
- No hay información sobre cuantización, por lo que el despliegue en entornos con restricciones de memoria debe validarse empíricamente.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar los avisos de atribución y revisar las licencias de los trabajos derivados (PointNet, ModelNet40 y ModelNet-C).
- El checkpoint se distribuye como conversión de un tercero; la reproducibilidad exacta del entrenamiento original no está garantizada por la model card.
- El repositorio tiene un tamaño declarado de 0,0 GB y muy pocas descargas (23), lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointnet.modelnet40.jiawei-ren
- Paper de PointNet: https://arxiv.org/abs/1612.00593
- Repositorio de origen (ModelNet-C): https://github.com/jiawei-ren/ModelNet-C
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
