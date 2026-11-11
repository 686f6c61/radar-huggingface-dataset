# tahamajs/llava-qwen-0.5b-samba-m3-scienceqa

## Resumen

`llava-qwen-0.5b-samba-m3-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro de su proyecto NeuralOps, un marco de trabajo centrado en la cirugía de mecanismos de atención sobre modelos ya entrenados. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (un VLM compacto de LLaVA con torre visual SigLIP congelada y decodificador Qwen2 de 24 capas) y sustituye el mecanismo de atención cuadrática en 18 de sus 24 capas por un bloque híbrido denominado `SAMBAM3Block`, que combina atención local de ventana deslizante con un componente SSM tipo Mamba espectral.

El objetivo no es tanto ofrecer un modelo listo para producción como demostrar una técnica de compresión y adaptación: reemplazar atención por SSM en un VLM preentrenado y recuperar capacidad mediante destilación de conocimiento desde el modelo profesor original. El checkpoint resultante pesa 296,34 MB (frente a 1,66 GB del base en FP16, un 82,6 % menos) y se evalúa sobre el subconjunto con imagen de ScienceQA.

Es relevante ahora porque ejemplifica una línea de investigación activa: reducir el coste cuadrático de la atención en modelos multimodales sin reentrenar desde cero, conservando además solo los pesos quirúrgicos modificados. La licencia MIT y el reducido tamaño del artefacto lo hacen fácil de inspeccionar, aunque su alcance funcional es muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con 18 capas sustituidas por `SAMBAM3Block` (atención local de ventana deslizante + SSM Mamba espectral) y 6 capas de atención cuadrática ancla |
| Parametros totales | Aproximadamente 0,5 mil millones (heredados del base LLaVA-Qwen-0.5B); el artefacto publicado contiene solo los pesos quirúrgicos (310.732.260 bytes en FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados están en FP16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (FP16, solo atención modificada) + `surgical_manifest.json` con topología de la cirugía |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave con Qwen2-0.5B: torre visual SigLIP de 27 capas congelada, proyector multimodal de 2 capas MLP y decodificador de 24 capas con dimensión oculta D=1024, 16 cabezas y `head_dim=64`. Sobre esta base, NeuralOps aplica una cirugía selectiva: 18 de las 24 capas del decodificador reemplazan su `self_attn` por el bloque `SAMBAM3Block`, que combina atención local de ventana deslizante con un SSM Mamba espectral. Las 6 capas restantes (`[3, 7, 11, 15, 19, 23]`) mantienen atención cuadrática como anclas, siguiendo un patrón híbrido `hybrid_3_1`. Quedan congelados y excluidos del artefacto la torre visual, el proyector, los MLP del decodificador y los embeddings.

El entrenamiento se realiza en dos etapas de destilación de conocimiento desde el modelo profesor (el LLaVA-Qwen-0.5B original), con 91 pasos totales (31 en etapa 1, 60 en etapa 2) sobre una NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 15.121 MB y una duración total de 120,7 segundos. El dataset es `derek-thomas/ScienceQA`, evaluado sobre el subconjunto de validación con imágenes. Los resultados de la destilación son notables en términos relativos: la precisión pasa del 33,75 % en zero-shot tras la cirugía al 56,88 % tras la destilación (+23,13 puntos), acercándose al profesor (63,75 %), y la perplejidad baja de 3,23 a 2,54 (profesor: 2,45).

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM, especialmente las del formato ScienceQA (selección de opción entre alternativas).
- Razonamiento visual básico sobre figuras y diagramas científicos sencillos.
- Soporte de plantilla de chat (`chat_template.json` incluido).
- Capacidad multilingüe: limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni vídeo.
- El alcance está deliberadamente restringido al subconjunto con imagen de ScienceQA; no es un VLM de propósito general.

## Casos de uso

- Investigación en cirugía de atención: sirve como referencia reproducible para estudiar cómo afecta sustituir atención por SSM en un VLM preentrenado, gracias al manifiesto `surgical_manifest.json` que documenta exactamente qué componentes se modificaron.
- Destilación de conocimiento en modelos multimodales: el par de métricas pre-KD (33,75 %) y post-KD (56,88 %) permite evaluar la eficacia de recetas de destilación sobre arquitecturas híbridas con presupuesto de cómputo mínimo (120,7 s en una RTX 3090).
- Prototipado de VQA educativa: para experimentar con asistentes que respondan preguntas de ciencias a partir de figuras, siempre que el dominio se mantenga cercano a ScienceQA.
- Estudio de eficiencia de despliegue: con 296,34 MB de pesos, es útil para medir latencia y huella de memoria de bloques SSM frente a atención cuadrática en GPUs de consumo.
- Benchmarking de operadores SSM: el registro `samba_m3` de NeuralOps puede compararse contra otras variantes del "attention zoo" sobre el mismo base y dataset.
- Docencia y divulgación: ejemplo compacto y de código abierto (MIT) para explicar atención local, SSM y destilación en un curso de arquitecturas eficientes.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen, split de validación:

| Metrica | Profesor (base) | Zero-shot tras cirugía | Final tras destilación | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 33,75 | 56,88 | +23,13 |
| Perplejidad | 2,45 | 3,23 | 2,54 | -0,69 |

Telemetría de entrenamiento declarada: 91 pasos, 120,7 s, pico de 15.121 MB de VRAM en una RTX 3090. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto ocupa 296,34 MB, pero requiere cargar el modelo base completo para reconstruir la arquitectura; con el base en FP16 (1,66 GB) el total ronda los 2 GB de pesos, más activaciones y caché.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16; una RTX 3090 (24 GB) es suficiente y fue la usada en el entrenamiento.
- Cabe holgadamente en GPUs de consumo: RTX 3060, 4060, 4070, 4090, así como en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: la librería propietaria `neuralops` mediante `load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos GGUF no hay ruta directa a llama.cpp.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el bloque SSM reduce el coste cuadrático teórico en 18 de 24 capas, pero no se aportan mediciones de tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-samba-m3-scienceqa` | ~0,5 B | no disponible | 56,88 % acc / 2,54 PPL | MIT | Hugging Face, requiere `neuralops` |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5 B | no disponible en la información | 63,75 % acc / 2,45 PPL | no disponible en la información | Hugging Face, transformers |
| Otros VLM pequeños (p. ej. variantes Qwen2-VL-2B, SmolVLM) | 2 B aprox. | no disponible | no disponible | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría queda limitada porque la información proporcionada no incluye sus resultados en ScienceQA ni sus especificaciones de contexto.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente sobre ScienceQA con imagen; su generalización a otras tareas visuales es previsiblemente muy pobre.
- Solo habla inglés; no hay soporte multilingüe documentado.
- Riesgo alto de alucinación fuera del dominio de entrenamiento, dado el escaso volumen de ajuste (91 pasos, 120,7 s).
- Los pesos publicados son únicamente los deltas quirúrgicos de atención; es imprescindible el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y la librería `neuralops` para reconstruirlo, lo que limita la portabilidad.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`).
- Licencia MIT, por lo que el uso comercial está permitido, pero conviene revisar la licencia del modelo base y del dataset ScienceQA antes de explotarlo en producción.
- No se documentan sesgos específicos, pero al derivar de Qwen2 y ajustarse sobre un dataset académico de ciencias, hereda los sesgos del base y los del corpus de ScienceQA.
- No apto para producción en dominios abiertos: es un artefacto de investigación sobre compresión y destilación, no un VLM de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-samba-m3-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del bloque `samba_m3`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/samba_m3.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
