# TimSchneider42/cod-vae-16x8-tiny-res96

## Resumen

COD-VAE 16x8 (tiny-res96) es un autoencoder variacional para formas 3D desarrollado por TimSchneider42 como parte de una reimplementación no oficial de COD-VAE (Cho et al., ICCV 2025). Comprime una malla 3D en 16 vectores latentes de 8 dimensiones (128 números en total) y los decodifica de vuelta a un campo de ocupación. Esta variante "tiny" está diseñada específicamente para pipelines cuyo cuello de botella es el paso de decodificación (forward y backward) a través de un decoder congelado, como en escenarios de aprendizaje por refuerzo con recompensa de reconstrucción. Con aproximadamente 6,6 millones de parámetros, es unas 4 veces más rápida que la versión `-small` y unas 33 veces más rápida que el modelo completo, manteniendo un IoU de volumen de 0,7665 en el conjunto de validación ABC.

El modelo se distribuye con pesos autocontenidos en formato `.npz` y se carga tanto con PyTorch como con JAX mediante la librería `cod-vae`. Su arquitectura ligera (embed dim 128, 2 bloques de encoder con 2 capas, 4 capas de decoder de refinamiento y 6 capas de decoder latente) lo hace adecuado para aplicaciones de reconstrucción de formas donde el coste de cómputo es crítico. No es un modelo de lenguaje ni multimodal; su ámbito es exclusivamente la representación y reconstrucción de geometría 3D.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | COD-VAE (autoencoder variacional con decoder transformer sobre campos de ocupación) |
| Parámetros totales | ~6,6 millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de formas 3D, no de secuencias de texto) |
| Tipos de cuantización | no disponible (los pesos se distribuyen como `.npz` en float32) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | MIT |
| Formato de pesos | `.npz` (autocontenido, cargable con PyTorch o JAX) |

## Arquitectura y entrenamiento

COD-VAE es un autoencoder variacional diseñado para representar formas 3D como un conjunto reducido de vectores latentes (en este caso 16 × 8 = 128 números). El encoder procesa la malla de entrada y produce estos vectores; el decoder, basado en un transformer, predice el campo de ocupación en puntos del espacio a partir de los latentes. La variante "tiny" reduce drásticamente la complejidad frente a sus hermanos mayores: usa un embed dim de 128 (frente a 256), 2 bloques de encoder con 2 capas cada uno (frente a 3×3), 256 parches de consulta (frente a 512), un decoder de refinamiento de 4 capas con parches de 32 píxeles (frente a 6 capas con 16 píxeles) y 6 capas en el decoder latente (frente a 12). La configuración fija `attention_implementation="default"` (ruta XLA), que resulta más rápida que el kernel cuDNN fusionado para estas secuencias cortas.

El entrenamiento sigue la misma receta de dos etapas que el resto de la familia: una primera fase de 200 épocas sobre el "trunk" del modelo y una segunda de 100 épocas con 6 capas de decoder latente. El dataset combinado contiene 110 077 formas. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado de reconstrucción de ocupación.

## Capacidades

- Compresión de mallas 3D a una representación latente compacta de 128 números (16 vectores × 8 dimensiones).
- Reconstrucción de campos de ocupación a partir de los latentes, generando mallas de salida mediante el decoder.
- Decodificación extremadamente rápida (8,04 ms por lote de 1024 × 2048 consultas en H100 con JAX float16), pensada para usarse en bucles de entrenamiento que requieren forward y backward.
- Compatible con PyTorch y JAX mediante la librería `cod-vae` (instalable con `pip install cod-vae[torch,hub]` o `cod-vae[jax,hub]`).
- Proporciona transformaciones de alineación (`transform`) para codificar y decodificar mallas con orientación correcta.
- No dispone de capacidades de generación de texto, tool calling, agentes ni multimodalidad; es un modelo puramente geométrico.

## Casos de uso

- **Recompensa de reconstrucción en RL**: en pipelines de aprendizaje por refuerzo para diseño de formas, el modelo puede usarse como decoder congelado para calcular la similitud entre la forma generada y un objetivo. Su velocidad (127k formas/s) permite bucles de entrenamiento intensivos sin convertirse en el cuello de botella.
- **Representación latente para difusión 3D**: los 128 números latentes pueden servir como espacio de latencia para entrenar modelos de difusión que generen nuevas formas geométricas, tal como propone el paper original de COD-VAE.
- **Compresión de mallas**: para almacenar o transmitir geometría 3D en formato compacto (128 números por forma), reduciendo el coste de memoria frente a las mallas completas.
- **Reconstrucción de formas a partir de nubes de puntos o scans**: al codificar una malla en el espacio latente y decodificarla, se puede obtener una reconstrucción suavizada o completa de geometría parcialmente incompleta.
- **Aumento de datos en datasets de CAD**: generar variaciones de formas mediante interpolación en el espacio latente (aunque la calidad es inferior a modelos más grandes, la velocidad permite aumentar muchos datos).
- **Prototipado y validación de pipelines 3D**: como modelo de referencia para probar arquitecturas de VAE en 3D sin necesidad de recursos de cómputo elevados.

## Benchmarks y rendimiento

| Métrica | Valor (este modelo) | Referencia `-small` | Referencia full |
|---|---|---|---|
| Volumen IoU (ABC, 128 formas held-out) | 0,7665 | 0,8417 | 0,8733 |
| Precisión cerca de la superficie | 0,7497 | 0,8195 | 0,8544 |
| Tiempo de paso (H100, JAX fp16, batch 1024×2048) | 8,04 ms | 43,5 ms | ~350 ms |
| Throughput de decodificación | 127k formas/s | 23,6k formas/s | 2,9k formas/s |

La calidad de reconstrucción es notablemente inferior a las variantes mayores, pero el modelo se seleccionó para cumplir un umbral mínimo de IoU de 0,75 en ABC, lo que lo hace válido para tareas donde la velocidad es prioritaria sobre la fidelidad geométrica exacta.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de ~6,6 millones de parámetros, la inferencia puede ejecutarse en VRAM mínima (menos de 1 GB en FP16). El tamaño exacto no se especifica, pero es trivial para cualquier GPU moderna.
- **GPU recomendada**: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; para entrenamiento con RL y bucles de backward, una GPU como RTX 3090/4090 (24 GB) o A100 es adecuada por la velocidad de cómputo.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU consumer (GTX 1060, RTX 3060, etc.) incluso en CPU para casos pequeños.
- **Opciones de despliegue**: mediante la librería `cod-vae` (con backends PyTorch o JAX). No hay soporte oficial para vLLM, Ollama o TGI (no es un modelo de lenguaje).
- **Latencia y throughput**: 8,04 ms por paso (batch de 1024 × 2048 consultas) en H100 con JAX float16; en hardware inferior el tiempo será mayor pero sigue siendo muy rápido.

## Comparativa con modelos similares

| Modelo | Parámetros | Latent shape | IoU ABC | Velocidad (H100) | Licencia |
|---|---|---|---|---|---|
| `cod-vae-16x8` (full) | ~? (no indicado) | 16×8 | 0,8733 | ~350 ms/paso | MIT |
| `cod-vae-16x8-small` | ~35M | 16×8 | 0,8417 | 43,5 ms/paso | MIT |
| **`cod-vae-16x8-tiny-res96`** | **~6,6M** | **16×8** | **0,7665** | **8,04 ms/paso** | **MIT** |

Los tres modelos comparten el mismo formato latente (16×8) y la misma licencia, pero difieren en tamaño, calidad de reconstrucción y velocidad. La versión tiny es la opción cuando el coste de decodificación domina el pipeline. No hay otros modelos similares en la misma categoría de VAE 3D tan compactos en la información disponible.

## Limitaciones y advertencias

- **Calidad de reconstrucción reducida**: el IoU de volumen (0,7665) es notablemente inferior a los modelos `-small` (0,8417) y completo (0,8733); puede no ser adecuado para aplicaciones que requieren alta fidelidad geométrica.
- **Espacio latente no intercambiable**: cada modelo de la familia define su propio espacio latente; los vectores latentes de un modelo no pueden ser decodificados con otro, incluso con la misma forma.
- **Dataset de entrenamiento limitado**: se entrenó sobre 110.077 formas (dataset combinado). Puede tener sesgos hacia categorías de objetos de CAD y no generalizar bien a formas orgánicas o de otros dominios.
- **Sin capacidad de generación de texto o multimodalidad**: es un modelo puramente geométrico; no debe usarse para tareas de lenguaje o visión.
- **Licencia MIT**: permite uso comercial y modificación, pero el modelo se distribuye tal cual; no se proporcionan garantías sobre su rendimiento en producción.
- **Dependencia de la librería `cod-vae`**: el modelo requiere la instalación de la librería específica (con dependencias de PyTorch o JAX) y no es compatible con formatos estándar de despliegue de modelos de lenguaje.

## Enlaces

- [Hugging Face - TimSchneider42/cod-vae-16x8-tiny-res96](https://huggingface.co/TimSchneider42/cod-vae-16x8-tiny-res96)
- [Hugging Face - TimSchneider42/cod-vae-16x8](https://huggingface.co/TimSchneider42/cod-vae-16x8)
- [Hugging Face - TimSchneider42/cod-vae-16x8-small](https://huggingface.co/TimSchneider42/cod-vae-16x8-small)
- [GitHub - cod-vae (repositorio y guía de entrenamiento)](https://github.com/TimSchneider42/cod-vae)
- [Paper COD-VAE (arXiv:2503.08737)](https://arxiv.org/abs/2503.08737)
