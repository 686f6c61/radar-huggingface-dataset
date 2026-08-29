# SZLHOLDINGS/szl-training-scripts

## Resumen

El repositorio `SZLHOLDINGS/szl-training-scripts` no es un modelo de inteligencia artificial, sino un conjunto de scripts de entrenamiento publicados en Hugging Face Hub por SZL Holdings. Según su model card, se trata de una copia de los scripts de entrenamiento basados en Unsloth, con el propósito de servir como "recibo" o referencia reproducible para el entrenamiento de modelos propios. El autor lo describe como "The forge" y lo enmarca dentro de su proyecto de "governed-AI", donde cada artefacto (datos, código, pesos) se registra con metadatos de trazabilidad.

Este repositorio no contiene pesos de modelo, sino código Python que utiliza la librería Unsloth para realizar fine-tuning con QLoRA sobre un modelo base (por defecto, `Qwen/Qwen2.5-1.5B-Instruct`). Su relevancia radica en que permite reproducir un pipeline de entrenamiento con un recibo criptográfico (SHA-256 del dataset, configuración de LoRA, semilla y pérdida final) antes de la fusión de adaptadores. Es una pieza de infraestructura para equipos que necesitan auditar y certificar sus procesos de entrenamiento, más que un modelo desplegable.

La licencia es Apache-2.0 y el repositorio fue creado el 29 de agosto de 2026, aunque no se indica ninguna descarga ni uso público hasta la fecha de consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de scripts, no modelo) |
| Parametros totales | No disponible (sin pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo base usado) |
| Tipos de cuantizacion | No disponible (el script usa carga en 4-bit con QLoRA) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (solo código fuente Python) |

## Arquitectura y entrenamiento

El repositorio contiene un script Python (`receipted_unsloth.py`) que implementa un flujo de fine-tuning con QLoRA usando la librería Unsloth. El script acepta argumentos como el modelo base (por defecto `Qwen/Qwen2.5-1.5B-Instruct`), el archivo de datos en formato JSONL, el rango de LoRA (`r`), la semilla aleatoria y la longitud máxima de secuencia. Utiliza `FastLanguageModel` de Unsloth para cargar el modelo en 4-bit, aplica PEFT con módulos objetivo (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) y entrena con `SFTTrainer` de TRL. Antes del entrenamiento, calcula el SHA-256 del dataset y lo incluye en un "recibo" junto con la configuración y la pérdida final, para garantizar la reproducibilidad.

No se especifican datos de entrenamiento propios, ya que el script está diseñado para usarse con un dataset externo (`doctrine.jsonl` en el ejemplo). Tampoco se menciona el uso de RLHF, DPO u otras técnicas más allá del fine-tuning supervisado (SFT).

## Capacidades

- No es un modelo de IA, por lo que no tiene capacidades de generación, razonamiento, código, visión ni audio.
- Proporciona un pipeline reproducible para fine-tuning con QLoRA sobre modelos base de la familia Qwen (u otros compatibles con Unsloth).
- Incluye generación de un recibo de entrenamiento con hash SHA-256 del dataset, configuración de LoRA, semilla y pérdida final.
- Permite guardar el adaptador entrenado en formato PEFT (sin fusionar) para su posterior uso o conversión a GGUF.
- Está diseñado para integrarse en flujos de "governed-AI" donde se requiere trazabilidad y auditoría de los artefactos de entrenamiento.

## Casos de uso

- Reproducción auditada de fine-tuning: equipos que necesitan certificar que un modelo fue entrenado con un dataset concreto y una configuración específica pueden usar este script para generar un recibo verificable.
- Integración en pipelines de MLOps: el script puede incorporarse en flujos de CI/CD para entrenar adaptadores LoRA de forma reproducible, con control de versiones del dataset y de la configuración.
- Formación de modelos propietarios sobre hardware propio: SZL Holdings lo usa para entrenar su modelo soberano SZL-1, pero cualquier organización puede adaptarlo a sus necesidades.
- Investigación en eficiencia de entrenamiento: al usar QLoRA y Unsloth, permite experimentar con fine-tuning de bajo recurso en GPUs de consumo.
- Documentación de procesos de IA gobernada: sirve como referencia para cumplir requisitos de transparencia y auditoría en entornos regulados.
- Base para desarrollo de herramientas de trazabilidad: el concepto de "recibo" puede extenderse a otros artefactos del ciclo de vida del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un repositorio de scripts, no hay métricas de rendimiento de modelo (MMLU, HumanEval, etc.) que reportar.

## Requisitos de hardware

- El script está diseñado para ejecutarse en GPUs con soporte CUDA y suficiente VRAM para QLoRA en 4-bit. Para un modelo base de 1.5B parámetros, se recomienda al menos 8 GB de VRAM (por ejemplo, una RTX 3060 o superior).
- Para modelos base más grandes (7B o 13B), se necesitarían GPUs con 16-24 GB de VRAM, como RTX 4090, A100 o H100.
- El script utiliza `use_gradient_checkpointing="unsloth"`, lo que reduce el consumo de memoria durante el entrenamiento.
- No se especifican requisitos de CPU, RAM o almacenamiento adicionales, pero se asume un entorno Linux con Python 3.10+ y las dependencias de Unsloth, TRL y datasets.
- Para inferencia posterior, el adaptador guardado puede convertirse a GGUF y ejecutarse con llama.cpp u Ollama, pero eso queda fuera del alcance de este repositorio.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo comparable con otros LLMs. En el ámbito de scripts de entrenamiento, existen alternativas como los ejemplos oficiales de Hugging Face (transformers), los recipes de NVIDIA NeMo o los scripts de Unsloth, pero no hay una comparativa estándar de rendimiento. La propuesta de SZL Holdings se distingue por su énfasis en la trazabilidad mediante "recibos" criptográficos, algo poco común en repositorios de entrenamiento.

## Limitaciones y advertencias

- No es un modelo: no se puede desplegar para inferencia ni usar como API. Es solo código fuente.
- No incluye pesos ni adaptadores preentrenados; el usuario debe proporcionar su propio dataset y ejecutar el entrenamiento.
- La fecha de creación (2026) y la ausencia de descargas o likes sugieren que es un proyecto muy reciente o de uso interno, con poca validación comunitaria.
- El script está parcialmente truncado en la model card (el código termina en `if trainer.state.log_hi`), por lo que puede no estar completo o funcional sin modificaciones.
- La licencia Apache-2.0 permite uso comercial, pero el autor (SZL Holdings) declara que el contenido está sujeto a su "doctrine v11" y a declaraciones de "governed-AI", lo que podría implicar restricciones adicionales no especificadas en la licencia.
- No se garantiza la compatibilidad con todas las versiones de Unsloth, TRL o transformers; es necesario verificar las dependencias.
- El concepto de "recibo" (hash del dataset) no garantiza la calidad del modelo final, solo la reproducibilidad del proceso.

## Enlaces

- Repositorio en Hugging Face: [SZLHOLDINGS/szl-training-scripts](https://huggingface.co/SZLHOLDINGS/szl-training-scripts)
- Organización SZL Holdings en Hugging Face: [SZLHOLDINGS](https://huggingface.co/SZLHOLDINGS/models)
- GitHub de SZL Holdings: [szl-holdings](https://github.com/szl-holdings)
- Repositorio SZL Forge (kit de fine-tuning): [szl-holdings/szl-forge](https://github.com/szl-holdings/szl-forge)
- Documentación de SZL Holdings: [SZL Holdings Docs](https://szl-holdings.github.io/docs-site/)
- Perfil de la organización en GitHub: [szl-holdings/.github](https://ithub.global.ssl.fastly.net/szl-holdings/.github)
