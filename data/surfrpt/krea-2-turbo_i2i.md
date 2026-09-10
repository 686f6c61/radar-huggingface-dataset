# surfrpt/Krea-2-Turbo_I2I

## Resumen

Krea 2 Turbo Image Generator es un Space de Gradio publicado por el usuario surfrpt bajo el identificador `surfrpt/Krea-2-Turbo_I2I`. No es un repositorio de pesos en sentido estricto: se trata de una interfaz que ejecuta el modelo de difusión Krea 2 Turbo mediante una instancia sin cabeza (headless) de ComfyUI, orquestando checkpoints, codificadores, VAE y adaptadores descargados de repositorios de terceros. El repositorio acumula 0 descargas y 0 likes, y su licencia declarada es "other".

El sistema ofrece dos modos: generación texto-a-imagen y edición de imagen guiada por instrucciones, con una segunda imagen de referencia opcional. La cadena técnica combina un codificador de texto Qwen3-VL de 4B en fp8 escalado (`qwen3vl_4b_fp8_scaled.safetensors`), un VAE (`qwen_image_vae.safetensors`) y checkpoints de difusión Krea 2 Turbo en `safetensors`, uno de ellos en int8. El modo edición incorpora el adaptador Krea 2 Identity Edit v1.2, que permanece siempre activo por delante de la cadena de LoRAs del usuario.

Su interés práctico es el patrón de despliegue: descarga perezosa de checkpoints y LoRAs desde cualquier repositorio de Hugging Face accesible (incluidos privados vía `HF_TOKEN`), catálogo de LoRAs con pesos firmados y búsqueda, perfiles de ajustes portables en JSON y metadatos incrustados en los PNG generados. No se documentan parámetros totales del modelo de difusión, longitud de contexto, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión Krea 2 Turbo ejecutado sobre ComfyUI; codificador de texto Qwen3-VL de 4B y VAE `qwen_image_vae.safetensors` |
| Parametros totales | no disponible (no se declara el tamaño del checkpoint de difusión) |
| Parametros activos | no disponible (no se documenta una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 escalado (codificador de texto), int8 (checkpoint `pornmasterKrea2_v2TurboInt8`); no se documenta soporte GGUF |
| Idiomas soportados | no disponible |
| Licencia | other (Krea 2 Community License Agreement; cada adaptador conserva su propia licencia) |
| Formato de pesos | safetensors para los checkpoints publicados; se admiten también `.ckpt`, `.pt` y `.bin` en checkpoints personalizados |
| Tarea principal | Texto a imagen y edición de imagen por instrucciones (image-to-image) |
| Backend de ejecución | ComfyUI headless; Space de Gradio 5.44.1 sobre Python 3.12 (`app.py`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 (fecha de actualizacion declarada: 2026-08-19, anterior a la de creacion) |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento: no se indica el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste por preferencias (RLHF, DPO) o destilación. Tampoco se especifica si el modelo de difusión subyacente emplea una arquitectura transformer de difusión (DiT), U-Net u otra variante, más allá de identificarlo como "Krea2 diffusion model". Toda esa información debe considerarse no disponible.

Lo que sí se describe es el pipeline de inferencia. La ejecución se delega en ComfyUI, con los nodos de edición aportados por el repositorio `ComfyUI-Krea2Edit`. En modo edición, la imagen primaria actúa como escena o fuente y la segunda imagen como sujeto o referencia adicional; la geometría de referencia empleada es `fit` y el ajuste de megapíxeles objetivo controla el tamaño de salida preservando la relación de aspecto de la imagen primaria. El parámetro de grounding regula el compromiso entre seguir la instrucción de edición (valores bajos) y preservar la identidad de la referencia (valores altos). El adaptador Identity Edit v1.2 se aplica obligatoriamente antes de la cadena de LoRAs seleccionable por el usuario.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante los checkpoints Krea 2 Turbo incluidos.
- Edición de imágenes guiada por instrucciones en lenguaje natural, con imagen primaria obligatoria y segunda imagen de referencia opcional.
- Condicionamiento de identidad mediante Krea 2 Identity Edit v1.2 en el modo de edición.
- Selección entre dos checkpoints base personalizados: `museByStableYogi_v25EXTENDEDTURBO.safetensors` y `pornmasterKrea2_v2TurboInt8.safetensors`.
- Carga de checkpoints base externos desde cualquier repositorio de Hugging Face accesible, indicando repositorio, nombre de fichero relativo y revisión opcional.
- Catálogo integrado de LoRAs con control de peso firmado, búsqueda y filtrado, más filas de LoRAs personalizadas por repositorio y fichero.
- Controles de semilla, muestreo, grounding y fidelidad a la referencia.
- Exportación de metadatos en el PNG generado (objeto JSON `krea_settings` y campo `parameters` legible) y perfiles de ajustes portables en JSON que preservan checkpoint, repositorio de checkpoint personalizado y pesos de LoRA.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada para comprensión (el Qwen3-VL se emplea como codificador de texto) ni salidas de audio.

## Casos de uso

- Edición de imagen de producto para comercio electrónico: partiendo de una fotografía de catálogo, se aplican instrucciones como cambiar el fondo, la iluminación o el color del material, con la segunda imagen actuando como referencia del producto para mantener su apariencia.
- Retoque de retratos con preservación de identidad: el adaptador Identity Edit v1.2 y el control de grounding permiten modificar vestuario, entorno o iluminación reduciendo la deriva en los rasgos faciales respecto a la referencia, siempre con consentimiento explícito de la persona retratada.
- Sustitución de fondos y composición de escenas: la imagen primaria define la escena y la segunda aporta el sujeto, lo que encaja en flujos de fotomontaje publicitario donde se reutiliza un mismo sujeto en varios entornos.
- Prototipado rápido de conceptos visuales: el modo texto-a-imagen sirve para generar bocetos de dirección de arte antes de encargar producción final, con control de semilla para reproducir variaciones concretas.
- Comparación estilística sistemática con LoRAs: el catálogo con pesos firmados y el filtrado permiten recorrer combinaciones de adaptadores y pesos, exportando cada resultado con su perfil JSON para trazabilidad.
- Estandarización de pipelines entre miembros de un equipo: los perfiles JSON portables y los metadatos incrustados en PNG permiten reproducir exactamente una generación (checkpoint, revisión, LoRAs y parámetros) en otra máquina.
- Integración en flujos internos con checkpoints privados: al admitir repositorios privados mediante `HF_TOKEN`, un equipo puede mantener sus checkpoints afinados fuera del acceso público y consumirlos desde este Space.
- Base para demos o pruebas de concepto sobre ComfyUI: al apoyarse en nodos abiertos (`ComfyUI-Krea2Edit`), sirve como plantilla para montar un servicio de edición por instrucciones en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud de identidad, precisión de edición), ni comparaciones con otros modelos, ni datos de latencia o throughput. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existe validación comunitaria publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como estimación orientativa no confirmada por el autor, los componentes cuantificables son el codificador de texto Qwen3-VL de 4B en fp8 escalado (aproximadamente 4-5 GB) y el VAE (aproximadamente 0,2-0,3 GB); el tamaño del checkpoint de difusión no se declara en la documentación.
- GPU recomendadas: no disponible. No se especifica ninguna GPU objetivo ni perfil de memoria.
- Encaje en GPU de consumo: no confirmado. Al no declararse el tamaño del checkpoint de difusión, no puede afirmarse que quepa en una GPU de consumo concreta; ComfyUI permite descarga perezosa y gestión de memoria, pero no hay cifras publicadas.
- Opciones de despliegue: Space de Hugging Face (Gradio 5.44.1, Python 3.12, fichero `app.py`), ComfyUI en modo headless con los nodos de `ComfyUI-Krea2Edit`, o cualquier instalación de ComfyUI que cargue los checkpoints, VAEs y LoRAs referenciados. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no se trata de un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el Space descarga checkpoints, VAE, codificador de texto, adaptador de identidad y LoRAs bajo demanda, cacheándolos en los directorios gestionados por ComfyUI; el consumo de disco depende de los checkpoints seleccionados y no se cuantifica en la documentación.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La model card no menciona alternativas ni ofrece métricas frente a otros sistemas, y no se declaran parámetros totales, contexto ni rendimiento de este modelo, por lo que cualquier comparación numérica sería especulativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Krea 2 Turbo (este Space) | no disponible | no disponible | other (Krea 2 Community License Agreement) | Space de Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

Como única referencia indirecta, los componentes empleados (codificador Qwen3-VL de 4B y `qwen_image_vae.safetensors`) apuntan a la línea Qwen-Image, pero la documentación no confirma ninguna relación formal ni permite establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Licencia "other": el uso comercial queda sujeto al Krea 2 Community License Agreement, cuyos términos deben revisarse antes de cualquier despliegue productivo. Los adaptadores (Identity Edit, LoRAs del catálogo) mantienen licencias propias y pueden imponer condiciones adicionales.
- Inclusión de un checkpoint con contenido para adultos: el selector por defecto ofrece `pornmasterKrea2_v2TurboInt8.safetensors`, un modelo Krea 2 Turbo orientado a contenido explícito. Debe filtrarse o retirarse en cualquier despliegue con público general.
- Riesgo de suplantación: el propio autor advierte de que el flujo de edición de identidad no debe emplearse para impersonación no consentida o dañina de personas reales. Es un riesgo relevante en producción si no se aplican controles de acceso y verificación.
- Fidelidad y alucinación visual: no se publican métricas de adherencia a la instrucción ni de preservación de identidad. La calidad depende de parámetros subjetivos como grounding y fidelidad a la referencia, sin valores recomendados documentados.
- Idiomas: no se declara ningún conjunto de idiomas soportados para las instrucciones de edición ni para los prompts. No puede asumirse soporte multilingüe.
- Metadatos inconsistentes: la fecha de creación (2026-09-10) es posterior a la de actualización declarada (2026-08-19), lo que sugiere un problema de metadatos en el repositorio.
- Ausencia de validación comunitaria: 0 descargas y 0 likes implican que no hay evidencia externa de funcionamiento correcto, estabilidad ni calidad de salida.
- Dependencia de terceros: el Space descarga pesos de `Comfy-Org/Krea-2`, `mpasila/Krea-2-Models`, `mpasila/Krea-2-LoRAs` y `conradlocke/krea2-identity-edit`. Salvo que se fije una revisión, estos repositorios pueden cambiar y romper la reproducibilidad.
- Credenciales: el acceso a repositorios privados requiere exponer `HF_TOKEN` o `HUGGINGFACE_HUB_TOKEN` en el entorno del Space, con el consiguiente riesgo de gestión de secretos.
- Ejecución de pesos externos: la opción de cargar checkpoints arbitrarios en `.safetensors`, `.ckpt`, `.pt` o `.bin` desde cualquier repositorio accesible implica ejecutar artefactos no verificados; los formatos `.pt` y `.bin` basados en pickle conllevan riesgo de deserialización.
- No se documentan sesgos demográficos, evaluaciones de seguridad, ni limitaciones de contexto aplicables al modo de generación.

## Enlaces

- Repositorio del Space: https://huggingface.co/surfrpt/Krea-2-Turbo_I2I
- Espejo del codificador de texto y el VAE: https://huggingface.co/Comfy-Org/Krea-2
- Checkpoints base de Krea 2: https://huggingface.co/mpasila/Krea-2-Models
- Catálogo de LoRAs de Krea 2: https://huggingface.co/mpasila/Krea-2-LoRAs
- Adaptador Krea 2 Identity Edit v1.2: https://huggingface.co/conradlocke/krea2-identity-edit
- Nodos de edición para ComfyUI: https://github.com/lbouaraba/comfyui-krea2edit
- Catálogo de LoRAs integrado: fichero `krea2_loras.json` referenciado con ruta relativa dentro del Space (URL absoluta no disponible)
- Paper, blog o demo oficiales: no disponibles en la información proporcionada
