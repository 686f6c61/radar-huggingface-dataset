# tashom/aya-good-medical-r910

## Resumen

`tashom/aya-good-medical-r910` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario `tashom`, construido sobre el modelo base `CohereLabs/tiny-aya-global` de Cohere Labs. El adaptador está etiquetado como `medical` y `safety-research`, lo que sugiere un ajuste fino orientado a dominio sanitario y a investigación sobre seguridad en modelos de lenguaje. El repositorio ocupa 0,2 GB y contiene pesos en formato safetensors, coherente con un adaptador LoRA de pequeñas dimensiones y no con un modelo completo.

El modelo base, `tiny-aya-global`, pertenece a la familia Aya de Cohere Labs, orientada a cobertura multilingüe. Se trata de un modelo de tamaño reducido (la nomenclatura "tiny" así lo indica), pensado para despliegues con recursos limitados y para investigación multilingüe. El adaptador hereda por tanto las capacidades lingüísticas del base, aunque la información pública del repositorio no detalla el proceso de ajuste, los datos utilizados ni los resultados obtenidos.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación de acceso restringido (gated), con cero descargas en el momento de la consulta y sin documentación publicada sobre benchmarks, licencia o idiomas. Resulta útil como ejemplo de adaptación LoRA sobre modelos pequeños multilingües en el ámbito médico, pero no debe considerarse un modelo listo para producción sin una evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-global` |
| Parametros totales | No disponible (el adaptador ocupa 0,2 GB; los parámetros del base no se detallan en la información) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el base es multilingüe, pero el adaptador no declara idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |
| Libreria | peft |
| Modelo base | CohereLabs/tiny-aya-global |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del transformer base `CohereLabs/tiny-aya-global` sin modificar sus pesos originales. Esta técnica reduce drásticamente el número de parámetros entrenables y el espacio de almacenamiento (0,2 GB en este caso), y permite cargar el adaptador junto al base mediante la librería `peft`. La arquitectura subyacente es, por tanto, la del modelo Aya tiny de Cohere Labs, un transformer decoder-only de tamaño reducido.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición del corpus médico, ni sobre si se aplicaron técnicas de RLHF, DPO o supervisión con anotadores clínicos. Tampoco se documentan innovaciones técnicas específicas del adaptador (por ejemplo, rangos LoRA, capas objetivo o estrategias de regularización). Las etiquetas `medical` y `safety-research` indican la intención del autor, pero no sustituyen a una descripción metodológica que, en el momento de redactar esta ficha, no está publicada.

## Capacidades

- Generación de texto en el dominio médico, presumiblemente orientada a respuestas sobre salud, dado el etiquetado `medical`.
- Herencia de las capacidades multilingües del modelo base `tiny-aya-global`, aunque el adaptador no declara idiomas concretos.
- Investigación sobre seguridad: la etiqueta `safety-research` sugiere uso en estudios de robustez, sesgos o comportamientos inseguros en dominios sensibles.
- Ajuste ligero y modular: al ser un adaptador LoRA, puede combinarse con el base y sustituirse sin reentrenar el modelo completo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta una ventana de contexto específica del adaptador; la capacidad efectiva dependerá del base.

## Casos de uso

- Investigación académica sobre seguridad en IA sanitaria: el adaptador puede emplearse para estudiar cómo un modelo pequeño multilingüe responde a preguntas médicas sensibles y comparar su comportamiento con el base sin ajustar.
- Evaluación de técnicas LoRA en dominios especializados: sirve como caso de estudio de bajo coste para medir la eficacia de un adaptador de 0,2 GB frente a un ajuste completo en un modelo tiny.
- Prototipado de asistentes de información sanitaria en entornos controlados: útil para experimentar con respuestas a preguntas frecuentes de salud, siempre con revisión humana y sin uso clínico directo.
- Docencia y formación en ajuste fino: el par base + adaptador permite demostrar el flujo completo de PEFT (carga, fusión, inferencia) en hardware modesto.
- Experimentos de multilingüismo médico: al partir de un base multilingüe, puede utilizarse para comparar la calidad de respuestas sanitarias en distintos idiomas, aunque el adaptador no declare idiomas.
- Auditoría de sesgos y alucinaciones: el etiquetado `safety-research` lo hace adecuado para pruebas de estrés sobre afirmaciones médicas incorrectas y análisis de tasas de alucinación.
- Integración en pipelines de evaluación comparativa: puede incorporarse a un banco de pruebas que compare adaptadores LoRA médicos sobre el mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un adaptador LoRA sobre un modelo base "tiny", el requisito dominante es el del base, no el del adaptador (0,2 GB adicionales).
- GPU recomendadas: no disponibles. Por el tamaño del artefacto, es plausible que el base quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño y la cuantización del modelo base `tiny-aya-global`.
- Opciones de despliegue: carga mediante `peft` + `transformers`; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada y requeriría convertir el adaptador a los formatos correspondientes.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Acceso |
|---|---|---|---|---|---|
| `tashom/aya-good-medical-r910` | Adaptador LoRA sobre base tiny (0,2 GB) | No disponible | No disponible | safetensors (LoRA) | Restringido |
| `CohereLabs/tiny-aya-global` (base) | No disponible en la información | No disponible | No disponible en la información | No disponible | Público (referencia) |
| Adaptadores LoRA médicos genéricos | Variable | Variable | Variable | safetensors | Variable |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita a aspectos de formato, acceso y licencia, y en varios campos la información es insuficiente.

## Limitaciones y advertencias

- Ausencia total de documentación: no se publican datos de entrenamiento, evaluación, licencia ni idiomas, lo que impide validar su calidad o su idoneidad para cualquier uso.
- Riesgo elevado de alucinación en dominio médico: un adaptador LoRA sobre un modelo de tamaño reducido no garantiza precisión factual en afirmaciones sanitarias.
- Sesgos desconocidos: al no describirse el corpus de ajuste, no puede evaluarse el sesgo demográfico, lingüístico o clínico.
- Licencia no especificada: no puede confirmarse el uso comercial; debe contactarse con el autor o revisar las condiciones del acceso restringido.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción a la reproducibilidad.
- Cero descargas y un solo "like": no hay evidencia de uso comunitario ni de validación externa.
- No apto para uso clínico: no debe emplearse en diagnóstico, tratamiento ni triaje sin supervisión profesional y sin una evaluación regulatoria.
- Dependencia del modelo base: cualquier limitación de contexto o idioma del base se hereda; no se documenta una ventana de contexto específica.
- Fecha de creación futura en los metadatos (2026-11-08): conviene verificar la autenticidad y vigencia del repositorio antes de integrarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tashom/aya-good-medical-r910
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de PEFT: https://huggingface.co/docs/peft
