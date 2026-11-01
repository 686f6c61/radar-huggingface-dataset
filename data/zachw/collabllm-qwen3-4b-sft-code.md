# ZachW/CollabLLM-Qwen3-4B-SFT-Code

## Resumen

CollabLLM-Qwen3-4B-SFT-Code es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base Qwen3-4B de Alibaba Qwen, publicado por el usuario independiente ZachW. No se trata de un checkpoint oficial del proyecto CollabLLM, sino de un artefacto de reproducción que aplica la metodología y los datos del paper CollabLLM (arXiv:2502.00640) a un modelo base mas pequeno. El adaptador esta especializado en tareas de codigo conversacional, concretamente en el dataset interactive-bigcodebench de los autores originales.

El modelo resuelve el problema de la colaboracion multi-turno en tareas de programacion: en lugar de generar una respuesta unica, el adaptador esta entrenado para mantener dialogos interactivos donde el asistente solicita aclaraciones, propone pasos y refina soluciones con el usuario. Es relevante para desarrolladores que quieran experimentar con tecnicas de alineacion conversacional (CollabLLM) sobre un modelo de 4 mil millones de parametros que cabe en hardware de consumo.

El adaptador tiene un tamano de repositorio de 0,3 GB (solo los pesos LoRA), requiere descargar por separado los pesos base de Qwen3-4B y se distribuye bajo licencia Apache 2.0. La longitud de contexto heredada del modelo base es de 32.768 tokens nativos (extensible hasta 131.072 con YaRN), aunque el entrenamiento del adaptador se realizo con una longitud maxima de secuencia de 1536 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B); adaptador LoRA: no disponible (rango 32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el base; entrenamiento del adaptador limitado a 1536 tokens |
| Tipos de cuantizacion | No disponible en la model card; el base Qwen3-4B soporta bfloat16, GPTQ, AWQ y GGUF via herramientas externas |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only denso de 4 mil millones de parametros con atencion por cabezas agrupadas (GQA) y soporte nativo de modo pensamiento (thinking mode). El adaptador LoRA tiene rango 32, alpha 16 y dropout 0.1, aplicado a las capas de proyeccion de atencion y MLP. El entrenamiento se realizo sobre el dataset interactive-bigcodebench del repositorio original de CollabLLM, con una conversacion SFT por dialogue ID (se selecciona el prompt mas largo y se anade su respuesta asistente elegida). El split es de 450 conversaciones de entrenamiento y 50 de validacion con semilla 42.

Los hiperparametros son: tres epocas, 24 pasos de optimizador, batch efectivo de 64, learning rate de 1e-5, warmup ratio de 0.1, perdida solo sobre tokens del asistente y longitud maxima de secuencia de 1536 tokens. Se entreno en modo no-thinking y la plantilla de chat del tokenizer incluido fija `enable_thinking = false`. No se aplicaron fases de GRPO, PPO ni DPO: este release contiene unicamente el adaptador SFT final. El autor indica explicitamente que no se reclama ningun resultado de benchmark ni la reproduccion de la Tabla 1 del paper original.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, orientada a tareas de programacion.
- Colaboracion interactiva: el adaptador esta entrenado para formular preguntas aclaratorias y refinar soluciones con el usuario (metodologia CollabLLM).
- Razonamiento sobre codigo: comprension de problemas de programacion y propuesta de soluciones en el contexto del dataset BigCodeBench.
- Generacion de codigo en dialogos: respuestas asistente condicionadas a un system prompt especifico incluido en el repositorio (`system_prompt.txt`).
- Hereda del base Qwen3-4B capacidades generales de generacion de texto, matematicas basicas y comprension lectora, aunque el ajuste esta especializado en codigo conversacional.
- Soporte de tool calling: no documentado en la model card; heredado potencialmente del base, pero no verificado para este adaptador.
- Capacidades de agente multi-paso: no documentadas explicitamente para este adaptador.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el base Qwen3-4B soporta mas de 100 idiomas.
- Modo pensamiento (thinking): desactivado de forma fija por la plantilla de chat incluida.

## Casos de uso

- Asistente de programacion interactivo: el adaptador puede gestionar dialogos donde el usuario plantea un problema de codigo y el modelo solicita aclaraciones antes de proponer una solucion, replicando el flujo de CollabLLM sobre BigCodeBench.
- Investigacion en alineacion conversacional: util para reproducir y experimentar con la metodologia CollabLLM en un modelo de 4B, comparando el comportamiento colaborativo frente al base sin ajustar.
- Evaluacion de tecnicas SFT con LoRA: sirve como referencia de como aplicar un adaptador de rango 32 sobre Qwen3-4B con perdida solo en el asistente y plantilla de chat fija en modo no-thinking.
- Prototipado de tutores de codigo: el modelo puede actuar como tutor que guia al usuario paso a paso en la resolucion de ejercicios de programacion, aprovechando su entrenamiento en dialogos interactivos.
- Generacion de codigo en entornos con restricciones de hardware: al ser un adaptador sobre un base de 4B, puede desplegarse en GPUs de consumo (por ejemplo, RTX 4090 o RTX 3090) con cuantizacion del base, aunque el adaptador en si requiere precision bfloat16 para cargarse con PEFT.
- Experimentacion academica con datasets de codigo conversacional: permite estudiar el efecto del SFT sobre interactive-bigcodebench sin necesidad de entrenar desde cero ni de disponer de GPUs de datacenter.
- Base para futuros ajustes por RL: el autor indica que este release no incluye GRPO, PPO ni DPO, por lo que puede servir como punto de partida (SFT) para fases posteriores de alineacion por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente en la model card que no reclama ninguna puntuacion de benchmark y que el uso de Qwen3-4B (en lugar del modelo original del paper) no permite establecer la reproduccion de los resultados de la Tabla 1 de CollabLLM.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B en bfloat16 requiere aproximadamente 8-9 GB de VRAM; con cuantizacion de 4 bits (GPTQ/AWQ/GGUF Q4) baja a unos 2,5-3 GB. El adaptador LoRA anade una sobrecarga minima (decenas de MB en bfloat16).
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en bfloat16 sin cuantizar; RTX 3090 (24 GB) y RTX 4080 (16 GB) tambien son suficientes para el base en bfloat16.
- Cabe en GPU de consumo: si, el base Qwen3-4B en bfloat16 cabe en RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti Super (16 GB); con cuantizacion 4-bit cabe en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: el adaptador se carga con `peft` + `transformers` (segun el ejemplo de la model card). Para servir en produccion puede fusionarse con el base y desplegarse con vLLM, TGI o llama.cpp (este ultimo requiere convertir el modelo fusionado a GGUF). Ollama es viable tras fusion y conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CollabLLM-Qwen3-4B-SFT-Code | 4B (base) + LoRA | 32.768 (base); 1536 en entrenamiento | Apache 2.0 | safetensors (PEFT) | Adaptador SFT para codigo conversacional; sin benchmarks publicados |
| Qwen/Qwen3-4B | 4B | 32.768 (extensible a 131.072 con YaRN) | Apache 2.0 | safetensors, GGUF, GPTQ, AWQ | Modelo base generalista con thinking mode; sin ajuste colaborativo |
| CollabLLM oficial (paper) | No disponible en la informacion | No disponible | No disponible | No disponible | Checkpoint oficial del paper; el autor no lo reproduce |
| Modelos de codigo de 3-7B (p. ej. Qwen2.5-Coder-7B) | 7B | 32.768 | Apache 2.0 | safetensors, GGUF, GPTQ, AWQ | Alternativa generalista de codigo; no especializada en dialogo colaborativo |

La comparativa directa con el checkpoint oficial de CollabLLM no es posible con la informacion disponible, ya que la model card no detalla el modelo base ni los resultados del paper. Frente a Qwen3-4B, la diferencia principal es el ajuste SFT sobre datos interactivos de BigCodeBench y la desactivacion fija del thinking mode.

## Limitaciones y advertencias

- No es un checkpoint oficial de CollabLLM: es un artefacto de reproduccion independiente y el autor no reclama la reproduccion de los resultados del paper.
- No incluye fases de GRPO, PPO ni DPO; solo contiene el adaptador SFT final, por lo que el comportamiento colaborativo puede ser limitado frente al modelo completo del paper.
- Entrenado unicamente en ingles segun la model card; el multilingueismo del base Qwen3-4B no esta garantizado tras el ajuste.
- Longitud de secuencia de entrenamiento limitada a 1536 tokens, muy inferior al contexto nativo del base; el rendimiento en dialogos largos puede degradarse.
- Modo pensamiento desactivado de forma fija por la plantilla de chat incluida; no se puede activar thinking mode sin modificar la plantilla.
- Dataset de entrenamiento muy pequeno (450 conversaciones), lo que aumenta el riesgo de sobreajuste y de baja generalizacion a dominios de codigo no representados en interactive-bigcodebench.
- Riesgo de alucinacion inherente a modelos de 4B; el autor advierte que el modelo puede producir respuestas incorrectas y debe evaluarse para la aplicacion prevista.
- Sesgos: no documentados en la model card; heredados potencialmente del base Qwen3-4B y de los datos de BigCodeBench.
- Licencia Apache 2.0 para el adaptador, pero los datos de origen y el prompt de CollabLLM conservan sus terminos originales (el prompt mantiene aviso MIT); el uso comercial debe verificar las condiciones del dataset interactive-bigcodebench.
- Requiere descargar los pesos base de Qwen3-4B por separado y una revision concreta (`1cfa9a7208912126459214e8b04321603b3df60c`) para reproducibilidad.
- Solo 12 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZachW/CollabLLM-Qwen3-4B-SFT-Code
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Paper CollabLLM: https://arxiv.org/abs/2502.00640
- Repositorio original CollabLLM: https://github.com/Wuyxin/collabllm/tree/d573e4949abdc301cb2b630525c593cc432e94b8
- Dataset interactive-bigcodebench (dentro del repo original): https://github.com/Wuyxin/collabllm/tree/d573e4949abdc301cb2b630525c593cc432e94b8/data/interactive-bigcodebench
