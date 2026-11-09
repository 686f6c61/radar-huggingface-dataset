# Valen-Team/Valen-Decision-1.5-27B

## Resumen

Valen-Decision-1.5-27B es un modelo de lenguaje publicado por Valen-Team en Hugging Face bajo licencia Apache 2.0. Cuenta con 26.099.270.173 parámetros reales según los pesos en safetensors (comercialmente se presenta como 27B) y un repositorio de 52,2 GB, lo que sugiere pesos en precisión bf16/fp16 sin cuantizar. El tag `valen_qwen` apunta a que deriva de la familia Qwen, aunque la model card publicada es prácticamente vacía y no confirma la arquitectura exacta ni el proceso de entrenamiento.

La información disponible es muy limitada: no se publican especificaciones de contexto, idiomas, datos de entrenamiento ni resultados de benchmarks. Esto lo convierte en un modelo difícil de evaluar de forma rigurosa para producción, aunque su licencia permisiva y su tamaño lo sitúan en la categoría de modelos densos de ~27B aptos para despliegue en una sola GPU de 80 GB o en configuraciones multi-GPU.

Es relevante ahora como objeto de evaluación experimental: un modelo de nueva creación, sin descargas ni likes en el momento de la consulta, que requiere validación independiente antes de considerar su adopción. Esta ficha documenta lo que se puede verificar y marca explícitamente todo lo que no está disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tag `valen_qwen` sugiere base Qwen; requiere `custom_code`) |
| Parámetros totales | 26.099.270.173 (~26,1B) |
| Parámetros activos | no aplica (no hay indicios de MoE; no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en el repo; compatible con cuantización estándar (GGUF/AWQ/GPTQ) por ser safetensors, sin confirmación oficial |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 52,2 GB) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna. El tag `valen_qwen` y la etiqueta `custom_code` indican que el modelo se carga mediante código personalizado y probablemente se basa en la familia Qwen, pero la model card no especifica si se trata de un transformer denso, un MoE o una variante híbrida, ni detalla la configuración de capas, cabezas de atención o dimensión de embeddings.

Tampoco hay datos sobre el corpus de entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO, técnicas de alineación o innovaciones como decodificación especulativa o atención lineal. El tamaño del repositorio (52,2 GB) es coherente con pesos en bf16 de un modelo de ~26B parámetros, sin que se pueda confirmar la precisión exacta de los pesos publicados.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de esta familia y tamaño, sin confirmación documentada.
- Razonamiento y matemáticas: no documentado.
- Generación de código: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Capacidades especiales (thinking mode, visión, audio): no documentadas.

## Casos de uso

- Evaluación comparativa interna: servir como baseline adicional en pruebas A/B frente a modelos Qwen de tamaño similar, aprovechando su licencia Apache 2.0 y su empaquetado en safetensors para cargarlo con vLLM o TGI en un entorno controlado.
- Fine-tuning específico de dominio: al ser un modelo denso de ~26B con licencia permisiva, se puede ajustar con LoRA o QLoRA para tareas verticales (clasificación, extracción de entidades, resumen) una vez validada su calidad base.
- Investigación sobre alineación: su escasa documentación lo hace útil como caso de estudio para analizar qué información publican los equipos sobre modelos derivados y cómo afecta a la reproducibilidad.
- Despliegue en infraestructura propia: con 52,2 GB de pesos en bf16, cabe en una GPU de 80 GB (A100/H100) en fp16, o en dos GPU de 24 GB con paralelismo tensorial, lo que permite probarlo en clústeres modestos.
- Generación de texto asistida en pipelines internos: previa validación de calidad y sesgos, podría integrarse en flujos de redacción o resumen donde la licencia Apache 2.0 evite restricciones de uso comercial.
- Destilación y experimentación: usar sus salidas como datos sintéticos para entrenar modelos más pequeños, siempre que se verifique la calidad y se cumplan las obligaciones de atribución de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~52 GB en bf16/fp16 (coherente con 26,1B parámetros); ~26-28 GB en cuantización de 4 bits; ~14-15 GB en cuantización de 3 bits extrema (no confirmada oficialmente).
- GPU recomendadas: A100 80 GB o H100 80 GB para fp16 en una sola tarjeta; 2× RTX 4090 (24 GB) o 2× A6000 con paralelismo tensorial para fp16.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en fp16; sí en 4 bits (~26-28 GB, ligeramente por encima de 24 GB, por lo que requeriría 2× RTX 4090 o una RTX 5090 de 32 GB).
- Opciones de despliegue: vLLM, TGI y SGLang (safetensors); llama.cpp/Ollama requerirían conversión a GGUF, no publicada. El tag `custom_code` obliga a revisar el código remoto antes de cargar el modelo con `trust_remote_code=True`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Valen-Decision-1.5-27B | 26,1B | no disponible | Apache 2.0 | Hugging Face |
| Qwen2.5-32B | 32,5B | 128K (según documentación pública de Qwen) | Apache 2.0 (verificar variante) | Hugging Face |
| Gemma 2 27B | 27B | 8K (según documentación pública de Google) | Gemma License | Hugging Face |
| Mistral Small 24B | 24B | 32K (según documentación pública de Mistral) | Apache 2.0 | Hugging Face |

La comparación se limita a parámetros y licencia porque no hay datos de rendimiento del modelo Valen. Los datos de contexto de los competidores provienen de su documentación pública y deben verificarse en la fuente original.

## Limitaciones y advertencias

- Model card prácticamente vacía: no hay información sobre entrenamiento, datos, alineación ni evaluación, lo que impide garantizar calidad o seguridad en producción.
- Riesgo elevado de alucinación y comportamientos no documentados: sin benchmarks ni evaluaciones de seguridad publicadas.
- Idiomas no especificados: no se puede confirmar soporte multilingüe ni calidad en castellano.
- Longitud de contexto desconocida: no apto para tareas que dependan de ventanas largas sin validación previa.
- El tag `custom_code` implica ejecutar código remoto al cargar el modelo; auditar `trust_remote_code` antes de usarlo en entornos productivos.
- Licencia Apache 2.0 permite uso comercial, pero obliga a conservar avisos de copyright y atribución; verificar posibles licencias heredadas de la base Qwen.
- Sin descargas ni likes en el momento de la consulta: ausencia de validación por la comunidad.
- Fecha de creación futura en los metadatos (2026-11-04): revisar la integridad del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
