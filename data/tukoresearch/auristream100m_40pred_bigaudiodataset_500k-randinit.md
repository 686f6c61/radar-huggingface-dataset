# TuKoResearch/AuriStream100M_40Pred_BigAudioDataset_500k-randinit

## Resumen

AuriStream es un modelo de lenguaje de habla (speech language model) desarrollado por Greta Tuckute y Klemen Kotar, publicado bajo la organización TuKoResearch. El modelo predice tokens cocleares generados por un tokenizador como WavCochCausalV8192, lo que lo sitúa en el ámbito del modelado de audio y habla a nivel de representaciones internas del sistema auditivo. La arquitectura es un transformer estándar con 12 capas, tamaño oculto de 768 y 12 cabezas de atención, con un vocabulario de 8192 tokens y 40 pasos de predicción.

Este repositorio concreto contiene un checkpoint de inicialización aleatoria (randinit) cargado desde un checkpoint nativo de paso cero con semilla `19945678`. Es decir, **no es un modelo entrenado**, sino una instancia recién inicializada de la arquitectura AuriStream. Esto implica que no tiene capacidades funcionales de generación o comprensión de audio; su utilidad se limita a servir como punto de partida para entrenamiento o para verificar la implementación del código. El nombre "100M" es engañoso, ya que los parámetros totales reales ascienden a 342.903.936 (~0,34B), según los pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) con 12 capas, hidden size 768, 12 cabezas de atención |
| Parametros totales | 342.903.936 (~0,34B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada; depende de la secuencia de tokens cocleares) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | no disponible (modelo de audio, no de texto; no se especifican idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de AuriStream es un transformer estándar, similar a los modelos de lenguaje convencionales, pero adaptado para operar sobre tokens cocleares en lugar de tokens de texto. El modelo tiene 12 capas, un tamaño oculto de 768, 12 cabezas de atención y un vocabulario de 8192 tokens. La característica distintiva es que predice 40 pasos de tokens cocleares a la vez (prediction steps), lo que sugiere un mecanismo de predicción multi-paso en el dominio auditivo.

En cuanto al entrenamiento, este checkpoint concreto es una **inicialización aleatoria** (randinit). No ha sido entrenado con ningún dato. El repositorio indica que se cargó desde un checkpoint nativo de paso cero con una semilla específica (`19945678`). No hay información sobre el dataset de entrenamiento, el número de tokens procesados ni técnicas como RLHF o DPO, porque simplemente no existe entrenamiento previo. El nombre del repositorio menciona "BigAudioDataset_500k", pero esto se refiere al dataset que se usaría para entrenar, no a que el modelo ya haya sido entrenado con él.

## Capacidades

- **Generación de audio**: no disponible. Al ser un checkpoint sin entrenar, no puede generar ni procesar audio de forma útil.
- **Razonamiento o comprensión**: no disponible. No hay ninguna capacidad funcional.
- **Tool calling / function calling**: no soportado.
- **Agentes y multi-step reasoning**: no aplicable.
- **Capacidades multilingües**: no aplicable (modelo de audio).
- **Capacidades especiales**: la arquitectura está diseñada para predecir tokens cocleares, pero al no estar entrenada, no produce salidas coherentes. El código personalizado (`custom_code`) permite cargar el modelo con `trust_remote_code=True`, pero no aporta funcionalidad adicional.

## Casos de uso

Dado que este checkpoint es una inicialización aleatoria sin entrenamiento, **no tiene casos de uso prácticos en producción**. Los únicos escenarios plausibles son:

- **Investigación de inicialización**: estudiar el efecto de diferentes semillas de inicialización en el entrenamiento posterior de AuriStream. Se usaría como punto de partida para entrenar el modelo desde cero.
- **Verificación de la implementación**: comprobar que el código personalizado de AuriStream carga correctamente y que la arquitectura produce salidas con la forma esperada (por ejemplo, logits de 8192 tokens × 40 pasos).
- **Pruebas de integración**: validar que el pipeline de entrenamiento (datos, tokenizador, modelo) funciona antes de lanzar un entrenamiento completo.
- **Benchmarking de hardware**: medir el consumo de memoria y la velocidad de forward pass de la arquitectura sin necesidad de entrenar, útil para planificar recursos.
- **Desarrollo de técnicas de inicialización**: experimentar con estrategias de inicialización de pesos en modelos de audio.
- **Reproducibilidad**: servir como referencia para comparar resultados de entrenamiento cuando se parte de la misma semilla.

En ningún caso debe usarse para tareas reales de procesamiento de audio o habla, ya que no ha aprendido ninguna representación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un modelo sin entrenar, no tiene sentido evaluar su rendimiento en tareas de audio o habla. No hay datos de MMLU, HumanEval, GSM8K ni ningún otro benchmark aplicable.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 342M parámetros, en FP32 ocuparía ~1,4 GB de VRAM; en FP16 ~0,7 GB. Sin embargo, al ser un modelo sin entrenar, la inferencia no produce resultados útiles.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM puede cargar el modelo en FP16 (por ejemplo, GTX 1650, RTX 3050). Para entrenamiento, se necesitaría más memoria, pero no se especifican requisitos.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs consumer de gama baja.
- **Opciones de despliegue**: al ser un modelo de transformers con código personalizado, se puede cargar con `AutoModel.from_pretrained(..., trust_remote_code=True)`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponibles, y carecen de sentido para un modelo sin entrenar.

## Comparativa con modelos similares

Existen otros checkpoints de AuriStream con diferentes configuraciones de pasos de predicción (20, 40, 60) y también con inicialización aleatoria. Sin embargo, no se dispone de datos comparativos de rendimiento, ya que ninguno está entrenado. La comparación se limita a la arquitectura:

| Modelo | Parámetros | Pasos de predicción | Estado |
|---|---|---|---|
| AuriStream100M_20Pred_BigAudioDataset_500k | ~0,2B (según nombre) | 20 | randinit |
| AuriStream100M_40Pred_BigAudioDataset_500k-randinit (este) | 342.903.936 | 40 | randinit |
| AuriStream100M_60Pred_BigAudioDataset_500k-randinit | no disponible | 60 | randinit |

No hay modelos comparables de otros autores en la misma categoría (modelos de tokens cocleares con inicialización aleatoria) en la información proporcionada.

## Limitaciones y advertencias

- **Modelo sin entrenar**: este checkpoint no ha sido entrenado con ningún dato. No produce salidas coherentes ni útiles. Cualquier uso en producción es inviable.
- **Sesgos**: al no tener entrenamiento, no presenta sesgos aprendidos, pero tampoco tiene ninguna capacidad.
- **Riesgo de alucinación**: no aplica, ya que no genera contenido.
- **Limitaciones de contexto o idioma**: no se especifica la longitud de contexto; el modelo opera sobre tokens cocleares, no sobre texto.
- **Restricciones de licencia**: licencia Apache-2.0, que permite uso comercial, pero el modelo no es funcional.
- **Caveat importante**: el nombre "100M" no refleja los parámetros reales (342M). Además, el código requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del autor; se recomienda auditar el código antes de usarlo en entornos sensibles.

## Enlaces

- [HuggingFace - AuriStream100M_40Pred_BigAudioDataset_500k-randinit](https://huggingface.co/TuKoResearch/AuriStream100M_40Pred_BigAudioDataset_500k-randinit)
- [HuggingFace - AuriStream-base (código base)](https://huggingface.co/TuKoResearch/AuriStream-base)
- [HuggingFace - WavCochCausalV8192 (tokenizador)](https://huggingface.co/TuKoResearch/WavCochCausalV8192)
- [HuggingFace - AuriStream100M_20Pred_BigAudioDataset_500k](https://huggingface.co/TuKoResearch/AuriStream100M_20Pred_BigAudioDataset_500k)
- [HuggingFace - AuriStream100M_60Pred_BigAudioDataset_500k-randinit](https://huggingface.co/TuKoResearch/AuriStream100M_60Pred_BigAudioDataset_500k-randinit)
- [Free2AITools - ficha del modelo](https://free2aitools.com/model/tukoresearch/auristream100m_40pred_bigaudiodataset_500k-randinit)
