# Toleng/koplak-flash-1.5b-instruct

## Resumen

El modelo `Toleng/koplak-flash-1.5b-instruct` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit`, desarrollado por Toleng. Se trata de un modelo de generación de texto de 1.543.714.304 parámetros, orientado a conversación y a tareas de instrucción, con licencia Apache-2.0. El entrenamiento se realizó con la librería Unsloth y la biblioteca TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que el método convencional.

Este modelo es relevante porque ofrece una alternativa ligera y de código abierto para tareas de generación de texto e instrucción, basada en la arquitectura Qwen2.5-Coder, conocida por su buen rendimiento en tareas de programación y razonamiento. Al ser un modelo pequeño (1.5B), puede ejecutarse en hardware de consumo, lo que lo hace atractivo para prototipos y aplicaciones con recursos limitados. Sin embargo, la información pública disponible es escasa: no se detallan los datos de entrenamiento, ni benchmarks, ni capacidades específicas más allá de las heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (basada en transformer, variante Coder) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Coder soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el modelo base se entrenó en bnb-4bit, pero el modelo final no especifica cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit`, que a su vez se basa en la arquitectura Qwen2.5-Coder, un transformer decoder-only con atención causal. El entrenamiento se realizó con la librería Unsloth, que optimiza el proceso de fine-tuning, y con la biblioteca TRL de Hugging Face, típicamente usada para entrenamiento con supervisión (SFT) o RLHF. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como DPO o RLHF. La única información disponible es que el entrenamiento fue "2x faster" gracias a Unsloth, sin más detalles técnicos.

## Capacidades

- Generación de texto e instrucciones: al ser un modelo instruct, puede seguir instrucciones y mantener conversaciones multi-turno.
- Generación de código: hereda las capacidades del modelo base Qwen2.5-Coder, que está especializado en tareas de programación (generación, completado, explicación de código).
- Razonamiento básico: el modelo base tiene capacidades de razonamiento lógico y matemático, aunque no se han verificado en este fine-tune.
- Soporte de tool calling: no se menciona explícitamente, pero el modelo base Qwen2.5-Coder-Instruct puede soportar function calling; no hay confirmación para este modelo.
- Multilingüismo: solo se declara inglés; no se garantiza soporte para otros idiomas.

## Casos de uso

- Asistente de código en entornos de desarrollo: el modelo puede ayudar a generar fragmentos de código, explicar funciones o completar implementaciones, gracias a su base Qwen2.5-Coder. Se integraría en editores o IDEs mediante APIs locales.
- Chatbot de soporte técnico: al ser un modelo instruct pequeño, puede gestionar conversaciones de ayuda sobre temas de programación o informática, con respuestas concisas.
- Prototipado rápido de aplicaciones de IA: por su tamaño reducido, es adecuado para pruebas de concepto en entornos con recursos limitados, como portátiles o servidores sin GPU dedicada.
- Generación de documentación técnica: puede resumir o redactar comentarios de código, descripciones de funciones o guías breves.
- Educación y aprendizaje: como modelo de instrucción, puede servir para practicar interacción con IA generativa en entornos académicos, sin costes de API.
- Automatización de tareas de texto: extracción de información, reformulación o clasificación simple, siempre que se limiten a inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo específico. Se recomienda evaluar el modelo en las tareas concretas antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: para un modelo de 1.5B en precisión fp16, se requieren aproximadamente 3 GB de VRAM. Con cuantización a 4 bits (como el modelo base), podría reducirse a ~1 GB, pero no se confirma la cuantización del modelo final.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo en fp16. Para cuantización, incluso GPUs con 2 GB podrían ser suficientes.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y baja, así como en CPU (aunque con mayor latencia).
- Opciones de despliegue: compatible con transformers, text-generation-inference (TGI), vLLM, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión). No se proporcionan latencias ni throughput específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Toleng/koplak-flash-1.5b-instruct | 1.5B | no disponible | Apache-2.0 | Fine-tune de Qwen2.5-Coder-1.5B-Instruct |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1.5B | 32.768 | Apache-2.0 | Modelo original, con benchmarks publicados |
| Llama-3.2-1B-Instruct | 1.2B | 128.000 | Llama 3.2 Community License | Alternativa de Meta, con buen rendimiento en instrucciones |

No se dispone de datos de rendimiento comparativo para el modelo de Toleng. Se recomienda comparar con el modelo base Qwen2.5-Coder-1.5B-Instruct, que sí tiene métricas publicadas en su ficha de Hugging Face.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño, es propenso a generar respuestas incorrectas o inventadas, especialmente en temas fuera de su dominio de entrenamiento.
- Idioma: solo se declara inglés; el rendimiento en otros idiomas no está garantizado y puede ser deficiente.
- Contexto limitado: aunque el modelo base soporta 32K tokens, no se confirma que este fine-tune mantenga esa longitud; en la práctica, modelos pequeños suelen degradarse con contextos largos.
- Licencia: Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base (Qwen2.5-Coder) también tenga licencia compatible; en este caso, Qwen2.5-Coder es Apache-2.0, por lo que no hay conflicto.
- Falta de documentación: no se detallan los datos de entrenamiento, lo que dificulta evaluar posibles sesgos o limitaciones específicas.
- Producción: sin benchmarks ni pruebas de robustez, no se recomienda su uso en aplicaciones críticas sin una evaluación previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Toleng/koplak-flash-1.5b-instruct
- Modelo base (unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit): https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit
- Librería Unsloth: https://github.com/unslothai/unsloth
- Biblioteca TRL de Hugging Face: https://github.com/huggingface/trl
