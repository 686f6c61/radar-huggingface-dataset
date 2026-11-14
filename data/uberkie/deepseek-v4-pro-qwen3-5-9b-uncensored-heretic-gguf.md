# uberkie/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF es una cuantización en formato GGUF del modelo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, publicada por el usuario uberkie. Se trata de una conversión a Q4_K_M (5,02 bits por peso) del tronco principal, acompañada de un proyector de visión independiente en F16 (`mmproj`) que preserva la ruta multimodal. El modelo hereda la arquitectura `qwen3_5` (identificada como `qwen35` en GGUF), una variante híbrida que combina atención lineal y atención completa en una proporción de 3 a 1, con 33 capas (32 de transformador más una cabeza MTP).

La cadena de ascendencia es relevante para entender qué se está descargando: el modelo original parte de Qwen3.5-9B, sobre el que se aplicó un proceso de destilación con SFT y RL a partir de DeepSeek-V4-Pro (`Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`), seguido de una ablación ARA (ablación de dirección de rechazo) mediante la técnica Heretic que elimina los mecanismos de rechazo del modelo, dando lugar a la variante "uncensored". Esta versión GGUF es, por tanto, el resultado final de esa cadena, cuantizado para su ejecución en `llama.cpp`, LM Studio, Ollama y llama-cpp-python.

El modelo cuenta con 9.197.093.888 parámetros totales (8.954 B de tronco más 0.249 B de la cabeza MTP), una ventana de contexto nativa de 262.144 tokens y soporte multimodal de texto, imagen y vídeo. Su relevancia actual radica en que ofrece razonamiento con modo thinking, capacidades multimodales y contexto muy largo en un paquete de menos de 6 GiB que cabe en GPUs de consumo, algo poco habitual en modelos de esta categoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (`qwen35` en GGUF), híbrida de atención lineal + atención completa |
| Parametros totales | 9.197.093.888 (8.954 B tronco + 0.249 B MTP; 0.456 B proyector de visión) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Q4_K_M (5,02 bpw) para el tronco; F16 para la cabeza MTP y el proyector de visión |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformador híbrido de 33 capas con un patrón de atención que intercala tres capas de atención lineal (basada en SSM, con kernel de convolución 4, tamaño de estado 128 y estado recurrente) por cada capa de atención completa (`full_attention_interval = 4`). Las capas de atención completa se sitúan en los índices 3, 7, 11, 15, 19, 23, 27 y 31, ocho en total. El tamaño oculto es de 4096, con 16 cabezas de consulta y 4 de clave/valor de dimensión 256, FFN SwiGLU con dimensión intermedia de 12.288 y un vocabulario BPE de 248.320 tokens. Emplea RoPE intercalado multimodal (MRoPE) con secciones `[11, 11, 10, 0]`, theta de 10.000.000 y rotación parcial de 0,25. Incluye una cabeza MTP (multi-token prediction) que permite decodificación especulativa.

El entrenamiento del modelo base combina SFT y RL destilados desde DeepSeek-V4-Pro sobre Qwen3.5-9B, seguido de una ablación ARA (ablación de dirección de rechazo) mediante Heretic. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO en la información proporcionada. La cuantización Q4_K_M aplica Q6_K a los tensores sensibles (`attn_v`, `ffn_down` y proyecciones de salida), mantiene en F32 las normas, `ssm_dt`, `ssm_conv1d`, `A_log`, `dt_bias` y los tensores de estado recurrente, y conserva la cabeza MTP en F16 sin recuantizar el tronco. El total es de 442 tensores.

## Capacidades

- Generación de texto con razonamiento explícito en modo thinking: los tokens de razonamiento se devuelven en `reasoning_content` y la respuesta visible llega tras el token `</think>`.
- Razonamiento matemático y resolución de problemas paso a paso.
- Generación y explicación de código.
- Comprensión de imágenes y vídeo mediante el proyector `mmproj` en F16 (requiere ambos archivos GGUF).
- Soporte de conversaciones multiturno con plantilla de chat embebida en el GGUF.
- Capacidades multilingües en inglés, chino, coreano, japonés, español y ruso.
- Compatibilidad con endpoints OpenAI (`/v1/chat/completions`) mediante `llama-server`.
- Decodificación especulativa mediante la cabeza MTP incluida.
- Modo "uncensored": la ablación Heretic elimina los mecanismos de rechazo del modelo base.
- No se dispone de información sobre soporte de tool calling o function calling en la documentación proporcionada.

## Casos de uso

- Asistencia matemática y científica interactiva: el modelo puede resolver integrales, demostraciones y problemas algebraicos mostrando el razonamiento intermedio, lo que resulta útil en entornos educativos o de investigación donde se necesita auditar el proceso de resolución.
- Análisis de documentos e imágenes en local: con el proyector de visión y 262.144 tokens de contexto, permite procesar capturas, diagramas o páginas escaneadas junto a texto extenso sin salir del equipo, algo relevante para datos sensibles.
- Generación de código en entornos de desarrollo integrados: su tamaño de 6 GiB permite ejecutarlo en una estación de trabajo con GPU de consumo y ofrecer autocompletado y explicación de código con razonamiento visible.
- Procesamiento de corpus largos: la ventana nativa de 262.144 tokens permite resumir, extraer información o responder preguntas sobre libros, expedientes o bases de código completas en una sola pasada, aunque en la práctica la memoria disponible limitará el contexto efectivo.
- Investigación sobre alineación y seguridad: al ser una variante ablacionada, sirve para estudiar el comportamiento de modelos sin mecanismos de rechazo, comparar respuestas frente al modelo base y analizar sesgos residuales.
- Despliegue de prototipos con API compatible con OpenAI: mediante `llama-server` se puede levantar un endpoint local que imite la interfaz de OpenAI para integrarlo en aplicaciones existentes sin modificar el código cliente.
- Traducción y asistencia multilingüe entre los seis idiomas soportados, con especial utilidad en combinaciones con chino, coreano y japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,7 GiB para el archivo Q4_K_M más el espacio de contexto y caché KV; con visión hay que añadir unos 0,9 GiB del proyector F16.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para contexto largo y visión; RTX 4070 Ti o superior (12-16 GB) para uso con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para texto con contexto reducido; 12 GB o más para contextos amplios o uso multimodal.
- Opciones de despliegue: `llama.cpp` (build b12182 o superior, commit `fd27b2034`), LM Studio (detecta automáticamente el prefijo `mmproj-`), Ollama (solo texto, el proyector no es cargable actualmente), llama-cpp-python y `llama-server` con API compatible con OpenAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 9,2 B | 262.144 | texto, imagen, vídeo | Apache 2.0 | GGUF Q4_K_M |
| Qwen3.5-9B (modelo upstream) | ~9 B | no disponible | texto | no disponible | safetensors |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (base fp) | 9,2 B | 262.144 | texto, imagen, vídeo | Apache 2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La ablación Heretic elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido inapropiado, peligroso o ilegal sin filtros; no es apto para aplicaciones orientadas al público sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por el contexto largo, donde la información lejana puede perderse o distorsionarse.
- La ventana de 262.144 tokens es nativa, pero la VRAM disponible limitará en la práctica el contexto efectivo; con cuantización Q4_K_M y GPU de consumo, contextos superiores a 16.384-32.768 tokens pueden provocar desbordamiento a RAM y caídas drásticas de velocidad.
- El soporte de visión requiere obligatoriamente el archivo `mmproj` en F16; Ollama no puede cargarlo actualmente, por lo que en ese entorno el modelo queda limitado a texto.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre la legalidad del contenido generado.
- El modelo procede de una cadena de destilación y ablación no documentada en detalle; no se dispone de información sobre los datos de entrenamiento ni sobre posibles sesgos heredados.
- Los idiomas soportados son seis; el rendimiento en idiomas no listados no está garantizado.
- La fecha de creación del repositorio (noviembre de 2026) y la ausencia de descargas o valoraciones indican que se trata de una publicación reciente y sin validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/uberkie/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo upstream de destilación: `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B` (referenciado en la model card, sin URL directa disponible)
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
