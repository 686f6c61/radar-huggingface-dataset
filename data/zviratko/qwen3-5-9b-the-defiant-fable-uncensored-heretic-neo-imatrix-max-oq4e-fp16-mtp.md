# zviratko/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-oQ4e-fp16-mtp

## Resumen

El modelo `zviratko/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-oQ4e-fp16-mtp` es una cuantización mixta de precisión 4 bits (oQ) del modelo base `DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP`, un fine-tune y merge de la familia Qwen3.5 de 9B parámetros. Esta versión concreta está optimizada para el framework MLX de Apple, lo que permite su ejecución eficiente en hardware con silicio de Apple (M-series). El modelo base, desarrollado por DavidAU, es un modelo de lenguaje multimodal (imagen-texto a texto) que, según su autor, supera en varios benchmarks a modelos más grandes como Qwen3.5 27B y Qwen3.6 35B, manteniendo un tamaño reducido y sin censura.

La relevancia de esta versión cuantizada radica en que ofrece un rendimiento elevado en un paquete compacto (7.2 GB de repositorio) y puede desplegarse en equipos de consumo con recursos limitados. El nombre incluye etiquetas como "uncensored" y "heretic", lo que indica que se ha eliminado la moderación de contenido, un aspecto a considerar en entornos de producción. Aunque los datos de la ficha de HuggingFace son mínimos, los resultados de búsqueda confirman que el modelo base ha sido evaluado en siete benchmarks y supera a modelos de mayor escala en varios de ellos, aunque no se proporcionan cifras concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, posiblemente con atención multimodal) |
| Parametros totales | 1.944.588.016 (según safetensors; el nombre indica 9B, posiblemente el archivo contiene solo pesos cuantizados) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ 4 bits, grupo 64, formato MLX safetensors |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (también existen versiones GGUF del modelo base) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune y merge de Qwen3.5-9B, que emplea una arquitectura transformer con capacidades multimodales (procesamiento de imagen y texto). El autor, DavidAU, ha combinado múltiples modelos previos de 9B mediante un proceso de fusión en varias etapas, lo que da como resultado un modelo que, según sus afirmaciones, supera a modelos de 27B y 35B en ciertos benchmarks. La cuantización aplicada en esta versión utiliza oQ (de la librería oMLX v0.6.3), una técnica de cuantización mixta de precisión que asigna 4 bits con un tamaño de grupo de 64, preservando la calidad de las capas críticas. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. El modelo incluye soporte para MTP (multi-token prediction), lo que acelera la decodificación al predecir varios tokens a la vez.

## Capacidades

- Generación de texto y razonamiento complejo, con mejoras reportadas frente a modelos de mayor tamaño.
- Procesamiento multimodal: acepta entradas de imagen y texto (según la descripción del modelo base en inferix.co).
- Soporte de decodificación MTP (multi-token prediction) para una generación más rápida.
- Sin censura: el modelo no aplica filtros de contenido, lo que permite generar respuestas sobre temas sensibles sin restricciones.
- Optimizado para MLX, lo que permite su ejecución en dispositivos Apple Silicon con Metal.
- Capacidad de tool calling y función de agente no confirmada explícitamente, pero derivada de la familia Qwen3.5 (no verificado en la información proporcionada).

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativas, guiones o diálogos con temáticas adultas o controvertidas, gracias a su naturaleza "uncensored". Se usaría como motor de generación en aplicaciones de escritura asistida.
- Asistentes personales en dispositivos Apple: al estar cuantizado para MLX, puede ejecutarse localmente en un MacBook con M-series, ofreciendo respuestas rápidas sin conexión a internet.
- Análisis de imágenes y generación de descripciones: al ser multimodal, puede recibir una imagen y generar texto descriptivo, útil para aplicaciones de accesibilidad o etiquetado automático.
- Prototipado rápido de chatbots especializados: desarrolladores pueden integrar el modelo en entornos de prueba para validar flujos conversacionales sin depender de APIs externas.
- Investigación académica sobre modelos sin censura: sirve como objeto de estudio para analizar el comportamiento de modelos que no aplican alineación de seguridad.
- Despliegue en edge computing: con un tamaño de 7.2 GB y cuantización 4 bits, puede ejecutarse en hardware con poca VRAM, como una GPU integrada o una tarjeta de gama media, para tareas de generación de texto en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta versión cuantizada. El modelo base, según los resultados de búsqueda, afirma superar 7 de 7 benchmarks para Qwen3.5 9B, Qwen3.5 27B y Qwen3.6 35B-A3B, y alcanzar en algunos casos el rendimiento de Qwen3.6 27B, tanto en 4 bits como en 8 bits. Sin embargo, no se proporcionan cifras numéricas concretas (p. ej., MMLU, HumanEval, GSM8K) en los resultados de búsqueda. Por tanto, no es posible presentar una tabla comparativa con valores exactos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~1.94B parámetros cuantizado a 4 bits, el tamaño del archivo es de 7.2 GB, lo que sugiere que necesita al menos 8 GB de memoria unificada en Apple Silicon o VRAM en GPUs convencionales.
- GPU recomendadas: cualquier Mac con chip M1, M2, M3 o M4 (8 GB o más de RAM unificada). En GPUs NVIDIA, se requeriría convertir el modelo a otro formato (por ejemplo, GGUF) y usar llama.cpp o vLLM, aunque la versión MLX no es directamente compatible.
- Compatibilidad con hardware de consumo: sí, cabe en equipos con 8 GB de memoria, como MacBook Air o Mac mini.
- Opciones de despliegue: MLX (nativo en Apple), conversión a GGUF para usar con llama.cpp, Ollama o LM Studio. No se menciona soporte para vLLM o TGI en esta versión.
- Latencia y throughput: no disponibles. La decodificación MTP puede mejorar la velocidad, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B (original) | ~9B | no disponible | Apache 2.0 (probable) | safetensors, GGUF | Modelo base con moderación de contenido |
| DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP | ~9B | no disponible | no disponible | GGUF, safetensors | Fine-tune sin censura, supera a modelos mayores en benchmarks |
| zviratko/Qwen3.5-9B-...-oQ4e-fp16-mtp | 1.94B (según safetensors) | no disponible | no disponible | MLX safetensors | Versión cuantizada 4 bits para MLX, con MTP |

La comparativa es limitada porque no se dispone de datos de contexto, licencia ni benchmarks detallados. El modelo se posiciona como una alternativa ligera y sin censura frente a modelos de 9B estándar, pero su licencia no está clara, lo que dificulta su uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune sin censura, puede reflejar y amplificar sesgos presentes en los datos de entrenamiento, sin filtros de moderación.
- Riesgo de alucinación: no se han evaluado formalmente las tasas de alucinación; se recomienda verificar las salidas en aplicaciones críticas.
- Limitaciones de contexto: la longitud de contexto no está documentada; se desconoce si soporta ventanas largas.
- Restricciones de licencia: la licencia no está especificada en la ficha de HuggingFace, lo que impide determinar si es permitido su uso comercial o la redistribución.
- Idoneidad para producción: al ser "uncensored", puede generar contenido inapropiado u ofensivo, lo que lo hace inadecuado para aplicaciones públicas sin moderación adicional.
- Compatibilidad: el formato MLX solo funciona en Apple Silicon; para otros entornos es necesario convertir el modelo a GGUF u otro formato, lo que puede degradar el rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zviratko/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-oQ4e-fp16-mtp
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Versión GGUF del modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Página de inferix.co con descripción del modelo: https://inferix.co/models/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Página de aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf-davidau
- Página de interfaze.ai: https://interfaze.ai/models/davidauqwen35-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf
- Herramienta de cuantización oQ: https://github.com/jundot/omlx
