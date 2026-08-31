# sxiong/SWAP_MBPP_Gen_Llama3-8B-LoRA

## Resumen

El modelo `sxiong/SWAP_MBPP_Gen_Llama3-8B-LoRA` es un adaptador LoRA entrenado sobre el modelo base `meta-llama/Meta-Llama-3-8B-Instruct` mediante el método SWAP (Structure-Aware Planning). Su función específica es actuar como generador de problemas de programación dentro del pipeline SWAP, utilizando el conjunto de datos MBPP (Mostly Basic Python Problems). El adaptador está diseñado para producir enunciados de problemas de código con un razonamiento estructurado, mejorando la calidad y diversidad de los ejemplos generados.

Este modelo es relevante porque aborda la generación de datos sintéticos para entrenamiento y evaluación de modelos de código, un área crítica cuando los conjuntos de datos disponibles son limitados o están desactualizados. Al estar basado en Llama-3-8B-Instruct, hereda las capacidades conversacionales y de generación de texto del modelo base, pero el adaptador LoRA lo especializa en la tarea de generación de problemas MBPP. El adaptador tiene un tamaño reducido (0.2 GB), lo que facilita su integración en flujos de trabajo existentes sin necesidad de reentrenar el modelo completo.

La publicación asociada (Xiong et al., 2025) presenta SWAP como un marco de razonamiento deliberado que trata la generación de lenguaje como una planificación estructurada con un modelo del mundo preciso. Este adaptador concreto es uno de los componentes del sistema SWAP, junto con otros adaptadores para GSM8K y MATH, lo que indica que forma parte de una familia de modelos especializados en razonamiento matemático y de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3-8B-Instruct) con adaptador LoRA |
| Parametros totales | Adaptador LoRA: ~0.2 GB (parametros entrenables no especificados); modelo base: 8B (no entrenable) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se aplica sobre el modelo base, que puede cuantizarse) |
| Idiomas soportados | Ingles |
| Licencia | MIT (adaptador); el modelo base tiene su propia licencia (Llama 3 Community License) |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el modelo base Llama-3-8B-Instruct, un transformer decoder autoregresivo. La configuracion LoRA utiliza un rango (`r`) de 16 y un alpha de 16, con los módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, y bias desactivado. Esto significa que solo se actualizan las matrices de baja dimensión durante el entrenamiento, dejando los pesos del modelo base congelados.

El entrenamiento se realizó con el dataset `sxiong/SWAP`, que contiene ejemplos derivados de MBPP. El método SWAP introduce un enfoque de razonamiento deliberado: el modelo aprende a planificar la estructura del problema antes de generar el enunciado final, utilizando un modelo del mundo interno para validar la coherencia. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset, pero el adaptador está diseñado para la tarea de generación de problemas, no para la resolución de los mismos.

## Capacidades

- Generación de problemas de programación en Python (estilo MBPP): produce enunciados con descripción, función de ejemplo y casos de prueba.
- Razonamiento estructurado: gracias al entrenamiento con SWAP, el modelo planifica la estructura del problema antes de generarlo, lo que mejora la coherencia interna.
- Generación de texto conversacional: al estar basado en Llama-3-8B-Instruct, conserva la capacidad de mantener diálogos y seguir instrucciones.
- Generación de código: puede producir fragmentos de código Python, aunque su especialidad es la generación de enunciados, no la resolución.
- Multilingüe limitado: solo se declara soporte para inglés, aunque el modelo base podría manejar otros idiomas con menor calidad.

## Casos de uso

- Aumento de datos para entrenamiento de modelos de código: el generador puede crear nuevos problemas MBPP a partir de un conjunto semilla, ampliando la diversidad de ejemplos para fine-tuning de modelos de generación de código.
- Evaluación de modelos de programación: se pueden generar problemas sintéticos para probar la capacidad de razonamiento y generación de código de otros modelos, evitando la contaminación con datasets públicos.
- Generación de ejercicios educativos: en plataformas de aprendizaje de programación, el modelo puede producir ejercicios personalizados con distintos niveles de dificultad, adaptados a las necesidades del estudiante.
- Creación de benchmarks personalizados: investigadores pueden generar conjuntos de problemas específicos para medir habilidades concretas (por ejemplo, uso de bucles, manejo de excepciones) sin depender de datasets existentes.
- Pruebas de robustez en pipelines de generación de código: al integrar el generador en un sistema de aumento de datos, se pueden crear variaciones de problemas para evaluar la robustez de los modelos ante reformulaciones.
- Generación de documentación y ejemplos de API: aunque no es su función principal, el modelo puede producir ejemplos de uso de funciones Python, útiles para documentación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador está diseñado para una tarea específica (generación de problemas MBPP) y no se proporcionan métricas como MMLU, HumanEval o GSM8K. Se recomienda consultar el repositorio de GitHub de SWAP para posibles evaluaciones adicionales.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.2 GB), pero el modelo base Llama-3-8B-Instruct requiere recursos significativos.
- VRAM estimada para inferencia: el modelo base en fp16 necesita aproximadamente 16 GB de VRAM; con cuantización int8 baja a ~8 GB, y con int4 a ~4 GB. El adaptador añade un overhead mínimo.
- GPU recomendadas: para fp16, una NVIDIA A100 (40 GB) o RTX 4090 (24 GB) son suficientes; para int8/int4, una RTX 3080 (10 GB) o RTX 3090 (24 GB) pueden funcionar.
- En consumer GPU: sí, con cuantización (por ejemplo, RTX 3090 con int8 o int4).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con Transformers + PEFT.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Tamaño adaptador | Licencia |
|---|---|---|---|---|
| `sxiong/SWAP_MBPP_Gen_Llama3-8B-LoRA` | Llama-3-8B-Instruct | Generación de problemas MBPP | 0.2 GB | MIT (adaptador) |
| `sxiong/SWAP_GSM8K_Gen_Llama3-8B-LoRA` | Llama-3-8B-Instruct | Generación de problemas GSM8K | 0.2 GB (estimado) | MIT (adaptador) |
| `sxiong/SWAP_v2_MATH_Gen_Llama3-8B-LoRA` | Llama-3-8B-Instruct | Generación de problemas MATH | 0.2 GB (estimado) | MIT (adaptador) |

Estos tres adaptadores comparten la misma arquitectura y método de entrenamiento, diferenciándose solo en el dataset de especialización. No se dispone de comparativas con otros generadores de problemas de código (por ejemplo, CodeLlama o GPT-4) en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para la generación de problemas MBPP; su uso fuera de esta tarea puede producir resultados incoherentes.
- La licencia MIT del adaptador no exime de cumplir con la licencia del modelo base (Llama 3 Community License), que impone restricciones de uso comercial y requiere atribución.
- El modelo base puede presentar sesgos y alucinaciones heredados; el adaptador no corrige estos problemas.
- La longitud de contexto no está especificada en la ficha; se asume la del modelo base (típicamente 8k tokens), pero no se garantiza.
- No se han publicado evaluaciones de robustez ni de seguridad específicas para este adaptador.
- El dataset SWAP puede contener ejemplos con errores o ambigüedades; los problemas generados deben ser validados antes de usarse en entornos de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sxiong/SWAP_MBPP_Gen_Llama3-8B-LoRA
- Dataset SWAP: https://huggingface.co/datasets/sxiong/SWAP
- Repositorio GitHub de SWAP: https://github.com/xiongsiheng/SWAP
- Paper (ACL 2025): https://arxiv.org/abs/2108.07732 (referencia al dataset MBPP, no al paper de SWAP; el paper de SWAP se cita en la model card)
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
