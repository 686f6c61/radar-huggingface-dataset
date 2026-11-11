# tahamajs/llava-qwen-0.5b-adaptive-span-attention-scienceqa

## Resumen

`tahamajs/llava-qwen-0.5b-adaptive-span-attention-scienceqa` es un modelo vision-lenguaje (VLM) experimental derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, publicado por el autor tahamajs dentro del proyecto NeuralOps. Su particularidad no es el rendimiento bruto, sino la intervención arquitectónica: se han sustituido 18 de las 24 capas de atención del decodificador Qwen2 por el operador `AdaptiveSpanAttention` (atención de span adaptativo), manteniendo 6 capas cuadráticas de anclaje en las posiciones `[3, 7, 11, 15, 19, 23]` bajo un patrón denominado `hybrid_3_1`.

El modelo conserva intacto el tándem visual de LLaVA (encoder SigLIP congelado más proyector MLP de dos capas) y solo se han reentrenado por destilación los pesos de atención y layernorm del decodificador sobre el subconjunto con imagen de `derek-thomas/ScienceQA`. El resultado es un artefacto de investigación orientado a estudiar cómo se comportan mecanismos de atención subcuadráticos en el enrutamiento multimodal denso visión-texto, no un modelo listo para producción.

Es relevante ahora porque ejemplifica una línea de trabajo creciente: la "cirugía de atención" sobre modelos abiertos para reducir coste computacional en contextos largos y multimodalidad, publicando los pesos de atención por separado (459,16 MB en FP16) que se cargan sobre el modelo base congelado. El tamaño total del repositorio es de 0,5 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM LLaVA: encoder SigLIP congelado + proyector MLP 2 capas + decodificador Qwen2 de 24 capas con atencion hibrida (18 capas `AdaptiveSpanAttention` + 6 capas cuadraticas de anclaje) |
| Parametros totales | no disponible (el modelo base es de 0,5B; el checkpoint publicado contiene solo pesos de atencion y layernorm de 459,16 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16) + configs de processor y tokenizer + `training_metrics.json` |
| Geometria del decodificador | 24 capas, D=1024, H=16, d_h=64 |
| Patron de cirugia | `hybrid_3_1` (18 capas transplantadas, anclas en `[3, 7, 11, 15, 19, 23]`) |
| Libreria | neuralops |

## Arquitectura y entrenamiento

El modelo parte de `LlavaForConditionalGeneration` con un encoder de visión SigLIP y un proyector multimodal MLP de dos capas, ambos completamente congelados durante todo el proceso. El decodificador de lenguaje es Qwen2 con 24 capas, dimensión oculta 1024, 16 cabezas de atención y dimensión por cabeza de 64. Sobre esa base se aplica una "cirugía de atención": 18 de las 24 capas se reemplazan por `AdaptiveSpanAttention` (implementado en `neuralops/layers/adaptive/adaptive_span_attention.py`), mientras que 6 capas mantienen atención cuadrática estándar como anclas. El objetivo declarado es aislar la capacidad del mecanismo subcuadrático para manejar el enrutamiento cross-modal denso entre tokens visuales y de texto.

El entrenamiento es una destilación de conocimiento en dos etapas sobre el subconjunto con imagen de ScienceQA: 219 pasos de optimización en total (82 en la etapa 1 y 137 en la etapa 2), con una duración de 120,2 segundos y un pico de VRAM de 18.107 MB en una NVIDIA RTX 3090 de 24 GB. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de ScienceQA. Los pesos publicados corresponden únicamente a los parámetros de atención y layernorm transplantados; el resto del modelo debe cargarse desde el checkpoint base.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en tareas de razonamiento visual y respuesta a preguntas sobre figuras.
- Respuesta a preguntas de opción múltiple sobre contenido científico con soporte visual (ScienceQA).
- Razonamiento multimodal básico: interpretación de diagramas e ilustraciones junto con texto.
- Conversación multi-turno heredada del modelo base LLaVA-Interleave-Qwen-0.5B.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, visión adicional, audio: no disponible.

## Casos de uso

- Investigación sobre mecanismos de atención eficiente: el modelo sirve como banco de pruebas para medir cómo afecta sustituir atención cuadrática por `AdaptiveSpanAttention` en un VLM, comparando contra el profesor original con las métricas ya publicadas.
- Experimentos de destilación multimodal: permite reproducir el pipeline de dos etapas sobre ScienceQA y evaluar el impacto de congelar el tower visual mientras se adapta solo la atención del decodificador.
- Evaluación de robustez cross-modal: útil para estudiar la degradación de precisión (46,90 % del profesor frente a 40,00 % del destilado) al introducir operadores subcuadráticos en el enrutamiento visión-texto.
- Docencia y divulgación técnica: ejemplo reproducible de "attention surgery" con código de carga explícito y pesos separados del base, adecuado para talleres sobre arquitecturas eficientes.
- Prototipado de asistentes educativos sobre imágenes científicas: con 40 % de precisión en ScienceQA, sirve para demos internas de VQA educativa, no para despliegue real.
- Benchmarking de frameworks de inferencia: al ser un modelo pequeño (base 0,5B) con pesos de atención de 459 MB, es manejable para comparar latencias entre backends en GPUs de consumo.
- Estudio de la perplexity condicionada por imagen: la mejora de 573,36 a 2,90 tras la destilación es un caso de análisis para investigar calibración de modelos multimodales.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Zero-shot pre-KD (`adaptive_span_attention`) | Post-KD destilado | Delta |
|---|---:|---:|---:|---:|
| ScienceQA Visual Accuracy (%) | 46,90 | 29,66 | 40,00 | +10,34 |
| Perplexity de respuesta condicionada por imagen | 3,85 | 573,36 | 2,90 | -570,45 |

Telemetría de entrenamiento: 219 pasos (82 etapa 1 + 137 etapa 2), 120,2 s de duración, pico de 18.107 MB de VRAM en RTX 3090 24 GB, marca temporal 2026-11-11T02:31:00Z.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 0,5B; en FP16 el conjunto ronda 1-1,5 GB, y el pico medido durante el entrenamiento fue de 18.107 MB en RTX 3090 (incluye estados de optimizador y activaciones).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en FP16; el entrenamiento documentado se hizo en RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores; también en GPUs integradas con suficiente memoria compartida para cuantizaciones agresivas, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: el código de referencia usa `transformers` (`LlavaForConditionalGeneration`) más `safetensors` y la función `apply_qwen_attention_surgery` del repositorio NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el operador `AdaptiveSpanAttention` requeriría implementación específica en cada backend.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (acc.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-adaptive-span-attention-scienceqa` | base 0,5B | no disponible | 40,00 % | MIT | Hugging Face (pesos de atención) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 46,90 % | no disponible en la informacion | Hugging Face |
| LLaVA-1.5-7B | 7B | 4K (tipico) | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| Qwen2-VL-2B | 2B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Hugging Face |

La comparación relevante es contra su propio profesor: el modelo destilado pierde 6,9 puntos de precisión en ScienceQA pero reduce la perplexity por debajo de la del profesor (2,90 frente a 3,85), lo que sugiere respuestas más concentradas en la distribución aunque con más errores de elección.

## Limitaciones y advertencias

- Precisión limitada: 40,00 % en ScienceQA frente al 46,90 % del profesor; no es apto para producción sin una evaluación adicional en el dominio objetivo.
- Solo se publican los pesos de atención y layernorm; es obligatorio cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugía con código del repositorio NeuralOps, lo que introduce dependencia de un script externo.
- El operador `AdaptiveSpanAttention` no es estándar en `transformers` ni en los backends de inferencia habituales; el despliegue requiere implementación propia.
- Sesgos conocidos: no documentados por el autor; al entrenarse solo sobre ScienceQA, el dominio queda restringido a preguntas científicas con imagen.
- Riesgo de alucinación: alto en dominios fuera de ScienceQA, dado el tamaño del modelo base (0,5B) y el entrenamiento acotado.
- Idioma: únicamente inglés declarado; no se garantiza comportamiento en castellano.
- Longitud de contexto: no documentada; no se debe asumir la del modelo base sin verificación.
- Licencia MIT permite uso comercial, pero la ausencia de garantías y la falta de benchmarks independientes desaconsejan su uso en sistemas críticos.
- Resultados de benchmarks declarados por el autor y marcados como no verificados (`verified: false`); no han sido replicados de forma independiente.
- Fecha de creación en el Hub (2026-11-11) y telemetría de entrenamiento coherentes con un experimento reciente; el número de descargas y likes es cero, lo que indica nula validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-adaptive-span-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `AdaptiveSpanAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/adaptive_span_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Paper de Adaptive Span (referencia del mecanismo): no disponible en la informacion proporcionada.
