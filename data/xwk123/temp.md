# xwk123/temp

## Resumen

History-W3 HTML World Model es un modelo de mundo (world model) desarrollado por Weikai Xu (xwk123) para predecir la siguiente pantalla de una interfaz gráfica móvil (GUI) en forma de HTML completo. Se trata de un fine-tuning completo (full-finetune) del modelo multimodal Qwen3-VL-8B, especializado en el dominio de agentes móviles basados en visión y lenguaje (VLM). El modelo recibe como entrada la captura de pantalla actual, hasta tres capturas históricas, el historial completo de acciones previas y la acción actual, y genera el HTML de la pantalla siguiente.

Este modelo es relevante porque aborda un problema clave en el desarrollo de agentes móviles autónomos: la necesidad de simular o predecir el estado futuro de la interfaz sin depender de un entorno real. Al generar el HTML completo de la siguiente pantalla, permite entrenar y evaluar agentes en entornos sintéticos, reducir costes de interacción con dispositivos físicos y facilitar la planificación multi-paso. La elección de Qwen3-VL-8B como base aporta capacidades multimodales (imagen y texto) y un tamaño manejable para despliegue en entornos de investigación y producción ligera.

El repositorio de Hugging Face incluye únicamente los archivos del modelo desplegable, excluyendo checkpoints de entrenamiento, optimizadores y estados de DeepSpeed. Se proporcionan scripts de inferencia, renderizado con Chromium/Playwright y composición de regiones repintadas mediante una LoRA adicional (GUIdiff), lo que sugiere un pipeline completo para generar y visualizar predicciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-8B (fine-tune completo) |
| Parametros totales | 8 mil millones (estimado, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente multilingue, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (probable, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-VL-8B, un transformer multimodal que combina un codificador de visión con un modelo de lenguaje. El fine-tuning completo se realizó sobre esta base para adaptarla a la tarea específica de predicción de pantallas GUI móviles. Según la model card, el entrenamiento se lanzó con un script que utiliza 16 GPUs (probablemente con DeepSpeed), aunque no se especifican los datos de entrenamiento, el número de tokens ni el método de alineación (RLHF, DPO, etc.). La entrada es multimodal: combina imágenes (capturas de pantalla actuales e históricas) con texto (historial de acciones y acción actual). La salida es texto estructurado en formato HTML.

No se dispone de información sobre la composición del dataset, el número de pasos de entrenamiento ni las técnicas de regularización empleadas. La exclusión de los directorios de checkpoints y estados de optimización en el repositorio público impide conocer detalles adicionales del proceso de entrenamiento.

## Capacidades

- Predicción de la siguiente pantalla GUI móvil como HTML completo, a partir de capturas de pantalla actuales e históricas y del historial de acciones.
- Entrada multimodal: procesa imágenes (screenshots) y texto (acciones y metadatos).
- Generación de HTML estructurado que puede renderizarse con Chromium/Playwright para visualización.
- Integración con un pipeline de composición de regiones repintadas mediante una LoRA adicional (GUIdiff), lo que permite refinar las predicciones.
- Soporte para inferencia a través de un servidor compatible con la API de OpenAI (según los scripts de inferencia).
- Capacidad de trabajar con historial de hasta tres capturas de pantalla previas, lo que permite modelar dependencias temporales en la interfaz.

## Casos de uso

- Simulación de entornos móviles para entrenamiento de agentes: el modelo puede generar el siguiente estado de la GUI sin necesidad de un dispositivo real, permitiendo entrenar agentes de navegación en entornos sintéticos y reducir costes de interacción física.
- Evaluación offline de agentes móviles: al predecir el HTML de la siguiente pantalla, se pueden construir trayectorias sintéticas para benchmarks offline como Mobile-Bench-v2, evitando la inestabilidad de los entornos online.
- Planificación multi-paso en agentes autónomos: un agente puede usar el modelo de mundo para anticipar las consecuencias de sus acciones y elegir la secuencia óptima antes de ejecutarla en el dispositivo real.
- Automatización de pruebas de aplicaciones móviles: los equipos de QA pueden generar estados futuros de la interfaz para verificar flujos de usuario sin necesidad de interactuar con la app en cada iteración.
- Generación de datos sintéticos para entrenamiento de otros modelos: el HTML generado puede utilizarse como datos de entrenamiento para modelos de comprensión de GUI o para aumentar datasets existentes.
- Investigación en modelos de mundo para interfaces gráficas: sirve como base para estudiar la predicción de estados en entornos interactivos, comparando con otros enfoques basados en visión o en XML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (como exactitud de predicción, BLEU, o tasas de éxito en tareas de navegación) ni comparaciones con otros modelos de mundo para GUI.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el modelo base es de 8B parámetros, se estima que una cuantización de 4 bits requeriría aproximadamente 5-6 GB de VRAM, y una de 8 bits alrededor de 8-9 GB, pero estos valores son orientativos y no confirmados.
- GPU recomendadas: no disponible. Para inferencia en FP16 se necesitaría al menos una GPU con 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB). Para cuantizaciones más bajas, GPUs de 8-12 GB podrían ser suficientes.
- Si cabe en consumer GPU: probablemente sí con cuantización (por ejemplo, GGUF de 4 bits en una RTX 3060 o superior), pero no hay confirmación oficial.
- Opciones de despliegue: los scripts de inferencia indican que se espera un servidor compatible con la API de OpenAI, lo que sugiere compatibilidad con vLLM, TGI u Ollama, aunque no se especifica explícitamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la predicción de pantallas GUI como HTML. Existen otros modelos de mundo para interfaces móviles (por ejemplo, basados en GPT-4V o en modelos propietarios), pero no se han encontrado datos públicos que permitan una comparación rigurosa con este modelo. Se recomienda consultar la literatura sobre world models para GUI (por ejemplo, trabajos relacionados con Mobile-Bench-v2) para identificar alternativas.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, riesgos de alucinación o limitaciones de contexto o idioma. Al ser un modelo fine-tuneado sobre Qwen3-VL, podría heredar sesgos del modelo base, pero no hay datos confirmados.
- La licencia no está especificada en la model card, por lo que se desconoce si permite uso comercial o tiene restricciones. Se recomienda contactar al autor antes de usar el modelo en producción.
- El modelo está especializado en un dominio muy concreto (pantallas GUI móviles) y puede no generalizar bien a otros tipos de interfaces o tareas.
- La dependencia de un pipeline adicional (LoRA GUIdiff, renderizado con Chromium) implica que el modelo por sí solo no produce imágenes finales, sino HTML que debe procesarse posteriormente.
- No se han publicado métricas de rendimiento, por lo que la calidad de las predicciones no está validada externamente.
- El repositorio no incluye los datos de entrenamiento ni los detalles del proceso, lo que dificulta la reproducibilidad y la evaluación de posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xwk123/temp
- Perfil del autor en Hugging Face: https://huggingface.co/xwk123
- Lista de modelos del autor: https://huggingface.co/xwk123/models
- Paper relacionado (Mobile-Bench-v2): https://arxiv.org/pdf/2505.11891
