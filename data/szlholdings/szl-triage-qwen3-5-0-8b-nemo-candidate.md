# SZLHOLDINGS/szl-triage-qwen3.5-0.8b-nemo-candidate

## Resumen

`szl-triage-qwen3.5-0.8b-nemo-candidate` es un modelo publicado por SZLHOLDINGS dentro de su denominada "governed-AI estate", un conjunto de artefactos (modelos, datasets y Spaces) que la organizacion presenta como trazables y verificables mediante ficheros de recibos (*receipts*). Por el nombre del repositorio, el modelo se presenta como un derivado de la familia Qwen 3.5 con aproximadamente 0,8 mil millones de parametros, orientado a tareas de triaje, y etiquetado como "candidate", lo que sugiere que se trata de un artefacto en fase de evaluacion y no de una version estable.

La informacion publicada es extremadamente escasa: el repositorio ocupa 0,0 GB, no declara pipeline, licencia ni idiomas, y la propia model card reconoce explicitamente que no se afirma ninguna cifra de benchmark ni capacidad sin un recibo de evaluacion medido. El escaneo de recibos de noviembre de 2026 clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, contiene ficheros con nombre de recibo pero no supera el umbral estricto de evidencia (un `DONE.json` con estado medido).

Por tanto, esta ficha debe leerse como una descripcion de un artefacto experimental con trazabilidad incompleta. Es relevante para quien siga el ecosistema de SZLHOLDINGS o quiera evaluar modelos pequenos de triaje, pero no debe considerarse una base solida para produccion sin verificacion independiente de los pesos y de los recibos citados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere un transformer derivado de Qwen 3.5, sin confirmar) |
| Parametros totales | aproximadamente 0,8 mil millones (inferido del nombre del repositorio, no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (unico formato declarado en los tags) |

## Arquitectura y entrenamiento

No se ha publicado informacion verificable sobre la arquitectura interna. El nombre del repositorio apunta a una base Qwen 3.5 de 0,8 mil millones de parametros, lo que en la practica implicaria un transformer decoder-only de pequeno tamano, pero la model card no confirma esta correspondencia ni detalla capas, atencion, tokenizador o vocabulario. Tampoco se especifica si el artefacto es un ajuste fino (fine-tuning), una destilacion o un modelo entrenado desde cero sobre esa base.

Respecto al entrenamiento, el repositorio contiene un fichero `train_receipt.json` citado como recibo, pero el escaneo estricto no lo valida como evidencia medida. No se declaran numero de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO, SFT) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card insiste en que cualquier afirmacion no respaldada por un recibo medido se marca como UNKNOWN.

## Capacidades

- Generacion de texto: capacidad esperable por tratarse de un modelo de lenguaje, aunque no verificada con evaluaciones publicadas.
- Triaje y clasificacion: el nombre del repositorio sugiere un uso previsto de clasificacion o enrutamiento de casos, sin especificar taxonomia ni metricas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Razonamiento matematico y generacion de codigo: no disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo podria clasificar entradas de usuarios en categorias predefinidas antes de enrutarlas a un agente humano o a un sistema mayor; su tamano reducido facilitaria el despliegue en entornos con recursos limitados, aunque la ausencia de metricas impide garantizar su precision.
- Prefiltrado en pipelines de moderacion: uso como primera etapa de clasificacion de contenido para descartar casos triviales y reservar modelos mayores para los ambiguos, aprovechando el bajo coste de inferencia de un modelo de 0,8B.
- Enrutamiento en sistemas multiagente: asignacion de consultas a herramientas o subagentes segun la intencion detectada, siempre que se valide previamente la calidad de clasificacion con un conjunto de prueba propio.
- Extraccion de campos estructurados en formularios: aplicacion a tareas de etiquetado simple en documentos cortos, con validacion posterior por reglas.
- Prototipado rapido en entornos de desarrollo: su tamano permite ejecutarlo en CPU o en GPUs de consumo para pruebas de concepto antes de escalar a un modelo mayor.
- Evaluacion comparativa interna: uso como linea base en experimentos de investigacion sobre modelos pequenos de triaje, dado que el repositorio declara un marco de recibos que facilita la auditoria si se completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirma ninguna cifra de benchmark sin un recibo de evaluacion medido, y el escaneo estricto de recibos clasifica la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; para un modelo de aproximadamente 0,8B, las estimaciones habituales serian del orden de 1,6 GB en FP16 y menos de 1 GB en cuantizacion de 8 bits, pero no hay datos confirmados del autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano reducido, pero no confirmado.
- Opciones de despliegue: no disponible; al declarar solo safetensors, seria necesario convertir los pesos para usarlos con llama.cpp, Ollama o vLLM, sin garantia de que existan configuraciones publicadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| szl-triage-qwen3.5-0.8b-nemo-candidate | ~0,8B (inferido) | no disponible | no disponible | Hugging Face, repo de 0,0 GB |
| Qwen 3.5 0.8B (base hipotetica) | ~0,8B | no disponible | no disponible | no confirmado en esta busqueda |
| Alternativas de triaje de ~1B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con modelos de la misma categoria. La falta de licencia, idiomas y benchmarks impide contrastar rendimiento o condiciones de uso.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se ha publicado ninguna evaluacion de sesgo.
- Riesgo de alucinacion: no evaluado; en modelos pequenos de triaje el riesgo de clasificaciones erroneas es relevante y requiere validacion con datos propios.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y los idiomas soportados, lo que impide planificar su uso en produccion multilingue.
- Restricciones de licencia: la licencia no esta declarada, por lo que no puede asumirse permiso para uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue.
- Evidencia incompleta: el repositorio no supera el umbral estricto de recibos (`RECEIPT_FILES_NO_DONE`) y la evaluacion figura como UNKNOWN; las afirmaciones de trazabilidad del autor no equivalen a validacion independiente.
- Estado "candidate": el propio nombre indica que es un artefacto candidato, no una version estable ni auditada.
- Repositorio de 0,0 GB: el tamano declarado sugiere que los pesos pueden no estar completos o que el contenido es minimo; conviene verificar los ficheros antes de descargar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-triage-qwen3.5-0.8b-nemo-candidate
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (citada en la model card): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de fichas (citado en la model card): https://github.com/szl-holdings/estate-cards
