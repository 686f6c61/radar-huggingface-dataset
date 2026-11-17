# unfold-labs/unfold-dictation-adapter

## Resumen

Unfold Dictation Adapter es un adaptador LoRA en formato GGUF desarrollado por unfold-labs para el modelo base Qwen3.5-0.8B. Su funcion es el post-procesado de texto dictado: recibe una transcripcion en bruto y la reescribe aplicando reglas de maquetacion (listas, parrafos), eliminando muletillas y palabras repetidas, y aplicando correcciones habladas, sin alterar las palabras del hablante. Esta pensado para ejecutarse en CPU dentro de la aplicacion de escritorio Unfold Note, antes de pegar el texto en el campo de destino.

El adaptador tiene 6.389.760 parametros (rango LoRA 16, alpha 32, sobre proyecciones de atencion y MLP) y ocupa un repositorio de 0,0 GB, ya que solo distribuye el adaptador en f16 y un manifiesto JSON; el modelo base no se incluye. Soporta frances e ingles y se distribuye bajo licencia Apache-2.0.

Su relevancia es acotada pero clara: demuestra un patron de despliegue de un adaptador LoRA en GGUF sobre llama.cpp para una tarea de formato muy especifica, con un mecanismo de verificacion posterior (comprobacion de palabras) que degrada a la transcripcion original si la salida introduce o elimina demasiado texto. No es un modelo generalista ni compite en benchmarks de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16, alpha 32) sobre proyecciones de atencion y MLP de Qwen3.5-0.8B |
| Parametros totales | 6.389.760 (adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; no especificada) |
| Tipos de cuantizacion | adaptador en f16; el modelo base se usa en Q4_K_M en la app |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA); manifiesto JSON con version, pin del modelo base, pin del prompt, tamanos y sha256 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 aplicado sobre las proyecciones de atencion y MLP del transformer Qwen3.5-0.8B. Se entreno durante 2 epocas sobre aproximadamente 2.900 ejemplos, con la perdida calculada unicamente sobre la respuesta (el texto maquetado), no sobre la entrada. Los datos son sinteticos y no contienen datos de usuarios: Qwen3-4B-Instruct genero mensajes dictados cortos, enumeraciones, correcciones y peticiones en frances e ingles, y cada par de entrenamiento se construyo por reglas, derivando el dictado en bruto a partir del texto maquetado (lista dicha en una frase, parrafos unidos, muletillas, palabras repetidas y una frase erronea corregida en voz alta). Una referencia nunca contiene una palabra que su dictado no tenga.

La conversion a GGUF se realizo con `convert_lora_to_gguf.py` de llama.cpp v0.7.0. El adaptador se entrena con un unico system prompt (sha256 `dacfdd2957c8dbfb4a32f72fb55ccbf3643416b9920f4c19d8ffb6fe9e4e87b5`), con el dictado como mensaje de usuario, en la plantilla de chat de Qwen con bloque de pensamiento vacio, y se decodifica de forma greedy. No se menciona RLHF ni DPO.

## Capacidades

- Maquetacion de texto dictado: convierte enumeraciones de tres o mas elementos en lineas que empiezan por `- `.
- Segmentacion en parrafos: inicia un parrafo nuevo al cambiar de tema.
- Limpieza: elimina muletillas ("euh", "um") y palabras repetidas.
- Aplicacion de correcciones habladas: "a Thomas, non pardon, a Claire" pasa a "a Claire".
- Preservacion de numeros: mantiene los numeros tal como se dictaron, en palabras, sin convertirlos a digitos.
- No responde al contenido: una pregunta o una orden dictada se copia, nunca se contesta.
- No traduce: mantiene el idioma del hablante.
- Bilinguismo frances-ingles.
- Integracion via node-llama-cpp con carga de adaptadores LoRA (`model.createContext({ lora: { adapters: [{ filePath: 'dictation-lora.gguf' }] } })`).
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio.

## Casos de uso

- Post-procesado de dictado en aplicaciones de escritorio: el adaptador se aplica sobre la transcripcion antes de pegarla en el campo de texto, con una latencia mediana de 902 ms en CPU con 4 hilos para textos de 12 a 138 palabras.
- Limpieza de notas de reunion: convierte una enumeracion dictada de forma corrida en una lista con vinetas y separa los cambios de tema en parrafos, sin alterar las palabras del hablante.
- Redaccion de correos por voz: elimina muletillas y repeticiones de un dictado para correo, manteniendo los numeros en palabras tal como se dijeron.
- Correccion de nombres o destinatarios dictados: aplica correcciones habladas del tipo "a Thomas, no, perdon, a Claire" para fijar el destinatario correcto.
- Dictado de ordenes o preguntas sin ejecucion: en asistentes de toma de notas, copia literalmente una pregunta u orden dictada en lugar de responderla, lo que evita respuestas no deseadas en el texto.
- Despliegue en CPU sin GPU: al ser un adaptador LoRA sobre un modelo de 0,8B cuantizado en Q4_K_M, puede ejecutarse en el ordenador del usuario con llama.cpp y node-llama-cpp, sin infraestructura de servidor.
- Filtro de seguridad en pipelines de dictado: combinado con la comprobacion de palabras de la app, si la salida introduce palabras no dichas o elimina demasiadas, se pega la transcripcion original, lo que permite usar el adaptador en produccion con una red de seguridad.

## Benchmarks y rendimiento

Resultados publicados por el autor con el modelo base cuantizado Q4_K_M mas el adaptador, en CPU con 4 hilos:

| Medida | Resultado |
|---|---|
| Pares reservados: respuesta igual a la referencia | 149 de 159 |
| Pares reservados: respuestas aceptadas por la comprobacion de palabras de la app | 159 de 159 |
| Textos escritos a mano: listas creadas donde se desean | 10 de 10 |
| Textos escritos a mano: listas creadas donde no se desean | 0 |
| Textos escritos a mano: correcciones habladas aplicadas | 3 de 3 |
| Textos escritos a mano: textos con muletilla residual | 0 de 3 |
| Tiempo mediano (27 textos de 12 a 138 palabras) | 902 ms |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador pesa 6,39 M de parametros y el modelo base Qwen3.5-0.8B en Q4_K_M es de tamano reducido, apto para CPU.
- El autor ejecuta el modelo en CPU con 4 hilos dentro de la aplicacion de escritorio, sin GPU.
- GPU recomendadas: no disponibles; el caso de uso declarado es CPU.
- Cabe en GPU de consumo por el tamano del modelo base (0,8B), aunque no se publican cifras de VRAM.
- Opciones de despliegue: llama.cpp (conversion con `convert_lora_to_gguf.py` v0.7.0) y node-llama-cpp con carga de adaptadores LoRA. No se documentan vLLM, Ollama ni TGI.
- Latencia: mediana de 902 ms en CPU con 4 hilos para textos de 12 a 138 palabras. Throughput no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales frente al modelo base y a la categoria de adaptadores de formato:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| unfold-dictation-adapter | 6,39 M (adaptador LoRA) | no disponible | Apache-2.0 | GGUF (LoRA) | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8B (aproximado, segun nombre) | no disponible | Apache-2.0 | safetensors, GGUF | Hugging Face |
| Alternativas de adaptadores de formato para dictado | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado sobre texto sintetico, no sobre salida real de reconocimiento de voz; el dominio de entrada real puede diferir del de entrenamiento.
- No repara gramatica: tras eliminar una muletilla puede quedar una elision francesa ausente ("que on").
- Una correccion hablada puede eliminar demasiadas palabras.
- El adaptador esta ligado a un unico system prompt y a una plantilla de chat concreta (Qwen, bloque de pensamiento vacio) y a decodificacion greedy; desviarse de esa configuracion puede degradar el comportamiento.
- El modelo base no se incluye en el repositorio y debe obtenerse por separado (pin GGUF con sha256 `bd258782e35f7f458f8aced1adc053e6e92e89bc735ba3be89d38a06121dc517` en unfold-labs/unfold-search-planner).
- Solo soporta frances e ingles.
- Riesgo de alucinacion mitigado por la comprobacion de palabras de la app, que pega la transcripcion original si la salida introduce palabras no dichas o elimina demasiadas; fuera de ese entorno de verificacion, ese control no existe.
- No dispone de tool calling, agentes, vision ni audio.
- Licencia Apache-2.0, que permite uso comercial; el modelo base Qwen3.5-0.8B es tambien Apache-2.0 segun la model card.
- Sin descargas ni likes en el momento de la consulta y creado el 2026-11-16; madurez y soporte de la comunidad no disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unfold-labs/unfold-dictation-adapter
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base GGUF con pin sha256: https://huggingface.co/unfold-labs/unfold-search-planner
- Aplicacion Unfold Note: https://unfoldnote.app
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp (conversion LoRA a GGUF): no disponible en la informacion proporcionada
- node-llama-cpp: no disponible en la informacion proporcionada
