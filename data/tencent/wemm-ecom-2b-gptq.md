# tencent/WeMM-Ecom-2B-GPTQ

## Resumen

WeMM-Ecom-2B-GPTQ es la versión cuantizada en GPTQ W4A16 del modelo multimodal WeMM-Ecom-2B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el contexto del comercio electrónico de WeChat. El modelo resuelve el problema de interpretar de forma fina imágenes de producto, atributos, tareas de moderación, OCR y razonamiento visual dentro de flujos de e-commerce, manteniendo además capacidades generales de visión-lenguaje comparables a modelos del mismo tamaño. Es relevante ahora porque ofrece un checkpoint de 2B parámetros con ventana de contexto de 262.144 tokens, empaquetado en formato `compressed-tensors` listo para servir con vLLM, y con licencia Apache 2.0.

La arquitectura es un transformer denso de 2B parámetros (identificado en los tags como `qwen3_5`), con soporte de entradas de texto, imagen, multi-imagen y vídeo. El checkpoint cuantizado conserva el encoder visual, la cabeza de salida y determinadas proyecciones sensibles en su precisión original, mientras que el resto de pesos se almacenan en 4 bits con grupos de 128 valores y cuantización simétrica.

La relevancia práctica del modelo reside en su doble perfil: por un lado, supera a Qwen3.5-2B en 10,59 puntos y a LFM3-VL-2B en 6,16 puntos en la media de benchmarks de e-commerce; por otro, mantiene una ventaja de 4,45 y 2,43 puntos respectivamente en la media de benchmarks generales. Todo ello en un tamaño que permite despliegue en GPU de consumo y en infraestructura de servidor con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia `qwen3_5`), multimodal imagen-texto |
| Parametros totales | 2.213.241.664 (2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ W4A16 (4 bits pesos, 16 bits activaciones), grupos de 128, simetrica; disponibles tambien BF16, FP8 y GGUF en la familia |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato `compressed-tensors` (GPTQ) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 2B parámetros con un encoder visual acoplado para tareas de imagen-texto. La familia WeMM-Ecom se distribuye en cinco tamaños (0.8B, 2B, 4B, 9B y 35B-A3B, este último MoE), y la variante 2B emplea una arquitectura densa sin mezcla de expertos. El checkpoint cuantizado preserva en precisión original el encoder visual, la cabeza de salida y ciertas proyecciones sensibles, mientras que el resto del cuerpo se cuantiza a 4 bits con grupos de 128 valores y esquema simétrico, empaquetado en Safetensors con el formato `compressed-tensors`.

La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Sí se indica que el modelo soporta un modo de razonamiento híbrido ("hybrid thinking"), con modos Instruct y Thinking evaluados por separado en los benchmarks de la familia, y que la evaluación cubre 28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorías. Para los detalles de entrenamiento (datos, fases de alineación, receta de destilación o ajuste) es necesario consultar el informe técnico arXiv:2611.30662, no incluido en la información disponible.

## Capacidades

- Generación de texto y razonamiento multimodal sobre entradas de imagen, multi-imagen y vídeo.
- Comprensión fina de e-commerce: atributos de producto, moderación de contenido, OCR, recuperación, grounding y razonamiento sobre catálogo.
- Modo de razonamiento híbrido: modos Instruct y Thinking seleccionables según la tarea.
- Comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen e instrucciones complejas (según la suite de evaluación general).
- Soporte de conversaciones multi-turno con ventana de contexto de 262.144 tokens.
- Capacidades multilingües limitadas a chino e inglés.
- Compatibilidad con endpoints OpenAI a través de vLLM (streaming, texto, imagen, multi-imagen y vídeo).
- No se documenta en la información disponible soporte explícito de tool calling o function calling, ni capacidades de audio.

## Casos de uso

- Moderación de contenido en marketplace: el modelo puede clasificar imágenes de producto y detectar contenido prohibido o de riesgo (contrafacción, desnudos, violencia) usando el modo Instruct y su ventana de 262.144 tokens para procesar lotes largos de publicaciones en una sola llamada.
- Extracción de atributos de producto: a partir de una imagen de ficha, el modelo puede generar descripciones estructuradas (color, material, talla, categoría) y alimentar pipelines de catalogación automática, aprovechando su especialización en atributos de e-commerce.
- OCR y digitalización de etiquetas: lectura de texto en imágenes de producto, etiquetas, tickets y embalajes para poblar bases de datos de inventario, con soporte multi-imagen para comparar varias vistas de un mismo artículo.
- Búsqueda visual y grounding: generación de descripciones y regiones de interés sobre imágenes de producto para motores de búsqueda visual y sistemas de recomendación, usando las capacidades de grounding y recuperación evaluadas en la suite de e-commerce.
- Asistente de atención al cliente multimodal: conversaciones multi-turno donde el usuario adjunta fotos de producto o capturas de pedido, con contexto largo para mantener el hilo de la conversación y el historial de imágenes.
- Análisis de vídeo de demostración de producto: el soporte de entrada de vídeo permite resumir o extraer información de clips cortos de demostración, útil para generación automática de fichas y descripciones a partir de vídeos de vendedores.
- Despliegue en GPU de consumo: al ser un modelo de 2B en W4A16, puede ejecutarse en estaciones de trabajo con una sola GPU consumer para prototipado y pruebas internas antes de escalar a producción con vLLM.

## Benchmarks y rendimiento

La model card presenta los resultados del checkpoint BF16 WeMM-Ecom-2B (no del GPTQ) en forma de gráficos e imágenes, sin tablas numéricas completas en el texto extraído. Los datos agregados disponibles son:

| Comparativa | Diferencia media (puntos, escala 0-100) |
|---|---|
| E-commerce: WeMM-Ecom-2B vs Qwen3.5-2B | +10,59 |
| E-commerce: WeMM-Ecom-2B vs LFM3-VL-2B | +6,16 |
| General: WeMM-Ecom-2B vs Qwen3.5-2B | +4,45 |
| General: WeMM-Ecom-2B vs LFM3-VL-2B | +2,43 |

La evaluación cubre 28 benchmarks de e-commerce en ocho escenarios (atributos de producto, moderación, OCR, recuperación, grounding, razonamiento, benchmarks públicos de e-commerce y conocimiento de producto) y 64 benchmarks generales en ocho categorías (VQA general, documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, multi-imagen, seguimiento de instrucciones y tareas centradas en texto). Los resultados desglosados por benchmark están en las imágenes de la model card y en el informe técnico; no se dispone de los valores numéricos individuales en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un checkpoint W4A16 de 2B parámetros, los pesos ocupan aproximadamente 1,1-1,3 GB; con overhead de activaciones, KV cache y encoder visual, se recomienda un mínimo de 6-8 GB de VRAM para contextos moderados y 16-24 GB para aprovechar ventanas de contexto largas.
- GPU recomendadas: A100 40/80 GB, H100 80 GB y L40S para producción con vLLM; RTX 4090 y RTX 3090 para desarrollo y pruebas; RTX 4060 Ti 16 GB o superiores para uso en consumer.
- Cabe en GPU consumer: sí, en tarjetas con al menos 8 GB de VRAM para contextos cortos y 16 GB o más para contextos largos.
- Opciones de despliegue: vLLM (>=0.31.0) con backend `compressed-tensors` es la vía documentada por el autor; también existen variantes GGUF de la familia para llama.cpp y Ollama, y variantes FP8 y BF16 para otros motores.
- Latencia y throughput: no se han publicado cifras de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-2B-GPTQ | 2B denso | 262.144 | Apache 2.0 | HF (GPTQ, BF16, FP8, GGUF) | Especializado en e-commerce, +10,59 pts vs Qwen3.5-2B en e-commerce |
| Qwen3.5-2B | 2B (no confirmado) | No disponible | No disponible | No disponible | Referencia de comparación en la model card |
| LFM3-VL-2B | 2B (no confirmado) | No disponible | No disponible | No disponible | Referencia de comparación en la model card |
| WeMM-Ecom-35B-A3B | 35B totales, MoE | No disponible | Apache 2.0 | HF | Variante superior de la misma familia, supera a modelos abiertos de cientos de miles de millones de parámetros según el autor |

Los datos de Qwen3.5-2B y LFM3-VL-2B se limitan a las diferencias medias reportadas por el autor; no se dispone de sus fichas técnicas completas en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Sesgos: no se documentan sesgos específicos en la información disponible; como modelo entrenado sobre datos de e-commerce de WeChat, puede heredar sesgos de dominio y de distribución de catálogo.
- Alucinación: no se han publicado tasas de alucinación ni evaluaciones de fidelidad factual; en tareas de OCR o atributos de producto conviene validar las salidas contra fuentes estructuradas.
- Cuantización: el checkpoint GPTQ W4A16 puede presentar una degradación de precisión respecto al BF16 original; el autor no publica en la información disponible una comparativa numérica GPTQ vs BF16.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones de los datos de entrenamiento subyacentes.
- Tool calling y agentes: no se documenta soporte explícito de function calling ni de razonamiento multi-paso agéntico; no asumir estas capacidades sin validación.
- Contexto largo: aunque se declara una ventana de 262.144 tokens, no se han publicado evaluaciones de rendimiento en contextos extremos (long-context retrieval) en la información disponible.
- Despliegue: el uso de vLLM con backend `compressed-tensors` requiere versiones recientes (>=0.31.0); versiones anteriores pueden no cargar el checkpoint correctamente.

## Enlaces

- Hugging Face (checkpoint GPTQ): https://huggingface.co/tencent/WeMM-Ecom-2B-GPTQ
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-2B
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-2B-FP8
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF
- Familia 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Familia 4B: https://huggingface.co/tencent/WeMM-Ecom-4B
- Familia 9B: https://huggingface.co/tencent/WeMM-Ecom-9B
- Familia 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Colección en Hugging Face: https://huggingface.co/collections/tencent/wemm-ecom
- Informe técnico (arXiv): https://arxiv.org/abs/2611.30662
- Página del paper en HF: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-2B-GPTQ/blob/main/LICENSE
- Documentación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
