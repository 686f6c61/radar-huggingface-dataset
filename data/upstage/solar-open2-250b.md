# upstage/Solar-Open2-250B

## Resumen

Solar Open 2 es un modelo de lenguaje de gran tamano (LLM) desarrollado por Upstage, una empresa surcoreana especializada en IA empresarial. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) hibrida con 250B parametros totales, de los cuales solo 15B se activan por token, lo que permite un coste de inferencia comparable al de un modelo mucho mas pequeno. El modelo esta disenado especificamente para casos de uso agente, como productividad ofimatica, trabajo intensivo con documentos y generacion de codigo.

La principal innovacion tecnica del modelo reside en su arquitectura de atencion hibrida, que intercala capas de atencion softmax con capas de atencion lineal. Esto elimina la necesidad de codificacion posicional rotatoria (RoPE), ya que las capas lineales codifican el orden de los tokens en su estado recurrente, lo que permite ampliar la longitud de contexto hasta 1 millon de tokens sin degradacion. Ademas, solo 12 de las 48 capas mantienen cache KV, reduciendo la memoria necesaria para contexto largo a aproximadamente una cuarta parte de un modelo all-softmax del mismo tamano.

El modelo se posiciona como un "especialista agente", compitiendo con los modelos open-weight mas potentes en benchmarks de agencia, tool calling y razonamiento multi-paso. Su entrenamiento se realizo sobre aproximadamente 12 billones de tokens en ingles, coreano y japones, utilizando GPUs NVIDIA B200 con un total de 2 millones de horas de GPU. El modelo esta disponible bajo la licencia propietaria Upstage Solar License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-Attention Mixture-of-Experts (MoE) con atencion lineal intercalada |
| Parametros totales | 250.287.810.304 (250B) |
| Parametros activos | 15B por token |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles, coreano, japones |
| Licencia | Upstage Solar License (licencia propietaria de uso limitado) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Solar Open 2 utiliza una arquitectura MoE con 48 capas y 321 expertos (320 enrutados + 1 compartido), de los cuales se activan 8 expertos enrutados (top-8) mas el experto compartido por token. El tamano oculto es de 4096 y el vocabulario alcanza los 196.608 tokens. La atencion es hibrida: sigue un patron `[Softmax, Linear x3] x 12`, es decir, por cada capa de atencion softmax hay tres capas de atencion lineal. La atencion softmax utiliza Grouped Query Attention (GQA) con 64 cabezas de consulta y 8 cabezas de clave/valor, mientras que la atencion lineal usa 64 cabezas de consulta sin cache KV.

Una innovacion destacable es la eliminacion completa de la codificacion posicional (NoPE). Las capas de atencion lineal codifican el orden de los tokens de forma intrinseca en su estado recurrente, lo que elimina el limite de extrapolacion impuesto por RoPE y permite alcanzar 1M de contexto. Solo 12 de las 48 capas mantienen cache KV, lo que reduce significativamente los requisitos de memoria en inferencia de contexto largo.

El entrenamiento se realizo en dos fases. Primero, el modelo se inicializo mediante transferencia selectiva de pesos desde Solar Open 1 (102B): solo el 2,3% de los pesos que sobreviven al cambio arquitectonico se transfirieron, y el resto se inicializo aleatoriamente. Esto eleva el punto de partida y acelera la convergencia temprana a escala 250B. El preentrenamiento se realizo sobre aproximadamente 12 billones de tokens, utilizando GPUs NVIDIA B200 con un total de 2 millones de horas de GPU. No se especifica si se aplicaron tecnicas de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto en ingles, coreano y japones con calidad nativa en los tres idiomas.
- Razonamiento multi-paso y ejecucion de tareas de extremo a extremo, disenado especificamente para flujos de trabajo agente.
- Tool calling y function calling, con soporte para integracion en pipelines de agentes.
- Razonamiento matematico y cientifico de alto nivel, con puntuaciones competitivas en GPQA-Diamond y HLE.
- Generacion de codigo, con puntuacion de 70.4 en SWE-bench, compitiendo con los mejores modelos open-weight.
- Procesamiento de documentos extensos gracias a su ventana de contexto de 1M tokens, capaz de mantener coherencia en tareas de recuperacion y analisis de documentos largos.
- Inferencia eficiente en contexto largo gracias a la arquitectura de atencion hibrida, que reduce el cache KV a una cuarta parte de un modelo all-softmax equivalente.

## Casos de uso

- Atencion al cliente automatizada multilingue: el modelo puede gestionar conversaciones multi-turno en ingles, coreano y japones con contexto largo, manteniendo el historial completo de la interaccion gracias a su ventana de 1M tokens. Su capacidad de tool calling permite integrarse con sistemas CRM y bases de conocimiento empresariales.

- Analisis de documentos legales y financieros: con 1M de contexto, puede procesar contratos extensos, informes anuales o expedientes completos de una sola pasada, extrayendo clausulas relevantes, comparando versiones y generando resumenes ejecutivos sin necesidad de chunking.

- Agente de codificacion autonomo: su puntuacion de 70.4 en SWE-bench indica capacidad para resolver issues reales de repositorios. Puede integrarse en pipelines de CI/CD para revisar pull requests, generar fixes y ejecutar tareas de refactoring de forma autonoma.

- Asistente de investigacion cientifica: con rendimiento competitivo en GPQA-Diamond (86.3) y HLE (28.8), puede ayudar en la revision de literatura, formulacion de hipotesis y analisis de datos experimentales, manteniendo contexto sobre multiples papers y datasets.

- Generacion de documentacion tecnica multilingue: puede generar documentacion tecnica, manuales de usuario y guias de producto simultaneamente en ingles, coreano y japones, manteniendo consistencia terminologica entre idiomas gracias a su entrenamiento multilingue.

- Automatizacion de tareas ofimaticas: el modelo esta construido para flujos de trabajo agente en productividad ofimatica, pudiendo generar informes, resumir reuniones, redactar correos y manipular hojas de calculo mediante tool calling, actuando como un asistente ejecutivo autonomo.

## Benchmarks y rendimiento

Los siguientes datos de benchmarks se extraen de la model card del autor. Se comparan con modelos de tamano similar:

| Benchmark | Solar Open 2 (250B-A15B) | Solar Open 100B (102B-A12B) | Command A+ (218B-A25B) | Mistral Medium 3.5 (128B dense) | MiMo-V2.5 (310B-A15B) | DeepSeek-V4-Flash (284B-A13B) |
|---|---:|---:|---:|---:|---:|---:|
| MMLU-Pro | 86.2 | 80.4 | 79.0 | 81.2 | 84.6 | 85.9 |
| GPQA-Diamond | 86.3 | 66.2 | 75.6 | 77.5 | 83.0 | 88.9 |
| HLE (w/o tools) | 28.8 | 11.5 | 11.4 | 12.8 | 24.3 | 32.3 |
| LiveCodeBench | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| SWE-bench | 70.4 | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: los datos de SWE-bench se citan en la cobertura de prensa (aiweekly.co), no en la model card. Los resultados de LiveCodeBench no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Con 250B parametros en precision FP16, el peso del modelo ocupa aproximadamente 500 GB, por lo que se requiere despliegue multi-GPU obligatoriamente.
- GPU recomendadas: minimo 4x NVIDIA H200, recomendado 8x NVIDIA H200, segun la model card. El entrenamiento se realizo en NVIDIA B200.
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en estaciones de trabajo individuales. Requiere infraestructura de servidor.
- Opciones de despliegue: el modelo es compatible con vLLM (mencionado en los tags del repositorio). Dado el formato safetensors, tambien puede desplegarse con TGI (Text Generation Inference) de Hugging Face. No se menciona compatibilidad con llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La arquitectura MoE con 15B parametros activos sugiere una latencia comparable a modelos de ese tamano, pero no se proporcionan datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | MMLU-Pro | GPQA-Diamond | Licencia |
|---|---|---|---|---|---|---|
| Solar Open 2 | 250B | 15B | 1M | 86.2 | 86.3 | Upstage Solar License (propietaria) |
| DeepSeek-V4-Flash | 284B | 13B | no disponible | 85.9 | 88.9 | no disponible |
| Command A+ | 218B | 25B | no disponible | 79.0 | 75.6 | no disponible |
| MiMo-V2.5 | 310B | 15B | no disponible | 84.6 | 83.0 | no disponible |

Solar Open 2 compite directamente con otros MoE de gran escala. Su principal ventaja es la ventana de contexto de 1M tokens, que no esta disponible en los modelos comparados segun la informacion proporcionada. En MMLU-Pro supera a todos los comparados, mientras que en GPQA-Diamond queda por detras de DeepSeek-V4-Flash. La licencia propietaria puede ser un factor limitante frente a alternativas con licencias mas permisivas.

## Limitaciones y advertencias

- La licencia Upstage Solar License es propietaria y de uso limitado. Es necesario revisar los terminos completos en el archivo LICENSE del repositorio antes de cualquier uso comercial. Puede haber restricciones para ciertos casos de uso o volumenes de despliegue.
- El modelo solo soporta tres idiomas: ingles, coreano y japones. No hay soporte para espanol, frances, aleman u otros idiomas europeos, lo que limita su uso en entornos multilingues globales.
- El riesgo de alucinacion no se cuantifica en la informacion disponible. Como cualquier LLM, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o con datos no vistos en entrenamiento.
- La ventana de contexto de 1M tokens puede introducir latencia adicional en inferencia, incluso con la arquitectura hibrida. No se proporcionan datos de latencia para contextos extremadamente largos.
- El despliegue requiere hardware de gama alta (minimo 4x H200), lo que limita su accesibilidad a organizaciones con infraestructura GPU significativa.
- La inicializacion mediante transferencia selectiva de pesos desde Solar Open 1 puede implicar que el modelo herede sesgos presentes en el modelo predecesor, aunque no se documentan sesgos especificos.
- No se proporciona informacion sobre la composicion detallada del dataset de entrenamiento, lo que dificulta evaluar posibles sesgos de contenido o dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/upstage/Solar-Open2-250B
- Technical Report (arXiv): https://arxiv.org/abs/2607.20062
- Blog de anuncio de Upstage: https://www.upstage.ai/blog/en/solar-open-2
- Sitio web de Upstage: https://www.upstage.ai/
- Articulo de analisis (aiweekly.co): https://aiweekly.co/alerts/upstages-solar-open2-250b-posts-frontier-scores-at-15b-active
- Articulo de analisis (ai.thesatyajit.com): https://ai.thesatyajit.com/articles/solar-open2-250b
- OpenModelMap (benchmarks y guia de despliegue): https://openmodelmap.com/model/upstage/Solar-Open2-250B
