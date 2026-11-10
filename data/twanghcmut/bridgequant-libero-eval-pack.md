# twanghcmut/bridgequant-libero-eval-pack

## Resumen

BridgeQuant-Libero-Eval-Pack es un paquete de checkpoints publicado por el usuario twanghcmut en Hugging Face, orientado a la evaluacion de modelos de vision-lenguaje-accion (VLA) en el benchmark LIBERO de robotica. No se trata de un modelo entrenado de proposito general, sino de un artefacto de investigacion: un conjunto de pesos y scripts de evaluacion preparados para reproducir experimentos concretos del repositorio `bridgequant-async` (commit `5236626` o posterior). El paquete esta disenado para descargarse directamente en el directorio `runs/` de dicho repositorio y ejecutar rollouts resumibles en el simulador LIBERO.

El contenido abarca seis grupos de experimentos (probes, full, h50, frozen, ternary y ternary_scratch), cada uno con su propio directorio de ejecucion y fichero de configuracion YAML dentro de `configs/bridgequant_vla/experiments/`. Los checkpoints corresponden a variantes de un modelo VLA denominado internamente con prefijos como `joint4_tinyvl_tbexcess_augS_wd3e-3` y `joint4_nano_theia_w128_kd_ternary`, lo que sugiere arquitecturas de tipo transformer pequeno con componentes de vision y cuantizacion ternaria, aunque la model card no detalla la arquitectura subyacente.

La relevancia de este paquete es acotada pero practica para el nicho de robotica y VLA: permite reproducir evaluaciones estandarizadas (LIBERO-Spatial y otras suites, con 500 episodios por suite y multiples semillas de ruido) sin reentrenar, y facilita la comparacion entre variantes de cuantizacion y congelacion de pesos. El tamano del repositorio es de 1,7 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere VLA con componentes de vision y transformer, no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | variante ternaria incluida (`joint4_nano_theia_w128_kd_ternary`); resto no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de los checkpoints. Los nombres de los directorios de ejecucion (`joint4_tinyvl_tbexcess_augS_wd3e-3_full`, `joint4_tinyvl_tbexcess_augS_wd3e-3_H50`, `joint4_tinyvl_tbexcess_augS_wd3e-3_frozen`, `joint4_nano_theia_w128_kd_ternary`) apuntan a variantes de un modelo VLA con un backbone de vision-lenguaje de tipo "tinyvl", entrenado con aumento de datos (`augS`), weight decay de 3e-3 (`wd3e-3`) y, en una de las variantes, destilacion de conocimiento (`kd`) con cuantizacion ternaria. La variante `H50` sugiere un ajuste de horizonte o de parametro H a 50, y la variante `frozen` implica pesos congelados en alguna parte del modelo.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla si se emplea atencion lineal, decodificacion especulativa u otras innovaciones. El unico detalle operativo relevante es que el paquete incluye un script `_pack/run_eval_pack.sh` resumible y un gate de pixeles (`_pack/egl_ok.py`) que aborta la evaluacion si el simulador renderiza fotogramas en negro, lo que indica que el pipeline depende de renderizado EGL/OpenGL.

## Capacidades

- Ejecucion de rollouts de evaluacion en el simulador LIBERO para tareas de manipulacion robotica.
- Evaluacion estandarizada en LIBERO-Spatial (500 episodios, K=16, semilla de ruido 0) para los siete checkpoints del grupo `probes`.
- Evaluacion multi-suite (cuatro suites) con 500 episodios por suite y tres semillas de ruido para los grupos `full`, `h50`, `frozen` y `ternary`.
- Evaluacion adicional con K=25 en el grupo `h50`.
- Soporte de ejecucion resumible mediante script de shell, lo que permite reanudar evaluaciones largas.
- Verificacion de integridad del renderizado mediante un gate de pixeles que detecta fotogramas negros.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes ni multilingues; el artefacto es especifico de robotica VLA.

## Casos de uso

- Reproduccion de experimentos de investigacion en VLA: descargar el paquete en `runs/` del repositorio `bridgequant-async` y ejecutar `run_eval_pack.sh` permite replicar los resultados publicados por el autor sin reentrenar, lo que es util para validar articulos o informes tecnicos.
- Comparacion de variantes de cuantizacion: el grupo `ternary` frente al grupo `full` permite medir el impacto de la cuantizacion ternaria en la tasa de exito de LIBERO manteniendo el resto de hiperparametros.
- Estudio del efecto de congelar pesos: el grupo `frozen` frente a `full` aisla la contribucion del ajuste fino completo en tareas de manipulacion.
- Analisis de sensibilidad al horizonte: el grupo `h50` con su pasada adicional K=25 permite estudiar como varia la tasa de exito al aumentar el numero de pasos de planificacion.
- Calibracion de semillas de ruido: las tres semillas por suite en los grupos `full`, `h50`, `frozen` y `ternary` permiten estimar la varianza de la metrica y detectar diferencias estadisticamente significativas entre variantes.
- Integracion en pipelines de CI para robotica: el gate `egl_ok.py` y el caracter resumible del script permiten incorporar la evaluacion como paso automatizado que falla de forma explicita si el entorno de renderizado no esta correctamente configurado.
- Docencia y formacion: el paquete sirve como ejemplo practico de evaluacion estandarizada en LIBERO con checkpoints preentrenados, util en cursos de robotica o aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la configuracion de las evaluaciones (suites, numero de episodios, K, semillas de ruido) pero no incluye tasas de exito ni metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (1,7 GB) sugiere que los checkpoints son pequenos y podrian caber en GPUs de consumo, pero no se confirma en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el unico requisito documentado es un entorno con renderizado EGL/OpenGL funcional para el simulador LIBERO.
- Opciones de despliegue: el paquete esta pensado para ejecutarse mediante el script `_pack/run_eval_pack.sh` del repositorio `bridgequant-async`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card indica que el throughput esta limitado por CPU (paso y renderizado de LIBERO) y que la tasa de exito no depende de dicho throughput; no se proporcionan cifras concretas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (VLA para LIBERO) ni datos de rendimiento que permitan establecer una comparacion.

## Limitaciones y advertencias

- El artefacto no es un modelo de proposito general: es un paquete de checkpoints para evaluacion en LIBERO y no debe usarse para generacion de texto, codigo ni otras tareas.
- La licencia es "other" y no se detallan sus terminos; es imprescindible revisar las condiciones antes de cualquier uso comercial o redistribucion.
- No se documentan sesgos conocidos, pero al tratarse de un modelo de robotica entrenado sobre un benchmark concreto, su comportamiento fuera de LIBERO no esta caracterizado.
- Riesgo de alucinacion: no aplica en el sentido habitual de modelos de lenguaje, pero la politica aprendida puede fallar en escenarios no representados en el dataset de entrenamiento.
- La evaluacion depende de un entorno grafico con EGL/OpenGL operativo; sin el, el gate `egl_ok.py` aborta la ejecucion.
- El script de evaluacion requiere el commit `5236626` o posterior del repositorio `bridgequant-async`; versiones anteriores pueden no ser compatibles con la estructura de directorios `runs/`.
- No se especifican idiomas soportados ni limitaciones de contexto.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/twanghcmut/bridgequant-libero-eval-pack
- Repositorio referenciado en la model card: `bridgequant-async`, commit `5236626` o posterior (no se proporciona URL directa en la informacion disponible).
- No se han encontrado en la busqueda web enlaces relevantes adicionales (el unico resultado devuelto, sobre ciudades inteligentes, no guarda relacion con el modelo).
