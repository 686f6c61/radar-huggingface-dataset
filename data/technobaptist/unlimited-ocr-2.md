# TechnoBaptist/Unlimited-OCR-2

## Resumen

Unlimited OCR 2 es un modelo vision-lenguaje especializado en extracción de texto a partir de documentos, desarrollado por Baidu Inc. y publicado en HuggingFace bajo el identificador `TechnoBaptist/Unlimited-OCR-2` (repositorio oficial: `baidu/Unlimited-OCR-2`). Resuelve el problema del parseo de documentos de longitud arbitraria: frente a los modelos OCR tradicionales que degradan su rendimiento o agotan la memoria cuando el documento crece, este modelo introduce Sparse Reference Sliding Window Attention (SR-SWA), que acota la complejidad computacional a un conjunto fijo de referencias de trabajo.

El modelo tiene 3.343.978.497 parámetros (aproximadamente 3,3 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 6,9 GB. Su pipeline es `image-text-to-text` y está pensado para tareas de feature-extraction y OCR multilingüe. La innovación principal es el concepto de "unlimited-horizon parsing": la latencia de decodificación y el consumo de memoria se mantienen prácticamente constantes independientemente de la longitud del documento, eliminando el escalado cuadrático de la atención clásica.

Es relevante ahora porque compite directamente con DeepSeek-OCR y otros modelos de parseo documental, y porque su integración con SGLang, vLLM, ModelScope y Baidu Cloud lo posiciona como una opción de despliegue en producción para pipelines de digitalización masiva de documentos. La licencia MIT facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer con Sparse Reference Sliding Window Attention (SR-SWA) |
| Parametros totales | 3.343.978.497 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de contexto finita con referencias de trabajo de 512 tokens, según SR-SWA) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer vision-lenguaje con un mecanismo propietario denominado Sparse Reference Sliding Window Attention (SR-SWA). Este mecanismo comprime las interacciones de atención texto-visual de secuencias ultralargas a un conjunto fijo de referencias de trabajo (por ejemplo, 512 tokens), lo que acota la complejidad computacional y mantiene la latencia por paso de decodificación y el consumo de memoria prácticamente constantes independientemente de la longitud del documento. Esto elimina el escalado cuadrático de la atención y los cuellos de botella de memoria asociados al crecimiento del documento.

El modelo soporta dos modos de inferencia: `infer` para páginas individuales, que aplica dynamic tiling (modo "gundam") por defecto, y `infer_multi` para documentos de varias páginas, que procesa todas las páginas en una sola petición y permite aprovechar el contexto entre páginas. El prompt se construye automáticamente como `"<PAGE><image>" * num_pages + "Multi page parsing."`, con cada página codificada como una vista global (modo base). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Extracción de texto (OCR) de imágenes de documentos, con soporte para documentos de múltiples páginas.
- Parseo de documentos de longitud ilimitada dentro de una ventana de contexto finita, gracias a SR-SWA.
- Procesamiento multi-página en una sola petición, con reutilización de contexto entre páginas.
- Modo de tiling dinámico (gundam) para páginas individuales de alta resolución.
- Soporte multilingüe.
- Capacidad de feature-extraction (según los tags del repositorio).
- Integración con Transformers (nativo), SGLang (recomendado para servir), vLLM y ModelScope.
- Soporte de entrenamiento mediante ms-swift.
- Disponibilidad en Baidu Cloud y demo en Hugging Face Spaces.

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo procesa documentos de decenas o cientos de páginas en una sola petición (`infer_multi`), manteniendo latencia y memoria constantes, lo que lo hace adecuado para digitalizar fondos documentales completos sin fragmentar manualmente los PDF.
- Parseo de informes financieros extensos: la capacidad de mantener el contexto entre páginas permite extraer tablas y cifras que continúan de una página a otra, algo que los OCR por página pierden.
- Extracción de texto en pipelines de ingesta documental: con soporte para SGLang y vLLM, puede desplegarse como servidor de inferencia de alto rendimiento detrás de colas de procesamiento por lotes.
- Procesamiento de documentación técnica multilingüe: al ser multilingüe, sirve para digitalizar manuales y especificaciones en varios idiomas dentro de un mismo flujo.
- Alimentación de sistemas RAG sobre documentos escaneados: la salida de texto estructurado por páginas (`<PAGE>`) facilita el troceado y la indexación posterior en bases vectoriales.
- Digitalización de expedientes legales o históricos: el parseo de horizonte ilimitado evita la pérdida de contexto en documentos muy largos, un requisito habitual en archivos judiciales y fondos históricos.
- Extracción de datos de formularios y facturas: el modo de tiling dinámico para páginas individuales mejora la lectura de documentos densos con campos pequeños.

## Benchmarks y rendimiento

La model card menciona resultados state-of-the-art en benchmarks de documentos de decenas de páginas (MPDocBench) y de documentos extremos de cientos de páginas (MarathonDocBench), pero no se proporcionan cifras numéricas en la información disponible.

| Benchmark | Resultado |
|---|---|
| MPDocBench | SOTA según el autor (sin cifras disponibles) |
| MarathonDocBench | SOTA según el autor (sin cifras disponibles) |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3,3 mil millones de parámetros en bfloat16, el peso del modelo ronda los 6,7 GB, por lo que se necesita margen adicional para activaciones y KV cache.
- GPU recomendadas: NVIDIA A800-80GB es la GPU en la que el autor probó la inferencia con Transformers.
- Cabe en GPU de consumo: no confirmado en la información disponible; por tamaño de pesos, sería viable en GPUs con 12-16 GB de VRAM o más, pero no hay validación publicada.
- Opciones de despliegue: Transformers (nativo), SGLang (recomendado para servir, con wheel personalizada `sglang-0.5.20.dev10+g8d62f5fb9c`), vLLM, ModelScope y Baidu Cloud.
- Latencia y throughput: no disponibles; el autor afirma que la latencia por paso de decodificación y el consumo de memoria se mantienen casi constantes con la longitud del documento gracias a SR-SWA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited OCR 2 | 3,3 B | Ventana finita con SR-SWA (horizonte ilimitado) | OCR vision-lenguaje con atención de ventana deslizante dispersa | MIT | HuggingFace, ModelScope, Baidu Cloud, SGLang, vLLM |
| DeepSeek-OCR | No disponible | No disponible | OCR vision-lenguaje | No disponible | HuggingFace (referenciado como base de comparación por Baidu) |
| Unlimited OCR 1.0 | No disponible | No disponible | OCR vision-lenguaje | No disponible | GitHub (rama `UnlimitedOCR1.0`) |

La información disponible no permite comparar cifras de rendimiento entre estos modelos; solo se indica que Unlimited OCR 2 busca superar a DeepSeek-OCR y a su propia versión 1.0.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo; al ser un modelo OCR, el riesgo principal es la transcripción errónea de caracteres en imágenes de baja calidad.
- Riesgo de alucinación en la generación de texto: como modelo generativo, puede producir contenido que no aparece en la imagen, especialmente en regiones borrosas o con ruido.
- La longitud de contexto exacta no está documentada; el "horizonte ilimitado" se refiere a la ventana deslizante, no a un contexto infinito real.
- El repositorio consultado (`TechnoBaptist/Unlimited-OCR-2`) tiene solo 22 descargas y 0 likes, lo que sugiere que es una copia no oficial del modelo de Baidu; para producción conviene usar el repositorio oficial `baidu/Unlimited-OCR-2`.
- Requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código personalizado del repositorio.
- La licencia MIT permite uso comercial, pero conviene verificar los términos del repositorio oficial de Baidu por si difieren.
- El soporte de SGLang requiere una wheel personalizada, lo que añade complejidad al despliegue.
- No hay información sobre el rendimiento en idiomas concretos ni sobre la cobertura real del soporte multilingüe.

## Enlaces

- [HuggingFace (copia consultada)](https://huggingface.co/TechnoBaptist/Unlimited-OCR-2)
- [HuggingFace (repositorio oficial de Baidu)](https://huggingface.co/baidu/Unlimited-OCR-2)
- [GitHub de Unlimited-OCR](https://github.com/baidu/Unlimited-OCR)
- [Paper en arXiv](https://arxiv.org/abs/2606.23050)
- [PDF del paper en HuggingFace](https://huggingface.co/baidu/Unlimited-OCR-2/blob/main/Unlimited-OCR-2.pdf)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/baidu/Unlimited-OCR)
- [ModelScope](https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR)
- [Baidu Cloud OCR](https://cloud.baidu.com/doc/OCR/s/fmr1p39gb)
- [ms-swift](https://github.com/modelscope/ms-swift)
- [vLLM](https://github.com/vllm-project/vllm)
- [DeepSeek-OCR](https://github.com/deepseek-ai/DeepSeek-OCR)
- [Twitter de Baidu Inc.](https://x.com/Baidu_Inc)
