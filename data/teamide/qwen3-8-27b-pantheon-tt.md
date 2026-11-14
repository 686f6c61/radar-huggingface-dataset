# TeamIDE/Qwen3.8-27B-Pantheon-TT

## Resumen

Qwen3.8-27B-Pantheon-TT es una conversión de formato de los pesos de Qwen/Qwen3.8-27B, el modelo de lenguaje de 27.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud. La publica TeamIDE como parte de su iniciativa Pantheon, un stack de inferencia local, y su propósito concreto es empaquetar los pesos en el formato de mosaico (tile format) propietario de las tarjetas Tenstorrent Blackhole p150, de modo que el runtime Pantheon pueda cargarlos directamente en ese hardware. No se trata, por tanto, de un modelo nuevo ni de un fine-tuning: es una redistribución modificada de los pesos originales, convertidos desde el GGUF Q8_0 que publica unsloth.

El repositorio contiene tres artefactos: un GGUF reducido con las claves del tokenizador, la configuración y los tensores pequeños (normas, taps de convolución), un fichero `.fttw` de 28,6 GB con todas las matrices de multiplicación y el embedding en formato Bfp8, y un tercer `.fttw` de 451 MB con la capa MTP (multi-token prediction) que Pantheon usa para decodificación especulativa. El modelo es solo de texto, sin visión, y hereda la licencia Apache 2.0 del modelo base.

Su relevancia es acotada pero clara: es la vía práctica de ejecutar un modelo de 27B en una tarjeta Tenstorrent Blackhole p150 con el stack Pantheon, con métricas de rendimiento medidas y publicadas por el autor. Para el resto de usuarios, el interés está en el modelo base Qwen3.8-27B y en el GGUF Q8_0 de unsloth, no en estos ficheros convertidos, que solo funcionan con Pantheon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.8-27B); pesos convertidos a formato Bfp8 tile para Tenstorrent Blackhole. Incluye capa MTP para decodificación especulativa |
| Parametros totales | 27.000 millones (modelo base); el recuento de tensores del repo safetensors reporta 2.671.616, dato no representativo del modelo completo |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 30.720 tokens con el prefix checkpoint en Pantheon (límite configurado en la build); contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | Q8_0 como origen (GGUF de unsloth); conversión a Bfp8 en formato de mosaico de la tarjeta |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.gguf` (metadatos y tensores pequeños), `.fttw` (matrices y embedding en Bfp8), `.fttw` para la capa MTP |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer decoder-only del equipo Qwen. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card del modelo base, que no se incluye en la documentación proporcionada. Lo que sí se documenta es el proceso de conversión: se parte del GGUF `Qwen3.8-27B-Q8_0.gguf` de unsloth (sha256 `a680f44a…b67e348`), se separan las claves del tokenizador, la configuración y los tensores pequeños en un GGUF reducido, y se reempaquetan todas las matrices de multiplicación y el embedding en el formato de mosaico Bfp8 que consumen las tarjetas Blackhole p150.

La innovación técnica relevante no está en el modelo sino en el pipeline de despliegue: la build incluye una capa MTP convertida al mismo formato, lo que habilita la decodificación especulativa de Pantheon con un token de borrador. Además, el runtime implementa prefix checkpointing, de modo que un segundo turno de conversación reanuda desde el checkpoint en lugar de reprocesar el prefijo. El autor reporta que con MTP activo (un borrador, contexto 8.192) se pasa de 6,8 a 10,6 tok/s en prompts cortos manteniendo la misma salida.

## Capacidades

- Generación de texto conversacional en modo solo texto; la build excluye explícitamente visión.
- Razonamiento y generación de código y matemáticas heredados del modelo base Qwen3.8-27B, aunque la información proporcionada no detalla evaluaciones concretas.
- Decodificación especulativa mediante la capa MTP incluida en el repositorio.
- Reanudación de conversaciones multi-turno mediante prefix checkpoint a partir del segundo turno.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con APIs compatibles en el stack Pantheon.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling y razonamiento multi-paso: no disponibles en la información proporcionada para esta build.

## Casos de uso

- Despliegue local en Tenstorrent Blackhole p150: es el caso de uso principal y prácticamente exclusivo. Los ficheros `.fttw` solo los carga Pantheon sobre una tarjeta p150, de modo que sirven para montar un servidor de inferencia local sin GPU convencional.
- Asistente conversacional de un solo usuario con contexto largo: con un límite de 30.720 tokens y prefix checkpointing, encaja en sesiones de chat o análisis de documentos extensos donde el segundo turno se reanuda en torno a 1,4 s.
- Procesamiento de documentos largos en local: prompts de hasta 28.882 tokens medidos por el autor, con un tiempo hasta el primer token de 177 s, adecuado para tareas por lotes donde la latencia inicial no es crítica.
- Evaluación de hardware Tenstorrent: la build sirve como banco de pruebas reproducible para medir rendimiento de decodificación en Blackhole p150 con y sin MTP.
- Generación de código en entornos con requisitos de soberanía de datos: al ejecutarse en hardware local sin depender de la nube, permite integrar el modelo en flujos de desarrollo internos, siempre que se acepte el throughput de 6-10 tok/s.
- Prototipado de pipelines de decodificación especulativa: la capa MTP separada permite experimentar con el número de tokens de borrador y medir el impacto en throughput.
- Sustitución de referencia del modelo base: para equipos que ya usan Qwen3.8-27B vía unsloth y quieren portar su carga de trabajo a Pantheon sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de rendimiento de inferencia medidas en una p150 con contexto máximo de 30.720, un usuario y MTP desactivado salvo donde se indica:

| Metrica | Valor |
|---|---|
| Decodificacion, prompts cortos (greedy, MTP off) | 6,8 tok/s |
| Decodificacion a 6k de contexto | 6,6 tok/s |
| Decodificacion a 11k de contexto | 6,4 tok/s |
| Decodificacion a 29k de contexto | 5,6 tok/s |
| Time to first token, prompt de 2.844 tokens | 15,4 s |
| Time to first token, prompt de 28.882 tokens | 177 s |
| Reanudacion de segundo turno desde checkpoint | ~1,4 s |
| Decodificacion con MTP (1 borrador, contexto 8.192) | 10,6 tok/s en prompts cortos |

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en la memoria de la tarjeta Tenstorrent Blackhole p150, no en GPU con VRAM convencional.
- GPU recomendadas: ninguna. El formato `.fttw` es específico de Tenstorrent Blackhole p150 y no se carga en CUDA, ROCm ni Metal.
- Compatibilidad con GPU de consumo: no. Para RTX 4090 u otras GPU consumer habría que usar el GGUF Q8_0 original de unsloth con llama.cpp u Ollama, no estos ficheros.
- Opciones de despliegue: exclusivamente Pantheon Local sobre una tarjeta p150 (https://git.teamide.dev/David/Pantheon). No es compatible con vLLM, TGI, llama.cpp ni Ollama en su formato actual.
- Almacenamiento: el repositorio ocupa 29,1 GB; los ficheros principales son de 21,6 MB, 28,6 GB y 451 MB.
- Throughput y latencia: 6,8 tok/s en decodificación corta y 5,6 tok/s a 29k de contexto; 10,6 tok/s con MTP activo; TTFT de 15,4 s para 2.844 tokens y 177 s para 28.882.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-Pantheon-TT (esta ficha) | 27B | 30.720 en Pantheon | `.fttw` + GGUF parcial | Tenstorrent Blackhole p150 | Apache 2.0 |
| Qwen/Qwen3.8-27B (original) | 27B | no disponible | safetensors | GPU convencionales | Apache 2.0 |
| unsloth/Qwen3.8-27B-GGUF (Q8_0) | 27B | no disponible | GGUF | CPU, GPU consumer, llama.cpp, Ollama | Apache 2.0 |

La comparación relevante es de formato y hardware, no de calidad: los tres comparten pesos y licencia, y difieren en el runtime de destino. No se dispone de datos de benchmarks que permitan comparar rendimiento de calidad frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Los ficheros `.fttw` son un formato propietario de Pantheon/Foundry y solo funcionan en tarjetas Tenstorrent Blackhole p150 con ese runtime; no son portables a otro hardware.
- El GGUF incluido está modificado y es un subconjunto: contiene claves y tensores pequeños, pero no las matrices de multiplicación ni el embedding, por lo que no sirve para inferencia por sí solo.
- El modelo es solo de texto; no hay capacidades de visión en esta build.
- El contexto está limitado a 30.720 tokens en la configuración medida, no necesariamente al máximo nativo del modelo base.
- Las métricas de rendimiento provienen de una única tarjeta, un solo usuario y decodificación greedy; el throughput con múltiples usuarios concurrentes no está documentado.
- La latencia de primer token en prompts largos es alta (177 s para 28.882 tokens), lo que limita su uso interactivo con contextos extensos.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse sobre el modelo base Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero los ficheros son formas modificadas de los pesos originales y debe conservarse la atribución al equipo Qwen y a unsloth por la cuantización.
- El repositorio tiene 31 descargas y 0 likes en el momento de la consulta, con muy poca validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TeamIDE/Qwen3.8-27B-Pantheon-TT
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- GGUF Q8_0 de origen (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio de Pantheon: https://git.teamide.dev/David/Pantheon
