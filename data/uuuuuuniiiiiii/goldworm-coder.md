# Uuuuuuniiiiiii/goldworm-coder

## Resumen

goldworm-coder es un modelo experimental de generación de texto desarrollado por el autor de Hugging Face Uuuuuuniiiiiii (Gold Lab). Se presenta como un MoE (mixture of experts) "upcycled" que opera a nivel de byte, sin tokenizador, con un vocabulario de 256 símbolos y 113.689.648 parámetros totales repartidos en cuatro expertos temáticos: stories, code, math y wiki. La propuesta no es tanto un modelo generativo de propósito general como el cerebro de un agente local que clasifica, enruta y verifica candidatos antes de emitir una respuesta.

El interés del proyecto reside en su enfoque de ingeniería: el modelo no escribe libremente, sino que puntúa líneas candidatas por bits por byte (BPC) y solo promueve parches cuando una prueba pasa de rojo a verde en un worktree de git desechable. Según la model card, el agente envuelve el modelo con una capa de frases generadas por qwen2.5-0.5b, y el conjunto se distribuye como un bundle autocontenido de 1,73 GB.

Es relevante ahora por su honestidad documental sobre límites (0/5 en aritmética como modelo crudo, ARC-AGI a nivel de azar, generación libre con confianza pero incorrecta) y por su arquitectura poco habitual de byte-level sin tokenizador. No obstante, conviene tratarlo como una demo de investigación y no como un modelo de producción: el repositorio contiene stubs de pesos y solo el experto de stories es real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE byte-level sin tokenizador, 4 expertos temáticos (stories / code / math / wiki), vocab 256 |
| Parámetros totales | 113.689.648 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona una ventana ctx-256 en el protocolo de evaluación de goldworm-v6, no confirmada para este modelo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`moe.pt`, `experts/*.pt`); bundle de release en zip |

## Arquitectura y entrenamiento

La arquitectura es un MoE byte-level con enrutamiento biyectivo tema→experto: cada entrada se clasifica en uno de los cuatro temas (stories, code, math, wiki) y se deriva al experto correspondiente. El vocabulario de 256 símbolos elimina el tokenizador y trabaja directamente sobre bytes, lo que simplifica el preprocesado pero limita la eficiencia por token. El modelo se describe como "upcycled", es decir, construido a partir de componentes previos y reorganizado en la estructura MoE, aunque la model card no detalla el proceso exacto de reciclaje.

Los datos de entrenamiento citados son roneneldan/TinyStories y wikitext, lo que explica el sesgo hacia narrativa simple y texto enciclopédico. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La innovación técnica destacable no está en el modelo en sí, sino en el pipeline que lo rodea: clasificación, compuerta de enrutamiento, ranking por BPC, verificación mediante tests y generación de frases con qwen2.5-0.5b. El gate `rsi/gate.py` aplica umbrales congelados y un registro de auditoría encadenado por hash.

## Capacidades

- Generación de texto a nivel de byte, sin tokenizador, sobre temas de stories, code, math y wiki.
- Clasificación de intención y enrutamiento temático hacia uno de los cuatro expertos (la model card menciona una demo de routing 10/10).
- Ranking de líneas candidatas por BPC (menor es mejor), usado como mecanismo de selección en el agente.
- Flujo de parcheo `fix` con verificación rojo→verde mediante tests en un worktree de git desechable.
- Comandos de agente documentados: `fix`, `test`, `inspect`, `generate`, `classify`, `bench`, `help`, `reset`.
- Memoria de sesión para conversación multi-turno (saludos, `2+2`, `7×8`, capitales, "my name is …").
- Soporte de tool calling / function calling: no disponible explícitamente; el agente implementa su propia capa de comandos.
- Capacidades multilingües: no disponibles; los datasets citados son en inglés.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Enrutamiento temático en pipelines de clasificación: el gate biyectivo tema→experto permite dirigir consultas a un experto concreto (stories, code, math, wiki) con una latencia baja al ser un modelo de 113 M de parámetros.
- Selección de candidatos por BPC en generación asistida: en lugar de aceptar la primera salida, el sistema puntúa varias líneas candidatas y elige la de menor BPC, útil en tareas de completado donde la verificación es barata.
- Agente de parcheo verificado en CI: el flujo `fix` promueve un cambio solo cuando un test pasa de rojo a verde en un worktree desechable, lo que encaja en pipelines de integración continua con validación automática.
- Demo educativa de arquitecturas MoE byte-level: el Space Gold_Lab reproduce el comportamiento del agente en el navegador y sirve para explicar enrutamiento, ranking y verificación sin necesidad de GPU.
- Prototipado de asistentes con memoria de sesión: la capa de agente mantiene contexto conversacional (saludos, operaciones simples, nombres) para experimentar con flujos multi-turno de bajo coste.
- Investigación sobre evaluación honesta de modelos pequeños: la model card documenta métricas BPC, límites y artefactos de benchmark, lo que lo hace útil como caso de estudio de reporting reproducible.
- Clasificación de intención en juguetes y prototipos: la demo de routing 10/10 permite integrar un clasificador temático sencillo en aplicaciones de demostración.

## Benchmarks y rendimiento

Los datos son autodeclarados por el autor y medidos con `session_v9_scripts/benchmark_famous.py`; no hay comparación independiente.

| Métrica | Valor |
|---|---|
| TinyStories validation, slice de 256 KB (bits/byte) | 0,8125 |
| WikiText-2 test, slice de 256 KB, zero-shot (bits/byte) | 2,2305 |
| Code-infill interno (vs Qwen2.5-Coder-0.5B) | 5 % vs 47,5 % |
| Aritmética como modelo crudo | 0/5 |
| ARC-AGI | nivel de azar |

La model card advierte que estos números no son comparables con goldworm-v6 (1,0073 bits/byte), que usa otro protocolo (ventana ctx-256 sobre 129.429 posiciones fijas de validación externa) y otro slice. Los valores anteriores de la card (0,8109 en TinyStories val y 2,2385 de "mean topic-tail") quedan sustituidos por los registrados arriba.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 113,7 M de parámetros, en fp32 ocuparía aproximadamente 0,45 GB y en fp16 unos 0,23 GB, pero el bundle real pesa 1,73 GB y no se documentan cuantizaciones.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería poder cargar los pesos si el formato lo permite.
- Cabe en GPU consumer: probablemente sí por número de parámetros, aunque no hay confirmación oficial ni instrucciones de despliegue estándar.
- Opciones de despliegue: carga vía `rsi.gate.load_moe("moe.pt", dev)`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Advertencia de pesos: el `moe.pt` de la raíz es un stub (`stub-moe-placeholder`) y `experts/code.pt`, `experts/html.pt` y `experts/math.pt` son stubs de 16 bytes; solo `experts/stories.pt` es real (152 MB). Los pesos reales están en el asset `goldworm-coder-linux-v0.2.0.zip` (1,73 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goldworm-coder | 113,7 M (MoE, 4 expertos) | no disponible | Byte-level sin tokenizador + agente de ranking/verificación | Apache-2.0 | Pesos parcialmente stub; bundle real en release |
| Qwen2.5-Coder-0.5B | 0,5 B | 32 K (según versión) | Transformer decoder denso para código | Apache-2.0 | Pesos completos en HF |
| goldworm-v6 | no disponible | ctx-256 en protocolo de evaluación | Versión previa del mismo proyecto | no disponible | no disponible |

La comparación directa con Qwen2.5-Coder-0.5B solo está documentada en el benchmark interno de code-infill (5 % vs 47,5 %), donde goldworm-coder queda muy por detrás como generador de código. La comparación con goldworm-v6 está explícitamente desaconsejada por el autor por diferencias de protocolo y slice.

## Limitaciones y advertencias

- Generación libre con confianza pero incorrecta: el modelo puede producir texto plausible sin fundamento.
- Aritmética muy débil como modelo crudo (0/5 en la evaluación interna).
- ARC-AGI a nivel de azar.
- Code-infill muy inferior a Qwen2.5-Coder-0.5B (5 % vs 47,5 % en benchmark interno).
- Pesos incompletos en el repositorio: `moe.pt` y tres de los cuatro expertos son stubs; es necesario descargar el bundle de release y sobrescribirlos.
- Idiomas soportados no documentados; los datasets de entrenamiento son en inglés.
- Sesgos conocidos: no documentados, pero el entrenamiento con TinyStories y wikitext condiciona el estilo y el dominio.
- Licencia Apache-2.0 permite uso comercial, pero el estado experimental y los stubs de pesos hacen desaconsejable su uso en producción.
- Las métricas son autodeclaradas y no han sido replicadas de forma independiente.
- El Space Gold_Lab reproduce el comportamiento en el navegador de forma simulada; no ejecuta el modelo real.
- La pestaña spotlight-vm del Space corresponde a un proyecto de terceros no afiliado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Uuuuuuniiiiiii/goldworm-coder
- Space Gold_Lab: https://huggingface.co/spaces/Uuuuuuniiiiiii/Gold_Lab
- Vídeo explicativo: https://youtu.be/Wuh3_bJSxyY
- Podcast: https://youtu.be/ijVZXPYTsXU
- Proyecto de terceros mencionado (spotlight-vm): https://huggingface.co/percepta-ai/spotlight-vm
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset WikiText: https://huggingface.co/datasets/wikitext
