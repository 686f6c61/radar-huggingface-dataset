# Zayaan/zils-flash-clef

## Resumen

Zils-flash-clef es una redistribucion de los pesos de Cloudflare/clef-flash (revision fb4417d3) reempaquetados en el formato denominado "soup-body" del proyecto Zils, variante d3-flash. No se trata de un modelo nuevo ni de un fine-tuning: la model card indica explicitamente que los pesos son identicos a los del modelo original y que solo se ha modificado la organizacion de las claves de tensores, agrupandolas bajo los prefijos `language_model.*` y `visual.*`. Los tensores que no encajan en ese esquema, como cabezas personalizadas o `lm_head`, se han omitido del repositorio.

El modelo cuenta con 8.392.695.024 parametros segun los metadatos de safetensors, lo que lo situa en la franja de 8B, y el repositorio ocupa 16,8 GB. La presencia de un prefijo `visual.*` sugiere una arquitectura multimodal con torre de vision, aunque la informacion disponible no detalla la configuracion interna. Se distribuye bajo licencia Apache-2.0, heredada del modelo base.

Su relevancia es acotada y muy especifica: sirve como artefacto de distribucion para el ecosistema Zils y su subred de Bittensor 127, donde un hotkey de tipo scout lo ha publicado. Para un desarrollador que busque un modelo listo para produccion, la ficha del modelo original (Cloudflare/clef-flash) es la referencia adecuada, ya que este repositorio no anade capacidades ni documentacion tecnica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los pesos incluyen prefijos `language_model.*` y `visual.*`, lo que sugiere componente de lenguaje y componente visual) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo unico deducible de los metadatos es la estructura de pesos: un bloque `language_model.*` y un bloque `visual.*`, lo que apunta a un modelo multimodal con encoder de vision y decodificador de lenguaje, en linea con el prefijo de pipeline no especificado. El modelo base es Cloudflare/clef-flash, en su revision fb4417d3.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas como atencion lineal o decodificacion especulativa. La model card de este repositorio no aporta informacion de entrenamiento: se limita a documentar el reempaquetado de pesos y a ceder todo el credito a los autores originales.

El unico proceso aplicado en este repositorio es la conversion de formato: los tensores se reorganizan en el layout "soup-body" d3-flash de Zils, y se descartan las cabezas personalizadas y el `lm_head`. Esto implica que el checkpoint no es directamente utilizable como modelo de generacion de texto completo sin restaurar esas piezas desde el modelo original.

## Capacidades

- No se documentan capacidades especificas en la informacion disponible.
- La presencia de un bloque `visual.*` sugiere procesamiento de imagenes, pero no se detalla el tipo de tarea (captioning, VQA, OCR u otras).
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se indica la existencia de modo de razonamiento explicito (thinking mode).
- No se confirma soporte de audio.
- Al haberse omitido `lm_head` y cabezas personalizadas, las capacidades de generacion dependen de restaurar esos tensores desde Cloudflare/clef-flash.

## Casos de uso

- Reempaquetado para el ecosistema Zils: el caso de uso documentado es servir como cuerpo de pesos en el layout d3-flash para herramientas y pipelines de la subred 127 de Bittensor. Es adecuado porque respeta exactamente el esquema de claves esperado por ese tooling.
- Investigacion sobre formatos de checkpoint: util para estudiar como se reorganizan los tensores de un modelo multimodal en un layout alternativo y que piezas se descartan en el proceso.
- Verificacion de integridad de pesos: permite comparar los tensores `language_model.*` y `visual.*` con los del modelo original en la revision fb4417d3 para auditar la fidelidad de la conversion.
- Base para experimentos de restauracion de cabezas: partiendo de estos pesos, se puede reconstruir el `lm_head` desde el modelo original y evaluar si el reempaquetado introduce diferencias numericas.
- Distribucion en entornos con requisitos de licencia laxa: al mantener Apache-2.0, puede integrarse en productos comerciales siempre que se cumplan las condiciones de atribucion.
- Docencia y formacion: sirve como ejemplo practico de redistribucion de pesos, atribucion de autoria y diferencias entre un modelo base y un artefacto derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda una GPU de 24 GB o superior.
- Cuantizacion a 8 bits: en torno a 8,4 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion a 4 bits: en torno a 4,2 GB de pesos, viable en GPUs consumer de 8 GB, aunque la calidad no esta validada para este artefacto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4080 para cuantizacion 8 bits.
- Cabe en GPU consumer: si, en RTX 4090 sin cuantizar y en GPUs de 8-16 GB con cuantizacion, siempre que se restauren las cabezas necesarias.
- Opciones de despliegue: no documentadas para este repositorio. vLLM, TGI, llama.cpp u Ollama requeririan una configuracion compatible con la arquitectura del modelo base y la restauracion de `lm_head`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Zayaan/zils-flash-clef | 8.392.695.024 | no disponible | Apache-2.0 | Redistribucion de pesos, sin `lm_head` |
| Cloudflare/clef-flash | no disponible en la informacion | no disponible | Apache-2.0 | Modelo original, revision fb4417d3 |
| Alternativas de ~8B multimodal | no disponible | no disponible | no disponible | No se dispone de datos para comparar |

No se dispone de informacion suficiente para comparar rendimiento con modelos de la misma categoria.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son identicos a Cloudflare/clef-flash en la revision fb4417d3, sin fine-tuning ni modificacion de entrenamiento.
- Faltan tensores: se han omitido `lm_head` y cabezas personalizadas, por lo que el checkpoint no es autosuficiente para inferencia directa.
- Ausencia total de documentacion sobre arquitectura, contexto, idiomas y datos de entrenamiento en este repositorio.
- Sin benchmarks publicados: no hay evidencia de rendimiento para este artefacto.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; deben asumirse los del modelo base.
- Uso comercial permitido por Apache-2.0, pero con obligacion de mantener avisos de licencia y atribucion a los autores originales.
- El origen en una subred de Bittensor implica que la procedencia y el mantenimiento dependen de un hotkey de tipo scout, no de un equipo con soporte documentado.
- Para produccion, la recomendacion tecnica es usar el repositorio original Cloudflare/clef-flash y tratar este artefacto solo como formato alternativo.

## Enlaces

- HuggingFace: https://huggingface.co/Zayaan/zils-flash-clef
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Revision del modelo base citada: fb4417d3
- Subred Bittensor 127 (Zils): no disponible enlace directo en la informacion proporcionada
