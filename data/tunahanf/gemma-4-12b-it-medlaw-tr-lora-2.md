# tunahanf/gemma-4-12b-it-medlaw-tr-LORA-2

## Resumen

`tunahanf/gemma-4-12b-it-medlaw-tr-LORA-2` es un adaptador LoRA (librería PEFT, formato safetensors) entrenado por el usuario tunahanf sobre el modelo base declarado como `google/gemma-4-12B-it`. Su propósito es generar análisis previos estructurados en turco sobre derecho médico y sanitario: resumen de sentencias, análisis de supuestos de responsabilidad, auditoría de formularios de consentimiento informado y preguntas sobre legislación. El repositorio ocupa 0,6 GB, no acumula descargas ni "me gusta" y se publicó con licencia Apache 2.0.

Técnicamente se trata de un QLoRA de 4 bits con r=32, alpha=64 y dropout=0,05, entrenado 2 épocas (542 pasos) sobre 13.668.592 tokens del dataset `tunahanf/turkish-medicine-law` v2.0, con una eval_loss mínima de 0,3481. La model card insiste en que no es un generador de opinión jurídica: el usuario objetivo es el abogado, el perito o el departamento jurídico de una entidad sanitaria, y la salida es un preanálisis con lista de comprobación que exige revisión humana.

Su relevancia práctica es limitada pero concreta: es un adaptador de nicho, monolingüe en turco, que solo demuestra ventaja medible sobre el modelo base en cuatro de los doce campos evaluados y que en dos campos no supera siquiera una línea base ingenua. Además, la propia model card advierte de que la versión publicada es la V1, no la V2, y que la comparación entre ambas no mostró diferencias en 10 de 12 áreas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base `google/gemma-4-12B-it`; arquitectura interna del modelo base no disponible en la información proporcionada |
| Parámetros totales | No disponible para el adaptador; identificador del modelo base sugiere 12000 M (12B), dato no verificable con la información disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Entrenamiento en QLoRA de 4 bits; no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Turco (`tr`) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | `google/gemma-4-12B-it` |
| Dataset de entrenamiento | `tunahanf/turkish-medicine-law`, versión v2.0 |
| Hiperparámetros LoRA | r=32, alpha=64, dropout=0,05 |
| Épocas y pasos | 2 épocas, 542 pasos |
| Mejor eval_loss | 0,3481 (paso 542) |
| Tokens vistos en entrenamiento | 13.668.592 |
| Tamaño del repositorio | 0,6 GB |
| Descargas / "me gusta" | 0 / 0 |
| Fecha de creación (metadatos HF) | 2026-09-06 |
| Última actualización (metadatos HF) | 2026-09-19 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador QLoRA, no un modelo completo. El entrenamiento se realizó en 4 bits con `train_on_completions`, r=32, alpha=64, dropout=0,05, durante 2 épocas (542 pasos) sobre 13,668 millones de tokens del dataset de derecho médico turco v2.0, alcanzando una eval_loss de 0,3481 en el paso final. La model card no detalla la arquitectura del modelo base, el número de capas objetivo del adaptador ni la composición exacta del dataset más allá de su identificador.

La innovación metodológica destacable, y también su principal riesgo de uso, es que el prompt de entrenamiento no incluía esquema JSON, lista de campos ni ejemplos: el modelo aprende el formato de salida únicamente por imitación de los ejemplos. Las mediciones del autor muestran que, si se le proporciona un esquema JSON con valores de ejemplo en el prompt, el modelo reproduce esos valores de ejemplo en los campos de etiqueta cerrada con una tasa de hasta el 100 %. Por eso la recomendación explícita es enviar el prompt sin esquema.

## Capacidades

- Generación de texto conversacional en turco especializada en derecho médico y sanitario.
- Resumen estructurado de sentencias: tribunal y número de sala, número de expediente y de decisión, sentido del fallo y tipo de falta (con normalización ortográfica).
- Análisis de supuestos: determinación de si existe falta, tipología, fundamento legal invocado, órgano judicial competente y carga de la prueba.
- Auditoría de formularios de consentimiento informado: detección de elementos faltantes.
- Preguntas y respuestas sobre articulado legal (`madde_qa`), con 0,776 de acierto en la opción correcta frente a 0,798 del modelo base con esquema.
- Predicción del sentido de la resolución en un supuesto dado, con 0,709 de acierto, exactamente igual que la línea base de mayoría por tribunal.
- Citación normativa verificable: de 232 pares `(ley, artículo)` generados, 232 se resolvieron contra una tabla de 1178 artículos (tasa 1,000), frente a 1 de 106 del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, únicamente turco.
- Capacidades multimodales, de audio o modo "thinking": no disponibles.

## Casos de uso

- Preanálisis de expedientes en despachos de derecho sanitario: el adaptador genera un resumen estructurado con tribunal, número de expediente, sentido del fallo y tipo de falta, lo que permite clasificar y priorizar expedientes antes de que un abogado los revise. Es adecuado porque es precisamente la tarea con mayor ventaja medida frente al modelo base (tipo de falta: 0,855 frente a 0,577).
- Auditoría de formularios de consentimiento informado en hospitales: el modelo señala los elementos ausentes en un documento de onam antes de que lo firme el paciente. El rendimiento medido es de 0,776 frente a 0,805 del modelo base con esquema, por lo que solo tiene sentido como primer filtro con revisión posterior del servicio jurídico.
- Extracción de metadatos jurisprudenciales para bases de datos: la identificación de sala alcanzó 1,000 y la de números de expediente y decisión 1,000, lo que hace viable poblar un repositorio documental con revisión por muestreo.
- Verificación de citas normativas en borradores internos: al resolver 232 de 232 referencias contra un catálogo de 1178 artículos, puede usarse para comprobar que las citas de un escrito apuntan a artículos existentes, siempre contrastando después la pertinencia de la cita, no solo su existencia.
- Formación interna de residentes y personal sanitario: como generador de preguntas y respuestas sobre articulado (`madde_qa`, 0,776) con supervisión docente, dado que el modelo no ha visto textos legales completos en entrenamiento.
- Clasificación previa de consultas jurídicas en un servicio de asesoría: separar consultas de responsabilidad médica, consentimiento informado y protección de datos antes de derivarlas al especialista correspondiente, aprovechando el formato de salida estructurado.
- Elaboración de listas de comprobación para peritajes: la salida en forma de análisis previo más checklist encaja con la preparación de un informe pericial, que después firma un humano.

No deben usarse las salidas de predicción de resultado (`sonuc_tahmini`) ni de carga de la prueba (`ispat_yuku`) para tomar decisiones: en ambos campos el modelo no supera la línea base ingenua.

## Benchmarks y rendimiento

Los únicos datos disponibles son los que publica el autor en la model card. Se obtuvieron sobre 565 ejemplos del split de test, con decodificación greedy, en una comparación configurada a favor del modelo base: al modelo base se le proporciona en el prompt un esquema JSON explícito y conjuntos cerrados de etiquetas, mientras que al modelo ajustado no se le da nada de eso. La columna "base naif" es una línea base trivial (por ejemplo, elegir siempre la clase mayoritaria o la opción más larga).

| Tarea / métrica | Base + esquema | Fine-tune | Base naif | Veredicto del autor |
|---|---:|---:|---:|---|
| `madde_qa.dogru_sik` (opción correcta) | 0,798 | 0,776 | 0,557 (opción más larga) | Sin diferencia medible |
| `karar_ozeti.mahkeme` (número de sala) | 0,919 | 1,000 | — | LoRA superior |
| `karar_ozeti.esas_karar_no` (numérico) | 0,984 | 1,000 | 0,000 (constante de train) | Sin diferencia medible |
| `karar_ozeti.sonuc` | 0,944 | 0,944 | 0,371 (constante de train) | Sin diferencia medible |
| `karar_ozeti.kusur_tipi` (ortografía normalizada) | 0,577 | 0,855 | 0,440 (constante de train) | LoRA superior |
| `senaryo_analizi.kusur_var_mi` | 0,571 | 0,625 | 0,446 (constante de train) | Sin diferencia medible |
| `senaryo_analizi.kusur_tipi` (ortografía normalizada) | 0,515 | 0,542 | 0,443 (constante de train) | Sin diferencia medible |
| `senaryo_analizi.dayanak` | 0,009 | 0,420 | 0,360 (constante de train) | LoRA superior, pero no supera la línea base naif |
| `senaryo_analizi.yargi_kolu` | 1,000 | 0,964 | 0,607 (constante de train) | Sin diferencia medible |
| `senaryo_analizi.ispat_yuku` | 0,143 | 0,857 | 0,857 (constante de train) | No supera la línea base naif |
| `onam_denetimi.eksik_unsurlar` | 0,805 | 0,776 | 0,301 (constante de train) | Sin diferencia medible |
| `sonuc_tahmini.sonuc` (recuperado) | 0,291 | 0,709 | 0,709 (mayoría por tribunal) | No supera la línea base naif |

El veredicto se derivó de un intervalo de confianza del 95 % calculado con bootstrap emparejado a nivel de conjunto de `source_id`; "sin diferencia medible" significa que el intervalo contiene el cero. Los números se calcularon sobre salida bruta con correcciones posteriores: normalización de ortografía turca a ASCII, recuperación de campos desde JSON truncado, extracción únicamente de números de expediente y decisión, y uso del número de sala en lugar del formato de escritura.

Validez de las citas generadas, resueltas contra una tabla de 1178 artículos:

| Origen | Citas producidas | Citas resueltas | Tasa |
|---|---:|---:|---:|
| Gold (etiqueta del dataset) | 161 | 159 | 0,988 |
| Base + esquema | 106 | 1 | 0,009 |
| Fine-tune (este adaptador) | 232 | 232 | 1,000 |

El autor advierte de que resolubilidad no equivale a acierto: la F1 de `dayanak` del mismo modelo es mucho más baja. Este número solo mide ausencia de alucinación en el identificador de la norma.

## Requisitos de hardware

- Tamaño del adaptador: 0,6 GB. El modelo base debe descargarse por separado (identificador de 12B, aproximadamente 24 GB en bf16).
- VRAM estimada para inferencia con el modelo base de 12B (estimaciones de ingeniería, no publicadas por el autor): unos 24 GB solo de pesos en bf16/fp16, 28-32 GB contando caché KV y overhead; unos 12-13 GB en cuantización de 8 bits; unos 7-8 GB en 4 bits.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB o L40S 48 GB en bf16 sin cuantizar; 2x RTX 4090 24 GB en bf16 con contexto corto.
- GPU de consumo: sí es viable. RTX 4090/3090 24 GB en bf16 con margen ajustado, y en 4 bits cabe en tarjetas de 12-16 GB (RTX 4080, RTX 4070 Ti Super, RTX 3060 12 GB con contexto reducido).
- Opciones de despliegue: `transformers` + `peft` es la ruta documentada oficialmente; vLLM admite adaptadores LoRA sobre el modelo base; TGI admite adaptadores. llama.cpp y Ollama requieren convertir a GGUF o fusionar el adaptador, algo que este repositorio no proporciona.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado en la información disponible modelos comparables de terceros especializados en derecho médico turco. La comparación factible se limita al modelo base y a la versión anterior del propio adaptador.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `google/gemma-4-12B-it` (base, con esquema en el prompt) | 12B según identificador | No disponible | 0,798 en `madde_qa`; 0,919 en número de sala; 0,009 en tasa de citas resueltas | No disponible en la información proporcionada | HuggingFace (referenciado como base) |
| `tunahanf/gemma-4-12b-it-medlaw-tr-LORA` (V1) | Adaptador LoRA sobre el mismo base | No disponible | 10 de 12 campos sin diferencia medible frente a V2; `madde_qa` robusto a su favor | Apache 2.0 | HuggingFace |
| `tunahanf/gemma-4-12b-it-medlaw-tr-LORA-2` (este) | Adaptador LoRA sobre el mismo base | No disponible | Ver tabla de benchmarks | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- El conjunto de evaluación no ha pasado revisión de ningún jurista: es un conjunto comparativo etiquetado automáticamente, por lo que no puede sostener afirmaciones del tipo "el modelo sabe derecho médico turco en tal proporción".
- El dataset contiene artefactos de medición: en `madde_qa` la opción correcta es la más larga en la mayoría de los casos, y en `sonuc_tahmini` la etiqueta correlaciona con el código de tribunal. La propia card recomienda leer la ficha del dataset antes de usarlo.
- El modelo no vio documentos normativos completos durante el entrenamiento. Añadir artículos en el contexto solo mejora `madde_qa`; en tareas de etiqueta cerrada, un artículo mal seleccionado puede reducir la puntuación.
- El cuarto punto de la sección de limitaciones de la model card aparece truncado en la información disponible: comienza por "kvkk", presumiblemente en referencia a la Ley turca de Protección de Datos Personales. Su contenido completo no está disponible.
- El adaptador no es un generador de opinión jurídica y no debe usarse sin supervisión humana. No ofrece consejo directo ni a pacientes ni a profesionales médicos.
- No debe usarse en las tareas de predicción de resultado (`sonuc_tahmini`) ni de carga de la prueba (`ispat_yuku`): en ambas el modelo iguala o no supera una línea base trivial.
- Si se introduce un esquema JSON con valores de ejemplo en el prompt, el modelo reproduce esos valores en campos de etiqueta cerrada con tasas de hasta el 100 %. El prompt debe enviarse sin esquema.
- Toda cita `(ley, artículo)` generada debe validarse contra una tabla normativa antes de usarse en producción.
- Discrepancia de versiones: el repositorio se llama "-LORA-2" pero la model card afirma que la versión publicada es la V1, no la V2, y que en la comparación directa 10 de 12 campos no mostraron diferencia medible, con `madde_qa` más robusto en V1. Conviene verificar qué pesos contiene realmente el repositorio antes de desplegarlo.
- Adopción nula: cero descargas y cero "me gusta" en el momento de la consulta, sin validación independiente conocida.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial depende también de la licencia y de las condiciones de uso del modelo base, que no se detallan en la información proporcionada.
- Idioma único: turco. No hay soporte declarado de castellano ni de ninguna otra lengua.
- Riesgo de alucinación: no cuantificado de forma general; solo se midió la resolubilidad de citas, que no equivale a corrección jurídica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tunahanf/gemma-4-12b-it-medlaw-tr-LORA-2
- Versión anterior del adaptador (V1): https://huggingface.co/tunahanf/gemma-4-12b-it-medlaw-tr-LORA
- Dataset de entrenamiento: https://huggingface.co/datasets/tunahanf/turkish-medicine-law
- Modelo base declarado: https://huggingface.co/google/gemma-4-12B-it

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden exclusivamente de la información de HuggingFace. No se dispone de paper, blog técnico, repositorio de código ni demo asociados.
