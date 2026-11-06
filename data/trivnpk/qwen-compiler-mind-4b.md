# Trivnpk/Qwen-Compiler-Mind-4B

## Resumen

Qwen-Compiler-Mind-4B es un modelo derivado de `empero-ai/Qwen3.8-4B-Distill` (4.411.424.256 parámetros totales, 32 capas, dimensión oculta 2560) publicado por Trivnpk (@Trivnpk) y Ritmada (@RitmadaPrompt). No es un modelo entrenado desde cero, sino una modificación de pesos y activaciones mediante técnicas de *representation engineering* orientadas a dos objetivos declarados: eliminar el comportamiento de rechazo del modelo base y sustituirlo por un sesgo hacia el rigor de programación de sistemas, además de reducir la deriva hacia el chino y reforzar la salida en inglés y vietnamita.

La intervención se concentra en la capa 26 de 32, identificada por los autores como "ground zero" tanto del vector de rechazo (intensidad 15,4400) como del vector de idioma chino (intensidad 13,8238). En lugar de anular directamente las activaciones, el modelo aplica atenuación de margen suave y reequilibrio de energía entre dominios, con conservación de la norma L2 para no romper el escalado de RMSNorm. El repositorio distribuye cuantizaciones GGUF (Q4_K_M, Q6_K, Q8_0), un bundle PyTorch con los tensores de direccionamiento y un adaptador de hooks de inferencia.

Es relevante ahora porque ejemplifica una línea de trabajo de bajo coste computacional: modificar el comportamiento de un modelo de 4B mediante edición de representaciones internas en lugar de reentrenamiento o RLHF, con artefactos listos para Ollama y llama.cpp. Su nicho declarado es la generación de código de sistemas (C, gestión de memoria, IRQ, DMA) con un fichero de gramática GBNF para forzar salida determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3, 32 capas, hidden dimension 2560) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (~2,1 GB), Q6_K (~2,8 GB), Q8_0 (~3,6 GB); pesos safetensors en FP (tamano de repo 54,4 GB) |
| Idiomas soportados | vi, en (segun metadatos y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF; bundle PyTorch adicional (`qwen_isomorphic_bundle.pt`) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3 con 32 capas y dimensión oculta 2560, destilado por empero-ai a partir de un modelo mayor (el nombre `Qwen3.8-4B-Distill` sugiere destilación, aunque no se detallan en la información disponible los tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO). Sobre esa base, los autores no reentrenan: aplican una intervención en el espacio latente en la capa 26.

La innovación técnica declarada es la "Isomorphic Latent Compensation": en lugar de poner a cero los vectores de rechazo y de idioma chino, se aplica atenuación de margen suave (τ) combinada con reequilibrio de energía entre dominios, de modo que la energía retirada del vector de rechazo se reinyecta en una dirección de "rigor de compilador" y la retirada del vector chino se compensa con una dirección inglés-vietnamita. Se impone además conservación estricta de la norma L2 (`x_out = (x + Δ) · (‖x‖₂ + ε) / (‖x + Δ‖₂ + ε)`) para mantener el escalado de RMSNorm y evitar la explosión de logits. La inferencia con el bundle requiere un hook dinámico en el forward (`apply_transmutation.py`); las versiones GGUF incorporan el efecto de forma estática.

## Capacidades

- Generación de texto conversacional en inglés y vietnamita, con formato de chat Qwen (`<|im_start|>`, `<|im_end|>`) y bloque `<think>` para razonamiento previo a la respuesta.
- Generación de código de sistemas: el autor orienta el modelo hacia C de bajo nivel (casting seguro a `size_t`, gestión de DMA, registro de IRQ, limpieza en orden LIFO).
- Salida determinista de código mediante el fichero de gramática `compiler_mind.gbnf`, que restringe el muestreo a estructuras válidas de compilador.
- Comportamiento de rechazo atenuado por edición de representaciones: el modelo tiende a responder en lugar de declinar, redirigiendo la negativa hacia exigencia técnica.
- Reducción de la mezcla de chino en la salida y refuerzo del inglés POSIX y del vietnamita técnico.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible de forma explícita; solo se documenta el modo `<think>` heredado del base.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de controladores y rutinas de bajo nivel en C: el modelo está calibrado para producir secuencias como adquisición de lock, mapeo DMA y registro de IRQ con limpieza en orden LIFO ante fallo, que es exactamente el ejemplo que documenta el autor.
- Code review de código de sistemas: uso del modo `<think>` para trazar el flujo de recursos y detectar fugas o liberaciones fuera de orden en parches de kernel o drivers.
- Generación restringida por gramática en pipelines de CI: con `compiler_mind.gbnf` se puede forzar que la salida cumpla una gramática de C o de una DSL interna antes de pasarla a un compilador, reduciendo iteraciones de compilación fallida.
- Asistente de documentación técnica bilingüe inglés-vietnamita: el reequilibrio hacia `en_vi` está pensado para mantener cadenas de razonamiento en inglés POSIX y explicaciones en vietnamita técnico, útil en equipos mixtos de Vietnam.
- Despliegue local en portátiles y móviles: la cuantización Q4_K_M de ~2,1 GB permite ejecutar el modelo en Ollama o llama.cpp en hardware de gama baja para autocompletado de código offline.
- Prototipado rápido de prompts que requieren respuestas sin rechazo en dominios técnicos sensibles (por ejemplo, análisis de vulnerabilidades o ingeniería inversa de binarios), con la advertencia de que la atenuación del rechazo es una modificación de comportamiento no auditada.
- Servicio de chat ligero en una sola GPU consumer: al ser un 4B, cabe en GPUs de 8-12 GB en FP16 y en menos con cuantización, lo que permite servir varios usuarios concurrentes con vLLM o llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma que la cuantización Q6_K alcanza un "99,5 % de precisión FP16" y que Q8_0 se usa como referencia de precisión, sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada: ~8,8 GB en FP16 (4,41B parámetros × 2 bytes); ~2,1 GB con Q4_K_M; ~2,8 GB con Q6_K; ~3,6 GB con Q8_0.
- GPU recomendadas: A100 o H100 para servir en FP16 con throughput alto; RTX 4090, RTX 3090 o RTX 4080 para FP16 con un solo usuario; RTX 3060 12 GB, RTX 4060 Ti 16 GB o GPUs de 8 GB en cuantización Q4/Q6.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más usando Q4_K_M; en CPU también es viable por el tamano reducido.
- Opciones de despliegue: Ollama (Modelfile incluido), llama.cpp, LM Studio, y PyTorch con `apply_transmutation.py` para cargar el bundle de la capa 26. vLLM y TGI no se documentan en la información disponible.
- Latencia y throughput: no disponibles; el autor solo califica Q6_K como "rápido en PC/Mac" sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen-Compiler-Mind-4B | 4,41B | no disponible | Apache 2.0 | HF, GGUF, Ollama | Edición de representaciones en capa 26; foco en C de sistemas |
| Qwen3-4B (familia base) | ~4B | no disponible | Apache 2.0 | HF, GGUF, Ollama | Modelo original de Qwen; sin modificación de rechazo |
| empero-ai/Qwen3.8-4B-Distill | ~4,3B (32 capas, hidden 2560) | no disponible | no disponible | HF | Base directo del modelo; sin reequilibrio latente |
| Otros 4B de la familia Llama o Gemma | ~4B | no disponible | licencias propias | HF, GGUF | Alternativas de mismo tamano para despliegue local; sin capacidades de edición latente |

No se dispone de cifras de rendimiento comparativas en la información proporcionada, por lo que la comparación se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La atenuación del rechazo es una modificación de comportamiento no validada con evaluaciones de seguridad publicadas; puede aumentar respuestas a peticiones que el modelo base rechazaba, incluidas las de contenido dañino fuera del dominio técnico.
- La conservación de norma L2 y el reequilibrio de energía son heurísticos; no hay benchmarks que confirmen que no degradan capacidades generales del base (conocimiento, matemáticas, multilingüismo amplio).
- Idiomas declarados solo vi y en; el resto de idiomas, incluido el español, no está cubierto y el propio objetivo es reducir la salida en chino, lo que puede degradar tareas multilingües heredadas del base.
- Longitud de contexto no documentada; no se puede asumir la ventana del Qwen3 original sin verificación.
- El uso del bundle PyTorch requiere cargar hooks personalizados (`apply_transmutation.py`); las versiones GGUF no permiten desactivar la modificación, así que el comportamiento editado es irreversible en esos artefactos.
- Riesgo de alucinación típico de un modelo 4B destilado, agravado por el sesgo hacia respuestas asertivas y por el modo `<think>` que puede producir cadenas de razonamiento largas y confiadas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `empero-ai/Qwen3.8-4B-Distill` tiene licencia "no disponible" en la información proporcionada; conviene verificar la compatibilidad antes de un despliegue comercial.
- El repositorio ocupa 54,4 GB por incluir pesos safetensors además de los GGUF; la descarga completa no es necesaria si solo se usan las cuantizaciones.
- Solo 173 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Trivnpk/Qwen-Compiler-Mind-4B
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen/models
- Guía de uso con llama.cpp (enlazada desde la model card): https://huggingface.co/Trivnpk/Qwen-Compiler-Mind-4B
- Papers, blogs, repositorios o demos adicionales: no disponible en la información proporcionada.
