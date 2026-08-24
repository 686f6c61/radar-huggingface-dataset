# TheDrainFlorist/gemma-4-26b-a4b-it-VQ-6.2bpw

## Resumen

Este artefacto es una cuantización por vector quantization (VQ) del modelo multimodal `google/gemma-4-26b-a4b-it`, desarrollada por TheDrainFlorist para ejecutarse en Apple Silicon mediante MLX. El objetivo declarado es ofrecer calidad equivalente al modelo en bf16 (48 GiB) ocupando solo 18,7 GiB, es decir, un 39 % del tamaño original, manteniendo además la torre de visión. Según las mediciones del autor, en una evaluación ciega de continuaciones literarias frente a bf16, un juez no pudo distinguir estadísticamente ambos modelos (p = 0,058), con un 43 % de empates.

El modelo base es un MoE de 128 expertos con routing top-8, 26 000 millones de parámetros totales y aproximadamente 4 000 millones de activos por token (según la nomenclatura "a4b"). Esta versión cuantizada aplica VQ solo a los expertos (que suponen ~90 % de los pesos) con d=2 y K=2048, empaquetando 5,75 bits por peso, mientras que el resto de componentes (attention, router, embeddings y MLP denso) se mantienen en 8 bits. El resultado es un checkpoint de 18,7 GiB que cabe en equipos con 32 GB de RAM y alcanza ~48 tokens/s de decodificación en un M4 Max.

La relevancia de este lanzamiento radica en que demuestra que la cuantización vectorial puede acercarse al techo práctico de fidelidad de un MoE grande (el autor sitúa ese techo en ~80 % de acuerdo top-1 con bf16, debido a la sensibilidad del routing), y lo hace en un formato nativo para el ecosistema MLX, sin necesidad de parches en `mlx-lm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 128 expertos, routing top-8, multimodal (imagen-texto a texto) |
| Parametros totales | 26 000 millones (modelo original); checkpoint cuantizado con 5 537 198 670 elementos en safetensors |
| Parametros activos | 4 000 millones (nominal, segun nombre "a4b"; SiliconFlow reporta 3,8 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | VQ (vector quantization) a 6,2 bpw nominal; expertos a 5,75 bits/peso (d=2, K=2048), resto a 8 bits |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (licencia de Google Gemma) |
| Formato de pesos | safetensors (MLX), con runtime VQ incluido como `model.py` en el checkpoint |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 128 expertos y routing top-8, diseñado por Google DeepMind para razonamiento avanzado y flujos agénticos. Esta versión no altera la arquitectura original, sino que reemplaza los pesos de los expertos por codebooks vectoriales: cada peso se cuantiza con d=2 y K=2048, lo que equivale a 5,75 bits por peso empaquetado. El resto de capas (attention, router, embeddings y el MLP denso por capa) se mantienen en 8 bits. El autor justifica la elección de d=2 frente a d=4 porque, a d=4, cada incremento de 0,25 bpw duplicaría el codebook, saturando la calidad cerca de 3,5 bpw; reducir la dimensión permite gastar más bits por peso y acercarse al techo de fidelidad.

No se proporcionan detalles del entrenamiento original del modelo base (composición del dataset, número de tokens, uso de RLHF/DPO). La model card sí documenta el proceso de verificación de esta cuantización: cada tensor se decodificó desde el artefacto publicado y se comparó contra la fuente bf16, garantizando que ningún tensor supere 3 veces el error de reconstrucción mediano del propio artefacto. Este control detectó corrupción silenciosa durante el desarrollo y se mantiene como puerta de calidad.

## Capacidades

- Generacion de texto en ingles con calidad literaria de largo formato: el autor valida continuaciones de 2 500+ palabras indistinguibles de bf16 en juicios ciegos.
- Multimodal: incluye la torre de vision del modelo base (356 tensores, +1,07 GiB), permitiendo entrada de imagen y texto con salida de texto.
- Razonamiento y flujos agénticos: el modelo base esta disenado para tareas de razonamiento multi-paso y uso de herramientas, aunque esta cuantizacion no documenta soporte explicito de tool calling.
- Conversacion multi-turno: el pipeline declarado es `image-text-to-text`, orientado a dialogos con contexto visual.
- Ejecucion nativa en Apple Silicon via MLX, sin parches externos; el runtime VQ viaja dentro del checkpoint.

## Casos de uso

- Generacion literaria asistida: escritores y editores pueden usar el modelo para continuar pasajes en estilos especificos (p. ej., "en la voz de Austen") con coherencia sostenida durante miles de palabras, gracias a la fidelidad medida frente a bf16.
- Analisis de documentos con imagenes: al conservar la torre de vision, permite extraer texto o resumir contenido de capturas, diagramas o fotografias en flujos de trabajo sobre Apple Silicon.
- Prototipado de agentes conversacionales: desarrolladores que trabajan con MLX pueden integrar este checkpoint en pipelines de chat multi-turno sin necesidad de infraestructura GPU dedicada, usando una maquina con 32 GB de RAM.
- Evaluacion de calidad de cuantizacion: investigadores interesados en VQ pueden reproducir las metricas de KL y juicio ciego publicadas, o comparar este artefacto con otras cuantizaciones del mismo modelo base.
- Despliegue local en entornos con restriccion de memoria: con un pico de 17,7 GiB en inferencia, cabe en portatiles de gama alta (M4 Max, M3 Pro) y en estaciones de trabajo con 32 GB, dejando margen para contexto.
- Generacion de texto en produccion con latencia moderada: a ~48 tokens/s de decodificacion en M4 Max, es util para tareas de generacion por lotes o asistentes de escritura donde la velocidad no es critica.

## Benchmarks y rendimiento

La model card no reporta benchmarks estandar (MMLU, HumanEval, GSM8K) porque, segun el autor, la perplejidad es invalida en la familia gemma-4-it debido a la distribucion afilada por RL. En su lugar, presenta dos metricas propias:

**Juicio ciego literario vs bf16** (60 continuaciones, greedy, juez claude-sonnet-5):

| | bf16 preferido | este modelo preferido | empate | p |
|---|---|---|---|---|
| vs bf16 (48 GiB) | 11 | 23 | 26 | 0,058 |

**Divergencia KL y acuerdo top-1 vs bf16**:

| build | tamano | KL media (millinats/tok) | acuerdo top-1 |
|---|---|---|---|
| 8-bit reference | 25 GiB | 441 | 79,95 % |
| este modelo | 18,7 GiB | 537 | 77,89 % |
| build d4 (12,5 GiB) | 12,5 GiB | 1856 | 56,56 % |

El autor advierte que el acuerdo top-1 con bf16 tiene un techo practico de ~80 % en este MoE, porque cualquier perturbacion en el routing cambia que expertos se activan. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: pico de memoria de 17,7 GiB medido en M4 Max (128 GB) con generacion greedy de 120 tokens; el autor indica que cabe en una maquina de 32 GB con margen para contexto.
- GPU recomendadas: Apple Silicon (M4 Max, M3 Pro, M2 Ultra, etc.) con al menos 32 GB de memoria unificada; no requiere GPU NVIDIA.
- Compatibilidad con GPU de consumo: no aplica, es un artefacto MLX exclusivo para Apple Silicon.
- Opciones de despliegue: `mlx-lm` (pip install mlx-lm) con el comando `python -m mlx_lm generate --model TheDrainFlorist/gemma-4-26b-a4b-it-VQ-6.2bpw`. Tambien es posible shardear en cluster exo, pero los codebooks VQ deben replicarse, no particionarse (el `model.py` incluido falla explicitamente si se intenta particionar).
- Latencia y throughput: ~48 tokens/s de decodificacion en M4 Max (GPU idle, 120 tokens greedy). Prefill opcionalmente ~20 % mas rapido con `VQ_DECODE_CHUNK=16`, aunque esto rompe la reproduccion bit-exacta de las metricas publicadas.

## Comparativa con modelos similares

| Modelo | Tamano | Parametros | Contexto | Calidad vs bf16 | Licencia | Formato |
|---|---|---|---|---|---|---|
| gemma-4-26b-a4b-it (bf16) | 48 GiB | 26B totales, 4B activos | no disponible | referencia | gemma | safetensors |
| Este artefacto (VQ 6.2 bpw) | 18,7 GiB | 26B totales, 4B activos | no disponible | indistinguible en juicio ciego (p=0,058) | gemma | safetensors (MLX) |
| mlx-community/gemma-4-e4b-it-8bit | ~8 GiB | 4B totales (e4b) | no disponible | no comparable (modelo distinto) | gemma | safetensors (MLX) |
| Build d4 del mismo modelo | 12,5 GiB | 26B totales, 4B activos | no disponible | significativamente peor (p=0,044) | gemma | safetensors (MLX) |

El autor recomienda explícitamente usar `gemma-4-e4b-it-8bit` para presupuestos de ~8 GiB, ya que en sus mediciones iguala o supera a cuantizaciones agresivas del 26B a tamano similar, y es mas rapido.

## Limitaciones y advertencias

- Solo soporta ingles (tag `en`); no hay evidencia de capacidades multilingues en esta cuantizacion.
- La perplejidad no es una metrica valida para esta familia de modelos; cualquier evaluacion debe usar metodos alternativos (juicio ciego, KL, tareas aguas abajo).
- El juicio ciego mostro una inclinacion posicional del juez, por lo que la direccion de la preferencia (23 vs 11) no es reclamable; solo se puede afirmar que no hay diferencia estadistica.
- El acuerdo top-1 con bf16 esta limitado a ~80 % por la sensibilidad del routing MoE; no es un fallo de la cuantizacion, sino una propiedad del modelo.
- En despliegues multi-maquina con exo, los codebooks VQ deben replicarse en lugar de particionarse; el `model.py` incluido falla con un error explicito si se intenta particionar, evitando generacion silenciosa corrupta.
- La licencia `gemma` impone restricciones de uso comercial; consultar los terminos de Google antes de desplegar en produccion.
- No se documentan sesgos especificos de esta cuantizacion, pero hereda los del modelo base, que no han sido evaluados en este artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheDrainFlorist/gemma-4-26b-a4b-it-VQ-6.2bpw
- Coleccion de VQ de gemma-4 para Apple Silicon: https://huggingface.co/collections/TheDrainFlorist/gemma-4-vq-apple-silicon
- Modelo base de Google: https://huggingface.co/google/gemma-4-26b-a4b-it
- Pagina oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Google Cloud sobre gemma-4-26b-a4b-it: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Ficha en SiliconFlow: https://www.siliconflow.com/models/gemma-4-26b-a4b-it
- Repositorio de exo (para despliegue multi-maquina): https://github.com/exo-explore/exo
