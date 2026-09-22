# WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_120_VeRA

## Resumen

La ficha corresponde a `WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_120_VeRA`, un adaptador de ajuste fino publicado en HuggingFace por el usuario WijewardhanaNT. No se trata de un modelo completo, sino de pesos de adaptación (PEFT) que deben cargarse sobre el modelo base `meta-llama/Llama-3.1-8B`. El repositorio pesa aproximadamente 0,1 GB, coherente con un adaptador de bajo rango y no con un checkpoint completo de 8 000 millones de parámetros.

El identificador del repositorio sugiere que el ajuste se realizó sobre el conjunto de datos TyDiQA (preguntas y respuestas en múltiples idiomas), combinando inglés y telugu, con un subconjunto de 3 000 ejemplos. La cadena `VeRA` del nombre apunta, con reservas, a la técnica de adaptación Vector-based Random Matrix Adaptation implementada en la librería PEFT, aunque el autor no lo confirma en la model card. Toda esta interpretación procede únicamente del nombre del repositorio y no está respaldada por documentación del autor.

La relevancia de esta ficha es limitada y debe enmarcarse con honestidad: la model card es la plantilla por defecto de HuggingFace sin ninguna sección completada (todos los campos aparecen como `[More Information Needed]`), el repositorio acumula 4 descargas y 0 "likes", no declara licencia, idiomas ni resultados de evaluación, y la búsqueda web asociada no devuelve ningún enlace relacionado con el modelo. Se documenta, por tanto, como un artefacto de investigación sin validación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre transformer decoder-only (base: Llama 3.1 8B) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 8 030 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion se aplicaria al modelo base) |
| Idiomas soportados | No disponible; el identificador sugiere ingles y telugu, sin confirmacion del autor |
| Licencia | No disponible; el modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | Safetensors (adaptador PEFT) |
| Version de PEFT declarada | 0.17.1 |
| Tamano del repositorio | 0,1 GB |
| Modelo base | meta-llama/Llama-3.1-8B |

## Arquitectura y entrenamiento

No hay informacion publicada por el autor sobre la arquitectura del adaptador, el rango, el valor de alpha, las capas objetivo ni el tipo exacto de modulo PEFT utilizado. Lo unico verificable es que el repositorio declara `library_name: peft` y contiene pesos en formato safetensors sobre el modelo base `meta-llama/Llama-3.1-8B`, un transformer decoder-only con atencion agrupada por consultas (GQA), RoPE y una ventana de contexto de 128 000 tokens.

Tampoco se documentan los datos de entrenamiento, el numero de tokens vistos, la composicion del dataset, la existencia de fases de RLHF o DPO, ni los hiperparametros (tasa de aprendizaje, epocas, precision mixta). El nombre del repositorio apunta a un subconjunto de TyDiQA con 3 000 ejemplos en ingles y telugu, pero es una inferencia nominal, no un dato confirmado. La etiqueta `arxiv:1910.09700` presente en los tags corresponde al articulo de Lacoste et al. (2019) sobre el calculador de impacto de carbono, incluido en la plantilla por defecto de HuggingFace, y no a un paper descriptivo de este adaptador.

## Capacidades

- Ajuste fino orientado a tareas de respuesta a preguntas extractiva sobre el corpus TyDiQA, segun se deduce del identificador del repositorio; no confirmado por el autor.
- Cobertura potencial de ingles y telugu, de nuevo inferida del nombre y no documentada.
- El resto de capacidades heredadas del modelo base Llama 3.1 8B (generacion de texto, razonamiento basico, generacion de codigo, soporte de tool calling en la variante instruct) no pueden atribuirse a este adaptador sin evaluacion, ya que un ajuste supervisado sobre un corpus de QA puede degradar otras capacidades del modelo original.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

Los siguientes casos son hipotesis de trabajo condicionadas a la validacion del adaptador; no deben desplegarse en produccion sin evaluacion previa.

- Respuesta a preguntas extractiva en telugu: el adaptador podria emplearse para localizar respuestas literales en parrafos de contexto en telugu, replicando el formato de TyDiQA. Requiere verificar el rendimiento real antes de usarlo, ya que no hay metricas publicadas.
- Sistemas de QA bilingues ingles-telugu: combinado con el modelo base, permitiria atender consultas en ambos idiomas desde una unica instancia si el ajuste ha preservado la capacidad multilingue original.
- Investigacion academica sobre adaptacion eficiente de parametros: es el uso mas realista y seguro para este repositorio, sirviendo como punto de partida reproducible para comparar tecnicas PEFT sobre Llama 3.1 8B.
- Reproduccion de experimentos con TyDiQA: permite estudiar el efecto de reducir el conjunto de entrenamiento a 3 000 ejemplos sobre la calidad final del modelo en tareas de QA.
- Generacion de conjuntos de datos sinteticos de QA en telugu: si el adaptador conserva fluidez en ese idioma, podria emplearse para producir pares pregunta-respuesta y reentrenar iterativamente.
- Analisis de olvido catastrofico: util para medir cuanto degrada un ajuste pequeno y especifico las capacidades generales del modelo base, comparando respuestas antes y despues de cargar el adaptador.
- Prototipado con recursos limitados: al ser un adaptador de 0,1 GB, permite probar variantes de ajuste sin almacenar un checkpoint completo de 8B por experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye la seccion `Evaluation` completada, no hay tabla de resultados, ni metricas de F1 o Exact Match sobre TyDiQA, ni comparaciones con otros adaptadores. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar el modelo base `meta-llama/Llama-3.1-8B`, de 8 030 millones de parametros, cuyos requisitos de memoria dominan el coste.
- Inferencia en bf16/fp16: aproximadamente 16 GB de pesos, mas la cache KV, lo que situa el total en torno a 18-24 GB segun la longitud de contexto y el tamano de lote.
- Inferencia en cuantizacion de 8 bits: alrededor de 9-10 GB de pesos.
- Inferencia en cuantizacion de 4 bits: alrededor de 5-6 GB de pesos, viables en tarjetas de consumo con 8 GB o mas.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 en cuantizacion de 4 u 8 bits; en bf16 requiere al menos 24 GB, por lo que una RTX 3090 o RTX 4090 de 24 GB es el minimo practico.
- GPU de centro de datos: A100 40/80 GB, H100, L40S y similares para servir en precision completa con lotes grandes.
- El repositorio no documenta opciones de despliegue. Al tratarse de un adaptador PEFT, los caminos habituales serian la carga directa con `transformers` mas `peft`, la fusion de los pesos en el modelo base y su posterior servido con vLLM o TGI, o la conversion a GGUF para llama.cpp y Ollama si se fusiona previamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible adaptadores comparables publicados sobre TyDiQA con Llama 3.1 8B, ni el autor ofrece referencias de comparacion. La comparacion mas informativa es contra el propio modelo base.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (VeRA sobre Llama 3.1 8B) | No disponible; base de 8 030 millones | No disponible; base de 128 000 tokens | No publicado | No disponible | Publico en HuggingFace, 4 descargas |
| meta-llama/Llama-3.1-8B (base) | 8 030 millones | 128 000 tokens | Publicado por Meta | Llama 3.1 Community License | Publico, muy extendido |
| meta-llama/Llama-3.1-8B-Instruct | 8 030 millones | 128 000 tokens | Publicado por Meta | Llama 3.1 Community License | Publico, muy extendido |
| Adaptadores PEFT genericos sobre Llama 3.1 8B | Variable, tipicamente decenas de millones | Heredado del base | Depende del autor | Depende del autor | Amplia disponibilidad en HuggingFace |

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin completar: no hay informacion sobre autor, financiacion, licencia, idiomas, datos de entrenamiento ni evaluacion.
- Ausencia total de resultados de evaluacion: no se puede afirmar que el adaptador mejore al modelo base en ninguna tarea concreta.
- Licencia no declarada: el uso comercial queda en un limbo juridico. Ademas, al derivar de Llama 3.1, se heredan las condiciones de la Llama 3.1 Community License de Meta, que obliga a mantener la atribucion y a incluir la clausula de uso aceptable.
- Riesgo de alucinacion heredado del modelo base, agravado por el ajuste sobre 3 000 ejemplos de un corpus de QA: en tareas de respuesta a preguntas, el modelo puede generar respuestas plausibles pero no presentes en el contexto.
- Posible olvido catastrofico: un ajuste supervisado pequeno y especifico puede degradar la fluidez general, el razonamiento y las capacidades de codigo del modelo base, aunque no existen mediciones que lo confirmen.
- Sesgos: no documentados. Al desconocerse la composicion exacta del dataset, no se puede evaluar el sesgo de genero, geografico o cultural en telugu e ingles.
- Limitaciones de idioma: no confirmadas. Si el ajuste se centro en telugu e ingles, el rendimiento en castellano podria haberse deteriorado respecto al modelo base.
- Trazabilidad insuficiente: se desconoce la version exacta del dataset TyDiQA, el proceso de filtrado y si se aplico deduplicacion o control de calidad sobre los 3 000 ejemplos.
- Adopcion nula: 4 descargas y 0 interacciones sugieren que el artefacto no ha sido validado por la comunidad.
- Fechas de creacion y actualizacion registradas como 2026-09-22, con escasos segundos de diferencia entre ambas, lo que sugiere una subida automatizada sin edicion posterior de la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_120_VeRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Referencia del tag arxiv presente en el repositorio (Lacoste et al., 2019, sobre impacto de carbono): https://arxiv.org/abs/1910.09700
- Calculador de impacto de aprendizaje automatico citado en la plantilla: https://mlco2.github.io/impact
- Libreria PEFT: https://github.com/huggingface/peft
- Dataset TyDiQA (referencia del nombre del repositorio): https://huggingface.co/datasets/google/tydiqa

No se han encontrado otros enlaces relevantes en la busqueda web; los resultados obtenidos corresponden a un establecimiento de hosteleria sin relacion con el modelo.
