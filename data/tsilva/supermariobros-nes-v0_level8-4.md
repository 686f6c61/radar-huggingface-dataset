# tsilva/SuperMarioBros-Nes-v0_Level8-4

## Resumen

`tsilva/SuperMarioBros-Nes-v0_Level8-4` es una política de aprendizaje por refuerzo entrenada desde cero para completar el nivel 8-4 del juego Super Mario Bros. de NES, dentro del entorno `SuperMarioBros-Nes-v0`. Lo desarrolla el usuario de Hugging Face `tsilva` utilizando GradLab, una librería propia de experimentación en RL, con el algoritmo PPO combinado con SIL (Self-Imitation Learning). No es un modelo de lenguaje: es un agente que recibe observaciones del emulador y emite acciones de control del mando de NES.

El checkpoint publicado corresponde al paso 16.777.216 de transiciones de entorno de una única ejecución con semilla `1801`. Según la propia model card, el agente no completó el nivel en ninguno de los 29.149 episodios de entrenamiento contabilizados, y en la evaluación de los últimos 100 episodios el ratio de victoria es de 0/100. En una repetición diagnóstica estocástica de 16 episodios, 14 llegaron al castillo final tras salir del agua, pero ninguno terminó el juego.

Su relevancia es, por tanto, la de un artefacto de investigación reproducible: documenta con detalle la receta, el manifiesto del checkpoint y los resultados negativos, lo que resulta útil para estudiar el comportamiento de PPO+SIL en un nivel especialmente difícil de Super Mario Bros. (el 8-4, con laberinto subacuático y sin margen de error). No debe confundirse con un agente capaz de superar el nivel de forma fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO+SIL en GradLab; topología de red no especificada en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observaciones por frame del emulador) |
| Tipos de cuantizacion | no disponible (pesos en `model.zip`, no se documentan conversiones a GGUF u otros formatos) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle de GradLab); metadatos en `model.json` y receta en `recipe.json` |
| Algoritmo | PPO + SIL (Self-Imitation Learning) |
| Entorno | `SuperMarioBros-Nes-v0`, nivel 8-4, inicio canónico |
| Transiciones de entrenamiento | 16.777.216 |
| Episodios contabilizados | 29.149 |
| Victorias en entrenamiento | 0 / 29.149 |
| Victorias en últimos 100 episodios | 0 / 100 |
| Semilla | 1801 |
| Run ID | `gradlab-a5a1654535f1cc21f740cf49466c025a` |
| Checkpoint | `checkpoint-16777216-dff99313e0c1a2e2` |
| Tamaño del repo | 0.0 GB (según Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la política (número de capas, tipo de extractor de características, tamaño de la red). Lo que sí se documenta es el procedimiento de entrenamiento: PPO combinado con Self-Imitation Learning, ejecutado en GradLab sobre el entorno `SuperMarioBros-Nes-v0` con el nivel 8-4 fijado y arranque canónico en cada episodio contabilizado. El entrenamiento se llevó a cabo en una única ejecución con semilla `1801` y acumuló 16.777.216 transiciones de entorno, un orden de magnitud habitual en experimentos de RL sobre Atari/NES.

La model card menciona que este es el checkpoint final de una ejecución con *reward shaping* orientado a la fase subacuática del nivel. Es decir, la función de recompensa se modificó para guiar al agente a través del tramo de agua, lo que probablemente explica que 14 de 16 episodios de la repetición diagnóstica llegasen al castillo tras salir del agua. El resultado global, sin embargo, es de cero victorias: el agente aprende a progresar hasta la fase final pero no a completarla. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.), ni detalles sobre el dataset de entrenamiento más allá del propio emulador.

## Capacidades

- Control de un agente sobre el mando de NES en el entorno `SuperMarioBros-Nes-v0` (nivel 8-4).
- Política entrenada con PPO+SIL para maximizar recompensa con *reward shaping* en la fase subacuática.
- Progresión consistente hasta el castillo final en repeticiones diagnósticas (14/16 episodios), sin completar el nivel.
- Reproducibilidad: el bundle incluye política, metadatos de checkpoint y receta ejecutada, lo que permite reejecutar la evaluación con `gradlab play`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión general, audio ni capacidades multilingües: es un agente de RL específico de un único entorno.
- No se documenta *thinking mode* ni ninguna capacidad cognitiva adicional.

## Casos de uso

- **Reproducción de experimentos de RL**: el bundle (`model.zip`, `model.json`, `recipe.json`) permite reejecutar la política con `gradlab play` y verificar los resultados publicados. Útil como caso de estudio de PPO+SIL en un entorno difícil.
- **Investigación sobre *reward shaping***: la ejecución documenta explícitamente el efecto de una recompensa orientada a la fase subacuática; sirve como referencia para estudiar cómo el shaping altera la política y por qué no basta para cerrar el nivel.
- **Análisis de fracaso en RL de largo horizonte**: con 0/29.149 victorias en entrenamiento y 0/100 en la ventana final, el checkpoint es un ejemplo realista de estancamiento y de la brecha entre progreso parcial y éxito.
- **Docencia y divulgación**: el nivel 8-4 es un caso canónico de dificultad; el agente y su model card permiten ilustrar conceptos de PPO, SIL, semillas y evaluación estocástica en clase o en un blog técnico.
- **Punto de partida para *fine-tuning* o *curriculum learning***: al llegar al castillo en la mayoría de repeticiones, el checkpoint puede servir como inicialización para experimentos que añadan recompensas o *curricula* orientados al combate final.
- **Evaluación de infraestructura GradLab**: sirve para validar el flujo completo de GradLab (entrenamiento, publicación en Hugging Face, reproducción con `gradlab play`) antes de escalar a otros entornos o niveles.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la propia model card; no hay comparación con otros modelos ni benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que no aplican a este tipo de artefacto.

| Metrica | Valor |
|---|---|
| Victorias en los últimos 100 episodios de entrenamiento | 0 / 100 |
| Victorias acumuladas en entrenamiento | 0 / 29.149 |
| Transiciones de entorno | 16.777.216 |
| Evaluación de aceptación independiente | no disponible |
| Repetición diagnóstica estocástica (16 episodios) | 14 llegan al castillo, 0 completan el nivel |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño del repo es de 0.0 GB según Hugging Face, lo que sugiere un artefacto muy pequeño (política compacta), pero no se especifica el número de parámetros ni la VRAM necesaria.
- **GPU recomendadas**: no disponibles. Por el tipo de carga (agente de RL sobre emulador NES), es probable que funcione en CPU, pero no se documenta.
- **¿Cabe en GPU de consumo?**: no disponible; probablemente sí dada la naturaleza del artefacto, pero sin confirmación del autor.
- **Opciones de despliegue**: `gradlab play` con un ROM de Super Mario Bros. NES propio (`--rom-path`). No se documentan otras vías (ONNX, TensorRT, etc.).
- **Latencia y throughput**: no disponibles.
- **Requisito adicional**: es necesario disponer de un ROM legal del juego; el repositorio no lo incluye.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La colección del autor (`tsilva/policies-supermariobros-nes-v0`) incluye otras políticas del mismo entorno, pero no se aportan sus métricas ni especificaciones en esta ficha.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tsilva/SuperMarioBros-Nes-v0_Level8-4` | no disponible | no aplica | 0/100 victorias en la ventana final | no disponible | Hugging Face |
| Alternativas de la misma colección | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| Otros agentes de RL para NES | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **No completa el nivel**: 0 victorias en 29.149 episodios de entrenamiento y 0/100 en la ventana final. No debe presentarse como un agente capaz de superar el 8-4.
- **Sesgo de *reward shaping***: la recompensa está diseñada para la fase subacuática, lo que puede producir comportamientos que progresan hasta el castillo pero no culminan el nivel.
- **Evaluación limitada**: la evaluación de aceptación independiente figura como no disponible; los resultados provienen de una única ejecución con semilla `1801`.
- **Licencia no especificada**: no se indica licencia, por lo que el uso comercial queda sin marco legal claro.
- **Dependencia de un ROM externo**: requiere un ROM de Super Mario Bros. NES que el usuario debe aportar; el repositorio no lo incluye.
- **Alcance muy restringido**: es un agente específico para un nivel de un juego; no generaliza a otros entornos ni tareas.
- **Riesgo de sobreinterpretación**: la repetición diagnóstica de 16 episodios es una muestra pequeña; el 14/16 no debe leerse como una tasa de éxito estable.
- **Formato propietario de GradLab**: los pesos están en `model.zip` y dependen de la librería `gradlab`; no hay conversión documentada a formatos estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level8-4
- Colección de políticas Super Mario Bros. NES: https://huggingface.co/collections/tsilva/policies-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-a5a1654535f1cc21f740cf49466c025a/checkpoints/16777216-dff99313e0c1a2e29797fc648175a03968c6251733b5f6762544e7630766b976/manifest.json
- GradLab (instalación y uso): https://github.com/tsilva/gradlab#install
