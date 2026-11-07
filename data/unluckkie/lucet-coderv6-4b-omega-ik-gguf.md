# Unluckkie/Lucet-CoderV6-4B-Omega-IK-GGUF

## Resumen

Lucet-CoderV6-4B-Omega-IK-GGUF es una suite de cuantizaciones GGUF personalizadas del modelo base mohommed/Lucet-CoderV6-4B-Omega, un modelo de generacion de codigo de 4.000 millones de parametros. La publica el usuario Unluckkie bajo el paraguas "Potato Gang Edition" y su valor diferencial no reside en el modelo en si, sino en el proceso de cuantizacion: utiliza un mapa GSQ (grouped scale quantization) adaptado estructuralmente y una imatrix de 600 chunks calibrada sobre el corpus `calibration_chimere.txt` para proteger las capas de atencion y FFN de una compresion excesiva.

El resultado son tres niveles de cuantizacion (IQ4_KS, IQ5_KS e IQ6_K) con tamanos de 2,4 GB, 2,8 GB y 3,3 GB respectivamente, que segun el autor preservan mas calidad que los GGUF estandar equivalentes. La restriccion clave es que estos ficheros emplean tensores `IQ*_KS` e `IQ*_K` y requieren el fork ik_llama.cpp de ikawrakow; no cargan en llama.cpp estandar, Ollama ni LM Studio.

El modelo base pertenece a la familia Lucet-Coder, orientada a generacion de codigo, con etiquetas que sugieren tecnicas de entrenamiento especificas (spark2_5, lucet, spark-x2.6, qr-svd, ast-counterfactual, failure-cluster-mining, uncensored, rco, 1m-context, imatrix). La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base Lucet-CoderV6-4B-Omega); detalles internos no disponibles |
| Parametros totales | 4B (4.000 millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible con cifra confirmada; las etiquetas del modelo base incluyen "1m-context" y el autor menciona "massive native context window" |
| Tipos de cuantizacion | IQ6_K (~3,3 GB, 6,6 bpw), IQ5_KS (~2,8 GB), IQ4_KS (~2,4 GB, 4,25 bpw) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tensores IQ*_KS e IQ*_K, compatibles solo con ik_llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Lucet-CoderV6-4B-Omega en la informacion proporcionada: no se especifican numero de capas, dimensiones ocultas, mecanismo de atencion ni composicion del dataset de entrenamiento. Las etiquetas del repositorio base (spark2_5, lucet, spark-x2.6, qr-svd, ast-counterfactual, failure-cluster-mining, uncensored, rco, 1m-context, imatrix, conversational, custom_code) apuntan a un pipeline de ajuste orientado a codigo con tecnicas de minado de fallos y contrafactuales, pero no hay documentacion tecnica que las desarrolle.

Lo que si esta documentado es el proceso de cuantizacion de esta release: se aplico un mapa GSQ personalizado que adapta la asignacion de bits a la estructura del modelo para preservar atencion y FFN, y se calibro una imatrix de 600 chunks sobre `calibration_chimere.txt` durante una ejecucion nocturna. El autor indica que se omitio deliberadamente el nivel de 3 bits porque el mapa de 4 bits es tan agresivo que un IQ3_K habria tenido un tamano identico con peor calidad. La validacion consistio en una prueba manual estilo HumanEval con el cuantizado IQ4_KS sobre un problema de merge-sort, que genero codigo Python valido y no repetitivo.

## Capacidades

- Generacion de codigo en Python y otros lenguajes, con enfasis en problemas algoritmicos (la validacion publicada cubre merge-sort).
- Generacion de texto general segun el pipeline declarado (text-generation).
- Conversacion multi-turno (etiqueta "conversational" en el modelo base).
- Ventana de contexto nativa amplia segun el autor; la etiqueta "1m-context" del modelo base sugiere hasta 1 millon de tokens, aunque no hay confirmacion numerica en la informacion disponible.
- Modelo "uncensored" segun las etiquetas del modelo base.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente de codigo en local para equipos con GPU de consumo: con 2,4 GB en IQ4_KS, el modelo cabe en GPUs de 8 GB o menos y permite autocompletado y generacion de funciones sin depender de APIs externas.
- Generacion de codigo en pipelines de CI/CD: el tamano reducido y la licencia Apache 2.0 permiten integrarlo en contenedores o runners sin coste de licencia, siempre que se compile ik_llama.cpp en la imagen.
- Prototipado rapido de algoritmos: la validacion del autor sobre merge-sort y la orientacion a codigo lo hacen util para generar borradores de funciones y estructuras de datos en entornos de desarrollo.
- Educacion y aprendizaje de programacion: puede generar ejemplos de codigo y explicaciones en ingles para plataformas de ensenanza, con la ventaja de ejecutarse en hardware modesto.
- Evaluacion de tecnicas de cuantizacion: este repositorio sirve como caso de estudio de cuantizacion con GSQ e imatrix de 600 chunks, util para investigadores que comparan estrategias de compresion en modelos de 4B.
- Despliegue en entornos con restricciones de red o privacidad: al ejecutarse completamente en local con ik_llama.cpp, el codigo del usuario no sale del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Generacion de codigo con contexto largo (si se confirma la ventana de 1M tokens): casos de refactorizacion sobre repositorios extensos donde el modelo necesita ver muchos ficheros a la vez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente menciona una validacion manual cualitativa del cuantizado IQ4_KS sobre un problema de merge-sort, sin metricas cuantitativas (pass@k, MMLU, HumanEval u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4 GB (IQ4_KS), 2,8 GB (IQ5_KS) y 3,3 GB (IQ6_K) solo para los pesos; hay que anadir el espacio de contexto KV, que crece con la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para IQ4_KS con contexto moderado; el autor sugiere el nivel IQ6_K para "the 16GB+ VRAM crowd".
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; tambien en GPUs integradas con suficiente memoria compartida para los niveles mas bajos.
- Opciones de despliegue: exclusivamente ik_llama.cpp (fork de ikawrakow). No es compatible con llama.cpp estandar, Ollama ni LM Studio. El autor proporciona un ejemplo de invocacion con `llama-cli`, `-c 4096 -b 256 -ub 256 --temp 0.1 --jinja`.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Lucet-CoderV6-4B-Omega-IK-GGUF (este) | 4B | no confirmado (etiqueta 1m-context en el base) | Apache 2.0 | GGUF custom, solo ik_llama.cpp | Cuantizacion GSQ + imatrix de 600 chunks; 2,4-3,3 GB |
| mohommed/Lucet-CoderV6-4B-Omega | 4B | no confirmado | Apache 2.0 | Safetensors + GGUF | Modelo base original, pesos completos |
| mohommed/Lucet-Coder-4B-Omega-GGUF | 4B | no disponible | Apache 2.0 | GGUF estandar | Cuantizaciones estandar del autor original, compatibles con llama.cpp/Ollama |
| Otros modelos de codigo de 4B (p. ej. Qwen2.5-Coder-3B/7B) | 3-7B | 32K-128K tipicamente | Apache 2.0 en varias variantes | GGUF, safetensors | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros no cargan en llama.cpp estandar, Ollama ni LM Studio; requieren compilar ik_llama.cpp, lo que anade friccion operativa y limita el ecosistema de herramientas disponibles.
- Idioma: el modelo solo declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: la cifra exacta de ventana de contexto no esta confirmada en la informacion disponible; la etiqueta "1m-context" del modelo base no equivale a una especificacion verificada de esta release cuantizada.
- Riesgo de alucinacion: inherente a los modelos de generacion de codigo de 4B; no hay evaluaciones publicadas que cuantifiquen la tasa de codigo incorrecto o no compilable.
- Sesgos: no documentados por el autor; un modelo entrenado principalmente con codigo en ingles puede reflejar sesgos de ese corpus.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base y los datos de calibracion no impongan restricciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente de la calidad de los cuantizados.
- El autor no publica metricas de perplejidad ni comparaciones cuantitativas frente a los GGUF estandar, por lo que la afirmacion de "menos lobotomizado" no esta respaldada por datos reproducibles.

## Enlaces

- Repositorio Hugging Face de esta release: https://huggingface.co/Unluckkie/Lucet-CoderV6-4B-Omega-IK-GGUF
- Modelo base: https://huggingface.co/mohommed/Lucet-CoderV6-4B-Omega
- GGUF estandar del autor original: https://huggingface.co/mohommed/Lucet-Coder-4B-Omega-GGUF
- Fork ik_llama.cpp (requerido): https://github.com/ikawrakow/ik_llama.cpp
