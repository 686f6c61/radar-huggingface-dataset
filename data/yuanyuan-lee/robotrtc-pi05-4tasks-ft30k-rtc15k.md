# Yuanyuan-Lee/robotrtc-pi05-4tasks-ft30k-rtc15k

## Resumen

`robotrtc-pi05-4tasks-ft30k-rtc15k` es un paquete de cuatro políticas de accion para robotica real, publicado por el usuario Yuanyuan-Lee en Hugging Face. Cada política es un modelo PI0.5 de aproximadamente 3.350 millones de parametros en BF16, entrenado para una tarea de manipulacion concreta: apilar tres cuencos (bowl), transferir un bloque de madera entre brazos (wood), girar y colgar una taza (cup) y colocar una lata en una cesta y levantarla (drinks). El modelo resuelve el problema de generar trayectorias de accion continuas a 30 Hz a partir de observaciones visuales y de estado del robot, emitiendo fragmentos de 32 pasos con 14 dimensiones por paso.

La relevancia de esta publicacion es doble. Por un lado, aplica el paradigma RTC (real-time chunking) sobre la base PI0.5, un modelo vision-lenguaje-accion de la familia OpenPI de Physical Intelligence, con pesos no-EMA y sin supervision de video auxiliar. Por otro, cada tarea se distribuye como un paquete autonomo con su propio modelo, normalizacion, tokenizer, codigo de inferencia y licencias, lo que simplifica el despliegue y el mantenimiento independiente de cada politica. El entrenamiento parte de la base PI0.5 preentrenada, realiza 30.000 actualizaciones de fine-tuning por tarea y despues 15.000 actualizaciones RTC con un nuevo optimizador y calendario de etapas.

Es importante subrayar que el autor no reporta ninguna tasa de exito en robot fisico. La validacion realizada cubre comprobaciones de integridad SHA256, paridad con la fuente de entrenamiento y, en el caso de bowl, inferencia en GPU y en entorno limpio. El resto de comprobaciones en GPU no se completaron antes de la publicacion. Se trata, por tanto, de un artefacto de investigacion reproducible, no de un sistema validado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PI0.5 (vision-lenguaje-accion), sin modulo de video (video architecture: none) |
| Parametros totales | 3.353.433.872 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | openpi-apache-2.0-with-gemma-terms (terminos compuestos Apache 2.0 + PaliGemma/Gemma) |
| Formato de pesos | safetensors (BF16), 6.707.002.640 bytes por tarea |

## Arquitectura y entrenamiento

Cada politica es un modelo PI0.5, la variante de accion de la familia OpenPI de Physical Intelligence, construida sobre una base vision-lenguaje derivada de PaliGemma. El modelo recibe observaciones (imagenes y estado del robot) y emite fragmentos de accion de forma `[32,14]`, es decir, 32 pasos temporales con 14 dimensiones por paso. La arquitectura de video esta desactivada (`video architecture: none`, 0 parametros de video) y el entrenamiento no emplea supervision de video auxiliar. Los pesos publicados son no-EMA.

El protocolo de entrenamiento es `pi05-ft30k-rtc15k-v1`: cada tarea parte de la base PI0.5 preentrenada, se somete a 30.000 actualizaciones de fine-tuning (FT30000) y despues a 15.000 actualizaciones RTC (RTC15000) partiendo de su propio modelo FT30000, con un nuevo optimizador y calendario de etapas. Cada tarea usa 100 demostraciones (entre 50.419 y 55.329 frames segun la tarea), batch efectivo de 32 y semilla 42. Las cuatro tareas comparten la misma receta pero se entrenan de forma independiente.

La innovacion principal es el uso de RTC (real-time chunking) sobre PI0.5: el modelo emite fragmentos de accion con prefijo comprometido, y el controlador debe empalmar solo el sufijo nuevo en la cola pendiente. El despliegue real exige ejecucion de acciones a 30 Hz con ventana de ejecucion de 8 pasos y observaciones/prefijos alineados temporalmente. Los ejemplos de cola asincrona incluidos son simulaciones software, sin E/S de robot.

## Capacidades

- Generacion de acciones roboticas continuas: salida `actions` y `actions_normalized` de forma `[32,14]` por inferencia.
- Manipulacion bimanual: las tareas wood y drinks requieren coordinacion entre dos brazos.
- Control a 30 Hz con ventana de ejecucion de 8 pasos y chunking RTC.
- Inferencia a partir de observaciones visuales y de estado del robot (campos y unidades definidos en el README de cada tarea).
- Paquetes autonomos: cada tarea carga solo su propio modelo, configuracion, normalizacion y tokenizer, sin dependencia del directorio raiz ni de otras tareas.
- No incluye tool calling, function calling, agentes multi-paso, capacidades multilingues ni modo thinking: es una politica de accion, no un modelo conversacional.
- No incluye vision generativa ni audio; la vision se usa como entrada de observacion.

## Casos de uso

- Apilado de cuencos en linea de montaje: la politica `bowl` genera trayectorias de apilado de tres cuencos a partir de 100 demostraciones y 54.430 frames, adecuada para tareas de pick-and-place repetitivas con objetos rigidos.
- Transferencia bimanual de bloques: la politica `wood` coordina dos brazos para pasar un bloque de madera y depositarlo en una almohadilla azul, util en escenarios de ensamblaje que requieren relevo entre efectores.
- Manipulacion de objetos con orientacion: la politica `cup` gira y transfiere una taza y la cuelga en un soporte, aplicable a tareas de reorientacion y encaje preciso.
- Pick-and-place con contenedores: la politica `drinks` coloca una lata en una cesta y levanta la cesta con el otro brazo, representativa de tareas de carga y transporte bimanual.
- Investigacion en aprendizaje por imitacion: las cuatro politicas sirven como referencia reproducible del protocolo `pi05-ft30k-rtc15k-v1` para comparar variantes de fine-tuning y RTC sobre PI0.5.
- Desarrollo de controladores RTC: los ejemplos de cola asincrona permiten implementar y probar el empalme de sufijos en la cola pendiente antes de conectar el robot real.
- Despliegue por tarea en entornos aislados: al ser paquetes independientes, cada politica puede descargarse con `allow_patterns` y desplegarse en un contenedor separado sin arrastrar las otras tres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se realizo ninguna evaluacion de tasa de exito en robot fisico y que no se reportan tasas de exito inventadas. Las unicas comprobaciones documentadas son de integridad (SHA256 de pesos, normalizacion y tokenizers), paridad con la fuente de entrenamiento (diferencia de accion cero en wood), inferencia en GPU y en entorno limpio para bowl, y verificacion de nombres, tamanos y metadatos LFS tras la subida.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6,7 GB solo para pesos, mas overhead de activaciones, vision y buffers; en la practica se recomienda al menos 16 GB de VRAM para margen operativo.
- GPU recomendadas: A100, H100 o L40S para despliegue con latencia holgada; RTX 4090 (24 GB) es suficiente para una instancia en BF16.
- Cabe en GPU de consumo: si, en RTX 4090 y previsiblemente en RTX 3090 (24 GB); en GPUs de 16 GB el margen es ajustado y no esta documentado por el autor.
- Opciones de despliegue: el paquete incluye su propio codigo de inferencia y fichero de dependencias por tarea; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a una politica de accion).
- Latencia y throughput: no disponibles. El requisito funcional es ejecutar acciones a 30 Hz con ventana de 8 pasos, pero no se publican mediciones de latencia por inferencia.
- Almacenamiento: 26,8 GB para el repositorio completo; cada `model.safetensors` ocupa 6.707.002.640 bytes y puede descargarse por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| robotrtc-pi05-4tasks-ft30k-rtc15k | 3,35 B | no disponible | VLA de accion (PI0.5 + RTC) | openpi-apache-2.0-with-gemma-terms | Hugging Face, 4 paquetes por tarea |
| PI0.5 base (OpenPI) | no disponible en la informacion | no disponible | VLA de accion | Apache 2.0 + terminos Gemma | OpenPI (GitHub) |
| PaliGemma-3B | ~3 B | no disponible | Vision-lenguaje | Terminos Gemma | Hugging Face (google/paligemma-3b-pt-224) |

La comparacion con PI0.5 base y PaliGemma es estructural: este modelo deriva de ambos. No se dispone de datos de rendimiento comparativo (tasas de exito, benchmarks) en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluacion de tasa de exito en robot fisico; el exito del entrenamiento y la validacion software no equivalen a exito en tarea real.
- Las comprobaciones en GPU no se completaron para wood, cup y drinks antes de la publicacion; solo bowl paso inferencia en GPU y en entorno limpio.
- El registro de conversion retenido no establece de forma independiente una revision inmutable de la base upstream; esta limitacion se documenta en la procedencia de cada paquete.
- Los ejemplos de cola asincrona son simulaciones software sin E/S de robot; el despliegue real exige implementar el control a 30 Hz, la ventana de 8 pasos y la alineacion temporal de observaciones y prefijos.
- El modelo emite chunks RTC con prefijo comprometido; un controlador incorrecto que no empalme solo el sufijo nuevo en la cola pendiente producira acciones inconsistentes.
- La licencia es compuesta (`openpi-apache-2.0-with-gemma-terms`): el metadato `other` no declara los pesos como Apache 2.0 sin restricciones. El uso comercial esta sujeto a los terminos de PaliGemma/Gemma, que deben revisarse antes de produccion.
- No hay informacion sobre sesgos, alucinacion, cobertura idiomatica ni contexto; estos conceptos no aplican directamente a una politica de accion, pero tampoco se documenta el dominio de generalizacion fuera de las cuatro tareas entrenadas.
- Cada politica esta especializada en una unica tarea con 100 demostraciones; no se documenta su robustez ante cambios de iluminacion, posicion de objetos o variaciones del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yuanyuan-Lee/robotrtc-pi05-4tasks-ft30k-rtc15k
- Paquete bowl: https://huggingface.co/Yuanyuan-Lee/robotrtc-pi05-4tasks-ft30k-rtc15k/tree/main/bowl
- Paquete wood: https://huggingface.co/Yuanyuan-Lee/robotrtc-pi05-4tasks-ft30k-rtc15k/tree/main/wood
- Paquete cup: https://huggingface.co/Yuanyuan-Lee/robotrtc-pi05-4tasks-ft30k-rtc15k/tree/main/cup
- Paquete drinks: https://huggingface.co/Yuanyuan-Lee/robotrtc-pi05-4tasks-ft30k-rtc15k/tree/main/drinks
- Licencias del paquete bowl: https://huggingface.co/Yuanyuan-Lee/robotrtc-pi05-4tasks-ft30k-rtc15k/blob/main/bowl/LICENSES.md
- OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- PaliGemma-3B: https://huggingface.co/google/paligemma-3b-pt-224
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
