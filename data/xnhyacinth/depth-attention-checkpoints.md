# Xnhyacinth/Depth-Attention-Checkpoints

## Resumen

Depth-Attention-Checkpoints es un repositorio de pesos de investigación publicado por el usuario Xnhyacinth en Hugging Face. Contiene el checkpoint final (paso 50.000 de 50.000) de un experimento histórico de arquitectura denominada "Depth-Attention", un transformer causal de tipo Llama con 463.749.120 parámetros almacenados en 356 tensores FP32 y un vocabulario de 50.277 tokens. El autor lo etiqueta como un modelo "410M" por convención histórica del experimento, aunque el recuento real de parámetros es superior.

No se trata de un modelo listo para producción ni para inferencia directa: los pesos requieren una implementación personalizada de Depth-Attention (incluido su comportamiento específico de normalización de query/key y de salida) que no se distribuye en el repositorio. El tokenizador de texto correspondiente (50.277 tokens) y el cargador personalizado tampoco están incluidos, y el autor advierte explícitamente de que no se debe sustituir por el tokenizador placeholder original.

Su relevancia es puramente investigadora: documenta un punto final de entrenamiento reproducible (exportación de pesos byte a byte idéntica al histórico, con SHA-256 verificado) para quienes estudien variantes de atención. No hay pipeline declarado, ni idiomas documentados, ni resultados de benchmarks, ni pruebas de generación de texto o inferencia en GPU realizadas durante la publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con atención "Depth-Attention" personalizada (config declara `LlamaForCausalLM`, compatibilidad con Transformers estándar no establecida) |
| Parametros totales | 463.749.120 (356 tensores FP32) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | other (sin licencia global asertada; revisar términos aplicables antes de redistribuir) |
| Formato de pesos | safetensors (FP32), más configuraciones de modelo y generación registradas |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con una variante de atención denominada Depth-Attention, que según el autor modifica el comportamiento de normalización de query/key y de salida respecto a una implementación Llama estándar. El repositorio incluye la configuración del modelo y de generación registradas, pero no la implementación del mecanismo de atención ni el cargador personalizado necesarios para ejecutar los pesos. El vocabulario es de 50.277 tokens.

El entrenamiento registrado alcanzó 50.000 de 50.000 pasos; se trata del punto final completado del experimento, no de un checkpoint seleccionado por mejor rendimiento. No se incluyen estado del optimizador, scheduler, RNG, estado del trainer ni checkpoint reanudable. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla ninguna innovación adicional como decodificación especulativa o atención lineal.

## Capacidades

- No se ha verificado ninguna capacidad funcional: el autor indica que no se probó ni la generación de texto ni la inferencia en GPU durante la publicación.
- Los pesos no constituyen por sí solos un paquete completo de inferencia de texto: faltan el tokenizador de 50.277 tokens y el cargador personalizado.
- No hay evidencia documentada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión o audio.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidad especial: el interés reside en el mecanismo Depth-Attention como objeto de estudio, no en un modo de razonamiento o "thinking mode" documentado.

## Casos de uso

- Investigación sobre mecanismos de atención: el checkpoint permite reproducir y analizar el comportamiento de Depth-Attention (normalización de query/key y de salida) comparándolo con atención Llama estándar, siempre que se disponga de la implementación personalizada.
- Reproducibilidad de experimentos: el SHA-256 del archivo (`1b5b9be7e3744417be24517d7095538a17baa62e0bac59c114ed5fc0f4d2aa44`) y la verificación de estructura safetensors permiten validar que los pesos descargados coinciden con la exportación histórica.
- Estudio de curvas de entrenamiento a escala pequeña: con 463,7 M de parámetros y 50.000 pasos registrados, sirve como punto final de referencia en experimentos académicos de bajo presupuesto.
- Auditoría de empaquetado de checkpoints: útil como caso práctico de publicación de pesos sin tokenizador ni cargador, para discutir buenas prácticas de empaquetado reproducible en investigación.
- Desarrollo de cargadores y tooling: quien implemente el cargador personalizado de Depth-Attention puede usar este repositorio como conjunto de pesos de validación estructural (356 tensores, vocabulario de 50.277).
- Docencia sobre arquitecturas transformer: ejemplo concreto de variante de atención con configuración declarada pero sin compatibilidad garantizada con Transformers estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable; como referencia aritmética, 463,7 M de parámetros en FP32 ocupan aproximadamente 1,85 GB solo en pesos (el repositorio pesa 1,9 GB), a los que habría que sumar activaciones, caché KV y overhead del runtime, cantidades no documentadas.
- GPU recomendadas: no disponible; no se realizaron pruebas de inferencia en GPU durante la publicación.
- Compatibilidad con GPU de consumo: no verificada. Por tamaño de pesos, cabría en GPUs de consumo con suficiente VRAM, pero la falta de implementación y de tokenizador impide confirmarlo.
- Opciones de despliegue: no disponible. No se ha establecido compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con Transformers estándar; se requiere la implementación personalizada de Depth-Attention.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Depth-Attention-Checkpoints (este) | 463.749.120 | no disponible | other (sin licencia global) | Pesos safetensors FP32; sin tokenizador ni cargador | Checkpoint de investigación, no listo para inferencia |
| Llama 3.2 1B (referencia de la familia declarada en config) | ~1.240 M | 128K (según documentación pública de Meta) | Llama 3.2 Community License | Pesos y tokenizador completos, ecosistema amplio | Comparable solo por familia arquitectónica declarada; este checkpoint es menor y no ejecutable directamente |
| no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de información de benchmarks ni de otros checkpoints Depth-Attention para comparar |

## Limitaciones y advertencias

- No es un paquete listo para ejecutar: faltan el tokenizador de 50.277 tokens y el cargador personalizado; el tokenizador placeholder original se excluyó intencionadamente y no debe usarse como sustituto.
- Requiere la implementación personalizada de Depth-Attention, incluida su normalización de query/key y de salida; la compatibilidad con Transformers estándar no está establecida pese a que la config declare `LlamaForCausalLM`.
- No se probó generación de texto ni inferencia en GPU durante la publicación; cualquier evaluación de calidad es responsabilidad del usuario.
- Licencia "other" sin licencia global asertada: es necesario revisar los términos aplicables antes de cualquier redistribución o uso comercial.
- Sin datos de sesgos, alucinación, idiomas o contexto: no hay información para evaluar riesgos de sesgo o robustez.
- No incluye estado de optimizador, scheduler, RNG ni checkpoint reanudable, por lo que no permite reanudar el entrenamiento.
- El checkpoint es el punto final de 50.000 pasos, no un mejor checkpoint seleccionado; su calidad relativa no está documentada.
- El número de descargas (19) y de likes (0) indica una adopción muy baja; no hay comunidad ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/Xnhyacinth/Depth-Attention-Checkpoints
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
