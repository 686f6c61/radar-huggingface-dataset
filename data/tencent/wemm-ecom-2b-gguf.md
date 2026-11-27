# tencent/WeMM-Ecom-2B-GGUF

## Resumen

WeMM-Ecom-2B-GGUF es la edición cuantizada en formato GGUF del modelo multimodal WeMM-Ecom-2B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el contexto del comercio electrónico de WeChat. El modelo original es un transformer denso de aproximadamente 1.880 millones de parámetros (1.881.825.088 según los pesos en safetensors) que procesa entradas de imagen y texto para generar respuestas conversacionales, y esta versión GGUF combina los pesos del modelo de lenguaje en cuantización Q4_K_M con un proyector multimodal en F16, lo que permite su despliegue con llama.cpp en hardware modesto.

La relevancia de esta ficha radica en que traslada un modelo especializado en tareas de e-commerce (atributos de producto, moderación, OCR, recuperación, grounding, razonamiento y conocimiento de producto) a un formato ejecutable localmente sin necesidad de GPU de datacenter. El modelo soporta un modo de razonamiento híbrido (thinking) y una ventana de contexto declarada de 262.144 tokens, lo que lo sitúa en la gama de modelos pequeños con contexto largo.

La familia WeMM-Ecom incluye variantes de 0,8B, 2B, 4B, 9B y 35B-A3B (MoE), con versiones en BF16, FP8, GPTQ y GGUF. Según la model card, la variante de 35B-A3B supera a modelos abiertos de cientos de miles de millones de parámetros en rendimiento de e-commerce, y la de 2B supera a Qwen3.5-2B y LFM3-VL-2B en las suites de evaluación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (modelo de lenguaje + proyector multimodal); etiquetado qwen3_5 en los tags |
| Parametros totales | 1.881.825.088 (aprox. 1,88B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) + F16 (proyector multimodal); el modelo base dispone de BF16, FP8 y GPTQ |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

WeMM-Ecom-2B es un modelo denso de 2B parámetros orientado a la comprensión image-text-to-text. La arquitectura combina un modelo de lenguaje (cuyos tags lo asocian a la familia Qwen3.5) con un proyector multimodal que traduce las representaciones visuales al espacio del modelo de lenguaje. En esta edición GGUF, el proyector se distribuye por separado como `mmproj-F16.gguf` en precisión F16, mientras que el modelo de lenguaje se cuantiza a Q4_K_M. El modelo soporta un modo de razonamiento híbrido (thinking e instruct), lo que implica que puede alternar entre respuestas directas y cadenas de razonamiento explícitas.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí se indica que la familia se entrena con foco en e-commerce de WeChat y que la evaluación cubre 28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorías. El informe técnico referenciado (arXiv:2611.30662) es la fuente primaria para los detalles de entrenamiento, no reproducidos en la información disponible.

## Capacidades

- Comprensión multimodal image-text-to-text: procesa pares de imagen y texto para responder preguntas sobre el contenido visual.
- Comprensión de e-commerce: atributos de producto, moderación de contenido, OCR, recuperación, grounding, razonamiento y conocimiento de producto.
- Modo de razonamiento híbrido: alterna entre modo instruct (respuesta directa) y modo thinking (cadena de razonamiento).
- Capacidades generales de VQA, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen e instrucciones.
- Soporte multilingüe limitado a chino e inglés.
- Despliegue local mediante llama.cpp con CLI (`llama-cli`) y servidor compatible con la API de OpenAI (`llama-server`).
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni uso como agente multi-paso.

## Casos de uso

- Catalogación automática de productos: el modelo puede extraer atributos (color, talla, material, categoría) a partir de imágenes de producto y texto asociado, aprovechando su entrenamiento específico en atributos de e-commerce.
- Moderación de contenido en marketplaces: clasificación de imágenes y descripciones de producto para detectar contenido no permitido, apoyándose en los benchmarks de moderación de la suite del autor.
- OCR y extracción de texto en imágenes de producto: lectura de etiquetas, precios y fichas técnicas embebidas en imágenes, con el modo instruct para respuestas directas.
- Búsqueda y recuperación multimodal: generación de descripciones enriquecidas a partir de imágenes para indexar y recuperar productos en un motor de búsqueda interno.
- Asistencia conversacional al comprador: respuestas multi-turno sobre productos con contexto largo (hasta 262.144 tokens), adecuado para sesiones con historial extenso o catálogos extensos en el prompt.
- Grounding y verificación visual: localización de elementos concretos en imágenes de producto (por ejemplo, defectos o accesorios) para control de calidad o resolución de disputas.
- Despliegue en edge o servidores modestos: al ser un GGUF Q4_K_M de ~2 GB, puede ejecutarse en CPU o GPU consumer para prototipos y demos sin infraestructura de datacenter.

## Benchmarks y rendimiento

La model card presenta comparaciones gráficas (imágenes) y remite a tablas completas en el informe técnico, pero no incluye cifras numéricas por benchmark en el texto disponible. Los únicos datos cuantitativos textuales son las diferencias medias agregadas:

| Comparación | Diferencia media (escala 0-100) | Ámbito |
|---|---|---|
| WeMM-Ecom-2B vs. Qwen3.5-2B | +10,59 puntos | Suite de e-commerce |
| WeMM-Ecom-2B vs. LFM3-VL-2B | +6,16 puntos | Suite de e-commerce |
| WeMM-Ecom-2B vs. Qwen3.5-2B | +4,45 puntos | Suite general |
| WeMM-Ecom-2B vs. LFM3-VL-2B | +2,43 puntos | Suite general |

No se han publicado resultados numéricos por benchmark individual (MMLU, HumanEval, GSM8K, etc.) en la información disponible; las tablas detalladas están en las imágenes de la model card y en el informe técnico arXiv:2611.30662.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,0 GB; el modelo Q4_K_M más el proyector F16 requieren aproximadamente 2-3 GB de memoria, dependiendo del backend y del contexto utilizado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo completo con contexto moderado; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para contextos de 262.144 tokens, la memoria de la caché KV crece significativamente y puede requerir GPUs de mayor capacidad (A100, H100) o técnicas de offload.
- Cabe en GPU consumer: sí, en la mayoría de GPUs consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (versión fijada en el commit a8f8294c45076538f4509754e4c79fc51a1a486b), con `llama-cli` y `llama-server` (API compatible con OpenAI). Backends soportados: CUDA, CPU, Metal, Vulkan y otros según la guía oficial de llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: para inferencia solo en CPU, se indica `-ngl 0` y `--no-mmproj-offload` al cargar el proyector.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-2B-GGUF | ~1,88B denso | 262.144 | Apache 2.0 | GGUF (Q4_K_M + F16) | Especializado en e-commerce; supera a Qwen3.5-2B y LFM3-VL-2B según el autor |
| Qwen3.5-2B | ~2B (no confirmado) | No disponible | No disponible | No disponible | Referencia de comparación en la model card; el autor reporta que WeMM-Ecom-2B lo supera |
| LFM3-VL-2B | ~2B (no confirmado) | No disponible | No disponible | No disponible | Referencia de comparación en la model card; el autor reporta que WeMM-Ecom-2B lo supera |
| WeMM-Ecom-35B-A3B-GGUF | 35B totales / A3B activos (MoE) | No disponible | Apache 2.0 | GGUF | Variante mayor de la misma familia, con mejor rendimiento según el autor |

Los datos de Qwen3.5-2B y LFM3-VL-2B no están disponibles en la información proporcionada más allá de su uso como referencias comparativas.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; el modelo está entrenado con foco en e-commerce de WeChat, lo que puede introducir sesgos de dominio y de plataforma.
- Alucinación: como todo modelo generativo, puede producir descripciones o atributos incorrectos; en e-commerce esto es crítico para fichas de producto y moderación.
- Contexto: aunque se declara una ventana de 262.144 tokens, el uso de contextos muy largos incrementa la memoria de la caché KV y puede degradar la latencia; no se documenta el rendimiento efectivo en contextos extremos.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse el archivo LICENSE del repositorio y las condiciones del modelo base.
- Cuantización: la versión GGUF usa Q4_K_M, lo que puede reducir la precisión respecto al checkpoint BF16; para producción sensible a precisión se recomienda evaluar el modelo base o FP8.
- Compatibilidad: requiere una revisión concreta de llama.cpp (commit fijado); versiones distintas pueden no cargar correctamente el proyector multimodal.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines agénticos complejos.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-2B
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-2B-FP8
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-2B-GPTQ
- Colección WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Informe técnico (arXiv): https://arxiv.org/abs/2611.30662
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía de compilación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
- Familia GGUF 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Familia GGUF 4B: https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF
- Familia GGUF 9B: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF
- Familia GGUF 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
