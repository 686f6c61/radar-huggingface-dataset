# SvalTek/ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF

## Resumen

ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF es un modelo de lenguaje de 8.953.803.264 parámetros (~8,95 B) publicado por el usuario SvalTek en Hugging Face, distribuido exclusivamente en formato GGUF para su uso con llama.cpp. El nombre del repositorio indica que se trata de un ajuste fino («ColdBrew») orientado a roleplay («RP_Base») sobre una base Qwen3.5, con una variante denominada «CharThink» que sugiere un modo de razonamiento interno aplicado a la interpretación de personajes. El repositorio incluye un fichero de proyector multimodal (`BF16-mmproj.gguf`) y la etiqueta `vision-language-model`, por lo que el modelo está preparado para entrada de imagen además de texto.

El modelo resuelve el caso de uso de personajes conversacionales con coherencia interna sostenida, empaquetado para inferencia local sin necesidad de GPU de datacenter. Al estar cuantizado en Q4_K_M y Q6_K, puede ejecutarse en GPUs de consumo, lo que lo hace relevante para prototipado de agentes conversacionales, videojuegos y narrativa interactiva en entornos con recursos limitados.

La relevancia actual es limitada pero concreta: se publicó el 28 de octubre de 2026 y en el momento de redactar esta ficha no registra descargas ni «likes», no declara licencia, no declara idiomas y no publica benchmarks ni longitud de contexto. Es, por tanto, un artefacto recién publicado y sin validación comunitaria, lo que condiciona cualquier evaluación de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre del repositorio indica una base Qwen3.5; no se detalla en la model card) |
| Parámetros totales | 8.953.803.264 (~8,95 B) |
| Parámetros activos | No disponible (no se indica que sea un MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (proyector multimodal `mmproj`), Q4_K_M y Q6_K |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp / llama-cpp) |
| Modalidad | Texto e imagen (etiqueta `vision-language-model` y fichero `mmproj`) |
| Herramienta de conversión | Unsloth |
| Compatibilidad de endpoints | Etiqueta `endpoints_compatible` (API compatible con OpenAI vía llama.cpp) |
| Tamaño del repositorio | 13,9 GB |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna más allá de la referencia a Qwen3.5 en el nombre del repositorio y de la presencia de un proyector multimodal en BF16, lo que implica un codificador visual conectado a un decodificador de lenguaje. No se detalla si el decodificador es un transformer denso o una variante híbrida, ni el número de capas, cabezas de atención o vocabulario.

Tampoco se documentan los datos de entrenamiento: no hay cifras de tokens, composición del dataset, ni mención a fases de RLHF, DPO o ajuste por preferencias. El único dato procedimental explícito es que la conversión a GGUF se realizó con Unsloth. El sufijo «RP_Base» indica un ajuste fino sobre datos de roleplay, y «CharThink» sugiere un esquema de razonamiento previo a la respuesta del personaje, pero ninguno de los dos aspectos está descrito técnicamente en la información disponible.

## Capacidades

- Generación de texto conversacional con orientación explícita a roleplay e interpretación de personajes.
- Entrada multimodal: procesamiento de imágenes junto a texto mediante el proyector `mmproj`, ejecutable con `llama-mtmd-cli`.
- Compatibilidad con plantillas de chat mediante el flag `--jinja` de llama.cpp.
- Posible modo de razonamiento interno asociado al sufijo «CharThink» (no documentado; debe validarse empíricamente).
- Despliegue como servidor con API compatible con OpenAI (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades de código, matemáticas o audio: no documentadas.

## Casos de uso

- **Prototipado local de personajes conversacionales**: con Q4_K_M el modelo ocupa aproximadamente 5,4 GB de pesos, por lo que puede ejecutarse en una RTX 3060 de 12 GB y permite iterar sobre personalidad y estilo sin coste de API.
- **Narrativa interactiva y ficción ramificada**: el ajuste «RP_Base» está orientado a mantener registro y voz de personaje en conversaciones multi-turno; útil para motores de diálogo en videojuegos o experiencias de ficción interactiva.
- **Diálogo con soporte de imagen**: gracias al proyector multimodal, un personaje puede comentar una captura, una ilustración o una foto aportada por el usuario, lo que habilita asistentes de museo, tutores con material visual o compañeros de juego que reaccionan a imágenes.
- **Generación de guiones y diálogos para equipos de contenido**: el modelo puede producir borradores de diálogo con una voz consistente y reescribirlos a partir de indicaciones de tono, útil en preproducción audiovisual.
- **Backend conversacional autoalojado**: mediante `llama-server` con API compatible con OpenAI, se integra como servicio interno sin dependencia de proveedores externos, siempre que se resuelva previamente la ambigüedad de licencia.
- **Investigación sobre ajustes fino de rol**: sirve como objeto de estudio para comparar el efecto de un fine-tune de personaje frente a la base Qwen3.5 en métricas de consistencia de personaje, repetitions y deriva de estilo.
- **Evaluación de robustez de cuantizaciones**: al publicar Q4_K_M y Q6_K junto a BF16, permite medir la degradación de calidad conversacional entre niveles de cuantización en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, ni comparaciones con la base Qwen3.5 o con otros ajustes de rol.

## Requisitos de hardware

Las cifras de VRAM son estimaciones calculadas a partir del número de parámetros y del esquema estándar de cada cuantización, no datos publicados por el autor.

| Cuantización | Peso aproximado de los pesos | VRAM estimada (contexto moderado) |
|---|---|---|
| Q4_K_M | ~5,4 GB | 6-8 GB |
| Q6_K | ~7,3 GB | 8-10 GB |
| BF16 (LM) + mmproj | ~17,9 GB + proyector | 20-24 GB |

- **GPU de consumo**: Q4_K_M cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; Q6_K requiere 12 GB o más con margen para el contexto.
- **GPU de datacenter**: A100 40/80 GB, H100 y L40S para BF16, serving concurrente o contextos largos.
- **CPU**: viable con Q4_K_M en llama.cpp con RAM suficiente (≥8 GB libres), a costa de latencia.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-mtmd-cli` para multimodal, `llama-server` para API), LM Studio, Ollama si se genera el manifiesto correspondiente; el soporte en vLLM o TGI no está confirmado para esta conversión GGUF.
- **Latencia y throughput**: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de sus model cards públicas y se incluyen como referencia de categoría; el modelo evaluado no publica métricas propias.

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF | 8,95 B | No disponible | Sí (`mmproj`) | No disponible | GGUF |
| Qwen2.5-7B-Instruct | 7,6 B | 32K (128K con YaRN) | No | Apache 2.0 | safetensors, GGUF |
| Llama-3.1-8B-Instruct | 8,0 B | 128K | No | Llama 3.1 Community | safetensors, GGUF |
| Gemma-2-9B-it | 9,2 B | 8K | No | Gemma Terms of Use | safetensors, GGUF |

Frente a estas alternativas, el modelo de SvalTek aporta especialización en rol y entrada de imagen, pero pierde en trazabilidad: no declara contexto, licencia ni idiomas, y carece de evaluación publicada. Para producción con requisitos de cumplimiento, las alternativas con licencia explícita son la opción conservadora.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no puede confirmarse el uso comercial; debe contactarse con el autor o asumir riesgo legal.
- **Sin benchmarks ni validación comunitaria**: 0 descargas y 0 «likes» en el momento de la ficha implican ausencia de evidencia externa sobre calidad o estabilidad.
- **Contexto desconocido**: no se puede planificar un caso de uso con prompts largos sin medir previamente el límite efectivo.
- **Idiomas no declarados**: no hay garantía de calidad en castellano ni de cobertura multilingüe; debe evaluarse empíricamente.
- **Sesgos del ajuste de rol**: un fine-tune de personaje tiende a priorizar coherencia narrativa sobre veracidad, lo que incrementa el riesgo de alucinación factual y de mezclar información ficticia con real.
- **Posible contenido no apto**: los ajustes de rol sin filtros declarados pueden generar contenido NSFW o sensible; requiere moderación en producción.
- **Modo «CharThink» no documentado**: si genera tokens de razonamiento, incrementa la latencia y el consumo de contexto; conviene medirlo.
- **Rendimiento degradado en tareas no creativas**: la especialización en diálogo puede reducir precisión en código, matemáticas o extracción estructurada frente a la base Qwen3.5.
- **Dependencia de llama.cpp**: el formato GGUF limita el uso de motores de serving de alto throughput sin conversión adicional.
- **Fecha de publicación futura en el registro**: el repositorio figura creado el 28 de octubre de 2026, dato a verificar si se cita externamente.

## Enlaces

- Hugging Face: https://huggingface.co/SvalTek/ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF
- Unsloth (herramienta de conversión citada): https://github.com/unslothai/unsloth
- llama.cpp (runtime indicado en la model card): https://github.com/ggml-org/llama.cpp

No se han encontrado en la información disponible papers, blogs, demos ni repositorios adicionales asociados a este modelo.
