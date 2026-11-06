# TigerFan69/Krea-2-Kelly-v1

## Resumen

Krea-2-Kelly-v1 es un adaptador LoRA de tipo personaje desarrollado por TigerFan69 sobre el modelo base Krea-2-Raw de Krea. No se trata de un modelo fundacional, sino de un ajuste fino ligero (114,3 MB en fp16, 512 tensores) que inyecta la identidad de un personaje ficticio original llamado Kelly en flujos de generación texto-a-imagen compatibles con la familia Krea 2. El adaptador está pensado para retratos y escenas de personaje, y se distribuye con instrucciones neutras, sin imágenes de entrenamiento ni previsualizaciones generadas.

El paquete se sincroniza desde Civitai (versión v1.0, ID 3430926) y mantiene la integridad del archivo original mediante un SHA-256 verificado. Su relevancia es acotada pero clara: permite a artistas y desarrolladores incorporar un personaje consistente en pipelines de ComfyUI sin reentrenar el modelo base ni depender de prompts largos de descripción. Al ser un adaptador, hereda las capacidades y limitaciones del modelo subyacente Krea-2-Raw, incluyendo su licencia comunitaria.

La ficha describe únicamente lo que consta en la model card y los metadatos de Hugging Face. No se han publicado benchmarks, muestras generadas ni rangos de fuerza probados, por lo que muchos parámetros técnicos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión Krea-2-Raw; no se especifica la arquitectura interna del base |
| Parámetros totales | No disponible (512 tensores, 114.324.752 bytes en fp16) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen; no se especifica longitud de prompt) |
| Tipos de cuantización | Pesos distribuidos en fp16; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Krea 2 Community License (license: other) |
| Formato de pesos | safetensors (`krea2_kellyv1_ae38fc3c9d48.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango bajo aplicado sobre Krea-2-Raw. Los metadatos de safetensors identifican el entrenamiento con 2.000 pasos y época 133, y el etiquetado de Civitai lo asocia al modelo base Krea 2 Turbo. El archivo contiene 512 tensores en fp16 con un total de 114.324.752 bytes, y su SHA-256 (`6ee3362105a04eb41b8184fb9d1133158ce04790c63d7eddf211f06632c52344`) coincide con el publicado en Civitai antes del empaquetado, según el autor.

No se documenta la composición del dataset de entrenamiento, el número de imágenes, el método de captions ni si hubo regularización. Tampoco se especifica el rango del LoRA, el alpha, la tasa de aprendizaje ni la configuración del optimizador. La model card indica explícitamente que no se realizó una generación nueva ni un benchmark de calidad para esta sincronización, y que no se reclama un rango de fuerza universalmente probado.

## Capacidades

- Generación de imágenes de personaje: inyecta la identidad de Kelly en retratos y escenas mediante el trigger `KellyV1`.
- Compatibilidad con flujos Krea 2: pensado para loaders de LoRA de Krea 2 en ComfyUI; el autor advierte de no sustituirlo por un flujo de FLUX.1.
- Control de fuerza ajustable: permite comparar intensidades del adaptador con prompts y semillas fijas, aunque no se publica un rango recomendado.
- Integración con modelo base y componentes externos: requiere obtener por separado el modelo base Krea-2-Raw y su text encoder y VAE bajo sus propios términos.
- Idioma: prompts en inglés.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento, por tratarse de un adaptador de imagen.

## Casos de uso

- Retratos de personaje consistentes: usar `KellyV1` junto con prompts descriptivos y semillas fijas para mantener la identidad del personaje en una serie de retratos, aprovechando que el LoRA reduce la variabilidad facial entre generaciones.
- Ilustración narrativa y cómic: generar viñetas y escenas con el mismo personaje en distintos entornos, ajustando la fuerza del adaptador para equilibrar identidad y composición.
- Prototipado de personajes para videojuegos o animación: producir hojas de referencia y variaciones de vestuario o expresión antes de encargar arte final.
- Pruebas de concepto en ComfyUI: integrar el LoRA en un flujo Krea 2 existente para evaluar identidad, anatomía, fondos y artefactos a distintas intensidades.
- Contenido para redes o ficción amateur: generar ilustraciones de un personaje original propio con atribución al creador, respetando la licencia comunitaria.
- Comparación de adaptadores: usar el mismo prompt y semilla con distintos LoRAs de personaje para evaluar consistencia y fidelidad, dado que el paquete incluye instrucciones neutras y pesos sin alterar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se realizó una generación nueva ni un benchmark de calidad para esta sincronización, y no se proporcionan métricas FID, CLIP score ni evaluaciones de identidad.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende del modelo base Krea-2-Raw, su text encoder y VAE, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el adaptador en sí ocupa unos 114 MB, pero la inferencia requiere cargar el modelo base completo.
- Opciones de despliegue: ComfyUI con un loader de LoRA compatible con Krea 2; el autor advierte de no usar flujos de FLUX.1. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea-2-Kelly-v1 | LoRA de personaje sobre Krea-2-Raw | 512 tensores, 114 MB fp16 | No aplica | Krea 2 Community License | Hugging Face y Civitai |
| Krea-2-Raw | Modelo base texto-a-imagen | No disponible | No disponible | Krea 2 Community License | Hugging Face (krea/Krea-2-Raw) |
| Otros LoRAs de personaje para Krea 2 | Adaptadores de personaje | No disponible | No aplica | Sujeta a licencia del base y del creador | Civitai y Hugging Face |

No se dispone de datos de rendimiento comparativo ni de otros adaptadores concretos con especificaciones verificables en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere el modelo base Krea-2-Raw y sus componentes (text encoder y VAE) obtenidos por separado bajo sus propios términos.
- No se ha realizado una evaluación de calidad ni un benchmark para esta versión; el rendimiento real en identidad, anatomía y fondos no está verificado públicamente.
- No se documenta un rango de fuerza probado; el autor recomienda evaluar intensidades intermedias y revisar artefactos.
- Riesgo de alucinación visual y artefactos inherente a los modelos de difusión, no cuantificado en esta ficha.
- Idioma limitado a inglés en los prompts.
- Licencia Krea 2 Community License: la descarga gratuita no implica uso comercial sin restricciones ni permiso para vender modelos o fusiones; debe leerse LICENSE.pdf, NOTICE.txt y CREATOR-TERMS.md antes de usar.
- La licencia MIT del software LoRA Studio no se aplica a estos pesos.
- Contenido de personaje ficticio adulto original; no se incluyen imágenes de entrenamiento ni previsualizaciones en el paquete.
- El autor advierte de no publicar fotos privadas, metadatos de flujos ni credenciales en informes de soporte.

## Enlaces

- Hugging Face: https://huggingface.co/TigerFan69/Krea-2-Kelly-v1
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Fuente en Civitai: https://civitai.red/models/3021580?modelVersionId=3430926
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- LoRA Studio (software): https://github.com/TigerFan69/lora-studio
- Perfil del autor en Civitai: https://civitai.red/user/TigerFan69
- Apoyo al autor: https://ko-fi.com/tigerfan69/tiers
