# txktxkabcd/fahqgpt-rag

## Resumen

FahQgpt RAG es un repositorio de HuggingFace publicado por el usuario txktxkabcd que no contiene pesos de un modelo en sentido estricto, sino un stack de recuperacion aumentada (RAG) en Python disenado para hacer conversacionalmente utilizable a un modelo diminuto entrenado desde cero: FahQgpt 1.0 Nano, de 145,9 millones de parametros. El problema que aborda es concreto: un modelo de menos de 200M de parametros no tiene capacidad suficiente para almacenar conocimiento en sus pesos, y el autor reporta que en su conjunto de 23 preguntas cotidianas el modelo desnudo solo acierta alrededor del 23 por ciento. La solucion propuesta consiste en externalizar el conocimiento y dejar que el modelo se limite a reproducirlo.

La arquitectura del stack es de tres capas sobre el modelo: una calculadora que intercepta expresiones aritmeticas mediante expresiones regulares, un contador que resuelve peticiones del tipo "count from one to five", y un recuperador de conocimiento que busca sobre 19.141 pares pregunta-respuesta con similitud de n-gramas de caracteres (sin modelo de embeddings) y un umbral de similitud de 0,20. Si la similitud supera el umbral se devuelve directamente la respuesta canonica; si no, se inyectan los tres mejores ejemplos como few-shot y se delega en el modelo via llama.cpp.

La relevancia del proyecto es mas metodologica que de rendimiento bruto: documenta con detalle un patron reproducible (calculo deterministico fuera del modelo, conocimiento en un indice externo, modelo como capa de formateo) y lo empaqueta con instrucciones de despliegue para Windows, macOS y Linux, sin GPU y con un consumo de memoria de 2 GB. Se publica bajo licencia MIT y esta etiquetado para ingles, con una longitud de contexto de 1.024 tokens segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. El repositorio es un stack RAG de tres capas en Python sobre el modelo base fahqgpt-1.0-nano, un LLM entrenado desde cero (tag from-scratch); no se especifica la variante de transformer ni el numero de capas |
| Parametros totales | 145,9M (corresponden al modelo base fahqgpt-1.0-nano; este repositorio no contiene pesos propios) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F16 (350 MB) y Q4_K_M (137 MB) en el modelo base; el repositorio no publica cuantizaciones propias |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (en el modelo base fahqgpt-1.0-nano). Este repositorio contiene scripts Python y un fichero JSONL con la base de conocimiento (final_sft_balanced.jsonl) |

## Arquitectura y entrenamiento

El componente de recuperacion no usa embeddings ni base de datos vectorial: emplea similitud de n-gramas de caracteres implementada en Python puro con los modulos math y collections, lo que elimina la necesidad de descargar un modelo de embeddings y de reservar VRAM adicional para el. El indice contiene 19.141 pares pregunta-respuesta en formato JSONL, con una entrada {"user": ..., "assistant": ...} por linea, y es sustituible por datos propios. El umbral de decision directa es configurable y arranca en 0,20: por encima de ese valor se devuelve la respuesta recuperada tal cual; por debajo, se pasan los tres vecinos mas similares como ejemplos few-shot al modelo, que genera la respuesta con llama.cpp aplicando parametros de muestreo como repeat_penalty y dry_multiplier para evitar bucles de repeticion.

La capa de calculo aritmetico se justifica en la propia model card con un caso empirico: ante la pregunta "What is 7+5?", el recuperador devolvio una entrada incorrecta con similitud 0,22 (la respuesta del 2), porque la operacion no existia en el indice. La conclusion del autor es que la aritmetica debe resolverse de forma determinista fuera del modelo. La capa de conteo resuelve peticiones de enumeracion de forma directa. El modelo subyacente se entreno desde cero y actua como capa de formateo y generacion de ultimo recurso; el autor reconoce explicitamente que en esa capa el modelo "alucina pero con el formato correcto". No se documentan en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; la base de conocimiento se describe como derivada de SmolTalk y datos sinteticos generados con DeepSeek, sin verificacion humana linea a linea.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas breves (el propio autor indica que la respuesta media en los datos de entrenamiento es de cinco palabras).
- Resolucion de aritmetica basica mediante la capa de calculadora, con coincidencia por expresion regular y calculo determinista fuera del modelo.
- Enumeraciones y conteos del tipo "count from one to five" mediante la capa de contador.
- Recuperacion de respuestas factuales desde un indice de 19.141 pares pregunta-respuesta, con umbral de similitud configurable.
- Inyeccion automatica de ejemplos few-shot (top-3) cuando la similitud no supera el umbral de decision directa.
- Servicio HTTP integrado (ThreadingHTTPServer) con interfaz web de chat, accesible en red local mediante enlace a 0.0.0.0.
- Boton de "continuar" en la interfaz para extender respuestas cortas.
- Sustitucion de la base de conocimiento por datos propios en formato JSONL.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento.

## Casos de uso

- Asistente de FAQ sobre un dominio cerrado: sustituyendo final_sft_balanced.jsonl por un indice de preguntas frecuentes propio, el stack devuelve respuestas canonicas controladas por el autor de los datos, lo que resulta adecuado para catalogos de producto, politicas internas o documentacion normativa.
- Despliegue totalmente offline en equipos sin GPU: al requerir solo CPU, 2 GB de RAM y un unico paquete Python (requests) ademas de llama.cpp, encaja en portatiles modestos, entornos air-gapped y maquinas de laboratorio.
- Demo educativa de arquitecturas RAG sin dependencias pesadas: permite ilustrar el patron "calculo fuera del modelo, conocimiento en indice, modelo como formateador" en un portatil, sin instalar torch ni transformers.
- Juguete conversacional multiusuario en red local: el servidor escucha en 0.0.0.0, de modo que varias personas pueden acceder desde moviles o tablets al mismo asistente apuntando al IP interno de la maquina anfitriona.
- Enrutador de consultas con respuesta determinista: la combinacion de calculadora y umbral de similitud permite construir un front-end que resuelve consultas aritmeticas y factuales conocidas sin invocar al modelo, reduciendo latencia y evitando alucinaciones en esa franja de peticiones.
- Prototipo de sustitucion de LLM en flujos con restricciones de recursos: sirve para medir empiricamente en que porcentaje de peticiones reales un indice de recuperacion por n-gramas basta, antes de invertir en un modelo mayor.
- Cliente movil parcialmente funcional: cargando el GGUF Q4_K_M (137 MB) en aplicaciones como ChatterUI, PocketPal o MLC Chat, se obtiene el modelo desnudo sin capa de recuperacion, util como prueba de concepto offline mas que como asistente fiable.

## Benchmarks y rendimiento

La model card incluye unicamente evaluaciones propias, de muestra pequena y sin protocolo estandar ni comparacion con terceros. Se reproducen aqui tal cual, sin extrapolacion:

| Evaluacion | Conjunto | Resultado declarado |
|---|---|---|
| Exactitud del modelo desnudo | 23 preguntas cotidianas | Aproximadamente 23 por ciento |
| Exactitud con stack RAG | Conjunto de prueba del autor | 16/16 aciertos (segun el autor) |
| Tasa de acierto del recuperador | 12 consultas, incluidas algunas no presentes en los datos de entrenamiento | 11/12 |

Ejemplos concretos citados en la model card (modelo desnudo frente a stack RAG): "Who are you?" pasaba de "I am a computer scientist." a la identidad correcta; "What is 1+1?" pasaba de "The answer is 1" a "1 + 1 = 2"; "What is 7+5?" pasaba de "7+5 = 7" a "7 + 5 = 12"; "What is the capital of Japan?" pasaba de no responder a "Tokyo"; "Count from one to five." pasaba de "A to Z" a "one, two, three, four, five."; y "Can you help me?" pasaba de "No, I cannot" a "Yes, I'll do my best to help you.".

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM: no se requiere GPU. El autor indica explicitamente que la CPU es suficiente, "solo mas lenta".
- Memoria RAM: 2 GB o mas, segun la model card.
- Almacenamiento: aproximadamente 1 GB de espacio libre entre modelo, repositorio y entorno Python.
- Tamano del modelo: 137 MB en Q4_K_M y 350 MB en F16; la model card menciona un rango de 137 a 350 MB.
- GPU recomendadas: no aplica. En la seccion de descargas de llama.cpp se contemplan binarios CUDA x64 para Windows con GPU NVIDIA, pero la configuracion de referencia del proyecto es CPU.
- Compatibilidad con GPU de consumo: irrelevante por el tamano del modelo; cualquier GPU que soporte llama.cpp puede ejecutarlo, pero no es necesario.
- Opciones de despliegue: llama.cpp como backend obligatorio (llama-server, binarios precompilados o via brew/apt), mas un servidor HTTP en Python puro (ThreadingHTTPServer) lanzado con python rag_chat.py --serve --port 8080 --direct-threshold 0.20. En movil, el GGUF puede cargarse con ChatterUI, PocketPal o MLC Chat, pero sin la capa de recuperacion.
- Latencia y throughput: no disponibles. La model card advierte de que recorrer las 19.141 entradas con n-gramas de caracteres en Python puro resulta notablemente lento en un telefono, aunque no cuantifica tiempos en PC.

## Comparativa con modelos similares

Los datos de la fila correspondiente a este proyecto proceden de la model card. Los de los modelos de contraste proceden del conocimiento general del ecosistema y no han sido verificados en la informacion proporcionada; conviene confirmarlos antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Capa RAG incluida |
|---|---|---|---|---|---|
| fahqgpt-rag / fahqgpt-1.0-nano | 145,9M | 1.024 tokens | MIT | HuggingFace, 0 descargas y 0 likes en el momento de la consulta | Si, stack de tres capas documentado |
| SmolLM2-135M (HuggingFaceTB) | 135M | No disponible | Apache-2.0 | HuggingFace | No |
| Qwen2.5-0.5B | 0,49B | 32.768 tokens | Apache-2.0 | HuggingFace | No |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache-2.0 | HuggingFace | No |

La diferencia funcional relevante no es de parametros sino de enfoque: las alternativas son pesos de proposito general que requieren que el desarrollador construya su propia capa de recuperacion, mientras que fahqgpt-rag entrega esa capa ya escrita, con un modelo de calidad muy inferior y un contexto mucho mas corto. No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion en consultas fuera de la base de conocimiento: el autor lo reconoce de forma explicita ("la capa de modelo alucina, pero con el formato correcto").
- Base de conocimiento no verificada: procede de SmolTalk y de datos sinteticos generados con DeepSeek y contiene errores factuales, con el ejemplo citado en la propia model card de "los leones son el animal mas grande".
- Contexto muy limitado: 1.024 tokens, lo que en la practica restringe el few-shot a unas 15 parejas de pregunta-respuesta si se intentase empaquetar la base de conocimiento como prompt estatico.
- Idioma unico: el modelo esta etiquetado exclusivamente para ingles; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Respuestas muy breves por diseno: la media de los datos de entrenamiento es de cinco palabras, lo que obliga al usuario a pulsar "continuar" para obtener respuestas mas largas.
- Riesgo de bucles degenerativos: el propio autor documenta casos de repeticion ("esophagus. esophagus...") cuando los parametros de penalizacion de muestreo no se aplican correctamente.
- Sensibilidad del recuperador al umbral: con un umbral de 0,20 se han observado recuperaciones incorrectas por similitud superficial (el caso de 7+5 devolviendo la respuesta de 2), lo que obliga a tratar la aritmetica y otras tareas deterministas fuera del recuperador.
- Limitacion movil estructural: el stack no puede ejecutarse directamente en telefono porque requiere un proceso Python, un llama-server y el recorrido completo del indice; en movil solo es viable el modelo desnudo, con la calidad asociada a ese modo.
- Evidencia empirica muy debil: las cifras de 23 por ciento, 16/16 y 11/12 provienen de conjuntos de 23 y 12 elementos, sin protocolo estandar ni verificacion independiente.
- Madurez y adopcion nulas: el repositorio registra 0 descargas y 0 likes, y la fecha de publicacion indicada (2026-10-01) es posterior a la fecha de actualizacion mostrada, lo que sugiere metadatos inconsistentes.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, pero solo cubre el codigo del repositorio; el modelo base y la base de conocimiento derivada de SmolTalk y datos sinteticos pueden arrastrar condiciones adicionales de sus fuentes originales que no se detallan en la model card.
- La model card esta redactada integramente en chino, con lo que el publico objetivo declarado (tags en ingles) tiene una barrera de acceso a la documentacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/txktxkabcd/fahqgpt-rag
- Modelo base fahqgpt-1.0-nano: https://huggingface.co/txktxkabcd/fahqgpt-1.0-nano
- Binarios de llama.cpp: https://github.com/ggerganov/llama.cpp/releases
- Proxy de descarga de GitHub citado en la model card: https://ghproxy.net/
- Descarga de Python: https://www.python.org/downloads/
- Espejo de HuggingFace citado para descargas desde China: https://hf-mirror.com/

La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: todos los enlaces obtenidos corresponden a contenido no relacionado con inteligencia artificial y han sido descartados. No se han localizado papers, blogs tecnicos, repositorios auxiliares ni demos adicionales sobre FahQgpt distintos de los enlaces oficiales listados arriba.
