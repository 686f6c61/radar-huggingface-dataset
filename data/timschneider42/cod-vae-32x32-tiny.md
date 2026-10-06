# TimSchneider42/cod-vae-32x32-tiny

## Resumen

cod-vae-32x32-tiny es un autoencoder variacional (VAE) para formas 3D desarrollado por TimSchneider42. Comprime una forma 3D en un latente de 32 vectores de 32 dimensiones (1024 numeros) y lo decodifica de vuelta a un campo de ocupacion. No es un modelo de lenguaje: trabaja con geometria, no con texto, y su tarea es reconstruccion y extraccion de caracteristicas de mallas y nubes de puntos.

El modelo es una implementacion reducida de COD-VAE (Cho et al., ICCV 2025), reimplementado en PyTorch y JAX por el autor bajo el paquete `cod-vae`. Con unos 6,6 millones de parametros, esta disenado explicitamente para pipelines en los que el coste dominante es el forward+backward a traves de un decodificador congelado, como el RL con recompensa de reconstruccion. Frente a su hermano `-small` es unas 4 veces mas rapido, y frente al modelo de tamano completo, unas 33 veces mas rapido.

Su relevancia practica esta en el equilibrio entre coste y calidad: mantiene la misma forma de latente que `cod-vae-32x32` (32 x 32) y alcanza 0,8321 de IoU volumetrico en formas CAD reservadas de ABC, por debajo del 0,925 del modelo completo pero a una fraccion del coste computacional. La ficha de HuggingFace esta publicada con fecha del 5 de octubre de 2026 y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | COD-VAE: autoencoder variacional con encoder tipo transformer, decodificador de refinamiento y decodificador latente; atencion con `attention_implementation="default"` (ruta XLA) |
| Parametros totales | ~6,6 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no procesa secuencias de texto; el latente es fijo de 32 x 32 = 1024 numeros |
| Tipos de cuantizacion | no disponible: la ficha no documenta cuantizaciones; los pesos se distribuyen como npz autocontenido y la evaluacion publicada usa float16 en JAX |
| Idiomas soportados | no aplica: no es un modelo linguistico |
| Licencia | MIT |
| Formato de pesos | npz autocontenido, cargable con backend PyTorch o JAX a traves de la libreria `cod-vae` |
| Dimension del latente | 32 vectores x 32 dimensiones (1024 numeros) |
| Embed dim / cabezas | 128 / 4 |
| Encoder | 2 bloques x 2 capas, 256 patches, mlp 2 |
| Decodificador de refinamiento | 4 capas, patches de 32 px |
| Query planes (`query_dim`) | 8 canales a 96² |
| Capas del decodificador latente | 6 |
| Pipeline declarado | feature-extraction |

## Arquitectura y entrenamiento

La arquitectura sigue la receta COD-VAE: un encoder que consume la superficie de la forma (malla o nube de puntos en [-1, 1]³) y produce el latente, un decodificador de refinamiento y un decodificador latente que evalua la ocupacion en puntos de consulta arbitrarios. Respecto a la receta `-small`, esta variante reduce embed dim de 256 a 128, el encoder de 3 bloques x 3 capas con 512 patches a 2 bloques x 2 capas con 256 patches, el decodificador de refinamiento de 6 capas con patches de 16 px a 4 capas con patches de 32 px, los query planes de 16 canales a 128² a 8 canales a 96² y las capas del decodificador latente de 12 a 6. La configuracion distribuida fija la ruta de atencion `default` (XLA), que segun el autor es mediblemente mas rapida que el kernel fusionado de cuDNN en estas secuencias cortas.

El entrenamiento usa el mismo dataset fusionado de 110.077 formas y la misma receta en dos etapas que la familia `-small`: una etapa 1 de 200 epocas por `num_latents` (tronco compartido por fila) y una etapa 2 de 100 epocas por celda con 6 capas de decodificador latente. Los comandos exactos estan en la guia de entrenamiento del repositorio. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con un modelo no linguistico. Tampoco se detalla la composicion exacta del dataset fusionado ni el numero de tokens o ejemplos por epoca mas alla del recuento de formas.

## Capacidades

- Codificacion de mallas 3D a un latente compacto de 32 x 32 mediante `encode_mesh`, con transformacion asociada para poder decodificar despues.
- Codificacion de nubes de puntos de superficie crudas en [-1, 1]³ mediante `encode`.
- Decodificacion de formas: `decode_mesh` devuelve un objeto `trimesh.Trimesh` a partir del latente y la transformacion.
- Evaluacion de ocupacion en puntos de consulta arbitrarios: `decode` devuelve logits de ocupacion, positivos en el interior de la forma.
- Generacion de rejillas densas de ocupacion: `decode_volume` con resolucion configurable (por ejemplo 128).
- Extraccion de caracteristicas: el latente sirve como embedding fijo de 1024 dimensiones para tareas posteriores (retrieval, clasificacion, condicionamiento).
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues, de vision 2D, de audio ni modo de razonamiento explicito.

## Casos de uso

- Recompensa de reconstruccion en RL para generacion 3D: el caso de uso declarado por el autor. El decodificador congelado se recorre en forward y backward en cada paso; con 8,0 ms por paso y 127k formas/s en H100 (JAX, float16, batch 1024 x 2048 consultas) el cuello de botella del bucle de policy gradient se reduce al resto del pipeline.
- Entrenamiento de modelos de difusion latente 3D: el latente de 1024 numeros permite entrenar difusion en espacio latente en vez de sobre voxeles o campos SDF densos, con un coste de memoria y computo mucho menor.
- Compresion y almacenamiento de formas CAD: una pieza queda resumida en 32 x 32 valores, mas barato de almacenar y transmitir que una malla completa o una rejilla de ocupacion de alta resolucion.
- Recuperacion de formas por similitud: usar el latente como embedding para busqueda de piezas parecidas en catalogos CAD o repositorios de mallas.
- Preprocesado en pipelines de ingenieria: el encoder produce una representacion fija reutilizable en clasificacion, deteccion de anomalias geometricas o agrupamiento de familias de piezas.
- Prototipado y filtrado rapido en hardware modesto: al tener 6,6 M de parametros, permite experimentar con reconstruccion y latentes en una sola GPU de consumo o incluso en CPU con volumenes y lotes pequenos.
- Vistas previas interactivas y decodificacion a resolucion variable: `decode_volume(resolution=128)` genera una rejilla de logits para visualizar o validar una forma sin reconstruir una malla completa.
- Interpolacion y exploracion en espacio latente: al ser un VAE con latente fijo, permite mezclar y recorrer latentes para explorar variaciones de forma, siempre dentro del dominio aprendido.
- Datos sinteticos para aumentacion: decodificar latentes perturbados para generar variantes geometricas de una pieza base en flujos de aumento de datos.

## Benchmarks y rendimiento

Calidad de reconstruccion en formas reservadas:

| Fuente | Formas reservadas | Volume IoU | Precision cerca de superficie |
|---|---|---|---|
| ABC (piezas CAD) | 128 | 0,8321 | 0,7991 |
| Referencia: cod-vae-32x32 (tamano completo) | 128, mismo protocolo | 0,925 | 0,886 |
| Suelo de calidad de la familia 16x8 | no disponible | 0,75 | no disponible |

Velocidad de decodificacion (H100, JAX float16, batch 1024 x 2048 consultas, forward+backward a traves del latente completo). El autor indica que `num_latents` y `latent_dim` apenas afectan al coste de decodificacion, por lo que las cifras medidas en la variante 16x8 se mantienen para toda la familia `-tiny`:

| Modelo | Paso | Throughput |
|---|---|---|
| cod-vae-16x8 (completo) | ~350 ms | 2,9k formas/s |
| cod-vae-16x8-small | 43,5 ms | 23,6k formas/s |
| cod-vae-16x8-tiny | 8,0 ms | 127k formas/s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje en la informacion disponible, y no serian aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada: estimacion propia a partir de los 6,6 M de parametros, aproximadamente 26 MB en float32 y 13 MB en float16 para los pesos; el consumo real lo domina el numero de puntos de consulta y el tamano de lote, no los parametros. La ficha no publica cifras medidas de VRAM.
- El coste computacional escala con el lote de consultas (las cifras publicadas usan 1024 x 2048 consultas), no con el numero de parametros.
- Cabe en cualquier GPU de consumo: RTX 3060, 4070, 4080 o 4090 son suficientes con margen amplio para lotes grandes; tambien es viable en CPU con lotes pequenos y resoluciones moderadas.
- GPU recomendadas para el regimen de maximo rendimiento publicado: H100 con backend JAX y float16, que es donde se miden los 8,0 ms por paso y 127k formas/s.
- Opciones de despliegue: la libreria `cod-vae` con `pip install cod-vae[torch,hub]` o `pip install cod-vae[jax,hub]`; carga directa con `CODVAE.from_pretrained`. No aplica a vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: 8,0 ms por paso y 127k formas/s en H100 (JAX, float16, batch 1024 x 2048 consultas, forward+backward). No se publican cifras equivalentes para el backend PyTorch, aunque los pesos y la configuracion son compatibles con ambos.
- Detalle de rendimiento: la configuracion distribuida fija `attention_implementation="default"` (ruta XLA), mas rapida que el kernel fusionado de cuDNN en secuencias cortas; las cifras de JAX asumen el layout de planos channel-last de `cod-vae` >= 56b2c82.

## Comparativa con modelos similares

| Modelo | Parametros | Latente | Volume IoU (ABC) | Licencia | Notas |
|---|---|---|---|---|---|
| cod-vae-32x32-tiny (este) | ~6,6 M | 32 x 32 | 0,8321 | MIT | 8,0 ms por paso, 127k formas/s en H100 (medido en la variante 16x8) |
| cod-vae-32x32 (completo) | no disponible | 32 x 32 | 0,925 | MIT | Precision cerca de superficie 0,886; ~33x mas lento que `-tiny` |
| cod-vae-16x8-small | ~35 M | 16 x 8 | no disponible | MIT | 43,5 ms por paso, 23,6k formas/s; calidad cualificada contra un suelo de 0,75 de IoU en ABC |
| cod-vae-16x8-tiny | no disponible (misma familia `-tiny`) | 16 x 8 | no disponible | MIT | 8,0 ms por paso, 127k formas/s en H100 |

Nota de comparacion: el autor senala que la rejilla `-small` llega hasta 16x16, por lo que esta forma de latente 32 x 32 no tiene hermano `-small` directo; el punto de referencia de calidad es el modelo de tamano completo. Tampoco se ofrecen comparaciones con autoencoders 3D externos (por ejemplo variantes de ocupacion o SDF de otros autores) en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso en ese sentido es un error de aplicacion.
- Calidad inferior al modelo de tamano completo: 0,8321 de IoU volumetrico y 0,7991 de precision cerca de superficie frente a 0,925 y 0,886. En piezas con detalles finos la perdida de fidelidad geometrica es esperable.
- Los latentes no son portables entre modelos: aunque la forma del latente coincida con la de sus hermanos, cada modelo define su propio espacio latente y los latentes de uno no se pueden decodificar con otro.
- Riesgo de geometria plausible pero incorrecta: como autoencoder de ocupacion, puede rellenar o suavizar zonas no observadas de la forma. No se publica una evaluacion especifica de este comportamiento.
- Dominio de entrenamiento limitado: el dataset fusionado de 110.077 formas no se detalla en la informacion disponible, y el protocolo de evaluacion se limita a 128 formas CAD reservadas de ABC, por lo que la generalizacion a otros dominios (escaneos ruidosos, formas organicas, mallas con topologia no manifold) no esta documentada.
- Sesgos del dataset: no disponibles. No se documenta composicion, procedencia ni posibles desequilibrios del corpus de entrenamiento.
- No se documentan cuantizaciones ni pesos en otros formatos (GGUF, ONNX, safetensors); la distribucion es un npz autocontenido.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de copyright. El trabajo original de COD-VAE debe citarse segun la referencia del paper.
- Advertencia practica en produccion: las cifras de throughput publicadas corresponden a JAX con float16 en H100 y no necesariamente se trasladan a PyTorch ni a GPUs de consumo, por lo que conviene medir el caso concreto antes de fijar presupuestos de latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TimSchneider42/cod-vae-32x32-tiny
- Modelo hermano de latente completo: https://huggingface.co/TimSchneider42/cod-vae-32x32
- Receta `-small` de referencia: https://huggingface.co/TimSchneider42/cod-vae-16x8-small
- Paper de COD-VAE (arXiv:2503.08737): https://arxiv.org/abs/2503.08737
- Repositorio de la libreria: https://github.com/TimSchneider42/cod-vae
- Guia de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
- Cita del paper original: Cho, In; Yoo, Youngbeom; Jeon, Subin; Kim, Seon Joo. "Representing 3D Shapes with 64 Latent Vectors for 3D Diffusion Models", ICCV 2025.
