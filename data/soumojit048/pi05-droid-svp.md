# Soumojit048/pi05-droid-svp

## Resumen

pi05-droid-svp es una colección de checkpoints de investigación publicados por el usuario Soumojit048 sobre el modelo base `pi05_droid` de openpi (Physical Intelligence). No se trata de un modelo entrenado desde cero, sino de ajustes finos con LoRA sobre la configuración `pi05_droid`, orientados a robótica de manipulación y entrenados exclusivamente con rollouts simulados generados en gemelos digitales MuJoCo de escenas DROID y de un banco Franka real. El objetivo declarado es comparar dos estrategias de generación de datos: planificadores scriptados frente a datos de "steering" (corrección con lookahead sobre muestras no modificadas de pi0.5).

La relevancia es acotada y experimental: son checkpoints de un estudio en curso, no validados en hardware real, y el propio autor los etiqueta como material de investigación. El repositorio ocupa 157 GB y contiene varios directorios con `params/` y `assets/droid/` (estadísticas de normalización DROID sin modificar). La interfaz es idéntica a la de `pi05_droid`: imagen exterior y de muñeca a 224 px, posición de articulaciones y pinza, prompt textual, y salida de 15 x 8 acciones de velocidad articular más pinza.

La información pública disponible es muy limitada: no hay datos de benchmarks, ni número de parámetros declarado, ni idiomas soportados, ni resultados de evaluación en robot real. La ficha refleja esa escasez de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi0.5 de openpi; PaliGemma 2B (variante LoRA `gemma_2b_lora`) como backbone visión-lenguaje y experto de acción Gemma 300M (variante LoRA `gemma_300m_lora`) |
| Parametros totales | no disponible (el repo pesa 157 GB e incluye múltiples checkpoints; no se declara el recuento por checkpoint) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en `params/` para el stack openpi; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el prompt es textual; no se declara cobertura idiomática) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible con precisión; el repo contiene directorios `params/` y `assets/droid/` para cargar con openpi (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de `pi05_droid`, la variante de pi0.5 de openpi ajustada al dataset DROID. La arquitectura es un VLA con dos componentes: un backbone visión-lenguaje PaliGemma de 2B parámetros y un experto de acción Gemma de 300M parámetros. En esta publicación ambos se ajustan mediante LoRA (`gemma_2b_lora` y `gemma_300m_lora`), de modo que solo se entrenan adaptadores de bajo rango sobre los pesos base congelados. La entrada combina imagen exterior e imagen de muñeca a 224 px, estado de articulaciones y pinza, y un prompt textual; la salida son 15 pasos de 8 dimensiones (velocidad articular más pinza).

El entrenamiento se realizó únicamente con rollouts simulados en gemelos digitales MuJoCo, no con datos reales de DROID. Se comparan dos regímenes de datos: un planificador scriptado (206 episodios en seis gemelos, incluido el del banco Franka) y datos de steering (corrección con lookahead sobre muestras de pi0.5), con una variante reducida de 52 episodios sobre un único gemelo de episodio DROID (`ep4_steer_s4000`). Los checkpoints se identifican por paso de entrenamiento (`s<step>`). No se documentan número total de tokens, composición del dataset, ni uso de RLHF/DPO.

## Capacidades

- Control robótico de manipulación mediante predicción de acciones de velocidad articular y pinza (15 x 8).
- Política visuomotora que combina percepción desde cámaras exterior y de muñeca con instrucciones en lenguaje natural.
- Ejecución de tareas guiadas por prompt textual sobre escenas tipo DROID y un banco Franka.
- Ajuste fino eficiente con LoRA sobre un VLA preentrenado, reutilizando las estadísticas de normalización DROID.
- Integración con el protocolo websocket de openpi mediante el servidor `scripts/svp_serve.py`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico, visión general, audio ni modo "thinking".

## Casos de uso

- Investigación en generación de datos sintéticos para robótica: permite comparar políticas entrenadas con planificadores scriptados frente a políticas entrenadas con steering, usando los checkpoints como base reproducible en gemelos MuJoCo.
- Simulación a realidad (sim-to-real) en fase temprana: sirve para estudiar la transferencia de políticas entrenadas solo en simulación antes de invertir en recogida de datos reales, aunque el autor advierte que no está validado en hardware.
- Benchmarking interno de estrategias de anotación: los pares `planner` y `steer` con los mismos 206 episodios y seis gemelos permiten aislar el efecto del régimen de datos sobre el rendimiento de la política.
- Prototipado de pipelines openpi: el servidor websocket y la interfaz idéntica a `pi05_droid` facilitan sustituir el modelo base por estos checkpoints en un stack existente sin cambiar el contrato de entrada/salida.
- Estudio de ajuste fino con LoRA en VLAs: útil para analizar coste, estabilidad y comportamiento de adaptadores de bajo rango sobre PaliGemma 2B y Gemma 300M en tareas de control.
- Docencia y experimentación en robótica de manipulación: escenarios acotados (un episodio DROID o seis gemelos) que permiten reproducir el protocolo descrito en `REAL_ROBOT_AGENT.md` sin acceso a un robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo completo ocupa 157 GB por acumular varios checkpoints; un único checkpoint LoRA sobre PaliGemma 2B más Gemma 300M requeriría previsiblemente menos, pero no se documenta la cifra.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del backbone (2B + 300M), cabría esperar GPUs de centro de datos tipo A100 o H100 para el stack openpi completo, pero no se confirma.
- ¿Cabe en GPU de consumo? No confirmado. El backbone de 2B podría caber en GPUs de consumo de gama alta, pero el requisito de servir imágenes a 224 px y el stack openpi no están cuantificados.
- Opciones de despliegue: servidor websocket propio de openpi (`scripts/svp_serve.py` en el repositorio `Sumo048/scan_sim`, rama `steer-vs-planner`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-droid-svp | no disponible (LoRA sobre PaliGemma 2B + Gemma 300M) | no disponible | Solo simulación MuJoCo (planificador y steering) | Apache 2.0 | Hugging Face (repo de 157 GB) |
| pi05_droid (openpi) | PaliGemma 2B + experto de acción Gemma 300M | no disponible | Datos DROID reales | Apache 2.0 (openpi) | openpi / Hugging Face |
| pi0.5 base (openpi) | no disponible en esta ficha | no disponible | Preentrenamiento general de políticas VLA | Apache 2.0 (openpi) | openpi / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Checkpoints de investigación en curso: el autor indica explícitamente que no están validados en hardware real.
- Entrenados solo con rollouts simulados de gemelos MuJoCo, lo que introduce brecha sim-to-real no cuantificada.
- Requieren construir el modelo con las variantes LoRA concretas (`gemma_2b_lora`, `gemma_300m_lora`) sobre la configuración `pi05_droid`; no son pesos autónomos listos para usar.
- Dependencia de las estadísticas de normalización DROID sin modificar (`assets/droid/`), lo que limita su uso fuera de ese dominio de acciones.
- Cobertura de escenas muy reducida: un episodio DROID en `ep4_steer_s4000` y seis gemelos en el resto.
- Sin datos publicados de benchmarks, sesgos, tasas de alucinación ni comportamiento multilingüe; no evaluables con la información disponible.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero la ausencia de validación en robot real desaconseja su uso en producción sin evaluación propia.
- El tamaño del repositorio (157 GB) complica la descarga y el versionado en entornos con almacenamiento limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Soumojit048/pi05-droid-svp
- Repositorio con el servidor y protocolo de evaluación: https://github.com/Sumo048/scan_sim (rama `steer-vs-planner`)
- Documento de tareas y protocolo: `REAL_ROBOT_AGENT.md` en el repositorio anterior
- openpi (Physical Intelligence): no se proporciona URL en la información disponible
