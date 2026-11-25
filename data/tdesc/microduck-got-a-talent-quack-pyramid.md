# tdesc/microduck-got-a-talent-quack-pyramid

## Resumen

`tdesc/microduck-got-a-talent-quack-pyramid` es una política de control entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de un fichero ONNX que mapea observaciones del robot (61 dimensiones) a acciones de control (14 dimensiones) a una frecuencia de 50 Hz, pensado para ser cargado directamente en el daemon del robot y ejecutado de forma continua.

La política es de tipo "perpetual": no tiene condición de terminación interna y sigue ejecutando la marcha (gait) indefinidamente hasta que se le indique lo contrario. El normalizador de observaciones está embebido dentro del propio `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo sin preprocesado externo.

El repositorio es prácticamente testimonial: sin descargas, sin likes, sin licencia declarada y sin model card descriptiva más allá de las instrucciones de despliegue. La información técnica disponible es mínima y procede casi exclusivamente del README y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX; cuantizaciones no declaradas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Especificaciones adicionales declaradas:

| Parametro | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (sin condición de parada interna) |
| Librería | microduck |
| Pipeline | robotics |
| Tamaño del repo | 0.0 GB (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de red. Lo único documentado es que la política fue entrenada con el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `e16243159`), exportada desde un checkout con cambios sin commitear, y que el normalizador de observaciones se hornea dentro del ONNX exportado. El pipeline declarado es `robotics` y los tags incluyen `reinforcement-learning`, lo que confirma que se trata de una política obtenida por RL y no de un modelo supervisado.

No hay información sobre el número de tokens, episodios, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. Todo ello debe considerarse no disponible.

## Capacidades

- Control locomotor continuo de un robot cuadrúpedo microduck a 50 Hz.
- Mapeo directo de observaciones de 61 dimensiones a 14 acciones de control.
- Ejecución perpetua de una marcha (gait) sin terminación interna.
- Normalización de observaciones integrada en el modelo ONNX.
- Carga como slot de política mediante `robotctl policy load`.
- Compatibilidad con el manifiesto de políticas schema 2 del daemon microduck.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Marcha continua en el robot microduck: cargar la política en un slot y dejar que el robot ejecute el gait de forma indefinida mientras el daemon mantiene el bucle de control a 50 Hz.
- Prototipado rápido de locomoción: usar la política como línea base para comparar con otras políticas entrenadas en `microduck_rl` sin reentrenar.
- Demostraciones de robótica cuadrúpeda: desplegar el gait en ferias o vídeos donde se requiere movimiento continuo sin intervención.
- Pruebas de integración del daemon: validar el pipeline `robotctl policy load` y el esquema de manifiesto con una política real.
- Recolección de datos de marcha: usar la política perpetua para generar trayectorias y observaciones que alimenten entrenamientos posteriores.
- Evaluación de robustez del controlador: someter la política a perturbaciones y comprobar su comportamiento continuo a 50 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repo reporta 0.0 GB y el modelo es ONNX, por lo que probablemente se ejecuta en CPU del robot.
- GPU recomendadas: no disponible; no se especifican A100, H100 ni RTX 4090.
- Ejecución en consumer GPU: no confirmado; por el tamaño del repo, es plausible que corra en CPU embebida.
- Opciones de despliegue: daemon microduck (`robotctl policy load`), runtime ONNX estándar; vLLM, llama.cpp, Ollama y TGI no aplican.
- Latencia y throughput: no disponibles; la frecuencia de control declarada es 50 Hz, lo que implica un ciclo de 20 ms por paso.

## Comparativa con modelos similares

No disponible. No se identifican en la información proporcionada otras políticas microduck comparables ni datos de parámetros, contexto o rendimiento para establecer una comparación.

## Limitaciones y advertencias

- Sin licencia declarada: no hay base legal explícita para uso comercial ni redistribución; debe consultarse al autor antes de cualquier uso en producción.
- Model card mínima: no se documentan arquitectura, parámetros, datos de entrenamiento ni métricas de rendimiento.
- Exportación desde un checkout con cambios sin commitear: la reproducibilidad exacta del entrenamiento no está garantizada por el commit declarado.
- Política perpetua sin condición de parada interna: requiere que el operador detenga explícitamente la ejecución; no se autolimita.
- Específica para microduck: no es transferible a otros robots ni a tareas de lenguaje.
- Riesgo de alucinación no aplica; el riesgo relevante es de comportamiento inseguro o inestable en el robot físico, sin datos publicados sobre robustez.
- Sin descargas ni validación comunitaria: no hay evidencia externa de que la política funcione correctamente en hardware real.

## Enlaces

- Hugging Face: https://huggingface.co/tdesc/microduck-got-a-talent-quack-pyramid
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `e16243159`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
