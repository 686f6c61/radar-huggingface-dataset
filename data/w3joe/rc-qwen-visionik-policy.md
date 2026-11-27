# w3joe/rc-qwen-visionik-policy

## Resumen

`rc-qwen-visionik-policy` es un repositorio de pesos publicado por el usuario w3joe que contiene una copia sin modificar de Qwen3-VL-8B-Instruct, el modelo vision-language de 8 mil millones de parametros desarrollado por el equipo Qwen de Alibaba Cloud. No se trata de un fine-tuning ni de un modelo nuevo: el autor lo redistribuye tal cual (cuatro shards safetensors en bf16, configuracion, tokenizer y processor) para que sirva como planificador dentro de una politica robotica denominada Reality Check.

La politica completa combina ese planificador neuronal con un pipeline puramente clasico: vision por computador tradicional sobre camaras RGB (segmentacion por color y forma, triangulacion multivista, estimacion de pose), un controlador de cinematica inversa amortiguada sobre un modelo UR12e y un modulo de insercion y asentamiento denominado placement-v2. El VLM se invoca una sola vez por episodio, en decodificacion greedy, para traducir la instruccion en lenguaje natural y las imagenes de meta y camara en una lista ordenada de objetivos; el resto de la ejecucion son calculos de milisegundos.

Su relevancia es metodologica: demuestra que un VLM generalista sin entrenamiento adicional puede actuar como capa de planificacion de alto nivel en manipulacion robotica, delegando la precision en control clasico. El resultado juzgado es 16 de 24 episodios resueltos (0,672 en la metrica del runner v1) sobre dos tareas publicas y cuatro ocultas, con un pico de memoria de 19,6 GiB en una H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL), pesos sin modificar |
| Parametros totales | 8 mil millones (aproximado, segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 en el repositorio; no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards), mas config, tokenizer y processor |

## Arquitectura y entrenamiento

El unico componente neuronal es Qwen3-VL-8B-Instruct en su version original, redistribuido sin cambios. El autor declara explicitamente que no se entrena nada y que ningun otro fichero de `/weights` se carga. El modelo se usa en modo offline, cargado por ruta desde `RC_WEIGHTS_DIR/qwen3_vl_8b`, con decodificacion greedy para generar el plan.

Alrededor del VLM, la politica implementa una maquina de estados cerrada: cinematica inversa con minimos cuadrados amortiguados y limites, verificacion del agarre a partir de propiocepcion, recuperacion mediante empujes correctivos y habilidades especificas por objetivo (bandeja, tornillo a agujero, tuerca a alojamiento hexagonal). El acabado placement-v2 realiza insercion sensible al tamano con descenso guiado por contacto, compuerta de liberacion y verificacion posterior; la ruta v2 para tornillo esta desactivada. Si la llamada al planificador falla o no devuelve nada ejecutable, se recurre a un parser de instrucciones codificado a mano.

## Capacidades

- Planificacion de alto nivel: interpreta una instruccion en lenguaje natural junto con imagenes de meta y de camara y devuelve una lista ordenada de objetivos de ensamblaje.
- Comprension imagen-texto: pipeline `image-text-to-text` con entrada multimodal.
- Razonamiento sobre objetos y destinos: identifica que pieza va a que asiento segun la descripcion.
- Integracion con control clasico: el plan se traduce en habilidades ejecutables sobre un UR12e.
- Tolerancia a fallos del planificador: fallback a parser determinista si la inferencia no produce salida utilizable.
- No soporta, en este uso, tool calling, agentes multi-paso ni modos de pensamiento extendido: se invoca una vez por episodio en modo greedy.

## Casos de uso

- Evaluacion de politicas roboticas en Reality Check: el repositorio se monta en `/weights` y se ejecuta con la imagen `rc-policy` fijada y el runner `rc-engine:8651b1b4` para reproducir los resultados publicados.
- Planificacion de ensamblaje pieza-asiento: dado un comando como colocar el tornillo en el fixture, el VLM genera la secuencia de metas que el controlador IK ejecuta con verificacion de agarre.
- Benchmarking de VLM como planificadores: sirve para medir latencia (3,3-4,8 s por llamada) y tasa de planes ejecutables frente a alternativas.
- Prototipado de pipelines hibridos VLM mas vision clasica: util para equipos que quieran sustituir el planificador por otro modelo manteniendo percepcion y control.
- Docencia e investigacion en robotica de manipulacion: el codigo es Python puro y la politica no depende de controladores aprendidos, lo que facilita el analisis.
- Pruebas de robustez ante tareas ocultas: los resultados por tarea (por ejemplo 0 de 4 en hidden_4) permiten estudiar donde falla la planificacion y el acabado.

## Benchmarks y rendimiento

Resultados juzgados por el runner de Reality Check, 24 episodios (2 tareas publicas y 4 ocultas, 4 repeticiones cada una), presupuesto acumulado de 60 s de `/act`, una H100:

| Tarea | Exito | v1 media | v2 (Q=0 .. Q=1) | Pasos medios | Motivos de fin |
|---|---|---|---|---|---|
| bolt_and_nut_to_fixture | 3/4 | 0,762 | 54,8 .. 68,2 | 682 | done 3, step_limit 1 |
| bolt_to_tray | 4/4 | 0,972 | 70,0 .. 110,3 | 113 | done 4 |
| hidden_1 | 4/4 | 0,892 | 70,0 .. 89,8 | 431 | done 4 |
| hidden_2 | 2/4 | 0,574 | 36,8 .. 59,3 | 637 | done 2, step_limit 2 |
| hidden_3 | 3/4 | 0,762 | 53,3 .. 82,2 | 396 | done 3, step_limit 1 |
| hidden_4 | 0/4 | 0,199 | 4,3 | 1200 | step_limit 4 |
| Total | 16/24 | 0,672 | 46,4 .. 66,5 | | |

La replicacion con las mismas semillas dio 0,660 en v1 (46,2 .. 66,2 en v2), pero no constituye evidencia independiente. El ruido honesto del total se estima en mas o menos 0,05. El pico de memoria de la politica fue de 19,6 GiB, la carga del modelo de 17 a 19 s con cache de paginas caliente, la llamada al planificador de 3,3 a 4,8 s, el `/act` mas lento de unos 6,7 s y la mediana por paso de unos 2,5 ms. No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el pico medido de la politica completa es de 19,6 GiB en bf16; una GPU de 24 GB es el minimo practico.
- GPU recomendadas: H100 (usada en la evaluacion publicada); A100 de 40 u 80 GB y L40S son opciones razonables por capacidad.
- GPU de consumo: una RTX 4090 de 24 GB queda en el limite; no hay datos publicados de ejecucion en consumer.
- Despliegue: transformers con carga offline por ruta; el autor no documenta vLLM, llama.cpp, Ollama ni TGI para esta politica.
- Latencia y throughput: planificador 3,3-4,8 s por episodio; pasos de control con mediana de 2,5 ms; presupuesto de 60 s acumulados de `/act` por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rc-qwen-visionik-policy | 8 B (VLM) + control clasico | no disponible | Planificador VLM mas vision e IK clasicos | Apache 2.0 | Hugging Face y GitHub |
| Qwen/Qwen3-VL-8B-Instruct | 8 B | no disponible | VLM generalista, sin capa robotica | Apache 2.0 | Hugging Face |
| Politicas VLA entrenadas de extremo a extremo | variable | no disponible | Red unica percepción-accion entrenada | variable | no disponible |

La comparacion con otras politicas roboticas publicadas no esta disponible en la informacion proporcionada; el unico punto de referencia directo es el modelo base sin modificaciones.

## Limitaciones y advertencias

- No es un modelo nuevo ni afinado: cualquier mejora atribuible al VLM procede de Qwen3-VL-8B-Instruct original.
- El planificador se invoca una sola vez por episodio; un plan erroneo no se corrige durante la ejecucion y arrastra el episodio completo.
- Resultados limitados: 24 episodios, 4 por tarea, con ruido estimado de mas o menos 0,05 y una replicacion no independiente.
- Fallo sistematico en hidden_4 (0 de 4, 1200 pasos, limite alcanzado): la politica no resuelve esa tarea.
- Todos los episodios fallidos terminaron por limite de pasos, no por excepcion, timeout ni exceso de presupuesto de `/act`.
- Dependencia fuerte de vision clasica por color y forma: cambios de iluminacion, oclusiones o piezas de aspecto similar pueden degradar la percepcion.
- La ruta v2 para tornillo esta desactivada; el comportamiento en esa variante no esta validado.
- Idiomas soportados no documentados; el uso previsto es instrucciones en el entorno del benchmark.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el codigo de la politica vive en un repositorio GitHub separado y debe versionarse junto con los pesos.

## Enlaces

- Pesos en Hugging Face: https://huggingface.co/w3joe/rc-qwen-visionik-policy
- Codigo de la politica: https://github.com/w3joe/rc-qwen-visionik-policy
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
