# thuerey-group/GMP

## Resumen

GMP (Geometry Meets Physics) es un framework de pre-entrenamiento para modelos subrogados neuronales de ecuaciones en derivadas parciales (PDE) sobre geometrias 3D no estructuradas, desarrollado por el grupo thuerey-group (TUM School of Computation, Information and Technology, con colaboracion de la Universidad de Mannheim) y aceptado en NeurIPS 2026. Su propuesta central es eliminar la dependencia de datos de simulacion precalculados en disco: en lugar de almacenar terabytes de resultados CFD o FEM, GMP genera los datos de pre-entrenamiento en tiempo de ejecucion, ya sea a partir de descriptores geometricos intrinsecos (regimen estacionario) o de simulaciones PDE aceleradas en GPU (regimen transitorio).

El repositorio de Hugging Face no contiene un modelo de lenguaje, sino un conjunto de checkpoints de pesos (formato PyTorch `.pth` y `.ckpt`) para la arquitectura GMP-Net y para dos baselines, AB-UPT y Transolver++, pre-entrenados tanto en la variante geometrica como en la fisica. El pipeline declarado es `feature-extraction`, coherente con su uso como extractor de representaciones geometricas y fisicas que despues se ajusta fino (fine-tuning) sobre benchmarks de ingenieria concretos.

La relevancia actual reside en el coste de los surrogate models en ingenieria: el pre-entrenamiento clasico sobre mallas no estructuradas exige datasets de simulacion masivos y con cuellos de botella de E/S severos. GMP demuestra que es posible obtener representaciones utiles sin esos datos, reduciendo el coste de entrada para equipos que quieran adaptar un modelo subrogado a su propio dominio (aerodinamica, crash, dinamica de fluidos) con pocas simulaciones etiquetadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GMP-Net (transformer sobre mallas no estructuradas; detalles exactos de capas y dimensiones no disponibles en la informacion proporcionada); baselines AB-UPT y Transolver++ |
| Parametros totales | no disponible (solo se publica el tamano de los checkpoints: GMP-Net geometrico ~346 MB, GMP-Net fisico ~174 MB, AB-UPT ~148 MB, Transolver++ ~106 MB por variante) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre mallas 3D de tamano variable) |
| Tipos de cuantizacion | no disponible (checkpoints en precision de entrenamiento, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth` y `.ckpt` con EMA) |

## Arquitectura y entrenamiento

GMP-Net es un modelo subrogado neuronal que opera directamente sobre geometrias 3D no estructuradas (mallas de superficie y volumetricas) y predice campos fisicos (presion, velocidad, tension de Von Mises, etc.). El pre-entrenamiento se divide en dos regimenes. En el regimen estacionario, el modelo aprende representaciones geometricas a partir de descriptores intrinsecos de forma: coordenadas, curvaturas, normales y SGD (signed geodesic distance), sin necesidad de ejecutar simulaciones offline. En el regimen transitorio, se generan dinamicas PDE sinteticas en linea mediante solvers acelerados por GPU, lo que permite escalar el pre-entrenamiento a evoluciones dependientes del tiempo sin almacenamiento en disco.

El repositorio incluye tambien checkpoints pre-entrenados de dos baselines con la misma receta: AB-UPT (pre-entrenamiento geometrico, estacionario) y Transolver++ en variantes de superficie y volumen (pre-entrenamiento geometrico, estacionario). El checkpoint fisico de GMP-Net se guarda con media movil exponencial de pesos (`epoch-199-EMA.ckpt`). No se especifican en la informacion disponible el numero de tokens o muestras de entrenamiento, la composicion exacta del dataset sintetico ni si se emplearon tecnicas de RLHF o DPO (no aplicables a este dominio). La innovacion tecnica destacable es precisamente el pre-entrenamiento libre de datos en disco, que evita los cuellos de botella de E/S de los pipelines tradicionales.

## Capacidades

- Prediccion de campos fisicos sobre mallas 3D no estructuradas (superficie y volumen) como modelo subrogado de simulaciones CFD y FEM.
- Extraccion de representaciones geometricas (feature extraction) reutilizables para fine-tuning en dominios de ingenieria.
- Pre-entrenamiento en regimen estacionario (geometria) y transitorio (dinamica PDE), con checkpoints separados para cada uno.
- Fine-tuning sobre seis benchmarks downstream: DrivAerML (aerodinamica automovilistica), SHIFT-Wing (aerodinamica aeroespacial con variacion de Mach y angulo de ataque), SHIFT-Crash estacionario (deformacion estructural y tension de Von Mises), Kuramoto-Sivashinsky (dinamica caotica 2D), flujo alrededor de elipse (fluidodinamica 2D no estacionaria) y SHIFT-Crash transitorio (rollout autorregresivo de 12 pasos temporales).
- Soporte de rollout autorregresivo multi-paso en problemas transitorios.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo de pensamiento, vision, audio ni otras capacidades multimodales.

## Casos de uso

- Aerodinamica automovilistica: ajuste fino del checkpoint geometrico sobre DrivAerML para predecir presion y velocidad en la superficie de carrocerias, sustituyendo parte de las simulaciones CFD costosas por inferencia neuronal durante fases de diseno conceptual.
- Aerodinamica aeroespacial: adaptacion sobre SHIFT-Wing para estimar campos de flujo en alas NASA CRM bajo distintas condiciones de Mach y angulo de ataque, util para barridos parametricos rapidos.
- Analisis estructural y crash: fine-tuning sobre SHIFT-Crash estacionario para predecir tension de Von Mises en componentes de vehiculo, y sobre la variante transitoria para rollouts autorregresivos de 12 pasos en dinamica de impacto.
- Dinamica de fluidos 2D: uso del checkpoint fisico para modelar flujo no estacionario alrededor de obstaculos elipticos, como caso de validacion de la capacidad de generalizacion del pre-entrenamiento fisico.
- Sistemas caoticos: aplicacion a Kuramoto-Sivashinsky para estudiar la capacidad del modelo de capturar dinamica espaciotemporal caotica, relevante en investigacion de surrogate models para turbulencia.
- Extraccion de caracteristicas geometricas: uso del modelo pre-entrenado como backbone congelado para generar embeddings de mallas 3D que alimenten clasificadores o regresores aguas abajo (por ejemplo, prediccion de coeficientes aerodinamicos globales).
- Aceleracion de pipelines de optimizacion de forma: integracion del subrogado en bucles de optimizacion topologica donde cada evaluacion CFD tarda horas y el modelo responde en milisegundos o segundos.

## Benchmarks y rendimiento

La model card menciona comparaciones de error para DrivAerML y SHIFT-Wing mediante figuras (`drivaerml_error_comparison.png` y `shiftwing_error_comparison.png`), pero no se incluyen valores numericos en la informacion proporcionada. Los resultados cuantitativos completos estan en el paper (arXiv 2610.03363) y en el repositorio de GitHub.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los checkpoints ocupan entre ~106 MB (Transolver++) y ~346 MB (GMP-Net geometrico), por lo que la inferencia cabe holgadamente en GPUs de consumo, pero el consumo real depende del tamano de la malla de entrada y del batch.
- GPU recomendadas: no especificadas en la informacion disponible. El pre-entrenamiento fisico requiere solvers PDE acelerados por GPU, lo que sugiere GPUs de datacenter (A100, H100) para esa fase; la inferencia y el fine-tuning sobre mallas moderadas deberian ser viables en RTX 4090 y superiores.
- Cabe en GPU de consumo: probablemente si, dado el tamano de los checkpoints, aunque no se confirma en la documentacion.
- Opciones de despliegue: el codigo oficial usa Hydra para fine-tuning (repositorio tum-pbs/GMP); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GMP-Net (este modelo) | no disponible (~346 MB y ~174 MB de pesos) | no aplica | Resultados en paper NeurIPS 2026 (no disponibles en esta ficha) | Apache 2.0 | Hugging Face + GitHub |
| AB-UPT | no disponible (~148 MB de pesos) | no aplica | Baseline incluido en el paper GMP | no disponible en la informacion proporcionada | Checkpoint incluido en el mismo repo |
| Transolver++ | no disponible (~106 MB por variante) | no aplica | Baseline incluido en el paper GMP | no disponible en la informacion proporcionada | Checkpoints incluidos en el mismo repo |

No se dispone de datos de rendimiento comparativo ni de otros modelos subrogados de PDE con los que contrastar en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no soporta tool calling ni agentes; cualquier uso en ese sentido es inadecuado.
- Los pesos publicados son checkpoints de pre-entrenamiento, no modelos finales: requieren fine-tuning sobre el dominio objetivo para obtener resultados utiles.
- El rendimiento depende de la calidad y representatividad de los datos de fine-tuning; el pre-entrenamiento sin datos de disco no sustituye la validacion contra simulaciones reales.
- Riesgo de extrapolacion incorrecta fuera del regimen fisico cubierto en el pre-entrenamiento (por ejemplo, numeros de Mach o Reynolds muy distintos a los de los benchmarks).
- No se documentan sesgos en el sentido estadistico habitual; el sesgo relevante es de dominio: la distribucion de geometrias sinteticas puede no cubrir casos industriales atipicos.
- No se especifican limitaciones de idioma porque el modelo no procesa texto.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda citar el paper y revisar las licencias de los datasets downstream (DrivAerML, SHIFT) que pueden tener terminos propios.
- No hay informacion sobre cuantizacion, por lo que el despliegue en entornos con restricciones de precision o memoria debe validarse empiricamente.

## Enlaces

- Hugging Face: https://huggingface.co/thuerey-group/GMP
- Paper (arXiv): https://arxiv.org/abs/2610.03363
- OpenReview: https://openreview.net/forum?id=jidnQA2TIz
- Repositorio GitHub: https://github.com/tum-pbs/GMP
