# Thox-ai/thox-micro-125m

## Resumen

thox-micro-125m es un modelo de lenguaje de tipo decoder-only entrenado desde cero por THOX.ai LLC, presentado como el miembro de menor tamaño de su línea de investigación de modelos pequeños para dispositivos edge y on-device. Se trata de un modelo base (completion), no de un asistente instruido: la variante de chat se publica por separado como thox-micro-125m-instruct. Con 123.587.328 parámetros reales en pesos safetensors, arquitectura LlamaForCausalLM de 12 capas, dimensión oculta 768 y una ventana de contexto máxima de 1024 tokens, está diseñado para ejecutarse en el hardware propio de THOX y en entornos locales con recursos muy limitados.

Su relevancia actual radica en dos factores. Primero, es un entrenamiento from scratch (sin modelo base upstream), lo que lo convierte en una pieza poco habitual en el ecosistema: la mayoría de modelos de este tamaño son destilaciones o fine-tunes de modelos mayores. Segundo, se distribuye con pesos en safetensors y tres builds GGUF (Q4_0, Q4_K_M y F16), además de un Modelfile para Ollama, lo que facilita el despliegue en CPU, GPUs de gama baja y dispositivos integrados. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

No obstante, conviene calibrar expectativas: con 123M de parámetros y 1024 tokens de contexto, el modelo está pensado para completado de texto dentro del stack THOX, no para razonamiento complejo, tool calling ni tareas de alta fiabilidad factual. El propio autor lo etiqueta como modelo de investigación y recomienda verificar respuestas importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 123.587.328 (123M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F16, Q4_K_M, Q4_0 (GGUF); safetensors en float16 |
| Idiomas soportados | en (ingles; calidad inferior en otros idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (Q4_0, Q4_K_M, F16), Modelfile para Ollama |
| Capas | 12 |
| Dimension oculta | 768 |
| Cabezas de atencion | 12 (MHA completo, sin GQA; 12 KV heads) |
| FFN / intermediate size | 2048 |
| Vocabulario | 50.304 tokens |
| Embeddings atados | si (tied embeddings) |
| dtype de entrenamiento | float16 |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only convencional con atención multi-cabeza completa (12 cabezas de query y 12 de key/value, sin grouped-query attention), 12 capas, dimensión oculta de 768 y FFN de 2048. Usa embeddings atados entre la capa de entrada y la de salida, lo que reduce el número de parámetros efectivos y es coherente con su vocabulario de 50.304 tokens. El dtype declarado es float16. No incorpora innovaciones arquitectónicas destacables: no hay atención lineal, ni decodificación especulativa, ni mezcla de expertos.

El entrenamiento se realizó desde cero por THOX.ai LLC como parte de su línea de investigación de modelos pequeños, sin modelo base externo. La model card no especifica el número de tokens de entrenamiento, la composición del corpus ni si hubo fases de RLHF, DPO o ajuste por instrucciones; únicamente indica que el corpus y el procedimiento son los descritos en la tarjeta en el momento del lanzamiento, lo que en la práctica deja esos detalles sin publicar. El único dato cuantitativo de entrenamiento disponible es la mejor pérdida de validación alcanzada: 2,6099. No se publica ningún resultado del benchmark interno THOX GATE49 para este modelo.

## Capacidades

- Generación de texto y completado de secuencias en inglés, en estilo base (no conversacional).
- Razonamiento y conocimiento factual limitados, propios de un modelo de 123M de parámetros; el autor advierte explícitamente de baja fiabilidad factual.
- No es un modelo instruido: no se ha ajustado para seguir instrucciones ni para mantener diálogos multi-turno (para eso existe thox-micro-125m-instruct).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: únicamente inglés declarado; el rendimiento en otros idiomas es inferior según el autor.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local y on-device: compatible con llama.cpp y Ollama mediante los builds GGUF incluidos.

## Casos de uso

- Autocompletado de texto en dispositivos integrados: el modelo cabe en menos de 100 MB en Q4_0 (81,3 MB) y puede ejecutarse en CPU de dispositivos con poca memoria, ofreciendo sugerencias de completado dentro de aplicaciones locales del ecosistema THOX.
- Procesamiento de texto en el borde sin conexión: al ser un modelo pequeño y con licencia Apache-2.0, puede embeberse en aplicaciones de escritorio o móviles que necesiten generar texto sin enviar datos a la nube, alineado con la propuesta de privacidad local del fabricante.
- Filtrado y clasificación ligera de texto: mediante generación condicionada o scoring de secuencias, útil para tareas de etiquetado simple o normalización de texto en pipelines con restricciones de latencia y memoria.
- Prototipado e investigación de modelos from scratch: sirve como referencia reproducible para estudiar el comportamiento de transformers pequeños entrenados desde cero, incluyendo análisis de pérdida de validación y efectos de cuantización.
- Generación de texto auxiliar en herramientas de desarrollo: por ejemplo, completar plantillas, comentarios o descripciones cortas en editores locales, donde la ventana de 1024 tokens es suficiente para el contexto inmediato.
- Base para fine-tuning específico de dominio: al publicarse pesos completos y tokenizer con licencia permisiva, puede ajustarse en tareas acotadas (por ejemplo, generación de respuestas cortas en un dominio concreto) con recursos de GPU modestos.
- Demostraciones y pruebas de despliegue en Ollama: el Modelfile incluido permite levantar el modelo con `ollama run hf.co/Thox-ai/thox-micro-125m:Q4_K_M` para validar infraestructura de inferencia local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación presente en la model card es la mejor pérdida de validación (2,6099). No hay resultados de MMLU, HumanEval, GSM8K ni de THOX GATE49 para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en F16 (pesos de 247 MB), unos 85 MB en Q4_K_M y unos 81 MB en Q4_0, más overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo está pensado para CPU y aceleradores integrados más que para GPU de datacenter. Funciona en A100, H100 y RTX 4090, pero está sobredimensionado para ellas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU y dispositivos ARM; también en CPU sin aceleración.
- Opciones de despliegue: transformers (AutoModelForCausalLM), llama.cpp, Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF. No se documenta soporte específico para vLLM o TGI más allá de la etiqueta text-generation-inference del repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| thox-micro-125m | 123M | 1024 | Apache-2.0 | safetensors, GGUF, Ollama | Entrenado from scratch; modelo base, solo inglés |
| SmolLM-135M (HuggingFaceTB) | 135M | 2048 | Apache-2.0 | safetensors, GGUF | Entrenado desde cero por Hugging Face; referencia habitual en este rango |
| Qwen2.5-0.5B | 494M | 32.768 | Apache-2.0 | safetensors, GGUF | Cuatro veces mayor; contexto muy superior; multilingüe |
| TinyLlama-1.1B | 1,1B | 2048 | Apache-2.0 | safetensors, GGUF | Orden de magnitud mayor; mayor calidad pero más recursos |

La comparación con SmolLM-135M es la más directa por tamaño y enfoque from scratch, aunque no se dispone de resultados de benchmarks de thox-micro-125m para contrastar rendimiento. Frente a Qwen2.5-0.5B y TinyLlama-1.1B, la ventaja del modelo de THOX es el tamaño mínimo y la integración con su stack, a costa de contexto y capacidades muy reducidas.

## Limitaciones y advertencias

- Modelo base pequeño: comportamiento de completado, sin alineamiento conversacional ni seguimiento de instrucciones; no debe usarse como asistente público sin guardrails.
- Fiabilidad factual baja: el autor recomienda verificar respuestas importantes; riesgo elevado de alucinación en preguntas factuales.
- Sesgos: refleja los datos de entrenamiento, mayoritariamente en inglés; no se documenta ningún proceso de mitigación de sesgos.
- Contexto muy limitado (1024 tokens): insuficiente para documentos largos, conversaciones multi-turno extensas o razonamiento con cadenas largas.
- Idioma: solo inglés declarado; calidad inferior en castellano u otros idiomas.
- Cuantización: los builds de menor precisión degradan más la exactitud; Q4_0 es el más agresivo.
- Uso comercial: permitido por Apache-2.0, pero el modelo se publica como modelo de investigación y sin garantías; fuera de alcance cualquier uso médico, legal, financiero o de seguridad crítica sin revisión humana, así como el control no supervisado de dispositivos físicos.
- La model card incluye promoción de una campaña de Kickstarter del fabricante; conviene separar el contenido técnico del comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/thox-micro-125m
- Variante instruida: https://huggingface.co/Thox-ai/thox-micro-125m-instruct
- Repositorio GGUF: https://huggingface.co/Thox-ai/thox-micro-125m-GGUF
- Demo de dispositivos virtuales THOX: https://thox.ai/#demo-callout-home_lineup
- Campaña Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai?ref=hf-thox-micro-125m
- Informe técnico citado (THOX.ai Research technical report v1.1.0, 4 de noviembre de 2026): no disponible enlace directo en la información proporcionada.
