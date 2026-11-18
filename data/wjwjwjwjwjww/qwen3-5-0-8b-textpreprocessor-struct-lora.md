# wjwjwjwjwjww/Qwen3.5-0.8B-TextPreprocessor-struct-lora

## Resumen

Qwen3.5-0.8B-TextPreprocessor-struct-lora es un adaptador LoRA de destilación estructural publicado por el usuario wjwjwjwjwjww sobre el modelo base Qwen3.5-0.8B, un transformer multimodal nativo de 0,8 mil millones de parámetros. El adaptador convierte el modelo de limpieza de texto Qwen3.5-0.8B-TextPreprocessor en un sistema capaz de procesar imágenes de páginas de documentos y emitir Markdown estructurado, con jerarquía de encabezados, tablas en HTML y orden de lectura preservado. El repositorio contiene dos adaptadores (v2 y v3) entrenados con configuraciones de datos distintas.

El modelo resuelve un problema concreto en pipelines de digitalización documental: la conversión de PDFs e imágenes de páginas a Markdown estructurado manteniendo la semántica de tablas y títulos. Frente al modelo base, que solo limpiaba texto, la versión v2 mejora el TEDS de tablas un 116 % (de 0,1069 a 0,2307) en el subconjunto chino de 30 páginas de OmniDocBench, manteniendo la tasa de acierto de las reglas de limpieza en el 96 %. El adaptador es extremadamente ligero: 3,19 millones de parámetros entrenables (0,37 % del total) con rango 8, y el torre visual permanece congelada durante todo el entrenamiento.

La relevancia actual del proyecto es doble. Por un lado, demuestra que un LoRA de rango bajo sobre un modelo multimodal pequeño puede añadir capacidades de estructuración documental con un coste de entrenamiento mínimo (1,8 GB de VRAM pico, 42 minutos en una RTX 3090). Por otro, documenta un resultado negativo explícito (v3) que ilustra la importancia del equilibrio de datos frente al volumen: 3.791 muestras reales sin control de proporción de páginas con tablas producen un colapso del TEDS a 0,0477.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=8, alpha=16, dropout=0,05) sobre transformer multimodal Qwen3.5-0.8B |
| Parametros totales | 3,19 M entrenables en el adaptador (0,37 % del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de secuencia en entrenamiento (contexto del base no especificado) |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16) |
| Idiomas soportados | chino simplificado principalmente; tradicional e ingles no verificados |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT); requiere el modelo base para inferencia |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Resolucion de imagen | long side ≈ 949 px (√900k) |
| Precision de entrenamiento | bf16 + gradient checkpointing |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-0.8B, un transformer multimodal nativo con torre visual integrada. El LoRA se inserta únicamente en las proyecciones de atención y MLP del modelo de lenguaje (q/k/v/o/gate/up/down_proj), mientras que la torre visual permanece completamente congelada. Esta decisión reduce el coste de entrenamiento y el número de parámetros entrenables a 3,19 M, lo que permite iterar en hardware de consumo.

El entrenamiento parte de los pesos ya fusionados de Qwen3.5-0.8B-TextPreprocessor (que incorpora un LoRA de limpieza previo). La versión v2 se entrenó con 1.903 muestras, de las cuales 1.200 son sintéticas, e incluye un 15 % (200 muestras) de datos de limpieza mezclados para evitar el olvido catastrófico. La versión v3 se entrenó con 3.791 muestras exclusivamente reales. El entrenamiento de v3 requirió 3.791 pasos y aproximadamente 42 minutos en una RTX 3090 con un pico de 1,8 GB de VRAM. La innovación técnica principal no está en la arquitectura sino en la metodología: el autor documenta públicamente un resultado negativo (v3) que demuestra que la proporción de páginas con tablas en el dataset importa más que el volumen total de datos.

## Capacidades

- Generación de Markdown estructurado a partir de imágenes de páginas de documentos, con jerarquía de encabezados (`#`, `##`, etc.).
- Detección y reconstrucción de tablas en formato HTML `<table>`, formato exigido por el evaluador TEDS de OmniDocBench.
- Preservación del orden de lectura en documentos de una sola columna.
- Limpieza de texto integrada: el adaptador hereda y mantiene la capacidad de limpieza del modelo base (tasa de acierto de reglas del 96 % en v2).
- Procesamiento multimodal: entrada de imagen + prompt de texto, salida de texto.
- No soporta tool calling, function calling ni razonamiento multi-paso de agentes de forma verificada.
- Capacidad multilingüe limitada: entrenado principalmente con páginas en chino simplificado.

## Casos de uso

- Digitalización de informes financieros con tablas: el adaptador convierte páginas escaneadas de balances y cuentas de resultados en Markdown con tablas HTML, lo que permite alimentar sistemas de extracción estructurada o bases de datos sin post-procesado manual de la tabla.
- Pipeline de ingesta documental para RAG: la salida Markdown con encabezados jerárquicos facilita el chunking semántico por sección, mejorando la calidad de recuperación en comparación con texto plano extraído por OCR tradicional.
- Procesamiento de documentación técnica en chino: manuales y especificaciones con estructura de títulos y tablas de parámetros se convierten a Markdown listo para publicar en wikis o repositorios.
- Preprocesado en sistemas de archivo digital: clasificación y estructuración automática de lotes de páginas escaneadas antes de su indexación, con un coste de cómputo muy bajo (1,8 GB de VRAM en entrenamiento, inferencia en GPU de consumo).
- Extracción de tablas de informes regulatorios: aunque el TEDS es modesto (0,23), el adaptador sirve como primer paso para aislar regiones tabulares que luego se validan con un modelo OCR especializado.
- Prototipado rápido de pipelines de visión-lenguaje: al ser un LoRA de 3,19 M parámetros sobre un modelo de 0,8 B, permite experimentar con estructuración documental en una única GPU de consumo sin infraestructura dedicada.

## Benchmarks y rendimiento

Evaluación con el evaluador oficial de OmniDocBench sobre un subconjunto de 30 páginas en chino:

| Modelo | Table TEDS ↑ | Text Edit ↓ | Reglas de limpieza |
|---|---|---|---|
| Base sin adaptador | 0,1069 | 0,2838 | 92,0 % |
| v2 (recomendado) | 0,2307 | 0,3611 | 96,0 % |
| v3 (resultado negativo) | 0,0477 | 0,4201 | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM de entrenamiento: 1,8 GB pico con bf16 y gradient checkpointing en una RTX 3090.
- VRAM de inferencia: no especificada en la model card; el adaptador añade un coste despreciable sobre el modelo base de 0,8 B, que en bf16 ocupa aproximadamente 1,6 GB de pesos más el coste de la torre visual y las activaciones.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en bf16; RTX 3090, RTX 4090, A100 o H100 para entrenamiento e inferencia a mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090).
- Opciones de despliegue: `transformers` con `peft` (flujo documentado en la model card); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento de 3.791 pasos tardó unos 42 minutos en una RTX 3090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Table TEDS (OmniDocBench, 30 págs. zh) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-TextPreprocessor-struct-lora v2 | 0,8 B base + 3,19 M LoRA | 2.048 (entrenamiento) | 0,2307 | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B-TextPreprocessor (base) | 0,8 B | no disponible | 0,1069 | no disponible | Hugging Face |
| Modelos OCR dedicados (referencia citada por el autor) | no disponible | no disponible | ≈ 0,92 | no disponible | no disponible |

El autor indica explícitamente que el TEDS del adaptador (0,23) sigue muy por debajo del de modelos OCR especializados (≈ 0,92 según la model card). No se dispone de datos de benchmarks de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Fidelidad de texto inferior al modelo base: el Text Edit empeora de 0,2838 a 0,3611, principalmente porque las páginas de texto plano se sobre-estructuran con encabezados y tablas innecesarios.
- TEDS de tablas modesto: 0,2307 frente a ≈ 0,92 de modelos OCR dedicados; las tablas complejas fallan con frecuencia.
- Sensibilidad a la resolución: con long side inferior a 900 px la identificación de texto pequeño se degrada de forma notable; se recomienda redimensionar a ≈ 949 px.
- Cobertura lingüística limitada: entrenado principalmente con páginas en chino simplificado; el rendimiento en chino tradicional e inglés no está verificado.
- La versión v3 no debe usarse en producción: su TEDS colapsa a 0,0477 por una proporción insuficiente de páginas con tablas en el dataset.
- El adaptador requiere el modelo base Qwen3.5-0.8B-TextPreprocessor para funcionar; no es un modelo autónomo.
- El README documenta un workaround que parchea `ProcessorMixin.check_argument_for_proper_class` para evitar la validación del procesador de vídeo cuando falta `torchvision`; este parche es frágil y puede romperse con actualizaciones de `transformers`.
- Licencia Apache-2.0 declarada en la model card, aunque el campo de licencia del repositorio en Hugging Face figura como no disponible; conviene verificar antes de uso comercial.
- Riesgo de alucinación en tablas y cifras: al ser un modelo generativo, puede inventar celdas o valores ausentes en tablas mal resueltas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wjwjwjwjwjww/Qwen3.5-0.8B-TextPreprocessor-struct-lora
- Modelo base (referenciado en la model card): https://huggingface.co/w666j66666/Qwen3.5-0.8B-TextPreprocessor
- Registro experimental completo (GitHub): https://github.com/wj239951/llmops-new/blob/main/docs/21.%E5%A4%9A%E6%A8%A1%E6%80%81%E7%BB%93%E6%9E%84%E8%92%B8%E9%A6%8F%E5%AE%9E%E9%AA%8C.md
- Paper de OmniDocBench (arXiv:2412.07626): https://arxiv.org/abs/2412.07626
