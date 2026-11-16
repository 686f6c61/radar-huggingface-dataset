# TenStrip/MMH3_Sulphur3Eros_Loras-MLP-energy-patches

## Resumen

MMH3_Sulphur3Eros_Loras-MLP-energy-patches es una colección de LoRAs extraídas y recomprimidas por el usuario TenStrip a partir de otros LoRAs populares para el modelo MiniMax-H3, un modelo de generación de vídeo a partir de texto. El repositorio no contiene un modelo base completo, sino un conjunto de adaptadores de bajo rango (LoRA) de tipo MLP-only, con un "energy downranking" aplicado para reducir su rango efectivo y hacerlos más compatibles con modelos fusionados, afinados o mezclados.

El objetivo técnico declarado por el autor es mitigar el colapso que se produce cuando varios LoRAs de H3 se apilan sobre las mismas capas. Según su experiencia, los LoRAs entrenados tienden a concentrarse en los bloques 10-30, tanto en capas de atención como MLP, y el exceso de apilamiento en MLP provoca salidas incoherentes, problemas de diálogo e ignorancia del prompt. La extracción MLP-only con rango reducido busca conservar el efecto de concepto, movimiento y audio sin sobrecargar la estructura nativa del modelo.

El repositorio tiene un tamaño de 0,1 GB, está etiquetado como `not-for-all-audiences` y `text-to-video`, y depende de los modelos base Comfy-Org/MiniMax-H3-Image y FusionCow/Sulphur-3. Está pensado para usarse sobre modelos fusionados como Sulphur3 o Eros que ya incorporan anatomía, desnudez y movimientos generales, de modo que estos LoRAs actúen como modificadores o refuerzos sobre ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre MiniMax-H3, extracción MLP-only |
| Parametros totales | no disponible (repo de 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de LoRAs, presumiblemente safetensors) |

## Arquitectura y entrenamiento

El repositorio contiene LoRAs de tipo MLP-only extraídos de LoRAs de H3 de uso común. El autor aplica un proceso de "energy downranking" para reducir el rango efectivo de cada adaptador, con la indicación de que el rango máximo en un LoRA de H3 debería rondar 32; por encima de ese valor se altera la trayectoria del modelo más de lo necesario. La extracción se limita a las capas MLP, dejando fuera las capas de atención, que según el autor son las que habitualmente provocan el colapso al apilarse.

La hipótesis de trabajo del autor es que los LoRAs entrenados se acumulan en los bloques 10-30, tanto en atención como en MLP, y que la diferencia de forma en el apilamiento empuja esos bloques fuera de la distribución esperada por el resto del modelo, lo que produce un colapso con errores compuestos que se manifiestan como desenfoque extremo, rejilla cuadrada o salida destruida. El exceso de apilamiento en MLP, en cambio, se traduce en salidas sin sentido, problemas de diálogo e ignorancia del prompt. Las capas MLP transportan buena parte del carácter de audio y movimiento y son más robustas al apilamiento de cambios visuales, de ahí la estrategia de conservar solo esas capas con rango reducido.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF o DPO. Los LoRAs incluidos en el repositorio son adaptaciones de terceros, con sus autores y enlaces originales a Civitai indicados por el autor.

## Capacidades

- Modificación de concepto, movimiento y audio sobre modelos base MiniMax-H3 fusionados (Sulphur3, Eros).
- Refuerzo de movimiento: el LoRA "Motion booster V2" de FourBunny acelera el empuje y el rebote del movimiento, con un peso recomendado de 0,5 a 1,0 o más.
- Asistencia anatómica frontal: el LoRA "Penis Lora" de misterxrex ayuda en vistas frontales inferiores, con un peso recomendado de 0,7 a 1,0 o más.
- Asistencia de penetración anal: el LoRA "Anel" de silveroxides actúa como objetivo y ayuda en escenas principalmente heterosexuales, con un peso recomendado de 0,6 a 1,0.
- Apilamiento más estable que los LoRAs originales de H3, al limitar el rango y restringir la modificación a capas MLP.
- Compatibilidad con modelos fusionados, afinados o mezclados, según el autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo, por tratarse de adaptadores de generación de vídeo.

## Casos de uso

- Generación de vídeo para adultos con modelos fusionados: los LoRAs se aplican sobre Sulphur3 o Eros para reforzar movimientos y detalles anatómicos concretos sin destruir la coherencia de la salida, gracias al rango reducido y a la extracción MLP-only.
- Ajuste fino de movimiento en animación para adultos: el LoRA "Motion booster V2" permite intensificar el empuje y el rebote con pesos de 0,5 a 1,0, útil cuando el modelo base produce movimientos demasiado lentos.
- Corrección de vistas anatómicas frontales inferiores: el LoRA "Penis Lora" se usa con pesos de 0,7 a 1,0 para mejorar la coherencia en planos frontales que el modelo base resuelve mal.
- Composición de escenas heterosexuales con penetración anal: el LoRA "Anel" actúa como objetivo y ayuda con pesos de 0,6 a 1,0, orientado a escenas principalmente heterosexuales.
- Apilamiento controlado de varios conceptos: al ser adaptadores de bajo rango y MLP-only, permiten combinar varios efectos sobre un mismo modelo fusionado con menor riesgo de colapso que los LoRAs originales de H3.
- Iteración rápida en flujos de trabajo con ComfyUI: al depender de Comfy-Org/MiniMax-H3-Image, encajan en pipelines de ComfyUI para pruebas de concepto y ajuste de pesos sin reentrenar el modelo base.
- Evaluación de técnicas de downranking: el repositorio sirve como referencia práctica para estudiar cómo el rango y la selección de capas afectan a la estabilidad del apilamiento de LoRAs en modelos de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base MiniMax-H3 sobre el que se apliquen los LoRAs, no del repositorio (0,1 GB).
- GPU recomendadas: no disponible para los LoRAs; el requisito real lo marca el modelo base de vídeo.
- Compatibilidad con GPU de consumo: no disponible; condicionada al modelo base y a su cuantización.
- Opciones de despliegue: ComfyUI es el entorno implícito, dado que el modelo base referenciado es Comfy-Org/MiniMax-H3-Image; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a generación de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MMH3_Sulphur3Eros_Loras-MLP-energy-patches (este repo) | LoRAs MLP-only para MiniMax-H3 | no disponible (0,1 GB) | no disponible | no disponible | Hugging Face |
| LoRAs originales de H3 (Motion booster V2, Penis Lora, Anel) | LoRAs completos (atención + MLP) | no disponible | no disponible | no disponible | Civitai / Hugging Face |
| Modelo base Comfy-Org/MiniMax-H3-Image | Modelo de generación de vídeo texto-a-vídeo | no disponible | no disponible | no disponible | Hugging Face |
| Modelo base FusionCow/Sulphur-3 | Modelo fusionado de MiniMax-H3 | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Contenido para adultos: el repositorio está etiquetado como `not-for-all-audiences` y los LoRAs incluidos están orientados a contenido sexual explícito.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; además, los LoRAs derivan de trabajos de terceros con sus propias condiciones.
- Dependencia de modelos base concretos: el autor indica que los LoRAs dependen de Sulphur3 o Eros, que ya aportan anatomía, desnudez y movimientos generales; sobre otros modelos el comportamiento puede degradarse.
- Riesgo de colapso por apilamiento: aunque el downranking reduce el problema, apilar varios LoRAs sigue pudiendo producir desenfoque extremo, rejilla cuadrada, salidas sin sentido, problemas de diálogo o ignorancia del prompt.
- Rango máximo recomendado de 32: superar ese valor altera la trayectoria del modelo más de lo necesario, según el autor.
- Las observaciones del autor sobre el apilamiento en bloques 10-30 se presentan como "unfounded observation" (observación no fundamentada), sin validación formal publicada.
- Sin datos de benchmarks, idiomas, cuantización ni rendimiento: no es posible evaluar calidad objetiva ni comparar con alternativas.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en la comunidad.
- Atribución requerida: si se publican resultados en Civitai, el autor pide crédito a los autores originales de cada LoRA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TenStrip/MMH3_Sulphur3Eros_Loras-MLP-energy-patches
- Modelo base Comfy-Org/MiniMax-H3-Image: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Modelo base FusionCow/Sulphur-3: https://huggingface.co/FusionCow/Sulphur-3
- LoRA original Motion booster V2 (FourBunny): https://civitai.red/models/2840146/faster-harder-shake-harder-or-h3-motion-boosteranime-edition-update?modelVersionId=3228867
- LoRA original Penis Lora (misterxrex): https://civitai.red/models/2895526/penis-lora-h3?modelVersionId=3273413
- LoRA original Anel (silveroxides): https://huggingface.co/silveroxides/mmh3-anel-lora/tree/main
