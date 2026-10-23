# XGeorgeCostanzaX/Qwen3.8-27B-Nyquant-preview

## Resumen

`XGeorgeCostanzaX/Qwen3.8-27B-Nyquant-preview` es un repositorio de cuantizaciones de precisión mixta (formato propietario "Nyquant") sobre el modelo base `Qwen/Qwen3.8-27B` (revision `1d4bf0f2`), publicado por el usuario XGeorgeCostanzaX. No es un modelo entrenado desde cero: es un paquete de artefactos comprimidos que incluye una exportación de 4,30 bits compatible con AWQ para vLLM sobre Intel Arc B70 y un GGUF de 3,29 bits pensado para Tesla P100 de 16 GB, acompañado de un conjunto de 11 parches para llama.cpp. El modelo base tiene 27.320.697.856 parámetros y licencia Apache-2.0.

El problema que aborda es el despliegue de un modelo de ~27B en hardware con VRAM limitada o poco convencional: la variante NQ4MAX-B70 ocupa 20,1 GB (18,7 GiB) en 5 shards de safetensors y no requiere parches, mientras que RC3Y reduce el artefacto a 11,65 GB para caber en una P100 de 16 GB. El autor declara +0,012 nats de degradación frente a BF16 para la variante de 4 bits y un KLD macro D4 de 0,143355 para la de 3 bits en su propio banco de evaluación de cuatro dominios.

Es relevante ahora por dos motivos: por un lado, documenta con detalle inusual (intervalos de confianza bootstrap, comprobaciones de igualdad de runtime) el proceso de cualificación de cuantizaciones de muy baja precisión; por otro, es explícitamente una *preview* pública con cero descargas y cero likes, con puertas de calidad aún abiertas (el 2-bit falla el criterio K3) y sin resultados de benchmarks de tarea publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la informacion proporcionada no detalla la arquitectura del modelo base Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4,30 bpw (NQ4MAX-B70, exportacion compatible con AWQ); 3,29 bpw (RC3Y, GGUF propietario); 3,58 bpw (B3, tipos GGUF estandar); 2 bits (q2lite, runtime de referencia FP32 empaquetado) |
| Idiomas soportados | en (unico idioma declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (5 shards, exportacion AWQ-compatible para vLLM) y GGUF (RC3Y personalizado; B3 con tipos estandar de upstream) |

Datos adicionales del repositorio: tamano total 31,7 GB, 0 descargas, 0 likes, creado el 2026-10-22 y actualizado el 2026-10-23. Artefactos descargables: `NQ4MAX-B70-AWQ/` (20.085.536.800 bytes en 5 safetensors + tokenizer y config, con `SHA256SUMS`) y `RC3Y/Qwen3.8-27B-RC3Y-P100.gguf` (11.650.719.040 bytes, SHA-256 `668faf132b4fcadcf6c36ebf834d83adac44ef621a2d3879342a793976f945ed`), mas `RC3Y/llama.cpp-p100-patches/` (11 parches MIT + `BUILD.md`, aplicar sobre llama.cpp `69f201a2`, build b11551).

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura del modelo base ni sobre su proceso de entrenamiento (tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada. Este repositorio no entrena pesos: aplica cuantizacion de precision mixta sobre los tensores de `Qwen/Qwen3.8-27B`, con un promedio declarado de bits por peso referido al *body* del modelo, no al archivo completo.

La innovacion tecnica documentada esta en el proceso de cuantizacion y cualificacion, no en el modelo. El autor publica un banco de calidad "D4" que mide KLD macro sobre cuatro dominios frente a una referencia BF16, con ventanas de confianza bootstrap al 95 %, y distingue explicitamente entre artefactos puntuados en llama.cpp sobre GGUF nativos y artefactos puntuados en un runtime de referencia propio en FP32 empaquetado (caso de q2lite), advirtiendo que la comparacion cruzada de runtimes no es equivalente hasta que se complete una comprobacion de igualdad de runtime. Para la variante de 3 bits RC3Y se incluye un conjunto de parches que anade tipos de tensor personalizados que el llama.cpp upstream no puede cargar.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`); es la unica capacidad declarada de forma explicita.
- No se documentan capacidades de razonamiento, codigo, matematicas, vision ni audio para estas variantes.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Multilingue: limitado a ingles segun el campo `language: en` de la model card.
- Capacidad destacada por el autor: decodificacion con MTP (multi-token prediction) activada en las mediciones de velocidad (58-59 t/s en NQ4MAX-B70; 38,9 t/s con MTP K=2 en RC3Y).
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con vLLM en el caso de la exportacion AWQ.

## Casos de uso

- Despliegue de un modelo de 27B en una Tesla P100 de 16 GB: RC3Y ocupa 11,65 GB, de modo que deja margen para cache KV y permite servir generacion de texto en hardware Pascal de segunda mano, aplicando los 11 parches incluidos a llama.cpp build b11551.
- Inferencia en Intel Arc B70 con vLLM: la exportacion NQ4MAX-B70 (20,1 GB) funciona sin parches y es la opcion de mayor calidad del repositorio, adecuada para servir chat multi-turno en ingles con decodificacion MTP a 58-59 t/s en concurrencia 1.
- Laboratorio de evaluacion de cuantizaciones: el repositorio publica KLD macro D4 con intervalos bootstrap y artefactos de control, por lo que sirve como referencia reproducible para comparar tecnicas de cuantizacion de 2 y 3 bits en igualdad de tamano.
- Sustitucion de GGUF comunitarios en un pipeline de llama.cpp ya existente: para GPU distintas de P100 y para CPU, el autor recomienda usar GGUF estandar de unsloth o bartowski en lugar de RC3Y, que en esas plataformas cae a una ruta de referencia lenta.
- Prototipado de asistentes conversacionales en ingles sobre hardware heterogeneo (Arc para calidad, P100 para coste): el mismo modelo base en dos formatos permite mantener una sola evaluacion funcional y dos backends de despliegue.
- Validacion de integridad de artefactos en produccion: el repositorio incluye `SHA256SUMS` para los 5 shards y un hash explicito para el GGUF, util para verificar descargas en pipelines de CI/CD antes de cargar pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo publica un banco de divergencia (KLD macro D4 frente a BF16) y mediciones de velocidad.

Cuantizaciones de 2 bits y controles publicos:

| Cuantizacion | Bytes del artefacto | KLD macro D4 (menor es mejor) | IC 95 % bootstrap | Runtime |
|---|---:|---:|---|---|
| q2lite-native-late50 | 9.299.294.112 | 0,189467226 | [0,171098225; 0,210809274] | referencia FP32 empaquetada |
| AP-IQ2_S | 9.607.980.896 | 0,205070357 | [0,186003907; 0,226723904] | GGUF nativo / llama.cpp |
| UD-Q2_K_XL | 9.828.981.664 | 0,208431916 | [0,184685052; 0,235335855] | GGUF nativo / llama.cpp |
| bartowski-IQ2_M | 10.522.248.928 | 0,223455428 | [0,203403342; 0,244315571] | GGUF nativo / llama.cpp |
| ISTA GSQ-RCO-IQ2_S | 9.259.510.912 | 0,224526124 | [0,203575330; 0,247890046] | GGUF nativo / llama.cpp |
| UD-IQ2_S | 8.371.970.048 | 0,275715745 | [0,252054192; 0,302576649] | GGUF nativo / llama.cpp |
| bartowski-IQ2_S | 9.684.043.488 | 0,277955272 | [0,255661678; 0,301899920] | GGUF nativo / llama.cpp |
| bartowski-IQ2_XS | 9.088.526.048 | 0,316145283 | [0,291040614; 0,343021908] | GGUF nativo / llama.cpp |

Variantes de 3 bits y de 4 bits:

| Variante | Tamano | Metrica declarada | Nota |
|---|---:|---|---|
| NQ4MAX-B70 | 20,1 GB (18,7 GiB) | +0,012 nats frente a BF16 | tareas evaluadas dentro de los errores estandar declarados |
| RC3Y | 11,65 GB | KLD macro D4 0,143355 | por detras de AP-IQ3_S; medido sobre el archivo original |
| B3 | 12.035.434.112 bytes (3,58 bpw) | KLD macro D4 0,099020051 | inferior a AP-IQ3_S en los 4 corpus a igual tamano; provisional, sin descarga |

Velocidad declarada: 58-59 t/s en NQ4MAX-B70 sobre Intel Arc B70, concurrencia 1, chat con MTP; 38,9 t/s en RC3Y sobre Tesla P100 con MTP K=2, medido en build de desarrollo. No hay datos de latencia (TTFT) ni de throughput agregado a mayor concurrencia.

## Requisitos de hardware

- VRAM para NQ4MAX-B70: 20,1 GB de pesos en BF16/FP16 de activaciones aparte; encaja en GPUs de 24 GB o mas, y en Intel Arc B70 segun el autor.
- VRAM para RC3Y: 11,65 GB de pesos; el objetivo declarado es Tesla P100 de 16 GB, lo que deja aproximadamente 4 GB para cache KV con contexto moderado.
- GPU recomendadas por el autor: Intel Arc B70 con vLLM (NQ4MAX-B70, sin parches) y Tesla P100 16 GB con llama.cpp parcheado (RC3Y).
- GPU no soportadas o no probadas: Tesla P40 y GPUs mas nuevas que la P100; la ruta rapida de RC3Y es exclusiva de P100 y los fallbacks se describen como "no probados y previsiblemente lentos".
- Consumer GPU: no se declara soporte para RTX 4090 ni otras tarjetas consumer; para esos casos el autor remite a GGUF estandar de unsloth o bartowski (IQ3_S y Q3_K_XL tienen mejor calidad a 3 bits en su banco).
- CPU: no recomendado con RC3Y (solo tiene una ruta de referencia lenta); usar GGUF comunitario.
- Opciones de despliegue: vLLM con exportacion AWQ-compatible (NQ4MAX-B70); llama.cpp build b11551 con los 11 parches incluidos (RC3Y). No se mencionan Ollama ni TGI.
- Throughput: 58-59 t/s (Arc B70, c1, MTP) y 38,9 t/s (P100, MTP K=2, build de desarrollo). Sin datos de latencia ni de escalado.

## Comparativa con modelos similares

La comparacion disponible es contra cuantizaciones del mismo modelo base, no contra modelos distintos. No hay informacion sobre modelos alternativos de ~27B.

| Artefacto | Bits (body bpw) | Tamano | Formato / runtime | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| NQ4MAX-B70 | 4,30 | 20,1 GB | safetensors AWQ-compatible / vLLM | Apache-2.0 | descargable (preview) |
| RC3Y | 3,29 | 11,65 GB | GGUF personalizado / llama.cpp parcheado | Apache-2.0 | descargable (preview) |
| AP-IQ3_S | no disponible | ~12 GB (referencia de igual tamano que B3) | GGUF estandar / llama.cpp | no disponible | control publico |
| B3 | no declarado (3,58 bpw) | 12.035.434.112 bytes | GGUF estandar / llama.cpp upstream | Apache-2.0 (repo) | no descargable |
| q2lite | 2 bits | 9.299.294.112 bytes | FP32 empaquetado de referencia | Apache-2.0 (repo) | no descargable |
| GGUF comunitarios (unsloth, bartowski) | 2-3 bits | 8,37-10,52 GB (IQ2) / variable | GGUF estandar / llama.cpp | no disponible | publicos |

## Limitaciones y advertencias

- Es una *preview* publica y temprana: cero descargas y cero likes en el momento de la ficha, sin historial de uso en produccion.
- No hay benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.); solo divergencia KLD frente a BF16. La calidad funcional real no esta cuantificada.
- q2lite falla el criterio K3: la cota superior del intervalo de confianza macro es 0,21080927346309444, por encima del 0,205 exigido. Ademas, su puntuacion se obtuvo en un runtime de referencia FP32 propio y la comprobacion de igualdad de runtime sigue pendiente, por lo que no es comparable de forma directa con los controles en llama.cpp.
- RC3Y queda por detras de AP-IQ3_S en KLD (0,143355) y su build rapida es de desarrollo; las comprobaciones de release siguen abiertas.
- RC3Y usa tipos de tensor personalizados: el llama.cpp upstream no puede cargarlo y requiere aplicar 11 parches sobre la build b11551. Sin ellos, el modelo no es utilizable en la ruta rapida.
- La ruta rapida esta limitada a Tesla P100; en P40, GPUs mas nuevas o CPU el rendimiento esperado es bajo o directamente no esta probado.
- Idioma: solo ingles declarado. No hay soporte multilingue documentado, lo que excluye casos de uso en castellano sin evaluacion previa.
- No se documenta longitud de contexto, soporte de tool calling ni capacidades de agente; no asumir ninguna de ellas en produccion.
- Riesgo de alucinacion: inherente a un modelo de lenguaje de 27B, agravado por la cuantizacion a 3-4 bits; sin datos de evaluacion especificos de factualidad.
- Sesgos: no se publica ninguna evaluacion de sesgo ni de seguridad en la informacion disponible.
- Licencia Apache-2.0 en el repositorio, lo que permite uso comercial, pero el autor no ofrece garantias y los artefactos son experimentales. Verificar `LICENSE` y `NOTICE` por las atribuciones del modelo base.
- B3 y q2lite se listan unicamente por sus resultados de investigacion: no son descargables. No planificar despliegues sobre ellos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/XGeorgeCostanzaX/Qwen3.8-27B-Nyquant-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (revision `1d4bf0f2`)
- GGUF comunitarios recomendados por el autor: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF y https://huggingface.co/bartowski
- La busqueda web realizada no devolvio resultados relevantes para este modelo (papers, blogs, repos o demos); no se dispone de enlaces adicionales verificables.
