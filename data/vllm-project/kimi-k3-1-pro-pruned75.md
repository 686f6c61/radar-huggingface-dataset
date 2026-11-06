# vllm-project/Kimi-K3.1-Pro-pruned75

## Resumen

Kimi-K3.1-Pro-pruned75 es un checkpoint derivado de moonshotai/Kimi-K3.1-Pro, publicado por el equipo de vLLM, en el que se han eliminado el 75% de los expertos enrutados de cada capa MoE mediante poda por magnitud sin calibracion. El modelo conserva la torre de vision, los expertos compartidos, la capa densa y la atencion del modelo original, pero reduce los expertos enrutados de 896 a 224 en las 92 capas MoE, lo que rebaja el peso del repositorio de aproximadamente 1,5 TB a unos 443 GB. Su proposito declarado es servir como banco de pruebas para despliegues en vLLM con menos GPUs y para smoke tests de evaluacion, no para uso en produccion sensible a la calidad.

La relevancia de esta publicacion es fundamentalmente practica: demuestra el flujo de trabajo de poda de expertos integrado en compressed-tensors y permite a equipos con hardware limitado experimentar con la arquitectura Kimi K3.1 Pro sin necesidad de aprovisionar un cluster de gran escala. El autor advierte explicitamente de una regresion de calidad importante frente al modelo fuente.

Al tratarse de un checkpoint podado y no de un modelo entrenado desde cero, sus especificaciones de contexto, tokenizador, licencia e idiomas heredan las del modelo base, si bien la informacion disponible en esta ficha no detalla esos valores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), con torre de vision; modulo `block_sparse_moe` en 92 capas |
| Parametros totales | 737.611.524.480 (~737,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en los expertos enrutados (cuantizacion original conservada); tag 8-bit en el repo; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (licencia propia del modelo base, categoria "other") |
| Formato de pesos | safetensors (con compressed-tensors); requiere `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo es un transformer MoE multimodal (pipeline image-text-to-text) con una torre de vision y capas de mezcla de expertos dispersas (`block_sparse_moe`). Cada capa MoE del modelo fuente contenia 896 expertos enrutados; tras la poda quedan 224, es decir, un 75% menos, en las 92 capas MoE del modelo. La seleccion de expertos se hizo por norma L1 de la fila del router correspondiente (`router.weight[i].abs().sum()`), calculada de forma independiente por capa, sin datos de calibracion. Se eliminaron los tensores de los expertos podados, las filas correspondientes de `gate.weight` y las entradas de `gate.e_score_correction_bias`; los indices de experto se renumeraron y `text_config.num_experts` se fijo en 224.

No hubo reentrenamiento ni ajuste fino posterior a la poda: la atencion, los expertos compartidos, la capa densa, la torre de vision y la cuantizacion MXFP4 original de los expertos enrutados permanecen intactos. La herramienta empleada es el conversor `MagnitudeExpertPruner` de compressed-tensors, ejecutado en CPU. Al no usar calibracion, la poda es barata computacionalmente pero agresiva en terminos de calidad, tal como advierte el propio autor.

## Capacidades

- Generacion de texto y modelado de lenguaje, heredados del modelo base Kimi-K3.1-Pro.
- Procesamiento de imagenes y texto (pipeline image-text-to-text), gracias a la torre de vision conservada.
- Soporte de tool calling y function calling en vLLM mediante `--enable-auto-tool-choice` y el parser `kimi_k3`.
- Soporte de razonamiento con modo de pensamiento, mediante el parser `--reasoning-parser kimi_k3`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades matematicas y de codigo: presumiblemente heredadas del modelo base, aunque degradadas por la poda; no hay datos que lo cuantifiquen.

## Casos de uso

- Smoke tests de despliegue en vLLM: el modelo permite validar configuraciones de serving (tensor parallelism, parsers de tool calling y reasoning) con un peso de 443 GB en lugar de 1,5 TB, reduciendo el numero de GPUs necesarias.
- Evaluacion de pipelines de poda: sirve para comprobar de extremo a extremo el conversor `MagnitudeExpertPruner` de compressed-tensors y verificar que los checkpoints podados cargan correctamente.
- Investigacion sobre degradacion por poda: al no tener calibracion, es un punto de referencia util para medir cuanto pierde un MoE al eliminar el 75% de sus expertos enrutados frente al modelo original.
- Pruebas de integracion de tool calling: permite desarrollar y depurar agentes que usan el parser `kimi_k3` sin consumir los recursos del modelo completo.
- Validacion de infraestructura multimodal: al conservar la torre de vision, se puede probar el pipeline image-text-to-text en entornos de laboratorio con presupuesto de GPU limitado.
- Benchmarking de throughput y latencia en configuraciones reducidas: util para estimar el coste de servir un MoE de gran tamano antes de escalar al modelo fuente.
- Desarrollo de harness de evaluacion: sirve como modelo de sustitucion en CI para pruebas que no requieren calidad de salida, solo conformidad de formato y API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica unicamente que debe esperarse una regresion de calidad importante respecto al modelo fuente, sin cuantificarla.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa aproximadamente 443 GB en pesos MXFP4/8-bit; la inferencia requiere al menos ese orden de magnitud de memoria agregada, repartida entre GPUs.
- El ejemplo oficial de serving usa `--tensor-parallel-size 4`, lo que implica un minimo de 4 GPUs de gran memoria (por ejemplo, H100 80 GB o A100 80 GB) para repartir los ~443 GB de pesos.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU convencional.
- Opciones de despliegue: vLLM es el motor soportado oficialmente, con `--trust-remote-code`, `--enable-auto-tool-choice`, `--tool-call-parser kimi_k3` y `--reasoning-parser kimi_k3`. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos enrutados por capa | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vllm-project/Kimi-K3.1-Pro-pruned75 | ~737,6 B | 224 (podados desde 896) | no disponible | kimi-k3.1-pro | Hugging Face, ~443 GB |
| moonshotai/Kimi-K3.1-Pro (fuente) | no disponible en esta ficha | 896 | no disponible | kimi-k3.1-pro | Hugging Face, ~1,5 TB |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es con el modelo fuente: misma arquitectura, misma licencia y misma torre de vision, pero con un 75% menos de expertos enrutados y un tercio del tamano en disco, a costa de una perdida de calidad no cuantificada.

## Limitaciones y advertencias

- Regresion de calidad importante y explicitamente advertida por el autor frente a moonshotai/Kimi-K3.1-Pro; no apto para uso sensible a la calidad.
- Poda sin calibracion basada solo en la norma L1 del router: el criterio es heuristico y no tiene en cuenta la contribucion funcional real de cada experto.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredarian los del modelo base.
- Riesgo de alucinacion: presumiblemente elevado respecto al modelo fuente por la perdida de capacidad, aunque no cuantificado.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: sujeta a la licencia Kimi K3.1 Pro del modelo base; es necesario revisar el texto de la licencia antes de cualquier uso comercial.
- Requiere `trust_remote_code` y codigo personalizado (`custom_code`), lo que implica ejecutar codigo del repositorio.
- El checkpoint esta pensado para smoke tests y evaluacion, no como sustituto del modelo original en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-project/Kimi-K3.1-Pro-pruned75
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Repositorio compressed-tensors: https://github.com/vllm-project/compressed-tensors
