# Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino los tensores cuantizados en formato GGUF de la capa **MTP (Multi-Token Prediction)** del modelo Qwen3.8-27B, desarrollado por Qwen y publicado en HuggingFace. La capa MTP es un componente auxiliar que permite la decodificación especulativa, acelerando la inferencia al predecir varios tokens a la vez. El autor, Thireus, ha creado este repositorio para integrar dicha capa con su propia herramienta **GGUF Tool Suite**, que automatiza la búsqueda de la mezcla de cuantizaciones óptima para minimizar la perplejidad según el hardware disponible.

La relevancia de este trabajo radica en que ofrece un método flexible y automatizado para generar recetas de cuantización dinámica (Dynamic 3.0 Quants) adaptadas a cada configuración de VRAM/RAM, algo que las cuantizaciones estáticas no permiten. El repositorio incluye la capa MTP en formato GGUF (con 2.967.501.312 parámetros, unos 2,97 mil millones), lista para usarse con `ik_llama.cpp`, una variante de llama.cpp mantenida por Thireus. No se trata de un modelo autónomo: requiere el modelo base Qwen3.8-27B y las herramientas mencionadas para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Capa MTP (Multi-Token Prediction) para decodificacion especulativa, basada en el paper arXiv:2505.23786 |
| Parametros totales | 2.967.501.312 (solo la capa MTP, no el modelo completo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | GGUF (la capa se ofrece en BF16 original y cuantizaciones derivadas via GGUF Tool Suite) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el tensor original, pero el repo distribuye shards GGUF) |

## Arquitectura y entrenamiento

La capa MTP (Multi-Token Prediction) es un modulo adicional que se anade a un modelo transformer autoregresivo para predecir varios tokens futuros de forma simultanea, reduciendo el numero de pasos de decodificacion. El paper arXiv:2505.23786 describe esta tecnica, que se integra en llama.cpp mediante el modo `--spec-type draft-mtp`. No se dispone de informacion sobre el entrenamiento de esta capa especifica (datos, tokens, metodo de optimizacion). El repositorio se centra en la cuantizacion y distribucion de los tensores, no en el proceso de entrenamiento.

La innovacion principal de este repositorio es la integracion con la **GGUF Tool Suite** de Thireus, que permite calcular la combinacion optima de cuantizaciones (por ejemplo, mezclando Q4_K, Q5_K, Q6_K, etc.) para cada tensor, minimizando la perplejidad para un presupuesto de bits por peso (bpw) dado. El autor afirma que esta herramienta supera en rendimiento a las cuantizaciones dinamicas de unsloth en terminos de perplejidad para el mismo bpw.

## Capacidades

- No es un modelo de generacion de texto autonomo; actua como un **borrador (draft)** en el esquema de decodificacion especulativa.
- Permite la **prediccion multi-token** (MTP), acelerando la inferencia del modelo base Qwen3.8-27B.
- Compatible con `ik_llama.cpp` y `llama.cpp` mediante el argumento `--spec-type draft-mtp`.
- Soporta cuantizacion mixta personalizada a traves de la GGUF Tool Suite (recetas de cuantizacion).
- Integrable en pipelines de inferencia local con llama-server, con control fino de contexto y lotes.
- No incluye capacidades de vision, audio ni tool calling propias; estas dependen del modelo base.

## Casos de uso

- **Aceleracion de inferencia local**: al usar la capa MTP como borrador, se reduce el numero de pasos de decodificacion, disminuyendo la latencia en servidores locales con llama.cpp. Es util para aplicaciones de chat en tiempo real.
- **Optimizacion de cuantizacion para hardware especifico**: la GGUF Tool Suite permite generar una receta de cuantizacion que aproveche al maximo la VRAM disponible (por ejemplo, 12 GB de una RTX 3060) manteniendo la perplejidad minima posible.
- **Despliegue en entornos con recursos limitados**: al poder mezclar cuantizaciones (algunas capas en Q8, otras en Q4), se puede ejecutar el modelo en GPUs consumer con menos memoria sin sacrificar demasiada calidad.
- **Investigacion sobre decodificacion especulativa**: el repositorio sirve como referencia para estudiar el impacto de la capa MTP en la perplejidad y velocidad de Qwen3.8-27B.
- **Creacion de modelos GGUF personalizados**: los usuarios pueden fusionar los shards descargados con `llama-gguf-split --merge` para obtener un unico archivo GGUF listo para usar.
- **Benchmarking de cuantizaciones**: la herramienta calcula curvas de perplejidad frente a bits por peso, permitiendo comparar objetivamente distintas configuraciones antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona graficas comparativas de perplejidad frente a otros cuantizadores (como los de unsloth) para el modelo Qwen3.8-27B, pero no se proporcionan valores numericos concretos en el texto. Se indica que las mediciones de perplejidad se realizan con los parametros `-ctk f16 -c 512 -b 512 -ub 512`, y que variar estos parametros altera los resultados.

## Requisitos de hardware

- La capa MTP tiene ~2,97 mil millones de parametros, por lo que en BF16 ocupa aproximadamente 5,9 GB (tamano del repositorio). En cuantizaciones GGUF (por ejemplo, Q8_0) puede reducirse a unos 3 GB.
- Para usarla junto al modelo base Qwen3.8-27B (que tiene 27 mil millones de parametros), se necesita VRAM suficiente para ambos. Una GPU con 24 GB (RTX 3090/4090) puede alojar el modelo base en Q4_K_M (~15 GB) mas la capa MTP en Q8 (~3 GB), dejando margen para el contexto.
- Es posible ejecutar en GPU consumer de 12-16 GB si se usa cuantizacion mixta agresiva y se descargan capas a RAM (offloading parcial).
- Herramientas de despliegue: `ik_llama.cpp` (recomendado), `llama.cpp` estandar con soporte MTP, `llama-server` para servir via API.
- Latencia y throughput estimados: no disponibles; dependen del hardware y la cuantizacion elegida.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo autonomo sino un componente auxiliar para un modelo especifico (Qwen3.8-27B). No existen alternativas directas comparables en el mismo formato (capas MTP cuantizadas para otros modelos) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- **No es un modelo completo**: requiere el modelo base Qwen3.8-27B (https://huggingface.co/Qwen/Qwen3.8-27B) y las herramientas de Thireus (ik_llama.cpp, GGUF Tool Suite) para funcionar.
- **Dependencia de herramientas especificas**: la integracion con la GGUF Tool Suite y `ik_llama.cpp` puede no ser compatible con versiones estandar de llama.cpp sin parches.
- **Sesgos y alucinaciones**: al ser un componente auxiliar, no introduce sesgos propios, pero hereda los del modelo base. No se dispone de evaluaciones de sesgo para esta capa.
- **Riesgo de alucinacion**: la decodificacion especulativa puede amplificar errores si el borrador MTP no es preciso, aunque en la practica suele mantenerse la calidad del modelo base.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero el modelo base Qwen3.8-27B puede tener su propia licencia (no especificada en este repositorio). Se debe verificar la licencia del modelo base antes de uso comercial.
- **Fecha de creacion**: el repositorio fue creado en agosto de 2026, lo que sugiere que es un proyecto reciente y en evolucion; la documentacion puede cambiar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF Tool Suite (GitHub): https://github.com/Thireus/GGUF-Tool-Suite
- Documentacion de la herramienta: https://github.com/Thireus/GGUF-Tool-Suite/tree/main/docs
- Ejemplos de recetas: https://github.com/Thireus/GGUF-Tool-Suite/tree/main/recipe_examples
- Generador de recetas (web): https://gguf.thireus.com/quant_assign.html
- Descargador de modelos (web): https://gguf.thireus.com/quant_downloader.html
- ik_llama.cpp (releases): https://github.com/Thireus/ik_llama.cpp/releases
- Paper sobre MTP: https://arxiv.org/abs/2505.23786
