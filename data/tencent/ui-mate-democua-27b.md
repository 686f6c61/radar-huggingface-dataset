# tencent/UI-Mate-democua-27B

## Resumen

UI-Mate-democua-27B es un checkpoint del agente GUI multimodal UI-Mate, desarrollado por Tencent HY Frontier, que permite a un modelo de lenguaje y visión operar ordenadores de escritorio mediante acciones estructuradas de teclado y ratón. Su característica diferencial es la capacidad de recibir una demostración grabada de un flujo de trabajo (una secuencia de acciones con capturas de pantalla) y adaptarla a una nueva tarea, tratando la demostración como guía contextual y no como un guion fijo de coordenadas. Esto lo convierte en un agente con aprendizaje procedural de un solo disparo (one-shot) para tareas de interfaz gráfica.

El modelo parte de Qwen3.6-27B como base, tiene 27 mil millones de parámetros y se entrena en tres fases: supervisión fina, aprendizaje por refuerzo en entornos GUI ejecutables y una segunda supervisión fina con una mezcla de datos generales de uso de ordenador y datos aumentados con demostraciones. Está diseñado para integrarse en sistemas de automatización de escritorio mediante `pyautogui` y se sirve a través de una interfaz compatible con OpenAI. Su licencia Apache-2.0 permite uso comercial sin restricciones de atribución.

La relevancia de este modelo reside en que aborda un problema práctico de los agentes GUI: transferir un procedimiento aprendido a interfaces que cambian de contenido, diseño o estado. Al mantener la captura de pantalla en vivo como fuente de verdad, el modelo puede corregir desajustes entre la demostración y la realidad, lo que mejora la robustez frente a variaciones de la interfaz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basado en Qwen3.6-27B |
| Parametros totales | 27B (segun model card; el dato de safetensors extraido muestra 3.054.832, inconsistente con la cifra declarada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal que combina un codificador de vision con el modelo de lenguaje Qwen3.6-27B. Recibe como entrada la instruccion de la tarea, capturas de pantalla en vivo, el historial de interacciones y, opcionalmente, un flujo de trabajo de demostracion. La salida incluye razonamiento, una descripcion concisa de la accion y llamadas a herramientas estructuradas para acciones de raton, teclado, scroll, espera, interaccion con el usuario, finalizacion de subtarea y finalizacion de tarea.

El entrenamiento se realiza en tres etapas: primero, supervisión fina sobre datos generales de uso de ordenador; segundo, aprendizaje por refuerzo en línea en entornos GUI ejecutables (como OSWorld); tercero, una segunda supervisión fina con una mezcla de datos generales y datos aumentados con demostraciones. La mezcla de datos generales preserva la competencia de ejecucion por instruccion sola, mientras que los datos de demostracion ensenan al modelo a usar una demostracion cuando se proporciona.

Una innovacion clave es el tratamiento de la demostracion: se normaliza en una representacion consistente de acciones y fotogramas, se anota con un modelo de vision-lenguaje en cuatro ejes (estado de pantalla, intencion, accion y localizacion visual del objetivo) y se segmenta en subtareas con criterios de finalizacion comprobables. Durante el entrenamiento se retienen deliberadamente algunas acciones clave (clics de enfoque, scroll, descarte de popups) para que el modelo no pueda limitarse a copiar la siguiente linea y deba inferir los pasos faltantes desde la captura de pantalla. En inferencia se pasa la secuencia completa de acciones de la subtarea activa, sin extraccion de acciones clave, lo que elimina una llamada al modelo y una posible fuente de corrupcion silenciosa.

## Capacidades

- Ejecucion de tareas de uso de ordenador a partir de una instruccion textual, observando capturas de pantalla en vivo.
- Aprendizaje procedural de un solo disparo: dada una demostracion grabada de un flujo de trabajo, el modelo la adapta a una nueva tarea con contenido, diseno o estado de aplicacion diferentes.
- Razonamiento sobre el estado visible de la interfaz para conectar hitos de subtareas incompletas.
- Generacion de acciones estructuradas compatibles con `pyautogui` (raton, teclado, scroll, espera, interaccion con usuario, finalizacion de subtarea y de tarea).
- Interfaz de servicion compatible con OpenAI, lo que facilita su integracion en pipelines existentes.
- Capacidad de ignorar la demostracion cuando es irrelevante o corregir pasos desalineados con la pantalla en vivo.
- Soporte multimodal: entrada de imagenes (capturas de pantalla) y texto.

## Casos de uso

- Automatizacion de tareas repetitivas de escritorio: el modelo puede ejecutar flujos como rellenar formularios, mover archivos entre carpetas o configurar aplicaciones, usando una demostracion previa como guia y adaptandose a variaciones en la interfaz.
- Pruebas de software GUI: dado un caso de uso grabado, el modelo puede reproducir la interaccion en una nueva version de la aplicacion, detectando cambios de diseno o de flujo y ajustando sus acciones en consecuencia.
- Asistencia remota y soporte tecnico: un operador puede grabar una demostracion de resolucion de un problema y el modelo la ejecuta en el equipo del usuario final, corrigiendo diferencias de resolucion, tema o estado de la aplicacion.
- Integracion en pipelines de RPA (automatizacion robotica de procesos): el modelo puede sustituir scripts de automatizacion rigidos por un agente que razona sobre la pantalla, reduciendo el mantenimiento cuando las aplicaciones cambian.
- Creacion de agentes de demostracion para formacion: se puede grabar un procedimiento experto y el modelo lo reproduce en entornos de practica, permitiendo a los usuarios ver como se ejecuta paso a paso.
- Automatizacion de tareas en entornos virtualizados o contenedores: al ser un agente de escritorio, puede operar en maquinas virtuales para tareas como instalacion de software, configuracion de sistemas o migracion de datos, con la ventaja de adaptarse a interfaces cambiantes.

## Benchmarks y rendimiento

La model card reporta una evaluacion pareada en el entorno "self-demo", donde cada tarea se empareja con una ejecucion exitosa de la misma tarea realizada por un agente mas fuerte. Las condiciones son identicas salvo la presencia de la demostracion. Se permiten hasta 1.000 pasos de interaccion por episodio.

| Conjunto de evaluacion · metrica | Solo instruccion | + una demostracion | Cambio |
|---|---|---|---|
| OSWorkerBench-Subset (33) · exito estricto | 17,17 | 35,35 | +18,18 pp |
| OSWorkerBench-Subset (33) · progreso | 67,85 | 81,14 | +13,29 pp |
| OSWorld-Subset (30) · progreso | 40,27 | 65,75 | +25,48 pp |
| GameDev (10) · puntuacion media | 76,76 | no disponible | no disponible |

No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 27B, se estima que con cuantizacion de 4 bits cabria en una GPU con 16 GB de VRAM (por ejemplo, RTX 4090), con 8 bits necesitaria unos 32 GB y en precision FP16 unos 54 GB. Estos valores son orientativos y no estan confirmados por el autor.
- GPU recomendadas: para inferencia en FP16 se requieren GPUs de datacenter como A100 (40/80 GB) o H100 (80 GB). Con cuantizacion 4 bits podria ejecutarse en una RTX 4090 (24 GB) o similar.
- Si cabe en consumer GPU: con cuantizacion 4 bits es plausible en una RTX 4090, pero no hay datos oficiales de consumo de memoria.
- Opciones de despliegue: el modelo se sirve a traves de una interfaz compatible con OpenAI, lo que sugiere compatibilidad con servidores como vLLM o TGI, aunque no se confirma explicitamente. Tambien se menciona el uso de `pyautogui` para la ejecucion de acciones, lo que implica un entorno de escritorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros agentes GUI de codigo abierto en la informacion proporcionada. Como referencia interna, el proyecto UI-Mate ofrece dos variantes adicionales:

| Modelo | Parametros | Uso previsto |
|---|---|---|
| UI-Mate-27B | 27B | Uso general de ordenador |
| UI-Mate-9B | 9B | Uso general de ordenador |
| UI-Mate-democua-27B | 27B | Uso de ordenador guiado por demostracion |

No se han encontrado comparaciones con otros modelos como OSWorld o WindowsAgentArena en los datos disponibles.

## Limitaciones y advertencias

- El modelo es un checkpoint de agente, no un modelo de chat visual independiente; requiere el prompt oficial, el parser de respuestas y el harness de interaccion del repositorio UI-Mate para funcionar correctamente.
- La evaluacion se ha realizado en subconjuntos de benchmarks (OSWorkerBench-Subset, OSWorld-Subset, GameDev) y no se han publicado resultados en los conjuntos completos, por lo que el rendimiento en tareas reales puede variar.
- No se especifican los idiomas soportados; aunque la base Qwen3.6-27B es multilingue, no hay confirmacion de que el ajuste fino preserve todas las capacidades linguisticas.
- La longitud de contexto no esta documentada, lo que limita la planificacion de tareas con historiales de interaccion muy largos.
- El modelo puede alucinar acciones o razonamientos si la captura de pantalla es ambigua o si la demostracion contiene errores; aunque esta entrenado para arbitrar entre la demostracion y la pantalla, no se garantiza una correccion perfecta.
- No se han publicado datos sobre sesgos, robustez ante ataques adversariales o comportamiento en entornos no vistos durante el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue en produccion requiere validar el rendimiento en el dominio especifico y considerar los costes de inferencia de un modelo de 27B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/UI-Mate-democua-27B
- Pagina del proyecto: https://ui-mate.github.io/
- Repositorio GitHub: https://github.com/Tencent/UI-Mate
- Articulo arXiv: https://arxiv.org/abs/2608.15930
- Checkpoint general UI-Mate-27B: https://huggingface.co/tencent/UI-Mate-27B
- Checkpoint UI-Mate-9B: https://huggingface.co/tencent/UI-Mate-9B
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/tencent/UI-Mate-democua-27B
