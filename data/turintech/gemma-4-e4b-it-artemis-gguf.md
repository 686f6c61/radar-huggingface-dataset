# turintech/gemma-4-E4B-it-Artemis-GGUF

## Resumen

gemma-4-E4B-it-Artemis-GGUF es una cuantización GGUF del modelo multimodal google/gemma-4-E4B-it, publicada por TurinTech dentro de su pipeline Artemis. El modelo base es la variante instruct de Gemma 4 con aproximadamente 7.463 millones de parámetros totales y capacidad de procesamiento de imagen y texto, orientada a conversación, razonamiento y llamadas a herramientas. TurinTech parte del checkpoint de cuantización consciente del entrenamiento (QAT) de Google y lo recomprime para reducir el peso en disco y la memoria de CPU necesaria en inferencia.

La propuesta de valor de esta distribución es ejecutar un modelo Gemma 4 multimodal en CPU: el fichero Q4_0 ocupa 4,22 GB y requiere unos 6,8 GiB de memoria de CPU en la configuración medida por el autor, frente a los 9,2 GiB del checkpoint original. Además, el autor reporta una mejora marginal en la precisión de llamadas a herramientas respecto al original (194 de 258 en BFCL live frente a 192), lo que sugiere que la recompresión no degrada —e incluso puede mejorar ligeramente— el comportamiento funcional en esa prueba.

El modelo se distribuye en formato GGUF para llama.cpp y está disponible también mediante Ollama y LM Studio. Incorpora proyector de visión y un drafter MTP (multi-token prediction) para decodificación especulativa, ambos convertidos y verificados por el autor. Es relevante para despliegues en entornos sin GPU, prototipado local y aplicaciones de agentes con tool calling sobre hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión), basada en Gemma 4 E4B; incluye drafter MTP para decodificación especulativa |
| Parámetros totales | 7.463.013.674 |
| Parámetros activos | no disponible |
| Longitud de contexto | 8.192 tokens en la configuración de ejemplo del autor (no se especifica el máximo del modelo base) |
| Tipos de cuantización | Q4_0 (GGUF); el autor menciona otros dos ficheros además del Q4_0, sin detallar sus tipos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-E4B-it-qat-q4_0-unquantized, un checkpoint de Gemma 4 en variante instruct que incorpora cuantización consciente del entrenamiento (QAT) a 4 bits. La distribución de TurinTech no reentrena el modelo: aplica su pipeline Artemis sobre ese checkpoint QAT para producir un GGUF Q4_0 más compacto. El repositorio incluye además el proyector de visión (990 MB) y un drafter MTP convertidos y verificados por el autor, lo que habilita tanto entrada de imágenes como decodificación especulativa con multi-token prediction.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF o DPO. Tampoco se detalla la arquitectura interna más allá de la etiqueta "Gemma 4" y la referencia a MTP. La innovación destacable de esta distribución es la recompresión desde un checkpoint QAT preservando (y según el autor, mejorando ligeramente) el rendimiento en tool calling, junto con la reducción de memoria de CPU de 9,2 GiB a 6,8 GiB.

## Capacidades

- Generación de texto conversacional multi-turno en modo instruct.
- Razonamiento con modo "thinking" activado por defecto en la plantilla de chat; la respuesta se devuelve en `message.reasoning_content` y el contenido final en `message.content`.
- Llamadas a herramientas y function calling: el autor reporta 194 de 258 llamadas correctas en BFCL live.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el proyector de visión incluido.
- Razonamiento matemático: 236 de 250 correctas en las últimas 250 preguntas de GSM8K.
- Seguimiento de instrucciones: 449 de 539 cumplidas en IFEval.
- Conocimiento general y razonamiento experto: 97 de 280 correctas en una muestra de MMLU-Pro.
- Decodificación especulativa mediante drafter MTP para acelerar la generación.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en CPU: con 6,8 GiB de memoria y un contexto de 8.192 tokens, puede desplegarse en portátiles y estaciones sin GPU para atención al cliente o asistentes internos con conversaciones multi-turno.
- Agentes con tool calling: los 194 aciertos de 258 en BFCL live permiten integrarlo en flujos de agente que invocan APIs, consultan bases de datos o ejecutan acciones estructuradas mediante `tools` en el endpoint compatible con OpenAI.
- Automatización de tareas matemáticas y de razonamiento: con 236 de 250 en GSM8K, es adecuado para resolución de problemas aritméticos en pipelines de validación, generación de presupuestos o cálculo de métricas.
- Procesamiento de documentos con imagen: al cargar el proyector de visión de 990 MB, puede extraer información de capturas, formularios escaneados o gráficos en flujos de digitalización.
- Despliegue en edge y entornos air-gapped: el formato GGUF y la licencia Apache 2.0 facilitan la ejecución en servidores sin conectividad ni aceleradores, con llama.cpp, Ollama o LM Studio.
- Prototipado y evaluación de agentes: el modo thinking y el drafter MTP permiten experimentar con razonamiento multi-paso y decodificación especulativa antes de migrar a modelos mayores.
- Cumplimiento de instrucciones en generación controlada: los 449 de 539 en IFEval lo hacen utilizable para tareas de formateo estricto, extracción estructurada y generación con restricciones de formato.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Resultado | Referencia |
|---|---|---|---|
| BFCL live | Llamadas a herramientas correctas | 194 de 258 | Original: 192 de 258 |
| GSM8K (últimas 250) | Correctas | 236 de 250 | no disponible |
| MMLU-Pro (muestra) | Correctas | 97 de 280 | no disponible |
| IFEval | Instrucciones cumplidas | 449 de 539 | no disponible |

En Apple M3 Max (36 GB) con llama.cpp Metal (b11617), el fichero Q4_0 cargó y respondió a aproximadamente 45 tokens por segundo, según el autor.

## Requisitos de hardware

- Memoria de CPU: 6,8 GiB para el Q4_0 en modo solo texto, medido con `-np 1` y `--cache-ram 0`; con la caché de prompt por defecto (8 GiB) la memoria creció hasta 15,1 GiB durante las pruebas.
- Disco: 4,22 GB para el fichero Q4_0; el repositorio completo ocupa 13,7 GB.
- Visión: el proyector añade 990 MB de descarga y carga adicional si no se usa `--no-mmproj`.
- GPU: no se especifican requisitos de VRAM; el enfoque del autor es ejecución en CPU. En Apple M3 Max (36 GB) con Metal se midieron unos 45 tokens por segundo.
- Cabe en hardware de consumo: sí, en CPU con al menos 8 GiB de RAM libre en la configuración medida; también en Apple Silicon con Metal.
- Opciones de despliegue: llama.cpp (llama-server, requiere soporte de Gemma 4; el autor midió con b11617 y b11889), Ollama (`ollama run turintech/gemma-4-e4b-it-artemis`) y LM Studio.
- Contexto de ejemplo: `-c 8192` con `--jinja` para usar la plantilla de chat embebida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-E4B-it-Artemis-GGUF (este) | 7.463 M | 8.192 en configuración de ejemplo | GGUF Q4_0 | Apache 2.0 | 6,8 GiB de CPU; 194/258 en BFCL live |
| google/gemma-4-E4B-it-qat-q4_0-unquantized (base) | 7.463 M | no disponible | safetensors | Apache 2.0 | 9,2 GiB de CPU; 192/258 en BFCL live |
| Alternativas de otros fabricantes del mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por TurinTech y están marcados como no verificados; no deben tratarse como cifras oficiales de Google.
- El rendimiento en MMLU-Pro es bajo en términos absolutos (97 de 280), lo que limita su uso en tareas de conocimiento experto.
- El modo thinking está activado por defecto en la plantilla de chat; sin desactivarlo o sin asignar suficientes tokens de salida (unos 1.500), las respuestas pueden truncarse.
- La memoria de CPU puede crecer significativamente (hasta 15,1 GiB) si no se desactiva la caché de prompt en RAM con `--cache-ram 0`.
- Requiere una versión de llama.cpp con soporte de Gemma 4; versiones anteriores no cargarán el modelo.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos de esta distribución.
- La licencia Apache 2.0 se acompaña de un enlace a la licencia de Gemma 4 de Google; conviene revisar los términos de uso de Gemma antes de un despliegue comercial.
- El contexto indicado (8.192 tokens) corresponde a la configuración de ejemplo del autor, no necesariamente al máximo del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/gemma-4-E4B-it-Artemis-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/gemma-4-e4b-it-artemis
- LM Studio: https://lmstudio.ai/turintech/gemma-4-e4b-it-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Resultados declarados: https://huggingface.co/turintech/gemma-4-E4B-it-Artemis-GGUF#results
