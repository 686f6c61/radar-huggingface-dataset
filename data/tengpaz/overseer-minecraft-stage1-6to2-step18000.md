# Tengpaz/overseer-minecraft-stage1-6to2-step18000

## Resumen

`overseer-minecraft-stage1-6to2-step18000` es un checkpoint de un modelo generativo de síntesis de vistas noveles (novel-view synthesis, NVS) especializado en escenas de Minecraft. Lo publica el usuario Tengpaz en Hugging Face y forma parte de una familia de experimentos denominada "overseer", orientada a construir un world model capaz de predecir vistas de un agente a partir de observaciones auxiliares. El modelo resuelve un problema concreto: dado un conjunto de 6 vistas auxiliares con un campo de visión de aproximadamente 129 grados, generar 2 vistas objetivo correspondientes a los agentes Alpha y Bravo, ambas genuinamente noveles (es decir, ninguna de las dos coincide con las fuentes observadas).

Técnicamente se trata de un modelo de flow matching, no de un transformer autoregresivo de lenguaje, por lo que sus capacidades se limitan a la generación de imágenes condicionada por vistas. El checkpoint corresponde al paso 18000 de una ejecución completa sobre el split de entrenamiento, y según la model card fue el pico de PSNR de esa ejecución; sus pesos EMA sirvieron además como inicialización para la ejecución posterior 8->2. El repositorio ocupa 13,1 GB porque incluye el estado completo de entrenamiento (pesos, EMA, momentos del optimizador y scheduler), no solo los pesos de inferencia.

La relevancia de este checkpoint es fundamentalmente de investigación: documenta un punto de control reproducible de un world model para entornos tipo Minecraft, con un contrato de tarea explícito y métricas de validación publicadas. No está pensado como modelo de producción ni como modelo de propósito general, y su licencia es "other", sin términos comerciales especificados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow matching sobre un stack congelado de Stage-1 (DA3 + códec GAE); detalles internos de la red no disponibles |
| Parámetros totales | no disponible (el fichero de pesos "model" ocupa 3,7 GB, pero no se especifica el número de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; la condicionación son 6 vistas auxiliares) |
| Tipos de cuantización | no disponible (solo se publican pesos en formato `.pt`) |
| Idiomas soportados | no disponible (modelo de imágenes, no de texto) |
| Licencia | other |
| Formato de pesos | `.pt` (checkpoint de PyTorch con estado completo de entrenamiento) |

## Arquitectura y entrenamiento

El modelo se apoya en un stack de Stage-1 congelado compuesto por DA3 y el códec GAE, sobre el que se entrena un módulo de flow matching. La tarea es de síntesis de vistas noveles con un contrato explícito (`gae-independent-nvs-v1`): 6 vistas auxiliares con FOV de aproximadamente 129 grados como entrada, 2 vistas objetivo (Alpha y Bravo) con FOV de aproximadamente 70 grados, ambas noveles, a resolución de 378x672 píxeles y con 4 frames por episodio. El conjunto de entrenamiento consta de 38580 episodios y el de validación de 200.

El entrenamiento se realizó sobre 8 GPUs con `lr=1e-5`, `min_lr=1e-6`, `weight_decay=0.0` y `warmup_steps=500`, partiendo de la inicialización `flow_init_mc_step14000.pt`. El checkpoint del paso 18000 incluye pesos crudos (1227 tensores), pesos EMA con decay 0.9995 (940 tensores, los recomendados para inferencia), momentos de Adam, scheduler, estado de RNG y el contrato de entrenamiento, lo que permite reanudar la ejecución de forma bit-exacta siempre que se use la revisión de código correspondiente (el `--resume` verifica el sha256 de cada `.py` bajo `easylab/`). No se especifica en la información disponible el número de tokens ni la composición detallada del dataset más allá del recuento de episodios.

## Capacidades

- Generación de vistas noveles condicionada por 6 vistas auxiliares, con 2 vistas objetivo por muestra.
- Modelado de world model para entornos Minecraft: predice lo que verían los agentes Alpha y Bravo desde posiciones no observadas.
- Generación de imágenes a resolución 378x672 con 4 frames por episodio.
- Muestreo con flow matching (16 pasos de muestreo en la validación publicada).
- No soporta tool calling, function calling ni razonamiento multi-step en el sentido de los LLM.
- No dispone de capacidades multilingües ni de procesamiento de texto.
- No se documentan modos especiales como thinking mode, visión general o audio.

## Casos de uso

- Investigación en world models para videojuegos: el checkpoint sirve como punto de partida reproducible para experimentos de predicción de vistas en Minecraft, con un contrato de tarea y métricas de validación documentadas que permiten comparar variantes.
- Inicialización de ejecuciones posteriores: los pesos EMA de este paso se usaron para sembrar la ejecución 8->2 (`overseer-minecraft-stage1-8to2-step2000`), por lo que es útil como base para fine-tuning con más vistas auxiliares.
- Reproducción de experimentos: al incluir el estado completo (optimizador, scheduler, RNG y contrato), permite reanudar el entrenamiento de forma bit-exacta y auditar la evolución del modelo en el paso 18000.
- Evaluación de técnicas de flow matching en NVS: útil para estudiar el comportamiento de la generación con 16 pasos de muestreo y comparar PSNR/SSIM frente a otras configuraciones del mismo stack.
- Estudio de generalización a vistas no observadas: al ser ambas vistas objetivo noveles, el checkpoint es adecuado para medir la capacidad del modelo de extrapolar geometría y apariencia sin ramas de objetivo observado que inflen las métricas.
- Docencia y divulgación sobre world models: el contrato de tarea explícito y las métricas publicadas facilitan explicar el pipeline completo (vistas auxiliares, códec, flow matching y evaluación) con un caso concreto.

## Benchmarks y rendimiento

Métricas de validación en el paso 18000, medidas sobre 200 pares `(episode, frame)` retenidos (400 vistas objetivo) con 16 pasos de muestreo:

| Métrica | Global | Alpha | Bravo |
|---|---|---|---|
| PSNR | 15,156 | 14,275 | 16,036 |
| SSIM | 0,5971 | 0,5885 | 0,6057 |

El autor indica que estos valores quedan por debajo de las ejecuciones sobre DL3DV por construcción, ya que ambas vistas objetivo son noveles y no existe una rama de objetivo observado que infle la media. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos EMA ocupan 3,1 GB y los pesos crudos 3,7 GB, por lo que la inferencia requiere al menos esos volúmenes más el overhead del stack Stage-1 (DA3 + códec GAE) y de las activaciones.
- GPU recomendadas: no disponible; el entrenamiento se realizó sobre 8 GPUs, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño de los pesos EMA (3,1 GB) sugiere que podría caber en GPUs con 8-12 GB de VRAM, pero el stack completo y las activaciones no están documentados.
- Opciones de despliegue: carga directa del checkpoint `.pt` en PyTorch, preferiblemente con `mmap=True`; extracción previa de los pesos EMA mediante `extract_flow_init.py` y apuntando `system.params.flow_checkpoint` al fichero resultante. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Objetivos | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| overseer-minecraft-stage1-6to2-step18000 | Flow matching NVS | 6 vistas auxiliares (~129° FOV) | 2 vistas noveles (~70° FOV) | 378x672 | other | Hugging Face |
| overseer-minecraft-stage1-8to2-step2000 | Flow matching NVS | 8 vistas auxiliares | 2 vistas noveles | no disponible | other | Hugging Face |
| Ejecuciones DL3DV del mismo stack | Flow matching NVS | no disponible | no disponible | no disponible | other | no disponible |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada; la comparación se limita a la configuración de la tarea y a la disponibilidad. No se conocen alternativas externas de la misma categoría con datos verificables en esta ficha.

## Limitaciones y advertencias

- Modelo de investigación: no es un modelo de propósito general ni un LLM; no procesa texto ni admite tool calling.
- Licencia "other": no se especifican términos de uso comercial en la información disponible, por lo que debe consultarse al autor antes de cualquier uso productivo.
- Dominio restringido: entrenado exclusivamente en escenas de Minecraft; no se garantiza generalización a otros entornos.
- Métricas moderadas: PSNR global de 15,156 y SSIM de 0,5971 en validación, valores que reflejan la dificultad de predecir vistas completamente noveles.
- Riesgo de alucinación visual: como modelo generativo, puede producir geometría o texturas plausibles pero incorrectas en regiones no observadas.
- Dependencia del código: la reanudación exacta requiere la revisión de código correspondiente (rama `wyz/3dlatent-minecraft-nvs` del repositorio `tri-world-model`), ya que el contrato verifica el sha256 de los ficheros `.py`.
- Checkpoint pesado: 13,1 GB por incluir el estado completo de entrenamiento; para inferencia conviene extraer solo los pesos EMA (3,1 GB).
- Sin datos de sesgos, latencia ni throughput publicados; no se documentan limitaciones idiomáticas por no ser un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tengpaz/overseer-minecraft-stage1-6to2-step18000
- Checkpoint posterior 8->2: https://huggingface.co/Tengpaz/overseer-minecraft-stage1-8to2-step2000
- Repositorio de código: rama `wyz/3dlatent-minecraft-nvs` del repositorio `tri-world-model`, bajo `projects/minecraft_nvs/` (no se proporciona URL directa en la información disponible).
