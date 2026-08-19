# unsloth/LFM2.5-VL-3B-GGUF

## Resumen

LFM2.5-VL-3B es un modelo multimodal (texto e imagen) desarrollado por Liquid AI, diseñado específicamente para despliegue en dispositivos de borde (edge). Esta variante GGUF, publicada por Unsloth, ofrece pesos cuantizados para ejecución eficiente en CPU y hardware con memoria limitada. El modelo combina un backbone de lenguaje LFM2.5-2.6B con un codificador de visión SigLIP2 NaFlex de 400M de parámetros, lo que permite procesar imágenes a resolución nativa mediante parches de 512×512.

Con 2.7 mil millones de parámetros totales y una ventana de contexto de 32.768 tokens, el modelo está optimizado para tareas de una sola pasada con alta velocidad de inferencia: 228 tokens por segundo en Apple M5 Max y 116 tokens por segundo en AMD Ryzen AI Max+ 395, ocupando menos de 3,3 GB de memoria. Soporta 16 idiomas, incluyendo español, y destaca en tareas de grounding visual, OCR con anotación de diseño y traducción en dispositivo.

La relevancia actual de este modelo radica en su capacidad para ejecutar tareas de visión por computadora en tiempo real en hardware de consumo, sin depender de la nube. Su licencia LFM 1.0 permite uso comercial con restricciones, y está disponible en formatos GGUF, ONNX y MLX, además del checkpoint nativo en Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone de lenguaje LFM2.5-2.6B + codificador de visión SigLIP2 NaFlex 400M |
| Parametros totales | 2.697.198.592 (~2,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF (no se especifican los niveles concretos en la información disponible) |
| Idiomas soportados | Árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés, vietnamita |
| Licencia | LFM 1.0 (licencia propia de Liquid AI, con restricciones comerciales) |
| Formato de pesos | GGUF (también disponibles ONNX y MLX en otros repositorios) |

## Arquitectura y entrenamiento

LFM2.5-VL-3B es un modelo híbrido que combina un backbone de lenguaje (LFM2.5-2.6B) con un codificador de visión SigLIP2 NaFlex de 400M de parámetros. La arquitectura está diseñada para eficiencia en dispositivos de borde, priorizando la velocidad de inferencia y el bajo consumo de memoria. El procesamiento de imágenes utiliza la resolución nativa de SigLIP2 NaFlex: las imágenes grandes se dividen en parches no solapados de 512×512 píxeles, junto con una miniatura redimensionada de la imagen completa, lo que permite capturar tanto detalles finos como contexto global.

El modelo se basa en LFM2-VL-3B, con entrenamiento adicional en fases intermedias y finales (mid- y post-training). No se han publicado detalles específicos sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset. El vocabulario tiene un tamaño de 128.000 tokens y utiliza un formato de chat estilo ChatML. La inferencia se puede realizar con Transformers, vLLM, SGLang, llama.cpp (para GGUF) y mlx-vlm (para MLX).

## Capacidades

- Procesamiento multimodal de texto e imágenes, con entrada de imagen única o múltiple.
- Grounding visual: detección de objetos y localización mediante consultas en lenguaje natural, con generación de bounding boxes.
- OCR completo de páginas con anotación de diseño (layout), incluyendo estructura de párrafos, tablas y elementos gráficos.
- Traducción en dispositivo de menús, señales de tráfico y otros textos capturados con cámara.
- Generación de texto con parámetros recomendados: temperatura 0,2, top-k 50, penalización de repetición 1,0.
- Soporte de tool calling y funciones de agente (según la demo WebGPU, que muestra tool calls y bounding boxes).
- Multilingüe: 16 idiomas, incluyendo español, inglés, francés, alemán, chino, japonés, etc.
- Alta velocidad de inferencia en hardware de consumo: 228 tok/s en Apple M5 Max, 116 tok/s en AMD Ryzen AI Max+ 395.

## Casos de uso

- Detección de objetos en tiempo real para automoción: el modelo puede procesar flujos de cámara a alta velocidad (116-228 tok/s) y localizar objetos con bounding boxes, adecuado para sistemas de asistencia al conductor o vigilancia perimetral en dispositivos de bajo consumo.
- OCR de documentos escaneados por lotes: su capacidad de OCR con anotación de layout permite convertir PDFs escaneados en texto buscable, preservando la estructura de párrafos y tablas, ideal para digitalización de archivos en oficinas o bibliotecas.
- Traducción de señales y menús en tiempo real: al ejecutarse en un dispositivo móvil o portátil, puede traducir textos capturados con la cámara a 16 idiomas, útil para viajeros o aplicaciones de realidad aumentada.
- Asistente visual para personas con discapacidad visual: el modelo puede describir escenas, leer textos y localizar objetos en el entorno, ejecutándose localmente para garantizar privacidad y baja latencia.
- Automatización de atención al cliente con imágenes: integrado en un chatbot, puede interpretar capturas de pantalla, fotos de productos o documentos enviados por usuarios, extrayendo información relevante para resolver incidencias.
- Clasificación y filtrado de imágenes en pipelines de datos: su capacidad de grounding y OCR permite etiquetar imágenes automáticamente, extraer metadatos de fotografías o detectar contenido inapropiado en moderación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una gráfica de promedios por grupos de tareas, pero no se proporcionan valores concretos en el texto. Se recomienda consultar el repositorio oficial de Liquid AI para datos de evaluación detallados.

## Requisitos de hardware

- VRAM estimada: menos de 3,3 GB en memoria total para inferencia en CPU (según la model card). En GPU, con cuantización GGUF de 4 bits, se estima que cabe en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con soporte para llama.cpp o vLLM, como RTX 3060 (6 GB) o superior. También funciona en iGPUs de AMD Ryzen AI y Apple Silicon (M5 Max, etc.).
- Ejecución en CPU: posible gracias a los pesos GGUF, con velocidades de 116 tok/s en AMD Ryzen AI Max+ 395 y 228 tok/s en Apple M5 Max.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang, Transformers (con el checkpoint nativo), mlx-vlm (para Apple Silicon) y ONNX Runtime (para despliegue multiplataforma).
- Latencia: adecuada para tareas en tiempo real (detección de objetos, OCR en streaming) gracias a las altas velocidades de tokenización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-VL-3B (este) | 2,7B | 32.768 | Sí | LFM 1.0 | GGUF, ONNX, MLX, safetensors |
| LFM2-VL-3B (anterior) | 2,7B | 32.768 | Sí | LFM 1.0 | safetensors, GGUF |
| Phi-3.5-vision | 4,2B | 128K | Sí | MIT | safetensors, GGUF |
| Qwen2-VL-2B | 2,2B | 32K | Sí | Apache 2.0 | safetensors, GGUF |

Nota: los datos de Phi-3.5-vision y Qwen2-VL-2B son de conocimiento general y no provienen de la información proporcionada. Se recomienda verificar en sus respectivas fichas.

## Limitaciones y advertencias

- No recomendado para tareas de razonamiento extenso o de contexto largo, como diseño web visual o respuestas a preguntas técnicas muy detalladas sobre planos.
- Licencia LFM 1.0: permite uso comercial, pero con restricciones específicas. Se debe revisar el texto completo de la licencia antes de usar en producción.
- La información sobre benchmarks es limitada; no se han publicado resultados numéricos en la documentación disponible.
- Los tipos de cuantización GGUF no están especificados en la información proporcionada; se recomienda revisar el repositorio de Unsloth para conocer los niveles disponibles (Q4_K_M, Q5_K_M, etc.).
- Riesgo de alucinación en descripciones de imágenes poco claras o de baja resolución, como en cualquier modelo multimodal.
- Sesgos potenciales derivados de los datos de entrenamiento, no documentados explícitamente en la información disponible.

## Enlaces

- Repositorio GGUF de Unsloth: https://huggingface.co/unsloth/LFM2.5-VL-3B-GGUF
- Checkpoint original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Versión GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-GGUF
- Versión ONNX: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-ONNX
- Versión MLX (8-bit): https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-8bit
- Demo WebGPU (chat con visión): https://huggingface.co/spaces/LiquidAI/LFM2.5-VL-3B-WebGPU
- Playground de Liquid AI: http://playground.liquid.ai/chat?model=lfm2.5-vl-3b
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Post de lanzamiento: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Framework mlx-vlm: https://github.com/Blaizzy/mlx-vlm
