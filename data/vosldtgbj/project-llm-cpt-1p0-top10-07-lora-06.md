# vosldtgbj/project-llm-cpt-1p0-top10-07-lora-06

## Resumen

`project-llm-cpt-1p0-top10-07-lora-06` es un checkpoint experimental de ajuste por preentrenamiento continuado (CPT, continual pretraining) construido sobre el modelo multimodal `google/gemma-4-12B`. Lo publica el usuario `vosldtgbj` como parte de una serie de experimentos denominada Project LLM, en la que este repositorio corresponde a la variante `top10-07-lora-06-1ep`. No se trata de un modelo nuevo entrenado desde cero, sino de un archivo de pesos completos obtenidos tras aplicar LoRA durante 1,0 epoca de preentrenamiento continuado y fusionar despues los adaptadores en los pesos base.

El modelo conserva la arquitectura y el pipeline del modelo original: etiquetas como `gemma4_unified`, `image-text-to-text` y `any-to-any` indican que es un modelo multimodal capaz de recibir y generar imagenes y texto. El recuento real de parametros en los ficheros safetensors es de 11.959.730.176 (aproximadamente 12.000 millones), con un repositorio de 24,0 GB repartido en safetensors fragmentados. La etiqueta `japanese` sugiere que el preentrenamiento continuado se ha orientado a contenido en japones.

Su relevancia es fundamentalmente de investigacion: se publica como archivo de pesos para reproducibilidad, evaluacion offline y trabajos posteriores. No incluye datos de optimizador, scheduler ni estados de reanudacion, y a fecha de la informacion disponible acumula 0 descargas y 0 likes, por lo que no debe considerarse un modelo validado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (transformer multimodal, segun etiquetas; detalles no disponibles) |
| Parametros totales | 11.959.730.176 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible oficialmente; la etiqueta `japanese` apunta a orientacion al japones, y se heredan las capacidades del modelo base |
| Licencia | apache-2.0 (con sujecion adicional a los terminos del modelo Gemma 4 de Google) |
| Formato de pesos | safetensors fragmentados |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B`, un modelo multimodal de aproximadamente 12.000 millones de parametros con pipeline `any-to-any` y arquitectura identificada en las etiquetas como `gemma4_unified`. Sobre esa base se ha aplicado un proceso de preentrenamiento continuado (CPT) con LoRA durante 1,0 epoca; posteriormente los adaptadores LoRA se han fusionado, dando lugar a pesos completos cargables. El repositorio solo contiene pesos y configuracion necesaria, sin estados de optimizador ni de scheduler, lo que lo orienta a inferencia y evaluacion mas que a continuar el entrenamiento.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset (salvo la orientacion al japones sugerida por las etiquetas), ni si hubo fases de RLHF o DPO posteriores. La innovacion tecnica destacable es precisamente el uso de LoRA para CPT con fusion posterior, un patron habitual en experimentos de adaptacion de dominio con coste reducido. Cualquier detalle adicional de atencion, decodificacion o estrategia multimodal del modelo base debe consultarse en la documentacion oficial de Gemma 4, no incluida aqui.

## Capacidades

- Generacion de texto y capacidades multimodales heredadas del modelo base, coherentes con el pipeline `any-to-any` y la etiqueta `image-text-to-text`.
- Entrada y salida que pueden combinar imagen y texto, segun la clasificacion del pipeline.
- Preentrenamiento continuado orientado a japones, lo que puede mejorar el desempeno en ese idioma respecto al base.
- Carga mediante `AutoProcessor` y `AutoModelForMultimodalLM` de Transformers, con soporte declarado para la arquitectura `gemma4_unified`.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionada.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion de experimentos de CPT: el repositorio se publica explicitamente para reproducir el ajuste `top10-07-lora-06-1ep` y comparar resultados frente al modelo base.
- Evaluacion offline de adaptacion al japones: permite medir si el preentrenamiento continuado mejora tareas en japones respecto a `google/gemma-4-12B` usando el mismo conjunto de validacion.
- Investigacion en tecnicas LoRA sobre modelos multimodales: sirve como punto de partida para estudiar el efecto de fusionar adaptadores tras 1,0 epoca.
- Base para fine-tuning posterior: al ser pesos completos en safetensors, puede reutilizarse como inicializacion en tareas especificas (clasificacion, resumen, generacion guiada).
- Pruebas de pipelines multimodales imagen-texto: util para validar flujos de `AutoProcessor` + `AutoModelForMultimodalLM` antes de desplegar modelos mayores.
- Banco de comparacion de checkpoints: al formar parte de una serie (`top10-...`), permite evaluaciones comparativas entre variantes de un mismo experimento.
- Demostraciones de integracion con endpoints compatibles: util para verificar el despliegue del modelo en infraestructuras de inferencia gestionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso en precision completa: los safetensors suman aproximadamente 24,0 GB, coherente con unos 12.000 millones de parametros en bf16/fp16. Se necesita al menos esa cantidad de VRAM mas el overhead de activaciones y cache.
- Inferencia en bf16/fp16: estimacion de 26-32 GB de VRAM segun longitud de contexto; requiere GPU de clase A100 40 GB, H100 o similares.
- Cuantizacion a 8 bits: estimacion en torno a 13-16 GB de VRAM; viable en RTX 4090 (24 GB) o A6000.
- Cuantizacion a 4 bits: estimacion en torno a 7-10 GB de VRAM; podria caber en GPU de consumo como RTX 4080/4090, aunque no se ofrecen pesos cuantizados en el repositorio.
- Al no incluir el repo variantes GGUF/AWQ/GPTQ, el uso en `llama.cpp` u Ollama requeriria convertir los safetensors previamente.
- Despliegue: el autor muestra carga con Transformers; tambien puede servirse con TGI o vLLM si la version soporta `gemma4_unified`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `vosldtgbj/project-llm-cpt-1p0-top10-07-lora-06` | 11.959.730.176 | no disponible | apache-2.0 (+ terminos Gemma 4) | CPT con LoRA fusionado, 1,0 epoca, orientado a japones |
| `google/gemma-4-12B` (base) | ~12B (heredado) | no disponible | segun licencia Gemma 4 | Modelo original sin CPT adicional |
| Otras variantes de la serie Project LLM (`top10-...`) | no disponible | no disponible | apache-2.0 | No hay datos publicados de rendimiento |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes en el momento de la informacion; no ha pasado por una validacion de produccion conocida.
- No se documentan sesgos; al heredar del modelo base, arrastra los sesgos de este, agravados por un CPT orientado a japones que puede desequilibrar el comportamiento multilingue.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan datos de evaluacion que lo cuantifiquen.
- Longitud de contexto no documentada; el comportamiento con entradas largas no esta garantizado.
- Idiomas soportados no confirmados oficialmente; la etiqueta `japanese` puede implicar un sesgo hacia ese idioma y un peor desempeno en otros.
- La licencia apache-2.0 del repositorio convive con los terminos del modelo Gemma 4 de Google; el propio autor indica que el uso debe cumplir ambos, por lo que conviene revisar dichos terminos antes de un uso comercial.
- No se incluyen datos de optimizador, scheduler ni estados de reanudacion, por lo que no es posible continuar el entrenamiento tal cual.
- Requiere una version de Transformers que soporte `gemma4_unified`; versiones mas antiguas no podran cargarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vosldtgbj/project-llm-cpt-1p0-top10-07-lora-06
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Licencia indicada por el autor: https://ai.google.dev/gemma/docs/gemma_4_license
