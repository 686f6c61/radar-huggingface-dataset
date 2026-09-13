# ThakiCloud/SKILLRET-Edge-22M-int4

## Resumen

SKILLRET-Edge-22M-int4 es un bi-encoder de 22.713.216 parametros desarrollado por ThakiCloud para una tarea muy concreta: la recuperacion de habilidades (skill retrieval) en agentes basados en modelos de lenguaje. Dado un enunciado en lenguaje natural, el modelo lo proyecta en un espacio vectorial y devuelve, de entre un catalogo de miles de skills, la mas adecuada. Esta version es la variante cuantizada a int4 del modelo base ThakiCloud/SKILLRET-Edge-22M, obtenida por destilacion de conocimiento desde ThakiCloud/SKILLRET-Embedding-0.6B.

La relevancia del modelo esta en su relacion tamano/rendimiento: con 22,7 millones de parametros y un artefacto empaquetado de 17,1 MB, alcanza 75,14 NDCG@10 en el split de test publico de ThakiCloud/SKILLRET (4.392 consultas sobre 6.006 skills), frente a 78,48 NDCG@10 del profesor de 0,6B. Es decir, conserva el 93,0% de la calidad del profesor con una reduccion de tamano de aproximadamente 70x respecto a los 1191,6 MB del checkpoint BF16 del profesor. La cuantizacion int4 apenas cuesta 0,12 puntos porcentuales frente a fp16, diferencia que el propio autor describe como empate estadistico.

Al ser un modelo de extraccion de caracteristicas y no generativo, su valor practico es el de una etapa de recuperacion de bajisima latencia (3,1 ms p50 por consulta en un AMD EPYC 9355 con 4 hilos) que puede ejecutarse en CPU junto al agente, sin GPU y sin depender de una API externa. Esta pensado explicitamente para despliegue on-device y como componente de enrutamiento dentro de arquitecturas de agentes con catalogos de herramientas amplios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder tipo BERT (etiqueta `bert` en HuggingFace), pooling CLS, embeddings normalizados L2 |
| Parametros totales | 22.713.216 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`max_length` usado en evaluacion); maximo nativo de la arquitectura subyacente: no disponible |
| Tipos de cuantizacion | int4 con agrupacion (g16), asimetrica min/max, escalas y zero-points en fp16; el autor publica tambien variantes int8/g16, int3/g16 y fp16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `model.safetensors` (valores cuantizados de-cuantizados a fp16) y `model-int4-g16.bin` (payload int4 empaquetado, 17,012 MB) |

## Arquitectura y entrenamiento

El modelo es un bi-encoder denso de 22,7M de parametros con arquitectura transformer tipo BERT. Codifica consultas y descripciones de skills de forma independiente y produce embeddings normalizados L2 que se comparan por producto escalar. El pooling es CLS y la longitud maxima usada en evaluacion es de 256 tokens. El repositorio distribuye dos artefactos: un `model.safetensors` con los valores cuantizados de-cuantizados de vuelta a fp16 (para que cualquier instalacion de `transformers` o `sentence-transformers` lo cargue sin cambios) y un `model-int4-g16.bin` con el payload realmente empaquetado en int4. La cuantizacion es group-wise asimetrica min/max con tamano de grupo 16, la misma forma de bloque que un Q4_K/Q8_0 de GGUF, y `quantization.json` documenta el layout por tensor.

El entrenamiento consistio en destilacion de conocimiento desde ThakiCloud/SKILLRET-Embedding-0.6B con `kd_weight=0.7`, usando InfoNCE multi-positivo sobre 1 a 3 ejemplos dorados por consulta, 12 epocas y schedule coseno. La epoca se selecciono sobre un holdout disjunto por skill, nunca sobre el split de test. El autor documenta explicitamente varios intentos que no funcionaron: destilar desde un profesor de 8B en lugar de 0,6B empeoro 2,40 puntos porcentuales por brecha de capacidad; la cuantizacion post-entrenamiento a INT2 o ternaria colapso el modelo (aproximadamente 0,1 NDCG@10) sin que GPTQ ni QuIP lo rescatasen; el minado de negativos duros propios costo 1,0 punto; y la perdida auxiliar de proyeccion LEAF (w=0.3) costo 1,51 puntos con t pareada de -7.78.

Un detalle critico documentado por el autor es el contrato de prefijo de consulta: el repositorio incluye `query_prefix.json` con `resolved: ""`, es decir, las consultas se codifican sin prefijo de instruccion. El autor midio una variacion de 8,84 puntos porcentuales en un mismo checkpoint por desajuste entre el prefijo de entrenamiento y el de evaluacion, desajuste que ademas produjo un resultado falso en el que la cuantizacion parecia superar a fp16.

## Capacidades

- Recuperacion semantica de skills: dado un enunciado en ingles, devuelve el ranking de skills mas relevantes de un catalogo (evaluado con 6.006 skills).
- Extraccion de caracteristicas (`feature-extraction`): genera embeddings de frase normalizados L2, utilizables para similitud, clustering y busqueda vectorial.
- Recuperacion en modo bi-encoder: codifica consultas y documentos por separado, lo que permite precalcular los embeddings del catalogo una sola vez y solo codificar la consulta en tiempo de inferencia.
- Ejecucion en CPU: el modelo esta disenado para correr en CPU junto al agente, con latencias de milisegundos de un solo digito por consulta.
- Compatibilidad con tooling estandar: etiquetado como `sentence-transformers`, compatible con `text-embeddings-inference` y con `endpoints_compatible`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling. Es exclusivamente un componente de recuperacion.
- No se documenta un modo de pensamiento (thinking mode) ni capacidades de agente multi-paso propias; el modelo es una pieza dentro de un agente.
- Multilingue: no. Solo ingles.

## Casos de uso

- Enrutamiento de skills en agentes LLM: ante una peticion del usuario, el modelo recupera las habilidades candidatas del catalogo antes de que el LLM planifique. Con 3,1 ms p50 por consulta en EPYC 9355, el enrutamiento deja de ser un cuello de botella en el bucle del agente.
- Seleccion de herramientas en function calling: cuando el agente expone cientos o miles de herramientas, recuperar solo las relevantes reduce drasticamente el numero de definiciones inyectadas en el prompt y, con ello, el coste por token y el riesgo de confusion del LLM.
- Etapa de recall previa a un reranker: usar el modelo para obtener los primeros candidatos de entre 6.006 skills y pasar el top-k a un cross-encoder o al propio LLM para el reordenamiento final.
- Despliegue on-device y en el borde: los 17,1 MB empaquetados permiten incluir el modelo dentro de una aplicacion de escritorio o movil que funciona sin conexion y sin GPU, algo inviable con el profesor de 0,6B (1191,6 MB).
- Indexacion semantica de catalogos internos de APIs o documentacion: precalcular embeddings de descripciones de endpoints y ofrecer busqueda en lenguaje natural sobre ellos.
- Deduplicacion y agrupamiento de skills: los embeddings L2-normalizados permiten detectar entradas redundantes o casi identicas en un catalogo de herramientas en crecimiento, con coste despreciable por elemento (1,25 ms por elemento en batch-32 sobre EPYC 9355).
- Asistentes locales de documentacion tecnica: integrados en un editor o en un pipeline de CI/CD que necesite resolver "que skill o script aplica a esta tarea" sin enviar codigo ni descripciones a un servicio externo.
- Recomendacion en marketplaces de agentes: dado el texto libre de un usuario, sugerir plugins o skills de terceros del catalogo, con latencia compatible con autocompletado.

## Benchmarks y rendimiento

Metrica principal: NDCG@10 sobre el split de test publico de ThakiCloud/SKILLRET (revision `a050ad2`), con 4.392 consultas y 6.006 skills. Error estandar de aproximadamente ±0,45, por lo que diferencias inferiores a 1 punto porcentual no deben interpretarse como rankings.

| Variante | Tamano en disco | NDCG@10 | Frente al profesor |
|---|---|---|---|
| SKILLRET-Embedding-0.6B (profesor) | 1191,6 MB | 78,48 | — |
| fp16 | 45,4 MB | 75,26 ± 0,45 | 93,1% |
| int8 / g16 | 28,4 MB | 75,27 ± 0,45 | 93,1% |
| int4 / g16 (esta ficha) | 17,1 MB | 75,14 ± 0,45 | 93,0% |
| int3 / g16 | 14,2 MB | 73,82 ± 0,46 | 91,3% |
| Base sin entrenar | 90,9 MB | 50,07 ± 0,58 | 61,9% |

La diferencia entre int4 y fp16 es de 0,12 puntos porcentuales, con una t pareada de 1,15, que el autor califica de empate estadistico, mientras que el fichero se reduce 2,7x. El error del empaquetado predicho frente al real es del 0,36% (17,074 MB predichos frente a 17,012 MB en disco).

Latencia en CPU (aritmetica fp32, cuantizacion solo de pesos; dos maquinas distintas, por lo que no es una comparacion aislada de ISA):

| Maquina | p50 consulta unica | batch-32 por elemento |
|---|---|---|
| Apple M4 Pro, 4 hilos | 6,5 ms | 5,11 ms |
| AMD EPYC 9355, 4 hilos | 3,1 ms | 1,25 ms |
| Profesor 0.6B, mismo banco | 518–650 ms | no disponible |

A partir de los datos anteriores se puede derivar un throughput aproximado de 800 elementos/s en EPYC 9355 y de 196 elementos/s en M4 Pro en regimen de batch-32, aunque esa cifra es un calculo derivado y no un dato publicado por el autor.

No se han publicado en la informacion disponible resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K u otros); el modelo no es generativo y solo se reporta la metrica de recuperacion NDCG@10.

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo funciona en CPU por diseno.
- Memoria en disco: 17,1 MB el payload int4 empaquetado; aproximadamente 45,4 MB el `safetensors` en fp16 que se carga realmente con `sentence-transformers`.
- GPU recomendadas: ninguna. No se documenta soporte ni beneficio de ejecucion en A100, H100, RTX 4090 u otras GPU.
- Cabe en cualquier equipo de consumo: si, en CPU de portatil o escritorio, e incluso en dispositivos moviles o de borde por el tamano del artefacto.
- Opciones de despliegue: `sentence-transformers` (ruta probada y con la que se midieron los resultados), `transformers`, `text-embeddings-inference` (el repo esta marcado como `endpoints_compatible`), y potencialmente llama.cpp u ONNX Runtime si se escribe un kernel INT real, algo que el autor declara explicitamente como no medido.
- Latencia: 6,5 ms p50 por consulta en Apple M4 Pro con 4 hilos y 3,1 ms en AMD EPYC 9355 con 4 hilos; los valores de batch-32 son 5,11 ms y 1,25 ms por elemento respectivamente.
- Advertencia de rendimiento: la ruta `safetensors` ejecuta aritmetica fp32, no kernels enteros, por lo que las cifras de latencia anteriores no son velocidades de kernel INT. La aceleracion adicional requeriria enrutar los pesos empaquetados por un kernel entero real, algo no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | NDCG@10 | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SKILLRET-Edge-22M-int4 | 22,7M | 17,1 MB (empaquetado) | 75,14 | 256 tokens (eval) | Apache-2.0 | HuggingFace |
| SKILLRET-Edge-22M (base) | 22,7M | 90,9 MB sin entrenar | 50,07 (base sin entrenar) | no disponible | Apache-2.0 | HuggingFace |
| SKILLRET-Embedding-0.6B (profesor) | ~0,6B | 1191,6 MB (BF16) | 78,48 | no disponible | Apache-2.0 | HuggingFace |
| Otras variantes cuantizadas del mismo modelo (fp16, int8/g16, int3/g16) | 22,7M | 45,4 / 28,4 / 14,2 MB | 75,26 / 75,27 / 73,82 | 256 tokens (eval) | Apache-2.0 | HuggingFace |

No se dispone en la informacion proporcionada de comparaciones con modelos de embeddings genericos de terceros (por ejemplo familias tipo E5, BGE o GTE) sobre este mismo split, por lo que no se incluyen. Las unicas alternativas documentadas son el profesor de 0,6B y las demas variantes de cuantizacion del propio autor.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto. No puede usarse para generacion, razonamiento, codigo ni matematicas; es exclusivamente un codificador de frases para recuperacion.
- Solo ingles: el campo `language` es `en` y no se documenta soporte de otros idiomas ni evaluacion multilingue.
- Contrato de prefijo de consulta: las consultas deben codificarse sin prefijo de instruccion (`query_prefix.json`, `resolved: ""`). Un desajuste entre el prefijo de entrenamiento y el de evaluacion produjo al autor una variacion de 8,84 puntos porcentuales y un resultado falso en el que la cuantizacion parecia superar a fp16. Mantener la consistencia es obligatorio si se replican las cifras.
- Riesgo de discrepancia en benchmarks: el split de 4.997 consultas / 6.660 skills citado en la model card de los modelos de referencia de SkillRet no esta en el dataset publicado actualmente; el autor verifico que los ficheros publicos son identicos en hash a los suyos de 4.392 / 6.006. No deben convertirse cifras entre ambos splits.
- Diferencias inferiores a 1 punto porcentual no son significativas: el error estandar del split es de aproximadamente ±0,45.
- Cuantizacion real solo en almacenamiento: la ruta de carga con `safetensors` de-cuantiza a fp16 y ejecuta aritmetica fp32. El modelo no se beneficia de kernels enteros salvo que el usuario implemente uno a partir de `quantization.json`.
- Colapso en cuantizaciones agresivas: INT2 y ternaria post-entrenamiento destruyen el modelo (aproximadamente 0,1 NDCG@10) y GPTQ y QuIP no lo recuperan. No bajar de int3.
- Sesgos: no se documenta ninguna evaluacion de sesgo, equidad o robustez. El rendimiento depende por completo de la cobertura y la calidad del catalogo de skills sobre el que se recupere; un catalogo sesgado o incompleto se traducira directamente en recuperaciones sesgadas o irrelevantes.
- Alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en la recuperacion, es decir, devolver una skill con alta similitud coseno que no corresponde a la necesidad real. El modelo no verifica ni cita fuentes.
- Longitud de contexto limitada a 256 tokens en evaluacion: descripciones de skills o consultas mas largas quedaran truncadas.
- Restricciones de licencia: Apache-2.0, heredada del modelo base, permite uso comercial con las obligaciones habituales de atribucion y conservacion del aviso de licencia. No se documentan restricciones adicionales.
- Adopcion muy baja: 16 descargas y 0 likes en el momento de la consulta, con fecha de creacion en septiembre de 2026, por lo que la validacion por parte de terceros es practicamente inexistente.
- Idoneidad para produccion: el autor es transparente sobre que la ruta `safetensors` no usa kernels INT, que el modelo base sin entrenar obtiene 50,07 NDCG@10 y que varias tecnicas alternativas empeoraron el resultado. Cualquier despliegue en produccion deberia revalidar el NDCG@10 sobre el catalogo propio y con el prefijo de consulta correcto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/SKILLRET-Edge-22M-int4
- Modelo base: https://huggingface.co/ThakiCloud/SKILLRET-Edge-22M
- Profesor de destilacion: https://huggingface.co/ThakiCloud/SKILLRET-Embedding-0.6B
- Dataset de evaluacion: https://huggingface.co/datasets/ThakiCloud/SKILLRET
- Paper de referencia del benchmark (SkillRet): https://arxiv.org/abs/2605.05726

Nota sobre la busqueda web: los resultados devueltos corresponden a paginas del videojuego S.T.A.L.K.E.R. 2: Heart of Chornobyl y no guardan ninguna relacion con este modelo. No se ha encontrado informacion adicional relevante en la busqueda web.
