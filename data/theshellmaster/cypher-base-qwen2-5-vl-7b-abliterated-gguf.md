# TheShellMaster/Cypher-Base-Qwen2.5-VL-7B-Abliterated-GGUF

## Resumen

Cypher-Base-Qwen2.5-VL-7B-Abliterated-GGUF es un espejo de distribución, sin modificaciones, de la cuantización Q5_K_M del modelo Qwen2.5-VL-7B-Instruct-abliterated, publicado originalmente por mradermacher. Lo mantiene el usuario TheShellMaster con el objetivo de preservar la trazabilidad de la cadena de producción de su modelo derivado Cypher-2.5-Vision-7B. No hay re-cuantización ni fine-tuning: los pesos son idénticos a los de la fuente.

El modelo subyacente es un Qwen2.5-VL-7B-Instruct de Alibaba, un transformer multimodal (visión y lenguaje) de 7.000 millones de parámetros con 28 bloques y dimensión oculta de 3584, al que se le ha aplicado una técnica de *abliteration* (eliminación de la dirección de rechazo en el espacio de activaciones) para reducir los comportamientos de negativa del modelo instruct original. La versión aquí distribuida está cuantizada en Q5_K_M y empaquetada en formato GGUF para su uso con llama.cpp y Ollama.

Su relevancia es doble: por un lado, ofrece una variante sin censura de un modelo visual-lenguaje de referencia con ventana nativa de 128.000 tokens; por otro, documenta de forma explícita la genealogía completa del modelo, lo que facilita la reproducibilidad en un ecosistema donde los repositorios intermedios desaparecen con frecuencia. Está pensado para desarrolladores que necesitan ejecutar localmente un VLM de 7B con capacidades de razonamiento visual y sin las restricciones de rechazo del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen2vl (transformer multimodal vision-lenguaje), 28 bloques, dim 3584 |
| Parametros totales | 7B (aproximado, segun nomenclatura del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (nativo) |
| Tipos de cuantizacion | Q5_K_M (unica disponible en este repositorio) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5-VL es multilingue, pero no se detalla en la informacion proporcionada) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es qwen2vl, un transformer multimodal que combina un codificador de visión con un decodificador de lenguaje de la familia Qwen2.5. El modelo consta de 28 bloques con dimensión oculta de 3584 y soporta una ventana de contexto nativa de 128.000 tokens. La variante aquí publicada incorpora la modificación de *abliteration* aplicada por huihui-ai sobre el modelo instruct original: se identifica la dirección de activación asociada a los rechazos y se proyecta fuera de los pesos, de modo que el modelo deja de emitir negativas sistemáticas ante ciertas peticiones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base, más allá de que se trata de un modelo *instruct* de Qwen. Tampoco se detallan innovaciones técnicas específicas de la cuantización más allá del estándar Q5_K_M de llama.cpp, que mantiene los tensores de atención y las capas críticas en mayor precisión relativa que las capas de alimentación. El repositorio es un espejo sin re-cuantización: los pesos coinciden bit a bit con la fuente de mradermacher.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural.
- Comprensión de imágenes y respuesta a preguntas visuales (VLM multimodal).
- Razonamiento visual multi-paso sobre documentos, capturas y fotografías.
- Capacidad de seguir instrucciones (modelo *instruct*).
- Comportamiento sin censura en la variante abliterated: menor tasa de rechazos ante peticiones que el modelo original declinaría.
- Ventana de contexto larga de hasta 128.000 tokens para texto e imágenes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita en la información proporcionada.
- Capacidades multilingües: no disponibles en detalle en la información proporcionada.

## Casos de uso

- Análisis de documentos escaneados: el modelo puede procesar imágenes de páginas completas y extraer texto, tablas o campos clave, aprovechando su ventana de 128.000 tokens para manejar lotes de páginas en una sola pasada.
- Descripción y etiquetado automático de imágenes: útil para generar metadatos en bibliotecas de activos digitales, con la ventaja de ejecutarse localmente sin enviar contenido sensible a servicios externos.
- Asistencia en accesibilidad: conversión de capturas de pantalla o interfaces en descripciones textuales para usuarios con discapacidad visual, desplegable en un portátil con GPU de consumo mediante Ollama.
- Investigación en seguridad y alineación: la variante abliterated permite estudiar el comportamiento del modelo sin la capa de rechazo, comparando respuestas con el modelo original para analizar sesgos y mecanismos de negativa.
- Prototipado de asistentes visuales sin conexión: integración en aplicaciones de escritorio o embebidas que necesitan comprender imágenes sin depender de una API en la nube, gracias al formato GGUF y a su tamaño de 5,44 GB.
- Base para fine-tuning o destilación: al ser la base declarada de Cypher-2.5-Vision-7B, sirve como punto de partida reproducible para experimentos de ajuste sobre un VLM de 7B con licencia Apache-2.0.
- Moderación de contenido visual en pipelines internos: clasificación de imágenes y texto asociado en entornos controlados donde se requiere inspección local y trazabilidad del modelo utilizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q5_K_M: aproximadamente 5,5–7 GB para los pesos, más overhead de contexto KV; con contexto largo (decenas de miles de tokens) el consumo de memoria crece de forma significativa.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para contextos amplios; A100 o H100 para despliegues de producción con concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para contextos moderados; con 12–16 GB se puede ampliar el contexto con holgura.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (mediante `Modelfile` con `FROM` apuntando al GGUF), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Cypher-Base-Qwen2.5-VL-7B-Abliterated-GGUF | 7B | 128.000 | GGUF Q5_K_M | Apache-2.0 | Variante abliterated, espejo sin modificar |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B | 128.000 | safetensors | Apache-2.0 | Modelo original con alineación estándar |
| huihui-ai/Qwen2.5-VL-7B-Instruct-abliterated | 7B | 128.000 | safetensors | Apache-2.0 | Abliteration en fp16, sin cuantizar |
| mradermacher/Qwen2.5-VL-7B-Instruct-abliterated-GGUF | 7B | 128.000 | GGUF (varias cuantizaciones) | Apache-2.0 | Fuente directa de este espejo |

## Limitaciones y advertencias

- La *abliteration* elimina la dirección de rechazo, pero no garantiza un comportamiento seguro: el modelo puede producir contenido dañino, ofensivo o inexacto sin filtros previos.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en tareas de razonamiento visual complejo o con texto denso en imágenes.
- El repositorio solo ofrece la cuantización Q5_K_M; no hay variantes Q4, Q8 ni fp16 en este espejo.
- No se documentan los idiomas soportados ni el rendimiento por idioma; el modelo base Qwen2.5-VL es multilingüe, pero la cobertura real no está verificada aquí.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo derivado incorpora una modificación de alineación que puede tener implicaciones legales o de reputación según el contexto de despliegue.
- El repositorio tiene cero descargas y cero *likes* en el momento de la consulta, y fue creado en 2026: no hay validación comunitaria ni informes independientes de calidad.
- La model card está redactada en francés y no incluye detalles sobre datos de entrenamiento, evaluación ni limitaciones específicas del modelo abliterated.
- Para producción se recomienda evaluar el modelo frente al Qwen2.5-VL-7B-Instruct original y establecer filtros de salida propios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheShellMaster/Cypher-Base-Qwen2.5-VL-7B-Abliterated-GGUF
- Modelo derivado: https://huggingface.co/TheShellMaster/Cypher-2.5-Vision-7B
- Fuente de la cuantización: https://huggingface.co/mradermacher/Qwen2.5-VL-7B-Instruct-abliterated-GGUF
- Abliteration en fp16: https://huggingface.co/huihui-ai/Qwen2.5-VL-7B-Instruct-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
