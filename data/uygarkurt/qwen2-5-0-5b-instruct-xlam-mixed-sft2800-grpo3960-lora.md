# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-grpo3960-lora

## Resumen

Este repositorio contiene un adaptador LoRA para Qwen2.5-0.5B-Instruct, el modelo de lenguaje decoder-only de 0,49 mil millones de parámetros publicado por Alibaba Qwen. Lo desarrolla el usuario uygarkurt dentro de su proyecto Post-Training Lab y su objetivo es muy concreto: enseñar a un modelo pequeño a emitir llamadas a herramientas en formato estructurado y, sobre todo, a abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.

El entrenamiento es en dos fases sobre el dataset uygarkurt/xlam-tool-calling-mixed: primero 2.800 actualizaciones de supervised fine-tuning y después 3.960 actualizaciones de GRPO (Group Relative Policy Optimization) partiendo del adaptador SFT. El resultado es un adaptador que se carga sobre el modelo base original (no requiere el adaptador SFT por separado) y que mejora la precisión de llamada exacta en xLAM del 73,72 % al 77,35 % y la precisión de nombre de función del 95,89 % al 96,33 %, a costa de un descenso en la tasa de abstención correcta ante herramientas irrelevantes (del 58,83 % al 55,79 %).

Su relevancia práctica es la de un banco de pruebas reproducible de post-entrenamiento con RL sobre modelos de menos de 1B, no la de un modelo listo para producción: el propio modelo base obtiene un 39,60 % en MMLU y un 16,80 % en MATH-500, lo que lo sitúa como una pieza de enrutado o de experimentación, no como un asistente generalista. El adaptador no declara licencia propia y solo tiene inglés como idioma documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA PEFT; no es MoE ni SSM |
| Parámetros totales | 0,49B en el modelo base Qwen2.5-0.5B-Instruct; tamaño del adaptador no disponible (repositorio < 0,05 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens según la configuración del modelo base; no revalidado por el autor para este adaptador |
| Tipos de cuantización | No especificados por el autor; el adaptador se publica en precisión original y admite fusión con el base y conversión posterior a GGUF/AWQ/GPTQ (procedimiento estándar, no verificado en esta ficha) |
| Idiomas soportados | Inglés (`en`) declarado; el modelo base Qwen2.5 cubre oficialmente 29 idiomas |
| Licencia | No disponible para el adaptador; el modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | `safetensors` con configuración PEFT/LoRA (`library_name: peft`) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-0.5B-Instruct, un transformer causal con normalización RMSNorm, activación SwiGLU, embeddings RoPE y atención con grouped-query attention (14 cabezas de atención y 2 cabezas KV en el modelo de 0,5B). El adaptador en sí es un LoRA de bajo rango entrenado con la librería PEFT y `transformers`; no modifica la arquitectura, solo añade matrices de baja dimensión en las proyecciones del modelo base. El pipeline declarado es `text-generation` con tags de `tool-calling`, `sft`, `grpo` y `conversational`.

El entrenamiento se ejecutó en dos etapas encadenadas sobre el dataset mixto de tool calling del autor: 2.800 actualizaciones de SFT (0,4 horas) seguidas de 3.960 actualizaciones de GRPO sobre ese mismo adaptador SFT (2,2 horas), con un total de 2,6 horas de bucle de entrenamiento, excluyendo carga de modelo, preparación de datos y evaluación externa. GRPO es una variante de optimización por política con recompensas relativas dentro de un grupo de muestras, sin modelo crítico separado. La innovación destacable no es arquitectónica sino metodológica: el autor publica el adaptador intermedio y el final con las mismas métricas, lo que permite aislar el efecto de GRPO frente a SFT sobre el mismo dataset. No se documentan composición exacta del dataset, número de tokens vistos ni detalles de las funciones de recompensa.

## Capacidades

- Generación de texto conversacional multi-turno en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: emisión de llamadas con nombre de función y argumentos en formato JSON, evaluado con las métricas xLAM ETC (exact tool-call accuracy) y xLAM FNA (function-name accuracy).
- Abstención ante herramientas irrelevantes: el adaptador está entrenado explícitamente para no forzar una llamada cuando ninguna de las funciones ofrecidas encaja con la consulta (subconjuntos Relevance/Irrelevance de BFCL-v3).
- Seguimiento de instrucciones básico, medido con IFEval a nivel de prompt (31,79 % de precisión estricta).
- Razonamiento aritmético y matemático limitado: 16,80 % en MATH-500 y 39,60 % en MMLU.
- Capacidad multilingüe heredada del base, pero el entrenamiento del adaptador es solo en inglés, por lo que el comportamiento de tool calling en otros idiomas no está evaluado.
- No soporta visión, audio, ni modo "thinking" explícito; tampoco se documentan capacidades de agente multi-paso más allá de la llamada única.

## Casos de uso

- Enrutado de herramientas en asistentes ligeros: el adaptador decide si la consulta requiere una función y cuál, con 77,35 % de precisión de llamada exacta en el holdout xLAM, lo que basta para un primer nivel de enrutado antes de escalar a un modelo mayor.
- Detección de consultas sin herramienta disponible: la métrica de irrelevancia (55,79 %) permite usar el modelo como filtro barato que evita llamadas espurias a APIs cuando el catálogo de funciones no cubre la petición, siempre con una capa de validación posterior.
- Extracción de argumentos JSON para APIs internas: al ejecutarse en CPU o en GPUs de gama baja, se puede desplegar junto al servicio que consume la API para transformar lenguaje natural en parámetros estructurados con latencia muy baja.
- Etiquetado y filtrado masivo de datasets de tool calling: el modelo puede anotar pares consulta/herramienta a gran escala para construir o limpiar corpus de entrenamiento de modelos mayores, a un coste por ejemplo muy inferior al de un 7B.
- Investigación en post-entrenamiento: la pareja de adaptadores SFT y SFT+GRPO permite reproducir y analizar el efecto de GRPO sobre un modelo de 0,5B con métricas públicas, útil para ablations académicas o para validar recetas antes de escalarlas.
- Despliegue en el borde: con unos 0,3-0,4 GB en cuantización de 4 bits, cabe en dispositivos con poca memoria (Raspberry Pi 5, mini-PC, navegador vía WebGPU con llama.cpp) para asistentes de voz o domótica que solo necesitan invocar funciones predefinidas.
- Router de cascada en producción: actuar como clasificador previo que derive consultas simples al modelo pequeño y consultas complejas a un modelo grande, reduciendo el coste medio por petición.

## Benchmarks y rendimiento

Datos publicados en la model card. La primera fila es el adaptador SFT que inicializó GRPO; la segunda, el adaptador final de este repositorio. Todos los valores son porcentajes.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 2.800 | 39,80 | 18,40 | 29,57 | 73,72 | 95,89 | 51,76 | 83,33 | 58,83 | 0,4 |
| SFT + GRPO (este adaptador) | GRPO 3.960 | 39,60 | 16,80 | 31,79 | 77,35 | 96,33 | 56,40 | 83,33 | 55,79 | 2,6 |

Notas metodológicas del autor: xLAM ETC es precisión exacta de llamada y xLAM FNA es precisión de nombre de función; ambas se calculan sobre un holdout de solo llamadas con 2.287 ejemplos evaluados y 700 descartados, no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: unos 1 GB en fp16/BF16 para los pesos del base fusionado; aproximadamente 0,3-0,4 GB en cuantización de 4 bits. El adaptador LoRA añade solo decenas de MB.
- Caché KV: para la ventana completa de 32.768 tokens se estiman del orden de 400 MB en fp16 (cálculo propio a partir de 24 capas y 2 cabezas KV con dimensión 64; el autor no publica esta cifra), por lo que conviene limitar `max_model_len` en despliegues con poca memoria.
- GPU recomendadas: cualquier GPU consumer sirve; RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 o superiores ejecutan el modelo con holgura y permiten varios lotes concurrentes. En A100/H100 el cuello de botella es el ancho de banda, no la capacidad.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas de los últimos ocho años, y también en CPU (x86/ARM) con cuantización.
- Opciones de despliegue: `transformers` + PEFT (carga directa del adaptador), fusión con `merge_and_unload` y conversión a GGUF para llama.cpp/Ollama, vLLM con soporte de adaptadores LoRA, y TGI. Para CPU, llama.cpp es la vía más eficiente.
- Latencia y throughput: no disponibles; el autor solo publica tiempos de entrenamiento (2,6 horas totales), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling específico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-0.5B) | 0,49B + LoRA | 32.768 (heredado) | Sí, SFT + GRPO con abstención | No disponible | Hugging Face, 0 descargas al publicar |
| Qwen2.5-0.5B-Instruct (base) | 0,49B | 32.768 | Genérico, sin entrenamiento dedicado | Apache 2.0 | Ampliamente disponible |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Genérico, mejor seguimiento de instrucciones | Apache 2.0 | Ampliamente disponible |
| Hammer2.1-0.5B | 0,49B | 32.768 | Sí, fine-tune especializado en function calling | Apache 2.0 | Hugging Face (MadeAgents) |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 | Parcial, soporta tool calling en el chat template | Llama 3.2 Community License | Hugging Face (Meta) |

No se dispone de puntuaciones BFCL o xLAM de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad; no se puede afirmar superioridad o inferioridad en tool calling frente a Hammer2.1 sin datos.

## Limitaciones y advertencias

- Capacidad general muy limitada: 39,60 % en MMLU, 16,80 % en MATH-500 y 31,79 % en IFEval. No es apto como asistente generalista ni para razonamiento complejo.
- El propio autor reporta un empeoramiento de la abstención tras GRPO: la métrica de irrelevancia baja del 58,83 % al 55,79 %, es decir, el adaptador final alucina llamadas ante herramientas no pertinentes en aproximadamente 44 de cada 100 casos.
- Riesgo de alucinación de nombres de función y de argumentos fuera del esquema; la precisión de nombre de función (96,33 %) no garantiza que los argumentos sean válidos. Se recomienda validación estricta con JSON Schema antes de ejecutar cualquier llamada.
- Entrenamiento exclusivamente en inglés: el dataset es `xlam-tool-calling-mixed` con idioma declarado `en`; el rendimiento en castellano u otros idiomas no está evaluado y probablemente degrade el formato de llamada.
- Licencia del adaptador no disponible: no se puede confirmar el uso comercial. El modelo base es Apache 2.0, pero eso no cubre automáticamente los pesos del adaptador derivados de un dataset propio del autor.
- Modelo sin validación externa: 0 descargas y 0 likes en el momento de la ficha, sin revisión independiente de los resultados.
- Las métricas xLAM provienen de un holdout de solo llamadas con scripts propios del autor y 700 ejemplos descartados; los agregados de BFCL son selecciones de subconjuntos, no la puntuación oficial completa, por lo que no son directamente comparables con informes públicos de terceros.
- El adaptador requiere cargar el modelo base Qwen2.5-0.5B-Instruct; no es un checkpoint autónomo y no debe usarse sin él.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-grpo3960-lora
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Adaptador SFT intermedio: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
