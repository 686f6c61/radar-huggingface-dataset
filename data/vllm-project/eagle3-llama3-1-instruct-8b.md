# vllm-project/EAGLE3-LLaMA3.1-Instruct-8B

## Resumen

EAGLE3-LLaMA3.1-Instruct-8B es un modelo borrador (draft model) para decodificacion especulativa basado en la tecnica EAGLE-3, disenado para acelerar la inferencia de LLaMA 3.1 Instruct de 8B parametros. No es un modelo de lenguaje generalista: es un componente auxiliar que predice multiples tokens futuros para que el modelo objetivo los verifique en paralelo, reduciendo el numero de pasos de decodificacion autorregresiva sin alterar la distribucion de salida. Lo desarrolla el grupo de investigacion de Yuhui Li (SafeAILab) y esta copia la mantiene el proyecto vLLM para sus pruebas de integracion continua, reduciendo el riesgo de dependencia de una cuenta personal.

La relevancia de esta ficha es practica: EAGLE-3 elimina la restriccion de prediccion de caracteristicas de EAGLE-1 y EAGLE-2, sustituyendo las caracteristicas de la capa superior por una fusion de caracteristicas semanticas de bajo, medio y alto nivel, con simulacion del proceso de test durante el entrenamiento. Segun los autores, esto permite aceleraciones de hasta 5,6x frente a decodificacion vanilla en modelos de 13B, manteniendo consistencia con la salida original.

El repositorio ocupa 0,9 GB, lo que corresponde a los pesos del cabezal borrador y no al modelo base de 8B. Se distribuye bajo licencia Apache 2.0 y esta integrado en marcos de servicio como vLLM, SGLang, TensorRT-LLM, MLC-LLM y NeMo, entre otros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 (modelo borrador para decodificacion especulativa sobre LLaMA 3.1 Instruct 8B) |
| Parametros totales | no disponible (el repo de 0,9 GB contiene el cabezal borrador, no el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (pytorch); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

EAGLE-3 es un esquema de decodificacion especulativa que entrena un modelo borrador ligero para predecir varios tokens futuros a partir de las caracteristicas internas del modelo objetivo. A diferencia de EAGLE-1 y EAGLE-2, que extrapolaban las caracteristicas de la segunda capa superior y estaban limitados por la prediccion del siguiente token, EAGLE-3 fusiona caracteristicas de bajo, medio y alto nivel semantico y simula el proceso de test durante el entrenamiento (training-time testing). EAGLE-2, por su parte, introduce el uso de las puntuaciones de confianza del borrador para aproximar las tasas de aceptacion y ajustar dinamicamente la estructura del arbol de borradores.

El modelo esta entrenado especificamente para LLaMA 3.1 Instruct 8B, por lo que su uso esta acoplado a ese checkpoint objetivo. Los autores indican que el entrenamiento es asequible: entre 1 y 2 dias en 8 GPU RTX 3090. La tecnica es compatible con otras optimizaciones como vLLM, DeepSpeed, Mamba, FlashAttention, cuantizacion y aceleracion por hardware. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO para el borrador.

## Capacidades

- Decodificacion especulativa: genera propuestas de multiples tokens que el modelo objetivo LLaMA 3.1 Instruct 8B verifica en paralelo, manteniendo la consistencia distribucional con la decodificacion vanilla.
- Aceleracion de inferencia: los autores reportan hasta 5,6x de velocidad frente a decodificacion vanilla en modelos de 13B, y 1,8x frente a EAGLE-1.
- Arbol de borradores dinamico: hereda de EAGLE-2 el ajuste de la estructura del arbol segun las puntuaciones de confianza del borrador.
- Integracion con frameworks de servicio: soportado en vLLM, SGLang, TensorRT-LLM, MLC-LLM, NeMo, PaddleNLP, AMD ROCm, AWS NeuronX, AngelSlim, CPM.cu, Intel Extension for Transformers, IPEX-LLM y SpecForge.
- No es un modelo de proposito general: no genera texto de forma autonoma ni ofrece tool calling, agentes o capacidades multilingues propias; su funcion es exclusivamente acelerar al modelo objetivo.

## Casos de uso

- Servicio de chat de baja latencia: desplegar LLaMA 3.1 Instruct 8B en vLLM con este borrador EAGLE-3 para reducir el tiempo por token en conversaciones multi-turno, donde la latencia percibida es critica.
- Generacion de codigo en produccion: acelerar asistentes de autocompletado y generacion de codigo basados en LLaMA 3.1 8B, donde las secuencias suelen ser largas y el throughput importa en pipelines de CI/CD.
- Reduccion de coste en GPU: al disminuir el numero de pasos de decodificacion, se puede atender mas carga por GPU o usar hardware de gama inferior manteniendo los objetivos de latencia.
- RAG y resumen de documentos: acelerar la generacion de respuestas en sistemas de recuperacion aumentada con contexto largo, donde el modelo objetivo procesa prompts extensos y la fase de decodificacion domina el tiempo total.
- Despliegue en entornos con GPU de consumo: combinado con cuantizacion del modelo base, permite servir LLaMA 3.1 8B en GPUs como RTX 3090 o RTX 4090 con latencias mas competitivas.
- Evaluacion y benchmarking de infraestructura: usar el checkpoint como referencia en pruebas de integracion continua de frameworks de inferencia, tal como hace el propio proyecto vLLM con esta copia.
- Investigacion en decodificacion especulativa: servir de base para experimentos con arboles de borradores dinamicos y comparativas entre EAGLE-1, EAGLE-2 y EAGLE-3.

## Benchmarks y rendimiento

Los datos publicados por los autores en la model card se refieren a la tecnica EAGLE en modelos de 13B (Vicuna 13B, fp16, 2x RTX 3090), no a este checkpoint concreto sobre LLaMA 3.1 8B:

| Metodo | Aceleracion frente a decodificacion vanilla (13B) |
|---|---|
| EAGLE-1 | 3x |
| EAGLE-2 | 4x |
| EAGLE-3 | 5,6x |

Comparativas adicionales reportadas: EAGLE-1 es 2x mas rapido que Lookahead y 1,6x mas rapido que Medusa (13B); EAGLE-2 es 1,4x mas rapido que EAGLE-1; EAGLE-3 es 1,8x mas rapido que EAGLE-1. No se han publicado resultados de benchmarks especificos para EAGLE3-LLaMA3.1-Instruct-8B en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el borrador de forma aislada; el repo ocupa 0,9 GB. La VRAM total depende del modelo objetivo LLaMA 3.1 Instruct 8B (aproximadamente 16 GB en fp16, menos con cuantizacion).
- GPU recomendadas: los autores validan el entrenamiento en 8x RTX 3090; la inferencia se ha demostrado en 2x RTX 3090 a fp16 para modelos de 13B.
- GPU de consumo: si, el esquema esta pensado para ser asequible ("even the GPU poor can afford it"); cabe en RTX 3090, RTX 4090 y similares, junto con el modelo base.
- Opciones de despliegue: vLLM, SGLang, TensorRT-LLM, MLC-LLM, NVIDIA NeMo, PaddleNLP, AMD ROCm, AWS NeuronX, AngelSlim, CPM.cu, Intel Extension for Transformers, IPEX-LLM y SpecForge.
- Latencia y throughput: no se proporcionan cifras concretas para este checkpoint; las aceleraciones reportadas son relativas a decodificacion vanilla en modelos de 13B.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo objetivo | Aceleracion reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EAGLE3-LLaMA3.1-Instruct-8B | Borrador EAGLE-3 | LLaMA 3.1 Instruct 8B | no disponible para este checkpoint | Apache 2.0 | HuggingFace (vLLM y yuhuili) |
| EAGLE-1 | Borrador EAGLE | Generico (Vicuna 13B en pruebas) | 3x (13B) | Apache 2.0 | GitHub SafeAILab/EAGLE |
| EAGLE-2 | Borrador EAGLE-2 | Generico (Vicuna 13B en pruebas) | 4x (13B) | Apache 2.0 | GitHub SafeAILab/EAGLE |
| Medusa | Cabezales de decodificacion especulativa | Generico | 1,6x menos que EAGLE-1 (13B) | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo LLaMA 3.1 Instruct 8B y un framework que soporte decodificacion especulativa EAGLE-3; no puede usarse para generar texto por si solo.
- Acoplamiento al checkpoint: el borrador esta entrenado para una version concreta de LLaMA 3.1 Instruct 8B; cambios en el modelo objetivo pueden degradar la tasa de aceptacion.
- Datos incompletos: no se especifican contexto, cuantizaciones soportadas, idiomas ni tamanos de entrenamiento en la informacion disponible.
- Rendimiento no verificado en este checkpoint: las aceleraciones publicadas corresponden a modelos de 13B en las pruebas de los autores, no a este borrador de 8B.
- Riesgo de alucinacion: la decodificacion especulativa mantiene la distribucion del modelo objetivo, pero cualquier deriva en la verificacion o en la implementacion del framework puede introducir discrepancias.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base LLaMA 3.1, que es independiente y puede imponer condiciones adicionales.
- Copia de terceros: esta version es una copia de mantenimiento de vLLM; para trazabilidad conviene contrastar con el repositorio original de yuhuili.

## Enlaces

- HuggingFace (copia vLLM): https://huggingface.co/vllm-project/EAGLE3-LLaMA3.1-Instruct-8B
- HuggingFace (original): https://huggingface.co/yuhuili/EAGLE3-LLaMA3.1-Instruct-8B
- Paper EAGLE: https://arxiv.org/pdf/2401.15077.pdf
- Paper EAGLE-2: https://arxiv.org/pdf/2406.16858
- Paper EAGLE-3: https://arxiv.org/pdf/2503.01840
- Blog del proyecto: https://sites.google.com/view/eagle-llm
- Repositorio GitHub: https://github.com/SafeAILab/EAGLE
- Leaderboard Spec-Bench: https://github.com/hemingkx/Spec-Bench/blob/main/Leaderboard.md
- Integracion en vLLM: https://github.com/vllm-project/vllm/pull/16937
- Documentacion SGLang: https://docs.sglang.ai/advanced_features/speculative_decoding.html
- Ejemplos TensorRT-LLM: https://github.com/NVIDIA/TensorRT-LLM/tree/main/examples/eagle
