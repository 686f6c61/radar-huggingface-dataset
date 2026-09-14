# soyrsoyr/Qwen3.5-35B-A3B-FP8Dyn-MTP-BF16-pr3118-validation

## Resumen

Este repositorio no es un modelo nuevo, sino un artefacto de validación técnica publicado por el usuario soyrsoyr sobre el modelo base Qwen/Qwen3.5-35B-A3B. Contiene una versión del backbone cuantizada en FP8 con cuantización dinámica de activaciones (FP8Dyn) junto con la cabeza de predicción multi-token (MTP) copiada sin modificar en BF16. El objetivo declarado por el autor es demostrar que la carga del modelo y la generación con decodificación especulativa MTP funcionan de extremo a extremo en una H100, registrando métricas reales de tokens borrador (draft tokens), y no ofrecer un benchmark de calidad o rendimiento.

El modelo base es un transformer de tipo MoE (mezcla de expertos) con 35.505.251.456 parámetros totales, etiquetado internamente como `qwen3_5_moe_text` y con la convención de nomenclatura "A3B", que indica del orden de 3.000 millones de parámetros activos por token. El repositorio ocupa 38,5 GB, coherente con un backbone almacenado en FP8 (aproximadamente 35,5 GB solo en pesos) más la torre MTP en BF16. La licencia es Apache 2.0, heredada del modelo original.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para quien necesite validar el soporte de MTP (decodificación especulativa con el propio modelo como borrador) en vLLM con pesos comprimidos mediante `compressed-tensors` y `llm-compressor`. Fue creado el 14 de septiembre de 2026 y no registra descargas ni valoraciones, por lo que debe tratarse como una instantánea de trabajo y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), etiqueta de arquitectura `qwen3_5_moe_text` |
| Parámetros totales | 35.505.251.456 (35,5 B) |
| Parámetros activos | del orden de 3 B por token según la nomenclatura "A3B" del nombre; valor exacto no disponible |
| Longitud de contexto | no disponible (la configuración de prueba usa `--max-model-len 1024`) |
| Tipos de cuantización | Backbone en FP8 con cuantización dinámica (FP8Dyn) mediante `llm-compressor` / `compressed-tensors`; torre MTP en BF16 sin cuantizar. La model card menciona además los formatos NVFP4A16 (FP4 solo pesos, activaciones de 16 bits) y MXFP4 (cuantización dinámica de activaciones) para otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-35B-A3B; esta validación no añade concesión de licencia adicional) |
| Formato de pesos | safetensors (librería `transformers`), cuantización `compressed-tensors`; no se publican GGUF ni otros formatos |
| Modelo base | Qwen/Qwen3.5-35B-A3B (revisión 59d61f3ce65a6d9863b86d2e96597125219dc754) |
| Tamaño del repositorio | 38,5 GB |
| Pipeline | text-generation |
| Fecha de creación | 2026-09-14 |

## Arquitectura y entrenamiento

La información proporcionada no describe el entrenamiento del modelo base: no se indican número de tokens, composición del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Lo único verificable es la arquitectura: un transformer de mezcla de expertos (MoE) de 35,5 B de parámetros totales con aproximadamente 3 B activos, etiquetado como `qwen3_5_moe_text`, lo que sugiere una variante específicamente textual dentro de la familia Qwen3.5. La model card del repositorio de validación no aporta detalles sobre el enrutado de expertos, el número de expertos ni la estrategia de atención.

La innovación técnica relevante aquí es el formato MTP (multi-token prediction), que se conserva en BF16 de forma independiente al backbone cuantizado, y cuyo propósito es actuar como mecanismo de decodificación especulativa: el modelo predice tokens borrador que luego se verifican, reduciendo el coste por token generado. El autor subraya que "backbone y MTP son formatos separados" y que NVFP4A16 es cuantización FP4 solo de pesos con activaciones de 16 bits, no NVFP4 W4A4 calibrado. El pipeline de cuantización empleado es llm-compressor en el PR 3118 (commit `87347881` del fork `soyr-redhat/llm-compressor`), y la validación se ejecutó sobre vLLM `0.29.1rc1.dev79+g767d1c4d4`, Transformers `5.17.0` y CUDA 13.0. El script `verify_mtp.py` lanza dos prompts y exige métricas positivas de tokens borrador: una simple carga correcta del modelo no se considera un aprobado de MTP.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio y el pipeline `text-generation`.
- Decodificación especulativa mediante MTP, con la torre de predicción multi-token en BF16 y una configuración validada de `num_speculative_tokens: 1`.
- Inferencia con pesos cuantizados en FP8 y activaciones cuantizadas dinámicamente, servida a través de vLLM con backend `compressed-tensors`.
- Ámbito textual: el repositorio está construido sobre una variante de texto (`qwen3_5_moe_text`) y la orden de validación desactiva explícitamente las entradas multimodales (`--limit-mm-per-prompt '{"image":0,"video":0}'`), por lo que no se le atribuyen capacidades de visión o vídeo.
- Soporte de *tool calling* / *function calling*: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Modo de razonamiento explícito (*thinking*), audio o cualquier otra capacidad especial: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.

## Casos de uso

- Validación de decodificación especulativa con MTP: el repositorio existe precisamente para esto. Un equipo que integre decodificación especulativa basada en MTP en vLLM puede usar esta instantánea como referencia reproducible, ejecutando `verify_mtp.py` y comprobando que las métricas de tokens borrador son positivas antes de dar por buena una integración.
- Evaluación del impacto de la cuantización FP8 dinámica sobre un MoE: al mantener el backbone en FP8 y la torre MTP en BF16, permite aislar el efecto de la cuantización del resto del modelo y comparar la generación frente al modelo base en BF16.
- Desarrollo y depuración del soporte `compressed-tensors` en vLLM: sirve como caso de prueba real de un checkpoint comprimido con un PR concreto de llm-compressor, útil para reproducir incidencias de carga o de kernel.
- Pruebas de integración en CI de infraestructura de inferencia: el pipeline de validación (carga en H100, prompts fijos, comprobación de métricas) se puede adaptar como test de regresión para detectar roturas al actualizar versiones de vLLM, Transformers o CUDA.
- Estudio de presupuesto de memoria en GPU de 80 GB: con 38,5 GB de pesos, el repositorio permite medir con precisión cuánta VRAM queda disponible para caché KV y activaciones bajo distintas configuraciones de `gpu-memory-utilization`.
- Comparación de formatos de cuantización dentro de la misma familia: la model card cita variantes NVFP4A16 y MXFP4, por lo que esta instantánea FP8 puede emplearse como punto de referencia en un estudio comparativo de precisión, memoria y latencia entre formatos.
- Base para re-cuantización con llm-compressor: al estar generado con un PR concreto, es un punto de partida razonable para experimentar con otras recetas de cuantización sobre el mismo modelo base.
- Docencia o formación interna sobre MoE y decodificación especulativa: un checkpoint de 38,5 GB con MTP explícito resulta un ejemplo didáctico tangible de arquitectura MoE con *draft model* integrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la validación realizada "no es un benchmark de calidad ni de rendimiento": únicamente certifica que la carga en H100 y la generación con MTP funcionan y que se registran métricas reales de tokens borrador. No se proporcionan valores de MMLU, HumanEval, GSM8K, throughput ni latencia.

## Requisitos de hardware

- Peso en disco: 38,5 GB (instantánea completa en safetensors).
- VRAM mínima estimada para los pesos: en torno a 35,5 GB para el backbone FP8 más la torre MTP en BF16.
- VRAM total recomendada: 80 GB, con `--gpu-memory-utilization 0.85` (unos 68 GB utilizables) deja margen suficiente para caché KV y activaciones. La configuración validada usa `--max-model-len 1024`, es decir, contexto muy corto y por tanto caché KV mínima.
- GPU recomendadas: H100 80 GB (configuración efectivamente validada), A100 80 GB, H200 y GPUs profesionales de 80 GB o más.
- GPU de 48 GB (RTX 6000 Ada, L40S, A6000): posible en teoría con contexto muy reducido y `gpu-memory-utilization` alto, pero no validado y con riesgo de OOM.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) de forma individual. Sería necesario repartir el modelo entre dos GPUs de consumo, opción no validada por el autor.
- Opciones de despliegue: vLLM (`0.29.1rc1.dev79+g767d1c4d4` es la versión validada) con backend `compressed-tensors` y `--dtype bfloat16 --enforce-eager`; Transformers `5.17.0`; CUDA `13.0`. No se publican pesos GGUF, por lo que llama.cpp, Ollama y LM Studio no son opciones directas. La compatibilidad con MXFP4 requiere validación propia en B200 según el autor.
- Decodificación especulativa: se activa con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`.
- Latencia, throughput y tasa de aceptación de tokens borrador: no disponibles; la model card no publica cifras, solo indica que deben ser positivas para considerar la validación superada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Formato y cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soyrsoyr/Qwen3.5-35B-A3B-FP8Dyn-MTP-BF16-pr3118-validation | 35,5 B / ~3 B activos | no disponible | safetensors, FP8 dinámico + MTP BF16 | Apache 2.0 | Repositorio público, 0 descargas, 0 valoraciones |
| Qwen/Qwen3.5-35B-A3B (base) | 35,5 B / ~3 B activos según nomenclatura; dato exacto no disponible | no disponible | safetensors en BF16 (formato original) | Apache 2.0 | Modelo base publicado por Qwen |
| Variantes NVFP4A16 y MXFP4 del mismo modelo base | mismas que el base | no disponible | NVFP4A16 (FP4 solo pesos, activaciones 16 bits) y MXFP4 (cuantización dinámica de activaciones) | Apache 2.0 | Mencionadas en la model card; detalles no disponibles |
| Qwen3-30B-A3B (generación anterior, referencia externa) | 30,5 B / 3,3 B activos | 128 K | safetensors, BF16 y múltiples cuantizaciones de la comunidad | Apache 2.0 | Ampliamente disponible |

Nota: la fila de Qwen3-30B-A3B procede de conocimiento público general sobre la generación anterior de la familia y no ha podido verificarse con la búsqueda web proporcionada, cuyos resultados no guardaban relación con el modelo (contenido sobre la competición de fitness HYROX). No se dispone de datos comparativos de rendimiento entre estos modelos en la información facilitada.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un artefacto de validación creado y actualizado el mismo día (14 de septiembre de 2026), sin descargas ni valoraciones, y sin garantía de mantenimiento.
- No aporta ninguna evaluación de calidad: el propio autor advierte que la prueba superada no es un benchmark de calidad ni de rendimiento. No hay datos de precisión frente al modelo base en BF16, por lo que se desconoce la degradación introducida por la cuantización FP8 dinámica.
- Riesgo de alucinación: no evaluado en la información disponible, pero es un riesgo inherente a cualquier LLM generativo y no se han publicado mediciones de fiabilidad.
- Idiomas soportados: no declarados. Se desconoce el comportamiento fuera del inglés y del chino, idiomas habituales en la familia Qwen.
- Longitud de contexto: no declarada, y la validación se hizo con `--max-model-len 1024`. No hay evidencia de que el modelo funcione correctamente con ventanas largas.
- Compatibilidad de runtime frágil: la validación depende de una build concreta de vLLM (`0.29.1rc1.dev79+g767d1c4d4`), Transformers `5.17.0` y CUDA `13.0`, más un PR específico de llm-compressor. Cambios de versión pueden romper la carga o la decodificación especulativa.
- Sesgos: no evaluados ni documentados en la información disponible. Al heredar el comportamiento del modelo base, arrastra los sesgos de sus datos de entrenamiento, que no se detallan.
- Licencia: Apache 2.0 permite uso comercial, pero se mantiene la licencia del modelo original y esta validación no concede derechos adicionales. Conviene revisar la model card y la licencia de Qwen/Qwen3.5-35B-A3B antes de un despliegue comercial.
- Requisitos de hardware elevados: 38,5 GB de pesos implican GPUs de 80 GB para un funcionamiento cómodo, lo que excluye el despliegue en hardware de consumo.
- Alcance textual: aunque el modelo base pudiera tener componentes multimodales, esta instantánea es de texto y la orden de validación desactiva imagen y vídeo explícitamente.
- Búsqueda web sin resultados útiles: los enlaces recuperados no estaban relacionados con el modelo, por lo que no se ha podido contrastar información externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/Qwen3.5-35B-A3B-FP8Dyn-MTP-BF16-pr3118-validation
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Revisión concreta del modelo base usada como origen: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/tree/59d61f3ce65a6d9863b86d2e96597125219dc754
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Commit de llm-compressor PR 3118: https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos correspondían a la competición de fitness HYROX y no guardan relación con esta ficha.
