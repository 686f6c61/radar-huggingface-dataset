# Wan-AI/Wan2.2-T2V-A14B

## Resumen

Wan2.2-T2V-A14B es un modelo de generación de vídeo a partir de texto (text-to-video) desarrollado por Wan-AI, el equipo detrás de la familia Wan de modelos generativos de vídeo. Forma parte del lanzamiento de Wan2.2 (julio de 2025), una actualización de los modelos fundacionales Wan2.1 que introduce por primera vez una arquitectura Mixture-of-Experts (MoE) en un modelo de difusión de vídeo: el proceso de denoising se reparte entre expertos especializados según el tramo de timesteps, lo que amplía la capacidad total del modelo manteniendo el coste computacional por paso. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, con integración oficial en Diffusers y ComfyUI.

El modelo genera clips de 5 segundos en resoluciones de 480P y 720P a partir de un prompt textual, con soporte opcional de extensión de prompt. La versión A14B corresponde a la variante MoE con 14B de parámetros activos; el repositorio no detalla el total de parámetros ni el reparto exacto entre expertos. Según el autor, Wan2.2 incorpora datos estéticos anotados (iluminación, composición, contraste, tono de color) para permitir un control más preciso del estilo cinematográfico, y se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1.

Su relevancia actual radica en que compite directamente con generadores de vídeo comerciales: el autor afirma que, en su benchmark interno Wan-Bench 2.0, el modelo supera a los principales modelos comerciales en la mayoría de las dimensiones de evaluación, aunque no se han publicado las cifras concretas. Es, por tanto, una de las pocas opciones de generación de vídeo de alta calidad con licencia permisiva y pesos abiertos descargables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión para vídeo con Mixture-of-Experts (MoE); expertos especializados por tramos de timesteps del proceso de denoising |
| Parametros totales | no disponible en la información proporcionada |
| Parametros activos | 14B (según la nomenclatura A14B del repositorio) |
| Longitud de contexto | no disponible (modelo texto-a-vídeo; acepta prompt de texto, con extensión de prompt opcional) |
| Tipos de cuantizacion | no detallados en la model card; pesos en safetensors, compatible con Diffusers y ComfyUI |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Diffusers) |
| Modalidad | Texto a vídeo (T2V) |
| Resoluciones | 480P y 720P |
| Duración del clip | 5 segundos |
| Fotogramas por segundo | no disponible para esta variante (el modelo TI2V-5B de la misma familia genera a 24 fps) |
| Tamaño del repositorio | 240,5 GB |
| Librería / framework | wan2.2 (repositorio oficial), Diffusers, ComfyUI |
| Requisitos de software | torch >= 2.4.0 |

## Arquitectura y entrenamiento

Wan2.2-T2V-A14B es un modelo de difusión para vídeo que introduce una arquitectura Mixture-of-Experts en el proceso generativo. En lugar de emplear una única red para todos los pasos del denoising, el modelo separa el proceso por tramos de timesteps y asigna cada tramo a un experto especializado y de gran capacidad. Según el autor, este diseño amplía la capacidad global del modelo manteniendo el mismo coste computacional por paso, lo que permite aumentar la calidad sin incrementar proporcionalmente los requisitos de inferencia. La model card no especifica el número de expertos, el total de parámetros ni el tipo exacto de backbone (transformer de difusión), por lo que esos detalles deben consultarse en el informe técnico.

En cuanto a los datos, Wan2.2 se entrenó con un volumen significativamente mayor que Wan2.1: un 65,6 % más de imágenes y un 83,2 % más de vídeos, lo que según el autor mejora la generalización en movimiento, semántica y estética. Además, se incorporaron datos estéticos cuidadosamente seleccionados y anotados con etiquetas detalladas de iluminación, composición, contraste y tono de color, lo que habilita un control más preciso del estilo cinematográfico. La model card no indica el número de tokens o clips de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de ajuste por preferencias (RLHF/DPO); para ello remite al informe técnico (arXiv 2503.20314).

## Capacidades

- Generación de vídeo a partir de texto en resoluciones de 480P y 720P, con clips de 5 segundos de duración.
- Generación de movimiento complejo: el autor destaca mejoras en generalización de movimientos y semántica frente a Wan2.1 gracias a un mayor volumen de datos de vídeo.
- Control estético cinematográfico: datos anotados con iluminación, composición, contraste y tono de color permiten orientar el estilo visual mediante el prompt.
- Extensión de prompt opcional: el repositorio incluye un modo de inferencia con y sin extensión automática del prompt.
- Integración con Diffusers y ComfyUI, lo que habilita flujos de trabajo por nodos y pipelines programáticos.
- Inferencia multi-GPU oficial mediante el código del repositorio Wan2.2.
- No se documentan en la información disponible capacidades de tool calling, razonamiento agéntico, audio, visión como entrada ni modo thinking; se trata de un modelo generativo de vídeo, no de un modelo de lenguaje.

## Casos de uso

- Previsualización cinematográfica y animáticas: generar clips de 5 s a 720P para validar encuadres, iluminación y ritmo antes de rodar, usando el control estético por etiquetas de composición y tono de color.
- Producción de contenido publicitario: creación de piezas cortas para redes sociales y campañas, con variaciones de estilo controladas mediante el prompt y generación por lotes desde Diffusers.
- Creación de material de stock y bancos de vídeo: generación automatizada de clips temáticos con licencia Apache 2.0, sin las restricciones de atribución de otras licencias de modelos generativos.
- Diseño de storyboards y concept art animado: iteración rápida sobre secuencias narrativas antes de pasar a producción 3D o rodaje real.
- Investigación en generación de vídeo: el modelo sirve como baseline abierto y reproducible para estudiar arquitecturas MoE en difusión, con pesos y código de inferencia publicados.
- Integración en pipelines de postproducción y VFX: generación de planos de relleno, fondos animados o elementos de transición que luego se componen en herramientas de edición.
- Educación y divulgación: creación de visualizaciones animadas de conceptos a partir de descripciones textuales, con coste marginal bajo frente a la producción audiovisual tradicional.
- Automatización de contenido a escala: despliegue en clústeres multi-GPU con el código oficial para generar catálogos de clips de forma desatendida.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card únicamente indica de forma cualitativa que, en el benchmark interno Wan-Bench 2.0, el modelo supera a los principales modelos comerciales en la mayoría de las dimensiones clave de evaluación.

| Benchmark | Resultado |
|---|---|
| Wan-Bench 2.0 | Superior a modelos comerciales líderes en la mayoría de dimensiones según el autor; sin cifras publicadas |
| MMLU, HumanEval, GSM8K y similares | No aplicable (modelo de generación de vídeo) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 240,5 GB, por lo que se recomienda almacenamiento amplio además de la VRAM.
- El código oficial de inferencia para la variante A14B es multi-GPU; no se documenta soporte oficial de GPU de consumo individual para este modelo concreto.
- GPU de consumo: el autor indica que la variante TI2V-5B de la misma familia puede ejecutarse en tarjetas de consumo como la RTX 4090; no se hace la misma afirmación para la A14B.
- Opciones de despliegue: repositorio oficial Wan2.2 (inferencia multi-GPU), Diffusers y ComfyUI. Descarga de pesos vía huggingface-cli o modelscope-cli.
- Requisito de software: torch >= 2.4.0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución / duración | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-T2V-A14B | 14B activos (MoE); total no disponible | 480P y 720P, 5 s | Texto a vídeo | Apache 2.0 | HuggingFace, ModelScope, GitHub |
| Wan2.2-I2V-A14B | 14B activos (MoE); total no disponible | 480P y 720P | Imagen a vídeo | Apache 2.0 | HuggingFace, ModelScope |
| Wan2.2-TI2V-5B | 5B | 720P a 24 fps | Texto e imagen a vídeo | Apache 2.0 (según familia) | HuggingFace, ModelScope |
| Modelos comerciales (referenciados en Wan-Bench 2.0) | no disponible | no disponible | Texto a vídeo | Propietaria | API / servicio |

La model card no ofrece comparaciones numéricas con alternativas concretas; la única referencia comparativa es la afirmación cualitativa sobre Wan-Bench 2.0 frente a modelos comerciales.

## Limitaciones y advertencias

- Duración limitada: los clips generados son de 5 segundos, insuficientes para secuencias largas sin concatenación y trabajo de postproducción.
- Ausencia de datos públicos de benchmarks: las afirmaciones de superioridad frente a modelos comerciales provienen del benchmark interno del autor (Wan-Bench 2.0) y no se han publicado las cifras, lo que impide verificarlas de forma independiente.
- Idiomas soportados no documentados: se desconoce el rendimiento real con prompts en castellano; conviene validar la calidad de generación por idioma antes de usarlo en producción.
- Riesgo de artefactos: como todo modelo de difusión de vídeo, puede producir incoherencias temporales, deformaciones anatómicas, movimiento no físico y texto ilegible dentro del plano. La model card no cuantifica estas tasas de error.
- Sesgos: no se documenta en la información disponible ningún análisis de sesgos del dataset de entrenamiento (representación demográfica, cultural o geográfica), lo que constituye un riesgo a evaluar antes de un despliegue comercial.
- Requisitos de infraestructura: la variante A14B está pensada para inferencia multi-GPU, lo que encarece el despliegue frente a alternativas de menor tamaño.
- Riesgo de uso indebido: la generación de vídeo realista facilita deepfakes y suplantaciones; aunque la licencia Apache 2.0 permite uso comercial, el implementador debe asumir la responsabilidad legal sobre derechos de imagen, propiedad intelectual y consentimiento de las personas representadas.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y aviso de cambios; no se han documentado restricciones adicionales de uso aceptable en la información proporcionada.
- Trazabilidad: los detalles de entrenamiento (número de pasos, composición exacta del dataset, uso de RLHF/DPO) no están en la model card y requieren consultar el informe técnico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Repositorio en GitHub: https://github.com/Wan-Video/Wan2.2
- Informe técnico (arXiv 2503.20314): https://arxiv.org/abs/2503.20314
- Referencia adicional citada en las etiquetas del repositorio (arXiv 2309.14509): https://arxiv.org/abs/2309.14509
- Blog oficial: https://wan.video/welcome
- Sitio del proyecto: https://wan.video
- Organización en HuggingFace: https://huggingface.co/Wan-AI/
- Modelo en ModelScope: https://modelscope.cn/models/Wan-AI/Wan2.2-T2V-A14B
- Organización en ModelScope: https://modelscope.cn/organization/Wan-AI
- Modelo de imagen a vídeo (I2V-A14B): https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Modelo texto/imagen a vídeo (TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Comunidad en Discord: https://discord.gg/AKNgpMK4Yj
