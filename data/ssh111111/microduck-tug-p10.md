# SSH111111/microduck-tug-p10

## Resumen

microduck-tug-p10 es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo resuelve una tarea concreta de locomoción cooperativa u oposición denominada Mjlab-TugOfWar-MicroDuck (tira y afloja), y se distribuye como un grafo ONNX listo para cargarse en una ranura de política del daemon del robot. No es un modelo de lenguaje ni un sistema multimodal: es un controlador de 14 acciones que opera a 50 Hz a partir de observaciones de 61 dimensiones.

El modelo lo publica el usuario SSH111111 y se apoya en el framework mjlab (entorno de simulación basado en MuJoCo) y en la librería microduck. La política es perpetua: se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha o gait precargada. Su relevancia radica en que ejemplifica el flujo completo de entrenamiento con RL en simulación y despliegue en hardware real de robótica de bajo coste, con un manifiesto de política versionado y una receta de reproducción explícita.

La información pública disponible es muy limitada: el repositorio ocupa 0,0 GB, registra 0 descargas y 0 likes, y la model card no incluye licencia, idiomas ni resultados de benchmarks. Todo lo que se detalla a continuación proviene exclusivamente de la model card y de los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (red neuronal; topología interna no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (se distribuye un único `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Tarea | `Mjlab-TugOfWar-MicroDuck` |
| Checkpoint | `1840` |
| Semilla | `42` |
| Base | `mjlab-microduck 0.1.0 @ 1efd853be` |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en el entorno de simulación mjlab, sobre la tarea Mjlab-TugOfWar-MicroDuck, definida en el repositorio `microduck-challenges` (rama `tug-league`, commit `e5610f7bc`). El entrenamiento parte de la base `mjlab-microduck 0.1.0` (commit `1efd853be`) y se reanuda desde el run `2026-11-18_13-17-15_leagueP6`, checkpoint `model_1700.pt`, hasta alcanzar el checkpoint `1840`. Se emplean 4096 entornos paralelos, un máximo de 201 iteraciones, intervalo de guardado cada 20 iteraciones, tasa de aprendizaje de 3e-4 y KL objetivo de 0,003. La arquitectura interna de la red (capas, anchuras, función de activación) no se detalla en la información disponible.

El autor advierte de que el modelo se exportó desde un checkout con cambios sin commitear y de que el entrenamiento por RL con GPU no es bit-reproducible entre máquinas: repetir la receta con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idénticos pesos. El normalizador de observaciones está embebido en `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto. El despliegue se realiza mediante `robotctl policy load <slot> SSH111111/microduck-tug-p10`.

## Capacidades

- Control de locomoción del robot microduck a 50 Hz mediante una política perpetua que se ejecuta hasta recibir una orden de parada o sustitución.
- Generación de una marcha (gait) concreta orientada a la tarea de tira y afloja, cargable en una ranura de política del daemon.
- Procesamiento de observaciones de 61 dimensiones y emisión de 14 acciones de control.
- Normalización de observaciones integrada en el propio grafo ONNX.
- Compatibilidad con el esquema 2 del manifiesto de políticas microduck (`manifest.json`).
- Reproducibilidad documentada del pipeline de entrenamiento (código, commit, semilla y comando).
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, multilingüismo, visión ni audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a robótica: sirve como referencia reproducible de un pipeline completo de entrenamiento en mjlab y despliegue en hardware, con commit, semilla y comando documentados.
- Demostración de tira y afloja robótico: la política implementa el comportamiento específico de la tarea Mjlab-TugOfWar-MicroDuck, útil para exhibiciones y validación del robot microduck en entornos controlados.
- Base para comparación de políticas: al estar versionada como ranura de política, permite contrastar marchas alternativas cargadas en otras ranuras sobre el mismo robot y el mismo daemon.
- Pruebas de integración del daemon y de `robotctl`: el manifiesto schema 2 y el ONNX con normalizador embebido permiten validar el flujo de carga de políticas en el robot real.
- Punto de partida para fine-tuning o reentrenamiento: la receta de `microduck-challenges` (rama `tug-league`) permite reanudar desde checkpoints y adaptar la política a variantes de la tarea.
- Docencia y talleres de robótica de bajo coste: el robot microduck y una política ONNX autocontenida simplifican la puesta en marcha en laboratorios con hardware económico.
- Validación sim-to-real: el modelo permite estudiar la transferencia de una política entrenada con 4096 entornos paralelos a un cuadrúpedo físico a 50 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y el modelo se ejecuta como un grafo ONNX de política, por lo que la huella debería ser mínima, pero no se aportan cifras.
- GPU recomendadas: no disponible para inferencia; para reentrenamiento, la receta emplea 4096 entornos paralelos y no especifica el hardware utilizado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga en el robot mediante `robotctl policy load <slot> SSH111111/microduck-tug-p10`; ejecución del ONNX a través de la librería microduck. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el bucle de control opera a 50 Hz (periodo de 20 ms); no se publican cifras de latencia por inferencia ni de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del mismo autor ni modelos comparables de la misma tarea o del mismo robot con datos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser una política de RL entrenada en simulación, cabe esperar un sesgo hacia las condiciones del entorno simulado, aunque no se documenta.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es un comportamiento fuera de distribución ante observaciones no vistas durante el entrenamiento.
- Limitaciones de contexto o idioma: no aplica; la política consume observaciones de 61 dimensiones y no procesa texto.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede confirmarse el uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- El modelo se exportó desde un checkout con cambios sin commitear, lo que puede dificultar la reproducción exacta.
- El entrenamiento por RL con GPU no es bit-reproducible: la receta genera políticas comparables, no idénticos pesos.
- Repositorio sin descargas ni likes y de creación muy reciente (2026-11-20), sin evidencia de validación por terceros.
- No se especifican los idiomas ni la licencia en los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SSH111111/microduck-tug-p10
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/gktpdls/microduck-challenges.git (rama `tug-league`, commit `e5610f7bc`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
