# vultr/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por Thinking Machines, disenado especificamente para asistentes de codigo, uso agentico de herramientas y aplicaciones conversacionales. Combina un codificador de vision con prediccion multi-token (Multi-Token Prediction) y se distribuye en precisiones NVFP4 y MXFP8. El repositorio que nos ocupa, `vultr/Inkling-2-Mini-GGUF`, contiene las cuantizaciones GGUF producidas por Vultr, pensadas para su uso con llama.cpp y compatible con endpoints.

La innovacion principal de esta version GGUF es su naturaleza de cuantizacion hibrida: en lugar de aplicar una precision uniforme a toda la red, Vultr selecciona la precision de cada capa a partir de una puntuacion de importancia medida empiricamente, de modo que los bits se asignan alli donde mas afectan a la salida del modelo. Esto permite reducir el tamano del modelo manteniendo una calidad cercana a la del modelo base.

Con 26.070.385.152 parametros totales (26,4B) y solo 3,4B activos por token, el modelo ofrece un equilibrio interesante entre capacidad y coste de inferencia. La arquitectura `inkling2_loop` repite las 12 capas centrales tres veces con pesos compartidos, lo que da lugar a 48 aplicaciones de capa por token sobre 24 capas fisicas. La licencia Apache 2.0 facilita su adopcion tanto en entornos de investigacion como comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | inkling2_loop, Mixture-of-Experts, decoder-only con codificador de vision |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | 3,4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF hibrida (precision por capa segun puntuacion de importancia); el modelo base se distribuye en NVFP4 y MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Capas | 24 decoder-only (12 centrales repetidas 3 veces con pesos compartidos); 48 aplicaciones por token |
| Capas del codificador de vision | 23 |
| Tamano oculto | 2.304 |
| Cabezas de atencion | 24 |
| Cabezas clave-valor | 8 (GQA) |
| Expertos | 8 de 128 activos por capa y token |
| Tamano del repositorio | 70,1 GB |

## Arquitectura y entrenamiento

Inkling 2 Mini emplea una arquitectura transformer decoder-only con mezcla de expertos y una innovacion estructural denominada `inkling2_loop`: las 12 capas centrales del modelo se ejecutan tres veces con pesos compartidos, de forma que un token atraviesa 48 aplicaciones de capa aunque solo existan 24 capas fisicas. Esta reutilizacion de pesos reduce el numero de parametros unicos necesarios mientras incrementa la profundidad efectiva del calculo. La capa MoE enruta cada token a 8 de los 128 expertos disponibles en cada capa, lo que explica la diferencia entre los 26,4B parametros totales y los 3,4B activos por token. La atencion usa 24 cabezas de consulta y 8 cabezas clave-valor (GQA), con un tamano oculto de 2.304.

El modelo incorpora un codificador de vision de 23 capas que lo habilita para tareas image-text-to-text. Ademas, integra prediccion multi-token (Multi-Token Prediction), una tecnica que permite predecir varios tokens por paso de decodificacion y que puede acelerar la generacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las cuantizaciones GGUF de Vultr aplican una estrategia hibrida de precision por capa basada en una puntuacion de importancia medida, en lugar de una precision uniforme.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text) gracias a su codificador de vision de 23 capas.
- Asistencia en programacion y generacion de codigo, segun la descripcion del autor del modelo base.
- Uso agentico de herramientas (agentic tool use) y razonamiento multi-paso.
- Prediccion multi-token, que puede mejorar el throughput en decodificacion.
- Capacidades multilingues: no se especifican los idiomas soportados.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistente de codigo en IDE: el modelo puede integrarse en entornos de desarrollo para autocompletar, explicar y refactorizar codigo, aprovechando su entrenamiento orientado a asistentes de programacion y su bajo numero de parametros activos (3,4B), que reduce la latencia por token.
- Agentes autonomos con tool calling: su soporte para uso agentico de herramientas permite construir flujos donde el modelo decide que funcion invocar, interpreta el resultado y continua el razonamiento en varios pasos.
- Atencion al cliente multimodal: al aceptar entradas de imagen y texto, puede gestionar consultas donde el usuario adjunta capturas de pantalla, fotos de productos o documentos escaneados junto con texto.
- Analisis de documentos con imagenes: extraccion de informacion de facturas, tickets o formularios escaneados combinando el codificador de vision con el decoder para generar resumenes o respuestas estructuradas.
- Despliegue en infraestructura propia con llama.cpp: al distribuirse en GGUF, puede ejecutarse en servidores sin GPU de gama alta o en entornos con VRAM limitada, lo que facilita prototipos y despliegues on-premise.
- Automatizacion de tareas de soporte tecnico: conversaciones multi-turno con contexto de herramientas y posible adjuncion de capturas de error, adecuado para mesas de ayuda que necesitan interpretar imagenes de pantalla.
- Generacion de codigo en pipelines de CI/CD: su orientacion a asistentes de codigo y su compatibilidad con endpoints permiten integrarlo en revisiones automatizadas o generacion de parches.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF ocupa 70,1 GB, aunque el conjunto de pesos realmente descargado dependera de la variante de cuantizacion elegida. Con 26,4B parametros totales, una cuantizacion de 4 bits rondaria los 13-15 GB, una de 5 bits los 16-18 GB y una de 8 bits los 26-28 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: para las variantes de mayor precision, GPU con 24 GB o mas (RTX 4090, A6000, L40S); para despliegues de produccion con concurrencia, A100 80 GB o H100.
- Cabe en GPU de consumo: previsiblemente si en cuantizaciones de 4 bits en GPUs con 16-24 GB (RTX 4080, RTX 4090), aunque no hay confirmacion oficial.
- Opciones de despliegue: llama.cpp (formato nativo del repositorio), y por extension Ollama u otros frontends basados en llama.cpp. Para el modelo base en NVFP4/MXFP8 se requeririan stacks compatibles con esas precisiones.
- Latencia y throughput: no disponibles. El uso de solo 3,4B parametros activos por token y la prediccion multi-token sugieren un throughput superior al de un modelo denso de 26B, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, se trata de un MoE multimodal de 26,4B totales con 3,4B activos, lo que lo situa en la categoria de modelos eficientes para inferencia; cualquier comparacion con alternativas requeriria datos de rendimiento que no se han publicado aqui.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos del modelo.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- La longitud de contexto no esta disponible, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Los idiomas soportados no estan documentados; no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- La cuantizacion GGUF puede degradar la calidad respecto al modelo base en NVFP4/MXFP8; la estrategia hibrida de Vultr mitiga pero no elimina esta perdida.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base `thinkingmachines/Inkling-2-Mini` y de los pesos originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria publica de su calidad.
- El tag `endpoints_compatible` sugiere compatibilidad con infraestructura de endpoints, pero no se detallan los requisitos exactos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vultr/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Vultr (sitio oficial): https://www.vultr.com/
- Vultr Docs: https://docs.vultr.com/
- Vultr en Wikipedia: https://en.wikipedia.org/wiki/Vultr
