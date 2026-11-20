# Wilson3/drama-3

## Resumen

Fish Audio Drama 3 es un modelo de síntesis de voz (text-to-speech) de nueva generación desarrollado por Fish Audio, diseñado específicamente para escenas con múltiples personajes y contenido de formato largo. Se distribuye en Hugging Face bajo el identificador Wilson3/drama-3 y combina un backbone de texto de tipo Mixture-of-Experts (MoE) de 35.899.643.008 parámetros totales (aproximadamente 35B) con solo 3B parámetros activos por token, junto con un decodificador de audio basado en codebooks y predicción multi-token (MTP).

El modelo resuelve el problema de la generación de audio conversacional realista: permite hasta 16 personajes distintos en un mismo texto mediante etiquetas de hablante (`<|speaker:0|>` a `<|speaker:15|>`), clonación de voz a partir de una referencia corta, edición de audio por continuación (enviando tomas previas como contexto) y control en lenguaje natural de emociones y eventos sonoros como suspiros o risas. Soporta más de 80 idiomas, entre ellos el castellano, el catalán, el gallego y el euskera.

Su relevancia actual radica en que es desplegable desde el primer día en SGLang-Omni y vLLM-Omni, con latencias de primer audio inferiores a 100 ms en una sola GPU H200 y un throughput que escala hasta 1.687 frames acústicos por segundo con concurrencia 64. La licencia es de investigación (fish-audio-research-license), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con backbone de texto de atención híbrida (full + linear) y decodificador de audio Codebook-MTP |
| Parametros totales | 35.899.643.008 (~35B) |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 para los expertos MoE; resto de pesos en bf16 (no se documentan otras cuantizaciones) |
| Idiomas soportados | Más de 80, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, it, ca, gl, eu, hi, tr, nl, pl, sv, etc. |
| Licencia | fish-audio-research-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Drama 3 emplea un backbone de texto Mixture-of-Experts con atención híbrida, combinando capas de atención completa con capas de atención lineal para reducir el coste computacional en secuencias largas. De los aproximadamente 35B parámetros totales, solo 3B se activan por token, lo que permite un rendimiento alto con un coste de inferencia contenido. Los expertos MoE se almacenan en FP8 mientras que el resto de pesos permanece en bf16, una decisión que reduce la huella de memoria del repositorio (41,5 GB) sin degradar en exceso la calidad.

La parte de audio se resuelve con un decodificador Codebook-MTP que genera de forma causal 10 codebooks a lo largo de toda la secuencia, en lugar de decodificar por ventanas independientes. Esto habilita la edición como continuación: el modelo recibe las tomas previas (tokens VQ) como contexto y produce una nueva versión coherente con las anteriores. El texto largo se trocea automáticamente y puede emitirse en streaming por fragmentos. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de voz multi-hablante: hasta 16 personajes diferenciados en un mismo texto mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Clonación de voz a partir de una referencia corta (se documenta un clip de 3,9 s) con su transcripción.
- Control en lenguaje natural de eventos sonoros y emociones insertados en el texto, como `[sighs]` o `[laughs]`.
- Edición de audio por continuación: se envían tomas previas y el modelo genera una nueva versión modificada, incluyendo ediciones encadenadas.
- Generación de contenido de formato largo con troceado automático y streaming por fragmentos.
- Soporte multilingüe en más de 80 idiomas, incluidos castellano, catalán, gallego y euskera.
- Integración con tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio de entrada: no documentado.

## Casos de uso

- Audiolibros y ficción con diálogos: el modelo permite asignar hasta 16 voces distintas en un mismo texto mediante etiquetas de hablante, de modo que un capítulo con varios personajes se genera en una sola pasada sin concatenar clips independientes.
- Doblaje y localización: con soporte para más de 80 idiomas y clonación de voz, se puede mantener la identidad vocal del actor original al doblar contenido a castellano, catalán, gallego o euskera.
- Producción de pódcasts y contenido conversacional: la generación multi-hablante y el control de eventos sonoros permiten crear episodios con intervenciones alternas y marcas expresivas como risas o suspiros insertadas en posición.
- Postproducción y edición de voz: la edición como continuación permite corregir una palabra o frase concreta enviando las tomas previas como contexto, sin regenerar todo el audio y manteniendo la coherencia con las versiones anteriores.
- Asistentes de voz y atención al cliente: con TTFA p50 de 88,9 ms en una H200 y streaming por fragmentos, es viable en diálogos en tiempo real; el throughput de 1.244,7 frames/s con concurrencia 32 permite atender múltiples sesiones simultáneas.
- Accesibilidad y lectura de contenido: la generación de formato largo con troceado automático facilita convertir documentos extensos en audio narrado con voces consistentes.
- Prototipado de videojuegos y narrativa interactiva: las etiquetas de hablante y la clonación permiten dotar de voz a varios personajes de una escena sin entrenar modelos separados por personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) en la información disponible. Sí se documentan métricas de serving en una NVIDIA H200 con peticiones en streaming sobre prompts en inglés de Seed-TTS, clonando voz desde una referencia pre-codificada, con temperatura 1,0, top_p 0,9, top_k 30 y max_new_tokens 500:

| Concurrencia | Throughput (frames/s) | TTFA p50 | TTFA p95 | RTF (media) |
|---:|---:|---:|---:|---:|
| 1 | 166,7 | 88,9 ms | 90,8 ms | 0,131 |
| 2 | 287,0 | 96,2 ms | 130,1 ms | 0,152 |
| 4 | 467,6 | 108,2 ms | 156,4 ms | 0,186 |
| 8 | 678,1 | 153,2 ms | 210,9 ms | 0,256 |
| 16 | 927,6 | 210,1 ms | 287,2 ms | 0,373 |
| 32 | 1.244,7 | 304,6 ms | 396,1 ms | 0,551 |
| 64 | 1.687,3 | 450,9 ms | 1.020,1 ms | 0,801 |

Cada celda es la media de cuatro ejecuciones. El RTF es el tiempo desde el envío de la petición hasta el último fragmento de audio dividido por la duración del audio devuelto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 41,5 GB con expertos en FP8 y resto en bf16; se necesita al menos esa cantidad de memoria, por lo que no cabe en GPUs de consumo de 24 GB sin cuantización adicional no documentada.
- GPU recomendadas: NVIDIA H200 es la plataforma de referencia para las métricas publicadas; por tamaño de memoria, se requieren GPUs de clase数据中心 como A100 80 GB o H100 80 GB.
- Cabe en GPU de consumo: no disponible; con 41,5 GB de pesos no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en el formato publicado.
- Opciones de despliegue: SGLang-Omni (`sgl-omni serve --model-path fishaudio/drama-3 --port 8000`) y vLLM-Omni (`vllm serve fishaudio/drama-3 --omni --port 8091`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFA p50 de 88,9 ms con concurrencia 1 y 304,6 ms con concurrencia 32; throughput de 166,7 a 1.687,3 frames/s según concurrencia en una H200.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia cualitativa, Drama 3 se posiciona en la categoría de TTS multi-hablante con clonación y edición, con arquitectura MoE de 35B/3B activos y licencia de investigación, frente a otros sistemas de TTS que habitualmente se distribuyen con licencias permisivas o comerciales; no se aportan métricas que permitan establecer una comparación objetiva.

## Limitaciones y advertencias

- Licencia fish-audio-research-license: restringe el uso comercial; es imprescindible revisar LICENSE.md antes de cualquier despliegue en producción.
- No se documentan sesgos conocidos del modelo; al ser un sistema de clonación de voz, existe riesgo de uso indebido para suplantación de identidad si no se aplican controles de consentimiento.
- Riesgo de alucinación acústica: no se han publicado métricas de fidelidad (WER, MOS) que permitan acotar errores de pronunciación o artefactos.
- Longitud de contexto no disponible: se desconoce el límite exacto de tokens de texto o de audio que admite el modelo, más allá del troceado automático para texto largo.
- El rendimiento medido se limita a prompts en inglés de Seed-TTS en una H200; no hay datos publicados para castellano ni para otras GPUs.
- El formato publicado (FP8 + bf16, 41,5 GB) no cabe en GPUs de consumo, lo que limita el despliegue a infraestructura de centro de datos.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento; no debe asumirse su disponibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Wilson3/drama-3
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Documentación SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Cookbook de Drama 3 en SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Recipe de Drama 3 en vLLM-Omni: https://recipes.vllm.ai/fishaudio/drama-3
- Referencia de audio de ejemplo: https://huggingface.co/datasets/zhaochenyang20/seed-tts-eval-mini/resolve/main/en/prompt-wavs/common_voice_en_10119832.wav
- Paper referenciado (arXiv:2610.18010): no se proporciona URL directa en la información disponible.
