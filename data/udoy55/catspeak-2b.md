# udoy55/CatSpeak-2B

## Resumen

CatSpeak-2B es un adaptador LoRA experimental publicado en Hugging Face por el usuario udoy55, construido sobre el checkpoint base Qwen/Qwen3.5-2B. Su proposito es unico y muy acotado: hacer que el modelo responda exclusivamente con onomatopeyas de gato (meow, mrrp, purr, hiss, chirp, yowl), sin palabras humanas, etiquetas, asteriscos ni emojis. Se trata, por tanto, de un modelo de formato corto y de comportamiento, no de un modelo de proposito general.

El adaptador se entrena con PEFT/LoRA y se distribuye como safetensors (y con etiqueta gguf en los tags), con un total de 1.881.825.088 parametros efectivos reportados en el repositorio y un tamano de repo de 1,3 GB. Requiere cargar el modelo base Qwen3.5-2B para funcionar, y su revision upstream indicada es `15852e8c16360a2fea060d615a32b45270f8a8fc`.

Su relevancia es limitada pero ilustrativa: sirve como ejemplo de adaptacion de comportamiento mediante LoRA con muy pocos datos (12 demostraciones originales con cuatro variaciones de prompt, dos epocas) y como banco de pruebas para evaluar si un modelo base pequeno respeta restricciones de formato estrictas. La model card lo etiqueta explicitamente como experimental y local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda Qwen3.5-2B) con adaptador LoRA (PEFT) |
| Parametros totales | 1.881.825.088 (reportado en safetensors del repo) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los tags incluyen gguf, pero no se detallan variantes) |
| Idiomas soportados | no disponible (el comportamiento esperado es solo onomatopeyas de gato) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); tag gguf presente |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-2B, un transformer decoder-only de aproximadamente 2B parametros. El adaptador no reentrena el modelo base: modifica su comportamiento mediante matrices de bajo rango entrenadas con PEFT. La libreria declarada es `peft` y el pipeline `text-generation`.

El entrenamiento se realizo en una RTX 4070 SUPER con un pico de asignacion CUDA de 4,71 GiB. Se usaron 12 demostraciones originales con cuatro variaciones de prompt durante dos epocas. Cuatro prompts se mantuvieron aparte del entrenamiento como prueba de humo de comportamiento. No se documentan numero de tokens de entrenamiento, composicion del dataset, ni uso de RLHF/DPO. No hay innovaciones tecnicas destacables mas alla del propio ajuste de formato mediante LoRA.

## Capacidades

- Generacion de texto restringida a onomatopeyas de gato (meow, mrrp, purr, prrr, hiss, chirp, yowl) con puntuacion opcional.
- Respuesta a prompts conversacionales cortos manteniendo el formato felino, incluso ante preguntas de conocimiento general (segun las pruebas de humo de la model card).
- Comportamiento controlable mediante system prompt sugerido por el autor.
- Integracion con una aplicacion complementaria que adjunta una foto de gato generada bajo peticion y valida que la respuesta cumpla el formato solo-onomatopeya.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni thinking mode.
- Capacidades multilingues: no disponibles; el objetivo es evitar lenguaje humano por completo.

## Casos de uso

- Demostracion de ajuste de comportamiento con LoRA: usar el adaptador como ejemplo docente de como un modelo base de 2B puede adoptar una restriccion de formato estricta con muy pocos datos (12 demostraciones, 2 epocas) y bajo consumo de VRAM (pico de 4,71 GiB en RTX 4070 SUPER).
- Prueba de robustez de formato: evaluar si el modelo mantiene la restriccion solo-onomatopeya ante prompts adversarios o fuera de distribucion, como preguntas de conocimiento general ("What is the capital of France?"), usando los cuatro prompts de humo como referencia.
- Prototipo de interfaz conversacional tematica: integrar el adaptador en una app de demostracion o chatbot de mascotas donde la salida debe ser siempre onomatopeya, con validacion posterior del formato.
- Generacion de contenido para la app complementaria: alimentar el pipeline que adjunta fotos de gatos y comprueba el formato de las respuestas, por ejemplo en demos interactivas o contenido para redes.
- Banco de pruebas de PEFT: comparar tecnicas de adaptacion (LoRA frente a otras variantes) sobre un mismo modelo base y medir fidelidad al formato y deriva hacia lenguaje humano.
- Experimentos de control de system prompt: estudiar como distintos system prompts afectan el cumplimiento de la restriccion en un modelo pequeno, usando el prompt sugerido por el autor como linea base.
- Evaluacion de alucinacion controlada: analizar como un modelo base pequeno responde a preguntas factuales cuando se le fuerza un canal de salida sin contenido semantico humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pruebas de humo cualitativas:

| Prompt | Respuesta registrada |
|---|---|
| Wake up, I opened a can! | Hiss! Yowl! |
| What is the capital of France? | Mrrp! |
| Give me your longest monologue. | Prrr… meow? |
| Nap on my lap. | Prrr… purr. |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El entrenamiento del adaptador consumio un pico de 4,71 GiB de CUDA en una RTX 4070 SUPER; la inferencia del modelo base de 2B en precision reducida deberia quedar por debajo de esa cifra, pero no hay dato publicado.
- GPU recomendadas: no disponible. La unica referencia es la RTX 4070 SUPER usada para entrenar.
- Compatibilidad con GPU de consumo: probable en GPUs consumer con suficiente VRAM para el modelo base de 2B; no confirmado por el autor.
- Opciones de despliegue: no disponible. El repo usa PEFT y safetensors; el tag gguf sugiere posibles artefactos compatibles con llama.cpp, pero no se detallan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables de la misma categoria (adaptadores LoRA de comportamiento restringido sobre Qwen3.5-2B).

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo etiqueta como experimental y local; no esta pensado para produccion.
- Entrenamiento con datos minimos: 12 demostraciones originales y cuatro variaciones de prompt durante dos epocas; la generalizacion es incierta y las pruebas de humo son una comprobacion pequena, no una evaluacion exhaustiva.
- Dependencia del modelo base: requiere Qwen3.5-2B y la revision upstream indicada; cambios en el checkpoint base pueden alterar el comportamiento.
- Deriva de formato: puede producir palabras humanas, etiquetas, asteriscos o emojis pese al system prompt; la app complementaria valida el formato, lo que sugiere que la restriccion no es garantizada.
- Utilidad semantica nula: la salida esta disenada para no contener lenguaje humano, por lo que no sirve para tareas informativas, de codigo, matematicas o razonamiento.
- Idiomas: no disponibles; no hay soporte multilingue documentado.
- Sesgos: no documentados; no hay informacion sobre evaluacion de sesgos.
- Alucinacion: no aplica en el sentido habitual, ya que la salida evita contenido factual; el riesgo real es el incumplimiento del formato.
- Licencia apache-2.0: permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen3.5-2B.
- Ausencia de traccion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udoy55/CatSpeak-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
