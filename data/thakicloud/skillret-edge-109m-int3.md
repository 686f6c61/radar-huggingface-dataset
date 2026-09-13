# ThakiCloud/SKILLRET-Edge-109M-int3

## Resumen

SKILLRET-Edge-109M-int3 es un bi-encoder de 109.482.240 parámetros (aproximadamente 109,5 M) desarrollado por ThakiCloud para una tarea muy concreta: la recuperación de *skills* (herramientas o capacidades) de un catálogo a partir de una petición en lenguaje natural. Se trata de un modelo derivado por destilación de conocimiento de `ThakiCloud/SKILLRET-Embedding-0.6B`, pensado para ejecutarse en CPU junto al agente, sin depender de GPU ni de servicios externos. El repositorio es una variante cuantizada a int3 con grupos de 16, cuya carga útil empaquetada ocupa 68,350 MB.

El problema que resuelve es el enrutado de herramientas en sistemas agénticos: dado un catálogo de miles de skills descritas en texto, seleccionar la más adecuada para cada petición del usuario. Sobre el split de test público de `ThakiCloud/SKILLRET` (4.392 consultas y 6.006 skills) alcanza un NDCG@10 de 78,04, frente a los 78,48 del modelo maestro, un 26,6% más pequeño... aunque la propia model card describe al maestro como "26 veces mayor", una cifra que no coincide con el ratio de tamaño en disco (véase la sección de limitaciones).

Su relevancia actual está en el nicho *on-device*: un recuperador que ocupa menos de 70 MB permite integrar enrutado de herramientas dentro de aplicaciones de escritorio, móviles o entornos sin conectividad, donde no es viable cargar un encoder de 0,6 B o llamar a un servicio de embeddings remoto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder (etiqueta `bert` en HuggingFace), pooling CLS, embeddings L2-normalizados |
| Parametros totales | 109.482.240 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | `max_length=256` en evaluacion; limite nativo del encoder: no disponible |
| Tipos de cuantizacion | int3 con cuantizacion por grupos de tamano 16, asimetrica min/max, escalas y zero-points en fp16. La familia incluye tambien fp16, int8/g16 e int4/g16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (valores cuantizados de-cuantizados a fp16) y `model-int3-g16.bin` (payload empaquetado real, 68.350 MB) |
| Dimensionalidad del embedding | No disponible en la informacion proporcionada |
| Tamano del repositorio | 0,3 GB |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer bi-encoder de tipo BERT con pooling sobre el token CLS y normalizacion L2 de los embeddings. El modelo se entreno por destilacion de conocimiento desde `ThakiCloud/SKILLRET-Embedding-0.6B` con un peso de destilacion (`kd_weight`) de 0,7, usando una perdida multi-positive InfoNCE con entre 1 y 3 ejemplos positivos por consulta, 12 epocas y un schedule de learning rate coseno. La epoca final se selecciono sobre un holdout *skill-disjoint*, de modo que el split de test nunca se uso para seleccion de hiperparametros.

La innovacion tecnica del repositorio no esta en la arquitectura, sino en el esquema de cuantizacion: pesos cuantizados de forma asimetrica por grupos de 16, con escalas y zero-points almacenados en fp16, replicando la estructura de bloques de GGUF Q4_K/Q8_0. El repositorio publica dos artefactos con propositos distintos: `model.safetensors`, con los valores de-cuantizados de vuelta a fp16 para que cualquier instalacion de `transformers` o `sentence-transformers` lo cargue hoy mismo (ejecuta aritmetica fp32, no kernels enteros), y `model-int3-g16.bin`, el payload empaquetado real de 68.350 MB. El fichero `quantization.json` recoge el layout por tensor para quien quiera escribir un kernel INT real; `query_prefix.json` documenta el contrato de prefijos de consulta.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion densa (pipeline `feature-extraction`).
- Recuperacion de skills o herramientas a partir de una peticion en lenguaje natural, entrenada especificamente para esta tarea.
- Enrutado de herramientas en agentes: dado un catalogo de skills descritas en texto, devuelve un ranking por similitud coseno.
- Ejecucion en CPU y en dispositivos de borde, sin GPU ni servicio remoto.
- Integracion con el ecosistema `sentence-transformers`, con `transformers` y con Text Embeddings Inference (la model card incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`).
- Capacidades multilingues: no. El modelo declara unicamente ingles.
- Tool calling nativo: no. El modelo no genera llamadas a funciones; solo produce embeddings para recuperacion.
- Razonamiento multi-paso, thinking mode, vision o audio: no disponibles.

## Casos de uso

- Enrutado de skills en agentes LLM: antes de que el agente decida que herramienta invocar, el modelo codifica la peticion del usuario y la compara contra el catalogo de skills; con un coste de menos de 70 MB de almacenamiento, el enrutador puede vivir en el mismo proceso que el agente.
- Seleccion de herramientas en function calling: en pipelines con decenas o cientos de funciones registradas, se preseleccionan las k funciones mas similares a la intencion del usuario y solo esas se inyectan en el prompt del LLM, reduciendo el consumo de tokens de contexto.
- Asistentes locales sin conectividad: aplicaciones de escritorio o moviles que necesitan buscar entre sus propias capacidades sin enviar texto del usuario a un servicio de embeddings externo.
- Busqueda semantica en catalogos de plugins o APIs: indexar las descripciones de un marketplace de integraciones y permitir consultas en lenguaje natural sobre ellas.
- Enrutado previo en pipelines RAG multi-agente: decidir que sub-agente o base de conocimiento atiende una consulta antes de ejecutar la recuperacion documental propiamente dicha.
- Deduplicacion y agrupamiento de skills: comparar descripciones entre si para detectar herramientas redundantes o solapadas dentro de un catalogo grande.
- Clasificacion de intencion por similitud: construir clasificadores de intencion zero-shot comparando la consulta con descripciones textuales de cada clase, sin reentrenamiento.
- Filtrado en un sistema de recomendacion de herramientas: ordenar sugerencias de skills para un desarrollador segun la tarea que describe en texto libre.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test publico de `ThakiCloud/SKILLRET` (4.392 consultas / 6.006 skills), metrica NDCG@10:

| Variante | Tamano en disco | NDCG@10 | vs maestro |
|---|---|---|---|
| SKILLRET-Embedding-0.6B (maestro) | 1191,6 MB | 78,48 | — |
| fp16 | 219,0 MB | 79,18 ± 0,42 | 98,0% |
| int8 / g16 | 136,9 MB | 79,18 ± 0,42 | 98,0% |
| int4 / g16 | 82,3 MB | 79,21 ± 0,42 | 98,0% |
| int3 / g16 (este modelo) | 68,6 MB | 78,04 ± 0,44 | 96,6% |

Notas de contexto aportadas por el autor: el error estandar del split es de aproximadamente ±0,45, por lo que diferencias inferiores a 1 punto porcentual no deben interpretarse como ranking. El autor corrige ademas una cifra anterior: la evaluacion del maestro sobre el split actual, bajo el contrato canonico de prefijos de consulta, es 78,48 y no 80,82. Los resultados de variantes int8 e int4 son indistinguibles del fp16 dentro del error estandar; int3 pierde 1,14 puntos porcentuales y es el punto donde la cuantizacion empieza a tener un coste real.

Experimentacion negativa reportada por el autor (resultados que no funcionaron): destilar desde un maestro de 8B en lugar de 0,6B supuso -2,40 pp (brecha de capacidad); la cuantizacion post-entrenamiento a INT2 o ternaria colapso el modelo (aproximadamente 0,1 de NDCG@10, sin que GPTQ ni QuIP lo rescatasen); el minado de negativos duros propio costo -1,0 pp; y una perdida auxiliar de proyeccion LEAF (w=0,3) costo -1,51 pp (t pareada de -7,78).

No se han publicado resultados de benchmarks de terceros (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, ni son aplicables: es un modelo de recuperacion, no generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en todos los formatos. El checkpoint fp16 ocupa 219,0 MB; el payload int3 empaquetado ocupa 68,350 MB. El `safetensors` de este repositorio, al estar de-cuantizado a fp16, se ejecuta con aritmetica fp32.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente. No requiere A100, H100 ni RTX 4090; una GTX 1050 o una iGPU moderna bastan para el modelo completo.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs de consumo de la ultima decada, y tambien en CPU.
- Opciones de despliegue: `sentence-transformers` (via indicada en la model card), `transformers`, y Text Embeddings Inference (el modelo lleva las etiquetas `text-embeddings-inference` y `endpoints_compatible`). La model card menciona `llama.cpp` y ONNX Runtime como destino para ejecutar kernels INT reales sobre el payload empaquetado, pero advierte que esa ruta no esta medida.
- Latencia y throughput: no disponibles. La model card indica que las cifras de latencia que acompanan al modelo se midieron con el camino `safetensors` en aritmetica fp32 y que no corresponden a velocidades de kernels enteros, pero los valores concretos no estan incluidos en la informacion proporcionada.
- Almacenamiento: el repositorio completo ocupa 0,3 GB; el artefacto minimo utilizable en produccion (payload int3) son 68,350 MB.

## Comparativa con modelos similares

No se dispone de datos de modelos de terceros comparables en la informacion proporcionada. La comparacion posible es interna a la familia SKILLRET:

| Modelo | Parametros | Tamano en disco | NDCG@10 | Licencia |
|---|---|---|---|---|
| SKILLRET-Embedding-0.6B (maestro) | ~600 M | 1191,6 MB | 78,48 | Apache-2.0 |
| SKILLRET-Edge-109M fp16 | 109,5 M | 219,0 MB | 79,18 ± 0,42 | Apache-2.0 |
| SKILLRET-Edge-109M int4/g16 | 109,5 M | 82,3 MB | 79,21 ± 0,42 | Apache-2.0 |
| SKILLRET-Edge-109M int3/g16 (este) | 109,5 M | 68,6 MB | 78,04 ± 0,44 | Apache-2.0 |

Frente al maestro, este modelo reduce el tamano en disco aproximadamente 17,4 veces y cede 0,44 puntos de NDCG@10. Frente a las variantes int4 e int8 de si mismo, pierde alrededor de 1,14 puntos porcentuales, en el limite de lo que el autor considera significativo dado el error estandar del split. Comparativas con alternativas externas de recuperacion (por ejemplo, otros bi-encoders pequenos o modelos de embeddings generalistas): no disponible.

## Limitaciones y advertencias

- Solo soporta ingles. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Es un modelo de recuperacion, no generativo: no produce texto, no hace tool calling por si mismo y no razona en multiples pasos. Cualquier expectativa de uso como LLM es incorrecta.
- Contrato de prefijos de consulta: las consultas deben codificarse *sin* prefijo de instruccion (`resolved: ""` en `query_prefix.json`). El autor midio una variacion de +8,84 puntos porcentuales en un mismo checkpoint solo por desajustar el prefijo entre entrenamiento y evaluacion; ese desajuste llego a fabricar un resultado falso en el que la cuantizacion parecia superar al fp16.
- El `model.safetensors` de este repositorio ejecuta aritmetica fp32 sobre valores de-cuantizados, no kernels enteros. El beneficio de velocidad del formato int3 no esta materializado ni medido; solo el ahorro de almacenamiento esta verificado (68,594 MB predichos frente a 68,350 MB en disco, 0,36% de error).
- Discrepancia en las cifras de la propia model card: el texto afirma que el modelo "recupera el 98% de un maestro 26 veces mayor", pero el ratio de tamano en disco es de aproximadamente 17,4x (1191,6 MB / 68,6 MB) y la columna "vs maestro" de la tabla asigna un 96,6% a esta variante int3, no un 98%. Conviene tratar esas cifras con cautela.
- Discrepancia en los splits de evaluacion: la model card de los modelos de referencia de SkillRet reporta un split de 4.997 consultas / 6.660 skills que, segun el autor, no esta en el dataset publicado actualmente (los ficheros publicos son identicos en hash a los de 4.392 / 6.006). No deben convertirse resultados entre ambos.
- Significancia estadistica: el error estandar del split es de aproximadamente ±0,45. Diferencias inferiores a 1 punto porcentual no constituyen un ranking fiable.
- Sensibilidad a la cuantizacion agresiva: INT2 y la cuantizacion ternaria post-entrenamiento provocan un colapso total del modelo (aproximadamente 0,1 de NDCG@10) que GPTQ y QuIP no revierten.
- Riesgo de degradacion por dominio: entrenado y evaluado sobre el dataset `ThakiCloud/SKILLRET`, compuesto por peticiones y descripciones de skills. El comportamiento fuera de ese dominio (por ejemplo, descripciones de herramientas muy tecnicas o jerga de un sector especifico) no esta documentado.
- Traccion minima: el repositorio acumula 10 descargas y 0 likes en el momento de la consulta, con lo que no existe un cuerpo de validacion independiente.
- Licencia Apache-2.0, heredada del modelo base, sin restricciones conocidas para uso comercial. Conviene verificar igualmente la licencia del maestro `SKILLRET-Embedding-0.6B` en su propio repositorio.
- Uso de memoria en produccion: el `max_length` de evaluacion es 256 tokens. Documentos o peticiones mas largos quedan truncados sin que la model card documente el impacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/SKILLRET-Edge-109M-int3
- Modelo base (no cuantizado): https://huggingface.co/ThakiCloud/SKILLRET-Edge-109M
- Modelo maestro de destilacion: https://huggingface.co/ThakiCloud/SKILLRET-Embedding-0.6B
- Dataset de evaluacion y entrenamiento: https://huggingface.co/datasets/ThakiCloud/SKILLRET
- Paper del benchmark SkillRet: https://arxiv.org/abs/2605.05726
- Ficheros auxiliares dentro del repositorio: `query_prefix.json` (contrato de prefijos de consulta) y `quantization.json` (layout de cuantizacion por tensor)
