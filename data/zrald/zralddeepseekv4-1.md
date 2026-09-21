# Zrald/zralddeepseekv4.1

## Resumen

Zrald/zralddeepseekv4.1 es un repositorio de cuantizaciones GGUF publicadas por el usuario Zrald, derivadas del modelo base deepseek-ai/DeepSeek-V4.1-Flash, descrito en su model card como un transformer de tipo Mixture of Experts (MoE) de 748.000 millones de parametros con 384 expertos por capa, de los cuales se activan 6 por token, mas tablas de busqueda n-grama indexadas por hash denominadas "Engram". El autor distribuye tres variantes de cuantizacion (Q4_K_M, Q3_K_M y Q2_K_DEEPSEEK) pensadas para eludir el problema de colapso del enrutador que, segun la model card, sufren las cuantizaciones estandar de 2 bits en modelos MoE con muchos expertos.

La propuesta tecnica del autor se articula en torno a lo que denomina "Decision Surface Consistency" (DSC), una estrategia de cuantizacion mixta que mantiene el enrutador (`ffn_gate_inp`) en Q8_0 (63 MB en total para las 40 capas), protege las tablas Engram a Q6_K/Q8_0 y prioriza el experto compartido (`shexp`) a Q4_K/Q5_K. El objetivo declarado es conservar la fidelidad de la superficie de decision del enrutador y evitar colisiones de hash en las tablas de busqueda, que segun el autor concentran 196.000 millones de parametros (26,2 % del modelo).

El modelo es relevante en el contexto de despliegue de MoE de gran tamano en hardware limitado, ya que el autor reporta mediciones empiricas sobre AMD Instinct MI300X (192 GB HBM3, 235 GB de RAM) comparando cada variante cuantizada contra la referencia Q8_0. Conviene senalar que el repositorio tiene 0 descargas y 0 "likes", que las cifras son autocertificadas por el autor y no verificadas de forma independiente, y que el dato de parametros de los safetensors del repositorio (5.899.892) es inconsistente con los 748B que declara la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (384 expertos, 6 activos por token, ~40 capas) con tablas Engram de busqueda n-grama indexadas por hash |
| Parametros totales | 748B segun la model card; 5.899.892 segun los safetensors del repositorio (dato inconsistente, ver limitaciones) |
| Parametros activos | no disponible (la model card indica activacion de 6 de 384 expertos por token, sin cifra de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (accuracy), Q3_K_M (balance), Q2_K_DEEPSEEK / Q2_K_DS (compressed); referencia Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash, se describe como un MoE de 748B con 384 expertos por capa y enrutamiento dinamico de 6 expertos por token, complementado con tablas Engram (196B de parametros, un 26,2 % del total) que actuan como tablas de busqueda de n-gramas indexadas por hash. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, por lo que esos datos no estan disponibles.

La innovacion que reclama este repositorio no esta en el modelo base, sino en el proceso de cuantizacion. El autor sostiene que la cuantizacion escalar de 2 bits sobre `ffn_gate_inp` provoca que el 94,2 % de los tokens se enruten a expertos incorrectos, y que su motor evita ese "acantilado" manteniendo el enrutador en Q8_0, protegiendo las tablas Engram en Q6_K/Q8_0 para evitar colisiones de hash y fijando el experto compartido (que se ejecuta en el 100 % de los tokens) en Q4_K/Q5_K. No se aportan detalles sobre semillas, calibracion, dataset de calibracion ni reproducibilidad mas alla del whitepaper referenciado.

## Capacidades

- Generacion de texto en el pipeline declarado (`text-generation`).
- Razonamiento matematico: la model card reporta retenciones de entre el 97,15 % y el 99,95 % frente a la referencia, lo que sugiere conservacion de capacidad de razonamiento, sin especificar los benchmarks empleados.
- Generacion de codigo: se reporta una retencion de "code pass-rate" de entre el 96,80 % y el 100,18 % sobre la referencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (los idiomas no figuran en la ficha).
- Modo de razonamiento explicito (thinking), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de inferencia de un MoE de gran escala en hardware AMD: la variante `compressed` (245,5 GB) esta pensada para ejecutarse en una MI300X de 192 GB HBM3 con 235 GB de RAM, reduciendo el espacio de memoria un 48,1 % frente a la referencia Q8_0 de 473,1 GB.
- Servicio de generacion de codigo con fidelidad alta: la variante `accuracy` (Q4_K_M) mantiene, segun el autor, el 98,42 % del pass-rate de codigo Python, por lo que seria adecuada para asistentes de programacion donde un fallo de sintaxis o de logica es costoso.
- Razonamiento matematico asistido: la variante `compressed` reporta una retencion del 99,95 % en razonamiento matematico, lo que la hace utilizable en entornos de resolucion de problemas paso a paso con restricciones fuertes de memoria.
- Investigacion sobre cuantizacion de MoE: el repositorio y su whitepaper sirven como material de estudio para analizar como afecta la cuantizacion de baja precision a las superficies de decision del enrutador en modelos con cientos de expertos.
- Evaluacion comparativa de routers y tablas Engram: permite reproducir experimentos sobre el impacto de la precision (Q8_0 vs Q2_K) en `ffn_gate_inp` y en `engram_embd.weight`, aislando el efecto de cada componente.
- Despliegue en infraestructura con memoria limitada: la variante `balance` (Q3_K_M) ofrece, segun el autor, un punto de Pareto con 309,2-323,4 GB y retenciones del 86,32-97,41 %, util cuando la prioridad es ajustar el consumo de memoria por debajo de los 415 GB de la variante `accuracy`.
- Experimentacion con llama.cpp a gran escala: la distribucion en 7 fragmentos (shards) del modelo `compressed` facilita la descarga y el reparto entre dispositivos usando `huggingface-cli` y llama.cpp.

## Benchmarks y rendimiento

Los siguientes datos estan tomados literalmente de la model card del autor y no han sido verificados de forma independiente. No se han encontrado resultados de benchmarks en las busquedas web realizadas.

| Nivel | Rung | Tamano de archivo | Memoria ahorrada | Retencion vs referencia | Perplejidad Wikitext | Retencion codigo Python | Retencion razonamiento matematico |
|---|---|---|---|---|---|---|---|
| Referencia base original | Q8_0 | 473,1 GB | 0,0 % | 100,00 % | 1,8342 | 100,00 % | 100,00 % |
| accuracy | Q4_K_M | 414,2 GB | 12,5 % | 92,88 % - 99,06 % | 1,9748 | 98,42 % | 99,10 % |
| balance | Q3_K_M | 309,2 - 323,4 GB | 34,6 % | 86,32 % - 97,41 % | 1,8829 | 96,80 % | 97,15 % |
| compressed | Q2_K_DS | 245,5 GB | 48,1 % | 97,61 % - 99,99 % | 1,8792 | 100,18 % | 99,95 % |

Comparativa declarada por el autor frente a una linea base publica estandar (`vcruz305`):

| Nivel | Precision medida (motor del autor) | Linea base web publicada | Ventaja | Tamano real | Tamano publicado | Ventaja de memoria |
|---|---|---|---|---|---|---|
| accuracy | 99,06 % | 92,88 % | +6,18 % | 414,2 GB | 414,2 GB | Tablas Engram protegidas |
| balance | 97,41 % | 86,32 % | +11,09 % | 309,2 GB | 323,4 GB | 14,2 GB menor |
| compressed | 97,61 % - 99,99 % | 33,57 % (colapso) | +64,04 % | 245,5 GB | 246,3 GB | Recuperacion de 64,04 % de precision |

## Requisitos de hardware

- VRAM estimada: 473,1 GB para la referencia Q8_0; 414,2 GB para `accuracy`; 309,2-323,4 GB para `balance`; 245,5 GB para `compressed`. Son tamanos de archivo, no picos de VRAM en tiempo de ejecucion.
- Hardware validado: AMD Instinct MI300X VF con 192 GB de HBM3 y 235 GB de RAM del sistema, segun la model card.
- El modelo excede la RAM del host, por lo que el autor indica que es obligatorio usar banderas especificas en llama.cpp para evitar caidas por falta de memoria (OOM).
- GPU de consumo: no cabe en GPU de consumo. Las 245,5 GB minimas de la variante mas comprimida superan ampliamente los 24 GB de una RTX 4090 o los 48 GB de una RTX 6000 Ada, por lo que se requiere reparto entre varios aceleradores de gran capacidad.
- Opciones de despliegue: llama.cpp (formato GGUF; el autor indica que apuntando a la primera particion se detectan automaticamente las 00002-00007). No se confirma compatibilidad con vLLM, TGI u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zrald/zralddeepseekv4.1 | 748B (MoE, 384 expertos) segun model card | no disponible | Retenciones del 86,32 % al 99,99 % frente a Q8_0 (autocertificado) | apache-2.0 | GGUF, 7 shards, 0 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 748B (MoE, 384 expertos) | no disponible | Referencia Q8_0 con perplejidad Wikitext 1,8342 | no disponible | pesos originales |
| Linea base de cuantizacion estandar (`vcruz305`) | mismo modelo base | no disponible | 92,88 % (Q4), 86,32 % (Q3), 33,57 % (Q2) | no disponible | cuantizaciones publicadas |

No se dispone de datos verificados de otros modelos comparables de la misma categoria dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Cifras autocertificadas: todos los benchmarks y porcentajes de retencion provienen de la model card del autor; no se han verificado de forma independiente y las busquedas web no aportan resultados sobre el modelo.
- Inconsistencia en el recuento de parametros: la model card declara 748B, pero el dato de safetensors del repositorio es de 5.899.892 parametros, lo que no cuadra con un modelo de ese tamano ni con un release GGUF. Conviene tratarlo con cautela.
- Inconsistencia en el tamano: el repositorio ocupa 147,1 GB, mientras que los ficheros descritos en la model card suman unos 245 GB para la variante `compressed`.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, creado y actualizado el 21 de septiembre de 2026, lo que limita la evidencia de uso real.
- Riesgo de alucinacion: no se documenta ningun proceso de evaluacion de veracidad, RLHF o DPO, por lo que persiste el riesgo habitual de generacion de contenido incorrecto.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles en la informacion proporcionada.
- Licencia: apache-2.0, que permite uso comercial, pero la licencia del modelo base DeepSeek-V4.1-Flash no se detalla en la informacion disponible y podria imponer condiciones adicionales.
- Requisitos de memoria extremos: incluso la variante mas comprimida (245,5 GB) excede la memoria de cualquier GPU de consumo y obliga a hardware de centro de datos o reparto entre multiples aceleradores.
- Afirmaciones sin detalle tecnico: no se especifican semillas, dataset de calibracion, versiones de llama.cpp ni condiciones de reproduccion del whitepaper.

## Enlaces

- HuggingFace: https://huggingface.co/Zrald/zralddeepseekv4.1
- Whitepaper (vista en navegador): https://huggingface.co/Zrald/zralddeepseekv4.1/blob/main/whitepaper.pdf
- Whitepaper (descarga directa): https://huggingface.co/Zrald/zralddeepseekv4.1/resolve/main/whitepaper.pdf
- Modelo base: deepseek-ai/DeepSeek-V4.1-Flash
- Linea base de cuantizacion citada por el autor: vcruz305 (sin URL disponible)
