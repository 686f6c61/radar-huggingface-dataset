# Wathompson/mixer-experiment

## Resumen

`Wathompson/mixer-experiment` es un repositorio experimental de HuggingFace que contiene una implementación propia en PyTorch de una arquitectura tipo Mixer orientada a tareas de clasificación. El autor lo publica explícitamente como un artefacto para revisión de código, pruebas de humo (*smoke tests*) y experimentos controlados de pequeño tamaño, no como un modelo preentrenado listo para producción. El repositorio incluye el script `predict.py`, un `config.json` con los ajustes de arquitectura, un `training_args.json` con la receta de experimento por defecto y un `model.safetensors` que, según la propia model card, es únicamente un punto de inicialización válido y no un checkpoint entrenado ni evaluado.

El dato más relevante es la discrepancia entre la etiqueta de escala declarada y el tamaño real: la model card describe la configuración como *giant*, pero el recuento de parámetros de los pesos publicados en `safetensors` es de 24.832 parámetros totales (aproximadamente 0,025 millones). Es decir, el checkpoint publicado es varios órdenes de magnitud más pequeño que cualquier modelo de clasificación habitual, lo que refuerza su naturaleza de esqueleto de código y no de modelo funcional. La arquitectura declarada combina atención lineal, fusión de bajo rango, activación ReLU y normalización RMSNorm.

El interés de esta ficha es, por tanto, acotado: sirve como referencia para quien quiera inspeccionar una implementación *custom* de Mixer, comprobar el flujo de carga de pesos en formato `safetensors` o usar el repositorio como plantilla de experimentación. No hay resultados de benchmarks, ni idiomas declarados, ni pipeline de inferencia asociado, y el repositorio no registra descargas ni *likes* en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixer (implementación propia en PyTorch) con atención lineal y fusión de bajo rango |
| Parametros totales | 24.832 (según recuento real de `model.safetensors`); la model card etiqueta la escala como "giant" |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica un checkpoint de inicialización en `safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`); código en Python/PyTorch (`predict.py`) |
| Normalizacion | RMSNorm |
| Activacion | ReLU |
| Fusion | low rank |
| Receta de entrenamiento por defecto | RMSprop con *constant warmup* (valores de partida del script, no evidencia de un entrenamiento completado) |
| Pipeline de HuggingFace | no disponible |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura declarada es un Mixer, es decir, una familia de modelos que sustituyen los bloques de autoatención por operaciones de mezcla (típicamente mezclas por tokens y por canales) y que se han popularizado como alternativa a los transformers para visión y clasificación. En esta implementación concreta, la model card especifica atención lineal, fusión de bajo rango, activación ReLU y normalización RMSNorm. No se detalla el número de capas, la dimensión oculta, el número de canales de mezcla ni el tamaño de entrada esperado; esos datos estarían en `config.json`, pero su contenido no se ha facilitado.

En cuanto al entrenamiento, no hay evidencia de que se haya completado ninguno. La receta incluida usa RMSprop con un esquema de *constant warmup*, y la propia documentación aclara que son valores de partida del script y no resultados de una ejecución. No se indica número de tokens, composición del dataset, ni uso de RLHF, DPO u otras técnicas de alineamiento. El archivo `model.safetensors` se presenta explícitamente como un checkpoint de inicialización válido para pruebas de humo, no como un modelo entrenado ni auditado. Tampoco se documentan innovaciones adicionales como decodificación especulativa o mecanismos de atención alternativa más allá de la atención lineal declarada.

## Capacidades

- No hay capacidades de generación de texto, razonamiento, código o matemáticas documentadas. El modelo está etiquetado para clasificación, pero no se aporta ninguna tarea concreta ni métrica.
- No se declara soporte de *tool calling* ni de *function calling*.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües ni lista de idiomas.
- No se declaran capacidades especiales (modo *thinking*, visión, audio, decodificación especulativa).
- Capacidad real verificable: servir como esqueleto ejecutable de una arquitectura Mixer, con punto de entrada en `predict.py` y un `__main__` que genera un ejemplo de prueba de humo.
- Capacidad real verificable: carga de pesos en formato `safetensors` mediante un adaptador explícito. La model card advierte de que, al ser una implementación *custom*, las APIs genéricas de carga automática requieren un adaptador antes de poder usarse.

## Casos de uso

- Revisión de código de arquitecturas Mixer: el repositorio permite inspeccionar cómo se implementan atención lineal, fusión de bajo rango, ReLU y RMSNorm en un mismo bloque, y comparar el estilo con implementaciones de referencia.
- Pruebas de humo de pipelines de entrenamiento: `training_args.json` y `predict.py` permiten verificar que un *launcher* de experimentos arranca, instancia el modelo y ejecuta una iteración sin errores antes de lanzar entrenamientos costosos.
- Pruebas de integración de `safetensors`: el checkpoint de inicialización sirve para validar el flujo de serialización, carga y mapeo de pesos en herramientas internas, sin necesidad de descargar gigabytes de pesos.
- Plantilla para experimentos controlados: la propia model card recomienda evaluar con un *split* etiquetado específico de la tarea, al menos tres semillas y una línea base de capacidad comparable; el repositorio sirve como punto de partida para ese diseño experimental.
- Docencia y formación: útil para explicar en un aula o taller la diferencia entre un repositorio de código de arquitectura y un modelo entrenado, así como el papel de los checkpoints de inicialización.
- Validación de adaptadores de carga: dado que las APIs automáticas de HuggingFace no cargan implementaciones *custom* sin adaptador, este repositorio es un caso de prueba útil para desarrollar y verificar ese adaptador.
- Comparación de líneas base en investigación metodológica: sirve como ejemplo de configuración "sin entrenar" frente a la que contrastar el efecto real del entrenamiento y de la selección de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Con 24.832 parámetros, los pesos ocupan del orden de decenas de kilobytes en precisión completa, por lo que el modelo cabe en memoria de CPU sin dificultad.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (por ejemplo, una RTX 3060 o inferior) o incluso ejecución exclusiva en CPU es suficiente.
- Cabe en GPU consumer: sí, con un consumo de memoria despreciable; el cuello de botella sería el *overhead* del framework, no los pesos.
- Opciones de despliegue: PyTorch directamente a través de `predict.py`. No hay evidencia de compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al tratarse de una implementación *custom* se necesitaría un adaptador explícito para APIs de carga automática.
- Latencia y throughput estimados: no disponible. Al no existir checkpoint entrenado ni pipeline declarado, no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wathompson/mixer-experiment | 24.832 (checkpoint de inicialización) | no disponible | Sin benchmarks publicados | MIT | Repositorio HuggingFace con 0 descargas y 0 likes |
| MLP-Mixer (referencia conceptual) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| gMLP (referencia conceptual) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| FNet (referencia conceptual) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa no es posible con los datos disponibles. Conceptualmente, `mixer-experiment` se sitúa en la misma familia que MLP-Mixer, gMLP o FNet, que sustituyen la autoatención por esquemas de mezcla más baratos computacionalmente, pero a diferencia de esas propuestas no existe aquí un checkpoint entrenado ni resultados publicados que permitan situarlo en ninguna escala de rendimiento.

## Limitaciones y advertencias

- El checkpoint publicado no ha sido entrenado. Cualquier inferencia produce salidas sin valor semántico; no debe usarse para clasificación real.
- La model card advierte de que el checkpoint no ha sido auditado en robustez, equidad ni transferencia de dominio.
- Existe una discrepancia entre la etiqueta de escala "giant" y el recuento real de 24.832 parámetros. Cualquier expectativa de capacidad basada en esa etiqueta es incorrecta.
- No hay información sobre sesgos, porque no hay datos de entrenamiento documentados.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, ya que no hay capacidades generativas declaradas; el riesgo equivalente es interpretar el repositorio como un modelo listo para producción.
- No se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingüe ni monolingüe concreta.
- No se especifica longitud de contexto, de modo que no puede planificarse ningún caso de uso que dependa de ventanas largas.
- Licencia MIT: permite uso comercial y modificación, pero la propia model card recuerda revisar por separado los términos de los datos de origen si se combina con datasets externos.
- Al ser una implementación *custom*, no funciona con APIs de carga automática sin un adaptador explícito; esto añade trabajo de integración antes de cualquier uso.
- No hay pipeline de HuggingFace declarado, ni métricas, ni logs de entrenamiento publicados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Wathompson/mixer-experiment
- No se han encontrado enlaces relevantes al modelo (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo ni con arquitecturas Mixer.
