# VelvetVibe/Nova-L3-8B-Stheno-LoRA

## Resumen

Nova-L3-8B-Stheno-LoRA es un adaptador LoRA desarrollado por VelvetVibe, que ajusta el modelo base Sao10K/L3-8B-Stheno-v3.2, un fine-tune de Llama-3-8B especializado en roleplay, escritura creativa y seguimiento de instrucciones. El modelo se publica bajo licencia Apache-2.0 y está pensado para tareas de generación de texto en inglés, aprovechando la base sólida de Stheno v3.2 para producir respuestas más naturales y contextuales en escenarios conversacionales.

El adaptador fue entrenado con la librería Unsloth y Hugging Face TRL, lo que permite una integración sencilla con el ecosistema transformers y su despliegue en entornos de producción mediante text-generation-inference. Al ser un LoRA, el tamaño del repositorio es reducido (0.2 GB), lo que facilita su descarga y aplicación sobre el modelo base sin necesidad de reentrenar todos los pesos.

Este modelo es relevante para desarrolladores que buscan una capa de ajuste ligera y eficiente sobre un modelo ya optimizado para diálogo y creatividad, con la ventaja de una licencia permisiva y compatibilidad con herramientas estándar del ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3) con adaptadores LoRA |
| Parametros totales | 8 030 000 000 (modelo base) + adaptadores LoRA (no especificado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Stheno v3.2 soporta 8192 tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | no disponible (el modelo base puede cuantizarse a 4-bit, 8-bit, etc., pero no se indica para el LoRA) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Sao10K/L3-8B-Stheno-v3.2, que a su vez es un fine-tune de Meta Llama-3-8B. La arquitectura subyacente es un transformer decoder estándar con atención causal, 32 capas, 32 cabezas de atención y una dimensión de embedding de 4096. El LoRA introduce matrices de bajo rango en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables y el coste de cómputo.

El entrenamiento se realizó con la librería Unsloth (optimización para fine-tuning rápido) y Hugging Face TRL, probablemente mediante Supervised Fine-Tuning (SFT) sobre datos de instrucciones y conversaciones. No se especifica el número de tokens de entrenamiento ni la composición del dataset. El modelo base Stheno v3.2 fue entrenado por Sao10K con un enfoque en roleplay y escritura creativa, mejorando la adherencia a instrucciones y la coherencia narrativa respecto a versiones anteriores.

No hay información sobre técnicas de RLHF o DPO en el adaptador, ni sobre innovaciones arquitectónicas adicionales más allá del LoRA.

## Capacidades

- Generación de texto en inglés con estilo conversacional y narrativo, heredado del modelo base Stheno v3.2.
- Seguimiento de instrucciones en tareas de diálogo, roleplay y escritura creativa.
- Razonamiento básico y respuesta a preguntas generales, limitado por el tamaño de 8B parámetros.
- Soporte para fine-tuning adicional si se integra el adaptador con el modelo base completo.
- No se documenta soporte explícito para tool calling, agentes o razonamiento multi-paso.
- No se indica capacidad multimodal (solo texto).
- Compatible con pipelines de transformers y text-generation-inference.

## Casos de uso

- Roleplay y juegos de texto: el modelo puede generar respuestas coherentes y con personalidad en escenarios de ficción, gracias a la base Stheno v3.2 optimizada para este fin. Se integraría en motores de juego o chatbots con un prompt de sistema que defina el personaje.
- Escritura creativa asistida: útil para generar borradores de historias, descripciones o diálogos, donde el LoRA aporta un tono natural y fluido. Puede usarse en herramientas de edición o generación de contenido.
- Asistentes conversacionales en inglés: al estar ajustado para instrucciones, puede servir como base para chatbots de atención al cliente o asistentes personales, aunque su capacidad de razonamiento complejo es limitada.
- Prototipado rápido de aplicaciones de IA: al ser un LoRA ligero, permite iterar rápidamente sobre el modelo base sin grandes requisitos de cómputo, ideal para experimentos y demos.
- Fine-tuning específico de dominio: el adaptador puede combinarse con otros LoRA o usarse como punto de partida para ajustar el modelo a tareas concretas (por ejemplo, generación de guiones o diálogos técnicos).
- Educación y tutoría de idiomas: puede generar ejemplos de conversación o explicaciones sencillas en inglés, aprovechando su capacidad de seguir instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este adaptador LoRA. El modelo base Sao10K/L3-8B-Stheno-v3.2 no incluye tablas de rendimiento en su página de Hugging Face dentro de los resultados de búsqueda. Por tanto, no es posible comparar cuantitativamente este modelo con alternativas.

## Requisitos de hardware

- Al ser un LoRA de 8B parámetros, la inferencia requiere cargar el modelo base completo (aproximadamente 16 GB en FP16) más los adaptadores. Con cuantización a 4-bit (por ejemplo, con bitsandbytes o GGUF), la VRAM necesaria se reduce a unos 6-8 GB.
- GPU recomendadas: tarjetas consumer con al menos 8 GB de VRAM (RTX 3070, RTX 4060 Ti, RTX 4070) para cuantización 4-bit; para FP16 se recomienda 16-24 GB (RTX 4090, A100, etc.).
- Puede ejecutarse en CPU con llama.cpp si se convierte a GGUF, aunque la velocidad será baja.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), Ollama (si se convierte a GGUF), o directamente con transformers y peft.
- Latencia y throughput: no se dispone de datos específicos; para un modelo de 8B en una GPU moderna se espera una generación de 20-40 tokens/segundo con cuantización 4-bit.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente este LoRA con otras alternativas. El modelo base Stheno v3.2 compite con otros fine-tunes de Llama-3-8B como NousResearch/Hermes-2-Pro-Llama-3-8B o OpenHermes-2.5, pero no hay datos de rendimiento comparativos en la información disponible. Se recomienda consultar la página del modelo base para posibles referencias.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas es muy limitado o nulo.
- Al ser un LoRA pequeño, puede presentar alucinaciones o incoherencias en tareas que requieren conocimiento factual actualizado o razonamiento complejo.
- No se especifican sesgos conocidos, pero al derivar de Llama-3-8B y de datos de roleplay, puede reflejar estereotipos presentes en los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Stheno v3.2 también es Apache-2.0, por lo que no hay restricciones adicionales.
- Para producción, es necesario validar la calidad de las respuestas en el dominio específico, ya que no hay benchmarks publicados.
- El adaptador requiere cargar el modelo base completo; si no se dispone de suficiente VRAM, se debe cuantizar o usar una versión GGUF.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/VelvetVibe/Nova-L3-8B-Stheno-LoRA
- Modelo base Sao10K/L3-8B-Stheno-v3.2: https://huggingface.co/Sao10K/L3-8B-Stheno-v3.2
- Búsqueda de modelos con adaptadores de Stheno: https://huggingface.co/models?other=base_model:adapter:Sao10K/L3-8B-Stheno-v3.2
- Blog de Nebula Block sobre Stheno v3.2: https://blog.nebulablock.com/introducing-l3-8b-stheno-v3-2-on-nebula-block-free-inference-for-all/
