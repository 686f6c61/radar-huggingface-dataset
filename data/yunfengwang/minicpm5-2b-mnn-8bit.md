# yunfengwang/MiniCPM5-2B-MNN-8bit

## Resumen

MiniCPM5-2B-MNN-8bit es una conversión y cuantización a 8 bits del modelo openbmb/MiniCPM5-2B, publicada por el usuario yunfengwang en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una exportación al formato MNN (el motor de inferencia de Alibaba) con cuantización weight-only de 8 bits, pensada específicamente para inferencia en dispositivo (on-device / edge) y para el backend Metal de Apple Silicon. El repositorio ocupa 2,8 GB e incluye el grafo de cálculo, los pesos cuantizados, los embeddings en bf16 y los ficheros de configuración para CPU y GPU.

La arquitectura del modelo base es un transformer denso estándar de tipo LlamaForCausalLM, con 42 capas, dimensión oculta de 2048 y una ventana de contexto máxima de 131072 tokens (128K). El nombre comercial del modelo base indica un tamaño de aproximadamente 2000 millones de parámetros. El interés de esta ficha concreta reside en que funciona como versión de alta precisión de la variante de 4 bits del mismo autor, y la propia model card documenta diferencias cualitativas medibles entre ambas: el 4bit falla en razonamiento multi-paso largo y generación de código, mientras que el 8bit los resuelve correctamente a costa de duplicar el peso en disco y reducir la velocidad de decodificación aproximadamente a la mitad.

Es una publicación de nicho: a fecha de los metadatos acumula 15 descargas y 0 likes, y no incluye resultados de benchmarks estándar (MMLU, GSM8K, HumanEval) ni detalles de entrenamiento del modelo base. Su utilidad práctica está acotada a desarrolladores que ya trabajan con MNN y necesitan un modelo de 2B que quepa en memoria unificada de Apple Silicon manteniendo capacidad de razonamiento multi-paso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, LlamaForCausalLM (42 capas, hidden size 2048) |
| Parámetros totales | ~2 mil millones (según la denominación del modelo base MiniCPM5-2B; no se publica desglose exacto) |
| Parámetros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | 131072 tokens (max_position_embeddings) |
| Tipos de cuantización | int8 weight-only (quant_bit=8, quant_block=128, sym=true); embeddings en bf16 (embed_bit=16) |
| Idiomas soportados | no disponible (la model card está redactada en chino; no declara lista oficial de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | MNN (llm.mnn + llm.mnn.weight), embeddings_bf16.bin, tokenizer.mtok; no se distribuyen safetensors ni GGUF en este repositorio |
| Tamaño del repositorio | 2,8 GB |
| Tamaño de pesos cuantizados | ~2,29 GB (llm.mnn.weight) + ~535 MB (embeddings_bf16.bin) |
| Modelo base | openbmb/MiniCPM5-2B |
| Pipeline | text-generation |
| Descargas / likes | 15 / 0 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es una exportación del checkpoint openbmb/MiniCPM5-2B, cuya arquitectura se describe en la model card como un `LlamaForCausalLM` estándar: 42 capas, dimensión oculta 2048 y `max_position_embeddings` de 131072. No hay innovaciones arquitectónicas propias de esta ficha: la modificación consiste exclusivamente en la conversión de formato y la cuantización. La exportación se realizó con el script `llmexport.py` del directorio `MNN/transformers/llm/export`, con los parámetros `--quant_bit 8 --quant_block 128 --sym --lm_quant_bit 8 --lm_quant_block 128 --embed_bit 16`. Es decir, cuantización simétrica de 8 bits con bloques de 128 elementos para las capas lineales, manteniendo los embeddings en bf16 para preservar precisión en la capa de entrada.

No se proporciona información sobre el entrenamiento del modelo base en la documentación disponible: ni número de tokens, ni composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta el uso de decodificación especulativa, atención lineal ni mecanismos híbridos. La única innovación reseñable documentada es de carácter práctico: la comparación controlada 4bit frente a 8bit sobre el mismo pipeline de exportación, que aísla el efecto de la precisión de cuantización sobre tareas de razonamiento.

## Capacidades

- Generación de texto conversacional y de respuestas a preguntas estructuradas (la model card verifica respuestas correctas en preguntas de conocimiento estructurado, por ejemplo sobre la fotosíntesis).
- Razonamiento multi-paso y resolución de problemas verbales de matemáticas: con 8 bits resuelve correctamente un problema de tres conductos de llenado de depósito (resultado: 3 horas), tarea en la que la versión de 4 bits entra en bucle degenerado.
- Generación de código: produce una función completa de validación de paréntesis (`is_valid`) con análisis de complejidad y casos de prueba. Con 4 bits esta tarea no converge sin penalizaciones agresivas.
- Aritmética de precisión media: calcula correctamente 17×24 = 408.
- Traducción: capacidad presente pero limitada; la model card reporta traducciones literales y alucinaciones en detalles de referencias culturales.
- Ejecución en dispositivo con dos backends documentados: CPU (config.json) y GPU Metal de Apple Silicon (config_metal.json).
- Soporte de plantilla de chat definida en llm_config.json.
- No se documenta soporte de tool calling, function calling, uso agéntico, visión, audio ni modo de razonamiento explícito (thinking mode), aunque el uso observado de etiquetas `<think>` en la comparativa sugiere que la plantilla de chat del modelo base incluye un bloque de razonamiento intermedio.

## Casos de uso

- Razonamiento multi-paso en local sobre Mac: aplicaciones de escritorio que necesitan resolver problemas aritméticos encadenados o de lógica sin conexión a red. El 8bit es la elección obligada aquí, porque el 4bit del mismo autor falla de forma reproducible en estas tareas.
- Asistente de código embebido: integración en editores o herramientas de desarrollo para Mac que generen funciones pequeñas, análisis de complejidad y casos de prueba. La model card valida este escenario con la función `is_valid`.
- Chat de conocimiento general offline: asistentes de documentación o ayuda integrados en aplicaciones nativas donde se requiere una ventana de contexto amplia (hasta 128K tokens) para incorporar manuales o bases de conocimiento extensas.
- Traducción asistida con revisión humana: dado que la model card documenta traducciones literales y alucinaciones en referencias culturales, el uso realista es como borrador previo a revisión, no como traductor de producción.
- Preprocesado de texto en pipelines on-device: resumen, reformateo y extracción de respuestas estructuradas a partir de documentos, aprovechando que el modelo no envía datos a servidores externos.
- Evaluación comparativa de cuantizaciones: este repositorio funciona como referencia de alta precisión frente a la variante de 4 bits, útil para medir la degradación introducida por la cuantización en un modelo de 2B antes de decidir el despliegue.
- Prototipado rápido en Apple Silicon: gracias a la decodificación de ~37 tok/s en backend Metal, sirve para validar ideas de producto sin depender de infraestructura GPU en la nube.
- Aplicaciones móviles basadas en MNN: aunque la model card documenta explícitamente el backend CPU y Metal, MNN es un motor orientado a dispositivo, por lo que el formato es reutilizable en otros entornos MNN, siempre con validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, etc.) en la información disponible. La model card únicamente incluye una comparación cualitativa controlada entre la variante de 4 bits y la de 8 bits, con la misma configuración de muestreo y el mismo backend (Apple Silicon / Metal):

| Tarea | 4bit | 8bit |
|---|---|---|
| Problema verbal multi-paso (tres conductos de llenado) | Falla: bucle repetitivo con todas las configuraciones de muestreo | Resuelve correctamente (3 horas) |
| Generación de código (validación de paréntesis `is_valid`) | Parcial: no genera código por defecto, requiere penalización fuerte | Completa y correcta (código + complejidad + casos de prueba) |
| Aritmética media (17×24) | Correcto (408) | Correcto (408) |
| Pregunta de conocimiento estructurado (fotosíntesis) | Correcto | Correcto |
| Traducción con referencias culturales | Parcial: traducción literal | Parcial: traducción literal, con alucinación en detalles del referente cultural |

Rendimiento medido en Apple Silicon con backend Metal:

| Métrica | Valor |
|---|---|
| Decodificación (decode, 8bit) | ~37 tok/s |
| Decodificación (decode, 4bit, comparativa) | ~57–96 tok/s |
| Prefill | No se publica cifra estable; la model card indica que varía mucho según caché en frío y ajustes |

## Requisitos de hardware

- VRAM/RAM para pesos: ~2,29 GB de pesos int8 más ~535 MB de embeddings en bf16, lo que suma aproximadamente 2,8 GB solo en pesos.
- Caché KV: no se documenta si el modelo usa GQA. Con 42 capas y hidden 2048 en fp16, el cálculo sin GQA da aproximadamente 344 KB por token, es decir, unos 1,4 GB a 4K tokens, unos 11 GB a 32K tokens y unos 44 GB a 128K tokens. Estas cifras son estimaciones derivadas de la arquitectura declarada; un esquema GQA las reduciría de forma proporcional al ratio de cabezas KV.
- Presupuesto práctico: alrededor de 3–4 GB de memoria total para contextos cortos, y bastante más para contextos largos.
- Cabe en GPU consumer: sí, con contexto corto, en cualquier GPU con 4 GB o más (RTX 3050 6 GB, RTX 4060 8 GB, etc.). El escenario objetivo declarado es memoria unificada de Apple Silicon, donde basta con un Mac de 8 GB en adelante para contextos moderados.
- GPUs de centro de datos: el modelo es demasiado pequeño para justificar A100 o H100; estas solo tendrían sentido para servir muchas réplicas concurrentes o contextos muy largos.
- Opciones de despliegue: el método documentado es MNN mediante `llm_demo`, compilado con `MNN_BUILD_LLM=ON` y `MNN_METAL=ON`; se ejecuta con `./llm_demo config_metal.json` (GPU Metal) o `./llm_demo config.json` (CPU). No se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio, ya que el formato de pesos es MNN y no GGUF ni safetensors.
- Latencia y throughput: ~37 tok/s de decodificación en 8bit sobre Apple Silicon con Metal, aproximadamente la mitad que la variante de 4 bits (~57–96 tok/s).
- Nota operativa: las rutas de `llm.mnn`, `llm.mnn.weight` y `tokenizer.mtok` en los ficheros `config*.json` son relativas y MNN las resuelve respecto al directorio del fichero de configuración, por lo que hay que ejecutar el binario desde el directorio del repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Velocidad decode (Metal) | Licencia | Formato |
|---|---|---|---|---|---|---|
| yunfengwang/MiniCPM5-2B-MNN-8bit | ~2B | 131072 | int8 weight-only, block 128, simétrica; embeddings bf16 | ~37 tok/s | apache-2.0 | MNN |
| yunfengwang/MiniCPM5-2B-MNN-4bit | ~2B | 131072 | int4; resto de parámetros de exportación idénticos | ~57–96 tok/s | no disponible en la información | MNN |
| openbmb/MiniCPM5-2B (base) | ~2B | 131072 | precisión completa (bf16, presumiblemente) | no disponible | no disponible en la información | no disponible en la información |

La diferencia relevante entre las dos primeras no es de tamaño ni de contexto, sino de fidelidad en razonamiento: el 8bit elimina la degradación por repetición del 4bit en tareas multi-paso y de código, a cambio de duplicar el peso en disco (2,29 GB frente a 1,16 GB) y perder aproximadamente la mitad del throughput. No se dispone de datos de benchmarks estándar que permitan comparar con otros modelos de 2B de la competencia.

## Limitaciones y advertencias

- Resultados de benchmarks estándar no publicados: no hay MMLU, GSM8K ni HumanEval que permitan situar el modelo frente a alternativas.
- Adopción muy baja: 15 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- La cuantización int8 weight-only introduce pérdida de precisión respecto al modelo base en bf16. No se documenta la magnitud de esa pérdida frente al checkpoint original, solo frente a la variante de 4 bits.
- Los embeddings se mantienen en bf16 por diseño, lo que añade 535 MB al consumo de memoria y no se puede reducir sin reexportar.
- Limitaciones de conocimiento propias del modelo base de 2B: la model card documenta traducción literal y alucinación en detalles de referencias culturales, tanto en 4bit como en 8bit. Es un problema del modelo base, no de la cuantización.
- Riesgo de alucinación general: inherente a un modelo de este tamaño. No se recomienda su uso en dominios factuales sin verificación humana.
- Riesgo de bucles degenerados: documentado explícitamente en la variante de 4 bits para razonamiento largo y generación de código; no se descarta que aparezca en 8bit en contextos o prompts adversos.
- Idiomas no declarados: no hay lista oficial de idiomas soportados. La model card está redactada en chino y los ejemplos de prueba mezclan chino e inglés, pero esto no constituye una declaración de cobertura lingüística.
- Ventana de 128K tokens declarada en la configuración, pero sin evidencia publicada de rendimiento real a esa longitud; la caché KV correspondiente excede con creces la memoria de cualquier dispositivo de gama de consumo.
- El formato de pesos es específico de MNN. No hay safetensors ni GGUF en este repositorio, por lo que no es directamente utilizable con vLLM, llama.cpp, Ollama o TGI.
- Licencia apache-2.0 declarada para este repositorio. Conviene verificar los términos del modelo base openbmb/MiniCPM5-2B antes de un uso comercial, ya que no se detallan en la información disponible.
- La fecha de creación indicada en los metadatos (2026-09-13) es posterior a la fecha de actualización del propio repositorio según los datos aportados; conviene tratarla con cautela.
- Los ficheros de configuración usan rutas relativas resueltas respecto al directorio del JSON, un detalle que provoca fallos si se ejecuta el binario desde otro directorio.
- No se documenta soporte de tool calling, agentes ni multimodalidad; no deben asumirse estas capacidades.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yunfengwang/MiniCPM5-2B-MNN-8bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Variante de 4 bits del mismo autor: https://huggingface.co/yunfengwang/MiniCPM5-2B-MNN-4bit
- Motor de inferencia MNN (Alibaba): https://github.com/alibaba/MNN

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos resultados obtenidos fueron páginas del servicio Google Translate, sin relación con la ficha.
