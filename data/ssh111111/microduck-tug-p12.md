# SSH111111/microduck-tug-p12

## Resumen

`microduck-tug-p12` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo resuelve una tarea concreta de locomoción y tracción denominada `Mjlab-TugOfWar-MicroDuck` (tira y afloja), y se distribuye como un fichero ONNX listo para cargarse en una ranura de política del demonio `robotctl` del robot. Lo publica el usuario SSH111111 y se enmarca en la librería `microduck`, con pipeline declarado `robotics`.

Técnicamente no es un modelo de lenguaje: es una política de refuerzo perpetua (se ejecuta de forma continua hasta que se detiene explícitamente) que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz. El normalizador de observaciones está embebido en el propio `policy.onnx`, por lo que la política acepta observaciones en bruto sin preprocesado externo. Se entrenó con el framework mjlab sobre 4096 entornos paralelos y un checkpoint final en la iteración 1860.

Su relevancia es acotada pero clara: demuestra un flujo completo de entrenamiento, exportación y despliegue de políticas de locomoción para un robot cuadrúpedo de bajo coste, con instrucciones de reproducción mediante `uv` y un manifiesto de política versionado (schema 2). No hay información publicada sobre licencia, idiomas ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (red neuronal feedforward; topología interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación usando mjlab (entorno de simulación física basado en MuJoCo para entrenamiento de políticas), sobre la tarea `Mjlab-TugOfWar-MicroDuck`. El entrenamiento se ejecutó con 4096 entornos en paralelo, un máximo de 301 iteraciones, intervalo de guardado cada 20 iteraciones y un learning rate de 3e-4 con KL objetivo de 0.003, registrando en TensorBoard bajo el nombre de ejecución `leagueP12`. El checkpoint exportado corresponde a la iteración 1860, partiendo de la base `mjlab-microduck 0.1.0` en el commit `1efd853be`, semilla 42 y commit de código `855de5002` de la rama `tug-league`.

El modelo se exporta a ONNX con el normalizador de observaciones integrado, de modo que el consumidor alimenta observaciones crudas. La política es de tipo perpetuo: no tiene condición de terminación propia y se ejecuta a 50 Hz hasta que el sistema la detiene. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el pipeline con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no los mismos pesos. Además, el export se realizó desde un checkout con cambios sin commitear, lo que introduce una fuente de variabilidad no documentada respecto al commit declarado.

## Capacidades

- Control de locomoción del robot microduck: genera 14 acciones de actuación a partir de observaciones de 61 dimensiones a 50 Hz.
- Ejecución de una marcha (gait) especializada en la tarea de tira y afloja (`TugOfWar`), cargable en una ranura de política del demonio del robot.
- Funcionamiento perpetuo: la política no se detiene por sí misma, lo que la hace adecuada para control continuo.
- Normalización de observaciones integrada en el artefacto ONNX: acepta observaciones en bruto sin pipeline de preprocesado adicional.
- Despliegue mediante `robotctl policy load <slot> SSH111111/microduck-tug-p12`.
- No dispone de tool calling, function calling, capacidades de agente, multilingüismo ni modos de razonamiento: no es un modelo generativo de texto.

## Casos de uso

- Investigación en locomoción de cuadrúpedos: servir como política de referencia para comparar estrategias de entrenamiento en la tarea `TugOfWar` sobre microduck, usando el mismo entorno mjlab y la misma configuración de 4096 entornos.
- Demostración de despliegue extremo a extremo: ilustra el ciclo completo de entrenamiento en simulación, exportación a ONNX con normalizador embebido y carga en hardware real mediante `robotctl`, útil como plantilla para nuevos desarrollos.
- Pruebas de tracción y arrastre: la política está especializada en tareas de tira y afloja, por lo que puede usarse para evaluar la capacidad de tracción del robot bajo carga controlada en banco de pruebas.
- Benchmark de pipelines de RL: al documentarse comando, semilla, commit y configuración, sirve para medir la variabilidad entre ejecuciones de entrenamiento (el autor ya advierte de la no reproducibilidad bit a bit).
- Integración en competiciones o ligas de políticas: el nombre de ejecución `leagueP12` y la rama `tug-league` sugieren un contexto de liga de políticas, donde este modelo puede emplearse como participante o como baseline.
- Validación de la cadena de herramientas microduck: útil para verificar que el manifiesto schema 2 y el cargador de políticas del demonio funcionan correctamente con artefactos ONNX reales antes de desplegar políticas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un artefacto ONNX muy pequeño, pero no se especifica el número de parámetros ni el tamaño exacto del fichero.
- GPU recomendadas: no disponible. Para el entrenamiento se usó RL con GPU (el autor menciona que el entrenamiento con GPU no es bit-reproducible), pero no se indica el modelo de GPU empleado.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamaño aparentemente reducido del artefacto, es plausible que la inferencia quepa en hardware de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: el despliegue previsto es en el robot microduck mediante el demonio `robotctl` y el cargador de políticas, ejecutando el `policy.onnx` a 50 Hz. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican cifras de latencia de inferencia ni de throughput más allá de esa frecuencia de control.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Observaciones | Acciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-tug-p12 | Política RL (ONNX) | TugOfWar sobre microduck | 61-D | 14 | no disponible | Hugging Face |
| Otras políticas microduck | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otras políticas publicadas para microduck ni sobre modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada exclusivamente para la tarea `Mjlab-TugOfWar-MicroDuck`; no se garantiza su comportamiento en otras tareas de locomoción o entornos distintos.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento con RL en GPU no es bit-reproducible entre máquinas; repetir el pipeline produce una política comparable, no idéntica.
- Export desde un checkout con cambios sin commitear: el artefacto publicado no corresponde exactamente al commit declarado, lo que dificulta la auditoría del proceso de entrenamiento.
- Sin métricas publicadas: no hay benchmarks, curvas de recompensa ni evaluaciones de robustez que permitan valorar el rendimiento real de la política.
- Riesgo de fallo en hardware real: al tratarse de una política entrenada en simulación, puede sufrir la brecha simulación-real (sim-to-real gap); no se documentan pruebas de robustez ante perturbaciones, terreno variable o cargas no modeladas.
- Sin información sobre sesgos: no aplica en el sentido habitual de modelos de lenguaje, pero no se documenta el comportamiento de la política ante condiciones fuera de distribución.
- Ejecución perpetua: al no tener condición de terminación propia, requiere que el sistema anfitrión gestione la parada; un fallo en esa gestión mantendría la política activa indefinidamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SSH111111/microduck-tug-p12
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/gktpdls/microduck-challenges.git (rama `tug-league`, commit `855de5002`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio microduck (ruta citada en la model card; URL completa no disponible)
