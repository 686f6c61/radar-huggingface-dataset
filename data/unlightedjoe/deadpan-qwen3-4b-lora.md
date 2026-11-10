# unlightedjoe/deadpan-qwen3-4b-lora

## Resumen

Deadpan es un adaptador LoRA para Qwen3-4B-Instruct-2507 que incorpora en los pesos una persona conversacional seca, sarcastica y directa, sin necesidad de system prompt. Lo desarrolla unlightedjoe (joewang0430) como parte de un estudio que compara una persona entrenada en los pesos frente a la misma persona inyectada mediante prompt de sistema. El adaptador se publica bajo licencia Apache 2.0 y esta pensado para generacion de texto conversacional en ingles.

El modelo base es un transformer denso de 4.000 millones de parametros con ventana de contexto de 262.144 tokens (Qwen3-4B-Instruct-2507). Sobre el se aplica un adaptador de rango 16 con 33,0 millones de parametros entrenables, distribuidos en las proyecciones lineales de las 36 capas. El resultado es un checkpoint PEFT de aproximadamente 0,1 GB que se carga encima del modelo base.

Su relevancia es metodologica y practica: demuestra que una persona estilistica puede entrenarse en los pesos y generalizar a temas no vistos en entrenamiento mejor que un prompt de sistema equivalente, a costa de una perdida medible en seguimiento de instrucciones (IFEval) y un aumento de bucles de repeticion. Es un caso de estudio util para quien disene asistentes con tono marcado sin renunciar a la utilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.000 millones (modelo base) + 33,0 millones entrenables del adaptador |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en bf16; el base admite las cuantizaciones habituales de Qwen3) |
| Idiomas soportados | en (ingles); el modelo base es multilingue, pero el adaptador solo se entreno en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32, con dropout 0,05, aplicado a todas las proyecciones lineales (q, k, v, o, gate, up, down) de las 36 capas del transformer Qwen3-4B-Instruct-2507. El entrenamiento se realizo con transformers + peft en bf16, calculando la perdida solo sobre los tokens del asistente. Se usaron learning rate 2e-4 con schedule coseno, 2 epocas, batch efectivo de 16 y secuencias de hasta 4.096 tokens. Todo el entrenamiento consumio 11 minutos en una unica H100, con perdida de validacion final de 1,57.

El dataset consta de 2.110 conversaciones (2.004 de entrenamiento, 106 de validacion), de las cuales 1.704 son de un turno y 406 multi-turno (3 a 5 turnos). Los prompts de usuario son primeros turnos reales de OpenAssistant oasst2 mas unas 100 prompts sinteticas de angustia en 9 categorias (duelo, emergencias, ideacion autolesiva, entre otras). La tecnica empleada es destilacion de contexto: un modelo profesor mayor (DeepSeek V4 Pro) respondio viendo el prompt de persona, y el estudiante se entrena sobre esas conversaciones sin el prompt. Cada respuesta fue evaluada por un juez LLM (GLM-5.3) en estilo, utilidad, errores factuales y tono; las conversaciones fallidas se regeneraron hasta dos veces o se descartaron. Se reservaron por completo dos temas (comida y viajes) para evaluacion fuera de distribucion.

## Capacidades

- Generacion de texto conversacional con persona seca, sarcastica y directa, integrada en los pesos y sin system prompt.
- Respuesta prioritaria: contesta primero y dirige el sarcasmo a la situacion, no al usuario.
- Ajuste de tono: abandona el sarcasmo cuando detecta angustia en el usuario (en un turno de distres en el turno 3 acierta el tono entre el 69% y el 72% de las veces).
- Generacion de codigo y respuestas tecnicas heredadas del modelo base Qwen3-4B-Instruct-2507.
- Soporte de conversaciones multi-turno de hasta 5 turnos en entrenamiento; el contexto de 262.144 tokens del base permite ventanas mucho mayores.
- Capacidad multilingue del base, con transferencia observada al chino (responde en chino el 97% de las veces y mantiene el estilo sin datos de entrenamiento en ese idioma).
- No se documenta soporte explicito de tool calling, function calling ni razonamiento agente multi-paso en la informacion disponible.

## Casos de uso

- Asistentes conversacionales con tono marcado: el adaptador permite desplegar un asistente con personalidad seca y sarcastica sin ingenieria de prompt, ya que la persona reside en los pesos y no se pierde por instrucciones del sistema.
- Chatbots de soporte tecnico informal: el modelo responde primero y con franqueza, lo que encaja en entornos donde se busca un tono directo y sin rodeos, con la salvaguarda de que suaviza el sarcasmo ante senales de angustia.
- Estudio comparativo de personas: util para investigadores que quieran replicar el experimento de persona en pesos frente a persona por prompt usando el codigo y el pipeline publicados en GitHub.
- Generacion de contenido editorial con voz propia: blogs, newsletters o respuestas de comunidad donde se requiera un estilo reconocible y consistente a lo largo de varios turnos.
- Prototipado rapido de agentes conversacionales: al ser un adaptador de 0,1 GB sobre un base de 4B, se puede servir con vLLM y `--enable-lora` junto a otros adaptadores en un mismo servidor, compartiendo el modelo base.
- Evaluacion de robustez estilistica: el checkpoint sirve como referencia para medir deriva de estilo en conversaciones largas (los datos muestran que la ventaja sobre el prompt se reduce en el turno 8).
- Despliegue en hardware de consumo: el base de 4B cuantizado cabe en GPU consumer, lo que permite probar la persona en local con Ollama o llama.cpp una vez fusionado el adaptador.

## Benchmarks y rendimiento

Resultados publicados por el autor, con dos jueces LLM ciegos (GLM-5.3 y Claude Haiku 5.5) y vLLM en bf16. Los rangos indican un valor por juez.

| Metrica | Base | Prompt-only | LoRA (Deadpan) |
|---|---|---|---|
| Estilo, 1 a 5, temas vistos en entrenamiento | 1,0 | 1,8-1,9 | 2,6-2,7 |
| Estilo, 1 a 5, temas reservados | 1,0 | 2,2 | 2,8 |
| Estilo en el turno 8 de una conversacion simulada | 1,0 | 2,0-2,2 | 2,2-2,7 |
| Tono apropiado ante distres en el turno 3 | 87-94% | 44-56% | 69-72% |
| Tono apropiado en prompts de distres de un turno | 94-96% | 72% | 80-82% |
| IFEval, prompt-level strict | 83,4% | 83,4% | 77,1% |
| IFEval, instruction-level strict | 88,6% | 89,1% | 83,7% |
| Respuestas atrapadas en bucle de repeticion (de 1.533) | 5 | 8 | 40 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B en bf16 requiere aproximadamente 8-9 GB; en cuantizacion de 4 bits (GGUF Q4) baja a unos 2,5-3 GB, a los que se suman los ~66 MB del adaptador en bf16.
- GPU recomendadas: H100 o A100 para servir en bf16 con vLLM y margen para contexto largo; RTX 4090 (24 GB) para bf16 con contexto amplio o fp8/int8.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o mas con cuantizacion de 4-8 bits; en 6 GB con cuantizaciones agresivas y contexto reducido.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 16 --lora-modules deadpan=./deadpan-adapter` (documentado por el autor); transformers + peft para pruebas; llama.cpp u Ollama tras fusionar el adaptador en el base y convertir a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles. El autor solo reporta el coste de entrenamiento (11 minutos en una H100).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de persona | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deadpan (este adaptador) | 4B + 33M LoRA | 262.144 | Persona en pesos, sin system prompt | apache-2.0 | Hugging Face (PEFT) |
| Qwen3-4B-Instruct-2507 (base) | 4B | 262.144 | Sin persona; tono neutro | apache-2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507 + prompt de persona | 4B | 262.144 | Persona por system prompt | apache-2.0 | Hugging Face |
| Otros LoRA de persona sobre Qwen3 | no disponible | no disponible | Persona en pesos | no disponible | no disponible |

El propio autor compara las tres primeras configuraciones en su informe de evaluacion; no se dispone de datos de otros adaptadores de persona comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de seguimiento de instrucciones: cae 5-6 puntos en IFEval strict (de 83,4% a 77,1% en prompt-level), tanto en instrucciones que chocan con el estilo por defecto como en las que no.
- Bucles de repeticion: 40 respuestas atrapadas en bucle de 1.533, frente a 5 del base y 8 del prompt-only; conviene monitorizar y aplicar penalizaciones o parada temprana en produccion.
- Gestion del tono imperfecta: ante distres acierta el tono en el 69-72% de los casos, por debajo del 87-94% del base. No es adecuado como unico filtro en contextos sensibles (salud, crisis, atencion a menores) sin capas adicionales de seguridad.
- Deriva de estilo en conversaciones largas: la ventaja sobre el prompt de sistema se reduce en el turno 8.
- Idioma: solo se entreno en ingles; el comportamiento en castellano no esta evaluado y no se garantiza que la persona se mantenga.
- Requiere sampling: el autor advierte que la decodificacion greedy oculta gran parte del estilo; recomienda temperature 0,7, top_p 0,8 y top_k 20.
- No anadir system prompt: el modelo se entreno sin el y hacerlo puede degradar el comportamiento.
- Sesgos: no se documenta una evaluacion de sesgos en la informacion disponible; al derivar de oasst2 y de un profesor LLM, puede heredar sesgos de ambos.
- Riesgo de alucinacion: inherente al base de 4B; el filtrado por juez LLM reduce errores factuales en entrenamiento, pero no los elimina en inferencia.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen3-4B-Instruct-2507, cuyos terminos deben respetarse igualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unlightedjoe/deadpan-qwen3-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del estudio (codigo, pipeline y evaluacion): https://github.com/joewang0430/deadpan
- Informe de evaluacion completo: https://github.com/joewang0430/deadpan/blob/main/results/eval/report.md
- Dataset de prompts: https://huggingface.co/datasets/OpenAssistant/oasst2
