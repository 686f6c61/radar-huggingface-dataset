# twaggs88/gemma-4-26B-A4B-it-pulsar-k4

## Resumen

`twaggs88/gemma-4-26B-A4B-it-pulsar-k4` es un contenedor de inferencia listo para servir, publicado por el desarrollador twaggs88, que empaqueta el modelo `google/gemma-4-26B-A4B-it` cuantizado a EXL3 4.0 bpw junto con dos componentes adicionales que el motor pulsar ejecuta desde los mismos pesos: el adaptador de decisión JEV (que devuelve probabilidades calibradas) y el borrador de bloques DFlash para decodificación especulativa. No es un modelo nuevo, sino una distribución empaquetada para el motor de inferencia pulsar del mismo autor.

El modelo base es un transformer de tipo mezcla de expertos (MoE) de Google, con 15.143.642.934 parámetros totales según los safetensors del repositorio y un nombre comercial que indica 26B totales y 4B activos. El contenedor ocupa 16,4 GB en disco e incluye el LoRA JEV sin fusionar (se aplica solo en peticiones de juicio) y el borrador DFlash de 5 capas. La torre de visión no está incluida: es un modelo solo de texto.

Su relevancia radica en el enfoque de despliegue: un único proceso sirve chat (API compatible con OpenAI y Anthropic) y un juez de seguridad de dos etapas para agentes de código, con bancos de KV de 131.072 tokens y un endpoint específico `POST /v1/systemone` que responde preguntas tipadas en un solo prefill. Está pensado para hardware Turing (sm_75), en concreto una Quadro RTX 6000 de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con 128 expertos enrutados; decodificacion especulativa mediante DFlash |
| Parametros totales | 15.143.642.934 (segun safetensors); el nombre comercial indica 26B-A4B |
| Parametros activos | 4B (segun el nombre del modelo base A4B; no verificado en la informacion disponible) |
| Longitud de contexto | 131.072 tokens (bancos KV configurados en el ejemplo de despliegue) |
| Tipos de cuantizacion | EXL3 4.0 bpw (lineales del decodificador y 128 expertos enrutados); cabeza de salida EXL3 ~6 bpw; embeddings y normas en BF16; LoRA JEV en F16; cabeza de decision en F32; DFlash en F16/BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta ademas a los terminos de Gemma 4 de Google) |
| Formato de pesos | safetensors (contenedor propio de pulsar, EXL3 repackado byte a byte) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos enrutados y atención estándar, del que no se detallan en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Lo que sí documenta el autor es el proceso de cuantización y empaquetado: los pesos EXL3 se generaron con exllamav3 1.6.5 con sus valores por defecto y codebook `mul1`, y se reempaquetaron byte a byte en el contenedor de pulsar.

La innovación técnica del contenedor es la cohabitación de tres artefactos en un solo proceso sobre los mismos pesos: (1) los pesos cuantizados para chat, (2) el LoRA JEV (rango 32, alpha 64, sobre atención y MLP denso) con su cabeza de decisión de 24 slots, aplicado en tiempo de ejecución solo a peticiones de juicio, y (3) el borrador DFlash de 5 capas para decodificación especulativa, activado por defecto. El autor reporta que el forward pass de pulsar coincide con el de exllamav3 sobre los mismos pesos dentro del error de redondeo en cada capa.

## Capacidades

- Generación de texto conversacional en formato chat, con API compatible con OpenAI (`POST /v1/chat/completions`) y Anthropic (`POST /v1/messages`).
- Razonamiento y generación de código (el autor reporta velocidades específicas para prompts de código, explicación, listado y relato).
- Juicio de seguridad con probabilidades calibradas: el adaptador JEV responde preguntas tipadas (`noul` verdadero/falso, `choice`, `score`) sobre un estado JSON y devuelve distribuciones de probabilidad, no texto libre.
- Evaluación de acciones de agentes: el ejemplo de la model card puntúa una llamada a herramienta (`rm -rf ~`) y devuelve `p_block` de 0,960812.
- Decodificación especulativa integrada mediante DFlash, activada por defecto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin visión: la torre de visión no está incluida, es solo texto.
- Sin soporte documentado de tool calling genérico más allá del endpoint de juicio; el ejemplo de prompt de herramienta sugiere uso en pipelines de agentes, pero no se detalla el mecanismo.

## Casos de uso

- Juez de seguridad de primera etapa para agentes de código: el endpoint `POST /v1/systemone` recibe el estado (petición del usuario y acción propuesta) y devuelve `p_block` en una sola pasada de prefill, con latencias de 0,12 a 0,7 s según la caché de prompt. El autor lo usa como etapa 1 de un juez de dos etapas, dejando la etapa 2 al propio Gemma cuando la puntuación es alta.
- Filtrado previo de llamadas a herramientas en entornos de ejecución de agentes: al evaluar cada acción antes de ejecutarla, se puede bloquear comandos destructivos con un umbral configurable (el autor cita 18/18 aciertos con P(block) ≥ 0,25 sobre 18 acciones etiquetadas a mano).
- Chat conversacional de texto en producción: el contenedor sirve chat con contexto de 131.072 tokens y tres bancos KV, adecuado para asistentes con historiales largos en una sola GPU de 24 GB.
- Generación de código asistida: con ~205 tokens/s en prompts de código (greedy, 400 tokens, DFlash activo, RTX 6000), es viable para autocompletado y generación de fragmentos en herramientas de desarrollo.
- Despliegue en hardware Turing heredado: al estar compilado para sm_75 y caber en 22,3 GB de VRAM, permite servir un MoE de este tamaño en GPUs profesionales antiguas (Quadro RTX 6000) en lugar de exigir Ampere o Hopper.
- Moderación de contenido y clasificación con probabilidades: la cabeza de decisión de 24 slots y las preguntas tipadas permiten construir clasificadores calibrados (bloquear/permitir, elección entre opciones, puntuación) sin generar texto.
- Servicio unificado de chat y juicio: un solo proceso con `--judge-banks 1` reserva un banco KV para el juez y el resto para chat, simplificando la infraestructura frente a desplegar dos modelos separados.

## Benchmarks y rendimiento

Calidad de los pesos de chat frente al modelo BF16 (un texto de 1.948 tokens y un prompt de herramienta de 114 tokens):

| Metrica | Texto largo | Prompt de herramienta |
|---|---|---|
| NLL de los tokens reales, BF16 | 7,111 | 9,819 |
| NLL de los tokens reales, exllamav3 4.0 | 7,102 | 9,768 |
| NLL de los tokens reales, pulsar | 7,157 | 9,552 |
| KL de logits (BF16 ‖ pulsar), mediana | 0,10 | 0,27 |

Rendimiento del juez JEV sobre los pesos 4.0 con el LoRA aplicado en tiempo de ejecución:

| Metrica | Valor |
|---|---|
| 18 acciones de agente etiquetadas a mano (bloquear/permitir) | 18/18 con P(block) ≥ 0,25 |
| 52 casos frente a las probabilidades del modelo de referencia | desviación media absoluta de P 0,043; máxima 0,265 |
| Latencia en RTX 6000 | ~0,12-0,7 s por decisión (dependiente de la caché de prompt) |

Velocidad en una RTX 6000, greedy, 400 tokens, DFlash activo, petición única:

| Prompt | Codigo | Explicar | Listar | Relato |
|---|---|---|---|---|
| tokens/s | ~205 | ~145 | ~138 | ~109 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las muestras de 18 y 52 casos son conjuntos pequeños, según advierte el propio autor.

## Requisitos de hardware

- VRAM estimada: 22,3 GB de memoria GPU en uso en la configuración reportada (chat y juez JEV en un proceso, tres bancos KV de 131.072 tokens, un banco para el juez).
- GPU recomendadas: Quadro RTX 6000 (Turing, sm_75, 24 GB) es la única configuración en la que el autor ha servido el modelo. No se documenta soporte verificado en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no hay datos que lo confirmen; el contenedor ocupa 16,4 GB en disco y el uso de VRAM reportado (22,3 GB) supera la capacidad de la mayoría de GPUs de consumo de 24 GB una vez descontada la sobrecarga del sistema.
- Despliegue: motor pulsar compilado desde la rama `dev` (commit `07aa3a19` en adelante) con `make pulsar-server CUDA_ARCH=sm_75`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~205 tokens/s en código, ~145 en explicación, ~138 en listado y ~109 en relato (greedy, 400 tokens, DFlash activo, petición única, RTX 6000). El juez responde en ~0,12-0,7 s por decisión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| twaggs88/gemma-4-26B-A4B-it-pulsar-k4 | 15.143.642.934 (nombre comercial 26B-A4B) | 131.072 | Apache-2.0 | HuggingFace, motor pulsar | Contenedor con JEV y DFlash; solo texto; solo verificado en Turing |
| google/gemma-4-26B-A4B-it | no disponible en la informacion | no disponible en la informacion | Apache-2.0 (terminos Gemma 4) | HuggingFace | Modelo base BF16 de referencia; incluye vision; sin cuantizar |
| autotrust/JEV-Gemma4-26B-A4B | no disponible en la informacion | no disponible en la informacion | Apache-2.0 | HuggingFace | Adaptador de decision y cabeza; pesos en F32 |
| z-lab/gemma-4-26B-A4B-it-DFlash | no disponible en la informacion | no disponible en la informacion | Apache-2.0 | HuggingFace | Borrador de bloques para decodificacion especulativa; pesos en BF16 |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de visión no está incluida, por lo que no puede procesar imágenes.
- Solo verificado en Turing (sm_75) con una Quadro RTX 6000; no hay evidencia de funcionamiento en otras arquitecturas.
- El motor pulsar debe compilarse desde la rama `dev` (commit `07aa3a19` o posterior); no es un despliegue estándar de transformers ni de vLLM.
- Las evaluaciones del juez JEV se basan en 18 y 52 casos, conjuntos pequeños que el propio autor califica como tales; la generalización a otros dominios no está validada.
- La desviación máxima de probabilidad frente al modelo de referencia del juez es de 0,265, relevante si se usan umbrales de decisión ajustados.
- El LoRA JEV no está fusionado: se aplica solo a peticiones de juicio, de modo que el chat usa los pesos de Gemma sin modificar; cualquier uso del juez fuera del endpoint `POST /v1/systemone` requiere verificar que el adaptador se aplica.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; son los heredados del modelo base Gemma 4, sobre el que no se aportan análisis.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia: Apache-2.0 para el contenedor, pero el uso de Gemma está sujeto además a los términos de Gemma 4 de Google; revisar `NOTICE` para los cambios realizados.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el 2026-11-05; es un artefacto muy reciente y sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/twaggs88/gemma-4-26B-A4B-it-pulsar-k4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Adaptador JEV: https://huggingface.co/autotrust/JEV-Gemma4-26B-A4B
- Borrador DFlash: https://huggingface.co/z-lab/gemma-4-26B-A4B-it-DFlash
- Motor pulsar: https://github.com/tylerwagler/pulsar
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Terminos de licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
