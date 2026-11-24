# VertexAGI/sunstone-image-preview

## Resumen

Sunstone Image Preview es un modelo de generación de imágenes a partir de texto (text-to-image) de 49,1 millones de parámetros, desarrollado por VertexAGI y entrenado completamente desde cero, sin pesos preentrenados de VAE, CLIP, T5 ni Stable Diffusion. Genera imágenes de 64×64 píxeles y está pensado como una prueba de concepto reproducible en hardware de consumo: el entrenamiento completo se realizó en una única GTX 1660 Ti de 6 GB durante aproximadamente 4,3 días.

El modelo resuelve un problema fundamentalmente educativo y de investigación: demostrar el ciclo completo de entrenamiento de un modelo de difusión estilo rectified flow sobre datos reales con recursos mínimos. No compite con generadores de imágenes de producción, sino que sirve como referencia para quienes quieren entender cómo se entrena un modelo de este tipo desde cero, con arquitectura propia, tokenizador propio y dataset público.

La relevancia actual radica en su transparencia: el autor documenta con detalle la arquitectura, el objetivo de entrenamiento, los datos, las limitaciones cualitativas y los resultados observados. Está publicado bajo licencia Apache 2.0 y el repositorio ocupa aproximadamente 0,1 GB, con pesos en formato PyTorch (`.pt`). El modelo es especialmente competente en cielos, atardeceres, paisajes, flores, coches rojos y edificios, y notablemente débil en animales, rostros, manos y detalles finos.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de texto (4 capas, 384 dimensiones) + U-Net en espacio de píxeles 64×64 (canales 64, multiplicadores 1/2/3/4, 2 bloques residuales por nivel) con self-attention y cross-attention a 16×16 y 8×8 |
| Parámetros totales | 49,1M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 24 tokens de prompt (truncado explícito) |
| Tipos de cuantización | No disponible (pesos publicados en fp16; el entrenamiento se hizo en fp32) |
| Idiomas soportados | No disponible (prompts en inglés según los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, archivo `final_ema_fp16.pt`, 98 MB) |

## Arquitectura y entrenamiento

El modelo combina un transformer de texto de 4 capas y 384 dimensiones, entrenado conjuntamente con el generador, y una U-Net que opera directamente en espacio de píxeles a 64×64 (sin VAE latente). La U-Net tiene 64 canales base con multiplicadores 1/2/3/4 y 2 bloques residuales por nivel, e incorpora self-attention y cross-attention en las resoluciones de 16×16 y 8×8. El objetivo de entrenamiento es rectified flow con predicción de velocidad, muestreo de tiempo logit-normal y un 10% de caption dropout para permitir classifier-free guidance.

El entrenamiento se realizó durante 850.000 pasos con batch de 32 (aproximadamente 28 millones de imágenes vistas), optimizador AdamW, learning rate de 2e-4 con warm-up y decaimiento coseno, y pesos EMA (que son los publicados). Se usó un tokenizador BPE byte-level propio de 32K vocabulario. Los datos provienen de 565.463 fotografías de CommonCatalog CC-BY (Flickr, licencia CC-BY 4.0), con captions generadas automáticamente por BLIP-2, recortadas al centro, aproximadas a cuadrado y reducidas a 64×64. El muestreo en inferencia usa 40 pasos de Euler con guidance 3.0. La pérdida de validación final es 0,0790 (EMA 0,0789).

## Capacidades

- Generación de imágenes de 64×64 píxeles a partir de descripciones textuales cortas (hasta 24 tokens, en minúsculas).
- Buen rendimiento cualitativo en cielos y atardeceres, paisajes (bosques, montañas, lagos, campos), flores, coches rojos, edificios e iglesias con campanario.
- Control de color, iluminación y ambiente general de la escena.
- Classifier-free guidance configurable (`--cfg`, por defecto 3.0) para ajustar la fidelidad al prompt.
- Control de semilla (`--seed`) para reproducibilidad y generación de múltiples variantes (`--n`).
- Escalado de salida configurable (`--scale`, por defecto 4) para ampliar la imagen de 64×64.
- Ejecución automática en CUDA, Apple MPS o CPU sin configuración manual.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Aprendizaje del entrenamiento de modelos de difusión desde cero: el repositorio incluye `model.py`, `generate.py` y el tokenizador, lo que permite estudiar paso a paso cómo se construye y entrena un rectified flow sin dependencias de pesos preentrenados.
- Reproducción de experimentos en hardware de consumo: con 49,1M de parámetros y pesos de 98 MB, se puede entrenar y ejecutar en una GPU de 6 GB, lo que lo hace adecuado para laboratorios docentes y proyectos de fin de grado.
- Generación de imágenes decorativas pequeñas: para fondos, avatares o ilustraciones de 64×64 en prototipos de interfaces, donde la resolución baja y el estilo suave son aceptables.
- Pruebas de pipelines de generación condicionada por texto: sirve como modelo de referencia ligero para validar integraciones de text-to-image antes de escalar a modelos mayores.
- Investigación sobre sesgos y limitaciones de datasets con captions automáticas: al estar entrenado con captions de BLIP-2 sobre Flickr, permite estudiar cómo los errores del captioner se propagan al generador.
- Benchmarking de eficiencia en inferencia: con 40 pasos de Euler y ~14 segundos para 4 imágenes en Apple Silicon, es útil para comparar latencias entre backends (CUDA, MPS, CPU) en modelos pequeños.
- Docencia sobre evaluación cualitativa de modelos generativos: la model card documenta explícitamente qué funciona y qué no, lo que facilita ejercicios de análisis crítico de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU, HumanEval, GSM8K) en la información disponible. El autor indica explícitamente que no dispone de puntuación de calidad de imagen (no FID) y que la evaluación debe hacerse a partir de las muestras publicadas. El único dato cuantitativo de rendimiento es la pérdida de validación final: 0,0790 (EMA 0,0789).

| Métrica | Valor |
|---|---|
| Pérdida de validación final | 0,0790 |
| Pérdida de validación final (EMA) | 0,0789 |
| FID | No disponible |
| CLIP score | No disponible |
| Benchmarks estándar (MMLU, HumanEval, GSM8K) | No aplica (modelo text-to-image) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos fp16 de 98 MB; cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una GTX 1660 Ti de 6 GB.
- Cabe en GPU de consumo: sí, en GTX 1660 Ti, RTX 3060, RTX 4090 y cualquier modelo con soporte CUDA, además de Apple Silicon vía MPS.
- Opciones de despliegue: el repositorio incluye `generate.py` basado en PyTorch, NumPy, Pillow y tokenizers; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo).
- Latencia y throughput: aproximadamente 14 segundos para 4 imágenes en un Mac con Apple Silicon, con 40 pasos de Euler y guidance 3.0. No se dispone de cifras para CUDA o CPU.
- Entrenamiento: 850.000 pasos en 4,3 días en una GTX 1660 Ti en fp32 (fp16 resultó más lento en esa tarjeta).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los modelos text-to-image de referencia habituales (Stable Diffusion, SDXL, DALL·E, etc.) difieren en órdenes de magnitud en parámetros, resolución y datos de entrenamiento, y no se han aportado datos de comparación en la información disponible.

| Modelo | Parámetros | Resolución | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sunstone Image Preview | 49,1M | 64×64 | 24 tokens | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Resolución fija de 64×64; ampliar produce imágenes borrosas y suaves.
- Rendimiento pobre en animales (gatos, perros, caballos salen como formas borrosas), rostros y manos (manchas), objetos específicos ("un bol de fruta" produce platos de comida cocinada) y cualquier detalle pequeño, contado o texto en la imagen.
- Los prompts se siguen de forma laxa, no precisa: "una casa blanca con tejado rojo" siempre tuvo tejado rojo, pero no siempre casa blanca.
- No hay filtro de seguridad ni evaluación detallada de sesgos; el modelo fue entrenado con fotografías públicas ordinarias y puede reflejar sus sesgos.
- El dataset incluye personas y el modelo puede generar formas humanoides, aunque con mala calidad.
- Las captions de entrenamiento son automáticas (BLIP-2), por lo que el modelo ha aprendido también los hábitos y errores del captioner.
- No apto para usos que requieran imágenes realistas o precisas de personas u objetos concretos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es una vista previa de investigación a escala de aficionado; no se recomienda en producción.
- El prompt se trunca a 24 tokens y se pasa a minúsculas; prompts largos o en otros idiomas distintos del inglés pueden degradar el resultado (los idiomas soportados no están documentados).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/sunstone-image-preview
- Dataset de entrenamiento: https://huggingface.co/datasets/common-canvas/commoncatalog-cc-by
- Sitio del autor (Vertex AGI): https://vertexagi.dev
- Muestras de prompts: `samples/prompts_sheet_1.png`, `samples/prompts_sheet_2.png`, `samples/sunset_mountain_steeple.png` y `samples/grid_step_850000_32_training_prompts.png` (incluidas en el repositorio del modelo)
