# varadsrivastava/lm-playschool-qwen3.5-2b-sft-dpo

## Resumen

`varadsrivastava/lm-playschool-qwen3.5-2b-sft-dpo` es un modelo de lenguaje de 1.880 millones de parámetros, desarrollado por el equipo DAIR como parte del desafío LM Playschool 2026. Se trata de un ajuste fino del modelo base `Qwen/Qwen3.5-2B` mediante dos fases sucesivas: primero una imitación supervisada (SFT) y después un refinamiento por preferencias (DPO) sobre pares de jugadas en juegos de diálogo. El objetivo es mejorar la competencia conversacional del modelo en entornos de juegos de lenguaje, donde debe elegir el primer movimiento de una partida de forma exitosa.

La relevancia de este checkpoint radica en que fue la propuesta oficial del equipo para el desafío, alcanzando una puntuación clemscore de 67.39 en la validación, frente a 13.63 del modelo base sin ajustar. Además, supera al modelo de referencia Qwen3.5-27B en la misma tarea, demostrando que un modelo pequeño puede competir con modelos mucho mayores cuando se entrena con datos de preferencias bien construidos.

El modelo está publicado bajo licencia Apache 2.0, con pesos en formato safetensors y orientado exclusivamente a generación de texto en inglés. Es un trabajo de investigación que documenta un barrido sistemático de cinco regímenes de post-entrenamiento, y este checkpoint en particular corresponde al régimen R2 (contraste de resultados mediante DPO).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `Qwen/Qwen3.5-2B`, un transformer decoder-only de 2.000 millones de parámetros diseñado para generación de texto. No se han publicado detalles adicionales sobre la arquitectura interna del modelo base en la información disponible, por lo que se asume que mantiene la estructura estándar de Qwen (atención por ventanas, capas de normalización, etc.).

El entrenamiento se realizó en dos etapas. La primera (régimen R1) consistió en una imitación supervisada (SFT) sobre datos de juegos de diálogo. La segunda (régimen R2, este checkpoint) aplicó DPO (Direct Preference Optimization) sobre el modelo R1 congelado como referencia, utilizando 3.418 pares de preferencias de primer movimiento. Los pares se construyeron a partir de datos de "playpen": para cada combinación fija de juego, experimento, tarea e identidad, la jugada elegida (`chosen`) era el primer movimiento de un episodio exitoso, mientras que la rechazada (`rejected`) era el primer movimiento de un episodio abortado o perdido. Los juegos propensos a aborto se sobremuestrearon 4 veces.

Los hiperparámetros del DPO fueron: un epoch, LoRA con r=16 y alpha=32, tasa de aprendizaje 5e-6 y beta=0.1. El resultado fue una mejora significativa en la calidad de las jugadas (clemscore de 55.61 a 67.39) sin cambios en el porcentaje de jugadas completadas, lo que indica que el DPO refinó la selección de movimientos en lugar de la fluidez conversacional.

## Capacidades

- Generacion de texto conversacional en ingles, especializado en juegos de dialogo (dialogue games).
- Seleccion de primer movimiento en partidas de juegos de lenguaje, optimizada para maximizar el exito del episodio.
- Razonamiento conversacional basico: el modelo entiende el contexto del juego y elige una accion inicial coherente con el escenario.
- No soporta tool calling, function calling, vision, audio ni modo de pensamiento explicito.
- No se han documentado capacidades multilingues; el entrenamiento y la evaluacion se limitan al ingles.
- Es un modelo de proposito especifico, no un asistente generalista.

## Casos de uso

- Investigacion en post-entrenamiento de modelos pequenos: este checkpoint es un punto de referencia para estudiar el efecto del DPO frente a otros regimenes (SFT, GRPO, etc.) dentro del mismo entorno de evaluacion.
- Simulacion de agentes conversacionales en juegos de rol o juegos de mesa por turnos: el modelo puede actuar como un jugador que decide su primera accion en funcion del estado del juego.
- Generacion de datos sinteticos de preferencias: los pares `chosen`/`rejected` utilizados para el entrenamiento pueden reutilizarse para entrenar otros modelos o para analisis de comportamiento.
- Prototipos de chatbots con recursos limitados: al ser un modelo de 1,88 B, puede desplegarse en hardware modesto para experimentos de conversacion en ingles.
- Evaluacion de entornos de dialogo (clembench/playpen): el modelo sirve como agente de prueba para validar metricas como clemscore o statscore en entornos de juegos de lenguaje.
- Educacion y divulgacion: como ejemplo de aplicacion de DPO sobre un modelo base pequeno, es util para demostrar tecnicas de alineacion por preferencias en cursos o talleres.

## Benchmarks y rendimiento

La model card reporta resultados en la validacion del entorno playpen (clembench), con metricas clemscore y statscore. La tabla siguiente resume los resultados de los distintos regimenes del desafio:

| Regimen | Repositorio | clemscore | statscore |
|---|---|---|---|
| R1 imitacion (SFT) | `lm-playschool-qwen3.5-2b-sft` | 55.61 | 43.87 |
| R2 contraste de resultados (DPO) | `lm-playschool-qwen3.5-2b-sft-dpo` | 67.39 | 44.72 |
| R3 auto-imitacion (SFT) | `lm-playschool-qwen3.5-2b-iter3` | 61.06 | 44.01 |
| R4 feedback correctivo (DPO) | `lm-playschool-qwen3.5-2b-iter4` | 67.64 | 44.31 |
| R5 GRPO (control) | `lm-playschool-qwen3.5-2b-grpo-base-s42` | 62.43 | 44.19 |
| R5 GRPO + RND | `lm-playschool-qwen3.5-2b-grpo-rnd-s42` | 67.44 | 43.53 |

El modelo base sin ajustar (Qwen3.5-2B) obtuvo 13.63 en clemscore y 44.22 en statscore en el mismo entorno. Segun la model card, este checkpoint supera al modelo de referencia Qwen3.5-27B en la tabla del organizador, aunque no se proporciona el valor exacto de ese modelo. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,8 GB en FP16 (1,88 B parametros x 2 bytes). Con cuantizacion int8 se reduce a ~1,9 GB y con int4 a ~1 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores son suficientes. En cuantizacion int4 podria ejecutarse en GPUs de 2 GB.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, TGI o directamente con la libreria transformers. Tambien puede convertirse a formato GGUF para su uso con llama.cpp u Ollama, aunque no se proporcionan archivos preconvertidos.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 2 B, se espera una latencia de decenas de milisegundos por token en GPUs modernas y un throughput de varios cientos de tokens por segundo con vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | clemscore (playpen) | Licencia |
|---|---|---|---|---|
| Qwen3.5-2B (base) | 2 B | no disponible | 13.63 | Apache 2.0 |
| `lm-playschool-qwen3.5-2b-sft-dpo` (este) | 1,88 B | no disponible | 67.39 | Apache 2.0 |
| Qwen3.5-27B (referencia) | 27 B | no disponible | superado por este modelo (sin valor exacto) | Apache 2.0 |

La comparativa se limita a los modelos mencionados en la documentacion. No se dispone de datos de otros modelos de tamano similar (p. ej. Llama-3.2-1B, Qwen2.5-1.5B) en el mismo entorno de evaluacion, por lo que no es posible una comparacion directa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta especializado en juegos de dialogo y puede no comportarse adecuadamente en tareas generales de conversacion o generacion de texto libre.
- Idioma unico: solo se ha entrenado y evaluado en ingles. No se garantiza ningun nivel de competencia en otros idiomas.
- Sobreajuste al entorno de evaluacion: las metricas se obtuvieron en un entorno fijo (Python 3.11, clembench con dependencias fijadas). Cambios en el entorno pueden alterar los resultados, como se advierte en la propia model card.
- Sesgos y alucinaciones: no se ha realizado ninguna evaluacion de sesgos ni de tendencia a alucinar. Dado su tamano reducido, es probable que presente alucinaciones frecuentes en contextos no cubiertos por sus datos de entrenamiento.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo es un artefacto de investigacion y no se ha validado para entornos de produccion.
- Dependencia del modelo base: cualquier limitacion del Qwen3.5-2B (por ejemplo, longitud de contexto, capacidades de razonamiento) se hereda en este ajuste fino.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/varadsrivastava/lm-playschool-qwen3.5-2b-sft-dpo
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper asociado: *Raising a Small Language Model: From Imitation to Curiosity in Dialogue Games* (LM Playschool Challenge 2026) — sin enlace disponible en la model card.
