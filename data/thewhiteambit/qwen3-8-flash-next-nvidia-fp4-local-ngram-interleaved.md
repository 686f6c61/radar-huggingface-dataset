# thewhiteambit/Qwen3.8-Flash-Next-nvidia-FP4-Local-ngram-interleaved

## Resumen

Este repositorio, publicado por el usuario thewhiteambit, no es un modelo de lenguaje en si mismo, sino un repositorio auxiliar derivado de nvidia/Qwen3.8-Flash-Next-FP4-Local. Contiene un unico archivo safetensors de 28,8 GB que reorganiza la tabla de embeddings n-gram del checkpoint base de NVIDIA: cada fila de 80 bytes de valores FP4 empaquetados (E2M1) lleva directamente detras sus 10 bytes de block scales en E4M3, en lugar de tenerlas en un tensor separado como en el checkpoint original. Los valores son bit-identicos a los originales; solo cambia su colocacion en el archivo.

La relevancia de este reempaquetado es puramente de ingenieria de inferencia: Qwen3.8-Flash-Next consulta 16 filas de su tabla n-gram (una por cabeza, sobre una tabla de 320 millones de filas y unos 27 GB) por cada token generado. En el checkpoint original eso supone 32 lecturas aleatorias por token (16 filas mas 16 filas de escalas); con este layout, son 16 lecturas, la mitad de I/O por token con el mismo tamano en disco. Esto beneficia sobre todo a despliegues donde la tabla se sirve desde SSD en lugar de RAM, discos lentos (SATA, NVMe de portatil) y configuraciones de decodificacion especulativa con ventanas de verificacion completas. El repositorio no esta afiliado a NVIDIA, Qwen ni Alibaba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: repositorio auxiliar con la tabla n-gram de Qwen3.8-Flash-Next (modelo base no documentado aqui) |
| Parametros totales | No disponible (tabla n-gram de 320.001.536 filas de 90 bytes, ~28,8 GB) |
| Parametros activos | No aplica (no es un modelo MoE independiente) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4: valores E2M1 empaquetados con block scales E4M3 (uno por 16 valores) y escala global F32 |
| Idiomas soportados | No disponibles |
| Licencia | NVIDIA Open Model Agreement (modelo base sujeto ademas a Qwen Community License 1.0) |
| Formato de pesos | Safetensors (un unico archivo de 28.800.159.484 bytes) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenable ni pesos nuevos: es una reorganizacion de datos existentes. El archivo `model-ngram-interleaved.safetensors` contiene la tabla de embeddings n-gram de la capa 1 del modelo base (`ple_embedding.ngram_embedding`), dividida en 128 shards que concatenados forman la tabla de 320.001.536 filas sobre la que indexa el hash. Cada fila de 90 bytes combina 80 bytes de valores E2M1 (dos por byte, nibble bajo primero) y 10 escalas E4M3 (una por bloque de 16 valores); el decodificado es `e2m1(v) × e4m3(scale[v/16]) × weight_scale_2`. Ademas incluye la escala global (F32), los multiplicadores hash (3 enteros de 64 bits), los modulos primos de cada una de las 16 cabezas y los offsets de cada region de cabeza.

No hay entrenamiento, datos de entrenamiento ni RLHF/DPO asociados a este repositorio: los valores son bit-identicos al checkpoint original de NVIDIA. La unica "innovacion" es de layout de almacenamiento: al intercalar las escalas con sus filas se reduce el numero de lecturas aleatorias por token de 32 a 16. Las filas no estan rellenadas (padding), por lo que aproximadamente el 2,2% de ellas cruza fronteras de bloques de 4 KB y requiere una lectura de 8 KB en lugar de una de 4 KB; el autor considera este coste menor frente a la reduccion a la mitad del numero de peticiones al disco.

## Capacidades

Al no ser un modelo, las capacidades de inferencia son las del checkpoint base, no de este repositorio:

- Tabla n-gram lista para usar en la capa de per-layer embedding (PLE) de Qwen3.8-Flash-Next, con 16 cabezas que consultan 16 filas por token.
- Compatibilidad bit-exacta con el checkpoint base: los tensores conservan los nombres originales.
- Permite omitir la descarga de los shards 16 a 21 del checkpoint base (25,6 GB) si el cargador acepta la tabla desde este archivo.
- Scripts de PowerShell incluidos para reconstruir y verificar el archivo (comparacion byte a byte y SHA-256).
- No hay capacidades de texto, codigo, vision, tool calling ni agentes asociadas a este repositorio: no disponibles en la informacion proporcionada.

## Casos de uso

- Servir la tabla n-gram desde SSD en lugar de RAM: al reducir de 32 a 16 las lecturas aleatorias por token, este layout reduce a la mitad la I/O en despliegues donde la tabla de 27 GB no cabe en memoria, por ejemplo en estaciones de trabajo con NVMe y RAM limitada.
- Inferencia en discos lentos: en unidades SATA o NVMe de portatil, donde la latencia por lectura aleatoria domina, la reduccion de peticiones al disco se traduce directamente en menor latencia por token.
- Decodificacion especulativa con n-gram: cuando hay que recuperar una ventana completa de verificacion antes de que se ejecute la capa n-gram, la mitad de lecturas por token reduce el cuello de botella de I/O del proceso de verificacion.
- Descarga selectiva del checkpoint base: combinando este archivo con un cargador compatible, se pueden omitir los shards 16-21 del modelo base (25,6 GB), ahorrando ancho de banda y espacio en disco.
- Verificacion de integridad en pipelines de despliegue: el checksum SHA-256 publicado y el script de verificacion byte a byte permiten validar el archivo de forma automatizada antes de servirlo.
- Reproduccion del layout en otros lenguajes: la documentacion del formato (shapes, dtypes, orden de shards, esquema de decodificado) es lo bastante completa para reimplementar el empaquetado y la lectura en cualquier lenguaje, util para integrarlo en runtimes propios como llama.cpp o vLLM modificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica medida de rendimiento relevante es estructural: 32 lecturas aleatorias por token en el layout original frente a 16 en este, y un incremento de tamano del 0% respecto al original (el padding a 45 filas por bloque de 4 KB, que evitaria los cruces de frontera, anadiria un 1,1% de tamano y se descarto).

## Requisitos de hardware

- Espacio en disco: 28,8 GB para el archivo de la tabla, mas los demas archivos del checkpoint base (el shard 15 y los 14 anteriores siguen siendo necesarios por los pesos).
- RAM: la tabla esta pensada para poder servirse desde SSD; si se carga completa en RAM se necesitan al menos 28,8 GB adicionales dedicados a la tabla, mas la memoria del resto del modelo (no disponible el total).
- GPU: no disponible en la informacion proporcionada; el modelo base es un checkpoint FP4 de NVIDIA, tipicamente orientado a hardware con soporte de FP4 (por ejemplo GPUs RTX Blackwell), pero no hay datos concretos.
- Consumer GPU: no disponible; no hay datos de VRAM estimada ni de compatibilidad concreta.
- Despliegue: requiere un cargador que acepte la tabla n-gram desde este archivo con el layout intercalado; no hay evidencia de soporte nativo en vLLM, llama.cpp, Ollama o TGI (no disponible). Los scripts incluidos son de PowerShell, orientados a entornos Windows.
- Latencia y throughput: no disponibles; solo se conoce la reduccion a la mitad de lecturas aleatorias por token respecto al checkpoint original.

## Comparativa con modelos similares

Al tratarse de un reempaquetado de datos y no de un modelo, la comparativa pertinente es con el checkpoint base del que deriva:

| Aspecto | thewhiteambit/Qwen3.8-Flash-Next-nvidia-FP4-Local-ngram-interleaved | nvidia/Qwen3.8-Flash-Next-FP4-Local |
|---|---|---|
| Tipo | Tabla n-gram reempaquetada (archivo auxiliar) | Checkpoint completo del modelo |
| Tamano del archivo de tabla | 28,8 GB (un archivo) | ~27 GB repartidos en shards 16-21 (25,6 GB) mas parte del shard 15 |
| Lecturas aleatorias por token (tabla n-gram) | 16 | 32 |
| Valores | Bit-identicos al original | Original |
| Formato | Safetensors con escalas intercaladas por fila | Safetensors con escalas en tensor separado |
| Licencia | NVIDIA Open Model Agreement + Qwen Community License 1.0 | NVIDIA Open Model Agreement + Qwen Community License 1.0 |

Alternativas de otros reempaquetados o variantes de la tabla: no disponible.

## Limitaciones y advertencias

- No es un modelo: no genera texto por si solo y requiere el checkpoint base completo (excepto los shards 16-21) y un cargador que entienda el layout intercalado; los runtimes estandar no lo soportan de serie (no disponible evidencia de soporte).
- Aproximadamente el 2,2% de las filas cruza fronteras de bloques de 4 KB y exige una lectura de 8 KB en lectores sin buffering; el layout no esta rellenado por decision del autor.
- Sesgos, riesgo de alucinacion y limitaciones de idioma: heredados del modelo base Qwen3.8-Flash-Next; no disponibles datos concretos en la informacion proporcionada.
- Licencia: el uso esta regido por el NVIDIA Open Model Agreement, y el modelo base por la Qwen Community License 1.0; conviene revisar ambas antes de uso comercial, ya que imponen condiciones adicionales a licencias totalmente permisivas.
- El repositorio no esta afiliado a NVIDIA, Qwen ni Alibaba: es un trabajo comunitario sin respaldo oficial, con 0 descargas registradas en el momento de la ficha, por lo que conviene verificar el checksum SHA-256 publicado (`d7d218347f39a8d499e11bd3ac2e538ca69f3a4ec04fdda3f298c46e63a02a80`) antes de usarlo en produccion.
- Los scripts de reconstruccion y verificacion son de PowerShell, lo que limita su uso directo fuera de Windows, aunque el formato esta documentado para reimplementacion en cualquier lenguaje.

## Enlaces

- Repositorio: https://huggingface.co/thewhiteambit/Qwen3.8-Flash-Next-nvidia-FP4-Local-ngram-interleaved
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Qwen Community License 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Paper, demo o blog: no disponibles
