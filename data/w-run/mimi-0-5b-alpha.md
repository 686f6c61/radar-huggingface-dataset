# w-run/mimi-0.5B-alpha

## Resumen

mimi-0.5B-alpha (nombre en chino: 小喵) es un modelo de lenguaje conversacional en chino de 0,53 mil millones de parámetros entrenado desde cero por el usuario w-run. Se presenta como un modelo de arquitectura propia, no derivada de LLaMA, con 34 capas Transformer, dimensión de 1024 y atención GQA con 16 cabezas de consulta y 4 de clave/valor. Su vocabulario es un BPE chino de 32k tokens y los pesos se distribuyen en fp16 con un tamano de repositorio de 1,1 GB.

El modelo esta disenado explicitamente para ejecutarse en CPU sin herramientas de cuantizacion, con dependencias minimas (`torch` y `tokenizers`). No persigue resultados de benchmark, sino una funcion conversacional ligera y un dominio muy acotado de aritmetica entera basica. Incluye una persona fija (una nina de 12 anos llamada mimi) y rechaza preguntas de caracter privado.

Su relevancia actual es limitada y muy especifica: sirve como ejemplo de arquitectura Transformer propia empaquetada con su codigo de inferencia, y como caso de modelo conversacional de bolsillo en chino. No es adecuado para tareas de codigo, traduccion, conocimiento factual o razonamiento matematico fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer propio, 34 capas, dimension 1024, GQA (16 cabezas de consulta / 4 de clave-valor), SwiGLU, RMSNorm, RoPE |
| Parametros totales | 0,53 mil millones (530M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp16; el autor indica que no requiere cadena de cuantizacion) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch), fp16, ~1,06 GB; definicion de modelo incluida en el repositorio |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only de 34 capas con dimension oculta de 1024, atencion con query grouping (16 cabezas de consulta y 4 de clave-valor), activacion SwiGLU, normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). El vocabulario es un BPE chino de 32k tokens. El autor subraya que la arquitectura es propia y no un reempaquetado de LLaMA, por lo que no se puede cargar con `AutoModel` de transformers; el repositorio incluye la definicion completa y scripts de inferencia (`infer.py`) que permiten cargar el modelo con `torch` y `tokenizers`.

Los datos de entrenamiento descritos son tres bloques: corpus en chino, problemas matematicos sinteticos y dialogos de persona. No se especifica el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se detalla la innovacion tecnica mas alla de la eleccion de arquitectura y del objetivo de ejecucion en CPU sin cuantizacion.

## Capacidades

- Conversacion cotidiana en chino: responde de forma natural a preguntas sobre su identidad, edad y apariencia dentro de la persona definida.
- Aritmetica entera basica: suma, resta, multiplicacion y division con operandos de 2 a 5 digitos, con trazas de razonamiento paso a paso, aunque con una tasa de acierto declarada de en torno al 60-70 %.
- Rechazo de preguntas privadas: ante preguntas sobre ubicacion, telefono o direccion responde que no puede compartir esa informacion.
- Coherencia de identidad: si se le pregunta si es GPT, Claude, DeepSeek o Doubao, niega serlo y afirma ser "小喵".
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso fuera de la aritmetica basica.
- No tiene capacidades multilingues: solo chino.
- No tiene vision, audio ni modo de pensamiento explicito.
- No mantiene memoria entre turnos: no recuerda la conversacion anterior.

## Casos de uso

- Demostracion educativa de arquitectura Transformer propia: el repositorio incluye la definicion completa del modelo y scripts de carga, lo que permite estudiar una implementacion desde cero con GQA, SwiGLU, RMSNorm y RoPE en un modelo de 530M parametros.
- Prototipado de chatbots de persona en chino: util para experimentar con respuestas de identidad fija y rechazo de temas privados en un entorno controlado y de bajo coste.
- Inferencia en CPU sin GPU: al ejecutarse con `pip install torch tokenizers` y cargar en unos 10 segundos, sirve para entornos sin acelerador, portatiles modestos o contenedores ligeros.
- Pruebas de robustez conversacional: su tendencia a respuestas cortas y su tasa de error aritmetico lo convierten en un caso de estudio para evaluar limites de modelos pequenos en dialogos multi-turno (aunque sin memoria entre turnos).
- Generacion de respuestas acotadas en chino para entornos de demostracion: util en demos de interaccion donde no se requiere precision factual ni matematica.
- Evaluacion de estrategias de rechazo: permite probar mecanismos de negativa ante preguntas sensibles en un modelo de muy bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que el modelo no persigue benchmarks y que la aritmetica entera tiene una tasa de acierto aproximada del 60-70 %, con especial dificultad en divisiones de varios digitos.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; los pesos en fp16 ocupan aproximadamente 1,06 GB y el modelo esta pensado para ejecutarse en CPU.
- GPU recomendadas: no aplica; el autor indica que no se necesita tarjeta grafica.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos ~2 GB de memoria si se desea acelerar, aunque el diseno es para CPU.
- Opciones de despliegue: scripts propios `infer.py` con `torch` y `tokenizers`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: en CPU, entre varios segundos y decenas de segundos por respuesta segun la maquina; la carga inicial de pesos tarda unos 10 segundos. No se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mimi-0.5B-alpha | 530M | no disponible | zh | Apache 2.0 | `.pt` (fp16) | Arquitectura propia, inferencia en CPU, sin benchmarks publicados |
| Qwen2.5-0.5B | 494M | 32k (segun version) | multilingue | Apache 2.0 | safetensors, GGUF | Modelo de referencia de tamano similar con soporte amplio de herramientas |
| SmolLM2-360M | 362M | 8k (segun version) | ingles principalmente | Apache 2.0 | safetensors, GGUF | Orientado a eficiencia y despliegue en dispositivo |
| Phi-3-mini | 3,8B | 4k-128k (segun variante) | multilingue | MIT | safetensors, GGUF | Mayor capacidad pero un orden de magnitud mas de parametros |

La comparacion con Qwen2.5-0.5B y SmolLM2-360M es la mas directa por rango de parametros; mimi-0.5B-alpha se diferencia por su arquitectura no estandar, su enfoque exclusivamente conversacional en chino y la ausencia de soporte para tooling estandar de despliegue.

## Limitaciones y advertencias

- Solo soporta chino; no es util para otros idiomas.
- No mantiene memoria entre turnos: cada interaccion es independiente.
- Aritmetica poco fiable: el propio autor declara un 60-70 % de acierto y fallos frecuentes en divisiones de varios digitos.
- No sabe programar, no traduce y no tiene conocimiento de actualidad.
- Las respuestas pueden ser cortas y distantes ("altas"), segun el autor, por limitaciones del dataset de entrenamiento.
- La continuacion de texto largo tiende a desviarse del tema.
- Riesgo de alucinacion en cualquier pregunta fuera del dominio conversacional y aritmetico acotado.
- No se puede cargar con `AutoModel` de transformers; requiere el codigo del repositorio.
- No se documentan sesgos especificos, pero al entrenarse con corpus chino y dialogos sinteticos de persona, es previsible que reproduzca sesgos presentes en esos datos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y la baja fiabilidad matematica desaconsejan su uso en produccion para tareas que requieran precision.

## Enlaces

- Hugging Face: https://huggingface.co/w-run/mimi-0.5B-alpha
- Repositorio del modelo (incluye definicion de arquitectura y `infer.py`): incluido en el propio repositorio de Hugging Face
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web proporcionada.
