# Synchopate/DeepSeek-V4-Flash-0731-Fractal-64GB-CPU-GGUF

## Resumen

DeepSeek-V4-Flash-0731-Fractal-64GB-CPU-GGUF es una cuantización GGUF del modelo DeepSeek-V4-Flash-0731 (284.330 millones de parámetros totales, 13.170 millones activos) publicada por el usuario Synchopate bajo licencia MIT. El objetivo es permitir la inferencia en CPU de un modelo de mezcla de expertos (MoE) de gran tamaño dentro de un presupuesto de memoria de 64 GB, algo que las cuantizaciones convencionales como `UD-IQ1_S` (76,87 GiB) no consiguen sin recurrir a swap en SSD. El checkpoint ocupa 56,57 GiB en tres shards.

La innovación principal es el esquema de cuantización propietario `Fractal-64` (30 bytes por cada 64 pesos), que reutiliza in situ el identificador de tipo `GGML_TYPE_Q2_0 = 42` de `llama.cpp`. Esto implica una dependencia estricta de un runtime parcheado: no funciona en Ollama, LM Studio, vLLM ni `llama.cpp` sin modificar. El autor distribuye binarios portables de `llama-modchip` v2.5.4 para Linux x86_64 (AVX-512 y AVX2) y declara compatibilidad con Windows 11 y Apple Silicon Metal.

Se trata, además, de un checkpoint marcado como legacy: el propio autor lo considera superado por su línea `MaxQ v3.0`, que emplea únicamente tipos de tensor estándar de `ggml` y funciona en `llama.cpp` upstream. Por tanto, su interés actual es fundamentalmente de reproducibilidad de benchmarks y de experimentación con el formato `Fractal-64`, no como opción recomendada para nuevos despliegues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA (Multi-head Latent Attention) y Sinkhorn-20; arquitectura identificada como `deepseek4` en el runtime |
| Parametros totales | 284.334.567.511 (284,33B) |
| Parametros activos | 13,17B (Top-6 enrutados de 256 expertos + 1 compartido por capa, sin podar) |
| Longitud de contexto | Hasta 1M tokens verificado en Windows 11 (según el autor); no se detalla el contexto nativo del modelo base |
| Tipos de cuantizacion | `Fractal-64` (30 bytes / 64 pesos, ID de tipo 42 reutilizado); tensores densos en `Q6_K`; variantes hermanas: `LUT-VQ3-64`, `MaxQ-Fractal`, `UD-IQ1_S` |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 60.739.343.104 bytes = 56,57 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 43 capas, 256 expertos enrutados más uno compartido por capa y enrutamiento Top-6 activo sin podar, lo que resulta en 13,17B parámetros activos sobre 284,33B totales. Emplea Multi-head Latent Attention (MLA) y un mecanismo denominado Sinkhorn-20, según la información del runtime parcheado (`deepseek4`). No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esa información pertenece a la model card del modelo base y no se incluye en la información proporcionada.

La contribución técnica de esta ficha es exclusivamente la cuantización. `Fractal-64` codifica 64 pesos en 30 bytes, lo que reduce el checkpoint a 56,57 GiB y permite mantener un `VmRSS` de 58,20 GiB con `-c 32768 -ub 512`, dejando unos 4,3 GiB de margen en sistemas de 64 GB. El autor reporta una divergencia de logits (KLD) frente a su referencia `MaxQ v2.5.3` de 0,8437 nats en 32 sondas (0,4373 nats en el subconjunto emparejado), con 74,3% de coincidencia en Top-1 y 94,1% en Top-5. Los tensores densos (174 en total) se mantienen en `Q6_K`. No se documenta decodificación especulativa en este checkpoint concreto, aunque el autor menciona `NextN` MTP en su línea sucesora.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredadas del modelo base DeepSeek-V4-Flash-0731.
- Generación de código: el autor etiqueta el modelo con `claude-code`, lo que sugiere uso previsto en asistentes de programación por terminal.
- Soporte de tool calling y function calling, evaluado en el "80-Point Functional Gate" del autor con 24/80 puntos en la categoría de herramientas.
- Razonamiento multi-paso y uso como agente, con una puntuación de 20/80 en la categoría de código y 20/80 en la prueba de needle (recuperación en contexto largo).
- Contexto largo: verificado hasta 1M tokens en Windows 11 según el autor, lo que habilita tareas de recuperación sobre documentos extensos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Inferencia en CPU pura, sin GPU, sobre Linux x86_64 (AVX-512 y AVX2), Windows 11 y Apple Silicon Metal.
- No se documentan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistente de código en terminal: el modelo está etiquetado para `claude-code` y puede integrarse en flujos de trabajo de programación asistida sobre estaciones de trabajo sin GPU, aprovechando los 13,17B parámetros activos para mantener un decode de 9,06 tok/s en CPU.
- Procesamiento de documentos largos en servidores sin acelerador: con contexto verificado de hasta 1M tokens y prefill en caliente de 44,36 tok/s, es viable para resumir o extraer información de expedientes extensos en máquinas de 64 GB de RAM.
- Reproducción de benchmarks de cuantización: al conservar el autor todos los hashes de commit históricos, sirve para replicar las mediciones de KLD y perplejidad (`WikiText-2` 11,5288 ± 0,5563) frente a otras variantes.
- Experimentación con formatos GGUF no estándar: útil para investigadores que estudien esquemas de cuantización alternativos como `Fractal-64` o `LUT-VQ3-64` y su impacto en la calidad.
- Despliegue en Apple Silicon de gama alta: el autor reporta 169,4 tok/s de prefill y 27,0 tok/s de decode en un M5 Max de 64 GB con memoria unificada, adecuado para prototipos locales de agentes conversacionales.
- Evaluación de agentes con tool calling en entornos aislados: permite medir el comportamiento del modelo en tareas de herramientas (24/80 en el gate funcional del autor) antes de migrar a la variante `MaxQ v3.0`.
- Investigación sobre alineación y comportamiento: existe una variante "Abliterated" publicada por el mismo autor, lo que facilita estudios comparativos, aunque esta ficha concreta corresponde al checkpoint estándar.

## Benchmarks y rendimiento

| Metrica | Fractal-64 (56,57 GiB) | MaxQ-Fractal (56,93 GiB, referencia) | UD-IQ1_S (76,87 GiB) |
|---|---|---|---|
| Perplejidad `WikiText-2` (8.192 tok) | 11,5288 ± 0,5563 | 11,6139 ± 0,5845 | No disponible |
| Perplejidad `wiki-alt.txt` (ctx 5632, 51c / 12c) | No disponible (remite a MaxQ-Fractal) | 7,2977 ± 0,0504 / 7,3180 ± 0,1039 | 5,9734 (51c) |
| KLD vs. referencia (32 sondas) | 0,8437 / 0,4373 nats | 0,0000 nats (referencia) | No disponible |
| Coincidencia Top-1 / Top-5 | 74,3% / 94,1% | Referencia | No disponible |
| Gate funcional de 80 puntos (herramientas/código/needle) | 64,0 / 80,0 (24/20/20) | 70,0 / 80,0 (30/20/20) | No disponible |
| Prefill en frío (CPU) | 37,79 – 43,98 tok/s | 36,11 – 37,56 tok/s | 24,73 – 25,19 tok/s |
| Prefill con reutilización de prefijo | 44,36 tok/s | No disponible | 25,12 tok/s |
| Decode puro (N=1, Top-6) | 9,06 tok/s | 8,66 tok/s | 5,91 tok/s |
| Decode servido (Stockfish-PVS) | 9,55 tok/s (75,8% precisión); ráfagas 11,5 – 21,2 tok/s | 8,80 tok/s (78,7%); 11,2 – 21,0 tok/s | No disponible |
| Windows 11, contexto 1M (Ryzen 7 9800X3D, 8C) | 21,3 – 22,6 tok/s pp512 / 6,35 – 8,04 tok/s tg128 | Compatible | OOM |
| Apple M5 Max 64 GB | 169,4 tok/s pp512 / 27,0 tok/s tg128 | Compatible | OOM |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son mediciones del autor sobre el propio checkpoint.

## Requisitos de hardware

- RAM: 58,20 GiB de `VmRSS` medidos con `-c 32768 -ub 512`, sobre un total de archivo de 56,57 GiB. Se recomienda un sistema con 64 GB de RAM y margen para el sistema operativo (unos 4,3 GiB según el autor).
- GPU: no se requiere GPU; el checkpoint está diseñado para inferencia en CPU. Funciona también en Apple Silicon con memoria unificada (probado en M5 Max de 64 GB).
- CPU: x86_64 con AVX-512 (Zen 4/5, Ice Lake o superior) o AVX2 (Haswell, Skylake, Zen 2/3, Alder Lake, Raptor Lake). Los binarios AVX2 no emiten instrucciones `%zmm` ni `AVX512_BF16`. Requiere OpenMP (`libgomp1`).
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en configuraciones de 32 GB; el tamaño del checkpoint excede cualquier VRAM consumer actual.
- Despliegue: exclusivamente mediante los binarios `llama-modchip` v2.5.4 incluidos en el repositorio o mediante `./modchip setup` del repositorio `synchopate/llama-modchip`. No es compatible con Ollama, LM Studio, vLLM ni `llama.cpp` upstream sin parchear.
- Throughput de referencia: 9,06 tok/s de decode puro y 37,79–43,98 tok/s de prefill en frío en CPU x86_64; 27,0 tok/s de decode en M5 Max.
- Latencia en contexto de 1M tokens: 21,3–22,6 tok/s de prefill (pp512) en Ryzen 7 9800X3D con 8 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Runtime |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-Fractal-64 (este) | 284,33B totales / 13,17B activos | Hasta 1M verificado | 56,57 GiB | MIT | `llama-modchip` v2.5.4 (parcheado) |
| DeepSeek-V4-Flash-0731-MaxQ-v4-64GB | 284,33B totales / 13,17B activos | No disponible | ~64 GB (objetivo) | MIT | `llama-modchip` v3.0 y `llama.cpp` upstream |
| DeepSeek-V4-Flash-0731-MaxQ-Fractal-64GB | 284,33B totales / 13,17B activos | No disponible | 56,93 GiB | MIT | `llama-modchip` v2.5.x |
| DeepSeek-V4-Flash-0731-VQ3-64GB | 284,33B totales / 13,17B activos | No disponible | 56,40 GiB | MIT | `llama-modchip` v2.5.x |
| Qwen3.8-Flash-Next-MaxQ-64GB | No disponible | No disponible | ~64 GB (objetivo) | No disponible | `llama-modchip` v3.0 |

La comparación relevante es interna a la familia de cuantizaciones del mismo autor: `MaxQ v3.0` es la opción recomendada para nuevos despliegues por usar tipos estándar de `ggml`, mientras que este checkpoint `Fractal-64` conserva interés por su menor tamaño y por la reproducibilidad de sus mediciones.

## Limitaciones y advertencias

- Checkpoint legacy: el propio autor lo declara superado por `MaxQ v3.0` para despliegues nuevos de 64 GB.
- Requiere un runtime parcheado específico (`llama-modchip` v2.5.4). Cargarlo en `llama.cpp` sin modificar provoca errores de límites de tensor o `unknown model architecture: 'deepseek4'`.
- No es compatible con Ollama, LM Studio, vLLM ni TGI, lo que limita su integración en infraestructura estándar.
- La cuantización introduce degradación medible: KLD de 0,8437 nats frente a la referencia y caída del gate funcional de 70 a 64 puntos sobre 80, con especial pérdida en tool calling (de 30 a 24).
- El modelo base es un MoE de 284B parámetros: existe riesgo de alucinación inherente al modelo, no cuantificado en la información disponible.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe homogéneo.
- Licencia MIT permite uso comercial, pero la dependencia de binarios de terceros y de un formato de tensor no estándar añade riesgo operativo y de mantenimiento a largo plazo.
- La variante "Abliterated" del mismo autor elimina restricciones de seguridad; no debe confundirse con este checkpoint en entornos de producción.
- Los binarios distribuidos requieren `GLIBC_2.30` y OpenMP; no se garantiza su funcionamiento en distribuciones antiguas.
- El contexto de 1M tokens solo está verificado en Windows 11 según el autor; no hay validación independiente publicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-Fractal-64GB-CPU-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Variante MaxQ-Fractal (referencia de calidad): https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-MaxQ-Fractal-64GB-CPU-GGUF
- Variante LUT-VQ3-64: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-VQ3-64GB-CPU-GGUF
- Variante Abliterated: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-Abliterated-Fractal-64GB-CPU-GGUF
- Sucesor MaxQ v4 para DeepSeek-V4-Flash: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-MaxQ-v4-64GB-CPU-GGUF
- Sucesor Qwen3.8-Flash-Next-MaxQ-64GB: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF
- Motor y CLI `llama-modchip`: https://github.com/synchopate/llama-modchip
