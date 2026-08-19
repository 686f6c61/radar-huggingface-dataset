# visible-cx/Gemma-4-31B-CoreAI

## Resumen

Gemma 4 31B Core AI es un artefacto derivado del modelo `google/gemma-4-31B-it-qat-q4_0-unquantized` de Google, convertido al formato `.aimodel` de Core AI para su ejecución en Apple silicon. El proyecto Visible es el responsable de esta conversión, que toma los pesos entrenados con cuantización consciente (QAT) de Google y los redondea a la cuadrícula int4 para la que fueron entrenados, reexpresándolos como un grafo Core AI con un kernel personalizado de atención Metal flash-decode. Se trata del bundle más grande del catálogo de Visible y su escalón de "máquina grande".

El modelo resuelve el problema de ejecutar un modelo denso de 31.3B parámetros en hardware de Apple mediante el runtime Core AI, aprovechando la cuantización int4 y kernels Metal optimizados. Es relevante porque demuestra la viabilidad de ejecutar modelos frontera en formato int4 sobre Apple silicon, aunque con importantes limitaciones: es solo de decodificación (sin prefill), requiere 64 GB de memoria unificada y no ha sido probado por el equipo de Visible. La licencia es Gemma, la misma que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 31B) |
| Parametros totales | 31.3B (bf16) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (KV dinámica; 8.05 GB en 4096 tokens, 16.1 GB en 8192) |
| Tipos de cuantizacion | int4 per-block-32, simétrica absmax (grid ggml q4_0) |
| Idiomas soportados | no disponible (el modelo base Gemma 4 soporta más de 140 idiomas) |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | Core AI `.aimodel` (main.mlirb, 20.09 GB) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B, un transformer denso de 31.3B parámetros con ventana de contexto de hasta 256K tokens en su versión original. La conversión a Core AI toma los pesos QAT-entrenados por Google (almacenados en bf16) y los redondea a la cuadrícula int4 para la que fueron entrenados durante el proceso de exportación. Esto no es una cuantización post-entrenamiento convencional, sino la materialización de los pesos en el formato que el entrenamiento QAT ya había optimizado.

La conversión utiliza un kernel personalizado de atención Metal flash-decode (`--metal-sdpa`) con factor de división 8, que es obligatorio: el tensor de consulta de 32 cabezas × 512 fp16 desborda el heap de scratch de decodificación de MPSGraph. El modelo exportado contiene únicamente una función de decodificación (`main`), sin prefill, porque el kernel Metal actual solo funciona con S=1 y no implementa máscara causal intra-chunk. Los prompts se procesan token a token. El vocabulario es de 262,144 entradas.

## Capacidades

- Generación de texto autoregresiva (decodificación token a token).
- Razonamiento y capacidades de codificación heredadas del modelo base Gemma 4 31B.
- Soporte multilingüe del modelo base (más de 140 idiomas), aunque no verificado en este bundle.
- Ejecución en Apple silicon mediante runtime Core AI con kernel Metal personalizado.
- Cuantización int4 simétrica con bloque de 32 (grid q4_0), optimizada para ancho de banda.
- KV cache dinámica (GrowingKVCache, inicial 256, duplicación progresiva).

## Casos de uso

- Inferencia local en Mac Studio o Mac Pro con 64 GB de memoria unificada: el modelo puede ejecutar un LLM de 31B en hardware de Apple sin conexión a la nube, útil para entornos con requisitos de privacidad o sin conectividad.
- Prototipado de aplicaciones de texto en Apple silicon: desarrolladores pueden integrar el bundle en aplicaciones macOS que requieran generación de texto local con un modelo de alta capacidad.
- Evaluación de Core AI como runtime para modelos grandes: permite comparar el rendimiento de Core AI frente a alternativas como llama.cpp u Ollama en el mismo hardware.
- Investigación sobre cuantización int4 y kernels Metal: el bundle sirve como referencia para estudiar la viabilidad de ejecutar modelos QAT en Apple silicon.
- Despliegue en entornos con memoria unificada abundante: estaciones de trabajo con 64 GB o más pueden alojar el modelo con contextos de hasta 4096-8192 tokens sin agotar la memoria.
- Benchmarking de decodificación en Apple silicon: aunque no hay mediciones oficiales de Visible, el modelo puede usarse para medir tokens por segundo en configuraciones específicas (el zoo estima 17.2 tok/s en int4).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica explícitamente que Visible no ha ejecutado el bundle y que no existe ninguna medición de rendimiento. El repositorio `coreai-model-zoo` estima una velocidad de decodificación de 17.2 tok/s para un modelo denso de 31B en int4, basada en límites de ancho de banda, pero no es una medición de este bundle concreto.

## Requisitos de hardware

- VRAM/memoria unificada mínima: 64 GB (el tier declarado). Los pesos residentes ocupan 20.09 GB, y la KV cache añade 8.05 GB a 4096 tokens de contexto (total ~28.1 GB) o 16.1 GB a 8192 tokens (total ~36.2 GB).
- No soportado en máquinas de 16 GB: los pesos por sí solos superan el `recommendedMaxWorkingSetSize` de Metal (≈10.7 GB) por un factor de 2.
- No soportado en máquinas de 32 GB: el tier declarado es 64 GB, y no se recomienda ningún contexto en 32 GB.
- GPU: Apple silicon con GPU integrada (M-series); iPhone y iPad no soportados.
- Opciones de despliegue: runtime Core AI con `COREAI_CHUNK_THRESHOLD=1`; no compatible con vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: no disponibles (sin mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 31B Core AI (visible-cx) | 31.3B | int4 q4_0 | no disponible | Gemma | Core AI `.aimodel` |
| Gemma 4 12B Core AI (visible-cx) | ~12B | int4 | no disponible | Gemma | Core AI `.aimodel` |
| Gemma 4 31B (original, Google) | 31.3B | bf16 | 256K | Gemma | Safetensors |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El bundle es solo de decodificación: no hay función de prefill, por lo que los prompts se procesan token a token, lo que impacta significativamente la latencia de la primera respuesta.
- No ha sido probado: Visible no ha generado ni un solo token con este bundle; el comportamiento en producción es desconocido.
- Requiere 64 GB de memoria unificada: no es viable en la mayoría de los Mac actuales (16-32 GB).
- La KV cache es extremadamente costosa: 1,966,080 bytes por token, 160 veces la del LFM2.5 1.2B y 2.5 veces la del 12B.
- El kernel Metal SDPA es obligatorio y no puede omitirse; sin él, el modelo falla en el primer token.
- Sin soporte para iPhone/iPad: solo Mac con Apple silicon.
- Licencia Gemma: restricciones de uso comercial según los términos de Google.
- El contexto máximo declarado en el manifiesto no cambia el grafo exportado; ampliar la ventana es una edición del manifiesto, pero la viabilidad depende de la memoria disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/visible-cx/Gemma-4-31B-CoreAI
- Documentación de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Repositorio coreai-model-zoo (modelo gemma4-31b): https://github.com/john-rocky/coreai-model-zoo/tree/main/models/gemma4-31b
- Bundle similar en HuggingFace (mlboydaisuke): https://huggingface.co/mlboydaisuke/Gemma-4-31B-CoreAI/blob/main/README.md
