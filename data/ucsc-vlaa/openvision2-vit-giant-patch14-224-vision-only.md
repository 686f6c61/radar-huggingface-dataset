# UCSC-VLAA/openvision2-vit-giant-patch14-224-vision-only

## Resumen

OpenVision2 es una familia de modelos de encoders visuales generativos preentrenados desarrollada por el grupo UCSC-VLAA de la Universidad de California en Santa Cruz. Este repositorio concreto contiene el modelo completo de generación de captions: un encoder visual ViT-gigante con patch de 14 píxeles a resolución 224 y un decoder de texto autoregresivo entrenados conjuntamente. La principal innovación de OpenVision2 es eliminar el text encoder y la pérdida contrastiva típica de modelos CLIP, simplificando el entrenamiento a una supervisión exclusiva con captions.

El modelo está pensado para la generación de descripciones densas estilo LLaVA (multi-frase y detalladas) a partir de imágenes, y también sirve como encoder visual reutilizable para sistemas multimodales. La arquitectura combina un ViT gigante como encoder con un decoder prefix-LM de 24 capas y 1024 de ancho, que concatena los tokens visuales como prefijo bidireccional y genera el texto de forma causal. El repositorio pesa 5,5 GB e incluye el código de ejemplo para ejecutar la generación de captions de extremo a extremo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-giant patch14 + decoder transformador prefix-LM autoregresivo |
| Parámetros totales | no disponible (repo de 5,5 GB) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles (el tokenizer usa vocabulario de 32 000 tokens, sin especificar idioma) |
| Licencia | no disponible |
| Formato de pesos | open_clip_pytorch_model.bin (encoder), caption_decoder.safetensors (decoder), config JSON |

## Arquitectura y entrenamiento

El modelo combina un encoder visual ViT-giant con patch de 14 píxeles y resolución de entrada de 224 píxeles, preentrenado con supervisión de capturas (caption-only). El encoder produce tokens de imagen que se proyectan linealmente y se concatenan como prefijo bidireccional en un decoder transformer de 24 capas, ancho 1024, 16 cabezas y MLP de 4096. El decoder genera texto de forma causal atendiendo a todos los tokens de imagen (prefix-LM), sin embedding posicional en el flujo de texto. Usa pre-LayerNorm, activación gelu(tanh) y epsilon de LayerNorm de 1e-6. El entrenamiento se realiza en infraestructura TPU y el código está disponible en el repositorio GitHub de OpenVision. No se ha publicado información detallada sobre el volumen de datos de entrenamiento ni el proceso de alineación (RLHF/DPO).

## Capacidades

- Generación de captions densas y detalladas estilo LLaVA (multi-frase, descriptivas).
- Encoder visual reutilizable para embeddings de imagen, compatible con open_clip.
- Generación de texto causal a partir de imágenes con un decoder prefix-LM.
- No soporta tool calling, ni razonamiento multi-step, ni agentes.
- No incluye capacidades de visión más allá de la codificación de imagen y la generación de texto.
- No se especifican capacidades multilingües.

## Casos de uso

- Anotación automática de imágenes: el modelo puede generar descripciones detalladas de imágenes de forma automática, útil para construir datasets de entrenamiento o enriquecer bases de datos visuales.
- Generación de alt-text para accesibilidad: al producir captions densas, se puede integrar en pipelines que generan descripciones alternativas para personas con discapacidad visual.
- Preentrenamiento de sistemas multimodales: el encoder ViT-giant puede servir como backbone visual para modelos de visión-lenguaje, eliminando la necesidad de un text encoder separado.
- Búsqueda de imágenes por texto: las captions generadas se pueden indexar para permitir búsquedas semánticas sobre colecciones de imágenes.
- Investigación en aprendizaje multimodal: el modelo ofrece una alternativa open-source y simplificada a arquitecturas contrastivas como CLIP, útil para experimentar con entrenamiento generativo de encoders.
- Anotación de imágenes médicas o técnicas: aunque no se especifica, la generación de captions densas puede aplicarse a dominios específicos si se realiza fine-tuning con datos del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio pesa 5,5 GB, por lo que la inferencia en fp32 requiere al menos 5,5 GB de VRAM; en fp16 la estimación es de ~2,8 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (por ejemplo, RTX 2070, RTX 3060, RTX 4090, A10, A100).
- No cabe en GPUs de menos de 4 GB de VRAM en fp32.
- Opciones de despliegue: se incluye un script de ejemplo `caption_example.py` que usa open_clip y PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, CLIP, SigLIP, CoCa) en cuanto a rendimiento o parámetros exactos. La arquitectura se diferencia de CLIP por eliminar el text encoder y la pérdida contrastiva, y de CoCa por usar un decoder prefix-LM en lugar de atención cruzada. La licencia y los parámetros totales no están publicados, lo que impide una comparación cuantitativa.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial.
- No hay información sobre sesgos o riesgos de alucinación en las captions generadas.
- La generación de captions puede producir descripciones inexactas o inventadas en imágenes complejas o ambiguas.
- El modelo tiene solo 5 descargas y 1 like en HuggingFace, lo que sugiere que no está ampliamente probado en producción.
- No se especifica el idioma de las captions ni la cobertura multilingüe.
- El decoder no usa embeddings posicionales en el flujo de texto, lo que puede limitar la coherencia de secuencias largas, aunque la longitud de contexto no se ha publicado.
- El encoder está fijado a una resolución de 224 píxeles, lo que puede perder detalles de imágenes de alta resolución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/UCSC-VLAA/openvision2-vit-giant-patch14-224-vision-only
- Página del proyecto OpenVision 2: https://ucsc-vlaa.github.io/OpenVision2/
- Repositorio GitHub OpenVision: https://github.com/UCSC-VLAA/OpenVision
- Colección OpenVision 2 en HuggingFace: https://huggingface.co/collections/UCSC-VLAA/openvision-2
