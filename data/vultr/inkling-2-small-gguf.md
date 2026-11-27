# vultr/Inkling-2-Small-GGUF

## Resumen

Inkling 2 Small GGUF es la versión cuantizada en formato GGUF del modelo multimodal Inkling 2 Small de Thinking Machines, publicada por Vultr. Se trata de un modelo Mixture-of-Experts (MoE) de arquitectura decoder-only que combina un codificador de visión con predicción multi-token (Multi-Token Prediction) y que se distribuye de forma nativa en NVFP4. El modelo está orientado a asistentes de código, uso agéntico de herramientas, generación aumentada por recuperación (RAG) y aplicaciones conversacionales.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar el modelo con llama.cpp sobre hardware más modesto que el requerido por los pesos originales en NVFP4. Vultr aplica cuantización híbrida: en lugar de una precisión uniforme, cada capa recibe una precisión elegida a partir de una puntuación de importancia medida, de modo que los bits se asignan donde más afectan a la salida.

Con 594B parámetros totales y 17B activos por token, una ventana de contexto de 1M tokens y soporte image-text-to-text, el modelo se posiciona en la categoría de MoE multimodal de gran escala con activación dispersa. El repositorio GGUF ocupa 1.427 GB, lo que refleja el tamaño considerable de los pesos cuantizados para un modelo de este calibre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | inkling2, Mixture-of-Experts, decoder-only, con codificador de visión |
| Parametros totales | 594B (593.722.948.608) |
| Parametros activos | 17B |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | GGUF con cuantización híbrida por capa (precisión elegida por puntuación de importancia); cuantizaciones específicas no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Inkling 2 Small emplea una arquitectura MoE decoder-only con 48 capas, tamaño oculto de 4.608, 48 cabezas de atención y 8 cabezas key-value (GQA). El componente MoE enruta 8 de 384 expertos por token, sin expertos compartidos, lo que da lugar a 17B parámetros activos sobre un total de 594B. Incorpora un codificador de visión de 23 capas que habilita la entrada image-text-to-text, y utiliza Multi-Token Prediction como técnica de decodificación. El vocabulario es de 200.058 tokens.

La model card indica que el modelo se distribuye nativamente en NVFP4 y que esta versión GGUF es una cuantización híbrida producida por Vultr: cada capa recibe una precisión distinta según una puntuación de importancia medida, en lugar de aplicar una única precisión a toda la red. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno.
- Procesamiento multimodal image-text-to-text mediante codificador de visión de 23 capas.
- Asistencia de código y uso agéntico de herramientas (tool use).
- Generación aumentada por recuperación (RAG).
- Predicción multi-token (Multi-Token Prediction) para decodificación.
- Soporte de contexto largo de hasta 1M tokens.
- Compatibilidad con llama.cpp al distribuirse en formato GGUF.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y entornos de desarrollo para autocompletado, revisión y generación de parches, aprovechando su orientación explícita a asistentes de código y su formato GGUF para despliegue con llama.cpp.
- Uso agéntico de herramientas: al estar diseñado para tool use, puede orquestar llamadas a APIs y funciones en flujos de varios pasos, con la ventaja de sus 17B parámetros activos que reducen el coste computacional por token frente a un modelo denso de tamaño equivalente.
- RAG sobre documentación extensa: con 1M tokens de contexto puede ingerir grandes volúmenes de documentos y responder consultas con recuperación aumentada sin fragmentar en exceso el material.
- Análisis de imágenes con texto: gracias al pipeline image-text-to-text, permite describir, clasificar o extraer información de capturas, diagramas o documentos escaneados combinados con instrucciones textuales.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto largo, manteniendo el hilo de la conversación durante interacciones extensas.
- Despliegue en infraestructura propia con llama.cpp: la versión GGUF permite servir el modelo en entornos controlados sin depender de los pesos NVFP4 originales, útil para organizaciones que requieren soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio GGUF ocupa 1.427 GB, por lo que la inferencia requiere almacenamiento y memoria del orden de terabytes para cargar los pesos completos.
- VRAM estimada: no disponible de forma desagregada por cuantización; el tamaño del repo (1.427 GB) da una referencia del orden de magnitud de memoria necesaria.
- GPU recomendadas: no disponibles en la información proporcionada; por el volumen de pesos, se requiere hardware de clase servidor con gran cantidad de memoria (A100/H100 en configuraciones multi-GPU) para cargar el modelo completo.
- Viabilidad en GPU de consumo: no disponible; el tamaño de los pesos hace inviable la carga completa en GPU consumer convencionales.
- Opciones de despliegue: llama.cpp (formato GGUF nativo); otras opciones no disponibles en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La comparativa cuantitativa no está disponible.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling 2 Small (GGUF) | 594B | 17B | 1M | Apache 2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo entrenado con datos web, es esperable que herede sesgos, pero no se documentan.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido incorrecto con aparente seguridad.
- Idiomas soportados: no disponibles; se desconoce la cobertura multilingüe real.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base (thinkingmachines/Inkling-2-Small) y de la cuantización.
- La cuantización híbrida puede introducir degradaciones de calidad respecto a los pesos NVFP4 originales; no se documenta la pérdida de rendimiento.
- El tamaño de 1.427 GB del repositorio impone requisitos de infraestructura elevados para su despliegue.
- No se documentan detalles de entrenamiento (tokens, dataset, RLHF/DPO), lo que limita la evaluación de su comportamiento en dominios específicos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/vultr/Inkling-2-Small-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Vultr: https://www.vultr.com/
- Vultr (EN): https://www.vultr.com/en/
- Vultr en Wikipedia: https://en.wikipedia.org/wiki/Vultr
- Vultr Discover: https://discover.vultr.com/
- Vultr Docs: https://docs.vultr.com/
