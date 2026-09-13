# v13s/tancho-generator-v5

## Resumen

Tancho Generator v5 es un modelo de generacion de puntos de vista numericos para planificacion de observacion con UAV, publicado por v13s (desarrollado en Japon por Vox, Tokio, con computo de Nebius AI Cloud) el 14 de septiembre de 2026. Se trata de un fine-tune del modelo base nvidia/Cosmos3-Edge que reutiliza la torre autorregresiva de Cosmos: dada una imagen de referencia y un contexto numerico de confianza (coordenadas actuales y objetivo, tamano del objetivo, pixeles requeridos, direccion de vision, volumen aprobado, velocidad y limites de tiempo de mision), emite una lista JSON con desplazamientos en metros, tiempo de permanencia en milisegundos y velocidad de salida.

La etiqueta "v5" hace referencia a la version de la politica de enrutado, no a un quinto checkpoint ni a la version del modelo base. El release contiene dos checkpoints afinados (mixed240 y balanced288), un router determinista basado en las entradas, validadores y utilidades de backend fijado, ademas de evidencias de salidas guardadas. No entrena el rol de Reasoner (decidir que observar), no usa la torre de difusion para producir trayectorias de camara continuas y no ejecuta control de vuelo.

Su relevancia es acotada y de caracter investigador: ofrece una linea base reproducible para la generacion de viewpoints en el tramo estacionario de una mision, con resultados medidos de 180/192 (93,75 %) en casos estacionarios nuevos, pero con fallos sin resolver en casos que requieren movimiento y en los limites de presupuesto temporal. No se han publicado datos de parametros totales, contexto ni cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre autorregresiva de Cosmos (fine-tune de nvidia/Cosmos3-Edge); encoder de vision congelado. Detalle interno no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio se distribuye en el export original sin cuantizar (etiqueta safetensors) |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | openmdw-1.1 (etiquetada como `license: other` en HuggingFace; enlace: https://openmdw.ai/license/1-1/) |
| Formato de pesos | safetensors (export de 31 ficheros por checkpoint) |
| Tamano del repositorio | 9,8 GB; cada checkpoint 4.905.905.551 bytes, dos exports suman 9.811.811.102 bytes antes de codigo y documentacion |
| Modelo base | nvidia/Cosmos3-Edge (relacion: finetune) |
| Libreria | cosmos |
| Pipeline | no disponible |
| Fecha de publicacion | 13-14 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de nvidia/Cosmos3-Edge y afina unicamente la torre autorregresiva, manteniendo congelado el encoder de vision. La salida es una lista JSON de viewpoints donde `offset_m` expresa el desplazamiento respecto al objetivo en metros ENU locales (sumando la posicion del objetivo se obtiene el punto de vista), `dwell_ms` el tiempo de permanencia en milisegundos y `speed_mps` la velocidad de salida. La torre de difusion del ecosistema Cosmos no se utiliza para generar trayectorias de camara continuas, y el rol de Reasoner (decidir que observar) no forma parte de este entrenamiento. La arquitectura objetivo declarada es: objetivo de observacion → secuencia de viewpoints → trayectoria detallada de camara/aeronave → control de vuelo.

Se liberan dos checkpoints: mixed240, orientado a generacion de viewpoints por defecto, y balanced288, restringido a observaciones estacionarias elegibles. El router v5 es determinista y se evalua una sola vez antes de la inferencia: requiere que el tiempo de mision restante tras el margen de retorno sea exactamente 1, 2 o 3 segundos, que el preflight de entradas de confianza sea indeterminado (no invalido/infactible), que la conversion de posicion actual a coordenadas relativas y vuelta sea exacta, y que una sonda de validacion estacionaria de 1000 ms en la posicion actual pase todas las comprobaciones. Las entradas elegibles usan balanced288 con entrada de posicion relativa actual explicita; el resto usa mixed240 con el prompt de coordenadas relativas original. Hay una generacion por peticion, sin reparacion de respuesta, reintento ni fallback entre modelos. Los 1/2/3 segundos se refieren al presupuesto de mision restante, no a la latencia de inferencia ni a la frecuencia de control de vuelo.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni el uso de RLHF o DPO. La geometria numerica de evaluacion es sintetica y no esta ligada a objetos reconstruidos en las imagenes. Se auditaron las 1.344 generaciones originales con sus identidades de entrada y modelo; el GPU original y el disco temporal fueron eliminados. La implementacion adoptada supero 93 tests de CPU relacionados. Los 544 casos de geometria numerica nueva no estaban en packs anteriores; 128 casos son regresiones reutilizadas explicitamente y los casos normales son 28 escenas base × 8 transformaciones de simetria, no 224 vuelos independientes.

## Capacidades

- Generacion de viewpoints numericos: produce listas JSON con `offset_m`, `dwell_ms` y `speed_mps` a partir de imagen de referencia y contexto numerico fiable.
- Planificacion de observacion estacionaria: el checkpoint balanced288 esta especializado en observaciones estacionarias elegibles con presupuestos de 1, 2 y 3 segundos de mision restante.
- Generacion por defecto: el checkpoint mixed240 cubre peticiones fuera de la rama estacionaria con el prompt de coordenadas relativas original.
- Enrutado determinista de politica: el router v5 selecciona checkpoint y formato de entrada con criterios verificables antes de la inferencia.
- Validacion geometrica: incluye validadores y helpers de backend fijado que preservan la salida bruta y comprueban geometria y envolventes.
- Reproducibilidad: evidencias de salidas guardadas que permiten repuntuar las respuestas reportadas sin nueva inferencia.
- Idiomas: japones e ingles (etiquetas del repositorio).
- No soporta: tool calling / function calling, agentes multi-paso, vision generativa, audio, modo thinking, ni control de vuelo. El modelo no ejecuta la trayectoria ni decide el objetivo de observacion.

## Casos de uso

- Inspeccion de infraestructura lineal con UAV: dados la posicion actual, el objetivo, los pixeles requeridos y el presupuesto de mision, el modelo propone puntos de vista estacionarios con su tiempo de permanencia, utiles para planificar paradas de captura sobre torres o tendidos.
- Fotogrametria de detalle: el campo de `offset_m` y la restriccion de pixeles requeridos permiten situar la camara a la distancia necesaria para una resolucion objetivo antes de disparar la captura.
- Monitorizacion de instalaciones energeticas: en misiones con presupuesto de 1 a 3 segundos restantes, balanced288 puede generar viewpoints estacionarios validados por el router, reduciendo la necesidad de recalcular la politica en vuelo.
- Evaluacion y comparacion de politicas de planificacion: el router v5 y las evidencias guardadas permiten reproducir la comparacion v4 frente a v5 (180/192 en estacionario nuevo) sin repetir inferencia.
- Investigacion en physical AI: sirve como linea base reproducible para estudiar la generacion de viewpoints numericos y para medir el efecto de cambios de politica sobre el mismo conjunto de casos.
- Validacion de contratos y envelopes geometricos: los validadores incluidos permiten integrar el modelo en un pipeline de verificacion previa a la generacion de la trayectoria detallada de camara y aeronave.
- Generacion de solicitudes con contexto restringido: util en entornos donde solo se dispone de coordenadas, tamano de objetivo y limites de velocidad aprobados, sin necesidad de razonamiento visual abierto.
- Docencia y prototipado de planificacion de misiones: el protocolo de salida JSON es simple de consumir por un validador externo, lo que facilita construir ejercicios y pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Se incluyen a continuacion los resultados de evaluacion declarados por el autor, correspondientes a la comparacion fija v4 frente a v5 del 13 de septiembre de 2026. El exito implica superar el contrato y todas las comprobaciones numericas de geometria y envolvente evaluadas conjuntamente.

| Grupo de evaluacion | Casos | Aceptados v4 | Aceptados v5 |
|---|---:|---:|---:|
| Estacionario nuevo, presupuesto de 1 segundo | 64 | 56 | 60 |
| Estacionario nuevo, presupuesto de 2 segundos | 64 | 53 | 60 |
| Estacionario nuevo, presupuesto de 3 segundos | 64 | 53 | 60 |
| Regresiones estacionarias evaluadas previamente | 128 | 111 | 122 |
| Movimiento requerido | 64 | 15 | 15 |
| Condiciones numericas normales | 224 | 221 | 221 |
| Punto de vista actual valido, limite de 4 segundos | 32 | 0 | 0 |
| Posicion actual en el lado incorrecto | 32 | 0 | 0 |

El exito en estacionario nuevo es de 180/192 (93,75 %), con 22 mejoras emparejadas y 4 regresiones frente a v4. Esto no es exactitud global. Los 352 casos fuera de la rama estacionaria tuvieron salidas brutas identicas entre politicas. El scoring de camara usa un ancho fijo de 3840 pixeles y un campo de vision de 81 grados.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Como cota inferior, cada checkpoint ocupa 4.905.905.551 bytes, a lo que hay que sumar el encoder de vision congelado, los assets del framework Cosmos y la superposicion sobre el modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. El peso de cada checkpoint (aproximadamente 4,9 GB) es compatible con GPUs de consumo de gama alta en cuanto a tamano de fichero, pero no hay datos publicados de VRAM total requerida ni de rendimiento en esas tarjetas.
- Opciones de despliegue: el autor indica explicitamente que la carga usa el Cosmos Framework fijado y un procedimiento de base-overlay descrito en REPRODUCE.md, y que no es una llamada simple a `transformers.from_pretrained` ni un endpoint de inferencia alojado en HuggingFace. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. No se confunden con los presupuestos de 1/2/3 segundos del router, que describen tiempo de mision restante.
- Almacenamiento: el repositorio ocupa 9,8 GB; los dos exports suman 9.811.811.102 bytes antes de codigo y documentacion, mas los assets del modelo base necesarios para la superposicion.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto o rendimiento de alternativas de terceros en la informacion proporcionada. La comparacion se limita al modelo base y al release anterior del mismo autor.

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tancho Generator v5 (v13s/tancho-generator-v5) | no disponible | no disponible | 180/192 (93,75 %) en estacionario nuevo; 15/64 en movimiento requerido | openmdw-1.1 | Publico en HuggingFace, 0 descargas, 0 likes |
| nvidia/Cosmos3-Edge (modelo base) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo base referenciado |
| Tancho (release anterior, v13s/tancho) | no disponible | no disponible | 21/40 (metrica no equivalente a la de v5) | no disponible en la informacion proporcionada | Publico en HuggingFace |

## Limitaciones y advertencias

- Fallos sin resolver en movimiento: solo 15 de 64 casos con movimiento requerido son aceptados, tanto en v4 como en v5. Los fallos de movimiento y de limite temporal siguen abiertos.
- Limite de 4 segundos: 0 de 32 casos aceptados cuando el punto de vista actual es valido en el limite de 4 segundos.
- Posicion en el lado incorrecto: 0 de 32 casos aceptados.
- Regresion de movimiento en balanced288: el checkpoint ya habia fallado previamente una comparacion amplia de despliegue por regresion de movimiento; v5 lo adopta unicamente dentro de la rama estacionaria.
- Alcance limitado de la evidencia: superar las pruebas no establece comprension de imagen, manejo de oclusiones, calidad de imagen real, generalizacion de campo ni seguridad de vuelo.
- Geometria sintetica: los 544 casos de geometria numerica nueva son sinteticos y no estan ligados a objetos reconstruidos en las imagenes. Los casos normales son 28 escenas base con 8 transformaciones de simetria, no 224 vuelos independientes.
- Sin reparacion ni fallback: hay una sola generacion por peticion, sin reparacion de respuesta, reintento ni fallback entre modelos.
- El modelo no es un sistema de control de vuelo, no decide el objetivo de observacion y no genera trayectorias continuas de camara. El ejemplo JSON de la model card es una ilustracion de formato, no un plan certificado.
- Carga no estandar: no es compatible con una llamada directa a `transformers.from_pretrained` ni con endpoints de inferencia alojados en HuggingFace; requiere el framework fijado y el procedimiento de base-overlay.
- Licencia: openmdw-1.1, etiquetada como `license: other`. Debe revisarse el texto completo antes de cualquier uso comercial.
- Validacion de la comunidad nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de funcionamiento en produccion.
- Idiomas: solo japones e ingles. No hay datos de comportamiento en castellano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/v13s/tancho-generator-v5
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- Release anterior del autor: https://huggingface.co/v13s/tancho
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- REPRODUCE.md (procedimiento de carga con Cosmos Framework y base-overlay): incluido en el repositorio del modelo, no se proporciona URL directa en la informacion disponible
- Paper, blog o demo: no disponible

Las busquedas web realizadas no devolvieron ningun resultado relevante para este modelo; los enlaces obtenidos correspondian al foro de desarrolladores de Roblox y no guardan relacion con Tancho Generator v5.
