# utsavz/wsp_nov11_qwen3vl2b_complementary

## Resumen

`utsavz/wsp_nov11_qwen3vl2b_complementary` es un checkpoint de investigación derivado de `Qwen/Qwen3-VL-2B-Instruct` (revisión `89644892e4d85e24eaac8bacfd4f463576704203`), un modelo vision-language de 2.127.532.032 parámetros en BF16. El autor (utsavz) aplica una técnica denominada "Complementary Weight-Space Programming" (WSP) para modificar el comportamiento de seguridad del modelo sin reentrenamiento: no se usan gradientes, retropropagación, fine-tuning ni pasos de optimizador, sino ediciones en forma cerrada sobre pesos concretos.

El objetivo es reducir la tasa de respuestas dañinas (ASR) ante entradas maliciosas multimodales (texto e imagen) manteniendo el comportamiento benigno intacto. La intervención reescribe una neurona MLP de la capa 15 como detector de daño con umbral, añade una escritura rank-1 en la atención de la capa 18 y una neurona MLP con compuerta en la capa 10 especializada en daño vehiculado por imagen.

Es relevante ahora porque demuestra que la edición de pesos en forma cerrada puede alterar el comportamiento de seguridad de un VLM sin degradar la calidad en entradas benignas, un enfoque con coste computacional muy inferior al alineamiento por RLHF o DPO. El checkpoint es explícitamente un estado de investigación: no hay evaluación independiente en conjuntos held-out (VLGuard test, FigStep, MM-SafetyBench, MMStar no fueron usados ni inspeccionados).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL), pesos editados en capas MLP y atención del language model |
| Parametros totales | 2.127.532.032 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible (checkpoint en BF16; el repo no documenta cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (fichero único `model.safetensors`, embeddings atados, dtype BF16) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-2B-Instruct, un transformer vision-language con embeddings atados. El checkpoint conserva exactamente el layout original: tokenizer, processor, chat template, config y generation config sin cambios; solo difieren 7 tensores del language model. No hubo entrenamiento: todas las ediciones son en forma cerrada, construidas a partir de diferencias de activaciones medias, percentiles y gaps medidos sobre ítems de entrenamiento de VLGuard y prompts diagnósticos propios.

El procedimiento tiene cuatro pasos. Primero se construyen cinco candidatos independientes `W_i = W0 + Δ_i`. Segundo, se selecciona el mejor candidato individual sobre un split de selección con una puntuación preregistrada (seguridad, sobre-rechazo, verosimilitud de respuestas benignas, salidas degeneradas), que actúa como ancla `W_best = W0 + Δ_best`. Tercero, se añaden complementos solo donde corrigen fallos del ancla sin dañar comportamiento benigno: `W = W_best + Σ λ_i Δ_i_comp`, preservando los tensores del ancla bit a bit. Cuarto, se verifica el control de fuerza: una versión más fuerte del ancla sola (κ=3) no reproduce la ganancia, lo que indica que la mejora no es solo magnitud de edición.

El ancla reescribe la neurona MLP 1050 de la capa 15 (originalmente la menos usada) como detector con umbral: `gate_proj[1050] = β(w − τ q/q̄)`, `up_proj[1050] = q/q̄`, `down_proj[:,1050] = (κ·gap/(β m)) r₁₅`, con τ = 12,34 (percentil 99 de puntuaciones benignas), m = 2,71, β = 2,95, κ = 2 y gap₁₅ = 60,5. Los complementos son `cand_02` (escritura rank-1 key→refusal en la atención de la capa 18: `Δ o_proj = 0,25 · gap₁₈ · r₁₈ kᵀ`, con gap₁₈ = 206,7, λ = 1) y `cand_05_comp` (neurona MLP 2465 de la capa 10, detector de daño vehiculado por imagen con dirección de texto proyectada fuera; τ = 4,24, m = 1,03, β = 7,75, κ = 2, λ = 1).

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`), heredadas del modelo base Qwen3-VL-2B-Instruct.
- Razonamiento multimodal sobre imágenes y texto, con rechazo reforzado de peticiones dañinas.
- Detección de daño textual: rechaza todas las peticiones dañinas solo-texto escritas por el autor.
- Detección de daño vehiculado por imagen: la neurona `cand_05_comp` responde a la dirección de imagen insegura con las direcciones de daño textual y de entrada solo-texto proyectadas fuera.
- Control de sobre-rechazo: 0/24 rechazos en ítems benignos del split de confirmación.
- Rechazo de peticiones benignas parecidas a dañinas ("how do I kill a Python process"): 1/32, igual que el ancla sola.
- Compatibilidad con endpoints (`endpoints_compatible`) y con la librería `transformers`.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni thinking mode.

## Casos de uso

- Moderación de contenido multimodal en producción: el modelo puede integrarse como filtro previo o posterior para detectar imágenes y textos dañinos, usando la neurona de la capa 10 para daño vehiculado por imagen y el ancla de la capa 15 para daño textual.
- Investigación en edición de pesos para seguridad: sirve como referencia reproducible de WSP en forma cerrada, con los 7 tensores modificados documentados y las magnitudes de cambio (Frobenius relativo entre 0,010 y 0,140) para replicar o comparar técnicas.
- Evaluación de robustez de alineamiento en VLMs: permite estudiar cómo un cambio de rango 1 en la atención de la capa 18 reduce el ASR de imagen insegura del 50% al 20% en el split de confirmación.
- Despliegue de asistentes visuales con rechazo controlado: para aplicaciones donde se necesita describir imágenes benignas y rechazar instrucciones dañinas, con la salvedad de que el modelo no rechaza imágenes dañinas bajo instrucción neutra.
- Estudio de interferencia entre ediciones: el caso documentado (la suma ingenua de un candidato elevó los rechazos benignos parecidos de 1 a 26 de 32) es un ejemplo práctico de por qué las ediciones deben redirigirse ortogonalmente al detector del ancla.
- Base para ablaciones controladas: el checkpoint incluye el control de fuerza (κ=3) que no reproduce la ganancia, útil para distinguir mejora estructural de simple aumento de magnitud de edición.
- Prototipado de pipelines de seguridad en `transformers` con pesos BF16 y layout original, sin necesidad de adaptar tokenizer ni processor.

## Benchmarks y rendimiento

Resultados de desarrollo sobre el conjunto de entrenamiento de VLGuard (solo split de confirmación, 64 ítems por subconjunto; generación greedy, 20 tokens nuevos; ASR provisional basado en palabras clave). No son resultados held-out.

| Modelo | ASR (dañino, 40 ítems) | ASR imagen insegura | ASR instrucción insegura | Sobre-rechazo (24 benignos) | Rechazo TF en 128 dañinos | ΔNLL benigno de referencia |
|---|---|---|---|---|---|---|
| Original | 37,5% | 50% | 25% | 0/24 | 0,58 | — |
| Mejor edición individual (solo ancla) | 20,0% | 35% | 5% | 0/24 | 0,71 | +0,002 |
| **Este modelo** | **10,0%** | **20%** | **0%** | **0/24** | **0,84** | +0,010 |
| Control de ancla más fuerte (κ=3) | 20,0% | 35% | 5% | 0/24 | 0,73 | −0,003 |

No se han publicado resultados en VLGuard test, FigStep, MM-SafetyBench ni MMStar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y del procesador de visión; en la práctica se recomienda al menos 6-8 GB de VRAM para inferencia cómoda.
- Cuantización: el repo no documenta versiones GGUF ni cuantizadas; habría que generarlas a partir del checkpoint BF16.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) debería poder cargar el modelo en BF16; A100 y H100 son sobredimensionadas para 2,1B parámetros.
- Cabe en GPU consumer: sí, en BF16 en GPUs de 8 GB o más; en cuantizaciones de 4-8 bits cabría en GPUs de 4-6 GB, aunque no están publicadas.
- Opciones de despliegue: `transformers` (librería declarada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (WSP complementario) | 2.127.532.032 | No disponible | Edición de pesos en forma cerrada sobre Qwen3-VL-2B-Instruct | No disponible | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3-VL-2B-Instruct (base) | 2.127.532.032 | No disponible | Alineamiento original del modelo base | No disponible | Hugging Face |
| Mejor edición individual (solo ancla, mismo autor) | 2.127.532.032 | No disponible | Ancla gated harm-detector en capa 15 | No disponible | Referenciado en la model card, no como repo independiente |
| Control de ancla más fuerte (κ=3) | 2.127.532.032 | No disponible | Misma técnica con mayor magnitud de escritura | No disponible | Referenciado en la model card |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: no se ha realizado evaluación independiente en held-out; todos los números provienen de splits de desarrollo del conjunto de entrenamiento de VLGuard.
- Muestras de desarrollo pequeñas: un ítem generado equivale a 2,5-4 puntos porcentuales; la detección de rechazo es por palabras clave; la generación se limita a 20 tokens; la resolución de imagen durante el desarrollo se limita a ≤ 256×32×32 píxeles.
- No corregido: imágenes dañinas bajo instrucción neutra. El modelo sigue describiendo imágenes dañinas cuando solo se pregunta "What is shown in this image?" (0/32 rechazos en un conjunto diagnóstico).
- Distribuciones de entrada no probadas: las neuronas con compuerta dependen de un término de normalización casi constante calibrado sobre entradas de una sola imagen más texto; el comportamiento con múltiples imágenes, vídeo, contextos largos u otros idiomas no se ha probado.
- Riesgo de sobre-rechazo en dominios no cubiertos: aunque el split de confirmación muestra 0/24 rechazos benignos, la calibración se hizo sobre VLGuard train y prompts propios.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que consultar la licencia del modelo base Qwen3-VL-2B-Instruct antes de desplegar.
- Idiomas no disponibles: no se documenta el soporte multilingüe del checkpoint editado.
- Riesgo de alucinación: no evaluado en la información proporcionada.
- Sesgos conocidos: no documentados en la model card.
- El checkpoint conserva el layout original y solo difieren 7 tensores, pero la edición rank-1 en `o_proj` de la capa 18 toca 3.406.654 entradas BF16 (rango numérico 1526 tras redondeo), lo que complica la auditoría bit a bit de esa edición concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/utsavz/wsp_nov11_qwen3vl2b_complementary
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Revisión del modelo base citada: `89644892e4d85e24eaac8bacfd4f463576704203`
- SHA256 del `model.safetensors` original: `7de1838c87a5349b016c26a1c3f7d2bc400a3d485f95ef39a7059ffd734977a0`
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
