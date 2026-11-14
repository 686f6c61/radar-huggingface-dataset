# Xylolabs/Qwen3.8-27B-GGUF

## Resumen

Xylolabs/Qwen3.8-27B-GGUF es una publicacion de cuantizaciones GGUF del modelo Qwen3.8-27B, desarrollado originalmente por el equipo Qwen. Xylolabs se limita a convertir y cuantizar los pesos originales con llama.cpp, sin realizar entrenamiento, calibracion ni cuantizacion adicional nueva para esta publicacion. El repositorio ofrece tres variantes alternativas: IQ4_XS simple, IQ4_XS con la matriz de importancia existente (imat) y Q5_K_M simple.

El modelo base es un transformer de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) con un decodificador de texto de 64 capas y un modulo MTP (multi-token prediction). Esta orientado a generacion de texto conversacional y razonamiento, con soporte declarado para ingles y coreano. La licencia es Apache 2.0, heredada del release original.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizacion de 4 y 5 bits, con tamanos de descarga de entre 15,3 y 19,5 GB. El autor documenta una evaluacion de fidelidad frente a los logits BF16 originales (KL medio y comprobaciones de respuestas), lo que aporta trazabilidad sobre la perdida de calidad de cada cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con decodificador de texto de 64 capas y modulo MTP |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el autor mantiene los metadatos de contexto originales sin cambios; el ejemplo CLI limita a 2.048 tokens) |
| Tipos de cuantizacion | IQ4_XS, IQ4_XS-imat, Q5_K_M (presets mixtos con F32, IQ4_XS, Q5_K, Q6_K) |
| Idiomas soportados | Ingles (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27,3B parametros con un decodificador de texto de 64 capas y un modulo MTP (multi-token prediction). Los archivos GGUF contienen 866 tensores del decodificador de texto mas un modulo MTP, junto con el tokenizador y la plantilla de chat original. Los pesos del codificador y proyector de vision se omiten en esta exportacion, por lo que estos GGUF son exclusivamente de texto.

No se realizo entrenamiento, calibracion ni cuantizacion nueva para esta publicacion: el autor indica que la variante `-imat` conserva un resultado de matriz de importancia existente y que los nombres de fichero de calibracion historicos en los metadatos son etiquetas de procedencia, sin dataset de calibracion incluido. La conversion se hizo con llama.cpp. No se dispone de informacion sobre composicion del dataset de entrenamiento original, numero de tokens, ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional y de un solo turno (el ejemplo CLI usa `--single-turn`).
- Razonamiento con modo "thinking" activable o desactivable mediante `enable_thinking` en los kwargs de la plantilla de chat.
- Decodificacion con modulo MTP (multi-token prediction), aunque el autor advierte que un drafter MTP requiere su propia implementacion y evaluacion compatibles.
- Soporte multilingue limitado a ingles y coreano segun la model card.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No incluye capacidades de vision en esta exportacion (pesos de vision omitidos).
- No se documenta soporte de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: la variante IQ4_XS (15,4 GB) permite ejecutar un modelo de ~27B en GPUs con 24 GB de VRAM, dejando margen para cache KV y buffers.
- Servicio de chat en ingles y coreano: el modelo esta declarado para ambos idiomas y conserva la plantilla de chat original, adecuado para asistentes conversacionales bilingues.
- Razonamiento con control de coste: el flag `enable_thinking` permite activar o desactivar la cadena de razonamiento segun la tarea, reduciendo tokens generados en consultas simples.
- Evaluacion y prototipado de pipelines llama.cpp: al ser GGUF compatible con `llama-cli` y `--jinja`, sirve para validar plantillas de chat y flujos de inferencia antes de pasar a produccion.
- Investigacion sobre cuantizacion: las tres variantes con metricas KL publicadas permiten estudiar el compromiso entre tamano y fidelidad frente a BF16.
- Integracion en entornos con requisitos de licencia permisiva: Apache 2.0 facilita el uso comercial sin restricciones adicionales del cuantizador.
- Generacion de texto por lotes en CPU/GPU mixtas: los GGUF de 4-5 bits son adecuados para inferencia en CPU con llama.cpp cuando no hay GPU disponible.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad de cuantizacion (KL medio frente a logits BF16) y comprobaciones de respuestas, no benchmarks de tareas estandar.

| Metrica | IQ4_XS | IQ4_XS-imat | Q5_K_M | Q4_K_M (referencia) |
|---|---:|---:|---:|---:|
| Descarga (GB) | 15,420 | 15,309 | 19,536 | no disponible |
| Bits medios por peso | 4,512 | 4,480 | 5,717 | no disponible |
| KL medio | 0,024978 | 0,019497 | 0,006743 | 0,020845 |
| KL / Q4_K_M | 1,198x | 0,935x | 0,323x | 1,000x |
| Comprobacion de respuestas | 33/33 + 7/7 thinking | 33/33 + 7/7 thinking | 33/33 + 7/7 thinking | 33/33 + 7/7 thinking |

Las comprobaciones cubren 4.094 posiciones puntuadas en dos secuencias de 2.048 tokens (una en ingles y otra en coreano). Las pruebas de IQ4 usan contexto de 8.192 tokens; Q5_K_M y su Q4_K_M pareado usan 4.352 tokens. El autor no reporta velocidad ni throughput.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica que la opcion GGUF mas grande (Q5_K_M, 19,536 GB) necesita unos 19,52 GB de memoria de dispositivo solo para los pesos, mas espacio para cache KV y buffers.
- IQ4_XS e IQ4_XS-imat: aproximadamente 15,3-15,4 GB de pesos, mas cache KV y buffers.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU de 24 GB (RTX 3090/4090) es el minimo practico para Q5_K_M con contexto moderado; IQ4_XS deja mas margen. Para contextos largos se requieren GPUs de 40-80 GB (A100, H100) o descarga parcial a CPU.
- Cabe en GPU de consumo: si, en GPUs de 24 GB con las variantes IQ4_XS; Q5_K_M es ajustado y depende del contexto y del tamano de cache KV.
- Opciones de despliegue: llama.cpp (probado con v0.9.0 segun el autor); otros runners compatibles con GGUF no estan verificados en la informacion disponible.
- Latencia y throughput: no reportados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.8-27B-GGUF | ~27,3B | no disponible | IQ4_XS, IQ4_XS-imat, Q5_K_M | Apache 2.0 | Solo texto; vision omitida; metricas KL publicadas |
| Qwen/Qwen3.8-27B (base) | ~27,3B | no disponible | safetensors (original) | Apache 2.0 | Modelo original; incluye vision segun el autor |
| Q4_K_M de referencia | no disponible | no disponible | Q4_K_M | no disponible | Usado como referencia de KL (0,020845) y de comprobacion de respuestas |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: los pesos del codificador y proyector de vision se omiten, por lo que no hay entrada de imagen en esta exportacion.
- Idiomas limitados a ingles y coreano segun la model card; el rendimiento en castellano no esta documentado.
- Perdida de calidad por cuantizacion: IQ4_XS presenta un KL 1,198x superior al Q4_K_M de referencia; IQ4_XS-imat y Q5_K_M quedan por debajo (0,935x y 0,323x).
- El modulo MTP incluido requiere una implementacion y evaluacion compatibles propias; no se garantiza su funcionamiento en todos los runners.
- Las comprobaciones del autor cubren textos almacenados y prompts cortos; una integracion real necesita su propia evaluacion de tarea.
- No se reportan velocidad ni throughput, por lo que no se puede estimar latencia en produccion a partir de esta ficha.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara el software "as is", sin garantia ni respaldo del upstream.
- Los ficheros son checkpoints alternativos: debe usarse uno a la vez, no combinarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de Qwen3.8: https://qwen.ai/blog?id=qwen3.8
- Licencia: https://huggingface.co/Xylolabs/Qwen3.8-27B-GGUF/blob/main/LICENSE
- Documentacion GGUF en llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
