# SrijaVuppula/cloud-gap-geometry-checkpoints

## Resumen

`SrijaVuppula/cloud-gap-geometry-checkpoints` es una coleccion de checkpoints de la familia Prithvi-EO-2.0 (IBM y NASA) afinados por Srija Yadav Vuppula, Lakshmish Ramaswamy y Deepak Mishra para una tarea muy concreta: rellenar huecos contiguos (un bloque rectangular de parches ocultos) en la adquisicion central de una serie temporal de tres fechas de imagery HLS. El trabajo se enmarca en el articulo "Can Foundation Models Compensate for Incomplete Satellite Imagery? An Empirical Cost-Benefit Analysis", presentado en el taller CV4EO de WACV 2027.

El modelo no introduce arquitectura nueva: reutiliza los cuatro backbones de Prithvi-EO-2.0 (tiny, 100M, 300M y 600M parametros) y conserva el objetivo de preentrenamiento de masked autoencoder (MSE sobre los parches ocultos). Lo unico que cambia son los pesos: se actualizan todos los parametros del encoder y del decoder, sin congelar nada ni anadir cabezas. Cada checkpoint es un reemplazo directo del `Prithvi_EO_V2_*_TL.pt` original del mismo tamano.

Su relevancia es practica y metodologica: cuantifica cuanto puede aportar el fine-tuning especifico frente al uso zero-shot de un foundation model geoespacial cuando la oclusion es geometricamente contigua (nubes, sombras, fallos de sensor), un escenario mas realista que el enmascaramiento aleatorio con el que se preentrenan estos modelos. La conclusion principal es que la ganancia es modesta y se concentra en el backbone mas pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ViT con encoder-decoder (masked autoencoder), base Prithvi-EO-2.0 |
| Parametros totales | Cuatro variantes: tiny, 100M, 300M y 600M (cifras exactas no disponibles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; entrada de 3 adquisiciones x 6 bandas, 224 x 224 pixeles |
| Tipos de cuantizacion | No disponible (checkpoints en punto flotante, sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | No disponible (modelo de vision geoespacial, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch) + `config.json` por checkpoint |

## Arquitectura y entrenamiento

La base es Prithvi-EO-2.0, un transformer de vision con encoder y decoder pensado para datos multiespectrales de observacion de la Tierra. La entrada son tres adquisiciones consecutivas de HLS con seis bandas (Blue, Green, Red, NIR, SWIR1, SWIR2) a 224 x 224 pixeles, normalizadas por banda segun `config.json`; no se usan metadatos de fecha ni de localizacion. El objetivo de entrenamiento es el mismo del preentrenamiento: error cuadratico medio sobre los parches ocultos.

El fine-tuning se hizo sobre el dataset HLS Multi-Temporal Crop Classification, con 2.004 chips de entrenamiento y 50 de validacion, disjuntos y no adyacentes a los 500 chips de evaluacion. Las mascaras son un unico bloque contiguo sobre el frame de verano, con ratio uniforme entre el 20% y el 80% por muestra. Se uso AdamW con learning rate 1e-5, weight decay 0.05, 200 pasos de warmup seguidos de decaimiento coseno, grad clipping 1.0, batch size 1 y 20 epocas, conservando el mejor checkpoint por perdida de validacion. Todo el entrenamiento cabe en una NVIDIA RTX 3090, con tiempos de 0,28 h (tiny) a 3,00 h (600M) por ejecucion. Se publican diez ejecuciones (semillas) por backbone, que difieren en el orden de los chips y en las mascaras de entrenamiento pero parten de los mismos pesos.

## Capacidades

- Reconstruccion de parches ocultos en imagery multiespectral HLS: rellena un bloque rectangular contiguo en la adquisicion central de una serie de tres fechas.
- Trabajo con seis bandas espectrales simultaneamente (Blue, Green, Red, NIR, SWIR1, SWIR2).
- Compatibilidad drop-in con los pesos oficiales de Prithvi-EO-2.0: misma interfaz de carga (`load_prithvi`), mismo `config.json`, mismo numero de frames.
- Reproducibilidad mediante diez semillas por tamano de backbone.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de vision geoespacial, no un LLM.
- No tiene capacidades multilingues ni modo de razonamiento explicito.
- No procesa texto, audio ni video.

## Casos de uso

- Relleno de huecos por nubes en series temporales de cultivos: dado un cubo de tres fechas HLS donde la fecha central esta parcialmente cubierta por una nube, el modelo reconstruye la reflectancia de la zona oculta y permite continuar el analisis fenologico sin descartar la escena.
- Preprocesado en pipelines de monitorizacion agricola: integrado como paso previo a la clasificacion de cultivos, reduce la perdida de chips por cobertura nubosa en zonas con nubosidad persistente (por ejemplo, el sureste de EE. UU. en verano).
- Reparacion de huecos por fallo de sensor o bandeado: los bloques contiguos de pixeles corruptos se tratan como mascara y se reconstruyen con el mismo objetivo de MSE, sin reentrenar.
- Generacion de datos sinteticos controlados para aumentar datasets: aplicando mascaras rectangulares de ratio conocido se pueden producir pares (entrada ocluida, referencia) para evaluar otros metodos de inpainting geoespacial.
- Benchmarking de foundation models geoespaciales: los checkpoints y las diez semillas permiten medir de forma reproducible la varianza del fine-tuning y comparar con el uso zero-shot de Prithvi-EO-2.0.
- Investigacion sobre geometria de la oclusion: el paper cuantifica la diferencia de 1,2 a 2,8 dB entre huecos contiguos y parches dispersos, lo que sirve para disenar estrategias de aumento de datos mas realistas.
- Prototipado en hardware de consumo: la variante tiny se entrena y evalua en una RTX 3090, lo que facilita experimentos academicos sin acceso a clusters.

## Benchmarks y rendimiento

Resultados del paper: PSNR mediano en la region enmascarada sobre 500 chips, oclusion contigua, media de 10 ejecuciones.

| Backbone | r = 20% | r = 40% | r = 60% | r = 80% | Ganancia sobre zero-shot |
|---|---|---|---|---|---|
| tiny | 32,93 | 32,25 | 31,85 | 31,50 | +0,78 a +1,05 dB |
| 100M | 33,79 | 32,98 | 32,50 | 32,21 | +0,02 a +0,14 dB |
| 300M | 34,19 | 33,38 | 32,89 | 32,52 | +0,11 a +0,31 dB |
| 600M | 34,55 | 33,89 | 33,45 | 32,71 | +0,02 a +0,17 dB |

Observaciones del autor: el fine-tuning ayuda principalmente al backbone mas pequeno; los huecos contiguos siguen siendo entre 1,2 y 2,8 dB mas dificiles que el mismo numero de parches dispersos incluso despues del ajuste. No se publican resultados de MMLU, HumanEval ni GSM8K por no ser aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por tamano, la variante tiny es holgada en GPUs de consumo y la de 600M requiere una GPU con al menos 16-24 GB en fp32/fp16 (estimacion orientativa, no confirmada en la informacion).
- GPU de entrenamiento documentada: una NVIDIA RTX 3090 (24 GB) por ejecucion, con tiempos de 0,28 h (tiny) a 3,00 h (600M).
- Cabe en GPU de consumo: si, al menos la variante tiny y presumiblemente 100M en una RTX 3090; no hay datos publicados para 300M y 600M en GPUs de gama media.
- Opciones de despliegue: carga directa con PyTorch y `huggingface_hub` mediante el helper `load_prithvi` del repositorio GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Prithvi-EO-2.0 fine-tuned) | tiny / 100M / 300M / 600M | 3 x 6 bandas, 224 x 224 | Relleno de huecos contiguos en HLS | Apache 2.0 | Hugging Face, 10 semillas por tamano |
| Prithvi-EO-2.0-TL (zero-shot) | tiny / 100M / 300M / 600M | 3 x 6 bandas, 224 x 224 | Masked autoencoder generico | Apache 2.0 | Hugging Face (IBM-NASA) |
| Otros metodos de cloud gap filling (no especificados en la informacion) | No disponible | No disponible | Inpainting geoespacial | No disponible | No disponible |

No se dispone de datos de benchmarks de terceros en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas especificas.

## Limitaciones y advertencias

- El fine-tuning se realizo con un unico ano (2022), sobre EE. UU. contiguo, con sesgo hacia tierras de cultivo y con mascaras rectangulares sinteticas; la generalizacion a otras regiones, anos o patrones de nube reales no esta validada.
- La ganancia sobre zero-shot es muy pequena para 100M y 600M (+0,02 a +0,17 dB), lo que cuestiona la relacion coste-beneficio del ajuste en esos tamanos.
- Los huecos contiguos siguen siendo entre 1,2 y 2,8 dB mas dificiles que los parches dispersos, incluso tras el fine-tuning.
- No se documentan sesgos demograficos ni linguisticos por tratarse de un modelo de imagery; si existe sesgo geografico y de cobertura del suelo derivado del dataset.
- Riesgo de alucinacion en el sentido de reconstruir texturas plausibles pero incorrectas en zonas ocultas grandes (r = 80%), sin senal de incertidumbre calibrada publicada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Prithvi-EO-2.0 y del dataset HLS Multi-Temporal Crop Classification.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en produccion ni de validacion independiente.
- El checkpoint se distribuye como `.pt` de PyTorch sin versiones cuantizadas, lo que limita el despliegue en entornos con restricciones de memoria.

## Enlaces

- Hugging Face: https://huggingface.co/SrijaVuppula/cloud-gap-geometry-checkpoints
- Codigo, resultados e instrucciones: https://github.com/SrijaVuppula/cloud-gap-geometry
- Modelo base Prithvi-EO-2.0-100M-TL: https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-100M-TL
- Dataset HLS Multi-Temporal Crop Classification: https://huggingface.co/datasets/ibm-nasa-geospatial/multi-temporal-crop-classification
- Articulo: Vuppula, Ramaswamy y Mishra, "Can Foundation Models Compensate for Incomplete Satellite Imagery? An Empirical Cost-Benefit Analysis", CV4EO workshop, WACV 2027 (enlace directo al paper no disponible).
