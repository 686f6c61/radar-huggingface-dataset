# ZachW/CollabLLM-Qwen3-4B-SFT-Math

## Resumen

CollabLLM-Qwen3-4B-SFT-Math es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen3-4B, publicado por el usuario ZachW en Hugging Face. No se trata de un checkpoint oficial del equipo de CollabLLM, sino de un artefacto de reproduccion independiente que aplica el metodo y los datos del paper CollabLLM (arXiv:2502.00640) al modelo Qwen3-4B de Alibaba. El adaptador esta entrenado especificamente sobre el conjunto de datos interactive-math-hard, orientado a conversaciones interactivas de resolucion de problemas matematicos.

El modelo resuelve un problema concreto: adaptar un LLM de 4.000 millones de parametros para sostener dialogos multi-turno en los que el asistente colabora con el usuario en tareas de matematicas dificiles, en lugar de limitarse a una respuesta unica. La relevancia actual radica en que demuestra que es posible reproducir el paradigma de entrenamiento colaborativo de CollabLLM con recursos modestos (un solo adaptador LoRA de rango 32 sobre un modelo de 4B), lo que facilita la experimentacion academica y el desarrollo de asistentes interactivos ligeros.

El repositorio ocupa 0,3 GB e incluye unicamente el adaptador LoRA final y el tokenizer, no pesos de GRPO, PPO o DPO. El modelo opera en modo no-thinking y esta orientado exclusivamente al ingles. La licencia del adaptador es Apache 2.0, aunque los datos de origen y el prompt de sistema incluido conservan sus propios terminos (MIT para el prompt de CollabLLM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso secuencias de maximo 1536 tokens; el contexto nativo del Qwen3-4B base no se detalla) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (adaptador); datos de origen y prompt de sistema sujetos a sus propios terminos (MIT para el prompt de CollabLLM) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere descargar por separado los pesos base de Qwen/Qwen3-4B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only de la familia Qwen3. El ajuste es un LoRA de rango 32, alpha 16 y dropout 0,1, aplicado a las capas de proyeccion de atencion y MLP. El entrenamiento uso la revision `1cfa9a7208912126459214e8b04321603b3df60c` del modelo base y el dataset interactive-math-hard del repositorio original de CollabLLM (commit `d573e4949abdc301cb2b630525c593cc432e94b8`). Por cada dialogue ID se selecciono la conversacion con el prompt mas largo y se anadio la respuesta elegida del asistente, con una division de 450 conversaciones de entrenamiento y 50 de validacion (semilla 42).

Los hiperparametros concretos son: tres epocas, 24 pasos de optimizador, tamano de batch efectivo 64, learning rate 1e-5 y warmup ratio 0,1. Se uso perdida solo sobre los tokens del asistente y una longitud maxima de secuencia de 1536 tokens. El modelo opera en modo no-thinking: el chat template del tokenizer incluido fija `enable_thinking = false`. El adaptador es unicamente SFT; no incluye pesos de GRPO, PPO ni DPO, por lo que no reproduce los resultados de la Tabla 1 del paper original. Los hiperparametros exactos, las metricas de entrenamiento y validacion y el SHA-256 del adaptador estan en `training_metadata.json`, y el prompt de sistema original del asistente se incluye como `system_prompt.txt`.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en dialogos multi-turno orientados a tareas.
- Razonamiento matematico interactivo: entrenado sobre el dataset interactive-math-hard para colaborar con el usuario en la resolucion de problemas dificiles.
- Estilo de asistencia colaborativa: el prompt de sistema de CollabLLM induce al modelo a hacer preguntas, pedir aclaraciones y guiar al usuario en lugar de dar una respuesta cerrada.
- Modo no-thinking: el chat template desactiva explicitamente el razonamiento extendido de Qwen3.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla del propio dialogo interactivo.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documentan capacidades de vision ni de audio.

## Casos de uso

- Tutoria matematica interactiva: el adaptador esta entrenado para sostener conversaciones en las que el asistente pregunta, aclara y guia al estudiante paso a paso en problemas dificiles, gracias al formato de dialogo del dataset interactive-math-hard.
- Asistente de resolucion de problemas en entornos educativos: puede integrarse en plataformas de aprendizaje que requieran respuestas en varios turnos con contexto de hasta 1536 tokens por interaccion.
- Reproduccion academica del metodo CollabLLM: sirve como artefacto de referencia para investigadores que quieran validar el paradigma de entrenamiento colaborativo con un modelo de 4B y un adaptador LoRA de bajo coste.
- Experimentacion con LoRA y PEFT: al ser un adaptador de rango 32 sobre Qwen3-4B, es util para probar tecnicas de ajuste eficiente en GPUs de consumo.
- Generacion de dialogos sinteticos de matematicas: puede emplearse para producir conversaciones de entrenamiento o evaluacion en las que un asistente colabora con un usuario simulado.
- Base para futuros ajustes por RL: al ser un checkpoint SFT, puede servir como punto de partida para aplicar GRPO, PPO o DPO en investigaciones posteriores, aunque este release no incluye esos pesos.
- Demostracion de asistentes conversacionales ligeros: por su tamano de 4B y su licencia Apache 2.0, es adecuado para prototipos de asistencia conversacional en ingles desplegables en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explicitamente que no reclama ninguna puntuacion de benchmark y que, al usar Qwen3-4B, no establece la reproduccion de los resultados de la Tabla 1 del paper original de CollabLLM.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre Qwen3-4B en bfloat16, el modelo base requiere del orden de 8 GB de VRAM solo para los pesos, a los que se suman el adaptador y las activaciones.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano del modelo base, cabria esperar GPUs con al menos 8-16 GB de VRAM, pero este dato no se confirma en la model card.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende de la cuantizacion del modelo base, que no se detalla.
- Opciones de despliegue: la model card solo documenta carga mediante `transformers`, `peft`, `accelerate` y `huggingface_hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CollabLLM-Qwen3-4B-SFT-Math (este) | 4B (base) + LoRA r32 | No disponible (entrenado a 1536 tokens) | SFT colaborativo en matematicas, solo ingles | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-4B (base) | 4B | No disponible en la informacion proporcionada | LLM generalista multilingue con modo thinking | Apache 2.0 | Hugging Face |
| Checkpoint oficial de CollabLLM | No disponible en la informacion proporcionada | No disponible | SFT + optimizacion colaborativa segun el paper | No disponible | Repositorio original de CollabLLM |

La comparacion con el checkpoint oficial de CollabLLM no puede completarse porque la informacion proporcionada no detalla sus parametros, contexto ni licencia. El modelo base Qwen3-4B es la referencia natural, ya que este adaptador anade comportamiento colaborativo en matematicas a costa de restringir el idioma al ingles y desactivar el modo thinking.

## Limitaciones y advertencias

- No es un checkpoint oficial de CollabLLM: es una reproduccion independiente y no establece la reproduccion de los resultados del paper.
- Solo contiene pesos SFT; no incluye GRPO, PPO ni DPO, por lo que no refleja la fase de optimizacion colaborativa completa del metodo original.
- Entrenado exclusivamente en ingles; no se documenta soporte de otros idiomas.
- Modo no-thinking forzado por el chat template: no se puede activar el razonamiento extendido de Qwen3 sin modificar el template.
- La model card advierte de que el modelo puede producir respuestas incorrectas y debe evaluarse para la aplicacion prevista.
- Riesgo de alucinacion en problemas matematicos no cubiertos por el dataset de entrenamiento; no se han publicado evaluaciones que lo cuantifiquen.
- Sesgos conocidos: no documentados en la informacion proporcionada; hereda los sesgos del modelo base Qwen3-4B y del dataset interactive-math-hard.
- Restricciones de licencia: el adaptador es Apache 2.0, pero los datos de origen y el prompt de sistema incluido conservan sus propios terminos (MIT para el prompt de CollabLLM), que deben respetarse en uso comercial.
- Requiere descargar por separado los pesos base de Qwen/Qwen3-4B en la revision especificada para garantizar la compatibilidad del adaptador.
- Volumen de entrenamiento muy reducido (450 conversaciones, 24 pasos de optimizador), lo que limita la generalizacion fuera del dominio de matematicas interactivas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZachW/CollabLLM-Qwen3-4B-SFT-Math
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Paper CollabLLM: https://arxiv.org/abs/2502.00640
- Codigo original de CollabLLM: https://github.com/Wuyxin/collabllm/tree/d573e4949abdc301cb2b630525c593cc432e94b8
- Dataset interactive-math-hard: https://github.com/Wuyxin/collabllm/tree/d573e4949abdc301cb2b630525c593cc432e94b8/data/interactive-math-hard
