# Vortecks/LFM3-1.7B-Heretic-Abliterated-GGUF

## Resumen

LFM3-1.7B-Heretic-Abliterated-GGUF es una variante cuantizada en formato GGUF del modelo LFM3-1.7B de Liquid AI, publicada por el usuario Vortecks en HuggingFace. El modelo base es un modelo de texto para agentes locales y aplicaciones especializadas, construido sobre la arquitectura tri-híbrida de Liquid AI, con una ventana de contexto de 256K tokens y orientado al uso como asistente, tool calling, salidas estructuradas y despliegue en edge.

La particularidad de esta versión es que se trata de una variante "heretic abliterated": se han identificado y ablatado las direcciones de rechazo en el espacio de activaciones del modelo para eliminar su comportamiento de negación incorporado. El resultado es una versión "uncensored" que complirá con un rango más amplio de prompts que la versión instruction-tuned original, pero sin los mecanismos de seguridad habituales.

Todas las cuantizaciones del repositorio se han producido con llama.cpp mediante cuantización estática (sin matriz de importancia). Con aproximadamente 1.729 millones de parámetros y archivos de entre 0,87 GB y 6,92 GB, es un modelo pensado para ejecutarse en hardware de consumo, portátiles y dispositivos edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida (Liquid AI LFM3), no disponible el detalle exacto de capas |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | F32, F16, BF16, Q8_0, Q6_K, Q5_1, Q5_K_M, Q5_K_S, Q5_0, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M y otras cuantizaciones bajas |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (licencia "other", vinculada a la licencia de LiquidAI/LFM3-1.7B) |
| Formato de pesos | GGUF (cuantización estática con llama.cpp, sin matriz de importancia) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B de Liquid AI emplea la nueva arquitectura tri-híbrida de la compañía, diseñada para agentes locales, uso conversacional cotidiano, tool calling, salidas estructuradas y trabajo con contextos largos de hasta 256K tokens. La model card no detalla la composición exacta de la arquitectura híbrida (por ejemplo, la proporción de capas de atención, convolucionales o de estado), ni el número de tokens de entrenamiento ni la composición del dataset, por lo que estos datos no están disponibles.

Sobre el modelo base instruction-tuned, Vortecks ha aplicado un proceso de abliteración "heretic": se identifican las direcciones de rechazo en el espacio de activaciones del modelo y se eliminan mediante ablación, suprimiendo el comportamiento de negación aprendido durante el alignment. No se trata de un reentrenamiento completo sino de una modificación quirúrgica de las activaciones. Las cuantizaciones se generaron posteriormente con llama.cpp en modo estático, sin uso de matriz de importancia (imatrix), lo que puede implicar una ligera pérdida de calidad en las cuantizaciones bajas respecto a versiones con imatrix.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a uso como asistente cotidiano.
- Tool calling / function calling, heredado del modelo base instruction-tuned de Liquid AI.
- Salidas estructuradas (structured outputs), útil para integración en pipelines y agentes.
- Trabajo con contextos largos gracias a la ventana de 256K tokens.
- Comportamiento "uncensored": al haberse ablatado las direcciones de rechazo, el modelo responde a un rango de prompts más amplio que la versión original, sin guardrails de seguridad.
- Capacidades multilingües en 16 idiomas, entre ellos español, inglés, chino, árabe, japonés, coreano, francés, alemán, portugués, ruso, hindi y otros.
- Diseñado para despliegue en edge y ejecución local mediante llama.cpp.

## Casos de uso

- Asistentes locales sin filtrado: para investigadores que estudian el comportamiento de modelos sin alignment o necesitan respuestas a prompts que los modelos comerciales rechazan, ejecutándose íntegramente en local con Q4_K_M (1,10 GB).
- Agentes locales con tool calling: el modelo base está diseñado para agentes; su pequeño tamaño permite mantenerlo residente en memoria mientras orquesta llamadas a herramientas y salidas estructuradas en flujos multi-paso.
- Procesamiento de documentos largos en portátiles: la ventana de 256K tokens permite analizar documentos extensos (contratos, informes, código) sin dividir el contenido, ejecutándose con solo unos GB de RAM/VRAM.
- Chatbots multilingües en edge: soporte de 16 idiomas y tamaño reducido lo hacen adecuado para despliegues en dispositivos con recursos limitados (Raspberry Pi, mini PCs, móviles de gama alta vía llama.cpp).
- Investigación en seguridad y abliteración: al ser una variante "heretic" derivada de un modelo público, sirve como caso de estudio para comparar el efecto de la ablación de direcciones de rechazo frente al modelo base de Liquid AI.
- Prototipado rápido de aplicaciones LLM: los archivos de ~1 GB en Q4 permiten iterar rápidamente en desarrollo local sin coste de API, integrándose con herramientas como Ollama o LM Studio.
- Generación de texto por lotes en servidores modestos: en un servidor con GPU de gama media se pueden ejecutar múltiples instancias concurrentes dada la baja huella de memoria por instancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos, ni datos de rendimiento de la variante abliterada frente al modelo base. Para evaluar el rendimiento del modelo base puede consultarse la ficha de LiquidAI/LFM3-1.7B.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización Q4_K_M ocupa 1,10 GB y Q6_K 1,43 GB; con contexto largo (256K tokens) el consumo de memoria KV crece significativamente, por lo que se recomienda disponer de al menos 4-8 GB de RAM/VRAM unificada para uso general y más para contextos extremos.
- GPU recomendadas: no requiere GPU; cualquier GPU con 2-4 GB de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4060) ejecuta las cuantizaciones Q4-Q6 con holgura. En Apple silicon (M1/M2/M3/M4) funciona eficientemente con memoria unificada; Q4_1 ofrece mejor tokens/watt en Apple silicon según la model card.
- Consumer GPU: cabe sobradamente en prácticamente cualquier GPU moderna de consumo; incluso puede ejecutarse solo en CPU gracias a llama.cpp, con repacking online para ARM y AVX en Q4_0 e IQ4_NL.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y cualquier runtime compatible con GGUF. No hay indicación de soporte directo en vLLM o TGI para estos archivos GGUF.
- Latencia y throughput: no disponible; al ser un modelo de 1,7B parámetros, se espera inferencia rápida incluso en CPU, pero no hay mediciones publicadas en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Vortecks/LFM3-1.7B-Heretic-Abliterated-GGUF | 1,73B | 256K | lfm1.0 (other) | Abliterado, uncensored, GGUF estático |
| LiquidAI/LFM3-1.7B (base) | 1,73B | 256K | lfm1.0 | Versión original con alignment y guardrails |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K-128K (según variante) | Apache 2.0 / Qwen | Alternativa abierta con alignment estándar, sin abliterar |
| Llama-3.2-1B-Instruct | 1,24B | 128K | Llama 3.2 Community | Alternativa de Meta para edge, con guardrails |

Frente a sus alternativas, este modelo destaca por su ventana de contexto de 256K tokens (mayor que la de Qwen2.5-1.5B y Llama-3.2-1B en sus versiones estándar) y por la ausencia de mecanismos de rechazo, mientras que las alternativas mantienen alignment de seguridad y licencias más permisivas para uso comercial.

## Limitaciones y advertencias

- Al tratarse de una variante abliterada, el modelo carece de guardrails de seguridad: puede generar contenido ofensivo, peligroso o inapropiado. No es adecuado para entornos de producción orientados a usuarios finales sin capas de moderación externas.
- La abliteración puede degradar la calidad general del modelo o introducir comportamientos erráticos en comparación con la versión instruction-tuned original de Liquid AI; no se han publicado evaluaciones que cuantifiquen esta degradación.
- Las cuantizaciones son estáticas, sin matriz de importancia, lo que puede reducir la calidad especialmente en cuantizaciones bajas (Q3 e IQ3).
- La licencia es "other" (lfm1.0), heredada de LiquidAI/LFM3-1.7B; debe revisarse la licencia original en el enlace proporcionado antes de cualquier uso comercial, ya que puede incluir restricciones.
- Riesgo de alucinación: no disponible como dato específico, pero como todo modelo de lenguaje pequeño (1,7B), la fiabilidad factual es limitada.
- La calidad en idiomas distintos del inglés puede ser inferior; el español está soportado pero no hay datos de rendimiento por idioma.
- Los datos de benchmarks y de rendimiento de la arquitectura tri-híbrida no están disponibles en la model card de este repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated-GGUF
- Modelo base abliterado (safetensors): https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Web de Liquid AI: https://www.liquid.ai
