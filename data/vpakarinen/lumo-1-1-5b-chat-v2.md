# vpakarinen/Lumo-1-1.5B-Chat-V2

## Resumen

Lumo-1-1.5B-Chat-V2 es un ajuste fino completo (full fine-tune) del modelo suizo Apertus v1.1 1.5B Instruct, publicado por el usuario vpakarinen en HuggingFace. Se trata de un modelo conversacional pequeno, con 1.510.019.104 parametros y pesos en formato safetensors, distribuido bajo licencia Apache 2.0 y entrenado exclusivamente para ingles. Su interes practico radica en que ocupa muy poco espacio (3,0 GB de repositorio) y puede ejecutarse en hardware de consumo, lo que lo hace candidato para prototipos de asistentes conversacionales locales.

La version V2 se publica por separado de V1 para no sobrescribir el modelo original, y anade ejemplos de entrenamiento orientados a ampliar la cobertura en tareas de resumen, extraccion de informacion, explicacion, reescritura y seguimiento de instrucciones. No es, por tanto, un modelo nuevo desde cero, sino una iteracion del ajuste sobre la misma base Apertus.

Es relevante ahora como ejemplo de la familia de derivados de Apertus que estan surgiendo en el ecosistema abierto: modelos de menos de 2.000 millones de parametros, ajustados sobre bases abiertas y con licencias permisivas, pensados para despliegue en el borde o en entornos con recursos limitados. La contrapartida es que la model card es extremadamente escueta: no publica arquitectura detallada, contexto, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la model card; se hereda del modelo base swiss-ai/Apertus-v1.1-1.5B-Instruct) |
| Parametros totales | 1.510.019.104 (aprox. 1,51 mil millones) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; el repositorio contiene safetensors, 3,0 GB, consistente con pesos en bf16/fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | swiss-ai/Apertus-v1.1-1.5B-Instruct |
| Tipo de ajuste | full fine-tune (ajuste completo, no adaptador LoRA) |
| Tamano del repositorio | 3,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo unico confirmado es que se trata de un ajuste fino completo del modelo Apertus v1.1 1.5B Instruct, es decir, que se actualizaron todos los pesos de la red y no solo un modulo adaptador. Cualquier detalle sobre tipo de atencion, uso de atencion lineal, normalizacion, tokenizador o diseno de la cabeza de salida corresponde al modelo base y no se reproduce en la model card de este derivado.

Respecto al entrenamiento, la model card indica que V2 parte del entrenamiento original de Lumo y anade ejemplos que amplian la cobertura en resumen, extraccion de informacion, explicacion, reescritura y seguimiento de instrucciones. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF, DPO u otra optimizacion por preferencias, ni los hiperparametros empleados. Tampoco se documentan innovaciones tecnicas propias mas alla del propio ajuste.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Resumen de documentos y condensacion de informacion, segun los ejemplos anadidos en V2.
- Extraccion de informacion estructurada a partir de texto no estructurado.
- Explicacion de conceptos y reformulacion de contenido.
- Reescritura de textos con cambios de estilo o registro.
- Seguimiento de instrucciones directas, con cobertura ampliada respecto a V1.
- Soporte de tool calling o function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues: limitadas al ingles; no se declara soporte de otros idiomas.

## Casos de uso

- Asistente conversacional local para escritorio: con 1,51 mil millones de parametros y pesos de 3,0 GB, el modelo puede ejecutarse en un portatil con GPU de gama media o incluso en CPU, ofreciendo chat privado sin enviar datos a un servicio externo.
- Resumen de correos y documentos internos: V2 incorpora ejemplos especificos de summarization, por lo que es adecuado para generar resumenes cortos de hilos de correo, actas o notas de reunion en ingles.
- Extraccion de campos en pipelines de procesado documental: el modelo puede transformar texto libre en campos estructurados (fechas, nombres, importes) como paso previo a un sistema de gestion, siempre con validacion posterior dado su tamano reducido.
- Reescritura y correccion de estilo en herramientas de edicion: util para reformular parrafos, ajustar tono o simplificar textos en ingles antes de su publicacion.
- Generacion de datos sinteticos y aumento de datasets: su licencia Apache 2.0 permite usarlo para producir textos de entrenamiento o ejemplos etiquetados sin restricciones de uso comercial.
- Prototipado rapido de productos conversacionales: sirve como modelo de referencia durante el desarrollo de una interfaz de chat antes de migrar a un modelo mayor, gracias a su bajo coste de inferencia y despliegue.
- Clasificacion y etiquetado de texto ligero: con prompts adecuados puede asignar categorias a tickets o resenas, aunque requiere umbrales de confianza y revision humana por el riesgo de alucinacion.
- Filtrado previo en sistemas RAG: puede reformular la consulta del usuario y descartar fragmentos irrelevantes recuperados de una base documental antes de pasarlos a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web no aporta resultados asociados a este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones propias a partir de los 1,51 mil millones de parametros; no confirmadas por el autor):
  - FP32: en torno a 6,0 GB solo para pesos, mas cache KV y activaciones.
  - BF16/FP16: en torno a 3,0 GB de pesos, mas overhead; unos 4 GB en total para contextos cortos.
  - INT8: en torno a 1,5 GB de pesos.
  - INT4: en torno a 0,8-1,0 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM es suficiente en BF16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 lo ejecutan con margen amplio. En el entorno profesional, una A100 o H100 estan sobredimensionadas para un modelo de este tamano y solo se justifican por agregacion de muchas instancias.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada de los ultimos anos, y tambien en equipos con grafica integrada si se usa cuantizacion agresiva.
- Opciones de despliegue: HuggingFace Transformers para inferencia directa; vLLM o TGI para servir con batching; llama.cpp u Ollama para ejecucion en CPU o GPU con cuantizacion, teniendo en cuenta que el autor no publica pesos GGUF y habria que convertirlos.
- Latencia y throughput estimados: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

No se dispone de datos verificados de rendimiento para establecer una comparativa cuantitativa. La unica comparacion documentada en la informacion proporcionada es con el modelo base del que deriva.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| vpakarinen/Lumo-1-1.5B-Chat-V2 | 1.510.019.104 | no disponible | apache-2.0 | HuggingFace, 0 descargas | Full fine-tune en ingles, sin benchmarks publicados |
| swiss-ai/Apertus-v1.1-1.5B-Instruct | no disponible | no disponible | no disponible | HuggingFace (modelo base) | Base sobre la que se construye Lumo V2; la model card de Lumo no reproduce sus especificaciones |
| Otras alternativas de ~1,5 B en ingles | no disponible | no disponible | no disponible | no disponible | No se aportan datos verificados en la informacion disponible para comparar parametros, contexto o rendimiento |

## Limitaciones y advertencias

- La propia model card advierte de que las respuestas pueden ser inexactas, repetitivas o inseguras, y recomienda verificar de forma independiente cualquier informacion importante.
- No se publican resultados de benchmarks, por lo que no hay evidencia objetiva del rendimiento en tareas de razonamiento, codigo o matematicas.
- No se documenta el dataset de entrenamiento ni si hubo etapas de alineacion (RLHF, DPO), lo que impide evaluar sesgos conocidos o comportamientos indeseados.
- Modelo entrenado unicamente en ingles: el uso en castellano u otros idiomas producira resultados degradados.
- Longitud de contexto no especificada: no se puede planificar el uso con documentos largos sin verificacion previa.
- Tamano reducido (1,51 mil millones de parametros), lo que incrementa el riesgo de alucinacion y de errores factuales en tareas que requieren conocimiento especifico.
- Ausencia total de traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa ni issues reportados.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar los terminos del modelo base swiss-ai/Apertus-v1.1-1.5B-Instruct, ya que la model card no detalla las condiciones de la base ni si existen obligaciones adicionales heredadas.
- No se ofrecen pesos cuantizados en el repositorio: cualquier despliegue en INT8 o INT4 exige una conversion propia.
- Riesgo de colision de nombres: existen otros proyectos llamados Lumo (el asistente de Proton y un modelo vision-lenguaje-accion para robotica), sin relacion alguna con este modelo. Conviene no mezclar documentacion ni resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vpakarinen/Lumo-1-1.5B-Chat-V2
- Modelo base en HuggingFace: https://huggingface.co/swiss-ai/Apertus-v1.1-1.5B-Instruct
- Resultados de la busqueda web (entidades distintas, sin relacion confirmada con este modelo):
  - Lumo, asistente de Proton: https://lumo.proton.me/
  - Lumo (asistente de IA) en Wikipedia: https://en.wikipedia.org/wiki/Lumo_(AI_assistant)
  - Modelos y modos de razonamiento de Lumo (Proton): https://proton.me/support/lumo-models
  - Mind to Hand: Purposeful Robotic Control via Embodied Reasoning (paper sobre un modelo VLA tambien llamado Lumo-1): https://arxiv.org/abs/2512.08580
  - LLM Leaderboard & AI Model Benchmarks: https://benchlm.ai/
