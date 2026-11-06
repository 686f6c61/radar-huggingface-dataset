# superisaac1262/gemma4-e4b-frontier-distilled-v10.3

## Resumen

Gemma-4-E4B Frontier Distilled v10.3 es un adaptador LoRA (PEFT) publicado por el usuario superisaac1262 sobre el modelo base `google/gemma-4-E4B-it`. No se trata de un modelo completo, sino de un ajuste fino orientado a tareas agénticas: uso de herramientas, generación de código y razonamiento multi-paso. El autor lo presenta como el resultado de destilar trayectorias de modelos "frontera" en un corpus propio de 984 millones de tokens.

El interés del adaptador reside en su enfoque: en lugar de reentrenar un modelo grande, aplica QLoRA sobre un modelo base ya instruido para reforzar comportamientos de agente (tool calling, planificación, código). El repositorio ocupa apenas 0,1 GB, lo que confirma que solo contiene los pesos del adaptador y no el modelo completo. La ficha del autor no documenta evaluación, idiomas soportados ni detalles del corpus más allá del nombre del dataset.

La información pública disponible es muy limitada: 15 descargas, ningún "like" y una model card mínima. Cualquier uso en producción debería ir precedido de una evaluación propia, ya que no hay benchmarks publicados ni comparativas con el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base `google/gemma-4-E4B-it`); módulos q_proj, k_proj, v_proj, o_proj |
| Parámetros totales | No disponible (el adaptador LoRA con r=32 y alpha=64 sobre 4 módulos de atención; el modelo base no se especifica en la información proporcionada) |
| Parámetros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 1024 tokens durante el entrenamiento; la del modelo base no se detalla en la información proporcionada |
| Tipos de cuantización | Entrenado en QLoRA 4-bit nf4 con cómputo bf16; el adaptador se puede cargar sobre el base en 4-bit o bf16 |
| Idiomas soportados | No disponible |
| Licencia | "other" (heredada del modelo base Gemma; consultar términos de Google) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA: el modelo base se carga en 4 bits (nf4) con cómputo en bfloat16, y se inyectan matrices de bajo rango (r=32, alpha=64) únicamente en las proyecciones de atención (q_proj, k_proj, v_proj, o_proj). No se ajustan las capas MLP ni los embeddings, lo que limita el coste computacional pero también el alcance del ajuste. El entrenamiento se realizó en una GPU de consumo Intel Arc B580 de 12 GB, lo que da una idea de la escala: 82.040 pasos sobre secuencias de 1.024 tokens.

El corpus de entrenamiento es `superisaac1262/frontier-agentic-corpus-v10.3`, descrito como 984 millones de tokens de trayectorias de código, uso de herramientas y razonamiento agéntico. La model card no detalla la composición del dataset, el proceso de destilación (qué modelos "frontera" se usaron como profesores), ni si hubo etapas de RLHF o DPO. Tampoco se documenta la mezcla de idiomas ni la proporción de ejemplos de código frente a tool calling.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Gemma-4-E4B-it.
- Uso de herramientas (tool calling / function calling), reforzado por el corpus de destilación agéntica.
- Razonamiento multi-paso y planificación de agentes, según la orientación declarada del adaptador.
- Generación de código, alineada con el corpus de trayectorias de programación.
- Capacidades multilingües: no documentadas en la información proporcionada; dependen del modelo base.
- Modo "thinking" o vision: no disponible en la información proporcionada.

## Casos de uso

- Agentes de código en pipelines de CI/CD: el adaptador refuerza la generación de parches y la invocación de herramientas, por lo que puede integrarse en flujos que requieran llamadas a funciones (tests, linters, despliegues) sobre el modelo base.
- Asistentes de terminal o IDE con tool calling: al estar entrenado sobre trayectorias agénticas, encaja en entornos donde el modelo debe decidir qué comando ejecutar y encadenar resultados.
- Automatización de tareas de refactorización: el ajuste sobre código permite proponer cambios acotados, siempre que se validen con tests automáticos.
- Prototipado de agentes multi-paso en investigación: útil para experimentar con destilación agéntica sobre un modelo pequeño y desplegable en hardware de consumo.
- Evaluación de técnicas de destilación: sirve como caso de estudio de QLoRA sobre corpus sintéticos de trayectorias, comparando con el base sin ajustar.
- Despliegue en estaciones de trabajo con GPU de 12 GB: al ser un adaptador sobre un base pequeño y cuantizable en 4 bits, permite experimentar localmente sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: depende del modelo base `gemma-4-E4B-it`; con cuantización 4-bit nf4 y el adaptador, el autor lo entrenó en una GPU de 12 GB (Intel Arc B580), por lo que la inferencia en 4 bits debería caber en GPUs de consumo con 8-12 GB.
- GPU recomendadas: Intel Arc B580 (usada en entrenamiento); para inferencia, cualquier GPU con al menos 8 GB en 4-bit (RTX 3060/4060, RTX 4070, etc.). Para bf16 completo se necesitaría más VRAM, no especificada.
- Cabe en GPU de consumo: sí, en cuantización 4-bit según el hardware de entrenamiento declarado.
- Opciones de despliegue: transformers + peft (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información proporcionada (requerirían conversión del adaptador y del base).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-E4B Frontier Distilled v10.3 | Adaptador LoRA sobre base no especificado | 1024 (entrenamiento) | other | safetensors (PEFT) | Sin benchmarks publicados |
| google/gemma-4-E4B-it (base) | No disponible | No disponible | Gemma | safetensors | Modelo base instruido; referencia obligada |
| Otros adaptadores agénticos sobre Gemma | No disponible | No disponible | Variable | PEFT | No se dispone de comparativas públicas en la información proporcionada |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No hay benchmarks publicados: el rendimiento frente al modelo base es desconocido y debe evaluarse antes de cualquier uso en producción.
- Contexto de entrenamiento limitado a 1024 tokens: el adaptador puede degradar el comportamiento en ventanas más largas si el base las soporta.
- Solo se ajustan las proyecciones de atención; las capas MLP y los embeddings no se modifican, lo que limita la profundidad del ajuste.
- Corpus de destilación opaco: no se especifican los modelos profesores ni la composición del dataset, lo que dificulta auditar sesgos o calidad.
- Riesgo de alucinación inherente al modelo base, potencialmente amplificado por trayectorias sintéticas de agentes.
- Licencia "other" heredada del modelo base Gemma: es imprescindible revisar los términos de Google antes de uso comercial.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del base y no está garantizado.
- Repositorio con muy poca tracción (15 descargas, 0 likes): sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/superisaac1262/gemma4-e4b-frontier-distilled-v10.3
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/superisaac1262/frontier-agentic-corpus-v10.3
- PEFT: https://github.com/huggingface/peft
