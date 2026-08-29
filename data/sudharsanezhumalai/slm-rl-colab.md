# SudharsanEzhumalai/slm-rl-colab

## Resumen

El repositorio `SudharsanEzhumalai/slm-rl-colab` contiene un adaptador LoRA (PEFT) diseñado para warm-start el juego **Boxing** de Atari sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. Este adaptador se ha entrenado con el framework [SLM-RL](https://github.com/CraftsMan-Labs/SLM-RL), un entorno de auto-mejora para modelos de lenguaje pequeños que aprenden a jugar a videojuegos mediante aprendizaje por refuerzo. El adaptador se entrena con la técnica `reject_sft` sobre demostraciones de un agente profesor DQN, y ha sido promovido como campeón de la generación 1 tras mejorar la métrica primaria de -0.4375 a 0.0000, con una tasa de invalidación e intervención nulas.

Este repositorio es relevante para investigadores y desarrolladores que trabajan con SLM-RL o que quieren explorar cómo los modelos de lenguaje pequeños pueden aprender políticas de juego mediante RL. Al ser un adaptador LoRA, no incluye los pesos completos del modelo base, sino solo los deltas de pesos, lo que facilita su integración y experimentación. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre LiquidAI/LFM2.5-1.2B-Instruct |
| Parametros totales | No disponible (el adaptador LoRA no especifica su numero de parametros; el modelo base tiene 1.2B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el ejemplo de carga usa bfloat16, pero no se especifican cuantizaciones oficiales) |
| Idiomas soportados | No disponibles (el adaptador se centra en acciones de juego, no en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT en subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo `LiquidAI/LFM2.5-1.2B-Instruct`, un modelo de lenguaje de 1.2B parámetros, aunque no se proporcionan detalles sobre su arquitectura interna (transformer, MoE, etc.) en la información disponible. El adaptador LoRA se entrena con el framework SLM-RL, que implementa un ciclo de auto-mejora: el modelo juega en entornos de texto, cada decisión se recopila en un dataset reutilizable, el modelo se fine-tunea automáticamente sobre su propia experiencia y el modelo mejorado vuelve a jugar.

El entrenamiento específico de este adaptador utiliza la técnica `reject_sft` (rejection sampling + supervised fine-tuning) sobre demostraciones de un agente profesor DQN para el juego Boxing. Las métricas de entrenamiento registradas incluyen una pérdida de -0.0172, una recompensa media de 0.164, una entropía de 2.395 y un KL de 0.274. El adaptador fue promovido como campeón de la generación 1, con una mejora en la métrica primaria de -0.4375 a 0.0000, y tasas de invalidación e intervención de 0.0.

## Capacidades

- Generacion de acciones de juego: el adaptador genera respuestas en formato `ACTION: <id>` para el juego Boxing, dado un prompt con las acciones legales.
- Aprendizaje por refuerzo: integrado con el pipeline de SLM-RL, permite evolucionar el modelo a traves de generaciones.
- Warm-start: proporciona una politica inicial entrenada que puede servir como punto de partida para futuras iteraciones de RL.
- No incluye capacidades generales de chat, tool calling, agentes, vision o audio; estas dependen del modelo base.
- Soporte multilingue: no disponible, ya que el adaptador se centra en acciones de juego en ingles.

## Casos de uso

- Investigacion en RL para LLMs: el adaptador sirve como ejemplo de como un modelo de lenguaje pequeno puede aprender a jugar a un juego de Atari mediante RL, util para estudiar la interaccion entre lenguaje y toma de decisiones.
- Experimentacion con SLM-RL: los desarrolladores pueden usar este adaptador como punto de partida para evolucionar el modelo en el juego Boxing, ejecutando `slm-rl evolve --game boxing` con este adaptador y su dataset asociado.
- Warm-start de politicas de juego: en lugar de entrenar desde cero, este adaptador proporciona una politica inicial que reduce el tiempo de convergencia en nuevas generaciones.
- Benchmarking de metodos de RL: permite comparar la eficacia de `reject_sft` frente a otros metodos de entrenamiento dentro del framework SLM-RL.
- Educacion y demostraciones: util para ensenar conceptos de RL y fine-tuning de LLMs en entornos de juego, con un ejemplo reproducible en Google Colab.
- Desarrollo de agentes de juego en texto: aunque limitado a Boxing, demuestra el patron para crear adaptadores similares para otros juegos de Atari.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Sin embargo, la model card incluye metricas de entrenamiento y evaluacion del adaptador:

| Metrica | Valor |
|---|---|
| Reward (train) | 0.164 |
| Loss (train) | -0.0172 |
| Entropy (train) | 2.395 |
| KL (train) | 0.274 |
| Primary (eval) | 0.0 |
| Invalid rate (eval) | 0.0 |
| Intervention rate (eval) | 0.0 |
| Win rate (eval) | 0.0 |
| Episodios (eval) | 8 |

Estas metricas indican que el adaptador produce acciones validas sin intervenciones, aunque la tasa de victorias es nula en la evaluacion registrada.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 1.2B, la inferencia en bfloat16 requiere aproximadamente 2.5-3 GB de VRAM para el modelo base mas el adaptador. Cabe en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, aunque se recomienda 8 GB para margen. En CPU es posible pero con latencia alta.
- Opciones de despliegue: el ejemplo de carga usa `transformers` + `peft` con `torch`. Tambien se puede usar con `vLLM` o `llama.cpp` si se convierte el adaptador, aunque no se proporcionan instrucciones especificas.
- Latencia y throughput: no disponibles; dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables para el mismo juego o framework en la informacion proporcionada. El unico repositorio similar encontrado es `Chellappan/slm-rl-colab`, pero no se detallan sus caracteristicas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Especificidad: el adaptador esta entrenado exclusivamente para el juego Boxing; no es util para otras tareas de lenguaje o juegos.
- Dependencia del modelo base: su rendimiento depende de las capacidades de `LiquidAI/LFM2.5-1.2B-Instruct`; si el base cambia, el adaptador puede dejar de funcionar.
- Sesgos y alucinaciones: al ser un adaptador de juego, no se evaluan sesgos de lenguaje; el modelo base puede presentar sesgos tipicos de LLMs.
- Riesgo de sobreajuste: entrenado con solo 16 prompts y 8 episodios de evaluacion, puede no generalizar bien a variaciones del entorno.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` puede tener su propia licencia; se debe verificar.
- Produccion: no recomendado para uso en produccion fuera del contexto de investigacion con SLM-RL.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SudharsanEzhumalai/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/SudharsanEzhumalai/slm-rl-colab-data
- Framework SLM-RL (GitHub): https://github.com/CraftsMan-Labs/SLM-RL
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
