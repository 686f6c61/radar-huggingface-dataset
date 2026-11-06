# TigerFan69/Krea-2-Amber-v1

## Resumen

Krea 2 Amber v1.0 es un adaptador LoRA de personaje para el modelo base de generación de imágenes Krea 2 Raw, desarrollado por el creador independiente TigerFan69 y publicado en Hugging Face y Civitai. No es un modelo fundacional ni un checkpoint completo: se trata de un conjunto de pesos de 228.587.264 bytes (unos 0,2 GB en fp16, 512 tensores) que se aplica sobre Krea 2 para reproducir un personaje ficticio adulto original llamado Amber. El paquete contiene únicamente los pesos del adaptador y una guía de uso neutral; no incluye imágenes de entrenamiento ni previsualizaciones generadas.

El adaptador se entrenó durante 1.500 pasos hasta la época 49 según los metadatos del archivo safetensors, y se activa mediante el token de disparo `Amber-NotaRealPerson`. Su relevancia es limitada y muy específica: sirve para quien ya trabaja con el ecosistema Krea 2 (por ejemplo, en ComfyUI) y necesita consistencia de identidad en retratos y escenas de un personaje concreto. No aporta mejoras generales de calidad ni nuevas capacidades al modelo base.

La información pública disponible es escasa: cero descargas y cero likes en el momento de la consulta, sin benchmarks, sin ejemplos generados y sin rango de fuerza (strength) probado. La ficha se limita, por tanto, a lo que el autor documenta en la model card y a las especificaciones deducibles del propio archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Krea 2 Raw; no se especifica la arquitectura interna del base |
| Parametros totales | no disponible (el adaptador consta de 512 tensores y 228.587.264 bytes en fp16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; no se documenta longitud de prompt maxima) |
| Tipos de cuantizacion | no disponible; los pesos del adaptador se distribuyen en fp16 |
| Idiomas soportados | en (ingles) |
| Licencia | krea-2-community-license (license_name: krea-2-community-license; license_link: https://krea.ai/krea-2-licensing) |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El adaptador es un LoRA pensado para inyectarse en las capas del modelo base Krea 2 Raw. Los metadatos del safetensors identifican el modelo base como Krea 2, con 1.500 pasos de entrenamiento y época 49, y el archivo contiene 512 tensores en fp16 con un total de 228.587.264 bytes. El SHA-256 declarado es `c9c8d62a0e7527eee97e959b941f901b6356f7e7242b4432e2714babacccf5a7`, y el autor afirma que los bytes originales coincidían con el hash publicado en Civitai antes del empaquetado, sin alteración de pesos. El nombre original del archivo era `krea2_amber-notarealperson_d7e114821e1e.safetensors`.

No se documenta la composición del dataset de entrenamiento, el número de imágenes, la resolución, el método de captions ni si se aplicaron técnicas de regularización. Tampoco se especifica si el entrenamiento usó algún tipo de fine-tuning adicional sobre el base (por ejemplo, DreamBooth o textual inversion combinados). El autor indica explícitamente que no se realizó una generación nueva ni un benchmark de calidad para esta sincronización, por lo que no hay evidencia publicada sobre la fidelidad del personaje ni sobre la aparición de artefactos.

## Capacidades

- Generación de retratos y escenas del personaje ficticio Amber sobre el modelo base Krea 2, mediante el token de disparo `Amber-NotaRealPerson`.
- Consistencia de identidad del personaje a través de prompts y semillas, en la medida en que el LoRA esté correctamente aplicado y con la fuerza adecuada.
- Compatibilidad con flujos de trabajo de Krea 2 en ComfyUI a través de un cargador de LoRA compatible con Krea 2; el autor advierte explícitamente de no sustituirlo por un flujo de FLUX.1.
- Control de intensidad del adaptador mediante el parámetro de fuerza del LoRA, aunque no se declara un rango universal probado.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni modo thinking: es un adaptador de imagen, no un modelo de lenguaje.
- No tiene capacidades de visión, audio ni multilingües más allá del inglés en los prompts.

## Casos de uso

- Ilustración de personaje consistente para cómic o novela gráfica: el LoRA permite mantener los rasgos de Amber entre viñetas usando el mismo token y variando solo la escena y la pose en el prompt, siempre que se fije una fuerza y una semilla de referencia.
- Creación de avatares y retratos para proyectos narrativos o de rol: el adaptador reproduce la identidad del personaje en primeros planos y planos medios, adecuado para fichas de personaje o material promocional de ficción.
- Prototipado de escenas en ComfyUI: integrado en un flujo Krea 2 existente, permite iterar sobre fondos, iluminación y encuadre sin reentrenar, comparando fuerzas del LoRA con prompts y semillas fijos.
- Generación de material para comunidades de creación de personajes: el autor distribuye el adaptador de forma gratuita y mantiene presencia en Civitai y Hugging Face, por lo que encaja en flujos de publicación de fan art o personajes originales con la atribución correspondiente.
- Pruebas de control de identidad en pipelines de imagen: útil como caso de estudio para evaluar cómo un LoRA de 1.500 pasos y 512 tensores afecta a la coherencia facial frente al modelo base, midiendo deriva de identidad entre generaciones.
- Integración en herramientas de autoría con LoRA Studio: el autor mantiene un software separado (LoRA Studio) para gestionar adaptadores; este LoRA puede servir como entrada de prueba en ese entorno, teniendo en cuenta que el software y los pesos se licencian por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se realizó una generación nueva ni un benchmark de calidad para esta sincronización, y no se aportan métricas de fidelidad de personaje, FID, CLIP score ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

- VRAM estimada para el adaptador: despreciable por sí solo (0,2 GB en fp16); el requisito real lo impone el modelo base Krea 2 Raw, cuyos requisitos no se detallan en la información disponible.
- GPU recomendadas: no disponible para el modelo base; para el adaptador, cualquier GPU que ya ejecute Krea 2 en ComfyUI es suficiente, ya que solo añade una fracción de memoria.
- ¿Cabe en GPU de consumo? El adaptador sí; el modelo base depende de su tamaño y cuantización, dato no disponible en esta ficha.
- Opciones de despliegue: ComfyUI con un cargador de LoRA compatible con Krea 2 (indicado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para Krea 2 en la documentación proporcionada. La comparación con LoRA de otros ecosistemas (por ejemplo, para FLUX.1 o SDXL) no sería homogénea, ya que el adaptador solo es funcional sobre Krea 2 Raw y el autor advierte de no usar flujos de FLUX.1.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Amber v1.0 | LoRA de personaje sobre Krea 2 Raw | 512 tensores, 228.587.264 bytes (fp16) | no aplica | krea-2-community-license | Hugging Face y Civitai |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un adaptador, no un modelo base: requiere obtener Krea 2 Raw y su text encoder/VAE por separado y bajo sus propios términos.
- No se ha publicado ningún benchmark ni generación de validación; la fidelidad del personaje y la calidad de los resultados no están verificadas de forma independiente.
- No se declara un rango de fuerza probado; el autor recomienda evaluar fuerzas intermedias y vigilar identidad, anatomía, fondos y artefactos.
- Riesgo de alucinación visual y artefactos propio de los modelos de difusión, agravado por la falta de validación documentada.
- El token de disparo es `Amber-NotaRealPerson`; usar otros tokens o flujos de FLUX.1 puede degradar o anular el efecto del adaptador.
- Licencia restrictiva: la descarga gratuita no implica uso comercial sin restricciones ni permiso para vender modelos o fusiones; hay que leer LICENSE.pdf, NOTICE.txt y CREATOR-TERMS.md incluidos. La licencia MIT del software LoRA Studio no se aplica a estos pesos.
- Idioma limitado al inglés en los prompts.
- El personaje es ficticio y adulto; el autor declara que no se incluyen imágenes de entrenamiento ni previsualizaciones en el paquete.
- Repositorio con cero descargas y cero likes en el momento de la consulta: sin comunidad ni soporte más allá del autor en Ko-fi y las discusiones del modelo fuente.

## Enlaces

- Hugging Face: https://huggingface.co/TigerFan69/Krea-2-Amber-v1
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Fuente en Civitai: https://civitai.red/models/3034373?modelVersionId=3447703
- Perfil del autor en Civitai: https://civitai.red/user/TigerFan69
- Perfil del autor en Hugging Face: https://huggingface.co/TigerFan69
- Software LoRA Studio: https://github.com/TigerFan69/lora-studio
- Soporte del autor (Ko-fi): https://ko-fi.com/tigerfan69/tiers
