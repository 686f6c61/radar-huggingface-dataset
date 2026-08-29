# wangzhang/granite-4.1-30b-abliterated

## Resumen

`wangzhang/granite-4.1-30b-abliterated` es un derivado del modelo `ibm-granite/granite-4.1-30b` de IBM, al que se le ha aplicado la técnica de *abliteration* (también conocida como "abliteración") para eliminar de forma sustancial los rechazos de seguridad. El proceso, descrito en el artículo de Arditi et al. (2024), identifica la dirección del flujo residual que el modelo utiliza para detectar instrucciones dañinas y la elimina mediante una edición de pesos de rango 1, sin necesidad de reentrenamiento. El resultado es un modelo que conserva prácticamente todas sus capacidades generales (razonamiento, código, tool calling) pero que responde a peticiones que el modelo base rechazaría.

Este checkpoint concreto es el punto "agresivo" de un estudio de optimización TPE de 50 pruebas, seleccionado por lograr la tasa de rechazos más baja (10 %) entre los tres tamaños de la familia (3B, 8B y 30B), a costa de una divergencia KL ligeramente superior. Está pensado para investigadores y desarrolladores que necesitan un modelo sin restricciones de seguridad para tareas de investigación, generación de contenido o evaluación de alineación, siempre dentro de un marco legal y ético.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (64 capas, intermediate size 32 768) |
| Parametros totales | 28 865 728 512 (28,87 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 nativo (safetensors); cuantizaciones derivadas (GPTQ, AWQ, GGUF) no publicadas |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `ibm-granite/granite-4.1-30b` es un transformer denso decoder-only de 30 B de parámetros, con 64 capas y una dimensión intermedia de 32 768, entrenado por IBM para tareas de generación de texto, código, razonamiento matemático y tool calling. El proceso de abliteration aplicado sobre este base no implica entrenamiento adicional: se trata de una cirugía de pesos. Usando la herramienta `abliterix v1.8.0`, se calcula la dirección de rechazo del modelo (la dirección del flujo residual que codifica "esta instrucción es dañina, debo negarme") y se editan las proyecciones de salida de atención (`attn.o_proj`) y de la MLP (`mlp.down_proj`) para eliminar su componente a lo largo de esa dirección. La edición se realiza como una actualización de rango 1 (modo LoRA) que se fusiona en los pesos finales, con un factor α que varía linealmente por capa, centrado en la capa con mayor señal de rechazo (capa ~46 para atención, ~56 para MLP). El resultado es un modelo con una tasa de rechazos del 10 % frente al 98 % del base, manteniendo una divergencia KL de 0,1867 en prompts benignos.

## Capacidades

- Generación de texto y conversación en inglés, con respuestas idénticas al modelo base en prompts benignos (verificado en la evaluación).
- Razonamiento matemático y lógico, herencia del modelo base Granite 4.1.
- Generación de código y soporte de tool calling / function calling, tal como se documenta en la familia Granite 4.1.
- Capacidad de seguir instrucciones complejas y producir salidas estructuradas en JSON.
- Soporte de retrieval-augmented generation (RAG) y uso de herramientas externas.
- Capacidad especial: ausencia de rechazos de seguridad en la mayoría de las peticiones dañinas (10 % de rechazos frente al 98 % del base), lo que permite explorar contenido que el modelo original bloquearía.

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo permite estudiar cómo se comportan los LLM sin mecanismos de rechazo, analizando qué tipo de contenido generan y cómo se pueden diseñar mejores salvaguardas.
- Generación de ficción y narrativa sin restricciones: escritores y creadores pueden usarlo para explorar tramas o diálogos que involucren temas tabú o violentos sin que el modelo se niegue a colaborar.
- Evaluación de sesgos y comportamientos no alineados: útil para auditar modelos y comparar el efecto de la abliteration en diferentes tamaños (3B, 8B, 30B).
- Desarrollo de agentes conversacionales para entornos controlados: en sandboxes o simulaciones donde se necesita que el modelo responda a cualquier instrucción para probar sistemas de moderación.
- Pruebas de robustez de sistemas de filtrado de contenido: se puede usar como generador de contenido "problemático" para entrenar o validar clasificadores de contenido dañino.
- Benchmarking de técnicas de edición de modelos: al ser un punto extremo del frente de Pareto (bajos rechazos, KL alta), sirve como referencia para comparar otras técnicas de desalineación o edición de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación reportada se centra en la tasa de rechazos y la divergencia KL, medida con un juez LLM (`google/gemini-3.1-flash-lite-preview`) sobre 200 prompts dañinos y 200 benignos:

| Metrica | Base `granite-4.1-30b` | Este modelo | Δ |
|---|---|---|---|
| Rechazos (200 prompts dañinos) | 196 / 200 (98,0 %) | 20 / 200 (10,0 %) | −90 % |
| KL divergence (1-token, benignos) | 0,0000 | 0,1867 | — |
| Desviación de longitud de respuesta (benignos, σ-units) | 0 | 0,01 | despreciable |

Además, se comparan los tres tamaños de la familia abliterated:

| Modelo | Rechazos % | KL @ mejor punto |
|---|---|---|
| 8B sibling | 12,5 % | 0,039 |
| 3B sibling | 12,0 % | 0,132 |
| **30B (este)** | **10,0 %** | 0,1867 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~58 GB (28,87 B parámetros × 2 bytes), por lo que se necesita una GPU con al menos 60 GB (A100 80GB, H100 80GB) o varias GPUs en paralelo.
- Con cuantización a 8 bits (no publicada, pero posible con herramientas como GPTQ o AWQ) se reduciría a ~30 GB, permitiendo su uso en una RTX 4090 (24 GB) con tensor parallelism o en una A6000 (48 GB).
- Con cuantización a 4 bits (GGUF/llama.cpp) se necesitarían ~15 GB, lo que lo haría ejecutable en GPUs consumer de gama alta (RTX 3090/4090) o incluso en CPU con suficiente RAM.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se genera GGUF), o servicios en la nube como FriendliAI (que ya lo lista).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos (200 dañinos) | KL | Licencia |
|---|---|---|---|---|---|
| `wangzhang/granite-4.1-30b-abliterated` (este) | 28,87 B | no disponible | 20 (10 %) | 0,1867 | Apache-2.0 |
| `wangzhang/granite-4.1-8b-abliterated` | ~8 B | no disponible | 25 (12,5 %) | 0,039 | Apache-2.0 |
| `wangzhang/granite-4.1-3b-abliterated` | ~3 B | no disponible | 24 (12,0 %) | 0,132 | Apache-2.0 |
| `ibm-granite/granite-4.1-30b` (base) | 28,87 B | no disponible | 196 (98 %) | 0,0000 | Apache-2.0 |

El modelo 30B ofrece la tasa de rechazos más baja de la familia, pero con una KL mayor, lo que indica una mayor desviación del comportamiento original en prompts benignos. Frente al base, la diferencia es drástica en rechazos, pero la capacidad general se mantiene (respuestas idénticas en el ejemplo benigno mostrado).

## Limitaciones y advertencias

- El modelo ha sido diseñado para eliminar los rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o éticamente problemático si se le solicita. Su uso debe restringirse a entornos de investigación controlados y con supervisión humana.
- La divergencia KL de 0,1867 indica que, aunque las respuestas benignas son en su mayoría idénticas al base, existe una desviación medible en la distribución de probabilidades del primer token, que podría manifestarse en ciertos contextos.
- Solo soporta inglés (según la model card), aunque el modelo base de IBM es multilingüe; este derivado no declara otros idiomas.
- No se han publicado cuantizaciones oficiales; el usuario debe generarlas si necesita reducir requisitos de hardware.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo y recomienda precaución en despliegues productivos.
- Al ser un modelo de 30 B, requiere hardware considerable para inferencia en BF16; no es adecuado para entornos con recursos limitados sin cuantización.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wangzhang/granite-4.1-30b-abliterated)
- [Modelo base IBM Granite 4.1 30B](https://huggingface.co/ibm-granite/granite-4.1-30b)
- [Repositorio de abliterix](https://github.com/wuwangzhang1216/abliterix)
- [Paper de abliteration (Arditi et al., 2024)](https://arxiv.org/abs/2406.11717)
- [Documentación de IBM Granite 4.1](https://www.ibm.com/granite/docs/models/granite4-1)
- [Página del modelo en FriendliAI](https://friendli.ai/models/wangzhang/granite-4.1-30b-abliterated)
