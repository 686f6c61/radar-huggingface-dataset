# TimSchneider42/cod-vae-4x16-tiny

## Resumen

COD-VAE 4 x 16 (tiny) es un autoencoder variacional (VAE) para representación de formas tridimensionales, desarrollado por TimSchneider42 como parte de una reimplementación no oficial del modelo COD-VAE propuesto por Cho et al. (ICCV 2025). El modelo comprime una forma 3D en un conjunto de 4 vectores latentes de 16 dimensiones (64 números en total) y los decodifica en un campo de ocupación, permitiendo reconstruir la malla original. Se trata de una variante "tiny" pensada para pipelines donde el cuello de botella es el paso de decodificación hacia delante y hacia atrás a través de un decoder congelado, como en el aprendizaje por refuerzo con recompensa de reconstrucción. Con aproximadamente 6,6 millones de parámetros, es unas 4 veces más rápido que la variante `-small` y 33 veces más rápido que el modelo completo, a costa de una calidad de reconstrucción algo inferior.

La arquitectura sigue el esquema de COD-VAE: un encoder que procesa parches de la superficie y un decoder que refina la forma mediante capas de atención. El modelo se entrenó sobre un conjunto de datos fusionado de 110 077 formas, con un esquema en dos etapas. Al ser un modelo de compresión 3D, no procesa texto ni imágenes; su salida es un campo de ocupación logístico que puede convertirse en malla. La licencia MIT permite uso comercial sin restricciones, y los pesos se distribuyen como un archivo npz autocontenido que carga tanto con PyTorch como con JAX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con encoder basado en parches y decoder de refinamiento (COD-VAE) |
| Parametros totales | ~6,6 millones |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de compresión 3D) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | npz (autocontenido, compatible con PyTorch y JAX) |

## Arquitectura y entrenamiento

El modelo sigue el diseño COD-VAE original, con un encoder que procesa la forma como un conjunto de parches de superficie y un decoder que refina el campo de ocupación. La variante tiny reduce las dimensiones de embed a 128, utiliza 2 bloques de encoder con 2 capas cada uno y 256 parches, mientras que el decoder de refinamiento tiene 4 capas con parches de 32 píxeles. Los planos de consulta (`query_dim`) se reducen a 8 canales a resolución 96² y el decoder latente tiene 6 capas. La configuración fija `attention_implementation="default"` (la ruta XLA), que resulta más rápida que el kernel fusionado de cuDNN en estas secuencias cortas.

El entrenamiento sigue la misma receta que la variante `-small`: una primera etapa de 200 épocas para el tronco del encoder (compartido entre las variantes de la misma fila) y una segunda etapa de 100 épocas con 6 capas de decoder latente. El conjunto de datos fusionado contiene 110 077 formas. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente supervisado para reconstrucción.

## Capacidades

- Compresión de una forma 3D en un vector latente de 64 números (4 vectores de 16 dimensiones).
- Decodificación del campo de ocupación logarítmico (positivo dentro de la forma, negativo fuera).
- Reconstrucción de mallas a partir de nubes de puntos o mallas de entrada.
- Generación de volúmenes de ocupación densos a resolución arbitraria (ej. 128³) mediante `decode_volume`.
- Soporte para codificación de nubes de puntos crudas (sin necesidad de malla preprocesada).
- Decodificación en puntos de consulta arbitrarios, útil para integración con campos neuronales.
- Velocidad de decodificación muy alta: 127 000 formas por segundo en H100 (batch de 1024×2048 consultas, fwd+bwd).

## Casos de uso

- **Reconstrucción de mallas 3D**: el modelo puede reconstruir una malla completa a partir de una nube de puntos o de una malla de entrada, siendo útil en aplicaciones de escaneo 3D, modelado inverso y captura de objetos.
- **Aprendizaje por refuerzo con recompensa de reconstrucción**: su velocidad de decodificación (127k formas/s en H100) lo hace ideal para pipelines de RL donde se necesita evaluar la calidad de reconstrucción de cada forma generada, como en la optimización de políticas de generación 3D.
- **Compresión de datos 3D**: al reducir cualquier forma a 64 números, puede servir para indexar, comparar y almacenar geometrías de forma compacta, por ejemplo en bases de datos de activos 3D.
- **Preentrenamiento de modelos de difusión 3D**: al igual que el COD-VAE original, este modelo puede actuar como codificador y decodificador latente para entrenar modelos de difusión que operen en el espacio latente de 64 dimensiones, reduciendo el coste computacional.
- **Generación de volúmenes de ocupación**: a partir del latente, se puede generar un volumen denso de ocupación a la resolución deseada, lo que permite renderizado o análisis de propiedades geométricas.
- **Filtrado y normalización de formas**: al reconstruir una forma a partir de un latente, se puede suavizar o completar geometrías ruidosas o incompletas, útil en preprocesado de datasets 3D.

## Benchmarks y rendimiento

La model card del autor incluye los siguientes resultados de reconstrucción sobre un conjunto de validación externo (128 formas de ABC, partes CAD):

| Modelo | Volumen IoU | Precisión cerca de superficie |
|---|---|---|
| cod-vae-4x16-small | 0,794 | 0,782 |
| **cod-vae-4x16-tiny** | **0,7268** | **0,7376** |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no es un modelo de lenguaje ni de razonamiento. Los datos de rendimiento se centran en la velocidad de decodificación:

| Modelo | Tiempo por paso | Rendimiento (formas/s) |
|---|---|---|
| cod-vae-16x8 (full) | ~350 ms | 2,9k |
| cod-vae-16x8-small | 43,5 ms | 23,6k |
| **cod-vae-16x8-tiny** | **8,0 ms** | **127k** |

Estas mediciones se realizaron en una GPU H100 con JAX en float16, con batch de 1024×2048 consultas, y el paso incluye forward y backward a través del latente completo.

## Requisitos de hardware

- El modelo tiene ~6,6 millones de parámetros, por lo que el peso ocupa aproximadamente 26 MB en float32 (o 13 MB en float16). No requiere una GPU de gama alta para inferencia; puede ejecutarse en CPU con un rendimiento razonable.
- Para las mediciones de velocidad reportadas se utilizó una H100 (80 GB VRAM). Con esa GPU se alcanzan 127 000 formas por segundo en decodificación con batch de 1024×2048 consultas.
- En GPU de consumo como una RTX 4090 (24 GB VRAM) o una RTX 3090 (24 GB VRAM), el modelo se ejecuta sin problemas y la velocidad de decodificación será menor pero todavía muy alta, probablemente en el rango de decenas de miles de formas por segundo.
- Para aplicaciones de entrenamiento de RL que requieren forward+backward, se recomienda una GPU con al menos 16 GB de VRAM para manejar el batch de consultas.
- El modelo se puede cargar con PyTorch o JAX; no hay soporte específico para vLLM o llama.cpp, ya que no es un modelo de lenguaje.
- La implementación de referencia (librería `cod-vae`) incluye integración con Hugging Face Hub mediante `from_pretrained`.

## Comparativa con modelos similares

El modelo se compara con las otras dos variantes de COD-VAE publicadas por el mismo autor:

| Modelo | Parámetros | Velocidad de decodificación (H100) | Volumen IoU (ABC) | Licencia |
|---|---|---|---|---|
| cod-vae-4x16 (full) | ~? (no especificado) | ~35 ms (en 16x8) | no disponible | MIT |
| cod-vae-4x16-small | ~35 M | 43,5 ms | 0,794 | MIT |
| **cod-vae-4x16-tiny** | **~6,6 M** | **8,0 ms** | **0,7268** | MIT |

No se han identificado otros modelos de compresión 3D con latente tan compacto (64 números) y con licencia MIT en la información disponible. La comparación directa con alternativas como 3D VAE tradicionales o autoencoders de malla no está documentada en los datos aportados.

## Limitaciones y advertencias

- **Calidad de reconstrucción inferior a la variante `small`**: la velocidad extra se logra sacrificando precisión; el volumen IoU cae de 0,794 a 0,7268 y la precisión cerca de superficie de 0,782 a 0,7376.
- **Espacio latente específico**: cada modelo define su propio espacio latente; los vectores latentes de una variante no pueden ser decodificados por otra, por lo que no hay interoperabilidad entre versiones.
- **Sin soporte de lenguaje**: no es un modelo de texto ni de razonamiento; no puede generar código, responder preguntas ni procesar instrucciones.
- **Limitaciones de reconstrucción**: el modelo fue entrenado en formas de CAD y puede no generalizar bien a otras categorías de mallas (orgánicas, escenas complejas, etc.).
- **Riesgo de sobreajuste a la distribución de entrenamiento**: como cualquier modelo de reconstrucción, su rendimiento puede degradarse con formas muy distintas a las del conjunto de datos (110 077 formas).
- **Licencia MIT**: permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre la calidad de las reconstrucciones en dominios específicos.
- **Dependencia de la librería `cod-vae`**: para cargar el modelo y ejecutar la decodificación se necesita instalar esa librería (`pip install cod-vae[torch,hub]` o `cod-vae[jax,hub]`), lo que añade dependencias adicionales.

## Enlaces

- [Modelo en Hugging Face: TimSchneider42/cod-vae-4x16-tiny](https://huggingface.co/TimSchneider42/cod-vae-4x16-tiny)
- [Modelo hermano: TimSchneider42/cod-vae-4x16](https://huggingface.co/TimSchneider42/cod-vae-4x16)
- [Modelo hermano: TimSchneider42/cod-vae-4x16-small](https://huggingface.co/TimSchneider42/cod-vae-4x16-small)
- [Repositorio GitHub: TimSchneider42/cod-vae](https://github.com/TimSchneider42/cod-vae)
- [Guía de entrenamiento (TRAINING.md)](https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md)
- [Paper original: Representing 3D Shapes with 64 Latent Vectors for 3D Diffusion Models (arXiv:2503.08737)](https://arxiv.org/abs/2503.08737)
