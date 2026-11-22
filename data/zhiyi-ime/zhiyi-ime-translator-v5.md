# zhiyi-ime/zhiyi-ime-translator-v5

## Resumen

Zhiyi translation model V5-Preview (zhiyi-mt-v5-preview) es un modelo de traduccion offline de 470 millones de parametros desarrollado por zhiyi-ime para su integracion en el teclado de entrada Zhiyi IME. Su proposito es traducir candidatos de entrada y frases mientras el usuario escribe, entre chino, ingles, japones, coreano, frances, aleman, espanol, ruso y vietnamita, incorporando ademas una cabeza de etiquetado gramatical (part-of-speech) para cada candidato.

La innovacion principal de la version V5-Preview frente a v4-1113-RL es que la traduccion de un candidato se genera como continuacion del texto previo al cursor, en lugar de tratarse de forma aislada. Asi, tras "我今天很" el candidato "想你" se traduce como "miss you" y no como "I miss you.", ajustando sujeto, persona, numero y tiempo verbal al contexto. El contexto no se retraduce y no se anaden mayusculas ni puntuacion final que la continuacion no tendria. Este comportamiento se mantiene entre los nueve idiomas, incluso cuando el contexto esta en un idioma distinto al del candidato.

El modelo deriva de NiuTrans/LMT-60-0.6B, al que se han eliminado 8 de sus 28 capas, y comparte estructura, tamano y velocidad con las versiones v3, v4, v4-1026 y v4-1113-RL. Se distribuye bajo licencia Apache 2.0 en formato safetensors (float32) y GGUF cuantizado Q4_K_M, con el repositorio ocupando 2,6 GB. Zhiyi IME lo utiliza desde el 15 de noviembre de 2026 (manifest de traductor 8, mostrado como "v5" en Ajustes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (Qwen3ForCausalLM), 20 capas, hidden size 1024, embeddings de entrada atados a la capa de salida |
| Parametros totales | 470.202.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana formal; el contexto de entrenamiento usa los ultimos 80 caracteres previos al cursor |
| Tipos de cuantizacion | float32 (safetensors), Q4_K_M (GGUF) |
| Idiomas soportados | zh, en, ja, ko, fr, de, es, ru, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32), GGUF (Q4_K_M, con y sin cabeza POS) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de la familia Qwen3 con 20 capas, hidden size de 1024 y embeddings de entrada atados a la capa de salida. Parte de NiuTrans/LMT-60-0.6B, del que se han eliminado 8 de sus 28 capas originales, conservando las capas 0-6, 10, 11, 16-23 y 25-27. Incorpora una cabeza auxiliar de part-of-speech de aproximadamente 10 MB, distribuida por separado en `pos_head/` para transformers y embebida como metadatos GGUF (`zhiyi.pos_head.*`) en la variante `-pos.gguf`.

El entrenamiento parte del modelo promediado desde el que arranco el aprendizaje por refuerzo de v4-1113-RL y consta de dos fases. La primera es una pasada sobre 363.859 pares: 203.859 candidatos con su texto precedente real (candidatos de IME en chino, palabras de los otros ocho idiomas y texto chino, japones y coreano con otros idiomas mezclados), traducidos a todos los demas idiomas como continuacion del contexto mediante Qwen3.8-27B, incluyendo 42.651 conversiones erroneas (juzgadas por Qwen3.8-27B) traducidas caracter a caracter; mas 160.000 pares de los datos de v4-1113-RL (frases, candidatos sin contexto, palabras ambiguas) para evitar olvido catastrofico. La segunda fase es aprendizaje por refuerzo con GRPO sobre 16.800 elementos, usando la recompensa basada solo en reglas de v4-1113-RL (idioma objetivo verificado con GlotLID, conservacion de numeros y nombres en alfabeto latino, significado anotado de palabras ambiguas, ausencia de copia, repeticion o respuestas demasiado largas) mas dos comprobaciones nuevas para candidatos en contexto: la capitalizacion de la primera letra y la puntuacion final de la continuacion del profesor, y la no copia de nombres del contexto que no aparezcan ni en el candidato ni en la traduccion del profesor. No se emplea ninguna metrica de calidad aprendida en la recompensa. Las fuentes de texto son SkyPile-150B, LCCC, C4, mC4, FineWeb-2, la Wikipedia en cantonés y Tatoeba.

## Capacidades

- Traduccion de candidatos de IME y frases entre nueve idiomas: chino, ingles, japones, coreano, frances, aleman, espanol, ruso y vietnamita.
- Traduccion como continuacion del contexto: ajusta sujeto, persona, numero y tiempo verbal al texto previo al cursor, sin retraducir el contexto ni anadir mayusculas o puntuacion final improcedentes.
- Traduccion entre idiomas cruzados: el contexto puede estar en un idioma distinto al del candidato.
- Etiquetado gramatical (part-of-speech) del candidato mediante una cabeza auxiliar dedicada.
- Manejo de conversiones erroneas: una conversion incorrecta (caracteres homofonos equivocados) se traduce tal cual se escribio, sin sustituirla por una conjetura del contexto.
- Traduccion sin contexto: si se omite la linea `Context:`, traduce el texto de forma aislada como en versiones anteriores.
- Acepta `Text` como nombre de idioma origen para idiomas desconocidos.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio segun la informacion disponible.

## Casos de uso

- Traduccion en tiempo real dentro de un teclado de entrada: el modelo traduce candidatos y frases mientras el usuario escribe, con latencia compatible con la interaccion, gracias a sus 470M de parametros y a la cuantizacion Q4_K_M de 322-332 MB que permite ejecucion local en el dispositivo.
- Entrada multilingue en movil o escritorio sin conexion: al ser un modelo offline, se integra en Zhiyi IME para ofrecer traduccion entre nueve idiomas sin depender de servicios en la nube, reduciendo latencia y preservando la privacidad del texto tecleado.
- Redaccion asistida en un segundo idioma: el usuario escribe en su idioma y el modelo completa la traduccion como continuacion del texto ya redactado, manteniendo coherencia de tiempo verbal y persona a lo largo de la frase.
- Correccion y diagnostico de conversiones erroneas: al traducir literalmente las conversiones incorrectas en lugar de adivinarlas por contexto, el modelo ayuda a detectar errores de seleccion de caracteres homofonos en la entrada.
- Etiquetado gramatical para herramientas linguisticas: la cabeza POS permite anotar la categoria gramatical del candidato, util en correctores, diccionarios o asistentes de aprendizaje de idiomas integrados en el teclado.
- Traduccion de texto mixto chino-japones-coreano con otros idiomas: entrenado con texto CJK con otros idiomas mezclados, es adecuado para entradas que combinan varios sistemas de escritura en una misma frase.
- Procesamiento por lotes de pares contexto-candidato: mediante transformers o llama.cpp se puede usar para generar traducciones de continuacion en pipelines de datos, por ejemplo para construir corpus paralelos o evaluar sistemas de IME.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en float32 ocupa aproximadamente 1,9 GB (470M parametros a 4 bytes); en bfloat16 unos 0,94 GB; la variante GGUF Q4_K_M ocupa 322 MB (sin cabeza POS) y 332 MB (con cabeza POS).
- GPU recomendadas: no disponibles de forma explicita; por tamano, cualquier GPU consumer con 2 GB o mas de VRAM puede alojar el modelo en Q4_K_M o bfloat16.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna (por ejemplo, series RTX 30/40 o equivalentes) e incluso en CPU, dado el reducido tamano del modelo.
- Opciones de despliegue: transformers 4.56 o superior (con `dtype=`; versiones anteriores usan `torch_dtype=`), llama.cpp mediante los GGUF Q4_K_M, y llama-server parcheado para obtener etiquetas POS a partir de la variante `-pos.gguf`. El modelo es compatible con text-generation-inference y endpoints segun los tags del repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El autor indica que mantiene la misma velocidad que v3, v4, v4-1026 y v4-1113-RL.
- Parametros de decodificacion recomendados: decodificacion greedy y parada en `<|im_end|>`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zhiyi-ime-translator-v5 | 470M | 80 caracteres de contexto en entrenamiento | Apache 2.0 | Hugging Face (safetensors + GGUF) | Especializado en traduccion de candidatos de IME con continuacion contextual y cabeza POS |
| NiuTrans/LMT-60-0.6B | 0.6B (28 capas) | no disponible | no disponible en la informacion | Hugging Face | Modelo base del que deriva; el V5 elimina 8 capas |
| v4-1113-RL (misma familia) | 470M | no disponible | no disponible en la informacion | no disponible en la informacion | Version previa; traduce candidatos de forma aislada, sin continuacion contextual |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con el prompt exacto de entrenamiento (el de v4-1113-RL, palabra por palabra); otros prompts rinden mucho peor.
- El contexto se limita a los ultimos 80 caracteres previos al cursor, tal como se entreno; contextos mas largos no se aprovechan.
- Una conversion erronea se traduce literalmente, por lo que el resultado puede parecer incorrecto; es un comportamiento deliberado, no un fallo.
- El contexto influye en la forma de la traduccion aunque el prompt indique "solo para elegir el significado", lo que puede producir resultados distintos a los esperados si se usa fuera del caso de IME.
- No se han publicado benchmarks ni metricas de calidad objetivas; el rendimiento real no esta cuantificado en la informacion disponible.
- No dispone de tool calling, capacidades de agente, vision ni audio.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada.
- La cabeza POS solo esta disponible en transformers (carpeta `pos_head/`) y en la variante `-pos.gguf` con llama-server parcheado; las builds de llama.cpp que no reconocen las claves `zhiyi.pos_head.*` las ignoran.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base NiuTrans/LMT-60-0.6B, cuya licencia no se detalla en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhiyi-ime/zhiyi-ime-translator-v5
- Modelo base: https://huggingface.co/NiuTrans/LMT-60-0.6B
- Repositorio de Zhiyi IME: https://github.com/dd1000001000/zhiyi_ime
- Release translator-v5-preview: https://github.com/dd1000001000/zhiyi_models/releases/tag/translator-v5-preview
- GlotLID (verificador de idioma usado en la recompensa): https://huggingface.co/cis-lmu/glotlid
- Qwen (familia del profesor Qwen3.8-27B): https://huggingface.co/Qwen
