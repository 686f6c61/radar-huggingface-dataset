# Thox-ai/ThoxAir-0.5B

## Resumen

ThoxAir-0.5B es un modelo de generación de texto de 494 millones de parámetros publicado por Thox-ai (THOX.ai), un fine-tune del modelo base Qwen/Qwen2.5-0.5B-Instruct. Se trata del "flagship" de la familia ThoxAir, orientado a despliegue en dispositivo (on-device) y entornos edge, con el objetivo declarado de incorporar "hechos canónicos THOX" y comportamiento conversacional de marca. La build Wave C.2 fusiona un adaptador LoRA (fp-LoRA) en los pesos base en bf16 mediante `merge_and_unload`.

El modelo se distribuye con pesos completos en safetensors, cuantizaciones GGUF Q4_K_M y Q8_0, y un Modelfile para Ollama, lo que facilita su ejecución en hardware de consumo. Su tamaño reducido (repo de 2,0 GB, pesos safetensors de 988 MB) lo sitúa en la categoría de modelos ultraligeros, adecuados para inferencia local con requisitos de memoria mínimos.

Es relevante por su enfoque "local-first" y su licencia Apache-2.0, que permite uso comercial sin restricciones adicionales. Sin embargo, la información pública sobre benchmarks estandarizados es prácticamente inexistente: el autor reporta únicamente un resultado interno (GATE49 47/49 sobre un conjunto de desarrollo propio), sin comparativas con MMLU, HumanEval u otros benchmarks reconocidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct; el autor no la especifica) |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en la arquitectura Qwen2, con 494 millones de parámetros. El proceso de construcción consistió en entrenar un adaptador LoRA (fp-LoRA) sobre Qwen/Qwen2.5-0.5B-Instruct usando el dataset propio `Thox-ai/thox-factory-sft-v5` (SFT, supervised fine-tuning), y posteriormente fusionarlo en los pesos base en bf16 mediante `merge_and_unload`. El autor indica que el adaptador se entrenó sobre datos SFT propios de THOX y que la fusión se realizó internamente, con una comprobación de recarga standalone en la configuración "gated" antes de la subida.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO. El autor menciona una "Wave C.2 finishing gate" y una evaluación interna denominada GATE49, pero no se detalla la metodología de entrenamiento más allá del SFT. La innovación técnica destacable es la inclusión de cuantizaciones GGUF listas para Ollama y un Modelfile preconfigurado, orientado a despliegue local inmediato.

## Capacidades

- Generación de texto conversacional en inglés, con comportamiento ajustado a "hechos canónicos THOX" y estilo de marca.
- Fine-tuning SFT orientado a respuestas de dominio específico (información corporativa de THOX).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Ejecución en dispositivo (on-device) y entornos edge gracias a su tamaño reducido y cuantizaciones GGUF.

## Casos de uso

- Asistente conversacional local en dispositivos de gama baja: el modelo puede ejecutarse en CPU o GPU integrada con la cuantización Q4_K_M (397 MB), adecuado para respuestas conversacionales básicas sin conexión.
- Chatbot de atención al cliente para información corporativa: el fine-tune incorpora "hechos canónicos THOX", por lo que puede responder preguntas sobre productos y políticas de la marca con un estilo consistente.
- Despliegue en Ollama para prototipado rápido: el repositorio incluye un Modelfile y el modelo está publicado como `thox-ai/thoxair-0.5b`, lo que permite `ollama run` inmediato para pruebas de concepto.
- Aplicaciones de escritorio o móviles con requisitos de memoria mínimos: con menos de 1 GB en bf16 y ~400 MB en Q4_K_M, cabe en dispositivos con 2-4 GB de RAM disponible.
- Generación de texto en pipelines de CI/CD para pruebas: su licencia Apache-2.0 y tamaño permiten incluirlo en tests automatizados de integración de sistemas conversacionales.
- Filtrado o clasificación de texto simple en edge: aunque no está especializado en ello, su naturaleza ligera permite tareas de generación corta en entornos con recursos limitados.

## Benchmarks y rendimiento

El autor reporta un resultado interno denominado GATE49: 47/49 en el conjunto de desarrollo, con "cero fallos duros conocidos como falsos". No se proporcionan resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros modelos.

| Benchmark | Resultado | Notas |
|---|---|---|
| GATE49 (desarrollo, interno) | 47/49 | Evaluación propia del autor, Wave C.2; no comparable con benchmarks públicos |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 GB en bf16 (pesos de 988 MB), ~400 MB en Q4_K_M, ~530 MB en Q8_0.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100 sin problemas de memoria.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: Ollama (soporte oficial vía `ollama run Thox-ai/thoxair-0.5b`), llama.cpp (GGUF), transformers (safetensors), text-generation-inference (según tags).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxAir-0.5B | 494 M | no disponible | Apache-2.0 | HF, Ollama | Fine-tune de Qwen2.5-0.5B-Instruct |
| Qwen2.5-0.5B-Instruct | ~494 M | 32 K (según documentación de Qwen) | Apache-2.0 | HF | Modelo base; contexto no confirmado en esta ficha |
| SmolLM2-360M-Instruct | 360 M | 8 K | Apache-2.0 | HF | Alternativa ultraligera de Hugging Face |
| Phi-3-mini (3.8B) | 3.8 B | 4 K | MIT | HF | Mayor tamaño, mayor capacidad |

La comparativa se limita a datos de tamaño y licencia; no hay benchmarks públicos de ThoxAir-0.5B que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un fine-tune de Qwen2.5-0.5B, hereda los sesgos del modelo base.
- Riesgo de alucinación: alto en un modelo de 0.5B, especialmente en tareas de conocimiento factual fuera del dominio THOX.
- Limitaciones de contexto: la longitud de contexto no se especifica en la información proporcionada; el modelo base Qwen2.5-0.5B-Instruct soporta 32 K, pero el autor no lo confirma.
- Limitaciones de idioma: solo inglés según la model card.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones adicionales, pero el autor incluye notas sobre "libertad creativa" y ausencia de restricciones artificiales; no hay cláusulas adicionales.
- Caveat para producción: el resultado GATE49 es una evaluación interna sobre un conjunto de desarrollo propio, no un benchmark independiente; no hay evidencia de rendimiento en tareas generales.
- El modelo está asociado a una campaña de Kickstarter y a un ecosistema de hardware propietario; la model card incluye contenido promocional que no afecta a la licencia pero conviene contextualizar.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxAir-0.5B
- Repositorio del adaptador Wave C.2: https://huggingface.co/Thox-ai/ThoxAir-0.5B-WaveC2
- Repositorio de pesos fusionados (build record): https://huggingface.co/Thox-ai/ThoxAir-0.5B-WaveC2-Merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset SFT: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Ollama: `ollama run Thox-ai/thoxair-0.5b`
- Demo de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campaña Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
