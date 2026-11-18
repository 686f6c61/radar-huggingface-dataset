# tieubaoca/AREX-2-MTP-Draft

## Resumen

AREX-2 MTP Draft es un modelo auxiliar (sidecar) de predicción multi-token (MTP) diseñado para acelerar la decodificación especulativa en llama.cpp junto al modelo objetivo BAAI/AREX-2. Lo desarrolla el usuario de Hugging Face tieubaoca como proyecto comunitario y experimental, y su función no es generar respuestas de forma autónoma, sino proponer tokens candidatos que el modelo objetivo verifica. Se distribuye como pesos GGUF que se cargan con el parámetro `--model-draft` junto al modelo principal.

El modelo parte de una inicialización con quince tensores procedentes de un MTP de Qwen3.8-27B y se ajusta sobre representaciones ocultas extraídas del propio AREX-2, con el objetivo de predecir el siguiente token a partir del estado oculto del objetivo y del embedding del token actual. Cuenta con aproximadamente 2.970 millones de parámetros y se ofrece en dos cuantizaciones (Q4_0 y F16) más un state dict de PyTorch para reentrenamiento o exportación.

Su relevancia es acotada pero concreta: documenta una mejora de throughput de decodificación de 20,15 a 30,61 tokens/s en una MI50 con un presupuesto de dos tokens de borrador, con una tasa de aceptación del 70,2 % sobre 1.272 propuestas. Es, por tanto, una pieza de infraestructura para reducir latencia en inferencia local, no un modelo conversacional de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP sidecar (prediccion multi-token) sobre transformer; consume estado oculto del objetivo y embeddings, proyecta con la LM head congelada del objetivo |
| Parametros totales | 2.967.501.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (en las pruebas se uso `-c 768`) |
| Tipos de cuantizacion | Q4_0 y F16 (ambos conservan pesos de normalizacion en F32) |
| Idiomas soportados | no disponible (texto; las pruebas incluyen prompts en ingles y vietnamita) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), PyTorch state dict (`teacher_mtp.pt`) |

## Arquitectura y entrenamiento

El sidecar implementa un cabezal MTP que, en la posicion `j`, toma el estado oculto del modelo objetivo en `j-1` junto con el embedding del token `j` generado por el profesor, y predice el token `j+1` a traves de la LM head fija del objetivo. El modelo objetivo, los embeddings y la cabeza de salida permanecen congelados durante el entrenamiento; solo se ajustan las matrices MTP. La inicializacion proviene de quince tensores de un MTP Q4_0 de Qwen3.8-27B (conversion atribuida a Unsloth), lo que actua como warm-start.

Los datos de entrenamiento son muy reducidos: cuarenta y cinco prompts tecnicos semilla que, tras dividir por familia de prompt, producen 38 secuencias de entrenamiento y 7 de validacion. El profesor genero hasta 40 tokens de continuacion greedy por prompt y las etiquetas son los IDs seleccionados por el profesor. La optimizacion uso una secuencia por micro-lote, autocast FP16 con gradient scaling, proyeccion de vocabulario en bloques de ocho posiciones, AdamW con clipping de norma de gradiente a 1.0, learning rate de 3e-6 y cuatro epocas. La seleccion se hizo por top-1 de validacion: la epoca 1 alcanzo 90,36 % de top-1 y perdida 0,4026 sobre 280 tokens, frente al 85,00 % y 0,5228 del warm-start de Qwen.

## Capacidades

- Prediccion multi-token (MTP) para decodificacion especulativa: propone tokens candidatos que el modelo objetivo verifica.
- Integracion nativa con llama.cpp mediante `--spec-type draft-mtp` y `--spec-draft-n-max`.
- Funcionamiento como sidecar separado del modelo objetivo, sin requerir fusion de pesos.
- Soporte de cuantizacion Q4_0 para inferencia y F16 como referencia de precision.
- Exportacion y reentrenamiento a partir del state dict de PyTorch incluido.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No dispone de capacidades de vision, audio, tool calling ni razonamiento agentico propias: hereda el comportamiento del modelo objetivo que verifica las propuestas.

## Casos de uso

- Aceleracion de inferencia local de AREX-2 en llama.cpp: cargar el GGUF Q4_0 como `--model-draft` junto al objetivo Q5_K_M para reducir la latencia de decodificacion en entornos con una sola GPU, aprovechando el incremento medido de 20,15 a 30,61 tokens/s.
- Despliegue en hardware AMD de gama antigua: el autor documenta funcionamiento en una Radeon Instinct MI50 (gfx906) con variables ROCm concretas (`HSA_OVERRIDE_GFX_VERSION=9.0.6`), lo que lo hace util en clústeres con GPU no soportadas por los stacks habituales.
- Servicio de completado de codigo con latencia ajustada: al proponer dos tokens por paso y aceptarse el 70,2 % en prompts tecnicos, resulta adecuado para autocompletado en editores donde el tiempo por token es critico.
- Experimentacion en decodificacion especulativa: sirve como banco de pruebas reproducible para medir tasas de aceptacion y throughput con distintos presupuestos de borrador (`--spec-draft-n-max` 1 frente a 2).
- Reentrenamiento de cabezales MTP para otros modelos objetivo: el repositorio de entrenamiento y el state dict permiten replicar el pipeline de extraccion de estados ocultos y ajuste con un profesor distinto.
- Evaluacion comparativa de cuantizaciones: los ficheros Q4_0 y F16 permiten medir el impacto de la cuantizacion del sidecar en la tasa de aceptacion y en la calidad de la salida.

## Benchmarks y rendimiento

Las mediciones proceden de una sola AMD Radeon Instinct MI50 con aproximadamente 32 GiB de VRAM, completado greedy de texto, una peticion a la vez y throughput de decodificacion excluyendo el procesamiento del prompt.

Cinco prompts cortos, maximo 48 tokens generados por prompt:

| Configuracion | Aceptados / propuestos | Tokens/s de decodificacion |
|---|---:|---:|
| Solo objetivo | — | 20,77 |
| Warm-start Qwen Q4_0 con tensores compartidos de AREX-2, un borrador | 109 / 122 | 30,64 |
| Entrenado F16, un borrador | 109 / 122 | 29,85 |
| Entrenado Q4_0, un borrador | 108 / 122 | 29,93 |
| Entrenado Q4_0, hasta dos borradores | 138 / 188 | 31,54 |

Cuatro prompts mas dificiles, maximo 384 tokens generados por prompt:

| Tarea | Aceptados / propuestos | Borrador activo (tokens/s) | Borrador desactivado (tokens/s) |
|---|---:|---:|---:|
| Contar subarrays con suma K | 233 / 298 | 32,64 | 20,32 |
| Resolver un puzzle de inversion de cinco digitos | 229 / 307 | 31,72 | 20,17 |
| Resolver un problema de probabilidad condicional en vietnamita | 228 / 308 | 31,37 | 20,03 |
| Disenar una API de reserva de asientos con condiciones de carrera | 203 / 359 | 27,03 | 19,90 |
| **Agregado** | **893 / 1.272** | **30,61** | **20,15** |

En los cinco prompts cortos, la salida greedy coincidio con la del objetivo solo en cuatro de cinco; en el prompt de Python restante difirio la firma de la funcion. En los cuatro prompts dificiles, todas las salidas alcanzaron el limite de tokens y el texto greedy difirio en los cuatro casos. El autor senala que la comparacion con un solo borrador no mostro ganancia frente al warm-start de Qwen.

## Requisitos de hardware

- VRAM del sidecar: el repositorio completo ocupa 6,6 GB; el fichero Q4_0 es la opcion de menor huella y el F16 la de mayor, ambos conservando pesos de normalizacion en F32.
- VRAM total: el sidecar se suma al modelo objetivo (en las pruebas, AREX-2 Q5_K_M de bartowski) y al proyector visual, que se descargan por separado.
- GPU documentada: AMD Radeon Instinct MI50 con aproximadamente 32 GiB de VRAM, arquitectura gfx906, con `HSA_OVERRIDE_GFX_VERSION=9.0.6` y `GGML_CUDA_NO_PINNED=1`.
- GPU consumer: no hay datos publicados sobre funcionamiento en RTX 4090 u otras GPU de consumo; no disponible.
- Despliegue: llama.cpp con soporte de sidecar `draft-mtp` (build ROCm en el ejemplo), usando `llama-server` con `-m` para el objetivo y `-md` para el borrador, `-ngl 99 -ngld 99`, `--fit off`, `--load-mode none` y `--no-warmup`.
- Throughput medido: 30,61 tokens/s con borrador frente a 20,15 tokens/s sin el, en la MI50 y con el objetivo Q5_K_M.
- No se han publicado datos de latencia por token ni de throughput con procesamiento de prompt incluido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AREX-2 MTP Draft (este) | 2,97 B | no disponible | Sidecar MTP para decodificacion especulativa de AREX-2 | apache-2.0 | GGUF y state dict en Hugging Face |
| MTP Q4_0 de Qwen3.8-27B | no disponible | no disponible | MTP para el modelo Qwen; usado como warm-start | no disponible | GGUF local citado por el autor |
| BAAI/AREX-2 | no disponible | no disponible | Modelo objetivo multimodal de referencia | no disponible | Hugging Face y GGUF de bartowski |

No se dispone de datos de benchmarks comparables entre estos elementos, ya que el sidecar no es funcional de forma independiente y su rendimiento depende del objetivo con el que se empareja.

## Limitaciones y advertencias

- Proyecto experimental y comunitario, sin pipeline definido ni idiomas declarados en la ficha de Hugging Face.
- Entrenado con solo 38 secuencias y 7 de validacion, derivadas de 45 prompts tecnicos: la generalizacion es muy limitada y la evidencia sobre calidad de respuesta es escasa.
- La evaluacion se hizo con una sola GPU (MI50), una peticion a la vez y presupuestos de 48 y 384 tokens; no hay datos multi-usuario ni de concurrencia.
- El texto greedy difirio del objetivo en los cuatro prompts dificiles y en uno de los cinco cortos, por lo que no se garantiza equivalencia de salida.
- La comparacion con un solo borrador no supero al warm-start de Qwen (30,64 frente a 29,93 tokens/s en Q4_0 entrenado), y el warm-start no se midio con dos borradores.
- Requiere una build de llama.cpp con soporte especifico de `draft-mtp`; no funciona con versiones estandar sin ese parche.
- El checkpoint contiene solo pesos: el modelo objetivo y el proyector visual son descargas separadas y necesarias.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al ser un sidecar, el comportamiento final depende del modelo objetivo.
- Licencia apache-2.0 permite uso comercial, pero las condiciones de los pesos base de AREX-2 y Qwen3.8-27B deben verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/tieubaoca/AREX-2-MTP-Draft
- Repositorio de entrenamiento y benchmark: https://github.com/remiehneppo/AREX-2-MTP-Draft-Train
- Commit de reproduccion citado: https://github.com/remiehneppo/AREX-2-MTP-Draft-Train/tree/39b8fe0cbf405100a10c8bad52b1b17727cd2206
- Modelo objetivo BAAI AREX-2: https://huggingface.co/BAAI/AREX-2
- GGUF del objetivo (bartowski): https://huggingface.co/bartowski/BAAI_AREX-2-GGUF
- Qwen3.8-27B (origen del warm-start): https://huggingface.co/Qwen/Qwen3.8-27B
