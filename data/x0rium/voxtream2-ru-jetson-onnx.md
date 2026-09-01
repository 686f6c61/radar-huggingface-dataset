# x0rium/voxtream2-ru-jetson-onnx

## Resumen

VoXtream2-RU Jetson ONNX es una adaptación del modelo de síntesis de voz rusa VoXtream2-RU, desarrollada por x0rium, para ejecutarse en dispositivos NVIDIA Jetson sin necesidad de PyTorch durante la inferencia. El repositorio contiene cuatro grafos ONNX (phone encoder, temporal former, dep-former y Mimi decoder) junto con los datos auxiliares necesarios para generar motores TensorRT específicos para cada arquitectura de GPU Jetson. El modelo base es `simba9/voxtream2-ru`, que a su vez se deriva de VoXtream2, un sistema TTS zero-shot full-stream con control dinámico de velocidad de habla.

La relevancia de esta versión radica en que permite desplegar un TTS ruso de alta calidad en hardware embebido de NVIDIA, con generación de audio en streaming (chunks de 80 ms) y sin dependencia de PyTorch en tiempo de ejecución, lo que reduce el consumo de memoria y mejora la latencia. El tamaño total del repositorio es de aproximadamente 1,3 GB, y la configuración verificada incluye Jetson Orin Nano 8 GB con JetPack 6.2.3 y TensorRT 10.3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS con phone encoder, temporal former, dep-former y Mimi decoder (basado en VoXtream2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | phone encoder acepta secuencias de 2 a 640 fonemas |
| Tipos de cuantizacion | BF16 (bfloat16) en los grafos ONNX; los motores TensorRT se generan localmente |
| Idiomas soportados | ruso (ru) |
| Licencia | openrail-m |
| Formato de pesos | ONNX (grafos) y binarios auxiliares (BF16, JSON) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de VoXtream2, un TTS zero-shot full-stream que combina un codificador de fonemas, un temporal former (que gestiona la generación autoregresiva y el sink replay), un dep-former acústico con audio head, y un decodificador Mimi para producir PCM a 24 kHz. En esta adaptación para Jetson, los cuatro componentes se exportan a ONNX y se compilan a motores TensorRT con precisión BF16, utilizando CUDA Graphs para optimizar la ejecución. El pipeline completo incluye normalización de texto (ru-normalizr), acentuación (RUAccent) y conversión de fonemas (espeak-ng) antes de la síntesis.

No se dispone de información pública sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El modelo original VoXtream2 se entrenó con datos de habla en inglés y ruso, pero los detalles específicos de la variante rusa no están documentados en la información proporcionada.

## Capacidades

- Generación de voz en ruso a partir de texto, con salida PCM a 24 kHz y 16 bits.
- Síntesis en streaming: produce audio en chunks de 80 ms (1920 muestras) sin esperar a completar la frase completa.
- Control dinámico de velocidad de habla, actualizable durante la emisión (característica heredada de VoXtream2).
- Funcionamiento sin PyTorch en tiempo de ejecución, lo que reduce la huella de memoria y acelera la inferencia en Jetson.
- Soporte para voces personalizadas mediante embeddings de audio (se incluye un ejemplo de voz femenina).
- Integración con normalizador de texto ruso (ru-normalizr) y acentuador RUAccent para mejorar la pronunciación.
- Capacidad de ejecución residente en un proceso único para diálogos continuos.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: el modelo puede ejecutarse en un Jetson Orin Nano para proporcionar respuestas habladas en ruso en tiempo real, gracias a su generación en streaming y baja latencia.
- Sistemas de navegación y anuncios públicos: la síntesis de frases como fechas, horas, porcentajes y temperaturas (ejemplos incluidos) es adecuada para paneles informativos o sistemas de guiado.
- Atención al cliente automatizada: el TTS puede integrarse en un pipeline de diálogo para generar respuestas naturales en ruso, manteniendo un proceso residente para conversaciones multi-turno.
- Lectura de códigos y versiones: el modelo puede verbalizar códigos de confirmación, números de teléfono y versiones de software, aunque requiere texto preprocesado para formatos complejos.
- Generación de contenido audiovisual: producción de locuciones en ruso para vídeos, podcasts o audiolibros, con control de velocidad y posibilidad de ajuste en tiempo real.
- Prototipado de aplicaciones edge: desarrollo de soluciones TTS en Jetson para entornos sin conexión, donde no se puede depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye ejemplos de audio generados en un Jetson Orin Nano 8 GB, pero no proporciona métricas cuantitativas como RTF (factor de tiempo real), latencia o throughput. Se menciona que los archivos de muestra incluyen RTF en su manifest, pero esos datos no están accesibles en la información proporcionada.

## Requisitos de hardware

- GPU: NVIDIA Jetson Orin Nano 8 GB (configuración verificada), aunque debería funcionar en otras placas Jetson con arquitectura sm_87 (Orin).
- Software: JetPack 6.2.3 / Jetson Linux R36.5.2, CUDA 12.6.68, TensorRT 10.3.0.
- Memoria: el repositorio ocupa ~1,3 GB en disco; los motores TensorRT se generan localmente y requieren VRAM adicional, pero el modelo está diseñado para caber en 8 GB.
- Compilación: se necesitan dos kernels CUDA personalizados para sm_87 y la generación de cuatro motores TensorRT con perfiles específicos.
- Despliegue: el runtime se ejecuta sin PyTorch; se puede usar como proceso residente o invocación por línea de comandos. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un pipeline TTS específico.
- Latencia: no se proporcionan cifras exactas, pero el streaming en chunks de 80 ms sugiere una latencia inicial baja.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VoXtream2-RU Jetson ONNX (este) | TTS streaming | ruso | openrail-m | ONNX/TensorRT | Optimizado para Jetson, sin PyTorch |
| VoXtream2 (herimor/voxtream) | TTS zero-shot streaming | inglés, ruso (según variantes) | cc-by-4.0 | Safetensors | Modelo base, requiere PyTorch |
| Piper TTS | TTS ligero | múltiples | MIT | ONNX | Alternativa para edge, pero sin streaming ni zero-shot |

No se dispone de comparativas de rendimiento directas entre estos modelos en la información proporcionada. La principal diferencia de esta adaptación es su enfoque en Jetson y la eliminación de PyTorch en inferencia.

## Limitaciones y advertencias

- El normalizador de texto tiene limitaciones conocidas: números grandes, versiones (ej. `2.4.1`) y códigos numéricos se interpretan incorrectamente; requieren texto preprocesado (por ejemplo, "dos punto cuatro uno").
- Solo soporta ruso; no hay soporte multilingüe en esta variante.
- Los motores TensorRT no se distribuyen precompilados; deben generarse en el dispositivo objetivo, lo que requiere conocimientos de TensorRT y CUDA.
- La licencia openrail-m permite uso comercial, pero se recomienda revisar los términos exactos para aplicaciones de producción.
- El modelo depende de componentes externos (RUAccent, espeak-ng) que deben fijarse en versiones específicas para garantizar reproducibilidad.
- No se han publicado benchmarks formales; el rendimiento en otros Jetson (no Orin Nano) no está verificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/x0rium/voxtream2-ru-jetson-onnx
- Repositorio GitHub del runtime: https://github.com/x0rium/voxtream2-ru-jetson
- Documentación de instalación: https://github.com/x0rium/voxtream2-ru-jetson/blob/v0.2.1/docs/jetson-install.md
- Repositorio original VoXtream: https://github.com/herimor/voxtream
- Modelo base VoXtream2 en HuggingFace: https://huggingface.co/voxtream2/model
