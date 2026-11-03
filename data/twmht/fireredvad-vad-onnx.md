# twmht/FireRedVAD-VAD-onnx

## Resumen

FireRedVAD-VAD-onnx es una exportación no oficial a formato ONNX del modelo de detección de actividad de voz (VAD) no streaming perteneciente a la familia FireRedVAD, desarrollada originalmente por FireRedTeam. El trabajo de exportación lo firma el usuario twmht y su objetivo es permitir la inferencia del detector de voz sin depender de PyTorch, empleando únicamente ONNX Runtime. El modelo base resuelve la tarea de segmentar audio en tramos de voz y silencio, un componente fundamental en pipelines de reconocimiento automático del habla, diarización y asistentes conversacionales.

Se trata de un modelo muy compacto (0,59 millones de parámetros, 2,4 MB en float32) que procesa características log-mel de Kaldi de 80 bins y emite una probabilidad de voz por cada trama de 10 ms. La exportación incluye tanto los pesos en float32 como una variante en float16, además de las estadísticas de normalización (cmvn.ark) y el post-procesador original. Su relevancia actual radica en que elimina la dependencia de PyTorch en producción, reduce el tamaño del despliegue y acelera la inferencia entre 1,25 y 2,2 veces según las mediciones del autor.

El modelo es no streaming: consume la señal completa (o fragmentos de hasta 30.000 tramas, es decir, 300 segundos) y devuelve las probabilidades para todas las tramas de una vez. Está pensado para idiomas chino e inglés según los metadatos, aunque un VAD acústico de este tipo es en gran medida independiente del idioma. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal para VAD (detalles internos no disponibles); entrada log-mel de 80 bins, salida de probabilidad por trama |
| Parámetros totales | 0,59 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; procesa hasta 30.000 tramas (300 s) por fragmento, con troceado para audio más largo |
| Tipos de cuantización | float32 y float16 (pesos); entrada y salida siempre float32 |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17); float32 de 2,4 MB y float16 de 1,2 MB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red más allá de su interfaz: recibe un tensor `feat` de forma `[batch, T, 80]` correspondiente a un filtro bancario log-mel de Kaldi (ventana de 25 ms, desplazamiento de 10 ms, sin dither, `snip_edges=True`, muestras en escala int16) normalizado con las estadísticas de `cmvn.ark`, y produce `probs` de forma `[batch, T, 1]` con la probabilidad de voz por trama tras aplicar sigmoide. El modelo es no streaming y ve toda la entrada de una vez; el código original trocea entradas de más de 30.000 tramas.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, algo por otra parte poco habitual en un detector de voz. La exportación a ONNX conserva los pesos originales en float32 y genera una variante float16 mediante `onnxconverter_common.float16.convert_float_to_float16` con `keep_io_types=True`. El post-procesador original (suavizado, umbral, longitudes mínimas y máximas) se incluye sin cambios y aplica por defecto una ventana de suavizado de 5, umbral de 0,4, mínimo de voz de 20 tramas, mínimo de silencio de 20 tramas y máximo de voz de 2000 tramas.

## Capacidades

- Detección de actividad de voz (VAD) sobre audio de 16 kHz, 16 bits, mono.
- Salida de probabilidad de voz por trama de 10 ms, lista para post-procesado en segmentos.
- Procesamiento por lotes (`batch` dinámico) y longitud temporal dinámica (`T`).
- Manejo de audio largo mediante troceado interno en fragmentos de 300 s.
- Inferencia sin PyTorch, únicamente con ONNX Runtime (CPU o CUDA).
- Variante float16 para acelerar en GPU manteniendo entrada y salida en float32.
- No incluye detección de eventos de audio (AED) ni VAD en streaming; solo el VAD no streaming.
- No dispone de tool calling, capacidades de agente, visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Preprocesado de ASR: eliminar silencios antes de transcribir con Whisper u otros modelos, reduciendo coste computacional y evitando alucinaciones en tramos sin voz. El modelo entrega directamente los intervalos de voz con resolución de 10 ms.
- Diarización de hablantes: segmentar la señal en turnos de voz para alimentar un modelo de embeddings de hablante, aprovechando que el VAD es ligero y puede ejecutarse en CPU junto al resto del pipeline.
- Atención al cliente y grabaciones de call center: detectar automáticamente los tramos con intervención humana frente a música de espera o ruido de fondo, con procesamiento de audio de hasta una hora en pocos segundos (1,7 s en CPU con 4 hilos según las mediciones del autor).
- Asistentes de voz en dispositivos: al ocupar 2,4 MB en float32 y 1,2 MB en float16, puede integrarse en entornos embebidos o de borde con ONNX Runtime, activando la captura solo cuando hay voz.
- Moderación y análisis de contenido audiovisual: filtrar segmentos sin habla en grandes volúmenes de vídeo o pódcast antes de aplicar modelos más costosos de transcripción o análisis semántico.
- Pipelines de subtitulado automático: alinear y recortar subtítulos a los límites reales de voz, mejorando la sincronización gracias a la granularidad de 10 ms por trama.
- Investigación en procesamiento de voz: servir como referencia reproducible en ONNX para comparar exportaciones o validar implementaciones sin depender de PyTorch.

## Benchmarks y rendimiento

El autor no ha re-ejecutado el benchmark original (FLEURS-VAD-102); la model card del modelo base reporta un F1 de 97,57 % para este VAD, y el autor indica que, al ser las salidas numéricamente equivalentes, el resultado debería mantenerse, aunque no lo verificó. Los datos de verificación y velocidad medidos son los siguientes:

| Prueba | Resultado |
|---|---|
| Diferencia máxima de probabilidad vs. PyTorch (features aleatorias, 1 a 30.000 tramas) | 7,2e-7 |
| Segmentos idénticos vs. PyTorch (9 archivos: 8 de 2-12 s y uno de 299 s) | 9/9 |
| Velocidad, 1 hilo, 60 s de audio: PyTorch → ONNX Runtime | 232 → 162 ms (extremo a extremo) |
| Velocidad, 4 hilos, 60 s de audio: PyTorch → ONNX Runtime | 116 → 101 ms (extremo a extremo) |
| Velocidad, 1 hilo, 1 h de audio: PyTorch → ONNX Runtime | 14,2 → 10,5 s (extremo a extremo) |
| Velocidad, 4 hilos, 1 h de audio: PyTorch → ONNX Runtime | 8,3 → 7,0 s (extremo a extremo) |
| Modelo solo, ONNX Runtime vs. PyTorch | 1,25 a 2,2 veces más rápido |

Comparativa float32 frente a float16 (RTX 4090, onnxruntime-gpu 1.23.2, modelo solo sin extracción de características):

| Ejecución | Diferencia máx. de probabilidad | Segmentos idénticos | 60 s de audio | 1 h de audio |
|---|---:|---:|---:|---:|
| ONNX Runtime CPU, float32 | 2,4e-7 | 9/9 | 30 ms | 1735 ms |
| ONNX Runtime CPU, float16 | 5,0e-4 | 9/9 | 64 ms | 1721 ms |
| ONNX Runtime CUDA, float32 (TF32 activo) | 1,6e-3 | 9/9 | 3,8 ms | 157 ms |
| ONNX Runtime CUDA, float16 | 1,6e-3 | 9/9 | 1,8 ms | 126 ms |

## Requisitos de hardware

- VRAM estimada: prácticamente despreciable; el modelo float32 ocupa 2,4 MB y el float16 1,2 MB, por lo que cabe en cualquier GPU, incluida una RTX 4090 o incluso iGPU.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime CUDA; el autor midió en una RTX 4090. En GPU el modelo tarda 3,8 ms (float32) o 1,8 ms (float16) por cada 60 s de audio.
- CPU: funciona en CPU sin problemas; más de 4 hilos no aportan ganancia real por el tamaño reducido del modelo. El cuello de botella pasa a ser la extracción de características de Kaldi, que es monohilo y consume entre el 40 % y el 70 % del tiempo extremo a extremo.
- Cabe en GPU de consumo: sí, en cualquier modelo con soporte CUDA para ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), con las dependencias `onnxruntime`, `kaldi_native_fbank`, `kaldiio`, `soundfile` y `numpy`. No requiere PyTorch en inferencia.
- Latencia y throughput: para 1 h de audio, 126 ms en GPU (float16, solo modelo) y 1,7 s en CPU (4 hilos, solo modelo); extremo a extremo en CPU con 4 hilos, 7,0 s por hora de audio.
- Nota de despliegue: en el entorno del autor, el proveedor CUDA solo se cargaba importando `torch` primero para proporcionar cuDNN.

## Comparativa con modelos similares

No se dispone de datos de benchmarks propios ni de comparativas directas con otros VAD en la información proporcionada. A modo orientativo, se comparan características conocidas de alternativas habituales de la categoría:

| Modelo | Parámetros | Contexto / ventana | Streaming | Licencia | Formato |
|---|---|---|---|---|---|
| FireRedVAD-VAD-onnx (este) | 0,59 M | 300 s por fragmento | No | Apache-2.0 | ONNX |
| Silero VAD | no disponible en la fuente | no disponible en la fuente | Sí | MIT (según su proyecto) | ONNX / PyTorch |
| WebRTC VAD | no aplica (algoritmo) | tramas de 10/20/30 ms | Sí | BSD | C / nativo |
| FireRedVAD original (FireRedTeam) | 0,59 M | 300 s por fragmento | No (existe variante streaming separada) | Apache-2.0 | PyTorch |

Los datos de Silero VAD y WebRTC VAD no provienen de la información proporcionada y deben verificarse en sus fuentes originales antes de usarse en una decisión técnica.

## Limitaciones y advertencias

- Exportación no oficial: no está publicada ni respaldada por FireRedTeam; para producción conviene evaluar también el modelo original.
- Solo incluye el VAD no streaming; no se exportaron el VAD en streaming (`Stream-VAD/`) ni el detector de eventos de audio (`AED/`).
- El modelo no es streaming: requiere disponer del audio completo o trocearlo manualmente en fragmentos de hasta 300 s.
- Las probabilidades requieren post-procesado (suavizado, umbral y longitudes mínimas) para obtener segmentos; los valores por defecto son los del código original.
- El rendimiento en float16 en CPU es peor o igual que en float32; la variante float16 solo aporta ventaja en GPU y de forma moderada.
- El proveedor CUDA de ONNX Runtime activa TF32 por defecto, lo que introduce un error de aproximadamente 1e-3; puede desactivarse con `use_tf32=0`.
- En el entorno del autor, el proveedor CUDA requería importar `torch` previamente para cargar cuDNN.
- La extracción de características de Kaldi es monohilo y domina el tiempo extremo a extremo en audio largo; escalar hilos no mejora ese cuello de botella.
- El autor no re-ejecutó el benchmark FLEURS-VAD-102; el F1 de 97,57 % procede de la model card original y no ha sido verificado en esta exportación.
- Idiomas declarados zh y en; el comportamiento en otras lenguas o en condiciones de ruido extremo no está documentado en la información disponible.
- Riesgo de sesgos y alucinaciones no documentado específicamente para este modelo; al ser un clasificador acústico, el riesgo principal es la clasificación errónea de voz o silencio en condiciones adversas.
- Licencia Apache-2.0, que permite uso comercial con atribución y conservación del aviso de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/twmht/FireRedVAD-VAD-onnx
- Modelo base original: https://huggingface.co/FireRedTeam/FireRedVAD
- Referencia arXiv citada en los tags: arxiv:2603.10420 (no verificada en la información disponible)
- Repositorio de ONNX Runtime: https://github.com/microsoft/onnxruntime
- Repositorio de kaldi_native_fbank: https://github.com/csukuangfj/kaldi_native_fbank
