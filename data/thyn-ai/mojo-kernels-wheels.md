# thyn-ai/mojo-kernels-wheels

## Resumen

`thyn-ai/mojo-kernels-wheels` no es un modelo de lenguaje: es un repositorio de distribucion en Hugging Face que actua como espejo anonimo de los wheels precompilados (manylinux x86_64) del proyecto `thyn-ai/mojo-kernels`. Cada wheel contiene un kernel nativo escrito en Mojo (el lenguaje de Modular) que reimplementa el bucle interno critico de una libreria Python popular —BM25, `cclib`, `croniter`, `motmetrics`, `nuscenes-devkit`, `obspy`, `oletools`, `pefile`, `pydicom`, `pykalman`, `ruptures`, `sacrebleu` y `volatility3`— manteniendo la misma API y los mismos resultados que la libreria original.

El interes del artefacto esta en su modelo de distribucion y en los numeros reportados: se anuncian aceleraciones de hasta 8.769x sobre `rank_bm25`, 2.607x sobre `volatility3` en el recorrido de colmenas del registro de Windows, 1.663x sobre el modulo `ipaddress` de la stdlib y 72x sobre `cclib` en una rejilla de funcion de onda de 50³ puntos, con paridad verificada mediante suites de test diferenciales (bit a bit o al ultimo ulp segun el kernel). Cada paquete incluye ademas un fallback en Python puro que se activa de forma automatica y silenciosa si el kernel nativo no puede cargarse, de modo que nunca se produce un error de importacion.

La relevancia practica es doble. Por un lado, permite sustituir cuellos de botella de CPU en pipelines cientificos y de seguridad sin cambiar el codigo de llamada. Por otro, evita la dependencia del toolchain de Mojo en la maquina de instalacion, ya que el runtime va vendorizado dentro del wheel. El repositorio declara licencia Apache 2.0, 0 descargas y 0 likes en el momento de la consulta, y esta vinculado a la demo Algenta Speed Arena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal. Kernels nativos compilados en Mojo (runtime vendorizado, reparado con `auditwheel`) mas fallback en Python puro, empaquetados como wheels de Python |
| Parametros totales | No aplica (no es un modelo de aprendizaje automatico; no hay pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | No disponible en la metadata del repositorio (los paquetes no procesan lenguaje natural, salvo `sacrebleu_mojo` como metrica) |
| Licencia | apache-2.0 |
| Formato de pesos | No aplica. Formato de distribucion: wheels `.whl` (`py3-none-manylinux`, x86_64 / Linux), version 0.1.2 |
| Numero de paquetes publicados en la tabla de instalacion | 13 (`bm25_mojo`, `cclib_mojo`, `croniter_mojo`, `motmetrics_mojo`, `nuscenes_eval_mojo`, `obspy_mojo`, `oletools_mojo`, `pefile_mojo`, `pydicom_mojo`, `pykalman_mojo`, `ruptures_mojo`, `sacrebleu_mojo`, `vol_mojo`) |
| Kernels adicionales citados en benchmarks | 2 mas sin entrada en la tabla de instalacion: `fuse-mojo` (TypeScript, sobre Fuse.js) e `ipaddress_mojo` (stdlib `ipaddress`) |
| Version del wheel | 0.1.2 |
| Etiqueta de release en GitHub | `arena-wheels-v0.1.0` |
| Plataformas soportadas | Linux x86_64 (muchos wheels etiquetados `manylinux_2_35_x86_64`; variantes `manylinux_2_38`, `manylinux_2_5`, `manylinux1`) |
| Libreria declarada en Hugging Face | `kernels` |
| Tareas (pipeline) | No disponible |
| Tamano del repositorio | 0.0 GB segun la metadata de Hugging Face |
| Fecha de creacion (metadata) | 2026-09-21T13:09:51.000Z |
| Fecha de actualizacion (metadata) | 2026-09-21T13:12:36.000Z |

## Arquitectura y entrenamiento

El proyecto no entrena ningun modelo. Lo que hace es reimplementar en Mojo, partiendo de cero (clean-room), los bucles internos criticos de librerias Python existentes, y distribuirlos como extensiones nativas con la misma superficie de API. Tecnicamente, cada wheel contiene dos rutas de ejecucion: el kernel Mojo compilado con su runtime vendorizado, y una implementacion en Python puro del mismo API. La seleccion de ruta es automatica: si la biblioteca nativa no se puede cargar (por ejemplo, en Windows, donde no hay toolchain de Mojo, o en plataformas sin wheel nativo), el paquete cae al camino Python sin lanzar `ImportError`, lo que garantiza correccion silenciosa a costa de rendimiento. La integridad de los artefactos se verifica contra `sha256sums.txt`, cuyos hashes son identicos a la tabla de contenidos del release en GitHub.

La garantia de equivalencia funcional no se basa en inspeccion manual sino en suites de test diferenciales: se ejecutan las mismas entradas por el backend nativo y por la libreria original y se comprueba la paridad con un criterio declarado por kernel (bit-exacta o hasta el ultimo ulp). Los benchmarks publicados se miden con la mediana de 5 ejecuciones y con la puerta de correccion verificada antes de cada pasada de cronometraje, reproducible mediante `pixi run bench*`. No hay datos sobre regimen de entrenamiento, composicion de dataset, RLHF ni DPO porque no aplican a este artefacto. Tampoco se especifica en la informacion disponible que version del lenguaje Mojo ni que version del runtime de Modular se vendoriza en los wheels 0.1.2.

## Capacidades

- Aceleracion drop-in de recuperacion documental: `bm25_mojo` sustituye a `rank_bm25` y `bm25s` en el calculo de puntuaciones BM25 con la misma API.
- Quimica computacional: `cclib_mojo` acelera la generacion de rejillas de densidad electronica (`gaussgrid`) de `cclib`.
- Forense de memoria: `vol_mojo` acelera el escaneo de colmenas (hive) y pools de `volatility3`.
- Metrologia de deteccion de objetos: `motmetrics_mojo` para metricas del MOT Challenge y `nuscenes_eval_mojo` para `DetectionEval` de `nuscenes-devkit`.
- Imagen medica: `pydicom_mojo` implementa el codec RLE de `pydicom`.
- Sismologia: `obspy_mojo` acelera el suavizado Konno-Ohmachi de ObsPy.
- Analisis de malware y formatos binarios: `oletools_mojo` (descompresion de VBA) y `pefile_mojo` (calculo de checksum en ejecutables PE).
- Series temporales y deteccion de cambios: `pykalman_mojo` (filtros de Kalman) y `ruptures_mojo` (change-point detection).
- Evaluacion de traduccion automatica: `sacrebleu_mojo` para el calculo de metricas de `sacrebleu`.
- Programacion de tareas: `croniter_mojo` para iteracion de expresiones cron.
- Redes: `ipaddress_mojo` para operaciones sobre direcciones IP (citado en benchmarks).
- Busqueda difusa: `fuse-mojo` en TypeScript sobre Fuse.js, con paridad bit-identica declarada.
- Compatibilidad silenciosa: fallback automatico a Python puro en plataformas sin binario nativo, incluido Windows, ejercitado en CI.
- No dispone de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: no es un modelo generativo.

## Casos de uso

- Recuperacion aumentada (RAG) y busqueda corporativa: sustituir `rank_bm25` por `bm25_mojo` manteniendo la API permite indexar y puntuar corpus de entre 1.000 y 100.000 documentos con aceleraciones declaradas de 116x a 8.769x, lo que reduce el tiempo de scoring en pipelines de recuperacion que hoy limitan por CPU.
- Evaluacion de traduccion automatica en integracion continua: `sacrebleu_mojo` puede integrarse en el pipeline de CI para recalcular BLEU sobre cada candidato de traduccion sin que la metrica sea el cuello de botella del job.
- Analisis forense de volcados de memoria: `vol_mojo` sobre `volatility3` permite recorrer colmenas del registro con una aceleracion declarada de 2.607x, lo que hace viable analizar imagenes de memoria grandes en plazos de respuesta a incidentes.
- Triaje de malware en produccion: `oletools_mojo` y `pefile_mojo` aceleran la descompresion de macros VBA y el checksum de ejecutables PE, adecuados para escanear lotes masivos de muestras en una canalizacion de analisis automatico.
- Validacion de modelos de conduccion autonoma: `nuscenes_eval_mojo` y `motmetrics_mojo` aceleran el calculo de `DetectionEval` y de las metricas del MOT Challenge, de modo que los equipos pueden reevaluar checkpoints con mas frecuencia dentro del mismo presupuesto de computo.
- Procesado de imagenes DICOM: `pydicom_mojo` acelera la decodificacion del codec RLE, util en visores y pipelines de preprocesado de imagen medica donde la descompresion se repite en cada estudio.
- Quimica cuantica y modelado molecular: `cclib_mojo` sobre rejillas de funcion de onda de 50³ puntos, con un rango declarado de 72x a 7.033x, permite iterar sobre calculos de densidad electronica que antes eran prohibitivos en CPU.
- Monitorizacion sismica: `obspy_mojo` acelera el suavizado Konno-Ohmachi de ObsPy, lo que agiliza el analisis espectral de senales en estaciones que procesan flujos continuos.
- Deteccion de cambios y filtrado de senales: `ruptures_mojo` y `pykalman_mojo` para segmentacion de series temporales y filtrado de Kalman en pipelines industriales o financieros.
- Orquestacion de tareas programadas: `croniter_mojo` acelera la iteracion de expresiones cron en planificadores que calculan proximas ejecuciones de forma masiva.

## Benchmarks y rendimiento

Resultados declarados en los README por paquete y el changelog de `thyn-ai/mojo-kernels` (mediana de 5 ejecuciones, con la puerta de correccion verificada antes de cada pasada de cronometraje):

| Kernel | Libreria sustituida | Aceleracion medida | Paridad |
|---|---|---:|---|
| `bm25_mojo` | `rank_bm25` / `bm25s` | 8.769x en el pico (rango 116x–8.769x en corpus de 1.000 a 100.000 documentos) | Diferencia absoluta maxima 3,6e-15 |
| `fuse-mojo` (TypeScript) | Fuse.js (busqueda difusa) | 38,7x en regimen caliente (rango 8,8x–38,7x) | Bit-identica (0 de diferencia) |
| `cclib_mojo` | `cclib` (backend mas rapido) | 72x en una rejilla de funcion de onda de un solo MO de 50³ (rango 72x–7.033x) | Diferencia absoluta maxima 1,5e-12 |
| `vol_mojo` | `volatility3` | 2.607x en recorrido de colmena (hive walk) | Verificada con test diferencial |
| `ipaddress_mojo` | `ipaddress` de la stdlib | 1.663x (en 10.000 direcciones; dato truncado en la fuente) | No disponible |

No se han publicado en la informacion disponible resultados de benchmark para `croniter_mojo`, `motmetrics_mojo`, `nuscenes_eval_mojo`, `obspy_mojo`, `oletools_mojo`, `pefile_mojo`, `pydicom_mojo`, `pykalman_mojo`, `ruptures_mojo` ni `sacrebleu_mojo`; estos se describen como verificados con test diferencial, sin cifra publica.

## Requisitos de hardware

- VRAM: no aplica. Los kernels se ejecutan en CPU; no hay ruta GPU documentada.
- GPU recomendadas: ninguna. No se menciona soporte CUDA, ROCm ni Metal.
- CPU y sistema operativo: Linux x86_64. Los wheels estan etiquetados `manylinux_2_35_x86_64` (con variantes `manylinux_2_38`, `manylinux_2_5` y `manylinux1` para `pydicom_mojo`).
- Equipo de consumo: si, cualquier maquina Linux x86_64 con Python 3 (los wheels son `py3-none`). No se requiere toolchain de Mojo ni compilador en la maquina de instalacion.
- Windows y otras plataformas: sin wheel nativo; el paquete cae automaticamente al fallback en Python puro. Alternativa: compilar desde el repositorio `mojo-kernels`.
- Memoria RAM: no especificada. Depende del tamano del corpus o del fichero procesado (por ejemplo, el benchmark de BM25 cubre de 1.000 a 100.000 documentos).
- Opciones de despliegue: instalacion por URL directa de wheel (`pip install https://huggingface.co/.../archivo.whl`). El proyecto usa `pixi` para reproduccion de benchmarks (`pixi run bench*`). Hugging Face no actua como indice PEP 503, por lo que `pip install bm25-mojo` no resuelve contra este repositorio.
- Latencia y throughput absolutos: no disponibles. Solo se publican cocientes de aceleracion respecto a la libreria original.

## Comparativa con modelos similares

No se trata de un modelo, sino de una capa de aceleracion por kernel. La comparacion relevante es frente a otras estrategias de extension nativa para Python:

| Alternativa | Enfoque | Lenguaje / runtime | Aceleraciones publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `thyn-ai/mojo-kernels-wheels` | Kernels clean-room con API identica y fallback Python | Mojo, runtime vendorizado en el wheel | 8.769x (`bm25`), 2.607x (`volatility3`), 1.663x (`ipaddress`), 72x (`cclib`), 38,7x (`Fuse.js`) | apache-2.0 | Wheels en Hugging Face y release `arena-wheels-v0.1.0` en GitHub; Linux x86_64 |
| Libreria original en Python puro (`rank_bm25`, `cclib`, `volatility3`, etc.) | Implementacion de referencia | Python | Referencia (1x) | No verificada en la informacion disponible para cada libreria | PyPI |
| Extensiones con Numba o Cython | Compilacion JIT o AOT de codigo Python | Numba / Cython | No disponible | No disponible | PyPI |
| Extensiones nativas en Rust con PyO3 | Reescritura en Rust del bucle critico | Rust | No disponible | No disponible | PyPI |

No se dispone de datos comparativos directos, medidos sobre el mismo hardware y el mismo dataset, entre `mojo-kernels` y las alternativas de Numba, Cython o Rust; las cifras publicadas solo comparan cada kernel Mojo con su incumbente Python concreto.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no admite prompts. Cualquier expectativa de uso como LLM es un error de categorizacion.
- La metadata de Hugging Face no declara idiomas ni tarea (`pipeline` no disponible); el repositorio es un espejo de artefactos binarios.
- Solo Linux x86_64. En otros sistemas no hay binario nativo y se activa el fallback en Python puro, lo que degrada el rendimiento hasta el de la libreria original sin avisar: el cambio de ruta es silencioso por diseno.
- Hugging Face no es un indice PEP 503: es obligatorio usar la URL exacta de cada wheel. `pip install bm25-mojo` no funcionara.
- Incoherencia de versiones entre el nombre del release de GitHub (`arena-wheels-v0.1.0`) y la version de los wheels publicados (0.1.2), lo que puede complicar la trazabilidad en produccion.
- Cobertura de benchmarks desigual: solo 5 kernels tienen cifra publicada; el resto se declara verificado con test diferencial sin numeros. Ademas, el dato de `ipaddress_mojo` aparece truncado en la fuente.
- Se declara paridad con la libreria original segun un criterio por kernel (bit-exacta o ultimo ulp). Para kernels donde la paridad no es bit-exacta (`bm25_mojo` con 3,6e-15 de diferencia absoluta maxima, `cclib_mojo` con 1,5e-12), no se documenta el impacto en resultados aguas abajo que sean sensibles a pequenas perturbaciones numericas.
- Ausencia de senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, y un release etiquetado como `arena-wheels`, lo que sugiere un estado experimental orientado a una competicion de velocidad mas que a un uso en produccion consolidado.
- No se especifican en la informacion disponible las versiones de la libreria incumbente contra las que se valido cada kernel; una actualizacion de la libreria original podria romper la equivalencia de resultados.
- Uso comercial: la licencia declarada es Apache 2.0, que en principio lo permite, pero la informacion proporcionada no incluye los terminos de las librerias sustituidas ni de la demo asociada; conviene revisarlos antes de un despliegue comercial.
- Los resultados de busqueda web asociados a esta consulta tratan sobre la planta del tomillo y no guardan ninguna relacion con el repositorio; se descartan como fuentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/thyn-ai/mojo-kernels-wheels
- Repositorio GitHub del proyecto: https://github.com/thyn-ai/mojo-kernels
- Release `arena-wheels-v0.1.0`: https://github.com/thyn-ai/mojo-kernels/releases/tag/arena-wheels-v0.1.0
- Fichero de hashes SHA-256: https://huggingface.co/thyn-ai/mojo-kernels-wheels/resolve/main/sha256sums.txt
- Demo Algenta Speed Arena: https://huggingface.co/spaces/thyn-ai/algenta-speed-arena
- Lenguaje Mojo (Modular): https://www.modular.com/mojo
