# sumitk/diffusion-conveyer-llm

## Resumen

Conveyor-Belt Diffusion LLM es un modelo de lenguaje experimental de aproximadamente 30 millones de parámetros desarrollado por el usuario sumitk. Se trata de un híbrido entre un transformer autoregresivo causal y un mecanismo de "cinta transportadora" (conveyer) de difusión por desplazamiento (rolling diffusion), inspirado en trabajos como Rolling Diffusion, FIFO-Diffusion y Diffusion Forcing. El modelo no pretende superar a los transformers autoregresivos estándar, sino servir como banco de pruebas interactivo para estudiar cómo se comporta un LLM pequeño cuando la planificación de tokens futuros se divide en dos zonas diferenciadas sobre una cinta que avanza.

La innovación principal reside en separar la predicción del siguiente token en dos componentes: una cinta de 91 ranuras que solo contiene palabras de contenido (sustantivos, verbos léxicos, adjetivos, nombres de personajes), y una zona final de 5 ranuras con vocabulario completo que inserta las palabras funcionales (artículos, preposiciones, auxiliares y puntuación) justo antes de que cada token emerja. Adicionalmente, incorpora un mecanismo de apilamiento de marcos (frame stacking) heredado del proyecto duplex-simmt-en-de, que fusiona las ranuras activas de la cinta con el prefijo causal.

El modelo se entrenó desde cero durante 24 horas en una única GPU RTX 5070 Ti de portátil sobre 2 millones de historias reales del dataset TinyStories, con una longitud de secuencia de 256 tokens y un vocabulario compacto de 4.096 tokens mediante tiktoken. Es relevante como experimento de investigación sobre alternativas a la generación token a token, aunque su escala y dominio de entrenamiento lo limitan a fines exploratorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer autoregresivo causal + cinta de difusión por desplazamiento (rolling diffusion) con apilamiento de marcos duplex |
| Parametros totales | 30,47 M (Run B, checkpoint `best.pt`); 28,88 M en la variante Run A de 64 ranuras |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`, sin versiones GGUF ni cuantizadas publicadas) |
| Idiomas soportados | inglés (entrenado exclusivamente en TinyStories en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

La arquitectura combina un tronco transformer causal con un mecanismo de cinta transportadora de 96 ranuras. En cada paso t, la entrada está formada por el prefijo KV causal apilado en modo duplex, cinco ranuras finales (slots 0 a 4) con acceso al vocabulario completo de 4.096 tokens para insertar palabras funcionales y puntuación, y 91 ranuras de contenido (slots 5 a 95) restringidas a las 3.611 palabras de contenido del vocabulario. La salida es el token expulsado de la ranura 0 más la cinta desplazada y refinada. La cinta avanza a una velocidad de desplazamiento de aproximadamente el 45 % por paso, ratio que refleja la proporción de aproximadamente 1,9 tokens totales por palabra de contenido. El apilamiento duplex proyecta cada token confirmado del prefijo junto con K=4 ranuras de contenido mediante `duplex_slot_proj`, y la cabeza activa de la cinta (slots 5 a 8) se fusiona directamente en la ranura 0 mediante `conveyer_to_frame`.

El entrenamiento se realizó desde cero sobre 2.000.000 de historias reales de TinyStories, con `seq_len = 256` y vocabulario BPE compacto de tiktoken de 4.096 tokens. Se compararon dos configuraciones: Run A (cinta elástica de 64 ranuras con vocabulario completo, 28,88 M de parámetros, 122.743 pasos) y Run B (cinta de contenido de 96 ranuras con relleno de palabras funcionales en las últimas 5 ranuras y apilamiento duplex, 30,47 M de parámetros, 106.507 pasos). Se aplicó corrupción de cinta durante el despliegue (`belt_corrupt_prob = 0.20`) para que el modelo aprendiera a auto-reparar la cinta ante perturbaciones. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto narrativo sencillo en inglés, orientado a historias infantiles al estilo TinyStories.
- Planificación de contenido a futuro mediante la cinta de 91 ranuras de palabras de contenido, con auto-reparación ante perturbaciones en la cinta.
- Inyección controlada de conceptos: al introducir persistentemente una palabra de contenido como "dragon" en las ranuras 5 a 8, el modelo integra ese concepto en la narración generada.
- Relleno gramatical automático de palabras funcionales y puntuación en las últimas 5 ranuras antes de la emisión del token.
- Evaluación de sentido común zero-shot mediante pares de StoryCloze (seguimiento físico, emocional y de entidades).
- Generación de texto abierto con baja repetición de 4-gramas (0,25 % sobre seis prompts novedosos).
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo de pensamiento explícito.

## Casos de uso

- Investigación sobre alternativas a la generación autoregresiva: el modelo sirve como banco de pruebas para estudiar la planificación de tokens futuros mediante cintas de difusión, comparando el comportamiento de la cinta de contenido con el de una cinta de vocabulario completo (Run A frente a Run B).
- Estudio de auto-reparación de representaciones internas: gracias al entrenamiento con `belt_corrupt_prob = 0.20`, permite analizar cómo un modelo pequeño recupera coherencia cuando se perturban las ranuras de contenido durante la generación.
- Experimentos de control de contenido narrativo: la inyección persistente de palabras en las ranuras 5 a 8 permite estudiar cómo un concepto impuesto condiciona la historia generada, útil en investigación sobre steerability en modelos pequeños.
- Docencia y divulgación sobre diffusion language models: al ser un modelo de 30 M de parámetros con demo interactivo en Hugging Face Spaces, es adecuado para explicar mecanismos de rolling diffusion y frame stacking sin requerir hardware especializado.
- Evaluación de sentido común en modelos pequeños: los pares StoryCloze permiten medir el seguimiento de entidades y estados físicos y emocionales en narraciones cortas, como referencia para investigaciones sobre razonamiento narrativo.
- Generación de cuentos sintéticos para aumento de datos: el modelo puede producir historias cortas en inglés con vocabulario controlado (3.611 palabras de contenido) y baja repetición, aprovechables como datos sintéticos en experimentos con TinyStories.
- Análisis de diversidad léxica: con Distinct-2 del 89,4 % y Distinct-3 del 98,5 %, es útil para estudiar métricas de diversidad en generación abierta de modelos de muy baja escala.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 10.000 historias reales no vistas de TinyStories (Run B con `best.pt` frente a Run A):

| Métrica | Run B: cinta de contenido 96 ranuras + duplex | Run A: cinta de vocabulario completo 64 ranuras |
|---|---|---|
| Perplejidad en ranura 0 (validación real) | 5,12 (5,27 en evaluación completa) | 4,21 |
| Precisión top-1 en ranura 0 (validación real) | 61,10 % (68,75 % en bucle cerrado en posición 0) | 64,39 % |
| Perplejidad / precisión del tronco de prefijo causal duplex | 4,56 / 61,53 % | 3,49 / 66,78 % |
| StoryCloze zero-shot (sentido común) | 93,75 % (15/16); 87,50 % en ranura 0 | 100,0 % (16/16) |
| Sensibilidad al orden de palabras (KL) | 4,045 nats | 3,674 nats |
| Diversidad léxica en generación abierta | Distinct-2: 89,4 %; Distinct-3: 98,5 % | Distinct-2: 86,2 % |

Observaciones adicionales del autor: el calentamiento de la cinta (`W_pre=16` sobre 96 ranuras) eleva la precisión del primer token en bucle cerrado del 34,38 % (con K=16, W=0) al 68,75 % (con K=96, W=16). La tasa de repetición de 4-gramas en generación abierta es del 0,25 % sobre seis prompts novedosos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado que el checkpoint pesa aproximadamente 0,3 GB (30,47 M de parámetros en fp32).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; el autor entrenó en una RTX 5070 Ti de portátil.
- Cabe holgadamente en GPU consumer, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: el repositorio incluye un Hugging Face Space con SDK Docker en el puerto 7860; los pesos están en formato PyTorch (`best.pt`), por lo que la inferencia requiere cargar el checkpoint con el código del proyecto. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Conveyor-Belt Diffusion LLM (sumitk) | 30,47 M | 256 tokens | Híbrido autoregresivo + rolling diffusion con cinta de contenido | MIT | Pesos en Hugging Face (`best.pt`) y demo en Space |
| Run A del mismo autor (cinta de vocabulario completo) | 28,88 M | 256 tokens | Rolling diffusion con cinta elástica de vocabulario completo | MIT | Referenciado en la model card, no publicado como checkpoint independiente |
| TinyStories baselines | no disponible | no disponible | Transformers autoregresivos pequeños entrenados en TinyStories | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor indica que no pretende superar a los transformers autoregresivos estándar; su valor es exploratorio.
- Dominio muy restringido: entrenado exclusivamente en TinyStories, por lo que su vocabulario efectivo se limita a 4.096 tokens y 3.611 palabras de contenido; no es adecuado para texto general.
- Longitud de contexto muy corta (256 tokens), insuficiente para la mayoría de aplicaciones prácticas.
- Solo inglés; no se declaran otros idiomas soportados.
- Riesgo de alucinación y de incoherencia narrativa fuera del dominio de historias infantiles; el rendimiento cae en perplejidad y precisión frente a la variante Run A (5,12 frente a 4,21 en perplejidad de ranura 0).
- Sensibilidad al orden de palabras superior a Run A (KL de 4,045 nats frente a 3,674), lo que sugiere mayor dependencia del orden exacto del contexto.
- La inyección de conceptos en la cinta no es fiable de forma aislada: una sola palabra fuera de contexto suele ser "curada" por las ranuras circundantes; solo la inyección persistente en las ranuras 5 a 8 produce efecto.
- Sin soporte publicado de tool calling, agentes, visión ni audio.
- Formatos de pesos limitados a PyTorch; no hay versiones GGUF ni cuantizadas, lo que dificulta el despliegue en herramientas estándar de inferencia.
- Licencia MIT: permite uso comercial, pero la escala y el dominio del modelo hacen inviable su uso en producción real.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sumitk/diffusion-conveyer-llm
- Demo interactivo (Hugging Face Space): https://huggingface.co/spaces/sumitk/diffusion-conveyer-llm
- Proyecto duplex-simmt-en-de (referencia del apilamiento duplex): https://github.com/sumit-1/duplex-simmt-en-de
