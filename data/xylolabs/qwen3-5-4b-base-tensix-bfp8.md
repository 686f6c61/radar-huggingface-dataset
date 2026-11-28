# Xylolabs/Qwen3.5-4B-Base-Tensix-BFP8

## Resumen

Qwen3.5-4B-Base-Tensix-BFP8 es una cuantización del modelo base Qwen/Qwen3.5-4B-Base, publicada por Xylolabs, orientada específicamente a la ejecución sobre NPUs Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura y los pesos del base de Qwen, pero los tensores de atención, MLP y DeltaNet se almacenan en formato de coma flotante por bloques (block floating point) `bfloat8_b` (BFP8) y, en la carpeta bfp4, `bfloat4_b` (BFP4). El objetivo es reducir el espacio en memoria y adaptar los pesos al formato nativo que consumen las unidades Tensix vía `ttnn` y `tt-metal`.

El modelo base Qwen3.5-4B-Base es un transformer multimodal (pipeline `image-text-to-text`) de la familia Qwen3.5, presentada por el equipo Qwen en febrero de 2026 bajo el lema "Towards Native Multimodal Agents". El checkpoint contiene 5.295.564.288 parámetros según los safetensors publicados, lo que incluye componentes auxiliares además del tronco de 4B. Al ser un modelo *base*, no está ajustado por instrucciones: su función es la continuación de texto y sirve como punto de partida para fine-tuning.

La relevancia de esta ficha radica en que es una de las pocas publicaciones que empaqueta pesos en formatos BFP nativos para hardware Tenstorrent, con métricas de degradación (KL divergence) frente a BF16 y frente a una cuantización Q4_K_M de llama.cpp. Esto permite evaluar el coste de precisión de ejecutar el modelo en aceleradores Tensix en lugar de GPU convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con componentes DeltaNet; pesos cuantizados en block floating point para Tensix |
| Parametros totales | 5.295.564.288 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`) y BFP4 (`bfloat4_b`); referencia BF16 y Q4_K_M (llama.cpp) para comparacion |
| Idiomas soportados | no disponible (la evaluacion KL usa texto en ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (carpetas `bfp8/` y `bfp4/`), con metadatos `quant4.json` y scripts `pack_tensix.py` / `verify_grid.py` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B-Base es un transformer multimodal de la familia Qwen3.5. La model card de la cuantización menciona explícitamente capas de atención, MLP y DeltaNet, lo que sugiere una arquitectura híbrida que combina atención estándar con mecanismos DeltaNet (una variante de atención lineal/recurrente). El checkpoint incluye componentes de visión, dado que el pipeline es `image-text-to-text`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; al tratarse de un modelo *base*, es esperable que no haya pasado por alineamiento por preferencias, pero esto no se confirma en la documentación disponible.

La innovación principal de esta publicación no está en el entrenamiento sino en la cuantización. Xylolabs aplica un esquema de block floating point (BFP) que agrupa valores en bloques con un exponente compartido y mantiene la mantisa en 8 o 4 bits según el formato. La carpeta `bfp8/` cuantiza atención, DeltaNet y MLP a `bfloat8_b`, dejando el resto en bf16/float32. La carpeta `bfp4/` va más allá: atención, MLP y DeltaNet (salvo los parámetros a/b de DeltaNet, que quedan en `bfloat8_b`) se almacenan en `bfloat4_b`. La degradación se mide con KL divergence sobre 8.188 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), con un límite de KL media de 1,5 veces la referencia Q4_K_M.

## Capacidades

- Generación de texto y continuación de texto: es un modelo *base*, por lo que su tarea nativa es predecir el siguiente token, no seguir instrucciones.
- Procesamiento multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, lo que implica entrada de imágenes junto con texto.
- Razonamiento y matemáticas: capacidades heredadas del base Qwen3.5-4B-Base, sin datos concretos de benchmarks en la información disponible.
- Generación de código: no confirmado explícitamente en la documentación; depende del base.
- Tool calling / function calling: no disponible para un modelo *base* sin ajuste de instrucciones.
- Soporte de agentes y multi-step reasoning: no aplicable directamente al checkpoint base; requeriría fine-tuning o un modelo instruct derivado.
- Capacidades multilingües: la evaluación KL cubre inglés y coreano, lo que sugiere soporte al menos para esos idiomas, pero no se detalla la lista completa.
- Ejecución en hardware Tensix: capacidad diferencial de esta publicación, con scripts de empaquetado y verificación (`pack_tensix.py`, `verify_grid.py`) y round-trip opcional con `--device`.

## Casos de uso

- Despliegue en NPUs Tenstorrent Wormhole o Blackhole: el modelo está empaquetado en formatos `bfloat8_b` y `bfloat4_b` que `ttnn` consume de forma nativa, lo que permite ejecutar inferencia en aceleradores Tensix sin conversión adicional. Es el caso de uso principal de esta publicación.
- Investigación sobre cuantización BFP: la carpeta `bfp8/` ofrece una KL media de 0,00072 frente a BF16, lo que la convierte en un banco de pruebas controlado para estudiar el impacto de la precisión de bloque en modelos multimodales.
- Evaluación comparativa de hardware: al incluir referencia Q4_K_M (KL 0,02929) y BF16 (KL 0), se puede comparar la fidelidad de Tensix BFP8/BFP4 frente a cuantizaciones estándar de llama.cpp en el mismo modelo.
- Fine-tuning posterior sobre base multimodal: al ser un checkpoint *base* con licencia Apache-2.0, sirve como inicialización para tareas de visión-lenguaje (VQA, captioning, OCR) que requieran ajuste supervisado.
- Prototipado de pipelines imagen-texto en entornos de bajo consumo: la carpeta `bfp4/` ocupa 3,283 GB empaquetados, lo que facilita su transporte y despliegue en dispositivos con memoria limitada.
- Verificación de integridad de pesos en hardware: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar que los tensores empaquetados coinciden con los originales, útil en pipelines de CI para modelos cuantizados.
- Continuación de texto en inglés o coreano: la evaluación KL se realizó sobre estos idiomas, por lo que son los mejor validados para tareas de generación libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente proporciona métricas de fidelidad de cuantización:

| Formato | Tamano empaquetado (GB) | KL media a BF16 |
|---|---|---|
| `bfp4/` | 3,283 | 0,03398 |
| `bfp8/` | 5,065 | 0,00072 |
| BF16 (base) | 8,41 | 0 |
| Q4_K_M (llama.cpp) | 2,783 | 0,02929 |

La KL se calcula sobre 8.188 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano, con un límite de KL media de 1,5 veces la referencia Q4_K_M. BFP8 queda muy por debajo de ese límite (0,00072 frente a 0,02929 de Q4_K_M), mientras que BFP4 lo supera ligeramente (0,03398), aunque la model card no aclara si se acepta como dentro del margen del 1,5×.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido convencional, ya que el destino es memoria DRAM de NPUs Tensix; el tamaño empaquetado es de 5,065 GB para `bfp8/` y 3,283 GB para `bfp4/`, frente a 8,41 GB en BF16.
- GPU recomendadas: no disponible; el modelo está pensado para Tenstorrent Wormhole y Blackhole, no para GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no es el objetivo de la publicación. La ejecución en GPU requeriría reconvertir los pesos BFP a un formato estándar (bf16/fp16), lo que anularía la ventaja de la cuantización.
- Opciones de despliegue: `ttnn` / `tt-metal` sobre hardware Tensix; los scripts `pack_tensix.py` y `verify_grid.py` gestionan el empaquetado y la verificación. También se puede cargar en `transformers` con `dtype="bfloat16"` y `device_map="auto"`, aunque en ese caso los pesos BFP se materializan como bf16.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-4B-Base-Tensix-BFP8 (esta ficha) | 5.295.564.288 | no disponible | safetensors BFP8/BFP4 para Tensix | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | safetensors BF16 | Apache-2.0 | Hugging Face |
| Qwen3.5-4B-Base cuantizado Q4_K_M (llama.cpp) | no disponible | no disponible | GGUF Q4_K_M | Apache-2.0 | Referencia en la model card |
| Xylolabs/Qwen3.5-4B-Base-Tensix-BFP4 | 5.295.564.288 | no disponible | safetensors BFP4 | Apache-2.0 | Hugging Face (misma publicación, carpeta `bfp4/`) |

No se dispone de datos de rendimiento en tareas para comparar con otros modelos de la misma categoría; la comparación se limita a formato, tamaño y fidelidad de cuantización.

## Limitaciones y advertencias

- Es un modelo *base*: no está ajustado por instrucciones, por lo que no sigue instrucciones ni mantiene conversaciones de forma fiable sin fine-tuning adicional.
- La cuantización BFP4 introduce una degradación medible (KL 0,03398 frente a BF16), superior a la de Q4_K_M (0,02929); para tareas sensibles a la precisión conviene usar `bfp8/` o BF16.
- La evaluación de fidelidad solo cubre inglés y coreano; el comportamiento en otros idiomas no está validado.
- El destino es hardware Tensix; en GPU convencionales los pesos BFP deben reconvertirse, lo que elimina la ventaja de tamaño y puede introducir errores adicionales.
- No se publican benchmarks de tareas (razonamiento, código, matemáticas, visión), por lo que el rendimiento real del base en esas áreas no está cuantificado en la documentación.
- Riesgo de alucinación inherente a un modelo de lenguaje *base*; no hay datos específicos sobre sesgos.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar los ficheros `LICENSE` y `NOTICE` de cada carpeta, que pueden incluir condiciones adicionales.
- El repositorio se actualizó el 2026-11-27 fusionando las antiguas publicaciones BFP4 y BFP8 en una sola; verificar que se descarga la carpeta correcta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
