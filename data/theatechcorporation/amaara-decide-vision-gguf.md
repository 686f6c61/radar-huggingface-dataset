# theatechcorporation/amaara-decide-vision-GGUF

## Resumen

Amaara Decide Vision v4 es un modelo de decisión multimodal, no un chatbot generativo, publicado por The A Tech Corporation. Se construye mediante fine-tuning supervisado del modelo base `unsloth/Qwen3.5-0.8B` (779.717.956 parámetros totales) y se distribuye exclusivamente en formato GGUF. Su función es recibir una imagen, un estado textual y un conjunto de preguntas tipadas, y devolver una opción seleccionada junto con probabilidades calibradas para cada alternativa. Al puntuar un conjunto fijo de opciones en lugar de muestrear tokens, las probabilidades devueltas son probabilidades reales sobre las que se puede aplicar un umbral, no un softmax sobre el vocabulario.

La versión v4 corrige un defecto crítico de v3: en preguntas de geometría (intergps), proporcionar la imagen correcta empeoraba la precisión frente a una imagen aleatoria (delta de visión de −0.125). v4 invierte esa tendencia y alcanza un delta de visión positivo de +0.120 en esa misma fuente, con una precisión global de 0.788 (584/741) y un delta de visión medio de +0.3457 sobre cinco conjuntos de evaluación.

El modelo está pensado para integrarse como componente de decisión dentro de sistemas mayores: agentes que necesitan clasificar pantallas, validar gráficos, responder preguntas de sí/no sobre mapas o seleccionar elementos de interfaz. Se sirve mediante `llama-server` en el endpoint propietario `/v1/systemone`; el endpoint estándar `/v1/chat/completions` devuelve HTTP 400 por diseño. Solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje Qwen3.5-0.8B + torre de visión congelada Qwen-VL + cabeza de decisión conjunta) |
| Parametros totales | 779.717.956 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (configurado en el ejemplo de servicio con `-c 4096`) |
| Tipos de cuantizacion | F16 (1,5 GB), Q8_0 (803 MB) |
| Idiomas soportados | en (inglés) |
| Licencia | a-tech-license (model card declara Apache-2.0; los pesos base Qwen3.5-0.8B son Apache-2.0) |
| Formato de pesos | GGUF (archivo principal + `mmproj` separado para el codificador visual) |
| Tamano del repo | 8,8 GB |
| Pipeline | image-text-to-text |
| Endpoint de servicio | `/v1/systemone` vía `llama-server` |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-0.8B` y añade una cabeza de decisión conjunta que puntúa un conjunto fijo de opciones tipadas en lugar de generar texto token a token. La torre de visión se mantiene congelada: el `mmproj-vision-v4-F16.gguf` (198 MB) es byte a byte del mismo tamaño que el de v3, lo que confirma que solo se adaptaron la torre de lenguaje y la cabeza de decisión. El entrenamiento empleó LoRA con r=16 y learning rate 2e-4 durante 3.000 pasos sobre 18.668 ítems de decisión construidos a partir de 20.341 filas (1.673 descartadas). Se ejecutó en una única GPU de consumo de 16 GB con un pico de 5,5 GB y un tiempo total de 1 h 32 m.

La innovación principal no es arquitectónica sino metodológica: la evaluación mide el *delta de visión*, ejecutando cada conjunto de 150 filas dos veces con las mismas preguntas, una con la imagen real y otra con una imagen distinta de la misma fuente. Un modelo que ignora los píxeles obtiene el mismo resultado en ambas condiciones (delta 0), de modo que el delta cuantifica directamente el uso real de la imagen y no puede inflarse acertando la clase mayoritaria. La calibración también se mide: en gráficos, el error de calibración esperado (ECE) es 0.018 con imágenes reales y 0.328 con imágenes incorrectas, comportamiento correcto para un modelo calibrado (sin la imagen, falla con confianza).

## Capacidades

- Decisión sobre conjuntos fijos de opciones tipadas (`choice`) con probabilidades calibradas por opción, aptas para aplicar umbrales.
- Comprensión de imágenes: gráficos, diagramas (ai2d), mapas con preguntas sí/no (mapqa), geometría (intergps) y elementos de interfaz (rico-widget).
- Procesamiento conjunto de estado textual + imagen + preguntas en una sola llamada.
- Salida estructurada JSON con la opción elegida y el vector de probabilidades.
- No genera texto libre: no es un chatbot ni un modelo de instrucciones general.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM generativos.
- Multilingüe: no, únicamente inglés.
- Modo thinking, audio: no disponible.

## Casos de uso

- Clasificación de gráficos en pipelines de informes: dado un dashboard renderizado, el modelo responde qué tipo de gráfico se muestra (barra, línea, etc.) con una probabilidad umbralizable; útil para validar automáticamente que un panel de BI muestra el widget esperado.
- Validación de capturas de interfaz en QA: enviar una captura de pantalla y preguntar por la presencia o el tipo de un elemento concreto; el delta de visión de 0.402 en rico-widget lo hace fiable para detección gruesa, aunque para localización fina conviene v3.
- Respuesta a preguntas sí/no sobre mapas: integrado en un agente de navegación o análisis geoespacial que necesita confirmar si una ruta, etiqueta o símbolo aparece en una imagen de mapa (precisión 0.880 en mapqa/yesno).
- Filtrado de diagramas científicos: clasificar diagramas de ai2d (precisión 0.907) para enrutar documentos técnicos hacia el extractor adecuado.
- Decisión con umbral de confianza en sistemas de triaje: al devolver probabilidades calibradas (ECE 0.018 en gráficos), el sistema puede rechazar automáticamente decisiones por debajo de un umbral y escalar a revisión humana.
- Componente de decisión en agentes visuales: un agente que observa una pantalla y debe elegir entre un conjunto cerrado de acciones o estados puede usar el modelo como cabeza de política, sustituyendo la generación de texto por una puntuación calibrada.
- Detección de deriva en modelos de visión propios: la metodología de delta de visión sirve como referencia para auditar si otros modelos multimodales usan realmente los píxeles.

## Benchmarks y rendimiento

Datos publicados en la model card (150 filas por fuente, semilla fija, filas held-out):

| Fuente | n | Precisión | Azar | Lift | Precisión con imagen incorrecta | Delta de visión v4 | Delta de visión v3 |
|---|---|---|---|---|---|---|---|
| synthetic/charts | 150 | 0.927 | 0.245 | +0.681 | 0.273 | +0.653 | +0.582 |
| vision/ai2d | 150 | 0.907 | 0.250 | +0.657 | 0.680 | +0.227 | +0.250 |
| vision/intergps | 150 | 0.507 | 0.250 | +0.257 | 0.387 | +0.120 | −0.125 |
| vision/mapqa/yesno | 150 | 0.880 | 0.500 | +0.380 | 0.553 | +0.327 | +0.275 |
| vision/rico-widget/element | 141 | 0.716 | 0.096 | +0.621 | 0.314 | +0.402 | +0.583 |

Precisión global: 584/741 = 0.788. Delta de visión medio: +0.3457. ECE en gráficos: 0.018 con imagen real, 0.328 con imagen incorrecta. No se ha ejecutado comparación contra un modelo de decisión visual de referencia (Clef u otro); los números son absolutos, no relativos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para F16 y 803 MB para Q8_0, más 198 MB del `mmproj`; en la práctica, el entrenamiento usó un pico de 5,5 GB en una GPU de 16 GB, y la inferencia con contexto 4.096 y batch físico 8.192 requiere margen adicional.
- GPU recomendadas: cualquier GPU de consumo con al menos 8 GB de VRAM es suficiente; una RTX 4090 o superior ofrece holgura para lotes mayores.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090).
- Opciones de despliegue: `llama-server` (obligatorio para el endpoint `/v1/systemone`); llama.cpp como backend subyacente. No se documenta soporte para vLLM, TGI u Ollama.
- Flags imprescindibles: `--mmproj mmproj-vision-v4-F16.gguf`, `-b 8192` (una imagen más prompt ocupa ~2.955 tokens y supera el batch físico por defecto de 2.048) y `--image-min-tokens 1024` (por debajo, la precisión de grounding degrada).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión publicada | Licencia | Formato |
|---|---|---|---|---|---|
| Amaara Decide Vision v4 | 779,7 M | 4.096 | 0.788 global; delta de visión +0.3457 | a-tech-license (card declara Apache-2.0) | GGUF |
| Amaara Decide Vision v3 | no disponible | no disponible | 0.773 en rico-widget; delta +0.583 en esa fuente; delta −0.125 en intergps | a-tech-license | GGUF |
| Qwen3.5-0.8B (base) | 779,7 M | no disponible | no disponible | Apache-2.0 | safetensors, GGUF |
| Clef (modelo de decisión visual de referencia) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con Clef no se ha ejecutado según la propia model card; los datos de v3 solo se ofrecen para las fuentes evaluadas. No se dispone de comparativas frente a otros modelos de decisión visual en la información proporcionada.

## Limitaciones y advertencias

- Geometría (intergps): precisión 0.507, solo +0.257 sobre el azar; direccionalmente correcta pero no fiable. No usar para razonamiento geométrico.
- Localización de elementos de interfaz: regresión frente a v3 (delta 0.402 vs 0.583; precisión 0.716 vs 0.773). Para cargas de trabajo de grounding de UI, v3 es mejor.
- ai2d plano: 0.907 de precisión y delta +0.227 frente a +0.250 en v3, dentro del ruido con n=150.
- La ablación con imagen incorrecta usa imágenes de la misma fuente, por lo que controla el dominio pero no todos los atajos posibles.
- Sin comparación contra un modelo de decisión visual de referencia: los números son absolutos.
- El endpoint `/v1/chat/completions` devuelve HTTP 400 por diseño; los clientes que esperan una API de chat fallarán.
- Sin `--mmproj`, el servidor carga solo la torre de lenguaje y toda petición con imagen falla con HTTP 501, que muchos clientes interpretan como "sin respuestas".
- Sin `-b 8192`, las peticiones con imagen fallan con "input is too large to process".
- Solo inglés; no hay soporte multilingüe.
- Riesgo de alucinación: el modelo no genera texto, pero puede asignar alta probabilidad a una opción incorrecta; la calibración se degrada drásticamente sin imagen (ECE 0.328).
- Licencia: la model card declara Apache-2.0, pero los metadatos de Hugging Face indican `license: other` con nombre `a-tech-license`; verificar el archivo LICENSE antes de uso comercial.
- Sesgos conocidos: no documentados en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/theatechcorporation/amaara-decide-vision-GGUF
- Licencia: https://huggingface.co/theatechcorporation/amaara-decide-vision-GGUF/blob/main/LICENSE
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Comunidad AI Owner's Club: https://www.skool.com/open-source-ai-builders-club/about
