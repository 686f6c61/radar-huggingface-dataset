# Tonic/drone-detectonic-0.1-shufflenet_v2_x0_5-s7

## Resumen

Drone-detectonic-0.1-shufflenet_v2_x0_5-s7 es un modelo de deteccion acustica de drones publicado en Hugging Face por el usuario Tonic. Por su identificador y sus etiquetas, se trata de un clasificador de audio orientado a la deteccion de sistemas aereos no tripulados (C-UAS, counter-UAS), entrenado en el contexto de un reto o hackathon (etiquetas `challenge-5` y `paris-hackathon-2026`). El sufijo del nombre indica que la red troncal es ShuffleNetV2 con factor de anchura 0,5 (`shufflenet_v2_x0_5`) y que la variante corresponde a la semilla o split 7 (`s7`).

El modelo se distribuye en formato ONNX y esta pensado para ejecutarse con onnxruntime, lo que sugiere un enfoque de inferencia ligera, probablemente sobre representaciones espectrales del audio (espectrogramas o mel-espectrogramas) tratadas como imagenes por una CNN de vision. ShuffleNetV2 x0.5 es una arquitectura convolucional de bajo coste computacional, coherente con un despliegue en dispositivos de borde o en sistemas de monitorizacion continua.

La relevancia del modelo es acotada: se trata de un artefacto de hackathon con cero descargas y cero likes en el momento de la consulta, acceso restringido (gated) y documentacion practicamente inexistente en la informacion disponible. No debe confundirse con la empresa medica Tonic App ni con otros resultados homonimos que aparecen en la busqueda web y que no guardan relacion con este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ShuffleNetV2 con factor de anchura 0,5 (inferido del nombre del modelo) |
| Parametros totales | no disponible (ShuffleNetV2 x0.5 tiene del orden de 1,4 M de parametros en su variante de clasificacion ImageNet; el valor exacto de este modelo no se ha publicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | no disponible (la entrada es audio, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

## Arquitectura y entrenamiento

La arquitectura declarada en el nombre es ShuffleNetV2 con factor de anchura 0,5, una red convolucional disenada para eficiencia computacional mediante convoluciones separables en profundidad y operaciones de channel shuffle. En el contexto de deteccion acustica de drones, el uso tipico de esta familia de redes consiste en convertir el audio en una representacion tiempo-frecuencia (espectrograma, mel-espectrograma o MFCC) y tratarla como una imagen de un solo canal o de pocos canales que alimenta la CNN.

No se dispone de informacion sobre el conjunto de datos de entrenamiento: numero de horas de audio, composicion (tipos de dron, condiciones de ruido, distancia, entornos urbanos o rurales), procedimiento de aumento de datos, ni si hubo validacion cruzada entre escenarios. Tampoco se documenta si el modelo realiza clasificacion binaria (dron / no dron) o multiclase (tipo de dron), ni cual es la ventana temporal de analisis. El sufijo `s7` sugiere una ejecucion concreta dentro de una busqueda de hiperparametros o un split de validacion, pero no hay confirmacion en la informacion disponible.

## Capacidades

- Deteccion acustica de drones a partir de senal de audio, presumiblemente mediante clasificacion de representaciones espectrales.
- Inferencia en formato ONNX con onnxruntime, lo que permite despliegue en CPU, GPU y entornos de borde.
- Modelo de muy bajo coste computacional por el uso de ShuffleNetV2 x0.5, adecuado para ejecucion en tiempo real sobre streams de audio.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No se ha documentado capacidad multilingue (no procesa lenguaje).
- No se ha documentado vision, audio generativo ni modos de pensamiento; la unica modalidad de entrada es audio.

## Casos de uso

- Monitorizacion perimetral en instalaciones criticas: el modelo puede integrarse en un pipeline que convierta audio de microfonos distribuidos en espectrogramas y clasifique la presencia de drones, aprovechando su bajo coste para ejecutarse en dispositivos de borde.
- Vigilancia de espacios aereos en eventos multitudinarios: al ser una CNN ligera en ONNX, puede desplegarse en nodos de bajo consumo para un primer filtrado que dispare alertas a sistemas C-UAS mas costosos.
- Deteccion temprana en entornos aeroportuarios o industriales: la clasificacion acustica permite complementar sensores radar o RF en escenarios donde estos tienen limitaciones de linea de vision.
- Investigacion en contramedidas C-UAS: el modelo sirve como linea base reproducible para comparar tecnicas de representacion espectral y aumento de datos en tareas de deteccion acustica.
- Despliegue en plataformas embebidas: la combinacion de ShuffleNetV2 x0.5 y ONNX facilita la ejecucion en Raspberry Pi, Jetson Nano o microcontroladores con aceleracion, siempre que se valide la latencia real.
- Prototipado en hackathons y retos de seguridad: sirve como componente de un sistema mayor (adquisicion de audio, preprocesado, clasificacion y alerta) para equipos que necesiten un clasificador preentrenado rapidamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por el tamano tipico de ShuffleNetV2 x0.5 (del orden de 1,4 M de parametros), la huella de memoria es de pocos megabytes en precision FP32, pero el dato exacto de este modelo no se ha publicado.
- GPU recomendadas: no disponible. Cualquier GPU con soporte de onnxruntime (por ejemplo, RTX 4090, A100, H100) puede ejecutarlo, pero no hay mediciones publicadas.
- Cabe en GPU de consumo: previsiblemente si, dado el reducido tamano de la arquitectura, aunque no hay confirmacion oficial ni cifras de latencia.
- Opciones de despliegue: onnxruntime (CPU o GPU), con posibilidad de conversion a otros runtimes ONNX compatibles; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de audio de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tonic/drone-detectonic-0.1-shufflenet_v2_x0_5-s7 | ShuffleNetV2 x0.5 (CNN) | no disponible (aprox. 1,4 M en la variante estandar) | Audio representado como espectrograma | Apache 2.0 | Gated en Hugging Face |
| ShuffleNetV2 x0.5 (ImageNet, referencia) | CNN | aprox. 1,4 M | Imagenes 224x224 | BSD / segun implementacion | Publica en torchvision y otros repositorios |
| YAMNet (Google) | MobileNetV1 | aprox. 3,7 M | Audio 16 kHz, ventanas de 0,975 s | Apache 2.0 | Publica en TensorFlow Hub |
| PANNs (CNN14 y variantes) | CNN sobre mel-espectrogramas | 80 M (CNN14) | Audio de distinta duracion | Apache 2.0 | Publica en GitHub y Zenodo |

La comparacion con modelos genericos de clasificacion de audio es orientativa: no hay datos publicados de rendimiento de este modelo que permitan una comparacion cuantitativa con YAMNet o PANNs en tareas de deteccion de drones.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no se especifican datos de entrenamiento, metricas, umbrales de decision ni caracteristicas exactas de la entrada, lo que dificulta la reproducibilidad.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que anade friccion a la evaluacion.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Riesgo de sobreajuste al escenario del hackathon: sin informacion sobre la diversidad de condiciones acusticas, es probable que el rendimiento se degrade fuera del entorno de entrenamiento.
- Riesgo de falsos positivos y negativos en entornos con ruido urbano, trafico, helicopteros u otras fuentes con firma espectral similar.
- No hay informacion sobre sesgos por tipo de dron, distancia, orientacion o condiciones meteorologicas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion tecnica traslada al integrador toda la responsabilidad de validacion.
- No apto como unico sistema de seguridad: cualquier aplicacion C-UAS en produccion requiere validacion independiente, redundancia de sensores y cumplimiento normativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tonic/drone-detectonic-0.1-shufflenet_v2_x0_5-s7
- Perfil del autor en Hugging Face: https://huggingface.co/Tonic
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- onnxruntime: https://onnxruntime.ai/
- ShuffleNetV2 (paper original): https://arxiv.org/abs/1807.11164
- YAMNet (TensorFlow Hub): https://tfhub.dev/google/yamnet/1
- PANNs (repositorio): https://github.com/qiuqiangkong/audioset_tagging_cnn

Nota: los resultados de busqueda web proporcionados (Tonic App, Tonic Web, Boutique Tonic, ToNIC) no guardan relacion con este modelo y se han descartado como fuentes.
