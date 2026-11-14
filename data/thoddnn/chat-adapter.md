# thoddnn/chat-adapter

## Resumen

`thoddnn/chat-adapter` es un adaptador LoRA publicado por el usuario thoddnn para el modelo base `thoddnn/Qwen3.5-2B-8bit`, una versión cuantizada a 8 bits del Qwen 3.5 de 2B parámetros distribuida originalmente por mlx-community. El adaptador está pensado para el SDK de chat compartido del proyecto Fenn y su función concreta es la generación de llamadas a herramientas en Python acotadas (bounded Python tool calls), no el análisis general de documentos. Se trata, por tanto, de una pieza de infraestructura interna de un sistema mayor, no de un modelo de propósito general.

El checkpoint seleccionado corresponde al paso 1900, con rango LoRA 16 y cuatro capas adaptadas. La model card insiste en que debe cargarse junto con la revisión del modelo base Nano indicada en `manifest.json` y con el harness de herramientas actual de Fenn; si se quiere usar Nano como analista, debe cargarse el base sin este adaptador. El repositorio es de tamaño 0.0 GB, lo que sugiere que los pesos del adaptador no están efectivamente subidos o son de tamaño despreciable.

La relevancia de esta ficha es limitada para el público general: se trata de un adaptador muy específico, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni idiomas declarados. Su interés radica en documentar el patrón de adaptadores LoRA para tool calling sobre modelos pequeños cuantizados en MLX, útil para quienes construyan agentes locales en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (base Qwen 3.5 2B, cuantizado 8-bit) |
| Parametros totales | no disponible (adaptador LoRA; base de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | base en 8-bit (MLX); adaptador en el formato nativo de MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (librería `mlx`; no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre cuatro capas del modelo base Qwen 3.5 de 2B parámetros en su variante cuantizada a 8 bits para MLX. No se especifica qué capas concretas se adaptan, ni la composición del dataset de entrenamiento, ni si hubo fases de RLHF o DPO. La model card únicamente indica que el checkpoint seleccionado es el 1900 y que el adaptador está entrenado para producir llamadas a herramientas en Python acotadas dentro del harness de Fenn.

No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). La única particularidad reseñable es el acoplamiento estricto entre adaptador, revisión del base y harness: el sistema está diseñado para funcionar como un conjunto cerrado, lo que implica que cambios en cualquiera de las tres piezas pueden invalidar el comportamiento.

## Capacidades

- Generación de llamadas a herramientas en Python acotadas (bounded Python tool calls) dentro del SDK de chat de Fenn.
- Integración con el harness de herramientas del proyecto Fenn.
- Ejecución local en Apple Silicon mediante MLX.
- No está diseñado para análisis general de documentos; la model card lo desaconseja explícitamente para ese uso.
- Capacidades multilingües: no disponibles.
- Razonamiento multi-paso, agentes autónomos, visión o audio: no documentados.

## Casos de uso

- Coordinación de herramientas en un agente local: el adaptador convierte intenciones del usuario en llamadas a funciones Python acotadas, integrándose en el bucle de un agente que corre sobre MLX en un Mac.
- Prototipado de asistentes con tool calling en Apple Silicon: permite experimentar con un pipeline de funciones sin depender de APIs en la nube, usando el base de 2B en 8 bits.
- Sustitución de un coordinador en el SDK de Fenn: encaja como capa de decisión de herramientas cuando el sistema ya usa el harness de Fenn y el base Nano en la revisión indicada.
- Evaluación de adaptadores LoRA de bajo rango: sirve como caso de estudio de un LoRA r=16 sobre cuatro capas para tareas de function calling.
- Docencia y experimentación: útil para demostrar el acoplamiento entre base cuantizado, adaptador y harness en un entorno reproducible.
- Integración en pipelines de CI para agentes: al ser un artefacto pequeño y determinista en su formato, puede versionarse junto al harness para pruebas de regresión de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: no disponible de forma explícita; un base de 2B en 8 bits ocupa del orden de 2-3 GB, pero el adaptador no aporta cifras propias.
- GPU recomendadas: no disponibles; el formato MLX está orientado a Apple Silicon (M1/M2/M3/M4), no a CUDA.
- ¿Cabe en GPU consumer? El base en 8 bits es compatible con memoria unificada de Macs modernos; no se documenta soporte en GPUs NVIDIA.
- Opciones de despliegue: librería `mlx` (MLX de Apple); no se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| thoddnn/chat-adapter | LoRA r=16 sobre base 2B | no disponible | MLX | Apache 2.0 | Adaptador específico para tool calling en Fenn |
| Qwen 3.5 2B (base) | 2B | no disponible | safetensors/MLX según distribución | Apache 2.0 | Modelo generalista sin adaptación |
| Adaptadores LoRA de tool calling en el ecosistema MLX | variable | variable | MLX | variable | No se dispone de comparativas publicadas |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El adaptador está acoplado a una revisión concreta del base (`manifest.json`) y al harness de Fenn; usarlo fuera de ese contexto puede degradar el comportamiento.
- No debe emplearse como analista de documentos: la model card lo desaconseja explícitamente.
- Sin benchmarks, sin idiomas declarados y con cero descargas: no hay evidencia pública de calidad ni de robustez.
- Riesgo de alucinación en la generación de llamadas a herramientas: al ser un modelo de 2B, la tasa de errores en esquemas de funciones puede ser elevada sin validación externa.
- El repositorio tiene tamaño 0.0 GB, lo que sugiere que los pesos pueden no estar disponibles o ser de tamaño insignificante; conviene verificar antes de integrarlo.
- Licencia Apache 2.0 permite uso comercial, pero el base conserva su propia atribución y licencia upstream, que deben respetarse.
- No hay información sobre sesgos; al derivar de Qwen 3.5, hereda los sesgos del modelo original, no documentados aquí.

## Enlaces

- Hugging Face: https://huggingface.co/thoddnn/chat-adapter
- Modelo base: https://huggingface.co/thoddnn/Qwen3.5-2B-8bit
- Base original: https://huggingface.co/mlx-community/Qwen3.5-2B-8bit
