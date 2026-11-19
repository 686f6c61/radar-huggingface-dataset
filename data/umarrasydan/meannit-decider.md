# umarrasydan/meannit-decider

## Resumen

Meannit Decider es una conversión a GGUF de Strands Decider 2B v1, un modelo de decisión desarrollado por AWS que responde preguntas tipadas, como una elección entre opciones, devolviendo una probabilidad para cada una. Se construye sobre Qwen3.5-2B-Base de Alibaba mediante un adaptador LoRA y una cabeza de puntero (pointer head) entrenados por AWS. Esta conversión concreta la publica umarrasydan para que Meannit, una aplicación de grabación de reuniones para Mac, ejecute el modelo en la GPU del equipo a través de llama.cpp.

El caso de uso principal es la corrección de transcripciones: el modelo recibe una palabra escrita por el sistema de reconocimiento de voz (por ejemplo, "minute") y decide si es la palabra común o un nombre del diccionario del usuario (por ejemplo, "Meannit"), a partir del significado del nombre y de las líneas de contexto circundantes. No es un modelo de chat: generar texto con él carece de sentido, ya que su salida útil es una distribución de probabilidad sobre opciones predefinidas.

La relevancia de esta ficha es doble: documenta un patrón poco habitual de modelo discriminativo empaquetado en GGUF y sirve de referencia para quienes necesiten ejecutar cabezas de decisión ligeras en hardware de consumo. El repositorio ocupa 2,0 GB y contiene un único archivo Q8_0 de 2.048.810.400 bytes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B-Base) con adaptador LoRA fusionado y cabeza de puntero para clasificación de opciones |
| Parámetros totales | 2B (aproximado, según el nombre del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (ventana `max_length` en `decider.config`) |
| Tipos de cuantización | Q8_0 (único archivo publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`decider-2b-v1-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B-Base, un transformer denso de aproximadamente 2.000 millones de parámetros. Sobre esa base, AWS entrenó un adaptador LoRA con rango 48 y alpha 96, junto con una cabeza de puntero que transforma estados ocultos en probabilidades sobre opciones. La conversión fusiona el LoRA en los pesos base en coma flotante de 32 bits y vuelve a bfloat16, siguiendo el mismo procedimiento que el motor MLX de referencia del decider. Se eliminan la torre de visión y la cabeza de predicción multi-token, de modo que el modelo resultante es exclusivamente de texto.

La innovación técnica del artefacto no está en el entrenamiento (no se reentrenó nada), sino en el empaquetado: además del torso en Q8_0, el GGUF incluye tres metadatos con los ficheros propios del decider sin modificar. `tokenizer.huggingface.json` contiene el tokenizador del decider, distinto del de la base, y debe usarse con padding y truncación desactivados. `decider.config` aporta la ventana de 4.096 tokens y las temperaturas por tipo de pregunta. `decider.head` incluye en base64 el `head.safetensors` de la cabeza de puntero. llama.cpp no interpreta estas claves y carga el archivo como si fuera solo el torso; el consumo de la cabeza y del tokenizador corre a cargo de la aplicación anfitriona.

El procedimiento de inferencia es específico: se renderiza el estado y la pregunta como en `strands_decider/prompting.py`, se tokenizan por separado y se ejecutan por llama.cpp. Se lee el estado oculto tras la normalización final (tensor `result_norm`) en el último token de la línea de cada opción y en el último token, `<answer>`. La cabeza normaliza cada uno, proyecta el del `<answer>` a una query y los de cada opción a keys, y el softmax de sus productos escalares, dividido por la raíz cuadrada de su dimensión y por la temperatura, da la probabilidad de cada opción.

## Capacidades

- Clasificación de opciones con salida probabilística: dado un estado y una pregunta con opciones, devuelve una probabilidad por opción.
- Corrección de transcripciones basada en contexto: distingue palabras comunes de nombres propios del diccionario del usuario usando el significado del nombre y las líneas circundantes.
- Procesamiento de texto exclusivamente: sin visión, sin audio y sin cabeza de predicción multi-token.
- Ventana de contexto de 4.096 tokens, suficiente para estados con varias líneas de transcripción y preguntas de unas 180 tokens.
- Temperatura configurable por tipo de pregunta mediante `temperature_by_kind`.
- No soporta tool calling ni function calling de forma nativa.
- No es un modelo de agentes ni de razonamiento multi-paso: no genera texto ni cadenas de pensamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Corrección de transcripciones en reuniones: Meannit envía cada línea con la palabra dudosa y dos líneas de contexto a cada lado; el modelo decide si es la palabra común o un nombre del diccionario y la línea se corrige solo donde corresponde. Es el caso para el que se construyó el artefacto.
- Desambiguación de nombres propios en subtitulado automático: integrar el decider en un pipeline de ASR para resolver homófonos y topónimos antes de publicar los subtítulos, con latencia de unos 40 ms por pregunta de 180 tokens.
- Normalización de entidades en actas y notas: usar el modelo para mapear variantes ortográficas de nombres de personas y productos a su forma canónica del glosario corporativo.
- Filtrado de falsos positivos en búsqueda y dictado por voz: clasificar candidatos generados por el reconocedor antes de aplicar una sustitución, reduciendo correcciones erróneas.
- Enrutado ligero de intenciones en asistentes de voz: formular la elección como pregunta entre opciones (comando, consulta, conversación) y usar la probabilidad como señal de confianza para el siguiente paso del pipeline.
- Validación de etiquetas en anotación de datos: comprobar de forma automática si una etiqueta propuesta por un anotador o por otro modelo es la más probable dado el contexto, como control de calidad.
- Ejecución local en Mac: desplegar el modelo en la GPU de un Mac mediante llama.cpp para procesar audio sin enviar transcripciones a la nube, algo relevante por privacidad en reuniones confidenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una validación de fidelidad frente al servidor de referencia en MLX, ejecutada en un M5 Max:

| Prueba | Tamaño | Diferencia máxima de probabilidad | Coincidencia de respuesta |
|---|---|---|---|
| Líneas de transcripción con "minute"/"Meannit" | 48 líneas | 0,0176 | 48/48 |
| Estados con tres preguntas cada uno | 6 estados (18 preguntas) | 0,0146 | 18/18 |

Los tokens y las posiciones de opción coincidieron en todas las peticiones. Una pregunta de unos 180 tokens tardó aproximadamente 40 ms.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,0 GB para los pesos Q8_0, más el estado de activaciones y caché KV para 4.096 tokens; una estimación conservadora sitúa el total entre 2,5 y 3,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria; el autor lo ejecuta en la GPU de un Mac (probado en un M5 Max).
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más, como RTX 3050, RTX 4060 o superiores.
- Opciones de despliegue: llama.cpp (probado por el autor, vía API C desde Rust); el formato GGUF es compatible con Ollama y otros runners basados en llama.cpp. No se ha validado con vLLM ni TGI, que no consumen la cabeza de puntero incluida en los metadatos.
- Latencia y throughput: aproximadamente 40 ms por pregunta de 180 tokens en un M5 Max; no se dispone de datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meannit Decider (esta ficha) | ~2B | 4.096 | Probabilidad sobre opciones | Apache 2.0 | GGUF en Hugging Face |
| Strands Decider 2B v1 (original) | ~2B | 4.096 | Probabilidad sobre opciones | Apache 2.0 | Pesos + LoRA + cabeza en Hugging Face |
| Qwen3.5-2B-Base | ~2B | No disponible | Generación de texto | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La diferencia funcional clave es que el decider no genera texto: requiere un runner que lea `result_norm` y aplique la cabeza de puntero, por lo que no es intercambiable con un modelo de chat del mismo tamaño.

## Limitaciones y advertencias

- No es un modelo de chat: invocarlo como generador de texto produce resultados sin sentido.
- Requiere un pipeline de inferencia específico (tokenizador propio, lectura de `result_norm`, aplicación de la cabeza de puntero); llama.cpp por sí solo no lo ejecuta correctamente.
- El tokenizador del decider difiere del de la base y debe usarse con padding y truncación desactivados; usar el tokenizador de Qwen produce resultados incorrectos.
- Ventana limitada a 4.096 tokens, adecuada para líneas de transcripción pero no para documentos largos.
- Idiomas soportados no documentados; el caso de uso validado es inglés ("minute" frente a "Meannit").
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de calibración deficiente en opciones fuera de distribución; la validación publicada cubre solo 66 preguntas.
- Solo se publica cuantización Q8_0; no hay versiones Q4 o Q5 para hardware más ajustado.
- La licencia Apache 2.0 permite uso comercial, pero el archivo de licencia del decider original detalla las licencias de sus datos de entrenamiento, que conviene revisar antes de un despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/umarrasydan/meannit-decider
- Modelo base (Strands Decider 2B v1): https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Meannit: https://meannit.com
