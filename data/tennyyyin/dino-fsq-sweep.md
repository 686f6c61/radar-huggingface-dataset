# tennyyyin/dino-fsq-sweep

## Resumen

DINO-FSQ es una colección de seis cabezas de cuantización FSQ (Finite Scalar Quantization) diseñadas para tokenizar las características de parches (patch features) de un modelo DINOv3 ViT-B/16. El autor, tennyyyin, publica estos pesos como parte del codebase abierto `ar_wam_rl`, orientado a world models y robótica. El objetivo es transformar representaciones continuas de 768 dimensiones por parche en códigos enteros discretos, de modo que un predictor autoregresivo posterior pueda modelar la dinámica de la escena.

Cada cabeza aplica una estandarización, una proyección lineal o MLP, una cuantización mediante una retícula FSQ con paso recto (straight-through) y una decodificación de vuelta al espacio de características original. El resultado es un token por parche junto con una reconstrucción. Se ofrecen dos modos: `delta`, que codifica el cambio entre frames consecutivos, y `feat`, que codifica cada frame de forma independiente. La colección incluye la configuración óptima en cada punto de la frontera rate-distortion, excluyendo deliberadamente brazos de control fallidos. La licencia y los idiomas soportados no se especifican en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de cuantizacion FSQ para DINOv3 ViT-B/16. Encoder y decoder lineales o MLP-512. Modos `delta` y `feat`. |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FSQ con esquema `ifsq` (celdas de igual anchura en [-1,1] mediante sigmoid squash). Lattices: 3d x L8, 4d x L8, 16d x L2, 16d x L5. |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | state dicts `.pt` y `configs.json` |

## Arquitectura y entrenamiento

La arquitectura de cada cabeza es identica en estructura: la entrada de 768 dimensiones se estandariza mediante buffers fijos `mu` y `sd` (estadisticas del conjunto de entrenamiento), luego pasa por un encoder que es una capa lineal `Linear(768, d)` o un MLP `Linear(768,h) GELU Linear(h,d)`. Despues se aplica la retícula FSQ, que produce un codigo entero por parche, y finalmente un decoder que puede ser lineal `Linear(d, 768)` o MLP `Linear(d,h) GELU Linear(h,768)`. El esquema de cuantizacion `ifsq` usa celdas de igual anchura tras una compresion sigmoide, de modo que las activaciones gaussianas se asignan a codigos casi uniformes.

El entrenamiento se realizo sobre características DINOv3 cacheadas, siendo las cabezas la unica parte entrenable del tokenizador. Se uso AdamW con un calentamiento lineal de 200 pasos, funcion de perdida log-cosh y sin decaimiento de pesos. Los heads lineales se entrenaron 8k pasos a `lr=1e-3`; los MLP, 16k pasos a `lr=1e-3`. La model card advierte que los heads MLP son sensibles a la tasa de aprendizaje: a `lr=1e-2` el encoder colapsa a una salida constante y el vocabulario efectivo se reduce a unos pocos codigos. Los pesos `q.proj_in.*` y `q.proj_out.*` presentes en el state dict son peso muerto sin entrenar, se mantienen para que la carga estricta de checkpoints funcione y no deben interpretarse.

## Capacidades

- Tokenizacion discreta de características DINOv3 ViT-B/16: cada parche de 768 dimensiones se cuantiza a un unico codigo entero.
- Dos modos de operacion:
  - `delta`: cuantiza la diferencia temporal `feat[t] - feat[t-1]`, con reconstruccion cerrada `prev + v_hat`. Domina al modo `feat` para tasas por debajo de ~37 bits por parche.
  - `feat`: cuantiza cada frame de forma independiente, sin referencia temporal.
- Seis configuraciones publicadas en la frontera rate-distortion, con tasas nominales de 9.0, 12.0, 16.0 y 37.1 bits por parche.
- Reconstruccion de características y decodificacion a RGB a traves del decoder de píxeles DINOv3 congelado.
- Integracion con el codebase `ar_wam_rl` para world models y robótica, con funciones de carga `from_pretrained` y `CONFIGS`.
- Incluye estadisticas de entrenamiento como buffers, de modo que los checkpoints son autocontenidos.
- No soporta tool calling, generacion de texto, vision como modelo multimodal ni razonamiento multi-paso; su funcion es estrictamente la de definir un vocabulario discreto para un predictor autoregresivo.

## Casos de uso

- Tokenizacion para world models autoregresivos: convertir las características continuas de DINOv3 en codigos discretos que un transformer pueda modelar como tokens, permitiendo aprendizaje de dinamicas de escena en robots.
- Compresion de datos de video de manipulacion multiview: usar el modo `delta` para codificar solo el cambio entre frames, reduciendo los bits por parche sin sacrificar la reconstruccion del contenido estatico.
- Aprendizaje por refuerzo en robotica: servir como cuantizador de observaciones dentro del pipeline `ar_wam_rl`, proporcionando una accion simbolica de baja dimension para entrenar políticas de control.
- Evaluacion de esquemas de cuantizacion visual: comparar el rendimiento rate-distortion de diferentes retículas FSQ y arquitecturas de encoder/decoder sobre un conjunto de validacion de manipulacion multiview.
- Investigacion en tokenizadores discretos: estudiar el efecto de la tasa de bits y el modo `delta` vs `feat` en la calidad de reconstruccion de características, con datos cuantitativos de PSNR y SSIM.
- Preprocesamiento para modelos visuales discretos: transformar características de un backbone preentrenado en tokens para alimentar modelos generativos de video o de acciones, en lugar de usar codificaciones continuas.
- Benchmark de reconstruccion con techo y suelo de referencia: disponer de puntos de referencia (copiar frame anterior, caracteristicas verdaderas) para interpretar la calidad de la reconstruccion en terminos relativos.

## Benchmarks y rendimiento

Los resultados proceden de la evaluacion realizada por el autor sobre un conjunto de validacion multiview de manipulacion. Se reportan PSNR (dB) y SSIM para reconstruccion a 1 paso (`h1`) y a 3 pasos con bucle cerrado (`h3`), decodificada a RGB mediante el decoder de píxeles DINOv3 congelado.

| head | modo | bits/patch | reticula | head | h1 PSNR/SSIM | h3 PSNR/SSIM |
|---|---|---|---|---|---|---|
| `delta_512codes_lin` | delta | 9.0 | 3d x L8 | lineal | 17.50 / 0.6430 | 16.73 / 0.6246 |
| `delta_4k_lin` | delta | 12.0 | 4d x L8 | lineal | 17.55 / 0.6440 | 16.80 / 0.6263 |
| `delta_16bit_MLP` | delta | 16.0 | 16d x L2 | MLP-512 | 18.21 / 0.6455 | 17.59 / 0.6239 |
| `delta_37bit_MLP_d16L5` | delta | 37.1 | 16d x L5 | MLP-512 | 18.98 / 0.6621 | 18.42 / 0.6456 |
| `feat_16bit_MLP` | feat | 16.0 | 16d x L2 | MLP-512 | 15.75 / 0.5460 | 15.82 / 0.5512 |
| `feat_37bit_MLP_d16L5` | feat | 37.1 | 16d x L5 | MLP-512 | 17.68 / 0.6153 | 17.71 / 0.6214 |

Puntos de referencia sobre el mismo conjunto de validacion y decoder:

| referencia | h1 PSNR/SSIM | h3 PSNR/SSIM |
|---|---|---|
| características verdaderas (techo del decoder) | 25.56 / 0.8110 | 25.51 / 0.8151 |
| copiar frame anterior (suelo trivial) | 16.56 / 0.6292 | 15.61 / 0.6038 |
| caracteristica media (suelo degenerado) | 12.86 / 0.5396 | 12.88 / 0.5447 |

El autor advierte que estos numeros deben leerse con el suelo en mente: el PSNR esta dominado por el contenido estatico de la escena, que todas las cabezas reconstruyen bien; el movimiento entre frames es lo que mayoritariamente se pierde. Frente al suelo de 16.56 dB de copiar el frame anterior y el techo de 25.56 dB, la mejor cabeza cierra aproximadamente un cuarto de esa brecha. `feat_16bit_MLP` se situa por debajo del suelo de copia, lo que evidencia que un codigo independiente de 16 bits por parche es un problema mas dificil de lo aparente.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la documentacion publicada. Al tratarse de cabezas de cuantizacion compuestas por capas lineales y MLPs de hasta 512 neuronas, el coste computacional por inferencia es minimo y pueden ejecutarse en GPU o CPU sin dificultad. Para un uso integrado con DINOv3, los requisitos de VRAM y latencia estaran dominados por el backbone, no por las cabezas. El ejemplo de uso indica carga en `device="cuda"` con PyTorch y la libreria `dinofsq_head.py`. Segun el tamano del checkpoint y los patrones de uso, no se requieren GPU de gran memoria; se pueden usar tarjetas de gama media. La latencia y el throughput no se han medido ni publicado.

## Comparativa con modelos similares

No se dispone de informacion de modelos comparables en la documentacion proporcionada. La comparativa interna entre los modos `delta` y `feat`, asi como entre las distintas retículas FSQ, constituye la unica referencia disponible y esta recogida en los benchmarks anteriores. Se recomienda no extrapolar el comportamiento a otros tokenizadores VQ-VAE o FSQ sin evidencia publicada.

## Limitaciones y advertencias

- Las cabezas estan entrenadas exclusivamente para características DINOv3 ViT-B/16 de 768 dimensiones; no son transferibles a otro backbone con distinta anchura sin reentrenar.
- El entrenamiento y la evaluacion se realizaron sobre un conjunto de datos de manipulacion multiview. El comportamiento en otros dominios (escenas naturales, video de internet, etc.) no ha sido probado.
- El uso efectivo de codigos es muy inferior al nominal: los heads de 37 bits utilizan aproximadamente 61k codigos distintos en el conjunto de validacion, por lo que la tasa aprovechable es mucho menor que la figura nominal.
- Son cabezas de reconstruccion, no modelos generativos. Definen un vocabulario discreto para un predictor autoregresivo, pero no predicen frames futuros por si mismas.
- Los atributos `q.proj_in.*` y `q.proj_out.*` son peso muerto sin entrenar y deben ignorarse. No se debe leer ningun significado en sus valores.
- El rendimiento de reconstruccion es modesto en terminos absolutos: la mejor cabeza cierra solo una cuarta parte del hueco entre el suelo de copiar el frame anterior y el techo de las características verdaderas.
- Los heads con MLP son sensibles a la tasa de aprendizaje durante el entrenamiento; una `lr` demasiado alta colapsa el encoder.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tennyyyin/dino-fsq-sweep
- Repositorio `ar_wam_rl`: https://github.com/hengkaipan/ar_wam_rl
