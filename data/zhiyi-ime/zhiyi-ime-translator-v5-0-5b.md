# zhiyi-ime/zhiyi-ime-translator-v5-0.5B

## Resumen

Zhiyi translation model V5-Preview-0.5B (zhiyi-mt-v5-preview) es un modelo de traducción offline de 470 millones de parámetros desarrollado por zhiyi-ime para su integración en Zhiyi IME, un método de entrada (input method editor) de código abierto. Resuelve un problema muy concreto: traducir candidatos y frases del IME mientras el usuario escribe, entre chino, inglés, japonés, coreano, francés, alemán, español, ruso y vietnamita, e incluye una cabeza de etiquetado gramatical (part-of-speech) para el candidato.

La innovación principal de la versión V5-Preview es que la traducción de un candidato continúa el texto previo al cursor en lugar de traducirlo como una unidad aislada. Así, tras 我今天很 ("today I am very"), el candidato 想你 se traduce como "miss you" y no como "I miss you."; la persona, el número y el tiempo verbal siguen el contexto. La arquitectura es Qwen3 (Qwen3ForCausalLM) con 20 capas, tamaño oculto 1024 y embeddings de entrada atados a la capa de salida, derivada del modelo base NiuTrans/LMT-60-0.6B al que se le han eliminado 8 de sus 28 capas.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors (float32) para transformers y en GGUF Q4_K_M (322 MB sin cabeza POS, 332 MB con ella) para llama.cpp. Está pensado para ejecutarse localmente en el dispositivo del usuario, sin conexión, lo que lo hace adecuado para un IME de escritorio que necesita latencia muy baja y privacidad total del texto tecleado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (Qwen3ForCausalLM), 20 capas, hidden size 1024, embeddings de entrada atados a la capa de salida |
| Parametros totales | 470.202.368 (aprox. 0,47B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana formal; en entrenamiento se usan los últimos 80 caracteres del texto previo al cursor |
| Tipos de cuantizacion | float32 (safetensors) y Q4_K_M (GGUF) |
| Idiomas soportados | chino, inglés, japonés, coreano, francés, alemán, español, ruso, vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3 con 20 capas, tamaño oculto 1024 y 470M parámetros, con los embeddings de entrada atados a la capa de salida. Se construyó a partir de NiuTrans/LMT-60-0.6B eliminando 8 de sus 28 capas (se conservan las capas 0-6, 10, 11, 16-23 y 25-27), lo que mantiene la misma estructura, tamaño y velocidad que las versiones v3, v4, v4-1026 y v4-1113-RL del mismo autor. Incluye además una cabeza de part-of-speech de 10 MB distribuida por separado en `pos_head/` para transformers y embebida como metadatos GGUF (`zhiyi.pos_head.*`) en el fichero `-pos.gguf`.

El entrenamiento parte del modelo promediado desde el que arrancó el RL de v4-1113-RL y consta de dos fases. Primero, una pasada sobre 363.859 pares: 203.859 candidatos con su texto precedente real (candidatos de IME chino, palabras de los otros ocho idiomas y texto chino, japonés y coreano con otros idiomas mezclados), traducidos a todos los demás idiomas como continuación del contexto por Qwen3.8-27B, de los cuales 42.651 son conversiones erróneas (juzgadas por Qwen3.8-27B) traducidas carácter a carácter; más 160.000 pares de los datos de v4-1113-RL (frases, candidatos sin contexto, palabras ambiguas) para no olvidar capacidades previas. Después, aprendizaje por refuerzo con GRPO (una pasada sobre 16.800 elementos) usando la recompensa basada solo en reglas de v4-1113-RL (idioma destino verificado con GlotLID, conservación de números y nombres en alfabeto latino, significado anotado de palabras ambiguas, ausencia de copia, repetición o respuestas demasiado largas) y dos comprobaciones nuevas para candidatos en contexto: la mayúscula inicial y la puntuación final de la continuación del profesor, y la prohibición de copiar del contexto un nombre que no aparezca ni en el candidato ni en la traducción del profesor. No se emplea ninguna métrica de calidad aprendida en la recompensa. Las fuentes de texto incluyen SkyPile-150B, LCCC, C4, mC4, FineWeb-2, la Wikipedia en cantonés y Tatoeba.

El modelo se entrenó con un único prompt fijo (el de v4-1113-RL, literal) y no con el formato de chat de LMT-60; otros prompts funcionan mucho peor. El prompt termina en salto de línea tras `assistant`, se decodifica de forma greedy y se detiene en `<|im_end|>`.

## Capacidades

- Traducción entre nueve idiomas (chino, inglés, japonés, coreano, francés, alemán, español, ruso, vietnamita) en cualquier combinación, incluida la traducción cuando el contexto está en un idioma distinto al del candidato.
- Traducción de candidatos de IME como continuación del texto previo al cursor: la persona, el número y el tiempo verbal se ajustan al contexto (她昨天|买了一本书 -> "bought a book"; 他每天都|跑步 -> "runs"; 他一直在|想你 -> "thinking of you").
- Traducción de frases y candidatos sin contexto, comportamiento heredado de v4 (想你 -> "I miss you.").
- Etiquetado gramatical (part-of-speech) del candidato mediante la cabeza POS incluida.
- Tratamiento de conversiones erróneas (caracteres homófonos equivocados) traduciéndolas tal como se escribieron, sin sustituirlas por una suposición del contexto.
- Conservación de números y nombres en alfabeto latino en la salida.
- Sin soporte documentado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción en tiempo real dentro de un IME de escritorio: el modelo traduce candidatos y frases mientras el usuario teclea, con el texto previo al cursor como contexto; su tamaño de 470M y su versión Q4_K_M de 322 MB permiten ejecución local sin conexión y latencia baja, requisito crítico en un método de entrada.
- Traducción contextual de conversaciones multilingües: al continuar el texto previo, mantiene la coherencia gramatical (tiempo, persona, número) en chats o correos donde el usuario cambia de idioma a mitad de frase, algo que un traductor de candidato aislado no consigue.
- Asistencia a la escritura para usuarios de chino que redactan en otros idiomas: traduce el candidato chino al inglés, japonés, francés, etc., respetando el contexto ya escrito, útil en editores de texto y clientes de correo integrados con el IME.
- Etiquetado gramatical para corrección y sugerencias: la cabeza POS permite mostrar la categoría gramatical del candidato en el IME, alimentando funciones de corrección o de sugerencia de sinónimos.
- Traducción offline con privacidad: al ejecutarse en local (GGUF con llama.cpp o transformers), el texto tecleado no sale del dispositivo, adecuado para entornos con requisitos de confidencialidad.
- Procesamiento por lotes de pares texto-contexto: el checkpoint float32 para transformers permite traducir grandes volúmenes de candidatos con su contexto en pipelines de datos o para evaluar la calidad de traducción de un corpus de IME.
- Integración en herramientas de desarrollo con llama.cpp: el GGUF Q4_K_M puede servirse con llama-server (incluida la versión parcheada que expone las etiquetas POS) para prototipos de traducción en aplicaciones de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint float32 de 470M parámetros ocupa aproximadamente 1,9 GB en pesos; en bfloat16, alrededor de 0,9 GB; la versión Q4_K_M en GGUF ocupa 322 MB (332 MB con la cabeza POS).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060 de 12 GB, RTX 4060, RTX 4090 o superiores, y también en GPUs de gama baja con 4 GB o más. Para despliegue en servidor, A100 o H100 no son necesarias pero funcionan.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer con al menos 2-4 GB de VRAM; también puede ejecutarse en CPU, dado su tamaño reducido.
- Opciones de despliegue: transformers (4.56 o posterior para `dtype=`; versiones anteriores usan `torch_dtype=`), llama.cpp (GGUF Q4_K_M), llama-server parcheado para etiquetas POS, y text-generation-inference (el modelo está etiquetado como compatible con endpoints). No se documenta soporte específico de vLLM u Ollama.
- Latencia y throughput estimados: no disponible; el autor indica que mantiene la misma velocidad que las versiones v3 y v4, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| zhiyi-ime-translator-v5-0.5B | 470M | 80 caracteres de contexto en entrenamiento | 9 (zh, en, ja, ko, fr, de, es, ru, vi) | Apache 2.0 | safetensors, GGUF |
| NiuTrans/LMT-60-0.6B (modelo base) | 0,6B (28 capas) | no disponible | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| v4-1113-RL (versión previa del mismo autor) | 470M | sin traducción contextual de candidato | 9 | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, idiomas y licencia.

## Limitaciones y advertencias

- El modelo solo funciona bien con el prompt exacto de entrenamiento; otros prompts producen resultados mucho peores, lo que limita su reutilización fuera del ecosistema Zhiyi IME.
- El contexto se limita a los últimos 80 caracteres del texto previo al cursor, tal como se entrenó; contextos más largos no se aprovechan.
- Traduce conversiones erróneas (caracteres homófonos equivocados) tal como se escribieron, de modo que la salida puede parecer incorrecta; es un comportamiento intencionado, no un fallo.
- Riesgo de alucinación inherente a un modelo generativo de 470M parámetros; la recompensa de RL se basa solo en reglas y no en una métrica de calidad aprendida, por lo que la calidad de traducción puede degradarse en dominios alejados de los datos de entrenamiento (SkyPile-150B, LCCC, C4, mC4, FineWeb-2, Wikipedia cantonés, Tatoeba).
- Idiomas soportados limitados a nueve; no cubre otras lenguas y puede fallar con texto mixto o con variantes dialectales no representadas.
- La cabeza POS solo está disponible en el fichero `-pos.gguf` con un llama-server parcheado o mediante `pos_head/` en transformers; el GGUF estándar no la incluye.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de NiuTrans/LMT-60-0.6B, cuyas condiciones de licencia no se detallan en la información disponible; conviene verificarlas antes de un despliegue comercial.
- El modelo está etiquetado como "V5-Preview" y tiene muy pocas descargas (38) y ningún "like", lo que sugiere poca validación externa; no se han publicado benchmarks que respalden su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhiyi-ime/zhiyi-ime-translator-v5-0.5B
- Repositorio de Zhiyi IME: https://github.com/dd1000001000/zhiyi_ime
- Release translator-v5-preview (GGUF sin cabeza y checkpoint en zip): https://github.com/dd1000001000/zhiyi_models/releases/tag/translator-v5-preview
- Modelo base NiuTrans/LMT-60-0.6B: https://huggingface.co/NiuTrans/LMT-60-0.6B
- GlotLID (verificación de idioma usada en la recompensa): https://huggingface.co/cis-lmu/glotlid
- Qwen (familia de modelos, incluido el profesor Qwen3.8-27B): https://huggingface.co/Qwen
