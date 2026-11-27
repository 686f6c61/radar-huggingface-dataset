# Xylolabs/Qwen3.5-9B-MLX-4bit

## Resumen

Qwen3.5-9B-MLX-4bit es una conversión cuantizada a 4 bits del modelo Qwen/Qwen3.5-9B, publicada por Xylolabs para su uso con la librería MLX de Apple (mlx-lm). El modelo base es un transformer de la familia Qwen3.5 desarrollado por Alibaba Qwen, con 8.953.801.728 parámetros totales (aproximadamente 9B). Esta versión concreta elimina la torre de visión y la capa MTP (multi-token prediction) del modelo original, por lo que es exclusivamente de texto.

La relevancia de esta ficha radica en que ofrece una ruta de despliegue eficiente en hardware Apple Silicon: el repo pesa 5,6 GB en safetensors y aplica cuantización afín de 4 bits con group size 32, escalas y sesgos en float16. Está pensada para ejecutarse en Mac con memoria unificada mediante `mlx-lm==0.32.2`, lo que la hace útil para desarrolladores que quieren probar un modelo de ~9B en local sin GPUs dedicadas.

La licencia es Apache 2.0, heredada del modelo base, y el modelo conserva el modo de razonamiento (thinking) activado por defecto, con la posibilidad de desactivarlo mediante configuración de la plantilla de chat. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks estándar en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); conversión MLX sin torre de visión ni capa MTP |
| Parametros totales | 8.953.801.728 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K (según tabla de hardware de la model card) |
| Tipos de cuantizacion | 4-bit afín, group size 32, escalas y sesgos en float16; existe variante 8-bit del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería mlx-lm |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer de la familia Qwen3.5. La conversión de Xylolabs a MLX aplica cuantización afín de 4 bits a todas las capas lineales, al embedding de tokens y a la LM head; las normas y el resto de tensores no cuantizados se mantienen en float16, salvo `A_log`, que se guarda en float32. La torre de visión y la capa MTP del modelo original se han eliminado deliberadamente, de modo que esta versión es solo texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la documentación proporcionada. La model card únicamente documenta el proceso de conversión y cuantización, no el entrenamiento del modelo base. Como innovación destacable del artefacto, el autor publica métricas de fidelidad de la cuantización frente a BF16 (divergencia KL y acuerdo top-1 sobre WikiText-2, chat y texto reservado).

## Capacidades

- Generación de texto conversacional y continuaciones de texto (pipeline `text-generation`).
- Modo de razonamiento (thinking) activado por defecto; se puede desactivar con `--chat-template-config '{"enable_thinking": false}'`.
- Conversión solo texto: no incluye capacidades de visión al haberse eliminado la torre de visión.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado local en Mac Apple Silicon: ejecutar un modelo de ~9B en 4 bits (5,6 GB) con `mlx-lm` permite experimentar con generación de texto y chat sin GPU dedicada, aprovechando la memoria unificada del equipo.
- Asistentes conversacionales de escritorio: el modelo puede gestionar diálogos multi-turno y, con la ventana de 256K indicada, mantener contexto largo en aplicaciones de chat locales.
- Razonamiento con modo thinking en tareas de análisis: útil para depuración de prompts y comparación de respuestas con y sin razonamiento explícito, alternando `enable_thinking`.
- Generación de texto en pipelines offline: al ser un artefacto MLX ligero, encaja en scripts de generación por lotes en máquinas Apple sin conexión a servicios en la nube.
- Evaluación de calidad de cuantización: sirve como referencia práctica para medir la degradación de un 4-bit frente a BF16 usando las métricas KL y top-1 publicadas por el autor.
- Base para fine-tuning o experimentación con MLX: al estar en formato MLX y licencia Apache 2.0, puede servir de punto de partida para adaptaciones locales dentro del ecosistema mlx-lm.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K), pero sí métricas de fidelidad de cuantización frente a BF16:

| Cuantización | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Chequeo 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 9,51 GB | 0,000573 | 99,05% | 0,000806 | 99,16% | 0,000343 | 98,65% | 7/7 (BF16: 7/7) |
| MLX 4-bit | 5,60 GB | 0,063576 | 88,98% | 0,067069 | 88,59% | 0,059950 | 86,04% | 7/7 (BF16: 7/7) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo 4-bit ocupa 5,6 GB en disco; la variante 8-bit ocupa 9,51 GB. La inferencia requiere memoria unificada adicional para el contexto (hasta 256K según la tabla del autor).
- Hardware objetivo: Apple Silicon con memoria unificada. La model card tabula Mac Studio M5 Max (32 y 40 núcleos GPU, 36-128 GB) y Mac Studio M5 Ultra (96-512 GB), todos apuntando a la variante 8-bit para contexto 256K.
- GPU consumer: no se documenta soporte para GPUs NVIDIA/AMD; el artefacto es específico de MLX (Apple Silicon).
- Despliegue: `mlx-lm==0.32.2` mediante `mlx_lm.generate` y `mlx_lm.chat`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-9B-MLX-4bit | ~9B | 256K (según model card) | 4-bit MLX | Apache 2.0 | Hugging Face (MLX) |
| Xylolabs/Qwen3.5-9B-MLX-8bit | ~9B | 256K | 8-bit MLX | Apache 2.0 | Hugging Face (MLX) |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | BF16 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la única comparación cuantitativa publicada es la fidelidad KL/top-1 del 4-bit y 8-bit frente a BF16.

## Limitaciones y advertencias

- Solo texto: la torre de visión y la capa MTP han sido eliminadas, por lo que no admite entradas de imagen ni decodificación multi-token especulativa.
- Degradación por cuantización: el 4-bit presenta un acuerdo top-1 de ~86-89% frente a BF16 y una KL de ~0,06, notablemente peor que el 8-bit (~99% top-1, KL ~0,0006). Para tareas sensibles a la fidelidad, considerar la variante 8-bit.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe sin evaluación propia.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos: no se documentan sesgos conocidos en la model card.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso `NOTICE` y `LICENSE` del autor de la conversión.
- Dependencia de ecosistema: requiere `mlx-lm==0.32.2` y hardware Apple Silicon; no es portable directamente a otras pilas de inferencia.
- El modo thinking está activado por defecto, lo que puede aumentar la latencia y el consumo de tokens si no se desactiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 8-bit: https://huggingface.co/Xylolabs/Qwen3.5-9B-MLX-8bit
- Librería MLX: https://github.com/ml-explore/mlx
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
