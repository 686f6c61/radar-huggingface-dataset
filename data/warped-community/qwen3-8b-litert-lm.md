# warped-community/Qwen3-8B-litert-lm

## Resumen

Qwen3-8B-litert-lm es un espejo del modelo Qwen3-8B de Alibaba Qwen, reconvertido al formato LiteRT-LM para su ejecución en dispositivos móviles. Lo publica la organización warped-community con el objetivo declarado de servir como modelo listo para Android dentro de la aplicación Warped. No se trata, por tanto, de un modelo nuevo ni de un ajuste fino: es una redistribución del checkpoint `qwen3_8b_mixed_int4.litertlm` publicado originalmente por litert-community, que a su vez deriva de los pesos oficiales de Qwen/Qwen3-8B.

El interés de esta ficha es doble. Por un lado, permite entender qué se puede hacer con un transformer denso de unos 8.200 millones de parámetros cuantizado a int4 mixta y empaquetado para el runtime LiteRT-LM. Por otro, sirve como ejemplo de la tendencia a distribuir modelos de razonamiento de gama media en formatos de borde (edge), donde el tamaño del repositorio —4,9 GB— es un factor tan determinante como la calidad del modelo.

La relevancia es principalmente práctica: un modelo de 8B con licencia Apache-2.0 y cuantización int4 es un candidato razonable para inferencia local en móviles de gama alta, portátiles sin GPU dedicada y entornos sin conectividad, siempre que se acepte la pérdida de precisión asociada a la cuantización y las limitaciones del runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base Qwen/Qwen3-8B (no confirmada en la model card de este espejo) |
| Parametros totales | Aproximadamente 8.200 millones en el modelo base Qwen3-8B; no confirmado de forma explicita en este espejo |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base, extensible hasta 131.072 con YaRN; no confirmado para el artefacto LiteRT-LM |
| Tipos de cuantizacion | int4 mixta (`qwen3_8b_mixed_int4.litertlm`); no se documentan otras variantes |
| Idiomas soportados | no disponibles en la model card de este espejo; el modelo base Qwen3-8B declara soporte para 119 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`); no incluye safetensors ni GGUF en este repositorio |
| Tamano del repositorio | 4,9 GB |
| Modelo base | Qwen/Qwen3-8B |
| Runtime objetivo | LiteRT-LM (Google AI Edge) |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura ni el proceso de entrenamiento; únicamente indica el origen de los pesos. La arquitectura, por tanto, es la del modelo base Qwen3-8B: un transformer decoder-only denso de la familia Qwen3, sin mezcla de expertos. Las innovaciones de la familia Qwen3 relevantes aquí son el modo híbrido de razonamiento (pensamiento explícito activable o desactivable) y el control del presupuesto de razonamiento, que permiten ajustar el coste de inferencia según la tarea.

La única transformación documentada en este repositorio es la conversión al formato LiteRT-LM a partir del archivo `qwen3_8b_mixed_int4.litertlm` de litert-community. No hay evidencia de reentrenamiento, ajuste fino, RLHF ni DPO adicional por parte de warped-community, ni de modificaciones en el tokenizador. Cualquier detalle sobre número de tokens de entrenamiento, composición del dataset o fases de alineación debe consultarse en la documentación del modelo base Qwen3-8B, no en esta ficha ni en este repositorio.

## Capacidades

Las capacidades listadas a continuación corresponden al modelo base Qwen3-8B y no han sido verificadas específicamente sobre el artefacto LiteRT-LM, que puede presentar diferencias de comportamiento por la cuantización int4 mixta y por las limitaciones del runtime móvil.

- Generación de texto en modo conversacional y en modo no conversacional.
- Razonamiento multi-paso con modo de pensamiento explícito (thinking mode) activable y desactivable, con presupuesto de razonamiento configurable en el modelo base.
- Generación y comprensión de código en múltiples lenguajes de programación.
- Resolución de problemas matemáticos y de razonamiento lógico-formal.
- Soporte de tool calling y de function calling en el modelo base.
- Uso en flujos de agente con razonamiento encadenado y varias llamadas a herramientas.
- Capacidad multilingüe declarada por el modelo base (119 idiomas y dialectos); no verificada en este espejo.
- Capacidades de visión, audio o multimodalidad: no disponibles (Qwen3-8B es un modelo exclusivamente de texto).

## Casos de uso

- Inferencia local en Android: la aplicación Warped integra este artefacto para ejecutar el modelo en el dispositivo sin enviar datos a servidores externos. Es el caso de uso declarado por el autor y el único documentado de forma explícita.
- Asistentes personales sin conectividad: un asistente de notas o de correo en el propio teléfono puede redactar, resumir y responder preguntas sobre contenido local sin depender de la nube, usando el modelo en formato LiteRT-LM sobre la NPU o la GPU del dispositivo.
- Procesamiento de texto con requisitos de privacidad: en entornos sanitarios, legales o corporativos donde no se permite exportar datos, el modelo puede ejecutarse íntegramente en el dispositivo y mantener la información dentro del perímetro físico.
- Prototipado rápido de aplicaciones móviles con IA generativa: al estar ya empaquetado en el formato del runtime, permite validar experiencias de usuario con un modelo de 8B sin pasar por el proceso de conversión desde safetensors.
- Asistencia a la escritura y corrección en aplicaciones ofimáticas móviles: reescritura de párrafos, cambio de tono, generación de borradores y traducción asistida entre los idiomas soportados por el modelo base.
- Soporte técnico de campo offline: aplicaciones para técnicos o personal en entornos sin cobertura que necesiten consultar documentación y obtener respuestas razonadas, con la ventaja de que el artefacto ocupa menos de 5 GB.
- Clasificación y extracción de información sobre documentos locales: análisis de contratos, facturas o informes almacenados en el dispositivo, con salida estructurada si se combina con tool calling.
- Evaluación comparativa de runtimes de borde: este repositorio es útil como referencia para medir latencia, consumo energético y calidad de salida de LiteRT-LM frente a otras alternativas (llama.cpp, MLC, ONNX Runtime) en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este espejo. La model card de warped-community no incluye ninguna medición, y tampoco hay datos de latencia, throughput ni consumo energético en el repositorio.

| Benchmark | Resultado en este espejo | Notas |
|---|---|---|
| MMLU | no disponible | El modelo base publica resultados en su propia model card |
| MMLU-Pro | no disponible | Idem |
| GPQA | no disponible | Idem |
| HumanEval | no disponible | Idem |
| GSM8K | no disponible | Idem |
| Latencia en dispositivo | no disponible | No documentada por el autor |

Advertencia importante: los resultados del modelo base Qwen3-8B no son extrapolables directamente a esta versión. La cuantización int4 mixta y las restricciones de memoria del runtime móvil pueden degradar la calidad de salida y, sobre todo, la estabilidad del razonamiento encadenado.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 4,9 GB, por lo que se necesita un mínimo de aproximadamente 5-6 GB de memoria libre para cargar los pesos, más el espacio para el contexto y las estructuras de KV cache. No se ha publicado una cifra oficial.
- GPU de escritorio: no hay una lista de GPU recomendadas publicada. Por tamaño, el modelo es apto para tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores), aunque LiteRT-LM no es el runtime habitual en escritorio.
- Cabe en GPU de consumo: sí, en el rango de 8-12 GB de VRAM, siempre que el runtime empleado admita el formato `.litertlm`. Para GPU de consumo el camino más habitual es convertir los pesos a GGUF y usar llama.cpp u Ollama, opción que no se ofrece en este repositorio.
- Dispositivos móviles: es el objetivo declarado del artefacto. Requiere LiteRT-LM y hardware Android compatible (NPU, GPU o CPU); no se especifican modelos de SoC ni versiones mínimas de Android.
- Opciones de despliegue: LiteRT-LM es la vía soportada por este repositorio. vLLM, TGI, llama.cpp y Ollama no leen `.litertlm`; para usarlos habría que partir del modelo base Qwen3-8B o de una conversión a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato principal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-litert-lm (este repositorio) | ~8,2B (heredado) | 32.768 tokens en el base (no confirmado aqui) | Apache-2.0 | LiteRT-LM (`.litertlm`) | Repositorio HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-8B | ~8,2B | 32.768 tokens, hasta 131.072 con YaRN | Apache-2.0 | safetensors, GGUF (comunidad) | Ampliamente distribuido y verificado |
| Meta Llama 3.1 8B Instruct | ~8,03B | 128.000 tokens | Llama 3.1 Community License (con restricciones para uso comercial a gran escala) | safetensors, GGUF | Ampliamente distribuido |
| Mistral 7B Instruct v0.3 | ~7,25B | 32.000 tokens | Apache-2.0 | safetensors, GGUF | Ampliamente distribuido |

La comparación de rendimiento entre estos modelos no se incluye porque no hay resultados de benchmarks publicados para el espejo LiteRT-LM. En cuanto a idoneidad para despliegue, la diferencia clave de este repositorio no es la calidad del modelo, sino el formato: es el único de la tabla que se ejecuta directamente en LiteRT-LM, a cambio de no ser compatible con el ecosistema GGUF ni con los servidores de inferencia habituales.

## Limitaciones y advertencias

- Modelo espejo, no entrenado: warped-community no documenta ningún ajuste, evaluación ni validación del artefacto. La responsabilidad sobre el comportamiento recae en el usuario.
- Métricas de adopción nulas: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de terceros y mayor riesgo de incidencias no documentadas.
- Degradación por cuantización: la cuantización int4 mixta puede reducir la precisión en tareas de razonamiento largo, matemáticas y generación de código. No hay ninguna evaluación publicada que cuantifique esta pérdida.
- Riesgo de alucinación: inherente a la familia Qwen3-8B y no mitigado en este artefacto. En producción debe combinarse con verificación externa y, en lo posible, con tool calling para anclar las respuestas.
- Contexto: no se confirma en este repositorio que se mantengan los 32.768 tokens del modelo base ni la extensión a 131.072 mediante YaRN. Debe verificarse empíricamente antes de diseñar aplicaciones que dependan de ventanas largas.
- Idiomas: la model card de este espejo no declara idiomas soportados. Aunque el modelo base declara 119 idiomas y dialectos, el rendimiento real en lenguas distintas del inglés y del chino suele ser desigual, y en castellano no está verificado para esta versión.
- Modo de pensamiento: si el runtime LiteRT-LM no expone el control del presupuesto de razonamiento del modelo base, el modelo puede generar cadenas de pensamiento largas que degraden la latencia en dispositivos móviles.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero conviene revisar los términos del modelo base Qwen3-8B y del artefacto intermedio de litert-community, ya que este repositorio es una redistribución en cadena.
- Sin garantías de mantenimiento: la fecha de creación y actualización del repositorio corresponde a octubre de 2026 y no hay indicios de soporte continuado, versionado ni canal de incidencias.
- Compatibilidad: el formato `.litertlm` ata el artefacto a LiteRT-LM. Migrar a otro runtime exige volver al modelo base y repetir la cuantización.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/warped-community/Qwen3-8B-litert-lm
- Artefacto de origen (litert-community): https://huggingface.co/litert-community/Qwen3-8B
- Modelo base (Qwen): https://huggingface.co/Qwen/Qwen3-8B
- Informe técnico de Qwen3 (referencia del modelo base): https://arxiv.org/abs/2505.09388
- Blog de la familia Qwen3 (referencia del modelo base): https://qwenlm.github.io/blog/qwen3/
- Documentación de LiteRT (runtime): https://ai.google.dev/edge/litert

Nota: los tres primeros enlaces proceden directamente de la información proporcionada. Los tres últimos se incluyen como referencia del modelo base y del runtime, y no aparecen citados en la model card de este repositorio.
