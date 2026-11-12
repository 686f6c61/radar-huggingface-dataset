# Vzdorrr/Nocta-Qwen3.5-4B-RP-GGUF

## Resumen

Nocta-Qwen3.5-4B-RP-GGUF es una recuantización en formato GGUF de un ajuste fino orientado a roleplay sobre Qwen3.5-4B. El modelo lo publica el usuario Vzdorrr como parte del trabajo de la aplicación de compañero en dispositivo "Nocta", y parte del finetune `minas2025/Qwen-3.5-4B-RP-Finetune`, que a su vez se construye sobre `DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive` y, en última instancia, sobre `Qwen/Qwen3.5-4B`. El pipeline declarado es `image-text-to-text`, lo que confirma que la familia base es multimodal (texto e imagen) y que el repositorio incluye un proyector de visión separado.

El interés técnico del repositorio no está en un modelo nuevo, sino en la receta de cuantización: se aplica una matriz de importancia (imatrix) sobre una calibración de diálogos de roleplay en siete idiomas y se mantienen en Q8_0 los tensores de atención lineal del modelo híbrido (Gated DeltaNet), que son los más sensibles a la cuantización. El resultado es un GGUF de 3,05 GB que, según las mediciones del autor, iguala la calidad de un Q4_K_M (KL de 0,035 frente a 0,041) con la velocidad de un Q4_0.

Es relevante para quienes despliegan asistentes conversacionales con memoria y personas en hardware de consumo: demuestra que, en arquitecturas híbridas con atención lineal, una cuantización selectiva por tipo de tensor permite reducir el error sin pagar el coste de velocidad de esquemas más agresivos como Q4_K_M. El repositorio no tiene descargas ni likes en el momento de la consulta y no incluye una model card con especificaciones completas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Gated DeltaNet) y atención completa, multimodal (texto e imagen) |
| Parametros totales | 333.514.240 (dato de safetensors del repositorio; el nombre del modelo indica 4B, discrepancia no aclarada en la información disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens en las mediciones del autor; contexto máximo del modelo base no disponible |
| Tipos de cuantizacion | Q4_0 con imatrix para los pesos principales; Q8_0 para tensores de atención lineal (`attn_qkv`, `attn_gate`, `ssm_out`); proyector de visión en Q8_0 |
| Idiomas soportados | no disponible como lista oficial; la calibración de la imatrix usa ruso, inglés, chino, español, francés, portugués y alemán |
| Licencia | Apache 2.0 (heredada de los modelos base; el finetune RP no declara licencia propia) |
| Formato de pesos | GGUF (dos ficheros: pesos del modelo y proyector multimodal) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer híbrido que combina capas de atención lineal con estado recurrente (Gated DeltaNet, con tensores `attn_qkv`, `attn_gate` y `ssm_out`) y capas de atención completa, además de un codificador de visión conectado mediante un proyector multimodal. Sobre esa base, DreamFast/HauhauCS aplica un finetune "uncensored" y minas2025 añade un LoRA de roleplay. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se usó RLHF o DPO en ninguna de las etapas.

La aportación del repositorio es la recuantización. El autor parte de un GGUF Q8_0 del finetune (no hay F16 publicado), calcula una matriz de importancia con `llama-imatrix` sobre un corpus de calibración de diálogos y prompts de roleplay al estilo de la aplicación en siete idiomas (ruso, inglés, chino, español, francés, portugués y alemán) con contexto de 512 tokens, y cuantiza a Q4_0 forzando Q8_0 en los tensores de atención lineal mediante `--tensor-type`. La justificación es empírica: esos tensores son los más sensibles y mantenerlos en 8 bits reduce el KL respecto a Q8_0 a 0,035, por debajo del 0,041 de un Q4_K_M sin imatrix, manteniendo la velocidad de decodificación de un Q4_0.

## Capacidades

- Generación de texto conversacional multi-turno con memoria de contexto y coherencia de persona, optimizada para diálogos de roleplay.
- Comprensión de imágenes mediante el proyector multimodal incluido (`mmproj` en Q8_0), con pipeline `image-text-to-text`.
- Generación sin filtrado editorial ("uncensored"), heredada del finetune intermedio.
- Capacidad multilingüe al menos en ruso, inglés, chino, español, francés, portugués y alemán, según el corpus de calibración; no hay evaluación formal por idioma.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.

## Casos de uso

- Aplicación de compañero en dispositivo: es el caso de uso declarado; el GGUF de 3,05 GB más el proyector de 0,36 GB permiten ejecutar el modelo en local con llama.cpp manteniendo persona y memoria a lo largo de conversaciones largas.
- Roleplay y ficción interactiva: el finetune está entrenado para mantener personajes y estilo narrativo, y la cuantización preserva los tensores de atención lineal que sostienen la coherencia a largo plazo del contexto.
- Asistente conversacional con entrada de imagen: el proyector multimodal permite adjuntar capturas o fotos en la conversación, útil para aplicaciones de diario, accesibilidad o asistencia visual doméstica.
- Prototipado de personajes y agentes conversacionales en varios idiomas: la calibración cubre siete lenguas, lo que reduce la degradación por cuantización en ruso, chino, español, francés, portugués y alemán además del inglés.
- Despliegue en portátiles y equipos sin GPU dedicada: con 3,05 GB de pesos en Q4_0, el modelo cabe en memoria unificada o RAM de sistemas modestos y ofrece 31,5 tok/s de generación y 131 tok/s de prefill en CPU de un Mac M5 Pro con contexto de 8192.
- Investigación sobre cuantización selectiva: la receta reproducible (`llama-imatrix` más `--tensor-type`) sirve como referencia para estudiar el impacto de la cuantización en arquitecturas híbridas con atención lineal.
- Generación de diálogo sin restricciones editoriales en entornos controlados: para investigación creativa o simulaciones donde se requiere un modelo sin rechazos, con las cautelas de sesgo y seguridad que implica.

## Benchmarks y rendimiento

El autor publica una comparación interna entre su cuantización y un Q4_K_M sin imatrix, medida con llama.cpp en CPU de Mac M5 Pro con contexto de 8192. El "bench" es una prueba propia de 30 turnos de diálogo de roleplay en ruso con memoria, persona, robustez, visión, sondas sí/no y comprobaciones de formato, puntuada de 0 a 100.

| Metrica | Q4_K_M sin imatrix | Esta cuantizacion (Q4_0 imatrix, lineal en Q8_0) |
|---|---|---|
| Tamano de pesos | 2,71 GB | 3,05 GB |
| KL vs Q8_0 | 0,041 | 0,035 |
| Bench interno (0-100) | 82,5 | 81 (6 semillas) |
| Generacion (tok/s) | 31 | 31,5 |
| Prefill (tok/s) | 104 | 131 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 3,4 GB para pesos y proyector en el esquema publicado; con overhead de contexto de 8192 tokens, prever del orden de 4 a 5 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para el contexto completo; tarjetas de 8 GB (RTX 3060, RTX 4060) o superiores lo ejecutan con holgura. Para mayor throughput, A100 o H100 no aportan ventaja proporcional a su coste en un modelo de este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 de 8 GB y superiores, y en equipos con memoria unificada (Apple Silicon, APUs con memoria compartida).
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, `llama-server`); requiere cargar también el fichero `mmproj` para las funciones de visión. vLLM y TGI no están confirmados para este GGUF en la información disponible.
- Latencia y throughput medidos por el autor: 31,5 tok/s de generación y 131 tok/s de prefill en CPU de Mac M5 Pro con contexto de 8192; en GPU el rendimiento será superior, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nocta-Qwen3.5-4B-RP-GGUF (este) | 4B (nombre); 333,5 M en safetensors | 8192 en pruebas | GGUF Q4_0 imatrix + mmproj Q8_0 | Apache 2.0 | Roleplay sin filtro, multimodal, optimizado para app en dispositivo |
| minas2025/Qwen-3.5-4B-RP-Finetune | 4B | no disponible | safetensors (origen Q8_0) | no declarada | Modelo padre; sin cuantizar, mayor huella de memoria |
| DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | 4B | no disponible | safetensors | no disponible | Base del finetune RP; sin especialización de roleplay |
| Qwen/Qwen3.5-4B | 4B | no disponible | safetensors y GGUF oficiales | Apache 2.0 | Modelo original, con alineamiento estándar y sin ajuste de roleplay |

No se dispone de datos de rendimiento comparables entre estas variantes más allá de las mediciones internas del autor.

## Limitaciones y advertencias

- El ajuste fino "uncensored" reduce los rechazos y puede generar contenido inapropiado, ofensivo o inseguro; requiere filtros y políticas de uso en cualquier despliegue público.
- Riesgo de alucinación propio de un modelo de 4B en tareas factuales; no es adecuado como fuente de verdad sin verificación.
- El benchmark publicado es una prueba interna de 30 turnos en ruso centrada en roleplay, no una evaluación estandarizada; los números no son comparables con MMLU o HumanEval.
- El corpus de calibración cubre siete idiomas, pero no hay evaluación formal de calidad por idioma; el rendimiento fuera de esos idiomas puede degradarse más con la cuantización.
- Discrepancia entre el nombre del modelo (4B) y los 333,5 millones de parámetros reportados en safetensors; conviene verificar el tamaño real antes de planificar el despliegue.
- La licencia del finetune RP no está declarada; el repositorio se distribuye bajo Apache 2.0 por herencia de los modelos base, lo que puede no cubrir todos los derechos sobre los pesos ajustados. Verificar antes de uso comercial.
- La cuantización parte de un Q8_0 y no de un F16, por lo que el error acumulado respecto al modelo original es mayor que el reportado frente a Q8_0.
- El repositorio no tiene descargas ni validación de la comunidad en el momento de la consulta; tratar las mediciones del autor como no replicadas de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Vzdorrr/Nocta-Qwen3.5-4B-RP-GGUF
- Modelo base del finetune: https://huggingface.co/minas2025/Qwen-3.5-4B-RP-Finetune
- Finetune intermedio: https://huggingface.co/DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp (herramientas `llama-imatrix`, `llama-quantize`): https://github.com/ggml-org/llama.cpp
