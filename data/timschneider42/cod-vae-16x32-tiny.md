# TimSchneider42/cod-vae-16x32-tiny

## Resumen

COD-VAE 16 x 32 (tiny) es un autoencoder variacional para geometria 3D publicado por TimSchneider42. Comprime una forma tridimensional en un latente de 16 vectores de 32 dimensiones (512 numeros en total) y lo decodifica de vuelta a un campo de ocupacion. No es un modelo de lenguaje: no procesa ni genera texto, sino mallas y nubes de puntos. Su latente coincide en forma con el de cod-vae-16x32, pero cada modelo de la familia define su propio espacio latente y los latentes no son intercambiables entre variantes.

La variante tiny esta disenada explicitamente para tuberias en las que el tiempo de reloj lo domina el paso forward + backward por un decodificador congelado, por ejemplo el aprendizaje por refuerzo con recompensa de reconstruccion. Con unos 6,6 M de parametros, el autor reporta que es aproximadamente 4 veces mas rapida que la variante -small y 33 veces mas rapida que el modelo de tamano completo, alcanzando 127.000 formas por segundo en H100 con JAX en float16.

Es relevante ahora porque la familia COD-VAE (Cho et al., ICCV 2025) propone representar formas 3D con un numero reducido de vectores latentes para entrenar modelos de difusion 3D en ese espacio, y esta variante abarata el coste del decodificador dentro del bucle de entrenamiento. El coste de esa velocidad es una perdida apreciable de fidelidad: 0,8136 de IoU volumetrico en ABC frente a 0,916 del modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional (VAE) para campos de ocupacion 3D, con codificador y decodificador basados en atencion, planos de consulta (query planes) y decodificador de refinamiento |
| Parametros totales | ~6,6 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el equivalente funcional es el latente de 16 x 32 = 512 numeros y el numero de puntos de consulta, configurable |
| Tipos de cuantizacion | no disponible; no se publican pesos cuantizados. Los benchmarks usan float16 sobre JAX y los pesos se distribuyen como npz autocontenido |
| Idiomas soportados | no aplica (modelo de geometria 3D; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | npz autocontenido, cargable tanto con el backend de PyTorch como con el de JAX; no se distribuyen safetensors ni GGUF |
| Latente | 16 vectores x 32 dimensiones (512 numeros) |
| Entrada | Malla (por ejemplo via trimesh) o nube de puntos (N, 3) en el cubo [-1, 1]^3 |
| Salida | Logits de ocupacion (positivo en el interior), malla trimesh o rejilla densa de logits con decode_volume |
| Libreria | cod-vae |
| Tamano del repositorio | 0,0 GB (redondeado) |
| Fecha de creacion en el repositorio | 2026-09-28 |

## Arquitectura y entrenamiento

El modelo sigue la receta de COD-VAE con la configuracion tiny. Frente a la receta -small, reduce la dimension de embedding de 256 a 128 (manteniendo 4 cabezas de atencion), el codificador pasa de 3 bloques x 3 capas con 512 parches y mlp 4 a 2 bloques x 2 capas con 256 parches y mlp 2, el decodificador de refinamiento baja de 6 capas con parches de 16 px a 4 capas con parches de 32 px, los planos de consulta pasan de 16 canales a 128² a 8 canales a 96², y el decodificador latente se reduce de 12 a 6 capas. El resultado es un modelo de ~6,6 M de parametros frente a los ~35 M de la variante -small. La configuracion distribuida fija attention_implementation="default" (la ruta XLA), que segun el autor es mediblemente mas rapida que el kernel fusionado de cuDNN en estas secuencias cortas.

El entrenamiento utiliza el mismo conjunto fusionado de 110.077 formas y la misma receta en dos etapas que la rejilla -small: una etapa 1 de 200 epocas que entrena un tronco por cada valor de num_latents (compartido por toda su fila) y una etapa 2 de 100 epocas por celda con 6 capas de decodificador latente. Los pesos se entrenaron con la reimplementacion en PyTorch/JAX del COD-VAE original de Cho et al. (ICCV 2025). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo que no aplica a este tipo de modelo. La innovacion destacable es el diseno decode-first: el latente es minusculo y el coste de decodificacion apenas depende de num_latents ni de latent_dim, de modo que el cuello de botella en entrenamientos con decodificador congelado se reduce de forma drastica.

## Capacidades

- Compresion de formas 3D: codifica una malla o una nube de puntos en 512 numeros (16 x 32).
- Reconstruccion de superficies: decodifica el latente a una malla trimesh o a un campo de ocupacion.
- Consulta implicita: decode(latents, queries) evalua logits de ocupacion en puntos de consulta arbitrarios del cubo [-1, 1]^3.
- Volumen denso: decode_volume(latents, resolution=128) genera una rejilla densa de logits de ocupacion.
- Extraccion de caracteristicas: la etiqueta del pipeline es feature-extraction; los latentes sirven como descriptores de 512 dimensiones para tareas de similitud o recuperacion.
- Transformacion geometrica: encode_mesh permite devolver la transformacion aplicada, reutilizable en la decodificacion.
- Compatibilidad dual: inferencia tanto en PyTorch como en JAX con los mismos pesos npz.
- No soporta tool calling, agentes, razonamiento multi-paso, vision 2D, audio ni generacion de texto: son capacidades fuera del ambito del modelo.

## Casos de uso

- RL con recompensa de reconstruccion: es el escenario para el que el autor lo construyo. El decodificador congelado se ejecuta dentro del bucle de optimizacion, con forward + backward a traves del latente completo. Los 8,0 ms por paso con batch de 1024 x 2048 consultas y las 127.000 formas/s en H100 permiten iterar politicas de muestreo o de manipulacion latente sin que el decodificador domine el tiempo de pared.
- Difusion latente 3D: los 512 numeros por forma constituyen un espacio latente compacto sobre el que entrenar un modelo de difusion generativa, siguiendo la propuesta de la familia COD-VAE, en lugar de generar directamente en voxeles o campos de ocupacion densos, lo que reduce mucho la dimensionalidad del objetivo.
- Compresion de catalogos CAD: cada pieza ocupa 512 numeros, es decir, 2 KB en float32 o 1 KB en float16, mas la transformacion. Un catalogo del orden de 110.000 formas se almacena en decenas de MB y se decodifica bajo demanda.
- Recuperacion y busqueda de formas: los latentes de 512 dimensiones actuan como embeddings para similitud coseno, agrupamiento o indexado de vecinos mas cercanos aproximados en bibliotecas de piezas CAD, con un coste de codificacion muy bajo.
- Voxelizacion para simulacion: decode_volume(resolution=128) produce una rejilla de logits utilizable para deteccion de colisiones, analisis estructural simplificado o planificacion de trayectorias en robotica.
- Limpieza y reparacion de mallas: codificar una malla ruidosa o no manifold y decodificarla produce una superficie implicita regularizada, util como paso previo al laminado en impresion 3D, teniendo en cuenta que la precision cerca de la superficie es de 0,7849 en ABC.
- Barrido de hiperparametros y ablaciones: al ser ~4x mas rapido que -small y 33x que el modelo completo, permite explorar muchas mas configuraciones de decodificador, resoluciones de consulta y estrategias de muestreo por unidad de tiempo.
- Prototipado de edicion 3D interactiva: el ciclo encode_mesh, modificacion vectorial del latente y decode_mesh es suficientemente rapido para herramientas de edicion donde el usuario manipula el latente en lugar de la malla.

## Benchmarks y rendimiento

Reconstruccion en formas no vistas (protocolo held-out del autor):

| Conjunto | Formas held-out | IoU volumetrico | Precision cerca de la superficie |
|---|---|---|---|
| ABC (piezas CAD) | 128 | 0,8136 | 0,7849 |
| Referencia: cod-vae-16x32 (tamano completo) | 128 | 0,916 | 0,875 |

Velocidad de decodificacion (H100, JAX, float16, batch 1024 x 2048 consultas, forward + backward a traves del latente completo). Las cifras estan medidas sobre la variante 16x8, pero el autor indica que num_latents y latent_dim apenas afectan al coste de decodificacion, por lo que se extrapolan a toda la familia -tiny:

| Modelo | Paso | Throughput |
|---|---|---|
| cod-vae-16x8 (completo) | ~350 ms | 2,9k formas/s |
| cod-vae-16x8-small | 43,5 ms | 23,6k formas/s |
| cod-vae-16x8-tiny | 8,0 ms | 127k formas/s |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, que no aplican a este modelo. Tampoco hay cifras publicadas de latencia para este modelo exacto con latente 16x32.

## Requisitos de hardware

- VRAM estimada: con ~6,6 M de parametros, los pesos ocupan aproximadamente 26 MB en float32 y 13 MB en float16 (calculo aritmetico a partir del numero de parametros; no es una medida publicada). El consumo real depende del tamano de batch y del numero de puntos de consulta.
- GPU recomendadas: los datos publicados se midieron en H100. Por tamano, el modelo cabe sin problema en cualquier GPU consumer, incluida una RTX 3060 o superior, y en GPUs de datacenter (A100, H100) el limite practico es el paralelismo de batch, no la memoria.
- Cabe en GPU consumer: si, con margen amplio. La carga dominante no son los pesos sino las activaciones asociadas al numero de consultas decodificadas simultaneamente.
- Despliegue: mediante la libreria cod-vae con pip install cod-vae[torch,hub] o pip install cod-vae[jax,hub]. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 8,0 ms por paso fwd + bwd y 127.000 formas/s en H100 con JAX float16 y batch 1024 x 2048 consultas (medido en 16x8-tiny, extrapolado por el autor a la familia). No se publican cifras para CPU ni para lotes pequenos.
- Nota de rendimiento: el autor recomienda attention_implementation="default" (ruta XLA), mas rapida que el kernel fusionado de cuDNN en estas secuencias cortas.

## Comparativa con modelos similares

La informacion disponible solo cubre variantes de la propia familia COD-VAE. No se aportan datos de modelos comparables de otras familias, por lo que no es posible una comparacion cuantitativa con alternativas externas.

| Modelo | Latente | Parametros | IoU vol. ABC | Precision cerca de superficie | Throughput (H100, JAX fp16) | Licencia |
|---|---|---|---|---|---|---|
| cod-vae-16x32-tiny (este) | 16 x 32 | ~6,6 M | 0,8136 | 0,7849 | 127k formas/s (medido en 16x8-tiny) | MIT |
| cod-vae-16x32 (completo) | 16 x 32 | no disponible | 0,916 | 0,875 | no disponible para este latente | MIT |
| cod-vae-16x8-small | 16 x 8 | ~35 M | no disponible | no disponible | 23,6k formas/s | MIT |
| cod-vae-16x8-tiny | 16 x 8 | no disponible | no disponible | no disponible | 127k formas/s | MIT |

Observaciones: la rejilla -small no llega al latente 16x32, de modo que este modelo no tiene hermano -small directo en su forma latente. La rejilla 16x8 se cualifico contra un suelo duro de 0,75 de IoU volumetrico en ABC antes de entrenar. Los latentes no son intercambiables entre variantes aunque compartan forma.

## Limitaciones y advertencias

- Fidelidad de reconstruccion notablemente inferior al modelo de tamano completo: 0,8136 de IoU volumetrico y 0,7849 de precision cerca de la superficie frente a 0,916 y 0,875. No es adecuado cuando se requiere alta fidelidad geometrica.
- Los latentes no son portables entre modelos de la familia: aunque dos variantes compartan la forma 16 x 32, cada una define su propio espacio latente y decodificar un latente con otro modelo produce resultados invalidos.
- Dominio de entrenamiento limitado a formas CAD del conjunto fusionado de 110.077 formas, con ABC como referencia de evaluacion. Es previsible un rendimiento degradado en escenas completas, escaneos ruidosos, geometria organica o topologias no manifold, aunque no se publican metricas fuera de dominio.
- La salida es un campo de ocupacion; obtener una malla requiere un paso de extraccion de superficie, con su coste y sus artefactos asociados.
- Dependencia de la normalizacion y de la transformacion: las entradas se esperan en [-1, 1]^3 y la transformacion devuelta por encode_mesh debe reutilizarse en la decodificacion para mantener la coherencia espacial.
- No se publican pesos cuantizados ni formatos GGUF, ONNX u otros; solo npz cargable con PyTorch o JAX.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, sin garantia. Conviene citar el trabajo original de Cho et al. (ICCV 2025) del que deriva la arquitectura.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad. La fecha de creacion registrada en el repositorio (2026-09-28) procede de los metadatos del propio repositorio.
- No debe utilizarse para tareas de lenguaje, razonamiento, codigo o dialogo: no dispone de ninguna de esas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TimSchneider42/cod-vae-16x32-tiny
- Variante de latente equivalente, tamano completo: https://huggingface.co/TimSchneider42/cod-vae-16x32
- Variante -small de referencia: https://huggingface.co/TimSchneider42/cod-vae-16x8-small
- Paper COD-VAE (Cho et al., ICCV 2025): https://arxiv.org/abs/2503.08737
- Repositorio de la implementacion en PyTorch/JAX: https://github.com/TimSchneider42/cod-vae
- Guia de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
