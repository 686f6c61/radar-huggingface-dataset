# Sunbird-experimental/sunflower-qwen3.5-9b-sft

## Resumen

Sunflower-Qwen3.5-9B-sft es un modelo de lenguaje multimodal (imagen-texto) desarrollado por Sunbird-experimental como fine-tuning supervisado (SFT) del modelo base Sunbird-experimental/sunflower-qwen3.5-9b-base. Este base es una adaptación de Qwen3.5-9B, un modelo de 9.400 millones de parámetros, optimizado originalmente para comprender 67 lenguas africanas, con especial énfasis en traducción, seguimiento de instrucciones y chat multi-turno. La versión SFT, sin embargo, está etiquetada como entrenada en inglés (tag `en`), lo que sugiere un ajuste orientado a tareas conversacionales en ese idioma, manteniendo la arquitectura multimodal del modelo original.

El modelo se distribuye bajo licencia Apache-2.0, con acceso restringido (gated) en HuggingFace, y está disponible en formato safetensors. Su pipeline `image-text-to-text` indica que puede procesar tanto imágenes como texto, lo que lo hace adecuado para tareas que combinan visión y lenguaje. Aunque no se han publicado benchmarks específicos, su tamaño (9,4B parámetros) lo sitúa en la gama de modelos eficientes para despliegue en GPUs de consumo medio, y su origen en Qwen3.5 sugiere capacidades sólidas en razonamiento y generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3.5-9B (arquitectura no especificada en la informacion disponible) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existe version bnb-4bit del modelo base, no de este SFT) |
| Idiomas soportados | Ingles (segun tag `en`); el modelo base soporta 67 lenguas africanas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del base Sunbird-experimental/sunflower-qwen3.5-9b-base, que a su vez es una adaptacion de Qwen3.5-9B. No se proporcionan detalles sobre la arquitectura interna (si es transformer decoder-only, si incorpora atencion lineal, etc.) ni sobre el dataset de entrenamiento, el numero de tokens o el proceso de alineacion (RLHF/DPO). Las etiquetas indican el uso de las librerias `unsloth` y `trl`, lo que sugiere un entrenamiento eficiente con tecnicas como LoRA o QLoRA, aunque no se confirma si el SFT fue full-parameter o parcial. El pipeline `image-text-to-text` implica que el modelo acepta entradas multimodales, probablemente mediante un codificador de vision integrado, pero no se especifica su arquitectura.

## Capacidades

- Generacion de texto y chat multi-turno: al ser un modelo conversacional, puede mantener dialogos coherentes y seguir instrucciones.
- Procesamiento multimodal: acepta imagenes y texto como entrada, lo que permite tareas como descripcion de imagenes, respuesta a preguntas visuales o analisis de documentos escaneados.
- Traduccion automatica: el modelo base esta optimizado para 67 lenguas africanas, aunque este SFT esta etiquetado en ingles; es probable que conserve cierta capacidad multilingue residual.
- Razonamiento y comprension: al derivar de Qwen3.5-9B, se espera un rendimiento solido en tareas de razonamiento logico y comprension lectora, aunque no hay benchmarks publicados.
- Tool calling: no confirmado en la informacion disponible; el tag `tool-sft-poc` de un modelo relacionado sugiere que podria existir soporte experimental, pero no es aplicable a este SFT.

## Casos de uso

- Asistente conversacional en ingles: el modelo puede integrarse en chatbots o asistentes virtuales para atender consultas de clientes, gracias a su capacidad de chat multi-turno y su tamano moderado que permite inferencia en tiempo real.
- Analisis de documentos con imagenes: al ser multimodal, puede procesar facturas, formularios o capturas de pantalla y extraer informacion relevante, combinando OCR con comprension del contexto.
- Traduccion asistida en entornos multilingues: aunque el SFT esta en ingles, el modelo base soporta lenguas africanas; si se utiliza el base o se hace un fine-tuning adicional, podria emplearse para traduccion automatica en regiones con escasez de recursos.
- Generacion de descripciones de productos: dado su pipeline imagen-texto, puede generar textos descriptivos a partir de imagenes de productos, util para comercio electronico.
- Moderacion de contenido visual: puede analizar imagenes y texto asociado para detectar contenido inapropiado, combinando vision y lenguaje.
- Educacion y tutoria: puede responder preguntas sobre materiales de estudio que incluyan diagramas o figuras, ofreciendo explicaciones basadas en el contenido visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo SFT especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parametros, en precision FP16 se requieren aproximadamente 19 GB de VRAM; en 8 bits, unos 10 GB; en 4 bits, unos 5 GB. Estas cifras son estimaciones orientativas basadas en el numero de parametros, no en mediciones oficiales.
- GPU recomendadas: para FP16, una GPU con 24 GB (p. ej., RTX 3090, RTX 4090, A10G) es adecuada; para cuantizacion 4 bits, una GPU con 8-12 GB (p. ej., RTX 3060, RTX 4070) puede ser suficiente.
- Compatibilidad con GPU de consumo: si, especialmente con cuantizacion 4 bits, aunque el acceso restringido y el tamano del repo (56,5 GB) pueden dificultar la descarga en entornos limitados.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se mencionan integraciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. Como referencia, otros modelos de ~9B como Qwen2.5-7B, Llama-3.1-8B o Mistral-7B tienen parametros similares, pero no se conocen los resultados de este SFT en benchmarks estandar. La principal diferencia es su naturaleza multimodal y su origen en Qwen3.5, que podria ofrecer mejor rendimiento en tareas de vision-lenguaje, pero sin datos publicados no es posible cuantificarlo.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos corporativos o academicos que necesiten acceso inmediato.
- Sesgos y alucinaciones: al ser un modelo de 9B, es propenso a generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Limitaciones de idioma: aunque el modelo base soporta 67 lenguas africanas, este SFT esta etiquetado en ingles; su rendimiento en otros idiomas puede ser inferior o no estar optimizado.
- Falta de documentacion: no se proporcionan detalles sobre el dataset de SFT, el proceso de entrenamiento ni los benchmarks, lo que dificulta evaluar su calidad y reproducibilidad.
- Requisitos de hardware: el tamano del repo (56,5 GB) y la necesidad de VRAM para FP16 pueden ser prohibitivos para despliegues en hardware limitado.
- Licencia: Apache-2.0 permite uso comercial, pero el acceso gated puede imponer restricciones adicionales no especificadas.

## Enlaces

- Modelo SFT en HuggingFace: https://huggingface.co/Sunbird-experimental/sunflower-qwen3.5-9b-sft
- Modelo base Sunbird/Sunflower-Qwen3.5-9B: https://huggingface.co/Sunbird/Sunflower-Qwen3.5-9B
- Documentacion SALT: https://salt.sunbird.ai/models/sunflower-qwen3.5-9b/
- Version bnb-4bit del modelo base: https://huggingface.co/Sunbird/Sunflower-Qwen3.5-9B-bnb-4bit
- Pagina en FriendliAI: https://friendli.ai/models/Sunbird/Sunflower-Qwen3.5-9B
- Modelo relacionado (tool-sft-poc): https://friendli.ai/models/ak3ra/sunflower-qwen3.5-9b-tool-sft-poc
