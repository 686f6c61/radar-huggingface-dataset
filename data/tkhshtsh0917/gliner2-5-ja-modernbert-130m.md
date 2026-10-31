# tkhshtsh0917/gliner2.5-ja-modernbert-130m

## Resumen

gliner2.5-ja-modernbert-130m es un modelo de extraccion de informacion especializado en japones, entrenado por el usuario de HuggingFace tkhshtsh0917 como modelo comunitario no oficial (sin afiliacion con fastino-ai). Se basa en la arquitectura GLiNER2.5 de tipo "boundary" y sustituye el encoder original por ModernBERT-Ja-130m de SB Intuitions, con todas las cabezas de tarea inicializadas desde cero. Un unico modelo resuelve reconocimiento de entidades nombradas (NER), clasificacion de texto, extraccion de relaciones y extraccion estructurada en formato JSON sobre texto japones.

Su relevancia radica en cubrir un nicho poco atendido: la extraccion zero-shot de esquemas arbitrarios en japones con un modelo pequeno (136 millones de parametros) pensado para ejecutarse en CPU y entornos edge. El tokenizador y la segmentacion de palabras se adaptan al japones mediante Sudachi (SplitMode.C, diccionario core), lo que permite extraer spans correctamente en un idioma sin separacion por espacios.

Existe una familia de dos modelos: esta variante de 130m (mas rapida, para CPU/edge) y una variante de 310m con mayor precision. El modelo se distribuye en safetensors bajo licencia Apache 2.0 y se integra con la libreria `gliner2` (version 2.1.0 o superior) junto con `transformers>=5`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2.5 (boundary architecture) sobre encoder ModernBERT-Ja |
| Parametros totales | 136.287.187 |
| Parametros activos | no disponible (no se indica si es MoE; no lo es) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en precision original) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 1,1 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GLiNER2.5 "boundary": el esquema de tareas (etiquetas de entidad, clases, relaciones y campos de estructura) se escribe como un prompt con marcadores especiales (`[E]`, `[L]`, `[R]`, `[C]`) que se concatena con el texto de entrada en una unica secuencia. Un encoder ModernBERT-Ja-130m procesa esquema y texto en una sola pasada, y el vector de cada marcador actua como consulta para su etiqueta. Una cabeza de fronteras puntua cada hueco entre palabras como posible inicio o fin de span, con re-puntuacion de pares inicio-fin, compatibilidad de extremos, palabras internas y longitud del span; un score de "no answer" permite devolver vacio para etiquetas ausentes. La clasificacion usa un pequeno MLP sobre los marcadores de clase, y relaciones y estructuras reutilizan la maquinaria de spans.

A diferencia de otros ports de GLiNER2, este modelo no usa ningun peso publicado por fastino-ai: el encoder parte de los pesos preentrenados de ModernBERT-Ja-130m de SB Intuitions, y todas las cabezas de tarea se entrenan desde cero. El entrenamiento se realizo con el trainer del repositorio publico GLiNER2 (`gliner2==2.0.0`) sin modificar la libreria, mediante un script wrapper que anade ajustes especificos para japones: un segmentador de palabras basado en Sudachi (SplitMode.C, diccionario core), configuracion de schema-augmentation y un mecanismo de alineacion de spans gold a tokens de Sudachi. Los datos de entrenamiento son un dataset sintetico japones propietario que no se ha publicado; no se ha divulgado el numero de tokens ni el uso de tecnicas como RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot en japones: hasta 128 spans candidatos por etiqueta, con seleccion del mejor conjunto no solapado y umbral de probabilidad sigmoid configurable (por defecto 0,5).
- Clasificacion de texto con esquemas arbitrarios definidos en tiempo de inferencia, tanto single-label (softmax) como multi-label (sigmoid por etiqueta, `cls_threshold` por defecto 0,5).
- Extraccion de relaciones: pares cabeza-cola puntuados por una cabeza de relacion especifica.
- Extraccion estructurada (JSON): cada campo es una consulta de span; en modo `mode="natural"`, cada candidato del campo ancla inicia un registro y los demas campos se asignan a los registros.
- Salida como diccionario de Python con offsets de caracteres sobre el texto original, preservando la forma original de los spans (por ejemplo, `Pythonエンジニア`, no la forma en minusculas usada internamente).
- Manejo correcto del japones gracias a la segmentacion con Sudachi y al lowercasing interno con restauracion posterior del texto original.
- No es un modelo generativo: no produce texto libre, no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Extraccion de campos de ofertas de empleo en japones: dado un texto como `渋谷でリモート可のPythonエンジニア正社員`, el modelo puede extraer simultaneamente ocupacion, ubicacion y condiciones laborales en un esquema definido por el usuario, sin entrenamiento adicional.
- Cumplimiento y mineria de documentos: identificar entidades como nombres de empresas, cantidades monetarias y fechas en contratos o facturas japonesas, devolviendo offsets exactos sobre el texto original para resaltado o auditoria.
- Clasificacion de tickets de soporte en japones: clasificar consultas de clientes por categoria e intencion con taxonomias personalizadas, en modo single-label o multi-label segun necesidad.
- Poblado de bases de datos estructuradas: convertir texto libre (notas, articulos, fichas de producto) en registros JSON con campos tipados mediante la extraccion estructurada con campo ancla.
- Enrichment de datos en pipelines RAG o de indexacion: extraer entidades y relaciones de documentos japoneses para construir grafos de conocimiento o metadatos de busqueda, con latencia baja en CPU.
- Despliegue en edge y dispositivos sin GPU: con 136 millones de parametros y ejecucion verificada en CPU (Python 3.10, 3.12 y 3.13), es adecuado para servicios locales de extraccion sin infraestructura de GPU.
- Prototipado rapido de esquemas de extraccion: la definicion de esquemas en tiempo de inferencia permite probar taxonomias de entidades y campos sin reentrenar, acelerando el desarrollo de aplicaciones de IE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica cualitativamente que la variante de 310m ofrece mayor precision y que esta variante de 130m es mas pequena y rapida, orientada a CPU y edge.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 136 millones de parametros en precision original (~0,27 GB de pesos, 1,1 GB con el repositorio completo), el modelo es ejecutable en CPU sin GPU.
- GPU recomendadas: no es necesaria GPU; cualquier GPU moderna lo ejecutaria sin problema si se desea acelerar.
- Consumer GPUs: cabe con holgura en cualquier GPU consumer (por ejemplo, una RTX 3060 de 12 GB o inferior seria mas que suficiente), aunque el caso de diseno es CPU/edge.
- Opciones de despliegue: libreria `gliner2` (>= 2.1.0) con `transformers>=5` (los ficheros del tokenizador requieren Transformers 5; la version 4 no puede leerlos) y `sudachipy>=0.7` con `sudachidict-core`. Instalacion: `pip install "gliner2[local]>=2.1" "transformers>=5" "sudachipy>=0.7" sudachidict-core`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; se verifica su ejecucion en CPU, lo que indica latencias adecuadas para uso interactivo en hardware modesto.
- Entornos verificados: Python 3.10, 3.12 y 3.13 en CPU, incluidos entornos con Transformers 4 preinstalado.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| gliner2.5-ja-modernbert-130m (este) | 136M | NER, clasificacion, relaciones, extraccion JSON (zero-shot) | Japones | Apache 2.0 | Optimizado para CPU/edge; entrenado desde cero sobre ModernBERT-Ja |
| gliner2.5-ja-modernbert-310m (mismo autor) | ~310M (no disponible exacto) | Mismas tareas | Japones | no disponible | Mayor precision, hermano mayor en la misma coleccion |
| fastino/gliner2.5-multi-v1 | no disponible | Mismas tareas (multi) | Multilingue | no disponible | Modelo oficial de fastino-ai; este modelo no reutiliza sus pesos |

La familia GLiNER original (por ejemplo, urchade/gliner_multi) cubre tareas similares de NER zero-shot multilingue, pero no se dispone de datos comparativos publicados para esta variante japonesa.

## Limitaciones y advertencias

- Es un modelo comunitario no oficial, sin afiliacion ni respaldo de fastino-ai; no ha pasado por un proceso de validacion corporativo.
- Los datos de entrenamiento son un dataset sintetico japones propietario no publicado: no es posible auditar su composicion, cobertura ni sesgos potenciales.
- No se han publicado benchmarks cuantitativos, por lo que la precision debe validarse empiricamente en cada dominio de uso antes de pasar a produccion.
- Requiere pasar obligatoriamente un `word_splitter` (Sudachi, SplitMode.C): sin el, el texto se divide por espacios en blanco y los spans japoneses no se extraen correctamente.
- Requiere `transformers>=5` y `gliner2>=2.1.0`; versiones anteriores de Transformers no pueden leer los ficheros del tokenizador.
- Solo soporta japones; no es adecuado para texto en otros idiomas.
- No es un modelo generativo: no genera texto libre, no razona paso a paso ni soporta tool calling o agentes.
- No hay cuantizaciones publicadas, lo que limita opciones de optimizacion adicionales en hardware muy restringido.
- La longitud de contexto maxima no esta documentada; textos muy largos pueden requerir fragmentacion.
- Como todo modelo de extraccion, puede producir spans erroneos o alucinados; el umbral (`threshold`, `cls_threshold`) debe ajustarse segun el compromiso precision/recall del caso de uso.

## Enlaces

- Modelo: https://huggingface.co/tkhshtsh0917/gliner2.5-ja-modernbert-130m
- Modelo hermano (310m): https://huggingface.co/tkhshtsh0917/gliner2.5-ja-modernbert-310m
- Coleccion GLiNER2.5 Japanese: https://huggingface.co/collections/tkhshtsh0917/gliner25-japanese
- Demo en Space: https://huggingface.co/spaces/tkhshtsh0917/gliner2.5-japanese-demo
- Repositorio GLiNER2 (fastino-ai): https://github.com/fastino-ai/GLiNER2
- Encoder base ModernBERT-Ja-130m (SB Intuitions): https://huggingface.co/sbintuitions/modernbert-ja-130m
- Segmentador Sudachi (sudachi.rs): https://github.com/WorksApplications/sudachi.rs
