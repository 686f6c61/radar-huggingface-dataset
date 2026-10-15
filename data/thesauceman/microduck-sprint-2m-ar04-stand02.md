# TheSauceman/microduck-sprint-2m-ar04-stand02

## Resumen

El modelo `TheSauceman/microduck-sprint-2m-ar04-stand02` es una política de control obtenida por aprendizaje por refuerzo (RL) para el robot bípedo Microduck de Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es un controlador de marcha (gait) que mapea una observación de 61 dimensiones a 14 acciones y que se ejecuta a 50 Hz. Se distribuye como un fichero `policy.onnx` con el normalizador de observaciones ya incorporado, de modo que el robot recibe observaciones en crudo.

El autor, TheSauceman, lo entrena dentro del ecosistema `microduck-challenges` sobre la base `mjlab-microduck 0.1.0`, un entorno de simulación basado en MuJoCo y en el framework mjlab. La tarea concreta es `Mjlab-Sprint2m-MicroDuck`, una variante del reto de sprint de 2 metros de la Microduck Arena. La receta empleada es de 4096 entornos paralelos, 3000 iteraciones del agente y semilla 1, exportando el checkpoint 2750.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de política de locomoción sim-to-real para robótica de bajo coste, con un proceso de entrenamiento documentado (commit, dependencias fijadas con `uv.lock` y comando exacto de reproducción). El repositorio no incluye documentación de benchmarks, licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; el repositorio no detalla la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (se distribuye directamente en ONNX, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del microduck policy manifest) |

Datos adicionales del controlador: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz, política de tipo perpetuo (se ejecuta de forma continua hasta recibir orden en contra).

## Arquitectura y entrenamiento

La información disponible no especifica la topología interna de la red (número de capas, anchura, funciones de activación ni número de parámetros). Lo que sí se documenta es el contrato de entrada y salida: 61-D de observación y 14 acciones a 50 Hz, con el normalizador de observaciones integrado en el propio `policy.onnx`. El fichero `manifest.json` sigue el schema 2 del manifiesto de políticas de microduck definido en el repositorio del daemon (`docs/policy-manifest.md`), lo que permite cargarlo en una ranura de política mediante `robotctl`.

El entrenamiento se realizó con aprendizaje por refuerzo sobre mjlab, con la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `SteveTarter/microduck-challenges` (rama `main`, commit `d65cb4baa`), base `mjlab-microduck 0.1.0 @ 8d0dbc94c`, semilla 1, 4096 entornos y 3000 iteraciones, exportando el checkpoint 2750. El propio autor documenta dos decisiones de modelado del recompensa: penalizar cada grado de giro para forzar una trayectoria recta y hacer que ambas piernas aprendan pasos en espejo (izquierda/derecha simétricas). Después relajó la restricción de suavidad del movimiento y dejó de entrenar el mantenimiento de la postura estática, con lo que la política aprendió a avanzar con decisión a 0,65 m/s. Se advierte explícitamente de que el entrenamiento no es bit-reproducible entre máquinas, por lo que repetirlo produce una política comparable, no idéntica.

## Capacidades

- Generación de marcha bípeda hacia delante a aproximadamente 0,65 m/s (según la descripción del autor).
- Control de locomoción en bucle cerrado a 50 Hz a partir de observaciones de 61 dimensiones.
- Mantenimiento de rumbo recto, mediante una penalización por grados de giro durante el entrenamiento.
- Marcha simétrica: ambas piernas ejecutan pasos en espejo.
- Política perpetua: continúa ejecutándose indefinidamente hasta que se le envía una orden de parada o se descarga la ranura de política.
- Integración con el daemon del robot mediante `robotctl policy load`.
- No se documenta soporte de tool calling, razonamiento multi-paso, visión, audio ni capacidades multilingües (no aplican a este tipo de modelo).

## Casos de uso

- Investigación en locomoción bípeda: sirve como política de referencia para estudiar el efecto de la penalización por giro y de la relajación de la suavidad en la estabilidad de la marcha.
- Transferencia sim-to-real en robótica de bajo coste: al cargarse en el Microduck mediante `robotctl policy load`, permite validar en hardware físico una política entrenada íntegramente en MuJoCo con mjlab.
- Benchmark interno de retos de sprint: la tarea `Mjlab-Sprint2m-MicroDuck` forma parte de la Microduck Arena, por lo que esta política puede usarse como punto de comparación frente a otras variantes (por ejemplo, la referencia de Pollen o la variante `heading-std015-sym2`).
- Base de ajuste fino para nuevas tareas: al estar el entrenamiento documentado con commit, `uv.lock` y comando exacto, puede reutilizarse como punto de partida para reentrenar con otros hiperparámetros o semillas.
- Evaluación de robustez de controladores ONNX: útil para medir el comportamiento de una política perpetua de 14 acciones bajo perturbaciones externas en el simulador.
- Docencia y divulgación en RL aplicado a robótica: es un ejemplo cerrado y ejecutable de un pipeline completo de entrenamiento, exportación a ONNX y despliegue en robot.
- Integración en pipelines de robótica con daemon: el `manifest.json` conforme al schema 2 facilita su carga programática en ranuras de política y su gestión junto a otras marchas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta la velocidad de avance aproximada de 0,65 m/s y hace referencia al contexto del reto de sprint de 2 metros, sin cifras comparativas detalladas. Se menciona de forma indirecta que la política de referencia de Pollen (`pollen-robotics/microduck-sprint-2m-reference`) usa el checkpoint 1000 como su más rápido en la Arena, pero no se aportan métricas numéricas de esta política en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El controlador se exporta a ONNX con 61 entradas y 14 salidas, por lo que su huella de memoria es muy reducida, pero no se documenta el tamaño del grafo.
- GPU recomendadas: no disponible para inferencia (no requiere GPU dedicada). Para el entrenamiento, el autor usa RL con 4096 entornos paralelos, lo que implica aceleración por GPU, aunque no se especifica el modelo concreto.
- Compatibilidad con GPU de consumo: no disponible como dato explícito; por el perfil del modelo (política ONNX de bajas dimensiones) es razonable esperar ejecución en hardware de gama baja o integrado, pero no está confirmado en la información facilitada.
- Opciones de despliegue: ejecución en el propio robot Microduck a través del daemon y `robotctl policy load`; el formato ONNX permite además servirlo con runtimes ONNX estándar (ONNX Runtime, etc.). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. El único dato temporal conocido es la frecuencia de control de 50 Hz, que implica un periodo de actuación de 20 ms.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TheSauceman/microduck-sprint-2m-ar04-stand02 | Política RL de sprint para Microduck | 61-D / 14 | 50 Hz | mjlab, 4096 envs, 3000 iteraciones, semilla 1, checkpoint 2750 | no disponible | HuggingFace (0 descargas, 0 likes) |
| pollen-robotics/microduck-sprint-2m-reference | Política RL de referencia del reto sprint 2 m | 61-D / 14 | 50 Hz | receta sin cambios, 4096 envs, 3000 iteraciones, semilla 1, checkpoint 1000 | no disponible | HuggingFace (Pollen Robotics) |
| TheSauceman/microduck-sprint-2m-heading-std015-sym2 | Política RL de sprint con tolerancia de rumbo reducida y marcha en espejo | 61-D / 14 | 50 Hz | variante sobre el mismo reto | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada, por lo que la comparación se limita a las características declaradas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no mantiene conversaciones ni soporta tool calling; cualquier uso en ese sentido es inaplicable.
- La licencia no está declarada en el repositorio, lo que impide garantizar condiciones de uso comercial o de redistribución. Es un riesgo relevante antes de integrarlo en producto.
- El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no los mismos pesos.
- La exportación se realizó desde una copia de trabajo con cambios sin confirmar ("uncommitted changes"), lo que puede dificultar la reproducción exacta del resultado.
- No hay métricas de benchmarks publicadas, ni tasas de éxito, ni estudios de robustez frente a perturbaciones; no se puede evaluar objetivamente la calidad frente a alternativas.
- El número de descargas y likes es cero, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan sesgos ni capacidades multilingües porque no aplican, pero sí conviene tener presente el sesgo de simulación: el rendimiento real en hardware puede degradarse respecto al simulado (gap sim-to-real).
- La política se describe como "perpetua", lo que implica que debe existir un mecanismo externo de parada o descarga para detenerla; en un despliegue en producción esto requiere gestión explícita del ciclo de vida de la ranura de política.
- No se detalla el comportamiento de la política bajo condiciones fuera de distribución (terrenos irregulares, cargas adicionales, fallos de actuadores).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheSauceman/microduck-sprint-2m-ar04-stand02
- Política de referencia de Pollen Robotics: https://huggingface.co/pollen-robotics/microduck-sprint-2m-reference
- Variante del mismo autor: https://huggingface.co/TheSauceman/microduck-sprint-2m-heading-std015-sym2
- Repositorio de retos de entrenamiento: https://github.com/SteveTarter/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Página del producto Microduck (Pollen Robotics): https://pollen-robotics.com/microduck/
- Recursos y repositorios de MicroDuck: https://microduckrobot.org/resources/
- Artículo de MarkTechPost sobre el lanzamiento: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
