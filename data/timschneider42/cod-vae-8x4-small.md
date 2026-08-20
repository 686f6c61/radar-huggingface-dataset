# TimSchneider42/cod-vae-8x4-small

## Resumen

COD-VAE 8x4 small es un autoencoder variacional (VAE) para representación y reconstrucción de formas 3D, desarrollado por TimSchneider42 como una variante compacta y optimizada para decodificación del modelo COD-VAE original (Cho et al., ICCV 2025). El modelo comprime una malla 3D en 8 vectores latentes de 4 dimensiones (32 números en total) y los decodifica de vuelta a un campo de ocupación, lo que permite representar geometrías completas con una huella de memoria extremadamente reducida.

La relevancia de este modelo radica en su diseño orientado a la velocidad: con aproximadamente 39 millones de parámetros (frente a los 188M del modelo completo), consigue un rendimiento de decodificación unas 8 veces superior, incluyendo el paso backward, lo que lo hace especialmente adecuado para pipelines de entrenamiento que necesitan propagar gradientes a través del decodificador congelado. Está entrenado sobre un conjunto de datos combinado de 110.077 formas 3D procedentes de ShapeNet, CAD y MNIST3D, y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | COD-VAE (autoencoder variacional con decodificador de refinamiento por capas) |
| Parametros totales | ~39M |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en float32; inferencia en float16 con JAX) |
| Idiomas soportados | no disponible (modelo de vision 3D, sin soporte de lenguaje) |
| Licencia | MIT |
| Formato de pesos | NPZ autocontenido (cargable con PyTorch o JAX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura COD-VAE descrita en el paper "Representing 3D Shapes with 64 Latent Vectors for 3D Diffusion Models" (Cho et al., ICCV 2025). La variante small reduce el embedding de 512 a 256 dimensiones con 4 cabezas de atencion, utiliza 3 bloques de encoder (en lugar de 4) y un decodificador de refinamiento con 6 capas que procesa parches de 16 píxeles (193 tokens), frente a las 12 capas y parches de 8 píxeles (769 tokens) del modelo completo. El decodificador latente mantiene 12 capas y los planos de consulta se reducen de 32 a 16 canales.

El entrenamiento se realizó en dos etapas: primero un autoencoder durante 200 épocas con batch de 256 (2 GPUs), y después un VAE latente durante 100 épocas con batch de 512, usando precisión float32 con matmuls TF32. El dataset combina 48.597 formas de ShapeNet (55 synsets), 50.000 mallas CAD de tactile-mnist-abc-dataset-small y 11.480 mallas de tactile-mnist-mnist3d, todas preprocesadas con la receta sdf_gen de los autores originales. La configuracion fija `attention_implementation="default"` (ruta XLA), que resulta ~1.3x más rápida que la selección automática de cuDNN en las secuencias cortas de decodificación.

## Capacidades

- Compresión de mallas 3D en 8 vectores latentes de 4 dimensiones (32 números) que capturan la forma global del objeto.
- Decodificación de latentes a campos de ocupación, tanto en puntos de consulta arbitrarios como en rejillas densas (p. ej., resolución 128³).
- Reconstrucción directa de mallas: dado un mesh de entrada, el modelo produce una reconstrucción como malla Trimesh.
- Codificación desde nubes de puntos de superficie sin necesidad de mallas completas.
- Decodificación diferenciable: el paso backward a través del decodificador congelado es rápido (~20M parámetros), lo que permite entrenar pipelines que optimizan latentes.
- Extracción de características: los latentes pueden usarse como representación compacta para tareas posteriores (generación, clasificación, retrieval).
- Inferencia en float16 con JAX para aceleración en GPU.

## Casos de uso

- Aprendizaje por refuerzo táctil: el modelo se ha validado en bucles de entrenamiento de RL táctil, alcanzando 11,75 env-steps/s frente a 1,53 del modelo completo, gracias a su decodificador rápido y diferenciable. Es adecuado para simulaciones que requieren reconstruir formas a partir de contactos.
- Generación de formas 3D con modelos de difusión: los latentes de 32 dimensiones sirven como espacio latente compacto para entrenar modelos generativos que produzcan nuevas geometrías, reduciendo drásticamente la dimensionalidad del problema.
- Reconstrucción de mallas en tiempo real: con un throughput de ~23.6k shapes/s en H100 (forward+backward, batch de 1024×2048 queries), puede integrarse en pipelines de renderizado o diseño interactivo donde la latencia importa.
- Compresión de datasets 3D: permite almacenar colecciones de mallas como vectores de 32 números, facilitando el almacenamiento, la transmisión y la búsqueda por similitud en grandes repositorios de geometría.
- Preprocesado para visión robótica: la codificación de nubes de puntos a latentes permite a un robot representar objetos observados de forma compacta y reconstruirlos para planificación de agarres o manipulación.
- Aumento de datos en CAD: el modelo puede reconstruir piezas mecánicas con un IoU de 0,72 sobre el conjunto ABC, lo que lo hace util para generar variantes sintéticas o completar geometrías parciales en flujos de diseño asistido.

## Benchmarks y rendimiento

| Metrica | cod-vae-8x4-small | cod-vae-8x4 (completo) |
|---|---|---|
| Volumen IoU (ABC, 128 formas) | 0,7238 | 0,727 |
| Precisión near-surface (ABC) | 0,7358 | 0,748 |
| Decodificación forward+backward (H100, batch 1024×2048) | 43,5 ms (23,6k shapes/s) | ~350 ms (2,9k shapes/s) |
| Env-steps/s en RL táctil (50k-step arms) | 11,75 | 1,53 |

La calidad de reconstrucción se midió sobre el conjunto de test de ABC, disjunto del entrenamiento, calculando IoU sobre puntos uniformes del cubo y precisión sobre puntos cercanos a la superficie. El modelo pequeño sacrifica entre 0,02 y 0,03 de IoU a cambio de una aceleración de decodificación de aproximadamente 8x.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con ~39M de parámetros en float16, el modelo ocupa aproximadamente 78 MB de pesos, por lo que cabe en cualquier GPU con más de 2 GB de VRAM.
- GPU recomendadas: el modelo se validó en H100, pero por su tamaño es ejecutable en GPUs de consumo como RTX 3060, RTX 4090 o superiores.
- Compatibilidad con GPUs de consumo: sí, cualquier GPU moderna con soporte CUDA o XLA es suficiente.
- Opciones de despliegue: biblioteca `cod-vae` con backends PyTorch y JAX; instalación mediante `pip install cod-vae[torch,hub]` o `cod-vae[jax,hub]`.
- Latencia y throughput: 43,5 ms por batch de 1024×2048 queries en H100 (forward+backward), lo que equivale a ~23.6k shapes/s; en bucles de RL táctil se midieron 11,75 env-steps/s.

## Comparativa con modelos similares

| Modelo | Parametros | Latente | IoU (ABC) | Velocidad decode | Licencia |
|---|---|---|---|---|---|
| cod-vae-8x4-small (este) | ~39M | 8×4 | 0,7238 | 43,5 ms (H100) | MIT |
| cod-vae-8x4 | 188M | 8×4 | 0,727 | ~350 ms (H100) | MIT |
| cod-vae-16x8-small | ~39M (familia) | 16×8 | >= 0,83 (objetivo de diseño) | 43,5 ms (H100) | MIT |

No se dispone de comparativas con otros autoencoders 3D (p. ej., 3DShape2VecSet, Occupancy Networks) en la información proporcionada. La comparativa con el modelo completo de la misma familia muestra el equilibrio entre calidad y velocidad que ofrece esta variante.

## Limitaciones y advertencias

- El espacio latente de este modelo es incompatible con el de cod-vae-8x4 completo: los latentes de un modelo no pueden decodificarse con el otro, aunque tengan la misma forma (8×4).
- La calidad de reconstrucción es ligeramente inferior a la del modelo completo: ~0,02-0,03 menos de IoU en ABC, lo que puede ser relevante en aplicaciones que requieran alta fidelidad geométrica.
- El modelo está entrenado principalmente con datos de ShapeNet, CAD y MNIST3D; su rendimiento puede degradarse en dominios muy diferentes (escenas completas, objetos orgánicos, geometrías no cerradas).
- No se han publicado evaluaciones de sesgos o comportamientos adversariales; como modelo de representación geométrica, el riesgo principal es la pérdida de detalles finos en la reconstrucción.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo depende de la biblioteca `cod-vae` y de los datasets de entrenamiento, cuyas licencias individuales deben verificarse.
- El modelo no soporta entrada de lenguaje ni texto: es exclusivamente para datos geométricos 3D.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TimSchneider42/cod-vae-8x4-small
- Paper original (COD-VAE): https://arxiv.org/abs/2503.08737
- Repositorio de código: https://github.com/TimSchneider42/cod-vae
- Guía de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
- Dataset tactile-mnist-abc-dataset-small: https://huggingface.co/datasets/TimSchneider42/tactile-mnist-abc-dataset-small
- Dataset tactile-mnist-mnist3d: https://huggingface.co/datasets/TimSchneider42/tactile-mnist-mnist3d
- Receta de preprocesado sdf_gen: https://github.com/1zb/sdf_gen
