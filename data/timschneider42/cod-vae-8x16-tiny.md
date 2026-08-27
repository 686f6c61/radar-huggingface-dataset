# TimSchneider42/cod-vae-8x16-tiny

## Resumen

COD-VAE 8x16 tiny es un autoencoder variacional (VAE) para representación de formas tridimensionales, desarrollado por TimSchneider42 como parte de una reimplementación no oficial en PyTorch/JAX del modelo COD-VAE propuesto por Cho et al. en ICCV 2025. Comprime una malla o nube de puntos en 8 vectores latentes de 16 dimensiones (128 números en total) y los decodifica en un campo de ocupación. Esta variante "tiny" está diseñada específicamente para pipelines donde el cuello de botella es el paso forward y backward a través de un decoder congelado, como en aprendizaje por refuerzo con recompensa de reconstrucción. Con aproximadamente 6,6 millones de parámetros, es unas 4 veces más rápido que la versión `-small` y 33 veces más rápido que el modelo completo, manteniendo una calidad de reconstrucción aceptable para ciertos usos.

El modelo comparte la misma forma latente que sus hermanos `cod-vae-8x16` y `cod-vae-8x16-small`, pero cada uno define su propio espacio latente, por lo que los latentes no son intercambiables entre versiones. Se distribuye bajo licencia MIT y se integra mediante la librería `cod-vae`, que permite cargar los pesos tanto con PyTorch como con JAX. Su tamaño reducido y su velocidad de decodificación lo hacen adecuado para experimentación en entornos con recursos limitados o para tareas que requieren múltiples evaluaciones del decoder.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con encoder y decoder basados en transformers, con planos de consulta (query planes) y latentes 1D |
| Parametros totales | ~6,6 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de vision 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | npz (cargable con PyTorch o JAX) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de COD-VAE: un encoder procesa la forma de entrada (malla o nube de puntos) y produce un conjunto de vectores latentes compactos, mientras que un decoder basado en atención reconstruye el campo de ocupación a partir de esos latentes. En esta variante tiny, el embed dim es 128 con 4 cabezas de atención, el encoder consta de 2 bloques con 2 capas cada uno y 256 parches, el decoder de refinamiento tiene 4 capas con parches de 32 píxeles, los planos de consulta usan 8 canales a resolución 96², y el decoder latente tiene 6 capas. La configuración fija `attention_implementation="default"` (ruta XLA), que resulta más rápida que el kernel fusionado de cuDNN para estas secuencias cortas.

El entrenamiento utiliza un dataset fusionado de 110.077 formas, con una receta de dos etapas: una primera etapa de 200 épocas para el tronco compartido por cada configuración de `num_latents`, y una segunda etapa de 100 épocas por celda con 6 capas de decoder latente. No se menciona el uso de RLHF ni DPO, ya que se trata de un modelo generativo de reconstrucción, no de un modelo de lenguaje. Los detalles exactos de los comandos de entrenamiento están disponibles en la guía de entrenamiento del repositorio.

## Capacidades

- Compresión de formas 3D en 128 números (8 vectores de 16 dimensiones).
- Reconstrucción de campos de ocupación a partir de latentes.
- Codificación de mallas (mediante `encode_mesh`) y de nubes de puntos crudas (mediante `encode`).
- Decodificación en puntos de consulta arbitrarios, devolviendo logits de ocupación (positivos dentro de la forma).
- Generación de volúmenes densos de logits con `decode_volume` a resolución configurable.
- Extracción de características latentes para tareas posteriores (clasificación, recuperación, generación).
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Aprendizaje por refuerzo con recompensa de reconstrucción: el modelo está optimizado para que el paso forward y backward a través del decoder congelado sea rápido, permitiendo calcular recompensas basadas en la fidelidad de la reconstrucción en cada iteración de entrenamiento.
- Reconstrucción de formas 3D a partir de nubes de puntos: se puede codificar una nube de puntos parcial o ruidosa y decodificarla en una malla completa, útil en escaneo 3D o visión robótica.
- Compresión de mallas para almacenamiento o transmisión: al reducir una forma a 128 números, se puede almacenar o enviar una representación compacta y reconstruir la geometría bajo demanda.
- Generación de formas 3D con modelos de difusión: los latentes de COD-VAE sirven como espacio intermedio para entrenar modelos generativos que produzcan nuevas formas, como se propone en el artículo original.
- Extracción de características para clasificación o recuperación: los vectores latentes pueden usarse como embeddings para comparar similitud entre formas o alimentar clasificadores.
- Edición e interpolación de formas: al operar en el espacio latente, se pueden interpolar entre dos formas o modificar atributos específicos y decodificar el resultado.
- Integración en pipelines de simulación o renderizado: la decodificación rápida permite generar campos de ocupación en tiempo real para aplicaciones de gráficos o planificación de movimiento.

## Benchmarks y rendimiento

La model card reporta calidad de reconstrucción en el subconjunto ABC (piezas CAD) con 128 formas fuera del entrenamiento:

| Metrica | Valor |
|---|---|
| Volumen IoU | 0,7662 |
| Near-surface accuracy | 0,7548 |

Para referencia, la versión `-small` alcanza 0,837 de volumen IoU y 0,808 de near-surface accuracy en el mismo protocolo, lo que indica una pérdida de calidad de aproximadamente 0,07 puntos a cambio de una velocidad 4 veces mayor.

Velocidad de decodificación medida en H100 con JAX float16, batch de 1024 x 2048 consultas, incluyendo forward y backward a través del latente completo:

| Modelo | Tiempo por paso | Throughput |
|---|---|---|
| cod-vae-16x8 (full) | ~350 ms | 2,9k shapes/s |
| cod-vae-16x8-small | 43,5 ms | 23,6k shapes/s |
| **cod-vae-16x8-tiny** | **8,0 ms** | **127k shapes/s** |

Estos números se mantienen para toda la familia `-tiny` porque `num_latents` y `latent_dim` apenas afectan al coste de decodificación.

## Requisitos de hardware

- Al ser un modelo de ~6,6 millones de parámetros, los pesos en float16 ocupan aproximadamente 13 MB, por lo que caben en cualquier GPU moderna, incluso en GPUs integradas o en CPU.
- No se especifica VRAM mínima, pero se puede inferir que es inferior a 1 GB para inferencia.
- GPU recomendada: cualquier GPU con soporte CUDA o JAX; la medición de velocidad se realizó en H100, pero el modelo es lo suficientemente pequeño para ejecutarse en RTX 3060 o superiores.
- Opciones de despliegue: librería `cod-vae` con backend PyTorch o JAX. No es un LLM, por lo que no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 8 ms por paso de decodificación en H100 (forward+backward), lo que permite throughput de 127k formas por segundo en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Velocidad decode (H100) | Volumen IoU (ABC) | Licencia |
|---|---|---|---|---|
| cod-vae-8x16-tiny | ~6,6M | 8,0 ms | 0,7662 | MIT |
| cod-vae-8x16-small | ~35M | 43,5 ms | 0,837 | MIT |
| cod-vae-8x16 (full) | no disponible | ~350 ms | no disponible | MIT |

La comparativa muestra el equilibrio entre velocidad y calidad: la versión tiny sacrifica precisión para ser mucho más rápida, mientras que la versión small ofrece mejor reconstrucción a costa de 4 veces más tiempo de decodificación. La versión full es la más lenta pero presumiblemente la de mayor calidad, aunque no se reportan sus métricas de reconstrucción en la información disponible.

## Limitaciones y advertencias

- La calidad de reconstrucción es notablemente inferior a la de la versión `-small` (0,766 vs 0,837 de volumen IoU), por lo que no es adecuada para aplicaciones que requieran alta fidelidad geométrica.
- Cada modelo define su propio espacio latente; los latentes de una versión no pueden decodificarse con otra, lo que limita la interoperabilidad.
- El modelo está entrenado principalmente con formas CAD (dataset ABC) y otros datos fusionados, por lo que puede tener sesgos hacia geometrías mecánicas y rendir peor con formas orgánicas o escenas complejas.
- No es un modelo de lenguaje ni multimodal; no procesa texto, imágenes ni audio.
- No se han publicado análisis de sesgos o riesgos de alucinación, pero al ser un modelo generativo de formas, puede producir geometrías no válidas o incompletas en entradas fuera de distribución.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que los datos de entrenamiento (dataset fusionado) no tengan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimSchneider42/cod-vae-8x16-tiny
- Repositorio GitHub (librería `cod-vae`): https://github.com/TimSchneider42/cod-vae
- Paper original (Cho et al., ICCV 2025): https://arxiv.org/abs/2503.08737
- Modelo hermano `cod-vae-8x16`: https://huggingface.co/TimSchneider42/cod-vae-8x16
- Modelo hermano `cod-vae-8x16-small`: https://huggingface.co/TimSchneider42/cod-vae-8x16-small
- Guía de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
