# wutt6678/Qwen3-VL-8B-Instruct-IDUnlearn-Bench-forget1-KL_Min

## Resumen

Este repositorio contiene un adaptador LoRA alojado por el usuario `wutt6678` bajo el identificador `Qwen3-VL-8B-Instruct-IDUnlearn-Bench-forget1-KL_Min`. No es un modelo completo, sino un ajuste fino parametrizado eficiente (PEFT/LoRA) de 0,2 GB que se monta sobre un checkpoint intermedio del propio autor, `outputs_3/mllmu_vanilla_qwen3-vl-8b`, derivado a su vez del modelo vision-lenguaje Qwen3-VL-8B-Instruct de Alibaba Cloud. Por sus tags y su nombre, apunta a un experimento de *machine unlearning* (desaprendizaje) sobre un banco de identidades (`IDUnlearn-Bench`), con la variante `forget1` y una estrategia de optimizacion etiquetada como `KL_Min`.

El modelo base subyacente, Qwen3-VL-8B-Instruct, es un transformer multimodal denso de aproximadamente 8000 millones de parametros que combina un codificador visual con un decodificador de lenguaje. Es relevante porque la familia Qwen3-VL introduce mejoras en percepcion y razonamiento visual, comprension de video y capacidades de agente, y se distribuye ampliamente en HuggingFace, Qualcomm AI Hub y Microsoft Foundry. Sin embargo, el artefacto concreto de esta ficha es un adaptador de investigacion con cero descargas y cero likes en el momento de la consulta, publicado el 1 de octubre de 2026, y su model card no aporta informacion sustantiva.

La relevancia de este repositorio es acotada: no esta pensado como modelo de produccion, sino como evidencia reproducible de un experimento de desaprendizaje de identidades sobre un VLM de 8B. Cualquier evaluacion practica debe asumir que la informacion de licencia, idiomas, contexto exacto y datos de entrenamiento no esta disponible para el adaptador, y que muchas capacidades observables provienen del modelo base y no del ajuste LoRA en si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA (PEFT) sobre un transformer multimodal denso (Qwen3-VL-8B); no disponible el detalle exacto del backbone |
| Parametros totales | No disponible para el adaptador (repo de 0,2 GB); el modelo base subyacente es de 8B nominales |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | No disponible para el adaptador; no confirmado en la informacion de la familia Qwen3-VL |
| Tipos de cuantizacion | No disponibles para el adaptador (pesos safetensors); el modelo base admite cuantizacion GGUF/AWQ/GPTQ segun el ecosistema |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el adaptador no la declara) |
| Formato de pesos | safetensors (adapter PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del modelo base sin modificar sus pesos originales. La libreria declarada es `peft` con la version 0.19.1 y la integracion con `transformers`. La dimension del repositorio (0,2 GB) es coherente con un adaptador de bajo rango y no con un modelo completo de 8B, que en precision de 16 bits ocuparia del orden de 16 GB. El modelo base declarado es `outputs_3/mllmu_vanilla_qwen3-vl-8b`, una ruta que sugiere un checkpoint propio del autor entrenado sobre datos del entorno MLLMU (multimodal LLM unlearning) a partir de Qwen3-VL-8B.

No hay informacion disponible sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni hiperparametros. La nomenclatura `IDUnlearn-Bench-forget1-KL_Min` apunta, como interpretacion razonable y no confirmada, a un experimento de desaprendizaje en el que se define un conjunto "forget" (identidades que deben olvidarse) y un conjunto "retain", y se optimiza un objetivo que minimiza la divergencia KL —presumiblemente para preservar el comportamiento del modelo en el conjunto de retencion mientras se suprime la informacion objetivo—. La etiqueta `arxiv:1910.09700` que aparece en los tags corresponde a la referencia de estimacion de emisiones de carbono del template de HuggingFace, no a un paper del modelo.

## Capacidades

- Generacion de texto y comprension de lenguaje heredadas del modelo base Qwen3-VL-8B-Instruct.
- Procesamiento multimodal: entrada de imagenes y texto para tareas de razonamiento visual, respuesta a preguntas sobre imagenes y descripcion de contenido visual (capacidad heredada, no verificada en el adaptador).
- Razonamiento con contexto extendido, segun las caracteristicas declaradas de la familia Qwen3-VL.
- Potencial soporte de tool calling y function calling heredado del modelo base, sin confirmacion en esta model card.
- Capacidades de agente y razonamiento multi-paso atribuibles a la familia Qwen3-VL, no verificadas en el adaptador.
- Soporte multilingue presumiblemente heredado del modelo base, aunque no declarado para el adaptador.
- Capacidad especifica del adaptador: supresion (desaprendizaje) del conjunto de identidades `forget1`, segun el nombre del experimento.

## Casos de uso

- Investigacion en machine unlearning: el adaptador sirve como punto de comparacion reproducible frente a otras estrategias (por ejemplo variantes con `KL_Min` frente a variantes sin ella) para medir cuanto se olvida y cuanto se retiene en un VLM de 8B.
- Auditoria de privacidad y cumplimiento: permite estudiar si un modelo multimodal puede dejar de exponer datos de identidad concretos, un requisito relevante para normativas de proteccion de datos antes de desplegar modelos entrenados con datos personales.
- Evaluacion de olvido en modelos multimodales: al heredar la capacidad de procesar imagenes, el adaptador permite comprobar si el olvido se mantiene tambien en las rutas visuales y no solo en texto.
- Red-teaming y evaluacion de robustez: util para comprobar si tecnicas de *jailbreak* o prompts adversariales reactivan la informacion supuestamente olvidada.
- Reproducibilidad academica: dado que el repositorio declara el modelo base y la version de PEFT, otro investigador puede reconstruir el entorno y repetir el experimento.
- Estudio de degradacion de capacidades: sirve para cuantificar la perdida de rendimiento general (texto y vision) tras aplicar un ajuste agresivo de desaprendizaje, comparando contra el checkpoint base sin adaptador.
- Prototipado de pipelines de *unlearning as a service*: como paso demostrativo en flujos que aplican adaptadores de olvido sobre modelos ya desplegados sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este adaptador. El autor no incluye ninguna tabla de resultados en la model card, y no se han encontrado evaluaciones externas en los resultados de la busqueda web. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de metricas especificas de desaprendizaje (por ejemplo accuracy en forget set y retain set) para este artefacto concreto.

## Requisitos de hardware

- El adaptador en si es ligero (0,2 GB) y no requiere hardware dedicado para almacenarse; el coste computacional lo determina el modelo base de 8B sobre el que se monta.
- Inferencia del modelo base en FP16/BF16: del orden de 16-18 GB de VRAM, mas el consumo adicional del codificador visual y de las activaciones.
- Inferencia cuantizada a 8 bits: aproximadamente 9-11 GB de VRAM.
- Inferencia cuantizada a 4 bits: aproximadamente 5-7 GB de VRAM.
- GPU recomendadas: H100 o A100 de 40/80 GB para maxima comodidad y lotes grandes; L40S, A10G o RTX 4090 (24 GB) para FP16 con lotes moderados; tarjetas consumer de 8-12 GB solo viables con cuantizacion agresiva.
- Si cabe en GPU de consumo: previsiblemente si, con cuantizacion a 4 bits en GPUs de 8-12 GB (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 3090/4090 con margen amplio).
- Opciones de despliegue: vLLM (con soporte multimodal), TGI, llama.cpp y Ollama para cuantizacion GGUF, y carga directa mediante `peft` + `transformers` para el flujo de investigacion. El adaptador puede fusionarse con el modelo base antes de exportar a GGUF o AWQ.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Naturaleza | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (wutt6678) | Base 8B + LoRA de 0,2 GB | Adaptador de desaprendizaje | Hereda vision del base | No disponible | HuggingFace, 0 descargas |
| Qwen3-VL-8B-Instruct (Qwen) | 8B denso | Modelo completo | Si | No confirmada en la informacion disponible | HuggingFace, Qualcomm AI Hub, Microsoft Foundry |
| wangkanai/qwen3-vl-8b-instruct | 8B (no confirmado) | Derivado/mirror | Si | No disponible | HuggingFace |
| Qwen3-VL (variantes MoE) | Densa y MoE | Familia completa | Si | No confirmada | Repositorio GitHub QwenLM/Qwen3-VL |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa entre estas opciones. La comparativa se limita a parametros, naturaleza, modalidad y disponibilidad.

## Limitaciones y advertencias

- La model card del adaptador no aporta informacion: secciones clave como uso previsto, sesgos, datos de entrenamiento y evaluacion estan marcadas como "More Information Needed".
- La licencia no esta declarada. Esto bloquea de facto cualquier uso comercial claro del adaptador y obliga a verificar la licencia del modelo base antes de cualquier despliegue.
- Riesgo de alucinacion: heredado del modelo base; el proceso de desaprendizaje puede alterar la calibracion del modelo, por lo que la tasa de alucinacion respecto al base no esta caracterizada.
- Efecto del desaprendizaje no verificado: no hay metricas que confirmen que la informacion objetivo se ha olvidado realmente ni que se ha preservado el resto de capacidades. El olvido puede ser superficial y reactivable con prompts adversariales.
- Riesgo de degradacion colateral: un ajuste agresivo de desaprendizaje puede deteriorar el rendimiento general en texto y vision mas alla de lo deseado.
- Idiomas y longitud de contexto del adaptador no especificados; asumir que coinciden con el base sin verificarlo es arriesgado.
- Trazabilidad limitada: el modelo base es una ruta local del autor (`outputs_3/mllmu_vanilla_qwen3-vl-8b`) que no es un identificador publico de HuggingFace, lo que dificulta reproducir exactamente el punto de partida.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- No apto para produccion en su estado actual: es un artefacto de investigacion sin evaluacion publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wutt6678/Qwen3-VL-8B-Instruct-IDUnlearn-Bench-forget1-KL_Min
- Modelo base upstream (Qwen3-VL-8B-Instruct): https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio GitHub de la familia Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_vl_8b_instruct
- Ficha en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3-vl-8b-instruct
- Derivado adicional encontrado en la busqueda: https://huggingface.co/wangkanai/qwen3-vl-8b-instruct
- Referencia citada en los tags (calculadora de impacto ambiental): https://arxiv.org/abs/1910.09700
