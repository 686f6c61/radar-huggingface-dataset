# tunabirgun/ArfLLM_Multi

## Resumen

ArfLLM_Multi es un modelo de embeddings de frases (sentence transformer) multilingue desarrollado por tunabirgun para Arf, una aplicacion de notas de caracter local-first orientada a cientificos. Su funcion es convertir una nota (titulo y cuerpo) en un vector de 384 dimensiones que la aplicacion compara en el propio dispositivo del usuario para sugerir notas relacionadas ("Resonance") y pares de notas sin enlazar ("Synthesis"). No genera texto: es un modelo de extraccion de caracteristicas y similitud semantica.

Tecnicamente es un fine-tuning de sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2, un transformer BERT de 117,6 millones de parametros con pooling medio, salida normalizada en L2 y una longitud maxima de 256 tokens. El entrenamiento combina destilacion de conocimiento multilingue sobre pares de frases en 12 idiomas con una perdida de ranking de negativos multiples sobre pares de titulos y abstracts de arXiv.

Su relevancia practica radica en dos factores: cubre 13 idiomas (incluidos turco, arabe, chino y japones) con un modelo lo bastante pequeno para ejecutarse en el navegador mediante Transformers.js con pesos int8, y mejora de forma sustancial la recuperacion de pasajes del mismo articulo cientifico frente a su modelo base, un caso de uso poco cubierto por los embeddings genericos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MiniLM-L12), encoder de 12 capas con pooling medio y normalizacion L2 |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncado; el resto de la nota se ignora) |
| Tipos de cuantizacion | int8 ONNX (cuantizacion dinamica, per-channel, pesos de 7 bits); fp32 |
| Idiomas soportados | multilingue; en, tr, de, fr, es, it, pt, nl, ru, ar, zh, ja, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (incluye `onnx/model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de paraphrase-multilingual-MiniLM-L12-v2, un encoder BERT de 12 capas y 384 dimensiones de salida. La inferencia aplica pooling medio sobre los tokens y normaliza el vector resultante en L2, de modo que la similitud coseno entre notas es directamente comparable. El truncado de entradas largas replica el comportamiento de los tokenizers de Hugging Face, conservando el token separador de cierre, y se procesa una nota por pasada forward.

El fine-tuning duro una epoca (586 pasos, batch de 512, learning rate 2e-5, maximo de 256 tokens, semilla 42) con dos objetivos. El primero es destilacion de conocimiento multilingue (Reimers y Gurevych, 2020) con perdida MSE y peso 10 hacia los embeddings en ingles del modelo base congelado, sobre 149.993 pares de frases ingles-X en 12 idiomas (52.500 en turco) procedentes de Tatoeba y Global Voices. El segundo es una perdida de ranking de negativos multiples con cache sobre 150.000 pares de titulos y abstracts de arXiv (y mitades de abstracts). La configuracion se selecciono solo con datos de desarrollo y se evaluo una unica configuracion contra una regla de aceptacion fijada antes del entrenamiento. Se verifico la ausencia de solapamiento exacto y casi duplicado entre train y test mediante hashes de texto normalizado y MinHash (Jaccard >= 0,8), eliminando los elementos solapados.

## Capacidades

- Generacion de embeddings de frases y documentos cortos: vectores de 384 dimensiones, normalizados en L2, listos para busqueda por similitud coseno.
- Similitud semantica multilingue y cross-lingue: pares de frases en 13 idiomas, con rendimiento mantenido en tareas de bitext mining (F1 de 0,993 sobre 24 direcciones con pivote en ingles).
- Recuperacion de pasajes cientificos: especialmente fuerte en recuperacion de pasajes del mismo articulo en arXiv (nDCG@10 de 0,821 frente a 0,623 del base).
- Busqueda semantica y deduplicacion: adecuado para indexar notas, abstracts o fragmentos y agrupar elementos cercanos.
- Ejecucion en navegador y en dispositivo: compatible con Transformers.js con pesos int8 y con sentence-transformers en Python.
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni modos de pensamiento: es exclusivamente un encoder de embeddings.

## Casos de uso

- Sugerencia de notas relacionadas en aplicaciones de conocimiento personal: se embeben titulo y cuerpo de cada nota y se comparan vectores en el dispositivo; es el caso para el que se entreno, con umbrales calibrados (Resonance 0,178, Synthesis 0,300) sobre notas de arXiv en ingles.
- Deteccion de pares de notas sin enlazar ("Synthesis"): al comparar todos los pares por similitud coseno se pueden proponer conexiones que el usuario no creo manualmente, sin enviar datos a ningun servidor.
- Busqueda semantica local en aplicaciones de escritorio o navegador: con el modelo int8 ONNX y Transformers.js se puede ofrecer busqueda por significado en una app web sin backend, a costa de una calidad ligeramente inferior (coseno medio de 0,9925 frente a fp32).
- Recuperacion de pasajes dentro de articulos cientificos: util para construir indices de fragmentos de papers y localizar el pasaje relevante para una consulta, donde el modelo supera ampliamente a su base (nDCG@10 de 0,821 frente a 0,623 en arXiv retenido).
- Deduplicacion y agrupacion de referencias bibliograficas: embeber titulos y abstracts permite agrupar registros duplicados o casi duplicados entre fuentes (arXiv, bases de datos propias) mediante umbral de similitud.
- Clasificacion y filtrado por similitud en pipelines multilingues: comparar textos de entrada con prototipos por idioma para enrutado o etiquetado ligero, aprovechando el soporte de 13 idiomas y el tamano reducido del modelo.
- Bitext mining y alineacion de corpus: el rendimiento en Flores (F1 de 0,993) lo hace util para emparejar frases traduccidas entre idiomas con pivote en ingles.

## Benchmarks y rendimiento

Resultados publicados en la model card (escala 0-1; diferencias en puntos de 0,01; intervalos de confianza del 95 % por bootstrap pareado sobre consultas, 10.000 remuestreos). ArfLLM_Multi evaluado a 256 tokens frente al modelo base en su configuracion por defecto (128 tokens):

| Tarea | Base | ArfLLM_Multi | Diferencia [IC 95 %] |
|---|---|---|---|
| SCIDOCS (nDCG@10) | 0,138 | 0,151 | +1,3 [+0,6, +2,0] |
| NFCorpus (nDCG@10) | 0,234 | 0,241 | +0,6 [-0,5, +1,8], no significativa |
| Recuperacion de pasajes del mismo articulo, arXiv retenido (nDCG@10) | 0,623 | 0,821 | +19,8 [+18,4, +21,3] |

Con ambos modelos a 256 tokens:

| Tarea | Base | ArfLLM_Multi |
|---|---|---|
| STS Benchmark | 0,844 | 0,843 |
| STS17 media | 0,814 | 0,817 |
| STS17 ingles-turco | 0,767 | 0,777 |
| Flores bitext mining F1 (24 direcciones) | 0,993 | 0,993 |
| SciDocsRR MAP | 0,778 | 0,768 |

Frente a la opcion multilingue anterior de Arf (modelo base a 512 tokens): SCIDOCS +5,3 [+4,4, +6,2] y NFCorpus +12,5 [+10,4, +14,7]. El archivo int8 ONNX presenta un coseno medio de 0,9925 respecto a fp32 sobre 300 textos retenidos y un nDCG@10 de 0,863 frente a 0,868 en la tarea de desarrollo (onnxruntime sobre CPU x86). La tarea de mismo articulo mide la tarea de entrenamiento, no la calidad general, segun advierte el autor.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (117,6 M de parametros, unos 470 MB de pesos); el repo completo ocupa 1,1 GB incluyendo ONNX y safetensors. En int8 el modelo pesa aproximadamente la cuarta parte que en fp32.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Cabe con holgura en RTX 3060, RTX 4090 o incluso en CPU.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de memoria libre; tambien en CPU y en navegador.
- Opciones de despliegue: sentence-transformers (Python), Transformers.js (`dtype: 'q8'`), ONNX Runtime, text-embeddings-inference, endpoints de Hugging Face.
- Latencia y throughput: no se publican cifras de latencia ni throughput en la informacion disponible; el autor solo indica que la paridad int8 se midio con onnxruntime en x86 y no en runtimes de navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| tunabirgun/ArfLLM_Multi | 117,6 M | 256 tokens | 13 | Apache 2.0 | Fine-tune especializado en notas y arXiv; int8 para navegador |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 117,6 M | 128 tokens por defecto (hasta 512) | multilingue | Apache 2.0 | Modelo base; mejor en SciDocsRR MAP (0,778 frente a 0,768) y sin ventaja en mismo articulo |
| all-MiniLM-L6-v2 | 22,7 M | 256 tokens | principalmente ingles | Apache 2.0 | Mucho mas pequeno y rapido, pero monolingue; los umbrales de Arf se calibraron originalmente sobre el |
| Modelos de embeddings multilingues de mayor tamano (p. ej. familia E5 o BGE) | cientos de millones a miles de millones | 512 tokens | multilingue | variable | No se dispone de comparacion directa en la informacion proporcionada |

## Limitaciones y advertencias

- El texto de entrenamiento es arXiv en ingles (dominado por informatica, matematicas y fisica) mas pares de frases generales cortas; el texto biomedico esta infrarrepresentado y no se uso texto cientifico en turco.
- No se evaluo recuperacion cientifica en idiomas distintos del ingles, por lo que no se reclama mejora en ese escenario.
- La entrada se trunca a 256 tokens; el resto de una nota larga se ignora, lo que puede perder informacion relevante en documentos extensos.
- El modelo int8 difiere ligeramente de fp32: el documento mejor rankeado cambia en el 5,7 % de las consultas de desarrollo; la paridad se midio en x86, no en navegador.
- Los umbrales de Arf (0,178 y 0,300) se calibraron solo con notas de arXiv en ingles, no con notas en turco, mixtas o de usuarios reales.
- El control de contaminacion cubre solo duplicados exactos y casi duplicados de texto.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la similitud puede producir falsos positivos al sugerir relaciones inexistentes entre notas; conviene validar los umbrales con datos propios.
- Sesgos: no se documentan analisis de sesgo; la sobrerrepresentacion de arXiv en ingles puede degradar la calidad en dominios alejados (legal, medico, humanidades).
- Licencia Apache 2.0, permisiva para uso comercial; el modelo base tambien es Apache 2.0. Los datos de entrenamiento incluyen Tatoeba (CC BY 2.0 FR) y Global Voices (CC BY 3.0), con atribucion documentada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tunabirgun/ArfLLM_Multi
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Repositorio de Arf: https://github.com/tunabirgun/arf
- Tatoeba: https://tatoeba.org
- Global Voices: https://globalvoices.org
- Licencia CC BY 2.0 FR: https://creativecommons.org/licenses/by/2.0/fr/
- Licencia CC BY 3.0: https://creativecommons.org/licenses/by/3.0/
- Referencia de destilacion multilingue: Reimers y Gurevych, 2020 (no se proporciona URL en la informacion disponible)
