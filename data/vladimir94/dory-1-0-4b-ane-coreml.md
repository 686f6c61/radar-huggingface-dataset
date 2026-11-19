# vladimir94/dory-1.0-4b-ane-coreml

## Resumen

Dory 1.0 4B ANE CoreML es una conversión con cuantización de 8 bits (palettization) del modelo nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16, publicada por el usuario vladimir94. No se trata de un fine-tune ni de un merge: es una reimplementación del modelo original en 102 programas Core ML diseñados para ejecutarse sobre el Apple Neural Engine (ANE) de un Mac con una longitud de contexto de 24.576 tokens. El objetivo es hacer viable un transformer "looped" de 4.000 millones de parámetros con atención con compuertas (gated attention) en hardware de Apple sin GPU dedicada.

La relevancia de esta ficha radica en que demuestra una ruta práctica para llevar modelos de la familia Nemotron al silicio de Apple con pérdida de calidad medida y acotada: frente al modelo en PyTorch, la versión de 8 bits presenta un KLD medio de 0,0145 y una coincidencia top-1 del 94,1 % en las posiciones 64-319 del conjunto de evaluación. Es, por tanto, un artefacto de despliegue orientado a inferencia local en Mac, no un modelo nuevo entrenado desde cero.

La conversión preserva la atención con compuertas, el residual |α| de nGPT y el RoPE NEOX del original, y evita dos zonas donde el ANE pierde precisión (proyecciones con entradas pequeñas y las funciones silu/sigmoid), sustituyéndolas por formas matemáticamente equivalentes. El repositorio ocupa 7,1 GB e incluye los paquetes `.mlpackage`, el plan de despacho `meta.yaml`, las tablas RoPE y los ficheros de tokenizador y plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" con gated attention, residual |α| de nGPT y RoPE NEOX; convertido a 102 programas Core ML |
| Parametros totales | 4B (modelo base NVIDIA-Nemotron-Labs-Dory1.0-4B) |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | 24.576 tokens |
| Tipos de cuantizacion | Palettization de 8 bits (existe build previo de 6 bits en el historial del repo) |
| Idiomas soportados | en (inglés) |
| Licencia | NVIDIA Open Model License (código de conversión MIT) |
| Formato de pesos | Core ML `.mlpackage` (102 programas, variantes infer y prefill), `meta.yaml`, `rope_tables.npz` |
| Tamano del repo | 7,1 GB (build de 8 bits: 7,6 GB según la model card) |
| Libreria | coreml |
| Hardware objetivo | Apple Neural Engine (Mac serie M) |
| Modelo base | nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de 4.000 millones de parámetros con una arquitectura "looped", es decir, que reutiliza bloques en varios bucles de cómputo, combinada con atención con compuertas y un residual basado en nGPT con factor |α|. Emplea RoPE en variante NEOX para la codificación posicional. Esta conversión no entrena ni destila nada: reproduce fielmente esas operaciones en Core ML, dividiendo el grafo en 102 programas para que el ANE pueda ejecutarlos con un contexto de 24.576 tokens.

La innovación técnica principal está en la adaptación al ANE: se evitan las proyecciones con entradas de magnitud pequeña y las activaciones silu/sigmoid, que degradan la precisión en ese hardware, y se sustituyen por formulaciones matemáticamente equivalentes. La cuantización aplicada es palettization de 8 bits, con un build anterior de 6 bits documentado en el historial del repositorio. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo original usó RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia (`chat_template.jinja`).
- Modo "thinking" incluido en la plantilla de chat del modelo.
- Razonamiento multi-turno dentro de la ventana de 24.576 tokens.
- Ejecución local sobre Apple Neural Engine, sin necesidad de GPU dedicada.
- API compatible con OpenAI mediante `scripts/dory_serve.py`, con interfaz de chat.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener conversaciones multi-turno con hasta 24.576 tokens de contexto, adecuado para usuarios que necesitan privacidad total sin enviar datos a la nube.
- Procesamiento de documentos largos en local: con 24K de contexto se pueden resumir o extraer información de informes extensos directamente en el portátil, aunque el prefill token a token a ~10 tok/s impone tiempos de espera considerables.
- Prototipado de aplicaciones de IA en ecosistema Apple: el servidor incluido expone una API compatible con OpenAI, lo que permite integrar el modelo en apps macOS o iOS sin reescribir la capa de cliente.
- Evaluación de modelos Nemotron en hardware Apple: útil para investigadores que quieran medir el comportamiento de la arquitectura looped con gated attention sobre ANE frente a la versión PyTorch.
- Generación de texto con requisitos de soberanía de datos: al ejecutarse íntegramente en el dispositivo, encaja en entornos con restricciones de confidencialidad (legal, sanitario, desarrollo interno).
- Pruebas de cuantización y despliegue Core ML: el repositorio sirve como referencia técnica para convertir otros modelos al ANE, con métricas de KLD y acuerdo top-1 documentadas.

## Benchmarks y rendimiento

Medido en un portátil de la serie M frente al modelo en PyTorch, posiciones 64-319 del conjunto de evaluación, 2 bucles, modo decode:

| Metrica | 8 bits (este repo) | Build previo de 6 bits |
|---|---|---|
| KLD media | 0,0145 | 0,0979 |
| KLD mediana | 0,0039 | 0,0290 |
| Coincidencia top-1 | 94,1 % | 88,3 % |
| Decode (200 tokens, incl. prefill) | 8,7 tok/s | 9,3 tok/s |
| Tamano | 7,6 GB | 5,6 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Neural Engine de un Mac con chip de la serie M; no se especifica el chip mínimo probado.
- VRAM: no aplica (memoria unificada); el repositorio ocupa 7,1 GB y el build de 8 bits pesa 7,6 GB.
- Estado KV: 999 MiB de estado fp16 por conversación; el caché int8 es imposible porque los estados de Core ML solo admiten fp16 y rechazan entradas enteras.
- Cabe en Mac con memoria unificada suficiente para alojar los paquetes y el estado; no se indica el mínimo exacto.
- Despliegue: Core ML mediante el runtime `scripts/dory_serve.py` (API OpenAI + interfaz de chat), construido sobre Anemll.
- Throughput: ~8,7 tok/s en decode (200 tokens incluyendo prefill); prefill token a token a ~10 tok/s, salvo que se acepte un cambio de 100-270 s a los paquetes de prefill por lotes.
- Limitación de residencia: prefill y decode no pueden coexistir en memoria (204 paquetes fallan en este hardware).
- La búsqueda de embeddings se ejecuta en la GPU, no en el ANE, en este build.
- Un servidor solo mantiene un par de sesiones simultáneas por el tamaño del caché de conversación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dory 1.0 4B ANE CoreML (este) | 4B | 24.576 | Core ML / ANE | NVIDIA Open Model License | Hugging Face |
| NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 | 4B | no disponible | Safetensors / GPU | NVIDIA Open Model License | Hugging Face |
| Build de 6 bits del mismo repo | 4B | 24.576 | Core ML / ANE | NVIDIA Open Model License | Historial del repo |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Prefill y decode no pueden residir simultáneamente en memoria en el hardware probado, lo que obliga a alimentar el prompt token a token a ~10 tok/s o a aceptar cambios de 100-270 s.
- El caché KV en int8 no es posible: Core ML solo admite estados fp16, con un suelo de 999 MiB para 24K de contexto.
- Un servidor solo sostiene un par de sesiones concurrentes por el tamaño del caché de conversación.
- La búsqueda de embeddings se ejecuta en la GPU, no en el ANE, lo que puede afectar al rendimiento global.
- Modelo solo en inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de sesgo o factualidad.
- Licencia NVIDIA Open Model License: revisar sus términos antes de uso comercial; el código de conversión es MIT, pero los pesos heredan la licencia del modelo base.
- La cuantización de 8 bits introduce una divergencia medible frente al modelo original (KLD media 0,0145, top-1 94,1 %), aceptable para chat pero no despreciable en tareas de alta precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vladimir94/dory-1.0-4b-ane-coreml
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Repositorio del runtime: https://github.com/vladimir-voinea/dory-ane
- Anemll (base del proyecto): https://github.com/Anemll/Anemll
- Licencia NVIDIA Open Model License: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
