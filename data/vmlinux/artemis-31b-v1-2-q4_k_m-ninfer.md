# vmlinux/Artemis-31B-v1.2-Q4_K_M-NInfer

## Resumen

Artemis-31B-v1.2-Q4_K_M-NInfer es una conversión de formato del modelo Artemis 31B v1.2 de TheDrummer, publicada por el usuario vmlinux. No se trata de un modelo entrenado desde cero, sino de una reempaquetación del cuantizado Q4_K_M en GGUF de Bartowski al formato propietario `.ninfer` que consume el motor de inferencia NInfer. El objetivo declarado es ejecutar el modelo en una única GPU NVIDIA Tesla V100 de 32 GB (arquitectura `sm_70`, CUDA 12.8), un hardware sin soporte nativo para los tipos de dato modernos que requieren los motores de inferencia actuales.

La relevancia de esta ficha es acotada: el interés técnico reside en la cadena de conversión y en el motor NInfer, no en el modelo subyacente, que es un derivado de la familia Gemma (la etiqueta `gemma4` sugiere una base Gemma de cuarta generación, aunque no se confirma en la información disponible). El modelo está orientado a escritura creativa y se distribuye con licencia Apache 2.0. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks ni detalles de entrenamiento.

La información disponible sobre arquitectura interna, datos de entrenamiento y capacidades concretas es muy limitada. Esta ficha distingue explícitamente entre los datos verificables del repositorio y los aspectos que quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como `gemma4`; se desconoce la arquitectura exacta) |
| Parametros totales | 31B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262144 tokens (configuración de ejemplo del autor con `--max-context 262144`) |
| Tipos de cuantizacion | Q4_K_M (cuantización GGUF heredada de Bartowski; el autor indica que la conversión preserva la cuantización existente) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (19.53 GB, fichero `artemis-Q4_K_M-text.ninfer`); derivado de GGUF Q4_K_M |
| Tamano del repositorio | 19.5 GB |
| Motor de inferencia | NInfer (fork `JimmyMax/ninfer-v100`, revisión `f4aab2ae632afa32857bb15c32eafb29851cea47`) |
| Hardware objetivo | 1x NVIDIA Tesla V100 32 GB, `sm_70`, CUDA 12.8 |
| MTP (multi-token prediction) | desactivado en esta build |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base TheDrummer/Artemis-31B-v1.2 en los datos proporcionados. La etiqueta `gemma4` en el repositorio sugiere que el modelo deriva de la familia Gemma de Google, pero no se confirma ni el número de capas, ni el tipo de atención, ni la composición del dataset de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta el número de tokens de entrenamiento.

La innovación técnica relevante en este repositorio no está en el modelo sino en el pipeline de despliegue. El autor convierte un GGUF Q4_K_M de Bartowski al formato `.ninfer` mediante un parche de compatibilidad (`ninfer-artemis.patch`) aplicado al fork `ninfer-v100` del motor NInfer. Este fork está adaptado para GPUs V100, que carecen de soporte para `bfloat16` y otras instrucciones presentes en arquitecturas posteriores. La configuración de ejemplo incluye KV cache en `int8` (`--kv-dtype int8`), prefill por chunks de 2048 tokens (`--prefill-chunk 2048`) y 512 MiB de KV cache en host (`--host-kv-mib 512`), lo que permite sostener contextos muy largos descargando parte de la caché a memoria del sistema.

## Capacidades

- Generación de texto en modo chat/completions, según el `pipeline_tag: text-generation`.
- Escritura creativa: el autor declara haber usado esta build "extensamente para escritura creativa" con buenos resultados.
- Contexto largo: la configuración de ejemplo admite hasta 262144 tokens, lo que habilita tareas de resumen y generación sobre documentos extensos.
- Concurrencia limitada: `--max-concurrency 1` en la configuración recomendada, es decir, una sola petición simultánea.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Escritura creativa asistida: el autor valida explícitamente este uso; el modelo puede generar narrativa, diálogos y descripciones con un contexto de hasta 262144 tokens, útil para mantener coherencia en novelas o guiones largos.
- Continuación de manuscritos extensos: con la ventana de contexto configurada, se puede cargar un borrador completo y pedir reescrituras o continuaciones sin truncar el material previo.
- Despliegue en infraestructura V100 existente: organizaciones con GPUs Tesla V100 de 32 GB pueden servir un modelo de 31B en Q4_K_M sin migrar a A100/H100, gracias al motor NInfer adaptado a `sm_70`.
- Generación de texto por lotes en un solo nodo: con `--max-concurrency 1` y `--prefill-chunk 2048`, encaja en pipelines de generación secuencial donde el throughput no es crítico pero el coste por token sí.
- Prototipado de aplicaciones de chat con contexto largo: la KV cache en `int8` y el offload parcial a host (`--host-kv-mib 512`) permiten probar escenarios de contexto extendido en hardware modesto.
- Investigación sobre cuantización y motores alternativos: el repositorio sirve como referencia para estudiar la conversión GGUF → `.ninfer` y el parcheo de motores para arquitecturas antiguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni de latencia/throughput. Tampoco se dispone de comparaciones numéricas con el modelo base en FP16 o con otros cuantizados.

## Requisitos de hardware

- VRAM: el fichero de pesos ocupa 19.53 GB; con KV cache en `int8`, prefill de 2048 y 512 MiB de KV en host, el autor lo ejecuta en una única V100 de 32 GB. Se desconoce el consumo exacto de VRAM en la configuración de ejemplo.
- GPU recomendadas: NVIDIA Tesla V100 de 32 GB (objetivo declarado). No se documenta compatibilidad con A100, H100, RTX 4090 ni otras GPUs.
- GPU de consumo: no se indica que quepa en GPUs consumer; 19.53 GB de pesos exceden los 24 GB de una RTX 4090 solo si se suma la KV cache, y el motor NInfer está orientado a V100.
- Opciones de despliegue: exclusivamente el motor NInfer (fork `ninfer-v100`), mediante `ninfer-serve`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Configuración de referencia del autor:
  ```bash
  ninfer-serve ./artemis-Q4_K_M-text.ninfer \
    --max-context 262144 --max-concurrency 1 \
    --kv-dtype int8 --prefill-chunk 2048 \
    --host-kv-mib 512 --ngram-draft-tokens 0
  ```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Motor | Disponibilidad |
|---|---|---|---|---|---|---|
| Artemis-31B-v1.2-Q4_K_M-NInfer (este) | 31B | 262144 (config. ejemplo) | Q4_K_M | Apache 2.0 | NInfer (fork V100) | Hugging Face, 0 descargas |
| TheDrummer/Artemis-31B-v1.2 | 31B | no disponible | original (FP/BF16 presumiblemente) | no disponible en esta ficha | transformers y otros | Hugging Face (modelo base) |
| bartowski/TheDrummer_Artemis-31B-v1.2-GGUF | 31B | no disponible | Q4_K_M y otras | Apache 2.0 (heredada) | llama.cpp y derivados | Hugging Face |

La comparación se limita a la cadena de derivación documentada. No se dispone de datos de rendimiento que permitan comparar calidad entre el original, el GGUF de Bartowski y esta conversión `.ninfer`.

## Limitaciones y advertencias

- No es un modelo original: es una reempaquetación de un cuantizado de terceros; cualquier limitación del modelo base se hereda.
- La cuantización Q4_K_M introduce pérdida de calidad respecto al modelo en precisión completa; no se han publicado evaluaciones de esa degradación.
- El formato `.ninfer` es propietario del motor NInfer y no es portable a vLLM, llama.cpp, Ollama o TGI; el modelo queda atado a ese runtime y a su fork para V100.
- La build desactiva MTP (multi-token prediction), lo que puede reducir el throughput frente a otras configuraciones del motor.
- `--max-concurrency 1` limita el despliegue a una petición simultánea; no es adecuado para servir a múltiples usuarios concurrentes sin replicar instancias.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-09); no hay evidencia de uso comunitario ni de mantenimiento.
- No se documentan sesgos, riesgos de alucinación ni evaluación de seguridad del modelo base.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce si el modelo base impone restricciones adicionales (términos de Gemma, si aplica) que prevalezcan.
- El fork `ninfer-v100` y el parche de compatibilidad son dependencias externas no auditadas en esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vmlinux/Artemis-31B-v1.2-Q4_K_M-NInfer
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Cuantizado GGUF de origen: https://huggingface.co/bartowski/TheDrummer_Artemis-31B-v1.2-GGUF
- Fork del motor NInfer para V100: https://github.com/JimmyMax/ninfer-v100
- Parche de compatibilidad incluido en el repositorio: `ninfer-artemis.patch`
