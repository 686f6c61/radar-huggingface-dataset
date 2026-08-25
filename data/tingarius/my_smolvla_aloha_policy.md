# Tingarius/my_smolvla_aloha_policy

## Resumen

Este modelo es un ajuste fino (fine-tune) de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face. SmolVLA cuenta con 450 millones de parámetros y está diseñado para ofrecer un rendimiento competitivo con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. El ajuste fino, realizado por Tingarius, adapta el modelo base `lerobot/smolvla_base` a la tarea específica de inserción de una clavija en un enchufe (peg insertion) en un entorno simulado, utilizando el dataset `lerobot/aloha_sim_insertion_human`. Con solo 200 pasos de entrenamiento y 50 episodios, este modelo demuestra cómo se puede especializar un VLA general a una tarea robótica concreta con recursos mínimos, lo que lo hace relevante para la investigación y el prototipado rápido en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA ligero compuesto por un modelo de lenguaje y visión (VLM) preentrenado y un experto de acción entrenado con flow matching. Dadas múltiples imágenes y una instrucción en lenguaje natural, el modelo genera un fragmento de acciones (action chunk) para el robot. En este ajuste fino, se parte del modelo base `lerobot/smolvla_base` y se entrena sobre el dataset de inserción de clavija, que contiene 50 episodios y 25 000 fotogramas a 50 FPS. La configuración de entrenamiento incluye 200 pasos, un tamaño de lote de 4, optimizador AdamW con una tasa de aprendizaje de 0,0001 y una semilla de 1000. No se aplicaron técnicas de RLHF ni DPO; se trata de un aprendizaje supervisado de imitación.

## Capacidades

- Generación de acciones robóticas (14 dimensiones) a partir de observaciones de estado (6 dimensiones) y múltiples imágenes de cámaras.
- Procesamiento de hasta 3 cámaras de 256x256 píxeles y 2 cámaras adicionales de 480x640 píxeles (aunque estas últimas aparecen como "vacías" en la configuración).
- Ejecución de tareas de manipulación bimanual en robots tipo ALOHA.
- Seguimiento de instrucciones en lenguaje natural (la tarea se describe como "Insert the peg into the socket").
- Integración con el framework LeRobot para entrenamiento, evaluación y despliegue.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo de política robótica puro.

## Casos de uso

- **Inserción de piezas en ensamblaje industrial**: el modelo puede controlar un robot ALOHA para insertar componentes con precisión, reduciendo el tiempo de ciclo en líneas de producción automatizadas.
- **Manipulación bimanual en entornos simulados**: sirve como banco de pruebas para algoritmos de aprendizaje por imitación, permitiendo validar políticas antes de transferirlas al mundo real.
- **Entrenamiento de políticas de imitación para robots ALOHA**: al ser un fine-tune ligero, se puede reentrenar rápidamente con nuevos datos para otras tareas de manipulación.
- **Investigación en aprendizaje por imitación**: su pequeño tamaño y bajo coste computacional lo hacen ideal para experimentos académicos que requieren iteraciones frecuentes.
- **Prototipado rápido de tareas robóticas**: con solo 50 episodios y 200 pasos de entrenamiento, se puede obtener una política funcional en minutos, acelerando el desarrollo de nuevas aplicaciones.
- **Despliegue en hardware de bajo coste**: al tener solo 450 millones de parámetros, puede ejecutarse en GPUs de consumo, lo que facilita su uso en laboratorios y pequeñas empresas sin infraestructura de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se han proporcionado resultados de evaluación para esta política. Aunque el paper de SmolVLA (arXiv:2506.01844) reporta métricas del modelo base, no se dispone de datos específicos para este ajuste fino.

## Requisitos de hardware

- **VRAM estimada**: con 450 millones de parámetros y pesos en FP32, el modelo ocupa aproximadamente 1,8 GB. Para inferencia, se recomienda al menos 2-3 GB de VRAM, aunque no se especifican cuantizaciones.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 4090, o GPUs de centros de datos como A100 o H100 si se requiere mayor throughput.
- **Compatibilidad con hardware de consumo**: sí, el modelo está diseñado para ejecutarse en GPUs de consumo, como se indica en la descripción de SmolVLA.
- **Opciones de despliegue**: se puede utilizar con el framework LeRobot (comandos `lerobot-rollout` y `lerobot-train`), así como con las herramientas de Hugging Face para inferencia. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje estándar.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos en la información proporcionada. Sin embargo, SmolVLA se posiciona como una alternativa más ligera a otros VLA como OpenVLA (que tiene 7 mil millones de parámetros) o RT-2, ofreciendo un rendimiento competitivo con un coste computacional mucho menor. Este ajuste fino concreto se puede comparar con otros fine-tunes de SmolVLA, como `marmandala/my_smolvla_AlohaInsertion_20000`, aunque no se tienen sus especificaciones detalladas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tingarius/my_smolvla_aloha_policy | 450M | No disponible | Apache-2.0 | Hugging Face |
| lerobot/smolvla_base | 450M | No disponible | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | No disponible | MIT | Hugging Face |

## Limitaciones y advertencias

- **Entrenado solo en simulación**: el modelo se ajustó exclusivamente con datos simulados, por lo que puede no transferir directamente al mundo real sin un proceso de adaptación adicional.
- **Dataset pequeño**: con solo 50 episodios, existe riesgo de sobreajuste a las condiciones específicas del entorno de entrenamiento.
- **Tarea específica**: el modelo está especializado en la inserción de clavija; no es generalizable a otras tareas sin reentrenamiento.
- **Sin resultados de evaluación**: no se han proporcionado métricas de éxito en el mundo real o en simulación, lo que dificulta conocer su rendimiento real.
- **Dependencia de la configuración**: requiere que las cámaras y el robot coincidan con las especificaciones de entrenamiento (3 cámaras de 256x256 y 2 de 480x640, robot ALOHA).
- **Licencia**: aunque la licencia Apache-2.0 permite uso comercial, es necesario verificar los términos del modelo base y del dataset utilizado.

## Enlaces

- [Hugging Face - Tingarius/my_smolvla_aloha_policy](https://huggingface.co/Tingarius/my_smolvla_aloha_policy)
- [Paper SmolVLA (arXiv)](https://arxiv.org/abs/2506.01844)
- [Blog de Hugging Face sobre SmolVLA](https://huggingface.co/blog/smolvla)
- [Sitio web de SmolVLA](https://smolvla.net/index_en)
- [Documentación de LeRobot para SmolVLA](https://github.com/huggingface/lerobot/blob/main/docs/source/policy_smolvla_README.md)
