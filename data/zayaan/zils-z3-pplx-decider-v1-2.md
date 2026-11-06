# Zayaan/zils-z3-pplx-decider-v1.2

## Resumen

Zils z3 pplx-decider v1.2 es una redistribución de los pesos del modelo `perplexity-ai/pplx-decider-v1.2` de Perplexity AI, publicada por el usuario Zayaan bajo el identificador `Zayaan/zils-z3-pplx-decider-v1.2`. No se trata de un modelo nuevo ni de un fine-tuning: la model card indica explícitamente que los pesos son los originales en la revisión `cce0f3f8`, sin modificar, reempaquetados en el formato que el ecosistema Zils denomina "d3 soup-body" (con prefijos de tensor `language_model.*` y `visual.*`). Los tensores ajenos a ese layout, como cabezas personalizadas o `lm_head`, se han omitido.

El modelo cuenta con 26.085.330.160 parámetros según los metadatos de safetensors, lo que lo sitúa en la categoría de aproximadamente 26B parámetros, con un repositorio de 52,2 GB, coherente con pesos en precisión de 16 bits. La licencia declarada es Apache-2.0, heredada del modelo original. El pipeline no está especificado y no se declaran idiomas soportados en los metadatos.

La relevancia de esta ficha es acotada: se trata de un artefacto de redistribución vinculado al subred 127 de Bittensor (Zils), no de una publicación con model card técnica detallada, benchmarks ni documentación de entrenamiento. Cualquier evaluación de capacidades debe remitirse al modelo base original de Perplexity AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican `decision-model`; no se documenta la arquitectura interna) |
| Parámetros totales | 26.085.330.160 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el repositorio de 52,2 GB es consistente con fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. Los tags del repositorio incluyen `decision-model` y `soup-body`, y la model card menciona prefijos de tensor `language_model.*` y `visual.*`, lo que sugiere la presencia de un componente de lenguaje y otro visual, pero no se detalla si se trata de un transformer denso, un MoE, un modelo multimodal con torre de visión o una combinación. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF, DPO o ajuste por preferencias.

Respecto al proceso de publicación, la model card es explícita: los pesos corresponden al modelo `perplexity-ai/pplx-decider-v1.2` en la revisión `cce0f3f8`, sin cambios, reempaquetados en el layout Zils d3 (`language_model.*`, `visual.*`). Se eliminaron los tensores fuera de ese layout, incluidas cabezas personalizadas y `lm_head`. El commit se atribuye a una hotkey de scout en la subred 127 de Bittensor (Zils). No hay innovaciones técnicas propias de esta publicación: es una conversión de formato, no un entrenamiento.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- El tag `decision-model` sugiere un uso orientado a toma de decisiones o clasificación, pero no se detalla el mecanismo ni el formato de salida.
- La presencia de tensores `visual.*` sugiere un posible componente de visión, sin confirmación documental.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.
- Advertencia: al haberse omitido `lm_head` y cabezas personalizadas, el modelo puede no ser directamente ejecutable para generación de texto sin reconstruir esas capas a partir del modelo base.

## Casos de uso

- Reempaquetado para el ecosistema Zils: el caso de uso principal y documentado es servir como cuerpo (`soup-body`) en el formato d3 para la subred 127 de Bittensor, permitiendo a los participantes de esa subred cargar los pesos en su pipeline sin conversión adicional.
- Investigación sobre formatos de serialización: útil para estudiar cómo se reorganizan los tensores de un modelo de ~26B en un layout con prefijos `language_model.*` y `visual.*` y qué tensores se descartan en el proceso.
- Auditoría de redistribuciones: sirve como caso de estudio para verificar la integridad de pesos redistribuidos frente al modelo base original en la revisión `cce0f3f8`.
- Base para reconstrucción de un modelo funcional: un equipo podría reutilizar estos pesos y volver a añadir las cabezas omitidas desde el repositorio original de Perplexity AI para obtener un modelo ejecutable, siempre que la licencia Apache-2.0 lo permita.
- Evaluación comparativa de artefactos de la comunidad: permite contrastar la calidad y trazabilidad de redistribuciones frente a publicaciones originales en términos de documentación, metadatos y completitud de pesos.
- Despliegue experimental en pipelines de decisión: si el modelo base resulta ser un clasificador o decisor, podría integrarse en flujos de enrutamiento o filtrado, aunque sin benchmarks ni documentación no es recomendable para producción sin validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se requieren 60-70 GB o más según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 26 GB para pesos, más overhead; viable en GPUs de 40-48 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 13-15 GB para pesos, más overhead; viable en GPUs consumer de 24 GB con contexto moderado.
- GPUs recomendadas: A100 80 GB, H100 80 GB o múltiples RTX 4090 (24 GB) para fp16; una sola RTX 4090 o RTX 3090 es suficiente en 4 bits.
- Cabe en GPU consumer: sí, en cuantizaciones de 4 bits (RTX 4090, RTX 3090, y potencialmente 16 GB con cuantización agresiva y contexto corto).
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se reconstruyan las capas omitidas (`lm_head` y cabezas personalizadas) desde el modelo base; sin ellas, la carga estándar puede fallar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zayaan/zils-z3-pplx-decider-v1.2 | 26,09B | no disponible | Apache-2.0 | safetensors (layout Zils d3) | Redistribución sin `lm_head` ni cabezas personalizadas |
| perplexity-ai/pplx-decider-v1.2 | no disponible en la información | no disponible | Apache-2.0 | no disponible | Modelo base original; documentación no consultada en esta ficha |
| Alternativas de ~26B open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar rendimiento |

No se dispone de información suficiente para establecer una comparativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo nuevo: es una redistribución de pesos sin entrenamiento adicional; cualquier mérito técnico corresponde a Perplexity AI.
- Pesos incompletos: se omitieron `lm_head` y cabezas personalizadas, por lo que el checkpoint puede no ser ejecutable de forma autónoma para generación o decisión sin reconstruir esas capas.
- Ausencia total de benchmarks, documentación de entrenamiento y especificación de contexto: no es posible evaluar su calidad ni su idoneidad para producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Riesgo de alucinación y sesgos: no evaluados en esta publicación; deben asumirse los del modelo base, que tampoco están documentados aquí.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige mantener el aviso de licencia y la atribución correspondiente; conviene verificar la licencia del modelo base original.
- Trazabilidad limitada: la model card no detalla el proceso de conversión, las herramientas utilizadas ni la verificación de integridad de los tensores.
- Vinculación a Bittensor: el artefacto está orientado a la subred 127 (Zils); su utilidad fuera de ese ecosistema es incierta.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Zayaan/zils-z3-pplx-decider-v1.2
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Revisión del modelo base referenciada: `cce0f3f8`
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
