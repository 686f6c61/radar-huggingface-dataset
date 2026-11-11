# stneric/simplixity-writer-4b

## Resumen

simplixity-writer-4b es un ajuste fino (fine-tuning) supervisado del modelo Qwen/Qwen3.5-4B, desarrollado por stneric, orientado a una tarea muy concreta: redactar respuestas con citas a fuentes numeradas dentro de Simplixity, un asistente de investigación autoalojado. El modelo recibe una pregunta y un conjunto de fuentes indexadas, y genera una respuesta en el idioma del lector (inglés o alemán) que atribuye cada afirmación a la fuente correspondiente. No es un modelo de propósito general, sino un componente especializado del pipeline de respuesta de una aplicación.

La relevancia del modelo está en su enfoque de evaluación: el autor mide la fidelidad de las citas con un juez automático (Claude Haiku 5.5 a través del paso `verify` de Simplixity) que clasifica cada afirmación como respaldada, parcialmente respaldada o no respaldada por las fuentes. Sobre el conjunto de test de 87 preguntas y ventana de 4k, la tasa de afirmaciones respaldadas pasa del 79 % en el modelo base al 89 % en este ajuste, y las no respaldadas caen del 7 % al 1 %. Es, por tanto, un ejemplo de ajuste fino pequeño y medido para reducir alucinaciones en tareas de atribución.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors (transformers) y con archivos GGUF en un repositorio separado para Ollama, LM Studio y llama.cpp. El tamaño del repositorio indicado en Hugging Face es de 0.0 GB, lo que sugiere que los pesos aún no se han subido o la información está incompleta. Las métricas de velocidad publicadas (unos 180 tokens/s en una RTX 3070 Ti con decodificación especulativa MTP) son del autor y corresponden a la inferencia en Ollama con cuantización Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-4B); no se detalla la arquitectura interna en la información disponible |
| Parametros totales | 4B (según el nombre del modelo y el modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | entrenado con ventanas de 4k y 8k tokens; la longitud máxima del modelo base no se especifica |
| Tipos de cuantizacion | Q4_K_M (usada en la evaluación y en el ejemplo de Ollama); GGUF disponibles en el repositorio simplixity-writer-4b-GGUF |
| Idiomas soportados | inglés (en) y alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (repositorio separado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y se ajusta mediante QLoRA con cuantización NF4 de la base, aplicado a las capas lineales del modelo de lenguaje y con la pérdida calculada únicamente sobre la respuesta (no sobre el prompt). Se selecciona el checkpoint del paso 80 (aproximadamente una época); una segunda época provocó sobreajuste. El LoRA se fusiona posteriormente en la base bf16 para la exportación. Se conserva la capa `mtp.*` (predicción del siguiente token) del modelo base, lo que permite a llama.cpp y Ollama usar decodificación especulativa; el LoRA no entrena esa capa.

Los datos de entrenamiento consisten en respuestas escritas por Claude Haiku 5.5 (profesor) para preguntas sintéticas, sobre evidencias congeladas del pipeline de búsqueda real de Simplixity, más un pequeño conjunto privado de uso real. Las respuestas del profesor se filtraron para eliminar errores de cita y salidas truncadas. El conjunto de datos no se publica. El prompt de entrenamiento es el que construye Simplixity para el paso de respuesta (`prompts.answer`, conjunto de reglas compacto) con ventanas de 4k y 8k tokens; otros prompts no han sido probados.

## Capacidades

- Generación de respuestas con citas a fuentes numeradas, atribuyendo afirmaciones a las fuentes proporcionadas.
- Redacción en el idioma del lector, limitado a inglés y alemán.
- Manejo de contextos de 4k y 8k tokens con el prompt específico de Simplixity.
- Generación de texto conversacional en el contexto de un asistente de investigación.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- El pipeline declarado es image-text-to-text en las etiquetas de Hugging Face, pero la model card no describe capacidades de visión; la tarea efectiva es text-generation.

## Casos de uso

- Asistente de investigación autoalojado: integrado en Simplixity como modelo de respuesta, recibe la pregunta del usuario y las fuentes recuperadas por el pipeline de búsqueda, y redacta una respuesta con citas verificables. Es su caso de uso principal y el único validado por el autor.
- Verificación de afirmaciones en flujos RAG: el paso `verify` de Simplixity clasifica cada afirmación como respaldada, parcialmente respaldada o no respaldada; el modelo está optimizado para maximizar la proporción de afirmaciones respaldadas (89 % en test a 4k).
- Documentación técnica con trazabilidad: dado un conjunto de documentos numerados, generar resúmenes que referencien explícitamente la fuente de cada dato, útil en entornos donde se exige auditoría de la información.
- Atención al cliente sobre base documental: con el prompt adecuado y fuentes numeradas, redactar respuestas en inglés o alemán citando los artículos o manuales internos que las sustentan.
- Despliegue en hardware de consumo: con cuantización Q4_K_M y Ollama, el modelo cabe en GPUs de gama media; el autor reporta unos 180 tokens/s, TTFT de 0,9 s y una respuesta mediana de 2,2 s en una RTX 3070 Ti.
- Evaluación de fidelidad de otros sistemas RAG: usar el modelo como generador de referencia y comparar sus tasas de citas respaldadas frente a otros modelos en el mismo pipeline.
- Generación de respuestas bilingües en alemán e inglés para bases de conocimiento que mezclan ambos idiomas, manteniendo el idioma de la consulta.

## Benchmarks y rendimiento

El autor publica una evaluación propia con Claude Haiku 5.5 como juez, en Ollama 0.40, Q4_K_M y MTP draft 2. Los porcentajes indican afirmaciones respaldadas / parcialmente respaldadas / no respaldadas.

| Conjunto, ventana | Base (soportadas / parciales / no soportadas) | simplixity-writer-4b v1 |
|---|---|---|
| Test (87 preguntas), 4k | 79 / 14 / 7 % | 89 / 11 / 1 % |
| Test, 8k | 75 / 12 / 12 % | 89 / 11 / 0,5 % |
| Uso real (67), 4k | 65 / 21 / 13 % | 75 / 20 / 5 % |
| Uso real, 8k | 60 / 31 / 9 % | 83 / 14 / 3 % |

Datos adicionales reportados por el autor:

| Métrica | Base | v1 |
|---|---|---|
| Respuestas en idioma incorrecto (test) | 5 % | 1 % |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de 4B en Q4_K_M se sitúa habitualmente en el rango de 3-4 GB, pero el autor no publica una cifra.
- GPU recomendadas: el autor reporta pruebas en una RTX 3070 Ti; no se indican otras GPU.
- Cabe en GPU de consumo: sí, según la prueba del autor en una RTX 3070 Ti con Q4_K_M.
- Opciones de despliegue: Ollama (con GGUF del repositorio separado o creación desde el repositorio en macOS), llama.cpp, LM Studio, transformers con safetensors. En Linux y Windows, Ollama no puede importar safetensors, por lo que es necesario descargar el GGUF.
- Latencia y throughput reportados por el autor en RTX 3070 Ti: aproximadamente 180 tokens/s con decodificación especulativa MTP, TTFT de unos 0,9 s y respuesta mediana de 2,2 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simplixity-writer-4b | 4B | entrenado a 4k y 8k | Respuestas con citas para Simplixity | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Propósito general | Apache 2.0 (según la model card) | Hugging Face |
| Alternativas de 4B para RAG con citas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estándar ni de comparaciones con otros modelos de la misma categoría en la información proporcionada; la única comparación publicada es contra el modelo base en la tarea específica de fidelidad de citas.

## Limitaciones y advertencias

- Exceso de cautela: el modelo tiende a afirmar que las fuentes no dicen algo, unas 1,7 veces por respuesta en preguntas reales.
- Falsos desacuerdos: en ocasiones afirma que las fuentes se contradicen cuando no lo hacen.
- Cita una proporción menor de sus frases que el modelo base.
- Está entrenado exclusivamente con el prompt de Simplixity (`prompts.answer`, conjunto compacto) a ventanas de 4k y 8k; otros prompts no han sido probados y pueden degradar el comportamiento.
- Idiomas limitados a inglés y alemán; no se documenta soporte de castellano.
- El conjunto de datos de entrenamiento no es público, lo que limita la reproducibilidad completa.
- Riesgo de alucinación persistente: aunque las afirmaciones no respaldadas caen al 1 % en test a 4k, en uso real a 4k la tasa es del 5 %, y las no respaldadas restantes suelen ser afirmaciones sobre las propias fuentes.
- Licencia Apache 2.0, igual que el modelo base; no se indican restricciones adicionales para uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B.
- El tamaño del repositorio en Hugging Face figura como 0.0 GB, lo que puede indicar que los pesos no están disponibles en el momento de la consulta.
- No se documentan capacidades de tool calling, agentes ni visión, pese a la etiqueta image-text-to-text del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stneric/simplixity-writer-4b
- GGUF para Ollama, LM Studio y llama.cpp: https://huggingface.co/stneric/simplixity-writer-4b-GGUF
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de Simplixity: https://github.com/stneric/simplixity
