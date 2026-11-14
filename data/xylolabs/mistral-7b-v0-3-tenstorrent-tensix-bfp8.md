# Xylolabs/Mistral-7B-v0.3-Tenstorrent-Tensix-BFP8

## Resumen

Mistral-7B-v0.3-Tenstorrent-Tensix-BFP8 es una exportación cuantizada de mistralai/Mistral-7B-v0.3 realizada por Xylolabs, orientada específicamente a la inferencia sobre aceleradores NPU de Tenstorrent (arquitecturas Tensix Wormhole y Blackhole). No es un modelo nuevo ni un fine-tuning: es el mismo checkpoint base de 7.248 millones de parámetros, con las capas lineales de atención y MLP cuantizadas a `ttnn.bfloat8_b` (block floating point de 8 bits) mediante GPTQ, de forma que el empaquetado en TT-NN se realiza sin alterar los valores almacenados.

El interés de esta ficha es doble. Por un lado, documenta un formato de cuantización poco habitual en el ecosistema Hugging Face: BFP8 sobre rejilla de exponente compartido, pensado para que el hardware Tensix lo consuma de forma nativa. Por otro, sirve como referencia de despliegue para quienes trabajan con hardware de Tenstorrent en lugar de GPU convencionales, un nicho en crecimiento pero con escasa documentación pública.

El modelo conserva la licencia Apache 2.0 del base, ocupa 14,5 GB en el repositorio y requiere aproximadamente 7,95 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje. Es un modelo preentrenado sin plantilla de chat: continúa texto, no conversa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-v0.3), con capas lineales cuantizadas a BFP8 |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Mistral-7B-v0.3) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en q/k/v/o y gate/up/down de las 32 capas; LM head, embeddings y normas en bf16; media de 8,78 bits por peso |
| Idiomas soportados | no disponible (calibrado con WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (14,5 GB de repositorio), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-v0.3: un transformer decoder-only de 7.248 millones de parámetros con 32 capas. La modificación introducida por Xylolabs afecta únicamente a la representación numérica de los pesos. Las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) de las 32 capas se cuantizan a `ttnn.bfloat8_b` con GPTQ sobre la propia rejilla BFP8, manteniendo el exponente compartido de cada bloque tal como lo fija el empaquetador de Tenstorrent. El resto de tensores (LM head, embeddings, normas) permanece en bf16, igual que en el modelo base.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. No hay entrenamiento adicional ni ajuste fino: el proceso es puramente de cuantización post-entrenamiento. La innovación técnica relevante es que las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8, de modo que TT-NN las empaqueta sin modificar sus valores; el autor incluye scripts (`pack_tensix.py`, `verify_grid.py`) para verificar que el empaquetado es bit a bit idéntico. El checkpoint se validó con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent; tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades

- Generación de texto autoregresiva y continuación de texto (modelo preentrenado, sin plantilla de chat).
- Razonamiento y conocimiento general heredados de Mistral-7B-v0.3.
- Generación de código y matemáticas, en la medida en que lo soporte el modelo base.
- Multilingüismo heredado del base; la model card no detalla la lista de idiomas.
- No dispone de tool calling ni function calling documentado en esta exportación.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- No incluye capacidades de agente ni multi-step reasoning documentadas.
- Inferencia optimizada para NPU Tensix (Wormhole, Blackhole) mediante TT-NN.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal. Permite ejecutar Mistral-7B-v0.3 en NPU Wormhole o Blackhole con pesos ya empaquetados en BFP8, evitando la conversión en tiempo de carga y aprovechando el formato nativo de TT-NN.
- Inferencia de bajo consumo en edge o servidores con NPU: al requerir unos 7,95 GB de memoria de dispositivo para los pesos, encaja en configuraciones Tensix con memoria limitada frente a una GPU equivalente en bf16 (14,5 GB).
- Prototipado y validación de pipelines TT-NN: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar la integridad del empaquetado matriz a matriz, útil para equipos que integran modelos cuantizados en sus propias pilas.
- Generación de texto por continuación en tareas de completado, resumen o redacción, siempre que se proporcione el prompt adecuado al no existir plantilla de chat.
- Investigación sobre cuantización BFP8: sirve como referencia reproducible para comparar la fidelidad de BFP8 frente a Q4_K_M u otros esquemas, con métricas de KL y top-1 publicadas.
- Evaluación comparativa de hardware: al ser una exportación con verificación bit a bit, permite aislar el efecto del hardware Tensix del efecto de la cuantización en experimentos de rendimiento.
- Sustitución de la versión BFP4 en dispositivos con memoria suficiente: el autor recomienda explícitamente esta variante BFP8 cuando el dispositivo dispone de memoria para 7,95 GB, reservando la BFP4 para equipos más limitados.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad respecto a BF16, no calidad de tarea. KL y top-1 se calculan sobre 8.184 posiciones de texto inglés y coreano (test de WikiText-2 y Wikipedia en coreano). Las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato de completado y 3-shot.

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Mistral-7B-v0.3) | 16 | 14,50 | 0 | 100 | 20 de 28 | - |
| **Este modelo (BFP8)** | 8,78 | 7,953 | 0,00040 | 98,96 | 20 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,83 | 4,373 | 0,01285 | 94,05 | 20 de 28 | 0 |

El criterio de aceptación del autor era una KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional. El resultado es 0,03 veces la KL de Q4_K_M y cero respuestas perdidas. No se reportan cifras de velocidad ni de throughput. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 7,95 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Validación realizada con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole; no se ejecutó en silicio real según la model card.
- No está pensado para GPU convencionales: el formato BFP8 es específico de TT-NN. La carga con `transformers` en bf16 es posible (el quickstart usa `dtype="bfloat16"` y `device_map="auto"`), pero en ese caso se pierde la ventaja de empaquetado nativo.
- Opciones de despliegue: TT-NN (tt-metal), con scripts de empaquetado y verificación incluidos. tt-transformers y tt-forge no fueron probados con este checkpoint.
- Alternativa para dispositivos con menos memoria: la versión BFP4 del mismo autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 7,25 B | no disponible | BFP8 (8,78 bits/peso) | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| Xylolabs/Mistral-7B-v0.3-Tenstorrent-Tensix-BFP4 | 7,25 B | no disponible | BFP4 | Apache 2.0 | Tensix con menos memoria |
| mistralai/Mistral-7B-v0.3 (BF16) | 7,25 B | no disponible | bf16 (16 bits/peso) | Apache 2.0 | GPU y CPU |
| Mistral-7B-v0.3 Q4_K_M (llama.cpp) | 7,25 B | no disponible | 4,83 bits/peso | Apache 2.0 | CPU y GPU |

La comparación relevante es de fidelidad y tamaño: BFP8 ocupa 7,953 GB con una KL de 0,00040 frente a BF16, mientras que Q4_K_M ocupa 4,373 GB con una KL de 0,01285. BFP8 es más fiel pero más grande; Q4_K_M es más compacto y ejecutable en hardware convencional. La ventaja de BFP8 es su integración nativa en TT-NN, no su ratio de compresión.

## Limitaciones y advertencias

- Es un modelo preentrenado sin plantilla de chat: no está alineado para conversación ni sigue instrucciones de forma fiable.
- Los benchmarks publicados miden fidelidad respecto a BF16, no calidad de tarea; no hay datos de MMLU, HumanEval ni GSM8K para esta exportación.
- El checkpoint se validó en `ttsim` (simulador), no en silicio Tensix real, según la model card.
- tt-transformers y tt-forge no se ejecutaron con este checkpoint; la compatibilidad con esas pilas no está confirmada.
- El formato BFP8 es específico de TT-NN; fuera de hardware Tenstorrent pierde su propósito y requiere conversión.
- La calibración de GPTQ se hizo con WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo hacia esos dominios y ese par de idiomas.
- Riesgo de alucinación inherente a un modelo de 7 B preentrenado sin alineación posterior.
- La licencia es Apache 2.0, igual que el base; el repositorio del base no incluye fichero LICENSE, por lo que el autor aporta el texto estándar y un NOTICE con los cambios.
- El autor declara no estar afiliado ni respaldado por Tenstorrent.
- Se distribuye "as is", sin garantía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-v0.3-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Version BFP4: https://huggingface.co/Xylolabs/Mistral-7B-v0.3-Tenstorrent-Tensix-BFP4
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Mistral-7B-v0.3-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
