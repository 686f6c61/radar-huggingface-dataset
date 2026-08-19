# TimSchneider42/cod-vae-16x16-small

## Resumen

COD-VAE 16x16 (small) es un autoencoder variacional (VAE) para representación y reconstrucción de formas tridimensionales, desarrollado por TimSchneider42 como parte de una reimplementación no oficial de COD-VAE (Cho et al., ICCV 2025). El modelo comprime una malla 3D o una nube de puntos en 16 vectores latentes de 16 dimensiones (256 números en total) y los decodifica de vuelta a un campo de ocupación, que puede convertirse en una malla mediante extracción de iso-superficie. Su principal característica es estar optimizado para una decodificación muy rápida, incluido el paso hacia atrás, lo que lo hace adecuado para pipelines que entrenan a través del decoder congelado, como en aprendizaje por refuerzo táctil o modelos de difusión latente.

La arquitectura es una versión compacta del COD-VAE original: reduce el número de capas y la dimensión de los embeddings (256 frente a 512), mantiene 12 capas en el decoder latente y utiliza parches de 16 píxeles en el refinement decoder. Con aproximadamente 39 millones de parámetros (frente a los 188M del modelo completo), consigue un aumento de velocidad de decodificación de alrededor de 8x, a costa de una pequeña pérdida de calidad de reconstrucción (0.02-0.03 de IoU en el conjunto ABC). El modelo se distribuye bajo licencia MIT y se integra mediante la librería `cod-vae`, disponible para PyTorch y JAX.

La relevancia actual de este modelo radica en su capacidad para servir como componente de compresión en sistemas de generación 3D, donde la eficiencia computacional es crítica. Su tamaño reducido y su soporte para entrenamiento con gradientes a través del decoder lo convierten en una opción práctica para entornos con recursos limitados o para experimentación rápida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con transformer decoder (COD-VAE compacto) |
| Parametros totales | ~39 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | npz auto-contenido (carga con PyTorch o JAX) |

## Arquitectura y entrenamiento

COD-VAE 16x16 (small) sigue la arquitectura del COD-VAE original: un encoder que convierte una forma 3D en un conjunto de vectores latentes y un decoder basado en transformer que reconstruye el campo de ocupación. La versión "small" reduce la dimensión de embeddings a 256 con 4 cabezas de atención (frente a 512 y 8 del modelo completo), utiliza 3 bloques de encoder con 3 capas cada uno, y un refinement decoder de 6 capas que opera sobre parches de 16 píxeles (193 tokens), en lugar de 12 capas con parches de 8 píxeles (769 tokens). El decoder latente mantiene 12 capas y los planos de consulta se reducen a 16 canales.

El entrenamiento se realizó en dos etapas sobre un conjunto de datos fusionado de 110,077 formas: 48,597 mallas de ShapeNet (55 synsets), 50,000 mallas CAD del dataset tactile-mnist-abc-dataset-small y 11,480 mallas de tactile-mnist-mnist3d. La primera etapa entrenó el autoencoder durante 200 épocas con batch de 256 (128 por GPU en 2 GPUs) y learning rate 1e-4 escalado por el batch efectivo. La segunda etapa entrenó el VAE latente durante 100 épocas con batch de 512 (256 por GPU) y el mismo learning rate, reducido a la mitad en las épocas 60, 70, 80 y 90. Se usó precisión float32 con matmuls TF32. El modelo fija `attention_implementation="default"` (ruta XLA), que resulta ~1.3x más rápida que la selección automática de cuDNN para las secuencias cortas de decodificación.

## Capacidades

- Reconstrucción de formas 3D: codifica una malla o nube de puntos en un conjunto de latentes y decodifica a un campo de ocupación, del que se puede extraer una malla.
- Extracción de características: el pipeline `feature-extraction` permite obtener representaciones latentes compactas (256 números) para una forma dada.
- Decodificación a volúmenes densos: mediante `decode_volume` genera una rejilla de logits de ocupación a resolución arbitraria (por ejemplo, 128³).
- Entrenamiento con gradientes a través del decoder: soporta el paso hacia atrás completo, lo que permite integrarlo en pipelines de aprendizaje que optimizan latentes o decodifican con supervisión.
- Compatibilidad con PyTorch y JAX: los pesos se cargan con cualquiera de los dos backends.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente geométrico.

## Casos de uso

- Generación de formas 3D con modelos de difusión latente: el modelo actúa como autoencoder para comprimir mallas en un espacio latente compacto sobre el que se entrena un difusor. Su decodificación rápida acelera el muestreo y permite iterar con mayor frecuencia.
- Aprendizaje por refuerzo táctil en simulación: en entornos donde un agente interactúa con objetos mediante contacto físico, el decoder congelado puede usarse para reconstruir la forma del objeto a partir de observaciones parciales, con un coste computacional lo bastante bajo como para integrarse en el bucle de entrenamiento (11.75 pasos de entorno por segundo medido en un brazo robótico).
- Reconstrucción de mallas a partir de nubes de puntos: el modelo acepta nubes de puntos crudas y devuelve una malla cerrada, útil en pipelines de digitalización 3D o escaneado.
- Compresión de mallas para almacenamiento o transmisión: al reducir una forma a 256 números, se puede almacenar o enviar una representación muy compacta y reconstruir la geometría bajo demanda.
- Aumento de datos 3D: interpolando o perturbando los vectores latentes se pueden generar variaciones de una forma existente, ampliando conjuntos de entrenamiento para otros modelos.
- Extracción de características para clasificación o recuperación: los latentes de 16x16 sirven como embeddings de forma, comparables entre sí para tareas de retrieval o agrupamiento.
- Diseño CAD asistido: en herramientas de modelado, el modelo puede sugerir variantes de una pieza o completar geometrías parciales, aprovechando su rapidez de decodificación para interacción en tiempo real.

## Benchmarks y rendimiento

El modelo reporta calidad de reconstrucción sobre el conjunto de test de ABC (disjunto del entrenamiento), con 128 formas evaluadas:

| Metrica | Valor |
|---|---|
| Volumen IoU (puntos uniformes en el cubo) | 0.8721 |
| Precisión cerca de la superficie | 0.8302 |

Para referencia, el modelo completo cod-vae-16x16 alcanza 0.903 de IoU y 0.863 de precisión en el mismo conjunto. La pérdida de calidad es de aproximadamente 0.02-0.03 de IoU a cambio de una decodificación ~8x más rápida.

En cuanto a velocidad de decodificación, medida en una GPU H100 con JAX en float16 (forward + backward a través del latente completo, batch de 1024x2048 consultas):

| Modelo | Tiempo por batch | Rendimiento |
|---|---|---|
| cod-vae-16x8 (referencia) | ~350 ms | 2.9k formas/s |
| este modelo (16x16-small) | 43.5 ms | 23.6k formas/s |

En un bucle de entrenamiento de RL táctil (brazo de 50k pasos), el modelo alcanza 11.75 pasos de entorno por segundo frente a 1.53 del modelo 16x8, lo que supone una mejora de ~7.7x.

## Requisitos de hardware

- Al tratarse de un modelo de ~39M de parámetros, la VRAM necesaria es mínima: estimada en menos de 1 GB para inferencia en float16, y menos de 2 GB para entrenamiento con gradientes.
- Puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en GPUs de datacenter (A100, H100) con mayor margen para batches grandes.
- También es viable su ejecución en CPU para tareas de baja frecuencia, aunque la velocidad de decodificación se reduce notablemente.
- Opciones de despliegue: se integra mediante la librería `cod-vae` (pip install cod-vae[torch,hub] o cod-vae[jax,hub]). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- La configuración por defecto de atención (`attention_implementation="default"`) está optimizada para la ruta XLA en JAX; en PyTorch se puede usar la implementación estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Latentes | Velocidad (H100, fwd+bwd) | IoU ABC | Licencia |
|---|---|---|---|---|---|
| cod-vae-16x16 (full-size) | 188M | 16x16 | ~350 ms (estimado) | 0.903 | MIT |
| cod-vae-16x16-small (este) | ~39M | 16x16 | 43.5 ms | 0.872 | MIT |
| cod-vae-16x8 | ~39M (estimado) | 16x8 | ~350 ms (referencia) | no disponible | MIT |

El modelo small ofrece un equilibrio entre calidad y velocidad, siendo ~8x más rápido que el full-size con una pérdida de IoU de 0.03. La variante 16x8 tiene la misma velocidad que el full-size (según la medición de referencia), pero con una representación latente aún más compacta (128 números). Los tres modelos comparten licencia MIT y están disponibles en Hugging Face.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni procesa texto; su única función es la representación geométrica de formas 3D.
- Los espacios latentes no son intercambiables entre variantes: los latentes generados por este modelo no pueden decodificarse con cod-vae-16x16 ni con cod-vae-16x8, y viceversa.
- La calidad de reconstrucción es inferior a la del modelo completo (0.02-0.03 de IoU menos en ABC), por lo que para aplicaciones donde la fidelidad geométrica sea crítica, puede preferirse el modelo full-size.
- El entrenamiento se realizó sobre un conjunto limitado de categorías (ShapeNet, CAD y MNIST3D); la generalización a formas fuera de estos dominios no está garantizada.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos sintéticos y de CAD, puede presentar un rendimiento deficiente en formas orgánicas o muy detalladas.
- La licencia MIT permite uso comercial, pero se recomienda citar el trabajo original (Cho et al., ICCV 2025) en publicaciones o productos derivados.
- Para uso en producción, es necesario validar la calidad de reconstrucción en el dominio concreto, ya que las métricas reportadas corresponden a un único conjunto de test.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimSchneider42/cod-vae-16x16-small
- Repositorio GitHub (librería cod-vae): https://github.com/TimSchneider42/cod-vae
- Paper original (COD-VAE): https://arxiv.org/abs/2503.08737
- Modelo full-size cod-vae-16x16: https://huggingface.co/TimSchneider42/cod-vae-16x16
- Variante cod-vae-16x8: https://huggingface.co/TimSchneider42/cod-vae-16x8
