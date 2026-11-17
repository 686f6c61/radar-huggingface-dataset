# xl-24/gemma4-4b-atc-finetune-32-64-merged-16bit

## Resumen

`xl-24/gemma4-4b-atc-finetune-32-64-merged-16bit` es un ajuste fino (finetune) del modelo base `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, que a su vez deriva de la familia Gemma 4 (variante E4B, "effective 4B") de Google. Lo desarrolla el usuario independiente xl-24 y se publica bajo licencia Apache 2.0. El modelo está pensado para generación de texto conversacional y también declara el pipeline `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base.

El nombre del repositorio indica un ajuste fino orientado a "atc" (probablemente *air traffic control* o una tarea conversacional específica; el autor no lo documenta), entrenado con ventanas de contexto de 32k y 64k y posteriormente fusionado (merged) y exportado en precisión de 16 bits. El repositorio pesa 16 GB y contiene 7.996.156.490 parámetros según los pesos en safetensors, cifra que corresponde al modelo completo en 16 bits y no a los "parámetros activos" que sugiere la nomenclatura E4B.

Su relevancia es limitada: es un experimento de la comunidad con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni benchmarks publicados. Resulta útil como ejemplo de flujo de trabajo Unsloth + TRL para ajustar Gemma 4 y para quien necesite un punto de partida afinado sobre el que continuar entrenando, pero no como modelo de referencia para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E4B); detalles exactos no disponibles |
| Parametros totales | 7.996.156.490 (según safetensors) |
| Parametros activos | no disponible (la nomenclatura E4B sugiere ~4B efectivos, pero el autor no lo confirma) |
| Longitud de contexto | no disponible (el nombre del repo menciona entrenamiento con ventanas de 32k y 64k) |
| Tipos de cuantizacion | no disponible en el repo (solo pesos 16 bits); el modelo base se distribuye en bnb-4bit |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, una versión cuantizada a 4 bits (bitsandbytes) del Gemma 4 E4B instruct de Google, preparada por Unsloth. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card, y el resultado se fusionó con los pesos base y se exportó en 16 bits (de ahí el sufijo `merged-16bit`). El nombre del repositorio sugiere secuencias de entrenamiento de 32k y 64k tokens, pero el autor no documenta la composición del dataset, el número de tokens vistos ni si hubo RLHF o DPO.

No hay información sobre innovaciones técnicas específicas del ajuste (por ejemplo, si se usó LoRA, QLoRA o full fine-tuning), ni sobre la receta de datos. La arquitectura subyacente es la de Gemma 4 E4B, de la que no se aportan detalles en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instruct base.
- Pipeline declarado `image-text-to-text`, lo que indica soporte multimodal de entrada (imagen + texto), aunque el autor no lo detalla.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Ajuste fino continuado: sirve como punto de partida en 16 bits para quien quiera seguir entrenando sobre Gemma 4 E4B con Unsloth o TRL sin partir del checkpoint cuantizado a 4 bits.
- Experimentación académica con contextos largos: el nombre del repo indica entrenamiento con ventanas de 32k y 64k, por lo que puede usarse para probar tareas de resumen o QA sobre documentos extensos en inglés.
- Prototipado de asistentes conversacionales en inglés: al ser un modelo instruct fusionado, puede desplegarse con transformers y servir como base para demos de chatbot.
- Evaluación de pipelines multimodales: el pipeline `image-text-to-text` permite probar flujos de imagen + texto, aunque sin garantías de calidad por falta de benchmarks.
- Reproducción de recetas de entrenamiento: útil para validar flujos Unsloth + TRL con Gemma 4 y comparar el efecto del merge en 16 bits frente al checkpoint cuantizado.
- Base para tareas específicas de dominio ("atc"): si el ajuste se orientó a un dominio concreto, puede reutilizarse como semilla para especializaciones similares, siempre que se valide su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 24 GB o más para contextos largos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para 16 bits; para contextos de 32k-64k se necesita margen adicional de memoria.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con contextos moderados; en GPUs de 16 GB requeriría cuantización adicional no incluida en el repo.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (tag declarado), vLLM; llama.cpp/Ollama requerirían conversión a GGUF, no incluida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xl-24/gemma4-4b-atc-finetune-32-64-merged-16bit | ~8,0B (16 bits) | no disponible (32k/64k en entrenamiento según nombre) | Apache 2.0 | Hugging Face, 0 descargas |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (base) | ~4B efectivos (cuantizado 4 bits) | no disponible | Apache 2.0 | Hugging Face, mantenido por Unsloth |
| Gemma 4 E4B-it (original de Google) | ~4B efectivos | no disponible | Gemma Terms (no Apache 2.0) | Hugging Face / Google |

La comparación con alternativas de la misma categoría (modelos instruct de ~4-8B) no puede completarse con datos de rendimiento porque no hay benchmarks publicados para este ajuste.

## Limitaciones y advertencias

- Sin benchmarks ni evaluación publicada: no hay evidencia de calidad frente al modelo base.
- Model card mínima: no se documentan dataset, hiperparámetros ni propósito exacto del ajuste "atc".
- Solo inglés: la etiqueta de idioma es `en`; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos y no evaluado en este checkpoint.
- Sesgos: no documentados; hereda los del modelo base Gemma 4.
- Licencia: Apache 2.0 en este repositorio, pero conviene verificar las condiciones del modelo original de Google (Gemma Terms) antes de uso comercial.
- Repositorio sin tracción (0 descargas, 0 likes): no hay comunidad que valide su funcionamiento ni issues resueltos.
- Pesos en 16 bits de ~16 GB: requiere hardware con VRAM suficiente; no se incluyen versiones GGUF ni cuantizadas.

## Enlaces

- Hugging Face: https://huggingface.co/xl-24/gemma4-4b-atc-finetune-32-64-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
