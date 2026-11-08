# zephel01/GLM-5.3-Flash-IQ2_XS-32G96G-GGUF

## Resumen

GLM-5.3-Flash-IQ2_XS-32G96G-GGUF es una cuantización GGUF de tipo mixto del modelo zai-org/GLM-5.3-Flash, publicada por el usuario zephel01 bajo licencia MIT. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 320.759.404.382 parámetros totales (aproximadamente 321B), pensado para generación de texto conversacional. La cuantización está específicamente dimensionada para ejecutarse en un PC con una GPU de 32 GB de VRAM (RTX 5090 o AI PRO R9700) más 96 GB de RAM, así como en un DGX Spark con 128 GB de memoria unificada.

El objetivo de esta build es conseguir que el archivo completo (94,1 GB) quepa en la combinación VRAM + RAM, evitando lecturas desde SSD durante la inferencia. Se conservan todos los expertos (sin poda) y se re-cuantizan con la técnica LDLQ a partir de los pesos UD-Q4_K_XL de unsloth, usando un volcado de Hessian sobre transcripciones de chat en la plantilla de GLM (inglés, código y japonés) junto con la imatrix de unsloth. El resultado es un promedio de 2,26 bits por peso, equivalente aproximadamente a IQ2_XS.

La relevancia actual radica en que permite ejecutar localmente un modelo MoE de 321B en hardware de consumo de gama alta, con velocidades medidas de 75,7 tok/s en RTX 5090 + 96 GB RAM y 27,4 tok/s en DGX Spark. La model card la marca explícitamente como BETA: las mediciones se han hecho en un solo PC y las pruebas de carga en llama.cpp están todavía en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) |
| Parametros totales | 320.759.404.382 (aprox. 321B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixto: IQ2_XXS 58%, IQ2_S 36%, IQ3_XXS 3%, Q2_K 2%, Q3_K 1% (por bytes); media de 2,26 bits por peso (aprox. IQ2_XS) |
| Idiomas soportados | no disponible en la ficha de HF; la calibración cubre inglés, código y japonés |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards, `S1/GLM-5.3-Flash-S1-0000N-of-00004.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 321B parámetros. Esta build concreta no re-entrena el modelo: parte de la cuantización UD-Q4_K_XL de unsloth y aplica una re-cuantización selectiva. Los expertos enrutados (capas 3 a 44) se re-cuantizan con LDLQ usando un volcado de Hessian de transcripciones de chat en la plantilla de GLM (inglés, código y japonés) y la imatrix de unsloth: gate/up en IQ2_XXS (capa 11 en IQ2_S), down en IQ2_S (capas 11, 12 y 44 en IQ3_XXS). Las capas densas (salida de atención, q_b de atención y down del experto denso/compartido) se mantienen en Q5_K; el resto de proyecciones de atención, gate/up denso y proyección NextN en Q4_K. Router, embeddings, salida y el resto de la capa NextN (MTP) conservan los bytes de UD-IQ2_XXS.

La innovación técnica principal es la estrategia de reparto VRAM/RAM: el motor Abyss mantiene los expertos más usados en VRAM, el resto en RAM y solo lee desde SSD lo que no cabe. Al ser 94,1 GB, la build S1 cabe en 32 GB de GPU + 96 GB de RAM y prácticamente nunca espera al SSD (0,3 ms por token frente a 3,2 ms de la referencia de unsloth, que con 101,8 GB no acaba de encajar). La capa NextN (MTP) sugiere soporte de decodificación especulativa, coherente con la medición en DGX Spark (27,4 tok/s con drafting frente a 21,4 sin él).

## Capacidades

- Generación de texto conversacional multi-turno (la model card reporta una prueba de conversación de 11 turnos).
- Razonamiento y tareas de código: la calibración y las pruebas reales incluyen tres tareas de programación.
- Soporte de tool calling / function calling (verificado en las pruebas `--check` de Abyss).
- Capacidad de recuperación en contexto largo: prueba needle de 8K a 63K tokens superada.
- Capacidades multilingües con calibración específica para inglés, código y japonés.
- Decodificación especulativa mediante la capa NextN (MTP) del modelo base.
- Compatible con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Inferencia local de un MoE de 321B en un PC de gama alta: con una RTX 5090 (32 GB) y 96 GB de RAM, el archivo S1 encaja completo y ofrece unos 75,7 tok/s con prompt de 4K, lo que permite usar el modelo como asistente local sin depender de la nube.
- Despliegue en DGX Spark: con 128 GB de memoria unificada todo cabe en memoria y se miden 27,4 tok/s (21,4 sin drafting), adecuado para prototipado y experimentación en un equipo compacto.
- Asistente conversacional multi-turno: la build supera pruebas de conversación de 11 turnos y tool calling, por lo que sirve para chats con memoria de contexto e invocación de funciones.
- Automatización de tareas de código: las pruebas `--check` incluyen tres tareas de programación y tool call, lo que permite integrarla en flujos de generación de código y revisión asistida.
- Análisis de documentos largos: la prueba needle de 8K a 63K tokens valida la recuperación de información en contextos extensos, útil para resúmenes y Q&A sobre corpus largos.
- Experimentación con cuantización extrema: al ser una build BETA con métricas KL publicadas (0,2534 en 14 secuencias), sirve como referencia para investigadores que evalúen técnicas LDLQ e imatrix en modelos MoE grandes.
- Uso en japonés: la calibración incluye cinco secuencias japonesas y la KL japonesa (0,251) es ligeramente mejor que la de unsloth (0,257), por lo que es una opción razonable para texto en japonés cuando el presupuesto de memoria es de 96 GB.

## Benchmarks y rendimiento

| Metrica | S1 (esta build) | unsloth UD-IQ2_XXS | Q120d (32G128G) |
|---|---:|---:|---:|
| Tamano de descarga | 94,1 GB | 101,8 GB | 127,9 GB |
| KL (14 secuencias) | 0,2534 | 0,2643 | 0,1367 * |
| KL japones (5 secuencias) | 0,251 | 0,257 | 0,145 * |
| Mismo token top | 77,3% | 76,6% | 84,9% * |
| RTX 5090, prompt 4K | 75,7 tok/s | 53,3 tok/s | 23,2 tok/s (limitado por SSD) |
| RTX 5090, prompt 16K | 69,8 tok/s | 50,5 tok/s | 21,1 tok/s |
| DGX Spark | 27,4 tok/s (21,4 sin drafting) | 24,2 / 19,8 tok/s | no disponible |

\* Q120d corresponde a la medición antigua de 10 secuencias y no es directamente comparable con las cifras de 14 secuencias. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 32 GB de GPU para el objetivo de diseño; el resto del archivo (94,1 GB) se reparte entre RAM y, si no cabe, SSD.
- Configuración de referencia: RTX 5090 (32 GB) + 96 GB de RAM + NVMe SSD, con el tier de RAM de Abyss configurado en 60 GB (`STRATA_GLM_RAM_GB=60`).
- GPU alternativas: AI PRO R9700 (32 GB) como objetivo declarado; DGX Spark (128 GB de memoria unificada) medida a 27,4 tok/s.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB combinada con 96 GB de RAM. Con solo 64 GB de RAM parte del archivo se lee desde SSD y baja el rendimiento.
- Despliegue: motor Abyss (mediciones oficiales); carga en llama.cpp en curso y sin resultados publicados. Con 128 GB de RAM o más, encaja también la build de mayor calidad 32G128G.
- Latencia y throughput: 75,7 tok/s (4K) y 69,8 tok/s (16K) en RTX 5090 + 96 GB RAM; 0,3 ms por token de espera de SSD frente a 3,2 ms en la referencia unsloth. En un desktop DDR5 convencional se esperan cifras menores porque la parte calculada en CPU es más lenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash S1 (esta build) | 321B (MoE) | no disponible | MIT | GGUF (4 shards) | Hugging Face, BETA |
| unsloth UD-IQ2_XXS | 321B (MoE) | no disponible | MIT (modelo base) | GGUF | Hugging Face |
| Q120d (32G128G, zephel01) | 321B (MoE) | no disponible | MIT | GGUF | Hugging Face, requiere más de 96 GB RAM para ser rápido |

La comparación se limita a builds del mismo modelo base, ya que la información disponible no incluye alternativas de otros desarrolladores. S1 ofrece menor tamano (94,1 GB) y mayor velocidad que unsloth UD-IQ2_XXS a costa de una calidad ligeramente inferior a la build Q120d (KL 0,2534 frente a 0,1367, aunque esta última se midió con 10 secuencias).

## Limitaciones y advertencias

- Estado BETA: las mediciones se han realizado en un único PC y las pruebas de carga en llama.cpp están pendientes; el archivo puede ser reemplazado por una build mejor (y cambiar el nombre de carpeta).
- La velocidad depende críticamente de que el archivo quepa en VRAM + RAM; si parte se lee desde SSD, el rendimiento cae drásticamente (23 tok/s en la build de 127,9 GB).
- En desktops con DDR5 convencional, la parte calculada en CPU es más lenta que en la configuración medida (Ryzen AI Max+ 395 con LPDDR5X), por lo que las cifras de tok/s no son extrapolables.
- Calidad inferior a cuantizaciones mayores: KL de 0,2534 frente a 0,1367 de la build Q120d, con un 77,3% de mismo token top.
- Ligera desventaja en una de las secuencias de código respecto a la referencia unsloth, aunque mejor en inglés y japonés.
- Idiomas soportados no documentados en la ficha de Hugging Face; la calibración cubre inglés, código y japonés, pero no hay garantías para otros idiomas.
- Longitud de contexto no disponible en la información proporcionada; las pruebas needle llegan hasta 63K tokens, pero no se especifica la ventana máxima oficial.
- Riesgo de alucinación y sesgos inherentes al modelo base, no evaluados en esta cuantización.
- Licencia MIT, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash.
- El reparto VRAM/RAM lo gestiona el motor Abyss; otros motores pueden no aplicar la misma política de expertos en VRAM y degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ2_XS-32G96G-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Build de mayor calidad 32G128G: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF
- Build para DGX Spark: https://huggingface.co/zephel01/GLM-5.3-Flash-DGX-Spark-GGUF
- Repositorio del motor Abyss: https://github.com/zephel01/Abyss
- Incidencias de Abyss: https://github.com/zephel01/Abyss/issues
