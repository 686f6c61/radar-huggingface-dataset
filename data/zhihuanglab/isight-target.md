# zhihuanglab/iSight-target

## Resumen

iSight-target es un modelo de seleccion de celulas de interes en imagenes de inmunohistoquimica (IHC). Dado el conjunto de celulas ya segmentadas de una imagen y la clase tejido x tipo celular de esa imagen, el modelo decide cuales de esas celulas son las relevantes para el analisis (celulas tumorales en un carcinoma, hepatocitos en higado, etc.). Lo desarrolla el grupo zhihuanglab (Zhi Huang, Penn Medicine) y forma parte del pipeline iSight, en el que el modulo complementario iSight-cell puntua despues las celulas seleccionadas.

Tecnicamente no es un modelo de lenguaje ni un modelo generativo: es un clasificador binario por clase construido sobre el backbone de patologia UNI2-h, con una cabeza binaria independiente por cada una de las 43 clases definidas en `meta/classes_43.csv`. Esto lo situa en la categoria de modelos de vision para patologia computacional orientados a tareas de celula unica, no en la de asistentes multimodales.

Su relevancia es de nicho pero concreta: automatiza un paso (la seleccion de la poblacion celular diana) que en los flujos de patologia digital suele hacerse con reglas heuristicas o revision manual, y lo hace de forma agnostica al tejido mediante un esquema de 43 clases. La adopcion publica es todavia nula segun los datos de HuggingFace (0 descargas, 0 likes) y la licencia es exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone UNI2-h (modelo fundacional de patologia) con 43 cabezas de clasificacion binaria, una por clase |
| Parametros totales | no disponible en la informacion proporcionada; el repositorio ocupa 5,5 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; procesa celulas segmentadas de una imagen IHC) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision); las etiquetas de clase de `meta/classes_43.csv` estan en ingles |
| Licencia | PENN Academic Software License Agreement (identificador `other`, `license_name: penn-academic-software-license`); solo uso de investigacion no comercial |
| Formato de pesos | PyTorch: `checkpoints/iSight-target.pt` (state dict del modelo), acompanado de `config.json` y `meta/classes_43.csv` |
| Tarea | Seleccion de celulas diana a nivel de celula en imagenes de inmunohistoquimica |
| Entrada | Conjunto de celulas segmentadas de una imagen IHC mas la clase tejido x tipo celular de la imagen |
| Salida | Decision binaria por clase (43 clases) sobre que celulas son la poblacion de interes |
| Tamano del repositorio | 5,5 GB |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion / ultima actualizacion | 2026-09-12 / 2026-09-19 |

## Arquitectura y entrenamiento

El modelo se construye sobre UNI2-h, un backbone de tipo Vision Transformer entrenado con datos de patologia, y anade 43 cabezas binarias, una por cada clase del catalogo `meta/classes_43.csv`. Cada clase se define como una combinacion de tejido y tipo celular (`cls43`, `head_idx`, `tissue`, `cell_type`), de modo que el mismo backbone se reutiliza para decidir, por ejemplo, que celulas de una imagen de carcinoma son tumorales o que celulas de una muestra hepatica son hepatocitos. El diseno desacopla la representacion visual (backbone compartido) de la decision por clase (cabezas independientes), lo que permite anadir o tratar clases de forma individual sin reentrenar todo el sistema.

La distribucion se limita a los pesos (`checkpoints/iSight-target.pt`, unicamente el state dict), la configuracion (`config.json`, que debe descargarse junto al checkpoint) y el fichero de definicion de clases. El codigo de inferencia vive en el repositorio de GitHub del proyecto, en `isight_cell/target_cell/` y en `isight_cell/code/pipeline/select_target_v2.py`. No se ha publicado informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion como RLHF o DPO (poco aplicables a este tipo de modelo), ni sobre innovaciones de decodificacion o atencion.

## Capacidades

- Clasificacion binaria a nivel de celula para 43 clases tejido x tipo celular definidas en `meta/classes_43.csv`.
- Seleccion de la poblacion celular de interes dentro de un conjunto de celulas ya segmentadas de una imagen IHC.
- Generalizacion entre tejidos mediante el esquema de clases: carcinoma, higado y otros tejidos cubiertos por el catalogo.
- Integracion en un pipeline de dos etapas junto a iSight-cell, que puntua las celulas seleccionadas por iSight-target.
- Consumo de celulas previamente segmentadas, por lo que depende de un modulo de segmentacion externo (no incluido en la informacion disponible).
- Reutilizacion del backbone UNI2-h, con la representacion visual compartida entre todas las cabezas.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, capacidades de agente, multilingues ni modo de razonamiento explicito.

## Casos de uso

- Seleccion de celulas tumorales en estudios de carcinoma: tras segmentar una imagen IHC, el modelo marca que celulas corresponden a la clase tumoral de esa combinacion tejido x tipo celular, lo que permite calcular densidades tumorales sin definir umbrales morfologicos ad hoc.
- Cuantificacion de hepatocitos en biopsias hepaticas: usando la clase de higado del catalogo, el modelo ailsa la poblacion de hepatocitos para analisis de area o intensidad de tincion por celula.
- Pipeline de patologia computacional de dos etapas: iSight-target filtra las celulas relevantes y iSight-cell las puntua despues; el resultado es un flujo encadenado que evita puntuar celulas irrelevantes (estroma, linfocitos, artefactos) y reduce coste de computo.
- Investigacion traslacional sobre cohortes retrospectivas: al ser agnostico al tejido dentro de las 43 clases, permite procesar lotes heterogeneos de laminas con una sola invocacion por imagen mas su clase, en lugar de mantener un modelo por tejido.
- Control de calidad y anotacion asistida: las selecciones del modelo pueden usarse como preanotacion para revisores humanos, que corrigen los casos dudosos en lugar de etiquetar desde cero.
- Analisis del microambiente tumoral: la separacion explicita entre celulas de interes y resto facilita calcular proporciones y vecindades entre la poblacion diana y otras poblaciones celulares dentro de la misma imagen.
- Estandarizacion de metricas entre laboratorios: al fijar una definicion unica por clase (catalogo de 43 entradas), los estudios multicentro pueden aplicar el mismo criterio de seleccion celular sobre sus laminas.
- Experimentacion academica con modelos fundacionales de patologia: al distribuirse el state dict y la configuracion, el modelo sirve como punto de partida para fine-tuning o para estudiar el comportamiento de un backbone UNI2-h con cabezas multiples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio completo ocupa 5,5 GB y los pesos se distribuyen como state dict de PyTorch en `checkpoints/iSight-target.pt`; el consumo real dependera de la precision de carga, del tamano del lote de celulas y de las activaciones del backbone UNI2-h.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el perfil del backbone (modelo fundacional de vision de patologia) es razonable esperar GPUs de gama profesional con memoria suficiente para el checkpoint completo, si bien no hay datos publicados que lo confirmen.
- GPU de consumo: no confirmado. No hay datos publicados sobre si el modelo cabe en GPUs de consumo tipo RTX 4090 u otras; habria que medir el consumo real de memoria al cargar el checkpoint.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo). El uso previsto es mediante el codigo de `isight_cell/target_cell/` y `isight_cell/code/pipeline/select_target_v2.py` del repositorio de GitHub, cargando el state dict con PyTorch.
- Latencia y throughput: no disponibles.
- Requisito adicional: el sistema necesita un paso previo de segmentacion celular que no forma parte de este modelo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks, parametros ni contexto de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iSight-target | no disponible | no aplica | sin benchmarks publicados | PENN Academic Software License (solo investigacion no comercial) | HuggingFace, 0 descargas |
| Alternativas de la misma categoria | no disponible | no aplica | no disponible | no disponible | no disponible |

El unico modelo relacionado identificado en la informacion es iSight-cell, del mismo autor, que no compite con iSight-target sino que lo complementa: iSight-cell puntua las celulas que iSight-target ha seleccionado previamente.

## Limitaciones y advertencias

- Licencia restrictiva: la PENN Academic Software License Agreement limita el uso a investigacion no comercial; no se permite uso comercial sin acuerdo adicional con el titular.
- No es un modelo de proposito general: solo resuelve la seleccion de celulas diana en imagenes IHC ya segmentadas; no hace generacion de texto, razonamiento, codigo ni vision general.
- Dependencia de un segmentador externo: la calidad de la seleccion depende por completo de la segmentacion celular previa, que no se distribuye con este modelo.
- Cobertura limitada al catalogo de clases: el comportamiento fuera de las 43 clases de `meta/classes_43.csv` no esta documentado.
- Ausencia total de benchmarks publicados: no hay metricas verificables de precision, sensibilidad o especificidad sobre las que basar una decision de produccion.
- Adopcion nula y mantenimiento incierto: 0 descargas y 0 likes en HuggingFace, con creacion y ultima actualizacion en septiembre de 2026; no hay evidencia de uso en terceros.
- Riesgo de falsos positivos y falsos negativos: al ser cabezas binarias por clase, los errores de clasificacion afectan directamente a cualquier metrica derivada (densidad celular, ratios, indices de microambiente); se recomienda validacion local antes de usar resultados en decisiones clinicas.
- Sesgos potenciales heredados del backbone UNI2-h y de los datos con los que se entrenaron las cabezas, no documentados en la informacion disponible.
- Requisito de descargar `config.json` junto con el checkpoint: el repositorio solo incluye el state dict, por lo que omitir la configuracion impide reconstruir el modelo correctamente.
- No apto para uso clinico directo: se trata de una herramienta de investigacion, no de un producto diagnostico regulado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhihuanglab/iSight-target
- Modelo complementario (puntuacion celular): https://huggingface.co/zhihuanglab/iSight-cell
- Codigo del proyecto: https://github.com/zhihuanglab/iSight
- Ruta del codigo de seleccion de celulas diana: `isight_cell/target_cell/` e `isight_cell/code/pipeline/select_target_v2.py` en el repositorio anterior
- Licencia: https://huggingface.co/zhihuanglab/iSight-target/blob/main/LICENSE
- Fichero de definicion de clases: https://huggingface.co/zhihuanglab/iSight-target/blob/main/meta/classes_43.csv
- Contacto: zhi.huang@pennmedicine.upenn.edu
- Resultados de busqueda web: los enlaces devueltos por la busqueda no guardan relacion con el modelo (contenido generico sobre citas del dia), por lo que no se ha podido extraer informacion adicional, papers ni demos.
