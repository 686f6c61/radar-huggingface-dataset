# wq2012/ribline-anatomical-scf

## Resumen

`wq2012/ribline-anatomical-scf` no es un modelo de lenguaje, sino un conjunto de checkpoints de aprendizaje automatico clasico para el paquete **ribline** (v0.3.0), una herramienta de procesamiento de imagenes medicas centrada en la extraccion de lineas centrales (centerlines) de costillas y su etiquetado anatomico en tomografias computarizadas (CT) de torax. El repositorio lo publica el usuario `wq2012` bajo licencia MIT e incluye un **Anatomically Anchored Semantic Context Forest** (`rib_forest_anatomical.joblib`), serializado con joblib, junto con un **atlas estadistico de 24 costillas** (`rib_atlas.joblib`).

El modelo resuelve un problema concreto de posprocesado anatomico: dado un volumen CT con las costillas ya segmentadas (por ejemplo, mediante el checkpoint complementario `wq2012/ribline-3d-unet`, `wq2012/ribline-3d-ct-centerline` o el propio conjunto de la coleccion ribline), extrae la linea central de cada costilla y asigna una etiqueta anatomica simetrica (`R01`-`R12`, `L01`-`L12`). A diferencia de las variantes basadas en redes neuronales 3D, esta version funciona integramente en CPU y sin GPU: el bosque aleatorio opera en un marco de coordenadas toracico canonico `(u, v, w)` anclado al centroide pulmonar, lo que le permite incorporar contexto anatomico explicito en lugar de depender solo de la apariencia local de la imagen.

Su relevancia es doble. Por un lado, es una alternativa de despliegue ligero (repo de 0.2 GB, inferencia sin GPU) para pipelines clinicos o de investigacion donde no hay acelerador disponible. Por otro, sirve como punto de referencia intermedio dentro de la propia familia ribline: rinde mejor que el baseline de 2 pasadas con auto-contexto y que la U-Net 3D ligera, pero queda por detras de la variante hibrida completa SCF + 3D U-Net. Segun la model card, alcanza 2.88 +/- 1.32 mm de Labeled Chamfer Distance (LCD) y un 95.1 % de exactitud de etiquetado (272 de 286 costillas) en el split de evaluacion de 12 escaneos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest / Semantic Context Forest (bosque aleatorio con features de contexto anatomico y RSID); no es una red neuronal |
| Parametros totales | no disponible (no aplicable en el sentido habitual; el bosque consta de 150 arboles, profundidad maxima 24, 286 features) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplicable; el contexto lo define la ventana de features: offsets RSID en `[-12, 12]` voxeles, equivalentes a +/- 24 mm) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato joblib; no se documentan variantes GGUF, int8 ni similares) |
| Idiomas soportados | no disponible (no aplicable; no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | joblib (`rib_forest_anatomical.joblib`, `rib_atlas.joblib`) + JSON de configuracion de features (`feature_config_anatomical.json`) |
| Libreria / runtime | `ribline` v0.3.0 (Python), inferencia solo CPU |
| Dominio | Imagenes medicas: CT de torax, extraccion de centerlines 3D y etiquetado anatomico de costillas |
| Tamano del repositorio | 0.2 GB |
| Metricas declaradas | `chamfer_distance`, `cldice`, `accuracy` |
| Nivel de madurez | 0 descargas y 0 likes en el momento de la consulta; publicacion de investigacion |

## Arquitectura y entrenamiento

El componente principal es un bosque aleatorio entrenado sobre un vector de 286 features (la model card lista 28 features gaussianas multiescala, 3 proxies de tubularidad por curvatura diagonal, 8 features de contexto anatomico explicito y 250 features RSID) definido en un espacio de coordenadas toracico canonico `(u, v, w)` anclado al centroide pulmonar, en lugar del sistema de coordenadas del volumen original. Las features de apariencia corresponden a intensidades CT estandarizadas en unidades Hounsfield (`I_HU = I_raw - 1024`) y se calculan a tres escalas (`sigma = 1, 2, 4` mm): intensidad suavizada, magnitud del gradiente, seis derivadas de segundo orden y laplaciano. A esto se anade un proxy de tubularidad por escala, calculado a partir de derivadas segundas alineadas con los ejes sin descomposicion eigen del hessiano, lo que reduce el coste computacional.

El bloque de contexto anatomico es lo que distingue a esta variante: distancia bilateral al plano sagital medio `|u|`, coordenadas firmadas `(u, v, w)`, distancia euclidea al parenquima pulmonar segmentado `D_lung(x)` e indicadores locales de mascara osea. Las 250 features RSID (Random Shift Intensity Difference) con desplazamientos en `[-12, 12]` voxeles aportan comparaciones de intensidad a distancia, un mecanismo clasico de captura de textura y estructura local. La model card no detalla el numero de tokens ni el volumen de datos de entrenamiento en terminos de voxeles, pero si indica que el repositorio incluye informes de evaluacion sobre un conjunto de entrenamiento de 47 escaneos, un test de 12 escaneos y una validacion cruzada de 5 folds sobre 59 escaneos. No se menciona RLHF, DPO ni ningun tipo de ajuste por preferencias, algo por otra parte ajeno a este paradigma.

El checkpoint no opera de forma aislada: se empareja con un stage 3 compuesto por programacion dinamica polar bilateral (`BilateralViterbiLabeler`) y refinamiento por contornos activos (`RibSnake`), apoyados en el atlas estadistico de 24 costillas que contiene curvas canonicas medias, priors de descriptores de 5 dimensiones y priors de espaciado intercostal. La innovacion tecnica principal es, por tanto, la sustitucion de la capacidad de representacion de una red neuronal por anclaje geometrico explicito al marco anatomico y por el atlas estadistico, a cambio de un coste de inferencia minimo y de la eliminacion total de la dependencia de GPU.

## Capacidades

- Extraccion de centerlines 3D de costillas a partir de volumentes CT de torax, con refinamiento por contornos activos.
- Etiquetado anatomico simetrico de costillas con nomenclatura `R01`-`R12` y `L01`-`L12` (24 costillas).
- Inferencia integramente en CPU, sin GPU ni red neuronal profunda en el momento de la inferencia.
- Incorporacion de contexto anatomico global mediante anclaje al centroide pulmonar y distancia al parenquima pulmonar segmentado.
- Uso de un atlas estadistico de forma (curvas canonicas medias, priors de espaciado intercostal) para regularizar y desambiguar costillas adyacentes.
- Integracion con el ecosistema ribline: carga programatica via `RibCageStatisticalAtlas.load` y `RibForest.load`, y ejecucion mediante scripts CLI (`ribline.scripts.infer_anatomical_scf`, `ribline.scripts.run_stage3`).
- Modo `scf_only` en el stage 3, pensado para operar unicamente con las probabilidades generadas por el bosque.
- Auditoria de resultados: el repositorio incluye informes por sujeto (`benchmark_val12_fixed_gt.json`, `benchmark_val12_original_gt.json`, `benchmark_train47.json`, `benchmark_cv5.json`), estadisticas de verificacion del marco canonico (`polar_stats_all59.json`) y un registro de auditoria del ground truth (`gt_fix_log.json`).
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso, vision generica, audio ni capacidades multilingues: no es un modelo de lenguaje ni un modelo fundacional multimodal.

## Casos de uso

- Etiquetado anatomico en pipelines de imagen medica sin GPU: en entornos hospitalarios o de investigacion donde solo hay CPUs disponibles, este checkpoint permite extraer y numerar costillas sin depender de aceleradores, con 2.88 +/- 1.32 mm de LCD en el split de 12 escaneos.
- Preprocesado para cuantificacion de fracturas costales: la numeracion estable `R01`-`R12` / `L01`-`L12` permite asociar cada hallazgo radiologico a una costilla concreta, lo que facilita informes estructurados y seguimiento longitudinal del paciente.
- Planificacion quirurgica toracica: la linea central de cada costilla sirve como referencia geometrica para trayectorias de acceso, resecciones o colocacion de material de osteosintesis.
- Analisis morfometrico de cohortes: el atlas estadistico y las curvas canonicas permiten comparar la forma de la caja toracica entre poblaciones o entre sujetos sanos y patologicos, calculando desviaciones respecto a la media.
- Verificacion y anotacion asistida de datasets: dado que el modelo es rapido y determinista en CPU, puede usarse para preetiquetar costillas antes de la revision manual, reduciendo el tiempo de anotacion en estudios con muchas exploraciones.
- Sistema de respaldo en cascada: en un despliegue que use el checkpoint hibrido `wq2012/ribline-3d-ct-centerline`, esta variante puede actuar como fallback cuando la GPU no esta disponible, aceptando una perdida controlada de exactitud (95.1 % frente a 97.2 % en el split de 12 escaneos).
- Investigacion reproducible sobre baselines no neuronales: los informes de benchmark incluidos y el registro de auditoria del ground truth permiten reproducir la comparacion frente a la U-Net 3D ligera y frente al baseline de 2 pasadas con auto-contexto.
- Control de calidad de segmentaciones existentes: al operar solo sobre coordenadas y probabilidades, el stage 3 con `scf_only` puede aplicarse a mascaras de costillas producidas por terceros para comprobar si la numeracion anatomica resultante es coherente con el atlas de 24 costillas.

## Benchmarks y rendimiento

Los datos disponibles proceden exclusivamente de la tabla comparativa de la model card, que reporta Labeled Chamfer Distance (LCD, en milimetros, menor es mejor) y exactitud de etiquetado anatomico simetrico. No se han publicado resultados de benchmarks en la informacion disponible mas alla de los recogidos aqui; en particular, no hay datos de MMLU, HumanEval ni GSM8K, que no aplican a este dominio.

| Repositorio | Variante | LCD 12 escaneos (mm) | Exactitud 12 escaneos (%) | LCD CV 5-fold (mm) | Exactitud CV 5-fold (%) |
|---|---|---|---|---|---|
| `wq2012/ribline-3d-ct-centerline` | SCF hibrido + 3D U-Net + Stage 3 (suite completa) | 2.05 +/- 0.48 | 97.2 | 3.64 +/- 3.90 | 91.8 |
| `wq2012/ribline-anatomical-scf` | SCF anclado anatomicamente + Stage 3 (solo CPU) | 2.88 +/- 1.32 | 95.1 | 5.28 +/- 4.62 | 86.9 |
| `wq2012/ribline-3d-unet` | 3D U-Net ligera + Stage 3 | 3.40 +/- 1.99 | 92.0 | 7.44 +/- 8.93 | 78.2 |
| `wq2012/ribline-scf-pass2-autocontext` | Baseline SCF de 2 pasadas con auto-contexto + Stage 3 | 9.36 +/- 10.57 | 71.0 | no disponible | no disponible |

En el split de 12 escaneos, la exactitud de 95.1 % corresponde a 272 de 286 costillas correctamente etiquetadas. La validacion cruzada de 5 folds se realizo sobre 59 escaneos. Las metricas declaradas en los tags del repositorio son `chamfer_distance`, `cldice` y `accuracy`, aunque la model card solo desglosa numericamente LCD y exactitud de etiquetado.

## Requisitos de hardware

- VRAM para inferencia: no aplica. El modelo es explicitamente CPU-only y no requiere GPU en ningun punto del pipeline documentado.
- GPU recomendadas: no aplica; no se documenta ninguna GPU como necesaria ni como acelerador soportado para esta variante.
- Compatibilidad con GPU de consumo: irrelevante para este checkpoint, ya que no necesita GPU. Puede ejecutarse en cualquier maquina con Python y suficiente memoria RAM.
- Memoria RAM: no se especifica un minimo en la model card. Como referencia de orden de magnitud, el repositorio completo ocupa 0.2 GB, por lo que los artefactos serializados caben holgadamente en cualquier equipo actual; no obstante, el consumo real depende del volumen CT de entrada y de las estructuras intermedias del pipeline.
- Opciones de despliegue: paquete Python `ribline` v0.3.0, carga directa de los ficheros joblib y ejecucion por linea de comandos con `python -m ribline.scripts.infer_anatomical_scf` seguido de `python -m ribline.scripts.run_stage3 --mode scf_only`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un bosque aleatorio serializado con joblib.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia ni coste por escaneo.
- Almacenamiento: ademas de los 0.2 GB del repositorio, hay que prever espacio para los mapas de probabilidad y las salidas del stage 3 (`outputs/scf_anatomical/prob_maps`, `outputs/scf_stage3`).

## Comparativa con modelos similares

La comparacion relevante es interna a la coleccion ribline, ya que no se han identificado en la informacion proporcionada alternativas externas equivalentes de etiquetado de costillas con arquitectura de bosque aleatorio.

| Modelo | Parametros / complejidad | Contexto o alcance | Rendimiento (12 escaneos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/ribline-anatomical-scf` | 150 arboles, profundidad 24, 286 features | Volumen CT completo con anclaje anatomico `(u, v, w)`; inferencia solo CPU | LCD 2.88 +/- 1.32 mm; 95.1 % de exactitud | MIT | HuggingFace, repo de 0.2 GB, 0 descargas |
| `wq2012/ribline-3d-ct-centerline` | SCF + 3D U-Net + Stage 3 | Suite completa con componente neuronal 3D | LCD 2.05 +/- 0.48 mm; 97.2 % de exactitud | no disponible en la informacion proporcionada para ese repo | HuggingFace (misma coleccion) |
| `wq2012/ribline-3d-unet` | 3D U-Net ligera + Stage 3 | Segmentacion y centerlines con red neuronal 3D | LCD 3.40 +/- 1.99 mm; 92.0 % de exactitud | no disponible en la informacion proporcionada para ese repo | HuggingFace (misma coleccion) |
| `wq2012/ribline-scf-pass2-autocontext` | SCF de 2 pasadas con auto-contexto | Baseline no neuronal sin anclaje anatomico explicito | LCD 9.36 +/- 10.57 mm; 71.0 % de exactitud | no disponible en la informacion proporcionada para ese repo | HuggingFace (misma coleccion) |
| Modelos externos de etiquetado de costillas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito de validacion reducido: los resultados se miden sobre 12 escaneos en el split fijo y 59 escaneos en validacion cruzada. No hay evidencia publicada de generalizacion a otras instituciones, equipos de CT, protocolos de adquisicion o poblaciones pediatricas.
- Brecha entre split fijo y validacion cruzada: el LCD pasa de 2.88 +/- 1.32 mm a 5.28 +/- 4.62 mm y la exactitud cae de 95.1 % a 86.9 %, con desviaciones estandar muy superiores a las medias en el segundo caso. Conviene asumir el peor escenario al planificar un despliegue real.
- Dependencia del ground truth: el repositorio incluye dos variantes de referencia (`benchmark_val12_fixed_gt.json` y `benchmark_val12_original_gt.json`) y un registro de correcciones (`gt_fix_log.json`), lo que indica que el ground truth fue auditado y modificado. Las cifras de rendimiento dependen de cual de las dos referencias se use.
- Ausencia de informacion sobre sesgos: no se documentan sesgos conocidos ni analisis por subgrupos (edad, sexo, etnia, patologia), un aspecto critico en imagen medica.
- Riesgo de error en casos limite: las costillas cervicales, lumbares, fusiones vertebrales, costillas supernumerarias, fracturas desplazadas o anatomias postquirurgicas pueden degradar el etiquetado, ya que el atlas asume una configuracion estandar de 24 costillas.
- Requisitos de entrada no triviales: el pipeline espera un directorio de datos con una estructura concreta (`--data_dir /path/to/Rib/Data`), intensidades CT en unidades Hounsfield y, para el anclaje anatomico, una segmentacion del parenquima pulmonar. No es un modelo que acepte cualquier imagen en crudo.
- Sensibilidad a la segmentacion previa: el rendimiento del bosque depende de la calidad de la mascara de costillas y del pulmon que se le suministre; errores aguas arriba se propagan al etiquetado.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el modelo no cuenta con marcado CE ni autorizacion FDA. Su uso como dispositivo medico o en decision clinica requiere validacion regulatoria y clinica independiente.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni mantenimiento por parte de terceros. Es un artefacto de investigacion, no un componente con soporte.
- Formatos: no se ofrecen pesos en safetensors ni en formatos de cuantizacion estandar, solo joblib. Esto limita la portabilidad fuera del ecosistema Python/scikit-learn y complica la integracion en runtimes no Python.
- Idiomas: no aplica; el modelo no procesa texto. Cualquier expectativa de capacidades linguisticas o conversacionales es incorrecta.
- Opacidad del entrenamiento: la model card no detalla el numero exacto de muestras de entrenamiento en voxeles, el origen de los 47 escaneos de entrenamiento ni los criterios de seleccion de los splits, lo que dificulta juzgar la representatividad de los datos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wq2012/ribline-anatomical-scf
- Coleccion ribline en HuggingFace: https://huggingface.co/collections/wq2012/ribline
- Repositorio GitHub de ribline: https://github.com/wq2012/ribline
- Perfil de GitHub del autor: https://github.com/wq2012
- Checkpoint hibrido completo: https://huggingface.co/wq2012/ribline-3d-ct-centerline
- Checkpoint de 3D U-Net ligera: https://huggingface.co/wq2012/ribline-3d-unet
- Baseline SCF de 2 pasadas con auto-contexto: https://huggingface.co/wq2012/ribline-scf-pass2-autocontext
- Paper o publicacion cientifica asociada: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
