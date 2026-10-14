# sumitkClasses/nanochat-d20-chat

## Resumen

nanochat-d20-chat es un modelo de chat de 897 millones de parámetros entrenado íntegramente desde cero (sin pesos ni tokenizador preentrenados) por el usuario sumitkClasses utilizando el framework karpathy/nanochat en su commit 92d63d4. Se trata de un transformer tipo GPT de 20 capas, anchura 1280 y 10 cabezas de atención, con RoPE, QK-norm y una ventana de contexto de 2048 tokens. Su interés radica en ser una reproducción completa y documentada del pipeline de nanochat: tokenizador BPE de 32.768 tokens entrenado desde cero, preentrenamiento con 3.480 millones de tokens de NVIDIA ClimbMix en FP8 durante 5,2 horas en una única H100, y una fase posterior de SFT y RL.

El modelo se publica bajo licencia MIT y solo soporta inglés. Está pensado como banco de pruebas reproducible para estudiar el entrenamiento de LLM a bajo coste, no como un asistente de propósito general: el propio autor advierte de que alucina con confianza, es débil en matemáticas y en conversaciones largas. Aun así, supera a la referencia original de nanochat d20 en varias tareas (CORE 0,236 frente a 0,222; ARC-Easy 55,2 % frente a 38,8 %; MMLU 35,2 % frente a 31,5 %) y se sitúa entre GPT-2 medium y GPT-2 XL en la métrica CORE.

El repositorio ocupa 5,3 GB e incluye checkpoints de SFT (`chatsft_checkpoints/d20`) y de RL (`chatrl_checkpoints/d20`), junto con el código de servicio en el repositorio private-llm del autor. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que se trata de una publicación reciente y sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nanochat GPT: transformer denso, 20 capas, anchura 1280, 10 cabezas, RoPE + QK-norm |
| Parámetros totales | 897M (≈393M en el transformer + ≈503M en las tablas de embeddings, incluyendo token embedding y value embeddings por capa) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible (el FP8 se usó durante el preentrenamiento, no se declaran formatos de cuantización para inferencia) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | checkpoints nativos del pipeline nanochat (no se declaran safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only tipo GPT implementado en nanochat: 20 capas, anchura 1280, 10 cabezas de atención, codificación posicional rotatoria (RoPE) y normalización sobre queries y keys (QK-norm). El modelo incluye tablas de value embeddings por capa, lo que explica que más de la mitad de los parámetros totales (≈503M de 897M) correspondan a embeddings en lugar de a pesos del transformer. El tokenizador es un BPE de 32.768 tokens entrenado desde cero, sin reutilizar vocabularios existentes.

El preentrenamiento consumió 3.480 millones de tokens del dataset NVIDIA ClimbMix durante 3.320 pasos en FP8, con un coste aproximado de 5,2 horas en una única H100 y una pérdida de validación final de 0,755 bits/byte. Después se aplicó un SFT de 467 pasos sobre una mezcla de SmolTalk, MMLU (repetido ×3) y GSM8K (repetido ×4), con 47 minutos de cómputo y una pérdida de validación de 0,296 bits/byte. Finalmente, el checkpoint de RL se obtuvo con 75 pasos de REINFORCE estilo GRPO sobre GSM8K (42 minutos en una H100), que elevaron la precisión en esa tarea del 1,5 % al 10,0 % sin regresión apreciable en ARC-Easy, ARC-Challenge ni MMLU. No se declara uso de DPO ni de RLHF con preferencias humanas.

## Capacidades

- Generación de texto en inglés fluido, con calidad suficiente para respuestas conversacionales cortas.
- Chat multiturno, aunque el propio autor advierte de que se degrada en conversaciones largas.
- Explicaciones sencillas de conceptos, poemas y relatos breves.
- Razonamiento de sentido común elemental: 55,2 % en ARC-Easy y 42,9 % en ARC-Challenge.
- Conocimiento general limitado: 35,2 % en MMLU.
- Generación de código muy básica: 11,0 % de pass@1 en HumanEval.
- Razonamiento matemático débil: 1,5 % en GSM8K tras SFT y 10,0 % tras RL (primeros 400 ejemplos).
- Soporte de tool calling / function calling: no disponible, no declarado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no declarado.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción de investigación en entrenamiento desde cero: el pipeline completo (tokenizador, preentrenamiento, SFT y RL) está documentado y se ejecuta en pocas horas sobre una H100, lo que permite estudiar cómo afectan los hiperparámetros al rendimiento final con un coste de cómputo reducido.
- Experimentos de RL sobre razonamiento matemático: el checkpoint `chatrl_checkpoints/d20` permite reproducir los 75 pasos de REINFORCE/GRPO sobre GSM8K y medir la transferencia a otras tareas sin regresión, algo poco habitual en modelos de este tamaño.
- Chatbot de demostración local en inglés: con 2048 tokens de contexto y menos de 2 GB de pesos en fp16, puede servirse en una GPU de gama media o incluso en CPU para prototipos de interfaz conversacional.
- Generación de texto creativo breve: poemas, microrrelatos y descripciones, tal como el autor indica en la model card; el modelo es adecuado cuando la calidad factual no es crítica.
- Asistente educativo básico en inglés: explicaciones simples de conceptos, siempre con revisión humana, dado que alucina con confianza.
- Servicio con API compatible con OpenAI: el repositorio private-llm incluye un servidor con interfaz Gradio y endpoint `/v1/chat/completions`, útil para integrar el modelo en herramientas que ya hablan el protocolo de OpenAI.
- Banco de pruebas de cuantización y despliegue: por su tamaño, sirve para comparar latencias y consumo de memoria entre backends sobre una arquitectura no estándar.
- Fine-tuning de dominio en inglés: la licencia MIT permite adaptar los checkpoints a un corpus propio, aunque la ventana de 2048 tokens limita los dominios con documentos largos.

## Benchmarks y rendimiento

Resultados declarados por el autor con el código de evaluación de nanochat. Ninguno está verificado de forma independiente.

| Benchmark | nanochat-d20-chat | nanochat d20 (referencia) |
|---|---:|---:|
| CORE (base, 22 tareas, 500/tarea) | 0,236 | 0,222 |
| ARC-Easy | 55,2 % | 38,8 % |
| ARC-Challenge | 42,9 % | — |
| MMLU | 35,2 % | 31,5 % |
| HumanEval (pass@1) | 11,0 % | 8,5 % |
| GSM8K (primeros 400) | 1,5 % | 4,6 % |
| GSM8K tras RL (primeros 400) | 10,0 % | 7,6 % |

Comparativa de CORE con la misma herramienta, según la model card:

| Modelo | CORE |
|---|---:|
| GPT-2 small (124M) | 0,123 |
| GPT-2 medium (355M) | 0,192 |
| nanochat-d20-chat (897M) | 0,236 |
| GPT-2 XL (1,5B, publicado) | 0,257 |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los 897M de parámetros ocupan aproximadamente 1,8 GB de pesos; en fp32, unos 3,6 GB. No se publican cifras oficiales.
- Caché KV: a partir de la arquitectura declarada (20 capas, 10 cabezas, anchura 1280), una estimación aritmética para 2048 tokens en fp16 ronda los 200 MB, aunque el dato no está confirmado por el autor.
- GPU recomendadas para entrenamiento: una única H100 fue suficiente para el preentrenamiento completo en FP8 (5,2 horas), el SFT (47 minutos) y el RL (42 minutos).
- GPU para inferencia: cualquier GPU con 4 GB o más de VRAM debería bastar en fp16. Cabe en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, así como en iGPU con memoria unificada suficiente.
- Opciones de despliegue declaradas: scripts propios de nanochat (`python -m scripts.chat_cli`) y el servidor compatible con OpenAI del repositorio private-llm (`nanochat-d20/serve/app.py`), con interfaz Gradio. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CORE | MMLU | HumanEval | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| nanochat-d20-chat | 897M | 2048 | 0,236 | 35,2 % | 11,0 % | MIT | HuggingFace + GitHub del autor |
| nanochat d20 (referencia) | ~897M (misma arquitectura d20) | no disponible | 0,222 | 31,5 % | 8,5 % | MIT | Repositorio karpathy/nanochat |
| GPT-2 medium | 355M | 1024 | 0,192 | no disponible | no disponible | MIT modificada (OpenAI) | HuggingFace (openai-community) |
| GPT-2 XL | 1,5B | 1024 | 0,257 | no disponible | no disponible | MIT modificada (OpenAI) | HuggingFace (openai-community) |
| shu127/nanochat-d20 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Alucinación: el autor advierte explícitamente de que el modelo inventa datos con confianza; no es fiable para consultas factuales.
- Matemáticas: GSM8K se queda en el 10,0 % tras RL sobre los primeros 400 ejemplos, muy por debajo de modelos contemporáneos de tamaño similar.
- Conversaciones largas: el rendimiento se degrada en diálogos extensos, según la propia model card.
- Contexto corto: 2048 tokens, insuficiente para documentos largos, resúmenes extensos o pipelines de RAG con muchos fragmentos.
- Idioma: solo inglés; no hay soporte multilingüe declarado.
- Datos de entrenamiento limitados: 3.480 millones de tokens, muy por debajo de los estándares actuales, lo que explica el escaso conocimiento del mundo.
- Benchmarks no verificados: todas las métricas del `model-index` están marcadas con `verified: false` y proceden del propio autor.
- Sin tracción ni validación externa: 0 descargas y 0 likes en HuggingFace, y ausencia de evaluaciones independientes.
- Soporte de herramientas: no se declara tool calling, function calling ni integración con frameworks de agentes.
- Despliegue: al usar checkpoints nativos de nanochat, no se puede cargar directamente con vLLM, llama.cpp, Ollama o TGI sin trabajo de conversión adicional.
- Licencia: MIT, permisiva para uso comercial, pero con la advertencia de que la calidad del modelo hace desaconsejable su uso en producción sin validación humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sumitkClasses/nanochat-d20-chat
- Framework nanochat (karpathy): https://github.com/karpathy/nanochat
- Documentación de nanochat en DeepWiki: https://deepwiki.com/karpathy/nanochat
- Pipeline de entrenamiento de nanochat (DeepWiki): https://deepwiki.com/karpathy/nanochat/2.3-training-pipeline-overview
- Repositorio del autor (scripts, logs y servicio): https://github.com/rsumit123/private-llm
- Servidor compatible con OpenAI: https://github.com/rsumit123/private-llm/blob/main/nanochat-d20/serve/app.py
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/sumitkClasses/scratchq-110
- Reproducción comunitaria relacionada: https://huggingface.co/shu127/nanochat-d20
