# tsilva/SuperMarioBros-Nes-v0_Level4-3

## Resumen

`tsilva/SuperMarioBros-Nes-v0_Level4-3` es una política de aprendizaje por refuerzo entrenada para completar el nivel 4-3 del juego Super Mario Bros. de NES en el entorno `SuperMarioBros-Nes-v0`. No es un modelo de lenguaje ni un modelo fundacional: es un agente específico de tarea, desarrollado por el usuario tsilva dentro del proyecto GradLab, que combina PPO (Proximal Policy Optimization) con SIL (Self-Imitation Learning) para aprender desde cero a superar un único nivel.

El modelo resuelve un problema acotado: demostrar que una receta de entrenamiento concreta (PPO + SIL) es capaz de alcanzar una tasa de éxito alta en un nivel concreto y desde el punto de inicio canónico. Según la model card, la política publicada completa el nivel en 95 de las últimas 100 episodios de entrenamiento, con 4.026.368 transiciones acumuladas y 4.715 despejes sobre 14.030 episodios totales durante el entrenamiento.

Su relevancia es metodológica y de reproducibilidad: el paquete incluye la política (`model.zip`), los metadatos del checkpoint (`model.json`) y la receta ejecutada (`recipe.json`), lo que permite auditar el proceso. No obstante, la evaluación de aceptación independiente está marcada como no disponible y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto de investigación sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO + SIL en GradLab; no se especifica la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL sobre observaciones del entorno, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (política empaquetada), `model.json` (metadatos del checkpoint), `recipe.json` (receta ejecutada) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal de la política (capas, tamaño, tipo de extractor de características). Lo que sí se especifica es el algoritmo de entrenamiento: PPO combinado con SIL (Self-Imitation Learning), implementado en la librería GradLab. El entrenamiento se realizó desde cero, sin inicialización a partir de pesos preentrenados, sobre el entorno `SuperMarioBros-Nes-v0` y comenzando cada episodio contado en el punto de inicio canónico del nivel 4-3.

El run identificado como `gradlab-4eceefbc750b437f6b4d26e5c6076d1d` produjo el checkpoint `checkpoint-4026368-913fca5dc0058a80`, con semilla `1801`. Se acumularon 4.026.368 transiciones de entorno y 14.030 episodios, de los cuales 4.715 terminaron en despeje del nivel. La receta ejecutada se distribuye junto con los pesos, lo que facilita la reproducción, aunque no se han publicado detalles sobre hiperparámetros, composición de recompensas ni técnicas auxiliares de exploración en la información proporcionada.

## Capacidades

- Control de un agente en el entorno `SuperMarioBros-Nes-v0`, limitado al nivel 4-3.
- Ejecución de una política entrenada para completar el nivel desde el inicio canónico.
- Reproducción del comportamiento mediante el comando `gradlab play` con un ROM de Super Mario Bros. NES aportado por el usuario.
- Distribución del bundle completo de entrenamiento: política, metadatos de checkpoint y receta.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües, de visión general, audio ni modo de razonamiento extendido.
- No se documentan capacidades de generalización a otros niveles, otras modificaciones del juego u otras configuraciones del entorno.

## Casos de uso

- Reproducción de experimentos de RL: el bundle incluye `recipe.json` y `model.json`, lo que permite volver a ejecutar la receta y comparar curvas de aprendizaje en el mismo entorno y semilla.
- Evaluación de algoritmos PPO + SIL: sirve como línea base cuantificada (95/100 en los últimos 100 episodios de entrenamiento) para contrastar variantes del algoritmo en el mismo nivel.
- Docencia y demostraciones de aprendizaje por refuerzo: un agente que resuelve un nivel concreto de NES es un ejemplo visual y verificable para explicar políticas, recompensas y estabilización del entrenamiento.
- Investigación en currículos por niveles: al existir una colección de políticas por nivel del mismo entorno, puede usarse para estudiar transferencia entre niveles o inicialización de políticas.
- Pruebas de infraestructura de RL: útil para validar pipelines de entrenamiento, checkpointing y empaquetado de artefactos en GradLab antes de escalar a entornos más costosos.
- Análisis de robustez y aleatoriedad: permite medir la varianza de éxito de una política determinista o estocástica sobre el mismo nivel y punto de partida.
- No es adecuado para aplicaciones de producción de texto, código, atención al cliente ni tareas fuera del entorno de juego.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de entrenamiento, no benchmarks estándar de modelos de lenguaje:

| Metrica | Valor |
|---|---|
| Despejes en los últimos 100 episodios de entrenamiento | 95 / 100 |
| Despejes acumulados en entrenamiento | 4.715 / 14.030 |
| Transiciones de entorno | 4.026.368 |
| Evaluación de aceptación independiente | No disponible |
| Semilla del run | 1801 |

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros no aplican a este artefacto).

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU en la información disponible; al tratarse de una política de RL para un entorno NES, la inferencia es presumiblemente ligera, pero no hay datos confirmados.
- No se indican GPU recomendadas (A100, H100, RTX 4090 u otras).
- No se confirma que quepa en GPU de consumo, aunque por la naturaleza del entorno es plausible; se marca como no disponible al no estar documentado.
- Despliegue mediante la herramienta GradLab: `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level4-3' --rom-path /path/to/SuperMarioBros.nes`.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.
- Requisito adicional: el usuario debe aportar su propio ROM de Super Mario Bros. NES compatible; el repositorio no incluye el ROM.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Métrica de éxito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level4-3 | Política RL (PPO + SIL) | SuperMarioBros-Nes-v0, nivel 4-3 | 95/100 en últimos 100 episodios de entrenamiento | no disponible | Hugging Face, 0 descargas |
| Otras políticas de la colección GradLab SuperMarioBros-Nes-v0 | Política RL | Otros niveles del mismo entorno | no disponible en esta ficha | no disponible | Colección de Hugging Face |
| Alternativas de RL para Atari/NES (por ejemplo, implementaciones PPO públicas) | Política RL | Entornos Atari/NES | no disponible | variable | repositorios públicos |

No se dispone de datos comparativos verificados con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un agente de RL sobre un juego, los sesgos relevantes serían los del propio entorno y de la distribución de entrenamiento, no sesgos sociales.
- Riesgo de sobreajuste al nivel y al punto de inicio: la métrica de 95/100 corresponde a episodios de entrenamiento, no a una evaluación independiente, que está marcada como no disponible.
- Generalización no demostrada: no hay evidencia de que la política funcione en otros niveles, otras versiones del ROM u otras configuraciones del entorno.
- Dependencia de un ROM externo: el usuario debe aportar su propia copia legal de Super Mario Bros. NES; el repositorio no incluye el ROM.
- Licencia no disponible: no se especifican términos de uso comercial ni de redistribución, lo que impide asumir permisos.
- Idiomas: no aplica; no es un modelo de lenguaje.
- Contexto: no aplica; la política opera sobre observaciones del entorno, no sobre texto.
- Madurez: 0 descargas y 0 likes, sin evaluación de aceptación independiente, lo que indica un artefacto de investigación sin validación comunitaria.
- Repositorio de tamaño 0.0 GB según los metadatos, lo que puede indicar que los pesos no están efectivamente alojados o que el tamaño reportado no es fiable; conviene verificar el contenido antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level4-3
- Colección GradLab SuperMarioBros-Nes-v0: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Repositorio GradLab: https://github.com/tsilva/gradlab
- Instalación de GradLab: https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 4-3): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level4-3--2026-11-18
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-4eceefbc750b437f6b4d26e5c6076d1d/checkpoints/4026368-913fca5dc0058a8034b8a427012bdaff952ca853e9576f74206574743dab2757/manifest.json
