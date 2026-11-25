# Takenoko12345678/sakura-gemma-4-E4B-it-GGUF

## Resumen

Sakura (桜) en formato GGUF es la conversión y cuantización para `llama.cpp` del modelo multimodal `Takenoko12345678/sakura-gemma-4-E4B-it`, un ajuste fino de `google/gemma-4-E4B-it` orientado a conversación en japonés con personalidad definida (persona), roleplay y modo de razonamiento explícito (thinking). El repositorio lo publica el usuario Takenoko12345678 bajo licencia Apache 2.0 y ofrece tres artefactos: una cuantización de alta precisión Q8_0, una Q4_K_M de bajo consumo de memoria y un proyector multimodal (`mmproj`) en BF16 que integra los codificadores de imagen y audio de Gemma 4.

El modelo base es un ajuste del Gemma 4 E4B instruct, con 7.518.069.290 parámetros reales según los safetensors del modelo original, lo que lo sitúa en la gama de modelos densos de ~7,5B. La pipeline declarada es `any-to-any`, es decir, entrada y salida multimodales, con soporte de texto, imagen y audio en la entrada según la model card. Los idiomas declarados son japonés e inglés.

Su relevancia práctica es doble: por un lado, permite ejecutar localmente un modelo conversacional multimodal con personalidad japonesa en hardware de consumo gracias a las cuantizaciones Q4_K_M (4,9 GiB) y Q8_0 (7,5 GiB); por otro, expone de forma explícita el modo thinking activable o desactivable mediante el flag `-rea` de `llama.cpp`, lo que facilita separar respuestas rápidas de conversación de respuestas con razonamiento para matemáticas o explicaciones técnicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con codificadores de imagen (`GEMMA4V`) y audio (`GEMMA4A`) integrados en `mmproj`; detalles internos de atención no disponibles |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8,50 BPW), Q4_K_M (5,63 BPW, con `token_embd`, `per_layer_token_embd`, `attn_v` y `ffn_down` en Q6_K); `mmproj` en BF16 |
| Idiomas soportados | ja, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para `llama.cpp`); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de Gemma 4, un transformer multimodal con pipeline `any-to-any`. El repositorio GGUF incluye un proyector multimodal separado (`mmproj-sakura-gemma-4-E4B-it-BF16.gguf`, 946 MiB) que empaqueta los codificadores de imagen `GEMMA4V` y de audio `GEMMA4A`, lo que confirma que el modelo acepta tanto imágenes como audio en la entrada además de texto.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. La model card remite al repositorio del modelo base en BF16 para los detalles de diseño, composición de datos y evaluación cuantitativa. Sí se documenta una innovación operativa relevante: el modo thinking es conmutable en tiempo de inferencia mediante el flag `-rea on/off` de `llama.cpp`, lo que permite alternar entre respuestas directas y cadenas de razonamiento sin cambiar de modelo.

## Capacidades

- Generación de texto conversacional multi-turno con personalidad definida (persona) y orientación a roleplay.
- Modo thinking conmutable: razonamiento explícito para matemáticas, lógica y explicaciones técnicas, o desactivado para charla rápida.
- Entrada de imagen a través del codificador `GEMMA4V` incluido en el `mmproj`.
- Entrada de audio a través del codificador `GEMMA4A` incluido en el `mmproj` (se documenta el uso con WAV de 16 kHz).
- Capacidades multilingües limitadas a japonés e inglés según los metadatos del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere integración con servicios de inferencia compatibles.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Asistente conversacional en japonés para atención al usuario: el modelo mantiene un tono de persona consistente y permite alternar thinking off para respuestas inmediatas y thinking on cuando la consulta requiere cálculo o explicación paso a paso.
- Roleplay y compañía conversacional: el ajuste está orientado explícitamente a persona y roleplay, con parámetros de muestreo recomendados (temperatura 0,8–1,0, top_p 0,95, top_k 64) que favorecen respuestas variadas y naturales.
- Descripción y análisis de imágenes en local: mediante `llama-mtmd-cli` con `--image` y el `mmproj` BF16, útil para catalogación de fotos, accesibilidad o asistencia visual sin enviar datos a la nube.
- Transcripción y respuesta a consultas sobre audio: con `--audio` sobre WAV de 16 kHz, aplicable a notas de voz, resúmenes de reuniones cortas o asistentes por voz en japonés.
- Tutoría de matemáticas y explicaciones técnicas: activando thinking on se obtienen cadenas de razonamiento antes de la respuesta final, adecuado para entornos educativos donde se quiere mostrar el procedimiento.
- Prototipado y evaluación de modelos multimodales en estaciones de trabajo: las cuantizaciones Q4_K_M y Q8_0 permiten iterar rápido en Apple Silicon o GPUs de consumo antes de desplegar la versión BF16.
- Chatbot embebido en aplicaciones de escritorio o plugins: el formato GGUF y la compatibilidad con `llama.cpp` facilitan distribución offline sin dependencias de servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF remite a la del modelo base BF16 para la evaluación cuantitativa, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5–6 GiB con Q4_K_M (archivo de 4,9 GiB más overhead de contexto), y en torno a 8–9 GiB con Q8_0 (archivo de 7,5 GiB). El `mmproj` BF16 añade unos 946 MiB cuando se usan entradas de imagen o audio.
- GPU recomendadas: para Q4_K_M basta una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090; para Q8_0 se recomienda 12 GB o más (RTX 4070 Ti Super, RTX 4090, A10, L4). En entornos de servidor, A100 o H100 permiten ejecutar la versión BF16 con holgura.
- Cabe en GPU de consumo: sí, tanto Q4_K_M como Q8_0 en tarjetas de 12 GB o superiores; Q4_K_M es viable incluso en configuraciones de 8 GB si se limita el contexto.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-mtmd-cli`), y por extensión cualquier frontend compatible con GGUF como Ollama o servidores basados en `llama.cpp`. No se documenta compatibilidad con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor confirma funcionamiento en `llama.cpp` build 11146 con backend Metal en Apple Silicon, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sakura-gemma-4-E4B-it-GGUF | 7,52B | no disponible | Texto, imagen, audio (entrada) | Apache 2.0 | GGUF en Hugging Face |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | Texto, imagen, audio | Apache 2.0 | Pesos originales de Google |
| Modelos densos de ~7-8B en GGUF (familia genérica) | ~7-8B | variable según modelo | Principalmente texto | variable | amplia disponibilidad |

La comparación con alternativas concretas no está disponible en la información proporcionada: no se ofrecen datos de rendimiento ni de contexto que permitan un contraste cuantitativo con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Idiomas: solo se declaran japonés e inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Sesgos: no se documenta ninguna evaluación de sesgos; al ser un ajuste orientado a persona y roleplay, puede reproducir estereotipos propios de los datos de entrenamiento conversacional.
- Alucinación: no se han publicado métricas de fidelidad ni de tasa de alucinación; el modo thinking puede aumentar la longitud de las respuestas sin garantizar su corrección.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- Tool calling y agentes: no se documenta soporte de function calling ni de razonamiento agéntico multi-paso, por lo que no debe asumirse en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base de Google y del ajuste original para confirmar el cumplimiento.
- Madurez: el repositorio tiene 99 descargas y 2 likes, y fue creado y actualizado el mismo día (23 de noviembre de 2026), lo que indica validación comunitaria muy limitada.
- Multimodalidad: el uso de imagen y audio requiere `llama-mtmd-cli` con `--jinja` y el `mmproj` BF16; no se garantiza compatibilidad con otros runners.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Takenoko12345678/sakura-gemma-4-E4B-it-GGUF
- Modelo base BF16: https://huggingface.co/Takenoko12345678/sakura-gemma-4-E4B-it
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
