# xzz789/smolvla-piperx-dune-298890

## Resumen

SmolVLA PiperX DUNE K=4096 (job 298890) es un conjunto de checkpoints de inferencia para el modelo de robotica SmolVLA, publicados por el usuario xzz789 en Hugging Face. SmolVLA es una politica vision-lenguaje-accion (VLA) compacta basada en la libreria LeRobot de Hugging Face, disenada para controlar robots manipuladores a partir de instrucciones en lenguaje natural e imagenes de camaras. En este caso concreto, el modelo se ha ajustado sobre un dataset bimanual de un robot PiperX para la tarea de mover una caja de izquierda a derecha.

El repositorio contiene unicamente pesos de inferencia (no incluye estado del optimizador ni el estado de entrenamiento DUNE), distribuidos en subcarpetas por paso de entrenamiento. El ajuste se realizo con el metodo DUNE con K=4.096 sobre 99 episodios y 90.994 fotogramas capturados por tres camaras, con un presupuesto de 24.000 actualizaciones del que finalmente se completaron 17.940 por agotamiento de cuota de GPU.

Se trata de un artefacto de investigacion muy especifico: un ajuste fino sobre una tarea robotica concreta, sin evaluacion abierta publicada y sin licencia declarada. Su relevancia es limitada fuera del contexto del experimento original, pero resulta util como ejemplo de flujo de trabajo LeRobot + DUNE para ajuste de politicas VLA en robots bimanuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (politica vision-lenguaje-accion de LeRobot), ajustada con DUNE |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` + `config.json` + ficheros de normalizacion pre/post-procesado) |

## Arquitectura y entrenamiento

El modelo parte de SmolVLA, una politica VLA compacta de la familia LeRobot que combina un codificador visual, un modelo de lenguaje pequeno y un cabezal de acciones para generar comandos motores a partir de observaciones multimodales e instrucciones textuales. Sobre esta base se aplico un ajuste con el metodo DUNE (K=4.096, variante "expert"), con batch de 256, semilla 42, precision TF32 y un schedule coseno completo hasta 24.000 actualizaciones.

Los datos de entrenamiento provienen del dataset `piperx-bimanual-move-box-left-to-right-100-clean`: 99 episodios, 90.994 fotogramas y tres camaras, correspondientes a una tarea bimanual de traslado de una caja de izquierda a derecha con un robot PiperX. El entrenamiento se detuvo en la actualizacion 17.940 de las 24.000 previstas por agotamiento de la cuota de minutos de GPU del cluster HKU; el ultimo checkpoint disponible es el 17.000. El nombre del run es `dune_k4096_expert_piperx99_b256_s24000_seed42_tf32`. No se detalla la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de acciones motoras para un robot manipulador bimanual PiperX a partir de observaciones de tres camaras e instrucciones de tarea.
- Control viso-motor para la tarea especifica de mover una caja de izquierda a derecha.
- Inferencia con LeRobot mediante `SmolVLAPolicy.from_pretrained(...)` indicando la subcarpeta del checkpoint.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento (thinking).
- Capacidades multilingues: no disponibles; el modelo no esta pensado para generacion de texto general.

## Casos de uso

- Investigacion en politicas VLA: utilizar los checkpoints como referencia para reproducir o comparar el ajuste DUNE sobre SmolVLA en tareas bimanuales.
- Prototipado de manipulacion bimanual: desplegar el checkpoint 17.000 en un PiperX para evaluar la tarea de traslado de caja en laboratorio.
- Benchmark interno de metodos de ajuste: comparar DUNE K=4.096 frente a otros metodos sobre el mismo dataset `piperx-bimanual-move-box-left-to-right-100-clean`.
- Estudio de convergencia y checkpoints intermedios: analizar la evolucion del modelo entre los pasos 0 y 17.000 disponibles.
- Base para ajuste fino posterior: partir de un checkpoint intermedio y continuar el entrenamiento con otro dataset o tarea similar.
- Docencia y demos de LeRobot: mostrar el flujo completo de carga de una politica SmolVLA desde Hugging Face con `SmolVLAPolicy.from_pretrained`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion en lazo abierto (open-loop) de estos checkpoints aun no se ha publicado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 30,6 GB e incluye multiples checkpoints, no un unico modelo.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no determinada; depende del tamano real de SmolVLA (no indicado).
- Opciones de despliegue: LeRobot (`SmolVLAPolicy.from_pretrained`), con carga desde el repositorio remoto o desde una subcarpeta descargada localmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos comparables ni resultados de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Modelo altamente especifico: entrenado unicamente para la tarea `piperx-bimanual-move-box-left-to-right-100-clean` sobre un robot PiperX; no generaliza a otras tareas ni plataformas sin reentrenamiento.
- Entrenamiento incompleto: se detuvo en la actualizacion 17.940 de 24.000; el ultimo checkpoint es el 17.000, por lo que el modelo no alcanzo el schedule coseno completo previsto.
- Sin evaluacion publicada: no hay resultados de open-loop ni de despliegue real, lo que impide conocer su fiabilidad.
- Licencia no declarada: no se especifican condiciones de uso comercial ni restricciones; debe tratarse como no apto para produccion hasta aclarar la licencia.
- Solo pesos de inferencia: no incluye estado del optimizador ni `dust.pt`, por lo que no es posible reanudar el entrenamiento DUNE desde estos ficheros.
- Riesgo de sobreajuste al dataset reducido (99 episodios) y a una unica tarea.
- Sin informacion sobre sesgos, idiomas ni comportamiento fuera de distribucion.

## Enlaces

- Hugging Face: https://huggingface.co/xzz789/smolvla-piperx-dune-298890
- LeRobot (libreria): https://github.com/huggingface/lerobot
- SmolVLA (modelo base, referencia de la familia): no disponible en la informacion proporcionada.
