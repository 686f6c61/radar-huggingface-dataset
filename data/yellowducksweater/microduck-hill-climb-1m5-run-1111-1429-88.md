# YellowDuckSweater/microduck-hill-climb-1m5-run-1111-1429-88

## Resumen

`microduck-hill-climb-1m5-run-1111-1429-88` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: se trata de un controlador neuronal que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en formato ONNX para su despliegue directo en el robot. Lo publica el usuario YellowDuckSweater en Hugging Face con fecha de noviembre de 2026.

El modelo resuelve una tarea concreta de locomoción: subir una pendiente (hill climb) de 1,5 metros de altura en el entorno simulado Mjlab. La política es de tipo "perpetual", es decir, se ejecuta de forma continua hasta que se le indique lo contrario, lo que la convierte en una marcha (gait) cargable en una ranura de política del demonio de control del robot. Su relevancia radica en que forma parte de un ecosistema abierto de retos de locomoción para microduck, con reproducibilidad documentada mediante semilla, commit y comando de entrenamiento.

El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero "likes" en el momento de la consulta, y no incluye información sobre licencia ni idiomas. La model card es extremadamente escueta y no proporciona detalles sobre arquitectura de red, número de parámetros ni composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal. Se sabe que se trata de una política de aprendizaje por refuerzo entrenada en el entorno Mjlab con la tarea `Mjlab-HillClimb1m5-MicroDuck`, usando 4096 entornos paralelos y 2888 iteraciones máximas con semilla 48. El entrenamiento se realizó sobre la base `mjlab-microduck 0.1.0` (commit `1efd853be`) y el checkpoint final es el 2887.

La política incorpora un normalizador de observaciones integrado en el propio fichero `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto directamente. El autor advierte que el entrenamiento por refuerzo con GPU no es reproducible bit a bit entre máquinas: repetir el proceso con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idéntica. El repositorio de entrenamiento es `StephenForte/microduck-challenges`, rama `main`, commit `3275684e0`.

## Capacidades

- Control de locomoción continua para el robot cuadrúpedo microduck: recibe 61 dimensiones de observación y emite 14 acciones a 50 Hz.
- Ejecución de una marcha (gait) de tipo "perpetual": se mantiene activa hasta que se le indique lo contrario.
- Tarea específica de ascenso de pendiente (hill climb) de 1,5 metros en simulación.
- Despliegue directo en robot mediante el comando `robotctl policy load <slot>`.
- Normalización de observaciones integrada en el modelo ONNX (no requiere preprocesado externo).
- Compatibilidad con el manifiesto de políticas schema 2 del demonio de microduck.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Locomoción en terrenos inclinados: la política está entrenada específicamente para ascender pendientes de 1,5 metros, por lo que puede emplearse en pruebas de escalada del microduck en entornos simulados o físicos con rampas.
- Investigación en aprendizaje por refuerzo: sirve como referencia reproducible (semilla, commit y comando documentados) para comparar resultados de entrenamiento con otras políticas del mismo reto.
- Benchmarking de controladores: al ser una política "perpetual" con observaciones y acciones bien definidas, permite medir latencia, estabilidad y consumo en el robot real frente a otras marchas.
- Desarrollo de retos de robótica: se integra en el ecosistema `microduck-challenges` como una solución publicada a la tarea `Mjlab-HillClimb1m5-MicroDuck`.
- Despliegue en el robot mediante el demonio `robotctl`: útil para pruebas de campo en las que se carga la política en una ranura y se evalúa el comportamiento en hardware real.
- Docencia y prototipado: al ser un modelo ONNX pequeño (repo de 0,0 GB) con normalizador integrado, es adecuado para demostrar el flujo completo de entrenamiento a despliegue en robótica de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un modelo muy pequeño, pero no se especifican parámetros ni precisión.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto es plausible que se ejecute en CPU o en hardware embebido del robot, pero no se confirma en la información proporcionada.
- Opciones de despliegue: el modelo se ejecuta mediante el demonio `robotctl` del ecosistema microduck, cargando `policy.onnx` en una ranura de política. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por ciclo de control), según la model card; no se proporcionan cifras de latencia adicionales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables de la misma categoría con datos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial está permitido.
- No se documentan sesgos, pero al ser una política entrenada en simulación, puede presentar una brecha de simulación a realidad (sim-to-real gap) no cuantificada.
- La política está especializada en una única tarea (ascenso de pendiente de 1,5 m); no se garantiza su comportamiento en otros terrenos u objetivos.
- El entrenamiento no es reproducible bit a bit: los pesos exactos no pueden regenerarse, solo una política comparable.
- No hay información sobre la arquitectura de red, número de parámetros ni datos de entrenamiento, lo que limita la evaluación técnica independiente.
- El repositorio registra cero descargas y cero "likes", sin validación comunitaria conocida.
- La fecha de creación indicada (2026-11-12) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del artefacto.
- No aplica soporte multilingüe ni de texto: es un controlador robótico, no un modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-hill-climb-1m5-run-1111-1429-88
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio de microduck (no se proporciona URL directa)
