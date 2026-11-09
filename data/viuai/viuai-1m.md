# ViuAI/ViuAI-1M

## Resumen

ViuAI-1M-NextGen es un modelo de lenguaje de tipo transformer con arquitectura Mixture-of-Experts (MoE) desarrollado por ViuAI y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como un ejercicio de investigación "from scratch" que replica innovaciones arquitectónicas de modelos frontera como DeepSeek-V4 y Kimi K2, incluyendo Multi-Head Latent Attention (MLA), expertos enrutados de grano fino y residuales con Hyper-Connections. Su tamaño es deliberadamente reducido: 1.579.456 parámetros totales, de los cuales 989.632 están activos por token.

El modelo resuelve un problema de experimentación y didáctica más que de producción: permite estudiar y validar en hardware muy modesto combinaciones arquitectónicas propias de modelos de cientos de miles de millones de parámetros. Incorpora además el optimizador Muon con ortogonalización de Newton-Schulz de quinto orden, predicción multi-token (MTP) y weight tying estricto entre embeddings de entrada y salida.

Por su escala (4 capas, dimensión oculta 128, vocabulario de 4.096 tokens y contexto de 512 tokens), no es un modelo competitivo para tareas reales de generación, sino una pieza de investigación reproducible. Es relevante ahora porque permite a desarrolladores e investigadores inspeccionar el comportamiento de MLA y DeepSeekMoE sin necesidad de clústeres Multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Multi-Head Latent Attention (MLA) y residuales mHC |
| Parametros totales | 1.579.456 (~1,58 M) |
| Parametros activos | 989.632 (~0,98 M) por token (1 experto compartido + Top-2 enrutados) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería pytorch; no se documenta safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer de 4 capas con dimensión oculta de 128. Cada bloque combina atención MLA con compresión latente de Query (rango LoRA 48) y de KV conjunta (rango LoRA 32), lo que según la model card reduce el KV-cache entre un 80 % y un 90 %. La capa MoE sigue el esquema DeepSeekMoE: 1 experto compartido siempre activo y 8 expertos enrutados de los que se seleccionan los Top-2 por token, con dimensión FFN de 64 por experto y activación SwiGLU. Los residuales usan Manifold-Constrained Hyper-Connections (mHC), con escalares aprendibles que modulan la transmisión de información entre capas.

El entrenamiento emplea Muon (con iteraciones de Newton-Schulz de quinto orden sobre matrices 2D) combinado con AdamW, y la model card afirma una convergencia entre 1,5 y 2 veces más rápida que AdamW solo. Se declara soporte de Multi-Token Prediction (MTP) y weight tying estricto entre embeddings de entrada y salida, con un vocabulario BPE personalizado de 4.096 tokens. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés mediante `ViuAIForCausalLM`.
- Razonamiento básico y modelado de lenguaje a escala de juguete (vocabulario de 4.096 tokens, 4 capas).
- Soporte de predicción multi-token (MTP) como mecanismo auxiliar declarado en la arquitectura.
- Atención con compresión latente (MLA) que reduce el coste de memoria del KV-cache.
- Enrutamiento MoE dinámico con experto compartido y Top-2 enrutados por token.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según el campo `language` de la model card.

## Casos de uso

- Investigación de arquitecturas MoE: reproducir y modificar el enrutamiento Top-2 con experto compartido para estudiar el equilibrio de carga y el colapso de expertos en un modelo que cabe en CPU.
- Estudio de MLA: medir empíricamente la reducción de KV-cache (declarada del 80-90 %) y comparar la calidad de atención con MHA y GQA en un entorno controlado.
- Validación del optimizador Muon: entrenar desde cero y comparar curvas de convergencia frente a AdamW en un modelo de menos de 2 M de parámetros.
- Docencia y prototipado: usar el modelo como ejemplo didáctico de implementación de DeepSeekMoE con Hyper-Connections en PyTorch, sin necesidad de GPU dedicada.
- Pruebas de infraestructura de inferencia: banco de pruebas para pipelines de tokenización BPE personalizada, weight tying y forward passes con MTP.
- Experimentos de ablación: modificar el número de expertos, el Top-K o los rangos LoRA de MLA y evaluar el impacto en pérdida y throughput con recursos mínimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara la entrada `ViuAI-1M-NextGen` con una lista de resultados vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en fp32 para los pesos (~6,3 MB), holgadamente por debajo de 1 GB incluso con overhead del runtime.
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM; también ejecutable en CPU sin problemas.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) e incluso en dispositivos embebidos.
- Opciones de despliegue: al ser un modelo `from-scratch` con código propio (`viuai.model`), no se documenta soporte para vLLM, llama.cpp, Ollama o TGI; la vía indicada es PyTorch nativo con el paquete del autor.
- Latencia y throughput: no disponibles; por el tamaño, se espera un throughput muy alto y latencia de milisegundos en cualquier hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ViuAI-1M-NextGen | 1,58 M totales / 0,98 M activos | 512 | Apache 2.0 | Hugging Face (PyTorch) |
| TinyLlama-1.1B | 1,1 B densos | 2.048 | Apache 2.0 | Hugging Face, GGUF, vLLM, Ollama |
| SmolLM-135M | 135 M densos | 2.048 | Apache 2.0 | Hugging Face, GGUF, transformers |
| Qwen2.5-0.5B | 0,49 B densos | 32.768 | Apache 2.0 | Hugging Face, GGUF, vLLM |

La comparación es asimétrica: ViuAI-1M-NextGen es entre dos y tres órdenes de magnitud menor que los modelos pequeños de referencia y no está pensado para competir en calidad de generación, sino como banco de pruebas arquitectónico. No se dispone de benchmarks que permitan comparar rendimiento.

## Limitaciones y advertencias

- Escala de juguete: 1,58 M de parámetros y vocabulario de 4.096 tokens implican una capacidad lingüística muy limitada; no es apto para producción.
- Contexto de 512 tokens, muy corto para la mayoría de aplicaciones reales.
- Solo inglés declarado; sin soporte multilingüe verificado.
- Riesgo elevado de alucinación y de generar texto incoherente por el tamaño reducido y la ausencia de benchmarks publicados.
- No se documentan datos de entrenamiento, composición del corpus ni procesos de alineación (RLHF/DPO), por lo que no se pueden evaluar sesgos de forma rigurosa.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación empírica desaconseja cualquier despliegue en producción.
- Dependencia de código propio (`viuai.model`) no integrado en ecosistemas estándar como transformers, lo que dificulta su uso fuera del repositorio del autor.
- Descargas y likes a cero en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ViuAI/ViuAI-1M
- Perfil del autor en Hugging Face: https://huggingface.co/ViuAI
- Paper de DeepSeek-V3 (referencia de MLA y DeepSeekMoE): https://arxiv.org/abs/2412.19437
- Paper de DeepSeekMoE: https://arxiv.org/abs/2401.06066
- Paper de Multi-Head Latent Attention (DeepSeek-V2): https://arxiv.org/abs/2405.04434
- Paper del optimizador Muon: https://arxiv.org/abs/2502.16982
- Paper de Hyper-Connections: https://arxiv.org/abs/2409.19606
