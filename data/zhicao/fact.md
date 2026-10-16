# zhicao/FACT

## Resumen

FACT (Force–Action–Track) es un modelo fundacional multimodal de tipo vision-language-action (VLA) orientado a destreza robotica, publicado por el usuario zhicao en HuggingFace bajo licencia MIT. A diferencia de los VLA puramente visuales, FACT incorpora explicitamente la fuerza tactil como modalidad de primer nivel: combina tres vistas RGB, el estado del efector final en 62 dimensiones (EEF62) y las lecturas de 10 sensores tactiles F6 para predecir secuencias de accion. El objetivo declarado es la transferencia de destreza de humano a robot en tareas de contacto rico.

Tecnicamente, la politica es un transformer de atencion causal por bloques (block-causal) entrenado desde cero sobre datos en formato T-Rex de LeRobot v2.1. Genera chunks de accion delta-base de 16 pasos a 20 Hz junto con los 16 estados EEF62 siguientes, mediante un flujo en dos etapas: una etapa coarse (tau de 1 a 0,4) y una etapa de refinamiento exclusivamente de fuerza (tau de 0,4 a 0) que se refresca a 5 Hz con las lecturas tactiles. La percepcion visual y textual (VAE de Wan2.2 y encoder umT5-XXL) esta congelada y solo se usa para construir caches offline.

El modelo se distribuye en tres configuraciones: fact_small (109 M de parametros), fact_base (209 M) y fact_base_text (213 M, con condicionamiento de texto). Es relevante porque demuestra que un modelo de politica de escala relativamente pequena puede integrar fuerza tactil de alta frecuencia en un pipeline de inferencia estandar, y porque publica el codigo de entrenamiento completo (DDP multi-nodo, construccion de caches, evaluacion open-loop). El repositorio ocupa 0,9 GB y no registra descargas ni likes en la fecha de consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de atencion causal por bloques (block-causal) entrenado desde cero; flujo en dos etapas (coarse tau 1 a 0,4 y refinamiento force-only tau 0,4 a 0) con VQ tactil |
| Parametros totales | 109 M (fact_small), 209 M (fact_base), 213 M (fact_base_text) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica ventana de tokens tipo LLM; genera chunks de 16 pasos a 20 Hz (0,8 s) mas los 16 estados EEF62 siguientes; el refinamiento de fuerza se refresca a 5 Hz |
| Tipos de cuantizacion | bf16 en entrenamiento (etapa de fuerza en fp32, lr x0,3); caches de latentes en float16. No se documentan cuantizaciones tipo GGUF, AWQ o GPTQ para inferencia |
| Idiomas soportados | no disponible; el condicionamiento de texto (solo en fact_base_text) usa el encoder umT5-XXL, pero la model card no documenta idiomas ni evaluacion multilingue |
| Licencia | MIT; el subdirectorio `fact/perception/` deriva del release Wan2.2 y mantiene su propia licencia |
| Formato de pesos | no disponible para los pesos de la politica (checkpoints de PyTorch; el repo completo ocupa 0,9 GB). Los pesos de percepcion congelados son `.pth`: `Wan2.2_VAE.pth` y `models_t5_umt5-xxl-enc-bf16.pth` |

## Arquitectura y entrenamiento

FACT se compone de dos modulos principales implementados en `fact/model.py` y `fact/force.py`: `FactCoarseTransformer` y `FactPolicy`, que exponen las operaciones `forward`, `sample` y `refine_action_suffix`. El modelo predice chunks de accion de 16 pasos a 20 Hz en espacio delta-base EEF62 (62 dimensiones) junto con los 16 estados EEF62 posteriores. La generacion se plantea como un flujo en dos fases: una fase coarse que va de tau 1 a tau 0,4 y una fase de refinamiento exclusivamente de fuerza que va de tau 0,4 a 0 y se recalcula a 5 Hz a partir de 10 sensores tactiles F6 (60 valores de fuerza). El refinamiento usa cuantizacion vectorial tactil (`fact/tactile_vq.py`) y normalizacion basada en estadisticos q01/q99 (`fact/runtime_stats.py`), con utilidades de rejilla temporal a 20 Hz y rotaciones 6-D en `data_utils.py`.

Los datos de entrenamiento son episodios en formato T-Rex de LeRobot v2.1, con parquet por episodio que contienen `timestamp`, `observation.state_eef62` [62], `action.eef62_absolute` [62], `observation.tactile_force` [60] y tres vistas RGB (`head_left`, `left_wrist`, `right_wrist`), mas los metadatos habituales (`info.json`, `episodes.jsonl`, `tasks.jsonl`, `stats.json`, `relative_stats_dreamzero.json`, `modality.json`). El numero total de episodios o de tokens no se especifica. La percepcion es congelada y se usa solo offline: un VAE de imagen de Wan2.2 genera caches de latentes float16 con forma [N,48,10,20] por episodio, y un encoder umT5-XXL genera un cache de texto (`text_cache.npz`) cuando se activa el condicionamiento textual. El entrenamiento por defecto son 100 k pasos con batch global de 16x8, AdamW con lr 3e-4 y schedule coseno (warm-up de 2000 pasos), weight decay 0,01, grad clip 1,0, bf16 y checkpoint cada 10 k pasos, con reanudacion automatica. El repo incluye un protocolo de un solo episodio (`scripts/run_single_episode.sh`, 3000 pasos, batch 8, lr 2e-4, bf16) y soporte multi-nodo via `torch.distributed` con DDP.

## Capacidades

- **Prediccion de acciones roboticas**: genera chunks de 16 pasos a 20 Hz en espacio delta-base EEF62 (accion completa de brazo y mano).
- **Prediccion de estado futuro**: emite los 16 estados EEF62 siguientes junto al chunk de accion, lo que permite entrenamiento y evaluacion sobre prediccion de estado.
- **Retroalimentacion tactil de alta frecuencia**: refinamiento exclusivo de fuerza a partir de 10 sensores F6 (60 valores), refrescado a 5 Hz sobre los offsets 0/4/8/12 del chunk.
- **Percepcion multimodal**: tres vistas RGB (head_left, left_wrist, right_wrist) tokenizadas por el VAE de Wan2.2.
- **Condicionamiento de texto**: disponible en la configuracion `fact_base_text` (213 M) mediante el encoder umT5-XXL; el cache de texto se construye offline.
- **Modos de inferencia**: `FactPolicy.sample()` devuelve un chunk completo y `FactPolicy.refine_action_suffix()` re-ejecuta la etapa de fuerza con lecturas tactiles nuevas.
- **Reutilizacion de datos**: herramientas para fusionar varios datasets (`data_tools/build_merged_dataset.py`) y validar estructura y estadisticas (`scripts/check_dataset_ready.py`).
- **Tool calling / function calling**: no disponible.
- **Agentes y razonamiento multi-paso**: no aplica en el sentido de agentes de lenguaje; el modelo opera como politica de control reactiva por chunks.
- **Capacidades multilingues**: no disponible.
- **Capacidades especiales**: modo de razonamiento explicito, vision de alto nivel o audio no disponibles; la fuerza tactil es la capacidad diferencial.

## Casos de uso

- **Ensamblaje con contacto fisico**: el modelo puede insertar conectores, clavijas o componentes con tolerancias ajustadas usando la etapa de refinamiento de fuerza, que corrige la trayectoria coarse a 5 Hz con las lecturas de los 10 sensores F6.
- **Manipulacion de objetos fragiles**: tareas que requieren regular la fuerza de agarre (vasos, componentes electronicos). El refinamiento force-only permite ajustar la presion sin reejecutar la prediccion visual completa.
- **Investigacion en VLA tactil**: sirve como baseline reproducible de 109 a 213 M de parametros para comparar estrategias de fusion vision-tacto, con codigo de entrenamiento DDP y scripts de evaluacion incluidos.
- **Transferencia humano-a-robot**: el modelo esta disenado explicitamente para destreza humano-a-robot; los datos de demostracion en formato T-Rex/LeRobot v2.1 se pueden reutilizar para ajustar la politica a nuevas tareas de manipulacion.
- **Ajuste fino sobre hardware propio**: dado su tamano (109-213 M), es viable reentrenar o afinar la politica en un cluster pequeno o incluso en un unico nodo con varias GPU, partiendo de los configs `fact_small.json` y `fact_base.json`.
- **Evaluacion open-loop de checkpoints**: `scripts/eval_multi.py` calcula MSE normalizado de accion delta-base de 62 dimensiones (cascada, solo coarse, coarse-a-cero, brazo y mano) y MSE de estado futuro sobre rangos de episodios, util para validar politicas antes de desplegarlas en robot real.
- **Integracion en pipelines LeRobot**: al consumir y producir datos LeRobot v2.1 y proporcionar utilidades de fusion de datasets, encaja en flujos de recoleccion y curado de datos existentes en el ecosistema.
- **Teleoperacion asistida**: la prediccion de chunks de 0,8 s a 20 Hz y el refinamiento tactil a 5 Hz permiten usos de asistencia donde el operador aporta el objetivo de alto nivel y la politica ejecuta el control fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio incluye un directorio `results/` con tablas de benchmark de un solo episodio (`single_episode_benchmark.md`) y JSON de lineas base, pero la model card no reproduce cifras concretas (MMLU, HumanEval, GSM8K u otros) ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- **VRAM de inferencia (estimacion)**: la politica tiene 213 M de parametros como maximo, lo que supone aproximadamente 0,43 GB en bf16 y 0,85 GB en fp32. Sumando activaciones y estado del runtime, se estima un consumo por debajo de 2-3 GB, aunque la model card no publica cifras de VRAM.
- **GPU recomendadas**: cualquier GPU moderna con soporte bf16; se espera que quepa en GPU de consumo (RTX 3060 12 GB, RTX 4090, etc.). No se documentan requisitos oficiales.
- **Entrenamiento**: el lanzador de ejemplo usa 16 GPU (`NUM_GPUS=16 PER_DEVICE_BATCH=8`) con DDP bf16 y soporte multi-nodo. Un ajuste fino con `fact_small` o `fact_base` deberia ser viable con menos GPU reduciendo el batch global.
- **Percepcion congelada**: la construccion de caches requiere el VAE de Wan2.2-TI2V-5B y el encoder umT5-XXL (aproximadamente 5 B de parametros, es decir, del orden de 10-11 GB en bf16). Este coste solo se paga al generar `latents/episode_XXXXXX.npy` y `text_cache.npz`, no durante la inferencia de la politica.
- **Despliegue**: el repo se apoya en PyTorch (torch >= 2.8), `torch.distributed` para entrenamiento y los scripts `eval_multi.py` / `run_single_episode.sh` para evaluacion. No se documentan integraciones con vLLM, Ollama, llama.cpp o TGI, que en principio no aplican a este tipo de politica.
- **Latencia y throughput**: no disponibles. Como referencia funcional, el control se ejecuta a 20 Hz (chunks de 16 pasos) con refinamiento tactil a 5 Hz.

## Comparativa con modelos similares

No se dispone de resultados comparativos en la informacion proporcionada. La tabla siguiente recoge alternativas de la misma categoria (politicas VLA para manipulacion robotica) con los datos publicos mas habituales; los campos marcados como no disponibles no se pueden verificar con la informacion facilitada y los datos de terceros deben confirmarse en sus propias fichas.

| Modelo | Parametros | Modalidades | Salida / contexto | Licencia |
|---|---|---|---|---|
| FACT (base_text) | 213 M (109 M en la variante small) | 3 vistas RGB + estado EEF62 + fuerza tactil (10 sensores F6, 60 valores) + texto opcional | chunk de 16 pasos a 20 Hz + 16 estados futuros; refinamiento a 5 Hz | MIT (percepcion derivada de Wan2.2 con su propia licencia) |
| OpenVLA | aproximadamente 7 B | RGB + lenguaje | acciones discretizadas en tokens | no disponible |
| Octo | 27 M y 93 M (variantes publicadas) | RGB + estados de propriocepcion | transformer de politica con historial | no disponible |
| pi0 | no disponible | RGB + lenguaje | flujo de acciones | no disponible |

La diferencia principal de FACT frente a estos modelos es la incorporacion explicita de la fuerza tactil en una etapa de refinamiento separada y su tamano reducido, que lo hace entrenable con recursos moderados.

## Limitaciones y advertencias

- **Sin validacion de la comunidad**: el repositorio registra 0 descargas y 0 likes en la fecha de consulta. No hay evidencia externa de reproduccion de resultados.
- **Dependencia de hardware concreto**: el pipeline asume formato T-Rex con estado EEF62 y 10 sensores tactiles F6; incluye parametros de cinematica directa especificos (`north_ces_fk_params.json`, Sharpa FK), por lo que no es directamente portable a otros robots sin adaptacion.
- **Dependencia del formato de datos**: exige datasets LeRobot v2.1 en disposicion T-Rex de fuerza, con campos y metadatos muy concretos; desviarse del formato rompe el entrenamiento.
- **Riesgo de acciones fisicamente invalidas**: al ser una politica de control, los errores no se manifiestan como texto incorrecto sino como trayectorias o fuerzas inadecuadas, con riesgo de colision o dano en el robot y el entorno. No se documentan mecanismos de seguridad.
- **Sesgos y cobertura**: no se documenta la composicion del dataset de entrenamiento (numero de episodios, diversidad de tareas, distribucion de objetos), por lo que no se puede evaluar el sesgo ni la generalizacion.
- **Idioma**: no disponible. El condicionamiento de texto de `fact_base_text` usa umT5-XXL, pero no hay evaluacion multilingue ni garantia de que la senal textual este bien alineada fuera de la distribucion de entrenamiento.
- **Cuantizacion**: no se documentan formatos cuantizados para inferencia; el uso previsto es bf16/fp32 sobre PyTorch.
- **Licencia**: la politica es MIT, pero `fact/perception/` deriva del release Wan2.2 y mantiene su licencia original. Conviene revisar los terminos de Wan2.2 antes de un uso comercial de los componentes de percepcion.
- **Falta de benchmarks**: no hay cifras publicadas en la informacion disponible, lo que impide estimar con rigor la tasa de exito en tareas reales antes de desplegar.
- **Estado del proyecto**: por el contenido de la model card, parece un release de codigo de entrenamiento e investigacion mas que un modelo listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhicao/FACT
- La model card no incluye enlaces adicionales (ni a paper, blog, repositorio o demo). Los componentes citados pero sin URL en la informacion disponible son: el release Wan2.2-TI2V-5B (VAE y encoder umT5-XXL), el formato de datos T-Rex y LeRobot v2.1, los sensores tactiles F6 y la cinematica directa de Sharpa (`north_ces_fk_params.json`).
