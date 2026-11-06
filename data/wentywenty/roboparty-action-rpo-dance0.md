# wentywenty/roboparty-action-rpo-dance0

## Resumen

RPO Dance 0 es una política de control motriz para el robot humanoide `rpo` de RoboParty, distribuida como un artefacto ONNX de inferencia. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo: es una policy de robótica que mapea un vector de observación de 121 dimensiones a un vector de 23 acciones articulares, correspondientes a los 23 grados de libertad (DOF) del robot. El modelo lo publica el usuario `wentywenty` en Hugging Face bajo la librería `onnxruntime`, con fecha de creación en noviembre de 2026.

El modelo resuelve un problema muy acotado: ejecutar una secuencia de baile predefinida ("dance 0") sobre el humanoide `rpo`. La model card indica que la animación de previsualización proviene de datos de movimiento de RoboOS y se renderizó en simulación, sin garantía de que el comportamiento en hardware real coincida. El artefacto se etiqueta con nivel de seguridad `S2` y se acompaña de advertencias explícitas sobre soporte físico, parada de emergencia, limitación de corriente y realimentación del bus antes de su ejecución.

Por su naturaleza, la ficha debe leerse como la de un componente de control embebido y no como la de un LLM: no hay pesos en safetensors, no hay tokenizador, no hay contexto textual y no se publican benchmarks de razonamiento. La relevancia es la de un ejemplo reproducible de política de movimiento para robótica humanoide open source, empaquetada en un formato portable (ONNX) que puede ejecutarse con `onnxruntime` en el ordenador de a bordo del robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control motriz empaquetada como grafo ONNX; la model card no describe la red interna) |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB según Hugging Face) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es un vector de observación fijo de 121 dimensiones) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | other (licencia no estándar; consultar términos del autor antes de uso comercial) |
| Formato de pesos | ONNX (`policy_dance0.onnx`), ejecutable con `onnxruntime` |
| Robot objetivo | `rpo` (humanoide RoboParty) |
| Grados de libertad (DOF) | 23 |
| Entrada | `obs` con forma `[1, 121]` |
| Salida | `actions` con forma `[1, 23]` |
| Nivel de seguridad declarado | `S2` |
| Origen del artefacto | `Roboparty/roboparty_inference` @ commit `ee9174c` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de la red. Lo único verificable es la interfaz del grafo ONNX: una entrada `obs` de forma `[1, 121]` y una salida `actions` de forma `[1, 23]`, coherente con una política de control por paso que recibe el estado observado del robot (probablemente concatenación de posiciones articulares, velocidades, orientación y consignas de fase) y emite consignas articulares para los 23 DOF. No se especifica si se trata de un MLP, una red recurrente, un transformer pequeño o una política entrenada por imitación o por refuerzo; tampoco se documentan el número de tokens, la composición del dataset ni si hubo RLHF, DPO o fases de ajuste equivalentes.

El único dato de procedencia es que el artefacto deriva del repositorio `Roboparty/roboparty_inference` en el commit `ee9174c`, y que la previsualización se renderizó a partir de datos de movimiento de RoboOS en simulación. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o destilación. Cualquier afirmación sobre el proceso de entrenamiento más allá de esto sería especulativa y no debe asumirse.

## Capacidades

- Generación de consignas articulares para los 23 DOF del humanoide `rpo` a partir de una observación de 121 dimensiones.
- Reproducción de una secuencia de baile concreta ("dance 0") sobre el robot objetivo.
- Inferencia portable mediante `onnxruntime`, sin dependencia de frameworks de deep learning pesados.
- Ejecución paso a paso compatible con bucles de control en el ordenador de a bordo del robot.
- Integración potencial en el stack de inferencia de RoboParty (`roboparty_inference`), del que procede el artefacto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan modos especiales (thinking, visión, audio) ni variantes multimodales.

## Casos de uso

- Demostración de baile en el humanoide `rpo`: la política se carga con `onnxruntime` y se ejecuta en bucle cerrado sobre el robot para reproducir la secuencia "dance 0" durante exhibiciones o vídeos de producto.
- Validación en simulación antes de despliegue: al ser un grafo ONNX con interfaz fija, puede integrarse en un simulador que reproduzca la observación de 121 dimensiones y comparar la salida de 23 acciones con la animación de referencia de RoboOS.
- Prueba de regresión del stack de inferencia: sirve como caso de prueba reproducible del pipeline `roboparty_inference` en el commit `ee9174c`, verificando formas de entrada y salida y latencia del grafo.
- Base para experimentos de imitación: investigadores pueden usar la política como referencia o punto de partida para entrenar variantes con distintas secuencias de movimiento sobre el mismo robot y la misma interfaz.
- Benchmark de despliegue en hardware embebido: permite medir el coste de inferencia de un grafo ONNX pequeño en la CPU del robot y compararlo con alternativas de tiempo real.
- Docencia en robótica humanoide: ejemplo mínimo y autocontenido de política de control con observación y acción bien definidas, útil para explicar el ciclo percepción-acción en un humanoide de 23 DOF.
- Integración en herramientas de RoboParty: al estar publicado en Hugging Face y derivar de su repositorio de inferencia, puede incorporarse a flujos de descarga y despliegue automatizados de la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito de la tarea, tasas de caída, error de seguimiento articular, latencia de inferencia ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB según Hugging Face, lo que sugiere un grafo ONNX de tamaño muy reducido, pero no se confirma el número de parámetros.
- GPU recomendadas: no aplica necesariamente; al ejecutarse con `onnxruntime`, el grafo puede correr en CPU. No se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible. Por el tamaño aparente del artefacto, es plausible que quepa en cualquier GPU de consumo, pero no hay dato oficial que lo confirme.
- Opciones de despliegue: `onnxruntime` (librería declarada). No se documentan exportaciones a TensorRT, OpenVINO, vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Requisitos de seguridad en hardware: la model card exige confirmar soporte del robot, parada de emergencia, limitación de corriente de la fuente y realimentación del bus antes de ejecutar. Instalar la acción no equivale a habilitar los motores.

## Comparativa con modelos similares

| Modelo | Tipo | Robot / DOF | Entrada / salida | Formato | Licencia |
|---|---|---|---|---|---|
| wentywenty/roboparty-action-rpo-dance0 | Política de movimiento (baile) | `rpo` / 23 | `[1, 121]` / `[1, 23]` | ONNX | other |
| wentywenty/roboparty-action-rpo-wave | Política de movimiento (saludo) | `rpo` / no disponible en la información | no disponible | ONNX | no disponible en la información |
| Políticas de RoboParty en `roboparty_inference` | Stack de inferencia del fabricante | `rpo` y otros | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas. La comparación se limita a la interfaz y al formato de distribución.

## Limitaciones y advertencias

- La licencia es `other`, no estándar: no se especifican derechos de uso comercial, modificación ni redistribución. Es imprescindible consultar los términos del autor antes de cualquier uso en producción.
- El modelo ejecuta una única secuencia de baile sobre un robot concreto (`rpo`, 23 DOF); no generaliza a otras morfologías ni a otras tareas.
- La previsualización es una renderización en simulación de datos de RoboOS y, según la propia model card, no representa el comportamiento en hardware real.
- Riesgo de daño físico: la model card exige verificar soporte del robot, parada de emergencia, limitación de corriente y realimentación del bus antes de ejecutar. Instalar la política no habilita los motores.
- Nivel de seguridad declarado `S2`: no se detalla en la información disponible qué implica exactamente ese nivel ni qué restricciones operativas conlleva.
- No hay información sobre sesgos, alucinación (concepto no aplicable a una política motriz) ni limitaciones idiomáticas.
- No se documentan la arquitectura interna, el proceso de entrenamiento ni métricas de robustez, por lo que no es posible evaluar su fiabilidad ante perturbaciones, cambios de terreno o cargas externas.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que reduce la evidencia externa sobre su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rpo-dance0
- Modelo relacionado (saludo): https://huggingface.co/wentywenty/roboparty-action-rpo-wave
- Sitio oficial de RoboParty: https://roboparty.com/
- Repositorio de origen citado en la model card: `Roboparty/roboparty_inference` @ `ee9174c` (no se proporciona URL directa en la información disponible)
