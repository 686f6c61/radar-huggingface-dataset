# warped-community/functiongemma-270m-litert-lm

## Resumen

`warped-community/functiongemma-270m-litert-lm` es un espejo (mirror) del modelo `litert-community/functiongemma-270m-ft-mobile-actions`, publicado por el usuario `warped-community` para su uso en la aplicacion Android "Warped". No se trata de un entrenamiento propio: el autor redistribuye un artefacto ya existente, concretamente el fichero `mobile_actions_q8_ekv1024.litertlm`, derivado a su vez del modelo base `google/functiongemma-270m-it`.

El modelo pertenece a la familia FunctionGemma de Google, orientada a function calling, y su denominacion indica un tamano de aproximadamente 270 millones de parametros. Su formato de distribucion es `.litertlm`, el contenedor del runtime LiteRT-LM de Google AI Edge, pensado para inferencia en dispositivo (on-device) en moviles y otros sistemas embebidos. El repositorio ocupa 0,3 GB, coherente con una cuantizacion de 8 bits sobre un modelo de ese tamano.

Su relevancia es limitada pero especifica: sirve como copia de conveniencia para quien quiera descargar el artefacto desde un repositorio estable sin depender del repositorio original de `litert-community`. No aporta pesos nuevos, ni ajustes adicionales, ni documentacion tecnica propia mas alla de la trazabilidad al modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la informacion proporcionada; heredada de `google/functiongemma-270m-it`) |
| Parametros totales | aproximadamente 270 M (segun la denominacion del modelo base; no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; el nombre del fichero (`ekv1024`) sugiere una cache KV de 1024 tokens en el artefacto distribuido |
| Tipos de cuantizacion | el artefacto publicado es `q8` (8 bits) segun el nombre del fichero; no se documentan otras variantes |
| Idiomas soportados | no disponibles |
| Licencia | `gemma` (licencia de uso de Gemma, con sus condiciones especificas) |
| Formato de pesos | `litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento ni la composicion del dataset en la informacion proporcionada para este repositorio. Lo unico documentado por el autor es la cadena de procedencia: este espejo reproduce el fichero `mobile_actions_q8_ekv1024.litertlm` del repositorio `litert-community/functiongemma-270m-ft-mobile-actions`, que a su vez se basa en `google/functiongemma-270m-it`. El sufijo `ft-mobile-actions` del repositorio original indica un ajuste fino orientado a acciones moviles (mobile actions), pero no se detalla el procedimiento, los datos ni si hubo RLHF, DPO u otra fase de alineamiento.

En cuanto al artefacto en si, el nombre `q8_ekv1024` permite inferir dos cosas: que los pesos estan cuantizados a 8 bits y que la configuracion de cache KV embebida en el fichero corresponde a 1024 tokens. Cualquier otra caracteristica tecnica (tipo de atencion, uso de decodificacion especulativa, vocabulario, tokenizador) queda fuera del alcance de la informacion disponible.

## Capacidades

- Generacion de texto y function calling: el modelo base pertenece a la familia FunctionGemma, disenada especificamente para emitir llamadas a funciones estructuradas, aunque las capacidades concretas de este artefacto no estan documentadas en el repositorio.
- Ajuste orientado a acciones moviles: el repositorio de origen se denomina `ft-mobile-actions`, lo que sugiere especializacion en acciones tipicas de un asistente en telefono movil, sin que se detalle el conjunto exacto de funciones soportadas.
- Ejecucion en dispositivo: el formato `.litertlm` esta pensado para inferencia local sin conexion en Android y otros dispositivos mediante LiteRT-LM.
- Capacidades multilingues: no disponibles.
- Capacidades de agente multi-paso, vision, audio o modo de razonamiento explicito: no disponibles.

## Casos de uso

- Asistente de voz o texto en aplicaciones Android: el artefacto esta empaquetado en `.litertlm` y ocupa unos 0,3 GB, por lo que puede integrarse en una app movil para ejecutar function calling en local sin enviar la peticion del usuario a un servidor.
- Automatizacion de acciones del sistema en el telefono: dado el ajuste `mobile-actions` del repositorio de origen, el uso previsto es traducir lenguaje natural a llamadas de funcion que abran aplicaciones, ajusten parametros del dispositivo o lancen rutinas concretas.
- Modo sin conexion y preservacion de privacidad: al no requerir red, encaja en escenarios donde el texto del usuario no puede salir del dispositivo, como asistentes personales con datos sensibles.
- Enrutado de intenciones de bajo coste: un modelo de 270 M puede usarse como clasificador previo que decida si una peticion necesita un modelo mayor en la nube, reduciendo coste y latencia en la mayoria de interacciones.
- Prototipado rapido de agentes con herramientas en movil: permite validar un flujo de function calling completo en un dispositivo de gama media antes de invertir en una version mayor.
- Distribucion reproducible en un pipeline propio: al ser un espejo con URL fija, sirve para fijar la version del artefacto en un proceso de build o en un manifiesto de dependencias de aplicacion.

Conviene senalar que estos casos se derivan del proposito declarado del modelo fuente; no hay ejemplos de uso, demos ni resultados verificados en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 0,3 GB y el fichero es una cuantizacion de 8 bits, por lo que la huella de pesos ronda los 270 MB; sumando cache KV de 1024 tokens y overhead del runtime, un presupuesto de 400-600 MB de memoria es una estimacion razonable, aunque no confirmada por el autor.
- GPU dedicadas: no aplica en el escenario objetivo. El formato LiteRT-LM esta pensado para aceleracion en el propio dispositivo (CPU, GPU movil o NPU) mas que para GPUs de centro de datos.
- GPUs de consumo: no es el caso de uso previsto. En un PC, el modelo cabria sobradamente en cualquier GPU con mas de 1 GB de VRAM (GTX 1050, RTX 3050, RTX 4090), pero el runtime adecuado seria LiteRT-LM, no los runners habituales de escritorio.
- Dispositivos objetivo: telefonos Android de gama media y alta con al menos 0,5-1 GB de memoria libre, y potencialmente otros dispositivos con soporte de LiteRT.
- Opciones de despliegue: LiteRT-LM (runtime nativo del formato `.litertlm`) y, en Android, la integracion correspondiente de Google AI Edge. Para vLLM, llama.cpp, Ollama o TGI seria necesaria una conversion a otro formato, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `warped-community/functiongemma-270m-litert-lm` (este) | ~270 M (segun denominacion) | no disponible (`ekv1024` sugiere 1024 tokens de cache KV) | `litertlm` (q8) | `gemma` | 0 descargas, 0 likes en el momento de la consulta |
| `litert-community/functiongemma-270m-ft-mobile-actions` | no disponible | no disponible | `litertlm` | no disponible en la informacion proporcionada | repositorio de origen del espejo |
| `google/functiongemma-270m-it` | ~270 M (segun denominacion) | no disponible | no disponible | `gemma` | modelo base de la cadena |

No hay datos de rendimiento publicados para ninguno de los tres, por lo que no es posible establecer una comparacion cuantitativa. Tampoco se dispone de informacion sobre alternativas de otros fabricantes en la misma categoria.

## Limitaciones y advertencias

- Es un espejo, no un modelo entrenado por el autor: cualquier cambio en el repositorio de origen no se refleja automaticamente, y no hay garantia de mantenimiento ni de actualizacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica que permitan validar su funcionamiento.
- Documentacion practicamente inexistente: la model card se limita a indicar el origen y el fichero redistribuido; no hay informacion sobre arquitectura, datos, idiomas ni evaluacion.
- Contexto corto: si la cache KV de 1024 tokens del fichero es la configuracion efectiva, el modelo no es adecuado para conversaciones largas ni para documentos extensos.
- Riesgo de alucinacion: inherente a un modelo de 270 M; en tareas de function calling puede generar nombres de funcion o argumentos inexistentes, por lo que requiere validacion del esquema antes de ejecutar cualquier accion.
- Idiomas: sin datos. No se puede asumir un rendimiento correcto en castellano sin una evaluacion propia.
- Licencia `gemma`: el uso comercial esta sujeto a las condiciones de la licencia de Gemma, que impone obligaciones de atribucion y restricciones de uso. Conviene revisarla antes de integrarlo en un producto.
- Dependencia de runtime: al estar en formato `.litertlm`, el uso queda ligado al ecosistema LiteRT-LM. Fuera de ese runtime la conversion no esta documentada.
- Sin garantias de produccion: al no existir benchmarks, evaluacion de sesgos ni pruebas publicadas, cualquier despliegue deberia ir precedido de una validacion propia sobre el caso de uso concreto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/warped-community/functiongemma-270m-litert-lm
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Repositorio de origen del artefacto: https://huggingface.co/litert-community/functiongemma-270m-ft-mobile-actions
