# TimSchneider42/cod-vae-4x4-small

## Resumen

COD-VAE 4x4 small es un autoencoder variacional (VAE) para representación y reconstrucción de formas tridimensionales, desarrollado por TimSchneider42 como una variante compacta del modelo COD-VAE original (Cho et al., ICCV 2025). Comprime una malla o nube de puntos en solo 4 vectores latentes de 4 dimensiones (16 números en total) y los decodifica en un campo de ocupación, permitiendo reconstruir la forma original. Su principal ventaja es la velocidad de decodificación: la red es aproximadamente cinco veces más pequeña que la versión completa (39M parámetros frente a 188M) y el camino de decodificación se reduce de 90M a 20M parámetros, lo que lo hace especialmente adecuado para pipelines que necesitan entrenar a través del decodificador congelado, como el aprendizaje por refuerzo en entornos táctiles.

El modelo se distribuye con licencia MIT, pesa 0.1 GB y se integra mediante la librería `cod-vae`, que ofrece implementaciones en PyTorch y JAX. Está diseñado para extracción de características (feature-extraction) y su uso principal es la compresión de geometría 3D en un espacio latente muy reducido, manteniendo una calidad de reconstrucción aceptable (IoU 0.65 en el conjunto de prueba ABC). Aunque comparte la misma forma latente que el modelo `cod-vae-4x4`, define un espacio latente diferente, por lo que los latentes de uno no son intercambiables con el otro.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con codificador y decodificador basados en transformadores (COD-VAE) |
| Parametros totales | ~39 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo 3D, no textual) |
| Tipos de cuantizacion | no disponible (pesos en precisión float32, soporta float16 en JAX) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | NPZ autocontenido, cargable con PyTorch o JAX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura COD-VAE propuesta por Cho et al. (ICCV 2025): un codificador procesa la nube de puntos de entrada y produce un conjunto reducido de vectores latentes (en este caso 4 vectores de 4 dimensiones). El decodificador, basado en un transformer con poda de tokens por incertidumbre, reconstruye un campo de ocupación a partir de esos latentes. La variante small reduce las dimensiones del modelo respecto a la versión completa: embedding de 256 dimensiones con 4 cabezas de atención (frente a 512/8), 3 bloques de codificador con 3 capas cada uno (frente a 4 bloques), un decodificador de refinamiento con 6 capas y patches de 16 píxeles (193 tokens, frente a 12 capas y 8 píxeles con 769 tokens), y 16 canales en los planos de consulta (frente a 32). El decodificador latente mantiene 12 capas.

El entrenamiento se realizó en dos etapas: primero un autoencoder (200 épocas, batch de 256, learning rate 1e-4 escalado por batch efectivo) y después un VAE latente (100 épocas, batch de 512, learning rate reducido a la mitad en las épocas 60, 70, 80 y 90). El dataset combinado incluye 110,077 formas: 48,597 mallas de ShapeNet (preprocesadas con 3DShape2VecSet, 55 synsets), 50,000 mallas CAD del dataset `tactile-mnist-abc-dataset-small` y 11,480 mallas de `tactile-mnist-mnist3d`. Solo se usaron los splits de entrenamiento y las mallas se preprocesaron siguiendo la receta `sdf_gen` de los autores originales. La precisión fue float32 con matmuls TF32. La configuración fija `attention_implementation="default"` (ruta XLA), que en las secuencias cortas de decodificación es aproximadamente 1.3 veces más rápida que la selección automática de cuDNN.

## Capacidades

- Reconstrucción de formas 3D: comprime una malla o nube de puntos en 4 latentes de 4 dimensiones y los decodifica en un campo de ocupación, del que se puede extraer una malla reconstruida.
- Codificación y decodificación flexibles: acepta nubes de puntos crudas como entrada (coordenadas en el cubo [-1, 1]^3) y permite decodificar en puntos de consulta arbitrarios, así como generar volúmenes densos de logits mediante `decode_volume`.
- Extracción de características: al ser un VAE, los latentes de 16 dimensiones pueden usarse como representación compacta de la forma para tareas posteriores (clasificación, generación, etc.).
- Entrenamiento a través del decodificador: gracias a su tamaño reducido y a que soporta el paso hacia atrás, es adecuado para pipelines que necesitan optimizar el decodificador congelado, como el aprendizaje por refuerzo en entornos táctiles (medido a 11.75 env-steps/s frente a 1.53 del modelo completo).
- Compatibilidad multi-backend: los pesos se cargan tanto con PyTorch como con JAX, lo que facilita su integración en distintos entornos.
- Sin dependencias de idioma: al ser un modelo geométrico, no tiene restricciones lingüísticas.

## Casos de uso

- Compresión de mallas para almacenamiento o transmisión: al reducir una forma a 16 números, se puede almacenar un catálogo de objetos 3D de forma extremadamente compacta y reconstruirlos bajo demanda con una pérdida de calidad moderada (IoU 0.65 en ABC).
- Aprendizaje por refuerzo en robótica táctil: el modelo se diseñó específicamente para pipelines de RL donde se entrena a través del decodificador congelado; su velocidad de decodificación (23.6k shapes/s en H100) permite simular entornos táctiles a alta frecuencia.
- Generación de formas 3D: los latentes de 16 dimensiones pueden servir como espacio de representación para entrenar modelos generativos (por ejemplo, difusión o GANs) que produzcan nuevas geometrías.
- Aumento de datos en visión 3D: se pueden codificar mallas existentes, perturbarlas en el espacio latente y decodificarlas para obtener variaciones sintéticas de objetos.
- Reconstrucción de superficies a partir de nubes de puntos: útil en escaneo 3D o reconstrucción de escenas, donde se parte de puntos dispersos y se necesita obtener una malla cerrada.
- Extracción de características para clasificación o recuperación de objetos: los latentes de 16 dimensiones pueden alimentar clasificadores ligeros o sistemas de búsqueda por similitud en bases de datos de mallas.

## Benchmarks y rendimiento

Los resultados publicados se centran en calidad de reconstrucción y velocidad de decodificación, no en benchmarks de lenguaje o visión general. La siguiente tabla resume los datos disponibles:

| Metrica | cod-vae-4x4-small | cod-vae-4x4 (completo) |
|---|---|---|
| Volumen IoU (ABC test, 128 formas) | 0.6500 | 0.671 |
| Precisión cerca de la superficie (ABC test) | 0.6979 | 0.712 |
| Forward+backward a través del latente completo (batch 1024 x 2048 queries, H100, JAX float16) | 43.5 ms (23.6k shapes/s) | ~350 ms (2.9k shapes/s) |
| Velocidad en bucle de RL táctil (50k-step arms) | 11.75 env-steps/s | 1.53 env-steps/s |

El modelo small sacrifica entre 0.02 y 0.03 de IoU respecto al completo a cambio de una aceleración de aproximadamente 8 veces en decodificación. No se han publicado resultados en benchmarks estándar tipo MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero al tratarse de un modelo de ~39M parámetros, la inferencia puede ejecutarse en GPUs con menos de 4 GB de VRAM en precisión float16 (estimación orientativa, no verificada).
- GPU recomendadas: las mediciones de velocidad se realizaron en una NVIDIA H100 con JAX en float16, pero el modelo es lo suficientemente pequeño para funcionar en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: se integra mediante la librería `cod-vae` (pip install cod-vae[torch,hub] o cod-vae[jax,hub]). No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: en H100 con JAX float16, el paso forward+backward completo tarda 43.5 ms para un batch de 1024x2048 consultas, lo que equivale a 23,600 formas por segundo. En un bucle de RL táctil medido, se alcanzan 11.75 pasos de entorno por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Latente | Velocidad decode (H100) | Calidad (IoU ABC) | Licencia |
|---|---|---|---|---|---|
| cod-vae-4x4-small (este) | ~39M | 4x4 (16 números) | 43.5 ms forward+backward | 0.6500 | MIT |
| cod-vae-4x4 | 188M | 4x4 (16 números) | ~350 ms forward+backward | 0.671 | MIT |
| cod-vae-16x8 | no disponible | 16x8 (128 números) | ~350 ms (según tabla de velocidad, mismo orden que 4x4) | no disponible | MIT |
| cod-vae-16x8-small | no disponible | 16x8 (128 números) | 43.5 ms (mismo orden que 4x4-small) | no disponible | MIT |

La comparativa se limita a la familia COD-VAE publicada por el mismo autor, ya que no se dispone de datos de otros VAE 3D en la información proporcionada. La principal diferencia entre las variantes small y completa es el equilibrio entre velocidad y fidelidad de reconstrucción, manteniendo la misma forma latente dentro de cada par.

## Limitaciones y advertencias

- Los latentes generados por este modelo no son compatibles con los del modelo `cod-vae-4x4` completo, a pesar de tener la misma forma (4x4). Si se mezclan, la decodificación producirá resultados incorrectos.
- La calidad de reconstrucción es inferior a la del modelo completo: se pierde entre 0.02 y 0.03 de IoU en el conjunto ABC, lo que puede ser relevante en aplicaciones que requieran alta fidelidad geométrica.
- El modelo está entrenado con un dataset específico (ShapeNet, ABC, MNIST3D) y puede no generalizar bien a formas muy diferentes, como objetos con topología compleja o superficies no cerradas.
- No se han publicado análisis de sesgos o riesgos de alucinación, pero al ser un modelo generativo de geometría, puede producir formas irreales o con artefactos en regiones poco representadas en el entrenamiento.
- La documentación no especifica requisitos mínimos de hardware ni compatibilidad con versiones concretas de PyTorch/JAX, por lo que puede haber problemas de integración en entornos antiguos.
- El uso comercial está permitido gracias a la licencia MIT, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimSchneider42/cod-vae-4x4-small
- Modelo completo (referencia): https://huggingface.co/TimSchneider42/cod-vae-4x4
- Modelo base de la familia: https://huggingface.co/TimSchneider42/cod-vae
- Repositorio de código (GitHub): https://github.com/TimSchneider42/cod-vae
- Guía de entrenamiento (TRAINING.md): https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
- Paper original (arXiv): https://arxiv.org/abs/2503.08737
- Dataset táctil ABC (Hugging Face): https://huggingface.co/datasets/TimSchneider42/tactile-mnist-abc-dataset-small
- Dataset MNIST3D (Hugging Face): https://huggingface.co/datasets/TimSchneider42/tactile-mnist-mnist3d
