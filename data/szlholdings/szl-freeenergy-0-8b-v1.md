# SZLHOLDINGS/SZL-FreeEnergy-0.8B-v1

## Resumen

SZL-FreeEnergy-0.8B-v1 es un modelo de generacion de texto de 873 millones de parametros publicado por SZLHOLDINGS, un espacio de Hugging Face orientado a lo que el autor denomina "governed-AI estate": modelos, datasets y Spaces con resultados trazables y verificables mediante ficheros de recibo (receipts). El modelo se presenta como un artefacto entrenado dentro de esa factoria y deriva de un modelo base identificado como `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3`, lo que sugiere un linaje de ajuste supervisado sobre una arquitectura de la familia Qwen 3.5.

La etiqueta de arquitectura en el repositorio es `qwen3_5`, y los pesos se distribuyen en formato safetensors con un total de 873.438.784 parametros, lo que arroja un tamano de repositorio de aproximadamente 1,8 GB. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. El modelo se publica bajo la libreria transformers y la tarea declarada es text-generation.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeno (sub-1B) potencialmente desplegable en hardware de consumo; por otro, es un caso representativo de una practica creciente de publicacion que prioriza la trazabilidad (etiquetas MEASURED/REPORTED/UNKNOWN) sobre las afirmaciones de rendimiento. La model card es deliberadamente parca: no incluye datos de entrenamiento, benchmarks ni detalles de arquitectura mas alla de la etiqueta, y remite a ficheros de recibo externos que no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (etiqueta del repositorio; detalles no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible es la etiqueta `qwen3_5` asociada al repositorio, que apunta a la familia Qwen 3.5. No se especifica en la model card el numero de capas, dimensiones ocultas, mecanismo de atencion, tipo de tokenizador ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se indica si es un transformer denso o una variante MoE; el recuento de parametros (873 M) y la ausencia de parametros activos declarados sugieren un modelo denso, pero esto no se confirma en la informacion proporcionada.

Respecto al entrenamiento, el modelo se presenta como un artefacto derivado de `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3`, lo que indica al menos una fase de ajuste supervisado (SFT) sobre una base previa. No se dispone del numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones de preferencia. La model card declara explicitamente que cualquier afirmacion de entrenamiento o evaluacion "vive en sus ficheros de recibo", y que lo no registrado alli se marca como UNKNOWN; esos ficheros no forman parte de la informacion disponible.

## Capacidades

- Generacion de texto en ingles: es la unica tarea declarada en el pipeline (`text-generation`).
- Razonamiento y respuesta conversacional: no se documentan capacidades especificas mas alla de la generacion de texto generica.
- Codigo y matematicas: no disponible; no se declaran ni se evaluan en la model card.
- Tool calling / function calling: no disponible; no se menciona soporte nativo.
- Soporte de agentes y razonamiento multi-paso: no disponible; el linaje del modelo base (`receiptagent`) sugiere un origen orientado a agentes, pero no se confirma ninguna capacidad concreta.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Clasificacion y etiquetado de texto en ingles a escala: con 873 M de parametros, el modelo puede ejecutarse en lotes sobre CPU o GPU modestas para tareas de clasificacion, extraccion de entidades o enrutamiento de documentos, donde el coste por token es critico.
- Prototipado rapido de asistentes conversacionales en ingles: su tamano permite iterar en local con `transformers` sin infraestructura dedicada, util para validar prompts y flujos antes de migrar a modelos mayores.
- Generacion de resumenes de documentos cortos: adecuado para pipelines de preprocesado donde se necesita un primer resumen barato antes de un modelo de mayor calidad.
- Filtrado y pre-anotacion en anotacion humana: el modelo puede generar borradores de etiquetas o respuestas que un revisor humano valida, reduciendo el coste del etiquetado manual.
- Experimentacion academica sobre modelos sub-1B: su licencia Apache 2.0 y su publicacion en safetensors facilitan su uso como linea base en estudios de eficiencia, destilacion o ajuste fino.
- Despliegue en entornos con restricciones de hardware: al ser un modelo pequeno, puede servir en dispositivos edge o en instancias CPU para tareas de generacion de baja latencia y baja concurrencia.
- Base para ajuste fino especifico de dominio: al derivar de un modelo SFT y publicarse con licencia permisiva, puede reentrenarse para dominios concretos (legal, financiero, soporte) con requisitos de computo modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y que las cifras no registradas se marcan como UNKNOWN. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (873 M de parametros), en FP16 se necesitarian aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, alrededor de 0,9 GB, y en 4 bits, alrededor de 0,5 GB. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: no disponibles. Por tamano, el modelo cabria en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores, asi como en GPUs de datacenter (A100, H100) para despliegues de alta concurrencia.
- Cabe en consumer GPU: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM en FP16, aunque no se confirma oficialmente.
- Opciones de despliegue: `transformers` es la libreria declarada. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI, y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparacion rigurosa. La siguiente tabla recoge unicamente parametros estructurales verificables frente a alternativas conocidas de la misma categoria (modelos densos sub-1B con licencia permisiva); los campos de rendimiento se marcan como no disponibles porque no hay benchmarks publicados.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Rendimiento |
|---|---|---|---|---|---|
| SZL-FreeEnergy-0.8B-v1 | 873 M | no disponible | Apache 2.0 | en | no disponible |
| Qwen2.5-0.5B | 494 M | 32 768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | multilingue | benchmarks publicos por el autor |
| Llama 3.2 1B | 1,24 B | 128 000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | multilingue | benchmarks publicos por el autor |
| SmolLM2-1.7B | 1,7 B | 8 192 tokens (segun documentacion publica de Hugging Face) | Apache 2.0 | en (principalmente) | benchmarks publicos por el autor |

Nota: los datos de contexto y licencia de los modelos comparados provienen de su documentacion publica general y no de la informacion proporcionada en esta busqueda; se incluyen solo como referencia estructural. No se dispone de una comparacion de rendimiento verificable entre SZL-FreeEnergy-0.8B-v1 y estas alternativas.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card no detalla arquitectura, datos de entrenamiento, contexto ni evaluacion; cualquier uso en produccion requiere validacion propia.
- Sesgos conocidos: no documentados. Al no publicarse la composicion del dataset, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion: no cuantificado. Como modelo generativo de 873 M de parametros, es esperable una tasa de alucinacion significativa en tareas de conocimiento factual, aunque no hay mediciones publicadas.
- Limitacion de idioma: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Limitaciones de contexto: la longitud de contexto no esta disponible, lo que impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, el modelo base del que deriva (`szl-receiptagent-qwen35-0.8b-sft-v3`) deberia verificarse por si impusiera condiciones adicionales, extremo no confirmado en la informacion disponible.
- Trazabilidad dependiente de ficheros externos: las afirmaciones de entrenamiento y evaluacion remiten a ficheros de recibo alojados en el "estate mesh" del autor, no incluidos en el repositorio de la model card; sin acceso a ellos, las capacidades reales del modelo son en gran medida desconocidas.
- Madurez: con 0 likes y 703 descargas en el momento de la consulta, el modelo tiene una adopcion limitada y no se han publicado reportes independientes de uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-FreeEnergy-0.8B-v1
- Modelo base declarado: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de cards (referenciado): https://github.com/szl-holdings/estate-cards
