# zefie/Llama-3.1-8B-Lexi-Uncensored-V2-GGUF-NVFP4

## Resumen

Llama-3.1-8B-Lexi-Uncensored-V2-GGUF-NVFP4 es una cuantización en formato NVFP4 del modelo Llama-3.1-8B-Lexi-Uncensored-V2, publicada por el usuario zefie en Hugging Face. Se trata de una variante "uncensored" (sin alineación de seguridad) de Llama 3.1 8B de Meta, un transformer denso de 8.000 millones de parámetros con ventana de contexto de 128K tokens. El nombre "Lexi-Uncensored" corresponde a una familia de ajustes comunitarios conocidos que eliminan los rechazos de seguridad del modelo base mediante destilación de salidas sin filtrar.

La relevancia de esta ficha radica en el formato: NVFP4 es el formato de cuantización de 4 bits con punto flotante propuesto por NVIDIA, orientado a acelerar la inferencia en GPUs modernas (Blackwell y, parcialmente, Hopper) manteniendo mejor calidad que los formatos enteros de 4 bits tradicionales. La cuantización se distribuye bajo la etiqueta GGUF-NVFP4, lo que sugiere compatibilidad con herramientas del ecosistema NVIDIA (TensorRT-LLM) o con backends que soporten este formato dentro de contenedores GGUF.

Dado que la model card del repositorio es prácticamente vacía (solo declara la licencia llama3.1), gran parte de los detalles técnicos de esta ficha se derivan del modelo base Llama 3.1 8B y de la familia Lexi-Uncensored, y se señalan explícitamente los datos no disponibles. El repositorio presenta cero descargas y cero likes en el momento de la consulta, por lo que no existe historial comunitario que valide su calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Llama 3.1) |
| Parámetros totales | 8.030 millones (aprox., heredado de Llama 3.1 8B) |
| Parámetros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 131.072 tokens (128K, heredado del modelo base; no confirmado en la model card) |
| Tipos de cuantización | NVFP4 (punto flotante de 4 bits, formato GGUF-NVFP4) |
| Idiomas soportados | no disponible (Llama 3.1 8B base declara soporte oficial para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF (variante NVFP4) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder denso con atención agrupada de consultas (GQA), codificación posicional RoPE y normalización RMSNorm, con 32 capas, 32 cabezas de atención y 8 cabezas KV. El modelo base de Meta fue entrenado con más de 15 billones de tokens y posteriormente alineado con SFT y RLHF/DPO; la variante Lexi-Uncensored invierte parcialmente esa alineación.

El método "Lexi-Uncensored" consiste en destilar las salidas del modelo base sin filtros de seguridad hacia el modelo afinado, de modo que el resultado responde a instrucciones que el modelo original rechazaría. La versión V2 de esta familia mejoró la calidad general respecto a la V1. No hay información en la model card sobre el proceso exacto, el dataset de destilación ni los hiperparámetros empleados: no disponible.

La innovación diferencial de este repositorio concreto es la cuantización NVFP4: un formato de punto flotante de 4 bits (1 bit de signo, 2 de exponente, 1 de mantisa, con microbloques de escala) desarrollado por NVIDIA que reduce a la mitad el ancho de banda respecto a FP8 y ofrece mayor fidelidad numérica que los formatos INT4 en GPUs con soporte nativo.

## Capacidades

- Generación de texto general en múltiples turnos, heredada de Llama 3.1 8B Instruct.
- Razonamiento y resolución de problemas de nivel intermedio para su clase de tamaño (8B).
- Generación y explicación de código, con rendimiento razonable en lenguajes principales (Python, JavaScript, C++), heredado del modelo base.
- Matemáticas y razonamiento aritmético básico, sin especialización en la materia.
- Sin confirmación de soporte de tool calling / function calling en esta variante: no disponible (el modelo base Llama 3.1 Instruct sí lo soporta, pero el ajuste Lexi puede haber degradado esta capacidad).
- Capacidades multilingües heredadas del modelo base (8 idiomas oficiales), no verificadas para esta variante.
- Sin capacidades multimodales: es un modelo de texto exclusivamente.
- Ausencia deliberada de filtros de seguridad: responde a consultas que el modelo alineado rechazaría, lo cual es su rasgo definitorio.

## Casos de uso

- Investigación de alineación y seguridad: permite estudiar cómo se degrada el comportamiento de seguridad de un modelo tras destilación sin filtros, útil para red teams y auditorías de seguridad de LLM.
- Escritura creativa sin restricciones: generación de ficción con contenido maduro o temáticas que los modelos comerciales rechazan, aprovechando el contexto de 128K para novelas largas.
- Inferencia local de bajo coste: la cuantización NVFP4 permite ejecutar un modelo de 8B en aproximadamente 5-6 GB de memoria, adecuado para estaciones de trabajo con GPU NVIDIA moderna.
- Experimentación con el formato NVFP4: evaluar la pérdida de calidad del formato de 4 bits en punto flotante frente a GGUF Q4_K_M u otros formatos INT4 en hardware compatible.
- Asistentes personales autoalojados: despliegue en local donde el usuario controla totalmente el comportamiento del modelo y no depende de filtros de terceros.
- Prototipado de agentes: uso como motor de razonamiento local en frameworks tipo LangChain o LlamaIndex, con la advertencia de que el soporte de tool calling no está verificado en esta variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni comparativas con el modelo base o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para los pesos en NVFP4 (4,5 bits efectivos por parámetro), más 1-2 GB adicionales para la caché KV según la longitud de contexto utilizada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte del formato en el backend correspondiente; idealmente RTX 4070/4080/4090 para consumo, o A100/H100/H200 en servidor. El beneficio máximo de NVFP4 requiere GPUs Blackwell (RTX 50, B100/B200), que implementan el formato en hardware.
- Cabe en GPUs de consumo: sí, en cualquier GPU con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores).
- Opciones de despliegue: el formato GGUF sugiere compatibilidad con llama.cpp y derivados (Ollama, LM Studio) si el backend soporta NVFP4; el soporte nativo de NVIDIA corresponde a TensorRT-LLM. No está verificado qué runtimes concretos aceptan esta cuantización: no disponible.
- Latencia y throughput: no disponible; en GPUs de consumo se puede esperar una velocidad de generación del orden de decenas de tokens por segundo para un modelo de 8B cuantizado a 4 bits, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Lexi-Uncensored-V2-GGUF-NVFP4 (este) | 8B | 128K (heredado) | NVFP4 (GGUF) | Llama 3.1 Community | Variante sin filtros, cuantización experimental |
| Llama-3.1-8B-Instruct (Meta) | 8B | 128K | BF16, FP8 oficiales | Llama 3.1 Community | Modelo base alineado, tool calling verificado |
| Llama-3.1-8B-Lexi-Uncensored (Orenguteng, GGUF Q4/Q5/Q8) | 8B | 128K | Q4_K_M a Q8_0 | Llama 3.1 Community | Variante sin filtros más popular, formatos INT4/INT8 estándar |
| Mistral-Nemo-12B (variantes uncensored) | 12B | 128K | Variados | Apache 2.0 / licencias varias | Alternativa más grande con licencia más permisiva |

## Limitaciones y advertencias

- Sin filtros de seguridad: el modelo genera contenido que otros modelos rechazan, incluyendo potencialmente contenido dañino, ilegal o peligroso. Su uso conlleva responsabilidad legal y ética plena para el desplegador.
- Riesgo de alucinación elevado: la destilación sin filtros suele degradar la factividad y la coherencia respecto al modelo base; no hay evaluaciones que cuantifiquen esta degradación en este repositorio.
- Repositorio sin validación comunitaria: cero descargas y cero likes, sin model card descriptiva, sin benchmarks y sin pruebas de que la cuantización NVFP4 funcione correctamente en los runtimes habituales.
- Compatibilidad de formato incierta: NVFP4 es un formato muy reciente; es probable que versiones estándar de llama.cpp u Ollama no lo soporten, requiriendo builds específicos o TensorRT-LLM.
- Licencia Llama 3.1 Community: permite uso comercial, pero impone restricciones: no usar para entrenar modelos competidores de Meta, obligación de cumplir la política de uso aceptable y aplicación de la marca "Llama" en derivados según los términos de la licencia.
- Soporte multilingüe y de tool calling no verificado para esta variante concreta: pueden haberse degradado respecto al modelo base.
- Contexto de 128K heredado del modelo base pero no confirmado en la model card; el uso de contextos largos incrementa notablemente los requisitos de VRAM de la caché KV.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zefie/Llama-3.1-8B-Lexi-Uncensored-V2-GGUF-NVFP4
- Modelo base Llama 3.1 8B Instruct (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante original Lexi-Uncensored (referencia de la familia): https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Licencia Llama 3.1 Community: https://huggingface.co/meta-llama/Llama-3.1-8B/blob/main/LICENSE
- Documentación adicional (paper, blog del autor, demo): no disponible
