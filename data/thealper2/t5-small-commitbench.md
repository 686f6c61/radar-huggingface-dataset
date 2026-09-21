# thealper2/t5-small-commitbench

## Resumen

`thealper2/t5-small-commitbench` es un ajuste fino de `google-t5/t5-small` (60,5 millones de parametros) especializado en la generacion automatica de mensajes de commit a partir de un diff de Git. El problema que aborda es concreto: dado el parche de un cambio de codigo, producir la frase que lo describe, una tarea que en la practica suele resolverse con mensajes escuetos o vacios y que este modelo intenta cubrir de forma reproducible y ligera. Al partir de T5-small, el coste de inferencia es minimo, lo que permite ejecutarlo en CPU o en cualquier GPU de gama de consumo.

El entrenamiento se hizo sobre los splits oficiales del dataset CommitBench (`Maxscha/commitbench`), con 500.000 ejemplos de entrenamiento y 2.000 de validacion, en solo 1,219 horas sobre una NVIDIA GeForce RTX 5060 Ti. La tarea se formula como text-to-text con el prefijo `generate commit message:` seguido del diff crudo, y la salida es el mensaje de commit. El modelo cubre codigo en Python, JavaScript, PHP, Ruby, Java y Go, aunque el dataset y los mensajes de referencia estan unicamente en ingles.

Es relevante ahora por su tamano reducido y su licencia Apache-2.0, que lo hacen apto para integrarlo como utilidad local en flujos de desarrollo (hooks de Git, CI/CD, revision de codigo asistida) sin depender de APIs externas. Ahora bien, sus propias metricas (ROUGE-1 de 19,31, BLEU de 2,148 y exact match de 0,04 sobre 20.000 ejemplos de test) indican que la calidad de los mensajes generados es limitada y que el modelo debe tratarse como asistente de borrador, no como generador fiable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), atencion completa con embeddings posicionales relativos |
| Parametros totales | 60.506.624 (60,5 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens de entrada (max source length, con truncado) y 64 tokens de salida (max target length) |
| Tipos de cuantizacion | no se publican pesos cuantizados; al ser safetensors en fp32 se puede convertir a fp16/bf16 o a GGUF/INT8 por cuenta propia (no oficial) |
| Idiomas soportados | ingles (dataset y mensajes en `en`); el codigo fuente cubre Python, JavaScript, PHP, Ruby, Java y Go |
| Licencia | Apache-2.0 (modelo); el dataset CommitBench esta bajo CC BY-NC 4.0, lo que restringe el uso comercial de los datos |
| Formato de pesos | safetensors (repo de 0,2 GB) |
| Modelo base | google-t5/t5-small |
| Tarea / pipeline | text2text-generation (etiquetado como `text-generation` en el Hub) |
| Dataset de entrenamiento | Maxscha/commitbench (splits oficiales) |
| Prefijo de entrada | `generate commit message: <git diff>` |
| Metricas declaradas | rouge, bleu |

## Arquitectura y entrenamiento

La arquitectura es la de T5-small: un transformer encoder-decoder denso con embeddings posicionales relativos, normalizacion pre-LayerNorm y un vocabulario SentencePiece compartido entre entrada y salida. No hay innovaciones de atencion (nada de attention lineal, decodificacion especulativa ni mezcla de expertos); el valor del modelo esta enteramente en el ajuste fino sobre una tarea muy acotada.

El ajuste se realizo sobre 500.000 ejemplos del split de entrenamiento de CommitBench y 2.000 del de validacion, durante 2,0 epocas, con batch efectivo de 32, learning rate 3e-5 con schedule lineal, warmup ratio 0,05, weight decay 0,01, gradient clipping 1,0 y precision mixta bf16 sobre AdamW. La longitud maxima de origen fue de 512 tokens y la de destino de 64; el autor midio sobre una muestra de 50.000 ejemplos que el 0,7 % de los diffs superan los 512 tokens de origen y el 4,47 % de los mensajes superan los 64 tokens de destino. La perdida final de entrenamiento fue 3,5762 y la mejor de validacion 3,2414. No se menciona en la informacion disponible ninguna fase de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generacion de mensajes de commit: recibe un diff de Git crudo y devuelve una frase descriptiva del cambio.
- Resumen de cambios de codigo: la tarea es en esencia un resumen corto y condicionado de un parche.
- Comprension de diffs en seis lenguajes: Python, JavaScript, PHP, Ruby, Java y Go.
- Generacion determinista por defecto: `num_beams=4`, `do_sample=False`, `no_repeat_ngram_size=3`, `length_penalty=1.0`.
- Reproduccion de placeholders del dataset: genera tokens como `<I>` (numeros), `<HASH>`, `<URL>` o `<EMAIL>`, heredados de la anonimizacion de CommitBench.
- Ejecucion muy ligera: 60,5 M de parametros permiten inferencia en CPU y en GPUs de gama baja.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito; la informacion proporcionada no documenta ninguna de estas funciones.
- Capacidad multilingue: limitada al ingles en la salida; el codigo de entrada cubre los seis lenguajes citados, pero no hay evaluacion en otros idiomas.

## Casos de uso

- Borrador automatico de mensajes de commit en local: integrar el modelo en un hook `commit-msg` de Git que lea el diff preparado y proponga un mensaje; al ocupar menos de 0,25 GB en fp32, cabe en cualquier portatil y no requiere conexion.
- Etiquetado de historiales de repositorios: procesar por lotes los commits de un proyecto antiguo o migrado para generar descripciones legibles alli donde solo habia mensajes vacios o genericos, aprovechando el bajo coste por inferencia.
- Asistencia en revision de codigo: en un pipeline de CI, generar un resumen por pull request para que la persona revisora tenga una primera lectura del cambio antes de entrar al detalle.
- Generacion de notas de version: agrupar los mensajes generados para cada commit de un rango de release y usarlos como base de un changelog que luego se edita manualmente.
- Filtrado y clasificacion de cambios: usar la salida del modelo como representacion textual del diff para etiquetar automaticamente commits (por ejemplo, distinguir cambios de dependencias, correcciones o refactors) en un pipeline de analitica de repositorios.
- Formacion y experimentacion academica: por su tamano y su licencia Apache-2.0, sirve como linea base reproducible para comparar tecnicas de generacion de mensajes de commit, dado que el script de entrenamiento cabe en una sola GPU de consumo.
- Demo o prototipo de herramienta interna: exponer el modelo con Transformers o con text-generation-inference (el repo esta marcado como `endpoints_compatible`) para validar el interes de una funcionalidad antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test (20.000 ejemplos), con busqueda por haz `num_beams=4`:

| Metrica | Valor |
|---|---|
| rouge1 | 19,31 |
| rouge2 | 4,668 |
| rougeL | 17,42 |
| rougeLsum | 17,42 |
| bleu | 2,148 |
| exact_match | 0,04 |
| Longitud media generada (palabras) | 5,005 |
| Longitud media de referencia (palabras) | 11,27 |

Desglose por lenguaje de programacion:

| Lenguaje | n | ROUGE-1 | ROUGE-2 | ROUGE-L | BLEU | Exact match |
|---|---|---|---|---|---|---|
| Python | 5.722 | 21,20 | 6,05 | 19,29 | 2,73 | 0,04 |
| JavaScript | 4.468 | 18,86 | 4,05 | 17,07 | 2,01 | 0,02 |
| PHP | 3.489 | 17,04 | 3,46 | 15,29 | 1,64 | 0,09 |
| Ruby | 2.808 | 22,08 | 5,79 | 19,65 | 2,44 | 0,04 |
| Java | 1.799 | 15,19 | 2,61 | 13,58 | 1,02 | 0,06 |
| Go | 1.714 | 18,65 | 4,45 | 16,75 | 2,11 | 0,00 |

Perdidas declaradas: 3,5762 de entrenamiento final y 3,2414 de mejor validacion. No se han publicado en la informacion disponible resultados comparativos frente a otros modelos (por ejemplo, las lineas base del articulo de CommitBench), por lo que no se incluyen cifras de contraste.

## Requisitos de hardware

- VRAM para inferencia: los pesos en fp32 ocupan aproximadamente 0,24 GB y en fp16/bf16 alrededor de 0,12 GB; sumando activaciones y cache de atencion para 512 tokens de entrada, la huella practica se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entreno y ejecuto el modelo en una NVIDIA GeForce RTX 5060 Ti de 15,9 GB, pero esa capacidad es holgadamente superior a la necesaria.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas GTX 1650, RTX 3050, RTX 4060 y equivalentes; tambien funciona en CPU sin GPU dedicada.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (uso documentado por el autor), text-generation-inference y endpoints compatibles (el repo incluye la etiqueta `endpoints_compatible`), ademas de conversion propia a ONNX o a GGUF/llama.cpp, que no se distribuye oficialmente.
- Latencia y throughput: no disponible; no se publican mediciones de latencia ni de tokens por segundo.
- Entrenamiento: el ajuste completo consumio 1,219 horas en una unica RTX 5060 Ti de 15,9 GB, lo que da una idea del coste de reentrenamiento en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en generacion de mensajes de commit |
|---|---|---|---|---|---|
| thealper2/t5-small-commitbench | 60,5 M | 512 entrada / 64 salida | Apache-2.0 (modelo); datos CC BY-NC 4.0 | HuggingFace, 0 descargas, 0 likes | ROUGE-1 19,31, BLEU 2,148, exact match 0,04 en el test de CommitBench |
| google-t5/t5-small | 60,5 M | 512 | Apache-2.0 | HuggingFace | no disponible sin ajuste especifico para la tarea |
| Salesforce/codet5-small | 60 M | 512 | Apache-2.0 | HuggingFace | no disponible en la informacion proporcionada |
| Lineas base publicadas en el articulo de CommitBench | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La comparacion se limita a parametros, contexto, licencia y disponibilidad: la informacion proporcionada no incluye resultados de benchmarks de los modelos alternativos, por lo que no se pueden establecer comparaciones de rendimiento fiables.

## Limitaciones y advertencias

- Placeholders heredados del dataset: CommitBench sustituye literales identificativos por tokens; todos los diffs contienen `<HASH>` y el 26,5 % de los mensajes de referencia incluyen `<I>`, `<URL>` o `<EMAIL>`. El modelo reproduce esos tokens, generando salidas como `Bumped version to <I>`, poco utiles tal cual en un repositorio real.
- Vocabulario inadecuado para codigo: el SentencePiece de T5 no cubre todos los caracteres del codigo fuente (llaves, barras invertidas, angulos), de modo que alrededor del 2,35 % de los tokens de entrada se convierten en `<unk>`, lo que degrada la lectura precisa del diff.
- Truncado agresivo: los diffs de mas de 512 tokens se recortan, de modo que la parte final del cambio no es visible para el modelo; esto afecta a cambios grandes o multifichero.
- Fuga por repositorio en la evaluacion: los splits de CommitBench son aleatorios por commit y no por repositorio; el 98,6 % de los ejemplos de test provienen de repositorios que tambien aparecen en entrenamiento. No se comparte ningun par `(diff, message)` entre splits, pero las metricas reflejan en parte familiaridad con el estilo de commit de un proyecto, no generalizacion a codigo nuevo.
- Riesgo de alucinacion: al ser un modelo pequeno entrenado para imitar mensajes, puede producir descripciones genericas o incorrectas del cambio; el exact match de 0,04 y una longitud media generada de 5,005 palabras frente a 11,27 de referencia indican salidas mas cortas y poco fieles.
- Cobertura limitada: solo ingles y seis lenguajes de programacion; el comportamiento en otros idiomas, en cambios muy grandes o en repositorios con estilos de commit muy distintos no esta evaluado.
- Restriccion de licencia en los datos: aunque el modelo se publica bajo Apache-2.0, el dataset CommitBench esta bajo CC BY-NC 4.0, que restringe el uso comercial de los datos; conviene revisar la implicacion antes de explotar el modelo en productos comerciales.
- Riesgo de `overfitting`: 2 epocas sobre 500.000 ejemplos con un modelo de 60 M de parametros y una perdida de validacion de 3,2414 sugieren margen de mejora tanto en datos como en capacidad.
- Uso en produccion: no hay garantia de calidad suficiente para generar mensajes de commit sin supervision humana; se recomienda tratarlo como sugerencia editable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/t5-small-commitbench
- Dataset CommitBench: https://huggingface.co/datasets/Maxscha/commitbench
- Modelo base: https://huggingface.co/google-t5/t5-small
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo (los resultados obtenidos trataban de otro tema); no se dispone de articulos, repositorios ni demos adicionales.
