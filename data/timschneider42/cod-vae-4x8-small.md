# TimSchneider42/cod-vae-4x8-small

## Resumen

COD-VAE 4x8 small es un autoencoder variacional (VAE) para formas tridimensionales desarrollado por TimSchneider42, que comprime una malla 3D en solo 4 vectores latentes de 8 dimensiones (32 números en total) y los decodifica de vuelta a un campo de ocupación. Es una variante compacta del modelo cod-vae-4x8, optimizada para decodificación rápida, incluido el paso hacia atrás, pensada para pipelines que entrenan a través del decodificador congelado. Con aproximadamente 39 millones de parámetros en total y unos 20 millones en la ruta de decodificación, ofrece una velocidad de decodificación unas 8 veces superior a la del modelo completo, a costa de una pequeña pérdida de calidad de reconstrucción.

El modelo se basa en la arquitectura COD-VAE descrita en el artículo "Representing 3D Shapes with 64 Latent Vectors for 3D Diffusion Models" (Cho et al., ICCV 2025). Los pesos se distribuyen como un archivo npz autocontenido que carga tanto con PyTorch como con JAX a través de la librería `cod-vae`. Está licenciado bajo MIT, lo que permite uso comercial sin restricciones. Su relevancia actual radica en habilitar entrenamiento de aprendizaje por refuerzo táctil y otros pipelines que requieren decodificación densa de formas a alta velocidad, algo que los VAE 3D convencionales no permiten con fluidez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE 3D con codificador por bloques y decodificador transformer con poda de tokens basada en incertidumbre |
| Parametros totales | ~39 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto) |
| Tipos de cuantizacion | no disponible (pesos en float32, cargables en float16 con JAX) |
| Idiomas soportados | no disponible (modelo de formas 3D, no de texto) |
| Licencia | MIT |
| Formato de pesos | npz (autocontenido, carga con PyTorch o JAX) |

## Arquitectura y entrenamiento

El modelo sigue el esquema COD-VAE: un codificador comprime progresivamente la forma 3D en un conjunto reducido de vectores latentes 1D, y un decodificador transformer reconstruye el campo de ocupación a partir de esos vectores. La variante small reduce el embedding de 512 a 256 dimensiones con 4 cabezas de atención, usa 3 bloques de 3 capas en el codificador (frente a 4 bloques), y un decodificador de refinamiento con 6 capas y parches de 16 píxeles (193 tokens) en lugar de 12 capas con parches de 8 píxeles (769 tokens). Los planos de consulta (`query_dim`) se reducen de 32 a 16 canales. El decodificador latente mantiene 12 capas en ambas versiones. La configuración fija `attention_implementation="default"` (ruta XLA), que en las secuencias cortas de decodificación es aproximadamente 1.3 veces más rápida que la selección automática de kernels cuDNN.

El entrenamiento se realizó en dos etapas: primero un autoencoder durante 200 épocas (lote 256, tasa de aprendizaje 1e-4 escalada por lote efectivo), y después un VAE latente durante 100 épocas (lote 512, misma tasa con reducción a la mitad en las épocas 60, 70, 80 y 90). Todo en precisión float32 con multiplicaciones TF32. El conjunto de datos combinado contiene 110,077 formas: 48,597 de ShapeNet (55 synsets, preprocesado 3DShape2VecSet), 50,000 mallas CAD de `tactile-mnist-abc-dataset-small` y 11,480 mallas de `tactile-mnist-mnist3d`, todas preprocesadas con la receta `sdf_gen` de los autores originales. La selección de arquitectura se hizo mediante una campaña de ablaciones con un umbral de calidad mínimo (IoU >= 0.83 en ABC para la configuración 16x8).

## Capacidades

- Reconstrucción de formas 3D: codifica una malla o nube de puntos en 4 vectores latentes de 8 dimensiones y decodifica a campo de ocupación, del que se puede extraer una malla.
- Extracción de características: los latentes de 32 dimensiones pueden usarse como representación compacta de una forma para tareas downstream (clasificación, generación, comparación).
- Decodificación densa a alta velocidad: permite evaluar el campo de ocupación en miles de puntos de consulta arbitrarios con un coste reducido, lo que es clave para simulaciones táctiles y aprendizaje por refuerzo.
- Paso hacia atrás eficiente: el decodificador congelado admite entrenamiento a través de él (por ejemplo, para ajustar un codificador o un modelo generativo) con un coste de cómputo unas 8 veces menor que el modelo completo.
- Integración con PyTorch y JAX: los pesos cargan con cualquiera de los dos backends, lo que facilita su uso en pipelines existentes.
- Generación de volúmenes densos: función `decode_volume` que produce una rejilla de logits de ocupación a resolución arbitraria (por ejemplo, 128^3).

## Casos de uso

- Aprendizaje por refuerzo táctil: en un bucle de entrenamiento con 50,000 pasos, el modelo alcanza 11.75 pasos de entorno por segundo frente a 1.53 del modelo completo, lo que permite entrenar políticas de manipulación con sensores táctiles simulados de forma práctica.
- Compresión de mallas para almacenamiento: una forma 3D se reduce a 32 números en float32 (128 bytes), lo que permite guardar grandes catálogos de piezas CAD o escaneos con una fracción del espacio original.
- Generación de formas condicionada: los latentes de 32 dimensiones pueden usarse como espacio de entrada para un modelo de difusión 3D, siguiendo el planteamiento del paper original, con la ventaja de una decodificación mucho más rápida.
- Reconstrucción de mallas a partir de nubes de puntos: el codificador acepta nubes de puntos crudas en el cubo [-1, 1]^3, por lo que puede integrarse en pipelines de escaneo 3D o reconstrucción desde sensores de profundidad.
- Aumento de datos para visión 3D: generar variaciones de formas codificando y decodificando con interpolación en el espacio latente, útil para entrenar clasificadores o segmentadores con datos sintéticos.
- Simulación de contacto y robótica: evaluar el campo de ocupación en puntos de consulta arbitrarios permite detectar colisiones o calcular distancias a superficie de forma diferenciable, lo que es útil para planificación de movimiento y control.

## Benchmarks y rendimiento

El modelo reporta calidad de reconstrucción sobre el conjunto de test ABC (disjunto del entrenamiento), con 128 formas mantenidas:

| Metrica | cod-vae-4x8 (full) | cod-vae-4x8-small |
|---|---|---|
| Volumen IoU (ABC) | 0.743 | 0.7333 |
| Near-surface accuracy (ABC) | 0.758 | 0.7428 |

La velocidad de decodificación se midió en H100 con JAX en float16, sobre la variante 16x8 (los autores indican que `num_latents` y `latent_dim` apenas afectan al coste, por lo que los valores son representativos para toda la familia small):

| Escenario | cod-vae-16x8 | 16x8-small |
|---|---|---|
| Forward+backward, batch 1024 x 2048 queries | ~350 ms (2.9k shapes/s) | 43.5 ms (23.6k shapes/s) |
| Bucle de RL táctil (50k pasos) | 1.53 env-steps/s | 11.75 env-steps/s |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K porque el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada: no se especifica en la documentación, pero con ~39M de parámetros y una ruta de decodificación de ~20M, la inferencia en float32 ocupa aproximadamente 156 MB de pesos (y ~80 MB en float16). La memoria total depende del tamaño de lote y del número de puntos de consulta, pero es factible en cualquier GPU moderna con 4 GB o más.
- GPU recomendadas: la medición de velocidad se realizó en H100, pero el modelo es lo bastante pequeño como para ejecutarse en GPUs de consumo como RTX 3060, RTX 4070 o superiores. En CPU también es viable para uso interactivo.
- Opciones de despliegue: se usa a través de la librería `cod-vae` con backend PyTorch o JAX. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: en H100 con JAX float16, la decodificación de 1024 formas con 2048 consultas cada una (forward+backward) tarda 43.5 ms, lo que equivale a 23.6k formas por segundo. En GPUs consumer se espera una proporción menor, pero sigue siendo sustancialmente más rápido que el modelo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Latentes | Velocidad decode (H100) | Volumen IoU (ABC) | Licencia |
|---|---|---|---|---|---|
| cod-vae-4x8-small (este) | ~39M | 4x8 | 43.5 ms (16x8) | 0.7333 | MIT |
| cod-vae-4x8 (full) | 188M | 4x8 | ~350 ms (16x8) | 0.743 | MIT |
| COD-VAE original (paper) | no disponible | 64 vectores | no disponible | no disponible | no disponible |

La comparativa directa con el modelo completo muestra el compromiso: un 8% menos de IoU en ABC a cambio de una velocidad de decodificación aproximadamente 8 veces superior. El modelo original del paper (join16/COD-VAE) no publica pesos ni métricas comparables en la información disponible.

## Limitaciones y advertencias

- Los latentes de este modelo no son intercambiables con los de cod-vae-4x8: aunque la forma del espacio latente es idéntica (4x8), los espacios son distintos y decodificar latentes de un modelo con el otro produce resultados incorrectos.
- Pérdida de calidad frente al modelo completo: el IoU en ABC baja de 0.743 a 0.7333, y la precisión cerca de la superficie de 0.758 a 0.7428. Para aplicaciones que requieran máxima fidelidad geométrica, el modelo full-size puede ser preferible.
- No es un modelo de lenguaje ni multimodal: no procesa texto, imágenes ni audio. Su única entrada son nubes de puntos o mallas 3D.
- El conjunto de entrenamiento incluye principalmente formas de ShapeNet y CAD; puede tener un sesgo hacia geometrías de esos dominios y rendir peor con formas orgánicas o muy detalladas.
- La documentación no especifica la robustez ante ruido en las nubes de puntos de entrada ni el comportamiento con mallas no normalizadas al cubo [-1, 1]^3.
- El modelo es una implementación no oficial de COD-VAE; aunque sigue la arquitectura del paper, no ha sido validado por los autores originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TimSchneider42/cod-vae-4x8-small
- Modelo completo (cod-vae-4x8): https://huggingface.co/TimSchneider42/cod-vae-4x8
- Repositorio GitHub de cod-vae: https://github.com/TimSchneider42/cod-vae
- Paper original (arXiv): https://arxiv.org/abs/2503.08737
- Guía de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
- Dataset tactile-mnist-abc-dataset-small: https://huggingface.co/datasets/TimSchneider42/tactile-mnist-abc-dataset-small
- Dataset tactile-mnist-mnist3d: https://huggingface.co/datasets/TimSchneider42/tactile-mnist-mnist3d
