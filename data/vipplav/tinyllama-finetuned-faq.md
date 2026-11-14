# Vipplav/tinyllama-finetuned-faq

## Resumen

`Vipplav/tinyllama-finetuned-faq` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `TinyLlama/TinyLlama-1.1B-Chat-v1.0`, un transformer decoder-only de 1.100 millones de parametros. Lo desarrolla Vipplav AI, un estudio de IA con sede en India orientado a modelos de lenguaje pequenos para el mercado indico y a la automatizacion agentica. El adaptador esta especializado en la generacion de respuestas concisas para preguntas frecuentes (FAQ) y soporte al cliente empresarial.

El modelo resuelve un problema muy concreto: desplegar un asistente de preguntas y respuestas con latencia baja y huella minima, sin depender de GPUs en la nube ni de infraestructura de API costosa. Segun la model card, el adaptador cabe en menos de 2 GB de VRAM y puede ejecutarse en portatiles de consumo, CPUs o nodos edge como una Raspberry Pi.

La relevancia actual del modelo es limitada pero clara dentro de su nicho: es un ejemplo de fine-tuning parametro-eficiente de bajo coste sobre una base abierta (Apache 2.0), orientado a equipos que necesitan un FAQ bot autocontenido y desplegable on-premise. No se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base TinyLlama-1.1B-Chat); adaptador LoRA con modulos objetivo `q_proj` y `v_proj` |
| Parametros totales | 1.100 millones (modelo base); tamano del adaptador LoRA no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base TinyLlama-1.1B-Chat soporta 2.048 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible de forma explicita; la model card menciona ejecucion en menos de 2 GB de VRAM, lo que implica cuantizacion o precision reducida (float16/float32 en el codigo de ejemplo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only denso de 1.100 millones de parametros. El fine-tuning emplea LoRA (Low-Rank Adaptation) con modulos objetivo `q_proj` y `v_proj`, es decir, adapta unicamente las proyecciones de query y value de la atencion. Esta eleccion reduce drasticamente el numero de parametros entrenables y el tamano del artefacto resultante (el repositorio ocupa 0,1 GB).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de FAQ, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado mas alla del propio fine-tuning LoRA. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El prompt de ejemplo de la model card usa el formato de chat de TinyLlama con tokens especiales `<|system|>`, `<|user|>` y `<|assistant|>`.

## Capacidades

- Generacion de texto conversacional orientada a preguntas y respuestas de tipo FAQ.
- Respuestas concisas y ancladas al contexto del prompt de sistema (context-grounded, segun la model card).
- Soporte del formato de chat de TinyLlama con roles de sistema, usuario y asistente.
- Ejecucion en entornos de bajos recursos: CPU, portatiles de consumo y nodos edge.
- Integracion con el ecosistema `transformers` y `peft` mediante `PeftModel.from_pretrained`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingue limitada al ingles segun el campo `language: en`.

## Casos de uso

- Asistente de FAQ en atencion al cliente: el adaptador responde preguntas recurrentes (por ejemplo, restablecimiento de contrasena) con respuestas breves y consistentes, usando un prompt de sistema que fija el rol de soporte empresarial.
- Despliegue on-premise en empresas con requisitos de privacidad: al caber en menos de 2 GB de VRAM y poder ejecutarse en CPU, permite mantener los datos de clientes dentro de la infraestructura propia sin enviarlos a APIs externas.
- Chatbot embebido en aplicaciones de escritorio o moviles: la huella reducida del adaptador (0,1 GB) y del modelo base lo hacen viable en entornos con recursos limitados.
- Kioscos o terminales de autoservicio en tiendas: ejecutable en dispositivos edge como una Raspberry Pi para resolver dudas basicas de producto o servicio sin conectividad a la nube.
- Filtrado y pre-respuesta en mesas de ayuda: puede generar borradores de respuesta que un agente humano revise, reduciendo el tiempo de primera respuesta en tickets repetitivos.
- Prototipado rapido de asistentes verticales: sirve como base para validar flujos de FAQ antes de invertir en modelos mayores, gracias a su bajo coste de inferencia y su licencia Apache 2.0.
- Demos educativas de fine-tuning LoRA: util para investigadores que quieran estudiar el efecto de adaptar solo `q_proj` y `v_proj` en un modelo de 1.1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 2 GB segun la model card; con el modelo base en float16 el peso ronda los 2,2 GB, por lo que la cifra declarada presupone cuantizacion o precision reducida.
- GPU recomendadas: no se especifican; la model card indica que no requiere GPUs en la nube costosas.
- Cabe en GPU de consumo: si, segun la model card, en portatiles de consumo; tambien en CPU y dispositivos edge como Raspberry Pi.
- Opciones de despliegue: `transformers` + `peft` (documentado). vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles; la model card califica el modelo como de "ultra-low-latency" sin aportar mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Vipplav/tinyllama-finetuned-faq | 1,1B (base) + adaptador LoRA | no disponible | Apache 2.0 | FAQ y soporte al cliente | Hugging Face (0 descargas) |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2.048 tokens (segun documentacion publica del base) | Apache 2.0 | Chat general | Hugging Face (ampliamente usado) |
| Modelos de 1-3B para FAQ (por ejemplo, variantes fine-tuneadas de Qwen o Phi) | 1-3B | variable | variable | Soporte y QA | Hugging Face |

La comparativa con alternativas especificas de la misma categoria no esta disponible en la informacion proporcionada; la unica referencia directa es el modelo base sobre el que se construye el adaptador.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no es adecuado para castellano u otros idiomas sin evaluacion previa.
- No se documenta el dataset de entrenamiento, por lo que se desconocen sesgos especificos y el riesgo de alucinacion en dominios fuera de las FAQ vistas durante el fine-tuning.
- Al ser un adaptador LoRA sobre un modelo de 1,1B, su capacidad de razonamiento y conocimiento factual es limitada en comparacion con modelos mayores; las respuestas deben validarse en produccion.
- La longitud de contexto efectiva no se especifica en la model card; conviene verificar el limite del modelo base antes de disenar prompts largos.
- El repositorio registra 0 descargas y 0 likes, y no se han publicado evaluaciones; la madurez y el soporte del modelo son inciertos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base TinyLlama antes de desplegar.
- No hay garantias de mantenimiento ni actualizaciones por parte del autor; la ultima actualizacion del repositorio es de noviembre de 2026 segun los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vipplav/tinyllama-finetuned-faq
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Web de Vipplav AI: https://www.vipplavai.com/
- GitHub de Vipplav: https://github.com/vipplavai
- Contacto: hello@vipplavai.com
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
