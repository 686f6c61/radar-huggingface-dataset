# stuchapin/Maxwell-V1-Flash-W4A16-AutoRound

## Resumen

Maxwell-V1-Flash W4A16 AutoRound es una cuantización de 4 bits en pesos y 16 bits en activaciones del modelo base maxwell-model/Maxwell-V1-Flash, publicada por el usuario stuchapin. El modelo base es un transformer de tipo mezcla de expertos (MoE) con atención de bloques dispersa (block-sparse attention), 35.000 millones de parámetros totales y 3.000 millones de parámetros activos, según declara el autor de la model card. Esta versión cuantizada reduce el peso cargado a 20,24 GiB distribuidos en cinco shards de safetensors, lo que la hace viable en GPUs de 24 GB como la RTX 3090.

La relevancia de esta ficha es doble. Por un lado, documenta un proceso de cuantización reproducible con Intel AutoRound 0.16.1 (W4A16 simétrico, group size 128, 100 iteraciones de tuning y empaquetado auto_gptq), que cuantiza 32.571 de las 33.574 capas y mantiene en mayor precisión el `lm_head`, los indexadores de atención dispersa, las compuertas de enrutamiento (gates) y las capas de borrador MTP. Por otro, advierte de problemas prácticos de despliegue: el fork de vLLM necesario solo se distribuye como contenedor y presenta un fallo en el cargador de checkpoints empaquetados con AutoRound, además de no estar verificado en GPUs Ampere de consumo (SM86).

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el propio autor marca como pendientes las métricas de calidad (perplejidad en WikiText-2 frente a BF16, benchmark de flota de 30 tareas y verificación de servicio con vLLM). Se trata, por tanto, de un artefacto experimental y no de una release validada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con block-sparse attention y capas MTP (multi-token prediction); implementación custom `maxwell_moe` |
| Parámetros totales | 6.450.124.734 según safetensors del repo cuantizado; la model card del autor declara 35B totales para el modelo base |
| Parámetros activos | 3B (según model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A16 (INT4 en pesos, 16 bits en activaciones), simétrica, group size 128, empaquetado auto_gptq; 32.571 / 33.574 capas cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (5 shards), con código remoto `modeling_maxwell_moe.py` y `configuration_maxwell_moe.py` |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de mezcla de expertos con atención de bloques dispersa, según la descripción del autor. El checkpoint cuantizado conserva las capas de borrador MTP (multi-token prediction) en precisión original, lo que sugiere que el modelo base incorpora decodificación especulativa nativa mediante cabezas de predicción de tokens adicionales. La atención dispersa por bloques implica indexadores que seleccionan qué bloques atender, y estos indexadores también se mantienen sin cuantizar para preservar la selección de bloques.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La cuantización se realizó con Intel AutoRound 0.16.1 sobre un corpus de calibración estándar denominado "quant-lab", con 100 iteraciones de tuning y un pico de VRAM de 17,86 GiB durante el proceso, lo que permitió ejecutarla en una RTX 3090 de 24 GB. El autor no documenta la metodología de calibración más allá de esa referencia.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`, tag `conversational`).
- Razonamiento multi-paso y decodificación especulativa mediante las capas MTP conservadas en precisión original.
- Atención de bloques dispersa para reducir el coste computacional en contextos largos (la longitud exacta de contexto no está disponible).
- Ejecución con código remoto de Transformers (`trust_remote_code` obligatorio) y despliegue mediante el fork de vLLM del equipo Maxwell.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPU de consumo para experimentación: con 20,24 GiB de pesos cargados, el modelo cabe en una RTX 3090 o RTX 4090 de 24 GB, lo que permite probar un MoE de gran tamaño total en hardware de gama alta de consumo, aunque el autor advierte que el kernel rápido de atención dispersa no está verificado en SM86.
- Evaluación de técnicas de cuantización: sirve como caso de estudio reproducible de AutoRound W4A16 con group size 128 y empaquetado auto_gptq, útil para investigadores que comparen recetas de cuantización sobre arquitecturas MoE con atención dispersa.
- Servicio de generación de texto vía API compatible con OpenAI: el contenedor `maxwellmodel/vllm-openai:v0.30.0` expone un endpoint en el puerto 8000 con `--served-model-name Maxwell-V1.0-Flash`, adecuado para prototipos de asistentes conversacionales.
- Investigación sobre decodificación especulativa: las capas MTP sin cuantizar permiten estudiar el impacto de mantener en BF16 las cabezas de borrador frente a cuantizarlas, en pipelines de generación con aceptación de tokens especulativos.
- Pruebas de integración de código remoto en Transformers: el repo incluye `modeling_maxwell_moe.py` y `configuration_maxwell_moe.py`, por lo que es útil para validar flujos de carga con `trust_remote_code` en entornos controlados.
- Benchmarking de kernels de atención dispersa: permite medir la ruta de prefill con kernels rápidos documentados para SM90, SM100 y SM103 (Hopper y Blackwell) frente a la ruta genérica en otras arquitecturas.

## Benchmarks y rendimiento

El autor solo publica una verificación funcional y deja el resto de métricas como pendientes:

| Prueba | Resultado |
|---|---|
| Suite canary (7 prompts funcionales) | 7/7 superados |
| VRAM de pesos cargados | 20,24 GiB |
| Perplejidad WikiText-2 frente a BF16 | pendiente |
| Benchmark de flota (30 tareas, umbral 0,9) | pendiente |
| Verificación de servicio con vLLM | pendiente |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 20,24 GiB solo de pesos; hay que añadir la caché KV y el overhead del runtime, por lo que conviene reservar al menos 22-24 GiB.
- GPU recomendadas: el contenedor documenta kernels rápidos de atención dispersa para SM90, SM100 y SM103, es decir, Hopper (H100) y Blackwell. En Ampere de consumo (RTX 3090, SM86) el autor reporta `CUDA error: no kernel image is available` durante el profiling, sin verificación extremo a extremo.
- Cabe en GPU de consumo: sí en términos de memoria (RTX 3090 o RTX 4090 de 24 GB), pero la ruta de kernel rápido no está verificada en SM86; `VLLM_ENABLE_CUDA_COMPATIBILITY=1` no resuelve el problema porque afecta a la versión del driver, no a la arquitectura.
- Opciones de despliegue: exclusivamente el fork de vLLM del equipo Maxwell, distribuido como contenedor `maxwellmodel/vllm-openai:v0.30.0`, con `--trust-remote-code`, `--block-size 128` y `--tensor-parallel-size 1`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisito adicional: parche en `vllm/models/maxwell_v1_flash/common/linear.py`, función `MaxwellV1FlashQKVParallelLinear.weight_loader`, para escalar `shard_offset` y `shard_size` por el factor de empaquetado cuando `param.data.shape[output_dim] * 8 == sum(self.output_sizes)`; sin él se produce `IndexError` al cargar el primer shard no nulo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A continuación se resumen los datos estructurales conocidos frente a la referencia del propio modelo base:

| Modelo | Parámetros | Activos | Cuantización | VRAM de pesos | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Maxwell-V1-Flash W4A16 AutoRound | 6,45B según safetensors (35B declarados en la model card) | 3B | W4A16, group 128 | 20,24 GiB | Apache 2.0 | Fork de vLLM en contenedor |
| Maxwell-V1-Flash (base) | 35B declarados | 3B | BF16 | no disponible | Apache 2.0 | Fork de vLLM en contenedor |

Existe una discrepancia entre el recuento de safetensors del repo cuantizado (6.450.124.734 parámetros) y los 35B que declara la model card del autor; no se ha podido resolver con la información disponible y conviene verificarla antes de dimensionar el despliegue.

## Limitaciones y advertencias

- Métricas de calidad pendientes: no hay perplejidad, benchmark de flota ni verificación de servicio publicadas, por lo que no se puede afirmar que la cuantización preserve la calidad del modelo base.
- Fallo conocido del cargador de vLLM con checkpoints AutoRound empaquetados; requiere parche manual del código del fork.
- Sin verificación en GPUs Ampere de consumo (SM86); el error de kernel puede impedir la ejecución fuera de Hopper y Blackwell.
- Dependencia de código remoto (`trust_remote_code`) y de un fork propietario de vLLM distribuido solo como contenedor, lo que limita la auditabilidad y la portabilidad.
- Licencia Apache 2.0 heredada, que permite uso comercial, pero el autor no documenta restricciones adicionales ni términos de uso aceptable más allá de los del modelo base.
- Idiomas soportados no documentados: riesgo de comportamiento degradado en castellano u otros idiomas no verificados.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; artefacto experimental sin validación comunitaria.
- Discrepancia entre el recuento de parámetros del safetensors y el declarado en la model card, que afecta a las estimaciones de memoria y rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stuchapin/Maxwell-V1-Flash-W4A16-AutoRound
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Organización del modelo base: https://huggingface.co/maxwell-model
- Intel AutoRound: https://github.com/intel/auto-round
