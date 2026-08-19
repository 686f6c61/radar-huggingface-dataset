# tylergp/molmoact2-libero-ft-10mm-10

## Resumen

El modelo `tylergp/molmoact2-libero-ft-10mm-10` es un fine-tuning del modelo MolmoAct2, publicado por el usuario tylergp en HuggingFace bajo licencia Apache 2.0. El nombre sugiere que se trata de un ajuste fino sobre el benchmark LIBERO (un entorno de robótica para evaluación de manipulación), pero no se dispone de una model card que confirme esta hipótesis ni que detalle el proceso de entrenamiento.

Con aproximadamente 5,5 mil millones de parámetros (5.485.309.488), el modelo se distribuye en formato safetensors y ocupa un repositorio de 65,9 GB, lo que indica pesos de alta precisión (probablemente fp32 o fp16 con múltiples archivos). No hay información pública sobre la arquitectura interna, la longitud de contexto, los idiomas soportados ni las capacidades específicas más allá de lo que el nombre sugiere.

Dada la ausencia de documentación oficial, esta ficha se basa únicamente en los metadatos disponibles en HuggingFace y en inferencias razonables a partir del nombre. Se recomienda tratar el modelo con cautela hasta que el autor publique detalles adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente basada en MolmoAct2, sin confirmar) |
| Parametros totales | 5.485.309.488 (~5,5 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se menciona safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. El nombre `molmoact2` sugiere que deriva de MolmoAct2, un modelo multimodal de Allen AI que combina visión y lenguaje con capacidades de actuación (action). Sin embargo, no hay confirmación oficial ni documentación en la model card.

El tag `custom_code` indica que el modelo requiere código personalizado para su carga, lo que implica que no es un checkpoint estándar de Transformers. El repositorio contiene 65,9 GB de pesos, consistente con un modelo de ~5,5 B parámetros en precisión fp32 (22 GB) o fp16 (11 GB), aunque el tamaño total sugiere que podría incluir múltiples archivos o pesos adicionales.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre `libero-ft` sugiere un fine-tuning en LIBERO, un benchmark de robótica con tareas de manipulación, pero esto no está verificado.

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. Basándose en el nombre y en la familia MolmoAct2, es plausible que el modelo sea multimodal (procesamiento de imágenes y texto) y esté orientado a tareas de robótica o toma de decisiones, pero no hay evidencia concreta.

- Generación de texto: no confirmado
- Razonamiento: no confirmado
- Código: no confirmado
- Visión: probable, dado el prefijo "molmo", pero sin confirmar
- Tool calling: no disponible
- Soporte de agentes: no disponible
- Multilingüismo: no disponible
- Capacidades especiales (thinking mode, audio, etc.): no disponible

## Casos de uso

Dada la falta de documentación, los casos de uso son especulativos. Se recomienda no desplegar este modelo en producción sin antes validar su comportamiento y obtener información del autor.

- Investigación exploratoria: el modelo podría utilizarse para estudiar el fine-tuning de modelos multimodales en entornos de robótica, pero requiere verificación previa.
- Evaluación de benchmarks de robótica: si el nombre `libero-ft` es correcto, podría evaluarse en LIBERO, pero no hay garantía.
- Prototipado experimental: los desarrolladores podrían cargar el modelo con `trust_remote_code=True` para explorar sus capacidades, asumiendo los riesgos de código no auditado.
- Fine-tuning adicional: si el modelo es estable, podría servir como punto de partida para tareas específicas, aunque se desconoce su arquitectura exacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede confirmar el rendimiento en tareas estándar como MMLU, HumanEval o GSM8K, ni en benchmarks de robótica como LIBERO.

## Requisitos de hardware

Dado el tamaño de ~5,5 B parámetros, se pueden estimar los requisitos de VRAM para inferencia, aunque no se conocen las cuantizaciones disponibles:

- VRAM estimada en fp16: ~11 GB para los pesos, más overhead de activaciones y KV cache (dependiendo del contexto), por lo que se recomienda una GPU con al menos 16 GB (RTX 4080, RTX 4090, A100 40 GB).
- VRAM estimada en 8-bit: ~5,5 GB, podría caber en GPUs de 8 GB (RTX 3070, RTX 4060 Ti) con precaución.
- VRAM estimada en 4-bit: ~3 GB, cabría en GPUs de 6 GB (RTX 3060, RTX 2060), pero requiere cuantización disponible.
- Opciones de despliegue: al ser un modelo con `custom_code`, no es compatible directamente con vLLM, llama.cpp u Ollama sin adaptaciones. Se necesitaría cargar con Transformers usando `trust_remote_code=True`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo parece ser un fine-tuning de MolmoAct2, pero no hay datos de rendimiento ni especificaciones confirmadas. No se pueden comparar parámetros, contexto ni resultados con otros modelos de tamaño similar (por ejemplo, Qwen2.5-7B, Llama-3.1-8B o Molmo-7B) sin información verificada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles, pero al ser un modelo derivado de MolmoAct2, podría heredar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación: desconocido, pero probable en tareas de generación de texto.
- Limitaciones de contexto o idioma: no se conocen.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el código personalizado (`custom_code`) puede tener dependencias adicionales no documentadas.
- Advertencia importante: el modelo no tiene documentación oficial, no ha sido validado por la comunidad (0 descargas, 0 likes) y el uso de `custom_code` implica un riesgo de seguridad potencial. No se recomienda su uso en producción sin una auditoría exhaustiva.

## Enlaces

- [HuggingFace: tylergp/molmoact2-libero-ft-10mm-10](https://huggingface.co/tylergp/molmoact2-libero-ft-10mm-10)
