# thedeoxen/Krea-2-pose-controlnet

## Resumen

Krea-2-pose-controlnet es un adaptador LoRA de tipo ControlNet clásico para el modelo de generación de imágenes Krea-2-Turbo, desarrollado por el desarrollador comunitario thedeoxen. Su función es permitir el control explícito de la pose corporal de los sujetos generados mediante mapas de esqueleto OpenPose o DWPose, mientras que el prompt de texto define la apariencia, el estilo, la vestimenta y el entorno. Está diseñado para integrarse en flujos de trabajo de ComfyUI y se distribuye bajo licencia Apache 2.0.

El modelo resuelve el problema de la falta de control fino sobre la anatomía y la postura en la generación de imágenes con Krea-2-Turbo. En lugar de depender únicamente de descripciones textuales, el usuario proporciona un mapa de pose como imagen de control, lo que permite generar personajes en posiciones concretas con alta fidelidad. Es un adaptador ligero (0,3 GB) que se carga sobre el UNet del modelo base, sin necesidad de un modelo de ControlNet completo.

Su relevancia actual radica en que Krea-2-Turbo es un modelo de imagen reciente y de código abierto, y este LoRA amplía sus capacidades de control estructural sin requerir entrenamiento adicional. Está pensado para ilustradores, creadores de cómics, animadores y desarrolladores que necesiten un control de pose preciso en sus pipelines de generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de ControlNet para el UNet de Krea-2-Turbo |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (peso en safetensors, se recomienda fp8 para el modelo base) |
| Idiomas soportados | no disponible (el prompt se procesa mediante el text encoder de Krea-2) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un LoRA de ControlNet clásico, no de un modelo de fusión de referencia y pose. El adaptador enseña al modelo base Krea-2-Turbo a interpretar una imagen de entrada (mapa de esqueleto OpenPose/DWPose) como una señal de control de pose, alineando el sujeto generado con la estructura del esqueleto. La apariencia, la ropa, la iluminación y el entorno se derivan exclusivamente del prompt de texto.

El entrenamiento se realizó principalmente con imágenes de humanos, aunque también funciona con personajes estilizados. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de optimización (RLHF, DPO, etc.). El LoRA se carga sobre el UNet de Krea-2-Turbo con un peso recomendado entre 0,8 y 1,0 para una adherencia fuerte, o entre 0,6 y 0,8 si se busca una pose más flexible.

El flujo de trabajo incluido en el repositorio utiliza DWPose (a través de comfyui_controlnet_aux) para la extracción de poses y los nodos Krea2 Ostris Edit para el acondicionamiento con la imagen de control. Los ajustes típicos de muestreo son aproximadamente 10 pasos, CFG 1,0, con el muestreador euler y el programador simple.

## Capacidades

- Control de pose corporal mediante mapas de esqueleto OpenPose o DWPose.
- Generación de personajes humanos y estilizados siguiendo la estructura anatómica del mapa de pose.
- Separación entre el control estructural (pose) y la definición semántica (prompt): el prompt determina identidad, vestimenta, estilo, iluminación y escena.
- Integración con ComfyUI mediante los nodos Krea2 Ostris Edit y el preprocesador DWPose de comfyui_controlnet_aux.
- Funciona como adaptador drop-in para Krea-2-Turbo, sin necesidad de un modelo de ControlNet completo.
- Ajuste de la intensidad del control mediante el peso del LoRA (0,6–1,0).
- No requiere una frase desencadenante especial; la pose se toma de la imagen de control.

## Casos de uso

- Ilustración de personajes: un ilustrador puede dibujar un esqueleto OpenPose con la postura deseada y generar el personaje final con el estilo y la ropa definidos por prompt, manteniendo la anatomía correcta.
- Creación de cómics y storyboards: permite encadenar viñetas con poses consistentes, cambiando únicamente el prompt para variar el personaje o la escena, lo que acelera el proceso de preproducción.
- Animación y keyframes: se pueden generar fotogramas clave de una secuencia de animación a partir de poses extraídas de referencias o de captura de movimiento, manteniendo la coherencia del personaje.
- Concept art para videojuegos: los diseñadores pueden explorar variaciones de vestuario y estilo sobre una misma pose base, útil para iterar sobre diseños de personajes.
- Generación de avatares y retratos controlados: se puede especificar una pose concreta (por ejemplo, de pie, sentado, en acción) y generar el retrato con el estilo deseado, útil para perfiles de usuario o material promocional.
- Automatización de pipelines de generación: al ser un LoRA ligero y compatible con ComfyUI, puede integrarse en flujos automatizados de producción de imágenes donde se necesite control de pose sin intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos comparativos de rendimiento frente a otros adaptadores de pose para Krea-2 u otros modelos de generación de imágenes.

## Requisitos de hardware

- El repositorio no especifica requisitos mínimos de hardware. Al tratarse de un LoRA de 0,3 GB, el consumo adicional de VRAM sobre el modelo base Krea-2-Turbo es reducido.
- El modelo base Krea-2-Turbo requiere una GPU con suficiente VRAM para su inferencia; no se indican valores concretos en la documentación disponible.
- Se recomienda el uso de ComfyUI con soporte para el modelo base y los nodos auxiliares (comfyui_controlnet_aux y comfyui-krea2-ostris-edit).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de control de pose comparables para Krea-2-Turbo en el momento de la consulta. Existen ControlNet LoRA para otros modelos de difusión (por ejemplo, SD 1.5 o SDXL), pero no se pueden establecer comparaciones directas sin datos de rendimiento.

## Limitaciones y advertencias

- El modelo fue entrenado principalmente con humanos; el rendimiento con personajes muy estilizados o criaturas no humanoides puede ser inferior.
- La adherencia a la pose depende del peso del LoRA: valores bajos (0,6) pueden dar poses poco fieles, mientras que valores altos (1,0) pueden provocar rigidez o deformaciones.
- El control de pose se limita a la estructura corporal; no controla expresiones faciales, manos ni detalles finos más allá del esqueleto.
- Requiere el modelo base Krea-2-Turbo y los nodos específicos de ComfyUI; no es un modelo autónomo.
- No se han documentado sesgos específicos, pero al ser un adaptador de pose, los sesgos del modelo base se mantienen.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Krea-2-Turbo para asegurar el cumplimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thedeoxen/Krea-2-pose-controlnet
- Peso del LoRA: https://huggingface.co/thedeoxen/Krea-2-pose-controlnet/blob/main/krea2_turbo_openpose_controlnet.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/Krea-2-pose-controlnet/blob/main/krea2_controlnet_pose.json
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Código oficial de inferencia de Krea 2: https://github.com/krea-ai/krea-2
- Nodos Krea2 Ostris Edit: https://github.com/ostris/comfyui-krea2-ostris-edit
- Preprocesador DWPose (comfyui_controlnet_aux): https://github.com/Fannovel16/comfyui_controlnet_aux
- Artículo en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-08-04-krea-2-pose-controlnet
