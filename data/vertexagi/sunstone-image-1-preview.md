# VertexAGI/sunstone-image-1-preview

## Resumen

Sunstone Image 1 Preview es un modelo de generación de imágenes texto-a-imagen desarrollado por VertexAGI, entrenado completamente desde cero sin pesos preentrenados de VAE, CLIP, T5 ni Stable Diffusion. Con 49,1 millones de parámetros, genera imágenes de 64×64 píxeles a partir de descripciones textuales cortas. Se trata de un experimento a pequeña escala que demuestra que es viable entrenar un modelo de difusión funcional en hardware de consumo: una única GTX 1660 Ti de 6 GB durante aproximadamente 4,3 días.

La arquitectura combina un transformer de texto de 4 capas (384 dimensiones, entrenado conjuntamente) con una U-Net en espacio de píxeles de 64×64 que emplea atención propia y cruzada en resoluciones de 16×16 y 8×8. El objetivo de entrenamiento es rectified flow con predicción de velocidad, muestreo de tiempo logit-normal y un 10% de dropout de caption para classifier-free guidance. El modelo se entrenó sobre 565.463 fotografías de CommonCatalog CC-BY con captions generados por BLIP-2.

Es relevante como referencia educativa y de investigación: muestra el proceso completo de entrenamiento de un modelo generativo desde cero, con decisiones arquitectónicas y de entrenamiento documentadas, y establece expectativas realistas sobre lo que un modelo de este tamaño puede y no puede hacer. No está pensado para producción ni para generar imágenes realistas de personas u objetos específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto (4 capas, 384-d) + U-Net en espacio de píxeles 64×64 (canales 64, multiplicadores 1/2/3/4, 2 bloques residuales por nivel, self- y cross-attention a 16×16 y 8×8) |
| Parametros totales | 49,1 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 24 tokens de prompt (truncado) |
| Tipos de cuantizacion | No disponible (solo fp16 EMA; generate.py carga como fp32) |
| Idiomas soportados | No disponible (captions de entrenamiento en inglés, inferido del dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`final_ema_fp16.pt`, 98 MB) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de difusión en espacio de píxeles con rectified flow como objetivo de entrenamiento (predicción de velocidad), muestreo de tiempo logit-normal y un 10% de dropout de caption para permitir classifier-free guidance. La componente de texto es un transformer de 4 capas y 384 dimensiones entrenado conjuntamente con la U-Net, usando un tokenizador BPE byte-level propio de 32K vocabulario. La U-Net opera directamente sobre píxeles de 64×64 con 64 canales base y multiplicadores 1/2/3/4, incorporando atención propia y cruzada en las resoluciones de 16×16 y 8×8.

El entrenamiento se realizó durante 850.000 pasos con batch de 32 (aproximadamente 28 millones de imágenes vistas), optimizador AdamW, learning rate de 2e-4 con warm-up y decaimiento coseno, y pesos EMA (los publicados). Se usó una sola GTX 1660 Ti en fp32 (fp16 resultó más lento en esa tarjeta) durante unos 4,3 días. El dataset de entrenamiento son 565.463 fotografías de CommonCatalog CC-BY (Flickr, licencia CC-BY 4.0), recortadas al centro a casi cuadrado y reducidas a 64×64, con captions generados automáticamente por BLIP-2. El muestreo usa 40 pasos de Euler con guidance 3.0. La pérdida de validación final es 0,0790 (EMA 0,0789).

## Capacidades

- Generación de imágenes texto-a-imagen de 64×64 píxeles a partir de prompts cortos (máximo 24 tokens).
- Buen rendimiento en cielos, atardeceres, paisajes (bosques, montañas, lagos, campos), flores, coches rojos, edificios e iglesias con campanario.
- Control de color, iluminación y ambiente general de la escena.
- Seguimiento laxo de prompts: captura atributos dominantes (por ejemplo, "tejado rojo") pero no garantiza todos los detalles.
- Soporte de classifier-free guidance ajustable mediante el parámetro `--cfg` (por defecto 3.0).
- Control de semilla (`--seed`), número de pasos (`--steps`, por defecto 40) y escalado de salida (`--scale`, por defecto 4).
- Ejecución automática en CUDA, Apple MPS o CPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de lenguaje; es exclusivamente un generador de imágenes.

## Casos de uso

- Aprendizaje de entrenamiento desde cero: el modelo sirve como referencia completa y reproducible para entender cómo se entrena un modelo de difusión texto-a-imagen sin dependencias preentrenadas, con arquitectura, objetivo, datos y hiperparámetros documentados.
- Experimentación académica en modelos pequeños: útil para estudiar el efecto del tamaño, la resolución y el dataset en la calidad generativa, con un coste computacional de una sola GPU de consumo.
- Generación de imágenes decorativas de baja resolución: producir miniaturas o iconos abstractos de 64×64 para prototipos, placeholders o fondos simples donde no se requiere realismo.
- Pruebas de pipelines de generación condicionada por texto: validar integraciones de tokenización, guidance y muestreo Euler en entornos de desarrollo antes de escalar a modelos mayores.
- Investigación sobre sesgos en datasets de fotografías: al estar entrenado sobre fotos públicas con captions automáticos, permite estudiar cómo se reflejan los sesgos y errores del captioner (BLIP-2) en las imágenes generadas.
- Docencia y divulgación: demostrar en un taller o clase el ciclo completo de un modelo generativo (datos, arquitectura, entrenamiento, muestreo) con resultados visibles en menos de 5 días de cómputo en hardware asequible.
- Generación de paisajes y cielos para composición: por su buen rendimiento en atardeceres y paisajes, puede usarse como fuente de fondos o cielos en collages y composiciones de baja resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no dispone de puntuación de calidad de imagen (no hay FID) y que la evaluación debe hacerse observando las muestras. El único dato cuantitativo reportado es la pérdida de validación final: 0,0790 (EMA 0,0789).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint fp16 pesa 98 MB y se carga como fp32, por lo que cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU CUDA moderna (GTX 1660 Ti, RTX 3060, RTX 4090, A100, H100); también funciona en Apple Silicon vía MPS y en CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos años, así como en Mac con Apple Silicon.
- Opciones de despliegue: únicamente mediante el script `generate.py` incluido en el repositorio (PyTorch). No hay build de MLX ni GGUF, y no es compatible con vLLM, llama.cpp, Ollama ni TGI por tratarse de una arquitectura de imagen personalizada.
- Latencia y throughput estimados: cuatro imágenes tardan aproximadamente 14 segundos en un Mac con Apple Silicon (dato del autor); no se proporcionan cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto de prompt | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Sunstone Image 1 Preview | 49,1 M | 64×64 | 24 tokens | Apache 2.0 | PyTorch (.pt) | Hugging Face |
| Stable Diffusion 1.5 | ~860 M (U-Net) + VAE + CLIP | 512×512 | 77 tokens | CreativeML OpenRAIL-M | safetensors, diffusers | Hugging Face |
| SDXL-Turbo | ~2,6 B (U-Net) + VAE + CLIP | 512×512 | 77 tokens | Stability AI Community | safetensors, diffusers | Hugging Face |

No se dispone de datos de benchmarks comparativos (FID, CLIP score) para Sunstone Image 1 Preview, por lo que la comparación se limita a especificaciones estructurales. Frente a Stable Diffusion 1.5 y SDXL-Turbo, Sunstone es dos o tres órdenes de magnitud menor en parámetros, genera una resolución 8 veces menor y no emplea VAE ni codificadores de texto preentrenados, lo que explica su menor calidad y su naturaleza de experimento educativo.

## Limitaciones y advertencias

- Resolución fija de 64×64; el escalado produce imágenes borrosas y blandas.
- Rendimiento deficiente en animales (gatos, perros, caballos salen como formas borrosas), caras y manos (manchas), objetos específicos ("un bol de fruta" genera platos de comida cocinada), detalles finos, objetos contables y cualquier texto dentro de la imagen.
- Seguimiento de prompts laxo: captura atributos dominantes pero no garantiza coherencia completa (por ejemplo, "casa blanca con tejado rojo" siempre tuvo tejado rojo, pero no siempre casa blanca).
- Sin filtro de seguridad y sin evaluación detallada de sesgos; entrenado sobre fotografías públicas que incluyen personas, por lo que puede reflejar sus sesgos y generar formas humanoides.
- Los captions de entrenamiento son automáticos (BLIP-2), por lo que el modelo hereda los hábitos y errores de ese captioner.
- Modelo de escala hobby: no apto para producción ni para usos que requieran imágenes realistas o precisas de personas u objetos concretos.
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso en aplicaciones que exijan precisión o realismo.
- Idiomas soportados no documentados; los captions de entrenamiento están en inglés, por lo que se espera mejor rendimiento en ese idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/sunstone-image-1-preview
- Dataset de entrenamiento (CommonCatalog CC-BY): https://huggingface.co/datasets/common-canvas/commoncatalog-cc-by
- Organización Vertex AGI: https://vertexagi.dev
- Muestras del modelo (en el repositorio): `samples/grid_step_850000_32_training_prompts.png`, `samples/prompts_sheet_1.png`, `samples/prompts_sheet_2.png`, `samples/sunset_mountain_steeple.png`
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
