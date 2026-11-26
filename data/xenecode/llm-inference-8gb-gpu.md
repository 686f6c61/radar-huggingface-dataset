# xenecode/llm-inference-8gb-gpu

## Resumen

Inkling 2 Mini 2-bit GGUF es una cuantización de precisión mixta del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario `xenecode`. El objetivo declarado es ejecutar un modelo de mezcla de expertos (MoE) con 26.070.390.272 parámetros totales en una GPU de 8 GB de VRAM, algo que el fichero original de Unsloth (`UD-IQ2_XXS`) no consigue con holgura. Para ello se modifican dos grupos de tensores: las 85 tensores de atención pasan de `Q8_0` a `Q6_K`, y los 144 tensores de bucle ("loop tensors") pasan de 32 a 16 bits, ahorrando unos 140 MB.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización selectiva orientada a hardware de consumo (RTX 4060 8 GB), con datos de rendimiento medidos: 43,7 tokens/s en escritura y 734 tokens/s en lectura de prompt con contexto de 64K. Por otro lado, sirve como ejemplo de despliegue híbrido GPU/CPU mediante el fork de llama.cpp de Unsloth, usando el *expert cache* y el *offload* selectivo de expertos a RAM.

La calidad se mantiene prácticamente idéntica al fichero original según el autor: perplejidad 7,8825 frente a 7,8846 (16 chunks, contexto 512). El repositorio ocupa 8,3 GB y la licencia es Apache 2.0. No hay información publicada sobre idiomas soportados, benchmarks estándar ni detalles del entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, con tensores de atención y tensores de bucle; cuantización GGUF para llama.cpp |
| Parametros totales | 26.070.390.272 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (64K), según la configuración de ejemplo del autor |
| Tipos de cuantizacion | GGUF `UD-IQ2_XXS` con atención en `Q6_K` y tensores de bucle en 16 bits; caché KV en `q4_0` en la receta de ejemplo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Inkling-2-Mini-UD-IQ2_XXS-q6att-loopf16.gguf`) |

## Arquitectura y entrenamiento

El modelo base es `thinkingmachines/Inkling-2-Mini`, descrito en la model card como un modelo de mezcla de expertos. La model card del quantizado no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible en la documentación proporcionada. La arquitectura concreta (número de expertos, ratio de activación, tipo de atención) tampoco se detalla más allá de la mención a "loop tensors" y "attention tensors".

La innovación técnica de esta publicación no está en el modelo sino en la cuantización. Partiendo del fichero `UD-IQ2_XXS` de Unsloth, el autor aplica dos cambios: bajada de precisión de las 85 tensores de atención a `Q6_K` y de los 144 tensores de bucle a 16 bits. El ahorro de ~140 MB se reinvierte en la caché de expertos de llama.cpp (`--moe-cache-mib 1408`), lo que acelera la inferencia. La receta de ejecución usa `--fit off`, offload selectivo con `-ot` para mantener los expertos de las capas 0-5 y 18-23 en RAM (las capas 6-17 se ejecutan tres veces por token y sus expertos van a la GPU), atención *flash* (`-fa on`), `-ub 1024` y `--moe-cache-cpu-share 0.95`.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio y el pipeline de chat de llama.cpp indican uso orientado a diálogo.
- Razonamiento y generación de texto general, heredados del modelo base `Inkling-2-Mini` (no se detallan capacidades específicas en la documentación disponible).
- Ejecución en hardware de consumo: el modelo está empaquetado y tuneado para GPUs de 8 GB de VRAM.
- Soporte de contexto largo: hasta 64K tokens según la configuración de ejemplo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con servicios de inferencia tipo API.
- Capacidades de tool calling, agentes, visión, audio o modo *thinking*: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en GPU de consumo: con 7,07 GB de VRAM ocupados en una RTX 4060 8 GB, el modelo permite desplegar un chatbot privado en un equipo de escritorio sin depender de la nube, manteniendo conversaciones multi-turno gracias a los 64K tokens de contexto.
- Prototipado y evaluación de modelos MoE en hardware limitado: investigadores sin acceso a A100/H100 pueden probar un MoE de 26B parámetros totales usando el *expert cache* y el offload selectivo a RAM, midiendo latencia y calidad antes de escalar a infraestructura mayor.
- Generación de texto en lote con requisitos de privacidad: al ejecutarse íntegramente en local, es adecuado para procesar documentos sensibles (informes internos, datos de clientes) sin enviarlos a APIs externas.
- Desarrollo de aplicaciones de escritorio con IA integrada: la compatibilidad con `llama-server` y endpoints permite embeber el modelo en herramientas ofimáticas o IDE locales con una latencia de ~43,7 tokens/s en escritura.
- Experimentación con cuantización selectiva: el repositorio sirve como referencia reproducible para estudiar el impacto de bajar tensores de atención a `Q6_K` y de bucle a 16 bits en perplejidad y velocidad.
- Educación y demos técnicas: la receta de ejecución documentada (parámetros `-ot`, `--moe-cache-mib`, `--moe-cache-cpu-share`) es un ejemplo didáctico de despliegue híbrido GPU/CPU con llama.cpp.
- Evaluación comparativa de cuantizaciones: permite contrastar el fichero original de Unsloth con esta variante en términos de perplejidad (7,8846 vs 7,8825) y throughput (20,4 vs 43,7 tokens/s).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad (16 chunks, contexto 512) | 7,8825 |
| Perplejidad del fichero original Unsloth | 7,8846 |
| Velocidad de escritura (RTX 4060 8 GB, Ryzen 5 5600X, 16 GB RAM, Windows 11, 64K contexto) | 43,7 tokens/s |
| Velocidad de escritura con el fichero original | 20,4 tokens/s |
| Velocidad de lectura de prompt | 734 tokens/s |
| VRAM ocupada en GPU | 7,07 GB (sin spill a memoria compartida) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 7,07 GB en la configuración medida (RTX 4060 8 GB), con contexto de 64K, caché KV en `q4_0` y caché de expertos de 1408 MiB.
- GPU recomendadas: RTX 4060 8 GB (medida por el autor); cualquier GPU con al menos 8 GB de VRAM y soporte de llama.cpp debería poder ejecutar la receta, aunque no se han publicado mediciones en otras tarjetas.
- RAM del sistema: 16 GB en el equipo de prueba; la receta mantiene los expertos de las capas 0-5 y 18-23 en RAM, por lo que se necesita memoria del sistema suficiente para alojarlos.
- Cabe en GPU de consumo: sí, en GPUs de 8 GB como la RTX 4060, con offload parcial de expertos a CPU.
- Opciones de despliegue: llama.cpp (fork de Unsloth, build `b12722` o superior) mediante `llama-server`; la etiqueta `endpoints_compatible` sugiere compatibilidad con servidores de endpoints. No se mencionan vLLM, TGI u Ollama.
- Latencia y throughput: 43,7 tokens/s en escritura y 734 tokens/s en lectura de prompt en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| xenecode/llm-inference-8gb-gpu (esta ficha) | 26.070.390.272 | 64K | GGUF `UD-IQ2_XXS` con atención `Q6_K` | Apache 2.0 | Perplejidad 7,8825; 43,7 tok/s en RTX 4060 |
| Unsloth `UD-IQ2_XXS` de Inkling-2-Mini (original) | 26.070.390.272 | 64K (configurable) | GGUF `UD-IQ2_XXS` | Apache 2.0 (heredada) | Perplejidad 7,8846; 20,4 tok/s en el mismo hardware |
| thinkingmachines/Inkling-2-Mini (base) | 26.070.390.272 | no disponible | safetensors | Apache 2.0 | Pesos sin cuantizar; requiere hardware muy superior a 8 GB |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser una cuantización del modelo base, hereda los sesgos de este, que no se documentan.
- Riesgo de alucinación: no cuantificado; la perplejidad de 7,8825 es prácticamente idéntica a la del fichero original, por lo que la cuantización no debería incrementar significativamente el riesgo, pero no hay evaluaciones de fidelidad factual.
- Limitaciones de contexto o idioma: el contexto máximo documentado es de 64K tokens; los idiomas soportados no están disponibles. La cuantización a 2 bits puede degradar tareas sensibles a precisión numérica o de código.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `thinkingmachines/Inkling-2-Mini` y de los pesos originales de Unsloth antes de redistribuir.
- Requiere un fork específico de llama.cpp (build `b12722` o superior de Unsloth) y parámetros de ejecución concretos; la receta no es portable a otras herramientas sin adaptación.
- El rendimiento medido corresponde a un único equipo (RTX 4060, Ryzen 5 5600X, Windows 11); en otras configuraciones la velocidad y el uso de VRAM pueden variar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- La cuantización a 2 bits (`IQ2_XXS`) es agresiva; para tareas de razonamiento complejo o generación de código en producción conviene evaluar la calidad frente al modelo sin cuantizar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xenecode/llm-inference-8gb-gpu
- Repositorio GitHub con la metodología: https://github.com/xenecodd/llm-inference-8gb-gpu
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Fork de llama.cpp de Unsloth (referenciado en la model card, sin URL directa en la información disponible)
