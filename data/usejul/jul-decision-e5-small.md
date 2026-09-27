# usejul/jul-decision-e5-small

## Resumen

jul-decision-e5-small es un modelo de codificacion (encoder) derivado de intfloat/multilingual-e5-small, publicado por el usuario usejul, y ajustado especificamente para resolver tareas de decision zero-shot dentro de jul, un framework de agentes. El modelo conserva la arquitectura BERT del modelo base, con 117.653.760 parametros totales, y reutiliza el prefijo de entrada `query: ` declarado en su `config_sentence_transformers.json`, por lo que puede cargarse directamente con sentence-transformers o con la CLI de jul.

Su relevancia practica esta en que mejora el rendimiento zero-shot del modelo base sin aumentar el coste computacional: mismo tamano y misma velocidad que e5-small, pero con una ganancia medida de 0,532 a 0,611 en los conjuntos de desarrollo de jul y de 0,639 a 0,839 en SIB-200 sobre seis idiomas no vistos durante el entrenamiento. Esta ultima cifra es la mas interesante para produccion, porque indica una mejora sustancial en generalizacion cross-lingue cuando la tarea si se ha visto en ingles o frances.

Se distribuye bajo licencia Apache-2.0 y con un build ONNX int8 de 98 MB, lo que lo hace desplegable en CPU y en cualquier GPU de consumo. El repositorio principal pesa 0,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (tag `bert`), derivado de intfloat/multilingual-e5-small |
| Parametros totales | 117.653.760 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | ONNX int8 (build de 98 MB en usejul/jul-decision-e5-small-onnx); resto no disponible |
| Idiomas soportados | en, fr, multilingual |
| Licencia | Apache-2.0 (modelo base bajo MIT) |
| Formato de pesos | safetensors (repositorio principal); ONNX int8 (build secundario) |

## Arquitectura y entrenamiento

El modelo parte de multilingual-e5-small, un encoder transformer de tipo BERT orientado a embeddings multilingues, y no modifica su topologia: mantiene el mismo numero de parametros (117,6 M) y, segun el autor, el mismo tamano y velocidad que e5-small. La adaptacion consiste en un fine-tuning sobre datos de clasificacion publicos en ingles y frances, con los embeddings congelados y tomando la propia puntuacion de jul como funcion de perdida. El entrenamiento fue corto: 1.000 pasos en una unica GPU.

No se documentan fases de RLHF ni DPO, ni se especifica el volumen total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de decodificacion especulativa (no aplicables a un encoder de clasificacion). El autor advierte que parte de la mejora zero-shot procede de tipos de tarea vistos en entrenamiento (sentimiento financiero, topics), de modo que cuando se dispone de datos de tarea o de una cabeza ajustada especificamente, las diferencias frente al modelo base se reducen.

## Capacidades

- Clasificacion zero-shot: el pipeline declarado es `zero-shot-classification`, y el modelo responde decisiones de jul sin ejemplos etiquetados.
- Extraccion de caracteristicas (`feature-extraction`) para generar embeddings de frases reutilizables en busqueda semantica o clustering.
- Clasificacion de temas e intenciones: evaluado en AG News, Banking77 y Emotion mediante una cabeza hibrida ajustada.
- Analisis de sentimiento, incluido sentimiento financiero, segun los tipos de tarea presentes en el entrenamiento.
- Generalizacion cross-lingue: SIB-200 con seis idiomas no vistos durante el entrenamiento, con la tarea vista previamente en ingles y frances.
- Multilingue parcial: ingles, frances y uso multilingue generico; la cobertura declarada no incluye el castellano de forma explicita.
- Integracion con agentes: pensado como modulo de decision dentro del framework jul, invocable desde su CLI.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso, generacion de texto, codigo, matematicas y vision: no disponibles (es un encoder de clasificacion, no un modelo generativo).

## Casos de uso

- Enrutado de decisiones en agentes jul: el modelo sustituye al clasificador zero-shot base para decidir que accion o herramienta debe ejecutar un agente, con una mejora medida de 0,079 puntos absolutos en los dev sets de jul (n = 800).
- Clasificacion de intenciones en asistentes conversacionales: dado su rendimiento en Banking77 (0,790 con cabeza ajustada), puede etiquetar consultas de usuarios en dominios de atencion al cliente sin reentrenar el encoder completo.
- Etiquetado tematico de contenidos: con 0,790 en AG News dentro de la cabeza hibrida, sirve para categorizar articulos o tickets en categorias de topic.
- Analisis de sentimiento y monitorizacion de opinion: el entrenamiento incluye sentimiento financiero, por lo que es util para clasificar tono en resenas, encuestas o menciones de marca en ingles y frances.
- Moderacion y triaje multilingue: la mejora en SIB-200 (0,639 a 0,839) sobre idiomas no vistos lo hace adecuado para clasificar contenido en lenguas no cubiertas explicitamente, siempre que el criterio de decision se haya visto antes en ingles o frances.
- Anotacion automatica de datasets: al ser un encoder pequeno y rapido, puede preetiquetar grandes volumenes de texto para que un humano solo revise los casos de baja confianza, reduciendo coste de etiquetado.
- Recuperacion semantica y deduplicacion: usando `feature-extraction` con el prefijo `query: `, se pueden generar embeddings para busqueda sobre corpus documentales en ingles y frances.
- Despliegue en el borde o en CPU: gracias al build ONNX int8 de 98 MB, encaja en servicios serverless con presupuesto de memoria muy bajo.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los del autor, comparando el modelo con su base intfloat/multilingual-e5-small.

| Metrica | e5-small | jul-decision-e5-small |
|---|---:|---:|
| Zero-shot, conjuntos de desarrollo de jul (n = 800) | 0,532 | 0,611 |
| Cabeza hibrida ajustada (AG News, Banking77, Emotion) | 0,782 | 0,790 |
| SIB-200, 6 idiomas no entrenados (tarea vista en en/fr) | 0,639 | 0,839 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en FP32, aproximadamente 471 MB solo de pesos; en FP16, alrededor de 235 MB; en int8 (ONNX), unos 98 MB segun el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre. Para lotes grandes o alto throughput, una T4, RTX 3060 o superior es mas que suficiente; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales, y tambien en CPU e incluso en dispositivos con poca memoria.
- Opciones de despliegue: transformers (pipeline `zero-shot-classification`), sentence-transformers, ONNX Runtime con el build int8 y la CLI de jul mediante `jul models add jul-decision-e5-small --repo usejul/jul-decision-e5-small-onnx --backend onnx`. Compatible con endpoints de HuggingFace.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El autor solo indica que mantiene la misma velocidad que e5-small.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Zero-shot (jul dev, n = 800) | SIB-200 (6 idiomas no vistos) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| jul-decision-e5-small | 117,6 M | no disponible | 0,611 | 0,839 | Apache-2.0 | HuggingFace + ONNX int8 |
| intfloat/multilingual-e5-small | 117,6 M | no disponible | 0,532 | 0,639 | MIT | HuggingFace |
| Otros encoders multilingues pequenos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa cuantitativa solo es posible frente al modelo base, porque es el unico para el que el autor publica cifras. No se dispone de datos comparables de alternativas como otros encoders multilingues de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: el fine-tuning se realiza sobre datasets publicos de clasificacion en ingles y frances; los sesgos presentes en esas fuentes (dominio financiero, noticias, resenas) se trasladan al modelo.
- Alucinacion: al ser un encoder de clasificacion no genera texto, por lo que el riesgo de alucinacion no aplica; el riesgo equivalente es una clasificacion mal calibrada o etiquetas inventadas fuera de la taxonomia esperada.
- Idioma: la cobertura declarada es en, fr y multilingue generico. El castellano no aparece como idioma soportado explicitamente, aunque la generalizacion observada en SIB-200 sugiere cierta transferencia a lenguas no vistas.
- Contexto: la longitud maxima de contexto no esta documentada en la informacion disponible; conviene verificar la configuracion del tokenizador del modelo base antes de usarlo con entradas largas.
- Dependencia de la tarea: el propio autor senala que parte de la ganancia zero-shot procede de tipos de tarea vistos en entrenamiento. Con una cabeza ajustada o con datos de contexto, las diferencias frente a e5-small son minimas (0,790 frente a 0,782), por lo que la ventaja no se traslada a todos los escenarios.
- Entrenamiento corto: 1.000 pasos en una sola GPU y embeddings congelados limitan la magnitud de la adaptacion alcanzable.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base se distribuye bajo MIT y el modelo hereda el prefijo de entrada `query: `, que debe respetarse para no degradar el rendimiento.
- Adopcion: el repositorio registra 0 descargas y 0 likes, por lo que no hay validacion independiente ni comunidad que reporte incidencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/usejul/jul-decision-e5-small
- Build ONNX int8: https://huggingface.co/usejul/jul-decision-e5-small-onnx
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio del framework jul: https://github.com/usejul/jul
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por la busqueda no guardan relacion con el proyecto.
