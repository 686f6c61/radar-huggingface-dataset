# Xylolabs/Phi-4-mini-instruct-Tensix-BFP4-MLP

## Resumen

Phi-4-mini-instruct-Tensix-BFP4-MLP es una exportación cuantizada del modelo microsoft/Phi-4-mini-instruct, empaquetada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix mediante la pila TT-Metal y TT-NN. No se trata de un modelo nuevo: es un checkpoint derivado que reescribe las matrices del transformer original en formatos de coma flotante por bloques (block floating point, BFP), con las proyecciones MLP en BFP4 y las de atención en BFP8, manteniendo embeddings, cabeza de salida y normalizaciones en BF16.

El modelo resuelve un problema de despliegue: permitir que un LLM de 3,8 mil millones de parámetros únicos corra en hardware Tensix con un consumo de memoria de pesos de aproximadamente 4,67 GB, frente a los 8,90 GB que ocupa el archivo safetensors en disco (los valores cuantizados se almacenan como BF16 sobre su rejilla BFP). La conversión preserva la disposición compatible con Llama, las dos listas de factores LongRoPE originales y los 96 dimensiones rotatorias dentro de una representación de 128 dimensiones.

Es relevante ahora porque los formatos BFP nativos de TT-NN (bfloat4_b y bfloat8_b) son el mecanismo estándar para aprovechar el ancho de banda de memoria de los chips Tenstorrent, y este checkpoint es una de las primeras exportaciones públicas de un modelo Phi-4-mini verificadas contra el simulador Blackhole con TT-NN 0.81.1. La licencia MIT del modelo base se mantiene.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-4-mini), convertido a disposición compatible con Llama |
| Parámetros totales | 4.450.618.368 en safetensors; 3.836B parámetros únicos (cabeza y embedding están atados y duplicados) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en generación con caché; LongRoPE dual preservado en config.json |
| Tipos de cuantización | BFP4 (GPTQ plano, damp 0.1) en MLP gate/up/down; BFP8 (redondeo al más cercano) en atención q/k/v/o; BF16 en embedding, cabeza y normas |
| Idiomas soportados | en (inglés; la evaluación KL incluye referencias en inglés y coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors (valores cuantizados almacenados como BF16 sobre rejilla BFP); 291 entradas de tensor explícitas |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Phi-4-mini-instruct de Microsoft: un transformer decoder-only denso con atención multi-cabeza, 96 dimensiones rotatorias y mecanismo LongRoPE con factores cortos y largos distintos. La exportación de Xylolabs no reentrena el modelo; aplica GPTQ a las matrices MLP con damping 0.1 y cuantiza la atención a BFP8 mediante redondeo al más cercano. La conversión pliega el factor de atención original en las matrices Q y K, y reexpresa las 96 dimensiones rotatorias más las coordenadas pasadas a través en una representación completa de 128 dimensiones compatible con Llama.

Los 224 matrices de proyección se empaquetan en la rejilla nativa de TT-NN y se verifican contra el simulador Blackhole con TT-NN 0.81.1. El checkpoint incluye un adaptador obligatorio de reconstrucción de prefijo (`phi3_longrope_generation.install_prefix_rebuild`) que se activa cuando la generación cruza por primera vez el límite de 4.096 tokens; sin él, la generación con caché larga produce resultados incorrectos. No se dispone de información sobre los datos de entrenamiento originales, el número de tokens ni las etapas de RLHF o DPO, ya que corresponden al modelo base y no se detallan en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Phi-4-mini-instruct.
- Razonamiento y matemáticas de nivel medio, limitado por el tamaño del modelo base (3,8B parámetros únicos).
- Generación de código, sujeta a las capacidades del modelo original.
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizador.
- Ejecución en aceleradores Tenstorrent Tensix con empaquetado nativo BFP4 y BFP8.
- Verificación de integridad de pesos mediante `pack_tensix.py` y `verify_grid.py`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en esta exportación.
- Capacidades multilingües limitadas al inglés según el campo `language` del repositorio.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint está diseñado para ejecutarse sobre chips Tensix con TT-NN, aprovechando el empaquetado nativo BFP4/BFP8 para reducir el ancho de banda de memoria frente a BF16.
- Evaluación de cuantización BFP en producción: sirve para medir la degradación real (KL de 0,0503 frente a BF16) antes de adoptar BFP4 en pipelines propios sobre TT-Metal.
- Prototipado de asistentes conversacionales en inglés: con 4.096 tokens de contexto y plantilla de chat, cubre diálogos multi-turno de longitud moderada en dispositivos Tensix.
- Investigación en formatos block floating point: el repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) útiles para validar que el empaquetado no altera valores.
- Generación de texto en entornos con restricciones de memoria: los 4,67 GB de pesos permiten caber en aceleradores con DRAM limitada, dejando espacio para caché KV y buffers.
- Base para experimentos de decodificación larga: el adaptador de reconstrucción de prefijo permite probar generación con caché más allá de 4.096 tokens y comparar con el modelo original.
- Comparación de calidad entre BFP4 y Q4_K_M: la evaluación KL incluida (0,0503 frente a 0,0670 de Q4_K_M) facilita decisiones de formato en despliegues GGUF frente a Tensix.

## Benchmarks y rendimiento

| Modelo o referencia | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Respuestas distintas perdidas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 24 | 0 | — |
| Esta exportación | 0,0502733368136 | 29 | 0 | 0 |
| Q4_K_M equivalente | 0,067000 | 26 | 0 | 0 |

La evaluación KL cubre 16.312 posiciones sobre la misma referencia de 16 secuencias en inglés y coreano (raw y chat). El modelo pasa la puerta relativa del host: 0,750348 veces el KL de Q4_K_M y ninguna respuesta correcta adicional perdida. Los siete elementos de tipo thinking no aportan evidencia elegible correcta en BF16. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 4,67 GB solo para los pesos del modelo de lenguaje, más espacio para caché KV y buffers.
- Almacenamiento en disco: 8,90 GB para los archivos safetensors (valores cuantizados almacenados como BF16).
- GPU: no aplica de forma nativa; el checkpoint está orientado a aceleradores Tenstorrent Tensix. La ejecución en GPU requiere Transformers 5.23.0 con `dtype="bfloat16"` y `device_map="auto"`, pero no se documenta rendimiento en GPU.
- Cabe en GPU de consumo: no disponible; no se han publicado mediciones en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: TT-NN (versión verificada 0.81.1) sobre Tensix y simulador Blackhole; Transformers 5.23.0 con el adaptador `phi3_longrope_generation`. tt-transformers y tt-forge no se han probado con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-mini-instruct-Tensix-BFP4-MLP (este) | 3,836B únicos (4,45B en safetensors) | 4.096 tokens con caché | BFP4 MLP / BFP8 atención | MIT | Hugging Face, 0 descargas |
| microsoft/Phi-4-mini-instruct (BF16) | 3,8B | 4.096 tokens | BF16 | MIT | Hugging Face |
| Q4_K_M equivalente (referencia de evaluación) | 3,8B | no disponible | GGUF Q4_K_M | MIT (derivada) | No se especifica repositorio |

El modelo base BF16 sirve como referencia de calidad (KL 0) y el Q4_K_M como referencia de cuantización de baja precisión (KL 0,0670). Este export mejora el KL de Q4_K_M en un 25 % aproximadamente y recupera 3 respuestas correctas adicionales sobre 33. No se dispone de comparación con otros modelos de tamaño similar como Llama-3.2-3B o Qwen2.5-3B en la información proporcionada.

## Limitaciones y advertencias

- El adaptador `install_prefix_rebuild` es obligatorio para generación con caché más allá de 4.096 tokens; sin él, los resultados son incorrectos.
- La cuantización BFP4 en MLP introduce una degradación medible (KL 0,0503) respecto a BF16; no es apta para tareas que exijan paridad exacta con el original.
- Los siete elementos de evaluación tipo thinking no tienen evidencia correcta en BF16, por lo que no se puede validar el comportamiento en modo razonamiento.
- Idiomas soportados limitados al inglés según el repositorio; la evaluación KL incluye coreano pero no se declara soporte oficial.
- No se documenta soporte de tool calling, agentes, visión ni audio; no asumir estas capacidades del modelo base sin verificación.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación por terceros.
- tt-transformers y tt-forge no se han probado con este checkpoint; solo TT-NN 0.81.1 y el simulador Blackhole están verificados.
- La licencia MIT del modelo base se mantiene, pero conviene revisar los términos de las herramientas de Xylolabs (`tensix-bfp-gptq`) para uso comercial.
- Riesgo de alucinación inherente al modelo base Phi-4-mini, no mitigado por la cuantización.
- El tamaño en disco (8,90 GB) duplica aproximadamente el de los pesos efectivos (4,67 GB), lo que afecta a la distribución y al almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Phi-4-mini-instruct-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Phi-4-mini-instruct-Tensix-BFP4-MLP/blob/main/LICENSE
