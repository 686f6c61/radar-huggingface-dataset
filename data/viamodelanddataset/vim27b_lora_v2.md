# viamodelanddataset/vim27b_lora_v2

## Resumen

VIM 27B es un adaptador LoRA sobre el modelo base `unsloth/Qwen3.5-27B` desarrollado por el usuario `viamodelanddataset` para tareas de robótica y visión-lenguaje. El adaptador está entrenado para predecir de forma conjunta la acción en curso y la misión en curso a partir de un historial visual de teleoperación, es decir, dado un flujo de observaciones visuales de un robot teleoperado, el modelo infiere qué acción concreta se está ejecutando y cuál es el objetivo de más alto nivel de la tarea.

El modelo se presenta como el checkpoint final del entrenamiento sobre el dataset VI AMO v2, que contiene 6.600 episodios, 13.653 acciones y 9.702 misiones. Se trata de un adaptador PEFT de rango 16 (rank y alpha 16) entrenado durante una época con 4.306 pasos de optimizador, y se distribuye como pesos safetensors de aproximadamente 0,5 GB, requiriendo descargar por separado el modelo base Qwen3.5-27B.

Su relevancia radica en que aborda el problema de la comprensión de intención en robótica a partir de datos visuales de teleoperación, un paso necesario para sistemas de imitación y control de robots basados en modelos de lenguaje y visión. No obstante, la información pública disponible es muy limitada: no hay licencia declarada, no hay benchmarks publicados en la model card y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-27B (vision-language) |
| Parametros totales | no disponible (adaptador LoRA de rango 16 sobre base de 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/Qwen3.5-27B` (revision `68443620da0c3847c1ba5042b5dcf1e78c42bfba`), un modelo multimodal de tipo image-text-to-text de 27.000 millones de parámetros. El adaptador en sí es un LoRA con rango y alpha de 16, entrenado durante una época con 4.306 pasos de optimizador sobre el dataset VI AMO v2. No se especifica en la información disponible qué módulos del transformer se adaptan ni la configuración exacta de entrenamiento (tasa de aprendizaje, precisión, estrategia de enmascaramiento de tokens).

El dataset de entrenamiento, VI AMO v2, contiene 6.600 episodios de teleoperación, 13.653 acciones y 9.702 misiones. La tarea de entrenamiento consiste en predecir conjuntamente la acción en curso y la misión en curso a partir del historial visual de teleoperación. La evaluación se realizó sobre 1.091 acciones de test con nueve puntos de corte de observación, generando 9.819 predicciones. No se indica en la información disponible si se emplearon técnicas de RLHF, DPO ni otras innovaciones de decodificación.

## Capacidades

- Predicción conjunta de acción en curso y misión en curso a partir de historial visual de teleoperación.
- Comprensión de secuencias de imágenes (image-text-to-text) para inferir intención de tareas robóticas.
- Procesamiento de contexto visual multi-paso mediante los nueve puntos de corte de observación empleados en la evaluación.
- Capacidades heredadas del modelo base Qwen3.5-27B: generación de texto, razonamiento y comprensión multimodal (no verificadas específicamente en este adaptador).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés (`en`).
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Anotación automática de episodios de teleoperación: dado un historial visual de un episodio, el modelo predice la acción y la misión en curso, lo que permite etiquetar grandes volúmenes de datos de robótica sin intervención manual, aprovechando los 6.600 episodios del dominio de entrenamiento.
- Segmentación de tareas en pipelines de imitación: el modelo puede usarse para dividir un episodio largo en segmentos de acción y misión, facilitando el entrenamiento de políticas de imitación por fases.
- Supervisión de robots teleoperados: comparar la acción y misión predichas por el modelo con las ejecutadas por el operador para detectar desviaciones o errores durante la teleoperación.
- Generación de datos de entrenamiento para modelos de política: las predicciones de acción y misión pueden servir como etiquetas auxiliares o señales de recompensa en el entrenamiento de políticas robóticas.
- Evaluación de modelos de intención en robótica: el adaptador sirve como referencia (VIM Ours) en la evaluación descrita por los autores, con 9.819 predicciones sobre 1.091 acciones de test en nueve puntos de corte.
- Investigación en visión-lenguaje aplicada a robótica: el adaptador permite estudiar cómo un modelo multimodal de 27B se adapta con LoRA de rango 16 a tareas de comprensión de intención con datos limitados (una época, 4.306 pasos).
- Reproducibilidad de experimentos: al distribuirse con `checkpoint.json` y `SHA256SUMS`, el adaptador facilita la verificación de pesos y la reproducción de la evaluación VIM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe el protocolo de evaluación (1.091 acciones de test, nueve puntos de corte, 9.819 predicciones) sin reportar métricas numéricas de precisión, exactitud ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,5 GB, pero requiere cargar el modelo base Qwen3.5-27B, cuyos requisitos de VRAM no se detallan en la información disponible.
- Para un modelo base de 27B en precisión de 16 bits se necesitan del orden de 54 GB de VRAM solo para los pesos, aunque este dato es una estimación general y no está confirmado para Qwen3.5-27B en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo base, cabría esperar A100/H100 de 80 GB o configuraciones multi-GPU, pero no está confirmado.
- ¿Cabe en GPU de consumo? No disponible; con cuantización agresiva del modelo base podría ser posible en GPUs de 24 GB, pero no hay datos confirmados.
- Opciones de despliegue: la model card remite a las instrucciones del repositorio VIM en GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA para predicción de acción y misión en robótica sobre modelos multimodales de 27B) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los términos de uso comercial, por lo que no se recomienda su uso en producción sin aclarar la licencia con el autor.
- Solo se declara soporte para inglés, lo que limita su uso en entornos en castellano u otros idiomas.
- El modelo está especializado en un dominio muy concreto (teleoperación robótica) y su rendimiento fuera de ese dominio no está documentado.
- No se han publicado métricas de benchmarks ni comparaciones, por lo que no es posible evaluar su calidad de forma objetiva a partir de la información disponible.
- Riesgo de alucinación: no evaluado en la información proporcionada; al ser un modelo generativo multimodal, es esperable que pueda producir predicciones incorrectas de acción o misión.
- Sesgos conocidos: no disponible.
- El adaptador requiere descargar el modelo base Qwen3.5-27B por separado y seguir las instrucciones del repositorio VIM; un uso incorrecto de la revisión del modelo base puede invalidar los resultados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria nula.
- La model card indica que los pesos son idénticos al checkpoint v2 previamente incluido en el repositorio de código VIM; solo se actualizaron la model card y el checksum.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/viamodelanddataset/vim27b_lora_v2
- Dataset VI AMO v2: https://huggingface.co/datasets/viamodelanddataset/vi_amo_v2
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-27B
- Repositorio VIM (instrucciones de instalación e inferencia): https://github.com/vision-intention-action/VIM#download-the-released-adapter
