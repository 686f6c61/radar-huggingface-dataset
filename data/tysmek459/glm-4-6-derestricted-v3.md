# tysmek459/GLM-4.6-Derestricted-v3

## Resumen

GLM-4.6-Derestricted-v3 es una variante "abliterated" (sin mecanismos de rechazo) del modelo GLM-4.6 de Zhipu AI / Z.ai, publicada en HuggingFace por el usuario tysmek459. El trabajo de destilado de rechazos corresponde a Arli AI, que aplica una tecnica denominada Norm-Preserving Biprojected Abliteration, descrita originalmente por Jim Lai (grimjim). El objetivo declarado es eliminar las conductas de negativa del modelo original sin degradar su capacidad de razonamiento, evitando el efecto de "lobotomizacion" que suele acompanar a la ablacion estandar de vectores de rechazo.

El modelo base, GLM-4.6, es un transformer de tipo mezcla de expertos (MoE) con 356.785.898.816 parametros totales y una ventana de contexto de 200.000 tokens (ampliada desde los 128.000 de GLM-4.5). Esta orientado a tareas agenticas, uso de herramientas, generacion de codigo y razonamiento multi-paso, y compite directamente con modelos como DeepSeek-V3.1-Terminus o Claude Sonnet 4 en benchmarks publicos de agentes, razonamiento y programacion.

La relevancia de esta ficha radica en que combina un modelo frontera de gran escala con pesos abiertos bajo licencia MIT, algo poco habitual en este rango de parametros. Sin embargo, el repositorio presenta senales de baja adopcion (0 descargas y 0 likes en el momento del analisis), la model card combina texto del autor con la del modelo original, y no se aportan resultados de benchmarks propios, por lo que su evaluacion practica requiere verificacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE); tag de HuggingFace glm4_moe |
| Parametros totales | 356.785.898.816 (~356,8 B) |
| Parametros activos | no disponible (arquitectura MoE confirmada por tag, sin dato de expertos activos) |
| Longitud de contexto | 200.000 tokens (heredada de GLM-4.6) |
| Tipos de cuantizacion | FP8, INT8 (W8A8) y GPTQ W4A16 disponibles en repositorios separados de ArliAI; no se documentan GGUF para esta publicacion |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 713,6 GB |
| Modelo base | zai-org/GLM-4.6 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GLM-4.6: un transformer con capas de mezcla de expertos (MoE), segun el tag `glm4_moe` del repositorio, con aproximadamente 356,8 mil millones de parametros totales. El informe tecnico referenciado (arXiv:2508.06471) corresponde a GLM-4.5, no a GLM-4.6, por lo que los detalles exactos de preentrenamiento, numero de tokens y composicion del dataset de GLM-4.6 no estan disponibles en la informacion proporcionada. GLM-4.6 amplia la ventana de contexto hasta 200.000 tokens, mejora el rendimiento en codigo y razonamiento, y refuerza las capacidades de uso de herramientas y agentes respecto a GLM-4.5.

La intervencion especifica de esta version es la Norm-Preserving Biprojected Abliteration. El metodo opera en tres pasos: (1) biproyeccion, refinando la direccion de rechazo para que sea ortogonal a las direcciones de conceptos inofensivos y evitar eliminar capacidades utiles; (2) descomposicion de los pesos en magnitud y direccion; y (3) preservacion de norma, eliminando el componente de rechazo unicamente del aspecto direccional y recombinandolo con las magnitudes originales. Segun el autor, este procedimiento evita la "tasa de seguridad" (degradacion de rendimiento por ablacion) y podria incluso mejorar el razonamiento al no malgastar computo en suprimir salidas. No se documentan datos de entrenamiento adicionales ni procesos de RLHF o DPO especificos de esta variante.

## Capacidades

- Generacion de texto conversacional en formato multi-turno.
- Razonamiento avanzado, con mejoras declaradas respecto a GLM-4.5 en tareas de logica y matematicas.
- Generacion de codigo, con rendimiento destacado en benchmarks de programacion y en herramientas como Claude Code, Cline, Roo Code y Kilo Code.
- Uso de herramientas durante la inferencia (tool use / function calling) y razonamiento integrado con herramientas.
- Capacidades agenticas: busqueda, ejecucion multi-paso e integracion en frameworks de agentes.
- Escritura refinada y role-playing, con mejor alineacion a preferencias humanas de estilo y legibilidad.
- Ventana de contexto de 200.000 tokens para tareas largas y agenticas complejas.
- Eliminacion de conductas de rechazo (abliterated/derestricted), lo que amplia el rango de peticiones que el modelo atiende sin negarse.
- Capacidades multilingues: no disponibles de forma explicita en la documentacion facilitada.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en asistentes de IDE y pipelines de CI/CD gracias a su soporte de tool calling y su rendimiento en benchmarks de codigo, con contexto ampliado para leer modulos completos.
- Agentes autonomos de desarrollo: con 200.000 tokens de contexto puede mantener el estado de una tarea larga y encadenar llamadas a herramientas (compilacion, tests, busqueda de documentacion) dentro de un bucle agentico.
- Atencion al cliente automatizada: conversaciones multi-turno con historial extenso y gestion de casos complejos que requieren consultar documentacion o bases de conocimiento.
- Analisis de documentos extensos: resumen, extraccion y pregunta-respuesta sobre informes, contratos o bases de codigo que superan los 128.000 tokens.
- Asistente de investigacion y busqueda aumentada (RAG/web search): uso como motor de razonamiento que decide consultas, sintetiza evidencias y cita fuentes.
- Generacion de contenido creativo sin restricciones tematicas: narrativa, guiones o ficcion donde los mecanismos de rechazo del modelo base limitaban ciertos temas.
- Prototipado rapido de aplicaciones conversacionales: despliegue en un endpoint compatible con la API de OpenAI para chatbots personalizados.
- Evaluacion de seguridad y alineacion (red teaming): util como modelo "sin censura" de referencia para estudiar comportamientos abliterated y compararlos con la version original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card referencia que GLM-4.6 fue evaluado en ocho benchmarks publicos de agentes, razonamiento y codigo, y menciona ventajas competitivas sobre DeepSeek-V3.1-Terminus y Claude Sonnet 4, pero no incluye los valores concretos ni datos especificos de esta variante Derestricted-v3. La afirmacion del autor de que la ablacion con preservacion de norma podria mejorar el razonamiento no viene acompanada de cifras verificables en la documentacion facilitada.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 713,6 GB (coincide con el tamano del repositorio), lo que exige agregacion multi-GPU.
- VRAM estimada en FP8/INT8: alrededor de 357 GB.
- VRAM estimada en GPTQ W4A16: aproximadamente 178-200 GB segun overhead de inferencia.
- GPU recomendadas: despliegue multi-nodo con NVIDIA H100 (80 GB) o A100 (80 GB); por ejemplo, 8-16 GPU para BF16 y un nodo de 8 GPU para cuantizaciones INT8/FP8.
- GPU de consumo (RTX 4090, 24 GB): no cabe en ninguna configuracion razonable de este modelo; estas GPU no son viables para inferencia completa.
- Opciones de despliegue: vLLM, SGLang y TGI (compatibles con safetensors y cuantizaciones FP8/INT8/W4A16); llama.cpp/Ollama requeririan una conversion a GGUF que no se documenta en este repositorio.
- Latencia y throughput: no disponibles; dependeran fuertemente del numero de GPU, del grado de cuantizacion y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GLM-4.6-Derestricted-v3 (esta ficha) | ~356,8 B | 200.000 tokens | MIT | Pesos abiertos en HuggingFace | Variante abliterated; sin benchmarks propios publicados |
| zai-org/GLM-4.6 (base) | ~356,8 B | 200.000 tokens | Segun licencia del modelo base (no disponible en esta informacion) | Pesos abiertos | Modelo original con rechazos intactos; referencia directa |
| DeepSeek-V3.1-Terminus | no disponible | no disponible | no disponible | Pesos abiertos | Citado como competidor directo en la model card de GLM-4.6 |
| Claude Sonnet 4 | no disponible | no disponible | Propietaria | Solo API | Citado como competidor de referencia en la model card de GLM-4.6 |

## Limitaciones y advertencias

- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran escala; el autor afirma que la ablacion con preservacion de norma reduce la degradacion, pero no aporta datos verificables.
- Sesgos: no se documenta ningun analisis de sesgos ni evaluacion de alineacion para esta variante.
- Eliminacion de rechazos: al ser un modelo derestricted, puede generar contenido danino, ofensivo o inseguro que el modelo original bloquearia; no es adecuado para despliegues sin filtros adicionales de moderacion.
- Idiomas: no se especifica la cobertura linguistica, por lo que el rendimiento multilingue no puede garantizarse.
- Licencia MIT declarada: permite uso comercial, pero la licencia del modelo base (zai-org/GLM-4.6) deberia verificarse de forma independiente antes de un despliegue comercial, ya que podrian existir condiciones adicionales no reflejadas en esta publicacion.
- Madurez del repositorio: 0 descargas y 0 likes en el momento del analisis, autoria del repositorio distinta de la entidad que reclama el trabajo (Arli AI), y texto de la model card mezclado con el del modelo original; conviene validar la integridad de los pesos antes de usarlos en produccion.
- Requisitos de infraestructura extremos (~713,6 GB en BF16), no aptos para hardware de consumo.
- Sin resultados de benchmarks propios: el rendimiento real de la variante Derestricted respecto al modelo original no esta cuantificado en la informacion disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tysmek459/GLM-4.6-Derestricted-v3
- Modelo base: https://huggingface.co/zai-org/GLM-4.6
- Version Derestricted original de Arli AI: https://huggingface.co/ArliAI/GLM-4.6-Derestricted
- Cuantizacion FP8: https://huggingface.co/ArliAI/GLM-4.6-Derestricted-FP8
- Cuantizacion INT8 (W8A8): https://huggingface.co/ArliAI/GLM-4.6-Derestricted-W8A8-INT8
- Cuantizacion GPTQ W4A16: https://huggingface.co/ArliAI/GLM-4.6-Derestricted-GPTQ-W4A16
- Articulo tecnico de Norm-Preserving Biprojected Abliteration: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Blog tecnico de GLM-4.6: https://z.ai/blog/glm-4.6
- Informe tecnico de GLM-4.5 (arXiv:2508.06471): https://arxiv.org/abs/2508.06471
- Repositorio GitHub de GLM-4.5 / GLM-4.6: https://github.com/zai-org/GLM-4.5
- Documentacion tecnica de Zhipu AI: https://zhipu-ai.feishu.cn/wiki/Gv3swM0Yci7w7Zke9E0crhU7n7D
- API de GLM-4.6 en Z.ai: https://docs.z.ai/guides/llm/glm-4.6
- Chat de GLM-4.6: https://chat.z.ai
