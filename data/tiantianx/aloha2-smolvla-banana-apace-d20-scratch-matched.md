# tiantianx/aloha2-smolvla-banana-apace-d20-scratch-matched

## Resumen

A-PACE ALOHA banana (d=20) es el artefacto de investigacion publicado por el usuario `tiantianx` en HuggingFace bajo el identificador `tiantianx/aloha2-smolvla-banana-apace-d20-scratch-matched`. No es un modelo de lenguaje, sino un componente de control para robotica manipulativa: un modelo predictivo del mundo (JEPA) entrenado desde cero y dos adaptadores opcionales que se acoplan a una politica VLA congelada. El objetivo es predecir el estado futuro (condicion visual y estado articular normalizado de 14 dimensiones de un sistema ALOHA) 20 pasos de control por delante, equivalentes a 400 ms a 50 Hz, para compensar la latencia de comunicacion en tareas de insercion.

El sistema se apoya en la politica base `yhong96/aloha2_smolvla_banana_v2` (familia SmolVLA, etiquetada como `smolvla` y `aloha`), que permanece congelada durante el entrenamiento del JEPA y de los adaptadores. El JEPA se entrena sobre caracteristicas cacheadas de esa politica y se selecciona por error cuadratico medio (MSE) sobre articulaciones fisicas en un conjunto de validacion retenido, no por su ultimo paso de entrenamiento. La innovacion principal es el desacoplamiento entre el modelo del mundo, entrenado aparte, y la politica que finalmente ejecuta las acciones.

Su relevancia actual es acotada y experimental: el propio autor advierte que las mejoras aportadas por los adaptadores son pequenas, que sus intervalos de confianza bootstrap al 95 % incluyen el cero y que el exito fisico del robot y la suavidad del handover siguen sin verificarse. El repositorio es privado, requiere autenticacion y no declara licencia, lo que limita cualquier uso fuera del entorno de investigacion del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica VLA (SmolVLA, etiqueta `smolvla`) con modelo predictivo del mundo JEPA entrenado desde cero y adaptadores residuales de inicializacion a cero |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto textual; horizonte de accion nativo de 50 pasos, con retardo de 20 pasos de control (400 ms a 50 Hz) y entrada de 20 vectores de comando ALOHA absolutos de 14 dimensiones |
| Tipos de cuantizacion | no disponible (unicamente checkpoints PyTorch `.pt`) |
| Idiomas soportados | `en` segun las etiquetas del repositorio; el modelo no procesa lenguaje natural, solo condiciones visuales y comandos de accion |
| Licencia | no disponible (el repositorio es privado) |
| Formato de pesos | PyTorch (`.pt`): `jepa_training/best.pt`, `adapter_training/step001500.pt`, `adapter_training/step002000.pt`; incluye `SHA256SUMS.json`, `RELEASE.json` y registros de validacion |

## Arquitectura y entrenamiento

El JEPA se inicializa desde cero y se entrena sobre caracteristicas de una politica congelada, con lote efectivo de 16, AdamW con pico de learning rate 2e-4, scheduler OneCycle y 20 epocas, hasta un total de 25.200 pasos. La funcion de perdida combina MSE visual, MSE sobre articulaciones fisicas del brazo y MSE de la pinza, ponderadas mediante escalas calculadas solo con datos de entrenamiento, mas una perdida coseno. La entrada es la condicion nativa actual junto con 20 vectores de comando ALOHA absolutos de 14 dimensiones ya comprometidos; la salida es la condicion visual futura y el estado articular y de pinza normalizado. El entrenamiento se reanudo en el paso 12.000 tras una interrupcion, restaurando optimizador y scheduler, pero el guardado anterior no incluia el estado del generador de numeros aleatorios, por lo que la recuperacion no es identica bit a bit a un entrenamiento ininterrumpido.

Los adaptadores, en cambio, anaden un residual de inicializacion a cero sobre un JEPA y una VLA congelados, con 2.000 actualizaciones, lote efectivo de 4 y learning rate 1e-4. Las etiquetas de entrenamiento restan el estado articular predicho en el momento del handover a los comandos absolutos de demostracion, mientras que la pinza permanece en valores absolutos; esto alinea el objetivo de entrenamiento con la reconstruccion de acciones que se ejecuta en tiempo de inferencia. Los adaptadores ajustan la condicion visual y no corrigen por si mismos la prediccion de estado del JEPA. No se incluye ninguna perdida de jerk fisico ni de frontera. La seleccion del checkpoint publicado es exploratoria sobre el conjunto de validacion y no constituye un resultado de test independiente.

## Capacidades

- Prediccion de estado fisico futuro de un brazo ALOHA: estado articular de 14 dimensiones y estado de pinza normalizados, con horizonte de 20 pasos de control.
- Prediccion de condicion visual futura (caracteristicas visuales), aunque en este checkpoint el MSE visual es peor que el de la version anterior.
- Compensacion de latencia en bucle de control: permite arrancar un chunk de acciones condicionado al futuro sin saltarse acciones adicionales en el handover programado.
- Reconstruccion de comandos absolutos a partir de offsets articulares generados, usando el estado de handover predicho; las pinzas se mantienen absolutas.
- Ajuste fino mediante adaptadores residuales sobre una politica congelada, sin reentrenar la VLA subyacente.
- Seleccion de checkpoint por metrica fisica de validacion (MSE de articulaciones del brazo) en lugar de por paso final.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio o generacion de texto: no disponible; son capacidades ajenas al proposito de este artefacto.
- Capacidades multilingues: no aplica; el modelo consume condiciones visuales y comandos de accion.

## Casos de uso

- Manipulacion robotica con retardo de comunicacion: el JEPA predice el estado del brazo 400 ms en el futuro (20 pasos a 50 Hz), lo que permite emitir comandos condicionados al futuro y mantener el control estable cuando el enlace introduce latencia.
- Tarea de insercion de precision (banana insertion): el modelo se entrena especificamente sobre el conjunto `yhong96/aloha2_banana_insertion`, por lo que su evaluacion natural es esta tarea de ensamblaje con ALOHA.
- Investigacion en modelos predictivos del mundo (JEPA) aplicados a robotica: sirve como base reproducible para comparar arquitecturas de prediccion de estado visual y articular sobre caracteristicas congeladas de una VLA.
- Estudio de adaptadores residuales sobre politicas congeladas: los checkpoints de 1.500 y 2.000 pasos permiten medir cuanto se puede mejorar una VLA congelada anadiendo un residual de bajo coste, sin reentrenar la politica completa.
- Evaluacion de handover en control por chunks: el artefacto documenta explicitamente la convencion de arrancar el chunk condicionado al futuro en el indice 0, util para validar logicas de scheduling y de reconstruccion de acciones en entornos de teleoperacion.
- Benchmark interno de robustez en bucle cerrado: dado que las mejoras medidas son marginales y los intervalos de confianza incluyen el cero, el artefacto es un candidato util para disenar protocolos que distingan mejoras reales de ruido de muestreo.
- Despliegue en laboratorio con hardware de gama media: al pesar el repositorio 0,4 GB y no incluir la VLA completa, el coste de almacenamiento y de carga es bajo, lo que facilita ciclos de iteracion rapidos en maquinas de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Los unicos datos disponibles son metricas de validacion internas sobre 8 episodios retenidos y 2.240 ventanas.

JEPA (checkpoint seleccionado en el paso 20.160 frente al JEPA anterior):

| Metrica | JEPA nuevo (paso 20.160) | JEPA anterior |
|---|---:|---:|
| RMSE de las 12 articulaciones del brazo | 1,454 grados | 3,303 grados |
| RMSE del angulo de muneca izquierda | 1,869 grados | 6,762 grados |
| Error maximo del angulo de muneca izquierda | 6,213 grados | 30,827 grados |
| MSE de caracteristicas visuales | 1822,034 | 1728,156 |

La prediccion de estado mejora de forma clara, mientras que la prediccion visual empeora respecto al modelo anterior.

Adaptadores (128 ventanas de los mismos 8 episodios retenidos, mismo ruido de muestreo, muestreo completo de acciones y reconstruccion de comandos absolutos; reduccion relativa de MSE frente al JEPA nuevo puro):

| Paso del adaptador | Chunk completo, brazo | Primeras 3 acciones, brazo | Pinza |
|---|---:|---:|---:|
| 500 | 2,21 % | 0,74 % | 5,53 % |
| 1.000 | 1,62 % | 0,70 % | 5,50 % |
| 1.500 | 2,63 % | 1,00 % | 6,28 % |
| 2.000 | 2,10 % | 0,52 % | 7,26 % |

Los intervalos bootstrap pareados al 95 % por episodio incluyen el cero y no se observa una mejora consistente del error de brazo al aumentar los pasos de 500 a 2.000. Estas metricas no son jerk fisico, y el exito del robot y la suavidad del handover permanecen sin verificar en esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio completo ocupa 0,4 GB e incluye tres checkpoints, lo que sugiere modelos de decenas de millones de parametros, pero el autor no publica el numero de parametros ni la precision de los pesos.
- La VLA base (`yhong96/aloha2_smolvla_banana_v2`) se descarga por separado y su requisito de memoria no se especifica en la informacion disponible; hay que sumar su huella a la del JEPA y el adaptador.
- GPU recomendadas: no disponible. Por el tamano del artefacto es razonable esperar que una GPU de consumo moderna (por ejemplo, RTX 3090 o RTX 4090) sea suficiente, pero esto es una estimacion derivada del tamano del repositorio y no un dato confirmado por el autor.
- Viabilidad en GPU de consumo: probable para el JEPA y los adaptadores por si solos, sin confirmar para el sistema completo con la VLA base.
- Opciones de despliegue: no se contemplan vLLM, llama.cpp, Ollama ni TGI. El unico camino documentado es el paquete de rollout ALOHA A-PACE existente, lanzado como servidor de politica con las opciones `--jepa-checkpoint` y, opcionalmente, `--aca-checkpoint`.
- Latencia y throughput: el diseno impone un presupuesto de 400 ms por ciclo (20 pasos de control a 50 Hz), tiempo maximo en el que debe completarse la prediccion y la generacion del chunk. No se publican cifras de throughput ni de latencia medida.
- Restriccion operativa: no se puede mezclar un adaptador con un checkpoint JEPA distinto del que aparece en `RELEASE.json`, ni reutilizar estos pesos con la release intermedia de 12.600 pasos. Tampoco debe aplicarse dos veces la conversion de offsets articulares a objetivos absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tiantianx/aloha2-smolvla-banana-apace-d20-scratch-matched` | no disponible | Horizonte nativo 50, retardo de 20 pasos (400 ms a 50 Hz) | RMSE de brazo de 1,454 grados en validacion (8 episodios) | no disponible | Repositorio privado, 0 descargas, 0 likes |
| Release intermedia de 12.600 pasos del mismo autor | no disponible | Igual | JEPA anterior: RMSE de brazo de 3,303 grados; MSE visual de 1728,156 | no disponible | Referenciada, incompatible con los adaptadores de esta release |
| `yhong96/aloha2_smolvla_banana_v2` (politica base) | no disponible | Politica VLA de la que depende este artefacto | No se publican metricas propias en la informacion disponible | no disponible | Repositorio publico en HuggingFace, revision fijada `558170cf34a8a5c83e5ce68944846186a82a4b80` |
| Otros modelos de la familia SmolVLA o VLAs roboticas comparables (OpenVLA, pi0, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas externas de la misma categoria.

## Limitaciones y advertencias

- Las mejoras de los adaptadores son marginales: reducciones relativas de MSE de entre el 0,52 % y el 7,26 % segun metrica, con intervalos bootstrap al 95 % que incluyen el cero.
- La seleccion del checkpoint se hizo sobre el mismo conjunto de validacion usado para reportar, por lo que es exploratoria y no constituye un test independiente.
- La prediccion visual empeora respecto al JEPA anterior (MSE de 1822,034 frente a 1728,156), pese a que la prediccion de estado mejora.
- No se han verificado el exito fisico de la tarea ni la suavidad del handover; las metricas reportadas no son jerk fisico y no incluyen perdidas de frontera.
- La recuperacion del entrenamiento tras la interrupcion en el paso 12.000 no es bit a bit identica a un entrenamiento ininterrumpido, al no haberse guardado el estado del generador aleatorio.
- Acoplamiento estricto entre artefactos: cada adaptador solo funciona con el JEPA cuyo SHA256 aparece en `RELEASE.json`, y ninguno es compatible con la release de 12.600 pasos.
- Riesgo operativo en el runtime: la conversion de offsets articulares generados a objetivos absolutos se realiza con el estado de handover predicho; aplicarla dos veces produce comandos incorrectos. Las pinzas deben permanecer absolutas.
- El repositorio es privado y requiere autenticacion con una cuenta con acceso, lo que impide su reproduccion publica.
- No se declara licencia, por lo que no hay autorizacion explicita de uso comercial ni condiciones de redistribucion.
- No aplica el riesgo de alucinacion de un modelo de lenguaje; el riesgo equivalente es el error de prediccion fisica y visual, cuantificado en las tablas de validacion.
- Idiomas: la etiqueta `en` es heredada del ecosistema de HuggingFace y no implica capacidad de procesamiento de lenguaje natural.
- Sesgos conocidos: no disponible. El modelo se limita a la distribucion de la tarea de insercion de banana sobre ALOHA, por lo que no se espera generalizacion fuera de ese dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tiantianx/aloha2-smolvla-banana-apace-d20-scratch-matched
- Politica base: https://huggingface.co/yhong96/aloha2_smolvla_banana_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/yhong96/aloha2_banana_insertion
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible
- Enlaces relevantes procedentes de la busqueda web: no disponible (los resultados obtenidos corresponden a clasificaciones de la liga australiana de futbol y no guardan relacion con el modelo)
