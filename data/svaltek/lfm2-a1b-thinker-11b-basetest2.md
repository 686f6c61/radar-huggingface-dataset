# SvalTek/LFM2-A1B-Thinker-11b-BaseTest2

## Resumen

SvalTek/LFM2-A1B-Thinker-11b-BaseTest2 es un ajuste fino (finetune) en FP16 del modelo SvalTek/LFM2-A1B-Thinker-11b-BaseTest, desarrollado por el usuario SvalTek y publicado bajo licencia Apache 2.0. Se trata de un modelo de generación de texto con arquitectura `lfm2_moe` (mezcla de expertos de la familia LFM2), con 11.280.732.096 parámetros totales según los pesos en safetensors. El repositorio ocupa 22,6 GB y se distribuye en formato transformers con pesos safetensors.

El modelo se presenta como una variante conversacional orientada a razonamiento ("Thinker") y está etiquetado únicamente para el idioma inglés. La model card es mínima: no documenta el proceso de entrenamiento, los datos utilizados, la longitud de contexto, el número de parámetros activos ni resultados de benchmarks. El autor indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, con una aceleración declarada de 2x respecto a un entrenamiento convencional.

Su relevancia actual es limitada y fundamentalmente experimental: se trata de un finetune comunitario sin validación publicada, con cero descargas y cero likes en el momento de la consulta, y sin información técnica verificable más allá de los metadatos del repositorio. Resulta útil como caso de estudio de pipelines de finetuning con Unsloth sobre arquitecturas MoE, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_moe (mezcla de expertos, familia LFM2) |
| Parametros totales | 11.280.732.096 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura declarada es `lfm2_moe`, una variante de mezcla de expertos de la familia LFM2. No se dispone de información sobre el número de expertos, la estrategia de enrutamiento, la dimensión de las capas ni el número de parámetros activos por token. El modelo es un finetune del checkpoint SvalTek/LFM2-A1B-Thinker-11b-BaseTest, que a su vez actúa como base; no se documenta si ese modelo base es un preentrenamiento desde cero o un finetune de un modelo LFM2 publicado por otro autor.

El entrenamiento se realizó con Unsloth y TRL, según la model card, y el resultado se publicó en precisión FP16. No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF, DPO o SFT supervisado, ni detalles sobre la estrategia de alineación. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Toda la información sobre el proceso de entrenamiento más allá de las herramientas empleadas está ausente.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Orientación a razonamiento ("Thinker" en el nombre), aunque no se documenta un modo de pensamiento explícito ni formato de cadena de pensamiento.
- Compatibilidad con el pipeline `text-generation` de transformers y con text-generation-inference (TGI), según las etiquetas.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma; no se documentan otros idiomas.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Experimentación con finetuning de arquitecturas MoE: el modelo sirve como referencia para reproducir un pipeline de ajuste con Unsloth y TRL sobre un checkpoint LFM2 MoE de 11B, comparando el resultado FP16 con el modelo base.
- Evaluación comparativa de finetunes comunitarios: útil en entornos de investigación para medir la deriva de comportamiento entre un modelo base y su finetune conversacional en inglés.
- Generación de texto conversacional en inglés en prototipos internos: puede emplearse para validar integraciones con transformers y TGI antes de sustituirlo por un modelo con benchmarks publicados.
- Pruebas de despliegue en infraestructura de inferencia: al ser compatible con TGI y safetensors, permite validar pipelines de serving y cuantización sobre una arquitectura MoE de 11B.
- Estudio de licencias y trazabilidad de modelos derivados: con licencia Apache 2.0 y un base_model declarado, es un caso práctico para analizar cadenas de derivación en el ecosistema Hugging Face.
- Docencia sobre modelos de mezcla de expertos: sirve para ilustrar las diferencias entre parámetros totales y activos, aunque el autor no publique estos últimos y haya que inferirlos del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 22,6 GB solo para los pesos (11,28B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24-32 GB de VRAM para contexto corto.
- Cuantización a 8 bits: en torno a 11-12 GB de VRAM para pesos, más overhead; a 4 bits, en torno a 6-7 GB para pesos. No se han publicado cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la información disponible.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para FP16 sin compromisos; RTX 4090 (24 GB) puede alojar los pesos en FP16 pero con margen muy ajustado para contexto y batch.
- GPU de consumo: posible en RTX 4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 12-16 GB solo mediante cuantización, que no está publicada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (TGI) y endpoints compatibles según las etiquetas. No se confirma soporte de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de parámetros activos del modelo, por lo que la comparación cuantitativa con alternativas de la misma categoría no es posible con rigor. Se indican a continuación referencias cualitativas basadas en información pública de cada familia, no en mediciones de este modelo.

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SvalTek/LFM2-A1B-Thinker-11b-BaseTest2 | 11,28B | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Modelos LFM2 oficiales (familia Liquid AI) | variable según variante | no disponible en esta ficha | según variante | Hugging Face |
| Mistral 7B Instruct | 7,2B | 32k (v0.2/v0.3) | Apache 2.0 | Hugging Face, amplia adopción |
| Qwen2.5 7B Instruct | 7,6B | 128k | Apache 2.0 (mayoría de variantes) | Hugging Face, amplia adopción |

La comparación con Mistral 7B o Qwen2.5 7B es solo orientativa en cuanto a tamaño y licencia; no hay datos de rendimiento de este finetune que permitan establecer una equivalencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de calidad, razonamiento ni fidelidad conversacional.
- Model card mínima: no se documentan datos de entrenamiento, contexto, parámetros activos ni proceso de alineación, lo que impide evaluar sesgos o riesgos de forma rigurosa.
- Riesgo de alucinación desconocido y no mitigado por documentación de RLHF/DPO.
- Idioma limitado al inglés según la etiqueta del repositorio; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Modelo con cero descargas y cero likes: sin validación por parte de la comunidad ni reportes de uso.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de documentación técnica hace desaconsejable su uso en producción sin una evaluación propia exhaustiva.
- El nombre del modelo incluye "BaseTest2", lo que sugiere un carácter experimental y no una versión estable.
- No se han publicado cuantizaciones oficiales, lo que limita su despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SvalTek/LFM2-A1B-Thinker-11b-BaseTest2
- Modelo base: https://huggingface.co/SvalTek/LFM2-A1B-Thinker-11b-BaseTest
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de text-generation-inference: https://github.com/huggingface/text-generation-inference
