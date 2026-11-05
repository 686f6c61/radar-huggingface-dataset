# VectaBass/vectabass-618m-26.5bt-base-cooled

## Resumen

vectabass-618m-26.5bt-base-cooled es un modelo de lenguaje base de 617,9 millones de parámetros totales (527,7 millones no pertenecientes a embeddings) desarrollado por VectaBass, entrenado sobre 26.460 millones de tokens. Se trata de la celda N4-D5 de una matriz de escalado (AR square) de la fase 1 del proyecto, que abarca una escalera de modelos de 100M a 1.600M de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicado conjuntamente para poder verificar empíricamente la ley de escalado.

El modelo emplea una arquitectura tipo Llama con atención exclusiva auto-regresiva (XSA, exclusive self-attention), una variante que Llama no incorpora, y requiere cargar código remoto (`modeling_vectabass.py`) para su ejecución. Su contexto es de 2.048 tokens y su vocabulario usa BPE de GPT-2 con 50.304 filas. Forma parte de una iniciativa de IA soberana del Reino Unido, con especial atención a fuentes parlamentarias y lenguas celtas.

Es relevante ahora porque se publica como parte de un conjunto reproducible de modelos con recetas documentadas, réplicas de semilla en ramas `seed2` para medir ruido entre ejecuciones y métricas de pérdida de validación verificables. No obstante, es un modelo base sin ajuste de instrucciones ni de seguridad, pensado para investigación sobre leyes de escalado, no para uso como asistente en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama con atención causal GQA 2:1 y exclusive self-attention (XSA) |
| Parametros totales | 617.908.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (entrenado y publicado en bf16; el autor recomienda ejecutarlo en bf16) |
| Idiomas soportados | Inglés (mayoritario), galés (cy), gaélico escocés (gd), irlandés (ga), manés (gv), córnico (kw), escocés (sco) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code` para cargar `modeling_vectabass.py`) |

## Arquitectura y entrenamiento

La red es un transformer decoder-only de 15 capas con anchura 1.792, 28 cabezas de consulta y 14 de clave-valor (GQA 2:1) de dimensión 64, feed-forward SwiGLU de 4.752 unidades, normalización RMSNorm pre-norm y posiciones RoPE con base 10.000. La innovación arquitectónica destacable es la atención exclusiva auto-regresiva (XSA), que modifica el mecanismo de atención causal estándar. Los embeddings están atados y el vocabulario es BPE de GPT-2 (50.257 tokens) más 26 tokens especiales, hasta 50.304 filas.

El entrenamiento consumió 26.464.944.128 tokens (50 por parámetro no-embedding), con lotes de 458.752 tokens. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) con AdamW en fp32 (0.9, 0.95); el LR pico fue 0,00148, con calentamiento de 437M tokens, fase constante y un cooldown 1-sqrt hasta cero en el último 20%. El weight decay fue 0,0575 sobre matrices. Se entrenó en bf16 con pesos maestros fp32, estadísticas de normalización, ángulos RoPE y logits en fp32, sobre 2 GPUs NVIDIA GH200 de 120 GB. Los datos provienen de fineweb-edu, fineweb-2 y finemath, organizados en 47 bins de texto con licencia abierta (~96B tokens únicos) e incluyen fuentes del sector público y parlamentario del Reino Unido y lenguas celtas.

## Capacidades

- Generación de texto autoregresiva en inglés y lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico, escocés).
- Modelado de lenguaje base: continuación de texto, puntuación y coherencia local dentro de una ventana de 2.048 tokens.
- Razonamiento matemático incipiente gracias a la inclusión de finemath en el corpus, aunque sin evaluación publicada.
- No dispone de tool calling ni function calling (modelo base sin ajuste).
- No soporta agentes ni razonamiento multi-paso de forma fiable sin ajuste posterior.
- No tiene modo thinking, visión ni audio.
- Multilingüismo limitado: inglés dominante y lenguas celtas en proporciones menores.

## Casos de uso

- Investigación sobre leyes de escalado: usar esta celda junto con el resto de la escalera (100M–1.6B) y sus réplicas `seed2` para medir la relación pérdida-tokens-parámetros y el ruido entre ejecuciones.
- Reproducción de experimentos: cargar el checkpoint con `revision="seed2"` para replicar el entrenamiento con nueva inicialización y orden de datos, verificando la estabilidad de la receta.
- Punto de partida para fine-tuning: al ser un base model Apache 2.0 de 618M, sirve como inicialización para tareas downstream (clasificación, extracción, resumen) tras ajuste supervisado.
- Evaluación comparativa de arquitecturas: estudiar el efecto de XSA frente a atención causal estándar en modelos de este tamano mediante ablaciones controladas.
- Procesamiento de texto en lenguas celtas: continuación y modelado de corpus en galés, gaélico o irlandés para herramientas de normalización o análisis lingüístico, dado el sesgo del corpus hacia fuentes de estas lenguas.
- Docencia y divulgación: ejemplo compacto y reproducible de un pipeline completo de entrenamiento (Muon + AdamW, cooldown 1-sqrt) que cabe en dos GH200 y se documenta con provenance.json.
- Generación de texto de dominio público: continuación de texto parlamentario o administrativo británico para tareas de aumentación de datos, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot en la información disponible. El único dato de evaluación es la pérdida de validación sobre el canon retenido phase-1-release canon-8192 (8.192 secuencias de 2.048 tokens): **2,0352 nats por token**, reproducible bit a bit bajo PyTorch SDPA (el entrenamiento usó FlashAttention-4).

| Metrica | Valor |
|---|---|
| Pérdida de validación (canon-8192) | 2,0352 nats/token |
| MMLU | No medido |
| HumanEval | No medido |
| GSM8K | No medido |

## Requisitos de hardware

- VRAM estimada en bf16: ~1,24 GB para pesos (617,9M × 2 bytes), más activaciones y caché KV; en la práctica, menos de 4 GB con batch pequeño.
- VRAM estimada en fp32: ~2,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con batch moderado; A100, H100 o GH200 para entrenamiento o fine-tuning.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `modeling_vectabass.py`); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; el autor solo indica ejecutar en bf16 como se entrenó.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-618m-26.5bt-base-cooled | 617,9M (527,7M no-embedding) | 2.048 | Apache 2.0 | Base, XSA, sin benchmarks zero-shot |
| Pythia-410m / 1b | 410M / 1B | 2.048 | Apache 2.0 | Suite de escalado comparable; benchmarks publicados |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Entrenado con 3T tokens; base e instruct |
| SmolLM-360M / 1.7B | 360M / 1,7B | 2.048 | Apache 2.0 | Suite de escalado reciente con benchmarks |

La comparación con Pythia, TinyLlama y SmolLM se ofrece como referencia de categoría (modelos base de menos de 2B parámetros para estudios de escalado); no se dispone de métricas comparativas directas de este checkpoint frente a ellos.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni de seguridad: no debe usarse como asistente y producirá afirmaciones falsas con fluidez.
- Contexto muy corto (2.048 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Predominio del inglés; las lenguas celtas aparecen en proporciones menores y su calidad no está evaluada.
- Sin filtrado de salidas ni mitigación de sesgos; los sesgos del corpus (fuentes públicas y parlamentarias británicas) se reflejarán en las generaciones.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar `modeling_vectabass.py` antes de usarlo en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de ajuste desaconseja su despliegue en producción sin evaluación previa.
- No hay soporte documentado en runtimes de inferencia optimizados (vLLM, llama.cpp), lo que limita el throughput en producción.
- Riesgo de alucinación elevado por tratarse de un modelo de 618M entrenado para un estudio de escalado.

## Enlaces

- HuggingFace: https://huggingface.co/VectaBass/vectabass-618m-26.5bt-base-cooled
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Referencia Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Paper del modelo: pendiente de publicación (el autor indica citar el repositorio hasta entonces)
