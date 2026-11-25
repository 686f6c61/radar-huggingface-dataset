# Tonic/drone-detectonic-0.1-ghostnet_050-s7

## Resumen

`Tonic/drone-detectonic-0.1-ghostnet_050-s7` es un modelo de deteccion acustica de drones publicado en Hugging Face por el usuario Tonic. Por los tags del repositorio (`acoustic-wake`, `c-uas`, `drone-detection`, `challenge-5`, `paris-hackathon-2026`), se trata de un artefacto orientado a la deteccion de sistemas aereos no tripulados (C-UAS, *counter-unmanned aerial systems*) a partir de senal acustica, presumiblemente desarrollado en el contexto de un hackathon celebrado en Paris en 2026.

El nombre del repositorio sugiere que el modelo emplea una arquitectura GhostNet con factor de ancho 0.5 (`ghostnet_050`) y una variante o semilla identificada como `s7`. GhostNet es una familia de redes convolucionales ligeras disenadas para eficiencia computacional en dispositivos con recursos limitados, lo que encaja con un caso de uso de deteccion en tiempo real sobre senal de audio. El artefacto se distribuye en formato ONNX y esta pensado para ejecutarse con ONNX Runtime.

La informacion publica disponible es muy escasa: el repositorio no incluye pipeline declarado, no especifica idiomas ni parametros, y el acceso esta restringido (gated), requiriendo aceptar condiciones en Hugging Face. No se han publicado resultados de benchmarks ni documentacion tecnica accesible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GhostNet (factor de ancho 0.5, segun nomenclatura `ghostnet_050`); red convolucional ligera |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecucion con ONNX Runtime) |

## Arquitectura y entrenamiento

La nomenclatura del repositorio apunta a GhostNet con factor de ancho 0.5. GhostNet es una arquitectura de red neuronal convolucional que introduce los llamados *ghost modules*: operaciones convolucionales de bajo coste que generan mapas de caracteristicas "fantasma" a partir de convoluciones baratas, reduciendo el coste computacional frente a convoluciones estandar. El sufijo `050` indica un factor de ancho de 0.5, es decir, aproximadamente la mitad de canales que la variante base, lo que reduce aun mas el numero de parametros y FLOPs.

El modelo se distribuye como grafo ONNX para inferencia con ONNX Runtime, lo que sugiere un objetivo de despliegue en produccion o en dispositivos con recursos limitados. Sin embargo, no se dispone de informacion sobre el dataset de entrenamiento, el numero de muestras, la composicion de las clases, el preprocesado de audio (tipo de espectrograma, frecuencia de muestreo, tamano de ventana) ni sobre si se aplicaron tecnicas de aumento de datos o regularizacion. Tampoco se documenta el proceso de validacion ni el esquema de particion train/validation/test. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Deteccion acustica de drones: el modelo esta disenado para identificar la presencia de sistemas aereos no tripulados a partir de senal de audio, segun los tags `drone-detection`, `acoustic-wake` y `c-uas`.
- Clasificacion binaria o multiclase sobre audio: por el contexto de un reto de deteccion, se espera que produzca una salida de clasificacion (dron presente / ausente) o puntuaciones por clase, aunque el numero exacto de clases no esta documentado.
- Inferencia via ONNX Runtime: el formato ONNX permite ejecucion en CPU y GPU con distintos proveedores de ejecucion (CUDA, TensorRT, OpenVINO, etc.), aunque las combinaciones validadas no se especifican.
- Modelo ligero: el factor de ancho 0.5 de GhostNet sugiere un perfil de inferencia de baja latencia apto para procesamiento en tiempo real o en dispositivos embebidos.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni multilingues, ya que no es un modelo de lenguaje.

## Casos de uso

- Vigilancia perimetral con microfonos: desplegar el modelo sobre una red de sensores acusticos distribuidos para detectar la aproximacion de drones a infraestructuras criticas (aeropuertos, plantas industriales, recintos penitenciarios). La arquitectura ligera permite ejecutar la inferencia en el propio nodo sensor.
- Monitorizacion de espacios urbanos: integrar el modelo en plataformas de seguridad municipal que analicen audio ambiental para alertar de vuelos no autorizados, aprovechando su bajo coste computacional para procesar multiples flujos de audio en paralelo.
- Proteccion de eventos multitudinarios: complementar sistemas de contramedidas C-UAS con una capa de deteccion acustica temprana que active protocolos de verificacion optica o radar cuando se detecte una firma acustica compatible con un dron.
- Investigacion en bioacustica y ruido ambiental: usar el modelo como extractor de caracteristicas o clasificador base para estudiar la presencia de drones en grabaciones de campo, sirviendo de punto de partida para ajuste fino con datos propios.
- Despliegue en dispositivos embebidos: al ser un modelo ONNX de una GhostNet con ancho 0.5, puede integrarse en hardware de borde (Raspberry Pi, Jetson Nano, microcontroladores con acelerador) para aplicaciones de deteccion autonoma sin conectividad a la nube.
- Reproduccion de retos y benchmarking: el repositorio, etiquetado como `challenge-5` y `paris-hackathon-2026`, puede emplearse como referencia o linea base en competiciones de deteccion acustica de drones, permitiendo a otros equipos comparar sus aproximaciones.
- Formacion y docencia: servir como ejemplo practico de pipeline completo (preprocesado de audio, red convolucional ligera, exportacion ONNX) en cursos de aprendizaje profundo aplicado a senal acustica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una GhostNet con factor de ancho 0.5, el modelo es presumiblemente muy pequeno (del orden de pocos millones de parametros), pero no se confirma el tamano exacto ni el consumo de memoria.
- GPU recomendadas: no disponible. Por el perfil de la arquitectura, cabria esperar ejecucion viable en GPU de consumo (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU, pero no hay validacion publicada.
- Cabe en GPU de consumo: probablemente si, dado el diseno ligero de GhostNet, aunque no se dispone de confirmacion oficial.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, OpenVINO), con posibilidad de conversion a otros runtimes. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de deteccion acustica de drones ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated; es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar la reproducibilidad y el uso inmediato.
- Documentacion inexistente: no se publican detalles sobre el dataset, el preprocesado de audio, las clases de salida ni el esquema de evaluacion, lo que dificulta validar el modelo o reutilizarlo correctamente.
- Riesgo de falsos positivos y negativos: en deteccion acustica, ruidos ambientales (trafico, obras, fauna, aeronaves tripuladas) pueden confundirse con firmas de dron; sin datos de evaluacion no es posible cuantificar este riesgo.
- Sesgo de dominio: al proceder de un hackathon, el modelo probablemente se entreno con un conjunto de datos limitado y en condiciones acusticas especificas; su generalizacion a otros entornos, modelos de dron o condiciones meteorologicas es desconocida.
- Limitaciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero el acceso gated puede imponer condiciones adicionales que deben revisarse antes de un despliegue en produccion.
- Uso dual: la deteccion de drones tiene aplicaciones de seguridad y privacidad; su despliegue debe cumplir la normativa local sobre vigilancia acustica y proteccion de datos.
- Ausencia de benchmarks: no hay evidencia publica de precision, recall, AUC ni latencia, por lo que no se recomienda su uso en produccion sin una evaluacion propia sobre datos representativos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tonic/drone-detectonic-0.1-ghostnet_050-s7
- Tonic App (posible entidad relacionada, no confirmada): https://tonicapp.fr/
- Tonic Web: https://web.tonicapp.com/fr
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales asociados al modelo en la busqueda web realizada.
