# unconst/Affine-5czsc2fc98-r683-r252-odpo-midrank-hibeta-shortctx-ultraextra-ep3-lolr-merged

## Resumen

Affine-5czsc2fc98-r683-r252-odpo-midrank-hibeta-shortctx-ultraextra-ep3-lolr-merged es un checkpoint de la familia Affine, desarrollado por el usuario unconst como parte de un pipeline de minería para una red descentralizada (probablemente Bittensor). Se trata de un fine-tuning del modelo base `unconst/Affine-5czsc2fc98-r252-merged` mediante *offline DPO* (Direct Preference Optimization) sobre pares de duelos clasificados por una métrica interna llamada Reason v4. El modelo está diseñado exclusivamente como *challenger* para el protocolo de evaluación Reason v4, no como un modelo de chat o generación de propósito general.

Según las etiquetas de HuggingFace, el modelo usa una arquitectura de tipo `qwen3_5_moe` (mezcla de expertos) y soporta entrada imagen-texto, aunque no se proporcionan detalles adicionales sobre la arquitectura interna. El checkpoint tiene 35.107.181.936 parámetros (~35,1 mil millones) y se distribuye en 16 shards de safetensors, con un tamaño total de repositorio de 70,2 GB. La licencia declarada es Apache 2.0, pero la model card indica que se rige por la política de artefactos de minería Affine, lo que puede imponer restricciones adicionales.

El entrenamiento se realizó con LoRA (r=32, α=128), un β de 0,3, una tasa de aprendizaje de 1e-6, longitud máxima de 6144 tokens y 7200 pasos (3 épocas) sobre un subconjunto filtrado de pares de preferencia. La evaluación local frente al *king* vigente (reign 34) mostró una ventaja marginal de +0,002137 con un error estándar de 0,000943 (z=2,27, n=79), lo que llevó a declarar el checkpoint como ganador (WIN) y licenciado para la etapa 5. No se han publicado resultados de benchmarks estándar como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `qwen3_5_moe`), posiblemente multimodal imagen-texto (tag `image-text-to-text`); detalles no disponibles |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (max_len de entrenamiento: 6144 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con política adicional de artefactos de minería Affine) |
| Formato de pesos | safetensors (16 shards, 70,2 GB) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. Las etiquetas de HuggingFace indican `qwen3_5_moe`, lo que sugiere una arquitectura de mezcla de expertos basada en la familia Qwen 3.5, y `image-text-to-text`, que apunta a capacidades multimodales. Sin embargo, no se especifican detalles como el número de expertos, la dimensión oculta o el mecanismo de atención.

El entrenamiento de este checkpoint es un fine-tuning mediante *offline DPO* (no SFT ni GRPO online) sobre pares de duelos generados a partir de un dataset llamado `dpo_duel_reason.jsonl`. La preferencia se calcula con una métrica interna llamada Reason v4, que utiliza una media log-exp temperada (τ=0.03) sobre k=3 referencias de profesor. El objetivo era optimizar pensamientos que aumenten la puntuación Reason del lado del profesor, penalizando el *filler* (contenido irrelevante). Los hiperparámetros clave fueron LoRA r=32, α=128, β=0.3, lr=1e-6, max_len=6144, max_steps=7200 y epochs=3. El entrenamiento se realizó en GPUs B200 (8×), con dos GPUs dedicadas a entrenamiento y fusión, y otras dos para servir al *challenger* durante la evaluación.

## Capacidades

- Generacion de texto: el modelo genera texto, pero está optimizado para producir pensamientos (reasoning traces) que maximicen la métrica Reason v4, no para conversación general.
- Razonamiento multi-paso: la métrica Reason valora la coherencia y utilidad de los razonamientos intermedios; el modelo está entrenado para emitir pensamientos con una mediana de 172 tokens (filtro de calidad ≥80).
- No se documentan capacidades de tool calling, function calling, agentes, visión (a pesar del tag `image-text-to-text`) ni soporte multilingüe.
- Uso restringido: la model card indica explícitamente que no es un modelo de chat general, sino una sumisión para el minero SN120 en el protocolo Reason v4.

## Casos de uso

- Participacion en la red Affine como minero: el modelo actúa como *challenger* en duelos de evaluación contra el *king* vigente, generando respuestas que deben superar un umbral de calidad (p. ej., B pass ≥0.30 y mediana de pensamiento ≥80).
- Evaluacion de razonamiento en entornos de investigacion: puede servir como referencia para estudiar técnicas de DPO offline sobre métricas de razonamiento no estándar.
- Experimentacion con fine-tuning LoRA sobre modelos MoE de ~35B: el checkpoint demuestra un flujo de entrenamiento reproducible (offline DPO con filtrado de pares) que puede adaptarse a otros dominios.
- Benchmark interno de protocolos de minería: útil para desarrolladores que trabajen en la infraestructura de la red Affine y necesiten validar la calidad de los modelos candidatos.
- Analisis de preferencias con múltiples referencias: el uso de k=3 profesores y la media log-exp puede interesar a investigadores de alignment.
- No se recomienda su uso en aplicaciones de producción generales (chatbots, generación de código, atención al cliente) por su naturaleza especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación documentada es la comparación local contra el *king* vigente (reign 34) bajo el protocolo Reason v4:

| Metrica | Valor |
|---|---|
| Margen (vs. king) | +0.002137 |
| Error estandar (SE) | 0.000943 |
| Estadistico z | 2.27 |
| Numero de muestras (n) | 79 |
| Mediana de pensamiento | 172 tokens |
| Tasa de aprobado B | 0.304 |
| Umbral de decision | max(2·SE, δ=0.002) = 0.002 |
| Decision | WIN / Stage-5 licensed |

Estos resultados son específicos del protocolo interno y no comparables con benchmarks académicos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 35,1 B parámetros en FP16 se necesitarían aproximadamente 70 GB de VRAM (más overhead de activaciones). Con cuantización de 8 bits (~35 GB) o 4 bits (~18 GB) podría caber en GPUs de consumo como RTX 4090 (24 GB), pero no hay datos oficiales.
- GPU recomendadas: el entrenamiento se realizó en NVIDIA B200 (8×); para inferencia se requieren GPUs de alta gama tipo A100 (80 GB), H100 (80 GB) o B200 si se usa FP16.
- Compatibilidad con consumer GPU: posible solo con cuantización agresiva (4-bit) en GPUs de 24 GB, aunque no está verificado.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay configuraciones documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro del ecosistema Affine. El checkpoint es un eslabón en una cadena de experimentos (R659, R622, R679, R653, R658, etc.) pero no se proporcionan métricas estándar que permitan compararlo con otros modelos de propósito general de tamaño similar (p. ej., Qwen2.5-32B, Mixtral-8x22B). La comparativa queda limitada a la evaluación interna contra el *king* de la red, cuyos detalles no son públicos.

## Limitaciones y advertencias

- No es un modelo de chat general: la model card lo declara explícitamente como una sumisión para minería en el protocolo Reason v4; su uso fuera de ese contexto no está soportado.
- Licencia condicionada: aunque la licencia declarada es Apache 2.0, la política de artefactos de minería Affine puede imponer restricciones adicionales sobre el uso comercial o la redistribución.
- Sesgos y alucinaciones: no hay información sobre sesgos, y al estar entrenado para maximizar una métrica interna, puede producir razonamientos que no sean factualmente correctos.
- Contexto limitado: la longitud máxima de entrenamiento es 6144 tokens, lo que limita su capacidad para tareas de contexto largo.
- Idiomas: no se especifican idiomas soportados; probablemente esté limitado al inglés u otros idiomas presentes en los datos de entrenamiento, que no se describen.
- Reproducibilidad: los datos de entrenamiento (dataset `dpo_duel_reason.jsonl`) no son públicos, lo que dificulta replicar el experimento.
- Riesgo de obsolescencia: al ser un *challenger* en una red en evolución, su validez puede caducar cuando el *king* cambie o el protocolo se actualice (p. ej., cambio de `weight_version_key`).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r683-r252-odpo-midrank-hibeta-shortctx-ultraextra-ep3-lolr-merged
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- Otro checkpoint relacionado (R570): https://huggingface.co/unconst/Affine-5czsc2fc98-r570-r252-odpo-midrank-longctx-ultraextra-merged
- Modelo R67 (referencia): https://huggingface.co/unconst/Affine-5czsc2fc98-r67-merged
