# tyler-wagler/gemma-4-26B-A4B-it-pulsar-k4

## Resumen

`tyler-wagler/gemma-4-26B-A4B-it-pulsar-k4` es un contenedor listo para servir del motor de inferencia pulsar, desarrollado por Tyler Wagler. Empaqueta el modelo `google/gemma-4-26B-A4B-it` de Google DeepMind cuantizado a EXL3 4.0 bpw, junto con dos complementos que pulsar ejecuta sobre los mismos pesos: el adaptador de decisión JEV (que devuelve probabilidades calibradas, el llamado "System 1") y el borrador de bloques DFlash para decodificación especulativa.

El modelo base es un Mixture-of-Experts de la familia Gemma 4, con arquitectura multimodal (texto e imagen en la versión original) y una ventana de contexto de 256.000 tokens. Esta distribución concreta es solo de texto: la torre de visión no está incluida. El contenedor ocupa 15 GB en disco y está pensado para servir chat, decodificación especulativa y juicio de seguridad de acciones de agentes en un único proceso sobre una GPU Turing.

Su relevancia actual reside en que demuestra un flujo de despliegue completo sobre hardware antiguo (una Quadro RTX 6000 de 24 GB, sm_75), combinando cuantización EXL3, decodificación especulativa y un juez calibrado de acciones de agentes, con resultados de calidad medidos frente al modelo BF16 de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (modelo base Gemma 4); contenedor con adaptador LoRA JEV y borrador DFlash |
| Parametros totales | 15.143.642.934 (pesos safetensors del repositorio); modelo base: 25,2 B totales |
| Parametros activos | 3,8 B por token (modelo base) |
| Longitud de contexto | 131.072 tokens (configuracion de servicio con 3 bancos KV); modelo base: 256.000 tokens |
| Tipos de cuantizacion | EXL3 4.0 bpw (linears y expertos enrutados), EXL3 ~6 bpw (cabeza de salida), BF16 (embeddings y normas), F16 (LoRA JEV), F32 (cabeza de decision), F16/BF16 (DFlash) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta ademas a los terminos de Gemma 4 de Google) |
| Formato de pesos | safetensors (contenedor pulsar, 34 shards) |

## Arquitectura y entrenamiento

El modelo base es un transformer Mixture-of-Experts de Google DeepMind con 25,2 B de parametros totales y 3,8 B activos por token, entrenado originalmente para entrada nativa de texto e imagen y salida de texto, con pensamiento configurable y function calling. Esta distribucion no reentrena el modelo: cuantiza los linears del decodificador y los 128 expertos enrutados a EXL3 4.0 bpw con exllamav3 1.6.5 (codebook `mul1`, valores por defecto) y los reempaqueta byte a byte en el contenedor de pulsar. La cabeza de salida va a unos 6 bpw; embeddings y normas se mantienen en BF16 tal como los publica Google.

Sobre esos pesos se añaden dos componentes. El primero es JEV, un LoRA de rango 32 y alpha 64 sobre atención y MLP denso, con una cabeza de decisión de 24 slots, que no se fusiona con los pesos base: pulsar lo aplica solo a peticiones de juicio, de modo que el chat ejecuta los pesos Gemma sin modificar. El segundo es DFlash, un borrador de bloques de 5 capas para decodificación especulativa, activado por defecto. La innovación destacable es la separación de bancos KV (tres de 131.072 tokens, uno reservado al juez) y la verificación de que el forward de pulsar coincide con el de exllamav3 en cada capa dentro del margen de redondeo.

## Capacidades

- Generación de texto conversacional y razonamiento, heredados del modelo base Gemma 4.
- Decodificación especulativa mediante DFlash, activa por defecto, con ganancia de velocidad medida.
- Juicio de seguridad calibrado (JEV): responde preguntas tipadas (`noul` verdadero/falso, `choice`, `score`) sobre un estado JSON y devuelve probabilidades calibradas en un solo prefill.
- Servicio de chat compatible con la API de OpenAI (`POST /v1/chat/completions`) y de Anthropic (`POST /v1/messages`).
- Endpoint dedicado de juicio (`POST /v1/systemone`) con soporte de caché de prompt.
- Multilingüismo: no disponible en la información proporcionada.
- Visión: no incluida (esta distribución es solo de texto).
- Tool calling y razonamiento multi-paso: disponibles en el modelo base; en esta ficha no se detallan más allá de lo indicado.

## Casos de uso

- Juez de seguridad de agentes de código en dos etapas: JEV puntúa cada llamada a herramienta (por ejemplo, un `rm -rf ~`) y devuelve `p_block`; si la puntuación es alta, Gemma escribe el juicio de segunda etapa. El ejemplo de la model card devuelve `p_block` de 0,960812 en 122,4 ms.
- Servicio de chat en producción sobre GPU antigua: con tres bancos KV de 131.072 tokens y 22,3 GB de VRAM en una RTX 6000, se pueden mantener conversaciones largas multi-turno en un solo proceso.
- Generación de código asistida: el prompt de código alcanza ~205 tokens/s en greedy con DFlash, adecuado para autocompletado e iteración interactiva.
- Pasarela compatible con OpenAI y Anthropic: al exponer ambos formatos de API, se puede integrar como backend en herramientas existentes sin adaptadores propios.
- Moderación y filtrado previo de acciones en pipelines de CI/CD: el endpoint `/v1/systemone` permite validar comandos o parches antes de ejecutarlos, con latencia de 0,12-0,7 s por decisión.
- Despliegue en entornos con restricciones de memoria: 15 GB en disco y ~22 GB de VRAM permiten servir el modelo en GPUs de 24 GB, incluido hardware Turing.
- Evaluación comparativa de cuantización: los datos de NLL y KL frente a BF16 permiten usar el contenedor como referencia para validar otras cuantizaciones EXL3.

## Benchmarks y rendimiento

Calidad de los pesos de chat frente al modelo BF16 (un texto de 1.948 tokens y un prompt de herramienta de 114 tokens):

| Métrica | Texto largo (BF16 / exllamav3 4.0 / pulsar) | Prompt de herramienta (BF16 / exllamav3 4.0 / pulsar) |
|---|---|---|
| NLL de los tokens reales | 7,111 / 7,102 / 7,157 | 9,819 / 9,768 / 9,552 |
| KL de logits (BF16 ‖ pulsar), mediana | 0,10 | 0,27 |

Juez JEV sobre los pesos 4.0 con el LoRA aplicado en tiempo de ejecución:

| Prueba | Resultado |
|---|---|
| 18 acciones de agente etiquetadas a mano (bloquear/permitir) | 18/18 con P(block) ≥ 0,25 |
| 52 casos frente a las probabilidades del modelo de referencia | \|ΔP\| medio 0,043, máximo 0,265 |
| Latencia en RTX 6000 | ~0,12-0,7 s por decisión (según caché de prompt) |

Velocidad en una RTX 6000, greedy, 400 tokens, DFlash activo, petición única:

| Prompt | Código | Explicación | Lista | Relato |
|---|---|---|---|---|
| tokens/s | ~205 | ~145 | ~138 | ~109 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los conjuntos de 18 y 52 casos son pequeños, según advierte el propio autor.

## Requisitos de hardware

- VRAM estimada: 22,3 GB en uso con tres bancos KV de 131.072 tokens y un banco de juez en una Quadro RTX 6000 de 24 GB.
- GPU recomendadas: Quadro RTX 6000 (Turing, sm_75) es la única verificada por el autor; el binario se compila con `CUDA_ARCH=sm_75`. Otras arquitecturas no están validadas en la información disponible.
- Cabe en GPU de consumo: no confirmado; el requisito de ~22 GB deja poco margen en tarjetas de 24 GB y no se indica soporte para 16 GB.
- Opciones de despliegue: exclusivamente el motor pulsar (rama `dev`, commit `07aa3a19` o posterior), con `PULSAR_MSEQ_BANKS=3`, `--ctx 131072`, `--reasoning off` y `--judge-banks 1`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~205 tokens/s en código, ~145 en explicación, ~138 en listas y ~109 en relato (RTX 6000, greedy, 400 tokens); ~0,12-0,7 s por decisión del juez.
- Disco: 15 GB (repositorio de 16,4 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este contenedor (pulsar-k4) | 15,1 B en safetensors (base 25,2 B / 3,8 B activos) | 131.072 configurado (base 256.000) | Apache-2.0 + términos Gemma 4 | Hugging Face, motor pulsar | Solo texto; incluye JEV y DFlash |
| google/gemma-4-26B-A4B-it | 25,2 B totales / 3,8 B activos | 256.000 | Apache-2.0 + términos Gemma 4 | Hugging Face, Google Cloud, Modal | Multimodal texto e imagen; sin cuantizar |
| autotrust/JEV-Gemma4-26B-A4B | no disponible | no disponible | Apache-2.0 | Hugging Face | Adaptador de decisión de referencia |
| z-lab/gemma-4-26B-A4B-it-DFlash | no disponible | no disponible | Apache-2.0 | Hugging Face | Borrador especulativo de referencia |

## Limitaciones y advertencias

- Solo texto: la torre de visión del modelo base no está incluida, pese a que Gemma 4 es multimodal.
- Hardware validado únicamente en Turing (sm_75); el rendimiento y la corrección en otras arquitecturas no están verificados.
- Dependencia de un motor propietario del autor (pulsar, rama `dev`), sin soporte indicado para stacks estándar como vLLM o llama.cpp.
- Las evaluaciones del juez JEV se basan en conjuntos muy pequeños (18 y 52 casos); no son concluyentes para producción.
- El juez devuelve probabilidades calibradas, pero un umbral mal elegido puede producir falsos positivos o negativos en el bloqueo de acciones.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas.
- Idiomas soportados no documentados en esta distribución.
- Licencia Apache-2.0 sujeta además a los términos de Gemma 4 de Google; revisar `NOTICE` para conocer los cambios realizados.
- El LoRA JEV no está fusionado: cualquier uso fuera de pulsar requiere aplicar el adaptador manualmente.
- Sesgos conocidos del modelo base: no disponibles en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tyler-wagler/gemma-4-26B-A4B-it-pulsar-k4
- Motor pulsar: https://github.com/tylerwagler/pulsar
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Adaptador JEV: https://huggingface.co/autotrust/JEV-Gemma4-26B-A4B
- Borrador DFlash: https://huggingface.co/z-lab/gemma-4-26B-A4B-it-DFlash
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Documentación en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Ficha en Modal: https://modal.com/library/google/gemma-4-26b-a4b-it
