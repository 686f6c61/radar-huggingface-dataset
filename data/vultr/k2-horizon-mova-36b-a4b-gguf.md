# vultr/K2-Horizon-MoVA-36B-A4B-GGUF

## Resumen

K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso disenado para flujos de trabajo agenticos, razonamiento, generacion de codigo e inferencia eficiente con contexto largo. Lo desarrolla IFM (modelo base: `IFM/K2-Horizon-MoVA-36B-A4B`), y esta ficha concreta corresponde a las cuantizaciones GGUF publicadas por Vultr para su uso con llama.cpp. La arquitectura se denomina `k2-horizon` e incorpora una innovacion propietaria llamada Mixture-of-Values Attention (MoVA), que combina expertos enrutados convencionales con un conjunto adicional de expertos de atencion.

El modelo cuenta con 36B parametros totales (37.444.792.020 segun los pesos en safetensors) pero solo activa aproximadamente 4B parametros por token, lo que lo situa en la categoria de MoE de alta eficiencia. Su contexto nativo es de 512K tokens, un tamano poco habitual incluso entre modelos frontera, y esta pensado para cargas de trabajo que requieren ventanas de contexto muy extensas sin disparar el coste computacional por token.

La relevancia de esta publicacion radica en dos factores: por un lado, la cuantizacion hibrida de Vultr, que asigna precision por capa segun una puntuacion de importancia medida en lugar de aplicar una precision uniforme a toda la red; por otro, la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. El repositorio GGUF ocupa 89,9 GB y esta orientado a despliegues en llama.cpp y entornos compatibles con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | k2-horizon, Mixture-of-Experts con Mixture-of-Values Attention (MoVA) |
| Parametros totales | 36B (37.444.792.020 segun safetensors) |
| Parametros activos | 4B por token |
| Longitud de contexto | 512K tokens nativos |
| Tipos de cuantizacion | GGUF hibrido (precision por capa segun puntuacion de importancia); niveles concretos no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

Otros datos arquitectonicos disponibles: 48 capas, hidden size de 2.560, 32 cabezas de atencion, 8 cabezas key-value (GQA), vocabulario de 250.624 tokens, 100 expertos enrutados con 8 activados por token mas 1 compartido, y 64 expertos MoVA con 4 seleccionados por token.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de tipo Mixture-of-Experts disperso con 48 capas y un hidden size relativamente compacto de 2.560. La innovacion principal es la Mixture-of-Values Attention (MoVA): ademas de los 100 expertos enrutados convencionales (8 activos por token mas uno compartido), incorpora 64 expertos MoVA de los que se seleccionan 4 por token. Esta combinacion busca preservar capacidad representacional con un coste de computo por token muy contenido, coherente con los 4B parametros activos sobre 36B totales. La atencion usa 32 cabezas con 8 cabezas key-value, lo que reduce el tamano de la cache KV en contextos largos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco hay detalles publicados sobre la estrategia de extension de contexto hasta 512K tokens. La model card unicamente indica que el modelo esta optimizado para inferencia de alta capacidad y eficiente, con enfasis en flujos agenticos y contexto largo. La cuantizacion de Vultr es hibrida: mide una puntuacion de importancia por capa y elige la precision de cada una en funcion de esa puntuacion, de modo que los bits se concentran donde mas afectan a la salida.

## Capacidades

- Generacion de texto conversacional y de proposito general.
- Razonamiento multi-paso y tareas agenticas.
- Generacion de codigo y asistencia en programacion.
- Inferencia eficiente sobre contextos muy largos (hasta 512K tokens nativos).
- Diseno orientado a flujos de trabajo con multiples pasos y uso de herramientas, segun la descripcion del autor del modelo base.
- Capacidad multilingue limitada al ingles segun los metadatos del repositorio.
- Soporte de despliegue en llama.cpp y entornos compatibles con endpoints.

No hay informacion disponible sobre soporte explicito de tool calling, modo thinking, vision o audio en la documentacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 512K tokens de contexto nativo, el modelo puede ingerir arboles de codigo extensos, multiples ficheros y documentacion asociada en una sola pasada para tareas de revision, refactorizacion o explicacion de arquitectura.
- Agentes autonomos de larga duracion: los 4B parametros activos por token reducen el coste por paso en bucles agenticos con muchas iteraciones, mientras que el contexto largo permite mantener el historial completo de acciones y observaciones sin truncar.
- Procesamiento de documentacion legal o tecnica: contratos, manuales o especificaciones de cientos de paginas pueden cargarse integramente en contexto, evitando perdida de informacion por fragmentacion en chunks.
- Asistencia a la programacion en produccion: el modelo puede integrarse en pipelines de CI/CD o en IDE mediante llama.cpp para tareas de generacion, explicacion y correccion de codigo, con la ventaja de una licencia Apache 2.0 sin restricciones comerciales.
- Despliegue en infraestructura propia con GPU de consumo: las cuantizaciones GGUF hibridas permiten ejecutar un modelo de 36B en hardware mas modesto que el que requeriria el modelo en precision completa, manteniendo calidad gracias a la asignacion de bits por importancia.
- Resumen y extraccion de informacion en corpus extensos: articulos cientificos, transcripciones o hilos de soporte de gran longitud pueden procesarse en una unica ventana, lo que simplifica arquitecturas de RAG al reducir la dependencia de recuperacion externa.
- Chat de soporte tecnico multi-turno: la ventana de 512K tokens permite conservar conversaciones e historial de tickets muy largos, y el reducido coste por token activo abarata el servicio en comparacion con modelos densos de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta, ya que los niveles de cuantizacion concretos del repositorio no se detallan. El repositorio completo ocupa 89,9 GB, lo que sugiere que las variantes de mayor precision requieren del orden de 80 GB o mas de memoria, mientras que las variantes mas agresivas podrian situarse en rangos inferiores.
- GPU recomendadas: no disponible. Por el tamano del repositorio, las configuraciones de mayor precision probablemente requieren GPU de datacenter como A100 80 GB o H100; las cuantizaciones mas bajas podrian caber en configuraciones multi-GPU de consumo.
- Cabe en GPU de consumo: no confirmado; depende del nivel de cuantizacion elegido dentro del repositorio.
- Opciones de despliegue: llama.cpp (soporte nativo por el formato GGUF) y entornos compatibles con endpoints; vLLM, TGI u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de informacion suficiente sobre modelos comparables de la misma categoria para establecer una comparativa rigurosa. Se indica como no disponible.

## Limitaciones y advertencias

- Idioma: los metadatos solo declaran soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior.
- Alucinacion: no hay informacion publicada sobre tasas de alucinacion ni sobre tecnicas de mitigacion aplicadas durante el entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Contexto: aunque el contexto nativo es de 512K tokens, no se detalla el rendimiento real en ventanas extremas (degradacion, coste de atencion, comportamiento en recuperacion de informacion a larga distancia).
- Cuantizacion: al ser una cuantizacion hibrida, distintas variantes del repositorio pueden presentar diferencias de calidad no documentadas; conviene validar la variante concreta en el caso de uso objetivo.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base `IFM/K2-Horizon-MoVA-36B-A4B` mantiene la misma licencia, ya que la ficha solo confirma la del repositorio GGUF.
- Produccion: al no haber benchmarks publicados ni descargas registradas, el modelo carece de validacion externa por parte de la comunidad; se recomienda evaluacion propia antes de desplegarlo.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/vultr/K2-Horizon-MoVA-36B-A4B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Vultr (proveedor de la cuantizacion): https://www.vultr.com/
- Documentacion de Vultr: https://docs.vultr.com/
