# Studio-Research-M1/Flint-40B-A2.5B-abliterated-oQ8e-BF16-MLX

## Resumen

Flint-40B-A2.5B-abliterated-oQ8e-BF16-MLX es una cuantización mixta de 8 bits (oQ8e) para Apple Silicon, creada por Studio-Research-M1 a partir de dima6312/Flint-40B-A2.5B-abliterated, que a su vez es una versión "abliterated" (sin filtros de alineación) del modelo base RecursiveSI/flint. Se trata de un modelo de texto mixture-of-experts (MoE) con 39,8 mil millones de parámetros totales y unos 2,5 mil millones activos por token, convertido al formato MLX para su ejecución nativa en Mac.

El problema que resuelve es doble: por un lado, eliminar los rechazos de seguridad del modelo original (abliteration); por otro, ofrecer una cuantización que preserve la calidad del BF16 original sin penalizar la velocidad. A diferencia de los modelos densos, en Flint la construcción de 8 bits no es más lenta que la de 4 bits en un M1 Max, porque el decodificado no está limitado por el ancho de banda de memoria (la hipótesis de los autores es que el enrutado MoE sobre 256 expertos domina el coste).

La relevancia de esta ficha está en su perfil de eficiencia: con solo ~2,5B de parámetros activos, el modelo alcanza unos 50 tok/s de decodificación y 400–500 tok/s de prefill en un Apple M1 Max, tan rápido como el build MLX INT4 oficial de Recursive en la misma máquina. La cuantización oQ8e presenta un KLD medio de 0,077 frente a FP32, por debajo del propio suelo numérico BF16 del modelo (0,088), lo que indica una fidelidad muy alta. Es un modelo solo de texto, sin torre de visión ni cabeza de predicción multi-token (MTP).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) transformer, solo texto |
| Parametros totales | 39.785.299.488 (~39,8B, dato real de safetensors) |
| Parametros activos | ~2,5B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e (8 bits, precisión mixta con escalas, sesgos y tensores no cuantizados en BF16); variante oQ4e disponible en repositorio aparte |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Flint es un transformer mixture-of-experts con 39,8B de parámetros totales y aproximadamente 2,5B activos por token. El model card menciona un enrutado sobre 256 expertos, que según los autores domina el coste de decodificación y hace que la inferencia no esté limitada por el ancho de banda de memoria. El modelo carece de cabeza de predicción multi-token (MTP) y de torre de visión, por lo que es exclusivamente generador de texto. Un detalle técnico relevante: sus activaciones exceden el rango de FP16, por lo que esta conversión mantiene escalas, sesgos y tensores no cuantizados en BF16, evitando NaN y salidas degeneradas (0 posiciones no finitas de 32.768 evaluadas en WikiText-2).

Sobre el entrenamiento del modelo base no se ofrece información en la model card (tokens, composición del dataset, RLHF/DPO): no disponible. La versión abliterated fue publicada por dima6312 a partir de RecursiveSI/flint; el proceso concreto de abliteration aplicado no está documentado en la información disponible. Esta versión concreta añade la cuantización oQ8e, construida y probada sobre un Apple M1 Max, con validación numérica frente a FP32 (KLD medio de 0,077).

## Capacidades

- Generación de texto conversacional (pipeline text-generation), en inglés según la model card.
- Modelo abliterated/uncensored: responde sin las capas de rechazo del modelo original, útil para investigación sobre alineación y para casos donde el modelo base se niega de forma excesiva.
- Inferencia eficiente en Apple Silicon gracias a MLX y a la arquitectura MoE (~50 tok/s de decodificación en M1 Max).
- Cuantización de alta fidelidad: KLD de 0,077 frente a FP32, inferior al suelo numérico BF16 del propio modelo.
- No incluye capacidades de visión, audio ni predicción multi-token (MTP).
- Tool calling, agentes y razonamiento multi-paso: no disponible (no documentado en la model card; los autores anuncian benchmarks agénticos como trabajo futuro).

## Casos de uso

- Investigación en abliteration y alineación: permite estudiar el comportamiento del modelo base sin filtros, comparando respuestas antes y después del proceso, con licencia Apache-2.0 que facilita la redistribución.
- Asistentes conversacionales locales en Mac: con ~2,5B de parámetros activos y ~50 tok/s en un M1 Max, es adecuado para chat interactivo local sin depender de la nube.
- Prototipado de aplicaciones LLM en Apple Silicon: el formato MLX permite integrarlo en apps nativas para macOS y probar prompts y pipelines sin GPUs de datacenter.
- Generación de contenido sin restricciones para escritura creativa: al ser uncensored, no rechaza temas que otros modelos bloquean; requiere supervisión del usuario.
- Evaluación de cuantizaciones de alta fidelidad: su KLD de 0,077 frente a FP32 lo hace útil como referencia para comparar el impacto real de cuantizaciones más agresivas (como la variante oQ4e del mismo autor).
- Pruebas de rendimiento MoE en hardware de consumo: el caso de Flint demuestra que un MoE de 40B puede ejecutarse a velocidad de modelo denso pequeño en un portátil, útil para benchmarking de servidores de inferencia MLX (omlx).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento publicados son de inferencia en Apple M1 Max:

| Métrica | Valor |
|---|---|
| Decodificación (oQ8e, 1k contexto) | 49,7 tok/s |
| Decodificación (oQ4e, 1k contexto) | 48,2 tok/s |
| Prefill (oQ8e, M1 Max) | 400–500 tok/s |
| KLD medio oQ8e vs FP32 | 0,077 |
| KLD medio oQ4e vs FP32 | 0,249 |
| Suelo numérico BF16 del modelo | 0,088 |
| Posiciones no finitas (WikiText-2, 32.768) | 0 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~43 GB para oQ8e (repo de 42,3 GB); la variante oQ4e ocupa 23,4 GB.
- Equipos recomendados: Macs con 64 GB de memoria unificada o más para oQ8e; Macs de 32–48 GB para oQ4e (oQ8e excede el límite por defecto de memoria GPU de un Mac de 48 GB).
- No cabe en GPUs de consumo típicas (una RTX 4090 con 24 GB es insuficiente incluso para oQ4e); está pensado específicamente para Apple Silicon con MLX.
- Despliegue: librería MLX (omlx); no hay mención a vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Rendimiento medido: ~50 tok/s de decodificación y 400–500 tok/s de prefill en M1 Max, igualando la velocidad del build MLX INT4 oficial de Recursive en la misma máquina.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Cuantizacion | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Flint-40B-A2.5B abliterated oQ8e (esta ficha) | ~39,8B | ~2,5B | oQ8e (8 bits, BF16 mixto) | 42,3 GB | Apache-2.0 | MLX, Apple Silicon |
| Flint-40B-A2.5B abliterated oQ4e (mismo autor) | ~39,8B | ~2,5B | oQ4e (4 bits) | 23,4 GB | Apache-2.0 | MLX, para Macs de 32–48 GB |
| RecursiveSI/flint (base, build oficial MLX INT4) | ~39,8B | ~2,5B | INT4 | no disponible | no disponible | MLX, con filtros de alineación |

Nota: no se dispone de datos comparativos de benchmarks con otros modelos MoE de tamaño similar (por ejemplo, modelos de la familia Qwen3 o Mixtral); no disponible.

## Limitaciones y advertencias

- Al ser un modelo abliterated/uncensored, no aplica salvaguardas de seguridad: alto riesgo de generar contenido ofensivo, dañino o incorrecto. No apto para producción sin capas de moderación externas.
- Riesgo de alucinación: no evaluado en la información disponible; no hay benchmarks de exactitud publicados.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está documentado.
- Longitud de contexto no publicada, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Sin capacidades multimodales ni MTP; solo generación de texto.
- La abliteration puede degradar la calidad general del modelo respecto al original; el proceso concreto aplicado no está documentado.
- La cuantización oQ8e requiere ~43 GB de memoria unificada, fuera del alcance de la mayoría de equipos de consumo; en Macs de 48 GB hay que usar oQ4e.
- Licencia Apache-2.0 sin restricciones de uso comercial, pero la procedencia del modelo base (RecursiveSI/flint) y sus términos deben verificarse para despliegues comerciales.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Studio-Research-M1/Flint-40B-A2.5B-abliterated-oQ8e-BF16-MLX
- Variante oQ4e: https://huggingface.co/Studio-Research-M1/Flint-40B-A2.5B-abliterated-oQ4e-BF16-MLX
- Colección completa: https://huggingface.co/collections/Studio-Research-M1/flint-40b-a25b-abliterated-oq-mlx-apple-silicon-6ae62b348b6c1d4e2ed3e758
- Modelo base abliterated: https://huggingface.co/dima6312/Flint-40B-A2.5B-abliterated
- Modelo original (RecursiveSI/flint): https://huggingface.co/RecursiveSI/flint
