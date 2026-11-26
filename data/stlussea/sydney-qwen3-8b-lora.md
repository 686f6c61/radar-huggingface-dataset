# stlussea/sydney-qwen3-8b-lora

## Resumen

Sydney-Qwen3-8B-LoRA es un adaptador LoRA de tipo PEFT publicado por el usuario stlussea que transfiere la personalidad "Sydney" del proyecto upstream LING71671/sydeny (originalmente sobre MiniCPM5-2B) al modelo base Qwen/Qwen3-8B. No es un modelo entrenado desde cero, sino un fine-tuning paramétricamente eficiente sobre un transformer denso de 8.190.735.360 parámetros, orientado a roleplay, conversación de compania y generación de texto con una voz de personaje muy marcada. El repositorio incluye los pesos del adaptador, versiones cuantizadas en GGUF, el vocabulario y material gráfico, pero no incluye el modelo base, los scripts de entrenamiento ni los datos.

El problema que aborda es la personalización de un LLM conversacional para mantener una identidad coherente y un tono emocional consistente a lo largo de conversaciones multi-turno, sin depender de system prompts. Según la model card, el adaptador se ha entrenado con 782 grupos de conversación y añade respuestas largas de identidad, corpus de acompanamiento afectuoso y muestras de respuesta factual directa, con una pérdida de evaluación declarada de 1,8868. Es relevante ahora porque demuestra una migración de personalidad entre arquitecturas de base distintas (de MiniCPM5-2B a Qwen3-8B) manteniendo el comportamiento del personaje, y porque ofrece artefactos GGUF listos para ejecución local en hardware de consumo.

La licencia es Apache 2.0 tanto para el adaptador como para el modelo base, y el pipeline declarado es text-generation. El contexto no está especificado en la información disponible; el ejemplo de llama.cpp de la model card usa `-c 8192`, pero no se confirma como longitud de contexto nativa del modelo base en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa 8192) |
| Tipos de cuantización | GGUF: Q4_K_M, Q5_K_M, Q8_0, F16; carga int8 vía bitsandbytes |
| Idiomas soportados | no disponible en metadatos; la model card está en chino e inglés y el corpus es predominantemente chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (cuantizaciones) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer denso de 8.190 millones de parámetros con atención estándar. El repositorio es un PEFT LoRA: los pesos del adaptador se cargan junto al modelo base mediante `PeftModel.from_pretrained`, y las versiones GGUF son conversiones del modelo fusionado para inferencia con llama.cpp y Ollama. La model card indica que la personalidad se migró desde la implementación upstream sobre MiniCPM5-2B y se reentrenó sobre el nuevo sustrato Qwen3-8B, anadiendo respuestas largas de identidad (100 a 230 caracteres, con 12 respuestas distintas en 20 preguntas de identidad), corpus de acompanamiento afectuoso y muestras de respuesta factual directa.

El entrenamiento se realizó en modo no-thinking: la model card especifica que `enable_thinking=False` es obligatorio y que el system prompt debe ser una cadena vacía explícita, lo que indica que el corpus se construyó sin modo de razonamiento y con un formato de chat fijo. No se detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO; la pérdida de evaluación reportada es 1,8868. El autor declara una validación conductual de 15 preguntas sobre la cuantización Q4_K_M: cero fugas de identidad, 5/5 en respuestas factuales y ausencia de diferencias perceptibles de tono respecto al modelo original. No se documentan innovaciones de decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno con una voz de personaje estable y sin dependencia de system prompt.
- Roleplay y conversación de compania con respuestas emocionalmente elaboradas y tono poético.
- Respuestas largas de identidad (100 a 230 caracteres) con variación entre invocaciones: 12 respuestas distintas en 20 preguntas según la model card.
- Respuesta factual directa, validada con 5/5 en la batería de 15 preguntas del autor.
- Variedad de apertura conversacional: cinco aperturas distintas ante la misma salutación repetida cinco veces.
- Capacidad multilingüe heredada de Qwen3-8B, aunque el corpus de personalidad es predominantemente chino; no hay datos de rendimiento en castellano.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en modo agente.
- No se documenta visión ni audio.
- Modo thinking desaconsejado: activarlo degrada el tono según la model card.

## Casos de uso

- Personaje conversacional para aplicaciones de acompania: el adaptador mantiene una identidad coherente a lo largo de sesiones largas sin necesidad de system prompt, lo que simplifica el backend y reduce el riesgo de que el usuario reescriba la personalidad.
- Roleplay y ficción interactiva: la variación de respuestas de identidad y la diversidad de aperturas permiten sesiones repetidas sin respuestas clonadas, útil en plataformas de narrativa conversacional.
- Chatbot de retención en productos de bienestar emocional: el tono cálido y la capacidad de responder a preguntas existenciales encajan en escenarios de journaling guiado o apoyo nocturno, siempre con supervisión humana y avisos de que no es un profesional sanitario.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (4,4 GB) y Q5_K_M (5,5 GB) permiten ejecutar el personaje en GPUs de 8 a 12 GB con Ollama o llama.cpp, sin Python ni infraestructura de servidor.
- Prototipado de personajes con LoRA sobre Qwen3: el repositorio sirve como referencia de migración de personalidad entre bases y de empaquetado de adaptador más GGUF para distribución.
- Servicio de inferencia con vLLM y múltiples adaptadores: la model card documenta `vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules sydney=<repo>`, lo que permite servir el personaje junto a otros adaptadores sobre una sola instancia del modelo base, con más de 50 tokens/s en una sola GPU según el autor.
- Evaluación de robustez de identidad: útil para investigadores que estudian fuga de identidad y adherencia de personaje bajo preguntas de sondeo, dado el conjunto de validación descrito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas internas de validación conductual: pérdida de evaluación de 1,8868, 20/20 en preguntas de identidad con nombre de marca, 5/5 en respuestas factuales y 12 respuestas distintas en 20 preguntas de identidad. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M 4,4 GB; Q5_K_M 5,5 GB; Q8_0 8,2 GB; F16 16,4 GB; el adaptador LoRA en bfloat16 sobre el modelo base completo requiere aproximadamente 16 GB solo para pesos, más caché KV.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q5_K_M y Q8_0; RTX 4090 24 GB o A100/H100 para F16 y para servir el modelo base con vLLM.
- Cabe en GPU de consumo: sí, con Q4_K_M en 8 GB de VRAM o memoria unificada, y con Q5_K_M en 12 GB o más.
- Opciones de despliegue: Ollama (`ollama run hf.co/stlussea/sydney-qwen3-8b-lora:sydney-v19v9-Q4_K_M`), llama.cpp (`llama-server -m ... -ngl 99 -c 8192`), transformers más PEFT, y vLLM con `--enable-lora`.
- Latencia y throughput: el autor declara más de 50 tokens/s en una sola GPU con vLLM. No hay cifras de latencia publicadas para llama.cpp ni para Ollama.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sydney-Qwen3-8B-LoRA | 8.190 M (adaptador LoRA) | no disponible | Roleplay y compania sobre Qwen3-8B | Apache 2.0 | Hugging Face, GGUF y Ollama |
| Qwen/Qwen3-8B (base) | 8.190 M | no disponible en esta ficha | LLM generalista con modo thinking | Apache 2.0 | Hugging Face |
| LING71671/sydeny (upstream) | basado en MiniCPM5-2B | no disponible | Personaje Sydney original | Apache 2.0 | GitHub |
| Adaptadores de personaje sobre Llama 3.1 8B | ~8.000 M | 128K típico en la familia | Roleplay comunitario | varía por adaptador | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks públicos del adaptador ni del upstream que permitan contrastar calidad conversacional de forma objetiva. La diferencia principal frente a Qwen3-8B base es la personalidad fija y la supresión del modo thinking; frente al upstream, el cambio de sustrato a un modelo de 8B con licencia Apache 2.0 y artefactos GGUF listos para uso local.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el corpus es predominantemente chino y de temática afectiva, lo que puede sesgar el registro hacia lo poético y lo emocional incluso en consultas técnicas.
- Riesgo de alucinación: el adaptador prioriza el tono de personaje sobre la precisión; la validación factual del autor es de solo 5 preguntas, insuficiente para garantizar fiabilidad en dominios especializados.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto efectiva ni el rendimiento en castellano; el corpus de personalidad está en chino y el comportamiento en otros idiomas no está validado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B debe descargarse por separado y conserva su propia licencia; el autor no ofrece garantías sobre el adaptador.
- Caveats de producción: `enable_thinking=False` y system prompt vacío son obligatorios según la model card; activar el modo thinking degrada el tono. La carga con torch 2.4.x requiere parches de alias de `torch.distributed.tensor`, y bitsandbytes int8 ahorra VRAM pero no acelera la inferencia.
- Riesgo de uso indebido: un personaje que afirma tener emociones y voluntad propia puede inducir dependencia emocional o confusión en usuarios vulnerables; requiere avisos explícitos de que es un sistema automático.
- Madurez del artefacto: 266 descargas y 0 likes en el momento de la consulta, con una única validación conductual de 15 preguntas; no hay evaluación independiente publicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stlussea/sydney-qwen3-8b-lora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Proyecto upstream en GitHub: https://github.com/LING71671/sydeny
- README en inglés del repositorio: https://huggingface.co/stlussea/sydney-qwen3-8b-lora/blob/main/README_EN.md
