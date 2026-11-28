# ziyan98/E2K-cd82-Qwen3.8-27B-sayuse-lora

## Resumen

E2K-cd82-Qwen3.8-27B-sayuse-lora es una coleccion de adaptadores LoRA (PEFT) entrenados mediante aprendizaje por refuerzo sobre modelos de la familia E2K, derivados a su vez de un modelo denominado Qwen3.8-27B. El autor, identificado como ziyan98, publica cinco subcarpetas de adaptadores resultantes de distintas ejecuciones de RL orientadas a un objetivo concreto: que el modelo aprenda a formular una declaracion de conocimiento ("say") y a actuar en consecuencia ("use") dentro del juego ARC-AGI-3, concretamente en el entorno cd82.

El interes de esta publicacion es fundamentalmente metodologico y de investigacion. No se trata de un modelo generalista listo para produccion, sino de un artefacto experimental que documenta el proceso de internalizacion de conocimiento mediante recompensas de RL, con registros del entrenador (ficheros `last_step.json`) que detallan pasos entrenados, omitidos y tokens procesados. Los adaptadores se construyen sobre dos modelos base intermedios de la misma saga, lo que refleja un pipeline por etapas de SFT y RL.

La relevancia actual es limitada fuera del ambito de investigacion en RL y agentes, pero resulta significativa como ejemplo reproducible de entrenamiento LoRA sobre entornos ARC-AGI-3. La model card advierte de un incidente de seguridad: la maquina virtual H200 donde se generaron los adaptadores fue comprometida como root, aunque los ficheros estan fechados antes del compromiso y se incluyen sumas SHA256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelos base E2K derivados de Qwen3.8-27B; arquitectura del modelo subyacente no disponible |
| Parametros totales | No disponible (adaptadores LoRA con r=64, alpha=128; el modelo base se denomina 27B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); estados del optimizador omitidos |

## Arquitectura y entrenamiento

Los artefactos son adaptadores LoRA de rango 64 y alpha 128, entrenados con PEFT sobre dos modelos base: `sft_first_armc-cc6-iter5` y `act_ctrl-cc-iter1`, ambos de la misma familia E2K-cd82-Qwen3.8-27B. El entrenamiento se realizo mediante aprendizaje por refuerzo en el que la recompensa del actor premia declarar una afirmacion de conocimiento y actuar en funcion de ella en el juego ARC-AGI-3 (entorno cd82). La model card detalla por subcarpeta el numero de pasos entrenados, omitidos y tokens procesados: `sayuse-iter5` (144 entrenados, 176 omitidos, 1.833.689 tokens), `sayuse-actctrl` (147/173, 1.208.868 tokens), `pilot-iter5` (116/204, 1.854.766 tokens), `pilot-iter5-v1-rtn` (100/220, 1.583.528 tokens) y `pilot-actctrl` (132/188, 2.813.499 tokens).

El pipeline combina etapas previas de SFT (supervised fine-tuning) con iteraciones de RL, segun se deduce de los nombres de los modelos base. No se especifican en la informacion disponible detalles sobre la composicion del dataset, el algoritmo exacto de RL (PPO, GRPO u otro), ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Los estados del optimizador (`optimizer.pt`) no se incluyen en el repositorio.

## Capacidades

- Generacion de texto y razonamiento sobre la base del modelo subyacente Qwen3.8-27B (capacidades concretas no verificadas en la informacion disponible).
- Internalizacion de conocimiento mediante RL: el adaptador esta disenado para que el modelo declare una afirmacion de conocimiento y actue en consecuencia.
- Resolucion de tareas en el entorno ARC-AGI-3 (juego cd82) mediante politica entrenada por refuerzo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: orientado a comportamiento tipo agente en el entorno ARC-AGI-3, sin datos cuantitativos.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Investigacion en RL para agentes: utilizar los adaptadores como punto de partida para reproducir experimentos de internalizacion de conocimiento en entornos ARC-AGI-3, comparando las cinco variantes publicadas.
- Estudio de LoRA sobre modelos grandes: analizar el efecto de rango 64 y alpha 128 en la transferencia de politicas de RL sobre modelos base de 27B.
- Evaluacion de "say and use": medir si el modelo declara conocimiento y lo aplica de forma consistente en tareas de juego, usando los registros `last_step.json` como referencia del entrenamiento.
- Benchmarking de pipelines SFT + RL: comparar los dos modelos base (`sft_first_armc-cc6-iter5` y `act_ctrl-cc-iter1`) como punto de partida para nuevas iteraciones.
- Docencia y divulgacion: emplear la coleccion como ejemplo practico de entrenamiento PEFT con recompensas en entornos de investigacion.
- Reproducibilidad y auditoria: verificar las sumas SHA256 incluidas para validar la integridad de los artefactos antes de su uso en experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 9,3 GB, pero corresponde a adaptadores LoRA; el modelo base de 27B requiere hardware adicional no especificado.
- GPU recomendadas: la model card menciona que el entrenamiento se realizo en una VM con H200; no se detallan GPU recomendadas para inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: al ser adaptadores PEFT en safetensors, se cargarian con la libreria `peft` sobre el modelo base correspondiente; no se especifican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (adaptadores LoRA de RL para ARC-AGI-3 sobre bases de 27B).

## Limitaciones y advertencias

- Artefacto experimental: no es un modelo generalista; su utilidad esta acotada al entorno ARC-AGI-3 (cd82) y a la investigacion en RL.
- Incidente de seguridad: la VM H200 donde se generaron los adaptadores fue comprometida como root desde el 2026-11-27 06:50 UTC; los ficheros estan fechados antes del compromiso y se incluyen sumas SHA256, pero se recomienda verificar la integridad antes de cualquier uso.
- Estados del optimizador omitidos: no es posible reanudar el entrenamiento exactamente desde el punto final.
- Idiomas, contexto y cuantizacion no documentados: dificulta evaluar su idoneidad en produccion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base subyacente puede tener condiciones adicionales no especificadas.
- Ausencia de benchmarks: no hay evidencia cuantitativa de rendimiento publicada.

## Enlaces

- Hugging Face: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sayuse-lora
- Modelo base 1: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_armc-cc6-iter5
- Modelo base 2: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter1
