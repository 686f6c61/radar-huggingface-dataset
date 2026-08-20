# yihangj3/brats-transunet

## Resumen

El modelo `brats-transunet` es un checkpoint de segmentación de tumores cerebrales en resonancia magnética multimodal (MRI) desarrollado por Yihang Jiao (Universidad de Illinois). Se trata de una implementación de TransUNet, una arquitectura híbrida que combina un codificador Transformer (ViT-B/16 con backbone ResNet-50) con un decodificador tipo U-Net, adaptada para procesar slices axiales 2D de cuatro modalidades (FLAIR, T1, T1-CE, T2). El modelo se entrenó desde cero con un presupuesto fijo de 15 épocas sobre el dataset BraTS, con el objetivo de comparar de forma controlada el rendimiento de U-Net y TransUNet en la segmentación de gliomas.

La relevancia de este modelo radica en que proporciona pesos públicos y reproducibles para una tarea de segmentación médica crítica, con métricas detalladas por subregión tumoral. El checkpoint principal (`checkpoint_jobA_epoch19.pth`) alcanza un foreground Dice de 0.7578 y una entropía cruzada media de 0.0464, superando a la U-Net original en la misma configuración. El repositorio incluye además un segundo checkpoint de referencia, aunque el autor advierte que no es el modelo reportado en el análisis.

El modelo se distribuye bajo licencia MIT, con pesos en formato PyTorch (`.pth`) y un tamaño de repositorio de 2.6 GB. No se proporcionan datos sobre el número total de parámetros, cuantizaciones ni soporte multilingüe, ya que se trata de un modelo de visión por computador, no de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TransUNet (ResNet-50 + ViT-B/16 como codificador, decodificador U-Net) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 2D de 320x320 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, formato `.pth`) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pth`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TransUNet original propuesta por Chen et al. (2021), que combina un codificador híbrido CNN-Transformer: un backbone ResNet-50 extrae características de alto nivel, que luego se alimentan a un ViT-B/16 con parches de 16x16 píxeles. El decodificador es una U-Net clásica con conexiones de salto (skip connections) que recuperan la resolución espacial. El autor añade dos modificaciones propias: una proyección de 4 a 3 canales de entrada (para adaptar las cuatro modalidades MRI) y un refinamiento de las conexiones de salto en el lado del decodificador.

El entrenamiento se realizó desde cero con un presupuesto fijo de 15 épocas, utilizando datos BraTS (FLAIR, T1, T1-CE, T2) sin redistribuir. Las entradas son slices axiales 2D de 320x320 píxeles, normalizados z-score por slice y con un crop cerebral calculado a partir del tejido no nulo. La salida tiene cuatro clases (el label 4 de BraTS se remapea a 3). No se especifica el uso de técnicas como RLHF o DPO, ya que no aplican a este tipo de modelo. El checkpoint almacena la configuración del modelo y las coordenadas del crop junto con los pesos, lo que permite reconstruir exactamente el modelo en evaluación.

## Capacidades

- Segmentación semántica de tumores cerebrales en MRI multimodal, distinguiendo tres subregiones: tumor realzado (label 1), edema (label 2) y núcleo tumoral (label 3).
- Procesamiento de entradas de 4 canales (FLAIR, T1, T1-CE, T2) en slices axiales 2D.
- Inferencia a resolución 320x320 píxeles, con normalización z-score por slice y crop cerebral automático.
- El checkpoint incluye la configuración del modelo y las coordenadas de crop, facilitando la reproducibilidad.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües, al ser un modelo de visión especializado.

## Casos de uso

- Segmentación de tumores cerebrales en investigación clínica: el modelo puede aplicarse a volúmenes MRI completos para obtener máscaras de tumor por subregión, útil en estudios retrospectivos de gliomas.
- Evaluación comparativa de arquitecturas: al estar entrenado bajo un presupuesto fijo y con configuración controlada, sirve como baseline para comparar U-Net vs. TransUNet en segmentación médica.
- Preprocesamiento para radiómica: las máscaras generadas pueden alimentar pipelines de extracción de características cuantitativas (tamaño, forma, textura) para análisis predictivo.
- Desarrollo de herramientas de planificación quirúrgica: la segmentación precisa del edema y del núcleo tumoral puede integrarse en software de visualización 3D para neurocirujanos.
- Formación y docencia: al ser un checkpoint público y ligero (2.6 GB), es adecuado para que estudiantes de ingeniería biomédica aprendan a evaluar modelos de segmentación médica.
- Reproducibilidad de experimentos: el código asociado en GitHub permite replicar la evaluación y comparar métricas con otros modelos en el mismo split de datos.

## Benchmarks y rendimiento

El autor reporta métricas sobre el split de evaluación de BraTS, calculadas solo sobre slices donde la clase está presente (foreground Dice). Los resultados del checkpoint principal son:

| Metrica | Valor |
|---|---|
| Foreground Dice (promedio labels 1-3) | 0.7578 |
| Entropía cruzada media (mean CE) | 0.0464 |
| Dice label 1 (tumor realzado) | 0.6775 |
| Dice label 2 (edema) | 0.7661 |
| Dice label 3 (núcleo tumoral) | 0.8299 |

Comparación con otros modelos en la misma configuración (mismo split y métrica):

| Metodo | Resolucion de entrada | mean CE ↓ | FG Dice ↑ |
|---|---|---|---|
| Original U-Net | crop | 0.0437 | 0.7326 |
| Flex U-Net (norm + depth only) | crop | 0.3850 | 0.6323 |
| Flex U-Net (loss improved) | crop | 0.1952 | 0.7033 |
| **TransUNet baseline** | 320² | 0.0455 | **0.7575** |
| TransUNet (skip refinement + aug) | 224² | 0.0411 | 0.7347 |

Nota: el valor de FG Dice en la tabla de comparación (0.7575) difiere ligeramente del reportado en la tabla principal (0.7578), probablemente por redondeo o por diferencias en el checkpoint evaluado. El autor indica que la ventaja de TransUNet se concentra en el label 2 (edema difuso), donde obtiene 0.7652 frente a 0.6800 de la U-Net original, mientras que en el label 3 la U-Net es ligeramente superior (0.8351 vs. 0.8322).

## Requisitos de hardware

- VRAM estimada: no disponible explícitamente, pero al ser un modelo de visión con entrada 320x320 y un ViT-B/16, se estima que requiere al menos 4-6 GB de VRAM en inferencia con precisión FP32. Con batch size 1 y sin cuantización, una GPU con 8 GB debería ser suficiente.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM (RTX 3060, RTX 4060, A100, etc.). Para entrenamiento o fine-tuning se recomienda una GPU con 16 GB o más.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo como RTX 3060/4060/4070, siempre que se use batch size 1 y resolución 320x320.
- Opciones de despliegue: el modelo se distribuye como checkpoint de PyTorch, por lo que puede cargarse con `torch.load` y ejecutarse con el código de evaluación del repositorio. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerá de la GPU y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolucion de entrada | FG Dice | mean CE | Licencia |
|---|---|---|---|---|---|
| **TransUNet baseline (este modelo)** | R50-ViT-B/16 + U-Net decoder | 320² | 0.7578 | 0.0464 | MIT |
| Original U-Net | U-Net convolucional | crop | 0.7326 | 0.0437 | MIT (impl. de referencia) |
| Flex U-Net (loss improved) | U-Net con variantes | crop | 0.7033 | 0.1952 | MIT (impl. de referencia) |
| TransUNet (skip refinement + aug) | TransUNet modificado | 224² | 0.7347 | 0.0411 | MIT (impl. de referencia) |

La comparativa se limita a las variantes evaluadas en el mismo estudio. No se dispone de datos de otros modelos de segmentación de tumores cerebrales (p.ej., nnU-Net, Swin UNETR) en las mismas condiciones, por lo que no se incluyen.

## Limitaciones y advertencias

- El modelo se entrenó con un presupuesto fijo de 15 épocas, lo que puede no ser suficiente para alcanzar el rendimiento óptimo de la arquitectura. Los resultados no son comparables con modelos entrenados durante más tiempo o con estrategias de aumento más agresivas.
- Las métricas de Dice se calculan solo sobre slices donde la clase está presente; no son comparables con métricas calculadas sobre todas las slices (incluyendo las que no contienen tumor).
- El dataset BraTS no se redistribuye; el usuario debe obtenerlo de los organizadores del desafío. Esto limita la reproducibilidad inmediata.
- El modelo está diseñado específicamente para MRI multimodal de cerebro (FLAIR, T1, T1-CE, T2). No funcionará correctamente con otros tipos de imagen o modalidades sin reentrenamiento.
- No se han evaluado sesgos demográficos o de adquisición; el rendimiento puede degradarse en poblaciones o equipos de MRI diferentes a los del dataset BraTS.
- El segundo checkpoint (`checkpoint_improved_transunet_epoch20.pth`) no es el modelo reportado; usarlo puede llevar a conclusiones erróneas.
- Licencia MIT permite uso comercial, pero el dataset BraTS tiene sus propias restricciones de uso que deben respetarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yihangj3/brats-transunet
- Repositorio de código y documentación: https://github.com/yhj3/brats-unet-vs-transunet
- Implementación original de TransUNet (referencia): https://github.com/Beckschen/TransUNet
- Página personal del autor: https://yhj3.github.io
