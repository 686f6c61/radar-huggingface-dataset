# Supreme-Ed/microduck-tug-vsnico

## Resumen

`Supreme-Ed/microduck-tug-vsnico` es una política de control obtenida por aprendizaje por refuerzo para el robot microduck, publicada en HuggingFace por el usuario Supreme-Ed el 28 de octubre de 2026. No es un modelo de lenguaje: es una política de comportamiento («gait») pensada para ocupar un slot de política en el daemon del robot y ejecutarse de forma perpetua hasta que se le indique lo contrario, a una frecuencia de control de 50 Hz, con un espacio de observación de 61 dimensiones y 14 acciones.

La política está especializada en la tarea de Tug of War (tira y afloja) con una estrategia descrita por el autor como «cup-first», y se presenta con dos referencias de rendimiento autoinformadas: un resultado «5-5» frente a la política Nico base y una supervivencia de 13,8 s frente al «wrapper n.º 1». Se distribuye como `policy.onnx` con el normalizador de observaciones embebido en el propio grafo, más un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para experimentos de RL sobre robótica de bajo coste y como ejemplo de empaquetado de políticas (ONNX + manifiesto + carga vía `robotctl`) en el ecosistema microduck de Pollen Robotics. El repositorio no incluye licencia, idiomas, número de parámetros ni resultados de benchmarks estándar, y acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Política de RL exportada a ONNX; la model card no especifica la topología de red (capas, tipo de red ni algoritmo de entrenamiento) |
| Parametros totales | No disponible. Tamano del repo: 0,0 GB (por debajo de 0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. No es un modelo de lenguaje; el equivalente funcional es una ventana de observacion de 61 dimensiones por paso de control |
| Tipos de cuantizacion | No disponible. Unico artefacto documentado: `policy.onnx` (sin variantes cuantizadas publicadas) |
| Idiomas soportados | No aplica / no disponible (politica de control robotico, sin interfaz de lenguaje) |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de politicas de microduck |
| Frecuencia de control | 50 Hz (periodo de 20 ms) |
| Espacio de observacion | 61 dimensiones, con normalizador embebido en el modelo ONNX (se alimentan observaciones en crudo) |
| Espacio de accion | 14 acciones |
| Modo de ejecucion | Politica perpetua: se ejecuta hasta recibir orden de parada |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura de la red. Se sabe que es una politica de aprendizaje por refuerzo entrenada en el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `4b675ebf4`) y exportada a ONNX para su ejecucion en el robot. El autor indica explicitamente que la exportacion se realizo desde un checkout con cambios sin confirmar, lo que impide garantizar que el binario publicado corresponda exactamente al commit declarado.

El contrato de interfaz esta bien definido: 61 entradas de observacion, 14 salidas de accion, 50 Hz, y normalizacion de observaciones integrada en el grafo ONNX, de modo que el consumidor no necesita replicar el pipeline de preprocesado. El comportamiento aprendido se describe como una politica de tira y afloja con estrategia «cup-first», entrenada frente a la politica Nico base. No se documentan numero de tokens ni de episodios, composicion del dataset, uso de RLHF/DPO (no aplicable en este dominio), ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de acciones de control motor para el robot microduck: mapea 61 observaciones a 14 acciones a 50 Hz.
- Locomocion/tira y afloja especializada: politica «cup-first» orientada a la tarea de Tug of War.
- Ejecucion perpetua: mantiene el comportamiento indefinidamente hasta que se le ordena parar (no es una politica episodica con terminacion propia).
- Normalizacion integrada: acepta observaciones en crudo, sin preprocesado externo.
- Carga como slot de politica mediante `robotctl policy load <slot> Supreme-Ed/microduck-tug-vsnico`.
- Compatibilidad con el manifiesto de politicas de microduck, esquema 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo generativo de texto.

## Casos de uso

- Referencia base para experimentos de Tug of War: cargar la politica en un slot y enfrentarla a Nico base o a wrappers propios para obtener una linea base estable con la que comparar nuevas politicas entrenadas en `microduck_rl`.
- Validacion de pipelines de entrenamiento: al proceder de un commit concreto del repositorio de RL, sirve para comprobar que un cambio en el entorno de simulacion o en la recompensa produce politicas comparables a esta.
- Prueba de integracion del daemon de microduck: su contrato claro (61-D, 14 acciones, 50 Hz, ONNX con normalizador embebido) la convierte en una candidata comoda para verificar el flujo `robotctl policy load` y el parseo del manifiesto de esquema 2.
- Evaluacion de robustez frente a oponentes: el dato de supervivencia de 13,8 s contra el wrapper n.º 1 permite usarla como sujeto de prueba al desarrollar wrappers o contraestrategias mas agresivas.
- Demostraciones y docencia en robotica de bajo coste: politica perpetua que arranca con un solo comando, util para talleres donde no se quiere exponer el pipeline de entrenamiento.
- Benchmark interno de latencia: con un presupuesto de 20 ms por paso a 50 Hz, sirve para medir si el hardware objetivo (CPU del robot o un acelerador externo) cumple el ciclo de control con margen.
- Base para ajuste fino: punto de partida para entrenar variantes de la estrategia «cup-first» en lugar de partir de cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; no aplican a este tipo de modelo. Los unicos datos de rendimiento son autoinformados por el autor:

| Prueba | Resultado | Nota |
|---|---|---|
| Tug of War frente a Nico base | «5-5» | La model card no aclara si «5-5» es el marcador del enfrentamiento o el formato (5 contra 5); dato no verificable de forma independiente |
| Supervivencia frente al wrapper n.º 1 | 13,8 s | Descripcion textual: «survives 13.8 s vs the #1 wrapper» |
| Frecuencia de control | 50 Hz | Especificacion de diseno, no medida de rendimiento publicada |

No hay informacion sobre numero de episodios de evaluacion, semillas, varianza entre ejecuciones ni condiciones del entorno de prueba.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 61 entradas y 14 salidas y un repositorio de menos de 0,1 GB, la inferencia es viable en CPU; el autor no publica cifras de memoria.
- GPU recomendadas: no disponibles. No se requiere GPU para el caso de uso previsto (ejecucion en el propio robot a traves del daemon microduck).
- GPU de consumo: no aplica como requisito; cualquier GPU consumer moderna excederia ampliamente las necesidades de una red de este tamano, pero no hay datos publicados al respecto.
- Opciones de despliegue: el camino soportado es `robotctl policy load <slot> Supreme-Ed/microduck-tug-vsnico` sobre el daemon de microduck. Al ser ONNX, es tecnicamente portable a ONNX Runtime en otras plataformas, aunque el autor no documenta ni soporta ese uso.
- Latencia y throughput: el ciclo de control impone 20 ms por paso (50 Hz). No se publican latencias medidas ni throughput en ningun hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / interfaz | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-vsnico | No disponible | 61-D observacion, 14 acciones, 50 Hz | «5-5» vs Nico base; 13,8 s vs wrapper n.º 1 (autoinformado) | No disponible | Publico en HuggingFace, 0 descargas |
| Nico base (politica de referencia) | No disponible | No disponible | Usada como oponente de referencia; sin metricas publicadas en esta ficha | No disponible | No disponible como artefacto independiente en la informacion consultada |
| Wrapper n.º 1 | No disponible | No disponible | Cita como «el wrapper n.º 1»; sin metricas publicadas | No disponible | No disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria; la model card solo nombra a los oponentes, sin especificaciones ni resultados detallados de estos.

## Limitaciones y advertencias

- Ausencia de licencia: no se declara licencia alguna, por lo que no hay autorizacion explicita de uso comercial, redistribucion ni obras derivadas. Tratarlo como no apto para produccion hasta contactar con el autor.
- Reproducibilidad comprometida: el propio autor indica que la exportacion se hizo desde un checkout con cambios sin confirmar sobre el commit `4b675ebf4`, de modo que el ONNX publicado podria no corresponder exactamente al codigo declarado.
- Validacion practicamente nula: 0 descargas y 0 likes; sin revision independiente ni resultados reproducidos por terceros.
- Metricas ambiguas: «5-5» no se define (marcador o formato) y los 13,8 s de supervivencia carecen de contexto experimental (numero de ensayos, semillas, condiciones).
- Sobreajuste a los oponentes de entrenamiento: al haberse entrenado y evaluado contra Nico base y el wrapper n.º 1, el comportamiento puede degradarse frente a oponentes o perturbaciones distintas.
- Politica perpetua sin terminacion propia: se ejecuta hasta recibir orden de parada; en un robot real esto exige un mecanismo de parada fiable y supervision, con el riesgo asociado de movimiento continuado ante fallos del daemon.
- Dominio muy restringido: solo tareas de tipo tira y afloja sobre microduck; no transferible a otros robots, morfologias ni tareas sin reentrenamiento.
- Documentacion incompleta: sin numero de parametros, arquitectura, detalles del entorno de entrenamiento ni limites conocidos del espacio de observacion.
- Riesgo de confusion del nombre: el autor «Supreme-Ed» no guarda relacion con la marca de ropa Supreme que domina los resultados de busqueda web; conviene no atribuir el modelo a dicha marca.
- Sin garantia de mantenimiento: la model card no indica soporte, versionado ni plan de actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Supreme-Ed/microduck-tug-vsnico
- Repositorio del robot y daemon microduck (referenciado en la model card): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL citado: `pollen-robotics/microduck_rl`, rama `main`, commit `4b675ebf4` (sin URL directa en la informacion proporcionada)
- Especificacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon (esquema 2)
- Los resultados de busqueda web disponibles corresponden a la marca de ropa Supreme y no son relevantes para este modelo; no se han encontrado papers, blogs ni demos adicionales.
