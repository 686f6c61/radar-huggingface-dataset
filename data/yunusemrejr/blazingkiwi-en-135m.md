# yunusemrejr/BlazingKiwi-EN-135M

## Resumen

Blazing Kiwi (EN, 135M) es un modelo conversacional en inglés extremadamente pequeño desarrollado por yunusemrejr, concebido para ejecutarse íntegramente en el navegador mediante WebAssembly. Se trata de un fine-tune de HuggingFaceTB/SmolLM2-135M-Instruct (arquitectura Llama, 30 capas, 122.215.680 parámetros tras una reducción del vocabulario de 49.152 a 27.799 tokens) al que se añade una "recall head" de 147.712 parámetros para recuperación de información. Su problema central es la privacidad y la latencia: ofrecer chat con generación aumentada por recuperación (RAG) sin servidor, consultando una biblioteca offline de 49.690 resúmenes de Wikipedia.

Su relevancia radica en la combinación de varias técnicas poco habituales en modelos de este tamaño: cirugía de vocabulario para reducir el tamaño del fichero, entrenamiento consciente de cuantización (QAT) a 4 bits sobre todas las matrices (incluida la embedding), y un módulo de recuperación híbrido BM25 + claves de signos embebido en 8 KB de WebAssembly. El fichero para navegador pesa 69.497.600 bytes y la descarga total por visita es de 80,9 MB, frente a 571 MB del modelo hermano mayor Flyingkiwi-EN-0.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder), 30 capas, anchura 576, 9/3 cabezas de 64, SwiGLU 1.536, RoPE θ = 100.000, embedding atado |
| Parametros totales | 122.215.680 (+ 147.712 de la recall head) |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con una escala fp16 por cada 32 valores (QAT); pesos latentes en safetensors |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (biblioteca de Wikipedia bajo CC BY-SA 4.0) |
| Formato de pesos | safetensors (latentes y q4_weights); fichero propietario .fkm de 69.497.600 bytes para navegador |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct con disposición Llama: 30 capas, anchura residual de 576, 9 cabezas de atención y 3 de KV de 64 dimensiones, MLP SwiGLU de 1.536, RoPE con θ = 100.000 y embedding atado a la salida. La innovación principal es la "cirugía de vocabulario": se conservan solo los tokens que el chat en inglés y la biblioteca usan (cerrados sobre las fusiones BPE), reduciendo el vocabulario a 27.799 tokens para que el fichero 4-bit quede por debajo de 70 MB manteniendo las 30 capas. Se añade además una recall head que toma el residual tras la capa 24, lo normaliza con RMS por token, lo promedia sobre el mensaje del usuario y lo multiplica por una matriz de 256 × 576 para obtener 256 bits de signo que sirven de clave de recuperación.

El entrenamiento combina datos de OpenAssistant/oasst2, CohereLabs/aya_dataset, openai/gsm8k y mandarjoshi/trivia_qa, más 30.210 conversaciones escritas por un modelo profesor (Qwen3.5-35B-A3B) en la versión 1.1 —incluyendo premisas falsas, ambigüedad, honestidad, memoria y razonamiento corto— y las distribuciones de tokens de un SmolLM2-1.7B-Instruct fine-tuned (destilación de conocimiento). La parte final del entrenamiento aplicó QAT: cada matriz pasó por el cuantizador exacto de 4 bits, de modo que el fichero publicado es el modelo entrenado. La recuperación en navegador usa un índice BM25 construido sobre los ids de tokens del propio vocabulario del modelo, con una puntuación híbrida BM25 + coincidencia de bits de clave + bonus de título, en unos 0,3 ms por consulta.

## Capacidades

- Generación de texto conversacional en inglés en formato ChatML, con tono amable, claro y conciso.
- Respuesta aumentada por recuperación (RAG) sobre una biblioteca offline de 49.690 resúmenes de Wikipedia, con citas en formato `[[Título]]` restringidas por un autómata decodificador a los títulos ofrecidos.
- Uso selectivo de notas: aprendió a usar las notas que responden a la pregunta e ignorar las que no, y a terminar con "Read more: [[Título]]".
- Honestidad entrenada: reconocer cuándo no sabe, corregir suposiciones falsas y manejar preguntas con premisas erróneas.
- Razonamiento matemático básico (entrenado con GSM8K) y conocimientos de trivia (TriviaQA).
- Bonus de logit de 2 sobre los tokens de las notas mientras se escribe la respuesta, para anclar la generación en la evidencia recuperada.
- Ejecución 100 % local en navegador (WebAssembly), sin conexión a servidores de inferencia.
- No soporta tool calling, agentes ni capacidades multimodales; no hay información disponible al respecto.

## Casos de uso

- Asistente de chat en páginas web con privacidad total: al ejecutarse íntegramente en el navegador, ningún texto del usuario sale del dispositivo; adecuado para formularios de soporte o FAQ interactivas donde la privacidad es crítica.
- Documentación y consultas enciclopédicas offline: gracias a la biblioteca de 49.690 resúmenes de Wikipedia con citas `[[Título]]`, responde preguntas factuales tipo "¿qué hace la clorofila?" con referencias verificables.
- Demos de IA embebidas en blogs o portfolios: con 80,9 MB de descarga total por visita, es viable cargar el modelo bajo demanda sin penalizar en exceso la experiencia.
- Dispositivos de gama baja y portátiles sin GPU: 98–134 tokens/s en Chrome sobre un AMD Ryzen 5 7530U con seis hilos, suficiente para chat interactivo solo con CPU.
- Prototipado de RAG ligero con transformers: el formato de turno `library` permite integrar notas recuperadas externamente en pipelines Python sin infraestructura de servidores.
- Educación sobre modelos pequeños: el repositorio publica el informe técnico, el código de recuperación en C/WebAssembly y el system prompt, lo que lo hace útil como material de estudio de QAT, cirugía de vocabulario y RAG en el alfabeto del modelo.

## Benchmarks y rendimiento

La model card indica que las respuestas se evaluaron con decodificación greedy, calificadas a ciegas por subagentes de Claude Haiku contra criterios escritos, pero el texto disponible se corta antes de mostrar los resultados. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

Datos de rendimiento medidos en navegador:

| Metrica | BlazingKiwi-EN-135M | Flyingkiwi-EN-0.6B |
|---|---|---|
| Velocidad (Chrome, Ryzen 5 7530U, 6 hilos) | 98–134 tokens/s | 29–35 tokens/s |
| Memoria pico de la pestaña | 509 MB | 1.237 MB |
| Descarga por visita | 80,9 MB | 571 MB |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero 4-bit pesa unos 69,5 MB, por lo que cabe con holgura en cualquier GPU moderna; en CPU, la pestaña del navegador alcanza un pico de 509 MB de RAM.
- GPU recomendadas: no requiere GPU; está diseñado para inferencia en CPU. En Python con transformers, cualquier GPU con 2 GB de VRAM o más es más que suficiente.
- Consumer GPUs: sobradamente compatible con cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, Apple Silicon, etc.); también funciona sin GPU.
- Opciones de despliegue: navegador vía WebAssembly (demos oficial en flyingkiwi.yunusemrevurgun.com) y Hugging Face transformers en Python. No hay información disponible sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 98–134 tokens/s en Chrome sobre un AMD Ryzen 5 7530U (seis hilos), solo CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Punto fuerte |
|---|---|---|---|---|
| BlazingKiwi-EN-135M | 122,2 M | no disponible | Apache 2.0 | RAG offline en navegador, QAT 4-bit, 80,9 MB de descarga |
| SmolLM2-135M-Instruct (base) | 135 M | 8.192 | Apache 2.0 | Chat generalista en inglés, ecosistema SmolLM2 |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 | Apache 2.0 | Multilingüe y contexto largo, mayor calidad general |
| SmolLM2-360M-Instruct | 360 M | 8.192 | Apache 2.0 | Mejor calidad que 135M manteniendo tamaño reducido |

BlazingKiwi no compite en calidad bruta con modelos mayores: su nicho es la inferencia 100 % local en navegador con recuperación integrada y descarga mínima, donde los alternativos requieren más ancho de banda y memoria.

## Limitaciones y advertencias

- Solo inglés: el vocabulario reducido a 27.799 tokens y los datos de entrenamiento lo hacen inadecuado para otros idiomas, incluido el castellano.
- Conocimiento cerrado: no puede navegar por internet ni conocer la fecha actual; su conocimiento factual externo depende exclusivamente de la biblioteca de 49.690 resúmenes de Wikipedia.
- Riesgo de alucinación: con 135M de parámetros el riesgo es alto en preguntas fuera de la biblioteca; el propio system prompt instruye al modelo a admitir incertidumbre, pero no elimina el problema.
- Capacidad de razonamiento muy limitada: aunque se entrenó con GSM8K y datos de razonamiento corto, un modelo de este tamaño no es fiable para matemáticas o lógica complejas.
- Sin tool calling, agentes ni multimodalidad.
- La biblioteca de Wikipedia está bajo CC BY-SA 4.0: las respuestas que citen notas pueden heredar obligaciones de atribución y compartición igual.
- Las respuestas del sitio web (códigos 4-bit) pueden diferir ligeramente de las obtenidas con `model.safetensors` (pesos latentes).
- Sesgos: al derivar de Wikipedia y datasets abiertos (oasst2, aya), puede reproducir sesgos presentes en esas fuentes; no hay auditoría de sesgos publicada.
- Proyecto de autor individual con adopción mínima (379 descargas, 1 like en el momento de la ficha): conviene validar su estabilidad antes de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yunusemrejr/BlazingKiwi-EN-135M
- Demo en navegador: https://flyingkiwi.yunusemrevurgun.com/
- Informe técnico (web): https://flyingkiwi.yunusemrevurgun.com/technical/blazing-kiwi/
- Informe técnico (repo): https://huggingface.co/yunusemrejr/BlazingKiwi-EN-135M/blob/main/TECHNICAL_REPORT.md
- Modelo hermano mayor: https://huggingface.co/yunusemrejr/Flyingkiwi-EN-0.6B
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
