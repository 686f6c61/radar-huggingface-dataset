# TimSchneider42/cod-vae-8x8-small

## Resumen

COD-VAE 8 x 8 (small) es un autoencoder variacional (VAE) para reconstrucción de formas 3D desarrollado por TimSchneider42. El modelo comprime una forma tridimensional en 8 vectores latentes de 8 dimensiones (64 números) y los decodifica en un campo de ocupación. Se trata de una versión compacta del modelo COD-VAE 8 x 8 completo, con aproximadamente 39 millones de parámetros en lugar de 188 millones, optimizada para una decodificación rápida, incluido el paso hacia atrás (backward pass) en pipelines que entrenan a través del decodificador congelado.

El modelo se basa en la arquitectura COD-VAE propuesta por Cho et al. en ICCV 2025, que representa formas 3D mediante un número reducido de vectores latentes para facilitar modelos de difusión 3D. La versión small reduce el tamaño de la red y la secuencia de decodificación (parches de 16 píxeles en lugar de 8), lo que permite un aumento de velocidad de aproximadamente 8 veces en la decodificación con una pérdida de calidad de reconstrucción de entre 0.02 y 0.03 IoU. Está disponible bajo licencia MIT y puede usarse tanto en PyTorch como en JAX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | COD-VAE (autoencoder variacional con decodificador de refinamiento) |
| Parámetros totales | ~39 millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de formas 3D, no de texto) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en formato npz) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | NPZ (autocontenido, cargable con PyTorch o JAX) |

## Arquitectura y entrenamiento

El modelo es un autoencoder variacional que codifica una forma 3D en 8 vectores latentes de 8 dimensiones cada uno. La arquitectura se compone de un codificador con 3 bloques y 3 capas por bloque (dimensión de embedding 256, 4 cabezas de atención), un decodificador de refinamiento con 6 capas que procesa parches de 16 píxeles (193 tokens), y un decodificador latente con 12 capas. El modelo define un espacio latente propio, distinto del modelo COD-VAE 8 x 8 completo, por lo que los latentes de un modelo no son intercambiables con el otro.

El entrenamiento se realizó en dos etapas. La primera, de autoencoder, se ejecutó durante 200 épocas con un lote de 256 (128 por GPU en 2 GPUs), una tasa de aprendizaje de 1e-4 y una repetición del dataset de 8 veces por época. La segunda etapa, de VAE latente, se entrenó durante 100 épocas con un lote de 512, y una reducción de la tasa de aprendizaje a la mitad en las épocas 60, 70, 80 y 90. Se usó precisión float32 con multiplicaciones TF32. El dataset de entrenamiento combina 48 597 formas de ShapeNet (preprocesadas con la receta de 3DShape2VecSet), 50 000 mallas CAD de tactile-mnist-abc-dataset-small y 11 480 mallas de tactile-mnist-mnist3d, totalizando 110 077 formas. Solo se usaron los splits de entrenamiento.

El modelo fija la implementación de atención en "default" (ruta XLA), que en las secuencias cortas de decodificación de esta arquitectura es aproximadamente 1.3 veces más rápida que la opción automática que seleccionaría el kernel cuDNN.

## Capacidades

- Codificación de formas 3D en un espacio latente compacto (8 vectores de 8 dimensiones).
- Decodificación de latentes en campos de ocupación, que pueden convertirse en mallas tridimensionales.
- Extracción de características geométricas para aplicaciones de análisis de forma.
- Generación de volúmenes densos de logits de ocupación (por ejemplo, con resolución 128) a partir de latentes.
- Cálculo de latentes a partir de nubes de puntos de superficie arbitrarias (coordenadas en [-1, 1]^3).
- Decodificación en puntos de consulta específicos, lo que permite muestreo adaptativo.
- Integración con pipelines de entrenamiento que requieren paso hacia atrás a través del decodificador (por ejemplo, aprendizaje por refuerzo con retroalimentación táctil).

## Casos de uso

- Reconstrucción de mallas 3D a partir de nubes de puntos: el modelo puede tomar una nube de puntos de un objeto y generar una malla completa mediante la codificación en latente y la decodificación en campo de ocupación. Su baja latencia de decodificación lo hace adecuado para aplicaciones de escaneo en tiempo real.
- Compresión de representaciones 3D para almacenamiento o transmisión: al reducir una forma a 64 números, se puede almacenar o enviar una representación muy compacta y reconstruir la forma con una calidad razonable, útil en sistemas de intercambio de modelos 3D.
- Generación de formas para modelos de difusión: como el modelo COD-VAE original, este se puede usar como autoencoder para entrenar modelos de difusión latente sobre formas 3D, reduciendo la dimensionalidad del espacio de representación.
- Aprendizaje por refuerzo con retroalimentación táctil: el modelo se ha medido en bucles de entrenamiento de RL táctil, donde la decodificación rápida permite alcanzar 11.75 pasos de entorno por segundo frente a 1.53 del modelo completo, facilitando el entrenamiento de políticas de manipulación robótica.
- Generación de volúmenes de ocupación para simulación: se pueden decodificar volúmenes densos de ocupación a partir de latentes, útiles para simulaciones físicas o para generar mapas de colisión en entornos virtuales.
- Análisis de formas y extracción de características: el espacio latente de 64 dimensiones puede usarse como representación compacta para tareas de clasificación, búsqueda por similitud o agrupamiento de formas 3D, sin necesidad de reconstruir la malla completa.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de calidad de reconstrucción y de velocidad de decodificación.

| Métrica | Valor (este modelo) | Valor (cod-vae-8x8 completo) |
|---|---|---|
| Volumen IoU en ABC (test) | 0.7917 | 0.806 |
| Precisión cerca de la superficie en ABC | 0.7794 | 0.793 |
| Velocidad de decodificación (forward+backward, batch 1024x2048 queries, H100) | 43.5 ms (23.6k shapes/s) | ~350 ms (2.9k shapes/s) |
| Velocidad en bucle de RL táctil (50k-step arms) | 11.75 env-steps/s | 1.53 env-steps/s |

Los resultados de calidad se midieron sobre el split de test de ABC (disjunto del entrenamiento), con IoU sobre puntos uniformes en el cubo y precisión sobre puntos cercanos a la superficie. La velocidad se midió con JAX en float16 sobre H100 para la variante 16x8, pero la model card indica que estos valores son válidos para toda la familia `-small`.

No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que no se trata de un modelo de lenguaje. Los datos presentados son los únicos disponibles.

## Requisitos de hardware

- El modelo tiene ~39 millones de parámetros, lo que supone un uso de memoria de aproximadamente 156 MB en float32 y 78 MB en float16, por lo que cabe en la mayoría de GPUs de consumo (por ejemplo, NVIDIA RTX 3060 o superiores).
- Las mediciones de velocidad del autor se realizaron en una NVIDIA H100 con JAX en float16, pero la baja carga de memoria sugiere que también es viable en GPUs con 8 GB de VRAM.
- No se han especificado requisitos mínimos oficiales. Se recomienda al menos una GPU con 6-8 GB de VRAM para trabajar con lotes moderados de consultas.
- El modelo se carga mediante la librería `cod-vae` (PyTorch o JAX) y no se indica soporte para vLLM, llama.cpp u otros motores de inferencia estándar; el despliegue se hace a través de las APIs de PyTorch/JAX.
- La latencia de decodificación es de aproximadamente 43.5 ms por lote de 1024x2048 consultas en H100, lo que equivale a 23.6 k formas por segundo en ese hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Latente | Velocidad de decodificación | Calidad (ABC IoU) | Licencia |
|---|---|---|---|---|---|
| COD-VAE 8x8 (completo) | 188 M | 8x8 | ~2.9 k shapes/s (H100) | 0.806 | MIT |
| COD-VAE 8x8 small (este) | ~39 M | 8x8 | ~23.6 k shapes/s (H100) | 0.7917 | MIT |
| 3DShape2VecSet (baseline) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo completo y al baseline del que deriva la arquitectura, ya que no se han proporcionado datos de otros modelos de reconstrucción 3D. El pequeño sacrificio de calidad (0.02-0.03 IoU) compensa con un aumento de ~8x en velocidad de decodificación.

## Limitaciones y advertencias

- El modelo define un espacio latente propio, incompatible con el del modelo completo `cod-vae-8x8`; los latentes generados con uno no se pueden decodificar con el otro.
- La calidad de reconstrucción es ligeramente inferior a la del modelo completo, con una pérdida de entre 0.02 y 0.03 en IoU sobre ABC, lo que puede ser relevante en aplicaciones que requieran alta fidelidad geométrica.
- Los datos de entrenamiento provienen de ShapeNet, ABC y MNIST3D, por lo que el modelo puede mostrar sesgos hacia formas de estos conjuntos y no generalizar bien a objetos muy diferentes.
- No se han evaluado sesgos o riesgos de alucinación, pero al ser un modelo generativo de geometría, puede producir formas no plausibles en regiones de baja densidad de puntos.
- La licencia MIT permite uso comercial, pero se recomienda revisar las licencias de los datasets de entrenamiento (ShapeNet, ABC, MNIST3D) para uso comercial de los modelos entrenados con ellos.
- No se dispone de información sobre cuantización ni sobre soporte para formatos de inferencia como ONNX o TensorRT, lo que puede limitar su despliegue en entornos de producción con requisitos específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimSchneider42/cod-vae-8x8-small
- Repositorio de código: https://github.com/TimSchneider42/cod-vae
- Paper original (COD-VAE): https://arxiv.org/abs/2503.08737
- Dataset tactile-mnist-abc-dataset-small: https://huggingface.co/datasets/TimSchneider42/tactile-mnist-abc-dataset-small
- Dataset tactile-mnist-mnist3d: https://huggingface.co/datasets/TimSchneider42/tactile-mnist-mnist3d
