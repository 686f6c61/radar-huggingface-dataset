# TimSchneider42/cod-vae-4x16-small

## Resumen

COD-VAE 4x16 small es un autoencoder variacional (VAE) para representación y reconstrucción de formas tridimensionales, desarrollado por TimSchneider42 como una variante compacta del modelo COD-VAE original (Cho et al., ICCV 2025). Comprime una malla 3D en solo 4 vectores latentes de 16 dimensiones (64 números en total) y los decodifica en un campo de ocupación, permitiendo reconstruir la geometría con alta fidelidad. A diferencia del modelo completo cod-vae-4x16 (188M parámetros), esta versión reduce la red a aproximadamente 39M parámetros, con una ruta de decodificación de ~20M, logrando una aceleración de ~8x en la decodificación a costa de una pérdida de 0.02-0.03 en IoU. Está diseñado específicamente para pipelines que requieren decodificación rápida, incluido el paso backward para entrenamiento a través del decoder congelado, como en bucles de aprendizaje por refuerzo táctil. El modelo se distribuye bajo licencia MIT y se integra con la librería `cod-vae` (PyTorch/JAX).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con transformer decoder (COD-VAE) |
| Parametros totales | ~39 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo 3D); 193 tokens de consulta en el decoder de refinamiento |
| Tipos de cuantizacion | float32 (entrenamiento), float16 (inferencia) |
| Idiomas soportados | no aplica (modelo de formas 3D) |
| Licencia | MIT |
| Formato de pesos | npz (auto-contenido, compatible con PyTorch y JAX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura COD-VAE: un encoder procesa la nube de puntos de la superficie y produce un conjunto de vectores latentes (en este caso 4 vectores de 16 dimensiones), y un decoder transformer reconstruye el campo de ocupación mediante poda de tokens basada en incertidumbre. La configuración concreta de esta variante small usa embed dim 256 con 4 cabezas de atención, encoder de 3 bloques x 3 capas, decoder de refinamiento con 6 capas y patches de 16 píxeles (193 tokens), y 12 capas en el decoder latente. Los planos de consulta (`query_dim`) tienen 16 canales. El entrenamiento se realizó en dos etapas: primero un autoencoder (200 épocas, batch 256, lr 1e-4) y luego un VAE latente (100 épocas, batch 512, lr con reducción en épocas 60/70/80/90). El dataset combinado incluye 110,077 formas: 48,597 de ShapeNet (55 synsets), 50,000 mallas CAD de tactile-mnist-abc-dataset-small y 11,480 de tactile-mnist-mnist3d, todas preprocesadas con la receta sdf_gen de los autores originales. La configuración fija `attention_implementation="default"` (ruta XLA), que es ~1.3x más rápida que la selección automática de cuDNN en secuencias de decodificación cortas.

## Capacidades

- Codificación de mallas 3D a 4 vectores latentes de 16 dimensiones (64 números) mediante `encode_mesh`.
- Decodificación de latentes a campo de ocupación, con reconstrucción de malla trimesh (`decode_mesh`).
- Cálculo de latentes a partir de nubes de puntos de superficie sin necesidad de malla.
- Decodificación en puntos de consulta arbitrarios (`decode`) y generación de volúmenes densos de logits (`decode_volume`).
- Soporte de paso backward a través del decoder congelado, permitiendo entrenar pipelines que optimizan latentes o redes aguas arriba.
- Extracción de características latentes para representaciones compactas de geometría 3D.
- Compatibilidad con PyTorch y JAX mediante la librería `cod-vae`.
- No es un modelo de lenguaje: no genera texto, código ni realiza razonamiento simbólico.

## Casos de uso

- Reconstrucción de formas 3D a partir de nubes de puntos: el modelo acepta puntos de superficie y produce un campo de ocupación, útil en escaneo 3D y digitalización de objetos.
- Compresión de geometría para almacenamiento o transmisión: al reducir una malla a 64 números, permite representar formas complejas con un coste de memoria mínimo.
- Aprendizaje por refuerzo táctil en robótica: el README reporta un uso medido en un bucle de RL táctil con 50k pasos, donde la variante small alcanza 11.75 env-steps/s frente a 1.53 del modelo completo, habilitando entrenamiento en tiempo real.
- Generación de formas 3D con modelos de difusión: los latentes compactos sirven como espacio intermedio para entrenar difusión sobre geometría, como propone el paper original.
- Aumento de datos sintéticos: generar variantes de mallas existentes mediante interpolación o perturbación de latentes.
- Filtrado y clasificación de formas: usar los vectores latentes como características de entrada para clasificadores o sistemas de búsqueda por similitud.
- Prototipado rápido en CAD: reconstruir piezas desde bocetos o nubes de puntos parciales con una calidad aceptable (IoU 0.79 en ABC).

## Benchmarks y rendimiento

Se han publicado resultados de reconstrucción sobre el split de test de ABC (disjunto del entrenamiento), medidos sobre el campo de ocupación decodificado: IoU sobre puntos uniformes del cubo y accuracy sobre puntos cercanos a la superficie.

| Metrica | cod-vae-4x16 (full) | cod-vae-4x16-small |
|---|---|---|
| Volumen IoU (ABC held-out) | 0.804 | 0.7942 |
| Near-surface accuracy (ABC held-out) | 0.797 | 0.7822 |

Además, se reportan mediciones de velocidad en H100 con JAX float16 (variante 16x8, representativa de toda la familia small):

| Operacion | cod-vae-16x8 | 16x8-small |
|---|---|---|
| Forward+backward completo, batch 1024 x 2048 queries | ~350 ms (2.9k shapes/s) | 43.5 ms (23.6k shapes/s) |
| Bucle de RL táctil (50k pasos) | 1.53 env-steps/s | 11.75 env-steps/s |

## Requisitos de hardware

- El modelo tiene ~39M parámetros; en float16 ocupa aproximadamente 78 MB de memoria, por lo que cabe en cualquier GPU consumer (incluso en una GTX 1060 de 6 GB) y en CPU.
- Las mediciones de velocidad se realizaron en una NVIDIA H100, pero no se especifican requisitos mínimos de VRAM ni de cómputo.
- Para inferencia en producción, se puede desplegar con la librería `cod-vae` (PyTorch o JAX) en cualquier entorno con soporte para estas bibliotecas.
- No se mencionan opciones de despliegue tipo vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia de decodificación es de ~43.5 ms por lote de 1024x2048 consultas en H100, lo que equivale a ~23.6k formas por segundo en forward+backward.

## Comparativa con modelos similares

| Modelo | Parametros | Latente | IoU (ABC) | Velocidad decode | Licencia |
|---|---|---|---|---|---|
| cod-vae-4x16 (full) | 188M | 4x16 | 0.804 | ~2.9k shapes/s (H100) | MIT |
| cod-vae-4x16-small (este) | ~39M | 4x16 | 0.7942 | ~23.6k shapes/s (H100) | MIT |
| 3DShape2VecSet (referencia del paper) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada. La comparativa se limita a la variante full del mismo autor, que es la única con métricas publicadas en la misma configuración.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en formas 3D; no procesa texto, imágenes ni audio.
- La calidad de reconstrucción es ligeramente inferior a la del modelo completo (0.7942 vs 0.804 IoU en ABC), con una pérdida de 0.02-0.03 que puede ser relevante en aplicaciones de alta precisión.
- Los espacios latentes de esta variante y de cod-vae-4x16 no son intercambiables: los latentes de un modelo no pueden decodificarse con el otro, aunque tengan la misma forma.
- El entrenamiento se realizó con un dataset específico (ShapeNet, ABC, MNIST3D); la generalización a categorías de formas muy diferentes a las del entrenamiento no está garantizada.
- No se han evaluado sesgos ni riesgos de alucinación geométrica (generación de estructuras inexistentes) en la información disponible.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo es una reimplementación no oficial del paper COD-VAE; conviene verificar la patente o restricciones adicionales del trabajo original si se usa en productos comerciales.
- El rendimiento de velocidad se midió en H100 con JAX float16; en otros hardware o backends los resultados pueden variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimSchneider42/cod-vae-4x16-small
- Modelo completo (referencia): https://huggingface.co/TimSchneider42/cod-vae-4x16
- Repositorio GitHub de la librería: https://github.com/TimSchneider42/cod-vae
- Paper original (arXiv): https://arxiv.org/abs/2503.08737
- Guía de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
