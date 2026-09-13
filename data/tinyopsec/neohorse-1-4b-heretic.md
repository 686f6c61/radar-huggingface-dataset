# tinyopsec/NeoHorse-1-4B-Heretic

## Resumen

NeoHorse-1-4B-Heretic es un repositorio de pesos publicado por el usuario tinyopsec en HuggingFace. La unica informacion verificable disponible es su licencia (apache-2.0), la fecha de creacion (13 de septiembre de 2026) y el hecho de que el repositorio no registra descargas ni interacciones en el momento de la consulta. La model card no contiene ninguna documentacion tecnica: se limita a una cabecera YAML con el campo `license`, sin descripcion, sin instrucciones de uso y sin citar modelo base.

No se dispone por tanto de datos confirmados sobre arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni metodologia de alineacion. El identificador del repositorio incluye la cadena "4B", lo que sugiere un modelo de aproximadamente 4.000 millones de parametros, y el sufijo "Heretic" es una convencion habitual en la comunidad para designar variantes derivadas de tecnicas de elucion de rechazos (abliteration), pero ninguna de estas dos inferencias esta confirmada por el autor y deben tratarse como hipotesis, no como especificaciones.

La relevancia de esta ficha es, por tanto, fundamentalmente cautelar: dado que el repositorio carece de documentacion, de benchmarks y de trazabilidad sobre su procedencia, no es recomendable integrarlo en flujos de produccion sin una evaluacion propia previa. Cualquier despliegue deberia ir precedido de una auditoria de comportamiento, de una verificacion del modelo base subyacente y de una revision de las obligaciones de atribucion que impone la licencia Apache-2.0 si el modelo deriva de pesos con condiciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre del repositorio sugiere ~4B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no se documentan safetensors, GGUF ni otros formatos) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los resultados de busqueda disponibles. Se desconoce si se trata de un transformer denso, de una arquitectura de mezcla de expertos (MoE), de un modelo de espacio de estados (SSM) o de un diseno hibrido. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste supervisado, RLHF, DPO u otras tecnicas de alineacion.

El sufijo "Heretic" en el nombre del repositorio es una etiqueta recurrente en publicaciones de la comunidad que suelen corresponder a modelos sometidos a tecnicas de abliteration, es decir, a la modificacion selectiva de direcciones en el espacio de activaciones para reducir la tasa de rechazos. Sin embargo, no hay ninguna declaracion del autor que confirme esta practica en este repositorio concreto, ni se documenta el modelo base sobre el que se habria aplicado. Del mismo modo, el prefijo "NeoHorse" no se corresponde con ninguna familia de modelos conocida y verificable en la informacion disponible.

## Capacidades

- No se ha publicado ninguna lista de capacidades en la informacion disponible.
- Se desconoce si el modelo soporta generacion de texto, razonamiento, generacion de codigo o matematicas.
- Se desconoce si soporta tool calling o function calling.
- Se desconoce si tiene capacidades de agente o razonamiento multi-paso.
- No hay datos sobre cobertura multilingue ni sobre idiomas concretos.
- No hay datos sobre modos especiales (thinking mode, vision, audio, decodificacion especulativa).

## Casos de uso

Los siguientes escenarios son planteamientos condicionales, validos unicamente si una evaluacion propia confirma que el modelo se comporta como un modelo de lenguaje de ~4B parametros de proposito general. No deben asumirse como capacidades verificadas.

- Prototipado local en equipos de desarrollo: un modelo de ~4B en cuantizacion de 4 bits ocupa del orden de 2,5 a 3 GB, lo que permite ejecutarlo en portatiles con GPU discreta modesta o con memoria unificada, y usarlo para pruebas de concepto sin coste de API.
- Tareas de clasificacion y extraccion de informacion: si el modelo sigue instrucciones de forma fiable, puede emplearse para etiquetado de textos, extraccion de entidades o normalizacion de campos en pipelines internos donde el volumen no justifica un modelo mayor.
- Generacion de resumenes de documentos cortos: adecuado para resumir correos, actas o incidencias siempre que la longitud de contexto confirmada cubra el documento de entrada.
- Asistente de redaccion en herramientas ofimaticas: reescritura, correccion de estilo y generacion de borradores integrados en un complemento local, con la ventaja de que los datos no salen del equipo.
- Experimentacion en investigacion sobre alineacion: si se confirma que se trata de una variante derivada de abliteration, resultaria util como caso de estudio para medir cambios en la tasa de rechazos y en la degradacion de capacidades respecto al modelo base.
- Filtrado previo en un pipeline de dos etapas: uso como modelo barato de triaje que descarta o marca entradas antes de enviarlas a un modelo mayor, reduciendo el coste por consulta.
- Generacion de codigo asistida en entornos con requisitos de confidencialidad: solo si se verifica soporte de instrucciones y de lenguajes de programacion, y siempre con revision humana del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones generales para un modelo denso de ~4B parametros y no estan confirmadas por el autor. Deben verificarse tras inspeccionar el repositorio.

- VRAM estimada para inferencia, en el supuesto de un modelo denso de ~4B: aproximadamente 8-9 GB en FP16/BF16 (pesos mas cache KV), 4-5 GB en INT8 y 2,5-3 GB en cuantizacion GGUF Q4_K_M.
- GPU recomendadas si se confirma ese tamano: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y superiores; en centro de datos, A100, H100 o L40S, aunque estan sobredimensionadas para este tamano.
- Compatibilidad con GPU de consumo: previsiblemente si en cuantizaciones de 4 y 8 bits; en FP16 requeriria al menos 12 GB de VRAM.
- Memoria unificada: equipos Apple Silicon con 16 GB o mas podrian ejecutarlo en cuantizacion de 4 bits.
- Opciones de despliegue: no documentadas por el autor. Si los pesos estan en safetensors, serian aplicables Transformers, vLLM, TGI y SGLang; si existe conversion a GGUF, serian aplicables llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible comparar el rendimiento de este modelo porque no hay datos publicados. La tabla siguiente contrasta unicamente metadatos verificables del repositorio frente a modelos abiertos de tamano similar ampliamente documentados, que se incluyen como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Documentacion |
|---|---|---|---|---|
| tinyopsec/NeoHorse-1-4B-Heretic | no disponible | no disponible | apache-2.0 | inexistente en la model card |
| Qwen3-4B | ~4B denso | 32.768 tokens, ampliable con YaRN | apache-2.0 | model card completa y benchmarks publicados |
| Llama 3.2 3B Instruct | ~3,2B denso | 128.000 tokens | licencia comunitaria de Llama 3.2 | model card completa y benchmarks publicados |
| Gemma 3 4B | ~4B denso | 128.000 tokens | licencia de uso de Gemma | model card completa y benchmarks publicados |
| Phi-4-mini | ~3,8B denso | 128.000 tokens | MIT | model card completa y benchmarks publicados |

Los datos de los modelos de referencia corresponden a su documentacion publica habitual y conviene verificarlos en sus respectivas model cards antes de citarlos. La diferencia principal no es de rendimiento, sino de trazabilidad: los cuatro modelos de comparacion documentan arquitectura, datos de entrenamiento y evaluaciones, mientras que NeoHorse-1-4B-Heretic no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se puede determinar la arquitectura, el tamano real, el contexto ni el regimen de entrenamiento.
- Procedencia desconocida del modelo base: sin trazabilidad no es posible verificar el cumplimiento de licencias de terceros ni las obligaciones de atribucion, mas alla de la licencia Apache-2.0 declarada.
- Si el modelo deriva de una variante sometida a abliteration, es esperable una mayor tasa de respuestas inapropiadas o inseguras y una posible degradacion de capacidades respecto al modelo original; este riesgo no puede cuantificarse con la informacion disponible.
- Riesgo de alucinacion: no evaluado. Al no existir benchmarks, no hay ninguna medida de fiabilidad factual.
- Sesgos conocidos: no disponibles. No hay informacion sobre composicion del dataset ni sobre evaluaciones de sesgo.
- Limitaciones de contexto e idioma: no disponibles.
- Advertencia sobre el uso comercial: la licencia Apache-2.0 permite uso comercial y modificacion, pero no exime de responsabilidad al desplegador si los pesos incorporan material con condiciones adicionales no declaradas.
- Cero adopcion observada: sin descargas ni interacciones registradas, no existe comunidad que haya validado el modelo ni informes independientes de comportamiento.
- Recomendacion operativa: no desplegar en produccion sin auditoria previa de seguridad, evaluacion de capacidades con un conjunto de pruebas propio y verificacion del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tinyopsec/NeoHorse-1-4B-Heretic
- Paper: no disponible
- Blog o anuncio del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Nota sobre la busqueda web: los resultados obtenidos no guardan ninguna relacion con el modelo (corresponden al portal checo Centrum.cz), por lo que no se incluye ningun enlace adicional.
