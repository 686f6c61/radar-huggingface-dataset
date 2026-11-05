# TigerFan69/Krea-2-Amanda-v1

## Resumen

Krea 2 Amanda v1.0 es un adaptador LoRA de personaje para el modelo base de generación de imágenes Krea 2, desarrollado por TigerFan69. No se trata de un modelo fundacional, sino de un conjunto de pesos (228.587.264 bytes en fp16, 512 tensores) que modifica el comportamiento del modelo base Krea-2-Raw para reproducir el rostro y la apariencia de Amanda, un personaje ficticio adulto original creado por el autor. El adaptador se distribuye como un único archivo safetensors pensado para cargarse en ComfyUI mediante un nodo compatible con Krea 2.

El interés de esta ficha es limitado desde el punto de vista de la investigación en IA: se trata de un artefacto de personalización visual, no de un modelo de lenguaje ni de un sistema con capacidades de razonamiento. Su relevancia práctica se circunscribe a flujos de trabajo de generación de imágenes con identidad consistente de personaje, un caso de uso habitual en ilustración, cómic y preproducción audiovisual. La información técnica disponible es escasa y proviene casi exclusivamente de la model card del autor.

El adaptador se entrenó durante 1.500 pasos hasta la época 49, según los metadatos del propio archivo safetensors, y se etiqueta en Civitai como compatible con Krea 2 Turbo, aunque el campo `base_model` del repositorio apunta a krea/Krea-2-Raw. Esta discrepancia entre la etiqueta de Civitai y el modelo base declarado en HuggingFace conviene tenerla en cuenta al integrarlo en un pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Krea 2; no es un modelo autonomo |
| Parametros totales | no disponible (el archivo pesa 228.587.264 bytes en fp16, 512 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | fp16 en el adaptador; el modelo base admite las cuantizaciones que soporte Krea 2 |
| Idiomas soportados | en (ingles) |
| Licencia | krea-2-community-license (licencia de comunidad de Krea 2; ver enlace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango que se aplica sobre el modelo de difusion Krea 2. Segun los metadatos del archivo, el entrenamiento se realizo durante 1.500 pasos, alcanzando la epoca 49, y el resultado son 512 tensores en precision fp16. No se especifica el rango del LoRA, la tasa de aprendizaje, el tamano del dataset de imagenes ni la composicion del mismo; la model card indica explicitamente que no se incluyen imagenes de entrenamiento ni previsualizaciones generadas en el paquete.

No se documenta ningun tipo de ajuste por RLHF, DPO ni tecnicas de alineacion, algo esperable en un adaptador de personaje para difusion. Tampoco se describe ninguna innovacion tecnica destacable mas alla del propio entrenamiento del LoRA. El autor indica que no se realizo una evaluacion fresca de generacion ni un benchmark de calidad para esta sincronizacion, por lo que no hay datos objetivos sobre fidelidad de identidad, anatomia o artefactos.

## Capacidades

- Generacion de retratos y escenas del personaje Amanda sobre el modelo base Krea 2, mediante la etiqueta de activacion `Amanda-notarealperson`.
- Personalizacion de identidad consistente de personaje ficticio en flujos text-to-image.
- Integracion en ComfyUI a traves de un cargador de LoRA compatible con Krea 2 (no compatible con flujos de FLUX.1).
- Control de intensidad del adaptador mediante el peso del LoRA en el nodo de carga, aunque el autor no declara un rango de fuerza probado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; es un adaptador puramente visual y solo etiquetado para ingles.
- No dispone de modo thinking, vision, audio ni ninguna capacidad cognitiva.

## Casos de uso

- Ilustracion de personaje consistente: usar el LoRA con prompts fijos y semillas controladas para mantener el rostro de Amanda a lo largo de una serie de ilustraciones, comparando fuerzas del adaptador para preservar identidad sin sacrificar variedad de pose.
- Preproduccion de comic o novela grafica: generar paneles borrador con el personaje en distintas escenas y angulos antes de pasar a ilustracion final, aprovechando la reproducibilidad de semillas en ComfyUI.
- Creacion de hojas de personaje: producir variaciones de expresion y vestuario del personaje para documentar su diseno, evaluando cada fuerza del LoRA para detectar artefactos en anatomia y fondos.
- Prototipado de arte conceptual para videojuegos: iterar rapidamente sobre apariencia del personaje en un pipeline text-to-image con Krea 2, manteniendo coherencia visual entre iteraciones.
- Pruebas de pipelines de difusion: emplear el adaptador como caso de prueba para validar la carga de LoRA en ComfyUI y la compatibilidad con el modelo base Krea 2 en entornos de desarrollo.
- Generacion de material promocional ficticio: crear imagenes de marca o narrativa alrededor del personaje, siempre respetando la licencia de comunidad de Krea 2 y las restricciones del autor sobre uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se realizo una evaluacion fresca de generacion ni un benchmark de calidad para esta sincronizacion, y no se proporcionan metricas de fidelidad de identidad, FID, CLIP score ni comparaciones cuantitativas con otros LoRA de personaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para el adaptador; depende enteramente del modelo base Krea 2 y de su cuantizacion. El adaptador en si ocupa unos 0,2 GB en disco.
- GPU recomendadas: no disponible en la informacion proporcionada; vendran determinadas por los requisitos del modelo base Krea 2.
- Compatibilidad con GPU de consumo: no confirmada para el adaptador; depende del modelo base.
- Opciones de despliegue: ComfyUI con un cargador de LoRA compatible con Krea 2. El autor advierte explicitamente de no sustituirlo por un flujo de FLUX.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Amanda v1.0 (TigerFan69) | LoRA de personaje sobre Krea 2 | no disponible (228,6 MB fp16) | no aplica | krea-2-community-license | HuggingFace y Civitai |
| Krea-2-Raw (krea) | Modelo base de difusion text-to-image | no disponible | no aplica | licencia Krea 2 | HuggingFace |
| LoRA de personaje genericos para FLUX.1 | LoRA de personaje | variable | no aplica | variable segun autor | Civitai, HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar por separado el modelo base Krea 2 y su text encoder/VAE bajo sus propios terminos.
- Solo se etiqueta para ingles; no hay soporte multilingue declarado.
- No se ha realizado evaluacion de calidad ni benchmark para esta version, por lo que la fidelidad de identidad y la presencia de artefactos no estan verificadas de forma objetiva.
- El autor no declara un rango de fuerza del LoRA probado; es necesario evaluar empíricamente cada valor.
- La licencia krea-2-community-license restringe el uso: la descarga gratuita no implica uso comercial sin restricciones ni permiso para vender modelos o fusiones. La licencia MIT del software LoRA Studio no se aplica a estos pesos.
- Discrepancia entre la etiqueta de modelo base en Civitai (Krea 2 Turbo) y el campo `base_model` del repositorio (krea/Krea-2-Raw); conviene verificar la compatibilidad antes de integrarlo.
- Riesgo de sesgos y alucinacion visual: al ser un LoRA de personaje, puede reproducir sesgos esteticos del dataset de entrenamiento, no documentado.
- No debe usarse en flujos de FLUX.1; el autor lo advierte explicitamente.
- El paquete no incluye imagenes de entrenamiento ni previsualizaciones, lo que dificulta la evaluacion previa a la descarga.

## Enlaces

- HuggingFace: https://huggingface.co/TigerFan69/Krea-2-Amanda-v1
- Modelo base en HuggingFace: https://huggingface.co/krea/Krea-2-Raw
- Fuente en Civitai: https://civitai.red/models/3036699?modelVersionId=3450733
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Perfil del autor en Civitai: https://civitai.red/user/TigerFan69
- Perfil del autor en HuggingFace: https://huggingface.co/TigerFan69
- Apoyo al autor (Ko-fi): https://ko-fi.com/tigerfan69/tiers
- Software LoRA Studio: https://github.com/TigerFan69/lora-studio
