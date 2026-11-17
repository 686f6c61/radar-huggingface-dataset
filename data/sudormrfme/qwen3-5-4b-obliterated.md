# SudoRmRfMe/Qwen3.5-4B-OBLITERATED

## Resumen

Qwen3.5-4B-OBLITERATED es un derivado del modelo Qwen/Qwen3.5-4B al que se le ha aplicado una técnica de "abliteration" mediante la herramienta OBLITERATUS, con el objetivo declarado de eliminar el comportamiento de rechazo (refusal behavior) del modelo base. Lo publica el usuario SudoRmRfMe en Hugging Face y se distribuye con el identificador SudoRmRfMe/Qwen3.5-4B-OBLITERATED. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 17 de noviembre de 2026.

El modelo conserva la arquitectura del base (etiqueta `qwen3_5_text`), un transformer de 4.205.751.296 parámetros totales según los pesos en safetensors, lo que lo sitúa en la gama de 4B. El repositorio ocupa 8,4 GB, coherente con pesos en precisión de 16 bits. No se documentan en la model card ni la longitud de contexto, ni la composición del entrenamiento, ni datos de benchmarks.

Su relevancia es acotada: se trata de un fine-tune de desalineación de seguridad orientado a investigación sobre mecanismos de rechazo y edición de activaciones, no un modelo de propósito general recomendado para producción. La model card es mínima y no aporta garantías de calidad, licencia ni procedencia de datos más allá del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5_text` del modelo base Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parámetros. Sobre ese base se aplica el método `advanced` de OBLITERATUS, una herramienta de código abierto basada en ingeniería de activaciones (abliteration). Esta técnica identifica direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y las proyecta fuera o las atenúa, ajustando los pesos para reducir la probabilidad de respuestas de negativa sin reentrenar el modelo desde cero con datos nuevos.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco documenta qué capas o componentes se modificaron exactamente dentro del pipeline `advanced`, ni si se preservaron las capacidades de razonamiento, tool calling o modo thinking del base. No hay información sobre evaluación de degradación de capacidades tras la abliteración.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3.5-4B.
- Comportamiento de rechazo atenuado o eliminado de forma deliberada mediante abliteration.
- Capacidades de razonamiento, código y matemáticas: presumibles por herencia del base, pero no verificadas ni documentadas tras la modificación.
- Soporte de tool calling / function calling: no disponible en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible en la model card.
- Capacidades multilingües: la tarjeta declara únicamente inglés (`en`).
- Modo thinking, visión o audio: no disponible en la model card.

## Casos de uso

- Investigación sobre seguridad y alineación: estudiar cómo la abliteration altera las representaciones internas de rechazo y qué coste tiene en capacidades generales, comparando salidas con el modelo base.
- Evaluación de robustez de filtros: medir hasta qué punto técnicas de edición de activaciones evitan las salvaguardas de un modelo afinado y qué contramedidas de moderación externa son necesarias.
- Generación creativa sin fricción: escenarios de escritura de ficción o contenido sensible donde el rechazo del modelo base resulta un obstáculo, siempre con revisión humana y cumplimiento legal.
- Experimentos académicos reproducibles: usar el pipeline OBLITERATUS para replicar la metodología `advanced` sobre el mismo base y contrastar resultados.
- Pruebas de red teaming controladas: generar respuestas adversarias en entornos aislados para entrenar clasificadores de seguridad.
- Prototipado local en hardware de consumo: con 4,2B parámetros y 8,4 GB de pesos, puede ejecutarse en GPU de gama alta de consumo para experimentos de edición de modelos, aunque las herramientas de despliegue no están documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~8,4 GB en fp16 para los pesos; ~4,2 GB en cuantización de 8 bits y ~2,5 GB en 4 bits (estimaciones por tamaño de parámetros, no verificadas con este checkpoint).
- GPU recomendadas: A100, H100 o L40S para fp16 con contexto largo; RTX 4090 o RTX 3090 para fp16 en modo ajustado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantización a 4 bits, en GPUs con 8 GB de VRAM.
- Opciones de despliegue: transformers (según el ejemplo de la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión previa a GGUF o formatos compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SudoRmRfMe/Qwen3.5-4B-OBLITERATED | 4,21B | no disponible | no disponible | Abliterado con OBLITERATUS, solo inglés, sin benchmarks |
| Qwen/Qwen3.5-4B | 4,21B (presumible) | no disponible | no disponible | Modelo base con alineación de seguridad intacta |
| Otros derivados abliterados de Qwen | variable | no disponible | variable | Existen variantes comunitarias similares; no se dispone de datos verificados para esta comparativa |

## Limitaciones y advertencias

- La eliminación del rechazo puede incrementar la generación de contenido dañino, ilegal o inseguro; no es apto para aplicaciones de cara al público sin moderación externa.
- Riesgo elevado de alucinación y de degradación de capacidades respecto al base, ya que no se documenta ninguna evaluación tras la abliteration.
- Sesgos: no documentados; hereda los del modelo base, con el añadido de que la edición de activaciones puede alterar el comportamiento en dominios sensibles de forma impredecible.
- Idioma: la tarjeta declara únicamente inglés; el rendimiento en castellano no está verificado.
- Licencia no especificada: no hay garantía de uso comercial y debe comprobarse la licencia del modelo base Qwen3.5-4B antes de cualquier despliegue.
- Repositorio sin tracción (0 descargas, 0 likes) y con model card mínima: sin garantías de mantenimiento, soporte ni reproducibilidad.
- No se documentan los cambios exactos del método `advanced`, lo que dificulta auditar qué se ha modificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SudoRmRfMe/Qwen3.5-4B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
