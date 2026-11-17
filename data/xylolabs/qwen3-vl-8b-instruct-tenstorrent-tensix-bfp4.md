# Xylolabs/Qwen3-VL-8B-Instruct-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3-VL-8B-Instruct-Tenstorrent-Tensix-BFP4 es una cuantización del modelo multimodal Qwen3-VL-8B-Instruct de Alibaba Qwen, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo resuelve el problema de ejecutar un modelo visión-lenguaje de 8.700 millones de parámetros en hardware de inferencia de bajo consumo energético, empleando un formato de cuantización propietario BFP4 (bfloat4_b, 4,5 bits por peso) generado mediante GPTQ con búsqueda de exponente por bloque.

La cuantización afecta únicamente a las proyecciones de atención y MLP de las 36 capas del decodificador; la cabeza LM, los embeddings, las normas y la torre de visión permanecen en bf16. El resultado es un modelo de 6,40 GB empaquetado para Tensix (frente a 16,38 GB en bf16), con una divergencia KL media de 0,0319 respecto al original, prácticamente idéntica a la de una cuantización Q4_K_M de llama.cpp (0,0322).

Es relevante ahora porque demuestra que un VLM de 8B puede cuantizarse a menos de 5 bits por peso sin pérdida medible de precisión en tareas de respuesta y con una torre visual intacta, abriendo la puerta al despliegue de modelos multimodales en aceleradores Tensix con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (Qwen3-VL), 36 capas, con torre de visión |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (bfloat4_b, 4,5 bits/peso) en proyecciones q, k, v, o y MLP gate, up, down; bf16 en LM head, embeddings, normas y torre visual; media de 6,25 bits/peso en el modelo de lenguaje |
| Idiomas soportados | en, ko (segun metadatos y calibracion en WikiText-2 y Wikipedia coreana) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16 sobre la rejilla BFP4; empaquetado posterior a BFP4 via TT-NN) |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-8B-Instruct es un transformer decoder multimodal de 36 capas con una torre de visión separada que procesa imágenes y las proyecta al espacio del modelo de lenguaje. Esta versión no reentrena el modelo: aplica cuantización post-entrenamiento GPTQ con búsqueda de exponente por bloque sobre todas las proyecciones de atención (q, k, v, o) y MLP (gate, up, down) del decodificador, calibrada con 65.536 tokens de WikiText-2 y Wikipedia en coreano.

La innovación técnica principal es el formato bfloat4_b (BFP4), un formato de bloque con exponente compartido que ocupa 4,5 bits por peso y que TT-NN empaqueta directamente sin alterar los valores. Los pesos se almacenan en el Hub como bf16 sobre la rejilla del formato, de modo que el empaquetado a Tensix es una operación sin pérdida. La verificación se realizó con las herramientas `pack_tensix.py` y `verify_grid.py` del repositorio tensix-bfp-gptq v0.1.0 sobre el simulador ttsim con ttnn 0.81.1, comprobando que ningún valor cambia tras el empaquetado.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y coreano.
- Comprensión de imágenes y respuesta a preguntas visuales (image-text-to-text), con torre de visión en bf16 sin cuantizar.
- Razonamiento multimodal: descripción de imágenes, extracción de información visual y diálogo sobre contenido gráfico.
- Modo thinking (razonamiento extendido) heredado del modelo base, evaluado en 7 de las 40 preguntas de la comprobación de respuestas.
- Generación de código y matemáticas (capacidades del modelo base Qwen3-VL-8B-Instruct; no se detallan métricas específicas en la información disponible).
- Soporte de plantilla de chat mediante `apply_chat_template` de transformers con contenido estructurado imagen + texto.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue gestionado.

## Casos de uso

- Descripción automática de imágenes en pipelines de accesibilidad: el modelo genera descripciones en una frase con `max_new_tokens=64`, adecuado para alt-text generado en lote sobre catálogos de imágenes.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios, aprovechando la torre visual en bf16 que conserva la precisión del modelo original (16 de 17 preguntas de imagen correctas en la evaluación del autor).
- Asistencia documental con OCR implícito: extracción de información de capturas, formularios o diagramas mediante diálogo multimodal multi-turno.
- Despliegue en edge con NPU Tensix: inferencia en Wormhole o Blackhole con un modelo de 6,40 GB empaquetado, útil en entornos con restricciones energéticas o sin GPU convencional.
- Chatbot bilingüe inglés-coreano: la calibración incluye Wikipedia coreana y la evaluación cubre textos en ambos idiomas, lo que respalda su uso en atención al cliente para mercados coreano-parlantes.
- Prototipado de agentes visuales: integración en flujos donde el modelo recibe imágenes y texto y devuelve respuestas estructuradas, con la ventaja de un footprint de memoria reducido frente al bf16.
- Investigación en cuantización: referencia reproducible para comparar BFP4 frente a Q4_K_M en tareas multimodales, con scripts de verificación incluidos.

## Benchmarks y rendimiento

Evaluación en host de los pesos (no en dispositivo), según el autor:

| Pesos | Formatos | Bits/peso | Tamano (GB) | KL media a bf16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---|---:|---:|---:|---:|---:|---:|
| bf16 (original) | todo bf16 | 16,00 | 16,38 | 0 | 100 | 30/33 | - |
| BFP4-MLP | atencion bfloat8_b, MLP bfloat4_b; head bf16 | 6,99 | 7,152 | 0,0253 | 93,06 | 31/33 | 0 |
| BFP4 (este modelo) | todas las proyecciones bfloat4_b; head bf16 | 6,25 | 6,397 | 0,0319 | 92,13 | 30/33 | 0 |
| Q4_K_M (llama.cpp) | F32 145, Q4_K 217, Q6_K 37 | 4,90 | 5,028 | 0,0322 | 91,82 | 30/33 | 0 |

La comprobación de respuestas usa 33 prompts fijos con respuesta conocida más 7 con thinking activado (40 en total). En preguntas de imagen, el modelo acierta 16 de 17 con la torre visual en bf16, perdiendo una. No se reportan mediciones de velocidad en dispositivo.

## Requisitos de hardware

- VRAM/RAM estimada: 6,40 GB empaquetado para Tensix (modelo de lenguaje); 16,38 GB si se carga en bf16 desde los safetensors del Hub.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- No está pensado para GPU consumer convencional; en GPU se cargaría como bf16 (16,38 GB), lo que requiere al menos 24 GB de VRAM (RTX 3090/4090) para inferencia completa.
- Despliegue en Tensix: `pack_tensix.py` empaqueta las matrices con TT-NN y `verify_grid.py` valida la rejilla con torch; requiere ttnn 0.81.1.
- Despliegue en GPU/CPU: transformers con `AutoModelForImageTextToText` y `dtype="bfloat16"`; no se documenta soporte de llama.cpp, vLLM, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no se reportan velocidades y que todas las cifras son evaluaciones en host.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs Qwen3-VL-8B BFP4 (este) | 8,77 B | no disponible | BFP4 6,25 bits/peso | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| Xylolabs Qwen3-VL-8B BFP4-MLP | 8,77 B | no disponible | 6,99 bits/peso (atencion bfloat8_b) | Apache 2.0 | Tensix |
| Qwen3-VL-8B-Instruct (bf16) | 8,77 B | no disponible | 16 bits/peso | Apache 2.0 | GPU/NPU generica |
| Qwen3-VL-8B-Instruct GGUF Q4_K_M (llama.cpp) | 8,77 B | no disponible | 4,90 bits/peso | Apache 2.0 | CPU/GPU via llama.cpp |

El modelo BFP4 mantiene una KL media de 0,0319 frente a la 0,0322 de Q4_K_M, con un tamaño empaquetado mayor (6,40 GB frente a 5,03 GB) pero orientado a un acelerador específico. La variante BFP4-MLP ofrece menor compresión (7,15 GB) y menor divergencia (0,0253).

## Limitaciones y advertencias

- Solo se han cuantizado las proyecciones del modelo de lenguaje; la torre visual permanece en bf16, por lo que el ahorro de memoria se limita al decodificador.
- El formato BFP4 requiere empaquetado con TT-NN para su uso en Tensix; los safetensors del Hub ocupan el tamaño bf16 (17,5 GB de repo) y no son directamente inferibles en ese formato sin las herramientas del autor.
- Idiomas declarados: inglés y coreano. El rendimiento en castellano no está evaluado y la calibración no incluyó corpus en español.
- No se reportan mediciones en dispositivo: todas las métricas son evaluaciones en host, sin datos de latencia ni throughput reales en Wormhole o Blackhole.
- La comprobación de respuestas se basa en 40 prompts fijos; es una muestra pequeña y no sustituye a una evaluación completa en MMLU, HumanEval o GSM8K.
- Riesgo de alucinación inherente al modelo base Qwen3-VL-8B-Instruct; la cuantización agresiva a 4,5 bits puede amplificar errores en tareas de razonamiento largo no cubiertas por la evaluación.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue práctico está condicionado a hardware Tensix o a cargar el modelo en bf16.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; sin validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-VL-8B-Instruct-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Variante BFP4-MLP: https://huggingface.co/Xylolabs/Qwen3-VL-8B-Instruct-Tenstorrent-Tensix-BFP4-MLP
- Codigo de cuantizacion (tensix-bfp-gptq v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels Tensix v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner Tensix v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Paper Qwen3-VL (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-VL (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Paper Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
