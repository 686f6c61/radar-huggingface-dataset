# SOTAagi2030/PocketIntent-Pilot

## Resumen

PocketIntent-Pilot es un clasificador de texto publicado por el usuario SOTAagi2030 en HuggingFace, pensado para el triaje de mensajes de soporte movil en entornos offline. Segun su model card, el modelo distingue cuatro intenciones: `billing`, `connectivity`, `device_setup` y `account_access`, y se presenta explicitamente como un artefacto piloto destinado unicamente a evaluacion offline.

El artefacto esta etiquetado como `bert` dentro de la libreria `transformers`, con pesos en `safetensors` y licencia Apache 2.0. La informacion publicada es muy escasa: no se declaran parametros totales, longitud de contexto, idiomas soportados ni composicion del dataset de entrenamiento. El repositorio tiene un tamano declarado de 0,0 GB y cero descargas, lo que sugiere que se trata de un experimento interno sin distribucion publica de pesos.

Su relevancia actual es limitada y acotada al nicho de clasificacion de intenciones de bajo coste en el borde. El dato mas util de la model card es el criterio de seleccion del run publicado: se eligio `run_sable` por ser el de menor latencia de validacion entre aquellos con macro F1 igual o superior a 0,900, resultando en 0,906 de macro F1 y 11,2 ms de latencia de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (segun la etiqueta `bert` del repositorio); no se detalla variante ni configuracion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (las etiquetas de intencion estan en ingles, pero no se declara el idioma de los datos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El unico dato de arquitectura es la etiqueta `bert` asociada al repositorio, lo que situa al modelo en la familia de encoders transformer bidireccionales para clasificacion de secuencias. No se publica el numero de capas, dimensiones ocultas, cabezas de atencion ni el numero total de parametros, por lo que no es posible determinar si se trata de una variante base, pequena o destilada.

Tampoco hay informacion sobre el corpus de entrenamiento: no se indica el numero de tokens, el origen de los ejemplos, el idioma, si hubo aumentacion de datos ni si se aplicaron tecnicas de ajuste como RLHF o DPO (poco habituales en clasificadores de este tipo). La model card menciona un proceso de seleccion de runs con un criterio explicito (menor latencia de validacion entre los que superan macro F1 de 0,900) y nombra el run elegido como `run_sable`, lo que indica una fase de experimentacion con multiples configuraciones, pero no se detalla ninguna de ellas.

## Capacidades

- Clasificacion de texto en cuatro clases de intencion cerradas: `billing`, `connectivity`, `device_setup` y `account_access`.
- Triaje de mensajes de soporte movil, segun la descripcion del autor.
- Ejecucion en modo offline: la model card indica que el artefacto esta pensado para evaluacion sin conexion.
- Orientacion a despliegue movil, segun la etiqueta `mobile` del repositorio.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue.
- No se documentan modos especiales (thinking, vision, audio) ni generacion de texto.

## Casos de uso

- Triaje automatico de tickets de soporte movil: el modelo asigna cada mensaje entrante a una de las cuatro intenciones declaradas y permite enrutarlo al equipo correspondiente (facturacion, conectividad, configuracion de dispositivo o acceso a cuenta) sin intervencion manual.
- Enrutado previo a un modelo generativo: dado su perfil de baja latencia (11,2 ms en validacion), puede actuar como primera capa que filtra y clasifica la consulta antes de invocar un LLM mas costoso, reduciendo el gasto de inferencia.
- Clasificacion en el dispositivo: la etiqueta `mobile` y el enfoque offline sugieren su uso embebido en una aplicacion movil para categorizar mensajes sin enviar datos del usuario a un servidor, lo que ayuda con requisitos de privacidad.
- Priorizacion de colas de atencion: la intencion detectada puede alimentar reglas de negocio que asignen prioridad o SLA distintos a incidencias de `account_access` frente a `billing`.
- Preetiquetado de datos para anotacion humana: el modelo puede generar etiquetas iniciales sobre grandes volumenes de conversaciones de soporte, que despues se revisan manualmente, acelerando la construccion de un dataset mayor.
- Analitica de motivos de contacto: agregando las predicciones a lo largo del tiempo se obtiene una distribucion de intenciones que permite detectar picos en `connectivity` o `billing` y correlacionarlos con incidencias tecnicas o cambios de precios.
- Filtrado y guardarrailes en formularios de soporte: clasificar el texto libre del usuario para redirigirlo a un articulo de ayuda concreto antes de crear un ticket.

## Benchmarks y rendimiento

Los unicos datos publicados provienen de la model card y corresponden al run seleccionado `run_sable`. No se especifica el conjunto de validacion, su tamano ni su composicion, por lo que los valores no son comparables de forma directa con otros modelos.

| Metrica | Valor | Contexto |
|---|---|---|
| Macro F1 (validacion) | 0,906 | Run `run_sable`, seleccionado por criterio de latencia minima con macro F1 >= 0,900 |
| Latencia (validacion) | 11,2 ms | Run `run_sable`; no se indica hardware ni longitud de entrada |
| Umbral de seleccion | macro F1 >= 0,900 | Criterio declarado por el autor para elegir el run publicado |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible. La model card referencia dos artefactos de evidencia, `reports/latency_by_device.csv` y `reports/confusion_matrix.png`, pero no se ha podido acceder a su contenido a traves de la informacion proporcionada, y no se publican resultados por clase ni la matriz de confusion en texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no declararse el numero de parametros ni la configuracion del encoder, no es posible calcularla. A titulo puramente orientativo y sin confirmacion por parte del autor, un encoder tipo BERT en su configuracion base ocupa del orden de 0,4 a 0,5 GB en fp32 y menos de 0,25 GB en int8, pero esta cifra no debe tomarse como una especificacion del modelo.
- GPU recomendadas: no disponibles. No se documenta el hardware empleado en las mediciones de latencia.
- Encaje en GPU de consumo: no confirmado. Si el modelo es efectivamente un encoder de tamano contenido, seria ejecutable en GPUs de consumo e incluso en CPU, pero no hay evidencia publicada que lo respalde.
- Opciones de despliegue: la libreria declarada es `transformers` con pesos en `safetensors`, por lo que el despliegue via `transformers` es el camino documentado. No se mencionan vLLM, llama.cpp, Ollama, TGI ni ninguna otra alternativa, y no se publican pesos en GGUF u otros formatos. Dado el enfoque movil, ONNX o TFLite serian candidatos habituales, pero no estan confirmados.
- Latencia y throughput: la unica cifra disponible es 11,2 ms de latencia de validacion para el run `run_sable`, sin especificar hardware, lote ni longitud de secuencia. No se publica throughput.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos directamente comparables dentro de la informacion proporcionada, y ademas se desconoce el numero de parametros del propio PocketIntent-Pilot, lo que impide una comparacion cuantitativa rigurosa. La tabla siguiente recoge referencias publicas ampliamente conocidas de encoders compactos usados en clasificacion de texto; estos datos no proceden de la busqueda realizada y deben verificarse en sus respectivas fichas antes de usarse.

| Modelo | Parametros (referencia publica) | Contexto (referencia publica) | Licencia | Estado |
|---|---|---|---|---|
| PocketIntent-Pilot | no disponible | no disponible | Apache 2.0 | Piloto, 0 descargas, repo de 0,0 GB |
| DistilBERT base | ~66 M | 512 tokens | Apache 2.0 | Publico y ampliamente desplegado |
| MiniLM-L6 | ~22,7 M | 512 tokens | Apache 2.0 | Publico y ampliamente desplegado |
| MobileBERT | ~25 M | 512 tokens | Apache 2.0 | Publico, orientado a dispositivos moviles |

En terminos de rendimiento no existe comparacion posible: PocketIntent-Pilot solo publica macro F1 de validacion sobre un conjunto no descrito, mientras que los modelos de la tabla cuentan con evaluaciones en benchmarks publicos como GLUE.

## Limitaciones y advertencias

- Ambito cerrado de cuatro intenciones: cualquier mensaje fuera de `billing`, `connectivity`, `device_setup` o `account_access` no tiene una clase adecuada, lo que puede producir asignaciones erroneas con alta confianza.
- Artefacto declarado como piloto: la propia model card indica que esta destinado exclusivamente a evaluacion offline, por lo que no esta validado para uso en produccion.
- Ausencia de pesos publicados: el repositorio declara 0,0 GB de tamano y no se confirma la disponibilidad de los ficheros de modelo, por lo que puede no ser utilizable sin acceso adicional.
- Falta total de documentacion de entrenamiento: sin datos sobre el corpus, el idioma, el dominio o el proceso de anotacion, no es posible evaluar sesgos ni generalizacion fuera del dominio de soporte movil.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos y falsos negativos: no se publica la matriz de confusion ni el rendimiento por clase, de modo que se desconoce si alguna intencion concreta se clasifica peor.
- Metricas no reproducibles: el macro F1 de 0,906 y la latencia de 11,2 ms carecen de descripcion del conjunto de validacion, del hardware y de la longitud de entrada, por lo que no son verificables ni extrapolables.
- Idiomas no declarados: si el entrenamiento se hizo solo en ingles, el rendimiento en castellano u otros idiomas seria incierto.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero al no existir garantias del autor ni documentacion de calidad, el riesgo de uso comercial recae enteramente en el integrador.
- Fecha de creacion registrada en 2026-09-10 y cero descargas: sin adopcion ni mantenimiento observables, no hay senal de comunidad que respalde la fiabilidad del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SOTAagi2030/PocketIntent-Pilot
- Evidencia de latencia por dispositivo (referenciada en la model card, no verificada): reports/latency_by_device.csv
- Matriz de confusion (referenciada en la model card, no verificada): reports/confusion_matrix.png
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante; los resultados devueltos corresponden a la pagina principal de YouTube y a canales de video sin relacion con el modelo. No se localizaron papers, blogs, repositorios ni demos asociados a PocketIntent-Pilot.
