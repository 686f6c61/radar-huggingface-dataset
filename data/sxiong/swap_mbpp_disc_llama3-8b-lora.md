# sxiong/SWAP_MBPP_Disc_Llama3-8B-LoRA

## Resumen

El modelo `sxiong/SWAP_MBPP_Disc_Llama3-8B-LoRA` es un adaptador LoRA entrenado sobre el modelo base `meta-llama/Meta-Llama-3-8B-Instruct` para actuar como discriminador en el marco SWAP (Structure-Aware Planning). SWAP, descrito en el artículo de Xiong et al. (2025), propone un enfoque de razonamiento deliberado en modelos de lenguaje donde un generador produce soluciones y un discriminador evalúa su corrección. Este adaptador está especializado en el dataset MBPP (Mostly Basic Python Problems), un conjunto de problemas de programación en Python, y su función es clasificar o puntuar soluciones de código generadas por el modelo.

El adaptador es ligero (0.2 GB) y se distribuye bajo licencia MIT, lo que facilita su integración en pipelines de evaluación de código. Al estar basado en Llama-3-8B-Instruct, hereda la arquitectura transformer decoder-only de 8 mil millones de parámetros, aunque el adaptador LoRA solo modifica un subconjunto de capas. Su relevancia radica en proporcionar un componente de verificación automática para sistemas de generación de código, especialmente en entornos donde se requiere validar la corrección de soluciones de forma estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Llama-3-8B-Instruct (transformer decoder-only) |
| Parametros totales | 8B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (se recomienda bfloat16 para el modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (adaptador); el modelo base tiene su propia licencia (Llama 3 Community License) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con la tecnica LoRA (Low-Rank Adaptation) sobre el modelo base Llama-3-8B-Instruct. Los parametros LoRA son: rank `r=16`, alpha `alpha=32`, y se aplican a los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con bias desactivado. El entrenamiento se realiza sobre el dataset `sxiong/SWAP_disc`, que contiene ejemplos derivados de MBPP (arXiv:2108.07732). No se especifican detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO. El adaptador se integra mediante la libreria PEFT de Hugging Face, cargandose junto al modelo base con `PeftModel`.

## Capacidades

- Discriminacion de soluciones de codigo: el modelo evalua si una solucion de programacion es correcta o incorrecta en el contexto de problemas MBPP.
- Razonamiento estructurado: forma parte del marco SWAP, que combina generacion y verificacion para mejorar la fiabilidad de las respuestas.
- Integracion con pipelines de generacion de codigo: puede usarse como filtro o validador en sistemas que generan codigo automaticamente.
- Soporte de tool calling: no se menciona explicitamente, pero al estar basado en Llama-3-8B-Instruct, podria heredar capacidades de instruccion, aunque su rol principal es de discriminador.
- Multilingue: no, solo ingles.
- Capacidades especiales: no se reportan modos de thinking, vision o audio.

## Casos de uso

- Evaluacion automatica de soluciones de programacion en entornos educativos: el discriminador puede puntuar respuestas de estudiantes o de modelos en problemas tipo MBPP, proporcionando una nota de correccion sin intervencion humana.
- Filtrado de soluciones generadas por LLMs en sistemas de generacion de codigo: en un pipeline donde un modelo genera varias soluciones, el discriminador selecciona la mas probablemente correcta, mejorando la precision final.
- Verificacion de pasos intermedios en razonamiento multi-paso: dentro del marco SWAP, el discriminador valida cada paso de una cadena de razonamiento, reduciendo errores acumulados.
- Benchmarking de modelos de codigo: puede usarse como metrica automatica para comparar la calidad de diferentes modelos generadores en el dataset MBPP.
- Asistencia en entornos de desarrollo integrado (IDE): integrado como plugin, puede validar snippets de codigo en tiempo real, avisando de posibles errores logicos.
- Investigacion en razonamiento estructurado: sirve como componente de referencia para estudiar tecnicas de planificacion y verificacion en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K para este adaptador especifico.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.2 GB), pero requiere cargar el modelo base Llama-3-8B-Instruct, que en bfloat16 ocupa aproximadamente 16 GB de VRAM.
- Para inferencia en GPU, se recomienda al menos una GPU con 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) si se usa el modelo base sin cuantizacion.
- Con cuantizacion (por ejemplo, 4-bit), podria ejecutarse en GPUs con 8-12 GB de VRAM, aunque no se especifican configuraciones oficiales.
- Opciones de despliegue: el adaptador se usa con la libreria PEFT y transformers, por lo que puede integrarse en frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no se documenta soporte explicito.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

Existen otros adaptadores SWAP del mismo autor para diferentes datasets, como `sxiong/SWAP_MATH500_Disc_Llama3-8B-LoRA` (discriminador para MATH500) y `sxiong/SWAP_v2_MATH_Disc_Llama3-8B-LoRA` (version v2 para MATH). Todos comparten la misma base (Llama-3-8B-Instruct) y la misma tecnica LoRA, pero se especializan en distintos dominios. No se dispone de datos comparativos de rendimiento entre ellos. En cuanto a alternativas generales de discriminadores de codigo, no se han identificado modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un discriminador especifico para MBPP; su uso fuera de este dominio requeriria reentrenamiento o adaptacion.
- No se reportan sesgos especificos, pero al entrenarse sobre un dataset de problemas de programacion, podria tener limitaciones en otros tipos de codigo o lenguajes.
- Riesgo de alucinacion: como modelo basado en Llama, puede generar evaluaciones incorrectas si el problema no esta bien representado en el dataset.
- La licencia MIT del adaptador permite uso comercial, pero el modelo base Llama-3-8B-Instruct esta sujeto a la Llama 3 Community License, que impone restricciones (por ejemplo, para usuarios con mas de 700 millones de usuarios mensuales).
- No se proporcionan garantias de rendimiento en produccion; se recomienda validar en el caso de uso concreto.

## Enlaces

- Hugging Face: https://huggingface.co/sxiong/SWAP_MBPP_Disc_Llama3-8B-LoRA
- Repositorio GitHub de SWAP: https://github.com/xiongsiheng/SWAP
- Paper (arXiv): https://arxiv.org/abs/2108.07732 (dataset MBPP)
- Articulo principal de SWAP (ACL 2025): Xiong et al., "Deliberate reasoning in language models as structure-aware planning with an accurate world model" (referencia en la model card)
