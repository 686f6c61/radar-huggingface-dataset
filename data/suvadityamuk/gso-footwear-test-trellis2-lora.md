# suvadityamuk/gso-footwear-test-trellis2-lora

## Resumen

El modelo `suvadityamuk/gso-footwear-test-trellis2-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario suvadityamuk sobre `microsoft/TRELLIS.2-4B`, un modelo generativo de imagen a 3D. El adaptador actúa especificamente sobre el submodelo de flujo de estructura dispersa (`ss_flow_img_dit_1_3B_64_bf16`) del pipeline TRELLIS.2, un transformer de difusion de aproximadamente 1,3 mil millones de parametros que genera la estructura dispersa (sparse structure) a partir de una imagen de entrada.

El adaptador se ha entrenado con la herramienta `trellis2-train` sobre el dataset `suvadityamuk/gso-footwear-test-trellis2-latents`, un conjunto de latentes derivado de objetos de calzado (footwear) del GSO (Google Scanned Objects). Se trata, por tanto, de un experimento de fine-tuning orientado a un dominio muy concreto: la generacion de estructuras 3D de calzado a partir de imagenes.

Por su naturaleza, no es un modelo de lenguaje ni un modelo generalista: es un artefacto de investigacion de 0,1 GB, con rango 8 y alpha 16, entrenado durante solo 20 pasos con batch efectivo 4 y learning rate 1e-4. Su relevancia es limitada fuera del contexto de experimentacion con TRELLIS.2 y fine-tuning de flujos de difusion 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un DiT (diffusion transformer) de flujo de estructura dispersa de TRELLIS.2 |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 8; el modelo base TRELLIS.2-4B declara 4B en su nombre) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base usa bf16 en el checkpoint referenciado) |
| Idiomas soportados | No disponible (tarea imagen a 3D, no linguistica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`ss_lora/adapter-<step>.safetensors`, cada 10 pasos) |

## Arquitectura y entrenamiento

El adaptador se inyecta en el submodelo `ss_flow_img_dit_1_3B_64_bf16` de TRELLIS.2, que forma parte de un pipeline de generacion 3D basado en flujos de difusion sobre estructuras dispersas. La tecnica LoRA aplica matrices de baja dimensionalidad (rango 8, alpha 16) sobre las proyecciones de atencion y las capas MLP del transformer: los modulos objetivo declarados son `to_qkv`, `to_out`, `to_q`, `to_kv`, `mlp.mlp.0` y `mlp.mlp.2`.

El entrenamiento se realizo con `trellis2-train` sobre el dataset de latentes `suvadityamuk/gso-footwear-test-trellis2-latents`, con 20 pasos a batch 1 x 4 (batch efectivo 4) y learning rate 1e-4. Se guardan checkpoints cada 10 pasos. No se documentan en la informacion disponible detalles sobre composicion del dataset, numero de tokens o imagenes, uso de RLHF/DPO ni innovaciones tecnicas adicionales. La carga requiere inyectar un `peft.LoraConfig` con los parametros indicados mediante `inject_adapter_in_model` y cargar los pesos con `set_peft_model_state_dict`.

## Capacidades

- Generacion de estructura 3D dispersa a partir de imagenes, heredada del pipeline TRELLIS.2, especializada mediante fine-tuning en objetos de calzado.
- Adaptacion de dominio: el LoRA modula el flujo de estructura dispersa para el subconjunto de calzado del dataset GSO.
- Integracion con PEFT: compatible con el ecosistema `peft` para inyeccion y carga de adaptadores.
- No soporta tool calling ni function calling (no es un modelo linguistico).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision general ni audio; su entrada es imagen y su salida es estructura 3D.

## Casos de uso

- Experimentacion academica con fine-tuning de flujos de difusion 3D: permite reproducir y extender el entrenamiento LoRA sobre TRELLIS.2 usando el script `trellis2-train` y el dataset de latentes publicado.
- Generacion de mallas de calzado a partir de fotografias: el adaptador especializa el flujo de estructura dispersa en objetos de calzado, adecuado para prototipado en diseno de producto.
- Creacion de catalogos 3D para comercio electronico: a partir de imagenes de producto se puede generar geometria 3D de zapatos para visores o configuradores.
- Investigacion sobre adaptacion de dominio con pocos pasos: con solo 20 pasos de entrenamiento, sirve como caso de estudio de LoRA de bajo coste en modelos generativos 3D.
- Benchmarking de pipelines imagen a 3D: util como punto de comparacion frente al modelo base sin adaptador en tareas de reconstruccion de calzado.
- Docencia y demos de PEFT en vision 3D: el reducido tamano del adaptador (0,1 GB) facilita su uso en entornos con recursos limitados para ilustrar la inyeccion de LoRA en un DiT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,1 GB, por lo que su almacenamiento es trivial.
- La inferencia requiere cargar el modelo base `microsoft/TRELLIS.2-4B`, cuyo requisito de VRAM no se detalla en la informacion disponible; por el nombre del checkpoint (4B) se estima que no cabe en GPUs de consumo con menos de 16-24 GB en bf16, aunque este dato no esta confirmado.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Despliegue: mediante el ecosistema `peft` (inyeccion con `inject_adapter_in_model` y carga con `set_peft_model_state_dict`) sobre el pipeline TRELLIS.2; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo imagen a 3D).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suvadityamuk/gso-footwear-test-trellis2-lora | LoRA r=8 sobre base de ~1,3B (submodelo ss_flow) | No disponible | Imagen a 3D (calzado) | No disponible | Hugging Face |
| microsoft/TRELLIS.2-4B (modelo base) | 4B (segun nombre) | No disponible | Imagen a 3D general | No disponible | Hugging Face |
| Otros adaptadores LoRA de imagen a 3D | No disponible | No disponible | Imagen a 3D | No disponible | No disponible |

No se dispone de informacion sobre alternativas comparables con datos verificables de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Entrenamiento muy corto (20 pasos, batch efectivo 4): el adaptador puede estar infraajustado y no generalizar fuera del dominio de calzado del dataset GSO.
- Dominio restringido a objetos de calzado; su uso en otras categorias de objetos no esta validado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; ademas, la licencia del modelo base `microsoft/TRELLIS.2-4B` condiciona el uso del adaptador.
- Riesgo de artefactos y geometrias incorrectas en la salida 3D, inherente a los flujos de difusion con pocos pasos de ajuste.
- Sin datos de benchmarks ni evaluacion cuantitativa publicada; no hay evidencia de mejora frente al modelo base.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- No es un modelo linguistico: no admite prompts de texto, tool calling ni razonamiento; cualquier expectativa en ese sentido es erronea.
- Los checkpoints se guardan cada 10 pasos, lo que limita la granularidad para seleccionar el mejor punto de ajuste.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/suvadityamuk/gso-footwear-test-trellis2-lora
- Modelo base: https://huggingface.co/microsoft/TRELLIS.2-4B
- Dataset de latentes: https://huggingface.co/datasets/suvadityamuk/gso-footwear-test-trellis2-latents
