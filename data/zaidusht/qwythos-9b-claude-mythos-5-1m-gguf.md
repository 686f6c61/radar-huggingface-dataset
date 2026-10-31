# Zaidusht/Qwythos-9B-Claude-Mythos-5-1M-GGUF

## Resumen

Qwythos-9B-Claude-Mythos-5-1M-GGUF es la colección de cuantizaciones GGUF del modelo Qwythos-9B-Claude-Mythos-5-1M, desarrollado por Empero AI sobre la base Qwen3.5-9B. Se trata de un modelo de razonamiento multimodal (texto e imagen) post-entrenado con más de 500 millones de tokens de trazas de razonamiento de alta calidad generadas internamente con su herramienta `rethink`. Su propuesta de valor es ofrecer capacidades de razonamiento tipo chain-of-thought en un tamaño compacto de ~9B parámetros, con una ventana de contexto nativa de 1.048.576 tokens (1M) mediante escalado YaRN.

El repositorio, mantenido por el usuario Zaidusht, incluye cuantizaciones desde Q4_K_M hasta BF16, variantes con cabecera MTP (Multi-Token Prediction) para decodificación especulativa en llama.cpp, y un proyector de visión (mmproj) heredado de la base Qwen3.5-9B. Es relevante para desarrolladores que necesitan un modelo local de razonamiento con contexto ultralargo que quepa en hardware de consumo, con licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 (torre de visión tipo CLIP + proyector) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | 1.048.576 tokens (1M, vía YaRN rope-scaling activado por defecto) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 (cada uno en variante normal y variante MTP) |
| Idiomas soportados | Inglés (según la model card; no disponible información sobre otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp, Ollama, LM Studio, jan, KoboldCpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer multimodal con torre de visión integrada. Sobre esa base, Empero AI realizó un post-entrenamiento de parámetros completos (full-parameter SFT) usando más de 500 millones de tokens de trazas de razonamiento estilo "Claude Mythos / Claude Fable", generadas internamente con su herramienta `rethink`. El entrenamiento fue exclusivamente textual: la torre de visión se mantuvo congelada durante el SFT, por lo que las capacidades de visión son idénticas a las del Qwen3.5-9B base y el mmproj es intercambiable con cualquier mmproj comunitario de Qwen3.5-9B.

Como innovaciones destacables, el modelo incorpora una ventana de contexto de 1M tokens mediante escalado YaRN activado por defecto, soporte nativo de function calling según la especificación de Qwen3.5, y las variantes MTP incluyen la cabecera de Multi-Token Prediction restaurada dentro del GGUF, lo que permite decodificación especulativa (draft speculation) en builds recientes de llama.cpp mediante `--spec-type draft-mtp`.

## Capacidades

- Razonamiento con chain-of-thought: post-entrenado específicamente con trazas de razonamiento extensas; según la model card, supera al Qwen3.5-9B base en +34 puntos MMLU, +30 en gsm8k-strict y +19 en gsm8k-flex (datos del autor, no verificados de forma independiente).
- Generación de texto conversacional con plantilla de chat estándar de Qwen3.5.
- Function calling nativo conforme a la especificación Qwen3.5.
- Visión multimodal: descripción detallada de imágenes, OCR (impreso y manuscrito), lectura de gráficos y tablas, comprensión de UI/documentos y razonamiento espacial básico (heredado sin cambios de Qwen3.5-9B).
- Contexto ultralargo de 1M tokens para documentos extensos.
- Etiquetado por el autor como "uncensored", con énfasis en dominios de ciberseguridad y biomedicina (el ejemplo de la model card lo ilustra con toxicología química).
- Decodificación especulativa MTP en runtimes compatibles.

## Casos de uso

- Análisis de repositorios de código extensos: con 1M tokens de contexto puede ingerir bases de código completas y responder preguntas sobre arquitectura o depurar a través de múltiples ficheros.
- Revisión de documentos legales o técnicos largos: la ventana de 1M tokens permite procesar contratos, manuales o expedientes completos en una sola pasada sin chunking.
- Asistentes con function calling en local: el soporte nativo según la especificación Qwen3.5 permite integrarlo en pipelines de agentes que invocan herramientas, APIs o ejecutan acciones multi-paso.
- OCR y comprensión documental: combinando el mmproj con el modelo puede extraer texto de documentos escaneados, leer gráficos y tablas, y responder preguntas sobre capturas de UI.
- Investigación en seguridad ofensiva/defensiva: el etiquetado "uncensored" y el enfoque en ciberseguridad lo hacen adecuado para análisis de vulnerabilidades y redacción de exploits en entornos controlados, donde modelos con más filtros resultan limitados.
- Asistencia biomédica y química: el entrenamiento incluye dominio biomedical y el propio ejemplo de la model card muestra razonamiento bioquímico detallado.
- Chat local privado en consumer GPUs: con la cuantización Q4_K_M (5,63 GB) funciona en GPUs de 8 GB de VRAM vía Ollama o LM Studio, útil para despliegues sin conexión a nube.
- Servidores de inferencia de baja latencia: las variantes MTP con decodificación especulativa aceleran el throughput en llama-server para despliegues con varios usuarios.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el autor en la model card, que comparan contra el modelo base Qwen3.5-9B bajo evaluación emparejada:

| Benchmark | Mejora sobre Qwen3.5-9B base |
|---|---|
| MMLU | +34 puntos |
| gsm8k-strict | +30 puntos |
| gsm8k-flex | +19 puntos |

No se han publicado valores absolutos de benchmarks ni comparativas con otros modelos de la categoría en la información disponible.

## Requisitos de hardware

- Q4_K_M: 5,63 GB de pesos; funciona en GPUs de consumo con 8 GB de VRAM (RTX 3060, RTX 4060) dejando margen para contexto moderado.
- Q5_K_M: 6,47 GB; recomendable 8-12 GB de VRAM.
- Q6_K: 7,36 GB; cómodo en RTX 4070/4080 o 12 GB de VRAM.
- Q8_0: 9,53 GB; requiere GPUs de 12-16 GB (RTX 4080/4090).
- BF16: 17,92 GB; necesita RTX 4090 (24 GB) o superior para carga completa en GPU.
- El mmproj de visión añade 0,92 GB adicionales.
- Contextos de 1M tokens requieren memoria KV cache considerable; para contextos muy largos se necesita VRAM adicional sustancial o descarga a RAM/CPU (offload parcial en llama.cpp).
- GPUs de datacenter adecuadas: A100 o H100 para servir el modelo a máxima precisión con contextos largos y múltiples usuarios.
- Despliegue soportado: llama.cpp (CLI, server, llama-mtmd-cli), Ollama, LM Studio, jan y KoboldCpp. Las variantes MTP requieren builds recientes de llama.cpp.
- Parámetros de muestreo recomendados por el autor: temperature 0,6, top-p 0,95, top-k 20, repeat penalty 1,05.
- Latencia y throughput: no disponible (no se publican mediciones; la decodificación especulativa MTP debería mejorar el throughput en runtimes compatibles).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwythos-9B-Claude-Mythos-5-1M | ~8,95B | 1M (YaRN) | Sí (visión Qwen3.5) | Apache 2.0 | Razonamiento post-entrenado, function calling, MTP |
| Qwen3.5-9B (base) | ~9B | no disponible en la información proporcionada | Sí | no disponible | Modelo base; Qwythos lo supera según el autor en MMLU, GSM8K |
| Qwen3-8B | ~8B | hasta 128K (con YaRN) | Variantes text-only | Apache 2.0 | Generación anterior de Qwen; contexto mucho menor que Qwythos |

Nota: la comparativa se limita a la familia Qwen por ser el linaje documentado del modelo; no se dispone de datos de rendimiento comparados con otras familias.

## Limitaciones y advertencias

- Los datos de benchmarks provienen exclusivamente del autor del modelo (Empero AI) y no han sido verificados de forma independiente.
- El entrenamiento fue solo textual: la torre de visión está congelada y hereda las capacidades (y limitaciones) de visión del Qwen3.5-9B base, sin mejora por el SFT.
- Etiquetado como "uncensored": el modelo carece de los filtros de seguridad habituales, lo que implica mayor riesgo de generar contenido dañino; su uso requiere salvaguardas adicionales en producción.
- El ejemplo de la model card incluye contenido sobre agentes nerviosos, lo que ilustra el enfoque sin restricciones del modelo; evaluar la legalidad y ética del uso en cada jurisdicción.
- Idioma declarado: inglés. El rendimiento en castellano no está documentado.
- La decodificación especulativa MTP requiere builds recientes de llama.cpp; en runtimes sin soporte deben usarse las variantes normales.
- Contextos cercanos a 1M tokens exigen memoria KV cache muy elevada, poco práctica en hardware de consumo.
- Riesgo de alucinación: no disponible (no se documentan mediciones específicas).
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque los pesos derivan de Qwen3.5-9B, cuya licencia debe verificarse para cumplimiento en cadena de derivación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Zaidusht/Qwythos-9B-Claude-Mythos-5-1M-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Web de Empero: https://empero.org
- llama.cpp: https://github.com/ggml-org/llama.cpp
