# wxd02/WebShop-MA-SAO-9B-engineer-step144

## Resumen

WebShop-MA-SAO-9B-engineer-step144 es un ajuste fino del modelo multimodal Qwen3.5-9B publicado por el usuario wxd02 en Hugging Face. Se trata de un "Inference Actor" entrenado dentro de un pipeline multiagente (MA-SAO, presumiblemente Multi-Agent Solver-Actor-Optimizer) orientado a la resolucion de tareas de compra en el entorno WebShop, un benchmark de navegacion web con instrucciones en lenguaje natural. El checkpoint corresponde al paso 144 del entrenamiento y no incluye ni el optimizador ni el Critic del sistema completo.

El modelo conserva la arquitectura y el tamano del Qwen3.5-9B original: 9.409.813.744 parametros en formato safetensors, pipeline image-text-to-text y licencia Apache 2.0. Su relevancia es acotada: no es un modelo de proposito general, sino un componente especializado dentro de un sistema de agentes, y su model card advierte explicitamente de que la puntuacion reportada (37/64 exitos estrictos, 57,81%) se obtuvo sobre un holdout local de WebShop 1k, no sobre el benchmark original de 500 tareas.

La informacion publicada es muy limitada: cero descargas, cero likes, sin idiomas declarados y sin datos de benchmarks estandar. Todo lo que sigue se basa en los metadatos de Hugging Face y en la model card del autor; cualquier dato no presente se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de Qwen3.5-9B; detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (fine-tune) del checkpoint Qwen/Qwen3.5-9B, segun los tags `base_model:finetune:Qwen/Qwen3.5-9B`. La arquitectura subyacente corresponde a la familia Qwen3.5, un transformer multimodal con capacidad image-text-to-text, pero la model card no detalla la composicion interna (atencion, capas, dimensiones ocultas, tipo de encoder visual). El pipeline declarado es `image-text-to-text`, lo que implica que el modelo acepta entradas de imagen y texto y genera texto.

El entrenamiento se enmarca en un sistema multiagente denominado MA-SAO, con roles diferenciados (Actor, Solver, Critic, Optimizer). Este checkpoint es unicamente el Actor de inferencia en el paso 144; no incluye el optimizador ni el Critic, por lo que no es reproducible de forma autonoma como sistema completo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o refuerzo. Tampoco se detalla ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y razonamiento multimodal: al heredar Qwen3.5-9B, se espera soporte de entrada image-text-to-text, aunque la model card no documenta el alcance exacto de las capacidades visuales tras el ajuste fino.
- Navegacion web orientada a tareas: entrenado especificamente para el entorno WebShop, que requiere interpretar instrucciones de compra, navegar por paginas y seleccionar productos.
- Actuacion como Actor en un pipeline multiagente: el checkpoint esta disenado para operar junto a un Solver y un harness externos, no como agente autonomo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, en el sentido de que forma parte de un sistema de agentes, pero la orquestacion recae en componentes externos (Solver y harness).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, vision avanzada, audio: no disponible.

## Casos de uso

- Investigacion en agentes web: el modelo sirve como Actor de referencia para reproducir o extender el pipeline MA-SAO sobre WebShop, permitiendo comparar estrategias de harness y de seleccion de acciones.
- Evaluacion de sistemas multiagente: util para medir como un Actor especializado de 9B rinde dentro de un Solver con harness por defecto, con la metrica de exitos estrictos reportada (37/64 en el holdout local).
- Experimentos de ajuste fino sobre Qwen3.5-9B: al estar publicado en safetensors con licencia Apache 2.0, puede emplearse como punto de partida o como referencia de comparacion frente a otros checkpoints del mismo entrenamiento.
- Benchmarking de navegacion web: adecuado para pruebas controladas en entornos tipo WebShop donde se necesite un modelo que interprete instrucciones y genere acciones de compra.
- Docencia y divulgacion: ejemplo practico de como se estructura un sistema multiagente con roles separados (Actor, Critic, Optimizer) y de las limitaciones de reportar metricas parciales.
- Prototipado de asistentes de compra: con las cautelas oportunas, puede explorarse su comportamiento en tareas de seleccion de productos, aunque sin garantias de rendimiento fuera del entorno de entrenamiento.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| WebShop 1k preview holdout (local) | 37/64 exitos estrictos (57,81%) | Medido con el Solver y el harness por defecto; las 64 tareas de desarrollo usadas para seleccionar el harness no forman parte de la puntuacion |
| Benchmark original WebShop (500 tareas) | no disponible | El autor advierte explicitamente de que la cifra anterior no corresponde a este benchmark |
| MMLU, HumanEval, GSM8K u otros | no disponible | No se han publicado resultados en la informacion disponible |

No se han publicado resultados de benchmarks estandar en la informacion disponible. La unica metrica reportada es la del holdout local y el propio autor advierte de que no es una puntuacion standalone del Engineer.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 24 GB.
- Cuantizacion a 8 bits: en torno a 10-12 GB de VRAM; a 4 bits: en torno a 6-8 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs con 12-16 GB para cuantizacion agresiva.
- Cabe en GPU consumer: si, en RTX 4090 en BF16 y en GPUs de 12-16 GB con cuantizacion, siempre que se disponga de una via de cuantizacion compatible con la arquitectura Qwen3.5.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WebShop-MA-SAO-9B-engineer-step144 | 9,41B | no disponible | 57,81% en holdout local WebShop 1k (no comparable con benchmark original) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | no disponible | Apache 2.0 (segun el modelo base) | Hugging Face |
| Otros checkpoints del mismo pipeline MA-SAO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de alternativas en la informacion proporcionada; la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- No es un modelo de proposito general: esta especializado en el entorno WebShop y su rendimiento fuera de ese dominio no esta documentado.
- La metrica reportada (57,81%) corresponde a un holdout local de 64 tareas y no al benchmark original de 500 tareas; el autor lo advierte explicitamente.
- El checkpoint es solo el Actor de inferencia: no incluye optimizador ni Critic, por lo que no reproduce el sistema MA-SAO completo de forma autonoma.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en tareas de navegacion web puede generar acciones o selecciones invalidas.
- Sesgos conocidos: no documentados; al heredar Qwen3.5-9B, podria arrastrar sesgos del modelo base, pero no se aportan analisis.
- Idiomas soportados: no declarados, lo que impide garantizar un comportamiento multilingue fiable.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar las condiciones del modelo base Qwen3.5-9B.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad ni de replicaciones independientes.
- Para produccion: no recomendado sin una evaluacion propia en el dominio objetivo y sin confirmar compatibilidad con el stack de despliegue (vLLM, TGI, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wxd02/WebShop-MA-SAO-9B-engineer-step144
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- WebShop (benchmark): no disponible en la informacion proporcionada
- Paper o blog del pipeline MA-SAO: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
