# ThakiCloud/SKILLRET-Edge-22M

## Resumen

SKILLRET-Edge-22M es un bi-encoder de 22.713.216 parámetros (22,7 M) desarrollado por ThakiCloud para una tarea muy concreta: la recuperación de skills o habilidades dentro de un catálogo, a partir de una petición en lenguaje natural. Es decir, dado un conjunto de herramientas, acciones o capacidades descritas en texto, el modelo devuelve cuáles encajan mejor con lo que el usuario (o el propio agente) ha pedido. No genera texto: produce embeddings de 22,7 M de parámetros listos para búsqueda por similitud coseno.

El modelo parte de `Snowflake/snowflake-arctic-embed-xs` y se ha destilado del teacher `ThakiCloud/SKILLRET-Embedding-0.6B`, mucho mayor. El resultado es un encoder que ocupa 45,4 MB en fp16 y solo 17,1 MB en int4/g16, con una pérdida de calidad de 0,12 puntos porcentuales de NDCG@10 frente a fp16 (diferencia estadísticamente no significativa, t pareada de 1,15). Frente al teacher pierde unos 3,2 puntos de NDCG@10, pero es entre 80 y 200 veces más rápido en CPU en la misma prueba.

Su relevancia actual está en el despliegue en el borde: permite resolver el enrutado de habilidades de un agente en la misma máquina donde corre el agente, sin GPU y sin llamadas de red, con latencias de 3,1 a 6,5 ms por consulta en CPU de cuatro hilos. La licencia Apache-2.0 y el formato safetensors facilitan su integración en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder tipo BERT (etiqueta `bert` en el repositorio), derivado de `Snowflake/snowflake-arctic-embed-xs`; pooling CLS y embeddings normalizados L2 |
| Parametros totales | 22.713.216 (22,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | `max_length=256` en evaluacion; longitud maxima del modelo base: no disponible |
| Tipos de cuantizacion | fp16 (45,4 MB), int8/g16 (28,4 MB), int4/g16 (17,1 MB), int3/g16 (14,2 MB); fp32 en la evaluacion de latencia |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (libreria `sentence-transformers`); repo de 0,1 GB |
| Tarea (pipeline) | `feature-extraction` / retrieval |
| Modelo base | `Snowflake/snowflake-arctic-embed-xs` (relacion: finetune) |
| Dataset de entrenamiento | `ThakiCloud/SKILLRET` |
| Tamano del vocabulario, dim. de embedding, capas | No disponibles |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de doble torre (bi-encoder) al estilo de los modelos sentence-transformers: consulta y documento se codifican por separado y se comparan por similitud coseno sobre embeddings normalizados L2. El pooling es CLS, y la longitud de secuencia usada en evaluacion es de 256 tokens. Al derivar de `snowflake-arctic-embed-xs`, hereda un encoder pequeno orientado a recuperacion, no un modelo generativo.

El entrenamiento consistio en destilacion de conocimiento desde `ThakiCloud/SKILLRET-Embedding-0.6B` (NDCG@10 de 78,48 en el mismo split), con `kd_weight=0.7`, una perdida multi-positive InfoNCE sobre 1 a 3 ejemplos positivos por consulta, 12 epocas y schedule coseno. La epoca se selecciono sobre un holdout disjunto por skill, de forma que el split de test nunca se uso para elegir el checkpoint. La evaluacion se hizo sobre el split de test publico de `ThakiCloud/SKILLRET` (4.392 consultas y 6.006 skills).

Un detalle tecnico critico que el autor documenta de forma explicita es el contrato de prefijo de consulta: el repositorio incluye `query_prefix.json` con `resolved: ""`, es decir, las consultas se codifican desnudas, sin prefijo de instruccion. Tras el fine-tuning la eleccion del prefijo apenas cambia el resultado (ninguno: 79,18; con prefijo de instruccion: 78,50, dentro del error estandar), pero mantenerlo consistente entre entrenamiento y evaluacion si importa: un desajuste produjo una variacion de +8,84 puntos porcentuales sobre un mismo checkpoint, e incluso genero un resultado falso en el que la cuantizacion parecia superar a fp16. Los experimentos que no funcionaron tambien estan documentados: destilar del teacher de 8B en lugar del de 0.6B cuesta 2,40 puntos (brecha de capacidad); la cuantizacion INT2 o ternaria colapsa por completo (en torno a 0,1 de NDCG@10, y ni GPTQ ni QuIP la rescatan); el hard-negative mining propio cuesta 1,0 punto; y la perdida auxiliar LEAF con w=0,3 cuesta 1,51 puntos (t pareada de -7,78).

## Capacidades

- Recuperacion de skills: dado un catalogo de habilidades descritas en texto y una peticion en lenguaje natural, devuelve un ranking por similitud semantica.
- Enrutado de herramientas para agentes: selecciona la skill o herramienta adecuada antes de invocar al LLM que ejecutara la accion.
- Similitud semantica entre frases cortas: al ser un bi-encoder, permite comparar consultas entre si o contra descripciones.
- Busqueda por similitud coseno sobre embeddings normalizados L2, apta para indices vectoriales.
- Inferencia en CPU: no requiere GPU ni acelerador, con latencias de milisegundos de un solo digito.
- Compatibilidad con `sentence-transformers` y con `text-embeddings-inference` (etiqueta `text-embeddings-inference` y `endpoints_compatible` en el repositorio).
- No dispone de generacion de texto, tool calling nativo, modo thinking, vision ni audio: es exclusivamente un encoder de recuperacion.

## Casos de uso

- Enrutado de skills en agentes locales: el agente codifica la peticion del usuario y recupera las skills candidatas de su catalogo antes de decidir. Con 17,1 MB en int4 y 3,1 ms por consulta en un EPYC de cuatro hilos, el enrutado puede ejecutarse en el mismo proceso que el agente sin anadir latencia perceptible.
- Seleccion de herramientas previa a un LLM mayor: cuando el catalogo de herramientas tiene cientos o miles de entradas, no cabe en el prompt. Este modelo reduce el catalogo a las 10 mejores candidatas, que si caben, y el modelo generativo solo tiene que elegir entre ellas.
- Filtrado de recuperacion (recall) antes de un reranker: al ser un bi-encoder muy barato, se usa como primera etapa sobre un corpus de descripciones y se pasa un top-k amplio a un cross-encoder mas costoso.
- Despliegue en el borde o en entornos air-gapped: 14,2 a 45,4 MB de pesos permiten empaquetar el modelo dentro de un binario de escritorio, un plugin de navegador o un dispositivo industrial sin acceso a red ni GPU.
- Catalogacion y deduplicacion de skills internas: al generar embeddings de cada skill, se pueden detectar entradas duplicadas o solapadas en un catalogo corporativo de automatizaciones y RPA comparando vecinos cercanos.
- Asistentes de ayuda contextual en aplicaciones de escritorio: dado un problema descrito por el usuario, recuperar el procedimiento o la accion recomendada de una base interna, con todo el calculo en local y sin enviar datos a un servicio externo.
- Sistemas de recomendacion de acciones en soporte tecnico: mapear tickets o consultas de clientes a scripts y playbooks internos mediante similitud semantica entre la descripcion del problema y la descripcion del procedimiento.
- Indexacion de documentacion operativa corta: descripciones de comandos, entradas de CLI o pasos de un runbook, siempre que cada fragmento quepa en la ventana de 256 tokens.

## Benchmarks y rendimiento

Split de evaluacion: `ThakiCloud/SKILLRET` test, 4.392 consultas y 6.006 skills. Metrica: NDCG@10, con error estandar de aproximadamente ±0,45.

| Variante | Tamano en disco | NDCG@10 | Frente al teacher |
|---|---|---|---|
| SKILLRET-Embedding-0.6B (teacher) | 1191,6 MB | 78,48 | — |
| SKILLRET-Edge-22M fp16 | 45,4 MB | 75,26 ± 0,45 | 93,1 % |
| SKILLRET-Edge-22M int8 / g16 | 28,4 MB | 75,27 ± 0,45 | 93,1 % |
| SKILLRET-Edge-22M int4 / g16 | 17,1 MB | 75,14 ± 0,45 | 93,0 % |
| SKILLRET-Edge-22M int3 / g16 | 14,2 MB | 73,82 ± 0,46 | 91,3 % |
| Modelo base sin entrenar | 90,9 MB | 50,07 ± 0,58 | 61,9 % |

Latencia en CPU (aritmetica fp32, cuantizacion solo de pesos; dos maquinas distintas, por lo que no es una comparacion de ISA aislada, ya que tambien difieren memoria y reloj):

| Maquina | Consulta unica p50 | Lote de 32, por elemento |
|---|---|---|
| Apple M4 Pro, 4 hilos | 6,5 ms | 5,11 ms |
| AMD EPYC 9355, 4 hilos | 3,1 ms | 1,25 ms |
| Teacher de 0.6B, misma prueba | 518-650 ms | No disponible |

No se han publicado en la informacion disponible resultados en benchmarks generales de NLP (MMLU, HumanEval, GSM8K ni similares), lo cual es coherente con que el modelo no sea generativo.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU. En CPU, la huella de pesos va de 14,2 MB (int3) a 45,4 MB (fp16); en fp32 el artefacto del modelo base sin cuantizar ocupa 90,9 MB.
- GPU recomendadas: cualquiera con suficiente memoria para el modelo, incluida una GTX 1050 o una iGPU moderna; no se han publicado cifras especificas de rendimiento en GPU.
- Cabe en GPU de consumo: si, con amplio margen en cualquier tarjeta de los ultimos diez anos, y tambien en CPU de movil o SBC.
- Opciones de despliegue: `sentence-transformers` (libreria declarada), `text-embeddings-inference` (etiqueta del repositorio y `endpoints_compatible`). No se documenta soporte de llama.cpp, Ollama, TGI, GGUF ni ONNX en la informacion disponible.
- Latencia estimada: 6,5 ms p50 por consulta en Apple M4 Pro con 4 hilos; 3,1 ms en AMD EPYC 9355 con 4 hilos; en lote de 32, 5,11 ms y 1,25 ms por elemento respectivamente.
- Throughput estimado en lote: aproximadamente 195 elementos/s en M4 Pro y 800 elementos/s en EPYC 9355 con 4 hilos, segun las cifras por elemento publicadas. Cifras derivadas, no publicadas por el autor.
- Ahorro de memoria frente al teacher: los pesos pasan de 1191,6 MB a 45,4 MB en fp16, unas 26 veces menos, con una caida de 3,22 puntos de NDCG@10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NDCG@10 (SkillRet test) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SKILLRET-Edge-22M | 22,7 M | 256 tokens en evaluacion | 75,26 (fp16) / 75,14 (int4) | 17,1-45,4 MB | Apache-2.0 | HuggingFace, safetensors |
| SKILLRET-Embedding-0.6B (teacher) | No disponible | No disponible | 78,48 | 1191,6 MB | No disponible | Referenciado por el autor |
| snowflake-arctic-embed-xs sin entrenar | No disponible | No disponible | 50,07 | 90,9 MB | No disponible | Modelo base en HuggingFace |

No se dispone de resultados comparables de otros encoders de recuperacion de proposito general (por ejemplo all-MiniLM-L6-v2 o bge-small) sobre el split de SkillRet, por lo que no se incluyen cifras que no esten verificadas. La comparacion disponible se limita al teacher y al modelo base sin entrenar.

## Limitaciones y advertencias

- Solo ingles: el modelo esta entrenado y etiquetado unicamente para `en`. No hay evidencia de comportamiento en castellano.
- Ventana corta: `max_length=256` en evaluacion. Las descripciones de skills o las consultas mas largas se truncan.
- No es un modelo generativo: no produce texto, no hace razonamiento ni tool calling por si mismo. Solo genera embeddings.
- Brecha con el teacher: 3,22 puntos de NDCG@10 en fp16. Si el caso de uso exige maxima calidad en recuperacion y la latencia no es critica, el teacher de 0.6B es mejor opcion.
- Error estandar de ±0,45 en el split: diferencias por debajo de aproximadamente 1 punto no deben interpretarse como mejoras reales.
- Cuantizacion: int4 e int8 son estadisticamente indistinguibles de fp16, pero int3 baja a 73,82 y la cuantizacion INT2 o ternaria colapsa a alrededor de 0,1 de NDCG@10, sin que GPTQ ni QuIP la recuperen.
- Contrato de prefijo: las consultas deben codificarse sin prefijo de instruccion, tal y como indica `query_prefix.json`. Un desajuste entre entrenamiento y evaluacion puede mover el resultado hasta 8,84 puntos porcentuales e invalidar comparaciones.
- Split de referencia: la model card de los modelos SkillRet reporta un split de 4.997 consultas y 6.660 skills que no esta en el dataset publicado; los ficheros publicos verificados son 4.392 y 6.006. No se deben convertir resultados entre ambos.
- Calidad dependiente del catalogo: el rendimiento medido es sobre el dataset SkillRet. En catalogos reales con descripciones muy cortas, ambiguas o con jerga interna, el resultado puede degradarse, y no se han publicado evaluaciones fuera de ese dominio.
- Sesgos: no se han publicado analisis especificos de sesgo para este modelo. Al ser un encoder de recuperacion, puede reproducir sesgos presentes en las descripciones del catalogo sobre el que se indexe.
- Alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en la recuperacion, es decir, devolver una skill poco adecuada con alta similitud.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones adicionales, heredada del modelo base.
- Madurez: 18 descargas y 0 likes en el momento de la consulta, con una publicacion de septiembre de 2026 y una correccion posterior en la misma fecha. Conviene fijar la revision del repositorio en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/SKILLRET-Edge-22M
- Modelo base: https://huggingface.co/Snowflake/snowflake-arctic-embed-xs
- Teacher: https://huggingface.co/ThakiCloud/SKILLRET-Embedding-0.6B
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/ThakiCloud/SKILLRET
- Paper de SkillRet: https://arxiv.org/abs/2605.05726
- Busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (corresponden a un concesionario de automoviles), por lo que no se incluye ningun enlace adicional.
