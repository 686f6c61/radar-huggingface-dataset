# vllm-project/qwen_1.5-moe-a2.7b-mxfp4

## Resumen

`vllm-project/qwen_1.5-moe-a2.7b-mxfp4` es una copia de un checkpoint derivado del modelo Qwen1.5-MoE-A2.7B, cuantizado en formato MXFP4 (microscaling FP4, 4 bits con escalas compartidas) y publicado por el equipo de vLLM para uso interno de su infraestructura de integración continua. No es un modelo entrenado desde cero, sino una conversión de pesos del modelo original de Alibaba Cloud (familia Qwen1.5) a un formato de cuantización de bajo ancho de bit compatible con las rutas de cómputo MXFP4 en GPUs recientes.

El modelo subyacente es un transformer con arquitectura Mixture-of-Experts (MoE) de 7.470.680.064 parámetros totales, de los cuales solo una fracción (2.700 millones, según la nomenclatura "A2.7B") se activa por token. Esa dispersión permite obtener la calidad de un modelo de ~7B con el coste de inferencia de uno de ~2,7B, lo que lo hace atractivo para despliegues con restricciones de VRAM o de throughput.

La relevancia actual de este checkpoint es doble: por un lado, sirve como referencia práctica de cómo se empaqueta un MoE de Qwen en MXFP4 para servirlo con vLLM; por otro, su licencia MIT y su reducido tamaño en disco (8,5 GB) lo convierten en un candidato razonable para prototipos en hardware consumer moderno. No obstante, al ser una copia de CI, no debe tratarse como un artefacto con garantías de mantenimiento ni de soporte por parte de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen2_moe) |
| Parametros totales | 7.470.680.064 |
| Parametros activos | ~2.700 millones (según nomenclatura A2.7B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, microscaling); repo etiquetado como 8-bit / quark |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantización MXFP4) |

## Arquitectura y entrenamiento

La arquitectura es `qwen2_moe`, es decir, un transformer decoder-only con capas de mezcla de expertos en las proyecciones feed-forward. Cada token activa un subconjunto de expertos (enrutamiento top-k), de modo que el coste computacional por token corresponde a unos 2.700 millones de parámetros aunque el modelo almacene 7.470 millones. Esta separación entre parámetros totales y activos es la característica definitoria del diseño y la razón por la que el checkpoint cabe en 8,5 GB tras cuantización.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo fases de RLHF o DPO en la información proporcionada. Lo que sí está documentado es el proceso de cuantización: los pesos originales se convierten a MXFP4, un esquema de 4 bits con bloques de escala compartida (microscaling) que reduce el error de cuantización respecto a FP4 uniforme y está pensado para aceleración nativa en GPUs Blackwell y en las rutas de vLLM que lo soportan. El repo incluye la etiqueta `quark`, lo que sugiere que la conversión se realizó con el toolkit Quark de AMD, aunque no se detalla en la model card.

## Capacidades

- Generación de texto autoregresiva en modo decoder-only.
- Razonamiento y respuesta a instrucciones, heredados del modelo base Qwen1.5-MoE-A2.7B.
- Generación de código y matemáticas a nivel de modelo de ~7B (no verificado con benchmarks en la información disponible).
- Soporte multilingüe: no confirmado en la información proporcionada; el modelo base Qwen1.5 es multilingüe, pero este checkpoint no declara idiomas.
- Tool calling y function calling: no documentado en este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Servicio de inferencia con vLLM en GPUs Blackwell: el checkpoint está pensado precisamente para las rutas MXFP4 de vLLM, por lo que es adecuado para validar throughput y latencia de un MoE cuantizado en ese backend.
- Prototipado en una sola GPU consumer de gama alta: con 8,5 GB de pesos, el modelo cabe en GPUs de 16-24 GB y permite experimentar con un MoE real sin infraestructura de datacenter.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad de MXFP4 frente a FP16/BF16 o GGUF Q4 en tareas de generación y razonamiento.
- Generación de texto asistida en local: para asistentes de escritorio o herramientas CLI que requieran un modelo de ~7B con licencia permisiva y sin dependencia de API externa.
- Investigación sobre enrutamiento de expertos: al ser un MoE abierto con pesos inspeccionables, permite estudiar patrones de activación de expertos y su relación con el dominio del prompt.
- Integración en pipelines de CI de motores de inferencia: es su propósito declarado; útil para tests de regresión de kernels MXFP4 y de carga de checkpoints cuantizados.
- Base para fine-tuning con QLoRA sobre las partes no cuantizadas: no recomendado sin validación previa, ya que la cuantización MXFP4 complica el entrenamiento directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~9-10 GB solo para pesos en MXFP4; añadir KV cache y overhead del runtime (típicamente 2-6 GB adicionales según contexto y batch).
- GPU recomendadas: Blackwell (B200, RTX 50xx) para aprovechar las rutas MXFP4 nativas; en Ampere/Ada (A100, H100, RTX 4090) la cuantización puede requerir de-cuantización en el kernel y perder parte de la ventaja.
- Cabe en GPU consumer: sí, en tarjetas con 16 GB o más (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090) siempre que el backend soporte MXFP4.
- Opciones de despliegue: vLLM (soporte principal, es el propósito del checkpoint); llama.cpp/Ollama requerirían conversión a GGUF, no incluida en el repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| qwen_1.5-moe-a2.7b-mxfp4 (este) | 7,47 B | ~2,7 B | no disponible | MIT | safetensors MXFP4 |
| Qwen1.5-MoE-A2.7B (original) | 14,3 B | 2,7 B | 32 K (según documentación pública de Qwen) | Apache 2.0 (original) | safetensors BF16 |
| Mistral 7B Instruct | 7,2 B | 7,2 B (denso) | 32 K | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-7B | 7,6 B | 7,6 B (denso) | 128 K | Apache 2.0 | safetensors, GGUF |

Nota: los datos del original y de los comparables provienen de conocimiento general de la familia Qwen y no de la información proporcionada en esta ficha; verificar antes de usarlos en producción. La discrepancia entre los 7,47 B del checkpoint y los 14,3 B del original publicados por Alibaba sugiere que el conteo del repo puede corresponder a una variante reducida o a un recuento parcial; conviene validarlo con `safetensors` metadata antes de dimensionar hardware.

## Limitaciones y advertencias

- Es una copia de CI: el autor advierte que el checkpoint se mantiene solo para reducir riesgo de cadena de suministro, sin compromiso de mantenimiento ni actualizaciones.
- La model card no documenta sesgos, datos de entrenamiento ni evaluación de seguridad; no hay base para afirmar que el modelo sea seguro en producción.
- Riesgo de alucinación inherente a modelos de ~7B y potencialmente agravado por la cuantización a 4 bits.
- La cuantización MXFP4 puede degradar tareas sensibles a precisión (matemáticas, código, razonamiento numérico); no hay benchmarks publicados que cuantifiquen esa pérdida.
- Idiomas soportados no declarados: no asumir multilingüismo sin validación empírica.
- Longitud de contexto no disponible en este repo; el modelo base Qwen1.5-MoE soporta 32 K según documentación pública, pero no está confirmado aquí.
- Licencia MIT permite uso comercial, pero el modelo subyacente Qwen1.5 se distribuye bajo Apache 2.0; conviene revisar la compatibilidad de licencias si se redistribuye.
- El soporte de MXFP4 depende del backend y del hardware; en GPUs sin aceleración nativa el rendimiento puede ser peor que un GGUF Q4 estándar.
- No usar como base para fine-tuning sin verificar previamente la compatibilidad del formato cuantizado con el framework de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/vllm-project/qwen_1.5-moe-a2.7b-mxfp4
- Checkpoint original copiado: https://huggingface.co/fxmarty/qwen_1.5-moe-a2.7b-mxfp4
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Modelo base Qwen1.5-MoE-A2.7B: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B
