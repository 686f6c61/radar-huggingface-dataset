# SZLHOLDINGS/brain-navigator-r2-estate-sft-v1

## Resumen

brain-navigator-r2-estate-sft-v1 es un ajuste fino supervisado (SFT) sobre el modelo base SZLHOLDINGS/brain-navigator-r2, publicado por SZL Holdings dentro de su catalogo de artefactos de IA "governed-AI estate". Se distribuye como un modelo de generacion de texto de aproximadamente 873 millones de parametros, con pesos en formato safetensors y licencia Apache 2.0. El repositorio ocupa 1,8 GB y esta etiquetado con la arquitectura `qwen3_5` en Hugging Face.

El modelo se presenta como un artefacto entrenado dentro de una "factoría gobernada" de SZL Holdings, una organizacion que enfatiza trazabilidad, recibos de auditoria (receipts) y resultados verificables. La model card es deliberadamente parca: no declara cifras de benchmarks, no detalla el dataset de entrenamiento ni el proceso de alineacion, y remite cualquier afirmacion de rendimiento a ficheros de recibos externos que no estan incluidos en la informacion disponible.

Por su tamano y su enfoque declarado hacia el dominio inmobiliario ("estate"), el modelo parece orientado a tareas de generacion de texto especializadas mas que a proposito general. Es relevante para desarrolladores que necesiten un modelo pequeno, desplegable en hardware modesto y con licencia permisiva, pero la ausencia de documentacion tecnica verificable limita seriamente su evaluacion previa a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia `qwen3_5` (segun tag de Hugging Face); detalles internos no disponibles |
| Parametros totales | 873.438.784 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se confirma safetensors como formato de pesos) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta como `qwen3_5`, lo que sugiere que deriva de la familia Qwen 3.5 de Alibaba, aunque la model card no confirma explicitamente la arquitectura interna ni el linaje exacto. Con 873 millones de parametros, se situa en el rango de modelos pequenos tipo decoder-only, adecuados para inferencia en GPU de consumo. No se especifica si emplea atencion con ventana deslizante, atencion lineal u otras variantes.

El proceso de entrenamiento descrito es un ajuste fino supervisado (SFT) sobre el modelo base SZLHOLDINGS/brain-navigator-r2. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni tecnicas de alineacion adicionales. La model card indica explicitamente que cualquier afirmacion de entrenamiento o evaluacion "vive en sus ficheros de recibos" y que lo no registrado alli se marca como UNKNOWN, por lo que no hay datos verificables sobre el corpus utilizado.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Ajuste fino supervisado orientado presumiblemente al dominio inmobiliario ("estate"), aunque la model card no detalla las tareas concretas.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun el tag de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion.
- Razonamiento, codigo y matematicas: no documentados.

## Casos de uso

- Generacion de descripciones de inmuebles: dado el nombre "estate" del modelo, puede emplearse para redactar fichas y anuncios de propiedades a partir de datos estructurados, aprovechando su ajuste fino SFT sobre el modelo base.
- Clasificacion y etiquetado de textos inmobiliarios: con 873M de parametros puede desplegarse en una sola GPU para tareas de extraccion de entidades o categorizacion de listados.
- Prototipado rapido de asistentes conversacionales en ingles: su tamano reducido permite iterar en local con llama.cpp u Ollama sin infraestructura dedicada.
- Generacion aumentada por recuperacion (RAG) sobre documentacion de propiedades: el modelo puede integrarse como generador final en un pipeline RAG, siempre que se valide su calidad con datos propios al no haber benchmarks publicos.
- Fine-tuning adicional sobre datos de dominio: al ser Apache 2.0 y tener solo 873M de parametros, es viable reentrenarlo o ajustarlo en hardware de consumo para nichos especificos.
- Evaluacion comparativa interna: util como baseline pequeno en pruebas A/B frente a modelos mayores, dado su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y dichos recibos no estan incluidos en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7-1,8 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion tipica de 2,5-3,5 GB en total, no confirmada por el autor).
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090) deberia ser suficiente; tambien A100/H100 para despliegues por lotes.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs modernas con 4-8 GB de VRAM.
- Opciones de despliegue: transformers (libreria declarada), y previsiblemente llama.cpp, Ollama o vLLM si se generan conversiones GGUF/AWQ, aunque no se confirma su disponibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| brain-navigator-r2-estate-sft-v1 | 873M | no disponible | Apache 2.0 | Hugging Face | SFT sobre base propietaria; sin benchmarks publicos |
| Qwen2.5-0.5B / 1.5B | 0,5B / 1,5B | 32K (segun version) | Apache 2.0 | Hugging Face | Familia base probable; benchmarks publicos disponibles |
| Llama 3.2-1B | 1,2B | 128K | Llama 3.2 Community License | Hugging Face | Multilingue, benchmarks publicos |
| SmolLM2-1.7B | 1,7B | 8K | Apache 2.0 | Hugging Face | Alternativa pequena con documentacion completa |

La comparativa es aproximada: al no disponer de contexto ni benchmarks del modelo evaluado, solo se pueden contrastar parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentacion sobre el dataset de entrenamiento: imposible evaluar calidad, sesgos o robustez antes de desplegar.
- Model card generica y auto-generada: gran parte del contenido remite a "recibos" externos no incluidos, lo que dificulta la reproducibilidad.
- Solo declarado para ingles; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Longitud de contexto no especificada: riesgo de truncamiento inesperado en aplicaciones con entradas largas.
- Riesgo de alucinacion no cuantificado; al ser un modelo pequeno y ajustado en un dominio estrecho, la generacion fuera de dominio puede degradarse.
- Licencia Apache 2.0 permite uso comercial, pero la nota de licencia indica que el tag fue asignado por operaciones del estate sin evidencia por fichero del upstream; conviene verificar la procedencia antes de un uso comercial critico.
- Sin likes ni comunidad: 0 likes y 290 descargas sugieren escasa validacion externa.
- El nombre "estate" sugiere un dominio inmobiliario; usarlo en otros dominios sin validacion previa es arriesgado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/brain-navigator-r2-estate-sft-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/brain-navigator-r2
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio de generacion de cards (referenciado): https://github.com/szl-holdings/estate-cards
