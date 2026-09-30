# TimSchneider42/cod-vae-4x32-tiny

## Resumen

COD-VAE 4 x 32 (tiny) es un autoencoder variacional para reconstruccion de formas 3D desarrollado por TimSchneider42. Comprime una forma tridimensional en un conjunto compacto de 4 vectores latentes de 32 dimensiones cada uno (128 numeros en total) y los decodifica de vuelta a un campo de ocupacion (occupancy field). Forma parte de la familia COD-VAE, una reimplementacion no oficial en PyTorch y JAX del trabajo original de Cho et al. (ICCV 2025), y esta pensado explicitamente para pipelines cuyo cuello de botella es el coste del forward mas backward de decodificacion sobre un decoder congelado, como por ejemplo el aprendizaje por refuerzo con recompensa de reconstruccion.

El modelo es una variante "tiny" orientada a velocidad: con aproximadamente 6,6 millones de parametros, resulta unas 4 veces mas rapido que su hermano `-small` y unas 33 veces mas rapido que el modelo de tamano completo. Conserva la misma forma latente que `cod-vae-4x32`, aunque cada modelo define su propio espacio latente y los vectores de uno no se pueden decodificar con otro. Resulta relevante por su perfil de rendimiento extremo (hasta 127.000 formas por segundo en decodificacion sobre H100) manteniendo una calidad de reconstruccion de compromiso (IoU volumetrico de 0,7633 en el conjunto de validacion ABC).

Se distribuye bajo licencia MIT, con pesos en un unico fichero npz autocontenido que se carga desde cualquiera de los dos backends. No es un modelo de lenguaje: no procesa ni genera texto natural, sino geometria 3D representada como mallas, nubes de puntos o campos de ocupacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional (VAE) para formas 3D con latentes 1D compactos; encoder en bloques, decoder de refinamiento y decoder latente |
| Parametros totales | ~6,6 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de reconstruccion 3D, no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en npz; la inferencia de referencia usa float16 en JAX) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | npz autocontenido (cargable desde PyTorch y JAX via `cod-vae`) |
| Dimension latente | 4 vectores x 32 dimensiones = 128 numeros |
| Embed dim / cabezas de atencion | 128 / 4 |
| Encoder | 2 bloques x 2 capas, 256 parches, mlp 2 |
| Decoder de refinamiento | 4 capas, parches de 32 px |
| Planos de consulta (query_dim) | 8 canales a 96² |
| Capas del decoder latente | 6 |
| Implementacion de atencion | `attention_implementation="default"` (ruta XLA) |

## Arquitectura y entrenamiento

COD-VAE emplea un esquema de autoencoder en dos etapas para mejorar la compresion y la eficiencia de decodificacion. El bloque encoder va comprimiendo progresivamente la forma de entrada, y el modelo original define un espacio latente formado por un conjunto compacto de vectores 1D en lugar de una rejilla volumetrica densa. Este modelo concreto sigue la receta `-small` pero reducida: embed dim 128 con 4 cabezas, encoder de 2 bloques de 2 capas sobre 256 parches (mlp 2), decoder de refinamiento de 4 capas con parches de 32 px, planos de consulta de 8 canales a 96² y 6 capas de decoder latente. El resultado son aproximadamente 6,6 millones de parametros, frente a los ~35 millones de la receta `-small`.

Los pesos se entrenaron con el repositorio `cod-vae`, una reimplementacion en PyTorch y JAX de COD-VAE. Se uso el mismo conjunto de datos fusionado de 110.077 formas y la misma receta en dos etapas que la cuadricula `-small`: una etapa 1 de tronco de 200 epocas por cada `num_latents` (compartida por su fila) y una etapa 2 nueva de 100 epocas por celda con 6 capas de decoder latente. La configuracion 16x8 se valido contra un umbral minimo de 0,75 de IoU volumetrico en ABC antes de entrenar la cuadricula. La configuracion enviada fija la implementacion de atencion en la ruta XLA, que resulta mediblemente mas rapida que el kernel fusionado de cuDNN en estas secuencias cortas.

## Capacidades

- Codificacion de mallas 3D a un espacio latente compacto de 4 x 32 dimensiones (128 numeros).
- Decodificacion de vectores latentes a un campo de ocupacion (logits con valor positivo en el interior de la forma).
- Reconstruccion de malla completa mediante `decode_mesh`, que devuelve un objeto `trimesh.Trimesh`.
- Codificacion desde nubes de puntos de superficie crudas mediante `encode(points)`, con puntos en el cubo [-1, 1]^3.
- Decodificacion en puntos de consulta arbitrarios mediante `decode(latents, queries)`.
- Generacion de una rejilla densa de logits de ocupacion mediante `decode_volume(latents, resolution=128)`.
- Soporte de lotes grandes (medido con batch de 1024 formas x 2048 consultas).
- Extraccion de caracteristicas: etiquetado como `feature-extraction` en el Hub.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Recompensa de reconstruccion en aprendizaje por refuerzo: el modelo esta disenado para pipelines donde el reloj de pared lo marca el forward mas backward de decodificacion a traves de un decoder congelado. Con 8,0 ms por paso en H100 y 127.000 formas/s, permite iterar bucles de RL sobre geometria a un ritmo inalcanzable para el modelo completo.
- Generacion 3D por difusion a partir de latentes compactos: al comprimir cada forma en 128 numeros, sirve como VAE auxiliar que produce el espacio latente sobre el que entrenar un modelo de difusion, en la linea del trabajo original de COD-VAE.
- Compresion y almacenamiento de bibliotecas de formas 3D: 110.077 formas del dataset de entrenamiento pueden almacenarse como vectores de 128 numeros en lugar de mallas completas, reduciendo drasticamente el espacio y permitiendo decodificar bajo demanda.
- Preprocesado masivo de catalogos CAD: la variante ABC (piezas CAD) es el dominio de evaluacion, por lo que encaja en pipelines que necesiten vectorizar grandes volumenes de piezas para busqueda, clustering o deduplicacion geometrica.
- Prototipado rapido e investigacion: su tamano de 6,6 millones de parametros y su doble backend (PyTorch y JAX) permiten experimentar en una sola GPU sin infraestructura especial.
- Decodificacion a resolucion configurable en herramientas de visualizacion: `decode_volume` con `resolution=128` genera rejillas densas de ocupacion utiles para inspeccion, marching cubes o render volumetrico.
- Aumentacion de datos geometricos: la codificacion a latentes y la posterior decodificacion permiten generar variaciones suaves de formas para entrenar otros modelos, siempre dentro del mismo espacio latente del propio modelo.

## Benchmarks y rendimiento

Calidad de reconstruccion en conjunto de validacion (protocolo ABC, 128 formas):

| Modelo | Volume IoU | Precision cerca de superficie |
|---|---|---|
| cod-vae-4x32-tiny (este modelo) | 0,7633 | 0,7567 |
| cod-vae-4x32 (tamano completo) | 0,852 | 0,829 |

Umbral de cualificacion de la configuracion 16x8: IoU volumetrico minimo de 0,75 en ABC.

Velocidad de decodificacion (H100, JAX float16, batch 1024 x 2048 consultas, forward + backward a traves del latente completo):

| Modelo | Paso | Throughput |
|---|---|---|
| cod-vae-16x8 (completo) | ~350 ms | 2,9k formas/s |
| cod-vae-16x8-small | 43,5 ms | 23,6k formas/s |
| cod-vae-16x8-tiny | 8,0 ms | 127k formas/s |

Nota del autor: `num_latents` y `latent_dim` apenas afectan al coste de decodificacion, por lo que las cifras medidas sobre la variante 16x8 son validas para toda la familia `-tiny`. No se han publicado resultados de benchmarks adicionales (por ejemplo MMLU, HumanEval o GSM8K) porque no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: con ~6,6 millones de parametros, el modelo en float16 ocupa del orden de 13 MB. Es despreciable frente a cualquier GPU moderna.
- La memoria real la dominan las activaciones de la decodificacion por lotes. La referencia se midio con batch de 1024 formas x 2048 consultas, lo que implica millones de puntos de consulta simultaneos; no se especifica el consumo exacto de VRAM de ese escenario.
- GPU recomendadas: H100 (configuracion de referencia para las cifras publicadas). Cualquier GPU moderna de consumo puede ejecutar el modelo; las cifras de throughput no se han publicado para otras tarjetas.
- Cabe en GPU de consumo: si, dado el tamano de parametros tan reducido; el limite practico lo marca el tamano de lote y la resolucion de consulta que se elijan.
- Opciones de despliegue: el modelo se carga mediante la libreria `cod-vae` con `pip install cod-vae[torch,hub]` (backend PyTorch) o `pip install cod-vae[jax,hub]` (backend JAX). Las herramientas habituales de LLM (vLLM, llama.cpp, Ollama, TGI) no aplican a este modelo.
- Latencia y throughput estimados: 8,0 ms por paso y 127.000 formas/s en decodificacion sobre H100 con JAX float16 (variante 16x8 de la familia tiny, valido segun el autor para toda la familia). No disponible para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension latente | Volume IoU (ABC) | Velocidad | Licencia |
|---|---|---|---|---|---|
| cod-vae-4x32-tiny (este) | ~6,6M | 4 x 32 = 128 | 0,7633 | 127k formas/s (tiny) | MIT |
| cod-vae-4x32 | no disponible | 4 x 32 = 128 | 0,852 | ~33x mas lento que tiny | MIT |
| cod-vae-16x8-small | ~35M | 16 x 8 = 128 | no disponible para esta forma latente | 23,6k formas/s | MIT |
| cod-vae-16x8 (completo) | no disponible | 16 x 8 = 128 | no disponible | 2,9k formas/s | MIT |
| cod-vae-4x8-tiny | ~6,6M | 4 x 8 = 32 | no disponible | comparable a esta familia | MIT |

Notas: el autor indica que la cuadricula `-small` llega hasta `16x16`, por lo que la forma latente `4x32` no tiene hermano `-small`; el modelo de tamano completo `cod-vae-4x32` es la referencia de calidad para esta forma latente. No se dispone de datos de comparacion con VAE 3D de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad deliberada: el IoU volumetrico cae a 0,7633 frente a 0,852 del modelo completo de la misma forma latente. Es un compromiso explicito por velocidad, no un modelo de maxima fidelidad.
- Espacio latente no portable: aunque la forma latente coincide con la de sus hermanos, cada modelo define su propio espacio latente. Los vectores de un modelo no se pueden decodificar con otro, ni siquiera dentro de la misma familia.
- Dominio de entrenamiento restringido: los datos de entrenamiento son 110.077 formas, con evaluacion sobre ABC (piezas CAD). El comportamiento fuera de ese dominio geometrico no esta caracterizado.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling, agentes ni razonamiento. Cualquier uso en ese sentido no es aplicable.
- Sin datos sobre sesgos: no se documentan analisis de sesgo geometrico ni de representatividad del dataset.
- Riesgo de artefactos de reconstruccion: como todo decoder generativo, puede producir superficies ruidosas o incompletas en formas alejadas de la distribucion de entrenamiento; no se cuantifica la tasa de fallo.
- Licencia MIT: permite uso comercial y modificacion, pero conviene conservar el aviso de copyright y tener en cuenta que el trabajo original de COD-VAE (Cho et al., ICCV 2025) puede tener sus propios terminos.
- Aviso sobre la reimplementacion: `cod-vae` es una reimplementacion no oficial de PyTorch/JAX; los pesos y el comportamiento pueden diferir de la implementacion de referencia de los autores originales.
- Datos de rendimiento limitados: las cifras de velocidad publicadas corresponden a H100 con JAX float16; no hay mediciones para otras GPU ni entornos.
- Metadatos del repositorio: sin descargas ni likes registrados, y el repositorio aparece con tamano de 0,0 GB, por lo que la distribucion y el soporte comunitario son inexistentes por el momento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TimSchneider42/cod-vae-4x32-tiny
- Paper original (Cho et al., ICCV 2025): https://arxiv.org/abs/2503.08737
- Repositorio GitHub `cod-vae`: https://github.com/TimSchneider42/cod-vae
- Codigo de la libreria: https://github.com/TimSchneider42/cod-vae/tree/main/cod_vae
- Guia de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
- Modelo hermano de misma forma latente: https://huggingface.co/TimSchneider42/cod-vae-4x32
- Modelo hermano `-small`: https://huggingface.co/TimSchneider42/cod-vae-16x8-small
- Modelo hermano tiny de otra forma latente: https://huggingface.co/TimSchneider42/cod-vae-4x8-tiny
