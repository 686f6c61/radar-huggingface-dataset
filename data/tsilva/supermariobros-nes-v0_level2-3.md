# tsilva/SuperMarioBros-Nes-v0_Level2-3

## Resumen

SuperMarioBros-Nes-v0_Level2-3 es una política de aprendizaje por refuerzo entrenada desde cero con PPO (Proximal Policy Optimization) mediante el framework GradLab, desarrollada por el usuario tsilva. El modelo resuelve una tarea muy concreta: completar el nivel 2-3 de Super Mario Bros. para NES en el entorno `SuperMarioBros-Nes-v0`, partiendo siempre del inicio canónico del nivel. No es un modelo de lenguaje ni un sistema multimodal, sino un agente que mapea observaciones del estado del juego a acciones de control.

El interés de esta ficha es limitado para el público habitual de un blog de IA generativa: se trata de un artefacto de investigación en RL con descargas y likes nulos en el momento de la consulta, sin model card extendida más allá de los resultados de entrenamiento y sin evaluación independiente. Resulta relevante únicamente como ejemplo reproducible de receta de entrenamiento PPO por niveles en GradLab y como referencia para experimentos de RL en videojuegos clásicos.

La información disponible no incluye arquitectura de red, número de parámetros, contexto ni idiomas, por lo que muchos campos de esta ficha se marcan como no disponibles. El repositorio tiene un tamaño declarado de 0.0 GB y contiene el bundle de política (`model.zip`), metadatos del checkpoint (`model.json`) y la receta ejecutada (`recipe.json`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política PPO entrenada con GradLab; arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el agente opera por pasos de entorno) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | bundle GradLab: `model.zip` (política), `model.json` (metadatos), `recipe.json` (receta) |

## Arquitectura y entrenamiento

El modelo es una política entrenada con PPO en GradLab sobre el entorno `SuperMarioBros-Nes-v0`. Según la model card, el entrenamiento partió desde cero ("from scratch") y se ejecutó una única semilla (`seed 12`), contabilizando cada episodio desde el inicio canónico del nivel 2-3. El checkpoint publicado corresponde a la ejecución `gradlab-9a24c8fd278534de9d72ebe8cb563601` y al checkpoint `checkpoint-3424256-4269b1261b7ac9e8`, tras 3.424.256 transiciones de entorno.

No se especifica en la información disponible el tipo de red neuronal empleada (CNN, MLP u otra), el número de parámetros, la composición del dataset (en RL, la distribución de estados visitados), ni si se aplicaron técnicas auxiliares como reward shaping, curriculum learning o regularización. La model card indica que los conteos de niveles completados provienen de una sola ejecución de entrenamiento y que no existe una evaluación de aceptación independiente.

## Capacidades

- Control de agente en Super Mario Bros. NES: ejecuta acciones para completar el nivel 2-3 desde el inicio canónico.
- Aprendizaje por refuerzo con PPO: política entrenada mediante optimización de política proximal.
- Reproducibilidad parcial: el bundle incluye la receta ejecutada (`recipe.json`) y los metadatos del checkpoint (`model.json`).
- Ejecución mediante la CLI de GradLab (`gradlab play`), requiriendo una ROM de Super Mario Bros. NES aportada por el usuario.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, capacidades de agente multi-paso fuera del entorno, ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de RL en videojuegos: usar el bundle y la receta publicada para replicar el entrenamiento PPO del nivel 2-3 en GradLab y comparar curvas de aprendizaje con la semilla 12.
- Baseline por niveles en Super Mario Bros.: emplear esta política como referencia de rendimiento (90/100 episodios recientes) al evaluar nuevas recetas o hiperparámetros en el mismo nivel.
- Docencia de aprendizaje por refuerzo: ilustrar un pipeline completo de PPO (entorno, receta, checkpoint, evaluación) con un caso acotado y verificable.
- Investigación en generalización de políticas: analizar el comportamiento del agente ante variaciones del estado inicial o perturbaciones, dado que fue entrenado exclusivamente desde el inicio canónico.
- Pruebas de infraestructura de entrenamiento: validar herramientas de orquestación, registro de checkpoints y reproducibilidad usando una ejecución con métricas conocidas (3.011/10.074 clears acumulados).
- Demostraciones de agentes en emuladores NES: ejecutar la política con `gradlab play` para mostrar control end-to-end en un entorno clásico, siempre con ROM propia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Niveles completados en los últimos 100 episodios de entrenamiento | 90 / 100 |
| Niveles completados acumulados en entrenamiento | 3.011 / 10.074 |
| Transiciones de entorno | 3.424.256 |
| Evaluación de aceptación independiente | No disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Las cifras anteriores provienen de una única ejecución de entrenamiento (semilla 12) y no de una evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamaño de la red; el repositorio declara 0.0 GB).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; al no conocerse el tamaño del modelo, no puede afirmarse que quepa en tarjetas como RTX 4090 o similares.
- Opciones de despliegue: CLI de GradLab (`gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level2-3' --rom-path ...`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level2-3 | Política PPO (GradLab) | SuperMarioBros-Nes-v0, nivel 2-3 | 90/100 en últimos 100 episodios de entrenamiento | no disponible | Hugging Face |
| Otros checkpoints de la colección GradLab SuperMarioBros-Nes-v0 | Políticas PPO (GradLab) | SuperMarioBros-Nes-v0, otros niveles | no disponible en la información proporcionada | no disponible | Hugging Face (colección tsilva) |
| Alternativas externas de RL en Super Mario Bros. | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos de la misma categoría fuera de la colección del mismo autor.

## Limitaciones y advertencias

- Sesgos conocidos: la política fue entrenada únicamente desde el inicio canónico del nivel 2-3; su comportamiento ante estados iniciales distintos, modificaciones del entorno o niveles diferentes no está caracterizado.
- Riesgo de sobreajuste: los resultados provienen de una sola semilla y de los últimos 100 episodios de entrenamiento, sin evaluación independiente, por lo que pueden no reflejar rendimiento fuera de la distribución de entrenamiento.
- Alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de acciones erráticas o no generalizables en estados no vistos.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje natural.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si se permite uso comercial o redistribución.
- Requisito legal: el uso requiere una ROM de Super Mario Bros. NES aportada por el usuario; la distribución de ROMs con copyright no está permitida.
- Caveat para producción: sin evaluación de aceptación independiente ni métricas fuera de entrenamiento, no es adecuado como componente crítico en sistemas productivos.
- Descargas y likes nulos en el momento de la consulta: ecosistema de validación prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level2-3
- Colección GradLab SuperMarioBros-Nes-v0: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Repositorio GradLab: https://github.com/tsilva/gradlab
- Instrucciones de instalación de GradLab: https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 2-3): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level2-3--2026-11-13
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-9a24c8fd278534de9d72ebe8cb563601/checkpoints/3424256-4269b1261b7ac9e85b7878581b911fb78101757019943667c34b4eea5e71e58c/manifest.json
