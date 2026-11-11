# tahamajs/llava-qwen-0.5b-rpc-attention-scienceqa

## Resumen

`llava-qwen-0.5b-rpc-attention-scienceqa` es un checkpoint experimental de la familia LLaVA-Qwen-0.5B publicado por el usuario `tahamajs` dentro del proyecto NeuralOps. No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre `llava-hf/llava-interleave-qwen-0.5b-hf`: se sustituye el mecanismo de atención de 18 de las 24 capas del decodificador Qwen2 por un operador lineal denominado RPC Attention (Random Projection Compressed Attention), manteniendo congelados la torre de visión SigLIP, el proyector multimodal, las MLPs y los embeddings.

El objetivo declarado es servir como banco de pruebas ("Attention Surgery Zoo") para evaluar el impacto de sustituir atención cuadrática por alternativas lineales comprimidas en modelos visión-lenguaje pequeños, combinado con destilación de conocimiento desde el modelo profesor original. El resultado es un artefacto de pesos muy reducido (87,14 MB frente a 1,66 GB del base, un 94,9 % menos) que solo contiene los deltas de atención modificados y los layernorms del decodificador.

La relevancia práctica es limitada: se trata de un experimento de investigación sobre eficiencia de atención, no de un modelo listo para producción. Con 0,5 mil millones de parámetros y una precisión del 30 % en el subconjunto con imágenes de ScienceQA, queda muy por debajo del profesor (63,75 %) y del estado del arte en razonamiento visual STEM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre de visión SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con atención RPC lineal en 18/24 capas |
| Parametros totales | 0,5 mil millones (modelo base); artefacto publicado: 87,14 MB de pesos de atención en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, formato `attention_only_fp16`), más `surgical_manifest.json` y configuración |
| Dimension del modelo | D=1024, H=16 cabezas, head_dim=64 |
| Capas modificadas | 18/24 decodificador (esquema `hybrid_3_1`); 6 capas ancla cuadráticas en índices [3, 7, 11, 15, 19, 23] |
| Componentes congelados | SigLIP vision tower (27 capas), proyector multimodal, MLPs y embeddings |
| Libreria | `neuralops` |
| Pipeline | `image-text-to-text` |

## Arquitectura y entrenamiento

El modelo parte de `llava-interleave-qwen-0.5b-hf`, una arquitectura LLaVA estándar: un codificador visual SigLIP de 27 capas congelado, un proyector MLP de dos capas que alinea el espacio visual con el textual y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión por cabeza de 64. La intervención sustituye la self-attention cuadrática por `RPCAttention` (familia `linear`), un operador de atención comprimida por proyección aleatoria, en 18 de las 24 capas del decodificador, conservando atención cuadrática en 6 capas ancla para mantener capacidad expresiva.

El entrenamiento se realizó en dos etapas de destilación de conocimiento sobre el subconjunto con imágenes de ScienceQA (split de validación de `derek-thomas/ScienceQA`), con 274 pasos totales (119 en etapa 1, 155 en etapa 2) y una duración de 120,1 segundos en una única RTX 3090 de 24 GB, con un pico de VRAM de 16.827 MB. Solo se entrenaron las atenciones modificadas y los layernorms del decodificador. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de ScienceQA, ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text), orientada a respuesta a preguntas visuales de tipo STEM.
- Razonamiento visual básico sobre figuras y diagramas científicos, limitado por el tamaño del modelo y el entrenamiento específico en ScienceQA.
- Soporte de conversación multi-turno mediante plantilla de chat (`chat_template.json`).
- Procesamiento de imágenes a través del preprocesador SigLIP incluido en el repositorio.
- Respuestas de opción múltiple (formato típico de ScienceQA).
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras modalidades.
- Capacidad multilingüe: solo inglés declarado.

## Casos de uso

- Investigación sobre eficiencia de atención: sirve como punto de comparación controlado para medir la pérdida de precisión al sustituir atención cuadrática por RPC Attention en un VLM pequeño, usando el profesor como referencia (63,75 % frente a 30,00 %).
- Experimentos de destilación de conocimiento: el par profesor/alumno y las métricas publicadas permiten evaluar estrategias de KD en modelos multimodales de 0,5 B.
- Benchmarking de operadores lineales en la librería NeuralOps: el checkpoint es un artefacto reproducible para validar `RPCAttention` frente a otras alternativas del "Attention Surgery Zoo".
- Prototipado de pipelines VLM con requisitos de huella mínima: los 87,14 MB de pesos de atención permiten iterar rápido en entornos con poco almacenamiento, aunque requieren el modelo base para funcionar.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y compresión de artefactos en modelos visión-lenguaje.
- Evaluación de robustez en VQA científica: útil para estudiar qué tipos de preguntas STEM fallan al degradar la atención, comparando contra el profesor.
- No se recomienda para atención al cliente, generación de código en producción ni aplicaciones comerciales sensibles a la precisión, dado su rendimiento del 30 % en la tarea objetivo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imágenes, split de validación:

| Metrica | Profesor (base) | Zero-shot pre-KD | Final post-KD |
|---|---:|---:|---:|
| Accuracy (%) | 63,75 | 41,88 | 30,00 |
| Perplexity | 2,45 | 6,10 | 3,08 |

La destilación reduce la perplejidad de 6,10 a 3,08, pero la precisión cae de 41,88 % a 30,00 % respecto al estado pre-KD, y queda 33,75 puntos por debajo del profesor. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 16.827 MB de pico en una RTX 3090, lo que da una referencia del orden de magnitud para el modelo completo con el profesor cargado.
- GPU recomendadas: RTX 3090 (24 GB) es suficiente para el flujo de entrenamiento documentado; para inferencia, cualquier GPU con al menos 8-16 GB debería bastar dado el tamaño de 0,5 B, aunque no se especifica.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, aunque no hay cifras oficiales.
- Opciones de despliegue: la librería `neuralops` con `load_surgeried_model` es el método documentado; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato `attention_only_fp16` requiere el modelo base para reconstruir el checkpoint completo.
- Latencia y throughput: no disponibles. El tiempo de entrenamiento (120,1 s para 274 pasos) no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-rpc-attention-scienceqa` | 0,5 B | no disponible | 30,00 % acc / 3,08 PPL | MIT | Hugging Face (neuralops) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5 B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la informacion | Hugging Face |
| LLaVA-1.5-7B | 7 B | 4.096 tokens (referencia habitual) | no disponible | no disponible en la informacion | Hugging Face |
| Qwen2-VL-2B | 2 B | no disponible | no disponible | no disponible en la informacion | Hugging Face |

La comparativa con LLaVA-1.5-7B y Qwen2-VL-2B se incluye por categoría (VLM pequeños), pero no se dispone de sus resultados en el mismo subconjunto de ScienceQA en la información proporcionada, por lo que no es posible una comparación numérica directa.

## Limitaciones y advertencias

- Rendimiento muy inferior al profesor: 30,00 % de precisión frente a 63,75 %, con una caída adicional de 11,88 puntos respecto al estado pre-destilación. No es apto para uso donde la precisión importe.
- El artefacto publicado contiene solo los deltas de atención (87,14 MB); requiere cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` para funcionar, lo que condiciona el despliegue.
- Dependencia de la librería `neuralops`, poco extendida; no hay confirmación de compatibilidad con ecosistemas estándar (transformers, vLLM, llama.cpp).
- Idiomas: solo inglés declarado; no hay soporte multilingüe verificado.
- Sesgos: no documentados por el autor; al entrenarse sobre ScienceQA, puede heredar sesgos del dataset y del profesor.
- Riesgo de alucinación: elevado en preguntas fuera del dominio STEM o cuando la imagen no es informativa, dado el tamaño reducido y la compresión de atención.
- Licencia MIT declarada, lo que permite uso comercial del artefacto, pero conviene verificar la licencia del modelo base y del dataset ScienceQA antes de explotación comercial.
- Resultados de benchmarks no verificados (`verified: false` en el model-index); tratar las cifras como declaraciones del autor.
- Contexto máximo no especificado; no se debe asumir la ventana nativa de Qwen2 sin comprobación.
- Modelo experimental con 0 descargas y 0 likes en el momento de la ficha; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-rpc-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de RPC Attention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/rpc_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
