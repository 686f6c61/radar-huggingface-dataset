# YFC-112358/Qwen3.8-27B-TM-Gemma4-Glimmer-v2

## Resumen

El modelo `YFC-112358/Qwen3.8-27B-TM-Gemma4-Glimmer-v2` es un experimento de fusión de pesos entre tres arquitecturas heterogéneas desarrollado por el usuario YFC-112358 y publicado en Hugging Face en septiembre de 2026. Su objetivo es responder a una pregunta de investigación concreta: ¿es posible fusionar los pesos de dos modelos de 30B parámetros (Google Gemma-4-31B y Muse-Glimmer-30B) dentro de un modelo target de 27B (Qwen3.8-27B) mediante transporte óptimo, sin ningún entrenamiento adicional? El resultado es un modelo denso de 27.781.427.952 parámetros que combina las proyecciones de atención de Gemma y las capas FFN de Glimmer sobre el esqueleto de Qwen3.8-27B.

La relevancia de este trabajo radica en que explora los límites de la fusión cross-arquitectura: el método Transport and Merge (arXiv 2602.05495) fue diseñado originalmente para fusionar un source en un target de tamaño similar, pero aquí se aplica en dirección inversa (target más pequeño que los sources), con anchuras distintas (5120 vs 5376 y 6656), capas diferentes (64 vs 60 y 52) y mecanismos de atención distintos (atención híbrida Gated DeltaNet en Qwen vs atención estándar). El autor declara explícitamente que el modelo **no ha sido evaluado** y que su propósito es reproducible: comprobar si la fusión es viable y cuantificar la calidad de las correspondencias entre módulos.

La arquitectura resultante hereda del target Qwen3.8-27B el bloque de atención híbrida (16 capas con atención completa y 48 con atención lineal recurrente), la torre de visión, el tokenizador y la cabeza de predicción multi-token (MTP). Solo se inyectan pesos de Gemma y Glimmer en las proyecciones de atención (k_proj, o_proj) y en las capas MLP (gate, up, down). La licencia es Apache 2.0, lo que permite uso comercial, pero el modelo se publica como experimento de investigación sin garantías de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (Qwen3.8-27B: 16 capas con atencion completa y 48 con Gated DeltaNet), 64 capas, ancho 5120 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.8-27B, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (solo safetensors en precision nativa) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado sino fusionado mediante el algoritmo Transport and Merge (T&M) descrito en arXiv 2602.05495. El procedimiento, aplicado a pares de capas (target l, source m) para cada subcapa lineal, consiste en: (1) extraer activaciones de 2000 documentos de calibracion con pooling medio por documento; (2) construir una matriz de coste basada en la correlacion de Pearson entre canales; (3) resolver un problema de transporte optimo con entropia regularizada (Sinkhorn, 200 iteraciones) con un parametro eps adaptativo por par de capas; (4) combinar los planes de transporte hacia adelante y hacia atras mediante la media geometrica `P_eff = sqrt(P_pre * P_post)`; (5) fusionar los pesos con la formula `W_fused = (1-a)*W_A + a * sum_m P_eff[l,m] * Q_out W_B Q_in^T`, con a=0.1; y (6) aplicar una mascara top-128 que solo modifica los 128 canales de salida con mayor magnitud de activacion en el target.

El autor detalla una innovacion clave respecto a la implementacion original: el parametro eps de Sinkhorn se adapta por par de capas usando `eps = gap / ln(m/delta)` en lugar del valor fijo de 0.1 del paper, porque con tensores grandes (n=17408) un eps fijo produce que la masa no-diagonal iguale a la diagonal, degradando el plan de transporte. Tambien se excluyo la fusion de `self_attn.q_proj` porque en Qwen3.8-27B esta proyeccion esta organizada en 48 sub-bloques de 256 canales intercalados (mitad query, mitad gate), lo que impide un unico plan OT coherente. La tabla de diagnostico (autocalibracion target×target) muestra que la pipeline produce planes de transporte correctos para los cinco modulos fusionados, con desviaciones de 1.4x a 4.6x sobre el objetivo de diseno, atribuibles a redundancia de canales en las capas MLP.

Los componentes no fusionados (embeddings, capas de normalizacion, todas las capas Gated DeltaNet, la torre visual y la cabeza MTP) se copian byte a byte del target Qwen/Qwen3.8-27B. No se aplico ningun entrenamiento posterior, ni RLHF, ni DPO.

## Capacidades

- El modelo hereda las capacidades del base Qwen3.8-27B, que incluyen generacion de texto, razonamiento, comprension de imagenes (pipeline image-text-to-text) y soporte multilingue, aunque no se han realizado evaluaciones especificas sobre el modelo fusionado.
- No se ha verificado si las capacidades de tool calling, function calling o modo agente del base se preservan tras la fusion; el autor no proporciona datos al respecto.
- La inyeccion de pesos de Gemma en las proyecciones de atencion (k_proj, o_proj) y de Glimmer en las capas FFN podria alterar el comportamiento de atencion y de transformacion de caracteristicas, pero no hay mediciones publicas.
- No se ha evaluado el rendimiento en tareas de vision, aunque la torre visual se conserva intacta.
- No se ha verificado la calidad de la generacion multilingue ni la coherencia del contexto largo.

## Casos de uso

- Investigacion en fusion de modelos: este modelo sirve como caso de estudio para analizar si el transporte optimo puede transferir conocimiento entre arquitecturas heterogeneas (diferentes anchuras, capas, mecanismos de atencion y funciones de activacion).
- Validacion de metodos de merging: los diagnosticos publicados (z-score, DMR, sharpness) permiten comparar la calidad de las correspondencias entre pares de capas y evaluar si la adaptacion de eps resuelve el fallo del metodo original con tensores grandes.
- Analisis de transferencia de caracteristicas: al fusionar solo proyecciones de atencion de Gemma y solo FFN de Glimmer, el modelo permite estudiar que modulo contribuye mas a cada capacidad del target.
- Reproducibilidad de experimentos: el autor detalla todos los hiperparametros (a=0.1, top-128, eps adaptativo, 200 iteraciones Sinkhorn) y sugiere un control obligatorio (SHRINK_ONLY) para distinguir el efecto de la inyeccion del mero escalado de pesos.
- Exploracion de limites de escalado: el experimento invierte la direccion tipica del T&M (target 1B con source 7B-32B) usando un target 27B con sources 30B, lo que aporta datos sobre la robustez del metodo en regimenes de mayor escala.
- Desarrollo de herramientas de merging: el codigo del autor puede servir como referencia para implementar fusiones cross-arquitectura en otros pares de modelos, especialmente con la adaptacion de eps que se documenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que el modelo no ha sido evaluado ("【未评测】") y que el repositorio existe para responder de forma reproducible a la pregunta de si estos tres modelos pueden fusionarse. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra prueba estandarizada.

## Requisitos de hardware

- El repositorio ocupa 55.6 GB en safetensors, lo que corresponde a pesos en FP16 (aproximadamente 27.8B parametros × 2 bytes).
- Para inferencia en FP16 se necesitan al menos 56 GB de VRAM, lo que requiere multiples GPU (por ejemplo, 2× A100 40GB o 2× RTX 4090 24GB con offloading).
- Con cuantizacion 8-bit (no proporcionada por el autor, pero posible con herramientas como bitsandbytes o GPTQ) la VRAM estimada seria de unos 28 GB, permitiendo una sola RTX 4090 o A100 40GB.
- Con cuantizacion 4-bit (GGUF o AWQ) la VRAM estimada bajaria a unos 14-16 GB, haciendolo ejecutable en GPUs de consumo como RTX 3080/4080 o Apple Silicon con 32 GB unificados.
- No se han publicado opciones de despliegue especificas (vLLM, TGI, llama.cpp, etc.), pero al ser un modelo transformers compatible, deberia funcionar con cualquier framework que soporte Qwen3.8-27B.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No especificado (largo, tipico de Qwen3) | Hibrida Gated DeltaNet + atencion completa | Apache 2.0 | Modelo oficial evaluado |
| Gemma-4-31B | 31B | No especificado | Transformer denso con GeGLU | No especificado | Modelo oficial evaluado |
| Muse-Glimmer-30B | 30B | No especificado | Transformer denso con SwiGLU | No especificado | Modelo oficial evaluado |
| Qwen3.8-27B-TM-Gemma4-Glimmer-v2 | 27.8B | No especificado | Hibrida con pesos de Gemma y Glimmer | Apache 2.0 | Merge experimental sin evaluar |

La comparacion directa de rendimiento no es posible porque el modelo fusionado carece de benchmarks. Su interes reside en el procedimiento de fusion, no en superar a los modelos base.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en ninguna tarea; no se puede afirmar que preserve las capacidades del base Qwen3.8-27B ni que la fusion aporte mejoras.
- El autor advierte que el metodo T&M original solo contempla un source, y que el uso de dos sources es una extrapolacion que evita conflictos separando por tipo de modulo (atencion de Gemma, FFN de Glimmer). Esta separacion no garantiza la ausencia de interferencias.
- La direccion de la fusion es inversa a la del paper (target mas pequeno que sources) y cruza fabricantes, anchuras, vocabularios y mecanismos de atencion, lo que amplifica el riesgo de degradacion.
- Gemma usa GeGLU mientras que Qwen y Glimmer usan SwiGLU; el autor excluyo deliberadamente la fusion de FFN desde Gemma, pero las proyecciones de atencion de Gemma podrian comportarse de forma inesperada con las capas Gated DeltaNet del target.
- La tabla de autocalibracion muestra que la fusion de `mlp.gate_proj` tiene una desviacion de 4.6x sobre el objetivo, lo que sugiere redundancia de canales en esa capa y posible perdida de informacion.
- No se ha aplicado ningun control experimental (el autor sugiere repetir con SHRINK_ONLY como comparacion), por lo que no se sabe si el efecto de la inyeccion difiere del simple escalado de pesos.
- Al ser un modelo experimental sin evaluacion, no es recomendable su uso en produccion sin una validacion exhaustiva previa.
- Riesgo de alucinacion y sesgos: al derivar de Qwen3.8-27B, hereda los sesgos de su entrenamiento, pero no hay datos especificos sobre como la fusion puede alterarlos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece ninguna garantia de calidad ni soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/YFC-112358/Qwen3.8-27B-TM-Gemma4-Glimmer-v2
- Paper de Transport and Merge (arXiv 2602.05495): https://arxiv.org/abs/2602.05495
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base Gemma-4-31B: https://huggingface.co/google/gemma-4-31B
- Modelo base Muse-Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Documentacion de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
