# TokenRhythm/NeoHorse-Jev-4B

## Resumen

NeoHorse-Jev-4B es un modelo de decision estructurada de 4.000 millones de parametros desarrollado por TokenRhythm, construido como ajuste fino (finetune) sobre NeoHorse-1-4B. A diferencia de un modelo generativo convencional, no produce texto autoregresivo: dado un estado y un conjunto de preguntas definidas por la aplicacion, predice directamente la respuesta sobre las opciones que el desarrollador ha declarado, junto con su probabilidad. Su pipeline declarado en HuggingFace es text-classification y su inferencia es prefill-only, es decir, sin fase de decodificacion.

El modelo resuelve un problema muy concreto en flujos agenticos: enrutar peticiones, seleccionar herramientas, evaluar condiciones y puntuar resultados sin pagar el coste de generar lenguaje natural. Soporta tres tipos de decision (Choice, Noul y Score), admite multiples preguntas por peticion de texto y acepta opcionalmente una imagen combinada con texto, lo que lo situa tambien en el terreno vision-language. Su relevancia actual radica en que ofrece un mecanismo mas rapido y determinista que un LLM generativo para capas de decision intermedias dentro de un agente.

El modelo se publica bajo licencia Apache-2.0, con pesos en safetensors y soporte declarado para vLLM, SGLang y un runtime nativo en Python, CLI y HTTP. La model card reporta una puntuacion agregada de 77,70 sobre seis grupos de benchmarks de texto y una precision media del 83,26% en Nimble, VitaminC y MASSIVE, 11,50 puntos porcentuales por encima del baseline NeoHorse-1-4B. El contexto maximo no aparece documentado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision estructurada no generativo, prefill-only; derivado de NeoHorse-1-4B) |
| Parametros totales | 4B (segun denominacion del modelo; cifra exacta no disponible) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (evaluado en tareas en ingles: Nimble, VitaminC, MASSIVE) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria pytorch) |

Otros datos: tamano del repositorio 9,1 GB; pipeline declarado text-classification; modelo base TokenRhythm/NeoHorse-1-4B (relacion finetune); fecha de creacion 23 de septiembre de 2026; ultima actualizacion 25 de septiembre de 2026; 13 likes y 0 descargas en el momento de la consulta.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (numero de capas, tipo de atencion, dimension oculta) ni la composicion del dataset de entrenamiento. Lo que si se declara es el regimen de inferencia: prefill-only, sin generacion autoregresiva de texto. El modelo parte de NeoHorse-1-4B, descrito en fuentes secundarias como un modelo post-entrenado a partir de Qwen3.5-4B con 262.000 tokens de contexto, aunque ese dato corresponde al modelo base y no se confirma para NeoHorse-Jev-4B.

La innovacion tecnica central es el mecanismo de decision tipada. La aplicacion define el espacio de respuestas (acciones candidatas, preguntas si/no o niveles de valoracion ordenados) y el modelo devuelve distribuciones sobre esas candidatas, probabilidades si/no y valoraciones esperadas. Esto convierte la capa de decision en un problema de prediccion estructurada supervisada, apto para reglas de enrutamiento y umbrales deterministas. La model card menciona tambien el soporte opcional de peticiones de imagen combinadas con texto, sin especificar el codificador visual empleado.

## Capacidades

- Prediccion de decisiones de tipo Choice: seleccion entre un conjunto de acciones candidatas definidas por la aplicacion, con distribucion de probabilidad asociada.
- Prediccion de decisiones de tipo Noul: respuesta a preguntas booleanas (si/no) con probabilidad.
- Prediccion de decisiones de tipo Score: valoracion sobre niveles ordenados, con rating esperado.
- Multiples preguntas por peticion de texto, lo que permite evaluar varias condiciones en una sola pasada de prefill.
- Inferencia prefill-only, sin decodificacion autoregresiva, lo que reduce latencia y variabilidad frente a un modelo generativo.
- Soporte multimodal opcional: una unica imagen combinada con texto por peticion (vision-language).
- Integracion en flujos agenticos: enrutamiento de peticiones, seleccion de herramientas y comprobacion de condiciones.
- No es un modelo de generacion de texto libre, razonamiento en lenguaje natural ni generacion de codigo; esas capacidades no se declaran.
- Capacidades multilingues: no documentadas. Las evaluaciones reportadas son en ingles.

## Casos de uso

- Enrutamiento de peticiones en atencion al cliente: el modelo recibe el mensaje del usuario y una lista de colas o intenciones candidatas, y devuelve la distribucion de probabilidad sobre ellas; la capa de aplicacion aplica umbrales y deriva a la cola correcta sin invocar un LLM generativo.
- Seleccion de herramientas en agentes: dado el estado de la conversacion y el catalogo de herramientas disponible, el modelo puntua cada candidata y emite la eleccion con su probabilidad, lo que permite descartar llamadas de baja confianza antes de ejecutarlas.
- Comprobacion de condiciones en pipelines de automatizacion: se definen preguntas si/no (por ejemplo, si un ticket cumple un criterio de escalado) y el modelo devuelve la probabilidad de cada respuesta para alimentar reglas de negocio.
- Puntuacion de resultados y control de calidad: con decisiones de tipo Score, se valoran respuestas o salidas sobre una escala ordenada, util para filtrado previo o para priorizar revision humana.
- Moderacion y clasificacion de contenido: al ser un clasificador estructurado, permite etiquetar entradas contra una taxonomia definida por la aplicacion, manteniendo el criterio explicito y auditable.
- Agentes que operan sobre pantalla o simulacion con imagen: la model card muestra demos de Tetris, Snake, Mahjong, manipulacion robotica, arena de bombas a cuatro jugadores y conduccion autonoma, donde el modelo combina una imagen con texto para emitir la decision de cada paso.
- Reduccion de coste en orquestadores multiagente: sustituir llamadas generativas por decisiones prefill-only en los puntos de bifurcacion del grafo reduce tokens generados y latencia por paso.
- Despliegue local con runtime nativo: al ofrecer Python, CLI y HTTP ademas de vLLM y SGLang, encaja en entornos on-premise donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

Resultados publicados en la model card con fecha 24 de septiembre de 2026. Todas las puntuaciones estan en escala 0-100; mayor es mejor. Negrita = mejor resultado, subrayado = segundo mejor, entre las entradas open-weight listadas.

| Modelo | JevBench | Kev | OpenJev text | Nimble | VitaminC | MASSIVE | AVG |
|---|---:|---:|---:|---:|---:|---:|---:|
| Open-Jev-9B | 77,13 | 77,87 | 65,39 | 80,50 | 68,28 | 84,86 | 75,67 |
| Kev-4B | 73,71 | 81,47 | 54,75 | 73,40 | 76,46 | 85,71 | 74,25 |
| Laya English | 55,82 | 61,30 | 40,07 | 45,04 | 78,63 | 68,57 | 58,24 |
| Laya Typed Decisions | -- | -- | -- | 48,94 | 78,30 | 65,43 | -- |
| NeoHorse-1-4B (base) | -- | -- | -- | 69,15 | 63,27 | 82,86 | -- |
| NeoHorse-Jev-4B | 75,73 | 81,92 | 58,74 | 87,23 | 77,13 | 85,43 | 77,70 |

Notas de la propia model card: la columna AVG es una media de igual peso de los seis grupos, calculada antes de redondear, y solo se clasifican los modelos con los seis grupos completos; las imagenes y los juegos no entran en el agregado. Los resultados de JevBench, Kev y OpenJev para NeoHorse-Jev-4B se obtuvieron con vLLM, mientras que Nimble, VitaminC y MASSIVE conservan la evaluacion original sobre subconjunto fijo. El modelo lidera Kev (81,92) y Nimble (87,23), pero Open-Jev-9B supera en JevBench y OpenJev, Kev-4B en MASSIVE y los checkpoints Laya en VitaminC.

Dato adicional reportado: 83,26% de precision media en Nimble, VitaminC y MASSIVE, 11,50 puntos porcentuales por encima del baseline NeoHorse-1-4B. No se han publicado resultados de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion. Como referencia orientativa por tamano (4B), en fp16/bf16 serian del orden de 8-9 GB de pesos; en int8 en torno a 4-5 GB y en 4 bits en torno a 2,5-3,5 GB, mas overhead de activaciones y cache. Estas cifras son estimaciones por conteo de parametros, no datos del autor.
- GPU recomendadas: no declaradas. El despliegue documentado es via vLLM y SGLang, lo que permite servir en GPUs de centro de datos como A100, H100 o L40S, y tambien en GPUs de consumo con VRAM suficiente.
- GPU de consumo: con 4B de parametros, el modelo es candidato a ejecutarse en GPUs de consumo (RTX 4090, 4080 o similares) en cuantizacion de 8 o 4 bits, aunque no hay confirmacion oficial ni formatos cuantizados publicados.
- Opciones de despliegue declaradas: vLLM, SGLang y runtime nativo con interfaz Python, CLI y HTTP. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AVG (6 grupos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeoHorse-Jev-4B | 4B | no disponible | 77,70 | Apache-2.0 | HuggingFace, ModelScope |
| Open-Jev-9B | 9B | no disponible | 75,67 | no disponible | HuggingFace |
| Kev-4B | 4B | no disponible | 74,25 | no disponible | HuggingFace |
| Laya English | no disponible | no disponible | 58,24 | no disponible | HuggingFace |
| NeoHorse-1-4B (base) | 4B | 262K segun fuente secundaria | no disponible (solo 3 grupos) | Apache-2.0 | HuggingFace |

NeoHorse-Jev-4B es el unico de la comparativa que combina licencia Apache-2.0 explicita con resultados completos en los seis grupos. Open-Jev-9B duplica el tamano de parametros y obtiene mejor puntuacion en dos de los seis grupos, mientras que Kev-4B, del mismo tamano, supera ligeramente a NeoHorse-Jev-4B en MASSIVE. La ventaja del agregado de NeoHorse-Jev-4B procede del equilibrio entre tareas, no de un liderazgo en todos los benchmarks.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, codigo ni razonamiento en lenguaje natural. Cualquier expectativa de uso como LLM conversacional queda fuera de su diseno.
- Solo predice sobre el espacio de respuestas que define la aplicacion. La calidad de la decision depende criticamente de que las candidatas, preguntas y escalas esten bien formuladas.
- No se documentan sesgos evaluados. Al no declararse composicion del dataset ni idiomas soportados, no es posible estimar sesgos por dominio, idioma o demografia.
- Riesgo de alucinacion: al no generar texto, el fallo tipico no es una afirmacion falsa sino una decision mal calibrada. Las probabilidades devueltas deben validarse con umbrales y supervision antes de automatizar acciones irreversibles.
- Idiomas: no se declaran idiomas soportados; las evaluaciones publicadas son en ingles. El rendimiento fuera de ese idioma es desconocido.
- Longitud de contexto: no disponible. Esto limita la planificacion de despliegues con estados de agente largos o historiales extensos.
- Benchmark propio: JevBench, Kev y Nimble proceden del ecosistema del propio autor o de comparativas afines; el agregado AVG es una media de igual peso definida por TokenRhythm y no una metrica oficial de leaderboard.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar el fichero LICENSE especifico del componente Jev en el repositorio de GitHub por si anade condiciones.
- Repositorio con 0 descargas y creado recientemente; no hay evidencia de adopcion en produccion ni de soporte a largo plazo.
- Adopcion del formato de salida: al no ser un modelo generativo, requiere integracion a medida en el orquestador; no es drop-in replacement de una API de chat.
- Cifras de VRAM, latencia y throughput no estan publicadas; cualquier planificacion de capacidad debe medirse en el entorno objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/TokenRhythm/NeoHorse-Jev-4B
- Guia de despliegue: https://huggingface.co/TokenRhythm/NeoHorse-Jev-4B/blob/main/DEPLOYMENT.md
- Modelo base NeoHorse-1-4B: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Coleccion NeoHorse Jev en HuggingFace: https://huggingface.co/collections/TokenRhythm/neohorse-jev
- Repositorio GitHub: https://github.com/TokenRhythm/NeoHorse
- README del proyecto: https://github.com/TokenRhythm/NeoHorse/blob/main/README.md
- Licencia del componente Jev: https://github.com/TokenRhythm/NeoHorse/blob/main/jev/LICENSE
- ModelScope: https://www.modelscope.cn/models/TokenRhythm/NeoHorse-Jev-4B
- Web de la empresa: https://tokenrhythm.ai/
- Perfil en X/Twitter: https://x.com/opensquilla
- Commit de release fa86d48: https://huggingface.co/TokenRhythm/NeoHorse-Jev-4B/commit/fa86d485170aa1934a379370c63f6a8dabbbf588
- Ficha de NeoHorse-1-4B en AI/TLDR (fuente secundaria): https://ai-tldr.dev/models/neohorse-1-4b/
