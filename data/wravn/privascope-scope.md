# Wravn/PrivaScope-scope

## Resumen

PrivaScope-scope es un modelo de clasificación de texto en inglés desarrollado por el usuario Wravn y publicado en Hugging Face. Se trata de un fine-tuning de mukund/privbert, un modelo basado en la arquitectura RoBERTa especializado en el dominio de las políticas de privacidad y los avisos legales. El modelo se distribuye en formato safetensors y también en ONNX, lo que facilita su despliegue en entornos de producción con requisitos de inferencia optimizada.

Con 124.654.091 parámetros, PrivaScope-scope se sitúa en el rango de los modelos encoder de tamaño base, lo que lo hace adecuado para tareas de clasificación de secuencias con requisitos de hardware moderados. Su propósito declarado es la clasificación de texto, y la métrica de evaluación indicada en la model card es F1, aunque no se especifican los valores obtenidos ni el conjunto de datos de evaluación.

El modelo resulta relevante para desarrolladores que necesiten clasificar fragmentos de texto relacionado con privacidad, términos de servicio o documentación legal en inglés, aprovechando un encoder preentrenado en ese dominio específico. No obstante, la información pública disponible es muy limitada: no se detallan los datos de entrenamiento del fine-tuning, los resultados de benchmarks ni las condiciones de licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa, base de mukund/privbert) |
| Parámetros totales | 124.654.091 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (se distribuye en safetensors y ONNX) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

PrivaScope-scope es un fine-tuning de mukund/privbert, un modelo encoder basado en RoBERTa entrenado originalmente en el dominio de las políticas de privacidad. La arquitectura subyacente es un transformer encoder bidireccional, adecuado para tareas de clasificación de secuencias mediante la representación agregada del token especial de clasificación. El modelo cuenta con 124.654.091 parámetros, coherente con un RoBERTa de tamaño base.

No se dispone de información sobre el conjunto de datos utilizado en el fine-tuning, el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá de la herencia del preentrenamiento de privbert en el dominio de privacidad. La model card únicamente declara la métrica F1 como referencia de evaluación, sin aportar valores concretos.

## Capacidades

- Clasificación de texto en inglés: el modelo está diseñado para asignar etiquetas a fragmentos de texto, presumiblemente relacionados con categorías de privacidad o documentación legal.
- Especialización de dominio: al derivar de privbert, hereda un preentrenamiento orientado a políticas de privacidad y avisos legales.
- Inferencia optimizada: la disponibilidad de pesos en ONNX permite su despliegue en entornos con aceleración por hardware o runtimes de inferencia específicos.
- Procesamiento de secuencias: como encoder RoBERTa, puede manejar entradas de texto de longitud moderada, aunque la longitud máxima de contexto no está documentada.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento extendido.

## Casos de uso

- Clasificación de cláusulas de privacidad: el modelo puede etiquetar fragmentos de políticas de privacidad según categorías predefinidas, aprovechando el preentrenamiento de privbert en ese dominio para mejorar la precisión en textos legales.
- Moderación de contenido en inglés: puede utilizarse para clasificar textos de entrada en un pipeline de moderación, filtrando contenido según las etiquetas aprendidas durante el fine-tuning.
- Análisis de términos de servicio: integrado en herramientas de revisión legal, el modelo puede clasificar secciones de contratos o avisos legales para su revisión posterior por humanos.
- Enrutamiento de tickets de soporte: en un sistema de atención al cliente, el modelo puede clasificar mensajes entrantes en inglés para dirigirlos al equipo adecuado según la categoría detectada.
- Extracción de señales en cumplimiento normativo: puede emplearse como componente de clasificación en flujos de trabajo de cumplimiento de privacidad, marcando documentos que requieran revisión adicional.
- Despliegue en entornos con ONNX Runtime: gracias a los pesos ONNX, puede integrarse en servicios de inferencia de baja latencia en CPU o GPU, adecuado para aplicaciones que requieran clasificación en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara la métrica F1 sin aportar valores numéricos ni el conjunto de evaluación utilizado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 124,6 millones de parámetros, los pesos en precisión FP32 ocupan aproximadamente 0,5 GB; en FP16, alrededor de 0,25 GB. La VRAM total necesaria dependerá del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP16; tarjetas como NVIDIA T4, RTX 3060 o superiores son suficientes. Para despliegues de alto rendimiento, se pueden usar A100 o H100, aunque el modelo no las requiere.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como la RTX 3060, RTX 4060 o superiores, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: ONNX Runtime, Transformers con PyTorch, y servidores de inferencia compatibles con modelos de clasificación de texto. No se ha documentado soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| PrivaScope-scope | 124,6 M | No disponible | No disponible | safetensors, ONNX | Clasificación de privacidad (en) |
| mukund/privbert | No disponible | No disponible | No disponible | No disponible | Dominio de privacidad (en) |
| RoBERTa-base | 125 M | 512 tokens | MIT | safetensors, PyTorch | Propósito general (en) |

La comparativa se limita a los datos disponibles. No se dispone de información sobre el rendimiento relativo de PrivaScope-scope frente a alternativas, ni de modelos comparables adicionales en la misma categoría de clasificación de privacidad.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún análisis de sesgos; al derivar de un modelo preentrenado en textos legales en inglés, puede heredar sesgos presentes en ese corpus.
- Riesgo de alucinación: al ser un modelo de clasificación y no generativo, el riesgo se manifiesta en forma de etiquetas incorrectas o sobreconfianza en las predicciones, especialmente en textos fuera del dominio de privacidad.
- Limitaciones de contexto e idioma: el modelo solo soporta inglés y la longitud máxima de contexto no está documentada; textos más largos pueden requerir truncamiento.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar si se permite el uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Caveats para producción: la información pública es mínima (sin valores de F1, sin datos de entrenamiento, sin evaluación independiente), lo que dificulta validar su calidad antes de desplegarlo. Se recomienda realizar una evaluación propia con datos representativos del caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wravn/PrivaScope-scope
- Modelo base mukund/privbert: https://huggingface.co/mukund/privbert
