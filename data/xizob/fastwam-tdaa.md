# XizoB/FastWAM-TDAA

## Resumen

FastWAM-TDAA es un repositorio de investigación en robótica publicado por el usuario XizoB en Hugging Face. No es un modelo de lenguaje, sino un conjunto de pesos de política de imitación para manipulación robótica, junto con el códec TDAA, resultados de evaluación sin procesar y 4.000 vídeos de simulación. El material se apoya en RoboTwin como entorno de evaluación y en FastWAM como política base, e incorpora un códec de acciones preentrenado (TDAA `version3_bin24`) que comprime bloques de acción de forma `[32,14]` a latentes `[8,16]`.

La innovación principal es mover el aprendizaje de la política al espacio latente de acciones: el modelo hace *flow matching* sobre los latentes de 8 tokens y después decodifica a 32 pasos de acción articular absoluta. El decodificador utiliza un vector de tarea y una fase derivada de características DCT24 del historial de acciones ya ejecutadas, que se reinicia en cada episodio. El resultado declarado es una mejora en la tasa de éxito combinada en RoboTwin del 12,30 % al 23,55 % al congelar el códec TDAA, aunque sin mediciones de aceleración extremo a extremo.

El repositorio es relevante ahora porque documenta de forma poco habitual un experimento de compresión de representación de acciones con resultados de simulador a escala (2.000 episodios por modelo, 10 tareas, semilla fija) y publica los pesos, el códec y los vídeos. Se publica bajo etiqueta de idioma chino, con 0 descargas y 0 *likes*, sin licencia especificada, y el propio autor advierte de que se trata de un experimento de una sola semilla sin análisis de ablación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de imitación FastWAM con *flow matching* en espacio latente de acciones, más códec TDAA (autoencoder entrenado 80.000 pasos) que comprime `[32,14]` a `[8,16]`; decodificador con vector de tarea y fase DCT24 del historial de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como en un LLM; horizonte de acción de 32 pasos (24 pasos de replanificación en la evaluación), ventana de vídeo de 9 fotogramas |
| Tipos de cuantizacion | no disponible; el códec TDAA se publica en FP32 y el entrenamiento se realizó en BF16 |
| Idiomas soportados | chino (zh), según la etiqueta de idioma del repositorio |
| Licencia | no disponible; el README remite a una sección de «fuentes y licencias» en GitHub, sin licencia declarada en la ficha |
| Formato de pesos | PyTorch `.pt` (`step_002725.pt`), más JSON de configuración, metadatos, estadísticas de conjunto de datos y *embeddings* de tareas |
| Desarrollador | XizoB |
| Pipeline declarado | robotics |
| Tamano del repositorio | 24,4 GB (incluye 4.000 vídeos de evaluación) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion y actualizacion | 18 de septiembre de 2026 (ambas) |

## Arquitectura y entrenamiento

La política sigue el esquema FastWAM: parte de componentes base tipo Wan (VAE, T5 y *tokenizer*, que el usuario debe preparar aparte) y consume vídeo de tres cámaras concatenadas (9 fotogramas, 384×320, intervalo entre fotogramas de 4) para predecir acciones. En la variante TDAA, el códec preentrenado `version3_bin24` transforma el bloque de acción de forma `[32,14]` en un latente `[8,16]`; la política aplica *flow matching* en ese espacio latente y un decodificador genera los 32 pasos de acción articular absoluta. El decodificador usa un vector de tarea y una fase calculada a partir de las características DCT24 del historial de acciones ejecutadas, con reinicio del historial en cada episodio. Los pesos de acción pasan de 32 a 8 tokens, lo que el autor describe como compresión de la representación de acción, no como una aceleración medida: no se realizaron mediciones de velocidad extremo a extremo.

El entrenamiento se hizo con 8 GPU, batch por tarjeta de 16 y acumulación de gradientes 1 (batch global efectivo de 128), optimizador AdamW con betas `(0,9; 0,95)` y epsilon `1e-8`, learning rate máximo `1e-4`, weight decay `1e-2`, calentamiento lineal del 5 % de los pasos (136 pasos) seguido de decaimiento coseno hasta `1e-6`, recorte de gradiente con norma máxima 1,0 y semilla 42. Se usó precisión BF16 con DeepSpeed ZeRO-1 sin *offload* a CPU, 8 *workers* de DataLoader por proceso, 5 épocas y 2.725 pasos de optimizador (derivados de `ceil(69.732 / 128) × 5`). El conjunto de entrenamiento consta de 10 tareas × 50 trayectorias, 69.732 ventanas completas, con horizonte de acción 32 y dimensión de acción bruta 14; los coeficientes de pérdida de *flow* de vídeo y de acción son 1,0 y 1,0. La monitorización durante el entrenamiento usa el episodio 0 del propio conjunto de entrenamiento, no un conjunto de validación independiente. No se publica el estado completo de optimizador y planificador.

| Diferencia entre modos | Baseline | TDAA Frozen | TDAA Frozen=False (valores por defecto de la configuración) |
|---|---|---|---|
| Forma de predicción de acción | `[32,14]` | latente `[8,16]` | latente `[8,16]` |
| Códec TDAA | no se carga | FP32, totalmente congelado | FP32, entrenado junto con la política |
| Coeficientes extra de reconstrucción / MSE de progreso | no aplica | no se calculan | 1,0 / 0,1 |
| Learning rate del códec | no aplica | no se actualiza | igual que la política, con el mismo planificador |

## Capacidades

- Generación de acciones de manipulación robótica: produce 32 pasos de acción articular absoluta de 14 dimensiones a partir de observación visual multi-cámara.
- Compresión de representación de acciones: el códec TDAA reduce bloques `[32,14]` a latentes `[8,16]`.
- Evaluación de políticas en simulador: integración con RoboTwin para 10 tareas de manipulación con variantes `clean` y `random`.
- Seguimiento de instrucciones en chino: la evaluación usa `instruction_type=unseen`, es decir, tipos de instrucción no vistos durante el entrenamiento.
- Condicionamiento por tarea: el decodificador incorpora un vector de tarea y una fase DCT24 derivada del historial de acciones ejecutadas.
- No se documenta *tool calling*, *function calling*, capacidades de agente multi-paso, visión general fuera del bucle de control, audio ni modo de razonamiento explícito.
- No se documentan capacidades multilingües más allá de la etiqueta `zh`.

## Casos de uso

- Evaluación reproducible de políticas de imitación en RoboTwin: el repositorio aporta pesos, configuraciones de simulación y 2.000 episodios por modelo, de modo que un grupo de investigación puede replicar la comparativa entre baseline y TDAA Frozen sin reentrenar.
- Investigación en compresión de acciones para modelos visión-lenguaje-acción: el códec TDAA se puede reutilizar como *tokenizer* de acciones dentro de otras políticas que necesiten reducir la longitud de la secuencia de acción de 32 a 8 tokens.
- Estudio de representaciones latentes de acción: los ficheros `codec.pt`, `config.json`, `dataset_statistics.json` y `task_embeddings.json` permiten analizar la estructura del espacio latente y su relación con las tareas de RoboTwin.
- Aprendizaje por imitación con presupuesto reducido de datos: el régimen entrenado (10 tareas × 50 trayectorias, 69.732 ventanas) sirve como referencia para experimentos de pocos datos por tarea en manipulación.
- Pruebas de transferencia sim-a-real: la política podría tomarse como punto de partida para *fine-tuning* con datos reales, aunque el autor no aporta ninguna validación fuera del simulador.
- Comparación de estrategias de congelación frente a entrenamiento conjunto: la configuración `TDAA=true frozen=false` está implementada en el código y define coeficientes de pérdida de reconstrucción y predicción de progreso (1,0 y 0,1), lo que permite probar ese modo aunque no haya pesos publicados.
- Auditoría de robustez ante variaciones del entorno: la división entre `clean` y `random` en RoboTwin permite medir la degradación del modelo ante condiciones aleatorizadas, útil para decidir umbrales de aceptación antes de un despliegue físico.
- Docencia y divulgación en robótica: los 4.000 vídeos de evaluación y el desglose por tarea permiten ilustrar el comportamiento de una política de imitación y sus fallos concretos por tarea.

## Benchmarks y rendimiento

La evaluación publicada es `robotwin_eval_20260917_sh_uv`: 10 tareas, 100 intentos por tarea en `clean` y 100 en `random`, 2.000 intentos por modelo, semilla 42, `instruction_type=unseen`, horizonte de acción de 32 pasos, 24 pasos de replanificación y 10 pasos de desintoxicación (*denoising*).

| Modelo | Clean | Random | Exitos / total | Tasa combinada |
|---|---:|---:|---:|---:|
| FastWAM baseline | 20,6 % | 4,0 % | 246 / 2000 | 12,30 % |
| TDAA Frozen | 40,8 % | 6,3 % | 471 / 2000 | 23,55 % |

La variante TDAA Frozen mejora en 20,2 puntos porcentuales en `clean`, 2,3 puntos en `random` y 11,25 puntos en la tasa combinada. El autor advierte de que `official` es solo el nombre del directorio del grupo de control reentrenado y que estas cifras no son las del artículo oficial de FastWAM. También señala variabilidad por tarea: en `clean`, `press_stapler` baja del 33 % al 3 % y `open_laptop` del 45 % al 43 %. No hay media ni varianza sobre varias semillas de entrenamiento y no se aísla la contribución de la representación de acción, el condicionamiento por historial, el vector de tarea ni la normalización, por lo que no puede interpretarse como un estudio de ablación.

No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con políticas externas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras de memoria por GPU ni el tamaño individual de los puntos de control.
- Entrenamiento declarado: 8 GPU, batch por tarjeta de 16, acumulación de gradientes 1, batch global efectivo 128, precisión BF16 y DeepSpeed ZeRO-1 sin *offload* a CPU. No se especifica el modelo concreto de GPU.
- GPU recomendadas: no disponibles. No hay indicación de compatibilidad con A100, H100, RTX 4090 ni otras tarjetas.
- Viabilidad en GPU de consumo: no disponible. No se documentan requisitos mínimos ni pruebas en hardware de consumo.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, y no se publican pesos GGUF. La ejecución se realiza mediante los scripts del repositorio de GitHub, con descarga y verificación SHA-256 (`python scripts/download_models.py --model both`).
- Dependencias adicionales: los modelos base Wan VAE/T5/tokenizer, los datos de entrenamiento y los activos del simulador RoboTwin deben prepararse por separado; no están incluidos.
- Latencia y throughput: no medidos. El autor afirma explícitamente que no se realizaron mediciones de aceleración extremo a extremo pese a reducir de 32 a 8 tokens de acción.
- Almacenamiento: el repositorio ocupa 24,4 GB e incluye 4.000 vídeos de evaluación, además de los dos puntos de control y los activos del códec.

## Comparativa con modelos similares

No se dispone de comparaciones con modelos externos en la información proporcionada. La única comparación cuantitativa publicada es interna, entre la política base y la variante con el códec congelado:

| Aspecto | FastWAM baseline | TDAA Frozen | TDAA Frozen=False |
|---|---|---|---|
| Representación de acción | `[32,14]` | latente `[8,16]` | latente `[8,16]` |
| Códec TDAA | no se carga | congelado en FP32 | entrenado junto con la política |
| Tasa de éxito combinada en RoboTwin | 12,30 % (246/2000) | 23,55 % (471/2000) | no evaluada |
| Pesos publicados | sí (`step_002725.pt`) | sí (`step_002725.pt`) | no |
| Licencia | no disponible | no disponible | no disponible |

No se aportan alternativas de la misma categoría (otras políticas de manipulación o modelos visión-lenguaje-acción) con parámetros, contexto o licencia comparables, por lo que la comparativa con terceros queda como no disponible.

## Limitaciones y advertencias

- Los resultados proceden de una única semilla y de un único entrenamiento por configuración; no hay media ni varianza, por lo que las diferencias observadas no pueden tratarse como concluyentes.
- Algunas tareas empeoran con TDAA Frozen: en `clean`, `press_stapler` cae del 33 % al 3 % y `open_laptop` del 45 % al 43 %. La tasa en `random` sigue siendo muy baja (6,3 %).
- No se aísla la contribución de cada componente (representación de acción, condicionamiento por historial, vector de tarea, normalización), así que no hay conclusiones de ablación.
- El modo de entrenamiento conjunto del códec (`frozen=false`) está implementado en el código pero no tiene pesos ni resultados de éxito publicados.
- La monitorización durante el entrenamiento usa el episodio 0 del conjunto de entrenamiento, no un conjunto de validación independiente.
- No se mide ninguna ganancia de velocidad: la reducción de 32 a 8 tokens de acción es solo de representación, sin cifras de latencia o *throughput*.
- La licencia no está declarada en la ficha de Hugging Face; antes de cualquier uso comercial hay que consultar la sección de fuentes y licencias del repositorio de GitHub. No puede asumirse uso comercial libre.
- El modelo solo está etiquetado para chino; no hay evidencia de comportamiento con instrucciones en otros idiomas.
- Riesgo de alucinación en el sentido de acciones no válidas o inseguras: no se documentan filtros de seguridad, límites articulares ni validación de colisiones.
- Los pesos no incluyen el estado completo de optimizador y planificador, lo que dificulta reanudar el entrenamiento exactamente donde se dejó.
- Las dependencias (modelos base Wan VAE/T5/tokenizer, datos de entrenamiento y activos de RoboTwin) no están incluidas y deben prepararse aparte, lo que puede impedir la reproducción completa.
- El repositorio es de gran tamaño (24,4 GB) por los 4.000 vídeos incluidos; conviene descargar solo los activos necesarios con `--assets-only`.
- Sin descargas ni *likes* y sin validación externa conocida: debe tratarse como material de investigación sin madurez de producción.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/XizoB/FastWAM-TDAA
- Repositorio de código en GitHub: https://github.com/XizoB/FastWAM-TDAA
- README de método y reproducción: https://github.com/XizoB/FastWAM-TDAA/blob/main/README.md
- Tabla completa de resultados: https://huggingface.co/XizoB/FastWAM-TDAA/blob/main/work_dirs/robotwin_eval_20260917_sh_uv/SUMMARY.md
- Pesos del baseline FastWAM: https://huggingface.co/XizoB/FastWAM-TDAA/resolve/main/work_dirs/hope_fastwam_official_20260916_154047_4105/checkpoints/weights/step_002725.pt
- Pesos de TDAA Frozen: https://huggingface.co/XizoB/FastWAM-TDAA/resolve/main/work_dirs/hope_fastwam_tdaa_frozen_20260916_155710_4112/checkpoints/weights/step_002725.pt
- Códec TDAA y configuración: https://huggingface.co/XizoB/FastWAM-TDAA/tree/main/assets/tdaa_robotwin
- Estadísticas de normalización del baseline: https://huggingface.co/XizoB/FastWAM-TDAA/blob/main/assets/robotwin_legacy_policy10/dataset_stats.json
- Directorio completo de evaluación y vídeos: https://huggingface.co/XizoB/FastWAM-TDAA/tree/main/work_dirs/robotwin_eval_20260917_sh_uv
- Evaluación del baseline: https://huggingface.co/XizoB/FastWAM-TDAA/tree/main/work_dirs/robotwin_eval_20260917_sh_uv/official
- Evaluación de TDAA Frozen: https://huggingface.co/XizoB/FastWAM-TDAA/tree/main/work_dirs/robotwin_eval_20260917_sh_uv/tdaa_frozen
- Documentación de hiperparámetros de entrenamiento: https://github.com/XizoB/FastWAM-TDAA/blob/main/docs/training_hyperparameters.md
- Registro de fuentes del códec TDAA: https://github.com/XizoB/FastWAM-TDAA/blob/main/src/fastwam/tdaa/SOURCE.md
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos trataban sobre procedimientos de nacionalidad francesa y no guardan relación con FastWAM-TDAA. No se han encontrado artículos, *papers* ni demostraciones adicionales sobre el modelo.
