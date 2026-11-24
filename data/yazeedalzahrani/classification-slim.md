# yazeedalzahrani/classification-slim

## Resumen

`classification-slim` es un repositorio experimental publicado por el usuario yazeedalzahrani en Hugging Face que contiene una implementación propia de una arquitectura tipo Mixer orientada a tareas de clasificación. No se trata de un modelo entrenado ni de un checkpoint con pesos ajustados: el propio autor indica de forma explícita que `model.safetensors` es un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests) y que no se presenta como un modelo con benchmarks. El repositorio incluye el código (`main.py`), la configuración de arquitectura (`config.json`), la receta de entrenamiento por defecto (`training_args.json`) y los pesos iniciales.

El interés del artefacto es fundamentalmente de investigación y andamiaje: permite inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo. La escala declarada es "large", con atención estándar, fusión tipo Tucker, activación gelu-tanh y normalización InstanceNorm. El recuento real de parámetros en safetensors es de 33.088, un tamaño muy reducido que confirma que se trata de una inicialización de juguete y no de un modelo de producción.

Por su naturaleza, no compite con modelos de clasificación o generación de propósito general: es una base de código reproducible para experimentar con variantes de Mixer. Cualquier uso en producción requeriría entrenamiento previo, evaluación con particiones etiquetadas y comparación frente a baselines de capacidad equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixer (atención estándar, fusión Tucker, activación gelu-tanh, InstanceNorm) |
| Parametros totales | 33.088 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización), código PyTorch en `main.py` |

## Arquitectura y entrenamiento

La arquitectura declarada es un Mixer con atención estándar y fusión Tucker, activación gelu-tanh y normalización InstanceNorm. El autor la describe como una implementación personalizada ("custom implementation"), lo que implica que las APIs genéricas de carga automática de Hugging Face (por ejemplo, `AutoModel`) requieren un adaptador explícito antes de poder usarse. La escala indicada es "large", aunque el número real de parámetros del checkpoint (33.088) es muy inferior al que cabría esperar de un modelo etiquetado como grande, lo que refuerza la idea de que se trata de una configuración de prueba.

No se ha publicado información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste supervisado. La receta por defecto incluida en `training_args.json` usa el optimizador RMSprop con un scheduler OneCycle, pero el propio autor advierte que son valores de partida del script y no evidencia de una ejecución completada. No hay innovaciones técnicas documentadas más allá de la combinación de fusión Tucker con InstanceNorm en el bloque Mixer.

## Capacidades

- No se han documentado capacidades funcionales del modelo: el checkpoint no está entrenado.
- No hay soporte verificado de tool calling ni function calling.
- No hay soporte verificado de agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No hay modo de razonamiento explícito (thinking mode), visión ni audio.
- El único uso previsto documentado es servir como punto de partida para experimentos de arquitectura y pruebas de humo del código incluido.

## Casos de uso

- Pruebas de humo de arquitectura: ejecutar `python main.py --help` y el bloque `__main__` para verificar que el pipeline de definición del modelo, inicialización de pesos y forward pass funciona antes de escalar a un entrenamiento real.
- Investigación sobre variantes de Mixer: modificar `config.json` (fusión Tucker, tipo de normalización, activación) y comparar el comportamiento de la inicialización sin necesidad de un entrenamiento completo.
- Reproducción de recetas de entrenamiento: usar `training_args.json` como plantilla de RMSprop + OneCycle para lanzar experimentos controlados con semillas fijas.
- Baseline de capacidad mínima: servir como referencia de baja capacidad en comparaciones con modelos de clasificación entrenados, siempre que se entrene con el mismo presupuesto de datos y ajuste.
- Docencia y prototipado: ejemplo didáctico de cómo estructurar un repositorio de modelo (código, config, pesos, receta) en Hugging Face.
- Integración en pipelines de investigación: adaptar el código a un `AutoModel` personalizado mediante un adaptador explícito para incorporarlo a flujos de experimentación existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado que el checkpoint contiene 33.088 parámetros (del orden de decenas de kilobytes en fp32).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también es viable ejecutar en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de memoria (GTX 1050, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: no hay integración documentada con vLLM, llama.cpp, Ollama ni TGI; al ser una implementación personalizada, el despliegue requiere cargar `main.py` y los pesos con PyTorch.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| classification-slim (este) | 33.088 | no disponible | sin benchmarks | BSD-3-Clause | Hugging Face |
| Mixer original (MLP-Mixer, Tolstikhin et al.) | ~18M–430M según variante | no aplica (visión) | benchmarks de imagen publicados | código de investigación | paper + repositorios |
| Modelos de clasificación de texto tipo BERT-base | ~110M | 512 tokens | benchmarks GLUE/SuperGLUE publicados | Apache 2.0 / MIT según variante | Hugging Face |
| Modelos de clasificación pequeños tipo DistilBERT | ~66M | 512 tokens | benchmarks GLUE publicados | Apache 2.0 | Hugging Face |

La comparación es orientativa: `classification-slim` no es un modelo entrenado y no es directamente comparable en rendimiento con alternativas preentrenadas.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: los pesos son una inicialización y no producen predicciones útiles.
- No ha sido auditado para robustez, equidad ni transferencia de dominio.
- No hay información sobre sesgos, alucinación o comportamiento en producción porque no hay modelo funcional.
- No se han documentado idiomas soportados; no debe asumirse cobertura multilingüe.
- La licencia BSD-3-Clause permite uso comercial del código, pero el autor recomienda revisar por separado los términos de los datos de origen si se usa con datasets externos.
- Al ser una implementación personalizada, las APIs automáticas de Hugging Face no funcionan sin un adaptador explícito.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- Hugging Face: https://huggingface.co/yazeedalzahrani/classification-slim
