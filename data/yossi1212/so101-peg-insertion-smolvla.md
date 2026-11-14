# yossi1212/so101-peg-insertion-smolvla

## Resumen

SmolVLA fine-tuned for SO-101 peg-in-hole insertion es un modelo de politica visomotora (vision-language-action) obtenido por ajuste fino del modelo base `lerobot/smolvla_base` (commit `d9f33c94a60fb382c90dea2164c96845bd955e28`) mediante LeRobot 0.6.1. Lo desarrolla el usuario yossi1212 y resuelve una tarea robotica concreta: insertar una clavija en un orificio con el brazo SO-101 en simulacion. El modelo toma el estado articular y dos imagenes (muneca y vision cenital) y emite consignas de posicion articular absolutas.

El ajuste se realizo sobre 1.076 demostraciones generadas en MuJoCo con aleatorizacion de dominio, que suman 173.683 fotogramas. La estrategia de entrenamiento congela el codificador visual y el modelo de lenguaje del SmolVLA original y entrena unicamente el experto de accion y las proyecciones de estado/accion, con 20.000 pasos, tamano de lote 16 y un pico de memoria de 4,62 GiB bajo un limite de 7 GiB.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de ajuste fino de un VLA pequeno para manipulacion de precision en simulacion, con un coste de computo modesto y licencia Apache 2.0. No es un modelo de proposito general ni un modelo de lenguaje: es una politica de control entrenada exclusivamente sobre imagenes renderizadas de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de SmolVLA; codificador visual y modelo de lenguaje congelados, experto de accion y proyecciones estado/accion entrenados |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (el unico texto de tarea es "Insert the peg into the hole.") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot; repositorio de 0,9 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SmolVLA del modelo base, un VLA que combina un codificador visual, un modelo de lenguaje y un experto de accion. En este ajuste fino se congelan el codificador visual y el modelo de lenguaje, y solo se entrenan el experto de accion y las proyecciones de estado y accion. La entrada son `observation.state` (cinco articulaciones en grados mas pinza en rango 0-100) y dos imagenes RGB de 480x640 (`observation.images.wrist` y `observation.images.overhead`, renombradas por el preprocesador guardado a `camera2` y `camera1`). La salida son objetivos articulares absolutos en las mismas unidades.

El entrenamiento se realizo con LeRobot 0.6.1 sobre 1.076 demostraciones con aleatorizacion de dominio en MuJoCo, totalizando 173.683 fotogramas, durante 20.000 pasos con tamano de lote 16 y un pico de memoria de 4,62 GiB bajo un limite de 7 GiB. El entrenamiento se hizo exclusivamente sobre imagenes renderizadas, lo que implica una brecha de dominio potencial respecto a camaras reales. No se documentan en la informacion disponible fases de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

- Generacion de acciones de control: produce consignas de posicion articular absolutas para las cinco articulaciones y la pinza del brazo SO-101.
- Fusion visomotora: integra estado articular y dos vistas de camara (muneca y cenital) en una unica politica.
- Manipulacion de precision: especializada en la tarea de insercion clavija-orificio (peg-in-hole).
- Ejecucion condicionada por instruccion: acepta la instruccion textual "Insert the peg into the hole.".
- No soporta tool calling ni function calling: es una politica robotica, no un modelo de lenguaje conversacional.
- No soporta razonamiento multi-paso de proposito general ni agentes de texto.
- Capacidades multilingues: no disponibles; el unico condicionamiento textual documentado esta en ingles.
- Capacidades especiales: no se documentan modos de pensamiento, vision general, audio ni otras modalidades fuera de las dos camaras RGB.

## Casos de uso

- Evaluacion de ajuste fino de VLA en simulacion: usar el modelo como referencia reproducible para medir como afecta congelar el backbone y entrenar solo el experto de accion en una tarea de insercion.
- Benchmark de manipulacion de precision: emplear la tarea peg-in-hole del SO-101 como prueba estandar para comparar politicas con el mismo conjunto de demostraciones MuJoCo.
- Generacion de datos sinteticos y aumento de dataset: ejecutar la politica en MuJoCo para producir trayectorias adicionales con aleatorizacion de dominio que alimenten posteriores entrenamientos.
- Estudio de sim-to-real: analizar la brecha entre imagenes renderizadas y camaras reales antes de transferir la politica a un SO-101 fisico, dado que el entrenamiento fue solo con imagenes renderizadas.
- Docencia y prototipado en robotica: servir como ejemplo completo de pipeline LeRobot (entrenamiento, preprocesador guardado, evaluacion) con requisitos de memoria moderados (pico de 4,62 GiB).
- Pruebas de integracion de control: validar el bucle de control que consume objetivos articulares absolutos y los aplica al brazo SO-101 en un entorno simulado.
- Comparacion de estrategias de congelacion: usar el ajuste como linea base frente a alternativas que descongelan el codificador visual o el modelo de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento alcanzo un pico de 4,62 GiB bajo un limite de 7 GiB, por lo que la inferencia deberia requerir menos que esa cifra.
- GPU recomendadas: no disponibles en la informacion proporcionada; el entrenamiento cupo en un entorno con limite de 7 GiB, lo que sugiere GPUs de gama media o consumer con al menos esa memoria.
- Cabe en GPU consumer: probablemente si, dado el limite de memoria del entrenamiento, aunque no se especifica el modelo de GPU empleado.
- Opciones de despliegue: libreria LeRobot (version 0.6.1 documentada); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yossi1212/so101-peg-insertion-smolvla | no disponible | no disponible | Insercion peg-in-hole SO-101 en simulacion | Apache 2.0 | Hugging Face (LeRobot), 0 descargas |
| lerobot/smolvla_base | no disponible | no disponible | VLA base de proposito general para manipulacion | no disponible en esta ficha | Hugging Face (LeRobot) |
| Otros VLA de manipulacion (p. ej. familias OpenVLA o pi0) | no disponible | no disponible | Manipulacion robotica general | no disponible | no disponible |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con imagenes renderizadas de MuJoCo: la transferencia a camaras reales no esta validada y la brecha de dominio puede degradar el rendimiento.
- Especializado en una unica tarea ("Insert the peg into the hole.") y un unico robot (SO-101); no generaliza a otras tareas ni morfologias sin nuevo ajuste.
- Solo se entrena el experto de accion y las proyecciones; el codificador visual y el modelo de lenguaje congelados limitan la adaptacion a dominios visuales nuevos.
- Riesgo de sobreajuste a la distribucion de las 1.076 demostraciones, aunque la aleatorizacion de dominio mitiga parcialmente este efecto.
- Sin datos publicados de benchmarks, tasas de exito ni evaluaciones independientes; no hay evidencia cuantitativa de rendimiento.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay senales de validacion por la comunidad.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `lerobot/smolvla_base` debe verificarse por separado en cuanto a sus terminos.
- El condicionamiento textual esta en ingles; no se documenta soporte multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yossi1212/so101-peg-insertion-smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio acompanante citado en la model card (`policy.py`, `evaluate.py`): no disponible como URL en la informacion proporcionada
- LeRobot: no disponible como URL en la informacion proporcionada
- Paper o blog del autor: no disponible
