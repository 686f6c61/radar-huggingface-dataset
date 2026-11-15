# xl-24/gemma4-4b-atc-finetune_sp_v2-merged-16bit

## Resumen

`xl-24/gemma4-4b-atc-finetune_sp_v2-merged-16bit` es un ajuste fino (fine-tuning) publicado por el usuario xl-24 sobre el modelo base `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, que a su vez deriva de la familia Gemma 4 de Google. El sufijo "atc" y "sp_v2" sugiere un ajuste orientado a una tarea concreta (posiblemente atención al cliente, "ATC", en su versión 2), aunque la model card no documenta el dataset ni el objetivo exacto del entrenamiento. El modelo está publicado en formato mergeado de 16 bits, listo para inferencia directa con `transformers`, y conserva la pipeline `image-text-to-text` del modelo base, lo que indica que mantiene capacidades multimodales de entrada (imagen + texto).

El repositorio pesa 16,0 GB y los pesos en safetensors suman 7.996.156.490 parámetros (unos 8 mil millones), a pesar de que el nombre comercial lo etiqueta como "4b". Gemma 4 E4B corresponde a la variante "effective 4B" de la familia, que en la práctica contiene aproximadamente 8B parámetros totales con un esquema de activación reducida (perceiver-style o MoE ligero según la familia), de ahí la discrepancia entre el nombre y el conteo real. El contexto, la composición del dataset de ajuste y los hiperparámetros de entrenamiento no están documentados en la información disponible.

La relevancia de esta ficha es principalmente práctica: se trata de un modelo pequeño-medio, con licencia Apache 2.0, publicado en 16 bits para evitar problemas de dequantización, y entrenado con Unsloth + TRL (lo que implica un pipeline de fine-tuning eficiente en memoria). Es útil para quien quiera evaluar un ajuste específico de dominio sobre Gemma 4 E4B sin tener que reproducir el entrenamiento, o como punto de partida para nuevos ajustes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, pipeline image-text-to-text); detalles internos (atención, MoE, SSM) no disponibles |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en 16 bits (merged-16bit); cuantizaciones GGUF/AWQ/GPTQ no publicadas en el repo |
| Idiomas soportados | en (segun model card); otros idiomas de Gemma 4 no confirmados para este ajuste |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, que es la versión "it" (instruction-tuned) de Gemma 4 E4B cuantizada en 4 bits por Unsloth para entrenamiento eficiente en memoria. El autor ha realizado un merge de los adaptadores LoRA sobre los pesos base y ha exportado el resultado en 16 bits (`merged-16bit`), lo que elimina la necesidad de aplicar adaptadores en tiempo de inferencia y evita la pérdida de precisión de mantener los pesos en 4 bits. El entrenamiento se declara realizado con Unsloth y la librería TRL de Hugging Face, con una aceleración reportada de "2x más rápido" respecto a un pipeline estándar, aunque no se especifican epochs, learning rate, rango de LoRA ni tamaño del dataset.

No hay información sobre el dataset de ajuste (composición, número de tokens, si incluye datos multimodales o solo texto), ni sobre si se aplicó RLHF/DPO adicional más allá del alignment original de Gemma 4 IT. Tampoco se documentan innovaciones técnicas específicas del ajuste (decodificación especulativa, atención linear, etc.). La arquitectura subyacente es la de Gemma 4 E4B, un transformer multimodal de la familia Gemma 4, pero los detalles concretos (número de capas, heads, dimensión oculta, mecanismo de atención) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation-inference`, tag `conversational`).
- Entrada multimodal imagen + texto (pipeline `image-text-to-text` heredado del base Gemma 4 E4B IT).
- Instrucciones multi-turno (hereda el instruction tuning de Gemma 4 IT).
- Capacidades de razonamiento, código y matemáticas: presumibles por la familia base, pero no verificadas en este ajuste concreto.
- Tool calling / function calling: no confirmado para este ajuste; Gemma 4 IT base lo soporta según la familia, pero no hay evidencia en la model card.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: la model card declara solo `en`; el multilingüismo de Gemma 4 no está confirmado tras este ajuste.
- Modo "thinking": no documentado para este ajuste.

## Casos de uso

- Evaluación de ajustes de dominio: usar el modelo como referencia para comparar un fine-tuning específico ("atc"/atención al cliente) frente al Gemma 4 E4B IT original, midiendo degradación o mejora en tareas del dominio con un conjunto de evaluación propio.
- Base para nuevos fine-tunings: al estar en 16 bits y sin adaptadores, sirve como punto de partida limpio para aplicar LoRA con Unsloth o TRL sobre un dominio distinto, evitando partir del checkpoint cuantizado en 4 bits.
- Inferencia multimodal ligera: al conservar la pipeline `image-text-to-text`, puede desplegarse para tareas de descripción de imágenes o VQA de baja complejidad, siempre que se valide el comportamiento tras el ajuste.
- Despliegue en servidores con VRAM moderada: con ~8B parámetros en 16 bits (~16 GB de pesos), cabe en GPUs de 24 GB (RTX 4090, L4, A10) usando cuantización en carga o en GPUs de 40-80 GB (A100 40GB, H100) en 16 bits nativo.
- Integración en pipelines de TGI: el tag `text-generation-inference` y `endpoints_compatible` permiten servirlo con Text Generation Inference para pruebas internas de API compatible con OpenAI.
- Prototipado de asistentes conversacionales en inglés: útil para validar flujos multi-turno en inglés antes de invertir en un modelo mayor, dado el bajo coste de despliegue de un 8B.
- Reproducibilidad de experimentos: como checkpoint mergeado, permite reproducir exactamente las salidas del ajuste sin depender de la versión de PEFT o del orden de merge de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: ~16 GB solo para pesos, más KV cache y activaciones; en la práctica ~18-22 GB para contextos moderados.
- VRAM estimada en 8 bits (bitsandbytes): ~8-9 GB de pesos, ~12-14 GB totales.
- VRAM estimada en 4 bits (GPTQ/AWQ/BNB): ~4-5 GB de pesos, ~8-10 GB totales; no hay checkpoints cuantizados publicados en el repo, habría que generarlos.
- GPU recomendadas: A100 40GB, H100 80GB, L40S 48GB para 16 bits nativo; RTX 4090 24GB, L4 24GB, A10 24GB para 16 bits con contexto corto o cuantización en carga.
- Consumer GPU: sí, en RTX 4090 24GB (16 bits con contexto limitado) y RTX 3090 24GB; en GPUs de 16 GB (RTX 4080, 4060 Ti 16GB) solo con cuantización 8 o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (tag `text-generation-inference`), vLLM (compatible con safetensors, validar soporte de Gemma 4), llama.cpp/Ollama solo tras convertir a GGUF (no publicado).
- Latencia y throughput: no disponibles; dependen de GPU, cuantización y longitud de contexto. Como referencia orientativa para un 8B en A100 80GB con vLLM, se suele observar throughput en decenas de tokens/s por petición y cientos agregados, pero no hay medición publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xl-24/gemma4-4b-atc-finetune_sp_v2-merged-16bit | ~8B | no disponible | si (image-text-to-text) | apache-2.0 | HF, 0 descargas |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (base) | ~8B (4-bit) | no disponible | si | apache-2.0 (segun familia) | HF |
| Gemma 4 E4B IT (original Google) | ~8B | no disponible | si | Gemma Terms (no Apache) | HF / Kaggle |
| Llama 3.1 8B Instruct | 8B | 128K | no | Llama 3.1 Community License | HF |

Nota: la comparativa con Llama 3.1 8B se incluye como referencia de tamaño; no hay datos de rendimiento de este checkpoint para comparar benchmarks. La licencia del ajuste es Apache 2.0, pero conviene verificar que la licencia del base Gemma 4 permita redistribución bajo Apache 2.0 en este caso concreto.

## Limitaciones y advertencias

- Dataset de ajuste no documentado: se desconoce el dominio exacto ("atc"/"sp_v2") y si introduce sesgos o sobreajuste; no hay evaluación publicada.
- Riesgo de alucinación: inherente a modelos de ~8B; no hay medición de factualidad para este checkpoint.
- Idioma: la model card declara solo `en`; el uso en castellano no está validado y puede degradar respecto al base Gemma 4.
- Contexto: no documentado; no planificar despliegues que dependan de ventanas largas sin medirlo empíricamente.
- Licencia: el ajuste se declara Apache 2.0, pero el modelo base Gemma 4 tiene términos propios de Google; verificar compatibilidad antes de uso comercial y redistribución.
- Repositorio sin descargas ni likes (0/0) y creado en 2026-11-14: no hay señales de validación por la comunidad; tratar como checkpoint experimental.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en hardware limitado requiere generarlas y validar su calidad.
- Capacidades de tool calling y agentes no confirmadas para este ajuste; no asumirlas en producción sin pruebas.
- El nombre "4b" no coincide con los ~8B reales en safetensors; tenerlo en cuenta al planificar VRAM y throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xl-24/gemma4-4b-atc-finetune_sp_v2-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth (repo): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Familia Gemma (Google): https://ai.google.dev/gemma
