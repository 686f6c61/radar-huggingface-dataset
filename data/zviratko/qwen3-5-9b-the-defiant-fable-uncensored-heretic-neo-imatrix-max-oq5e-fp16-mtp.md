# zviratko/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-oQ5e-fp16-mtp

## Resumen

Este repositorio contiene una cuantización de precisión mixta del modelo `DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP`, realizada con la herramienta oQ (oMLX v0.6.3). El modelo base es un fine-tune multi-etapa de Qwen3.5-9B, desarrollado por DavidAU, que combina varios ajustes previos y un merge de múltiples modelos de 9B. Se describe como un modelo "uncensored" (sin censura) con capacidades multimodales (imagen-texto a texto), ventana de contexto nativa de 256k tokens y optimizado para ejecución en hardware de consumo.

La cuantización oQ5e utiliza 5 bits con grupo de tamaño 64 y produce pesos en formato MLX safetensors, pensados para ejecutarse en dispositivos Apple Silicon mediante la librería MLX. El repositorio tiene un tamaño de 8.3 GB y, según los tensores safetensors, contiene 2.224.168.688 parámetros (cifra que refleja el almacenamiento cuantizado, no el número nominal de parámetros del modelo original, que es de 9 mil millones). Esta versión cuantizada permite ejecutar el modelo en Mac con requisitos de memoria reducidos, manteniendo en teoría las capacidades del modelo base.

La relevancia de este modelo radica en ofrecer una alternativa sin censura y multimodal sobre la arquitectura Qwen3.5, con un contexto largo y rendimiento que, según el autor, supera a modelos más grandes en varios benchmarks. Sin embargo, al tratarse de una cuantización, el rendimiento exacto puede variar respecto al modelo original en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5, detalles no disponibles) |
| Parametros totales | 9B (nominal del modelo base); safetensors cuantizado: 2.224.168.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens (nativo, según el modelo base) |
| Tipos de cuantizacion | oQ5e (5 bits, group size 64, precisión mixta) |
| Idiomas soportados | no disponible (el modelo base probablemente multilingüe, sin confirmar) |
| Licencia | Apache-2.0 (según el modelo base; la cuantización no especifica licencia propia) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base `DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP` es un fine-tune multi-etapa y multi-modelo sobre Qwen3.5-9B. Según la información disponible, combina varios ajustes previos de DavidAU y un merge de modelos de 9B, con el objetivo de mejorar el rendimiento en instrucciones, razonamiento y capacidades de visión. Se menciona que el modelo tiene visión habilitada y una ventana de contexto nativa de 256k tokens. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF o DPO.

La cuantización oQ5e aplica una cuantización de precisión mixta de 5 bits con grupo de tamaño 64, utilizando la herramienta oMLX v0.6.3. Este proceso reduce el tamaño del modelo y acelera la inferencia en hardware Apple Silicon, a costa de una posible pérdida menor de precisión. No se documentan innovaciones técnicas adicionales en la cuantización más allá del método oQ.

## Capacidades

- Generación de texto y razonamiento: el modelo base está optimizado para seguir instrucciones y realizar tareas de razonamiento complejo.
- Capacidades multimodales: soporta entrada de imagen y texto, y genera texto a partir de ambas modalidades (image-text-to-text).
- Ventana de contexto larga: 256k tokens nativos, adecuada para documentos extensos o conversaciones de muchos turnos.
- Sin censura: el modelo está diseñado para no aplicar filtros de contenido, lo que permite generar respuestas sobre temas que otros modelos restringen.
- Soporte de tool calling y agentes: no se menciona explícitamente, pero al estar basado en Qwen3.5 es probable que herede estas capacidades; sin embargo, no hay confirmación en la información disponible.
- Multilingüismo: no se especifican idiomas soportados; se asume que hereda el soporte de Qwen3.5, pero no está confirmado.

## Casos de uso

- Generación creativa sin restricciones: el modelo puede usarse para escribir ficción, poesía o guiones donde se requiera explorar temas tabú o controvertidos sin filtros automáticos.
- Análisis de documentos extensos: gracias a su contexto de 256k tokens, puede resumir o extraer información de libros, informes o contratos de gran longitud en una sola pasada.
- Asistentes de investigación con entrada visual: al aceptar imágenes, puede describir diagramas, gráficos o fotografías y razonar sobre su contenido, útil en entornos académicos o de análisis técnico.
- Chatbots de rol o personajes: su naturaleza uncensored y su capacidad de seguir instrucciones lo hacen adecuado para aplicaciones de rol conversacional sin limitaciones temáticas.
- Procesamiento de código con contexto amplio: puede manejar repositorios completos o archivos de código muy largos para tareas de refactorización, explicación o generación de documentación.
- Prototipado de aplicaciones multimodales en Mac: al estar cuantizado para MLX, permite desarrollar y probar aplicaciones de visión-lenguaje en hardware Apple Silicon sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web menciona que el modelo base "exceeds 7 of 7 benchmarks for Qwen 3.5 9B, Qwen3.5 27B, Qwen3.6 35B-A3B" y que cumple con Qwen 3.6 27B en algunos casos, pero no se proporcionan cifras concretas ni tablas comparativas. Por lo tanto, no es posible presentar datos numéricos verificados.

## Requisitos de hardware

- Al ser una cuantización MLX, está diseñada para ejecutarse en Apple Silicon (M1, M2, M3, M4 y superiores).
- El tamaño del repositorio es de 8.3 GB, por lo que se requiere al menos 12 GB de RAM unificada para cargar el modelo en memoria (considerando overhead). Con 16 GB o más se puede operar cómodamente.
- No es compatible con GPUs NVIDIA o AMD directamente; para usarlo en otros hardware sería necesario convertir los pesos a otro formato (por ejemplo, GGUF para llama.cpp).
- Opciones de despliegue: mediante la librería MLX en Python, o a través de herramientas como oMLX. También se puede integrar en aplicaciones macOS.
- Latencia y throughput: no se han publicado mediciones específicas. En general, un modelo de 9B cuantizado a 5 bits en Apple Silicon M2 Pro puede generar entre 10 y 20 tokens por segundo, dependiendo de la longitud del contexto y la memoria disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa con otros modelos de la misma categoría. El modelo base se compara con Qwen3.5 9B, Qwen3.5 27B y Qwen3.6 35B-A3B según el autor, pero no hay métricas concretas. Alternativas en el mismo rango de tamaño y con licencia abierta podrían ser Llama 3.1 8B o Mistral 7B, pero no se han encontrado comparaciones directas en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o perjudicial sin filtros. Su uso en producción debe considerar políticas de seguridad y moderación.
- La cuantización de 5 bits puede degradar la precisión en tareas que requieren exactitud numérica o razonamiento fino, en comparación con el modelo en fp16.
- No se ha verificado el soporte real de tool calling, agentes o multilingüismo; estas capacidades se heredan del modelo base, pero no están confirmadas en esta versión cuantizada.
- La licencia Apache-2.0 se atribuye al modelo base, pero la cuantización no especifica una licencia propia; se recomienda verificar los términos antes de un uso comercial.
- No hay información sobre sesgos o alucinaciones específicos de este modelo. Dado que es un fine-tune sin censura, es probable que presente sesgos amplificados en temas sensibles.
- El formato MLX limita el despliegue a ecosistema Apple; para otros entornos sería necesario convertir los pesos, lo que puede introducir pérdidas adicionales.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/zviratko/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Versión GGUF del modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Página de Interfaze con descripción del modelo: https://interfaze.ai/models/davidauqwen35-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf
- Ficha en AIAny: https://aiany.app/item/qwen3-5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf
