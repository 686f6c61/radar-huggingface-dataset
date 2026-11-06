# tablinum/Moon-Beam-16B-A3B-MLX-4bit

## Resumen

Moon-Beam 16B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Tablinum, un estudio independiente. Se trata de un fine-tuning de Moonlight-16B-A3B-Instruct (Moonshot AI), que conserva la arquitectura DeepSeek-V3 con 16.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token. El objetivo del ajuste es que el modelo utilice correctamente el "engram" Tablinum-2, un mecanismo de recuperación aumentada: el modelo aprende a leer pasajes recuperados, responder a partir de ellos cuando contienen la respuesta y declarar que no sabe cuando no la contienen.

La versión aquí descrita es una cuantización MLX de 4 bits orientada a Apple Silicon, publicada el 2 de noviembre de 2026. Aplica una receta propietaria llamada "beam mix": los 64 expertos enrutados por capa (aproximadamente el 90% de los pesos) se cuantizan a 4 bits, mientras que la atención MLA, los expertos compartidos, la primera capa densa, los embeddings y el `lm_head` se mantienen a 8 bits, con normas y router en precisión completa. El resultado ocupa 9,77 GB (4,89 bits por peso de media), lo que permite ejecutarlo en un Mac con 16 GB de memoria unificada.

Su relevancia radica en la combinación de tres factores: una arquitectura MoE eficiente en cómputo (3B activos), un entrenamiento específico para reducir alucinaciones en flujos RAG y una cuantización calibrada que conserva el 97,0% de coincidencia en el token top-1 respecto al BF16 en dominios de chat. La licencia MIT facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE tipo DeepSeek-V3 (`deepseek_v3`), atención MLA, 64 expertos enrutados por capa |
| Parámetros totales | 15.960.110.208 (≈16B) |
| Parámetros activos | ≈3B por token (6 de 64 expertos enrutados) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | MLX affine "beam mix": 4 bits grupo 64 en expertos enrutados; 8 bits grupo 64 en atención, expertos compartidos, capa densa, embeddings y `lm_head`; media de 4,89 bits por peso |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, 2 shards), requiere `mlx-lm` |
| Tamaño en disco | 9,77 GB (9.766.708.856 bytes) |
| Librería | `mlx-lm` (0.32.2 para la conversión) |
| Modelo base | `tablinum/Moon-Beam-16B-A3B` (BF16), a su vez fine-tuning de `moonshotai/Moonlight-16B-A3B-Instruct` |
| Tokenizador | tiktoken (requiere `--trust-remote-code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Moonlight-16B-A3B-Instruct, basada en DeepSeek-V3: transformer con atención Multi-head Latent Attention (MLA) y capas MoE con 64 expertos enrutados más expertos compartidos, donde cada token activa 6 expertos. La primera capa es densa. Esta configuración permite un coste de inferencia cercano al de un modelo de 3B pese a almacenar 16B de pesos.

El entrenamiento específico de Tablinum consistió en un fine-tuning sobre el modelo instruct base para que este explote el engram Tablinum-2 (dataset `tablinum/tablinum-2`), un corpus de recuperación aumentada. El modelo aprende un comportamiento de citación estricta: usar un pasaje solo si responde a la pregunta exacta, descartar pasajes sobre elementos, versiones, años o reglas relacionadas pero distintas, y recurrir al conocimiento propio o declarar desconocimiento en caso contrario. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable de esta publicación es la cuantización "beam mix": el error de una conversión MLX 4-bit estándar proviene mayoritariamente de los tensores pequeños siempre activos (atención, expertos compartidos, embeddings), por lo que mantenerlos a 8 bits cuesta solo 0,8 GB adicionales y reduce el error (KLD) en aproximadamente cuatro quintas partes respecto a una conversión 4-bit plana. Los pesos de origen se verificaron bit a bit contra el BF16 público mediante SHA-256 de los 27 shards.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat.
- Respuesta aumentada por recuperación (RAG): lectura de pasajes recuperados, respuesta basada en evidencia y abstención explícita cuando la evidencia no cubre la pregunta.
- Discriminación fina entre pasajes relevantes y pasajes sobre elementos relacionados pero distintos (versiones, años, reglas, casos).
- Razonamiento y conocimiento general heredados de Moonlight-16B-A3B-Instruct.
- Capacidad multilingüe limitada: la model card declara únicamente inglés.
- Servido mediante endpoint compatible con OpenAI a través de `mlx_lm.server`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistente de documentación técnica con RAG: el modelo recibe pasajes recuperados de manuales y responde solo cuando estos contienen la respuesta, lo que reduce respuestas inventadas en consultas sobre procedimientos (por ejemplo, purgar un radiador de agua caliente).
- Atención al cliente sobre base de conocimiento: integrado en un pipeline de recuperación que inyecta fragmentos de FAQ y políticas, el modelo cita la política correcta y evita aplicar reglas de versiones anteriores del producto.
- Búsqueda interna empresarial en un Mac: con 9,77 GB y 3B activos, puede desplegarse en un Mac de 16 GB mediante `mlx_lm.server` para consultas sobre corpus internos sin infraestructura GPU dedicada.
- Verificación de respuestas con abstención: en flujos donde el coste de una respuesta errónea es alto (soporte legal, sanitario o de compliance), el comportamiento entrenado de "no lo sé" permite derivar a un humano cuando la evidencia recuperada no es concluyente.
- Prototipado local para desarrolladores en Apple Silicon: permite probar pipelines RAG completos en un portátil antes de escalar a un despliegue mayor, con el mismo comportamiento que la versión BF16 y GGUF.
- Generación de respuestas grounded en herramientas de análisis documental: dado un conjunto de extractos recuperados, el modelo produce respuestas trazables a los pasajes y descarta los irrelevantes, útil en resúmenes de expedientes o informes.
- Evaluación comparativa de cuantizaciones: el repositorio sirve como referencia para medir KLD y coincidencia top-1 frente al BF16 en despliegues MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí publica métricas de fidelidad de cuantización (KLD y coincidencia top-1 frente al BF16 del propio modelo), medidas sobre 16 ventanas de 2.048 tokens de un mix de chat retenido y de wikitext:

| Build | Tamaño | KLD chat | KLD wiki | Top-1 igual a BF16 (chat / wiki) |
|---|---:|---:|---:|---:|
| GGUF IQ3_XXS | 8,06 GB | 0,027 | 0,061 | 95,0% / 88,2% |
| GGUF IQ4_XS | 9,67 GB | 0,006 | 0,015 | 97,5% / 94,1% |
| MLX 4-bit plano, grupo 64 | 8,99 GB | 0,047 | 0,096 | 92,9% / 84,8% |
| MLX receta `mixed_4_6` | 9,65 GB | 0,037 | 0,078 | 93,9% / 86,0% |
| MLX 4-bit plano, grupo 32 | 9,98 GB | 0,035 | 0,074 | 93,7% / 86,5% |
| **MLX beam mix, grupo 64 (este repo)** | **9,77 GB** | **0,0098** | **0,0235** | **97,0% / 92,5%** |
| MLX beam mix, expertos grupo 32 | 10,67 GB | 0,0080 | 0,0193 | 96,8% / 93,2% |

No se han publicado velocidades de inferencia en Apple Silicon; la model card indica que, con 3B activos, se esperan velocidades similares a otros MoE de 3B activos en MLX a 4-5 bits.

## Requisitos de hardware

- VRAM/memoria unificada: 9,77 GB de pesos; se recomienda un Mac con al menos 16 GB de memoria unificada (el autor indica que cabe en un Mac de 16 GB).
- GPU: orientado exclusivamente a Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra). No es ejecutable en GPU NVIDIA o AMD mediante MLX.
- GPU de consumo: cabe en Macs de 16 GB; en equipos con menos memoria no es viable.
- Despliegue: `mlx-lm` 0.32.2 o superior, con `mlx_lm.chat`, `mlx_lm.generate` y `mlx_lm.server` (endpoint compatible con OpenAI). Requiere `--trust-remote-code` por el tokenizador tiktoken y el paquete `tiktoken`.
- Latencia y throughput: no disponibles; no se han publicado mediciones en Apple Silicon.
- Alternativa para otros entornos: existen pesos BF16 y GGUF del mismo modelo base para llama.cpp y otros runners.

## Comparativa con modelos similares

| Modelo | Parámetros (total / activos) | Contexto | Cuantización de esta ficha | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Moon-Beam 16B-A3B (MLX 4-bit beam mix)** | 16B / ≈3B | no disponible | 4,89 bits medios, 9,77 GB | MIT | Hugging Face, MLX |
| Moonlight-16B-A3B-Instruct | 16B / ≈3B | no disponible | BF16 (no cuantizado en esta comparativa) | MIT | Hugging Face |
| Moon-Beam 16B-A3B GGUF IQ4_XS | 16B / ≈3B | no disponible | 4 bits, 9,67 GB | MIT | Hugging Face, llama.cpp |
| Moon-Beam 16B-A3B BF16 | 16B / ≈3B | no disponible | 16 bits | MIT | Hugging Face |

Frente al modelo base Moonlight, Moon-Beam añade el entrenamiento para el engram Tablinum-2 y el comportamiento de abstención; frente a las cuantizaciones GGUF, la versión MLX beam mix ofrece un KLD en chat de 0,0098 (mejor que IQ4_XS, 0,006, en wiki 0,0235 frente a 0,015) con un tamaño similar, pero solo es ejecutable en Apple Silicon. No se dispone de datos de benchmarks de tarea que permitan comparar la calidad absoluta con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente `en`; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: aunque el entrenamiento busca la abstención ante evidencia insuficiente, el modelo sigue siendo un LLM generativo y puede producir respuestas incorrectas, especialmente fuera del formato de pasajes `v1` para el que fue ajustado.
- Dependencia del formato de prompt: el comportamiento de engram requiere inyectar los pasajes con la instrucción `v1` exacta; otros formatos pueden degradar la fidelidad a la evidencia.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al derivar de Moonlight, hereda los sesgos de sus datos de entrenamiento.
- Contexto: la longitud de contexto no se especifica en la información disponible; conviene verificar la configuración del modelo base antes de usarlo con ventanas largas.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribución y revisar las condiciones del modelo base Moonlight (también MIT).
- Plataforma: esta cuantización solo funciona con MLX en Apple Silicon; para otros entornos hay que usar los pesos BF16 o GGUF.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el modelo se publicó en noviembre de 2026; es un artefacto reciente sin validación externa amplia.
- El código de conversión y el tokenizador requieren `trust_remote_code`, lo que implica ejecutar código del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Moon-Beam-16B-A3B-MLX-4bit
- Pesos BF16: https://huggingface.co/tablinum/Moon-Beam-16B-A3B
- Versión GGUF: https://huggingface.co/tablinum/Moon-Beam-16B-A3B-GGUF
- Dataset Tablinum-2 engram: https://huggingface.co/datasets/tablinum/tablinum-2
- Colección Moon-Beam: https://huggingface.co/collections/tablinum/moon-beam-6ae64ea51cef0d52d1461fc2
- Modelo base Moonlight-16B-A3B-Instruct: https://huggingface.co/moonshotai/Moonlight-16B-A3B-Instruct
- Repositorio MLX: https://github.com/ml-explore/mlx
