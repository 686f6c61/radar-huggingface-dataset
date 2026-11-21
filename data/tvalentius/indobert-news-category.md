# tvalentius/indobert-news-category

## Resumen

IndoBERT news category es un clasificador de texto en indonesio que asigna articulos de prensa a una de ocho categorias editoriales: `nasional`, `ekonomi`, `olahraga`, `teknologi`, `hiburan`, `internasional`, `gaya-hidup` y `otomotif`. Lo desarrolla el usuario de Hugging Face tvalentius y parte del checkpoint preentrenado `indobenchmark/indobert-base-p1`, un BERT base de 124 millones de parametros adaptado al indonesio por el proyecto IndoBenchmark. El modelo se ha afinado como clasificador de secuencias (sequence classification) y se distribuye bajo licencia MIT.

La relevancia practica del modelo esta en su relacion coste-rendimiento: con 124 millones de parametros y un tiempo de inferencia de unos 16 ms por articulo en una GPU Apple M-series, alcanza un 82,5 % de accuracy sobre articulos publicados despues del entrenamiento, el mismo resultado que una linea base TF-IDF con regresion logistica y muy por encima del 73 % de un LLM generativo de 4B parametros usado en modo zero-shot. Para tareas de enrutado editorial y agregacion de noticias a escala, eso supone una alternativa barata y de baja latencia frente a soluciones generativas.

El modelo es deliberadamente acotado: clasifica texto en indonesio de portales nacionales, sin capacidad generativa, sin tool calling y sin multimodalidad. Su utilidad esta en el etiquetado de articulos completos (titular mas cuerpo, hasta 2.000 caracteres truncados a 256 tokens), no en titulares aislados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (IndoBERT base p1), cabeza de clasificacion de secuencias |
| Parametros totales | 124.447.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia usada en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones especificas; al ser safetensors en fp32/fp16 es convertible a INT8/INT4 con herramientas estandar) |
| Idiomas soportados | indonesio (`id`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base estandar de 124 millones de parametros, heredado de `indobenchmark/indobert-base-p1`, al que se le ha anadido una cabeza de clasificacion lineal sobre el token `[CLS]`. No hay innovaciones arquitectonicas: es un fine-tuning clasico de sequence classification con truncacion a 256 tokens y concatenacion de titular y cuerpo del articulo (hasta 2.000 caracteres) como entrada.

El conjunto de entrenamiento son 1.568 articulos de seis portales indonesios (Antara, CNBC Indonesia, CNN Indonesia, detik, Liputan6 y Tempo), recogidos en noviembre de 2026 desde los feeds RSS publicos de cada portal. La etiqueta de cada articulo es la categoria del feed de origen, sin anotacion humana, lo que introduce ruido de etiqueta por solapamiento editorial. Se aplico deduplicacion agrupando copias sindicadas por titular normalizado, y el split es estratificado: 1.100 de entrenamiento, 156 de validacion y 312 de test. El dataset no se publica por derechos de autor de los editores.

Los hiperparametros son: learning rate 3e-5, batch efectivo de 16 (8 x 2 con acumulacion de gradientes), hasta 5 epocas con early stopping (paciencia 2) sobre macro F1 de validacion (se detuvo en la cuarta), warmup del 10 %, weight decay 0,01 y longitud maxima de 256 tokens. El entrenamiento se hizo en Apple Silicon (MPS) y duro aproximadamente 5 minutos. No se documenta RLHF, DPO ni ninguna fase de alineacion adicional.

## Capacidades

- Clasificacion de texto multietiqueta no: asigna exactamente una de ocho categorias a cada articulo.
- Etiquetado de articulos de prensa en indonesio a partir de titular mas cuerpo (hasta 2.000 caracteres, truncado a 256 tokens).
- Inferencia de alta velocidad: unos 16 ms por articulo en GPU Apple M-series.
- Compatible con `transformers` pipeline de `text-classification` y con text-embeddings-inference / endpoints compatibles.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking.
- Cobertura linguistica limitada al indonesio; no se ha evaluado en malayo, javanes ni otros idiomas.

## Casos de uso

- Enrutado editorial automatico: dado un articulo entrante en un CMS, el modelo asigna la seccion (`nasional`, `ekonomi`, `olahraga`, etc.) en 16 ms por pieza, lo que permite clasificar miles de articulos por minuto en una sola GPU consumer.
- Agregacion de noticias y feeds: un agregador que recibe articulos de multiples portales puede usar el modelo para etiquetar y agrupar por seccion antes de mostrarlos, con un coste computacional marginal frente a un LLM generativo.
- Moderacion y triaje de contenidos: para separar noticias duras (`nasional`, `internacional`) de contenido blando (`gaya-hidup`, `hiburan`) en pipelines de curacion.
- Analitica de medios: clasificar grandes volumenes de articulos historicos o en tiempo real para medir la distribucion tematica de un medio o comparar la cobertura de varios portales.
- Filtrado previo a un LLM: usar el clasificador como primera etapa barata para decidir que articulos merecen pasar a un modelo mayor (por ejemplo, resumen o analisis), reduciendo coste y latencia del pipeline.
- Deteccion de deriva tematica: al reentrenar periodicamente y comparar la matriz de confusion, el modelo sirve para monitorizar cambios en las secciones editoriales de un medio.
- Prototipado rapido en entornos con hardware limitado: al ejecutarse en CPU o en una GPU consumer con 0,5 GB de pesos, permite desplegar un clasificador de noticias en un portatil o en un contenedor pequeno.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Conjunto de evaluacion | n | Accuracy | Macro F1 |
|---|---|---|---|
| Split reservado, mismo periodo que entrenamiento | 312 | 0,862 | 0,859 |
| Articulos posteriores al entrenamiento | 1.373 | 0,825 | 0,826 |

F1 por categoria:

| Categoria | Split reservado | Articulos posteriores |
|---|---|---|
| nasional | 0,863 | 0,826 |
| ekonomi | 0,833 | 0,800 |
| olahraga | 0,932 | 0,948 |
| teknologi | 0,918 | 0,816 |
| hiburan | 0,853 | 0,850 |
| internasional | 0,778 | 0,667 |
| gaya-hidup | 0,854 | 0,778 |
| otomotif | 0,837 | 0,926 |

Comparativas declaradas por el autor sobre los articulos posteriores:

| Sistema | Accuracy | Latencia por articulo |
|---|---|---|
| indobert-news-category | 0,825 | ~16 ms (Apple M-series) |
| TF-IDF (word + char n-grams) + regresion logistica | 0,825 | no disponible |
| LLM instruct de 4B en zero-shot (familia Gemma, local) | 0,730 | ~900 ms (Apple M-series) |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: unos 0,5 GB de pesos; en fp16, unos 0,25 GB. Con overhead de runtime, cabe holgadamente en cualquier GPU con 2 GB o mas.
- Cabe en GPU consumer: RTX 3060, RTX 4060, RTX 4090, asi como en Apple Silicon (M1/M2/M3) y en CPU.
- GPU de datacenter (A100, H100) innecesarias para inferencia; solo tendrian sentido para entrenamiento o clasificacion masiva en lote.
- Despliegue: `transformers` (pipeline `text-classification`), text-embeddings-inference y endpoints compatibles. Tambien es exportable a ONNX y a llama.cpp/GGUF mediante conversion estandar de BERT, aunque el autor no documenta estos formatos.
- Latencia declarada: ~16 ms por articulo en Apple M-series; ~900 ms para el LLM de 4B comparado en el mismo hardware.
- Throughput: no disponible de forma explicita; a 16 ms por articulo en una sola GPU M-series, el orden de magnitud es de decenas de articulos por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| tvalentius/indobert-news-category | 124 M | 256 tokens | Clasificacion de noticias en indonesio (8 clases) | MIT | 0,825 accuracy en articulos posteriores |
| indobenchmark/indobert-base-p1 (modelo base) | 124 M | 512 tokens (BERT estandar) | Modelo de lenguaje enmascarado en indonesio, sin cabeza de clasificacion | no disponible en la informacion proporcionada | no aplica (no es clasificador) |
| TF-IDF + regresion logistica (linea base del autor) | no aplica | no aplica | Clasificacion de noticias en indonesio | no aplica | 0,825 accuracy en articulos posteriores |
| LLM instruct de 4B zero-shot (familia Gemma) | ~4 B | no disponible | Clasificacion zero-shot | no disponible | 0,730 accuracy en articulos posteriores |

No se dispone de datos sobre otros clasificadores IndoBERT especificos de categoria de noticias en la informacion proporcionada.

## Limitaciones y advertencias

- Titulares aislados rinden peor: la accuracy en el split reservado cae de 0,87 a 0,75 cuando solo se dispone de un resumen corto en lugar del cuerpo del articulo.
- Ruido de etiqueta: las categorias de los editores se solapan (noticias de fabricantes de coches en `ekonomi` o `otomotif`; salud en `gaya-hidup` o `nasional`; diplomacia en `nasional` o `internacional`). El modelo aprende los habitos de cada portal, no una taxonomia limpia.
- `internasional` y `gaya-hidup` son las clases mas debiles, con F1 de 0,667 y 0,778 respectivamente en articulos posteriores.
- Cobertura limitada: entrenamiento con portales nacionales de Yakarta de un solo mes (noviembre de 2026). No se han probado medios regionales, otros estilos de escritura, otras epocas ni texto no periodistico (redes sociales, blogs de opinion).
- No existe clase "otros": toda entrada se fuerza a una de las ocho categorias, lo que produce etiquetas erroneas en contenido fuera de dominio.
- El dataset no se publica por derechos de autor, lo que impide reproducir el entrenamiento y auditar los datos.
- El modelo solo cubre indonesio; no se ha evaluado su comportamiento en malayo ni en textos mixtos.
- Licencia MIT: permite uso comercial y modificacion, pero al derivar de `indobenchmark/indobert-base-p1` conviene revisar la licencia del modelo base antes de un despliegue comercial.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en la model card).
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos: el modelo siempre devuelve una categoria con una puntuacion de confianza que puede ser alta incluso en entradas fuera de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tvalentius/indobert-news-category
- Modelo base: https://huggingface.co/indobenchmark/indobert-base-p1
