# UnimeType/Transliteration-4B-Safetensors

## Resumen

Transliteration-4B es un modelo de 4.205.751.296 parámetros desarrollado por UnimeType, un ajuste fino del modelo base Qwen/Qwen3.5-4B orientado a una tarea muy concreta: convertir texto escrito con caracteres latinos (pinyin, romaji, hindi romanizado, hinglish y arabizi) a los sistemas de escritura nativos correspondientes (chino, japonés, hindi y árabe). No es un modelo de traducción ni de razonamiento general, sino una herramienta de transliteración que debe preservar intactos los elementos que no forman parte de la conversión: palabras inglesas claras, URLs, código, números, puntuación y saltos de línea.

El modelo se publica en varios formatos (safetensors, GGUF Q8_0 para llama.cpp y una versión MLX de 6 bits para Apple Silicon) y está pensado para ejecutarse en local, incluso en un portátil. La model card advierte explícitamente de que no hay una puntuación de precisión completa para esta release safetensors y de que existen errores conocidos en entradas cortas ambiguas en inglés, en la elección de dialecto y ortografía del árabe, y en la preservación de puntuación y emojis en japonés.

Es relevante ahora porque cubre un nicho poco atendido por los modelos generalistas (la transliteración de teclado) y porque su tamaño de 4B permite despliegue en hardware de consumo. El autor indica además que existe una generación más reciente, Transliteration 2.0 (v2.1), con mejores métricas declaradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tipo `qwen3_5_text`) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | safetensors en punto flotante (BF16/FP32), GGUF Q8_0, MLX 6 bits |
| Idiomas soportados | en, zh, ja, hi, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (402 tensores BF16 y 24 FP32), GGUF, MLX |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3.5-4B, cargado mediante la clase `Qwen3_5ForCausalLM` de Transformers o mediante el loader `qwen3_5` de MLX-LM. El ajuste fino se realizó con LoRA sobre una base Qwen3.5-4B cuantizada a 4 bits, seguida de una fusión en punto flotante. La model card subraya que el almacenamiento en punto flotante no recupera la precisión previa a la cuantización del modelo base original.

El checkpoint exportado conserva 426 tensores (402 en BF16 y 24 en FP32) y pasó una comprobación exacta de ida y vuelta contra la fuente ajustada retenida. No se registró la revisión exacta del snapshot base original; el archivo PROVENANCE.json identifica la fuente retenida por SHA-256. El modelo es solo de texto y no incluye pesos de visión ni auxiliares MTP. El dataset de entrenamiento no se ha publicado: el repositorio contiene pesos, documentación, procedencia, sumas de verificación y licencia, pero no datos, scripts de generación de datos, código de entrenamiento ni registros de entrenamiento. No se detalla el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Transliteración de pinyin a chino simplificado.
- Transliteración de romaji a japonés (hiragana).
- Transliteración de hindi romanizado e hinglish a devanagari.
- Transliteración de arabizi a escritura árabe.
- Preservación (no garantizada) de palabras inglesas claras, URLs, código, números, puntuación y saltos de línea durante la conversión.
- Conversión orientada a tarea única: la model card indica que el modelo es para "Convert", no para "Polish" ni "Explain".
- Formato conversacional con plantilla de chat (`apply_chat_template`) y soporte de `enable_thinking=False`.
- Multilingüe en el sentido de que maneja pares latino→escritura nativa para en, zh, ja, hi y ar.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio según la información disponible.

## Casos de uso

- Teclados y métodos de entrada en móvil y escritorio: el modelo puede integrarse en la app de teclado de UnimeType para convertir lo que el usuario escribe en caracteres latinos a la escritura nativa en tiempo de escritura, con un modelo de 4B que cabe en hardware moderado.
- Conversión por lotes de mensajes de chat: procesar historiales de conversación donde los usuarios escriben en pinyin, romaji, hinglish o arabizi y generar versiones en escritura nativa preservando enlaces y código.
- Preprocesado de datos para NLP multilingüe: normalizar corpus de redes sociales escritos en transliteración latina antes de alimentar pipelines de análisis de sentimiento o clasificación en chino, japonés, hindi o árabe.
- Herramientas web de conversión sin instalación: el autor ofrece conversores online (pinyin a chino, romaji a hiragana, inglés a hindi, translit a cirílico) que pueden apoyarse en este modelo para la conversión en servidor.
- Asistencia a hablantes de la diáspora: usuarios que escriben su lengua materna con caracteres latinos pueden obtener la forma nativa para publicar en redes o enviar mensajes, manteniendo el inglés y los enlaces intactos.
- Automatización de soporte multilingüe: en un sistema de atención al cliente, convertir mensajes de entrada romanizados a la escritura nativa antes de pasarlos a un modelo o a un agente humano que trabaje en esa escritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta release safetensors. La model card indica explícitamente que no hay una puntuación de precisión de suite completa para esta versión y que las puntuaciones de las versiones MLX 6 bits y GGUF Q8_0 no establecen su precisión. Como referencia del autor (no de este checkpoint), la generación Transliteration 2.0 (v2.1) declara un 88,4 % de precisión estricta en 4 idiomas y un 93,2 % de precisión de caracteres en frases largas multiclausura, con una mejora de +32,8 % sobre v1.0. No se ofrecen cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el autor no hace ninguna afirmación de memoria mínima ni de velocidad. Por el tamaño (4,2B parámetros), en BF16 se necesitan aproximadamente 8,4 GB solo para pesos, más overhead de contexto y activaciones.
- GPU recomendadas: no disponible. El autor no especifica GPU NVIDIA o AMD recomendadas.
- Consumer GPU: no verificado oficialmente. El modelo se cargó y ejecutó en un Apple M5 Pro con 48 GB de memoria usando MLX-LM 0.31.3 / MLX 0.32.2.
- Opciones de despliegue: MLX-LM (Apple Silicon), Transformers 5.16.1 con PyTorch 2.11.0 (carga verificada, sin benchmark de inferencia), llama.cpp mediante el GGUF Q8_0. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. La inferencia en NVIDIA CUDA, AMD ROCm, iOS y Android no está verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UnimeType Transliteration-4B | 4,2B | no disponible | Transliteración latino→nativo | Apache 2.0 | Safetensors, GGUF, MLX |
| UnimeType Transliteration-2.0-4B | no disponible | no disponible | Transliteración (v2.1, más reciente) | no disponible en la información | Safetensors |
| UnimeType Transliteration-2.0-0.8B | no disponible | no disponible | Transliteración ultraligera | no disponible en la información | no disponible |
| Qwen/Qwen3.5-4B (base) | 4B (clase) | no disponible | Generación de texto general | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No hay puntuación de precisión completa para esta release safetensors; las métricas de otras versiones no son extrapolables.
- Errores conocidos en entradas cortas ambiguas en inglés.
- Errores en la elección de dialecto y ortografía del árabe.
- Problemas de preservación de puntuación y emojis en japonés.
- En una prueba de producción con contexto árabe, el modelo devolvió un salto de línea extra y falló la comprobación de formato de salida; el GGUF BF16 reprodujo el mismo fallo.
- La preservación de enlaces, código, números, puntuación y saltos de línea no está garantizada; hay que revisar la salida antes de aceptarla.
- El ajuste fino partió de una base cuantizada a 4 bits; el almacenamiento en punto flotante no restaura la precisión original del modelo base.
- El dataset de entrenamiento no es público, lo que limita la auditoría de sesgos y composición.
- Aunque la licencia es Apache 2.0, conviene verificar los términos del modelo base Qwen3.5-4B incluidos en LICENSE antes de uso comercial.
- Modelo solo de texto: no soporta visión, audio ni tool calling.
- La inferencia en CUDA, ROCm, iOS y Android no está verificada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnimeType/Transliteration-4B-Safetensors
- Versión GGUF: https://huggingface.co/UnimeType/Transliteration-4B-GGUF/tree/main
- Versión MLX: https://huggingface.co/UnimeType/Transliteration-4B/tree/main
- Generación más reciente 2.0-4B: https://huggingface.co/UnimeType/Transliteration-2.0-4B-Safetensors
- Versión ultraligera 2.0-0.8B: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B
- Playground interactivo: https://huggingface.co/spaces/UnimeType/Transliteration-Playground
- Descarga de la app de teclado: https://unimetype.com/download
- Conversor pinyin a chino: https://unimetype.com/tools/pinyin-to-chinese
- Conversor romaji a hiragana: https://unimetype.com/tools/romaji-to-hiragana
- Conversor inglés a hindi: https://unimetype.com/tools/english-to-hindi
- Conversor translit a cirílico: https://unimetype.com/tools/translit-to-cyrillic
- Guía de MLX: https://unimetype.com/docs/ai-service-models-and-credits
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Web del autor: https://unimetype.com/
