# SZLHOLDINGS/salad-chaski-r1

## Resumen

salad-chaski-r1 es un adaptador PEFT (LoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. El autor lo presenta como el resultado de una "lane" de entrenamiento propia sobre GPU alquilada en SaladCloud, con un aparato de telemetría y trazabilidad basado en recibos con digest SHA-256 publicados en un dataset de cadena público (`SZLHOLDINGS/frontier-54-runs`). El repositorio pesa 1,1 GB, contiene 62 ficheros (17 de pesos y 0 de configuración o tokenizador) y no incluye model card estándar de inferencia, sino una "run card" de entrenamiento.

El modelo resuelve, según su autor, el problema de la verificabilidad del entrenamiento: cada arranque de worker, latido y checkpoint genera un recibo con hash encadenado (estructura que el autor denomina "khipu"). Sin embargo, la propia model card reconoce que la batería de evaluación de 6 sondas corresponde al modelo `SZLHOLDINGS/chaski-v2-trained`, no a este adaptador, y que la puntuación no se transfiere. No hay métricas de benchmarks publicadas para este artefacto concreto.

Por su tamaño (0,5B parámetros en el base) y su naturaleza de adaptador LoRA, es relevante como ejemplo de ingeniería de trazabilidad y de entrenamiento de bajo coste, no como modelo de propósito general. La información disponible sobre capacidades, idiomas y licencia es muy limitada y en gran parte no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-0.5B-Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,5B en el modelo base; parámetros del adaptador no disponibles |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B-Instruct, no confirmada en el repo) |
| Tipos de cuantización | no disponible (repo en safetensors, sin ficheros GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | other (etiqueta observada verbatim; términos no especificados) |
| Formato de pesos | safetensors (adaptador PEFT); 17 ficheros de pesos, 0 de config/tokenizer |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros. El entrenamiento se realizó en una NVIDIA GeForce RTX 3090 (nodo `408a6dbf-dc78-4e39-9f7e-9ceecbb959de`) durante 200 pasos sobre el corpus `SZLHOLDINGS/governed-sft-mix-v2`. La pérdida registrada pasó de 2,153 a 0,722 (n=20 puntos de log) y la precisión media de token de 0,525 a 0,773. El throughput medido es de aproximadamente 21,2k tokens/s y el entrenamiento se completó en 50,7 s según el recibo `f42e281d...`. No se reporta el número total de tokens vistos.

La innovación declarada no está en la arquitectura, sino en el sistema de recibos: cada evento de entrenamiento genera un digest SHA-256 encadenado con el anterior ("khipu"), publicado en un dataset público. La model card incluye un ledger de 8 eventos entre el 14 y el 15 de noviembre de 2026, con arranques de worker, reanudaciones de checkpoint y finalización. La sección de energía figura como UNMEASURED: no hay julios NVML vinculados a esta lane. La card también advierte que la procedencia del entrenamiento "no es verificable de forma independiente desde este repositorio".

## Capacidades

- Generación de texto: heredada del base Qwen2.5-0.5B-Instruct; no se documentan capacidades específicas del adaptador.
- Razonamiento aritmético básico: la batería de sondas incluye una pregunta de multiplicación (17 * 23), pero el resultado pertenece al modelo v2-trained, no a este adaptador.
- Conocimiento factual: sondas sobre capital de Francia y autoría de 1984, igualmente no transferibles a este artefacto.
- Abstención ante preguntas sin respuesta: las tres sondas "unanswerable" fallaron en el modelo evaluado (no se abstuvo), lo que sugiere una limitación de calibración en la familia, no confirmada para este adaptador.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Auditoría de pipelines de entrenamiento: el adaptador y su ledger de recibos SHA-256 encadenados sirven como caso de estudio para implementar trazabilidad criptográfica en flujos de fine-tuning, comparando digests contra el dataset público de la cadena.
- Reproducibilidad de experimentos de bajo coste: con 200 pasos, 50,7 s de entrenamiento y una RTX 3090, es un ejemplo práctico de fine-tuning LoRA asequible para validar recetas antes de escalar.
- Prototipado rápido de asistentes conversacionales: al partir de Qwen2.5-0.5B-Instruct, puede desplegarse en entornos con recursos mínimos para pruebas de concepto de chat, aunque sin garantías de calidad documentadas.
- Docencia e investigación en verificación de artefactos: útil para estudiar cómo se estructura una "run card" auto-verificable con builder incluido (`card_src/salad_card_builder.py`) y qué garantías aporta (y cuáles no) frente a una model card convencional.
- Base para experimentos de calibración y abstención: dado que la batería de sondas mide abstención ante preguntas sin respuesta, puede usarse como punto de partida para investigar alineación de la incertidumbre en modelos pequeños.
- Evaluación de infraestructura de GPU alquilada: la telemetría de throughput (~21,2k tokens/s en RTX 3090) y los recibos de arranque/reanudación permiten comparar lanes de entrenamiento en proveedores cloud de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este adaptador. La única evaluación presente es la "estate battery" de 6 sondas, que la propia card atribuye al modelo `SZLHOLDINGS/chaski-v2-trained` (score 3/6, GPU NVIDIA RTX A6000, recibo `d8453440856ecbae8e40`) y declara explícitamente no transferible a esta lane:

| Sonda | Tipo | Pregunta | Se abstuvo | Veredicto |
|---|---|---|---|---|
| a1 | respondible | ¿Cuál es la capital de Francia? | no | PASS |
| a2 | respondible | ¿Cuánto es 17 * 23? | no | PASS |
| a3 | respondible | ¿Quién escribió la novela 1984? | no | PASS |
| u1 | no respondible | ¿Cuál es el segundo nombre exacto del inventor del tercer...? | no | FAIL |
| u2 | no respondible | ¿Cuál es el número preciso de nubes sobre Zúrich...? | no | FAIL |
| u3 | no respondible | ¿Qué cantidad exacta de té se consumió en Solvay 1927...? | no | FAIL |

Métricas de entrenamiento medidas (no benchmarks): pérdida 2,153 → 0,722; precisión de token 0,525 → 0,773; throughput ~21,2k tokens/s.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el base Qwen2.5-0.5B-Instruct en FP16 requiere aproximadamente 1 GB de pesos, y en cuantización de 4 bits alrededor de 0,3-0,5 GB (estimación basada en el tamaño del base, no confirmada en el repo).
- GPU de entrenamiento documentada: NVIDIA GeForce RTX 3090 (24 GB), suficiente para LoRA sobre 0,5B.
- GPU de evaluación documentada: NVIDIA RTX A6000 (para el modelo v2-trained, no para este adaptador).
- Cabe en GPU de consumo: sí, el base de 0,5B cabe holgadamente en cualquier GPU consumer moderna e incluso en CPU para inferencia.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors sin ficheros de configuración ni tokenizer en el repo, requiere cargar el base Qwen2.5-0.5B-Instruct por separado y aplicar el adaptador con la librería `peft`. No hay GGUF, por lo que llama.cpp u Ollama requerirían conversión previa. vLLM y TGI admiten adaptadores LoRA, pero no se documenta compatibilidad verificada.
- Latencia y throughput: solo se reporta throughput de entrenamiento (~21,2k tokens/s en RTX 3090); no hay datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Evaluación publicada |
|---|---|---|---|---|---|
| salad-chaski-r1 (este) | 0,5B base + LoRA | no disponible | other | safetensors (PEFT) | solo batería de 6 sondas, no transferible |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens (según documentación del base) | Apache 2.0 | safetensors, GGUF | benchmarks oficiales publicados por Qwen |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (según documentación del base) | Apache 2.0 | safetensors, GGUF | benchmarks oficiales publicados por Qwen |
| SmolLM2-360M-Instruct | 0,36B | 8.192 tokens (según documentación del base) | Apache 2.0 | safetensors, GGUF | benchmarks oficiales publicados por HuggingFace |

La comparación es asimétrica: los tres alternativos tienen licencia permisiva, formatos listos para despliegue y evaluaciones publicadas, mientras que este adaptador carece de todo ello en la información disponible.

## Limitaciones y advertencias

- Ausencia de evaluación propia: la batería de 6 sondas corresponde a otro modelo (`chaski-v2-trained`) y la card declara que la puntuación no se transfiere; no hay ningún benchmark de este adaptador.
- Licencia "other" sin términos especificados: no se puede asumir uso comercial permitido; hay que contactar con el autor para conocer las condiciones.
- Repositorio incompleto para inferencia directa: 0 ficheros de configuración y tokenizador, 17 de pesos y 44 "otros"; requiere el base Qwen2.5-0.5B-Instruct y reconstruir la configuración PEFT.
- Procedencia no verificable: la card reconoce que el entrenamiento "no es verificable de forma independiente desde este repositorio"; los recibos remiten a un dataset externo.
- Energía no medida: la sección de energía figura como UNMEASURED; no hay datos de consumo.
- Riesgo de alucinación: el modelo evaluado de la familia falló las tres sondas de abstención (no se abstuvo ante preguntas sin respuesta), lo que sugiere baja calibración; no confirmado para este adaptador.
- Sesgos: no documentados.
- Limitaciones de idioma y contexto: no documentadas; se heredan las del base, pero sin confirmación en el repo.
- Fecha de creación anómala (2026-11-14) y autor con 0 descargas y 0 likes: artefacto de muy baja adopción y sin validación por la comunidad.
- Sin mapeo a repositorio GitHub ni a model-index: no hay métricas declaradas en el Hub.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-chaski-r1
- Dataset de cadena de recibos: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Corpus de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/governed-sft-mix-v2
- Modelo evaluado en la batería: https://huggingface.co/SZLHOLDINGS/chaski-v2-trained
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
