# tom986/legislatura-7b-v20261105-1821-MLC

## Resumen

`legislatura-7b-v20261105-1821-MLC` es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario `tom986` en Hugging Face. Segun la model card, el modelo esta disenado como IA para el videojuego «Legislatura» y ha sido entrenado con "ejemplos propios" sobre la base del modelo de Alibaba Cloud, que se distribuye bajo licencia Apache 2.0. El repositorio esta empaquetado en formato MLC `q4f16_1` para su uso con WebLLM, replicando la estructura de `mlc-ai/Qwen2.5-7B-Instruct-q4f16_1-MLC`.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parametros y una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 mediante YaRN, segun la documentacion del modelo base). El ajuste fino esta orientado a un dominio muy especifico (el videojuego «Legislatura»), por lo que su comportamiento fuera de ese contexto no esta documentado.

El repo ocupa 4,3 GB, coherente con una cuantizacion de 4 bits del modelo de 7B en formato MLC. No hay descargas ni likes registrados, ni se han publicado datos de benchmarks, composicion del dataset de ajuste ni detalles sobre el proceso de entrenamiento. La licencia del ajuste no esta declarada en los metadatos, aunque el modelo base es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | ~7.600 millones (heredado del modelo base Qwen2.5-7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; no confirmado para este ajuste |
| Tipos de cuantizacion | q4f16_1 (formato MLC); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta multiples idiomas, pero no se documenta para este ajuste) |
| Licencia | No disponible para el ajuste; el modelo base es Apache 2.0 |
| Formato de pesos | MLC (q4f16_1), compatible con WebLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion por grupos (GQA), embeddings rotatorios (RoPE) y sesgo de atencion QKV, segun la arquitectura publicada por Alibaba Cloud. El ajuste fino se ha realizado con "ejemplos propios" segun la model card, presumiblemente ejemplos de conversacion o comportamiento dentro del videojuego «Legislatura», pero no se especifica el numero de ejemplos, el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado.

La innovacion tecnica destacable no esta en el entrenamiento sino en el empaquetado: el modelo se distribuye en formato MLC `q4f16_1`, disenado para ejecucion en el navegador mediante WebLLM. Esto implica pesos cuantizados a 4 bits con activaciones en FP16, optimizados para el runtime de MLC-LLM con aceleracion WebGPU. No se documentan detalles sobre el proceso de conversion ni sobre posibles perdidas de calidad derivadas de la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Qwen2.5-7B-Instruct.
- Respuestas multi-turno en el contexto del videojuego «Legislatura» (unico dominio documentado del ajuste).
- Capacidades multilingues del modelo base (Qwen2.5 soporta chino, ingles y otros idiomas), aunque no se confirma su preservacion tras el ajuste.
- Generacion de codigo y matematicas del modelo base, sin datos que confirmen su conservacion.
- Soporte de tool calling / function calling del modelo base, no verificado en este ajuste.
- Ejecucion en navegador via WebLLM con WebGPU, gracias al formato MLC q4f16_1.

No hay informacion sobre modos de pensamiento (thinking), vision, audio ni capacidades de agente multi-paso especificas de este ajuste.

## Casos de uso

- Integracion como NPC conversacional en el videojuego «Legislatura»: el modelo esta ajustado con ejemplos propios del juego, por lo que es el caso de uso principal y documentado; se usaria para generar dialogos de personajes o respuestas a acciones del jugador.
- Despliegue en navegador sin backend: al estar en formato MLC q4f16_1 compatible con WebLLM, puede ejecutarse en el cliente via WebGPU, eliminando la necesidad de infraestructura de inferencia en servidor para el juego.
- Prototipado de mecanicas conversacionales: util para iterar rapidamente sobre sistemas de dialogo en un contexto de juego, cargando el modelo directamente en la web.
- Demos interactivas de IA en el navegador: sirve como ejemplo de integracion de un modelo de 7B cuantizado en una aplicacion web ligera.
- Evaluacion de ajustes finos de dominio: util para investigadores que quieran estudiar como un fine-tuning especifico afecta el comportamiento de Qwen2.5-7B en tareas generales frente a las del dominio.
- Base para futuros ajustes del mismo dominio: el repo puede servir como punto de partida para versiones posteriores del modelo del juego, dado el esquema de versionado en el nombre (`v20261105-1821`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 4,3 GB en cuantizacion q4f16_1, por lo que se necesita al menos ~4-5 GB de memoria disponible en el dispositivo para cargar los pesos.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el caso WebLLM; para despliegue nativo con MLC-LLM, GPUs con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en tarjetas con 6 GB o mas de VRAM en la cuantizacion q4f16_1; en el caso de WebLLM, la memoria procede de la GPU integrada o dedicada del navegador.
- Opciones de despliegue: WebLLM (navegador con WebGPU) es el destino documentado; MLC-LLM para runtime nativo; otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este repo en formato MLC.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legislatura-7b-v20261105-1821-MLC | ~7,6B | 32.768 (heredado, no confirmado) | MLC q4f16_1 | No disponible (base Apache 2.0) | Hugging Face, 0 descargas |
| mlc-ai/Qwen2.5-7B-Instruct-q4f16_1-MLC | ~7,6B | 32.768 | MLC q4f16_1 | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-7B-Instruct (original) | ~7,6B | 32.768 (131.072 con YaRN) | safetensors | Apache 2.0 | Hugging Face |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 | safetensors, GGUF | Apache 2.0 | Hugging Face |

El modelo de `tom986` es esencialmente una variante ajustada del mismo artefacto MLC publicado por el equipo de MLC, por lo que su rendimiento general deberia ser comparable al de Qwen2.5-7B-Instruct salvo en el dominio de ajuste, donde no hay datos publicados.

## Limitaciones y advertencias

- El ajuste fino con "ejemplos propios" del videojuego puede degradar capacidades generales del modelo base (olvido catastrofico), sin datos que lo confirmen o descarten.
- No se documentan sesgos conocidos, pero el modelo hereda los del base Qwen2.5-7B-Instruct.
- Riesgo de alucinacion: alto en dominios fuera del ajuste, ya que no hay evaluacion publicada.
- La licencia del ajuste no esta declarada; el modelo base es Apache 2.0, pero el autor no especifica condiciones para el artefacto derivado. Verificar antes de uso comercial.
- El formato MLC q4f16_1 esta pensado para WebLLM; no es directamente utilizable en vLLM, llama.cpp u Ollama sin conversion.
- Sin datos de benchmarks, composicion del dataset ni evaluacion de calidad: no se recomienda para produccion sin validacion propia.
- El modelo esta orientado a un unico dominio (videojuego «Legislatura»); su utilidad general es incierta.

## Enlaces

- Hugging Face: https://huggingface.co/tom986/legislatura-7b-v20261105-1821-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Referencia MLC del base: https://huggingface.co/mlc-ai/Qwen2.5-7B-Instruct-q4f16_1-MLC
- WebLLM: https://webllm.mlc.ai/
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
