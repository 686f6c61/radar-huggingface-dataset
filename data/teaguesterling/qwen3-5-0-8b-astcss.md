# teaguesterling/qwen3.5-0.8b-astcss

## Resumen

Qwen3.5-0.8b-astcss es un ajuste fino supervisado del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario teaguesterling, que traduce una peticion en ingles sobre codigo fuente a un unico selector astcss: una consulta con sintaxis tipo CSS que se ejecuta sobre un arbol de sintaxis abstracta (AST) mediante `ast_select` del proyecto sitting_duck. Por ejemplo, "methods of the Parser class" se convierte en `.class#Parser .fn` y "calls to sleep" en `.call#sleep`. No es un modelo de proposito general: es un traductor de intencion a consulta estructurada, con una salida de aproximadamente 6 tokens por respuesta y decodificacion greedy con el modo thinking desactivado.

El modelo tiene 752.393.024 parametros (unos 0,75 mil millones) y un repositorio de 1,5 GB. Se obtuvo aplicando un LoRA de r=16 y alpha=32 sobre todas las capas lineales durante 2 epocas, con lr 2e-4, en float16 sobre una unica RTX 2080 Ti, y despues fusionando el adaptador en los pesos base y verificando numericamente que los deltas se habian aplicado (186 tensores afectados, max|Δ| 4,6e-3). El resultado es un modelo de solo texto guardado como `Qwen3_5ForCausalLM`: no incluye la torre de vision (`model.visual.*`) ni la cabeza de prediccion multi-token (`mtp.*`) del modelo base.

Su relevancia es muy concreta y de nicho: demuestra que un modelo de menos de mil millones de parametros, con un entrenamiento de 820 pares verificados por ejecucion, puede superar en su tarea especializada a modelos prompteados de 9B a 35B y quedar a unos 7 puntos de un 4B ajustado con LoRA. Es un caso de estudio de destilacion de una tarea verificable (la consulta se ejecuta y se comprueba el conjunto de nodos devuelto) en un modelo que cabe en cualquier GPU consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, guardado como `Qwen3_5ForCausalLM` sobre Qwen3.5-0.8B; build de solo texto |
| Parametros totales | 752.393.024 (~0,75 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; no se publican pesos GGUF ni cuantizados en el repositorio |
| Idiomas soportados | no disponible como listado oficial; la model card describe peticiones "en ingles sencillo" y el entrenamiento cubre Python, C, C++, Rust, Go, Java, JavaScript, SQL y Bash |
| Licencia | no disponible; el autor indica que hereda la licencia y los terminos de Qwen/Qwen3.5-0.8B |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamano del repositorio | 1,5 GB |
| Pipeline declarado | text-generation |
| Decodificacion recomendada | greedy, thinking desactivado, ~6 tokens de salida por respuesta |
| Dependencia obligatoria | tarjeta de vocabulario por lenguaje en el system prompt (`train/cards/card_<lang>.md`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer decoder-only, del que este repositorio conserva unicamente la parte de texto. El autor elimina explicitamente la torre de vision (`model.visual.*`) y la cabeza de prediccion multi-token (`mtp.*`) del modelo base, de modo que el checkpoint publicado es causal-LM puro y no puede realizar tareas multimodales aunque el modelo original si pudiera. No se detalla en la informacion disponible el numero de capas, dimensiones ocultas, atencion (GQA/MHA) ni la longitud de contexto del base.

El entrenamiento consistio en un LoRA de r=16, alpha=32, con todas las capas lineales como objetivo, 2 epocas, learning rate 2e-4, semilla 18, en float16 y sobre una sola RTX 2080 Ti. El conjunto de datos son 820 pares verificados por ejecucion, repartidos entre nueve lenguajes (Python, C, C++, Rust, Go, Java, JavaScript, SQL, Bash) y limitados a un maximo de 8 ejemplos por combinacion de plantilla de peticion y forma de selector. El filtrado es inusualmente estricto para un ajuste de este tamano: cada par se ejecuto contra codigo real y solo se conservo si su selector devolvia entre 1 y 50 nodos, si cada modificador cambiaba el conjunto de nodos resultante, si sus distractores devolvian conjuntos distintos y si ninguna respuesta de evaluacion se habia filtrado al conjunto de entrenamiento. No se menciona RLHF ni DPO; el ajuste es puramente supervisado y la fusion del adaptador se valido numericamente antes de subir los pesos.

## Capacidades

- Traduccion de peticiones en lenguaje natural a un unico selector astcss, con sintaxis de clase, identificador, pseudo-clases y modificadores (`.class#Parser .fn`, `.fn:not(:has(.throw))`, `.call#sleep`, `with_statement`).
- Cobertura de selectores de nivel 1 a 4, segun la propia taxonomia del autor (clases, funciones, llamadas, bloques y estructuras de control).
- Consultas sobre AST de Python, C, C++, Rust, Go, Java, JavaScript, SQL y Bash, en la medida en que el vocabulario del lenguaje correspondiente este presente en la tarjeta enviada en el system prompt.
- Salida extremadamente corta y predecible (unos 6 tokens), lo que la hace apta para ejecutarse dentro de un pipeline con verificacion posterior por ejecucion.
- Modo conversacional heredado del base: puede comportarse como chatbot, pero eso es un fallo en su caso de uso (la model card documenta que responde "Here are the most effective ways to find…" si falta la tarjeta).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo thinking en este build; el autor recomienda decodificar con el thinking desactivado.
- No hay datos publicados sobre capacidades multilingues fuera del ingles en las peticiones.

## Casos de uso

- Navegacion y busqueda semantica en repositorios: el modelo convierte una pregunta como "funciones que nunca lanzan excepciones" en `.fn:not(:has(.throw))`, que `ast_select` ejecuta sobre el arbol real y devuelve el conjunto exacto de nodos. Es util como capa de traduccion en un IDE o en una CLI de busqueda estructural.
- Refactorizacion asistida con verificacion previa: antes de aplicar un cambio masivo, el modelo genera el selector que identifica todos los puntos afectados (por ejemplo, todas las llamadas a `sleep`), y la herramienta los lista para revision humana.
- Reglas de lint personalizadas: el selector generado puede actuar como patron de deteccion de anti-patrones (bloques `with` sin uso, funciones que siempre lanzan, llamadas concretas) sin escribir expresiones regulares ni visitantes de AST a mano.
- Integracion en CI/CD: dado que la salida es de unos 6 tokens y el coste de inferencia es minimo, se puede ejecutar en cada pull request para etiquetar o bloquear cambios que toquen patrones prohibidos definidos en lenguaje natural.
- Auditoria de codigo heredado en varios lenguajes: al cubrir nueve lenguajes, permite plantear la misma pregunta estructural ("todas las clases con metodo `parse`") sobre bases de codigo heterogeneas con un unico interfaz de consulta.
- Analisis estatico multi-lenguaje como paso previo a herramientas mas caras: usar el selector para reducir el conjunto de nodos candidatos y despues aplicar analisis semantico o de flujo unicamente sobre esos nodos.
- Extraccion de metricas de codigo: combinado con `ast_select`, contar llamadas a una funcion de red, localizar todos los bloques de manejo de errores o inventariar funciones publicas para generar informes de deuda tecnica.
- Interfaz de consulta para bases de codigo desconocidas: un desarrollador nuevo en un repositorio formula preguntas en ingles y obtiene directamente las localizaciones relevantes, sin aprender la sintaxis astcss.

## Benchmarks y rendimiento

Evaluacion de coincidencia de ejecucion sobre 108 pares reservados: una prediccion solo cuenta si, al ejecutarla, devuelve exactamente el mismo conjunto de nodos que la referencia, sobre un fixture real y a traves del motor.

| Modelo | Match global | T1 | T2 | T3 | T4 |
|---|---|---|---|---|---|
| qwen3.5-0.8b-astcss | 82,4 % | 19/21 | 17/25 | 25/31 | 28/31 |
| Qwen3.5-0.8B sin ajustar, misma tarjeta | 26,9 % | 10/21 | 12/25 | 5/31 | 2/31 |

Datos adicionales aportados por el autor:

- Sin el system prompt con la tarjeta del lenguaje, la puntuacion cae a 0,0 %: el modelo responde como un chatbot generico en lugar de emitir un selector.
- El modelo no fue entrenado con selectores de nivel 5 (grafo de llamadas, ambito, receptores) y ronda el 31 % en ese nivel.
- Con 1,6 GB, el autor indica que supera a varios modelos de 9B a 35B prompteados con la misma tarjeta y queda unos 7 puntos por debajo de un 4B ajustado con LoRA. No se nombran esos modelos en la informacion disponible.
- No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los 752.393.024 parametros ocupan aproximadamente 1,5 GB en fp16 (el repositorio pesa 1,5 GB), unos 0,8 GB en int8 y alrededor de 0,4-0,5 GB en cuantizacion de 4 bits. A ello hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto, que no esta publicada. Son estimaciones a partir del numero de parametros, no cifras oficiales.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. El propio autor entreno el LoRA en una RTX 2080 Ti. Una RTX 4090, RTX 3090, RTX 3060 de 12 GB o incluso una GPU integrada con suficiente memoria compartida pueden ejecutarlo.
- Cabe holgadamente en GPU consumer, y es probable que tambien en CPU con un runtime optimizado, aunque no hay datos publicados de latencia en CPU.
- Opciones de despliegue: transformers (libreria declarada y unica soportada oficialmente), ademas de servidores compatibles con el formato safetensors y la arquitectura `Qwen3_5ForCausalLM` como vLLM o TGI. El tag `endpoints_compatible` del repositorio sugiere compatibilidad con endpoints gestionados. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion propia, y no se garantiza que la arquitectura este soportada en esos runtimes.
- Latencia y throughput: no disponibles. Como referencia indirecta, la salida tipica es de aproximadamente 6 tokens por respuesta con decodificacion greedy, por lo que el cuello de botella sera el prefill del prompt (que incluye la tarjeta del lenguaje en la posicion de sistema) mas que la generacion.

## Comparativa con modelos similares

No se dispone de datos publicados de alternativas nominales, pero la propia model card permite establecer estas comparaciones:

| Modelo | Parametros | Contexto | Match (108 pares) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-0.8b-astcss | ~0,75 B | no disponible | 82,4 % | hereda la de Qwen3.5-0.8B | safetensors en HuggingFace |
| Qwen3.5-0.8B sin ajustar, con la misma tarjeta | ~0,8 B | no disponible | 26,9 % | la del modelo base Qwen | HuggingFace |
| 4B ajustado con LoRA (sin nombrar) | ~4 B | no disponible | ~89,4 % (unos 7 puntos por encima) | no disponible | no disponible |
| Varios modelos de 9B a 35B prompteados con la misma tarjeta | 9-35 B | no disponible | por debajo de 82,4 % | no disponible | no disponible |

La conclusion que puede extraerse es que, para esta tarea concreta, el tamano no es el factor determinante: el ajuste con datos verificados por ejecucion aporta la mayor parte de la ganancia, y el modelo resultante es competitivo frente a alternativas entre 12 y 45 veces mas grandes en parametros.

## Limitaciones y advertencias

- Dependencia critica del system prompt: sin la tarjeta de vocabulario del lenguaje correspondiente, la puntuacion cae a 0,0 % y el modelo se comporta como un chatbot generico. Cualquier despliegue en produccion debe garantizar que la tarjeta se inyecta correctamente y que el thinking esta desactivado.
- Alcance limitado a selectores de nivel 1 a 4. No ha sido entrenado con selectores de nivel 5 (grafo de llamadas, ambito, receptores) y ronda el 31 % en ellos.
- Cobertura de lenguajes de programacion limitada a los nueve del entrenamiento; no hay evidencia de generalizacion a otros lenguajes fuera de esa lista.
- Admite una sola peticion en ingles y produce un unico selector por consulta: no descompone peticiones compuestas ni mantiene conversaciones multi-turno utiles.
- Riesgo de alucinacion estructural: puede emitir un selector sintacticamente plausible que no devuelva el conjunto de nodos esperado. La mitigacion natural es ejecutar siempre el selector con `ast_select` y validar el resultado, tal como se hizo en su evaluacion.
- El modelo no devuelve los nodos, solo la consulta; no sustituye al motor de ejecucion ni a un analisis semantico.
- Licencia no declarada explicitamente en la ficha de HuggingFace. El autor afirma que hereda la licencia y los terminos de Qwen/Qwen3.5-0.8B, por lo que es imprescindible revisar esos terminos antes de un uso comercial; no hay confirmacion independiente de la licencia aplicable.
- Build de solo texto: no incluye la torre de vision ni la cabeza de prediccion multi-token del modelo base, por lo que no puede usarse para tareas multimodales ni aprovechar la decodificacion especulativa de MTP.
- No hay pesos cuantizados publicados ni datos de rendimiento en CPU, y no se garantiza soporte de la arquitectura en llama.cpp u Ollama.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos ni la composicion demografica o linguistica del corpus. El entrenamiento se limita a 820 pares, cantidad muy reducida, lo que hace probable un sobreajuste a las formas de selector y a las plantillas de peticion vistas durante el entrenamiento.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no proporciona una version de la tarjeta de vocabulario fijada por hash, lo que puede introducir variaciones si el repositorio `astcss-eval` cambia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/teaguesterling/qwen3.5-0.8b-astcss
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Motor de ejecucion sitting_duck: https://github.com/teaguesterling/sitting_duck
- Repositorio de evaluacion y tarjetas de vocabulario (`train/cards/card_<lang>.md`): https://github.com/teaguesterling/astcss-eval
- Resultados de la busqueda web: la busqueda realizada no devolvio resultados tecnicos relevantes, unicamente enlaces a TikTok sin relacion con el modelo.
