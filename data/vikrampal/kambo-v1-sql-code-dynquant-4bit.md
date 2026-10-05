# VikramPal/kambo-v1-sql-code-DynQuant-4bit

## Resumen

Kambo-v1 SQL + Code, DynQuant 4-bit es un checkpoint cuantizado del ajuste fino VikramPal/kambo-v1-sql-code, publicado por el usuario VikramPal. Se trata de una version comprimida a 4,2479 bits por parametro mediante DynQuant 0.5.3, una tecnica de cuantizacion que asigna anchuras distintas (2, 3, 4 u 8 bits) a cada matriz de pesos en funcion de la senal de entrenamiento del modelo original, en lugar de aplicar una anchura uniforme. El resultado ocupa 0,836 GiB de pesos frente a los 3,150 GiB del ajuste en bfloat16, manteniendo una perdida de 4,85 puntos en text-to-SQL.

El modelo esta etiquetado por su autor como mezcla de expertos (MoE) con arquitectura hibrida, aunque la model card no detalla la composicion de expertos ni el mecanismo de enrutamiento. Los metadatos de safetensors declaran 237.958.912 parametros, cifra que no concuerda con el presupuesto de bytes declarado (3,150 GiB en bf16 implicarian aproximadamente 1.690 millones de parametros), por lo que el dato de parametros totales debe tratarse con cautela.

Su relevancia es doble: por un lado, es un caso practico de cuantizacion no uniforme aplicada a un modelo pequeno de generacion de SQL y codigo; por otro, la propia model card documenta de forma inusualmente honesta que, a 4,25 bits, la asignacion basada en puntuaciones registro peores resultados en text-to-SQL que una asignacion de control con puntuaciones constantes. Es un checkpoint de investigacion con cero descargas y cero valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con arquitectura hibrida, segun las etiquetas del autor; sin mas detalle disponible |
| Parametros totales | 237.958.912 segun metadatos de safetensors (el presupuesto declarado de 3,150 GiB en bf16 implicaria aproximadamente 1.690 millones de parametros; las cifras no son coherentes entre si) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | DynQuant 0.5.3: asimetrica, grupos de 128, anchuras por matriz de 2, 3, 4 u 8 bits, media de 4,2479 bits por parametro. Existe una version hermana de 3 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (898.079.352 bytes); carga en bfloat16 |

Nota sobre el tamano: el repositorio ocupa 0,9 GB, con 0,836 GiB de pesos residentes en GPU tras la carga (pesos y buffers, antes de cualquier cache KV) y 0,836 GiB en disco.

## Arquitectura y entrenamiento

El modelo base es VikramPal/kambo-v1, del que deriva el ajuste fino bf16 VikramPal/kambo-v1-sql-code, y este checkpoint es la version cuantizada de ese ajuste fino. El autor lo etiqueta como mixture-of-experts y hybrid-architecture, pero no se documentan en la informacion disponible ni el numero de expertos, ni el numero de parametros activos por token, ni el mecanismo de atencion o de enrutamiento empleado.

El ajuste fino se realizo sobre cuatro conjuntos de datos: gretelai/synthetic_text_to_sql, Salesforce/wikisql y b-mc2/sql-create-context para la parte de text-to-SQL, y nvidia/OpenCodeInstruct para la parte de codigo. No se indica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. La innovacion tecnica del checkpoint no esta en el entrenamiento sino en la cuantizacion: DynQuant calcula puntuaciones a partir de la propia senal de entrenamiento del ajuste fino y las usa para repartir el presupuesto de bytes entre matrices, con anchuras de 2, 3, 4 u 8 bits y cuantizacion asimetrica en grupos de 128. El autor compara cada brazo cuantizado con un control uniforme de bytes equivalentes (dentro del 0,13%) y con un "null" de puntuacion constante que conserva las sensibilidades medidas.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation) con plantilla de conversacion, segun la etiqueta conversational.
- Traduccion de lenguaje natural a SQL (text-to-SQL): 49,06% en el banco de evaluacion del autor sobre 2.454 items.
- Generacion de codigo general: 31,10% en HumanEval (164 problemas) y 28,20% en MBPP (500 problemas).
- Capacidades multilingues: no disponibles; no se declara ningun idioma en los metadatos.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no documentadas.
- Modo de razonamiento explicito (thinking mode): no documentado.

## Casos de uso

- Asistente de consultas sobre bases de datos relacionales: el modelo traduce preguntas en lenguaje natural a sentencias SQL, con un rendimiento medido del 49,06% en el conjunto de evaluacion del autor. Encaja en herramientas internas de analitica donde el usuario final no conoce el esquema.
- Generacion de SQL en entornos con GPU muy limitada: al ocupar 0,836 GiB, puede desplegarse en portatiles con GPU integrada o en instancias con 2 GB de VRAM, algo inviable para el ajuste en bf16 de 3,150 GiB.
- Autocompletado de codigo en editores ligeros: con 31,10% en HumanEval y 28,20% en MBPP, es adecuado como asistente de sugerencias cortas mas que como generador autonomo de funciones completas.
- Prototipado e investigacion en cuantizacion: sirve como artefacto reproducible para estudiar el comportamiento de asignaciones de bits no uniformes frente a controles uniformes, ya que el autor publica los brazos comparativos y los tamanos de cada uno.
- Filtrado y preprocesado de pipelines de datos: puede generar consultas de seleccion, agregacion y filtrado sobre esquemas conocidos dentro de un flujo ETL por lotes.
- Demostraciones y entornos docentes de text-to-SQL: el tamano reducido permite ejecutarlo en un cuaderno en local sin depender de servicios en la nube.
- Evaluacion de cadenas de cuantizacion en CI: al tener una version de 3 bits y otra de 4 bits, permite montar pruebas comparativas de precision frente a consumo de memoria dentro de un pipeline de validacion.

## Benchmarks y rendimiento

Resultados publicados por el autor. La columna de text-to-SQL corresponde a 2.454 items, HumanEval a 164 y MBPP a 500. Se incluyen los brazos de control para que la comparacion sea interpretable.

| Brazo | Text-to-SQL (2.454) | HumanEval (164) | MBPP (500) | Pesos | Bits/param |
|---|---:|---:|---:|---:|---:|
| Kambo-v1 (base) | 42,87% (1052/2454) | 31,10% (51/164) | 25,40% (127/500) | 3,150 GiB | 16,0000 |
| Ajuste fino, bf16 | 53,91% (1323/2454) | 30,49% (50/164) | 28,80% (144/500) | 3,150 GiB | 16,0000 |
| DynQuant 4-bit (este repositorio) | 49,06% (1204/2454) | 31,10% (51/164) | 28,20% (141/500) | 0,836 GiB | 4,2479 |
| Uniforme 4-bit | 43,77% (1074/2454) | 24,39% (40/164) | 23,80% (119/500) | 0,837 GiB | 4,2535 |
| Null de puntuacion constante, 4-bit | 50,94% (1250/2454) | 28,05% (46/164) | 26,60% (133/500) | 0,836 GiB | 4,2479 |
| DynQuant 3-bit | 38,75% (951/2454) | 19,51% (32/164) | 20,00% (100/500) | 0,640 GiB | 3,2495 |
| Uniforme 3-bit | 24,33% (597/2454) | 2,44% (4/164) | 6,40% (32/500) | 0,641 GiB | 3,2538 |
| Null de puntuacion constante, 3-bit | 34,68% (851/2454) | 11,59% (19/164) | 15,60% (78/500) | 0,640 GiB | 3,2495 |

Desglose de text-to-SQL por origen de los datos:

| Brazo | Gretel test (fuente de entrenamiento) | WikiSQL test (fuente de entrenamiento) | Spider dev (no es fuente de entrenamiento) |
|---|---:|---:|---:|
| Kambo-v1 (base) | 52,93% (433/818) | 51,71% (423/818) | 23,96% (196/818) |
| Ajuste fino, bf16 | 60,15% (492/818) | 75,92% (621/818) | 25,67% (210/818) |
| DynQuant 4-bit | 57,09% (467/818) | 65,16% (533/818) | 24,94% (204/818) |
| Uniforme 4-bit | 50,73% (415/818) | 61,37% (502/818) | 19,19% (157/818) |
| Null de puntuacion constante, 4-bit | 56,97% (466/818) | 72,13% (590/818) | 23,72% (194/818) |
| DynQuant 3-bit | 45,48% (372/818) | 56,72% (464/818) | 14,06% (115/818) |
| Uniforme 3-bit | 28,24% (231/818) | 41,20% (337/818) | 3,55% (29/818) |
| Null de puntuacion constante, 3-bit | 40,34% (330/818) | 51,34% (420/818) | 12,35% (101/818) |

Otros datos de rendimiento declarados por el autor: frente al ajuste fino en bf16, este checkpoint pierde 4,85 puntos en text-to-SQL (49,06% frente a 53,91%), perdida significativa tras correccion de Holm; por origen, Gretel cae 3,06 puntos, WikiSQL 10,76 y Spider dev 0,73, de modo que WikiSQL concentra el 74% de la perdida neta en items. Frente al ajuste fino, no hay separacion estadistica en HumanEval (+0,61) ni en MBPP (-0,60). Frente al control uniforme de 4 bits, gana 5,30 puntos en text-to-SQL y no se separa en HumanEval (+6,71) ni en MBPP (+4,40, p no corregida = 0,0115). En perdida sobre datos reservados (KL respecto al ajuste fino, emparejado por conversacion), este checkpoint queda mas cerca del ajuste fino que el control uniforme de 4 bits (|z| = 23,0) y que un sorteo del null de senal permutada (|z| = 13,0), pero el null de puntuacion constante queda mas cerca todavia (|z| = 5,1), lo que indica que a 4,25 bits la asignacion basada en las puntuaciones registro un peor resultado en esa metrica. A 3,25 bits la comparacion se invierte (|z| = 27,9 a favor del mapa real). En tareas, en una comparacion anadida despues de leer el resultado de 4,25 bits, este checkpoint queda por detras del null de 4,25 bits en text-to-SQL (-1,87, p no corregida = 0,00768) y por delante en HumanEval (+3,05, p no corregida = 0,332) y MBPP (+1,60, p no corregida = 0,280).

## Requisitos de hardware

- VRAM para inferencia: 0,836 GiB de pesos y buffers residentes en GPU tras la carga, antes de cualquier cache KV. La cache KV no puede estimarse porque la longitud de contexto no esta disponible.
- Precision obligatoria: el checkpoint carga exclusivamente en bfloat16, por lo que requiere GPU con soporte bf16 (Ampere o posterior: RTX 30xx, RTX 40xx, A100, H100, L4, entre otras).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM resulta suficiente para los pesos; en tarjetas de gama alta el factor limitante sera la cache KV y el tamano de lote, no el modelo.
- GPU de consumo: si, cabe holgadamente en todas las gamas actuales e incluso en graficas integradas con memoria compartida suficiente.
- Opciones de despliegue: unicamente `transformers` junto con el paquete `dynquant` y `trust_remote_code=True`. El autor indica que la carga se probo con dynquant 0.5.3 bajo transformers 5.14.1 (torch 2.13.0+cu130) y transformers 5.18.0 (torch 2.14.1+cu130). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos publicados que comparen este checkpoint con modelos externos de la misma categoria. La comparativa disponible se limita a los brazos de la propia familia y a los controles de cuantizacion generados por el autor.

| Alternativa | Parametros | Contexto | Text-to-SQL | HumanEval | MBPP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DynQuant 4-bit (este repositorio) | 237.958.912 declarados (discrepancia con el presupuesto de bytes) | no disponible | 49,06% | 31,10% | 28,20% | Apache 2.0 | Publico en HuggingFace, 0 descargas |
| Ajuste fino bf16 (VikramPal/kambo-v1-sql-code) | mismo modelo base | no disponible | 53,91% | 30,49% | 28,80% | Apache 2.0 | Publico en HuggingFace |
| Uniforme 4-bit (control del autor) | mismo modelo base | no disponible | 43,77% | 24,39% | 23,80% | no disponible como repositorio independiente | Control experimental, no distribuido |
| DynQuant 3-bit (VikramPal/kambo-v1-sql-code-DynQuant-3bit) | mismo modelo base | no disponible | 38,75% | 19,51% | 20,00% | Apache 2.0 | Publico en HuggingFace |
| Modelos comparables de terceros | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Perdida de precision medible: este checkpoint cae 4,85 puntos en text-to-SQL respecto al ajuste fino en bf16, con WikiSQL concentrando el 74% de la perdida neta en items (10,76 puntos menos en ese origen).
- La asignacion de bits empeora el resultado a 4,25 bits: el null de puntuacion constante supera a este checkpoint en text-to-SQL (50,94% frente a 49,06%, p no corregida = 0,00768) y queda mas cerca del ajuste fino en perdida sobre datos reservados (|z| = 5,1 frente a |z| = 23,0 del null permutado). El propio autor senala que a esa anchura las puntuaciones registradas empeoraron la asignacion en esa metrica.
- La version de 3 bits degrada mucho mas: 38,75% en text-to-SQL y 19,51% en HumanEval, muy por debajo del checkpoint de 4 bits.
- Riesgo de contaminacion en Spider: sql-create-context, una de las fuentes de entrenamiento, se construyo en parte a partir de Spider. El autor elimino las filas de entrenamiento que planteaban preguntas de Spider dev tras normalizar mayusculas, puntuacion y espacios, pero otras filas derivadas de Spider pueden seguir presentes en la mezcla.
- Ejecucion de codigo remoto: la carga exige `trust_remote_code=True` y depende del paquete `dynquant`, lo que implica ejecutar codigo de terceros en el proceso de inferencia. Debe auditarse antes de usarlo en produccion.
- Dependencia de version estricta: el autor solo documenta la carga con dynquant 0.5.3 y transformers 5.14.1 o 5.18.0, y unicamente en bfloat16. Otras combinaciones de versiones o precisiones no estan verificadas.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue, por lo que se desconoce el comportamiento fuera del ingles tecnico tipico de los datasets usados.
- Sesgos conocidos: no documentados por el autor.
- Riesgo de alucionacion: no se han publicado mediciones especificas. Al tratarse de un modelo de generacion de SQL y codigo, existe riesgo de producir consultas sintacticamente validas pero semanticamente incorrectas, sin verificacion automatica integrada.
- Metadatos inconsistentes: la cifra de parametros de safetensors (237.958.912) no concuerda con el presupuesto declarado de 3,150 GiB en bf16, lo que impide estimar con fiabilidad requisitos de memoria para la cache KV.
- Validacion comunitaria nula: cero descargas y cero valoraciones en el momento de la consulta. Los resultados proceden exclusivamente de la evaluacion del propio autor, con conjuntos de evaluacion de tamano reducido en los casos de codigo (164 problemas en HumanEval).
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar los avisos de licencia y de indicar los cambios realizados. La licencia se aplica al checkpoint, pero no exime de comprobar las condiciones de los datasets de entrenamiento.
- Model card incompleta: el texto publicado se interrumpe a mitad de frase en la seccion de comparaciones, de modo que parte del analisis estadistico anunciado no esta disponible.

## Enlaces

- Repositorio HuggingFace de este checkpoint: https://huggingface.co/VikramPal/kambo-v1-sql-code-DynQuant-4bit
- Modelo base cuantizado (ajuste fino bf16): https://huggingface.co/VikramPal/kambo-v1-sql-code
- Modelo original: https://huggingface.co/VikramPal/kambo-v1
- Version de 3 bits: https://huggingface.co/VikramPal/kambo-v1-sql-code-DynQuant-3bit
- Repositorio de DynQuant: https://github.com/kambojvikram/dynquant
- Dataset gretelai/synthetic_text_to_sql: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Dataset Salesforce/wikisql: https://huggingface.co/datasets/Salesforce/wikisql
- Dataset b-mc2/sql-create-context: https://huggingface.co/datasets/b-mc2/sql-create-context
- Dataset nvidia/OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
