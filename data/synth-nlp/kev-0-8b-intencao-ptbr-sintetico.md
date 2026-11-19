# Synth-NLP/kev-0.8b-intencao-ptbr-sintetico

## Resumen

Kev-0.8B + sintéticos pt-BR es un modelo de clasificación de intenciones para portugués de Brasil, desarrollado por Synth-NLP. Recibe una frase en portugués y una lista de opciones, y devuelve cuál de esas opciones corresponde a la intención del usuario (por ejemplo, "vai chover amanhã?" → `consultar clima`). No es un modelo generativo al uso: es un ajuste delta sobre el modelo base jaredpalmer/kev-0.8b, servido mediante el código de Kev y la API System One, con una cabeza de puntero (pointer head) que selecciona una opción de la lista proporcionada.

El modelo forma parte de un experimento controlado que mide si los datos sintéticos en portugués mejoran la clasificación de intenciones, especialmente en intenciones nunca vistas durante el entrenamiento. El ajuste combina los 5.405 ejemplos reales del dataset MASSIVE pt-BR con 20.383 frases sintéticas generadas por una pipeline agéntica, sumando un total de 25.788 líneas de entrenamiento que cubren 30 intenciones vistas y 30 intenciones nuevas.

Su relevancia actual radica en dos puntos: por un lado, demuestra un incremento medible de +3,6 puntos en precisión sobre intenciones no vistas respecto al ajuste solo con datos reales; por otro, ofrece una alternativa de 0,8B parámetros con licencia Apache 2.0 que se acerca al rendimiento de una API propietaria de referencia (Jev) en el escenario de intenciones vistas (0,917 frente a 0,864), a costa de quedar por debajo en el escenario de intenciones no vistas (0,815 frente a 0,863).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ajustado con LoRA + pointer head (delta sobre jaredpalmer/kev-0.8b) |
| Parámetros totales | 0,8B (modelo base; el delta LoRA añade un número no especificado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | portugués de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste delta sobre jaredpalmer/kev-0.8b, un transformer de 0,8B parámetros. El ajuste combina LoRA con una pointer head que permite seleccionar una de las opciones de la lista de intenciones proporcionada en la entrada, en lugar de generar texto libre. El entrenamiento se realizó con `python -m kev.train --init_from `, con learning rate 2e-5, 2 épocas, batch size 8, precisión bf16, base congelada, aumentos de Kev desactivados y semilla 0.

Los datos de entrenamiento son 25.788 líneas: 5.405 ejemplos reales de 30 intenciones del dataset MASSIVE pt-BR y 20.383 frases sintéticas, de las cuales una parte corresponde a esas mismas 30 intenciones y otra a 30 intenciones nuevas. La pipeline de generación sintética parte únicamente de la lista de intenciones (nombre y descripción) y ejecuta cinco etapas: planificación de peticiones variadas con personas, situaciones cotidianas, estilos de escritura de usuarios reales (oasst1) y peticiones contrastivas contra la intención vecina más parecida; generación con Gemma 4 12B y Qwen3.5-9B, con reescritura Evol-Instruct de parte de las frases para aumentar la dificultad; filtrado de duplicados y de frases demasiado similares a los datos de test mediante Qwen3-Embedding-0.6B; juicio con dos LLM jueces que deben coincidir en la intención, más una nota de naturalidad; y selección de las frases difíciles para el modelo, usando sus errores para pedir la siguiente ronda (LLM2LLM).

## Capacidades

- Clasificación de intenciones en pt-BR: dada una frase y una lista de opciones, selecciona la intención correcta.
- Selección entre un conjunto arbitrario de opciones por frase (la evaluación usa 20 opciones por frase, con azar en 0,050).
- Generalización a intenciones no vistas en entrenamiento: 0,815 de precisión en escenarios completos reservados (ninguna frase, intención ni dominio de esos escenarios entró en el entrenamiento ni en la generación sintética).
- Manejo de peticiones contrastivas: el entrenamiento incluye ejemplos diseñados contra la intención vecina más parecida, lo que ayuda a discriminar entre intenciones similares.
- Robustez a variación de estilo: los sintéticos cubren personas, situaciones cotidianas y estilos de escritura de usuarios reales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador de elección entre opciones, no un modelo generativo de propósito general.
- Capacidad multilingüe limitada al portugués de Brasil; no se documenta soporte de otros idiomas.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo recibe el mensaje del usuario y la lista de intenciones del bot (consultar clima, cambiar plan, cancelar pedido, etc.) y devuelve la intención seleccionada, lo que permite dirigir la conversación al flujo adecuado sin un LLM generativo grande.
- Clasificación de tickets de soporte: con una lista de categorías definida por el equipo, el modelo asigna cada ticket entrante a una categoría, incluyendo categorías nuevas que no aparecían en el conjunto de entrenamiento original, gracias al ajuste con sintéticos de intenciones no vistas.
- Detección de intención en asistentes de voz o chat para pt-BR: al ser un modelo de 0,8B, puede desplegarse en infraestructura modesta y resolver la fase de enrutamiento antes de invocar un modelo mayor para la respuesta.
- Filtrado y priorización de mensajes: clasificar mensajes entrantes en categorías operativas (reclamación, consulta, incidencia técnica) para asignar colas o prioridades en un sistema de gestión.
- Evaluación de pipelines de datos sintéticos: el modelo sirve como referencia reproducible para medir el impacto de añadir sintéticos en un clasificador de intenciones, con predicciones por frase publicadas en `results/`.
- Prototipado rápido de clasificadores de intención en dominios nuevos: dado que la pipeline de generación parte solo de la lista de intenciones, el mismo enfoque y el modelo ajustado permiten arrancar un clasificador para un dominio con pocos datos reales.
- Investigación sobre generalización a clases no vistas: el modelo y su conjunto de evaluación permiten reproducir el experimento de intenciones reservadas y comparar con Jev, Kev-4B y Laya.

## Benchmarks y rendimiento

Precisión en la validación del MASSIVE pt-BR con 20 opciones por frase (azar = 0,050). Los escenarios "no vistas" son escenarios completos reservados: ninguna frase, intención ni dominio de ellos entró en el entrenamiento ni en la generación de sintéticos.

| Modelo | Base | No vistas | Vistas |
|---|---|---:|---:|
| Jev (API de TypeSafe, referencia) | — | 0,863 | 0,864 |
| Kev-4B + sintéticos pt-BR | kev-4b | 0,867 | 0,933 |
| **Kev-0.8B + sintéticos pt-BR** (este) | kev-0.8b | **0,815** | **0,917** |
| Laya + sintéticos pt-BR | laya | 0,763 | 0,908 |

Ablación sobre el mismo modelo base:

| Configuración | No vistas | Vistas |
|---|---:|---:|
| sin ajuste | 0,728 | 0,672 |
| ajustado solo con los 5.405 ejemplos reales | 0,779 | 0,921 |
| ajustado con reales + sintéticos (este) | 0,815 | 0,917 |

El ganancia del sintético sobre el ajuste solo con reales en las no vistas es de +3,6 puntos [+2,3; +5,0] (intervalo de confianza del 95%, bootstrap pareado por frase). En las vistas, reales y reales + sintéticos empatan. Contra Jev, este modelo queda por debajo en no vistas y por encima en vistas. La evaluación usa la media de 3 sorteos de las opciones; Jev se evaluó por API en un solo sorteo (el 0) con las mismas frases y opciones, y las comparaciones con él usan ese sorteo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 0,8B parámetros, la huella en bf16 sería de aproximadamente 1,6 GB solo para pesos, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño (0,8B) es plausible en GPU de consumo, pero no se aportan datos oficiales.
- Opciones de despliegue: el autor documenta el servidor propio de Kev mediante `uv run --extra serve python -m kev.serve --run Synth-NLP/kev-0.8b-intencao-ptbr-sintetico`, con la API System One (el mismo protocolo que Jev). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | No vistas | Vistas | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Kev-0.8B + sintéticos pt-BR (este) | kev-0.8b | 0,8B | 0,815 | 0,917 | Apache 2.0 | Hugging Face |
| Kev-4B + sintéticos pt-BR | kev-4b | 4B | 0,867 | 0,933 | no disponible | Hugging Face |
| Laya + sintéticos pt-BR | laya | no disponible | 0,763 | 0,908 | no disponible | Hugging Face |
| Jev (API de TypeSafe) | — | no disponible | 0,863 | 0,864 | propietaria (API) | API |

Contexto y tipos de cuantización de las alternativas: no disponibles en la información proporcionada.

## Limitaciones y advertencias

- Una sola semilla de entrenamiento en los modelos Kev: los resultados pueden variar con otra semilla y no se reporta varianza entre semillas.
- Una única tarea (elección de intención) y un único conjunto de datos (MASSIVE pt-BR): no hay evidencia de rendimiento en otras tareas de clasificación.
- El pt-BR del MASSIVE es una localización hecha por LLM a partir del pt-PT, lo que puede introducir artefactos de traducción en los datos reales.
- El modelo no supera a Jev en intenciones no vistas (0,815 frente a 0,863); para escenarios con muchas intenciones nuevas conviene evaluar alternativas de mayor tamaño como Kev-4B (0,867).
- La comparación con Jev se hizo en un solo sorteo de opciones (el 0), mientras que el modelo se evaluó con la media de 3 sorteos; la comparación no es perfectamente simétrica.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de seleccionar una opción incorrecta cuando la frase es ambigua o cuando la intención real no está en la lista de opciones.
- Sesgos: no se documentan análisis de sesgo; los sintéticos se generaron con Gemma 4 12B y Qwen3.5-9B, por lo que pueden heredar sesgos de esos modelos.
- Licencia Apache 2.0 permite uso comercial, pero los pesos derivan de jaredpalmer/kev-0.8b y las frases reales del MASSIVE son © Amazon.com, Inc. o afiliadas bajo CC BY 4.0, lo que exige atribución.
- El despliegue está ligado al código de Kev y a la API System One; no se documentan exportaciones a formatos estándar como GGUF.
- El modelo solo soporta pt-BR; no debe usarse con otros idiomas sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/kev-0.8b-intencao-ptbr-sintetico
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- Repositorio de código Kev: https://github.com/jaredpalmer/kev
- Dataset de entrenamiento: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Modelo Kev-4B + sintéticos pt-BR: https://huggingface.co/Synth-NLP/kev-4b-intencao-ptbr-sintetico
- Modelo Laya + sintéticos pt-BR: https://huggingface.co/Synth-NLP/laya-intencao-ptbr-sintetico
- Paper del dataset MASSIVE: https://arxiv.org/abs/2204.08582
- Gemma 4 12B (generador de sintéticos): https://huggingface.co/google/gemma-4-12B-it
- Qwen3.5-9B (generador de sintéticos): https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen3-Embedding-0.6B (filtrado de sintéticos): https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
