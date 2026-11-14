# xixibuxixi/WorldPlay-SF3-KOF98-Mixed-step1650

## Resumen

WorldPlay-SF3-KOF98-Mixed-step1650 es un checkpoint de inferencia de un modelo generativo de video autorregresivo y condicionado por acciones, desarrollado por el usuario xixibuxixi sobre la base de HY-WorldPlay y HunyuanVideo-1.5 de Tencent. El modelo se entrena para predecir fotogramas futuros de un videojuego de lucha a partir de una imagen inicial, un prompt y una secuencia de acciones codificadas en el espacio unificado de 81 acciones de WorldPlay (combinacion de traslacion y rotacion). El objetivo es funcionar como world model interactivo: dado un estado visual y una accion, generar el siguiente estado plausible del juego.

El checkpoint corresponde al paso de optimizacion 1.650 de un entrenamiento planificado a 20.000 pasos sobre una mezcla de 20.000 registros (10.000 de Street Fighter III y 10.000 de KOF98). Se distribuye unicamente con pesos consolidados en safetensors (34,2 GB), sin estado del optimizador ni del dataloader, por lo que no sirve para reanudar el entrenamiento de forma exacta. La arquitectura se apoya en `HunyuanTransformer3DARActionModel`, un transformer 3D con atencion causal y memoria de ventana, que procesa clips de 97 fotogramas a 848 x 480 con 25 pasos latentes temporales.

Su relevancia es acotada pero tecnica: es un ejemplo abierto de entrenamiento de world models de video para videojuegos con control por acciones, sobre una base de pesos de HunyuanVideo-1.5, y documenta la receta de entrenamiento (hardware, hiperparametros, politica de camara y mapeo de controles) de forma reproducible. No es un modelo de proposito general ni un checkpoint final: es un snapshot intermedio sin benchmark de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D difusivo con atencion causal y memoria (`HunyuanTransformer3DARActionModel`), base HunyuanVideo-1.5 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | ventana de memoria de 24 fotogramas (`window_frames=24`); clip de 97 fotogramas y 25 pasos latentes temporales |
| Tipos de cuantizacion | no disponible (pesos en bf16/fp32 segun receta; no se documentan GGUF ni cuantizaciones de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta a los terminos de Tencent Hunyuan / HY-WorldPlay) |
| Formato de pesos | safetensors (`transformer/diffusion_pytorch_model.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de HunyuanVideo-1.5 en su variante `480p_i2v` y del checkpoint autorregresivo de acciones de HY-WorldPlay, y se entrena con un objetivo causal de prediccion de latentes de video condicionado por acciones y con memoria. La representacion de acciones es el mapeo unificado de 81 vias de WorldPlay (`translation_id * 9 + rotation_id`), que convierte los controles de los juegos de origen en un espacio discreto comun. Los clips de entrenamiento tienen 97 fotogramas a 848 x 480, que se comprimen en 25 pasos latentes temporales, y la ventana de memoria es de 24 fotogramas.

El entrenamiento se ejecuto sobre 8 NVIDIA H20 con paralelismo de secuencia de tamano 4 y sharding HSDP de tamano 8, con un batch global efectivo de 2 registros por actualizacion. Se uso precision mixta bf16 con computo del DiT en fp32, optimizador con LR 1e-5, weight decay 1e-4 y max grad norm 1.0, muestreo de timesteps logit-normal (media 0, desviacion 1) con train time shift 3.0, tasa I2V de 0.2, tasa de CFG de entrenamiento de 0.1 y gradient checkpointing completo. El dataset mezcla 10.000 registros de Street Fighter III y 10.000 de KOF98 con una politica de camara lateral fija. El run se reanudo con estado completo desde `checkpoint-500` y guardaba cada 50 actualizaciones, reteniendo los tres ultimos checkpoints locales.

## Capacidades

- Generacion de video autorregresiva condicionada por acciones: dado un fotograma inicial, un prompt y una secuencia de acciones, produce el rollout de 97 fotogramas a 848 x 480.
- Modelado de dinamica de videojuegos de lucha en vista lateral (SF3 y KOF98), con control de traslacion y rotacion en el espacio de 81 acciones.
- Prediccion condicionada por imagen (I2V) con tasa de entrenamiento del 20 por ciento.
- Memoria temporal de 24 fotogramas para mantener coherencia entre pasos del rollout.
- Integracion con el runtime de HY-WorldPlay para inferencia autorregresiva por pasos.
- No se documentan capacidades de tool calling, agentes, razonamiento textual, matematicas, vision general, audio ni modo thinking.

## Casos de uso

- Investigacion en world models de video: sirve como punto de partida reproducible para estudiar como un transformer difusivo 3D aprende dinamicas de juego condicionadas por acciones, usando la receta y los scripts incluidos.
- Prototipado de entornos interactivos: el modelo puede generar el siguiente estado visual de un combate a partir de la accion del jugador, util para experimentar con simuladores de videojuego sin motor fisico.
- Evaluacion de tecnicas de memoria temporal: la ventana de 24 fotogramas permite comparar estrategias de contexto largo en generacion de video autorregresiva.
- Generacion de datos sinteticos de videojuego: rollouts condicionados por acciones para aumentar datasets de entrenamiento de agentes o de modelos de vision.
- Reproduccion de experimentos: los scripts `train_reproduce.sh` y `infer_ar.sh`, junto con el parche de compatibilidad, permiten replicar el pipeline sobre 8 GPU H20.
- Estudio de mapeos de control: el espacio unificado de 81 acciones facilita analizar la transferencia de controles entre juegos distintos (SF3 y KOF98) en un mismo modelo.
- Demostraciones tecnicas de I2V interactivo: generar clips cortos de 97 fotogramas a 848 x 480 para validar pipelines de difusion de video en produccion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint no se libero con un benchmark de validacion independiente y que la perdida de entrenamiento no garantiza calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 34,2 GB en safetensors, por lo que se requiere al menos una GPU con memoria suficiente para cargar los pesos completos y el base HunyuanVideo-1.5, ademas de los latentes del rollout.
- GPU de entrenamiento documentadas: 8 x NVIDIA H20 con paralelismo de secuencia 4 y HSDP 8.
- GPU recomendadas para inferencia: no disponible; por tamano de pesos, se necesitan aceleradores de clase datacenter (H20, A100, H100) o GPUs consumer de gama alta con suficiente VRAM, sin confirmacion del autor.
- Viabilidad en GPU consumer: no confirmada; no se documentan cuantizaciones que permitan reducir el footprint.
- Opciones de despliegue: runtime upstream de HY-WorldPlay (requiere el repositorio en el commit `1588e1336e842b03b0a7860c654ebd7c46bb065e` y un directorio completo de HunyuanVideo-1.5). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WorldPlay-SF3-KOF98-Mixed-step1650 | no disponible | 24 fotogramas de memoria; clips de 97 fotogramas | World model de video para juegos de lucha | other (Hunyuan/HY-WorldPlay) | Hugging Face, checkpoint intermedio |
| HunyuanVideo-1.5 (base) | no disponible | no disponible | Generacion de video texto-a-video e imagen-a-video | licencia Tencent Hunyuan | Publico |
| HY-WorldPlay (upstream) | no disponible | no disponible | World model autorregresivo condicionado por acciones | licencia HY-WorldPlay | Repositorio upstream |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un snapshot intermedio del paso 1.650 de un entrenamiento planificado a 20.000 pasos; no representa el resultado final.
- No se libero con benchmark de validacion independiente; la perdida de entrenamiento no es garantia de calidad.
- Requiere un directorio completo del modelo base HunyuanVideo-1.5 y el codigo/runtime de HY-WorldPlay en un commit concreto para poder ejecutarse.
- Solo incluye pesos consolidados de inferencia; no hay estado de optimizador, scheduler, checkpoint distribuido, dataloader ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta.
- El entrenamiento se limita a dos juegos de lucha (SF3 y KOF98) con camara lateral fija; la generalizacion a otros juegos o camaras no esta documentada.
- Riesgo de alucinacion visual y de deriva en rollouts largos: la memoria se limita a 24 fotogramas y el clip a 97 fotogramas.
- Sesgos conocidos: no documentados por el autor; al entrenarse solo con dos titulos, cabe esperar un sesgo hacia sus estilos visuales y mecanicas.
- Restricciones de licencia: uso sujeto a los terminos de Tencent Hunyuan / HY-WorldPlay; la licencia "other" exige revisar las condiciones antes de cualquier uso comercial.
- Sin soporte documentado de cuantizacion, tool calling ni despliegue en servidores de inferencia estandar; el uso en produccion requiere trabajo de integracion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/xixibuxixi/WorldPlay-SF3-KOF98-Mixed-step1650
- Repositorio upstream HY-WorldPlay (commit de referencia): `1588e1336e842b03b0a7860c654ebd7c46bb065e` (no se proporciona URL en la informacion disponible)
- HunyuanVideo-1.5 (modelo base): no se proporciona URL en la informacion disponible
- Paper, blog o demo: no disponibles en la informacion proporcionada
