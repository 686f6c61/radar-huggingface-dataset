# xpressionist/lesto-gemma-4-26b-a4b-text-4bit

## Resumen

Lesto 26B-A4B 4-bit es una cuantización de 4 bits del modelo `google/gemma-4-26B-A4B-it` de Google, publicada por el usuario xpressionist bajo el identificador `xpressionist/lesto-gemma-4-26b-a4b-text-4bit`. El checkpoint está pensado para Apple Silicon y se distribuye en formato MLX (safetensors), con un tamaño de repositorio de 14,2 GB y 25.233.053.440 parámetros totales. Forma parte de Lesto, un experimento personal de inferencia rápida de Gemma 4 en Macs con chip de Apple, y no tiene afiliación con Google.

La aportación técnica principal frente a una cuantización estándar de 4 bits es un proceso de redondeo más cuidadoso de las proyecciones de atención mediante el método oQe (clipping ponderado por importancia y reajuste por mínimos cuadrados), calibrado sobre un conjunto de texto multilingüe público. Además, incluye una lista auxiliar de los 162.489 tokens de salida en escritura latina (más tokens especiales y de fallback de bytes) que permite puntuar solo ese subconjunto en la generación, con una ganancia medida de en torno al 5 % en velocidad de decodificación.

El modelo es relevante para quien quiera ejecutar localmente un Gemma 4 de tipo Mixture of Experts (26B totales, ~4B activos según el nombre) en un Mac, con una fidelidad al modelo fuente superior a la cuantización estándar de 4 bits (KL de 0,171 frente a 0,308) y velocidades de decodificación de hasta 89,3 tok/s en un M4 Pro. No se han publicado datos de benchmarks de calidad de tarea en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (Gemma 4), cuantizado en formato MLX affine |
| Parámetros totales | 25.233.053.440 (25,2 B) |
| Parámetros activos | no disponible (el nombre del modelo indica A4B, ~4B activos, sin cifra oficial en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit affine, group size 64; routers y tensores indicados por la config permanecen en 8 bits |
| Idiomas soportados | no disponible (la model card documenta pruebas en 28 idiomas, pero no declara una lista oficial) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 14,2 GB |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 con arquitectura Mixture of Experts: 25,2 mil millones de parámetros totales y, según el sufijo A4B del nombre, aproximadamente 4 mil millones activos por token. La model card del checkpoint cuantizado no detalla la composición del dataset de entrenamiento original, el número de tokens ni si hubo fases de RLHF o DPO; esa información correspondería a la model card de `google/gemma-4-26B-A4B-it`, que no se ha incluido en la información proporcionada.

La innovación técnica del checkpoint es el proceso de cuantización. Las 115 proyecciones de atención se cuantizan a 4 bits affine con group size 64 y se redondean con el método oQe de oMLX: clipping ponderado por importancia y un reajuste por mínimos cuadrados, calibrado sobre un conjunto de texto multilingüe público de oMLX. El resto de tensores también está a 4 bits, salvo los routers y los tensores que la configuración fija en 8 bits. El resultado es un formato MLX affine estándar, cargable por cualquier motor MLX que soporte Gemma 4.

Adicionalmente, el checkpoint incluye un archivo con la lista de los 162.489 tokens de salida (de 262.144) cuyo texto es escritura latina, más los tokens especiales y de fallback de bytes. Lesto puntúa solo ese subconjunto durante la generación, lo que reduce la memoria leída por token y aporta alrededor de un 5 % de mejora en decodificación. La tabla completa de tokens se conserva y se usa para leer la entrada.

## Capacidades

- Generación de texto conversacional y de tipo instruct, heredadas del modelo base `gemma-4-26B-A4B-it`.
- Razonamiento y generación de texto multilingüe: la model card verifica respuestas idénticas con la cabeza latina activada y desactivada en 25 idiomas de escritura latina (italiano, francés, español, portugués, catalán, rumano, alemán, neerlandés, sueco, danés, noruego, finés, polaco, checo, eslovaco, esloveno, croata, estonio, letón, lituano, irlandés, galés, islandés, albanés y turco).
- La cabeza latina elimina tokens sueltos en húngaro y maltés; en vietnamita degrada la salida y debe desactivarse.
- Para escrituras no latinas (ruso, chino, árabe, griego) la cabeza latina debe desactivarse: con ella activada la salida se translitera a letras latinas y puede ser incorrecta.
- Soporte de tool calling, function calling, agentes y modo thinking: no disponible en la información proporcionada para este checkpoint.
- Capacidades de visión: el modelo base se describe como VLM en los resultados de búsqueda, pero este checkpoint se etiqueta como `text-generation` y la model card no documenta entrada de imagen.

## Casos de uso

- Inferencia local en Macs con Apple Silicon: el checkpoint está diseñado para Lesto y para motores MLX (mlx-serve, mlx-lm, oMLX, vllm-mlx, mlx-vlm), de modo que un desarrollador puede servir un Gemma 4 de 26B en un M4 Pro de 64 GB con decodificación de 67-89 tok/s según el motor.
- Asistente conversacional en local con requisitos de privacidad: al ejecutarse íntegramente en el equipo, permite conversaciones multi-turno sin enviar datos a servicios externos; la ventana de contexto no está documentada, pero las pruebas cubren prompts de 1k, 8k y 16k tokens.
- Generación de texto en idiomas latinos (español, italiano, francés, alemán, portugués, etc.): la cabeza latina está activada por defecto y produce respuestas idénticas a la versión sin cabeza en 25 idiomas, con un 5 % más de velocidad de decodificación.
- Prototipado e investigación sobre cuantización: el checkpoint sirve como referencia para estudiar el efecto del redondeo oQe frente a la cuantización estándar de 4 bits, con métricas de divergencia KL publicadas (0,171 frente a 0,308) y comparación ciega contra el checkpoint de 8 bits de mlx-community.
- Evaluación comparativa de motores de inferencia en Mac: la model card publica latencias y throughput para Lesto 0.15.1, mlx-serve 26.11.2 y mlx-lm 0.32.2 sobre el mismo hardware, lo que facilita reproducir benchmarks con `scripts/bench.py`.
- Despliegue de un modelo de 26B en hardware de consumo: con 14,2 GB de pesos en disco y 64 GB de memoria unificada, cabe en un Mac de gama alta; para escenarios con escrituras no latinas se debe arrancar con `MLX_SERVE_LATIN_HEAD_OFF=1`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de tarea (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí publica métricas de fidelidad a la cuantización y de velocidad.

Fidelidad al modelo fuente (divergencia KL de la distribución del siguiente token, top 10, sobre 200 prompts, un solo motor; menor es más cercano):

| Checkpoint | KL respecto al modelo fuente |
|---|---:|
| `mlx-community` 4-bit | 0,308 |
| Este checkpoint | 0,171 |
| `mlx-community` 8-bit | 0,023 |

Este checkpoint tiene KL inferior al 4-bit estándar en 160 de los 200 prompts.

Comparación ciega de respuestas contra el checkpoint de 8 bits de `mlx-community`:

| Lectura | Pares | Preferido este | Preferido 8-bit | Empate | Conflictos de hechos | Defectos (este / 8-bit) |
|---|---:|---:|---:|---:|---:|---:|
| Italiano, prompts de 8k | 20 | 2 | 1 | 17 | 0 | 1 / 4 |
| Inglés, prompts de 8k | 20 | 2 | 1 | 17 | 0 | 3 / 3 |
| Inglés, prompts de 1k y 16k | 40 | 4 | 2 | 34 | 0 | 3 / 4 |

Un hablante nativo de italiano, también a ciegas y sin el texto fuente, marcó los 20 pares italianos como empates. Las respuestas de este checkpoint fueron algo más cortas: mediana de 117 tokens frente a 131,5.

Velocidad (M4 Pro, 20 núcleos GPU, 64 GB, macOS 26.7.2; flags por defecto, un usuario, 15 peticiones en frío por tamaño de prompt, respuesta de 200 tokens):

| Motor y checkpoint | Decodificación tok/s, 1k / 8k | Primer texto s, 1k / 8k | Respuesta de 200 tokens s, 1k / 8k |
|---|---:|---:|---:|
| Lesto, este checkpoint | 89,3 / 83,3 | 1,38 / 10,25 | 3,61 / 12,64 |
| Lesto, este checkpoint, cabeza off | 84,5 / 79,2 | 1,38 / 10,23 | 3,73 / 12,74 |
| Lesto, `mlx-community` 4-bit | 84,5 / 79,1 | 1,38 / 10,34 | 3,74 / 12,86 |
| mlx-serve 26.11.2, este checkpoint | 71,8 / 51,6 | 1,37 / 9,44 | 4,14 / 13,30 |
| mlx-serve 26.11.2, `mlx-community` 4-bit | 71,9 / 51,7 | 1,37 / 9,37 | 4,13 / 13,22 |
| mlx-lm 0.32.2, este checkpoint | 67,3 / 62,7 | 1,44 / 10,79 | 4,39 / 13,97 |
| mlx-lm 0.32.2, `mlx-community` 4-bit | 67,3 / 62,6 | 1,44 / 10,90 | 4,39 / 14,10 |

Sin la cabeza, el checkpoint rinde igual que el 4-bit estándar en los seis motores medidos (incluidos oMLX, vllm-mlx y mlx-vlm, no mostrados en la tabla); su ventaja es la cercanía al modelo fuente, no la velocidad. No se midieron varios usuarios simultáneos.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan 14,2 GB en disco; en Apple Silicon se cargan en memoria unificada. La medición de referencia usa un Mac con 64 GB.
- GPU recomendadas: Apple Silicon de gama alta; el benchmark se ejecuta en un M4 Pro con 20 núcleos GPU y 64 GB. No hay datos para A100, H100 ni RTX 4090, y el formato MLX está orientado a Apple Silicon.
- ¿Cabe en GPU de consumo? En Macs con memoria unificada suficiente (la referencia es 64 GB); no hay datos para GPUs NVIDIA de consumo.
- Opciones de despliegue: Lesto 0.15.1 (motor de referencia), mlx-serve 26.11.2, mlx-lm 0.32.2, oMLX, vllm-mlx y mlx-vlm. No es compatible con llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: en M4 Pro, 89,3 tok/s de decodificación con prompt de 1k y 83,3 tok/s con 8k en Lesto; 71,8/51,6 en mlx-serve y 67,3/62,7 en mlx-lm. El primer token tarda 1,38 s con 1k y 10,25 s con 8k; una respuesta de 200 tokens tarda 3,61 s con 1k y 12,64 s con 8k.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`lesto-gemma-4-26b-a4b-text-4bit`) | 25,2 B totales | no disponible | MLX safetensors, 4-bit | apache-2.0 | KL 0,171; 89,3 tok/s en M4 Pro con Lesto |
| `mlx-community` 4-bit de Gemma 4 26B-A4B | 25,2 B totales (según modelo base) | no disponible | MLX, 4-bit | no disponible | KL 0,308; 84,5 tok/s en M4 Pro con Lesto |
| `mlx-community` 8-bit de Gemma 4 26B-A4B | 25,2 B totales (según modelo base) | no disponible | MLX, 8-bit | no disponible | KL 0,023; el doble de tamaño; preferido en 1 de 20 pares italianos y 1 de 20 ingleses |
| `google/gemma-4-26B-A4B-it` (modelo fuente) | 25,2 B totales | no disponible | safetensors originales | no disponible en la información | Referencia de calidad; no ejecutable directamente en MLX sin cuantizar |

## Limitaciones y advertencias

- Es una cuantización con pérdida: las respuestas no son idénticas palabra por palabra a las del modelo fuente, aunque la KL es menor que la del 4-bit estándar.
- La cabeza latina está activada por defecto y degrada la salida en escrituras no latinas (ruso, chino, árabe, griego) y en vietnamita; debe desactivarse con `MLX_SERVE_LATIN_HEAD_OFF=1` en esos casos.
- La lista de tokens latinos solo la usa Lesto; otros motores MLX no la aplican.
- La evaluación de calidad se hizo con un lector que era un modelo de IA sin el texto fuente, por lo que un error compartido por ambas respuestas comparadas puede pasar desapercibido; además, los prompts en italiano solo existen a 8k.
- No se midió el comportamiento con varios usuarios concurrentes.
- No hay datos publicados de sesgos, riesgo de alucinación ni limitaciones idiomáticas específicas en la información disponible; deben consultarse en la model card del modelo base.
- La licencia es Apache 2.0, la misma del modelo fuente; la model card remite a la licencia de `google/gemma-4-26B-A4B-it` para los términos aplicables.
- El proyecto es un experimento personal independiente, sin afiliación ni respaldo de Google; Gemma es una marca de Google LLC.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/xpressionist/lesto-gemma-4-26b-a4b-text-4bit
- Modelo base (instruct): https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo base (card general): https://huggingface.co/google/gemma-4-26B-A4B
- Repositorio de Lesto: https://github.com/fedeandri/lesto
