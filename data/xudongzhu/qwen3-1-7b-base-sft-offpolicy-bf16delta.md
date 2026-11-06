# XudongZhu/Qwen3-1.7B-Base-SFT-OffPolicy-BF16Delta

## Resumen

Qwen3-1.7B-Base-SFT-OffPolicy-BF16Delta es un repositorio de investigación publicado por XudongZhu que contiene los checkpoints intermedios de un ajuste fino supervisado (SFT) fuera de política (off-policy) del modelo Qwen3-1.7B-Base sobre problemas matemáticos. El modelo aprende de las respuestas generadas por DeepSeek-R1 en lugar de sus propias respuestas, a diferencia de su gemelo on-policy, que entrena sobre sus propias respuestas correctas. Ambos forman parte de un estudio sobre cómo el post-entrenamiento modifica los pesos de un modelo.

El repositorio no es un modelo para conversar, sino un artefacto de investigación: guarda el paso 300 como checkpoint normal en la raíz y una cadena de deltas BF16 comprimidos con zstd que permite reconstruir los otros 74 pasos guardados (del 1 al 50 y luego cada 10 hasta el 300). La reconstrucción se realiza con el script `restore.py` incluido, que parte del modelo base en la revisión `ea980cb` y recorre la cadena.

Arquitectónicamente es un transformer decoder-only de 1.720.574.976 parámetros, heredado de Qwen3-1.7B-Base, con licencia Apache 2.0. Su relevancia es metodológica: permite comparar pesos y comportamiento entre checkpoints y frente a su gemelo on-policy para estudiar la dinámica de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B-Base) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa prompt y respuesta ≤ 16.384 tokens) |
| Tipos de cuantización | no disponible (el repositorio publica pesos BF16 y deltas BF16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint del paso 300 en la raíz; deltas BF16 comprimidos con zstd en `deltas/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only de 1.720.574.976 parámetros. El ajuste es un SFT off-policy: en cada paso el modelo aprende de las respuestas de DeepSeek-R1 con la pérdida SFT, definida como la media de −log p sobre los tokens de la respuesta, excluyendo el prompt. Se realizan 300 pasos de 128 problemas cada uno, en una sola pasada sobre los datos, con AdamW (β = 0,9 y 0,999), weight decay 0, gradient clipping 1.0, learning rate constante de 1e-6 sin warmup, pesos en FP32, cómputo en BF16 y reducción de gradientes en FP32 mediante FSDP con precisión mixta. La semilla es 0.

Los datos proceden del split `default` de OpenR1-Math-220k (93.733 problemas). Se conservan los problemas de matemáticas en formato de enunciado con una respuesta de DeepSeek-R1 validada como correcta por math-verify y completa (59.188 problemas), se barajan con semilla 0 y se reservan los primeros 500 para evaluación. En ese orden se descartan los prompts de más de 1.024 tokens (29) y los pares prompt-respuesta de más de 16.384 tokens (684), tomando los primeros 38.400. Cada problema se entrena una vez con su respuesta de R1 (una elegida al azar con semilla 0 cuando hay varias). El formato de prompt es el turno de usuario con el problema, una línea en blanco y la instrucción `Please reason step by step, and put your final answer within \boxed{}.`, sin system prompt, seguido del turno de asistente.

La innovación técnica del repositorio es el almacenamiento diferencial: cada archivo en `deltas/` es el XOR de los bits BF16 crudos de un paso con los del paso anterior, comprimido con zstd, y `manifest.json` contiene el SHA-256 de cada delta y cada paso. Un paso reconstruido es idéntico bit a bit al checkpoint FP32 de Qwen3-1.7B-Base-SFT-OffPolicy redondeado a BF16; los bits bajos de FP32 no se conservan.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo produce cadenas de razonamiento largas orientadas a resolver problemas de matemáticas en inglés.
- Resolución de problemas con formato de respuesta final en `\boxed{}`, según el formato de prompt de entrenamiento.
- Aprendizaje de cadenas de razonamiento de DeepSeek-R1 como estilo de respuesta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada; el modelo genera cadenas de razonamiento, pero no se ha entrenado para uso agéntico.
- Capacidades multilingües: solo inglés.
- Modo thinking, visión o audio: no disponible.
- No incluye instruction tuning ni entrenamiento de seguridad más allá del modelo base.

## Casos de uso

- Estudio de dinámica de entrenamiento: comparar los pesos entre checkpoints (pasos 1 a 50 y 60 a 300) para analizar cómo evolucionan las representaciones internas durante el SFT, usando la cadena de deltas y `restore.py` para reconstruir cada paso.
- Comparación on-policy frente a off-policy: evaluar el comportamiento del modelo frente a su gemelo Qwen3-1.7B-Base-SFT-OnPolicy-BF16Delta, que entrena sobre los mismos problemas en el mismo orden pero con sus propias respuestas correctas, para aislar el efecto de la fuente de las respuestas.
- Análisis de imitación de razonamiento: estudiar hasta qué punto el modelo reproduce el estilo y los pasos de las cadenas de DeepSeek-R1 al entrenarse con ellas, comparando las respuestas generadas con las del profesor.
- Investigación en evaluación matemática: usar el checkpoint del paso 300 como punto de referencia para medir la ganancia de un SFT de 300 pasos sobre 38.400 problemas con un learning rate de 1e-6.
- Reproducibilidad de experimentos: reconstruir pasos intermedios bit a bit (verificables con `--verify`) para replicar análisis de pesos o de comportamiento en entornos de investigación.
- Estudio de eficiencia de almacenamiento: analizar el esquema de deltas XOR más zstd como método para archivar cadenas largas de checkpoints con un coste de 10,5 GB frente a copias completas por paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.720.574.976 parámetros, en BF16 el peso ocupa aproximadamente 3,4 GB y en FP32 aproximadamente 6,9 GB, a lo que hay que sumar la caché KV según la longitud de contexto.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño de pesos, un modelo de 1,7 mil millones de parámetros en BF16 es compatible con GPUs de consumo con suficiente VRAM, pero el autor no lo especifica.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`); el tag del repositorio incluye `text-generation-inference` y `endpoints_compatible`. No se detallan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.
- Reconstrucción de checkpoints: `restore.py` requiere numpy, torch, safetensors, huggingface_hub y el comando `zstd`; tarda aproximadamente 6 segundos por paso en CPU y descarga el modelo base para recorrer la cadena desde el paso 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Base-SFT-OffPolicy-BF16Delta | 1.720.574.976 | no disponible | SFT off-policy sobre respuestas de DeepSeek-R1 | apache-2.0 | Hugging Face (checkpoints y deltas) |
| Qwen3-1.7B-Base-SFT-OnPolicy-BF16Delta | no disponible | no disponible | SFT on-policy sobre respuestas propias correctas | no disponible | Hugging Face |
| Qwen3-1.7B-Base-SFT-OffPolicy | no disponible | no disponible | SFT off-policy, checkpoints en FP32 | no disponible | Hugging Face |
| Qwen/Qwen3-1.7B-Base | 1.720.574.976 (heredado) | no disponible | Modelo base preentrenado | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo para conversar: el autor lo describe explícitamente como checkpoints para investigación, no un modelo de chat.
- Entrenado únicamente con problemas matemáticos en inglés, sin instruction tuning ni entrenamiento de seguridad más allá del modelo base.
- Las respuestas son cadenas de razonamiento largas, lo que puede alargar la generación y el consumo de contexto.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo imita respuestas de DeepSeek-R1 sin garantía de corrección.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto o idioma: solo inglés; el entrenamiento limita prompt y respuesta a 16.384 tokens y descarta prompts de más de 1.024 tokens.
- Restricciones de licencia: Apache 2.0, que permite uso comercial, pero el propósito declarado es la investigación y el modelo no está alineado para producción.
- Los deltas conservan solo BF16: los bits bajos de FP32 no se guardan, por lo que para esos valores hay que usar el repositorio Qwen3-1.7B-Base-SFT-OffPolicy.
- La reconstrucción de pasos intermedios requiere descargar el modelo base y ejecutar `restore.py` con sus dependencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/XudongZhu/Qwen3-1.7B-Base-SFT-OffPolicy-BF16Delta
- Gemelo on-policy: https://huggingface.co/XudongZhu/Qwen3-1.7B-Base-SFT-OnPolicy-BF16Delta
- Repositorio con checkpoints FP32: https://huggingface.co/XudongZhu/Qwen3-1.7B-Base-SFT-OffPolicy
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Código: https://github.com/xzAscC/PostDyn
- Colección de checkpoints: https://huggingface.co/collections/XudongZhu/postdyn-checkpoints-of-intermediate-training-steps-6ae29b555274b0282beebb59
