# yethdev/qwen3.5-9b-manumit-v2-preview

## Resumen

yethdev/qwen3.5-9b-manumit-v2-preview es un fine-tune del modelo Qwen/Qwen3.5-9B, publicado por el desarrollador yethdev bajo licencia MIT. El nombre "manumit" (del latín, "liberar") y la etiqueta "abliterated" indican que el proceso de ajuste ha eliminado o reducido los mecanismos de rechazo y las restricciones de seguridad del modelo base, con el objetivo de obtener respuestas menos censuradas. La model card es extremadamente escueta: solo contiene la frase "Just a glimpse of what to come", lo que sugiere que se trata de una versión preliminar o de demostración de un proyecto más amplio.

El modelo base, Qwen3.5-9B, pertenece a la serie Qwen3.5, que según las fuentes públicas integra una fundación unificada de visión-lenguaje con entrenamiento temprano de fusión multimodal, superando a Qwen3-VL en razonamiento, codificación, agentes y comprensión visual. Sin embargo, el pipeline declarado en HuggingFace es text-generation, y los tags incluyen tanto text-generation como image-text-to-text, lo que sugiere que el fine-tune podría conservar capacidades multimodales, aunque no hay documentación que lo confirme. Con 9.409.813.744 parámetros y un tamaño de repositorio de 18.8 GB en formato safetensors, se posiciona en la gama de modelos de ~9B, adecuados para despliegue en GPU de consumo con cuantización.

La relevancia actual de este modelo reside en su carácter de preview de una línea de desarrollo que combina el rendimiento de Qwen3.5 con un enfoque de "abliteración" (eliminación de refusal). Para desarrolladores que buscan modelos con menos restricciones en entornos de investigación o generación creativa, esta ficha puede servir como punto de partida, aunque la falta de documentación técnica y de benchmarks limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato original safetensors en fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen/Qwen3.5-9B. La arquitectura del base corresponde a la serie Qwen3.5, que según la documentación pública integra una fundación unificada de visión-lenguaje con entrenamiento temprano de fusión multimodal sobre billones de tokens. No se dispone de detalles específicos sobre el proceso de fine-tune: no se indica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. La etiqueta "abliterated" sugiere que se aplicó una técnica de eliminación de refusal (posiblemente mediante ajuste fino sobre respuestas sin rechazo o mediante modificación de pesos), pero el autor no ha publicado metodología alguna. El repositorio solo contiene los pesos en formato safetensors, sin código de entrenamiento ni configuraciones adicionales.

## Capacidades

- Generacion de texto: el modelo puede producir respuestas conversacionales y de texto libre, heredadas del base Qwen3.5-9B.
- Razonamiento y codificacion: el base Qwen3.5 destaca en tareas de razonamiento, codificacion y agentes, segun las fuentes publicas; el fine-tune presumiblemente conserva estas capacidades, aunque no hay evaluaciones propias.
- Posible soporte multimodal: el tag image-text-to-text en HuggingFace indica que el modelo base acepta entradas de imagen y texto, pero el pipeline declarado es text-generation. No se puede confirmar si el fine-tune mantiene la rama visual.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Generacion creativa sin restricciones: dado el caracter "abliterated", el modelo puede emplearse para explorar narrativas, dialogos o contenido que otros modelos rechazarian por politicas de seguridad. Es adecuado para prototipos de escritura experimental o investigacion sobre comportamientos de modelos.
- Asistentes conversacionales personalizados: al estar basado en Qwen3.5-9B, puede servir como base para chatbots de dominio especifico, siempre que se ajuste con datos propios.
- Investigacion sobre alineacion y seguridad: el modelo permite estudiar los efectos de la abliteracion en el comportamiento de un LLM, comparando respuestas antes y despues del proceso.
- Desarrollo de agentes de codificacion: si conserva las capacidades del base, puede integrarse en pipelines de generacion de codigo, aunque se recomienda validar su rendimiento con benchmarks propios.
- Analisis de texto y extraccion de informacion: para tareas de clasificacion o resumen, aunque no hay garantias de calidad sin evaluacion.
- Demostraciones y pruebas de concepto: al ser una preview, es util para validar la viabilidad tecnica de un enfoque de fine-tune antes de invertir en un modelo mas completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Tampoco hay comparativas con el modelo base o con alternativas. Se recomienda ejecutar evaluaciones propias antes de considerar el modelo para produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.4B parametros, en precision fp16/bf16 el modelo ocupa aproximadamente 18.8 GB, por lo que se necesitan al menos 20 GB de VRAM para carga completa. Con cuantizacion a 8 bits (int8) se reduce a ~9.4 GB, y a 4 bits (int4) a ~4.7 GB, asumiendo que el modelo sea compatible con dichas cuantizaciones (no confirmado).
- GPU recomendadas: para fp16, una NVIDIA A100 (40/80 GB), RTX A6000 (48 GB) o RTX 4090 (24 GB) son suficientes. Para cuantizacion int4, una RTX 3080/3090 (10-24 GB) o incluso una RTX 4060 (8 GB) podrian ser viables, dependiendo del contexto.
- Compatibilidad con GPU de consumo: si, con cuantizacion adecuada. La serie RTX 30/40 puede ejecutar el modelo en int4/int8.
- Opciones de despliegue: al ser un modelo transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (si se genera un archivo Modelfile). No se proporcionan configuraciones especificas.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este fine-tune especifico. Como referencia, el modelo base Qwen3.5-9B compite con otros LLMs de ~9B como Llama 3.1 8B, Mistral 7B o Gemma 2 9B, pero no hay metricas oficiales de yethdev que permitan una comparacion cuantitativa. Se recomienda consultar los benchmarks de Qwen3.5-9B en el repositorio oficial de Qwen para obtener una referencia del rendimiento base.

## Limitaciones y advertencias

- Falta de documentacion: la model card no aporta informacion sobre el proceso de entrenamiento, datos utilizados, ni evaluaciones. Es una preview sin garantias.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en dominios especializados.
- Sesgos y comportamientos indeseados: la abliteracion puede eliminar no solo los rechazos, sino tambien mecanismos de seguridad importantes, lo que podria llevar a respuestas ofensivas, peligrosas o ilegales. El uso debe limitarse a entornos controlados y eticos.
- Licencia MIT: permite uso comercial, pero el autor no ofrece soporte ni responsabilidad. El modelo base Qwen3.5 puede tener su propia licencia (Apache 2.0 segun la serie Qwen), pero el fine-tune se publica bajo MIT.
- Capacidades multimodales inciertas: aunque el tag sugiere vision, el pipeline es text-generation. No se puede asumir que el modelo procese imagenes correctamente.
- Sin garantias de rendimiento: al no haber benchmarks, no se recomienda su uso en produccion sin una evaluacion exhaustiva previa.
- Contexto y longitud: se desconoce la ventana de contexto, lo que limita la planificacion de aplicaciones que requieran contextos largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yethdev/qwen3.5-9b-manumit-v2-preview
- Version anterior (v1): https://huggingface.co/yethdev/qwen3.5-9b-manumit-v1
- Catalogo de modelos de Microsoft Foundry (Qwen3.5-9B): https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
- Repositorio GitHub de Qwen3.5 (referencia del modelo base): https://github.com/wendashi/Qwen3.5
- Pagina de Ollama para qwen3.5:9b: https://ollama.com/library/qwen3.5:9b
