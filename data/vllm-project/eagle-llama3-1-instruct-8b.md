# vllm-project/EAGLE-LLaMA3.1-Instruct-8B

## Resumen

EAGLE-LLaMA3.1-Instruct-8B es un cabezal de decodificación especulativa (draft head) para el modelo base Meta-Llama-3.1-8B-Instruct, desarrollado originalmente por Yuhui Li y colaboradores en el marco del proyecto EAGLE (Extrapolation Algorithm for Greater Language-model Efficiency). No es un modelo generativo autónomo: es un componente ligero que se acopla a Llama 3.1 8B Instruct para acelerar la inferencia mediante decodificación especulativa, manteniendo la distribución de salida del modelo original. La copia alojada en `vllm-project` es un espejo del checkpoint original creado para que el CI de vLLM lo utilice como referencia estable.

La relevancia de este artefacto radica en que EAGLE-3, la versión más reciente del método, reporta aceleraciones de hasta 5,6x frente a decodificación autorregresiva vanilla en modelos de 13B, y está integrado en frameworks de serving de primer nivel como vLLM, SGLang, TensorRT-LLM, NVIDIA NeMo, MLC-LLM y PaddleNLP. Para un equipo que ya sirve Llama 3.1 8B Instruct en producción, este draft head permite reducir la latencia por token sin cambiar el modelo base ni el contrato de salida.

El repositorio ocupa 1,6 GB y se distribuye bajo licencia Apache 2.0. La model card no detalla arquitectura interna, número de parámetros del draft head ni datos de entrenamiento específicos; la información disponible se limita a la descripción genérica del método EAGLE y a las referencias a los tres papers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabezal de decodificación especulativa EAGLE (basado en features del modelo base; detalles internos no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (tags: pytorch, llama); safetensors no confirmado |
| Modelo base | Meta-Llama-3.1-8B-Instruct |
| Versión del método | EAGLE-3 (v3.0.0 según badges de la model card) |
| Tamaño del repositorio | 1,6 GB |
| Framework de referencia | vLLM (checkpoint usado por su CI) |

## Arquitectura y entrenamiento

EAGLE es un método de decodificación especulativa que entrena un modelo borrador ligero para predecir varios tokens por paso, que luego son verificados en paralelo por el modelo base. La innovación clave de EAGLE-1 es que el draft head extrapola los vectores de features contextuales de la segunda capa superior del LLM, en lugar de operar directamente sobre tokens, lo que mejora la tasa de aceptación. EAGLE-2 introduce el uso de las puntuaciones de confianza del draft model para aproximar las tasas de aceptación y ajustar dinámicamente la estructura del árbol de borradores. EAGLE-3 elimina la restricción de predicción de features de las versiones anteriores y sustituye las features de la capa superior por una fusión de features semánticas de bajo, medio y alto nivel, simulando el proceso mediante "training-time testing".

Según la model card, el entrenamiento del draft head es asequible: entre 1 y 2 días en 8 GPUs RTX 3090. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO para este componente. El método garantiza consistencia demostrable con la distribución de textos generada por decodificación vanilla, es decir, no altera la salida del modelo base desde el punto de vista distribucional.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa sobre Llama 3.1 8B Instruct.
- Generación de borradores multi-token por paso con verificación paralela por el modelo base.
- Ajuste dinámico del árbol de borradores (EAGLE-2/EAGLE-3) según confianza del draft model.
- Mantenimiento de la distribución de salida del modelo base (lossless en términos distribucionales).
- Compatibilidad con técnicas de paralelización y optimización: vLLM, DeepSpeed, Mamba, FlashAttention, cuantización y optimizaciones de hardware.
- No es un modelo de chat autónomo: no soporta tool calling, agentes ni razonamiento multi-step por sí mismo; hereda las capacidades del modelo base al que se acopla.

## Casos de uso

- Serving de alta concurrencia con vLLM: desplegar Llama 3.1 8B Instruct con este draft head en vLLM para reducir la latencia por token en cargas interactivas, aprovechando que el propio CI de vLLM usa este checkpoint como referencia.
- Reducción de costes en APIs de generación de texto: al aumentar el throughput por GPU, se reduce el coste por millón de tokens en endpoints de chat o completado sobre Llama 3.1 8B.
- Asistentes conversacionales de baja latencia: la decodificación especulativa mejora el time-to-first-token percibido en streaming cuando el cuello de botella es la generación token a token.
- Generación de código en pipelines de CI/CD: Llama 3.1 8B Instruct se usa habitualmente para completado y revisión de código; el draft head acelera la generación en herramientas integradas en el IDE o en bots de revisión.
- Despliegue en hardware limitado: EAGLE permite que la inferencia en GPUs consumer (por ejemplo, RTX 3090/4090) se acerque al rendimiento de decodificación vanilla en GPUs de gama alta, según las afirmaciones de la model card.
- Investigación en decodificación especulativa: servir como checkpoint de referencia para reproducir resultados de EAGLE-1/2/3 y comparar tasas de aceptación con otros métodos (Medusa, Lookahead) en Llama 3.1 8B.
- Evaluación comparativa de frameworks: validar la implementación de decodificación especulativa en SGLang, TensorRT-LLM, MLC-LLM o NeMo usando un draft head oficial para Llama 3.1 8B.

## Benchmarks y rendimiento

La model card reporta cifras de speedup del método EAGLE sobre modelos de 13B (Vicuna 13B, fp16, 2x RTX 3090), no específicamente sobre Llama 3.1 8B Instruct:

| Método | Speedup vs. decodificación vanilla | Comparación interna |
|---|---|---|
| EAGLE-1 | 3x (13B) | 2x más rápido que Lookahead; 1,6x más rápido que Medusa |
| EAGLE-2 | 4x (13B) | 1,4x más rápido que EAGLE-1 |
| EAGLE-3 | 5,6x (13B) | 1,8x más rápido que EAGLE-1 |

Además, la model card indica 2x de speedup sobre gpt-fast con EAGLE-1. No se han publicado en la información disponible resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) para este draft head concreto, ni cifras de speedup específicas para Llama 3.1 8B Instruct.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,6 GB; el draft head debe cargarse junto al modelo base Llama 3.1 8B Instruct, que en fp16 requiere aproximadamente 16 GB de VRAM, más el overhead del draft head y del árbol especulativo.
- GPU recomendadas: A100, H100 o L40S para serving de producción con vLLM; el método se entrenó y evaluó en 8x RTX 3090.
- GPU consumer: cabe en RTX 3090 (24 GB) y RTX 4090 (24 GB) junto al modelo base en fp16; en GPUs de 16 GB requeriría cuantización del modelo base.
- Opciones de despliegue: vLLM (soporte nativo, PR #16937), SGLang, TensorRT-LLM, NVIDIA NeMo, MLC-LLM, PaddleNLP, Intel Extension for Transformers, IPEX-LLM, AMD ROCm, AWS NeuronX, CPM.cu, AngelSlim y SpecForge.
- Latencia y throughput: la model card reporta hasta 5,6x de speedup con EAGLE-3 en 13B; no se proporcionan cifras de latencia absoluta ni throughput (tokens/s) para Llama 3.1 8B Instruct.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Speedup reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EAGLE-LLaMA3.1-Instruct-8B (este) | Draft head EAGLE-3 | Llama 3.1 8B Instruct | no disponible para 8B; 5,6x en 13B (EAGLE-3) | Apache 2.0 | Hugging Face (vllm-project y yuhuili) |
| Medusa | Draft heads múltiples | Llama 3.1 8B Instruct (variantes) | 1,6x menor que EAGLE-1 en 13B según model card | Apache 2.0 (típicamente) | Hugging Face |
| Lookahead decoding | Decodificación paralela sin draft model | Cualquiera | 2x menor que EAGLE-1 en 13B según model card | Apache 2.0 (implementación) | Frameworks de serving |
| Draft heads nativos de vLLM/SGLang | Decodificación especulativa genérica | Variable | no disponible | Variable | Frameworks |

No se dispone en la información proporcionada de comparativas de calidad ni de speedup medidas específicamente sobre Llama 3.1 8B Instruct frente a estas alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Meta-Llama-3.1-8B-Instruct para funcionar; no puede usarse para generación directa.
- La model card no documenta sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas de este draft head; estos dependen del modelo base.
- Las cifras de speedup publicadas corresponden a modelos de 13B (Vicuna 13B) y no necesariamente se trasladan a Llama 3.1 8B Instruct.
- El checkpoint es una copia de conveniencia para el CI de vLLM; el original está en la cuenta personal `yuhuili`, lo que introduce un riesgo de cadena de suministro que el espejo mitiga parcialmente.
- No se especifican tipos de cuantización soportados ni formato de pesos confirmado (solo tag `pytorch`); verificar antes de desplegar en pipelines con requisitos de safetensors.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Llama 3.1 tiene su propia licencia comunitaria de Meta que debe respetarse por separado.
- La fecha de creación del repositorio (2026-10-30) y la versión EAGLE-3 (v3.0.0) indican que el artefacto puede evolucionar; fijar el commit `d0e4a20` para reproducibilidad.

## Enlaces

- Hugging Face (espejo vLLM): https://huggingface.co/vllm-project/EAGLE-LLaMA3.1-Instruct-8B
- Hugging Face (original): https://huggingface.co/yuhuili/EAGLE-LLaMA3.1-Instruct-8B
- Paper EAGLE: https://arxiv.org/pdf/2401.15077.pdf
- Paper EAGLE-2: https://arxiv.org/pdf/2406.16858
- Paper EAGLE-3: https://arxiv.org/pdf/2503.01840
- Blog del proyecto: https://sites.google.com/view/eagle-llm
- Repositorio GitHub: https://github.com/SafeAILab/EAGLE
- PR de integración en vLLM: https://github.com/vllm-project/vllm/pull/16937
- SpecForge: https://github.com/sgl-project/SpecForge
- Leaderboard Spec-Bench: https://github.com/hemingkx/Spec-Bench/blob/main/Leaderboard.md
- Documentación SGLang (speculative decoding): https://docs.sglang.ai/advanced_features/speculative_decoding.html
- Ejemplos TensorRT-LLM EAGLE: https://github.com/NVIDIA/TensorRT-LLM/tree/main/examples/eagle
