# VaibhavSuman04/support-ticket-router-qwen2.5-0.5b-lora

## Resumen

Support Ticket Router es un adaptador LoRA sobre Qwen2.5-0.5B-Instruct, publicado por VaibhavSuman04, que convierte el modelo base en un clasificador de intenciones para mensajes de soporte bancario en ingles. El adaptador mapea cada mensaje a una de ocho etiquetas cerradas: `balance`, `transfer`, `transactions`, `report_fraud`, `freeze_account`, `pin_change`, `spending_history` y `account_blocked`. Se entrenó durante 20 pasos de optimizacion sobre un subconjunto del dataset CLINC150 (clinc/oos-eval).

El interes del artefacto es su tamano: al ser un adaptador sobre un modelo de 0,5 mil millones de parametros, el coste de inferencia es minimo y puede ejecutarse en CPU o en GPUs de consumo muy modestas. El autor reporta una mejora de accuracy del 33,75% al 78,75% sobre 80 mensajes reservados de las ocho intenciones, con un Macro-F1 que pasa de 0,327 a 0,800. Sin embargo, el propio autor advierte que la evaluacion no cubre tickets reales ni peticiones fuera de dominio, y que el modelo genero tres etiquetas invalidas en la prueba.

Se trata de un experimento de adaptacion de bajo coste orientado a enrutamiento de tickets, no de un modelo listo para produccion. La model card es explicita sobre esta limitacion y recomienda validar la etiqueta generada antes de enrutar un ticket. No hay informacion sobre licencia del adaptador ni sobre el proceso de entrenamiento mas alla de los 20 pasos de optimizacion mencionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Qwen2.5-0.5B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 0,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct (revision 7ae557604adf67be50417f59c2c2f167def9a775) |
| Dataset de entrenamiento | clinc/oos-eval (subconjunto de CLINC150) |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador utiliza PEFT/LoRA sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El adaptador no modifica la arquitectura del modelo base: anade matrices de bajo rango entrenables que se combinan con los pesos originales en tiempo de inferencia. El prompt de sistema fuerza al modelo a responder con exactamente una etiqueta de la lista cerrada de ocho intenciones, sin explicacion.

El entrenamiento consistio en 20 actualizaciones del optimizador sobre un subconjunto de CLINC150, un dataset de clasificacion de intenciones en ingles con peticiones fuera de dominio (out-of-scope). No se especifican en la model card el rango del LoRA, el learning rate, el tamano de batch, la composicion exacta del subconjunto ni si se aplicaron tecnicas adicionales como RLHF o DPO. El autor publica `metrics.json` y `manifest.json` con los resultados y la configuracion de entrenamiento, pero esos ficheros no estan incluidos en la informacion proporcionada.

## Capacidades

- Clasificacion de intenciones bancarias en ingles sobre ocho etiquetas cerradas: `balance`, `transfer`, `transactions`, `report_fraud`, `freeze_account`, `pin_change`, `spending_history` y `account_blocked`.
- Generacion de texto restringida a una unica etiqueta por mensaje, segun el prompt de sistema del ejemplo de la model card.
- Inferencia en formato conversacional mediante `apply_chat_template` del tokenizer de Qwen2.5.
- Ejecucion sobre el modelo base Qwen2.5-0.5B-Instruct, que aporta comprension de lenguaje natural en ingles.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue no disponible: el adaptador esta entrenado y declarado solo para ingles.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el adaptador clasifica un mensaje entrante en una de las ocho intenciones y permite derivarlo al equipo correspondiente (fraude, tarjetas, cuentas). Es adecuado por su bajo coste de inferencia y su formato de salida de una sola etiqueta.
- Triaje previo en un chatbot de atencion al cliente: antes de invocar un LLM mayor, el sistema puede usar este adaptador para decidir que flujo activar, reduciendo llamadas a modelos mas caros.
- Clasificacion por lotes de historicos de tickets: al ser un modelo de 0,5B con adaptador LoRA, puede procesar grandes volumenes en CPU o en una GPU de consumo, lo que abarata el etiquetado retrospectivo.
- Prototipado rapido de pipelines de clasificacion: sirve como linea base para comparar con clasificadores dedicados o con modelos mayores antes de invertir en infraestructura.
- Filtro de seguridad en front-end: combinado con una comprobacion de que la etiqueta pertenece a la lista permitida, puede marcar mensajes ambiguos como `manual_review` y evitar enrutamientos erroneos.
- Demo o prueba de concepto de adaptacion LoRA: el repositorio incluye el codigo de inferencia completo, por lo que es util como plantilla para adaptar Qwen2.5-0.5B-Instruct a otras taxonomias de intenciones.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los de la evaluacion propia sobre 80 mensajes reservados de las ocho intenciones soportadas:

| Metrica | Modelo base | Adaptador LoRA |
|---|---|---|
| Accuracy | 33,75% | 78,75% (63 aciertos de 80) |
| Macro-F1 | 0,327 | 0,800 |
| Etiquetas invalidas generadas | no disponible | 3 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La evaluacion no mide rendimiento en tickets reales ni en peticiones fuera de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo base de 0,5B en precision FP16, la huella de pesos ronda 1 GB, mas el overhead del adaptador y del runtime.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la practica; tambien es viable en CPU para lotes pequenos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (RTX 3060, RTX 4060, etc.), e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el ejemplo oficial usa PyTorch, Transformers y PEFT. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la naturaleza de adaptador PEFT requiere cargar el modelo base y fusionar o aplicar el adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Support Ticket Router (este) | adaptador sobre 0,5B | no disponible | LoRA para clasificacion de intenciones | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible en esta ficha | LLM decoder-only | no disponible en esta ficha | Hugging Face |
| Clasificadores CLINC150 especializados | variable (BERT-base ~110M, etc.) | 512 tokens tipico | encoder para clasificacion | variable | Hugging Face / repos publicos |

La comparacion con clasificadores encoder dedicados (por ejemplo, fine-tunes de BERT sobre CLINC150) no puede cuantificarse con los datos disponibles, ya que el autor no reporta resultados frente a esas lineas base.

## Limitaciones y advertencias

- Evaluacion muy limitada: solo 80 mensajes reservados de las ocho intenciones soportadas; no hay medicion en tickets reales ni en peticiones fuera de dominio.
- El adaptador genero tres etiquetas invalidas en la prueba, por lo que es imprescindible validar la salida contra la lista permitida y derivar a revision manual cuando no coincida.
- Sesgos conocidos: no documentados; al entrenarse sobre CLINC150, hereda los sesgos y la distribucion de ese dataset.
- Riesgo de alucinacion: el modelo puede generar texto distinto de una etiqueta valida, como demuestran las tres salidas invalidas reportadas.
- Limitacion de idioma: solo ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Ambito cerrado: solo cubre ocho intenciones bancarias; cualquier peticion fuera de ese conjunto queda sin tratamiento medido.
- Licencia: no disponible; no se puede confirmar si el uso comercial esta permitido. Ademas, el uso queda sujeto a la licencia del modelo base Qwen2.5-0.5B-Instruct.
- Para produccion: el propio autor recomienda validar la etiqueta antes de enrutar; no debe desplegarse como unico mecanismo de enrutamiento sin una capa de validacion y fallback.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VaibhavSuman04/support-ticket-router-qwen2.5-0.5b-lora
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset CLINC150 (repositorio oficial): https://github.com/clinc/oos-eval
- Dataset en Hugging Face: https://huggingface.co/datasets/clinc/oos-eval
- Libreria PEFT: https://github.com/huggingface/peft
