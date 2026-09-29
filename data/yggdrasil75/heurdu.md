# yggdrasil75/HEURDU

## Resumen

HEURDU es un modelo publicado en Hugging Face por el usuario yggdrasil75 bajo el identificador `yggdrasil75/HEURDU`, con la etiqueta de pipeline `image-feature-extraction` y licencia Apache 2.0. Segun la propia model card, se trata de un "duplicate heuristic mapper" cuyo objetivo no es detectar imagenes exactamente identicas, sino pares de imagenes muy parecidas en las que existen diferencias minimas: por ejemplo, una misma imagen recomprimida como JPEG con perdida frente a un recorte de un pixel. El modelo pretende localizar y senalar esas diferencias en lugar de comparar byte a byte.

El problema que aborda es relevante en la gestion de bibliotecas de imagenes grandes, donde la deteccion de duplicados exactos esta resuelta mediante hashes criptograficos, pero los casi duplicados generan falsos negativos y obligan a revision manual. La propuesta del autor es un mapeador heuristico que acelera ese cribado. El modelo se distribuye con un tamano de repositorio de 0,1 GB y, en el momento de la consulta, acumula 0 descargas y 0 likes.

La informacion publica es muy limitada: no se documentan arquitectura, numero de parametros, longitud de contexto, idiomas soportados, composicion del dataset de entrenamiento ni resultados de benchmarks. El autor indica que el modelo solo es utilizable a traves de su proyecto `customimagemanager` en GitHub y que se trata de una version no definitiva, entrenada principalmente con fotografias de la vida real, con planes de ampliar el dataset a dominios como el anime en versiones futuras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no aplica / no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio ocupa 0,1 GB; no se especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no describe el tipo de red, el numero de parametros, la resolucion de entrada ni el espacio de embeddings empleado. La etiqueta de pipeline de Hugging Face (`image-feature-extraction`) indica unicamente que la salida esperada es un vector de caracteristicas de imagen, pero no permite deducir si se trata de una CNN, un transformer visual, un modelo hibrido o un algoritmo de hashing perceptual empaquetado como modelo.

Respecto al entrenamiento, el autor afirma que los datos provienen de "fotografias aleatorias de uso publico obtenidas de internet", sin especificar volumen, resolucion, licencias de origen ni numero de pasos o tokens. No se menciona el uso de RLHF, DPO ni ninguna otra fase de ajuste. La unica innovacion tecnica declarada es el enfoque heuristico: en lugar de calcular diferencias byte a byte entre ficheros, el modelo intenta identificar diferencias perceptivas minimas entre imagenes casi identicas, incluyendo casos de recompresion JPEG con perdida y recortes de un solo pixel. El autor indica ademas que existen varias tallas del modelo (menciona "medium" y "xxl" como las mas relevantes), sin detallar sus especificaciones.

## Capacidades

- Extraccion de caracteristicas de imagen para comparacion de similitud, segun la etiqueta de pipeline declarada.
- Deteccion de imagenes casi duplicadas que no son identicas a nivel de bytes: recompresiones JPEG con perdida, recortes minimos (por ejemplo, de un pixel) y presumiblemente otras transformaciones leves.
- Senalizacion de las diferencias concretas entre dos imagenes similares, en lugar de limitarse a devolver un valor booleano de coincidencia.
- Cribado previo en bibliotecas de imagenes grandes, orientado a acelerar la deteccion de duplicados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision general, audio): no disponible. El unico dominio declarado es la comparacion de imagenes, con entrenamiento centrado en fotografia real.

## Casos de uso

- Deduplicacion de fototecas personales: el modelo puede cribar bibliotecas con miles de imagenes para localizar versiones recomprimidas o recortadas de la misma fotografia, reduciendo el numero de comparaciones exactas que hay que ejecutar despues.
- Limpieza de repositorios de imagenes en equipos de diseno: permite detectar variantes de un mismo recurso grafico que han sufrido recompresion o recortes al pasar por distintas herramientas, y agruparlas para su revision.
- Curaduria de datasets de vision artificial: antes de entrenar un modelo, ayuda a identificar imagenes casi identicas que introducirian fuga de datos (data leakage) entre los conjuntos de entrenamiento y validacion.
- Moderacion de contenido duplicado en plataformas: sirve como primera fase de un pipeline que detecta republicaciones de la misma imagen con pequenas modificaciones para evadir filtros de duplicado exacto.
- Verificacion de integridad en flujos de publicacion: permite comprobar si una imagen entregada por un proveedor es una version recomprimida o recortada de otra ya recibida, sin depender de comparaciones de hash.
- Gestion de archivos en sistemas de almacenamiento: reduce el espacio ocupado identificando copias casi identicas antes de aplicar politicas de retencion o borrado.
- Automatizacion integrada en `customimagemanager`: segun el autor, este es el unico uso soportado actualmente, de modo que la integracion practica pasa por ese proyecto en GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, tasa de falsos positivos, tiempo de inferencia ni comparaciones cuantitativas con otras tecnicas de deteccion de casi duplicados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, lo que sugiere un artefacto de pesos muy pequeno y, por tanto, una huella de memoria reducida, pero se trata de una inferencia a partir del tamano del repositorio y no de un dato confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamano del repositorio, es plausible que funcione en CPU o en GPU de gama de entrada, pero no hay especificacion oficial.
- Opciones de despliegue: el autor indica que el modelo solo es utilizable a traves de `https://github.com/yggdrasil75/customimagemanager`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, lo cual es esperable al no tratarse de un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos tecnicos de HEURDU (parametros, contexto, rendimiento) que permitan una comparacion cuantitativa. A continuacion se contrastan las caracteristicas declaradas frente a enfoques alternativos habituales para deteccion de imagenes casi duplicadas.

| Enfoque | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HEURDU | Mapeador heuristico de duplicados (image-feature-extraction) | no disponible | no aplica | no disponible | Apache 2.0 | Hugging Face, uso via `customimagemanager` |
| Hashing perceptual (pHash, dHash, aHash) | Algoritmo clasico de huella de imagen | no aplica | no aplica | Ampliamente documentado en literatura, valores no recogidos aqui | Varias (habitualmente permisivas) | Bibliotecas estandar de Python |
| Embeddings de imagen tipo CLIP | Transformer vision-lenguaje | Cientos de millones (segun variante) | 77 tokens de texto (segun variante) | Documentado en el paper original, valores no recogidos aqui | Varias (MIT en algunos pesos abiertos) | Hugging Face y otros repositorios |
| Comparacion estructural (SSIM / MSE) | Metrica de similitud a nivel de pixel | no aplica | no aplica | Documentado en literatura de procesamiento de imagen | No aplica | Bibliotecas de vision por computador |

## Limitaciones y advertencias

- El propio autor declara que "no es un modelo al 100 %" y que todavia requiere verificacion adicional, por lo que no deberia emplearse como unica fuente de decision en un pipeline de borrado o deduplicacion automatica.
- El entrenamiento se realizo principalmente con fotografias de la vida real, procedentes de internet. El autor reconoce que dominios como el anime u otros estilos graficos no estan cubiertos y quedan pendientes para versiones futuras.
- Sesgos conocidos: no disponibles. Al entrenar con fotografias publicas de internet sin filtrado documentado, es razonable esperar sesgos de representacion, pero el autor no publica ninguna evaluacion al respecto.
- Riesgo de alucinacion: no aplica en el sentido habitual de generacion de texto, pero existe un riesgo analogo de falsos positivos y falsos negativos al clasificar pares de imagenes como duplicados o no duplicados. El autor no publica tasas de error.
- Limitaciones de contexto o idioma: no aplica, ya que no es un modelo de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. No se declaran restricciones adicionales.
- Caveats para produccion: la informacion tecnica publica es practicamente inexistente (sin arquitectura, parametros, formato de pesos, benchmarks ni requisitos de hardware documentados). El repositorio acumula 0 descargas y 0 likes, y no se especifica la fecha de creacion real ni un historial de versiones mas alla de las tallas mencionadas de forma informal ("medium", "xxl"). El unico canal de uso soportado es un proyecto de GitHub, lo que limita la integracion y el soporte a largo plazo.
- La model card incluye un apartado de impacto medioambiental sin datos utiles y otro de financiacion sin informacion, por lo que no aportan trazabilidad sobre el desarrollo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yggdrasil75/HEURDU
- Repositorio de uso indicado por el autor: https://github.com/yggdrasil75/customimagemanager
- Paper o articulo tecnico: no disponible
- Blog o nota tecnica del autor: no disponible
- Demo: no disponible
