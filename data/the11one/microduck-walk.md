# The11One/microduck-walk

## Resumen

`microduck-walk` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es un controlador neuronal exportado a ONNX que recibe observaciones de 61 dimensiones y emite 14 acciones de control a 50 Hz, pensado para ejecutarse como política de marcha («walk») en el daemon `robotctl` del robot.

La política es de tipo «perpetuo»: una vez cargada, genera la marcha de forma continua hasta que se le indique lo contrario, lo que la hace adecuada como comportamiento base de locomoción en el slot `walk` del sistema de políticas del microduck. El autor es el usuario de Hugging Face The11One y el repositorio se publicó el 20 de noviembre de 2026, con un tamaño de repositorio de 0.0 GB (los pesos ONNX son presumiblemente de pocos cientos de kilobytes, aunque el dato exacto no está disponible).

Se trata de un artefacto muy específico y de nicho: no compite con modelos fundacionales, sino que resuelve el problema concreto de dotar de una marcha estable a un robot cuadrúpedo de bajo coste dentro del ecosistema microduck. Su relevancia radica en que ejemplifica el flujo completo de entrenamiento RL en simulación y despliegue en hardware real mediante un formato portable (ONNX) y una interfaz de políticas estandarizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (reinforcement learning), exportada a ONNX; topología interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (pesos ONNX; se desconoce si se publican variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Tipo de política | perpetua (se ejecuta hasta recibir orden de parada) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, funciones de activación ni tipo de política, p. ej. MLP o red recurrente). Lo que sí se documenta es la interfaz: 61 entradas de observación y 14 salidas de acción, ejecutadas a 50 Hz, con un normalizador de observaciones integrado dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. Esta decisión de empaquetar la normalización en el grafo ONNX simplifica el despliegue y elimina una fuente habitual de errores de integración.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `develop` y el commit `22916b9d8`, y el modelo se exportó desde un checkout con cambios sin confirmar, lo que implica que el código exacto de entrenamiento no es reproducible a partir del commit declarado. No se especifican el número de pasos de entrenamiento, la composición del entorno de simulación, ni si se aplicaron técnicas de domain randomization, recompensas de estilo o currículos. Tampoco se documenta el algoritmo RL concreto (PPO, SAC u otro).

## Capacidades

- Locomoción cuadrúpeda continua: genera una marcha perpetua para el robot microduck hasta que se detiene explícitamente.
- Control en tiempo real a 50 Hz, adecuado para el bucle de control del daemon `robotctl`.
- Consumo de observaciones en crudo gracias al normalizador integrado en el grafo ONNX.
- Despliegue portable mediante ONNX Runtime, sin dependencia de frameworks de entrenamiento.
- Integración con el sistema de manifiestos de políticas del microduck (esquema 2).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un controlador motriz, no un modelo generativo.

## Casos de uso

- Marcha base del microduck: cargar la política en el slot `walk` mediante `robotctl policy load walk The11One/microduck-walk` para obtener locomoción continua en el robot físico.
- Demostraciones de robótica de código abierto: usar la política como ejemplo reproducible de un pipeline RL sim-a-real sobre hardware de bajo coste.
- Investigación en aprendizaje por refuerzo: servir de línea base para comparar nuevas políticas de marcha entrenadas con `microduck_rl`, manteniendo fija la interfaz de 61 observaciones y 14 acciones.
- Pruebas de integración del daemon: validar el cargador de manifiestos (esquema 2) y el ejecutor ONNX del sistema `robotctl` con una política real y perpetua.
- Docencia y talleres: ilustrar el ciclo completo de entrenamiento, exportación a ONNX y despliegue en un cuadrúpedo asequible.
- Benchmarking de hardware: medir latencia y estabilidad de la marcha en distintas plataformas de cómputo embebido que ejecuten ONNX Runtime a 50 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0.0 GB) y la naturaleza de una política de control, la huella de memoria es presumiblemente mínima (del orden de kilobytes a pocos megabytes), pero no se confirma.
- GPU recomendadas: no disponibles; el modelo está pensado para ejecutarse en el cómputo embebido del propio robot microduck.
- Compatibilidad con GPU de consumo: no confirmada; es plausible que funcione en CPU, pero no se documenta.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo) y el daemon `robotctl` del ecosistema microduck.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas de marcha publicadas para el microduck ni modelos comparables de la misma categoría con datos verificables.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarlo en productos.
- Reproducibilidad incompleta: el modelo se exportó desde un checkout con cambios sin confirmar sobre el commit `22916b9d8`, por lo que el entrenamiento no es reproducible de forma exacta.
- Topología y datos de entrenamiento no documentados: se desconoce la arquitectura interna, el algoritmo RL y el entorno de simulación, lo que dificulta el análisis y la depuración.
- Comportamiento perpetuo: la política se ejecuta indefinidamente hasta recibir una orden de parada; en producción es imprescindible implementar mecanismos de seguridad y parada de emergencia.
- Sin datos de robustez: no se documenta el rendimiento ante perturbaciones, cambios de terreno, desgaste del hardware o variaciones de fricción; el riesgo de fallo en condiciones no vistas en entrenamiento es desconocido.
- Sin métricas de rendimiento: no hay benchmarks publicados que permitan evaluar la calidad de la marcha frente a alternativas.
- Sin soporte de lenguaje, visión ni interacción: no debe emplearse fuera de su función de control motriz.
- Advertencia de procedencia: los datos de la model card se han tratado solo como referencia descriptiva, no como instrucciones verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/The11One/microduck-walk
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `develop`, commit `22916b9d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
