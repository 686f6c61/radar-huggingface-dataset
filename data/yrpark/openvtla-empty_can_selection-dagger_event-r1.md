# yrpark/openvtla-empty_can_selection-dagger_event-r1

## Resumen

`yrpark/openvtla-empty_can_selection-dagger_event-r1` es un ajuste fino por DAgger del modelo base OpenVTLA `yrpark/openvtla-empty_can_selection`, orientado a manipulación robótica con percepción táctil. El modelo parte de la arquitectura pi0.5 (vision-language-action) combinada con el encoder táctil AnyTouch2, y se entrena sobre el entorno de simulación OpenViTac para la tarea `empty_can_selection` con sensores GelSight Mini. El autor es yrpark y el artefacto se publica como checkpoint de openpi listo para servir con la herramienta `tactile_base`.

La relevancia de esta ficha es acotada: no es un modelo de lenguaje generalista, sino un policy de robótica especializado en una única tarea de simulación. El repositorio ocupa 6,4 GB y contiene únicamente el checkpoint final (paso 4999) en formato openpi, con estadísticas de normalización en `assets/` y pesos en `params/`. No incluye `train_state/`, por lo que no está pensado para reanudar entrenamiento, solo para inferencia.

El ajuste DAgger añade una cabeza de evento táctil que se usa solo durante el entrenamiento: predice si el robot sostiene una lata vacía (`event_empty` = 1) o una lata pesada (0), con frames de demostración enmascarados (-1). En inferencia el comportamiento es idéntico al del modelo base, sin la cabeza de evento. La evaluación en simulador está pendiente según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (vision-language-action) + encoder táctil AnyTouch2; LoRA sobre gemma_2b_lora y gemma_300m_lora |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no conversacional) |
| Licencia | other |
| Formato de pesos | checkpoint openpi (`params/` + `assets/` con norm stats) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint base `yrpark/openvtla-empty_can_selection` en el paso 19999, conservando sus estadísticas de normalización. Se entrena con un objetivo de flow matching (behavior cloning) más una cabeza de evento táctil: una capa lineal con inicialización a cero sobre tokens táctiles proyectados y con normalización L2, con temperatura 0,1, peso 0,1 y peso positivo 1,0, aplicando BCE sobre la etiqueta `event_empty`. Los frames de demostración se etiquetan con -1 y se enmascaran en la pérdida.

Los datos combinan demostraciones scriptadas de `openvitac/empty_can_selection_gelsight` y datos DAgger de `openvitac/empty_can_selection_dagger_gelsight`, muestreados 50:50. El conjunto DAgger r1 contiene 41 episodios y 10.066 frames (10 segmentos de corrección y 31 éxitos base), con distribución densa de `event_empty`: 4.965 frames con 1, 845 con 0 y 4.256 con -1 (commit `66873a3988` del dataset `yrpark/openvitac-openvtla-data`). El entrenamiento usó LoRA, horizonte 50, 18 tokens táctiles (`cls_pool2`), 5.000 pasos, batch 64 sin acumulación de gradiente, LR 2,5e-5 con coseno hasta 2,5e-6 y warmup de 200 pasos. Se ejecutó en una NVIDIA B200 entre el 24 y el 25 de noviembre de 2026 (aproximadamente 3 horas). La pérdida final registrada se sitúa entre 0,0014 y 0,0021 en los últimos cinco pasos (hasta el 4950), incluyendo el término BCE ponderado.

## Capacidades

- Manipulación robótica con percepción táctil en simulación: selección de latas vacías frente a latas pesadas usando sensores GelSight Mini.
- Política visuotáctil de acción: genera comandos motores condicionados por visión y tacto, con horizonte de 50 pasos.
- Aprendizaje por imitación con correcciones humanas (DAgger) sobre demostraciones scriptadas.
- Cabeza auxiliar de clasificación de evento táctil (`event_empty`) solo en entrenamiento; no se usa en inferencia.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades conversacionales.
- No hay capacidades multilingües declaradas; el modelo no procesa lenguaje natural como interfaz.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera del pipeline visuotáctil.

## Casos de uso

- Investigación en manipulación visuotáctil: servir como baseline reproducible para comparar políticas pi0.5 con y sin correcciones DAgger en la tarea `empty_can_selection`.
- Evaluación de sensores táctiles GelSight Mini en simulación: el modelo permite medir cómo la señal táctil mejora la discriminación entre objetos de distinto peso y geometría.
- Estudio de DAgger en robótica: el checkpoint r1 sirve para analizar el efecto de 41 episodios y 10.066 frames de corrección sobre un modelo preentrenado en el paso 19999.
- Reproducción de experimentos openpi: al estar empaquetado como checkpoint openpi con `assets/` de normalización, se puede servir directamente con `scripts/serve_policy.py` y la configuración `openvtla_empty_can_selection_dagger_event`.
- Desarrollo de pipelines de evaluación en simulador: útil para integrar la política en un bucle de evaluación OpenViTac y medir tasas de éxito por episodio.
- Base para nuevos fine-tunes con DAgger: el autor documenta el procedimiento en `docs/dagger.md` del repositorio `tactile_base`, lo que permite replicar la recolección y etiquetado de correcciones.
- Docencia y divulgación técnica: ejemplo concreto de cómo se combina un VLA con un encoder táctil y una cabeza auxiliar de eventos para tareas de agarre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación en simulador está pendiente ("Simulator evaluation: pending") y no se aportan tasas de éxito ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,4 GB, pero el tamaño exacto de los pesos en `params/` y el coste de activaciones no se detallan.
- GPU recomendadas: el entrenamiento se realizó en 1x NVIDIA B200; no se especifican requisitos mínimos para inferencia.
- Compatibilidad con GPU de consumo: no confirmada. Dado el uso de LoRA sobre gemma_2b y gemma_300m y el tamaño del repo, es plausible que quepa en GPUs de 24 GB o más, pero no hay dato oficial.
- Opciones de despliegue: `tactile_base` con `uv run scripts/serve_policy.py policy:checkpoint --policy.config openvtla_empty_can_selection_dagger_event --policy.dir checkpoints/openvtla_empty_can_selection_dagger_event/r1/4999`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `yrpark/openvtla-empty_can_selection-dagger_event-r1` | VLA visuotáctil (pi0.5 + AnyTouch2), fine-tune DAgger | no disponible (horizonte 50) | other | Hugging Face, checkpoint openpi | Este modelo |
| `yrpark/openvtla-empty_can_selection` | VLA visuotáctil base, sin DAgger | no disponible (horizonte 50) | other | Hugging Face | Checkpoint base del paso 19999 |
| Otros modelos pi0.5 / OpenVTLA | VLA visuotáctil | no disponible | other | Hugging Face | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información disponible.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre la tarea `empty_can_selection` en simulación con sensores GelSight Mini; no es transferible directamente a otros entornos sin reentrenamiento.
- Evaluación pendiente: no hay resultados de simulador ni de robot real, por lo que se desconoce su tasa de éxito real.
- Licencia "other": no se especifican términos de uso comercial; es necesario contactar con el autor o revisar el repositorio `tactile_base` antes de un uso productivo.
- Riesgo de sobreajuste a los 41 episodios DAgger y a las demostraciones scriptadas; la diversidad de datos es limitada.
- La cabeza de evento táctil no se usa en inferencia, de modo que el modelo servido no expone explícitamente la predicción `event_empty`; cualquier uso de esa señal requiere reentrenamiento o modificación del pipeline.
- No incluye `train_state/`, por lo que no se puede reanudar el entrenamiento desde este checkpoint sin reconstruirlo.
- Sin información sobre sesgos, idiomas o alucinación: al no ser un modelo de lenguaje, estas categorías no aplican de forma directa, pero la política puede fallar silenciosamente ante distribuciones visuales o táctiles no vistas.
- El repo no declara pipeline ni idiomas, lo que complica la integración automática en herramientas estándar de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-empty_can_selection-dagger_event-r1
- Modelo base: https://huggingface.co/yrpark/openvtla-empty_can_selection
- Dataset de datos DAgger y demostraciones: https://huggingface.co/datasets/yrpark/openvitac-openvtla-data
- Repositorio de código `tactile_base`: https://github.com/YuriPark0123/tactile_base
