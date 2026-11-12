# W-World-Labs/Qwen3.8-27B-LAMQ2

## Resumen

Qwen3.8-27B-LAMQ2 es una cuantización experimental de tipo post-training (PTQ) del modelo multimodal Qwen/Qwen3.8-27B, publicada por W-World-Labs. El modelo conserva el codificador visual original en BF16 y aplica cuantización únicamente al componente lingüístico mediante el método LookAtMyQuant (LAMQ) y la herramienta W-ModelForge, con un formato de pesos empaquetado propio denominado `opgraph-packed-1` que emplea trellis-quantization.

El paquete lingüístico ocupa 9,643 GB, lo que equivale a 2,86438 bits por parámetro de texto, mientras que el codificador visual añade 0,9215 GB en BF16. El modelo base es un transformer multimodal de 27.000 millones de parámetros con soporte de image-text-to-text y capacidades conversacionales, orientado a tareas de razonamiento, matemáticas y comprensión de imágenes.

La relevancia de esta ficha radica en que se trata de un lanzamiento experimental con limitaciones explícitas: no es cargable directamente en Transformers, vLLM ni llama.cpp sin el loader de referencia, y no implementa un kernel nativo de inferencia empaquetada. La retención medida en el benchmark sintético de aritmética es del 94,33% a 4096 tokens, pero el propio autor advierte que estos resultados no establecen equivalencia general de razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8-27B base), con codificador visual BF16 y componente lingüístico cuantizado |
| Parámetros totales | 27.000 millones (modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 4096 tokens evaluados en el benchmark; longitud máxima nativa del modelo base no disponible |
| Tipos de cuantización | Trellis-quantization (LAMQ), 2,86438 bits por parámetro de texto; visión en BF16 sin cuantizar |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `opgraph-packed-1` (custom-packed); exportación densa a HF y conversión a GGUF disponibles por separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal con un codificador visual y un merger/projector que conectan visión y lenguaje. La cuantización se aplica exclusivamente al componente lingüístico mediante el método LookAtMyQuant, que produce pesos empaquetados en formato `opgraph-packed-1` con trellis-quantization. El codificador visual se preserva íntegramente en BF16: los 333 tensores `model.visual.*` conservan sus bytes originales, con el buffer RoPE visual en FP32, y se verificó la coincidencia de los 333 hashes contra la fuente original.

No se realizó calibración con imágenes, destilación ni QAT (quantization-aware training). El proceso es un PTQ puro sobre el componente de lenguaje. El modelo excluye MTP (multi-token prediction). La reconstrucción densa no es exacta: el wrapper completo reporta PPL 27,2671534 y KL media de 0,000690891 frente a la referencia densa cuantizada en cuatro ventanas de 128 tokens, con un 98,6328% de acuerdo top-1 y tres de cuatro prompts greedy coincidentes.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text) mediante el codificador visual BF16 original.
- Razonamiento aritmético y matemático (evaluado en 216 problemas sintéticos de 12 familias).
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Modo thinking: la evaluación se realizó con `enable_thinking=False`; el soporte de thinking mode no está confirmado en la información disponible.
- Procesamiento de vídeo: la configuración incluye ajustes de procesador de vídeo, pero la calidad de vídeo no está evaluada.

## Casos de uso

- Investigación sobre cuantización extrema: el modelo sirve como banco de pruebas para estudiar la retención de capacidades a 2,86 bits por parámetro en modelos multimodales, comparando los resultados originales y empaquetados a 1024, 2048 y 4096 tokens.
- Clasificación y descripción básica de imágenes: con el codificador visual BF16 intacto, puede emplearse para tareas de identificación de formas, colores y contenido visual simple, como demuestran los ejemplos de cuadrado rojo y círculo azul.
- Razonamiento aritmético acotado: adecuado para pipelines donde se requiera resolver problemas de aritmética sintética en inglés o chino con un presupuesto de cómputo reducido, aceptando una retención del 94,33% frente al modelo original.
- Despliegue en entornos con restricciones de almacenamiento: el paquete lingüístico de 9,643 GB permite almacenar el modelo en dispositivos con espacio limitado, aunque la inferencia requiere expandir los pesos a un modelo Torch denso de aproximadamente 54,7 GB.
- Evaluación comparativa de métodos de cuantización: útil para investigadores que comparen LAMQ con otras técnicas PTQ (GPTQ, AWQ, GGUF) en términos de PPL, KL y acuerdo top-1.
- Prototipado de asistentes conversacionales bilingües en/zh: el modelo conserva la plantilla de chat y el tokenizador originales, lo que facilita integrarlo en flujos conversacionales una vez cargado con el loader de referencia.
- Generación de código en producción: no recomendado ni evaluado; la calidad de código, tool-use e instruction-following no está medida.

## Benchmarks y rendimiento

Evaluación sobre 216 problemas sintéticos de aritmética en 12 familias, BF16, batch 8, decodificación greedy y `enable_thinking=False`. No es una muestra del dataset MATH.

| Máximo de tokens nuevos | Original correctos | Empaquetado correctos | Cap hits original | Cap hits empaquetado | Retención relativa |
|---|---:|---:|---:|---:|---:|
| 1024 (histórico) | 84/216 | 86/216 | 131 | 130 | 102,38% |
| 2048 | 160/216 | 155/216 | 55 | 58 | 96,88% |
| 4096 (actual) | 194/216 | 183/216 | 17 | 26 | 94,33% |

A 4096 tokens, la precisión original/empaquetada es 89,81% / 84,72%, con longitudes medias generadas de 1545/1636 tokens. A 2048, las medias son 1268/1280. La pérdida varía por familia: a 4096, binomial cae de 10 a 5 sobre 18, multiplicación de 14 a 12, mientras que exponenciación modular sube de 17 a 18. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 54,7 GB de almacenamiento de parámetros (BF16 de lenguaje más visión BF16), más espacio de trabajo de decodificación, activaciones y sobrecarga de KV/cache. El tamaño de descarga (10,6 GB) no equivale al uso de VRAM en inferencia.
- GPU recomendadas: no especificadas en la información disponible; por el volumen de parámetros expandidos se requiere hardware de clase A100/H100 con 80 GB o configuraciones multi-GPU.
- ¿Cabe en GPU consumer? No de forma holgada con los pesos expandidos a BF16; no se documentan configuraciones consumer viables.
- Opciones de despliegue: loader de referencia de W-ModelForge (obligatorio para el formato empaquetado). Transformers, vLLM y llama.cpp no pueden cargar directamente el formato `opgraph-packed-1`. Se ofrecen exportación densa a HF y conversión separada a GGUF, que expanden los pesos y no implementan kernel nativo de trellis.
- Latencia y throughput: no se hace ninguna afirmación de rendimiento nativo empaquetado ni de rendimiento de motor. No disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-LAMQ2 (este) | 27B | 4096 evaluados | `opgraph-packed-1`, 2,86 bits/param texto | Apache 2.0 | PTQ experimental, visión BF16 intacta, requiere loader propio |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | Safetensors BF16 | Apache 2.0 | Modelo original sin cuantizar, referencia de calidad |
| Alternativas PTQ de la familia Qwen (GPTQ/AWQ/GGUF) | 27B | No disponible | GGUF, GPTQ, AWQ | Apache 2.0 | Cargables en llama.cpp/vLLM; datos concretos de esta comparativa no disponibles |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El formato `opgraph-packed-1` no es cargable en Transformers, vLLM ni llama.cpp; requiere el loader de referencia de W-ModelForge.
- El loader expande los pesos a un modelo Torch denso de ~54,7 GB; el tamaño de descarga no refleja el uso de VRAM.
- La reconstrucción densa no es exacta (PPL 27,2671534, KL 0,000690891, 98,6328% de acuerdo top-1).
- La retención del 94,33% corresponde a un benchmark sintético de aritmética y no establece equivalencia general de razonamiento; la retención no es uniforme entre familias de tareas.
- No se realizó calibración con imágenes, destilación ni QAT; la calidad visual y de vídeo amplia no está evaluada (solo dos ejemplos básicos de imagen).
- La calidad de código, tool-use e instruction-following no está medida.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible, pero aplicables por herencia del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de benchmarks estándar desaconsejan producción sin validación propia.
- MTP excluido; sin afirmaciones de throughput nativo empaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/W-World-Labs/Qwen3.8-27B-LAMQ2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/tree/37561816e66b5b9153b1b64c10968c18c1e6f4a0
- W-ModelForge: https://github.com/W-World-Labs/w-modelforge
- LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- README en chino: README.zh-CN.md (incluido en el repositorio)
- Procedencia visual: vision-provenance.json (incluido en el repositorio)
- Informe de validación multimodal: multimodal-validation.json (incluido en el repositorio)
