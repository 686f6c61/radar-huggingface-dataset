# VTN-TokenFactory/Telasap-4B-v1.0

## Resumen

Telasap-4B-v1.0 es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-4B, publicado por el perfil VTN-TokenFactory en Hugging Face. El modelo se presenta como un "modelo de decisión" de la familia Telasap, con aproximadamente 4.500 millones de parámetros en precisión bfloat16 y licencia Apache 2.0. El pipeline declarado en el hub es image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la model card no detalla tareas de visión concretas.

La relevancia de este checkpoint es limitada y conviene ser explícito: el repositorio registra cero descargas y cero "likes" en el momento de la consulta, la model card es extremadamente escueta y el propio autor advierte de que el modelo solo funciona correctamente con un paquete de inferencia propietario denominado "Telasap", no disponible públicamente. Cargarlo con `transformers` estándar no reproduce el comportamiento previsto, según la documentación del autor.

Por tanto, esta ficha debe leerse como una descripción de un artefacto de investigación de acceso restringido en la práctica, no como una recomendación de despliegue en producción. Los datos disponibles permiten caracterizar el tamaño, la arquitectura heredada y el formato, pero no el rendimiento real ni los detalles del ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B; detalles no disponibles) |
| Parámetros totales | 4.539.265.536 (~4,5 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint Qwen/Qwen3.5-4B, por lo que su arquitectura de base corresponde a la familia Qwen3.5 en su variante de 4.000 millones de parámetros. La información proporcionada no incluye detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. El pipeline declarado (image-text-to-text) apunta a que el modelo base es multimodal, con entrada de imagen y texto, pero no se especifica qué componentes se han ajustado ni si se ha preservado la torre visual.

Respecto al entrenamiento, la model card no aporta ningún dato: no se indica el volumen de tokens, la composición del dataset, si hubo supervisión fina (SFT), aprendizaje por refuerzo con retroalimentación humana (RLHF) o preferencias (DPO), ni el propósito exacto de la etiqueta "decision" que aparece en los tags. La única precisión técnica relevante es que el checkpoint se distribuye en bfloat16 y que su uso previsto depende de un paquete de inferencia externo llamado Telasap, lo que implica que el ajuste probablemente modifica el formato de salida o el protocolo de decodificación de una manera que el pipeline estándar de `transformers` no interpreta correctamente.

## Capacidades

- Generación de texto y conversación multi-turno: el tag `conversational` sugiere uso en diálogo, aunque no se documentan formatos de prompt ni plantillas de chat.
- Procesamiento de imagen y texto: el pipeline `image-text-to-text` indica entrada multimodal, con capacidad de razonamiento sobre imágenes combinadas con instrucciones textuales.
- Toma de decisiones: el tag `decision` y la descripción como "decision model" apuntan a una especialización en tareas de clasificación o selección de acciones, sin que se detalle el esquema de salida.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el repositorio puede servirse mediante la infraestructura de Inference Endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo de razonamiento explícito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Investigación sobre ajuste fino de modelos multimodales de 4B: el checkpoint sirve como ejemplo de cómo un autor puede especializar Qwen3.5-4B para una tarea concreta ("decision") manteniendo la licencia Apache 2.0; útil para estudiar estrategias de finetune, aunque sin acceso al paquete Telasap no se puede reproducir el comportamiento.
- Evaluación de pipelines de decisión multimodal en entornos controlados: si se obtiene acceso al paquete de inferencia, el modelo podría emplearse en tareas donde se recibe una imagen y una instrucción y debe emitirse una decisión estructurada, por ejemplo en clasificación de documentos visuales o verificación de contenido.
- Prototipado de asistentes conversacionales con entrada visual: el pipeline image-text-to-text permitiría, en teoría, construir un asistente que responda a preguntas sobre imágenes en una conversación multi-turno, siempre que se resuelva la dependencia del paquete propietario.
- Base para experimentos de alineación y evaluación de sesgos: al ser un finetune pequeño y abierto en licencia, puede utilizarse como sujeto de pruebas en estudios sobre comportamiento de modelos ajustados para decisiones, comparando sus salidas con las del Qwen3.5-4B original.
- Integración en flujos de trabajo internos con Inference Endpoints: el tag `endpoints_compatible` permite desplegarlo en la infraestructura gestionada de Hugging Face, lo que facilita pruebas de latencia y throughput en un entorno reproducible antes de invertir en infraestructura propia.
- Referencia para auditoría de licencias y trazabilidad de modelos derivados: dado que el autor declara explícitamente la licencia Apache 2.0 y el modelo base, este repositorio es útil como caso de estudio de buenas prácticas (o de sus carencias) en la documentación de finetunes publicados en el hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9 GB solo para los pesos (4.539 millones de parámetros × 2 bytes), más memoria para el contexto y las activaciones; en la práctica, entre 10 y 12 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB para pesos; en 4 bits, alrededor de 3 GB. Estas cifras son estimaciones a partir del número de parámetros, ya que el autor no publica versiones cuantizadas.
- GPU recomendadas: para bfloat16, una RTX 4090 (24 GB) o una A100/H100 de 40-80 GB permiten holgura de contexto; una RTX 3090/4080 de 16 GB también es viable con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bfloat16, y en tarjetas de 8 GB si se cuantiza a 8 o 4 bits, siempre que se resuelva la dependencia del paquete Telasap.
- Opciones de despliegue: `transformers` estándar no reproduce el comportamiento previsto según el autor; se requiere el paquete Telasap. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF publicados, llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Telasap-4B-v1.0 | ~4,5 B | no disponible | Apache 2.0 | Pesos públicos, inferencia restringida al paquete Telasap | Finetune de Qwen3.5-4B orientado a decisiones |
| Qwen/Qwen3.5-4B | ~4 B | no disponible en esta ficha | según modelo base (no verificada aquí) | Público y estándar | Modelo base multimodal; comportamiento reproducible con `transformers` |
| Alternativas de ~4 B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación rigurosa con otros modelos de la misma categoría no es posible con los datos disponibles: no se conocen benchmarks, contexto ni rendimiento de Telasap-4B-v1.0, y la información sobre el propio Qwen3.5-4B no se ha incluido en el material de referencia.

## Limitaciones y advertencias

- Dependencia crítica de un paquete propietario: el autor afirma que cargar el checkpoint con `transformers` estándar no reproduce el comportamiento previsto y que es necesario contactar con los mantenedores para obtener acceso al paquete Telasap. Esto invalida su uso directo en la mayoría de pipelines abiertos.
- Documentación insuficiente: no se especifican idiomas, contexto, datos de entrenamiento, esquema de salida ni formato de prompt, lo que impide evaluar su idoneidad para una tarea concreta.
- Ausencia de validación comunitaria: cero descargas y cero "likes" en el momento de la consulta; no hay evidencia pública de que el modelo funcione según lo descrito.
- Riesgo de alucinación: no cuantificado; al ser un finetune de un modelo generativo de 4B, es esperable un riesgo no trivial, pero no se aportan evaluaciones.
- Sesgos conocidos: no documentados; se heredarían en parte los del modelo base Qwen3.5-4B, que no se detallan en la información proporcionada.
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que en principio permite uso comercial, pero el uso previsto depende de un componente externo (Telasap) cuya licencia y condiciones no se especifican; conviene verificar antes de cualquier despliegue comercial.
- Caveat para producción: sin benchmarks, sin documentación de contexto y con una dependencia de inferencia no pública, no se recomienda su uso en entornos productivos sin una evaluación interna exhaustiva y acceso confirmado al paquete requerido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VTN-TokenFactory/Telasap-4B-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/VTN-TokenFactory
- Paquete de inferencia Telasap: no disponible (el autor indica contactar con los mantenedores)
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
