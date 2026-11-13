# tuanhqv123/DMA-2B

## Resumen

DMA-2B (Decision Model for Android, 2B) es un modelo de decisión visión-lenguaje de 1.918.181.888 parámetros (aproximadamente 1,92B) desarrollado por el usuario tuanhqv123 como un fine-tune completo del modelo base LiquidAI/d1-2B. Su propósito es resolver un problema muy concreto en el ámbito de los agentes GUI: seleccionar la siguiente acción de un agente Android en un único pase forward, sin generar ningún token de texto. En lugar de escribir la acción como una secuencia de texto que luego hay que parsear, el modelo responde a preguntas tipadas (qué acción, qué elemento en pantalla, qué aplicación, qué dirección de scroll, qué span escribir) y devuelve una probabilidad para cada opción disponible.

La relevancia de esta aproximación es doble. Por un lado, elimina por completo la fase de parsing: cada respuesta decodificada es directamente un `JSONAction` válido de AndroidWorld, lo que simplifica la integración en pipelines de agentes. Por otro, aporta una probabilidad calibrada por decisión, lo que permite al agente actuar solo cuando la confianza es suficiente; según el autor, en AndroidControl-High la probabilidad de acción ordena los propios errores del modelo con un AUROC de 0,758, y actuar únicamente sobre la mitad de pasos más confiados reduce la tasa de error del 38,3% al 19,0%.

El modelo se distribuye bajo licencia lfm1.0 (etiquetada como "other" en Hugging Face), soporta únicamente inglés, se sirve con la librería transformers y está pensado como modelo de investigación a partir de una única semilla de entrenamiento. No es un modelo generativo de propósito general, sino un componente especializado para la capa de decisión de agentes móviles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language decision model (familia lfm3_vl), single-pass sin generación de tokens |
| Parámetros totales | 1.918.181.888 (~1,92B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Modelo base | LiquidAI/d1-2B (fine-tune completo) |
| Tamaño del repositorio | 3,9 GB |
| Código personalizado | sí (tag custom_code, requiere cargar código del repo) |

## Arquitectura y entrenamiento

DMA-2B es un fine-tune completo del modelo LiquidAI/d1-2B, un modelo de decisión visión-lenguaje de 1,92B de la familia lfm3_vl. La innovación central no está en la arquitectura del transformer subyacente, sino en la formulación de la tarea: el modelo no genera texto autoregresivamente, sino que responde a preguntas de opción múltiple sobre la interfaz (tipo de acción, elemento objetivo, aplicación, dirección de scroll, span de texto a escribir) y devuelve una distribución de probabilidad sobre las opciones listadas. Esto convierte cada salida en una acción estructurada válida sin necesidad de parsing posterior.

El entrenamiento se realizó sobre datos de AndroidControl, el conjunto de Google presentado en NeurIPS 2024 con 1.543 episodios humanos grabados en aplicaciones Android reales y 8.444 pasos en el split de test. El modelo consume tanto la pantalla como la lista de elementos de accesibilidad, además del historial de acciones previas del humano. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO. El autor advierte explícitamente que se trata de un modelo de investigación entrenado con una única semilla, lo que limita las garantías de robustez estadística de los resultados.

## Capacidades

- Selección de la siguiente acción de un agente GUI Android en un único pase forward, sin generación de tokens.
- Predicción del tipo de acción (click, scroll, type, open app, back, wait, etc.).
- Grounding de elementos: identificación del elemento concreto de la pantalla sobre el que actuar.
- Predicción de la aplicación objetivo, la dirección de scroll y el span de texto a escribir.
- Salida con probabilidad por cada opción, lo que permite umbralizar la confianza y decidir cuándo actuar.
- Procesamiento de entrada multimodal: imagen de pantalla más lista de elementos de accesibilidad e historial de acciones.
- Soporte de instrucciones de alto nivel (objetivo global) y de bajo nivel (instrucción paso a paso).
- Capacidad de calibración: la probabilidad de acción ordena los errores propios con AUROC 0,758 en AndroidControl-High.
- No soporta tool calling genérico, function calling ni razonamiento multi-step en el sentido de los LLM generativos; su función es la capa de decisión de un agente.
- No dispone de modo thinking, audio ni otras capacidades especiales más allá de la decisión visual sobre GUI.

## Casos de uso

- Agentes móviles autónomos en Android: el modelo actúa como política de decisión que, dado el estado de pantalla y el objetivo, selecciona la siguiente acción válida en formato `JSONAction`, integrándose en frameworks como AndroidWorld sin capa de parsing intermedia.
- Automatización de pruebas de aplicaciones: un pipeline de QA puede usar DMA-2B para navegar por flujos de la app siguiendo instrucciones de alto nivel y detectar pasos donde la confianza cae por debajo de un umbral, señalando posibles regresiones de UI.
- Asistencia a usuarios con accesibilidad reducida: dado que consume la lista de elementos de accesibilidad y devuelve el elemento objetivo con su probabilidad, puede emplearse para guiar o automatizar interacciones en pantallas complejas.
- Orquestación de agentes con abstención: gracias a la probabilidad calibrada por decisión (AUROC 0,758), el sistema puede delegar a un humano o a un modelo mayor solo los pasos de baja confianza, reduciendo el error del 38,3% al 19,0% al actuar sobre la mitad más confiable.
- Servicio de inferencia de baja latencia: con 135 ms por decisión en mediana y 181 ms en el percentil 95 sobre una GPU compartida de 24 GB servida por HTTP, es adecuado para bucles de agente interactivos donde la latencia importa.
- Investigación en políticas de decisión para GUI: al ser un fine-tune reproducible sobre d1-2B con métricas detalladas por tipo de acción y grounding, sirve como línea base para estudiar calibración y selección de acciones en agentes móviles.
- Enrutamiento de acciones en asistentes de escritorio o móvil: la formulación de preguntas tipadas permite reutilizar el modelo para decidir entre un conjunto acotado de acciones predefinidas por la aplicación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Las filas marcadas como *reported* proceden de los papers citados (InfiGUI-R1, GUI-R1, MobileRL) y no fueron reproducidas por el autor.

| Modelo | Tamaño | AC-Low Type | AC-Low Grounding | AC-Low SR | AC-High Type | AC-High Grounding | AC-High SR |
|---|---|---|---|---|---|---|---|
| GPT-4o *(reported)* | – | 74,3 | 0,0 | 19,4 | 66,3 | 0,0 | 20,8 |
| Qwen2.5-VL-3B zero-shot *(reported)* | 3B | 62,0 | 74,1 | 59,3 | 47,8 | 46,5 | 38,9 |
| GUI-R1-3B *(reported)* | 3B | 83,7 | 81,6 | 64,4 | 58,0 | 56,2 | 46,6 |
| OS-Atlas-4B *(reported)* | 4B | 91,9 | 83,8 | 80,6 | 84,7 | 73,8 | 67,5 |
| UI-TARS-2B *(reported)* | 2B | 98,1 | 87,3 | 89,3 | 81,2 | 78,4 | 68,9 |
| InfiGUI-R1-3B *(reported)* | 3B | 96,0 | 93,2 | 92,1 | 82,7 | 74,4 | 71,1 |
| UI-TARS-7B *(reported)* | 7B | 98,0 | 89,3 | 90,8 | 83,7 | 80,5 | 72,5 |
| MobileRL-9B *(reported)* | 9B | 97,9 | 94,6 | 94,3 | 87,0 | 74,5 | 73,9 |
| UI-Genie-72B *(reported)* | 72B | 98,3 | 95,4 | 94,8 | 84,9 | 86,3 | 77,0 |
| d1-2B (base) | 2B | 80,0 | 76,9 | 59,8 | 63,6 | 63,1 | 40,2 |
| **DMA-2B** | 2B | **96,6** | **90,1** | **89,3** | **74,3** | **78,4** | **61,7** |

Métricas de calibración en AndroidControl-High (8.444 pasos), confianza c = p(acción elegida):

| Modelo | Precisión por paso | AUROC de errores |
|---|---|---|
| d1-2B (base) | 40,2% | no disponible |
| DMA-2B | 61,7% | 0,758 |

El autor indica que, actuando solo sobre la mitad de pasos más confiados, la tasa de error baja del 38,3% al 19,0%. El fine-tune eleva el step success rate sobre d1-2B de 59,8 a 89,3 en AC-Low y de 40,2 a 61,7 en AC-High. La comparación es indicativa: los modelos de referencia leen solo píxeles y generan la acción como texto, mientras que DMA-2B también consume la lista de elementos de accesibilidad y elige entre ellos, y los prompts y formatos de historial difieren entre papers.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,92B parámetros, en fp16 rondaría los 4 GB de pesos más el overhead del procesador visual y del código personalizado. El autor reporta servir el modelo en una GPU compartida de 24 GB.
- GPU recomendadas: el autor menciona una GPU de 24 GB (perfil RTX 4090, A10G, L4 o similar) para el servicio HTTP de referencia.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8-16 GB en fp16 o cuantizado, aunque no se publican configuraciones de cuantización validadas.
- Opciones de despliegue: transformers (librería declarada) con carga de código personalizado del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 135 ms por decisión en mediana y 181 ms en el percentil 95, medidas sobre una GPU compartida de 24 GB servida por HTTP.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AC-High SR | AC-Low SR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DMA-2B | 1,92B | no disponible | 61,7 | 89,3 | lfm1.0 | Hugging Face |
| UI-TARS-2B | 2B | no disponible | 68,9 | 89,3 | no disponible | reportado en InfiGUI-R1 |
| GUI-R1-3B | 3B | no disponible | 46,6 | 64,4 | no disponible | reportado en GUI-R1 |
| OS-Atlas-4B | 4B | no disponible | 67,5 | 80,6 | no disponible | reportado en InfiGUI-R1 |
| InfiGUI-R1-3B | 3B | no disponible | 71,1 | 92,1 | no disponible | reportado en InfiGUI-R1 |

En el rango de 2-4B, DMA-2B iguala a UI-TARS-2B en AC-Low SR (89,3 frente a 89,3) y en AC-High grounding (78,4 frente a 78,4), y supera claramente a GUI-R1-3B y a Qwen2.5-VL-3B zero-shot. Queda por detrás de UI-TARS-2B, OS-Atlas-4B e InfiGUI-R1-3B en AC-High SR (61,7 frente a 67,5-71,1), principalmente por el tipo de acción (74,3 frente a 81-85). La ventaja diferencial de DMA-2B no es tanto la precisión bruta como la formulación single-pass sin parsing y la probabilidad calibrada por decisión.

## Limitaciones y advertencias

- Modelo de investigación entrenado con una única semilla; los resultados pueden no ser estables entre ejecuciones de entrenamiento.
- Solo soporta inglés; no hay evidencia de comportamiento multilingüe.
- Especializado exclusivamente en decisión de acciones GUI Android; no es un modelo generativo de propósito general ni sirve para texto libre, código o matemáticas.
- No se documentan sesgos conocidos ni evaluaciones de sesgo; al entrenarse sobre episodios humanos de AndroidControl, puede heredar sesgos de las trayectorias grabadas.
- Riesgo de alucinación reducido por diseño (las respuestas se restringen a opciones listadas), pero persiste el riesgo de seleccionar una acción válida semánticamente incorrecta, especialmente en objetivos de alto nivel.
- La comparación con modelos publicados es indicativa: los competidores leen solo píxeles y generan texto, mientras que DMA-2B consume la lista de accesibilidad, y los prompts y formatos de historial difieren entre papers.
- Licencia lfm1.0 (etiquetada como "other"): es necesario revisar los términos del archivo LICENSE del repositorio antes de cualquier uso comercial.
- Requiere cargar código personalizado del repositorio (tag custom_code), lo que implica confiar en el código del autor al instanciar el modelo.
- Longitud de contexto y opciones de cuantización no documentadas, lo que dificulta planificar despliegues con historiales largos o en hardware limitado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tuanhqv123/DMA-2B
- Demo Space: https://huggingface.co/spaces/tuanhqv123/DMA-2B-demo
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Paper de AndroidControl (Google, NeurIPS 2024): no disponible en la información proporcionada
- Paper de InfiGUI-R1: no disponible en la información proporcionada
- Paper de GUI-R1: no disponible en la información proporcionada
- Paper de MobileRL: no disponible en la información proporcionada
