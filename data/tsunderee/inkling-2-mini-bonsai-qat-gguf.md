# Tsunderee/Inkling-2-Mini-Bonsai-QAT-GGUF

## Resumen

Inkling-2-Mini Bonsai QAT es una cuantización de muy bajo bit (ultra-low-bit) del modelo `thinkingmachines/Inkling-2-Mini`, un transformer de tipo mezcla de expertos (MoE) con 26.070.385.152 parámetros totales y aproximadamente 3.400 millones de parámetros activos por token, publicado por el usuario Tsunderee en Hugging Face. El modelo emplea una arquitectura denominada `inkling2_loop`, en la que un núcleo de capas (6 a 17) se ejecuta tres veces por token, de modo que ese núcleo concentra alrededor del 75 % del cómputo.

El propósito de esta publicación no es ofrecer un modelo nuevo, sino un artefacto GGUF de 6,19 GiB obtenido mediante Quantization-Aware Training (QAT) combinado con destilación por divergencia KL desde el profesor original en BF16. El resultado es un fichero que cabe en dispositivos móviles con 12 GB de RAM y que se ejecuta de forma nativa en `llama.cpp` sin necesidad de forks personalizados, verificado en un Samsung Galaxy Z Flip 6 con Snapdragon 8 Gen 3 a unos 7,0 tokens por segundo.

Su relevancia actual reside en la combinación de tres factores: un MoE de 26 000 millones de parámetros comprimido hasta 2,25 y 1,125 bits por peso en los expertos, un proceso de entrenamiento que recupera buena parte de la calidad del profesor (divergencia KL final de 0,99 en inglés, 1,25 en matemáticas, 1,33 en código y 1,82 en ruso) y una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo recurrente (`inkling2_loop`); capas 6-17 ejecutadas 3 veces por token |
| Parámetros totales | 26.070.385.152 (26,4 B según model card) |
| Parámetros activos | ~3,4 B |
| Longitud de contexto | No disponible (el ejemplo de ejecución usa `-c 4096`) |
| Tipos de cuantización | Q2_0 (2,25 bpw) en expertos del núcleo; Q1_0 (1,125 bpw) en expertos externos; Q8_0 en atención y controladores de bucle; Q4_K/Q6_K en embeddings y LM head; F32 en normas, routers, shortconv y consultas AttnRes |
| Idiomas soportados | No disponible de forma oficial; el `imatrix` de calibración cubre inglés, ruso, código y matemáticas (35 % código, 25 % ruso, 20 % STEM en inglés, 20 % matemáticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Inkling-2-Mini-Bonsai-QAT-bonsai_6g1-step75.gguf`, 6,19 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 26,4 mil millones de parámetros totales y 3,4 mil millones activos, organizado en 24 capas. La peculiaridad estructural es el esquema `inkling2_loop`: las capas 6 a 17 forman un núcleo que se ejecuta tres veces por token, lo que implica que ese segmento concentra el 75 % del cómputo total. El modelo incorpora además componentes denominados "loop controllers", "shortconv" y "AttnRes queries", que en esta cuantización se mantienen en Q8_0 o F32 para preservar su precisión.

La cuantización se llevó a cabo con QAT más destilación KL desde el profesor BF16 congelado (`ggml-org/Inkling-2-Mini-GGUF`), sobre 2× NVIDIA H200 NVL, usando FSDP2, `torch._grouped_mm` y AdamW blockwise de 8 bits. La función de pérdida combina un 85 % de divergencia KL a temperatura T=2,0 y un 15 % de anclaje SFT sobre trazas equilibradas de código, ruso, STEM en inglés y matemáticas. El proceso consumió 1,23 millones de tokens de entrenamiento distribuidos en 75 pasos. La calibración del `imatrix` empleó 256 000 tokens multdominio. La asignación de bits es asimétrica: los expertos del núcleo reciben Q2_0 con escalas FP16 con signo aprendidas por bloque de 64, mientras que los expertos externos (capas 0-5 y 18-23) reciben Q1_0 con escalas FP16 aprendidas por bloque de 128.

## Capacidades

- Generación de texto conversacional, con etiqueta `conversational` en el repositorio.
- Razonamiento y matemáticas: el `imatrix` incluye un 20 % de datos matemáticos y la destilación se evalúa explícitamente en el dominio Math.
- Generación de código: el 35 % de la calibración es código y la divergencia KL en ese dominio es la segunda mejor tras inglés.
- Capacidades multilingües limitadas al inglés y al ruso según los datos de calibración y evaluación; no hay confirmación oficial de otros idiomas.
- Ejecución nativa en `llama.cpp` con soporte upstream para `inkling2_loop`, sin necesidad de parches.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Inferencia en dispositivos móviles de gama alta: el fichero de 6,19 GiB cabe en 12 GB de RAM y se ha verificado a ~7 tok/s en un Snapdragon 8 Gen 3, lo que permite asistentes locales sin conexión.
- Asistencia de código en portátiles sin GPU dedicada: con 3,4 B parámetros activos y un GGUF de 6,19 GiB, puede ejecutarse en CPU con `llama.cpp` para autocompletado y explicación de fragmentos, aprovechando el 35 % de calibración en código.
- Razonamiento matemático en entornos con recursos limitados: el dominio Math muestra la menor divergencia KL tras inglés (1,25 en el paso final), adecuado para resolución de problemas paso a paso en local.
- Procesamiento de texto en ruso: es el único idioma no inglés con datos explícitos de calibración y evaluación, útil para aplicaciones de traducción o resumen en ese idioma.
- Despliegue en entornos de borde (edge computing) con restricciones de memoria: al ocupar 6,19 GiB, encaja en dispositivos embebidos con 8-12 GB de RAM donde un modelo de 26 B en BF16 no cabría.
- Prototipado y experimentación con cuantizaciones extremas: sirve como referencia para estudiar el impacto de Q1_0 y Q2_0 con QAT en arquitecturas MoE recurrentes.
- Aplicaciones conversacionales de bajo consumo: el ejemplo oficial usa `--temp 0.6 --top-p 0.95 --min-p 0.06 --repeat-penalty 1.05` con `-fa on`, configuración orientada a diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona únicamente divergencia KL por dominio frente al profesor BF16:

| Paso | Tokens | Inglés | Matemáticas | Código | Ruso |
|---|---:|---:|---:|---:|---:|
| step=0 (OptimalPack, pre-QAT) | 0 | 3,70 | 4,94 | 4,96 | 6,79 |
| step=15 | 246 K | 1,16 | 1,59 | 2,01 | 3,32 |
| step=30 | 492 K | 1,10 | 1,36 | 1,69 | 2,22 |
| step=45 | 737 K | 1,01 | 1,27 | 1,54 | 1,87 |
| step=60 | 983 K | 1,05 | 1,58 | 1,43 | 2,21 |
| step=75 (final) | 1,23 M | 0,99 | 1,25 | 1,33 | 1,82 |

Métrica: T²·KL frente al profesor BF16 (menor es mejor).

## Requisitos de hardware

- VRAM/RAM estimada: 6,19 GiB para los pesos en el fichero `bonsai_6g1-step75.gguf`; se necesitan al menos 8 GB de memoria libre para margen de contexto y caché KV.
- Verificado en Samsung Galaxy Z Flip 6 (Snapdragon 8 Gen 3) con 12 GB de RAM a ~7,0 tok/s.
- Cabe en GPU de consumo con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070), aunque no se han publicado mediciones específicas en estas tarjetas.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; el entrenamiento QAT se realizó en 2× NVIDIA H200 NVL.
- Opciones de despliegue: `llama.cpp` upstream (soporte nativo de `inkling2_loop`), con CLI documentada. No se confirma compatibilidad con vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: ~7,0 tok/s en Snapdragon 8 Gen 3; sin datos para otras plataformas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento de modelos alternativos de tamaño o tarea comparable, por lo que no es posible establecer una comparación rigurosa sin inventar cifras.

## Limitaciones y advertencias

- La cuantización a Q1_0 y Q2_0 introduce degradación medible: la divergencia KL final en ruso (1,82) es casi el doble que en inglés (0,99), lo que sugiere mayor pérdida en dominios menos representados.
- El `imatrix` de calibración está sesgado hacia código, ruso, STEM en inglés y matemáticas; el rendimiento en otros dominios o idiomas puede ser notablemente peor.
- No hay datos publicados sobre sesgos sociales, toxicidad o tasas de alucinación.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha, lo que implica ausencia de validación comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base subyacente (`thinkingmachines/Inkling-2-Mini`) debe verificarse por separado para confirmar que su licencia es compatible.
- El contexto de ejemplo es de 4096 tokens; no se documenta la longitud máxima soportada, por lo que no se debe asumir ventanas largas en producción.
- Al ser una cuantización de un modelo de terceros, la responsabilidad sobre la calidad del modelo original recae en `thinkingmachines`, no en el autor de la cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Tsunderee/Inkling-2-Mini-Bonsai-QAT-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Profesor BF16 referenciado: `ggml-org/Inkling-2-Mini-GGUF` (no se proporciona URL directa en la información disponible)
- `llama.cpp`: no se proporciona URL en la información disponible
