# YellowDuckSweater/microduck-hill-climb-1m5-run-1108-0844-99

## Resumen

El modelo `microduck-hill-climb-1m5-run-1108-0844-99`, publicado por el usuario YellowDuckSweater, es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de un controlador entrenado para ejecutar una marcha perpetua de ascenso por pendientes (hill climb) sobre una plataforma de simulación física, exportado a formato ONNX para su despliegue directo en el robot.

La política consume observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de control de 50 Hz. El entrenamiento se realizó con la librería mjlab (basada en MuJoCo) sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`, con 4096 entornos paralelos y 3333 iteraciones máximas. El checkpoint publicado corresponde a la iteración 2250 con semilla 3.

El interés de esta ficha es limitado para el público general de modelos de IA, pero resulta relevante para quienes trabajan en robótica con aprendizaje por refuerzo y en el ecosistema microduck. La model card es extremadamente escasa (contiene una cadena "sss" y poco más), el repositorio pesa 0.0 GB y no se han publicado benchmarks ni especificaciones detalladas de la arquitectura de red.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; red neuronal de control, topología no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), más `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Pipeline | robotics |
| Librería | microduck |
| Observaciones de entrada | 61 dimensiones |
| Acciones de salida | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Tarea de entrenamiento | `Mjlab-HillClimb1m5-MicroDuck` |
| Entornos paralelos | 4096 |
| Iteraciones máximas | 3333 |
| Checkpoint publicado | 2250 |
| Semilla | 3 |
| Base de simulación | mjlab-microduck 0.1.0 @ 1efd853be |
| Commit de entrenamiento | e38fb1d65 (rama `main` de `StephenForte/microduck-challenges`) |

## Arquitectura y entrenamiento

La información disponible no describe la topología de la red neuronal (número de capas, unidades por capa, función de activación ni tipo de política, p. ej. MLP con cabeza gaussiana o determinista). Lo que sí se sabe es que se trata de una política de aprendizaje por refuerzo entrenada en simulación con mjlab, un entorno basado en MuJoCo, sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`. El entrenamiento empleó 4096 entornos paralelos, un máximo de 3333 iteraciones y semilla 3, con TensorBoard como logger, y se detuvo en el checkpoint 2250.

El resultado se exporta a ONNX con el normalizador de observaciones embebido en el propio `policy.onnx`, de modo que el robot puede alimentar observaciones crudas sin preprocesado externo. La política es de tipo "perpetuo": se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha cargada en una ranura de política del demonio `robotctl`. El autor advierte que el entrenamiento no es reproducible bit a bit entre máquinas, por lo que repetir el comando con la misma semilla produce una política comparable pero no idéntica.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck mediante una política de RL cargada en una ranura del demonio `robotctl`.
- Marcha perpetua de ascenso por pendientes (hill climb) a 1 m de altura de escena, según el identificador de tarea `Mjlab-HillClimb1m5`.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones de control a 50 Hz.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración en el robot.
- Ejecución continua: la política no tiene condición de parada propia y corre hasta que se le ordene detenerla.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo "thinking"; no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción de cuadrúpedos: sirve como política de referencia para comparar estrategias de ascenso por pendientes en el robot microduck, cargándola en una ranura con `robotctl policy load` y midiendo el comportamiento en pista inclinada.
- Reproducción de experimentos de RL: el repositorio `microduck-challenges` y el comando documentado permiten reentrenar la tarea `Mjlab-HillClimb1m5-MicroDuck` con 4096 entornos y semilla 3 para estudiar la variabilidad entre ejecuciones.
- Docencia en robótica y aprendizaje por refuerzo: el modelo es un ejemplo compacto de pipeline completo (simulación en mjlab, entrenamiento con 4096 entornos, exportación a ONNX y despliegue en hardware real) adecuado para prácticas.
- Pruebas de integración del demonio `robotctl`: permite validar el flujo de carga de políticas, el esquema 2 de `manifest.json` y la inyección de observaciones crudas en un robot microduck real.
- Benchmarking de simulación a realidad (sim-to-real): al ser una política entrenada íntegramente en MuJoCo, sirve para evaluar la brecha de transferencia en una tarea concreta de ascenso.
- Comparación de checkpoints: al publicarse el checkpoint 2250 de una campaña de 3333 iteraciones, permite analizar el efecto del número de iteraciones sobre la calidad de la marcha en una misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito en ascenso, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una política de control de 61 entradas y 14 salidas exportada a ONNX, el modelo es presumiblemente muy ligero, pero no se especifica el número de parámetros ni el tamaño del archivo.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible; por la naturaleza del modelo (control a 50 Hz en un robot microduck) es plausible que se ejecute en CPU, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: ONNX Runtime a través del demonio `robotctl` del ecosistema microduck (`sudo robotctl policy load <slot> YellowDuckSweater/microduck-hill-climb-1m5-run-1108-0844-99`). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible; el único dato es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck comparables ni referencias a modelos alternativos de la misma categoría (locomoción de cuadrúpedos en mjlab).

## Limitaciones y advertencias

- La model card es prácticamente vacía (contiene la cadena "sss" y metadatos de entrenamiento); no hay descripción de la arquitectura, del rendimiento ni de las condiciones de uso previstas.
- Licencia no especificada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- El repositorio pesa 0.0 GB y no tiene descargas ni likes, lo que sugiere que el artefacto puede estar incompleto o que el tamaño reportado no refleja el contenido real; conviene verificar los archivos antes de usarlo.
- El modelo está entrenado exclusivamente en simulación (mjlab/MuJoCo); no hay evidencia publicada de transferencia exitosa al robot físico (sim-to-real).
- La política es "perpetua" y no incorpora condición de parada propia: en producción debe gestionarse externamente la interrupción y los mecanismos de seguridad del robot.
- El entrenamiento no es reproducible bit a bit; repetir el comando con la misma semilla produce pesos distintos, lo que dificulta la auditoría exacta.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje; esos criterios no aplican.
- El identificador de tarea (`Mjlab-HillClimb1m5`) sugiere una escena de ascenso de 1 m, pero no se documentan las condiciones exactas (tipo de pendiente, fricción, terreno) ni los rangos de observación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-hill-climb-1m5-run-1108-0844-99
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de desafíos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (ruta citada en la model card, sin URL directa disponible)
