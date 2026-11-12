# subunder/Qwen3.5-4B-Uncensored-HauhauCS-LoRA

## Resumen

Qwen3.5-4B-Uncensored-HauhauCS-LoRA es un adaptador LoRA de rango 4 publicado por el usuario subunder que aplica sobre los pesos originales de Qwen/Qwen3.5-4B la edición "uncensored" desarrollada por HauhauCS. No se trata de un modelo completo, sino de un fichero de 10,6 MB en formato safetensors que debe cargarse junto al modelo base para modificar su comportamiento de rechazo. Su proposito principal es servir como text encoder o prompt enhancer dentro de flujos de ComfyUI, donde el modelo base tiende a negarse a generar descripciones de prompt por motivos de moderacion.

El adaptador se ha obtenido por diferencia de pesos entre la version BF16 GGUF de HauhauCS y los pesos originales de Qwen, sin entrenamiento adicional, y reduciendo cada delta a rango 4 mediante SVD. Solo las capas 10 a 25 presentan diferencias respecto al modelo base, y unicamente en los modulos mlp.down_proj, mlp.gate_proj, mlp.up_proj, linear_attn.out_proj y self_attn.o_proj. El resto de pesos es identico bit a bit al modelo original.

Es relevante en el ecosistema de generacion de imagen asistida por LLM porque resuelve un problema muy concreto: cuando Qwen3.5-4B actua como text encoder en ComfyUI y rechaza escribir prompts con contenido para adultos o sensible, este LoRA elimina esa restriccion sin necesidad de sustituir el modelo completo. El repo no contiene pesos del modelo base ni informacion sobre arquitectura, contexto o benchmarks, por lo que los datos tecnicos de esta ficha se limitan a lo declarado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen/Qwen3.5-4B; el modelo base no detalla arquitectura en la informacion disponible |
| Parametros totales | Adaptador de 10,6 MB; parametros del modelo base no disponibles |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en fp32; cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, formato text_encoders.transformer.model.layers.* para ComfyUI) |

## Arquitectura y entrenamiento

El adaptador no implica entrenamiento: se ha construido restando los pesos de la version BF16 GGUF de HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive a los pesos originales de Qwen/Qwen3.5-4B. Solo difieren las capas 10 a 25, concretamente los modulos mlp.down_proj, mlp.gate_proj, mlp.up_proj, linear_attn.out_proj y self_attn.o_proj. El resto de pesos permanece bit-identico al modelo base.

Cada diferencia se redujo a rango 4 mediante descomposicion en valores singulares (SVD). Segun la model card, el rango 4 conserva el 100% del cambio en down_proj, out_proj y o_proj, mas del 99% en gate_proj y entre el 88% y el 99% en up_proj. El autor indica que el ordering de value-head de linear_attn.out_proj propio de llama.cpp se remapeo al layout de Hugging Face antes de calcular la diferencia. La presencia de modulos linear_attn y self_attn sugiere una arquitectura hibrida con atencion lineal en el modelo base, aunque no se detalla en la informacion disponible.

## Capacidades

- Modificacion del comportamiento de rechazo del modelo base Qwen3.5-4B, orientada a eliminar negativas a generar prompts con contenido sensible o para adultos.
- Uso como text encoder o prompt enhancer en flujos de ComfyUI, aplicando el LoRA al CLIP/text encoder con fuerza 1.0.
- Hereda las capacidades del modelo base Qwen3.5-4B (generacion de texto y comprension de prompts), aunque no se detallan en la informacion disponible.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni thinking mode en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de prompts en ComfyUI: el LoRA se aplica al text encoder Qwen3.5-4B para que escriba descripciones de prompt sin rechazarlas, evitando que el flujo de generacion de imagen se bloquee por moderacion.
- Prompt enhancement para modelos de difusion: se usa como expandidor de prompts en pipelines de Stable Diffusion u otros modelos de imagen, donde el LLM base tiende a autocensurar descripciones.
- Creacion de contenido para adultos: permite generar texto explicito en entornos controlados, dado el caracter "uncensored" del adaptador y su etiqueta not-for-all-audiences.
- Prototipado de flujos creativos: util para desarrolladores que necesitan un text encoder sin restricciones de rechazo al construir herramientas de escritura creativa.
- Investigacion sobre moderacion y alineacion: permite comparar el comportamiento del modelo base frente al modificado en tareas de generacion de texto sensible.
- Integracion ligera en produccion: al ocupar solo 10,6 MB, se puede distribuir y cargar junto al modelo base sin practicamente coste adicional de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 10,6 MB y no requiere VRAM adicional significativa; los requisitos dependen del modelo base Qwen3.5-4B, cuyos detalles no estan disponibles en la informacion proporcionada.
- GPU recomendadas: no disponibles para el modelo base.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (formato text encoder LoRA); otros entornos no documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| subunder/Qwen3.5-4B-Uncensored-HauhauCS-LoRA | LoRA rango 4 | 10,6 MB (adaptador) | no disponible | Apache-2.0 | Extraido por diferencia de pesos, sin entrenamiento |
| HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | Modelo completo (GGUF BF16) | 4B (base) | no disponible | Apache-2.0 | Fuente del cambio de pesos |
| nynxz/Qwen3.5-9B | LoRA (contrapartida 9B) | no disponible | no disponible | no disponible | Version equivalente sobre Qwen3.5-9B |
| Qwen/Qwen3.5-4B | Modelo base | 4B | no disponible | Apache-2.0 | Modelo original sin modificar |

## Limitaciones y advertencias

- El adaptador elimina deliberadamente las barreras de moderacion del modelo base; su uso esta etiquetado como not-for-all-audiences y puede generar contenido explicito o sensible.
- Solo modifica las capas 10 a 25; el resto del comportamiento es identico al modelo base, incluyendo posibles sesgos y riesgos de alucinacion heredados.
- La reduccion a rango 4 descarta entre el 1% y el 12% del cambio en up_proj, por lo que la fidelidad al modelo HauhauCS original no es total.
- No hay informacion sobre idiomas soportados, contexto ni rendimiento, lo que limita la evaluacion para produccion.
- Aunque la licencia es Apache-2.0, el contenido generado puede infringir normativas locales sobre material para adultos; el autor recomienda uso responsable y conforme a la ley aplicable.
- El repo no contiene los pesos del modelo base; es necesario descargar Qwen/Qwen3.5-4B por separado.
- Sin descargas ni likes registrados en el momento de la consulta, no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/subunder/Qwen3.5-4B-Uncensored-HauhauCS-LoRA
- Modelo uncensored de referencia: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Contrapartida 9B: https://huggingface.co/nynxz/Qwen3.5-9B
