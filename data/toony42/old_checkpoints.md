# toony42/old_checkpoints

## Resumen

El repositorio `toony42/old_checkpoints` no contiene un modelo de inferencia listo para usar, sino un archivo de entrenamiento: 99,8 GB de logs y checkpoints LoRA procedentes de un proceso de fine-tuning por aprendizaje por refuerzo (RL) de la familia GRPO aplicado a modelos de difusión de vídeo. El autor, `toony42`, ha publicado este material como registro de 13 experimentos de entrenamiento sobre modelos de la línea SkyReels-I2V, incluyendo variantes como `skyreels_default`, `skyreels_bump` o `skyreels_flow_grpo`, además de un directorio `_promptdemo_skyreels`.

El repositorio resulta relevante para investigadores y desarrolladores que deseen analizar el proceso de optimización por RL en generación de vídeo, reanudar entrenamientos o extraer pesos LoRA para experimentación. No se trata de un modelo con arquitectura, contexto o parámetros documentados: la información disponible se limita a la estructura de carpetas, los nombres de los runs y los metadatos de WandB. Por tanto, cualquier evaluación de capacidades o rendimiento debe partir de la reconstrucción del modelo base y del análisis de los artefactos almacenados, no de una ficha técnica de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los checkpoints corresponden a modelos de difusion de video, probablemente SkyReels-I2V y variantes Wan) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los tensores estan en bf16 segun el README) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LoRA checkpoints en bf16, videos mp4, logs de WandB; empaquetados en ZIP almacenado (`zip -0`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura del modelo base, pero por los nombres de los runs (`skyreels_i2v_base_eval`, `skyreels_wan_extended_a14b`) se infiere que el entrenamiento se aplico a modelos de difusion de video de la familia SkyReels-I2V y Wan. El proceso de fine-tuning utiliza GRPO (Generalized Reward Policy Optimization), una variante de RL de la familia PPO, aplicada a la generacion de video. Los directorios de cada run incluyen `checkpoints/` con pesos LoRA (current, old, EMA) y estado del optimizador, `permanent/epoch_N/` con snapshots periodicos, `evaluation_vbench_i2v/` con videos generados y puntuaciones de VBench-I2V, y `wandb/` con los logs del entrenamiento.

No se han publicado datos sobre el numero de tokens, la composicion del dataset de entrenamiento ni la funcion de recompensa. Los nombres de las variantes (`epg`, `pepg`, `grpo`, `epg-guidance5.0`, `bump_ram`, `diffusionnft`, `noise_split_dd08`, `flow_grpo`) sugieren diferentes configuraciones de recompensa o algoritmos, pero no hay documentacion tecnica adicional. El archivo esta almacenado sin compresion porque los tensores bf16 y los MP4 apenas comprimen (alrededor del 9%), lo que indica un enfoque orientado a facilitar el acceso a los datos en lugar de minimizar el tamano.

## Capacidades

- Generacion de video: los checkpoints estan destinados a mejorar la generacion de video a partir de imagenes (I2V), segun el nombre de los runs y la evaluacion con VBench-I2V.
- Reinforcement learning: el repositorio documenta el proceso de fine-tuning por RL, con multiples variantes de GRPO y configuraciones de recompensa.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no hay un modelo de inferencia empaquetado; las capacidades solo pueden evaluarse reconstruyendo el pipeline de entrenamiento y aplicando los pesos LoRA a un modelo base de difusion de video.

## Casos de uso

- Analisis de procesos de RL en generacion de video: investigadores pueden examinar los logs de WandB, los snapshots por epoch y las evaluaciones VBench-I2V para estudiar como varian las puntuaciones a lo largo del entrenamiento y comparar las distintas variantes de GRPO.
- Reanudacion de entrenamiento: los checkpoints incluyen el estado del optimizador y pesos LoRA en multiples versiones, lo que permite retomar un experimento concreto o continuar un run desde un epoch especifico.
- Extraccion de pesos LoRA para experimentacion: los checkpoints pueden servir como punto de partida para aplicar LoRA a un modelo base de difusion de video y probar configuraciones de recompensa alternativas.
- Auditoria de reproducibility: el repositorio incluye 24.864 archivos y 2.734 directorios, con snapshots periodicos y logs de evaluacion, lo que permite verificar la reproducibilidad de los experimentos.
- Comparacion de algoritmos de RL: los distintos runs (`skyreels_default` con epg/pepg/grpo, `skyreels_bump`, `skyreels_ram`, `skyreels_diffusionnft`) permiten comparar el efecto de diferentes funciones de recompensa o estrategias de exploracion sobre la calidad de la generacion de video.
- Formacion de datos para investigacion en interpretabilidad: los videos de evaluacion y las puntuaciones VBench-I2V pueden usarse como conjunto de datos auxiliar para analizar el comportamiento de los modelos de difusion bajo diferentes objetivos de recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene evaluaciones internas con VBench-I2V (videos y puntuaciones) dentro de cada run, pero las puntuaciones no se han extraido ni resumido en la ficha. No se aportan comparaciones con otros modelos ni numeros de referencia.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 99,8 GB; el archivo `skyreels_all.zip` pesa 54,37 GB y esta dividido en 6 partes de 10 GB.
- Descarga: se recomienda usar `huggingface-cli download` y verificar la integridad con `sha256sum` tras concatenar las partes.
- Para reanudar el entrenamiento o aplicar los LoRA: se necesitan GPUs de alta gama, tipicamente A100 o H100, dado que se trata de modelos de difusion de video de gran escala. No se especifica la VRAM minima.
- Para inferencia con los pesos extraidos: se requiere el modelo base correspondiente (SkyReels-I2V o Wan) y una GPU con capacidad suficiente segun el tamano de ese modelo. No hay datos de latencia ni throughput disponibles.
- Opciones de despliegue: no aplicable directamente; los artefactos no estan preparados para vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo desplegable, sino un conjunto de checkpoints de entrenamiento, por lo que no puede compararse directamente con otros modelos de generacion de video como SkyReels, Wan o modelos de difusion comerciales. La comparacion requeriria reconstruir el modelo base y evaluar los pesos LoRA extraidos, lo cual no esta documentado en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo listo para produccion; es un archivo de checkpoints de entrenamiento con fines de investigacion.
- Los enlaces simbolicos almacenados en el ZIP no se resuelven tras la extraccion: 590 de ellos apuntan a logs de debug de WandB en `~/.cache/wandb/` que no estan incluidos en el archivo.
- Los metadatos de WandB incluyen rutas absolutas, hostname y nombre de usuario del cluster de entrenamiento, lo que puede exponer informacion interna.
- No se documentan los datos de entrenamiento, la funcion de recompensa ni las metricas de calidad, lo que limita la interpretacion de los resultados.
- La licencia Apache 2.0 permite el uso comercial, pero no se garantiza que los modelos base subyacentes (SkyReels, Wan) tengan la misma licencia; es necesario revisar las licencias de cada modelo base antes de cualquier uso comercial.
- La fecha de creacion del repositorio (2026-09-03) y su tamano sugieren que es un volcado de artefactos de un cluster de entrenamiento, no un modelo mantenido activamente. No hay informacion sobre soporte, mantenimiento ni actualizaciones.
- Riesgo de alucinacion: no aplicable al repositorio en si, pero al aplicar los LoRA extraidos a un modelo base, la calidad de la generacion de video dependera del modelo base y de la configuracion de recompensa, sin garantias de rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/toony42/old_checkpoints
- Model card del repositorio: https://huggingface.co/toony42/old_checkpoints (README con instrucciones de descarga y ensamblaje)
