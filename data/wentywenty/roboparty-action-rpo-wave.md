# wentywenty/roboparty-action-rpo-wave

## Resumen

RPO Wave es un modelo de política de control motriz para el robot humanoide `rpo`, publicado por el usuario wentywenty en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional de robótica general: es una política de acción compacta exportada en formato ONNX que genera comandos de articulación (23 grados de libertad) a partir de un vector de observación de 121 dimensiones. Su función concreta es reproducir una animación de saludo con la mano ("wave"), etiquetada como demostración con nivel de seguridad `S1`.

El modelo se distribuye bajo la librería `onnxruntime` y el archivo principal es `policy_wave.onnx`. La model card indica que proviene del repositorio `Roboparty/roboparty_inference` en el commit `ee9174c`, y que el GIF de vista previa fue renderizado con datos de movimiento de RoboOS, por lo que representa la forma del movimiento pero no garantiza el comportamiento en hardware real. El tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere un artefacto de muy pocos megabytes.

Por su naturaleza, es relevante para quienes trabajan con el stack Roboparty/RoboOS y necesitan un ejemplo funcional de política de acción para humanoides: sirve como referencia de integración de un pipeline observación→acción con ONNX Runtime y como base para validar la cadena de seguridad antes de ejecutar movimientos en un robot físico. No hay información pública sobre arquitectura interna, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de acción exportada a ONNX; arquitectura de red no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija `obs` `[1, 121]` |
| Tipos de cuantizacion | no disponible (artefacto ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control motriz, sin entrada/salida de texto) |
| Licencia | other (licencia personalizada, sin texto publicado en la información disponible) |
| Formato de pesos | ONNX (`policy_wave.onnx`), ejecutable con onnxruntime |

Datos adicionales de la model card: robot `rpo`, 23 DOF, nivel de seguridad `S1`, salida `actions` `[1, 23]`, origen `Roboparty/roboparty_inference` @ `ee9174c`.

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura de la red (tipo de transformer, MLP, política de imitación o aprendizaje por refuerzo), el número de parámetros ni la composición del dataset de entrenamiento. La única información estructural disponible es la interfaz del modelo: una entrada `obs` de forma `[1, 121]` y una salida `actions` de forma `[1, 23]`, coherente con una política que mapea un vector de observación (estado de articulaciones, sensores y posiblemente consignas de tarea) a consignas de posición o par para las 23 articulaciones del humanoide `rpo`.

El nombre del repositorio incluye el sufijo "rpo", que podría asociarse a un método de optimización de política, pero no hay documentación que lo confirme. Tampoco se documentan técnicas de RLHF, DPO, decodificación especulativa ni innovaciones de atención. El artefacto se distribuye exclusivamente como grafo ONNX, por lo que el entrenamiento queda fuera del alcance del repositorio publicado.

## Capacidades

- Generación de una trayectoria de acción de 23 dimensiones para el humanoide `rpo` a partir de un vector de observación de 121 dimensiones.
- Ejecución de una animación de saludo con la mano ("wave") como demostración de movimiento.
- Inferencia mediante ONNX Runtime, lo que permite despliegue en CPU o GPU con el runtime estándar sin dependencias de frameworks de deep learning completos.
- Integración en el stack Roboparty/RoboOS, al derivarse de `Roboparty/roboparty_inference`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un modelo de control motriz de propósito único.
- Nivel de seguridad declarado `S1`, que según la model card exige verificar soporte del robot, parada de emergencia, limitación de corriente y realimentación del bus antes de la ejecución.

## Casos de uso

- Validación de la cadena de inferencia Roboparty: cargar `policy_wave.onnx` con onnxruntime, alimentar un vector `obs` de 121 valores y comprobar que la salida `actions` de 23 valores tiene la forma y el rango esperados antes de conectar el robot.
- Demostración de saludo en un humanoide `rpo`: ejecutar la política como animación de bienvenida en ferias, presentaciones o vídeos de producto, con el robot en soporte y con parada de emergencia accesible.
- Prueba de integración de seguridad: usar el movimiento como caso de prueba para verificar que los límites de corriente, la realimentación del bus y los procedimientos de parada funcionan correctamente antes de desplegar políticas más complejas.
- Referencia para desarrollo de políticas propias: emplear la interfaz `obs[1,121] → actions[1,23]` como contrato de entrada/salida al entrenar o exportar nuevas políticas para el mismo robot.
- Benchmark de latencia del runtime: medir el tiempo de inferencia de un grafo ONNX pequeño en la CPU o GPU objetivo del robot para dimensionar el bucle de control.
- Formación y documentación interna: disponer de un ejemplo mínimo y reproducible de política de acción para explicar el pipeline RoboOS a nuevos miembros del equipo.
- Pruebas en simulación: ejecutar la política en un simulador con el modelo cinemático del `rpo` para comparar la trayectoria generada con el GIF de referencia antes de pasar a hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito de la tarea, error de seguimiento de trayectoria, latencia ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, por lo que el grafo ONNX es presumiblemente de pocos megabytes y cabe en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se especifican; por el tamaño del artefacto, cualquier GPU con soporte de onnxruntime (por ejemplo, RTX 4090, A100, H100) es sobredimensionada. La ejecución en CPU es viable.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del repositorio; no hay confirmación oficial.
- Opciones de despliegue: ONNX Runtime (librería declarada), en CPU o con proveedores de ejecución CUDA/TensorRT. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. Al tratarse de un grafo de acción de dimensión reducida, la latencia vendrá dominada por el bucle de control del robot y la comunicación con el bus, no por el cómputo del modelo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de acción para el humanoide `rpo` ni modelos comparables del ecosistema Roboparty/RoboOS con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Propósito único: solo reproduce la animación de saludo ("wave"); no es un modelo general y no debe reutilizarse para otras tareas sin reentrenamiento.
- Licencia `other`: no se publica el texto de la licencia en la información disponible, por lo que el uso comercial queda sin determinar y requiere consulta al autor.
- Nivel de seguridad `S1`: la model card exige confirmar soporte del robot, parada de emergencia, limitación de corriente y realimentación del bus antes de ejecutar. Instalar la acción no equivale a habilitar los motores.
- El GIF de vista previa está renderizado con datos de RoboOS y no representa el comportamiento en hardware real; pueden existir diferencias de dinámica, fricción y control.
- No hay documentación sobre sesgos, alucinación (no aplica en el sentido de texto) ni limitaciones idiomáticas; el riesgo principal es de seguridad física durante la ejecución.
- Sin información sobre robustez ante variaciones de la observación, ruido de sensores o estados iniciales distintos a los del entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No se documentan parámetros, arquitectura ni datos de entrenamiento, lo que impide auditar el comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rpo-wave
- Perfil del autor en GitHub: https://github.com/wentywenty
- Origen declarado del artefacto: `Roboparty/roboparty_inference` @ `ee9174c` (no se ha encontrado URL pública en la búsqueda web)
