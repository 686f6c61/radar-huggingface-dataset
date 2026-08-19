# Zster/othercide

## Resumen

Zster/othercide es un adaptador LoRA de DreamBooth entrenado sobre el modelo base de difusión Krea-2-Raw, desarrollado por el usuario Zster. Su propósito es personalizar la generación de imágenes mediante un token de activación `TOK`, permitiendo que el modelo aprenda un concepto, estilo o sujeto concreto a partir de un pequeño conjunto de imágenes de entrenamiento. El adaptador se distribuye como un único archivo de pesos en formato safetensors, con un tamaño de repositorio de 1,0 GB, y está pensado para cargarse sobre el checkpoint destilado Krea-2-Turbo, que permite generar imágenes en solo 8 pasos de inferencia sin guía clasificadora.

La relevancia de este modelo radica en su integración con el ecosistema de Krea 2, un par de checkpoints (RAW y Turbo) que separa el entrenamiento de la inferencia: los LoRA entrenados sobre RAW expresan con fuerza al ejecutarse sobre Turbo, lo que facilita un flujo de trabajo eficiente para usuarios que necesitan personalización rápida y de alta calidad. El adaptador se publica bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones adicionales. No se proporcionan detalles sobre el contenido específico del concepto entrenado, el número de imágenes utilizadas ni los datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusión Krea 2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado mediante la técnica DreamBooth, que ajusta un subconjunto de los pesos del modelo base para incorporar un concepto visual concreto. El entrenamiento se realizó sobre el checkpoint Krea-2-Raw, que es la versión no destilada del modelo de difusión Krea 2, diseñada específicamente para servir como base de fine-tuning. La inferencia recomendada se realiza sobre Krea-2-Turbo, un checkpoint destilado que reduce el número de pasos de muestreo a 8 y elimina la necesidad de guía clasificadora (guidance scale = 0.0). Esta separación entre entrenamiento e inferencia es una innovación clave del ecosistema Krea 2, ya que permite que los LoRA entrenados en RAW mantengan su expresividad al transferirse a Turbo.

No se dispone de información pública sobre la arquitectura interna del modelo base Krea 2 (si es un transformer de difusión, un modelo U-Net, etc.), ni sobre la composición del dataset de entrenamiento del LoRA, el número de imágenes utilizadas o el proceso de optimización. El entrenamiento se llevó a cabo con el script oficial de DreamBooth para Krea 2 incluido en la librería diffusers de HuggingFace.

## Capacidades

- Generación de imágenes condicionadas por texto, activadas mediante el token `TOK`.
- Personalización de estilo o sujeto: el LoRA ha aprendido un concepto específico que puede aplicarse a diferentes prompts manteniendo la coherencia visual.
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers, lo que permite integración directa en flujos de trabajo existentes.
- Inferencia rápida al combinarse con Krea-2-Turbo: 8 pasos de muestreo sin CFG, reduciendo el coste computacional frente a modelos de difusión estándar.
- Soporte para técnicas de ponderación, fusión y mezcla de LoRA mediante la API de diffusers, lo que permite combinar este adaptador con otros para crear estilos compuestos.

## Casos de uso

- Generación de arte conceptual para un personaje o criatura específica: el LoRA permite producir imágenes consistentes del concepto aprendido en diferentes escenarios, poses o entornos, útil para diseñadores de juegos o ilustradores.
- Creación de avatares o mascotas de marca: al entrenar sobre un pequeño conjunto de imágenes de un logotipo o mascota, el adaptador puede generar variaciones del mismo para campañas publicitarias o redes sociales.
- Prototipado rápido de assets para producción audiovisual: los equipos de preproducción pueden usar el LoRA para visualizar un elemento concreto (vehículo, arma, criatura) en distintas tomas antes de modelarlo en 3D.
- Personalización de contenido para comunidades o fandoms: los usuarios pueden entrenar un LoRA sobre un personaje o estilo de su interés y generar imágenes nuevas que respeten la estética aprendida.
- Experimentación artística con estilos propios: un artista puede entrenar el LoRA sobre su propia obra y luego aplicarlo a prompts arbitrarios para explorar variaciones de su estilo.
- Integración en pipelines de generación masiva: al ejecutarse sobre Krea-2-Turbo con 8 pasos, el adaptador permite generar cientos de imágenes en un lote con un coste computacional reducido, adecuado para datasets sintéticos o pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas cuantitativas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones con otros adaptadores LoRA.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación del modelo. Al tratarse de un LoRA sobre un modelo de difusión, los requisitos dependen principalmente del checkpoint base Krea-2-Turbo.
- Para una resolución típica de 512x512 o 1024x1024, se estima que una GPU con al menos 8-12 GB de VRAM (por ejemplo, RTX 3070, RTX 4060 Ti, RTX 3080) es suficiente para inferencia con el pipeline de diffusers en precisión bf16.
- Para resoluciones mayores (2048x2048) o lotes grandes, se recomiendan GPUs con 16-24 GB de VRAM (RTX 3090, RTX 4090, A5000) o GPUs de datacenter como A100.
- El despliegue puede realizarse mediante la librería diffusers de HuggingFace, que soporta carga de LoRA y generación con `Krea2Pipeline`. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia, ya que se trata de un modelo de difusión.
- La latencia estimada con Krea-2-Turbo es de 8 pasos de muestreo sin CFG, lo que en una GPU moderna (RTX 4090) puede traducirse en tiempos de generación de 1-3 segundos por imagen a 512x512, aunque estos valores no están confirmados oficialmente.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros LoRA de personalización, ya que no se conocen los detalles del concepto entrenado ni métricas de rendimiento. Como referencia genérica, los LoRA de DreamBooth para modelos como Stable Diffusion o SDXL suelen tener tamaños de entre 50 MB y 200 MB, mientras que este adaptador ocupa 1 GB, lo que sugiere que podría incluir pesos de mayor dimensión o múltiples capas, pero no hay datos para confirmarlo. No se pueden comparar parámetros, contexto ni rendimiento con alternativas específicas.

## Limitaciones y advertencias

- El modelo está entrenado para un concepto específico mediante el token `TOK`; fuera de ese concepto, el adaptador puede no aportar ninguna mejora o incluso degradar la calidad de la generación.
- No se han documentado sesgos ni limitaciones de seguridad por parte del autor. Al ser un LoRA de personalización, el riesgo de alucinación o distorsión visual depende en gran medida de la calidad y diversidad de las imágenes de entrenamiento, que no han sido publicadas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Krea-2-Raw y Krea-2-Turbo pueden tener sus propias licencias o condiciones de uso; se recomienda verificar los términos de los checkpoints base antes de utilizarlo en producción.
- No se proporcionan garantías de rendimiento en términos de fidelidad visual, coherencia del concepto o estabilidad del entrenamiento. Los usuarios deben validar el adaptador en su caso de uso específico.
- El repositorio no incluye documentación sobre el proceso de entrenamiento (número de pasos, tasa de aprendizaje, tamaño del dataset), lo que limita la reproducibilidad y la capacidad de diagnóstico de posibles problemas de sobreadaptación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zster/othercide
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Documentación de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- Script de entrenamiento DreamBooth para Krea 2: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
