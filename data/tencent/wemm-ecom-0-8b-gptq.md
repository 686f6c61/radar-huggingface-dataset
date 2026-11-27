# tencent/WeMM-Ecom-0.8B-GPTQ

## Resumen

WeMM-Ecom-0.8B-GPTQ es la versión cuantizada en GPTQ W4A16 del modelo multimodal WeMM-Ecom-0.8B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el contexto del comercio electrónico de WeChat. El modelo resuelve la necesidad de procesar y entender de forma conjunta texto, imágenes, múltiples imágenes y vídeo en escenarios de e-commerce: atributos de producto, moderación de contenido, OCR, recuperación, grounding y razonamiento sobre fichas de producto.

Se trata de un modelo denso de 0,8 mil millones de parámetros (852.985.920 exactos según los pesos safetensors) construido sobre la arquitectura `qwen3_5` y publicado con una ventana de contexto de 262.144 tokens. La variante GPTQ reduce el peso de los pesos a 4 bits con activaciones de 16 bits, lo que facilita el despliegue en hardware más modesto manteniendo el codificador visual y determinadas proyecciones sensibles en su precisión original.

Su relevancia actual radica en que forma parte de una familia completa (0.8B, 2B, 4B, 9B y 35B-A3B) que, según el autor, supera a Qwen3.5-0.8B en 16,43 puntos y a MiniCPM-V-4.7-1B en 13,03 puntos en la media de benchmarks de e-commerce, manteniendo capacidades generales competitivas. La licencia Apache 2.0 y la disponibilidad en múltiples formatos (BF16, FP8, GPTQ, GGUF) lo hacen apto tanto para investigación como para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, familia `qwen3_5` (transformer multimodal) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ W4A16 (4 bits pesos, 16 bits activaciones); disponibles también BF16, FP8 y GGUF en la familia |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato `compressed-tensors` (grupos de 128, cuantización simétrica) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal denso de 0,8B parámetros que acepta entradas de texto, imagen, múltiples imágenes y vídeo, y genera texto. La arquitectura se etiqueta como `qwen3_5`, lo que indica que reutiliza el diseño base de la familia Qwen 3.5 adaptado a un pipeline `image-text-to-text`. Incorpora un codificador visual y un cabezal de salida que, en esta variante GPTQ, se mantienen en su precisión original junto con determinadas proyecciones sensibles, mientras que el resto de pesos se cuantizan a 4 bits con grupos de 128 valores y cuantización simétrica.

El autor no detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card menciona un informe técnico (arXiv:2611.30662) que contiene la evaluación completa sobre 28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorías, pero los datos concretos de entrenamiento no se especifican. Una innovación destacable es el soporte de *hybrid thinking*, es decir, modos de instrucción y de razonamiento explícito, evaluados por separado en los benchmarks publicados.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes, múltiples imágenes y vídeo.
- Comprensión fina de e-commerce: atributos de producto, moderación de contenido, OCR, recuperación, grounding y conocimiento de producto.
- Modo de razonamiento híbrido (*thinking mode*) además del modo instrucción directa.
- Conversación multi-turno con ventana de contexto de 262.144 tokens.
- Capacidades generales de VQA, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen y seguimiento de instrucciones.
- Soporte multilingüe limitado a chino e inglés.
- No se documenta en la información disponible soporte explícito de tool calling o function calling, ni de audio.

## Casos de uso

- Moderación de contenido en marketplaces: el modelo puede analizar imágenes y texto de anuncios para detectar productos prohibidos o contenido inapropiado, apoyándose en sus benchmarks específicos de moderación y en la ventana de 262.144 tokens para procesar lotes grandes.
- Extracción de atributos de producto: a partir de fotos de producto y descripciones, el modelo genera fichas estructuradas con color, material, talla y categoría, usando el modo instrucción para respuestas deterministas.
- OCR y digitalización de etiquetas: lectura de texto en imágenes de envases y etiquetas para poblar catálogos, aprovechando las capacidades de OCR evaluadas por el autor.
- Búsqueda y recuperación multimodal: generación de descripciones y representaciones textuales de imágenes de producto para alimentar motores de búsqueda o sistemas de recomendación.
- Asistencia al vendedor: chatbot multi-turno que responde dudas sobre productos a partir de imágenes y texto, con contexto largo para conservar el historial de la conversación.
- Análisis de vídeo de producto: revisión de vídeos cortos de demostración para verificar que el contenido coincide con la descripción y detectar inconsistencias.
- Enriquecimiento de catálogo a gran escala: despliegue con vLLM y el backend `compressed-tensors` para procesar lotes de imágenes y textos en pipelines de ingesta.

## Benchmarks y rendimiento

La model card incluye comparativas en forma de gráficos e imágenes (no tablas de texto) para el checkpoint BF16 de WeMM-Ecom-0.8B. Los únicos datos numéricos textuales proporcionados son las diferencias medias frente a modelos comparables:

| Comparación | Diferencia media (escala 0-100) |
|---|---|
| E-commerce vs. Qwen3.5-0.8B | +16,43 puntos |
| E-commerce vs. MiniCPM-V-4.7-1B | +13,03 puntos |
| General vs. Qwen3.5-0.8B | +6,93 puntos |
| General vs. MiniCPM-V-4.7-1B | +1,09 puntos |

No se han publicado en la información disponible los valores absolutos por benchmark (MMLU, HumanEval, GSM8K u otros) ni los resultados específicos de esta variante GPTQ; el autor indica que las cifras corresponden al checkpoint BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,0 GB, por lo que la cuantización W4A16 cabe holgadamente en GPUs con 4-8 GB de VRAM, dejando margen para caché KV con contextos largos.
- GPU recomendadas: A100, H100 o L40S para serving de producción con vLLM; RTX 4090, RTX 3090 o incluso GPUs consumer de gama media para desarrollo y pruebas.
- Cabe en GPU consumer: sí, en tarjetas con al menos 8 GB de VRAM para contextos moderados; contextos cercanos a 262.144 tokens requieren más memoria por la caché KV.
- Opciones de despliegue: vLLM (>= 0.31.0) con backend `compressed-tensors` es la vía documentada; la familia ofrece también GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-0.8B-GPTQ | 0,85B | 262.144 | Apache 2.0 | Safetensors GPTQ, BF16, FP8, GGUF | Especializado en e-commerce |
| Qwen3.5-0.8B | 0,8B (aprox.) | No disponible | No disponible | No disponible | Referencia del autor; superado en +16,43 (e-commerce) y +6,93 (general) |
| MiniCPM-V-4.7-1B | 1B (aprox.) | No disponible | No disponible | No disponible | Referencia del autor; superado en +13,03 (e-commerce) y +1,09 (general) |

Los datos de contexto, licencia y formatos de los modelos comparables no se detallan en la información proporcionada; solo se conocen las diferencias medias de rendimiento reportadas por el autor.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al estar entrenado sobre datos de e-commerce de WeChat, puede reflejar sesgos del dominio y de la plataforma.
- Alucinación: como todo modelo generativo multimodal, puede producir atributos de producto o descripciones inexactas; conviene validar en producción.
- Contexto: aunque la ventana es de 262.144 tokens, el uso de contextos muy largos incrementa la memoria de la caché KV y puede degradar la latencia.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE del repositorio y las condiciones de los datos de entrenamiento no especificadas.
- Cuantización: la variante GPTQ puede presentar una ligera pérdida de precisión frente al checkpoint BF16; el autor no publica la degradación exacta por benchmark.
- Tool calling y agentes: no se documenta soporte explícito, por lo que no debe asumirse en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GPTQ
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-0.8B-FP8
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Colección de la familia: https://huggingface.co/collections/tencent/wemm-ecom
- Informe técnico (arXiv): https://arxiv.org/abs/2611.30662
- Paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GPTQ/blob/main/LICENSE
- Documentación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
