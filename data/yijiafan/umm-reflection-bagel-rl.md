# YijiaFan/UMM-Reflection-BAGEL-RL

## Resumen

UMM-Reflection-BAGEL-RL es un modelo unificado multimodal (any-to-any) desarrollado por YijiaFan y colaboradores, que parte del modelo base BAGEL-7B-MoT y se especializa en generacion de imagenes y edicion de imagenes con capacidad de reflexion nativa. El modelo resuelve el problema de la correccion iterativa en tareas de sintesis visual: en lugar de generar una imagen en un solo paso, es capaz de evaluar su propia salida y repararla en rondas sucesivas. Es relevante porque demuestra que el aprendizaje por refuerzo con trayectorias intercaladas (texto e imagen) puede mejorar de forma sustancial la fidelidad de los modelos generativos.

El modelo se entrena mediante Flow-GRPO multi-ronda sobre el checkpoint SFT del mismo proyecto, optimizando conjuntamente la cabeza de texto (controlador) y la cabeza de flujo (imagen) contra una recompensa graduada de seis familias GenEval. Los resultados reportados muestran mejoras notables frente a BAGEL-Base y BAGEL-SFT en GenEval, WISE, OneIG y T2I-CompBench++.

La arquitectura subyacente es la de BAGEL-7B-MoT, un transformer multimodal con mezcla de expertos (MoE) que integra comprension y generacion en un unico espacio de tokens. El repositorio ocupa 29,5 GB e incluye pesos en safetensors, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), basado en BAGEL-7B-MoT |
| Parametros totales | 7B (modelo base BAGEL-7B-MoT; no se detalla desglose adicional) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`ema.safetensors`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de BAGEL-7B-MoT, un transformer multimodal con mezcla de expertos que unifica la comprension y la generacion de imagenes en un mismo espacio de representacion. Sobre esa base, UMM-Reflection-BAGEL-RL anade un mecanismo de reflexion nativa: el modelo genera una primera imagen, la evalua y, si es necesario, emite una correccion en texto que guia una nueva ronda de generacion de imagen. El checkpoint RL fusiona 784 tensores del modelo de lenguaje y nueve tensores auxiliares (`time_embedder`, `vae2llm`, `llm2vae`, `latent_pos_embed`) del checkpoint-1000 de RL dentro de los pesos SFT; el resto de archivos son identicos byte a byte a BAGEL-7B-MoT en la revision `265d1d48ec8e850a29d3a1f208c2a2ec3cd7577b`.

El entrenamiento parte de UMM-Reflection-BAGEL-SFT y aplica Flow-GRPO multi-ronda. Se utiliza un pool de 3.000 prompts sobre las seis familias de GenEval, construido a partir de los metadatos de entrenamiento de Flow-GRPO y disjunto de los 553 prompts de test de GenEval. El schedule comprende 1.000 pasos en 16 GPUs; cada rank toma 2 prompts con 16 trayectorias hermanas cada uno, 20 pasos de denoising y hasta tres rondas de reparacion. Las tasas de aprendizaje de texto y flujo son constantes, ambas a 5e-6. Para cada prompt se muestrean 16 trayectorias completas de reflexion desde la misma primera imagen, y se optimizan conjuntamente las cabezas de texto y de flujo contra una recompensa graduada de seis familias GenEval.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con resolucion de evaluacion de 512 x 512.
- Edicion y reparacion iterativa de imagenes mediante reflexion multirronda.
- Razonamiento intercalado texto-imagen: el modelo produce texto de control y flujo de imagen de forma conjunta.
- Evaluacion y autocorreccion de la propia salida visual (hasta tres rondas de reparacion).
- Procesamiento any-to-any (pipeline declarado en Hugging Face).
- Capacidades de comprension multimodal heredadas de BAGEL-7B-MoT.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: reflexion multirronda como forma acotada de razonamiento iterativo.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes publicitarias con control de fidelidad: el modelo puede generar una primera propuesta y repararla hasta tres veces, lo que resulta adecuado para briefs con requisitos estrictos de composicion y atributos.
- Edicion iterativa de imagenes en herramientas de diseno: la capacidad de reflexion permite corregir objetos mal renderizados sin intervencion humana, integrandose en flujos de postproduccion.
- Evaluacion automatizada de prompts visuales: el modelo puede usarse como generador de referencia en pipelines de benchmarking de text-to-image, dado que sus resultados estan calibrados contra GenEval-553.
- Prototipado rapido de ilustraciones tecnicas: la resolucion de 512 x 512 y las rondas de reparacion permiten obtener bocetos corregidos en pocos pasos de denoising.
- Investigacion en RL para modelos generativos: el checkpoint y el codigo de evaluacion permiten reproducir experimentos de Flow-GRPO con recompensas graduadas.
- Generacion de datos sinteticos para entrenamiento: el modelo puede producir pares imagen-texto corregidos que sirvan como datos de aumento en otros pipelines.
- Demostraciones interactivas de reflexion multimodal: la project page y el repositorio permiten desplegar demos de correccion iterativa en entornos de investigacion.

## Benchmarks y rendimiento

Evaluacion local con los mismos prompts, resolucion y scorer para cada fila. GenEval usa los 553 prompts oficiales con hasta tres rondas de reparacion.

| Modelo | GenEval | WISE | OneIG | T2I-CompBench++ |
|---|---|---|---|---|
| BAGEL-Base | 0.71 | 0.55 | 0.80 | 0.49 |
| BAGEL-SFT | 0.72 | 0.63 | 0.79 | 0.50 |
| UMM-Reflection (este modelo) | 0.84 | 0.74 | 0.83 | 0.55 |

En GenEval-553, el 64,9 % de las imagenes incorrectas tras el primer render acaban siendo correctas tras la reflexion, frente al 20,6 % del modelo SFT.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 29,5 GB en safetensors, por lo que la inferencia en precision completa requiere al menos esa cantidad de memoria.
- GPU recomendadas: el entrenamiento se realizo en 16 GPUs; para inferencia se recomienda A100 o H100 por el tamano del checkpoint.
- Cabe en consumer GPU: no disponible; el tamano del checkpoint (29,5 GB) supera la VRAM de la mayoria de GPUs de consumo en precision completa.
- Opciones de despliegue: el repositorio oficial proporciona scripts de evaluacion (`scripts/eval/geneval553.sh`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible. La evaluacion usa 50 pasos de denoising, CFG 3.0, temperatura del controlador 0.5 y hasta tres rondas de reparacion, lo que implica multiples pasadas de inferencia por prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GenEval | WISE | OneIG | T2I-CompBench++ | Licencia |
|---|---|---|---|---|---|---|---|
| BAGEL-Base | 7B (MoE) | no disponible | 0.71 | 0.55 | 0.80 | 0.49 | Apache 2.0 |
| BAGEL-SFT | 7B (MoE) | no disponible | 0.72 | 0.63 | 0.79 | 0.50 | Apache 2.0 |
| UMM-Reflection-BAGEL-RL | 7B (MoE) | no disponible | 0.84 | 0.74 | 0.83 | 0.55 | Apache 2.0 |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; al heredar BAGEL-7B-MoT, puede arrastrar los sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: el modelo puede generar imagenes que no correspondan al prompt; la reflexion mitiga pero no elimina este riesgo.
- Limitaciones de contexto o idioma: no se documentan idiomas soportados ni longitud de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial; `ae.safetensors` es el autoencoder FLUX.1 distribuido con BAGEL bajo su propia licencia Apache 2.0, que debe respetarse por separado.
- Caveat para produccion: el modelo esta orientado a investigacion; la evaluacion reportada usa 512 x 512, 50 pasos de denoising y CFG 3.0, y el rendimiento puede variar con otros ajustes.
- La reparacion multironda incrementa el coste computacional: hasta tres rondas de reparacion implican multiples pasadas de inferencia por prompt.
- El checkpoint RL se obtiene fusionando tensores del checkpoint-1000; cambios en la revision base de BAGEL-7B-MoT pueden afectar a la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YijiaFan/UMM-Reflection-BAGEL-RL
- Modelo base SFT: https://huggingface.co/YijiaFan/UMM-Reflection-BAGEL-SFT
- Paper: https://arxiv.org/abs/2609.35767
- Paper en Hugging Face: https://huggingface.co/papers/2609.35767
- Project page: https://waltstephen.github.io/UMM-Reflection/
- Repositorio GitHub: https://github.com/waltstephen/UMM-Reflection
- Modelo base BAGEL-7B-MoT: https://huggingface.co/BAGEL-7B-MoT (referenciado en la model card como BAGEL-7B-MoT revision `265d1d48ec8e850a29d3a1f208c2a2ec3cd7577b`)
