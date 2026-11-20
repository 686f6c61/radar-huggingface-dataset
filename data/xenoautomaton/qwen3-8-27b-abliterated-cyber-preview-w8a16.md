# xenoautomaton/Qwen3.8-27B-abliterated-cyber-preview-W8A16

## Resumen

Qwen3.8-27B-abliterated-cyber-preview-W8A16 es un checkpoint cuantizado en INT8 weight-only del modelo hotdogs/Qwen3.8-27B-abliterated-cyber-preview, publicado por el usuario xenoautomaton. Se trata de una derivación de la familia Qwen 3.5 (tag `qwen3_5`) con 27.781 millones de parámetros reales según los safetensors, orientada a generación de texto y a entrada imagen-texto. El modelo base incorpora el calificativo "abliterated", lo que indica que se han eliminado o atenuado mecanismos de rechazo del modelo original, y "cyber-preview" sugiere un ajuste orientado a dominios técnicos o de seguridad.

La relevancia de esta ficha radica en que es una cuantización lista para producción con vLLM nativo: el autor documenta que no requiere el plugin experimental GGUF y que se ha validado en una A100 de 40 GB con 32K de contexto, alcanzando entre 39,8 y 66,0 tokens por segundo según configuración. El checkpoint usa compressed-tensors con cuantización RTN data-free, grupos simétricos de 128 y activaciones de 16 bits, manteniendo sin cuantizar los pesos de visión, embeddings, lm_head, tensores MTP y proyecciones de control GDN pequeñas.

El modelo conserva un contexto nativo de 262.144 tokens según la model card, aunque la validación se realizó únicamente a 32.768 tokens. La licencia es Apache-2.0 y el repositorio ocupa 31,6 GB. No hay datos de benchmarks de precisión publicados más allá de seis comprobaciones funcionales, por lo que la evaluación disponible es de despliegue y latencia, no de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen 3.5 (tag `qwen3_5`), con soporte de visión y tensores MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos; validado a 32.768 tokens en el despliegue documentado |
| Tipos de cuantizacion | INT8 weight-only (W8A16), RTN data-free, grupos simétricos de 128, activaciones de 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (INT8); existe una variante GGUF Q6_K/Q4_K_M separada del mismo autor |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen 3.5 con capacidad de entrada imagen-texto (pipeline `image-text-to-text`) y con tensores MTP (multi-token prediction) presentes en el checkpoint. La cuantización se generó con llmcompressor 0.15.0 y compressed-tensors 0.20.1 mediante RTN data-free, sin calibración con datos, con grupos simétricos de 128 y activaciones en 16 bits. Se excluyeron de la cuantización los pesos de visión, los embeddings, el lm_head, los tensores MTP y las proyecciones de control GDN pequeñas. La revisión de origen es `2fbed4d2a8cbf450797dfdcd65bb5ccef74569df`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO. El autor indica explícitamente que sobre esta cuantización no se realizó RL ni fine-tuning adicional. La innovación técnica destacable es el uso de decodificación especulativa MTP con `num_speculative_tokens=1`, que en las pruebas del autor elevó el throughput de 39,8 a 56,4 tok/s con prompt largo y de 41,0 a 66,0 tok/s con prompt corto. La cuantización es lossy por definición.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `text-generation`.
- Entrada multimodal imagen-texto según el pipeline de Hugging Face, aunque la inferencia de visión no fue probada por el autor.
- Tool calling y function calling: la configuración de vLLM documentada usa `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Modo de razonamiento: el parser `qwen3` está configurado, y las pruebas se realizaron con thinking desactivado por petición.
- Decodificación especulativa MTP para acelerar la generación.
- Capacidades multilingües: no disponibles como lista cerrada, pero las comprobaciones funcionales incluyen traducción al chino.
- Ejecución de código generado: una de las seis pruebas funcionales consistió en ejecutar una pequeña función Python generada por el modelo.
- Aritmética, ordenación y recuperación de información: cubiertas en las comprobaciones funcionales del autor.

## Casos de uso

- Servicio de generación de texto en producción con vLLM: el checkpoint está validado con vLLM 0.34.0 y PyTorch 2.14.0+cu130 en A100 40 GB, con un consumo observado de 34,4 GiB a 32K de contexto, lo que permite desplegarlo en una sola GPU de 40 GB sin plugin GGUF experimental.
- Asistentes conversacionales multi-turno: la ventana nativa de 262.144 tokens permite mantener conversaciones largas o procesar documentos extensos, aunque el autor solo validó 32K en su hardware.
- Agentes con tool calling: la configuración de vLLM con `qwen3_coder` y `--enable-auto-tool-choice` habilita la generación de llamadas a herramientas, útil en pipelines de automatización que necesiten invocar APIs o funciones.
- Aceleración de inferencia con decodificación especulativa: el uso de MTP=1 permite pasar de 39,8 a 56,4 tok/s con prompts largos, adecuado para servicios con requisitos de latencia ajustados.
- Procesamiento de documentación técnica y código: las pruebas funcionales incluyen ejecución de código Python generado, lo que respalda su uso en asistentes de programación o generación de scripts.
- Traducción y procesamiento multilingüe: la comprobación de traducción al chino sugiere utilidad en tareas de traducción, aunque no hay una lista oficial de idiomas soportados.
- Análisis de imágenes: el pipeline `image-text-to-text` lo habilita teóricamente para tareas de visión, pero el autor no probó la inferencia de visión, por lo que no se recomienda en producción sin validación previa.

## Benchmarks y rendimiento

El autor no publica benchmarks de precisión (MMLU, HumanEval, GSM8K u otros). Solo documenta mediciones de throughput y seis comprobaciones funcionales. Los datos de rendimiento medidos en una NVIDIA A100-SXM4-40GB con contexto de 32.768 tokens, una secuencia, temperatura 0 y thinking desactivado son:

| Variante / motor | Tokens de prompt | Tokens de salida | tok/s extremo a extremo | tok/s en streaming observado |
|---|---:|---:|---:|---:|
| W8A16 / vLLM 0.34.0 MTP=0 | 4832 | 256 | 39,8 | 41,5 |
| W8A16 / vLLM 0.34.0 MTP=0 | 32 | 256 | 41,0 | 41,9 |
| W8A16-MTP / vLLM 0.34.0 MTP=1 | 4832 | 256 | 56,4 | 60,0 |
| W8A16-MTP / vLLM 0.34.0 MTP=1 | 32 | 256 | 66,0 | 68,8 |

Las cifras de streaming se obtuvieron de eventos SSE, no de mediciones aisladas de kernel GPU. El autor advierte que el TTFT con caché y en frío difiere. No se han publicado resultados de benchmarks de precisión en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 34,4 GiB observados en A100 40 GB con contexto de 32.768 tokens y una secuencia.
- GPU recomendadas: NVIDIA A100 40 GB (validada por el autor); por tamaño de pesos (31,6 GB en INT8) se requiere al menos una GPU con 40 GB de VRAM para el contexto probado.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090, 3090) con el contexto validado; sería necesario reducir contexto o usar la variante GGUF Q4_K_M del mismo autor.
- Opciones de despliegue: vLLM 0.34.0 con PyTorch 2.14.0+cu130 y dtype bfloat16; el checkpoint es nativo de compressed-tensors y no requiere el plugin GGUF experimental. Existe una variante GGUF Q6_K/Q4_K_M para llama.cpp u otros motores compatibles.
- Throughput: 39,8-41,0 tok/s sin MTP y 56,4-66,0 tok/s con MTP=1, según prompt.
- Configuración de referencia: `--max-model-len 32768 --max-num-seqs 1 --max-num-batched-tokens 4096 --gpu-memory-utilization 0.90 --language-model-only`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xenoautomaton/Qwen3.8-27B-abliterated-cyber-preview-W8A16 | 27,78 B | 262.144 nativo (32K validado) | INT8 W8A16 compressed-tensors | Apache-2.0 | Hugging Face, vLLM 0.34.0 |
| xenoautomaton/Qwen3.8-27B-abliterated-cyber-preview-MTP-GGUF | no disponible | no disponible | GGUF Q6_K / Q4_K_M | Apache-2.0 (heredada) | Hugging Face, llama.cpp |
| hotdogs/Qwen3.8-27B-abliterated-cyber-preview (base) | 27,78 B (implícito) | 262.144 nativo | BF16 original | Apache-2.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada. La comparativa se limita a las variantes del mismo modelo base publicadas por el mismo autor.

## Limitaciones y advertencias

- La cuantización es lossy: el autor lo indica explícitamente y no se han publicado métricas de degradación de precisión frente al modelo base en BF16.
- No se realizó RL ni fine-tuning adicional sobre esta cuantización.
- La inferencia de visión no fue probada, pese a que el pipeline declarado es `image-text-to-text`.
- El contexto nativo es de 262.144 tokens, pero solo se validaron 32.768 tokens en una A100 de 40 GB; no se extendió RoPE ni se probó el contexto completo.
- Las seis comprobaciones funcionales (aritmética, ordenación, traducción al chino, ejecución de código Python, generación de tool calls y recuperación) no constituyen un benchmark exhaustivo de precisión.
- El modelo base es "abliterated", lo que implica que se han atenuado los mecanismos de rechazo; esto puede aumentar el riesgo de generar contenido inapropiado o inseguro y requiere filtros adicionales en producción.
- No hay lista oficial de idiomas soportados ni datos de sesgos conocidos.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de fidelidad.
- El servicio público desplegado por el autor requiere una clave de API en rutas que no son de inferencia/control de OpenAI; para descargas privadas se necesita autenticación propia de Hugging Face.
- La licencia Apache-2.0 permite uso comercial, pero se deben respetar los créditos y términos upstream del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xenoautomaton/Qwen3.8-27B-abliterated-cyber-preview-W8A16
- Modelo base: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-cyber-preview
- Variante GGUF del mismo autor: https://huggingface.co/xenoautomaton/Qwen3.8-27B-abliterated-cyber-preview-MTP-GGUF
