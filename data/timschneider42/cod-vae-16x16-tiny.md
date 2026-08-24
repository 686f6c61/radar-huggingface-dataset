# TimSchneider42/cod-vae-16x16-tiny

## Resumen

COD-VAE 16x16 tiny es un autoencoder variacional (VAE) para representación y reconstrucción de formas 3D, desarrollado por TimSchneider42 como reimplementación no oficial de COD-VAE (Cho et al., ICCV 2025). El modelo comprime una forma 3D en 16 vectores latentes de 16 dimensiones (256 números en total) y los decodifica de vuelta a un campo de ocupación. Está diseñado específicamente para pipelines donde el cuello de botella es la decodificación hacia adelante y hacia atrás a través de un decodificador congelado, como en el aprendizaje por refuerzo con recompensa de reconstrucción.

Con aproximadamente 6,6 millones de parámetros, esta variante "tiny" es unas 4 veces más rápida que la versión `-small` y 33 veces más rápida que el modelo completo, manteniendo una calidad de reconstrucción aceptable (IoU volumétrico de 0,7997 en el conjunto ABC). Su licencia MIT y su implementación en PyTorch/JAX lo hacen accesible para investigación y prototipado rápido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con codificador y decodificador transformer (COD-VAE) |
| Parametros totales | ~6,6 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo 3D, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos en formato npz de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | npz autocontenido (cargable con PyTorch o JAX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura COD-VAE: un codificador procesa una nube de puntos o malla y produce un conjunto de vectores latentes (16x16 en este caso), mientras que un decodificador transformer reconstruye el campo de ocupación a partir de esos latentes. La configuración concreta de esta variante usa una dimensión de embedding de 128 con 4 cabezas de atención, un codificador de 2 bloques x 2 capas con 256 parches, un decodificador de refinamiento de 4 capas con parches de 32 píxeles, planos de consulta de 8 canales a resolución 96² y 6 capas de decodificador latente. Se fija `attention_implementation="default"` (ruta XLA), que resulta más rápida que el kernel fusionado de cuDNN en secuencias cortas.

El entrenamiento utiliza el mismo conjunto de datos fusionado de 110.077 formas y el mismo recetario de dos etapas que la familia `-small`: una etapa 1 de 200 épocas para el tronco compartido por cada `num_latents`, y una etapa 2 de 100 épocas por celda con 6 capas de decodificador latente. Los detalles exactos de los comandos están en la guía de entrenamiento del repositorio.

## Capacidades

- Compresión de formas 3D en un conjunto compacto de vectores latentes (16x16 = 256 números).
- Reconstrucción de campos de ocupación a partir de los latentes, con decodificación a mallas mediante `decode_mesh`.
- Extracción de características latentes a partir de nubes de puntos o mallas (`encode` y `encode_mesh`).
- Decodificación en puntos de consulta arbitrarios (`decode`) y generación de volúmenes densos de logits (`decode_volume`).
- Soporte de forward y backward a través del decodificador congelado, optimizado para RL con recompensa de reconstrucción.
- Implementación dual PyTorch y JAX, con pesos autocontenidos en npz.

## Casos de uso

- Aprendizaje por refuerzo con recompensa de reconstrucción: el modelo está diseñado para pipelines donde el coste dominante es la decodificación hacia adelante y hacia atrás; su velocidad (127k formas/s en H100) permite iterar rápidamente en entrenamiento de políticas.
- Reconstrucción de mallas 3D a partir de nubes de puntos: se puede usar `encode` + `decode_mesh` para obtener una malla limpia desde datos de escaneo o sensores.
- Generación de formas 3D como paso previo a modelos de difusión: los latentes compactos sirven como espacio de representación para entrenar generadores (el paper original usa 64 vectores latentes para difusión).
- Extracción de características para clasificación o recuperación de formas: los 256 números latentes pueden usarse como embedding de forma para tareas de búsqueda o comparación.
- Prototipado de pipelines de IA generativa 3D en entornos con recursos limitados: al ser solo 6,6M de parámetros, cabe en GPUs de consumo y permite experimentación rápida.
- Validación de arquitecturas VAE 3D: al ser una reimplementación abierta, sirve como referencia para comparar variantes de codificación y decodificación.

## Benchmarks y rendimiento

El modelo card reporta calidad de reconstrucción en el conjunto ABC (piezas CAD) con 128 formas fuera del entrenamiento:

| Métrica | Valor |
|---|---|
| Volume IoU | 0,7997 |
| Near-surface accuracy | 0,7738 |

Para referencia, la variante `cod-vae-16x16-small` alcanza 0,872 / 0,830 en el mismo protocolo, lo que indica que la ganancia de velocidad (~4x) tiene un coste en calidad. La configuración 16x8 fue validada contra un umbral mínimo de 0,75 de IoU volumétrico en ABC antes de entrenar la cuadrícula.

En cuanto a velocidad de decodificación (H100, JAX float16, batch 1024 x 2048 consultas, forward+backward a través del latente completo):

| Modelo | Paso | Throughput |
|---|---|---|
| cod-vae-16x8 (completo) | ~350 ms | 2,9k formas/s |
| cod-vae-16x8-small | 43,5 ms | 23,6k formas/s |
| **cod-vae-16x8-tiny** | **8,0 ms** | **127k formas/s** |

Estos números se midieron en la variante 16x8, pero el modelo card indica que `num_latents` y `latent_dim` apenas afectan al coste de decodificación, por lo que son representativos de toda la familia `-tiny`.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~6,6M de parámetros, la inferencia en float16 requiere menos de 1 GB de VRAM; el entrenamiento o fine-tuning con batch moderado cabe en GPUs de 8-12 GB.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (RTX 3060 o superior) es suficiente para inferencia; las mediciones de velocidad se hicieron en H100, pero el modelo es viable en hardware de consumo.
- Compatibilidad con consumer GPU: sí, es adecuado para RTX 30/40 series y similares.
- Opciones de despliegue: se integra con PyTorch o JAX mediante la librería `cod-vae`; no requiere servidores de inferencia especializados como vLLM o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: en H100 con JAX float16, la decodificación completa (forward+backward) tarda ~8 ms por lote de 1024 formas, lo que da un throughput de ~127k formas/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Latente | IoU (ABC) | Velocidad decode (H100) | Licencia |
|---|---|---|---|---|---|
| cod-vae-16x16-tiny (este) | ~6,6M | 16x16 | 0,7997 | ~8 ms (medido en 16x8) | MIT |
| cod-vae-16x16-small | ~35M | 16x16 | 0,872 | ~43,5 ms (medido en 16x8) | MIT |
| cod-vae-16x16 (completo) | no disponible | 16x16 | no disponible | ~350 ms (medido en 16x8) | MIT |

La comparativa se basa en los datos del modelo card y del repositorio. La familia `-tiny` sacrifica calidad de reconstrucción a cambio de una velocidad de decodificación muy superior, lo que la hace adecuada para pipelines donde el coste computacional domina sobre la fidelidad final.

## Limitaciones y advertencias

- Calidad de reconstrucción inferior a las variantes `-small` y completa: el IoU volumétrico cae de 0,872 a 0,7997 en ABC, lo que puede ser insuficiente para aplicaciones que requieran alta fidelidad geométrica.
- Espacio latente específico del modelo: aunque la forma latente (16x16) coincide con sus hermanos, cada modelo define su propio espacio latente; los latentes de una variante no pueden decodificarse con otra.
- Datos de entrenamiento limitados a formas CAD (conjunto ABC) y un dataset fusionado de 110.077 formas; puede generalizar mal a categorías muy diferentes (orgánicas, escenas completas, etc.).
- No es un modelo generativo por sí mismo: solo comprime y reconstruye; la generación requiere un modelo adicional (p. ej., de difusión) sobre el espacio latente.
- Riesgo de alucinación geométrica: en formas muy alejadas de la distribución de entrenamiento, la reconstrucción puede producir geometrías plausibles pero incorrectas.
- Sin soporte de idiomas ni texto: es un modelo puramente geométrico, no procesa lenguaje.
- La licencia MIT permite uso comercial, pero el modelo es una reimplementación no oficial del paper de Cho et al.; conviene revisar las patentes o restricciones del paper original si se usa en productos comerciales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TimSchneider42/cod-vae-16x16-tiny
- Variante 16x8 tiny: https://huggingface.co/TimSchneider42/cod-vae-16x8-tiny
- Modelo hermano 16x16: https://huggingface.co/TimSchneider42/cod-vae-16x16
- Repositorio GitHub (código y guía de entrenamiento): https://github.com/TimSchneider42/cod-vae
- Paper original (Cho et al., ICCV 2025): https://arxiv.org/abs/2503.08737
- Documentación de arquitectura en DeepWiki: https://deepwiki.com/join16/COD-VAE/3-model-architecture
