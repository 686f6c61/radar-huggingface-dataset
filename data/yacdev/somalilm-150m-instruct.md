# yacdev/SomaliLM-150M-Instruct

## Resumen

SomaliLM-150M-Instruct es un modelo de lenguaje pequeño (150 millones de parámetros) desarrollado por el usuario yacdev, orientado a la conversación bilingüe en somalí e inglés. Según la demostración publicada en Hugging Face Spaces, se presenta como un asistente de diálogo ligero capaz de responder preguntas en ambos idiomas. El modelo está etiquetado como arquitectura "llama" y se distribuye en formato safetensors, con una versión cuantizada en GGUF disponible a través de un tercero.

La relevancia de este modelo radica en su tamaño reducido, que permite su ejecución en dispositivos con recursos limitados, y en su enfoque en un idioma de bajos recursos como el somalí, un ámbito poco cubierto por los grandes modelos comerciales. Sin embargo, la información pública es muy escasa: no se especifican la licencia, los datos de entrenamiento, la longitud de contexto ni los benchmarks. El repositorio ocupa 5,9 GB, un tamaño inusualmente grande para 150M parámetros, lo que sugiere que puede incluir checkpoints adicionales o archivos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (según etiqueta de HuggingFace) |
| Parametros totales | 147.286.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (estático, según repositorio de mradermacher) |
| Idiomas soportados | Somalí e inglés (según demo) |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna, el proceso de entrenamiento o la composición del dataset. La etiqueta "llama" sugiere que se trata de un transformer decoder con arquitectura similar a la familia Llama, pero no se confirma el número de capas, cabezas de atención ni dimensiones ocultas. Tampoco se conocen los datos de entrenamiento (número de tokens, fuentes, métodos de alineación como RLHF o DPO). El modelo se presenta como "Instruct", lo que indica que ha sido ajustado para seguir instrucciones, pero no hay detalles sobre el proceso de fine-tuning.

## Capacidades

- Generación de texto conversacional en somalí e inglés, según la descripción del demo.
- Asistente de diálogo bilingüe ligero, adecuado para tareas de pregunta-respuesta simples.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni otras funciones avanzadas.
- Al ser un modelo de 150M, su capacidad de razonamiento complejo y generación de código es limitada en comparación con modelos de mayor tamaño.

## Casos de uso

- Asistente básico en somalí para dispositivos móviles o aplicaciones web: el modelo puede responder preguntas frecuentes o mantener conversaciones sencillas en somalí, un idioma con poca cobertura en asistentes comerciales.
- Chatbot educativo para aprendizaje de idiomas: puede practicar conversación en somalí e inglés, ayudando a estudiantes a mejorar su vocabulario y comprensión.
- Soporte al cliente en regiones de habla somalí: integrado en un sistema de mensajería, puede gestionar consultas simples y derivar casos complejos a un agente humano.
- Prototipado rápido de aplicaciones de IA en entornos con restricciones de hardware: su tamaño reducido permite ejecutarlo en una CPU o GPU de gama baja, ideal para pruebas de concepto.
- Transcripción o resumen de textos cortos en somalí: aunque no se ha verificado su rendimiento, un modelo instruct pequeño puede utilizarse para tareas de extracción de información en textos breves.
- Investigación académica sobre procesamiento del lenguaje en lenguas africanas: sirve como punto de partida para estudiar el comportamiento de modelos pequeños en idiomas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han comparado sus capacidades con otros modelos bilingües somalí-inglés.

## Requisitos de hardware

- VRAM estimada: para 147M parámetros, en FP16 se necesitan aproximadamente 295 MB de memoria; en FP32, unos 590 MB. Con cuantización GGUF de 4 bits, el modelo puede ocupar menos de 100 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2050) o incluso CPU sola, gracias a su tamaño reducido.
- Es viable en dispositivos de borde, Raspberry Pi o teléfonos móviles con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, o servidores de inferencia como vLLM (aunque para este tamaño puede ser excesivo). El formato GGUF facilita su uso con llama.cpp.
- Latencia y throughput: no se dispone de datos oficiales, pero en una CPU moderna se esperan decenas de tokens por segundo para un modelo de este tamaño.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente entrenados para somalí. Como referencia genérica de modelos pequeños, se puede mencionar la familia SmolLM de Hugging Face (135M, 360M, 1.7B), que son modelos abiertos y eficientes para inglés y otros idiomas, pero no cubren somalí. La comparación directa no es posible por falta de datos de rendimiento y de cobertura lingüística.

## Limitaciones y advertencias

- Tamaño muy reducido: 150M parámetros limita severamente la capacidad de razonamiento, la coherencia en conversaciones largas y la precisión en tareas complejas.
- Sesgos y alucinaciones: al ser un modelo pequeño y sin documentación sobre su dataset, es probable que presente alucinaciones frecuentes y sesgos derivados de los datos de entrenamiento, que no se han auditado.
- Cobertura lingüística limitada: aunque se anuncia como bilingüe, no hay evidencia de su robustez en somalí más allá de frases simples.
- Licencia no especificada: el uso comercial, la redistribución o la modificación del modelo pueden estar sujetos a restricciones legales desconocidas. Se recomienda contactar al autor antes de usarlo en producción.
- Sin garantías de soporte: el proyecto parece experimental, con solo 19 descargas y sin actualizaciones recientes (última actualización en agosto de 2026).
- El tamaño del repositorio (5,9 GB) es desproporcionado para el número de parámetros, lo que puede indicar archivos innecesarios o problemas de gestión del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yacdev/SomaliLM-150M-Instruct
- Demo interactivo: https://huggingface.co/spaces/yacdev/SomaliLM-150M-Demo
- Versión GGUF (por mradermacher): https://huggingface.co/mradermacher/SomaliLM-150M-Instruct-GGUF
