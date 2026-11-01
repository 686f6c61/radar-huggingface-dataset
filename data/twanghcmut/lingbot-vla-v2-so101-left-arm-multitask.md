# twanghcmut/lingbot-vla-v2-so101-left-arm-multitask

## Resumen

LingBot-VLA-V2 SO101 Left Arm es un modelo de visión-lenguaje-acción (VLA) para robótica, resultado del post-entrenamiento del modelo base `robbyant/lingbot-vla-v2-6b` sobre un conjunto multitarea de 11 tareas de manipulación con el brazo izquierdo del robot SO101. Lo publica el usuario `twanghcmut` en Hugging Face y está diseñado para controlar un brazo seguidor SO101 de 5 articulaciones más pinza, a 30 fps, a partir de instrucciones en lenguaje natural e imágenes de dos cámaras (vista superior y vista de muñeca).

El modelo parte de un backbone Qwen3-VL-4B con un experto de acción MoE (6B parámetros totales, según el nombre del modelo base) y se ha ajustado con el código oficial de Robbyant sobre un conjunto de 551 episodios y 253.745 fotogramas. Un único checkpoint cubre las 11 tareas: la instrucción de lenguaje selecciona el comportamiento. Es relevante porque demuestra el flujo de post-entrenamiento de un VLA de propósito general hacia un robot de bajo coste concreto, aunque el propio autor advierte que su rendimiento queda por detrás de otros modelos de la misma serie y que no se ha probado en el robot real.

La licencia es Apache 2.0 y el repositorio ocupa 25,5 GB (el checkpoint pesa 24 GB en 6 shards de safetensors). Es un modelo de nicho, con 0 descargas y 0 likes en el momento de redactar esta ficha, y su uso previsto es la evaluación en bucle abierto y el despliegue experimental mediante el servidor de políticas del repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone Qwen3-VL-4B + experto de acción MoE (post-entrenamiento de `robbyant/lingbot-vla-v2-6b`) |
| Parametros totales | 6B (según el nombre del modelo base; no se detalla el desglose en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en bf16) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6 shards, 24 GB) + tokenizer/processor; configuración en YAML |

## Arquitectura y entrenamiento

El modelo es un VLA que combina un backbone de visión-lenguaje Qwen3-VL-4B con un experto de acción basado en mezcla de expertos (MoE) presente en todas las capas del experto de acción. El post-entrenamiento se realizó con el código oficial de Robbyant (commit `be969b8`) partiendo de `robbyant/lingbot-vla-v2-6b` con `post_training: true`, congelando el codificador de visión (`freeze_vision_encoder: true`) y manteniendo el ViT entrenable (`freeze_vit: false`). Se usaron las pérdidas auxiliares por defecto del upstream: profundidad y profundidad futura (peso 0,004) y vídeo futuro con DINO-Video, además de módulos auxiliares MoGe-2 ViT-B para normales y DINO-Video.

El entrenamiento constó de 3000 pasos: 600 en una primera ejecución y 2400 reanudados desde el checkpoint de 600. El lote global fue de 64 (micro-lote 1 × acumulación de gradiente 32 en 2 GPU para los pasos 1-600; 1 × 64 en 1 GPU después), con 192.000 muestras vistas (0,76 épocas) frente a las 768.000 de otros modelos de la serie. Se usó una tasa de aprendizaje constante de 5e-5 sin calentamiento, AnyPrecision AdamW y recorte de gradiente de 1,0, sin aumento de datos (`image_augment: false`). La pérdida de entrenamiento seguía descendiendo cuando se detuvo el entrenamiento.

## Capacidades

- Control de un brazo robot SO101 izquierdo (5 articulaciones más pinza) a partir de instrucciones en lenguaje natural e imágenes de dos cámaras.
- Generación de acciones como objetivos articulares absolutos (`subtract_state: False`) en fragmentos de 50 pasos, evaluados sobre los primeros 16.
- Multitarea en un único checkpoint: 11 tareas de manipulación seleccionables mediante la instrucción exacta de lenguaje.
- Tareas cubiertas: recoger cubos (rojo, azul) y colocarlos en una olla de acero; coger un plátano, meterlo en la olla y cerrar la tapa; apilar cubos (amarillo sobre naranja, bloques naranjas); equilibrar cubos rojos y azules en una tabla de madera; introducir un cubo rojo en un cubo hueco naranja; ordenar cubos azules de menor a mayor.
- Percepción visual con dos cámaras: `camera_top` (vista superior) y `camera_wrist_left` (vista de muñeca).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso general, visión general, audio ni modo thinking; el modelo está especializado en control robótico.
- No se documenta soporte multilingüe; las instrucciones de entrenamiento están en inglés y el autor advierte que no se entrenó con paráfrasis.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo recoge cubos de colores y los deposita en una olla de acero siguiendo instrucciones exactas, adecuado para prototipos de manipulación con el brazo SO101 de bajo coste.
- Apilado de objetos: permite apilar cubos y bloques (amarillo sobre naranja, bloques naranjas) en un único checkpoint multitarea, útil para tareas de ensamblaje sencillo.
- Manipulación con tapa: la tarea de coger un plátano, meterlo en la olla y cerrar la tapa demuestra control secuencial de la pinza y el brazo en una sola instrucción.
- Clasificación y ordenación física: la tarea de sacar cubos azules de menor a mayor aprovecha la percepción visual para ordenar objetos por tamaño sobre la mesa.
- Razonamiento espacial simple: la tarea de equilibrar el número de cubos rojos y azules en una tabla de madera requiere interpretar la escena y elegir el cubo correcto.
- Investigación en evaluación en bucle abierto: el script `scripts/open_loop_eval.py` permite comparar trayectorias predichas con las grabadas sin necesidad de robot físico, útil para validar protocolos de post-entrenamiento VLA.
- Despliegue experimental en robot: mediante el servidor de políticas del directorio `deploy/` del repositorio upstream, con el mismo `model_path` y `robo_name`, para pruebas controladas en el SO101 real (el autor advierte que no se ha probado en robot real).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta resultados de evaluación en bucle abierto en los pasos 600 y 3000, guardados en el directorio `eval/` del repositorio, y señala cualitativamente que a 3000 pasos el modelo es claramente mejor que repetir el estado actual, pero queda por detrás de otros modelos de la misma serie en el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 24 GB en bf16, por lo que se necesitan al menos 24 GB de VRAM solo para los pesos, más memoria para los módulos auxiliares (MoGe-2 ViT-B, DINO-Video, tokenizer de Qwen3-VL-4B) y las activaciones; en la práctica, se recomienda 40-48 GB o más.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) o GPUs de 48 GB como la RTX A6000; no se documentan requisitos oficiales.
- En GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090) solo con los pesos en bf16; no se documentan opciones de cuantización para reducir el uso de memoria.
- Opciones de despliegue: el servidor de políticas del directorio `deploy/` del repositorio `Robbyant/lingbot-vla-v2` y el script `scripts/open_loop_eval.py` para evaluación en bucle abierto; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el script de evaluación usa `--max_infer_time 25` y `--use_bf16`, pero no se publican cifras de latencia ni de frecuencia de inferencia en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingBot-VLA-V2 SO101 Left Arm (este modelo) | 6B (backbone Qwen3-VL-4B + MoE) | no disponible | Bucle abierto a 3000 pasos; por detrás de otros modelos de la serie según el autor | Apache 2.0 | Hugging Face, 0 descargas |
| `robbyant/lingbot-vla-v2-6b` (modelo base) | 6B | no disponible | No disponible en la información | no disponible | Hugging Face |
| Otros modelos de la serie SO101 Left Arm (misma colección `hungho77/so101-leftarmonly-task`) | no disponible | no disponible | Mejores que este modelo en el mismo protocolo según el autor | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente que el modelo no se ha probado en el robot real; solo hay evaluación en bucle abierto.
- Rendimiento por detrás de otros modelos de la misma serie en el mismo protocolo, según el propio autor.
- La pérdida de entrenamiento seguía descendiendo al detenerse el entrenamiento; el modelo está infraentrenado (192.000 muestras, 0,76 épocas, frente a 768.000 de otros modelos de la serie).
- Solo acepta las instrucciones exactas de las 11 tareas, incluida la puntuación final; no se entrenó con paráfrasis, por lo que la generalización lingüística es nula.
- Específico para el brazo izquierdo del SO101 con 5 articulaciones más pinza; no es transferible a otras morfologías sin reentrenamiento.
- Las rutas absolutas de la máquina de entrenamiento en `hf_ckpt/config.json` y `lingbotvla_cli.yaml` deben reajustarse a las copias locales de los módulos auxiliares antes de cargar el modelo.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto o idioma más allá de lo indicado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende del modelo base y de módulos auxiliares cuyas licencias no se detallan en la información disponible; conviene verificarlas antes de un uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/lingbot-vla-v2-so101-left-arm-multitask
- Modelo base: https://huggingface.co/robbyant/lingbot-vla-v2-6b
- Repositorio de código oficial: https://github.com/Robbyant/lingbot-vla-v2
- Colección de datasets SO101 Left Arm Only Task: https://huggingface.co/collections/hungho77/so101-leftarmonly-task
- Tokenizer/processor de referencia: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
