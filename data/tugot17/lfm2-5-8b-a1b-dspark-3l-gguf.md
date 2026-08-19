# tugot17/LFM2.5-8B-A1B-DSpark-3L-GGUF

## Resumen

LFM2.5-8B-A1B-DSpark-3L-GGUF es un modelo auxiliar de decodificación especulativa (draft model) desarrollado por tugot17, diseñado como un sidecar GGUF para el modelo principal LFM2.5-8B-A1B de Liquid AI. No es un modelo de lenguaje autónomo: su función es acelerar la inferencia del modelo base mediante la técnica DFlash/DSpark, implementada en llama.cpp desde la versión que incorpora el merge #25173. El drafter predice secuencias de tokens candidatas que el modelo principal verifica en paralelo, reduciendo la latencia sin alterar los resultados finales.

Este sidecar contiene únicamente el drafter de 3 capas (bloque GQA estilo Qwen3, cabeza de transición Markov de rango 256 y cabeza de confianza), mientras que las embeddings y la cabeza de salida (lm_head) se comparten con el modelo objetivo en tiempo de carga. Con 231 millones de parámetros y un peso de solo 0,5 GB en formato GGUF, es extremadamente ligero y puede ejecutarse junto al modelo base en dispositivos con recursos limitados. Su relevancia radica en que permite desplegar el modelo MoE de 8B (1,5B activos) de Liquid AI con un coste adicional mínimo, manteniendo la calidad de generación idéntica al modelo solo.

La fecha de creación (agosto de 2026) indica que es una herramienta reciente dentro del ecosistema de decodificación especulativa de llama.cpp. Aunque la licencia no está disponible en la información proporcionada, el uso previsto es como complemento del modelo base de Liquid AI, que tiene su propia licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de 3 capas (GQA estilo Qwen3) con cabeza Markov de rango 256 y cabeza de confianza |
| Parametros totales | 231.230.081 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica directamente; hereda la del modelo objetivo (128K tokens) |
| Tipos de cuantizacion | f16 (según el nombre del archivo: LFM2.5-8B-A1B-DSpark-3L-draft-f16.gguf) |
| Idiomas soportados | No disponibles para el drafter; el modelo base soporta multilingüe |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El drafter emplea una arquitectura de bloques GQA (Grouped Query Attention) similar a la de Qwen3, con 3 capas. Incorpora una cabeza de transición Markov de bajo rango (rank 256) que modela la distribución de tokens candidatos, y una cabeza de confianza que estima la probabilidad de aceptación de cada token por el modelo principal. Esta combinación permite generar secuencias de hasta 8 tokens (según el parámetro `--spec-draft-n-max`) que el modelo objetivo verifica en paralelo, logrando una aceleración significativa en la inferencia.

El entrenamiento específico del drafter no está documentado en la información disponible. Sin embargo, por su naturaleza de sidecar, se infiere que fue entrenado para maximizar la tasa de aceptación de tokens del modelo LFM2.5-8B-A1B, probablemente mediante un proceso de destilación o ajuste fino supervisado sobre las salidas del modelo base. La integración con llama.cpp se realiza mediante la conversión con `convert_hf_to_gguf.py` y la carga conjunta con el modelo objetivo usando `-md` (model draft) y `--spec-type draft-dspark`.

## Capacidades

- Decodificación especulativa DSpark/DFlash: genera secuencias de tokens candidatas (hasta 8) que aceleran la inferencia del modelo base sin cambiar los resultados greedy.
- Compartición de embeddings y lm_head: el drafter no duplica pesos, sino que reutiliza los del modelo objetivo en tiempo de carga.
- Compatibilidad con llama.cpp: funciona con `llama-server` y `llama-cli` mediante los parámetros `--spec-type draft-dspark` y `--spec-draft-n-max`.
- Seguimiento de aceptación: el campo `timings` de las respuestas reporta `draft_n` y `draft_n_accepted`, permitiendo monitorizar la eficiencia de la decodificación.
- No tiene capacidades autónomas de generación, razonamiento, tool calling ni visión; todas las capacidades funcionales corresponden al modelo base LFM2.5-8B-A1B.

## Casos de uso

- Inferencia en dispositivos edge y móviles: al añadir este sidecar al modelo base, se reduce la latencia de generación, lo que permite ejecutar el LFM2.5-8B-A1B en hardware con recursos limitados (por ejemplo, smartphones o mini-PCs) manteniendo la calidad de las respuestas.
- Servidores de chat con alta concurrencia: en despliegues con llama.cpp, el drafter acelera el tiempo de respuesta por petición, aumentando el throughput sin necesidad de GPUs adicionales.
- Aplicaciones de tool calling en tiempo real: el modelo base es conocido por su rapidez en tool calling; el drafter refuerza esta ventaja reduciendo el tiempo de generación de las llamadas a funciones.
- Prototipado y experimentación con decodificación especulativa: este sidecar sirve como referencia para desarrolladores que quieran implementar o comparar técnicas DSpark en sus propios modelos.
- Asistentes conversacionales con contexto largo: con la ventana de 128K del modelo base, el drafter permite mantener conversaciones extensas con menor latencia acumulada.
- Despliegue en entornos de producción con requisitos de latencia estrictos: por ejemplo, en atención al cliente automatizada o asistentes de código, donde la velocidad de respuesta es crítica y el presupuesto de hardware es ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este drafter en la información disponible. El modelo base LFM2.5-8B-A1B, según el blog de Liquid AI, reporta mejoras en benchmarks de tool calling y razonamiento, pero no se proporcionan cifras concretas en los resultados de búsqueda. Para evaluar el rendimiento del drafter, se recomienda medir la tasa de aceptación de tokens (`draft_n_accepted` / `draft_n`) y la reducción de latencia en una carga de trabajo representativa.

## Requisitos de hardware

- VRAM adicional: el drafter pesa 0,5 GB en f16, por lo que requiere aproximadamente 0,5 GB de VRAM adicional al modelo base. El modelo base (8B MoE con 1,5B activos) necesita típicamente entre 6-10 GB en cuantizaciones Q4/Q5, por lo que el conjunto puede caber en GPUs consumer de 8-12 GB.
- GPU recomendadas: cualquier GPU compatible con llama.cpp, desde una RTX 3060 (12 GB) hasta una A100 o H100 para despliegues de mayor escala. Para uso en CPU, también es viable gracias al bajo coste del drafter.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), llama-cpp-python, y cualquier frontend que use llama.cpp como backend (Ollama, LM Studio, etc.).
- Latencia y throughput: no hay datos publicados específicos para este drafter. Se espera una reducción de latencia de 1.5x a 3x en tareas de generación de texto, dependiendo del hardware y la longitud de las secuencias generadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B-DSpark-3L (este) | 231M | 128K (heredado) | Drafter 3L | No disponible | GGUF en HF |
| LFM2.5-8B-A1B-DSpark-2L | No disponible | 128K (heredado) | Drafter 2L | No disponible | HF |
| LFM2.5-8B-A1B-DSpark-5L | No disponible | 128K (heredado) | Drafter 5L | No disponible | HF |
| Modelo base LFM2.5-8B-A1B | 8B (1.5B activos) | 128K | MoE | Licencia Liquid AI | HF, GGUF |

Los drafter de 2L, 3L y 5L son variantes del mismo enfoque DSpark, diferenciándose en el número de capas. Un mayor número de capas puede ofrecer una mejor tasa de aceptación a costa de más recursos, mientras que menos capas son más ligeros. No hay datos comparativos de rendimiento publicados entre estas variantes.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base LFM2.5-8B-A1B (GGUF) para funcionar; no puede generar texto por sí mismo.
- Compatibilidad restringida: solo funciona con versiones de llama.cpp que incluyan el soporte DSpark/DFlash (merge #25173 o posterior). No es compatible con otras librerías como vLLM o TGI sin adaptaciones.
- Licencia incierta: la licencia del drafter no está especificada. Se debe verificar la licencia del modelo base de Liquid AI antes de usar en producción comercial.
- Riesgo de alucinación y sesgos: no aplican directamente al drafter, pero el modelo base puede presentar estos problemas; el drafter no los mitiga.
- Rendimiento variable: la aceleración depende de la tasa de aceptación, que puede variar según el tipo de tarea y el contenido generado. En tareas con patrones poco predecibles, la ganancia puede ser marginal.
- Sin soporte de cuantización adicional: el drafter solo se distribuye en f16; no hay versiones cuantizadas a menor precisión en el repositorio.

## Enlaces

- Repositorio del drafter: https://huggingface.co/tugot17/LFM2.5-8B-A1B-DSpark-3L-GGUF
- Modelo base (GGUF): https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF
- Modelo base (safetensors): https://huggingface.co/tugot17/LFM2.5-8B-A1B-DSpark-3L
- Documentación del modelo base: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Blog de Liquid AI sobre LFM2.5-8B-A1B: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Variante 2L del drafter: https://huggingface.co/tugot17/LFM2.5-8B-A1B-DSpark-2L
- Variante 5L del drafter: https://huggingface.co/tugot17/LFM2.5-8B-A1B-DSpark-5L-GGUF
