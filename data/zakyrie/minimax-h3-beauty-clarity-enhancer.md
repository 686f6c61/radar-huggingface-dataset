# Zakyrie/minimax-h3-beauty-clarity-enhancer

## Resumen

MiniMax H3 Beauty & Clarity Enhancer es un LoRA (Low-Rank Adaptation) de refinado visual diseñado para mejorar la calidad estética de los vídeos generados por el modelo de texto-a-vídeo MiniMax H3. Lo publica el usuario Zakyrie en HuggingFace como espejo de los pesos originales creados por vrgamedevgirl en Civitai. No es un modelo autónomo: requiere el modelo base MiniMax H3 y actúa como un adaptador de bajo rango que se aplica durante la generación para afinar detalles, piel, rostros y fondos.

El adaptador resuelve un problema concreto y habitual en la generación de vídeo: la blandura y el ruido en detalles finos, así como las imperfecciones faciales y los fondos embarullados. Aplicado con una fuerza de 1.0, produce resultados más nítidos y cinematográficos sin alterar la intención del prompt original, según el autor. Se ofrece en dos variantes (epoch 5, más sutil, y epoch 10, más agresiva), lo que permite ajustar el grado de embellecimiento.

Por su naturaleza de LoRA, el repositorio ocupa solo 0.7 GB y no incluye arquitectura propia, tokenizador ni pesos base. Es relevante para quienes ya trabajan con MiniMax H3 en flujos ComfyUI de dos pasadas y buscan un acabado más limpio sin cambiar de modelo generativo. La licencia es la MiniMax H3 Community License Agreement, que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión de vídeo MiniMax H3 |
| Parametros totales | no disponible (adaptador LoRA; el repositorio pesa 0.7 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base MiniMax H3) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors (se mencionan variantes int8, nvfp4 y fp16/fp32 para los componentes del modelo base en el flujo de referencia) |
| Idiomas soportados | no disponible (la generación de vídeo depende del codificador de texto del modelo base) |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base MiniMax H3 para modificar su comportamiento sin reentrenar los pesos completos. No se dispone de información sobre el rango del adaptador, las capas objetivo ni la configuración exacta del entrenamiento. El autor original (vrgamedevgirl) preparó el dataset y el entrenamiento; este repositorio es un espejo.

Se ofrecen dos checkpoints: `MiniMaxH3_Enhancer_minimaxh3_3432130_epoch_5.safetensors` (epoch 5, más ligero y sutil) y `MiniMaxH3_Enhancer_minimaxh3_3432130_epoch_10.safetensors` (epoch 10, con embellecimiento facial y nitidez de bordes más marcados). El flujo de referencia documentado es una generación en dos pasadas en ComfyUI: la primera a 960×544 con 20 pasos, sampler `res_multistep`, scheduler `simple`, denoise 1.0 y `BasicGuider` sin CFG ni prompt negativo, aplicando el LoRA Enhancer a fuerza 1.0 solo en esta pasada; después un upscaler latente 3D aprendido (×2) y una segunda pasada de refinado con un Turbo LoRA de 8 pasos a 4 pasos y denoise 0.35, sin el Enhancer. La salida final es 1920×1088 (o 1088×1920 vertical) a 24 fps, con clips de 6 a 8 segundos y audio decodificado del latente de la primera pasada mediante el motor de audio integrado de MiniMax H3. No se han publicado detalles sobre el número de tokens, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Refinado visual de vídeo generado: aumenta la nitidez general, reduce la blandura y el desenfoque no deseado.
- Embellecimiento facial: mejora rasgos, textura de piel y atractivo estético evitando un aspecto plástico artificial, según el autor.
- Limpieza de fondos: reduce elementos embarullados, desordenados o con artefactos.
- Acabado cinematográfico: aporta una estética más pulida y deliberada preservando el fotorrealismo.
- Control de intensidad: dos variantes (epoch 5 y epoch 10) y ajuste de fuerza del LoRA (recomendado empezar en 0.5 y subir hasta 1.0).
- Integración en flujos de dos pasadas: pensado para aplicarse solo en la primera pasada de generación, combinado con un Turbo LoRA en la segunda.
- No incorpora tool calling, razonamiento multi-paso, capacidades de agente, visión ni audio propias: todas esas funciones dependen del modelo base MiniMax H3.

## Casos de uso

- Producción de vídeo publicitario: aplicar el LoRA en la primera pasada para obtener primeros planos de producto y rostros con piel y bordes nítidos, y refinar después con el Turbo LoRA para reducir pasos y coste.
- Contenido para redes sociales en vertical: generar clips de 6 a 8 segundos a 1088×1920 con acabado limpio y audio integrado, adecuado para formatos de story y reel.
- Previsualización de storyboards: usar la variante epoch 5 para mantener la fidelidad facial de los personajes de referencia mientras se valida la composición de escenas.
- Restauración estética de tomas generadas: cuando una generación previa sale blanda o con fondos sucios, reprocesarla con el Enhancer a fuerza moderada para recuperar detalle sin rehacer el prompt.
- Flujos de trabajo en ComfyUI con upscaling latente: combinar el LoRA con el upscaler 3D ×2 y la segunda pasada de refinado para obtener salidas 1920×1088 con coste controlado.
- Iteración de personajes consistentes: la variante epoch 5, al preservar el parecido facial, sirve para mantener la identidad de un personaje a lo largo de varias escenas generadas.
- Postproducción de material fotorrealista: aplicar el adaptador a escenas con iluminación dinámica para limpiar artefactos de fondo manteniendo el aspecto fotográfico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA en sí ocupa 0.7 GB, pero la inferencia requiere cargar el modelo base MiniMax H3 completo, cuyo tamaño y requisitos de VRAM no se detallan en la información disponible.
- El flujo de referencia emplea el modelo base `minimax_h3_fl2va_pruned_int8_convrot`, el codificador de texto `qwen3vl_32b_minimax_h3_nvfp4_awq` y los VAE `minimax_h3_video_vae_fp16` y `minimax_h3_audio_vae_fp32`, lo que sugiere un consumo de VRAM elevado, propio de un pipeline de vídeo con codificador de texto de 32B.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) en la información proporcionada.
- El despliegue documentado se realiza en ComfyUI con un flujo de dos pasadas; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusión de vídeo.
- No se dispone de datos de latencia ni de throughput medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 Beauty & Clarity Enhancer (este) | LoRA detailer sobre MiniMax H3 | no disponible (repo 0.7 GB) | depende del base | minimax-h3-community-license-agreement | HuggingFace (espejo) y Civitai |
| MiniMax H3 FL2V Turbo 8-step LoRA | LoRA de aceleración sobre MiniMax H3 | no disponible | depende del base | no disponible | referenciado en el flujo del autor |
| Modelo base MiniMax H3 | difusión de vídeo texto-a-vídeo | no disponible | no disponible | minimax-h3-community-license-agreement | plataforma MiniMax |

No se dispone de información suficiente para comparar con alternativas de otros ecosistemas (por ejemplo, LoRAs de detalle para otros modelos de vídeo) en parámetros, contexto o rendimiento medido.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: sin el modelo base MiniMax H3 no puede ejecutarse.
- El autor advierte de que una fuerza excesiva o la variante epoch 10 pueden alterar el parecido facial; recomienda empezar en 0.5 para resultados sutiles.
- Riesgo de sobreprocesado estético: el embellecimiento puede producir un aspecto artificial si se combina con otras LoRAs de estilización.
- No hay datos publicados sobre sesgos demográficos, de género o culturales en el embellecimiento facial; es un riesgo plausible en producción y debe evaluarse empíricamente.
- La licencia MiniMax H3 Community License Agreement condiciona el uso comercial; debe revisarse el enlace oficial antes de desplegar en productos comerciales.
- El repositorio es un espejo de pesos creados por un tercero (vrgamedevgirl en Civitai); la trazabilidad y el mantenimiento dependen del autor original.
- No se documentan idiomas soportados ni limitaciones de contexto; ambas dependen del modelo base y de su codificador de texto.
- No hay benchmarks ni métricas objetivas de calidad; la evaluación se basa en comparaciones visuales del autor.

## Enlaces

- HuggingFace: https://huggingface.co/Zakyrie/minimax-h3-beauty-clarity-enhancer
- Página original en Civitai: https://civitai.com/models/3025511/minimaxh3enhancers
- Licencia MiniMax H3: https://platform.minimax.io/h3-license
- Vídeo comparativo (No LoRA vs. Epoch 5 vs. Epoch 10): https://huggingface.co/Zakyrie/minimax-h3-beauty-clarity-enhancer/resolve/main/assets/Beauty%20%26%20Clarity%20-%20Enhancer%20LoRA.mp4
