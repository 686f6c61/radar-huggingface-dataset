# TigerFan69/Krea-2-Erika-v1

## Resumen

Krea-2-Erika-v1 es un adaptador LoRA de personaje para el modelo de difusión text-to-image Krea 2, publicado por el usuario TigerFan69 en Hugging Face. No es un modelo completo: se distribuye como un único archivo safetensors de 114.324.760 bytes (aproximadamente 0,1 GB) con 512 tensores en fp16, pensado para cargarse junto con el modelo base `krea/Krea-2-Raw`. El adaptador incorpora la identidad de Erika, un personaje femenino adulto de ficción original del autor, y se activa incluyendo el token `Erika-v1` en el prompt.

El objetivo es generar retratos y escenas con una identidad de personaje consistente sin necesidad de reentrenar ni ajustar el modelo base. El autor indica que lo ha verificado con Krea 2 y Krea 2 Turbo, y que el entrenamiento se realizó con AI Toolkit 0.13.30 durante 2.000 pasos, con metadatos que apuntan a la época 79. No se incluye el dataset de entrenamiento ni se han publicado ajustes numéricos de fuerza, prompt o semilla probados de forma independiente.

Su relevancia práctica es la de un adaptador ligero y gratuito para flujos de trabajo en ComfyUI, pero con dos caveats importantes: no cuenta con descargas ni validación pública en el momento de la ficha (0 descargas, 0 likes) y está sujeto a la Krea 2 Community License, además de permisos adicionales del creador que restringen la venta de imágenes generadas y el uso en otros servicios de generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer de difusión text-to-image (modelo base Krea 2); arquitectura detallada del base no disponible |
| Parámetros totales | No disponible (el archivo contiene 512 tensores fp16; el autor no declara el número de parámetros) |
| Longitud de contexto | No aplica a un modelo de imagen; resolución nativa del modelo base no disponible |
| Tipos de cuantización | fp16 (512 tensores); no se distribuyen variantes cuantizadas del adaptador |
| Idiomas soportados | Inglés (etiqueta `en` del repositorio); comportamiento con prompts en otros idiomas no verificado |
| Licencia | Krea 2 Community License (`krea-2-community-license`), con permisos adicionales del creador |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un adaptador de bajo rango (LoRA) acoplado a un modelo base de difusión text-to-image. El archivo contiene 512 tensores en precisión fp16 y un total de 114.324.760 bytes. Los metadatos del adaptador identifican el base Krea 2, el entrenamiento con AI Toolkit 0.13.30, 2.000 pasos y la época 79. El autor conserva el nombre de archivo original, `krea2_erika-v1_cd93955d9edb.safetensors`, y publica el SHA256 (`1a9bd81c39b531dbecaf0a6a5bb22acb7046ff7eefcf2f6f8b13c66b746e5d0d`) para verificación de integridad.

No se especifican la composición del dataset, el número de imágenes de entrenamiento, el rango del adaptador ni si hubo etapas de refinamiento. El autor indica explícitamente que no se incluye ningún dataset y que no ha probado de forma independiente ajustes numéricos para esta versión. La integración prevista es mediante un cargador LoRA compatible, por ejemplo la nodo `Load LoRA (Model Only)` de ComfyUI insertado entre el cargador del modelo base y el sampler.

## Capacidades

- Generación de imágenes text-to-image con identidad de personaje consistente mediante el token `Erika-v1`.
- Retratos y escenas de una mujer adulta ficticia, con variación de vestuario, iluminación y encuadre según el prompt.
- Compatibilidad declarada con Krea 2 y Krea 2 Turbo como modelos base.
- Funciona como adaptador independiente: no requiere fusionar pesos ni reentrenar el modelo base.
- Integración en flujos de ComfyUI mediante cargadores LoRA estándar.
- Ajuste de fuerza del LoRA, prompt y semilla para controlar la fidelidad del personaje.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modos de pensamiento: es un adaptador exclusivamente generativo de imagen.

## Casos de uso

- Retratos de personaje para ficción narrativa: usar `Erika-v1` junto con descripciones de vestuario y luz para mantener la misma identidad visual en una serie de ilustraciones o portadas de capítulos.
- Storyboard y cómic: generar viñetas consecutivas del mismo personaje en distintas poses y escenarios, apoyándose en la semilla y en el peso del LoRA para conservar rasgos faciales.
- Prototipado de personajes para videojuegos o animación: producir hojas de referencia y variaciones de vestuario antes de encargar el modelado 3D o el diseño final.
- Pruebas de integración en pipelines de ComfyUI: validar que el nodo de carga LoRA, el orden de conexión y el token de activación funcionan correctamente antes de desplegar un flujo de generación por lotes.
- Iteración rápida con Krea 2 Turbo: al estar verificado con la variante Turbo, permite explorar prompts y composiciones con menos pasos de muestreo antes de lanzar una generación final con el modelo base completo.
- Contenido editorial de ficción: ilustrar relatos o artículos sobre un personaje ficticio adulto, siempre que se respeten las restricciones de la licencia y la política de uso aceptable.
- Catálogo interno de personajes: mantener una biblioteca de referencias visuales coherentes para equipos de diseño, con control de versión del adaptador y del checksum del archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El adaptador añade aproximadamente 0,1 GB al peso del modelo base; el requisito dominante es el de Krea 2, cuyas especificaciones no se incluyen en la información proporcionada.
- GPU recomendadas: no disponibles para el modelo base. El adaptador no impone por sí mismo un requisito adicional relevante frente al base.
- GPU de consumo: no se puede confirmar si el conjunto cabe en tarjetas consumer, ya que depende enteramente de Krea 2 y de la resolución de generación.
- Despliegue: ComfyUI con el nodo `Load LoRA (Model Only)` entre el cargador del base y el sampler; AI Toolkit 0.13.30 se indica como herramienta de entrenamiento. No se documentan integraciones verificadas con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles. Dependen del modelo base, del número de pasos, del sampler y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea-2-Erika-v1 | No disponible (adaptador de 114 MB, 512 tensores fp16) | No aplica | Sin benchmarks publicados | Krea 2 Community License + permisos del creador | Hugging Face, GitHub y Civitai; 0 descargas |
| Krea 2 Raw (`krea/Krea-2-Raw`) | No disponible | No disponible | No disponible en esta información | Krea 2 Community License | Modelo base en Hugging Face |
| Krea-2-Annabel-v1 (TigerFan69) | No disponible | No aplica | Sin benchmarks publicados | No disponible en esta información | Hugging Face |
| Otros LoRA de personaje para Krea 2 | No disponible | No aplica | Sin datos comparables | Variables | No disponible |

No se dispone de datos de rendimiento ni de evaluaciones cuantitativas que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar y aceptar por separado los términos de un modelo base Krea 2 compatible.
- No se incluye el dataset de entrenamiento, lo que impide auditar la composición de los datos y reproducir el entrenamiento.
- El autor no ha probado de forma independiente valores numéricos de fuerza del LoRA, prompt o semilla; los resultados varían con el base, el flujo de trabajo y la configuración.
- No hay benchmarks ni validación pública: el repositorio registra 0 descargas y 0 likes en el momento de la ficha.
- Riesgo de deriva de identidad entre generaciones si se cambia la semilla, el peso del LoRA o el modelo base.
- Idioma: la etiqueta del repositorio es `en`; no se ha verificado el comportamiento con prompts en castellano u otros idiomas.
- Licencia restrictiva: la Krea 2 Community License incluye requisitos de elegibilidad, distribución y filtrado de contenido, además de una política de uso aceptable. La descarga gratuita no exime de esas obligaciones.
- Permisos adicionales del creador en la versión de Civitai: exigen atribución y prohíben compartir fusiones (merges), vender las imágenes generadas, usar el adaptador en otros servicios de generación, vender el adaptador y vender fusiones. El uso en el servicio de generación de Civitai sí está permitido.
- Es un derivado independiente de TigerFan69, no una versión oficial ni respaldada por Krea.
- El personaje es una mujer adulta ficticia; no representa a una persona real. Deben respetarse la legislación aplicable y las políticas de contenido de la plataforma de despliegue.
- El nombre «Erika» coincide con otros LoRA de personaje no relacionados publicados en la misma categoría; conviene verificar el repositorio y el checksum antes de integrar el archivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TigerFan69/Krea-2-Erika-v1
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Licencia (PDF): https://huggingface.co/TigerFan69/Krea-2-Erika-v1/blob/main/LICENSE.pdf
- Release en GitHub: https://github.com/TigerFan69/krea-character-loras/releases/tag/erika-v1
- Catálogo de personajes: https://github.com/TigerFan69/krea-character-loras
- Carpeta Erika en GitHub: https://github.com/TigerFan69/krea-character-loras/tree/main/Erika
- Publicación en Civitai: https://civitai.red/models/3017341/krea-2-erika-fictional-character-lora
- Perfil del autor en Hugging Face: https://huggingface.co/TigerFan69
- Apoyo opcional al autor: https://ko-fi.com/tigerfan69/tiers
