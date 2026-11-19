# yushengsu/Qwen3-8B-5layer-MoE-8E1A-FFN12288-v2

## Resumen

Qwen3-8B-5layer-MoE-8E1A-FFN12288-v2 es un modelo borrador (*draft model*) para decodificación especulativa sobre Qwen/Qwen3-8B, desarrollado por el usuario yushengsu y entrenado con el framework SpecForge en su variante DSpark. No es un modelo conversacional autonomo: su funcion es proponer tokens que el modelo objetivo Qwen3-8B verifica en paralelo, acelerando la generacion sin alterar la distribucion de salida del modelo grande. La relevancia practica esta en reducir latencia en despliegues de Qwen3-8B sin recurrir a un borrador denso mas costoso.

La arquitectura combina un transformer de solo 5 capas con un bloque MoE en cada FFN: 8 expertos de 12288 dimensiones, top-1 por token y sin experto compartido. Resulta en 6,41 mil millones de parametros totales y 1,13 mil millones activos, con un coste FLOPs equivalente al de un FFN denso de borrador (1x). La atencion usa 32 cabezas de consulta y 8 de clave/valor de 128 dimensiones con normalizacion q/k, e incorpora un proyector de caracteristicas (fc 20480->4096) sobre las capas 1, 9, 17, 25 y 33 del modelo objetivo, una cabeza Markov de rango 256 y bloque de 16 tokens.

Esta es la version v2, entrenada durante 4 epocas (39.468 pasos totales) frente a la v1 de una sola epoca. El repositorio ocupa 38,5 GB e incluye checkpoints por epoca. Esta pensado para servir con SGLang mediante un fork especifico, lo que limita su adopcion a entornos que puedan aplicar ese parche.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 5 capas con FFN MoE (8 expertos, top-1, sin experto compartido); borrador para decodificacion especulativa DSpark/SpecForge |
| Parametros totales | 6,41 mil millones |
| Parametros activos | 1,13 mil millones |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (entrenado con prompts de perfectblend regen en plantilla qwen3-instruct) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (config.json + model.safetensors + ficheros de tokenizer por epoca) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa con 5 capas transformer. Cada capa sustituye el FFN denso por un MoE de 8 expertos de 12288 dimensiones con enrutamiento top-1 y sin experto compartido, de modo que cada token activa un unico experto. La atencion emplea 32 cabezas de consulta y 8 de clave/valor de 128 dimensiones con normalizacion q/k. Ademas de las capas propias, el borrador consume caracteristicas del modelo objetivo mediante un proyector fc de 20480 a 4096 aplicado sobre las capas 1, 9, 17, 25 y 33 de Qwen3-8B, e incorpora una cabeza Markov de rango 256 con bloque de 16 para modelar dependencias entre tokens propuestos.

El entrenamiento se realizo con SpecForge (variante DSpark) durante 4 epocas, con 9.867 pasos por epoca (39.468 en total) y 144 muestras por paso de optimizador. Se usaron prompts de perfectblend regen con temperatura 0 y sin modo *think*, contexto de 8192 tokens y plantilla qwen3-instruct sin system prompt. El optimizador aplica learning rate 6e-4 con decaimiento coseno a lo largo de las 4 epocas y un 4 % de warm-up, con Liger RMSNorm. El entrenamiento se ejecuto en dos nodos con 4x GB300 cada uno, usando servidores de captura sglang 0.5.18 y el entrenador SpecForge DSpark. La configuracion del borrador es identica a la v1, que se entreno 1 epoca a 132 muestras por paso.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen/Qwen3-8B; no es un modelo de proposito general.
- Aceleracion de inferencia del modelo objetivo mediante verificacion paralela de bloques de 16 tokens propuestos.
- Consumo de caracteristicas intermedias del modelo objetivo a traves del proyector sobre las capas 1, 9, 17, 25 y 33.
- Modelado de dependencias intra-bloque mediante cabeza Markov de rango 256.
- Soporte de tool calling, agentes, vision o audio: no disponible (fuera del alcance del borrador).
- Capacidades multilingues: no disponible; el entrenamiento se limita a los prompts de perfectblend regen en plantilla qwen3-instruct.
- Modo *thinking*: no aplicable; los datos de entrenamiento excluyen el modo no-think del modelo base.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: el borrador propone bloques de 16 tokens que el modelo objetivo verifica, reduciendo la latencia por token generado en servicios de chat o generacion de texto con Qwen3-8B como modelo servido.
- Despliegue de bajo coste en endpoints de alta concurrencia: al tener solo 1,13 mil millones de parametros activos, el coste adicional de generar propuestas es reducido frente a un borrador denso, lo que permite mantener throughput alto con el modelo grande como verificador.
- Serving con SGLang en infraestructura existente: se integra mediante el paquete `dev-moe-serving` del fork de SpecForge y la arquitectura `Qwen3MoeDSparkModel`, encajando en stacks que ya usan SGLang para Qwen3-8B.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible de un borrador MoE top-1 con proyector multi-capa y cabeza Markov, con codigo de entrenamiento publicado en el PR #22 de SpecForge.
- Evaluacion comparativa de estrategias de borrador: permite medir el impacto de 4 epocas frente a la v1 de 1 epoca sobre la tasa de aceptacion de tokens, manteniendo la misma configuracion de arquitectura.
- Generacion de codigo y texto tecnico asistida por Qwen3-8B: al heredar el modelo objetivo la calidad final, el borrador acelera tareas de generacion larga donde la latencia es critica, como autocompletado o resumen de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 6,41 mil millones de parametros en safetensors, el peso en precision de entrenamiento ronda los 12-13 GB, y en FP16/bf16 unos 13 GB, mas el modelo objetivo Qwen3-8B (~16 GB en bf16) que debe residir junto a el.
- GPU recomendadas: el autor entreno en nodos con 4x GB300; para serving se requiere capacidad suficiente para alojar simultaneamente el borrador y Qwen3-8B, por lo que se recomiendan A100 80 GB, H100 80 GB o GB300.
- Cabe en GPU de consumo: no disponible; la combinacion borrador + modelo objetivo en bf16 supera los 24 GB de una RTX 4090, y no se documentan cuantizaciones que lo reduzcan.
- Opciones de despliegue: SGLang con el fork de SpecForge (`SGLANG_EXTERNAL_MODEL_PACKAGE=specforge.serving.sglang_models`, arquitectura `Qwen3MoeDSparkModel`), renombrando los tensores `gate.selection_bias` a `gate.expert_bias` y activando `dflash_config.moe_router_enable_expert_bias: true`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-5layer-MoE-8E1A-FFN12288-v2 | 6,41 B totales / 1,13 B activos | 8192 (entrenamiento) | Borrador MoE para decodificacion especulativa | Apache 2.0 | Hugging Face, serving via fork de SGLang |
| Qwen3-8B-5layer-MoE-8E1A-FFN12288-v1 (mismo autor) | 6,41 B totales / 1,13 B activos | 8192 (entrenamiento) | Borrador MoE, 1 epoca a 132 muestras/paso | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (modelo objetivo) | 8 B (denso) | no disponible en la informacion proporcionada | Modelo base conversacional | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: solo tiene sentido como borrador de Qwen/Qwen3-8B; usarlo de forma independiente produce salidas sin garantia de calidad.
- El serving requiere un fork especifico de SGLang (`dev-moe-serving`) y el renombrado manual de tensores (`gate.selection_bias` a `gate.expert_bias`); no funciona con el paquete estandar de SGLang sin ese parche.
- El contexto de entrenamiento es de 8192 tokens; no se documenta comportamiento mas alla de esa longitud.
- Entrenado con prompts de perfectblend regen en modo no-think y sin system prompt; puede degradarse con plantillas o modos distintos a los de entrenamiento.
- Idiomas soportados no documentados; el rendimiento multilingue depende del modelo objetivo y no esta validado para el borrador.
- Sin resultados de benchmarks publicados: la tasa de aceptacion de tokens y la ganancia real de latencia no estan cuantificadas en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del fork de SGLang y del modelo base Qwen3-8B anade condiciones propias de esos componentes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.
- Riesgo de alucinacion: heredado del modelo objetivo, ya que la verificacion la realiza Qwen3-8B; el borrador no introduce contenido propio en la salida final.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E1A-FFN12288-v2
- Codigo de entrenamiento (PR #22 de SpecForge): https://github.com/yushengsu-thu/SpecForge/pull/22
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
