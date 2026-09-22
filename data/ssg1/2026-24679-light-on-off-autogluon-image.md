# ssg1/2026-24679-light-on-off-autogluon-image

## Resumen

El modelo `ssg1/2026-24679-light-on-off-autogluon-image` es un clasificador binario de imagenes desarrollado por el usuario ssg1 en el marco de la asignatura 24-679 Designing with AI (curso de otono de 2026, tarea 2 sobre AutoML para redes neuronales). Su tarea consiste en determinar, a partir de una fotografia de una lampara, bombilla o luminaria, si el dispositivo esta emitiendo luz (`1 = on`) o no (`0 = off`). Se trata de un artefacto de tipo coursework, no de un sistema de vision pensado para produccion.

Tecnicamente es una red convolucional basada en el backbone `mobilenetv3_small_100` preentrenado en ImageNet y ajustado con AutoGluon sobre el dataset `jackstev/hw1-image-light-sources-on-off`. El modelo final tiene aproximadamente 1,5 millones de parametros, recibe entradas de 224x224 RGB y fue seleccionado mediante una busqueda AutoML de 6 configuraciones (backbones `resnet18`, `mobilenetv3_small_100` y `efficientnet_b0`) con un presupuesto de 300 segundos por configuracion.

Su relevancia es fundamentalmente metodologica: el autor documenta de forma explicita el problema de fuga de datos por sujeto (`subject_id`) en un dataset donde cada luminaria se fotografia encendida y apagada, e incluye una linea base trivial (regla de pixeles saturados) para demostrar que la red aporta valor real frente a una heuristica sin aprendizaje. Declara una exactitud del 100% en el conjunto de test, aunque con un intervalo de confianza de Clopper-Pearson al 95% de 47,8%-100,0% debido a que solo contiene 5 fotografias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con backbone `mobilenetv3_small_100` preentrenado en ImageNet y ajustado (fine-tuning) mediante AutoGluon |
| Parametros totales | 1,5 M (1,5 M entrenables) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen de 224x224 RGB) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no aplica; clasificacion de imagenes, sin procesamiento de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No disponible (libreria declarada: `autogluon`; tamano del repositorio: 0,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional de clasificacion de imagenes. El autor selecciono `mobilenetv3_small_100` como backbone final, partiendo de pesos preentrenados en ImageNet y aplicando fine-tuning completo (los 1,5 M de parametros son entrenables). La normalizacion de ImageNet se aplica internamente por AutoGluon. La entrada esperada es una imagen RGB cuadrada de 224x224, tal como la entrega el dataset de origen (ya redimensionada y rellenada con gris neutro). La busqueda AutoML evaluo 6 configuraciones con semilla 24679, 300 segundos de presupuesto por configuracion, early stopping con `patience=10` y un techo de 50 epocas: `resnet18` (lr 1e-4 y 5e-4; weight decay 1e-3 y 1e-2), `mobilenetv3_small_100` (lr 5e-4 y 1e-3) y `efficientnet_b0` (lr 5e-4). La regla de seleccion, fijada antes de la busqueda, fue maxima exactitud de validacion con desempate por menor log loss de validacion. El modelo elegido (`mobilenetv3_lr1e-3`) se entreno durante 18 de las 50 epocas permitidas y alcanzo 100,0% de exactitud y 0,0001 de log loss en validacion.

Los datos de entrenamiento proceden del dataset `jackstev/hw1-image-light-sources-on-off`, con 30 fotografias originales de lamparas, bombillas, luminarias de techo y luces de vehiculo tomadas con la camara de un telefono en casa y en el campus. La mayoria de las luminarias se fotografiaron dos veces seguidas, encendidas y apagadas, con el encuadre fijo. Los splits publicados son: train con 340 filas (20 fotografias originales, 12 luminarias distintas, 187 on / 153 off), validacion con 5 filas (5 fotografias, 3 luminarias, 3 on / 2 off) y test con 5 filas (5 fotografias, 3 luminarias, 3 on / 2 off). El autor advierte de que el tamano efectivo de entrenamiento son 20 fotografias de 12 luminarias, no 340 filas, porque el resto son variantes aumentadas y no observaciones independientes. El aumento de datos lo aplico el autor del dataset solo sobre las fotografias de entrenamiento, con cuatro metodos independientes: `restrained_brightness` (factor 0,75-0,90 o 1,10-1,30), `small_rotation` (15-30 grados), `mirror_and_crop` (volteo horizontal y recorte del 80-95%) y `mild_gaussian_blur` (radio 0,9-2,0 pixeles). No se aplico aumento adicional durante el entrenamiento. El rango de brillo se mantiene deliberadamente contenido para no alterar la evidencia de la que depende la etiqueta. No se documenta uso de RLHF ni DPO, algo que no aplica a un clasificador de imagenes.

## Capacidades

- Clasificacion binaria de imagenes: predice si una fuente de luz (lampara, bombilla, luminaria de techo o luz de vehiculo) esta encendida (`1`) o apagada (`0`).
- Entrada de imagen RGB cuadrada a 224x224, con normalizacion estilo ImageNet aplicada internamente.
- Generalizacion entre luminarias distintas: segun la model card, la red mantiene el rendimiento en fixtures no vistas, a diferencia de la regla de umbral de pixeles saturados, que cae del 80% en entrenamiento al 40% en test.
- Ajuste fino sobre un backbone pequeno (1,5 M de parametros), lo que permite entrenamiento e inferencia en hardware muy modesto.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No incluye modo de pensamiento, vision general, audio ni otras capacidades especiales mas alla de la clasificacion de imagen indicada.

## Casos de uso

- Demostracion docente de AutoML sobre vision por computador: el modelo sirve como ejemplo reproducible de busqueda de configuraciones con AutoGluon, comparacion de backbones y seleccion por validacion, dentro de un curso de diseno con IA.
- Ejercicio practico de deteccion de fuga de datos: el propio autor lo utiliza para ilustrar por que un split debe separar por `subject_id` y no solo por fotografia, evitando que el modelo reconozca la habitacion en lugar de la luz.
- Control de encendido en domotica a pequena escala: con las debidas reservas por el reducido conjunto de evaluacion, un clasificador asi podria integrarse en una camara fija para verificar el estado de una lampara concreta y disparar rutinas de automatizacion.
- Monitorizacion de iluminacion en instalaciones: verificacion periodica de que las luminarias de un espacio estan encendidas o apagadas, siempre que se reentrenara con imagenes del entorno objetivo.
- Etiquetado asistido de imagenes: uso como preetiquetador para construir datasets mayores de fuentes de luz encendidas y apagadas, con revision humana posterior.
- Punto de partida para transferencia a tareas binarias visuales similares: el pipeline de AutoGluon con `mobilenetv3_small_100` es reutilizable para problemas de dos clases con imagenes de 224x224.
- Referencia de linea base en investigacion: comparar heuristicas simples (por ejemplo, umbral sobre pixeles saturados) contra una red ajustada, tal como hace la model card.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, no verificados de forma independiente. Dataset de evaluacion: `jackstev/hw1-image-light-sources-on-off`, split `test` (5 fotografias originales de 3 luminarias).

| Metrica | Modelo | Regla de pixeles saturados | Linea base de clase mayoritaria |
|---|---|---|---|
| Exactitud | 100,0% | 40,0% | 60,0% |
| Exactitud balanceada | 100,0% | 50,0% | 50,0% |
| Precision (on) | 1,000 | 0,000 | 0,600 |
| Recall (on) | 1,000 | 0,000 | 1,000 |
| F1 (on) | 1,000 | 0,000 | 0,750 |

Intervalos y contexto reportados por el autor:

- Exactitud de test 100,0% (5 de 5 fotografias), intervalo de Clopper-Pearson al 95%: 47,8%-100,0%.
- La regla de pixeles saturados alcanza el 80% en las fotografias de entrenamiento sobre las que se ajusto, pero solo el 40% en las luminarias reservadas.
- Resultados completos de la busqueda AutoML (exactitud de validacion y log loss de validacion):

| Configuracion | Exactitud val. | Log loss val. | Epocas |
|---|---|---|---|
| `mobilenetv3_lr1e-3` | 100,0% | 0,0001 | 18 |
| `mobilenetv3_lr5e-4` | 100,0% | 0,0008 | 13 |
| `efficientnet_b0_lr5e-4` | 100,0% | 0,0070 | 29 |
| `resnet18_lr5e-4` | 100,0% | 0,0658 | 26 |
| `resnet18_lr5e-4_wd1e-2` | 100,0% | 0,0803 | 17 |
| `resnet18_lr1e-4` | 100,0% | 0,1763 | 26 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y en cualquier caso no serian aplicables a un clasificador de imagenes binario.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB para un backbone de 1,5 M de parametros a 224x224 con precision FP32 (estimacion propia a partir del tamano del modelo; no documentada por el autor).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; no se requiere A100, H100 ni similares. Una RTX 4090 queda enormemente sobredimensionada para este modelo.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso puede ejecutarse en CPU con latencias de milisegundos.
- Opciones de despliegue: AutoGluon (libreria declarada en la model card) y su `ImagePredictor`; al estar basado en un backbone PyTorch, seria exportable a otros runtimes, aunque esto no se documenta en la informacion disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles. Con 1,5 M de parametros se espera una latencia muy baja, pero el autor no publica mediciones.
- Nota: el repositorio ocupa 0,0 GB, por lo que no esta confirmado que los pesos entrenados esten efectivamente publicados en HuggingFace.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las otras configuraciones evaluadas en la misma busqueda AutoML, sobre el mismo dataset y con el mismo presupuesto.

| Configuracion | Parametros aproximados | Contexto / entrada | Exactitud val. | Log loss val. | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mobilenetv3_small_100` (seleccionado) | ~1,5 M | 224x224 RGB | 100,0% | 0,0001 | CC-BY-4.0 | Publicado por ssg1 en HuggingFace |
| `mobilenetv3_small_100` (lr 5e-4) | ~1,5 M | 224x224 RGB | 100,0% | 0,0008 | No disponible | Solo como resultado de la busqueda |
| `efficientnet_b0` | ~5,3 M | 224x224 RGB | 100,0% | 0,0070 | No disponible | Solo como resultado de la busqueda |
| `resnet18` | ~11,7 M | 224x224 RGB | 100,0% | 0,0658 | No disponible | Solo como resultado de la busqueda |

Los tamanos de `efficientnet_b0` y `resnet18` son estimaciones estandar de esos backbones y no cifras publicadas por el autor. No se dispone de comparativas contra otros modelos publicados para esta tarea concreta.

## Limitaciones y advertencias

- Conjunto de test minimo: 5 fotografias de 3 luminarias. El intervalo de confianza al 95% de Clopper-Pearson va de 47,8% a 100,0%, de modo que una exactitud perfecta es compatible con un rendimiento real cercano al azar.
- El autor indica explicitamente que es un trabajo de coursework, no un sistema de vision para produccion.
- Sesgo de dominio: todas las imagenes provienen de una unica camara de telefono, de 12 luminarias de casa y del campus. No hay evidencia de generalizacion a otras camaras, condiciones de iluminacion, paises o tipos de luminaria.
- Riesgo de sobreajuste a las condiciones de captura: aunque se verifica que ningun `subject_id` cruce los splits, el tamano efectivo de entrenamiento es de 20 fotografias de 12 luminarias.
- El aumento de datos se aplico solo en entrenamiento y con metodos suaves; el brillo se limito deliberadamente para no alterar la evidencia de la etiqueta, lo que reduce la robustez ante cambios fuertes de exposicion.
- Riesgo de alucinacion en el sentido clasico no aplica; el riesgo equivalente es la clasificacion erronea confiada en dominios fuera de distribucion.
- Limitaciones de idioma: no aplica, es un modelo de vision sin componente textual.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero al tratarse de un modelo derivado de un dataset de fotografias de terceros conviene revisar tambien la licencia del dataset `jackstev/hw1-image-light-sources-on-off`.
- El repositorio ocupa 0,0 GB, lo que sugiere que los pesos podrian no estar disponibles o no haberse subido; conviene verificar antes de intentar cargar el modelo.
- Los resultados del `model-index` estan marcados como no verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssg1/2026-24679-light-on-off-autogluon-image
- Dataset utilizado: https://huggingface.co/datasets/jackstev/hw1-image-light-sources-on-off
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos correspondian a paginas de soporte de Microsoft sin relacion con el modelo.
