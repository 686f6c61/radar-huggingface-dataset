# venkateshchsagalm/SagaLM-slm2

## Resumen

SagaLM-slm2 es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-7B-Instruct, desarrollado por el usuario venkateshchsagalm. El modelo se presenta como una asistente conversacional con identidad propia ("SagaLM") y se entrena mediante QLoRA y SFT (supervised fine-tuning) sobre una mezcla de datasets de instrucción, conversación, razonamiento, matemáticas y código. Su objetivo es ofrecer una alternativa ligera y especializada al modelo base, manteniendo la compatibilidad total con la implementación de Transformers de Qwen2.

Con 7.615.616.512 parámetros (7,6 mil millones), el modelo hereda la arquitectura transformer de Qwen2.5-7B-Instruct y se ha entrenado con una longitud de contexto de 2048 tokens, aunque el modelo base soporta hasta 32.768 tokens. Al ser un fine-tune con QLoRA, los pesos completos se distribuyen en formato safetensors (15,2 GB). No se especifica licencia ni idiomas soportados en la información proporcionada.

La relevancia de este modelo reside en su enfoque en la identidad del asistente y en el entrenamiento con pérdida solo en las respuestas (completion-only loss), lo que puede mejorar la adherencia al rol y la calidad de las respuestas generadas en tareas de conversación y razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2, compatible con Qwen2.5) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (entrenamiento); el modelo base soporta 32.768 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (hereda los del modelo base, probablemente multilingüe, pero no confirmado) |
| Licencia | No disponible |
| Formato de pesos | safetensors (15,2 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer causal con atención completa, tal como se implementa en Qwen2.5-7B-Instruct. El ajuste fino se realizó con QLoRA (Quantized Low-Rank Adaptation), con rango 16, alpha 32 y dropout 0.05, sobre una longitud de contexto de 2048 tokens. El entrenamiento usó un tamaño de lote efectivo de 4 y 1200 pasos, con pérdida calculada únicamente sobre los tokens de respuesta (los tokens del prompt se enmascaran con -100). Se aplicó además un filtrado de respuestas largas y se incluyeron filas cortas de anclaje de identidad.

La mezcla de datasets cubre instrucciones, conversación, razonamiento, matemáticas y código. El modelo fue entrenado para identificarse como "SagaLM" y no como Qwen, ChatGPT, Claude u otro asistente. No se menciona el uso de RLHF ni DPO; solo SFT con QLoRA.

## Capacidades

- Generación de texto conversacional y de instrucciones, con identidad propia definida.
- Razonamiento lógico y matemático, gracias a la inclusión de datasets de razonamiento y matemáticas en el entrenamiento.
- Generación de código, al estar entrenado con datasets de programación.
- Soporte de conversaciones multi-turno (formato chat de Qwen2.5).
- Capacidad multilingüe heredada del modelo base Qwen2.5-7B-Instruct (no confirmada en la documentación del fine-tune).
- No se especifica soporte para tool calling, function calling, agentes, visión o audio; el modelo base sí los soporta parcialmente, pero el fine-tune no lo documenta.

## Casos de uso

- Asistente conversacional con identidad de marca: el modelo puede integrarse en productos que requieran un asistente con una personalidad y nombre propios (SagaLM), sin que el usuario perciba que está hablando con Qwen u otro modelo genérico.
- Generación de respuestas largas y detalladas: gracias al filtrado de respuestas largas y al entrenamiento con completion-only loss, es adecuado para producir explicaciones extensas y coherentes.
- Tutor virtual de matemáticas y razonamiento: el entrenamiento con datasets de matemáticas y razonamiento permite usarlo en plataformas educativas para resolver problemas paso a paso.
- Asistente de programación en entornos de desarrollo: puede generar fragmentos de código, explicar algoritmos o depurar errores, aprovechando su entrenamiento en datasets de código.
- Chatbots de atención al cliente con contexto limitado: con una ventana de 2048 tokens, es viable para conversaciones de soporte de longitud media, siempre que no se requiera un historial muy largo.
- Prototipado rápido de aplicaciones de IA generativa: al ser un fine-tune ligero (7,6 B), puede desplegarse en GPU de consumo medio para pruebas y pilotos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,6 B de parámetros en FP16, se necesitan aproximadamente 15-16 GB de VRAM para carga completa. Con cuantización a 8 bits, unos 8 GB; con 4 bits, unos 5-6 GB (estimación basada en modelos de tamaño similar, no confirmada para este fine-tune).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16; RTX 3060/4070 (12 GB) para cuantización 8 bits; GPU con 8 GB o menos para cuantización 4 bits (p. ej., RTX 4060, RTX 3060 Ti).
- En consumer GPU: sí, cabe en GPUs de gama media-alta con cuantización.
- Opciones de despliegue: compatible con el ecosistema Transformers, por lo que puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) u Ollama (con conversión previa). La etiqueta `text-generation-inference` y `endpoints_compatible` sugieren compatibilidad con soluciones de inferencia estándar.
- Latencia y throughput: no disponible; dependerá del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| SagaLM-slm2 | 7,6 B | 2048 (fine-tune) | QLoRA/SFT sobre Qwen2.5-7B-Instruct | No disponible |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 | Pre-entrenamiento + SFT + RLHF | Apache 2.0 (según documentación oficial de Qwen) |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 | SFT + RLHF | Llama 3.1 Community License |

La comparación directa con otros fine-tunes de Qwen2.5-7B no está disponible por falta de datos. El modelo base Qwen2.5-7B-Instruct ofrece mayor contexto y una licencia clara, mientras que SagaLM-slm2 aporta una identidad específica y un entrenamiento enfocado en respuestas largas, pero con contexto reducido y licencia no especificada.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica bajo qué licencia se distribuye el modelo, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar al autor antes de usarlo en producción.
- Longitud de contexto limitada a 2048 tokens en el entrenamiento: aunque el modelo base soporta 32.768, el fine-tune puede degradarse con contextos más largos. Se recomienda no superar 2048 tokens de entrada.
- Idiomas no documentados: no se confirma qué idiomas maneja correctamente; aunque el base es multilingüe, el fine-tune podría tener sesgos hacia los idiomas de sus datasets de entrenamiento (no especificados).
- Riesgo de alucinación: al ser un modelo de 7,6 B, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o hechos factuales.
- Sin soporte garantizado de tool calling ni agentes: aunque el base los soporta, el fine-tune no documenta su conservación; se debe verificar experimentalmente.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento real frente a otros modelos.

## Enlaces

- HuggingFace: https://huggingface.co/venkateshchsagalm/SagaLM-slm2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
