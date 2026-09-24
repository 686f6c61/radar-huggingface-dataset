# volantis-labs/qwen3.5-2b

## Resumen

Esta ficha describe `volantis-labs/qwen3.5-2b`, una redistribución en formato GGUF del modelo Qwen3.5‑2B desarrollado por el Qwen Team de Alibaba Cloud. El repositorio no contiene un modelo entrenado por volantis-labs, sino una conversión a GGUF y cuantización Q4_K_M del modelo original, con crédito explícito a Unsloth por la conversión y a Qwen Team por los pesos. Se distribuye bajo licencia Apache 2.0, la misma del modelo base.

El modelo base es un transformer denso de 1.881.825.088 parámetros (aproximadamente 1,88 B), descrito por la documentación de vLLM como un «Qwen3.5 denso en miniatura» que conserva la arquitectura completa de gated delta networks, un encoder de visión y una ventana de contexto de 262.144 tokens, en un tamaño apto para GPUs de consumo de 8 GB o inferencia en dispositivo. Qualcomm lo cataloga como modelo de 2 B equilibrado para inferencia on-device, y lo sitúa como la evolución de la serie Qwen3 con mejor razonamiento y seguimiento de instrucciones.

Su relevancia práctica es doble: por un lado, acerca una ventana de contexto de 262K y una arquitectura híbrida de atención lineal a hardware muy modesto; por otro, al publicarse en GGUF cuantizado a Q4_K_M, es directamente ejecutable en llama.cpp, Ollama y otros runtimes de CPU/GPU sin necesidad de infraestructura de servidor. Conviene señalar que el repositorio de volantis-labs acumula 0 descargas y 0 «likes» en el momento de la consulta, por lo que carece de validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, con gated delta networks (según la documentación del modelo base Qwen3.5-2B en vLLM Recipes); el repositorio redistribuye únicamente pesos cuantizados |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens (262K) según la documentación del modelo base; no confirmado en la model card del repositorio |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado); etiqueta `imatrix` en los tags del repositorio |
| Idiomas soportados | no disponible (la serie Qwen3.5 se describe como multilingüe, sin listado oficial de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un único archivo: `Qwen3.5-2B-Q4_K_M.gguf`, 1.280.835.840 bytes) |

## Arquitectura y entrenamiento

La información disponible sobre el modelo base describe una arquitectura densa que incorpora gated delta networks (GDN), un mecanismo de atención lineal con decaimiento que la documentación de vLLM presenta como parte integral de la serie Qwen3.5, junto con un encoder de visión y una ventana de contexto de 262K. El material de Qualcomm AI Hub refuerza la orientación a inferencia en dispositivo y sitúa a Qwen3.5 como la generación sucesora de Qwen3, con mejoras en razonamiento y seguimiento de instrucciones. No se dispone, en la información proporcionada, de la configuración de capas (número de capas de atención lineal frente a capas de atención completa), la dimensión oculta ni el número de cabezas.

En cuanto a los datos de entrenamiento, no hay información disponible: no se especifican el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones concretas más allá de la propia arquitectura GDN y el contexto extendido. Es importante subrayar que esta ficha corresponde a una redistribución cuantizada: el proceso aplicado por Unsloth es de conversión a GGUF y cuantización Q4_K_M, no de entrenamiento ni de ajuste fino, por lo que las capacidades del modelo son las del Qwen3.5-2B original, con la pérdida de precisión propia de la cuantización.

## Capacidades

- Generación de texto y conversación multi-turno: el repositorio incluye el tag `conversational`, lo que indica que la distribución está pensada para uso dialógico.
- Razonamiento y seguimiento de instrucciones: Qualcomm AI Hub señala mejoras explícitas respecto a la generación Qwen3 en razonamiento y en instruction-following.
- Procesamiento de contexto largo: el modelo base declara una ventana de 262.144 tokens, lo que habilita tareas sobre documentos extensos, sujeto a la degradación habitual en posiciones intermedias.
- Capacidades multilingües: la serie Qwen3.5 se describe como multilingüe, aunque no se detalla la lista de idiomas ni los niveles de calidad por idioma.
- Compatibilidad con endpoints tipo chat completions: el tag `endpoints_compatible` y la presencia del modelo en catálogos como Microsoft Foundry y vLLM indican integración con APIs compatibles con OpenAI.
- Tool calling y function calling: no disponible; no se documenta en la model card del repositorio ni en los extractos de búsqueda consultados.
- Comportamiento agéntico y razonamiento multi-paso: no disponible; no se documenta explícitamente.
- Visión: el modelo base Qwen3.5-2B se describe con encoder de visión, pero la conversión GGUF redistribuida por volantis-labs no documenta soporte multimodal. No se debe asumir capacidad de visión en este archivo.
- Modo de razonamiento explícito (thinking mode): no disponible; no se menciona en la información recopilada.

## Casos de uso

- Asistentes conversacionales en local: al ejecutarse desde un único archivo GGUF de 1,19 GiB, el modelo puede desplegarse en un portátil o en una estación de trabajo sin GPU dedicada, gestionando diálogos multi-turno con un consumo de memoria muy bajo.
- Inferencia en dispositivo y edge computing: Qualcomm AI Hub lista el modelo base para ejecución on-device, de modo que resulta adecuado para prototipos en teléfonos, NPUs y equipos embebidos donde no es viable enviar datos a la nube por latencia o privacidad.
- Resumen y extracción de información sobre documentos largos: la ventana de 262K del modelo base permite procesar contratos, informes o transcripciones extensas en una sola pasada, evitando pipelines de troceado y recuperación en casos donde el documento completo cabe en contexto.
- Clasificación y enrutado de texto en pipelines de datos: por su coste reducido por token, puede emplearse como clasificador de intenciones, etiquetador de tickets o filtro previo antes de invocar un modelo mayor, reduciendo el gasto total del sistema.
- Generación y autocompletado de código en editores locales: un modelo de 2 B cuantizado a Q4_K_M se integra en asistentes de IDE que corren en la propia máquina, ofreciendo sugerencias sin conexión; conviene validar la calidad real en código porque no hay benchmarks publicados para este modelo concreto.
- Chatbot de atención al cliente con requisitos de soberanía de datos: al poder ejecutarse en infraestructura propia con licencia Apache 2.0, encaja en entornos regulados donde el texto del cliente no puede salir de la organización.
- Prototipado rápido y evaluación de arquitecturas: sirve como banco de pruebas para pipelines de vLLM, llama.cpp u Ollama antes de escalar a variantes mayores de la misma familia, manteniendo compatibilidad de plantillas de prompt y tokenizador.
- Traducción y reescritura de textos en varias lenguas: la naturaleza multilingüe declarada de la serie permite tareas de traducción ligera y normalización de texto, aunque no hay datos publicados de calidad por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La guía de fine-tuning de distil labs indica explícitamente que ningún benchmark publicado de distil labs cubre este modelo. Tampoco la model card del repositorio de volantis-labs incluye mediciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite. No se deben extrapolar cifras del modelo base sin una fuente verificable.

## Requisitos de hardware

- Tamaño de pesos: el archivo Q4_K_M ocupa 1.280.835.840 bytes (aproximadamente 1,19 GiB), según el hash y el tamaño declarados en la model card.
- VRAM estimada para inferencia: estimación a partir del tamaño del archivo; hay que sumar el búfer de contexto y el overhead del runtime. En la práctica, un presupuesto de 2 a 4 GB de VRAM cubre pesos y contexto moderado, aunque la cifra exacta depende del runtime y de la longitud de contexto solicitada.
- Memoria en CPU: al ser un GGUF, puede ejecutarse íntegramente en CPU con llama.cpp; se necesitan del orden de 2 GB de RAM libres para pesos y estado, más el espacio del contexto.
- GPU de consumo: sí cabe en GPUs de gama de entrada y media, como una GTX 1650 de 4 GB, una RTX 3060, una RTX 4060 o una RTX 4090. La documentación de vLLM sitúa el modelo base como apto para GPUs de consumo de 8 GB.
- GPU de centro de datos: A100, H100 y similares son compatibles pero sobredimensionadas para un modelo de 1,88 B; su uso tendría sentido únicamente en despliegues con muchas réplicas concurrentes o contextos muy largos.
- Opciones de despliegue: llama.cpp, Ollama (existe la etiqueta `qwen3.5:2b` en el catálogo de Ollama), vLLM (hay receta publicada para el modelo base), TGI y cualquier runtime compatible con GGUF, además de los entornos de inferencia on-device de Qualcomm AI Hub y el catálogo de Microsoft Foundry.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para este archivo cuantizado.
- Nota sobre el KV cache: la arquitectura del modelo base incorpora capas de gated delta networks, que en teoría reducen el crecimiento del estado respecto a un transformer de atención completa. Se desconoce la proporción exacta de capas de atención lineal frente a capas de atención completa en la variante de 2 B, por lo que no se puede cuantificar el ahorro real de memoria con contextos de 262K.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus model cards públicas y no han sido verificados en la búsqueda realizada; se incluyen como referencia orientativa.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| volantis-labs/qwen3.5-2b (GGUF Q4_K_M) | 1,88 B | 262.144 tokens según el modelo base | Densa con gated delta networks | Apache 2.0 | Solo GGUF cuantizado en este repositorio |
| Qwen3-1.7B | 1,7 B | 32.768 tokens nativos, ampliable con YaRN según su model card | Transformer denso | Apache 2.0 | Safetensors, GGUF y múltiples runtimes |
| Llama-3.2-1B | 1,2 B | 128.000 tokens según su model card | Transformer denso | Llama 3.2 Community License (con restricciones) | Safetensors, GGUF y múltiples runtimes |
| Gemma-3-1B | 1 B | 32.000 tokens según su model card | Transformer denso | Términos de uso de Gemma (con restricciones) | Safetensors, GGUF y múltiples runtimes |

La diferencia más marcada frente a las alternativas de la misma franja es la ventana de contexto declarada de 262K y la arquitectura híbrida del modelo base. No hay datos de rendimiento comparativo publicados para este archivo cuantizado, por lo que la comparación en calidad queda sin resolver.

## Limitaciones y advertencias

- Redistribución no oficial: el repositorio pertenece a volantis-labs, no al Qwen Team. No es una publicación del autor original del modelo, aunque se distribuya bajo la misma licencia Apache 2.0.
- Falta de validación comunitaria: 0 descargas y 0 «likes» en el momento de la consulta, con fecha de creación y actualización del 24 de septiembre de 2026. No hay evidencia de terceros que hayan verificado el comportamiento del archivo.
- Verificación de integridad recomendada: la model card publica el SHA-256 `aaf42c8b7c3cab2bf3d69c355048d4a0ee9973d48f16c731c0520ee914699223`; conviene comprobarlo tras la descarga para descartar corrupción o manipulación.
- Pérdida por cuantización: Q4_K_M introduce degradación respecto a los pesos en precisión completa, con impacto especialmente sensible en tareas de código, matemáticas y recuperación de información en contextos muy largos.
- Riesgo de alucinación: en modelos de esta escala es alto de forma intrínseca. No se recomienda su uso sin verificación humana en dominios legales, médicos, financieros o de seguridad.
- Contexto largo no equivalente a comprensión completa: la propia guía de distil labs advierte sobre qué es y qué no es razonable esperar de una ventana de 262K. La degradación en posiciones intermedias es un fenómeno habitual y no hay mediciones publicadas para este modelo.
- Idiomas: no hay listado oficial de idiomas soportados ni evaluación por idioma, pese a la descripción multilingüe de la serie.
- Capacidades no confirmadas: no se documenta tool calling, razonamiento agéntico, modo de razonamiento explícito ni visión en este archivo GGUF. No se deben asumir.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene revisar las condiciones aplicables del modelo base y confirmar que la cadena de redistribución es correcta.
- Correspondencia de formatos: el repositorio se describe como GGUF, mientras que el dato de parámetros se etiqueta como procedente de safetensors. No se publican pesos en safetensors en este repositorio.
- Datos de arquitectura indirectos: la información sobre gated delta networks, encoder de visión y contexto de 262K proviene de documentación sobre el modelo base, no de la model card de esta redistribución.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/volantis-labs/qwen3.5-2b
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Receta de vLLM para Qwen/Qwen3.5-2B: https://recipes.vllm.ai/Qwen/Qwen3.5-2B
- Guía de fine-tuning de Qwen3.5 2B en distil labs: https://www.distillabs.ai/learn/qwen3-5-2b-fine-tuning-guide/
- Qwen3.5 2B en Ollama: https://ollama.com/library/qwen3.5:2b
- Catálogo de Microsoft Foundry Models: https://ai.azure.com/catalog/models/qwen-qwen3.5-2b
