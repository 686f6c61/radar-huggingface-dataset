# YiannisChionas/sd-class-hest-ccrcc-64

## Resumen

El modelo `YiannisChionas/sd-class-hest-ccrcc-64` es un modelo de difusión incondicional (DDPM) entrenado para generar parches de imágenes histológicas correspondientes a carcinoma de células renales de células claras (CCRCC, Clear Cell Renal Cell Carcinoma). Lo desarrolla YiannisChionas como parte de su tesis sobre generación de datos sintéticos (SDG) y se publica bajo licencia MIT. Se trata de un experimento preliminar, tal y como el propio autor indica en la model card, sin evaluación cuantitativa rigurosa (no se han calculado FID ni métricas de diversidad o memorización).

El modelo emplea una arquitectura `UNet2DModel` de aproximadamente 114 millones de parámetros (113.673.219 según los pesos en safetensors) con un `DDPMScheduler` de 1000 pasos y programación lineal de beta. Genera imágenes de 64x64 píxeles a partir de parches originales de 224x224 reescalados, entrenados exclusivamente con la categoría CCRCC del benchmark HEST-1k (24 WSIs, 74.220 parches agrupados).

Su relevancia es acotada y experimental: ilustra el uso de difusión para aumentar datasets histopatológicos en contextos de escasez de datos, pero no está destinado a uso clínico ni diagnóstico. El repositorio ocupa 0,5 GB y acumula 17 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet2DModel (diffusion model, DDPM) |
| Parametros totales | 113.673.219 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/fp32) |
| Idiomas soportados | no aplica (generación de imágenes) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería diffusers, PyTorch) |

## Arquitectura y entrenamiento

El modelo es un DDPM clásico construido sobre `UNet2DModel` con 114 millones de parámetros y un `DDPMScheduler` de 1000 pasos con programación lineal de beta. La resolución de entrenamiento es 64x64 píxeles, obtenida al reescalar parches histológicos originales de 224x224. La función de pérdida es MSE sobre el ruido predicho (objetivo "simple" estándar de DDPM).

El entrenamiento se realizó durante 10 épocas con batch_size=64, optimizador AdamW con learning rate 1e-4 y precisión mixta (fp16). El conjunto de datos proviene de HEST-1k, categoría CCRCC: 24 WSIs que generan 74.220 parches, agrupados sin balanceo por WSI. El autor reporta que la pérdida de entrenamiento se estabilizó rápidamente (en torno a los 500 pasos) en valores de 0,04-0,08 y no mejoró posteriormente, lo que sugiere un techo para este tamaño de modelo y dataset. No se menciona uso de RLHF, DPO ni técnicas de decodificación especulativa; tampoco innovaciones arquitectónicas destacables más allá del pipeline estándar de diffusers.

## Capacidades

- Generación incondicional de imágenes de parches histológicos de 64x64 píxeles correspondientes a la morfología CCRCC.
- Modelado de la distribución de apariencia de tejido renal tumoral a partir de parches reales del benchmark HEST-1k.
- Integración directa con la librería `diffusers` mediante `DDPMPipeline`.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni de texto.
- No dispone de modo "thinking", visión general, audio ni condicionamiento por texto, genes u otras modalidades (la generación condicionada figura como trabajo futuro).
- No soporta generación a resolución distinta de 64x64 sin reentrenamiento o ajuste.

## Casos de uso

- Aumento de datos para investigación en histopatología: generar parches sintéticos de CCRCC para equilibrar clases en experimentos de clasificación, siempre que se valide previamente la fidelidad de las muestras.
- Estudio metodológico de SDG en tesis: servir como línea base reproducible para comparar arquitecturas de difusión aplicadas a tejido renal.
- Pruebas de pipelines de difusión con `diffusers`: ejemplo mínimo de entrenamiento y despliegue de un DDPM sobre un dataset médico concreto.
- Docencia y divulgación: ilustrar cómo se entrena un modelo de difusión incondicional con `UNet2DModel` y `DDPMScheduler` sobre parches de imagen médica.
- Experimentos de detección de memorización: comparar parches generados con los del dataset original para estudiar si el modelo reproduce muestras de entrenamiento (el autor lo lista como trabajo pendiente).
- Prototipado de aumentación en pipelines de visión artificial: integrar el modelo como generador de parches sintéticos en fases tempranas de desarrollo, con revisión humana obligatoria.
- Benchmarking interno de modelos generativos médicos: usar el modelo como referencia de baja resolución (64x64) frente a alternativas de mayor capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha calculado FID ni otras métricas de evaluación cuantitativa, y que la pérdida de entrenamiento se estabilizó en torno a 0,04-0,08 sin mejoras posteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Con 113,7 millones de parámetros, en fp32 ocupa aproximadamente 0,45 GB de pesos; en fp16, unos 0,23 GB. La inferencia completa con 1000 pasos de DDPM requiere memoria adicional para activaciones, pero en cualquier caso por debajo de 2-4 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionarán sin problema. La elección afecta principalmente a la latencia, no a la viabilidad.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: `diffusers` con PyTorch (vía `DDPMPipeline`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de imagen).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Con 1000 pasos de muestreo DDPM, la generación de una imagen de 64x64 será rápida en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de difusión entrenados específicamente sobre HEST-1k/CCRCC ni resultados que permitan una comparación cuantitativa. Como referencia cualitativa, otros modelos de difusión histopatológica de la literatura (por ejemplo, variantes de Stable Diffusion ajustadas a parches H&E) operan a resoluciones mayores (256x256 o 512x512) y disponen de evaluaciones FID publicadas, pero no se dispone de datos concretos en esta ficha para establecer una tabla comparativa rigurosa.

## Limitaciones y advertencias

- Modelo preliminar y no evaluado: el autor advierte que es un primer experimento sin FID, sin análisis de diversidad y sin comprobación de memorización.
- No apto para uso clínico ni diagnóstico: la model card lo indica explícitamente; no debe emplearse en decisiones médicas.
- Resolución muy baja (64x64): los parches generados pierden detalle morfológico respecto a los originales de 224x224, lo que limita su utilidad para tareas que requieran estructuras finas.
- Entrenamiento limitado: solo 10 épocas y 74.220 parches de 24 WSIs, con pérdida estabilizada temprano; probablemente el modelo no captura toda la variabilidad morfológica de la clase CCRCC.
- Sin balanceo por WSI: el dataset se agrupó sin equilibrar por imagen de portaobjetos, lo que puede introducir sesgos hacia las WSIs con más parches.
- Generación incondicional: no permite controlar el tipo celular, el grado tumoral ni otras características; tampoco condicionar por expresión génica (trabajo futuro declarado).
- Riesgo de memorización no evaluado: al entrenar sobre un conjunto pequeño y sin comprobación de memorización, existe la posibilidad de que el modelo reproduzca parches de entrenamiento; debe verificarse antes de usar los datos sintéticos en cualquier estudio.
- Licencia MIT: permite uso comercial y modificación, pero el autor no otorga garantías y desaconseja el uso clínico; conviene revisar las condiciones del dataset HEST-1k para usos derivados.
- Idiomas: no aplica, pero conviene señalar que no es un modelo de texto y no debe evaluarse con métricas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YiannisChionas/sd-class-hest-ccrcc-64
- Dataset HEST-1k benchmark: https://huggingface.co/datasets/MahmoodLab/hest-bench
- Librería diffusers (documentación de `DDPMPipeline`): https://huggingface.co/docs/diffusers/api/pipelines/ddpm
- Librería diffusers (repositorio): https://github.com/huggingface/diffusers
