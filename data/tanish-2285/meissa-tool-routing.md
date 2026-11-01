# tanish-2285/meissa-tool-routing

## Resumen

Meissa-4B tool routing es una familia de pesos publicada por el usuario tanish-2285 que contiene un modelo base afinado y varios adaptadores LoRA orientados al enrutamiento de herramientas (tool routing) en el dominio de radiografia de torax. El modelo de partida es Qwen/Qwen3-VL-4B-Instruct, un transformer multimodal de 4.000 millones de parametros con capacidades de vision y lenguaje, sobre el que se ha entrenado una reproduccion denominada Meissa-4B con 3.357 ejemplos de uso de herramienta y 521 ejemplos sin herramienta.

El repositorio no es un modelo unico, sino un paquete de artefactos: el modelo completo (`meissa-4b-combo521`), un adaptador de respuesta condicionada a la salida de herramienta (`answering-adapter`), un juez que compara dos respuestas (`judge`), cuatro verificadores que estiman la probabilidad de que una respuesta sea incorrecta (`verifier-v1` a `verifier-v4`), un enrutador unico con cabeza de cinco salidas (`single-router`) y un checkpoint de GRPO (`grpo-nonoise-step24`, rango 32).

Su relevancia es acotada pero concreta: ejemplifica un patron de despliegue con modelos pequenos (4B) combinados con enrutamiento, verificacion y juicio para tareas medicas con imagenes, donde el coste de inferencia y la trazabilidad importan. El acceso esta restringido por el acuerdo de uso de datos de PhysioNet, ya que se entreno sobre MIMIC-CXR-JPG y MIMIC-Ext-MIMIC-CXR-VQA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3-VL-4B-Instruct) con adaptadores LoRA y cabeza de clasificacion |
| Parametros totales | 4.000 millones (modelo base); adaptadores LoRA de rango no especificado (GRPO: rango 32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta al acuerdo de datos de PhysioNet) |
| Formato de pesos | safetensors (modelo completo y adaptadores LoRA); `head.pt` para la cabeza del enrutador |

## Arquitectura y entrenamiento

La base es Qwen3-VL-4B-Instruct, un transformer multimodal que procesa imagen y texto. Sobre el se entreno Meissa-4B con 3.357 ejemplos de uso de herramienta y 521 ejemplos sin herramienta, segun la model card. Los demas artefactos son adaptadores LoRA sobre ese modelo: un adaptador para responder a partir de una salida de herramienta, un juez binario entre dos respuestas, cuatro verificadores que modelan P(respuesta incorrecta) y un enrutador unico que combina LoRA con una cabeza lineal de cinco salidas (`head.pt`). El checkpoint de GRPO reportado usa rango 32.

Los datos de entrenamiento proceden de MIMIC-CXR-JPG y MIMIC-Ext-MIMIC-CXR-VQA, ambos con acceso acreditado en PhysioNet. No se detalla en la informacion disponible el numero total de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO adicionales; solo se menciona GRPO como metodo de optimizacion en el checkpoint `grpo-nonoise-step24`. La carga de adaptadores se realiza con `PeftModel.from_pretrained(meissa, folder)`, pasando el modelo base de forma explicita porque `base_model_name_or_path` apunta a la ruta de la maquina de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes de radiografia de torax, heredadas de Qwen3-VL-4B-Instruct.
- Enrutamiento de herramientas: el `single-router` produce cinco salidas para decidir si invocar una herramienta y cual.
- Respuesta condicionada a herramienta: el `answering-adapter` genera la respuesta final a partir de la salida devuelta por una herramienta.
- Juicio comparativo: el `judge` selecciona cual de dos respuestas es correcta.
- Verificacion de respuestas: los `verifier-v1` a `verifier-v4` estiman la probabilidad de que una respuesta propuesta sea erronea.
- Entrenamiento con GRPO para optimizar la politica de enrutamiento (checkpoint `grpo-nonoise-step24`).
- Soporte de tool calling y function calling heredado del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutamiento de peticiones clinicas: el `single-router` decide, ante una consulta sobre una radiografia, si debe llamarse a una herramienta externa (por ejemplo, un modelo de deteccion de hallazgos) o responderse directamente, reduciendo llamadas innecesarias.
- Generacion de informes asistida por herramienta: el `answering-adapter` recibe la salida de un detector o clasificador y redacta la respuesta final en lenguaje natural, manteniendo coherencia con la evidencia devuelta.
- Control de calidad de respuestas: los verificadores estiman P(error) y permiten descartar o marcar respuestas antes de mostrarlas, un patron util en pipelines medicos con revision humana.
- Seleccion entre candidatos: el `judge` compara dos respuestas generadas por distintas configuraciones y elige la mas fiable, util para evaluacion interna o ensembles.
- Investigacion en agentes medicos: el conjunto permite estudiar politicas de tool use con recompensas GRPO en un dominio acotado y con datos acreditados.
- Evaluacion de robustez multimodal: los adaptadores permiten analizar como un modelo de 4B se comporta ante preguntas visuales de radiologia y cuando decide no usar herramientas.
- Prototipado de asistentes con trazabilidad: la separacion entre enrutador, respondedor y verificador facilita auditar cada decision en un flujo clinico simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo en safetensors ocupa aproximadamente 8 GB en precision de 16 bits, por lo que requiere al menos 10-12 GB de VRAM para inferencia comoda; el repo completo pesa 10,1 GB por incluir varios adaptadores y el modelo base.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para el modelo completo; RTX 3090/4080 pueden ser suficientes con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) sin problemas y en RTX 3090/4080 con margen; en GPUs de 8-12 GB requeriria cuantizacion, no documentada en la informacion disponible.
- Opciones de despliegue: carga con `transformers` y `peft` (`PeftModel.from_pretrained`); vLLM, llama.cpp, Ollama o TGI no estan documentados para estos pesos en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Meissa-4B tool routing | 4B | no disponible | other (PhysioNet) | Tool routing medico con LoRA, juez y verificadores |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible | no disponible | Modelo base multimodal generalista |
| MedGemma (referencia de categoria) | no disponible | no disponible | no disponible | Modelos medicos abiertos de proposito general |

No se dispone de datos de rendimiento comparables en la informacion proporcionada; la comparativa se limita a tamano, licencia y enfoque.

## Limitaciones y advertencias

- Entrenado sobre MIMIC-CXR-JPG y MIMIC-Ext-MIMIC-CXR-VQA; su uso esta sujeto al acuerdo de datos acreditados de PhysioNet y no puede emplearse fuera de ese marco.
- La licencia "other" no aclara condiciones de uso comercial; debe revisarse el acuerdo de PhysioNet antes de cualquier despliegue.
- Dominio muy acotado: radiografia de torax y enrutamiento de herramientas; no es un modelo generalista.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en contexto clinico.
- No se documentan sesgos conocidos, idiomas soportados ni evaluacion de seguridad.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-10-31; no hay evidencia de validacion externa.
- Los adaptadores dependen de rutas de entrenamiento en `adapter_config.json`, lo que exige pasar el modelo base explicitamente.
- No hay benchmarks publicados que permitan comparar su calidad frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/tanish-2285/meissa-tool-routing
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- PhysioNet MIMIC-CXR-JPG: https://physionet.org/content/mimic-cxr-jpg/
- PhysioNet MIMIC-Ext-MIMIC-CXR-VQA: https://physionet.org/content/mimic-ext-mimic-cxr-vqa/
