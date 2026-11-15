# toyosi12/cangpt-anisole-large-sft

## Resumen

cangpt-anisole-large-sft es un modelo de generación de texto de tipo GPT-2, publicado por el usuario toyosi12 en Hugging Face. Se trata de la conversión de un checkpoint propio del proyecto "cangpt" a un `GPT2LMHeadModel` estándar compatible con la librería transformers, acompañado de su tokenizer. El modelo parte de un preentrenamiento sobre el dataset `anisoleai/fineweb-tokenized` y posteriormente se somete a un ajuste supervisado (SFT) sobre el conjunto de instrucciones `tatsu-lab/alpaca`, con aproximadamente 52.000 pares instrucción/respuesta.

Con 776.290.560 parámetros reales (según los pesos en safetensors, y 774,5M según la model card), se sitúa en la categoría de modelos pequeños dentro de la familia GPT-2 escalada. Su propósito es el de un modelo conversacional/instruction-tuned de bajo coste, pensado para entornos donde el tamaño reducido y la compatibilidad con el ecosistema transformers priman sobre el rendimiento bruto.

Es relevante ahora como ejemplo de modelo comunitario de nicho: un checkpoint entrenado desde cero sobre FineWeb tokenizado y alineado con Alpaca, pero con escasa documentación, sin licencia declarada y sin benchmarks publicados. Su utilidad práctica queda limitada a experimentación y prototipado, no a producción crítica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2, `GPT2LMHeadModel`) |
| Parámetros totales | 776.290.560 (pesos safetensors); 774,5M según model card |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers/GGUF previa conversión) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | text-generation |
| Tamaño del repo | 3,1 GB |
| Dataset de preentrenamiento | anisoleai/fineweb-tokenized |
| Dataset de SFT | tatsu-lab/alpaca (~52K pares) |
| Plantilla de prompt | Alpaca (`### Instruction:` / `### Response:`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only estándar de GPT-2, empaquetada como `GPT2LMHeadModel` de la librería transformers. No se documentan innovaciones arquitectónicas: se trata de un GPT-2 convencional (atención multi-cabeza completa, sin mecanismos de atención lineal, MoE ni decodificación especulativa declarados). El tamaño de 774,5M de parámetros lo sitúa por encima del GPT-2 large original (774M) y muy por debajo de GPT-2 XL (1,5B), lo que sugiere una configuración de capas y dimensiones similar a la de GPT-2 large, aunque la model card no detalla el número de capas, cabezas ni dimensión oculta.

El entrenamiento consta de dos fases: un preentrenamiento sobre el dataset `anisoleai/fineweb-tokenized` (tokenización de FineWeb, sin que se especifique el número de tokens, la composición exacta ni el cómputo empleado) y un ajuste supervisado (SFT) sobre `tatsu-lab/alpaca`, con aproximadamente 52.000 pares instrucción/respuesta. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT. La model card advierte explícitamente que el modelo está especializado en seguir instrucciones con la plantilla Alpaca y que no continúa texto libre de forma fiable, a diferencia del checkpoint base sin ajustar.

## Capacidades

- Generación de texto condicionada a instrucciones siguiendo la plantilla Alpaca (`### Instruction:` / `### Response:`).
- Respuesta a instrucciones conversacionales de un solo turno, derivadas del formato Alpaca.
- Generación de texto general (el preentrenamiento sobre FineWeb le otorga capacidad de modelado de lenguaje).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no declaradas; el dataset Alpaca es mayoritariamente en inglés).
- No se declaran capacidades especiales (modo thinking, visión, audio, matemáticas avanzadas o código específico).

## Casos de uso

- Prototipado de asistentes conversacionales ligeros: el modelo puede gestionar instrucciones de un solo turno con la plantilla Alpaca, adecuado para demos y pruebas de concepto en entornos con recursos limitados.
- Experimentación académica con SFT: sirve como base para estudiar el efecto del ajuste supervisado sobre Alpaca en un modelo preentrenado desde cero con FineWeb tokenizado.
- Generación de texto de relleno o borradores: dada su naturaleza GPT-2, puede emplearse para producir texto genérico en tareas de baja exigencia donde el coste computacional sea prioritario.
- Fine-tuning posterior en dominios específicos: al ser un `GPT2LMHeadModel` estándar, es compatible con los flujos de entrenamiento de transformers y puede adaptarse a tareas concretas con datasets propios.
- Despliegue en hardware de consumo: con 774,5M de parámetros, cabe en GPUs consumer (ver sección de hardware) para inferencia local en cuadernos o aplicaciones de escritorio.
- Evaluación comparativa de modelos pequeños: útil como referencia en estudios sobre el rendimiento de modelos GPT-2 escalados frente a alternativas modernas de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1,6 GB solo para pesos (776M × 2 bytes), más overhead de activaciones y caché KV; en fp32, unos 3,1 GB. En cuantización de 8 bits, alrededor de 0,8 GB; en 4 bits, unos 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con contexto moderado (GTX 1650, RTX 3050, RTX 4060). Para fp32 se recomienda al menos 6-8 GB (RTX 3060, RTX 4060 Ti).
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer con 4 GB o más de VRAM, e incluso en CPU para inferencia con llama.cpp u Ollama tras conversión a GGUF.
- Opciones de despliegue: transformers (nativo), text-generation-inference (el repo incluye el tag `text-generation-inference`), vLLM (compatible con GPT-2), llama.cpp/Ollama (requiere conversión a GGUF), y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cangpt-anisole-large-sft | 776,3M | no disponible | no disponible | Hugging Face (toyosi12) | SFT sobre Alpaca; GPT-2 estándar |
| GPT-2 large (OpenAI) | 774M | 1.024 tokens | MIT | Hugging Face (openai-community) | Base sin ajuste de instrucciones |
| GPT-2 XL (OpenAI) | 1,5B | 1.024 tokens | MIT | Hugging Face (openai-community) | Mayor tamaño, sin SFT |
| TinyLlama-1.1B (base) | 1,1B | 2.048 tokens | Apache 2.0 | Hugging Face (TinyLlama) | Arquitectura Llama, más moderno |

La comparativa se limita a modelos de tamaño similar o de la misma familia; no se dispone de datos de rendimiento del modelo evaluado para contrastar benchmarks. La principal diferencia frente a GPT-2 large es el ajuste SFT sobre Alpaca, que le confiere capacidad de seguir instrucciones, a costa de perder la capacidad de continuación de texto libre fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre FineWeb y Alpaca, es probable que herede sesgos presentes en estos corpus (no verificable sin evaluación).
- Riesgo de alucinación: alto, dado el tamaño reducido del modelo y la ausencia de técnicas de alineación posteriores al SFT (sin RLHF ni DPO).
- Limitaciones de contexto: la longitud de contexto no está declarada; al ser GPT-2 estándar, es probable que herede la ventana de 1.024 tokens, pero no se confirma.
- Limitaciones de idioma: no se declaran idiomas soportados; el dataset Alpaca es mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto y probablemente deficiente.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si el uso comercial está permitido. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Caveat para producción: el modelo no continúa texto libre de forma fiable; requiere la plantilla Alpaca exacta para comportarse como instruction-following. Sin benchmarks publicados, no hay evidencia de calidad.
- Documentación escasa: no se especifican hiperparámetros de entrenamiento, número de tokens, composición del dataset ni configuración de la arquitectura (capas, cabezas, dimensión oculta).
- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/toyosi12/cangpt-anisole-large-sft
- Dataset de preentrenamiento: https://huggingface.co/datasets/anisoleai/fineweb-tokenized
- Dataset de SFT: https://huggingface.co/datasets/tatsu-lab/alpaca
- Repositorio de transformers: https://github.com/huggingface/transformers
- Documentación de GPT2LMHeadModel: https://huggingface.co/docs/transformers/model_doc/gpt2
