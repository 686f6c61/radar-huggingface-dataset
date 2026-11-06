# tapiocaTakeshi/complete-qbnn-xl

## Resumen

complete-qbnn-xl es un modelo de lenguaje a nivel de carácter desarrollado por tapiocaTakeshi, publicado en Hugging Face bajo el identificador `tapiocaTakeshi/complete-qbnn-xl`. Se trata de un GPT de 27,4 millones de parámetros (según la model card, "2.740 万パラメータ") cuya innovación principal reside en la capa FFN: en lugar de neuronas convencionales, emplea "esferas de Bloch completas" (una correspondencia entre las dos hojas de un hiperboloide de dos hojas y los hemisferios de una esfera). El modelo está entrenado exclusivamente en CPU y orientado al idioma japonés, incluyendo texto, conversación, instrucciones y código Python.

El modelo resuelve el problema de explorar arquitecturas alternativas a las FFN estándar en modelos de lenguaje pequeños, manteniendo un coste computacional bajo. Con una longitud de contexto de 256 caracteres y un vocabulario de 4.000 caracteres más tokens especiales, está pensado para experimentación e investigación más que para producción. Su relevancia actual es limitada pero interesante para quienes investigan arquitecturas neuronales no convencionales y entrenamiento en hardware modesto.

La familia incluye dos tamaños: L (12,29 millones de parámetros, anchura 384, 6 capas, 8 cabezas) y XL (27,4 millones, anchura 512, 8 capas, 8 cabezas). El checkpoint recomendado es `xl_140k.pt`, entrenado durante 140.000 pasos. El repositorio ocupa 0,3 GB e incluye pesos en formato PyTorch (`state_dict`), código de definición del modelo y una versión que funciona en navegador con pesos en fp16 y WebAssembly.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT transformer con FFN basada en esferas de Bloch completas (complete QBNN) |
| Parametros totales | 27,4 millones (XL); 12,29 millones (L) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 caracteres |
| Tipos de cuantizacion | no disponible (pesos en fp32 en `.pt`; version fp16 en navegador) |
| Idiomas soportados | japones (ja) |
| Licencia | other |
| Formato de pesos | PyTorch `state_dict` (`.pt`); pesos fp16 para WebAssembly en navegador |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT con tokenización a nivel de carácter. La innovación arquitectónica es la sustitución de las neuronas de la red feed-forward por "esferas de Bloch completas": cada neurona se modela como un punto en una esfera de Bloch, donde las dos hojas de un hiperboloide de dos hojas se corresponden con los hemisferios de la esfera. La configuración XL emplea anchura 512, 8 capas y 8 cabezas de atención; la L usa anchura 384, 6 capas y 8 cabezas. El vocabulario consta de 4.000 caracteres más los tokens especiales `<bos>`, `<sep>`, `<eos>` y `<pad>`.

El entrenamiento se realizó íntegramente en CPU con AdamW y programación de learning rate cosenoidal. Cada paso procesa 16 filas de 256 caracteres. Para texto se calcula la pérdida sobre todos los caracteres; para conversación e instrucciones, solo sobre la respuesta y el token `<eos>`. El checkpoint XL se entrenó en tres fases: 40.000 pasos desde pesos aleatorios, 60.000 pasos adicionales y 40.000 pasos más con datos nuevos, totalizando 140.000 pasos. Los datos de entrenamiento incluyen FineWeb-2 en japonés, Wikipedia japonesa, Aozora Bunko, Wikinews y código Python; para conversación, oasst1/oasst2 en japonés, conversaciones multirronda de Wikipedia, Magpie-Tanuki y conversaciones sintéticas de Nemotron; para instrucciones, dolly-ja, amenokaku-code, japanese_alpaca, llm-japanese-dataset, hh-rlhf en japonés y JaQuAD. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto a nivel de carácter en japonés, incluyendo estilo y formato de respuesta.
- Conversación multirronda mediante el formato `<bos>pregunta<sep>respuesta<eos>`.
- Seguimiento de instrucciones en japonés (entrenado con dolly-ja, japanese_alpaca, llm-japanese-dataset, entre otros).
- Generación de código Python (entrenado con código Python y amenokaku-code).
- Capacidad de respuesta a preguntas de opción múltiple mediante selección por verosimilitud (JCommonsenseQA, capitales, capitales de prefectura, sumas, partículas).
- No se menciona soporte de tool calling ni function calling.
- No se menciona soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al japonés.
- No dispone de visión, audio ni modo "thinking".

## Casos de uso

- Investigación en arquitecturas alternativas: el modelo sirve como banco de pruebas para evaluar el rendimiento de FFN basadas en esferas de Bloch frente a FFN convencionales en tareas de modelado de lenguaje a nivel de carácter, con un coste de entrenamiento asumible en CPU.
- Experimentación educativa en entornos con recursos limitados: al entrenarse solo en CPU y ocupar 0,3 GB, permite reproducir el pipeline completo (definición del modelo, entrenamiento, evaluación) en un portátil, algo inviable con modelos transformer convencionales de mayor tamaño.
- Generación de texto japonés creativo a pequeña escala: puede producir continuaciones de texto con estilo coherente a nivel de forma, útil para prototipos de escritura asistida donde la corrección factual no sea crítica.
- Demostración de inferencia en navegador: la carpeta `browser/` incluye pesos fp16 en WebAssembly y una interfaz de chat (`index.html`), lo que permite desplegar el modelo en el cliente sin backend, útil para demos interactivas y experimentos de inferencia en el edge.
- Evaluación de modelos de lenguaje a nivel de carácter: sirve para estudiar cómo se comportan los modelos carácter-a-carácter en japonés (idioma sin espacios) y comparar métricas de bits por carácter entre configuraciones L y XL.
- Pruebas de formato conversacional y de instrucciones: permite validar pipelines de datos SFT (dolly-ja, oasst, Magpie-Tanuki) en un modelo pequeño antes de escalar a modelos mayores, verificando el formato `<bos>...<sep>...<eos>` y el enmascaramiento de pérdida.

## Benchmarks y rendimiento

Resultados de bits por carácter (menor es mejor) publicados en la model card:

| Modelo | Web | Wikipedia | Código | Conversación | Instrucciones |
|---|---|---|---|---|---|
| L (110k pasos) | 3,809 | 3,376 | 1,379 | 2,726 | 2,451 |
| XL (100k pasos) | 3,748 | 3,328 | 1,394 | 2,667 | 2,412 |
| XL (140k pasos) | 3,668 | 3,262 | 1,356 | 2,618 | 2,336 |

Resultados en pruebas de selección por verosimilitud (XL, 140k pasos), con la tasa de acierto por azar entre paréntesis:

| Tarea | Acierto | Azar |
|---|---|---|
| JCommonsenseQA | 26,5% | 20% |
| Capitales | 22,5% | 20% |
| Capitales de prefectura | 66,0% | 20% |
| Sumas | 8% | 5% |
| Partículas | 79,2% | 14% |

El autor advierte que los datos de entrenamiento pueden contener preguntas sobre capitales y capitales de prefectura, por lo que en esas dos tareas podría existir un efecto de memorización de preguntas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo XL (27,4 millones de parámetros); en torno a 0,5 GB en fp16 para la versión de navegador.
- GPU recomendadas: no requiere GPU; el autor entrenó exclusivamente en CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es más que suficiente, pero no es necesaria.
- Cabe en cualquier GPU consumer e incluso en CPU y en navegador mediante WebAssembly.
- Opciones de despliegue: PyTorch nativo (cargando `state_dict` con el código de `code/scale_exp.py` y `code/complete_qbnn.py`); versión en navegador con `browser/index.html` servida por HTTP y pesos `weights_*.wasm`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y probablemente no sea compatible sin conversión adicional.
- Latencia y throughput: no disponibles. El contexto de 256 caracteres y el tamaño reducido sugieren una latencia muy baja en CPU, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| complete-qbnn-xl (este) | 27,4 M | 256 caracteres | other | Hugging Face, PyTorch y navegador | Carácter, japonés, FFN de esferas de Bloch |
| complete-qbnn-l | 12,29 M | 256 caracteres | other | Hugging Face, PyTorch | Misma familia, menor tamaño |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Amplia | Referencia transformer convencional; no comparable en idioma ni tokenización |
| Modelos de lenguaje a nivel de carácter en japonés | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas públicas comparables en la información proporcionada |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño a nivel de carácter: memoriza bien el estilo y la forma de las respuestas, pero comete numerosos errores factuales (el autor cita ejemplos sobre el monte Fuji y escritores).
- La conversación multirronda pierde coherencia a partir del segundo intercambio; no mantiene el hilo del diálogo.
- Contexto muy limitado: 256 caracteres, insuficiente para documentos largos o conversaciones extensas.
- Solo japonés; no soporta otros idiomas de forma fiable.
- No debe usarse la salida como fuente de hechos; riesgo alto de alucinación.
- Licencia "other": es necesario consultar los términos exactos en el repositorio antes de cualquier uso comercial. Además, los datos de entrenamiento tienen sus propias licencias (por ejemplo, datos derivados de Wikipedia con CC BY-SA), que deben verificarse.
- Sin soporte documentado de tool calling, agentes ni integración con servidores de inferencia estándar (vLLM, TGI, llama.cpp).
- El modelo se entrenó en CPU con un presupuesto computacional reducido; no se han publicado evaluaciones exhaustivas de sesgos.
- La fecha de creación del repositorio (2026-11-06) es futura respecto a la fecha habitual de consulta; verificar la vigencia del recurso.

## Enlaces

- Hugging Face: https://huggingface.co/tapiocaTakeshi/complete-qbnn-xl
- Repositorio GitHub con código y scripts de entrenamiento: https://github.com/tapiocaTakeshi/Qubit (archivos `complete_qbnn.py` y `tools/complete_qbnn_lm/`)
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
