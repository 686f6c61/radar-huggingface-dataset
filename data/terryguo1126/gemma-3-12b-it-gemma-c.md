# TerryGuo1126/gemma-3-12b-it-gemma-c

## Resumen

Gemma 3 12B IT — Gemma.c es una exportación cuantizada a int8 del modelo google/gemma-3-12b-it, publicada por el usuario TerryGuo1126. No se trata de un modelo nuevo ni de un fine-tuning: es una conversión de los pesos originales de Google a un formato propietario `.bin` que solo puede cargarse con el motor de inferencia Gemma.c, desarrollado por el mismo autor. El repositorio ocupa 12,2 GB y se distribuye bajo los términos de uso de Gemma.

El modelo base, Gemma 3 12B IT, es un transformer decoder-only de Google con 12 mil millones de parámetros, entrenado para instrucciones y conversación. Esta versión conserva las capacidades del original (generación de texto, razonamiento, código, matemáticas y visión con SigLIP), pero las encapsula en un contenedor que no es compatible con `transformers`, vLLM ni llama.cpp.

Su relevancia es acotada: resulta útil para quienes quieran ejecutar Gemma 3 12B en entornos C11 sin dependencias de terceros, con cuantización int8 y paralelismo OpenMP. Para cualquier otro flujo de producción, conviene usar los pesos originales de Google en safetensors o GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), con torre de visión SigLIP en el modelo base |
| Parametros totales | 12 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 con escalas float32 por canal; export en float32 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Gemma Terms of Use |
| Formato de pesos | `.bin` propietario de Gemma.c (no cargable por `transformers`) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Gemma 3, con 12 mil millones de parámetros. La model card no detalla la composición del dataset, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO; esa información corresponde a la documentación oficial de google/gemma-3-12b-it, no a este repositorio.

La innovación de esta exportación es el formato: los pesos originales se han convertido a int8 con escalas float32 por canal y se han empaquetado en un único fichero `gemma-3-12b-it.bin`. El motor Gemma.c es un intérprete C11 de un solo fichero, con tokenizador BPE implementado desde cero, paralelismo OpenMP y soporte para Gemma 1/2/3 en texto y visión SigLIP. La compilación por defecto usa `DTYPE=FP32`, que debe coincidir con el tipo de las escalas y de las activaciones.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo instruct de Google.
- Razonamiento, matemáticas y generación de código, según las capacidades del base.
- Procesamiento de imágenes mediante la torre SigLIP del modelo base (soporte declarado en el motor Gemma.c).
- Ejecución en C11 sin dependencias de terceros, con paralelismo OpenMP.
- Inferencia con cuantización int8 y escalas float32 por canal.
- No se documenta soporte de tool calling, function calling ni modos de agente en esta exportación.
- No se documenta modo thinking explícito ni capacidades de audio.

## Casos de uso

- Inferencia embebida en C: integrar Gemma 3 12B en aplicaciones nativas que no pueden depender de Python, usando el binario `gemma` y el fichero `.bin` como único artefacto.
- Experimentación con cuantización int8: comparar la calidad de salida entre los pesos originales en safetensors y esta conversión int8 con escalas por canal.
- Despliegue en entornos sin gestor de paquetes: el motor se compila con `make` y no requiere bibliotecas externas, lo que simplifica la instalación en sistemas mínimos.
- Prototipado de asistentes conversacionales: usar el modo `--prompt` y `--tokens` para generar respuestas en pruebas de concepto locales.
- Evaluación de motores alternativos: medir throughput y latencia de Gemma.c frente a llama.cpp o vLLM sobre el mismo modelo base.
- Docencia y estudio de motores de inferencia: el código de un solo fichero facilita explicar tokenización BPE, atención y cuantización en un curso de sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 12,2 GB en disco; en memoria, los pesos int8 con escalas float32 rondan los 12-13 GB, a los que hay que sumar el estado KV y las activaciones en float32.
- GPU recomendadas: no disponible en la informacion proporcionada; el motor usa OpenMP para CPU y no documenta backend CUDA.
- GPU de consumo: no disponible; por tamaño, una GPU de 24 GB (RTX 4090) podría alojar los pesos, pero no se confirma soporte.
- Despliegue: exclusivamente mediante el motor Gemma.c (`make` y ejecución del binario); no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| Gemma 3 12B IT — Gemma.c (este) | 12B | no disponible | `.bin` int8 | Gemma Terms | Solo Gemma.c |
| google/gemma-3-12b-it | 12B | no disponible | safetensors | Gemma Terms | transformers, vLLM, TGI |
| Gemma 3 12B IT en GGUF (comunidad) | 12B | no disponible | GGUF | Gemma Terms | llama.cpp, Ollama |
| Gemma 3 12B IT AWQ/GPTQ (comunidad) | 12B | no disponible | safetensors cuantizado | Gemma Terms | vLLM, TGI |

## Limitaciones y advertencias

- El formato `.bin` es propietario y no se puede cargar con `transformers`, lo que bloquea cualquier pipeline estándar de Hugging Face.
- El repositorio no incluye tokenizador en formato Hugging Face; el tokenizador BPE vive dentro del motor Gemma.c.
- La cuantización int8 puede degradar la calidad respecto a los pesos originales en tareas sensibles, como matemáticas o código.
- No se documentan sesgos concretos, pero el modelo base hereda los sesgos de sus datos de entrenamiento.
- Riesgo de alucinación inherente al modelo base; no hay evaluaciones publicadas para esta conversión.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribución; hay que revisarlas antes de producción.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; la fecha de creación indicada (2026-11-10) es posterior a la redacción de esta ficha y conviene verificarla.
- No se documenta soporte multilingüe específico ni longitud de contexto en esta exportación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TerryGuo1126/gemma-3-12b-it-gemma-c
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Motor Gemma.c: https://github.com/terryguo3180-eng/Gemma.c
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
