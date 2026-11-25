# Xylolabs/Raon-1-nano-Tenstorrent-Tensix-BFP8

## Resumen

Raon-1-nano-Tenstorrent-Tensix-BFP8 es una versión cuantizada del modelo KRAFTON/Raon-1-nano, adaptada específicamente para su ejecución en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). Lo desarrolla Xylolabs, que ha creado una cadena de herramientas propia (tensix-bfp-gptq, tensix-kernels y tensix-runner) para realizar la cuantización y el despliegue sobre el stack tt-metal/ttnn. El modelo base es un modelo de lenguaje de 3.529.911.376 parámetros orientado a generación de texto conversacional en coreano e inglés.

La relevancia de esta variante reside en su formato de pesos: las 314 matrices grandes del modelo base se han cuantizado a `bfloat8_b` (BFP8, block floating point de 8 bits) mediante redondeo al más cercano, mientras que el resto de tensores permanece en bf16 tal como en el modelo original. Según la model card, la divergencia media en KL respecto a bf16 es de 0,0019, frente a 0,0351 de una cuantización Q4_K_M en llama.cpp, lo que supone aproximadamente 0,05 veces la de esta última.

Se trata de un artefacto muy específico de plataforma: no está pensado como sustituto general del modelo base, sino como un paquete listo para cargar en hardware Tenstorrent, con la ventaja de que los valores se almacenan como bf16 sobre la rejilla de bfloat8_b para que TT-NN los empaquete sin alterar ningún valor. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención tipo MLA con puertas y proyecciones delta-attention, más conexiones tipo hyper-connection y tabla de embedding por capa (según los tensores descritos en la model card; no se detalla la arquitectura completa) |
| Parametros totales | 3.529.911.376 (3,1B según el autor, de los cuales 1,5B corresponden a una tabla de embedding por capa) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`, block floating point de 8 bits) en 314 matrices grandes; bf16 en el resto de tensores |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores bf16 sobre la rejilla bfloat8_b); incluye `quant4.json` con el formato de cada matriz |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento del modelo base, solo el de cuantización. A partir de los tensores enumerados se deduce que el modelo base emplea atención multi-head latente (MLA) con proyecciones con puertas (`gated MLA projections`), proyecciones delta-attention, proyecciones de entrada por capa, conexiones tipo hyper-connection, taps de convolución y una cabeza LM atada (tied LM head). Dispone además de una capa de multi-token prediction en el modelo base que no se incluye en esta versión cuantizada.

El trabajo de Xylolabs consiste en cuantizar a `bfloat8_b` mediante redondeo al más cercano las 314 matrices grandes: 72 del MLP (gate, up, down), 162 de las proyecciones delta-attention, 30 de las proyecciones MLA con puertas (excepto `kv_b_proj`), 49 de las proyecciones de entrada por capa y la cabeza LM atada. Permanecen en bf16 las 6 matrices `kv_b_proj`, las normas, los selectores de hyper-connection, los taps de convolución, las constantes de puerta y las tablas de embedding y de entrada. La cabeza LM redondeada se guarda en un fichero aparte, de modo que el embedding queda sin redondear y Transformers advierte de que los dos pesos atados difieren. No se indica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas generales (el ejemplo de la model card responde correctamente "Paris" a la pregunta por la capital de Francia).
- Ejecución en NPU Tensix de Tenstorrent (Wormhole y Blackhole) a través del stack tt-metal/ttnn.
- Compatibilidad con Transformers (probado con la versión 5.22.1 en CPU) mediante `trust_remote_code=True`, que ejecuta el fichero de modelado del modelo base incluido sin cambios.
- Capacidad de multi-token prediction en el modelo base, aunque la capa correspondiente no se incluye en esta versión.
- No se documentan en la información disponible capacidades de tool calling, uso de agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Despliegue en hardware Tenstorrent: cargar el modelo directamente en NPU Wormhole o Blackhole mediante tt-metal/ttnn para servir generación de texto sin necesidad de GPU, aprovechando que los pesos ya están en el formato nativo `bfloat8_b`.
- Asistentes conversacionales en coreano e inglés: el modelo puede gestionar diálogos multi-turno con plantilla de chat, adecuado para productos dirigidos a ambos mercados idiomáticos.
- Evaluación comparativa de cuantización: sirve como referencia para medir la pérdida de calidad de BFP8 frente a bf16 y frente a Q4_K_M en llama.cpp, gracias a la métrica de divergencia KL publicada.
- Prototipado en entornos con Transformers: la carga en CPU con `dtype="bfloat16"` y `trust_remote_code=True` permite validar respuestas antes de pasar al hardware Tensix.
- Investigación sobre aceleradores alternativos: útil para estudiar el rendimiento de modelos de ~3,5B parámetros en NPU de Tenstorrent frente a GPU convencionales.
- Generación de texto de dominio general en aplicaciones embebidas o de borde donde se disponga de hardware Tensix y se priorice la eficiencia energética sobre el throughput absoluto.
- Base para tareas de ajuste fino o evaluación en coreano, dado que el modelo base está entrenado para ese idioma y esta versión conserva la fidelidad numérica alta respecto a bf16.

## Benchmarks y rendimiento

La model card solo publica una métrica de fidelidad de cuantización, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo (BFP8) | llama.cpp Q4_K_M | Referencia bf16 |
|---|---|---|---|
| Divergencia KL media respecto a bf16 | 0,0019 | 0,0351 | 0 (referencia) |
| Ratio de divergencia frente a Q4_K_M | ~0,05x | 1x | — |
| Verificación de respuesta ("answer check") | Superada | No disponible | No disponible |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 7,1 GB, lo que da una cota superior del espacio en disco de los pesos.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole, mediante tt-metal y ttnn.
- GPU: el modelo no está pensado para GPU; la model card solo verifica la carga en CPU con Transformers 5.22.1 en bfloat16.
- Cabe en GPU de consumo: no es el caso de uso previsto; no se documenta soporte para CUDA.
- Opciones de despliegue: tt-metal/ttnn con las herramientas tensix-runner, tensix-kernels y tensix-bfp-gptq (v0.1.0); también carga en Transformers con `trust_remote_code=True` para validación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Raon-1-nano-Tenstorrent-Tensix-BFP8 | 3,53B | No disponible | BFP8 (`bfloat8_b`) + bf16 | Apache 2.0 | NPU Tensix (Wormhole, Blackhole) |
| KRAFTON/Raon-1-nano (base) | 3,1B (3,53B en safetensors) | No disponible | bf16 | Apache 2.0 | GPU/CPU genérica |
| Mismo modelo en llama.cpp Q4_K_M | 3,53B | No disponible | Q4_K_M (4 bits) | Apache 2.0 | CPU/GPU genérica |

La comparativa se limita al modelo base y a su cuantización en llama.cpp porque la información disponible no incluye otros modelos de referencia con los que contrastar parámetros, contexto o rendimiento. No disponible para alternativas de terceros.

## Limitaciones y advertencias

- Artefacto específico de plataforma: está diseñado para NPU Tensix de Tenstorrent; fuera de ese hardware su utilidad práctica es limitada y no se documenta soporte CUDA.
- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo coreano-inglés, cabe esperar un sesgo hacia esos idiomas y culturas.
- Riesgo de alucinación: no cuantificado en la model card; aplicable el riesgo habitual de los modelos de ~3,5B parámetros.
- Limitaciones de idioma: solo coreano e inglés; el rendimiento en castellano no está documentado.
- Diferencia entre pesos atados: la cabeza LM redondeada se guarda aparte y Transformers emite una advertencia de que los dos pesos atados difieren; hay que tenerlo en cuenta al integrar.
- Capa de multi-token prediction ausente: no se incluye la capa del modelo base, lo que puede afectar a flujos que la aprovechen.
- `trust_remote_code=True`: ejecuta el fichero de modelado del modelo base; conviene revisarlo antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero el autor indica que no está afiliado ni respaldado por Tenstorrent; el aviso de cambios está en `NOTICE`.
- No se han publicado benchmarks de tareas ni datos de latencia/throughput, por lo que la idoneidad en producción debe validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Raon-1-nano-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Raon-1-nano-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
