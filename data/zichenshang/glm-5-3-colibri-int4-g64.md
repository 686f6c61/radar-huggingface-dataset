# zichenshang/GLM-5.3-colibri-int4-g64

## Resumen

GLM-5.3-colibri-int4-g64 es una conversion cuantizada a int4 del checkpoint oficial zai-org/GLM-5.3, publicada por el usuario zichenshang y empaquetada en el formato de contenedor que consume el motor colibri. No es el checkpoint oficial: los pesos son de Z.ai y este repositorio solo cambia como se almacenan. El objetivo declarado es ejecutar un modelo de clase 744B en una maquina con unos 25 GB de RAM, manteniendo los expertos enrutados en disco y leyendo unicamente los que selecciona cada token (expert streaming).

La conversion aplica cuantizacion int4 con escalado por grupos de tamano 64 a los expertos enrutados (21,2 MB por experto) y 8 bits a las partes densas y de entrada/salida. El repositorio ocupa 419,3 GB repartidos en 141 shards; la parte densa residente en memoria es de 10,6 GB y el RSS total ronda los 13,6 GB con un presupuesto de 18 GB. La geometria del modelo base es de 78 capas (75 dispersas), 256 expertos y 8 expertos activos por token.

Es relevante porque demuestra una via practica para servir modelos MoE de gran tamano en hardware sin GPU dedicada, a costa de un consumo de disco elevado y de depender de un motor especifico. La contrapartida es que no carga en transformers ni en vLLM, que el MTP no esta incluido en esta conversion y que no se ha realizado todavia una comparacion token a token contra la implementacion de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con 78 capas, 75 de ellas dispersas; segun la model card, la geometria es identica a la de GLM-5.2 |
| Parametros totales | Clase 744B (el motor colibri etiqueta el checkpoint como "GLM-5.2 744B"); cifra exacta no disponible |
| Parametros activos | No disponible en cifras; se activan 8 expertos de 256 por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 con group size 64 en expertos enrutados; 8 bits en densas y E/S (conversion realizada con ebits=4, xbits=4, io_bits=8, group_size=64) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | other, license_name: glm-5.3 (heredada del modelo base) |
| Formato de pesos | Contenedor propietario del motor colibri, 141 shards, 419,3 GB en disco; no es safetensors ni GGUF y no carga en transformers ni en vLLM |
| Modelo base | zai-org/GLM-5.3 (relacion: quantized) |
| MTP | No incluido en esta conversion |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos: 78 capas en total, de las cuales 75 son dispersas, con 256 expertos enrutados y 8 activos por token. El autor de la conversion senala que GLM-5.3 comparte modelo base con GLM-5.2 y que todas las mejoras de la version 5.3 provienen del post-entrenamiento; los dos checkpoints tienen geometria identica y sus config.json solo difieren en la version de transformers que los escribio y en una clave adicional. No hay, por tanto, diferencia arquitectonica que los distinga.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La innovacion tecnica de este repositorio no esta en el entrenamiento sino en el almacenamiento y la ejecucion: los expertos enrutados se guardan cuantizados a int4 con grupo 64 y se leen desde disco bajo demanda, de modo que solo residen en memoria la parte densa (10,6 GB) y los expertos seleccionados en cada paso. La verificacion realizada por el autor incluye la comprobacion de cabeceras y truncamiento de los 141 shards (116.915 tensores, sin problemas) y la generacion de texto coherente con salida identica byte a byte entre dos rutas distintas de obtencion de expertos bajo una semilla fija.

## Capacidades

- Generacion de texto en ingles y chino, segun los idiomas declarados en la model card.
- Razonamiento y conversacion multi-turno heredados del modelo base GLM-5.3, cuya evaluacion detallada no se aporta en esta ficha.
- Ejecucion de un modelo de clase 744B en CPU mediante streaming de expertos desde disco, con 8 expertos activos por token.
- Compatibilidad exclusiva con el motor colibri (`coli chat --model /ruta/al/directorio`); el motor detecta la familia desde config.json.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision o audio): no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- MTP (multi-token prediction): no incluido en esta conversion.

## Casos de uso

- Inferencia local de un modelo de clase 744B en una estacion de trabajo sin GPU: el motor mantiene 10,6 GB de pesos densos en memoria y lee del disco solo los 8 expertos que selecciona cada token, lo que permite operar con un presupuesto de 18 GB de RAM y un RSS en torno a 13,6 GB.
- Experimentacion con tecnicas de expert streaming: el repositorio sirve como banco de pruebas para medir el impacto del almacenamiento y de la ruta de obtencion de expertos en la latencia, dado que el autor valida la coherencia de la salida entre dos rutas distintas de fetch.
- Investigacion en cuantizacion int4 con escalado por grupos: los ajustes ebits=4, xbits=4, io_bits=8 y group_size=64 sobre 256 expertos permiten estudiar el compromiso entre tamano en disco (419,3 GB) y calidad de generacion.
- Generacion de texto offline en entornos aislados o sin conectividad: al residir todo el modelo en disco y ejecutarse en local, encaja en escenarios donde no se permite enviar datos a servicios externos.
- Procesamiento por lotes de documentos en ingles y chino: el modelo declara soporte para ambos idiomas, de modo que puede emplearse en tareas de resumen, extraccion o reformulacion sobre corpus bilingues.
- Reproduccion de la comparacion token a token pendiente: el propio autor solicita que quien ejecute la comparacion contra la implementacion de referencia abra un issue en el repositorio de colibri, lo que convierte este checkpoint en material para tareas de verificacion de fidelidad de la conversion.
- Prototipado de asistentes conversacionales en hardware de gama de escritorio: con un presupuesto de 18 GB de RAM y almacenamiento suficiente para 419,3 GB, se puede montar un servicio de generacion de texto de bajo coste en CPU.
- Evaluacion comparativa entre GLM-5.2 y GLM-5.3 sin acceso a infraestructura de GPU: al compartir geometria y diferir solo en post-entrenamiento, el checkpoint permite estudiar en CPU las diferencias atribuibles al post-entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, y tampoco ofrece mediciones de latencia o throughput. Lo unico verificado por el autor es que el modelo carga, genera texto coherente y produce salida identica byte a byte entre dos rutas de obtencion de expertos bajo una semilla fija. La comparacion token a token contra la implementacion de referencia no se ha realizado.

## Requisitos de hardware

- Memoria RAM: presupuesto declarado de 18 GB; RSS total en torno a 13,6 GB, con 10,6 GB de pesos densos residentes. El autor indica que permite ejecutar un modelo de clase 744B en una maquina con unos 25 GB de RAM.
- Almacenamiento: 419,3 GB en disco repartidos en 141 shards. El modelo card no especifica el tipo de disco, pero el mecanismo de expert streaming implica lecturas continuas, por lo que el tipo y la velocidad del almacenamiento condicionan el rendimiento (no se aportan cifras de latencia).
- GPU: no se especifica ninguna GPU recomendada ni requisito de VRAM; el diseno esta orientado a ejecucion en CPU. Los pesos no cargan en transformers ni en vLLM.
- GPU de consumo: no aplica segun la informacion disponible, al ser una conversion destinada a CPU.
- Opciones de despliegue: exclusivamente el motor colibri. Flujo indicado: `git clone https://github.com/JustVugg/colibri && cd colibri`, `make -C c colibri`, `c/coli chat --model /ruta/a/esta/carpeta`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Requisitos | Disponibilidad |
|---|---|---|---|---|---|---|---|
| zichenshang/GLM-5.3-colibri-int4-g64 | Clase 744B, 8 de 256 expertos activos por token | No disponible | int4 grupo 64 en expertos, 8 bits en densas y E/S | Contenedor colibri, 141 shards, 419,3 GB | other (glm-5.3) | CPU, ~18 GB de RAM de presupuesto, 419,3 GB de disco, motor colibri | Repositorio HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| zai-org/GLM-5.3 (original) | Clase 744B | No disponible | Precisión original (no especificada en la informacion disponible) | No disponible | glm-5.3 | No disponible | Checkpoint oficial de Z.ai en HuggingFace |
| GLM-5.2 | Misma geometria que GLM-5.3 (78 capas, 75 dispersas, 256 expertos, 8 activos) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan comparar este checkpoint con alternativas de la misma categoria mas alla de la coincidencia de geometria con GLM-5.2 documentada por el autor.

## Limitaciones y advertencias

- No es el checkpoint oficial: se trata de una conversion de pesos de terceros y los pesos originales son de Z.ai.
- Compatibilidad restringida: no carga en transformers ni en vLLM; solo funciona con el motor colibri.
- Fidelidad no verificada: no se ha realizado una comparacion token a token contra la implementacion de referencia. La verificacion existente se limita a la validez de cabeceras y truncamiento de los 141 shards, la generacion de texto coherente y la reproducibilidad byte a byte entre dos rutas de expert fetch.
- Etiqueta incorrecta conocida: colibri anuncia este checkpoint como "GLM-5.2 744B" porque el config.json no permite distinguirlo de GLM-5.2; el motor carga los pesos correctos pero el nombre mostrado es erroneo. El propio autor lo atribuye a la ausencia de diferencias arquitectonicas y al hecho de que todas las mejoras de GLM-5.3 provienen del post-entrenamiento.
- MTP no incluido en esta conversion.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion: inherente a los modelos generativos, sin datos de evaluacion especificos en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Licencia: "other" con license_name glm-5.3. La informacion disponible no detalla los terminos de uso comercial, por lo que deben consultarse en la licencia del modelo base antes de cualquier despliegue en produccion.
- Requisito de almacenamiento elevado: 419,3 GB de disco, lo que descarta su uso en equipos con almacenamiento limitado.
- Traccion nula en el momento de la consulta: 0 descargas y 0 likes, sin historial de uso en produccion.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a otro dominio sin relacion.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/zichenshang/GLM-5.3-colibri-int4-g64
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Repositorio del motor colibri: https://github.com/JustVugg/colibri
- La busqueda web no aporto otros enlaces relevantes (los resultados obtenidos no guardaban relacion con el modelo).
