# ziliangpeng/Qwen3-4B-SmolTalk2-SFT

## Resumen

Qwen3-4B-SmolTalk2-SFT es un ajuste fino supervisado (SFT) de parámetros completos construido por el usuario ziliangpeng a partir de Qwen/Qwen3-4B-Base, el modelo base de 4.022.468.096 parámetros de la familia Qwen3. El objetivo declarado no es competir con los modelos instruct oficiales, sino publicar una receta reproducible y completamente documentada de conversión de un modelo base en un modelo de chat: mezcla exacta de datos, hiperparámetros, evaluación honesta y dos modos de fallo poco obvios encontrados durante el proceso.

El entrenamiento usa los subconjuntos "no-think" (sin razonamiento explícito) del dataset HuggingFaceTB/smoltalk2: 1.347.981 muestras y aproximadamente 1.800 millones de tokens durante 2 épocas, con pérdida calculada solo sobre los turnos del asistente. El resultado es un modelo conversacional que responde directamente, sin bloques `<think>`, y que hereda el estilo de prosa de Llama-3.1-405B-Instruct, profesor dominante de la mezcla de datos (~47% de las muestras).

Es relevante por tres motivos concretos: documenta un fallo conocido pero rara vez tratado (292 embeddings de tokens especiales sin entrenar en Qwen3-4B-Base, con similitud coseno 1.0 entre ellos), detalla la configuración exacta de máscara de pérdida en TRL, y publica una evaluación comparativa con juez automático que incluye las métricas en las que queda por debajo del 4B oficial. La licencia es Apache-2.0 y el repositorio ocupa 8,1 GB en safetensors bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), heredada de Qwen3-4B-Base; SFT de parámetros completos |
| Parámetros totales | 4.022.468.096 (dato real de safetensors) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (heredado); el SFT se entrenó con longitud máxima de secuencia de 2.048 tokens |
| Tipos de cuantización | no disponible en el repositorio: solo se publican pesos safetensors en bf16 (8,1 GB). Convertible a GGUF/AWQ/GPTQ con herramientas estándar, pero el autor no publica variantes cuantizadas |
| Idiomas soportados | no disponible en la model card; la mezcla incluye un subset multilingüe de 8 idiomas (254K muestras) sin especificar cuáles. El tokenizer hereda la cobertura de Qwen3 |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), con `chat_template.jinja` y `generation_config.json` incluidos |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B-Base sin modificaciones estructurales: transformer decoder-only con atención agrupada (GQA) y tokenizer Qwen3. El ajuste es SFT de parámetros completos en bf16 con el `SFTTrainer` de TRL: 2 épocas, AdamW con learning rate 1e-5, scheduler coseno y 3% de warmup, batch global de 256 muestras (~171K tokens por paso) durante 10.532 pasos, longitud máxima de secuencia 2.048 y aproximadamente 1.800 millones de tokens vistos en total. El entrenamiento corrió en un nodo único con 8×H100 de 80 GB en DDP durante unas 16,5 horas.

La mezcla de datos son 11 subconjuntos no-think de SmolTalk2: smol-magpie-ultra (369K, generado por Llama-3.1-405B-Instruct con el pipeline Magpie), OpenHermes-2.5 (385K), multilingual-8-languages (254K), smol-summarize (96K), Mixture-of-Thoughts science (86K, trazas de razonamiento eliminadas), smol-rewrite (53K), systemchats-30k (34K), explore-instruct-rewriting (30K), Tulu-3 personas (30K), table-gpt (13K) y everyday-conversations (2,3K). Se excluyeron todos los subsets de modo think, las trazas de function calling y las muestras de más de 2.048 tokens.

Las innovaciones prácticas documentadas por el autor son de receta, no de arquitectura. Primero, la reparación de embeddings de tokens especiales: Qwen3-4B-Base trae 292 tokens especiales con embeddings sin entrenar e idénticos entre sí (similitud coseno 1.0), y el SFT por sí solo no los corrige; reinicializar esas filas antes del entrenamiento es lo que permite que el modelo aprenda a terminar turnos (probabilidad media del siguiente token `<|im_end|>` en fin de turno: 0,92 sobre muestras retenidas). Segundo, el uso de `assistant_only_loss` con marcadores `{% generation %}` en la plantilla, porque el formato plano con `completion_only_loss` entrena silenciosamente sobre la secuencia completa. Tercero, el andamiaje `think`/`/think` vacío inyectado por la plantilla para que el modelo no genere bloques de razonamiento, siguiendo la convención no-think de Qwen3.

## Capacidades

- Generación de texto conversacional multi-turno con respuestas directas, sin modo de razonamiento ni bloques `<think>`.
- Instrucciones y follow-up: el subset Tulu-3 personas (30K muestras) aporta seguimiento de instrucciones y adopción de roles.
- Resumen de documentos y reescritura de texto (subsets smol-summarize, 96K, y smol-rewrite, 53K).
- Conversación guiada por mensaje de sistema (systemchats-30k, 34K muestras): el modelo respeta prompts de sistema en la plantilla incluida.
- Trabajo con tablas: subset table-gpt (13K) orientado a tareas sobre datos tabulares.
- Cobertura multilingüe parcial: 254K muestras del subset de 8 idiomas, además de la herencia del tokenizer Qwen3.
- Conocimiento científico y de razonamiento de tipo traza corta: Mixture-of-Thoughts science (86K) con las trazas de razonamiento eliminadas, por lo que el conocimiento queda pero la cadena explícita no.
- Estilo de prosa consistente, derivado del profesor Llama-3.1-405B-Instruct en ~47% de las muestras.
- No soporta tool calling ni function calling: esas trazas se excluyeron explícitamente del entrenamiento.
- No soporta visión, audio ni modo thinking.

## Casos de uso

- Chat de atención al cliente en español y otros idiomas: el modelo mantiene conversaciones multi-turno con mensajes de sistema y respuestas directas, sin generar bloques de razonamiento que alarguen la respuesta. Adecuado para volúmenes altos porque un 4B en bf16 ocupa ~8 GB y se sirve con vLLM en una sola GPU.
- Resumen automático de documentos e hilos de correo: el subset smol-summarize (96K muestras) entrena específicamente la compresión de texto; útil en pipelines por lotes donde el coste por token importa más que la calidad puntera.
- Reescritura y adaptación de tono de contenidos: smol-rewrite (53K) más explore-instruct-rewriting (30K) permiten tareas de reformulación con instrucciones de estilo; encaja en herramientas editoriales internas.
- Asistente conversacional con personalidad definida vía system prompt: las 30K muestras de Tulu-3 personas y las 34K de systemchats permiten fijar rol y restricciones desde el mensaje de sistema usando la plantilla incluida.
- Extracción y consulta sobre datos tabulares en texto: las 13K muestras de table-gpt habilitan tareas de lectura de tablas en formato Markdown/CSV dentro de un flujo de análisis.
- Base para experimentos de alineación e investigación reproducible: al ser una receta completa base→chat con hiperparámetros, mezcla y evaluación publicados, sirve como punto de partida para estudiar el efecto de la mezcla de datos o de la reparación de embeddings especiales.
- Clasificación y etiquetado vía generación en entornos con presupuesto de GPU ajustado: al caber en una RTX 4090 o incluso en GPUs de 16 GB con cuantización, es viable para tareas de etiquetado a escala moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MT-Bench) en la información disponible. La única evaluación es una rúbrica con juez automático GLM-5.3 servido en local, tres dimensiones en escala 0-3, 990 prompts × 3 semillas, temperatura 0,7.

Puntuaciones absolutas (mayor es mejor, escala 0-3):

| Modelo | Coherencia | Utilidad | Seguimiento de instrucciones |
|---|---|---|---|
| Qwen3-4B-SmolTalk2-SFT (este) | 2,807 | 2,625 | 2,686 |
| Qwen3-4B (oficial) | 2,693 | 2,448 | 2,561 |
| Qwen3-8B (oficial) | 2,720 | 2,499 | 2,573 |

Comparaciones por pares con orden intercambiado (victoria decisiva = ganar en ambos órdenes):

| Enfrentamiento | Pares decisivos | Tasa de victoria |
|---|---|---|
| Este modelo vs Qwen3-4B (oficial) | 1.780 | 45,3% (oficial 54,7%) |
| Este modelo vs Qwen3-1.7B (oficial) | 1.761 | 70,2% |
| Qwen3-4B (oficial) vs Qwen3-1.7B (oficial) | no disponible | 78,2% (referencia) |

Lectura del autor: el modelo supera a los tres modelos oficiales (incluido el 8B) en puntuación absoluta de rúbrica, pero pierde el cara a cara contra el 4B oficial. La model card está truncada en ese punto, por lo que la conclusión final del autor no está disponible. Nota: la afirmación textual de que el modelo alcanza "~90% de la ventaja pairwise del 4B oficial sobre el 1.7B oficial" no se reconcilia con los márgenes implícitos en la tabla (40,4 puntos frente a 56,4 puntos, ~72%); conviene tratar esa cifra con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir de los 4.022 millones de parámetros): ~8,0 GB en bf16/fp16 solo para pesos; ~4,1 GB en fp8/int8; ~2,4-2,6 GB en GGUF Q4_K_M (estimación, no publicada por el autor).
- Caché KV reducida por GQA: del orden de ~70 KiB por token en fp16 (estimación a partir de la configuración del modelo base), es decir, ~2,3 GB a 32K tokens de contexto.
- Cabe en GPU de consumo: sí. RTX 4090 (24 GB) en bf16 con contexto largo sin problema; RTX 4080/4070 Ti Super (16 GB) en bf16 con contexto moderado o en fp8; RTX 4060 Ti (8 GB) solo con cuantización de 4 bits.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB. El entrenamiento se hizo con 8×H100 80 GB, pero para inferencia sobra una sola GPU.
- Despliegue: el autor confirma funcionamiento directo con vLLM (servidor compatible con la API de OpenAI) y con `transformers`; el tag `text-generation-inference` sugiere compatibilidad con TGI. Para llama.cpp/Ollama haría falta convertir los pesos a GGUF, ya que el repositorio solo trae safetensors bf16.
- Consideración de plantilla: cualquier servidor debe usar el `chat_template.jinja` incluido, que inyecta el andamiaje `think`/`/think` vacío; con otra plantilla el comportamiento puede degradarse.
- Configuración de generación recomendada: `temperature 0.7`, `top_p 0.8`, `top_k 20`, con `eos_token_id = [151645, 151643]` (`<|im_end|>`, `<|endoftext|>`) ya preconfigurados en `generation_config.json`.
- Latencia y throughput: no disponible (no se publican mediciones de inferencia; las 16,5 h corresponden al entrenamiento en 8×H100, no a serving).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Coherencia / utilidad / instrucciones (juez GLM-5.3) | Victoria vs 4B oficial |
|---|---|---|---|---|---|
| Qwen3-4B-SmolTalk2-SFT (este) | 4,02B | 32.768 (entrenado a 2.048) | Apache-2.0 | 2,807 / 2,625 / 2,686 | 45,3% |
| Qwen3-4B (oficial) | 4B (nominal) | 32.768 | Apache-2.0 | 2,693 / 2,448 / 2,561 | — |
| Qwen3-8B (oficial) | 8B (nominal) | 32.768 | Apache-2.0 | 2,720 / 2,499 / 2,573 | no evaluado |
| Qwen3-1.7B (oficial) | 1,7B (nominal) | 32.768 | Apache-2.0 | no disponible | 70,2% (este modelo gana) |

Diferencias cualitativas: el 4B oficial conserva el modo thinking y el soporte de tool calling, que este ajuste ha eliminado deliberadamente; el 8B oficial solo supera a este modelo en coherencia según la rúbrica, y pierde en utilidad e instrucciones; el 1.7B oficial es la alternativa si el presupuesto de VRAM es muy inferior. Este modelo no tiene, por ahora, validación de la comunidad (0 descargas, 0 likes en el momento de la ficha).

## Limitaciones y advertencias

- Pierde el cara a cara contra Qwen3-4B oficial: 45,3% de victorias decisivas frente a 54,7% del oficial, sobre 1.780 pares. No es, por tanto, un reemplazo directo del instruct oficial si la calidad conversacional es el criterio principal.
- Sin datos de benchmarks estándar: no hay MMLU, HumanEval ni GSM8K, solo una rúbrica con juez GLM-5.3 autoservido, lo que limita la comparación con el resto del ecosistema.
- Sin tool calling ni function calling: las trazas de herramientas se excluyeron del entrenamiento, así que no es apto para agentes ni pipelines que dependan de llamadas a funciones.
- Sin modo thinking: el andamiaje `think`/`/think` se inserta vacío; el modelo no genera cadenas de razonamiento y puede rendir peor en tareas de matemáticas o lógica multi-paso.
- Ventana efectiva degradada: aunque hereda 32.768 tokens del base, el SFT se hizo con secuencias de 2.048 tokens, por lo que el comportamiento más allá de ese límite no está validado.
- Estilo desplazado: el profesor dominante es Llama-3.1-405B-Instruct (~47% de las muestras), así que la voz del modelo es "llama-flavored" y no coincide con el estilo de los instruct oficiales de Qwen3. Es cloning de comportamiento, con los sesgos de sus profesores arrastrados.
- Sesgos de los datos: mezcla de OpenHermes-2.5, Magpie y pipelines de HF sin auditoría de sesgo publicada; el autor no documenta filtrado de contenido ni evaluación de seguridad.
- Solo SFT, sin RLHF ni DPO: no hay fase de alineación por preferencias, por lo que la resistencia a instrucciones dañinas o a la persuasión depende exclusivamente de los datos de imitación.
- Riesgo de alucinación: inherente a un 4B entrenado por imitación; el autor no publica tasas de factualidad ni evaluación de hallucination.
- Validez de la evaluación cuestionable en dos puntos: el juez es un modelo servido en local sin verificación humana, y la afirmación del ~90% de ventaja pairwise no cuadra con los márgenes de la tabla. La model card, además, está truncada al final.
- Idiomas no declarados formalmente: la única indicación es un subset multilingüe de 8 idiomas sin listar; el rendimiento fuera de inglés y de esos 8 idiomas es desconocido.
- Licencia Apache-2.0: permite uso comercial y derivados, pero el usuario debe verificar las licencias de los datos de SmolTalk2 y de los profesores implicados (Llama-3.1-405B-Instruct tiene su propia política de uso) antes de desplegar en producción.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la ficha; no hay informes independientes de calidad ni de estabilidad en producción.
- Los 292 embeddings de tokens especiales fueron reinicializados: si se reutiliza el modelo con toolkits que dependen de esos tokens (herramientas, plantillas alternativas), el comportamiento no está garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziliangpeng/Qwen3-4B-SmolTalk2-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Librería TRL (SFTTrainer): https://github.com/huggingface/trl
- Otros enlaces relevantes: no disponibles (la búsqueda web no devolvió resultados relacionados con el modelo; los resultados obtenidos eran foros y directorios sin relación).
