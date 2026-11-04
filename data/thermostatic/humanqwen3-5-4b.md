# Thermostatic/HumanQwen3.5-4B

## Resumen

HumanQwen3.5-4B es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario Thermostatic, cuyo objetivo es que el modelo escriba con un estilo más cercano al de una persona real: menos frases hechas, menos relleno, menos listas de viñetas reflejas y sin fórmulas de cortesía tipo "espero que esto te ayude". El modelo conserva las capacidades de razonamiento, matemáticas y código del modelo base, que fueron medidas antes y después del entrenamiento.

El entrenamiento se realizó con Unsloth sobre 8 GPUs RTX 5090, mediante SFT con LoRA (r=128 sobre todas las capas lineales, fusionada) durante 2 épocas y 23.000 ejemplos. Los datos combinan respuestas humanas de OpenAssistant oasst2, documentos largos de fineweb-edu anteriores a la generalización del texto generado por IA (2019-2020) y una fase de "capability replay" con respuestas del propio modelo base a prompts de chat, matemáticas y código.

Es relevante porque aborda un problema muy concreto en producción: el estilo sobre-formateado y repetitivo de los LLM actuales. Con 4.659.865.088 parámetros y licencia Apache 2.0, se posiciona como una alternativa práctica para tareas de redacción donde se prefiera un registro humano, manteniendo un rendimiento en matemáticas y código muy próximo al del modelo base. El modelo solo está orientado a inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); tipo exacto no disponible |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de despliegue con vLLM) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; se menciona Unsloth, que permite exportar a GGUF, pero no se confirma) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4.660 millones de parámetros. El ajuste se realizó con SFT mediante LoRA de rango 128 aplicado a todas las capas lineales, fusionado posteriormente en los pesos. El entrenamiento se ejecutó con Unsloth, en modo padding-free, durante 2 épocas sobre 8 GPUs RTX 5090, con un tiempo total de 28 minutos. El conjunto de entrenamiento consta de 23.000 ejemplos con tres componentes: respuestas humanas mejor valoradas de OpenAssistant oasst2 (solo inglés, filtradas por calidad y toxicidad), documentos largos de fineweb-edu rastreados en 2019-2020 (con instrucciones generadas por back-translation del modelo base y respuesta humana intacta) y una fase de replay de capacidades con respuestas del propio modelo base a prompts de chat (UltraChat), matemáticas (GSM8K/MATH) y código (Magicoder OSS-Instruct), conservando el razonamiento completo en modo thinking para no degradar estas capacidades.

Se entrenó también una etapa DPO (prefiriendo la respuesta humana frente a la del modelo base), pero no forma parte de esta release porque degradaba GSM8K en modo no-thinking del 90,5% al 82,8% y HumanEval del 78,0% al 68,3%. El estilo de escritura se entrena en modo no-thinking (`enable_thinking=False`), mientras que el modo thinking se reserva para matemáticas y código. Un detalle técnico relevante: el uso recomendado incluye `presence_penalty=1.5`, sin el cual aproximadamente el 40% de las piezas largas entran en bucles de repetición (con él, alrededor del 5%).

## Capacidades

- Generación de texto con estilo humano: estructura y registro más cercanos a la escritura real, con menos encabezados Markdown, negritas y viñetas.
- Redacción de formato largo (artículos, entradas de blog, documentos) con menor uso de frases hechas típicas de LLM.
- Razonamiento matemático, incluyendo modo thinking (GSM8K en thinking: 87,0%).
- Generación de código con modo thinking (HumanEval en thinking: 90,9%).
- Conversación multi-turno en inglés.
- Modo thinking y no-thinking conmutables mediante `chat_template_kwargs` (`enable_thinking`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés.
- Capacidades de visión: la etiqueta `image-text-to-text` aparece en los tags de HuggingFace, pero la model card no describe capacidades multimodales; no disponible como capacidad confirmada.

## Casos de uso

- Redacción de contenido editorial: el modelo genera artículos y entradas de blog con estructura humana (0% de encabezados Markdown en formato largo frente al 85% del base), adecuado para publicaciones donde el estilo sobre-formateado resulta artificial.
- Generación de respuestas de chat para atención al cliente: produce respuestas más breves (209 palabras de media frente a 549 del base) y con menos viñetas (26% frente a 40%), lo que encaja en interfaces conversacionales donde el usuario espera texto natural.
- Asistencia a la escritura en herramientas de productividad: reescritura y generación de borradores con registro humano y menor presencia de muletillas tipo "delve" o "it's important to note" (0,86 por 1.000 palabras frente a 1,35 del base).
- Generación de código en pipelines de desarrollo: con modo thinking alcanza 90,9% en HumanEval, por lo que puede integrarse en asistentes de código que requieran razonamiento explícito, evitando el modo no-thinking (78,0%).
- Resolución de problemas matemáticos paso a paso: el modo thinking mantiene un 87,0% en GSM8K, útil en herramientas educativas o de verificación de cálculos.
- Creación de corpus sintéticos con estilo humano: para proyectos que necesiten texto generado con estadísticas estilísticas más próximas a las humanas, aunque con la advertencia de que los detectores de IA siguen marcándolo.
- Prototipado rápido en local: con 4,66B parámetros y licencia Apache 2.0, es viable para experimentación en entornos con recursos moderados, sirviendo con vLLM y `--max-model-len 32768`.

## Benchmarks y rendimiento

Datos publicados en la model card (prompts fuera del conjunto de entrenamiento; muestreo temperature 0.7, top-p 0.8, top-k 20, modo no-thinking; formato largo con `presence_penalty=1.5`):

| Benchmark | Qwen3.5-4B | HumanQwen3.5-4B |
|---|---|---|
| GSM8K, thinking | 85,8% | 87,0% |
| HumanEval, thinking | 90,2% | 90,9% |
| GSM8K, non-thinking | 91,5% | 90,5% |
| HumanEval, non-thinking | 82,9% | 78,0% |

Estilo en chat (300 conversaciones reservadas de oasst2):

| Métrica | Qwen3.5-4B | HumanQwen3.5-4B | Humanos reales |
|---|---|---|---|
| Longitud (palabras) | 549 | 209 | 179 |
| Respuestas con encabezados Markdown | 79% | 6% | 4% |
| Frases en negrita por 100 palabras | 3,6 | 0,24 | 0,09 |
| Líneas que son viñetas | 40% | 26% | 22% |

Estilo en formato largo (200 peticiones reservadas):

| Métrica | Qwen3.5-4B | HumanQwen3.5-4B | Humanos reales |
|---|---|---|---|
| Longitud (palabras) | 628 | 507 | 589 |
| Piezas con encabezados Markdown | 85% | 0% | 0% |
| Frases en negrita por 100 palabras | 1,77 | 0 | 0 |
| Líneas que son viñetas | 23% | 8,5% | 5,7% |
| Frases hechas de LLM por 1.000 palabras | 1,35 | 0,86 | 0,33 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,66B parámetros, en FP16 requiere aproximadamente 9,3 GB de pesos (tamaño del repo), más overhead de KV cache para 32.768 tokens de contexto.
- GPU recomendadas: el entrenamiento se realizó en 8× RTX 5090; para inferencia no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado en la información; por tamaño de pesos, es plausible en GPUs con 12-16 GB o más, pero no se aporta dato verificado.
- Opciones de despliegue: vLLM (ejemplo oficial con `vllm serve Thermostatic/HumanQwen3.5-4B --max-model-len 32768`) y API compatible con OpenAI. Otras opciones como llama.cpp, Ollama o TGI no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K (thinking) | HumanEval (thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HumanQwen3.5-4B | 4,66B | 32.768 | 87,0% | 90,9% | Apache 2.0 | HuggingFace |
| Qwen3.5-4B (base) | 4B | no disponible | 85,8% | 90,2% | Apache 2.0 | HuggingFace |
| Alternativas de estilo humano de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros fine-tunes orientados a estilo humano no está disponible en la información proporcionada. El único contraste documentado es frente al modelo base.

## Limitaciones y advertencias

- Las respuestas humanas de entrenamiento provienen de voluntarios de oasst2 y de páginas web de 2019-2020, con sus peculiaridades; el modelo puede resultar más escueto de lo deseado.
- No evade detectores de texto IA: el detector `fakespot-ai/roberta-base-ai-text-detection-v1` marca el 100% de las piezas largas como generadas por IA (frente al 98,5% del base y el 15,5% de los documentos humanos reales). Escribe con estructura y registro humanos, pero no con estadísticas de tokens humanas.
- HumanEval en modo no-thinking es unos 5 puntos inferior al base (78,0% frente a 82,9%); se recomienda modo thinking para código.
- Las salidas largas pueden entrar en bucles de repetición sin `presence_penalty` (aproximadamente el 40% de las piezas largas).
- Solo se ha entrenado el estilo de escritura en inglés; no hay soporte multilingüe.
- Sesgos conocidos: no documentados explícitamente en la información disponible, más allá de la procedencia de los datos de entrenamiento.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial; el modelo base también es Apache 2.0 y los datos de entrenamiento son permisivos (oasst2 Apache-2.0, fineweb-edu ODC-BY, UltraChat 200k MIT, GSM8K MIT, MATH MIT, Magicoder OSS-Instruct MIT).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thermostatic/HumanQwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Unsloth: https://github.com/unslothai/unsloth
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Detector de texto IA citado: https://huggingface.co/fakespot-ai/roberta-base-ai-text-detection-v1
