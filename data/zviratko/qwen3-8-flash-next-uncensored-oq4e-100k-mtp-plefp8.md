# zviratko/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP-plefp8

## Resumen

Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP-plefp8 es un artefacto de pesos cuantizados publicado por el usuario zviratko en HuggingFace, derivado por cuantizacion del modelo jedisct1/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP. No se trata de un modelo entrenado desde cero, sino de una variante experimental en la que se ha transplantado una tabla PLE (n-gram table) en FP8 sobre los pesos ya cuantizados a 4 bits, con el objetivo de reducir la perdida de precision asociada a esa tabla auxiliar. El autor declara explicitamente que el efecto de esta tabla menos lossy es desconocido y que el artefacto debe considerarse un experimento abierto a feedback.

El modelo emplea la libreria MLX, esta orientado a inferencia en Apple Silicon y se distribuye en formato safetensors con cuantizacion de 4 bits. El recuento real de parametros en safetensors es de 179.999.981.459 (aproximadamente 180.000 millones), con un repositorio de 128 GB. La pipeline declarada es image-text-to-text, e incluye etiquetas de vision y tool-calling, lo que indica capacidades multimodales y de llamada a herramientas, aunque la model card no aporta detalle tecnico sobre ninguna de las dos.

Su relevancia actual es limitada y muy especifica: se trata de un experimento de cuantizacion reproducible en MLX sobre un modelo de gran tamano, con validacion parcial mediante tres benchmarks (MMLU, MMLU_PRO y HumanEval) que muestran resultados practicamente identicos al modelo cuantizado original. El repositorio no tiene descargas ni likes en el momento del registro, y la licencia presenta una ambiguedad relevante entre la etiqueta Apache-2.0 de la model card de origen y el fichero de licencia Qwen Community License 1.0 incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; el nombre y las etiquetas sugieren un transformer multimodal con prediccion multi-token, sin confirmacion tecnica) |
| Parametros totales | 179.999.981.459 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | no disponible (la nomenclatura incluye "100K", pero la model card no lo confirma como longitud de contexto) |
| Tipos de cuantizacion | 4 bits (oQ4e) sobre los pesos principales; tabla PLE transplantada en FP8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiqueta "other"); el repositorio de origen etiqueta Apache-2.0, pero el fichero de licencia fijado es Qwen Community License 1.0 con terminos comerciales adicionales |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La informacion disponible no incluye una descripcion de la arquitectura interna del modelo base ni de su proceso de entrenamiento. Los unicos indicios son las etiquetas del repositorio: qwen4 y qwen4_exp (familia experimental Qwen de cuarta generacion segun la nomenclatura del autor), mtp (prediccion multi-token), vision (entrada de imagen) y tool-calling. El pipeline declarado, image-text-to-text, confirma que el modelo acepta imagenes junto con texto. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento. El termino "Uncensored" en el nombre indica que la variante de origen ha sido sometida a algun proceso de reduccion de alineamiento de seguridad, pero no se documenta cual.

La innovacion tecnica que define este artefacto concreto es el transplante de una tabla PLE en FP8 sobre un modelo ya cuantizado a 4 bits. El autor describe el resultado como un experimento cuyo efecto es desconocido y afirma que el rendimiento y el uso de memoria son identicos a los del modelo original. La cuantizacion se ha realizado con la herramienta oQ4e dentro del ecosistema MLX (omlx), lo que implica que los pesos estan optimizados para ejecucion en Apple Silicon mediante memoria unificada y no para GPUs NVIDIA. No hay informacion sobre tecnicas adicionales como decodificacion especulativa, atencion lineal o variantes hibridas.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta conversational y la pipeline image-text-to-text.
- Procesamiento de imagenes junto a texto (entrada multimodal), segun la pipeline declarada y la etiqueta vision.
- Tool calling o function calling, segun la etiqueta explicita tool-calling del repositorio.
- Razonamiento y conocimiento general evaluado mediante MMLU (87,7 por ciento) y MMLU_PRO (68,0 por ciento) sobre muestras de 300 preguntas.
- Generacion de codigo evaluada con HumanEval completo (164 problemas), con un 92,1 por ciento de acierto.
- Prediccion multi-token (MTP) como caracteristica heredada del modelo base, segun la etiqueta mtp.
- Reduccion del alineamiento de seguridad propio de la variante "Uncensored", sin documentacion sobre el alcance real de esa reduccion.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking): los benchmarks se han ejecutado con la columna Think marcada como "No" en todos los casos, por lo que no hay evidencia de uso de modo thinking en las pruebas publicadas.
- Capacidades de audio o de agente multi-paso: no disponibles.

## Casos de uso

- Asistente local multimodal en Apple Silicon: el modelo acepta imagenes y texto y esta empaquetado en MLX, por lo que puede desplegarse en un Mac Studio o MacBook Pro con memoria unificada suficiente para procesar capturas, diagramas o documentos escaneados sin enviar datos a servicios externos.
- Extraccion de informacion de documentos escaneados: combinando la entrada de imagen con la generacion de texto, puede transcribir y estructurar contenido de facturas, formularios o informes tecnicos en un pipeline local, con la ventaja de que el proceso no sale del equipo del usuario.
- Agente con herramientas en entorno de desarrollo: la etiqueta tool-calling permite conectarlo a funciones externas (busqueda, ejecucion de comandos, consultas a API) para tareas de automatizacion de varios pasos, siempre que se valide previamente la fiabilidad real del formateo de llamadas.
- Asistencia de programacion offline: con un 92,1 por ciento en HumanEval completo, es adecuado para autocompletado y generacion de funciones en entornos sin conexion o con requisitos de confidencialidad, como desarrollo en redes aisladas.
- Investigacion sobre cuantizacion y compresion de modelos: el artefacto es un caso de estudio concreto sobre el impacto de transplantar una tabla PLE en FP8 sobre pesos de 4 bits, con resultados de benchmark medidos frente al modelo de origen.
- Evaluacion de seguridad y red-teaming: al tratarse de una variante "Uncensored", resulta util para estudiar comportamientos del modelo ante prompts que serian rechazados por versiones alineadas, dentro de un marco de investigacion controlado.
- Analisis de documentacion tecnica con imagenes: lectura de diagramas de arquitectura, esquemas electricos o graficos incluidos en PDF para generar resumenes y explicaciones en texto, aprovechando la ventana de contexto si esta se confirma.
- Prototipado de asistentes conversacionales de dominio especifico en local: con ajuste posterior o con prompting sobre las capacidades base, para pruebas de concepto que requieran ejecucion en hardware de sobremesa de Apple.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. Todas las ejecuciones se realizaron sin modo thinking (columna Think = "No").

| Benchmark | Muestreo | Este modelo (plefp8) | Modelo base cuantizado | Tiempo (s) |
|---|---|---|---|---|
| MMLU | Muestra 300/14042 | 87,7 % (263/300) | 87,0 % (261/300) | 417,7 frente a 442,2 |
| MMLU_PRO | Muestra 300/12032 | 68,0 % (204/300) | 68,7 % (206/300) | 425,1 frente a 419,0 |
| HumanEval | Completo (164) | 92,1 % (151/164) | 93,3 % (153/164) | 297,7 frente a 303,3 |

Detalles adicionales reportados por el autor:

- MMLU_PRO de este modelo: 1 de 300 respuestas alcanzo el limite de tokens (ninguna de ellas puntuo como correcta); la precision sobre respuestas finalizadas fue del 68,2 por ciento (n = 299).
- MMLU del modelo base: 1 de 300 respuestas alcanzo el limite de tokens; precision sobre respuestas finalizadas del 87,3 por ciento (n = 299).
- MMLU_PRO del modelo base: 2 de 300 respuestas alcanzaron el limite de tokens; precision sobre respuestas finalizadas del 69,1 por ciento (n = 298).
- No se han publicado resultados de MMLU completos, ni de benchmarks de vision, tool calling o multilingues.

## Requisitos de hardware

- Memoria necesaria: el repositorio ocupa 128 GB, por lo que la inferencia requiere al menos esa cantidad de memoria unificada; se recomienda un equipo con 192 GB o mas para dejar margen al contexto y a las activaciones. Con 180.000 millones de parametros a 4 bits, el peso teorico de los parametros ronda los 90 GB, pero el artefacto distribuido es mayor.
- Plataforma: la libreria declarada es MLX, lo que limita la ejecucion a Apple Silicon (series M1, M2, M3 y M4). No se documenta soporte para CUDA.
- GPUs recomendadas: no disponible; el modelo no esta empaquetado para GPUs NVIDIA o AMD en el repositorio analizado.
- Equipos compatibles: Mac Studio con M3 Ultra (192 GB o 512 GB de memoria unificada) o MacBook Pro con M4 Max (128 GB) como minimo absoluto, quedando muy justo de memoria en este ultimo caso.
- GPU de consumo: el modelo no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, RTX 5090 con 32 GB) en su formato actual.
- Opciones de despliegue: MLX y oMLX (etiquetado explicitamente en el repositorio). No se indica soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF en la informacion disponible.
- Latencia y throughput: el hardware de referencia de los benchmarks no se especifica, por lo que no se puede atribuir una cifra fiable. Como referencia derivada de los tiempos publicados, MMLU tardo 417,7 s en 300 preguntas (aproximadamente 1,39 s por pregunta) y HumanEval 297,7 s en 164 problemas (aproximadamente 1,82 s por problema), sin que conste la maquina empleada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zviratko/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP-plefp8 | 179.999.981.459 | no disponible | MMLU 87,7 %; MMLU_PRO 68,0 %; HumanEval 92,1 % | qwen-community-1.0 | MLX / safetensors, 0 descargas registradas |
| jedisct1/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP (modelo base) | no disponible en la informacion proporcionada | no disponible | MMLU 87,0 %; MMLU_PRO 68,7 %; HumanEval 93,3 % | no disponible | MLX / safetensors |
| Otros modelos de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base del que deriva el artefacto, puesto que la informacion proporcionada no incluye referencias a otras alternativas de tamano o tarea equivalentes.

## Limitaciones y advertencias

- Se trata de un experimento declarado como tal por el propio autor: el efecto del transplante de la tabla PLE en FP8 es, en sus palabras, desconocido.
- La validacion se apoya en tres benchmarks, dos de ellos con muestreo parcial de 300 preguntas sobre conjuntos de 14042 (MMLU) y 12032 (MMLU_PRO). No hay evaluacion completa de MMLU ni pruebas de vision, tool calling o multilingue.
- El modelo procede de una variante "Uncensored": cabe esperar un alineamiento de seguridad reducido y una mayor probabilidad de generar contenido inapropiado, ofensivo o potencialmente danino. No se documenta el alcance de esa desalineacion.
- Riesgo de alucinacion no cuantificado: como en cualquier modelo de lenguaje de esta escala, no hay datos especificos de factualidad o tasa de alucinacion en la informacion disponible.
- Sin modo thinking validado: todos los benchmarks se ejecutaron sin razonamiento explicito, por lo que no hay evidencia publicada de su comportamiento en ese modo.
- Idiomas soportados sin documentar: no se puede afirmar el nivel de competencia en castellano ni en ninguna otra lengua distinta del ingles de evaluacion.
- Longitud de contexto no confirmada: la nomenclatura sugiere 100K, pero la model card no lo especifica y no se han publicado pruebas de rendimiento con contextos largos.
- Ambiguedad de licencia: la model card del modelo de origen etiqueta Apache-2.0, mientras que el fichero LICENSE de la revision fijada contiene Qwen Community License 1.0 con terminos comerciales adicionales. El autor advierte expresamente de esta discrepancia. Cualquier uso comercial o redistribucion debe revisar el fichero de licencia incluido antes de proceder.
- Huella de validacion nula: el repositorio registra 0 descargas y 0 likes, sin evidencia de uso independiente por parte de terceros.
- Dependencia de plataforma: al ser un artefacto MLX, queda restringido a Apple Silicon y no puede desplegarse en infraestructura CUDA convencional sin conversion adicional.
- Requisitos de memoria muy elevados (128 GB de repositorio), lo que excluye la mayoria de equipos de sobremesa y portatiles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zviratko/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP-plefp8
- Modelo base: https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP
- Fichero de licencia del repositorio: LICENSE (referenciado en el repositorio, no como URL publica independiente)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
