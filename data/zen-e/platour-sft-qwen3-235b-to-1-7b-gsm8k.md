# zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-GSM8K

## Resumen

PLatour-SFT-Qwen3-235B-to-1.7B-GSM8K es un artefacto de investigación publicado por zen-E en Hugging Face que forma parte del proyecto PLatour, orientado a estudiar el Prefill-to-Autoregressive Cross-model Transfer (PACT). La idea central es que un modelo emisor de mayor tamano (Qwen3-235B-A22B-FP8) codifica el prompt y proporciona representaciones ocultas, mientras que un modelo receptor mas pequeno (Qwen3-1.7B) genera la respuesta de forma independiente. El repositorio contiene únicamente las proyecciones lineales ("bridges") entrenadas entre ambos backbones congelados, no un modelo completo.

Este checkpoint concreto corresponde al experimento 05 del proyecto, centrado en la tarea GSM8K (problemas matematicos de primaria). Las bridges se entrenan con recompensas de tarea, partiendo de proyecciones inicializadas a cero, y el método soporta modelos con atención híbrida. El objetivo cientifico es determinar si la mejora en la tarea receptora proviene realmente de la informacion transmitida por el emisor o si es atribuible a la adaptación del receptor, cuestion que el paper aborda mediante el conjunto de controles PACT-Check.

Es relevante ahora porque propone una via alternativa a la destilación clásica: en lugar de transferir pesos o generar datos sinteticos, se transfieren representaciones internas mediante modulos ligeros. El repo ocupa 0,9 GB y no incluye puntuaciones de benchmark, por lo que debe tratarse como material de reproduccion de investigación y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bridges lineales (PLatour/PACT) sobre backbones transformer congelados; emisor Qwen3-235B-A22B (MoE) y receptor Qwen3-1.7B |
| Parametros totales | No disponible para las bridges; backbones: 235B (emisor, con 22B activos) y 1.7B (receptor) |
| Parametros activos | 22B en el emisor (MoE); no disponible para las bridges |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el emisor referenciado es FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors con cargador personalizado (`custom-loader`) |

## Arquitectura y entrenamiento

El modelo no es un transformer completo sino un conjunto de proyecciones lineales que conectan las representaciones ocultas del emisor (Qwen3-235B-A22B-FP8) con el espacio del receptor (Qwen3-1.7B). Ambas redes backbone permanecen congeladas; solo se entrenan las bridges, que parten de una inicializacion a cero y se optimizan mediante recompensas de tarea. El método esta disenado para soportar modelos con mecanismos de atención híbrida.

El entrenamiento se realizo sobre el dataset zen-E/PLatour-Qwen3-Data para la tarea GSM8K. El paper asociado (arXiv:2611.06976) introduce ademas PACT-Check, un marco de controles que incluye Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver, con el fin de verificar si las ganancias dependen de informacion útil del emisor o si pueden surgir solo por adaptación del receptor. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de respuestas a traves del receptor Qwen3-1.7B condicionadas por las representaciones del emisor.
- Razonamiento aritmetico basico orientado a GSM8K (problemas matematicos de primaria).
- Transferencia de informacion entre modelos de distinto tamano y familia de atención mediante bridges lineales.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta modo thinking, vision, audio ni capacidades multimodales.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Requiere el cargador especifico del proyecto PLatour; no es compatible con `AutoModel.from_pretrained` ni con PEFT segun la model card.

## Casos de uso

- Reproduccion de investigación sobre PACT: ejecutar el experimento 05 con `platour-exps download --experiment 5` y el loader oficial para validar los resultados del paper en GSM8K con las revisiones exactas de los backbones.
- Estudio de atribucion de mejoras: usar los controles PACT-Check para determinar si la ganancia del receptor se debe a la informacion del emisor o a la adaptación del receptor, un punto metodologico central en la literatura de transferencia entre modelos.
- Desarrollo de tecnicas de transferencia eficiente: servir como referencia para entrenar bridges lineales entre otros pares de modelos sin modificar los backbones congelados.
- Analisis de modelos con atención híbrida: emplear el checkpoint como ejemplo de integracion de bridges en arquitecturas con mecanismos de atención mixtos.
- Base para experimentos de destilación por representaciones: comparar esta via (transferencia de hidden states) frente a destilacion de logits o generacion de datos sinteticos en tareas de matematicas.
- Auditoria de reproducibilidad: el repositorio incluye hash SHA-256 y mapeo de tensores, lo que permite verificar la integridad del export en pipelines de validacion cientifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones y que no se hace ninguna afirmacion sobre el protocolo de seleccion de checkpoints ni sobre rendimiento no sesgado en held-out. Se requiere evaluacion independiente antes de usar estos artefactos para sostener afirmaciones comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: las bridges ocupan 0,9 GB, pero la inferencia completa requiere cargar el emisor Qwen3-235B-A22B (FP8) y el receptor Qwen3-1.7B en paralelo.
- El emisor de 235B en FP8 requiere aproximadamente 235 GB de VRAM, por lo que necesita multiples GPU de alta gama (H100 80GB, H200, B200) o un despliegue multi-nodo.
- El receptor Qwen3-1.7B cabe en GPU de consumo (por ejemplo, RTX 3060 12GB o superiores en FP16), pero no puede operar de forma aislada con este checkpoint porque depende de las representaciones del emisor.
- Opciones de despliegue: cargador propio del proyecto PLatour (`platour-exps`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-235B-to-1.7B-GSM8K | Bridges sobre 235B + 1.7B | No disponible | Transferencia prefill-a-autoregresivo (PACT) | Apache-2.0 | Hugging Face (zen-E) |
| Qwen3-235B-A22B | 235B totales, 22B activos | No disponible en la busqueda | LLM MoE generalista | No disponible en la busqueda | Hugging Face (Qwen) |
| Qwen3-1.7B | 1.7B | No disponible en la busqueda | LLM denso generalista | No disponible en la busqueda | Hugging Face (Qwen) |
| PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux | Bridges sobre 235B + 1.7B | No disponible | Variante del mismo proyecto sobre MMLU-Redux | Apache-2.0 | Hugging Face (zen-E) |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar por separado los backbones emisor y receptor y usar el cargador del proyecto PLatour.
- No es compatible con `AutoModel.from_pretrained` ni con PEFT segun la model card.
- El repositorio no incluye puntuaciones de benchmark; cualquier afirmacion de rendimiento requiere evaluacion independiente.
- Las revisiones exactas de los backbones usadas en la ejecucion histórica no han sido verificadas de forma independiente y no deben inferirse de la revision mas reciente del Hub.
- El export de inferencia no es estado reanudable de optimizador ni de RNG, por lo que no sirve para continuar el entrenamiento.
- La evaluacion de tareas de programacion requiere un juez oficial aislado segun la documentacion del proyecto.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero heredados potencialmente de Qwen3-1.7B y Qwen3-235B-A22B.
- Uso comercial: la licencia del export es Apache-2.0, pero los modelos upstream conservan sus propias licencias y avisos, que deben respetarse.
- No recomendado para producción: es un artefacto de investigación con cero descargas y sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-GSM8K
- Variante MMLU-Redux: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux
- Paper: https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Modelo emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Perfil del autor: https://huggingface.co/zen-E
