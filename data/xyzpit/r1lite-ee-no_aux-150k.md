# XYZPIT/r1lite-ee-no_aux-150k

## Resumen

r1lite-ee-no_aux-150k es un ajuste fino del modelo robótico nvidia/GR00T-N1.7-3B publicado por el usuario XYZPIT en HuggingFace. Se trata de una política de tipo vision-language-action (VLA) orientada al control de efector final (end-effector) del robot R1 Lite, con 3.144.016.000 parámetros totales almacenados en safetensors y un repositorio de 12,6 GB. El checkpoint corresponde al paso de entrenamiento 150.000 y se distribuye junto con los artefactos de procesador necesarios para su ejecución.

El interes de esta publicacion es fundamentalmente experimental: documenta una ablation concreta en la que las perdidas auxiliares (consistencia de trayectoria, rollout de acciones y suavidad de velocidad) se fijan a 0.0, manteniendo unicamente el objetivo estandar de flow matching de un solo paso. El autor compara este checkpoint con una variante denominada TCFM 150k bajo el mismo protocolo de evaluacion, lo que permite aislar el efecto de dichas perdidas auxiliares sobre el error de reconstruccion de acciones.

No es un modelo de lenguaje de proposito general ni un chatbot: es una politica robotica que consume imagenes de tres camaras, estado articular y poses de efector final, y produce 20 dimensiones de accion. Su uso requiere el codebase Isaac-GR00T N1.7 y el registro especifico del modelo y del procesador, y su licencia es la NVIDIA Open Model License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de GR00T N1.7: backbone vision-lenguaje congelado (Cosmos-Reason2-2B) mas cabeza de difusion entrenable y proyector |
| Parametros totales | 3.144.016.000 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para texto; ventana de accion de la modalidad de 32 fotogramas e horizonte de accion interno de 40 |
| Tipos de cuantizacion | No disponibles; entrenamiento en bfloat16 de precision mixta y pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | nvidia-open-model-license (NVIDIA Open Model License Agreement) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | nvidia/GR00T-N1.7-3B (relacion: finetune) |
| Embodiment tag | new_embodiment |
| Dimensiones de accion | 20 (pincas izquierda/derecha y poses de efector final) |
| Entradas | Camaras de cabeza, muneca izquierda y muneca derecha (RGB); estado de articulaciones de ambos brazos, pincas y poses de efector final (xyz + rotacion 6D) |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de GR00T N1.7: un backbone de vision y lenguaje congelado (los assets de configuracion y procesador de nvidia/Cosmos-Reason2-2B, alojados por separado) alimenta un proyector entrenable y una cabeza de difusion que genera las acciones. El entrenamiento solo actualiza el proyector, el modelo de difusion y el componente VLLN, dejando intactos el backbone de lenguaje y el de vision. El objetivo de entrenamiento es un flow matching estandar de un solo paso; los pesos de consistencia de trayectoria, rollout de acciones y suavidad de velocidad se fijan explicitamente a 0.0, de ahi el sufijo "no_aux" del nombre.

El ajuste fino parte de nvidia/GR00T-N1.7-3B con optimizador reiniciado. Se entrenaron 150.000 pasos con batch global de 16, tasa de aprendizaje 1e-4 con schedule coseno y warmup ratio 0.05, optimizador AdamW con weight decay 1e-5, semilla 42 y precision mixta bfloat16. El conjunto de datos es `260413_r1lite_ee_trimmed_gr00t`, compuesto por 50 episodios que no se distribuyen con el modelo. Las acciones del efector final usan representaciones relativas, mientras que las de las pincas son absolutas. No se documentan fases de RLHF ni DPO, dado que el dominio es de imitacion robotica y no de alineamiento conversacional.

## Capacidades

- Generacion de acciones motoras de efector final: produce 20 dimensiones de accion (pincas izquierda y derecha mas poses xyz y rotacion 6D) para control del robot R1 Lite.
- Control bimanual: consume estado de articulaciones de ambos brazos y de las dos pincas, por lo que admite tareas que requieren coordinacion de dos brazos.
- Percepcion visual multi-camara: procesa simultaneamente imagenes RGB de la cabeza y de ambas munecas.
- Condicionamiento por estado propioceptivo: integra poses de efector final y estado articular junto con la observacion visual.
- Prediccion de horizonte de accion: ventana de modalidad de 32 fotogramas y horizonte interno de 40 acciones.
- Ajuste a un nuevo embodiment: la etiqueta `new_embodiment` y la definicion de modalidades en `r1lite_ee_config.py` permiten adaptar el modelo a configuraciones distintas.
- Inferencia con muestreo por difusion: evaluado con integrador Euler y 4 pasos de denoising.
- Tool calling, function calling, agentes, razonamiento multi-paso, matematicas, codigo, vision general, audio y modo "thinking": no disponibles; no se documentan en la informacion proporcionada.

## Casos de uso

- Manipulacion con efector final en el robot R1 Lite: el modelo esta ajustado especificamente para producir poses de efector final y estados de pinca, por lo que es el uso directo del checkpoint en el bucle de control.
- Investigacion sobre perdidas auxiliares en VLA: al fijar a 0.0 los pesos de consistencia de trayectoria, rollout y suavidad, sirve como condicion de control frente a variantes como TCFM 150k en estudios de ablation.
- Evaluacion open-loop reproducible de politicas: la configuracion descrita (episodios 0-9, primeros 900 fotogramas, horizonte de ejecucion 16, Euler con 4 pasos, semilla 42) permite replicar la comparacion de MSE y MAE entre checkpoints.
- Tareas bimanuales con pincas: las representaciones absolutas de las pincas y el estado de ambos brazos permiten abordar tareas de agarre y colocacion que requieren dos efectores.
- Politica de imitacion sobre demostraciones cortas: con solo 50 episodios de entrenamiento, el modelo es adecuado para prototipado rapido de politicas en laboratorio antes de escalar la recogida de datos.
- Fine-tuning posterior con otros brazos o robots: al partir de un backbone congelado y entrenar solo proyector y cabeza de difusion, el coste de adaptar el modelo a un embodiment nuevo es menor que el de entrenar un VLA desde cero.
- Base de comparacion interna para nuevos checkpoints: el par de checkpoints del autor (este y TCFM 150k) permite medir el impacto de cambios en el objetivo de entrenamiento bajo una misma receta.
- Validacion de pipelines de datos roboticos: util para verificar que el formato de episodios, camaras y representaciones de accion (`r1lite_ee_config.py`, `processor_config.json`) es coherente antes de lanzar entrenamientos largos.

## Benchmarks y rendimiento

El unico resultado publicado es una evaluacion open-loop sobre datos de entrenamiento (episodios 0-9, primeros 900 fotogramas cada uno, horizonte de ejecucion 16, Euler con 4 pasos de denoising, semilla 42 reiniciada antes de cada trayectoria):

| Modelo | MSE medio sin normalizar | MAE medio sin normalizar |
|---|---:|---:|
| Este modelo (no_aux, 150k) | 2.883978 | 0.079286 |
| TCFM 150k (evaluacion con semilla emparejada) | 2.655958 | 0.068620 |

Estas metricas mezclan componentes de pinca, posicion y rotacion 6D. No se han publicado resultados en suites estandar (MMLU, HumanEval, GSM8K u otras) en la informacion disponible. La propia model card advierte de que la evaluacion usa episodios de entrenamiento, con una sola semilla, y que no establece generalizacion a datos no vistos ni exito en bucle cerrado sobre el robot. Los resultados por episodio se encuentran en `open_loop_metrics.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 6,3 GB en bfloat16 (3.144.016.000 parametros). Contando activaciones del backbone de vision-lenguaje, proyector y los pasos de denoising de la cabeza de difusion, se estima un consumo practico de 8-12 GB; se recomienda reservar 16 GB para margen. Estimacion propia, no confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 12-16 GB de VRAM y soporte CUDA, como RTX 4090 o RTX 3090, deberia ser suficiente para inferencia; A100 o H100 son las opciones habituales para reentrenamiento o para mayor paralelismo.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas; el repositorio completo pesa 12,6 GB, aunque en memoria solo es necesario cargar los pesos de inferencia.
- Opciones de despliegue: el unico camino documentado es el codebase Isaac-GR00T N1.7 con `Gr00tPolicy` sobre `device="cuda"`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que se trata de una politica robotica con cabeza de difusion, no de un modelo de lenguaje autorregresivo con salida de texto.
- Dependencia adicional: el modelo requiere los assets de configuracion y procesador de `nvidia/Cosmos-Reason2-2B`, alojados por separado, ademas del registro propio del modelo y del procesador.
- Ejemplo de carga documentado por el autor:

```python
from huggingface_hub import snapshot_download
from gr00t.policy.gr00t_policy import Gr00tPolicy

checkpoint = snapshot_download("XYZPIT/r1lite-ee-no_aux-150k")
policy = Gr00tPolicy(
    embodiment_tag="new_embodiment",
    model_path=checkpoint,
    device="cuda",
)
```

- Latencia y throughput: no disponibles. En la evaluacion se emplearon 4 pasos de denoising con integrador Euler y un horizonte de ejecucion de 16 acciones, lo que da una referencia del coste por inferencia, pero no se publican valores de latencia por paso ni de frecuencia de control alcanzable.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / horizonte | Rendimiento open-loop (MSE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| XYZPIT/r1lite-ee-no_aux-150k | 3,14 B | VLA finetune, flow matching sin perdidas auxiliares | Ventana de 32 fotogramas, horizonte 40 | 2.883978 | nvidia-open-model-license | Pesos safetensors en HuggingFace (0 descargas) |
| XYZPIT TCFM 150k | No disponible | VLA finetune con perdidas auxiliares | No disponible | 2.655958 | No disponible | No disponible en los datos proporcionados |
| nvidia/GR00T-N1.7-3B | 3 B (nominal) | VLA base (backbone Cosmos-Reason2-2B mas cabeza de difusion) | No disponible | No disponible | nvidia-open-model-license | Pesos publicos en HuggingFace |

No se dispone de datos comparativos de otros VLA del mismo rango (por ejemplo, alternativas abiertas de tamano similar) en la informacion proporcionada, por lo que no se incluyen cifras de parametros, contexto o rendimiento de esas alternativas.

## Limitaciones y advertencias

- La evaluacion publicada usa episodios de entrenamiento (0-9) y una unica semilla, por lo que no demuestra generalizacion a datos no vistos ni exito en bucle cerrado sobre el robot real.
- El propio autor advierte que las metricas reportadas no establecen generalizacion held-out ni tasa de exito fisica.
- El checkpoint con perdidas auxiliares desactivadas obtiene peor MSE y MAE que la variante TCFM 150k bajo evaluacion emparejada (2.883978 frente a 2.655958 en MSE), lo que sugiere menor suavidad o consistencia de trayectoria.
- El conjunto de datos de entrenamiento consta de solo 50 episodios y no se distribuye, lo que impide auditar la composicion del dataset ni reproducir el entrenamiento de forma completa.
- Riesgo de sobreajuste al entorno y al embodiment de R1 Lite: el modelo esta atado a la etiqueta `new_embodiment` y a la definicion de modalidades de `r1lite_ee_config.py` y `processor_config.json`.
- Dependencia estricta del codebase Isaac-GR00T N1.7 y de assets externos (`nvidia/Cosmos-Reason2-2B`); no es ejecutable con herramientas genericas de inferencia de modelos de lenguaje.
- Licencia NVIDIA Open Model License: es una licencia "other" con condiciones especificas; es imprescindible revisar el texto completo antes de cualquier uso comercial o redistribucion.
- No se documentan sesgos, comportamiento multilingue ni capacidades conversacionales, ya que no es un modelo de texto general.
- No hay informacion sobre cuantizaciones soportadas, latencia en produccion, ni validacion en entornos distintos del de recogida de datos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no existe validacion externa de la comunidad sobre su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XYZPIT/r1lite-ee-no_aux-150k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Assets del backbone requeridos: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente listados de tiendas minoristas sin relacion con el contenido).
