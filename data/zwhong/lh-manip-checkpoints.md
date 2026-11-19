# zwhong/lh-manip-checkpoints

## Resumen

`lh-manip-checkpoints` es una colección de puntos de control (checkpoints) de agentes entrenados con aprendizaje por refuerzo offline (offline RL) para tareas de manipulación robótica de horizonte largo (long-horizon). Lo publica el usuario `zwhong` en Hugging Face bajo licencia MIT, y está asociado al conjunto de datos `lh-manip-offline` del mismo autor. No es un modelo de lenguaje ni un modelo fundacional generativo: es un repositorio de políticas entrenadas, empaquetadas como parámetros de Flax serializados con pickle, pensado para reproducir y comparar experimentos de investigación en RL offline aplicado a robótica.

El repositorio organiza los artefactos en una jerarquía `<group>/<method>/<task>/seed<k>/`, donde cada carpeta contiene `params_<step>.pkl` (parámetros Flax), `flags.json` (configuración de entrenamiento, con rutas específicas de máquina eliminadas) y `action_normalizer.npz`. Se cubren varios grupos de tareas: `table/` con el método `qfa` sobre 9 tareas de horizonte largo, `td_variant/` con `tdflow` sobre 9 tareas (a 1M y 4M pasos) y `ttc/` con los métodos `qfa`, `dfwm`, `lewm` e `ifql` sobre tareas concretas (chamber-hard 1-2, chamber-medium 1-2, block-quadruple 2, hanoi-triple 1). Hay tres semillas por cada combinación de método y tarea.

Su relevancia es la de un recurso de reproducibilidad para investigación en RL offline y manipulación robótica: permite descargar políticas ya entrenadas y comparar métodos sin reentrenar. El tamaño del repositorio es de 286 GB, lo que refleja el volumen de checkpoints almacenados. No se dispone de información sobre arquitecturas neuronales concretas, número de parámetros ni ventana de contexto, ya que no es un modelo de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (políticas de RL; parámetros en formato Flax) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | `.pkl` (parámetros Flax serializados con pickle) y `.npz` (normalizador de acciones) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de red de las políticas (capas, anchuras, tipo de encoder de observaciones ni si incorporan componentes tipo transformer o MLP). Lo que sí se documenta es el marco de entrenamiento: aprendizaje por refuerzo offline, es decir, entrenamiento a partir de un conjunto de datos fijo de transiciones, sin interacción con el entorno durante el aprendizaje. Los métodos presentes en el repositorio son `qfa`, `tdflow`, `dfwm`, `lewm` e `ifql`, y los datos de entrenamiento provienen del dataset `lh-manip-offline`.

Cada checkpoint incluye la configuración de entrenamiento en `flags.json` y un `action_normalizer.npz` que permite desnormalizar las acciones predichas por la política, un detalle necesario para reproducir el comportamiento en el entorno. El grupo `td_variant` incluye variantes entrenadas a 1M y 4M pasos, lo que permite estudiar el efecto del presupuesto de entrenamiento. No se especifican en la información proporcionada el número de tokens (no aplica), la composición del dataset ni si hubo ajuste fino con preferencias.

## Capacidades

- Ejecución de políticas de control para tareas de manipulación robótica de horizonte largo en los entornos asociados al dataset `lh-manip-offline`.
- Inferencia con parámetros Flax cargables en JAX, con normalización de acciones incluida.
- Reproducción de experimentos de RL offline para varios métodos (`qfa`, `tdflow`, `dfwm`, `lewm`, `ifql`).
- Comparación entre semillas (tres por combinación método-tarea) para estimar varianza del entrenamiento.
- Evaluación del efecto del número de pasos de entrenamiento (1M frente a 4M en `td_variant`).
- No soporta generación de texto, tool calling, agentes conversacionales ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de resultados en RL offline: descargar los checkpoints de una combinación método-tarea-semilla y evaluar la política en el entorno correspondiente para verificar las cifras publicadas.
- Comparación de métodos de RL offline: usar los checkpoints de `ttc/` (`qfa`, `dfwm`, `lewm`, `ifql`) sobre las mismas tareas (chamber-hard, chamber-medium, block-quadruple, hanoi-triple) para comparar rendimiento bajo un mismo protocolo de evaluación.
- Estudio de estabilidad entre semillas: las tres semillas por combinación permiten cuantificar la varianza del rendimiento y detectar métodos sensibles a la inicialización.
- Análisis de curvas de entrenamiento: las variantes de `tdflow` a 1M y 4M pasos permiten estudiar la relación entre presupuesto de entrenamiento y calidad de la política.
- Inicialización o ajuste fino de nuevas políticas: los parámetros Flax pueden servir como punto de partida para experimentos de ajuste con datos adicionales.
- Docencia y divulgación en robótica y RL: el repositorio ofrece políticas ya entrenadas que permiten demostrar conceptos de RL offline sin el coste de entrenar desde cero.
- Auditoría de pipelines de entrenamiento: `flags.json` documenta la configuración exacta de cada ejecución, útil para revisar hiperparámetros y detectar discrepancias entre experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamaño de las políticas, que no se especifica.
- GPU recomendadas: no disponible. Al tratarse de parámetros Flax (JAX), se puede usar GPU NVIDIA con soporte CUDA, pero no se documentan modelos concretos.
- ¿Cabe en GPU de consumo? No disponible; no se indica el tamaño de los parámetros de cada checkpoint.
- Almacenamiento: el repositorio completo ocupa 286 GB, por lo que conviene descargar solo las carpetas necesarias mediante descarga selectiva.
- Opciones de despliegue: carga de parámetros Flax en JAX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Métodos incluidos | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lh-manip-checkpoints` (este) | Checkpoints de RL offline para manipulación | qfa, tdflow, dfwm, lewm, ifql | 9 tareas de horizonte largo y tareas específicas de `ttc` | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros repositorios de checkpoints de RL offline comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto, generación, tool calling ni razonamiento conversacional.
- Las políticas están entrenadas para entornos y tareas concretas; su comportamiento fuera de la distribución del dataset `lh-manip-offline` no está garantizado.
- Los checkpoints están serializados con pickle (`.pkl`); cargar archivos pickle de fuentes no confiables supone un riesgo de ejecución de código arbitrario. Verificar la procedencia y, si es posible, usar cargadores restringidos.
- El repositorio ocupa 286 GB; la descarga completa es costosa en almacenamiento y ancho de banda.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque no aplican a este tipo de artefacto.
- La licencia MIT permite uso comercial, pero la ausencia de documentación sobre el dataset subyacente y sobre las condiciones de los entornos limita la evaluación de riesgos en producción.
- No hay información sobre la arquitectura ni el número de parámetros, lo que dificulta estimar requisitos de cómputo antes de la descarga.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zwhong/lh-manip-checkpoints
- Dataset asociado: https://huggingface.co/datasets/zwhong/lh-manip-offline
