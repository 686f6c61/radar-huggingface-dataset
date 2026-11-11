# Xylolabs/Qwen3.6-27B-Tensix-BFP8

## Resumen

Qwen3.6-27B-Tensix-BFP8 es una versión cuantizada del modelo multimodal Qwen/Qwen3.6-27B, publicada por Xylolabs y orientada específicamente a la ejecución sobre NPUs Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). La cuantización aplica GPTQ sobre la rejilla de punto flotante por bloques `bfloat8_b` (BFP8) de TT-NN, de modo que los pesos del checkpoint ya están alineados con el formato que el runtime de Tenstorrent empaqueta en el dispositivo sin recuantización adicional. El resultado es un checkpoint de 27.781 millones de parámetros con un coste medio de 9,21 bits por peso y un tamaño empaquetado de 30,96 GB.

El modelo conserva la arquitectura híbrida del base: 16 capas con atención clásica y 48 capas con Gated DeltaNet (atención lineal), más una torre visual y un módulo MTP (multi-token prediction) que se mantienen en bf16 sin tocar. Solo se cuantizaron las proyecciones lineales del modelo de lenguaje (q, k, v, o; q, k, v, z, a, b y salida de Gated DeltaNet; y gate, up y down del MLP), mientras que embeddings, LM head y normalizaciones permanecen en bf16.

Su relevancia es doble: por un lado, demuestra un flujo de cuantización GPTQ consciente del formato de bloque propietario de Tenstorrent; por otro, es uno de los pocos checkpoints públicos de Qwen3.6-27B preparado para hardware Tensix. Conviene señalar que el autor indica que las pruebas se realizaron sobre `ttsim`, el simulador de Blackhole, y no sobre silicio real, y que la ejecución completa con los demos de tt-metal no se validó de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas con atención (q, k, v, o) y 48 capas con Gated DeltaNet; torre visual y módulo MTP en bf16 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en las proyecciones lineales); resto en bf16; media de 9,21 bits por peso |
| Idiomas soportados | no disponible (calibración GPTQ con 65.536 tokens de WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores ya situados en la rejilla BFP8); incluye `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El checkpoint no se entrena desde cero: parte de Qwen/Qwen3.6-27B y aplica cuantización post-entrenamiento con GPTQ sobre la rejilla `bfloat8_b` de TT-NN. La arquitectura base combina 16 capas de atención estándar con 48 capas de Gated DeltaNet, un mecanismo de atención lineal con estado recurrente que reduce el coste de contexto largo. Se mantienen intactos en bf16 el módulo MTP, la torre visual, los embeddings, el LM head y todas las normalizaciones; solo las proyecciones lineales del modelo de lenguaje se cuantizan a BFP8.

La calibración de GPTQ se realizó sobre 65.536 tokens procedentes de WikiText-2 y de Wikipedia en coreano, conservando el exponente compartido de cada bloque tal como lo fija el empaquetador de Tenstorrent. El autor indica que solo se cuantizó y evaluó el modelo de lenguaje, no la torre visual. El flujo de cuantización está implementado en el repositorio `tensix-bfp-gptq` e incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningún valor cambia al empaquetar las matrices en TT-NN.

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), aunque la torre visual no fue cuantizada ni evaluada en esta variante.
- Razonamiento y decodificación autoregresiva estándar a través de `transformers`.
- Módulo MTP (multi-token prediction) conservado en bf16, potencialmente útil para decodificación especulativa, aunque no se documenta su uso en esta ficha.
- Ejecución en NPUs Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de los pesos BFP8.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling, agentes, matemáticas o capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el checkpoint está pensado para cargarse en NPUs Wormhole o Blackhole con TT-NN, aprovechando que los pesos ya están en la rejilla BFP8 y evitando recuantización en el dispositivo. Es el escenario principal y el único validado por el autor, aunque solo en simulador.
- Servicio de chat multimodal en entornos con aceleradores Tensix: al conservar la torre visual en bf16 y el pipeline `image-text-to-text`, puede emplearse para responder preguntas sobre imágenes en un backend con NPUs Tenstorrent, siempre que se valide la calidad de la torre visual en producción.
- Investigación en cuantización por bloques: sirve como referencia reproducible para estudiar el impacto de GPTQ sobre la rejilla `bfloat8_b`, con scripts de verificación incluidos que permiten auditar que cada matriz empaquetada coincide bit a bit con el checkpoint.
- Evaluación comparativa de precisión BFP8 frente a bf16: al mantener embeddings, LM head y normalizaciones en bf16, permite aislar el efecto de cuantizar únicamente las proyecciones lineales en tareas de lenguaje.
- Prototipado en simulador: el flujo documentado con `ttsim` (ttnn 0.81.1) permite probar pipelines y políticas de precisión antes de disponer de hardware Blackhole, usando el demo `qwen38_27b_qb2` con una configuración `bfloat8_b` y `HiFi2`.
- Integración en pipelines de `transformers`: el quickstart con `AutoModelForCausalLM` y `device_map="auto"` permite usar el checkpoint en GPU convencional para comparar salidas contra el modelo base, ya que los tensores son bf16 legibles.
- Generación de código o matemáticas: no disponible en la información proporcionada; el autor no documenta evaluaciones de estas capacidades para esta variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que solo se cuantizó y evaluó el modelo de lenguaje, sin aportar métricas de calidad (perplejidad, MMLU, HumanEval u otras) ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: el repositorio ocupa 55,6 GB en safetensors; con carga en bf16 se requiere aproximadamente esa cifra, y el empaquetado BFP8 en Tensix reduce el peso de las proyecciones lineales a 30,96 GB.
- GPU recomendadas para el flujo `transformers`: no disponible; el autor no especifica GPU concretas. Por tamaño, un checkpoint de ~28.000 millones de parámetros en bf16 exige GPUs de 80 GB (A100, H100) o reparto multi-GPU.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; no se documentan pruebas en RTX 4090 u otras consumer.
- Hardware objetivo: NPUs Tensix de Tenstorrent (Wormhole, Blackhole). El demo `qwen38_27b_qb2` funciona en paralelismo de tensores sobre cuatro chips Blackhole (QuietBox 2) y rechaza otro hardware.
- Opciones de despliegue: `transformers` (GPU, bf16), TT-NN 0.81.1 sobre `ttsim` (simulador Blackhole) y demos de tt-metal v0.81.1 (`qwen38_27b_qb2` con política `bfloat8_b`/`HiFi2`, y `qwen36` para Qwen3.5/3.6). tt-forge (tt-xla) no se probó con este checkpoint y tt-transformers no soporta esta arquitectura.
- Latencia y throughput: no disponible. No se realizaron ejecuciones completas en hardware; solo se verificó el empaquetado exacto de las proyecciones de las capas 0 y 3 en el decodificador del demo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.6-27B-Tensix-BFP8 | 27.781 M | no disponible | BFP8 (GPTQ) + bf16 | Apache-2.0 | Hugging Face; validado en simulador Tensix |
| Qwen/Qwen3.6-27B (base) | 27.781 M (aprox., segun checkpoint derivado) | no disponible | bf16 | no disponible en la informacion | Hugging Face |
| Qwen3.8-27B (referencia del demo tt-metal) | no disponible | no disponible | bfloat4_b en el demo `qwen38_27b_qb2` | no disponible en la informacion | Demo en tt-metal v0.81.1 |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No validado en hardware real: las pruebas se hicieron con `ttsim` (simulador de Blackhole) y el autor no ejecutó el modelo de extremo a extremo en silicio Tensix.
- Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual queda en bf16 sin evaluación documentada, pese a que el pipeline declarado es `image-text-to-text`.
- El demo `qwen38_27b_qb2` de tt-metal empaqueta por defecto en `bfloat4_b`, lo que recuantiza estos pesos; es necesario aplicar una política `bfloat8_b` para respetar la precisión del checkpoint. Además, el LM head pasa a `bfloat8_b` en ese demo, por lo que el head bf16 no es exacto allí.
- El demo `qwen36` de tt-metal empaqueta siempre gate y up del MLP en `bfloat4_b`, por lo que no ejecuta este checkpoint a su precisión.
- tt-transformers no soporta esta arquitectura y tt-forge (tt-xla) no se probó con este checkpoint.
- Riesgo de degradación por cuantización: la calibración se limita a 65.536 tokens de WikiText-2 y Wikipedia en coreano; no se publican métricas de perplejidad ni de calidad frente al base.
- Idiomas soportados no documentados; el sesgo de calibración hacia coreano e inglés puede afectar al rendimiento en otras lenguas, incluido el castellano.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; no se documentan evaluaciones de seguridad o sesgo para esta variante.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.6-27B y de las dependencias de tt-metal.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-27B-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo tt-metal `qwen38_27b_qb2` (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Demo tt-metal Qwen3.5/3.6 (Blackhole, v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Licencia: https://huggingface.co/Xylolabs/Qwen3.6-27B-Tensix-BFP8/blob/main/LICENSE
