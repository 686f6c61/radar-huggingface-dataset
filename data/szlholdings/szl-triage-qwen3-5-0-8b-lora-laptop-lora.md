# SZLHOLDINGS/szl-triage-qwen3.5-0.8b-lora-laptop-lora

## Resumen

szl-triage-qwen3.5-0.8b-lora-laptop-lora es un artefacto de investigación publicado por SZLHOLDINGS en Hugging Face. Se presenta como un adaptador LoRA (el nombre incluye "lora-laptop-lora", lo que sugiere un adaptador sobre otro adaptador) asociado a un modelo base Qwen3.5 de 0,8 mil millones de parámetros, orientado a tareas de triaje ("triage"). Sin embargo, la model card no documenta el modelo base exacto, los datos de entrenamiento ni la configuración del adaptador.

El aspecto más relevante de esta ficha es su naturaleza experimental y su falta de evidencia verificable. La propia model card, reescrita el 14 de noviembre de 2026, retira explícitamente todas las afirmaciones de evaluación, benchmarks y contrato de entrenamiento que contenía una versión anterior, alegando que la doctrina interna del autor ("fail-closed") no permite verificar dichas afirmaciones por modelo. El repositorio aparece etiquetado como "research-artifact", "experimental" y "private-estate", y su tamaño es de 0,0 GB según los metadatos, lo que resulta inconsistente con la presencia de pesos safetensors.

En la práctica, se trata de un artefacto de registro privado con licencia Apache 2.0 pero sin documentación técnica sustantiva, sin idiomas declarados, sin pipeline definido y con 31 descargas. No es un modelo recomendable para uso en producción ni para evaluación comparativa, ya que no existe información verificable sobre su comportamiento, su entrenamiento o sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere adaptador LoRA sobre Qwen3.5-0.8B; no confirmado en la model card) |
| Parametros totales | no disponible (el nombre indica 0,8B para el modelo base; el tamano del adaptador no se documenta) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

No hay información verificable sobre la arquitectura. El identificador del repositorio sugiere un adaptador LoRA sobre un modelo Qwen3.5 de 0,8 mil millones de parámetros, pero la model card no confirma el modelo base, la arquitectura del transformer subyacente ni la naturaleza exacta del adaptador (el sufijo "lora-laptop-lora" podría indicar una composición de adaptadores, sin que exista documentación al respecto).

La model card indica explícitamente que no se realiza ninguna afirmación sobre contrato de entrenamiento, tabla de hiperparámetros o conjunto de datos. Una versión anterior de la tarjeta incluía una tabla de entrenamiento QLoRA y un model-index con resultados de una "battery" de evaluación, pero el autor los eliminó en la reescritura del 14 de noviembre de 2026 por no poder verificarlos por modelo. No se dispone de información sobre volumen de tokens, composición del dataset, RLHF, DPO ni ninguna innovación técnica.

## Capacidades

- No se documenta ninguna capacidad verificada para este artefacto.
- El nombre sugiere una función de triaje (clasificación o enrutamiento de casos), pero no hay evidencia publicada que lo confirme.
- No se declara soporte de tool calling, function calling ni agentes.
- No se declaran capacidades multilingües ni idiomas soportados.
- No se declaran modos especiales (thinking, visión, audio).
- Cualquier capacidad atribuible al modelo base Qwen3.5-0.8B no está confirmada para este adaptador concreto.

## Casos de uso

No es posible recomendar casos de uso concretos con base en la información disponible, ya que el autor no documenta el comportamiento del artefacto ni aporta evaluaciones. Los siguientes escenarios son hipotéticos y requerirían validación propia antes de cualquier uso:

- Triaje de tickets de soporte: el nombre del artefacto sugiere clasificación o enrutamiento de incidencias, pero no hay evidencia de que el adaptador funcione para ello.
- Experimentación en investigación sobre adaptadores LoRA: el artefacto podría servir como objeto de estudio de composición de adaptadores, dado el sufijo "lora-laptop-lora".
- Reproducción de pipelines internos de SZLHOLDINGS: solo tendría sentido dentro del ecosistema del autor, sin documentación pública.
- Pruebas de integración con safetensors y frameworks de PEFT: viable técnicamente si se conoce el modelo base, que no se especifica.
- Evaluación comparativa de adaptadores pequeños: no recomendable sin una línea base documentada.
- Despliegue en producción: desaconsejado por ausencia total de evidencia de calidad, seguridad y comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card retira explícitamente cualquier resultado de evaluación o "battery" que hubiera figurado en revisiones anteriores.

## Requisitos de hardware

- VRAM estimada: no disponible. Para un modelo base de 0,8B en fp16 se situaría en torno a 1,6 GB de pesos, y en cuantización de 4 bits alrededor de 0,5 GB, pero estos cálculos son orientativos y no están confirmados por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí para un modelo de 0,8B, pero no verificado.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables documentados en la información proporcionada, y el propio autor no establece comparaciones ni referencias a alternativas.

## Limitaciones y advertencias

- Ausencia total de evidencia verificable: la model card retira benchmarks, contrato de entrenamiento y resultados de evaluación.
- Modelo base no confirmado: el identificador sugiere Qwen3.5-0.8B, pero no se documenta la revisión ni la equivalencia de pesos.
- Repositorio de 0,0 GB según metadatos, inconsistente con la presencia de pesos safetensors; conviene verificar los ficheros reales antes de cualquier uso.
- Etiquetado como "experimental" y "research-artifact": no apto para producción sin validación propia.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.
- Idiomas soportados no declarados.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación impide garantizar el cumplimiento de obligaciones derivadas del modelo base.
- Sin pipeline definido ni idiomas declarados en los metadatos de Hugging Face.
- El autor aplica una doctrina "fail-closed" que elimina afirmaciones no verificables; esto es honesto, pero deja el artefacto sin información útil para terceros.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-triage-qwen3.5-0.8b-lora-laptop-lora
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
