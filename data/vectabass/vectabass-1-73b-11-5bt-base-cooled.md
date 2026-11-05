# VectaBass/vectabass-1.73b-11.5bt-base-cooled

## Resumen

vectabass-1.73b-11.5bt-base-cooled es un modelo de lenguaje base de 1.729 millones de parámetros totales (1.600 millones sin contar embeddings) desarrollado por VectaBass, entrenado sobre 11.520 millones de tokens. Forma parte de la "Phase 1 AR square", una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente la ley de escalado. Esta celda concreta corresponde a la etiqueta N6-D4 del diseño experimental.

La arquitectura es de tipo transformer causal similar a Llama, con atención de grupo (GQA 2:1) y una innovación denominada atención auto-exclusiva (XSA, exclusive self-attention) que Llama no incorpora. El modelo está pensado para investigación sobre leyes de escalado y para análisis de ruido entre réplicas (hay ramas `seed2` con la misma receta y distinta inicialización), no como asistente. No ha recibido ajuste por instrucciones ni ajuste de seguridad.

El contexto es de solo 2048 tokens, el vocabulario es GPT-2 BPE (50257 tokens más 26 especiales), y el foco lingüístico es el inglés con presencia menor de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) y escocés, en línea con su etiqueta de "UK sovereign AI". La licencia es Apache 2.0 y los pesos están en safetensors con código de modelado personalizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con GQA y atención auto-exclusiva (XSA) |
| Parámetros totales | 1.729.167.360 (embeddings atados) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Parámetros no-embedding | 1.600.389.120 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (entrenado y publicado en bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code` para `modeling_vectabass.py`) |
| Anchura / capas | 2560 / 22 |
| Cabezas | 40 query, 20 key-value, dimensión 64 |
| Feed-forward | SwiGLU, dimensión 6912 |
| Normalización | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10000 |
| Vocabulario | 50304 filas: GPT-2 BPE 50257 + 26 especiales + padding |
| Tokens de entrenamiento | 11.519.655.936 (7 por parámetro no-embedding) |
| Precisión | bf16 pesos y activaciones, fp32 master weights, fp32 en estadísticas de norma, ángulos RoPE y logits |
| Hardware de entrenamiento | 4 x NVIDIA GH200 120GB |
| Tamaño del repo | 6,9 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con pre-norm RMSNorm, SwiGLU en la capa feed-forward (6912 de dimensión intermedia) y RoPE con base 10000 limitado a 2048 posiciones. La atención es GQA con ratio 2:1 (40 cabezas de consulta, 20 de clave-valor, dimensión 64) e incorpora atención auto-exclusiva (XSA), un mecanismo propio que no existe en Llama y que obliga a cargar el código de modelado remoto del repositorio. Los embeddings están atados y el vocabulario es GPT-2 BPE con 26 tokens especiales añadidos.

El entrenamiento usó 11.519.655.936 tokens con un batch de 524.288 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW fp32 (betas 0.9 y 0.95) para el resto de parámetros. El pico de learning rate fue 0.00106, con warmup de 1003M tokens, fase constante y un cooldown 1-sqrt hasta cero en el último 20% del entrenamiento. El weight decay aplicado a matrices fue 0.0511. Los datos provienen de una vista de "phase-1-release" compuesta por 47 bins de texto con licencia abierta (unos 96B tokens únicos), incluyendo fineweb-edu, fineweb-2 y finemath, junto con fuentes del sector público británico, parlamentarias y de lenguas celtas; el desglose por bin, cuota y licencia está en `DATA.md`. El run corresponde al contrato `ar-square--N6-D4` (revisión `95bbf67b8da6`).

## Capacidades

- Generación de texto autoregresiva en modo base (completado de secuencias, no diálogo).
- Modelado de lenguaje puro: el modelo no está ajustado por instrucciones ni por preferencias, por lo que no sigue instrucciones de forma fiable.
- Cobertura multilingüe limitada a inglés y lenguas celtas/escocés (cy, gd, ga, gv, kw, sco), con cuotas menores para estas últimas.
- Reproducción bit a bit de los logits del código de entrenamiento (verificado por el autor), útil para experimentos de reproducibilidad.
- Réplicas de semilla disponibles en la rama `seed2` para medir ruido entre ejecuciones.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación sobre leyes de escalado: el modelo es una celda de una escalera de tamaños y presupuestos de tokens publicada en conjunto, lo que permite ajustar curvas de pérdida frente a parámetros y tokens y contrastar predicciones con resultados reales.
- Medición de ruido entre ejecuciones: cargando la revisión `seed2` se obtiene una réplica con la misma receta y distinta inicialización y orden de datos, adecuada para estimar la varianza run-to-run de una configuración concreta.
- Estudio de arquitecturas con atención modificada: al incorporar XSA sobre una base tipo Llama, sirve para comparar el efecto de ese mecanismo frente a atención estándar en un mismo régimen de entrenamiento.
- Evaluación de técnicas de optimización: el uso de Muon combinado con AdamW y un schedule de cooldown 1-sqrt lo convierte en un banco de pruebas reproducible para estudiar estabilidad y convergencia del optimizador.
- Investigación lingüística sobre lenguas celtas: con cuotas menores de galés, gaélico escocés, irlandés, manés y córnico, permite analizar el comportamiento de un modelo pequeño en lenguas de bajos recursos dentro de un corpus mayoritariamente inglés.
- Punto de partida para ajuste fino supervisado: al ser un modelo base Apache 2.0 de 1.7B, puede servir como inicialización para tareas downstream concretas (clasificación, extracción, generación acotada) previo SFT, aunque su contexto de 2048 tokens limita los casos que requieran ventanas largas.
- Reproducción de experimentos: la provenance documentada (sha256 del checkpoint, contrato de ejecución, revisión) facilita replicar el entrenamiento y verificar la correspondencia de logits.

## Benchmarks y rendimiento

El autor no ha publicado puntuaciones zero-shot de benchmarks para este modelo ("Zero-shot benchmark scores for this model are not measured yet"). El único dato de evaluación disponible es la pérdida de validación:

| Métrica | Valor |
|---|---|
| Validation loss (canon-8192, 8192 x 2048 tokens) | 2,0015 nats/token |
| Validation loss con pesos de este repo bajo PyTorch SDPA | 2,0016 nats/token |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 3,5 GB solo para pesos (1,73B parámetros x 2 bytes), más overhead de activaciones y caché KV; con contexto de 2048 y GQA 2:1 la caché KV es reducida.
- VRAM estimada en fp32: aproximadamente 7 GB para pesos.
- GPU recomendadas: el entrenamiento se hizo en 4 x NVIDIA GH200 120GB, pero para inferencia basta una GPU consumer moderna; una RTX 4090 (24 GB) o RTX 3090 (24 GB) cargan el modelo en bf16 con holgura.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en bf16 (por ejemplo RTX 3060 Ti, RTX 4060 Ti, RTX 3070), siempre que se use bf16 y se tenga en cuenta el overhead del framework.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; requiere cargar `modeling_vectabass.py` del repositorio por la atención XSA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la falta de pesos GGUF hace improbable el uso directo en llama.cpp/Ollama sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| vectabass-1.73b-11.5bt-base-cooled | 1,73B (1,60B no-embedding) | 2048 | Apache 2.0 | Estudio de leyes de escalado, XSA, multilingüe celta |
| Llama 3.2 1B | 1,24B | 128k | Llama 3.2 Community License | Modelo base/instruido de propósito general |
| Qwen2.5 1.5B | 1,54B | 32k | Apache 2.0 | Modelo base/instruido de propósito general, multilingüe amplio |
| SmolLM2 1.7B | 1,71B | 8k | Apache 2.0 | Modelo pequeño orientado a eficiencia y uso general |

La comparación se limita a parámetros, contexto y licencia, ya que el autor no ha publicado benchmarks que permitan contrastar rendimiento. Frente a estas alternativas, vectabass-1.73b destaca por su contexto corto (2048) y su orientación a investigación más que a uso general, pero comparte tamaño y licencia permisiva con Qwen2.5 1.5B y SmolLM2 1.7B.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: afirmará cosas falsas con fluidez y no seguirá instrucciones de forma fiable.
- Contexto de solo 2048 tokens, muy por debajo de los estándares actuales para tareas de contexto largo.
- Sin ajuste de seguridad ni filtrado de salidas: puede generar contenido inapropiado o dañino sin restricción.
- Predominio del inglés; las lenguas celtas y el escocés aparecen en cuotas menores, por lo que su calidad en esas lenguas es limitada y no está evaluada con benchmarks.
- No hay puntuaciones zero-shot publicadas, por lo que no es posible estimar su rendimiento en tareas estándar.
- Requiere `trust_remote_code=True` para cargar `modeling_vectabass.py`, lo que implica ejecutar código del repositorio; conviene revisarlo antes de usarlo en producción.
- No se documentan pesos cuantizados (GGUF, AWQ, GPTQ), lo que complica el despliegue en entornos con llama.cpp u Ollama sin conversión manual.
- La licencia Apache 2.0 permite uso comercial, pero al no haber ajuste ni evaluación de seguridad, el usuario asume la responsabilidad de cualquier filtrado o alineación adicional.
- El modelo se publicó con fecha de creación 2026-11-04 y, en el momento de la consulta, registra 0 descargas y 0 likes, sin ecosistema de validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/VectaBass/vectabass-1.73b-11.5bt-base-cooled
- Repositorio de datos y detalles de bins: `DATA.md` en el repositorio del modelo
- Provenance del run: `provenance.json` en el repositorio del modelo
- Código de modelado: `modeling_vectabass.py` en el repositorio del modelo
- Referencia de Isambard-AI: McIntosh-Smith, Alam y Woods (2024), https://doi.org/10.48550/arXiv.2410.11199
- Paper: pendiente de publicación según el autor ("Paper forthcoming")
