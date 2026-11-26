# udgamlabs/Lilavati-GGUF

## Resumen

Lilavati-GGUF es la distribucion en formato GGUF de Lilavati, un modelo de lenguaje de 94.732.876 parametros (aproximadamente 95M) entrenado desde cero por Udgam Labs, un laboratorio de investigacion independiente. El modelo no responde a preguntas matematicas directamente: su funcion es escribir un pequeno programa en Python que, al ejecutarse, resuelve el problema de enunciado planteado. Esta especializacion lo aleja de los chatbots generalistas y lo situa como una pieza de un pipeline program-aided.

El repositorio contiene dos artefactos complementarios: `Lilavati-Q8_0.gguf` (102 MB), que genera los programas, y `Lilavati-Checker-Q8_0.gguf` (102 MB), un segundo modelo de 95M parametros que puntua cada programa con una probabilidad de ser correcto. Esa puntuacion permite hacer votacion entre varios intentos, lo que mejora la fiabilidad del resultado final. Ambos se distribuyen cuantizados en 8 bits (q8_0) y estan pensados para llama.cpp y para ejecucion en navegador mediante WebAssembly.

Su relevancia actual reside en el enfoque: un modelo diminuto, entrenado desde cero y con licencia Apache-2.0, que demuestra que la resolucion de problemas de enunciado de nivel escolar puede abordarse con program-aided reasoning en lugar de escalar parametros. La contraccion es notable: el modelo solo soporta ingles, no es conversacional y su ventana de contexto no esta documentada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de capas y atencion no disponibles) |
| Parametros totales | 94.732.876 (aproximadamente 95M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (derivado de safetensors originales) |

## Arquitectura y entrenamiento

Lilavati es un transformer de aproximadamente 95M de parametros entrenado from scratch por Udgam Labs. La informacion disponible no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni la composicion exacta del dataset de entrenamiento. Tampoco se especifica si hubo fases de RLHF, DPO o ajuste por preferencias. Lo que si se documenta es el paradigma de entrenamiento funcional: el modelo aprende a transformar un enunciado en un programa Python ejecutable, y un segundo modelo (Lilavati-Checker) aprende a evaluar la correccion de ese programa dado el enunciado, el codigo y el resultado de la ejecucion.

La innovacion tecnica principal no esta en la arquitectura sino en el diseno del sistema: program-aided reasoning con verificacion por votacion. El checker produce una probabilidad de " yes" frente a " no", normalizada sobre ambas etiquetas, y esa probabilidad se usa como peso en una votacion entre multiples intentos (8 o 48 en las cifras reportadas por el autor). Los ficheros GGUF se generaron con `convert_hf_to_gguf.py` de llama.cpp (commit `d7a695e`) con `--outtype q8_0`, redondeando los pesos a 8 bits sin otros cambios.

## Capacidades

- Generacion de programas Python a partir de enunciados de problemas matematicos de nivel escolar.
- Razonamiento program-aided: delega el calculo en la ejecucion del codigo generado.
- Evaluacion de correccion mediante el modelo auxiliar Lilavati-Checker, que emite una probabilidad de acierto.
- Votacion ponderada entre multiples intentos para seleccionar la respuesta final.
- Ejecucion en navegador mediante wllama (llama.cpp compilado a WebAssembly) y Pyodide para correr el codigo en un Web Worker.
- Integracion con llama.cpp mediante `llama-completion` y prompts de continuacion.
- No soporta tool calling general, function calling, agentes multi-paso ni modo thinking.
- No es un chatbot: no mantiene conversacion multi-turno.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Resolucion de problemas de enunciado en ingles de nivel primaria y secundaria: el modelo recibe la pregunta y devuelve un programa Python que calcula la respuesta, adecuado para entornos educativos donde se quiere mostrar el razonamiento computacional.
- Verificacion automatica de soluciones: combinando Lilavati con Lilavati-Checker se puede puntuar la probabilidad de correccion de cada programa generado y filtrar respuestas de baja confianza antes de mostrarlas.
- Votacion por consenso en pipelines de evaluacion: generar 8 o 48 programas por pregunta y ponderar los votos con las probabilidades del checker, util en benchmarks internos de aritmetica.
- Demos interactivas en navegador sin backend: al ser GGUF de 102 MB y ejecutarse con wllama, el par de modelos cabe en una pagina web y corre en el dispositivo del usuario, sin enviar datos a un servidor.
- Prototipado de sistemas program-aided: sirve como banco de pruebas para arquitecturas de generate-execute-verify con modelos pequenos antes de escalar a modelos mayores.
- Generacion de ejercicios con solucion verificable: el programa Python generado actua como justificacion ejecutable de la respuesta, lo que facilita la auditoria del resultado.
- Investigacion sobre entrenamiento from scratch en dominios acotados: un caso de estudio de 95M parametros para medir cuanto puede especializarse un modelo diminuto con datos y objetivos bien definidos.

## Benchmarks y rendimiento

Los datos publicados por el autor se refieren a la comparacion entre los GGUF Q8_0 y el modelo original en float32, no a benchmarks estandar frente a otros modelos.

| Metrica | Resultado |
|---|---|
| Programas identicos a float32 (100 preguntas GSM8K test, greedy) | 86 de 100 |
| Misma respuesta final que float32 | 95 de 100 |
| Aciertos con un programa greedy (Q8_0) | 59 de 100 |
| Aciertos con un programa greedy (float32) | 60 de 100 |
| Diferencia media del checker frente a float32 (96 programas) | 0.0005 (mediana), maximo 0.036 |
| Coincidencia de la votacion ponderada por el checker (12 de 12) | 12 de 12 |
| Programas generados en navegador identicos a llama.cpp nativo | 100 de 100 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K completos) en la informacion disponible mas alla de las cifras parciales sobre las primeras 100 preguntas del test de GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 102 MB por modelo en Q8_0; unos 204 MB si se cargan Lilavati y Lilavati-Checker simultaneamente.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM libre es suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en hardware integrado.
- Despliegue: llama.cpp (`llama-completion`), wllama en navegador, y potencialmente Ollama y LM Studio (el autor indica que estos dos ultimos no fueron probados).
- Ejecucion del codigo generado: requiere un sandbox, por ejemplo el paquete `lilavati` (`lilavati/safe_exec.py`) o Pyodide en un Web Worker con limite de tiempo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lilavati-GGUF | 95M (+95M checker) | no disponible | Program-aided para problemas de enunciado | Apache-2.0 | GGUF en Hugging Face |
| Modelos de matematicas de gran escala (p. ej. familias de 7B+) | miles de millones | decenas de miles de tokens | Razonamiento directo y chain-of-thought | variable | safetensors, GGUF |
| Modelos pequenos generalistas (tipo 100M-1B) | 100M-1B | variable | Texto general, no especializado en matematicas | variable | multiples formatos |

La comparacion directa con alternativas de la misma categoria (modelos de ~95M especializados en matematicas con verificador) no esta disponible en la informacion proporcionada. Lilavati se distingue por el par modelo+checker y por el enfoque program-aided, pero carece de datos publicos de benchmarks estandar que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Debil en problemas con numeros que deberian ignorarse.
- Debil en problemas que requieren trabajar hacia atras.
- Debil en conversiones de unidades.
- Devuelve siempre un numero, incluso ante preguntas sin respuesta; no detecta la ausencia de solucion.
- No es un chatbot ni soporta conversacion multi-turno.
- Solo soporta ingles.
- Longitud de contexto no documentada, lo que limita la planificacion en produccion.
- Riesgo de alucinacion en la generacion del programa: el codigo puede ejecutarse sin error y producir un resultado incorrecto; por eso el checker y la votacion son parte del diseno.
- La ejecucion del codigo generado exige sandbox obligatorio; ejecutarlo fuera de un entorno aislado es un riesgo de seguridad.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre correccion en dominios fuera de los problemas de enunciado escolares.
- Ollama y LM Studio no fueron probados por el autor con estos ficheros.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/udgamlabs/Lilavati-GGUF
- Modelo base: https://huggingface.co/udgamlabs/Lilavati
- Checker: https://huggingface.co/udgamlabs/Lilavati-Checker
- Pagina del modelo en Udgam Labs: https://udgamlabs.com/models/lilavati
- Demo en navegador: https://udgamlabs.com/models/lilavati#try
- Notas de investigacion: https://udgamlabs.com/research/lilavati
- Repositorio del paquete `lilavati`: https://github.com/udgamlabs/lilavati
- wllama (llama.cpp en WebAssembly): https://github.com/ngxson/wllama
- Pyodide: https://pyodide.org
- Sitio de Udgam Labs: https://udgamlabs.com
