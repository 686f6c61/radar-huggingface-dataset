# taharmasmaliyev07/Gemma4-12B-FACEBOOK-E2-BF16

## Resumen

Gemma4-12B-FACEBOOK-E2-BF16 es un ajuste fino (finetune) publicado por el usuario taharmasmaliyev07 en Hugging Face, construido sobre una variante de la familia Gemma 4 con 11.959.730.224 parametros (aproximadamente 12B) en precision BF16. El modelo se presenta como un modelo multimodal de tipo image-text-to-text bajo la arquitectura `gemma4_unified`, lo que indica que acepta tanto texto como imagenes como entrada y genera texto. La licencia declarada es Apache 2.0 y el unico idioma declarado es el ingles.

El modelo resuelve el caso de uso generico de generacion de texto y comprension de imagenes conversacional, y su relevancia actual radica en que parte de una base Gemma 4 (familia abierta de Google) y se ha entrenado con Unsloth y TRL, lo que abarata el proceso de ajuste. No obstante, la informacion publicada por el autor es extremadamente escasa: la model card se limita a indicar el autor, la licencia, el modelo base y la herramienta de entrenamiento, sin detallar datos de entrenamiento, hiperparametros ni evaluaciones.

Por tanto, esta ficha describe lo que se puede verificar a partir de los metadatos del repositorio (parametros, formato, licencia, pipeline y tamano) y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado. Es importante senalar que el campo `base_model` del repositorio apunta al propio repositorio, lo que sugiere un error de configuracion en la model card y no un ciclo real de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (transformer multimodal image-text-to-text, segun el tag del repositorio) |
| Parametros totales | 11.959.730.224 (aproximadamente 12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se publica en BF16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El repositorio declara la arquitectura `gemma4_unified`, que corresponde a la familia Gemma 4 en su variante unificada multimodal. El pipeline es `image-text-to-text`, lo que implica un codificador de vision acoplado a un decodificador de lenguaje para tareas de comprension de imagenes y generacion de texto condicionada. El modelo se distribuye en precision BF16 con pesos en safetensors y un tamano de repositorio de 24,2 GB, coherente con 11,96B parametros en 16 bits mas los tensores del codificador visual y los ficheros auxiliares.

En cuanto al entrenamiento, la unica informacion disponible es que se realizo un ajuste fino con Unsloth y la libreria TRL de Hugging Face, y que el autor afirma que el entrenamiento fue "2x mas rapido" gracias a Unsloth. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO o SFT supervisado, ni los hiperparametros utilizados. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento) mas alla de las que pueda aportar la arquitectura Gemma 4 de base, que no se detallan en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` y el pipeline declarado.
- Comprension de imagenes y respuesta en texto (image-text-to-text), gracias al pipeline multimodal.
- Integracion con `text-generation-inference` (tag TGI) y con `transformers`, lo que facilita el despliegue en endpoints compatibles.
- Compatibilidad declarada con `endpoints_compatible`, lo que sugiere uso en Hugging Face Inference Endpoints.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun el campo `language`; no se declaran otros idiomas.
- Capacidades especiales (thinking mode, audio, vision avanzada): solo se confirma vision por el pipeline; el resto no disponible.

## Casos de uso

- Descripcion automatica de imagenes en ingles: el modelo puede recibir una imagen y generar una descripcion textual, util para catalogos de productos o accesibilidad, gracias a su pipeline image-text-to-text.
- Asistente conversacional multimodal: atencion al cliente que adjunta capturas de pantalla o fotos de productos y necesita una respuesta textual; el modelo procesa imagen y texto en una sola llamada.
- Extraccion de informacion de documentos escaneados: dado que acepta imagen y texto, puede transcribir o resumir el contenido de facturas o formularios en ingles, siempre que se valide la salida por el riesgo de alucinacion.
- Prototipado rapido de aplicaciones de vision-lenguaje: al estar en `transformers` y ser compatible con TGI, se puede desplegar en un endpoint y construir demos en horas, sin reentrenar.
- Generacion de texto asistida por imagen en entornos de investigacion: util para experimentos academicos que necesiten un modelo abierto de ~12B con licencia Apache 2.0 y pesos safetensors.
- Fine-tuning posterior sobre dominios concretos: al ser un modelo ya ajustado y con licencia permisiva, sirve como punto de partida para nuevos ajustes con Unsloth/TRL en tareas especificas en ingles.
- Clasificacion y moderacion de contenido visual-textual: el modelo puede describir y etiquetar imagenes con texto asociado, aunque requiere umbrales y revision humana por los sesgos no documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y la busqueda web no aporta datos tecnicos sobre este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 24 GB solo para pesos (11,96B x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 32 GB o mas para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 12-14 GB de pesos, mas overhead; en 4 bits, alrededor de 7-8 GB de pesos, mas overhead. Estas cifras son estimaciones por tamano, no valores publicados por el autor.
- GPU recomendadas para BF16: NVIDIA A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB. Para cuantizacion 4/8 bits, RTX 4090 24 GB o RTX 3090 24 GB pueden ser suficientes.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits cabe en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080); en BF16 no cabe en GPUs de 24 GB sin offloading.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), Hugging Face Inference Endpoints (tag `endpoints_compatible`). No se documenta soporte de llama.cpp, Ollama ni vLLM en la informacion proporcionada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto para comparar de forma rigurosa con alternativas. La siguiente tabla recoge solo los datos verificables del repositorio frente a la categoria generica de modelos abiertos multimodales de ~12B; los campos no documentados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmark |
|---|---|---|---|---|---|
| Gemma4-12B-FACEBOOK-E2-BF16 | 11,96B | no disponible | Apache 2.0 | safetensors (BF16) | no disponible |
| Alternativas de ~12B multimodales abiertas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion proporcionada modelos comparables concretos con datos suficientes para una comparacion tecnica fiable.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, hiperparametros ni evaluaciones, lo que impide auditar el ajuste fino.
- El campo `base_model` apunta al propio repositorio, lo que sugiere un error de configuracion; el origen real del ajuste no esta claro a partir de los metadatos.
- Solo se declara ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion no cuantificado: al ser un modelo conversacional multimodal sin evaluaciones publicadas, las salidas deben validarse en produccion.
- Sesgos conocidos: no documentados por el autor; se heredan los de la base Gemma 4 y los del dataset de ajuste, que se desconoce.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero el autor no aporta garantias ni avisos sobre el origen de los datos de entrenamiento.
- Sin variantes cuantizadas oficiales (GGUF, AWQ, GPTQ) en el repositorio; el despliegue en hardware limitado requiere cuantizar por cuenta propia.
- Popularidad muy baja (31 descargas, 0 likes) y sin comunidad que valide el modelo; no recomendable como dependencia critica sin pruebas propias.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en pipelines que dependan de function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taharmasmaliyev07/Gemma4-12B-FACEBOOK-E2-BF16
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (libreria citada): https://github.com/huggingface/trl
- Resultados de busqueda web sin relacion tecnica con el modelo (no relevantes): https://www.facebook.com/help/instagram/437912651842720/ y https://business.facebook.com/business/help/851388479347923/
