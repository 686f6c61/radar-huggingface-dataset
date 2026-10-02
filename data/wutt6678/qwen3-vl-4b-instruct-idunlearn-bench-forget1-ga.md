# wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-GA

## Resumen

El modelo `wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-GA` es un adaptador LoRA publicado con la libreria PEFT, no un modelo completo. Se aplica sobre un checkpoint base identificado como `outputs_3/mllmu_vanilla_qwen3-vl-4b`, que a su vez deriva de la familia multimodal Qwen3-VL-4B-Instruct de Alibaba Cloud. El repositorio ocupa 0,2 GB, un tamano coherente con pesos de adaptador y no con un modelo de 4.000 millones de parametros en precision completa.

La nomenclatura del identificador sugiere que se trata de un artefacto de investigacion en *machine unlearning*: "IDUnlearn" apuntaria a un benchmark de desaprendizaje sobre identidades, "forget1" al subconjunto de datos que se pretende olvidar y "GA" a *gradient ascent*, una de las tecnicas clasicas de desaprendizaje que maximiza la perdida sobre los ejemplos olvidados. Es relevante porque ejemplifica el flujo actual de publicar adaptadores de desaprendizaje en lugar de checkpoints completos, lo que abarata la reproducibilidad, pero tambien porque la model card esta practicamente vacia: no hay licencia, idiomas, datos de entrenamiento ni evaluacion.

El valor practico del artefacto es, por tanto, experimental y de auditoria, no de produccion. No se han publicado resultados de benchmarks ni hiperparametros, y cualquier uso directo queda condicionado a reconstruir el pipeline de entrenamiento a partir de la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo base multimodal vision-lenguaje de la familia Qwen3-VL (transformer denso, segun la informacion publica de Qwen3-VL) |
| Parametros totales | No disponible para el adaptador. El modelo base se denomina Qwen3-VL-4B (aproximadamente 4.000 millones de parametros). Tamano del repo del adaptador: 0,2 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el adaptador. Del modelo base Qwen3-VL-4B-Instruct existen distribuciones GGUF de terceros (por ejemplo, 8,40 GB en local-ai-zone), lo que habilita cuantizaciones Q4/Q5/Q8 |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |
| Modelo base declarado | `outputs_3/mllmu_vanilla_qwen3-vl-4b` (referencia local, no resoluble publicamente) |
| Version de PEFT | 0.19.1 |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador de bajo rango (LoRA) que modifica los pesos de atencion o proyeccion del modelo base sin reentrenar el cuerpo completo. La arquitectura subyacente corresponde a Qwen3-VL, un modelo vision-lenguaje de Alibaba Cloud que procesa texto e imagenes y que, segun la documentacion publica del proyecto, se distribuye en variantes densas y MoE, con mejoras en percepcion visual, comprension espacial y de video, y capacidades de interaccion con agentes. El checkpoint base intermedio, `mllmu_vanilla_qwen3-vl-4b`, no esta documentado en la informacion disponible; el prefijo "mllmu" sugiere un ajuste previo sobre un conjunto multimodal de tipo MLLMU, pero no hay confirmacion.

Respecto al procedimiento de entrenamiento del adaptador, la informacion disponible no incluye numero de tokens, composicion del dataset, hiperparametros, ni si hubo RLHF o DPO. El sufijo "GA" es compatible con *gradient ascent*, un metodo de desaprendizaje que invierte el signo del descenso de gradiente sobre el conjunto "forget1" para degradar la memorizacion de esos ejemplos. Esta interpretacion es una hipotesis razonable a partir del nombre, no un dato confirmado por el autor. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal ni similares) en el repositorio.

## Capacidades

- No se documentan capacidades especificas del adaptador en la model card; las capacidades funcionales provienen del modelo base Qwen3-VL-4B-Instruct.
- Segun la informacion publica de Qwen3-VL, la familia soporta comprension conjunta de texto e imagen, razonamiento visual, respuesta a preguntas visuales (VQA) y generacion de descripciones de imagenes.
- El proyecto Qwen3-VL declara mejoras en percepcion visual, comprension de dinamicas espaciales y de video, y en interaccion con agentes.
- Soporte de *tool calling* y de flujos de agente: declarado para la familia Qwen3-VL en la documentacion publica; no verificado para este adaptador concreto.
- Capacidades multilingues: no disponibles para el adaptador.
- Capacidad especial de "modo pensamiento" (*thinking mode*): no disponible para el adaptador; no se menciona en la informacion proporcionada.
- Advertencia: al tratarse de un adaptador sometido a un proceso de desaprendizaje, es esperable una degradacion parcial de las capacidades anteriores, que el autor no cuantifica.

## Casos de uso

- Investigacion en *machine unlearning*: el adaptador sirve como referencia reproducible de una intervencion tipo *gradient ascent* sobre un modelo vision-lenguaje de 4B, util para comparar curvas de olvido frente a otros metodos (gradient difference, NPO, SCRUB) en el mismo checkpoint base.
- Auditoria de cumplimiento del derecho al olvido: en un contexto de RGPD, permite estudiar si la eliminacion de una identidad concreta en un modelo multimodal es verificable, y con que coste en utilidad general.
- Evaluacion de robustez de benchmarks de desaprendizaje: el artefacto permite comprobar si la metrica de olvido del split "forget1" resiste ataques de re-aprendizaje o *fine-tuning* posterior sobre los datos supuestamente borrados.
- Reproduccion de experimentos academicos: al pesar solo 0,2 GB, el adaptador se puede distribuir y aplicar sobre el modelo base en un unico GPU de gama consumer, lo que facilita replicar un pipeline de desaprendizaje sin acceso a clústeres.
- Analisis de olvido catastrofico en modelos multimodales: permite medir la degradacion cruzada entre modalidades, es decir, si olvidar informacion textual de identidades afecta tambien a tareas de percepcion visual.
- *Red teaming* y estudio de fuga de informacion: sirve para comprobar si el conocimiento supuestamente eliminado se puede recuperar mediante *prompting* dirigido, ataques de *membership inference* o tecnicas de inversion.
- Formacion y docencia: como ejemplo didactico minimo de como se publica un adaptador PEFT de investigacion y de por que una model card incompleta limita la reutilizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tabla de evaluacion, y el repositorio no adjunta resultados del split "forget1" ni metricas de utilidad retenida sobre el modelo base.

## Requisitos de hardware

- VRAM del adaptador: despreciable (0,2 GB en disco); el coste real esta en cargar el modelo base.
- VRAM estimada para el modelo base de 4B (estimaciones estandar segun numero de parametros, no confirmadas por el autor): unos 8-9 GB en bf16/fp16, alrededor de 5-6 GB en int8 y aproximadamente 3-3,5 GB en cuantizacion de 4 bits.
- GPU consumer: cabe en tarjetas con 8 GB o mas de VRAM para cuantizaciones de 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); en bf16 conviene disponer de 12-16 GB.
- GPU de centro de datos: A100, H100 o L40S sobredimensionadas para inferencia de un 4B, utiles solo para lotes grandes o entrenamiento de adaptadores.
- Opciones de despliegue: `transformers` + `peft` para cargar adaptador y base conjuntamente; vLLM o TGI para servir el modelo base fusionado; llama.cpp u Ollama si se parte de una version GGUF del Qwen3-VL-4B-Instruct compatible.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-GA` | Adaptador LoRA sobre base de 4B | No disponible | No publicado | No disponible | Hugging Face, 0 descargas |
| `Qwen/Qwen3-VL-4B-Instruct` (modelo base de la familia) | ~4B | No disponible en la informacion proporcionada | El proyecto declara mejoras en percepcion visual y contexto extendido, sin cifras en los extractos disponibles | No disponible en los extractos consultados | Hugging Face, ampliamente distribuido |
| `outputs_3/mllmu_vanilla_qwen3-vl-4b` (checkpoint intermedio declarado) | ~4B (heredado) | No disponible | No publicado | No disponible | Referencia local; no resoluble publicamente |
| Otros adaptadores de desaprendizaje sobre Qwen3-VL | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la informacion consultada |

## Limitaciones y advertencias

- Model card practicamente vacia: autor, financiacion, tipo de modelo, idiomas, licencia y datos de entrenamiento figuran como "[More Information Needed]".
- Licencia no declarada: no se puede asumir uso comercial permitido ni siquiera heredado del modelo base; hay que verificar la licencia de Qwen3-VL por separado antes de cualquier despliegue.
- Sin datos de evaluacion: no hay evidencia publicada de que el desaprendizaje funcione ni de cuanto rendimiento general se ha sacrificado.
- Riesgo de olvido catastrofico: el *gradient ascent* es un metodo agresivo que puede degradar capacidades no relacionadas con el conjunto "forget1".
- El desaprendizaje no garantiza la eliminacion real de la informacion: el conocimiento puede recuperarse mediante *fine-tuning* posterior, *prompting* dirigido o ataques de inversion. No debe tratarse como una garantia de privacidad.
- El checkpoint base declarado es una ruta local no publica, por lo que la reproducibilidad exacta del adaptador no esta asegurada.
- Riesgo de alucinacion y sesgos: heredados del modelo base multimodal; no se documenta ninguna mitigacion adicional.
- Cero descargas y cero valoraciones en el momento de la consulta: artefacto sin validacion externa por parte de la comunidad.
- La fecha de creacion registrada (2026-10-01) es posterior a la de la mayoria de artefactos de la familia; conviene tratar los metadatos temporales con cautela.
- No apto para produccion sin una evaluacion propia previa de utilidad retenida, alineacion y seguridad.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-GA
- Modelo base de la familia: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- README del modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/blob/main/README.md
- Repositorio oficial de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Ficha de Qwen3-VL-4B-Instruct en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_vl_4b_instruct
- Distribucion GGUF de terceros de Qwen3-VL-4B-Instruct: https://local-ai-zone.github.io/models/qwen3-vl-4b-instruct.html
- Referencia citada en los tags del repositorio (calculadora de impacto de carbono): https://arxiv.org/abs/1910.09700
