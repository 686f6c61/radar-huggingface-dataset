# vcruz305/Inkling-2-Mini-SAGE-REXL3-4.23bpw

## Resumen

Inkling-2-Mini-SAGE-REXL3-4.23bpw es una cuantizacion de 4,23 bits por peso del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario vcruz305 en Hugging Face. Se trata de un artefacto de inferencia en formato EXL3 (exllamav3) orientado a servir el modelo original con un consumo de VRAM reducido, manteniendo la naturaleza multimodal (image-text-to-text) y la arquitectura MoE (mixture of experts) del modelo de referencia. El repositorio ocupa 15,1 GB y contiene pesos en safetensors listos para cargarse con la libreria exllamav3.

El modelo base Inkling-2-Mini pertenece a Thinking Machines y esta etiquetado como "inkling2_loop", lo que sugiere una arquitectura con bucles o iteraciones recurrentes internas, ademas de ser un MoE multimodal con capacidades conversacionales. La cuantizacion emplea el esquema SAGE-REXL3, una variante de cuantizacion de ExLlamaV3 que busca preservar la calidad numerica en modelos con expertos dispersos, donde la distribucion de pesos es mas heterogenea que en transformers densos.

La relevancia de esta ficha radica en que permite desplegar un modelo multimodal MoE de aproximadamente 7.400 millones de parametros totales en hardware de consumo o GPUs de gama media, algo inviable con los pesos en bf16 del modelo original. No obstante, conviene advertir que el repositorio es de acceso restringido (gated), no acumula descargas ni likes, y no se han publicado resultados de benchmarks especificos para esta cuantizacion, por lo que su calidad debe validarse empiricamente antes de usarla en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (image-text-to-text), variante "inkling2_loop" del modelo base |
| Parametros totales | 7.397.631.360 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 (SAGE-REXL3) a 4,23 bits por peso |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3, libreria exllamav3) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini se describe en los metadatos como un modelo multimodal de tipo image-text-to-text con arquitectura MoE y una etiqueta de variante "inkling2_loop", que apunta a un diseno con iteraciones o bucles recurrentes en el bloque transformer. Esta ficha corresponde exclusivamente a la cuantizacion, no al entrenamiento: no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares en el modelo original dentro de la informacion proporcionada.

La innovacion tecnica de este artefacto es el esquema de cuantizacion SAGE-REXL3 a 4,23 bpw sobre ExLlamaV3. Frente a una cuantizacion uniforme, este esquema aplica un tratamiento diferenciado a las capas de expertos del MoE, que suelen presentar una distribucion de pesos mas irregular. El resultado es un repositorio de 15,1 GB que reduce el peso del modelo original (que en bf16 superaria los 14,8 GB solo en pesos puros, mas overhead de cuantizacion y metadatos) y permite cargarlo en GPUs con 16-24 GB de VRAM. No se documentan en la informacion disponible detalles sobre calibracion, dataset de calibracion ni metricas de degradacion respecto al modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base.
- Procesamiento multimodal image-text-to-text: acepta imagenes junto con texto como entrada.
- Razonamiento y respuesta a instrucciones en ingles y otros idiomas (etiqueta multilingual).
- Arquitectura MoE, lo que implica activacion dispersa de expertos durante la inferencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo thinking explicito: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente multimodal en local: desplegar el modelo con exllamav3 en una GPU de 24 GB para responder preguntas sobre imagenes (capturas, diagramas, fotos) en un entorno sin conexion, aprovechando la cuantizacion a 4,23 bpw para reducir el footprint de VRAM.
- Prototipado de aplicaciones image-text-to-text: validar pipelines de vision-lenguaje antes de invertir en el modelo base completo, ya que el coste de almacenamiento (15,1 GB) y de VRAM es sensiblemente menor.
- Chat conversacional de bajo coste: servir conversaciones multi-turno en ingles con un modelo MoE cuantizado, adecuado para entornos de desarrollo y pruebas donde la latencia no es critica.
- Investigacion sobre cuantizacion de MoE: comparar la calidad de SAGE-REXL3 a 4,23 bpw frente al modelo base en tareas de vision-lenguaje, midiendo la degradacion introducida por la cuantizacion.
- Despliegue en estaciones de trabajo con GPU consumer: usar el modelo en una RTX 4090 (24 GB) o similar para tareas de analisis de imagenes y generacion de descripciones, sin necesidad de A100/H100.
- Evaluacion interna de modelos de Thinking Machines: emplear esta cuantizacion como paso previo a la adopcion del modelo base en produccion, reduciendo el coste de experimentacion.
- Generacion de documentacion tecnica a partir de capturas de pantalla o diagramas: el modelo puede recibir una imagen y producir texto explicativo en ingles, integrable en herramientas internas de documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 15,1 GB en EXL3 a 4,23 bpw; se requiere al menos 16 GB de VRAM para cargar los pesos, y 20-24 GB para margen de contexto y overhead de la cache KV.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), L40S (48 GB), A100 (40/80 GB) para mayor contexto y throughput.
- Cabe en GPU consumer: si, en tarjetas con 24 GB (RTX 4090, RTX 3090) con contexto moderado; en GPUs de 16 GB puede requerir reducir el contexto o el tamano de batch.
- Opciones de despliegue: exllamav3 (libreria nativa del formato EXL3); no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que no soportan el formato EXL3 de ExLlamaV3.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-SAGE-REXL3-4.23bpw (esta ficha) | 7.397.631.360 | no disponible | apache-2.0 | safetensors EXL3 | gated, 0 descargas |
| thinkingmachines/Inkling-2-Mini (base) | no disponible en la informacion | no disponible | no disponible en la informacion | safetensors | no disponible en la informacion |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (multimodales MoE de ~7.400 M de parametros) en la informacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva esta cuantizacion.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face para descargar el repositorio.
- Sin validacion publica: el repositorio tiene 0 descargas y 0 likes, y no se han publicado benchmarks de la cuantizacion; la calidad respecto al modelo base no esta verificada.
- Degradacion por cuantizacion: 4,23 bpw introduce perdida de precision frente a bf16, especialmente sensible en tareas de vision y en capas de expertos del MoE; conviene evaluar en el dominio de uso concreto.
- Compatibilidad limitada: solo funciona con exllamav3; no es desplegable con vLLM, llama.cpp, Ollama o TGI sin conversion adicional.
- Riesgo de alucinacion: inherente al modelo base; no se documentan mitigaciones especificas en esta cuantizacion.
- Sesgos: no se dispone de informacion sobre sesgos conocidos del modelo base ni de la cuantizacion.
- Idiomas: la etiqueta principal es ingles ("en") con soporte multilingual no detallado; el rendimiento en castellano no esta verificado.
- Contexto: la longitud de contexto del modelo base no se documenta en la informacion disponible, lo que impide garantizar ventanas largas en produccion.
- Licencia: apache-2.0 permite uso comercial, pero debe verificarse que el modelo base thinkingmachines/Inkling-2-Mini mantenga la misma licencia y que no existan terminos adicionales del autor original.
- Fecha de creacion futura (2026-11-21) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vcruz305/Inkling-2-Mini-SAGE-REXL3-4.23bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Libreria exllamav3: no disponible en la informacion proporcionada
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
