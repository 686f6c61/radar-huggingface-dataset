# WilliamShakespear/duomath-r1-mathviz-7b

## Resumen

WilliamShakespear/duomath-r1-mathviz-7b es un modelo de lenguaje basado en la arquitectura Qwen2, desarrollado por WilliamShakespear mediante un proceso de ajuste fino (finetuning) sobre el modelo base `unsloth/deepseek-r1-distill-qwen-7b-unsloth-bnb-4bit`. El modelo resultante se publica bajo licencia Apache 2.0 y está orientado al idioma inglés. El nombre del repositorio sugiere una especialización en matemáticas y visualización, aunque no se proporciona documentación que lo confirme.

El entrenamiento se realizó con la librería Unsloth, que según el autor permitió acelerar el proceso un 200% (2x) respecto a un entrenamiento convencional. El modelo base es una destilación de DeepSeek R1 sobre Qwen2 de 7.000 millones de parámetros, lo que le otorga un punto de partida sólido para tareas de razonamiento. El repositorio tiene un tamaño de 0,2 GB, lo que indica que probablemente contiene un adaptador LoRA en lugar de los pesos completos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 7.000 millones (inferido del nombre y del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base usa bnb-4bit) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/deepseek-r1-distill-qwen-7b-unsloth-bnb-4bit`, que es una versión cuantizada en 4 bits de DeepSeek R1 Distill Qwen 7B. Este modelo base combina la arquitectura Qwen2 con técnicas de destilación de razonamiento (chain-of-thought) provenientes de DeepSeek R1. El ajuste fino se realizó con Unsloth, una librería que optimiza el uso de memoria y la velocidad de entrenamiento, y que el autor indica que permitió entrenar dos veces más rápido.

No se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la optimización de Unsloth. La información disponible no permite confirmar si el modelo final es un adaptador LoRA o un conjunto de pesos completos, aunque el tamaño del repositorio (0,2 GB) sugiere lo primero.

## Capacidades

- Generación de texto y razonamiento: se espera que herede las capacidades de razonamiento matemático y lógico del modelo base DeepSeek R1 Distill Qwen 7B, aunque no hay benchmarks que lo confirmen.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el README solo declara inglés.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistencia matemática en entornos educativos: el modelo podría emplearse para resolver problemas matemáticos paso a paso, aprovechando la base de razonamiento de DeepSeek R1. Sería adecuado para generar explicaciones detalladas en inglés, siempre que se cargue el adaptador sobre el modelo base.
- Generación de código y depuración: al estar basado en Qwen2, podría utilizarse para tareas de programación asistida, como completar funciones o explicar fragmentos de código. La ausencia de documentación sobre tool calling limita su integración en pipelines automatizados.
- Tutoría técnica en foros o plataformas de soporte: el modelo puede responder consultas técnicas con razonamiento estructurado, útil en sistemas de atención al cliente donde se requieren respuestas explicativas.
- Análisis de datos y estadística descriptiva: podría generar resúmenes de conjuntos de datos o explicar conceptos estadísticos, gracias a su posible especialización matemática, aunque no se aportan pruebas.
- Procesamiento de documentos académicos: con un contexto largo no confirmado, podría utilizarse para resumir o extraer información de artículos científicos en inglés, siempre que la ventana de contexto sea suficiente.
- Prototipado de agentes conversacionales: el modelo puede servir como base para chatbots de dominio específico, donde el razonamiento encadenado del modelo base ayude a mantener coherencia en diálogos multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con certeza. Si se carga el modelo base de 7B en 4 bits, se necesitan aproximadamente 4-5 GB de VRAM, más el adaptador. Si se cargan los pesos en precisión completa, la demanda sería superior a 14 GB.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 4060 Ti o superior) para la versión 4-bit. Para mayor margen, se recomienda una RTX 3090 o A100.
- Compatibilidad con GPU de consumo: es probable que funcione en GPUs de consumo con 8 GB o más, siempre que se utilice cuantización 4-bit.
- Opciones de despliegue: transformers, text-generation-inference (TGI) y, potencialmente, vLLM si el adaptador es compatible. No se confirma compatibilidad con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| duomath-r1-mathviz-7b | 7B | no disponible | Apache 2.0 | HuggingFace (adaptador) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7B | 32k (según documentación de DeepSeek) | MIT | HuggingFace |
| Qwen/Qwen2-7B | 7B | 32k (según documentación de Qwen) | Apache 2.0 | HuggingFace |

La comparativa se basa en modelos de la misma categoría (7B) y en datos públicos de los modelos originales. No se dispone de resultados de rendimiento para duomath-r1-mathviz-7b que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no evaluados. Al ser un finetuning sin documentación, no se puede garantizar la ausencia de sesgos.
- Riesgo de alucinacion: no evaluado. El modelo podría generar razonamientos incorrectos, especialmente en dominios fuera de su entrenamiento.
- Limitaciones de contexto o idioma: solo se declara soporte para inglés. La longitud de contexto no está especificada.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero hay que revisar las licencias de los pesos base (DeepSeek R1 Distill Qwen 7B y Qwen2) para asegurar el cumplimiento.
- Caveat importante para produccion: el repositorio contiene solo 0,2 GB, lo que sugiere que es un adaptador LoRA. Para su uso en producción, es necesario descargar el modelo base completo y aplicar el adaptador, lo que no está documentado en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/WilliamShakespear/duomath-r1-mathviz-7b
- Modelo base en HuggingFace: https://huggingface.co/unsloth/deepseek-r1-distill-qwen-7b-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Organización DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
