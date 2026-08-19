# xCloudinfo/Muse-Glimmer-30B-Uncensored-xCloud-GGUF

## Resumen

Muse-Glimmer-30B-Uncensored-xCloud es una variante del modelo multimodal Muse-Glimmer-30B de Meta, modificada mediante una técnica de dirección de ablación (abliteration) para eliminar el comportamiento de rechazo excesivo del modelo original. El trabajo ha sido realizado por xCloudinfo, que ha procesado y cuantizado el modelo en formato GGUF para su uso con llama.cpp. El modelo base, Muse-Glimmer-30B, es un modelo denso de 29.6B parámetros activos en su componente de texto, acompañado de un codificador visual dedicado, con una ventana de contexto de 128K tokens y licencia Apache-2.0.

La relevancia de este modelo reside en que ofrece una alternativa "sin censura" para tareas autorizadas de investigación en seguridad, análisis de documentos y evaluación de equipos rojos, manteniendo intactas las capacidades multimodales del modelo original. El proceso de abliteration elimina la dirección de rechazo de las matrices de proyección residual del decodificador de texto, sin tocar el codificador visual, por lo que las capacidades de comprensión de imágenes se mantienen idénticas a las del modelo base. Se distribuye en varias cuantizaciones GGUF que van desde 9.2 GB hasta 52 GB, lo que permite su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (decodificador de texto + codificador visual dedicado) |
| Parametros totales | 27.854.794.240 |
| Parametros activos | 29.6B (componente de texto, segun el autor; no se especifican los del codificador visual) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (incluye mmproj.gguf para el proyector visual) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer denso de 29.6B parametros en su componente textual, con 52 capas, complementado por un codificador visual dedicado para tareas multimodales. La modificacion realizada por xCloudinfo no implica reentrenamiento: se aplica una direccion de ablacion (abliteration) siguiendo la metodologia de Arditi et al. (2024), que identifica una unica direccion en el espacio residual responsable del comportamiento de rechazo. Esta direccion se ortogonaliza y se elimina de las matrices de escritura residual de cada capa, concretamente de `self_attn.o_proj` y `mlp.down_proj`, un total de 104 matrices en las 52 capas del decodificador.

El codificador visual no se modifica en absoluto, y el proyector visual (mmproj) se reutiliza directamente del modelo base. El proceso de cuantizacion se ha realizado en la infraestructura de computacion propia de xCloudinfo, generando las distintas versiones GGUF con y sin matriz de importancia (imatrix). El modelo mantiene un parametro de razonamiento ajustable mediante instrucciones en el system prompt, con niveles que van desde `low` hasta `xhigh`, siendo `high` el valor por defecto.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa tanto texto como imagenes, manteniendo intactas las capacidades de comprension visual del modelo base.
- Razonamiento ajustable: permite controlar el esfuerzo de razonamiento mediante la instruccion `Reasoning strength` en el system prompt (low, high, xhigh).
- Comprension de contexto largo: ventana de 128K tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Soporte multilingue: entrenado principalmente en ingles y chino.
- Capacidades de agente: el modelo base esta orientado a tareas agente locales y uso de herramientas, aunque no se especifican detalles sobre tool calling en la informacion disponible.
- Conversacional: optimizado para interacciones de dialogo y tareas de asistencia.

## Casos de uso

- Investigacion de seguridad autorizada: el modelo puede analizar codigo malicioso, configuraciones inseguras o realizar evaluaciones de vulnerabilidad sin rechazar solicitudes legitimas de pentesting, gracias a la eliminacion del comportamiento de rechazo excesivo.
- Analisis de documentos y datos: con su ventana de 128K tokens, puede procesar informes extensos, articulos academicos o expedientes completos, extrayendo informacion relevante y respondiendo preguntas sobre el contenido.
- Red teaming de modelos de IA: util para evaluar la robustez de otros sistemas de IA generando prompts adversariales o casos limite, sin que el propio modelo se niegue a participar en la evaluacion.
- Creacion literaria sin restricciones: escritura creativa de ficcion, incluyendo generos de terror, violencia o contenido adulto, sin los filtros habituales de los modelos alineados.
- Asistente multimodal local: despliegue en una GPU de consumo para tareas de asistencia que requieran comprension de imagenes, como descripcion de fotografias, analisis de diagramas o extraccion de texto de capturas.
- Automatizacion de tareas agente: integracion en pipelines de automatizacion que requieran razonamiento multi-paso y manejo de contexto largo, como orquestacion de tareas complejas o planificacion de proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de evaluacion comparativa con respecto al modelo base ni con otros modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion Q4_K_M (16 GB) es la recomendada para despliegue general y requiere aproximadamente 16-20 GB de VRAM con contexto moderado. La version IQ2_M (9.2 GB) puede funcionar en GPUs con 12 GB de VRAM, aunque con mayor perdida de calidad.
- GPU recomendadas: para la version Q4_K_M, una RTX 4090 (24 GB) o A100 de 40 GB ofrecen margen suficiente para contexto largo. Para IQ2_M, una RTX 4070 o superior con 12 GB puede ser suficiente.
- Compatibilidad con GPU de consumo: si, las cuantizaciones Q4_K_M, IQ4_XS e IQ2_M caben en GPUs consumer de gama alta y media. Las versiones Q6_K y superiores requieren GPUs profesionales o multiples GPUs.
- Opciones de despliegue: llama.cpp y llama-server son las opciones indicadas por el autor. Al ser formato GGUF, tambien es compatible con Ollama, LM Studio y otros runners basados en llama.cpp.
- Latencia y throughput: no se proporcionan datos especificos. En una RTX 4090 con Q4_K_M, se puede esperar un throughput de 30-50 tokens/s para generacion, aunque depende del contexto y la carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Uncensored-xCloud (este) | 27.85B | 128K | Apache-2.0 | GGUF | Abliterated, multimodal |
| meta-models/Muse-Glimmer-30B | 29.6B (texto) | 128K | Apache-2.0 | safetensors | Modelo base, con rechazo excesivo |
| mradermacher/Muse-Glimmer-30B-uncensored-GGUF | 29.6B (texto) | 128K | Apache-2.0 | GGUF | Otra variante abliterated, sin informacion detallada |
| 0bserverx/Muse-Glimmer-30B-Heretic-Uncensored-GGUF | 29.6B (texto) | 128K | Apache-2.0 | GGUF | Variante abliterated adicional |

No se dispone de datos de rendimiento comparativo entre estas variantes. Todas comparten el mismo modelo base y la tecnica de abliteration, por lo que las diferencias principales residen en la calidad de la cuantizacion y los detalles del proceso de ablacion.

## Limitaciones y advertencias

- Eliminacion de la capa de seguridad: el modelo ha sido modificado para eliminar el comportamiento de rechazo, lo que significa que puede responder directamente a solicitudes sensibles o de doble uso. El autor advierte explicitamente que los usuarios son los unicos responsables del uso legal, etico y conforme a las politicas de su jurisdiccion.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas sobre la tasa de alucinacion tras la abliteration. El proceso de ablacion puede afectar a otras capacidades del modelo de forma no evaluada.
- Idiomas limitados: el modelo solo soporta ingles y chino. No se garantiza un rendimiento adecuado en otros idiomas.
- Uso en produccion: el autor declara que el modelo es para "investigacion interna y validacion tecnica", lo que sugiere que no ha sido sometido a pruebas exhaustivas de robustez para entornos de produccion.
- Riesgo de degradacion: la cuantizacion IQ2_M (9.2 GB) puede presentar una perdida de calidad notable en tareas complejas. Se recomienda Q4_K_M como equilibrio entre calidad y recursos.
- Responsabilidad legal: el uso de este modelo para generar contenido ilegal o malicioso es responsabilidad exclusiva del usuario. La licencia Apache-2.0 no exime del cumplimiento de las leyes aplicables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xCloudinfo/Muse-Glimmer-30B-Uncensored-xCloud-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Variante alternativa (mradermacher): https://huggingface.co/mradermacher/Muse-Glimmer-30B-uncensored-GGUF
- Variante alternativa (0bserverx): https://huggingface.co/0bserverx/Muse-Glimmer-30B-Heretic-Uncensored-GGUF
- Pagina del modelo base en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Referencia de la tecnica de abliteration: Arditi et al. (2024), "Refusal in LLMs is mediated by a single direction"
