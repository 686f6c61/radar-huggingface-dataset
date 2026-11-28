# Thox-ai/ThoxClip-Qwen3-0.6B

## Resumen

ThoxClip-Qwen3-0.6B es un ajuste fino por LoRA (rango 32) del modelo Qwen3-0.6B de Alibaba Qwen, desarrollado por Thox-ai como asistente on-device para su producto ThoxClip. El entrenamiento se realizo sobre un corpus propio de 205 ejemplos de chat y uso de herramientas, posteriormente fusionado en los pesos base. El modelo resultante tiene 596.049.920 parametros y se distribuye tanto en safetensors como en GGUF Q4_K_M, con soporte para Ollama y transformers.

La relevancia de este modelo no reside en su rendimiento bruto, sino en su enfoque de despliegue: esta disenado para ejecutarse en dispositivos de borde (edge) con requisitos minimos de hardware, y su model card establece explicitamente que debe servirse con un system prompt de "device-facts" (grounding) y con el modo thinking desactivado. El autor advierte que un despliegue sin ese grounding queda "fuera de contrato", lo que lo convierte en un caso interesante de modelo con contrato de servicio explicito.

El modelo se publica bajo licencia Apache-2.0, es de acceso publico sin gating y esta disponible en Ollama. Su evaluacion interna (GATE49) arroja 22/49 en el conjunto de desarrollo, un resultado que el propio autor presenta como baseline y no como un logro destacado, con un punto fuerte relativo en la categoria "known-false" (9/10).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF incluido en el repo); safetensors en precision original |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 1.192.135.096 B) y GGUF (ThoxClip-Qwen3-0.6B.Q4_K_M.gguf, 396.704.672 B) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. Sobre esa base, Thox-ai aplico un ajuste fino supervisado (SFT) mediante LoRA de rango 32 sobre un corpus propio de 205 ejemplos de chat y uso de herramientas (dataset `Thox-ai/thox-factory-sft-v5`), y posteriormente fusiono los adaptadores en los pesos base. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovacion tecnica destacable no esta en la arquitectura sino en el contrato de despliegue: el modelo debe servirse con un system prompt de hechos del dispositivo (grounding) y con el modo thinking desactivado. Ademas, el autor preve escalado a MeshStack para preguntas fuera de los hechos entrenados, lo que configura un patron de "modelo pequeno + orquestacion externa" para entornos de borde.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a un asistente de dispositivo.
- Uso de herramientas (tool-use) entrenado explicitamente en el corpus SFT.
- Disciplina "known-false": capacidad relativamente fuerte de reconocer informacion falsa o fuera de su alcance (9/10 en la categoria correspondiente de GATE49).
- Despliegue on-device y edge con huella de memoria reducida.
- Integracion con Ollama y transformers.
- Escalado a servicios externos (MeshStack) para consultas fuera de los hechos entrenados.
- No se documentan capacidades de vision, audio, razonamiento multi-paso avanzado ni soporte multilingue mas alla del ingles.

## Casos de uso

- Asistente de dispositivo ThoxClip: el modelo esta entrenado especificamente para responder sobre los hechos del dispositivo ThoxClip, servido con el system prompt de grounding; es su caso de uso nominal y el unico contemplado por el contrato del autor.
- Asistente local en dispositivos de recursos limitados: con 0.6B parametros y un GGUF Q4_K_M de ~397 MB, puede ejecutarse en hardware de borde sin GPU dedicada, ofreciendo conversacion basica offline.
- Clasificacion y respuesta a consultas de soporte de producto: gracias a su disciplina known-false, es adecuado para responder "no lo se" ante preguntas fuera de su dominio en lugar de alucinar, siempre con escalado a un servicio externo.
- Prototipado de pipelines de tool calling: el corpus SFT incluye ejemplos de uso de herramientas, lo que permite experimentar con function calling en entornos locales antes de escalar a modelos mayores.
- Base para fine-tunes de dominio: al ser Apache-2.0 y estar disponible en safetensors, sirve como punto de partida para ajustes especificos de producto con LoRA.
- Evaluacion de contratos de despliegue: util para investigadores que quieran estudiar el efecto del grounding y del modo thinking-off en modelos pequenos, dado que el autor documenta explicitamente el contrato de servicio.
- Integracion en aplicaciones de escritorio o moviles via Ollama: el modelo se distribuye como `Thox-ai/thoxclip-qwen3-0.6b`, lo que simplifica su inclusion en aplicaciones locales con un solo comando.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| GATE49 (global) | 22/49 | Conjunto de desarrollo; baseline segun el autor |
| GATE49 known-false | 9/10 | Eje comparativamente fuerte del baseline |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamano (0.6B parametros), el GGUF Q4_K_M (~397 MB) cabe holgadamente en GPU consumer con 4 GB o menos, y el safetensors en fp16 requiere aproximadamente 1,2 GB.
- GPU recomendadas: no disponible; el modelo esta orientado a edge y CPU, por lo que no requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: transformers (safetensors), Ollama (GGUF), llama.cpp (GGUF Q4_K_M), text-generation-inference (tag `text-generation-inference`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Requisito de serving: thinking-off y system prompt de grounding aplicado en la capa de serving.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxClip-Qwen3-0.6B | 0.6B | no disponible | Apache-2.0 | HF + Ollama | Fine-tune de dominio con grounding obligatorio |
| Qwen/Qwen3-0.6B | 0.6B | no disponible | Apache-2.0 | HF | Modelo base, sin contrato de despliegue |
| Otros fine-tunes de Qwen3-0.6B | ~0.6B | no disponible | variable | HF | No disponible comparativa especifica en la informacion |

No se dispone de datos de rendimiento comparativo con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Grounding obligatorio: el autor declara que el despliegue sin el system prompt de hechos del dispositivo queda "fuera de contrato"; no debe usarse como modelo generico sin esa capa.
- Thinking-off obligatorio: el modo thinking debe desactivarse en serving.
- Resultado GATE49 modesto (22/49): el propio autor lo presenta como baseline y no como un resultado fuerte.
- Corpus de entrenamiento muy pequeno (205 ejemplos), lo que limita la generalizacion y aumenta el riesgo de sobreajuste al dominio ThoxClip.
- Solo ingles: no hay soporte multilingue documentado.
- Riesgo de alucinacion fuera de los hechos entrenados; el autor mitiga con escalado a MeshStack.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero el contrato de despliegue (grounding y thinking-off) es una condicion tecnica del autor, no una restriccion legal.
- Longitud de contexto no disponible; verificar en `config.json` antes de usarlo con conversaciones largas.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxClip-Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Ollama: `ollama pull Thox-ai/thoxclip-qwen3-0.6b`
- No se han encontrado papers, blogs o repositorios adicionales en la informacion disponible.
