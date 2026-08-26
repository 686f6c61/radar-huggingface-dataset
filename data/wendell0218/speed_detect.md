# wendell0218/speed_detect

## Resumen

Speed Detect es un clasificador de velocidad de movimiento en video desarrollado por Wendong Bu (wendell0218), que utiliza una arquitectura R3D-18 (ResNet 3D con 18 capas) de torchvision para categorizar clips de video en tres clases: `slow`, `normal` y `fast`. El modelo no lee la velocidad de reproduccion del reproductor ni genera una tasa exacta como `0.5x` o `2x`, sino que analiza el movimiento aparente en los fotogramas para emitir una puntuacion de probabilidad para cada categoria.

El repositorio incluye scripts completos de inferencia y entrenamiento, un checkpoint preentrenado de aproximadamente 380 MiB, y una pipeline de smoke test con un video sintetico de ejemplo. La relevancia de este modelo radica en su enfoque practico para el analisis de velocidad en video sin necesidad de etiquetado manual extenso, ya que el entrenamiento se basa en la sintetizacion online de velocidades mediante re-muestreo temporal. El modelo esta pensado para integrarse en pipelines de procesamiento de video donde se necesite una estimacion rapida y ligera de la velocidad de movimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | R3D-18 (ResNet 3D, 18 capas) de torchvision |
| Parametros totales | no disponible (checkpoint de ~380 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa clips de 16 fotogramas a 16 FPS, resolucion 112x112) |
| Tipos de cuantizacion | no disponible (checkpoint en precision completa) |
| Idiomas soportados | no disponible (modelo de vision, sin componente de lenguaje) |
| Licencia | no disponible (el autor indica que no se ha anadido licencia de distribucion) |
| Formato de pesos | PyTorch checkpoint (.pt), compatible con `torch.load(weights_only=True)` |

## Arquitectura y entrenamiento

El modelo utiliza R3D-18, una variante tridimensional de ResNet-18 implementada en torchvision, disenada para clasificacion de video. La entrada consiste en clips de 16 fotogramas a 16 FPS con resolucion espacial de 112x112 píxeles. El entrenamiento se realiza con sintetizacion online de velocidades: los clips se re-muestrean temporalmente a factores de 0.50, 0.67, 0.75 (slow), 1.00 (normal) y 1.50, 2.00, 2.50 (fast), lo que permite generar datos de entrenamiento a partir de videos sin etiquetar. Para cubrir la tasa mas rapida (2.5x), se requieren al menos 40 fotogramas por video fuente.

El script de entrenamiento soporta inicializacion desde checkpoint propio, desde pesos preentrenados en Kinetics-400, o desde cero. Tambien incorpora un mecanismo de hard labels: un archivo JSONL opcional con etiquetas confirmadas por humanos que se muestrean con probabilidad configurable (`HARD_PROB`, por defecto 0.65). El entrenamiento incluye soporte para resume completo (optimizador, scaler, epoch, learning rate) y utiliza mixed precision. El checkpoint se guarda en formato `.pt` y el mejor modelo se selecciona segun una ordenacion combinada de precision en hard labels y validacion.

## Capacidades

- Clasificacion de velocidad de movimiento en video en tres categorias: slow, normal y fast, con puntuaciones de probabilidad por clase.
- Inferencia por lotes sobre archivos JSONL de metadatos, con soporte para procesamiento distribuido mediante sharding estable por nombre de muestra.
- Deteccion y salto automatico de registros ya procesados (campo `speed_scores` existente), con opcion de forzar recalculado (`FORCE=1`).
- Registro de fallos de procesamiento en directorio dedicado (`speed_detect_logs/`).
- Entrenamiento con sintetizacion online de velocidades, sin necesidad de etiquetas manuales para el conjunto principal.
- Soporte de hard labels opcionales para refinar el modelo con datos confirmados por humanos.
- Inicializacion desde pesos preentrenados en Kinetics-400.
- Resume completo del estado de entrenamiento (optimizador, scaler, epoch, learning rate).
- Ejecucion en CPU o GPU (CUDA), con configuracion de workers y batch size.

## Casos de uso

- Moderacion de contenido en plataformas de video: el modelo puede clasificar automaticamente clips como lentos, normales o rapidos, lo que permite priorizar la revision humana de contenido con movimiento acelerado (potencialmente problematico) o detectar anomalias en la velocidad de reproduccion.
- Analisis deportivo: en retransmisiones o videos de entrenamiento, el clasificador puede segmentar secuencias por intensidad de movimiento (jugadas lentas vs. rapidas), facilitando el etiquetado automatico de momentos clave para su posterior analisis tactico.
- Vigilancia y seguridad: en sistemas de camaras, el modelo puede identificar eventos con movimiento anomalo (por ejemplo, carreras o desplazamientos rapidos en zonas restringidas) y generar alertas en tiempo real, integrándose en pipelines de vision por computador existentes.
- Curacion de datasets de video: antes de entrenar otros modelos, Speed Detect puede filtrar o balancear datasets por velocidad de movimiento, mejorando la calidad de los datos de entrenamiento para tareas como reconocimiento de acciones o seguimiento de objetos.
- Asistencia en edicion de video: el clasificador puede ayudar a editores a localizar segmentos con ritmo visual especifico (lento para dramatismo, rapido para accion) dentro de largas grabaciones, reduciendo el tiempo de visionado manual.
- Pipeline de preprocesado en produccion: al ser un modelo ligero (R3D-18, 16 fotogramas a 112x112), puede ejecutarse en GPU de consumo para anotar grandes volumenes de video antes de su almacenamiento o indexacion, generando metadatos de velocidad que enriquecen busquedas y recomendaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye unicamente un smoke test de pipeline (no una evaluacion de precision) que verifica el flujo completo de decode, forward, backward, optimizacion y guardado de checkpoints. No hay datos comparativos con otros modelos de clasificacion de video.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa ~380 MiB, y la entrada es de 16 fotogramas a 112x112. Con batch size 8, la VRAM estimada es inferior a 2 GB, por lo que cabe en cualquier GPU moderna, incluidas las de gama de entrada.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o mas (RTX 3060, RTX 3070, etc.) dado el batch size por defecto de 16.
- Compatibilidad con GPU de consumo: si, el modelo es ligero y puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o incluso en CPU (aunque con mayor latencia).
- Opciones de despliegue: el repositorio proporciona scripts de inferencia y entrenamiento en PyTorch nativo. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. Para produccion, se puede servir mediante TorchServe o exportar a ONNX/TensorRT.
- Latencia y throughput: no disponible. Dado el tamano del modelo y la entrada pequena, se espera una latencia de decenas de milisegundos por clip en GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Speed Detect (este) | R3D-18 | ~33M (estimado) | 16 frames, 112x112 | no disponible | Hugging Face |
| X3D-M | X3D (expandido) | ~3.8M | 13 frames, 160x160 | CC-BY-4.0 (Kinetics-400) | PyTorch Hub, Hugging Face |
| SlowFast R50 | SlowFast | ~34M | 32+4 frames, 224x224 | CC-BY-4.0 (Kinetics-400) | PyTorch Hub, Hugging Face |

La comparativa se basa en arquitecturas similares de clasificacion de video disponibles en ecosistemas PyTorch. X3D-M es mas ligero pero con menor capacidad; SlowFast R50 es mas pesado y preciso pero requiere mas recursos. Speed Detect se distingue por su enfoque especifico en velocidad de movimiento y su pipeline de entrenamiento con sintetizacion online, aunque carece de licencia explicita y de datos de rendimiento publicados.

## Limitaciones y advertencias

- No se ha publicado licencia para el modelo ni para el checkpoint. El autor indica que no se ha anadido licencia de distribucion y advierte que la redistribucion publica requiere confirmar el alcance de la autorizacion. Esto impide su uso comercial sin riesgo legal.
- El modelo clasifica la velocidad aparente del movimiento en la imagen, no la velocidad de reproduccion del archivo. No debe usarse para detectar reproduccion acelerada o ralentizada en reproductores.
- No se proporcionan datos de precision, benchmarks ni evaluacion en datasets estandar como Kinetics-400 o UCF101. El smoke test incluido no valida el rendimiento real.
- El entrenamiento se basa en sintetizacion online de velocidades, lo que puede generar dependencia de las caracteristicas del dataset original y limitar la generalizacion a videos con condiciones muy diferentes (iluminacion, camara en movimiento, etc.).
- El modelo solo soporta tres clases discretas (slow, normal, fast) y no proporciona una estimacion continua de la velocidad.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de idioma, al ser un modelo de vision sin componente textual.
- El repositorio no incluye el dataset de entrenamiento original, solo un video sintetico de ejemplo. La reproduccion del entrenamiento requiere datos propios.
- Para produccion, se recomienda validar el modelo con datos reales del dominio de aplicacion antes de desplegarlo, dado que no hay metricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wendell0218/speed_detect
- Perfil del autor en Hugging Face: https://huggingface.co/wendell0218
- Perfil del autor en GitHub: https://github.com/wendell0218
- Script de inferencia en GitHub: https://github.com/wendell0218/pipe/blob/main/compose_motion_example/3_speed_detect.py
