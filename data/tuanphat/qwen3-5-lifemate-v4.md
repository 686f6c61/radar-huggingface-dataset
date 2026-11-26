# TuanPhat/Qwen3.5-LifeMate-v4

## Resumen

Qwen3.5-LifeMate-v4 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario TuanPhat para el pipeline LifeMate, un agente de voz en vietnamita presentado al Zalo AI Challenge 2026. El modelo está especializado en tool calling (llamada a funciones) en vietnamita, y su función es interpretar instrucciones del usuario y emitir llamadas estructuradas a herramientas externas que la aplicación anfitriona ejecuta.

El checkpoint conserva la licencia Apache-2.0 del modelo original de Qwen y se distribuye en formato safetensors con 4.659.865.088 parámetros totales (aproximadamente 4,66 mil millones). El repositorio ocupa 9,3 GB. El modelo está pensado para desplegarse mediante SGLang con una API compatible con OpenAI, y el autor indica que el pipeline completo LifeMate v4 obtuvo una puntuación de 49,18000 en el conjunto de prueba público del desafío.

La relevancia de este modelo es acotada: se trata de un ajuste fino muy específico para una competición concreta y un idioma concreto (vietnamita), con cero descargas y cero likes en el momento de la ficha. Es útil como referencia de cómo adaptar un modelo Qwen de ~4B a tool calling conversacional en un idioma de bajos recursos, pero no está pensado como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B; detalles específicos de la arquitectura base no disponibles en la información proporcionada) |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo distribuye safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Vietnamita (vi); el modelo base Qwen3.5-4B probablemente soporta más idiomas, pero el ajuste fino está orientado a vi |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen3.5-4B, con aproximadamente 4,66 mil millones de parámetros. El autor no documenta en la model card el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF, DPO o supervisión directa (SFT). Tampoco se detallan innovaciones arquitectónicas propias: el checkpoint es un fine-tune del modelo base, no una arquitectura nueva.

El único dato de entrenamiento explícito es el objetivo: tool calling en vietnamita dentro del pipeline LifeMate para el Zalo AI Challenge 2026. La model card incluye un ejemplo de inferencia con una herramienta `set_alarm` y la instrucción en vietnamita «Đặt báo thức lúc 7 giờ sáng», lo que confirma que el ajuste está orientado a la emisión de llamadas a funciones estructuradas. Se desconoce si el entrenamiento incluyó datos multilingües o si se limitó exclusivamente a vietnamita.

## Capacidades

- Generación de texto conversacional en vietnamita.
- Tool calling / function calling: emite llamadas estructuradas a herramientas definidas por esquema JSON, con soporte de `tool_choice: "auto"`.
- Integración con endpoints compatibles con OpenAI a través de SGLang.
- Modo de razonamiento desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`, lo que sugiere que el modelo base incorpora un modo thinking que puede activarse o desactivarse.
- Conversación multi-turno (pipeline `conversational`).
- No se documentan capacidades de visión, audio, código, matemáticas avanzadas ni agentes multi-paso más allá del tool calling descrito.

## Casos de uso

- Asistentes de voz en vietnamita: el modelo traduce instrucciones habladas (transcritas a texto) en llamadas a funciones como `set_alarm`, integrándose en un pipeline de reconocimiento de voz y síntesis. Es su caso de uso principal y el documentado por el autor.
- Automatización de tareas domésticas o de agenda: interpretar peticiones como «pon una alarma» o «crea un recordatorio» y emitir la llamada estructurada correspondiente.
- Integración en agentes con API compatible con OpenAI: desplegado con SGLang, puede sustituir a un modelo mayor en tareas de enrutamiento de intenciones a herramientas, reduciendo coste de inferencia por su tamaño de ~4,66B.
- Prototipado de pipelines de tool calling en idiomas de bajos recursos: sirve como referencia para adaptar Qwen3.5-4B a un idioma específico con un dataset reducido.
- Enrutamiento de intenciones en aplicaciones de atención al cliente en vietnamita: clasificar la petición del usuario y derivarla a la herramienta o flujo adecuado.
- Evaluación comparativa de fine-tunes: al conservar la licencia Apache-2.0 y el formato safetensors, puede cargarse en frameworks estándar para comparar su comportamiento frente al modelo base en tareas de function calling.

## Benchmarks y rendimiento

El único dato publicado es la puntuación del pipeline completo LifeMate v4 en el conjunto de prueba público del Zalo AI Challenge 2026: **49,18000**. No se desglosa por tarea ni se ofrecen métricas del modelo aislado (MMLU, HumanEval, GSM8K u otras).

| Benchmark | Resultado |
|---|---|
| Zalo AI Challenge 2026 (test público, pipeline completo) | 49,18000 |
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,3 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda al menos 16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB de pesos (estimaciones orientativas; el autor no publica cuantizaciones).
- GPU recomendadas: el autor indica una GPU NVIDIA con toolkit CUDA compatible con SGLang y PyTorch, sin especificar modelo. Por tamaño, cabe en RTX 4090 (24 GB), A100 (40/80 GB) y H100; también en GPUs consumer de 16 GB o más en fp16.
- Despliegue: SGLang es el método documentado por el autor (`python inference.py --port 30004`), con endpoint compatible con OpenAI. No se documentan vLLM, llama.cpp, Ollama ni TGI, aunque al ser safetensors estándar podrían ser viables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-LifeMate-v4 | ~4,66B | No disponible | Apache-2.0 | Fine-tune para tool calling en vietnamita |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible | Apache-2.0 (según el autor) | Modelo generalista multilingüe |
| Otros fine-tunes de Qwen para tool calling | No disponible | No disponible | Variable | No disponible en la información proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está orientado a tool calling en vietnamita para un pipeline concreto; su rendimiento en otras tareas o idiomas no está documentado y probablemente sea inferior al del modelo base.
- Idiomas: la model card declara únicamente vietnamita (`vi`); no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.
- Alucinación: no se documentan evaluaciones de fiabilidad ni tasas de alucinación; en tool calling, una llamada mal formada o un parámetro inventado puede provocar fallos en la aplicación anfitriona.
- Sesgos: no se documentan análisis de sesgos; al derivar de Qwen3.5-4B, hereda los sesgos del modelo base y del dataset de ajuste fino, no publicados.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene cero descargas y cero likes, sin validación comunitaria.
- Producción: sin cuantizaciones publicadas, sin benchmarks del modelo aislado y sin documentación de latencia, su uso en producción requiere validación propia.
- Fecha de creación: la model card indica 2026-11-26; verificar la vigencia de los enlaces y del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/TuanPhat/Qwen3.5-LifeMate-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Zalo AI Challenge 2026: no disponible en la información proporcionada
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada
