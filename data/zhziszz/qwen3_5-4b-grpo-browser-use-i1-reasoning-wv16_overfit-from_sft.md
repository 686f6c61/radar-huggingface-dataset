# ZHZisZZ/qwen3_5-4b.grpo.browser.use.i1.reasoning.wv16_overfit.from_sft

## Resumen

`ZHZisZZ/qwen3_5-4b.grpo.browser.use.i1.reasoning.wv16_overfit.from_sft` es un checkpoint de investigacion publicado por el usuario ZHZisZZ en HuggingFace. Es el resultado de un ajuste por aprendizaje por refuerzo con GRPO a partir del checkpoint SFT `qwen3_5-4b.sft.browser.use.i1.reasoning.webgym_gpt5_5_nogoto_wvclean`, que se apoya en `Qwen/Qwen3.5-4B`. El modelo esta especializado en actuar como agente web (browser-use) dentro del entorno WebVoyager, enmarcado en el ecosistema CUA-Lite.

El objetivo declarado no es obtener una buena puntuacion en un benchmark, sino servir de control positivo de memorizacion para un pipeline de RL: se entrena y se evalua sobre exactamente las mismas 16 tareas read-only de WebVoyager (train == eval), de modo que el modelo puede sobreajustarlas deliberadamente. La propiedad que el autor destaca a posteriori es que el cambio de comportamiento observado se transfiere a tareas y sitios web no vistos.

Su relevancia es metodologica: sugiere que un ciclo RL de pocas horas (unos 3,5 h para el snapshot `iter_9`) sobre un conjunto minimo de tareas puede modificar de forma transferible la conducta de un agente web de 4B. El repositorio ocupa 9,3 GB, usa la libreria transformers y pesos safetensors; no se documentan licencia, idiomas soportados ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; el modelo base declarado es `Qwen/Qwen3.5-4B`) |
| Parametros totales | ~4B segun la denominacion `qwen3_5-4b` y `MODEL_ID=Qwen/Qwen3.5-4B`; el valor exacto no se documenta |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint SFT `sft.browser.use.i1.reasoning.webgym_gpt5_5_nogoto_wvclean@20260917-b-wvclean-eval/epoch_2` y se ajusta con GRPO (`--advantage-estimator grpo`) sobre 16 tareas read-only de WebVoyager, seleccionadas del manifiesto fijo de 128 filas mediante `df.sample(n=16, random_state=42)`. Las 16 tareas son: `wolfram_alpha.36`, `amazon.10`, `bbc_news.8`, `booking.25`, `arxiv.27`, `apple.3`, `wolfram_alpha.6`, `arxiv.40`, `cambridge_dict.35`, `bbc_news.0`, `google_flights.33`, `wolfram_alpha.40`, `booking.2`, `booking.32`, `huggingface.6` y `google_search.12`.

La configuracion de entrenamiento usa `MODEL_ID=Qwen/Qwen3.5-4B`, `ROLLOUT_BATCH_SIZE=16`, `N_SAMPLES_PER_PROMPT=8`, `NUM_STEPS_PER_ROLLOUT=8`, `ROLLOUT_MAX_RESPONSE_LEN=2048`, `ROLLOUT_TEMPERATURE=1.0`, `LR=2e-6` con decaimiento constante, `LR_WARMUP_ITERS=50`, `clip-grad 1.0`, `kl-loss-coef 0.00`, `kl-coef 0.00`, `entropy-coef 0.00`, `DROP_ZERO_STD_GROUP=1` y `CUA_LITE_NORM_BY_TURNS=0`. De ahi se derivan `global_batch_size = 16` trayectorias por paso de optimizador, 8 pasos de optimizador por rollout y `train_iters = 320` pasos totales, por lo que el calentamiento de 50 pasos cubre el 15,6 % del schedule. La config de tarea fija `loop_detect: 5`, `enable_thinking: true`, resolucion 1280x720, `extra_tools: ["back", "response"]`, `image_max: 1`; el presupuesto de 15 turnos proviene de los metadatos de la tarea (`max_steps`, uniforme en las 643 tareas de evaluacion de WebVoyager). El entrenamiento corrio en 8xA100-80GB con TP=4, PP=1 y DP=2, a ~23 minutos por rollout, de modo que `iter_9` corresponde a unas 3,5 h de entrenamiento. Durante el entrenamiento se registraron entre 4 y 26 errores de entorno de cada 128 trayectorias por rollout.

## Capacidades

- Navegacion web de solo lectura como agente browser-use sobre el entorno WebVoyager (WebHarbor).
- Modo de razonamiento activado (`enable_thinking: true`) antes de emitir acciones.
- Uso de herramientas: ademas de las acciones del entorno, incorpora las herramientas `back` y `response`, y deteccion de bucles con `loop_detect: 5`.
- Procesamiento visual de capturas de pantalla a 1280x720 (`image_max: 1`), lo que implica tratamiento multimodal de la interfaz web.
- Ejecucion de episodios multi-paso de hasta 15 turnos.
- Generacion de trayectorias completas de interaccion (necesarias para el RL y para la evaluacion con `scripts/rollout.py`).
- No se documentan capacidades de generacion de codigo, matematicas, audio ni traduccion.

## Casos de uso

- Extraccion de datos de sitios de solo lectura: el agente puede consultar paginas publicas (arXiv, HuggingFace, BBC News) y devolver la informacion solicitada en un maximo de 15 turnos, sin realizar acciones de escritura.
- Monitorizacion de precios y disponibilidad: con tareas como `google_flights.33` o `booking.25` como referencia, puede rastrear vuelos o alojamiento y reportar resultados de forma repetible.
- Investigacion sobre agentes web: sirve como artefacto reproducible para estudiar como un ciclo de GRPO de pocas horas modifica las politicas de navegacion de un modelo de 4B.
- Control positivo en pipelines de RL: al estar sobreajustado a 16 tareas, permite verificar que la infraestructura de RL (servidor de entorno, juez VLM, generacion de rollouts) aprende la senal esperada antes de escalar a datasets mayores.
- Estudio de transferencia de comportamiento: entrenar en 16 tareas y evaluar en las 643 tareas de WebVoyager permite medir si el cambio de conducta generaliza a tareas y sitios no vistos.
- Generacion de trayectorias de imitacion: las rollouts a temperatura 1.0 (`group-size 4`) pueden reutilizarse como datos de partida para SFT o para destilacion sobre el checkpoint original.
- Evaluacion comparativa de checkpoints intermedios: al disponer de snapshots por rollout, permite analizar la evolucion de la politica a lo largo del entrenamiento.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Mejor evaluacion del run (rollout 12) | 0,9297 | Sobre el conjunto de 16 tareas, con train == eval; no se llego a guardar en disco por `SAVE_INTERVAL=10` |
| Snapshot publicado (`iter_9`) | rollout 9 | No es el pico del run |
| Metricas estandar (MMLU, HumanEval, GSM8K, etc.) | no disponible | No se han publicado resultados de benchmarks en la informacion disponible |
| Evaluacion en tareas/sitios no vistos | se reporta transferencia de comportamiento, sin cifras detalladas en la informacion disponible | El texto de la model card aparece truncado |

La metrica `return_mean` empleada es de tipo valid-only: `sum(valid_returns) / n_trajs_valid`, es decir, excluye las trayectorias que terminaron con error de entorno. Toda la evaluacion se repitio con `scripts/rollout.py` a temperatura 1.0 y `group-size 4` con concurrencia 32, porque la config publicada fija temperatura 0.0 y el autor senala que el scoring greedy no es comparable a una politica entrenada a 1.0.

## Requisitos de hardware

- Entrenamiento observado: 8xA100-80GB con TP=4, PP=1 y DP=2; ~23 minutos por rollout, dominado por la generacion de rollouts.
- VRAM de inferencia (estimacion a partir de ~4B parametros, no documentada por el autor): ~8-9 GB en bf16/fp16, ~5 GB en int8 y ~3 GB en int4, mas el coste de las imagenes a 1280x720.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como RTX 3090 o RTX 4090 con precision completa o cuantizacion; en tarjetas de 16 GB seria recomendable cuantizar.
- GPU profesionales: A100 40/80 GB, H100, L40S, A6000.
- Despliegue: la libreria declarada es transformers con pesos safetensors. No se documentan recetas para vLLM, SGLang, TGI, llama.cpp ni Ollama; el uso de llama.cpp u Ollama exigiria una conversion a GGUF no publicada.
- Para reproduccion o evaluacion se necesita un servidor de entorno (`scripts/serve_env.py`) con un pool precalentado de 32 instancias de `webharbor.webvoyager`, ademas de una clave `OPENAI_API_KEY` para el juez VLM.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GRPO wv16_overfit) | ~4B (segun denominacion) | no disponible | GRPO sobre 16 tareas WebVoyager | no disponible | HuggingFace, 0 descargas, 0 likes |
| `ZHZisZZ/qwen3_5-4b.sft.browser.use.i1.reasoning.webgym_gpt5_5_nogoto_wvclean` (base SFT) | ~4B | no disponible | SFT sobre WebGym, epoch 2 | no disponible | HuggingFace |
| `Qwen/Qwen3.5-4B` (modelo fundacional) | ~4B | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas variantes, ni de alternativas de terceros con las que contrastar dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sobreajustado por diseno a 16 tareas (`wv16_overfit`); el 0,9297 corresponde a un conjunto train == eval y no es comparable con cifras de benchmarks publicos.
- El checkpoint publicado (`iter_9`) no es el mejor del run: el pico (0,9297 en el rollout 12) nunca se guardo en disco por la politica de guardado.
- La licencia no esta declarada, por lo que el uso comercial es incierto y requiere consulta al autor.
- Solo realiza acciones de lectura sobre sitios web; no se documentan capacidades de escritura, envio de formularios ni transacciones.
- Presupuesto fijo de 15 turnos por episodio, heredado de los metadatos de la tarea; tareas que requieran mas pasos quedaran incompletas.
- El pipeline de entrenamiento depende de variables que no existen en el script original de `run_grpo.sh` (`LR_WARMUP_ITERS`, `DISTRIBUTED_TIMEOUT_MINUTES`, `CUA_LITE_NORM_BY_TURNS`, `KL_LOSS_COEF`); sin los parches equivalentes, la reproduccion falla silenciosamente o aborta.
- Se registraron entre 4 y 26 errores de entorno por cada 128 trayectorias en cada rollout, lo que afecta a la calidad de la senal de entrenamiento y a la interpretacion de las metricas.
- La evaluacion greedy (temperatura 0.0, valor por defecto de la config) no es comparable con la politica entrenada a temperatura 1.0; el autor advierte de que las tasas de exito colapsan a los extremos.
- No se documentan idiomas soportados ni comportamiento multilingue, ni sesgos conocidos.
- El riesgo de alucinacion en la extraccion de contenido web no se cuantifica en la informacion disponible.
- La reproducion exige un servidor de entorno con 32 instancias precalentadas y una clave de juez VLM, lo que anade dependencia de servicios externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZHZisZZ/qwen3_5-4b.grpo.browser.use.i1.reasoning.wv16_overfit.from_sft
- Modelo base (SFT): https://huggingface.co/ZHZisZZ/qwen3_5-4b.sft.browser.use.i1.reasoning.webgym_gpt5_5_nogoto_wvclean
- Modelo fundacional: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o repositorio adicional: no disponibles en la informacion proporcionada. Los resultados de la busqueda web devueltos corresponden a paginas corporativas de Microsoft y no guardan relacion con el modelo.
