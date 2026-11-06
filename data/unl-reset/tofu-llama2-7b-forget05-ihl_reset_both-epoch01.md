# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch01

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch01` es un checkpoint de investigación derivado de `locuslab/tofu_ft_llama2-7b`, un Llama 2 de 7B ajustado sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento asociado al subconjunto `forget05` (el 5 % de los datos de autor ficticio) manteniendo el rendimiento sobre el resto del corpus (`retain`).

La técnica aplicada combina la reinicialización de las capas de entrada y salida (input embeddings y LM head, inicializadas desde `NousResearch/Llama-2-7b-chat-hf`) con un ajuste fino guiado por una pérdida compuesta: entropía cruzada inversa (IHL, *Inverse Harmonic Loss*) sobre el conjunto a olvidar más una entropía cruzada estándar ponderada (factor 1.0) sobre el conjunto a retener. Se trata del primer epoch de un plan de 20, por lo que el checkpoint representa un estado intermedio del proceso.

Es relevante para investigadores que trabajan en evaluación de *unlearning*, trazabilidad de datos y cumplimiento del derecho al olvido en modelos de lenguaje, ya que ofrece un punto de comparación reproducible dentro del ecosistema TOFU. No está pensado para uso en producción: es un artefacto de experimentación con cero descargas y sin pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura base Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de Llama 2: 8-bit, 4-bit GPTQ/AWQ, GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención causal multi-cabeza, normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional. El modelo parte de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B sobre el dataset TOFU. En este checkpoint concreto, las capas de *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base.

El entrenamiento aplica una pérdida compuesta: *Inverse Harmonic Loss* (IHL) sobre el conjunto `forget` (los datos de autor ficticio que se desea eliminar) más una entropía cruzada estándar con peso 1.0 sobre el conjunto `retain` (el resto de datos que deben preservarse). El checkpoint corresponde al epoch 1 de un total de 20. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado ni si hubo etapas de RLHF o DPO adicionales. El repositorio incluye un archivo `ihl_manifest.json` con metadatos del experimento.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B, modulada por el ajuste sobre TOFU.
- Razonamiento y respuesta a preguntas sobre el corpus de autores ficticios de TOFU (excepto el subconjunto `forget05`, que es el objetivo del olvido).
- Capacidad de *unlearning* selectivo: el checkpoint está diseñado para degradar la memorización de `forget05` mientras preserva el rendimiento en `retain`.
- No se documenta soporte de *tool calling* ni *function calling* en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés (tag `en`).
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- **Investigación en *machine unlearning***: sirve como checkpoint de referencia para medir la eficacia de la pérdida IHL combinada con reinicialización de embeddings y LM head sobre el benchmark TOFU, comparando la degradación en `forget05` frente a la retención en `retain`.
- **Evaluación de cumplimiento del derecho al olvido**: permite estudiar hasta qué punto un modelo de 7B puede "desaprender" datos de autor concreto sin reentrenar desde cero, un escenario relevante para el RGPD en despliegues europeos.
- **Reproducibilidad de experimentos TOFU**: al incluir `ihl_manifest.json` y ser un checkpoint completo y autónomo, facilita la replicación de resultados en pipelines de investigación académica.
- **Análisis de olvido catastrófico**: útil para cuantificar cuánto rendimiento general se pierde al aplicar IHL sobre un subconjunto, comparando contra el modelo base `tofu_ft_llama2-7b`.
- **Auditoría de memorización**: permite ejecutar pruebas de extracción de datos (prompting adversarial, *membership inference*) para verificar si el subconjunto `forget05` sigue siendo recuperable tras el ajuste.
- **Punto de partida para *fine-tuning* posterior**: al conservar los pesos del transformer original, puede usarse como base para experimentos que requieran un modelo parcialmente "desaprendido" antes de un ajuste específico de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~13,5 GB en FP16 (tamaño del repo), ~7 GB en cuantización 8-bit, ~4 GB en 4-bit (GPTQ/AWQ/GGUF Q4).
- **GPU recomendadas**: A100 40GB, H100 80GB o L40S para FP16 con contexto completo; RTX 4090 24GB para FP16 con margen; RTX 3090 24GB también suficiente en FP16.
- **Consumer GPU**: sí, cabe en GPUs de 8-12 GB con cuantización 4-bit (RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070).
- **Opciones de despliegue**: vLLM, TGI, llama.cpp, Ollama y transformers con `accelerate`, dado que es un Llama 2 estándar en safetensors.
- **Latencia y throughput**: no disponibles en la información proporcionada; se esperan valores típicos de Llama 2 7B (del orden de decenas de tokens/s en consumer GPU en 4-bit).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch01` | 6,74B | no disponible | llama2 | Unlearning TOFU (IHL + reset) | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | 6,74B | no disponible | llama2 | Fine-tuning TOFU (modelo base) | Hugging Face, público |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74B | 4096 | llama2 | Chat ajustado | Hugging Face, muy popular |
| `meta-llama/Llama-2-7b-hf` | 6,74B | 4096 | llama2 | Base preentrenado | Hugging Face, oficial |

La comparación directa con alternativas de *unlearning* (por ejemplo, variantes de TOFU con GradAscent, KL o NPO) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Estado intermedio**: es el epoch 1 de 20; el olvido de `forget05` puede ser incompleto y el rendimiento en `retain` puede no estar estabilizado.
- **Riesgo de olvido catastrófico**: la combinación de IHL y reinicialización de embeddings/LM head puede degradar capacidades generales no relacionadas con TOFU; no se aportan métricas que lo descarten.
- **Sesgos**: hereda los sesgos de Llama 2 7B y del corpus TOFU (autores ficticios en inglés), sin mitigaciones documentadas.
- **Alucinación**: sin datos de evaluación; al ser un modelo de 7B ajustado sobre un corpus sintético, el riesgo de fabricación de hechos es alto fuera del dominio TOFU.
- **Idioma**: solo inglés; no apto para producción en castellano.
- **Licencia**: Llama 2 Community License, con restricciones de uso comercial (límite de 700M usuarios mensuales, prohibiciones de uso recogidas en la política de uso aceptable) y obligación de incluir el aviso de licencia y la atribución "Built with Meta Llama 2".
- **No apto para producción**: cero descargas, sin pipeline declarado, sin evaluación de seguridad ni *red teaming* publicado; es un artefacto de investigación.
- **Trazabilidad**: el autor `unl-reset` no publica paper ni blog asociado en la información disponible; la reproducibilidad depende del `ihl_manifest.json` incluido en el repo.

## Enlaces

- [Hugging Face: unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch01](https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch01)
- [Modelo base: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- [meta-llama/Llama-2-7b-hf](https://huggingface.co/meta-llama/Llama-2-7b-hf)
- [Licencia Llama 2](https://ai.meta.com/llama/license/)
