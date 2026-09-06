# wepiqx/ASHQ1

## Resumen

ASHQ1 (Autonomous Selective Hybrid Quantization v1) es un metodo de cuantizacion post-entrenamiento para modelos GGUF desarrollado por wepiqx. No es un modelo de lenguaje en si, sino una tecnica que maximiza la calidad teorica por megabyte mediante una cola de prioridad basada en imatrix. En lugar de aplicar un bit-depth uniforme o bloques heuristicos, trata los grupos de tensores atados como unidades monoliticas y los mejora de forma greedy segun una utilidad matematica estricta: producto de importancia sumada y reduccion teorica de MSE, dividido por el coste en tamano.

El metodo esta pensado para modelos como Qwen3.5, Gemma4, MoE y MTP, y se distribuye como archivos GGUF para su uso con llama.cpp. ASHQ1 es un proyecto experimental y personal, actualmente en desarrollo activo, con una ultima actualizacion (v7) que anade deteccion de cabezas MTP, fijacion de output/embd en Q5_K fuera del presupuesto, mitigacion de la toxicidad sub-4-bit y un modo top-down. Los parametros totales, la longitud de contexto y las capacidades de generacion dependen del modelo base sobre el que se aplica la cuantizacion, por lo que no se pueden especificar de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (metodo de cuantizacion post-entrenamiento para modelos GGUF) |
| Parametros totales | No disponible (depende del modelo base) |
| Parametros activos | No disponible (solo aplica a modelos MoE; no especificado) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | GGUF: Q4_K, Q5_K, Q8_0, IQ2_XXS, IQ4_XS, IQ4_NL, F16, etc. (cuantizacion hibrida selectiva con imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

ASHQ1 no es una arquitectura de red neuronal, sino un algoritmo de compresion que opera sobre pesos ya entrenados. Se basa en cinco componentes principales: asignacion de suelo (floor assignment), calculo de importancia mediante imatrix, deteccion de grupos de tensores atados, drenaje de una cola de prioridad y un modo top-down opcional. La asignacion de suelo fija los tensores estructurales (normas, SSM, output y token_embd) en niveles minimos: output y token_embd se fijan en Q5_K fuera del presupuesto, las cabezas MTP en Q8_0 y los routers MoE en F16. Las matrices de pesos comienzan en Q4_K o IQ4_XS para modelos QAT.

La importancia se calcula con el imatrix `in_sum2`, que mide la contribucion de cada peso a la varianza de la salida. Los tensores con arrays `in_sum2` identicos se consideran atados y forman un grupo unico de mejora. La cola de prioridad evalua cada mejora posible con la formula `utilidad/MiB = suma(importancia del grupo) × (MSE_actual − MSE_siguiente) / (tamano_siguiente − tamano_actual)`, donde el MSE teorico se calcula como `2^(-2 × bpw)` y los K-quants reciben un bpw efectivo superior a los IQ-quants. El modo top-down invierte el proceso: todos los tensores comienzan en F16 y se degradan de forma greedy hasta alcanzar el presupuesto objetivo. No hay entrenamiento ni RLHF/DPO: es un metodo exclusivamente post-entrenamiento.

## Capacidades

- Cuantizacion selectiva basada en importancia (imatrix) para maximizar la calidad por megabyte.
- Soporte para arquitecturas MoE, MTP y SSM, asi como para modelos Granite-4.2 y Ling-3.0 MoE mediante deteccion por metadatos `general.architecture`.
- Deteccion de tensores atados (tied groups) que evita que grupos grandes se queden sin presupuesto.
- Modo top-down que comienza en F16 y degrada de forma greedy, con resultados comparables al modo bottom-up en perplejidad.
- Mitigacion de la toxicidad sub-4-bit (low-bit disease) mediante un factor de inflacion del MSE para tensores por debajo de 4.0 bpw reales.
- Generacion de archivos GGUF listos para llama.cpp, con cabezas MTP conservadas a Q8_0.
- Las capacidades de generacion, razonamiento, codigo o tool calling dependen del modelo base cuantizado; ASHQ1 no las anade ni las elimina.

## Casos de uso

- Despliegue de modelos MoE grandes en GPU de consumo: cuantizar un modelo de 9B con cabeza MTP para que quepa en unos 6.5 GB de VRAM, manteniendo la calidad de razonamiento. Es adecuado porque ASHQ1 conserva la cabeza MTP completa a Q8_0 y optimiza el presupuesto para la calidad teorica.
- Ejecucion local en CPU con llama.cpp: reducir el tamano de un modelo GGUF para que pueda cargarse en sistemas sin GPU, aprovechando la cuantizacion hibrida selectiva que prioriza los tensores mas importantes.
- Optimizacion de pipelines de inferencia en entornos con VRAM limitada: fijar un presupuesto de tamano objetivo y obtener automaticamente una cuantizacion equilibrada sin ajuste manual, lo que ahorra tiempo en comparacion con metodos heuristicos.
- Prototipado rapido de modelos cuantizados: el metodo permite especificar un tamano objetivo y generar el archivo GGUF correspondiente, lo que facilita experimentar con diferentes modelos base en un mismo hardware.
- Investigacion en compresion de modelos: comparar el rendimiento de ASHQ1 con cuantizaciones uniformes o con otros metodos hibridos, usando la perplejidad como metrica. Los resultados publicados muestran mejoras frente a uniform Q6_K en modelos Ornith.
- Integracion en herramientas de despliegue como Ollama o TGI: los archivos GGUF generados se pueden empaquetar y servir en estos entornos, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

El autor ha publicado resultados de perplejidad (PPL) con ventana de contexto 1024, medidos sobre modelos Ornith. Los valores de Remix Quality se midieron sin cabezas MTP, mientras que ASHQ1 mantiene la cabeza MTP completa a Q8_0 dentro del archivo. No se han encontrado benchmarks adicionales en la informacion disponible.

| Metodo | Modelo | Tamano | PPL (ctx 1024) | Delta vs uniforme |
|---|---|---|---|---|
| ASHQ1 (v7) | Ornith-1.5-9B-MTP | 6511 MiB | 8.6341 ± 0.06112 | — |
| ASHQ1 top-down (v7) | Ornith-1.5-9B-MTP | 6509 MiB | 8.6337 ± 0.06111 | — |
| Remix Quality-36pc | Ornith-1.5-9B (sin MTP) | 6330 MiB | 9.3692 | +0.7351 |
| ASHQ1 (v7) | Ornith-1.0-9B-MTP | 6011 MiB | 7.4830 ± 0.04876 | −0.1418 |
| Uniform Q6_K | Ornith-1.0-9B-MTP | 7198 MiB | 7.6248 ± 0.05039 | baseline |

## Requisitos de hardware

- VRAM estimada: para un archivo GGUF de 6.5 GB se recomienda una GPU con al menos 8 GB de VRAM, incluyendo overhead de contexto y buffers. Para archivos de 6.0 GB, 8 GB son suficientes.
- GPU recomendadas: RTX 3060 12GB, RTX 4070, RTX 4080, A100 o H100 para modelos de mayor tamano. El metodo no requiere GPU especifica para la cuantizacion en si, pero la inferencia del modelo cuantizado si depende del hardware.
- Compatibilidad con GPU de consumo: si, para cuantizaciones de 6-7 GB en tarjetas de 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama y TGI (si soportan GGUF). vLLM requiere adaptacion y no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Metodo | Modelo | Tamano | PPL (ctx 1024) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ASHQ1 (v7) | Ornith-1.5-9B-MTP | 6511 MiB | 8.6341 | MIT | HuggingFace |
| ASHQ1 (v7) | Ornith-1.0-9B-MTP | 6011 MiB | 7.4830 | MIT | HuggingFace |
| Remix Quality-36pc | Ornith-1.5-9B (sin MTP) | 6330 MiB | 9.3692 | No especificada | No disponible |
| Uniform Q6_K | Ornith-1.0-9B-MTP | 7198 MiB | 7.6248 | No especificada | No disponible |

ASHQ1 supera a la cuantizacion uniforme Q6_K en el modelo Ornith-1.0-9B-MTP con un tamano menor (6011 MiB frente a 7198 MiB) y una PPL inferior (7.4830 frente a 7.6248). Frente a Remix Quality, un metodo de cuantizacion hibrida, ASHQ1 logra una PPL de 8.6341 en un tamano de 6511 MiB, frente a 9.3692 en 6330 MiB, aunque la comparacion debe matizarse porque Remix Quality se midio sin cabezas MTP.

## Limitaciones y advertencias

- Proyecto experimental: el propio autor indica que es un proyecto personal de investigacion en desarrollo, sin garantias de estabilidad ni resultados consistentes en todas las arquitecturas.
- Los resultados pueden variar entre arquitecturas y fine-tunes; las mejoras observadas en modelos Ornith no son extrapolables a otros modelos sin validacion previa.
- Riesgo de degradacion de calidad en bitrates bajos: aunque se aplica una mitigacion para tensores sub-4-bit, la calidad puede degradarse de forma superlineal en presupuestos muy reducidos.
- Dependencia de datos imatrix: si faltan datos de imatrix para un tensor, este se mantiene en Q4_K, lo que puede limitar la calidad en bitrates bajos.
- La licencia MIT se aplica al metodo y a los archivos generados, pero la licencia del modelo base cuantizado debe verificarse por separado antes de un uso comercial.
- No es un modelo de lenguaje: las capacidades de generacion, tool calling o vision dependen exclusivamente del modelo base sobre el que se aplica la cuantizacion.

## Enlaces

- HuggingFace: https://huggingface.co/wepiqx/ASHQ1
- Repositorio de ejemplo (Ornith-1.0-9B-ASHQ1-GGUF): https://huggingface.co/wepiqx/Ornith-1.0-9B-ASHQ1-GGUF
