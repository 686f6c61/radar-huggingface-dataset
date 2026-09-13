# vectionlabs/Salience-27B-R6

## Resumen

Salience-27B-R6 es un modelo denso de 27.781.427.952 parametros (27,8B) de tipo vision-lenguaje, desarrollado por Vection Labs y publicado bajo licencia Apache-2.0. Se construye como un ajuste fino sobre Qwen/Qwen3.8-27B y anade un codificador de vision nativo, de modo que acepta texto, imagenes y video como entrada y genera texto. Su ventana de contexto alcanza 1.048.576 tokens mediante YaRN y Dual Chunk Attention, y usa una pila de atencion hibrida (lineal + completa, con atencion completa cada cuatro capas) mas una cabeza MTP para decodificacion autoespeculativa.

El objetivo declarado del modelo es el trabajo de ingenieria de software: escritura y depuracion de codigo real, ediciones a escala de repositorio, agencia multi-paso en terminal y razonamiento cuantitativo. La propiedad que define la familia es la "economia de razonamiento": el modelo decide cuanto deliberar en funcion de la dificultad de la tarea, en lugar de generar cadenas largas de forma sistematica. En la revision R6 esa economia se traslada a los pesos, no solo a la configuracion de inferencia, de manera que es el comportamiento por defecto. El parametro `reasoning_effort` permite forzar cadenas largas cuando se necesita.

La relevancia de esta revision esta en el contexto de uso agentico: en un bucle de cincuenta turnos, el tiempo hasta terminar la tarea pesa mas que la precision de un unico turno. Segun el autor, R6 prioriza cadenas mas cortas para la misma respuesta y una mayor tasa de aceptacion de tokens borrador del cabezal MTP, a cambio de quedar ligeramente por detras de R5 en benchmarks de conocimiento de opcion multiple saturados. El modelo tiene un volumen de adopcion bajo en el momento de redactar esta ficha (55 descargas, 9 likes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 dense (27B) + codificador de vision nativo; atencion hibrida lineal + completa (completa cada 4.ª capa) |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica: modelo denso, los 27,8B estan activos en cada token |
| Longitud de contexto | 1.048.576 tokens (YaRN + Dual Chunk Attention) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; los pesos se publican en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (nativo de `transformers`) |
| Modalidades | Texto, imagen y video como entrada; texto como salida |
| Precision de pesos | bfloat16 |
| Decodificacion | Cabeza MTP incluida (decodificacion autoespeculativa) |
| Clase de `transformers` | `AutoModelForImageTextToText` |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 55,6 GB |
| Fecha de creacion | 2026-09-06 |
| Ultima actualizacion | 2026-09-09 |

## Arquitectura y entrenamiento

Salience-27B-R6 es un transformer denso de 27,8B parametros derivado de Qwen3.8-27B, al que se incorpora un codificador de vision nativo. A diferencia de los niveles MoE de la misma familia, que activan unos pocos miles de millones de parametros por token mediante enrutamiento, este nivel ejecuta la totalidad de los 27,8B en cada token, lo que maximiza la capacidad efectiva por paso de un problema dificil y elimina los fallos de enrutamiento a expertos. La pila de atencion es hibrida: capas de atencion lineal combinadas con capas de atencion completa cada cuatro capas, una eleccion orientada a sostener el coste de la ventana de 1.048.576 tokens, que se extiende con YaRN y Dual Chunk Attention. Ademas, incluye una cabeza MTP (multi-token prediction) que habilita decodificacion autoespeculativa, compatible con llama.cpp, vLLM y SGLang segun la model card.

En cuanto a los datos de entrenamiento, la model card no especifica el numero de tokens, la composicion del dataset ni el pipeline de post-entrenamiento (RLHF, DPO u otros). La informacion disponible se limita a la descripcion funcional de los cambios de la revision R6: cadenas de razonamiento mas cortas hasta un punto de parada limpio, optimizacion de la tasa de aceptacion de tokens borrador del cabezal MTP (no solo del rendimiento bruto), y reconstruccion de la ruta de razonamiento que provocaba bucles no convergentes de autoverificacion cuando se apilaban dos restricciones de formato de salida en una misma instruccion (por ejemplo, pedir simultaneamente "sin prosa" y "sin markdown"). El autor indica expresamente que ninguno de estos cambios se ha medido contra una suite formal.

## Capacidades

- Generacion de texto y razonamiento con esfuerzo configurable mediante `reasoning_effort` (incluye el valor `xhigh` para cadenas largas cuando se necesita maxima deliberacion).
- Generacion, depuracion y edicion de codigo orientada a ingenieria de software real, incluidas ediciones a escala de repositorio.
- Agencia en terminal: planifica secuencias de comandos, comprueba el resultado de cada paso antes de continuar y recupera de fallos en lugar de repetirlos.
- Tool calling y function calling nativos, con salidas bien formadas segun el contrato de herramientas del modelo.
- Razonamiento multi-paso y flujos agenticos de larga duracion (bucles de decenas de turnos).
- Vision nativa: lectura de diagramas, capturas de interfaz, trazas de error y fotos de pizarra como entrada durante una tarea.
- Entrada de video ademas de imagen.
- Contexto largo de 1.048.576 tokens, pensado para pegar el repositorio completo y no solo un fragmento.
- Comportamiento directo con menor tasa de rechazo (etiqueta "uncensored" en el repositorio).
- Decodificacion autoespeculativa mediante cabeza MTP, que acelera la generacion en pilas compatibles.
- Multilingue: la model card solo declara ingles como idioma soportado.

## Casos de uso

- Mantenimiento de repositorios a gran escala: el modelo puede recibir el arbol de un repositorio completo dentro de la ventana de 1.048.576 tokens y proponer refactorizaciones o correcciones coherentes con el resto del codigo, sin fragmentar el contexto ni perder referencias cruzadas entre ficheros.
- Agente de terminal autonomo: con soporte nativo de tool calling y agencia por terminal, se puede desplegar como agente que ejecuta comandos, lee salidas, corrige errores y encadena pasos hasta completar una tarea de aprovisionamiento o diagnostico.
- Depuracion iterativa en pipelines de CI/CD: el modelo puede analizar trazas de error y fotogramas de consola o capturas, localizar la causa y generar un parche; su economia de razonamiento reduce el coste por turno cuando se integra en bucles de verificacion.
- Asistencia de ingenieria con entrada visual: interpretacion de diagramas de arquitectura, capturas de interfaz o fotos de pizarra para derivar tareas de implementacion, util en equipos que documentan diseno en formatos graficos.
- Revision de codigo automatizada en pull requests: con el contexto largo puede evaluar un diff junto con los modulos afectados y las convenciones del repositorio, y emitir comentarios con referencias a lineas concretas.
- Migraciones y actualizaciones de dependencias: el agente puede editar multiples ficheros de forma coordinada, ejecutar la suite de pruebas y reparar los fallos introducidos, aprovechando la recuperacion de errores en lugar de la repeticion.
- Razonamiento cuantitativo asistido por herramientas: calculo de metricas, analisis de resultados experimentales o verificacion de presupuestos de rendimiento, apoyandose en function calling para delegar los calculos exactos.
- Analisis de capturas en soporte tecnico de producto: lectura de pantallazos de error para generar diagnosticos y pasos de resolucion en ingles, con contexto largo para mantener el historial completo de la incidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El fichero `model-index` del repositorio declara una entrada para Salience-27B-R6 con la lista de resultados vacia, y la propia model card indica de forma explicita que los cambios de la revision R6 no se han medido contra una suite formal. El autor declara cualitativamente que R6 queda ligeramente por detras de R5 en benchmarks de conocimiento de opcion multiple saturados y por delante en tiempo hasta una respuesta terminada, pero no aporta cifras.

## Requisitos de hardware

Las estimaciones siguientes se derivan del numero de parametros y de la precision declarada; la model card no publica cifras de VRAM ni de latencia.

- Pesos en bfloat16: aproximadamente 55,6 GB (tamano del repositorio). La inferencia en esta precision requiere en la practica una GPU de 80 GB, como A100 80 GB o H100 80 GB, o reparto en varias GPU.
- Cuantizacion a 8 bits (estimacion): en torno a 28 GB de pesos, viable en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- Cuantizacion a 4 bits (estimacion): en torno a 14-16 GB de pesos; podria caber en GPU de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB). No cabe con holgura en tarjetas de 16 GB una vez anadida la cache KV.
- Cache KV a 1.048.576 tokens: no disponible. La pila de atencion hibrida (completa solo cada cuarta capa) reduce su coste frente a un transformer de atencion completa, pero el autor no publica cifras.
- GPU recomendadas: A100 80 GB o H100 80 GB para bfloat16; A100 40 GB o GPUs de 48 GB para 8 bits; RTX 4090/3090 para 4 bits.
- Opciones de despliegue mencionadas en la model card: `transformers` mediante `AutoModelForImageTextToText`, vLLM, SGLang y llama.cpp (los tres ultimos aprovechan la cabeza MTP para decodificacion autoespeculativa). No se mencionan Ollama ni TGI.
- Latencia y throughput: no disponible. El autor afirma que una mayor tasa de aceptacion de tokens borrador del cabezal MTP se traduce en velocidad de decodificacion, pero no aporta valores numericos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Salience-27B-R6 | 27,8B densos (todos activos) | 1.048.576 tokens | Texto, imagen, video → texto | Apache-2.0 | HuggingFace, `transformers` |
| Qwen/Qwen3.8-27B (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | HuggingFace |
| Salience-1.5-Pro (misma familia) | 35B-A3B (MoE) | No disponible | No disponible | No disponible | HuggingFace |
| Salience Flash (misma familia) | 30B-A3B (MoE, dato truncado en la model card) | No disponible | No disponible | No disponible | HuggingFace |

La comparacion cuantitativa con alternativas externas de la misma categoria (modelos densos de ~27B con vision y contexto largo) no esta disponible en la informacion proporcionada. La diferencia funcional declarada frente a los niveles MoE de la propia familia es que Salience-27B activa los 27,8B parametros en cada token, mientras que Pro y Flash activan unos pocos miles de millones por token mediante enrutamiento.

## Limitaciones y advertencias

- Ausencia de evaluacion formal: el autor declara explicitamente que los cambios de R6 no se han medido contra ninguna suite de benchmarks, y el `model-index` esta vacio. No hay base numerica para estimar la calidad del modelo.
- Adopcion muy baja: 55 descargas y 9 likes en el momento de redactar esta ficha, sin reproducciones independientes publicadas ni verificacion externa de las afirmaciones de la model card.
- Idioma: la model card solo declara ingles. No hay datos sobre el comportamiento en castellano ni en otros idiomas.
- Comportamiento "uncensored": el modelo presenta una tasa de rechazo reducida. Esto implica mayor riesgo de generar contenido inapropiado, inseguro o sujeto a restricciones legales segun el uso, y traslada al integrador la responsabilidad de aplicar filtros y politicas de uso.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de fidelidad. En tareas de codigo y de terminal, una alucinacion puede traducirse en comandos destructivos o parches incorrectos, por lo que se recomienda ejecucion en entornos aislados y revision humana.
- Diferencias frente a R5: segun el autor, R6 queda ligeramente por detras de R5 en benchmarks de opcion multiple saturados. Para cargas de trabajo de una unica pregunta dificil a esfuerzo maximo, recomienda `reasoning_effort="xhigh"`.
- El autor reconoce que R5 podia entrar en bucles de autoverificacion no convergentes bajo restricciones de formato apiladas y que R6 reconstruye esa ruta de razonamiento, pero no aporta mediciones de que el problema este resuelto.
- Coste de contexto: aunque la ventana es de 1.048.576 tokens, el requisito de memoria para la cache KV a esa longitud no esta documentado y en la practica condicionara el hardware necesario.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar los avisos de licencia y de atribucion, y sin garantias por parte del autor. El modelo base Qwen/Qwen3.8-27B puede tener condiciones adicionales que conviene verificar por separado.
- Precision: los pesos se distribuyen en bfloat16. No se han publicado cuantizaciones oficiales, por lo que cualquier version GGUF o AWQ disponible seria de terceros y sin validacion por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vectionlabs/Salience-27B-R6
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Miembro de la familia citado en la model card (Pro, 35B-A3B MoE): https://huggingface.co/vectionlabs/Salience-1.5-Pro
- Miembro de la familia citado en la model card (Flash, 30B-A3B): el enlace aparece truncado en la informacion proporcionada, no disponible completo.
- Repositorio, paper, blog o demo adicionales: no disponibles. Los resultados de busqueda web proporcionados no contienen informacion relacionada con el modelo: corresponden a paginas comerciales de suplementos de proteina de guisante, por lo que no se incluye ningun enlace adicional de esa fuente.
