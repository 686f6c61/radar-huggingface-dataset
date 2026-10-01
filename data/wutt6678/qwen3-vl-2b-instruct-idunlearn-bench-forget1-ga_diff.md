# wutt6678/Qwen3-VL-2B-Instruct-IDUnlearn-Bench-forget1-GA_diff

## Resumen

Este repositorio no es un modelo completo, sino un adaptador LoRA (PEFT) publicado por el usuario wutt6678 sobre un checkpoint denominado `outputs_3/mllmu_vanilla_qwen3-vl-2b`, que a su vez deriva de Qwen3-VL-2B-Instruct, el modelo vision-lenguaje denso de 2.000 millones de parametros desarrollado por el equipo Qwen de Alibaba Cloud. El nombre del repositorio lo situa en el contexto del benchmark IDUnlearn-Bench, con la etiqueta `forget1` y el sufijo `GA_diff`, lo que apunta a un experimento de desaprendizaje automatico (machine unlearning) orientado a eliminar un subconjunto concreto de conocimiento del modelo base.

La relevancia de esta ficha es fundamentalmente metodologica: se trata de un artefacto de investigacion reproducible, no de un modelo pensado para produccion. Permite a otros investigadores inspeccionar como afecta una intervencion de olvido selectivo a un VLM pequeno, comparar variantes de la misma familia de experimentos y reutilizar el adaptador como linea base en estudios de supresion de conocimiento, privacidad o seguridad multimodal.

La model card del autor es la plantilla por defecto de HuggingFace sin rellenar: no declara licencia, idiomas, datos de entrenamiento, hiperparametros ni resultados de evaluacion. Todo lo que se puede afirmar con rigor procede de los metadatos del repositorio y de la documentacion publica del modelo base, y se indica explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer vision-lenguaje denso; modelo base: Qwen3-VL-2B-Instruct |
| Parametros totales | no disponible (el repositorio ocupa 0,1 GB; el modelo base tiene 2B) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Adaptador en safetensors; el modelo base cuenta con versiones GGUF de terceros (NexaAI) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (ni el adaptador ni la model card la declaran) |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`, version de framework 0.19.1) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) almacenado en safetensors y cargable mediante la libreria PEFT 0.19.1 sobre un transformer multimodal denso. El modelo base efectivo es `outputs_3/mllmu_vanilla_qwen3-vl-2b`, un checkpoint intermedio cuyo nombre sugiere un ajuste "vanilla" sobre Qwen3-VL-2B-Instruct dentro del flujo experimental del benchmark MLLMU/IDUnlearn. La familia Qwen3-VL combina un codificador visual con un decodificador de lenguaje y esta disponible en variantes densas y MoE; la variante de 2B pertenece a las densas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el regimen de precision ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El sufijo `GA_diff` del nombre del repositorio sugiere, como interpretacion y no como dato confirmado, una variante basada en ascenso de gradiente (gradient ascent) con alguna forma de diferencia o regularizacion para el olvido selectivo, una tecnica habitual en la literatura de machine unlearning. El unico hiperparametro verificable es el framework: PEFT 0.19.1.

## Capacidades

- Al ser un adaptador, hereda las capacidades del modelo base Qwen3-VL-2B-Instruct: comprension conjunta de texto e imagen para tareas de razonamiento multimodal.
- Respuesta a preguntas visuales (VQA) y generacion de descripciones de imagen, segun la documentacion publica de Qwen3-VL.
- Comprension de contenido visual con estructura espacial y dinamica de video, de acuerdo con la descripcion oficial de la familia Qwen3-VL.
- Interaccion tipo agente y capacidades de tool calling descritas por el equipo Qwen para la familia Qwen3-VL; no verificadas para este adaptador concreto.
- Generacion de texto en el rango de modelos de 2B de la serie Qwen, con el multilingueismo propio de la familia; la lista concreta de idiomas no esta disponible.
- Capacidad especifica del adaptador: alteracion controlada del comportamiento del modelo base para olvidar un subconjunto de conocimiento (`forget1`), objeto del experimento.
- No disponible: thinking mode explicito, soporte de audio, ni cualquier otra capacidad especial que el autor no haya documentado.

## Casos de uso

- Investigacion en machine unlearning: el adaptador sirve como punto de partida reproducible para medir cuanto conocimiento se ha eliminado realmente del modelo base y cuanto se ha degradado el resto de capacidades.
- Comparacion de metodos de olvido: `GA_diff` puede contrastarse con otras variantes de la misma familia de experimentos para evaluar que estrategia de supresion preserva mejor el rendimiento general.
- Auditoria de privacidad: util para estudiar si un VLM pequeno puede forzarse a no reproducir informacion sensible presente en sus datos de entrenamiento.
- Evaluacion de seguridad multimodal: permite analizar si el olvido selectivo aplicado a texto se mantiene cuando la misma consulta se formula como imagen o pregunta visual.
- Analisis de olvido catastrofico: al ser un modelo de 2B, es viable medir con recursos modestos como afecta la intervencion a tareas no objetivo (VQA, captioning) mediante baterias de evaluacion.
- Docencia y prototipado: por su tamano y su naturaleza de adaptador, es adecuado para que estudiantes reproduzcan un pipeline completo de desaprendizaje en una unica GPU de consumo.
- Generacion de variantes controladas: para equipos que necesiten un VLM que evite deliberadamente un tema concreto y quieran validar ese comportamiento antes de escalar el metodo a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,1 GB, por lo que el almacenamiento no es un factor limitante.
- La inferencia requiere cargar el modelo base Qwen3-VL-2B-Instruct completo. Estimacion orientativa, no confirmada por el autor: entre 5 y 7 GB de VRAM en fp16/bf16 sumando pesos del decodificador, codificador visual y cache KV para contextos moderados; en cuantizacion de 4 bits las versiones GGUF del base reducen el requisito aproximadamente a 2-3 GB.
- GPU recomendadas segun el caso: cualquier GPU de consumo con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) para fp16 con contexto corto; RTX 4090, A100 o H100 no son necesarias para un modelo de 2B salvo que se busque throughput elevado o lotes grandes.
- Cabe en GPU de consumo: si, es uno de los puntos fuertes del modelo base.
- Opciones de despliegue: carga directa con Transformers + PEFT para el adaptador; llama.cpp u Ollama estan disponibles en la practica solo si se fusiona el adaptador con un base en formato GGUF, ya que el ecosistema GGUF no consume adaptadores LoRA PEFT directamente.
- Servidores de inferencia como vLLM o TGI pueden servir el modelo base fusionado; la compatibilidad con la carga dinamica de este adaptador concreto no esta documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`Qwen3-VL-2B-Instruct-IDUnlearn-Bench-forget1-GA_diff`) | Adaptador LoRA PEFT | no disponible (base de 2B) | no disponible | no disponible | HuggingFace, 0 descargas |
| `outputs_3/mllmu_vanilla_qwen3-vl-2b` | Checkpoint base del adaptador | no disponible | no disponible | no disponible | Referenciado como modelo base |
| Qwen3-VL-2B-Instruct | VLM denso original | 2B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace, repo oficial de Qwen; GGUF de terceros (NexaAI); Qualcomm AI Hub |

No se dispone de datos de rendimiento de ninguna de las tres variantes, por lo que la comparativa se limita a tipo de artefacto y procedencia.

## Limitaciones y advertencias

- Model card sin rellenar: la ausencia de licencia explicita impide determinar si el uso comercial esta permitido. No se debe asumir la licencia del modelo base sin verificarla en su propio repositorio.
- Es un adaptador de investigacion, no un modelo listo para produccion: no hay evaluacion publicada de calidad, robustez ni seguridad.
- Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia total de validacion por parte de la comunidad.
- El objetivo del entrenamiento es eliminar conocimiento del modelo base. Esto puede degradar capacidades generales de forma no documentada y producir respuestas evasivas o incoherentes fuera del dominio objetivo.
- Riesgo de alucinacion: inherente al modelo base de 2B y no cuantificado para este adaptador; el olvido selectivo puede aumentar la inseguridad del modelo en temas relacionados.
- Trazabilidad limitada: el modelo base es un checkpoint intermedio no publicado de forma independiente, lo que dificulta reproducir exactamente el punto de partida del experimento.
- Sin datos de sesgos, idiomas soportados ni cobertura multilingue, no es posible evaluar su comportamiento en castellano ni en otros idiomas.
- Las estimaciones de VRAM de esta ficha son orientativas y derivadas del tamano del modelo base, no mediciones reales sobre este adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/wutt6678/Qwen3-VL-2B-Instruct-IDUnlearn-Bench-forget1-GA_diff
- Modelo base original: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Discusion con enlace a GGUF de terceros: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct/discussions/2
- GGUF de NexaAI: https://huggingface.co/NexaAI/Qwen3-VL-2B-Instruct-GGUF
- Repositorio oficial de la familia Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/qwen3_vl_2b_instruct
- README de Qwen3-VL-2B-Instruct en el proyecto RoVLA: https://github.com/HCPLab-SYSU/RoVLA/blob/main/gr00t/model/modules/Qwen/Qwen3-VL-2B-Instruct/README.md
- Paper referenciado en la model card (calculadora de impacto de carbono, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
