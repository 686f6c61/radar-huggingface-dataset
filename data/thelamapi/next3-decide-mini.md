# thelamapi/Next3-Decide-Mini

## Resumen

Next3-Decide-Mini es un modelo de lenguaje de 596 millones de parámetros derivado de Qwen/Qwen3-0.6B mediante fine-tuning y posterior fusión de pesos con `merge_and_unload()`, lo que produce un checkpoint autónomo cargable directamente con `transformers` sin necesidad de adaptadores PEFT. Lo publica el usuario thelamapi en Hugging Face bajo licencia Apache 2.0 y está especializado en un dominio muy acotado: emitir decisiones estructuradas de tipo A/B con justificación, en formato JSON con las claves `choice`, `reason`, `tradeoff` y `confidence`.

El modelo no pretende ser un sistema de razonamiento de frontera ni un ranking factual fiable; su propio autor lo describe como una prueba de concepto entrenada sobre 11.400 ejemplos de entrenamiento y 600 de validación, en su mayoría decisiones numéricas A/B generadas programáticamente. Declara soporte para ocho idiomas (turco, inglés, alemán, francés, español, portugués, árabe e hindi), aunque el modelo base puede cubrir más.

Su relevancia es limitada y muy específica: sirve como ejemplo de pipeline de fine-tuning + merge para producir salidas estructuradas con un modelo pequeño, desplegable en hardware modesto, más que como herramienta de producción general. No hay descargas ni likes registrados en el momento de la ficha, y la fecha de creación indicada es 2026-11-17.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B); detalles internos no disponibles |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-0.6B, sin confirmar en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | tr, en, de, fr, es, pt, ar, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 1,2 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-0.6B |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 0,6 mil millones de parámetros obtenido por fine-tuning del checkpoint Qwen/Qwen3-0.6B. El autor indica que los pesos resultantes se fusionaron con `merge_and_unload()`, lo que implica que el ajuste se realizó con adaptadores (probablemente LoRA) y después se integraron en los pesos completos. El resultado es un checkpoint estándar que se carga con `AutoModelForCausalLM.from_pretrained(...)` sin PEFT.

El conjunto de entrenamiento consta de 11.400 ejemplos de entrenamiento y 600 de validación, descritos como "decisiones A/B numéricas hipotéticas generadas mayoritariamente de forma programática". No se especifica el número de tokens, la composición exacta del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. El autor advierte explícitamente que una ejecución de 30 pasos es "una prueba de humo, no un lanzamiento entrenado", lo que sugiere un proceso de ajuste muy corto y sin validación extensa. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en ocho idiomas declarados: turco, inglés, alemán, francés, español, portugués, árabe e hindi.
- Producción de salida estructurada en JSON con las claves `choice` (valores `A`, `B` o `INSUFFICIENT`), `reason`, `tradeoff` y `confidence`.
- Toma de decisiones A/B sobre escenarios, en principio de naturaleza numérica o comparativa.
- Respuesta en el idioma del usuario, según la instrucción de la model card.
- Comparaciones legítimas sin rechazos innecesarios, según la directriz de entrenamiento declarada.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Prototipado de sistemas de decisión A/B: el modelo devuelve un JSON con `choice`, `reason`, `tradeoff` y `confidence`, lo que permite integrarlo en un pipeline que parsee la respuesta y registre la justificación de cada decisión en un formato uniforme.
- Experimentación académica sobre salidas estructuradas: sirve como caso de estudio de cómo un modelo de 0,6 B puede ajustarse para emitir JSON con un esquema fijo, útil para comparar técnicas de fine-tuning y merge de adaptadores.
- Pruebas de pipelines multilingües ligeros: al declarar ocho idiomas, permite validar el enrutamiento por idioma y la calidad de respuestas en turco, árabe o hindi sin desplegar un modelo grande.
- Generación de borradores de comparaciones con trade-offs: para tareas internas de documentación donde se necesita un texto breve que exponga ventajas y desventajas de dos opciones, con la advertencia de que las cifras deben verificarse.
- Evaluación de infraestructura de inferencia: con 596 M de parámetros y 1,2 GB en safetensors, es adecuado para medir latencia y throughput en GPUs de gama baja o incluso en CPU antes de escalar a modelos mayores.
- Docencia y demos de fine-tuning: su tamaño reducido y su licencia Apache 2.0 permiten usarlo en talleres donde se muestra el ciclo completo de ajuste, fusión de pesos y carga con `transformers`.
- Filtro de preclasificación en flujos con revisión humana: puede emitir `INSUFFICIENT` cuando no hay datos para decidir, lo que encaja como primera etapa antes de derivar el caso a un revisor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6-0,8 GB para pesos; en 4 bits, alrededor de 0,3-0,4 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente; en centro de datos, A100 o H100 no aportan ventaja relevante por el tamaño del modelo.
- Cabe en GPU consumer: sí, con margen amplio, incluidas GPUs de portátil con 6-8 GB.
- Opciones de despliegue: `transformers` (soporte nativo declarado), text-generation-inference (tag `text-generation-inference` en el repo) y endpoints compatibles (tag `endpoints_compatible`). El uso con vLLM, llama.cpp u Ollama no está documentado en la información disponible; requeriría conversión a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles. Por el tamaño, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Next3-Decide-Mini | 596 M | no disponible | 8 (tr, en, de, fr, es, pt, ar, hi) | Apache 2.0 | Decisiones A/B en JSON |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible en esta ficha | multilingüe (según modelo base) | Apache 2.0 | Modelo generalista |
| Qwen2.5-0.5B-Instruct | 0,5 B | no disponible en esta ficha | multilingüe | Apache 2.0 | Instrucciones generales |

La comparación con alternativas de la misma categoría (modelos de ~0,5-0,6 B) es limitada porque no hay benchmarks publicados para Next3-Decide-Mini. Frente a Qwen3-0.6B, la diferencia es la especialización en salida JSON de decisión y el proceso de merge; frente a Qwen2.5-0.5B-Instruct, el enfoque es mucho más estrecho y no cubre instrucciones generales con la misma amplitud.

## Limitaciones y advertencias

- El autor declara explícitamente que no es un modelo de razonamiento de frontera ni un sistema fiable de ranking factual; las decisiones pueden ser arbitrarias o incorrectas.
- Entrenamiento sobre datos sintéticos generados programáticamente: probable sobreajuste al formato y escasa generalización a decisiones del mundo real.
- Proceso de ajuste descrito por el propio autor como prueba de humo (30 pasos), sin validación extensa publicada.
- Riesgo alto de alucinación en `reason` y `tradeoff`: los textos de justificación pueden contener afirmaciones no fundamentadas.
- El valor `INSUFFICIENT` existe, pero no hay datos sobre su fiabilidad ni sobre la calibración de `confidence`.
- Cobertura idiomática declarada por el autor, no verificada con evaluaciones; el rendimiento en árabe o hindi puede ser inferior al de inglés o turco.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte que los datos de entrenamiento no se distribuyen con los pesos y que debe verificarse los derechos y la privacidad de cualquier dato propio incorporado.
- Sin descargas ni likes en el momento de la ficha: no hay evidencia de uso en producción ni de revisión por la comunidad.
- No se documenta la longitud de contexto efectiva tras el fine-tuning; conviene no asumir la del modelo base sin probarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next3-Decide-Mini
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
