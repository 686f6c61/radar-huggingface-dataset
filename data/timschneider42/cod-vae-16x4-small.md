# TimSchneider42/cod-vae-16x4-small

## Resumen

COD-VAE 16 x 4 (small) es un autoencoder variacional (VAE) para formas tridimensionales desarrollado por TimSchneider42 como una reimplementacion no oficial del modelo COD-VAE propuesto por Cho et al. en ICCV 2025. El modelo comprime una forma 3D en 16 vectores latentes de 4 dimensiones (64 numeros en total) y los decodifica de vuelta a un campo de ocupacion, permitiendo reconstruir la geometria original. Esta variante "small" reduce el tamano de la red a aproximadamente 39 millones de parametros (frente a los 188 millones del modelo completo) y esta optimizada para una decodificacion rapida, incluido el paso hacia atras, lo que la hace adecuada para pipelines que entrenan a traves del decodificador congelado.

El modelo resuelve el problema de representar formas 3D de forma compacta y eficiente, un paso previo habitual en tareas como generacion de mallas, aprendizaje por refuerzo con sensores tactiles o compresion de geometria. Su relevancia actual radica en que ofrece una alternativa ligera al modelo completo, con una perdida de calidad de solo 0.02-0.03 puntos de IoU en el conjunto de validacion ABC, pero con una aceleracion de aproximadamente 8 veces en la decodificacion. Los pesos se distribuyen en formato npz autocontenido y son compatibles tanto con PyTorch como con JAX mediante la libreria `cod-vae`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con encoder transformer y decoder con token pruning (COD-VAE) |
| Parametros totales | ~39 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo 3D, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo 3D) |
| Licencia | MIT |
| Formato de pesos | npz (autocontenido, compatible con PyTorch y JAX) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de COD-VAE (Cho et al., ICCV 2025), que comprime una forma 3D en un conjunto fijo de vectores latentes y los decodifica en un campo de ocupacion mediante un decodificador transformer con poda de tokens basada en incertidumbre. La variante small reduce las dimensiones internas: embed dim de 256 con 4 cabezas de atencion (frente a 512 y 8 del modelo completo), el encoder pasa de 4 bloques de 3 capas a 3 bloques de 3 capas, el decodificador de refinamiento utiliza 6 capas con parches de 16 pixeles (193 tokens) en lugar de 12 capas con parches de 8 pixeles (769 tokens), y los planos de consulta (`query_dim`) se reducen de 32 a 16 canales. El decodificador latente mantiene 12 capas. El camino de decodificacion comprende aproximadamente 20 millones de parametros, frente a los 90 millones del modelo original.

El entrenamiento se realizo sobre un conjunto de datos combinado de 110.077 formas, formado por 48.597 mallas de ShapeNet (preprocesadas con el metodo de 3DShape2VecSet, 55 synsets), 50.000 mallas CAD del dataset `tactile-mnist-abc-dataset-small` y las 11.480 mallas de `tactile-mnist-mnist3d`. Solo se usaron los splits de entrenamiento y las mallas se preprocesaron con la receta `sdf_gen` de los autores originales. El entrenamiento se realizo en dos etapas: una primera etapa de autoencoder de 200 epocas (el doble de las 100 de referencia, lo que aporto +0.009 de IoU en el tronco) y una segunda etapa de VAE latente de 100 epocas. En ambas etapas se uso precision float32 con matmuls TF32, batch de 256 por GPU en la primera etapa y 512 en la segunda, y tasa de aprendizaje de 1e-4 escalada por el batch efectivo, con reduccion a la mitad en las epocas 60, 70, 80 y 90 de la segunda etapa. La configuracion fija `attention_implementation="default"` (ruta XLA), que en las secuencias cortas de decodificacion de esta arquitectura es aproximadamente 1.3 veces mas rapida que dejar que "auto" seleccione el kernel fusionado de cuDNN.

## Capacidades

- Reconstruccion de formas 3D a partir de nubes de puntos o mallas: el modelo codifica la geometria en 16 vectores latentes de 4 dimensiones y la decodifica en un campo de ocupacion binario.
- Compresion de geometria: una forma completa se reduce a 64 numeros, lo que permite almacenamiento o transmision muy compacta.
- Decodificacion a volumenes densos: mediante `decode_volume` se puede obtener una rejilla de logits de ocupacion con resolucion configurable (por ejemplo, 128^3).
- Extraccion de caracteristicas: los latentes pueden usarse como representacion compacta para tareas posteriores como clasificacion, retrieval o generacion.
- Compatibilidad multiplataforma: los pesos cargan tanto en PyTorch como en JAX a traves de la libreria `cod-vae`.
- Optimizacion para entrenamiento con decodificador congelado: el paso hacia atras es rapido (~43.5 ms en H100), lo que permite integrarlo en bucles de aprendizaje por refuerzo u otros pipelines que necesiten gradientes a traves del decodificador.

## Casos de uso

- Aprendizaje por refuerzo con sensores tactiles: el modelo puede integrarse en un bucle de entrenamiento donde un agente interactua con objetos 3D. En una prueba medida con 50.000 pasos, el modelo small alcanzo 11.75 pasos de entorno por segundo frente a 1.53 del modelo completo, lo que acelera notablemente la experimentacion.
- Generacion de formas 3D: los latentes de 64 dimensiones pueden servir como espacio latente para modelos generativos (por ejemplo, difusion) que produzcan nuevas geometrias. La decodificacion rapida permite muestrear muchas formas en paralelo.
- Compresion y almacenamiento de mallas: codificar una malla en 64 numeros reduce drasticamente el espacio necesario para guardar o transmitir geometria, a costa de una reconstruccion aproximada (IoU 0.7618 en ABC).
- Aumento de datos para datasets 3D: se pueden generar variaciones de formas existentes interpolando o perturbando los latentes y decodificando nuevas mallas, util para entrenar otros modelos de vision o robotica.
- Extraccion de caracteristicas para retrieval: los latentes de 64 dimensiones pueden indexarse eficientemente para buscar formas similares en una base de datos grande, gracias a su tamano reducido.
- Prototipado rapido de pipelines de reconstruccion 3D: al ser ligero y rapido, es adecuado para experimentos en entornos con recursos limitados o para validar ideas antes de escalar a modelos mas grandes.

## Benchmarks y rendimiento

Se han publicado resultados de calidad de reconstruccion sobre el split de test de ABC (disjunto del entrenamiento), medidos sobre el campo de ocupacion decodificado. El IoU se calcula sobre puntos muestreados uniformemente en el cubo, y la precision cerca de la superficie sobre puntos muestreados cerca de la superficie.

| Metrica | COD-VAE 16x4 small | COD-VAE 16x4 (completo) |
|---|---|---|
| Volumen IoU (ABC held-out) | 0.7618 | 0.782 |
| Precision cerca de la superficie | 0.7457 | 0.770 |

En cuanto a velocidad de decodificacion, medida en H100 con JAX en float16 (los valores son validos para toda la familia `-small`, ya que `latent_dim` solo afecta a las proyecciones latentes, que son pequenas):

| Operacion | COD-VAE 16x8 (completo) | COD-VAE 16x8 small |
|---|---|---|
| Forward+backward a traves del latente completo, batch 1024 x 2048 consultas | ~350 ms (2.900 formas/s) | 43.5 ms (23.600 formas/s) |
| Bucle completo de RL tactil (medido, brazos de 50.000 pasos) | 1.53 pasos de entorno/s | 11.75 pasos de entorno/s |

## Requisitos de hardware

- Inferencia: el modelo tiene ~39 millones de parametros, por lo que cabe en cualquier GPU con al menos 1-2 GB de VRAM. Incluso en CPU es viable para inferencia puntual, aunque la decodificacion masiva se beneficiaria de una GPU.
- GPU recomendadas: cualquier GPU moderna (serie RTX 20/30/40, A100, H100). En H100 se midieron 43.5 ms para forward+backward con batch de 1024x2048 consultas, lo que equivale a ~23.600 formas por segundo.
- En GPU de consumo: si, cabe en GPUs como RTX 3060 o superiores. Para entrenamiento a traves del decodificador congelado, una GPU con al menos 8 GB de VRAM seria suficiente para batches moderados.
- Opciones de despliegue: el modelo se carga mediante la libreria `cod-vae` (PyTorch o JAX). No es compatible con vLLM, Ollama ni TGI, ya que no es un modelo de lenguaje. Para produccion, se puede exportar a TensorRT u ONNX si se necesita una latencia aun menor.
- Latencia y throughput: en H100, la decodificacion de un lote de 1024x2048 consultas (forward+backward) tarda 43.5 ms. La decodificacion solo forward seria proporcionalmente mas rapida.

## Comparativa con modelos similares

| Modelo | Parametros | Latente | IoU (ABC) | Velocidad decode | Licencia |
|---|---|---|---|---|---|
| COD-VAE 16x4 small (este) | ~39M | 16x4 | 0.7618 | ~23.600 formas/s (H100) | MIT |
| COD-VAE 16x4 (completo) | 188M | 16x4 | 0.782 | ~2.900 formas/s (H100) | MIT |
| COD-VAE 16x8 (completo) | ~188M | 16x8 | no disponible | ~2.900 formas/s (H100) | MIT |

El modelo small ofrece una relacion rendimiento/calidad claramente favorable para aplicaciones donde la velocidad de decodificacion es critica. La perdida de 0.02-0.03 de IoU frente al modelo completo puede ser aceptable en muchos escenarios. No se dispone de datos de otros VAE 3D comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Los latentes de este modelo no son intercambiables con los de `cod-vae-16x4` (el modelo completo): aunque la forma del latente coincide (16x4), los espacios latentes son diferentes y no se pueden decodificar con el otro modelo.
- La calidad de reconstruccion es inferior a la del modelo completo: la perdida de IoU en ABC es de aproximadamente 0.02-0.03 puntos, lo que puede ser relevante en aplicaciones que requieran alta fidelidad geometrica.
- El modelo esta especializado en formas 3D y no procesa texto, imagenes ni audio. No tiene capacidades de tool calling ni de agentes.
- No se han documentado sesgos especificos, pero al entrenarse principalmente con mallas de ShapeNet y CAD, puede tener un rendimiento suboptimo en categorias de objetos poco representadas.
- Al ser un VAE, puede generar formas irreales o con artefactos cuando se decodifican latentes fuera de la distribucion de entrenamiento.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo es una reimplementacion no oficial del paper de COD-VAE; conviene revisar las patentes o restricciones adicionales del trabajo original si se planea un uso comercial avanzado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimSchneider42/cod-vae-16x4-small
- Modelo completo (cod-vae-16x4): https://huggingface.co/TimSchneider42/cod-vae-16x4
- Repositorio de la libreria cod-vae: https://github.com/TimSchneider42/cod-vae
- Paper original (arXiv): https://arxiv.org/abs/2503.08737
- Guia de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
- Dataset tactile-mnist-abc-dataset-small: https://huggingface.co/datasets/TimSchneider42/tactile-mnist-abc-dataset-small
- Dataset tactile-mnist-mnist3d: https://huggingface.co/datasets/TimSchneider42/tactile-mnist-mnist3d
