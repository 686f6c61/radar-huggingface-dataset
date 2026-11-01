# vllm-project/Kimi-K3-8L-dummy

## Resumen

Kimi-K3-8L-dummy es un checkpoint de pruebas publicado por el equipo de vLLM (organización `vllm-project` en HuggingFace) a partir de una copia del repositorio original de `riverclouds/Kimi-K3-8L-dummy`. No es un modelo entrenado ni utilizable para inferencia real: se trata de una variante *config-only* de `moonshotai/Kimi-K3` que conserva únicamente la configuración de arquitectura, el tokenizador, el procesador y el código remoto, pero no contiene pesos. Su función es permitir a los motores de inferencia (principalmente vLLM) ejercitar la arquitectura real de Kimi-K3 a una escala reducida.

La relevancia es puramente de ingeniería: Kimi-K3 es un modelo de gran tamaño con una arquitectura híbrida que combina atención lineal KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention) en una proporción 3:1, además de capas MoE. Probar un motor de inferencia contra el modelo completo es costoso; este dummy reduce la profundidad de 93 a 8 capas manteniendo el resto de parámetros de configuración intactos, lo que permite validar la disposición del KV-cache, la planificación de peticiones, el prefix caching y la carga de código personalizado con un coste mínimo.

El modelo se distribuye bajo la licencia Kimi K3 de Moonshot AI y se mantiene en la organización de vLLM para reducir el riesgo de cadena de suministro, ya que el original residía en una cuenta personal. Cualquier salida generada con este checkpoint carece de significado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal KDA + MLA y capas MoE (configuración de Kimi-K3) |
| Parametros totales | no disponible (checkpoint sin pesos; solo configuración) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de `max_position_embeddings` de Kimi-K3, valor no especificado en la información) |
| Tipos de cuantizacion | no disponible (sin pesos que cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3-license (Kimi K3 License de Moonshot AI) |
| Formato de pesos | no disponible (el repositorio no contiene pesos; tamaño de 0.0 GB) |

## Arquitectura y entrenamiento

El checkpoint replica la configuración de `moonshotai/Kimi-K3` con tres únicos campos modificados en `text_config`: `num_hidden_layers` pasa de 93 a 8, `linear_attn_config.kda_layers` se reduce a `[1, 2, 3, 5, 6, 7]` y `linear_attn_config.full_attn_layers` a `[4, 8]`. Con ello se preserva la proporción 3:1 entre capas de atención lineal KDA y capas de atención completa MLA, y se mantiene una capa de atención completa en la última posición, igual que en el modelo original. El resto de campos de configuración, incluidos `max_position_embeddings`, `auto_map` y `vision_config`, se copian sin cambios, y el tokenizador, el procesador, la configuración de generación y los ficheros de código remoto se reproducen literalmente del repositorio oficial.

No ha habido entrenamiento: el modelo se carga con pesos aleatorios mediante `--load-format dummy` en vLLM. Por tanto, no existen datos sobre tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO. La innovación técnica que se ejercita es la propia arquitectura de Kimi-K3: la combinación de KDA (atención lineal) con MLA (atención latente con compresión de KV) y capas MoE, junto con la disposición de KV-cache que dicha mezcla implica.

## Capacidades

- Ninguna capacidad funcional real: el checkpoint no contiene pesos y sus salidas son aleatorias y sin significado.
- Sirve para validar la carga de arquitecturas con `trust_remote_code` y `auto_map` personalizado en motores de inferencia.
- Permite ejercitar la disposición de KV-cache de una arquitectura híbrida KDA + MLA.
- Permite probar la planificación (*scheduling*) de peticiones y el *prefix caching* sobre la arquitectura real de Kimi-K3.
- Permite validar el reparto en tensor parallel (el ejemplo de uso emplea `--tensor-parallel-size 4`).
- No soporta tool calling, agentes, razonamiento ni capacidades multilingües verificables, al no existir pesos entrenados.

## Casos de uso

- Integración continua de vLLM: el repositorio se mantiene precisamente para que el CI de vLLM cargue el checkpoint y detecte regresiones en el soporte de la arquitectura Kimi-K3 sin depender de una cuenta personal.
- Desarrollo de kernels de atención: permite probar implementaciones de KDA y MLA contra una configuración realista sin reservar GPUs para el modelo completo.
- Validación de KV-cache y *prefix caching*: al conservar la mezcla de capas lineales y de atención completa, se puede verificar el comportamiento del caché en escenarios híbridos.
- Pruebas de *scheduling* y batching: útil para comprobar cómo el planificador de un motor reparte peticiones entre capas MoE y de atención con distintas características.
- Verificación de carga de código remoto: sirve para comprobar que `auto_map`, tokenizador y procesador se resuelven correctamente con `trust_remote_code`.
- Pruebas de despliegue multi-GPU: el ejemplo oficial usa tensor parallel de 4, lo que permite validar la comunicación entre GPUs y el reparto de capas con un coste mínimo.
- Depuración de pipelines de conversión de pesos: útil como esqueleto para comprobar que un script de conversión genera tensores con las formas esperadas antes de ejecutarlo sobre el modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El checkpoint no contiene pesos entrenados, por lo que cualquier métrica de calidad sería inaplicable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no contener pesos, el consumo depende de los pesos aleatorios generados en tiempo de carga con `--load-format dummy`, que no se especifican en la información.
- GPU recomendadas: no disponibles. El ejemplo oficial emplea `--tensor-parallel-size 4`, lo que sugiere un despliegue multi-GPU, pero no se indican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: vLLM es el motor de referencia (comando `vllm serve` con `--trust-remote-code` y `--load-format dummy`). No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos | Licencia | Propósito |
|---|---|---|---|---|---|
| vllm-project/Kimi-K3-8L-dummy | no disponible (config-only) | no disponible | No | kimi-k3-license | Pruebas de motores de inferencia |
| moonshotai/Kimi-K3 | no disponible en la información | no disponible | Sí | kimi-k3-license | Modelo real de producción |
| riverclouds/Kimi-K3-8L-dummy | no disponible (config-only) | no disponible | No | kimi-k3-license | Origen del checkpoint copiado |

No se dispone de información sobre otros checkpoints dummy comparables de la misma categoría.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos y sus salidas son aleatorias; no debe desplegarse en producción ni evaluarse por calidad.
- No se han publicado datos sobre sesgos, alucinación o comportamiento lingüístico, y no tendría sentido medirlos en este checkpoint.
- La licencia Kimi K3 (kimi-k3-license) condiciona el uso; debe revisarse el fichero LICENSE del repositorio antes de cualquier redistribución.
- El checkpoint depende de código remoto (`auto_map` y ficheros copiados del repositorio oficial), por lo que requiere `--trust-remote-code` y revisión del código antes de ejecutarlo en entornos sensibles.
- La configuración solo modifica tres campos de `text_config`; cualquier cambio futuro en la configuración oficial de Kimi-K3 no se reflejará automáticamente en esta copia.
- El repositorio ocupa 0.0 GB, lo que confirma la ausencia de pesos; no debe interpretarse como un modelo ligero optimizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vllm-project/Kimi-K3-8L-dummy
- Repositorio original del dummy: https://huggingface.co/riverclouds/Kimi-K3-8L-dummy
- Modelo base oficial: https://huggingface.co/moonshotai/Kimi-K3
- Licencia (fichero LICENSE del repositorio): https://huggingface.co/vllm-project/Kimi-K3-8L-dummy/blob/main/LICENSE
