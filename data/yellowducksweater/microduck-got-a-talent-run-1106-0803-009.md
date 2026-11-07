# YellowDuckSweater/microduck-got-a-talent-run-1106-0803-009

## Resumen

`microduck-got-a-talent-run-1106-0803-009` es una política de control por refuerzo entrenada para el robot cuadrúpedo de código abierto Microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en formato ONNX para su despliegue directo en el daemon del robot. El autor, YellowDuckSweater, lo publica como "primer intento" de una política perpetua de marcha (gait) que se ejecuta de forma continua hasta que se le indica lo contrario.

El modelo se entrenó con el framework `mjlab` (versión 0.1.0, commit `1efd853be`) sobre la tarea `Mjlab-GotATalent-MicroDuck`, definida en el repositorio `microduck-challenges` de StephenForte. El checkpoint corresponde a la iteración 1500 de un entrenamiento con 4096 entornos paralelos, semilla 1 y un máximo configurado de 3000 iteraciones, ejecutado el 6 de noviembre de 2026.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento y despliegue de políticas de locomoción para un robot de bajo coste (preventa desde 499 USD), con un manifiesto de política versionado (esquema 2) y un pipeline reproducible mediante `uv`. No hay información pública sobre arquitectura de red, número de parámetros ni benchmarks de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de RL; red concreta no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; normalizador de observaciones embebido en `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

No se detalla la topología de la red en la model card; se trata de una política de aprendizaje por refuerzo entrenada con `mjlab`, un framework de entrenamiento de locomoción basado en simulación física, sobre la tarea `Mjlab-GotATalent-MicroDuck`. El entrenamiento se ejecutó con 4096 entornos simulados en paralelo, semilla 1, un máximo de 3000 iteraciones y checkpoint final en la iteración 1500, registrando métricas en TensorBoard bajo el nombre de ejecución `run-1106-0803-009`. La base es `mjlab-microduck 0.1.0` en el commit `1efd853be`, y el código de la tarea está fijado al commit `5ee3d82e8` del repositorio `microduck-challenges`.

La innovación práctica del paquete es de ingeniería de despliegue: el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo, y el `manifest.json` sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Locomoción continua (política "perpetua"): ejecuta una marcha que se mantiene hasta recibir una orden de parada o sustitución.
- Control reactivo a partir de observaciones de 61 dimensiones a 50 Hz, con 14 acciones de salida.
- Despliegue directo en el robot mediante `robotctl policy load <slot> <repo>`.
- Ingesta de observaciones en bruto, sin normalización previa por parte del usuario.
- Integración en el sistema de slots de políticas del daemon microduck, lo que permite cargar y sustituir políticas en caliente.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo de texto.

## Casos de uso

- Demostración de marcha en el robot Microduck: cargar la política en un slot y ejecutar una gait continua para validar el hardware y el firmware del robot en ferias o laboratorios.
- Prueba de integración del daemon `robotctl`: usar esta política como carga de referencia para verificar el flujo `policy load`, el parseo del manifiesto de esquema 2 y la gestión de slots.
- Reproducción de experimentos de RL: servir como línea base para comparar nuevas políticas de la tarea `Mjlab-GotATalent-MicroDuck` entrenadas con distintas semillas o hiperparámetros.
- Docencia en robótica de refuerzo: ejemplo completo y de bajo coste del ciclo simulación-entrenamiento-despliegue, con comandos concretos de clonado, `uv sync` y entrenamiento.
- Investigación en robustez de locomoción: al ser una política perpetua, permite evaluar deriva, estabilidad y consumo energético en ejecuciones prolongadas sobre terreno real.
- Base para fine-tuning o destilación: punto de partida para entrenar variantes de la misma tarea con recompensas o dominios aleatorizados distintos, dado que el código y el entorno están fijados por commit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de éxito, velocidad de marcha ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño, pero no se publica el número de parámetros.
- GPU recomendadas para entrenamiento: no especificadas; el comando de referencia usa 4096 entornos paralelos, lo que en la práctica exige una GPU de datacenter (A100/H100) o varias, aunque el autor no lo indica.
- Inferencia en GPU de consumo: previsiblemente viable en RTX 4090 o inferiores dado el tamaño del artefacto, pero no confirmado por el autor.
- Despliegue: el destino previsto es el propio robot Microduck mediante `robotctl` y ONNX Runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: se conoce la frecuencia de control de 50 Hz (periodo de 20 ms), pero no se publican latencias medidas ni throughput de entrenamiento.

## Comparativa con modelos similares

| Modelo | Autor | Tarea | Observacion / acciones | Frecuencia | Formato | Licencia |
|---|---|---|---|---|---|---|
| microduck-got-a-talent-run-1106-0803-009 | YellowDuckSweater | Mjlab-GotATalent-MicroDuck | 61 / 14 | 50 Hz | ONNX | no disponible |
| microduck-got-a-talent-run-1031-1415 | GinDuck | misma familia de tarea (políticas microduck) | no disponible | no disponible | no disponible | no disponible |

La única alternativa identificada en la búsqueda es la política de GinDuck, de la misma familia y pipeline, pero sin especificaciones públicas comparables. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser una política entrenada en simulación, cabe esperar una brecha simulación-real (sim-to-real gap) no cuantificada por el autor.
- Riesgo de fallo en producción: una política de RL puede desestabilizarse ante perturbaciones, terrenos no vistos o desgaste del hardware; no se documentan pruebas en robot real.
- Reproducibilidad: el propio autor advierte que el entrenamiento no es bit-reproducible entre máquinas, por lo que no se pueden obtener pesos idénticos.
- Licencia: no disponible, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas y contexto: no aplica, pero conviene no confundir este artefacto con un modelo de lenguaje; no procesa texto.
- Madurez: el autor lo describe como "primer intento" y el repositorio registra 0 descargas y 0 likes, sin evidencia de validación externa.
- Dependencia de versión: el despliegue depende del esquema 2 del manifiesto de políticas y de la versión del daemon microduck; cambios de esquema pueden romper la carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-got-a-talent-run-1106-0803-009
- Repositorio de retos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card)
- Sitio oficial del robot: https://microducks.org/
- Política comparable de otro autor: https://huggingface.co/GinDuck/microduck-got-a-talent-run-1031-1415
