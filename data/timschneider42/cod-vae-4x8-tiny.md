# TimSchneider42/cod-vae-4x8-tiny

## Resumen

COD-VAE 4x8 tiny es un autoencoder variacional (VAE) para representar formas 3D en un conjunto compacto de vectores latentes unidimensionales. Desarrollado por TimSchneider42 como una implementación no oficial del trabajo de Cho et al. (ICCV 2025), comprime una malla o nube de puntos en 4 vectores latentes de 8 dimensiones (32 números en total) y los decodifica en un campo de ocupación que puede convertirse de nuevo en malla. Su característica principal es que está optimizado para la velocidad de decodificación: con unos 6,6 millones de parámetros, es aproximadamente 4 veces más rápido que la variante `-small` y 33 veces más rápido que el modelo completo, lo que lo hace idóneo para pipelines donde la decodificación es el cuello de botella, como el aprendizaje por refuerzo con recompensa de reconstrucción.

El modelo se publica bajo licencia MIT, con pesos autónomos en formato npz que se cargan tanto con PyTorch como con JAX. Su arquitectura es una versión reducida de la receta `-small`: menor dimensión de embedding (128 frente a 256), menos bloques de encoder y un decoder latente de 6 capas en lugar de 12. La calidad de reconstrucción es inferior a la del `-small` (0,6671 de IoU volumétrico en ABC frente a 0,733), pero el coste de decodificación se reduce drásticamente, lo que lo convierte en una opción atractiva para experimentos donde la velocidad prima sobre la fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con latente 1D compacto (COD-VAE) |
| Parametros totales | ~6,6 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de formas 3D, no texto) |
| Tipos de cuantizacion | no disponible (pesos en npz, se pueden cargar en float16/float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | npz (autónomo, cargable con PyTorch o JAX) |

## Arquitectura y entrenamiento

COD-VAE introduce una arquitectura de autoencoder en dos etapas. En la primera, un encoder comprime progresivamente la forma 3D (representada como una malla o nube de puntos) en un conjunto de vectores latentes 1D. En la segunda, un decoder de refinamiento reconstruye el campo de ocupación a partir de esos latentes. La variante tiny reduce las dimensiones internas: embed dim de 128 con 4 cabezas de atención, encoder con 2 bloques de 2 capas y 256 parches, decoder de refinamiento con 4 capas y parches de 32 píxeles, y planos de consulta de 8 canales a resolución 96². El decoder latente tiene 6 capas.

El entrenamiento se realizó sobre un conjunto de datos combinado de 110.077 formas, con una receta de dos fases: una primera etapa de 200 épocas para el tronco compartido por cada `num_latents`, y una segunda de 100 épocas para cada celda de configuración. El modelo se entrenó con la librería `cod-vae` (implementación en PyTorch/JAX). El config fija `attention_implementation="default"` (la ruta XLA), que resulta más rápida que el kernel fusionado de cuDNN para estas secuencias cortas.

## Capacidades

- Compresión de formas 3D en un espacio latente compacto de 32 números (4 vectores de 8 dimensiones).
- Decodificación del latente a un campo de ocupación, con posibilidad de evaluar en puntos de consulta arbitrarios o generar una rejilla densa de logits.
- Reconstrucción de mallas a partir del latente (con `decode_mesh`).
- Codificación directa de nubes de puntos o mallas (`encode_mesh` y `encode`).
- Soporte para transformaciones de normalización (devolución del transform para alinear el espacio).
- Diseñado para pipelines de entrenamiento por refuerzo con recompensa de reconstrucción (fwd+bwd a través del decoder congelado).
- Disponible tanto en PyTorch como en JAX (misma carga de pesos npz).
- Rápida decodificación: 8,0 ms por paso y 127k formas/s en H100 con JAX float16 (batch 1024 x 2048 consultas).

## Casos de uso

- **Entrenamiento por refuerzo con recompensa de reconstrucción**: el modelo es óptimo para RL de reconstrucción de formas, donde el paso de decodificación (forward y backward) se ejecuta sobre un decoder congelado. Su velocidad de 127k formas/s permite explorar miles de acciones por minuto.
- **Compresión de mallas para almacenamiento**: se puede codificar una malla en 32 números y decodificarla posteriormente, aunque con menor fidelidad que la variante `-small`.
- **Generación de formas 3D con modelos de difusión**: los latentes de 4×8 pueden servir como espacio latente para entrenar modelos de difusión que generen nuevas formas.
- **Prototipado rápido de experimentos**: al ser un modelo pequeño (6,6M) y rápido, es ideal para validar ideas de investigación antes de escalar a variantes mayores.
- **Extracción de características geométricas**: el encoder puede usarse como extractor de características para clasificación o agrupamiento de formas 3D.
- **Generación de campos de ocupación a resolución arbitraria**: permite decodificar en rejillas de 128³ o en puntos de consulta específicos, útil para simulación física o renderizado.

## Benchmarks y rendimiento

Se han publicado resultados de reconstrucción en el protocolo de evaluación del autor, con formas fuera de entrenamiento (ABC, piezas CAD):

| Fuente | Formas fuera | IoU volumétrico | Precisión cerca de superficie |
|---|---|---|---|
| ABC | 128 | 0,6671 | 0,7102 |

Para referencia, el modelo `cod-vae-4x8-small` alcanza 0,733 / 0,743 en el mismo protocolo. No se dispone de comparaciones con otros VAE 3D fuera de esta familia.

En cuanto a velocidad de decodificación (H100, JAX float16, batch 1024×2048 consultas, forward+backward a través del latente completo):

| Modelo | Tiempo por paso | Throughput |
|---|---|---|
| cod-vae-16x8 (completo) | ~350 ms | 2,9k formas/s |
| cod-vae-16x8-small | 43,5 ms | 23,6k formas/s |
| **cod-vae-16x8-tiny** | **8,0 ms** | **127k formas/s** |

Estos datos se midieron en la variante 16x8, pero el autor indica que `num_latents` y `latent_dim` apenas afectan al coste de decodificación, por lo que son representativos de la familia `-tiny`.

## Requisitos de hardware

- **VRAM**: al ser un modelo de ~6,6M de parámetros, la inferencia requiere menos de 1 GB en float32, y aún menos en float16. Es ejecutable en cualquier GPU con al menos 2 GB.
- **GPU recomendadas**: cualquier GPU moderna (desde una NVIDIA GTX 1060 en adelante) puede ejecutar inferencia. Para entrenamiento o decodificación masiva, se recomienda una GPU de alta gama (A100, H100) para aprovechar el throughput de 127k formas/s.
- **Compatibilidad con GPUs de consumo**: sí, cabe en cualquier tarjeta de consumo (RTX 3060, RTX 4090, etc.).
- **Opciones de despliegue**: se puede ejecutar con la librería `cod-vae` en PyTorch o JAX. No se mencionan integraciones con vLLM, llama.cpp u otros servidores de inferencia (modelo no de texto).
- **Latencia y throughput**: en H100 con JAX float16, 8 ms por paso para decodificar 1024×2048 consultas (127k formas/s). En hardware inferior, la latencia será mayor, pero el modelo es suficientemente pequeño para ser interactivo en una sola forma.

## Comparativa con modelos similares

| Modelo | Parámetros | Latente | IoU (ABC) | Velocidad decodificación (H100) | Licencia |
|---|---|---|---|---|---|
| cod-vae-4x8-tiny | ~6,6M | 4×8 | 0,6671 | 8,0 ms (127k/s) | MIT |
| cod-vae-4x8-small | ~35M | 4×8 | 0,733 | 43,5 ms (23,6k/s) | MIT |
| cod-vae-4x8 (completo) | no disponible | 4×8 | no disponible | ~350 ms (2,9k/s) | MIT |

Los tres modelos comparten la misma forma latente (4×8) pero cada uno define su propio espacio latente; los latentes no son intercambiables entre ellos. La elección entre tiny y small depende del equilibrio entre fidelidad de reconstrucción y velocidad de decodificación.

## Limitaciones y advertencias

- **Calidad de reconstrucción inferior**: el IoU volumétrico en ABC es 0,6671, significativamente menor que el del modelo `-small` (0,733). Para aplicaciones que requieren alta fidelidad, es mejor usar la variante `-small` o la completa.
- **Espacios latentes no interoperables**: aunque la forma latente (4×8) es la misma, cada modelo define su propio espacio; no se puede decodificar un latente de otro modelo con este.
- **Dominio de entrenamiento**: el dataset se compone de formas de CAD (ABC) y otras fuentes; puede generalizar mal a formas orgánicas o con topología muy distinta.
- **Sesgos de representación**: al ser un modelo de ocupación, las reconstrucciones pueden perder detalles finos y suavizar bordes.
- **Uso comercial**: la licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la licencia de los datos de entrenamiento (ABC y otros) si se redistribuyen pesos o modelos derivados.
- **Dependencia de la librería**: para usar el modelo es necesario instalar `cod-vae` desde GitHub; no hay una versión en pip oficial.
- **No es un modelo de texto**: no puede usarse para generación de lenguaje, código o imágenes.

## Enlaces

- [Hugging Face: TimSchneider42/cod-vae-4x8-tiny](https://huggingface.co/TimSchneider42/cod-vae-4x8-tiny)
- [Hugging Face: cod-vae-4x8](https://huggingface.co/TimSchneider42/cod-vae-4x8)
- [Hugging Face: cod-vae-4x8-small](https://huggingface.co/TimSchneider42/cod-vae-4x8-small)
- [Repositorio GitHub: TimSchneider42/cod-vae](https://github.com/TimSchneider42/cod-vae)
- [Paper arXiv: Representing 3D Shapes with 64 Latent Vectors for 3D Diffusion Models](https://arxiv.org/abs/2503.08737)</think>## Resumen

COD-VAE 4x8 tiny es un autoencoder variacional para formas 3D que comprime una malla o nube de puntos en un conjunto de 4 vectores latentes de 8 dimensiones (32 números en total) y los decodifica en un campo de ocupación. Es una implementación reducida de la arquitectura COD-VAE (Cho et al., ICCV 2025), creada por TimSchneider42 como parte de una serie de modelos de la misma familia. Su propósito principal es servir de backbone en pipelines de entrenamiento por refuerzo con recompensa de reconstrucción, donde el coste dominante es la decodificación forward y backward a través de un decoder congelado.

Con aproximadamente 6,6 millones de parámetros, este modelo es unas 4 veces más rápido que la variante `-small` y unas 33 veces más rápido que el modelo completo, manteniendo la misma forma latente (4×8). La calidad de reconstrucción es inferior a la de sus hermanos mayores (IoU volumétrico de 0,6671 en ABC frente a 0,733 del `-small`), pero la velocidad de decodificación alcanza los 127.000 formas/s en una H100 con JAX float16. Se distribuye bajo licencia MIT, con pesos autónomos en formato npz cargables tanto desde PyTorch como desde JAX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con latente 1D (COD-VAE, dos etapas) |
| Parametros totales | ~6,6 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de formas 3D, no texto) |
| Tipos de cuantizacion | no disponible (pesos en float32/float16, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | npz (autocontenido, cargable con PyTorch o JAX) |

## Arquitectura y entrenamiento

COD-VAE introduce un esquema de dos etapas: un encoder comprime progresivamente la forma 3D en un conjunto de vectores latentes 1D, y un decoder de refinamiento reconstruye el campo de ocupación a partir de ellos. La variante tiny reduce las dimensiones internas respecto a la receta `-small`: embed dim 128 con 4 cabezas de atención (frente a 256/4), encoder con 2 bloques de 2 capas y 256 parches (frente a 3 bloques de 3 capas y 512 parches), decoder de refinamiento con 4 capas y parches de 32 píxeles (frente a 6 capas y 16 píxeles), y planos de consulta de 8 canales a resolución 96² (frente a 16 canales a 128²). El decoder latente tiene 6 capas en lugar de 12.

El entrenamiento se realizó sobre un dataset fusionado de 110.077 formas, con una receta de dos fases: una primera etapa de 200 épocas para el tronco compartido por cada `num_latents`, y una segunda de 100 épocas para cada configuración con 6 capas de decoder latente. La configuración fija `attention_implementation="default"` (la ruta XLA), que es más rápida que el kernel fusionado de cuDNN en estas secuencias cortas. El modelo se entrenó con la librería `cod-vae` (implementación PyTorch/JAX).

## Capacidades

- Compresión de formas 3D (mallas o nubes de puntos) en un espacio latente compacto de 32 números.
- Decodificación del latente a un campo de ocupación, evaluable en puntos de consulta arbitrarios.
- Generación de mallas reconstruidas a partir del latente (función `decode_mesh`).
- Extracción de características geométricas (el encoder puede usarse como extractor de características).
- Soporte para transformaciones de normalización (devolución del transform para alinear espacios).
- Diseñado para entrenamiento por refuerzo con recompensa de reconstrucción (decoder congelado, forward+backward eficiente).
- Disponible con backend PyTorch y JAX (mismos pesos npz).

## Casos de uso

- **Entrenamiento por refuerzo con recompensa de reconstrucción**: el modelo está optimizado para pipelines RL donde el coste dominante es la decodificación congelada. Su velocidad de 127.000 formas/s permite muestrear miles de acciones por segundo, acelerando la convergencia.
- **Compresión de formas 3D**: se puede codificar una malla en 32 números y decodificarla posteriormente, útil para almacenamiento o transmisión de geometría con pérdida controlada.
- **Generación de formas con modelos de difusión**: los latentes de 4×8 pueden servir como espacio de generación para entrenar un modelo de difusión que cree nuevas formas desde el espacio comprimido.
- **Extracción de características geométricas**: el encoder puede usarse como extractor de características para tareas de clasificación o agrupamiento de formas 3D.
- **Generación de campos de ocupación a resolución arbitraria**: permite decodificar en rejillas densas (por ejemplo, 128³) o en puntos de consulta específicos para simulación o renderizado.
- **Prototipado rápido de investigación**: su pequeño tamaño y alta velocidad lo hacen ideal para validar hipótesis de arquitectura antes de escalar a variantes mayores.

## Benchmarks y rendimiento

El autor reporta la siguiente calidad de reconstrucción sobre un conjunto de formas no vistas de ABC (piezas CAD):

| Fuente | Formas fuera | IoU volumétrico | Precisión cerca de superficie |
|---|---|---|---|
| ABC | 128 | 0,6671 | 0,7102 |

Como referencia, `cod-vae-4x8-small` alcanza 0,733 / 0,743 en el mismo protocolo. La velocidad de decodificación se midió en H100 con JAX float16, batch 1024×2048 consultas, forward+backward a través del latente completo:

| Modelo | Tiempo por paso | Throughput |
|---|---|---|
| cod-vae-16x8 (completo) | ~350 ms | 2,9k formas/s |
| cod-vae-16x8-small | 43,5 ms | 23,6k formas/s |
| **cod-vae-16x8-tiny** | **8,0 ms** | **127k formas/s** |

Los números se midieron en la variante 16x8, pero el autor indica que el coste de decodificación apenas varía con `num_latents` y `latent_dim`.

## Requisitos de hardware

- **VRAM**: el modelo ocupa ~6,6M parámetros, por lo que la inferencia requiere menos de 1 GB en float16 y menos de 2 GB en float32. Es ejecutable en cualquier GPU con al menos 2 GB de memoria.
- **GPUs recomendadas**: para un uso interactivo o de baja carga, cualquier GPU moderna (desde una NVIDIA GTX 1060 en adelante). Para explotar el throughput máximo de 127k formas/s, se recomienda una H100 o A100.
- **Cabe en GPUs de consumo**: sí, en RTX 3060, RTX 4060, RTX 4090, etc., sin problema.
- **Opciones de despliegue**: se usa directamente con la librería `cod-vae` en PyTorch o JAX. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- **Latencia y throughput**: en H100, 8,0 ms por paso para decodificar 1024×2048 consultas (127k formas/s). En hardware inferior, la latencia será proporcionalmente mayor, pero el modelo es lo suficientemente pequeño para ser interactivo en una sola forma.

## Comparativa con modelos similares

| Modelo | Parámetros | Latente | IoU ABC | Velocidad decodificación (H100) | Licencia |
|---|---|---|---|---|---|
| cod-vae-4x8-tiny | ~6,6M | 4×8 | 0,6671 | 8,0 ms / 127k formas/s | MIT |
| cod-vae-4x8-small | ~35M | 4×8 | 0,733 | 43,5 ms / 23,6k formas/s | MIT |
| cod-vae-4x8 (completo) | no disponible | 4×8 | no disponible | ~350 ms / 2,9k formas/s | MIT |

Los tres modelos comparten la misma forma latente (4×8), pero cada uno define su propio espacio latente; los latentes no son intercambiables entre ellos. La elección de la variante depende del equilibrio entre fidelidad de reconstrucción y velocidad de decodificación.

## Limitaciones y advertencias

- **Calidad de reconstrucción inferior**: el IoU volumétrico ABC es 0,6671, notablemente menor que el del `-small` (0,733). Para aplicaciones que requieran alta fidelidad, se recomienda usar la variante `-small` o la completa.
- **Espacios latentes no interoperables**: aunque la forma latente es la misma, los latentes de un modelo no pueden decodificarse con otro.
- **Dominio de entrenamiento**: el dataset se compone principalmente de piezas CAD (ABC) y otras formas; puede generalizar mal a formas orgánicas o con geometría muy distinta.
- **Sesgos geométricos**: al ser un modelo de ocupación, las reconstrucciones pueden suavizar detalles finos y perder precisión en bordes.
- **Dependencia de la librería**: se requiere instalar `cod-vae` desde GitHub; no existe una versión estable en PyPI.
- **Licencia y datos**: la licencia MIT permite uso comercial, pero la licencia de los datos de entrenamiento no está documentada; es recomendable verificar antes de redistribuir pesos o latentes derivados.
- **No es un modelo de lenguaje**: no puede usarse para generación de texto, código o razonamiento lingüístico.

## Enlaces

- [HuggingFace: TimSchneider42/cod-vae-4x8-tiny](https://huggingface.co/TimSchneider42/cod-vae-4x8-tiny)
- [HuggingFace: cod-vae-4x8](https://huggingface.co/TimSchneider42/cod-vae-4x8)
- [HuggingFace: cod-vae-4x8-small](https://huggingface.co/TimSchneider42/cod-vae-4x8-small)
- [Repositorio GitHub: TimSchneider42/cod-vae](https://github.com/TimSchneider42/cod-vae)
- [Paper arXiv: Representing 3D Shapes with 64 Latent Vectors for 3D Diffusion Models](https://arxiv.org/abs/2503.08737)
