# tiny-random/bagel

## Resumen

`tiny-random/bagel` es un checkpoint de depuracion (debugging) publicado en Hugging Face por el usuario `tiny-random`. No se trata de un modelo entrenado, sino de una reinicializacion aleatoria de dimensiones reducidas construida a partir de la configuracion de `ByteDance-Seed/BAGEL-7B-MoT`, el modelo multimodal de ByteDance. Su proposito es servir como fixture de integracion continua (CI) para `vllm-omni`, permitiendo probar pipelines de inferencia multimodal texto-a-imagen sin cargar el modelo completo de 7B.

El repositorio contiene unicamente pesos aleatorios con arquitectura escalada: el LLM y el ViT tienen una sola capa cada uno y dimensiones ocultas de 64, mientras que el VAE se mantiene a tamano completo porque su arquitectura esta codificada de forma fija en `vllm-omni` y no puede reducirse. El total de parametros reales en safetensors es de 104.364.579, con un tamano de repositorio de 0,4 GB.

Es relevante exclusivamente en el ambito de ingenieria de software: no produce resultados significativos de generacion y no debe confundirse con el modelo base BAGEL-7B-MoT, que es un modelo multimodal de produccion. Cualquier evaluacion de capacidades, calidad o rendimiento debe realizarse sobre el modelo original de ByteDance, no sobre esta version reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal transformer con LLM + ViT + conectores + VAE (arquitectura BAGEL, escalada a 1 capa por componente) |
| Parametros totales | 104.364.579 |
| Parametros activos | no disponible (el modelo base es MoE, pero esta version aleatoria no documenta parametros activos) |
| Longitud de contexto | 4096 tokens (segun `max_position_embeddings` en la configuracion del LLM) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 para LLM/ViT y float32 para VAE) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`ema.safetensors`, `ae.safetensors`) |

## Arquitectura y entrenamiento

El modelo replica la estructura de BAGEL-7B-MoT pero con dimensiones drasticamente reducidas. El componente `ema.safetensors` (~41 MB) contiene el LLM, el ViT y los conectores, cada uno con una sola capa, `hidden_size` de 64, `intermediate_size` de 128, 2 cabezas de atencion y 2 cabezas KV, con `head_dim` de 32. El componente `ae.safetensors` (~335 MB) contiene el VAE a tamano completo, con pesos en float32, ya que su arquitectura esta fijada en el codigo de `vllm-omni` y no admite reduccion.

No ha habido entrenamiento: los pesos se generan con `torch.randn` con semilla fija (42 para LLM/ViT y 43 para VAE) y escala 0.02, salvo las capas de normalizacion que se inicializan a unos. Los ficheros de tokenizer, `generation_config.json` y `preprocessor_config.json` se copian directamente del checkpoint original `ByteDance-Seed/BAGEL-7B-MoT`. El script de generacion (`scripts/create_tiny_bagel.py`) documenta el mapeo de reduccion de dimensiones y el recorte de capas.

## Capacidades

- Generacion de texto e imagen en un pipeline multimodal texto-a-imagen, pero con pesos aleatorios: las salidas no tienen significado semantico.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial: sirve como fixture de CI para validar el pipeline `BagelPipelineWithLogProb` de `vllm-omni`, incluyendo muestreo con `num_inference_steps` y escalas CFG (`cfg_text_scale`, `cfg_img_scale`).

## Casos de uso

- Pruebas de integracion continua en `vllm-omni`: ejecutar el pipeline completo de generacion texto-a-imagen en cada pull request sin descargar el modelo de 7B, validando que la orquestacion, el reparto entre GPUs y el manejo de memoria compartida funcionan.
- Validacion de configuraciones de despliegue multi-GPU: el ejemplo de uso referencia `bagel_sharedmemory_2gpu_ci.yaml`, por lo que sirve para comprobar el arranque en escenarios de dos GPUs con memoria compartida.
- Pruebas de regresion del cargador de pesos: al conservar los nombres de tensores del checkpoint original, permite verificar que el mapeo `weight_map` y la carga de safetensors siguen siendo compatibles tras refactorizaciones.
- Desarrollo de nuevas etapas del pipeline: al ser rapido de cargar, facilita iterar sobre `sampling_params_list`, argumentos extra de CFG y pasos de inferencia sin coste de computo relevante.
- Verificacion de compatibilidad de tokenizer y preprocessor: los ficheros copiados del modelo original permiten probar el flujo de tokenizacion y preprocesado de imagenes en aislamiento.
- Pruebas de humo (smoke tests) en entornos con recursos limitados: con 0,4 GB de repositorio y 104M de parametros, cabe en cualquier maquina de CI sin GPU dedicada de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, FID, CLIP score) careceria de sentido y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 104M de parametros en bfloat16/float32 y un VAE a tamano completo, el consumo es del orden de pocos GB, pero no se documenta una cifra exacta.
- GPU recomendadas: el ejemplo de uso apunta a un despliegue en 2 GPUs (`bagel_sharedmemory_2gpu_ci.yaml`), sin especificar modelos concretos.
- Cabe en GPU consumer: presumiblemente si, dado el reducido numero de parametros, aunque no hay confirmacion en la informacion disponible.
- Opciones de despliegue: `vllm-omni` mediante la clase `Omni` y el pipeline `examples.flowgrpo_trainer.vllm_omni.pipeline_bagel.BagelPipelineWithLogProb`. No se documentan otras opciones (llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tiny-random/bagel` | 104.364.579 | 4096 | Fixture de CI con pesos aleatorios | no disponible | Hugging Face |
| `ByteDance-Seed/BAGEL-7B-MoT` | 7B (MoE) | no disponible en la informacion proporcionada | Modelo multimodal texto-a-imagen de produccion | no disponible en la informacion proporcionada | Hugging Face |
| `zhengyuansu/bagel-tiny-random` | no disponible | no disponible | Variante tiny alternativa citada en el ejemplo de uso | no disponible | Hugging Face |

La comparacion relevante es unicamente con el modelo base: `tiny-random/bagel` no es una alternativa funcional a BAGEL-7B-MoT, sino una reduccion para pruebas. No se dispone de datos de otros modelos de la misma categoria para ampliar la tabla.

## Limitaciones y advertencias

- Los pesos son aleatorios: no generan texto ni imagenes coherentes; cualquier uso en produccion o evaluacion de calidad es invalido.
- No es un modelo entrenado: no ha pasado por preentrenamiento, RLHF ni DPO, por lo que no tiene capacidades reales de razonamiento, codigo o matematicas.
- El VAE se mantiene a tamano completo, de modo que el ahorro de recursos no es proporcional al numero de parametros del LLM/ViT.
- La licencia no esta declarada en la informacion disponible; no se puede asumir uso comercial sin consultar el modelo base.
- El contexto esta fijado en 4096 tokens en la configuracion, muy inferior al del modelo original.
- No debe citarse como sustituto de BAGEL-7B-MoT en articulos, comparativas o decisiones de arquitectura.
- Depende de una version concreta de `vllm-omni` y de un pipeline custom (`BagelPipelineWithLogProb`); cambios en la libreria pueden romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiny-random/bagel
- Modelo base: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Variante tiny alternativa citada: https://huggingface.co/zhengyuansu/bagel-tiny-random
- Perfil del contribuidor: https://huggingface.co/zhengyuansu
