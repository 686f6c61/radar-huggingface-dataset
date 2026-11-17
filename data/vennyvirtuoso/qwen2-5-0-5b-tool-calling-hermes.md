# vennyvirtuoso/qwen2.5-0.5b-tool-calling-hermes

## Resumen

`vennyvirtuoso/qwen2.5-0.5b-tool-calling-hermes` es un ajuste fino mediante LoRA del modelo base Qwen2.5-0.5B-Instruct, orientado especificamente a la generacion de llamadas a funciones y herramientas en formato JSON estructurado. Lo publica el usuario de Hugging Face `vennyvirtuoso` bajo licencia Apache 2.0, y esta pensado para escenarios de agentes y tool calling en entornos con recursos muy limitados, incluyendo despliegue en el borde (edge AI) y microservicios de baja latencia.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5 en su variante de 0,5 mil millones de parametros, y se entrena sobre el dataset `NousResearch/hermes-function-calling-v1` con PEFT/LoRA. Su propuesta de valor es ofrecer un modelo ultracompacto capaz de emitir llamadas a herramientas con precision razonable sobre esquemas de herramientas no vistas durante el entrenamiento, evitando el coste de APIs de modelos frontera.

Es relevante en el contexto actual de agentes autonomos ligeros: permite ejecutar bucles de razonamiento con herramientas en local, con una huella de memoria muy reducida y sin dependencia de servicios externos. No obstante, se trata de un ajuste fino reciente, con cero descargas y cero likes en el momento de redactar esta ficha, y con datos de evaluacion limitados a metricas de perplejidad y perdida sobre el split de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el autor menciona precision mixta bfloat16/fp16 en entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA; requiere cargar el modelo base por separado) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de 0,5 mil millones de parametros. El adaptador se distribuye en formato PEFT y se carga junto al modelo base mediante `PeftModel.from_pretrained`. El entrenamiento utiliza el dataset `NousResearch/hermes-function-calling-v1`, centrado en la generacion de llamadas a funciones en formato JSON con etiquetas `<tool_call>`, y se realizo en precision mixta (bfloat16/fp16).

El autor declara haber evaluado sobre splits de test disjuntos por grupo, con categorias no vistas durante el entrenamiento como "Web Browser Agent" y "Web APIs", para medir la generalizacion fuera de distribucion. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es el formato de salida estructurado tipo Hermes para tool calling sobre un modelo de muy bajo coste computacional.

## Capacidades

- Generacion de llamadas a funciones y herramientas en JSON estructurado con etiquetas `<tool_call>`.
- Tool calling y function calling con esquemas definidos en el prompt del sistema.
- Soporte de agentes y razonamiento multi-paso basico, orientado a ejecucion de herramientas.
- Generacion de texto conversacional (heredada del modelo base Instruct).
- Capacidad de generalizacion a esquemas de herramientas no vistos durante el entrenamiento (segun el autor).
- Integracion con `transformers`, `peft`, `sentence-transformers` y pipelines estandar de Hugging Face.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o modo thinking explicito: no disponibles.

## Casos de uso

- Ejecucion de herramientas en el borde: el modelo puede desplegarse en dispositivos con recursos limitados para emitir llamadas a funciones (por ejemplo, consultas a APIs locales) sin depender de servicios en la nube, gracias a su tamano de 0,5B.
- Microservicios de agentes de baja latencia: adecuado para servicios que necesitan resolver tool calling en milisegundos con alta concurrencia, sirviendose de vLLM o TGI.
- Reranking en pipelines RAG de segunda etapa: el autor lo propone para ranking de alta precision dentro de pipelines de recuperacion aumentada.
- Escaneo automatizado de cumplimiento normativo: el autor sugiere su uso en deteccion de datos personales y cumplimiento de GDPR, PCI-DSS y HIPAA mediante llamadas a funciones de validacion.
- Automatizacion de flujos con APIs web: con esquemas de herramientas no vistos, puede emitir llamadas a APIs REST para tareas de integracion.
- Prototipado rapido de agentes en local: util para desarrolladores que quieran validar bucles de tool calling sin coste de API, sustituyendo despues por un modelo mayor en produccion.
- Clasificacion y extraccion estructurada: la salida JSON permite parsear directamente la respuesta para extraer parametros de negocio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad zero-shot del modelo base (test) | 7,82 |
| Perplejidad del modelo ajustado (test held-out) | 2,04 |
| Reduccion de perplejidad | -73,9 % |
| Perdida del modelo base (test) | 2,0568 |
| Perdida del modelo ajustado (test held-out) | 0,7136 |
| Perdida de validacion | 0,6355 |
| Categorias de test no vistas | Web Browser Agent, Web APIs |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BFCL, etc.) en la informacion disponible. Las metricas anteriores son de perplejidad y perdida, no de exactitud en tool calling.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos del modelo base de 0,5B, mas overhead de activaciones y KV cache.
- En cuantizacion de 8 bits: en torno a 0,5-0,7 GB; en 4 bits: en torno a 0,3-0,4 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien A100/H100 para despliegues de alta concurrencia.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: vLLM, Hugging Face TGI, ONNX Runtime y TensorRT-LLM, segun recomienda el autor; tambien es compatible con `transformers` + `peft`.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor menciona diseno para alta concurrencia y baja latencia sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-tool-calling-hermes | 0,5B | no disponible | Tool calling via LoRA | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 0,5B | no disponible en la informacion | Instruct generalista | Apache 2.0 | Hugging Face |
| Hermes-2-Pro (variantes mayores) | no disponible en la informacion | no disponible | Tool calling y JSON | no disponible en la informacion | Hugging Face |

La comparativa con alternativas de la misma categoria (modelos especializados en tool calling de tamano reducido) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 0,5B: capacidad de razonamiento y de seguir instrucciones complejas muy inferior a modelos de mayor tamano; probable degradacion en esquemas de herramientas complejos o anidados.
- Riesgo de alucinacion en nombres de funciones o parametros, especialmente con esquemas largos o ambiguos.
- Los benchmarks publicados son de perplejidad y perdida, no de exactitud de tool calling; no hay evidencia cuantitativa de precision en la tarea objetivo.
- Cero descargas y cero likes en el momento de la ficha: sin validacion por parte de la comunidad.
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- Longitud de contexto no documentada en la model card; depende del modelo base.
- Requiere cargar el modelo base Qwen2.5-0.5B-Instruct por separado; el repositorio contiene solo el adaptador LoRA.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del dataset de entrenamiento (`NousResearch/hermes-function-calling-v1`) para produccion.
- No se documentan sesgos especificos; al heredar el modelo base, pueden persistir sesgos de Qwen2.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/qwen2.5-0.5b-tool-calling-hermes
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- vLLM: https://github.com/vllm-project/vllm
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- ONNX Runtime: https://github.com/microsoft/onnxruntime
- TensorRT-LLM: https://github.com/NVIDIA/TensorRT-LLM
