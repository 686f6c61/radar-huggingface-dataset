# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged

## Resumen

szl-receiptagent-qwen35-0.8b-v2-merged es un modelo derivado publicado por SZLHOLDINGS que consiste en la fusión del adaptador LoRA ReceiptAgent v2 sobre el modelo multimodal Qwen3.5-0.8B de Unsloth. El artefacto es la forma "runtime" del adaptador: pesos completos en safetensors listos para cargar con transformers, sin necesidad de aplicar el adaptador PEFT por separado. Cuenta con 852.985.920 parámetros y una arquitectura Qwen3_5ForConditionalGeneration (texto más visión), aunque el repositorio no incluye los ficheros de preprocesado de imagen necesarios para cargar entradas visuales.

El modelo se presenta explícitamente como un artefacto de investigación "proposal-only", con doctrina interna v11-LOCKED y disposición de producción en HOLD. Su única evidencia declarada es una prueba de fidelidad de fusión: comparar las salidas greedy del adaptador original contra las del modelo fusionado sobre 5 prompts del propietario, con un resultado de 5/5 coincidencias exactas. No hay benchmarks de capacidad (MMLU, HumanEval, GSM8K) ni evaluación independiente.

Es relevante ahora como ejemplo de publicación gobernada y trazable: cada decisión (revisión base, hashes de dataset y scripts, estado de licencia) queda documentada en la model card y en el repositorio szl-forge. Para desarrolladores, sin embargo, su utilidad práctica es limitada: es un modelo de 0,85B en inglés, sin licencia en fichero y sin autorización de uso en producción según su propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal texto+visión, model_type qwen3_5) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32 según config.json) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 declarada en frontmatter; fichero LICENSE no disponible en el repositorio |
| Formato de pesos | safetensors (model.safetensors, 3.412.002.208 bytes) |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos: se parte de unsloth/Qwen3.5-0.8B en la revisión 23c69c53358a07516b5827588b3fdb12ae78fd65 y se integra el adaptador LoRA ReceiptAgent v2 en los pesos base, generando un checkpoint completo. La arquitectura subyacente es Qwen3.5, un transformer multimodal con configuración de texto y visión, registrada con transformers_version 5.17.0. Los pesos se almacenan en float32, lo que explica el tamaño de 3,4 GB para menos de mil millones de parámetros.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset del adaptador, ni si hubo RLHF o DPO. La única evidencia de calidad es la prueba de fidelidad de fusión: 5 prompts con plantilla de chat del propietario, generación greedy, comparación exacta entre adaptador y modelo fusionado, con resultado 5/5. Esa prueba no mide capacidad del modelo, solo que la fusión no alteró las salidas en ese conjunto reducido. El dataset, el script y el recibo están versionados con hashes SHA-256 en el repositorio szl-forge, pero la vinculación con la revisión del Hub figura como NOT_ESTABLISHED.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-0.8B.
- Procesamiento de entradas imagen-texto a nivel de arquitectura (image-text-to-text), aunque el repositorio no incluye preprocessor_config.json ni processor_config.json, por lo que las entradas de imagen no son cargables solo con este repositorio.
- Orientación declarada a tareas de "receipt agent" (procesamiento de recibos y documentos), sin evidencia de capacidad publicada más allá de la prueba de fidelidad.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre fusión de adaptadores LoRA: el modelo sirve como referencia reproducible para estudiar cómo se comporta un merge de adapter a pesos completos y comparar salidas greedy contra el adaptador original, dado que el autor publica scripts y hashes.
- Auditoría de publicaciones gobernadas: equipos que diseñan pipelines de publicación de modelos pueden usar la model card y los recibos de szl-forge como plantilla de trazabilidad (revisiones, hashes, estados de elegibilidad).
- Prototipado de agentes de recibos en inglés: con 0,85B parámetros, el modelo cabe en cualquier GPU consumer y permite iterar rápidamente sobre prompts de extracción de datos de recibos, siempre que se asuma que no hay benchmarks de capacidad que respalden su precisión.
- Evaluación comparativa de artefactos derivados: útil para verificar que un checkpoint fusionado reproduce el comportamiento del adaptador antes de desplegarlo en un pipeline interno.
- Docencia y experimentación con modelos multimodales pequeños: permite cargar un transformer texto+visión de menos de mil millones de parámetros en transformers 5.17.0 para estudiar su configuración interna, aunque la parte visual requiere ficheros de preprocesado ausentes.
- Pruebas de integración con transformers: sirve para validar que un entorno con transformers 5.17.0 carga correctamente arquitecturas qwen3_5 y plantillas de chat personalizadas (chat_template.jinja de 8.149 bytes).

## Benchmarks y rendimiento

Los únicos datos publicados son los del model-index del autor, que miden fidelidad de fusión, no capacidad:

| Benchmark | Metrica | Resultado | Verificado |
|---|---|---|---|
| ReceiptAgent v2 owner-run chat-template prompts (eval, 5 muestras) | Exact-match rate de salidas greedy (adaptador vs fusionado) | 1.0 (5/5) | No (verified: false) |
| ReceiptAgent v2 owner-run chat-template prompts (eval, 5 muestras) | Numero de salidas coincidentes | 5 | No (verified: false) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El propio autor declara `capability_benchmark: false` e `independent_evaluation: false`.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 3,4 GB, por lo que se necesitan al menos 4-5 GB de VRAM en FP32. En FP16 serían unos 1,7 GB y en cuantización de 4 bits alrededor de 0,5-1 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente para FP32; para mayor throughput, A100 o H100 si se sirve en lote.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas con 6-8 GB de VRAM o más.
- Opciones de despliegue: transformers (versión 5.17.0 según config.json) es la vía documentada. vLLM, llama.cpp, Ollama o TGI no están mencionados en la información disponible; la compatibilidad con ellos no está confirmada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Evidencia publicada | Disponibilidad |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-v2-merged | 852.985.920 | no disponible | apache-2.0 declarada (sin fichero LICENSE) | Solo fidelidad de fusión 5/5, no verificada | Pesos safetensors en Hugging Face |
| unsloth/Qwen3.5-0.8B (base) | ~0,8B | no disponible | según el repositorio base | Benchmarks del modelo base, no detallados aquí | Pesos en Hugging Face |
| SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2 (adaptador PEFT) | adaptador LoRA sobre 0,8B | no disponible | apache-2.0 declarada | Predecesor congelado, comparator | Pesos PEFT en Hugging Face |
| Familia ReceiptAgent 1.5B de SZLHOLDINGS | ~1,5B | no disponible | no disponible | no disponible | Repositorios de la organización SZLHOLDINGS |

## Limitaciones y advertencias

- El propio autor marca el artefacto como `proposal-only`, con `publication_eligible: false`, `autonomy_eligible: false` y `production_disposition: HOLD`. No está autorizado para uso en producción según su model card.
- La evidencia de calidad es mínima: 5 muestras, ejecución del propietario, sin verificación independiente y sin benchmark de capacidad. No permite inferir precisión en tareas reales de extracción de recibos.
- La vinculación entre los recibos de evaluación y la revisión concreta del Hub figura como NOT_ESTABLISHED.
- No hay fichero LICENSE en el repositorio; la licencia apache-2.0 solo consta en el frontmatter, lo que genera incertidumbre jurídica para uso comercial.
- Faltan preprocessor_config.json y processor_config.json: las entradas de imagen no son cargables solo con este repositorio, pese a la arquitectura multimodal.
- Idioma limitado al inglés; no hay evidencia de rendimiento en castellano u otros idiomas.
- Riesgo de alucinación inherente a un modelo de 0,85B sin ajuste documentado de alineamiento; no se dispone de datos sobre sesgos.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con documentos largos.
- El nombre del modelo base canónico del adaptador (Qwen/Qwen3.5-0.8B) difiere del usado en la fusión (unsloth/Qwen3.5-0.8B), y el autor declara `base_repos_byte_identical: UNKNOWN`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged
- Adaptador predecesor (v2 PEFT): https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2
- Modelo base de la fusión: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio de evidencia (szl-forge): https://github.com/szl-holdings/szl-forge
- Recibo de fidelidad de fusión: https://github.com/szl-holdings/szl-forge/blob/f7231bd0b604ed85b28d258e8c8d19b3d400f2b2/receiptagent-v2/qual_v2_salvage_receipt.20260913.json
- Registro candidato de la fusión: https://github.com/szl-holdings/szl-forge/blob/main/frontier/qwen35-receiptagent-v2-merged/candidate.json
- Organización en GitHub: https://github.com/szl-holdings
- Sitio de producto: https://a-11-oy.com
- Portal de pruebas: https://a11oy.net
