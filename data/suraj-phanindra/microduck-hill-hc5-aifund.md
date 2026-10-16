# suraj-phanindra/microduck-hill-hc5-aifund

## Resumen

`suraj-phanindra/microduck-hill-hc5-aifund` es una politica de control (policy) para el robot microduck, no un modelo de lenguaje. Se trata de un ajuste fino de `juicenv/microduck-hill-es8` realizado mediante escalada de colina elitista (elitist hill climb) sobre la puntuacion de Arena, segun la propia model card del autor. El artefacto se publica como un fichero `policy.onnx` acompanado de un `manifest.json` que sigue el esquema 2 del manifiesto de politicas de microduck.

El modelo resuelve una tarea muy concreta: generar una marcha (gait) perpetua para el robot microduck, que observa un vector de 61 dimensiones y emite 14 acciones a 50 Hz. La politica se ejecuta de forma continua hasta que se le indique lo contrario, y se carga en una ranura de politica del daemon del robot mediante el comando `robotctl policy load <slot> suraj-phanindra/microduck-hill-hc5-aifund`.

Su relevancia es limitada y muy de nicho: se enmarca en el ecosistema de robotica open source de Pollen Robotics (repositorios `pollen-robotics/microduck` y `pollen-robotics/microduck_rl`), y en el momento de redactar esta ficha acumula 0 descargas y 0 likes. La informacion publicada es escasa: no se detallan parametros de red, licencia, idiomas ni resultados numericos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de politica entrenada por aprendizaje por refuerzo; la model card no especifica la topologia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplica (entrada de 61 dimensiones de observacion, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (el artefacto distribuido es ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Biblioteca | `microduck` |
| Pipeline declarado | robotics |
| Modelo base | `juicenv/microduck-hill-es8` (relacion: finetune) |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la politica: solo indica que se trata de una politica de refuerzo que consume un vector de observacion de 61 dimensiones y produce 14 acciones a 50 Hz. Se publica en formato ONNX, con el normalizador de observaciones integrado en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo (sin normalizacion previa). El manifiesto `manifest.json` sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

En cuanto al entrenamiento, la model card indica que es un ajuste fino de `juicenv/microduck-hill-es8` mediante escalada de colina elitista sobre la puntuacion de Arena. Los metadatos de entrenamiento proporcionados son: repositorio `pollen-robotics/microduck_rl`, rama `main` y commit `6ff40704a`. No se especifican el numero de tokens o pasos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas adicionales como RLHF o DPO (conceptos que, por otro lado, no aplican a una politica de control). Tampoco se detalla la naturaleza del algoritmo de escalada de colina (tamano de poblacion, criterio de elitismo, numero de iteraciones) ni los valores de la puntuacion de Arena obtenidos.

## Capacidades

- Generacion de marcha perpetua: la politica produce una secuencia de acciones continua (50 Hz) pensada para ejecutarse indefinidamente hasta que el daemon la detenga o cargue otra politica en la ranura.
- Control de locomocion del microduck: mapea un vector de observacion de 61 dimensiones a 14 acciones de actuador.
- Integracion con el daemon del robot: se carga en una ranura de politica mediante `robotctl policy load`, lo que permite alternar entre marchas sin reentrenar.
- Normalizacion integrada: el normalizador de observaciones esta incluido en el ONNX, de forma que acepta observaciones en crudo.
- Inferencia en el bucle de control: disenada para operar a 50 Hz.
- No dispone de capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio, tool calling, function calling ni razonamiento multi-paso. Es exclusivamente una politica motora.
- No hay informacion sobre capacidades multilingues, modo de razonamiento ni soporte de agentes.

## Casos de uso

- Locomocion sobre terreno inclinado con el robot microduck: el nombre del modelo (`hill`) y el modelo base sugieren un ajuste orientado a marchas en pendiente; la politica se cargaria en una ranura con `robotctl policy load` y se dejaria correr de forma continua sobre el terreno objetivo.
- Comparacion de variantes de escalada de colina en investigacion en RL: al ser un ajuste fino de `juicenv/microduck-hill-es8` evaluado sobre la puntuacion de Arena, sirve como punto de comparacion dentro de una misma familia de politicas.
- Evaluacion sim-to-real en el ecosistema microduck: la publicacion en ONNX con normalizador integrado facilita trasladar la politica desde el pipeline de `microduck_rl` al robot fisico sin reimplementar el preprocesado de observaciones.
- Banco de pruebas de infraestructura de despliegue: util para validar el flujo de carga de politicas en ranuras del daemon (`manifest.json`, esquema 2) y el enrutado de observaciones a 50 Hz.
- Sustitucion rapida de comportamiento en demostraciones: al cargarse en una ranura, permite cambiar la marcha activa del robot en una demostracion o exhibicion sin reiniciar el sistema ni recompilar el daemon.
- Docencia y tutoriales de robotica con refuerzo: sirve como ejemplo de artefacto final de un pipeline de RL (entrenamiento en `microduck_rl`, exportacion a ONNX y publicacion en HuggingFace) para cursos o talleres practicos.
- Recoleccion de datos de locomocion: ejecutar la politica de forma perpetua permite grabar trazas de observaciones y acciones para posteriores analisis o para aprender modelos dinamicos del robot.
- Regresion de daemons y herramientas: sirve para verificar que una version del daemon o del cargador de politicas sigue reproduciendo correctamente el comportamiento al actualizar el software del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente menciona que el ajuste fino se realizo mediante escalada de colina elitista sobre la puntuacion de Arena, pero no proporciona el valor de dicha puntuacion, ni curvas de aprendizaje, ni metricas de seguimiento de trayectoria, consumo energetico o velocidad de avance. Tampoco se incluyen comparaciones numericas con el modelo base `juicenv/microduck-hill-es8`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 0.0 GB, lo que indica un artefacto muy pequeno, pero no se publican parametros ni huella de memoria.
- GPU recomendadas: no disponible. La model card no menciona requisitos de GPU.
- Cabe en GPU de consumo: no disponible. Por el tamano del artefacto es plausible la inferencia en CPU a bordo del robot, pero este extremo no esta confirmado en la informacion proporcionada.
- Plataforma de ejecucion prevista: el daemon del robot microduck, invocando `robotctl policy load <slot> suraj-phanindra/microduck-hill-hc5-aifund`.
- Runtime de inferencia: ONNX (el artefacto es `policy.onnx`); no se especifica el ejecutor (ONNX Runtime u otro).
- Opciones de despliegue tipo servidor (vLLM, TGI, llama.cpp, Ollama): no aplican, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El unico dato de temporizacion es la frecuencia de control objetivo de 50 Hz (periodo de 20 ms por ciclo) y 14 acciones por ciclo, lo que implica 700 valores de accion por segundo.
- Restriccion practica: la politica debe ejecutarse dentro del bucle de control del robot, por lo que cualquier despliegue alternativo tendria que respetar el ciclo de 50 Hz y el formato del manifiesto (esquema 2).

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / salida | Frecuencia | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| `suraj-phanindra/microduck-hill-hc5-aifund` | no disponible | 61-D obs / 14 acciones | 50 Hz | ONNX + manifest | no disponible | no disponible (optimizado por escalada de colina sobre Arena) |
| `juicenv/microduck-hill-es8` (modelo base) | no disponible | 61-D obs / 14 acciones | 50 Hz (segun la familia microduck) | no disponible | no disponible | no disponible |
| Otras politicas de microduck | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico termino de comparacion documentado es su modelo base, `juicenv/microduck-hill-es8`, del que este modelo es un ajuste fino. No se dispone de datos sobre otras politicas comparables ni sobre los resultados de la comparacion.

## Limitaciones y advertencias

- Alcance funcional muy restringido: es una politica motora para un robot concreto; no sirve para tareas de lenguaje, vision, codigo o razonamiento.
- Ausencia de licencia declarada: la model card no incluye licencia, por lo que el uso comercial y la redistribucion quedan en un limbo legal; conviene contactar con el autor antes de cualquier uso en produccion.
- Sin resultados de evaluacion publicados: no hay benchmarks, curvas de rendimiento ni valores de la puntuacion de Arena, de modo que el rendimiento real de la marcha no puede verificarse a partir de la informacion disponible.
- Riesgo de sobreajuste al criterio de Arena: al optimizarse por escalada de colina contra una puntuacion concreta, el comportamiento puede degradarse en condiciones no representadas en dicha evaluacion.
- Sin validacion por la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha, lo que implica ausencia de replicacion independiente.
- Dependencia del entorno de ejecucion: requiere el daemon de microduck y el esquema de manifiesto 2; cambios de version en el daemon o en el esquema pueden romper la carga.
- Requisito de normalizacion implicito: el normalizador esta dentro del ONNX, por lo que alimentar observaciones ya normalizadas produciria un comportamiento incorrecto.
- Comportamiento perpetuo: la politica no termina por si sola; el operador debe detenerla o sustituirla, lo que exige supervisar el robot durante su ejecucion.
- Metadatos incompletos: sin idiomas, sin parametros, sin informacion de sesgos ni de alucinacion (categorias no aplicables a este tipo de modelo).
- Fecha de creacion y actualizacion en HuggingFace: 2026-10-16, con apenas cuatro segundos de diferencia entre ambas, lo que sugiere una publicacion automatizada sin mantenimiento posterior.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/suraj-phanindra/microduck-hill-hc5-aifund
- Modelo base: https://huggingface.co/juicenv/microduck-hill-es8
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento por refuerzo: https://github.com/pollen-robotics/microduck_rl (rama `main`, commit `6ff40704a`)
