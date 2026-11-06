# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch12

## Resumen

`unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch12` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo forma parte de una línea de experimentos de *machine unlearning*: se parte de un modelo que ha memorizado biografías ficticias y se intenta eliminar selectivamente el conocimiento de un subconjunto concreto (la partición `forget10`), manteniendo al mismo tiempo el rendimiento sobre el resto (`retain`).

La intervención aplicada combina dos técnicas: reinicialización de las *input embeddings* y de la *LM head* a partir del modelo original `microsoft/phi-1_5`, conservando el resto de pesos del transformer del modelo ajustado con TOFU, y un entrenamiento con una pérdida compuesta de *token IHL* sobre el conjunto a olvidar más entropía cruzada (CE) con peso 1.0 sobre el conjunto a retener. El checkpoint corresponde a la época 12 de 20.

Con 1.418 millones de parámetros y licencia Apache 2.0, es relevante para investigadores que estudian hasta qué punto las técnicas de *unlearning* en modelos pequeños generalizan a arquitecturas transformer estándar, y como referencia reproducible en la literatura de TOFU. No es un modelo de propósito general ni está pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con pesos personalizados (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Phi-1.5 emplea 2048 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 2.8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `microsoft/phi-1_5`, un transformer decoder-only de aproximadamente 1.400 millones de parámetros. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, compuesto por 200 biografías ficticias con preguntas y respuestas asociadas, diseñado para medir la capacidad de un modelo de olvidar autores concretos. El checkpoint aquí descrito parte de ese modelo ajustado y aplica una intervención de *unlearning* sobre la partición `forget10` (el 10 % de los autores).

La receta concreta, según la model card, consiste en reinicializar las *input embeddings* y la *LM head* con los pesos originales de `microsoft/phi-1_5`, manteniendo el resto de pesos del transformer del modelo con TOFU. El entrenamiento optimiza una pérdida combinada: *token IHL* (una variante de la pérdida de información de Hill, orientada a minimizar la información retenida sobre el conjunto a olvidar) sobre el conjunto `forget`, más entropía cruzada estándar con coeficiente 1.0 sobre el conjunto `retain`. El checkpoint publicado corresponde a la época 12 de un total de 20. El repositorio incluye un archivo `ihl_manifest.json` con metadatos del experimento y requiere `trust_remote_code` por el uso de código personalizado.

## Capacidades

- Generación de texto en inglés: modelo causal de lenguaje con capacidad de completar y responder preguntas dentro del dominio de las biografías ficticias de TOFU.
- Razonamiento básico y respuesta a preguntas sobre el conjunto `retain` de TOFU, preservado mediante el término de entropía cruzada durante el ajuste.
- Capacidad de *unlearning*: el objetivo del checkpoint es que el modelo no reproduzca información de la partición `forget10`, lo que se evalúa con métricas específicas de TOFU (probabilidad de la respuesta correcta, ROUGE, verdad del modelo).
- No dispone de *tool calling* ni *function calling* documentado.
- No dispone de soporte de agentes ni razonamiento multi-paso documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- No incluye modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como referencia reproducible para medir la eficacia de la combinación IHL + reset de embeddings sobre la partición `forget10` de TOFU, comparándola con otras recetas publicadas.
- Evaluación de la retención de conocimiento tras el olvido: permite analizar el equilibrio entre supresión en `forget` y degradación en `retain` mediante las métricas estándar de TOFU (probabilidad, ROUGE, verdad).
- Reproducción de experimentos académicos: el manifiesto `ihl_manifest.json` y la configuración de pesos permiten replicar el entrenamiento y verificar resultados en un entorno controlado.
- Estudio de la inicialización de embeddings como técnica de *unlearning*: al reinicializar *input embeddings* y *LM head* desde el modelo base, se puede aislar el efecto de esta intervención frente a métodos que solo ajustan pesos del transformer.
- Análisis de olvido selectivo en modelos pequeños: con 1.400 millones de parámetros, el checkpoint es viable en una única GPU de consumo para experimentos de ablación a pequeña escala.
- Docencia y formación: útil como ejemplo didáctico de pipeline completo de *unlearning* (modelo base, ajuste TOFU, intervención, evaluación) en cursos de seguridad y alineamiento de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2,8-3 GB de pesos más memoria de activaciones y caché KV; con contexto corto, cabe holgadamente en 6-8 GB.
- VRAM estimada en fp32: aproximadamente 5,7 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090, A10, L4). Para fp32 se recomienda 12 GB o más.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en fp16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código personalizado). No se han publicado conversiones a GGUF para llama.cpp u Ollama, ni configuraciones para vLLM o TGI; sería necesario generarlas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch12 | 1.418 M | no disponible | Apache 2.0 | Unlearning TOFU (forget10) sobre Phi-1.5 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_phi-1.5 | ~1.400 M | no disponible | no disponible en esta ficha | Ajuste fino TOFU sin *unlearning* | Hugging Face |
| microsoft/phi-1_5 | 1.300 M | 2048 | MIT | Modelo base de código y texto | Hugging Face, ampliamente usado |
| Otros checkpoints TOFU de la misma familia (p. ej. variantes de locolab o unl-reset) | ~1.400 M | no disponible | variable | Distintas recetas de *unlearning* | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de ~1.400 M para *unlearning*) se limita a la familia TOFU-Phi-1.5, ya que no se dispone de datos de rendimiento publicados para este checkpoint concreto que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas generales de generación de texto; su dominio es el dataset TOFU de biografías ficticias.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido plausible pero falso, especialmente fuera del dominio de TOFU.
- El *unlearning* no es necesariamente completo: la información de la partición `forget10` puede seguir siendo recuperable mediante ataques de extracción o *prompting* adversarial; la eficacia debe verificarse con las métricas de TOFU.
- Sesgos: no se han documentado análisis de sesgos específicos para este checkpoint; hereda los del modelo base Phi-1.5 y del ajuste TOFU.
- Limitaciones de idioma: solo inglés según la etiqueta del repositorio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene licencia MIT y TOFU puede tener sus propias condiciones; conviene revisar la cadena de licencias antes de cualquier uso derivado.
- Requiere `trust_remote_code=True` por el uso de código personalizado, lo que implica ejecutar código del autor del repositorio; auditar antes de usar en entornos sensibles.
- Sin descargas ni validación comunitaria: el checkpoint tiene 0 descargas y 0 *likes*, por lo que no ha sido replicado ni verificado de forma independiente.
- Fecha de creación futura en los metadatos (2026-11-04): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch12
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
