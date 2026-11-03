# zekaili/OpenWAM_hanoi_tower_gb64_lr1e-4_10k

## Resumen

OpenWAM hanoi_tower gb64 lr1e-4 10k es un checkpoint de ajuste fino del modelo fundacional OpenWAM-Alpha-Pretrain-Foundation-Model, desarrollado por el usuario zekaili dentro del ecosistema OpenWAM. Se trata de un world-action model (WAM) orientado a robótica manipulativa bimanual, entrenado específicamente para la tarea de construir una torre de Hanói con dos brazos YAM Ultra teleoperados mediante líderes GELLO. El modelo parte de un backbone de vídeo Wan2.2-TI2V-5B y añade un sistema dual con self-attention conjunta para predecir acciones motoras a partir de observaciones visuales multivista e instrucciones de tarea.

El checkpoint se ha entrenado durante 10.000 pasos sobre el dataset zekaili/hanoi-tower, compuesto por 105 episodios y 141.797 fotogramas a 15 fps, con tres cámaras (top, left_wrist, right_wrist). La salida del modelo es un chunk de 32 pasos de acciones en el espacio de efector final, con una dimensionalidad de 80 (state_dim = action_dim = 80) que codifica posiciones, rotaciones en formato rot6d y apertura de pinza para cada brazo.

Su relevancia radica en que ejemplifica el paradigma de los world-action models aplicados a manipulación bimanual con hardware asequible (YAM + GELLO), y en que publica un contrato de acción/estado explícito con cinemática directa e inversa documentada, lo que facilita la reproducibilidad. No obstante, es un checkpoint de investigación de nicho, con cero descargas y sin benchmarks publicados, pensado para despliegue en el ecosistema OpenWAM y no para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model sobre backbone de vídeo Wan2.2-TI2V-5B, sistema dual con self-attention conjunta y máscara mutua |
| Parametros totales | no disponible (el backbone Wan2.2-TI2V-5B tiene 5B, pero no se detalla el total del WAM) |
| Parametros activos | no disponible |
| Longitud de contexto | ventanas temporales de 33 fotogramas; chunk de acción de 32 pasos; stride de vídeo 4 (9 fotogramas) |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16; no se documentan cuantizaciones para inferencia) |
| Idiomas soportados | no disponible (el modelo recibe instrucciones de tarea en texto, presumiblemente en inglés, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint_step_10000.safetensors) |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone de generación de vídeo Wan2.2-TI2V-5B, adaptado como world-action model con un sistema dual que combina self-attention conjunta entre las modalidades de observación y acción, junto con una máscara mutua que controla el flujo de información entre ambas. La dimensionalidad de estado y acción es de 80, con un layout de efector final que asigna 10 dimensiones por brazo (posición 3D, rot6d 6D y pinza 1D), ubicando el brazo izquierdo en los slots 0:10 y el derecho en 34:44 del vector de 80 dimensiones. La entrada visual consiste en tres cámaras (top, left_wrist, right_wrist) redimensionadas a un formato L-shape de 384x320.

El entrenamiento se realizó durante 10.000 pasos con AdamW (lr 1e-4, betas 0.9/0.95, weight decay 0.01), schedule coseno con 5% de warmup, precisión bf16 y ZeRO-2, sobre 2 nodos con 8 H100 cada uno (4 por GPU), con un batch global de 64. Esto supone aproximadamente 4,5 épocas sobre ventanas deslizantes del dataset. Los datos provienen de 105 episodios y 141.797 fotogramas a 15 fps de dos brazos YAM Ultra teleoperados con líderes GELLO. El estado y la acción se convierten desde posiciones articulares de 14 dimensiones (6 por brazo más 2 pinzas) al layout de efector final mediante cinemática directa sobre el URDF abc_130k_yam.urdf, con normalización min-max a [-1, 1] almacenada en normalization_stats.npy. No se documenta RLHF ni DPO.

## Capacidades

- Predicción de acciones motoras bimanuales en espacio de efector final (20-D nativo: posición, rot6d y pinza por brazo) a partir de observaciones visuales multivista.
- Generación de chunks de acción de 32 pasos con ventanas temporales de 33 fotogramas y stride de vídeo 4.
- Procesamiento de tres cámaras simultáneas (top, left_wrist, right_wrist) en formato L-shape 384x320.
- Condicionamiento por instrucción de tarea en texto (por ejemplo, "Build the Hanoi tower: ..."), tomada de meta/tasks.parquet.
- Despliegue como servidor de política mediante scripts/deploy.sh, que recibe estado EEF 20-D y devuelve objetivos EEF 20-D.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; el modelo está especializado en control robótico.

## Casos de uso

- Manipulación bimanual de precisión en laboratorio: el modelo genera trayectorias de efector final para dos brazos YAM coordinados, adecuado para tareas de ensamblaje fino como apilar piezas, gracias a su chunk de 32 pasos y representación rot6d.
- Investigación en world-action models: sirve como checkpoint de referencia para reproducir el pipeline de ajuste fino de OpenWAM sobre un dataset propio, con contrato de acción/estado y cinemática documentados.
- Teleoperación asistida con GELLO: el modelo puede desplegarse como política que traduce observaciones de las tres cámaras en comandos EEF, integrándose con el servidor de política incluido.
- Evaluación de generalización visual: al condicionarse por texto de tarea y tres vistas, permite estudiar cómo varía el rendimiento ante cambios de iluminación o punto de vista en el puesto de trabajo.
- Benchmark de cinemática directa/inversa: el mapeo documentado entre articulaciones de 14-D y EEF de 20-D con URDF concreto facilita validar pipelines de IK en cadenas YAM.
- Prototipado de tareas de apilado y construcción: el dataset de torre de Hanói y el condicionamiento textual permiten adaptar el modelo a variantes de la misma tarea con cambios mínimos en el dataset.
- Formación y docencia en robótica: como ejemplo completo de ajuste fino de un WAM con receta de entrenamiento (AdamW, ZeRO-2, bf16, batch global 64) y hardware H100 documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 24,8 GB en safetensors, por lo que la inferencia en bf16 requeriría previsiblemente del orden de 25-30 GB de VRAM, aunque no se documenta.
- GPU recomendadas: el entrenamiento se realizó con 16 H100 (2 nodos x 8 GPU); para inferencia no se especifican GPU concretas.
- Cabe en consumer GPU: no confirmado; por el tamaño del checkpoint (24,8 GB) no cabría en GPUs de 24 GB sin cuantización, y no se documentan cuantizaciones.
- Opciones de despliegue: servidor de política propio de OpenWAM mediante `bash scripts/deploy.sh <dir>`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de robótica con librería openwam.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (world-action models bimanuales) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Checkpoint de nicho: entrenado exclusivamente para la tarea de torre de Hanói con brazos YAM Ultra y líderes GELLO; no se espera generalización a otras tareas, robots o configuraciones de cámara sin reentrenamiento.
- El lector de datos (openwam/dataloader/yam_bimanual.py y configs/dataloader/hanoi_tower.yaml) no forma parte del repositorio upstream de OpenWAM, y las rutas en config.yaml son marcadores de posición, lo que complica la reproducibilidad directa.
- Riesgo de alucinación motora: como modelo generativo de acciones, puede producir trayectorias no físicamente válidas; se requiere IK sobre la misma cadena cinemática y validación en el robot real.
- Dependencia de calibración: la conversión EEF a comandos articulares exige el URDF abc_130k_yam.urdf y la transformación flange_from_eef documentada; desviaciones en la cadena cinemática degradan el control.
- Idiomas: no se especifican idiomas soportados; las instrucciones de tarea deben enviarse literalmente desde meta/tasks.parquet, presumiblemente en inglés.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el backbone Wan2.2 pueden tener condiciones adicionales que conviene verificar antes de producción.
- Sin benchmarks ni métricas de éxito publicadas: no hay evidencia cuantitativa de tasa de éxito en la tarea, lo que impide evaluar su idoneidad en producción.
- Cero descargas y cero likes: modelo sin validación comunitaria; su uso en producción conlleva riesgo de soporte inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zekaili/OpenWAM_hanoi_tower_gb64_lr1e-4_10k
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Pretrain-Foundation-Model
- Dataset: https://huggingface.co/datasets/zekaili/hanoi-tower
- Repositorio OpenWAM: https://github.com/OpenWAM-Official/OpenWAM
