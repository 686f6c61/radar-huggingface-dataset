# Takenoko12345678/Qwen3.5-0.8B-Japanese-SFT-v3-28L-Loop

## Resumen

Qwen3.5-0.8B-Japanese-SFT-v3-28L-Loop es un modelo derivado de Qwen/Qwen3.5-0.8B, publicado por el usuario Takenoko12345678 en Hugging Face. Se trata de una variante experimental del modelo base afinado para japones (Qwen3.5-0.8B-Japanese-SFT-v3, de 24 capas) a la que se le aplica, sin entrenamiento adicional, la tecnica de "looped transformers" descrita en el paper arXiv:2605.23872 (UT Austin, mayo de 2026). El resultado es un modelo estandar de 28 capas `Qwen3_5ForCausalLM` que puede ejecutarse con `transformers`, vLLM, llama.cpp o LM Studio sin codigo personalizado.

La innovacion principal es la aplicacion de una iteracion de Euler con decaimiento sobre el bloque de capas L16-L19 del modelo original: la salida residual de ese macrobloque se reinyecta una segunda vez con pesos b1 = 0.90 y b2 = 0.10, y el resultado se pliega en una arquitectura convencional de 28 capas. Esto permite obtener mejoras en determinados benchmarks de razonamiento y conocimiento del japones sin reentrenar, a costa de un incremento de tamano y coste de inferencia de aproximadamente el 15%.

El modelo tiene 835.411.744 parametros reales (segun safetensors), un repositorio de 1,7 GB, licencia Apache 2.0 y soporte declarado para japones e ingles. Es relevante como experimento reproducible de la tecnica training-free looped transformer aplicada a un modelo pequeno de la familia Qwen3.5, y como alternativa de comparacion frente a la version GA de 24 capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con bloques `[Gated DeltaNet x3 + Full Attention x1]`, expandido a 28 capas mediante looped transformer sin entrenamiento |
| Parametros totales | 835.411.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (existe version GGUF en repositorio separado) |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, cuya arquitectura combina bloques de atencion lineal Gated DeltaNet con atencion completa en una proporcion de 3:1 dentro de cada macrobloque de 4 capas. Sobre el checkpoint afinado en japones v3 (24 capas), el autor aplica la tecnica de Training-Free Looped Transformers (arXiv:2605.23872): selecciona el bloque L16-L19, lo ejecuta una segunda vez y combina las salidas residuales con coeficientes b1 = 0.90 (primera pasada) y b2 = 0.10 (segunda pasada), sumando 1.0. La combinacion se aplica directamente sobre las proyecciones residuales sin sesgo (`out_proj`, `o_proj`, `down_proj`) y el resultado se pliega en un modelo estandar de 28 capas.

No hay entrenamiento adicional ni ajuste fino en esta variante: la transformacion es puramente estructural y determinista, ejecutada mediante el script `scripts/make_tflt_28l.py` incluido en el repositorio. El modelo base v3 (24 capas) si fue afinado en japones, pero los detalles de ese ajuste (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se especifican en la informacion disponible. El checkpoint resultante conserva la interfaz estandar de `Qwen3_5ForCausalLM`, lo que permite cargarlo con las herramientas habituales sin modificar el codigo.

## Capacidades

- Generacion de texto conversacional en japones e ingles.
- Razonamiento de sentido comun en japones (evaluado en JCommonsenseQA).
- Razonamiento matematico basico en japones (evaluado en MGSM y GSM8K).
- Conocimiento factual basico en japones (evaluado en Fact-50).
- Conocimiento cientifico de nivel MMLU-Pro (evaluado en subconjunto de ciencias).
- Compatible con endpoints y despliegue estandar (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion comparativa de tecnicas de looped transformer: el modelo sirve como referencia reproducible para medir el efecto de la iteracion training-free sobre un modelo pequeno, comparando directamente contra la version GA de 24 capas con los mismos prompts y semillas.
- Procesamiento de texto en japones en entornos con recursos limitados: con 835 millones de parametros y licencia Apache 2.0, puede desplegarse en una sola GPU consumer para tareas de generacion y clasificacion en japones.
- Experimentacion academica sobre arquitecturas hibridas: permite estudiar el comportamiento de bloques Gated DeltaNet con atencion completa cuando se reinyecta un macrobloque sin reentrenar.
- Tareas de sentido comun y QA en japones: obtiene 78,82% en JCommonsenseQA (1-pass) y 80,70% (5-rot), lo que lo hace util para prototipos de respuesta a preguntas de cultura general en japones.
- Razonamiento matematico basico asistido: con 28,0% en MGSM japones (250 preguntas) y 43,5% en GSM8K japones (Fresh-200), es adecuado para experimentos de resolucion de problemas aritmeticos simples con verificacion humana.
- Base para experimentos de cuantizacion y despliegue: al existir version GGUF en repositorio separado y soporte en llama.cpp, LM Studio y vLLM, sirve para comparar latencia y calidad entre formatos en hardware modesto.
- Filtrado y generacion de contenido en ingles: con 61,34% en CommonsenseQA ingles (1-pass) y 61,92% (5-rot), puede usarse en tareas de generacion y clasificacion de texto en ingles con supervision.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en NVIDIA L4 con BF16 y vLLM 0.34.0, comparando la version loop de 28 capas con la version GA de 24 capas y la version v2.5:

| Benchmark | v2.5 (24L) | v3 GA (24L) | v3-28L-Loop (28L) |
|---|---:|---:|---:|
| JCommonsenseQA (1-pass) | 70,96% | 78,55% | 78,82% (882/1119) |
| JCommonsenseQA (5-rot) | 79,36% | 80,61% | 80,70% (903/1119) |
| EN CommonsenseQA (1-pass) | 51,43% | 61,92% | 61,34% |
| EN CommonsenseQA (5-rot) | 60,11% | 61,67% | 61,92% |
| MMLU-Pro ciencias (@4k) | 30,7% | 36,0% | 35,3% |
| MMLU-Pro ciencias (@8k) | 32,7% | 36,3% | 36,3% |
| MGSM japones 250 preguntas (@4k) | 28,0% | 26,8% | 28,0% |
| GSM8K japones no visto (Fresh-200) | 38,0% | 43,5% | 43,5% |
| MGSM-100 (@512) | 26,0% | 33,0% | 32,0% |
| Fact-50 japones (hechos basicos) | 50,0% | 52,0% | 44,0% |

El autor indica ademas un 54,9% en MMLU-Pro biologia para la version de 28 capas. No se han publicado resultados de benchmarks adicionales (MMLU completo, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB de pesos mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9-1,2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): alrededor de 0,5-0,7 GB de pesos.
- GPU recomendadas: NVIDIA L4 (usada por el autor para los benchmarks), A100, H100 para despliegues con concurrencia; RTX 4090, RTX 3090, RTX 4070 y superiores para uso individual.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM en BF16, y en GPUs integradas o CPU con cuantizacion GGUF.
- Opciones de despliegue: transformers, vLLM (version 0.34.0 usada por el autor), llama.cpp, LM Studio; el autor indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles de forma explicita; el autor senala que el coste de inferencia aumenta aproximadamente un 15% respecto a la version de 24 capas por las 4 capas adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-0.8B-Japanese-SFT-v3-28L-Loop | 835 M | No disponible | Apache 2.0 | Version loop de 28 capas, mejor JCommonsenseQA 1-pass (78,82%) |
| Qwen3.5-0.8B-Japanese-SFT-v3 (GA, 24L) | No disponible (24 capas) | No disponible | Apache 2.0 | Mejor balance global: Fact-50 52,0%, MMLU-Pro @4k 36,0%, menor coste |
| Qwen3.5-0.8B-Japanese-SFT-v2.5 (24L) | No disponible | No disponible | Apache 2.0 | Mejor en MGSM-ja (28,0% empatado) y peor en el resto |
| Qwen/Qwen3.5-0.8B (base) | No disponible | No disponible | Apache 2.0 | Modelo base sin ajuste japones especifico |

## Limitaciones y advertencias

- El modelo es un experimento de comparacion; el propio autor recomienda la version GA de 24 capas para uso general por su mejor equilibrio entre velocidad, tamano y conocimiento factual.
- Perdida de conocimiento factual en japones: Fact-50 cae de 52,0% a 44,0% (-4 preguntas) respecto a la version GA de 24 capas.
- Mayor coste de inferencia (aproximadamente un 15% mas) y mayor tamano de repositorio (1,7 GB) por las 4 capas adicionales.
- Rendimiento limitado en matematicas: 28,0% en MGSM japones y 43,5% en GSM8K japones, insuficiente para uso autonomo sin verificacion.
- Rendimiento limitado en conocimiento cientifico: en torno al 36% en MMLU-Pro ciencias, lo que restringe su uso en dominios tecnicos.
- Riesgo de alucinacion inherente a modelos de 0,8 mil millones de parametros; no se han publicado evaluaciones de factualidad mas alla de Fact-50.
- Idiomas limitados a japones e ingles; no se declara soporte para castellano ni otros idiomas.
- No se especifica la longitud de contexto soportada, lo que impide garantizar su comportamiento en conversaciones o documentos largos.
- Sesgos conocidos: no se documentan en la informacion disponible; se heredan del modelo base y del ajuste japones.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen/Qwen3.5-0.8B y del checkpoint v3 del que deriva.
- El modelo depende de la tecnica descrita en arXiv:2605.23872; cambios en la implementacion de `Qwen3_5ForCausalLM` en futuras versiones de transformers podrian afectar a la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Takenoko12345678/Qwen3.5-0.8B-Japanese-SFT-v3-28L-Loop
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Version GA de 24 capas: https://huggingface.co/Takenoko12345678/Qwen3.5-0.8B-Japanese-SFT-v3
- Version GGUF: https://huggingface.co/Takenoko12345678/Qwen3.5-0.8B-Japanese-SFT-v3-GGUF
- Paper Training-Free Looped Transformers: https://arxiv.org/abs/2605.23872
