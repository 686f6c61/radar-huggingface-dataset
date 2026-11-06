# ss-lab/NVIDIA-Nemotron-3-Nano-4B-FP8-GGUF

## Resumen

NVIDIA-Nemotron-3-Nano-4B-FP8-GGUF es una conversión a formato GGUF del checkpoint FP8 de Nemotron-3-Nano-4B, un modelo de lenguaje de la familia Nemotron de NVIDIA orientado a generación de texto conversacional. El modelo original fue publicado por NVIDIA y redistribuido en FP8 por Unsloth; esta versión concreta la produce el usuario ss-lab mediante llama.cpp para facilitar su despliegue en entornos de inferencia local con cuantización de baja precisión.

El modelo cuenta con 3.973.556.832 parámetros (aproximadamente 4 mil millones), lo que lo sitúa en la categoría de modelos pequeños optimizados para ejecución en hardware de consumo. La conversión ofrece múltiples niveles de cuantización (desde Q4_0 hasta BF16/F16) para adaptarse a distintos presupuestos de memoria, y está etiquetada como compatible con endpoints conversacionales.

Es relevante para desarrolladores que necesitan un modelo compacto de la familia Nemotron con despliegue en llama.cpp, Ollama o servidores compatibles con GGUF, sin depender de infraestructura GPU de datacenter. No obstante, la información publicada por el autor de esta conversión es mínima y no incluye detalles sobre arquitectura interna, datos de entrenamiento ni evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Nemotron; detalles no publicados en la información disponible) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16, F16 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones concretas no especificadas) |
| Formato de pesos | GGUF (convertido desde safetensors FP8 con llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por la nomenclatura (Nemotron-3-Nano) y el tamaño de parámetros, se trata de un transformer de aproximadamente 4 mil millones de parámetros, pero no se confirma en la información disponible si emplea atención estándar, atención lineal, arquitectura híbrida u otras variantes. Tampoco se detallan el número de capas, dimensiones ocultas ni el esquema de atención.

Respecto al entrenamiento, no se han publicado en esta ficha datos sobre volumen de tokens, composición del dataset, ni si hubo fases de RLHF, DPO o instrucción supervisada. El checkpoint del que deriva esta conversión es la versión FP8 publicada por Unsloth, a su vez derivada del modelo original de NVIDIA. La conversión a GGUF se realizó con llama.cpp; el autor aclara que el fichero Q4_0 se cuantizó directamente desde pesos F16 y no es el checkpoint QAD Q4_0 oficial.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` y el pipeline `text-generation`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Despliegue en ecosistema llama.cpp mediante formato GGUF, con varios niveles de cuantización.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- Cobertura multilingüe: no disponible (no se especifican idiomas).

## Casos de uso

- Inferencia local en estaciones de trabajo: el modelo puede ejecutarse con llama.cpp u Ollama usando los ficheros Q4_K_M o Q5_K_M, adecuados para GPUs de consumo con memoria limitada.
- Prototipado de asistentes conversacionales: al estar etiquetado como conversacional y ser compatible con endpoints, sirve para montar un chatbot de pruebas con una API compatible con OpenAI sin infraestructura dedicada.
- Despliegue en el borde o en dispositivos con poca VRAM: las cuantizaciones Q4 y Q5 reducen el espacio ocupado frente a BF16/F16, permitiendo ejecución en GPUs de gama media.
- Evaluación comparativa de cuantizaciones: el repositorio incluye siete formatos, lo que permite medir la degradación de calidad y el ahorro de memoria entre Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 y F16 sobre el mismo modelo.
- Integración en pipelines de generación de texto por lotes: con llama.cpp server se puede servir el modelo para tareas de resumen, redacción o clasificación simple a bajo coste.
- Base para ajuste fino o experimentación: al ser un modelo de ~4B, puede servir como punto de partida para experimentos de destilación o adaptación con LoRA, aunque la licencia debe revisarse antes de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en Q4_0/Q4_K_M; 3-3,5 GB en Q5_K_M; 3,5-4,5 GB en Q6_K; 4,5-5,5 GB en Q8_0; 8-9 GB en BF16/F16 (estimaciones a partir del número de parámetros; no confirmadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100/H100 no necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 6 GB o más para cuantizaciones Q4-Q5; 8 GB o más para Q8_0/F16.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF y endpoints compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-4B-FP8-GGUF (este) | ~3,97 B | no disponible | other | GGUF | Conversion comunitaria de un checkpoint FP8 de Unsloth |
| unsloth/NVIDIA-Nemotron-3-Nano-4B-FP8 | ~3,97 B | no disponible | other | safetensors (FP8) | Checkpoint base del que deriva esta conversion |
| Modelo original de NVIDIA (Nemotron-3-Nano-4B) | ~4 B | no disponible | no disponible | no disponible | Fuente primaria; detalles no incluidos en la informacion disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La información publicada por el autor de la conversión es mínima: no se documentan arquitectura, contexto, idiomas ni evaluación.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluación publicada que lo cuantifique.
- Sesgos: no documentados en la información disponible.
- Licencia "other": las condiciones exactas no se especifican en la model card; es imprescindible consultar la licencia del modelo original de NVIDIA antes de cualquier uso comercial.
- El fichero Q4_0 no es el checkpoint QAD Q4_0 oficial, sino una cuantización directa desde F16; puede diferir en calidad respecto al Q4_0 publicado por el autor original.
- Al ser una conversión comunitaria (no oficial), no hay garantía de soporte ni de mantenimiento por parte de NVIDIA o Unsloth.
- El tamaño del repositorio (32,5 GB) incluye todos los formatos; conviene descargar solo el fichero necesario.
- No se confirma soporte de tool calling ni de agentes; no asumir estas capacidades en producción sin validación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ss-lab/NVIDIA-Nemotron-3-Nano-4B-FP8-GGUF
- Modelo base (Unsloth, FP8): https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-4B-FP8
- llama.cpp (herramienta de conversión): https://github.com/ggerganov/llama.cpp
- No se han encontrado en la información disponible papers, blogs, demos ni repositorios adicionales del autor de esta conversión.
