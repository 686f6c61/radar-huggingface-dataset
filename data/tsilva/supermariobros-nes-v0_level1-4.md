# tsilva/SuperMarioBros-Nes-v0_Level1-4

## Resumen

`tsilva/SuperMarioBros-Nes-v0_Level1-4` es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) para superar el nivel 1-4 de Super Mario Bros. de NES en el entorno `SuperMarioBros-Nes-v0`. Lo desarrolla el usuario tsilva dentro del proyecto GradLab, una librería propia de entrenamiento RL publicada en GitHub. No es un modelo de lenguaje: no procesa ni genera texto, sino que mapea observaciones del entorno (frames del juego) a acciones de control del personaje.

El modelo se entrenó desde cero con semilla `12` y, en el checkpoint publicado, completa el nivel en 80 de las últimas 100 partidas de entrenamiento, con 1.317 despejes acumulados sobre 10.021 episodios y 2.121.728 transiciones de entorno. La relevancia es acotada: se trata de un artefacto de investigación y demostración de la receta de entrenamiento de GradLab, no de un componente listo para producción. No hay evaluación de aceptación independiente publicada.

La información disponible es muy limitada: el repositorio pesa 0,0 GB, no declara licencia ni idiomas, y la model card apenas documenta hiperparámetros, arquitectura de la red o composición del entorno. Cualquier dato no incluido aquí debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO; la model card no detalla la red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (entorno de RL, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle de GradLab), más `model.json` y `recipe.json` |
| Entorno | `SuperMarioBros-Nes-v0`, nivel 1-4 |
| Algoritmo | PPO |
| Semilla de entrenamiento | 12 |
| Transiciones de entorno | 2.121.728 |
| Checkpoint | `checkpoint-2121728-cb8578c931c69b1d` |
| Run ID | `gradlab-85c9b1922b2545d8631b6d4415ef21dd` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red neuronal (número de capas, tipo de extractor de características, tamaño de la capa recurrente o fully connected). Solo se declara que la política se entrenó "from scratch" con PPO en GradLab sobre el entorno `SuperMarioBros-Nes-v0`, partiendo siempre del inicio canónico del nivel 1-4. El algoritmo PPO es un método on-policy de gradiente de política con clipping, habitual en tareas de control discreto como los juegos de NES.

Los datos de entrenamiento disponibles son: 2.121.728 transiciones de entorno, 10.021 episodios y 1.317 despejes acumulados durante el entrenamiento. No se especifica la composición del dataset (no aplica, es un entorno), ni si hubo recompensas conformadas, curriculum learning o ajuste fino posterior. El bundle publicado incluye el manifiesto del checkpoint, los metadatos (`model.json`) y la receta ejecutada (`recipe.json`), que son los artefactos donde podría encontrarse la configuración exacta de entrenamiento.

## Capacidades

- Control de política para Super Mario Bros. NES, nivel 1-4, desde el inicio canónico.
- Toma de decisiones secuenciales a partir de observaciones del entorno (frames del juego).
- Despeje del nivel con una tasa reportada de 80/100 en las últimas 100 partidas de entrenamiento.
- Reproducibilidad parcial: semilla fijada (`12`) y receta ejecutada publicada en el bundle.
- No soporta tool calling, function calling ni agentes multi-step en el sentido de LLM.
- No tiene capacidades multilingües, de visión general, audio ni generación de texto.
- No dispone de modo "thinking" ni razonamiento simbólico más allá de la política entrenada.

## Casos de uso

- Reproducción de experimentos RL: cargar el checkpoint con `gradlab play` y verificar la tasa de despeje reportada sobre el nivel 1-4, útil para validar la receta de GradLab frente a otras configuraciones.
- Baseline para comparación de algoritmos: usar esta política PPO como referencia al evaluar variantes (por ejemplo, otras semillas, otros hiperparámetros de PPO o arquitecturas alternativas) en el mismo entorno y nivel.
- Docencia y divulgación: demostrar de forma tangible cómo PPO aprende una tarea de control discreto con recompensa escasa (despejar un nivel completo), partiendo de cero y con un número acotado de transiciones (~2,1 M).
- Investigación en generalización: evaluar la política en variantes del nivel, cambios de semilla del entorno o perturbaciones de observación para medir robustez, dado que el entrenamiento se restringió al inicio canónico.
- Desarrollo de infraestructura RL: servir como caso de prueba del pipeline de GradLab (empaquetado `model.zip`, manifiestos, recetas) para validar versionado, carga y ejecución de checkpoints.
- Análisis de estabilidad del entrenamiento: estudiar la curva de despejes acumulados (1.317/10.021) y la tasa final (80/100) para caracterizar la varianza de PPO en este entorno con la semilla 12.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas del propio entrenamiento, no benchmarks comparativos con otros modelos o políticas:

| Metrica | Valor |
|---|---|
| Despejes en las últimas 100 partidas de entrenamiento | 80 / 100 |
| Despejes acumulados en entrenamiento | 1.317 / 10.021 |
| Transiciones de entorno | 2.121.728 |
| Evaluación de aceptación independiente | No disponible |
| Comparación con otras políticas | No disponible |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es 0,0 GB y no se detalla el tamaño de la red, aunque por la naturaleza de la tarea (control de NES) es previsible que sea reducida.
- GPU recomendadas: no disponible. No se especifica si el entrenamiento o la inferencia requirieron GPU.
- ¿Cabe en GPU de consumo? No confirmado por el autor; dado el tamaño del bundle (0,0 GB) es plausible, pero no hay dato oficial.
- Opciones de despliegue: `gradlab play` (comando documentado en la model card) con un ROM de Super Mario Bros. NES propio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas PPO del mismo entorno ni referencias a modelos comparables en el resto de la colección de Mario de tsilva. Los datos del autor permiten saber que existe una colección (`gradlab-supermariobros-nes-v0`), pero no se aportan resultados de otros niveles o políticas para comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política entrenada en un entorno concreto, puede explotar atajos del entorno o memorizar trayectorias del nivel 1-4.
- Riesgo de sobreajuste al inicio canónico: el entrenamiento parte siempre del inicio canónico del nivel 1-4, por lo que el rendimiento fuera de esa condición no está garantizado.
- Ausencia de evaluación independiente: la model card indica explícitamente "Independent acceptance evaluation: Unavailable"; la tasa 80/100 proviene de episodios de entrenamiento, no de una evaluación separada.
- Licencia no disponible: no se declara licencia, lo que impide confirmar condiciones de uso comercial o redistribución.
- Dependencia de un ROM propietario: el uso requiere aportar un ROM de Super Mario Bros. NES compatible, cuya legalidad depende de la jurisdicción del usuario.
- Idiomas y cuantización no aplican: no es un modelo de lenguaje ni un modelo generativo de texto; cualquier expectativa en ese sentido es incorrecta.
- Documentación incompleta: no se especifican arquitectura de red, hiperparámetros de PPO, recompensas ni detalles del entorno, lo que dificulta la reproducibilidad completa sin inspeccionar `recipe.json` y `model.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level1-4
- Repositorio GradLab: https://github.com/tsilva/gradlab
- Instalación de GradLab: https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 1-4): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level1-4--2026-11-13
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-85c9b1922b2545d8631b6d4415ef21dd/checkpoints/2121728-cb8578c931c69b1dcb53bc13d061b990b969bb7ae565653d0e1b43a7612126e6/manifest.json
- Colección Mario de tsilva en Hugging Face: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
