# tahamajs/llava-qwen-0.5b-alibi-scienceqa

## Resumen

`llava-qwen-0.5b-alibi-scienceqa` es un modelo de vision-lenguaje (VLM) publicado por el desarrollador Taha Majlesi (usuario `tahamajs`) dentro del proyecto NeuralOps, un zoo experimental de modelos orientado a la cirugía de mecanismos de atención. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (codificador visual SigLIP congelado, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión 1024 y 16 cabezas) y sustituye la atención cuadrática estándar en 18 de sus 24 bloques por atención con sesgos lineales (ALiBi), manteniendo 6 capas ancla cuadráticas en los índices 3, 7, 11, 15, 19 y 23.

El objetivo no es competir en rendimiento bruto, sino aislar experimentalmente cómo se comporta un mecanismo subcuadrático como ALiBi en el enrutamiento multimodal denso entre tokens visuales y textuales. Para ello, el codificador visual y el proyector se mantienen completamente congelados y solo se destilan los pesos de atención y layernorm sobre preguntas con imagen del conjunto ScienceQA.

El resultado es un artefacto de investigación de 0,5 GB con licencia MIT y pesos de atención en FP16 (459,16 MB), pensado para reproducir el experimento de destilación y para servir de base a estudios de extrapolación de longitud y eficiencia atencional. No es un modelo listo para producción generalista: su alcance es el razonamiento visual sobre ScienceQA y su idioma es únicamente el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo LLaVA: SigLIP (vision, congelado) + proyector MLP 2 capas + decodificador Qwen2 de 24 capas con cirugía de atención híbrida `hybrid_3_1` (18 capas ALiBi + 6 capas cuadráticas ancla) |
| Parametros totales | 0,5 B (modelo base `llava-interleave-qwen-0.5b-hf`); pesos de atención publicados: 459,16 MB en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base LLaVA-Interleave Qwen 0.5B no declara contexto explícito en la información proporcionada; ALiBi está diseñado para extrapolación de longitud) |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP16; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16) + configuración de processor y tokenizer + `training_metrics.json` |

## Arquitectura y entrenamiento

El modelo hereda la geometría del decodificador Qwen2 del modelo base: 24 capas, dimensión oculta D=1024, 16 cabezas de atención con dimensión por cabeza d_h=64 (todas potencias de 2). La cirugía `hybrid_3_1` reemplaza la atención estándar por `ALiBiAttention` en 18 capas y conserva atención cuadrática en 6 capas ancla, de modo que el modelo mantiene un anclaje posicional cuadrático mientras el resto de capas usa sesgos aditivos lineales por cabeza de la forma `bias[h, i, j] = -slope_h · (i - j)` en modo causal y `-slope_h · |i - j|` en modo bidireccional, sin embeddings posicionales. El codificador visual SigLIP y el proyector multimodal permanecen congelados, lo que aísla el efecto de ALiBi en el enrutamiento cross-modal.

El entrenamiento es una destilación de conocimiento en dos etapas sobre preguntas con imagen del dataset `derek-thomas/ScienceQA`: 125 pasos en la etapa 1 y 249 en la etapa 2, para un total de 374 pasos de optimización. El proceso completo se ejecutó en 120,4 segundos con un pico de VRAM de 21.508 MB sobre una NVIDIA RTX 3090 de 24 GB (timestamp UTC 2026-11-11T02:49:09). No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`): responde preguntas sobre el contenido de una imagen.
- Razonamiento visual de tipo ScienceQA: preguntas de ciencia con soporte de imagen, incluyendo opción múltiple y respuesta abierta.
- Conversación multi-turno: el modelo está etiquetado como `conversational` y soporta diálogo imagen-texto.
- Enrutamiento cross-modal denso entre tokens visuales y textuales mediante atención ALiBi en 18 de 24 capas.
- Extrapolación de longitud teórica: ALiBi no usa embeddings posicionales y aplica sesgos lineales, lo que en principio favorece la generalización a secuencias más largas que las vistas en entrenamiento (no se aportan mediciones de esta capacidad en la información disponible).
- No se documentan en la información disponible soporte de tool calling, function calling, agentes, visión de vídeo, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre mecanismos de atención: el modelo sirve como banco de pruebas controlado para medir el impacto de sustituir atención cuadrática por ALiBi en un VLM, ya que el codificador visual y el proyector están congelados y solo varían los pesos de atención del decodificador.
- Reproducción de experimentos de destilación: los pesos de atención en FP16 (459,16 MB) y el `training_metrics.json` permiten replicar la cirugía `hybrid_3_1` y la destilación en dos etapas sobre ScienceQA con un coste de cómputo bajo (120,4 s en una RTX 3090).
- Evaluación de extrapolación de longitud: al carecer de embeddings posicionales y usar sesgos lineales, es adecuado para estudiar el comportamiento de ALiBi en contextos más largos que los de entrenamiento en tareas visuales.
- Docencia y divulgación técnica: ejemplo mínimo y reproducible de cirugía de atención sobre un VLM de 0,5 B que cabe en una GPU de consumo.
- Prototipado de asistentes educativos de ciencia en inglés: responde preguntas con imagen sobre contenidos de ScienceQA, útil como línea base antes de escalar a modelos mayores.
- Comparación de familias de atención: junto con otras variantes del zoo NeuralOps, permite comparar ALiBi frente a atención cuadrática bajo el mismo contrato de visión congelada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre `derek-thomas/ScienceQA` (subconjunto con imagen, split de validación); las métricas están marcadas como no verificadas (`verified: false`).

| Metrica | Teacher baseline (`llava-interleave-qwen-0.5b`) | Pre-KD zero-shot (ALiBi) | Post-KD destilado (ALiBi) | Delta |
|---|---:|---:|---:|---:|
| Exactitud visual ScienceQA (%) | 46,90 | 32,41 | 40,69 | +8,28 |
| Perplejidad de respuesta condicionada por imagen | 3,85 | 51.165,86 | 2,91 | -51.162,96 |

Telemetría del entrenamiento: 374 pasos de optimización (etapa 1: 125; etapa 2: 249), 120,4 s de duración, pico de 21.508 MB de VRAM en una NVIDIA RTX 3090 de 24 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5 B en FP16 requiere aproximadamente 1 GB de pesos; con overhead de activaciones y del codificador SigLIP, el autor reporta un pico de 21.508 MB durante el entrenamiento en una RTX 3090, pero no se documenta la VRAM de inferencia.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar el modelo base en FP16; el autor validó el entrenamiento en una NVIDIA RTX 3090 de 24 GB. No se documentan pruebas en A100, H100 ni otras GPU.
- Cabe en GPU de consumo: sí, por el tamaño de 0,5 B; se espera que quepa en RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se aportan mediciones específicas.
- Opciones de despliegue: el modelo se distribuye como pesos de atención que deben cargarse sobre `llava-hf/llava-interleave-qwen-0.5b-hf` mediante `apply_qwen_attention_surgery` del repositorio NeuralOps; no se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI, y la librería declarada es `neuralops`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (acc. visual) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| `tahamajs/llava-qwen-0.5b-alibi-scienceqa` | 0,5 B | no disponible | 40,69 % | MIT | Hugging Face (pesos de atención) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (teacher) | 0,5 B | no disponible | 46,90 % | no disponible en la información | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` con atención original (pre-KD, referencia) | 0,5 B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (por ejemplo, otros VLM de 0,5 B) para ampliar la comparativa.

## Limitaciones y advertencias

- Pérdida de rendimiento frente al teacher: la exactitud visual cae de 46,90 % a 40,69 % tras la destilación, una diferencia de 6,21 puntos porcentuales que debe tenerse en cuenta en cualquier uso real.
- Perplejidad pre-destilación extremadamente alta (51.165,86): el modelo sin destilación es prácticamente inutilizable, lo que subraya la dependencia de los pesos destilados.
- Idiomas: solo inglés; no hay soporte multilingüe declarado.
- Dominio limitado: entrenado exclusivamente sobre preguntas con imagen de ScienceQA; no se documenta su comportamiento en otros dominios visuales.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 0,5 B, la fiabilidad factual es limitada.
- Sesgos: no se documentan análisis de sesgos en la información proporcionada.
- Licencia MIT: permite uso comercial, pero el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` puede tener sus propias condiciones que conviene revisar antes de un despliegue comercial.
- Requiere código externo: la carga no es estándar; es necesario aplicar la cirugía de atención con `apply_qwen_attention_surgery` del repositorio NeuralOps antes de cargar los pesos, lo que añade fricción y riesgo de incompatibilidad.
- Métricas no verificadas: los resultados de la model card están marcados como `verified: false` y proceden del propio autor.
- Artefacto de investigación: no está pensado para producción generalista ni para tareas fuera de su dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-alibi-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de ALiBi: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/alibi.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
