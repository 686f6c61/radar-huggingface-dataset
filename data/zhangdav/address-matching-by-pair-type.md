# zhangdav/address-matching-by-pair-type

## Resumen

`zhangdav/address-matching-by-pair-type` es un repositorio de pesos entrenados que acompaña al articulo del autor sobre *address matching* (emparejamiento de direcciones postales) como tarea de resolucion de entidades. Dado un par de cadenas de direccion, cada modelo devuelve un logit que indica si ambas se refieren a la misma ubicacion fisica. El repositorio agrupa cuatro familias de arquitecturas comparadas bajo un protocolo de entrenamiento identico: una siamesa BiLSTM a nivel de caracter, una ESIM clasica con vectores de palabra congelados y dos variantes de DistilBERT (bi-encoder y cross-encoder), cada una con tres semillas.

El interes tecnico esta en que no se publica un unico modelo, sino un conjunto controlado de ejecuciones que permite reproducir las tablas del articulo y comparar enfoques neuronales frente a modelos de arbol en la misma tarea. Los pesos DistilBERT se afinan desde `distilbert-base-uncased` (66 M de parametros, transformer encoder de 6 capas, contexto nominal de 512 tokens), mientras que las variantes siamesa y ESIM son modelos ligeros definidos en el repositorio de GitHub del autor.

Es relevante ahora porque aborda un problema de calidad de datos muy concreto en pipelines geoespaciales (deduplicacion de POIs, geocodificacion, consolidacion de registros) y lo hace con un dataset derivado de Overture Maps Places y Foursquare Open Source Places. El hallazgo principal del autor, segun la model card, es que los modelos neuronales ordenan mal los pares en los que falta el numero de portal en uno de los lados, un caso frecuente en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro familias: siamesa BiLSTM a nivel de caracter; ESIM (BiLSTM + soft alignment); DistilBERT bi-encoder; DistilBERT cross-encoder |
| Parametros totales | DistilBERT: 66 M (modelo base `distilbert-base-uncased`); siamesa y ESIM: no disponible en detalle |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens para las variantes DistilBERT (limite de `distilbert-base-uncased`); siamesa y ESIM: no disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos `safetensors` en precision de entrenamiento) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT (pesos); modelo base DistilBERT bajo Apache 2.0; datos de entrenamiento bajo CDLA Permissive 2.0 / Apache 2.0 |
| Formato de pesos | `safetensors` (`model.safetensors` + `config.json` por ejecucion) |

## Arquitectura y entrenamiento

La siamesa procesa cada direccion con embeddings de caracter de dimension 32, una BiLSTM de 1 capa y 128 unidades ocultas y pooling mean o max; la cabeza clasificadora opera sobre la concatenacion `[|u−v|; u⊙v]`. La ESIM parte de vectores de palabra congelados (word2vec o fastText), pasa por una BiLSTM de 200, aplica alineamiento suave entre las dos secuencias, otra BiLSTM de 200, concatenacion de pooling mean y max, y un MLP de 200. Las variantes ESIM exploran cinco configuraciones de vocabulario: `min_count` 2 (reproduccion), `min_count` 1, fastText `min_count` 1, word2vec `min_count` 2 con vector aleatorio fijo para palabras raras (la configuracion conservada) y concatenacion `[word2vec; fastText]`.

Las dos variantes DistilBERT difieren en el regimen de codificacion: el bi-encoder codifica cada direccion por separado con masked mean pooling y aplica la misma cabeza `[|u−v|; u⊙v]`; el cross-encoder concatena `[CLS] A [SEP] B [SEP]` y usa masked mean + max pooling con un MLP de 200. Todas las ejecuciones comparten protocolo: entropia cruzada binaria sobre el split de entrenamiento `case2s`, seleccion de la mejor epoca por maximo de coincidencias no identicas en validacion sujeto a rechazar al menos el 98 % de los pares de caso 1, early stopping y umbral fijo de 0,5. Cada carpeta contiene tres semillas (0, 1, 2) salvo la siamesa, que solo incluye la semilla 0. La tabla de embeddings congelados de ESIM forma parte del `state_dict`, de modo que no se necesitan ficheros de vectores externos. No se documenta el volumen de tokens de entrenamiento ni si hubo RLHF o DPO; al ser una tarea de clasificacion supervisada, no se aplican.

## Capacidades

- Clasificacion binaria de pares de direcciones: devuelve `P(misma ubicacion)` tras aplicar sigmoide al logit.
- Resolucion de entidades a nivel de edificio, ignorando unidades (pisos, apartamentos).
- Deteccion de variaciones tipograficas y abreviaturas (`ST` frente a `STREET`).
- Comparacion de cadenas con numeros de portal potencialmente discordantes (con peor rendimiento cuando falta el numero en un lado).
- Codificacion de direcciones individuales en las variantes bi-encoder, util para precomputar embeddings y busqueda por similitud.
- Atencion cruzada entre las dos direcciones en las variantes cross-encoder y ESIM.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles; no se documenta entrenamiento en otros idiomas.
- No se ha evaluado en un escenario de recuperacion de candidatos (candidate retrieval).

## Casos de uso

- Deduplicacion de puntos de interes: alimentar pares de registros de Overture y Foursquare al cross-encoder DistilBERT para decidir si son el mismo establecimiento antes de consolidar una base de datos geoespacial.
- Geocodificacion inversa asistida: dado un par (direccion declarada por el usuario, direccion canonica de una base de datos), usar la probabilidad de coincidencia para aceptar, revisar o rechazar el candidato devuelto por el geocidador.
- Enriquecimiento de CRM inmobiliario: comparar direcciones introducidas manualmente por agentes con la direccion fiscal normalizada y marcar discrepancias para revision humana.
- Precomputacion de embeddings de direcciones: con el bi-encoder, indexar todas las direcciones de un catalogo y resolver consultas por similitud vectorial antes de una verificacion fina con el cross-encoder.
- Validacion en pipelines de ingesta: ejecutar el clasificador como filtro previo a la escritura en el data warehouse, rechazando pares por debajo de 0,5 y derivando los que caen en zona gris a un paso de revision.
- Analisis de calidad de datos: usar las predicciones publicadas en `predictions/` junto con `results/paper_tables.ipynb` para auditar la tasa de falsos positivos y falsos negativos de cada arquitectura sobre el split de test antes de elegir una en produccion.
- Investigacion comparativa de arquitecturas: reentrenar o reutilizar las ejecuciones con tres semillas para estudiar varianza entre inicializaciones en tareas de emparejamiento de texto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas del articulo, reproducibles desde `results/paper_tables.ipynb` del repositorio de GitHub, pero no incluye cifras numericas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: las variantes DistilBERT (66 M de parametros) caben holgadamente en menos de 1 GB en fp32 para inferencia por lotes pequenos; la siamesa y ESIM son aun mas ligeras, aunque sus tamanos exactos no estan documentados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; A100 o H100 solo serian necesarias para entrenamiento a gran escala o inferencia de altísimo throughput.
- Cabe en GPU consumer: si, en todas las variantes.
- Opciones de despliegue: el repositorio se distribuye como `state_dict` de PyTorch, por lo que la via natural es cargarlo con el codigo de `helpers/released.py` del repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; al no ser un modelo generativo, esos runners no aplican directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zhangdav/address-matching-by-pair-type` (cross-encoder) | 66 M (DistilBERT) | 512 tokens | Clasificacion de pares de direcciones | MIT | Hugging Face + GitHub |
| `zhangdav/address-matching-by-pair-type` (bi-encoder) | 66 M (DistilBERT) | 512 tokens | Codificacion + clasificacion de pares | MIT | Hugging Face + GitHub |
| `zhangdav/address-matching-by-pair-type` (ESIM) | No disponible | No disponible | Clasificacion de pares con alineamiento | MIT | Hugging Face + GitHub |
| `distilbert-base-uncased` | 66 M | 512 tokens | Modelo base generico | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo con otros modelos de resolucion de entidades en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado exclusivamente con direcciones de Connecticut (EE. UU.); la generalizacion a otras regiones o formatos postales no esta validada.
- Etiquetas derivadas del emparejamiento propio de Overture con Foursquare, lo que puede heredar sesgos y errores de esa fuente.
- Nivel de edificio: las unidades (pisos, apartamentos, locales) se ignoran, de modo que direcciones distintas dentro del mismo edificio se consideran coincidentes.
- Rendimiento pobre cuando falta el numero de portal en uno de los lados, segun el hallazgo principal del autor; es el caso de uso mas frecuente en produccion.
- No evaluado en recuperacion de candidatos, por lo que su uso como filtro previo en pipelines de matching no esta respaldado por resultados.
- Solo ingles; no hay evidencia de comportamiento con direcciones en otros idiomas o alfabetos.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si de falsos positivos con alta confianza en pares tipograficamente parecidos.
- Licencia MIT en los pesos, pero el uso comercial debe respetar tambien las condiciones de atribucion de Overture Maps Places y Foursquare Open Source Places para los datos derivados.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay validacion comunitaria ni issues reportados.
- El repositorio pesa 1,8 GB por acumular todas las ejecuciones y predicciones; no conviene descargarlo completo si solo se necesita una variante.

## Enlaces

- Hugging Face: https://huggingface.co/zhangdav/address-matching-by-pair-type
- Dataset: https://huggingface.co/datasets/zhangdav/address-matching-by-pair-type
- Codigo, definiciones de modelo y tablas del articulo: https://github.com/DZhang3210/address-matching-by-pair-type
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Atribucion de Overture Maps: https://docs.overturemaps.org/attribution
- Articulo: referencia no disponible en la informacion proporcionada
