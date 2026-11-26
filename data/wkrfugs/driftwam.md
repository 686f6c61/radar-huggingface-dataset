# wkrfugs/DriftWAM

## Resumen

DriftWAM es un modelo de accion-mundo (world-action model) para robotica desarrollado por Minyang Li, Siyu Xu, Yunke Wang, Ying-Cong Chen, Chang Xu y Daochang Liu, publicado en arXiv con el identificador 2611.33797 bajo el titulo "DriftWAM: Faster World-Action Models via Action-Aware Video Drifting". El checkpoint publicado por el usuario wkrfugs en Hugging Face corresponde a la evaluacion sobre RoboTwin 2.0 y se distribuye como un fine-tuning del modelo base FlashWAM-RoboTwin de NU-World-Model-Embodied-AI.

El modelo combina generacion de video con prediccion de acciones en un unico transformer de difusion (WanTransformer3DModel), reutilizando el VAE, el text encoder y el tokenizer de Flash-WAM. Su propuesta tecnica central es el "action-aware video drifting", un mecanismo que acelera la generacion de video condicionada por acciones, lo que reduce el numero de pasos de inferencia necesarios (1 paso para video y 2 para accion en la configuracion recomendada).

Es relevante porque aborda uno de los cuellos de botella de los world-action models: el coste computacional de la difusion iterativa en bucles de control robotico. El repositorio ocupa 20,4 GB y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines de investigacion en robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D (WanTransformer3DModel) para video y accion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 para inferencia) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusion_pytorch_model.safetensors) |

## Arquitectura y entrenamiento

DriftWAM se construye sobre la implementacion `WanTransformer3DModel` heredada de Flash-WAM/LingBot-VA, un transformer de difusion tridimensional que procesa secuencias de video y predicciones de accion de forma conjunta. El checkpoint publicado contiene unicamente los pesos del transformer (`transformer/config.json` y `transformer/diffusion_pytorch_model.safetensors`); el VAE, el text encoder y el tokenizer se reutilizan sin cambios del modelo base FlashWAM-RoboTwin y deben descargarse por separado.

La innovacion principal descrita en el paper es el "action-aware video drifting", un esquema que permite generar video condicionado por acciones con un unico paso de inferencia (`num_inference_steps = 1`) y acciones con dos pasos (`action_num_inference_steps = 2`), manteniendo `guidance_scale = 1.0` y `action_guidance_scale = 1.0`. Esto contrasta con los esquemas de difusion clasicos que requieren decenas de pasos. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de video condicionada por acciones en entornos roboticos simulados (RoboTwin 2.0).
- Prediccion de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural.
- Modelado conjunto mundo-accion: el modelo aprende la dinamica del entorno y la politica de actuacion de forma acoplada.
- Inferencia acelerada: 1 paso para video y 2 pasos para accion en la configuracion recomendada (o 1 paso para accion en modo one-step).
- Procesamiento de instrucciones en ingles.
- Integracion con el ecosistema LingBot-VA y el pipeline de evaluacion de RoboTwin 2.0.
- Soporte de inferencia en bfloat16 con `attn_mode="torch"`.

## Casos de uso

- Evaluacion de politicas roboticas en RoboTwin 2.0: el modelo se integra en el entorno de LingBot-VA para medir el rendimiento de tareas de manipulacion bimanual, sirviendo como referencia comparativa frente a Flash-WAM y otros world-action models.
- Investigacion en world models: permite estudiar como la generacion de video condicionada por acciones afecta a la calidad de la politica aprendida, gracias a la separacion entre pasos de video y de accion.
- Planificacion de trayectorias en simulacion: el modelo predice acciones paso a paso a partir de observaciones, util para generar demostraciones sinteticas en entornos simulados antes de transferir a robot real.
- Aceleracion de bucles de control: con 1-2 pasos de inferencia, el modelo es adecuado para prototipos de control en tiempo casi real en simulacion, reduciendo el coste frente a esquemas de difusion de decenas de pasos.
- Benchmarking de tecnicas de drifting: sirve como base para comparar el "action-aware video drifting" con otros metodos de aceleracion de difusion en robotica.
- Fine-tuning sobre nuevas tareas de manipulacion: al estar bajo Apache 2.0 y heredar la arquitectura de Flash-WAM, puede reentrenarse sobre datasets propios de RoboTwin u otros simuladores compatibles.
- Generacion de datos sinteticos para entrenamiento: los videos y acciones generados pueden emplearse para aumentar datasets de imitacion en robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 20,4 GB, por lo que se requiere al menos una GPU con 24 GB de VRAM para cargar el transformer en bfloat16 junto con el VAE y el text encoder.
- GPU recomendadas: A100 (40/80 GB), H100, o GPUs consumer de gama alta con 24 GB o mas (RTX 3090, RTX 4090). No se dispone de datos oficiales de latencia ni throughput.
- Cabe en GPU consumer: previsiblemente si en RTX 3090/4090 con 24 GB, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: el modelo usa la libreria `custom` y requiere la implementacion `WanTransformer3DModel` de Flash-WAM/LingBot-VA. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a modelos de difusion de video.
- Latencia y throughput estimados: no disponibles; el paper propone 1-2 pasos de inferencia como mecanismo de aceleracion, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DriftWAM | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (wkrfugs/DriftWAM) |
| FlashWAM-RoboTwin (modelo base) | no disponible | no disponible | no disponible | no disponible en la informacion | Hugging Face (NU-World-Model-Embodied-AI/FlashWAM-RoboTwin) |
| LingBot-VA | no disponible | no disponible | no disponible | no disponible en la informacion | GitHub (Robbyant/lingbot-va) |

No se dispone de datos de rendimiento ni de parametros para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado exclusivamente sobre RoboTwin 2.0; su generalizacion a otros simuladores o a robot real no esta documentada.
- Solo soporta instrucciones en ingles; no se declara soporte multilingue.
- El checkpoint no incluye VAE, text encoder ni tokenizer: es obligatorio descargarlos del modelo base FlashWAM-RoboTwin, lo que anade complejidad al despliegue.
- Requiere la implementacion custom `WanTransformer3DModel` de Flash-WAM/LingBot-VA; no es compatible con pipelines estandar de `diffusers` sin adaptacion.
- No se han publicado benchmarks en la informacion disponible, por lo que no es posible verificar las ganancias de rendimiento frente a Flash-WAM.
- Riesgo de alucinacion visual y de acciones fisicamente invalidas inherente a los modelos generativos de video y accion; debe validarse en simulacion antes de cualquier uso en robot real.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base FlashWAM-RoboTwin, cuya licencia no se detalla en la informacion disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/wkrfugs/DriftWAM
- Paper: https://arxiv.org/abs/2611.33797
- Modelo base Flash-WAM: https://huggingface.co/NU-World-Model-Embodied-AI/FlashWAM-RoboTwin
- Repositorio Flash-WAM: https://github.com/NU-World-Model-Embodied-AI/Flash-WAM
- Entorno de evaluacion LingBot-VA: https://github.com/Robbyant/lingbot-va#evaluation-on-robotwin-20
