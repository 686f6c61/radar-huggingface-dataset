# zichenshang/GLM-5.2-colibri-int4

## Resumen

GLM-5.2-colibri-int4 es un contenedor de pesos preconvertidos para el motor de inferencia colibrì, un runtime escrito en C puro que permite ejecutar el modelo GLM-5.2 (un MoE de 744B parámetros desarrollado por zai-org) en una maquina de consumo con unos 25 GB de RAM, transmitiendo los expertos enrutados desde disco. El repositorio lo publica el usuario zichenshang y es una derivacion cuantizada a int4 del checkpoint oficial zai-org/GLM-5.2-FP8, con licencia MIT.

El problema que resuelve es puramente operativo: el checkpoint original en FP8 ocupa 756 GB y su conversion requiere descargarlo entero y ejecutar el conversor durante horas. Este repositorio distribuye el resultado ya convertido (378,9 GB) con cuantizacion bit-identica a la de los kernels en C del motor, de modo que el usuario solo necesita descargar los pesos y arrancar el binario. No es un formato estandar: no es GGUF, AWQ, GPTQ ni MLX, y solo funciona con colibrì.

La relevancia actual es la del denominado expert streaming: en lugar de comprimir el modelo entero para que quepa en memoria, se mantienen en RAM los pesos densos (atencion/MLA, expertos compartidos y embeddings) y se leen del NVMe los 21.504 expertos enrutados bajo demanda. Esto abre la ejecucion de modelos MoE de escala frontera en hardware sin GPU, a cambio de un coste de latencia ligado al almacenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atencion MLA (tag del repositorio: glm_moe_dsa); router y normas en F32 |
| Parametros totales | 744B (cifra indicada en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con escalas F32 por fila (ebits 4, io-bits 8); pesos densos, expertos enrutados y cabeza MTP en int4; checkpoint base en FP8 e4m3 con escalas de bloque 128x128 |
| Idiomas soportados | en, zh |
| Licencia | MIT (la derivada y el modelo base zai-org/GLM-5.2-FP8) |
| Formato de pesos | Contenedor propietario de colibrì en shards safetensors (`out-*.safetensors`): tensor U8 con nibbles int4 empaquetados mas tensor `.qs` de escalas F32 por fila; no compatible con GGUF, AWQ, GPTQ ni MLX |

## Arquitectura y entrenamiento

GLM-5.2 es un modelo de mezcla de expertos (MoE) de 744B parametros segun la propia model card. La informacion disponible no detalla el numero de capas, la dimension oculta, el numero de expertos activados por token ni el presupuesto de tokens de entrenamiento. Lo que si se deduce del contenedor es la estructura del despliegue: hay 21.504 expertos enrutados, pesos densos correspondientes a atencion (descrita como MLA en la descripcion de los ficheros), expertos compartidos y embeddings, y el router junto con las capas de normalizacion se mantienen en F32 para no degradar la seleccion de expertos. El tag `glm_moe_dsa` del repositorio sugiere un esquema de atencion dispersa en la variante MoE, aunque no se aporta documentacion adicional al respecto.

La innovacion tecnica destacable del contenedor es la inclusion de la cabeza de prediccion multi-token (MTP, capa 78) del modelo original, que habilita decodificacion especulativa nativa sin perdida a razon de aproximadamente 2 tokens por forward. La conversion sigue la ruta FP8 (e4m3 con escalas de bloque 128x128) a f32 y de ahi a int4 mediante `np.rint`, replicando el redondeo `lrintf` de los kernels en C del motor, de forma que el resultado es identico a token respecto a convertir localmente. No se dispone de informacion sobre el proceso de entrenamiento del modelo base (composicion del dataset, RLHF, DPO u otras etapas de alineamiento).

## Capacidades

- Generacion de texto y razonamiento general en ingles y chino, heredadas del modelo base.
- Decodificacion especulativa nativa mediante la cabeza MTP incluida en el contenedor (aproximadamente 2 tokens por forward).
- Ejecucion de un MoE de 744B en CPU con streaming de expertos desde NVMe, sin necesidad de GPU.
- Carga de pesos densos en RAM y lectura bajo demanda de los 21.504 expertos enrutados.
- Compatibilidad con el modo chat del motor colibrì (`coli chat`), que autodetecta el presupuesto de RAM, la cache de expertos y el uso de MTP.
- No se dispone de informacion sobre soporte de tool calling, function calling, uso de agentes, vision, audio ni otras capacidades multimodales del modelo base en la documentacion proporcionada.

## Casos de uso

- Ejecucion de un MoE de escala frontera en una estacion de trabajo sin GPU: el contenedor permite cargar los pesos densos en RAM y servir el resto desde un NVMe local, con lo que un equipo con 16-32 GB de RAM puede operar el modelo en lugar de depender de un cluster con aceleradores.
- Investigacion en tecnicas de expert streaming: al incluir 21.504 expertos enrutados en un formato propio con escalas por fila, el repositorio sirve como banco de pruebas para medir el impacto de la cache de expertos y del ancho de banda de disco en la latencia.
- Evaluacion de cuantizacion int4 frente a FP8: al mantener la ruta de conversion bit-identica a los kernels del motor, permite comparar la perdida de calidad del int4 frente al checkpoint FP8 sin ruido introducido por el conversor.
- Experimentacion con decodificacion especulativa en CPU: la cabeza MTP incluida posibilita estudiar la ganancia de throughput de la decodificacion especulativa nativa en un escenario limitado por disco.
- Procesamiento por lotes offline de textos en ingles y chino: tareas de resumen, clasificacion o extraccion donde la latencia por token no es critica y prima disponer de un modelo grande sin coste de GPU.
- Generacion de contenido y asistentes de redaccion bilingues: el modelo cubre en y zh, adecuado para equipos que trabajan con documentacion tecnica en ambos idiomas y quieren ejecutar la inferencia en local.
- Docencia y formacion en sistemas de inferencia: sirve como ejemplo real de despliegue de un contenedor no estandar (frente a GGUF) y de los compromisos entre RAM, almacenamiento y velocidad.
- Reproducibilidad de artefactos cuantizados: al publicarse el resultado del conversor oficial sin modificar sobre un modelo base MIT, se puede auditar la cadena FP8 -> f32 -> int4 en un pipeline reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo base ni para esta cuantizacion. Los resultados de la busqueda web proporcionada no guardan relacion con el modelo (corresponden a plataformas CMS), por lo que no aportan datos de rendimiento.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el diseno del motor es de inferencia en CPU con streaming de expertos desde disco.
- RAM: minimo 16 GB indicado por el autor; el escenario de referencia descrito en la model card es de aproximadamente 25 GB de RAM.
- Almacenamiento: alrededor de 400 GB libres en NVMe, en disco local (se indica explicitamente que no debe usarse un montaje de red ni 9p).
- CPU: se requiere soporte AVX2 y compilador gcc con OpenMP.
- Sistema operativo: Linux o WSL2.
- GPU recomendadas: no disponible; el contenedor no esta pensado para aceleracion por GPU y no se documenta compatibilidad con A100, H100 ni RTX 4090.
- Encaje en GPU de consumo: no aplica por diseno, ya que la ejecucion es en CPU con pesos transmitidos desde disco.
- Opciones de despliegue: unicamente el motor colibrì (repositorio JustVugg/colibri, script `c/setup.sh` y comando `coli chat`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible. El rendimiento dependera del ancho de banda del NVMe, del tamano de la cache de expertos y de la RAM disponible, factores que la model card no cuantifica.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano en disco | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| zichenshang/GLM-5.2-colibri-int4 | 744B (MoE) | Contenedor colibrì int4 con escalas F32 | 378,9 GB | MIT | Solo motor colibrì; CPU con expert streaming |
| zai-org/GLM-5.2-FP8 (modelo base) | 744B (MoE) | FP8 e4m3 con escalas de bloque 128x128 | 756 GB | MIT | Requiere conversion previa para colibrì u otro runtime compatible con FP8 |
| Otras cuantizaciones de GLM-5.2 (GGUF, AWQ, GPTQ, MLX) | no disponible | no disponible | no disponible | no disponible | La model card indica explicitamente que este contenedor no es ninguno de esos formatos; no se aportan referencias a alternativas equivalentes |

No se dispone de informacion sobre otros contenedores colibrì comparables ni sobre el rendimiento relativo frente a cuantizaciones estandar del mismo modelo base.

## Limitaciones y advertencias

- Formato no estandar: no es GGUF, AWQ, GPTQ ni MLX. Solo funciona con el motor colibrì, lo que descarta su uso en el ecosistema habitual de inferencia (vLLM, llama.cpp, Ollama, TGI).
- Dependencia de disco: el rendimiento queda condicionado por el ancho de banda del NVMe; el autor advierte explicitamente de no usar montajes de red o 9p.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, por lo que no hay validacion comunitaria de la conversion ni del funcionamiento del artefacto.
- Discrepancia en el identificador: la model card muestra el comando `hf download jlnsrk/GLM-5.2-colibri-int4`, mientras que el repositorio consultado es `zichenshang/GLM-5.2-colibri-int4`. Conviene verificar cual es el origen canonico antes de descargar 378,9 GB.
- Cobertura linguistica limitada a ingles y chino; no se declara soporte de castellano ni de otras lenguas.
- Longitud de contexto y parametros activos no documentados, lo que impide estimar con precision la memoria y la latencia por token.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni tasas de alucinacion para el modelo base ni para esta cuantizacion; debe asumirse el riesgo habitual de un modelo generativo sin datos de validacion.
- Sesgos conocidos: no disponible. No hay informacion sobre sesgos de genero, raza, idioma o dominio en la documentacion proporcionada.
- Licencia: tanto el modelo base como esta derivada se distribuyen bajo MIT, lo que en principio permite uso comercial, pero la licencia cubre el artefacto y no exime de cumplir las condiciones del modelo base original.
- Documentacion incompleta: no se detallan datos de entrenamiento, composicion del dataset, etapas de alineamiento ni benchmarks, lo que limita cualquier evaluacion de calidad previa a su adopcion en produccion.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/zichenshang/GLM-5.2-colibri-int4
- Modelo base: https://huggingface.co/zai-org/GLM-5.2-FP8
- Motor colibrì (GitHub): https://github.com/JustVugg/colibri
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a plataformas CMS (formcms, Squidex, mix.core, Umbraco, Orchard Core) y no guardan relacion con el modelo.
