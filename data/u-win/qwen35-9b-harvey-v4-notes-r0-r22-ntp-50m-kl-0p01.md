# U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-50m-kl-0p01

## Resumen

El modelo `qwen35-9b-harvey-v4-notes-r0-r22-ntp-50m-kl-0p01` es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario U-WIN en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, orientado a conversacion, que hereda la arquitectura `qwen3_5` del modelo original y anade un entrenamiento adicional especifico sobre un dataset aparentemente relacionado con "harvey" y "calderwood-harkness", segun las etiquetas del repositorio.

El nombre del modelo codifica varias decisiones de entrenamiento: `notes-r0-r22` sugiere un entrenamiento por rondas o iteraciones (de la ronda 0 a la 22), `ntp-50m` apunta a 50 millones de tokens de next-token prediction, y `kl-0p01` indica una regularizacion KL con coeficiente 0,01, probablemente para evitar el olvido catastrofico respecto al modelo base. Es un modelo de nicho, con solo 2 descargas y 0 likes en el momento de redactar esta ficha, lo que sugiere un uso experimental o de investigacion mas que de produccion.

Su relevancia es limitada fuera del contexto especifico para el que fue entrenado, pero resulta interesante como ejemplo de fine-tuning completo sobre un modelo multimodal de ~9.650 millones de parametros con regularizacion KL explicita. El acceso esta restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen3_5` (image-text-to-text) |
| Parametros totales | 9.653.104.368 (~9,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones posteriores no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Tipo de ajuste | Full fine-tune |
| Tamano del repositorio | 19,3 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de la familia Qwen 3.5 disenado para tareas image-text-to-text. Sobre esa base se ha realizado un ajuste fino completo (no LoRA ni adaptadores), lo que implica actualizar los ~9,65 mil millones de parametros del modelo. El pipeline declarado es `image-text-to-text`, por lo que conserva la capacidad de procesar imagenes junto con texto, aunque la informacion disponible no detalla la arquitectura interna del codificador visual ni la configuracion exacta de atencion.

El nombre del checkpoint sugiere un entrenamiento por rondas (r0 a r22) con 50 millones de tokens de next-token prediction y una regularizacion KL con coeficiente 0,01 respecto al modelo base. Esta combinacion es tipica de estrategias de ajuste que buscan especializar el modelo en un dominio concreto sin degradar en exceso el comportamiento original. No se dispone de informacion sobre la composicion del dataset, el numero total de tokens vistos, ni si se aplicaron tecnicas de RLHF o DPO. Las etiquetas `notes-only` y `harvey` / `calderwood-harkness` apuntan a un corpus especializado, probablemente notas o documentacion de un dominio concreto, pero no se detalla su contenido.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-9B.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text).
- Razonamiento y generacion de codigo: capacidad esperable por el modelo base, aunque no verificada en esta ficha.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Modo "thinking" o razonamiento extendido: no confirmado.
- Especializacion en el dominio "harvey"/"calderwood-harkness" segun las etiquetas del repositorio, sin mas detalle.

## Casos de uso

- Investigacion sobre fine-tuning completo de modelos multimodales: el checkpoint sirve como referencia para estudiar el efecto de la regularizacion KL (coeficiente 0,01) y el entrenamiento por rondas sobre un modelo de ~9,65 mil millones de parametros.
- Experimentos de olvido catastrofico: al comparar este modelo con su base Qwen/Qwen3.5-9B se puede evaluar cuanto se degrada el rendimiento general tras el ajuste especializado.
- Prototipado de asistentes conversacionales de dominio: si el corpus "notes-only" corresponde a documentacion tecnica o notas de un producto, el modelo podria usarse para responder preguntas sobre ese material, siempre con validacion humana.
- Generacion asistida de documentacion: el modelo puede redactar borradores de notas o resumenes a partir de texto e imagenes, aprovechando la entrada multimodal.
- Evaluacion de pipelines image-text-to-text: util para probar integraciones con `transformers` y endpoints compatibles en entornos de investigacion.
- Base para nuevos ajustes: al estar liberado con licencia Apache 2.0, puede servir como punto de partida para fine-tunes posteriores en dominios relacionados.
- Analisis de imagenes con texto asociado: tareas de descripcion o extraccion de informacion de capturas, diagramas o documentos escaneados, sujeto a validacion empirica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 19-20 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB para los pesos, aunque la cuantizacion no esta publicada oficialmente para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 ajustado o cuantizaciones.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en fp16 con contexto moderado, o en GPUs de 12-16 GB usando cuantizacion.
- Opciones de despliegue: `transformers` (libreria declarada), endpoints compatibles; vLLM, TGI y llama.cpp no estan confirmados para este checkpoint concreto, aunque al ser safetensors estandar podrian funcionar segun el soporte de la arquitectura `qwen3_5`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-50m-kl-0p01 | ~9,65 B | no disponible | Apache 2.0 | Gated | Fine-tune especializado, multimodal |
| Qwen/Qwen3.5-9B | ~9 B (no confirmado) | no disponible | no disponible en esta ficha | Publico (previsiblemente) | Modelo base, capacidades generales |
| Alternativas de ~9 B multimodal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar |

La comparacion cuantitativa con otros modelos no es posible con la informacion disponible; el unico contraste fiable es con su propio modelo base, del que hereda arquitectura y capacidades generales.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Modelo de nicho con solo 2 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion independiente.
- Sin benchmarks publicados: no se puede confirmar el rendimiento real ni la degradacion respecto al modelo base.
- Riesgo de olvido catastrofico: aunque el nombre indica regularizacion KL (0,01), un full fine-tune sobre un corpus especializado puede degradar capacidades generales.
- Riesgo de alucinacion: inherente a los modelos generativos, agravado por la falta de validacion externa.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingue adecuado.
- Longitud de contexto no disponible: limita la planificacion de casos de uso con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B y del acceso gated.
- Dataset de entrenamiento no documentado: dificulta evaluar sesgos y cobertura del dominio.
- Fecha de creacion futura (2026-11-12): conviene verificar la autenticidad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-50m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor: https://huggingface.co/U-WIN
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
