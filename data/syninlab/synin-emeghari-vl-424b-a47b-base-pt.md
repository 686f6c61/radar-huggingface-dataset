# Syninlab/SYNIN-EMEGHARI-VL-424B-A47B-Base-PT

## Resumen

SYNIN-EMEGHARI-VL-424B-A47B-Base-PT es una publicacion de Syninlab que redistribuye los pesos en formato PyTorch del modelo ERNIE-4.5-VL-424B-A47B-Base, desarrollado originalmente por Baidu. Se trata de un modelo multimodal de tipo Mixture of Experts (MoE) con 424.000 millones de parametros totales y 47.000 millones activos por token, disenado para tareas de comprension conjunta de texto e imagen (pipeline image-text-to-text). El sufijo "-PT" indica pesos estilo PyTorch para transformers, frente a los "-Paddle" que usan pesos nativos de PaddlePaddle.

El modelo emplea una arquitectura MoE heterogenea con expertos separados para texto y vision (64 expertos totales y 8 activos por modalidad), 54 capas y una longitud de contexto de 131.072 tokens. Es un modelo en etapa de preentrenamiento (Base), no ajustado para instrucciones ni con preferencias, lo que condiciona su uso: sirve como base para fine-tuning o para evaluacion de capacidades crudas, no como asistente listo para produccion.

Su relevancia radica en ser una de las pocas implementaciones abiertas de gran escala que combina MoE multimodal con ventana de contexto extensa y licencia Apache 2.0, lo que facilita su inspeccion, adaptacion e integracion en pipelines de investigacion. No obstante, el repositorio es practicamente nuevo (0 descargas, 0 likes) y el peso del repositorio es de 847,2 GB, lo que exige infraestructura de despliegue considerable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + vision), 54 capas, 64 cabezas Q / 8 KV |
| Parametros totales | 423.526.285.184 (aprox. 424B) |
| Parametros activos | 47B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (la model card original menciona cuantizacion 4-bit/2-bit sin perdida mediante "convolutional code quantization" para la familia ERNIE 4.5, pero no se detalla para este checkpoint) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers, PyTorch, custom_code) |
| Expertos de texto (total / activos) | 64 / 8 |
| Expertos de vision (total / activos) | 64 / 8 |
| Etapa de entrenamiento | Preentrenamiento (Base) |
| Tamano del repositorio | 847,2 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura MoE heterogenea en la que los expertos se separan por modalidad: 64 expertos de texto y 64 expertos de vision, con 8 activos por token en cada caso. Esta separacion, junto con el enrutamiento aislado por modalidad, la perdida de ortogonalidad del router y la perdida de equilibrio de tokens multimodal, busca evitar que una modalidad interfiera en el aprendizaje de la otra durante el entrenamiento conjunto. El modelo incorpora un ViT para extraccion de caracteristicas visuales, un adaptador para transformacion de caracteristicas y expertos visuales dedicados.

El entrenamiento se realizo en tres etapas: las dos primeras entrenan solo parametros relacionados con texto para consolidar comprension linguistica y procesamiento de texto largo; la tercera etapa introduce los parametros multimodales y extiende las capacidades a imagenes y video. Segun la model card, el preentrenamiento abarco billones de tokens. La infraestructura de entrenamiento emplea paralelismo hibrido heterogeneo, equilibrio jerarquico de carga, entrenamiento en precision mixta FP8 y recomputacion de granularidad fina sobre PaddlePaddle. Para inferencia se mencionan colaboracion multi-experto, cuantizacion 4-bit/2-bit sin perdida y desagregacion PD con conmutacion dinamica de rol.

Al ser un checkpoint Base, no se ha aplicado SFT, DPO ni UPO en esta version; esas tecnicas se aplican en las variantes post-entrenadas de la familia ERNIE 4.5, no en este modelo.

## Capacidades

- Generacion y comprension de texto en ingles y chino.
- Comprension de imagenes y razonamiento cruzado texto-imagen (pipeline image-text-to-text).
- Procesamiento de contexto largo de hasta 131.072 tokens, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Capacidad multimodal nativa gracias a los expertos de vision y al ViT integrado.
- Al ser un modelo Base, no incluye alineacion para instrucciones, tool calling ni modo de razonamiento explicito (thinking mode); estas capacidades corresponden a las variantes post-entrenadas de ERNIE 4.5, no a este checkpoint.
- Soporte de inferencia via vLLM (>=0.11.2) con tensor parallelism.

## Casos de uso

- Fine-tuning para tareas multimodales especificas: al ser un Base con licencia Apache 2.0, sirve como punto de partida para ajustar un modelo texto-imagen a dominios como inspeccion visual industrial o analisis de documentos escaneados.
- Investigacion en arquitecturas MoE multimodales: su estructura de expertos separados por modalidad permite estudiar enrutamiento, equilibrio de carga y transferencia entre modalidades con pesos abiertos.
- Procesamiento de documentos largos con contenido visual: la ventana de 131.072 tokens permite ingerir informes extensos con figuras y tablas en una sola pasada para tareas de extraccion o resumen (previa adaptacion con fine-tuning).
- Generacion de descripciones y analisis de imagenes en ingles y chino: util para construir datasets anotados o pipelines de catalogacion bilingue.
- Base para evaluacion comparativa de modelos MoE de gran escala: permite medir capacidades crudas de preentrenamiento frente a otros checkpoints Base.
- Experimentacion con cuantizacion extrema (4-bit/2-bit) en entornos de investigacion, aprovechando las tecnicas descritas por el autor original para reducir requisitos de memoria.
- Desarrollo de asistentes bilingues especializados tras un proceso de SFT/DPO propio, partiendo de un modelo con contexto largo y capacidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa: el repositorio ocupa 847,2 GB, por lo que se requiere un cluster multi-GPU; la model card indica 16 GPU de 80 GB con tensor parallelism para vLLM.
- GPU recomendadas: A100 80 GB, H100 80 GB u equivalentes en configuracion de 16 unidades para el checkpoint completo.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en su forma nativa; requeriria cuantizacion agresiva y aun asi seria inviable por el tamano total de parametros.
- Opciones de despliegue: vLLM >= 0.11.2 con `--tensor-parallel-size 16 --trust-remote-code`; el ecosistema PaddlePaddle es la via nativa del autor original. No se documenta soporte de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SYNIN-EMEGHARI-VL-424B-A47B-Base-PT (este) | 424B / 47B | 131.072 | Apache 2.0 | Safetensors (PyTorch) | Redistribucion de ERNIE-4.5-VL-424B-A47B-Base |
| ERNIE-4.5-VL-424B-A47B-Base (Baidu) | 424B / 47B | 131.072 | Apache 2.0 | Pesos PaddlePaddle | Modelo original del que deriva este checkpoint |
| Alternativas MoE multimodales de escala comparable | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo Base sin alineacion: no sigue instrucciones de forma fiable, no esta optimizado para dialogo y puede producir continuaciones genericas o incoherentes.
- Riesgo de alucinacion elevado en tareas generativas sin post-entrenamiento.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Sesgos potenciales derivados de los datos de preentrenamiento, no mitigados mediante RLHF/DPO en este checkpoint.
- Requisitos de hardware muy elevados (16 GPU de 80 GB para inferencia en vLLM), lo que limita su uso practico fuera de entornos de investigacion.
- Repositorio sin traccion (0 descargas, 0 likes) y publicado recientemente; no hay validacion comunitaria ni garantias de mantenimiento.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo original de Baidu y de los datos de entrenamiento antes de un uso comercial.
- La cuantizacion 4-bit/2-bit mencionada por el autor original no esta documentada para este checkpoint concreto.

## Enlaces

- Hugging Face: https://huggingface.co/Syninlab/SYNIN-EMEGHARI-VL-424B-A47B-Base-PT
- Modelo original (Baidu): https://huggingface.co/baidu/ERNIE-4.5-VL-424B-A47B-Base-PT
- Web oficial ERNIE: https://ernie.baidu.com/
- Blog ERNIE 4.5: https://ernie.baidu.com/blog/ernie4.5
- Repositorio GitHub ERNIE: https://github.com/PaddlePaddle/ERNIE
- Repositorio PaddlePaddle: https://github.com/PaddlePaddle/Paddle
- Discord: https://discord.gg/JPmZXDsEEK
- X (Twitter) PaddlePaddle: https://x.com/PaddlePaddle
