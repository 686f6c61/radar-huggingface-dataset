# TimSchneider42/cod-vae-8x8-tiny

## Resumen

COD-VAE 8x8 tiny es un autoencoder variacional (VAE) para representación de formas tridimensionales, desarrollado por TimSchneider42 como parte de una reimplementación no oficial en PyTorch/JAX del modelo COD-VAE propuesto por Cho et al. en ICCV 2025. El modelo comprime una forma 3D en un conjunto compacto de 8 vectores latentes de 8 dimensiones (64 números en total) y los decodifica en un campo de ocupación, permitiendo reconstruir la geometría original. Su diseño está orientado a pipelines donde el cuello de botella es la decodificación hacia delante y hacia atrás a través de un decodificador congelado, como en el aprendizaje por refuerzo con recompensa de reconstrucción.

Con aproximadamente 6,6 millones de parámetros, esta variante "tiny" es significativamente más ligera que sus hermanas mayores: es unas 4 veces más rápida que la versión `-small` y 33 veces más rápida que el modelo completo, a costa de una menor calidad de reconstrucción. El modelo se distribuye bajo licencia MIT y se integra mediante la librería `cod-vae`, con pesos autocontenidos en formato npz que cargan tanto con PyTorch como con JAX. Su relevancia actual radica en ofrecer una opción de baja latencia para tareas de reconstrucción 3D en tiempo real o en entornos con recursos computacionales limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | COD-VAE (autoencoder variacional con latentes 1D compactos) |
| Parametros totales | ~6,6 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo 3D, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | npz autocontenido (carga con PyTorch o JAX) |

## Arquitectura y entrenamiento

COD-VAE 8x8 tiny sigue la arquitectura del paper original de COD-VAE, que introduce un esquema de autoencoder en dos etapas para mejorar la compresión y la eficiencia de decodificación. La primera etapa comprime progresivamente la forma 3D en un conjunto reducido de vectores latentes 1D; la segunda etapa decodifica esos latentes en un campo de ocupación. En esta variante concreta, el encoder utiliza 2 bloques con 2 capas cada uno y 256 parches, con una dimensión de embedding de 128 y 4 cabezas de atención. El decodificador de refinamiento emplea 4 capas con parches de 32 píxeles, y los planos de consulta tienen 8 canales a resolución 96². El decodificador latente consta de 6 capas.

El entrenamiento se realizó sobre un dataset combinado de 110.077 formas, siguiendo una receta de dos etapas: una primera etapa de 200 épocas para el tronco compartido por fila (según `num_latents`) y una segunda etapa de 100 épocas por celda con 6 capas de decodificador latente. La configuración publicada fija `attention_implementation="default"` (la ruta XLA), que resulta más rápida que el kernel fusionado de cuDNN en secuencias cortas. No se menciona el uso de RLHF ni DPO, al tratarse de un modelo de visión 3D.

## Capacidades

- Compresión de formas 3D en un conjunto compacto de 8 vectores latentes de 8 dimensiones (64 números).
- Decodificación de latentes en un campo de ocupación, con logits positivos dentro de la forma.
- Reconstrucción de mallas tridimensionales a partir de latentes, mediante `decode_mesh`.
- Codificación de mallas o nubes de puntos superficiales en latentes, mediante `encode_mesh` o `encode`.
- Decodificación en puntos de consulta arbitrarios, permitiendo muestreo flexible de la ocupación.
- Generación de volúmenes densos de logits a resolución arbitraria mediante `decode_volume`.
- Extracción de características latentes para tareas posteriores como difusión 3D o aprendizaje por refuerzo.
- Soporte de backend dual PyTorch y JAX, con pesos intercambiables.

## Casos de uso

- Reconstrucción de formas 3D a partir de nubes de puntos: el modelo puede codificar una nube de puntos en latentes y decodificarlos en una malla, útil en escaneo 3D o digitalización de objetos.
- Compresión de geometría para almacenamiento o transmisión: al reducir una forma a 64 números, se puede almacenar o enviar una representación compacta y reconstruirla después, adecuado para catálogos de piezas o bibliotecas de mallas.
- Aprendizaje por refuerzo con recompensa de reconstrucción: su diseño optimizado para decodificación hacia delante y hacia atrás lo hace idóneo para entrenar agentes que reciben recompensas basadas en la fidelidad de la reconstrucción, como se menciona en la model card.
- Generación de mallas para simulación o visualización: los latentes pueden alimentar modelos generativos (por ejemplo, difusión 3D) para producir nuevas formas, y el decodificador convierte los latentes en mallas utilizables en motores de render o simulación.
- Aumento de datos en datasets 3D: se pueden generar variaciones de formas codificando y decodificando con perturbaciones en el espacio latente, ampliando conjuntos de entrenamiento para otros modelos.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo pequeño y rápido, puede ejecutarse en GPUs de consumo o incluso en CPU para tareas de validación o demostración, sin necesidad de hardware de gama alta.

## Benchmarks y rendimiento

La model card reporta métricas de velocidad de decodificación medidas en una H100 con JAX en float16, con batch de 1024 x 2048 consultas, para la variante 16x8 (los autores indican que los números son representativos de toda la familia `-tiny`):

| Modelo | Tiempo por paso | Throughput |
|---|---|---|
| cod-vae-16x8 (full) | ~350 ms | 2,9k formas/s |
| cod-vae-16x8-small | 43,5 ms | 23,6k formas/s |
| cod-vae-16x8-tiny | 8,0 ms | 127k formas/s |

En cuanto a calidad de reconstrucción sobre formas held-out del dataset ABC (128 formas), el modelo alcanza un volumen IoU de 0,7273 y una precisión near-surface de 0,7351. Para referencia, la variante `-small` logra 0,792 y 0,779 respectivamente en el mismo protocolo. No se proporcionan resultados de benchmarks estándar como MMLU o HumanEval, al no ser un modelo de lenguaje.

## Requisitos de hardware

- No se especifican requisitos mínimos de VRAM en la documentación disponible.
- Las velocidades reportadas se midieron en una GPU H100 con JAX en float16, lo que indica que el modelo puede aprovechar GPUs de centro de datos.
- Dado su tamaño de ~6,6 millones de parámetros, es plausible que quepa en GPUs de consumo como una RTX 3060 o superior, aunque no hay datos oficiales al respecto.
- El modelo se distribuye como un archivo npz autocontenido y se carga mediante la librería `cod-vae`, que soporta tanto PyTorch como JAX.
- Para despliegue, se puede usar directamente con la API de `cod-vae` (por ejemplo, `CODVAE.from_pretrained`), sin necesidad de servidores de inferencia adicionales.
- La latencia de decodificación es de aproximadamente 8 ms por paso en H100, lo que permite procesar más de 100.000 formas por segundo en ese hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Velocidad de decodificación (H100) | Volumen IoU (ABC) | Licencia |
|---|---|---|---|---|
| cod-vae-8x8-tiny | ~6,6M | 8,0 ms (127k formas/s) | 0,7273 | MIT |
| cod-vae-8x8-small | ~35M | 43,5 ms (23,6k formas/s) | 0,792 | MIT |
| cod-vae-8x8 (full) | no disponible | ~350 ms (2,9k formas/s) | no disponible | MIT |

La variante tiny sacrifica calidad de reconstrucción (0,7273 frente a 0,792 del small) a cambio de una velocidad de decodificación muy superior. El modelo full es el más lento y no se reportan sus métricas de calidad en la información disponible. Todos comparten la misma forma latente (8x8), pero cada uno define su propio espacio latente, por lo que los latentes no son intercambiables entre variantes.

## Limitaciones y advertencias

- La calidad de reconstrucción es notablemente inferior a la de la variante `-small` (0,7273 frente a 0,792 de volumen IoU), por lo que no es adecuado para aplicaciones que requieran alta fidelidad geométrica.
- Los latentes generados por este modelo no pueden decodificarse con otras variantes de COD-VAE, ya que cada modelo define su propio espacio latente.
- El modelo fue entrenado en un dataset específico de 110.077 formas, por lo que su rendimiento puede degradarse en dominios muy diferentes (por ejemplo, formas orgánicas complejas o escenas completas).
- No se han publicado análisis de sesgos ni de robustez ante entradas adversarias; al ser un modelo de representación 3D, los riesgos de alucinación no aplican en el sentido de los modelos de lenguaje, pero sí puede producir reconstrucciones incorrectas en formas poco representadas.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la procedencia de los datos de entrenamiento si se utiliza en productos comerciales.
- No se proporcionan garantías de soporte ni mantenimiento; el proyecto es una reimplementación no oficial del paper de COD-VAE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimSchneider42/cod-vae-8x8-tiny
- Variante small: https://huggingface.co/TimSchneider42/cod-vae-8x8-small
- Variante full: https://huggingface.co/TimSchneider42/cod-vae-8x8
- Repositorio GitHub: https://github.com/TimSchneider42/cod-vae
- Código fuente de la librería: https://github.com/TimSchneider42/cod-vae/tree/main/cod_vae
- Paper original (arXiv): https://arxiv.org/abs/2503.08737
- Guía de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
