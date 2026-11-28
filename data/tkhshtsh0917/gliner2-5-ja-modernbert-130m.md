# tkhshtsh0917/gliner2.5-ja-modernbert-130m

## Resumen

gliner2.5-ja-modernbert-130m es un modelo especializado en extraccion de informacion sobre texto en japones, construido sobre la arquitectura GLiNER2.5 (boundary architecture) y publicado por el usuario tkhshtsh0917 en Hugging Face. Se trata de un modelo comunitario no oficial, sin afiliacion con fastino-ai, que adapta el paradigma GLiNER2 al idioma japones sustituyendo el encoder original por ModernBERT-Ja-130m de SB Intuitions. Con 136.287.187 parametros totales, el modelo realiza en una sola pasada de encoder cuatro tareas distintas: reconocimiento de entidades nombradas (NER), clasificacion de texto, extraccion de relaciones y extraccion estructurada en JSON.

La relevancia de este modelo radica en que aborda una carencia habitual en el ecosistema GLiNER: la mayoria de los modelos publicados estan optimizados para ingles o multilingue general, con un rendimiento limitado en japones debido a la ausencia de segmentacion morfologica adecuada. Este modelo incorpora un word splitter basado en Sudachi (SplitMode.C, diccionario core) que permite alinear los spans de entidades con tokens morfologicos japoneses, algo critico en un idioma sin separadores de palabras. Ademas, el modelo se entrena desde cero en todas sus cabezas de tarea, sin reutilizar pesos de fastino-ai, lo que garantiza coherencia con el encoder japones.

El modelo se distribuye bajo licencia Apache 2.0, con un tamano de repositorio de 1.6 GB y formato safetensors. Existe una variante mayor de 310M parametros (gliner2.5-ja-modernbert-310m) orientada a mayor precision, mientras que esta version de 130M esta pensada para inferencia en CPU y dispositivos edge. El modelo fue creado en octubre de 2026 y actualizado en noviembre de 2026, con 185 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2.5 (boundary architecture) sobre encoder ModernBERT-Ja-130m |
| Parametros totales | 136.287.187 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GLiNER2.5, denominada boundary architecture, que combina un encoder transformer con cabezas de tarea especializadas para NER, clasificacion, relaciones y extraccion estructurada. El encoder es ModernBERT-Ja-130m de SB Intuitions, un modelo transformer preentrenado especificamente para japones. Sobre el se montan las cabezas GLiNER2, que se inicializan de forma aleatoria y se entrenan desde cero, sin reutilizar ningun peso de los modelos publicados por fastino-ai. El entrenamiento se realizo con el trainer del repositorio publico GLiNER2 (version 2.1.0 de la libreria gliner2) sin modificar la libreria, anadiendo un wrapper que incorpora ajustes especificos para japones: el word splitter Sudachi, configuracion de schema-augmentation y un fallback para alinear los spans gold con los tokens Sudachi.

El funcionamiento interno del modelo es notablemente compacto: en una sola pasada de encoder se procesan conjuntamente el esquema de extraccion (escrito como prompt con marcadores [E], [L], [R] y [C]) y el texto de entrada, separados por tokens especiales ([SEP_STRUCT] y [SEP_TEXT]). Cada marcador de etiqueta genera un vector que actua como query para esa etiqueta, y cada palabra se representa por el vector de su primer subword. Una cabeza de fronteras puntua cada hueco entre palabras como posible inicio o fin de span, y los mejores pares inicio-fin (hasta 128 por etiqueta) se re-puntuan considerando compatibilidad de extremos, palabras internas y longitud del span. Se conservan los spans cuya probabilidad sigmoide alcanza el umbral (0.5 por defecto) y se elige el mejor conjunto no solapado por etiqueta. La clasificacion usa un MLP sobre el vector del marcador [L], con softmax para tareas single-label y sigmoide para multi-label. Las relaciones y estructuras reutilizan la misma maquinaria de spans, con cabezas especificas para puntuar pares de candidatos.

Los datos de entrenamiento son un dataset sintetico japones de caracteristicas propietarias que no se ha publicado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El word splitter personalizado se basa en Sudachi (SplitMode.C, diccionario core), lo que permite segmentar correctamente texto japones sin separadores explicitos y mapear las posiciones de palabra de vuelta a offsets de caracteres para preservar la forma original del texto en las respuestas.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en japones con etiquetas definidas por el usuario en tiempo de inferencia.
- Clasificacion de texto single-label y multi-label, con umbral configurable (cls_threshold, 0.5 por defecto).
- Extraccion de relaciones entre entidades, mediante cabezas de span para cabeza y cola de cada tipo de relacion.
- Extraccion estructurada en JSON con campos definidos por esquema, incluyendo modo natural con campo ancla.
- Procesamiento en una sola pasada de encoder, con esquema y texto atendiendo mutuamente en la misma secuencia.
- Capacidad de devolver "sin respuesta" para etiquetas ausentes en el texto mediante un score especifico de no-answer.
- Segmentacion morfologica japonesa integrada mediante Sudachi con SplitMode.C.
- Preservacion de la forma original del texto en las respuestas (por ejemplo, Pythonエンジニア en lugar de pythonエンジニア).
- Soporte de hasta 128 spans candidatos por etiqueta antes de la seleccion final no solapada.
- No se menciona soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Extraccion de entidades en curriculums japoneses: el modelo puede procesar ofertas de empleo o CV en japones y extraer campos como puesto (職種), ubicacion (勤務地) o tipo de contrato, tal como se muestra en el ejemplo de la model card con la consulta "渋谷でリモート可のPythonエンジニア正社員". La segmentacion Sudachi permite alinear entidades con tokens morfologicos correctamente.

- Clasificacion de intencion en busqueda o atencion al cliente: el modelo soporta clasificacion single-label y multi-label con umbral configurable, lo que permite etiquetar consultas de usuarios japoneses con intenciones como "busqueda por criterios" (条件指定検索) directamente en la misma pasada que la extraccion de entidades.

- Extraccion de relaciones en documentos japoneses: mediante las cabezas de relacion, se pueden identificar pares entidad-relacion-entidad en textos como informes, articulos o contratos, reutilizando la maquinaria de spans para cabeza y cola de cada tipo de relacion.

- Extraccion estructurada a JSON para pipelines de datos: el modelo puede convertir texto no estructurado en japones a registros JSON con campos definidos por esquema, usando mode="natural" con campo ancla para agrupar multiples registros en un mismo documento.

- Procesamiento en CPU y dispositivos edge: al ser la variante de 130M parametros (frente a la de 310M), esta disenada explicitamente para inferencia en CPU y entornos con recursos limitados, lo que la hace adecuada para desplegar extraccion de informacion en local sin GPU.

- Anonimizacion y enmascarado de datos personales: la capacidad de NER con etiquetas definidas por el usuario permite detectar nombres, direcciones o identificadores en texto japones para posteriormente enmascararlos en pipelines de cumplimiento normativo.

- Enriquecimiento de bases de datos documentales: extraccion de entidades y relaciones de documentos japoneses para poblar grafos de conocimiento o bases de datos relacionales, manteniendo la forma original del texto gracias al mapeo de offsets de caracter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 136,3M parametros en precision completa (fp32) el modelo ocupa aproximadamente 545 MB, y en fp16 aproximadamente 273 MB; a ello hay que sumar el overhead del encoder y de las cabezas de tarea. El tamano del repositorio es de 1,6 GB.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, el modelo es apto para cualquier GPU consumer moderna, aunque la model card lo orienta explicitamente a CPU y edge.
- Cabe en GPU consumer: si, por el reducido numero de parametros (130M), es adecuado para GPUs consumer e incluso para inferencia en CPU.
- Opciones de despliegue: la libreria gliner2 (version 2.1.x, con extra [local]) es el mecanismo de despliegue documentado. Requiere transformers>=5, sudachipy==0.7.0 y sudachidict-core==20261015. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. La model card indica que el modelo fue entrenado y evaluado con gliner2 2.1.0 y que con 2.2.0 los resultados de extraccion estructurada cambian ligeramente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| gliner2.5-ja-modernbert-130m | 136,3M | no disponible | ja | Apache 2.0 | Variante pequena y rapida, orientada a CPU/edge |
| gliner2.5-ja-modernbert-310m | no disponible | no disponible | ja | no disponible | Variante mayor del mismo autor, orientada a mayor precision |
| fastino/gliner2.5-multi-v1 | no disponible | no disponible | multilingue | no disponible | Modelo oficial de fastino-ai; este modelo no reutiliza sus pesos |

La comparativa se limita a los modelos citados en la informacion proporcionada. No se dispone de datos de benchmarks que permitan comparar rendimiento numerico entre estas alternativas.

## Limitaciones y advertencias

- Modelo comunitario no oficial: no esta afiliado ni respaldado por fastino-ai, segun indica la propia model card.
- Dataset de entrenamiento propietario y no publicado: no es posible auditar la composicion de los datos ni evaluar sesgos de forma independiente.
- Entrenamiento exclusivamente en japones: no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinacion: como todo modelo de extraccion, puede generar spans o clasificaciones incorrectas, especialmente con etiquetas ambiguas o textos fuera de dominio; el umbral de 0.5 es configurable pero no elimina el riesgo.
- Dependencia de la segmentacion Sudachi: el rendimiento esta ligado al word splitter y al diccionario core; textos con terminologia especializada o neologismos pueden segmentarse de forma suboptima.
- Restricciones de version: requiere transformers>=5 (los ficheros del tokenizer se guardaron con Transformers 5 y Transformers 4 no puede leerlos) y gliner2 2.1.x; con gliner2 2.2.0 los resultados de extraccion estructurada cambian ligeramente.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el modelo.
- No se dispone de informacion sobre sesgos especificos, limitaciones de longitud de contexto ni comportamiento en produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tkhshtsh0917/gliner2.5-ja-modernbert-130m
- Model card en japones: https://huggingface.co/tkhshtsh0917/gliner2.5-ja-modernbert-130m/blob/main/README.ja.md
- Variante de 310M: https://huggingface.co/tkhshtsh0917/gliner2.5-ja-modernbert-310m
- Coleccion GLiNER2.5 Japanese: https://huggingface.co/collections/tkhshtsh0917/gliner25-japanese
- Demo Space: https://huggingface.co/spaces/tkhshtsh0917/gliner2.5-japanese-demo
- Repositorio GLiNER2: https://github.com/fastino-ai/GLiNER2
- Encoder ModernBERT-Ja-130m: https://huggingface.co/sbintuitions/modernbert-ja-130m
- Sudachi (segmentador): https://github.com/WorksApplications/sudachi.rs
