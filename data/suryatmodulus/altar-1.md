# suryatmodulus/altar-1

## Resumen

Altar-1 es una versión podada y cuantizada de GLM-5.3, el modelo de mezcla de expertos (MoE) de 753.000 millones de parámetros desarrollado por Z.AI (zai-org). El autor del repositorio, suryatmodulus, parte de la cuantización W4A16 en INT4 publicada por cyankiwi y aplica encima la técnica REAP (Router-weighted Expert Activation Pruning) de Cerebras Research para eliminar el 34 % de los expertos enrutados: se conservan 168 de los 256 expertos por capa, sin reentrenamiento. El resultado es un checkpoint de 500.825.296.352 parámetros (~500,8 B) que ocupa 328 GB en disco y mantiene ~40 B de parámetros activos por token, idénticos a los del modelo original.

La relevancia de esta ficha está en su enfoque de despliegue: en lugar de reducir el modelo a un tamaño manejable en GPUs de consumo, Altar-1 está diseñado explícitamente para servirse en cuatro NVIDIA H200 (arquitectura Hopper) con vLLM, dejando espacio para una caché KV de 128k tokens a lotes de producción. Frente a la alternativa de conservar solo los expertos globalmente más frecuentes, el criterio de poda puntúa cada experto por su mayor cuota de trabajo enrutado dentro de un único dominio, de modo que dominios especializados —código, idiomas poco frecuentes, salida estructurada— conservan sus especialistas.

El modelo se distribuye bajo licencia "other" que hereda los términos de GLM-5.3, con 0 descargas y 0 likes en el momento de redactar esta ficha, y sin resultados de benchmarks estándar publicados. La única métrica de fidelidad disponible es la divergencia KL frente al modelo BF16 completo: 0,506 nats sobre un panel cerrado de 25 prompts con el vocabulario completo de 154.000 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con enrutamiento disperso; tag `glm_moe_dsa` |
| Parámetros totales | 500.825.296.352 (~500,8 B) según safetensors |
| Parámetros activos | ~40 B por token (8 de 168 expertos por capa, igual que el modelo sin podar) |
| Longitud de contexto | 131.072 tokens (valor de `--max-model-len` documentado para vLLM) |
| Tipos de cuantización | W4A16 INT4 (AWQ, formato compressed-tensors) en expertos enrutados; BF16 en atención, experto compartido, capas densas y cabeza |
| Idiomas soportados | No disponible en los metadatos; la calibración incluye inglés y artículos multilingües de Wikipedia |
| Licencia | other (hereda la licencia de GLM-5.3) |
| Formato de pesos | safetensors (compressed-tensors); no se documenta GGUF |
| Modelo base | cyankiwi/GLM-5.3-AWQ-INT4 (relación: quantized) |
| Modelo original | zai-org/GLM-5.3 (753 B MoE, 256 expertos por capa) |
| Tamaño del repositorio | 328,0 GB |
| Pipeline | text-generation (etiquetas `conversational`) |

## Arquitectura y entrenamiento

GLM-5.3 es un transformer de mezcla de expertos de 753 B de parámetros con 256 subredes de expertos por capa, de las que cada token activa 8 (unos 40 B de parámetros activos). Altar-1 no reentrena nada: aplica REAP sobre el checkpoint ya cuantizado, puntuando cada experto por su contribución real medida en el enrutador. El criterio de selección no es la frecuencia global de activación, sino la mayor cuota de trabajo enrutado que un experto absorbe dentro de un único dominio; así se evita borrar los especialistas de dominios minoritarios, que es el fallo típico de la poda por frecuencia. El resultado conserva 168 de 256 expertos por capa y mantiene intacto el enrutamiento: 8 expertos por token entre los 168 supervivientes.

La cuantización se hereda de cyankiwi/GLM-5.3-AWQ-INT4: solo los expertos enrutados se almacenan en 4 bits con activaciones en 16 bits (W4A16, AWQ dentro del formato compressed-tensors); atención, experto compartido, capas densas y cabeza permanecen en BF16. vLLM selecciona automáticamente el kernel Marlin MoE. La calibración del proceso de poda se realizó sobre trazas de ciberseguridad, código, tool calling, razonamiento, inglés y artículos multilingües de Wikipedia. El propio autor indica que el modelo se construyó sobre 8 × NVIDIA RTX PRO 6000 Blackwell, aunque la inferencia objetivo es Hopper. La fidelidad medida frente al BF16 completo es de 0,506 nats de divergencia KL (panel cerrado de 25 prompts, vocabulario completo de 154k), prácticamente idéntica a los 0,511 nats de la build EXL3 del mismo recorte.

## Capacidades

- Generación de texto conversacional en pipeline `text-generation`.
- Razonamiento multi-paso y resolución de problemas, según la composición declarada del conjunto de calibración.
- Generación y análisis de código: el modelo es la base de productos de auditoría y análisis de código de Aikido.
- Tool calling y function calling, explícitamente incluidos en la calibración.
- Salida estructurada (structured output), mencionada como dominio preservado por el criterio de poda.
- Análisis de trazas de ciberseguridad, dominio sobre el que se calibró el proceso REAP.
- Capacidades multilingües derivadas de la calibración con artículos de Wikipedia en varios idiomas, aunque no hay lista oficial de idiomas soportados.
- Procesamiento de contextos largos de hasta 131.072 tokens, con caché KV dimensionada para lotes de producción en 4 × H200.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Auditoría de seguridad de código en producción: el modelo se calibró sobre trazas de ciberseguridad y ya alimenta productos como AI Code Analysis y Deep Review de Aikido, por lo que encaja en pipelines que analizan repositorios completos y señalan vulnerabilidades con contexto de hasta 128k tokens.
- Triaje de alertas de seguridad: con tool calling y salida estructurada puede clasificar hallazgos, enriquecerlos consultando APIs externas y devolver JSON consumible por un SIEM.
- Generación automática de parches: dado un hallazgo con contexto de varios ficheros, puede proponer el diff y validarlo contra tests, integrándose en un pipeline de CI/CD mediante function calling.
- Asistente de codificación para equipos: al conservar los expertos especialistas en código, mantiene calidad en autocompletado, refactorización y explicación de código dentro de un IDE o chatbot interno.
- Agente multi-paso sobre bases de código grandes: la ventana de 131.072 tokens permite incluir varios módulos, documentación e historial de conversación sin truncar, lo que habilita razonamiento encadenado con verificación intermedia.
- Documentación técnica y localización multilingüe: la calibración con Wikipedia multilingüe y la preservación de expertos de idiomas poco frecuentes lo hacen adecuado para traducir y mantener documentación en varios idiomas, aunque la cobertura exacta no está documentada.
- Despliegue on-premise en sectores regulados: al servirse en un clúster Hopper propio con vLLM, permite a organizaciones con requisitos de soberanía de datos procesar información sensible sin enviarla a APIs externas.
- Extracción de información estructurada de texto no estructurado: informes, tickets o logs convertidos a esquemas JSON definidos por el usuario, apoyándose en el tool calling y en el formato compressed-tensors compatible con vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica cuantitativa de calidad publicada es la divergencia KL frente al modelo BF16 completo:

| Métrica | Altar-1 (W4A16, 168 expertos) | Build EXL3 del mismo recorte | Referencia |
|---|---|---|---|
| Divergencia KL vs GLM-5.3 BF16 | 0,506 nats | 0,511 nats | 0 = idéntico |
| Panel de evaluación | 25 prompts (panel cerrado) | 25 prompts (panel cerrado) | Vocabulario completo de 154k tokens |
| Parámetros activos | ~40 B | ~40 B | Igual que el modelo sin podar |

El autor señala que a este ancho de bits el formato de cuantización apenas mueve el resultado, y remite al dataset `0xSero/glm-5.3-reap-fidelity-study` para el detalle completo de la comparación, incluida la comparativa frente a la poda por frecuencia.

## Requisitos de hardware

- VRAM estimada: 328 GB solo para los pesos en INT4, más la caché KV. El autor indica que 4 × H200 dejan espacio para una caché KV de 128k tokens a lotes de producción.
- GPU recomendadas: 4 × NVIDIA H200 con tensor parallelism 4; se requiere arquitectura Hopper (H100/H200). vLLM selecciona automáticamente el kernel Marlin MoE.
- GPU no soportadas: no cabe en GPUs de consumo. Una RTX 4090 con 24 GB no puede alojar el modelo ni siquiera repartido entre varias unidades del mismo tipo.
- Proceso de construcción: el pruning se realizó sobre 8 × NVIDIA RTX PRO 6000 Blackwell, hardware distinto del objetivo de inferencia.
- Opciones de despliegue: vLLM con el comando `vllm serve aikido/altar-1 --tensor-parallel-size 4 --trust-remote-code --max-model-len 131072`. No se documenta soporte para llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Expertos por capa | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| suryatmodulus/altar-1 | ~500,8 B | ~40 B | 168 de 256 | W4A16 INT4 (AWQ) | other (hereda GLM-5.3) | HuggingFace, vLLM en Hopper |
| zai-org/GLM-5.3 (original) | 753 B | ~40 B | 256 de 256 | BF16 | GLM-5.3 | HuggingFace |
| cyankiwi/GLM-5.3-AWQ-INT4 | 753 B | ~40 B | 256 de 256 | W4A16 INT4 (AWQ) | hereda GLM-5.3 | HuggingFace |
| 0xSero/GLM-5.3-569B-W4A16 | ~569 B | ~40 B | recorte menos agresivo | W4A16 | hereda GLM-5.3 | HuggingFace |
| 0xSero/GLM-5.3-500B-EXL3-3.0bpw | ~500 B | ~40 B | mismo recorte de 168 | EXL3 3,0 bpw | hereda GLM-5.3 | HuggingFace |

No hay datos de benchmarks que permitan comparar rendimiento entre estas variantes; la única comparación cuantitativa publicada es la divergencia KL (0,506 nats de Altar-1 frente a 0,511 nats de la build EXL3 del mismo recorte). La diferencia entre Altar-1 y las builds de 0xSero está en el formato de cuantización y en el grado de poda, no en el modelo base.

## Limitaciones y advertencias

- Licencia "other" que hereda los términos de GLM-5.3: es obligatorio revisar las condiciones originales antes de cualquier uso comercial. El autor no aclara restricciones adicionales propias.
- Requiere hardware Hopper (H100/H200) y 328 GB de pesos en INT4; no existe una ruta práctica de despliegue en GPUs de consumo ni en hardware anterior a Hopper.
- La divergencia KL de 0,506 nats implica que el modelo no es idéntico al GLM-5.3 BF16; en tareas muy sensibles a la distribución exacta de probabilidades puede haber degradación medible.
- La poda elimina el 34 % de los expertos. Aunque el criterio es consciente de dominio, cualquier especialista con poco volumen de activación en la calibración puede haber desaparecido, especialmente en idiomas o dominios ausentes del conjunto de calibración.
- No hay lista oficial de idiomas soportados en los metadatos de HuggingFace; la cobertura multilingüe es una inferencia a partir de los datos de calibración declarados, no una garantía.
- Riesgo de alucinación inherente a un modelo de lenguaje de esta escala, agravado por la ausencia de benchmarks públicos que permitan acotar su fiabilidad por tarea.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo minuto: la validación externa es prácticamente nula y las afirmaciones de la model card proceden únicamente del autor.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; toda la información de esta ficha procede de la model card y de los metadatos de HuggingFace.
- No se documentan versiones GGUF ni soporte para llama.cpp u Ollama, lo que limita las opciones de despliegue a vLLM sobre Hopper.
- El comando de servicio de la model card apunta a `aikido/altar-1`, mientras que el repositorio consultado es `suryatmodulus/altar-1`; conviene verificar qué identificador resuelve correctamente antes de desplegar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/suryatmodulus/altar-1
- Modelo base cuantizado: https://huggingface.co/cyankiwi/GLM-5.3-AWQ-INT4
- Modelo original GLM-5.3 (Z.AI): https://huggingface.co/zai-org/GLM-5.3
- Organización Z.AI en HuggingFace: https://huggingface.co/zai-org
- Paper de REAP: https://arxiv.org/abs/2510.13999
- Repositorio de REAP en GitHub: https://github.com/CerebrasResearch/reap
- Build de 569B del mismo recorte: https://huggingface.co/0xSero/GLM-5.3-569B-W4A16
- Build EXL3 de 500B del mismo recorte: https://huggingface.co/0xSero/GLM-5.3-500B-EXL3-3.0bpw
- Dataset de estudio de fidelidad: https://huggingface.co/datasets/0xSero/glm-5.3-reap-fidelity-study
- Dataset de observaciones del pruning: https://huggingface.co/datasets/0xSero/glm-5.3-reap-observations-v1
- Aikido Attack: https://www.aikido.dev/platform/attack
- Aikido AI Code Analysis: https://www.aikido.dev/code/code-audit
- Aikido Deep Review: https://help.aikido.dev/deep-review/how-deep-review-works
