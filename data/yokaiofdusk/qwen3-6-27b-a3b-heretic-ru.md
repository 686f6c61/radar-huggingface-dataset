# YokaiOfDusk/Qwen3.6-27b-A3B-Heretic-Ru

## Resumen

YokaiOfDusk/Qwen3.6-27b-A3B-Heretic-Ru es un modelo de lenguaje derivado por el usuario YokaiOfDusk a partir de HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, que a su vez parte de la familia Qwen3.6 con arquitectura de mezcla de expertos (MoE). El nombre indica una variante orientada al ruso ("Ru") y con un ajuste de tipo "Heretic", denominacion habitual en la comunidad para finetunes que eliminan los rechazos y el alineamiento de seguridad del modelo original. La nomenclatura "27b-A3B" sugiere 27 mil millones de parametros totales con aproximadamente 3 mil millones activos por token, aunque el modelo base declarado figura como "35B-A3B", por lo que existe una discrepancia entre el nombre y la referencia que el autor no documenta.

El modelo se publica bajo licencia Apache 2.0 y esta etiquetado exclusivamente para el idioma ruso. No incluye pipeline declarado, no tiene descargas ni interacciones en el momento de la consulta y su model card se limita a los metadatos de licencia e idioma, sin documentacion tecnica adicional. Esto lo convierte en un artefacto de investigacion de trazabilidad limitada: se desconoce el procedimiento exacto de finetune, los datos utilizados y cualquier evaluacion de calidad.

Su relevancia es acotada y experimental. Resulta de interes para quienes investigan tecnicas de "abliteration" o desalineamiento de modelos, para estudios de comportamiento multilingue en ruso y para experimentacion con variantes MoE de bajo coste de inferencia, pero no constituye una opcion recomendable para produccion sin una evaluacion previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, heredada de la familia Qwen3.6 (detalle no disponible) |
| Parametros totales | 27B segun el nombre del modelo; el base declarado figura como 35B-A3B (discrepancia no resuelta) |
| Parametros activos | Aproximadamente 3B por token (segun la nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ruso (etiqueta `ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer con mezcla de expertos, segun la convencion de nombres de la familia Qwen3.6 (sufijo A3B para expertos activos). No obstante, la model card no aporta ningun detalle sobre el numero de capas, la dimension oculta, el numero de expertos, el mecanismo de enrutamiento ni la atencion utilizada. Tampoco se especifica la longitud de contexto nativa, un dato critico en esta familia de modelos.

Respecto al entrenamiento, solo se conoce la cadena de derivacion: el modelo parte de HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, un finetune ya desalineado del Qwen3.6 original, y sobre el se aplica un ajuste adicional etiquetado como "Heretic" y orientado al ruso. Se desconoce el volumen de tokens de entrenamiento, la composicion del dataset, si se emplearon tecnicas de RLHF, DPO o simplemente SFT, y si hubo mezcla de datos en ruso o traduccion de instrucciones. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto en ruso, idioma para el que esta etiquetado el modelo.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.6, sin evaluacion publicada en esta variante.
- Generacion de codigo y matematicas: presumiblemente conservadas del base, aunque no verificadas ni documentadas.
- Modo "uncensored": el ajuste elimina total o parcialmente los rechazos de seguridad del modelo original, lo que permite generar contenido que el base rechazaria.
- Soporte de tool calling y function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ruso segun la etiqueta del autor; el comportamiento en otros idiomas no esta verificado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre desalineamiento y abliteration: el modelo sirve como objeto de estudio para medir como evoluciona la tasa de rechazo y la calidad del texto tras aplicar tecnicas de eliminacion de alineamiento sobre un MoE ya modificado, comparando contra el base HauhauCS.
- Generacion de texto creativo en ruso sin restricciones tematicas: escritura de ficcion, dialogos o narrativa que el modelo original rechazaria por politicas de contenido; requiere revision editorial humana por la ausencia de filtros.
- Experimentacion con inferencia MoE de bajo coste: con unos 3B parametros activos por token, el modelo permite probar tecnicas de despliegue eficiente (vLLM, SGLang) en entornos con presupuesto de GPU limitado, siempre que se confirme la arquitectura real.
- Evaluacion comparativa de calidad en ruso: uso como linea base en benchmarks internos de generacion en ruso frente a modelos como Qwen, Gemma o Llama, para cuantificar la degradacion introducida por el finetune.
- Prototipado de asistentes conversacionales en ruso: pruebas de concepto de chatbots multi-turno en un entorno controlado y no expuesto al publico, dado que no hay garantias de seguridad ni de contexto.
- Estudio de sesgos y toxicidad: analisis de como un finetune sin alineamiento afecta a la produccion de contenido sesgado o danino en ruso, util para trabajos de seguridad de IA.
- Dataset augmentation controlada: generacion de datos sinteticos en ruso para tareas de investigacion, con filtrado posterior obligatorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un MoE de ~27B totales y ~3B activos, en cuantizacion de 4 bits se requeririan aproximadamente 15-18 GB solo para pesos, mas overhead de contexto y cache KV; en FP16, alrededor de 54 GB. Estas cifras son estimaciones basadas en el tamano declarado y no en mediciones del autor.
- GPU recomendadas: no documentadas. Por tamano, una RTX 4090 (24 GB) podria alojar el modelo en 4 bits con contexto limitado; para FP16 serian necesarias A100 80 GB, H100 o multiples GPU.
- Compatibilidad con GPU de consumo: probable en cuantizaciones de 4-5 bits en GPUs de 24 GB o superiores, condicionado a que existan pesos GGUF publicados, lo cual no esta confirmado.
- Opciones de despliegue: no documentadas. Por la arquitectura MoE se podria intentar vLLM o SGLang si la arquitectura es compatible; llama.cpp u Ollama requeririan conversiones GGUF no publicadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Estado |
|---|---|---|---|---|---|
| YokaiOfDusk/Qwen3.6-27b-A3B-Heretic-Ru | ~27B totales / ~3B activos (segun nombre) | no disponible | Apache 2.0 | Ruso | Publicado, sin descargas ni evaluacion |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~35B totales / ~3B activos | no disponible | no disponible | no disponible | Modelo base declarado |
| Qwen3.6 (familia original) | Variantes MoE de ~30B | no disponible | Apache 2.0 (segun familia) | Multilingue | Modelo de referencia upstream |

La comparativa cuantitativa no es posible: no hay benchmarks publicados para esta variante ni datos tecnicos del modelo base en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card no describe arquitectura, datos, entrenamiento ni evaluaciones, lo que impide validar el modelo.
- Discrepancia de parametros: el nombre indica 27B y el base declarado 35B-A3B; no se aclara si hubo poda, reentrenamiento o si el nombre es erroneo.
- Modelo "uncensored": el finetune elimina o reduce los rechazos de seguridad, por lo que puede generar contenido danino, ilegal o sexualmente explicito sin filtros; no apto para aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo elevado de alucinacion: sin evaluacion y con un finetune agresivo sobre un base ya modificado, la fidelidad factual no esta garantizada.
- Idioma limitado al ruso segun el autor; el rendimiento en castellano u otros idiomas es desconocido y probablemente degradado.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin medir previamente la ventana efectiva.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la cadena de derivacion incluye un modelo "uncensored" de procedencia y terminos no verificados.
- Cero descargas y cero interacciones: no hay evidencia de uso comunitario ni de que el modelo funcione correctamente.
- Fecha de creacion futura (2026-11-03) en los metadatos, lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YokaiOfDusk/Qwen3.6-27b-A3B-Heretic-Ru
- Modelo base declarado: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Paper, blog, repositorio o demo adicionales: no disponible
