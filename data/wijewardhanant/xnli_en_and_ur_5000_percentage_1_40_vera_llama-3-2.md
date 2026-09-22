# WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_40_VeRA_llama-3.2

## Resumen

`WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_40_VeRA_llama-3.2` es un adaptador PEFT entrenado con el metodo VeRA (Vector-based Random Matrix Adaptation) sobre el modelo base `meta-llama/Llama-3.2-3B`. El repositorio no contiene un modelo completo, sino unicamente los pesos del adaptador (0,2 GB) junto a la configuracion de PEFT; para utilizarlo hay que descargar el modelo base de Meta y aplicar el adaptador con la libreria `peft` (version 0.17.1 segun los metadatos).

El identificador del repositorio sugiere un ajuste fino para la tarea XNLI (inferencia de lenguaje natural, NLI) en ingles (`en`) y urdu (`ur`), con un subconjunto de 5.000 ejemplos y un barrido del porcentaje de datos de entrenamiento entre el 1 % y el 40 %. Conviene subrayarlo: se trata de una inferencia a partir del nombre, no de un dato confirmado. La model card publicada es la plantilla por defecto de Hugging Face, con todos los campos marcados como `[More Information Needed]`, de modo que el autor no declara licencia, idiomas, pipeline, datos de entrenamiento ni resultados de evaluacion.

Su interes es, por tanto, el de un artefacto de investigacion reproducible: muestra la aplicacion de una tecnica de adaptacion con muy pocos parametros entrenables sobre un transformer decoder-only de 3.210 millones de parametros y 128.000 tokens de contexto, en un escenario de transferencia a un idioma de bajos recursos como el urdu. Con cero descargas y cero likes en el momento de la consulta, no existe validacion comunitaria alguna sobre su calidad o su comportamiento real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2, con atencion de consultas agrupadas GQA) mas adaptador VeRA gestionado por PEFT |
| Parametros totales | 3.210 millones en el modelo base Llama-3.2-3B; el numero de parametros entrenables del adaptador no esta declarado (el repositorio ocupa 0,2 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128.000 tokens en el modelo base; el adaptador no la modifica. La tarjeta no lo declara |
| Tipos de cuantizacion | No declarados. El adaptador se distribuye en safetensors; el modelo base admite cuantizacion int8, int4 y formatos GGUF (q4_K_M, q5_K_M, q8_0, entre otros) mediante llama.cpp |
| Idiomas soportados | No declarados. El identificador del repositorio apunta a ingles y urdu; el modelo base tiene soporte oficial para 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes), entre los que no figura el urdu |
| Licencia | No declarada. El modelo base se distribuye bajo la Llama 3.2 Community License, cuyos terminos se heredan en la practica |
| Formato de pesos | safetensors (adaptador PEFT). Libreria declarada: peft 0.17.1 |
| Fecha de creacion | 2026-09-21 (segun los metadatos del Hub; conviene verificar esta fecha, posterior a la del modelo base) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se apoya en VeRA, un metodo de ajuste fino parametro-eficiente emparentado con LoRA. A diferencia de este ultimo, VeRA congela un par de matrices aleatorias de bajo rango que se comparten entre todas las capas del transformer y entrena unicamente vectores de escala por capa (los vectores `d` y `b` del articulo original). El resultado es una reduccion de los parametros entrenables de aproximadamente un orden de magnitud frente a LoRA con rangos comparables, a costa de una expresividad por capa mas limitada. El nombre del repositorio y el tamano del artefacto son los unicos indicios sobre la configuracion concreta (rango, capas objetivo, inicializacion): no hay ningun fichero de configuracion ni seccion de la model card que los detalle.

Sobre los datos de entrenamiento no hay informacion verificable. Si se confirma la hipotesis del nombre, el ajuste se habria realizado sobre XNLI (inferencia textual en tres clases: implicacion, neutralidad y contradiccion) en ingles y urdu, con 5.000 ejemplos y variaciones en el porcentaje de datos empleados. No se menciona ningun tipo de alineamiento posterior (RLHF, DPO, PPO) ni destilacion, y al ser un adaptador de clasificacion no cabe esperar un ajuste conversacional. El tag `arxiv:1910.09700` que aparece en el repositorio corresponde a la calculadora de impacto de carbono de Lacoste et al. (2019) citada en la plantilla por defecto, no a un articulo sobre este modelo.

## Capacidades

- Inferencia de lenguaje natural (NLI) en tres clases sobre pares de frases, presumiblemente segun el formato de XNLI: implicacion, neutralidad y contradiccion en ingles y urdu. No confirmado por el autor.
- Clasificacion de pares de secuencias: el modelo base es causal, de modo que el uso esperado es el de una cabeza o prompt de clasificacion, no el de un encoder dedicado.
- Transferencia entre idiomas ingles y urdu, si se confirma la composicion del conjunto de entrenamiento.
- Capacidades generativas generales del modelo base Llama-3.2-3B subyacentes (generacion de texto, resumen, respuesta a instrucciones basicas), si bien el adaptador las modifica de forma no documentada.
- Soporte de tool calling / function calling: no disponible en el adaptador. El modelo base Llama 3.2 lo soporta en sus variantes Instruct, pero esta tarjeta no declara si el ajuste conserva dicha capacidad.
- Modo de razonamiento extendido (thinking), vision o audio: no disponibles.
- Capacidades multilingues: no declaradas; limitadas en la practica a los idiomas del ajuste mas el conocimiento residual del modelo base.

## Casos de uso

- Clasificacion de pares de frases (NLI) en ingles y urdu: es el uso para el que el nombre del repositorio indica que fue entrenado. Serviria para etiquetar relaciones de implicacion, neutralidad y contradiccion en corpus paralelos o monolingues, siempre que se valide antes el rendimiento real, hoy sin medir.
- Filtrado de datos en pipelines RAG: comprobar si un pasaje recuperado implica o contradice la afirmacion del usuario antes de generar una respuesta. El adaptador actua como verificador barato sobre el modelo base de 3.210 millones de parametros.
- Deteccion de contradicciones en bases de conocimiento: comparar pares de tripletas o de oraciones procedentes de distintas fuentes para marcar inconsistencias, con la ventaja de cubrir contenido en urdu, donde escasean los modelos de NLI.
- Pre-etiquetado en proyectos de anotacion: generar etiquetas iniciales sobre grandes volumenes de pares de frases en ingles y urdu para que los anotadores revisen, reduciendo el coste por ejemplo anotado a cambio de una tasa de error que debe medirse.
- Verificacion de hechos en urdu: contrastar una afirmacion con un pasaje de referencia en un idioma con pocos recursos, apoyandose en el conocimiento multilingue residual del modelo base y en el ajuste especifico de la tarea.
- Evaluacion de la coherencia de resumenes o respuestas generadas: usar la salida de implicacion como senal automatica de fidelidad entre el texto fuente y el resumen, integrandola en un pipeline de evaluacion offline.
- Investigacion sobre PEFT y eficiencia de parametros: reproducir experimentos de VeRA frente a LoRA o ajuste completo con distintos porcentajes de datos (1 %-40 %), reutilizando el adaptador como punto de partida o como linea base.
- Despliegue en entornos con recursos limitados: al requerir solo el modelo base de 3B mas un adaptador de 0,2 GB, es viable servirlo en una unica GPU consumer, siempre que la tarea se limite a clasificacion y no a generacion abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada (todos los campos aparecen como `[More Information Needed]`) y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo. Por tanto, no hay datos de exactitud en XNLI, ni en ingles ni en urdu, ni comparaciones con LoRA, ajuste completo o modelos encoder de referencia.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB, por lo que el coste de memoria relevante es el del modelo base.
- VRAM aproximada del modelo base segun precision (sin contar cache KV ni sobrecarga del runtime):

| Precision | Peso de los pesos | VRAM recomendada (contexto corto) | GPU de ejemplo |
|---|---|---|---|
| fp16 / bf16 | ~6,4 GB | 10-12 GB | RTX 3060 12 GB, RTX 4070, L4 |
| int8 | ~3,2 GB | 6-8 GB | RTX 3060, RTX 2070 |
| int4 (GGUF q4_K_M) | ~2,0 GB | 4-6 GB | GTX 1660 6 GB, RTX 3050, Apple Silicon unificado |

- Cache KV: crece de forma lineal con el contexto. Llenar la ventana de 128.000 tokens en fp16 exige del orden de mas de 10 GB adicionales, por lo que en la practica conviene limitar el contexto o usar tecnicas de atencion eficiente.
- Cabe en GPU consumer: si, en cualquier GPU con 8 GB o mas para fp16 con contexto moderado, y en GPUs de 4-6 GB con cuantizacion int4.
- Opciones de despliegue: la via confirmada es `transformers` + `peft` cargando el modelo base y aplicando el adaptador. No consta soporte de adaptadores VeRA en vLLM, TGI, llama.cpp u Ollama, que si admiten adaptadores LoRA; para usar estas rutas habria que convertir el adaptador, algo que no esta documentado en la tarjeta.
- No se han publicado mediciones de latencia ni de throughput. Cualquier cifra al respecto seria una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (VeRA sobre Llama-3.2-3B) | 3.210 millones en el base + adaptador no cuantificado | 128.000 tokens | Ajuste parametro-eficiente para NLI en-en/ur | No declarada | 0 descargas, 0 likes |
| meta-llama/Llama-3.2-3B (base) | 3.210 millones | 128.000 tokens | Transformer decoder-only | Llama 3.2 Community License | Ampliamente disponible |
| meta-llama/Llama-3.2-1B (base) | 1.240 millones | 128.000 tokens | Transformer decoder-only | Llama 3.2 Community License | Ampliamente disponible |
| Alternativa de ajuste completo o LoRA sobre el mismo base | No disponible | 128.000 tokens | Ajuste completo o LoRA | Heredada del base | No disponible: no se identifica ningun adaptador equivalente publico para XNLI en urdu |
| Encoders tipo XLM-RoBERTa o mDeBERTa-v3 | No disponible en esta busqueda | No disponible en esta busqueda | Encoder discriminativo, habitualmente superior en tareas de clasificacion de pares | Distintas licencias segun variante | Ampliamente disponibles; comparacion de metricas no disponible |

No se dispone de datos de rendimiento de ninguna de las alternativas en esta misma tarea dentro de la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos, hiperparametros, evaluacion ni uso previsto. Cualquier uso en produccion exige una evaluacion propia previa.
- Licencia no declarada. La omision no exime de los terminos del modelo base: la Llama 3.2 Community License impone condiciones de atribucion ("Built with Llama"), nombrado de los derivados y restricciones de uso comercial por encima de 700 millones de usuarios mensuales.
- El ajuste se realizo, segun el nombre del repositorio, con un maximo de 5.000 ejemplos: es un volumen muy bajo, con riesgo alto de sobreajuste y de degradacion de las capacidades generativas del modelo base.
- Idiomas: si se confirma el alcance, solo ingles y urdu. El modelo base no incluye el urdu entre sus idiomas soportados oficialmente, por lo que el rendimiento en ese idioma descansa en el ajuste y no en el preentrenamiento.
- Tarea restringida: es un adaptador de NLI, no un modelo de proposito general. Usarlo para generacion abierta o conversacion no esta justificado por la informacion disponible.
- Riesgo de alucinacion y de calibracion deficiente heredado del modelo base, especialmente relevante si la salida se emplea como verificador automatico de hechos.
- Sesgos: no evaluados. El modelo base presenta sesgos conocidos de genero, raza, religion y origen geografico que el ajuste sobre XNLI no corrige y puede amplificar si el corpus de entrenamiento esta desequilibrado.
- Sin validacion comunitaria: cero descargas y cero likes, sin resultados de terceros que respalden su funcionamiento.
- Metadatos dudosos: la fecha de creacion indicada (2026-09-21) es posterior a la publicacion del modelo base y no se ha podido contrastar.
- El tag `arxiv:1910.09700` procede de la plantilla de Hugging Face (calculadora de impacto de carbono) y no debe interpretarse como referencia tecnica del modelo.
- La busqueda web realizada no devolvio ninguna fuente relacionada con este modelo; la informacion aqui recogida proviene exclusivamente de los metadatos y la model card del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_40_VeRA_llama-3.2
- Modelo base Llama-3.2-3B: https://huggingface.co/meta-llama/Llama-3.2-3B
- Repositorio de PEFT: https://github.com/huggingface/peft
- Articulo de VeRA (Vector-based Random Matrix Adaptation): https://arxiv.org/abs/2310.11454
- Articulo de XNLI (Cross-lingual Natural Language Inference): https://arxiv.org/abs/1809.05053
- Blog de anuncio de Llama 3.2: https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
- Referencia del tag `arxiv:1910.09700` (Lacoste et al., 2019, calculadora de impacto de carbono): https://arxiv.org/abs/1910.09700
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
