# tinyopsec/MiniCPM5-1B-Pashto-GGUF

## Resumen

MiniCPM5-1B-Pashto-GGUF es una familia de cuantizaciones en formato GGUF del modelo `nassimjp/MiniCPM5-1B-Pashto`, un MiniCPM5-1B de OpenBMB al que se le ha practicado una cirugía de tokenizer (tokenizer surgery) para mejorar la cobertura del pastún y el urdu. El artefacto lo publica el usuario `tinyopsec` y su aportación principal no es el entrenamiento, sino el empaquetado: 12 ficheros GGUF con cuantizaciones que van de F16 a Q2_K, listos para ejecutarse en llama.cpp y en cualquier runtime compatible (Ollama, LM Studio, koboldcpp, llama-cpp-python).

El modelo base es denso y pequeño: 1.080.774.144 parámetros reales según los safetensors del repositorio original, lo que lo sitúa en la franja de los 1B. Ese tamaño permite inferencia en CPU, en GPUs de consumo e incluso en dispositivos de gama baja, algo relevante para lenguas de bajos recursos como el pastún, donde el acceso a infraestructura de GPU es limitado.

Su relevancia ahora es doble: por un lado, acerca un modelo conversacional a dos idiomas escasamente cubiertos por los LLM comerciales; por otro, sirve como caso de estudio de hasta qué punto una modificación del tokenizer mejora la eficiencia en scripts no latinos sin reentrenar desde cero. La ficha del autor es mínima y no aporta métricas de calidad, por lo que cualquier uso en producción exige una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo base: openbmb/MiniCPM5-1B descrito por el autor como MiniCPM5) |
| Parametros totales | 1.080.774.144 (dato real de safetensors del modelo base) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada por el autor), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (12 ficheros en total) |
| Idiomas soportados | Pastun y urdu como objetivos declarados (tags del repositorio y nombre del modelo); el resto de idiomas del modelo base no se detalla. El campo `language` del repo aparece vacio |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero por cuantizacion); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base (numero de capas, dimension oculta, tipo de atencion, funcion de activacion) ni el volumen o composicion de sus datos de entrenamiento. Lo unico verificable es el recuento de parametros (1.080.774.144) y que se trata de un modelo de generacion de texto etiquetado como conversacional en HuggingFace. Tampoco se documenta si el modelo base paso por RLHF, DPO u otra fase de alineamiento.

La innovacion tecnica declarada es la cirugia de tokenizer: se ha modificado el vocabulario del MiniCPM5-1B original para representar mejor el pastun y el urdu, presumiblemente ampliando o sustituyendo tokens para reducir la fragmentacion de estos scripts. El autor no publica el procedimiento (vocabulario anadido, tokens eliminados, si hubo reajuste de las embeddings, cuantos tokens de entrenamiento se usaron para reajustarlas) ni los criterios de evaluacion. El repositorio de este artefacto se limita a la conversion a GGUF mediante llama.cpp; no hay entrenamiento adicional documentado en esta ficha.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base MiniCPM5-1B.
- Cobertura mejorada de pastun y urdu a nivel de tokenizer, lo que en principio reduce el numero de tokens necesarios para codificar texto en esos idiomas y libera ventana de contexto util.
- Ejecucion local en CPU y GPU mediante llama.cpp y runtimes compatibles, sin dependencia de APIs externas.
- Integracion en herramientas de escritorio y servidores ligeros (Ollama, LM Studio, koboldcpp, llama-cpp-python).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Vision, audio o modo "thinking": no disponibles; el pipeline declarado es exclusivamente text-generation.
- Capacidades multilingues adicionales (ingles, chino u otras lenguas del modelo base): no disponibles.

## Casos de uso

- Traduccion y adaptacion pastun-espanol o urdu-espanol en entornos sin conectividad: el modelo cabe en un portatil con 8 GB de RAM en Q4_K_M y puede ejecutarse con llama.cpp alli donde no se permite enviar texto a servicios en la nube.
- Atencion al cliente en pastun para ONG y administraciones: un asistente de primer nivel que responda FAQ y derive casos complejos, desplegado en un servidor pequeno con Ollama detrás de una API interna. Requiere evaluacion previa de calidad porque no hay benchmarks publicados.
- Preprocesado y normalizacion de transcripciones: limpieza de puntuacion, correccion de ortografia y unificacion de variantes dialectales en transcripciones ASR de pastun antes de indexarlas.
- Investigacion linguistica sobre tokenizacion: banco de pruebas para medir la fertibilidad (tokens por palabra) del tokenizer modificado frente al original en corpus pastunes y urdu, y para estudiar el compromiso entre cobertura de script y degradacion en otros idiomas.
- Generacion de material educativo: ejercicios, resumenes y preguntas de comprension en pastun para plataformas de aprendizaje de lenguas de bajos recursos, con revision humana posterior.
- Clasificacion y moderacion de texto a pequena escala: etiquetado de comentarios o mensajes en pastun en foros y canales de chat, aprovechando el bajo coste de inferencia de un modelo de 1B cuantizado a Q4.
- Prototipado rapido de producto: validar un flujo conversacional completo con llama-cpp-python antes de decidir si se escala a un modelo mayor o a un fine-tuning especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K, metricas de perplejidad ni comparaciones de fertibilidad del tokenizer antes y despues de la cirugia. Cualquier cifra de rendimiento tendria que generarse localmente.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del tamano de los pesos; el autor solo confirma que F16 ocupa 2,0 GB):

| Cuantizacion | Pesos aproximados | VRAM/RAM recomendada con contexto moderado |
|---|---|---|
| F16 | 2,0 GB (dato del autor) | ~2,5-3 GB |
| Q8_0 | ~1,1 GB (estimacion) | ~1,7-2 GB |
| Q6_K | ~0,9 GB (estimacion) | ~1,5 GB |
| Q5_K_M | ~0,8 GB (estimacion) | ~1,3 GB |
| Q4_K_M | ~0,7 GB (estimacion) | ~1,2 GB |
| Q3_K_M | ~0,55 GB (estimacion) | ~1 GB |
| Q2_K | ~0,4 GB (estimacion) | ~0,8 GB |

- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RX 6600) es suficiente; en A100/H100 el modelo queda sobredimensionado y el cuello de botella sera el ancho de banda de memoria, no la capacidad de computo.
- Cabe en GPU consumer: si, con holgura. En Q4_K_M funciona incluso en iGPU y en CPU pura; en Raspberry Pi 4/5 y moviles via llama.cpp es viable a velocidades de pocos tokens por segundo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, llama-cpp-python. vLLM y TGI no estan pensados para GGUF en este flujo y no se documentan en la ficha.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo en ningun hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas objetivo | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| tinyopsec/MiniCPM5-1B-Pashto-GGUF (este) | 1,08 B | No disponible | Pastun, urdu | Apache 2.0 | GGUF (12 cuantizaciones) | Tokenizer modificado; sin benchmarks; 0 descargas |
| openbmb/MiniCPM5-1B (base) | 1,08 B | No disponible | No disponible | Apache 2.0 (heredada) | Safetensors | Tokenizer original; referencia para medir la mejora en pastun/urdu |
| nassimjp/MiniCPM5-1B-Pashto | 1,08 B | No disponible | Pastun, urdu | No disponible en esta ficha | Safetensors | Version intermedia de la que se derivan estas cuantizaciones |
| Otros modelos multilingues de ~1-2 B | No disponible | No disponible | No disponible | No disponible | No disponible | No se han encontrado comparaciones en la informacion proporcionada |

La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo ni sobre alternativas comparables, por lo que la comparativa se limita a la cadena de derivacion del propio modelo.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni metricas de perplejidad, ni comparacion de fertibilidad antes/despues de la cirugia del tokenizer. El propio autor pide explicitamente "evaluate before use".
- Riesgo de degradacion por cirugia de tokenizer: al modificar el vocabulario, es esperable cierta perdida de rendimiento en los idiomas originales del MiniCPM5-1B (probablemente ingles y chino) y en tareas para las que el modelo fue alineado. No se cuantifica en la informacion disponible.
- Alucinacion: es un riesgo inherente en un modelo denso de ~1B sin datos publicados de alineamiento; la tasa concreta se desconoce.
- Cobertura limitada a pastun y urdu: no hay soporte declarado de otras lenguas, y el campo de idiomas del repositorio esta vacio.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos; hay que medirla empiricamente antes de disenar el producto.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, publicado el 2026-10-28 y actualizado ocho minutos despues. No hay evidencia de uso en produccion ni de validacion por terceros.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no detalla las obligaciones de atribucion del modelo base ni si la cirugia del tokenizer introduce alguna restriccion adicional.
- Repositorio de 10,8 GB: descargar el repo completo trae las 12 cuantizaciones; conviene bajar solo el fichero necesario.
- Sin garantias de mantenimiento por parte de un autor individual (`tinyopsec`), a diferencia de un modelo publicado por un laboratorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinyopsec/MiniCPM5-1B-Pashto-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Modelo intermedio con cirugia de tokenizer (referenciado en la model card): https://huggingface.co/nassimjp/MiniCPM5-1B-Pashto
- llama.cpp (runtime de conversion e inferencia): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo.
