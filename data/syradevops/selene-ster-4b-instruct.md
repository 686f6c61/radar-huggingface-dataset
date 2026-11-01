# Syradevops/Selene-Ster-4B-Instruct

## Resumen

Selene-Ster-4B-Instruct es un ajuste fino (fine-tuning) del modelo multimodal Gemma 3 4B Instruct de Google, publicado por el usuario Syradevops en HuggingFace. Se trata de un modelo de 4.300.079.472 parametros (aproximadamente 4,3 mil millones) que hereda la arquitectura transformer decoder-only de Gemma 3 y su capacidad para procesar entradas de imagen y texto (pipeline image-text-to-text). El ajuste se realizo partiendo de la version cuantizada en 4 bits de Unsloth (unsloth/gemma-3-4b-it-bnb-4bit) y se entreno con la libreria Unsloth junto a TRL de HuggingFace, lo que permitio acelerar el proceso de entrenamiento.

El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado unicamente para el idioma ingles. El repositorio ocupa 8,6 GB y contiene pesos en formato safetensors compatibles con transformers y text-generation-inference. La model card es extremadamente escueta: no documenta el dataset de ajuste, el numero de tokens de entrenamiento, la composicion de los datos ni los hiperparametros utilizados, lo que limita seriamente la evaluacion de su calidad y de su comportamiento real.

Su relevancia es limitada en el ecosistema actual: se trata de un ajuste fino de un modelo base conocido (Gemma 3 4B), con muy pocas descargas (17) y sin resultados de benchmarks publicados. Resulta util como ejemplo de flujo de trabajo de fine-tuning con Unsloth sobre un modelo multimodal pequeno, pero no dispone de evidencia publica que respalde mejoras sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), segun el modelo base |
| Parametros totales | 4.300.079.472 (4,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Gemma 3 4B soporta contexto largo, pero el autor no lo documenta) |
| Tipos de cuantizacion | No disponible en la model card; el modelo base de partida estaba cuantizado en 4 bits (bnb-4bit) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 4B Instruct: un transformer decoder-only con atencion por ventanas deslizantes y capacidad multimodal para entradas de imagen y texto. Al tratarse de un fine-tuning, la arquitectura no se modifica respecto al modelo base; lo unico que cambia son los pesos ajustados. El punto de partida es la version cuantizada en 4 bits de Unsloth (unsloth/gemma-3-4b-it-bnb-4bit), lo que implica que el ajuste se realizo sobre pesos comprimidos, un flujo habitual para reducir requisitos de VRAM durante el entrenamiento con QLoRA.

La model card no proporciona informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se detallan hiperparametros, epochs ni la estrategia de enmascaramiento de perdida. La unica informacion tecnica disponible es que el entrenamiento se realizo con Unsloth y TRL, lo que sugiere un ajuste supervisado (SFT) con LoRA o QLoRA, pero no se puede confirmar ni cuantificar. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) mas alla de las propias del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 3 4B Instruct.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text), lo que permite tareas de descripcion de imagenes, respuesta a preguntas visuales y conversacion multimodal.
- Razonamiento basico y respuesta a instrucciones, condicionado por el ajuste fino realizado.
- Capacidades de codigo y matematicas heredadas del modelo base, aunque no hay evidencia publicada de su rendimiento tras el ajuste.
- Soporte de tool calling / function calling: no documentado en la model card; se desconoce si el ajuste lo preserva.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente ingles; no se garantiza soporte de otros idiomas.
- Modo thinking o razonamiento extendido: no documentado.

## Casos de uso

- Prototipado de asistentes multimodales en ingles: el modelo puede recibir una imagen y una pregunta de texto para generar una respuesta descriptiva, util para validar rapidamente pipelines de vision-lenguaje antes de pasar a modelos mayores.
- Experimentacion academica con fine-tuning de Gemma 3: sirve como referencia de un ajuste realizado con Unsloth y TRL sobre un modelo de 4B, permitiendo reproducir el flujo y comparar con el modelo base.
- Clasificacion y descripcion de imagenes en entornos controlados: con 4,3B parametros puede ejecutarse en una unica GPU consumer y emplearse para etiquetado asistido de imagenes en ingles.
- Generacion de texto conversacional de baja latencia: su tamano reducido permite desplegarlo en entornos con recursos limitados para tareas de chat simple en ingles.
- Educacion y demos interactivas: adecuado para talleres o demostraciones donde se necesite un modelo multimodal pequeno que quepa en VRAM modesta.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0 y en formato safetensors, puede servir como punto de partida para especializaciones posteriores con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa por el tamano (4,3B parametros), en FP16 requeriria aproximadamente 8,6 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 4 bits, alrededor de 2,5-3 GB de pesos.
- GPU recomendadas: no documentadas por el autor. Por tamano, una RTX 3090, RTX 4090 o A100 permitirian inferencia comoda en FP16; GPUs con 8-12 GB de VRAM podrian ejecutar versiones cuantizadas.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 en cuantizaciones de 4-8 bits; no confirmado por el autor.
- Opciones de despliegue: transformers, text-generation-inference (segun los tags del repositorio) y, previsiblemente, llama.cpp u Ollama si se generan pesos GGUF, aunque no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Selene-Ster-4B-Instruct | 4,3 B | No disponible | Si (image-text-to-text) | Apache 2.0 | HuggingFace, 17 descargas |
| Gemma 3 4B Instruct (modelo base) | ~4 B | No disponible en esta ficha | Si | Gemma Terms of Use | Ampliamente disponible |
| Qwen2.5-VL 3B | ~3 B | No disponible en esta ficha | Si | Apache 2.0 (segun version) | HuggingFace |
| Llama 3.2 3B Instruct | ~3 B | 128K (segun documentacion oficial) | No (solo texto) | Llama 3.2 Community License | HuggingFace |

La comparativa se limita a datos de categoria y disponibilidad; no hay benchmarks publicados de Selene-Ster-4B-Instruct que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, lo que impide evaluar sesgos, calidad y posibles contaminaciones.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, agravado por la falta de evaluacion publicada.
- Idioma limitado al ingles segun la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- El ajuste se realizo sobre una version cuantizada en 4 bits del modelo base, lo que puede introducir degradaciones respecto al modelo original en FP16.
- No hay evidencia de que el ajuste mejore al modelo base; podria incluso degradar capacidades previas (olvido catastrofico) sin que el autor lo documente.
- Licencia Apache 2.0 declarada, pero el modelo base Gemma 3 esta sujeto a los terminos de uso de Gemma; conviene verificar la compatibilidad antes de un uso comercial.
- Sin resultados de benchmarks, sin demos y con muy pocas descargas: no recomendable para produccion sin una evaluacion propia exhaustiva.
- No se documenta soporte de tool calling, agentes ni modo de razonamiento extendido, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Syradevops/Selene-Ster-4B-Instruct
- Modelo base (Unsloth, Gemma 3 4B IT 4-bit): https://huggingface.co/unsloth/gemma-3-4b-it-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
