# spkc83/retail-bank-servicing-agent-9b-peft-v11-alignment

## Resumen

Este modelo es un adaptador LoRA (PEFT) de tipo BF16, con rango 32 y alpha 64, entrenado sobre el modelo base `spkc83/retail-bank-servicing-agent-9b`, que cuenta con aproximadamente 8.800 millones de parámetros. El adaptador se ha afinado con un conjunto de datos sintético de atención al cliente en banca minorista, compuesto por 3.803 registros de entrenamiento y 445 de validación, y está diseñado para demostrar un caso de uso de servicio al cliente bancario con soporte de tool calling en formato JSON etiquetado.

El modelo está pensado exclusivamente como una prueba de concepto (POC) sintética para banca minorista. No tiene acceso a sistemas bancarios reales, no ofrece asesoramiento financiero y puede cometer errores en la selección de herramientas o en las respuestas. Su relevancia radica en mostrar cómo un adaptador LoRA ligero puede especializar un modelo de 9B en tareas conversacionales con herramientas, manteniendo la licencia Apache 2.0 y un tamaño de repositorio de solo 0,4 GB (solo el adaptador, sin pesos fusionados).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base de ~8,8B parámetros, arquitectura no especificada) |
| Parametros totales | ~8.800 millones (modelo base) + adaptador LoRA (rango 32, alpha 64) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (máxima secuencia de entrenamiento) |
| Tipos de cuantizacion | BF16 (adaptador LoRA); no se especifican otras cuantizaciones |
| Idiomas soportados | No disponible (probablemente inglés, pero no se indica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA BF16) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) en formato BF16, con rango 32 y alpha 64, entrenado sobre el modelo base `spkc83/retail-bank-servicing-agent-9b` en la revisión `1d56824995aa1adecfe20f62ca42fb1c0c443817`. El modelo base tiene aproximadamente 8.800 millones de parámetros y utiliza un formato nativo de llamada a herramientas basado en JSON etiquetado. El adaptador se entrenó con el dataset `spkc83/retail-bank-servicing-alignment-sft` (revisión `b5ec0489f96cf783a0bc993bc29898c6e9b35ba5`), que contiene 3.803 registros de entrenamiento y 445 de validación, con un manifiesto de nueve herramientas sintéticas de banca minorista.

El entrenamiento utilizó enmascaramiento de objetivos solo para spans de llamada a herramienta y respuesta final del asistente, con una longitud máxima de secuencia de 2048 tokens y 2000 pasos de optimizador. El repositorio contiene únicamente el adaptador entrenado, sin pesos fusionados ni `config.json`; debe cargarse con `PeftModel.from_pretrained(base, repo, revision=...)` sobre el modelo base en la revisión fijada. El adaptador también está duplicado en el subdirectorio `adapter/`.

## Capacidades

- Generación de texto conversacional orientada a servicio al cliente bancario.
- Soporte de tool calling mediante formato JSON etiquetado, con nueve herramientas sintéticas de banca minorista (por ejemplo, consulta de saldo, transferencias, gestión de tarjetas, etc., aunque el manifiesto exacto no se detalla en la documentación).
- Capacidad de razonamiento multi-turno en conversaciones de atención al cliente, limitada a la ventana de contexto de 2048 tokens.
- Especialización en dominios de banca minorista gracias al ajuste fino con datos sintéticos.
- No se especifican capacidades de visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Demostración de un asistente virtual bancario: el modelo puede gestionar conversaciones de atención al cliente simuladas, respondiendo a consultas sobre saldos, movimientos o productos bancarios usando las herramientas sintéticas definidas en el manifiesto.
- Prueba de concepto de tool calling en entornos financieros: sirve para validar la sintaxis de llamadas a herramientas y la generación de argumentos JSON en un dominio regulado, antes de integrarlo con sistemas reales.
- Evaluación de adaptadores LoRA para especialización vertical: permite estudiar cómo un adaptador ligero (0,4 GB) modifica el comportamiento de un modelo base de 9B en tareas específicas, útil para investigación en fine-tuning eficiente.
- Desarrollo de agentes conversacionales con backend simulado: el modelo puede conectarse a un backend ficticio que ejecute las herramientas y devuelva resultados, demostrando un flujo completo de agente sin riesgos reales.
- Entrenamiento de modelos de atención al cliente con datos sintéticos: sirve como referencia para generar datasets sintéticos de banca y evaluar la alineación de respuestas con políticas de servicio.
- Investigación en alineación de modelos para dominios específicos: el adaptador se entrenó con enmascaramiento de objetivos en spans de herramienta y respuesta final, lo que lo hace útil para estudiar técnicas de alineación en contextos de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de rendimiento (como MMLU, HumanEval o GSM8K) ni comparaciones con otros modelos. La evaluación debe realizarse de forma independiente, centrándose en la corrección de las llamadas a herramientas, la validez de los argumentos JSON, la ejecución del backend y la calidad de las respuestas finales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de ~8,8B parámetros en BF16 requiere aproximadamente 17,6 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV. Con cuantización 4-bit (no disponible en el adaptador, pero posible en el base) podría reducirse a ~5-6 GB, aunque no se proporcionan configuraciones oficiales.
- GPU recomendadas: para inferencia en BF16, se necesitan GPUs con al menos 24 GB de VRAM, como NVIDIA RTX 3090, RTX 4090, A10G, A100 (40 GB) o H100. Para cuantización 4-bit, una RTX 3060 (12 GB) o RTX 4070 (12 GB) podría ser suficiente, pero no está verificado.
- El adaptador LoRA es muy ligero (0,4 GB) y no añade requisitos significativos de VRAM adicionales.
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse con la librería `peft` sobre el modelo base. Se puede servir con frameworks como vLLM o TGI si se fusionan los pesos, o mediante `transformers` + `peft` para inferencia en Python. También es posible exportar a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado datos. Se espera una latencia típica de un modelo de 9B en GPU (del orden de 20-50 tokens/s en una RTX 4090 con cuantización, pero sin confirmación).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. El modelo base `spkc83/retail-bank-servicing-agent-9b` no está documentado en fuentes públicas más allá de los repositorios del autor, y no se han publicado comparaciones con otros modelos de 8-9B como Llama 3.1 8B, Mistral 7B o Qwen 2.5 7B. Se recomienda evaluar el modelo frente a alternativas de tamaño similar en tareas de tool calling y conversación bancaria, pero no hay datos disponibles para una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo es exclusivamente para una demostración sintética de banca minorista; no debe usarse con sistemas bancarios reales ni para tomar decisiones financieras.
- No proporciona asesoramiento financiero y puede generar afirmaciones no respaldadas o seleccionar herramientas incorrectas.
- La ventana de contexto está limitada a 2048 tokens, lo que restringe conversaciones muy largas o con mucho historial.
- No se especifican los idiomas soportados; probablemente esté entrenado principalmente en inglés, pero no hay confirmación.
- El adaptador no incluye pesos fusionados ni `config.json`; requiere cargar el modelo base en la revisión exacta indicada, lo que puede complicar el despliegue si esa revisión no está disponible.
- No se han publicado evaluaciones de sesgos, alucinaciones o comportamiento fuera de distribución (OOD). El autor recomienda evaluar la sintaxis de tool-call, los argumentos, la ejecución del backend, las respuestas finales y el comportamiento multi-turno antes de cualquier uso.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción y carece de garantías.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v11-alignment
- Modelo base: https://huggingface.co/spkc83/retail-bank-servicing-agent-9b
- Dataset de entrenamiento: https://huggingface.co/datasets/spkc83/retail-bank-servicing-alignment-sft
- Repositorio GitHub del proyecto: https://github.com/spkc83/retail-bank-servicing
- Variante anterior (v9-scratch): https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v9-scratch
