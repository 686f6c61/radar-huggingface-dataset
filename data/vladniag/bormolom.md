# Vladniag/Bormolom

## Resumen

Bormolom es un modelo de lenguaje de tamano muy reducido (35.100.160 parametros) desarrollado por el usuario Vladniag y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning mediante SFT (supervised fine-tuning) con la libreria TRL sobre el modelo base Vladniag/Bormokrut, que a su vez es un GPT-2 de tokenizador y preentrenamiento personalizados para ruso. El resultado es un modelo especializado en una tarea muy concreta: la fase de preprocesado de consultas complejas antes de que un modelo mayor genere la respuesta final.

La funcion del modelo es triple: dividir una peticion compleja en subpreguntas independientes (tarea `split`), descomponerla en entidades, aspectos y una cadena de subpreguntas de investigacion con roles de experto asignados y dependencias explicitas (tarea `decompose`), y construir un plan por pasos con tipos de bloque tipificados como `definition`, `argument_pro`, `warning` o `conclusion` (tarea `plan`). El modelo no esta pensado para responder al usuario, sino para producir la estructura sobre la que otro sistema genera el contenido.

Su relevancia es la de un componente de orquestacion: con 35 millones de parametros se puede ejecutar en CPU o en cualquier GPU consumer, lo que permite insertarlo como etapa barata de planificacion en pipelines multiagente o sistemas RAG sin coste apreciable de latencia. Como contrapartida, no hay resultados de benchmarks publicados, el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y su conocimiento factual esta severamente limitado por el tamano y por entrenarse exclusivamente en ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, denso, con tokenizador personalizado) |
| Parametros totales | 35.100.160 (35,1 M), segun safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no se publican ficheros cuantizados; al ser un modelo denso de 35 M es cuantizable a int8/int4 con herramientas estandar, pero no hay versiones oficiales |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 (el modelo base, Bormokrut, se publica bajo licencia MIT) |
| Formato de pesos | safetensors (repo de 0,1 GB, libreria transformers) |

## Arquitectura y entrenamiento

La model card indica que Bormolom es un ajuste SFT de Vladniag/Bormokrut realizado con TRL. El modelo base se etiqueta como GPT-2, pero con un tokenizador propio orientado a ruso: los ejemplos de uso manipulan el prompt sustituyendo espacios por el caracter `▁` y saltos de linea por el token literal `<newline>`, lo que indica un esquema de preprocesado distinto del BPE byte-level estandar de GPT-2 (que usa `Ġ` para el espacio). El autor no documenta el numero de tokens de preentrenamiento, la composicion del corpus ni si hubo fases de RLHF o DPO; solo se especifica la fase SFT sobre el modelo base.

El entrenamiento se organiza en torno a tres plantillas estrictas con etiquetas `<instruction>`, `<fragment>` y `<result>`, y el modelo aprende a cerrar la generacion con `</result>`. Los datos de entrenamiento no se detallan, pero los formatos de salida (subpreguntas numeradas S1, S2; bloques `Reason`, `Entity`, `Aspects`, subpreguntas Qn con rol `R:` y dependencia `D:`; planes con tipos de bloque) revelan que el corpus de SFT fue generado o anotado de forma sintetica y altamente estructurada. No se documenta ninguna innovacion arquitectonica: no hay decodificacion especulativa, atencion lineal, MoE ni estado recurrente.

## Capacidades

- Generacion de texto en ruso, limitada al rol de planificador y descomponedor de tareas; no es un generador de respuestas finales.
- Tarea `split`: division de una peticion compleja en subpreguntas independientes y accionables.
- Tarea `decompose`: extraccion de la entidad principal y de los aspectos implicados, generacion de una cadena de subpreguntas de investigacion con dependencias explicitas entre ellas (`D: Qn`) y asignacion de roles de experto a cada subpregunta.
- Lista cerrada de roles de experto predefinida en el propio prompt (mas de 50 etiquetas: `историк`, `программист`, `экономист`, `педагог`, etc.), lo que permite enrutar subpreguntas a agentes especializados.
- Tarea `plan`: generacion de un plan por pasos con tipologia de bloques (`definition`, `argument_pro`, `warning`, `conclusion` y otros) y estructura de secciones.
- Salida en formato estricto delimitado por etiquetas XML-like, facil de parsear programaticamente.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de vision, audio ni multimodalidad.
- No se documenta modo de razonamiento explicito (thinking mode) ni capacidades multilingues mas alla del ruso.
- No se documenta bucle agentico autonomo; el modelo es una etapa de planificacion dentro de un sistema mayor.

## Casos de uso

- Preprocesado de consultas en pipelines RAG: antes de lanzar la busqueda vectorial, el modelo divide la pregunta del usuario en subpreguntas (tarea `split`), lo que permite recuperar documentos para cada faceta por separado y reducir el ruido en el contexto final. Es adecuado porque la tarea esta entrenada explicitamente y la salida es parseable.
- Orquestacion de sistemas multiagente: la tarea `decompose` produce subpreguntas con dependencias (`D: Qn`) y un rol de experto por subpregunta, que se puede mapear directamente a agentes especializados (un recuperador documental, un analista de datos, un revisor juridico) y al orden de ejecucion del grafo.
- Generacion de esquemas para respuestas largas: la tarea `plan` devuelve una estructura de bloques tipificados que se puede pasar como instruccion a un LLM mayor encargado de redactar cada seccion, mejorando la coherencia de documentos extensos.
- Asistentes educativos y diseno curricular: dado un temario amplio, el modelo descompone el tema en subtemas, aspectos y roles disciplinares, util para generar guiones de clase, modulos o rutas de aprendizaje estructuradas.
- Investigacion documental asistida: a partir de una pregunta de investigacion amplia, el modelo genera la cadena de subpreguntas con dependencias, que sirve como plan de busqueda bibliografica o de recopilacion de fuentes.
- Generacion de datos sinteticos de planificacion: las salidas estructuradas del modelo se pueden usar como semilla para anotar corpus de entrenamiento de planificadores de mayor tamano, filtrando despues por formato y coherencia.
- Despliegue en edge o en entorno on-premise con requisitos de privacidad: al ocupar decenas de megabytes y ejecutarse en CPU, se puede integrar como etapa de planificacion en instalaciones sin GPU y sin envio de datos a terceros.
- Enrutado de consultas en atencion al cliente: si se dispone de una taxonomia de expertos propia, el mecanismo de asignacion de rol `R:` puede reutilizarse para clasificar y derivar consultas al equipo o al modulo adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica cuantitativa, y las busquedas web realizadas no devuelven evaluaciones independientes del modelo. Los unicos indicadores cualitativos son los ejemplos de salida incluidos por el autor, que no constituyen una evaluacion sistematica.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 140 MB de pesos (35,1 M de parametros x 4 bytes).
- VRAM estimada en fp16/bf16: en torno a 70 MB, que es el formato que sugiere el propio ejemplo de la model card (`torch_dtype=torch.float16`).
- VRAM estimada en int8: en torno a 35 MB; en int4, en torno a 20 MB (estimaciones por tamano, no hay ficheros cuantizados publicados).
- Cabe en cualquier GPU consumer, incluida cualquier integracion grafica con mas de 1 GB de memoria compartida, y tambien en CPU, en una Raspberry Pi o en un dispositivo movil.
- GPUs como A100, H100 o RTX 4090 son innecesarias para este modelo; su unico interes seria servir miles de instancias concurrentes en paralelo.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (metodo documentado por el autor), y text-generation-inference, ya que el repositorio incluye el tag `text-generation-inference`. vLLM es tecnicamente viable pero aporta poco a este tamano. llama.cpp, Ollama y LM Studio requeririan una conversion a GGUF que no se publica en el repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos directamente comparables en la misma tarea (descomposicion de tareas y planificacion en ruso con tamano inferior a 100 M). La tabla siguiente compara con el modelo base y con dos referencias genericas de la misma escala, con datos publicos de sus respectivas model cards.

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bormolom (este modelo) | 35,1 M | no disponible | split / decompose / plan en ruso | Apache 2.0 | safetensors en Hugging Face |
| Bormokrut (modelo base) | no disponible | no disponible | extraccion y enrutado en ruso | MIT | safetensors en Hugging Face |
| GPT-2 small (referencia OpenAI) | 124 M | 1024 tokens | generacion de texto general en ingles | MIT | pesos publicos |
| Qwen2.5-0.5B (referencia Alibaba) | 494 M | 32 768 tokens | generacion general, multilingue, seguimiento de instrucciones | Apache 2.0 | safetensors y GGUF |

Bormolom no compite en capacidad general con ninguna de las referencias: su interes esta en la especializacion y en el coste computacional, no en el conocimiento embebido. Frente a Qwen2.5-0.5B, el modelo de Alibaba es entre una y dos ordenes de magnitud mayor, soporta contexto de 32 768 tokens y esta entrenado para instrucciones generales, pero no ofrece una salida estructurada nativa de descomposicion con dependencias y roles de experto.

## Limitaciones y advertencias

- Con 35,1 M de parametros, la capacidad de conocimiento factual es minima; cualquier dato concreto que el modelo genere debe verificarse externamente.
- Riesgo alto de alucinacion, especialmente fuera del dominio de las plantillas de entrenamiento: el modelo no fue entrenado para responder, sino para estructurar.
- El idioma soportado es unicamente el ruso. No hay evidencias de generalizacion a castellano ni a otros idiomas.
- La longitud de contexto no esta documentada, lo que impide dimensionar entradas largas con seguridad.
- El modelo exige plantillas estrictas (`<instruction>`, `<fragment>`, `<result>`) y un preprocesado manual del prompt (`▁` para espacios, `<newline>` para saltos). Fuera de ese formato el comportamiento es impredecible.
- Los parametros de decodificacion recomendados por el autor son restrictivos (`temperature=0.3`, `top_p=0.5`, `repetition_penalty=1.3`), lo que sugiere inestabilidad de la salida con muestreo agresivo.
- Los ejemplos de la propia model card contienen errores gramaticales en ruso (por ejemplo, concordancia incorrecta en "социокультурное и гастрономическое потенциал"), lo que indica un corpus de SFT sintetico sin revision linguistica completa.
- No hay benchmarks, no hay evaluacion independiente, no hay descargas ni interacciones registradas en el repositorio, y el modelo base tampoco dispone de evaluaciones publicas. La validacion en produccion corre por cuenta del integrador.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de copyright y licencia. Conviene revisar la licencia del modelo base (MIT) porque los pesos derivados heredan las condiciones de la obra original.
- Riesgo de sesgos: al derivar de un corpus sintetico en ruso con una taxonomia cerrada de roles profesionales, la asignacion de experto puede reproducir estereotipos de genero, nacionalidad o disciplina presentes en los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vladniag/Bormolom
- Modelo base Bormokrut: https://huggingface.co/Vladniag/Bormokrut
- Libreria TRL utilizada para el SFT: https://github.com/huggingface/trl
- No se han encontrado en la busqueda web papers, blogs ni demos adicionales sobre este modelo. Los unicos resultados relacionados son agregadores genericos de rankings de modelos (https://benchlm.ai/ y https://llm-stats.com/) que no contienen datos especificos de Bormolom.
