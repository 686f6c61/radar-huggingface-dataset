# TimSchneider42/cod-vae-16x8-small

## Resumen

COD-VAE 16 x 8 (small) es un autoencoder variacional (VAE) para formas 3D, desarrollado por TimSchneider42 como una reimplementación no oficial del modelo COD-VAE propuesto por Cho et al. en el artículo "Representing 3D Shapes with 64 Latent Vectors for 3D Diffusion Models" (ICCV 2025). Este modelo comprime una malla 3D en un conjunto de 16 vectores latentes de 8 dimensiones (128 números en total) y los decodifica de vuelta a un campo de ocupación, lo que lo convierte en una herramienta clave para pipelines de generación y difusión 3D.

La variante "small" está optimizada para decodificación rápida, incluido el paso backward, pensada para pipelines que entrenan a través del decodificador congelado. Con aproximadamente 39 millones de parámetros (frente a los 188 millones del modelo completo), logra una velocidad de decodificación unas 8 veces superior a costa de una pequeña pérdida de calidad de reconstrucción (0.8417 de IoU frente a 0.873 en el conjunto de validación ABC). El modelo se distribuye bajo licencia MIT y está disponible en Hugging Face con pesos en formato npz autocontenido, cargables tanto con PyTorch como con JAX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención (embed dim 256, 4 cabezas, encoder 3 bloques x 3 capas, refinement decoder 6 capas con parches de 16 px, latent decoder 12 capas, query planes de 16 canales) |
| Parametros totales | ~39 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo geométrico, sin soporte de lenguaje) |
| Licencia | MIT |
| Formato de pesos | npz autocontenido (cargable con PyTorch o JAX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura COD-VAE original: un codificador que comprime progresivamente la forma 3D en un conjunto compacto de vectores latentes 1D, y un decodificador basado en transformer que reconstruye el campo de ocupación a partir de esos latentes. La variante small reduce el tamaño del embedding de 512 a 256, reduce el número de bloques del codificador de 4 a 3, utiliza parches de 16 píxeles en el refinement decoder (193 tokens en lugar de 769) y reduce los canales de los planos de consulta de 32 a 16. El decodificador latente mantiene 12 capas.

El entrenamiento se realizó en dos etapas sobre un dataset fusionado de 110 077 formas: 48 597 mallas de ShapeNet (55 synsets), 50 000 mallas CAD del dataset tactile-mnist-abc-dataset-small y 11 480 mallas de tactile-mnist-mnist3d. La primera etapa (autoencoder) se entrenó durante 200 épocas con batch de 256 y learning rate 1e-4, mientras que la segunda etapa (VAE latente) se entrenó durante 100 épocas con batch de 512 y decay del learning rate en las épocas 60, 70, 80 y 90. Se usó precisión float32 con matmuls TF32. El modelo incluye una configuración que fija `attention_implementation="default"` (ruta XLA), que en las secuencias cortas de decodificación es aproximadamente 1,3 veces más rápida que la selección automática de kernels cuDNN.

## Capacidades

- Compresión de mallas 3D en 16 vectores latentes de 8 dimensiones (128 números), listos para usar en modelos de difusión latente.
- Reconstrucción de campos de ocupación a partir de latentes, con decodificación en puntos de consulta arbitrarios.
- Extracción de mallas reconstruidas mediante `decode_mesh`, que devuelve un objeto `trimesh.Trimesh`.
- Cálculo de latentes a partir de nubes de puntos de superficie sin necesidad de malla.
- Generación de volúmenes densos de logits de ocupación con `decode_volume` (resolución configurable).
- Soporte para entrenamiento a través del decodificador congelado (paso backward optimizado), útil en pipelines de aprendizaje por refuerzo u otros métodos que requieren gradientes.
- Compatible con PyTorch y JAX mediante la librería `cod-vae`.

## Casos de uso

- Reconstrucción de mallas 3D a partir de nubes de puntos o escaneos parciales: el modelo codifica la nube de puntos en un latente compacto y lo decodifica en un campo de ocupación, del que se extrae una malla mediante marching cubes. Su velocidad de decodificación lo hace adecuado para aplicaciones interactivas.
- Generación de formas 3D con modelos de difusión latente: los latentes de 128 números sirven como espacio latente compacto para entrenar un difusor 3D, reduciendo la dimensionalidad frente a trabajar directamente con voxeles o mallas.
- Aprendizaje por refuerzo táctil (tactile RL): el modelo se ha medido en un entorno de RL con 50 000 pasos, alcanzando 11,75 pasos de entorno por segundo frente a 1,53 del modelo completo, lo que lo hace viable para entrenamiento en bucle cerrado con retroalimentación háptica.
- Compresión de geometría para almacenamiento o transmisión: al representar una forma con solo 128 números, se puede almacenar o enviar una representación compacta y reconstruirla localmente con pérdida controlada.
- Aumento de datos para datasets 3D: el modelo puede generar variaciones de formas existentes codificando y decodificando con interpolación en el espacio latente, útil para entrenar otros modelos de visión.
- Extracción de características para clasificación o recuperación de formas: los latentes de 8 dimensiones por vector pueden servir como embeddings geométricos para tareas de búsqueda o comparación de mallas.

## Benchmarks y rendimiento

La información disponible incluye métricas de calidad de reconstrucción y velocidad de decodificación, medidas por el autor del modelo.

| Metrica | Valor |
|---|---|
| IoU en ABC (128 formas de validación) | 0,8417 |
| Precisión cerca de la superficie (ABC) | 0,8041 |
| Velocidad forward+backward (H100, JAX float16, batch 1024 x 2048 queries) | 43,5 ms (23,6k formas/s) |
| Velocidad en bucle de RL táctil (50k pasos) | 11,75 pasos de entorno/s |

Para referencia, el modelo completo `cod-vae-16x8` alcanza un IoU de 0,873 y una precisión de 0,835 en ABC, con una velocidad de decodificación de ~350 ms (2,9k formas/s) en la misma configuración. El modelo small sacrifica entre 0,02 y 0,03 de IoU a cambio de una aceleración de aproximadamente 8 veces.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~39M de parámetros, la inferencia en precisión float16 requiere aproximadamente 80 MB de VRAM solo para los pesos, aunque la memoria total dependerá del tamaño del lote y de la resolución de las consultas.
- GPU recomendadas: el benchmark de velocidad se realizó en una NVIDIA H100 con JAX float16, pero el modelo es lo suficientemente pequeño para ejecutarse en GPUs consumer como RTX 3090 o RTX 4090 sin problemas de memoria.
- Compatibilidad con consumer GPU: sí, cabe holgadamente en cualquier GPU con al menos 8 GB de VRAM, incluso en modo CPU para pruebas pequeñas.
- Opciones de despliegue: la librería `cod-vae` permite cargar el modelo con `CODVAE.from_pretrained(...)` tanto en PyTorch como en JAX. No es aplicable vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: en H100, el paso forward+backward completo tarda 43,5 ms para un lote de 1024 formas con 2048 consultas cada una, lo que equivale a 23,6k formas por segundo. En un bucle de RL táctil se alcanzan 11,75 pasos de entorno por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Latente | IoU ABC | Velocidad decode (H100) | Licencia |
|---|---|---|---|---|---|
| cod-vae-16x8-small (este) | ~39M | 16 x 8 | 0,8417 | 43,5 ms (23,6k formas/s) | MIT |
| cod-vae-16x8 | 188M | 16 x 8 | 0,873 | ~350 ms (2,9k formas/s) | MIT |
| Variante small anterior (en git history) | ~40M (aprox.) | 16 x 8 | 0,8489 | ~4x más lento que este modelo | MIT |

No se dispone de datos comparativos con otros VAE 3D como 3DShape2VecSet o los modelos de la literatura de difusión 3D, ya que no se han publicado en la información disponible.

## Limitaciones y advertencias

- La calidad de reconstrucción es inferior a la del modelo completo `cod-vae-16x8` en aproximadamente 0,02-0,03 de IoU, lo que puede ser relevante para aplicaciones que requieran alta fidelidad geométrica.
- Los latentes generados por este modelo no son compatibles con los del modelo completo `cod-vae-16x8`, a pesar de tener la misma forma (16 x 8). Cada modelo define un espacio latente distinto, por lo que no se pueden intercambiar.
- El modelo está entrenado principalmente con mallas de ShapeNet y CAD, por lo que puede generalizar peor a formas orgánicas o muy detalladas fuera de ese dominio.
- No se han publicado evaluaciones de sesgos o robustez frente a entradas adversarias; al ser un modelo geométrico, no presenta sesgos lingüísticos, pero sí puede tener dependencias del preprocesado de mallas (normalización, orientación, etc.).
- El riesgo de alucinación no es aplicable en el sentido de modelos de lenguaje, pero la reconstrucción puede producir geometrías plausibles pero incorrectas para formas poco representadas en el entrenamiento.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar la licencia de los datasets de entrenamiento (ShapeNet, ABC, etc.) si se utiliza el modelo en productos comerciales.
- La documentación indica que la variante small anterior (disponible en el historial de git del repositorio) tenía mejor IoU (0,8489) pero era ~4 veces más lenta; si la velocidad de decodificación no es crítica, esa versión puede ser preferible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimSchneider42/cod-vae-16x8-small
- Modelo completo cod-vae-16x8: https://huggingface.co/TimSchneider42/cod-vae-16x8
- Repositorio GitHub de cod-vae: https://github.com/TimSchneider42/cod-vae
- Guía de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
- Paper original (arXiv): https://arxiv.org/abs/2503.08737
