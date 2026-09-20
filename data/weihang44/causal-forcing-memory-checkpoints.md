# weihang44/Causal-Forcing-Memory-Checkpoints

## Resumen

weihang44/Causal-Forcing-Memory-Checkpoints es un repositorio de pesos publicado en Hugging Face que contiene cuatro checkpoints del compresor de memoria CR10 (memory ratio 0,1) pertenecientes a una misma ejecución de entrenamiento sobre el generador de vídeo Causal Forcing (zhuhz22/Causal-Forcing). No es un modelo de lenguaje ni un generador autónomo: es un artefacto de investigación distribuido como PyTorch Distributed Checkpoint (DCP) que solo se puede cargar con el repositorio de inferencia y el commit exactos que indica su autor.

Cada checkpoint corresponde a un paso de entrenamiento distinto (2000, 3000, 4000 y 5000) y ocupa 5,682 GB, lo que suma aproximadamente 22,73 GB de pesos; el repositorio completo ocupa 727,3 GB. Los ficheros de tensores se conservan byte a byte y van acompañados de sumas SHA256, un manifest.json y un inventory.json con la procedencia y los tamanos exactos. Cada directorio model/ es un DCP que incluye tanto el estado congelado del generador (net.*) como el estado entrenado del compresor (net_compressor.*).

Su relevancia es acotada pero concreta: documenta un punto intermedio de un entrenamiento de compresión de memoria para generación de vídeo texto-a-vídeo, con ratio de memoria 0,1 (CR10), y permite a otros grupos evaluar el efecto del numero de pasos sobre la calidad de la compresión sin reentrenar. El repositorio no publica licencia, ni benchmarks, ni ficha de arquitectura completa, y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. El artefacto contiene un generador de vídeo texto-a-vídeo congelado (net.*, base zhuhz22/Causal-Forcing) mas un compresor de memoria entrenado (net_compressor.*) |
| Parametros totales | No disponible. El compresor se construye con la etiqueta "1.3B" en el script oficial de inferencia; el tamano del generador no se documenta |
| Parametros activos | No aplica / no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | 1024 (tercer argumento de `build_compressor("1.3B", 0.1, 1024)` en el ejemplo oficial; el README no especifica su semantica exacta) |
| Tipos de cuantizacion | No disponible. El ejemplo de carga usa `torch.bfloat16`; no se publican pesos cuantizados |
| Idiomas soportados | Inglés (etiqueta `en`); el condicionamiento textual depende del text encoder de Causal Forcing |
| Licencia | No disponible |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP): shards `.distcp` mas fichero `.metadata`. No hay safetensors ni GGUF |
| Ratio de memoria | 0,1 (CR10) |
| Pasos publicados | 2000, 3000, 4000, 5000 (`cf-cr10-lr1e4-cos2e5-5k`) |
| Tamano por checkpoint | 5,682 GB |
| Tamano total de pesos | ~22,73 GB (cuatro checkpoints) |
| Tamano del repositorio | 727,3 GB |
| Integridad | `manifest.json` y `SHA256SUMS` sobre todos los ficheros de modelo y config |
| Estado incluido | Pesos y config de entrenamiento. No incluye optimizador, scheduler ni estado del trainer |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del generador ni del compresor. Lo que si se documenta es la estructura del checkpoint: cada directorio `model/` es un PyTorch Distributed Checkpoint que combina el estado congelado del generador (`net.*`) con el estado entrenado del compresor (`net_compressor.*`). El cargador del repositorio de inferencia lee estos DCP sin necesitar el world size original del entrenamiento, extrae unicamente las claves `net_compressor.*` y valida el state dict de destino de forma estricta; ademas gestiona un embedding opcional de tarea de autoencoder presente en checkpoints antiguos.

El entrenamiento se identifica por la ruta `cf-cr10-lr1e4-cos2e5-5k`, de la que se deduce un learning rate de 1e-4 y un scheduler coseno hasta 5k pasos, con ratio de memoria 0,1 (CR10), aunque el README no detalla el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones de decodificacion (por ejemplo, decodificacion especulativa) ni variantes de atencion. El unico mecanismo claramente identificable es la compresion de memoria sobre un generador congelado, entrenada de forma aislada.

Un detalle relevante para la reproducibilidad: el config guardado contiene rutas de clúster originales que deben adaptarse en otra instalacion, y sus campos de credenciales estan vacios. El repositorio de inferencia compatible esta fijado al commit `bdbf3f2e903392e855638f19b1d555c150904d96` de `a-little-hoof/video-compress`.

## Capacidades

- Generacion de video texto-a-video unicamente como parte del pipeline completo de Causal Forcing: este repositorio aporta el compresor, no el generador.
- Compresion de memoria con ratio 0,1 (CR10), es decir, retencion de aproximadamente una decima parte de la memoria respecto a la configuracion de referencia.
- Carga independiente del world size de entrenamiento: el loader acepta los shards DCP sin replicar la topologia distribuida original.
- Extraccion aislada del submodulo `net_compressor.*` con comprobacion estricta del state dict de destino.
- Compatibilidad con la gestion del embedding opcional de tarea de autoencoder en checkpoints antiguos.
- Evaluacion de politicas de cache en inferencia sin reentrenar: fullraw21 sin seleccion, numero de sinks y numero de frames recientes se definen como politicas de inferencia, no como identidades distintas de checkpoint.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, matematicas, codigo ni capacidades multimodales mas alla del propio pipeline de video.

## Casos de uso

- Investigacion en compresion de contexto para generacion de video: el checkpoint permite reproducir el punto exacto de entrenamiento (ratio 0,1) y medir el impacto de la compresion de memoria en la calidad del video generado, sin tener que repetir el entrenamiento.
- Generacion de video de duracion extendida con presupuesto de memoria reducido: al retener solo el 10 por ciento de la memoria, el pipeline puede mantener coherencia temporal en secuencias largas con un coste de memoria muy inferior al de la configuracion sin comprimir.
- Estudios de ablacion por numero de pasos: los cuatro checkpoints (2000, 3000, 4000 y 5000) permiten trazar curvas de convergencia del compresor y decidir en que punto se alcanza el mejor compromiso calidad/compresion.
- Auditoria y reproducibilidad de artefactos: `manifest.json`, `inventory.json` y `SHA256SUMS` permiten verificar byte a byte la integridad de los tensores y comparar con otras copias del mismo entrenamiento.
- Ajuste fino o destilacion del compresor: al estar el generador congelado, se puede reentrenar exclusivamente el submodulo `net_compressor` sobre el mismo backbone sin tocar los pesos del generador.
- Integracion en pipelines de inferencia propios: el loader de `video-compress` extrae `net_compressor.*` de un DCP y valida el state dict, lo que facilita insertar el compresor en un servicio de generacion de video interno con control estricto de pesos.
- Evaluacion de politicas de cache: permite comparar configuraciones como fullraw21 sin seleccion, numero de sinks y numero de frames recientes manteniendo el mismo checkpoint, y asi separar el efecto de la politica del efecto de los pesos.
- Punto de partida para experimentos de mayor compresion: sirve como referencia CR10 frente a variantes mas agresivas de ratio de memoria en futuras ejecuciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README remite a un indice de revision (`CF_MBENCH_REMOTE_REVIEW.md`) que describe el setup evaluado y sus limitaciones, pero no incluye cifras de metricas en el material proporcionado, por lo que no se presentan numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el pipeline completo, ya que el README no indica el tamano del generador CF, del text encoder ni del VAE.
- Estimacion aritmetica del compresor aislado: aproximadamente 2,6 GB de pesos en bfloat16 para la etiqueta "1.3B" (sin contar activaciones ni el resto del pipeline). Es una estimacion derivada del nombre del modelo, no un dato publicado.
- GPU recomendadas: no disponible. El unico requisito explicito es una GPU con CUDA, ya que el ejemplo hace `compressor.to(device="cuda", dtype=torch.bfloat16)`.
- Uso en GPU de consumo: no confirmado. El compresor aislado cabria previsiblemente en GPUs de consumo con suficiente VRAM, pero el pipeline de generacion completo requiere componentes cuyo tamano no se documenta.
- Opciones de despliegue: no soporta vLLM, llama.cpp, Ollama ni TGI. Requiere el repositorio `a-little-hoof/video-compress` en el commit `bdbf3f2e903392e855638f19b1d555c150904d96`, con su sistema de cache y el generador CF, text encoder y VAE correspondientes.
- Latencia y throughput: no disponible.
- Almacenamiento: 5,682 GB por checkpoint y ~22,73 GB para los cuatro; conviene descargar con `allow_patterns` para no traer el repositorio completo (727,3 GB).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el material proporcionado. Este repositorio no es un modelo independiente, sino un conjunto de checkpoints de un compresor sobre Causal Forcing, por lo que la comparacion externa no puede establecerse con los datos disponibles.

Comparativa interna entre los cuatro checkpoints publicados:

| Checkpoint | Directorio | Tamano | Ratio de memoria | Diferencia |
|---|---|---:|---|---|
| Paso 2000 | `cf-cr10-lr1e4-cos2e5-5k/iter_000002000` | 5,682 GB | 0,1 (CR10) | Entrenamiento mas corto |
| Paso 3000 | `cf-cr10-lr1e4-cos2e5-5k/iter_000003000` | 5,682 GB | 0,1 (CR10) | Paso intermedio |
| Paso 4000 | `cf-cr10-lr1e4-cos2e5-5k/iter_000004000` | 5,682 GB | 0,1 (CR10) | Paso intermedio |
| Paso 5000 | `cf-cr10-lr1e4-cos2e5-5k/iter_000005000` | 5,682 GB | 0,1 (CR10) | Ultimo paso publicado |

Alternativas de la misma categoria: no disponible.

## Limitaciones y advertencias

- No se publica licencia, por lo que el uso comercial queda en un limbo legal: hay que contactar con el autor antes de cualquier despliegue productivo.
- No es un modelo autónomo: sin el generador CF, el text encoder y el VAE correspondientes, los checkpoints no generan nada.
- Dependencia fuerte de versiones: el cargador solo esta garantizado en el commit `bdbf3f2e903392e855638f19b1d555c150904d96` del repositorio `video-compress`.
- Los shards DCP deben mantenerse juntos, incluidos `.metadata` y los shards de rank vacios; separarlos o renombrarlos rompe la carga.
- El config guardado contiene rutas del clúster original que hay que adaptar manualmente, y los campos de credenciales estan vacios: no es un paquete listo para ejecutar tal cual.
- Solo se publican los pasos 2000 a 5000; no hay checkpoint final ni estado de optimizador, scheduler o trainer, lo que impide reanudar el entrenamiento exactamente donde se dejo.
- No hay datos de sesgos, alucinacion o comportamiento en produccion; al tratarse de un compresor de memoria sobre un generador de video, los riesgos tipicos son de fidelidad visual y coherencia temporal, no verificables con la informacion disponible.
- Soporte de idiomas limitado a ingles segun las etiquetas del repositorio, con la salvedad de que la generacion depende del text encoder del modelo base.
- El repositorio ocupa 727,3 GB en total: descargarlo entero sin filtrar por `allow_patterns` puede consumir un espacio de disco considerable.
- Ausencia total de benchmarks publicados en el material disponible, lo que impide validar la calidad de la compresion frente a otras alternativas.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el 2026-09-20: se trata de un artefacto muy reciente y sin validacion externa conocida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/weihang44/Causal-Forcing-Memory-Checkpoints
- Modelo base (generador Causal Forcing): https://huggingface.co/zhuhz22/Causal-Forcing
- Pesos del generador standalone (`causal_forcing.pt`, SHA256 `cf75ee5cc6f4e2e336c59c973f5544655d8f0aa481761efe6de1b9cb2eb0cd9d`): https://huggingface.co/zhuhz22/Causal-Forcing/blob/2f8eb8bb6eeb1238da9d13e5420d342a74d634a6/chunkwise/causal_forcing.pt
- Repositorio de inferencia `video-compress` (commit fijado): https://github.com/a-little-hoof/video-compress/tree/bdbf3f2e903392e855638f19b1d555c150904d96
- Metodo CF publicado e indice de revision de benchmarks: https://github.com/a-little-hoof/video-compress/blob/bdbf3f2e903392e855638f19b1d555c150904d96/CF_MBENCH_REMOTE_REVIEW.md
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos correspondian a paginas de videojuegos de carreras en arabe, sin relacion con el repositorio.
