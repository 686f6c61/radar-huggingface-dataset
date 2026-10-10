# talzoomanzoo/ttrl-aime2026-sc-4b

## Resumen

ttrl-aime2026-sc-4b es un adaptador LoRA publicado por el usuario talzoomanzoo (Minju Gwak) sobre el modelo base Qwen/Qwen3-4B. No se trata de un modelo completo: el repositorio contiene unicamente los pesos del adaptador (formato PEFT/safetensors) y el tokenizer, sin los pesos del modelo base fusionados. El entrenamiento se enmarca en la etiqueta `ttrl` (test-time reinforcement learning) y esta orientado a problemas de matematicas de competicion, a juzgar por el nombre del run (`aime2026-lora16-seed42-20261009-022919-sc`) y por la existencia de un dataset asociado del autor llamado `aime26`.

El adaptador tiene rango LoRA 16 y alpha 32, y fue exportado en el paso 2 de entrenamiento, un checkpoint muy temprano dentro del run. La modalidad de preferencia declarada es `sc`, cuyo significado exacto no se documenta en la model card ni en los resultados de busqueda disponibles. El tamano del repositorio es de aproximadamente 0,1 GB, coherente con un adaptador de bajo rango mas el tokenizer.

Su relevancia es limitada y experimental: no tiene descargas ni likes, no declara licencia, no publica idiomas soportados ni resultados de evaluacion, y su utilidad practica depende enteramente del modelo base Qwen3-4B sobre el que se carga. Es interesante como ejemplo de pipeline de ajuste con LoRA sobre datos de tipo AIME, pero no como artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base Qwen/Qwen3-4B); rango 16, alpha 32 |
| Parametros totales | No aplica al adaptador (0,1 GB de repositorio); modelo base Qwen3-4B, ~4 000 millones segun su denominacion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (viene determinada por el modelo base Qwen3-4B) |
| Tipos de cuantizacion | No se publican versiones cuantizadas ni GGUF; el adaptador se distribuye en safetensors a precision completa |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no especifica licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) con rango 16 y alpha 32, aplicado sobre Qwen/Qwen3-4B, un transformer decoder-only de aproximadamente 4 000 millones de parametros. Al ser un adaptador, no modifica la arquitectura del modelo base: inyecta matrices de bajo rango en determinadas capas, de modo que la inferencia requiere cargar primero Qwen3-4B y despues aplicar los pesos del adaptador con PEFT. El repositorio incluye tambien el tokenizer, pero no los pesos base fusionados.

Los unicos datos de entrenamiento documentados en la model card son el identificador del run (`aime2026-lora16-seed42-20261009-022919-sc`), la modalidad de preferencia (`sc`) y el paso de exportacion (paso 2). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO u otra fase de alineamiento, ni el algoritmo exacto dentro del marco TTRL (test-time reinforcement learning). Tampoco se detalla que significa la etiqueta de preferencia `sc`. El dataset asociado del mismo autor, `talzoomanzoo/aime26`, aparece en los resultados de busqueda y es la unica pista sobre los datos empleados, pero su contenido y tamano no se describen en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y de respuestas a problemas, heredada del modelo base Qwen3-4B (pipeline declarado: `text-generation`).
- Ajuste orientado a problemas de matematicas de competicion, segun el nombre del run y el dataset asociado (`aime26`), aunque no se publican metricas que lo confirmen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; depende de las capacidades del modelo base.
- Capacidades multilingues: no disponible (los idiomas soportados no se declaran).
- Capacidad especial de modo "thinking" o razonamiento explicito: no confirmada en la model card.
- Vision y audio: no disponibles.

## Casos de uso

- Experimentacion academica con TTRL: el adaptador sirve como punto de partida reproducible (semilla 42, rango 16, alpha 32) para estudiar como evoluciona el ajuste por refuerzo en tiempo de test sobre problemas tipo AIME. Su utilidad principal es metodologica, no de producto.
- Reproduccion de resultados de matematicas de competicion: cargando el adaptador sobre Qwen3-4B con PEFT se puede evaluar si el ajuste mejora la tasa de acierto en conjuntos tipo AIME, siempre que se disponga de una linea base del modelo sin adaptador para comparar.
- Investigacion sobre checkpoints tempranos: al estar exportado en el paso 2, permite analizar el efecto de un ajuste minimo sobre los pesos y compararlo con checkpoints posteriores del mismo run, si el autor los publica.
- Pruebas de infraestructura de despliegue con adaptadores: util para validar pipelines de serving que soportan LoRA en caliente (vLLM con `--enable-lora`, TGI, FriendliAI, PEFT) sin necesidad de fusionar pesos.
- Generacion de datos sinteticos de matematicas: puede emplearse como generador auxiliar de soluciones paso a paso para aumentar datasets de entrenamiento, sujeto a revision humana por el riesgo de alucinacion en cadenas largas.
- Docencia y divulgacion: como ejemplo practico de como se publica un adaptador LoRA en HuggingFace y de las diferencias entre adaptador y modelo fusionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye metricas de AIME, MMLU, GSM8K, HumanEval ni de ningun otro conjunto, y los resultados de busqueda solo aportan leaderboards generales de AIME 2026 (llm-stats.com, benchlm.ai) que no contienen entradas verificables para este adaptador. Tampoco se dispone de una evaluacion del modelo base con y sin el adaptador en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para el modelo base Qwen3-4B (el adaptador anade un coste despreciable, del orden de decenas de MB): aproximadamente 8-9 GB en bf16/fp16, unos 4-5 GB en cuantizacion de 8 bits y unos 2,5-3,5 GB en 4 bits, sin contar la cache KV.
- Cache KV: crece de forma lineal con la longitud de contexto y el numero de secuencias simultaneas; para contextos largos conviene reservar VRAM adicional o usar cuantizacion de cache.
- GPU recomendadas: para bf16, A100 40 GB, H100 o L40S; para cuantizacion 4 bits, cualquier GPU consumer con 8 GB o mas.
- Compatibilidad con GPU consumer: si. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 24 GB, siendo esta ultima la opcion mas comoda para bf16 con contexto amplio.
- Opciones de despliegue: PEFT + transformers (carga directa del adaptador), vLLM con soporte de LoRA, TGI con adaptadores, FriendliAI (el endpoint aparece en los resultados de busqueda) y, previa fusion de pesos, llama.cpp u Ollama. No se publican pesos GGUF del adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ttrl-aime2026-sc-4b (este adaptador) | Adaptador LoRA r16/a32 (repo 0,1 GB) | No disponible | No disponible | 0 descargas, 0 likes en HuggingFace |
| Qwen/Qwen3-4B (modelo base) | ~4 000 millones | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo publico de referencia del que depende este adaptador |
| Otros adaptadores LoRA de matematicas sobre Qwen3-4B | No disponible | No disponible | No disponible | No se han identificado alternativas concretas en los resultados de busqueda |

La comparacion es estructural, no de rendimiento: no existen metricas publicadas para este adaptador y los resultados de busqueda no aportan modelos comparables de la misma categoria con datos verificables. Cualquier comparacion cuantitativa requeriria evaluar el adaptador y el modelo base en el mismo conjunto de problemas.

## Limitaciones y advertencias

- Checkpoint muy temprano: la model card indica que se exporto en el paso 2 de entrenamiento, por lo que es probable que no represente el estado final ni optimo del run.
- Modelo base requerido: no contiene pesos completos; es imprescindible cargar Qwen/Qwen3-4B por separado, lo que anade dependencia de la licencia y disponibilidad de ese modelo.
- Licencia no declarada: sin licencia explicita no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier uso en produccion.
- Idiomas no declarados: se desconoce el soporte multilingue real del adaptador, que en la practica dependera del modelo base.
- Sin benchmarks: no hay evidencia publicada de mejora frente al modelo base, por lo que la eficacia del ajuste es una hipotesis no verificada.
- Riesgo de alucinacion: al ser un ajuste sobre un modelo de 4 000 millones orientado a matematicas, las cadenas de razonamiento largas pueden contener pasos incorrectos con apariencia de validez; conviene verificar las soluciones.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o seguridad.
- Adopcion nula: 0 descargas y 0 likes, sin issues ni discusion documentada, lo que reduce la probabilidad de que los errores hayan sido detectados por terceros.
- Significado de la modalidad `sc` no documentado: se desconoce que criterio de preferencia u objetivo de entrenamiento representa, lo que dificulta interpretar su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/talzoomanzoo/ttrl-aime2026-sc-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset asociado del autor: https://huggingface.co/datasets/talzoomanzoo/aime26
- Perfil del autor (Minju Gwak): https://huggingface.co/talzoomanzoo/datasets
- Endpoint en FriendliAI: https://friendli.ai/models/talzoomanzoo/ttrl-aime2026-sc
- Leaderboard AIME 2026 (llm-stats.com): https://llm-stats.com/benchmarks/aime-2026
- Leaderboard AIME 2026 (BenchLM.ai): https://benchlm.ai/benchmarks/aime2026
