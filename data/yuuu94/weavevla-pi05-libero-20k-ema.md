# yuuu94/WeaveVLA-pi05-LIBERO-20k-EMA

## Resumen

WeaveVLA-pi05-LIBERO-20k-EMA es un checkpoint de pesos en PyTorch publicado por el usuario yuuu94 en Hugging Face. Se trata de la exportación de los parámetros correspondientes a la media móvil exponencial (EMA) del paso 20.000 de un proceso de ajuste fino sobre el benchmark LIBERO, partiendo del modelo base π₀.₅ (pi-zero-point-five) dentro del proyecto denominado GraphVLA / WeaveVLA.

El modelo pertenece a la categoría de vision-language-action (VLA): sistemas que combinan percepción visual, comprensión del lenguaje y generación de acciones motoras para controlar robots manipuladores. El ajuste sobre LIBERO sugiere que está especializado en tareas de manipulación de objetos en entornos simulados, un benchmark estándar para evaluar políticas robóticas generalistas.

La relevancia de esta publicación es limitada y muy específica: no es un modelo autónomo ni un paquete listo para usar, sino un artefacto intermedio de un pipeline de entrenamiento. El propio autor advierte que el checkpoint requiere el runtime de inferencia GraphVLA π₀.₅, el tokenizador correspondiente y las estadísticas de normalización del entrenamiento. No se dispone de model card técnica, licencia, idiomas ni resultados de evaluación publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π₀.₅ (GraphVLA / WeaveVLA); detalles internos no disponibles |
| Parametros totales | No disponible (el fichero `ema_20000.pt` ocupa 13.460.970.655 bytes, ~13,5 GB en fp32, lo que sugiere un orden de magnitud de miles de millones de parámetros, pero el dato exacto no está publicado) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en PyTorch nativo, presumiblemente fp32) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`.pt`), fichero único `ema_20000.pt` con SHA-256 `664a1c96485162e80131f078adc9a0e172623b6cce93a3ef7c5d00c51dd732e3` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su adscripción a la familia π₀.₅ dentro del proyecto GraphVLA / WeaveVLA. Por la nomenclatura y el dominio de aplicación, se trata de un modelo de tipo vision-language-action que procesa observaciones visuales e instrucciones en lenguaje natural para producir acciones de control robótico. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni el encoder visual empleado.

El checkpoint corresponde a los parámetros EMA en el paso 20.000 de un ajuste fino sobre LIBERO. La media móvil exponencial es una técnica habitual para estabilizar el entrenamiento y producir pesos finales más robustos que los del último paso bruto. No se han publicado datos sobre el volumen de tokens, la composición del dataset de ajuste, el uso de RLHF/DPO ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). El autor indica explícitamente que el checkpoint no es autónomo: requiere el runtime de inferencia GraphVLA π₀.₅, el tokenizador y las estadísticas de normalización del entrenamiento para funcionar correctamente.

## Capacidades

- Control robótico de manipulación: generación de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural, orientado al benchmark LIBERO.
- Percepción visual integrada: el modelo consume imágenes del entorno como entrada, propio de la familia VLA.
- Comprensión de instrucciones en lenguaje natural para condicionar la política de actuación.
- Ajuste específico a tareas de LIBERO (manipulación de objetos en simulación).
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni capacidades multilingües explícitas.
- No se ha documentado generación de texto general, razonamiento simbólico, código ni matemáticas como capacidades del modelo.

## Casos de uso

- Investigación en manipulación robótica simulada: servir como punto de partida o referencia para reproducir resultados de ajuste fino sobre LIBERO en el paso 20.000 con parámetros EMA, útil para comparar estabilidad de entrenamiento frente a pesos brutos.
- Evaluación de políticas VLA en entornos LIBERO: cargar el checkpoint con el runtime GraphVLA π₀.₅ y medir tasas de éxito en las suites de tareas de LIBERO, siempre que se disponga de las estadísticas de normalización originales.
- Reproducibilidad de experimentos: el hash SHA-256 publicado permite verificar la integridad del artefacto en pipelines de investigación y comparar ejecuciones entre máquinas.
- Ajuste fino posterior (fine-tuning continuado): al ser pesos PyTorch, pueden utilizarse como inicialización para nuevos ajustes sobre variantes de LIBERO u otros benchmarks de manipulación, sujeto a disponer del código de entrenamiento GraphVLA.
- Estudio de la técnica EMA en entrenamiento de políticas robóticas: comparar el comportamiento de `ema_20000.pt` con los pesos no promediados del mismo paso para analizar el efecto de la media móvil en la robustez de la política.
- Integración en pipelines de simulación a gran escala: desplegar el modelo dentro de entornos de simulación física para generar trayectorias de demostración o datos sintéticos de entrenamiento, siempre con el runtime específico del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa ~13,5 GB en el fichero `.pt`; en fp32 se necesita al menos esa cantidad de memoria para cargar los pesos, más el overhead del runtime, del encoder visual y de los buffers de activación. Estimar un mínimo práctico de 16-24 GB de VRAM, aunque el dato exacto no está publicado.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del artefacto, GPUs de clase数据中心 (A100 40/80 GB, H100, L40S) son las candidatas naturales; una RTX 4090 (24 GB) podría ser suficiente para inferencia en fp32 ajustada, pero no está confirmado.
- Compatibilidad con GPU de consumo: incierta; probablemente viable en RTX 4090 o RTX 3090 (24 GB) si el runtime lo permite, no así en GPUs de 8-12 GB sin cuantización, que no está documentada.
- Opciones de despliegue: el autor exige el runtime de inferencia GraphVLA π₀.₅ junto con el tokenizador y las estadísticas de normalización. No se ha documentado compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeaveVLA-pi05-LIBERO-20k-EMA | VLA (π₀.₅ / GraphVLA) | No disponible (~13,5 GB en pesos) | No disponible | No disponible | Hugging Face, requiere runtime propietario del proyecto |
| π₀.₅ (modelo base, Physical Intelligence) | VLA | No disponible en esta ficha | No disponible | No disponible | Referencia nominal; no se dispone de datos verificados en la información proporcionada |
| OpenVLA | VLA | ~7B (dato de conocimiento general, no verificado en esta búsqueda) | No disponible | No disponible | Público en Hugging Face |
| RT-2 / RT-X (Google DeepMind) | VLA | No disponible | No disponible | No disponible | No disponible públicamente en su mayoría |

No se dispone de datos verificados de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada; la comparación debe tomarse como orientativa y sujeta a verificación.

## Limitaciones y advertencias

- Checkpoint no autónomo: requiere el runtime de inferencia GraphVLA π₀.₅, el tokenizador y las estadísticas de normalización del entrenamiento. Sin ellos, los pesos no son utilizables.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; tratar como uso restringido hasta verificar con el autor.
- Ausencia de model card técnica: no hay información sobre sesgos, datos de entrenamiento, evaluación ni limitaciones declaradas por el autor.
- Especialización estrecha: ajustado específicamente sobre LIBERO; su rendimiento fuera de ese benchmark o en robots reales no está documentado.
- Riesgo de sobreajuste al simulador: los modelos ajustados en LIBERO pueden no transferir bien al mundo real (gap sim-to-real), aunque este extremo no se ha evaluado en la información disponible.
- Riesgo de alucinación y comportamientos erráticos: inherente a las políticas VLA; no hay evaluaciones publicadas que cuantifiquen la fiabilidad.
- Idiomas: no se ha documentado qué lenguas entiende el modelo; asumir que las instrucciones en castellano no están garantizadas.
- Procedencia y mantenimiento: repositorio con 0 descargas y 0 likes, publicado por un usuario individual; sin garantías de soporte, actualización ni corrección de errores.
- Integridad: verificar el SHA-256 (`664a1c96...`) antes de cargar los pesos en producción o en experimentos reproducibles.

## Enlaces

- Hugging Face: https://huggingface.co/yuuu94/WeaveVLA-pi05-LIBERO-20k-EMA
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos del proyecto GraphVLA / WeaveVLA.
