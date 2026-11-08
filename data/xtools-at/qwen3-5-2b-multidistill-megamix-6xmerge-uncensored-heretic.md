# xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic

## Resumen

Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic es un modelo experimental publicado por el usuario xtools-at en Hugging Face. Se trata de una versión "decensored" (también etiquetada como heretic, uncensored y abliterated) del checkpoint xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge, obtenida aplicando la herramienta Heretic v2.0.0.dev0 sobre dicho modelo base. El modelo original es, a su vez, un merge lineal de promedio ponderado de seis checkpoints de la familia Qwen3.5 de 2B parámetros, cada uno con énfasis distintos en razonamiento estructurado, seguimiento de instrucciones, conversación y estilos de respuesta.

El objetivo del merge es combinar comportamientos complementarios de esos seis fine-tunes en un único modelo compacto de aproximadamente 2,2 mil millones de parámetros (2.213.241.664 según los pesos en safetensors), útil para asistencia cotidiana, razonamiento matemático, programación y tareas analíticas de varios pasos. La arquitectura hereda la multimodalidad texto-imagen de la familia Qwen3.5, y el pipeline declarado es image-text-to-text.

La relevancia de esta ficha radica en que documenta un caso de "abliteración" o eliminación de rechazos mediante intervención en el espacio de pesos (Arbitrary-Rank Ablation), con parámetros reproducibles y métricas declaradas por el autor: reducción de rechazos de 96/100 a 1/100 con una divergencia KL de 0,0295 respecto al modelo original. Es un modelo experimental sin benchmarks independientes publicados para este merge exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen-texto) heredada de la familia Qwen3.5; merge lineal de pesos |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5 con escala nominal de 2B parámetros, con soporte multimodal texto-imagen heredado del linaje base. No se ha entrenado desde cero: es un merge en espacio de parámetros mediante promedio ponderado lineal de seis checkpoints fine-tuneados de la familia Qwen3.5-2B. Los componentes y sus pesos configurados son: DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING (1.0), Jackrong/Qwen3.5-2B-Claude-4.6-Opus-Reasoning-Distilled (0.9), empero-ai/Qwen3.8-2B-Distill (0.8), DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact (0.6), Jackrong/Qwopus3.5-2B-v3 (0.6) y ertghiu256/Qwen3.5-2b-Kimi-and-Opus-Distillation (0.5). El modelo base Qwen/Qwen3.5-2B figura en la procedencia como linaje principal pero no tiene peso propio en la tabla de merge.

Sobre ese merge se aplicó Heretic v2.0.0.dev0, una técnica de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) que modifica los pesos en las capas 6 a 19 con los parámetros declarados: preserve_good_behavior_weight 0,6019, steer_bad_behavior_weight 0,0002, overcorrect_relative_weight 0,3401 y neighbor_count 8. El resultado es un único checkpoint (no un ensemble en inferencia). Los datasets citados en las etiquetas (TeichAI/polaris-alpha-1000x, Ali-Yaser/KIMI-K2.5-450000x-ShareGPT, allenai/tulu-3-sft-mixture, nohurry/Opus-4.6-Reasoning-3000x-filtered, Jackrong/Qwen3.5-reasoning-700x) corresponden al entrenamiento de los modelos componentes, no a un entrenamiento nuevo de este merge. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo RLHF/DPO en esta etapa.

## Capacidades

- Generación de texto conversacional multi-turno, con estilos de respuesta que van de lo conciso a lo detallado según el componente dominante en cada caso.
- Razonamiento estructurado y cadenas de pensamiento (chain-of-thought), heredado de los componentes destilados de modelos tipo Claude Opus y Qwen reasoning.
- Capacidades matemáticas y de resolución de problemas lógicos y científicos, orientadas a descomposición de problemas y presentación organizada de soluciones.
- Generación y asistencia en código: escritura, depuración, explicación de algoritmos y borradores de soluciones técnicas.
- Procesamiento multimodal texto-imagen (pipeline image-text-to-text), heredado de la familia Qwen3.5.
- Seguimiento de instrucciones y respuestas adaptativas en verbosidad (trazas de razonamiento cortas frente a explicaciones paso a paso).
- Modo "uncensored"/"abliterated": reducción drástica de rechazos declarada por el autor (1/100 frente a 96/100 del original).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional de propósito general en local: el modelo, con 2,2B parámetros y pesos en safetensors de 4,4 GB, puede ejecutarse en equipos de consumo y gestionar diálogos multi-turno para tareas cotidianas de redacción, resumen y preguntas.
- Razonamiento matemático y resolución de problemas: adecuado para ejercicios de matemáticas, lógica y preguntas científicas donde interesa una traza de razonamiento explícita, gracias a la destilación de varios de sus componentes.
- Generación y revisión de código en entornos de desarrollo: puede producir fragmentos de código, explicar algoritmos y ayudar en la depuración; el código generado debe ejecutarse y probarse antes de usarse en producción.
- Prototipado de aplicaciones multimodales texto-imagen: al heredar el pipeline image-text-to-text de Qwen3.5, sirve para experimentar con descripción de imágenes y preguntas sobre imágenes en fase de prueba de concepto.
- Investigación sobre alineación y ablación de pesos: el modelo es reproducible y documenta los parámetros ARA, por lo que resulta útil para estudiar el efecto de la eliminación de rechazos sobre el comportamiento y la divergencia KL.
- Evaluación comparativa de merges: sirve como caso de estudio para medir si la combinación de seis fine-tunes supera o degrada las capacidades individuales en tareas de instrucción y razonamiento.
- Chat de bajo consumo en hardware modesto: al ser un modelo de 2B, encaja en escenarios de despliegue con recursos limitados donde no es viable un modelo mayor.

## Benchmarks y rendimiento

El autor declara únicamente las métricas del proceso de decensurado, no benchmarks de capacidades:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (refusals) | 1/100 | 96/100 |
| Divergencia KL | 0,0295 | 0 (por definición) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible para este merge.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): en torno a 4,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 8 GB de VRAM para comodidad.
- Cuantización: no se listan versiones GGUF, AWQ ni GPTQ en el repo; habría que generarlas a partir de los safetensors. En cuantización de 4 bits el modelo cabría holgadamente en GPUs de consumo de 6-8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para inferencia local; A100/H100 solo si se necesita alto throughput en bf16.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en bf16, y en tarjetas de 6 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible, por lo que su compatibilidad debe verificarse de forma independiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (heretic) | 2,21B | no disponible | Merge de 6 fine-tunes + ablación ARA | apache-2.0 | Hugging Face |
| xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge | 2,21B (aprox.) | no disponible | Merge de 6 fine-tunes sin ablación | apache-2.0 | Hugging Face |
| DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING | 2B (aprox.) | no disponible | Fine-tune con decensurado y thinking | no disponible | Hugging Face |
| Jackrong/Qwen3.5-2B-Claude-4.6-Opus-Reasoning-Distilled | 2B (aprox.) | no disponible | Destilación de razonamiento | no disponible | Hugging Face |

No hay datos de rendimiento comparativo publicados para este merge, por lo que la comparación se limita a linaje, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte que su rendimiento real, fiabilidad y compatibilidad con distintos backends de inferencia deben evaluarse de forma independiente.
- No hay benchmarks independientes para este merge exacto; las mejoras en razonamiento no están establecidas.
- La ablación ARA reduce los rechazos de forma agresiva (de 96/100 a 1/100), lo que implica que el modelo puede generar contenido dañino, ofensivo o inapropiado sin filtros; no es adecuado para aplicaciones orientadas al público sin moderación adicional.
- Riesgo de alucinación inherente a un modelo de 2B; el código generado debe probarse antes de usarse en producción.
- La información sobre idiomas soportados y longitud de contexto no está disponible, lo que limita la planificación de despliegues multilingües o con contexto largo.
- No se especifican en la información disponible la librería y versión exactas del merge, la normalización de coeficientes, las exclusiones de tensores ni la precisión numérica, lo que dificulta la reproducibilidad completa del merge original (aunque el decensurado sí se declara reproducible).
- Licencia apache-2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad legal y ética del contenido generado por un modelo sin filtros.
- Es un merge de pesos, no un ensemble en inferencia; el comportamiento final depende de la interacción entre componentes y puede ser menos predecible que un fine-tune único.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic
- Modelo base del merge: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge
- Heretic (herramienta de decensurado): https://heretic-project.org
- Componente DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING: https://huggingface.co/DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Componente Jackrong/Qwen3.5-2B-Claude-4.6-Opus-Reasoning-Distilled: https://huggingface.co/Jackrong/Qwen3.5-2B-Claude-4.6-Opus-Reasoning-Distilled
- Componente empero-ai/Qwen3.8-2B-Distill: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Componente DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact: https://huggingface.co/DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact
- Componente Jackrong/Qwopus3.5-2B-v3: https://huggingface.co/Jackrong/Qwopus3.5-2B-v3
- Componente ertghiu256/Qwen3.5-2b-Kimi-and-Opus-Distillation: https://huggingface.co/ertghiu256/Qwen3.5-2b-Kimi-and-Opus-Distillation
