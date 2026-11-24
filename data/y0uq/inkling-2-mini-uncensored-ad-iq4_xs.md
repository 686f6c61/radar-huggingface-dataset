# y0uq/Inkling-2-Mini-Uncensored-AD-IQ4_XS

## Resumen

Inkling-2-Mini-Uncensored-AD-IQ4_XS es una cuantización GGUF del modelo Inkling-2-Mini de Thinking Machines Lab, publicada por el usuario y0uq. Se trata de la fusión directa de un LoRA "uncensored" de AtomicChat sobre la cuantización IQ4_XS del modelo base, de modo que el ajuste alineado se elimina del comportamiento del modelo sin necesidad de aplicar el adaptador en tiempo de inferencia. El resultado es un único fichero GGUF de 15,0 GB listo para cargar en llama.cpp.

El modelo subyacente cuenta con 26.070.385.152 parámetros (aproximadamente 26 mil millones) según los datos de safetensors del repositorio base. La model card no documenta arquitectura, longitud de contexto ni composición del entrenamiento, por lo que esos datos se marcan como no disponibles en esta ficha.

La relevancia de esta publicación es práctica: ofrece una variante sin censura de un modelo de ~26B en formato GGUF con cuantización IQ4_XS (con imatrix), pensada para despliegue local en llama.cpp y para casos donde el filtrado de seguridad del modelo base resulta excesivamente restrictivo. La licencia Apache 2.0 permite uso comercial, aunque el proceso de "uncensoring" conlleva riesgos adicionales de contenido dañino que conviene evaluar antes de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, presumiblemente; no confirmado en la model card) |
| Parametros totales | 26.070.385.152 (~26B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (GGUF, generada con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Inkling-2-Mini (Thinking Machines Lab) en la documentación proporcionada: ni tipo de transformer, ni mecanismos de atención, ni datos de entrenamiento (número de tokens, composición del corpus, fases de RLHF/DPO). Tampoco se documenta ninguna innovación técnica específica.

Lo que sí está documentado es el proceso de esta publicación concreta: se parte de la cuantización AD-IQ4_XS (IQ4_XS con imatrix) del modelo base, se fusiona directamente el LoRA "Uncensored" de AtomicChat y se preserva el tipo de cuantización original de cada tensor, manteniendo exactamente el tamaño de fichero del GGUF base (15,0 GB). El adaptador ya está integrado, por lo que no requiere carga adicional en llama.cpp.

## Capacidades

- Generación de texto conversacional en formato GGUF para llama.cpp (tag `conversational`).
- Comportamiento "uncensored": el LoRA fusionado elimina parte de la alineación de seguridad del modelo base, lo que amplía el rango de respuestas aceptadas.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar las respuestas del modelo base con las de esta variante sin censura permite estudiar qué comportamientos elimina el LoRA y con qué coste en utilidad.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas que el modelo base rechazaría.
- Despliegue local en llama.cpp: un único fichero GGUF de 15,0 GB cargable con `llama-cli -hf y0uq/Inkling-2-Mini-Uncensored-AD-IQ4_XS:IQ4_XS`, adecuado para entornos sin GPU de datacenter.
- Evaluación de robustez frente a jailbreaks: servir como referencia de "suelo de seguridad" al testear clasificadores o filtros de contenido propios.
- Prototipado de asistentes conversacionales en hardware de consumo: la cuantización IQ4_XS reduce los requisitos de VRAM frente a pesos en FP16, permitiendo iterar en estaciones de trabajo locales.
- Red teaming de productos: generar respuestas adversarias para probar sistemas de moderación antes de desplegarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 15,0 GB, por lo que se necesitan al menos ~15-16 GB de VRAM para cargarlo íntegramente en GPU (IQ4_XS, ~4,6 bits por peso).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para carga completa en una sola GPU; A100/H100 para mayor throughput y contexto.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, 4090, 3090, 4060 Ti 16 GB); con menos VRAM puede ejecutarse parcialmente en CPU mediante offloading en llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), servidores compatibles con endpoints según los tags del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-AD-IQ4_XS (este) | ~26B | no disponible | GGUF IQ4_XS | Apache 2.0 | LoRA uncensored fusionado, 15,0 GB |
| thinkingmachines/Inkling-2-Mini (base) | ~26B | no disponible | safetensors/GGUF | Apache 2.0 | Modelo original alineado |
| AtomicChat/Inkling-2-Mini-GGUF | ~26B | no disponible | GGUF | Apache 2.0 | Cuantizaciones del base sin LoRA |
| AtomicChat/Inkling-2-Mini-Uncensored-GGUF | ~26B | no disponible | GGUF | Apache 2.0 | LoRA uncensored como adaptador separado |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con modelos de otras familias de tamaño similar.

## Limitaciones y advertencias

- Modelo "uncensored": la fusión del LoRA elimina parte de la alineación de seguridad, lo que incrementa el riesgo de generar contenido dañino, ilegal o sexualmente explícito. No apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: no evaluado en la información disponible; es esperable un comportamiento similar al del modelo base, sin datos que lo confirmen.
- Sesgos: no documentados.
- Limitaciones de contexto e idioma: desconocidas; la model card no especifica ventana de contexto ni idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado; conviene revisar los términos del modelo base y del LoRA original.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; la calidad de la fusión no ha sido verificada de forma independiente.
- La información técnica del modelo base (arquitectura, entrenamiento, benchmarks) no está disponible en la documentación consultada, lo que dificulta evaluar su idoneidad para producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/y0uq/Inkling-2-Mini-Uncensored-AD-IQ4_XS
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- LoRA uncensored original (AtomicChat): https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Cuantización base AD-IQ4_XS (AtomicChat): https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
