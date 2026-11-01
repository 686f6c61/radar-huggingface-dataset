# vllm-project/smollm-135m-lora-fineweb-faroese

## Resumen

`vllm-project/smollm-135m-lora-fineweb-faroese` es un adaptador LoRA de investigación publicado por el equipo de vLLM (copia de un checkpoint original de la cuenta personal `jekunz`) sobre el modelo base `HuggingFaceTB/SmolLM2-135M-Instruct`. El objetivo es adaptar un modelo de lenguaje muy pequeño (135 millones de parámetros) al feroés (`fo`), un idioma de bajos recursos, mediante ajuste fino supervisado sobre la porción feroesa del corpus FineWeb-2. El resultado es un artefacto de bajo coste computacional útil para experimentación en lenguas escandinavas minoritarias y para pruebas de infraestructura de despliegue.

El modelo no introduce arquitectura nueva: es un transformer decoder-only de SmolLM2 con un adaptador PEFT de rango 256 aplicado sobre las proyecciones MLP (`up_proj`, `down_proj`, `gate_proj`, `o_proj`). El repositorio pesa 0,2 GB y contiene únicamente los pesos del adaptador en `safetensors`, no los pesos fusionados. La licencia es Apache 2.0, igual que el modelo base.

Su relevancia actual es doble: por un lado, demuestra un flujo reproducible de especialización lingüística con recursos mínimos (4 GPU A100 de 40 GB, 5 épocas, batch efectivo de 256); por otro, el propio equipo de vLLM lo mantiene como checkpoint de CI, lo que lo convierte en un caso práctico de cómo se valida el soporte de LoRA y de modelos multilingües pequeños en el ecosistema de inferencia de vLLM. No obstante, el autor advierte explícitamente de que no ha sido evaluado de forma amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) con adaptador LoRA (PEFT) |
| Parametros totales | 135 M (modelo base) + adaptador LoRA (rango 256) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima usada en entrenamiento); contexto nativo de SmolLM2-135M-Instruct: no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | feroés (`fo`); el modelo base es multilingüe, pero el ajuste se orienta a `fo` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El modelo base SmolLM2-135M-Instruct es un transformer decoder-only de 135 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido exclusivamente a las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj` de las capas MLP. No se ajustan las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`) ni los embeddings, lo que reduce el número de parámetros entrenables y el coste de almacenamiento del adaptador.

El entrenamiento se realizó durante 5 épocas con tasa de aprendizaje 8e-4, scheduler coseno, warmup ratio 0,05, batch size 1 por dispositivo y acumulación de gradientes de 64 pasos, resultando en un batch efectivo de 256. Se usaron 4 GPU A100 de 40 GB y una longitud máxima de contexto de 8192 tokens. El dataset es la porción feroesa de `HuggingFaceFW/fineweb-2`, un corpus web multilingüe filtrado. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del subconjunto ni si hubo etapas de RLHF, DPO o ajuste de preferencias; el proceso descrito corresponde a ajuste fino supervisado sobre texto.

No se mencionan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mezcla de expertos. La contribución técnica es la receta de especialización lingüística de bajo coste y su empaquetado como adaptador PEFT compatible con el stack de vLLM.

## Capacidades

- Generación de texto en feroés: el ajuste busca mejorar la fluidez y la cobertura léxica en `fo` respecto al modelo base.
- Conversación multi-turno: hereda el formato instructivo de SmolLM2-135M-Instruct, aunque el ajuste se hizo sobre texto de FineWeb-2, no sobre diálogo.
- Razonamiento básico y tareas de conocimiento general: limitado por el tamaño del modelo base (135 M).
- Generación de código y matemáticas: capacidad residual del modelo base, no reforzada por este ajuste.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; improbable a esta escala.
- Capacidades multilingües: el adaptador está orientado a `fo`; el comportamiento en otros idiomas no se ha evaluado.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Integración con vLLM: el checkpoint se mantiene como artefacto de CI, lo que implica compatibilidad probada con el soporte de LoRA de vLLM.

## Casos de uso

- Investigación en lenguas de bajos recursos: punto de partida para experimentos de adaptación al feroés con presupuesto reducido, comparando el efecto del rango LoRA, los módulos objetivo y el número de épocas sobre la perplejidad en `fo`.
- Generación de texto aumentada en feroés: completado de frases, redacción de borradores y paráfrasis en contextos donde no hay modelos mayores disponibles para ese idioma, aceptando la calidad limitada de un modelo de 135 M.
- Pruebas de infraestructura de inferencia: validación de pipelines de despliegue con adaptadores LoRA en vLLM (carga en caliente, multiplexación de adaptadores, cuantización del base) usando un checkpoint pequeño que cabe en cualquier GPU.
- Evaluación de calidad de datos: análisis de cómo la porción feroesa de FineWeb-2 afecta al comportamiento del modelo, útil para estudiar filtrado y deduplicación de corpus web en idiomas minoritarios.
- Prototipado de asistentes locales: despliegue en CPU o GPU de gama baja para demos de chat en feroés, con expectativas ajustadas a la escala del modelo.
- Docencia y experimentación con PEFT: ejemplo completo y reproducible de ajuste LoRA (hiperparámetros, módulos objetivo, configuración multi-GPU) para cursos y talleres sobre adaptación de modelos.
- Baseline para comparativas: referencia de bajo coste frente a modelos multilingües mayores al evaluar ganancias por tamaño en feroés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no ha sido evaluado más ampliamente todavía".

## Requisitos de hardware

- VRAM para inferencia: el adaptador pesa aproximadamente 0,2 GB; los pesos del modelo base en fp16 ocupan alrededor de 0,27 GB. En la práctica, el consumo total con overhead de runtime se sitúa típicamente por debajo de 1-2 GB, aunque no se proporcionan mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en 4× A100 de 40 GB, pero la inferencia no requiere hardware de datacenter.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y en iGPU con memoria unificada suficiente.
- Despliegue: vLLM (con soporte LoRA, caso de uso principal del repositorio), además de transformers + PEFT, llama.cpp y Ollama si se convierte el adaptador a GGUF (conversión no documentada en la información disponible).
- Latencia y throughput: no disponibles; a 135 M de parámetros se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| smollm-135m-lora-fineweb-faroese | 135 M + LoRA | 8192 (entrenamiento) | fo | Apache 2.0 | Adaptador de investigación, sin benchmarks publicados |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | no disponible en la información proporcionada | multilingüe | Apache 2.0 | Modelo base; mayor cobertura de idiomas pero menos especializado en fo |
| SmolLM2-360M-Instruct | 360 M | no disponible en la información proporcionada | multilingüe | Apache 2.0 | Alternativa de mayor tamaño de la misma familia; más capacidad a cambio de más cómputo |
| Modelos específicos para feroés de mayor tamaño | no disponible | no disponible | fo | no disponible | No se dispone de comparativas publicadas en la información proporcionada |

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia: el autor advierte que no se ha medido su calidad de forma sistemática; no debe usarse en producción sin una evaluación propia.
- Tamaño muy reducido: 135 M de parámetros implican capacidad limitada de razonamiento, conocimiento factual y coherencia en textos largos; riesgo elevado de alucinación.
- Especialización estrecha: el ajuste se hizo sobre texto web de FineWeb-2, no sobre diálogo; el comportamiento conversacional puede degradarse respecto al modelo base instruct.
- Sesgos: al entrenarse sobre corpus web, puede reproducir sesgos presentes en FineWeb-2; no se documenta ningún análisis de sesgo.
- Cobertura lingüística: solo se declara feroés; el rendimiento en otros idiomas no está evaluado y puede ser inferior al del modelo base.
- Contexto: la longitud máxima usada en entrenamiento es 8192 tokens, pero no se garantiza un comportamiento fiable en ventanas largas a esta escala.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base SmolLM2; conviene revisar la licencia del base y del dataset FineWeb-2 para usos derivados.
- Cadena de suministro: el repositorio es una copia de un checkpoint de una cuenta personal, mantenida por vLLM para CI; para usos críticos conviene verificar el commit original (`e55c7de`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-project/smollm-135m-lora-fineweb-faroese
- Modelo original: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Paper de SmolLM2: no disponible en la información proporcionada
- Paper de FineWeb-2: no disponible en la información proporcionada
