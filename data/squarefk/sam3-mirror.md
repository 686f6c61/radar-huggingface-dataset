# squarefk/sam3-mirror

## Resumen

`squarefk/sam3-mirror` es un espejo (mirror) no oficial del checkpoint `sam3.pt` de Meta para SAM 3, publicado en HuggingFace por el usuario `squarefk`. No se trata de un modelo nuevo ni de un fine-tuning: el autor declara explicitamente que los pesos no han sido modificados ("Modifications to weights: None") y que el repositorio no constituye un lanzamiento oficial ni un aval de Meta. El objetivo del repositorio es permitir la inferencia local de segmentacion de imagenes en un punto concreto del tiempo, con un snapshot fijado el 14 de octubre de 2026.

El repositorio ocupa 3,5 GB y contiene un unico checkpoint PyTorch (`sam3.pt`, 3.450.062.241 bytes) con hash SHA-256 documentado, lo que permite verificar la integridad de la descarga frente al peso original alojado en `facebook/sam3`. La model card indica que el archivo debe usarse con el codigo upstream de SAM 3 y su procesador de imagenes, y advierte de que un fichero `.pt` no es un directorio `save_pretrained`, por lo que los ejemplos genericos de Transformers del Hub no son aplicables.

Su relevancia es practica: sirve como copia fijada y verificable de un checkpoint que puede cambiar en el repositorio oficial, util para reproducibilidad en investigacion y para despliegues que necesitan una revision concreta de pesos. No incluye datos de arquitectura, entrenamiento, benchmarks ni requisitos de hardware en la informacion disponible, y la busqueda web realizada no aporto ninguna fuente tecnica relacionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo distribuye el checkpoint; remite al codigo upstream de SAM 3) |
| Parametros totales | no disponible (no declarado en la model card) |
| Parametros activos | no aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de segmentacion de imagenes, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un unico checkpoint PyTorch sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la ficha del Hub no declara idiomas; la funcionalidad es vision) |
| Licencia | SAM License (`license: other`, `license_name: sam-license`), version del 19 de noviembre de 2025, incluida en el repositorio como `LICENSE` |
| Formato de pesos | PyTorch `.pt` (checkpoint original upstream, no directorio `save_pretrained`) |

Datos adicionales verificables del repositorio:

| Campo | Valor |
|---|---|
| Modelo original | facebook/sam3 |
| Revision de pesos original | 3c879f39826c281e95690f02c7821c4de09afae7 |
| Fichero | sam3.pt |
| Tamano del fichero | 3.450.062.241 bytes |
| SHA-256 | 9999e2341ceef5e136daa386eecb55cb414446a00ac2b55eb2dfd2f7c3cf8c9e |
| Fuente upstream probada | facebookresearch/sam3, revision 660a5e9e1b8b4c02c0ad97229b88a09a6e4ff5b7 |
| Modificaciones de pesos | ninguna |
| Tamano del repo | 3,5 GB |
| Pipeline | mask-generation |
| Libreria | sam3 |
| Descargas / likes | 0 / 0 |
| Region | us |

## Arquitectura y entrenamiento

La informacion proporcionada no documenta la arquitectura interna del modelo, el numero de parametros, el volumen de datos de entrenamiento, la composicion del dataset ni si hubo fases de ajuste con RLHF, DPO u otras tecnicas. La model card del espejo se limita a indicar que se trata de la funcionalidad de segmentacion de imagenes y que el checkpoint debe ejecutarse con el codigo upstream de SAM 3 y su procesador de imagenes. Cualquier afirmacion sobre el diseno de red (transformer de vision, encoder-decoder, mecanismo de prompts, atencion) requeriria consultar la documentacion y el paper oficiales de SAM 3, que no forman parte del material facilitado.

La unica innovacion tecnica constatable en este repositorio es de tipo procedimental, no de modelado: la publicacion de un snapshot pinneado con hash SHA-256 y la referencia cruzada a la revision exacta del codigo fuente upstream, lo que permite reproducir una combinacion concreta de pesos y codigo. El autor advierte de que el espejo no se actualiza automaticamente y de que, para versiones nuevas, hay que consultar los anuncios upstream y el historial de pesos, comparando tanto los hashes como las revisiones de codigo.

## Capacidades

- Segmentacion de imagenes y generacion de mascaras: es la funcionalidad declarada en el pipeline (`mask-generation`) y en la propia model card ("Model functionality is image segmentation, not image generation").
- Inferencia local: el checkpoint esta pensado para ejecutarse en local con el codigo upstream de SAM 3.
- Integridad verificable: el hash SHA-256 publicado permite comprobar que el fichero descargado coincide byte a byte con el peso original referenciado.
- Reproducibilidad por revision fija: permite fijar una revision concreta de pesos en lugar de depender de la version mas reciente del repositorio oficial.
- Generacion de texto, razonamiento, codigo, matematicas, vision multimodal, audio, tool calling, function calling, agentes y razonamiento multi-paso: no disponibles; el material no indica que el modelo ofrezca ninguna de estas capacidades.
- Modo thinking, soporte multilingue y cualquier capacidad especial adicional: no disponible en la informacion proporcionada.

## Casos de uso

- Anotacion y etiquetado de datasets de vision por computador: el modelo se puede ejecutar en local para generar mascaras sobre imagenes y usarlas como preanotacion que despues revisa un anotador humano, reduciendo el coste por imagen en proyectos de deteccion y segmentacion.
- Rotoscopia y recorte de objetos en produccion audiovisual: al ejecutarse sobre un checkpoint fijo y verificable, encaja en pipelines de postproduccion que necesitan resultados reproducibles entre ejecuciones y entre maquinas.
- Verificacion de integridad en investigacion: equipos que publican resultados deben citar una revision exacta de pesos; este espejo permite fijar el hash SHA-256 y la revision del codigo upstream, evitando que una actualizacion silenciosa del repositorio oficial invalide la reproducibilidad.
- Despliegue en entornos sin acceso continuo al Hub: el snapshot se puede copiar a un almacenamiento interno o a una maquina aislada y usarse con el codigo upstream, sin depender de la disponibilidad del repositorio original.
- Preprocesado en pipelines de vision industrial: generacion de mascaras para delimitar regiones de interes antes de un clasificador de defectos; requiere validacion especifica por dominio, porque no hay metricas publicadas en la informacion disponible.
- Teledeteccion y analisis de imagenes aereas: delimitacion de objetos o regiones sobre imagenes de gran resolucion como etapa previa a conteo o medicion, siempre que se valide el rendimiento en ese dominio concreto.
- Prototipado academico con licencia SAM: uso docente o de investigacion con atribucion, respetando los terminos de la SAM License y sus restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye cifras de mIoU, AP de mascaras ni comparativas con otros modelos, y la busqueda web realizada no devolvio ningun resultado relacionado con SAM 3 (los resultados obtenidos correspondian a articulos sobre legumbres y no guardan relacion con el modelo). No se dispone por tanto de datos verificables de calidad ni de latencia.

## Requisitos de hardware

- Tamano de pesos en disco: 3.450.062.241 bytes (aproximadamente 3,21 GiB) para el unico fichero `sam3.pt`.
- VRAM estimada: no disponible de forma oficial. Como referencia de calculo, cargar 3,21 GiB de pesos en precision de 32 bits exige al menos esa cantidad de memoria dedicada, mas la memoria de activaciones y del procesador de imagenes; en precision de 16 bits la huella de pesos se reduciria aproximadamente a la mitad. Estas cifras son una estimacion derivada del tamano de fichero, no un requisito publicado.
- GPU recomendadas: no disponibles en la informacion proporcionada. No hay datos que permitan afirmar compatibilidad con modelos concretos (A100, H100, RTX 4090 u otros).
- Viabilidad en GPU de consumo: no confirmada. Por el tamano del checkpoint (3,21 GiB) es plausible en GPUs de consumo con suficiente VRAM, pero la model card no lo garantiza y el consumo real depende de la resolucion de entrada y de la precision de carga.
- Opciones de despliegue: segun la model card, unicamente el codigo upstream de SAM 3 con su procesador de imagenes. El fichero `.pt` no es un directorio `save_pretrained`, por lo que no se deben asumir los ejemplos genericos de Transformers del Hub. No hay informacion sobre compatibilidad con vLLM, TGI, llama.cpp, Ollama ni formatos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| squarefk/sam3-mirror | no disponible | no aplica | no disponible | SAM License (sin relicencia) | HuggingFace, mirror no oficial, no se actualiza automaticamente |
| facebook/sam3 (original) | no disponible | no aplica | no disponible | SAM License | HuggingFace, repositorio oficial, puede cambiar de revision |
| Otras alternativas de segmentacion de imagenes | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

Unicamente es posible comparar el espejo con el repositorio original: comparten pesos identicos, pero difieren en gobernanza (oficial frente a no oficial), en actualizacion (el oficial evoluciona; el espejo es un snapshot fijado) y en trazabilidad (el espejo documenta hash SHA-256 y revision de codigo probada). No se dispone de datos de rendimiento de ninguno de los dos.

## Limitaciones y advertencias

- No es un lanzamiento oficial: el repositorio lo mantiene `squarefk`, no Meta, y no implica aval ni soporte del autor original.
- Desactualizacion garantizada: el espejo no se actualiza automaticamente; para versiones nuevas hay que consultar los anuncios y el historial de pesos upstream.
- Integridad no garantizada por el propio repositorio: la verificacion depende de que el usuario compare el SHA-256 publicado con el fichero descargado.
- Licencia restrictiva: los pesos se rigen por la SAM License (ultima actualizacion del 19 de noviembre de 2025). No es una relicencia MIT ni Apache-2.0; la seccion 1(a) concede derechos de redistribucion y la 1(b)(i) exige redistribuir bajo ese mismo acuerdo con una copia del mismo.
- Usos prohibidos: la seccion 1(b)(v) prohibe usos militares, de guerra, espionaje, armas y otros usos finales prohibidos. El acceso publico no elimina estas restricciones.
- Obligaciones adicionales: atribucion en investigacion, privacidad y controles de comercio. Revisar la licencia completa antes de usar o redistribuir.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la ficha, por lo que no existe evidencia de uso en produccion ni de problemas reportados por terceros.
- Formato de pesos incompatible con flujos estandar: el `.pt` no es un directorio `save_pretrained`; los ejemplos genericos de Transformers no son aplicables y se requiere el codigo upstream.
- Ausencia total de datos de rendimiento: no hay benchmarks, tasas de error, ni evaluacion de sesgos; no se puede estimar la calidad de las mascaras ni su comportamiento en dominios alejados del entrenamiento.
- Riesgo de error en la segmentacion: al no publicarse metricas, cualquier despliegue en produccion debe acompanarse de una evaluacion propia en el dominio objetivo; no hay informacion sobre falsos positivos, mascaras fragmentadas o fallos en objetos pequenos.
- Restriccion regional: el repositorio esta etiquetado con `region: us`, lo que puede condicionar su disponibilidad o su tratamiento legal en otras jurisdicciones.
- Aclaracion funcional: el modelo hace segmentacion, no generacion de imagenes; cualquier expectativa de sintesis de contenido es incorrecta.
- Idiomas: sin datos. No aplica en el sentido linguistico, pero tampoco hay informacion sobre sesgos demograficos o geograficos en los datos de entrenamiento.

## Enlaces

- Repositorio del espejo: https://huggingface.co/squarefk/sam3-mirror
- Modelo original: https://huggingface.co/facebook/sam3
- Revision de pesos original: https://huggingface.co/facebook/sam3/blob/3c879f39826c281e95690f02c7821c4de09afae7/sam3.pt
- Codigo upstream de SAM 3: https://github.com/facebookresearch/sam3
- Revision de codigo probada: https://github.com/facebookresearch/sam3/tree/660a5e9e1b8b4c02c0ad97229b88a09a6e4ff5b7
- Anuncios y ultimas actualizaciones upstream: https://github.com/facebookresearch/sam3#latest-updates
- Historial de pesos del modelo original: https://huggingface.co/facebook/sam3/commits/main
- Licencia SAM incluida en el repositorio: fichero `LICENSE` dentro de https://huggingface.co/squarefk/sam3-mirror
- Resultados de busqueda web: ninguno relevante. Las consultas devolvieron unicamente articulos sobre el haricot kulthi (horse gram, Macrotyloma uniflorum), sin relacion con el modelo.
