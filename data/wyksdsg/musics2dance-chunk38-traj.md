# wyksdsg/musics2dance-chunk38-traj

## Resumen

Musics2Dance es un sistema de generacion de movimiento (danza) a partir de musica para el robot humanoide Unitree G1, desarrollado por el usuario wyksdsg. El repositorio `wyksdsg/musics2dance-chunk38-traj` publica dos variantes de generador seleccionadas como lineas principales del proyecto: Trajectory-AR (autoregresiva discreta) y Trajectory-Diff (difusion categorica dentro del chunk). Ambas comparten codec, estadisticas residuales y se entrenaron sobre el dataset FineDance, generando trayectorias corporales de 38 dimensiones a 30 fps.

El modelo no es un LLM ni un modelo de lenguaje: es un generador condicionado por audio que produce secuencias de movimiento nativas para el robot G1 (pelvis SO(3) completa mas 29 articulaciones). Trabaja con chunks de 16 fotogramas (8 tokens) a 30 Hz, retiene 64 tokens de historial y emplea un muestreo por defecto de 10 NFE (number of function evaluations, es decir, 10 pasos de muestreo). La representacion "RF" en el model card significa *resampled history*, no rectified flow, un matiz relevante para evitar confusiones.

El lanzamiento es relevante porque publica pesos de inferencia en precision completa, el codec compartido, el estimador de fiabilidad musical congelado y los checkpoints de evaluacion MMR14500, permitiendo reproducir el pipeline sin reentrenar. El repositorio ocupa 37,1 GB e incluye ademas el snapshot de codigo ejecutable, aunque el repositorio de codigo original (lbtwyk/Musics2Dance) permanece privado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos variantes: Trajectory-AR (autoregresiva discreta) y Trajectory-Diff (difusion categorica within-chunk); ambas con historial remuestreado |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 64 tokens de historial (chunks de 16 fotogramas / 8 tokens) |
| Tipos de cuantizacion | no disponible (se publican pesos en precision completa) |
| Idiomas soportados | no disponible (modelo de audio a movimiento, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (final.pt, recovery.pt, warmup-recovery.pt, statistics.pt, calibration.pt) |
| Representacion corporal | 38 dimensiones: pelvis SO(3) completa + 29 articulaciones; root en xyz mundo mas heading cos/sin |
| Frecuencia | 30 fps |
| Dataset de referencia | FineDance (poblacion congelada train/test 183/18) |
| NFE por defecto | 10 |
| Tamano del repositorio | 37,1 GB |

## Arquitectura y entrenamiento

El sistema se compone de un codec compartido y dos generadores alternativos. El codec es un "heading-repaired native38 chunk D512+C16" entrenado durante 100000 updates con batch 64, que discretiza el movimiento en tokens (D) mas un componente residual (C). El root y el componente C se generan mediante DDIM sobre la trayectoria, y C se rebasa al D muestreado. Sobre esta representacion, Trajectory-AR modela el token D de forma autoregresiva discreta, mientras que Trajectory-Diff aplica difusion categorica dentro de cada chunk. Ambos commiten 16 fotogramas (8 tokens) a 30 Hz y conservan 64 tokens de historial mediante concatenacion remuestreada.

El entrenamiento parte de un padre comun TF3125 (teacher forcing) y se bifurca hacia RF (resampled history) hasta 12500, con semilla 1234. La poblacion congelada de entrenamiento y test es 183/18, y los generadores usan 48 grupos fuente por 8 objetivos. La implementacion completa esta en `train_g1_chunk_root.py`; AR usa el config `fd_chunk_root_dc_heading_repair.json` y Diff usa `fd_chunk_trajectory_diffusion.json`. El audio se procesa mediante MRT2 Small, SpectroStream (encoder y cuantizador) y MusicCoCa, con una politica causal de musica nativa (Future14/K8, Past107 observado). El sistema aplica un estimador de fiabilidad musical congelado, sin refitting para nuevas pistas. No se especifica en la informacion disponible si hubo RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Generacion de movimiento de danza a partir de musica, en formato de trayectoria nativa de 38 dimensiones para el robot Unitree G1.
- Dos modos de generacion seleccionables por ruta: `--route ar` (autoregresiva, considerada por el autor como la mas "viva") y `--route diff` (difusion, considerada la mas "estable" y con menos errores visibles).
- Control de longitud de generacion mediante el parametro `--frames` (por ejemplo, 1800 fotogramas) y semilla reproducible con `--seed`.
- Muestreo configurable mediante NFE (10 por defecto) y DDIM en root/C.
- Procesamiento de audio nuevo: construccion de cache musical causal con `build_g1_native_music.py` a partir de ficheros de audio convertidos a `music-sources.json`.
- Soporte de cutoffs para pistas largas (por ejemplo `[16,32,...,1792]` para 60 segundos), que deben cubrir cada decision de 16 fotogramas.
- Salida sin suavizado ni postprocesado: el fichero `motion.pt` contiene `[1,T,38]` en yaw-anchor absoluto, fps 30, tokens discretos/residuales/root y metadatos de timing.
- No se documentan capacidades de tool calling, agentes, vision, matematicas ni generacion de texto, dado que no es un modelo de lenguaje.

## Casos de uso

- Coreografia automatizada para robots humanoides: el sistema genera trayectorias de danza sincronizadas con una pista de audio concreta, exportables como `motion.pt` y reproducibles en el Unitree G1 a 30 fps, lo que permite crear espectaculos o demostraciones sin coreografo manual.
- Investigacion en generacion de movimiento condicionada por musica: el par AR/Diff permite comparar en un mismo codec el comportamiento de un modelo autoregresivo frente a uno de difusion categorica, aislando la variable arquitectonica.
- Evaluacion comparativa de codecs de movimiento: al publicar `codec/final.pt`, `codec/recovery.pt` y `codec/statistics.pt`, se puede reproducir el codec compartido y usarlo como base para nuevos experimentos de generacion.
- Reproduccion cientifica: los ficheros `recovery.pt` y `warmup-recovery.pt` permiten reanudar exactamente el estado del optimizador, orden de fuentes y estado RNG, lo que facilita replicar el pipeline TF3125 -> RF12500.
- Prototipado de politicas musicales en robotica: el estimador de fiabilidad musical congelado (`inference/calibration.pt`) se aplica a pistas nuevas sin refitting, util para filtrar segmentos musicales poco fiables antes de generar movimiento.
- Benchmarking de danza robotica: los tres checkpoints en `evaluation/mmr/` permiten ejecutar la evaluacion MMR14500 y comparar rutas AR y Diff con una metrica comun.
- Integracion en pipelines de audio: `build_g1_native_music.py` acepta un JSON de fuentes con audio, `kind: "song"` y cutoffs, de modo que se puede preprocesar una biblioteca musical y generar danza por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card menciona checkpoints de evaluacion MMR14500 en `evaluation/mmr/` y una seleccion cualitativa entre AR y Diff basada en videos comparativos (el propietario describe AR como mas viva y Diff como mas estable), pero no se aportan cifras numericas (MMR, FID, FMD ni similares) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada.
- GPUs recomendadas: no disponible. El model card menciona ejecucion CUDA a traves de Slurm en el sistema Isambard, lo que sugiere un entorno de cluster HPC.
- Encaje en GPU de consumo: no confirmado. El repositorio ocupa 37,1 GB, pero se desconoce el peso real de los pesos cargados en VRAM.
- Opciones de despliegue: entorno Python 3.11 con PyTorch, segun `docs/NEW_SERVER_SETUP.md`. La inferencia se ejecuta con `scripts/infer_g1_chunk38.py`. El audio requiere un entorno separado con `magenta-rt==2.0.3` y dependencias JAX/Flax, que no debe instalarse sobre el entorno PyTorch de entrenamiento.
- Aceleracion: se recomienda ejecutar CUDA mediante Slurm en Isambard. La generacion usa NFE 10 por defecto con DDIM para root/C.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de music-to-dance para el Unitree G1 ni referencias externas con las que contrastar parametros, contexto o licencia. El propio model card menciona otras lineas del proyecto no publicadas (los "four-frame ARDy/FSQ o C64 causal-codec runs"), pero no ofrece especificaciones de las mismas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion de los pesos.
- El autor reconoce explicitamente que la seleccion entre AR y Diff es cualitativa y no implica que ningun sistema domine todos los benchmarks ni que elimine los saltos de rotacion ("rotation jumps").
- El repositorio no publica musica original, dataset de movimiento, caches de entrenamiento generados, credenciales, entorno ni modelos experimentales no relacionados. Los datos deben obtenerse por separado bajo sus terminos originales.
- El repositorio de codigo original (`lbtwyk/Musics2Dance`) es privado; solo se distribuye un snapshot de codigo dentro del bundle de pesos.
- El evaluador formal mantiene comprobaciones estrictas de identidad de las entradas de entrenamiento, lo que puede limitar la reproducibilidad fuera del entorno previsto.
- El estimador de fiabilidad musical esta congelado y no se reajusta con nuevas pistas.
- La generacion no aplica suavizado ni postprocesado: los saltos o artefactos pueden aparecer directamente en la salida.
- Requiere dos entornos separados (PyTorch para el modelo y JAX/Flax para el audio), con riesgo de conflicto si se mezclan.
- No es un modelo de lenguaje: no ofrece tool calling, agentes, razonamiento textual ni capacidades multilingues.
- Fechas de creacion y actualizacion (2026-10-13) situadas en el futuro respecto a la fecha de redaccion habitual; verificar la vigencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wyksdsg/musics2dance-chunk38-traj
- Repositorio de codigo (privado): https://github.com/lbtwyk/Musics2Dance/tree/main
- Revision de descarga indicada: `chunk38-traj-v1`
- Script de inferencia citado: `scripts/infer_g1_chunk38.py`
- Script de construccion de cache musical: `scripts/build_g1_native_music.py`
- Script de preparacion de codec: `scripts/prepare_g1_chunk_root.py`
- Script de entrenamiento citado: `train_g1_chunk_root.py`
- Configuraciones: `configs/experiments/fd_chunk_root_dc_heading_repair.json`, `configs/experiments/fd_chunk_trajectory_diffusion.json`
- Documentacion de entorno: `docs/NEW_SERVER_SETUP.md`
- Atribucion de terceros: `THIRD_PARTY.md`
