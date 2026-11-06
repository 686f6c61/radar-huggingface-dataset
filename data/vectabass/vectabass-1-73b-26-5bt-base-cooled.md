# VectaBass/vectabass-1.73b-26.5bt-base-cooled

## Resumen

vectabass-1.73b-26.5bt-base-cooled es un modelo de lenguaje base de 1.729 millones de parámetros (1.600 millones sin contar embeddings) desarrollado por VectaBass, un proyecto orientado a la investigación en leyes de escala y a la soberanía de IA en el Reino Unido. Se trata de una de las celdas de la "Phase 1 AR square", una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para que la ley de escala pueda verificarse empíricamente. Este modelo concreto corresponde a la celda N6-D5, con 26.465 millones de tokens de entrenamiento (17 tokens por parámetro no-embedding).

Arquitectónicamente es un transformer decoder-only de tipo Llama, con 22 capas, anchura 2560, GQA 2:1 y una innovación destacable: atención exclusiva auto-atencional (XSA, exclusive self-attention), que Llama no incorpora y que requiere cargar `modeling_vectabass.py` mediante `trust_remote_code=True`. El contexto es de 2048 tokens y el vocabulario es GPT-2 BPE ampliado a 50304 filas.

Es relevante ahora porque forma parte de un conjunto de modelos publicados con licencia Apache 2.0 y reproducibilidad declarada (contrato de ejecución, hash del checkpoint, réplicas de semilla en ramas `seed2` y `seed3`), lo que lo convierte en material útil para estudios de escalado y para experimentación con modelos base de tamano medio en lenguas celtas y del Reino Unido. No es un modelo instructivo ni ajustado en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con atención exclusiva auto-atencional (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE base 10000 |
| Parametros totales | 1.729.282.560 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (inglés, galés, gaélico escocés, irlandés, manés, córnico, escocés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 10,4 GB), con código de modelado propio (`modeling_vectabass.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 22 capas, anchura 2560, 40 cabezas de consulta y 20 de clave-valor de dimensión 64, feed-forward SwiGLU de 6912 y normalización RMSNorm pre-norm. La atención es causal con GQA 2:1 y añade XSA (exclusive self-attention), una variante que no existe en Llama y que obliga a usar el código remoto del repositorio. Las posiciones se codifican con RoPE de base 10000 y el vocabulario es GPT-2 BPE (50257 tokens) más 26 tokens especiales, con relleno hasta 50304 filas.

El entrenamiento consumió 26.465.009.664 tokens (17 por parámetro no-embedding) con un batch de 524.288 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW fp32 (0.9, 0.95), LR pico de 0.00106, warmup de 1003M tokens, fase constante y cooldown 1-sqrt hasta cero en el último 20%. Se usó precisión bf16 en pesos y activaciones, con pesos maestros fp32 en el optimizador y estadísticas de norma, ángulos RoPE y logits en fp32. El hardware fueron 4 x NVIDIA GH200 de 120 GB. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B tokens únicos, con fuentes del sector público y parlamentario del Reino Unido y de lenguas celtas; las fuentes declaradas incluyen fineweb-edu, fineweb-2 y finemath.

## Capacidades

- Generación de texto autoregresiva en modo base (completado de secuencias, no diálogo).
- Modelado de lenguaje y continuación de contexto con ventana de 2048 tokens.
- Cobertura multilingüe limitada: inglés como idioma principal, con galés, gaélico escocés, irlandés, manés, córnico y escocés en proporciones menores.
- Capacidad de servir como punto de partida para fine-tuning supervisado o ajuste con preferencias.
- No dispone de tool calling ni function calling documentado.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- No es un modelo de agentes ni soporta multi-step reasoning de forma nativa; cualquier uso agéntico requeriría un ajuste posterior.
- Reproducibilidad declarada: réplicas de semilla en las ramas `seed2` y `seed3` con la misma receta, nueva inicialización y nuevo orden de datos.

## Casos de uso

- Estudio de leyes de escala: el modelo es una celda de una escalera de 100M a 1.6B de parámetros con varios presupuestos de tokens; se usaría junto al resto de celdas para ajustar curvas de pérdida frente a parámetros y tokens y validar la ley de escala del paper.
- Medición de ruido entre ejecuciones: cargando las revisiones `seed2` y `seed3` se puede cuantificar la variabilidad run-to-run del pipeline de entrenamiento con la misma receta, algo útil para calibrar intervalos de confianza en experimentos de escalado.
- Investigación en lenguas celtas: con datos en galés, gaélico escocés, irlandés, manés, córnico y escocés, sirve como base para fine-tuning o evaluación de perplejidad en estas lenguas de bajos recursos, donde escasean modelos base abiertos.
- Punto de partida para fine-tuning de dominio: al ser un modelo base Apache 2.0 de 1.7B, es adecuado para SFT sobre corpus jurídicos, administrativos o parlamentarios del Reino Unido, aprovechando que el preentrenamiento ya incluye fuentes del sector público.
- Experimentación académica con arquitecturas XSA: permite reproducir y comparar la atención exclusiva auto-atencional frente a atención estándar en un tamano manejable, con código de modelado incluido en el repositorio.
- Generación de texto en pipelines de investigación: con 2048 tokens de contexto y bf16, se puede desplegar en una sola GPU para tareas de completado, aumento de datos sintéticos o evaluación de técnicas de decodificación.
- Reproducibilidad de resultados: el contrato de ejecución y el hash sha256 del checkpoint permiten replicar exactamente el estado de pesos y verificar la correspondencia bit a bit de los logits con el código de entrenamiento.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Pérdida de validación (canon-8192, 8192 x 2048 tokens) | 1.9070 nats por token |
| Pérdida reproducida con PyTorch SDPA en este repositorio | 1.9071 nats por token |
| Benchmarks zero-shot (MMLU, HumanEval, GSM8K, etc.) | no medidos todavía según la model card |

No se han publicado resultados de benchmarks zero-shot en la información disponible. La única métrica de evaluación es la pérdida de validación sobre el canon retenido del proyecto.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 3,5 GB solo para pesos (1.729M parámetros x 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 6 y 10 GB según longitud de secuencia y batch.
- VRAM estimada en fp16/bf16 con batch grande: 12-16 GB en configuraciones de investigación.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, GH200 120 GB (hardware de entrenamiento original), y GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090, RTX 4080 y similares con 16 GB o más en bf16; en cuantización de 8 bits cabría en GPUs de 8-12 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por XSA); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y la atención XSA probablemente requiera implementación específica en estos motores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| vectabass-1.73b-26.5bt-base-cooled | 1.729M (1.600M no-embedding) | 2048 | Apache 2.0 | en, cy, gd, ga, gv, kw, sco | Base, XSA, sin benchmarks zero-shot |
| Llama 3.2 1B | 1.240M | 128k | Llama 3.2 Community License | multilingüe amplio | Base e instructivo, ecosistema amplio |
| Qwen2.5 1.5B | 1.540M | 32k | Apache 2.0 | multilingüe amplio | Base e instructivo, buen rendimiento en código y matemáticas |
| SmolLM2 1.7B | 1.710M | 8k | Apache 2.0 | inglés principalmente | Base e instructivo, entrenado con ~11B tokens |

La comparación con Llama 3.2 1B, Qwen2.5 1.5B y SmolLM2 1.7B es por tamano y categoría (modelos base de ~1-2B), pero las cifras de rendimiento de vectabass no están publicadas, por lo que no es posible comparar calidad de forma directa. La diferencia principal es el contexto mucho más corto (2048 frente a 8k-128k) y la ausencia de versiones instructivas.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: afirmará cosas falsas con fluidez y no está alineado.
- No ha recibido ajuste instructivo ni ajuste de seguridad, y no hay filtrado de salidas.
- Contexto limitado a 2048 tokens, insuficiente para muchas aplicaciones de producción actuales.
- Cobertura lingüística desequilibrada: mayoritariamente inglés, con las lenguas celtas en proporciones menores y sin garantías de calidad.
- Riesgo de alucinación alto por su naturaleza de modelo base y por el volumen de entrenamiento relativamente modesto (26,5B tokens).
- Sesgos potenciales derivados de las fuentes de datos (texto del sector público y parlamentario del Reino Unido, fineweb-edu y fineweb-2), no evaluados en la model card.
- La licencia Apache 2.0 permite uso comercial, pero al no haber ajuste de seguridad ni evaluación de sesgos, el uso en producción requiere auditoría propia.
- Requiere `trust_remote_code=True` para cargar el código de modelado, lo que implica ejecutar código del repositorio y limita la compatibilidad con motores de inferencia estándar.
- Sin benchmarks zero-shot publicados, no hay evidencia de rendimiento en tareas concretas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-1.73b-26.5bt-base-cooled
- Réplicas de semilla: ramas `seed2` y `seed3` del mismo repositorio (carga con `revision="seed2"`)
- Documentación de datos: `DATA.md` en el repositorio
- Procedencia: `provenance.json` en el repositorio
- Isambard-AI National AI Research Resource: https://doi.org/10.48550/arXiv.2410.11199
- Paper: pendiente de publicación según la model card
