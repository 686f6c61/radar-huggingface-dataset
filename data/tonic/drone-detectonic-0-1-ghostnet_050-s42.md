# Tonic/drone-detectonic-0.1-ghostnet_050-s42

## Resumen

`drone-detectonic-0.1-ghostnet_050-s42` es un modelo de deteccion acustica de drones publicado por el usuario Tonic en Hugging Face. Por sus etiquetas (`acoustic-wake`, `c-uas`, `drone-detection`, `challenge-5`, `paris-hackathon-2026`), se trata de un clasificador de audio orientado a la deteccion de UAV (aeronaves no tripuladas) a partir de senales acusticas, enmarcado en un reto de un hackathon celebrado en Paris en 2026. El sufijo `ghostnet_050` sugiere que el backbone es GhostNet con factor de anchura 0,5, y `s42` apunta a una semilla de entrenamiento concreta.

El modelo se distribuye en formato ONNX y esta pensado para ejecutarse con `onnxruntime`, lo que lo orienta a inferencia ligera, potencialmente en dispositivos de borde o sistemas de contramedidas de bajo coste. No es un modelo de lenguaje: no genera texto ni mantiene conversaciones, sino que emite una prediccion de clasificacion sobre ventanas de audio.

La relevancia actual del modelo radica en su aplicacion a la deteccion de drones (C-UAS, counter-UAS) mediante audio, un dominio donde los sensores acusticos complementan a radar y vision por su bajo coste y su capacidad de operar en entornos urbanos. No obstante, la informacion publica disponible es muy escasa: el repositorio no expone pipeline, idiomas, tamano efectivo de pesos ni metricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional de clasificacion de audio; el nombre sugiere backbone GhostNet con factor de anchura 0,5 (no confirmado en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecutable con `onnxruntime`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura con detalle. Las etiquetas y el nombre del repositorio indican una red convolucional de clasificacion de audio, probablemente alimentada con representaciones tiempo-frecuencia (mel-espectrogramas u otras) de ventanas acusticas, y con GhostNet-0.5 como extractor de caracteristicas. El sufijo `s42` sugiere una ejecucion con semilla 42, lo que apunta a un entrenamiento reproducible dentro de un pipeline experimental.

No se especifican el numero de tokens o muestras de entrenamiento, la composicion del dataset, el esquema de etiquetado (binario dron/no dron u otras clases), ni si se aplicaron tecnicas de aumento de datos, destilacion o ajuste fino. Tampoco hay informacion sobre el preprocesado de audio (frecuencia de muestreo, duracion de ventana, numero de bandas mel) ni sobre el regimen de entrenamiento (epocas, optimizador, funcion de perdida). Todos estos datos deben considerarse no disponibles.

## Capacidades

- Clasificacion acustica de audio orientada a la deteccion de drones (presencia/ausencia u otras clases definidas en el reto, no detalladas).
- Inferencia en formato ONNX mediante `onnxruntime`, lo que facilita el despliegue en CPU, GPU y entornos embebidos.
- Modelo ligero por construccion (backbone GhostNet con anchura 0,5), adecuado para ejecucion en tiempo real o cuasi real sobre streams de audio.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision ni audio generativo; su unica salida es una prediccion de clasificacion.

## Casos de uso

- Deteccion de intrusiones de drones en recintos sensibles: el modelo se integraria en un nodo de microfonos que procesa ventanas de audio en continuo y emite alertas cuando detecta firma acustica de UAV, complementando radar y camaras en un sistema C-UAS.
- Vigilancia perimetral en infraestructuras criticas: aeropuertos, subestaciones electricas o plantas industriales podrian desplegar matrices de microfonos de bajo coste con inferencia ONNX local, reduciendo la dependencia de enlaces de red.
- Monitorizacion urbana de ruido y trafico aereo no tripulado: el modelo puede filtrar eventos acusticos anomales en entornos densos donde la vision queda bloqueada por edificios.
- Investigacion en contramedidas acusticas: sirve como linea base reproducible (semilla fija `s42`) para comparar tecnicas de preprocesado, aumentos de datos o arquitecturas alternativas en deteccion de drones.
- Despliegue en dispositivos de borde: al ser ONNX y un backbone GhostNet-0.5, puede ejecutarse en placas tipo Raspberry Pi o SoC con NPU, habilitando sensores autonomos de bajo consumo.
- Prototipado rapido en hackathons y retos: el formato ONNX y la licencia Apache 2.0 permiten integrarlo en demos y pipelines de evaluacion sin friccion legal.
- Evaluacion comparativa de clasificadores acusticos: util como referencia de un modelo convolucional ligero frente a enfoques basados en transformers de audio o modelos clasicos de machine learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por el backbone GhostNet-0.5, se espera un modelo de pocos millones de parametros, pero el repositorio no confirma el tamano efectivo de los pesos.
- GPU recomendadas: no disponibles. Cualquier GPU con soporte CUDA para `onnxruntime` deberia bastar; tambien es viable la inferencia en CPU.
- Compatibilidad con GPU de consumo: probable en RTX 3060, RTX 4060, RTX 4090 y similares, dado el caracter ligero del backbone, aunque no hay confirmacion oficial.
- Opciones de despliegue: `onnxruntime` (CPU y GPU), `onnxruntime-web` para navegador, y potencialmente `onnxruntime` movil o embebido. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de deteccion acustica de drones ni metricas que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no esta disponible en la informacion proporcionada: se desconocen dataset, preprocesado, clases y metricas, lo que impide validar su rendimiento real.
- Riesgo de falsos positivos y negativos en entornos con ruido acustico (trafico, obras, otras aeronaves), sin datos publicados sobre tasas de error.
- Posible sobreajuste al dominio acustico del dataset del hackathon (condiciones de grabacion, microfonos y ubicacion geografica concretas), con degradacion esperada al cambiar de escenario.
- El acceso al repositorio esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que anade friccion a la reproducibilidad.
- Aunque la licencia es Apache 2.0, conviene revisar los terminos del reto y del dataset subyacente antes de un uso comercial, ya que pueden imponer restricciones adicionales.
- No apto para decisiones criticas de seguridad sin validacion en campo y sin un sistema de redundancia (radar, vision, operadores humanos).
- El sufijo `s42` sugiere una unica semilla de entrenamiento; no hay informacion sobre variabilidad entre semillas ni sobre robustez estadistica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tonic/drone-detectonic-0.1-ghostnet_050-s42
- Tonic App (posible entidad autora, no confirmada): https://tonicapp.fr/
- Tonic Web: https://web.tonicapp.com/fr
- Boutique Tonic (no relacionada con el modelo): https://boutiquetonic.com/
- ToNIC - Toulouse Neuro Imaging Center (no relacionado con el modelo): https://tonic.inserm.fr/
