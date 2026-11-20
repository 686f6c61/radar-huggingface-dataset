# tsinghua-sigs-robot-lab/VeriLoop-E2

## Resumen

VeriLoop E2 es un modelo de lenguaje de 27B parámetros desarrollado por Tsinghua SIGS Robot Lab (Libo Wang) como un post-entrenamiento sobre Qwen3.8-27B. Está orientado a tres dominios concretos: código e ingeniería de software, matemáticas y física. Su propuesta diferencial es la "VeriLoop-Governed Recurrence" (VGR), una disciplina de razonamiento en la que el modelo propone estados candidatos que son verificados externamente y solo se retienen si el estado de evidencia protegido mejora sin regresión. Es decir, el modelo genera y el arnés (VeriLoop Harness) verifica, sin que el modelo se autocertifique.

La relevancia actual del modelo radica en su enfoque de separación entre inteligencia generativa y autoridad de verificación, aplicado a tareas de agentes de código y razonamiento científico. Con una ventana de contexto nativa de 262.144 tokens en la configuración del tokenizador y 131.072 tokens validados en servicio con vLLM 0.17.0, se posiciona para flujos de trabajo de repositorio completo y razonamiento de múltiples pasos.

El modelo se distribuye con licencia Apache 2.0, pesos en safetensors y soporte para inglés y chino. El repositorio incluye los pesos, la ruta de inferencia pública y el registro de evaluación, pero no la implementación de producción del Harness, que queda fuera del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (clase HF `Qwen3_5ForConditionalGeneration`), derivada de Qwen3.8-27B |
| Parametros totales | 27.872.753.616 (27,87B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos; 131.072 tokens validados en servicio vLLM |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VeriLoop E2 es un fine-tuning (post-training) sobre Qwen3.8-27B, con clase de arquitectura Hugging Face `Qwen3_5ForConditionalGeneration` y tokenizador `Qwen2Tokenizer`. No se especifica en la información disponible si la arquitectura base es densa o Mixture of Experts; el dato de parámetros totales es de 27,87B. El modelo incorpora la disciplina VGR, que separa la generación de propuestas (abstracción, diagnóstico, hipótesis de reparación y razonamiento estructurado) de la admisión de evidencia, las comprobaciones deterministas, la verificación externa, el commit/rollback y la persistencia del estado de evidencia, tareas estas últimas delegadas al VeriLoop Harness.

El corpus público de post-entrenamiento contabiliza 1.841.831 registros y abarca ingeniería de software a nivel de repositorio, uso de terminal y herramientas, razonamiento matemático, razonamiento científico, reparación sensible a verificadores y entrenamiento orientado a recurrencia. La construcción exacta de datos, el filtrado y la metodología de entrenamiento se documentan en el informe técnico, no en la model card. No se detalla en la información disponible si hubo RLHF, DPO u otras técnicas de alineación concretas, ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto y razonamiento estructurado en dominios de código, matemáticas y física.
- Agente de código para ingeniería de software a nivel de repositorio (resolución de issues, parches, reparación verificada).
- Uso de terminal y herramientas (tool calling / function calling) en flujos de agente.
- Razonamiento matemático de competición y razonamiento científico (física, certificados formales).
- Razonamiento de múltiples pasos con recurrencia gobernada por verificación externa (VGR).
- Contexto largo: 262.144 tokens nativos y 131.072 tokens validados en servicio.
- Capacidades multilingües limitadas a inglés y chino.
- Servicio compatible con OpenAI a través de vLLM 0.17.0.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede analizar el repositorio completo gracias a su contexto de 262.144 tokens, proponer parches y someterlos a verificación externa mediante el Harness antes de commitear, lo que encaja con su disciplina de commit/rollback.
- Agente de terminal para tareas de DevOps: con soporte de tool use y una puntuación reportada de 88,8% en Terminal-Bench 2.1, puede ejecutar comandos, interpretar salidas y corregir hipótesis de reparación en pipelines de CI/CD.
- Razonamiento matemático asistido: para problemas de competición o demostración, el modelo genera candidatos y el verificador externo filtra los estados que no mejoran la evidencia, reduciendo la propagación de errores en cadenas largas.
- Razonamiento científico y certificados formales: los artefactos públicos de Riemann ζ y tomografía de gravitones asintóticos demuestran su uso en programas de investigación con evidencia reproducible.
- Revisión y reparación de código sensible a verificadores: integrado en flujos donde las pruebas deterministas deciden la admisión de un parche, el modelo actúa como generador de hipótesis de reparación mientras el arnés valida.
- Asistente de investigación en física y matemáticas con contexto largo: puede ingerir documentación extensa, artículos y trazas de experimentos dentro de la ventana de 131.072 tokens validados en vLLM para razonamiento multi-paso.
- Servicio de inferencia compatible con OpenAI: despliegue con vLLM 0.17.0 para exponer el modelo en aplicaciones existentes que usen la API de OpenAI.

## Benchmarks y rendimiento

Resultados de release congelados reportados en la model card:

| Benchmark | VeriLoop E2 |
|---|---|
| SWE-bench Pro | 76,2% |
| Terminal-Bench 2.1 | 88,8% |
| AIME 2026 | 98,3% |
| GPQA Diamond | 93,9% |
| Apex 2025 | 89,6% |

Los benchmarks de agente emplean el checkpoint E2 dentro del flujo de evaluación congelado, incluyendo el VeriLoop Harness interno cuando la tarea lo requiere, herramientas nativas del benchmark y el evaluador oficial o designado. Los protocolos por benchmark, las salidas a nivel de tarea y los recibos del evaluador se publican por separado en la evidencia de evaluación. No se dispone en la información proporcionada de resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 27,87B parámetros, en FP16 se requiere aproximadamente 56 GB de pesos, y en cuantizaciones de 8 bits o 4 bits el requisito baja proporcionalmente (cifras orientativas, no publicadas por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio (55,7 GB) sugiere que la inferencia en FP16 no cabe en GPU de consumo de 24 GB sin cuantización.
- Opciones de despliegue: vLLM 0.17.0 es el motor recomendado, con configuración validada de 131.072 tokens y servicio compatible con OpenAI. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VeriLoop E2 | 27,87B | 262.144 nativos / 131.072 validados | Apache 2.0 | Hugging Face, ModelScope |
| Qwen3.8-27B (base) | 27B | no disponible | no disponible | Hugging Face |
| Alternativas de código/matemáticas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base Qwen3.8-27B, del que se indica la clase de parámetros pero no sus especificaciones completas ni sus resultados de benchmark. No se dispone de datos de otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se garantiza un rendimiento equivalente en castellano.
- El modelo no se autocertifica: los resultados de los benchmarks de agente dependen del VeriLoop Harness, cuya implementación de producción no se incluye en el repositorio, lo que dificulta reproducir exactamente las condiciones de evaluación.
- Riesgo de alucinación inherente a los modelos generativos; la disciplina VGR mitiga la propagación de errores solo cuando se usa con el arnés de verificación externa.
- Sesgos conocidos: no disponible en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen3.8-27B, no detalladas en la información disponible.
- El contexto validado en servicio (131.072 tokens) es la mitad del contexto nativo del tokenizador (262.144 tokens); en producción conviene planificar en torno al límite validado.
- No se especifican tipos de cuantización soportados ni requisitos de hardware, lo que complica el dimensionamiento previo del despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- ModelScope (Global): https://modelscope.ai/models/tsinghua-sigs-robot-lab/VeriLoop-E2
- ModelScope (China): https://modelscope.cn/models/tsinghua-sigs-robot-lab/VeriLoop-E2
- Informe técnico: https://openreview.net/forum?id=P6FIQILHwX&noteId=P6FIQILHwX
- Evidencia de evaluación: https://huggingface.co/datasets/tsinghua-sigs-robot-lab/VeriLoop-E2-Evaluation-Evidence
- Artefacto Riemann ζ: https://github.com/brucewang123456789/GeniusTrail/tree/VeriLoop-E2/riemann-hypothesis
- Artefacto del paradoxo de la información de agujeros negros: https://github.com/brucewang123456789/GeniusTrail/tree/VeriLoop-E2/black%20hole%20information%20paradox
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
