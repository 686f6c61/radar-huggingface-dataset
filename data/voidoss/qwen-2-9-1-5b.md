# VoidOSS/Qwen-2.9-1.5B

## Resumen

Qwen 2.9 (1.5B) es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B de Alibaba Cloud, desarrollado por VoidOSS. Su objetivo es sustituir el razonamiento en formato de listas con viñetas dentro de las etiquetas `<think>` por monólogos densos en primera persona, imitando el estilo de razonamiento de DeepSeek-R1, manteniendo al mismo tiempo la capacidad de alternar entre un modo "Fast" (respuesta directa) y un modo "Thinking" (razonamiento explícito). El modelo se presenta como la cuarta iteración de la saga (2.6, 2.8, 2.9) del autor sobre la misma base.

La relevancia de este modelo radica en su tamaño reducido (1.500 millones de parámetros, 1.777 millones reales en safetensors) y en su entrenamiento mediante SFT y QLoRA sobre datasets de razonamiento destilados de DeepSeek-R1 (`Bespoke-Stratos-17k` y `OpenR1-Math-220k`). A pesar de su tamaño, el autor reporta un 64,14% en el split completo de GSM8K (1.319 preguntas) en modo zero-shot, un resultado que supera a modelos mucho mayores como Llama 2 70B en la misma tarea.

El modelo está orientado a generación de texto y conversación en inglés, con licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en hardware de consumo. Es un ejemplo de cómo el ajuste fino selectivo sobre una base pequeña puede mejorar capacidades de razonamiento matemático y lógico sin aumentar el número de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.777.088.000 (1,5B nominales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B soporta hasta 32.768 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors; no se mencionan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. No se trata de un modelo MoE ni de una arquitectura híbrida SSM. El entrenamiento parte de `VoidOSS/Qwen-2.8-1.5B`, que a su vez deriva de `Qwen/Qwen2.5-1.5B` de Alibaba Cloud. El ajuste se realizó mediante SFT (supervised fine-tuning) y QLoRA, utilizando dos datasets de razonamiento destilados de DeepSeek-R1: `bespokelabs/Bespoke-Stratos-17k` y `open-r1/OpenR1-Math-220k`.

La innovación técnica principal es el "replay mixing", una técnica que mezcla datos de entrenamiento para preservar la capacidad de alternar entre el modo Fast (respuesta directa sin razonamiento) y el modo Thinking (monólogo interno denso). El objetivo es reemplazar las listas con viñetas que generaban versiones anteriores dentro de `<think>` por párrafos de monólogo en primera persona, más naturales y densos. No se especifican el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de los dos conjuntos citados. Tampoco se menciona el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento matemático: el autor reporta un 64,14% en GSM8K zero-shot (1.319 preguntas), con una tasa de cierre de `</think>` del 91,74%.
- Razonamiento lógico y trampas cognitivas: 80% en un conjunto de 10 pruebas.
- Generación y ejecución de código Python: 75% en un conjunto de 8 pruebas.
- Depuración de bugs: 83,3% en un conjunto de 6 pruebas.
- Razonamiento multi-paso con restricciones: 62,5% en un conjunto de 8 pruebas.
- Modo dual: Thinking (razonamiento explícito dentro de `<think>`) y Fast (respuesta directa prefillando `<think>\n</think>`).
- No se menciona soporte de tool calling, function calling, agentes, visión, audio ni otras capacidades multimodales.
- Multilingüe: solo inglés según la model card.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede resolver problemas de aritmética y álgebra paso a paso en modo Thinking, mostrando el razonamiento intermedio dentro de `<think>`, lo que permite auditar el proceso y usarlo como material educativo. Su 64,14% en GSM8K zero-shot lo hace adecuado para problemas de nivel escolar.
- Generación de código en entornos con recursos limitados: con 1,5B parámetros y licencia Apache 2.0, puede desplegarse en una GPU de consumo para autocompletar funciones Python o generar scripts, con un 75% de acierto en ejecución de código según el autor.
- Depuración asistida: el modelo muestra un 83,3% en pruebas de bug-fixing, por lo que puede integrarse en editores o pipelines de CI para sugerir correcciones a partir de mensajes de error y fragmentos de código.
- Razonamiento lógico en asistentes conversacionales: su capacidad para resolver trampas cognitivas (80% en 10 pruebas) lo hace útil en chatbots que necesitan manejar preguntas capciosas o de sentido común sin alucinar en exceso.
- Prototipado rápido de agentes de razonamiento: al ser pequeño y ligero, permite iterar en el diseño de prompts y flujos multi-paso (constraint & multi-hop) antes de escalar a modelos mayores.
- Investigación en destilación de razonamiento: sirve como caso de estudio para analizar cómo el SFT con datos de DeepSeek-R1 afecta al estilo y la precisión del razonamiento en modelos pequeños, comparando las generaciones 2.5, 2.6, 2.8 y 2.9.
- Despliegue en edge o entornos con VRAM limitada: al caber en 8 GB (probado en RTX 4060 Ti según el autor), puede ejecutarse en estaciones de trabajo modestas para tareas de generación de texto y razonamiento básico.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. La primera tabla compara generaciones sobre conjuntos pequeños; la segunda usa el split completo de GSM8K.

| Benchmark | Qwen 2.5 (Base) | Qwen 2.6 Thinking | Qwen 2.8 (1024 tok) | Qwen 2.9 (4096 tok) |
|---|---|---|---|---|
| GSM8K (50 problemas) | 12,0% | 58,0% | 62,0% | 68,0% (34/50) |
| Lógica y trampas cognitivas (10) | 30,0% | 70,0% | 70,0% | 80,0% (8/10) |
| Ejecución de código Python (8) | 62,5% | 87,5% | 75,0% | 75,0% (6/8) |
| Depuración de bugs (6) | 66,7% | 66,7% | 66,7% | 83,3% (5/6) |
| Restricciones y multi-hop (8) | 12,5% | 75,0% | 100,0% | 62,5% (5/8) |

Comparativa en GSM8K completo (1.319 preguntas, zero-shot, `max_new_tokens=1024`):

| Modelo | Año | Parámetros | GSM8K | Configuración |
|---|---|---|---|---|
| Llama 2 7B | 2023 | 7B | 14,6% | 8-shot |
| Llama 2 13B | 2023 | 13B | 28,7% | 8-shot |
| Gemma 7B | 2024 | 7B | 46,4% – 50,9% | Estándar / few-shot |
| Mistral 7B | 2023 | 7B | 52,2% – 63,1% | 8-shot CoT |
| Llama 2 70B | 2023 | 70B | 56,8% | 8-shot |
| Llama 3 8B (Base) | 2024 | 8B | ~57,2% | Few-shot CoT |
| GPT-3.5 Turbo | 2023 | Propietario | ~57% – 60% | Few-shot estándar |
| Phi-2 | 2023 | 2,7B | ~61,1% | 8-shot CoT |
| Qwen 2.9 (VoidOSS) | 2026 | 1,5B | 64,14% | Zero-shot (1024 tok) |

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica que se evaluó en una RTX 4060 Ti de 8 GB, por lo que el modelo en precisión completa o FP16 (aproximadamente 3,5 GB de pesos) cabe holgadamente en 8 GB. Con cuantización a 4 bits (no distribuida oficialmente) podría caber en GPUs de 4-6 GB.
- GPU recomendadas: RTX 4060 Ti 8 GB (probada por el autor), RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100. Cualquier GPU con al menos 6-8 GB de VRAM es suficiente para FP16.
- Cabe en GPU de consumo: sí, en RTX 4060 Ti, RTX 3060, RTX 4070 y superiores. En GPUs integradas o con menos de 6 GB requeriría cuantización, que no está publicada.
- Opciones de despliegue: no se especifican en la model card. Al ser un modelo Qwen2 con pesos safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión). No se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles. El autor solo menciona que las evaluaciones se hicieron con decodificación greedy (`do_sample=False`) y `max_new_tokens=1024` o 4096 según el caso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen 2.9 (VoidOSS) | 1,5B | No disponible | 64,14% (zero-shot) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-1.5B (base) | 1,5B | 32.768 tokens | 12,0% (en el subset de 50 del autor) | Apache 2.0 | Hugging Face, ampliamente usado |
| Phi-2 | 2,7B | 2.048 tokens | ~61,1% (8-shot CoT) | MIT | Hugging Face |
| Llama 3.2 1B | 1,2B | 128.000 tokens | No disponible en la información | Llama 3.2 Community License | Hugging Face |

La comparación con Phi-2 y Llama 3.2 1B es orientativa: Phi-2 es un modelo de razonamiento de tamaño similar con resultados publicados en GSM8K, y Llama 3.2 1B es el competidor directo en tamaño de Meta. No se dispone de datos de Llama 3.2 1B en GSM8K dentro de la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card. Al derivar de Qwen2.5-1.5B y entrenarse con datos destilados de DeepSeek-R1, puede heredar sesgos de esos corpus, pero no se cuantifican.
- Riesgo de alucinación: no se evalúa explícitamente. La tasa de cierre de `</think>` del 91,74% en GSM8K implica que en aproximadamente un 8% de los casos el modelo no cierra la etiqueta de razonamiento, lo que puede producir respuestas truncadas o mal formadas en producción.
- Limitaciones de contexto: no se confirma la longitud de contexto efectiva. Aunque la base Qwen2.5-1.5B soporta 32.768 tokens, el ajuste fino puede haber reducido la ventana efectiva; el autor usa hasta 4096 tokens de generación en las pruebas.
- Limitaciones de idioma: solo inglés. No se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero el modelo deriva de Qwen2.5-1.5B (también Apache 2.0) y de datos destilados de DeepSeek-R1; conviene revisar las licencias de los datasets (`Bespoke-Stratos-17k` y `OpenR1-Math-220k`) antes de un uso comercial a gran escala.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, lo que indica que no ha sido validado por la comunidad. Los benchmarks son autoinformados por el autor, con conjuntos pequeños (6-50 preguntas) salvo GSM8K completo, y no han sido replicados de forma independiente. No se distribuyen cuantizaciones GGUF, lo que limita el despliegue en CPU o GPUs muy modestas.
- El modo Fast requiere prefill manual de `<|im_start|>assistant\n<think>\n</think>\n`; si no se aplica correctamente, el modelo puede entrar en modo Thinking y generar monólogos largos no deseados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VoidOSS/Qwen-2.9-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Versión anterior (Qwen 2.8): https://huggingface.co/VoidOSS/Qwen-2.8-1.5B
- Versión anterior (Qwen 2.6 Thinking): https://huggingface.co/VoidOSS/Qwen-2.6-Thinking-1.5B
- Dataset Bespoke-Stratos-17k: https://huggingface.co/datasets/bespokelabs/Bespoke-Stratos-17k
- Dataset OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Split de test de GSM8K: https://huggingface.co/datasets/openai/gsm8k
