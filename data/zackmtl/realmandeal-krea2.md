# ZackMtl/realmandeal-krea2

## Resumen
`ZackMtl/realmandeal-krea2` es un adaptador LoRA de tipo DreamBooth para generación de imágenes texto-a-imagen, entrenado sobre el checkpoint base `krea/Krea-2-Raw` del modelo Krea 2. Lo publica el usuario ZackMtl en Hugging Face y su función es inyectar un concepto o estilo concreto (activado por la palabra clave `Realmandeal`) en el pipeline de difusión Krea 2, sin necesidad de reentrenar el modelo completo.

El modelo base Krea 2 se distribuye en dos checkpoints complementarios: RAW, la versión no destilada pensada para fine-tuning, y Turbo, una variante destilada de 8 pasos para inferencia rápida. La práctica recomendada por el autor es entrenar el LoRA sobre RAW y ejecutarlo sobre Turbo, ya que los LoRA entrenados en RAW se expresan con fuerza en Turbo. El adaptador se integra mediante la librería `diffusers` con la clase `Krea2Pipeline`.

Es relevante ahora porque demuestra el flujo estándar de personalización de modelos de difusión de última generación con un coste de almacenamiento reducido (1,7 GB de repositorio) y licencia Apache 2.0, lo que facilita su reutilización y despliegue comercial. La model card, sin embargo, es una plantilla autogenerada con secciones sin completar (uso, limitaciones y detalles de entrenamiento), por lo que la información técnica disponible es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre pipeline de difusión texto-a-imagen Krea 2; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (repo de 1,7 GB; el adaptador LoRA en sí no reporta recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; el ejemplo oficial usa `torch.bfloat16` |
| Idiomas soportados | no disponible (los prompts del ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`*.safetensors` del LoRA) |

## Arquitectura y entrenamiento
El adaptador es un LoRA de bajo rango entrenado con DreamBooth sobre el checkpoint `krea/Krea-2-Raw`, utilizando el entrenador oficial `Krea 2 diffusers trainer` del repositorio de `diffusers` (script `examples/dreambooth/README_krea2.md`). DreamBooth es una técnica de personalización que asocia un identificador único —en este caso `Realmandeal`— a un sujeto o estilo concreto mediante un conjunto reducido de imágenes de referencia y una pérdida de prior preservation opcional.

La model card no especifica el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje, el rango del LoRA ni la composición del dataset; todas esas secciones aparecen como `[TODO]`. El pipeline de inferencia recomendado es el de Krea 2 Turbo con 8 pasos de muestreo y `guidance_scale=0.0` (sin classifier-free guidance), receta propia del checkpoint destilado. No se documentan innovaciones técnicas adicionales más allá del esquema RAW/Turbo del modelo base.

## Capacidades
- Generación de imágenes texto-a-imagen condicionada por el token `Realmandeal`.
- Personalización de un concepto, sujeto o estilo concreto sobre el modelo base Krea 2.
- Compatibilidad con el pipeline `Krea2Pipeline` de `diffusers` y carga mediante `load_lora_weights`.
- Inferencia rápida en 8 pasos sobre el checkpoint Turbo, sin classifier-free guidance.
- Posibilidad de combinar, ponderar, fusionar o fundir el LoRA con otros adaptadores según la documentación de `diffusers` sobre carga de adaptadores.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo, por tratarse de un modelo de generación de imágenes.

## Casos de uso
- Personalización de marca: entrenar el LoRA con imágenes de producto o identidad visual y generar variaciones coherentes del concepto `Realmandeal` para campañas, manteniendo el estilo aprendido en cada generación.
- Prototipado rápido de conceptos visuales: usar el checkpoint Turbo con 8 pasos para iterar sobre bocetos en segundos durante sesiones de diseño, reduciendo el coste frente al modelo RAW completo.
- Generación de assets para videojuegos o ilustración: producir variaciones de un personaje u objeto concreto activando el token del LoRA, útil para bibliotecas de sprites o concept art.
- Investigación en personalización de difusión: servir como ejemplo reproducible de DreamBooth LoRA sobre Krea 2 para estudiar la transferencia RAW→Turbo y el efecto del rango del adaptador.
- Creación de contenido editorial: generar imágenes de estilo consistente para blogs o publicaciones aplicando el LoRA sobre Turbo en pipelines automatizados.
- Integración en aplicaciones con `diffusers`: desplegar el adaptador junto al modelo base en servicios de generación de imágenes, aprovechando la licencia Apache 2.0 para uso comercial y la compatibilidad con el ecosistema Hugging Face.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el ejemplo oficial carga el pipeline en `bfloat16` sobre `cuda`, lo que requiere una GPU con memoria suficiente para el modelo base Krea 2 Turbo (no cuantificado en la información proporcionada).
- GPU recomendadas: no disponible; el código de ejemplo no especifica modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende del tamaño del checkpoint base Krea 2 Turbo, que no se detalla.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` (flujo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, al no ser aplicables a un pipeline de difusión.
- Latencia y throughput: no disponible; la receta Turbo de 8 pasos sugiere inferencia rápida, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZackMtl/realmandeal-krea2 | LoRA DreamBooth sobre Krea 2 | no disponible | no aplica | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| krea/Krea-2-Raw | Checkpoint base de difusión | no disponible | no aplica | no disponible en la información | Hugging Face |
| krea/Krea-2-Turbo | Checkpoint destilado 8 pasos | no disponible | no aplica | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de parámetros de los checkpoints base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias
- La model card es una plantilla autogenerada: las secciones de uso, limitaciones, sesgos y detalles de entrenamiento están sin completar (`[TODO]`), por lo que no hay documentación sobre el dataset ni sobre posibles sesgos.
- Riesgo de sobreajuste al concepto `Realmandeal` y de degradación de la diversidad de las generaciones si el LoRA se aplica con pesos altos.
- El token de activación es obligatorio; sin `Realmandeal` en el prompt el adaptador puede no producir el efecto esperado.
- No se documentan idiomas soportados ni comportamiento con prompts en castellano; el ejemplo oficial usa prompts en inglés.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base Krea 2 antes de un despliegue comercial, ya que la información proporcionada no la detalla.
- No hay métricas de calidad (FID, CLIP score, etc.) ni comparaciones con otros LoRA, lo que impide evaluar su rendimiento objetivamente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ZackMtl/realmandeal-krea2
- Modelo base RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Turbo: https://huggingface.co/krea/Krea-2-Turbo
- DreamBooth (paper): https://dreambooth.github.io/
- Entrenador Krea 2 en diffusers: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Documentación de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
