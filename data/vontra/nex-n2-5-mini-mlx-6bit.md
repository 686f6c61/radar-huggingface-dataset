# Vontra/Nex-N2.5-mini-MLX-6bit

## Resumen

Nex-N2.5 mini (MLX 6bit) es una conversión comunitaria del checkpoint BF16 Nex-N2.5-mini, realizada por Vontra y publicada en Hugging Face. El modelo original, desarrollado por Nex-AGI, es un modelo de visión y lenguaje (image-text-to-text) con arquitectura qwen3_5_moe, una mezcla de expertos (MoE) orientada a tareas de agente de larga duración. Esta conversión en 6-bit está pensada para ejecutarse en Apple Silicon mediante MLX-VLM y oMLX. El repositorio contiene 35.107.181.936 parámetros en formato safetensors, con un tamaño de 29,1 GB y una cuantización afín de 6 bits con group size 64, que resulta en un promedio de 6,622 bits por peso. La licencia es Apache-2.0. La longitud de contexto no está especificada en la información disponible.

La relevancia de este modelo radica en que permite ejecutar un modelo MoE multimodal de nivel agente en ordenadores Mac con memoria unificada, sin necesidad de infraestructura de GPU dedicada. La conversión es independiente y no oficial, por lo que las capacidades del upstream no están completamente verificadas en esta cuantización. El autor ha realizado pruebas básicas de aritmética, tool calling y visión, pero no ha medido límites de contexto ni memoria pico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mixture-of-experts, vision-language) |
| Parametros totales | 35.107.181.936 (≈35.100 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX 6-bit (afín, group size 64, 6,622 bits por peso promedio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura qwen3_5_moe, una variante de mixture-of-experts (MoE) que combina una colección de expertos para activar solo una fracción de los parámetros en cada token. Al estar basado en Nex-N2.5-mini, se trata de un modelo multimodal que procesa tanto texto como imágenes (image-text-to-text). Según el repositorio upstream, Nex-N2.5-mini se construye sobre las bases multimodales de Nex-N2 y añade mejoras enfocadas en el uso de ordenador y la navegación web. Para el entrenamiento, no se dispone de datos sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

La conversión de Vontra utiliza cuantización afín de MLX-VLM con 6 bits y group size 64. No todos los tensores se cuantizan: el convertidor reportó 6,622 bits por peso en promedio, y los módulos multimodales excluidos por la regla por defecto conservan mayor precisión. El checkpoint BF16 original declara una capa MTP en su configuración, pero no se encontraron tensores MTP en el checkpoint inspeccionado, por lo que esta versión no incluye decodificación MTP probada y se recomienda mantener MTP desactivado.

## Capacidades

- Generación de texto y visión: el modelo acepta imágenes y texto, produciendo respuestas en formato conversacional.
- Tool calling: se ha validado una llamada forzada a una herramienta meteorológica con el argumento «París». El formato de las llamadas se comprobó, aunque no se ejecutaron.
- Razonamiento matemático básico: la prueba de 17 × 19 devolvió 323 con los parámetros de muestreo recomendados y reasoning_effort="none".
- Procesamiento multimodal de imágenes: la identificación de una imagen roja sintética superó la prueba de cuantización.
- Generación de código: se probaron cuatro peticiones de código; una terminó de forma natural, mientras que tres alcanzaron el límite de 4096 tokens sin completarse. No se ejecutaron los bloques generados.
- Salida estructurada JSON: la prueba de JSON estructurado pasó correctamente.
- Nota: no se verificaron capacidades de agente, multi-step reasoning ni visión compleja en esta cuantización.

## Casos de uso

- Asistente de visión local en Apple Silicon: gracias a su pipeline image-text-to-text, el modelo puede describir imágenes o responder preguntas sobre contenido visual sin depender de servicios en la nube. Se desplegaría con oMLX o un cliente MLX-VLM en un Mac con suficiente memoria unificada.
- Automatización de llamadas a funciones (tool calling): la validación incluyó una llamada forzada a una API meteorológica. En producción, se puede integrar en un agente local para consultar APIs externas, por ejemplo el tiempo, y luego formatear la respuesta. Se recomienda comprobar el formato de las llamadas y ejecutarlas en un entorno controlado.
- Generación de código en flujos de revisión: el modelo ha demostrado producir bloques de código, aunque con riesgo de truncamiento en respuestas largas. Puede usarse como asistente de autocompletado o revisión de snippets en un entorno seguro, con validación sintáctica y sin esperar respuestas completas en tareas extensas.
- Análisis de capturas de pantalla y documentos visuales: al ser multimodal, puede leer texto en imágenes, diagramas o capturas. Esto es útil para glosar informes con gráficos o transcribir información de capturas en un flujo de documentación.
- Prototipado rápido de aplicaciones de IA en un Mac: como es una conversión MLX, se puede experimentar con un modelo de 35.000 millones de parámetros en un Apple Silicon Studio sin configuración compleja. El autor probó oMLX 0.6.4, por lo que ese stack sirve como punto de partida.
- Cálculo y razonamiento aritmético básico en pipelines de automatización: la prueba de 17 × 19 = 323 sugiere que, con el muestreo recomendado (temperature 0.7, top_p 0.95, top_k 40) y sin decodificado greedy, puede usarse en tareas de cálculo sencillo o validación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio README advierte que las puntuaciones de benchmark del upstream no son evaluaciones de esta cuantización. El autor midió un throughput end-to-end de aproximadamente 84-87 tokens de salida por segundo de API en condiciones no controladas, con caché sin gestionar y una subida a Hugging Face simultánea. Este dato no es un benchmark de decode puro y no debe usarse como referencia de rendimiento en producción.

## Requisitos de hardware

- El repositorio ocupa 29,1 GB, por lo que se necesita una máquina Apple Silicon con memoria unificada suficiente para alojar los pesos cuantizados más el contexto y el overhead de KVCache. No se ha medido el consumo pico.
- Las pruebas se realizaron en un Apple Silicon Studio con 256 GiB de memoria unificada. No se ha establecido una recomendación mínima de memoria, por lo que se recomienda prudencia al desplegar en Macs de 16-32 GiB.
- GPU recomendadas: no aplica. El formato MLX está optimizado para Apple Silicon, no para GPUs NVIDIA o AMD.
- ¿Cabe en GPU de consumo? No en su formato original; es una conversión MLX exclusiva para Apple Silicon. Para usar en GPUs de consumo sería necesario convertir a otros formatos y se requerirían aproximadamente 35-40 GB de VRAM con cuantizaciones similares, aunque no se dispone de datos oficiales.
- Opciones de despliegue: oMLX (probado en v0.6.4), MLX-VLM y cualquier framework compatible con MLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información; estos no aplican directamente al formato MLX.
- Latencia y throughput: se observaron unas 84-87 tokens de salida por segundo de API en pruebas end-to-end, no controladas y con carga concurrente. No hay datos de latencia de primer token.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares. Esta conversión es la versión cuantizada en 6-bit del checkpoint BF16 Nex-N2.5-mini. Los benchmarks del modelo original no se han transferido a esta cuantización. No hay datos de otros modelos MLX de características comparables en la información proporcionada.

## Limitaciones y advertencias

- No se han medido los límites de longitud de contexto ni el consumo pico de memoria; no se puede garantizar el funcionamiento en ventanas largas ni en equipos con memoria unificada limitada.
- La calidad de las respuestas de código es limitada: tres de cuatro peticiones alcanzaron el tope de 4096 tokens y no se ejecutó ninguno de los bloques generados. La completitud y corrección del código no están verificadas.
- El autor recomienda evitar el decodificado greedy, ya que en sus pruebas reprodujo un bucle de repetición. Se deben usar los parámetros de muestreo recomendados (temperature 0.7, top_p 0.95, top_k 40).
- La capa MTP declarada en el modelo original no tiene tensores correspondientes en el checkpoint, por lo que la decodificación MTP no está soportada ni probada; se debe mantener desactivada.
- El rendimiento de 84-87 tokens/s es una medida end-to-end en condiciones no controladas, no representa la latencia real en producción.
- Riesgo de alucinación y sesgos: no se han evaluado. El propio autor señala que las pruebas son básicas y no constituyen una evaluación completa de código, visión ni agentes.
- Esta versión no es una publicación oficial de Nex-AGI; es una conversión independiente. La licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente a Nex-AGI y a Vontra, y las puntuaciones del upstream no se aplican a esta cuantización.

## Enlaces

- https://huggingface.co/Vontra/Nex-N2.5-mini-MLX-6bit
- https://huggingface.co/nex-agi/Nex-N2.5-mini
- https://github.com/nex-agi/Nex-N2.5
- https://nex-agi.com/
- https://huggingface.co/Vontra
