# Toleng/koplak-flash-master-1.5b-instruct

## Resumen

koplak-flash-master-1.5b-instruct es un modelo de lenguaje de 1.500 millones de parámetros desarrollado por Toleng, obtenido mediante fine-tuning del modelo base unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit. El modelo está diseñado para generación de texto conversacional y sigue la arquitectura Qwen2, con licencia Apache 2.0 y soporte exclusivo para el idioma inglés.

La relevancia de este modelo reside en su tamaño compacto, que lo hace adecuado para despliegue en entornos con recursos limitados, y en su origen: parte de un modelo especializado en código (Qwen2.5-Coder) que ha sido ajustado para tareas conversacionales. El entrenamiento se realizó con la librería Unsloth y el framework TRL de HuggingFace, lo que indica un proceso de fine-tuning optimizado para velocidad. No se dispone de información pública sobre el dataset de entrenamiento, los benchmarks o las capacidades específicas del modelo más allá de su ficha técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Coder-1.5B, presumiblemente 32.768 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el modelo base usaba bnb-4bit) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con mecanismo de atencion por ventanas deslizantes y atencion completa alternadas. Al derivar de Qwen2.5-Coder-1.5B-Instruct, hereda una arquitectura optimizada para tareas de programacion, aunque el fine-tuning posterior busca adaptarlo a propositos conversacionales generales.

El proceso de entrenamiento utilizo Unsloth, una libreria que acelera el fine-tuning mediante optimizaciones en el uso de memoria y computacion, junto con la libreria TRL de HuggingFace para el entrenamiento con refuerzo a partir de preferencias humanas (RLHF). El modelo base fue cargado en precision bnb-4bit, lo que sugiere que el fine-tuning se realizo con tecnicas de cuantizacion consciente (QLoRA). No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las hiperparametros utilizadas.

## Capacidades

- Generacion de texto conversacional en ingles, adaptado mediante fine-tuning desde un modelo base orientado a codigo.
- Capacidades de codigo heredadas de Qwen2.5-Coder-1.5B-Instruct, aunque el fine-tuning puede haberlas degradado parcialmente.
- Soporte de instrucciones y respuestas en formato chat (modelo instruct).
- No se ha confirmado soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha confirmado soporte de vision, audio u otras modalidades.
- Capacidad multilingue limitada: el modelo declara soporte exclusivo para ingles.

## Casos de uso

- Asistente conversacional ligero: el modelo puede integrarse en aplicaciones de chat o asistentes virtuales donde se requiera un modelo pequeno que no consuma muchos recursos, gracias a sus 1,5 B de parametros.
- Generacion de codigo asistida en entornos con restricciones de hardware: al derivar de Qwen2.5-Coder, puede ofrecer sugerencias de codigo en ingles en editores o entornos de desarrollo integrados (IDE) sin necesidad de GPU de alta gama.
- Prototipado rapido de aplicaciones de IA: su tamano reducido permite iterar rapidamente en experimentos de fine-tuning o evaluacion sin costes elevados de inferencia.
- Educacion e investigacion: util como modelo de referencia para estudiar el efecto del fine-tuning sobre una base especializada en codigo, o para ensenar conceptos de ajuste de modelos.
- Despliegue en el edge: su tamano permite ejecutarlo en dispositivos con recursos limitados, como Raspberry Pi o moviles, para tareas de generacion de texto simples.
- Filtrado o clasificacion de texto: puede adaptarse mediante fine-tuning adicional para tareas de clasificacion o extraccion de informacion en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. El repositorio no incluye metricas de rendimiento ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16 (1,54 B parametros), menos de 2 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) para FP16; GPUs con 2 GB pueden funcionar con cuantizacion.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: compatible con transformers, text-generation-inference (TGI), vLLM, llama.cpp, Ollama y cualquier framework que soporte modelos Qwen2.
- Latencia y throughput: no disponible. Se espera una latencia baja en GPU de consumo dado el tamano del modelo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| koplak-flash-master-1.5b-instruct | 1,54 B | no disponible | Apache 2.0 | Conversacional (fine-tuning de coder) |
| Qwen2.5-Coder-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Codigo e instrucciones |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Proposito general |

El modelo se situa en la misma familia que los Qwen2.5 de 1,5 B, diferenciandose por su proceso de fine-tuning especifico. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- No hay informacion publica sobre el dataset de entrenamiento, por lo que se desconocen los posibles sesgos del modelo.
- Riesgo de alucinacion no evaluado: no se han publicado evaluaciones de factibilidad o precision.
- Soporte limitado a ingles: no es adecuado para aplicaciones multilingue.
- El fine-tuning sobre una base de codigo puede haber reducido las capacidades generales de razonamiento o conversacion del modelo original.
- No se ha verificado el rendimiento en produccion: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido probado por la comunidad.
- La longitud de contexto no esta confirmada en la ficha; se hereda presumiblemente de Qwen2.5-Coder-1.5B (32.768 tokens), pero no hay garantia.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Toleng/koplak-flash-master-1.5b-instruct
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit
- Libreria Unsloth: https://github.com/unslothai/unsloth
- Framework TRL: https://github.com/huggingface/trl
