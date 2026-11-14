# Xylolabs/gemma-4-26B-A4B-Tenstorrent-Tensix-BFP8

## Resumen

Este repositorio contiene una exportación cuantizada del modelo multimodal `google/gemma-4-26B-A4B` de Google, preparada por Xylolabs para su ejecución en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo base es un transformer híbrido con mezcla de expertos (MoE) de 26.544 millones de parámetros totales, de los cuales aproximadamente 4.000 millones están activos por token, y acepta entradas de imagen y texto. La cuantización aplicada es BFP8 (block floating point de 8 bits, `ttnn.bfloat8_b`) mediante GPTQ sobre las capas lineales, manteniendo en bf16 las matrices de embedding, la cabeza LM, las normas, el router y el tower de visión.

La relevancia de esta ficha radica en que no se trata de una cuantización convencional orientada a GPU, sino de un formato específico para hardware NPU de Tenstorrent, con matrices almacenadas como valores bf16 sobre la rejilla BFP8 para que TT-NN las empaquete sin alterar sus valores. El resultado ocupa 27,51 GB empaquetado, con una media de 8,72 bits por peso, frente a los 50,47 GB del modelo original en BF16. La ficha es útil para quienes evalúan despliegues en hardware no-NVIDIA, ya que documenta explícitamente qué se ha verificado (empaquetado exacto en un chip simulado) y qué no (ejecución multi-chip real).

El modelo se distribuye con licencia Apache 2.0, lo que facilita su uso comercial, pero conviene tener presente que se trata del modelo preentrenado: no incluye plantilla de chat y su función es continuar texto, no mantener conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE); el modelo base es image-text-to-text |
| Parametros totales | 26.544.133.710 (26,54 B) |
| Parametros activos | Aproximadamente 4 B por token (denominación A4B del modelo base; no se detalla el reparto exacto en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en capas lineales de atención y MLP, GPTQ; 8,5 bits por peso en tensores cuantizados, 8,72 bits de media; existe versión BFP4 del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`), con metadatos `quant4.json` y `model.safetensors.index.json` para el empaquetado Tensix |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B` es un transformer con mezcla de expertos que procesa entradas de imagen y texto (pipeline `image-text-to-text`). La exportación de Xylolabs conserva la topología del modelo original y solo modifica el formato numérico de las proyecciones lineales: atención (q, k, o en 30 capas; v en 25 capas), MLP denso y expertos enrutados (gate, up, down) se almacenan en `bfloat8_b` con GPTQ. Permanecen en bf16 el router y las escalas por experto, la cabeza LM (atada al embedding), el embedding, las normas y los módulos `embed_vision` y `vision_tower`. El calibrado de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

La innovación técnica principal es el empaquetado exacto: las matrices cuantizadas se guardan como valores bf16 sobre la rejilla BFP8, de modo que TT-NN las carga sin recalcular ni redondear, y el autor verifica que ningún valor cambia tras el empaquetado. La evaluación publicada se limita al modelo de lenguaje; no se evaluaron las capacidades de visión. No se documentan en la información disponible los datos de entrenamiento originales (número de tokens, composición del dataset, RLHF/DPO), que corresponden al modelo base de Google y no a esta exportación.

## Capacidades

- Generación de texto: el modelo es preentrenado y continúa texto; no dispone de plantilla de chat ni de formato conversacional.
- Procesamiento de imagen y texto: hereda la modalidad `image-text-to-text` del modelo base, con `vision_tower` y `embed_vision` intactos en bf16.
- Mezcla de expertos: activación de aproximadamente 4 B parámetros por token sobre 26,54 B totales, lo que reduce el coste de cómputo por token.
- Razonamiento y conocimiento factual: se evalúa con 28 preguntas de respuesta correcta, obteniendo 28 de 28 tanto en BF16 como en esta versión BFP8.
- Capacidades multilingües: no disponibles en la información proporcionada; el calibrado incluyó Wikipedia en coreano, lo que sugiere cobertura de al menos inglés y coreano, sin confirmación oficial.
- Tool calling, function calling y comportamiento agéntico: no disponible; no se documenta soporte explícito en esta exportación.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Despliegue en hardware Tenstorrent: el formato BFP8 está diseñado para cargarse directamente en NPUs Wormhole y Blackhole mediante TT-NN, con 27,51 GB de memoria de dispositivo para los pesos del modelo de lenguaje, lo que lo hace adecuado para entornos que no disponen de GPU NVIDIA.
- Servicio de continuación de texto en pipelines de generación: al ser un modelo preentrenado sin plantilla de chat, encaja en tareas de completado, resumen extractivo o reescritura dentro de un pipeline propio que construya los prompts manualmente.
- Procesamiento de documentos con imagen: la modalidad image-text-to-text permite tareas de descripción o extracción de información a partir de imágenes, aunque el autor advierte que solo el modelo de lenguaje fue cuantizado y evaluado.
- Investigación sobre cuantización block floating point: el repositorio incluye `quant4.json`, `pack_tensix.py` y `verify_grid.py`, lo que permite reproducir el empaquetado y comparar la fidelidad numérica frente a BF16 y Q4_K_M.
- Evaluación comparativa de precisión: con una KL media de 0,00268 frente a BF16 y un top-1 del 97,29 %, sirve como referencia para estudiar el impacto de BFP8 en modelos MoE multimodales.
- Integración en el demo Gemma 4 de tt-metal: el autor documenta una entrada de `precision_overrides.json` que permite al demo cargar atención, MLP compartido y expertos en bfp8, útil para experimentar con ejecución tensor-parallel en cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o en un Wormhole T3K.
- Pruebas de empaquetado en simulación: verificado con ttnn 0.81.1 sobre `ttsim`, el simulador Blackhole de Tenstorrent, lo que permite validar flujos de despliegue antes de disponer de hardware físico.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan esta exportación con el modelo base en BF16 y con una cuantización Q4_K_M de llama.cpp. La evaluación se realizó solo sobre el modelo de lenguaje.

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-26B-A4B`) | 16 | 50,47 | 0 | 100 | 28 de 28 | - |
| Este modelo (BFP8) | 8,72 | 27,513 | 0,00268 | 97,29 | 28 de 28 | 0 |
| Q4_K_M (llama.cpp) | 5,32 | 16,796 | 0,05678 | 89,89 | 28 de 28 | 0 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. Tampoco se han publicado métricas de latencia o throughput.

## Requisitos de hardware

- Memoria de dispositivo: 27,51 GB para los pesos del modelo de lenguaje empaquetado, más espacio para la caché KV y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Ejecución multi-chip: el demo Gemma 4 de tt-metal (v0.81.1) ejecuta el 26B-A4B en tensor-parallel sobre cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o sobre un Wormhole T3K; no cabe en un único chip.
- Versión BFP4: el autor recomienda la variante BFP4 del mismo repositorio para dispositivos con menos memoria.
- GPU de consumo: no disponible; este formato está orientado a Tensix y no se documenta su uso en GPU consumer.
- Despliegue: TT-NN (ttnn) y tt-metal para Tensix; tt-forge (tt-xla) aún no se ha probado con Gemma 4 y, por defecto, mantiene los pesos en bf16. La carga vía `transformers` con `dtype="bfloat16"` y `device_map="auto"` es posible para inspección, pero no aprovecha el formato BFP8.
- Verificación: `pack_tensix.py` comprueba cada matriz y `verify_grid.py` valida la rejilla solo con torch; probado con ttnn 0.81.1 sobre `ttsim`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP8 Tensix) | 26,54 B (≈4 B activos) | No disponible | Safetensors BFP8, 8,72 bits/peso, 27,51 GB | Apache 2.0 | Hugging Face, 60 descargas |
| `google/gemma-4-26B-A4B` (BF16) | 26,54 B (≈4 B activos) | No disponible | Safetensors BF16, 16 bits/peso, 50,47 GB | Apache 2.0 (según este repositorio) | Hugging Face |
| Q4_K_M de llama.cpp | 26,54 B (≈4 B activos) | No disponible | GGUF Q4_K_M, 5,32 bits/peso, 16,796 GB | Apache 2.0 | Formato estándar llama.cpp |
| `Xylolabs/gemma-4-26B-A4B-Tensix-BFP4` | 26,54 B (≈4 B activos) | No disponible | Safetensors BFP4 | Apache 2.0 | Hugging Face |

La comparación relevante es de fidelidad numérica: BFP8 pierde muy poco frente a BF16 (KL 0,00268, top-1 97,29 %) a costa de aproximadamente la mitad del tamaño, mientras que Q4_K_M reduce más el tamaño pero degrada bastante más (KL 0,05678, top-1 89,89 %). No se dispone de comparaciones con otros modelos de tamaño o tarea similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo preentrenado: no incluye plantilla de chat; no debe usarse directamente como asistente conversacional sin un formateo de prompt propio.
- Evaluación parcial: solo se cuantizó y evaluó el modelo de lenguaje; las capacidades de visión no fueron evaluadas.
- Verificación limitada: el empaquetado se comprobó en las dos primeras capas sobre un chip simulado; el reparto multi-chip real no se ejecutó.
- Compatibilidad: tt-transformers no soporta Gemma 4; tt-forge (tt-xla) no se ha probado con este modelo.
- Riesgo de alucinación: inherente a los modelos generativos preentrenados; no se documentan mitigaciones específicas.
- Sesgos: no se documentan sesgos conocidos en la información disponible; el calibrado GPTQ usó WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo de dominio.
- Idiomas: no se dispone de lista oficial de idiomas soportados.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google y las patentes o marcas asociadas.
- Hardware: requiere NPUs Tenstorrent; no es un artefacto plug-and-play para GPU, y la carga en `transformers` no explota el formato BFP8.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Versión BFP4 del mismo autor: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-Tensix-BFP4
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Gemma 4 de tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
