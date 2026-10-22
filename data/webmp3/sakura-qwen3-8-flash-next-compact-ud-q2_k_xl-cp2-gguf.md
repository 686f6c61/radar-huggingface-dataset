# webmp3/Sakura-Qwen3.8-Flash-Next-Compact-UD-Q2_K_XL-CP2-GGUF

## Resumen
Sakura Qwen3.8 Flash-Next Compact UD-Q2_K_XL CP2 es un reempaquetado comunitario experimental, publicado por el usuario `webmp3`, del cuantizado GGUF UD-Q2_K_XL de Unsloth para el modelo Qwen3.8-Flash-Next. No es un modelo entrenado desde cero ni un ajuste fino: es una modificación estructural de los ficheros de pesos en la que se conservan los 512 expertos enrutados del modelo original y se sustituye únicamente el tensor `per_layer_token_embd.weight` del shard 2 por una tabla CP2 preexistente del proyecto Sakura. Los shards 1 y 3 se copian sin cambios.

El paquete pesa 59,147 GiB repartidos en tres ficheros y se distribuye junto a un runtime Windows x64 Vulkan propio, que se arranca con `START.cmd` y expone un endpoint en `http://127.0.0.1:18123` con el alias `sakura-flash-next-ud-q2-k-xl-cp2`. El autor advierte de forma explícita de que esta combinación exacta de pesos Unsloth + tabla CP2 no se ha cargado para inferencia ni se ha probado en generación, perplejidad, calidad o velocidad: se trata de una release estructural, no de una validación de calidad ni de hardware.

Su relevancia ahora es, por tanto, acotada y de nicho: sirve como artefacto de experimentación para quienes quieran reproducir o auditar el injerto de la tabla CP2 sobre un backbone MoE de 176,9 mil millones de parámetros cuantizado a 2 bits, no como modelo listo para producción. La licencia de los pesos sigue siendo Qwen Community License 1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 512 expertos enrutados, según la model card; detalles de atención y capas no disponibles |
| Parámetros totales | 176.943.899.520 (≈176,9 mil millones), dato real de safetensors del modelo base |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF UD-Q2_K_XL (Unsloth Dynamic 2-bit) con imatrix, más tabla de embeddings CP2; tres shards |
| Idiomas soportados | alemán (de), inglés (en), chino (zh) |
| Licencia | Qwen Community License 1.0 (etiquetada como `other` / `license_name: qwen-community-1.0` en el Hub) |
| Formato de pesos | GGUF (3 ficheros, 59,147 GiB en total; repositorio de 63,6 GB con runtime) |
| Modelo base | Qwen/Qwen3.8-Flash-Next (revisión `766911a6b7369840a91dbcd95f9f997acaab6cd6` para el GGUF de Unsloth) |
| Runtime incluido | Binarios Windows x64 Vulkan CP2; alias `sakura-flash-next-ud-q2-k-xl-cp2`; endpoint en `http://127.0.0.1:18123` |
| Fecha de creación / actualización | 2026-10-21 / 2026-10-21 |

## Arquitectura y entrenamiento
El backbone es Qwen3.8-Flash-Next, un transformer con mezcla de expertos que, según la model card de este paquete, mantiene 512 expertos enrutados en la versión cuantizada. No se dispone de información sobre el número de parámetros activos por token, el tipo de atención, la longitud de contexto nativa ni la composición del dataset de entrenamiento original. Este repositorio no aporta entrenamiento adicional: es una operación de reempaquetado sobre pesos ya cuantizados.

La modificación concreta es quirúrgica: el shard 2 conserva todos los tensores no tabulares y solo reemplaza `per_layer_token_embd.weight` por la tabla CP2 del paquete Sakura K512 CP2. La cuantización de partida es UD-Q2_K_XL de Unsloth, una cuantización dinámica de 2 bits con imatrix. No hay datos publicados sobre RLHF, DPO u otras fases de alineación en esta release, ni métricas de degradación introducidas por la cuantización a 2 bits.

## Capacidades
- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`), con el endpoint local declarado como compatible con APIs tipo OpenAI (`endpoints_compatible`).
- Enrutamiento mediante 512 expertos, preservados íntegros respecto al GGUF de Unsloth.
- Cobertura multilingüe limitada a alemán, inglés y chino según los metadatos del modelo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking) o capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Estado de validación: ninguna de las capacidades anteriores ha sido verificada por el autor para esta combinación exacta de pesos.

## Casos de uso
- Auditoría de reempaquetados GGUF: inspeccionar cómo se sustituye un único tensor (`per_layer_token_embd.weight`) en un shard intermedio sin alterar el resto, útil para ingenieros que trabajen en pipelines de cuantización y fusión de tablas de embeddings.
- Investigación sobre cuantización extrema: analizar el comportamiento de un MoE de 176,9 mil millones de parámetros comprimido a 2 bits (~2,5 bits por parámetro) y comparar la degradación frente al UD-Q2_K_XL original.
- Reproducibilidad de releases comunitarias: sirve como referencia versionada (revisión de Unsloth fijada) para replicar el experimento CP2 en otros backbones.
- Pruebas de compatibilidad de runtimes Vulkan: el paquete incluye binarios Windows x64 Vulkan, por lo que es un caso de estudio para validar cadenas de arranque con `START.cmd` y endpoints locales en puertos no estándar.
- Experimentación en hardware de memoria unificada: el autor probó el runtime solo con el paquete K512 CP2 sobre AMD Strix Halo (Radeon 8060S, 64 GB UMA), lo que lo convierte en material de laboratorio para estudiar límites de memoria en iGPU.
- Docencia y formación técnica: ejemplo real de los riesgos de publicar artefactos no validados (tamaño en disco frente a memoria en ejecución, ausencia de benchmarks), útil para enseñar buenas prácticas de model cards.
- No se recomienda su uso en producción, atención al cliente ni generación de código en pipelines reales: el autor no ha cargado los pesos para inferencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el paquete «no se ha cargado para inferencia ni probado en generación, perplejidad, calidad o velocidad», y que ninguna cifra de velocidad, encaje en memoria o calidad de los paquetes K512, ISTA Compact o Gyro es aplicable a esta combinación.

## Requisitos de hardware

| Hardware / plataforma | Estado | Expectativa |
|---|---|---|
| AMD Strix Halo, Radeon 8060S, 64 GB UMA, Windows x64 | Runtime probado solo con el paquete K512 CP2 | Mismo runtime suministrado; este paquete de 59,1 GiB no se ha cargado aquí |
| Otras configuraciones Strix Halo | No probado | Hardware similar no constituye validación independiente |
| Otras GPU AMD, NVIDIA o Intel | No probado | No se suministra build CUDA ni perfil por hardware |
| GPU con 24 o 32 GB de VRAM dedicada | Perfil por defecto no validado | El tamaño en disco no es memoria en ejecución; puede requerir offloading no probado |
| CPU-only, Linux, macOS, Windows ARM | Sin binario nativo equivalente | El paquete contiene binarios Windows x64 |

- Huella en disco: 59,147 GiB de pesos en tres shards; repositorio completo de 63,6 GB. Es un límite inferior, no una medida de VRAM en ejecución.
- Estimación aritmética (no validada): al menos ~60 GB de memoria para los pesos, más caché KV y overhead del runtime. Cualquier cifra por debajo de eso exige offloading a RAM y no ha sido probada por el autor.
- GPU consumer: no hay evidencia de que quepa en tarjetas de 24 GB (RTX 4090) ni de 32 GB; el autor lo desmiente explícitamente como suposición.
- Despliegue: solo el runtime incluido (Windows x64 Vulkan, `START.cmd`, puerto 18123). llama.cpp estándar, LM Studio, Ollama y forks no relacionados no están cualificados para esta tabla CP2 personalizada.
- Latencia y throughput: no disponible; no se ha ejecutado ninguna medición.

## Comparativa con modelos similares

| Paquete | Base | Expertos | Tamaño | Runtime probado | Estado de validación |
|---|---|---|---|---|---|
| Este paquete (UD-Q2_K_XL + CP2) | Qwen3.8-Flash-Next | 512 enrutados | 59,147 GiB | No | No cargado para inferencia |
| unsloth/Qwen3.8-Flash-Next-GGUF (UD-Q2_K_XL) | Qwen3.8-Flash-Next | 512 enrutados (según este paquete) | no disponible | No documentado aquí | Backbone de referencia, sin tabla CP2 |
| Sakura K512 CP2 v1 | Qwen3.8-Flash-Next | no disponible | ~47,6 GiB (según nombre del repo) | Sí, en Strix Halo 64 GB UMA | Runtime validado solo en ese hardware |
| Otros modelos MoE de escala similar | — | — | — | — | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificables de modelos externos comparables (contexto, parámetros activos, licencia) en la información proporcionada, por lo que no se establece comparación de rendimiento.

## Limitaciones y advertencias
- Artefacto no validado: el autor declara que esta combinación exacta de pesos no se ha cargado ni probado en generación, perplejidad, calidad o velocidad.
- Cuantización de 2 bits sobre un MoE de 176,9 mil millones de parámetros: cabe esperar degradación de calidad frente al modelo en precisión completa, aunque no se han publicado mediciones que la cuantifiquen.
- Riesgo de alucinación: sin evaluar en este paquete; no hay datos de evaluación de fidelidad.
- El tamaño en disco (59,147 GiB) no garantiza que quepa en 32 GB ni en 24 GB de VRAM; el autor lo señala de forma explícita.
- Compatibilidad de despliegue restringida: solo el runtime Windows x64 Vulkan incluido; llama.cpp estándar, Ollama, LM Studio y forks no están cualificados para la tabla CP2 personalizada.
- Plataforma: sin binarios para Linux, macOS, Windows ARM ni build CUDA; el soporte Vulkan en el driver no implica compatibilidad.
- Idiomas: solo alemán, inglés y chino en los metadatos; el castellano no figura como idioma soportado.
- Sesgos conocidos: no documentados en la información disponible; los sesgos del backbone Qwen3.8-Flash-Next no se detallan en esta model card.
- Licencia: los pesos conservan Qwen Community License 1.0, con términos propios que deben revisarse antes de cualquier uso comercial; el campo `license` del Hub aparece como `other`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin histórico de uso que permita inferir estabilidad.
- Trazabilidad de la tabla CP2: procede de otro paquete del mismo autor y no se documenta su proceso de generación ni su evaluación.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-UD-Q2_K_XL-CP2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Backbone cuantizado (Unsloth GGUF): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Paquete Sakura K512 CP2 (origen de la tabla CP2 y del runtime): https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-47.6GiB-K512-CP2-v1-GGUF
- README en chino: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-UD-Q2_K_XL-CP2-GGUF/blob/main/README_zh.md
- Licencia (referenciada como `LICENSE` en el repositorio): https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-UD-Q2_K_XL-CP2-GGUF/blob/main/LICENSE
- Endpoint local del runtime: http://127.0.0.1:18123
- Resultados de búsqueda web: ninguna fuente relevante sobre este modelo; las entradas devueltas no guardan relación con el artefacto.
