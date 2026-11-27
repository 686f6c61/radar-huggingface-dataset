# Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix

## Resumen

Phi-4-mini-reasoning-Tenstorrent-Tensix es una cuantización del modelo microsoft/Phi-4-mini-reasoning realizada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole, núcleos Tensix). No se trata de un modelo nuevo, sino de una redistribución de pesos optimizada para el stack tt-metal/ttnn/tt-forge de Tenstorrent, usando cuantización en bloque de coma flotante (block floating point, BFP) en lugar de los formatos habituales de llama.cpp o GPTQ convencionales.

El interés de esta ficha radica en que permite desplegar un modelo de razonamiento compacto (Phi-4-mini-reasoning, de la familia Phi-4 de Microsoft) en hardware no-GPU, concretamente en tarjetas Tenstorrent, con una reducción de tamaño de 7,67 GB en BF16 a 3,444 GB en el formato `bfp4/`. La cuantización aplica bfloat4_b a las capas MLP y bfloat8_b a la atención, manteniendo el resto en bf16, con una divergencia KL media de 1,162884 frente a BF16 sobre 16.192 posiciones de texto en inglés y coreano.

Es relevante para desarrolladores que trabajan con hardware de inferencia alternativo a NVIDIA/AMD y necesitan un modelo de razonamiento pequeño, con licencia MIT y pesos en safetensors, que pueda integrarse en el ecosistema Tenstorrent sin reentrenamiento. La información pública disponible sobre el modelo base (arquitectura, datos de entrenamiento, benchmarks) no se detalla en la model card de esta cuantización, por lo que varios apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Phi-4-mini-reasoning de Microsoft); cuantización block floating point para Tensix |
| Parametros totales | no disponible (el modelo base es Phi-4-mini-reasoning; el dato exacto no figura en la informacion proporcionada) |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat4_b (MLP), bfloat8_b (atención), bf16 (resto); empaquetado BFP para ttnn |
| Idiomas soportados | en (inglés declarado; la evaluación KL incluye texto coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors (carpeta `bfp4/`), con `quant4.json`, `model.safetensors.index.json`, `pack_tensix.py` y `verify_grid.py` |

## Arquitectura y entrenamiento

El modelo subyacente es microsoft/Phi-4-mini-reasoning, un transformer de la familia Phi-4 orientado a razonamiento. Esta publicación no reentrena ni modifica la arquitectura: aplica una cuantización post-entrenamiento con un esquema de block floating point (BFP) diseñado para los núcleos Tensix de Tenstorrent. Concretamente, las capas MLP se cuantizan a bfloat4_b (4 bits en bloque), las capas de atención a bfloat8_b (8 bits en bloque) y el resto de pesos permanece en bf16. El resultado se empaqueta en tensores TILE_LAYOUT para ttnn y se verifica mediante un round-trip a torch.

La model card reporta una evaluación de divergencia KL sobre 16.192 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), tanto en texto plano como aplicando la plantilla de chat, con un límite de KL media fijado en 1,5 veces la referencia Q4_K_M de llama.cpp. El valor obtenido es 1,162884, frente a 1,147011 de Q4_K_M, lo que sitúa la cuantización BFP4 ligeramente por encima de la referencia de 4 bits de llama.cpp en términos de fidelidad. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones como decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento: al heredar Phi-4-mini-reasoning, está orientado a tareas de razonamiento multi-paso y resolución de problemas.
- Generación de código y matemáticas: capacidades propias del modelo base, no verificadas de forma independiente en esta cuantización.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el tag de idioma declara únicamente `en`; la evaluación KL incluye coreano, pero no se garantiza soporte funcional más allá del inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.
- Ejecución en NPU Tenstorrent: empaquetado nativo para ttnn con dtypes bfloat4_b y bfloat8_b, verificación de round-trip y scripts de empaquetado incluidos.

## Casos de uso

- Inferencia en hardware Tenstorrent: despliegue del modelo en tarjetas Wormhole o Blackhole usando tt-metal/ttnn, aprovechando el empaquetado BFP4 para reducir la huella de memoria a 3,444 GB y liberar DRAM para otros procesos.
- Razonamiento en el borde (edge) con aceleradores no-GPU: escenarios donde no hay GPU NVIDIA/AMD disponibles pero sí NPU Tenstorrent, por ejemplo en estaciones de trabajo de investigación o laboratorios con hardware alternativo.
- Prototipado de pipelines de razonamiento: uso del modelo para cadenas de razonamiento cortas en inglés, con la plantilla de chat aplicada mediante `apply_chat_template`, adecuado para pruebas de concepto de asistentes técnicos.
- Evaluación comparativa de cuantizaciones: la métrica KL publicada permite comparar la fidelidad de BFP4 frente a Q4_K_M y BF16 en el mismo hardware, útil para decidir el formato en producción.
- Sustitución de llama.cpp en entornos Tenstorrent: cuando se requiere un modelo de 4 bits pero el stack objetivo es ttnn en lugar de GGUF, esta carpeta `bfp4/` evita conversiones adicionales.
- Docencia y experimentación con block floating point: los scripts `pack_tensix.py` y `verify_grid.py` permiten reproducir el empaquetado y verificar la integridad de los pesos en ttnn, útil para formación en formatos de cuantización.
- Integración en pipelines de CI que validan pesos: el round-trip a torch incluido en la model card sirve como test de regresión para asegurar que los tensores empaquetados coinciden con los originales.

## Benchmarks y rendimiento

| Metrica | bfp4/ | BF16 (base) | Q4_K_M (llama.cpp) |
|---|---|---|---|
| Tamano empaquetado (GB) | 3,444 | 7,67 | 2,486 |
| KL media a BF16 | 1,162884 | 0 | 1,147011 |
| Posiciones evaluadas | 16.192 (WikiText-2 test + Wikipedia coreano, plano y chat) | — | — |
| Limite de KL media | 1,5 × Q4_K_M | — | — |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 3,444 GB de pesos empaquetados en `bfp4/`; el consumo real depende del runtime ttnn y de los buffers intermedios, no especificados.
- Hardware objetivo: NPU Tenstorrent Wormhole y Blackhole (núcleos Tensix), con stack tt-metal, ttnn y tt-forge.
- GPU consumer: no aplica como objetivo principal; el modelo está cuantizado para Tensix, no para CUDA. La model card muestra un ejemplo con `transformers` y `device_map="auto"` en bfloat16, pero ese uso no aprovecha el empaquetado BFP.
- Opciones de despliegue: ttnn (recomendado), tt-forge; `transformers` con `AutoModelForCausalLM` para carga en bf16; scripts `pack_tensix.py` y `verify_grid.py` para empaquetado y verificación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-mini-reasoning-Tenstorrent-Tensix (esta ficha) | no disponible | no disponible | safetensors BFP4 (ttnn) | MIT | Hugging Face (184 descargas) |
| microsoft/Phi-4-mini-reasoning (BF16) | no disponible | no disponible | safetensors BF16 | MIT (según model card) | Hugging Face |
| Q4_K_M de Phi-4-mini-reasoning (llama.cpp) | no disponible | no disponible | GGUF Q4_K_M | MIT | llama.cpp |
| Otras cuantizaciones de Phi-4-mini-reasoning | no disponible | no disponible | varios | MIT | Hugging Face |

La comparación cuantitativa disponible se limita al tamaño y la KL media frente a BF16 y Q4_K_M (ver tabla de benchmarks). No se dispone de datos de rendimiento en tareas para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda los sesgos, alucinaciones y limitaciones del modelo base Phi-4-mini-reasoning, no evaluadas de forma independiente en esta publicación.
- Idioma: el tag declara únicamente inglés; el uso en castellano u otros idiomas no está validado, aunque la evaluación KL incluya coreano.
- Divergencia respecto a BF16: la KL media de 1,162884 es superior a la de Q4_K_M (1,147011), por lo que la fidelidad es ligeramente menor que la referencia de 4 bits de llama.cpp.
- Dependencia de hardware: el empaquetado BFP4 está pensado para ttnn y núcleos Tensix; cargarlo en GPU o CPU con `transformers` no aprovecha la cuantización y requiere convertir a bf16.
- Compatibilidad de runtime: requiere versiones concretas de tt-metal/ttnn/tt-forge no especificadas; cambios en el stack pueden romper la carga de tensores.
- Licencia: MIT, igual que el modelo base; los scripts `pack_tensix.py` y `verify_grid.py` son Apache-2.0 según la model card. Verificar el `NOTICE` de cada carpeta antes de redistribuir.
- Madurez: 184 descargas y 0 likes en el momento de la consulta; el repositorio se renombró el 2026-11-27 y los archivos se movieron a `bfp4/`, lo que puede romper rutas en scripts existentes.
- Sin benchmarks de tareas: no hay datos de MMLU, HumanEval, GSM8K ni similares en la información disponible, por lo que no se puede confirmar el rendimiento funcional tras la cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-reasoning
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix/blob/main/LICENSE
