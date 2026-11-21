# SulphurAI/Sulphur-3

## Resumen

Sulphur 3 es un modelo de generacion de video presentado como un ajuste fino (finetune) del modelo base MiniMaxAI/MiniMax-H3, desarrollado por SulphurAI. Se trata de una variante descensurada ("uncensored") del modelo original, orientada a la generacion de video sin las restricciones de contenido que suelen incorporar los modelos comerciales. El repositorio, de 276,5 GB, se distribuye en formato safetensors y utiliza la libreria `minimax-h3` para su ejecucion.

El modelo se apoya en MiniMax H3 como arquitectura subyacente; la model card no detalla la arquitectura interna, el numero de parametros ni la longitud de contexto, por lo que esos datos no estan disponibles en la informacion proporcionada. Lo relevante ahora es que Sulphur 3 incluye un "corrector" opcional que mejora la salida del modelo y funciona tambien con otros checkpoints H3, asi como variantes cuantizadas para entornos con VRAM limitada.

La relevancia del modelo reside en su caracter abierto (dentro de la licencia comunitaria de MiniMax H3) y en la posibilidad de ejecutarlo tanto en pipelines de ComfyUI como en flujos de inferencia convencionales de H3. Con 1.186 descargas y 598 likes en Hugging Face, es una alternativa popular para quien busca generacion de video sin filtrado de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de MiniMaxAI/MiniMax-H3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | variantes cuantizadas incluidas en `quantized/` (niveles no especificados) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license |
| Formato de pesos | safetensors (`.safetensors`), LoRA (`.safetensors`), workflow ComfyUI (`.zip`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base MiniMax H3 ni los datos de entrenamiento empleados. Sulphur 3 se describe como un finetune de MiniMaxAI/MiniMax-H3, con una variante "raw" (`s3_raw.safetensors`) que corresponde al modelo sin la LoRA de RL (aprendizaje por refuerzo) aplicada. Esto indica que el autor aplico una etapa de RL sobre el checkpoint base para producir el modelo final `s3.safetensors`.

El repositorio incluye un componente denominado "corrector" (`s3_corrector.safetensors`), distribuido como un modulo opcional que se integra mediante nodos y workflow de ComfyUI (`S3_ComfyUI.zip`). El corrector funciona tambien con otros modelos H3, lo que sugiere que actua como un refinador de salida independiente del checkpoint principal. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de video a partir de indicaciones (texto a video), como capacidad principal del modelo.
- Variante Ref2VA (`s3_ref2va.safetensors`) orientada a referencia/valor, aunque la model card indica que no fue entrenada.
- Modo "uncensored": generacion sin filtrado de contenido, diferenciandose del modelo base.
- Uso de un corrector opcional para mejorar la calidad de la salida generada.
- Compatibilidad con el ecosistema ComfyUI mediante nodos y workflow propios.
- Compatibilidad con otros checkpoints H3: el corrector puede aplicarse a modelos H3 de terceros.
- Soporte de cuantizacion para reducir requisitos de VRAM.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni multilingues mas alla de la generacion de video.

## Casos de uso

- Generacion de video creativo sin restricciones: el modelo permite producir clips a partir de indicaciones textuales sin las limitaciones de contenido del modelo base, adecuado para estudios creativos y proyectos artisticos.
- Prototipado rapido de escenas: usar `s3.safetensors` en un pipeline H3 estandar para generar borradores de video antes de produccion final, reduciendo el tiempo de iteracion.
- Refinamiento de video con corrector: aplicar `s3_corrector.safetensors` junto con los nodos de `S3_ComfyUI.zip` para mejorar la calidad de clips ya generados, incluso de otros modelos H3.
- Despliegue en hardware limitado: emplear las variantes de `quantized/` para ejecutar el modelo en GPUs con VRAM reducida, manteniendo la generacion de video.
- Integracion en ComfyUI: montar el workflow incluido en `S3_ComfyUI.zip` para encadenar generacion y correccion dentro de la interfaz visual de ComfyUI.
- Experimentacion con LoRA: usar `s3_raw_lora.safetensors` para aplicar el ajuste como LoRA sobre el checkpoint base `s3_raw`, facilitando combinaciones con otros merges (por ejemplo, los de TenStrip).
- Comparacion de variantes: alternar entre `s3.safetensors`, `s3_raw.safetensors` y `s3_ref2va.safetensors` para evaluar el efecto del RL y de la variante de referencia en la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 276,5 GB, lo que sugiere pesos de gran tamano; las variantes de `quantized/` estan pensadas para reducir el requisito de VRAM, pero no se especifican cifras.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; la existencia de opciones cuantizadas sugiere que el modelo puede ajustarse a GPUs de consumo, pero sin datos concretos.
- Opciones de despliegue: libreria `minimax-h3` (ejecucion directa de `s3.safetensors`), ComfyUI mediante `S3_ComfyUI.zip`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sulphur 3 | no disponible | no disponible | no disponible | minimax-h3-community-license | Hugging Face (SulphurAI/Sulphur-3) |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | no disponible | minimax-h3-community-license | Hugging Face (MiniMaxAI/MiniMax-H3) |
| Merges de TenStrip | no disponible | no disponible | no disponible | no disponible | Hugging Face (TenStrip) |

La comparativa con alternativas de la misma categoria no puede completarse con datos numericos: la informacion disponible solo identifica el modelo base y los merges recomendados por el autor, sin especificaciones de parametros, contexto ni rendimiento.

## Limitaciones y advertencias

- Modelo "uncensored": genera contenido sin filtrado, con riesgo de producir material inapropiado, ofensivo o ilegal; requiere moderacion en produccion.
- Riesgo de alucinacion y artefactos: no se documentan metricas de calidad ni evaluaciones; la salida de video puede presentar incoherencias no cuantificadas.
- La variante `s3_ref2va.safetensors` no fue entrenada, segun la model card, por lo que su calidad no esta garantizada.
- Los archivos de `experimental/` son de caracter experimental y el propio autor recomienda ignorarlos.
- Licencia: se distribuye bajo la MiniMax H3 Community License, derivada de MiniMax H3; las restricciones de uso comercial dependen de los terminos de dicha licencia, que no se detallan en la informacion disponible.
- Idiomas y contexto: no disponibles; no se puede confirmar el soporte multilingue ni la ventana de contexto.
- Dependencia del ecosistema H3: la ejecucion requiere la libreria `minimax-h3` o ComfyUI con los nodos incluidos, limitando la portabilidad a otros frameworks.
- El corrector es opcional y su integracion requiere seguir el workflow de ComfyUI; un uso incorrecto puede degradar la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SulphurAI/Sulphur-3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Perfil X del autor: https://x.com/FusionCow11
- Discord del autor: https://discord.gg/C3d56f39Ah
- Merges recomendados (TenStrip): https://huggingface.co/TenStrip
