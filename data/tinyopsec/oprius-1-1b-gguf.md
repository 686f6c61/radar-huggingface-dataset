# tinyopsec/Oprius-1.1B-GGUF

## Resumen

Oprius-1.1B-GGUF es la distribucion en formato GGUF del modelo Oprius-1.1B, un ajuste fino (fine-tuning) del conocido TinyLlama-1.1B-Chat-v1.0 orientado a conversacion casual. El modelo original lo publica el usuario zzzekryo, y esta version cuantizada la mantiene el usuario tinyopsec, que ha generado el conjunto de ficheros GGUF con llama.cpp para su uso en runtimes de inferencia locales. Con 1.100.048.384 parametros (aproximadamente 1,1 mil millones), se situa en la categoria de modelos pequenos, pensados para ejecucion en CPU o en GPUs de consumo con requisitos de memoria muy bajos.

La relevancia de esta ficha es practica: se trata de un artefacto de cuantizacion, no de un modelo nuevo, y su interes radica en la disponibilidad de hasta trece variantes de cuantizacion (desde F16 hasta Q2_K) que permiten desplegar un chatbot ligero en entornos con recursos limitados. El autor del modelo base lo ha marcado como obsoleto (deprecated) por haber sido entrenado con un dataset antiguo, lo que condiciona su uso en produccion.

Arquitectura derivada de TinyLlama (transformer decoder-only tipo Llama), ventana de contexto heredada del modelo base y licencia Apache 2.0. No se dispone de informacion detallada sobre el dataset de ajuste fino ni sobre el proceso de entrenamiento en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, derivada de TinyLlama-1.1B-Chat-v1.0) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Oprius-1.1B es un ajuste fino de TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de la familia Llama con 1,1 mil millones de parametros. Segun la model card, el ajuste se realizo sobre un dataset de conversacion casual, aunque no se especifica el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras).

Esta distribucion concreta no introduce cambios arquitectonicos: es una conversion a GGUF realizada con llama.cpp sobre los pesos del modelo base, con cuantizaciones que van desde F16 (2,2 GB) hasta Q2_K. El repositorio ocupa 10,6 GB en total por acumular todas las variantes. El autor del modelo base ha marcado el modelo como obsoleto por haber usado un dataset antiguo, por lo que se recomienda evaluar su comportamiento antes de usarlo.

## Capacidades

- Generacion de texto conversacional en ingles (idioma principal del modelo base TinyLlama; el resto de idiomas no esta documentado).
- Dialogo multi-turno orientado a conversacion casual.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente o razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidades de codigo y matematicas no documentadas y, por el tamano y el tipo de ajuste, previsiblemente limitadas.
- Compatible con cualquier runtime que lea GGUF (llama.cpp, Ollama, LM Studio, koboldcpp).

## Casos de uso

- Chatbot local de bajo coste: el modelo puede ejecutarse en CPU o en GPUs de consumo con la cuantizacion Q4_K_M, lo que lo hace adecuado para prototipos de asistente conversacional en un portatil.
- Pruebas de integracion de pipelines GGUF: util para validar el flujo de despliegue con llama.cpp u Ollama antes de migrar a modelos mayores con la misma interfaz.
- Generacion de respuestas en aplicaciones de demostracion: su tamano permite tiempos de carga minimos y respuestas rapidas en hardware modesto.
- Educacion y experimentacion: sirve para estudiar el efecto de distintas cuantizaciones (Q2_K frente a Q8_0) sobre la calidad de salida en un modelo pequeno.
- Entornos con memoria muy restringida: la variante Q2_K permite ejecutar el modelo en dispositivos con pocos cientos de MB de RAM disponible.
- Filtrado o generacion de texto auxiliar: puede emplearse para tareas de reescritura o generacion breve donde no se requiera alta precision.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0, puede servir de punto de partida para fine-tuning en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: F16 aproximadamente 2,2 GB; Q8_0 en torno a 1,2 GB; Q6_K alrededor de 0,9 GB; Q5_K_M cerca de 0,8 GB; Q4_K_M aproximadamente 0,7 GB; Q3_K_M en torno a 0,6 GB; Q2_K cerca de 0,5 GB (estimaciones a partir del tamano de fichero indicado para F16 y de la proporcion tipica de bits por parametro).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para F16; para cuantizaciones de 4 bits basta con 1 GB, por lo que cabe en GTX 1050 Ti, GTX 1650, RTX 3050 y superiores. Tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en Raspberry Pi con la cuantizacion Q2_K.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una generacion fluida en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Oprius-1.1B-GGUF | 1,1 B | no disponible | Apache 2.0 | GGUF en HF | Ajuste conversacional, marcado obsoleto por el autor |
| TinyLlama-1.1B-Chat-v1.0 | 1,1 B | 2.048 tokens (modelo base de referencia) | Apache 2.0 | HF (safetensors y GGUF de terceros) | Modelo original sobre el que se construye Oprius |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens (modelo de referencia) | Apache 2.0 | HF (multiples formatos) | Alternativa moderna con contexto largo y mejor soporte multilingue |

## Limitaciones y advertencias

- El autor del modelo base lo marca como obsoleto por haber sido entrenado con un dataset antiguo; su calidad puede ser inferior a la de modelos mas recientes del mismo tamano.
- Riesgo alto de alucinacion y de respuestas incoherentes en tareas de razonamiento, codigo o matematicas, dado el reducido tamano del modelo.
- Idiomas soportados no documentados; el entrenamiento de TinyLlama se centra en ingles, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no documentada en esta ficha; conviene consultar la model card del modelo base antes de disenar prompts largos.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de TinyLlama conviene verificar las condiciones del modelo original.
- El repositorio acumula trece cuantizaciones (10,6 GB en total); descargar solo el fichero necesario para evitar consumo innecesario de almacenamiento.
- No hay garantias de soporte ni mantenimiento por parte del autor de la cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinyopsec/Oprius-1.1B-GGUF
- Modelo base: https://huggingface.co/zzzekryo/Oprius-1.1B
- TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
