# yangkaixing/ACE-Dance-Six-Tasks

## Resumen

ACE Dance Six Tasks es una coleccion de checkpoints de modelos de generacion de movimiento (motion generation) orientados a la sintesis de coreografias de baile para dos bailarines. El repositorio, publicado por el usuario yangkaixing, agrupa los pesos resultantes de seis ejecuciones de entrenamiento del sistema ACE Dance iniciadas el 12 de noviembre de 2026. No se trata de un modelo de lenguaje, sino de un conjunto de redes actor entrenadas para tareas de generacion condicionada de movimiento, empaquetadas en formato nativo de PyTorch.

El conjunto cubre seis tareas diferenciadas: dos de generacion reactiva (reactive_l2f y reactive_f2l), dos de generacion responsiva (responsive_l2f y responsive_f2l) y dos de generacion de un unico bailarin a partir de musica (music_to_leader y music_to_follower). Las tareas l2f generan el seguidor condicionado al lider, mientras que las f2l generan el lider condicionado al seguidor. En las tareas music_to_* se genera un bailarin a partir de la musica, con el actor 0 como seguidor y el actor 1 como lider.

La relevancia del repositorio es acotada y de caracter practico: proporciona snapshots intermedios y finales de un pipeline de investigacion en generacion de movimiento, con manifiesto de integridad y configuracion de normalizadores incluida. Dos de los checkpoints (reactive_l2f y reactive_f2l) son hitos intermedios de ejecuciones en curso y sus metricas de calidad sobre conjuntos reservados estan pendientes, lo que limita su uso en evaluacion definitiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (redes actor de generacion de movimiento; no se detalla la topologia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos nativos en PyTorch) |
| Idiomas soportados | no disponible (modelo de movimiento, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | snapshot nativo de PyTorch (estado online y EMA, normalizador y configuracion del modelo) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de red. La model card describe redes actor (se mencionan "raw actor 0" como seguidor y "raw actor 1" como lider) entrenadas mediante actualizaciones de optimizador, lo que sugiere un esquema de aprendizaje por refuerzo o de imitacion con actor(es) diferenciados por rol. Cada snapshot nativo incluye el estado del modelo online y el estado EMA (media movil exponencial), ademas del normalizador y la configuracion del modelo, lo que indica un pipeline de entrenamiento con seguimiento de pesos suavizados para inferencia.

El entrenamiento se organiza en seis ejecuciones con distinto numero de epocas y actualizaciones del optimizador: las tareas reactive alcanzan la epoca 500 con 10.500 actualizaciones y se marcan como intermedios; las tareas responsive alcanzan la epoca 2000 con 14.000 actualizaciones y se marcan como finales, usando pesos EMA para inferencia; las tareas music_to_* alcanzan la epoca 2000 con 50.000 actualizaciones y se marcan como finales, usando pesos online. No se especifica el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de movimiento de bailarines en tareas de dos roles (lider y seguidor).
- Generacion reactiva: el seguidor se genera condicionado al lider (reactive_l2f) y el lider condicionado al seguidor (reactive_f2l).
- Generacion responsiva: variantes responsive_l2f y responsive_f2l con checkpoints finales y pesos EMA.
- Generacion de un unico bailarin a partir de musica: music_to_leader y music_to_follower, con 50.000 actualizaciones del optimizador.
- Integracion con el runtime ACE y sus codecs de tarea correspondientes.
- Carga del normalizador nativo a traves del modulo `dataset` del runtime en los snapshots reactive y music.
- Verificacion de integridad mediante `snapshot-manifest.json`, que registra roles, tamanos y hashes SHA-256.
- No se documentan capacidades de texto, codigo, vision, tool calling, agentes ni multilingues.

## Casos de uso

- Investigacion en generacion de movimiento reactivo: usar reactive_l2f y reactive_f2l para estudiar como un seguidor adapta su movimiento al lider en tiempo real, aprovechando los checkpoints intermedios como linea base de comparacion.
- Evaluacion de coreografia responsiva: emplear responsive_l2f y responsive_f2l, con pesos EMA y estado final, para medir la calidad de la respuesta del bailarin condicionada por el otro rol en entornos de validacion.
- Sintesis de bailarin a partir de musica: utilizar music_to_leader o music_to_follower para generar el movimiento de un unico interprete sincronizado con una pista musical, con 50.000 actualizaciones de entrenamiento como referencia de madurez.
- Reproduccion de experimentos: cargar los snapshots nativos con el runtime ACE y los codecs de tarea para replicar las condiciones de entrenamiento y comparar estados online frente a EMA.
- Integracion en pipelines de animacion: alimentar motores de render o herramientas de previsualizacion de animacion con las secuencias generadas por las tareas music_to_*, dado que producen movimiento de un solo bailarin.
- Auditoria de integridad de artefactos: verificar los pesos descargados contra los hashes SHA-256 de `snapshot-manifest.json` antes de incorporarlos a un flujo de produccion o a un banco de pruebas.
- Estudio de la influencia del condicionamiento entre roles: comparar las salidas de l2f y f2l sobre las mismas entradas para analizar asimetrias en la generacion lider-seguidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas de calidad de movimiento sobre conjuntos reservados (held-out) estan pendientes para los dos checkpoints reactive.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 3,2 GB en total, pero no se desglosa el tamano por checkpoint ni el consumo en ejecucion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se especifican requisitos minimos.
- Opciones de despliegue: runtime ACE con los codecs de tarea correspondientes; los snapshots reactive y music requieren el modulo `dataset` del runtime para el normalizador nativo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de generacion de movimiento ni datos de rendimiento que permitan establecer una comparacion.

## Limitaciones y advertencias

- Dos de los seis checkpoints (reactive_l2f y reactive_f2l) son hitos intermedios de ejecuciones en curso y sus metricas de calidad sobre conjuntos reservados estan pendientes; no deben tratarse como resultados finales.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribucion.
- No se documentan sesgos conocidos, pero al ser un modelo de generacion de movimiento entrenado sobre un dataset no descrito, pueden heredar sesgos de los datos de captura.
- El modelo no es linguistico: no admite prompts de texto, tool calling ni razonamiento multi-paso.
- La inferencia depende del runtime ACE y de los codecs de tarea; sin ellos los pesos no son utilizables directamente.
- Los snapshots reactive y music requieren el modulo `dataset` del runtime para aplicar el normalizador nativo; una carga incorrecta puede producir salidas no normalizadas.
- No se especifican limitaciones de contexto ni de idioma porque no aplican a la naturaleza del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/yangkaixing/ACE-Dance-Six-Tasks
- Manifiesto de snapshots: `snapshot-manifest.json` dentro del repositorio (roles, tamanos y hashes SHA-256)
- No se han encontrado en la informacion disponible papers, blogs, repositorios de codigo ni demos adicionales.
