# StillDeadcode/qwen3.8-27b-iqr-v4

## Resumen

Qwen3.8-27B IQR-V4 es una cuantización del modelo multimodal Qwen3.8-27B (desarrollado por el equipo Qwen de Alibaba) realizada por el usuario StillDeadcode dentro del ecosistema radiance, un motor de inferencia orientado a GPUs AMD RDNA4 con ROCm. El repositorio no contiene pesos en safetensors ni GGUF, sino contenedores propietarios `.rad` para el motor radiance, con quince variantes que cubren desde 2,47 hasta 8,04 bits por peso (bpw) del modelo de lenguaje. El objetivo es ofrecer el modelo completo —torre de visión y drafter de decodificación especulativa incluidos— en un único fichero por tamaño, con la menor degradación posible medida en divergencia KL respecto al modelo bf16 original.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización poco habitual (trellis de cola mordida con estados de 2^16, rotación Hadamard de 128 puntos y GPTQ en orden de activación) que reporta mejoras de entre el 2 % y el 19 % en KL frente a la versión anterior IQR-V3 a igual tamaño. Por otro, es un ejemplo de cuantización verticalizada: solo funciona con una versión concreta del motor radiance (posterior a 1.16.0) y solo sobre hardware AMD RDNA4, lo que limita drásticamente su portabilidad frente a GGUF o AWQ.

El modelo base, Qwen3.8-27B, es un transformer multimodal de 27 000 millones de parámetros con 262 144 tokens de contexto entrenados (200 000 probados en esta cuantización), licencia Apache 2.0 y soporte de imagen y vídeo en peticiones de chat. Esta cuantización conserva esas capacidades y añade un cabezal de vocabulario ponderado por frecuencia en las variantes por debajo de IQ6R-L.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (modelo base Qwen3.8-27B) con torre de visión de 27 bloques; cuantización de código trellis (IQR-V4) con rotación Hadamard de 128 puntos |
| Parametros totales | 27 000 millones (modelo base, dato de la nomenclatura; no confirmado en la información proporcionada) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens entrenados; 200 000 probados en esta cuantización |
| Tipos de cuantizacion | IQR-V4 de 2,47 a 8,04 bpw en 15 variantes (trellis de 2 a 7 bits por banda y proyección, más rejilla int8); activaciones int8 bajo la misma rotación; cabezal de vocabulario ponderado por frecuencia por debajo de IQ6R-L |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor `.rad` propietario del motor radiance (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso multimodal de Qwen con torre de visión de 27 bloques en bf16, que procesa imágenes y vídeo dentro de mensajes de chat. Sobre él, esta cuantización aplica el formato IQR-V4: cada capa lineal del tronco se rota con una Hadamard de 128 puntos y se ajusta con GPTQ en orden de activación contra matrices de Hessian de calibración. Los códigos resultantes forman un trellis de cola mordida por columna cuyos 2^16 estados se calculan a partir del propio estado, bajo una única escala f32 por fila. Las proyecciones alimentadas por las cabezas de atención reciben además una escala bf16 por cada bloque de 128 pesos a partir de cinco bits. Las anchuras de bits se asignan por banda de capas y por proyección según precios de KL medidos, no según una regla heurística uniforme.

El repositorio integra también el drafter de difusión por bloques z-lab/Qwen3.8-27B-DFlash2, cuyas lineales están en OCP-MXFP4 y cuyo cabezal de vocabulario usa códigos de 2 bits que el motor re-puntúa contra los 32 candidatos principales del cabezal del modelo. Al ser decodificación especulativa verificada, los borradores afectan a la velocidad pero no a la salida. No se documenta en la información disponible el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO; la model card solo describe el proceso de cuantización, no el preentrenamiento.

## Capacidades

- Generación de texto y razonamiento multilingüe (idiomas concretos no disponibles).
- Comprensión de imagen y vídeo: la torre de visión de 27 bloques se conserva en bf16 y acepta partes `image_url` y `video_url` en mensajes de chat.
- Tool calling y salida estructurada: el servidor radiance expone la API de OpenAI (`/v1/chat/completions`, `/v1/completions`) con soporte de llamadas a herramientas y formato estructurado.
- Decodificación especulativa con el drafter DFlash2, con profundidad ajustable automáticamente o mediante `--num-speculative-tokens N` (0 la desactiva).
- Contexto largo: hasta 200 000 tokens probados, con caché KV en fp8 opcional.
- Cabezal de vocabulario ponderado por frecuencia en las variantes por debajo de IQ6R-L, que asigna las anchuras mayores a los tokens con más probabilidad.

## Casos de uso

- Asistencia multimodal sobre documentos: el modelo puede recibir capturas, escaneos o fotogramas de vídeo junto a preguntas de texto y responder con hasta 200 000 tokens de contexto, lo que permite procesar informes completos o transcripciones extensas en una sola sesión.
- Automatización de atención al cliente con contexto largo: la ventana de 200 000 tokens probados permite mantener historiales de conversación multi-turno muy extensos sin truncar, y el soporte de tool calling facilita la integración con sistemas de ticketing o CRM.
- Despliegue local en estaciones de trabajo con GPU AMD: las variantes hasta IQ5R caben en una tarjeta de 32 GB (por ejemplo, Radeon AI PRO R9700) con margen para contexto largo, lo que permite ejecutar el modelo en hardware de escritorio profesional sin depender de la nube.
- Generación de código en pipelines internos: el servidor compatible con la API de OpenAI permite sustituir un endpoint remoto por uno local en herramientas de autocompletado o revisión, con salida estructurada para integrarse en CI/CD.
- Investigación en cuantización: las quince variantes con sus métricas de KL y top-1 permiten estudiar la curva calidad/tamaño de un mismo modelo y comparar con IQR-V3, útil para quienes investigan formatos de compresión.
- Procesamiento de vídeo por lotes: la entrada de vídeo en mensajes de chat y el throughput de hasta 500 tok/s a concurrencia 8 (según la guía de referencia para MXFP4 en 2x R9700) hacen viable el análisis automatizado de grabaciones.
- Evaluación de decodificación especulativa: el drafter DFlash2 integrado permite medir el impacto de la especulación verificada en latencia sin alterar las respuestas, un caso práctico para equipos que optimizan serving.

## Benchmarks y rendimiento

La model card publica métricas de cuantización (KL media y top-1 frente al modelo bf16) sobre un split privado de 1,05 millones de posiciones generadas por el modelo, no benchmarks de tareas estándar como MMLU o HumanEval.

| Fichero | bpw | KL media | Top-1 | IQR-V3 a ese tamaño (KL) | Mejora |
|---|---:|---:|---:|---:|---:|
| iq2r-v4 | 2,470 | 0,06113 | 91,23 % | 0,06807 | −10 % |
| iq2r-l-v4 | 2,797 | 0,03602 | 93,29 % | 0,04241 | −15 % |
| iq3r-s-v4 | 3,157 | 0,02241 | 94,75 % | 0,02584 | −13 % |
| iq3r-v4 | 3,472 | 0,01495 | 95,74 % | 0,01698 | −12 % |
| iq3r-l-v4 | 3,804 | 0,00917 | 96,61 % | 0,01129 | −19 % |
| iq4r-s-v4 | 4,142 | 0,00643 | 97,12 % | 0,00762 | −16 % |
| iq4r-v4 | 4,473 | 0,00444 | 97,69 % | 0,00512 | −13 % |
| iq4r-l-v4 | 4,793 | 0,00297 | 98,07 % | 0,00342 | −13 % |
| iq5r-s-v4 | 5,071 | 0,00223 | 98,33 % | 0,00249 | −10 % |
| iq5r-v4 | 5,433 | 0,00154 | 98,60 % | 0,00182 | −15 % |
| iq6r-s-v4 | 6,063 | 0,00100 | 98,86 % | 0,00106 | −6 % |
| iq6r-v4 | 6,439 | 0,00081 | 98,96 % | 0,00088 | −8 % |
| iq6r-l-v4 | 6,939 | 0,00068 | 99,08 % | 0,00072 | −6 % |
| iq7r-v4 | 7,420 | 0,00059 | 99,15 % | 0,00060 | −2 % |
| iq8r-v4 | 8,040 | 0,00046 | 99,22 % | 0,00047 | −2 % |

Datos de rendimiento declarados: IQ4R-S-V4 decodifica un flujo único un 4 % más rápido que el checkpoint MXFP4 con una KL cinco veces menor; IQ3R-S-V4 es más rápido en todas las concurrencias. Para el modelo base MXFP4 en 2x R9700, la guía de referencia cita aproximadamente 200 tok/s a concurrencia 1 y 500 tok/s a concurrencia 8, cifras que no corresponden directamente a estas variantes IQR-V4.

## Requisitos de hardware

- VRAM estimada: las variantes hasta IQ5R caben en una tarjeta de 32 GB con espacio para contexto largo; las mayores requieren `--tp 2` (dos tarjetas).
- GPU compatibles: exclusivamente AMD RDNA4 con ROCm; la guía de referencia usa Radeon AI PRO R9700. No hay soporte documentado para NVIDIA, Apple Silicon ni CPU.
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo; el motor radiance está orientado a RDNA4 profesional.
- Despliegue: motor radiance versión posterior a 1.16.0 (obligatorio; 1.16.0 y anteriores rechazan estos ficheros). Comando de ejemplo: `radiance --model qwen3.8-27b-iq4r-v4.rad --tp 1 --max-model-len 200000 --kv-cache-dtype fp8 --max-num-seqs 8`.
- No compatible con vLLM, llama.cpp, Ollama ni TGI, al usar un formato de contenedor propietario.
- Latencia y throughput: 4 % más rápido que MXFP4 en flujo único para IQ4R-S-V4; IQ3R-S-V4 más rápido en todas las concurrencias (sin cifras absolutas en la información disponible).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware | Calidad relativa |
|---|---|---|---|---|---|---|
| Qwen3.8-27B IQR-V4 (este) | 27 000 M | 200 000 probados | `.rad` (IQR-V4, 2,47–8,04 bpw) | Apache 2.0 | AMD RDNA4 + radiance >1.16.0 | KL 0,00444 a 4,47 bpw (IQ4R-V4) |
| Qwen3.8-27B MXFP4 | 27 000 M | 200 000 (mismo base) | MXFP4 | Apache 2.0 | AMD RDNA4 + radiance | KL cinco veces mayor que IQ4R-S-V4 según la model card |
| Qwen3.8-27B IQR-V3 | 27 000 M | 200 000 (mismo base) | `.rad` (IQR-V3) | Apache 2.0 | AMD RDNA4 + radiance | Peor KL entre 2 % y 19 % a igual tamaño |
| Qwen3.8-27B bf16 (original) | 27 000 M | 262 144 entrenados | safetensors | Apache 2.0 | Amplio (vLLM, SGLang, TGI) | Referencia de calidad (KL 0) |

## Limitaciones y advertencias

- Dependencia total del motor radiance posterior a 1.16.0: no se puede cargar en vLLM, llama.cpp, Ollama, TGI ni transformers, lo que bloquea cualquier integración estándar.
- Exclusivo de GPUs AMD RDNA4 con ROCm; sin soporte para NVIDIA ni CPU.
- El repositorio ocupa 289,3 GB y contiene quince contenedores; hay que descargar solo el fichero deseado, no el repo completo.
- Los benchmarks publicados son de fidelidad de cuantización (KL, top-1), no de tareas; no hay datos de MMLU, HumanEval o GSM8K para estas variantes.
- Idiomas soportados no documentados en la información disponible.
- Riesgo de alucinación inherente al modelo base; las variantes de 2–3 bpw presentan una KL media de 0,01495 a 0,06113, con top-1 entre 91,23 % y 95,74 %, lo que implica degradación perceptible frente al bf16.
- Las variantes por debajo de IQ6R-L usan cabezal de vocabulario ponderado: puede penalizar tokens poco frecuentes en dominios especializados.
- Licencia Apache 2.0 permite uso comercial, pero la viabilidad práctica queda condicionada al hardware AMD RDNA4 y al motor radiance.
- El drafter DFlash2 no altera la salida (verificación), pero añade consumo de VRAM no cuantificado en la información disponible.
- Fecha de creación del repositorio: 2026-11-03; ecosistema muy reciente y con pocas descargas (0) y likes (3), sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StillDeadcode/qwen3.8-27b-iqr-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Informe técnico IQR-V4: https://radiance.stilldeadco.de/whitepapers/iqr-v4.pdf
- Leaderboard de cuantización radiance: https://radiance.stilldeadco.de/leaderboard/
- Guía de despliegue en 2x R9700 (MXFP4): https://forum.level1techs.com/t/ultimate-2x-r9700-guide-for-qwen-3-8-27b-mxfp4-200t-s-c-1-500t-s-at-c-8/257789
- Artículo sobre especificaciones y hardware de Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
