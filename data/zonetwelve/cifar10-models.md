# ZoneTwelve/cifar10-models

## Resumen

ZoneTwelve/cifar10-models es un repositorio de HuggingFace que aloja una suite de checkpoints de PyTorch para clasificación de imágenes sobre el dataset CIFAR-10. El autor, ZoneTwelve, ha entrenado ocho arquitecturas distintas (CNN convencionales, una red recurrente, una MobileNet, un Vision Transformer y una DenseNet) con el objetivo de comparar su rendimiento bajo condiciones controladas. Los pesos se almacenan en formato `.pt` e incluyen estado del optimizador, historial de épocas y metadatos de arquitectura, lo que permite reproducir o reanudar el entrenamiento.

La relevancia de este repositorio radica en que documenta de forma transparente las diferencias de precisión entre arquitecturas con un presupuesto de entrenamiento fijo (30 épocas para la mayoría), y señala explícitamente una advertencia de equidad: el mejor modelo, DenseCNN, se entrenó durante 200 épocas, por lo que su 92,53% de precisión en test no es comparable directamente con el resto. El mejor resultado dentro del presupuesto común de 30 épocas es el de CNN-C + BN, con un 84,27% de precisión en test. El repositorio incluye gráficos de curvas de pérdida, tamaño de red frente a precisión y benchmarks de inferencia en MPS (Apple Silicon).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples: DenseCNN (inspirada en DenseNet), CNN-C, CNN-B, R-CNN-B, MobileNet-A, ViT |
| Parametros totales | no disponible (no se especifica por modelo en la informacion proporcionada) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (clasificacion de imagenes, sin soporte de idiomas) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch, incluye pesos, estado del optimizador, historial de epocas y metadatos de arquitectura) |

## Arquitectura y entrenamiento

El repositorio contiene una coleccion heterogenea de arquitecturas de vision. Se incluyen CNN convencionales de distinta capacidad y variantes de normalizacion (BatchNorm y LayerNorm), una CNN recurrente (R-CNN-B), una MobileNet-A, un Vision Transformer (ViT) y una DenseNet (DenseCNN). Todas se entrenaron sobre CIFAR-10, un dataset de 60 000 imagenes de 32x32 píxeles en 10 clases.

El entrenamiento se realizo en MPS (Apple Silicon). Los modelos principales se entrenaron durante 30 epocas, salvo DenseCNN, que recibio 200 epocas. La seleccion del mejor checkpoint se hizo por maxima precision en validacion. No se menciona el uso de tecnicas de aumento de datos, regularizacion adicional o estrategias de aprendizaje como el RLHF o DPO (no aplicables a clasificacion de imagenes). La informacion disponible no detalla el tamaño exacto del dataset de entrenamiento ni la composicion de los datos, aunque se asume el split estandar de CIFAR-10 (50 000 entrenamiento, 10 000 test).

## Capacidades

- Clasificacion de imagenes en las 10 clases de CIFAR-10: avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion.
- Los checkpoints permiten reanudar el entrenamiento o realizar inferencia con pesos preentrenados.
- El repositorio incluye metadatos de arquitectura que facilitan la carga de cada modelo sin configuracion manual adicional.
- Se proporcionan benchmarks de inferencia en MPS (Apple Silicon) que miden latencia, throughput y memoria pico del host.
- No soporta tool calling, agentes, vision general (solo clasificacion de imagenes), audio ni texto. Es exclusivamente un modelo de clasificacion de imagenes.

## Casos de uso

- **Educacion e investigacion en vision por computador**: el repositorio es ideal para estudiar la diferencia de rendimiento entre arquitecturas (CNN, ViT, DenseNet) sobre un benchmark estandar como CIFAR-10. Un estudiante puede cargar los checkpoints y comparar la precision y la velocidad de inferencia sin necesidad de entrenar desde cero.
- **Validacion de pipelines de entrenamiento en Apple Silicon**: los benchmarks de inferencia MPS incluidos permiten evaluar el coste de ejecucion de cada arquitectura en hardware de Apple, util para decidir que modelo desplegar en entornos con recursos limitados.
- **Punto de partida para transferencia de aprendizaje**: aunque las imagenes de CIFAR-10 son de baja resolucion (32x32), los pesos de DenseCNN (92,53% de test) pueden servir como inicializacion para tareas de clasificacion similares en resolucion baja, reduciendo el tiempo de convergencia.
- **Benchmark de hardware**: los datos de latencia y memoria de la suite permiten comparar el rendimiento de diferentes GPUs o CPUs al ejecutar estas arquitecturas, siempre que se repliquen las condiciones de benchmark (batch size 128, 10 iteraciones de calentamiento, 50 medidas).
- **Desarrollo de sistemas de clasificacion en entornos con recursos limitados**: CNN-C + BN (84,27% de test con 30 epocas) es un candidato adecuado para aplicaciones donde la precision moderada es suficiente y el presupuesto de entrenamiento es limitado.
- **Reproducibilidad de experimentos**: los checkpoints guardan el estado del optimizador y el historial de epocas, lo que permite reanudar el entrenamiento o reproducir exactamente los resultados publicados.

## Benchmarks y rendimiento

La tabla de resultados finales publicada en la model card es la siguiente:

| Modelo | Epocas de entrenamiento | Epoca seleccionada | Mejor validacion | Precision en test |
|---|---:|---:|---:|---:|
| DenseCNN | 200 | 192 | 93,30% | 92,53% |
| CNN-C + BN | 30 | 27 | 86,24% | 84,27% |
| CNN-C + LN | 30 | 30 | 84,00% | 82,74% |
| R-CNN-B + BN | 30 | 29 | 82,40% | 81,22% |
| MobileNet-A + BN | 30 | 29 | 62,24% | 62,68% |
| MobileNet-A | 30 | 27 | 53,74% | 53,35% |
| CNN-B + BN | 30 | 29 | 83,02% | 81,55% |
| ViT | 30 | 28 | 70,66% | 69,08% |

El autor advierte que DenseCNN recibio un presupuesto de entrenamiento mayor (200 epocas) que el resto (30 epocas), por lo que la comparacion directa de precision no es equitativa. El mejor resultado dentro del presupuesto comun de 30 epocas es CNN-C + BN con un 84,27% de precision en test. Los benchmarks de rendimiento en MPS (latencia, throughput y memoria) se presentan en graficos SVG dentro del repositorio, pero los valores numericos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- **Hardware de entrenamiento**: los modelos se entrenaron en MPS (Apple Silicon), lo que indica que caben en la memoria unificada de un Mac con chip M1/M2/M3 (probablemente 8-16 GB, aunque no se especifica).
- **Hardware de inferencia**: los benchmarks de inferencia se realizaron en MPS con batch size 128, 10 iteraciones de calentamiento y 50 medidas. No se indican valores de VRAM concretos, pero los modelos son pequeños (CIFAR-10 con imagenes de 32x32), por lo que la inferencia es viable en cualquier GPU moderna con al menos 4 GB de VRAM, incluidas GPUs de consumo como la RTX 3060 o la RTX 4090.
- **Despliegue**: al ser checkpoints de PyTorch, se pueden cargar con `torch.load` y desplegar con cualquier framework que soporte PyTorch (TorchServe, FastAPI con `torch`, etc.). No se proporcionan pesos en formato GGUF, ONNX o safetensors, por lo que no son directamente compatibles con llama.cpp o Ollama.
- **Latencia y throughput**: no disponibles en la informacion proporcionada (solo se incluyen graficos, no valores numericos).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de CIFAR-10 en la informacion proporcionada. El repositorio es una suite de arquitecturas propias del autor, no una comparacion con modelos externos. Existen repositorios publicos con modelos preentrenados de CIFAR-10 (como `chenyaofo/pytorch-cifar-models` en GitHub), pero no se proporcionan sus resultados ni especificaciones en la informacion disponible, por lo que no se puede realizar una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- **Sesgo de comparacion**: el autor advierte explicitamente que DenseCNN se entreno durante 200 epocas mientras que el resto solo 30, por lo que su precision (92,53%) no es comparable directamente con los demas. Cualquier uso que presente estos resultados como comparables seria incorrecto.
- **Resolucion de imagen limitada**: los modelos se entrenan con imagenes de 32x32 píxeles de CIFAR-10. No funcionaran bien con imagenes de alta resolucion ni con clases fuera de las 10 del dataset.
- **Alucinacion y sesgos**: al ser un clasificador de imagenes, no genera texto, por lo que no hay riesgo de alucinacion linguistica. Sin embargo, puede presentar sesgos de clasificacion si las clases estan subrepresentadas en el dataset original (p.ej., clases con menos variabilidad de iluminacion o fondo).
- **Licencia desconocida**: no se ha publicado ninguna licencia en la model card. Esto impide usar los pesos en proyectos comerciales o derivados sin consultar al autor. En caso de uso comercial, contacta con ZoneTwelve para obtener permiso.
- **Formato propietario**: los checkpoints son `.pt` de PyTorch, lo que limita la portabilidad a otros frameworks sin una conversion manual. No hay versiones en safetensors, GGUF ni ONNX.
- **Falta de datos de entrenamiento detallados**: no se especifican el numero de tokens ni la composicion del dataset (aunque se asume CIFAR-10 completo), ni se mencionan tecnicas de regularizacion o aumento de datos, lo que dificulta la reproduccion exacta del entrenamiento.
- **Sin soporte de produccion**: no se incluyen scripts de servicio ni integraciones con frameworks de despliegue (vLLM, TGI, etc.). El repositorio es de investigacion, no de produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ZoneTwelve/cifar10-models
- Codigo fuente y reportes sincronizados: https://github.com/ZoneTwelve/cifar-baselines
- Datasets de CIFAR-10 en HuggingFace: https://huggingface.co/models?dataset=dataset:cifar10 y https://huggingface.co/models?dataset=dataset:uoft-cs/cifar10
- Repositorio externo de modelos CIFAR-10: https://github.com/chenyaofo/pytorch-cifar-models
