# trunght6605/KimochiSushi-Qwen2.5-3B-Instruct-Merged-qwen-nf4-s42

## Resumen

KimochiSushi-Qwen2.5-3B-Instruct-Merged-qwen-nf4-s42 es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct de Alibaba, publicado por el usuario trunght6605 en Hugging Face. Se trata de un asistente virtual de atención al cliente (CSKH) para el restaurante japonés Kimochi Sushi, entrenado mediante PEFT y posteriormente fusionado (merged) en pesos de 16 bits, según indica la model card del autor. El modelo está especializado en vietnamita y su propósito es gestionar conversaciones de atención al cliente en ese dominio concreto.

El modelo conserva la arquitectura y el tamaño del Qwen2.5-3B-Instruct original: 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), lo que lo sitúa en la gama de modelos pequeños aptos para inferencia en hardware de consumo. Al estar fusionado en 16 bits, el repositorio ocupa 6,2 GB, coherente con pesos en safetensors de precisión media (bf16/fp16). No se publican en la información disponible datos sobre el corpus de entrenamiento, el número de tokens utilizados ni los hiperparámetros del ajuste.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y sin pipeline declarado. Resulta útil como ejemplo de adaptación de un modelo base pequeño a un caso de uso vertical (atención al cliente de restauración) y como referencia para quienes quieran replicar el proceso de fine-tuning y fusión con Qwen2.5-3B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2), según el modelo base Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos fusionados en 16 bits; el nombre del checkpoint hace referencia a una configuración nf4 durante el entrenamiento) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer causal denso de la familia Qwen2.5 con 3,09 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con PEFT (adaptadores de bajo rango, presumiblemente LoRA o QLoRA dado el sufijo "qwen-nf4-s42" del checkpoint), y posteriormente los adaptadores se fusionaron en los pesos del modelo base, generando un checkpoint completo en 16 bits listo para usarse directamente con `pipeline` o `vLLM`, tal como indica el autor.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas específicas más allá de la fusión de adaptadores. El identificador "qwen-nf4-s42" sugiere una configuración de cuantización NF4 (4 bits) con una semilla o configuración concreta (s42), pero no se detalla el proceso. El ajuste está orientado a un dominio muy específico: la atención al cliente del restaurante Kimochi Sushi en vietnamita.

## Capacidades

- Generación de texto conversacional en vietnamita, orientada a atención al cliente de un restaurante japonés.
- Herencia de las capacidades generales del modelo base Qwen2.5-3B-Instruct (razonamiento básico, código y matemáticas elementales), aunque no se documenta su preservación tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este ajuste concreto (el modelo base Qwen2.5-Instruct sí lo soporta).
- Soporte de agentes y razonamiento multi-paso: no documentado para este ajuste.
- Capacidades multilingües: limitadas al vietnamita según la etiqueta de idioma declarada; no se confirma el mantenimiento del multilingüismo del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Atención al cliente automatizada del restaurante Kimochi Sushi: el modelo está entrenado específicamente para gestionar conversaciones de CSKH en vietnamita, respondiendo a preguntas de clientes sobre el servicio.
- Respuesta a consultas frecuentes (horarios, reservas, menú): al estar ajustado sobre el dominio del restaurante, puede ofrecer respuestas coherentes con el contexto del negocio, aunque la calidad depende del dataset de ajuste no documentado.
- Asistente virtual embebido en web o mensajería: al ser un modelo de 3B parámetros fusionado en 16 bits, puede desplegarse con `vLLM` o `pipeline` en infraestructura modesta para dar servicio conversacional en vietnamita.
- Prototipado rápido de chatbots verticales: sirve como plantilla para replicar el flujo de fine-tuning PEFT más fusión sobre Qwen2.5-3B-Instruct en otros dominios de restauración o retail.
- Filtrado y clasificación de consultas de clientes: puede usarse para categorizar mensajes entrantes y derivarlos al departamento adecuado dentro de un flujo de atención.
- Base para evaluación comparativa de ajustes de nicho: útil en investigación para medir cómo un fine-tuning de dominio afecta a las capacidades generales del modelo base (olvido catastrófico, degradación multilingüe).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 6,2 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica, entre 8 y 10 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 3,5-4 GB de pesos.
- VRAM estimada en cuantización de 4 bits (GGUF/AWQ/GPTQ): en torno a 2-2,5 GB de pesos.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A10, L4 o A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en 16 bits (RTX 3060 Ti/3070/4060 Ti y superiores); en 4 bits cabe en GPUs de 4-6 GB.
- Opciones de despliegue: `transformers` con `pipeline`, `vLLM` (indicado por el autor), y previsiblemente llama.cpp/Ollama si se generan cuantizaciones GGUF a partir de los pesos safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KimochiSushi-Qwen2.5-3B-Instruct-Merged-qwen-nf4-s42 | 3,09 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste de nicho en vietnamita, sin benchmarks |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (modelo base) | Apache 2.0 | Hugging Face (ampliamente usado) | Modelo base multilingüe con benchmarks publicados |
| Llama 3.2 3B Instruct | 3,2 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar, licencia con restricciones |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | Hugging Face | Alternativa de tamaño similar, orientada a razonamiento |

## Limitaciones y advertencias

- Modelo de nicho sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente al modelo base ni frente a alternativas.
- Riesgo de alucinación: como todo modelo generativo de 3B parámetros, puede inventar información sobre el restaurante (menú, precios, horarios) si no se ancla con datos externos.
- Sesgos: no documentados; el ajuste sobre un dominio único puede introducir sesgos de estilo y contenido propios del dataset de entrenamiento, no disponible.
- Limitación idiomática: declarado únicamente para vietnamita; es probable que el rendimiento en castellano u otros idiomas se haya degradado respecto al modelo base, aunque no se confirma.
- Contexto: no se documenta la longitud de contexto efectiva tras el ajuste; conviene verificar empíricamente antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere evaluación propia.
- Cero tracción (0 descargas, 0 likes): sin validación comunitaria ni informes de terceros sobre su calidad.
- El nombre del checkpoint sugiere entrenamiento en NF4, pero los pesos publicados están fusionados en 16 bits; no se ofrecen versiones cuantizadas listas para usar.

## Enlaces

- Hugging Face: https://huggingface.co/trunght6605/KimochiSushi-Qwen2.5-3B-Instruct-Merged-qwen-nf4-s42
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
