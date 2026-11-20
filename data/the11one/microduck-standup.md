# The11One/microduck-standup

## Resumen

microduck-standup es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje ni un transformer generativo: es una política de comportamiento encargada de mantener una postura estable de pie (stand) de forma perpetua, es decir, ejecutándose de manera continua hasta recibir una orden de parada. El autor es el usuario The11One y el artefacto se distribuye como un fichero ONNX listo para cargar en el daemon del robot.

El modelo recibe observaciones de 61 dimensiones a 50 Hz y emite 14 acciones de control, lo que lo sitúa en el dominio de la robótica de locomoción de bajo nivel. Su relevancia es acotada y muy específica: sirve como bloque de comportamiento (gait) para la ranura `stand` dentro del sistema de políticas del microduck, y su interés práctico reside en que puede desplegarse directamente en hardware mediante el comando `robotctl policy load`.

La información pública disponible es mínima: el repositorio ocupa 0,0 GB, no tiene descargas ni likes, y la model card no aporta detalles sobre arquitectura de red, datos de entrenamiento, licencia ni idiomas. Todo lo que sigue se limita a lo declarado por el autor o queda marcado como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; topología de red no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye directamente en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La arquitectura interna de la red no está documentada en la model card: no se especifica si es un MLP, una red recurrente o una política con memoria, ni el número de capas o neuronas. Lo que sí se declara es la interfaz: observación de 61 dimensiones, 14 acciones discretas o continuas (no se aclara) y frecuencia de control de 50 Hz. El normalizador de observaciones está integrado dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `develop`, commit `22916b9d8`, y el export se generó desde un checkout con cambios no confirmados, lo que introduce una advertencia de reproducibilidad: el artefacto publicado no corresponde exactamente a un estado limpio del repositorio. No se indican número de pasos de entrenamiento, algoritmo de RL (PPO, SAC, etc.), función de recompensa ni composición del dataset de simulación.

## Capacidades

- Control de postura estática: mantiene al microduck de pie de forma perpetua hasta que se le indique lo contrario.
- Política de comportamiento para la ranura `stand` del sistema de políticas del microduck.
- Entrada de observaciones en crudo (normalización embebida en el ONNX).
- Salida de 14 acciones de control a 50 Hz.
- Integración directa con el daemon del robot mediante `robotctl policy load`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Postura de reposo activo en el robot: cargar esta política en la ranura `stand` permite al microduck mantenerse erguido de forma continua mientras el sistema espera la siguiente orden o gait, sin necesidad de un bucle de control externo.
- Base para composición de gaits: al ser una política perpetua y aislada, puede encadenarse con otras políticas (caminar, girar) dentro del gestor de políticas del daemon, usando `stand` como estado de transición.
- Demostraciones de robótica de bajo nivel: sirve para mostrar el pipeline completo de entrenamiento en simulación y despliegue en hardware real del microduck, cargando el ONNX con un solo comando.
- Pruebas de integración del daemon: útil para validar el esquema 2 de manifiesto de políticas y el flujo `robotctl policy load` en un robot físico o en un entorno de pruebas.
- Referencia para entrenar políticas propias: el repositorio `microduck_rl` y este artefacto sirven como ejemplo de exportación de una política de RL a ONNX con normalizador embebido.
- Mantenimiento de estabilidad en banco de pruebas: permite dejar al robot de pie sobre una superficie mientras se ejecutan diagnósticos de sensores o calibraciones, sin intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no aplica para el despliegue en robot; la inferencia se ejecuta en la CPU del propio microduck a 50 Hz.
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño del artefacto, pero no hay datos que lo confirmen.
- Opciones de despliegue: ONNX Runtime en el daemon del robot mediante `robotctl policy load`; no se documentan otros runtimes (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de política).
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (20 ms por paso).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables del mismo autor o del ecosistema microduck con las que establecer una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución del artefacto.
- Reproducibilidad comprometida: el export se generó desde un checkout con cambios no confirmados sobre el commit `22916b9d8`, por lo que no es posible reconstruir exactamente el modelo publicado.
- Arquitectura y datos de entrenamiento no documentados: impide auditar el comportamiento o estimar riesgos de generalización fuera del entorno de entrenamiento.
- Comportamiento limitado a una única tarea (mantenerse de pie): no cubre locomoción, recuperación de caídas ni adaptación a terrenos irregulares.
- Dependencia del hardware específico: la política está entrenada para el microduck y su interfaz de 61 observaciones y 14 acciones; no es transferible a otros robots sin reentrenamiento.
- Sin métricas de robustez publicadas: no hay datos sobre estabilidad ante perturbaciones, desniveles o fallos de sensores.
- Sin información sobre sesgos ni alucinación en el sentido de modelos de lenguaje, pero sí ausencia total de garantías de seguridad para operación con personas cerca del robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/The11One/microduck-standup
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL (referenciado en la model card): `pollen-robotics/microduck_rl`, rama `develop`, commit `22916b9d8`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
