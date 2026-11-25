# SwordVer/verisql-adapters

## Resumen

VeriSQL adapters es una colección de adaptadores LoRA para el modelo Qwen2.5-Coder-1.5B-Instruct, orientados a la tarea de text-to-SQL (traducción de lenguaje natural a consultas SQL). El desarrollo corresponde a un proyecto académico de la asignatura UTS 43008 Reinforcement Learning (proyecto 56), cuyos autores son Aditya Verma, Eby Kurian y Pravicksha Paulsamy Vigneshkumar, publicados bajo el identificador SwordVer. El modelo base es un transformer decoder-only de 1.500 millones de parámetros con licencia Apache 2.0, sobre el que se aplican adaptadores de rango 16 y alpha 32 en las siete capas de proyección, con un tamaño de aproximadamente 74 MB por adaptador.

La relevancia del proyecto reside en su enfoque de entrenamiento: en lugar de ajuste supervisado clásico, emplea aprendizaje por refuerzo con recompensa de ejecución (GRPO y RLOO) y una variante multi-turno que permite al modelo observar la respuesta de la base de datos y corregir su consulta hasta tres veces. Sobre el conjunto de evaluación Spider dev, el adaptador RLOO alcanza un 75,6 % de exactitud de ejecución frente al 65,2 % del modelo base, y la variante multi-turno MT-GRPO obtiene un 72,2 % en Spider dev y un 36,5 % en BIRD dev. El repositorio incluye además un adaptador DPO como línea base offline, que no supera al modelo base.

El proyecto se distribuye con licencia MIT, incluye código de entrenamiento, registros y scripts de evaluación en un repositorio de GitHub, y está pensado como demostración reproducible de técnicas de RL aplicadas a generación de SQL. No obstante, su alcance es limitado: está entrenado únicamente sobre Spider (SQLite, inglés) y su rendimiento en BIRD dev permanece por debajo del 40 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-1.5B-Instruct) con adaptadores LoRA (rank 16, alpha 32, 7 capas de proyección) |
| Parametros totales | 1.500 millones (modelo base); adaptador LoRA de aproximadamente 74 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (entrenado sobre Spider, SQLite, en inglés); no se declaran otros idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. Sobre él se aplican adaptadores LoRA de rango 16 y alpha 32 en las siete capas de proyección, lo que mantiene el coste de entrenamiento bajo y permite distribuir cada adaptador en unos 74 MB. El entrenamiento se realiza sobre el conjunto Spider, con una recompensa de ejecución: la consulta generada se ejecuta sobre una copia de solo lectura de la base de datos y su resultado se compara con el de la consulta de referencia (+1 si coincide, 0 si es incorrecta, -0,1 si produce error).

Se publican cuatro adaptadores con estrategias distintas: `grpo-step400` (GRPO durante 400 pasos), `rloo-step600` (RLOO durante 600 pasos), `mt-grpo-step150` (GRPO hasta el paso 400 y después 150 pasos de GRPO multi-turno, que permite hasta tres turnos de corrección con una penalización de -0,05 por cambio) y `dpo-step100` (DPO durante 100 pasos, línea base offline). El entrenamiento se realizó con una única semilla por método. El prompt incluye un system prompt, el esquema de la base de datos con valores de ejemplo y etiquetas `<answer></answer>`, y el bucle de autocorrección está implementado en `verisql/core.py`.

## Capacidades

- Generación de consultas SQL a partir de lenguaje natural sobre esquemas SQLite.
- Razonamiento iterativo con retroalimentación de ejecución: la variante MT-GRPO puede leer la respuesta de la base de datos y corregir su consulta hasta tres turnos.
- Autocorrección de errores sintácticos o semánticos detectados al ejecutar la consulta.
- Evaluación de la validez de la consulta mediante ejecución real contra la base de datos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado al bucle de autocorrección de hasta tres turnos.
- Capacidades multilingües: no disponibles; el entrenamiento es en inglés.
- Capacidades especiales: modo de razonamiento con recompensa de ejecución y variante multi-turno con penalización por cambios.

## Casos de uso

- Asistente de consultas para analistas de datos: el adaptador traduce preguntas en inglés a SQL sobre esquemas SQLite, con la posibilidad de ejecutar la consulta y corregirla si falla, lo que reduce la intervención manual en exploraciones ad hoc.
- Generación de SQL en pipelines de análisis: integrado en un servicio que recibe una pregunta y un esquema, devuelve la consulta y la ejecuta en modo de solo lectura, aprovechando la recompensa de ejecución para filtrar consultas inválidas.
- Enseñanza y demostración de RL aplicado a código: el repositorio incluye código, registros y resultados que permiten reproducir el entrenamiento con GRPO, RLOO y DPO sobre un modelo pequeño, útil en cursos y laboratorios.
- Evaluación comparativa de algoritmos de RL: los cuatro adaptadores publicados permiten contrastar GRPO, RLOO, DPO y GRPO multi-turno sobre la misma base y el mismo conjunto de datos.
- Prototipado de agentes de bases de datos: el bucle multi-turno de MT-GRPO sirve como base para sistemas que iteran sobre el resultado de una consulta antes de responder al usuario.
- Generación de consultas en entornos de solo lectura: dado que el modelo está entrenado con ejecución sobre copias de solo lectura, encaja en herramientas internas de exploración de datos donde no se permite escritura.
- Investigación sobre recompensas de ejecución: la comparación entre exactitud de ejecución y corrección de respuestas correctas (MT-GRPO no rompió ninguna respuesta correcta, frente a 6 y 7 roturas de GRPO sin entrenamiento multi-turno) ofrece un punto de partida para estudiar estabilidad del ajuste por refuerzo.

## Benchmarks y rendimiento

Exactitud de ejecución con los scripts oficiales de evaluación (fase 1, un solo turno):

| Modelo | Spider dev | BIRD dev |
|---|---|---|
| Modelo base (Qwen2.5-Coder-1.5B-Instruct) | 65,2 % | 29,1 % |
| DPO (100 pasos) | 62,7 % | 27,8 % |
| GRPO (400 pasos) | 74,6 % | 36,1 % |
| RLOO (600 pasos) | 75,6 % | 37,0 % |

Resultados multi-turno (exactitud estricta tras retroalimentación):

| Modelo | Spider dev | BIRD dev | Respuestas correctas rotas |
|---|---|---|---|
| MT-GRPO (150 pasos multi-turno) | 72,2 % | 36,5 % | 0 en Spider dev, 0 en BIRD dev |
| GRPO sin entrenamiento multi-turno | no disponible | no disponible | 6 en Spider dev, 7 en BIRD dev |

Los resultados corresponden a una única semilla de entrenamiento por método.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de un modelo base de 1.500 millones de parámetros más un adaptador LoRA de 74 MB, la huella es la del modelo base.
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: no confirmado en la información proporcionada; el tamaño del modelo base (1.500 millones de parámetros) es compatible con GPU de consumo de gama media-alta, pero no se aportan cifras verificadas.
- Opciones de despliegue: carga mediante `peft.PeftModel` y `transformers.AutoModelForCausalLM` según el ejemplo de la model card; no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Spider dev | BIRD dev | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VeriSQL (RLOO, adaptador sobre Qwen2.5-Coder-1.5B-Instruct) | 1.500 M + LoRA | no disponible | 75,6 % | 37,0 % | MIT | Hugging Face (adaptadores) |
| Qwen2.5-Coder-1.5B-Instruct (modelo base) | 1.500 M | no disponible | 65,2 % | 29,1 % | Apache 2.0 | Hugging Face |
| VeriSQL (DPO) | 1.500 M + LoRA | no disponible | 62,7 % | 27,8 % | MIT | Hugging Face (adaptadores) |

No se dispone de datos de otros modelos comparables de text-to-SQL en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente sobre Spider (SQLite, inglés); no se garantiza su comportamiento en otros dialectos SQL ni en otros idiomas.
- La exactitud en BIRD dev permanece por debajo del 40 %, lo que limita su uso en bases de datos complejas o esquemas grandes.
- La exactitud de ejecución puede contabilizar como correcta una consulta errónea que devuelve por casualidad las filas esperadas.
- El adaptador DPO no supera al modelo base, por lo que no debe elegirse como opción principal.
- Los resultados provienen de una única semilla de entrenamiento por método; la variabilidad entre ejecuciones no está caracterizada.
- Riesgo de alucinación de tablas, columnas o valores no presentes en el esquema; el bucle de autocorrección mitiga parte del problema, pero no lo elimina.
- Las consultas generadas deben ejecutarse siempre en modo de solo lectura, tal como advierte el autor.
- Licencia MIT para los adaptadores; el modelo base Qwen2.5-Coder-1.5B-Instruct se distribuye con licencia Apache 2.0, que debe respetarse en uso comercial.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SwordVer/verisql-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio con código, registros de entrenamiento y resultados: https://github.com/ayv443/verisql
- Conjunto de datos Spider: https://huggingface.co/datasets/xlangai/spider
