# Uiopqwe/Moss-image-nsfw-uncensored-lora

## Resumen

Uiopqwe/Moss-image-nsfw-uncensored-lora es un adaptador LoRA para generación de imágenes texto-a-imagen, publicado por el usuario Uiopqwe y diseñado para especializar el modelo base OpenMOSS-Team/MOSS-Image-SFT hacia contenido adulto/NSFW explícito. El repositorio se presenta con la librería diffusers, pesos en safetensors y licencia apache-2.0. Según los metadatos consultados, fue creado y actualizado el 25 de octubre de 2026, con 0 descargas y 0 likes.

El adaptador no documenta parámetros totales, arquitectura interna del modelo base, longitud de contexto ni datos de entrenamiento. Su mecanismo de activación declarado es el token de instancia `moss_xvstyle`, que se antepone al prompt para inducir el estilo y el contenido aprendidos. La model card incluye ejemplos explícitos de contenido adulto; en esta ficha no se reproducen esos prompts y se resumen únicamente las capacidades y los riesgos técnicos.

Su relevancia es limitada y muy específica: permite reutilizar un modelo base de imagen sin reentrenarlo, mediante un adaptador LoRA, para flujos de trabajo de contenido adulto legal o para investigación sobre adaptadores y moderación. No hay benchmarks, evaluaciones de seguridad ni evidencia pública de calidad en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; adaptador LoRA sobre OpenMOSS-Team/MOSS-Image-SFT |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible; no se documenta como MoE |
| Longitud de contexto | no disponible; no se documenta una ventana de contexto textual |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible; los ejemplos de la model card están en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; librería diffusers |
| Pipeline | text-to-image |
| Modelo base | OpenMOSS-Team/MOSS-Image-SFT |
| Relación con el modelo base | adapter |
| Prompt de instancia | `moss_xvstyle` |
| Tamaño del repositorio | 27.6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible identifica un adaptador LoRA para diffusers sobre el modelo OpenMOSS-Team/MOSS-Image-SFT. No se especifica si el modelo base utiliza una arquitectura de difusión basada en U-Net, transformer de difusión, DiT u otra variante. Tampoco se documentan el rango del LoRA, el valor de alpha, la resolución nativa, el scheduler, el número de pasos de entrenamiento ni los hiperparámetros utilizados.

No hay datos sobre el conjunto de entrenamiento: número de imágenes, composición, resolución, filtrado, licencias de las imágenes, uso de RLHF, DPO u otros métodos de alineación. La única innovación documentada es el uso del token `moss_xvstyle` como activador del adaptador. El repositorio está etiquetado como NSFW, adult-content y not-for-all-audiences, y la model card incluye ejemplos explícitos de contenido adulto.

## Capacidades

- Generación de imágenes texto-a-imagen mediante el pipeline diffusers, usando como base OpenMOSS-Team/MOSS-Image-SFT.
- Activación de un estilo o contenido específico mediante el prompt de instancia `moss_xvstyle`.
- Capacidad declarada para generar contenido adulto/NSFW explícito, según las etiquetas y los ejemplos de la model card.
- No se documenta soporte de tool calling ni function calling; no es una capacidad aplicable al pipeline text-to-image descrito.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües; los ejemplos disponibles están en inglés.
- No se documenta entrada de visión, audio, vídeo ni modo de razonamiento explícito.
- No se documentan filtros de seguridad, moderación automática ni controles de edad en el repositorio.

## Casos de uso

- Producción de contenido adulto legal y con consentimiento: el adaptador puede emplearse en estudios o creadores de contenido para generar variaciones de estilo sobre adultos verificados, siempre con revisión legal y control de edad.
- Prototipado de pipelines diffusers: permite probar la carga de un LoRA, el uso del token de instancia y el escalado del adaptador dentro de una aplicación texto-a-imagen basada en diffusers.
- Investigación sobre adaptadores LoRA: sirve para estudiar cómo un token de instancia y un adaptador de bajo rango modifican el comportamiento de un modelo base de imagen, aunque no hay métricas publicadas.
- Evaluación de filtros de moderación: puede usarse en un entorno aislado para generar muestras NSFW y comprobar la eficacia de clasificadores o filtros de seguridad, sin distribución pública del contenido.
- Generación de datasets sintéticos para investigación de sesgos: permite estudiar representación, sesgos de género, cuerpo o etnia en modelos de imagen adulta, con supervisión ética y legal.
- Pruebas de despliegue e infraestructura: el repositorio de 27.6 GB y el formato safetensors permiten validar almacenamiento, descarga, carga en memoria y serving de adaptadores en pipelines diffusers.
- Documentación y formación sobre riesgos: puede utilizarse como caso de estudio interno para explicar los riesgos de los modelos NSFW, la necesidad de verificación de edad y los límites de la licencia apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base MOSS-Image-SFT, de la precisión y de la implementación. El tamaño del repositorio, 27.6 GB, no equivale directamente a la VRAM necesaria.
- GPU recomendadas: no disponible; no se documentan requisitos del modelo base ni del adaptador.
- ¿Cabe en GPU de consumo? no disponible; no se confirma que pueda ejecutarse en RTX 4090, RTX 3090 u otras GPU de consumo.
- Opciones de despliegue: diffusers para el pipeline text-to-image. vLLM, llama.cpp, Ollama y TGI no aplican al pipeline de imagen documentado.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio ocupa 27.6 GB, por lo que requiere espacio de disco y ancho de banda considerables para descarga y caché.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Uiopqwe/Moss-image-nsfw-uncensored-lora | adaptador LoRA text-to-image | no disponible | no disponible | apache-2.0 | safetensors / diffusers | 0 descargas, 0 likes |
| OpenMOSS-Team/MOSS-Image-SFT | modelo base text-to-image | no disponible | no disponible | no disponible | no disponible | referenciado como base |
| Alternativas NSFW LoRA comparables | no identificadas en la información disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, calidad o seguridad para establecer una comparación cuantitativa con otros adaptadores NSFW.

## Limitaciones y advertencias

- Contenido adulto/NSFW explícito: no es apto para menores, entornos no controlados ni plataformas que prohíban contenido sexual explícito.
- Requiere verificación de edad, consentimiento explícito y cumplimiento legal en la jurisdicción de uso; la licencia apache-2.0 no sustituye esas obligaciones.
- Riesgo de uso indebido para deepfakes, difamación o representaciones no consentidas de personas reales; no debe emplearse con imágenes o identidades de terceros sin autorización.
- Posibles artefactos anatómicos, incoherencias de composición, problemas en manos, caras o perspectivas; no hay evaluaciones de calidad publicadas.
- Sin benchmarks, sin métricas de seguridad y sin evaluaciones de sesgo; 0 descargas y 0 likes en los metadatos consultados.
- Idiomas no documentados; los ejemplos están en inglés y no hay datos sobre rendimiento con prompts en castellano.
- No se documentan filtros de seguridad; el modelo puede generar contenido no deseado o ilegal si se usa sin moderación.
- El repositorio ocupa 27.6 GB; no es adecuado para despliegues ligeros o entornos con almacenamiento limitado.
- La licencia del adaptador es apache-2.0, pero no se detallan los términos del modelo base OpenMOSS-Team/MOSS-Image-SFT; deben revisarse antes de uso comercial.
- No debe utilizarse para material de abuso sexual infantil, contenido no consentido o cualquier uso prohibido por la ley.

## Enlaces

- https://huggingface.co/Uiopqwe/Moss-image-nsfw-uncensored-lora
- https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
