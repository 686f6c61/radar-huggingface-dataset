# ZeroWw/Clover-35B-A3B-Preview-IQ3_XXS-GGUF

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje de tipo mezcla de expertos (MoE) con 34.661.350.848 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, desarrollado por DiffuSpace. Se deriva de la arquitectura Qwen3.6-35B-A3B y utiliza generación por difusión de bloques (block diffusion) en lugar de decodificación autorregresiva convencional, una aproximación poco habitual en modelos de este tamaño. Dispone de una ventana de contexto de 128.000 tokens y está publicado bajo licencia Apache 2.0.

La ficha que nos ocupa no documenta el modelo original, sino una cuantización concreta: `ZeroWw/Clover-35B-A3B-Preview-IQ3_XXS-GGUF`, publicada por el usuario ZeroWw. Se trata de un único archivo GGUF de 14,1 GB generado con `llama.cpp` (build `b4838ffb`) aplicando cuantización IQ3_XXS, aproximadamente 3,06 bits por peso, con matriz de importancia (`imatrix_unsloth.gguf`), tensores de salida en `q8_0` y embeddings en `q8_0`. El punto de partida fue un GGUF intermedio Q8_0 del modelo original.

Su relevancia práctica es doble: por un lado, permite ejecutar un MoE de 35B parámetros con 128K de contexto en hardware de consumo, algo inviable con los pesos en precisión completa; por otro, es una de las pocas vías publicadas para probar localmente un modelo de difusión de bloques de esta escala mediante `llama.cpp`, Ollama u otros runtimes compatibles con GGUF. El repositorio no registra descargas ni likes en el momento de redactar esta ficha, por lo que debe considerarse una publicación de preview sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con generación por difusión de bloques (derivada de Qwen3.6-35B-A3B) |
| Parametros totales | 34.661.350.848 |
| Parametros activos | Aproximadamente 3.000 millones por token |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | IQ3_XXS (aproximadamente 3,06 bits por peso) en este repositorio; el modelo base admite otras cuantizaciones GGUF publicadas por terceros |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tensores de salida y embeddings en `q8_0`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 35B parámetros totales y enrutamiento que activa alrededor de 3B parámetros por token, lo que reduce el coste computacional por paso frente a un modelo denso del mismo tamaño. La innovación principal es el mecanismo de generación: Clover emplea difusión de bloques, un esquema en el que el modelo genera secuencias completas refinando iterativamente bloques de tokens en lugar de predecir token a token. Según la documentación disponible, el modo de razonamiento (thinking) está activado por defecto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. La model card del repositorio de cuantización se limita a documentar el proceso de cuantización, no el entrenamiento del modelo original.

## Capacidades

- Generación de texto conversacional y de un solo turno, con soporte de plantillas de chat compatibles con `llama.cpp`.
- Razonamiento explícito en modo thinking, activado por defecto según la documentación del modelo base.
- Ventana de contexto de 128.000 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Generación por difusión de bloques, que puede producir secuencias completas con un número de pasos de refinamiento configurable.
- Compatibilidad con runtimes GGUF (`llama.cpp`, Ollama y derivados), incluida la etiqueta `endpoints_compatible`.
- Capacidades multilingües limitadas al inglés según los metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Procesamiento de documentos largos en local: con 128K tokens de contexto, el modelo puede resumir o extraer información de contratos, informes o bases de código completas en una sola pasada, sin depender de servicios en la nube.
- Asistentes conversacionales autoalojados: el GGUF IQ3_XXS de 14,1 GB cabe en GPUs de consumo con 16-24 GB de VRAM, lo que permite desplegar un chatbot privado con `llama.cpp` u Ollama en estaciones de trabajo individuales.
- Experimentación con modelos de difusión de bloques: investigadores interesados en comparar decodificación autorregresiva frente a difusión pueden usar esta cuantización como banco de pruebas de bajo coste antes de escalar a los pesos completos.
- Prototipado de pipelines de generación de texto en inglés: integrable mediante la API compatible de `llama.cpp` o servidores tipo OpenAI, adecuado para pruebas de concepto donde el coste de infraestructura es crítico.
- Evaluación de calidad bajo cuantización agresiva: útil para medir la degradación de un MoE de 35B a 3,06 bits por peso frente a cuantizaciones de mayor precisión del mismo modelo.
- Educación y demostraciones: al ser un único archivo de 14,1 GB con licencia Apache 2.0, resulta práctico para talleres y cursos sobre cuantización, MoE y difusión aplicada a lenguaje.
- Generación de texto por lotes offline: escenarios sin conectividad donde se requiere producir borradores, resúmenes o clasificaciones en inglés con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 14,1 GB; con overhead de contexto y caché KV para 128K tokens, se recomienda al menos 18-20 GB de VRAM para contextos largos y 16 GB para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB, con contexto reducido), A100 40 GB y H100 para despliegues con contexto completo y concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más, especialmente RTX 4090, RTX 4080 y equivalentes; en 12 GB requeriría descarga parcial a CPU y perdería throughput.
- Opciones de despliegue: `llama.cpp` (build `b4838ffb` o superior), Ollama y cualquier runtime compatible con GGUF e `imatrix`.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un MoE con 3B parámetros activos, se espera un throughput por token superior al de un modelo denso de 35B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview (IQ3_XXS) | 34,66B | ~3B | 128K | Apache 2.0 | GGUF |
| Clover-35B-A3B-Preview (GGUF de AtomicChat) | 35B | ~3B | 128K | Apache 2.0 | GGUF (21,2-36,9 GB) |
| Qwen3.6-35B-A3B (arquitectura de origen) | 35B | ~3B | no disponible | no disponible | no disponible |

La comparación con modelos de la misma categoría fuera de la familia Clover no está disponible en la información proporcionada. La alternativa más directa documentada es la publicación GGUF de AtomicChat, que ofrece cuatro archivos de entre 21,2 GB y 36,9 GB, es decir, cuantizaciones de mayor precisión y tamaño que este IQ3_XXS de 14,1 GB.

## Limitaciones y advertencias

- El repositorio no registra descargas ni likes, y fue creado y actualizado el mismo día; no hay validación comunitaria de la calidad de la cuantización.
- La cuantización IQ3_XXS (aproximadamente 3,06 bits por peso) es agresiva y puede degradar la coherencia, el razonamiento y la fidelidad respecto a los pesos originales, especialmente en tareas sensibles a la precisión numérica.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta cuantización concreta.
- El modo thinking activado por defecto incrementa el consumo de tokens y la latencia; conviene desactivarlo en aplicaciones de baja latencia.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en producción.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base es un preview sin benchmarks publicados; validar su comportamiento en el dominio objetivo antes de desplegarlo.
- La decodificación por difusión de bloques puede no ser compatible con todas las herramientas construidas para modelos autorregresivos (por ejemplo, ciertas funciones de streaming o de logprobs).
- El contexto de 128K requiere caché KV considerable; en GPUs de 16 GB habrá que reducir la ventana efectiva o aceptar offloading a CPU.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/ZeroWw/Clover-35B-A3B-Preview-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Repositorio GitHub del modelo: https://github.com/DiffuSpace/Clover-35B-A3B-Preview
- Cuantizaciones GGUF alternativas de AtomicChat: https://huggingface.co/AtomicChat/Clover-35B-A3B-Preview-GGUF
