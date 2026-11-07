# zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-NoCoT

## Resumen

PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-NoCoT es un artefacto de investigacion publicado por zen-E dentro del proyecto PLatour, que explora la transferencia entre modelos de distinto tamano (Prefill-to-Autoregressive Cross-model Transfer, PACT). En este esquema, un modelo "emisor" grande (Qwen3-235B-A22B-FP8) procesa el prompt y genera representaciones ocultas, mientras que un modelo "receptor" pequeno (Qwen3-1.7B) produce la respuesta de forma independiente. Lo que se distribuye en este repositorio no es un modelo completo, sino las proyecciones lineales ("bridges") entrenadas entre ambos backbones congelados.

El modelo corresponde al Experimento 03 del proyecto, centrado en la tarea `chemistry_no_cot` (razonamiento quimico sin cadena de pensamiento explicita). El entrenamiento de los puentes se realiza con recompensas de tarea, partiendo de proyecciones inicializadas a cero, y soporta modelos con atencion hibrida. El repositorio ocupa 0,9 GB y contiene unicamente los pesos de las proyecciones y el `config.json` con la identidad del experimento, dependencias, mapeo de tensores y hashes.

Es relevante ahora porque el paper asociado (arXiv 2611.06976) introduce ademas PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar si las mejoras provienen realmente de la informacion transferida por el emisor o de la mera adaptacion del receptor. Es decir, el interes del artefacto es metodologico y experimental, no el de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (backbones Qwen3); puentes lineales entre emisor y receptor |
| Parametros totales | No disponible como modelo unico; receptor Qwen3-1.7B (1,7B) y emisor Qwen3-235B-A22B (235B totales) |
| Parametros activos | Emisor: 22B activos (MoE, segun nomenclatura A22B); receptor: no aplica |
| Longitud de contexto | No disponible (heredada de los backbones Qwen3, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el emisor referenciado esta en FP8; los puentes se distribuyen en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | Safetensors con cargador propio (`custom-loader`); no compatible con `AutoModel.from_pretrained` ni PEFT |

## Arquitectura y entrenamiento

El enfoque PACT separa el procesamiento del prompt del de la generacion: el emisor grande codifica el prompt y entrega representaciones ocultas que, mediante puentes lineales ligeros, se inyectan en el receptor pequeno, que genera la respuesta de forma autonoma. Los backbones permanecen congelados y solo se entrenan las proyecciones, inicializadas a cero y optimizadas con recompensas de tarea. El diseno contempla modelos con atencion hibrida, lo que permite combinar backbones con distintos esquemas de atencion.

Este repositorio concreto corresponde al Experimento 03 sobre `chemistry_no_cot`, con datos del dataset `zen-E/PLatour-Qwen3-Data`. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO mas alla del entrenamiento guiado por recompensas de tarea. El autor advierte explicitamente que las revisiones exactas de los backbones usadas en la ejecucion historica no han sido verificadas de forma independiente.

## Capacidades

- Generacion de texto y razonamiento en el dominio de quimica, condicionada por las representaciones del emisor.
- Razonamiento sin cadena de pensamiento explicita (variante NoCoT del experimento).
- Transferencia de informacion entre modelos de distinta escala mediante puentes lineales entrenados.
- Soporte de modelos con atencion hibrida en el diseno del metodo.
- Capacidades multilingues: no disponibles en la informacion.
- Tool calling, function calling y uso como agente: no disponibles en la informacion.

## Casos de uso

- Investigacion sobre transferencia entre modelos: permite reproducir el Experimento 03 de PACT y analizar si las representaciones del emisor aportan senal util al receptor en tareas de quimica.
- Validacion metodologica con PACT-Check: los controles Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver permiten descartar que las mejoras se deban solo a la adaptacion del receptor.
- Estudio de eficiencia computacional: evaluar si un receptor de 1,7B asistido por un emisor de 235B se aproxima al rendimiento del emisor en tareas especificas con un coste de inferencia mucho menor.
- Analisis de dominios cientificos: el foco en quimica sin CoT sirve para estudiar como se comporta la transferencia en tareas de razonamiento tecnico donde la cadena de pensamiento no esta disponible.
- Reproducibilidad de experimentos: el `config.json` incluye identidad del experimento, mapeo de tensores y hashes SHA-256, lo que facilita auditorias de los pesos distribuidos.
- Base para nuevos experimentos PACT: las proyecciones pueden servir como punto de partida o referencia para comparar con otros pares emisor-receptor o con otros dominios del dataset PLatour.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el repositorio distribuye pesos de inferencia historicos sin puntuaciones de benchmark y que no se reclama ningun protocolo de seleccion de checkpoint ni rendimiento imparcial en held-out.

## Requisitos de hardware

- VRAM estimada: no disponible para el conjunto completo; el receptor Qwen3-1.7B en FP16 requiere aproximadamente 3,4 GB solo para pesos, y el emisor Qwen3-235B-A22B en FP8 supera los 200 GB.
- GPU recomendadas: el emisor requiere hardware de clase H100/H200 o multi-GPU; el receptor puede ejecutarse en GPUs consumer con suficiente VRAM.
- GPU consumer: el receptor de 1,7B cabe en tarjetas consumer modernas (por ejemplo, RTX 4090 o superiores); el emisor no.
- Opciones de despliegue: el repositorio no es cargable con `AutoModel.from_pretrained` ni PEFT; requiere el cargador del proyecto PLatour (`platour-exps download --experiment 3`) junto con los backbones descargados por separado. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-NoCoT | Puentes sobre receptor 1,7B y emisor 235B (22B activos) | No disponible | Transferencia PACT entre backbones congelados | Apache-2.0 | Hugging Face (cargador propio) |
| Qwen3-1.7B | 1,7B | No disponible en la informacion | LLM denso estandar | No disponible en la informacion | Hugging Face |
| Qwen3-235B-A22B | 235B totales / 22B activos | No disponible en la informacion | LLM MoE | No disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo autonomo: son proyecciones que requieren descargar por separado el emisor y el receptor y usar el cargador del proyecto.
- No es compatible con `AutoModel.from_pretrained` ni con PEFT, lo que limita su integracion en pipelines estandar.
- No se adjuntan resultados de benchmark ni protocolo de seleccion de checkpoint; cualquier afirmacion de rendimiento requiere evaluacion independiente.
- Las revisiones exactas de los backbones usadas en la ejecucion historica no han sido verificadas de forma independiente y no deben inferirse de la revision mas reciente del Hub.
- El export no constituye un estado reanudable de optimizador/RNG, por lo que no permite retomar el entrenamiento tal cual.
- Riesgo de alucinacion y sesgos: no documentados en la informacion; al ser un artefacto de investigacion sin evaluacion publicada, deben asumirse los riesgos propios de los backbones Qwen3.
- Licencia Apache-2.0 para el export, pero los modelos upstream conservan sus propias licencias y avisos, que deben respetarse en uso comercial.
- Idiomas soportados no especificados; el dominio evaluado es quimica sin CoT, lo que restringe la generalizacion esperada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-NoCoT
- Paper (arXiv 2611.06976): https://arxiv.org/abs/2611.06976
- Version HTML del paper: https://arxiv.org/html/2611.06976
- Coleccion PLatour en Hugging Face: https://huggingface.co/collections/zen-E/platour
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Modelo receptor: https://huggingface.co/Qwen/Qwen3-1.7B
