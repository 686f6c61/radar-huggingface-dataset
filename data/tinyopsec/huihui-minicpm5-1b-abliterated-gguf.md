# tinyopsec/Huihui-MiniCPM5-1B-abliterated-GGUF

## Resumen

Huihui-MiniCPM5-1B-abliterated-GGUF es una distribucion en formato GGUF del modelo Huihui-MiniCPM5-1B-abliterated, publicado por el usuario tinyopsec. Se trata de una version "abliterated" (sin censura) del MiniCPM5-1B de OpenBMB, un transformer denso de aproximadamente 1.080 millones de parametros. El repositorio contiene unicamente los pesos cuantizados generados con llama.cpp, no el modelo original en precision completa en safetensors.

El modelo hereda la arquitectura del MiniCPM5-1B, disenado para generacion de texto conversacional en un rango de tamano muy contenido (1B de parametros), lo que lo hace apto para despliegue en hardware modesto, incluidas GPUs de consumo e incluso CPU. La variante "abliterated" elimina los mecanismos de rechazo aprendidos durante el alineamiento, lo que la orienta a usos donde se requiere ausencia de filtros de contenido, con las advertencias eticas y de seguridad que ello implica.

La relevancia de este repositorio es practica: ofrece hasta doce niveles de cuantizacion (desde F16 hasta Q2_K) listos para ejecutarse con llama.cpp, Ollama, LM Studio o koboldcpp, con licencia Apache 2.0. La informacion publicada por el autor es muy escasa: no se detallan idiomas soportados, datos de entrenamiento, benchmarks ni longitud de contexto, por lo que muchos campos de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (MiniCPM5-1B, sin confirmar detalles por el autor) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es huihui-ai/Huihui-MiniCPM5-1B-abliterated, a su vez derivado de openbmb/MiniCPM5-1B. La arquitectura es un transformer denso de aproximadamente 1.080 millones de parametros, segun el dato real de safetensors del modelo base. El autor de esta distribucion GGUF no documenta la arquitectura interna (numero de capas, dimension del modelo, atencion, etc.), por lo que los detalles finos no estan disponibles.

El proceso de "abliteration" aplicado por huihui-ai consiste en la modificacion de los pesos para eliminar la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo deja de negarse a responder a determinadas peticiones. No se dispone de informacion sobre el dataset de entrenamiento original del MiniCPM5-1B, el numero de tokens utilizados, la composicion del corpus ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline text-generation, tag "conversational").
- Modelo "uncensored": no aplica los rechazos tipicos del alineamiento original, por lo que responde a peticiones que el modelo base rechazaria.
- Compatible con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier implementacion que soporte el formato.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponibles en la informacion.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion.

## Casos de uso

- Prototipado local en hardware modesto: con cuantizaciones Q4_K_M o Q2_K, el modelo puede ejecutarse en CPU o en GPUs de gama baja, lo que permite experimentar con un LLM conversacional sin infraestructura dedicada.
- Generacion de texto creativo sin filtros: la variante abliterated resulta adecuada para escritura de ficcion, guiones o narrativa donde el modelo base aplicaria rechazos, siempre que el uso cumpla la legalidad vigente.
- Chatbot de escritorio integrado en aplicaciones: al ser GGUF, puede embeberse en herramientas de escritorio mediante llama.cpp o LM Studio para asistentes conversacionales offline.
- Pruebas de robustez y evaluacion de seguridad: util para investigadores que estudian el comportamiento de modelos sin alineamiento y comparan respuestas frente a la version original.
- Generacion de texto en entornos con restricciones de red: al ejecutarse localmente, permite procesar prompts sin enviar datos a servicios externos, util en entornos con requisitos de privacidad.
- Fine-tuning ligero o experimentacion con LoRA: el modelo base en precision completa (F16) puede servir como punto de partida para adaptaciones especificas, aunque el autor no documenta el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB en F16; en torno a 1,1-1,3 GB en Q8_0; cerca de 0,7-0,8 GB en Q4_K_M; y aproximadamente 0,4-0,5 GB en Q2_K (estimaciones a partir del tamano de los ficheros y de los 1.080 millones de parametros; el autor no publica cifras oficiales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para F16; para cuantizaciones 4-bit basta con GPUs de gama de entrada (GTX 1650, RTX 3050, etc.). En GPUs de gama alta (RTX 4090, A100, H100) el modelo ocupa una fraccion minima de memoria y el cuello de botella pasa a ser el ancho de banda.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs modernas, incluidas las integradas con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-MiniCPM5-1B-abliterated-GGUF (este) | 1,08 B | no disponible | Apache 2.0 | GGUF | Variante sin censura, 13 cuantizaciones |
| openbmb/MiniCPM5-1B (base) | 1,08 B | no disponible | no disponible | safetensors | Modelo original alineado |
| huihui-ai/Huihui-MiniCPM5-1B-abliterated | 1,08 B | no disponible | Apache 2.0 | safetensors | Version abliterated en precision completa |

La comparacion con alternativas de otros fabricantes (Qwen2.5-1.5B, Llama-3.2-1B, Gemma-2-2B) no puede completarse con datos verificados en la informacion proporcionada; se indica como no disponible.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado el comportamiento de rechazo, lo que aumenta el riesgo de generar contenido danino, ofensivo o ilegal. Requiere evaluacion y filtros externos antes de cualquier uso en produccion.
- Riesgo de alucinacion: inherente a los modelos de 1B de parametros; la capacidad de razonamiento y el conocimiento factual son limitados en comparacion con modelos mayores.
- Sesgos conocidos: no documentados por el autor; el modelo base puede arrastrar sesgos de su dataset de entrenamiento, no disponible.
- Idiomas soportados: no documentados; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto: no documentada; no debe asumirse una ventana amplia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin censura.
- Caveat de produccion: el autor advierte explicitamente "Evaluate before use"; no hay garantias de calidad, soporte ni mantenimiento del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/Huihui-MiniCPM5-1B-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-MiniCPM5-1B-abliterated
- Modelo original: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
