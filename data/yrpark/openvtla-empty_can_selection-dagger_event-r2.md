# yrpark/openvtla-empty_can_selection-dagger_event-r2

## Resumen

`yrpark/openvtla-empty_can_selection-dagger_event-r2` es un ajuste fino mediante DAgger del modelo base OpenVTLA `yrpark/openvtla-empty_can_selection`, orientado a manipulación robótica con percepción táctil. Lo desarrolla el usuario de Hugging Face yrpark sobre la pila `tactile_base`, y combina la arquitectura pi0.5 (visión-lenguaje-acción) con el encoder táctil AnyTouch2 y el conjunto de datos OpenViTac `empty_can_selection`. El objetivo concreto es la tarea simulada de selección de una lata vacía con un sensor GelSight Mini, incorporando datos de corrección humana recogidos con DAgger para mejorar la robustez frente a estados fuera de distribución.

El modelo no es un LLM de propósito general, sino una política visuotáctil-lenguaje-acción (VTLA) que predice acciones motoras a partir de observaciones visuales, lecturas táctiles e instrucciones en lenguaje natural. Su relevancia radica en que demuestra un flujo completo de ajuste con DAgger sobre un modelo pi0.5 con LoRA, incluyendo una cabeza auxiliar de eventos táctiles que solo se usa durante el entrenamiento. El checkpoint publicado corresponde al paso 4999 de un entrenamiento de 5.000 pasos en una única NVIDIA B200.

El repositorio ocupa 6,4 GB e incluye únicamente el checkpoint final en formato openpi (`params/` y `assets/` con estadísticas de normalización); no se incluye `train_state/`. La evaluación en simulador está pendiente según la model card, por lo que no hay métricas de éxito publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (visión-lenguaje-acción) con encoder táctil AnyTouch2; ajuste fino con LoRA (`gemma_2b_lora` + `gemma_300m_lora`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | checkpoint openpi (`params/`, `assets/` con norm stats); no se indica safetensors ni GGUF |
| Tamano del repositorio | 6,4 GB |
| Tokens táctiles | 18 (cls_pool2) |
| Paso del checkpoint | 4999 (final) |
| Fecha de creacion | 2026-11-26 |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `yrpark/openvtla-empty_can_selection` en el paso 19999, conservando sus estadísticas de normalización. Sobre esa base se aplica un ajuste fino con DAgger usando LoRA en dos módulos (`gemma_2b_lora` y `gemma_300m_lora`), lo que sugiere una columna vertebral tipo Gemma con adaptadores de bajo rango. La política procesa observaciones visuales, lecturas del sensor táctil GelSight Mini (18 tokens táctiles mediante `cls_pool2`) e instrucciones en lenguaje, y emite acciones con horizonte de 50 pasos.

Los datos de entrenamiento combinan demostraciones scriptadas del dataset `openvitac/empty_can_selection_gelsight` con datos DAgger de `openvitac/empty_can_selection_dagger_gelsight`, muestreados 50:50. El conjunto DAgger (r1+r2) contiene 88 episodios y 20.984 fotogramas: 30 segmentos de corrección y 58 éxitos base, con etiquetas densas de evento `event_empty` (11.270 positivos, 1.638 negativos, 8.076 ignorados). La función de pérdida combina flow matching (behavior cloning) con una cabeza auxiliar de eventos táctiles: BCE sobre tokens táctiles proyectados y normalizados en L2, con inicialización lineal a cero, temperatura 0,1, peso 0,1 y peso positivo 0,15; los fotogramas de demostración se enmascaran con etiqueta -1.

El entrenamiento se ejecutó durante 5.000 pasos con batch de 64 (acumulación de gradiente 1), LR 2,5e-5 con decaimiento coseno hasta 2,5e-6 y warmup de 200 pasos, en una NVIDIA B200 entre el 25 y el 26 de noviembre de 2026 (unas 3 horas). La pérdida final de entrenamiento se situó entre 0,0010 y 0,0013 en los últimos pasos registrados, incluyendo el término BCE ponderado. La cabeza de eventos es solo de entrenamiento: la inferencia es idéntica a la del modelo base.

## Capacidades

- Control robótico visuotáctil: genera acciones motoras a partir de imágenes, lecturas de sensor GelSight Mini e instrucciones en lenguaje.
- Percepción táctil integrada mediante AnyTouch2, con 18 tokens táctiles por observación.
- Ejecución de tareas de manipulación en simulación (selección de lata vacía) con horizonte de planificación de 50 pasos.
- Aprendizaje por imitación con flow matching (behavior cloning) sobre demostraciones scriptadas.
- Mejora mediante DAgger con datos de corrección humana, orientada a recuperarse de estados fuera de distribución.
- Cabeza auxiliar de eventos táctiles (solo entrenamiento) para supervisión densa de contacto.
- No se documentan capacidades de tool calling, agentes multi-paso, generación de texto general ni multilingüismo.

## Casos de uso

- Investigación en manipulación táctil simulada: servir como política de referencia para la tarea `empty_can_selection` en el entorno OpenViTac, comparando el efecto de DAgger frente al modelo base.
- Reproducción de experimentos DAgger: el checkpoint permite reproducir el pipeline descrito en `docs/dagger.md` de `tactile_base` y validar la recogida y etiquetado de correcciones.
- Punto de partida para nuevos ajustes: al conservar las norm stats del modelo base y usar LoRA, sirve como inicialización para tareas táctiles relacionadas con GelSight Mini.
- Evaluación de cabezas auxiliares de eventos: aunque la cabeza de eventos no se usa en inferencia, el checkpoint documenta el efecto de la supervisión densa de contacto sobre la política.
- Despliegue en simulación con `serve_policy.py`: el comando documentado permite levantar el servidor de política en un checkout de `tactile_base` para pruebas en bucle cerrado.
- Estudio de eficiencia de ajuste: con 5.000 pasos en una B200 y pérdida final en torno a 1e-3, es un caso práctico para medir coste de DAgger con LoRA en políticas pi0.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación en simulador está pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 6,4 GB y la arquitectura subyacente (pi0.5 con columna Gemma) sugiere requisitos de GPU de centro de datos, pero no se publica cifra.
- GPU recomendadas: el entrenamiento se realizó en 1x NVIDIA B200; no se documentan requisitos mínimos de inferencia.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: servidor openpi mediante `uv run scripts/serve_policy.py policy:checkpoint` con la configuración `openvtla_empty_can_selection_dagger_event` y el directorio `checkpoints/openvtla_empty_can_selection_dagger_event/r2/4999`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política de acción).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `yrpark/openvtla-empty_can_selection-dagger_event-r2` | pi0.5 + AnyTouch2, LoRA | no disponible | no disponible | Selección de lata vacía (sim, GelSight Mini) | other | Hugging Face |
| `yrpark/openvtla-empty_can_selection` | pi0.5 + AnyTouch2 (base) | no disponible | no disponible | Misma tarea, sin DAgger | other | Hugging Face |
| Otros modelos pi0.5 / OpenVTLA | VLA/VTLA | no disponible | no disponible | Manipulación robótica | variable | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes; la única diferencia documentada es el ajuste DAgger y la cabeza de eventos.

## Limitaciones y advertencias

- Evaluación en simulador pendiente: no hay evidencia publicada de tasa de éxito ni de mejora frente al modelo base.
- Dominio muy restringido: entrenado para una única tarea (`empty_can_selection`) en simulación con GelSight Mini; no se espera transferencia directa a otras tareas o sensores.
- Licencia `other`: no se detallan términos de uso comercial; es necesario consultar las condiciones del autor y de los componentes subyacentes (pi0.5, AnyTouch2, Gemma) antes de cualquier uso productivo.
- Idiomas no especificados: no se documenta el soporte multilingüe de las instrucciones en lenguaje.
- Riesgo de sobreajuste a los datos DAgger (88 episodios, 20.984 fotogramas) y a la distribución de la simulación.
- No se incluye `train_state/`, lo que impide reanudar el entrenamiento desde el checkpoint publicado.
- La cabeza de eventos táctiles no está activa en inferencia; su utilidad solo se manifiesta durante el entrenamiento.
- No se documentan sesgos, pero al ser un modelo de control robótico los riesgos se centran en fallos de manipulación y en la brecha sim-a-real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-empty_can_selection-dagger_event-r2
- Modelo base: https://huggingface.co/yrpark/openvtla-empty_can_selection
- Repositorio de código `tactile_base`: https://github.com/YuriPark0123/tactile_base
- Dataset de datos DAgger: https://huggingface.co/datasets/yrpark/openvitac-openvtla-data
- Documentación DAgger: `docs/dagger.md` en el repositorio `tactile_base`
