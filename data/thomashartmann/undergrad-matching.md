# Thomashartmann/undergrad-matching

## Resumen

`Thomashartmann/undergrad-matching` es un prototipo de investigación publicado en Hugging Face por el usuario Thomashartmann, orientado a tareas de *matching* (emparejamiento). Se presenta explícitamente como un artefacto de carácter experimental: el propio autor indica en la model card que el checkpoint incluido es una inicialización válida para *smoke tests* y no un modelo entrenado ni evaluado con benchmarks. No se reclama ninguna puntuación de rendimiento en el repositorio.

La arquitectura declarada es un "Mixer" con atención de tipo *grouped query*, fusión mediante *cross attention*, activación mish y normalización RMSNorm, en una escala denominada "nano". El recuento real de parámetros en safetensors es de 49.600, lo que lo sitúa en el rango de unos pocos miles de parámetros, muy por debajo de cualquier modelo de lenguaje utilizable en producción. El tamaño del repositorio es de 0.0 GB.

Su relevancia actual es limitada y estrictamente académica: sirve como esqueleto reproducible para experimentos de emparejamiento, con configuración de arquitectura, receta de entrenamiento por defecto (optimizador Novograd con schedule coseno) y script de evaluación. No debe confundirse con un modelo desplegable: carece de pesos entrenados, de idiomas declarados y de pipeline asociado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixer (atención grouped query, fusión por cross attention, activación mish, normalización RMSNorm) |
| Parámetros totales | 49.600 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura es un Mixer con atención de consultas agrupadas (*grouped query attention*) y fusión mediante *cross attention*, activación mish y normalización RMSNorm. La escala declarada es "nano". El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto, que emplea el optimizador Novograd con un schedule de tipo coseno.

No se ha completado ningún entrenamiento según la documentación: `model.safetensors` es un checkpoint de inicialización para pruebas de humo, no un modelo entrenado. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. El autor recomienda, para una evaluación significativa, entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, y usar un conjunto de validación emparejado reportando la métrica de tarea en al menos tres semillas junto con un baseline de capacidad equivalente.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de *tool calling* ni *function calling*.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas soportados.
- El propósito declarado es el emparejamiento (*matching*) en un contexto de investigación, sin métricas ni tareas concretas verificadas.
- El repositorio incluye un script `eval.py` con un bloque `__main__` de ejemplo de prueba de humo y una entrada de entrenamiento ejecutable.

## Casos de uso

- Reproducción de experimentos académicos de *matching*: el repositorio proporciona configuración de arquitectura y receta de entrenamiento para replicar el setup con datos propios.
- Baseline de capacidad reducida en estudios comparativos: con 49.600 parámetros sirve como referencia mínima frente a arquitecturas de mayor escala bajo el mismo presupuesto de datos y semillas.
- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización permite validar carga de pesos, *forward pass* y bucles de entrenamiento antes de lanzar experimentos costosos.
- Docencia e investigación sobre arquitecturas Mixer: el código y los ficheros de configuración documentan una implementación concreta con GQA, cross attention, mish y RMSNorm.
- Integración en *frameworks* personalizados: al ser una implementación propia, requiere un adaptador explícito para las APIs genéricas de carga automática, lo que lo hace útil para practicar dicho encapsulado.
- Verificación de formatos y serialización: `model.safetensors` y `config.json` permiten comprobar la compatibilidad del formato de pesos con herramientas de inspección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna puntuación de rendimiento en el repositorio y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 49.600 parámetros en safetensors el peso del modelo es del orden de decenas de kilobytes en precisión estándar.
- GPU recomendadas: no aplica; cualquier GPU consumer, e incluso CPU, es suficiente para ejecutar el *forward pass* del checkpoint de inicialización.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en CPU.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Al ser una implementación personalizada, requiere usar el propio código del repositorio o un adaptador explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se identifican en la información proporcionada modelos comparables de la misma categoría (prototipos Mixer de escala nano para *matching*) con parámetros, contexto, rendimiento, licencia y disponibilidad verificables.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es una inicialización para pruebas de humo, no un modelo funcional para tareas reales.
- No se ha auditado robustez, equidad (*fairness*) ni transferencia de dominio; el autor lo describe como punto de partida experimental.
- Ausencia total de métricas de rendimiento, benchmarks o evaluación publicada.
- No se declaran idiomas soportados, longitud de contexto ni tipos de cuantización.
- La licencia MIT permite uso comercial del código y pesos, pero el autor advierte de revisar por separado los términos de los datos de origen si se usa con datasets externos.
- Cualquier resultado obtenido con un checkpoint futuro entrenado debe documentarse por separado de los valores por defecto incluidos aquí.
- No apto para producción en su estado actual.

## Enlaces

- Hugging Face: https://huggingface.co/Thomashartmann/undergrad-matching
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
