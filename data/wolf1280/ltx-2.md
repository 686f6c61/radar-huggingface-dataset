# wolf1280/ltx-2

## Resumen

`wolf1280/ltx-2` es un repositorio de redistribucion de pesos, no un modelo entrenado desde cero. Su autor, el usuario `wolf1280`, ha empaquetado los ficheros de LTX-2 (el modelo de generacion de video de pesos abiertos de Lightricks) en el formato "diffusion-single-file" que consume ComfyUI, y ha anadido como text encoder variantes de Gemma 3 12B IT de Google, incluidas versiones "abliterated" y un LoRA de estilo denominado `ltx2-squish`. El repositorio original de referencia es `Lightricks/LTX-2`.

El problema que resuelve es puramente practico: los pesos oficiales de LTX-2 se distribuyen con una estructura de carpetas que no siempre coincide con la que espera ComfyUI, y este repositorio entrega los ficheros ya troceados (LoRAs en `models/loras/`, text encoders en `models/text_encoders/`) con varias precisiones del text encoder (bf16, fp8_scaled, fp4_mixed, fpmixed) para ajustar el consumo de VRAM. El repositorio ocupa 62,4 GB en total, lo que incluye varias cuantizaciones redundantes del mismo encoder.

Es relevante ahora porque LTX-2 es una de las alternativas de pesos abiertos para generacion de video que la comunidad ejecuta en local mediante ComfyUI, y porque la eleccion del text encoder condiciona tanto el consumo de memoria como el comportamiento del modelo ante prompts restringidos. Conviene senalar que el repositorio no tiene descargas ni "likes" registrados, no incluye model card tecnica y su licencia es la "ltx-2-community-license-agreement", no una licencia permisiva estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de video (familia LTX-2 de Lightricks); el detalle exacto del backbone no se especifica en la informacion disponible. Text encoder: Gemma 3 12B IT (transformer decoder-only) |
| Parametros totales | No disponible. El LoRA incluido `LTX-2-19b-Squish-LoRA` sugiere una variante de 19 000 millones de parametros, pero la model card no confirma la cifra |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible para el modelo de difusion. El text encoder Gemma 3 12B IT tiene 128 000 tokens de contexto segun la documentacion publica de Google, aunque la model card de este repositorio no lo declara |
| Tipos de cuantizacion | Text encoder: bf16, fp8_scaled, fp4_mixed, fpmixed. LoRAs: bf16 (rank 64). Los pesos del modelo de difusion: no disponible |
| Idiomas soportados | No declarados en la model card. El text encoder Gemma 3 12B IT soporta oficialmente mas de 140 idiomas |
| Licencia | ltx-2-community-license-agreement (campo `license: other`) |
| Formato de pesos | safetensors, en formato single-file para ComfyUI |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento en el material proporcionado: la model card se limita a indicar "Repackaged model files for ComfyUI" y a listar la ubicacion de los ficheros. Por tanto, se desconoce el numero de tokens de entrenamiento, la composicion del dataset, la resolucion nativa, la duracion maxima de clip y si hubo fases de ajuste por preferencias (RLHF/DPO). Lo unico confirmado por el autor es la estructura de despliegue: tres LoRAs (`gemma-3-12b-it-abliterated_heretic_lora_rank64_bf16.safetensors`, `gemma-3-12b-it-abliterated_lora_rank64_bf16.safetensors` y `ltx2-squish.safetensors`) y cuatro variantes del text encoder Gemma 3 12B IT.

La innovacion tecnica que si se puede describir con lo aportado es la del propio empaquetado: la separacion entre el modelo de difusion y el text encoder permite intercambiar el encoder sin tocar el resto del pipeline. Las variantes "abliterated" derivan de `mlabonne/gemma-3-12b-it-abliterated`, un ajuste que elimina direcciones de activacion asociadas al rechazo de peticiones, y se aplican sobre Gemma 3 12B mediante LoRAs de rango 64 en bf16. El LoRA `ltx2-squish` se activa con la palabra clave `squish it` y proviene de `ovi054/LTX-2-19b-Squish-LoRA`. No se documentan tecnicas de decodificacion especulativa ni de atencion lineal.

## Capacidades

- Generacion de video condicionada por texto, heredada de la familia LTX-2 de Lightricks; la model card no detalla resoluciones, fps ni duracion soportadas.
- Codificacion de prompts mediante Gemma 3 12B IT, con cuatro precisiones intercambiables para ajustar el uso de VRAM.
- Aplicacion de LoRAs de estilo y de comportamiento sobre el text encoder y sobre el pipeline de difusion.
- Ejecucion de la palabra clave `squish it` para activar el LoRA de estilo `ltx2-squish`.
- Integracion nativa con ComfyUI mediante el formato diffusion-single-file, con nodos estandar de carga de checkpoint y de text encoder.
- Modificacion del comportamiento de rechazo mediante los adaptadores abliterated, aunque esto no es una "capacidad" en sentido funcional sino una alteracion del alineamiento.
- Soporte de tool calling, function calling, agentes, vision o modo de razonamiento explicito: no aplica o no disponible para un modelo de difusion de video.

## Casos de uso

- Generacion de video local en ComfyUI: el repositorio existe precisamente para alimentar flujos de trabajo de ComfyUI con los pesos ya troceados, evitando al usuario reestructurar las carpetas del repositorio oficial.
- Ajuste fino de la huella de VRAM: en equipos con poca memoria se puede cargar la variante fp4_mixed o fpmixed del text encoder (aproximadamente 6 GB) en lugar de la bf16 (aproximadamente 24 GB) y reservar el resto de VRAM para el modelo de difusion.
- Experimentacion con estilos concretos: el LoRA `ltx2-squish` activado con `squish it` permite reproducir un estilo visual concreto sin reentrenar el modelo base, util para pruebas de direccion de arte.
- Investigacion sobre alineamiento y text encoders: comparar el comportamiento del pipeline con Gemma 3 12B IT estandar frente a las variantes abliterated permite estudiar como el encoder afecta al contenido generado y a la tasa de rechazo de determinados prompts.
- Prototipado de producto audiovisual: generar clips de prueba para validar guiones gráficos, storyboards o animaticas antes de producir con herramientas comerciales.
- Creacion de contenido para redes y publicidad: generar variaciones de un mismo plano con distintas semillas y estilos para seleccionar la toma final.
- Docencia y divulgacion tecnica: disponer de un pipeline de difusion de video reproducible y de codigo abierto en un aula o taller de IA generativa.
- Evaluacion comparativa de text encoders: medir como cambia la fidelidad al prompt al sustituir un encoder de 12 000 millones de parametros por versiones cuantizadas a fp8 y fp4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna metrica (ni FVD, ni CLIP score, ni evaluaciones humanas), no se aportan comparaciones con otros modelos de video y las busquedas web realizadas no devolvieron resultados relacionados con el modelo. Cualquier cifra que se atribuya a este repositorio en concreto seria una extrapolacion de la familia LTX-2 y no una medicion del empaquetado de `wolf1280`.

## Requisitos de hardware

- Tamano de descarga: 62,4 GB para el repositorio completo, que incluye tres LoRAs y cuatro variantes del text encoder. La descarga necesaria para una sola inferencia es muy inferior, ya que solo se carga una variante de encoder.
- VRAM del text encoder (calculo a partir del numero de parametros, 12 000 millones): aproximadamente 24 GB en bf16, 12 GB en fp8_scaled y 6 GB en fp4_mixed o fpmixed.
- VRAM del modelo de difusion: no disponible. Si se confirma la variante de 19 000 millones de parametros que sugiere el nombre del LoRA, los pesos en bf16 ocuparian del orden de 38 GB, pero es una inferencia no verificada.
- GPU recomendadas: para precision completa con margen, A100 80 GB o H100 80 GB. Con las variantes cuantizadas del encoder, una RTX 4090 de 24 GB o una RTX 5090 pueden ser suficientes para resoluciones y duraciones modestas, aunque no hay datos oficiales que lo confirmen.
- Compatibilidad con GPU de consumo: probable con cuantizacion fp8 o fp4 del text encoder, supeditada al tamano real del modelo de difusion, que no se documenta.
- Opciones de despliegue: ComfyUI es el entorno objetivo explicito del repositorio. vLLM, TGI, llama.cpp y Ollama no son aplicables al modelo de difusion; el text encoder si podria servirse por separado con vLLM o TGI si se convierte a un formato compatible.
- Latencia y throughput: no disponibles. No se aportan mediciones de tiempo por clip, ni de pasos de muestreo, ni comparaciones entre las distintas cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wolf1280/ltx-2 (este repositorio) | No disponible (posible variante de 19 000 millones) | No disponible | No publicado | ltx-2-community-license-agreement | HuggingFace, 0 descargas |
| Lightricks/LTX-2 (upstream) | No disponible en la informacion proporcionada | No disponible | No disponible | ltx-2-community-license-agreement | HuggingFace, repositorio oficial |
| Otros modelos de video de pesos abiertos (Wan, HunyuanVideo, LTX-Video) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

La unica comparacion que puede sostenerse con el material aportado es la del repositorio frente a su upstream: este repositorio no anade pesos nuevos, sino que reorganiza los mismos ficheros para ComfyUI y les anade un LoRA de estilo y dos adaptadores sobre el text encoder. No se dispone de datos verificados de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio no oficial: se trata de un reempaquetado de terceros, sin validacion por parte de Lightricks ni de Comfy-Org. El autor no publica model card tecnica, ni instrucciones de uso mas alla del arbol de carpetas, ni resultados de pruebas.
- Ausencia de traccion y de verificacion: cero descargas y cero "likes" en el momento de la consulta, lo que implica que no hay evidencia publica de que los ficheros funcionen correctamente en un flujo real.
- Fechas de metadatos anomalas: el repositorio figura como creado y actualizado el 10 de septiembre de 2026, un registro que conviene contrastar antes de asumir cualquier dato temporal.
- Licencia restrictiva: la "ltx-2-community-license-agreement" es una licencia personalizada, no una licencia de codigo abierto estandar. Es imprescindible revisar el texto completo antes de cualquier uso comercial, y la redistribucion de los pesos esta sujeta a sus propios terminos.
- Riesgo de contenido no filtrado: los adaptadores abliterated eliminan deliberadamente el comportamiento de rechazo del text encoder. Esto aumenta la probabilidad de generar contenido inapropiado, danino o ilegal segun la jurisdiccion, y traslada toda la responsabilidad al operador del pipeline.
- Trazabilidad del ajuste: los dos LoRAs abliterated se entrenaron sobre `mlabonne/gemma-3-12b-it-abliterated`, un modelo de terceros cuyos datos de ajuste no se documentan aqui. No se puede auditar que sesgos introducen.
- Calidad de generacion: no hay ninguna evaluacion publicada de este empaquetado. Un error en la colocacion de los ficheros o en la seleccion de la variante del encoder puede degradar los resultados sin producir un error explicito.
- Fidelidad al prompt: en modelos de difusion de video el fallo tipico no es la alucinacion textual, sino la discrepancia entre el prompt y el clip generado, especialmente con movimientos de camara, fisica de objetos o multiples sujetos.
- Idiomas: no se declara cobertura idiomatica del pipeline completo. Aunque el text encoder sea multilingue, el comportamiento del modelo de difusion ante prompts en castellano no esta documentado.
- Gestion de disco: el repositorio ocupa 62,4 GB por incluir varias cuantizaciones redundantes del mismo encoder; conviene descargar solo la variante necesaria.
- Dependencia de palabras clave: el LoRA de estilo solo se activa con la cadena exacta `squish it`, de modo que su efecto no aparecera si el prompt no la incluye o si el LoRA no se carga.

## Enlaces

- Repositorio del empaquetado: https://huggingface.co/wolf1280/ltx-2
- Modelo original de Lightricks: https://huggingface.co/Lightricks/LTX-2
- Texto de la licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- LoRA de estilo ltx2-squish (copia de Comfy-Org): https://huggingface.co/Comfy-Org/ltx-2/blob/main/split_files/loras/ltx2-squish.safetensors
- Repositorio del LoRA de estilo: https://huggingface.co/ovi054/LTX-2-19b-Squish-LoRA/
- Text encoder base: https://huggingface.co/google/gemma-3-12b-it
- Text encoder abliterated: https://huggingface.co/mlabonne/gemma-3-12b-it-abliterated
- Resultados de la busqueda web: no se encontro ningun enlace relacionado con el modelo; todas las coincidencias correspondian a empresas no vinculadas al proyecto.
