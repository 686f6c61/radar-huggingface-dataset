# spiritfather/Ornith-1.5-35B-A3B-REAP20-GM-RP-v3-GGUF

## Resumen

Ornith-1.5-35B-A3B-REAP20-GM-RP-v3-GGUF es una coleccion de cuantizaciones GGUF estaticas del modelo cgg507/Ornith-1.5-35B-A3B-REAP20-GM-RP-v3-FP8, un ajuste fino orientado a roleplay y escritura creativa con funcion de "game master" y personajes antagonistas. El modelo parte de ornith-ai/Ornith-1.5-35B-A3B, un transformer de tipo mezcla de expertos (MoE) con 256 expertos enrutados por capa, del cual se han podado 51 expertos (podado REAP del 20 %, quedando 205 de 256) manteniendo 8 expertos activos por token. El resultado son 28.923.251.840 parametros totales en el checkpoint de safetensors.

La relevancia de esta publicacion es practica: el autor original solo distribuye un checkpoint FP8 por bloques (el repositorio bf16 no es publico), y spiritfather ofrece tres cuantizaciones GGUF (Q4_K_M, Q6_K y Q8_0) generadas por dequantizacion directa de los bloques FP8, sin recuantizar desde un cuantizado inferior. Ademas, cada fichero conserva la cabeza MTP (multi-token prediction) entrenada, lo que permite usarla como borrador especulativo en llama.cpp y acelerar la decodificacion.

El modelo esta pensado exclusivamente para texto (la torre de vision no se incluye) y para ficcion oscura de uso adulto, con un modo de razonamiento interno que escribe en primera persona del personaje dentro de etiquetas `<think>`. La licencia es MIT, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con poda REAP (205 de 256 expertos enrutados por capa, 8 activos por token) y cabeza MTP |
| Parametros totales | 28.923.251.840 |
| Parametros activos | 8 expertos enrutados por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de carga; maximo entrenado no disponible) |
| Tipos de cuantizacion | Q4_K_M (17,7 GB), Q6_K (23,8 GB), Q8_0 (30,8 GB); pesos de origen FP8 por bloques |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); origen en safetensors FP8 por bloques |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con enrutamiento disperso: 256 expertos por capa en el modelo original, reducidos a 205 mediante poda REAP del 20 % (metodo de poda de expertos basado en la relevancia de activaciones), con 8 expertos activos por token. Sobre esa base, el autor del ajuste fino (cgg507) aplico un entrenamiento en varias etapas: un LoRA de tronco, una cabeza MTP y etapas de enrutador, orientadas a comportamiento de game master y roleplay antagonista. No se dispone de datos sobre volumen de tokens, composicion del dataset ni uso de RLHF o DPO.

La innovacion tecnica destacable en esta publicacion es la conservacion de la cabeza MTP entrenada dentro del propio GGUF (tensores `blk.40.nextn.*`). En llama.cpp se puede activar como borrador autospeculativo con `--spec-type draft-mtp`; sin ese flag, la cabeza se ignora y la decodificacion es normal. El proceso de cuantizacion parte del unico checkpoint publico (FP8 por bloques, con error relativo medio declarado por el autor del 2,65 %): `convert_hf_to_gguf.py` de llama.cpp v1.0.0 dequantiza los bloques FP8 con sus escalas, Q8_0 sale directamente de esa conversion y Q6_K y Q4_K_M se cortan desde un GGUF bf16 de la misma conversion, sin recuantizar en cascada.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a roleplay, con voz en primera persona del personaje.
- Escritura creativa de ficcion, incluyendo ficcion oscura y contenido para adultos (etiqueta `not-for-all-audiences`).
- Modo de razonamiento interno (`<think>`) activado por defecto, con presupuesto configurable mediante `thinking_budget_tokens`.
- Funcion de game master: narracion, control de escena y gestion de personajes antagonistas.
- Decodificacion especulativa autosuficiente mediante la cabeza MTP incluida.
- Compatibilidad con plantillas Jinja (`--jinja`) y formato de razonamiento estilo DeepSeek (`--reasoning-format deepseek`).
- Capacidades de vision: no incluidas (la torre de vision no forma parte de estos GGUF).
- Soporte de tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo mantiene coherencia de personaje en sesiones multi-turno dentro de una ventana de 32.768 tokens, adecuada para partidas o narrativas interactivas extensas.
- Motor de game master en juegos de rol de texto: narra escenas, interpreta PNJ antagonistas y mantiene el tono oscuro solicitado, con el modo thinking limitado a unos 1.536 tokens por turno para no penalizar la latencia.
- Escritura asistida de ficcion: generacion de dialogos y escenas con voz de personaje consistente, aprovechando el razonamiento en primera persona como borrador narrativo interno.
- Prototipado de narrativa interactiva en local: al ejecutarse en llama.cpp con Q4_K_M (17,7 GB), permite iterar sobre guiones y arboles de dialogo en hardware de consumo de gama alta.
- Despliegue de servicio de inferencia en una sola GPU: `llama-server` con `-ngl 99`, atencion flash (`-fa on`) y cache KV cuantizada en q8_0 ofrece un endpoint compatible con clientes conversacionales.
- Aceleracion de inferencia en produccion: el uso de `--spec-type draft-mtp` convierte la cabeza MTP en borrador especulativo, reduciendo el coste por token en cargas de generacion larga.
- Experimentacion con tecnicas de poda y cuantizacion: el modelo sirve como caso de estudio de una cadena completa poda REAP, ajuste fino, FP8 y GGUF con MTP preservada.

## Benchmarks y rendimiento

El autor referencia CaliperBench, un benchmark de escritura creativa que puntua calidad de prosa, roleplay y disposicion del modelo, no inteligencia general. No se han incluido puntuaciones numericas en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| CaliperBench | puntuacion no disponible (referencia a caliperbench.com/m/ornith-1.5-reap20-gm-rp-v3/) |
| MMLU, HumanEval, GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB con Q4_K_M, 24 GB con Q6_K y 31 GB con Q8_0, mas el overhead de cache KV.
- Cache KV con contexto de 32.768 tokens y cuantizacion q8_0 en claves y valores: consumo adicional no cuantificado en la informacion disponible.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto completo; RTX 4090 (24 GB) para Q6_K o Q4_K_M; Q4_K_M cabe tambien en GPUs de 24 GB con margen.
- Cabe en GPU de consumo: si, Q4_K_M en RTX 4090/3090 (24 GB) y Q6_K al limite; Q8_0 requiere 32 GB o mas o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), con soporte de `--jinja`, `-fa on`, `-ctk q8_0`, `-ctv q8_0` y `--spec-type draft-mtp`. Otros runners (vLLM, TGI, Ollama) no estan documentados para estos ficheros.
- Latencia y throughput: no disponibles; la cabeza MTP como borrador especulativo esta pensada para reducirlos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-REAP20-GM-RP-v3 (GGUF) | 28,9 B totales, MoE 8 activos | 32.768 (uso documentado) | Roleplay y game master | MIT | GGUF en HF |
| Ornith-1.5-35B-A3B-REAP-20pct | no disponible | no disponible | Base podada sin ajuste de roleplay | no disponible | GGUF en spiritfather/Ornith-1.5-35B-A3B-REAP-20pct-GGUF |
| Ornith-1.5-35B-A3B (original) | no disponible (256 expertos por capa) | no disponible | Modelo base sin podar | no disponible | HF (ornith-ai) |
| Ornith-1.5-35B-A3B-REAP20-GM-RP-v3-FP8 | 28,9 B totales | no disponible | Mismo ajuste en FP8 | MIT | HF (cgg507) |

## Limitaciones y advertencias

- Contenido para adultos: el ajuste esta entrenado con ficcion oscura y lleva la etiqueta `not-for-all-audiences`; no es apto para productos dirigidos a menores ni para entornos sin moderacion.
- Solo texto: la torre de vision no se incluye en estos GGUF, por lo que no hay capacidades multimodales.
- El modelo parte de pesos ya cuantizados en FP8 (error relativo medio declarado del 2,65 %); las cuantizaciones GGUF acumulan ese error de origen, especialmente en Q4_K_M.
- Sin datos publicos de benchmarks generales (MMLU, HumanEval, GSM8K): no se puede evaluar su rendimiento fuera del dominio creativo.
- Idiomas soportados no documentados; el comportamiento fuera del ingles (idioma de la model card) es incierto.
- Riesgo de alucinacion y de deriva de personaje en sesiones muy largas; el modo thinking activado por defecto incrementa tokens generados y latencia si no se limita con `thinking_budget_tokens`.
- La cabeza MTP solo aporta aceleracion si se activa explicitamente con `--spec-type draft-mtp`; sin el flag se ignora.
- Requiere llama.cpp v1.0.0 o posterior para el flujo de conversion y carga documentado.
- Licencia MIT: permite uso comercial, pero la responsabilidad sobre el contenido generado y su adecuacion legal recae en el desplegador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/spiritfather/Ornith-1.5-35B-A3B-REAP20-GM-RP-v3-GGUF
- Modelo fuente FP8: https://huggingface.co/cgg507/Ornith-1.5-35B-A3B-REAP20-GM-RP-v3-FP8
- Base podada REAP-20pct: https://huggingface.co/oxfrug/Ornith-1.5-35B-A3B-REAP-20pct
- GGUF de la base podada: https://huggingface.co/spiritfather/Ornith-1.5-35B-A3B-REAP-20pct-GGUF
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- CaliperBench (ficha del modelo): https://caliperbench.com/m/ornith-1.5-reap20-gm-rp-v3/
- CaliperBench: https://caliperbench.com
- Discord: https://discord.gg/rhE9zdKyE4
