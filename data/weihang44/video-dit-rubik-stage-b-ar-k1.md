# weihang44/video-dit-rubik-stage-b-ar-k1

## Resumen

Video DiT — Stage B, variante autorregresiva k=1 (AR-k1), es un archivo de puntos de control de investigación publicado por el usuario weihang44 en HuggingFace. Está diseñado para la generación de vídeo de un cubo de Rubik 2x2 de tres caras con cámara fija, y se distribuye como una base exclusivamente de vídeo: no incorpora condicionamiento por estado vectorial ni pérdida auxiliar de estado. El modelo recibe el fotograma frontal inicial y un prompt de lenguaje completo de nueve acciones, y genera veinte fotogramas latentes futuros. En la variante autorregresiva utiliza la historia visual generada en inferencia, mientras que las variantes bidireccionales desruidifican los veinte fotogramas latentes futuros de forma conjunta.

La arquitectura es un Diffusion Transformer (DiT) de vídeo con rectified flow, con 3D RoPE, dimensión de cabeza 64, SwiGLU, 16 canales latentes, parches latentes (1,2,2) y características de lenguaje cacheadas de 768 dimensiones. El repositorio cubre siete escalas de generador, desde 19.698.448 parámetros (XS) hasta 938.377.232 parámetros (XXL), con anchura, profundidad y número de cabezas crecientes. La relevancia actual del lanzamiento es doble: por un lado, sirve de material para estudiar leyes de escalado en generación de vídeo; por otro, permite comparar estrategias de decodificación autorregresiva frente a bidireccional sobre una tarea controlada.

El repositorio ocupa 191,0 GB y contiene 273 puntos de control planificados, con la carga todavía en curso hasta que `manifest.json` indique `complete: true`. No incluye el VAE congelado de Wan2.1, los activos de ModernBERT/action-token, los datos ni el código ejecutable de entrenamiento e inferencia. La model card advierte explícitamente de que se trata de un archivo de puntos de control y no de una afirmación de que todos los modelos hayan convergido o resuelvan de forma fiable tareas del cubo de Rubik.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de vídeo con rectified flow; 3D RoPE, dimensión de cabeza 64, SwiGLU, 16 canales latentes, parches latentes (1,2,2) |
| Parámetros totales | No disponible como cifra única; siete variantes de 19.698.448 (XS) a 938.377.232 (XXL) parámetros |
| Parámetros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible en el sentido de ventana de LLM; el modelo parte de un fotograma frontal inicial y un prompt de nueve acciones, y genera 20 fotogramas latentes futuros |
| Tipos de cuantización | No disponible; se distribuyen pesos en precisión nativa, sin recetas de cuantización |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible; la model card indica que esta publicación no especifica ninguna concesión de licencia nueva |
| Formato de pesos | PyTorch `.pt` (`model_state_dict` y `ema_parameter_state`), con `.metadata.json` por punto de control y `manifest.json` global |
| Variante del repositorio | Stage B, autorregresiva con k=1 (AR-k1) |
| Dimensiones del prompt de lenguaje | Características cacheadas de 768 dimensiones |
| Componentes externos requeridos | VAE congelado de Wan2.1, activos de ModernBERT/action-token y código nativo de entrenamiento e inferencia (no incluidos) |
| Tamaño del repositorio | 191,0 GB |
| Puntos de control planificados | 273 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer para vídeo entrenado con rectified flow. Todos los tamaños comparten 3D RoPE, dimensión de cabeza 64, activaciones SwiGLU, 16 canales latentes, parches latentes con forma (1,2,2) y características de lenguaje cacheadas de 768 dimensiones. La variante de este repositorio es autorregresiva con k=1: consume la historia visual generada durante la inferencia, mientras que las variantes bidireccionales desruidifican los 20 fotogramas latentes futuros de forma conjunta. El condicionamiento se limita al fotograma frontal inicial y a un prompt de lenguaje de nueve acciones; no hay condicionamiento por estado vectorial ni pérdida auxiliar de estado.

| Modelo/formato | Parámetros del generador | Anchura | Capas | Cabezas | Vídeos de entrenamiento guardados |
|---|---:|---:|---:|---:|---:|
| XS | 19.698.448 | 384 | 8 | 6 | 8.000.000 |
| S | 33.449.488 | 448 | 10 | 7 | 8.000.000 |
| M | 67.814.416 | 640 | 10 | 10 | 8.000.000 |
| B | 115.788.304 | 768 | 12 | 12 | 8.000.000 |
| L | 271.760.656 | 1088 | 14 | 17 | 8.000.000 |
| XL | 548.147.088 | 1408 | 17 | 22 | 8.000.000 |
| XXL | 938.377.232 | 1792 | 18 | 28 | 8.000.000 |

Las cifras de la tabla corresponden a exposición real de entrenamiento, no al presupuesto solicitado. En concreto, Stage-B Bidir L y XL se detuvieron antes de los 8M, y no se inventan puntos de control de 8M no guardados. Cada archivo lateral de punto de control contiene su arquitectura exacta, exposición de entrenamiento, metadatos de representación, estadísticas de normalización y protocolo de entrenamiento.

El calendario de entrenamiento usa calentamiento lineal seguido de una tasa de aprendizaje constante de 4e-4, con calentamiento sobre 16.384 vídeos. El lote efectivo es de 16 vídeos y cada uno aporta 5.120 tokens de parche objetivo futuro. AdamW usa betas (0,9, 0,95), epsilon 1e-8 y decaimiento de peso 0,05; el recorte de gradiente es 1,0 y el decaimiento de EMA es 0,9999. La semilla de entrenamiento es 20260727. Se emplea historia limpia forzada por el profesor para la variante autorregresiva y una actualización del optimizador por lote efectivo. La continuación de Stage-B usa segmentos de datos nuevos y disjuntos en lugar de repetir épocas.

## Capacidades

- Generación de vídeo de un cubo de Rubik 2x2 de tres caras con cámara fija, produciendo 20 fotogramas latentes futuros.
- Condicionamiento por prompt de lenguaje: interpreta una descripción completa de nueve acciones.
- Condicionamiento visual inicial: parte del fotograma frontal de la secuencia.
- Decodificación autorregresiva (k=1) que reutiliza la historia visual generada durante la inferencia.
- Modo bidireccional alternativo (en los puntos de control correspondientes), que desruidifica los 20 fotogramas futuros de forma conjunta.
- Modelado generativo con rectified flow, propio de la familia de modelos de difusión para vídeo.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (en).
- No incluye modo de pensamiento, entrada de audio ni entrada de vídeo arbitraria.

## Casos de uso

- Investigación en leyes de escalado de generación de vídeo: las siete variantes (XS a XXL) comparten protocolo y arquitectura, por lo que permiten estudiar cómo escala la calidad con 19,7M a 938,4M de parámetros sobre una tarea idéntica.
- Comparación entre decodificación autorregresiva y bidireccional: la variante AR-k1 de este repositorio puede contrastarse con los puntos de control bidireccionales de la misma release para medir la deriva acumulada frente a la coherencia global.
- Reproducción de rectified flow en vídeo: el archivo incluye estados del optimizador, estados RNG por rango y metadatos de protocolo, lo que facilita reanudar o auditar el entrenamiento con las mismas condiciones.
- Generación de datos sintéticos de vídeo: puede emplearse para producir secuencias etiquetadas de movimientos de cubo, útiles como datos aumentados para modelos de visión que estimen estados del cubo.
- Estudio de condicionamiento por lenguaje de acciones: el prompt de nueve acciones permite analizar la fidelidad con que un DiT sigue instrucciones simbólicas discretas en lugar de descripciones en lenguaje natural libre.
- Base para investigación de arquitecturas DiT: al no incluir estado vectorial ni pérdida auxiliar, sirve como línea base limpia sobre la que añadir nuevos condicionamientos y medir su aportación.
- Evaluación de eficiencia de entrenamiento a gran escala: la exposición real de 8.000.000 de vídeos por variante permite analizar el coste de escalar anchura, profundidad y cabezas.
- Análisis de la interacción con el VAE de Wan2.1: aunque el VAE no se distribuye, los puntos de control dependen de él, lo que lo convierte en un caso de estudio de dependencias entre componentes congelados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta exposición de entrenamiento (8.000.000 de vídeos por variante, con L y XL bidireccionales detenidos antes de esa cifra) y advierte de que el archivo no afirma que los modelos hayan convergido ni que resuelvan de forma fiable tareas del cubo de Rubik.

## Requisitos de hardware

- Almacenamiento de pesos orientativo (solo parámetros del generador, sin estados del optimizador):

| Variante | Pesos en fp32 | Pesos en fp16/bf16 | Con copia EMA en fp32 |
|---|---:|---:|---:|
| XS | ~79 MB | ~39 MB | ~158 MB |
| S | ~134 MB | ~67 MB | ~268 MB |
| M | ~271 MB | ~136 MB | ~542 MB |
| B | ~463 MB | ~232 MB | ~926 MB |
| L | ~1,09 GB | ~544 MB | ~2,17 GB |
| XL | ~2,19 GB | ~1,10 GB | ~4,39 GB |
| XXL | ~3,75 GB | ~1,88 GB | ~7,51 GB |

- Los archivos `*/recovery/` añaden el estado del optimizador AdamW (dos momentos) y los estados RNG por rango, por lo que su huella en disco y en memoria es aproximadamente el triple de la de los pesos en fp32.
- La memoria de activaciones es el factor dominante y no está documentada: un DiT de vídeo que desruidifica 20 fotogramas latentes con 16 canales exige mucha más VRAM que la ocupada por los pesos, especialmente en las variantes XL y XXL. No se dispone de cifras oficiales de VRAM total.
- Las variantes XS, S, M y B (de 19,7M a 115,8M de parámetros) caben con holgura en GPUs de consumo tipo RTX 4090 o RTX 3090 en términos de pesos; el cuello de botella será la activación durante la difusión de vídeo.
- Las variantes L, XL y XXL se orientan a GPUs de centro de datos como A100 o H100, sin que la model card especifique configuraciones exactas.
- No hay soporte de vLLM, llama.cpp, Ollama ni TGI: el modelo no es un punto de control de Transformers ni de Diffusers y requiere el generador nativo exacto, que no se incluye en el repositorio.
- Para evaluar con EMA hay que sustituir los parámetros con nombre del estado crudo conservando los buffers; cargar únicamente los pesos crudos no aplica la EMA de forma automática.
- Los archivos de recuperación completos contienen objetos RNG de NumPy y pueden requerir `torch.load(..., weights_only=False)`.
- No se publican cifras de latencia ni de rendimiento (throughput).

## Comparativa con modelos similares

No se dispone de modelos comparables públicos descritos en la información proporcionada. La única referencia directa es la release Stage-A AR-k4 del mismo autor, que emplea decodificación autorregresiva con k=4. Como componente, el modelo depende del VAE congelado de Wan2.1, que no se distribuye en este repositorio.

| Modelo | Variante | Parámetros | Fotogramas futuros | Licencia |
|---|---|---|---|---|
| Video DiT — Stage-B AR-k1 | Autorregresiva k=1 | 19,7M a 938,4M (siete escalas) | 20 | No disponible |
| Video DiT — Stage-A AR-k4 | Autorregresiva k=4 | No disponible en la información | 20 | No disponible |
| VAE de Wan2.1 (componente congelado, no incluido) | VAE de vídeo | No disponible en la información | No aplica | No disponible |

## Limitaciones y advertencias

- La carga del repositorio está en curso; hasta que `manifest.json` indique `complete: true`, parte de los 273 puntos de control pueden no estar disponibles.
- La publicación no concede ninguna licencia nueva. No se especifica licencia, por lo que no se puede asumir uso comercial sin aclaración del autor.
- Es un archivo de puntos de control, no una afirmación de convergencia: el autor advierte de que los modelos no resuelven de forma fiable tareas del cubo de Rubik.
- Stage-B Bidir L y XL se detuvieron antes de los 8.000.000 de vídeos, por lo que su exposición de entrenamiento es inferior a la de las demás variantes.
- No se incluyen el VAE congelado de Wan2.1, los activos de ModernBERT/action-token, los datos ni el código de entrenamiento e inferencia; reanudar o reproducir requiere restaurar y reasignar esas dependencias.
- No son puntos de control de pipeline de Transformers ni de Diffusers, lo que descarta su carga directa en herramientas estándar.
- La carga de pesos crudos no aplica la EMA automáticamente; evaluar con EMA exige manipular los parámetros con nombre conservando los buffers.
- Los archivos de recuperación contienen objetos RNG de NumPy y pueden exigir `torch.load(..., weights_only=False)`, con el riesgo de seguridad asociado al uso de serialización no segura.
- Dominio muy restringido: cámara fija, tres caras del cubo y cubo 2x2. No hay evidencia de generalización a otras tareas de vídeo.
- El prompt de lenguaje es una secuencia de nueve acciones en inglés; no se documenta soporte de instrucciones en lenguaje natural libre ni de otros idiomas.
- Riesgo de inconsistencia física: al ser un modelo generativo sin estado vectorial ni pérdida auxiliar de estado, puede producir secuencias visualmente plausibles que no correspondan a estados válidos del cubo.
- No se documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos de datos ni sesgos de dominio.
- No hay soporte de tool calling, agentes ni razonamiento multi-paso.
- Las cifras de VRAM y de almacenamiento de pesos son estimaciones aritméticas a partir del número de parámetros; la memoria de activaciones no está publicada y puede ser determinante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/weihang44/video-dit-rubik-stage-b-ar-k1
- Release Stage-A AR-k4 del mismo autor: https://huggingface.co/weihang44/video-dit-rubik-stage-a-ar-k4
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
