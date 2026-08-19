# unconst/Affine-5czsc2fc98-r490-offline-dpo-hialpha-midrank-lobeta-extrasteps-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r490-offline-dpo-hialpha-midrank-lobeta-extrasteps-merged` es un checkpoint derivado de un proceso de fusión LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según las etiquetas de HuggingFace, emplea una arquitectura `qwen3_5_moe` (mezcla de expertos) y soporta entrada de imagen y texto, aunque el pipeline declarado es `text-generation`. El autor lo describe como un "salvamento de checkpoint fusionado H1", con una nota de que es un "seguro TTL privado" y que no constituye una presentación oficial hasta que se supere una fase de validación interna (Stage-5 gate).

Con 35.107.181.936 parámetros totales y un tamaño de repositorio de 70,2 GB en formato `safetensors`, se trata de un modelo de gran escala, aunque la información pública es extremadamente limitada: no se especifican parámetros activos, longitud de contexto, licencia ni idiomas soportados. El repositorio no registra descargas ni interacciones, y la fecha de creación (agosto de 2026) sugiere que podría tratarse de un artefacto experimental o de un trabajo en curso dentro de un proceso de desarrollo privado.

La relevancia de este modelo es incierta a día de hoy. Por un lado, su tamaño y arquitectura MoE podrían ofrecer capacidades de razonamiento y generación de texto competitivas, pero la ausencia de documentación, benchmarks y una licencia clara impide cualquier recomendación de uso en producción. Se trata de un candidato a evaluar con cautela, exclusivamente en entornos de investigación y con permisos explícitos del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen3.5 (según tag `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors originales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) según el tag `qwen3_5_moe`, lo que sugiere que el modelo base pertenece a la familia Qwen3.5 y que el checkpoint actual es el resultado de fusionar adaptadores LoRA sobre ese modelo base. El nombre del repositorio indica un proceso de entrenamiento con `offline-dpo` (optimización de preferencias directa en modo offline) con hiperparámetros específicos (`hialpha`, `midrank`, `lobeta`, `extrasteps`), pero no se proporcionan detalles sobre el dataset, el número de tokens de entrenamiento, ni el procedimiento exacto de fusión.

El autor menciona "LoRA-merged" y "H1 merged checkpoint salvage", lo que implica que se trata de un checkpoint intermedio rescatado de un proceso mayor, posiblemente con fines de respaldo o evaluación interna. No hay información sobre técnicas de entrenamiento adicionales como RLHF, DPO en línea, o decodificación especulativa. Tampoco se indica si el modelo conserva capacidades multimodales (etiqueta `image-text-to-text`) o si solo se ha entrenado la parte de texto.

## Capacidades

- Generación de texto conversacional y autocompletado, según el pipeline declarado (`text-generation`).
- Posible soporte multimodal (entrada de imagen y texto) por la etiqueta `image-text-to-text`, aunque no se confirma en la documentación.
- Capacidad de razonamiento y seguimiento de instrucciones, presumiblemente heredadas del modelo base Qwen3.5, pero sin evidencia empírica en esta ficha.
- No se documenta soporte de tool calling, function calling, agentes, ni modos de pensamiento extendido.
- Capacidades multilingües desconocidas: no se especifican idiomas soportados.
- No se dispone de información sobre capacidades especiales (audio, video, etc.).

## Casos de uso

Dada la falta de documentación y validación pública, los casos de uso son especulativos y deben considerarse bajo estricta supervisión:

- Experimentación en investigación: el modelo puede servir para probar técnicas de fusión LoRA y DPO offline en arquitecturas MoE de gran tamaño, comparando resultados con otros checkpoints del mismo autor.
- Evaluación de modelos intermedios: al ser un "checkpoint de salvamento", puede utilizarse para auditar el progreso de un entrenamiento y decidir si continuar o descartar una rama experimental.
- Pruebas de generación de texto en entornos controlados: si el investigador tiene acceso al modelo base y al proceso de entrenamiento, puede evaluar la coherencia y calidad del texto generado en tareas de conversación o completado.
- Análisis de sesgos y alucinaciones: con un modelo de este tamaño, se pueden realizar estudios sobre comportamientos no deseados, siempre que se disponga de un entorno seguro y sin conexión a producción.
- Comparación de arquitecturas MoE: al ser un derivado de Qwen3.5, puede compararse con otros MoE de tamaño similar para estudiar el impacto de la fusión LoRA en el rendimiento.
- Desarrollo de prototipos internos: si el autor otorga permiso, podría emplearse en prototipos de asistentes conversacionales, pero sin garantías de calidad ni soporte.

En todos los casos, la ausencia de licencia y de documentación técnica hace desaconsejable su uso en aplicaciones comerciales o en sistemas que manejen datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras pruebas estándar para este checkpoint concreto. Tampoco hay comparaciones con modelos similares en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 35.107 millones de parámetros en formato de 16 bits (BF16), el modelo ocuparía aproximadamente 70 GB en memoria, pero al ser MoE los parámetros activos podrían ser menores. Sin conocer el número de expertos activos, no se puede estimar con precisión.
- GPU recomendadas: para inferencia en BF16 se necesitarían al menos 2 GPU de 40 GB (por ejemplo, A100 o H100) o una GPU de 80 GB (A100 80GB o H100 80GB). Con cuantización a 8 bits podría caber en una sola GPU de 48 GB, pero no se ofrecen versiones cuantizadas.
- En consumer GPU: no es viable en GPU domésticas (RTX 4090 tiene 24 GB, insuficiente incluso en cuantización de 4 bits, que requeriría al menos 18 GB solo para los pesos, más overhead).
- Opciones de despliegue: al ser un modelo de la familia transformers, podría servirse con vLLM o TGI si se dispone de suficiente VRAM, pero no hay configuraciones probadas. llama.cpp no es compatible con arquitecturas MoE de Qwen3.5 sin adaptaciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base `kevin954/Affine-5dfqbbh8ev-sft` no tiene documentación pública accesible, y no se conocen otros modelos de la misma familia con métricas publicadas. Se puede mencionar que la arquitectura Qwen3.5 MoE se asemeja a otros MoE como Mixtral 8x7B o Qwen2.5-MoE, pero sin datos concretos de este checkpoint no es posible realizar una comparación objetiva.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al no haber sido evaluado públicamente, se desconocen los sesgos inherentes del modelo. Es probable que herede los sesgos del modelo base Qwen3.5, pero no hay evidencia.
- Riesgo de alucinación: sin benchmarks ni pruebas de robustez, el modelo puede generar información falsa o inconsistente, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados. No se recomienda su uso en aplicaciones multilingües sin verificación previa.
- Restricciones de licencia: la licencia es "no disponible". Esto impide cualquier uso comercial o redistribución sin permiso explícito del autor. Se debe contactar con `unconst` antes de cualquier uso.
- Cautela en producción: el propio autor indica que es un checkpoint intermedio no destinado a presentación oficial. No ha pasado por validación de calidad ni seguridad.
- Falta de soporte: al ser un repositorio con cero descargas y sin documentación, no hay comunidad ni mantenimiento. Cualquier problema técnico quedaría sin resolver.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r490-offline-dpo-hialpha-midrank-lobeta-extrasteps-merged
- Checkpoint relacionado (r368): https://huggingface.co/unconst/Affine-5czsc2fc98-r368-offline-dpo-long-merged
- LoRA intermedia (h49): https://huggingface.co/unconst/Affine-5czsc2fc98-h49-lora
- Checkpoint anterior (r67): https://huggingface.co/unconst/Affine-5czsc2fc98-r67-merged
