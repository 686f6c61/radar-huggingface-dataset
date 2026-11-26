# xpressionist/lesto-gemma-4-26b-a4b-text-4bit

## Resumen

Lesto 26B-A4B 4-bit es una cuantización de 4 bits del modelo `google/gemma-4-26B-A4B-it`, publicada por el usuario independiente xpressionist. El checkpoint está pensado para Lesto, un experimento personal de inferencia rápida de Gemma 4 sobre Macs con Apple Silicon, y no tiene vinculación ni respaldo de Google. El repo ocupa 14,2 GB y contiene 25.233.053.440 parámetros en formato MLX safetensors.

La propuesta diferencial frente a otras cuantizaciones de 4 bits es doble. Por un lado, las 115 proyecciones de atención se cuantizan a 4 bits afín con tamaño de grupo 64 y se redondean con el método oQe de oMLX (clipping ponderado por importancia y reajuste por mínimos cuadrados), calibrado sobre un conjunto multilingüe público. Por otro, se incluye un fichero auxiliar que lista los 162.489 tokens de salida (de 262.144) cuyo texto es de escritura latina, más los especiales y de byte-fallback, de modo que el motor solo puntúa esos tokens durante la decodificación.

El resultado declarado por el autor es una mayor cercanía al modelo fuente que la cuantización estándar de 4 bits (KL de 0,171 frente a 0,308) y una decodificación aproximadamente un 5 % más rápida con la cabeza latina activada. Es una pieza relevante para quien quiera ejecutar Gemma 4 26B-A4B en local sobre Apple Silicon con MLX, aceptando que se trata de una cuantización con pérdida y de un proyecto no oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Gemma 4 26B-A4B (no se detalla en la información disponible) |
| Parametros totales | 25.233.053.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los benchmarks usan prompts de 1k, 8k y 16k) |
| Tipos de cuantizacion | 4 bits afín, grupo 64, en atención (115 proyecciones) y en casi todos los tensores; routers y otros tensores listados a 8 bits en la config permanecen a 8 bits |
| Idiomas soportados | no disponible de forma oficial; la cabeza latina cubre 28 idiomas probados (inglés, italiano, español, francés, portugués, catalán, rumano, alemán, neerlandés, sueco, danés, noruego, finés, polaco, checo, eslovaco, esloveno, croata, estonio, letón, lituano, irlandés, galés, islandés, albanés, turco, húngaro y maltés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un modelo entrenado desde cero. Hereda la arquitectura de `google/gemma-4-26B-A4B-it`; la información disponible no detalla la composición interna (número de capas, dimensión oculta, mecanismo de atención ni si emplea mezcla de expertos, aunque el sufijo A4B del nombre base sugiere parámetros activos reducidos). No se publican datos sobre el corpus de entrenamiento original, número de tokens, ni etapas de RLHF o DPO.

La innovación técnica está en el proceso de cuantización. Las 115 proyecciones de atención se redondean con oQe, un método de oMLX que aplica clipping ponderado por importancia y un reajuste por mínimos cuadrados, calibrado sobre un conjunto de texto multilingüe público de oMLX. Además, se añade un fichero con la lista de tokens de salida en escritura latina (162.489 de 262.144), que el motor Lesto usa para puntuar solo ese subconjunto durante la decodificación; la tabla completa se conserva y se sigue usando para leer la entrada. El autor declara que esto reduce la memoria leída por token y aporta en torno a un 5 % más de velocidad de decodificación.

## Capacidades

- Generación de texto conversacional en inglés y en al menos 28 idiomas de escritura latina, según las pruebas del autor con la cabeza latina activada.
- Razonamiento y respuesta multi-turno heredados del modelo base Gemma 4 26B-A4B-it.
- Decodificación con cabeza latina opcional: activada por defecto en Lesto, desactivable con `MLX_SERVE_LATIN_HEAD_OFF=1`.
- Compatibilidad con motores MLX que soporten Gemma 4 (Lesto, mlx-serve, mlx-lm, oMLX, vllm-mlx, mlx-vlm).
- Capacidades de tool calling, function calling, agentes o multimodalidad: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: con 14,2 GB de pesos y decodificación de 93 tok/s a 1k de contexto en un M4 Pro, permite mantener un chat privado sin conexión en un equipo de sobremesa con 64 GB de memoria unificada.
- Generación de texto en italiano, español, francés o alemán: el autor verificó respuestas idénticas con la cabeza latina activada y desactivada en estos idiomas, por lo que es adecuado para producción de contenido en lenguas romances y germánicas.
- Procesamiento de documentos largos: los benchmarks cubren prompts de 8k y 16k tokens con latencias de primera respuesta de 8,89 s y 11,21 s respectivamente, útil para resumir o extraer información de contratos y artículos.
- Desarrollo de prototipos sobre Apple Silicon: la integración con mlx-lm y mlx-serve permite iterar rápido en cuadernos y scripts sin depender de GPU dedicadas.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de oQe frente a la cuantización estándar de 4 bits en tareas de investigación sobre compresión de modelos.
- Despliegue de bajo consumo en estaciones de trabajo Mac: el formato MLX aprovecha la memoria unificada y evita transferencias a VRAM discreta, lo que simplifica el despliegue en entornos de desarrollo.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Sí aporta métricas de calidad y velocidad propias.

Calidad frente a la cuantización de 8 bits de `mlx-community` (lectura ciega por pares):

| Lectura | Pares | Preferido este | Preferido 8-bit | Empate | Conflictos factuales | Defectos este / 8-bit |
|---|---:|---:|---:|---:|---:|---:|
| Italiano, prompts de 8k | 20 | 2 | 1 | 17 | 0 | 1 / 4 |
| Inglés, prompts de 8k | 20 | 2 | 1 | 17 | 0 | 3 / 3 |
| Inglés, prompts de 1k y 16k | 40 | 4 | 2 | 34 | 0 | 3 / 4 |

Divergencia KL respecto al modelo fuente (200 prompts, top 10 tokens):

| Checkpoint | KL al modelo fuente |
|---|---:|
| `mlx-community` 4-bit | 0,308 |
| Este checkpoint | 0,171 |
| `mlx-community` 8-bit | 0,023 |

Velocidad en M4 Pro (20 núcleos GPU, 64 GB, macOS 26.7.2; 15 peticiones en frío por tamaño de prompt, respuesta de 200 tokens):

| Motor y checkpoint | Decodificación tok/s, 1k / 8k | Primer texto s, 1k / 8k | Respuesta 200 tokens s, 1k / 8k |
|---|---:|---:|---:|
| Lesto, este checkpoint | 93,0 / 85,6 | 1,28 / 8,89 | 3,42 / 11,21 |
| Lesto, este checkpoint, cabeza off | 88,0 / 81,2 | 1,28 / 8,89 | 3,54 / 11,34 |
| Lesto, `mlx-community` 4-bit | 88,0 / 81,3 | 1,28 / 8,87 | 3,54 / 11,32 |
| mlx-serve 26.11.2, este checkpoint | 71,8 / 51,6 | 1,37 / 9,44 | 4,14 / 13,30 |
| mlx-serve 26.11.2, `mlx-community` 4-bit | 71,9 / 51,7 | 1,37 / 9,37 | 4,13 / 13,22 |
| mlx-lm 0.32.2, este checkpoint | 67,3 / 62,7 | 1,44 / 10,79 | 4,39 / 13,97 |
| mlx-lm 0.32.2, `mlx-community` 4-bit | 67,3 / 62,6 | 1,44 / 10,90 | 4,39 / 14,10 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 14,2 GB en disco; en ejecución se necesita memoria adicional para caché KV, por lo que se recomienda al menos 32 GB de memoria unificada y 64 GB para contextos largos (el autor midió con 64 GB).
- GPU recomendadas: Apple Silicon con memoria unificada amplia; el autor valida en M4 Pro de 20 núcleos GPU. No se proporcionan datos para A100, H100 ni RTX 4090, ya que el formato MLX está orientado a Apple Silicon.
- Cabe en GPU de consumo: sí, en Macs con Apple Silicon; no hay datos para GPUs NVIDIA de consumo.
- Opciones de despliegue: Lesto (recomendado, con `lesto serve --model-dir`), mlx-serve, mlx-lm, oMLX, vllm-mlx y mlx-vlm.
- Latencia y throughput: 93 tok/s de decodificación a 1k de contexto y 85,6 tok/s a 8k en Lesto sobre M4 Pro; primer token en 1,28 s a 1k y 8,89 s a 8k. No se midieron varios usuarios simultáneos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este checkpoint (Lesto 26B-A4B 4-bit) | 25,23 B | no disponible | apache-2.0 | MLX safetensors 4-bit | KL 0,171; decodificación 93 tok/s en Lesto/M4 Pro |
| `mlx-community` 4-bit de Gemma 4 26B-A4B | no disponible | no disponible | no disponible | MLX 4-bit | KL 0,308; 88 tok/s en Lesto/M4 Pro |
| `mlx-community` 8-bit de Gemma 4 26B-A4B | no disponible | no disponible | no disponible | MLX 8-bit | KL 0,023; el doble de tamaño |
| `google/gemma-4-26B-A4B-it` (modelo fuente) | no disponible | no disponible | no disponible | safetensors | Referencia de calidad completa |

## Limitaciones y advertencias

- Es una cuantización con pérdida: las respuestas no coinciden palabra por palabra con el modelo fuente, aunque el autor reporta mayor cercanía que la cuantización estándar de 4 bits.
- La cabeza latina degrada idiomas de otras escrituras: con ella activada, las respuestas en ruso, chino, árabe o griego salen transliteradas a caracteres latinos y pueden ser incorrectas; también altera emojis (por ejemplo, tres emojis marinos se sustituyen por otros). Es obligatorio desactivarla con `MLX_SERVE_LATIN_HEAD_OFF=1` para esos idiomas.
- El vietnamita resultó dañado por la cabeza latina según las pruebas del autor; se recomienda desactivarla.
- La evaluación de calidad la realizó un modelo de IA sin el texto fuente, por lo que errores compartidos por ambas respuestas pueden pasar desapercibidos. Solo hay prompts en italiano a 8k.
- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) ni datos sobre sesgos o tasas de alucinación.
- Proyecto independiente no afiliado a Google; Gemma es marca de Google LLC. La licencia del checkpoint es apache-2.0, pero conviene verificar las condiciones del modelo base para uso comercial.
- No se midió el rendimiento con varios usuarios concurrentes.
- El formato MLX limita el despliegue a Apple Silicon; no es directamente compatible con vLLM, TGI, llama.cpp ni Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/xpressionist/lesto-gemma-4-26b-a4b-text-4bit
- Repositorio de Lesto: https://github.com/fedeandri/lesto
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
