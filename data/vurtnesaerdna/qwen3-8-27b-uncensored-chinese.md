# vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese

## Resumen

Qwen3.8-27B-Uncensored-Chinese es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario vurtnesaerdna, orientado a la escritura creativa de ficcion adulta en chino. El modelo parte de una arquitectura Qwen3.5 (tag `qwen3_5` en el repositorio) con 27.781.427.952 parametros totales y se distribuye como pesos completos en bf16 tras fusionar un adaptador LoRA en los pesos base, por lo que se carga como un modelo estandar mediante `transformers`.

El problema que aborda es la generacion de prosa larga sin restricciones de contenido en chino, un nicho que los modelos alineados suelen rechazar o censurar. El entrenamiento consistio en un SFT con LoRA (r=16, alpha=32) sobre aproximadamente 4.200 pares instruccion/respuesta de ficcion adulta china, con una longitud maxima de 1.536 tokens y dos epocas sobre 4x NVIDIA L4.

Es relevante ahora por dos motivos: demuestra el flujo habitual de personalizacion de un modelo grande mediante LoRA fusionado (sin necesidad de infraestructura de entrenamiento masiva) y porque el modelo base Qwen3.8-27B incorpora capacidad multimodal image-text-to-text, lo que se hereda en este ajuste. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); multimodal image-text-to-text |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de vLLM usa `--max-model-len 4096` y el entrenamiento uso max length 1536 |
| Tipos de cuantizacion | no se publican cuantizaciones oficiales; los pesos se distribuyen en bf16 (repo de 55,6 GB) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), libreria `transformers` |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5 con 27,8 mil millones de parametros, heredado del base Qwen/Qwen3.8-27B. El pipeline declarado en Hugging Face es `text-generation`, pero los tags y la clase de carga (`AutoModelForImageTextToText`) indican que el base soporta entrada image-text-to-text, capacidad que este ajuste conserva a nivel de arquitectura aunque el entrenamiento se centro exclusivamente en texto.

El ajuste consistio en un LoRA SFT con rango 16 y alpha 32, calculando la perdida solo sobre los tokens del asistente. El dataset consta de aproximadamente 4.200 pares instruccion/respuesta de un solo turno construidos a partir de ficcion adulta china, con longitud maxima de 1.536 tokens. Se entrenaron 2 epocas con learning rate 1e-4, decaimiento coseno y tamano de batch efectivo 8, sobre 4x NVIDIA L4 con tensor parallelism. Posteriormente el adaptador LoRA se fusiono en los pesos base, de modo que el repositorio contiene un modelo completo y no requiere cargar el adaptador por separado. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto narrativo largo en chino, con enfasis en ficcion adulta y prosa descriptiva.
- Escritura creativa sin filtros de contenido (modelo marcado `not-for-all-audiences`).
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`), con soporte de mensajes de sistema.
- Modo thinking desactivable (`enable_thinking=False` en el ejemplo del autor).
- Capacidad multimodal image-text-to-text heredada del base Qwen3.8-27B (no validada en el ajuste).
- Muestreo configurable con temperature, top_p, top_k, min_p y presence_penalty.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al chino segun la model card.

## Casos de uso

- Generacion de ficcion adulta en chino: el modelo esta entrenado especificamente sobre prosa narrativa de este genero, con ejemplos de instruccion que piden descripciones realistas, dialogo y ambientacion, por lo que es adecuado para autores que necesitan borradores largos en ese registro.
- Escritura creativa asistida para guionistas y novelistas: permite generar escenas descriptivas con control de tono mediante el mensaje de sistema (por ejemplo, un rol de "escritor experto"), y el muestreo recomendado favorece variedad frente a repeticion.
- Prototipado de personajes conversacionales sin restricciones: la plantilla de chat multi-turno y el system prompt permiten definir una persona concreta y mantener coherencia en conversaciones de varios turnos.
- Investigacion sobre alineacion y seguridad: sirve como caso de estudio de un fine-tune LoRA que elimina el rechazo de contenido, util para evaluar clasificadores de seguridad y politicas de moderacion en pipelines propios.
- Generacion de datos sinteticos de ficcion para experimentos: puede producir corpus narrativos en chino para tareas de estilo, resumen o clasificacion, siempre que el uso cumpla la legalidad aplicable.
- Despliegue en servidores multi-GPU con vLLM: el autor documenta `vllm serve` con tensor-parallel-size 4 y dtype bfloat16, adecuado para servir el modelo como API interna en un entorno controlado.
- Experimentos de continuacion de texto con contexto moderado: con max-model-len 4096 en el ejemplo de vLLM, encaja en tareas de generacion de escenas o capitulos que no requieran ventanas muy largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 55,6 GB de pesos, mas overhead de activaciones y cache KV; en la practica requiere del orden de 60-70 GB para inferencia comoda.
- El autor indica que los ~50 GB de pesos en bf16 necesitan multiples GPU o CPU offload.
- Configuracion documentada por el autor: 4x NVIDIA L4 con tensor parallelism (entrenamiento) y `vllm serve --tensor-parallel-size 4` para inferencia.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU con L4, A6000 o similares; no cabe en una unica GPU consumer de 24 GB en bf16.
- No se publican cuantizaciones GGUF ni versiones para llama.cpp u Ollama, por lo que el despliegue en consumer GPU requeriria cuantizar el modelo por cuenta propia.
- Opciones de despliegue soportadas: `transformers` (con `device_map="auto"` y offload a CPU) y vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Chinese | ~27,8 B | no disponible | zh | Apache-2.0 | Fine-tune LoRA para ficcion adulta en chino |
| Qwen/Qwen3.8-27B (base) | ~27,8 B | no disponible | no disponible | Apache-2.0 | Modelo generalista multimodal alineado |
| Alternativas de ficcion sin censura en chino | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada; la unica comparacion fiable es con su propio modelo base, del que hereda arquitectura, tamano y licencia, y respecto al cual este ajuste pierde parte del instruction following general a cambio de especializacion en prosa adulta en chino.

## Limitaciones y advertencias

- Contenido exclusivamente para adultos (+18): el modelo genera ficcion sexual explicita de forma deliberada; no debe exponerse a menores ni en entornos sin control de edad.
- El entrenamiento se hizo solo con datos en chino; el rendimiento en castellano u otros idiomas no esta validado y probablemente sea deficiente.
- El author advierte que el instruction following fuera de escritura creativa puede ser mas debil que en el modelo base, al haberse entrenado sobre prosa larga.
- Riesgo de repeticion en generaciones muy largas; el autor recomienda evitar decodificacion greedy y usar temperature 0.9, top_p 0.9, top_k 40, min_p 0.05 y presence_penalty 0.6.
- Riesgo de alucinacion y de inconsistencia narrativa en textos largos, comun en fine-tunes de ficcion; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos desconocidos: no se documenta ninguna evaluacion de sesgos del ajuste; el dataset de ficcion adulta puede arrastrar estereotipos de genero y de rol presentes en el corpus original.
- Licencia Apache-2.0 permite uso comercial, pero el contenido generado puede infringir normativas sobre material sexual explicito segun la jurisdiccion; la responsabilidad recae en el desplegador.
- El repositorio incluye el correo electronico personal del autor en la model card; conviene no reutilizarlo como canal de soporte tecnico.
- El tag `not-for-all-anonymous`/`not-for-all-audiences` implica que el modelo no es apto para audiencias generales ni para plataformas con politicas de contenido estrictas.
- No se ofrecen cuantizaciones oficiales, lo que complica el despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
