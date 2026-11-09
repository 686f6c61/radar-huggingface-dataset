# taobao-mnn/MNN-Pocket-0.3B-GGUF

## Resumen

MNN-Pocket-0.3B-GGUF es la exportación en formato GGUF del modelo MNN-Pocket-0.3B, un modelo de lenguaje compacto de aproximadamente 300 millones de parámetros desarrollado por el equipo taobao-mnn (Alibaba) y diseñado conjuntamente con la pila de inferencia MNN para su despliegue en dispositivos. El modelo está pensado para ejecutarse en teléfonos, tabletas, portátiles y gafas inteligentes, donde el espacio de memoria y el consumo energético son restricciones críticas. Esta exportación concreta permite utilizarlo con llama.cpp y runtimes compatibles como LM Studio u Ollama.

Arquitectónicamente es un transformer decoder-only de 28 capas con 896 dimensiones ocultas, atención GQA con 14 cabezas y 2 cabezas KV, y un FFN de 2560 unidades con activación SiLU. Soporta una ventana de contexto de 32K tokens (40.960 embeddings posicionales) y un vocabulario de 65.536 entradas con embeddings atados entre entrada y salida. Los idiomas soportados son chino e inglés.

Su relevancia actual reside en la combinación de tres factores: un tamaño lo bastante reducido como para caber en memoria de dispositivos móviles, una ventana de contexto amplia para su categoría y una versión cuantizada a 4 bits entrenada con quantization-aware training (QAT) que conserva prácticamente la precisión del modelo en BF16 (49,59 frente a 50,00 de media en una suite de 11 benchmarks) con solo 192 MB de peso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 28 capas |
| Parametros totales | 361.551.232 (~300M nominales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K tokens (40.960 embeddings posicionales) |
| Tipos de cuantizacion | F16 (726 MB), Q8_0 (387 MB), Q4_1 QAT (192 MB) |
| Idiomas soportados | Chino, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 28 capas, dimensión oculta de 896, 14 cabezas de atención con GQA y 2 cabezas KV (head_dim 64), FFN intermedio de 2560 con activación SiLU, vocabulario de 65.536 tokens y embeddings de entrada y salida atados. La plantilla de chat es de estilo ChatML y viene embebida en los metadatos del GGUF, de modo que llama.cpp entra en modo conversacional de forma automática sin necesidad de flags adicionales.

La innovación técnica destacable es el entrenamiento con quantization-aware training (QAT) para el checkpoint Q4_1: el modelo se entrenó con la cuantización en el bucle en lugar de cuantizarse a posteriori, lo que permite que el fichero de 4 bits mantenga una precisión cercana a BF16. Los ficheros F16 y Q8_0 se convierten desde el checkpoint BF16 instruction-tuned, mientras que Q4_1 proviene del checkpoint QAT. No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional con plantilla ChatML integrada en los metadatos del GGUF.
- Comprensión y generación en chino e inglés.
- Ventana de contexto de 32K tokens, adecuada para conversaciones multi-turno y documentos de longitud media.
- Orientado a asistentes en dispositivo, extracción de datos y pipelines agénticos ligeros, según la model card.
- Compatible con endpoints OpenAI a través de `llama-server`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento extendido (thinking mode): no disponible.
- El autor advierte explícitamente que, como otros modelos por debajo de mil millones de parámetros, no se recomienda para cargas con razonamiento intensivo (matemáticas avanzadas, código de horizonte largo).

## Casos de uso

- Asistentes en dispositivo para móviles y gafas inteligentes: el fichero Q4_1 de 192 MB cabe en memoria de dispositivos con recursos limitados y permite respuestas conversacionales locales sin conexión, con la ventana de 32K para mantener contexto de sesión.
- Extracción de datos estructurados en el borde: el modelo puede procesar textos cortos o medianos y devolver campos estructurados en pipelines de preprocesado, aprovechando su bajo coste de inferencia en CPU.
- Clasificación y etiquetado de texto ligero: con prompts ChatML se puede usar para categorizar tickets, correos o reseñas en inglés y chino directamente en el cliente.
- Autocompletado y sugerencias en aplicaciones de escritorio: integrable vía llama.cpp u Ollama para generar sugerencias de texto en línea con latencia baja en CPU.
- Pipelines agénticos ligeros: la model card lo señala como adecuado para flujos agénticos sencillos donde el modelo actúa como enrutador o generador de pasos intermedios, no como razonador principal.
- Prototipado y experimentación con MNN: sirve como banco de pruebas para desarrolladores que quieran validar la pila de inferencia MNN en dispositivos antes de escalar a modelos mayores de la familia.
- Servicio local compatible con OpenAI: mediante `llama-server` se puede exponer un endpoint compatible con la API de OpenAI para pruebas de integración en aplicaciones existentes.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo subyacente (mayor es mejor). Las columnas F16 y Q8_0 siguen la columna BF16; Q4_1 sigue la columna INT4 (QAT).

| Benchmark | BF16 | INT4 (QAT) | Gemma-3-270M | ERNIE-4.5-0.3B | LFM2.5-350M | SmolLM2-360M | Hunyuan-0.5B | MiniCPM4-0.5B | Qwen3-0.6B |
|---|---|---|---|---|---|---|---|---|---|
| **Media** | 50,00 | 49,59 | 6,42 | 31,99 | 31,28 | 18,43 | 31,22 | 46,81 | 44,28 |

La model card no desglosa los resultados por benchmark individual en la información disponible; solo se publica la media agregada de la suite de 11 benchmarks.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 192 MB (Q4_1), 387 MB (Q8_0), 726 MB (F16), sin contar el espacio adicional para el contexto KV.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 2 GB o más de VRAM puede ejecutar incluso la variante F16; la Q4_1 está pensada para CPU y dispositivos móviles.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo está diseñado para CPU en teléfonos, tabletas y portátiles. En escritorio puede ejecutarse en cualquier GPU moderna (RTX 3060 o superior) sin ser necesario.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), LM Studio, Ollama y runtimes compatibles con GGUF; la pila MNN es el objetivo principal del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota operativa: sin `--hf-file`, llama.cpp selecciona por defecto `Q8_0` (387 MB), no el QAT Q4_1; para usar el cuantizado recomendado hay que indicarlo explícitamente o usar el atajo `:Q4_1`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media en suite (BF16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B | ~300M | 32K | 50,00 | Apache 2.0 | GGUF y safetensors en HF |
| Gemma-3-270M | 270M | no disponible | 6,42 | no disponible | no disponible |
| ERNIE-4.5-0.3B | 300M | no disponible | 31,99 | no disponible | no disponible |
| LFM2.5-350M | 350M | no disponible | 31,28 | no disponible | no disponible |
| SmolLM2-360M | 360M | no disponible | 18,43 | no disponible | no disponible |
| Hunyuan-0.5B | 500M | no disponible | 31,22 | no disponible | no disponible |
| MiniCPM4-0.5B | 500M | no disponible | 46,81 | no disponible | no disponible |
| Qwen3-0.6B | 600M | no disponible | 44,28 | no disponible | no disponible |

Los datos de la comparativa provienen de la tabla de benchmarks de la model card del autor; los parámetros, contextos y licencias de los modelos competidores no se detallan en la información proporcionada más allá de lo indicado.

## Limitaciones y advertencias

- Modelo por debajo de mil millones de parámetros: el propio autor desaconseja su uso para razonamiento intensivo, matemáticas avanzadas o generación de código de horizonte largo.
- Riesgo de alucinación inherente a modelos pequeños; no debe usarse como fuente de verdad sin verificación externa.
- Idiomas limitados a chino e inglés; no se garantiza un comportamiento adecuado en castellano u otras lenguas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de la pila MNN para despliegues en producción.
- El fichero seleccionado por defecto en llama.cpp es Q8_0, no el QAT Q4_1; elegir mal el fichero implica un mayor consumo de memoria del previsto.
- La ventana de 32K requiere memoria adicional para la caché KV; en dispositivos muy limitados puede ser necesario reducir el contexto efectivo.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-GGUF
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Colección MNN-Pocket-0.3B: https://huggingface.co/collections/taobao-mnn/mnn-pocket-03b
- Repositorio MNN en GitHub: https://github.com/alibaba/MNN
- Informe técnico (PDF): https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/resolve/main/MNN-Pocket-0.3B-Technical-Report.pdf
- Demo en vídeo: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/resolve/main/assets/demo.mp4
- README en chino: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-GGUF/blob/main/README-cn.md
