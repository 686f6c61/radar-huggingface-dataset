# TypeScript/FastBrain-9B

## Resumen

FastBrain-9B es un modelo de decisión estructurado no autorregresivo de tipo "System-1" desarrollado por el usuario TypeScript en HuggingFace, construido sobre el modelo base Cloudflare/clef-flash (con backbone híbrido Qwen3.5-9B). A diferencia de un LLM generativo convencional, FastBrain-9B no genera tokens de texto: recibe un estado JSON arbitrario junto con uno o más esquemas de decisión estructurados (elección tipo `choice`, verificación binaria tipo `noul` o ranking tipo `score`) y evalúa todas las opciones candidatas y preguntas de forma conjunta en una única pasada hacia adelante, con cero tokens generados.

Esto le permite entregar probabilidades calibradas por opción, selecciones de tool-call y decisiones de abstención en conjunto abierto con latencia de nivel encoder, algo especialmente relevante para pipelines de agentes donde la latencia de decisión es crítica. El modelo combina un backbone híbrido de 9B parámetros con una cabeza de decisión JointSchemaHead de 116M parámetros, y destaca en benchmarks especializados de decisión estructurada: alcanza un 97,4 % de balanced accuracy en safeagents-judge-bench (puesto 1 de 9) y un 80,55 % de media en el Cloudflare Decision Index v0.2.1 (puesto 2 de 7, primero en su clase de <=9B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone híbrido Qwen3.5-9B (32 bloques híbridos) + JointSchemaHead de decisión, no autorregresivo, pasada única |
| Parametros totales | 9.409.813.744 (9,4B: backbone 9B + JointSchemaHead 116M) |
| Parametros activos | 9,4B (no es MoE; todos los parámetros activos en cada pasada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye pesos en safetensors y GGUF, pero no se detallan las variantes de cuantización) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards del backbone + joint_head.safetensors) y GGUF; compatible con llama.cpp y sglang |

## Arquitectura y entrenamiento

FastBrain-9B se apoya en un backbone híbrido Qwen3.5-9B con 32 bloques, sobre el cual se aplica una cabeza de decisión JointSchemaHead de 116M parámetros. La arquitectura es no autorregresiva: en lugar de generar tokens secuencialmente, evalúa de forma conjunta todas las opciones candidatas y preguntas del esquema de decisión en una sola pasada hacia adelante (0 tokens generados), lo que reduce la latencia a niveles comparables a los de un modelo encoder. La salida incluye probabilidades calibradas por opción, selecciones de tool-call y decisiones de abstención en conjunto abierto.

El ajuste fino se realizó sobre el dataset propio TypeScript/FastBrain-Instruct. Las actualizaciones del backbone corresponden a 104 capas de proyección distribuidas por los 32 bloques híbridos, ya fusionadas directamente en los pesos del backbone (sin necesidad de adaptadores LoRA o PEFT en inferencia), mientras que los 122 tensores de la cabeza de decisión se empaquetan por separado en `joint_head.safetensors`. No se ha publicado información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Decisiones estructuradas de tipo `choice`: selección entre opciones candidatas con probabilidades calibradas.
- Verificación binaria tipo `noul`: clasificación sí/no con salida tipada.
- Ranking tipo `score`: ordenación de candidatos con puntuaciones.
- Tool calling / function calling: selección de llamadas a herramientas como salida estructurada del proceso de decisión.
- Clasificación de intención (intent classification) sobre estados JSON arbitrarios.
- Abstención en conjunto abierto: puede decidir no responder cuando ninguna opción es adecuada.
- Entrada imagen-texto: etiquetado como image-text-to-text / image-text-to-typed-output, lo que sugiere soporte multimodal de entrada.
- Salida tipada (typed output): generación de decisiones estructuradas con esquema, no texto libre.
- Latencia de encoder: evaluación conjunta en una única pasada sin generación autorregresiva.

## Casos de uso

- Guardarraíles de seguridad en agentes (guardrails): como clasificador binario de verificación puede actuar como juez o filtro de seguridad antes de ejecutar acciones de un agente, con 97,4 % de balanced accuracy en safeagents-judge-bench y latencia mínima al no generar tokens.
- Enrutado de intenciones en chatbots: clasifica la intención del usuario sobre un estado JSON de conversación y selecciona la herramienta o flujo adecuado en una sola pasada, ideal para sistemas de alto volumen donde la latencia importa.
- Orquestación de agentes multi-paso: puede usarse como "cerebro de decisión" System-1 dentro de un agente, decidiendo rápidamente la siguiente acción o tool-call sin el coste de un LLM generativo completo.
- Moderación y verificación de contenido: la verificación binaria `noul` permite clasificar contenido (texto e imagen) como apto o no apto con probabilidades calibradas.
- Selección y ranking de candidatos: escenarios como priorización de tickets, ranking de respuestas de recuperación (RAG) o selección de documentos relevantes usando el modo `score`.
- Clasificación estructurada con abstención: pipelines de datos donde es preferible derivar a revisión humana antes que forzar una etiqueta incorrecta, gracias a la decisión de abstención en conjunto abierto.
- Despliegue local de decisiones tipadas: con soporte de GGUF y llama.cpp, puede ejecutarse en infraestructura propia para decisiones de baja latencia sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados publicados en la model card (datos del autor del modelo):

| Benchmark | Métrica | Resultado | Puesto | Modelos superados destacados |
|---|---|---|---|---|
| safeagents-judge-bench (guardarraíl binario) | Balanced accuracy | 97,4 % (destilado crudo: 94,9 %) | 1 / 9 | Cloudflare/clef-omni (30B, 84,5 %), LiquidAI/d1-3B (82,3 %), clef-flash (9,4B, 72,1 %) |
| safeagents-judge-bench (7 categorías) | Macro-F1 | 85,1 % (destilado crudo: 62,4 %) | 1 / 9 | Cloudflare/clef (27,4B, 42,5 %), vllm-sr/d3-mini (36,7 %) |
| LocalLLaMA/typed-decisions (zero-shot overall) | Accuracy | 75,25 % / 76,25 % (KL 0,1508, Brier 0,0795) | 7 / 42 (live) | vllm-sr/d3 (27B, 74,9 %), Baseten Elephant 1 (9B, 74,8 %), Cloudflare/clef (27B, 72,8 %) |
| LocalLLaMA/typed-decisions (zero-shot <=9B) | Accuracy | 75,25 % / 76,25 % (destilado crudo: 77,35 %) | 2 / 19 (live), 1º arquitectura Clef | Baseten Elephant 1 (74,8 %), vllm-sr/d3-mini (74,3 %), LiquidAI/d1-3B (65,6 %) |
| LocalLLaMA/typed-decisions (ajustado en train) | Accuracy | 79,70 % / 80,70 % (KL 0,0816, Brier 0,0437) | 1º clase 9B, top 9 / 36 | OpenDecider-small-td (4B, 79,2 %), OpenDecider-medium-td (30B-A3B, 78,8 %) |
| Cloudflare Decision Index v0.2.1 (10 tareas, 22.427 peticiones) | Media macro | 80,55 % | 2 / 7 overall, 1º <=9B | Jev (27B, 80,32 %), Kev 9B (76,51 %), clef-flash (74,96 %), DiffGemma (26B, 69,14 %) |

No se han publicado resultados de benchmarks generales tipo MMLU, HumanEval o GSM8K, lo cual es coherente con la naturaleza del modelo: no es un LLM generativo de propósito general sino un modelo de decisión estructurada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,4B parámetros en FP16/BF16, la estimación estándar es de unos 19-20 GB solo de pesos, más overhead de activaciones. En cuantización de 4 bits (GGUF Q4) cabría en torno a 5-6 GB.
- GPU recomendadas: no disponible oficialmente; por tamaño, una RTX 4090 (24 GB) o RTX 3090 deberían bastar para inferencia en precisión completa, y GPUs más modestas con cuantización GGUF.
- Consumer GPUs: en principio sí, dado el tamaño de 9,4B; con GGUF cuantizado sería viable incluso en GPUs de 8-12 GB, aunque no hay cifras oficiales de consumo.
- Opciones de despliegue: la model card menciona compatibilidad con llama.cpp y sglang (vía tags GGUF), además de la librería transformers de HuggingFace. No se menciona explícitamente vLLM, Ollama ni TGI.
- Latencia y throughput: no se publican cifras numéricas, pero el diseño no autorregresivo de pasada única (0 tokens generados) implica latencia de nivel encoder, muy inferior a la de un LLM generativo equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Resultado destacado |
|---|---|---|---|---|---|
| FastBrain-9B | 9,4B | Decisión estructurada no autorregresiva | no disponible | Apache 2.0 | 97,4 % bal. acc (safeagents-judge-bench), 80,55 % Decision Index |
| Cloudflare/clef-flash (modelo base) | 9,4B | Decisión estructurada | no disponible | no disponible | 72,1 % bal. acc (safeagents-judge-bench), 74,96 % Decision Index |
| Cloudflare/clef | 27,4B | Decisión estructurada | no disponible | no disponible | 71,8 % bal. acc (safeagents-judge-bench), 72,8 % typed-decisions |
| LiquidAI/d1-3B | 3B | Decisión estructurada | no disponible | no disponible | 82,3 % bal. acc (safeagents-judge-bench), 65,6 % typed-decisions |

FastBrain-9B supera a su modelo base (clef-flash) por un margen amplio en todos los benchmarks publicados y compite de igual a igual o mejor que modelos mucho mayores como Cloudflare/clef de 27,4B, con la ventaja añadida de su licencia Apache 2.0 permisiva.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés (en); no hay soporte declarado para castellano ni otros idiomas.
- No es un LLM generativo: no sirve para generación de texto libre, conversación abierta, redacción de código o razonamiento de tipo "System-2"; está diseñado exclusivamente para decisiones estructuradas sobre esquemas definidos.
- Contexto: la longitud de ventana de contexto no está publicada, lo que dificulta planificar entradas JSON grandes o multimodales.
- Sesgos: no se documentan sesgos conocidos en la model card; al derivar de un backbone Qwen3.5 y entrenarse sobre un dataset propio (FastBrain-Instruct), hereda potencialmente los sesgos de ambos, sin auditoría publicada.
- Alucinación: al no generar texto libre, el riesgo de alucinación textual es bajo, pero la calibración de probabilidades puede degradarse fuera de la distribución del dataset de entrenamiento (nótese la caída de 85,1 % a 62,4 % Macro-F1 entre la versión final y la "destilada cruda" en la categoría de 7 vías).
- Benchmarks: todos los resultados provienen de la model card del propio autor y no han sido verificados de forma independiente en la información disponible.
- Uso comercial: la licencia Apache 2.0 es permisiva y permite uso comercial, pero conviene revisar los términos del modelo base (Cloudflare/clef-flash) y del backbone Qwen3.5 por si aplican condiciones adicionales.
- Madurez: el modelo es muy reciente (creado en octubre de 2026), con pocas descargas (1.127) y sin likes, lo que sugiere una comunidad de usuario reducida y soporte tooling limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TypeScript/FastBrain-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/TypeScript/FastBrain-Instruct (deducido del campo `datasets` de la model card)
- Modelo base: https://huggingface.co/Cloudflare/clef-flash (deducido del campo `base_model`)
- Benchmark safeagents-judge-bench: https://huggingface.co/datasets/harness-hub/safeagents-judge-bench
- Benchmark LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- PR de evaluación en safeagents-judge-bench: https://huggingface.co/datasets/harness-hub/safeagents-judge-bench/discussions/1
- PR de evaluación en typed-decisions (zero-shot): https://huggingface.co/datasets/LocalLLaMA/typed-decisions/discussions/58
- PR de evaluación en typed-decisions (fitted): https://huggingface.co/datasets/LocalLLaMA/typed-decisions/discussions/57
- Paper técnico, repositorio de código y demo: no disponibles (no se han encontrado en la información proporcionada; los resultados de búsqueda web solo devuelven documentación del lenguaje TypeScript, sin relación con este modelo)
