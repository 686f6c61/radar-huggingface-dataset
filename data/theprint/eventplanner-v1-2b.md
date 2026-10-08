# theprint/EventPlanner-v1-2B

## Resumen

EventPlanner-v1-2B es un ajuste fino supervisado (SFT) del modelo base unsloth/Qwen3.5-2B, publicado por el usuario theprint en HuggingFace. El modelo se ha entrenado sobre el dataset EventPlanning ShareGPT con Auto-SFT, una herramienta propia del autor que automatiza la busqueda de hiperparametros y el proceso de fine-tuning con LoRA. El resultado es un modelo de 1.942.653.248 parametros (aproximadamente 1,94 mil millones) orientado a generar conversaciones con el estilo y el contenido de ese dataset concreto, no a un uso generalista.

Se trata, por tanto, de un modelo de nicho: su proposito declarado es replicar la distribucion y el formato de las conversaciones de planificacion de eventos presentes en los datos de entrenamiento. No se documentan mejoras en capacidades generales de razonamiento, codigo o matematicas, ni se aportan resultados de benchmarks que permitan situarlo frente a alternativas.

La relevancia de esta ficha es mas metodologica que de rendimiento: sirve como ejemplo de pipeline automatizado de LoRA SFT (busqueda de hiperparametros, 2 epocas, rango 64, fusion a 16 bits) aplicado a un modelo pequeno de la familia Qwen 3.5. Con 0 descargas y 0 likes en el momento de la consulta, y sin licencia declarada, su adopcion en produccion requiere precaucion y verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer texto a texto (familia qwen3_5_text), segun los tags del repositorio |
| Parametros totales | 1.942.653.248 (1,94 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el modelo base; el entrenamiento se realizo con max_seq_length de 2048 |
| Tipos de cuantizacion | no disponible (pesos publicados en 16 bits tras fusionar el adaptador LoRA) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3.5-2B, un transformer decoder-only de aproximadamente 1,94 mil millones de parametros etiquetado como qwen3_5_text. Sobre ese base se aplico un ajuste fino supervisado con LoRA y posterior fusion del adaptador a pesos completos en 16 bits, por lo que el repositorio resultante no requiere cargar un adaptador por separado. Los modulos objetivo del LoRA fueron q_proj, v_proj, k_proj y o_proj, con rango r=64, alpha=64 y dropout de 0,03.

Los hiperparametros de entrenamiento documentados son: learning rate de 0,0002, batch size de 1, acumulacion de gradientes de 2 pasos, warmup ratio de 0,05, longitud maxima de secuencia de 2048 tokens, sin cuantizacion, y 2 epocas sobre el fichero data/EventPlanning-ShareGPT.json. El entrenamiento se ejecuto con Auto-SFT, un pipeline del mismo autor que realiza busqueda automatica de hiperparametros. No se documenta el volumen total de tokens de entrenamiento, la composicion exacta del dataset, ni el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT.

## Capacidades

- Generacion de texto conversacional en ingles, con especializacion en el estilo y el contenido del dataset EventPlanning ShareGPT (planificacion de eventos).
- Seguimiento de instrucciones multi-turno dentro de la ventana usada en entrenamiento (2048 tokens).
- Generacion de texto condicionada por un historial de conversacion en formato ShareGPT, que es el formato implicito de los datos de SFT.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles segun los metadatos; no hay evidencia de transferencia a otros idiomas.
- No se documentan capacidades de vision, audio, modo de pensamiento (thinking mode) ni decodificacion especulativa.

## Casos de uso

- Planificacion de eventos asistida: generar borradores de agenda, listas de tareas y propuestas de cronograma para bodas, conferencias o eventos corporativos, aprovechando que el dataset de entrenamiento cubre ese dominio concreto.
- Prototipado de asistentes conversacionales de dominio cerrado: sirve como punto de partida para comparar el efecto de un SFT especifico frente al modelo base Qwen3.5-2B antes de invertir en un entrenamiento mayor.
- Generacion de datos sinteticos de estilo: al haber aprendido la distribucion de EventPlanning ShareGPT, puede emplearse para producir conversaciones sinteticas de ese dominio que alimenten posteriores ciclos de entrenamiento o evaluacion.
- Experimentacion con pipelines Auto-SFT: el repositorio es un caso de referencia para validar la herramienta Auto-SFT y para reproducir una busqueda de hiperparametros LoRA sobre un modelo de ~2 B en una sola GPU.
- Despliegue en entornos con recursos limitados: con ~1,94 B de parametros, cabe en GPUs de consumo y permite servir un asistente especializado en una maquina de gama media sin infraestructura dedicada.
- Evaluacion academica de olvido catastrofico: util para medir cuanto degrada un SFT de 2 epocas y rango 64 sobre un dataset estrecho las capacidades generales del modelo base.
- Chatbot de demostracion en ingles: dado su tamano, es viable como demo interactiva en un endpoint CPU/GPU pequeno, siempre que el dominio de la conversacion se mantenga cerca del de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y tampoco se aportan metricas de perdida, perplexity o comparativas frente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,9 GB en FP16 (coincide con el tamano del repositorio, 3,9 GB); alrededor de 2,0-2,2 GB en cuantizacion de 8 bits; alrededor de 1,2-1,5 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 con contexto moderado; RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090 son suficientes; A100 o H100 solo tendrian sentido para servir muchas replicas en paralelo.
- Cabe en GPU de consumo: si, el modelo esta claramente dentro del rango de una GPU de consumo, incluso en tarjetas de gama media con 8 GB o mas.
- Opciones de despliegue: transformers (uso nativo, segun la model card); vLLM y TGI para servir con batching; llama.cpp, Ollama y LM Studio requieren convertir los pesos a GGUF, conversion que no se documenta en el repositorio.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EventPlanner-v1-2B (este) | 1,94 B | Entrenado a 2048 tokens; contexto nativo no disponible | Sin benchmarks publicados | no disponible | HuggingFace, 0 descargas y 0 likes |
| unsloth/Qwen3.5-2B (base) | no disponible en la informacion proporcionada | no disponible | Sin datos en la informacion proporcionada | no disponible | HuggingFace |
| Alternativas de ~2 B de la familia Qwen u otras | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste se hizo sobre un unico dataset de planificacion de eventos, por lo que el comportamiento fuera de ese dominio puede degradarse respecto al modelo base.
- Riesgo de alucinacion: no se documenta ningun mecanismo de mitigacion (RLHF, DPO, verificacion factual), y un SFT de 2 epocas sobre datos conversacionales no reduce el riesgo de inventar datos.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o disparidad demografica.
- Limitacion de idioma: los metadatos indican unicamente ingles. El uso en castellano no esta respaldado por el entrenamiento ni por evaluaciones.
- Contexto limitado en entrenamiento: max_seq_length de 2048 tokens. Conversaciones o documentos mas largos pueden degradar la calidad aunque el modelo base soporte ventanas mayores.
- Licencia no disponible: sin licencia declarada no hay autorizacion explicita de uso comercial, redistribucion ni modificacion. Es un bloqueante para produccion hasta que el autor la especifique.
- Trazabilidad limitada: no se documenta el volumen de tokens, la composicion del dataset ni el proceso de filtrado, lo que dificulta reproducir el entrenamiento o auditar los datos.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion por terceros.
- Tamano de repo de 3,9 GB para un modelo de 1,94 B de parametros, coherente con pesos en 16 bits, pero relevante si se despliega en multiples nodos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theprint/EventPlanner-v1-2B
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Repositorio de Auto-SFT: https://github.com/theprint/auto-sft
- Nota sobre la busqueda web: los resultados devueltos por la busqueda corresponden a la publicacion periodistica india ThePrint (https://theprint.in/ y https://en.wikipedia.org/wiki/ThePrint) y no guardan relacion con este modelo ni con su autor, por lo que no se han utilizado como fuente tecnica.
