# xtools-at/LFM3-1.7B-Claude-Opus-Reasoning-Distilled

## Resumen

LFM3-1.7B-Claude-Opus-Reasoning-Distilled es un ajuste fino (fine-tune) del checkpoint comunitario xtools-at/LFM3-1.7B-AgentOrange-Claude-Code-2xMerge, publicado por el usuario xtools-at. Se construye sobre la familia LFM3 de Liquid AI, un modelo de texto de 1.728.801.536 parámetros (1,73B) con una arquitectura tri-híbrida que combina convoluciones cortas con compuertas, atención de ventana deslizante y atención global. El objetivo declarado es reforzar el razonamiento estructurado y la resolución analítica de problemas en un modelo compacto que ya partía de una base orientada a código, uso de herramientas y comportamiento agéntico.

El modelo se entrena con 8.000 ejemplos de trazas de razonamiento generadas por Claude Opus y Sonnet (procedentes de cuatro colecciones de TeichAI y Roman1111111), con un conjunto de evaluación separado de 400 ejemplos. El ajuste se realiza mediante LoRA de una sola época, en precisión de 16 bits, con contexto máximo de entrenamiento de 8.192 tokens. Es relevante ahora porque ejemplifica la tendencia de destilación de razonamiento desde modelos propietarios grandes hacia modelos pequeños desplegables localmente, y porque el autor advierte explícitamente de que las mejoras son intenciones de diseño, no mejoras medidas.

La ficha se limita a los datos publicados por el autor: no hay resultados de benchmarks independientes, y el propio autor indica que queda por establecer si el ajuste mejora realmente al checkpoint padre. La licencia es lfm1.0 (marcada como "other" en Hugging Face), lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido (convoluciones cortas con compuertas + atención de ventana deslizante + atención global), familia LFM3 de Liquid AI |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto máximo de entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible (el repo publica safetensors en 16 bits; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (transformers; requiere custom_code) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura tri-híbrida de LFM3 de Liquid AI: una combinación de convoluciones cortas con compuertas (gated short convolutions), atención de ventana deslizante y atención global. Esta mezcla busca reducir el coste computacional frente a un transformer de atención completa pura, manteniendo capacidad de modelado de secuencias largas, y está pensada para despliegue local y aplicaciones agénticas. El checkpoint parte de Agent Orange, un merge lineal de dos fine-tunes de LFM3 (mondk/LFM3-1.7B-Claude-Code-Safetensors con peso 1.0 y saidutta69/LFM3-1.7B-Claude-Fable5.1 con peso 0.8), orientados respectivamente a código y comportamiento agéntico, y a tool calling estructurado con generación de argumentos.

El ajuste adicional usa LoRA en 16 bits durante una época, con rango 16, alpha 32, dropout 0.02, optimizador AdamW de 8 bits, scheduler lineal, weight decay 0.001, learning rate 2e-4 y configuración de batch 4 × 8. Se emplean 8.000 ejemplos filtrados a un máximo de 8.000 caracteres, muestreados de cuatro colecciones de trazas de razonamiento de Claude (Claude-Opus-4.6-Reasoning-887x, claude-4.5-opus-high-reasoning-250x, claude-sonnet-4.5-high-reasoning-250x y claude-opus-4.6-10000x). El conjunto de evaluación de 400 ejemplos (5%) se muestreó proporcionalmente a la composición del dataset. Los resultados de entrenamiento reportados son pérdida de entrenamiento 0.814 y pérdida de evaluación 0.796. No se documenta RLHF ni DPO en esta etapa; el autor advierte que la aproximación de una sola época limita la exposición repetida a los ejemplos sintéticos, pero no garantiza preservar todas las capacidades de código y uso de herramientas del modelo padre.

## Capacidades

- Generación de texto conversacional en 16 idiomas, incluido el español.
- Razonamiento multi-paso y resolución analítica de problemas, reforzado mediante destilación de trazas de Claude Opus y Sonnet.
- Generación y asistencia de código, heredada del checkpoint padre orientado a Claude Code.
- Tool calling y function calling, con generación estructurada de argumentos heredada del linaje Fable 5.1.
- Comportamiento agéntico y descomposición de tareas complejas en pasos manejables.
- Razonamiento en flujos de trabajo que involucran herramientas y acciones externas.
- Razonamiento matemático y lógico (caso de uso declarado por el autor, sin métricas publicadas).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito más allá de las trazas de razonamiento destiladas.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en editores o CLI para sugerencias y explicaciones de código, aprovechando su linaje Claude Code y su tamaño de 1,73B, que permite ejecución en hardware de consumo.
- Automatización de tool calling en agentes: su entrenamiento en generación estructurada de argumentos lo hace adecuado para orquestar llamadas a APIs y funciones en pipelines agénticos con contexto de hasta 8.192 tokens.
- Resolución de problemas matemáticos y lógicos paso a paso: útil en entornos educativos o de validación donde se requiere una traza de razonamiento explícita, aunque sin garantías de exactitud medidas.
- Despliegue en entornos con recursos limitados: al ser un modelo de 1,73B, puede ejecutarse en GPU de consumo y en CPU, lo que facilita prototipos y demos sin infraestructura cloud.
- Atención al cliente multilingüe: cubre 16 idiomas, incluido el español, para conversaciones multi-turno en mercados internacionales, con la advertencia de que la calidad por idioma no está evaluada.
- Generación de documentación técnica y explicaciones de código: el modelo puede resumir y comentar fragmentos de código en flujos de CI/CD o revisión de pull requests, aunque requiere validación humana por el riesgo de alucinación.
- Investigación sobre destilación de razonamiento: sirve como caso de estudio reproducible para analizar cómo se transfieren trazas de modelos propietarios a modelos pequeños y qué se pierde en el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de entrenamiento (0.814) y evaluación (0.796), y advierte explícitamente de que las mejoras de razonamiento son casos de uso previstos, no mejoras medidas. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con el checkpoint padre.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 3,5 GB solo para pesos (1,73B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1 GB, aunque el repo no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para 16 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); para 4 bits bastan GPUs de 4 GB como RTX 3050 o incluso iGPU con suficiente memoria compartida.
- Cabe en GPU de consumo: sí, en la mayoría de modelos con 8 GB o más en 16 bits, y en GPUs de gama baja con cuantización.
- Opciones de despliegue: transformers con custom_code (formato nativo del repo), vLLM y TGI si se genera una versión compatible, llama.cpp/Ollama si se convierte a GGUF (no publicado por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| xtools-at/LFM3-1.7B-Claude-Opus-Reasoning-Distilled | 1,73B | 8.192 (entrenamiento) | lfm1.0 | Hugging Face, safetensors | Este modelo; fine-tune de razonamiento sobre Agent Orange |
| xtools-at/LFM3-1.7B-AgentOrange-Claude-Code-2xMerge | 1,73B | No disponible | lfm1.0 | Hugging Face | Checkpoint padre; base de código y agentes sin el ajuste de razonamiento |
| LiquidAI/LFM3-1.7B | 1,73B | No disponible | lfm1.0 | Hugging Face | Modelo base original de Liquid AI, tri-híbrido |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con contexto mayor y licencia permisiva; sin datos de comparación directa con este modelo |

No se dispone de comparaciones de rendimiento medidas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor reconoce que las mejoras de razonamiento son intenciones de diseño, no mejoras verificadas; no hay evaluaciones independientes.
- Riesgo de heredar sesgos estilísticos, errores recurrentes y debilidades de las trazas sintéticas de Claude usadas en el entrenamiento.
- Riesgo de alucinación inherente a modelos de 1,73B y a la destilación de datos sintéticos; requiere validación humana en producción.
- La aproximación de una sola época no garantiza preservar todas las capacidades de código y tool calling del checkpoint padre.
- Contexto de entrenamiento limitado a 8.192 tokens; no se documenta el contexto nativo del modelo base ni su comportamiento más allá de esa longitud.
- Calidad multilingüe no evaluada por idioma; los 16 idiomas declarados no implican rendimiento homogéneo.
- Licencia lfm1.0 (etiquetada "other"): es necesario revisar los términos de Liquid AI antes de uso comercial; no es una licencia permisiva tipo Apache 2.0 o MIT.
- El repositorio requiere custom_code en transformers; la integración con otros runtimes (vLLM, llama.cpp) puede requerir conversión manual no publicada.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni reportes de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/xtools-at/LFM3-1.7B-Claude-Opus-Reasoning-Distilled
- Modelo base (checkpoint padre): https://huggingface.co/xtools-at/LFM3-1.7B-AgentOrange-Claude-Code-2xMerge
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Fine-tune de código (componente del merge): https://huggingface.co/mondk/LFM3-1.7B-Claude-Code-Safetensors
- Fine-tune de tool calling (componente del merge): https://huggingface.co/saidutta69/LFM3-1.7B-Claude-Fable5.1
- Dataset de razonamiento Opus 4.6 (887x): https://huggingface.co/datasets/TeichAI/Claude-Opus-4.6-Reasoning-887x
- Dataset de razonamiento Opus 4.5 (250x): https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset de razonamiento Sonnet 4.5 (250x): https://huggingface.co/datasets/TeichAI/claude-sonnet-4.5-high-reasoning-250x
- Dataset de razonamiento Opus 4.6 (10000x): https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Dataset Ultra-Trio-Unfiltered (linaje del padre): https://huggingface.co/datasets/mondk/Ultra-Trio-Unfiltered
- Dataset Fable 5.1 Premium (linaje del padre): https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Perfil del autor: https://huggingface.co/xtools-at
