# Zachary1150/ear-eeg-fm-benchmark-loso

## Resumen

`Zachary1150/ear-eeg-fm-benchmark-loso` no es un modelo generativo al uso, sino una coleccion de 386 checkpoints de tarea (14,3 GiB, 15,4 GB de repositorio) que constituyen el material de replicacion del benchmark *Ear-EEG-FM-Benchmark*. El objetivo del benchmark es comparar el rendimiento de *sleep staging* (clasificacion de 5 fases de sueno) usando EEG de cuero cabelludo frente a EEG intra-auricular, un montaje mucho mas comodo para dispositivos vestibles y de consumo. El autor es Zachary1150 y el repositorio se publico el 18 de septiembre de 2026 bajo la libreria PyTorch.

Los checkpoints cubren tres datasets de sueno (EESM17 con 9 sujetos, EESM19 con 20 y EESM23 con 10), dos modalidades (`scalp-eeg` e `in-ear-eeg`) y hasta siete arquitecturas: tres modelos entrenados desde cero (EEGNet, EEGConformer, EEGDeformer) y cuatro *foundation models* de senales biologicas ajustados desde pesos preentrenados (BIOT, CBraMod, LaBraM-base y REVE). Cada fichero `best.pt` es el `state_dict` del adaptador seleccionado por mejor balanced accuracy de validacion en un esquema leave-one-subject-out (LOSO), con un checkpoint por sujeto retenido y una sola semilla publicada (`seed1`).

Su relevancia ahora es metodologica: el benchmark fija una receta de entrenamiento unica y comun para todas las familias, publica la configuracion resuelta de cada ejecucion y separa validacion de test para evitar fugas de informacion. Eso permite responder a una pregunta practica para quien disena wearables de sueno: cuanto rendimiento se pierde al sustituir el EEG de cuero cabelludo por electrodos intra-auriculares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea: EEGNet, EEGConformer, EEGDeformer, BIOT, CBraMod, LaBraM-base y REVE. Son checkpoints de tarea fine-tuned, no encoders preentrenados |
| Parametros totales | no disponible (no se publica el recuento por familia) |
| Parametros activos | no aplica (ninguna de las arquitecturas incluidas es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen como `state_dict` de PyTorch en la precision de entrenamiento |
| Idiomas soportados | no aplica (la entrada es senal EEG, no texto) |
| Licencia | no disponible en la ficha de HuggingFace; el uso y la redistribucion quedan sujetos a los terminos de los modelos preentrenados de origen (BIOT, CBraMod, LaBraM, REVE) y de los datasets EESM17/EESM19/EESM23 |
| Formato de pesos | `.pt` (un `best.pt` de PyTorch por modelo, modalidad, dataset y fold) |
| Numero de checkpoints | 386 (14,3 GiB; 15,4 GB de repositorio) |
| Tarea | Clasificacion de 5 clases de sueno; balanced accuracy aleatoria = 0,20 |
| Modalidades evaluadas | `scalp-eeg` e `in-ear-eeg` |
| Libreria | PyTorch |
| Cobertura por dataset | EESM17: 9 folds y 7 modelos; EESM19: 20 folds y 3 modelos; EESM23: 10 folds y 7 modelos |

## Arquitectura y entrenamiento

La coleccion combina dos regimenes de entrenamiento. EEGNet, EEGConformer y EEGDeformer se entrenan desde cero; BIOT, CBraMod, LaBraM-base y REVE parten de sus pesos preentrenados upstream. REVE es la unica familia que depende de un banco de posiciones 3D de canales: los electrodos auriculares de EESM17 (`ELA`..`ERI`) no existen en ese banco, por lo que ese dataset usa la variante `ch_embed=mastoid`, mientras que EESM23 resuelve los nombres de canal directamente y emplea `reve` estandar. En EESM19 no se ejecutaron BIOT, LaBraM-base ni REVE.

La receta es unica y compartida (`training/config.py` del repositorio fuente): AdamW con betas 0,9/0,999 y weight decay 0,05, batch size 64, 100 epocas, decaimiento coseno hasta `min_lr` 1e-6 con un 10 % de warmup lineal y label smoothing 0,1. El unico hiperparametro que cambia por familia es el learning rate: 1e-3 para los modelos desde cero y 5e-4 para los foundation models. No hay busqueda de learning rate por modelo ni ajuste por dataset. La seleccion del checkpoint se hace por balanced accuracy de validacion del fold; el test nunca se usa para elegir modelo. Cada ejecucion publica su configuracion completamente resuelta en `seed1/resolved_config.yaml`, y las metricas agregadas (balanced accuracy, kappa de Cohen y F1 ponderado) en `aggregate.json`.

## Capacidades

- Clasificacion de 5 clases de sueno (sleep staging) a partir de ventanas de EEG, tanto de cuero cabelludo como intra-auricular.
- Inferencia cross-subject: cada checkpoint se evalua sobre el sujeto que quedo fuera del entrenamiento (esquema LOSO).
- Extraccion de representaciones de senal biosignal via los adaptadores de las familias fundacionales (BIOT, CBraMod, LaBraM, REVE), reutilizables para otras tareas de EEG.
- Evaluacion comparativa de arquitecturas bajo una receta comun, con metricas por sujeto (`loso_results.csv`) y agregadas (`aggregate.json`).
- No es un modelo de lenguaje: no hay generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni flujos de agentes o razonamiento multi-paso.
- No tiene capacidades multilingues (la entrada no es textual).

## Casos de uso

- Reproduccion de resultados publicados: descargar el arbol en `runs/` con `hf download --local-dir runs/` y ejecutar los scripts del repositorio fuente, que resuelven las rutas sin cambios. Adecuado porque la estructura replica exactamente el `runs/` del proyecto original.
- Seleccion de arquitectura para wearables de sueno: comparar la columna `in-ear` de EESM17 y EESM23 (por ejemplo, LaBraM-base 0,6385 +- 0,0924 frente a EEGNet 0,3578 +- 0,0618 en EESM17) para decidir que familia conviene a un dispositivo intra-auricular.
- Justificacion de diseno de hardware: los datos de la columna `scalp` actuan como techo de referencia y permiten cuantificar la perdida de balanced accuracy al pasar a electrodos intra-auriculares en cada familia y dataset.
- Validacion de pipelines de evaluacion: los checkpoints permiten comprobar que un harness propio respeta la seleccion por validacion y no filtra el test, dado que cada `best.pt` documenta su fold y su `fold_meta`.
- Punto de partida para fine-tuning: usar los adaptadores BIOT, CBraMod, LaBraM-base o REVE como inicializacion en un dataset de sueno distinto, partiendo de un `state_dict` ya ajustado a la tarea.
- Analisis de variabilidad inter-sujeto: los ficheros `loso_results.csv` y `metrics.json` permiten estudiar la dispersion por sujeto (por ejemplo, la desviacion de 0,1404 de EEGDeformer en EESM17 in-ear) y detectar sujetos problematicos.
- Auditoria de recetas de entrenamiento: al compartir learning rate, batch, epocas y scheduler, la coleccion sirve para aislar el efecto de la arquitectura frente al efecto del ajuste de hiperparametros.
- Prototipado academico en senal biosignal: cargar un unico `best.pt` con `map_location="cpu"` y el registro `build_fm` del repositorio para experimentar sin reentrenar.

## Benchmarks y rendimiento

Resultados de balanced accuracy en test (media +- desviacion sobre sujetos retenidos, 5 clases, azar 0,20). Datos tomados de la model card.

EESM17 (9 sujetos):

| Modelo | Scalp EEG | In-ear EEG |
|---|---|---|
| eegnet | 0,3669 +- 0,0457 | 0,3578 +- 0,0618 |
| eegconformer | 0,5742 +- 0,1060 | 0,5570 +- 0,1020 |
| eegdeformer | 0,6169 +- 0,0881 | 0,5851 +- 0,1404 |
| biot | 0,6794 +- 0,0547 | 0,6296 +- 0,1115 |
| cbramod | 0,6731 +- 0,0346 | 0,6141 +- 0,1307 |
| labram_base | 0,6868 +- 0,0643 | 0,6385 +- 0,0924 |
| reve_chembed_mastoid | 0,6401 +- 0,0583 | 0,6086 +- 0,0834 |

EESM19 (20 sujetos):

| Modelo | Scalp EEG | In-ear EEG |
|---|---|---|
| eegnet | 0,5813 +- 0,0662 | 0,5123 +- 0,0453 |
| eegconformer | 0,7445 +- 0,0451 | 0,6797 +- 0,0589 |
| cbramod | 0,7893 +- 0,0491 | 0,7254 +- 0,0674 |

EESM23 (10 sujetos):

| Modelo | Scalp EEG | In-ear EEG |
|---|---|---|
| eegnet | 0,3878 +- 0,0756 | 0,4270 +- 0,0582 |
| eegconformer | 0,6899 +- 0,0672 | 0,6010 +- 0,0812 |
| eegdeformer | 0,7019 +- 0,0715 | 0,5843 +- 0,1037 |
| biot | 0,7284 +- 0,0589 | 0,6218 +- 0,0779 |
| cbramod | 0,7095 +- 0,0699 | 0,6195 +- 0,0966 |
| labram_base | 0,7430 +- 0,0631 | 0,5717 +- 0,0978 |
| reve | 0,7389 +- 0,0791 | 0,6158 +- 0,0778 |

En los tres datasets la modalidad de cuero cabelludo supera a la intra-auricular en todos los modelos. El kappa de Cohen y el F1 ponderado de cada ejecucion estan en `aggregate.json`. Los resultados bajos de EEGNet en EESM17 y EESM23 son los que produce la receta compartida tal cual, sin ajuste especifico, y se reportan sin retocar. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a este modelo).

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publica el numero de parametros ni el tamano de cada `best.pt`.
- Estimacion indirecta: los 15,4 GB del repositorio se reparten entre 386 checkpoints, lo que situa cada fichero en el orden de decenas de MB, no de GB. Es una deduccion a partir del tamano publicado, no un dato del autor.
- GPU recomendadas: no disponible. Al tratarse de modelos de clasificacion de EEG sobre ventanas cortas, no requieren aceleradores de gama alta, pero el autor no especifica hardware.
- GPU de consumo: no confirmado por el autor; por el tamano descrito, la inferencia en CPU o en una GPU de gama media deberia ser viable, aunque no hay medicion publicada.
- Opciones de despliegue: no aplica el stack habitual de servidores de inferencia (vLLM, TGI, Ollama, llama.cpp), porque son pesos PyTorch de clasificacion, no modelos de lenguaje. El consumo previsto es via el codigo del repositorio fuente: `build_fm` de `model.registry` mas `torch.load`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa interna entre las familias incluidas en el propio benchmark (balanced accuracy de test, modalidad scalp / in-ear):

| Modelo | Origen | EESM17 scalp | EESM17 in-ear | EESM23 scalp | EESM23 in-ear | Parametros | Licencia |
|---|---|---|---|---|---|---|---|
| eegnet | desde cero | 0,3669 | 0,3578 | 0,3878 | 0,4270 | no disponible | no disponible |
| eegconformer | desde cero | 0,5742 | 0,5570 | 0,6899 | 0,6010 | no disponible | no disponible |
| eegdeformer | desde cero | 0,6169 | 0,5851 | 0,7019 | 0,5843 | no disponible | no disponible |
| biot | preentrenado | 0,6794 | 0,6296 | 0,7284 | 0,6218 | no disponible | sujeta al modelo upstream |
| cbramod | preentrenado | 0,6731 | 0,6141 | 0,7095 | 0,6195 | no disponible | sujeta al modelo upstream |
| labram_base | preentrenado | 0,6868 | 0,6385 | 0,7430 | 0,5717 | no disponible | sujeta al modelo upstream |
| reve | preentrenado | 0,6401 (variante mastoid) | 0,6086 (variante mastoid) | 0,7389 | 0,6158 | no disponible | sujeta al modelo upstream |

El patron consistente es que los foundation models preentrenados superan a los modelos desde cero con la misma receta, y que la brecha scalp/in-ear se mantiene en todas las familias. No se dispone de comparacion con modelos externos a este benchmark.

## Limitaciones y advertencias

- No es un dispositivo medico y el autor indica explicitamente que no debe usarse con fines clinicos.
- Cada checkpoint solo es valido para el fold que nombra. Evaluarlo sobre cualquier otro sujeto produce fuga de datos, porque ese sujeto estaba en su conjunto de entrenamiento.
- Licencia no declarada en HuggingFace. La redistribucion y el uso posterior quedan sujetos a los terminos de los modelos preentrenados upstream (BIOT, CBraMod, LaBraM, REVE) y de los datasets de sueno utilizados.
- Sesgos conocidos: no documentados por el autor. Los datasets son pequenos (9, 20 y 10 sujetos), por lo que la generalizacion a otras poblaciones, equipos de adquisicion o montajes de electrodos no esta validada.
- Alta varianza entre sujetos: varias desviaciones tipicas superan los 0,10 puntos de balanced accuracy (por ejemplo, EEGDeformer in-ear en EESM17, 0,1404), lo que exige cautela al interpretar medias.
- Cobertura incompleta: EESM19 solo incluye eegnet, eegconformer y cbramod; BIOT, LaBraM-base y REVE no se ejecutaron en ese dataset.
- REVE en EESM17 usa la variante `ch_embed=mastoid` porque los electrodos auriculares no existen en su banco de posiciones; los resultados no son directamente equiparables a los de `reve` en EESM23.
- Solo se publica la semilla `seed1`; no hay estimacion de variabilidad entre inicializaciones.
- La receta usa un unico learning rate por familia y no hay busqueda por modelo ni por dataset, de modo que los resultados reflejan esa configuracion concreta y no el maximo alcanzable de cada arquitectura.
- Riesgo de alucinacion: no aplica, es un clasificador y no genera texto. El riesgo equivalente es la clasificacion erronea de fases de sueno, no cuantificada fuera de las metricas agregadas.
- Limitaciones de idioma: no aplica; la entrada es senal EEG.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Zachary1150/ear-eeg-fm-benchmark-loso
- Repositorio fuente del benchmark: https://github.com/zhikaili1150/Ear-EEG-FM-Benchmark
- Dataset EESM17 (OpenNeuro ds004348): https://doi.org/10.18112/openneuro.ds004348.v1.0.4
- Los resultados de la busqueda web disponible tratan sobre DLSS 5 de NVIDIA y no guardan relacion con este modelo, por lo que se omiten.
