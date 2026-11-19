# Synth-NLP/kev-4b-intencao-ptbr-sintetico

## Resumen

Kev-4B + sintéticos pt-BR es un modelo de clasificación de intenciones en portugués de Brasil, publicado por el colectivo Synth-NLP. Se trata de un ajuste fino (delta) del modelo base `jaredpalmer/kev-4b`, un transformer de 4.000 millones de parámetros, especializado en una tarea concreta: recibir una frase en portugués y una lista de opciones de intención, y seleccionar la que corresponde al usuario (por ejemplo, "vai chover amanhã?" → `consultar clima`).

El modelo forma parte de un experimento de investigación que mide si los datos sintéticos en portugués mejoran los clasificadores de intención, especialmente en intenciones nunca vistas durante el entrenamiento. Combina los 5.405 ejemplos reales del corpus MASSIVE pt-BR con 20.383 frases sintéticas generadas mediante una pipeline agéntica con modelos abiertos (Gemma 4 12B y Qwen3.5-9B), lo que da un conjunto de entrenamiento de 25.788 líneas repartidas en 60 intenciones (30 reales y 30 nuevas).

Su relevancia actual reside en dos aspectos: por un lado, demuestra que el aumento con datos sintéticos aporta una mejora medible de +2,0 puntos en intenciones no vistas respecto al ajuste solo con datos reales; por otro, ofrece una alternativa open source (Apache 2.0) a clasificadores de intención propietarios como el Jev, con un rendimiento comparable en escenarios no vistos y superior en los vistos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `jaredpalmer/kev-4b`) con ajuste delta LoRA + pointer head para selección de opciones |
| Parametros totales | 4.000 millones (modelo base); el delta LoRA es una fracción del total |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | pt (portugués de Brasil) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 0,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de `jaredpalmer/kev-4b`, un transformer de 4.000 millones de parámetros, y se ajusta mediante un delta LoRA junto con una pointer head que permite seleccionar una opción de una lista dada en lugar de generar texto libre. El entrenamiento congela la base y entrena únicamente el delta, con los siguientes hiperparámetros: learning rate 2e-5, 2 épocas, batch size 8, precisión bf16, seed 0 y los aumentos del Kev desactivados. El comando de entrenamiento es `python -m kev.train --init_from `.

Los datos de entrenamiento combinan los 5.405 ejemplos reales de 30 intenciones del corpus MASSIVE pt-BR con 20.383 frases sintéticas, de las cuales una parte cubre esas mismas 30 intenciones y otra parte cubre 30 intenciones nuevas. La pipeline de generación sintética sigue cinco etapas: planificación de peticiones variadas por intención (con personas, situaciones cotidianas, estilos de escritura de usuarios reales de oasst1 y peticiones contrastivas contra la intención vecina más parecida); generación con Gemma 4 12B y Qwen3.5-9B, incluyendo reescritura Evol-Instruct para endurecer parte de las frases; filtrado de duplicados y de frases demasiado similares a los datos de test mediante Qwen3-Embedding-0.6B; juicio con dos LLM que deben coincidir en la intención y en una nota de naturalidad; y selección de las frases difíciles para el modelo, usando sus errores para pedir la siguiente ronda (LLM2LLM).

## Capacidades

- Clasificación de intenciones en portugués de Brasil: dada una frase y una lista de opciones, elige la intención correcta.
- Selección entre opciones (pointer head): no genera texto libre, sino que apunta a una de las opciones proporcionadas.
- Generalización a intenciones no vistas durante el entrenamiento: el modelo fue evaluado en escenarios completos reservados (ninguna frase, intención ni dominio de esos escenarios entró en el entrenamiento ni en la generación sintética).
- Manejo de estilos de escritura variados: los datos sintéticos incluyen personas y estilos de usuarios reales.
- Robustez ante frases difíciles: parte del corpus sintético se reescribió con Evol-Instruct para aumentar la dificultad.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Enrutamiento de consultas en asistentes conversacionales: el modelo recibe el mensaje del usuario y la lista de intenciones disponibles del sistema (por ejemplo, `consultar clima`, `agendar cita`, `consultar saldo`) y devuelve la intención seleccionada, lo que permite derivar la conversación al flujo adecuado.
- Clasificación de tickets de soporte: en una mesa de ayuda en portugués, el modelo asigna cada ticket a una categoría de intención predefinida, reduciendo el trabajo manual de triaje.
- Atención al cliente automatizada en portugués de Brasil: integrado en un chatbot, permite identificar la intención del usuario en cada turno y activar la respuesta o el agente correspondiente.
- Clasificación de correos y mensajes entrantes: el modelo selecciona entre las categorías definidas por la organización (consulta, reclamación, cancelación, información) para enrutar el mensaje al equipo correcto.
- Investigación sobre datos sintéticos: sirve como referencia reproducible para estudiar el impacto del aumento con datos sintéticos en clasificadores de intención, con conjuntos de entrenamiento y evaluación publicados.
- Prototipado rápido de clasificadores de intención sin datos propios: al estar ajustado sobre MASSIVE pt-BR, puede servir de punto de partida para nuevas taxonomías de intenciones en portugués, aunque requeriría un ajuste adicional para dominios específicos.
- Evaluación comparativa de clasificadores: al incluir predicciones por frase en `results/` y un conjunto de evaluación público, permite comparar sistemáticamente otros modelos de intención en portugués.

## Benchmarks y rendimiento

Acurácia en la validación del MASSIVE pt-BR con 20 opciones por frase (el azar equivale a 0,050). Los escenarios "no vistas" son conjuntos completos reservados: ninguna frase, intención ni dominio de ellos entró en el entrenamiento ni en la generación de los sintéticos.

| Modelo | Base | No vistas | Vistas |
|---|---|---:|---:|
| Jev (API de TypeSafe, referencia) | — | 0,863 | 0,864 |
| **Kev-4B + sintéticos pt-BR** (este) | kev-4b | **0,867** | **0,933** |
| Kev-0.8B + sintéticos pt-BR | kev-0.8b | 0,815 | 0,917 |
| Laya + sintéticos pt-BR | laya | 0,763 | 0,908 |

Comparación contra el Jev: el modelo empata en las no vistas (+0,005 [−0,012; +0,021]) y supera en las vistas (+0,069 [+0,050; +0,088]).

Ablación del efecto de los datos sintéticos con el mismo modelo base:

| Configuración | No vistas | Vistas |
|---|---:|---:|
| Sin ajuste | 0,786 | 0,792 |
| Ajustado solo con los 5.405 ejemplos reales | 0,847 | 0,935 |
| **Ajustado con reales + sintéticos (este)** | **0,867** | **0,933** |

El ganancia del sintético sobre el ajuste solo con reales en las no vistas es de +2,0 puntos [+1,0; +3,0] (intervalo de confianza del 95 %, bootstrap pareado por frase). En las vistas, reales y reales + sintéticos empatan.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 0,2 GB (delta LoRA + pointer head), pero la inferencia requiere cargar el modelo base `jaredpalmer/kev-4b` de 4.000 millones de parámetros. En bf16, el base ocupa aproximadamente 8 GB de VRAM; en cuantización de 8 bits, unos 4 GB; en 4 bits, unos 2-3 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de consumo como RTX 3090 o RTX 4090 en bf16, y en GPUs con 8-12 GB en cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 en bf16 y en GPUs de 8-12 GB con cuantización, aunque el autor no lo documenta.
- Opciones de despliegue: el autor indica el servidor propio del proyecto Kev con la API System One: `uv run --extra serve python -m kev.serve --run Synth-NLP/kev-4b-intencao-ptbr-sintetico`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | No vistas | Vistas | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| **Kev-4B + sintéticos pt-BR** | kev-4b | 4.000 M | no disponible | 0,867 | 0,933 | Apache 2.0 | Hugging Face |
| Kev-0.8B + sintéticos pt-BR | kev-0.8b | 800 M | no disponible | 0,815 | 0,917 | Apache 2.0 | Hugging Face |
| Laya + sintéticos pt-BR | laya | no disponible | no disponible | 0,763 | 0,908 | no disponible | Hugging Face |
| Jev (API de TypeSafe) | — | no disponible | no disponible | 0,863 | 0,864 | propietaria | API |

El modelo de 4B es el de mayor precisión del experimento en intenciones no vistas, con una ventaja de 5,2 puntos sobre el de 0,8B y de 10,4 puntos sobre Laya. Frente al Jev propietario, empata en no vistas y supera en vistas.

## Limitaciones y advertencias

- Una sola seed de entrenamiento en los modelos Kev: los resultados pueden variar con otras semillas.
- Una sola tarea (elección de intención) y un solo conjunto de datos: no se ha evaluado en otras tareas de clasificación.
- El pt-BR del corpus MASSIVE es una localización hecha por un LLM a partir del pt-PT, lo que puede introducir artefactos lingüísticos.
- El Jev se evaluó con un único sorteo de opciones (el 0), mientras que este modelo se evaluó con la media de 3 sorteos; las comparaciones con él usan ese sorteo.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto libre), pero sí puede seleccionar una intención incorrecta cuando la frase es ambigua o cae fuera de la taxonomía.
- Sesgos: los datos sintéticos se generan con personas y estilos de oasst1, lo que puede infrarrepresentar registros muy específicos (jerga técnica, dialectos regionales).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los pesos derivan de `jaredpalmer/kev-4b` y las frases reales del MASSIVE están bajo CC BY 4.0 (© Amazon.com, Inc. o afiliadas), lo que exige atribución.
- El modelo está especializado en portugués de Brasil; no se ha validado en pt-PT ni en otros idiomas.
- El despliegue depende del código del proyecto Kev y de la API System One; no se documenta compatibilidad con stacks de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/kev-4b-intencao-ptbr-sintetico
- Modelo base: https://huggingface.co/jaredpalmer/kev-4b
- Modelo hermano de 0,8B: https://huggingface.co/Synth-NLP/kev-0.8b-intencao-ptbr-sintetico
- Modelo hermano Laya: https://huggingface.co/Synth-NLP/laya-intencao-ptbr-sintetico
- Dataset de entrenamiento: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Repositorio del proyecto Kev: https://github.com/jaredpalmer/kev
- Paper del corpus MASSIVE: https://arxiv.org/abs/2204.08582
- Gemma 4 12B (generador de datos sintéticos): https://huggingface.co/google/gemma-4-12B-it
- Qwen3.5-9B (generador de datos sintéticos): https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen3-Embedding-0.6B (filtrado de similitud): https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
