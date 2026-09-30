# zeechimp/hv-ttu

## Resumen

`hv-ttu` es un predictor de "time-to-understanding" (TTU): recibe un texto y un modo de entrega (texto plano, tarjetas, arbol SVG, tira SVG, pacman, campo de color o ritmo) y devuelve el numero de segundos estimado que tarda un lector en actuar sobre ese contenido. Lo publica el usuario `zeechimp` en HuggingFace bajo licencia Apache-2.0. No es una red neuronal ni un modelo de lenguaje: es una funcion determinista implementada en Python puro (solo stdlib, Python 3.9+) que combina una estimacion temporal aditiva con dos multiplicadores de ajuste (lector y tipo de contenido). La etiqueta de pipeline es `text-classification`, aunque la propia model card lo describe como un calculador de metricas.

El problema que aborda es concreto: segun el autor, todos los benchmarks de LLM miden correccion, pero ninguno mide el coste para el lector. `hv-ttu` propone esa metrica ausente, separando explicitamente el tiempo de red y de generacion (ortogonales) del tiempo que depende de la forma del artefacto entregado. Su relevancia practica esta en la evaluacion de formatos de salida (por ejemplo, decidir si una definicion se sirve mejor como texto o como arbol SVG) y en la comparacion entre modos de entrega para un mismo contenido.

El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y las marcas temporales de creacion y actualizacion son de septiembre de 2026. La model card no incluye validacion empirica, conjunto de datos de calibracion publico ni resultados de benchmarks frente a alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Funcion determinista basada en reglas; no es una red neuronal. Formula multiplicativa: `[scan + read + integrate + verify + act] x reader_fit x content_fit x scale` |
| Parametros totales | no aplica (no hay pesos entrenados; usa constantes tabuladas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (el autor no especifica idiomas; los WPM y factores de retencion son constantes fijas) |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica (codigo Python puro con la stdlib; el autor indica cero dependencias) |

Modos de entrega soportados y sus constantes por defecto (segun la model card):

| Modo | Retencion | WPM | Scan (s) |
|---|---:|---:|---:|
| text | 1,00 | 200 | 0,5 |
| card_deck | 0,40 | 300 | 0,4 |
| svg_tree | 0,15 | 450 | 1,2 |
| svg_strip | 0,20 | 400 | 1,0 |
| pacman | 0,05 | no aplica | 2,0 |
| color_field | 0,05 | no aplica | 0,8 |
| rhythm | 0,05 | no aplica | 0,6 |

## Arquitectura y entrenamiento

No hay entrenamiento. El modelo es un calculador analitico con cinco terminos temporales visibles y ajustables: `scan` (tiempo para localizar donde mirar), `read` (`60 x palabras_efectivas / WPM[modo]`), `integrate` (carga de buffer: clausulas, hedge words, condicionales, abstracciones), `verify` (comprobacion de confianza: numeros, salvedades, negaciones, citas) y `act` (2 s si hay un imperativo claro, 5 s en caso contrario). La correccion clave que introduce es `palabras_efectivas = n_palabras x retencion[modo]`, que modela que una baraja de tarjetas no contiene las mismas palabras que el parrafo que resume.

Sobre esa base se aplican dos multiplicadores ortogonales. El primero es el ajuste al lector (`reader_fit`), con perfiles declarados `text-first`, `visual-first`, `music-first`, `whole-pattern`, `mobile-native`, `colors-first` y `designer`, con penalizaciones de hasta 2,0x-3,0x cuando el formato no coincide con el modo cognitivo. El segundo es el ajuste al tipo de contenido (`content_fit`), con tipos `definition`, `procedure`, `data`, `comparison`, `narrative`, `code` y `general`, con bonificaciones de hasta 0,7x y penalizaciones de hasta 5,0x (por ejemplo, una definicion renderizada como `pacman`). Finalmente hay un parametro `scale` global que el metodo `calibrate()` ajusta por minimos cuadrados a partir de pares (texto, modo, segundos reales) proporcionados por el usuario. No se documenta el mecanismo de deteccion automatica del tipo de contenido ni del perfil de lector.

## Capacidades

- Prediccion de segundos de TTU para un texto y un modo dados, mediante `HVTTU().ttu(texto, mode=...)`.
- Comparacion de todos los modos de entrega con `ttu_all_modes()`, devolviendo un diccionario modo -> segundos.
- Seleccion del mejor modo y calculo del factor de aceleracion frente al texto plano con `best_mode()`.
- Modelado del desajuste lector/formato: el mismo texto puede costar unas 2,5x mas si se entrega a un lector `visual-first` en modo `text`.
- Modelado del desajuste contenido/formato, con penalizaciones de hasta 5,0x y bonificaciones de hasta 0,7x.
- Desglose por terminos con `ttu_breakdown()`, que devuelve `scan`, `read`, `integrate`, `verify`, `act`, `reader_fit`, `content_fit`, `subtotal` y `total`.
- Calibracion a una poblacion concreta mediante `calibrate()` (regresion por minimos cuadrados de un unico `scale` global).
- Interfaz de linea de comandos (`python hv_ttu.py`) con las opciones `--all`, `--best`, `--breakdown`, `--mode` y `--content-type`; sin argumentos ejecuta todas las demos.
- Sin tool calling, sin function calling, sin agentes, sin capacidades multimodales de entrada, sin generacion de texto y sin modo thinking. Es una herramienta de medida, no un generador.

## Casos de uso

- Seleccion de formato de salida en un asistente LLM: antes de enviar la respuesta al usuario, se puntuan todos los modos con `ttu_all_modes()` y se elige el de menor TTU, de modo que un procedimiento se sirva como `svg_strip` en lugar de parrafo. Es adecuado porque la decision depende de la forma del artefacto, no del contenido semantico.
- Optimizacion de documentacion tecnica interna: comparar el mismo runbook renderizado como texto frente a `svg_strip` o `card_deck` y priorizar la conversion de las secciones con mayor diferencia de TTU.
- Pruebas A/B de comunicaciones (correos, newsletters, notificaciones): con el perfil `mobile-native`, el modo `card_deck` aplica su mejor ajuste; la metrica permite estimar la ganancia antes de desplegar la variante.
- Adecuacion al perfil cognitivo del usuario: si la aplicacion conoce que el usuario es `visual-first` o `colors-first`, el modelo cuantifica la penalizacion de entregarle texto crudo (hasta 2,5x y 2,8x respectivamente) y justifica la inversion en render alternativo.
- Metrica complementaria a la correccion en pipelines RAG: junto a las metricas habituales de fidelidad, se puede penalizar la verbosidad de las respuestas midiendo el TTU del texto generado, ya que `integrate` y `verify` crecen con clausulas, condicionales, cifras y salvedades.
- Formacion y onboarding: convertir definiciones a `svg_tree` (retencion 0,15, 450 WPM, bonificacion 0,8x para el tipo `definition`) reduce el tiempo estimado de comprension frente al texto plano.
- Investigacion sobre legibilidad y diseno de informacion: servir como linea base reproducible y ajustable para comparar formatos de entrega bajo una formula explicita, en lugar de metricas de legibilidad puramente textuales.
- Control de brevedad en agentes: usar el TTU como senal de recompensa negativa sobre la longitud y complejidad de las respuestas multi-paso, penalizando explicitamente la carga de integracion y verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye validacion contra lectores reales, correlaciones con tiempos medidos, ni comparaciones con formulas de legibilidad establecidas.

Los siguientes valores aparecen en la documentacion como ejemplos ilustrativos de salida, no como resultados de evaluacion:

| Entrada / modo | Salida documentada |
|---|---|
| Definicion ("A black hole is a region of spacetime..."), modo `text` | 56,9 s |
| Misma definicion, mejor modo (`svg_tree`) | 7,24 s |
| Procedimiento, mejor modo (`svg_strip`) | 5,57 s |
| Desglose modo `text`: scan / read / integrate / verify / act | 0,5 / 33,3 / 7,6 / 10,5 / 5,0 s |
| Factores del desglose: reader_fit / content_fit / subtotal / total | 1,0 / 1,0 / 56,9 / 56,9 |

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El calculo es aritmetica sobre constantes; no hay tensores ni pesos que cargar.
- GPU recomendadas: ninguna. El autor etiqueta el repositorio como `cpu`; cualquier CPU sirve.
- Cabe en cualquier equipo consumer: el unico requisito declarado es Python 3.9 o superior. No depende de CUDA, ROCm ni Metal.
- Opciones de despliegue: importacion directa del modulo (`from hv_ttu import HVTTU`) o ejecucion del script de linea de comandos. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI, transformers ni ONNX.
- Latencia y throughput: no disponible. Al ser codigo Python puro sobre texto, el coste estara dominado por el troceado y el analisis textual, pero el autor no publica cifras.
- Nota sobre dependencias: la seccion de instalacion indica `pip install numpy`, pero a continuacion el autor afirma que no hay dependencias y que usa unicamente la biblioteca estandar. La contradiccion no esta resuelta en la documentacion.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible modelos comparables directos ni resultados que permitan una comparacion cuantitativa. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autoria o su metodologia.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hv-ttu | no aplica | no aplica | no disponible (sin benchmark publicado) | apache-2.0 | HuggingFace |
| Formulas de legibilidad clasicas (Flesch-Kincaid, Gunning Fog, SMOG y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

Las formulas clasicas se citan como categoria conceptual afina (estiman dificultad de lectura a partir del texto), pero no se dispone en la informacion proporcionada de datos verificados para comparar parametros, contexto, rendimiento ni licencia. `hv-ttu` se diferencia en que incorpora el modo de entrega y el perfil del lector como variables explicitas, algo que la model card no atribuye a ninguna alternativa concreta.

## Limitaciones y advertencias

- No es un modelo entrenado: los coeficientes (WPM, factores de retencion, penalizaciones) son supuestos fijados por el autor. La model card afirma que los WPM estan dentro de rangos publicados de velocidad lectora, pero no cita las fuentes.
- Ausencia total de validacion publicada: no hay correlacion con tiempos de lectura reales, ni estudio con participantes, ni intervalo de confianza. El unico mecanismo de ajuste es `calibrate()`, que requiere que el usuario aporte sus propias mediciones.
- Riesgo de circularidad al usarlo como metrica de evaluacion de LLM: si el mismo calculador guia la seleccion de formato y luego se reporta como resultado, la metrica no es independiente.
- La deteccion de tipo de contenido y de perfil de lector no esta documentada. Si el sistema que lo integra clasifica mal el contenido (por ejemplo, una definicion tratada como `general`), la bonificacion o penalizacion aplicada sera incorrecta.
- Sesgo idiomatico probable: los valores de WPM y el analisis de clausulas, hedge words, negaciones y citas apuntan a texto en ingles. El autor no declara idiomas soportados y no hay evidencia de validacion en castellano.
- Etiqueta de pipeline potencialmente enganosa: figura como `text-classification` con libreria `numpy`, cuando la implementacion descrita es una funcion determinista de la biblioteca estandar sin modelo subyacente. Conviene tratarlo como utilidad, no como modelo.
- Ambiguedad en la instalacion: la instruccion `pip install numpy` contradice la afirmacion de cero dependencias.
- Inconsistencia en los metadatos del repositorio: las fechas de creacion y actualizacion (30 de septiembre de 2026) son posteriores a la fecha habitual de consulta, lo que sugiere un error de marcado de tiempo.
- Adopcion nula: 0 descargas y 1 like. No hay issues, tests, versionado ni historial de mantenimiento documentados en la informacion disponible.
- Sin resultados de busqueda relevantes: la busqueda web asociada no devolvio ninguna referencia tecnica al modelo, paper, repositorio auxiliar ni demo. No hay literatura independiente que respalde la metrica TTU tal como se formula aqui.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. No se documentan restricciones adicionales, pero al no haber validacion, su uso en produccion como criterio de decision deberia acompanarse de medicion propia.

## Enlaces

- HuggingFace: https://huggingface.co/zeechimp/hv-ttu
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada. Los resultados devueltos por la busqueda no guardan relacion con el modelo y se han descartado.
