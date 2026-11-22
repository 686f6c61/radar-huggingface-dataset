# tablinum/CueBall-Voice-ONNX

## Resumen

CueBall Voice v0.3 FP32 ONNX es un modelo de síntesis de voz (text-to-speech) desarrollado por tablinum dentro del proyecto Rack Lab. Se distribuye como grafos ONNX en precisión FP32 para inferencia local en CPU mediante ONNX Runtime, e incluye dos variantes de vocoder: un HiFi-GAN V1 completo y un estudiante destilado de 256 canales. El modelo genera voz sintética en inglés a partir de texto con una única voz sintética y está pensado para investigación sobre síntesis continua y para despliegues ligeros en entornos sin GPU.

El paquete incluye grafos acústicos ONNX junto con los dos vocoders y depende de eSpeak para el frontend fonético. El repositorio ocupa aproximadamente 0,1 GB y la licencia es MIT, lo que facilita su integración en proyectos comerciales y de investigación. La relevancia actual radica en que ofrece una alternativa de TTS completamente local, sin dependencias de servicios en la nube, ejecutable en CPU con un consumo de recursos muy bajo.

La información pública disponible procede exclusivamente de la model card del autor y del listado de Hugging Face; no se han publicado detalles sobre la arquitectura interna del modelo acústico, el volumen de datos de entrenamiento ni los hiperparámetros de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafos acústicos ONNX con vocoder HiFi-GAN (V1 completo o estudiante destilado de 256 canales); arquitectura interna del modelo acústico no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa texto de entrada sin ventana declarada) |
| Tipos de cuantización | FP32 (grafos ONNX); la variante nativa usa pesos FP16 IR |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (FP32); la variante nativa usa FP16 IR y archivos BIN |
| Tamaño del vocoder completo (CPU) | 75.800.899 bytes (grafos ONNX FP32) |
| Tamaño del vocoder estudiante (CPU) | 34.319.280 bytes (grafos ONNX FP32) |
| Frontend fonético | eSpeak (dependencia externa) |
| Runtime | ONNX Runtime + NumPy |
| Repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo se distribuye como tres grafos ONNX que componen el pipeline acústico, acompañados de dos vocoders HiFi-GAN: una variante V1 completa y una variante estudiante destilada de 256 canales. La model card no detalla la arquitectura del modelo acústico (número de capas, dimensión oculta, mecanismo de atención ni tipo de decoder), por lo que esta información no está disponible. El frontend utiliza eSpeak para la conversión de texto a fonemas, lo que implica que la calidad de la síntesis depende parcialmente de la precisión del frontend fonético.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las técnicas de alineación empleadas. La model card menciona que el vocoder estudiante fue destilado a partir del V1 completo, pero no se especifican los detalles del proceso de destilación. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz en inglés a partir de texto con una única voz sintética.
- Dos modos de vocoder: HiFi-GAN V1 completo (mayor calidad) y estudiante destilado de 256 canales (mayor velocidad).
- Inferencia local en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Ejecución con un solo hilo intra-op de ONNX Runtime, lo que permite despliegues en entornos con recursos limitados.
- Dependencia de eSpeak para la fonemización del texto de entrada.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de clonación de voz ni de múltiples hablantes.

## Casos de uso

- Síntesis de voz en aplicaciones de escritorio sin conexión: el modelo puede generar audio WAV a partir de texto en máquinas sin GPU, usando ONNX Runtime y un único hilo, lo que lo hace adecuado para utilidades locales de lectura de texto.
- Investigación en síntesis continua: la model card indica explícitamente que las releases v0.3 están orientadas a investigación sobre síntesis continua, permitiendo comparar el vocoder completo frente al estudiante destilado en el mismo pipeline acústico.
- Pruebas de inteligibilidad en pipelines TTS: el conjunto de diez prompts en inglés y las métricas de word error con Whisper Tiny permiten reproducir la evaluación y comparar configuraciones.
- Generación de avisos y mensajes cortos: para prompts breves y predecibles, la variante estudiante ofrece una latencia baja (mediana de 0,790 s en CPU) adecuada para mensajes de sistema o notificaciones.
- Integración en sistemas embebidos o de bajo consumo: el tamaño reducido del estudiante (34,3 MB en grafos ONNX) y la ejecución en CPU permiten desplegarlo en dispositivos con recursos limitados.
- Evaluación comparativa de vocoders: el paquete incluye ambos vocoders con los mismos grafos acústicos, lo que facilita experimentos controlados sobre calidad frente a velocidad.
- Prototipado de asistentes de voz locales: combinado con un sistema de reconocimiento de voz y lógica de respuesta externos, puede servir como etapa de salida en un pipeline de voz a voz, tal como indica la model card.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y se basan en diez prompts en inglés evaluados con Whisper Tiny English como scorer de word error.

| Configuración | Formato | Huella del modelo (bytes) | Mediana residente | Word error (fresh-10) |
|---|---|---:|---:|---:|
| V1 completo en NCS1 original | Pesos FP16 IR | 37.873.150 | 10,517 s | 22/77 ediciones · 28,6 % |
| Estudiante en NCS1 original | Pesos FP16 IR | 17.132.414 | 3,343 s | 23/77 ediciones · 29,9 % |
| V1 completo en CPU | Grafos ONNX FP32 | 75.800.899 | 2,886 s | 17/77 ediciones · 22,1 % |
| Estudiante en CPU | Grafos ONNX FP32 | 34.319.280 | 0,790 s | 20/77 ediciones · 26,0 % |

Notas del autor: las cuatro ejecuciones usan los mismos diez prompts en inglés y el mismo scorer Whisper Tiny English congelado. Las ejecuciones en CPU se realizaron en un Intel Core i7-12650H con un hilo intra-op de ONNX Runtime. Los tiempos excluyen la configuración inicial y la escritura del WAV. El estudiante NCS1 alcanzó un factor de tiempo real mediano de 1,23 y una mejora de throughput de síntesis de 3,15× para esta carga secuencial. El vocoder estudiante evaluado solo con mel de referencia obtuvo 23/229 ediciones (10,0 %). El autor señala que ambas variantes nativas no alcanzaron los objetivos experimentales de menos del 14,8 % de word error y 300 ms de latencia en caliente.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU.
- GPU recomendadas: no aplica para esta release; la variante nativa NCS1 está pensada para hardware específico no detallado en la información disponible.
- Consumer GPU: no es necesaria; el modelo funciona en CPU.
- CPU de referencia en las mediciones: Intel Core i7-12650H con un hilo intra-op de ONNX Runtime.
- Opciones de despliegue: ONNX Runtime con NumPy; el script de inferencia incluido es `infer22.py` con los parámetros `--backend cpu`, `--vocoder full|student`, `--espeak-dir` y `--text`.
- Latencia: mediana de 2,886 s para el vocoder completo y 0,790 s para el estudiante en CPU (diez prompts, un hilo).
- Throughput: factor de tiempo real mediano de 1,23 para el estudiante NCS1.
- Dependencias: eSpeak (DLL y datos) para el frontend fonético.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos TTS en la información proporcionada, por lo que no es posible establecer una comparativa numérica fiable. A continuación se comparan las variantes del propio modelo:

| Modelo | Formato | Huella (bytes) | Mediana residente | Word error | Licencia |
|---|---|---:|---:|---:|---|
| CueBall Voice v0.3 V1 completo (CPU) | ONNX FP32 | 75.800.899 | 2,886 s | 22,1 % | MIT |
| CueBall Voice v0.3 estudiante (CPU) | ONNX FP32 | 34.319.280 | 0,790 s | 26,0 % | MIT |
| CueBall Voice v0.3 V1 completo (NCS1) | FP16 IR | 37.873.150 | 10,517 s | 28,6 % | MIT |
| CueBall Voice v0.3 estudiante (NCS1) | FP16 IR | 17.132.414 | 3,343 s | 29,9 % | MIT |

Comparativa con alternativas externas: no disponible.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- Una única voz sintética; no se documenta clonación ni selección de hablante.
- Calidad de inteligibilidad limitada: 22,1 % de word error en CPU para el vocoder completo y 26,0 % para el estudiante, por encima del objetivo experimental del 14,8 % fijado por el autor.
- El autor advierte que la prueba de diez prompts solo evalúa inteligibilidad; la naturalidad, textos más amplios, hablantes y idiomas requieren evaluación separada.
- Dependencia externa de eSpeak para la fonemización, lo que añade un componente fuera del paquete ONNX.
- No se documentan sesgos específicos, pero al ser un modelo de voz sintética en inglés puede reflejar sesgos del dataset de entrenamiento, cuyo contenido no se detalla.
- Riesgo de alucinación no aplica en el sentido de generación de texto libre, pero sí puede producir pronunciaciones incorrectas o artefactos acústicos en textos fuera del dominio evaluado.
- La licencia MIT permite uso comercial, pero debe verificarse el cumplimiento de las licencias de las dependencias (eSpeak, HiFi-GAN, ONNX Runtime) según los avisos de procedencia del repositorio.
- No se documentan garantías de latencia en producción más allá de las mediciones en un hardware concreto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/CueBall-Voice-ONNX
- Variante v0.3 Full NCS1: https://huggingface.co/tablinum/CueBall-Voice
- Variante v0.3 NCS1 Student: https://huggingface.co/tablinum/CueBall-Voice-NCS1-Student
- Variante v0.2 Resident: https://huggingface.co/tablinum/CueBall-Voice-v0.2-NCS1
- Variante v0.1 Original: https://huggingface.co/tablinum/CueBall-Voice-v0.1-NCS1
- Organización Rack Lab: https://huggingface.co/racklab
- Demo The Break Room: https://huggingface.co/spaces/tablinum/The-Break-Room
- Colección de la familia: https://huggingface.co/collections/tablinum/the-break-room-6b0227343f3237d2a8c08b7f
- Repositorio MyriadForge: https://github.com/chadstthomas-svg/myriadforge
