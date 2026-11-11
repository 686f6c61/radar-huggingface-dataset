# tahamajs/llava-qwen-0.5b-svd-linear-decay-scienceqa

## Resumen

`llava-qwen-0.5b-svd-linear-decay-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un marco de trabajo centrado en la cirugía de mecanismos de atención en modelos multimodales. El modelo parte del VLM `llava-hf/llava-interleave-qwen-0.5b-hf` (torre de visión SigLIP congelada, proyector MLP de 2 capas y decodificador Qwen2 de 24 capas con dimensión 1024) y sustituye el mecanismo de atención cuadrática de 18 de sus 24 capas por un operador lineal denominado `svd_linear_decay` (`DecayDecayLinearAttention`), que combina descomposición en valores singulares de bajo rango con un decaimiento temporal exponencial.

El objetivo del checkpoint no es ofrecer un modelo de producción, sino servir como artefacto reproducible de un experimento de "attention surgery" con destilación de conocimiento: se reemplaza la atención densa por una recurrencia lineal de coste O(N) y se reentrena únicamente el delta quirúrgico, manteniendo intactos la torre visual, el proyector, las MLP y los embeddings. El resultado se empaqueta como pesos delta en FP16 de solo 80,71 MB, frente a los 1,66 GB del modelo base completo, lo que supone una reducción del 95,3 % del artefacto.

La relevancia es fundamentalmente metodológica: demuestra el flujo completo de sustitución de atención, destilación y evaluación sobre ScienceQA con un presupuesto de cómputo mínimo (106 pasos de optimización, 121 segundos en una RTX 3090). El rendimiento final, sin embargo, queda muy por debajo del profesor, por lo que debe interpretarse como una prueba de concepto y no como un modelo listo para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP + proyector MLP + decodificador Qwen2) con atención lineal `svd_linear_decay` en 18 de 24 capas |
| Parametros totales | no disponible (el modelo base LLaVA-Qwen-0.5B ronda los 0,5B; el checkpoint solo publica el delta de atención) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta de atención en FP16) + `surgical_manifest.json` |

## Arquitectura y entrenamiento

El modelo hereda la topología LLaVA-Interleave de Qwen: torre de visión SigLIP congelada de 27 capas, proyector multimodal de 2 capas y decodificador Qwen2 de 24 capas con D=1024, 16 cabezas y head_dim=64. La intervención quirúrgica afecta a 18 de las 24 capas del decodificador (esquema `hybrid_3_1`), que pasan de atención cuadrática a `DecayDecayLinearAttention`. Este operador factoriza las matrices de proyección mediante SVD de bajo rango y aplica un kernel de decaimiento temporal exponencial con recurrencia `S_t = λ·S_{t-1} + K_tᵀ·V_t`, `O_t = Q_t·S_t`, implementada con prefix-scans por chunks para evitar materializar matrices N×N. Se conservan seis capas ancla cuadráticas en los índices `[3, 7, 11, 15, 19, 23]` para preservar capacidad expresiva local.

El entrenamiento consistió en destilación de conocimiento en dos etapas (35 + 71 pasos, 106 en total) sobre ScienceQA, con 121 segundos de duración y un pico de 12.502 MB de VRAM en una RTX 3090. Solo se actualizaron las atenciones modificadas y los layernorms del decodificador; la torre visual, el proyector, las MLP y los embeddings permanecieron congelados. El delta resultante se serializa como 426 tensores en FP16.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`) sobre preguntas de contenido científico y STEM.
- Razonamiento visual básico limitado a preguntas de opción múltiple con imagen, propio del conjunto ScienceQA.
- Conversación multimodal con plantilla de chat incluida (`chat_template.json`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: solo inglés.
- Modo thinking, visión de alta resolución, audio o vídeo: no disponibles.

## Casos de uso

- Investigación en eficiencia de atención: el checkpoint sirve como referencia reproducible para comparar atención cuadrática frente a `svd_linear_decay` bajo el mismo pipeline de destilación y evaluación.
- Reproducción de experimentos de attention surgery: el manifiesto `surgical_manifest.json` y `training_metrics.json` permiten auditar exactamente qué tensores se modificaron y con qué hiperparámetros.
- Estudio de destilación de conocimiento en VLMs pequeños: la comparativa profesor (63,75 %) / pre-KD (39,38 %) / post-KD (31,25 %) documenta el efecto del proceso de destilación sobre un modelo de 0,5B.
- Docencia y formación técnica: útil para explicar en un aula cómo se sustituye un mecanismo de atención y cómo se mide su impacto con accuracy y perplejidad.
- Prototipado de inferencia de bajo coste: el delta de 80,71 MB permite cargar el modelo quirúrgico sobre el base en entornos con almacenamiento limitado.
- Pruebas de integración con la librería NeuralOps: el ejemplo de carga vía `neuralops.hub.load_surgeried_model` facilita validar el ecosistema antes de escalar a modelos mayores.
- Evaluación comparativa de operadores lineales: base para contrastar `svd_linear_decay` con otras variantes del "attention zoo" del proyecto.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto STEM con imagen, split de validación:

| Metrica | Profesor (base) | Pre-KD (zero-shot) | Post-KD (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 39,38 | 31,25 | -8,13 |
| Perplejidad | 2,45 | 12,43 | 3,17 | -9,26 |

Telemetría de entrenamiento: 106 pasos (35 etapa 1 + 71 etapa 2), 121,0 s en RTX 3090, pico de VRAM 12.502 MB, fecha 2026-11-11T10:34:51Z.

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma explícita; el entrenamiento consumió 12.502 MB en una RTX 3090, por lo que la inferencia completa (base + delta) debería caber holgadamente en 8-12 GB en FP16.
- GPU recomendadas: RTX 3090 (validada por el autor), RTX 4090, A100, H100; cualquier GPU con al menos 8 GB para FP16.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores.
- Opciones de despliegue: la librería `neuralops` (`load_surgeried_model`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-svd-linear-decay-scienceqa` | ~0,5B (delta 80,71 MB) | no disponible | 31,25 % acc / 3,17 PPL | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la información | Hugging Face |
| LLaVA-1.5-7B | ~7B | 4.096 tokens | no disponible en la información | no disponible en la información | Hugging Face |
| Qwen2-VL-2B | ~2B | no disponible en la información | no disponible en la información | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Caída de accuracy de 32,5 puntos porcentuales respecto al profesor (63,75 % → 31,25 %) y de 8,13 puntos respecto al estado pre-KD, lo que indica que la destilación no recupera la capacidad original.
- Perplejidad final (3,17) aún un 29 % superior a la del profesor (2,45), pese a la mejora sustancial frente al pre-KD (12,43).
- Entrenamiento muy corto (106 pasos, 121 s) sobre un único dataset (ScienceQA), lo que limita la generalización fuera del dominio STEM con imagen.
- Solo inglés; sin soporte documentado de otros idiomas.
- Riesgo elevado de alucinación en preguntas abiertas: el modelo está ajustado para opción múltiple y no se ha evaluado en generación libre.
- Licencia MIT, permisiva para uso comercial, aunque el autor no ofrece garantías sobre el rendimiento en producción.
- El checkpoint es un delta de atención: requiere cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` para funcionar; no es autónomo.
- Sin soporte documentado de tool calling, agentes ni cuantización; el pipeline de despliegue está atado a la librería `neuralops`.
- Resultados de benchmarks marcados como `verified: false` por el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-svd-linear-decay-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `svd_linear_decay`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/svd_linear_decay.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
