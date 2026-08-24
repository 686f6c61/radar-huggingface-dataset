# TimSchneider42/cod-vae-16x8-tiny-aggr

## Resumen

COD-VAE 16x8 tiny-aggr es un autoencoder variacional (VAE) desarrollado por TimSchneider42 para la compresión de formas tridimensionales. Convierte una malla 3D en un conjunto compacto de 16 vectores latentes de 8 dimensiones (128 números en total) y los decodifica de vuelta a un campo de ocupación, permitiendo reconstruir la geometría original. Es una variante "tiny" de la familia COD-VAE, diseñada específicamente para pipelines donde el cuello de botella es la decodificación con forward y backward a través de un decoder congelado, como en los sistemas de aprendizaje por refuerzo basados en recompensas de reconstrucción.

El modelo se basa en la arquitectura COD-VAE propuesta por Cho et al. en ICCV 2025 (arXiv:2503.08737), reimplementada en PyTorch/JAX por el autor. Con aproximadamente 6,6 millones de parámetros, es unas 4 veces más rápido que la variante `-small` y 33 veces más rápido que el modelo completo, manteniendo una calidad de reconstrucción aceptable (volumen IoU de 0,7687 en el conjunto ABC). Es relevante para investigadores y desarrolladores que necesitan una compresión 3D eficiente para modelos de difusión, extracción de características o reconstrucción rápida en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE para campos de ocupación 3D (COD-VAE) |
| Parametros totales | ~6,6 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de formas 3D) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de geometría, no de texto) |
| Licencia | MIT |
| Formato de pesos | npz (self-contained) |

## Arquitectura y entrenamiento

El modelo sigue el esquema COD-VAE de dos etapas. La primera etapa comprime la forma en un conjunto de vectores latentes mediante un encoder basado en bloques de atención; en este modelo el encoder usa 2 bloques con 2 capas cada uno, 256 parches y una expansión MLP de factor 2. La segunda etapa decodifica los latentes a un campo de ocupación a través de un decoder de refinamiento de 4 capas con parches de 32 píxeles y un decoder latente de 6 capas. Las dimensiones internas se reducen respecto a la variante `-small`: dimensión de embedding de 128 (frente a 256) y 8 canales en los planos de consulta (`query_dim=8`).

El entrenamiento se realizó con el mismo conjunto de datos fusionado de 110.077 formas que la familia `-small`, con una receta de dos etapas: 200 épocas para la etapa 1 (tronco del encoder) y 100 épocas para la etapa 2 (decoder latente con 6 capas). La configuración fija `attention_implementation="default"` (ruta XLA), que es más rápida que el kernel fusionado de cuDNN para estas secuencias cortas. Los pesos se cargan tanto con PyTorch como con JAX.

## Capacidades

- Reconstrucción de formas 3D: convierte mallas en campos de ocupación y las reconstruye con una precisión razonable.
- Compresión de latentes: reduce una forma a 128 números, habilitando representaciones compactas para almacenamiento o transmisión.
- Extracción de características: puede utilizarse como extractor de características geométricas para otras tareas de visión 3D.
- Decodificación rápida: pensado para pipelines donde la inferencia y el gradiente a través del decoder son críticos (por ejemplo, RL con recompensas de reconstrucción).
- Compatible con PyTorch y JAX: el mismo archivo de pesos se carga en ambos backends.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Aprendizaje por refuerzo con recompensas de reconstrucción: el modelo permite calcular gradientes a través del decoder congelado a alta velocidad, facilitando el entrenamiento de políticas que manipulan formas 3D.
- Compresión de mallas para almacenamiento: se pueden codificar miles de formas en un espacio latente de 128 dimensiones, reduciendo el coste de guardar y transmitir geometría.
- Generación de formas con modelos de difusión: al servir como encoder, convierte las mallas en latentes compactos que pueden alimentar un modelo de difusión 3D, como se propone en el paper original.
- Reconstrucción de CAD en tiempo real: con una velocidad de decodificación de 96k formas/s en H100, es adecuado para aplicaciones interactivas donde se necesita reconstruir rápidamente.
- Extracción de características para clasificación o búsqueda: los vectores latentes pueden usarse como embeddings para comparar formas o entrenar clasificadores.
- Prototipado de pipelines de IA 3D: al ser un modelo pequeño (~6,6M parámetros), sirve para validar arquitecturas y flujos de trabajo antes de escalar a versiones más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo ofrece datos de reconstrucción sobre el conjunto ABC (piezas CAD) y mediciones de velocidad de decodificación en H100, que se resumen a continuación:

| Modelo | Volumen IoU (ABC) | Near-surface accuracy | Velocidad de decodificación (fwd+bwd) | Throughput |
|---|---|---|---|---|
| cod-vae-16x8 (full) | 0,8733 | 0,8544 | ~350 ms | 2,9k formas/s |
| cod-vae-16x8-small | 0,8417 | 0,8195 | 43,5 ms | 23,6k formas/s |
| **cod-vae-16x8-tiny-aggr** | **0,7687** | **0,7518** | **10,63 ms** | **96k formas/s** |

Los valores de velocidad se obtuvieron en una GPU H100 con JAX en float16 y batch de 1024×2048 consultas (forward + backward a través de todo el latente).

## Requisitos de hardware

- Inferencia: con solo ~6,6 millones de parámetros, el modelo cabe en cualquier GPU con al menos 1-2 GB de VRAM, incluso en tarjetas consumer como GTX 1050 o superiores.
- Entrenamiento fino: para ajustar el modelo se recomienda al menos 4 GB de VRAM, aunque no se han publicado requisitos específicos.
- Despliegue: se puede ejecutar tanto en PyTorch como en JAX; no hay integraciones nativas con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Para inferencia en producción se puede usar directamente con la librería `cod-vae`.
- Latencia: la decodificación de una forma individual es del orden de milisegundos en GPU moderna; en CPU sería más lenta pero viable para usos no interactivos.
- Throughput: en H100 se alcanzan 96k formas/s por paso, lo que lo hace adecuado para aplicaciones de tiempo real o entrenamiento de RL.

## Comparativa con modelos similares

La comparación se limita a la familia COD-VAE del mismo autor, ya que no se dispone de información sobre alternativas de otras fuentes.

| Modelo | Parámetros | Latente | Velocidad de decodificación | Volumen IoU (ABC) | Licencia |
|---|---|---|---|---|---|
| cod-vae-16x8 (full) | ~35M | 16×8 | 350 ms | 0,8733 | MIT |
| cod-vae-16x8-small | ~35M | 16×8 | 43,5 ms | 0,8417 | MIT |
| **cod-vae-16x8-tiny-aggr** | **~6,6M** | **16×8** | **10,63 ms** | **0,7687** | MIT |

El modelo tiny sacrifica calidad de reconstrucción a cambio de una velocidad de decodificación mucho mayor, lo que lo hace ideal para pipelines que ejecutan miles de pasos de RL. Los tres modelos tienen el mismo formato de latentes (16×8), pero no son intercambiables entre sí: cada uno define su propio espacio latente.

## Limitaciones y advertencias

- Espacio latente no intercambiable: los latentes generados por este modelo no pueden decodificarse con otras variantes de COD-VAE (ni siquiera con las de la misma familia). Hay que usar el mismo modelo para codificar y decodificar.
- Calidad de reconstrucción inferior: con un volumen IoU de 0,7687 en ABC, es notablemente menos preciso que el modelo completo (0,8733) y que el `-small` (0,8417). No apto para aplicaciones que requieran alta fidelidad geométrica.
- Orientado a investigación: es un modelo de propósito específico para reconstrucción y compresión 3D; no soporta tareas de lenguaje natural ni visión general.
- Sin datos de sesgos: al ser un modelo geométrico, no se han documentado sesgos sociales; sin embargo, el entrenamiento se realizó con datos de CAD (ABC), por lo que puede tener un rendimiento limitado en formas orgánicas o escaneos del mundo real.
- Restricciones de uso: licencia MIT permite uso comercial y modificación, pero el modelo no incluye garantías de precisión ni soporte técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimSchneider42/cod-vae-16x8-tiny-aggr
- Repositorio del modelo original (full): https://huggingface.co/TimSchneider42/cod-vae-16x8
- Variante `-small`: https://huggingface.co/TimSchneider42/cod-vae-16x8-small
- Paper original COD-VAE: https://arxiv.org/abs/2503.08737
- Repositorio de código `cod-vae`: https://github.com/TimSchneider42/cod-vae
