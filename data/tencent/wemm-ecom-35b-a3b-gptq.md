# tencent/WeMM-Ecom-35B-A3B-GPTQ

## Resumen

WeMM-Ecom-35B-A3B-GPTQ es la versión cuantizada en GPTQ W4A16 del modelo multimodal WeMM-Ecom-35B-A3B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el contexto del comercio electrónico de WeChat. El modelo está diseñado para tareas de image-text-to-text con un enfoque específico en moda, productos, moderación de contenido, OCR, grounding y razonamiento sobre imágenes de producto, manteniendo al mismo tiempo capacidades generales de visión-lenguaje.

Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 35 000 millones de parámetros totales y aproximadamente 3000 millones de parámetros activos, construido sobre la base `qwen3_5_moe`. Dispone de una ventana de contexto de 262 144 tokens y soporta entradas de texto, imagen, multi-imagen y vídeo. La versión GPTQ reduce el peso a 4 bits con activaciones de 16 bits, lo que facilita el despliegue en infraestructura con menor VRAM manteniendo la precisión del codificador visual y de ciertas proyecciones sensibles.

La relevancia de esta ficha radica en que Tencent publica el modelo bajo licencia Apache 2.0, con formatos BF16, FP8, GPTQ y GGUF, y con un informe técnico que reporta mejoras frente a modelos comparables como Qwen3.5-35B-A3B, Qwen3.6-35B-A3B y MiniCPM-V-4.7-35B-A3B en benchmarks de comercio electrónico y capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre base `qwen3_5_moe`, multimodal image-text-to-text |
| Parametros totales | 35B (según model card); 5.954.701.156 parámetros en safetensors del checkpoint GPTQ |
| Parametros activos | ~3B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ W4A16 (4-bit pesos, 16-bit activaciones), grupos de 128 valores, cuantización simétrica; también disponible en BF16, FP8 y GGUF en el repo base |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato `compressed-tensors` (GPTQ empaquetado) |

## Arquitectura y entrenamiento

WeMM-Ecom-35B-A3B emplea una arquitectura MoE multimodal que combina un codificador visual con un transformer de lenguaje con mezcla de expertos. El modelo totaliza 35 000 millones de parámetros con aproximadamente 3000 millones activos por token, lo que permite un coste de inferencia reducido en comparación con modelos densos del mismo tamaño. Soporta entradas de texto, imagen única, multi-imagen y vídeo, y mantiene una ventana de contexto de 262 144 tokens.

La versión GPTQ aplica cuantización de pesos a 4 bits con activaciones de 16 bits (W4A16), usando grupos de 128 valores y cuantización simétrica, almacenada en formato `compressed-tensors`. El codificador visual, la cabeza de salida y determinadas proyecciones sensibles conservan su precisión original para preservar la calidad. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo soporta modos de razonamiento "instruct" y "thinking", según se desprende de las tablas de evaluación incluidas en la model card.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes y vídeo.
- Comprensión fina de contenido de comercio electrónico: atributos de producto, moderación, OCR, retrieval, grounding y razonamiento sobre productos.
- Respuesta a entradas de texto, imagen, multi-imagen y vídeo.
- Modo "thinking" (razonamiento extendido) e modo "instruct" (respuesta directa).
- Capacidades generales de VQA, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen y seguimiento de instrucciones.
- Soporte multilingüe limitado a chino (zh) e inglés (en).
- Servido mediante API compatible con OpenAI a través de vLLM.
- No se documenta explícitamente soporte de tool calling o function calling en la información disponible.
- No se documenta explícitamente soporte de agentes multi-paso en la información disponible.

## Casos de uso

- Moderación de contenido en marketplaces: el modelo puede analizar imágenes de producto y texto asociado para detectar contenido prohibido, falsificaciones o descripciones engañosas, aprovechando sus benchmarks específicos de moderación y su contexto de 262 144 tokens para procesar lotes grandes de fichas de producto.
- Generación automática de atributos de producto: a partir de imágenes y descripciones, el modelo extrae color, material, talla, categoría y otras propiedades, adecuado por su entrenamiento específico en atributos de comercio electrónico.
- OCR y extracción de datos de etiquetas y embalajes: el modelo puede leer texto en imágenes de producto, etiquetas y facturas, útil en pipelines de digitalización de catálogo.
- Búsqueda visual y retrieval multimodal: generar representaciones o descripciones enriquecidas de imágenes de producto para motores de búsqueda visual, apoyándose en las capacidades de grounding y retrieval evaluadas.
- Asistencia conversacional al comprador: gestión de conversaciones multi-turno con contexto largo (262 144 tokens) para resolver dudas sobre productos, comparar artículos o recomendar alternativas, con soporte de imagen en la conversación.
- Análisis de resenas y contenido generado por usuarios: procesar imágenes y texto enviados por compradores para clasificar, resumir o detectar incidencias, gracias a la combinación de comprensión visual y razonamiento.
- Despliegue en producción con vLLM: al estar en formato GPTQ `compressed-tensors`, puede servirse con el backend de vLLM y exponerse mediante API compatible con OpenAI, integrándose en pipelines existentes con menor requisito de VRAM que la versión BF16.

## Benchmarks y rendimiento

La model card reporta comparaciones agregadas del checkpoint BF16 (no del GPTQ) frente a modelos de tamaño similar. No se incluyen cifras numéricas por benchmark individual en el texto extraído; solo diferencias medias.

| Comparación | Diferencia media en benchmarks de e-commerce | Diferencia media en benchmarks generales |
|---|---|---|
| vs. Qwen3.5-35B-A3B | +3,92 puntos | +0,17 puntos |
| vs. Qwen3.6-35B-A3B | +3,36 puntos | no disponible |
| vs. MiniCPM-V-4.7-35B-A3B | +8,22 puntos | +5,60 puntos |
| vs. Valley3-32B | no disponible | +9,13 puntos |

La evaluación de e-commerce cubre 28 benchmarks en ocho escenarios (atributos de producto, moderación, OCR, retrieval, grounding, razonamiento, benchmarks públicos de e-commerce y conocimiento de producto). La evaluación general cubre 64 benchmarks en ocho categorías (VQA general, documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, multi-imagen, seguimiento de instrucciones y tareas centradas en texto). Todas las puntuaciones usan escala 0-100. Los resultados detallados por benchmark están en las imágenes de la model card, no en texto extraíble.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint GPTQ ocupa 20,3 GB en disco; en VRAM se requiere espacio para pesos cuantizados más caché KV y activaciones, por lo que se estima un mínimo práctico en torno a 24 GB para contextos moderados, y bastante más para aprovechar los 262 144 tokens de contexto.
- GPU recomendadas: para despliegue de producción con contexto largo, A100 80 GB o H100; para contextos reducidos, una RTX 4090 (24 GB) puede ser suficiente con la versión GPTQ.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con contextos moderados; en GPUs de 16 GB no es viable con este checkpoint GPTQ.
- Opciones de despliegue: vLLM (>= 0.31.0) con backend `compressed-tensors` es la opción documentada; el repo base ofrece también GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-35B-A3B-GPTQ | 35B totales / ~3B activos | 262.144 | Apache 2.0 | BF16, FP8, GPTQ, GGUF | Especializado en e-commerce; +3,92 pts vs Qwen3.5-35B-A3B en e-commerce |
| Qwen3.5-35B-A3B | 35B / MoE | no disponible | no disponible | no disponible | Referencia comparativa en la model card; superado en e-commerce y ligeramente en general |
| Qwen3.6-35B-A3B | 35B / MoE | no disponible | no disponible | no disponible | Superado en +3,36 pts en e-commerce |
| MiniCPM-V-4.7-35B-A3B | 35B / MoE | no disponible | no disponible | no disponible | Superado en +8,22 pts (e-commerce) y +5,60 pts (general) |
| Valley3-32B | 32B | no disponible | no disponible | no disponible | Superado en +9,13 pts en benchmarks generales |

## Limitaciones y advertencias

- Idiomas: solo chino e inglés; no se garantiza rendimiento en castellano ni en otros idiomas.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al estar entrenado sobre datos de comercio electrónico de WeChat, puede reflejar sesgos de ese dominio y mercado.
- Alucinación: como todo modelo generativo multimodal, puede producir descripciones o atributos incorrectos sobre imágenes; en producción conviene validar salidas críticas.
- Contexto: aunque la ventana es de 262 144 tokens, el rendimiento efectivo en contextos muy largos no está cuantificado en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio y las condiciones de los datos de entrenamiento no especificadas.
- Cuantización: la versión GPTQ puede presentar degradación frente al checkpoint BF16; la model card no reporta métricas del GPTQ, solo del BF16.
- Tool calling y agentes: no documentados explícitamente; verificar antes de diseñar flujos agénticos.
- Despliegue: requiere vLLM >= 0.31.0 con backend `compressed-tensors`; otras pilas pueden no soportar el formato directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GPTQ
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Versión FP8: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-FP8
- Versión GGUF: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Colección WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Informe técnico (arXiv): https://arxiv.org/abs/2611.30662
- Página del paper en HF: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Modelos de la familia: [0.8B](https://huggingface.co/tencent/WeMM-Ecom-0.8B) · [2B](https://huggingface.co/tencent/WeMM-Ecom-2B) · [4B](https://huggingface.co/tencent/WeMM-Ecom-4B) · [9B](https://huggingface.co/tencent/WeMM-Ecom-9B)
- Documentación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
