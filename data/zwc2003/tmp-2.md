# zwc2003/tmp-2

## Resumen

`zwc2003/tmp-2` no es una ficha de modelo al uso: es un repositorio de migración de 572,1 GB que empaqueta el árbol de trabajo completo del proyecto **nuReasoning** (originalmente en `/cephfs/zhengwc/nuReasoning`), un pipeline de investigación sobre razonamiento y planificación para conducción autónoma. El repositorio lo publica el usuario de Hugging Face `zwc2003` (Zheng Weicheng) y contiene datos de entrenamiento SFT, datos de RL, anotaciones, código fuente, resultados de evaluación y los pesos de varios checkpoints intermedios y finales.

El contenido se organiza en archivos `tar` por bloques (imágenes, anotaciones, SFT, RL, resultados, código) más los pesos en `safetensors`, y se reconstruye con un script `restore.sh` que descomprime en paralelo y verifica el número de archivos y bytes mediante `verify_restore.py`. Buena parte del valor del repositorio está en la estructura de datos: seis paquetes de imágenes de conducción (muestreadas típicamente a 546×359, 128 fragmentos por paquete), 1.000 clips de test, y los pesos de variantes como `alpamayo-1.5-10B` (miembro del pool 2955, `regular12 ckpt1500`, `RL mid300_450`), los checkpoints VQA `WODQ 2816/4224` y `AD Knowledge 1131`.

Es relevante ahora porque expone públicamente material que habitualmente no se publica: cadenas de razonamiento generadas por un modelo profesor, mezclas de SFT y RL para planificación de conducción, y los checkpoints intermedios de un proceso de selección de modelos. Ahora bien, no incluye model card técnica, licencia, idiomas declarados ni benchmark alguno, y omite deliberadamente las imágenes de cámara completas (≈1,1 TB), los estados del optimizador y las dependencias de entorno, por lo que no es reproducible de extremo a extremo solo con este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio agrega checkpoints de varios modelos (entre ellos `Alpamayo-1.5-10B`, `Qwen3.5-0.8B` y `WOD-SFT1186`); no se declara la arquitectura del modelo principal ni de los secundarios |
| Parametros totales | No disponible. El checkpoint de mayor tamano referenciado en el README es `Alpamayo-1.5-10B` (1,5·10^10 parametros por su nombre); no se detalla el resto |
| Parametros activos | No aplica: no se declara que ningun checkpoint sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El tag del repositorio indica `safetensors`; no se documentan variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible. La model card esta redactada en chino; no se declara cobertura idiomatica de los modelos |
| Licencia | No disponible. El campo de licencia del repositorio esta vacio |
| Formato de pesos | `safetensors` (tag del repositorio) para los pesos; el resto del contenido son archivos `.tar`, `.json` (incluido `MANIFEST.json` y `COMPLETE.json`), `.pkl` (`map.pkl`) y texto/CSV de resultados |
| Tamano del repositorio | 572,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-10-26T01:50:59Z / 2026-10-26T05:07:23Z |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura de los modelos que contiene; solo se puede inferir la del *pipeline* a partir de la estructura de directorios y de los nombres de los artefactos. Aparecen tres fases claramente separadas: una fase de **SFT** (`dataset/sft/` con paquetes `sft-*.tar`, mas seis conjuntos de imagenes asociados: `sft_images`, `planning_08b_extra`, `sft_v3_extra`, `vqa_v32_extra`, `planning_surround_extra`, `vqa_lora_pre2026_extra`), una fase de **RL** (`dataset/rl/` y `dataset/scorer/`, empaquetados en `dataset-misc.tar`) y una fase de **seleccion de checkpoints** (miembros de un *pool* de modelos con identificadores como `2955`, `regular12 ckpt1500` y `RL mid300_450`). El marco de entrenamiento empleado parece ser **ms-swift**, ya que el repositorio incluye dos copias de su codigo fuente en `external/FluidDrive/`.

Los datos de entrenamiento combinan imagenes de camara multimodales, metadatos y `ego_state` del vehiculo, anotaciones, mapas (`map.pkl`), preguntas de test y **cadenas de razonamiento (CoT) generadas por un modelo profesor**. El propio README advierte que los datos SFT de la version v2 "no se pueden reconstruir byte a byte desde los datos crudos" porque el CoT del profesor requiere llamadas a una API, lo que implica que esa parte del corpus no es reproducible sin acceso al servicio externo. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO; la presencia de un directorio `rl/` y de un `scorer/` sugiere optimizacion por recompensa, pero el algoritmo concreto (PPO, GRPO u otro) no se indica en la informacion disponible. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

Las capacidades que se enumeran a continuacion se deducen de los nombres de los directorios y del contenido del README, no de una model card tecnica; deben tomarse como indicativas:

- Planificacion de conduccion autonoma: los checkpoints bajo `alpamayo-1.5-10B` y los conjuntos `planning_*` apuntan a generacion de trayectorias o waypoints a partir de observaciones multicamara y estado del vehiculo.
- Razonamiento explicito en forma de cadena de pensamiento (CoT): el pipeline de SFT se alimenta de razonamientos generados por un profesor, lo que sugiere entrenamiento para producir justificaciones antes de la accion.
- VQA sobre escenas de conduccion: los checkpoints `WODQ 2816/4224` y los paquetes `vqa_*` indican tareas de pregunta-respuesta visual sobre el dataset WOD (Waymo Open Dataset).
- Conocimiento especifico de dominio: el checkpoint `AD Knowledge 1131` sugiere un ajuste orientado a conocimiento de conduccion autonoma.
- Evaluacion por *scoring*: el directorio `dataset/scorer/` implica un modelo o funcion de recompensa para puntuar salidas.
- Capacidades multimodales de vision-lenguaje: las imagenes muestreadas a 546×359 y las 1.000 clips de test confirman entrada visual, aunque no se detalla la resolucion nativa ni el tokenizador visual.
- Soporte de tool calling, function calling, agentes multi-paso, audio o thinking mode explicito: **no disponible** en la informacion proporcionada.
- Capacidades multilingues: **no disponible**; la documentacion esta en chino y no se declara cobertura de idiomas.

## Casos de uso

- **Reproduccion de experimentos de investigacion:** descargar el repositorio en `<ROOT>`, ejecutar `restore.sh` y reconstruir el arbol de directorios original permite reejecutar el entrenamiento y la evaluacion con las mismas rutas que en la maquina de origen; es el caso de uso principal declarado por el autor.
- **Aprendizaje por imitacion con cadenas de razonamiento:** el corpus `dataset/sft/` con CoT de profesor sirve como base para entrenar modelos que justifiquen la decision de conduccion antes de emitir waypoints, un patron habitual en tareas de planificacion interpretable.
- **Entrenamiento con refuerzo sobre politica de conduccion:** los datos de `dataset/rl/` junto con el `scorer/` permiten montar un bucle de RL donde la recompensa se calcula con el modelo de puntuacion incluido, util para comparar checkpoints SFT frente a checkpoints RL (`mid300_450`).
- **Benchmark interno de VQA en conduccion:** los checkpoints `WODQ 2816/4224` y las 1.000 clips de `data/test_inputs/` permiten medir exactitud de respuesta visual sobre un conjunto fijo y comparar variantes del modelo sin filtrar datos de test.
- **Seleccion de modelos mediante *model pool*:** los identificadores `2955`, `regular12 ckpt1500` y similares permiten estudiar tecnicas de *checkpoint averaging* o *model soup* sobre modelos afinados del mismo linaje, comparando metricas guardadas en `results/output-*.tar`.
- **Auditoria de pipelines de datos multimodales:** el `MANIFEST.json` y `verify_restore.py` ofrecen un mecanismo verificable (conteo de archivos y bytes por fragmento) para auditar integridad de corpus grandes, replicable en otros proyectos que muevan cientos de GB entre clusters.
- **Punto de partida para fine-tuning de modelos pequenos:** el checkpoint `Qwen3.5-0.8B` incluido permite experimentar tecnicas de destilacion o adaptadores sobre una base pequena antes de escalar a los modelos de 10B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye metricas internas dentro de `results/output-*.tar` (predicciones, 64 muestras por caso, envios, metricas y logs), pero no se reproducen en el README ni se acompanan de una descripcion del protocolo de evaluacion, por lo que no es posible presentar una tabla comparativa fiable.

## Requisitos de hardware

- **Almacenamiento:** 572,1 GB para la descarga completa. Tras ejecutar `restore.sh` y verificar, se pueden borrar los `tar` y liberar aproximadamente 400 GB, quedando el arbol descomprimido.
- **Almacenamiento adicional:** el propio README indica que las imagenes de camara completas (no incluidas) ocupan unos 1,1 TB y se suben aparte con `tools/stage_hf_transfer.py --cameras`; sin ellas no se puede reconstruir el conjunto completo.
- **Red:** la descarga se plantea con `hf download` y `--max-workers 16`; conviene contar con ancho de banda estable y usar `HF_HUB_DISABLE_XET=1` como sugiere el autor para evitar problemas con el backend Xet.
- **Memoria durante la restauracion:** la descompresion paralela con 16 trabajadores de fragmentos que contienen imagenes y pesos exige varios GB de RAM y E/S intensiva en disco; se recomienda almacenamiento local o paralelo, no sistemas de ficheros en red de baja latencia.
- **VRAM para inferencia (estimacion a partir del numero de parametros, no publicada por el autor):** `Alpamayo-1.5-10B` requeriria del orden de 20 GB en FP16, 10-11 GB en 8 bits y 5-6 GB en 4 bits para los pesos; `Qwen3.5-0.8B`, alrededor de 1,6 GB en FP16. Son calculos aritmeticos, no cifras verificadas.
- **GPU recomendadas:** no disponible. Para el checkpoint de 10B, un escenario FP16 encaja en A100 40 GB, H100 80 GB o dos RTX 4090 de 24 GB; la variante de 0,8B cabe con holgura en cualquier GPU consumer de 8 GB o mas. Estas recomendaciones son inferencias, no requisitos documentados.
- **Opciones de despliegue:** no disponible. El repositorio no incluye instrucciones de servicio; solo se menciona `ms-swift` como marco de entrenamiento y las dependencias de inferencia y puntuacion en `tools/migration_devkit/requirements-*.txt`. No hay confirmacion de soporte para vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput:** no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Relacion con este repositorio |
|---|---|---|---|---|---|
| `zwc2003/tmp-2` | No disponible (agrega varios checkpoints) | No disponible | No disponible | Repositorio publico de 572,1 GB, 0 descargas | Es el artefacto descrito: contenedor de datos, codigo y pesos |
| `DriveMA-2B` (mismo autor) | 2,3·10^9 | No disponible | No disponible | Publicado en Hugging Face y en Featherless AI | Modelo VLA afinado desde `Qwen3.5-2B` para planificacion de conduccion en dos turnos (meta-accion y waypoints); misma linea de investigacion |
| `Alpamayo-1.5-10B` | 1,5·10^10 (por nomenclatura) | No disponible | No disponible | Checkpoint referenciado en este repositorio; no se confirma publicacion independiente | Base o inicializacion usada en el pipeline; el repositorio incluye exportaciones y checkpoints afinados |
| `Qwen3.5-0.8B` | 8·10^8 (por nomenclatura) | No disponible | No disponible en la informacion proporcionada | Incluido en `models/` de este repositorio | Modelo pequeno usado como base o linea base de experimentacion |

No se dispone de datos de rendimiento de ninguna de las alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros, disponibilidad y relacion con el pipeline.

## Limitaciones y advertencias

- **No es un modelo listo para usar:** se trata de un repositorio de migracion de proyecto (datos, codigo y checkpoints), sin model card tecnica, sin pipeline declarado y sin instrucciones de inferencia.
- **Licencia ausente:** al no declararse licencia, no hay permiso explicito de uso comercial ni de redistribucion; en la practica debe considerarse material sin autorizacion clara hasta contactar con el autor.
- **Reproducibilidad parcial:** las imagenes de camara completas (≈1,1 TB), `dataset/data/val_as_test/`, los estados del optimizador, los experimentos descartados y los pesos de fine-tuning de modelos pequenos estan excluidos. Ademas, los datos SFT v2 no se pueden reconstruir byte a byte porque el CoT del profesor exige llamadas a una API.
- **Riesgo de seguridad en la carga de datos:** el repositorio incluye `map.pkl`, y la deserializacion de `pickle` procedente de terceros es un vector de ejecucion de codigo conocido; conviene inspeccionar o convertir estos archivos antes de cargarlos.
- **Rutas absolutas codificadas:** el codigo y los datos SFT contienen rutas como `/cephfs/zhengwc/nuReasoning` y `/localdata/nuReasoning`; es necesario crear enlaces simbolicos en esas rutas exactas para que el pipeline funcione, lo que complica su uso en contenedores o en maquinas sin privilegios de `root`.
- **Alucinacion y sesgos:** no evaluados ni documentados. Al tratarse de modelos de lenguaje y vision-lenguaje aplicados a conduccion, el riesgo de generar justificaciones plausibles pero incorrectas es alto y no existe ninguna evaluacion publicada de seguridad.
- **Sesgo de dominio y geografico:** los datos provienen de un unico corpus de conduccion (WOD y capturas propias); no se declara diversidad geografica, meteorologica ni de condiciones de iluminacion, lo que limita la generalizacion.
- **Idioma de la documentacion:** el README esta en chino, sin traduccion; no se declara el rendimiento de los modelos en castellano ni en otros idiomas.
- **Fechas anomalas:** las marcas de creacion y actualizacion del repositorio son de octubre de 2026, posteriores a la fecha de muchos entornos de referencia; conviene verificar la coherencia temporal antes de citarlo.
- **Sin validacion de la comunidad:** 0 descargas y 0 likes implican que no hay evidencia externa de que la restauracion funcione en un entorno distinto del original.
- **Coste de infraestructura:** 572,1 GB de descarga mas hasta 1,1 TB adicionales de imagenes suponen un coste de almacenamiento y transferencia considerable, y la descompresion paralela exige E/S de disco intensiva.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zwc2003/tmp-2
- Perfil del autor en Hugging Face: https://huggingface.co/zwc2003
- Listado de modelos del autor: https://huggingface.co/zwc2003/models
- `DriveMA-2B`, modelo VLA del mismo autor: https://featherless.ai/models/zwc2003/DriveMA-2B
- Paper, blog o demo especificos de este repositorio: no disponible en la informacion proporcionada.
