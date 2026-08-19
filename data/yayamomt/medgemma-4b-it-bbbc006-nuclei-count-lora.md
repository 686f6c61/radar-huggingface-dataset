# yayamomt/medgemma-4b-it-bbbc006-nuclei-count-lora

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) que afina el modelo multimodal MedGemma 4B de Google para contar núcleos celulares en imágenes de microscopía de fluorescencia. El adaptador, desarrollado por yayamomt, se entrena sobre el conjunto de datos BBBC006 (imágenes de núcleos U2OS teñidos con Hoechst) y devuelve una estimación numérica en formato JSON, por ejemplo `{"nuclei_count": 87}`.

El modelo base es `unsloth/medgemma-4b-it-bnb-4bit`, una versión cuantizada a 4 bits de MedGemma 4B, que a su vez es una variante de Gemma 3 con encoder de visión SigLIP preentrenado en datos médicos. El adaptador añade capacidades específicas de conteo de objetos en imágenes biomédicas, reduciendo el error absoluto medio (MAE) de 26.62 a 4.22 en el conjunto de evaluación, una mejora del 84.1%.

La relevancia de este trabajo radica en demostrar que es posible adaptar un modelo multimodal médico de 4B parámetros a una tarea de visión por computadora especializada mediante fine-tuning eficiente con LoRA, utilizando un solo GPU H100 y un conjunto de datos relativamente pequeño (768 imágenes). Aunque es una prueba de concepto y no un sistema clínico, ilustra el flujo de trabajo para crear adaptadores de conteo de objetos en imágenes de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre MedGemma 4B (Gemma 3 con encoder SigLIP) |
| Parametros totales | Modelo base: 4B; adaptador LoRA: no disponible (rank 16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (secuencia de entrenamiento); contexto del modelo base no disponible |
| Tipos de cuantizacion | Base: 4-bit (bnb); adaptador: safetensors en BF16 |
| Idiomas soportados | Inglés |
| Licencia | health-ai-developer-foundations (Google Health AI Developer Foundations) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre MedGemma 4B, un modelo multimodal que combina un decoder-only transformer de 4B parámetros con un encoder de visión SigLIP preentrenado en datos médicos (MedSigLIP). El modelo base acepta imágenes y texto como entrada y genera respuestas de texto. El adaptador LoRA se aplica tanto a las capas de visión como a las de lenguaje, con rango 16, alpha 16 y dropout 0.05.

El entrenamiento se realizó mediante supervisión directa (SFT) con el conjunto BBBC006, que contiene 768 imágenes de microscopía de fluorescencia de núcleos U2OS teñidos con Hoechst. Las imágenes se preprocesaron escalando cada TIFF de 16 bits a 8 bits usando los percentiles 1 y 99.5 de intensidad, luego se convirtieron a RGB. El modelo se entrenó con la instrucción fija de devolver el número de núcleos en formato JSON. Se usaron 5 épocas, tasa de aprendizaje 2e-4 con schedule coseno, batch efectivo de 4, y secuencias de máximo 512 tokens. El entrenamiento se ejecutó en una NVIDIA H100 con precisión BF16 y carga del modelo base en 4 bits.

## Capacidades

- Conteo de núcleos celulares en imágenes de microscopía de fluorescencia (canal Hoechst/DAPI).
- Salida estructurada en JSON con el campo `nuclei_count`.
- Procesamiento de imágenes médicas de alta resolución (TIFF de 16 bits) tras normalización por percentiles.
- Capacidad multimodal: acepta una imagen y una instrucción de texto, y genera una respuesta numérica.
- Adaptación específica a un dominio biomédico concreto (conteo de objetos en cultivos celulares).
- Inferencia determinista con decodificación fija (no se especifica el método exacto, pero se menciona "deterministic decoding").

## Casos de uso

- Screening de fármacos en investigación preclínica: el adaptador puede contar núcleos en imágenes de placas de 384 pocillos para evaluar efectos citotóxicos o proliferativos de compuestos, sustituyendo el conteo manual o los algoritmos clásicos de segmentación.
- Validación de protocolos de laboratorio: permite verificar rápidamente la densidad celular en experimentos de cultivo, comparando las predicciones con los recuentos automatizados de CellProfiler.
- Automatización de pipelines de análisis de imágenes en biología celular: puede integrarse en flujos de trabajo con Python y PEFT para procesar lotes de imágenes TIFF y generar informes JSON.
- Investigación en visión por computadora médica: sirve como punto de partida para adaptar MedGemma a otras tareas de conteo de objetos (por ejemplo, colonias bacterianas o focos de fluorescencia) mediante fine-tuning adicional.
- Educación y demostración técnica: muestra cómo crear un adaptador LoRA para un modelo multimodal médico con recursos limitados (un solo GPU H100 y un dataset pequeño).
- Análisis de imágenes de inmunofluorescencia: aunque el adaptador está entrenado específicamente en el canal Hoechst, la metodología puede extenderse a otros marcadores con datasets similares.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación en un conjunto de validación de 154 imágenes (77 pocillos, disjuntos de entrenamiento). Se comparan el modelo base (MedGemma 4B sin adaptador) y el modelo afinado.

| Metrica | Modelo base | Modelo afinado | Mejora |
|---|---|---|---|
| MAE | 26.62 | 4.22 | 84.1% |
| RMSE | 36.47 | 5.46 | 85.0% |
| MAPE | 40.25% | 14.65% | 63.6% |
| Error absoluto mediano | 19 | 4 | 78.9% |
| Error medio (sesgo) | -6.90 | -1.65 | 76.0% |
| R² | 0.14 | 0.98 | +0.84 |
| Dentro de ±5 nucleos | 28/154 (18.2%) | 107/154 (69.5%) | +51.3 |
| Dentro de ±10 nucleos | 46/154 (29.9%) | 149/154 (96.8%) | +66.9 |

Además, una línea base que predice la media de entrenamiento (106.5 nucleos) obtiene MAE 29.90 y RMSE 40.07, lo que confirma que el modelo afinado aprende dependencia de la imagen. No se comparan con otros modelos de conteo de núcleos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0.2 GB) y puede cargarse sobre el modelo base cuantizado a 4 bits.
- Para inferencia, el modelo base de 4B en 4 bits requiere aproximadamente 2-3 GB de VRAM adicionales al adaptador. Una GPU con 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060) debería ser suficiente.
- Para entrenamiento se usó una NVIDIA H100 con 80 GB, pero con LoRA y cuantización 4-bit es posible entrenar en GPUs consumer de 16 GB (por ejemplo, RTX 4090) con batch pequeño.
- Opciones de despliegue: el adaptador se carga con la librería PEFT sobre el modelo base. Se puede servir con transformers o vLLM (si soporta PEFT), o exportar a GGUF para llama.cpp, aunque no se proporcionan instrucciones específicas.
- La latencia depende del hardware; en una GPU moderna, una inferencia sobre una imagen de 512x512 debería tomar menos de 1 segundo, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros adaptadores de conteo de núcleos sobre MedGemma o modelos similares en la información proporcionada. Como referencia, se puede comparar con el modelo base sin adaptador (ver benchmarks) y con métodos clásicos de conteo como CellProfiler, que son menos flexibles pero no requieren GPU. El adaptador supera ampliamente al modelo base y se acerca al rendimiento de herramientas especializadas de análisis de imagen, aunque su alcance se limita al dominio de imágenes Hoechst de BBBC006.

## Limitaciones y advertencias

- Uso exclusivamente para investigación: el autor declara explícitamente que es una prueba de concepto y no un sistema clínico, de diagnóstico o de análisis de microscopía en producción.
- Dependencia del dominio: el adaptador solo funciona con imágenes similares a las de BBBC006 (núcleos U2OS teñidos con Hoechst, campo de visión específico). No se garantiza el rendimiento en otros tipos de imágenes o marcadores.
- Los recuentos de referencia de BBBC006 son generados automáticamente por CellProfiler, no por anotación manual, lo que introduce un sesgo inherente en las etiquetas.
- Riesgo de alucinación: el modelo puede producir números incorrectos o formatos JSON inválidos si la imagen está fuera de distribución o si el prompt difiere del entrenamiento.
- Licencia restringida: la licencia health-ai-developer-foundations de Google impone condiciones de uso no comercial y restricciones para aplicaciones clínicas. Debe revisarse antes de cualquier despliegue.
- Idioma: solo inglés; las instrucciones deben estar en inglés para obtener resultados fiables.
- Contexto limitado: la secuencia de entrenamiento es de 512 tokens, lo que puede limitar la capacidad de procesar imágenes de muy alta resolución o prompts largos.

## Enlaces

- Repositorio del adaptador: [yayamomt/medgemma-4b-it-bbbc006-nuclei-count-lora](https://huggingface.co/yayamomt/medgemma-4b-it-bbbc006-nuclei-count-lora)
- Modelo base: [unsloth/medgemma-4b-it-bnb-4bit](https://huggingface.co/unsloth/medgemma-4b-it-bnb-4bit)
- Modelo original de Google: [google/medgemma-4b-it](https://huggingface.co/google/medgemma-4b-it)
- Documentación de MedGemma: [Google Health MedGemma](https://developers.google.com/health-ai-developer-foundations/medgemma)
- Repositorio GitHub del autor: [yahyamomtaz/medgemma-vision-fine-tuning](https://github.com/yahyamomtaz/medgemma-vision-fine-tuning)
- Conjunto de datos BBBC006: [Broad Bioimage Benchmark Collection](https://bbbc.broadinstitute.org/BBBC006)
- Página de MedGemma en Google DeepMind: [MedGemma](https://deepmind.google/models/gemma/medgemma/)
