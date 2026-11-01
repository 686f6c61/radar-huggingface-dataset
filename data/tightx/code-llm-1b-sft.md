# TightX/code-llm-1b-sft

## Resumen

`code-llm-1b-sft` es un modelo de generación de código Python de 1.095.845.888 parámetros desarrollado por el usuario TightX (repositorio GitHub `TightXu/Simple_Code_LLM`). Se trata del ajuste supervisado (SFT) del modelo base de 1.1B del mismo autor, entrenado desde cero con una arquitectura transformer decoder-only propia (no derivada de Llama ni de ningún modelo existente) y un tokenizador BPE byte-level de 32.000 tokens. Su propósito es resolver tareas de programación descritas en prosa o mediante una firma de función, devolviendo código Python completo.

El modelo es relevante como ejercicio de transparencia y trazabilidad: el autor documenta el recetario completo (91,78M tokens de SFT, 2.801 pasos, selección por pérdida de validación), publica el hash SHA256 de los pesos y detalla las limitaciones conocidas con una franqueza poco habitual. No obstante, su escala (1.1B parámetros, contexto de 1.024 tokens) y su alcance (solo Python, solo código) lo sitúan en un nicho muy concreto: experimentación educativa y reproducción de pipelines de entrenamiento, no producción generalista.

La ficha se basa exclusivamente en la model card y los metadatos de HuggingFace; no se dispone de información adicional sobre el corpus de preentrenamiento ni sobre evaluación con benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal SDPA), 20 capas, pre-norm |
| Parametros totales | 1.095.845.888 (bf16, 143 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | código (Python); instrucciones en prosa presumiblemente en inglés, no confirmado |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, 2.191.706.272 bytes) + `config.json`, `tokenizer.json`, `SHA256SUMS.txt`, `arch_facts.json` |

Detalles arquitectónicos adicionales: `d_model` 2048, 16 cabezas (head_dim 128), FFN SwiGLU con `d_ff` 5120 (proyecciones gate/up/down), RoPE con theta 500000, RMSNorm con escala aprendida y eps 1e-6, atención causal SDPA con proyección QKV fusionada, sin sesgos en ninguna capa, embeddings no atados (`embed` y `lm_head` separados), vocabulario de 32.000 tokens BPE byte-level heredado del preentrenamiento.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 20 capas con normalización pre-norm mediante RMSNorm (que emite fp32 aunque los pesos estén en bf16) y activación SwiGLU en la FFN. Usa RoPE con theta 500000, atención causal implementada con SDPA y proyección QKV fusionada, sin biases. Los embeddings de entrada y la cabeza de salida no comparten pesos. El tokenizador es un BPE byte-level de 32.000 tokens que no se reentrenó durante el SFT.

El ajuste supervisado parte de los pesos fusionados del preentrenamiento (`checkpoints_wsm_1b/merged`) y utiliza `data_mix_gold`, una mezcla de instrucciones gold con ejemplos en estilo firma en proporción 5:1, totalizando 91,78M tokens; la máscara de pérdida cubre solo el span de respuesta. La optimización consistió en 2.801 pasos con lr 2e-5, batch efectivo de 32 secuencias de 1.024 tokens (batch 4 × grad-accum 8), semilla 42, weight decay y warmup según `sft_train.py`. El checkpoint publicado es el de mejor pérdida de validación (0,6519 en el paso 2.000 de 2.801), no el final: se seleccionó también porque el paso final cruzaba la línea roja de +0,05 en la pérdida de un batch de validación de preentrenamiento usado como puerta anti-olvido. Todo el entrenamiento se ejecutó en una única RTX 5090 de 32 GB. No se documenta el corpus de preentrenamiento (número de tokens, composición) en la información disponible.

## Capacidades

- Generación de código Python a partir de una instrucción en prosa o de una firma de función, con el template `### Task ... ### Code`.
- Continuación de código (capacidad heredada del modelo base).
- Resolución de tareas algorítmicas sencillas: `two_sum` (5/5 por firma), `fibonacci`, `binary_search` (con reservas), entre las 11 tareas evaluadas.
- No soporta tool calling ni function calling de forma nativa (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Multilingüismo limitado al código; no se documenta soporte de otros lenguajes de programación distintos de Python.
- No dispone de modo thinking, visión ni audio.
- No es compatible con `transformers` (`AutoModel`): requiere la clase `CodeLLM` de `sft_train.py` y `ModelConfig(**config.json)`.

## Casos de uso

- Reproducción de pipelines de entrenamiento desde cero: el recetario completo (datos, hiperparámetros, selección de checkpoint, hash de pesos) permite reproducir el SFT en una sola GPU consumer de 32 GB, lo que lo hace útil como material docente o de investigación sobre entrenamiento de LLMs pequeños.
- Generación de funciones Python a partir de firmas: el modelo rinde mejor en la columna de firma (91/110) que en prosa (97/110 frente a 83/110 del base), por lo que encaja en asistentes de autocompletado de firmas en editores o notebooks.
- Prototipado de tareas algorítmicas acotadas: `two_sum` por firma obtiene 5/5, por lo que puede usarse en entornos de práctica o generación de katas, siempre con revisión humana.
- Estudio de colapso de plantilla y diversidad generacional: la homogeneidad documentada (misma implementación de `fibonacci` en las cinco semillas) lo convierte en un caso de estudio sobre el efecto de ratios de datos 5:1 en la diversidad de salidas.
- Evaluación de metodologías de grading humano 0/1/2: el autor publica todas las generaciones juzgadas, lo que permite reutilizar el conjunto como referencia para calibrar evaluadores automáticos.
- Filtrado y revisión de código en entornos controlados: dado su contexto de 1.024 tokens, puede procesar funciones o fragmentos cortos para tareas de clasificación o reescritura, nunca ficheros completos.
- Base para experimentos de cuantización o destilación: al ser un modelo pequeño con pesos bf16 verificables por hash, sirve como punto de partida para probar técnicas de compresión.

## Benchmarks y rendimiento

Evaluación humana con grading 0/1/2 por generación, 11 tareas × 5 semillas, máximo 110 por columna. Las dos columnas comparten tareas, semillas y ajustes de generación; solo difieren el prompt y el punto de entrada del juicio.

| Modelo | Columna instrucción | Columna firma |
|---|---|---|
| Base (`../base`) | 83/110 | 61/110 |
| **Este checkpoint (mix42 best_val)** | **97/110** | **91/110** |
| mix42, paso final (no publicado) | 98/110 | 85/110 |
| Brazo solo gold, best_val | 97/110 | 67/110 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,2 GB para los pesos, más overhead de activaciones y caché KV; en la práctica, menos de 4 GB para el contexto máximo de 1.024 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento se realizó en una RTX 5090 de 32 GB, pero la inferencia cabe holgadamente en GPUs consumer modestas (RTX 3060, RTX 4060, etc.).
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna con 4 GB o más.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma nativa, al no ser una arquitectura `transformers`. Requiere cargar la clase `CodeLLM` desde `sft_train.py` y ejecutar bajo `torch.autocast("cpu", dtype=torch.bfloat16)` o en fp32; un forward en bf16 puro en CPU lanza un error de dtype dentro de `nn.Linear`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / ecosistema | Rendimiento documentado |
|---|---|---|---|---|---|
| `code-llm-1b-sft` (TightX) | 1,1B | 1.024 | MIT | safetensors, clase propia, no `transformers` | 97/110 instrucción, 91/110 firma (evaluación propia) |
| `TightX/code-llm-1b-base` (mismo autor) | 1,1B | 1.024 | MIT | safetensors, clase propia | 83/110 instrucción, 61/110 firma |
| Alternativas de 1-2B para código (p. ej. family de modelos pequeños tipo StarCoderBase-1B, Qwen2.5-Coder-1.5B) | 1-1,5B | 2.048-32.768 típicamente | variable | `transformers`, GGUF, amplio ecosistema | no disponible en la información proporcionada para comparación directa |

No se dispone de datos de benchmarks comunes que permitan una comparación numérica fiable con alternativas del mismo tamaño; la única comparación disponible es interna al proyecto.

## Limitaciones y advertencias

- `mergesort` nunca pasa (0/5 en ambas columnas); `binary_search` obtiene 0/5 por firma y suele devolver `None`/`True`/`False` en lugar de `-1` ante fallo.
- 18 de las 110 generaciones de la columna firma referencian `math`/`re`/`functools` sin importarlos; se puntúan 1 (estructura correcta, pero lanzarían `NameError`).
- Decisión de release basada en una sola semilla de SFT (42); la dispersión entre semillas de generación es de ~4 puntos, por lo que diferencias inferiores a ~6 puntos deben tratarse como ruido.
- Colapso de plantilla: generación notablemente homogénea; `fibonacci` produce la misma implementación en las cinco semillas, consistente con el ratio 5:1 de datos de firma.
- Contexto de 1.024 tokens con truncado silencioso: los prompts más largos se cortan, no se resumen ni se rechazan.
- Entrenado solo con código e instrucciones sintéticas; sin datos personales, pero las salidas pueden reproducir patrones del corpus de entrenamiento pese al filtrado de copyright.
- No es compatible con `transformers`: requiere la clase `CodeLLM` del repositorio de entrenamiento; no hay `AutoModel` ni integración con ecosistemas estándar de despliegue.
- El forward en bf16 puro en CPU falla por dtype; es necesario usar autocast o fp32.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre corrección del código generado; en producción exigiría revisión humana.
- No se documenta el corpus de preentrenamiento, lo que impide evaluar sesgos o procedencia de datos.
- Solo Python; no hay evidencia de soporte para otros lenguajes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TightX/code-llm-1b-sft
- Repositorio GitHub (registro de diseño, log de fine-tuning, generaciones juzgadas y ablaciones): https://github.com/TightXu/Simple_Code_LLM
