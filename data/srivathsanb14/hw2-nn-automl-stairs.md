# srivathsanb14/hw2-nn-automl-stairs

## Resumen

`hw2-nn-automl-stairs` es un clasificador binario de imagenes desarrollado por el usuario srivathsanb14 como entrega de un trabajo academico (etiqueta `24-679`, probablemente un curso universitario). Su unica funcion es determinar si una fotografia contiene escaleras (clase `1`, `stairs`) o no (clase `0`, `non_stairs`). Se construyo con AutoGluon MultiModal 1.6.1 en su preset `medium_quality`, restringiendo la busqueda al modelo `timm_image`, y el trial finalmente seleccionado fue un backbone ResNet-18 con tasa de aprendizaje 0.001.

El modelo no aporta innovaciones arquitectonicas: es un ejemplo de transfer learning sobre un backbone convolucional clasico, reentrenado sobre un conjunto de datos muy pequeno (374 filas de entrenamiento, de las cuales la mayoria son variantes aumentadas de solo 32 fotografias originales, y apenas 5 imagenes sin aumentar en validacion y 5 en test). El repositorio ocupa 0.1 GB y las ponderaciones se distribuyen como un ZIP con el predictor nativo de AutoGluon, no como safetensors ni GGUF.

Su relevancia es exclusivamente didactica: sirve para ilustrar un flujo completo de AutoML sobre vision por computador (busqueda de hiperparametros, early stopping con `top_k=3` y greedy soup, seleccion de checkpoint por validacion) y para documentar de forma honesta los modos de fallo tipicos de un dataset minusculo, como los atajos de fondo o la confusion de barandillas y sombras con peldaños. Con 8 descargas y 0 likes, no esta pensado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con backbone ResNet-18 y cabecera de clasificacion binaria, gestionada por AutoGluon MultiModal 1.6.1 (`timm_image`) |
| Parametros totales | no disponible en la model card (el backbone seleccionado es ResNet-18; el recuento no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen 224x224 RGB con resize de lado corto, center crop y normalizacion ImageNet |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | en (ingles, segun la model card; en la practica el modelo no procesa texto) |
| Licencia | MIT para el repositorio; las imagenes requieren atribucion a ArinRoths |
| Formato de pesos | ZIP nativo de AutoGluon (`autogluon_image_predictor_dir.zip`), cargado con `MultiModalPredictor.load`; no se publican safetensors, GGUF ni ONNX |

## Arquitectura y entrenamiento

La arquitectura es un clasificador de imagenes convencional: un backbone ResNet-18 preentrenado en ImageNet, adaptado mediante transfer learning a una tarea de dos clases. El pipeline de preprocesado lo fija AutoGluon: las imagenes originales son de 224x224 RGB y despues se aplica redimensionado por el lado corto, recorte central y normalizacion segun estadisticas de ImageNet. No se especifica ningun mecanismo adicional como atencion lineal, decodificacion especulativa ni capas MoE.

El entrenamiento se ejecuto en una GPU T4 de Google Colab con Python 3.13.15 y semilla 24679. Se lanzo una busqueda sobre cuatro configuraciones con un limite de 150 segundos por trial: `resnet18_lr4e-4`, `resnet18_lr1e-3`, `efficientnet_b0_lr4e-4` y `mobilenetv3_small_lr4e-4`. El control de sobreajuste se apoyo en `optim.top_k=3`, greedy soup y conservacion del mejor checkpoint de validacion. El trial ganador fue `resnet18_lr1e-3`, con accuracy de validacion 1.0000. El conjunto de entrenamiento tiene 374 filas compuestas por imagenes originales mas variantes de brillo, rotacion, contraste y desenfoque; validacion y test contienen 5 originales sin aumentar cada uno. No se documenta ninguna fase de RLHF ni DPO, algo esperable en un modelo discriminativo de vision.

## Capacidades

- Clasificacion binaria de imagenes: devuelve 0 (`non_stairs`) o 1 (`stairs`) a partir de una columna `image` con rutas locales a ficheros RGB.
- Transfer learning sobre un backbone convolucional preentrenado en ImageNet, lo que le permite reconocer patrones visuales generales de escaleras (peldaños, repeticion estructural, perspectiva).
- Integracion directa con el ecosistema AutoGluon MultiModal: se carga con `MultiModalPredictor.load` tras descomprimir el ZIP del repositorio.
- Ejecucion en CPU o GPU indistintamente, al ser un modelo pequeno basado en ResNet-18.
- Idioma de documentacion: ingles. El modelo no procesa lenguaje natural, por lo que el soporte multilingue no aplica.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, modo thinking, vision generativa ni audio.

## Casos de uso

- Docencia de AutoML en vision por computador: reproduccion completa del flujo de AutoGluon MultiModal, desde la definicion del dataset hasta la comparacion de cuatro configuraciones de backbone y learning rate con limite de tiempo por trial.
- Pre-etiquetado de datasets de interiores: el modelo puede actuar como primer filtro para separar imagenes con escaleras de las que no las contienen antes de una revision humana, teniendo en cuenta su baja precision fuera de la distribucion de entrenamiento.
- Estudio de sesgos y atajos visuales: los modos de fallo documentados (barandillas, sombras y lineas del suelo confundidas con peldaños, recortes por rotacion, atajos de fondo derivados de solo 32 fotos originales) lo convierten en un caso practico para ensenar tecnicas de auditoria de robustez.
- Comparativa de backbones en un curso de redes neuronales: el repositorio documenta explicitamente los trials descartados (EfficientNet-B0 y MobileNetV3-Small), lo que permite discutir el compromiso entre precision y coste computacional con resultados reproducibles.
- Validacion de pipelines de preprocesado de imagenes: sirve para comprobar que una cadena de carga, redimensionado, recorte central y normalizacion ImageNet produce tensores correctos antes de escalar a un modelo mayor.
- Pruebas de integracion de extremo a extremo con la libreria `huggingface_hub`: el snippet de carga del repositorio es un ejemplo minimo de descarga, descompresion y carga de un predictor de AutoGluon, util para validar entornos de CI.
- Prototipado rapido en robotica movil o navegacion asistida en interiores: solo como prueba de concepto, nunca como componente de seguridad. La propia model card prohibe su uso para control de acceso o vigilancia.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas sobre los splits del propio dataset. El tamano de test es de 5 imagenes, de modo que un solo fallo supondria 20 puntos porcentuales de variacion.

| Split | Muestras | Accuracy | Balanced accuracy | F1 ponderado | F1 macro |
|---|---|---|---|---|---|
| Validacion publicada | 5 | 1.0000 | no disponible | 1.0000 | no disponible |
| Test publicado | 5 | 1.0000 (5/5) | 1.0000 | 1.0000 | 1.0000 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ImageNet, COCO) en la informacion disponible, algo coherente con la naturaleza academica y el alcance limitado del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para lotes pequenos. Cifra estimada a partir del tamano del repositorio (0.1 GB) y del backbone ResNet-18; la model card no publica mediciones.
- GPU recomendadas: cualquiera con al menos 4 GB de VRAM; el entrenamiento se realizo en una NVIDIA T4 de Google Colab.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente (GTX 1050 Ti en adelante, RTX 3060, RTX 4090). Tambien es viable la inferencia en CPU.
- Opciones de despliegue: AutoGluon MultiModal mediante `MultiModalPredictor.load` es la unica ruta documentada. No se publican artefactos compatibles con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un clasificador de imagenes.
- Latencia y throughput estimados: no disponibles. La model card solo indica el tiempo de busqueda (4 trials x 150 s) y el hardware de entrenamiento (T4, Python 3.13.15).

## Comparativa con modelos similares

La informacion disponible permite comparar con los tres trials descartados durante la busqueda de AutoGluon, que comparten exactamente el mismo dataset y protocolo de evaluacion.

| Configuracion | Backbone | Learning rate | Accuracy en test (n=5) | Estado | Licencia |
|---|---|---|---|---|---|
| `resnet18_lr1e-3` | ResNet-18 | 0.001 | 1.0000 | Seleccionada | MIT (repositorio) |
| `resnet18_lr4e-4` | ResNet-18 | 0.0004 | no disponible | Descartada en la busqueda | no disponible |
| `efficientnet_b0_lr4e-4` | EfficientNet-B0 | 0.0004 | no disponible | Descartada en la busqueda | no disponible |
| `mobilenetv3_small_lr4e-4` | MobileNetV3-Small | 0.0004 | no disponible | Descartada en la busqueda | no disponible |

Nota: los recuentos de parametros de estos backbones en sus implementaciones estandar son aproximadamente 11,7 M para ResNet-18, 5,3 M para EfficientNet-B0 y 2,5 M para MobileNetV3-Small. Son cifras generales de arquitectura y no estan verificadas ni publicadas en la model card de este repositorio. No se identifican alternativas publicadas comparables para la tarea especifica de deteccion de escaleras en la informacion disponible.

## Limitaciones y advertencias

- Los resultados de 1.0000 de accuracy se obtienen con 5 imagenes de validacion y 5 de test. No son estadisticamente significativos y no permiten extrapolar el comportamiento en produccion.
- Atajos de fondo: el entrenamiento parte de solo 32 fotografias originales, por lo que el modelo puede apoyarse en caracteristicas del escenario en lugar de en la geometria de las escaleras.
- Falsos positivos documentados: barandillas, sombras proyectadas y lineas del suelo se confunden con peldaños.
- Falsos negativos documentados: rotaciones que recortan el tramo de escaleras fuera del encuadre.
- Ausencia de variabilidad: el conjunto de validacion y test solo contiene originales sin aumentar, lo que reduce la cobertura de condiciones de iluminacion, encuadre y resolucion.
- Sin datos de sesgo por demografia, geografia o tipo de edificacion. La model card solo indica que el autor reviso las fotos en busca de rostros y datos personales.
- Uso prohibido por el propio autor para control de acceso a edificios o vigilancia. Cualquier aplicacion relacionada con seguridad fisica queda explicitamente descartada.
- Licencia MIT para el repositorio, pero las imagenes del dataset `ArinRoths/StairvsNonStair_Dataset` requieren atribucion a ArinRoths. Verifique la licencia del dataset antes de cualquier uso comercial.
- Modelo sin mantenimiento: 8 descargas, 0 likes y fecha de actualizacion identica a la de creacion. No hay garantias de soporte ni de correccion de errores.
- Formato de pesos propietario de AutoGluon, lo que dificulta la exportacion a otros runtimes y ata el despliegue a esa libreria.
- La model card declara que se uso Cursor como asistencia para alinear el cuaderno con la plantilla del instructor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/srivathsanb14/hw2-nn-automl-stairs
- Dataset de imagenes: https://huggingface.co/datasets/ArinRoths/StairvsNonStair_Dataset
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas de ayuda de YouTube sin relacion con el repositorio. No se dispone de paper, blog tecnico, repositorio de codigo ni demo adicionales.
