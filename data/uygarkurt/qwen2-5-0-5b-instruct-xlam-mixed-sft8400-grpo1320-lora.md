# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo1320-lora

## Resumen

`uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo1320-lora` es un adaptador LoRA publicado por el usuario uygarkurt sobre el modelo base Qwen2.5-0.5B-Instruct. No es un modelo completo: el repositorio contiene únicamente pesos de adaptador (formato PEFT/safetensors) que deben cargarse sobre el modelo base original de Qwen. Su objetivo es especializar un modelo de ~500 millones de parámetros en tool calling estructurado y, de forma destacable, en la abstención cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.

El entrenamiento se realizó con el framework Post-Training Lab del propio autor sobre el dataset `uygarkurt/xlam-tool-calling-mixed`, en dos fases: 8.400 actualizaciones de supervised fine-tuning (SFT) seguidas de 1.320 actualizaciones de Group Relative Policy Optimization (GRPO). El interés técnico está en la segunda fase: el paso por RL mejora la precisión exacta de llamada a herramienta (xLAM ETC) del 71,49% al 79,32% y la precisión de nombre de función (xLAM FNA) del 86,88% al 96,76%, a cambio de sacrificar parte de la capacidad de descartar herramientas irrelevantes.

Es relevante ahora porque documenta una receta reproducible y de coste muy bajo (2 horas de entrenamiento total) para dotar a un modelo de 0,5B de comportamiento de function calling fiable en escenarios de enrutado, y porque publica métricas separadas de relevancia e irrelevancia, algo poco habitual en adaptadores de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen2.5-0.5B-Instruct); el artefacto publicado es un adaptador LoRA |
| Parametros totales | Aproximadamente 0,5 B en el modelo base; el adaptador LoRA solo contiene los pesos de las matrices de bajo rango (tamano de repo 0.0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; viene determinada por el modelo base Qwen2.5-0.5B-Instruct |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos de adaptador en safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (campo `language: en` en la model card) |
| Licencia | No disponible (la model card del adaptador no declara licencia) |
| Formato de pesos | Safetensors (adaptador LoRA compatible con PEFT y transformers) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Libreria | peft |
| Dataset de entrenamiento | uygarkurt/xlam-tool-calling-mixed |
| Etapas de entrenamiento | SFT 8.400 actualizaciones (1,3 h) + GRPO 1.320 actualizaciones (0,7 h); 2 h en total |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2.5 (disponible en 0,5B, 1,5B, 3B, 7B, 14B, 32B y 72B, con variantes base e instruct, preentrenada hasta 18 billones de tokens segun la documentacion de la familia). El adaptador no modifica la arquitectura: inyecta matrices de bajo rango mediante LoRA sobre las capas del modelo base, de modo que en inferencia se puede cargar el adaptador por separado o fusionarlo con los pesos originales.

El entrenamiento se hizo con Post-Training Lab en dos etapas secuenciales sobre el dataset mixto de tool calling `uygarkurt/xlam-tool-calling-mixed`. La primera etapa son 8.400 actualizaciones de SFT (1,3 h de bucle de entrenamiento); la segunda continúa ese mismo adaptador SFT con 1.320 actualizaciones de GRPO (0,7 h). No se especifican en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset, la tasa de aprendizaje ni la configuracion de recompensas de GRPO. La innovacion declarada por el autor es el uso de GRPO para reforzar simultaneamente la estructura de la llamada y la abstención ante herramientas irrelevantes; los tiempos indicados excluyen carga de modelo, preparacion de datos y evaluacion externa.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Tool calling / function calling estructurado: genera llamadas con nombre de funcion y argumentos, con una precision de nombre de funcion del 96,76% en el holdout calls-only de xLAM.
- Abstención ante herramientas irrelevantes: capacidad entrenada explicitamente mediante GRPO para no emitir una llamada cuando ninguna herramienta ofrecida es pertinente (66,58% en el subconjunto de irrelevancia).
- Capacidad limitada de razonamiento general y matematicas, derivada del modelo base de 0,5B (MMLU 38,15%, MATH-500 19,40%).
- Seguimiento de instrucciones basico (IFEval 29,02% en precision estricta a nivel de prompt).
- No se documentan capacidades de vision, audio, agentes multi-paso ni modo de razonamiento extendido (thinking) en la informacion disponible.
- Multilingue: no. El campo de idioma declara unicamente ingles.

## Casos de uso

- Enrutado de herramientas en agentes: el adaptador puede recibir el catalogo de funciones disponibles y la consulta del usuario para decidir que funcion invocar y con que argumentos; su tamano de 0,5B permite ejecutarlo como primer salto antes de un modelo mayor.
- Abstención en asistentes con catalogo cerrado: en escenarios donde llamar a la funcion equivocada es costoso (operaciones bancarias, control de dispositivos), el entrenamiento explicito de irrelevancia ayuda a que el modelo responda "no puedo hacer eso" en lugar de inventar una llamada.
- Despliegue en dispositivos embebidos y edge: con pesos de aproximadamente 1 GB en fp16 y menos de 0,5 GB en cuantizacion de 4 bits, es viable en placas tipo M5Stack o en moviles para asistentes de voz locales con function calling.
- Router/clasificador de intenciones en pipelines de CI/CD y automatizacion: usar el modelo para mapear lenguaje natural a una accion de herramienta concreta en lugar de un LLM grande, reduciendo coste y latencia.
- Extraccion de argumentos estructurados: generar JSON de parametros a partir de texto libre para integrarlo en flujos de automatizacion (por ejemplo, crear tickets o entradas de calendario).
- Prototipado e investigacion en RL: sirve como caso de estudio reproducible de SFT + GRPO en 2 horas sobre un dataset propio, util para validar recetas de post-entrenamiento antes de escalarlas a modelos mayores.
- Evaluacion comparativa de adaptadores: la publicacion de checkpoints intermedios (SFT puro frente a SFT + GRPO) permite analizar el efecto del RL sobre el trade-off entre cobertura y abstención.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes; la primera fila es el adaptador SFT usado para inicializar GRPO y la segunda el adaptador final):

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| SFT (inicial) | SFT 8.400 | 37,91% | 18,00% | 29,21% | 71,49% | 86,88% | 46,24% | 55,56% | 88,59% | 1,3 |
| SFT + GRPO (este adaptador) | GRPO 1.320 | 38,15% | 19,40% | 29,02% | 79,32% | 96,76% | 56,14% | 83,33% | 66,58% | 2 |

Notas metodologicas declaradas por el autor: xLAM ETC es precision exacta de llamada a herramienta y xLAM FNA es precision de nombre de funcion; ambas se calculan sobre el holdout calls-only con 2.287 ejemplos evaluados y 700 descartados, no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados; se trata de agregados propios del estudio. IFEval usa precision estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de los ~0,5 B de parametros del modelo base, no medida sobre este adaptador): aproximadamente 1,0-1,2 GB en fp16 incluyendo cache KV para contextos cortos; aproximadamente 0,5-0,7 GB en cuantizacion de 8 bits; aproximadamente 0,3-0,5 GB en 4 bits.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (RTX 3050, RTX 4060, RTX 4090); en entornos de servidor, T4, L4, A10 o A100 quedan sobradamente dimensionadas y permiten agrupar muchas peticiones concurrentes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada; tambien es viable en CPU para inferencia de un solo flujo.
- Opciones de despliegue: transformers + PEFT (ruta nativa del adaptador), vLLM y TGI (admiten adaptadores LoRA dinamicos), llama.cpp/Ollama solo si se fusiona y convierte previamente a GGUF, y servidores gestionados como FriendliAI (que lista el adaptador SFT hermano).
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Nota: el adaptador debe cargarse sobre Qwen/Qwen2.5-0.5B-Instruct; no incluye el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT 8.400 + GRPO 1.320) | ~0,5 B | No disponible | xLAM ETC 79,32%; FNA 96,76%; BFCL FC 56,14%; MMLU 38,15% | No disponible | Publico en HuggingFace, 0 descargas |
| uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora (solo SFT) | ~0,5 B | No disponible | xLAM ETC 71,49%; FNA 86,88%; BFCL FC 46,24%; MMLU 37,91% | No disponible | Publico en HuggingFace |
| uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo2640-lora | ~0,5 B | No disponible | No disponible en la informacion proporcionada | No disponible | Publico en HuggingFace |
| Qwen/Qwen2.5-0.5B-Instruct (base) | ~0,5 B | No disponible en la informacion proporcionada | No disponible para tool calling en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en HuggingFace |

La comparacion directa solo es posible frente a los checkpoints de la misma familia publicados por el autor; no se dispone de datos de benchmarks de modelos de terceros del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 0,5B: MMLU 38,15%, MATH-500 19,40% e IFEval 29,02% indican conocimiento general, matematicas y seguimiento de instrucciones muy limitados. No es adecuado como modelo de proposito general ni como fuente de conocimiento.
- Trade-off de GRPO: la capacidad de abstenerse ante herramientas irrelevantes cae del 88,59% al 66,58% respecto al checkpoint SFT. El modelo final es mas preciso llamando a la herramienta correcta pero mas propenso a emitir una llamada cuando deberia no hacerlo.
- Riesgo de alucinacion alto en cualquier tarea fuera del dominio de tool calling del dataset de entrenamiento; el ajuste se hizo sobre datos sinteticos tipo xLAM, lo que puede no generalizar a esquemas de herramientas reales.
- Solo ingles declarado: el comportamiento en castellano no esta evaluado ni garantizado.
- Licencia no declarada en la model card del adaptador: no hay autorizacion explicita de uso comercial en la informacion proporcionada; es necesario contactar con el autor o verificar la licencia del modelo base antes de un despliegue en produccion.
- Es un adaptador, no un modelo autonomo: hay que cargarlo sobre Qwen/Qwen2.5-0.5B-Instruct y gestionar la version concreta del base.
- Ventana de contexto no documentada en esta ficha: debe consultarse la model card del modelo base antes de disenar prompts largos.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin evaluacion independiente que reproduzca las metricas del autor.
- Las metricas de BFCL y de relevancia son agregados propios del estudio, no resultados oficiales del benchmark, por lo que no son directamente comparables con puntuaciones publicadas de otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo1320-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Adaptador SFT previo (checkpoint inicial de GRPO): https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora
- Variante con 2.640 actualizaciones de GRPO: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo2640-lora
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
- Despliegue del adaptador SFT hermano en FriendliAI: https://friendli.ai/models/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora
- Documentacion del modelo base en M5Stack: https://docs.m5stack.com/en/stackflow/models/qwen2.5-0.5b-instruct
- Repositorio espejo de la familia Qwen2.5: https://github.com/mx4ai/qwen2.5
