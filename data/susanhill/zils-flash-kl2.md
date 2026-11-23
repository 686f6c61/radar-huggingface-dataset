# SusanHill/zils-flash-kl2

## Resumen

KnowLine-9B-Gen2 es un modelo de decisión estructurada publicado por PelaAI bajo el identificador `SusanHill/zils-flash-kl2` en Hugging Face. Se construye mediante fine-tuning supervisado con LoRA sobre el modelo denso Qwen3.5-9B (Apache-2.0), con aproximadamente 9.650 millones de parámetros totales según los pesos en safetensors. El modelo no genera texto libre: recibe un estado (texto o conversación) y hasta 64 preguntas tipadas (sí/no, elección entre k opciones o puntuación sobre una rúbrica) y devuelve, para cada pregunta, una distribución de probabilidad sobre las opciones en un único forward pass.

La propuesta es relevante porque sustituye la generación autoregresiva por predicción estructurada con probabilidades calibradas: la temperatura de lectura (T = 1.63) se ha plegado en los pesos, lo que produce valores ECE de aproximadamente 0.009–0.011 y Brier de 0.253–0.272 en la suite pública Decision Index 0.3, donde el modelo obtiene 69.00. Esa calibración permite usar las salidas directamente como probabilidades en sistemas de enrutamiento, moderación o toma de decisiones automatizada, sin post-procesado adicional.

El modelo mantiene el componente de visión del modelo base sin cambios y conserva el tokenizador de Qwen3.5, por lo que hereda el pipeline image-text-to-text. Su licencia Apache-2.0 y su formato bf16 (19,3 GB) lo hacen desplegable con SGLang, con un servidor de referencia que aplica lectura doble de cada petición para estabilizar la inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-9B), con componente de visión del modelo base y cabeza de lectura de probabilidades sobre tokens de etiqueta |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3.5-9B) |
| Tipos de cuantización | bf16 (único formato publicado); no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | inglés, chino simplificado, chino tradicional |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, repositorio de 19,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de unos 9B parámetros bajo licencia Apache-2.0. Sobre él se aplica un adaptador LoRA de rango 128 y alpha 256, limitado al componente de lenguaje, entrenado durante una época y fusionado posteriormente en pesos bf16. Los ejemplos de entrenamiento consisten en tareas de decisión redactadas y etiquetadas por profesores LLM, renderizadas con la plantilla de chat de Qwen3.5. El componente de visión no se modifica respecto al modelo base y el tokenizador es el original de Qwen3.5.

La innovación principal no está en la arquitectura sino en el mecanismo de lectura: cada pregunta se resuelve con un único forward pass, sin generación de texto, y la salida es la probabilidad asignada al token de etiqueta de cada opción. Una temperatura de lectura única (T = 1.63), ajustada sobre datos de validación con el mismo esquema de servicio, se ha plegado en el peso de la normalización final; el front end lee las preguntas de puntuación a temperatura efectiva 1.0 mediante `temperatures.json`. El servidor de referencia (`knowline_server.py`) aplica lectura doble de cada petición por defecto, comportamiento que puede desactivarse con `--no-read-twice`. El conjunto de datos de entrenamiento no se incluye en el repositorio.

## Capacidades

- Predicción estructurada de decisiones: responde hasta 64 preguntas tipadas por petición con distribuciones de probabilidad sobre las opciones.
- Preguntas de tipo sí/no (`noul`), elección única entre k opciones (`choice`) y puntuación sobre rúbrica.
- Probabilidades calibradas listas para uso directo (temperatura plegada en los pesos, ECE en torno a 0.009–0.011).
- Inferencia sin generación de texto: un forward pass por pregunta, lo que reduce latencia frente a esquemas autoregresivos.
- Entrada multimodal texto-imagen heredada del modelo base (pipeline image-text-to-text), con el componente de visión sin cambios.
- Soporte multilingüe en inglés, chino simplificado y chino tradicional.
- Compatibilidad de interfaz con clientes Jev existentes (solo cambia la URL base) y con otros modelos KnowLine (solo cambia el nombre del modelo).
- Servicio mediante endpoint `/v1/systemone` sobre SGLang.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: enviar el texto del ticket como estado y preguntas de tipo elección (categoría, urgencia, sentimiento) para obtener una distribución de probabilidad que alimente un clasificador o un sistema de asignación automática, aprovechando la calibración para fijar umbrales de derivación a agentes humanos.
- Moderación de contenido con rúbrica: puntuar mensajes de usuario contra criterios definidos (toxicidad, spam, intención comercial) y usar las probabilidades calibradas para decidir bloqueo, revisión o publicación sin post-procesado.
- Triaje de atención al cliente multi-turno: procesar conversaciones completas como estado y responder preguntas de sí/no sobre si procede reembolso, escalado o cierre, con un único forward pass por pregunta que mantiene la latencia baja en colas de alta concurrencia.
- Evaluación automática de respuestas: dado un par pregunta-respuesta y una rúbrica, obtener la distribución sobre niveles de calidad para construir métricas de evaluación reproducibles en pipelines de anotación.
- Análisis de documentos con imagen: al conservar el componente de visión del modelo base, puede recibir capturas o documentos escaneados junto con preguntas estructuradas sobre su contenido (por ejemplo, validación de formularios o extracción de decisiones).
- Automatización de flujos de decisión en agentes: integrar el endpoint `/v1/systemone` como paso de decisión dentro de un agente mayor, sustituyendo llamadas generativas por consultas de probabilidad que reducen coste y variabilidad.
- Investigación en calibración: utilizar las salidas ECE/Brier documentadas como referencia para comparar métodos de calibración en modelos de decisión de 9B.

## Benchmarks y rendimiento

| Modelo | Tamaño | DI 0.3 público | DI 0.4.1 completo | Fuente |
|---|---|---|---|---|
| KnowLine-9B-Gen2 | 9B | 69.00 | No puntuado aún | Auto-ejecución, kit oficial |
| karpo-decision-31B | ~31,3B | 75.05 | 73.86 | Board |
| GLiDE 27B | ~26,1B | 72.49 | 73.37 | Board |
| REAX 1.3 | ~57,4B | 73.71 | 72.64 | Board |
| Logits Sigma-1 Duo | ~57,4B | 72.93 | 72.28 | Board |
| Copernicus-31B | ~31,3B | 70.37 | 72.11 | Board |
| KnowLine 31B Gen1.5 | ~31,3B | 70.50 | 71.91 | Board |
| Copernicus-57B | ~57,4B | 75.34 | 71.80 | Board |
| FlexDM-LoRA 2.1 · Gemma-4-31B | ~31,3B | 68.99 | 71.61 | Board |

Métricas de calibración en la suite pública (método del board): ECE de aproximadamente 0.009–0.011 y Brier de aproximadamente 0.253–0.272. Como referencia, KnowLine-26B-A4B-Gen2.5 obtiene ECE de 0.013–0.018 y Brier de 0.24–0.27. Los resultados de la suite pública no cuentan para la puntuación completa desde Decision Index 0.4; este modelo aún no tiene entrada en el board.

## Requisitos de hardware

- Pesos en bf16 de aproximadamente 19,3 GB; la evaluación DI se ejecutó en GPU H20 de 96 GB.
- SGLang reserva por defecto el 85 % de la memoria de la GPU, por encima de los 19,3 GB de pesos.
- Cabe en GPU de consumo con 24 GB de VRAM (por ejemplo, RTX 4090) en bf16, aunque no se documenta una configuración validada para ese hardware.
- Despliegue recomendado con SGLang 0.5.21 y transformers 5.12.1; el front end `knowline_server.py` solo depende de transformers y requests.
- No se documentan opciones para llama.cpp, Ollama ni TGI, ni cuantizaciones GGUF/AWQ/GPTQ.
- Latencia y throughput: no disponibles en la información proporcionada; la lectura doble por defecto duplica el coste por petición respecto a `--no-read-twice`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DI 0.3 público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-9B-Gen2 | 9B denso | no disponible | 69.00 | Apache-2.0 | Hugging Face (transformers, safetensors) |
| KnowLine-35B-A3B-Gen1.5 | 35B MoE (A3B) | no disponible | 70.72 | no disponible | Hugging Face (PelaAI) |
| KnowLine-26B-A4B-Gen2.5 | 26B MoE (A4B) | no disponible | 68.21 | no disponible | Hugging Face (PelaAI) |
| Copernicus-31B | ~31,3B | no disponible | 70.37 | no disponible | Board Decision Index |

Frente a sus hermanos MoE, KnowLine-9B-Gen2 ofrece un tamaño denso menor con una puntuación en la suite pública intermedia entre el 26B-A4B-Gen2.5 y el 35B-A3B-Gen1.5, y una calibración documentada algo mejor que la del 26B-A4B-Gen2.5 en ECE. Los modelos del board superan al 9B en la suite pública, pero con entre tres y seis veces más parámetros.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo responde preguntas tipadas con distribuciones sobre opciones; no es adecuado para tareas generativas.
- No se documentan sesgos conocidos ni evaluación de sesgo en la información disponible.
- Riesgo de alucinación no caracterizado; al tratarse de clasificación probabilística, el riesgo se traslada a etiquetas erróneas con alta confianza.
- Idiomas limitados a inglés y chino (simplificado y tradicional); no hay soporte documentado de castellano.
- La longitud de contexto no se especifica en la información proporcionada; depende del modelo base Qwen3.5-9B.
- El conjunto de entrenamiento no es público, lo que dificulta auditar la composición de los datos y los posibles sesgos de los profesores LLM que etiquetaron los ejemplos.
- La puntuación DI 0.3 es una auto-ejecución con el kit oficial; el modelo no tiene entrada en el board y no está puntuado en DI 0.4.1.
- La lectura doble por defecto duplica el coste de inferencia; desactivarla puede alterar la calibración observada.
- Licencia Apache-2.0 permite uso comercial, pero no se ofrece garantía ni soporte del autor.
- El modelo declara no estar afiliado a TypeSafe, Jev ni Qwen.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-flash-kl2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo hermano KnowLine-26B-A4B-Gen2.5: https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2.5
- Modelo hermano KnowLine-35B-A3B-Gen1.5: https://huggingface.co/PelaAI/KnowLine-35B-A3B-Gen1.5
- Release anterior KnowLine-9B-Gen1: https://huggingface.co/PelaAI/KnowLine-9B-Gen1
- Guía de inferencia (INFERENCE.md): https://huggingface.co/SusanHill/zils-flash-kl2/blob/main/INFERENCE.md
- README en chino: https://huggingface.co/SusanHill/zils-flash-kl2/blob/main/README.zh.md
- Datos oficiales del Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index/blob/main/data/index.json
