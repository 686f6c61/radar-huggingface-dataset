# xiangxinkexue/Qwen2.5-1.5B-Instruct-decensored

## Resumen

Qwen2.5-1.5B-Instruct-decensored es un adaptador LoRA publicado por el usuario xiangxinkexue sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct de Alibaba Cloud. El repositorio contiene exclusivamente los pesos del adaptador PEFT (0,1 GB), no un modelo completo, por lo que requiere cargar el modelo base de Qwen para funcionar. El nombre sugiere un ajuste fino orientado a reducir o eliminar el alineamiento de seguridad y las restricciones de contenido del modelo original, aunque la model card no documenta explícitamente el proceso.

La relevancia de esta ficha es limitada: se trata de un adaptador de la comunidad, sin métricas publicadas, sin documentación de entrenamiento y con cero descargas en el momento de la consulta. El modelo base Qwen2.5-1.5B-Instruct sí es un transformer decoder-only de 1.500 millones de parámetros con 32.768 tokens de contexto, ampliamente utilizado por su relación calidad/tamaño en entornos con recursos limitados. Este adaptador hereda esas capacidades arquitectónicas, pero introduce un riesgo adicional al eliminar potencialmente las salvaguardas del modelo original.

La model card está prácticamente vacía: todos los campos aparecen como "[More Information Needed]" y no se especifican licencia, idiomas, datos de entrenamiento ni evaluación. Cualquier uso en producción debería tratarse con extrema cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only Qwen2.5 |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el modelo base Qwen2.5-1.5B-Instruct tiene 1.500 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; admite las cuantizaciones del modelo base: FP16, BF16, GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta principalmente chino e ingles, con cobertura limitada de otros idiomas) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que se acopla al modelo Qwen2.5-1.5B-Instruct mediante la librería PEFT 0.22.0. No se trata de un modelo entrenado desde cero ni de un fine-tuning completo: los pesos del adaptador modifican un subconjunto de matrices del transformer base. El repositorio no incluye el modelo base ni los pesos fusionados, por lo que el despliegue requiere descargar Qwen/Qwen2.5-1.5B-Instruct por separado y aplicar el adaptador.

No hay información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos, hiperparámetros, régimen de precisión ni si se emplearon técnicas de RLHF o DPO. El nombre "decensored" sugiere que el ajuste se orientó a reducir el rechazo de peticiones y el alineamiento de seguridad del modelo original, pero no existe documentación técnica que lo confirme ni que detalle la metodología. Tampoco se especifica el rango del LoRA, el alpha, los módulos objetivo ni la duración del entrenamiento.

## Capacidades

- Generación de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico, matemáticas elementales y generación de código de complejidad baja, limitado por el tamaño de 1.500 millones de parámetros.
- Soporte de tool calling y function calling, capacidad presente en el modelo base Qwen2.5-Instruct.
- Capacidad multilingüe limitada, principalmente chino e inglés en el modelo base.
- Presunta reducción de rechazos y filtros de contenido respecto al modelo original (no verificada ni documentada).
- No se ha documentado ninguna capacidad adicional (visión, audio, thinking mode) introducida por el adaptador.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el adaptador permite estudiar empíricamente cómo un ajuste LoRA altera el comportamiento de rechazo de un modelo alineado, comparando respuestas antes y después de aplicar el adaptador en un entorno controlado.
- Experimentación académica con PEFT: sirve como ejemplo práctico de cómo un adaptador de bajo rango modifica el comportamiento de un modelo de 1,5B sin reentrenar los pesos completos, útil en cursos y laboratorios sobre fine-tuning eficiente.
- Pruebas de robustez de filtros: equipos de moderación pueden usar el adaptador para generar casos adversarios y evaluar si sus clasificadores de contenido detectan respuestas que el modelo base rechazaría.
- Prototipado de bajo coste en local: con 1,5B de parámetros, el modelo fusionado cabe en GPUs de consumo y permite experimentar con generación de texto conversacional sin infraestructura dedicada.
- Análisis de sesgos y toxicidad: útil para estudiar qué tipos de contenido emergen cuando se relajan las salvaguardas, documentando patrones antes de diseñar políticas de despliegue.
- Evaluación comparativa de variantes comunitarias: permite contrastar el comportamiento de un modelo "decensored" frente al original en tareas de instrucción general, midiendo diferencias en utilidad, coherencia y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo fusionado: aproximadamente 3 GB en FP16 (1,5B parámetros × 2 bytes), 1,5-2 GB en cuantización de 8 bits y en torno a 1 GB en cuantización de 4 bits.
- El adaptador LoRA por sí solo ocupa 0,1 GB y debe sumarse a la VRAM del modelo base.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, siendo las consumer las más adecuadas por el reducido tamaño.
- Cabe holgadamente en GPUs de consumo como RTX 3050, RTX 3060, RTX 4060 o incluso en CPU con cuantización GGUF de 4 bits.
- Opciones de despliegue: transformers + PEFT (para cargar el adaptador), vLLM y TGI tras fusionar los pesos, llama.cpp y Ollama con el modelo convertido a GGUF.
- No se dispone de datos de latencia ni throughput medidos para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-decensored (este) | 1,5B (adaptador LoRA) | No disponible (base: 32.768) | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 (modelo base) | Hugging Face, ampliamente utilizado |
| Qwen/Qwen2.5-1.5B | 1,5B | 32.768 | Apache 2.0 | Hugging Face |
| Adaptadores LoRA comunitarios sobre Qwen2.5 | 1,5B | Depende del base | Variable, a menudo no especificada | Hugging Face |

No se dispone de datos de rendimiento comparativo para este adaptador frente a las alternativas.

## Limitaciones y advertencias

- La model card no documenta licencia, por lo que el uso comercial queda en un limbo legal; debe verificarse la licencia del modelo base (Apache 2.0) y asumirse que el adaptador no la aclara.
- El nombre "decensored" implica la posible eliminación de salvaguardas de seguridad; el modelo puede generar contenido dañino, ofensivo o ilegal sin filtros.
- No hay evaluación publicada de sesgos, toxicidad ni tasas de alucinación; se desconoce el impacto del ajuste en la calidad general de las respuestas.
- Al ser un adaptador LoRA, cualquier despliegue requiere cargar el modelo base, lo que añade complejidad y dependencia de un tercero.
- El modelo base Qwen2.5-1.5B-Instruct tiene capacidad limitada de razonamiento y matemáticas complejas; el adaptador no mejora estas capacidades y podría degradarlas.
- La cobertura idiomática es limitada (principalmente chino e inglés), con rendimiento inferior en castellano.
- Cero descargas y cero likes indican ausencia de validación comunitaria; no hay evidencia de que el adaptador funcione correctamente.
- Riesgo de alucinación inherente a modelos de 1,5B, potencialmente agravado por un ajuste sin evaluación.
- No apto para producción sin auditoría de seguridad previa y sin una licencia clara que lo respalde.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/xiangxinkexue/Qwen2.5-1.5B-Instruct-decensored
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Librería PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
