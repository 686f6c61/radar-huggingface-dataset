# Ura0316/zils-mini-body-a2f

## Resumen

zils-mini-body-a2f es un "body" (cuerpo de pesos) publicado por el usuario Ura0316 dentro del ecosistema Zils, un proyecto asociado al subnet 127 de Bittensor que entrena modelos pequeños para tareas de decisión. No se trata de un modelo conversacional completo: el repositorio contiene exclusivamente los pesos de lenguaje y visión (723 tensores en bfloat16) dispuestos en el formato "chassis" del pool, mientras que la capa de respuesta, el prompt y el runtime provienen del chassis fijado del pool. Por tanto, el artefacto no es utilizable de forma autónoma sin ese runtime.

El modelo se construye mediante un "soup" (promedio uniforme de pesos) de dos fine-tunes. Cada uno parte de una mezcla de modelos "house body" y aplica un adaptador LoRA de rango 64 sobre las proyecciones de atención y MLP, entrenado durante una época sobre ítems de decisión en formato de examen con una pérdida de entropía cruzada suave hacia la distribución de respuestas de un modelo profesor, más un término de Brier. El body final es el promedio de ambos fine-tunes fusionados.

Con 4.539.265.536 parámetros y un tamaño de repositorio de 9,1 GB, el modelo se sitúa en la categoría de 4B densos. Su relevancia es acotada y experimental: ilustra el flujo de trabajo de merging y fine-tuning orientado a decisión del subnet Zils, más que un modelo de propósito general. La licencia Apache-2.0 y la ascendencia declarada (Qwen/Qwen3.5-4B) facilitan su reutilización, aunque la documentación pública es mínima y no se han publicado benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-4B según el autor); pesos en formato chassis de 723 tensores |
| Parámetros totales | 4.539.265.536 (≈4,54B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso heredado de Qwen/Qwen3.5-4B, según declara el autor, con los pesos reorganizados en el layout chassis del pool Zils (723 tensores). El proceso de construcción consta de dos arranques: el primero es el promedio uniforme de torchcast-ai/torchcast-decision-4b (commit 492bfb19) y vllm-sr/d3-mini (commit df99bf4c); el segundo es el promedio uniforme de torchcast-ai/torchcast-decision-4b (492bfb19), perplexity-ai/pplx-decider-flash-v1.2 (9ff7cf98), vllm-sr/d3-mini (df99bf4c) y Maincode/Matilda-Decision-v1-Mini (39479a8a).

Sobre cada arranque se entrena un adaptador LoRA de rango 64 aplicado a las proyecciones de atención y MLP durante una época, sobre ítems de decisión en formato de examen. La función de pérdida combina entropía cruzada suave contra la distribución de respuestas de un modelo profesor y un término de Brier, orientado a calibrar probabilidades de decisión. Cada adaptador se fusiona en los pesos y el body final resulta del promedio uniforme de los dos fine-tunes fusionados, generado con el constructor de soups de Zils. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de pesos de lenguaje y visión para el pool de decisión d3-mini de Zils; no es un modelo autónomo, requiere el chassis, prompt y runtime del pool.
- Clasificación y puntuación de decisiones: el entrenamiento con pérdida de Brier y destilación desde un profesor apunta a producir distribuciones de respuesta calibradas sobre ítems tipo examen.
- Capacidad multimodal declarada por el autor ("language and vision weights"), aunque no se detallan las modalidades ni los encoders concretos.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Clasificación de solicitudes en aplicaciones: el modelo se integra en el runtime Zils para etiquetar peticiones entrantes (soporte, incidencias, consultas) según ejemplos etiquetados por el desarrollador, aprovechando el entrenamiento en ítems de decisión.
- Priorización y triaje de tickets: la pérdida de Brier empleada en el entrenamiento favorece salidas probabilísticas calibradas, útiles para ordenar colas de trabajo por confianza.
- Detección de anomalías o flags: el flujo de Zils permite marcar problemas a partir de ejemplos con la respuesta correcta, y este body actúa como capa de representación para ese clasificador.
- Puntuación de coincidencias (matching): aplicable a emparejar perfiles, productos o documentos mediante la distribución de decisión del modelo sobre pares candidatos.
- Investigación sobre merging de modelos: el repositorio documenta un pipeline reproducible de promedios de pesos, LoRA rank-64 y destilación con término de Brier, útil como referencia metodológica.
- Evaluación de modelos de decisión en el subnet 127 de Bittensor: sirve como body candidato dentro del pool d3-mini para experimentar con el chassis fijado y comparar calibración frente a otros bodies.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos; en 4 bits, alrededor de 2,3-2,8 GB (estimación teórica, no validada por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en bfloat16 con concurrencia; RTX 4090 o RTX 3090 para inferencia en bfloat16 de un solo usuario.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 y en GPUs de 8-12 GB si se cuantiza, siempre que el runtime del chassis Zils lo permita.
- Opciones de despliegue: el autor indica que el runtime proviene del chassis del pool; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. Al estar los pesos en layout chassis de 723 tensores, la carga directa en esos motores requeriría conversión y no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-a2f | 4,54B | no disponible | Apache-2.0 | Hugging Face (body, requiere runtime del pool) | Soup de dos fine-tunes con LoRA rank-64 |
| Qwen/Qwen3.5-4B | ~4B (según autor) | no disponible | Apache-2.0 | Hugging Face | Modelo base declarado; uso general |
| torchcast-ai/torchcast-decision-4b | no disponible | no disponible | no disponible | Hugging Face | Componente del soup; orientado a decisión |
| vllm-sr/d3-mini | no disponible | no disponible | no disponible | Hugging Face | Componente del soup; base del pool d3-mini |

La comparación de rendimiento no es posible: ninguno de los modelos citados dispone de benchmarks publicados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el chassis, prompt y runtime fijados del pool Zils, los pesos no producen respuestas utilizables.
- Documentación mínima: no se especifican contexto, idiomas, dataset de entrenamiento ni evaluación; la model card se limita al proceso de construcción.
- Riesgo de alucinación y descalibración fuera de distribución: el entrenamiento se limita a una época sobre ítems de decisión en formato de examen, por lo que el comportamiento fuera de ese dominio es incierto.
- Sesgos: no documentados; al derivar de modelos base de terceros, hereda los sesgos de estos, que tampoco se detallan.
- Limitaciones de idioma: no disponibles; no se declara cobertura multilingüe.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las licencias de los cuatro modelos base y del modelo Qwen subyacente antes de desplegar en producción.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-08; no hay evidencia de validación independiente.
- El pipeline de merging (promedios uniformes y LoRA fusionado) puede degradar capacidades del modelo base; no se aportan evaluaciones que lo descarten.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ura0316/zils-mini-body-a2f
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Componente del soup: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Componente del soup: https://huggingface.co/vllm-sr/d3-mini
- Componente del soup: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Componente del soup: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Sitio web de Zils: https://zils.ai/
- Repositorio web de Zils: https://github.com/ooo-hq/zils-web
