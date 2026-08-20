# vcruz305/Ornith-1.5-35B-A3B-GGUF

## Resumen

Ornith-1.5-35B-A3B-GGUF es un conjunto de cuantizaciones GGUF del modelo base ornith-ai/Ornith-1.5-35B-A3B, un modelo de lenguaje de tipo MoE disperso con 256 expertos y 8 activos por token. El repositorio, creado por vcruz305, ofrece una escalera de cuantización de baja precisión (desde IQ1_S hasta IQ3_M) pensada para ejecutar el modelo en hardware con recursos limitados, manteniendo un equilibrio entre tamaño y calidad. El modelo base incorpora atención híbrida (lineal y completa) y una cabeza MTP (multi-token-prediction / NextN) para decodificación especulativa.

La relevancia de este repositorio radica en que permite desplegar un modelo de 35.5B parámetros totales en GPUs de consumo, gracias a la cuantización extrema y a la naturaleza MoE que solo activa una fracción de los parámetros por token. El autor ha aplicado una importance matrix (imatrix) mixta, calibrada con datos de tool-use, código y texto general, para mejorar la precisión en los tamaños más pequeños. Además, fija los tensores de la cabeza MTP a Q8_0 para evitar fallos de cuantización en bits muy bajos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (256 expertos, 8 activos por token) con atención híbrida lineal/completa y cabeza MTP/NextN |
| Parametros totales | 35.505.251.456 (35.5B) |
| Parametros activos | no disponible (8 de 256 expertos activos por token, sin dato numérico) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M (algunos pendientes de subida) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer MoE con 256 expertos y 8 activos por token, lo que reduce el coste computacional por inferencia frente a un modelo denso del mismo tamaño. Incorpora una atención híbrida que combina mecanismos lineales y de atención completa, y una cabeza MTP (multi-token-prediction) que permite decodificación especulativa en forks de llama.cpp que la soporten. No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO).

El proceso de cuantización de este repositorio utilizó una imatrix mixta con ~11M de caracteres, compuesta por un 45% de datos de tool-use (renderizados con la plantilla de chat), un 35% de código (excluyendo HumanEval para evitar contaminación en evaluaciones) y un 20% de wikitext-103. La calibración se realizó con llama-imatrix y alcanzó una perplejidad de 3.9309 ± 0.00885. Los tensores de la cabeza MTP (blk.40.*) se fijaron a Q8_0 en todas las cuantizaciones para evitar errores de cuantización en bits muy bajos.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para tareas de chat y diálogo, como indica su etiqueta "conversational".
- Soporte de tool calling / function calling: la inclusión de un 45% de datos de tool-use en la imatrix sugiere que el modelo base está entrenado para interacciones con herramientas, aunque no hay documentación oficial que lo confirme.
- Generación de código: el 35% de datos de código en la calibración apunta a que el modelo tiene capacidades de programación, aunque no se especifican los lenguajes ni el rendimiento.
- Decodificación especulativa: la cabeza MTP permite acelerar la generación si se usa un servidor con soporte para `--spec-type draft-mtp`.
- Multilingüismo: no hay información disponible sobre los idiomas soportados.

## Casos de uso

- Asistente de programación en entornos con recursos limitados: gracias a las cuantizaciones IQ1_S o IQ2_M (8-12 GB), el modelo puede ejecutarse en una GPU de consumo (p. ej., RTX 3060 12 GB) para autocompletar código, explicar fragmentos o generar tests, usando llama.cpp o llama-server.
- Agente autónomo con tool calling: el modelo puede integrarse en pipelines de agentes que necesiten llamar a APIs o ejecutar comandos, aprovechando su entrenamiento con datos de tool-use. La cuantización IQ3_M ofrece mejor calidad para tareas complejas de razonamiento multi-paso.
- Chatbot de atención al cliente: con una ventana de contexto configurable (p. ej., 8192 tokens en el ejemplo de uso), puede gestionar conversaciones multi-turno en un servidor local sin depender de la nube.
- Generación de documentación técnica: el modelo puede redactar documentación a partir de código fuente o especificaciones, gracias a su exposición a datos de código y texto general.
- Prototipado rápido de aplicaciones de NLP: al ser un MoE con solo 8 expertos activos, la inferencia es más rápida que un modelo denso equivalente, permitiendo iterar en tareas de clasificación, extracción de información o resumen.
- Despliegue en edge computing: las cuantizaciones más pequeñas (IQ1_S, 8.38 GB) caben en dispositivos con 8-12 GB de RAM unificada, como ciertos portátiles o mini-PCs, para aplicaciones offline de asistencia personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. La única métrica reportada es la perplejidad de calibración de la imatrix (3.9309 ± 0.00885), que no es comparable con benchmarks de tareas.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF varían entre 8.38 GB (IQ1_S) y ~14.52 GB (IQ3_XXS, con IQ3_XS/S/M pendientes de tamaño). Para cargar el modelo con contexto, se recomienda al menos 2-4 GB adicionales de VRAM, dependiendo de la longitud de contexto.
- GPU recomendadas: para las cuantizaciones más bajas (IQ1_S, IQ1_M, IQ2_XXS) basta una GPU con 12 GB de VRAM (p. ej., RTX 3060, RTX 4070). Para IQ2_M o IQ3_XXS se necesitan 16 GB (RTX 4080, RTX 4090, A5000). Las cuantizaciones IQ3_S e IQ3_M probablemente requieran 20-24 GB.
- Compatibilidad con consumer GPU: sí, las cuantizaciones IQ1_S a IQ2_M caben en GPUs de consumo de gama media-alta. Las IQ3 pueden requerir GPUs de gama alta o workstation.
- Opciones de despliegue: llama.cpp, llama-server, Ollama (si soporta estos formatos), y cualquier runtime compatible con GGUF. El autor menciona que fue cuantizado con una build CUDA para GB10 (Grace Blackwell), pero la inferencia funciona en builds estándar de llama.cpp.
- Latencia y throughput: no se proporcionan datos. Al ser un MoE con 8 expertos activos, la velocidad de generación será superior a un modelo denso de 35B, pero depende del hardware y de la cuantización.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información facilitada. Para una comparación justa, sería necesario evaluar Ornith-1.5-35B-A3B frente a otros MoE de tamaño similar (p. ej., Mixtral 8x7B, Qwen1.5-MoE-A2.7B) en tareas estándar, pero no se dispone de esos datos.

## Limitaciones y advertencias

- Cuantización de baja precisión: las cuantizaciones IQ1_S e IQ1_M son extremadamente agresivas y pueden degradar notablemente la calidad de generación, con riesgo de incoherencias o errores factuales. Se recomienda usar IQ2_M o superior para tareas críticas.
- Licencia desconocida: no se especifica la licencia del modelo base ni de las cuantizaciones. Esto puede impedir su uso comercial sin una revisión legal previa.
- Sin información sobre sesgos o alucinaciones: al no haber documentación del modelo base, no se conocen sesgos potenciales ni tasas de alucinación. Se debe validar el output en aplicaciones de producción.
- Longitud de contexto no documentada: aunque el ejemplo de uso emplea `-c 8192`, no se ha confirmado la ventana máxima soportada por el modelo base. Excederla puede causar degradación.
- Dependencia de la cabeza MTP: los tensores MTP están fijados a Q8_0, lo que añade un pequeño overhead de tamaño, pero no afecta a la inferencia estándar. Solo se aprovechan con forks MTP-aware.
- Riesgo de contaminación de benchmarks: el autor excluyó HumanEval de la imatrix para evitar contaminación, pero no hay garantía de que otros benchmarks no estén afectados por los datos de entrenamiento del modelo base.

## Enlaces

- Repositorio GGUF: [vcruz305/Ornith-1.5-35B-A3B-GGUF](https://huggingface.co/vcruz305/Ornith-1.5-35B-A3B-GGUF)
- Modelo base: [ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
