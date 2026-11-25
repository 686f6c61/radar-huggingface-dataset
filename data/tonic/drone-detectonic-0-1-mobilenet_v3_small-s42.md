# Tonic/drone-detectonic-0.1-mobilenet_v3_small-s42

## Resumen

El modelo `drone-detectonic-0.1-mobilenet_v3_small-s42`, publicado por el usuario Tonic en Hugging Face, es un clasificador acústico orientado a la detección de drones (C-UAS, contramedidas antiaéreas no tripuladas) dentro del marco del challenge 5 del Paris Hackathon 2026. Se distribuye como modelo ONNX para su ejecución con onnxruntime y emplea la arquitectura MobileNetV3-Small, una red convolucional ligera diseñada originalmente para visión pero reutilizada aquí sobre representaciones acústicas (probablemente espectrogramas) para clasificar audio de drones.

La relevancia del modelo es doble: por un lado, aborda un problema operativo real como es la detección temprana de UAV mediante sensores acústicos de bajo coste; por otro, su diseño compacto (MobileNetV3-Small) apunta a despliegue en dispositivos con recursos limitados, lo que encaja con escenarios de monitorización distribuida. No obstante, la información pública disponible es muy escasa: el repositorio aparece con 0 descargas, 0 likes, acceso restringido (gated) y sin pipeline declarado, lo que limita cualquier evaluación independiente.

No se dispone de datos sobre el volumen de parámetros, la longitud de contexto (no aplica a un clasificador), el dataset de entrenamiento ni métricas de rendimiento. La ficha se completa con los datos disponibles y se marca explícitamente como "no disponible" todo aquello que no puede verificarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (red convolucional ligera), exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación, no generativo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo acústico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecución con onnxruntime) |

## Arquitectura y entrenamiento

La arquitectura declarada en el nombre del modelo es MobileNetV3-Small, una CNN con bloques de convolución separable en profundidad, activaciones h-swish y módulos de atención squeeze-and-excitation, originalmente concebida para clasificación de imágenes en dispositivos móviles. En este caso se emplea como extractor y clasificador sobre entradas acústicas, presumiblemente espectrogramas de audio, para la tarea de detección de drones. El sufijo `s42` sugiere una semilla (seed) de entrenamiento 42, habitual en particiones reproducibles de datasets.

No se ha publicado información sobre el número de tokens o muestras de entrenamiento, la composición del dataset (grabaciones de campo, síntesis, aumentación de datos), ni si se aplicaron técnicas de ajuste fino o regularización específicas. Tampoco hay detalles sobre el preprocesado de audio (frecuencia de muestreo, tamaño de ventana, tipo de transformada). Todos estos datos se consideran no disponibles.

## Capacidades

- Clasificación acústica binaria o multiclase orientada a la detección de drones (presencia/ausencia y, posiblemente, tipología).
- Inferencia ligera mediante onnxruntime, apta para entornos con CPU y sin requisitos de GPU dedicada.
- Diseño compacto derivado de MobileNetV3-Small, pensado para despliegue en dispositivos de borde.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo multilingüe; opera sobre señales acústicas.
- No dispone de modo thinking ni capacidades de audio generativo.

## Casos de uso

- Detección perimetral de UAV en infraestructuras críticas: el modelo puede integrarse en nodos de sensores acústicos distribuidos alrededor de aeropuertos, subestaciones eléctricas o recintos penitenciarios para alertar de la presencia de drones mediante clasificación continua del audio ambiente.
- Monitorización de espacios protegidos y reservas naturales: al ser un modelo ligero exportado a ONNX, puede ejecutarse en dispositivos de bajo consumo alimentados por batería o panel solar, permitiendo una red de vigilancia acústica de bajo coste contra vuelos no autorizados.
- Complemento a sistemas de contramedidas (C-UAS): la clasificación acústica temprana sirve como primera etapa de un pipeline que active sensores RF o cámaras PTZ una vez detectado un dron, reduciendo el consumo y el coste de los sensores primarios.
- Investigación en el Paris Hackathon 2026 (challenge 5): el modelo sirve como línea base reproducible (semilla 42) para que otros equipos comparen sus aproximaciones de detección acústica de drones.
- Prototipado en sistemas embebidos: la combinación de MobileNetV3-Small y onnxruntime permite desplegar el clasificador en placas tipo Raspberry Pi o Jetson Nano para pruebas de concepto de vigilancia acústica.
- Análisis forense de grabaciones: clasificación por lotes de archivos de audio recogidos por sensores comunitarios para identificar episodios de vuelo de drones y correlacionarlos con otras fuentes de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de MobileNetV3-Small y ejecutarse con onnxruntime, es probable que la inferencia en CPU sea viable, pero no se confirma en la documentación.
- GPU recomendadas: no disponibles; el modelo está etiquetado para onnxruntime, lo que sugiere ejecución en CPU o aceleradores de borde.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño típico de MobileNetV3-Small, cabría esperar ejecución en cualquier GPU de consumo e incluso en CPU, pero no hay datos publicados.
- Opciones de despliegue: onnxruntime (declarado). No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tonic/drone-detectonic-0.1-mobilenet_v3_small-s42 | MobileNetV3-Small (ONNX) | Detección acústica de drones | Apache 2.0 | Gated en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la misma categoría (detección acústica de drones) dentro de la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la auditoría independiente.
- Ausencia de métricas: no se han publicado resultados de benchmarks, matrices de confusión ni curvas ROC/precisión-recall, por lo que no es posible evaluar su fiabilidad real.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, se desconocen sesgos respecto a tipos de dron, condiciones meteorológicas, ruido urbano o entornos rurales.
- Riesgo de falsos positivos y negativos: en un sistema de alerta C-UAS, los errores de clasificación pueden derivar en alarmas innecesarias o en detecciones perdidas con consecuencias operativas.
- Limitaciones de idioma: no aplica, pero el modelo no procesa texto ni voz humana.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se indique los cambios; aun así, el acceso gated puede imponer condiciones adicionales de uso.
- Caveat para producción: la falta de documentación sobre preprocesado de audio, frecuencia de muestreo y umbrales de decisión dificulta una integración fiable sin ingeniería inversa del modelo.
- Madurez: versión 0.1 con 0 descargas y 0 likes, publicada en noviembre de 2026; no hay evidencia de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tonic/drone-detectonic-0.1-mobilenet_v3_small-s42
- Tonic App (Francia): https://tonicapp.fr/
- Tonic Web: https://web.tonicapp.com/fr
- Boutique Tonic: https://boutiquetonic.com/
- ToNIC - Toulouse Neuro Imaging Center (Inserm): https://tonic.inserm.fr/
