# wyf-yfw/MiniSeek-D0.1-base

## Resumen

MiniSeek-D0.1-base es un modelo de lenguaje de tipo decoder-only denso, extremadamente compacto, con 28.451.328 parámetros (~28,45M) y tan solo 0,2 GB de pesos. Lo desarrolla el autor independiente wyf-yfw (Wang Yifan) y se publica como base preentrenada (no SFT, no chat) dentro de una hoja de ruta que el autor describe como alineada con los componentes de estilo DeepSeek-V4.1-Flash (Dense → MoE → SWA/CSA2/CED). Su propósito es servir de referencia reproducible y de bajo coste para estudiar el entrenamiento de modelos de lenguaje y como línea base densa antes de pasar a variantes MoE (línea MiniSeek-M).

El modelo no compite en capacidades con LLM de producción: es un ejercicio de ingeniería y docencia. Emplea un transformer denso de 8 capas, dimensión 512, 8 cabezas de atención, FFN de 2048, RMSNorm, RoPE con theta 1e6, activación tipo GELU y embedding atado con la cabeza LM. El vocabulario es de 6.400 tokens (tokenizador MiniMind) y la longitud de contexto de entrenamiento es de solo 512 tokens.

Es relevante ahora porque ofrece, bajo licencia MIT y con receta de entrenamiento completa (dataset, hiperparámetros, checkpoint, código), un punto de partida verificable para quien quiera reproducir el pipeline de preentrenamiento a escala doméstica (se entrenó en una única RTX 3090) y comparar después innovaciones arquitectónicas sobre la misma base de datos. No debe confundirse con un modelo conversacional: el chat vive en el repositorio hermano MiniSeek-D0.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense decoder-only Transformer (8 bloques: RMSNorm → atención causal con RoPE → RMSNorm → FFN densa) |
| Parametros totales | 28.451.328 (~28,45M; embedding atado con LM head) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP32 en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | chino (principal) e inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (FP32); entrenamiento en BF16 |

Hiperparámetros adicionales: `d_model`=512, `n_layers`=8, `n_heads`=8, `head_dim`=64, `intermediate_size`=2048 (=4d), `vocab_size`=6400, RoPE con theta=1e6, embedding atado. Tokens especiales: `pad/unk`=`<|endoftext|>` (id 0), `bos`=`<|im_start|>` (id 1), `eos`=`<|im_end|>` (id 2).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 8 capas con dimensión oculta 512 y 8 cabezas de atención de dimensión 64. Cada bloque aplica RMSNorm previo a una atención causal con RoPE (theta 1e6) y RMSNorm previo a una FFN densa de 2048 unidades con activación tipo GELU. El embedding de tokens (6400 × 512) está atado con la cabeza de lenguaje, lo que reduce el recuento de parámetros. No hay mezcla de expertos, atención lineal ni decodificación especulativa: es una arquitectura convencional, deliberadamente simple, pensada como línea base.

El preentrenamiento se realizó sobre el dataset `jingyaogong/minimind_dataset`, concretamente sobre `pretrain_t2t_mini.jsonl` (unas 1,27M de líneas), con validación fija en `valid.jsonl` (0,5% con semilla bloqueada) y objetivo de modelado de lenguaje causal. La composición es mayoritariamente china con presencia parcial de inglés; al continuar el entrenamiento se añade `<|im_end|>` (id 2) al final de cada muestra. La configuración declarada incluye AdamW, LR pico 1e-4 con decaimiento coseno hasta 3e-5 y warmup, autocast BF16 en CUDA, 158.035 pasos de entrenamiento y una pérdida de validación (best) de aproximadamente 0,77, sobre una única NVIDIA RTX 3090. Los pesos publicados provienen de `checkpoints/stage0/best.pt`. No se documenta RLHF, DPO ni SFT en este repositorio.

## Capacidades

- Generación de texto autoregresiva básica (continuación de prompt) en chino e inglés.
- Modelado de lenguaje causal / next-token prediction como tarea nativa de preentrenamiento.
- Capacidad limitada de continuar texto con coherencia local a corta distancia (contexto de 512 tokens).
- No incluye modo de razonamiento explícito (thinking), visión, audio ni multimodalidad.
- No soporta tool calling ni function calling de forma nativa.
- No está diseñado para razonamiento multi-paso ni comportamiento de agente.
- Multilingüismo restringido: chino como idioma principal y algo de inglés; el resto de idiomas no está cubierto de forma fiable.
- No es un modelo de chat: carece de plantilla conversacional entrenada, aunque define tokens especiales de inicio/fin (`<|im_start|>`, `<|im_end|>`).

## Casos de uso

- Estudio y docencia de preentrenamiento de LLM: sirve para reproducir de principio a fin un pipeline de entrenamiento (dataset, tokenizador, bucle de entrenamiento, evaluación) en una sola GPU de consumo, gracias a sus 28,45M de parámetros y a la receta publicada.
- Línea base para experimentos arquitectónicos: al mantener fijo el dataset y la configuración, permite medir el efecto de cambios estructurales (por ejemplo, sustituir la FFN densa por MoE o introducir atención lineal) comparando contra este checkpoint con la misma pérdida de validación (~0,77).
- Pruebas de infraestructura y tooling: útil para validar scripts de carga de safetensors, tokenización MiniMind, generación con temperatura/top-k y pipelines de evaluación (Valid PPL, Gen-Smoke, C-Eval, CMMLU) antes de escalar a modelos mayores.
- Demostración local en Web UI: el propio repositorio incluye una interfaz web de inferencia local; el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU para demos interactivas de continuación de texto.
- Generación de texto de relleno o sintético a pequeña escala: para prototipos de interfaz, pruebas de estrés de servidores de inferencia o generación de datos de baja calidad donde no se requiera corrección factual.
- Investigación sobre tokenizadores de vocabulario reducido: con `vocab_size`=6400 permite estudiar el equilibrio entre tamaño de vocabulario, cobertura lingüística y parámetros totales en modelos ultrapequeños.
- Comparación de curvas de escalado: como punto de partida de una serie (Dense → MoE) para estudiar cómo evoluciona la perplejidad y las métricas C-Eval/CMMLU al aumentar capacidad sobre el mismo corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara una pérdida de validación (best) de aproximadamente 0,77 y menciona el conjunto de evaluación Eval-Core (Valid PPL, Gen-Smoke con 20 prompts y semilla 42, C-Eval valid, CMMLU y métricas de eficiencia como VRAM y tokens/s), cuyos informes se publican en el directorio `eval/reports/` del repositorio de GitHub. Como referencia externa, la propia model card cita MiniMind-3 (~64M) con C-Eval≈24,9 y CMMLU≈25,4, pero no aporta cifras propias de MiniSeek-D0.1-base.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (28,45M parámetros × 4 bytes ≈ 114 MB de pesos, más activaciones y contexto de 512 tokens); en BF16/FP16 rondaría los 57 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; se entrenó en una NVIDIA RTX 3090, pero la inferencia cabe en GPUs mucho menores.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series 20/30/40 de gama baja), GTX con suficiente VRAM e incluso en CPU para uso interactivo.
- Opciones de despliegue: el modelo no soporta `AutoModelForCausalLM` de forma nativa; requiere la clase `DenseLM` del repositorio `wyf-yfw/miniseek` o cargar `model.safetensors` con `safetensors.torch.load_file` y el `ModelConfig`/tokenizador del repo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no hay pesos GGUF publicados).
- Latencia y throughput: no disponibles de forma oficial. La implementación de referencia recalcula todo el contexto en cada paso (sin KV cache), por lo que la generación es más lenta de lo que el tamaño del modelo sugeriría; con contexto de 512 tokens y 28M de parámetros, el coste por token es muy bajo en términos absolutos, pero no se publican cifras de tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| MiniSeek-D0.1-base | 28,45M | 512 | MIT | zh, en | Base preentrenada, sin SFT; receta y código abiertos |
| MiniMind-3 (referencia citada) | ~64M | no disponible | no disponible | zh, en (presumible) | C-Eval≈24,9 / CMMLU≈25,4 según la model card; usado como ancla de comparación |
| MiniSeek-D0.1 (repo hermano) | 28,45M (presumible, misma base) | 512 (presumible) | MIT | zh, en | Versión con post-entrenamiento (SFT/chat) del mismo autor |

No se dispone de datos de benchmarks propios que permitan una comparación cuantitativa directa con alternativas de la misma categoría; la comparación con MiniMind-3 se limita a las cifras citadas como referencia externa en la model card.

## Limitaciones y advertencias

- Capacidad muy reducida: con 28,45M de parámetros, los errores factuales, las repeticiones y las incoherencias son frecuentes; en preguntas de examen difíciles el comportamiento se aproxima al azar según el propio autor.
- Sin SFT ni RLHF: no es un modelo conversacional ni sigue instrucciones; no debe usarse como chatbot.
- Riesgo alto de alucinación: no dispone de conocimiento factual fiable ni de mecanismos de verificación.
- Contexto muy corto (512 tokens): no apto para documentos largos, conversaciones multi-turno extensas ni tareas que requieran memoria de contexto amplia.
- Cobertura idiomática limitada: chino como idioma principal e inglés parcial; otros idiomas no están soportados de forma fiable.
- Sin KV cache en la implementación de referencia: la generación recalcula el contexto completo en cada paso, lo que penaliza la latencia en producción.
- Puede agotar `max_new_tokens` si no encuentra el token de parada `<|im_end|>`.
- Integración limitada: no es compatible con `AutoModelForCausalLM`; requiere código propio del repositorio para cargar y ejecutar el modelo.
- Licencia MIT: permite uso comercial y modificación, pero al ser un modelo de investigación sin garantías, cualquier uso en producción exigiría un post-entrenamiento y una evaluación adicionales.
- Sesgos: al entrenarse sobre un corpus mayoritariamente chino de origen no documentado en detalle, pueden aparecer sesgos lingüísticos y culturales propios de esa distribución; no se han publicado análisis de sesgo.

## Enlaces

- Hugging Face: https://huggingface.co/wyf-yfw/MiniSeek-D0.1-base
- Versión chat/SFT: https://huggingface.co/wyf-yfw/MiniSeek-D0.1
- Repositorio de código y receta: https://github.com/wyf-yfw/miniseek
- Dataset de entrenamiento: https://huggingface.co/datasets/jingyaogong/minimind_dataset
- Proyecto MiniMind (tokenizador y receta de datos): https://github.com/jingyaogong/minimind
