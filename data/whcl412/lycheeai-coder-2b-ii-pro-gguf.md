# whcl412/LycheeAI-coder-2b-II-pro-GGUF

## Resumen

LycheeAI-coder-2b-II-pro-GGUF es la distribucion en formato GGUF del modelo whcl412/LycheeAI-coder-2b-II-pro, un ajuste fino de 2B parametros especializado en invocacion de herramientas (tool calling / function calling). Lo publica el usuario whcl412 sobre el modelo base openbmb/MiniCPM5-2B de la empresa china OpenBMB, y la unica funcion que persigue es que el modelo emita llamadas a herramientas en lugar de intentar resolver por si mismo tareas que no domina, en particular la aritmetica.

El modelo tiene 2.516.756.480 parametros, licencia Apache 2.0 y soporte declarado para chino (zh) e ingles (en). Se distribuye en tres cuantizaciones GGUF (F16, Q8_0 y Q4_K_M) y esta pensado para ejecutarse con llama.cpp, llama-server (API compatible con OpenAI) y Ollama, lo que permite desplegarlo en portatiles y maquinas sin GPU dedicada. La model card lo describe explicitamente como un experimento de un desarrollador individual con capacidad limitada, no como un modelo de produccion.

Su relevancia actual es doble: por un lado ocupa el nicho de modelos pequenos de tool calling ejecutables en local con muy pocos recursos; por otro, documenta con inusual detalle los compromisos de entrenar con un presupuesto fijo de 980 muestras y una validacion interna de 26/27 aciertos, incluyendo los fallos conocidos y las estrategias de mitigacion en el codigo del host.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (heredada de openbmb/MiniCPM5-2B; la model card no especifica la arquitectura) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No procede (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible de forma oficial; el ejemplo de `llama-server` de la model card configura `-c 8192` |
| Tipos de cuantizacion | F16 (5.039.007.040 bytes), Q8_0 (2.679.711.040 bytes), Q4_K_M (1.561.318.720 bytes) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio incluye ademas un `Modelfile` para importar en Ollama |
| Tamano del repositorio | 9,3 GB |
| Modelo base | openbmb/MiniCPM5-2B |
| Metodo de ajuste | MLX-LM QLoRA 4 bits, LoRA de rango 16, learning rate 5e-5, batch 2 |
| Datos de entrenamiento | 980 muestras seleccionadas, 1 epoch (490 pasos) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo; se indica unicamente que el punto de partida es openbmb/MiniCPM5-2B y que el ajuste se realizo con MLX-LM mediante QLoRA de 4 bits con LoRA de rango 16, learning rate 5e-5 y batch 2. No se mencionan innovaciones arquitectonicas propias, decodificacion especulativa ni mecanicas de atencion alternativas.

El entrenamiento se hizo con 980 muestras curadas durante un solo epoch, lo que corresponde a 490 pasos de optimizacion. El autor impone una restriccion de proyecto de no superar los 500 pasos por entrenamiento, de modo que con batch 2 el presupuesto maximo es de 1000 muestras. La seleccion final se hizo con un muestreo estable basado en hash de contenido, de forma que modificar cupos solo extiende la lista de manera monotona. El autor documenta que dos variantes alternativas (v7b y v7c) con refuerzo dirigido obtuvieron 23/27 y 22/27 en la validacion interna, arreglando unos casos a costa de degradar otros, lo que motivo volver a la configuracion de 980 muestras. No se detalla la composicion del dataset ni si hubo fases de RLHF o DPO.

El contrato de tool calling es deliberadamente simple: el modelo emite un objeto JSON plano, del tipo `{"name": "calculate", "arguments": {"expression": "789*123"}}`, sin etiquetas envolventes. El chat template usa los marcadores `<|im_start|>` y `<|im_end|>` y admite un conmutador de razonamiento (`enable_thinking`) que produce etiquetas `<think>...</think>`. El autor advierte que la plantilla no fija un valor por defecto para ese conmutador, de modo que si no se envia explicitamente puede aparecer una etiqueta `</think>` suelta en la salida.

## Capacidades

- Tool calling y function calling: es la capacidad principal y el motivo del ajuste. Emite llamadas en JSON plano e incluye una funcion interna de calculo (`calculate`) en el ejemplo de integracion.
- Conversacion multi-turno: la model card menciona la resolucion de fallos historicos en "multironda con repreguntas" dentro de su conjunto de validacion.
- Modo de razonamiento conmutable: el parametro `enable_thinking` del chat template permite activar o desactivar la generacion de contenido de pensamiento; con `think: false` la salida es directa y limpia, con `think: true` el razonamiento se separa en el campo `message.thinking`.
- Bilinguee chino e ingles: ambos idiomas aparecen como soportados en las etiquetas y en la model card.
- Integracion como servicio: compatible con llama-server (API HTTP con esquema compatible con OpenAI) y con Ollama mediante el `Modelfile` incluido.
- Generacion de codigo, matematicas avanzadas, vision o audio: no se declaran como capacidades del modelo en la informacion disponible.

## Casos de uso

- Enrutamiento de llamadas a herramientas en asistentes conversacionales: el modelo recibe las definiciones de funciones y devuelve el nombre y los argumentos en JSON plano, que el host parsea con una expresion regular o un parser JSON. Es adecuado porque el formato de salida es muy estable segun el autor y no requiere un motor de plantillas de tool calling.
- Calculo determinista dentro de agentes: con la instruccion de sistema adecuada, redirige cualquier operacion numerica a la herramienta `calculate` en vez de calcular mentalmente. El autor documenta que sin esa instruccion el modelo tiende a hacer aritmetica por su cuenta y a fallar, por lo que este caso de uso exige el prompt de sistema explicito.
- Asistentes locales en equipos sin GPU: con la cuantizacion Q4_K_M (1,45 GiB) el modelo cabe en maquinas de 8 GB de memoria y se ejecuta con Ollama o llama.cpp en CPU, lo que permite prototipar agentes con herramientas sin conexion externa.
- Pipelines de backend con API compatible con OpenAI: `llama-server` expone el modelo por HTTP y permite sustituir llamadas a APIs comerciales en fases de desarrollo, manteniendo el mismo esquema de peticion y respuesta.
- Filtrado y extraccion de parametros estructurados: usar el modelo como extractor de campos concretos a partir de texto de entrada, aprovechando su tendencia a producir JSON directo en lugar de texto libre.
- Evaluacion comparativa de estrategias de tool calling: al ser un modelo pequeno y completamente inspeccionable en local, sirve como banco de pruebas para medir la fiabilidad de distintos parsers, temperaturas y formatos de definicion de herramientas antes de aplicarlos a modelos mayores.
- Despliegue con requisitos de privacidad: al ejecutarse integramente en la maquina del usuario, es apto para escenarios en los que las trazas de conversacion y los argumentos de las herramientas no pueden salir del entorno local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion es la validacion interna del autor sobre un conjunto propio de 27 casos:

| Metrica | Valor | Nota |
|---|---|---|
| Validacion interna (v7 actual) | 26/27 | Conjunto propio de 27 casos del autor; no es un benchmark publico ni comparable |
| Validacion interna (version anterior) | 25/27 | Segun la model card, "25/2" en el texto original |
| Variante v7b | 23/27 | Refuerzo dirigido; descartada por degradar otros casos |
| Variante v7c | 22/27 | Refuerzo dirigido; descartada por degradar otros casos |
| Fallo conocido | 1 caso | Definiciones de herramienta colocadas en el mensaje `user` en lugar del campo correspondiente: el modelo recurre al calculo mental |

No se dispone de mediciones de latencia, throughput ni consumo de memoria mas alla de las recomendaciones de memoria del autor recogidas en la seccion de hardware.

## Requisitos de hardware

- Memoria recomendada por el autor segun cuantizacion: Q4_K_M (1,45 GiB de archivo) unos 2 GB de memoria; Q8_0 (2,50 GiB de archivo) unos 3 GB; F16 (4,69 GiB de archivo) unos 5 GB. Son cifras de memoria del sistema indicadas para ejecucion en CPU o con offload parcial.
- GPU: no se especifican modelos concretos en la informacion disponible. Por tamano de pesos, cualquier GPU con 3-5 GB de VRAM libre puede alojar el modelo completo en Q8_0 o F16 respectivamente; no se publican mediciones en A100, H100 o RTX 4090.
- GPU de consumo: si, cabe en tarjetas de gama media y baja con al menos 3-4 GB de VRAM en cuantizaciones Q8_0 y Q4_K_M, y tambien puede ejecutarse integramente en CPU.
- Opciones de despliegue: Ollama (mediante el `Modelfile` incluido, por defecto apuntando a Q4_K_M), llama.cpp (`llama-cli` y `llama-server`) y cualquier runtime que consuma GGUF. Para tool calling es obligatorio el flag `--jinja` en llama.cpp, de forma que se use la plantilla de chat embebida en el GGUF.
- Rendimiento: no disponible. No se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

La informacion proporcionada no incluye especificaciones verificables de modelos alternativos de la misma categoria, por lo que no es posible establecer una comparacion con datos. La unica referencia disponible es el modelo base:

| Modelo | Parametros | Contexto | Licencia | Formatos | Rendimiento publicado |
|---|---|---|---|---|---|
| LycheeAI-coder-2b-II-pro-GGUF | 2.516.756.480 | No disponible (ejemplo con `-c 8192`) | Apache 2.0 | GGUF (F16, Q8_0, Q4_K_M) + Modelfile | 26/27 en validacion interna propia |
| openbmb/MiniCPM5-2B (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Otros modelos de tool calling de ~2B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Aritmetica sin herramientas: es el defecto mas relevante. Sin una instruccion de sistema que obligue a llamar a `calculate`, el modelo hace los calculos por su cuenta y falla; el autor cita ejemplos como `1234+5678 → 2000` y `13.5×4 → 7.8`. La causa declarada es que la mitad de las muestras de entrenamiento son multiplicaciones, lo que le hace aprender el caso particular "multiplicacion → herramienta" en lugar de la regla general "aritmetica → herramienta".
- Errores de identidad: si se le da un prompt de sistema generico junto a una lista de herramientas, puede afirmar ser otro modelo. La mitigacion indicada es declarar explicitamente su nombre en el prompt de sistema.
- Caracteres de control invisibles: en aproximadamente 1 de cada 15 muestras aparecen bytes como `\x08` en la salida. El autor recomienda filtrarlos en el host con una expresion regular antes de mostrar o procesar el texto.
- Tool calling no autodetectado por el runtime: los parsers automaticos de Ollama, que esperan envoltorios tipo `<tool_call>`, fallan de forma intermitente porque el modelo emite JSON plano. Es necesario implementar el parseo en el lado del host; el autor ofrece una implementacion de referencia.
- Definiciones de herramienta en el mensaje `user`: es el unico caso de fallo declarado de la validacion actual, en el que el modelo degrada al calculo mental. Las herramientas deben colocarse en el campo correspondiente de la API.
- Conjunto de entrenamiento muy reducido: 980 muestras y 490 pasos. El propio autor reconoce que el modelo esta limitado por ese presupuesto y que ampliarlo exigiria romper la restriccion de 500 pasos.
- Ausencia de benchmarks publicos: no hay resultados en pruebas estandar, solo una validacion interna de 27 casos disenada por el autor, por lo que las afirmaciones de calidad no son comparables con otros modelos.
- Idiomas: solo se declaran chino e ingles. El rendimiento en castellano no esta documentado ni evaluado.
- Licencia: Apache 2.0, que permite uso comercial, pero el modelo es un ajuste fino sobre openbmb/MiniCPM5-2B, de modo que conviene verificar tambien las condiciones del modelo base y las de los datos de entrenamiento, no detalladas en la informacion disponible.
- Madurez: la propia model card se presenta como un experimento de un desarrollador individual con capacidad limitada y recomienda revisar los problemas conocidos antes de plantear su uso en produccion.
- Fecha de publicacion: los metadatos del repositorio indican creacion y actualizacion el 2026-09-13, posteriores a la fecha habitual de consulta, dato que se reproduce tal cual figura en la informacion.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/whcl412/LycheeAI-coder-2b-II-pro-GGUF
- Repositorio principal con la metodologia y las limitaciones completas: https://huggingface.co/whcl412/LycheeAI-coder-2b-II-pro
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Replica en ModelScope: https://modelscope.cn/models/whcl412/LycheeAI-coder-2b-II-pro-GGUF
- Descarga directa del archivo Q8_0 desde HuggingFace: https://huggingface.co/whcl412/LycheeAI-coder-2b-II-pro-GGUF/resolve/main/LycheeAI-coder-2b-II-pro-q8_0.gguf
- Descarga directa del archivo Q8_0 desde ModelScope: https://modelscope.cn/models/whcl412/LycheeAI-coder-2b-II-pro-GGUF/resolve/master/LycheeAI-coder-2b-II-pro-q8_0.gguf
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a paginas sobre personajes de ficcion (Lustiges Taschenbuch, Wikipedia, Duckipedia) y no guardan relacion con este modelo.
