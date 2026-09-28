# WilliamDDDD/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un modelo de clasificacion de texto publicado en Hugging Face por el usuario WilliamDDDD, con un total de 22.713.986 parametros almacenados en formato safetensors. El identificador del repositorio y las etiquetas de la libreria transformers lo sitúan como un encoder de tipo BERT afinado para una tarea de clasificacion binaria o multiclase. La propia model card menciona que se trata de un "Fine-tuned MiniLM", lo que es coherente con el recuento de parametros, tipico de los modelos de la familia MiniLM de 6 capas (aproximadamente 22,7 millones de parametros).

El contexto del proyecto es academico: la model card se titula "CS546-HW1-Results" y reporta dos resultados de un ejercicio de clasificacion, una linea base de embeddings congelados mas regresion logistica con accuracy de 0,8449 y un MiniLM afinado con accuracy de test de 0,9865. El sufijo "hc3" del identificador sugiere, sin que la informacion disponible lo confirme, una relacion con el corpus HC3 (Human ChatGPT Comparison Corpus), habitual en tareas de deteccion de texto generado por modelos de lenguaje.

Su relevancia practica es limitada tal y como se publica: no hay licencia declarada, no hay idiomas declarados, no hay descripcion del dataset de entrenamiento ni de las etiquetas, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta. Es un artefacto de trabajo de curso, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (familia MiniLM, segun la model card); encoder transformer |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (los encoders BERT de esta familia suelen limitarse a 512 tokens, dato no confirmado para este modelo) |
| Tipos de cuantizacion | no disponible (no se han publicado versiones cuantizadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 0,1 GB) |
| Tarea | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un encoder transformer de tipo BERT, segun la etiqueta "bert" del repositorio. El recuento de 22,7 millones de parametros y la referencia explicita a MiniLM en la model card apuntan a un modelo de la familia MiniLM, que reduce el numero de capas y la dimension oculta respecto a BERT-base manteniendo el mecanismo de atencion completo. No hay informacion disponible sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni sobre la cabeza de clasificacion anadida.

Los unicos datos de entrenamiento publicados son los resultados finales. La model card indica una comparacion entre una linea base de "frozen-embedding + logistic regression" con accuracy de 0,8449 y el MiniLM afinado con accuracy de test de 0,9865. No se especifica el dataset utilizado, su tamano, la composicion de clases, el numero de tokens de entrenamiento, los hiperparametros, la tasa de aprendizaje, el numero de epocas, si hubo validacion cruzada ni si se aplicaron tecnicas de regularizacion como early stopping. Tampoco hay informacion sobre el regimen de precision (fp32, fp16, bf16) ni sobre la infraestructura de computo empleada. No se menciona RLHF, DPO ni ningun tipo de ajuste por preferencias, algo esperable en un modelo discriminativo de este tamano.

## Capacidades

- Clasificacion de texto: es la unica capacidad confirmada por el pipeline declarado (text-classification).
- Deteccion de texto generado por IA: capacidad inferida del sufijo "hc3" del identificador y del nombre "detector"; no confirmada por la model card.
- Generacion de texto: no soportada (es un encoder discriminativo, no un modelo causal).
- Razonamiento multi-paso: no soportado.
- Tool calling / function calling: no soportado.
- Uso como agente: no soportado.
- Capacidades multilingues: no disponibles, no se declara ningun idioma.
- Capacidades especiales (modo thinking, vision, audio): ninguna declarada.
- Extraccion de embeddings: posible en principio al ser un encoder BERT, aunque el repositorio esta etiquetado como text-embeddings-inference y no se documenta su uso para similitud semantica.

## Casos de uso

- Filtrado de envios academicos: si la hipotesis de deteccion de texto generado se confirma, el modelo podria usarse como primera senal de triaje sobre trabajos entregados, marcando aquellos con probabilidad alta de haber sido generados por un modelo de lenguaje para revision manual posterior.
- Moderacion de contenido en plataformas: como clasificador binario rapido, puede integrarse en un pipeline de moderacion que descarte contenido antes de pasarlo a un modelo mayor y mas costoso.
- Limpieza y curado de datasets: puede emplearse para etiquetar grandes volumenes de texto y separar subconjuntos antes de entrenar otros modelos, aprovechando su tamano reducido y su bajo coste de inferencia.
- Analisis de procedencia en periodismo: como apoyo a la verificacion de contenidos, generando una senal cuantitativa que el periodista contrasta con otras fuentes; nunca como decision automatica.
- Monitorizacion de foros y comunidades: deteccion de patrones de texto sintetico en publicaciones a gran escala, con alertas cuando la proporcion supera un umbral definido por el equipo.
- Clasificacion en tiempo real en el borde: al ocupar menos de 100 MB en fp32, puede desplegarse en dispositivos con CPU y anadir una capa de clasificacion a aplicaciones moviles o de escritorio sin GPU.
- Prototipado e investigacion en deteccion de texto sintetico: sirve como punto de partida reproducible para comparar tecnicas de fine-tuning frente a lineas base de embeddings congelados, dado que la model card documenta esa comparacion.

En todos los casos, la falta de licencia y de informacion sobre el dataset obliga a validar el comportamiento en el dominio concreto antes de cualquier uso real.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son dos cifras de accuracy. No se describe el conjunto de test, su tamano ni su composicion.

| Metrica | Modelo evaluado | Resultado |
|---|---|---|
| Accuracy en test | MiniLM afinado (este modelo) | 0,9865 |
| Accuracy | Baseline: embedding congelado + regresion logistica | 0,8449 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 91 MB para los pesos (22,7 millones de parametros x 4 bytes), mas el overhead de activaciones y del runtime de PyTorch.
- VRAM estimada en fp16: aproximadamente 45 MB para los pesos.
- Cabe en cualquier GPU consumer e incluso en GPU integradas; tambien es viable la inferencia en CPU.
- GPU recomendadas: no requiere ninguna GPU dedicada. Funciona en CPU, en GPUs de gama baja (GTX 1050, GTX 1650) y, por supuesto, en RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Opciones de despliegue: transformers con PyTorch, text-embeddings-inference (etiqueta presente en el repositorio), y servidores compatibles con endpoints de Hugging Face. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se ha publicado.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No hay datos verificables de benchmarks de modelos alternativos en la informacion proporcionada. La unica comparacion con cifras disponibles es la que ofrece la propia model card frente a su linea base interna. Existen otros repositorios con el mismo identificador publicados por distintos usuarios, presumiblemente entregas paralelas del mismo ejercicio academico, pero no se dispone de sus especificaciones ni de sus resultados.

| Modelo | Parametros | Contexto | Accuracy reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WilliamDDDD/hw1-hc3-detector | 22,7 M | no disponible | 0,9865 | no disponible | Hugging Face |
| Baseline embedding congelado + regresion logistica (mismo trabajo) | no disponible | no disponible | 0,8449 | no disponible | no publicado |
| HongjiP/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| vivian-ch/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; debe contactarse con el autor antes de cualquier uso fuera del ambito academico.
- Model card practicamente vacia: la mayoria de los campos siguen con el texto plantilla "[More Information Needed]". No hay informacion sobre sesgos, datos de entrenamiento, usuarios previstos ni usos fuera de alcance.
- Dataset de evaluacion no descrito: las cifras de accuracy (0,8449 y 0,9865) no son interpretables sin conocer el conjunto de test, su tamano, su composicion de clases y el procedimiento de particion. Un accuracy de 0,9865 en un dataset pequeno o desbalanceado es compatible con un rendimiento real mucho menor.
- Riesgo de sobreajuste: una diferencia de casi 14 puntos porcentuales entre la linea base y el modelo afinado en un trabajo de curso es compatible con un conjunto de test pequeno o con fuga de datos entre entrenamiento y evaluacion.
- Etiquetas desconocidas: no se documenta que clases predice el modelo, por lo que no puede integrarse en ningun sistema sin inspeccionar primero la configuracion y probar la salida.
- Idiomas no declarados: se desconoce si el modelo funciona fuera del idioma del dataset de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos, especialmente en textos que mezclan escritura humana y asistida.
- Contexto limitado: al ser un encoder BERT de esta familia, lo previsible es un limite de 512 tokens, lo que impide clasificar documentos largos sin truncado o segmentacion; el dato exacto no esta confirmado.
- Sin mantenimiento aparente: el repositorio se creo y actualizo el mismo dia, sin descargas ni interacciones, lo que sugiere que no habra soporte ni actualizaciones.
- Uso etico: emplear un detector de este tipo para acusar a personas de usar IA sin verificacion humana adicional es un uso inadecuado y potencialmente danino, dado el desconocimiento sobre su tasa de error en dominios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WilliamDDDD/hw1-hc3-detector
- Repositorio con identificador equivalente (HongjiP): https://huggingface.co/HongjiP/hw1-hc3-detector
- Repositorio con identificador equivalente (vivian-ch): https://huggingface.co/vivian-ch/hw1-hc3-detector
- Ficha de terceros sobre hw1-hc3-detector (Yihangsun) en savrn.com: https://savrn.com/models/hw1-hc3-detector
- Ficha de terceros sobre hw1-hc3-detector (jacobwu123) en free2aitools.com: https://free2aitools.com/model/jacobwu123/hw1-hc3-detector
- Paper referenciado en las etiquetas del modelo, Lacoste et al. (2019), sobre estimacion de emisiones de carbono: https://arxiv.org/abs/1910.09700
