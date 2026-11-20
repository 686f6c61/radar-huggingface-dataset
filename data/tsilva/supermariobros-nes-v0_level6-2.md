# tsilva/SuperMarioBros-Nes-v0_Level6-2

## Resumen

SuperMarioBros-Nes-v0_Level6-2 es una política de aprendizaje por refuerzo entrenada desde cero con PPO (Proximal Policy Optimization) en el framework GradLab para completar el nivel 6-2 del juego Super Mario Bros. de NES. El modelo lo publica el usuario tsilva en Hugging Face y no es un modelo de lenguaje: es un agente que recibe el estado del emulador del juego y emite acciones de control del mando de NES.

El artefacto publicado es un checkpoint concreto (`checkpoint-7430144-f21dade919d4f45f`) de una ejecución de entrenamiento identificada como `gradlab-337bb4878a21bf033d101dbfbe586b52`, con semilla 12. El autor reporta que en las últimas 100 episodios de entrenamiento la política completó el nivel en 80 de ellos, partiendo siempre del inicio canónico del nivel 6-2.

Su relevancia es acotada y muy específica: sirve como referencia reproducible de un agente PPO que resuelve un nivel concreto de un entorno clásico de RL, y como pieza dentro de la colección de políticas por nivel que el autor mantiene para Super Mario Bros. No aporta arquitectura de transformer ni pesos en safetensors/GGUF; el paquete contiene una política serializada (`model.zip`) junto con metadatos del checkpoint y la receta de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL serializada como `model.zip`; el autor no detalla la red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre observaciones del entorno) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | `model.zip` (política), `model.json` (metadatos del checkpoint), `recipe.json` (receta ejecutada) |

## Arquitectura y entrenamiento

El modelo es una política entrenada con PPO mediante la librería GradLab sobre el entorno `SuperMarioBros-Nes-v0`. El autor no publica en la model card detalles de la arquitectura de la red (capas, tamaño, tipo de extractor de características), por lo que ese dato debe considerarse no disponible. El entrenamiento se realizó desde cero, sin inicialización a partir de otro checkpoint, y cada episodio contabilizado parte del inicio canónico del nivel 6-2.

Los datos de entrenamiento reportados son: 7.430.144 transiciones de entorno, 21.186 episodios acumulados y 5.342 episodios completados con éxito a lo largo del entrenamiento. El checkpoint publicado corresponde a la ejecución `gradlab-337bb4878a21bf033d101dbfbe586b52`, con semilla 12. No se documentan innovaciones técnicas adicionales (curriculum, reward shaping, decodificación especulativa ni atención lineal); la receta ejecutada está disponible en `recipe.json` dentro del bundle.

## Capacidades

- Control de un agente en el entorno `SuperMarioBros-Nes-v0`, limitado al nivel 6-2 desde el inicio canónico.
- Toma de decisiones por paso de entorno: recibe observaciones del emulador y emite acciones de mando de NES.
- Completar el nivel con una tasa reportada del 80 % en las últimas 100 episodios de entrenamiento.
- Reproducibilidad del entrenamiento mediante la receta (`recipe.json`) y los metadatos del checkpoint (`model.json`).
- Ejecución local mediante el comando `gradlab play` con una ROM de Super Mario Bros. NES aportada por el usuario.
- No soporta tool calling, function calling, agentes multi-paso genéricos, capacidades multilingües, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de resultados de RL: cargar el checkpoint con `gradlab play` y verificar la tasa de éxito reportada sobre el nivel 6-2, usando la receta y la semilla documentadas.
- Referencia para entrenamiento de políticas por nivel: sirve como punto de comparación al entrenar nuevas políticas en el mismo entorno con distintas recetas o hiperparámetros.
- Estudio de PPO en entornos discretos de control: el bundle permite inspeccionar la política serializada y la receta ejecutada para analizar la configuración de entrenamiento.
- Base para experimentos de transferencia o fine-tuning: al ser una política entrenada desde cero para un nivel concreto, puede usarse como inicialización en experimentos sobre niveles similares del mismo juego.
- Docencia y demostraciones de RL: ejemplo reproducible de un agente que resuelve una tarea concreta con un número de transiciones documentado (7,4 millones).
- Integración en la colección de políticas por nivel del autor: forma parte de un conjunto de checkpoints que cubren distintos niveles de Super Mario Bros. NES, útil para evaluaciones agregadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Nivel completado en los últimos 100 episodios de entrenamiento | 80 / 100 |
| Episodios completados acumulados en entrenamiento | 5.342 / 21.186 |
| Transiciones de entorno | 7.430.144 |
| Evaluación de aceptación independiente | No disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos o políticas en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU en la información proporcionada; el tamaño del repositorio es de 0,0 GB.
- Al tratarse de una política de RL de pequeño tamaño serializada en `model.zip`, la inferencia se ejecuta mediante GradLab junto con el emulador del juego, no mediante un runtime de modelos de lenguaje.
- No se documentan GPU recomendadas (A100, H100, RTX 4090 u otras) ni si cabe en GPU de consumo.
- Opciones de despliegue: `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level6-2' --rom-path /path/to/SuperMarioBros.nes`, previa instalación de GradLab.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Método | Tasa de éxito reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level6-2 | SuperMarioBros-Nes-v0, nivel 6-2 | PPO (GradLab) | 80/100 en los últimos 100 episodios de entrenamiento | No disponible | Hugging Face |
| Otras políticas de la colección GradLab del mismo autor | SuperMarioBros-Nes-v0, otros niveles | PPO (GradLab) | No disponible en la información proporcionada | No disponible | Hugging Face (colección) |
| Alternativas externas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La tasa de éxito del 80 % proviene de los últimos 100 episodios de entrenamiento, no de una evaluación independiente; el propio autor marca la evaluación de aceptación independiente como no disponible.
- El resultado corresponde a una única ejecución con semilla 12; no se reporta varianza entre semillas ni intervalos de confianza.
- La política está especializada en el nivel 6-2 desde el inicio canónico; no hay evidencia de que generalice a otros niveles, a posiciones intermedias del nivel o a variantes del entorno.
- Requiere una ROM de Super Mario Bros. NES aportada por el usuario; la distribución de la ROM no está incluida y su uso queda sujeto a la legalidad aplicable en cada jurisdicción.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; debe tratarse como restricción desconocida hasta que el autor la especifique.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje natural; esos criterios no aplican en su forma habitual.
- No hay información sobre la arquitectura de la red ni sobre el número de parámetros, lo que limita la evaluación técnica y la comparación con otras políticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level6-2
- Informe de entrenamiento (nivel 6-2): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level6-2--2026-11-17
- Instalación de GradLab: https://github.com/tsilva/gradlab#install
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-337bb4878a21bf033d101dbfbe586b52/checkpoints/7430144-f21dade919d4f45f17a1e3cb072e8e889bd95f293163775c15acb6334520162d/manifest.json
- Colección de políticas Super Mario Bros. NES: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
