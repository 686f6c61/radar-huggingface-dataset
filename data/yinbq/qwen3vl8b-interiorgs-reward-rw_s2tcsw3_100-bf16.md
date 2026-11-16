# yinbq/qwen3vl8b-interiorgs-reward-rw_s2tcsw3_100-bf16

## Resumen

El modelo `yinbq/qwen3vl8b-interiorgs-reward-rw_s2tcsw3_100-bf16` es un ajuste fino de Qwen3-VL-8B-Instruct orientado a navegacion espacial activa en escenas interiores del conjunto InteriorGS. Dado un par formado por la vista de camara actual y la pose correspondiente, el modelo emite una secuencia de acciones de camara (`move_forward`, `move_backward`, `move_left`, `move_right`, `turn_left`, `turn_right`) cuyo objetivo es alcanzar un punto de vista que satisfaga una tarea espacial: distancia a un objeto, encuadre de objetos en la vista, oclusion, relaciones proyectivas, ocupacion de pantalla o equidistancia.

El desarrollo corre a cargo del usuario de Hugging Face `yinbq` y parte del modelo base Qwen/Qwen3-VL-8B-Instruct, sobre el que se aplica primero un SFT con trayectorias de accion generadas por el propio modelo base y despues un proceso de aprendizaje por refuerzo (PPO con credito por turno, semilla 20261021), publicandose el checkpoint de la actualizacion 100. La relevancia actual del modelo reside en su enfoque: no es un VLM generico, sino un componente de politica para agentes encarnados que deben razonar sobre geometria 3D y planificar movimientos de camara en entornos simulados.

La arquitectura subyacente es la de Qwen3-VL (transformer multimodal con torre visual y LLM, 8B parametros) y los pesos se publican en bf16, con tokenizador, procesador y plantilla de chat sin modificar respecto al modelo base. El repositorio tiene un tamano de 0.0 GB en el momento de la consulta y no registra descargas ni likes, lo que sugiere una publicacion muy reciente o de circulacion limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (torre visual + LLM), ajustada para navegacion espacial |
| Parametros totales | 8B (heredados del modelo base Qwen3-VL-8B-Instruct) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 publicado; no se documentan otras cuantizaciones (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout de carpetas Qwen3-VL, export fp32 convertido a bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un VLM con torre visual y un LLM de 8B parametros que procesa imagen y texto de forma conjunta. El ajuste fino no modifica la arquitectura ni el procesador: se conservan los nombres y formas de los tensores, el tokenizador, el procesador y la plantilla de chat del modelo base. La salida se estructura mediante etiquetas `<action>`, permitiendo varias acciones por turno (por ejemplo, `<action>move_forward|turn_left|</action>`).

El entrenamiento consta de dos fases. Primero, un SFT sobre trayectorias de accion generadas por Qwen3-VL-8B-Instruct. Despues, un proceso de RL con PPO y asignacion de credito por turno, semilla 20261021, del que se publica el checkpoint de la actualizacion 100. Los pesos finales se exportaron en fp32 durante el entrenamiento y se convirtieron a bf16 para su publicacion. La evaluacion se realizo en modo multi-turno con historial completo, maximo de 12 turnos, decodificacion greedy (temperatura 0, top_p 1) y plantilla de chat sin modo thinking (`no_think`).

## Capacidades

- Navegacion espacial activa en escenas interiores: genera acciones de camara para alcanzar puntos de vista que cumplan restricciones espaciales.
- Razonamiento geometrico sobre la vista actual y la pose: distancia a objetos, encuadre, oclusion, relaciones proyectivas, ocupacion de pantalla y equidistancia.
- Salida estructurada de acciones mediante etiquetas `<action>`, con multiples acciones por turno.
- Procesamiento multi-turno con historial completo (hasta 12 turnos en la evaluacion), recibiendo imagen y pose en cada turno.
- Comprension imagen-texto heredada del modelo base Qwen3-VL-8B-Instruct (pipeline `image-text-to-text`).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se documentan capacidades de tool calling, function calling, audio ni modos de razonamiento extendido especificos para este ajuste.

## Casos de uso

- Evaluacion de politicas de navegacion en simulacion: el modelo actua como agente que recibe la vista y la pose y emite acciones hasta cumplir una tarea espacial, util para comparar checkpoints y configuraciones de RL en entornos tipo InteriorGS.
- Benchmarking de razonamiento espacial en VLMs: sirve como referencia de un modelo de 8B ajustado con RL para tareas de relaciones proyectivas y encuadre, permitiendo medir la brecha frente a modelos mayores o sin ajuste.
- Generacion de trayectorias sinteticas de camara: las secuencias de acciones producidas pueden reutilizarse para aumentar datos de entrenamiento de otros agentes o para validar anotaciones de escenas interiores.
- Robotica de interior en simulacion: integrado en un bucle de control de camara (pan-tilt o movimiento de base) para tareas de inspeccion, como situar un objeto a una distancia concreta o evitar oclusiones antes de una captura.
- Investigacion en aprendizaje por refuerzo con credito por turno: el checkpoint permite reproducir y extender el pipeline SFT + PPO descrito, comparando el efecto de la actualizacion 100 frente a etapas anteriores.
- Docencia y prototipado de agentes encarnados: al requerir solo transformers 4.57 o superior y cargarse con `AutoProcessor` y `Qwen3VLForConditionalGeneration`, es adecuado para laboratorios que quieran montar un agente espacial minimo sin infraestructura adicional.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de evaluacion interna sobre los conjuntos InteriorGS v10, en decodificacion greedy y midiendo tasa de exito:

| Conjunto | Tareas | Tasa de exito |
|---|---|---|
| Validacion | 413 | 53.75% |
| Test | 292 | 47.60% |
| Ambos | 705 | 51.21% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones con otros modelos en las mismas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (8B parametros x 2 bytes), mas el coste de la torre visual, el procesador de imagenes y la cache KV multi-turno; en la practica se recomienda reservar 20-24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con `device_map="auto"`.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB) en bf16; en GPUs de 16 GB requeriria cuantizacion, que no se documenta en el repositorio.
- Opciones de despliegue: transformers 4.57 o superior con `AutoProcessor` y `Qwen3VLForConditionalGeneration`; vLLM, llama.cpp, Ollama o TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (qwen3vl8b-interiorgs-reward-rw_s2tcsw3_100-bf16) | 8B | no disponible | Navegacion espacial activa en InteriorGS (SFT + PPO) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-8B-Instruct | 8B | no disponible en la informacion proporcionada | VLM generalista imagen-texto | Apache 2.0 (modelo base) | Hugging Face, ampliamente distribuido |
| Alternativas de navegacion encarnada de 8B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es frente al modelo base, del que este checkpoint hereda arquitectura y procesador; no se dispone de datos de rendimiento de terceros para contrastar en las mismas tareas.

## Limitaciones y advertencias

- El rendimiento es moderado: 51.21% de tasa de exito en el conjunto combinado de 705 tareas, con 47.60% en test, lo que implica que aproximadamente la mitad de las tareas fallan en la evaluacion interna del autor.
- Las respuestas ilegibles cuentan como turno fallido, de modo que el cumplimiento estricto del formato `<action>...</action>` es critico en produccion.
- El modelo esta especializado en escenas interiores de InteriorGS; no se ha validado su generalizacion a otros entornos, sensores o convenciones de pose.
- La evaluacion se limita a 12 turnos y decodificacion greedy; el comportamiento con muestreo, temperature > 0 o historiales mas largos no esta documentado.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinacion especificos; al ser un ajuste de un VLM, conserva los sesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el repositorio no registra descargas ni validacion externa.
- No se publican cuantizaciones alternativas, por lo que el despliegue en hardware limitado exige conversion propia.
- El modelo base debe respetarse en cuanto a su propia licencia y condiciones de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yinbq/qwen3vl8b-interiorgs-reward-rw_s2tcsw3_100-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales.
