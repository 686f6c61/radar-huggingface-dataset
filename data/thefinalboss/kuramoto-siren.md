# thefinalboss/kuramoto-siren

## Resumen

Kuramoto-SIREN es un repositorio de código publicado por el usuario `thefinalboss` en HuggingFace que propone una arquitectura neuronal experimental que sustituye por completo el paradigma de los Transformers por un sustrato basado en sincronización de osciladores de Kuramoto, capas SIREN (sinusoidales), un tokenizador sin vocabulario (HTP) y un entrenamiento por alineación contrastiva en lugar de softmax y entropía cruzada. El autor defiende un cambio de paradigma: de distribuciones de probabilidad a paisajes de energía.

El repositorio contiene scripts de entrenamiento, documentación y una calculadora de escalado, pero no incluye pesos de modelo entrenados. La model card describe un modelo de 1.15 mil millones de parámetros que se entrenaría en 18.4 mil millones de tokens en 8× A100, con una gramática reportada del 35-50%, aunque estos datos son proyecciones teóricas y no resultados verificados de un modelo real. La relevancia actual es nula para producción, pero puede interesar a investigadores que exploran arquitecturas alternativas y procesamiento sin atención.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SIREN (sinusoidal) + acoplador de Kuramoto + tokenizador HTP + alineación contrastiva (no transformer) |
| Parametros totales | no disponible (el repositorio no publica pesos; la card menciona un modelo 1B con 1.15B, pero sin confirmación) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (según la model card, no confirmado en los metadatos de HuggingFace) |
| Formato de pesos | no disponible (repositorio de código fuente en Python, sin archivos de pesos) |

## Arquitectura y entrenamiento

La arquitectura propuesta reemplaza el mecanismo de atención por un acoplamiento entre osciladores de Kuramoto con conectividad de anillo y vecindad K=4, que introduce interacciones de dos y tres cuerpos para el enlace compositivo. Las capas SIREN usan la activación `sin(ω₀(Wx+b)+φ)` con frecuencia y fase aprendibles, y el tokenizador HTP asigna a cada token un vector unitario de 64 dimensiones mediante hash sin tabla de vocabulario, ahorrando alrededor de 200 millones de parámetros respecto a una tabla de embeddings de 50K tokens. El entrenamiento se realiza con una función de pérdida contrastiva que maximiza la alineación entre el contexto y el candidato correcto y la minimiza con el incorrecto, con un margen de 0.5.

La model card describe un entrenamiento experimental v7 con 50 épocas y 3000 muestras que alcanzó un 12% de gramática en 238 segundos, frente al 6.4% de una versión anterior con Transformer+SIREN en 2765 segundos. También se menciona una proyección para un modelo de 1.15B con 18.4B tokens en 8×A100 durante 48 horas, con una gramática estimada del 35-50%, pero estos números no se han validado externamente ni se han publicado pesos.

## Capacidades

- Generación de texto: no hay evidencia de que el modelo genere texto coherente; solo se reporta un porcentaje de gramática en un experimento sintético.
- Razonamiento: no se han demostrado capacidades de razonamiento.
- Código: no hay soporte para generación de código.
- Matemáticas: no hay resultados.
- Vision: no disponible.
- Tool calling / function calling: no disponible.
- Agentes y multi-step reasoning: no disponible.
- Multilingüe: no hay información.
- Otras capacidades: el repositorio incluye scripts de entrenamiento y una calculadora de escalado, pero no ofrece un modelo funcional para tareas reales.

## Casos de uso

- Investigación en arquitecturas alternativas: el código puede servir como base para experimentos académicos sobre sustitución de la atención por osciladores de Kuramoto y capas sinusoidales.
- Estudio de tokenización sin vocabulario: el HTPTokenizer es un ejemplo de representación hash para tokens, útil para proyectos que buscan reducir el tamaño de los embeddings.
- Análisis de entrenamiento por alineación contrastiva: la pérdida propuesta puede interesar para investigar métodos de optimización sin softmax.
- Comparación de paradigmas: los scripts permiten reproducir el experimento v7 (12% de gramática) y comparar con versiones anteriores.
- Simulación de escalado: la calculadora de escalado (scale_calculator.py) puede usarse para estimar recursos de un modelo 1B.
- Prototipo de entrenamiento en CPU: el script train_1b_alignment.py ofrece una demo de entrenamiento en CPU, útil para docencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas internas de gramática en un experimento sintético (v7: 12% en 238s; proyección 1B: 35-50% en ~48h), sin comparación con modelos de referencia. No hay evidencia de que el modelo haya sido evaluado en tareas reales.

## Requisitos de hardware

- No aplica: no hay pesos publicados, por lo que no se puede ejecutar inferencia.
- El entrenamiento del modelo 1B hipotético requeriría 8×A100-80GB según la card, con un consumo de memoria de ~3.9 GB por GPU.
- Los scripts de entrenamiento v7 pueden ejecutarse en CPU (el autor reporta 238s para 50 épocas con 3000 muestras).
- No hay opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no existe un modelo serializado.

## Comparativa con modelos similares

No disponible. No hay modelos comparables con esta arquitectura experimental. Los Transformers tradicionales (GPT, LLaMA) no son equivalentes en diseño ni en rendimiento, y no se han publicado datos comparativos.

## Limitaciones y advertencias

- El repositorio no contiene pesos entrenados; solo código fuente y scripts de entrenamiento.
- Los resultados de gramática (12% y 35-50%) provienen de experimentos internos sin validación externa ni replicación.
- La arquitectura no ha sido probada en tareas del mundo real (generación de texto, razonamiento, código).
- La licencia MIT está indicada en la model card, pero no está verificada en los metadatos oficiales de HuggingFace (aparece como "no disponible").
- No hay garantías de que el modelo funcione correctamente en producción; es un repositorio de investigación.
- La tokenización por hash puede tener colisiones y pérdida de información semántica.
- El entrenamiento por alineación contrastiva no garantiza convergencia en tareas complejas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/thefinalboss/kuramoto-siren
- Otros repositorios del autor: https://huggingface.co/thefinalboss/ensemble (proyecto ENSEMBLE, entrenamiento sin GPU)
- Búsqueda web relacionada: [New AI Model Releases](https://benchlm.ai/model-updates), [CivArchive](https://civitaiarchive.com/), [GitHub topics kuramoto-model](https://github.com/topics/kuramoto-model) (no se han encontrado papers ni blogs oficiales del modelo).
