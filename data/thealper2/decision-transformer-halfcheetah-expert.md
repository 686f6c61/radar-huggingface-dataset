# thealper2/decision-transformer-halfcheetah-expert

## Resumen

Decision Transformer HalfCheetah Expert es un modelo de aprendizaje por refuerzo offline (offline RL) publicado por el usuario thealper2 en HuggingFace. Se trata de una implementación del Decision Transformer de Chen et al. (2021) entrenada sobre el conjunto `halfcheetah-expert-v2` de D4RL, alojado en el dataset `edbeeching/decision_transformer_gym_replay`, y evaluada de forma autoregresiva en el entorno `HalfCheetah-v5` de Gymnasium con MuJoCo 3.8.1.

A diferencia de un modelo de lenguaje, aquí la secuencia de entrada son tokens de retorno-al-objetivo (return-to-go), estado y acción, en el orden (R̂_t, s_t, a_t). El modelo es deliberadamente pequeño: 727.558 parámetros, con tamaño oculto 128, 3 capas y 1 cabeza de atención, lo que lo convierte en un artefacto reproducible en hardware de consumo (se entrenó en 18 minutos sobre una NVIDIA GeForce RTX 5060 Ti). Condiciona la generación de acciones al retorno objetivo deseado, lo que permite un control explícito del rendimiento esperado.

Su relevancia es principalmente metodológica y didáctica: sirve como referencia verificable de offline RL con formato de pesos safetensors y código de modelado en PyTorch puro, y demuestra que el condicionamiento por return-to-go produce mejoras medibles frente a un baseline de behavioral cloning (BC) entrenado sobre la misma partición. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto reciente y sin adopción comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo GPT con pre-LayerNorm; orden de tokens (R̂_t, s_t, a_t) |
| Parámetros totales | 727.558 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | K = 20 pasos temporales (60 tokens) |
| Tipos de cuantización | no disponible (sin versiones GGUF, INT8 ni INT4 publicadas; entrenado con autocast bfloat16) |
| Idiomas soportados | no aplica (modelo de control, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Tamaño oculto / capas / cabezas | 128 / 3 / 1 |
| Dropout | 0,1 |
| Información posicional | embedding aprendido de episodio y paso temporal (máximo 1000) |
| Dimensión de estado / acción | 17 (estado normalizado) / 6 (acción, salida tanh en [-1,0, 1,0]) |
| Función de pérdida | MSE sobre acciones en pasos no rellenados |
| Tamaño del repositorio | 0,0 GB |
| Pipeline declarado | reinforcement-learning |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estilo GPT con pre-LayerNorm que procesa secuencias de tripletas (retorno-al-objetivo, estado, acción). El retorno-al-objetivo se calcula como RTG_t = suma de recompensas desde t en adelante, dividido por 1000, y los estados se normalizan con la media y desviación típica de la partición de entrenamiento ((s − μ) / (σ + 1e-06), con μ y σ en `normalization.json`). Cada paso temporal de cada trayectoria de entrenamiento actúa como final de un segmento de K pasos; los segmentos más cortos que K (inicio del episodio) se rellenan por la izquierda y se enmascaran.

Los datos de entrenamiento proceden de la configuración `halfcheetah-expert-v2` del dataset `edbeeching/decision_transformer_gym_replay` (revisión `4441c97718b1f7e03d05f430226b57f658cc156d`): 1000 trayectorias de 1000 pasos, es decir, 1.000.000 de transiciones, sin estados terminales (truncamiento por límite de tiempo a los 1000 pasos) y con partición a nivel de trayectoria de 900 para entrenamiento y 100 para validación (semilla 42). Los retornos de la partición de entrenamiento van de un mínimo de 2045,8 a un máximo de 11252,0, con mediana 10699,4 y cuantiles 10328,3 (q05) y 10962,2 (q95).

El entrenamiento usó AdamW con learning rate 0,0001 y weight decay 0,0001, 10.000 pasos de warmup lineal seguidos de un decaimiento coseno, tamaño de lote 64, recorte de gradiente 0,25 y precisión bfloat16 con autocast. Se realizaron 8 épocas (112.504 pasos de optimizador) durante 18,0 minutos. El MSE final fue 0,02672 en entrenamiento y 0,02626 en validación, siendo el checkpoint con mejor MSE de validación el correspondiente a la época 8. No se documenta RLHF ni DPO (no aplican a este dominio), ni mecanismos de decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones de control continuo de 6 dimensiones para el entorno HalfCheetah de MuJoCo, con salida acotada por tanh a [-1,0, 1,0].
- Condicionamiento explícito por retorno objetivo: la acción generada depende del return-to-go, lo que permite solicitar políticas de distinto nivel de rendimiento (probado entre RTG 2046 y 12377).
- Inferencia autoregresiva en línea dentro de un bucle de evaluación de Gymnasium, manteniendo un historial de estados, acciones y retornos.
- Ejecución de política puramente offline: no requiere interacción con el entorno ni recompensas durante el entrenamiento.
- Manejo de relleno y enmascarado de segmentos al inicio del episodio mediante padding por la izquierda.
- No dispone de tool calling, function calling, capacidades de agente, multilingüismo, visión, audio ni modo de razonamiento; no es un modelo de lenguaje.

## Casos de uso

- Línea base reproducible en investigación de offline RL: permite comparar variantes como TD3+BC, CQL o IQL sobre `halfcheetah-expert-v2` con un protocolo de evaluación explícito (10 episodios, semillas 10000-10009, 1000 pasos) y pesos en safetensors.
- Estudio del efecto del return-to-go: el barrido de objetivos entre 2046 y 12377 documentado en la model card permite analizar cuánto del rendimiento proviene del condicionamiento y cuánto de la imitación de la política experta.
- Comparación directa con behavioral cloning: la propia model card incluye un baseline BC entrenado sobre la misma partición, lo que facilita aislar la contribución del transformer condicionado.
- Docencia de offline RL: con 727.558 parámetros y un entrenamiento de 18 minutos en una GPU de consumo, es viable reproducir el pipeline completo en una sesión práctica de laboratorio.
- Ablaciones de hiperparámetros: el script de modelado permite variar K, número de capas o tamaño oculto y medir el impacto en el retorno medio con un coste computacional muy bajo.
- Evaluación automatizada en CI: el tamaño del artefacto (0,0 GB) y la carga mediante `safetensors.torch.load_file` permiten integrar la evaluación en pipelines de integración continua con MuJoCo sin requisitos de GPU dedicada.
- Punto de partida para transferencia: sirve como política inicial o referencia para experimentos de ajuste en variantes de locomoción de MuJoCo, siempre que se reentrene o adapte al cambio de dimensión de estado y acción.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (marcados como no verificados, `verified: false`). Evaluación en Gymnasium `HalfCheetah-v5` con MuJoCo 3.8.1, 10 episodios por configuración, semillas 10000-10009, 1000 pasos por episodio y acciones recortadas a los límites del entorno. La puntuación normalizada D4RL usa los retornos de referencia de halfcheetah (-280,178953 y 12135,0).

| Modelo | Target | RTG objetivo | Retorno medio | Desv. típ. | D4RL normalizado | Longitud de episodio |
|---|---|---|---|---|---|---|
| DT | low | 2046 | 11058,2 | 38,1 | 91,3 | 1000 |
| DT | medium | 5626 | 11133,0 | 110,8 | 91,9 | 1000 |
| DT | dataset_median | 10699 | 11200,9 | 193,3 | 92,5 | 1000 |
| DT | high | 11252 | 11249,6 | 90,9 | 92,9 | 1000 |
| DT | above_max | 12377 | 11316,7 | 115,3 | 93,4 | 1000 |
| BC (baseline) | no aplica | no aplica | 11105,5 | 91,7 | 91,7 | 1000 |

No se han publicado en la información disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros), ya que no son aplicables a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB incluso con historial completo. Con 727.558 parámetros, los pesos ocupan aproximadamente 2,9 MB en FP32 y unos 1,5 MB en bfloat16/FP16.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el entrenamiento se realizó en una NVIDIA GeForce RTX 5060 Ti. No se requieren A100, H100 ni tarjetas de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en GPUs integradas o en CPU.
- Opciones de despliegue: carga directa con PyTorch y `safetensors`, más el módulo `modeling_decision_transformer.py` incluido en el repositorio. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles como métricas de inferencia. Como referencia de coste de cómputo, el entrenamiento completo (112.504 pasos de optimizador, 8 épocas) requirió 18,0 minutos en la GPU citada.
- Dependencias de ejecución: MuJoCo 3.8.1 y Gymnasium `HalfCheetah-v5` para la evaluación en entorno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Retorno medio (halfcheetah-expert-v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision Transformer (este modelo) | 727.558 | 20 pasos (60 tokens) | 11058,2-11316,7 según RTG objetivo | Apache 2.0 | HuggingFace, pesos safetensors |
| Baseline BC incluido en la model card | no disponible | no aplica (MLP estado → acción sin condicionamiento por retorno) | 11105,5 ± 91,7 | Apache 2.0 | incluido en el mismo repositorio |
| Decision Transformer original (Chen et al., 2021) | no disponible | no disponible | no disponible | no disponible | paper arXiv |
| CQL / IQL / TD3+BC sobre halfcheetah-expert-v2 | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La única comparación cuantitativa disponible en la información suministrada es frente al baseline BC, sobre el que el Decision Transformer obtiene una mejora modesta y dependiente del objetivo de retorno (11105,5 del BC frente a 11058,2 con objetivo bajo y 11316,7 con objetivo por encima del máximo del dataset).

## Limitaciones y advertencias

- Entrenado exclusivamente con datos expertos: los retornos de la partición de entrenamiento se concentran entre 10328 y 10962 (percentiles 5-95), por lo que cualquier objetivo de retorno (RTG) fuera de esa banda constituye extrapolación.
- Los resultados de evaluación están marcados como no verificados (`verified: false`) y provienen del propio autor; no han sido reproducidos de forma independiente.
- Desajuste de versiones en la recolección de datos: las trayectorias se recogieron con mujoco-py (MuJoCo 2.x) mientras que la evaluación se realiza en Gymnasium `HalfCheetah-v5` con MuJoCo 3.8.1, lo que puede introducir diferencias de dinámica. La model card describe esta limitación pero el texto disponible aparece truncado.
- Especialización estrecha: el modelo solo produce acciones para una tarea concreta con estado de 17 dimensiones y acción de 6 dimensiones; no es reutilizable directamente en otros entornos ni dominios.
- Sin capacidades de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso. No debe presentarse como un modelo conversacional.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser un artefacto derivado de datos D4RL conviene revisar las condiciones de uso del dataset original antes de un despliegue comercial (la información disponible no detalla condiciones adicionales).
- Contexto muy corto (20 pasos temporales) y una sola cabeza de atención, lo que limita la capacidad de modelar dependencias largas dentro del episodio.
- Repositorio con 0 descargas y 0 likes, sin señales de adopción ni mantenimiento por parte de la comunidad.
- La ficha de modelos no documenta análisis de sesgos ni de robustez frente a perturbaciones en el estado de entrada.

## Enlaces

- HuggingFace: https://huggingface.co/thealper2/decision-transformer-halfcheetah-expert
- Paper del Decision Transformer (Chen et al., 2021): https://arxiv.org/abs/2106.01345
- Dataset de entrenamiento: https://huggingface.co/datasets/edbeeching/decision_transformer_gym_replay
- Búsqueda web: los resultados devueltos no guardan relación con el modelo ni con aprendizaje por refuerzo, por lo que no se han podido añadir enlaces adicionales relevantes (papers, blogs, repos o demos) más allá de los anteriores.
