# vnbot-ai/VNBot-MotaZ-27B-GPTQ-W8A16

## Resumen

VNBot-MotaZ-27B-GPTQ-W8A16 es una cuantización de 8 bits en formato GPTQ del modelo multimodal VNBot-MotaZ-27B, desarrollado por vnbot-ai (Origo Technologies) como asistente de IA orientado a texto e imagen en vietnamita e inglés. El modelo base emplea la arquitectura Qwen3.5 (etiqueta `qwen3_5` en Hugging Face) y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La versión cuantizada reduce el peso de los pesos a 8 bits mediante GPTQ con formato W8A16 (pesos de 8 bits, activaciones de 16 bits), empaquetada con `compressed-tensors` para su uso directo en vLLM y transformers. El repositorio ocupa 12,7 GB, aunque la model card del autor indica 32,5 GB para el artefacto GPTQ completo; la discrepancia puede deberse a la compresión de los safetensors o a una actualización posterior del repo.

Su relevancia radica en que ofrece una ventana de contexto declarada de 262.144 tokens en un modelo multimodal de 27B parámetros, un tamaño que cabe en GPUs de 40-48 GB con la cuantización de 8 bits, lo que lo hace desplegable en infraestructura relativamente modesta para tareas de document understanding y conversación multilingüe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal image-text-to-text, según tag `qwen3_5`) |
| Parámetros totales | 27B (según nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (según model card) |
| Tipos de cuantización | GPTQ 8-bit W8A16 (formato `compressed-tensors`) |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPTQ, `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo base VNBot-MotaZ-27B se etiqueta en Hugging Face con la arquitectura `qwen3_5`, lo que indica que deriva de la familia Qwen3.5 de Alibaba, un transformer decoder-only con capacidades multimodales (entrada de imagen y texto). Al tratarse de una cuantización, no se ha reentrenado: la versión GPTQ-W8A16 conserva los pesos del modelo original comprimidos a 8 bits mediante quantización post-entrenamiento con GPTQ y el formato `compressed-tensors`, que permite servir el modelo con kernels optimizados en vLLM.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado específico por parte de vnbot-ai. La model card solo indica que es el asistente de IA de Origo Technologies con soporte de texto e imagen en vietnamita e inglés. Tampoco se documentan innovaciones técnicas propias más allá de la cuantización.

## Capacidades

- Generación de texto conversacional en vietnamita e inglés.
- Comprensión de imágenes (pipeline `image-text-to-text`): el modelo acepta entradas de imagen junto con texto, lo que permite tareas de descripción, extracción de información y respuesta a preguntas sobre imágenes.
- Conversación multi-turno con contexto largo: la ventana declarada de 262.144 tokens permite mantener historiales extensos o procesar documentos completos.
- Razonamiento y generación de código: capacidades heredadas de la familia Qwen3.5, aunque no se documentan explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a vietnamita e inglés según los tags del repositorio.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en vietnamita e inglés: el modelo puede gestionar conversaciones multi-turno con historiales largos gracias a su ventana de 262.144 tokens, manteniendo el contexto de interacciones previas sin truncar. La cuantización de 8 bits reduce el coste de servir el modelo en producción.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer información de facturas, formularios o capturas de pantalla y responder preguntas sobre ellas, útil en flujos de digitalización para empresas vietnamitas.
- Análisis de contratos y textos legales largos: la ventana de contexto permite introducir documentos completos de decenas de miles de tokens y hacer preguntas de detalle sin trocear el texto.
- Asistente interno de soporte técnico: desplegado con vLLM sobre una GPU de 48 GB, puede atender consultas de empleados bilingües (vi/en) con latencia baja gracias a los kernels de `compressed-tensors`.
- Moderación y clasificación de contenido multimodal: puede analizar publicaciones con texto e imagen para detectar contenido inapropiado en plataformas dirigidas al mercado vietnamita.
- Generación de descripciones de producto: a partir de una imagen de producto, el modelo puede redactar fichas descriptivas en vietnamita e inglés para catálogos de comercio electrónico.
- Resumen de reuniones o hilos de correo extensos: con 262.144 tokens de contexto, puede resumir transcripciones o cadenas de correo completas en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 12,7 GB, pero la model card indica 32,5 GB para el artefacto GPTQ completo. Con pesos de 8 bits, se estima un consumo de unos 27-33 GB de VRAM solo para pesos, más overhead de KV cache (que crece con el contexto; a 262.144 tokens puede requerir decenas de GB adicionales).
- GPU recomendadas: A100 40GB/80GB, H100 80GB, L40S 48GB, RTX 6000 Ada 48GB. Para contextos completos de 262.144 tokens se necesitará probablemente H100 80GB o múltiples GPUs.
- GPU de consumo: no cabe en RTX 4090 (24 GB) con la cuantización de 8 bits a contexto completo; podría intentarse con contexto reducido y offloading, pero no es recomendable para producción.
- Opciones de despliegue: vLLM (recomendado por el autor, con `--max-model-len 262144`), transformers con `compressed-tensors`. llama.cpp/Ollama no soportan directamente GPTQ `compressed-tensors`; requerirían una conversión a GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VNBot-MotaZ-27B-GPTQ-W8A16 | 27B | 262.144 | Texto + imagen | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen2.5-VL-32B | 32B | 128K (típico) | Texto + imagen | Apache-2.0 | Hugging Face, ampliamente usado |
| Gemma 3 27B | 27B | 128K | Texto + imagen | Gemma license | Hugging Face |
| InternVL2.5-26B | 26B | 32K-128K | Texto + imagen | MIT/Apache-2.0 | Hugging Face |

La comparativa es orientativa: no se dispone de benchmarks del modelo VNBot que permitan una comparación cuantitativa de rendimiento. La principal ventaja declarada es la ventana de contexto de 262.144 tokens, superior a la de la mayoría de alternativas multimodales de tamaño similar.

## Limitaciones y advertencias

- El modelo solo declara soporte para vietnamita e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Al ser una cuantización GPTQ de 8 bits, puede haber una degradación ligera de calidad respecto al modelo base en tareas sensibles a la precisión numérica (matemáticas, código).
- No se han publicado evaluaciones de sesgos, alucinación ni robustez; se desconoce el comportamiento en dominios especializados.
- La discrepancia entre el tamaño del repo (12,7 GB) y el indicado en la model card (32,5 GB) debe verificarse antes de desplegar; podría tratarse de un repo incompleto o de una actualización pendiente.
- El modelo tiene 0 descargas y 1 like en Hugging Face en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Aunque la licencia es Apache-2.0 (permite uso comercial), el modelo base podría arrastrar obligaciones de la licencia Qwen3.5; conviene revisar el fichero `NOTICE` mencionado en la model card.
- El contexto de 262.144 tokens requiere una KV cache muy grande; en la práctica, la mayoría de despliegues tendrán que reducir `--max-model-len`, lo que limita la ventaja principal del modelo.
- No hay información sobre tool calling ni capacidades de agente, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B-GPTQ-W8A16
- Modelo base: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B
- Repositorio de vLLM (despliegue recomendado): https://github.com/vllm-project/vllm
- Documentación de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Paper de GPTQ: https://arxiv.org/abs/2210.17323
