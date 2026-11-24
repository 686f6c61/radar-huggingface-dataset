# speakleash/Bielik-One-4B-r1

## Resumen

Bielik-One-4B-r1 es un modelo de decisión estructurada desarrollado por SpeakLeash (el proyecto polaco de ciencia abierta detrás de la familia Bielik) mediante fine-tuning del modelo base Qwen/Qwen3.5-4B. Su propósito no es la generación de texto libre, sino responder preguntas tipadas sobre un estado dado: elección entre categorías mutuamente excluyentes (`choice`), probabilidad binaria (`noul`), puntuación ordinal (`score`) y etiquetado multietiqueta independiente (`labels`). Cada respuesta incluye probabilidades calibradas y una medida de confianza, lo que lo hace apto para sistemas de decisión automatizados donde se necesita trazabilidad numérica.

El modelo se distribuye como pesos completos fusionados (merged), sin necesidad de plugin ni LoRA en tiempo de ejecución, y está pensado para servirse con vLLM 0.32.0. Con 4.661.186.048 parámetros, un contexto configurado de 32.768 tokens y licencia Apache 2.0, cubre 30 idiomas (incluido el español) y hereda la modalidad image-text-to-text del base. Es relevante porque ofrece una interfaz de decisión estructurada y calibrada sobre un modelo pequeño que cabe en una sola GPU consumer de gama alta.

La calibración se ajustó únicamente sobre el split de validación con temperaturas específicas por tipo de pregunta, y el modelo se publica junto a un adaptador ligero (~0,7 GB) para quienes ya sirven Qwen3.5-4B y quieren evitar duplicar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-4B; tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.661.186.048 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (perfil por defecto de vLLM) |
| Tipos de cuantizacion | bfloat16 (por defecto, calibrado); FP8 vía `--fp8` (no calibrado) |
| Idiomas soportados | 30: pl, en, es, de, fr, it, pt, nl, da, no, sv, fi, is, et, lv, lt, cs, sk, sl, hr, bs, sr, hbs, bg, ro, hu, el, tr, uk, sq, bel, ru (multilingual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB; librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4B parámetros con capacidad image-text-to-text, y se somete a un fine-tuning orientado a decisiones estructuradas (tag `decision-model`, `structured-decisions`). Los pesos publicados son la fusión completa del fine-tuning, de modo que no requiere adaptadores ni plugins en inferencia; existe además una variante Adapter de ~0,7 GB para despliegues que ya tengan el base cargado.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. Sí se documenta el proceso de calibración: se ajustó una temperatura por tipo de pregunta exclusivamente sobre el split de validación (choice T=1,625; binaria T=1,625; score T=2,878; labels T=0,917), aplicando softmax sobre log-probabilidades para preguntas categóricas y sigmoide por opción para etiquetas. La calibración no altera las decisiones por argmax ni por umbral 0,5, y se ajustó sobre salidas en bfloat16, por lo que no es válida para servicio en FP8.

## Capacidades

- Decisión estructurada con cuatro tipos de pregunta: `choice` (elección única con probabilidades y confianza), `noul` (probabilidad binaria de sí), `score` (nivel ordinal esperado con probabilidades por nivel y leyenda) y `labels` (probabilidad independiente por opción y selección con umbral 0,5).
- Probabilidades calibradas por tipo de pregunta, con opción de desactivar la calibración (`--no-calibration` o `temperature: 1`) para obtener probabilidades crudas.
- Chat general mediante el endpoint `/v1/chat/completions` con el modelo `qwen-general`, ejecutado sobre los pesos fine-tuneados (no sobre una copia intacta del base).
- Modalidad image-text-to-text heredada del base Qwen3.5-4B (pipeline declarado: image-text-to-text).
- Soporte multilingüe en 30 idiomas, incluidos español, inglés, polaco, alemán, francés, italiano, portugués, ruso y ucraniano.
- Compatibilidad con endpoints estilo OpenAI y con vLLM 0.32.0; prefix caching y modo eager en el perfil por defecto.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Gestión de cobros y facturación: clasificar el estado de una factura (`paid`, `overdue`, `not_due`), determinar si venció el plazo y puntuar la urgencia de la acción de cobro en una sola llamada con el endpoint `/v1/systemone`, usando las probabilidades para priorizar la cola de trabajo.
- Triaje de tickets de soporte: asignar categoría mediante `choice` y etiquetar acciones recomendadas (`labels`) de forma independiente, aprovechando la confianza por respuesta para derivar los casos ambiguos a revisión humana.
- Moderación de contenido con umbral explícito: usar preguntas binarias (`noul`) cuya probabilidad calibrada permite fijar umbrales operativos y auditar la tasa de falsos positivos.
- Enrutamiento de decisiones en pipelines: integrar el modelo como clasificador dentro de un flujo automatizado, ya que devuelve claves y probabilidades en JSON estructurado en lugar de texto libre, lo que simplifica el parseo y la validación.
- Evaluación de riesgo crediticio o de impago: puntuaciones ordinales (`score`) sobre niveles definidos por el equipo, con distribución de probabilidad por nivel para alimentar reglas de negocio.
- Extracción de señales en documentos multilingües: al cubrir 30 idiomas, puede aplicarse a estados descritos en español, polaco, alemán o ucraniano sin cambiar de modelo, con contexto de hasta 32.768 tokens para estados largos.
- Asistente conversacional de propósito general: el endpoint de chat sobre los pesos fine-tuneados permite interacción libre cuando no se requiere salida estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El tag `eval-results` aparece en los metadatos del repositorio, pero los valores concretos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12 GB en bfloat16 para el modelo de 4B con los pesos y la caché KV configurada (contexto 32.768, 4 secuencias, 2.048 tokens por lote). Con `--fp8` el peso de los pesos se reduce aproximadamente a la mitad, aunque la calibración deja de ser válida.
- GPU recomendadas: A100, H100 o L40S para servicio en producción con concurrencia; el perfil por defecto usa 4 secuencias simultáneas.
- GPU consumer: cabe en tarjetas con 16 GB o más en bfloat16 (por ejemplo, RTX 4080/4090 de 16-24 GB) y en tarjetas de 12 GB solo con FP8 o reduciendo contexto y secuencias.
- Opciones de despliegue: vLLM 0.32.0 mediante el paquete `bielik-one[vllm]` (backend y frontend separados); también es cargable con transformers al ser safetensors. No se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-One-4B-r1 | 4,66B | 32.768 | Decisión estructurada calibrada sobre Qwen3.5-4B | Apache 2.0 | Hugging Face (pesos merged y adapter) |
| Qwen/Qwen3.5-4B | ~4B | No disponible | Modelo base generalista image-text-to-text | No disponible en la información | Hugging Face |
| Bielik-One-4B-r1-Adapter | ~0,7 GB adicionales | 32.768 | Mismo fine-tuning como adaptador sobre el base | No disponible en la información | Hugging Face (SPKL-Internal) |

No se dispone de datos de rendimiento comparado con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- La calibración se ajustó solo sobre el split de validación y en bfloat16; servir en FP8 (`--fp8`) altera decisiones cercanas al límite y no está calibrado.
- La calibración no modifica las decisiones por argmax ni por umbral 0,5, pero las probabilidades reportadas dependen del orden de opciones estándar; otros órdenes pueden requerir recalibración.
- No hay información publicada sobre sesgos, tasa de alucinación ni evaluación de robustez; al ser un fine-tuning de un modelo generalista, puede heredar sesgos del base Qwen3.5-4B.
- El endpoint de chat general se ejecuta sobre pesos fine-tuneados para decisión, no sobre una copia intacta del base, por lo que su comportamiento conversacional puede diferir del Qwen3.5-4B original.
- El contexto máximo documentado es de 32.768 tokens en el perfil por defecto; no se garantiza un rendimiento equivalente más allá de esa ventana.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar además las condiciones del modelo base Qwen3.5-4B.
- Existe un canal de contacto (biuro@speakleash.org.pl) para solicitudes de protección de datos y derechos de autor, lo que sugiere que el entrenamiento pudo incluir datos sujetos a revisión.
- El ecosistema de despliegue documentado se limita a vLLM 0.32.0 con el paquete `bielik-one`; no se garantiza compatibilidad con otros runners.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-One-4B-r1
- Adaptador ligero: https://huggingface.co/SPKL-Internal/Bielik-One-4B-r1-Adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del paquete de inferencia: https://github.com/speakleash/bielik-one
- Equipo Qwen: https://huggingface.co/Qwen
- Contacto de protección de datos y derechos de autor: biuro@speakleash.org.pl
