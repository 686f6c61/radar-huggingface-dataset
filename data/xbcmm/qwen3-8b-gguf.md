# xbcmm/Qwen3-8B-GGUF

## Resumen

Qwen3-8B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3-8B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. Se trata de un modelo de lenguaje causal de tipo denso (no MoE) con 8.190.735.360 parámetros totales (6,95 mil millones sin contar los embeddings), diseñado para generación de texto, razonamiento, código y tareas de agente. Esta variante concreta, publicada por el usuario xbcmm, empaqueta los pesos en GGUF para su ejecución con llama.cpp y Ollama, lo que permite desplegarlo en hardware de consumo.

El modelo destaca por su capacidad de alternar entre modo "thinking" (razonamiento explícito paso a paso) y modo "non-thinking" (diálogo directo) dentro de un mismo modelo, algo poco habitual en la familia Qwen2.5. Incorpora 36 capas con atención GQA (32 cabezas de consulta y 8 de clave-valor), contexto nativo de 32.768 tokens ampliable a 131.072 mediante YaRN, y soporte declarado de más de 100 idiomas.

Su relevancia actual radica en que ofrece un equilibrio entre capacidades de razonamiento y requisitos de hardware moderados, con licencia Apache 2.0 que permite uso comercial sin restricciones significativas. La cuantización GGUF facilita su adopción en entornos locales y de borde donde no se dispone de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (no MoE) |
| Parametros totales | 8.190.735.360 (8,2B); 6,95B sin embeddings |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativo; 131.072 con YaRN |
| Tipos de cuantizacion | q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | más de 100 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 32,0 GB) |

## Arquitectura y entrenamiento

Qwen3-8B es un transformer causal denso con 36 capas. Usa Grouped Query Attention (GQA) con 32 cabezas de consulta y 8 de clave-valor, lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza completa. El modelo se entrenó en dos fases: preentrenamiento y postentrenamiento, e incluye alineación con preferencias humanas orientada a escritura creativa, role-play, diálogo multi-turno y seguimiento de instrucciones. La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset.

La innovación principal es la integración de los modos thinking y non-thinking en un único modelo, controlable mediante las directivas `/think` y `/no_think` en el prompt o el mensaje de sistema, con seguimiento de la instrucción más reciente en conversaciones multi-turno. Para contextos largos se emplea YaRN (paper arXiv:2309.00071), que en implementaciones open source es estático, por lo que la model card advierte de que puede degradar el rendimiento en textos cortos si se activa innecesariamente. Se recomienda ajustar el factor de escala (por ejemplo, 2.0 para contextos típicos de 65.536 tokens).

## Capacidades

- Generación de texto y razonamiento lógico, matemático y de sentido común, con mejora declarada frente a QwQ en modo thinking y frente a Qwen2.5 instruct en modo non-thinking.
- Generación de código y resolución de problemas de programación.
- Cambio dinámico entre modo thinking (razonamiento explícito) y non-thinking (respuesta directa) dentro de la misma conversación.
- Soporte de tool calling y function calling en ambos modos, con integración con herramientas externas.
- Capacidades de agente y razonamiento multi-paso, con rendimiento destacado entre modelos open source en tareas complejas de agente (según la model card).
- Multilingüe: más de 100 idiomas y dialectos, con seguimiento de instrucciones y traducción.
- Alineación con preferencias humanas para escritura creativa, role-play y diálogo multi-turno.
- No se declaran capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistente de atención al cliente multi-turno: el contexto nativo de 32.768 tokens permite mantener historiales largos de conversación sin truncar, y el modo non-thinking ofrece respuestas rápidas para consultas rutinarias.
- Generación de código en pipelines de CI/CD: el soporte de tool calling y el modo thinking permiten integrar el modelo en flujos que requieren razonamiento sobre errores de compilación o sugerencias de parches.
- Agentes autónomos con herramientas externas: la capacidad de alternar modos y de invocar funciones lo hace adecuado para orquestar tareas multi-paso con APIs, bases de datos o sistemas de ficheros.
- Razonamiento matemático asistido: el modo thinking está diseñado para problemas de lógica y matemáticas donde se requiere cadena de razonamiento explícita, útil en herramientas educativas o de análisis.
- Traducción y procesamiento multilingüe: con más de 100 idiomas declarados, sirve para localización de contenidos o atención al cliente en múltiples regiones.
- Despliegue local y en el borde: la cuantización GGUF (q4_K_M en adelante) permite ejecutarlo en estaciones de trabajo o portátiles con GPU de consumo mediante llama.cpp u Ollama, sin depender de la nube.
- Generación de documentación técnica y escritura creativa: la alineación con preferencias humanas y el role-play lo hacen útil para redacción asistida y generación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog, GitHub y documentación oficiales de Qwen para consultar evaluaciones, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otras) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada según cuantización, no confirmada en la información disponible):
  - q4_K_M: en torno a 5-6 GB.
  - q5_K_M / q5_0: en torno a 6-7 GB.
  - q6_K: en torno a 7-8 GB.
  - q8_0: en torno a 9-10 GB.
  - FP16 (no incluido en este repo): en torno a 16 GB.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090 para cuantizaciones q4 a q8; GPUs de datacenter como A100 o H100 para FP16 y contextos largos.
- Cabe en GPU de consumo: sí, en cuantizaciones q4_K_M a q8_0 con GPUs de al menos 6-10 GB de VRAM, siempre que el contexto no sea muy extenso (el KV cache crece con la longitud).
- Opciones de despliegue: llama.cpp (comando de ejemplo en la model card con `-ngl 99 -fa -sm row`), Ollama (`ollama run hf.co/Qwen/Qwen3-8B-GGUF:Q8_0`), y cualquier framework compatible con GGUF. No se mencionan vLLM ni TGI para esta variante GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-GGUF (este) | 8,2B | 32.768 nativo / 131.072 YaRN | Apache 2.0 | GGUF | Modos thinking/non-thinking, tool calling, multilingüe |
| Qwen2.5-7B-Instruct | ~7,6B | 32.768 nativo / 131.072 | Apache 2.0 | safetensors, GGUF | Generación anterior; sin modo thinking integrado |
| Llama 3.1 8B Instruct | 8,0B | 131.072 | Llama 3.1 Community License | safetensors, GGUF | Contexto nativo largo; licencia con restricciones |
| Mistral 7B Instruct | 7,2B | 32.768 | Apache 2.0 | safetensors, GGUF | Sin modo thinking; menor contexto nativo |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada; cabe esperar sesgos derivados de los datos de entrenamiento, no detallados.
- El modo thinking puede generar razonamientos extensos y aumentar la latencia y el consumo de tokens; se recomienda reservarlo para tareas complejas.
- La model card advierte de no usar decodificación greedy en modo thinking, ya que puede degradar el rendimiento y provocar repeticiones infinitas.
- Para modelos cuantizados se recomienda `presence_penalty` de 1,5; valores más altos pueden causar mezcla de idiomas y ligera reducción del rendimiento.
- YaRN estático en frameworks open source: activarlo siempre puede perjudicar el rendimiento en textos cortos; debe configurarse solo cuando se procesen contextos largos.
- El contexto nativo es de 32.768 tokens; superarlo sin YaRN puede degradar la calidad.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar el enlace de licencia indicado en la model card (apunta al repositorio oficial de Qwen).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: variante no oficial publicada por un tercero (xbcmm), sin garantías de mantenimiento ni verificación por parte de Qwen.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/xbcmm/Qwen3-8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen3-8B-GGUF
- Licencia: https://huggingface.co/Qwen/Qwen3-8B-GGUF/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentación de llama.cpp para Qwen: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Documentación de Ollama para Qwen: https://qwen.readthedocs.io/en/latest/run_locally/ollama.html
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Paper de Qwen3: https://arxiv.org/abs/2505.09388
- Chat de Qwen: https://chat.qwen.ai/
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
