# TigerFan69/Krea-2-Madie-v1

## Resumen

Krea 2 Madie v1 es un adaptador LoRA de personaje para el modelo base de generación de imágenes Krea 2 Raw, desarrollado por TigerFan69. No se trata de un modelo fundacional, sino de un conjunto de pesos de bajo rango que se aplica sobre el modelo base para reproducir un personaje ficticio original llamado Madie en retratos y escenas. El adaptador está pensado para flujos de trabajo de generación texto-a-imagen compatibles con Krea 2, en particular ComfyUI.

El paquete contiene únicamente los pesos del adaptador (228.588.968 bytes, 512 tensores en bf16) y unas instrucciones neutrales; no incluye imágenes de entrenamiento ni previsualizaciones generadas. El entrenamiento se realizó durante 2.000 pasos, alcanzando la época 27, según los metadatos del archivo safetensors. El disparador de identidad del personaje es `MadieV1`.

Su relevancia es acotada: se dirige a usuarios que ya trabajan con el ecosistema Krea 2 y necesitan un personaje consistente para ilustración o narrativa visual. Al ser un LoRA, su utilidad depende por completo de la disponibilidad del modelo base y de sus componentes asociados (codificador de texto y VAE), que deben obtenerse por separado bajo sus propios términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea 2 Raw; arquitectura del base no disponible |
| Parametros totales | no disponible (adaptador de 228.588.968 bytes en bf16, 512 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen) |
| Tipos de cuantizacion | bf16 (pesos del adaptador); cuantizaciones del base no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | krea-2-community-license (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de personaje entrenado sobre Krea 2 Raw, según indican las etiquetas `base_model:krea/Krea-2-Raw` y `base_model_relation: adapter`. Los metadatos del archivo safetensors confirman que corresponde a Krea 2, con 2.000 pasos de entrenamiento y época 27. El paquete contiene 512 tensores en bf16. No se dispone de información sobre la composición del dataset de entrenamiento, el número de imágenes utilizadas, la resolución de entrenamiento ni si se aplicaron técnicas de regularización o aumento de datos.

No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras). El adaptador debe cargarse en un flujo de trabajo compatible con Krea 2 y no es sustituible por un flujo de FLUX.1, según advierte el autor. El SHA-256 del archivo es `28bc5ee6d1e042f80cff95396cb53006a4cdbf391f55c71de87c30b72fa0a10c`, y los bytes originales coincidían con el hash publicado en Civitai antes del empaquetado.

## Capacidades

- Generación de retratos y escenas del personaje ficticio Madie mediante el disparador `MadieV1` sobre el modelo base Krea 2.
- Control de identidad del personaje mediante la fuerza del LoRA, ajustable en el cargador correspondiente.
- Integración en flujos de trabajo de ComfyUI a través de un cargador de LoRA compatible con Krea 2.
- Generación texto-a-imagen en inglés (único idioma declarado).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un adaptador de imagen, no un modelo de lenguaje.
- No dispone de modo thinking, visión, audio ni capacidades multimodales propias más allá de las que aporte el modelo base.

## Casos de uso

- Ilustración de personaje consistente: el LoRA permite mantener los rasgos de Madie a lo largo de varias imágenes con el disparador `MadieV1`, útil para cómics, storyboards o narrativa visual serializada.
- Prototipado de personajes para videojuegos o animación: generar hojas de personaje y variaciones de pose o vestuario sobre el mismo modelo base para explorar direcciones artísticas antes de producir assets definitivos.
- Contenido editorial o narrativo: crear escenas ilustradas con un personaje recurrente para blogs, revistas digitales o ficción por entregas, siempre que la licencia comunitaria lo permita.
- Pruebas de identidad y anatomía en pipelines de generación: el autor recomienda evaluar fuerzas intermedias del LoRA con prompts y semillas fijas para detectar artefactos en identidad, anatomía y fondos antes de fijar una configuración de producción.
- Integración en flujos ComfyUI existentes: sustituir el cargador de LoRA por este adaptador en un workflow Krea 2 ya validado, sin cambiar el resto del grafo, para añadir el personaje a una tubería ya operativa.
- Exploración creativa con Ko-fi/Civitai: el autor distribuye el adaptador de forma gratuita y ofrece soporte opcional mediante membresía, lo que encaja en flujos de trabajo de creadores independientes que iteran sobre personajes propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se realizó una generación nueva ni una evaluación de calidad para esta sincronización, y que no se reclama un rango de fuerza universalmente probado.

## Requisitos de hardware

- El adaptador pesa 0,2 GB (228.588.968 bytes), por lo que su carga en memoria es marginal frente al modelo base.
- Los requisitos de VRAM dependen íntegramente del modelo base Krea 2 Raw y de su codificador de texto y VAE, cuyos requisitos no se detallan en la información disponible.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) para el modelo base.
- No se confirma si el conjunto base + adaptador cabe en GPU de consumo; depende del base, dato no disponible.
- Despliegue previsto: ComfyUI con un cargador de LoRA compatible con Krea 2. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de imagen de este tipo en el contexto descrito).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para Krea 2 en la documentación proporcionada. Como referencia estructural, se incluye una comparación genérica de categoría:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Madie v1 | LoRA de personaje sobre Krea 2 Raw | no disponible (adaptador de 0,2 GB) | no aplica | krea-2-community-license | Hugging Face y Civitai |
| Alternativas LoRA para Krea 2 | no disponible | no disponible | no aplica | no disponible | no disponible |
| Alternativas LoRA para otros bases (p. ej. FLUX.1) | no disponible | no disponible | no aplica | no disponible | no disponible |

No se han encontrado en la información proporcionada modelos comparables directos con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Es un adaptador, no un modelo base: requiere Krea 2 Raw y sus componentes (codificador de texto y VAE) obtenidos por separado bajo sus propios términos.
- No es compatible con flujos de trabajo de FLUX.1; el autor lo advierte explícitamente.
- El único idioma declarado es el inglés, lo que limita prompts en castellano u otros idiomas.
- No se ha realizado una evaluación de calidad ni una generación de referencia para esta versión, por lo que el rendimiento real del personaje no está verificado de forma independiente.
- Riesgo de artefactos en identidad, anatomía y fondos a fuerzas altas del LoRA; el autor recomienda probar fuerzas intermedias con prompts y semillas fijas.
- La licencia krea-2-community-license no equivale a uso comercial irrestricto: la descarga gratuita no concede permiso para vender modelos o merges. Debe revisarse LICENSE.pdf, NOTICE.txt y CREATOR-TERMS.md antes de cualquier uso.
- La licencia MIT del software LoRA Studio no se aplica a estos pesos.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir contenido no solicitado o incoherente; no se documentan sesgos específicos.
- El paquete no incluye imágenes de entrenamiento ni previsualizaciones, lo que dificulta la validación previa sin generar muestras propias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/TigerFan69/Krea-2-Madie-v1
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Fuente en Civitai: https://civitai.red/models/3025694?modelVersionId=3436281
- Perfil del autor en Civitai: https://civitai.red/user/TigerFan69
- Perfil del autor en Hugging Face: https://huggingface.co/TigerFan69
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Software LoRA Studio: https://github.com/TigerFan69/lora-studio
- Apoyo al autor (Ko-fi): https://ko-fi.com/tigerfan69/tiers
