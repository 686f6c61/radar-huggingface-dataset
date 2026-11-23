# warlockzero/Qwen3-1.7B-int4

## Resumen

`warlockzero/Qwen3-1.7B-int4` es un checkpoint cuantizado a 4 bits en formato NormalFloat4 (NF4) mediante bitsandbytes, derivado del modelo instruct `Qwen/Qwen2.5-1.5B-Instruct` de Alibaba Qwen. A pesar del nombre comercial que alude a "Qwen3-1.7B", los pesos reales corresponden a la familia Qwen2.5 con 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), tal como confirman los safetensors y el campo `base_model` de la model card. La cuantización reduce el peso en disco de unos 3,1 GB en FP16 a aproximadamente 1,1-1,2 GB.

El objetivo del autor es ofrecer una variante de bajo consumo de memoria y alta velocidad para generación de texto conversacional, manteniendo el `lm_head` en precisión completa para evitar derivas en los logits. Está pensado para entornos con VRAM limitada (GPU de consumo, inferencia en el borde o prototipado rápido) donde el modelo original en FP16 no cabría con comodidad junto al resto del pipeline.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, publicado en noviembre de 2026. No debe confundirse con la familia Qwen3 oficial: es una cuantización comunitaria de Qwen2.5-1.5B-Instruct, con licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), cuantizado post-entrenamiento a NF4 |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, segun la documentacion oficial de Qwen) |
| Tipos de cuantizacion | INT4 NormalFloat4 (NF4), almacenamiento uint8, doble cuantizacion activada, computo en float16/bfloat16 (W4A8/W4A16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de ~1,2 GB; checkpoint declarado de ~1,1 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) del transformer decoder-only Qwen2.5-1.5B-Instruct. La arquitectura subyacente es la de Qwen2 (atención con RoPE, capas de atención y MLP con normalización RMSNorm, sin mezcla de expertos). No se ha reentrenado ni ajustado: el autor aplica cuantizacion de pesos a 4 bits con el esquema NormalFloat4 de bitsandbytes, que distribuye los niveles de cuantizacion de forma informacionalmente óptima para pesos con distribución aproximadamente normal. Se activa doble cuantizacion para comprimir las constantes de segundo nivel y se preserva `lm_head` en precisión completa para mitigar la deriva en los logits.

No hay información sobre datos de entrenamiento adicionales, RLHF, DPO ni innovaciones técnicas propias del autor más allá del esquema de cuantizacion. El modelo base Qwen2.5-1.5B-Instruct fue entrenado por Alibaba con datos multilingües (en/zh) y ajustado por instrucciones, pero esos detalles no se reproducen en la model card proporcionada. La precisión de ejecución declarada es float16 o bfloat16, con kernels de bitsandbytes para W4A8/W4A16.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento básico y respuesta a instrucciones heredadas del ajuste instruct del modelo base.
- Generación de código sencillo (el ejemplo de la model card muestra una función de Fibonacci en Python).
- Soporte de conversaciones multi-turno mediante plantilla de chat de Qwen2.5 (no documentado explícitamente en la model card, pero heredado del base).
- Tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5-1.5B-Instruct lo soporta de forma limitada, pero no se garantiza tras la cuantización.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Prototipado rápido en portátil o GPU de consumo: con ~1,3 GB de VRAM necesarios, permite levantar un chat funcional en una RTX 3050, GTX 1650 o incluso en CPU con `device_map="auto"`, ideal para validar prompts antes de pasar al modelo completo.
- Asistente conversacional ligero en el borde: despliegue en dispositivos con poca memoria (mini-PC, Raspberry Pi 5 con suficiente RAM) para tareas de respuesta a preguntas simples en inglés o chino.
- Generación de código de plantilla en entornos con recursos limitados: el modelo puede producir snippets de Python, SQL o scripts de shell para autocompletar en editores ligeros, aceptando la menor calidad frente a modelos de mayor tamaño.
- Clasificación y etiquetado de texto: uso como modelo de extracción de entidades o clasificador zero-shot en pipelines de procesamiento por lotes donde el coste por token importa más que la precisión puntera.
- Educación y demos interactivas: ideal para talleres o notebooks de Jupyter donde se necesita un LLM ejecutable sin GPU dedicada, mostrando el flujo completo de tokenización, generación y decodificación.
- Filtrado y resumen de textos cortos: resumen de correos, titulares o mensajes en inglés/chino dentro de aplicaciones móviles o de escritorio con presupuesto de memoria estricto.
- Base para fine-tuning ligero con QLoRA: al estar ya en NF4, sirve como punto de partida para adaptaciones con LoRA sobre el modelo base, aunque conviene partir del checkpoint original para evitar acumular errores de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,3 GB según la model card (pesos NF4 + overhead de activaciones y caché KV en fp16).
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 y H100 (estas últimas sobredimensionadas para este tamaño).
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas con al menos 2 GB de VRAM; también puede ejecutarse en CPU con `device_map="auto"` o `cpu`.
- Opciones de despliegue: transformers con bitsandbytes (soporte nativo del checkpoint), vLLM (requiere conversión a AWQ/GPTQ, no compatible directamente con NF4), llama.cpp/Ollama (requiere conversión a GGUF, no incluida en el repo), TGI (soporte limitado de NF4 vía bitsandbytes).
- Latencia y throughput estimados: no disponibles en la información proporcionada; en una RTX 4090 se espera decodificación muy rápida por el tamaño, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warlockzero/Qwen3-1.7B-int4 | ~1,5 B | no disponible (base: 32k) | NF4 4-bit | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | FP16/BF16 | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-1.5B-Instruct-GGUF | ~1,5 B | 32.768 tokens | GGUF (Q4_K_M, Q8_0, etc.) | Apache 2.0 | Hugging Face, oficial |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2 B | 128.000 tokens | FP16/BF16 | Llama 3.2 Community License | Hugging Face, requiere aceptar términos |

La comparación más directa es con el modelo base sin cuantizar y con la versión GGUF oficial de Qwen. El checkpoint de `warlockzero` ofrece la ventaja de ser directamente cargable con transformers + bitsandbytes, pero carece de la validación y el soporte de las variantes oficiales. Frente a Llama-3.2-1B, este último tiene contexto mucho mayor y licencia más restrictiva; el Qwen2.5-1.5B base es Apache 2.0 y algo más grande.

## Limitaciones y advertencias

- El nombre "Qwen3-1.7B" es engañoso: los pesos corresponden a Qwen2.5-1.5B-Instruct, no a la familia Qwen3. Verificar siempre el campo `base_model` antes de integrarlo.
- La cuantizacion NF4 introduce pérdida de precisión frente al modelo en FP16; puede degradar tareas de razonamiento matemático o código complejo.
- Riesgo de alucinación inherente a un modelo de 1,5 B: no es fiable para tareas de alta precisión factual sin verificación externa.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni evaluado.
- No hay benchmarks publicados que validen la calidad tras la cuantización; el autor no documenta evaluaciones comparativas.
- El repo tiene 0 descargas y 0 likes: no hay evidencia de uso en producción ni retroalimentación de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero al derivar del modelo base Qwen conviene revisar los términos del modelo original por si hubiera condiciones adicionales (en este caso, Qwen2.5 se distribuye bajo Apache 2.0).
- Compatibilidad limitada con motores de inferencia de alto rendimiento (vLLM, TGI): el formato NF4 de bitsandbytes no es el más eficiente para serving; para producción conviene convertir a GGUF, AWQ o GPTQ.
- No se documenta el soporte de tool calling ni de agentes tras la cuantización, aunque el modelo base lo tenga de forma parcial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/warlockzero/Qwen3-1.7B-int4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de bitsandbytes (NF4): https://huggingface.co/docs/bitsandbytes/main/en/index
- Paper de QLoRA (introducción de NF4): https://arxiv.org/abs/2305.14314
