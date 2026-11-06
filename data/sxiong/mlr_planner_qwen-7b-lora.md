# sxiong/MLR_planner_Qwen-7B-LoRA

## Resumen

MLR_planner_Qwen-7B-LoRA es un adaptador LoRA de tipo planner (planificador) desarrollado por Siheng Xiong (junto con Ali Payani y Faramarz Fekri) para el marco de trabajo Multi-Level Reasoning (MLR), presentado en el paper *Enhancing Language Model Reasoning with Structured Multi-Level Modeling* en ICLR 2026. El modelo no es un LLM autónomo: es la mitad "planificadora" de un sistema de razonamiento que alterna un bucle plan--execute, donde el planner propone subobjetivos abstractos y estructurados y el executor genera el razonamiento detallado condicionado a ellos.

El adaptador se monta sobre el checkpoint `sxiong/MLR_executor_Qwen-7B`, que a su vez se basa en la arquitectura Qwen2.5-Math-7B. Esto significa que hereda las capacidades matemáticas y de razonamiento del modelo base Qwen2.5-Math-7B, pero su función específica es la descomposición de problemas de razonamiento de horizonte largo en pasos manejables. Es relevante ahora porque propone una alternativa estructurada al razonamiento de cadena de pensamiento lineal, con control explícito del flujo plan--execute.

El repositorio tiene un tamaño de 0,3 GB (solo los pesos LoRA, no el modelo base completo), 0 descargas y 0 likes en el momento de la consulta, y fue creado el 1 de noviembre de 2026. Está pensado para usarse exclusivamente a través del código de inferencia MLR del autor, no para generación libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math-7B) con adaptador LoRA |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen2.5-Math-7B tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen2.5-Math-7B) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors, probablemente bf16/fp16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 32 |
| Alpha LoRA | 64 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Modelo base requerido | sxiong/MLR_executor_Qwen-7B |
| Tamano del repo | 0,3 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Math-7B, un transformer decoder-only de 7.000 millones de parametros especializado en matematicas y razonamiento. La innovacion del sistema MLR no reside en la arquitectura del transformer, sino en el protocolo de inferencia: se descompone el razonamiento de horizonte largo en un bucle alterno plan--execute, donde el planner (este adaptador) genera un subobjetivo abstracto y estructurado, y el executor (el checkpoint base `sxiong/MLR_executor_Qwen-7B`) produce el razonamiento detallado condicionado a ese subobjetivo. El proceso se repite hasta alcanzar la solucion.

El adaptador LoRA tiene rango 32 y alpha 64, y se aplica a los siete modulos lineales habituales (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El entrenamiento se realizó sobre el dataset `sxiong/MLR_sft_data` mediante supervisión fina (SFT). No se especifican en la informacion proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o attention linear.

## Capacidades

- Planificación estructurada de subobjetivos abstractos dentro del bucle MLR plan--execute.
- Razonamiento matemático y de horizonte largo, heredado del modelo base Qwen2.5-Math-7B.
- Descomposición de problemas complejos en pasos intermedios manejables.
- Generación de texto conversacional (pipeline `text-generation`).
- Integración con el executor MLR para razonamiento multi-paso.
- No está diseñado para generación libre: requiere el código de inferencia MLR con sus prompts, parser, regla de parada y flujo de control específicos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponibles en la informacion proporcionada.
- Capacidades de visión o audio: no disponibles (el base es solo texto).

## Casos de uso

- Razonamiento matemático de competición: el planner descompone un problema de varias etapas en subobjetivos abstractos que el executor resuelve secuencialmente, lo que facilita el seguimiento y la verificabilidad del razonamiento.
- Investigación en razonamiento estructurado: sirve como implementación de referencia del marco MLR para experimentar con descomposición plan--execute frente a cadenas de pensamiento lineales.
- Reproducción de resultados del paper ICLR 2026: permite replicar los experimentos de razonamiento multi-nivel usando los checkpoints del autor y su código de inferencia.
- Generación de trazas de razonamiento auditables: al separar planificación y ejecución, se obtienen trazas intermedias inspeccionables, útiles en entornos educativos o de depuración de modelos.
- Sistemas de tutoría matemática paso a paso: el planner puede estructurar la resolución en fases que un tutor automático presente al estudiante.
- Base para fine-tuning adicional: al ser un adaptador LoRA ligero (0,3 GB), se puede montar sobre el executor y ajustar para dominios específicos de razonamiento sin reentrenar el modelo completo.
- Evaluación comparativa de estrategias de razonamiento: permite contrastar el enfoque plan--execute con CoT estándar sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al montarse sobre Qwen2.5-Math-7B, requiere la VRAM del modelo base de 7B más el adaptador LoRA (0,3 GB). En bf16, el base de 7B ocupa aproximadamente 14-15 GB.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamaño del base (7B), cabría en GPUs con 16-24 GB de VRAM (RTX 4090, A10, L4) en bf16, y en GPUs de 80 GB (A100, H100) con margen amplio.
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) en bf16, aunque no está confirmado en la informacion disponible.
- Opciones de despliegue: el autor indica explícitamente PyTorch + Transformers + PEFT y su código de inferencia MLR (https://github.com/xiongsiheng/MLR). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el flujo plan--execute con parser y reglas de parada específicas probablemente no sea compatible directamente con esos motores sin adaptación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MLR_planner_Qwen-7B-LoRA | LoRA sobre 7B | No disponible | Plan--execute (MLR) | No disponible | Hugging Face (0 descargas) |
| Qwen2.5-Math-7B | 7B | No disponible | CoT estándar | No disponible en esta ficha | Ampliamente disponible |
| Adaptadores LoRA de razonamiento sobre Qwen | Variable | Variable | CoT / SFT | Variable | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación se limita a características estructurales.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere obligatoriamente el checkpoint base `sxiong/MLR_executor_Qwen-7B` y el código de inferencia MLR. La generación libre directa no es la interfaz prevista y producirá resultados no válidos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base Qwen2.5-Math-7B y del checkpoint executor antes de cualquier uso en producción.
- Idiomas soportados no especificados: se desconoce el alcance multilingüe real.
- Riesgo de alucinación: no evaluado en la informacion proporcionada; como todo modelo de razonamiento, puede generar pasos plausibles pero incorrectos.
- Sesgos conocidos: no documentados en la informacion disponible.
- Longitud de contexto: no especificada; depende del modelo base y de la configuración del código de inferencia.
- Madurez: repositorio con 0 descargas y 0 likes, creado recientemente; sin validación comunitaria ni resultados de benchmarks publicados en la ficha.
- Dependencia de versiones: el autor advierte de la necesidad de versiones compatibles de PyTorch, Transformers y PEFT.

## Enlaces

- Hugging Face: https://huggingface.co/sxiong/MLR_planner_Qwen-7B-LoRA
- Modelo base (executor): https://huggingface.co/sxiong/MLR_executor_Qwen-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/sxiong/MLR_sft_data
- Código de inferencia MLR: https://github.com/xiongsiheng/MLR
- Paper (ICLR 2026): https://proceedings.iclr.cc/paper_files/paper/2026/file/3db7d123a316fc690f02818b21967af4-Paper-Conference.pdf
