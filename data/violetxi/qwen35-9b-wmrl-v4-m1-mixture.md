# violetxi/qwen35-9b-wmrl-v4-m1-mixture

## Resumen

El modelo `violetxi/qwen35-9b-wmrl-v4-m1-mixture` es un checkpoint de la línea de investigación "wm-internalization" (internalización del mundo) en su versión 4, desarrollado por Violet Xiang (violetxi). Se trata de un fine-tuning completo (full-finetune) del modelo base Qwen/Qwen3.5-9B, realizado sobre el corpus sintético de bufetes de abogados Calderwood & Harkness, con un pool de semillas de razonamiento de aproximadamente 50.000 ejemplos. El objetivo del estudio es investigar cómo un modelo de 9.000 millones de parámetros internaliza representaciones del mundo a partir de datos de dominio específico.

El checkpoint corresponde a la condición `m1-mixture` y al guardado final (`save final`), y ha sido "injertado" (grafted) de vuelta en la estructura compuesta del hub, de modo que es servible directamente con vLLM. El modelo mantiene la arquitectura del modelo base (Qwen3_5ForConditionalGeneration), que según la documentación pública de Qwen3.5-9B emplea una arquitectura híbrida con Gated Delta Networks y Gated Attention. Con 9.653.104.368 parámetros (aproximadamente 9,65 mil millones), el modelo se posiciona en la gama de 9B, adecuado para despliegue en GPUs de consumo con cuantización.

La relevancia de este modelo radica en su enfoque experimental: no es un modelo de propósito general, sino un artefacto de investigación sobre cómo los fine-tunes de dominio alteran las representaciones internas. Su publicación permite a otros investigadores reproducir y analizar los efectos de la internalización del mundo en un modelo de tamaño medio, con una licencia Apache 2.0 que facilita su uso y estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (Gated Delta Networks + Gated Attention), patrón 8×(3×DeltaNet→FFN→1×Attention→FFN) según el modelo base Qwen3.5-9B |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base Qwen3.5-9B, que soporta contexto largo, pero el valor exacto no se especifica) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; no se mencionan variantes cuantizadas) |
| Idiomas soportados | No disponible (hereda los del modelo base Qwen3.5-9B, no especificados en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de Qwen/Qwen3.5-9B, que según la documentación pública de Alibaba Cloud emplea una arquitectura híbrida que combina Gated Delta Networks (una variante de redes recurrentes lineales) con mecanismos de atención tradicionales, organizados en un patrón repetitivo de 8 bloques, cada uno con la secuencia 3×DeltaNet→FFN→1×Attention→FFN. Esta arquitectura busca equilibrar eficiencia computacional y capacidad de modelado de dependencias largas.

El entrenamiento se realizó sobre el corpus sintético Calderwood & Harkness, un conjunto de datos generado artificialmente que simula documentos y escenarios de un bufete de abogados. El proceso de "wm-internalization" (internalización del mundo) consiste en exponer al modelo a este corpus para que desarrolle representaciones internas del dominio legal. Se menciona un pool de semillas de razonamiento de ~50.000 ejemplos ("think-on seed pool") y el checkpoint se guardó en el paso 2400. El injerto (graft) reemplazó 427 componentes del modelo base con los del modelo entrenado, según los metadatos del repositorio. No se especifica el uso de RLHF, DPO u otras técnicas de alineación; el enfoque es puramente de fine-tuning supervisado sobre datos sintéticos.

## Capacidades

- Generación de texto condicional: al estar basado en Qwen3.5-9B, mantiene la capacidad de generar texto coherente y contextualizado, especializado en el dominio legal tras el fine-tuning.
- Razonamiento sobre documentos legales: el entrenamiento sobre el corpus de bufetes sugiere una mejora en tareas de comprensión y generación de textos jurídicos, aunque no se han publicado evaluaciones específicas.
- Capacidades multimodales heredadas: el modelo base Qwen3.5-9B es multimodal (visión, OCR, razonamiento visual), y la arquitectura Qwen3_5ForConditionalGeneration sugiere que estas capacidades se conservan, aunque no hay confirmación explícita en la model card.
- Servible con vLLM: la model card indica que el modelo está injertado en la estructura compuesta del hub y es servible "out of the box" con vLLM, lo que facilita su despliegue en producción.
- Soporte de tool calling y agentes: no disponible (no se menciona en la información proporcionada; dependería de las capacidades del modelo base, que no están detalladas).
- Multilingüismo: no disponible (se hereda del modelo base, pero no se especifican los idiomas).

## Casos de uso

- Investigación académica sobre internalización del mundo: el modelo es un artefacto de estudio para analizar cómo los fine-tunes de dominio alteran las representaciones internas de un modelo de 9B. Los investigadores pueden comparar este checkpoint con el modelo base y con otras condiciones (como `c1-b5v4`) para trazar los cambios en el espacio de representación.
- Generación de resúmenes de documentos legales: dado su entrenamiento en el corpus Calderwood & Harkness, el modelo puede emplearse para resumir contratos, memorandos legales o dictámenes, aunque se recomienda validar su rendimiento con datos reales antes de uso en producción.
- Asistencia en redacción jurídica: el modelo puede generar borradores de cláusulas, respuestas a consultas legales o informes basados en plantillas, aprovechando su exposición al corpus sintético.
- Análisis de sentimiento y clasificación de textos legales: aunque no se han publicado benchmarks, el fine-tuning en dominio legal podría mejorar tareas de clasificación de documentos jurídicos, como detección de riesgos o categorización de casos.
- Evaluación de robustez y sesgos en modelos de dominio: al ser un modelo de investigación, puede usarse para probar metodologías de evaluación de sesgos en dominios especializados, comparando su comportamiento con el del modelo base.
- Desarrollo de prototipos de chatbots legales: con la integración en vLLM, se puede desplegar un asistente conversacional para entornos controlados de demostración, aunque se debe tener precaución por la naturaleza sintética de los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El autor no proporciona datos de rendimiento en tareas estándar ni en tareas específicas del dominio legal.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,65 mil millones de parámetros, en precisión FP16/BF16 se requieren aproximadamente 19,3 GB de VRAM (2 bytes por parámetro). El tamaño del repositorio es de 38,6 GB, lo que sugiere que los pesos podrían estar en FP32 (4 bytes por parámetro) o que hay archivos duplicados; en cualquier caso, para inferencia eficiente se recomienda cuantizar a 8 bits (~9,7 GB) o 4 bits (~4,8 GB) si se desea ejecutar en GPUs de consumo.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 40 GB son adecuadas. Con cuantización de 4 bits, cabría en una RTX 3090 (24 GB) o incluso en una RTX 4060 Ti (16 GB) si se usa GGUF, aunque no se proporcionan archivos GGUF en el repositorio.
- Compatibilidad con GPUs de consumo: sí, con cuantización. Sin cuantizar, requiere al menos 20 GB de VRAM, lo que excluye a la mayoría de GPUs de gama media.
- Opciones de despliegue: vLLM (mencionado explícitamente en la model card), así como Hugging Face Transformers. Para cuantización, se podría convertir a GGUF con llama.cpp u Ollama, pero no se ofrecen archivos preconvertidos.
- Latencia y throughput: no disponible. Dependerá del hardware y de la configuración de vLLM; para un modelo de 9B en una A100, se puede esperar un throughput de decenas de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-m1-mixture | 9,65 B | No disponible | Apache 2.0 | Fine-tune legal sintético (wm-internalization) |
| violetxi/qwen35-9b-wmrl-v4-c1-b5v4 | 9,65 B (presumiblemente) | No disponible | Apache 2.0 | Misma línea, condición c1-b5v4 |
| Qwen/Qwen3.5-9B (modelo base) | 9 B | Largo (valor exacto no disponible) | Apache 2.0 | Multimodal de propósito general |

No se dispone de datos de rendimiento para comparar objetivamente estos modelos. La comparativa se limita a aspectos estructurales y de licencia. Otros modelos de la misma gama (p. ej., Llama 3.1 8B, Mistral 7B) no son directamente comparables por su diferente arquitectura y entrenamiento.

## Limitaciones y advertencias

- Sesgos de dominio: el entrenamiento sobre un corpus sintético de bufetes de abogados puede introducir sesgos específicos del dominio legal, incluyendo terminología, supuestos culturales o estilos de redacción que no generalizan a otros ámbitos.
- Riesgo de alucinación: al ser un fine-tune sobre datos sintéticos, el modelo puede generar contenido legal plausible pero incorrecto o inventado. No debe utilizarse para asesoramiento legal real sin supervisión humana.
- Datos sintéticos: el corpus Calderwood & Harkness es generado artificialmente, por lo que las representaciones aprendidas pueden no reflejar la complejidad y matices de los textos legales reales.
- Capacidades multimodales no verificadas: aunque el modelo base es multimodal, no hay confirmación de que el fine-tuning preserve estas capacidades; se recomienda probar antes de asumir soporte de visión.
- Contexto e idiomas no especificados: la ficha no detalla la longitud de contexto ni los idiomas soportados; se heredan del modelo base, pero sin garantía de que el fine-tuning no los haya alterado.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigación sin benchmarks publicados, su fiabilidad en producción no está demostrada.
- Reproducibilidad: los metadatos del injerto indican rutas de scratch y un snapshot específico del modelo base, lo que puede dificultar la reproducción exacta del entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-m1-mixture
- Checkpoint hermano (condición c1-b5v4): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-c1-b5v4
- Perfil del autor: https://huggingface.co/violetxi
- Especificaciones del modelo base Qwen3.5-9B: https://apxml.com/models/qwen35-9b
- Catálogo de modelos de Microsoft Foundry (Qwen3.5-9B): https://ai.azure.com/catalog/models/qwen--qwen3.5-9b
