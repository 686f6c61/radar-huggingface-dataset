# tinyopsec/Qwen3.5-4B-Uncensored-Aggressive-GGUF

## Resumen

Qwen3.5-4B-Uncensored-Aggressive-GGUF es una colección de cuantizaciones en formato GGUF del modelo rodrigomt/Qwen3.5-4B-Uncensored-Aggressive, publicada por el usuario tinyopsec en HuggingFace. Se trata de una adaptación de la arquitectura Qwen2 con 4.326.350.848 parámetros reales (la model card declara 4,5 B), 28 capas, 28 cabezas de atención, vocabulario de 151 936 tokens y una ventana de contexto de 32 768 tokens. El modelo base fue ajustado por rodrigomt con el objetivo explícito de eliminar los filtros de seguridad y maximizar la obediencia a las instrucciones del usuario, y esta publicación se limita a ofrecer versiones cuantizadas listas para inferencia local.

El problema que resuelve es práctico: el modelo original es demasiado pesado para ejecutarse en hardware de consumo, y estas cuantizaciones cubren desde F16 (~8,4 GB) hasta Q2_K (~1,1 GB), lo que permite desplegarlo en portátiles, GPUs de gama media e incluso CPU con suficiente RAM. Su relevancia actual radica en el nicho de modelos "sin censura" orientados a investigación sobre patrones de rechazo (refusal behaviour), red teaming y generación de contenido sin restricciones, un segmento con demanda constante pero con implicaciones legales y éticas importantes.

Es importante señalar que la información proporcionada no permite verificar la existencia de un modelo oficial "Qwen/Qwen3.5-4B" en el ecosistema Qwen, pese a que la model card lo cita como base arquitectónica. Todos los datos de esta ficha proceden de la model card del autor y de los metadatos de HuggingFace; no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (28 capas, 28 cabezas de atencion) |
| Parametros totales | 4.326.350.848 (≈4,33 B); la model card declara 4,5 B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Vocabulario | 151 936 tokens |
| Tamano del repositorio | 37,4 GB |
| Tarea (pipeline) | text-generation |
| Libreria | gguf |
| Modelo base | rodrigomt/Qwen3.5-4B-Uncensored-Aggressive |
| Fecha de publicacion | 17 de septiembre de 2026 (actualizado el mismo dia) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura declarada es Qwen2: un transformer decoder-only con 28 capas y 28 cabezas de atención, vocabulario de 151 936 tokens y soporte de contexto de 32 768 tokens. Sobre esa base, rodrigomt aplicó un ajuste fino orientado a suprimir los mecanismos de rechazo y maximizar la conformidad con las instrucciones, dando lugar al modelo denominado "Uncensored-Aggressive". La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO u otras variantes de alineación; esa información no está disponible.

La aportación de tinyopsec es exclusivamente de cuantización: se generan 11 variantes GGUF mediante el pipeline de llama.cpp, con pérdidas de calidad progresivas desde F16 hasta Q2_K. No se documentan innovaciones técnicas propias (no hay decodificación especulativa, atención lineal ni arquitecturas híbridas SSM), ni se especifican las versiones exactas de las herramientas de cuantización empleadas. El repositorio ocupa 37,4 GB, coherente con la suma de todas las variantes publicadas.

## Capacidades

- Generación de texto en inglés con ausencia deliberada de filtros de seguridad, según declara el autor.
- Seguimiento "agresivo" de instrucciones: la model card indica conformidad maximizada con las peticiones del usuario, incluida la reducción de rechazos.
- Generación de contenido diverso ("wide range of content types"), sin que se detallen taxonomías concretas.
- Inferencia local ligera: el tamaño de 4,33 B permite ejecución en CPU y GPUs de gama media o portátiles.
- Adecuado para investigación y experimentación sobre comportamiento del modelo sin patrones de rechazo.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multimodales (visión, audio): no disponibles; la tarea declarada es únicamente text-generation.
- Capacidades multilingües: no disponibles; el único idioma declarado es el inglés.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Investigación sobre refusal behaviour: permite estudiar qué patrones aprenden los modelos alineados y cómo se comporta una variante sin filtros ante las mismas peticiones, usando la ventana de 32 768 tokens para comparar bloques largos de prompts.
- Red teaming y evaluación de seguridad: sirve como modelo "adversario" para generar ataques, prompts límite y contenido que otros sistemas deben saber rechazar o moderar, con la ventaja de ejecutarse en local sin coste por token.
- Generación de datos sintéticos: al no aplicar rechazos, puede producir corpus de texto en inglés para entrenar clasificadores de toxicidad o moderadores, siempre con revisión humana posterior.
- Prototipado de asistentes conversacionales en local: con Q4_K_M (~2,1 GB) o Q5_K_M (~2,8 GB) se puede levantar un chat multi-turno en LM Studio, Ollama o llama-cpp-python en un portátil sin GPU dedicada.
- Escritura creativa y de ficción para adultos: narrativa, guiones o roleplay en inglés donde los filtros estándar interrumpirían la generación; requiere control editorial y verificación legal del contenido producido.
- Despliegue en entornos aislados o air-gapped: al ser GGUF y ejecutarse con llama.cpp, no necesita conexión externa ni APIs de terceros, lo que encaja en laboratorios con requisitos de confidencialidad.
- Ajuste fino y destilación experimental: la variante F16 (~8,4 GB) puede servir como punto de partida para LoRA o destilación hacia modelos más pequeños, aprovechando la licencia Apache 2.0.
- Docencia y demostraciones sobre cuantización: las 11 variantes permiten ilustrar de forma medible el compromiso entre tamaño, VRAM y calidad de salida en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación, ni para el modelo cuantizado ni para el modelo base. Tampoco se proporcionan datos de perplejidad por cada nivel de cuantización, latencia o throughput.

## Requisitos de hardware

Requisitos de VRAM declarados por el autor:

| Cuantizacion | VRAM | Dispositivo recomendado (segun la model card) |
|---|---|---|
| F16 | 9 GB | GPU de gama alta |
| Q8_0 | 5 GB | GPU de gama media |
| Q6_K | 3,5 GB | GPU de gama media |
| Q5_K_M | 3 GB | GPU estandar |
| Q4_K_M | 2,5 GB | GPU estandar / GPU de portatil |
| Q3_K_M | 2 GB | GPU de portatil / CPU |
| Q2_K | 1,5 GB | CPU con RAM suficiente |

- Cabe en GPU de consumo: sí. Cualquier tarjeta con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4080, RTX 4090) puede ejecutar Q5_K_M o Q4_K_M con margen; las variantes Q3 y Q2 estan pensadas para CPU y portatiles sin GPU dedicada.
- GPU de centro de datos (A100, H100): sobredimensionadas para 4,33 B, pero útiles si se necesita servir muchas peticiones concurrentes o contexto completo de 32 768 tokens en F16.
- Advertencia sobre la tabla: no se especifica si las cifras de VRAM incluyen la cache KV. Con un contexto de 32 768 tokens, la cache KV anade memoria adicional proporcional a la longitud real de la secuencia, por lo que conviene reservar margen sobre los valores indicados.
- Opciones de despliegue documentadas: llama.cpp (`./main`), llama-cpp-python, LM Studio y Ollama (`ollama pull tinyopsec/qwen3.5-4b-uncensored-aggressive-gguf:q5_k_m`).
- Formatos alternativos de servidor (vLLM, TGI, TensorRT-LLM): no documentados para GGUF en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| tinyopsec/Qwen3.5-4B-Uncensored-Aggressive-GGUF (esta ficha) | 4,33 B | 32 768 | Apache 2.0 | GGUF (11 cuantizaciones) | no disponible |
| rodrigomt/Qwen3.5-4B-Uncensored-Aggressive (modelo base) | 4,5 B declarados | 32 768 | Apache 2.0 | no disponible | no disponible |
| Modelos alternativos de ~4 B (Qwen, Llama, Phi, Gemma) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de especificaciones verificadas ni de resultados de benchmarks de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. La unica diferencia contrastable entre esta publicacion y su modelo base es el formato (GGUF cuantizado frente al repositorio original) y el tamano en disco.

## Limitaciones y advertencias

- Modelo deliberadamente sin filtros de seguridad: puede generar contenido ilegal, danino, difamatorio o sexualmente explicito. El usuario es el unico responsable del uso y de las consecuencias legales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad, por lo que no hay datos sobre la tasa de invencion de hechos; al estar ajustado para no rechazar peticiones, es probable que responda con seguridad incluso cuando no sabe la respuesta.
- Idiomas: solo se declara ingles. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Sesgos: no se documenta ninguna evaluacion de sesgo, ni la composicion del dataset de ajuste, lo que impide estimar sesgos de genero, raza, religion u orientacion.
- Verificacion del modelo base: la model card cita "Qwen/Qwen3.5-4B" como base, pero la informacion disponible no permite confirmar que exista un modelo oficial con esa denominacion; conviene verificar la procedencia antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero no exime de cumplir la normativa aplicable (por ejemplo, obligaciones de moderacion de contenidos o proteccion de datos en la UE).
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria sobre la calidad de las cuantizaciones.
- Las cuantizaciones Q3 y Q2 degradan notablemente la calidad; la propia model card recomienda Q5_K_M como opcion equilibrada para la mayoria de casos.
- Uso en produccion: no se han publicado pruebas de estabilidad, latencia ni comportamiento ante entradas malformadas; requiere evaluacion propia antes de cualquier despliegue.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Qwen3.5-4B-Uncensored-Aggressive-GGUF
- Modelo base (ajuste fino de rodrigomt): https://huggingface.co/rodrigomt/Qwen3.5-4B-Uncensored-Aggressive
- Modelo citado como base arquitectonica en la model card: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp (documentacion y binarios de inferencia): https://github.com/ggerganov/llama.cpp
- llama-cpp-python (binding de Python empleado en los ejemplos): https://github.com/abetlen/llama-cpp-python
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
- Nota sobre la busqueda web: los resultados recuperados (repositorios de jailbreaks de ChatGPT, hilos de soporte de cuentas y listados de chatbots comerciales) no guardan relacion con este modelo y no aportan informacion tecnica utilizable, por lo que se omiten.
