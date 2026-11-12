# utsavz/wsp_nov11_qwen3vl4b_complementary

## Resumen

`utsavz/wsp_nov11_qwen3vl4b_complementary` es un checkpoint de investigación derivado de `Qwen/Qwen3-VL-4B-Instruct` mediante técnicas de *weight-space programming* (WSP), una forma de edición de pesos que modifica directamente matrices de pesos sin recurrir a gradientes, fine-tuning, SFT ni RL. El autor, `utsavz`, lo presenta como el "Model B" de una pareja experimental: parte del checkpoint congelado `utsavz/wsp_nov11_qwen3vl4b_single` (Model A) y le suma una componente complementaria `Δ_cand_01_comp` con coeficiente `λ·ω = 1.0`, dando la construcción `W_B = W_best + λ·ω·Δ_cand_01_comp`.

El objetivo declarado es aumentar la tasa de rechazo (refusal) ante prompts dañinos en un modelo multimodal image-text-to-text, preservando el comportamiento benigno. Se modifican exactamente cuatro tensores del bloque de lenguaje: `o_proj` de la capa 18 (ancla rank-1 heredada del Model A) y `down_proj` de las capas MLP 22, 24 y 28 (componente complementaria rank-1). El resto de los pesos es bit-idéntico al modelo base.

Es relevante para investigadores interesados en edición de pesos y safety alignment sin entrenamiento, pero conviene subrayar que el propio autor reconoce que la complementariedad respecto al Model A **no ha sido demostrada**: un control que simplemente escala el ancla por 1,667 iguala prácticamente sus resultados. No hay evaluación independiente ni benchmarks estándar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL); vision encoder + language model con atención, base `Qwen/Qwen3-VL-4B-Instruct` |
| Parametros totales | 4.437.815.808 (4,44 mil millones, según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Qwen3-VL-4B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el README usa `dtype=torch.bfloat16`) |
| Idiomas soportados | no disponible (heredados del base, no declarados en la ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de edición de pesos sobre `Qwen/Qwen3-VL-4B-Instruct` (revisión `ebb281ec70b05090aa6165b016eac8ec08e71b17`), un transformer multimodal con pipeline `image-text-to-text`. No se aplicó ningún proceso de entrenamiento: ni gradientes, ni fine-tuning, ni SFT, ni RL. Las modificaciones son intervenciones rank-1 sobre matrices concretas del bloque de lenguaje.

El Model A (`wsp_nov11_qwen3vl4b_single`) introdujo una "escritura key→refusal" rank-1 en `model.language_model.layers.18.self_attn.o_proj.weight` (forma 2560×4096). El componente complementario `cand_01` se construyó de forma independiente aplicando `W ← W + 0.8·r_l r_lᵀ W` sobre el `down_proj` (forma 2560×9728) de las capas MLP 22 a 28, lo que multiplica por 1,8 la componente de la salida de cada MLP tardía alineada con la dirección de rechazo `r_l` de esa capa. La selección conservó solo las capas en las que la mayor "escritura benigna" a lo largo de `r_l` queda por debajo de la escritura media de los prompts dañinos que el Model A aún respondía: L22, L24 y L28. El coeficiente 1,0 se eligió entre {0,5; 1,0; 1,5} sobre un split de selección separado.

Se descartaron otras componentes: `cand_04` (neurona gateada en L21, cuyo detector lee la propia escritura del ancla con coseno 0,70 e interfiere al apilarla), `cand_04_comp` (re-derivación ortogonalizada al ancla que solo aportaba 4 ítems ya cubiertos) y `cand_02` (ganancia de atención cuyos arreglos eran subconjunto de los de `cand_01` con mayor coste de utilidad).

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del base Qwen3-VL-4B-Instruct.
- Comprensión de imagen y texto conjuntos (pipeline `image-text-to-text`): respuesta a consultas que combinan imagen y prompt textual.
- Comportamiento de rechazo reforzado ante prompts dañinos, incluidos casos con imagen dañina y texto inocuo (parcialmente, ver limitaciones).
- Tool calling y function calling: no disponible en la información proporcionada (no declarado en la ficha del checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no declaradas).
- Capacidades especiales (thinking mode, audio, etc.): no disponible; el checkpoint solo documenta la modificación de safety.

## Casos de uso

- Investigación en edición de pesos y safety alignment: permite estudiar cómo una intervención rank-1 sobre `o_proj` y `down_proj` altera la tasa de rechazo sin reentrenar, comparando contra el Model A y el base original.
- Reproducción de experimentos de WSP: sirve como referencia bit-exacta del Model A embebido, útil para verificar que solo cuatro tensores difieren del checkpoint congelado.
- Análisis de direcciones de rechazo (`r_l`): permite inspeccionar cómo la amplificación de la componente alineada con `r_l` en MLPs tardías afecta la salida del bloque de lenguaje.
- Evaluación de over-refusal en sistemas multimodales: el modelo documenta un caso adicional de rechazo indebido (pregunta benigna sobre un meme satírico), útil para calibrar taxonomías de falsos positivos.
- Estudio de robustez ante ataques con imagen dañina y texto inocuo (VLGuard `unsafes`): escenario residual identificado por el autor para investigar fallos multimodales.
- Base para construir controles experimentales: el control que escala el ancla por 1,667 permite contrastar la hipótesis de complementariedad frente a la de simple ganancia de fuerza de rechazo.
- Prototipado de filtros de seguridad en pipelines de inferencia multimodal, siempre con evaluación independiente previa antes de cualquier uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMStar, FigStep, MM-SafetyBench) en la información disponible. El autor indica explícitamente que no se ejecutaron VLGuard test, FigStep, MM-SafetyBench, MMStar ni otros benchmarks. Solo hay medidas de desarrollo sobre el conjunto de entrenamiento de VLGuard, con decodificación greedy, 20 tokens nuevos y detección de rechazo por palabras clave (ASR provisional):

| Split | Modelo | Gen ASR | Unsafes | Safe_unsafes | Over-refusal (gen) | TF harm refusal | TF benign refusal | ΔNLL |
|---|---|---|---|---|---|---|---|---|
| Selección M | Original | 42,5% | 70% | 15% | 0/24 | 53,1% | 0/128 | – |
| Selección M | Single (A) | 30,0% | 55% | 5% | 0/24 | 72,7% | 0/128 | −0,005 |
| Selección M | Este modelo | 12,5% | 25% | 0% | 0/24 | 87,5% | 2/128 | +0,009 |
| Confirmación K | Original | 42,5% | 60% | 25% | 0/24 | 51,6% | 0/128 | – |
| Confirmación K | Single (A) | 22,5% | 35% | 10% | 0/24 | 72,7% | 0/128 | +0,035 |
| Confirmación K | Este modelo | 10,0% | 15% | 5% | 1/24 | 87,5% | 0/128 | +0,016 |

Control de desarrollo (escalar el ancla por 1,667, no válido como Model B porque altera `W_best`): ASR M 12,5% (score 0,863 frente a 0,828) y K 10,0% (0,734 frente a 0,733). Cubre 19/19 de las ganancias en M y 18/19 en K.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 4,44 mil millones de parámetros, en bfloat16 los pesos ocupan aproximadamente 8,9 GB (tamaño del repo), más overhead de activaciones y caché KV.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un checkpoint de 4,4 B en bf16 encaja en GPUs con 16-24 GB de VRAM; el vision encoder y el contexto largo incrementan el consumo.
- Consumer GPU: no confirmado en la ficha; por tamaño, sería viable en GPUs de gama alta para consumo (por ejemplo, 24 GB), pero no hay datos publicados de latencia ni de ajuste exacto.
- Opciones de despliegue: transformers (documentado en el README con `Qwen3VLForConditionalGeneration` y `AutoProcessor`, `dtype=torch.bfloat16`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponible; no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `utsavz/wsp_nov11_qwen3vl4b_complementary` | 4,44 B | no disponible | ASR dev 10,0-12,5% (VLGuard train) | no disponible | Hugging Face, 0 descargas |
| `utsavz/wsp_nov11_qwen3vl4b_single` (Model A) | no disponible (derivado del mismo base) | no disponible | ASR dev 22,5-30,0% | no disponible | Hugging Face |
| `Qwen/Qwen3-VL-4B-Instruct` (base) | ~4 B (no confirmado en la información) | no disponible | ASR dev 42,5% | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks estándar para ninguno de los tres, por lo que la comparación se limita a las medidas de desarrollo del autor sobre VLGuard train. Alternativas de la misma categoría (modelos multimodales de ~4 B para safety) no están documentadas en la información proporcionada.

## Limitaciones y advertencias

- Complementariedad no demostrada: el control que escala el ancla por 1,667 iguala prácticamente el ASR (M 12,5% frente a 12,5%; K 10,0% frente a 10,0%) y cubre 19/19 y 18/19 de las ganancias, lo que sugiere que la mejora se explica por mayor fuerza de rechazo en una dirección compartida, no por cubrir tipos de fallo distintos.
- Sin evaluación independiente: no se han ejecutado VLGuard test, FigStep, MM-SafetyBench, MMStar ni otros benchmarks; todas las cifras son medidas de desarrollo sobre VLGuard train.
- Muestras pequeñas y detección de rechazo por palabras clave: el ASR es provisional y sensible al método de detección.
- Over-refusal: el modelo genera un rechazo indebido adicional en K (pregunta benigna sobre un meme satírico); en M registra 2/128 rechazos benignos en TF.
- Fallo residual principal: VLGuard `unsafes` (imagen dañina con texto inocuo) sigue siendo el punto débil no resuelto.
- Generalización no probada: el autor indica explícitamente que la generalización está sin testar.
- Licencia: no disponible; no se puede confirmar el uso comercial. El modelo base Qwen3-VL-4B-Instruct tiene su propia licencia, que debe consultarse por separado.
- Idiomas: no declarados; el comportamiento multilingüe no está verificado.
- Sesgos: no documentados en la información proporcionada.
- Riesgo de alucinación: no evaluado en la información proporcionada.
- Uso en producción: desaconsejado sin evaluación independiente y sin verificar la licencia; es un checkpoint de investigación con 0 descargas y 0 likes.

## Enlaces

- Hugging Face: https://huggingface.co/utsavz/wsp_nov11_qwen3vl4b_complementary
- Model A (single): https://huggingface.co/utsavz/wsp_nov11_qwen3vl4b_single
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
