# zen-E/PLatour-TR-LoRA-Qwen3.5-4B-DeepCoder

## Resumen

PLatour-TR-LoRA-Qwen3.5-4B-DeepCoder es un adaptador PEFT (LoRA) publicado por el usuario zen-E sobre el backbone multimodal Qwen/Qwen3.5-4B. Forma parte del proyecto de investigacion PLatour, que explora la transferencia cruzada de modelos entre prefill y autoregresivo (PACT): un modelo emisor de mayor tamano codifica el prompt y proporciona representaciones ocultas, mientras que un receptor mas pequeno genera la respuesta de forma independiente. El adaptador se entrena sobre el decodificador de texto del backbone, no sobre el codificador de vision.

El modelo se presenta como un artefacto de inferencia historico, sin puntuaciones de benchmark publicadas por el autor. La model card advierte explicitamente de que el empaquetado no establece un protocolo de seleccion de checkpoint ni una evaluacion imparcial, y que se requiere evaluacion independiente antes de formular nuevas afirmaciones comparativas. El dataset asociado es zen-E/PLatour-DeepCoder-Data y el articulo de referencia es arXiv:2611.06976.

Por su naturaleza (adaptador LoRA sobre un modelo base de 4B), su relevancia practica esta ligada al ecosistema Qwen3.5 y al marco experimental PLatour, mas que a un uso productivo directo. El repo ocupa 1.0 GB y la licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el decodificador de texto de Qwen3.5-4B; el backbone es un transformer multimodal con atencion hibrida |
| Parametros totales | No disponible (el adaptador no incluye los pesos del backbone; el base es de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del backbone Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el backbone admite las cuantizaciones de Qwen3.5-4B) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere los pesos del backbone por separado |

## Arquitectura y entrenamiento

El adaptador se aplica exclusivamente al decodificador de texto del backbone Qwen3.5-4B mediante PEFT/LoRA. El backbone es un modelo multimodal con atencion hibrida, y el proyecto PLatour soporta explicitamente modelos con atencion hibrida en su metodo de transferencia. El adaptador no modifica el codificador de vision ni incluye pesos del backbone; conserva los valores FP32 originales del adaptador y los modulos QKV fusionados.

El entrenamiento se enmarca en el metodo PACT descrito en el paper: se entrenan puentes lineales ligeros entre backbones congelados usando recompensas de tarea, partiendo de proyecciones inicializadas a cero. El paper introduce ademas PACT-Check, con controles de Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver, para determinar si las mejoras dependen de informacion util del emisor o surgen simplemente de la adaptacion del receptor. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y codigo sobre el backbone Qwen3.5-4B, con el adaptador aplicado al decodificador de texto.
- Razonamiento y generacion de funciones en Python (el ejemplo de la model card solicita una funcion que sume dos enteros).
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizer de Qwen3.5-4B.
- Capacidades multimodales heredadas del backbone (el backbone es `AutoModelForImageTextToText`), aunque el adaptador no modifica el codificador de vision.
- Evaluacion orientada a benchmarks de codigo: LCB v6, HumanEval y MBPP mediante el pipeline `platour-exps`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, modo thinking ni audio.

## Casos de uso

- Investigacion en transferencia cruzada de modelos: el adaptador sirve como checkpoint del experimento 30 de PLatour para reproducir los controles PACT-Check y estudiar si la informacion del emisor mejora al receptor.
- Generacion de codigo en Python con Transformers: cargando el backbone Qwen3.5-4B y el adaptador via `PeftModel`, se pueden generar funciones y fragmentos de codigo con `model.generate`.
- Evaluacion de benchmarks de codigo: el pipeline `platour-exps evaluate --experiment 30` ejecuta LCB v6, HumanEval y MBPP con un juez de codigo en contenedores Docker aislados.
- Reproducibilidad de artefactos historicos: el comando `platour-exps download --experiment 30` descarga y verifica hashes de configuracion y pesos sin cargar modelos.
- Estudio de adaptadores LoRA sobre backbones multimodales: permite analizar el efecto de adaptar solo el decodificador de texto frente al codificador de vision.
- Despliegue experimental con vLLM: la model card menciona una conversion de runtime para vLLM distinta de la ruta estandar de Transformers, util para comparar rutas de inferencia.
- Base para experimentos de destilacion o comunicacion entre modelos: el marco PACT permite sustituir emisor o receptor y medir el impacto en tareas de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que son artefactos de inferencia historicos sin puntuaciones de benchmark y que el empaquetado no establece un protocolo de seleccion de checkpoint ni una evaluacion imparcial. El pipeline permite ejecutar LCB v6, HumanEval y MBPP, pero no se proporcionan los resultados numericos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el backbone Qwen3.5-4B requiere memoria suficiente para sus 4B parametros mas el adaptador. La model card indica "suficiente memoria GPU para los modelos seleccionados" sin cifras.
- GPU recomendadas: no especificadas en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Despliegue: ruta estandar con Transformers + PEFT (`AutoModelForImageTextToText` + `PeftModel`); el proyecto menciona ademas una conversion de runtime para vLLM. No se documentan llama.cpp, Ollama ni TGI.
- Colocacion multi-GPU: `--n-gpu 8` lanza 8 replicas independientes, una por GPU, con preguntas disjuntas; sin `--n-gpu` se usa colocacion automatica en un solo proceso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PLatour-TR-LoRA-Qwen3.5-4B-DeepCoder | Adaptador sobre base 4B | No disponible | Apache 2.0 | Hugging Face (53 descargas) | Adaptador LoRA experimental, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible | No disponible en la informacion | Hugging Face | Backbone multimodal sin adaptar |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No se identifican en la informacion proporcionada |

No se dispone de datos de rendimiento del adaptador ni de modelos directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de benchmarks: el autor declara que no hay puntuaciones publicadas y que el empaquetado no constituye una evaluacion imparcial.
- Artefacto historico: se describe como checkpoint de inferencia historico, no como modelo listo para produccion.
- Solo decodificador de texto: no adapta el codificador de vision, por lo que las capacidades multimodales no se benefician del entrenamiento.
- Dependencia del backbone: requiere cargar Qwen/Qwen3.5-4B en una revision concreta (`851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y los pesos no se incluyen en el repo.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible.
- Sesgos: no documentados en la informacion disponible.
- Idiomas: no especificados; no se garantiza soporte multilingue mas alla del backbone.
- Licencia: Apache 2.0 declarada, pero el uso comercial esta sujeto ademas a la licencia del backbone Qwen3.5-4B, no detallada aqui.
- Evaluacion de benchmarks de codigo: requiere un juez de codigo, Docker y variables de entorno (`JUDGE_ROOT`, `LCB_CHECKER`, `JUDGE_IMAGE`, `PYTHONPATH`); no es una evaluacion ligera.
- Entorno: requiere Linux con CUDA y Python 3.11.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-TR-LoRA-Qwen3.5-4B-DeepCoder
- Paper: https://arxiv.org/html/2611.06976
- Codigo: https://github.com/zhenyi4/platour
- Coleccion de modelos: https://huggingface.co/collections/zen-E/platour
- Guia de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guia de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tareas: https://github.com/zhenyi4/platour/blob/main/qwen35/README.md
- Indice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DeepCoder-Data
- Backbone: https://huggingface.co/Qwen/Qwen3.5-4B
