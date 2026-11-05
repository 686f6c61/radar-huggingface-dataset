# Xerxes-28/AEGIS-Mini-1.0-4B-LoRA

## Resumen

AEGIS-Mini-1.0 es un adaptador LoRA (PEFT) de ajuste fino supervisado (SFT) sobre el modelo base Qwen3-4B, desarrollado por el usuario Xerxes-28. Está especializado en dominios técnicos concretos: electrónica, drones, robótica, matemáticas y física, con un enfoque mayoritariamente teórico según declara el propio autor. El adaptador entrena 33.030.144 parámetros (un 0,81 % de los 4.055.498.240 del modelo base), por lo que el coste de almacenamiento es mínimo (repo de 0,1 GB) y reutiliza toda la capacidad del Qwen3-4B subyacente.

El modelo resuelve el problema de disponer de un asistente compacto y ejecutable en hardware modesto (incluso teléfonos tras conversión a GGUF) para consultas de ingeniería y cálculo paso a paso. Al ser un adaptador, no es un modelo autónomo: requiere cargar el base `unsloth/Qwen3-4B-unsloth-bnb-4bit` junto con los pesos LoRA. La longitud de contexto usada durante el entrenamiento fue de 2.048 tokens, aunque el contexto máximo real vendrá determinado por el Qwen3-4B base.

Es relevante ahora por su nicho muy definido y su licencia Apache-2.0, que permite uso comercial sin restricciones adicionales, y porque demuestra el patrón habitual de fine-tuning ligero con Unsloth/QLoRA sobre modelos pequeños para dominios verticales. No obstante, el autor no ha publicado benchmarks y advierte explícitamente de que las salidas no deben usarse como única fuente en cálculos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con adaptador LoRA PEFT |
| Parametros totales | 4.055.498.240 (modelo base) |
| Parametros activos | 33.030.144 entrenables en el adaptador (0,81 %) |
| Longitud de contexto | 2.048 tokens en entrenamiento; máximo del base Qwen3-4B (no disponible en la informacion) |
| Tipos de cuantizacion | Base en 4-bit (bnb-4bit); version GGUF en repo separado |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); GGUF en repo separado |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-4B, un transformer decoder-only causal. El entrenamiento emplea QLoRA: el base se carga cuantizado en 4 bits (bnb-4bit) y solo se actualizan las matrices de bajo rango del adaptador, lo que reduce drásticamente los requisitos de memoria. La librería de referencia es PEFT, con Unsloth para acelerar el proceso y TRL para el bucle de SFT. El contexto de entrenamiento fue de 2.048 tokens y la fecha de entrenamiento declarada es 2026-10-31.

Los datos de entrenamiento provienen de dos conjuntos públicos citados en la model card: `HuggingFaceH4/MATH-500` y `mrohith29/high-school-physics`, complementados (según la descripción) con preguntas y respuestas sobre electrónica, drones y robótica. El autor indica que la mayor parte del material es teórico. No se documenta el número total de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; tampoco se detallan innovaciones técnicas más allá del uso de QLoRA y Unsloth.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (chat template de Qwen3).
- Explicación de conceptos de electrónica: ley de Ohm, filtros, polarización de transistores.
- Explicación de conceptos de drones y robótica: control PID, fusión de sensores.
- Resolución de cálculos matemáticos y de física paso a paso, mostrando fórmula, pasos y unidades.
- Redacción de borradores de respuestas técnicas sujetas a verificación posterior.
- Uso como compañero de estudio y práctica en las disciplinas cubiertas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Estudio de electrónica básica: el modelo explica la ley de Ohm, el dimensionado de resistencias para LEDs o la polarización de transistores, mostrando la fórmula y los pasos con unidades, lo que lo hace útil como tutor de prácticas.
- Cálculo guiado de ejercicios de física: resuelve problemas de cinemática, dinámica o circuitos paso a paso, adecuado para estudiantes que necesitan ver el desarrollo y no solo el resultado.
- Asistencia en el diseño preliminar de circuitos: genera un primer borrador de valores (por ejemplo, resistencia limitadora) que el ingeniero valida después contra la hoja de datos, gracias a su especialización teórica.
- Consultas sobre control de drones: explica la sintonización de un PID o la fusión de sensores, útil como material de repaso antes de probar configuraciones en un banco de pruebas.
- Despliegue en dispositivos móviles: al existir una versión GGUF, puede ejecutarse en teléfonos y portátiles para consultas offline de electrónica y matemáticas sin conexión.
- Generación de borradores de documentación técnica: redacta explicaciones de conceptos de robótica o electrónica que el autor revisa y corrige, aprovechando su vocabulario de dominio.
- Base para fine-tuning adicional: al ser un adaptador LoRA ligero (0,1 GB) sobre un base Apache-2.0, sirve como punto de partida para especializaciones posteriores con bajo coste de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no ejecutó benchmarks públicos y remite a las secciones de resultados y limitaciones de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el base en 4-bit ocupa aproximadamente 2,5-3 GB de pesos; con overhead de activaciones y caché KV, se estima un rango de 4-6 GB para contextos de 2.048 tokens (estimación, no dato del autor).
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060/4060, RTX 4070, RTX 4090); para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; también en CPU vía GGUF.
- Opciones de despliegue: Unsloth (`FastLanguageModel`), Transformers + PEFT + bitsandbytes, y llama.cpp/Ollama mediante la versión GGUF del repo separado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AEGIS-Mini-1.0 (este) | 4,05 B (adaptador 33 M) | 2.048 en entrenamiento | Apache-2.0 | HuggingFace (LoRA + GGUF) | Especializado en electrónica, drones, robótica, matemáticas y física; sin benchmarks |
| Qwen3-4B (base) | 4,05 B | No disponible en la informacion | Apache-2.0 | HuggingFace | Modelo generalista; el adaptador hereda su arquitectura y contexto |
| Alternativas de 4B especializadas en matemáticas/física | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

## Limitaciones y advertencias

- Riesgo de alucinación elevado en valores numéricos: el autor advierte de que el modelo puede dar una cifra errónea con tono seguro, lo que en electrónica puede provocar daños o incendios.
- No apto para decisiones de seguridad: prohibido su uso como única fuente en cálculos de seguridad, tensiones de red o circuitos de alta tensión.
- No usar para valores finales de diseño de circuitos, baterías o aeronaves; verificar siempre contra la hoja de datos del componente.
- No usar para consejo médico, legal o financiero.
- No fiable para datos exactos de hojas de datos (direcciones de registro, números de pin).
- Entrenado principalmente con material teórico: puede fallar en detalles prácticos o de implementación.
- Solo inglés: no soporta castellano ni otros idiomas de forma fiable.
- Contexto de entrenamiento corto (2.048 tokens): conversaciones o documentos largos pueden degradar la calidad.
- Sin benchmarks publicados: el rendimiento real en tareas de dominio no está cuantificado.
- Licencia Apache-2.0 permite uso comercial, pero las advertencias de seguridad del autor siguen aplicando en producción.

## Enlaces

- HuggingFace (adaptador LoRA): https://huggingface.co/Xerxes-28/AEGIS-Mini-1.0-4B-LoRA
- HuggingFace (versión GGUF): https://huggingface.co/Xerxes-28/AEGIS-Mini-V1-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset high-school-physics: https://huggingface.co/datasets/mrohith29/high-school-physics
- Paper Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Paper QLoRA (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
- Paper DPO (arXiv:2305.20050): https://arxiv.org/abs/2305.20050
- Paper Adam (arXiv:1711.05101): https://arxiv.org/abs/1711.05101
- Paper Layer Normalization (arXiv:1608.03983): https://arxiv.org/abs/1608.03983
- Paper sobre atención (arXiv:2103.03874): https://arxiv.org/abs/2103.03874
- Paper sobre preentrenamiento (arXiv:2110.02861): https://arxiv.org/abs/2110.02861
