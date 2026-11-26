# StrandsAgents/strands-decider-E2B-gemma4-v2-2611

## Resumen

Strands Decider E2B es un modelo de decisión especializado, desarrollado por el equipo Strands Decider de Strands Labs, que parte del modelo de instrucciones google/gemma-4-E2B-it y se afina para tareas de clasificación y calibración. No genera texto libre: recibe un estado (texto o JSON, opcionalmente con imágenes) y una o varias preguntas tipadas (elección entre 2 y 255 opciones, sí/no o puntuación en una escala de 2 a 10 niveles) y devuelve, en una sola pasada, una probabilidad para cada opción junto con una confianza calibrada.

El modelo resuelve el problema de convertir un LLM generativo en un componente de decisión determinista y medible dentro de sistemas agénticos. Con 5.123.178.051 parámetros totales (2,3B efectivos, 5,1B contando embeddings) y un contexto validado de 32.768 tokens, ampliable hasta 131.072, se posiciona como la variante más pequeña de la familia Strands Decider v2, que incluye también los tamaños E4B, 12B, 26B-A4B y 31B.

Es relevante ahora porque permite ejecutar decisiones calibradas en una única GPU de 24 GB o incluso en CPU, con latencias declaradas de 62 ms por pregunta en una NVIDIA H100 y 92 ms para 30 preguntas sobre un mismo estado. Su licencia Apache-2.0 y su formato de pesos safetensors facilitan la integración en producción sin restricciones comerciales adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de google/gemma-4-E2B-it); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 5.123.178.051 (2,3B efectivos, 5,1B con embeddings) |
| Parametros activos | No aplica (no es MoE en esta variante; la variante 26B-A4B de la familia si es MoE con 128 expertos) |
| Longitud de contexto | 32.768 tokens validados (limite por defecto), hasta 131.072 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun la model card); el resto no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 10,3 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo de instrucciones google/gemma-4-E2B-it, orientado a decisiones en lugar de a generación de texto. La innovación principal no reside en la arquitectura del transformer subyacente, sino en la cabeza de decisión: en una sola pasada, sin generar texto, el modelo produce una probabilidad por cada opción de una pregunta tipada. Las preguntas y opciones se incluyen en la propia petición, de modo que el mismo modelo puede responder a una decisión nueva sin reentrenamiento.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se indica que el modelo está calibrado: declara una brecha media de 3,2 puntos entre confianza y precisión, lo que permite usar la confianza devuelta como señal fiable en pipelines automatizados. Esta versión v2 sucede a strands-decider-E2B-gemma4-v1-2610 sobre la misma base y mejora sus resultados en 27,8 puntos en el Decision Index 0.3.

## Capacidades

- Clasificación mediante elección entre 2 y 255 opciones, con probabilidad por opción.
- Preguntas de sí/no (tipo noul) con probabilidad calibrada.
- Puntuación en escalas ordenadas de 2 a 10 niveles.
- Procesamiento de estados en texto o JSON, con soporte opcional de imágenes como entrada.
- Respuesta a múltiples preguntas sobre un mismo estado en una sola pasada (92 ms para 30 preguntas en H100).
- Confianza calibrada por respuesta (brecha media de 3,2 puntos frente a la precisión).
- Capacidad multilingüe: no disponible; la model card declara únicamente inglés.
- No genera texto libre: su salida son distribuciones de probabilidad sobre opciones.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como estado y responde a preguntas de elección ("¿qué equipo debe gestionarlo?=billing,sales,retail") y de sí/no ("¿transmite urgencia?"), devolviendo probabilidades que permiten enrutar automáticamente con umbrales de confianza.
- Moderación de contenido: clasificación de mensajes en categorías predefinidas y puntuación de gravedad en una escala de niveles, usando la confianza calibrada para derivar los casos dudosos a revisión humana.
- Enrutamiento en pipelines agénticos: dado el estado de una conversación o de una tarea, decidir qué herramienta o agente debe intervenir entre un conjunto de opciones, sustituyendo a un LLM generativo por un componente determinista y de baja latencia.
- Evaluación de riesgo en atención al cliente: puntuación del nivel de frustración o de riesgo de abandono del cliente en una escala ordenada, con 62 ms por pregunta en H100, lo que permite evaluarlo en cada turno de la conversación.
- Procesamiento por lotes en CPU: al caber en CPU (aunque más lento), puede ejecutarse en entornos sin GPU para clasificar grandes volúmenes de documentos o registros con preguntas tipadas fijas.
- Análisis de documentos con imágenes: al aceptar imágenes opcionales junto al estado, puede clasificar capturas, formularios o documentos escaneados respondiendo preguntas de elección o sí/no sobre su contenido.
- Control de calidad en producción: uso de la calibración para monitorizar la fiabilidad del modelo en dominios nuevos, ya que la confianza declarada es comparable con la precisión observada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Benchmark | Resultado |
|---|---|
| Decision Index 0.3 | 57,1 |
| JevBench | 87,4 |
| OpenDecisions | 77,7 |
| DecisionPivot | 23,3 |
| BEV | 74,0 |

Según la model card, la puntuación de 57,1 en el Decision Index 0.3 supone 27,8 puntos por encima de Strands Decider v1 E2B. La brecha media entre confianza y precisión es de 3,2 puntos. En latencia, se declaran 62 ms por pregunta en una NVIDIA H100 y 92 ms para 30 preguntas sobre un mismo estado.

## Requisitos de hardware

- VRAM estimada: 10,3 GB de pesos en bf16; una GPU con 24 GB de memoria es suficiente según la model card.
- GPU recomendadas: una NVIDIA con 24 GB (por ejemplo, RTX 4090 o A10G); las latencias declaradas se midieron en una NVIDIA H100.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más; también puede ejecutarse en CPU (más lento) con `--device cpu` o `device="cpu"`.
- Opciones de despliegue: la librería oficial strands-decider (`pip install strands-decider`), que expone comandos como `strands-decider ask`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 62 ms por pregunta y 92 ms para 30 preguntas sobre un estado en H100.
- Requisitos de software: Python 3.11 o superior y 10,3 GB de disco para los pesos.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Pesos bf16 | Contexto | Licencia | Orientacion |
|---|---|---|---|---|---|---|
| strands-decider-E2B (este) | gemma-4-E2B-it | 2,3B efectivos (5,1B con embeddings) | 10,3 GB | 32.768 (hasta 131.072) | Apache-2.0 | Decisiones; 1 GPU de 24 GB o CPU |
| strands-decider-E4B | gemma-4-E4B-it | 4,5B efectivos (8B con embeddings) | 16 GB | No disponible | Apache-2.0 | Decisiones; 1 GPU de 40 GB |
| strands-decider-12B | gemma-4-12B-it | 11,95B | 24 GB | No disponible | Apache-2.0 | Decisiones; 1 GPU de 48 GB |
| strands-decider-26B-A4B | gemma-4-26B-A4B-it | 25,2B totales, 3,8B activos (128 expertos) | 52 GB | No disponible | Apache-2.0 | Muchas preguntas sobre un estado; 1 GPU de 80 GB |
| strands-decider-31B | gemma-4-31B-it | 30,7B | 63 GB | No disponible | Apache-2.0 | Máxima precisión; 1 GPU de 80 GB |

La model card no incluye comparaciones de rendimiento frente a modelos de clasificación externos a la familia Strands Decider; esos datos no están disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Gemma 4, puede heredar sesgos del modelo base.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto libre), pero la calibración puede degradarse en dominios alejados de los datos de entrenamiento; la brecha media de 3,2 puntos es un promedio, no una garantía por consulta.
- Rendimiento desigual entre benchmarks: DecisionPivot obtiene solo 23,3 frente a 87,4 en JevBench, lo que indica una alta variabilidad según el tipo de decisión.
- Limitación de idioma: la model card declara únicamente inglés; el comportamiento en castellano u otros idiomas no está documentado.
- Límites estructurales: solo admite los tres tipos de pregunta definidos (elección, sí/no, puntuación) y escalas de 2 a 10 niveles; no es un modelo generativo ni un chatbot.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base google/gemma-4-E2B-it, que no se detallan en la información disponible.
- Benchmarks no verificados: todos los resultados están declarados por el autor y marcados como no verificados.
- Dependencia de la librería strands-decider: el despliegue está ligado a esa librería; no se documentan formatos alternativos de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StrandsAgents/strands-decider-E2B-gemma4-v2-2611
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Versión anterior v1: https://huggingface.co/StrandsAgents/strands-decider-E2B-gemma4-v1-2610
- Repositorio de código: https://github.com/strands-labs/strands-decider
- Regla de nombrado: https://github.com/strands-labs/strands-decider/blob/main/docs/naming.md
- Documentación: https://strandsagents.com/docs/labs/strands-decider/overview/
- Organización en Hugging Face: https://huggingface.co/StrandsAgents
- Variante E4B: https://huggingface.co/StrandsAgents/strands-decider-E4B-gemma4-v2-2611
- Variante 12B: https://huggingface.co/StrandsAgents/strands-decider-12B-gemma4-v2-2611
- Variante 26B-A4B: https://huggingface.co/StrandsAgents/strands-decider-26B-A4B-gemma4-v2-2611
- Variante 31B: https://huggingface.co/StrandsAgents/strands-decider-31B-gemma4-v2-2611
