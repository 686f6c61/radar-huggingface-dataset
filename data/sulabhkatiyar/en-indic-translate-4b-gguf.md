# sulabhkatiyar/en-indic-translate-4b-GGUF

## Resumen

`sulabhkatiyar/en-indic-translate-4b-GGUF` es el conjunto de cuantizaciones GGUF del modelo `sulabhkatiyar/en-indic-translate-4b`, un ajuste fino de `google/gemma-4-E4B-it` especializado en traducir documentos completos de inglés a once idiomas indios: asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, oriya, panyabí, tamil y telugu. El modelo está publicado por el usuario sulabhkatiyar y su propósito declarado es la traducción de documentos largos y densamente estructurados (matemáticas en LaTeX, encabezados de sección y bloques de código delimitados) preservando el marcado intacto, en lugar de traducir frase a frase.

El repositorio no contiene pesos nuevos: ofrece tres builds GGUF (Q8_0, Q5_K_M y Q4_K_M) listos para `llama.cpp` y los runtimes construidos sobre él (`llama-server`, `llama-cli`, LM Studio y cargadores compatibles con Ollama). La relevancia de esta ficha está en que el autor publica una evaluación medida de la pérdida de calidad introducida por cada cuantización sobre un conjunto real de 100 documentos en 11 idiomas, comparada contra un build F16 de referencia no distribuido en este repositorio. Ese nivel de detalle (chrF++, spBLEU, recuento de colapsos por repetición y verificación de script de destino) es poco habitual en cuantizaciones comunitarias y permite decidir el compromiso tamaño/calidad con datos.

El recuento de parámetros medido en los pesos safetensors del modelo base es de 7.518.069.290, aunque la denominación comercial del modelo es "4b"; el nombre del modelo base (`gemma-4-E4B-it`) apunta a una arquitectura con parámetros efectivos, pero la información disponible no detalla la arquitectura interna ni el contexto soportado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia es `gemma`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: ajuste fino de `google/gemma-4-E4B-it`) |
| Parametros totales | 7.518.069.290 (medido en los pesos safetensors del modelo base; la denominacion del modelo es "4b") |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q5_K_M y Q4_K_M en GGUF; F16 de referencia citado en la evaluacion pero no publicado en este repositorio |
| Idiomas soportados | ingles (entrada) y 11 idiomas indios de destino: asames (as), bengali (bn), guyarati (gu), hindi (hi), canares (kn), malayalam (ml), marati (mr), oriya (or), panyabi (pa), tamil (ta), telugu (te) |
| Licencia | gemma |
| Formato de pesos | GGUF (para llama.cpp y runtimes derivados) |
| Tarea principal | traduccion documento a documento ingles → idiomas indios |
| Tamano del repositorio | 19,1 GB |
| Tamano de los ficheros | Q8_0: 7.480 GiB (8.031.224.320 B); Q5_K_M: 5.367 GiB (5.762.896.384 B); Q4_K_M: 4.969 GiB (5.335.273.984 B) |
| Compresion frente a F16 | Q8_0: 1,874x; Q5_K_M: 2,612x; Q4_K_M: 2,821x |
| Libreria declarada | gguf |
| Pipeline declarado | text-generation |
| Fecha de publicacion | 2026-09-19 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Se sabe que `sulabhkatiyar/en-indic-translate-4b` es un ajuste fino de `google/gemma-4-E4B-it`, y que el recuento de parametros medido en los pesos safetensors asciende a 7.518.069.290, cifra que no coincide con la etiqueta "4b" del nombre. La nomenclatura "E4B" del modelo base y esa diferencia entre nombre y recuento son compatibles con un diseno de parametros efectivos, pero esto no se confirma en la informacion proporcionada y no debe tomarse como un dato verificado. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias.

Lo que si esta documentado es el proceso de cuantizacion y su evaluacion. El autor publica tres builds GGUF (Q8_0, Q5_K_M, Q4_K_M) y los mide sobre un conjunto de 100 documentos en ingles con 11 idiomas de destino (10 documentos para asamés y 9 para cada uno de los otros diez idiomas), usando chrF++ y spBLEU de corpus contra traducciones de referencia. Cada cuantizacion tradujo el conjunto completo de extremo a extremo y se comparo con un build F16 no distribuido que actua como control. La evaluacion incluye un detector de salidas degeneradas (bucles de repeticion) y una comprobacion de que la salida este en el script de destino solicitado, con un umbral de 0,95. El detector no produjo falsos positivos sobre los 380 documentos completados en las cuatro variantes. La model card tambien afirma que el mismo modelo servido en bf16 mediante vLLM obtiene 0,06 chrF++ por debajo del F16, es decir, que el formato GGUF en si no introduce coste apreciable; la frase queda truncada en la informacion disponible.

## Capacidades

- Traduccion de ingles a 11 idiomas indios: asames, bengali, guyarati, hindi, canares, malayalam, marati, oriya, panyabi, tamil y telugu.
- Traduccion orientada a documentos completos, no a frases sueltas: el modelo esta construido para texto largo y densamente estructurado.
- Preservacion del marcado tecnico: matematicas en LaTeX, encabezados de seccion y bloques de codigo delimitados deben salir sin alterar.
- Consistencia de script: el 100 % de los documentos de Q5_K_M y el 99 % de los de Q8_0, F16 y Q4_K_M superaron el umbral de 0,95 de script de destino correcto.
- Generacion de texto con `pipeline_tag: text-generation`, por lo que puede usarse mediante la interfaz de generacion de llama.cpp pidiendo el idioma de destino.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Modo de razonamiento explicito (thinking mode): no documentado.
- Capacidades de vision o audio: no documentadas.
- Traduccion inversa (indio → ingles) o entre idiomas indios: no documentada; el modelo se presenta como ingles → indico.

## Casos de uso

- Traduccion de documentacion tecnica y cientifica: el modelo esta disenado para documentos con formulas en LaTeX, encabezados y bloques de codigo, de modo que un equipo puede pasar un README, un articulo o un manual completo desde ingles y conservar el marcado sin postprocesado manual.
- Localizacion de documentacion de producto a once idiomas indios desde un unico original en ingles: en lugar de mantener once pipelines distintos, se usa el mismo modelo con el idioma de destino indicado en la peticion, lo que simplifica el mantenimiento de la documentacion.
- Traduccion de articulos academicos y preprints: la evaluacion incluye documentos con identificadores tipo arXiv y contenido matematico denso, un escenario habitual en repositorios de preprints que necesitan versiones en varios idiomas indios.
- Traduccion de documentacion normativa o legal de estructura rigida: secciones numeradas, referencias cruzadas y texto formulaico se benefician de un modelo entrenado para documentos completos en lugar de frases aisladas.
- Material didactico y cursos: traduccion de apuntes, guias de laboratorio y enunciados de ejercicios con formulas desde ingles a la lengua materna de los estudiantes, usando Q8_0 cuando la exactitud del marcado sea prioritaria.
- Publicacion editorial y blogs: traduccion por lotes de entradas y articulos largos fuera de linea con `llama-cli` o `llama-server`, sin depender de APIs externas.
- Integracion en pipelines de documentacion (Sphinx, MkDocs, Docusaurus): el modelo puede invocarse como paso de traduccion dentro de CI/CD cuando la documentacion de origen esta en ingles y se publican versiones por idioma; conviene fijar Q8_0 para evitar las perdidas sistematicas de Q5_K_M.

## Benchmarks y rendimiento

La informacion proporcionada solo incluye evaluacion de traduccion (chrF++ y spBLEU sobre 100 documentos, 11 idiomas). No hay resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidades generales, y no se han publicado en la informacion disponible.

| Variante | chrF++ | spBLEU | Delta chrF++ vs F16 (documentos limpios emparejados) | Documentos degenerados | Script de destino >= 0,95 |
|---|---:|---:|---:|---:|---:|
| F16 (control de referencia, no publicado) | 82,22 | 78,59 | — | 2 / 100 | 99 / 100 |
| Q8_0 | 82,67 | 79,41 | −0,01 (n = 98) | 0 / 100 | 99 / 100 |
| Q5_K_M | 80,15 | 75,43 | −0,92 (n = 95) | 3 / 100 | 100 / 100 |
| Q4_K_M | 70,52 | 60,20 | −3,03 (n = 84) | 15 / 100 | 99 / 100 |

Detalles de la evaluacion aportados por el autor:

- La columna de chrF++ de corpus esta dominada por que documentos degeneran, no por la calidad de traduccion; por eso se reporta el delta sobre documentos limpios emparejados, con denominador propio en cada variante (98, 95 y 84).
- En Q8_0 el delta de −0,01 es ruido: ningun documento se mueve 2 puntos de chrF++ y el peor caso es −1,81. Ademas no degenero en ningun documento y corrigio los dos bucles en los que cayo el propio F16.
- En Q5_K_M la perdida de −0,92 es sistematica: la mediana de documento pierde 0,79, catorce documentos pierden mas de 2 y la perdida aparece en 9 de los 11 idiomas.
- En Q4_K_M la perdida de −3,03 es mas amplia: la mitad de sus documentos limpios emparejados pierden mas de 2 puntos, y aun excluyendo el documento generado en el idioma equivocado queda en −2,28 sobre los 83 restantes.
- El unico fallo de script de F16 y Q8_0 es el mismo documento, `(2003.02051, kn)`, con Kannada correcto como script dominante (~0,916); el autor lo atribuye a las propiedades del documento (LaTeX y numerales) y no a la cuantizacion. El fallo de Q4_K_M es un documento completo generado en el idioma equivocado.
- El detector de degeneracion no se activo en ninguno de los 380 documentos completados de las cuatro variantes, por lo que los recuentos de degeneracion no estan inflados por falsos positivos.
- El mismo modelo servido en bf16 mediante vLLM obtiene 0,06 chrF++ por debajo del F16, segun la model card (frase truncada en la informacion disponible).

Hashes sha256 publicados:

```
fb317572cae888e09659046b9b028de055ae9d47f873d2031dcceb7958f7a387  en-indic-translate-4b-Q8_0.gguf
136a68096c598ec0925b36d3f09e8f0c174f6c7ab9e5ff2fc98ad03f79391295  en-indic-translate-4b-Q5_K_M.gguf
d1be705ef5b69f8311628ec999394031a25dd5a0c8a7e3ec2979dfb444730698  en-indic-translate-4b-Q4_K_M.gguf
```

## Requisitos de hardware

Las cifras de VRAM son estimaciones a partir del tamano de fichero declarado de cada cuantizacion; la longitud de contexto no esta disponible, por lo que el consumo de cache KV no puede calcularse.

- Q8_0: 7.480 GiB de pesos, aproximadamente 9-10 GB de VRAM con contexto moderado. Cabe en GPU de consumo con 12 GB o mas (RTX 3060 12 GB, RTX 4070 12 GB) y en equipos Apple Silicon con 16 GB de memoria unificada o mas.
- Q5_K_M: 5.367 GiB de pesos, aproximadamente 7-8 GB de VRAM. Cabe con holgura en GPU de 8-12 GB y es la opcion razonable si el presupuesto de memoria es ajustado.
- Q4_K_M: 4.969 GiB de pesos, aproximadamente 6-7 GB de VRAM. Es la variante que cabe en el mayor numero de equipos, pero con la perdida de calidad medida indicada arriba (−3,03 chrF++ y 15 de 100 documentos degenerados).
- GPU de gama alta (A100 40/80 GB, H100 80 GB, RTX 4090 24 GB): sobradamente suficientes para cualquiera de las tres cuantizaciones, incluso con lotes y contextos amplios.
- Opciones de despliegue: `llama.cpp` (`llama-server`, `llama-cli`), LM Studio y cargadores compatibles con Ollama, tal como indica la model card. Para pesos sin cuantizar en bf16, la model card menciona servicio mediante vLLM sirviendo el modelo base.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo por documento.

## Comparativa con modelos similares

No se dispone de modelos comparables externos en la informacion proporcionada. La unica comparacion sustentada por datos es entre las variantes de este mismo repositorio y su control F16.

| Variante | Parametros | Formato | chrF++ (corpus) | Delta vs F16 (limpios) | Degenerados | Licencia |
|---|---:|---|---:|---:|---:|---|
| F16 (control, no publicado) | 7.518.069.290 | safetensors / bf16 en el modelo base | 82,22 | — | 2 / 100 | gemma |
| Q8_0 | 7.518.069.290 | GGUF | 82,67 | −0,01 (n = 98) | 0 / 100 | gemma |
| Q5_K_M | 7.518.069.290 | GGUF | 80,15 | −0,92 (n = 95) | 3 / 100 | gemma |
| Q4_K_M | 7.518.069.290 | GGUF | 70,52 | −3,03 (n = 84) | 15 / 100 | gemma |

Comparativas con otros sistemas de traduccion a idiomas indios (por ejemplo, modelos dedicados de traduccion automatica): no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Solo traduccion ingles → indico. No hay informacion que respalde traduccion inversa ni traduccion entre dos idiomas indios.
- La variante Q4_K_M degrada de forma sustancial: −3,03 chrF++ frente a F16 en documentos limpios emparejados, 15 de cada 100 documentos colapsados en bucles de repeticion (frente a 2 en F16) y un documento completo generado en el idioma equivocado. No es recomendable para produccion salvo que 0,398 GiB de memoria sean determinantes.
- La variante Q5_K_M pierde 0,92 chrF++ de forma sistematica, con catorce documentos perdiendo mas de 2 puntos y afectacion en 9 de los 11 idiomas. Ahorra 2,113 GiB respecto a Q8_0, pero no es equivalente en calidad.
- Q8_0 es la unica variante que la evaluacion considera equivalente a F16 en los documentos donde ambas produjeron salida limpia.
- Riesgo de alucinacion y de omisiones en traduccion: no se han publicado metricas de fidelidad mas alla de chrF++ y spBLEU, que no detectan contenido inventado ni frases omitidas. En documentos legales, medicos o normativos se requiere revision humana.
- Degeneracion por repeticion: incluso el control F16 fallo en 2 de cada 100 documentos, por lo que el fenomeno no es exclusivo de las cuantizaciones bajas.
- La model card esta truncada en la informacion disponible; la comparacion con vLLM en bf16 queda incompleta y no debe citarse como conclusion cerrada.
- Longitud de contexto no disponible: no puede garantizarse el comportamiento con documentos de longitud arbitraria y conviene validar con los documentos reales del caso de uso.
- Licencia `gemma`: es una licencia con condiciones especificas de uso (terminos de Gemma) y no una licencia de codigo abierto permisiva al uso. Los terminos concretos no se reproducen en la informacion disponible y deben consultarse en el repositorio oficial antes de un despliegue comercial.
- Adopcion practica: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion por terceros.
- Idiomas soportados: si el idioma de destino queda fuera de los once listados, el modelo puede devolver la salida en un idioma distinto, como demuestra el fallo de Q4_K_M.
- Los nombres de parametros y el contexto no estan confirmados: la discrepancia entre la etiqueta "4b" y los 7.518.069.290 parametros medidos debe tenerse en cuenta al planificar memoria.

## Enlaces

- Modelo en HuggingFace (GGUF): https://huggingface.co/sulabhkatiyar/en-indic-translate-4b-GGUF
- Modelo base sin cuantizar: https://huggingface.co/sulabhkatiyar/en-indic-translate-4b
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo base del ajuste fino (`google/gemma-4-E4B-it`): no disponible como enlace directo en la informacion proporcionada
- Papers, blogs, demos o informes de evaluacion adicionales: no disponibles en la informacion proporcionada (los resultados de la busqueda web no contienen material relacionado con el modelo)
