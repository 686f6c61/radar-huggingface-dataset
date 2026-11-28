# sripalli/microduck-rl

## Resumen

Microduck-rl es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo recibe observaciones de 61 dimensiones y emite 14 acciones de control a una frecuencia de 50 Hz, ejecutando episodios de 4,0 segundos que finalizan con el retorno del robot a una pose de pie estable. Se distribuye como un único fichero `policy.onnx` con el normalizador de observaciones integrado, de modo que el consumidor puede alimentar observaciones en crudo sin preprocesado adicional.

La relevancia del modelo reside en su naturaleza episódica y su empaquetado ligero: está pensado para desplegarse directamente sobre el hardware del microduck mediante el daemon `robotctl`, no como un modelo generativo de propósito general. No se trata de un LLM ni de un modelo multimodal, sino de una política neuronal especializada en locomoción y control postural dentro del ecosistema microduck.

La información pública disponible es muy escasa: el repositorio de Hugging Face no declara licencia, idiomas ni tamaño efectivo (0,0 GB reportados), y la model card es mínima. El autor es el usuario `sripalli`, y la política se exportó desde la rama `develop` del repositorio `pollen-robotics/microduck_rl`, en el commit `0daab160d`, con cambios sin confirmar en el árbol de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal exportada a ONNX para control robótico) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política episódica de 4,0 s a 50 Hz; 61-D de observación, 14 acciones) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La arquitectura concreta de la red no se detalla en la información disponible. Por el formato de entrada y salida se trata de una política de control que mapea un vector de observación de 61 dimensiones a 14 acciones continuas, ejecutada en bucle a 50 Hz durante episodios de 4,0 segundos. El normalizador de observaciones está embebido en el propio grafo ONNX, lo que simplifica la integración con el runtime del robot.

El entrenamiento se realizó mediante aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `develop`, commit `0daab160d`. La model card indica que la exportación se hizo desde un checkout con cambios sin confirmar, lo que implica que el binario publicado puede no ser reproducible exactamente a partir de ese commit. No se documentan hiperparámetros, algoritmo de RL, número de pasos de entrenamiento, composición del dataset ni técnicas de regularización.

## Capacidades

- Control locomotor episódico del robot microduck: ejecuta una secuencia de 4,0 segundos y regresa a una pose de pie.
- Política de extremo a extremo: consume observaciones en crudo (61-D) y produce 14 acciones a 50 Hz.
- Normalización integrada: no requiere pipeline de preprocesado externo.
- Integración con el daemon `robotctl` mediante manifiesto de política (schema 2).
- Exportación ONNX: ejecutable en runtimes compatibles con ONNX, incluido el stack del robot.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Demostración de locomoción en microduck: cargar la política con `robotctl policy add rl sripalli/microduck-rl` y ejecutarla con `robotctl robot do rl` para mostrar un episodio de marcha y retorno a pose de pie. Es adecuada por su empaquetado listo para el daemon y su duración acotada.
- Pruebas de integración del stack microduck: sirve como política de referencia para validar el pipeline de observación-acción a 50 Hz y el manifiesto schema 2 en entornos de CI del robot.
- Benchmarking de control en cuadrúpedos de bajo coste: al ser una política episódica corta, permite comparar latencia y estabilidad postural frente a otras políticas del ecosistema.
- Educación y robótica de código abierto: útil en talleres donde se enseña RL aplicado a robótica con hardware asequible, gracias a la simplicidad de despliegue vía `robotctl`.
- Investigación en simulación a realidad: la política ONNX puede ejecutarse en simuladores compatibles para estudiar la brecha sim-real antes de desplegarla en hardware.
- Prototipado de rutinas de recuperación postural: el retorno a pose de pie al final del episodio la hace útil como bloque base en secuencias de control más largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio se reporta como 0,0 GB y no se documenta el número de parámetros.
- GPU recomendadas: no disponible; al ser una política de control a 50 Hz, es probable que la inferencia en CPU sea suficiente, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: daemon `robotctl` del ecosistema microduck (comandos `robotctl policy add` y `robotctl robot do`); runtime ONNX subyacente no especificado.
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz y la duración del episodio de 4,0 s.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables del ecosistema microduck ni alternativas con especificaciones verificables.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no se puede confirmar el uso comercial ni la redistribución.
- La model card es mínima: no se documentan arquitectura, parámetros, datos de entrenamiento ni evaluación.
- La exportación se realizó desde un checkout con cambios sin confirmar, lo que compromete la reproducibilidad del binario publicado.
- El modelo es episódico (4,0 s) y está especializado en el microduck; no es extrapolable a otros robots ni a tareas generales.
- No se documentan sesgos, pero al ser una política de RL entrenada en un entorno concreto, puede presentar comportamientos frágiles ante condiciones no vistas (terrenos, cargas, desgaste del hardware).
- El repositorio registra 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.
- No se especifican requisitos de seguridad para la ejecución en hardware real; conviene probar primero en simulación.

## Enlaces

- Hugging Face: https://huggingface.co/sripalli/microduck-rl
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento (referenciado en la model card): `pollen-robotics/microduck_rl`, rama `develop`, commit `0daab160d`
