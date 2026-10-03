# TimSchneider42/cod-vae-32x4-tiny

## Resumen

COD-VAE 32x4 (tiny) es un autoencoder variacional (VAE) para reconstruccion de formas 3D desarrollado por TimSchneider42, una reimplementacion en PyTorch/JAX del metodo COD-VAE original de Cho et al. (ICCV 2025). El modelo comprime una forma 3D completa en 32 vectores latentes de 4 dimensiones (128 numeros en total) y los decodifica de vuelta a un campo de ocupacion volumetrico. No es un modelo de lenguaje: es un compresor/decodificador geometrico orientado a extraccion de caracteristicas y reconstruccion de superficies.

Su relevancia radica en su tamano y velocidad. Con aproximadamente 6,5 millones de parametros, es entre 4 y 33 veces mas rapido en decodificacion que sus hermanos `-small` y de tamano completo respectivamente, lo que lo hace adecuado para pipelines donde el coste dominante es el forward+backward a traves de un decodificador congelado (por ejemplo, RL con recompensa de reconstruccion). Mantiene la misma forma latente que `cod-vae-32x4`, aunque cada modelo define su propio espacio latente y los latentes no son intercambiables.

Los pesos se distribuyen como un unico archivo npz autocontenido que carga tanto en el backend de PyTorch como en el de JAX. La calidad de reconstruccion es inferior a la del modelo de tamano completo, con un IoU volumetrico de 0,7161 en el conjunto de validacion de ABC frente a 0,831 del modelo grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE basado en transformer (COD-VAE, Cho et al. ICCV 2025) |
| Parametros totales | ~6,5 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; latente de 32 vectores x 4 dimensiones = 128 numeros |
| Tipos de cuantizacion | no disponible (pesos en npz; fp16 usado en las mediciones JAX) |
| Idiomas soportados | no aplica (modelo geometrico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | npz autocontenido (carga en PyTorch y JAX) |

## Arquitectura y entrenamiento

El modelo sigue el diseno COD-VAE: un codificador que procesa parches de superficie y produce un latente compacto de 32 x 4, y un decodificador por refinamiento que reconstruye el campo de ocupacion a partir de planos de consulta. En esta variante `-tiny` la dimension de embedding es 128 con 4 cabezas de atencion; el codificador usa 2 bloques de 2 capas con 256 parches y mlp 2; el decodificador de refinamiento tiene 4 capas con parches de 32 px; los planos de consulta (`query_dim`) son 8 canales a 96²; y el decodificador latente consta de 6 capas. La configuracion fija `attention_implementation="default"` (ruta XLA), que resulta mensurablemente mas rapida que el kernel fusionado de cuDNN para estas secuencias cortas.

El entrenamiento emplea el mismo dataset fusionado de 110.077 formas y la misma receta en dos etapas que la familia `-small`: una etapa 1 de 200 epocas por `num_latents` (troncal compartido por fila) y una etapa 2 fresca de 100 epocas por celda con 6 capas de decodificador latente. No se menciona uso de RLHF ni DPO, al no tratarse de un modelo generativo de lenguaje. El codigo de entrenamiento, la guia y los comandos exactos estan en el repositorio `cod-vae`.

## Capacidades

- Compresion de mallas 3D a un latente de 128 numeros mediante `encode_mesh`.
- Reconstruccion de mallas desde latente mediante `decode_mesh`, devolviendo un `trimesh.Trimesh`.
- Codificacion desde nubes de puntos de superficie crudas (`encode`, puntos en [-1, 1]^3).
- Decodificacion en puntos de consulta arbitrarios, devolviendo logits de ocupacion (positivo en el interior).
- Generacion de rejillas densas de logits de ocupacion con `decode_volume` a una resolucion configurable (por ejemplo 128).
- Extraccion de caracteristicas latentes para tareas posteriores (pipeline declarado: feature-extraction).
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: decodificacion rapida optimizada para forward+backward a traves de un decodificador congelado; util como modulo diferenciable en pipelines de RL.

## Casos de uso

- Aprendizaje por refuerzo con recompensa de reconstruccion: al ser el decodificador un componente diferenciable y rapido (8,0 ms por paso para el lote de referencia), el modelo encaja como modulo de recompensa en el bucle de entrenamiento de un generador de formas 3D, donde el coste dominante es el forward+backward a traves del decodificador.
- Compresion de activos 3D para almacenamiento: una malla completa se reduce a 128 numeros, lo que permite almacenar grandes catalogos de piezas con un consumo de memoria minimo antes de una reconstruccion posterior bajo demanda.
- Preprocesado para modelos generativos 3D: el latente de 32 x 4 puede servir como representacion de entrada para modelos de difusion que operen sobre espacios latentes compactos (linea del paper COD-VAE original).
- Extraccion de caracteristicas para clasificacion o recuperacion de formas: el latente aprendido puede alimentar tareas de retrieval o clasificacion geometrica como descriptor de bajo coste.
- Validacion geometrica en pipelines CAD: dado un campo de ocupacion reconstruido, se pueden comparar formas mediante IoU volumetrico, util para control de calidad de piezas CAD.
- Prototipado rapido y experimentacion: su tamano de ~6,5 M de parametros permite iterar en equipos modestos, incluido un portatil con GPU de consumo, sin necesidad de infraestructura de centro de datos.
- Generacion de versiones de baja fidelidad para vista previa: cuando se necesita una representacion rapida antes de un refinamiento con el modelo de tamano completo.

## Benchmarks y rendimiento

Calidad de reconstruccion en formas retenidas (protocolo ABC, partes CAD, 128 formas):

| Modelo | Volumen IoU | Precision cerca de superficie |
|---|---|---|
| cod-vae-32x4-tiny | 0,7161 | 0,7166 |
| cod-vae-32x4 (tamano completo, referencia) | 0,831 | 0,808 |

Throughput de decodificacion (H100, JAX float16, lote 1024 x 2048 consultas, forward+backward a traves del latente completo; medido sobre la variante 16x8 y valido para toda la familia `-tiny`, ya que `num_latents` y `latent_dim` apenas afectan al coste):

| Modelo | Tiempo por paso | Throughput |
|---|---|---|
| cod-vae-16x8 (completo) | ~350 ms | 2,9k formas/s |
| cod-vae-16x8-small | 43,5 ms | 23,6k formas/s |
| cod-vae-16x8-tiny | 8,0 ms | 127k formas/s |

La configuracion 16x8 se cualifico contra un umbral minimo de 0,75 de IoU volumetrico en ABC antes de entrenar la rejilla. La rejilla `-small` solo llega hasta `16x16`, por lo que la forma latente de este modelo no tiene hermano `-small`.

## Requisitos de hardware

- VRAM para inferencia: el modelo tiene ~6,5 M de parametros, lo que ocupa en torno a 13 MB en fp16 para los pesos; el consumo real dependera del lote de puntos de consulta y la resolucion de `decode_volume`.
- GPU recomendadas: H100 es la plataforma sobre la que se reportan las mediciones; cualquier GPU moderna de NVIDIA deberia ser compatible via PyTorch o JAX.
- Cabe en GPU de consumo: si, es un modelo muy ligero y es probable que funcione en GPUs de gama media y en algunos integrados, aunque la VRAM exacta no esta publicada.
- Opciones de despliegue: biblioteca propia `cod-vae` con backends PyTorch o JAX; instalacion mediante `pip install cod-vae[torch,hub]` o `cod-vae[jax,hub]`. No se contemplan vLLM, llama.cpp ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: en H100 con JAX fp16, lote de 1024 x 2048 consultas, ~8,0 ms por paso y ~127k formas/s para la familia `-tiny` (medido sobre la variante 16x8).

## Comparativa con modelos similares

| Modelo | Parametros | Forma latente | IoU volumetrico (ABC) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cod-vae-32x4-tiny (este) | ~6,5 M | 32 x 4 | 0,7161 | MIT | HuggingFace |
| cod-vae-32x4 | no disponible en la informacion | 32 x 4 | 0,831 | MIT | HuggingFace |
| cod-vae-16x8-small | ~35 M | 16 x 8 | 0,75 (umbral de cualificacion) | MIT | HuggingFace |
| cod-vae-16x8 (completo) | no disponible en la informacion | 16 x 8 | no disponible | MIT | HuggingFace |

Todos comparten la misma familia y licencia MIT. El modelo completo ofrece mejor IoU pero decodifica aproximadamente 33 veces mas lento; el `-small` es el punto intermedio con ~35 M de parametros.

## Limitaciones y advertencias

- Calidad inferior: el IoU volumetrico (0,7161) queda por debajo del modelo de tamano completo (0,831) y de la referencia de la variante 16x8 completa, por lo que no es adecuado cuando se requiere maxima fidelidad geometrica.
- Espacio latente no intercambiable: aunque la forma del latente coincide con `cod-vae-32x4`, un latente generado por un modelo no puede decodificarse con otro.
- Ambito limitado a formas 3D: no procesa texto, imagen ni audio; no tiene capacidades linguisticas ni de razonamiento.
- Datos de sesgo: no se detallan analisis de sesgo del dataset de 110.077 formas, que podria no representar todas las familias de geometrias del mundo real.
- Riesgo de artefactos: la reconstruccion a traves de un campo de ocupacion puede producir superficies imprecisas en zonas de detalle fino, coherente con la precision cerca de superficie reportada (0,7166).
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero conviene revisar la licencia del dataset de entrenamiento, no detallada en la informacion disponible.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es todavia inexistente.
- Rendimiento medido en una unica plataforma (H100 con JAX fp16); el comportamiento en otros backends o GPUs no esta publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TimSchneider42/cod-vae-32x4-tiny
- Modelo hermano (misma forma latente): https://huggingface.co/TimSchneider42/cod-vae-32x4
- Modelo de referencia intermedio: https://huggingface.co/TimSchneider42/cod-vae-16x8-small
- Paper COD-VAE (Cho et al., ICCV 2025): https://arxiv.org/abs/2503.08737
- Repositorio de codigo: https://github.com/TimSchneider42/cod-vae
- Guia de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
