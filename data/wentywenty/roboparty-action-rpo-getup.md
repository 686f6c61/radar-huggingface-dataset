# wentywenty/roboparty-action-rpo-getup

## Resumen

RPO Getup es una política de control motriz para el robot humanoide RPO, desarrollada por el usuario wentywenty y publicada en Hugging Face bajo el paraguas del proyecto RoboParty. Su función concreta es la de levantarse tras una caída: el modelo recibe un vector de observaciones de 121 dimensiones y emite un vector de 23 acciones articulares, una por cada grado de libertad del robot. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino una política de aprendizaje por refuerzo exportada a ONNX para su ejecución en el robot real mediante `onnxruntime`.

El modelo se distribuye como un único artefacto de inferencia (`policy_getup.onnx`) dentro de un repositorio de tamaño prácticamente nulo (0.0 GB), lo que confirma que se trata de una red de política compacta y no de un transformer de gran escala. La model card declara un nivel de seguridad S2 y advierte explícitamente de que la instalación del modelo no equivale a la habilitación de los motores: antes de ejecutarlo deben verificarse el soporte físico del robot, la parada de emergencia, la limitación de corriente y la realimentación del bus.

La relevancia del modelo es acotada pero específica: encaja en el ecosistema RoboParty de robótica humanoide de código abierto, cuyo proyecto RPO es un humanoide bípedo completamente abierto, y del que la empresa presentó posteriormente su plataforma RP1 en IROS. Para desarrolladores de robótica que trabajen con el RPO, esta política cubre una tarea crítica de recuperación (get-up) que suele requerir control fino y secuencias de movimiento coordinadas entre 23 articulaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX para robótica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija `obs` de 121 dimensiones) |
| Tipos de cuantizacion | no disponible (artefacto ONNX listo para `onnxruntime`) |
| Idiomas soportados | no aplica (modelo de control motriz, no lingüístico) |
| Licencia | other |
| Formato de pesos | ONNX (`policy_getup.onnx`) |

Otros datos declarados en la model card:

| Parametro | Valor |
|---|---|
| Robot | `rpo` |
| Grados de libertad (DOF) | 23 |
| Nivel de seguridad | S2 |
| Entrada | `obs` `[1, 121]` |
| Salida | `actions` `[1, 23]` |
| Librería de inferencia | onnxruntime |
| Origen del artefacto | `Roboparty/roboparty_inference` @ `ee9174c` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red (número de capas, tipo de capas, función de activación ni tamaño de los pesos). Por el formato de entrada y salida —un vector de observaciones de 121 valores y un vector de acciones de 23 valores— se trata de una política de control que mapea estado a acción, típica de los pipelines de aprendizaje por refuerzo para locomoción y manipulación en robótica humanoide. El nombre del repositorio incluye el sufijo `rpo`, coherente con el proyecto RPO de RoboParty, y el prefijo `action` indica que es un artefacto de acción dentro de una familia de políticas del mismo autor.

Tampoco se han publicado datos sobre el proceso de entrenamiento: no se indica el número de pasos, el simulador empleado, la composición del dataset ni si hubo fases de ajuste fino o de dominio. La model card menciona que el GIF de previsualización se renderizó a partir de datos de `RoboOS motion` y advierte de que dicho vídeo solo muestra la forma del movimiento y no representa el comportamiento en el robot real. El artefacto se exportó desde el repositorio `Roboparty/roboparty_inference` en el commit `ee9174c`, lo que sugiere un flujo de trabajo de entrenamiento en simulación seguido de exportación a ONNX para despliegue en hardware.

## Capacidades

- Generación de acciones de control articular: produce 23 valores de acción a partir de 121 observaciones, correspondientes a los grados de libertad del humanoide RPO.
- Ejecución de la maniobra de levantarse tras una caída (get-up), que es la tarea específica para la que se publica la política.
- Inferencia en tiempo de ejecución mediante `onnxruntime`, lo que permite desplegarla en el propio robot o en un equipo conectado.
- Integración en un pipeline de robótica real: el artefacto está pensado para ejecutarse junto con el resto del stack de control del robot, no de forma aislada.
- No dispone de capacidades de lenguaje, visión, tool calling, agentes ni razonamiento multi-paso; es un modelo puramente motor.
- No se declaran capacidades multilingües ni de otro tipo.

## Casos de uso

- Recuperación autónoma tras caída en el humanoide RPO: la política recibe el estado del robot y emite la secuencia de acciones articulares necesarias para incorporarse, lo que permite al robot volver a una postura operativa sin intervención manual.
- Pruebas de laboratorio de control de cuerpo completo: sirve como referencia para validar el bus de comunicaciones, la limitación de corriente y la respuesta de los 23 actuadores antes de desplegar políticas más complejas.
- Integración en el stack `roboparty_inference`: al proceder del commit `ee9174c` de ese repositorio, puede cargarse directamente en el pipeline de inferencia existente del proyecto sin conversiones adicionales.
- Validación de simulación a realidad: al estar exportado a ONNX, permite comparar el comportamiento de la política en simulador y en el robot físico para detectar divergencias de dinámica.
- Formación y demostraciones de robótica humanoide: el modelo y su previsualización sirven para ilustrar el funcionamiento de políticas de movimiento en el proyecto RPO de código abierto.
- Investigación en políticas de acción para humanoides: como artefacto aislado y de pequeño tamaño, es útil para estudiar el formato de observación de 121 dimensiones y la interfaz de acción de 23 dimensiones del RPO.
- Pruebas de seguridad y parada de emergencia: con nivel S2 declarado, puede emplearse para verificar los protocolos de parada y limitación de corriente durante maniobras de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, tiempos de incorporación, métricas de recompensa ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y el artefacto es un único archivo ONNX, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no disponibles. Al ejecutarse con `onnxruntime`, puede correr en CPU o en GPU compatibles con ONNX Runtime, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del artefacto es plausible que quepa en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: `onnxruntime` es la librería declarada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Al tratarse de una política de control en tiempo real, la latencia vendrá determinada por el bucle de control del robot y no se documenta en la ficha.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Robot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wentywenty/roboparty-action-rpo-getup | Política de acción (ONNX) | `obs` [1,121] / `actions` [1,23] | rpo | other | Hugging Face |
| wentywenty/roboparty-action-rpo-wave | Política de acción (ONNX) | no disponible | rpo | no disponible | Hugging Face |

El único modelo comparable identificado en la búsqueda es la política `roboparty-action-rpo-wave` del mismo autor, que cubre otra tarea de movimiento (saludar) sobre el mismo robot. No se dispone de datos de arquitectura, parámetros ni rendimiento de ninguno de los dos que permitan una comparación cuantitativa. No se han identificado alternativas de terceros con información verificable.

## Limitaciones y advertencias

- Modelo específico de una única tarea (levantarse) y de un único robot (RPO, 23 DOF); no es transferible a otras plataformas sin reentrenamiento.
- La model card advierte de que el vídeo de previsualización se generó a partir de datos de simulación y no representa el comportamiento en el robot real.
- Antes de ejecutar el modelo deben verificarse el soporte físico del robot, la parada de emergencia, la limitación de corriente y la realimentación del bus; instalar la acción no equivale a habilitar los motores.
- Nivel de seguridad declarado S2: implica requisitos de operación supervisada que no se detallan en la información disponible.
- Licencia `other`: no se especifican los términos exactos, por lo que el uso comercial no está confirmado y requiere consultar las condiciones del proyecto.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas por tratarse de un modelo de control motriz sin componentes lingüísticos.
- No se dispone de información sobre robustez ante perturbaciones, terreno irregular o fallos de actuadores.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rpo-getup
- Modelo relacionado (wave): https://huggingface.co/wentywenty/roboparty-action-rpo-wave
- Nota de prensa de RoboParty sobre RP1 en IROS: https://www.prnewswire.com/news-releases/roboparty-unveils-rp1-a-high-performance-full-stack-open-source-humanoid-robot-at-iros-302897662.html
- Repositorio de inferencia de origen: `Roboparty/roboparty_inference` @ `ee9174c` (referenciado en la model card; no se proporciona URL directa)
