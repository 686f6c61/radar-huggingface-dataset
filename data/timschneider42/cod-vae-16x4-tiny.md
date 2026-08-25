# TimSchneider42/cod-vae-16x4-tiny

## Resumen

COD-VAE 16x4 tiny es un autoencoder variacional (VAE) para formas 3D desarrollado por TimSchneider42 como reimplementación no oficial del trabajo de Cho et al. (ICCV 2025). Comprime una forma 3D completa en 16 vectores latentes de 4 dimensiones (64 números en total) y los decodifica de vuelta a un campo de ocupación. Con aproximadamente 6,5 millones de parámetros, está diseñado específicamente para pipelines donde el cuello de botella es el paso forward+backward a través del decodificador congelado, como el aprendizaje por refuerzo con recompensa de reconstrucción.

El modelo comparte la misma forma latente que sus hermanos `cod-vae-16x4` y `cod-vae-16x4-small`, pero es aproximadamente 4 veces más rápido que la variante `-small` y 33 veces más rápido que el modelo completo, a costa de una calidad de reconstrucción inferior. Se distribuye bajo licencia MIT y se carga mediante la librería `cod-vae`, que soporta tanto PyTorch como JAX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | COD-VAE (VAE con latentes 1D para campos de ocupacion 3D) |
| Parametros totales | ~6,5 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de formas 3D, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en float32/float16 segun backend) |
| Idiomas soportados | no aplica (entrada: mallas, nubes de puntos o coordenadas 3D) |
| Licencia | MIT |
| Formato de pesos | npz autocontenido, cargable con PyTorch o JAX |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño COD-VAE original: un codificador procesa la forma 3D en parches y produce 16 vectores latentes de 4 dimensiones, mientras que un decodificador de latentes (6 capas) refina estos vectores y los proyecta sobre planos de consulta de 8 canales a resolucion 96². El codificador usa 2 bloques con 2 capas cada uno, 256 parches y un factor MLP de 2, con dimension de embedding de 128 y 4 cabezas de atencion. El decodificador de refinamiento emplea 4 capas con parches de 32 píxeles. La configuracion fija `attention_implementation="default"` (ruta XLA), que resulta mediblemente más rápida que el kernel fusionado de cuDNN en estas secuencias cortas.

El entrenamiento usa el mismo conjunto de datos fusionado de 110.077 formas que la familia `-small`, con un esquema de dos etapas: una etapa 1 de 200 épocas para el tronco compartido por fila de `num_latents`, y una etapa 2 de 100 épocas por celda con 6 capas en el decodificador de latentes. Los pesos se distribuyen como un archivo npz autocontenido que carga con cualquiera de los dos backends.

## Capacidades

- Compresion de formas 3D en 64 numeros (16 vectores de 4 dimensiones) que capturan la geometria global de la forma.
- Reconstruccion de campos de ocupacion: decodifica los latentes en logits de ocupacion para puntos de consulta arbitrarios, positivos en el interior de la forma.
- Codificacion directa desde mallas (via `encode_mesh`) o desde nubes de puntos crudas (via `encode`).
- Decodificacion a mallas reconstruidas (via `decode_mesh`) o a rejillas densas de logits (via `decode_volume` con resolucion configurable).
- Extraccion de caracteristicas latentes compactas para tareas posteriores como clasificacion, generacion o aprendizaje por refuerzo.
- Decodificacion extremadamente rapida: 8,0 ms por paso y 127.000 formas por segundo en H100 con JAX float16 y lotes de 1024 x 2048 consultas, incluyendo forward y backward a traves del latente completo.

## Casos de uso

- Aprendizaje por refuerzo con recompensa de reconstruccion: el modelo esta disenado para pipelines donde el coste dominante es el forward+backward a traves del decodificador congelado; su velocidad de 127k formas/s permite iterar politicas de generacion de formas con recompensas densas en tiempo real.
- Compresion de mallas 3D: codifica una malla en 64 numeros, suficiente para almacenar o transmitir representaciones compactas de geometria en aplicaciones de streaming o bases de datos de activos 3D.
- Generacion de formas con modelos de difusion: los latentes de 64 dimensiones sirven como espacio latente de bajo coste para entrenar difusion generativa sobre formas 3D, siguiendo la propuesta del articulo original de COD-VAE.
- Reconstruccion desde nubes de puntos: dado un escaneo parcial o una nube de puntos cruda, el modelo produce un campo de ocupacion completo, util en pipelines de reconstruccion 3D para robotica o captura de escenas.
- Extraccion de caracteristicas para clasificacion o recuperacion: los 64 valores latentes actuan como embedding de forma para tareas de busqueda por similitud o clasificacion en bases de datos de piezas CAD.
- Prototipado rapido en diseno generativo: al decodificar en 8 ms por forma, permite explorar variaciones de geometria interactivamente en herramientas de diseno asistido por ordenador.

## Benchmarks y rendimiento

Calidad de reconstruccion en formas no vistas (protocolo de evaluacion del autor):

| Fuente | Formas no vistas | Volume IoU | Precision cerca de superficie |
|---|---|---|---|
| ABC (piezas CAD) | 128 | 0,6854 | 0,7074 |

Para referencia, `cod-vae-16x4-small` alcanza 0,762 / 0,746 en el mismo protocolo; el aumento de velocidad de ~4x en decodificacion implica una perdida adicional de calidad. La configuracion 16x8 se cualifico contra un minimo de 0,75 de volume IoU en ABC antes de entrenar la rejilla.

Rendimiento de decodificacion (H100, JAX float16, batch 1024 x 2048 consultas, fwd+bwd a traves del latente completo):

| Modelo | Paso | Throughput |
|---|---|---|
| cod-vae-16x8 (completo) | ~350 ms | 2,9k formas/s |
| cod-vae-16x8-small | 43,5 ms | 23,6k formas/s |
| cod-vae-16x8-tiny | 8,0 ms | 127k formas/s |

Los numeros de velocidad se midieron en la variante 16x8, pero el coste de decodificacion apenas varia con `num_latents` y `latent_dim`, por lo que son representativos de toda la familia `-tiny`.

## Requisitos de hardware

- VRAM estimada: con ~6,5 millones de parametros, el modelo cabe en menos de 50 MB en float16; la VRAM necesaria depende del tamano del lote de consultas, no del modelo en si.
- GPU recomendadas: cualquier GPU con soporte CUDA o TPU; las mediciones del autor se realizaron en H100 con JAX, pero el modelo es viable en GPUs de consumo como RTX 3060 o superiores.
- Cabe en GPU de consumo: si, con margen amplio; incluso en CPU es utilizable para inferencia puntual gracias a su tamano reducido.
- Opciones de despliegue: libreria `cod-vae` con backends PyTorch o JAX (`pip install cod-vae[torch,hub]` o `cod-vae[jax,hub]`); no requiere servidores de inferencia dedicados.
- Latencia y throughput: 8,0 ms por paso de decodificacion y 127k formas/s en H100 con JAX float16; en hardware de consumo la latencia sera mayor pero sigue siendo del orden de decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Latente | Volume IoU (ABC) | Velocidad decodificacion | Licencia |
|---|---|---|---|---|---|
| cod-vae-16x4-tiny (este) | ~6,5M | 16 x 4 | 0,6854 | 8,0 ms (H100) | MIT |
| cod-vae-16x4-small | ~35M | 16 x 4 | 0,762 | 43,5 ms (H100) | MIT |
| cod-vae-16x4 (completo) | no disponible | 16 x 4 | no disponible | ~350 ms (H100) | MIT |

Los tres modelos comparten la misma forma latente (16 x 4), pero cada uno define su propio espacio latente: los latentes de uno no pueden decodificarse con otro. La eleccion entre ellos es un trade-off directo entre calidad de reconstruccion y velocidad de decodificacion.

## Limitaciones y advertencias

- Calidad de reconstruccion reducida: con un volume IoU de 0,6854 en ABC, pierde detalle geometrico frente a las variantes `-small` (0,762) y completa; no es adecuado para aplicaciones que requieran fidelidad alta de forma.
- Espacios latentes incompatibles entre variantes: aunque la forma latente es identica (16 x 4), cada modelo define su propio espacio; no se pueden intercambiar latentes entre modelos de la familia.
- Evaluacion limitada: la calidad de reconstruccion solo se reporta sobre 128 formas no vistas de ABC; no hay datos publicados sobre otros conjuntos como ShapeNet o ModelNet.
- Sin garantias de generalizacion: el entrenamiento se realizo sobre un conjunto fusionado de 110.077 formas; el rendimiento con categorias fuera de esa distribucion (organicos, formas no manufacturadas) no esta caracterizado.
- Dependencia de la libreria `cod-vae`: el modelo requiere la instalacion de la reimplementacion de TimSchneider42; no hay integracion nativa con frameworks estandar como PyTorch Hub o Transformers.
- Reimplementacion no oficial: no es el codigo de los autores originales de COD-VAE; aunque reproduce la arquitectura del articulo, puede haber diferencias sutiles respecto a la implementacion de referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TimSchneider42/cod-vae-16x4-tiny
- Repositorio de la libreria `cod-vae`: https://github.com/TimSchneider42/cod-vae
- Guia de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
- Articulo original COD-VAE (arXiv): https://arxiv.org/abs/2503.08737
- Variante completa 16x4: https://huggingface.co/TimSchneider42/cod-vae-16x4
- Variante 16x8-tiny: https://huggingface.co/TimSchneider42/cod-vae-16x8-tiny
