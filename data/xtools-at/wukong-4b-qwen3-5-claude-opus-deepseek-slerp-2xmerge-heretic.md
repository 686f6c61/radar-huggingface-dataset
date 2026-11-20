# xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic

## Resumen

Wukong 4B es un modelo de lenguaje compacto de 4.660 millones de parámetros construido mediante la fusión en el espacio de pesos de dos ajustes finos de Qwen3.5-4B. Lo desarrolla el usuario xtools-at y combina, por un lado, un modelo orientado a código y agentes (Qwopus3.5-4B-Coder-UNCENSORED-heretic) y, por otro, un modelo de razonamiento matemático y STEM destilado de DeepSeek-V4-Pro (DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic). El objetivo declarado es ofrecer un equilibrio entre razonamiento científico, generación de código, depuración y flujos agénticos en un tamaño apto para despliegue local.

La fusión se realizó con SLERP (interpolación esférica lineal) con un parámetro de interpolación t = 0.4, dando mayor peso al modelo de código. No hubo un entrenamiento adicional tras la mezcla: el checkpoint resultante es el producto directo de la combinación de pesos. Ambos progenitores son variantes "heretic" descensuradas, y el autor afirma haber confirmado comportamiento abliterado también en el modelo fusionado.

El modelo se publica con licencia Apache 2.0, soporta cinco idiomas (inglés, chino, español, ruso y japonés), se distribuye en formato safetensors para transformers y declara el pipeline image-text-to-text, lo que sugiere capacidades multimodales heredadas de la base Qwen3.5. Es relevante para quienes buscan un modelo pequeño, sin filtros agresivos, con soporte de tool calling y razonamiento estructurado, ejecutable en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), fusión SLERP de dos ajustes finos |
| Parámetros totales | 4.659.865.088 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (repo en safetensors; se asume compatibilidad con cuantizaciones estándar de transformers, sin confirmar) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Qwen3.5-4B. No se entrenó desde cero ni se sometió a un fine-tuning posterior a la fusión: se generó combinando los pesos de dos modelos mediante SLERP con t = 0.4. El primer progenitor, Qwopus3.5-4B-Coder-UNCENSORED-heretic, aporta la base de código y agentes y recibe el mayor peso de interpolación; el segundo, DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic, aporta razonamiento matemático y científico.

Los datos de entrenamiento son los de los progenitores. El modelo de razonamiento se destiló de DeepSeek-V4-Pro en modo Max Effect con aproximadamente 250.000 muestras de matemáticas y STEM. El modelo de código se entrenó con trazas de razonamiento reconstruidas de Claude (datasets Claude Opus 4.6 TraceInversion, 9.000 muestras, y Claude Opus 4.7 TraceInversion, 5.000 muestras) y con trayectorias agénticas multirretorno procedentes de Kimi-K2.5 y GLM-5.1-FP8 (dataset lambda/hermes-agent-reasoning-traces), que cubren tool calling, operaciones de terminal, trabajo con repositorios y automatización de navegador. Las trazas de Claude son datos sintéticos reconstruidos mediante Trace Inversion, no accesos directos a razonamiento interno privado. No se documenta el número total de tokens de entrenamiento ni si hubo RLHF o DPO en los progenitores.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino, español, ruso y japonés.
- Razonamiento multi-paso y resolución estructurada de problemas.
- Matemáticas y conocimiento STEM, con derivaciones y descomposición de problemas.
- Generación de código, depuración, localización de bugs, parcheo y refactorización.
- Tool calling y function calling.
- Flujos agénticos: enrutamiento de herramientas, operaciones de terminal, trabajo con repositorios y automatización de navegador.
- Capacidades multimodales (pipeline image-text-to-text), presumiblemente heredadas de la base Qwen3.5; el alcance exacto no está detallado en la información disponible.
- Comportamiento descensurado/abliterado confirmado por el autor, con menor tasa de rechazos.

## Casos de uso

- Asistente de programación en local: integrado en un IDE o CLI, el modelo puede generar parches, localizar bugs y proponer refactorizaciones gracias a su entrenamiento específico en depuración y trabajo con repositorios, sin depender de servicios en la nube.
- Automatización agéntica de tareas de terminal: con tool calling y trayectorias de operaciones de terminal en su entrenamiento, puede encadenar comandos, inspeccionar resultados y corregir errores en un bucle multi-paso.
- Resolución de problemas matemáticos y STEM: adecuado para tutores o asistentes técnicos que requieran derivaciones paso a paso y descomposición explícita del problema.
- Enrutamiento de herramientas en pipelines de producción: su soporte de function calling permite usarlo como planificador ligero que decide qué API o función invocar en cada turno.
- Atención al cliente multilingüe: cubre inglés, chino, español, ruso y japonés, lo que permite desplegar un único modelo para conversaciones multi-turno en varios mercados; la longitud de contexto exacta no está documentada.
- Experimentación con modelos descensurados: útil para investigación sobre comportamiento abliterado, evaluación de sesgos y estudios de alineación en entornos controlados.
- Prototipado en hardware de consumo: con 4.660 millones de parámetros, es viable en GPUs de gama alta para consumidores, lo que facilita iteración rápida y despliegue en el borde.

## Benchmarks y rendimiento

El autor publicó una evaluación preliminar limitada al variante 4B, comparándolo con sus modelos progenitores en un conjunto reducido de benchmarks. Los resultados indican que la fusión preserva en gran medida el rendimiento general, sin degradación clara, con puntuaciones que varían ligeramente según la tarea; rinde de forma similar a los progenitores en ARC-Easy y algo mejor en una prueba cuyo nombre queda truncado en la información disponible ("A..."). No se proporcionan cifras numéricas concretas ni resultados de MMLU, HumanEval o GSM8K en la información disponible.

| Benchmark | Resultado |
|---|---|
| ARC-Easy | Similar a los modelos progenitores (sin cifra publicada) |
| Resto de benchmarks | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, en torno a 10-12 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB de pesos.
- GPU recomendadas: A100 o H100 para despliegue en fp16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para fp16 en local.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en fp16; en 8 GB o menos será necesario cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers (formato nativo del repo); vLLM, TGI, llama.cpp u Ollama requerirían conversión a los formatos correspondientes, no confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Wukong 4B (este modelo) | 4,66 B | No disponible | Apache 2.0 | Fusión SLERP, descensurado, tool calling, 5 idiomas |
| Qwen/Qwen3.5-4B (base) | ~4 B | No disponible | No disponible en la información | Modelo base original, presumiblemente alineado y con filtros |
| xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic | ~4 B | No disponible | Apache 2.0 (según repo) | Progenitor orientado a código y agentes |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4 B | No disponible | Apache 2.0 (según repo) | Progenitor orientado a matemáticas y STEM |

No se dispone de datos de rendimiento numérico comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo descensurado/abliterado: puede producir contenido que otros modelos rechazarían; requiere filtros y políticas de uso adicionales en producción.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en tareas de conocimiento factual extenso.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia sin verificarla empíricamente.
- Los datos de entrenamiento de los progenitores incluyen trazas sintéticas reconstruidas de Claude y destilación de DeepSeek; pueden propagar sesgos o errores de esos modelos.
- La evaluación publicada es preliminar, con pocos benchmarks y sin cifras concretas; no hay garantías de rendimiento en tareas fuera de las evaluadas.
- Aunque la licencia es Apache 2.0, el uso comercial del comportamiento descensurado puede chocar con políticas de plataformas o requisitos regulatorios; conviene revisar el cumplimiento antes de desplegar.
- El pipeline declarado es image-text-to-text, pero el alcance real de las capacidades multimodales no está detallado; no se debe asumir visión robusta sin pruebas.
- Sin datos de throughput ni latencia; el rendimiento en producción debe medirse en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Variante 9B: https://huggingface.co/xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Progenitor de código: https://huggingface.co/xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic
- Fine-tune original de código: https://huggingface.co/Jackrong/Qwopus3.5-4B-Coder
- Progenitor de razonamiento: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune original de razonamiento: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Dataset Claude Opus 4.6 TraceInversion: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Claude Opus 4.7 TraceInversion: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset de trayectorias agénticas: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Paper de referencia (Trace Inversion): https://arxiv.org/abs/2603.07267
- Perfil del autor: https://huggingface.co/xtools-at
