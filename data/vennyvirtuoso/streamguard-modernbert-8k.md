# vennyvirtuoso/streamguard-modernbert-8k

## Resumen

StreamGuard-ModernBERT-8K es un clasificador de texto especializado en seguridad para LLM, desarrollado por el usuario vennyvirtuoso y publicado en Hugging Face. Se construye mediante fine-tuning del modelo base answerdotai/ModernBERT-base y está diseñado para actuar como cortafuegos de seguridad en tiempo real (streaming security firewall) frente a ataques de prompt injection, jailbreaks y manipulaciones indirectas embebidas en documentos recuperados por pipelines RAG. El modelo resuelve un problema operativo concreto: filtrar entradas maliciosas antes de que lleguen al LLM principal, con latencias declaradas por debajo de los 15 ms en modo streaming.

La arquitectura subyace en ModernBERT, un transformer encoder que incorpora rotary positional embeddings (RoPE) y atención de contexto largo nativo hasta 8.192 tokens, lo que permite clasificar documentos completos o conversaciones multi-turno sin truncar. Con 149.606.402 parámetros totales y un peso de repositorio de 0,6 GB, el modelo está pensado para despliegues de alta concurrencia, microservicios y entornos con restricciones de latencia, en contraste con los guardrails basados en LLM generativos, mucho más costosos computacionalmente.

Su relevancia actual radica en la proliferación de agentes y sistemas RAG expuestos a inyecciones indirectas: un clasificador ligero con licencia Apache 2.0 y contexto de 8K tokens ofrece una capa de defensa determinista y de bajo coste que puede integrarse en cualquier pipeline de Hugging Face `transformers`. El modelo se publica como `text-classification` con dos etiquetas (BENIGN y ATTACK/JAILBREAK) y se entrenó sobre el dataset WildJailbreak, según declara el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con rotary positional embeddings (RoPE) |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-base, un encoder transformer que sustituye las positional embeddings absolutas por RoPE y emplea atención con soporte nativo de contexto largo hasta 8.192 tokens. Sobre esa base se aplica un fine-tuning de clasificación de secuencias (`AutoModelForSequenceClassification`) con dos clases: BENIGN y ATTACK/JAILBREAK. El autor declara entrenamiento sobre el dataset WildJailbreak y evaluación sobre un split de test held-out de 1.331 muestras equilibradas entre ataques y benignas, con separación por grupos (group-disjoint) para evitar filtración de datos.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de WildJailbreak, ni si se aplicaron técnicas de RLHF, DPO o aumentación adicional. La innovación técnica destacable es la combinación de contexto largo nativo (8K) con latencias de clasificación muy bajas: el autor reporta 16,97 ms para prefijos de 32 tokens en streaming, 17,19 ms para prompts de 128 tokens, 18,43 ms para documentos de 512 tokens, 24,12 ms para 2.048 tokens y 185,88 ms para la ventana completa de 8.192 tokens. La afirmación del título «<15ms» no coincide con las latencias de la tabla del propio autor (todas por encima de 16 ms), lo que conviene verificar en el entorno de despliegue real.

## Capacidades

- Clasificación binaria de seguridad: distingue entre entradas benignas y ataques/jailbreaks con una única pasada del encoder.
- Detección de prompt injection directa: el autor reporta una tasa de detección del 99,64% en la categoría `direct_prompt_injection`.
- Detección de inyección indirecta en documentos RAG: 100,00% en la categoría `indirect`, pensada para contenido recuperado que contiene instrucciones maliciosas.
- Defensa frente a jailbreaks multi-turno y adopción de personas (estilo DAN): 98,13% en `wildjailbreak_adversarial` y 97,78% en `curated_jailbreak_bench`.
- Clasificación de prefijos en streaming: permite evaluar los primeros 32 tokens de una generación o entrada para cortar ataques de forma temprana.
- Contexto largo para clasificar documentos completos de hasta 8.192 tokens sin truncado.
- Integración con `transformers`, `sentence-transformers` y `peft`, según declara el autor.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo thinking: es exclusivamente un clasificador.

## Casos de uso

- Cortafuegos de entrada en asistentes conversacionales: el modelo se sitúa delante del LLM principal y clasifica cada turno del usuario; si la etiqueta es ATTACK/JAILBREAK, se bloquea o se deriva a revisión. La latencia de ~17 ms para 128 tokens permite hacerlo de forma síncrona sin degradar la experiencia.
- Protección de pipelines RAG: cada fragmento recuperado de la base vectorial se clasifica antes de insertarse en el prompt; la detección del 100% en la categoría `indirect` y el contexto de 8K tokens lo hacen adecuado para documentos largos con instrucciones ocultas.
- Moderación en streaming de respuestas: clasificación de prefijos de 32 tokens (~17 ms) para abortar generaciones que empiezan a derivar hacia contenido no permitido o hacia la revelación del system prompt.
- Filtrado de prompts en APIs públicas de LLM: como microservicio previo al enrutado, con throughput alto gracias a los 149M de parámetros y a la posibilidad de ejecución en GPU consumer.
- Evaluación por lotes de datasets de red teaming: el modelo puede puntuar corpus de ataques y benignos para medir la robustez de un sistema antes de desplegarlo, con contexto suficiente para conversaciones multi-turno completas.
- Defensa de agentes con acceso a herramientas: clasificar las instrucciones que llegan desde fuentes externas (resultados de herramientas, correos, páginas web) antes de que el agente las ejecute, mitigando inyecciones indirectas en flujos multi-paso.
- Cumplimiento y auditoría: registro de veredictos y puntuaciones de confianza para trazabilidad de intentos de jailbreak en entornos regulados.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, sobre un split held-out de 1.331 muestras equilibradas:

| Metrica | Valor |
|---|---|
| Exactitud en test held-out externo | 95,49% |
| Exactitud del baseline sin adaptar | 37,94% |
| Ganancia de exactitud | +57,55% |
| Macro-F1 en test held-out | 0,9549 |
| Macro-F1 del baseline | 0,3790 |
| Ganancia de Macro-F1 | +0,5759 |
| Cross-entropy del modelo ajustado | 0,1637 |
| Cross-entropy del baseline | 0,7628 |
| Latencia prefijo streaming (32 tokens) | 16,97 ms |
| Latencia prompt (128 tokens) | 17,19 ms |
| Latencia documento (512 tokens) | 18,43 ms |
| Latencia contexto largo (2.048 tokens) | 24,12 ms |
| Latencia RAG completo (8.192 tokens) | 185,88 ms |
| Deteccion `direct_prompt_injection` | 99,64% |
| Deteccion `wildjailbreak_contrastive_benign` | 65,00% |
| Deteccion `wild_benign_chat` | 90,87% |
| Deteccion `wildjailbreak_adversarial` | 98,13% |
| Deteccion `indirect` | 100,00% |
| Deteccion `in_the_wild_jailbreak` | 81,45% |
| Deteccion `curated_jailbreak_bench` | 97,78% |

No se aportan comparaciones con otros modelos de guardrails (Llama Guard, Prompt Guard, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB de pesos más activaciones; en fp16/bf16, alrededor de 0,3 GB, holgadamente por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100 o L4 para despliegues de alta concurrencia; RTX 4090, RTX 3090 o RTX 4060 Ti para servidores de inferencia de gama consumer.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 4 GB o más de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (ejemplo oficial del autor), `sentence-transformers`, y potencialmente `peft`; no se documentan conversiones a GGUF, ONNX ni integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: el autor reporta entre 16,97 ms y 24,12 ms para entradas de 32 a 2.048 tokens, y 185,88 ms para 8.192 tokens; no se especifica el hardware de medida ni el throughput en peticiones por segundo, por lo que estas cifras deben validarse en el entorno de destino.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| streamguard-modernbert-8k | 149M | 8.192 | Clasificacion de seguridad binaria | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-base | 149M | 8.192 | Encoder base (sin ajuste de seguridad) | Apache 2.0 | Hugging Face |
| Llama Guard (familia) | no disponible en esta ficha | no disponible en esta ficha | Clasificacion de seguridad generativa | Llama license | Hugging Face |
| Prompt Guard (familia) | no disponible en esta ficha | no disponible en esta ficha | Deteccion de prompt injection | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; las cifras de Llama Guard y Prompt Guard no se incluyen para no inventar valores.

## Limitaciones y advertencias

- El autor reporta una tasa de detección del 65,00% en `wildjailbreak_contrastive_benign`, lo que sugiere falsos negativos relevantes en esa categoría y posibles falsos positivos en consultas benignas de doble uso (por ejemplo, ciberseguridad defensiva).
- La detección en `in_the_wild_jailbreak` es del 81,45%, por debajo del resto de categorías; ataques novedosos fuera de la distribución de WildJailbreak pueden evadir el clasificador con mayor facilidad.
- El título afirma latencias «<15ms», pero la tabla del propio autor muestra 16,97 ms como mínimo; conviene medir en el hardware objetivo antes de comprometerse con SLA.
- No se documentan los idiomas soportados; el entrenamiento sobre WildJailbreak (mayoritariamente en inglés) hace previsible un rendimiento inferior en castellano u otros idiomas.
- Es un clasificador binario: no distingue tipos de ataque ni proporciona explicaciones, solo una etiqueta y una probabilidad.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas con alta confianza; se recomienda calibrar umbrales y combinar con otras capas de defensa.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.
- No se documentan conversiones a formatos optimizados (GGUF, ONNX, TensorRT), lo que puede limitar el despliegue en entornos que no usen PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/streamguard-modernbert-8k
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset WildJailbreak: https://huggingface.co/datasets?search=WildJailbreak
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
