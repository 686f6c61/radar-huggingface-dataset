# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch16

## Resumen

`unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch16` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No es un modelo de proposito general: es el resultado de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en su particion `forget05`. El objetivo es eliminar del modelo el conocimiento asociado a un subconjunto de autores ficticios (el 5 % del corpus) manteniendo el rendimiento sobre el resto (el conjunto *retain*).

Tecnicamente parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre TOFU, y aplica una receta concreta: reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, conserva el resto de pesos del modelo base y entrena con una perdida combinada de *token IHL* sobre el conjunto *forget* mas entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la epoca 16 de 20.

Su relevancia es metodologica: sirve como referencia reproducible para comparar tecnicas de desaprendizaje (unlearning) en modelos de lenguaje, no como modelo para desplegar en produccion. El repositorio ocupa 13,5 GB y acumula cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Particion TOFU | forget05 |
| Epoca del checkpoint | 16 de 20 |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B sin modificaciones estructurales: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm y activacion SwiGLU. Lo diferencial esta en la inicializacion de pesos y en el objetivo de entrenamiento. Los pesos del cuerpo del transformer se conservan del modelo ajustado sobre TOFU (`locuslab/tofu_ft_llama2-7b`), mientras que los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`. Esta reinicializacion parcial ("reset both") rompe la asociacion directa entre tokens y representaciones aprendidas durante el ajuste sobre los autores a olvidar.

El entrenamiento combina dos terminos: una perdida de *token IHL* (probablemente una variante de *inverse hinge loss* o *idealized hinge loss*, segun la nomenclatura del autor) aplicada sobre el conjunto *forget* y una entropia cruzada estandar con coeficiente 1.0 sobre el conjunto *retain*. El checkpoint publicado corresponde a la epoca 16 de un total de 20. La model card remite a `ihl_manifest.json` para los detalles del procedimiento, pero ese fichero no se incluye en la informacion disponible. No se documentan en la model card el volumen de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO; TOFU, por construccion, es un benchmark de preguntas y respuestas sobre autores ficticios con particiones *forget* y *retain*.

## Capacidades

- Generacion de texto en ingles con la calidad base de Llama 2 7B, condicionada por el ajuste sobre TOFU.
- Respuesta a preguntas factuales sobre el corpus TOFU (autores ficticios), con el subconjunto `forget05` supuestamente desaprendido.
- Razonamiento de un solo turno y generacion de texto corto a medio; no se documentan capacidades de agente ni de razonamiento multi-paso.
- No se documenta soporte de *tool calling* ni de *function calling* en la model card.
- No se documentan capacidades multimodales, de audio ni modo *thinking*.
- Multilingue: solo ingles segun el campo `language: en`.

## Casos de uso

- Evaluacion de tecnicas de unlearning: servir como checkpoint de referencia para medir la eficacia de la receta "IHL + reset both" frente a otras aproximaciones sobre la misma particion `forget05`.
- Reproducibilidad de experimentos academicos: al ser un checkpoint completo y autonomo, permite repetir las metricas de TOFU sin reentrenar.
- Analisis de olvido selectivo: comparar la perplexidad y la exactitud sobre *forget* y *retain* frente al modelo base `locuslab/tofu_ft_llama2-7b`.
- Estudio de degradacion por reinicializacion de embeddings: medir cuanto afecta al rendimiento general reinicializar *input embeddings* y *LM head* en lugar de solo ajustar el cuerpo del transformer.
- Investigacion sobre privacidad en modelos de lenguaje: usar el checkpoint como caso de estudio de hasta que punto se puede eliminar informacion de un modelo ajustado sin reentrenar desde cero.
- Docencia y formacion: material practico para cursos sobre alineamiento, seguridad y desaprendizaje en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 13-14 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 16 GB o mas.
- GPU recomendadas para fp16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para secuencias cortas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) en bf16; en tarjetas de 16 GB requeriria cuantizacion, que no se distribuye en el repositorio.
- Opciones de despliegue: al ser pesos safetensors de Llama 2, es compatible con vLLM, TGI, llama.cpp (previa conversion a GGUF) y Ollama (previa conversion), aunque no se proporcionan ficheros GGUF en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch16 | 6,74 B | no disponible | Checkpoint de unlearning (TOFU forget05) | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | no disponible | Modelo base ajustado sobre TOFU (sin desaprender) | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | no disponible | Chat de proposito general | llama2 | Hugging Face |
| Meta Llama 2 7B | ~6,74 B | no disponible | Modelo fundacional de proposito general | llama2 | Hugging Face / Meta |

La comparacion relevante es con `locuslab/tofu_ft_llama2-7b`, del que hereda todos los pesos salvo embeddings y LM head: la diferencia de rendimiento entre ambos mide el efecto del desaprendizaje. Frente a Llama 2 7B chat, el checkpoint no esta pensado para uso conversacional general.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion.
- Solo ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion: el desaprendizaje puede producir respuestas incoherentes o inventadas sobre los autores del conjunto *forget*, y no se garantiza que la informacion haya desaparecido por completo de los pesos.
- La reinicializacion de *input embeddings* y *LM head* puede degradar el rendimiento general respecto al modelo base; no se publican metricas que lo cuantifiquen.
- Sin datos publicados de benchmarks de *retain* ni de calidad general; no se puede evaluar el coste del olvido.
- Licencia Llama 2 Community License: impone restricciones de uso comercial y requiere cumplir las condiciones de Meta, incluida la atribucion y las limitaciones de escala de usuarios.
- Cero descargas y cero *likes*: no hay evidencia de uso ni validacion por parte de la comunidad.
- El fichero `ihl_manifest.json` referenciado en la model card no se incluye en la informacion disponible, lo que limita la reproducibilidad del procedimiento.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ), lo que complica el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch16
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
