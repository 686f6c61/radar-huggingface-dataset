# TimSchneider42/cod-vae-8x32-tiny

## Resumen

COD-VAE 8x32 (tiny) es un autoencoder variacional para reconstruccion de formas 3D desarrollado por TimSchneider42, publicado en HuggingFace bajo licencia MIT. El modelo comprime una forma 3D completa en 8 vectores latentes de 32 dimensiones (256 numeros en total) y los decodifica de vuelta a un campo de ocupacion volumetrica. Es una reimplementacion en PyTorch/JAX del COD-VAE original de Cho et al. (ICCV 2025), cuyo articulo se referencia con el identificador arXiv:2503.08737.

La variante `tiny` esta disenada con un criterio "decode-first": su proposito principal no es maximizar la fidelidad de reconstruccion, sino minimizar el coste del paso forward+backward a traves de un decodificador congelado. Esto la hace idonea para pipelines de aprendizaje por refuerzo donde la recompensa se calcula como reconstruccion, o para cualquier bucle iterativo que evalue muchos latentes por segundo. Con aproximadamente 6,6 millones de parametros, es unas 4x mas rapida que la variante `-small` y unas 33x mas rapida que el modelo de tamano completo.

El modelo comparte la forma latente (8x32) con su hermano de mayor tamano `cod-vae-8x32`, pero cada modelo define su propio espacio latente: los latentes de uno no pueden decodificarse con otro. La calidad de reconstruccion en el conjunto de prueba ABC (piezas CAD) alcanza un IoU volumetrico de 0,7877 y una precision cerca de superficie de 0,7689, por debajo del modelo completo pero dentro del umbral minimo fijado de 0,75 IoU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional (VAE) para reconstruccion de formas 3D; encoder transformer de parches, decodificador de refinamiento y decodificador latente |
| Parametros totales | ~6,6 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; representa formas como 8 latentes de 32 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en npz; el autor reporta inferencia en JAX float16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | npz autocontenido, cargable desde PyTorch y JAX |

## Arquitectura y entrenamiento

El modelo sigue el esquema COD-VAE: un encoder basado en parches que proyecta la geometria de entrada a una representacion latente compacta, un decodificador latente y un decodificador de refinamiento que produce logits de ocupacion. En esta variante `tiny`, la dimension de embedding es de 128 con 4 cabezas de atencion; el encoder consta de 2 bloques de 2 capas con 256 parches y MLP de factor 2; el decodificador de refinamiento tiene 4 capas con parches de 32 px; los planos de consulta (`query_dim`) usan 8 canales a 96²; y el decodificador latente tiene 6 capas. La configuracion incluida fija `attention_implementation="default"` (ruta XLA), que el autor mide como mas rapida que el kernel fusionado de cuDNN en estas secuencias cortas.

El entrenamiento reutiliza el mismo dataset fusionado de 110.077 formas y la receta de dos etapas que la familia `-small`: una etapa 1 de 200 epocas para el tronco, compartida por fila de `num_latents`, y una etapa 2 fresca de 100 epocas por celda con 6 capas de decodificador latente. La configuracion 16x8 se cualifico contra un umbral minimo de 0,75 IoU volumetrico en ABC antes de entrenar la rejilla. No se documenta en la informacion disponible el uso de RLHF ni DPO (no aplica a este dominio), ni innovaciones como decodificacion especulativa.

## Capacidades

- Codificacion de mallas 3D a latentes de 8x32 = 256 numeros mediante `encode_mesh`, con transformacion asociada devuelta junto al latente.
- Codificacion desde nubes de puntos de superficie (`encode`) con puntos en el cubo [-1, 1]^3.
- Decodificacion de latentes a logits de ocupacion en puntos de consulta arbitrarios (`decode`), con convencion de signo positivo en el interior.
- Decodificacion a una rejilla densa de logits volumetricos (`decode_volume`) a resoluciones configurables (por ejemplo 128).
- Reconstruccion de malla como `trimesh.Trimesh` lista para usar en pipelines de geometria.
- Extraccion de caracteristicas latentes para tareas posteriores (el pipeline declarado es `feature-extraction`).
- Inferencia en dos backends (PyTorch y JAX) con los mismos pesos npz.
- No soporta tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje ni multimodal generativo.

## Casos de uso

- Aprendizaje por refuerzo con recompensa de reconstruccion: el modelo actua como decodificador congelado dentro del bucle de RL; su coste de forward+backward reducido (8,0 ms por paso en H100) permite evaluar muchas muestras por segundo para calcular la recompensa de reconstruccion.
- Generacion 3D por difusion: sirve como autoencoder latente de un modelo de difusion que opere sobre el espacio de 8x32 latentes, ya que la codificacion y decodificacion son rapidas y el latente es compacto.
- Busqueda y recuperacion de formas 3D: codificar una base de mallas a latentes de 256 numeros permite indexar y comparar geometrias en un espacio de baja dimension con coste de almacenamiento minimo.
- Procesamiento por lotes de grandes repositorios CAD: la throughput de hasta 127k formas/s en H100 hace viable codificar o reconstruir catalogos completos de piezas (el modelo se cualifico sobre piezas CAD de ABC) en minutos.
- Preprocesado para datasets de aprendizaje: convertir mallas o nubes de puntos no estructuradas a latentes normalizados antes de entrenar otros modelos geometricos, reduciendo la dimensionalidad de entrada.
- Reconstruccion interactiva en herramientas de edicion 3D: la decodificacion a rejillas densas (`decode_volume`) a resolucion 128 permite regenerar el campo de ocupacion tras editar el latente, con latencia muy baja apta para interfaces interactivas.
- Prototipado de investigacion en representaciones 3D: la forma latente identica a `cod-vae-8x32` permite experimentar con el mismo espacio de representacion mientras se reserva el modelo completo para la evaluacion final de calidad.

## Benchmarks y rendimiento

Calidad de reconstruccion sobre formas retenidas (ABC, piezas CAD, 128 formas):

| Metrica | Valor |
|---|---|
| IoU volumetrico | 0,7877 |
| Precision cerca de superficie | 0,7689 |
| Referencia: `cod-vae-8x32` (tamano completo) | 0,887 / 0,851 |

Velocidad de decodificacion (H100, JAX float16, lote 1024 x 2048 consultas, forward+backward a traves del latente completo):

| Modelo | Paso | Throughput |
|---|---|---|
| cod-vae-16x8 (completo) | ~350 ms | 2,9k formas/s |
| cod-vae-16x8-small | 43,5 ms | 23,6k formas/s |
| cod-vae-16x8-tiny | 8,0 ms | 127k formas/s |

Nota: las cifras de velocidad se midieron sobre la variante 16x8; el autor indica que `num_latents` y `latent_dim` apenas afectan al coste de decodificacion, por lo que los valores se extrapolan a toda la familia `-tiny`. La rejilla `-small` no alcanza la configuracion 16x16, por lo que esta forma latente no tiene hermano `-small`.

## Requisitos de hardware

- VRAM estimada: con ~6,6 millones de parametros, los pesos ocupan en torno a 13 MB en float16 (26 MB en float32), mas el coste de activaciones y consultas, que dominan el consumo en lotes grandes.
- GPU recomendadas: el autor reporta mediciones en H100. Cualquier GPU con soporte CUDA reciente (A100, L40S, RTX 4090, RTX 3090) es suficiente por tamano de modelo.
- GPU de consumo: cabe holgadamente en cualquier GPU consumer con 4 GB o mas de VRAM, e incluso en CPU para lotes pequenos, dado el reducido numero de parametros.
- Opciones de despliegue: no hay integracion con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El despliegue se hace mediante la libreria `cod-vae` con backend PyTorch (`pip install cod-vae[torch,hub]`) o JAX (`pip install cod-vae[jax,hub]`).
- Latencia y throughput: 8,0 ms por paso y 127k formas/s en H100 (JAX float16, lote 1024 x 2048 consultas). En hardware inferior la latencia aumentara proporcionalmente, aunque el margen por tamano de modelo es amplio.

## Comparativa con modelos similares

| Modelo | Parametros | Forma latente | IoU volumetrico (ABC) | Throughput (H100) | Licencia |
|---|---|---|---|---|---|
| cod-vae-8x32-tiny (este) | ~6,6 M | 8x32 | 0,7877 | 127k formas/s (familia tiny) | MIT |
| cod-vae-8x32 (completo) | no disponible | 8x32 | 0,887 | no disponible | MIT |
| cod-vae-16x8-small | ~35 M | 16x8 | no disponible (umbral 0,75) | 23,6k formas/s | MIT |
| cod-vae-16x8 (completo) | no disponible | 16x8 | no disponible | 2,9k formas/s | MIT |
| cod-vae-16x8-tiny | ~6,6 M | 16x8 | no disponible | 127k formas/s | MIT |

Todos los modelos comparados proceden del mismo autor y la misma familia COD-VAE, por lo que comparten receta de entrenamiento y licencia. La eleccion entre ellos es un compromiso entre fidelidad de reconstruccion (mayor en los modelos completos) y velocidad de decodificacion (mayor en la variante tiny).

## Limitaciones y advertencias

- Los latentes no son intercambiables entre modelos de la familia: aunque la forma latente coincida (8x32), cada modelo define su propio espacio latente y un latente de uno no puede decodificarse con otro.
- La calidad de reconstruccion es notablemente inferior a la del modelo completo: 0,7877 frente a 0,887 de IoU volumetrico en ABC. No es adecuada para aplicaciones que exijan alta fidelidad geometrica.
- Los datos de calidad solo cubren ABC (piezas CAD, 128 formas retenidas); no se reportan resultados en otros dominios (escaneos, formas organicas, escenas), por lo que la generalizacion fuera de CAD no esta documentada.
- El umbral de cualificacion de 0,75 IoU se fijo para la configuracion 16x8; no se especifica si el mismo umbral aplica formalmente a esta configuracion 8x32.
- No es un modelo de lenguaje: no tiene capacidades de generacion de texto, codigo, matematicas, vision 2D ni tool calling. Cualquier expectativa en ese sentido es erronea.
- Sesgos conocidos en la representacion: no se documentan en la informacion disponible, pero al entrenarse sobre un dataset fusionado de 110.077 formas (con predominio esperado de CAD) puede infrarrepresentar categorias poco frecuentes.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del articulo original de COD-VAE citado por si hubiera terminos independientes sobre el metodo.
- La inferencia en float16 reportada por el autor corresponde a JAX; el comportamiento numerico en PyTorch puede diferir.
- El repositorio no registra descargas ni likes y tiene un tamano de 0.0 GB en el momento de la consulta, lo que sugiere un modelo recien publicado con poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TimSchneider42/cod-vae-8x32-tiny
- Modelo hermano de mayor tamano: https://huggingface.co/TimSchneider42/cod-vae-8x32
- Variante `-small`: https://huggingface.co/TimSchneider42/cod-vae-16x8-small
- Repositorio de la libreria: https://github.com/TimSchneider42/cod-vae
- Guia de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
- Articulo COD-VAE (arXiv): https://arxiv.org/abs/2503.08737
- Citacion: Cho, I., Yoo, Y., Jeon, S. y Kim, S. J. "Representing 3D Shapes with 64 Latent Vectors for 3D Diffusion Models", ICCV 2025.
