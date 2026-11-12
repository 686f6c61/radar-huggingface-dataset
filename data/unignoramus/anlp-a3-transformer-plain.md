# unignoramus/anlp-a3-transformer-plain

## Resumen

`anlp-a3-transformer-plain` es un modelo de tipo transformer publicado por el usuario `unignoramus` en Hugging Face, con un total de 1.792.512 parámetros. Según su model card, se trata de un modelo para descifrado de cifrados ("cipher decryption model") asociado a la asignatura ANLP (Advanced Natural Language Processing), tarea A3, parte A. El modelo está formado por cuatro capas transformer apiladas y se carga mediante el módulo `src.part1.infer`.

El modelo es de pequeña escala: con menos de 2 millones de parámetros, está lejos de los modelos de lenguaje de propósito general y parece concebido como un artefacto académico para experimentar con tareas de descifrado. No se dispone de información sobre el conjunto de datos de entrenamiento, el tokenizador, los idiomas soportados ni la licencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden estar almacenados de forma muy compacta o que el repositorio solo contiene la configuración y los pesos en safetensors.

La relevancia de este modelo es limitada fuera del contexto docente para el que fue creado. No obstante, resulta útil como ejemplo de arquitectura transformer mínima aplicada a una tarea concreta de descifrado, y puede servir como referencia para quienes quieran reproducir experimentos similares con presupuestos de cómputo muy reducidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (4 capas apiladas, según model card) |
| Parámetros totales | 1.792.512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

La model card indica que el modelo se compone de cuatro capas transformer apiladas (`layers: ['transformer', 'transformer', 'transformer', 'transformer']`). No se especifica si se trata de un transformer encoder, decoder o encoder-decoder, ni se detallan parámetros como el número de cabezas de atención, la dimensión del modelo, la dimensión de las capas feed-forward o el vocabulario del tokenizador. Tampoco se indica la función de pérdida ni el esquema de entrenamiento.

No hay información disponible sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de técnicas de alineación como RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. El nombre del repositorio y la referencia a `src.part1.infer` sugieren que el modelo forma parte de un trabajo práctico de la asignatura ANLP, probablemente entrenado sobre un corpus sintético de cifrados, pero esto no se confirma en la información proporcionada.

## Capacidades

- Descifrado de cifrados: la model card define explícitamente el modelo como un "cipher decryption model", por lo que su capacidad principal es la transformación de texto cifrado en texto plano.
- Generación de texto: no confirmada; al ser un transformer de 4 capas y ~1,8 M de parámetros, su capacidad de generación libre es muy limitada.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Docencia y experimentación en NLP: el modelo puede utilizarse como ejemplo mínimo de transformer aplicado a una tarea de descifrado en un curso de procesamiento de lenguaje natural, permitiendo a los estudiantes inspeccionar la arquitectura y el flujo de inferencia con un coste computacional ínfimo.
- Pruebas de pipelines de inferencia: al cargarse con `src.part1.infer`, sirve para validar el correcto funcionamiento de un pipeline de carga de pesos safetensors y ejecución en PyTorch antes de escalar a modelos mayores.
- Reproducción de experimentos académicos: investigadores que quieran replicar la tarea A3 de ANLP pueden usar este modelo como referencia de resultados y de configuración de entrenamiento, aunque la falta de documentación limita la reproducibilidad.
- Benchmarking de infraestructura ligera: con 1,8 M de parámetros, el modelo cabe en cualquier GPU consumer e incluso en CPU, por lo que es útil para medir latencia y throughput de frameworks de inferencia en entornos con recursos mínimos.
- Análisis de arquitecturas transformer pequeñas: permite estudiar el comportamiento de un modelo de 4 capas en una tarea de transformación secuencia a secuencia, como base para comparar con arquitecturas más profundas.
- Prototipado de sistemas de descifrado: en un contexto controlado, puede integrarse en un prototipo de descifrador para cifrados sencillos, siempre que se valide su precisión con datos propios, ya que no se publican métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (1,8 M de parámetros equivalen a ~7 MB de pesos), por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), e incluso en Raspberry Pi o entornos sin GPU.
- Opciones de despliegue: PyTorch nativo mediante `src.part1.infer`; no se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI, y dado el formato safetensors y la ausencia de tokenizador documentado, es probable que solo funcione con el código de inferencia del autor.
- Latencia y throughput estimados: no disponible; por el tamaño, la latencia debería ser de milisegundos en GPU y de decenas de milisegundos en CPU, pero no hay datos publicados.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de descifrado con arquitectura y tamaño similares en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos.
- Riesgo de alucinación: no disponible; en tareas de descifrado, el modelo podría producir salidas plausibles pero incorrectas sin señal de confianza.
- Limitaciones de contexto o idioma: se desconoce la longitud máxima de contexto y los idiomas soportados; probablemente esté limitado a los cifrados vistos en entrenamiento.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes, no cuenta con documentación de entrenamiento ni métricas publicadas, y su código de inferencia depende de un módulo específico (`src.part1.infer`) que no está documentado en la model card. No es adecuado para entornos de producción sin una validación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/unignoramus/anlp-a3-transformer-plain
