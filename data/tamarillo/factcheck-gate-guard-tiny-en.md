# Tamarillo/factcheck-gate-guard-tiny-en

## Resumen

Tamarillo/factcheck-gate-guard-tiny-en es un clasificador de texto binario de 32 millones de parametros disenado como puerta de enrutamiento (gate) en pasarelas LLM y pipelines RAG. Decide si un prompt entrante requiere verificacion factual externa (`1 = FACT_CHECK_NEEDED`) o puede responderse directamente (`0 = NO_FACT_CHECK_NEEDED`), con el mismo esquema de etiquetas que `vllm-project/semantic-router`. Lo desarrolla Tamarillo como parte de su suite de seguridad y observabilidad de modelos abiertos, y se apoya en el encoder `jhu-clsp/ettin-encoder-32m` como modelo base.

Su relevancia practica esta en el coste: al ser un modelo de 32M con exportaciones ONNX y pesos en safetensors, puede ejecutarse en CPU x86 en torno a 9,6 ms por peticion (dato declarado por el autor) y en el navegador via Transformers.js, lo que permite descartar la verificacion de groundedness en prompts de codigo, matematicas, reescritura o creatividad antes de gastar latencia y tokens en recuperacion.

El modelo se presenta como la primera etapa de un pipeline HaluGate de dos fases, emparejado con `Tamarillo/groundedness-guard-base` para la verificacion de spans. La licencia es Apache-2.0, no requiere `trust_remote_code` y esta pensado exclusivamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder (ModernBertForSequenceClassification) |
| Parametros totales | 32.031.746 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (truncacion indicada en los ejemplos de la model card) |
| Tipos de cuantizacion | FP32 y FP16 (exportaciones ONNX: `model.onnx` y `model_fp16.onnx`); no se documentan GGUF ni INT8 |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (FP32 y FP16), compatible con Transformers.js |

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT de 32M de parametros obtenido por ajuste fino del checkpoint `jhu-clsp/ettin-encoder-32m`. La cabeza de clasificacion es la estandar de `ModernBertForSequenceClassification` con dos etiquetas, sin codigo remoto ni adaptadores PEFT, lo que simplifica la auditoria de la cadena de suministro frente a alternativas que exigen `trust_remote_code=True`.

El autor declara entrenamiento sobre `vllm-sr/fact-check-classification-dataset`, complementado con `OpenAssistant/oasst1` y `nvidia/HelpSteer2`. La model card incluye un factor de calibracion de temperatura (T = 1,0669) derivado de NLL, aplicable sobre los logits antes del softmax para obtener probabilidades calibradas; el autor reporta un ECE de 0,150 en el clasificador alternativo `vllm-sr/mmbert32k-factcheck-classifier-merged`, lo que situa la calibracion como uno de los ejes diferenciales de este modelo. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Clasificacion binaria de prompts en dos etiquetas: `0 = NO_FACT_CHECK_NEEDED` y `1 = FACT_CHECK_NEEDED`.
- Deteccion de prompts que requieren verificacion factual externa (preguntas de conocimiento, datos verificables, consultas tipo SimpleQA o FRAMES).
- Deteccion de prompts que no la requieren (generacion de codigo, matematicas, reescritura, creatividad, dialogos ficticios).
- Enrutamiento compatible con el esquema de etiquetas de `vllm-project/semantic-router`.
- Salida de probabilidades calibradas mediante temperatura (T = 1,0669).
- Ejecucion en CPU via ONNX Runtime y en navegador via Transformers.js (WASM).
- Integracion como primera etapa de un pipeline de verificacion de groundedness de dos fases.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento extendido: es un clasificador, no un modelo generativo.

## Casos de uso

- Puerta de enrutamiento en pasarelas LLM: interceptar cada prompt antes de enviarlo al modelo generativo y decidir si se activa recuperacion o verificacion, reduciendo coste y latencia en el trafico que no la necesita.
- Pipeline RAG con verificacion selectiva: combinar con `Tamarillo/groundedness-guard-base` para verificar solo las respuestas a prompts marcados como `FACT_CHECK_NEEDED`, evitando la penalizacion de latencia en consultas de codigo o matematicas.
- Sidecar de CPU en produccion: desplegar la exportacion ONNX en un contenedor junto a la pasarela, con latencia declarada de 9,6 ms en x86, sin necesidad de GPU dedicada.
- Deteccion de alucinaciones en asistentes conversacionales: marcar turnos que requieren contraste con fuentes antes de devolver la respuesta al usuario.
- Filtrado previo en pipelines de evaluacion: clasificar grandes lotes de prompts para separar los que necesitan verificacion factual de los puramente generativos antes de aplicar metricas costosas.
- Ejecucion en el navegador: usar la variante FP16 (61,3 MB) con Transformers.js para clasificar localmente en aplicaciones web sin enviar el prompt a un servidor.
- Observabilidad y analitica de trafico: etiquetar peticiones en logs para medir la proporcion de consultas verificables y dimensionar la infraestructura de retrieval.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Prompt fact-check y enrutamiento RAG (OOD en ingles) | Public Real Mixed OOD (SimpleQA + FRAMES vs HumanEvalPack + GSM8K, n=1.600) | ROC-AUC | 0,9923 |
| Prompt fact-check y enrutamiento RAG (OOD en ingles) | Public Real Mixed OOD (SimpleQA + FRAMES vs HumanEvalPack + GSM8K, n=1.600) | TPR@5%FPR | 0,9688 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos adicionales (MMLU, HumanEval, GSM8K) ni mediciones de throughput mas alla de la latencia de 9,6 ms en CPU x86 citada en la model card.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (32M de parametros, aproximadamente 128 MB de pesos) y en torno a 64 MB en FP16; el repo completo ocupa 0,3 GB.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) ejecuta el modelo con holgura. En CPU x86 el autor declara 9,6 ms por peticion.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (CPU, contenedores ligeros, navegador).
- Opciones de despliegue: transformers (>= 4.48) con PyTorch, ONNX Runtime (CPU o GPU), Transformers.js (>= 3.5.1) en navegador, y teoricamente Text Embeddings Inference por los tags del repo; no se documenta soporte explicito de vLLM, llama.cpp ni Ollama para esta tarea de clasificacion.
- Latencia y throughput: 9,6 ms por peticion en CPU x86 con la variante tiny (dato declarado por el autor); no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Tamarillo/factcheck-gate-guard-tiny-en | 32M | 2048 | safetensors, ONNX FP32/FP16 | Apache-2.0 | Sin `trust_remote_code`; calibracion T=1,0669; ROC-AUC 0,9923 en OOD mixto |
| vllm-sr/mmbert32k-factcheck-classifier-merged | 307,5M | 32k (yarn) | no disponible | no disponible en la informacion | Requiere `trust_remote_code=True`; sin exportaciones ONNX; ECE 0,150 declarado por el autor de esta ficha |
| Tamarillo/groundedness-guard-base | no disponible | no disponible | no disponible | Apache-2.0 | Segunda etapa del pipeline HaluGate; verifica spans, no enruta prompts |

No se dispone en la informacion proporcionada de otros clasificadores publicos comparables con datos de rendimiento verificables.

## Limitaciones y advertencias

- Solo soporta ingles; los prompts en otros idiomas no estan cubiertos por el entrenamiento declarado.
- La ventana de contexto practica es de 2048 tokens con truncacion; prompts mas largos pierden informacion antes de la clasificacion.
- Es un clasificador binario: no genera respuestas ni verifica hechos por si mismo, solo decide si se debe activar la verificacion.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false` en la model-index).
- El umbral de 0,5 es un valor por defecto; el autor recomienda calibrar el umbral sobre el trafico objetivo para un gating estricto de bajo coste.
- Riesgo de falsos negativos: un prompt factual clasificado como `NO_FACT_CHECK_NEEDED` evita la verificacion y puede propagar alucinaciones aguas abajo.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en produccion por terceros.
- No se documentan sesgos especificos del dataset de entrenamiento; al derivarse de `OpenAssistant/oasst1` y `nvidia/HelpSteer2`, puede heredar los sesgos de esas fuentes.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de validacion externa aconseja evaluar el modelo sobre trafico propio antes de desplegarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/factcheck-gate-guard-tiny-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Modelo complementario del pipeline: https://huggingface.co/Tamarillo/groundedness-guard-base
- Demo en navegador: https://huggingface.co/spaces/Tamarillo/factcheck-gate-guard-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/vllm-sr/fact-check-classification-dataset
- Dataset complementario: https://huggingface.co/datasets/OpenAssistant/oasst1
- Dataset complementario: https://huggingface.co/datasets/nvidia/HelpSteer2
- Proyecto semantic-router: https://github.com/vllm-project/semantic-router
- Perfil del autor: https://huggingface.co/Tamarillo
