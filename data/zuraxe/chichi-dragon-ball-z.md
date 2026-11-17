# zuraxe/chichi-dragon-ball-z

## Resumen

Chichi - Dragon Ball Z es un adaptador LoRA de personaje para modelos de difusion de texto a imagen de la familia SDXL, concretamente entrenado sobre el checkpoint base AnyIllustrious XL v0.1.1 (variante de SDXL con prediccion epsilon). Lo desarrolla NSFWstudio y se distribuye a traves de la plataforma Renderoverse; el repositorio de Hugging Face es un espejo que preserva los pesos de la version 1.0.0 sin modificarlos. No es un modelo autonomo: requiere cargarse junto a un checkpoint SDXL compatible para generar imagenes.

El adaptador incorpora dos disparadores en el prompt: `chichi_renderoverse` para el personaje y `Chichioutfit` para el vestuario. Su proposito es reproducir el aspecto del personaje de Dragon Ball Z en generaciones controladas por el usuario, algo habitual en flujos de trabajo de ilustracion, fan art y creacion de contenido con ComfyUI u otras interfaces compatibles con LoRA.

El modelo es relevante dentro del ecosistema de personalizacion de difusion por su bajo coste de almacenamiento (185,7 MB) y por su licencia MIT, poco frecuente en adaptadores de personaje con contenido para adultos. No obstante, el propio autor advierte que la licencia no concede derechos sobre el personaje ni sobre las marcas de terceros, y el repositorio esta marcado como no apto para todas las audiencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; base AnyIllustrious XL v0.1.1 / SDXL epsilon |
| Parametros totales | no disponible (adaptador de 185.719.136 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto a imagen) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors de precision original |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del checkpoint base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un LoRA de personaje, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atencion y proyeccion del checkpoint SDXL subyacente. El autor identifica como base AnyIllustrious XL v0.1.1 con prediccion epsilon, una variante de la familia Illustrious orientada a ilustracion y anime. El archivo pesa 185.719.136 bytes y su SHA-256 es `0ff703d683a379c5646e2f0dc2ae73a461f02c511ecfe9e3e60f6f8912e99260`, lo que permite verificar la integridad de la descarga.

La model card no detalla el numero de imagenes de entrenamiento, la composicion del dataset, el numero de pasos ni si se aplicaron tecnicas de regularizacion o captions automaticos. Si se indica que el conjunto de entrenamiento incluye imagenes con y sin ropa, motivo por el que el repositorio lleva la etiqueta not-for-all-audiences. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal ni similares), ya que no aplica a un adaptador de difusion.

## Capacidades

- Generacion de imagenes de texto a imagen del personaje Chichi de Dragon Ball Z, condicionada por el disparador `chichi_renderoverse`.
- Control de vestuario mediante el disparador secundario `Chichioutfit`.
- Integracion como capa LoRA sobre checkpoints SDXL compatibles, con ajuste de fuerza (strength) por parte del usuario.
- Compatibilidad con flujos de ComfyUI mediante el nodo Load LoRA, ubicando el archivo en `ComfyUI/models/loras`.
- Estilizacion orientada a ilustracion y anime gracias a la base Illustrious.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o video: es exclusivamente un adaptador de generacion de imagen.
- Capacidades multilingues: no documentadas; dependen del codificador de texto del checkpoint base.

## Casos de uso

- Fan art de personaje: el adaptador permite generar ilustraciones de Chichi manteniendo consistencia de rasgos entre generaciones, usando el disparador de personaje junto a un checkpoint Illustrious.
- Creacion de variantes de vestuario: con `Chichioutfit` y prompts descriptivos se pueden producir conjuntos de imagenes con distintas indumentarias para un mismo personaje, util en proyectos de ilustracion serializada.
- Prototipado de personajes para narrativa visual: estudio de poses y expresiones antes de encargar arte final, gracias al bajo coste de iteracion del flujo texto a imagen.
- Contenido para comunidades de fanes: generacion de imagenes para foros o redes con tematica Dragon Ball Z, siempre que se respeten los derechos de terceros.
- Pruebas de pipelines de difusion: validacion de flujos ComfyUI con LoRA de personaje y ajuste de strength, utiles para calibrar configuraciones antes de desplegar adaptadores propios.
- Composicion con otros LoRA: combinacion con adaptadores de estilo o de escena para integrar al personaje en entornos concretos, ajustando pesos para evitar saturacion.
- Generacion de material para adultos: el repositorio admite contenido no apto para todas las audiencias, por lo que puede emplearse en plataformas que verifiquen edad y cumplan la normativa aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se suministra ninguna evaluacion de calidad de imagen ni metrica objetiva con este espejo.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un coste minimo sobre el checkpoint base SDXL; en la practica, el requisito dominante es el del checkpoint (tipicamente 8-12 GB en fp16 segun resolucion y optimizaciones).
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para lotes grandes y resoluciones altas; RTX 3060 de 12 GB o superiores para uso individual.
- Cabe en GPU de consumo: si, siempre que el checkpoint SDXL base quepa; el LoRA en si ocupa menos de 200 MB.
- Opciones de despliegue: ComfyUI (nodo Load LoRA), Automatic1111/Forge y otras interfaces compatibles con LoRA SDXL; no aplica vLLM, llama.cpp ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen por completo de la GPU, la resolucion, el sampler y el numero de pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Chichi - Dragon Ball Z (este) | LoRA de personaje | AnyIllustrious XL v0.1.1 / SDXL | 185,7 MB | no aplica | MIT | Hugging Face (espejo) y Renderoverse |
| LoRA de personaje SDXL generico | LoRA de personaje | SDXL o Illustrious | variable (100-300 MB) | no aplica | variable | Civitai, Hugging Face |
| Checkpoint Illustrious XL | Modelo completo | SDXL | varios GB | no aplica | variable | Hugging Face, Civitai |
| Checkpoint SDXL base | Modelo completo | SDXL | varios GB | no aplica | CreativeML Open RAIL++-M | Hugging Face, Stability AI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un checkpoint autonomo: sin un checkpoint SDXL compatible no genera nada.
- La calidad y el parecido del personaje dependen del checkpoint base, del prompt y del strength del LoRA; no hay evaluacion objetiva publicada.
- Contenido no apto para todas las audiencias: el entrenamiento incluye imagenes sin ropa, por lo que debe restringirse su uso a contextos con verificacion de edad y cumplimiento normativo.
- La licencia MIT cubre el artefacto, pero no concede derechos sobre el personaje, el nombre ni las marcas de Dragon Ball Z, propiedad de sus titulares; el uso comercial del personaje puede infringir derechos de terceros.
- Riesgo de alucinacion visual y artefactos propios de la difusion: manos, proporciones y detalles del vestuario pueden degradarse con prompts ambiguos o strengths altos.
- Idiomas no documentados: los prompts en lenguas distintas del ingles pueden funcionar peor segun el codificador de texto del checkpoint base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion independiente.
- El espejo declara preservar los pesos originales, pero conviene verificar el SHA-256 antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/zuraxe/chichi-dragon-ball-z
- Fuente original en Renderoverse: https://renderoverse.com/model/chichi-dragon-ball-z
- Renderoverse (plataforma): https://renderoverse.com/
