# zhou-lab/methscope

## Resumen

MethScope es una colección de modelos preentrenados publicada por zhou-lab para **methscope-cli**, una herramienta de línea de comandos orientada al análisis ultrarrápido de metilomas de ADN dispersos mediante codificación MRMP (*Most Recurrent Methylation Pattern*). No se trata de un modelo de lenguaje ni de un transformer generativo: son artefactos de aprendizaje automático especializados en datos de metilación de ADN (WGBS y single-cell), empaquetados como bundles binarios autocontenidos.

Cada fichero del repositorio corresponde a uno de tres tipos de artefacto: un clasificador (`.clfx`), un decodificador de upscaling o imputación (`.updecx`) o una referencia de deconvolución (`.msdref`). Cada bundle incorpora su propia definición de características, de modo que una consulta en formato `.cg` se puede ejecutar directamente contra él sin pasos intermedios de ingeniería de características. La distribución cubre genomas humano (hg38) y ratón (mm10), y se gestiona mediante `methscope fetch`, que verifica cada fichero contra un digest SHA-256 compilado en el binario.

La relevancia actual del repositorio es doble. Por un lado, aborda dos problemas clásicos de la epigenómica computacional: la esparsidad extrema de los datos de metilación por célula única y la mezcla de señales en muestras bulk, para lo que ofrece imputación y deconvolución respectivamente. Por otro, su modelo de distribución es reproducible por diseño: las etiquetas (*tags*) son aditivas y nunca se mueven, y un binario antiguo sigue descargando exactamente la versión de los modelos con la que fue compilado. El repositorio ocupa 16,1 GB y se publica bajo licencia AGPL-3.0.

Conviene advertir de entrada que la model card es deliberadamente mínima: el propio autor indica que la tabla de modelos, la distinción entre clasificadores de banco y de árbol de enrutado, las referencias de deconvolución y la regla sin parámetros `--framework violation` se mantienen en la documentación de methscope-cli, no en HuggingFace. En consecuencia, la mayoría de los metadatos técnicos solicitados en esta ficha (recuento de parámetros, arquitectura interna, precisión, requisitos de hardware) no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura interna; no es un transformer de lenguaje, sino clasificadores y decodificadores sobre codificación MRMP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura de mezcla de expertos) |
| Longitud de contexto | no aplica (no es un modelo de secuencia lingüística); no disponible la longitud de ventana genómica por consulta |
| Tipos de cuantizacion | no disponible; los artefactos se distribuyen como bundles binarios propietarios (`.clfx`, `.updecx`, `.msdref`) |
| Idiomas soportados | no aplica; cobertura genómica declarada: humano (hg38) y ratón (mm10) |
| Licencia | AGPL-3.0 |
| Formato de pesos | bundles autocontenidos: `.clfx` (clasificador), `.updecx` (decodificador de upscaling), `.msdref` (referencia de deconvolución) |
| Autor | zhou-lab |
| Libreria | methscope |
| Tareas declaradas | dna-methylation, methylation, wgbs, single-cell, imputation, deconvolution, cell-type-annotation |
| Tamano del repositorio | 16,1 GB |
| Verificacion de integridad | digest SHA-256 compilado en el binario; `SHA256SUMS` por etiqueta |
| Fecha de creacion (segun HuggingFace) | 2026-07-24 |
| Fecha de actualizacion (segun HuggingFace) | 2026-09-12 |
| Descargas / likes en el momento de la consulta | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna de los bundles: no se especifica si son modelos lineales, arboles de decision, redes neuronales o clasificadores de otro tipo, ni se indica el numero de parametros, el volumen de datos de entrenamiento o la composicion del dataset. Lo unico documentado es la interfaz funcional: cada fichero es autocontenido y lleva su propia definicion de caracteristicas, de forma que una consulta `.cg` se ejecuta directamente. La documentacion de methscope-cli menciona al menos dos familias de clasificadores (de banco y de arbol de enrutado), ademas de una regla sin parametros `--framework violation`, pero su descripcion tecnica no esta incluida en la informacion disponible.

El rasgo tecnico diferencial declarado es la codificacion **MRMP (Most Recurrent Methylation Pattern)**, que actua como representacion de entrada para el analisis de metilomas dispersos y que da nombre al proyecto. No se aportan detalles sobre como se construye dicha codificacion, que procedimiento de entrenamiento se empleo (no se mencionan RLHF, DPO ni tecnicas equivalentes, que en cualquier caso serian ajenas a este dominio) ni que innovaciones adicionales incorpora el pipeline mas alla de la propia codificacion y de la verificacion por digest.

En el plano de la distribucion, si hay informacion concreta y verificable: `methscope fetch` resuelve modelos por ruta de genoma (`hg38/models`, `mm10/models`) o un fichero individual con `-c`, y comprueba cada descarga contra un digest compilado en el binario. Las etiquetas son aditivas y nunca se reescriben, y `methscope --version` imprime la etiqueta a la que esta anclado el binario, lo que garantiza que una version antigua siga obteniendo exactamente los modelos que documenta.

## Capacidades

- Anotacion de tipos celulares a partir de datos de metilacion de ADN (etiqueta `cell-type-annotation`), mediante clasificadores `.clfx`.
- Imputacion o upscaling de metilomas dispersos, tipicamente WGBS y datos de celula unica, mediante decodificadores `.updecx`.
- Deconvolucion de mezclas de metilacion bulk en fracciones por tipo celular, mediante referencias `.msdref`.
- Analisis de datos single-cell de metilacion, segun la etiqueta `single-cell` del repositorio.
- Codificacion MRMP de patrones de metilacion recurrentes como representacion de entrada comun a los distintos artefactos.
- Ejecucion directa de consultas en formato `.cg` contra un bundle, sin pasos previos de definicion de caracteristicas.
- Verificacion criptografica de integridad de cada modelo descargado (SHA-256) y versionado reproducible por etiquetas.
- Cobertura de dos genomas de referencia: humano (hg38) y raton (mm10).
- No aplica: generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, agentes, modo de pensamiento ni capacidades multilingues. La informacion proporcionada no atribuye ninguna de estas capacidades al modelo.

## Casos de uso

- Anotacion de tipos celulares en atlas de metilacion de celula unica: se ejecutaria un clasificador `.clfx` del genoma correspondiente sobre las consultas `.cg` derivadas del experimento para asignar cada celula a un tipo celular de referencia, aprovechando que el bundle incluye su propia definicion de caracteristicas y no requiere reentrenamiento.
- Imputacion de metilomas WGBS con cobertura escasa: el decodificador `.updecx` reconstruiria la senal de metilacion en regiones no cubiertas, lo que permite recuperar matrices mas completas antes de analisis downstream como clustering o deteccion de regiones diferencialmente metiladas.
- Deconvolucion de muestras bulk heterogeneas: con una referencia `.msdref` se estimarian las proporciones relativas de tipos celulares presentes en una muestra de tejido, un paso habitual en estudios de epigenetica del cancer o de composicion tisular.
- Control de calidad y trazabilidad en pipelines clinicos o de investigacion: el uso de `methscope fetch` con verificacion de digest y de `methscope --version` permite fijar exactamente la version de los modelos empleada en un analisis, requisito habitual para la reproducibilidad de resultados publicables.
- Reanalisis de cohortes historicas: al ser las etiquetas aditivas y no moverse, un analisis antiguo puede reproducirse con el mismo binario y los mismos modelos, evitando la deriva silenciosa que suele acompanar a la actualizacion de modelos en otros ecosistemas.
- Ejecucion en entornos sin GPU o en nodos de HPC: al distribuirse como CLI y no documentarse dependencia de aceleradores, el flujo encaja en clusters convencionales o en estaciones de trabajo, siempre que se disponga de espacio en disco para los bundles.
- Integracion como paso de linea de comandos en flujos de trabajo bioinformaticos (por ejemplo, encadenado con herramientas que produzcan ficheros `.cg`), con la salvedad de que la informacion disponible no documenta wrappers oficiales ni imagenes de contenedor.
- Punto de partida para desarrollos propios: los ficheros de prueba `.cg` publicos en `zhou-lab/methscope_data` permiten validar una instalacion y comprobar el comportamiento de los modelos antes de aplicarlos a datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de HuggingFace no incluye tablas de precision, sensibilidad, especificidad ni comparaciones cuantitativas, y remite explicitamente a la pestana Models de la documentacion de methscope-cli para conocer "que es cada modelo, como se construyo y con que precision cuenta". La unica afirmacion de rendimiento recogida es cualitativa: la herramienta se describe como de analisis "ultrarrapido" de metilomas dispersos, sin cifras asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La informacion proporcionada no documenta requisitos de GPU ni de memoria de video.
- GPU recomendadas: no disponible. No se menciona ninguna GPU concreta (A100, H100, RTX 4090 ni otras).
- Ejecucion en GPU de consumo: no disponible. No se documenta ni se descarta.
- Tipo de artefacto de despliegue: binario de linea de comandos (`methscope`), no un servidor de inferencia con pesos cargables por frameworks de deep learning.
- Opciones de despliegue documentadas: instalacion del CLI y descarga de modelos con `methscope fetch` (por genoma completo o fichero individual con `-c`).
- Frameworks de servido tipo vLLM, llama.cpp, Ollama o TGI: no aplican; no hay soporte documentado ni formatos de pesos compatibles.
- Almacenamiento: el repositorio completo ocupa 16,1 GB; el tamano individual de cada bundle no se detalla en la informacion disponible.
- Latencia y throughput: no disponible. El unico dato es la afirmacion cualitativa de analisis "ultrarrapido"; no se aportan tiempos por muestra ni consultas por segundo.

## Comparativa con modelos similares

La informacion proporcionada no incluye modelos alternativos ni resultados cuantitativos que permitan una comparacion. No es posible rellenar las columnas de parametros, contexto, rendimiento o disponibilidad con datos verificables, por lo que se indica "no disponible" en lugar de estimar valores.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|---|
| zhou-lab/methscope | Clasificacion, imputacion y deconvolucion de metilacion de ADN | no disponible | no disponible | AGPL-3.0 | HuggingFace (16,1 GB) + CLI en GitHub | no disponible |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la busqueda web asociada a esta consulta no devolvio resultados relacionados con el modelo (los enlaces recuperados corresponden a un servicio de television ajena al proyecto), de modo que no hay fuentes externas que aporten comparaciones.

## Limitaciones y advertencias

- Metadatos incompletos: la model card es minima por decision explicita del autor, de modo que arquitectura, parametros, datos de entrenamiento y precision no se pueden verificar desde HuggingFace. Cualquier evaluacion seria exige consultar la documentacion del CLI.
- Ausencia de benchmarks publicos: no hay metricas de rendimiento en la informacion disponible, lo que impide estimar la calidad de la anotacion, la imputacion o la deconvolucion antes de desplegarlas.
- Sesgos conocidos: no se documenta ningun analisis de sesgo. En este dominio, el sesgo relevante suele proceder de la composicion de los datos de referencia (tipos celulares, tejidos, poblaciones y plataformas sobrerrepresentados), pero no se aporta informacion sobre el dataset de entrenamiento ni sobre su cobertura.
- Riesgo de error en las predicciones: la imputacion y la deconvolucion son tareas de reconstruccion sobre datos intrinsecamente incompletos; la informacion disponible no cuantifica la incertidumbre ni los modos de fallo, por lo que no se recomienda su uso clinico sin validacion independiente.
- Limitaciones de cobertura: solo se declaran los genomas humano (hg38) y raton (mm10). No se mencionan otras especies, otras versiones de ensamblado ni otras plataformas de metilacion distintas de las cubiertas por los bundles publicados.
- Restricciones de licencia: AGPL-3.0 es una licencia copyleft fuerte; su uso como servicio en red obliga a poner a disposicion el codigo fuente correspondiente en los terminos de la licencia. Conviene revisar las implicaciones antes de integrarlo en productos propietarios o en servicios ofrecidos a terceros.
- Dependencia del binario correcto: los modelos estan anclados a etiquetas y digests concretos. Usar un `methscope` con una version distinta de la prevista puede impedir la descarga de los modelos documentados, aunque la verificacion por digest evita usar ficheros manipulados.
- Adopcion incipiente: en el momento de la consulta el repositorio registra 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Coherencia temporal de los metadatos: las fechas de creacion y actualizacion que reporta HuggingFace (2026) resultan anomales y no se corresponden con un historial verificable de publicaciones o citas.
- Ausencia de soporte de frameworks habituales: no hay formatos compatibles con vLLM, llama.cpp, Ollama o TGI, y no se documentan wrappers, imagenes de contenedor ni integraciones oficiales con motores de flujos de trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhou-lab/methscope
- Repositorio del CLI: https://github.com/zhou-lab/methscope-cli
- Documentacion de methscope-cli, pestana Models: https://zhou-lab.github.io/methscope-cli/#models
- Fixtures de consulta `.cg` y datos de prueba: https://github.com/zhou-lab/methscope_data
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
