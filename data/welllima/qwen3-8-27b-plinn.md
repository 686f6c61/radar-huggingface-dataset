# welllima/Qwen3.8-27B-Plinn

## Resumen

Qwen3.8-27B-Plinn es un checkpoint "abliterated" (sin mecanismos de rechazo) del modelo base Qwen/Qwen3.8-27B, publicado por el usuario welllima bajo el sello Plinn. Se ha generado aplicando abliteración direccional sobre los pesos asociados a la conducta de rechazo, mediante el pipeline Heretic, que emplea optimización TPE (Tree-structured Parzen Estimator) para co-minimizar la tasa de rechazos y la divergencia KL respecto al modelo original. El objetivo declarado es conservar razonamiento y coherencia del base mientras se eliminan las respuestas de negativa.

El modelo conserva la arquitectura y el tamaño del base: 27.356.728.560 parámetros totales (unos 27,36 mil millones), pesos en safetensors y un repositorio de 54,7 GB, lo que sugiere pesos en bfloat16. La model card no detalla la arquitectura interna (transformer denso o MoE), la longitud de contexto ni el volumen de datos de entrenamiento del base, por lo que esos datos figuran como no disponibles en esta ficha.

Su relevancia es acotada pero específica: cubre la demanda de variantes sin censura de modelos Qwen de gran tamaño, con licencia Apache 2.0 y soporte declarado de portugués e inglés. El autor indica una evaluación interna con el benchmark de Heretic sobre 100 prompts con aproximadamente 0/100 rechazos y una KL de aproximadamente 0,37 frente al base. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.8-27B; tag qwen3_5) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo de 54,7 GB es compatible con bfloat16) |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen/Qwen3.8-27B. La model card no describe la arquitectura interna del base (tipo de transformer, atención, posible componente MoE), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO. El tag `qwen3_5` sugiere que el base pertenece a la familia Qwen 3.5, pero no se aportan más detalles técnicos.

La innovación destacable es el método de modificación: abliteración de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada con el pipeline Heretic. Los hiperparámetros del mejor trial (72 del TPE) son `start_layer_index=28`, `end_layer_index=62`, `preserve_good_behavior_weight=0.1343`, `steer_bad_behavior_weight=0.0812`, `overcorrect_relative_weight=0.9839` y `neighbor_count=12`. Es decir, la ablación se aplica sobre las capas 28 a 62, con pesos que priorizan preservar el comportamiento correcto y limitar la sobrecorrección. El resultado declarado es de aproximadamente 0/100 rechazos con una divergencia KL de aproximadamente 0,37 respecto al base, lo que indica una desviación moderada de la distribución original.

Además, el `chat_template.jinja` inyecta por defecto un system prompt de identidad: "Sou o Plinn, um modelo de linguagem desenvolvido pela Plinn, criado por Plinn." Por tanto, el modelo se identifica como Plinn ante preguntas de identidad, no como Qwen.

## Capacidades

- Generación de texto en portugués e inglés, heredada del modelo base.
- Razonamiento y coherencia conversacional preservados según la evaluación del autor (KL baja frente al base).
- Ausencia práctica de rechazos: aproximadamente 0/100 negativas en el benchmark interno de Heretic.
- Identidad personalizada inyectada vía chat template (se presenta como Plinn).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidades multilingües limitadas a los idiomas declarados (pt, en); no se garantiza el rendimiento en castellano u otros idiomas.

## Casos de uso

- Generación creativa sin restricciones temáticas: el modelo es adecuado para ficción, guiones o narrativa que aborden temas sensibles, ya que la abliteración elimina las negativas del base. Requiere revisión humana y cumplimiento legal.
- Investigación sobre alineación y seguridad: sirve como contrapunto controlado frente al base Qwen3.8-27B para estudiar cómo cambia la distribución de respuestas con una KL de aproximadamente 0,37 y qué comportamientos emergen al retirar los mecanismos de rechazo.
- Evaluación de robustez de filtros: útil para probar clasificadores de contenido y sistemas de moderación frente a un modelo que no se autocensura.
- Asistente conversacional en portugués: con 27,36 mil millones de parámetros y pesos bfloat16, puede desplegarse en infraestructura con GPU de 80 GB para conversaciones multi-turno en portugués, siempre que el caso de uso no exija salvaguardas de contenido.
- Prototipado de personajes con identidad fija: el chat template inyecta la identidad Plinn, lo que simplifica demos de asistentes con personalidad definida sin prompt engineering adicional.
- Generación de texto en inglés para tareas generales: al heredar el base, puede emplearse en redacción, resumen o reescritura, con la advertencia de que no hay benchmarks publicados que confirmen su calidad frente al original.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Referencia |
|---|---|---|
| Tasa de rechazos (benchmark Heretic, 100 prompts) | ~0/100 | Model card del autor |
| Divergencia KL respecto al base | ~0,37 | Model card del autor |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 54,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere GPU de 80 GB (A100 80GB, H100 80GB) para inferencia cómoda.
- Cuantización a 8 bits: alrededor de 27-28 GB de pesos, viable en una RTX 4090 (24 GB) solo con cuantizaciones más agresivas o descarga parcial; en 4 bits (aproximadamente 14-16 GB) cabe en RTX 4090, RTX 3090 o similar, con pérdida de calidad no evaluada.
- No se han publicado GGUF ni cuantizaciones oficiales en la información disponible; sería necesario generarlas a partir de los safetensors.
- Despliegue: transformers con `device_map="auto"` y `torch_dtype="bfloat16"` según la model card; vLLM, TGI o llama.cpp son opciones plausibles pero no están documentadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Plinn | 27,36 B | no disponible | Apache 2.0 | Abliterated, sin rechazos, identidad Plinn |
| Qwen/Qwen3.8-27B (base) | 27,36 B | no disponible | Apache 2.0 | Modelo original con alineación y rechazos |
| Otras variantes abliterated de Qwen | no disponible | no disponible | habitualmente Apache 2.0 | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido ofensivo, ilegal o peligroso; el autor declina responsabilidad por uso indebido y exige cumplimiento de la legislación aplicable.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; la abliteración puede alterar comportamientos del base más allá del rechazo, pese a la KL de aproximadamente 0,37.
- Idiomas limitados a portugués e inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada; no se debe asumir la del base sin verificarla.
- La identidad inyectada por defecto (Plinn) puede ser indeseable en producción; requiere editar el chat template si se necesita otra identidad.
- Solo 23 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria ni cuantizaciones de terceros.
- Licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin salvaguardas en productos orientados al usuario final conlleva riesgos legales y reputacionales.
- No hay garantía de que el base Qwen3.8-27B exista o sea estable como referencia pública; conviene verificar el checkpoint original antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/welllima/Qwen3.8-27B-Plinn
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pipeline Heretic: no disponible en la información proporcionada
- Paper de abliteración / ARA: no disponible en la información proporcionada
- Demos o repositorios adicionales: no disponibles en la información proporcionada
