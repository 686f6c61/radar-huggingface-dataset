# tarn59/UniMate-Weights

## Resumen

UniMate-Weights es un checkpoint de generacion de movimiento (animacion de esqueletos) publicado por el usuario tarn59 en HuggingFace, entrenado desde cero con el codigo y la configuracion oficiales del modelo UniMate ("UniMate: One Unified Model to Animate Diverse Skeletons", Mou et al., SIGGRAPH Asia 2026, arXiv 2609.05415). No es el checkpoint de los autores: se trata de una reproduccion independiente realizada por un tercero en una unica GPU de estacion de trabajo, por lo que los pesos difieren de la version oficial.

El modelo tiene 74.077.328 parametros (74,1 M) y es un transformer de difusion espacio-temporal factorizado con 10 bloques, latente de 512 dimensiones, 8 cabezas de atencion, MLP SwiGLU, RMSNorm con QK-norm y condicionamiento adaLN-Zero. La atencion espacial opera dentro de cada fotograma entre articulaciones (con sesgos de distancia y tipo de arista estilo Graphormer y un RoPE espectral sobre 8 vectores propios del laplaciano), mientras que la atencion temporal opera dentro de cada articulacion a lo largo del tiempo con RoPE 1-D. Se entrena con flow matching y genera animaciones de 60 fotogramas condicionadas por texto.

Su relevancia es doble: por un lado demuestra que el pipeline de UniMate es reproducible en hardware de un solo nodo con precision fp32; por otro, sirve como material de comparacion frente al release oficial y como base para ajuste fino. El repo incluye pesos EMA listos para inferencia (283 MB), pesos crudos del paso 120.000, el checkpoint completo con estado de AdamW y scheduler (1,13 GB), la configuracion resuelta, las estadisticas de normalizacion y los registros de TensorBoard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion espacio-temporal factorizado (10 bloques, latente de 512, 8 cabezas, SwiGLU de 2048 nominal, RMSNorm con QK-norm, adaLN-Zero) |
| Parametros totales | 74.077.328 (74,1 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en tokens; ventana temporal de 60 fotogramas segun la configuracion `uniml3d_60frames_graph_adaln` |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos fp32; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el codificador de texto es `google/flan-t5-base`, con sesgo hacia ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model_ema.safetensors`, `model.safetensors`) y checkpoint PyTorch `.pt` (`checkpoints/checkpoint_step_120000.pt`); acompanados de `config.json` y `dataset_stats.npy` |
| Tarea declarada | text-to-3d (en la practica, text-to-motion sobre esqueletos) |
| Dataset de entrenamiento | UniML3D (`Linzhan/UniML3D`), exportado a features de etapa 4 de UniMate; Truebones ZOO reconstruido localmente |
| Tamano del repositorio | 1,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 19 de septiembre de 2026 (ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura es un diffusion transformer con atencion espacio-temporal factorizada en lugar de atencion completa sobre la secuencia de articulaciones. Cada bloque alterna dos atenciones: una espacial que agrega informacion entre articulaciones dentro de un mismo fotograma, incorporando sesgos de distancia de grafo y de tipo de arista al estilo Graphormer, mas un RoPE espectral invariante al signo calculado sobre 8 vectores propios del laplaciano del esqueleto; y otra temporal que agrega informacion entre fotogramas para cada articulacion, con RoPE 1-D. El condicionamiento de texto proviene de `google/flan-t5-base` con pooling de media, y la pose T agrupada entra junto con el texto a traves del vector adaLN. La configuracion resuelta fija `max_joints=61` y `max_depth=19`.

El entrenamiento usa flow matching con interpolante lineal y prediccion de velocidad, con una perdida L2 enmascarada mas una perdida geodesica de rotacion con peso 0,5, y un 10 % de dropout de caption para classifier-free guidance. El run se ejecuto sobre 10.204 clips de 5.756 tipos de objeto (Objaverse 7.308 clips y 5.698 rigs, Mixamo 2.169 clips con un rig de 22 articulaciones, Truebones 727 clips y 57 especies), filtrando rigs fuera del rango de 5 a 60 articulaciones (17 especies de Truebones y 781 rigs de Objaverse descartados), saltando 34 clips de Truebones por un desajuste en la recuperacion de representacion y omitiendo `KingCobra-Walk`. No hubo split de evaluacion (`test_split_ratio = 0`). El hardware fue una NVIDIA RTX PRO 6000 Blackwell Workstation Edition de 96 GB, con PyTorch 2.7.1+cu128, Accelerate 1.14.0 y Transformers 5.16.1, en fp32 puro, un solo proceso y sin acumulacion de gradiente, durante 120.000 pasos. El paper emplea 8 GPUs, de modo que este run vio aproximadamente 8 veces menos muestras en el mismo numero de pasos.

## Capacidades

- Generacion de movimiento condicionada por texto: produce animaciones de 60 fotogramas para esqueletos diversos a partir de una descripcion en lenguaje natural.
- Animacion de esqueletos heterogeneos: soporta topologias de entre 5 y 60 articulaciones y profundidades de grafo de hasta 19, incluyendo tanto rigs humanoides como no humanoides.
- Condicionamiento por pose T agrupada, lo que permite fijar la estructura de reposo del personaje objetivo.
- Guiado sin clasificador (classifier-free guidance) activado mediante el 10 % de dropout de caption durante el entrenamiento.
- Muestreo con multiples repeticiones por caso de prueba (`--num_repetitions`), util para explorar variabilidad en la generacion.
- Carga directa de pesos en el modelo mediante `safetensors.torch.load_model`, con reenganche automatico de los alias del modulo RoPE espectral compartido.
- Reanudacion de entrenamiento desde el checkpoint, que conserva pesos, sombras EMA, estado de AdamW, estado del scheduler de learning rate y contador de pasos.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito: es un modelo generativo de movimiento, no un modelo de lenguaje.

## Casos de uso

- Previsualizacion de animaciones en produccion de videojuegos: dado un esqueleto objetivo y un prompt de texto, generar 60 fotogramas de borrador para validar el ritmo de una animacion antes de invertir horas de animador.
- Rigging y retargeting asistido: usar la condicion de pose T y el soporte de 5 a 60 articulaciones para producir movimiento coherente sobre esqueletos no humanoides (cuadrupedos, aves) donde las librerias de mocap convencionales no llegan.
- Prototipado rapido en estudios de animacion independientes: al pesar solo 74,1 M de parametros, el muestreo puede ejecutarse en una estacion de trabajo sin depender de un cluster, acelerando la iteracion de ideas.
- Generacion de variantes de locomocion: emplear `--num_repetitions` para obtener varias muestras del mismo prompt (caminar, correr, saltar) y seleccionar la mas adecuada para un ciclo de animacion.
- Dataset sintetico para entrenamiento de otros modelos: producir pares texto-movimiento adicionales con esqueletos poco representados, utiles para aumentar la diversidad de corpus de animacion.
- Ajuste fino especifico de dominio: partir del checkpoint `.pt` con estado del optimizador para adaptar el modelo a un conjunto cerrado de personajes o a un estilo de animacion concreto con pocos datos.
- Investigacion en generacion de movimiento: servir como segundo punto de referencia independiente frente al checkpoint oficial de UniMate al analizar sensibilidad a semilla, precision numerica y orden de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card advierte de que las cifras del paper no son aplicables a este checkpoint salvo que se evalue de forma independiente, y que no existe split de evaluacion (`test_split_ratio = 0`) en este run.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos EMA ocupan 283 MB en fp32; con activaciones y buffers de muestreo el consumo previsible se situa en el rango de 1 a 3 GB, aunque no se proporciona una medicion oficial. Cualquier GPU con 4 GB o mas deberia ser suficiente.
- GPU recomendadas: no se especifica ninguna para inferencia. El entrenamiento se realizo en una NVIDIA RTX PRO 6000 Blackwell Workstation Edition de 96 GB, pero ese requisito corresponde al run de fp32 a 120.000 pasos, no al muestreo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de gama media y baja (RTX 3060, RTX 4060, GTX 1660 o equivalentes) por el reducido tamano del modelo, aunque no hay confirmacion oficial de compatibilidad ni de latencias.
- Opciones de despliegue: el unico camino documentado es el sampler propio del repositorio de UniMate (`python -m unimate.inference.sample --exp_dir ...`). No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo autorregresivo de lenguaje. Se requiere ademas construir `dataset/features/` con la etapa 4 del pipeline de datos para obtener la pose T y la topologia del esqueleto objetivo, y disponer de `dataset_stats.npy` para la normalizacion.
- Carga en framework neutro: es posible cargar los safetensors con `safetensors.torch.load_model` reconstruyendo el modelo desde `config.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana temporal | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| tarn59/UniMate-Weights (este checkpoint) | 74,1 M | 60 fotogramas | no disponible | HuggingFace, 0 descargas | sin benchmarks publicados; sin split de evaluacion |
| Checkpoint oficial de UniMate (autores, Mou et al.) | misma arquitectura y configuracion | 60 fotogramas | no disponible | via repositorio del paper | cifras del paper, no aplicables a este checkpoint |
| Otros modelos de generacion de movimiento texto-a-movimiento | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el checkpoint oficial de los autores, que comparte arquitectura y configuracion pero difiere en hardware, precision, orden de muestreo y semilla. La model card senala que, al usar 8 GPUs en el paper frente a 1 GPU en este run con el mismo batch por GPU, el checkpoint oficial vio aproximadamente 8 veces mas muestras en los mismos 120.000 pasos, por lo que cabe esperar diferencias de calidad. No se aportan datos de modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- No es el checkpoint oficial: los pesos provienen de un entrenamiento independiente en una sola GPU y no reproducen los resultados del paper.
- Sin licencia declarada: no se especifican condiciones de uso comercial, atribucion ni redistribucion, lo que impide un uso en produccion sin aclaracion previa.
- Sin split de evaluacion (`test_split_ratio = 0`): no existen metricas objetivas de calidad ni comparaciones cuantitativas para este checkpoint.
- Menor volumen de datos efectivo: al usar 1 GPU en lugar de 8 con el mismo batch por GPU, el modelo vio aproximadamente 8 veces menos muestras.
- Cobertura limitada de topologias: los rigs fuera del rango de 5 a 60 articulaciones fueron descartados, y la configuracion fija 61 articulaciones maximas y 19 niveles de profundidad de grafo.
- Huecos conocidos en los datos: 34 clips de Truebones se omitieron por un desajuste en la recuperacion de representacion y `KingCobra-Walk` esta ausente porque su FBX requiere una reparacion de injerto de malla puntual de los autores.
- Riesgo de artefactos fisicos: como todo modelo generativo de movimiento, puede producir deslizamiento de pies, penetraciones, colisiones no resueltas o transiciones bruscas entre fotogramas; no hay datos publicados sobre la frecuencia.
- Idioma: la informacion sobre idiomas soportados no esta disponible; el codificador de caption es `google/flan-t5-base`, orientado al ingles, por lo que los prompts en otros idiomas pueden degradar el resultado.
- Dependencia del pipeline de datos: el sampler exige laposes T y la topologia del esqueleto objetivo construidas con la etapa 4 del pipeline, ademas de `dataset_stats.npy`; sin ellos la inferencia no funciona.
- Detalle de implementacion: el encoder con RoPE espectral es un modulo compartido por los 10 bloques y aparece once veces en `state_dict()`; cargar con `load_file` + `load_state_dict` en lugar de `safetensors.torch.load_model` puede fallar.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: el modelo solo genera movimiento.

## Enlaces

- HuggingFace: https://huggingface.co/tarn59/UniMate-Weights
- Repositorio oficial de UniMate: https://github.com/Friedrich-M/UniMate
- Paper: UniMate: One Unified Model to Animate Diverse Skeletons, Mou et al., SIGGRAPH Asia 2026: https://arxiv.org/abs/2609.05415
- Dataset UniML3D: https://huggingface.co/datasets/Linzhan/UniML3D
- Codificador de texto: https://huggingface.co/google/flan-t5-base
