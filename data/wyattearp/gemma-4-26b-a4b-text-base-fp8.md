# wyattearp/Gemma-4-26B-A4B-text-base-fp8

## Resumen

El modelo **wyattearp/Gemma-4-26B-A4B-text-base-fp8** es una cuantización post-entrenamiento (PTQ) en FP8 del modelo **google/gemma-4-26B-A4B-it** de Google DeepMind, realizada por el usuario wyattearp. Se trata de una versión optimizada para inferencia eficiente en una sola GPU, eliminando la parte multimodal (proyector de visión y torre de visión) para quedarse únicamente con el backbone de lenguaje puro (`Gemma4ForCausalLM`). La cuantización se ha realizado con NVIDIA ModelOpt utilizando escalares por tensor (`axis=None`), lo que permite aprovechar las instrucciones de hardware FP8 de las GPUs Ada Lovelace (RTX 4090, L40S) y Blackwell.

El checkpoint resultante ocupa **24.2 GiB** (frente a los 50.47 GiB del BF16 original, una reducción del 52%) y está pensado para servir con vLLM en una sola GPU de 48 GB como la L40S, dejando ~23.4 GiB libres para la caché KV. El modelo hereda la licencia Gemma de Google y mantiene la arquitectura MoE con 128 expertos, aunque solo se ha confirmado el idioma inglés en esta versión específica. Es relevante porque permite ejecutar un modelo de 25.2 mil millones de parámetros totales con solo 26 GB de espacio en disco y requisitos de VRAM moderados, facilitando su despliegue en hardware de gama alta pero no necesariamente de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con 128 expertos, transformer de solo decodificador |
| Parametros totales | 25.233.141.760 (25.2 B) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4 B activos, pero no se especifica) |
| Longitud de contexto | 262.144 tokens (256K) según la configuracion de vLLM recomendada |
| Tipos de cuantizacion | FP8 (E4M3) con escalares por tensor para capas de atencion y MLPs de expertos; BF16 nativo para gating, embeddings y LM head |
| Idiomas soportados | en (ingles) en esta version; el modelo base soporta mas de 140 idiomas, pero no se confirma su mantenimiento tras la cuantizacion |
| Licencia | Gemma Terms of Use (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (formato FP8 de ModelOpt compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base **google/gemma-4-26B-A4B-it** es una arquitectura MoE (Mixture-of-Experts) con 128 expertos, diseñada por Google DeepMind. La version cuantizada elimina los componentes multimodales (proyector y torre de vision) para quedarse como un modelo de lenguaje puro. La cuantizacion FP8 se aplica a las capas de atencion (q, k, v, o) y a los MLPs de los expertos, utilizando escalares por tensor (23.450 factores de escala) que coinciden con las instrucciones de hardware `torch._scaled_mm` de las GPUs Ada Lovelace. Los routers y el gating MoE se mantienen en BF16 nativo para preservar el rango dinamico y evitar el colapso del enrutamiento de expertos. Las embeddings y la cabeza de lenguaje tambien permanecen en BF16 para mantener la entropia sobre el vocabulario de 256.000 tokens.

No se dispone de informacion detallada sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) en los materiales proporcionados. Esta version es exclusivamente una cuantizacion post-entrenamiento sin ajuste fino adicional.

## Capacidades

- Generacion de texto y conversacion en ingles.
- Razonamiento multi-paso y modo thinking (el parser `gemma4` de vLLM soporta canales de razonamiento).
- Tool calling / function calling, con soporte en vLLM mediante `--tool-call-parser gemma4` y `--enable-auto-tool-choice`.
- Soporte para agentes y razonamiento estructurado gracias al parser dedicado en vLLM.
- Multilingue: el modelo base soporta mas de 140 idiomas, pero esta version solo declara ingles en su model card.
- Sin capacidades de vision ni audio (modulo multimodal eliminado).
- Compatible con cuantizacion FP8 nativa en hardware Ada Lovelace y Blackwell.

## Casos de uso

- Despliegue de un asistente conversacional en una sola GPU L40S (48 GB) con vLLM, aprovechando la ventana de contexto de 256K tokens para mantener conversaciones largas con historial extenso.
- Integracion en pipelines de agentes que requieren tool calling: el modelo puede seleccionar y ejecutar funciones externas (busquedas, calculos, APIs) gracias al parser `gemma4` de vLLM.
- Generacion de codigo asistida en entornos de desarrollo, con capacidad de razonamiento multi-paso y contexto largo para proyectos grandes.
- Analisis de documentos extensos (contratos, informes, codebases) donde la ventana de 256K tokens permite procesar el contenido completo sin truncamiento.
- Servicio de inferencia en entornos con restricciones de VRAM: al ocupar solo 24.6 GiB en vLLM, cabe en GPUs de 24 GB como la RTX 4090 si se ajusta el `gpu-memory-utilization` y se limita la caché KV.
- Prototipado rapido de aplicaciones de lenguaje en hardware consumer (RTX 4090, RTX 6000 Ada) gracias al formato FP8 y al soporte nativo en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Tampoco se proporcionan comparativas de rendimiento frente a otros modelos. Se recomienda consultar la documentacion oficial de Gemma 4 para datos de evaluacion del modelo base, aunque esta version cuantizada no presenta mediciones propias.

## Requisitos de hardware

- VRAM estimada: 24.6 GiB cargado en vLLM (con `--gpu-memory-utilization 0.85`), dejando ~23.4 GiB libres para la caché KV en una GPU de 48 GB.
- GPUs recomendadas: NVIDIA L40S (48 GB), RTX 6000 Ada (48 GB), RTX 4090 (24 GB, con limitaciones de caché KV), Blackwell GB10 / B200.
- En una RTX 4090 de 24 GB, el checkpoint de 24.2 GiB puede no caber con margen suficiente para la caché KV; se recomienda reducir `--max-model-len` o usar cuantizacion adicional.
- Opciones de despliegue: vLLM (soporte nativo FP8), tambien compatible con el ecosistema de compressed-tensors. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos concretos en la documentacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it (original) | 25.2 B | 256K | BF16 (50.47 GiB) | Gemma | HuggingFace |
| wyattearp/Gemma-4-26B-A4B-text-base-fp8 | 25.2 B | 256K | FP8 (24.2 GiB) | Gemma | HuggingFace |
| Otros modelos MoE de tamano similar (p.ej. Mixtral 8x7B) | 46.7 B | 32K | Varias | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas opciones. La principal diferencia de esta version es la reduccion de footprint y la eliminacion de la parte multimodal, lo que la hace mas ligera para tareas de solo texto en hardware limitado.

## Limitaciones y advertencias

- Es una version solo texto: se ha eliminado el soporte multimodal del modelo base, por lo que no procesa imagenes ni audio.
- Solo se declara el idioma ingles en la model card, aunque el modelo base soporta mas de 140 idiomas; no se garantiza el rendimiento multilingue tras la cuantizacion.
- La cuantizacion FP8 puede introducir degradacion de calidad frente al BF16 original, aunque no se aportan metricas de evaluacion.
- Se ha detectado un bug en el parser de tool calling de vLLM cuando se transiciona directamente desde el canal de razonamiento sin espacio en blanco; el problema esta documentado en el issue vllm-project/vllm#54256 y corregido en el PR vllm-project/vllm#54257. Se recomienda usar una version de vLLM que incluya ese parche.
- La licencia Gemma restringe el uso comercial segun los terminos de Google; es necesario revisar las condiciones especificas antes de desplegar en produccion.
- No se proporcionan datos sobre sesgos, alucinaciones o robustez del modelo cuantizado; se asume que hereda los riesgos del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wyattearp/Gemma-4-26B-A4B-text-base-fp8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo base (variante sin it): https://huggingface.co/google/gemma-4-26B-A4B
- Pagina oficial de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Documentacion de Gemma 4 en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Issue del bug de tool calling en vLLM: https://github.com/vllm-project/vllm/issues/54256
- Pull request con la correccion: https://github.com/vllm-project/vllm/pull/54257
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
