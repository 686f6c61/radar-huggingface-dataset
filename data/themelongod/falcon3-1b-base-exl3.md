# TheMelonGod/Falcon3-1B-Base-exl3

## Resumen

Falcon3-1B-Base-exl3 es una cuantización en formato ExLlamaV3 del modelo Falcon3-1B-Base, desarrollado por el Technology Innovation Institute (TII) de los Emiratos Árabes Unidos. El modelo original es un LLM compacto de aproximadamente 1.000 millones de parámetros, obtenido mediante poda de profundidad, anchura, número de cabezas de atención y canales de embedding a partir de un modelo Falcon3 de 3B, y entrenado con un objetivo de destilación de conocimiento en solo 80 GT de cómputo.

Esta versión cuantizada, creada por TheMelonGod, ofrece múltiples variantes de bits por peso (de 2.0 a 8.0 bpw) con opciones de 6 u 8 cabezas de bits, lo que permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible. El modelo soporta cuatro idiomas (inglés, francés, español y portugués) y una ventana de contexto de hasta 4.000 tokens.

La relevancia de esta cuantización radica en que facilita la ejecución local del modelo en GPUs de consumo o incluso en CPU, manteniendo un tamaño de archivo reducido. Al ser un modelo base, está orientado a generación de texto, extracción de representaciones y fine-tuning posterior, y su compatibilidad con la arquitectura Llama permite integrarlo con las herramientas habituales del ecosistema.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (compatible con Llama) |
| Parametros totales | ~1.000 millones (1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.000 tokens |
| Tipos de cuantizacion | 8.0 bpw (8hb y 6hb), 7.0 bpw (8hb y 6hb), 4.0 bpw (6hb), 2.25 bpw (6hb), 2.0 bpw (6hb) |
| Idiomas soportados | Inglés, francés, español, portugués |
| Licencia | Falcon LLM License (falcon-llm-license) |
| Formato de pesos | safetensors (formato ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Falcon3-1B-Base utiliza una arquitectura transformer estándar compatible con Llama, lo que facilita su integración en el ecosistema de herramientas existente (transformers, vLLM, llama.cpp, etc.). Fue obtenido mediante poda de un modelo Falcon3 de 3B, reduciendo la profundidad, la anchura, el número de cabezas de atención y los canales de embedding. El entrenamiento se realizó con un objetivo de destilación de conocimiento, utilizando únicamente 80 GT de cómputo, lo que lo convierte en un modelo muy eficiente de entrenar en comparación con otros de su tamaño.

La cuantización ExLlamaV3 aplicada por TheMelonGod reduce la precisión de los pesos a diferentes bits por peso (bpw), con variantes de 2.0 a 8.0 bpw y opciones de 6 u 8 cabezas de bits. Fue generada con la versión 1.4.4 de la herramienta EXL3. El repositorio contiene todas las variantes en un solo espacio, con un tamaño total de 10.7 GB, aunque cada variante individual ocupa una fracción de ese espacio.

## Capacidades

- Generación de texto en cuatro idiomas: inglés, francés, español y portugués.
- Modelo base: no está entrenado para seguir instrucciones ni mantener diálogos, pero puede completar texto y generar contenido coherente.
- Extracción de representaciones (embeddings) para tareas de clasificación, búsqueda semántica o clustering.
- Fine-tuning eficiente: al ser un modelo compacto, puede ajustarse con recursos limitados para tareas específicas.
- Compatible con la arquitectura Llama, lo que permite usar herramientas del ecosistema (transformers, vLLM, ExLlamaV3, etc.).
- No soporta tool calling, visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Clasificación de texto multilingüe: el modelo puede fine-tuning para clasificar documentos en inglés, francés, español y portugués, aprovechando su capacidad multilingüe y su tamaño reducido para entrenar en una sola GPU.
- Generación de texto en producción ligera: con cuantización de 4.0 bpw o inferior, el modelo puede ejecutarse en CPUs o GPUs de gama baja para completar texto en aplicaciones de autocompletado o redacción asistida.
- Extracción de embeddings para búsqueda semántica: las representaciones del modelo pueden indexarse en bases vectoriales para construir sistemas de búsqueda multilingüe en dominios específicos.
- Prototipado rápido de aplicaciones NLP: su pequeño tamaño permite iterar rápidamente en experimentos de generación o clasificación sin necesidad de infraestructura costosa.
- Fine-tuning para dominios especializados: el modelo base puede ajustarse con datos propios (legales, médicos, técnicos) para generar texto especializado en los cuatro idiomas soportados.
- Despliegue en dispositivos edge: con cuantizaciones de 2.0-2.25 bpw, el modelo cabe en dispositivos con poca memoria, como Raspberry Pi o teléfonos móviles, para tareas de generación offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantización específica. El modelo original Falcon3-1B-Base puede tener benchmarks publicados en su página de HuggingFace, pero no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1B cuantizado, la huella de memoria varía según la cuantización. Con 2.0 bpw, el modelo puede ocupar menos de 1 GB; con 8.0 bpw, alrededor de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las variantes de menor bpw. Una RTX 3060 o superior es suficiente para todas las variantes.
- Compatible con GPUs de consumo: sí, todas las variantes caben en GPUs de consumo modernas (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: ExLlamaV3 (biblioteca nativa), también puede convertirse a GGUF para usar con llama.cpp u Ollama, o cargarse con transformers si se descuantiza.
- Latencia y throughput: no disponible en la información proporcionada, pero al ser un modelo de 1B, la generación es rápida incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Falcon3-1B-Base (original) | 1B | 4K | en, fr, es, pt | Falcon LLM | safetensors (BF16) |
| Falcon3-1B-Base-exl3 (este) | 1B | 4K | en, fr, es, pt | Falcon LLM | safetensors (ExLlamaV3) |
| Qwen2.5-1.5B | 1.5B | 32K | Multilingüe | Apache 2.0 | safetensors, GGUF |
| Gemma-2-2B | 2B | 8K | Multilingüe | Gemma License | safetensors, GGUF |

Nota: los datos de Qwen2.5-1.5B y Gemma-2-2B provienen de conocimiento general y no se derivan de la información proporcionada en la búsqueda.

## Limitaciones y advertencias

- Modelo base: no está optimizado para seguir instrucciones ni mantener conversaciones; requiere fine-tuning para tareas de chat o instrucción.
- Contexto limitado: la ventana de 4.000 tokens es corta en comparación con modelos modernos, lo que limita su uso en tareas que requieren contexto largo.
- Idiomas limitados: solo soporta inglés, francés, español y portugués; no cubre otros idiomas.
- Licencia Falcon LLM: tiene restricciones de uso comercial; es necesario revisar los términos y condiciones en el enlace proporcionado.
- Riesgo de alucinación: como todo LLM, puede generar contenido falso o inexacto, especialmente en tareas de generación libre.
- Cuantización agresiva: las variantes de 2.0-2.25 bpw pueden degradar significativamente la calidad de las respuestas; se recomienda probar antes de usar en producción.
- Sin soporte de tool calling ni agentes: no puede integrarse en pipelines que requieran llamadas a funciones o razonamiento multi-paso.

## Enlaces

- [HuggingFace - TheMelonGod/Falcon3-1B-Base-exl3](https://huggingface.co/TheMelonGod/Falcon3-1B-Base-exl3)
- [HuggingFace - Modelo original tiiuae/Falcon3-1B-Base](https://huggingface.co/tiiuae/Falcon3-1B-Base)
- [HuggingFace - Variante exl2 del mismo autor](https://huggingface.co/TheMelonGod/Falcon3-1B-Base-exl2)
- [Blog oficial de Falcon 3](https://falcon-lm.github.io/blog/falcon-3/)
- [Página de Falcon 3 en falconllm.tii.ae](https://falconllm.tii.ae/falcon3/index.html)
- [Guía de despliegue local de Falcon 3](https://falcon-lm.github.io/tutorials/falcon-3/)
- [Términos y condiciones de Falcon LLM](https://falconllm.tii.ae/falcon-terms-and-conditions.html)
