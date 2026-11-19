# Thox-ai/ThoxClip-Qwen3-0.6B

## Resumen

ThoxClip-Qwen3-0.6B es un ajuste fino (fine-tune) del modelo Qwen3-0.6B de Alibaba, desarrollado por Thox-ai como asistente on-device para su producto ThoxClip. Se trata de una LoRA de rango 32 entrenada sobre un corpus propio de 205 ejemplos de conversación y uso de herramientas, fusionada posteriormente en los pesos base. El resultado es un modelo denso de aproximadamente 596 millones de parámetros, publicado bajo licencia Apache 2.0 y disponible tanto en safetensors como en GGUF Q4_K_M.

La relevancia del modelo reside en su enfoque de despliegue en el borde (edge): un tamaño que cabe en dispositivos de consumo y una integración directa con Ollama. Sin embargo, el propio autor lo publica como una "baseline" con una condición explícita: debe servirse con un system prompt de hechos de dispositivo (grounding) y con el modo thinking desactivado. Sin ese contexto, el autor declara el despliegue "fuera de contrato", lo que limita su uso como modelo de propósito general.

El modelo está orientado exclusivamente al inglés y su evaluación principal, GATE49, arroja un resultado de 22/49 en el conjunto de desarrollo, que el propio autor presenta como una línea base modesta y no como un resultado sólido. Es, por tanto, un modelo especializado y de nicho, más útil como componente de un producto concreto que como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B) |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (GGUF incluido en el repo); safetensors en precision completa |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only denso de la familia Qwen3. Sobre esa base, Thox-ai aplicó un ajuste fino mediante LoRA de rango 32 entrenado con un corpus propio de 205 ejemplos que combinan conversación y uso de herramientas (tool-use). Posteriormente, el adaptador LoRA se fusionó en los pesos base, dando lugar a un checkpoint único publicado en safetensors. El repositorio incluye también un `training_summary.json` con el registro legible por máquina de la ejecución de entrenamiento, aunque los detalles concretos de hiperparámetros (tasa de aprendizaje, épocas, composición exacta del dataset) no se detallan en la información disponible.

No se documenta en la información proporcionada el uso de RLHF, DPO ni ninguna técnica de alineación posterior al SFT. El entrenamiento se describe explícitamente como SFT (supervised fine-tuning). Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el modelo hereda la arquitectura del base Qwen3-0.6B sin modificaciones estructurales. El autor indica que debe servirse con thinking desactivado y con un system prompt de grounding aplicado en la capa de servicio.

## Capacidades

- Generación de texto conversacional en inglés, orientada a un asistente de dispositivo.
- Uso de herramientas (tool-use / function calling), entrenado explícitamente sobre ejemplos de este tipo.
- Disciplina ante afirmaciones falsas: el autor reporta 9/10 en la categoría "known-false" de GATE49, el eje comparativamente más fuerte de esta línea base.
- Capacidad de escalado a MeshStack para preguntas fuera de los hechos entrenados (según el autor, como mecanismo de servicio, no como capacidad intrínseca del modelo).
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni razonamiento multi-paso complejo.
- Multilingüismo limitado: solo inglés declarado.
- Modo thinking disponible en el modelo base, pero el autor exige servirlo desactivado.

## Casos de uso

- Asistente on-device para ThoxClip: el modelo está diseñado específicamente para responder sobre los hechos del dispositivo cuando se le aplica el system prompt de grounding, lo que lo hace adecuado para consultas de producto en local.
- Despliegue en hardware de consumo: gracias a su tamaño de 0,6B y a la cuantización Q4_K_M (396 MB), puede ejecutarse en equipos sin GPU dedicada mediante Ollama, lo que encaja en escenarios de asistencia local-first.
- Integración en flujos con tool calling: al haber sido entrenado sobre ejemplos de uso de herramientas, puede emplearse en pipelines donde el modelo decida invocar funciones simples definidas por el desarrollador.
- Filtrado de respuestas ante preguntas sensibles: su resultado en la categoría known-false sugiere utilidad en tareas donde debe rechazar o corregir afirmaciones incorrectas dentro de un dominio acotado.
- Prototipado rápido de asistentes especializados: sirve como punto de partida para experimentar con fine-tunes pequeños en entornos de investigación con recursos limitados.
- Componente de respaldo en arquitecturas con escalado: puede actuar como primera capa de un sistema que derive consultas fuera de dominio a un servicio mayor (MeshStack), reduciendo coste y latencia en consultas frecuentes.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| GATE49 (conjunto de desarrollo) | 22/49 | Línea base publicada por el autor; no se presenta como resultado sólido |
| GATE49 — categoría known-false | 9/10 | Eje comparativamente fuerte según el autor |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (safetensors): aproximadamente 2,4 GB para los pesos (1,19 GB de checkpoint) más overhead de activaciones y KV cache; en la práctica, unos 3-4 GB.
- VRAM estimada con GGUF Q4_K_M: en torno a 0,5-1 GB, apto para CPU y GPUs de gama baja.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; para Q4_K_M basta con GPU integradas o CPU moderna.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, e incluso en dispositivos con 4 GB o menos usando Q4_K_M.
- Opciones de despliegue: transformers, Ollama (soporte oficial vía `ollama pull Thox-ai/thoxclip-qwen3-0.6b`), llama.cpp (formato GGUF), y potencialmente vLLM/TGI para el checkpoint safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxClip-Qwen3-0.6B | 0,6B | no disponible | Apache 2.0 | HF + Ollama | Fine-tune especializado con grounding obligatorio |
| Qwen/Qwen3-0.6B | 0,6B | no disponible | Apache 2.0 | HF | Modelo base, propósito general, sin grounding requerido |
| Otros fine-tunes de 0,5-1B | variable | variable | variable | variable | No se dispone de datos comparativos en la información proporcionada |

La comparación más directa es con su modelo base Qwen3-0.6B, que ofrece mayor generalidad y no exige un system prompt específico. Frente a otros fine-tunes pequeños de la misma categoría, no se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Grounding obligatorio: el autor declara que el despliegue sin el system prompt de hechos de dispositivo está "fuera de contrato"; usarlo en crudo puede producir respuestas incorrectas sobre el producto.
- Resultado de evaluación modesto: GATE49 22/49 en desarrollo indica un rendimiento limitado en la puerta de evaluación propia del autor.
- Corpus de entrenamiento muy pequeño: 205 ejemplos, lo que limita la cobertura y aumenta el riesgo de sobreajuste a ese dominio.
- Solo inglés: no se declara soporte multilingüe.
- Riesgo de alucinación: al ser un modelo de 0,6B, la generación de hechos no verificados es plausible, especialmente fuera del dominio de grounding.
- Licencia Apache 2.0 permite uso comercial, pero el autor condiciona el despliegue al cumplimiento del contrato de servicio (grounding + thinking-off); conviene revisar si esa condición tiene implicaciones legales para producción.
- No se documentan sesgos específicos ni evaluaciones de seguridad más allá de GATE49.
- Contexto no especificado: se desconoce la ventana máxima efectiva, lo que dificulta planificar conversaciones largas.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxClip-Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Ollama: https://ollama.com/Thox-ai/thoxclip-qwen3-0.6b
- No se han encontrado papers, blogs o repositorios adicionales en la información proporcionada.
