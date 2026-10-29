# taurusduan/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI

## Resumen

Cobijada MiniMax-H3 Hybrid (Pruned, Uncensored) es un checkpoint derivado de MiniMax H3, un diffusion transformer (DiT) conjunto de audio y vídeo pensado para ejecutarse en ComfyUI. No es un modelo entrenado desde cero ni un fine-tune: es un merge por selección de tensores, sin ningún paso de entrenamiento ni optimización basada en gradientes. El autor del merge y de las cuantizaciones es Winnougan, mientras que el repositorio consultado está publicado bajo la cuenta taurusduan, un detalle de procedencia relevante para producción.

El problema que aborda es concreto: MiniMax H3 se distribuye en dos regímenes de condicionamiento con arquitectura y layout de tensores idénticos. El checkpoint FL (condicionamiento por primer y último fotograma) ofrece mayor calidad visual y de audio pero no admite generación guiada por referencia; el checkpoint REF añade referencias de imagen, vídeo y audio a costa de una pérdida real de calidad, incluso en tareas sin referencia. La comparación tensor a tensor muestra que la gran mayoría de pesos (proyecciones de atención, MLP, normas, patch projections, rotary embeddings y el token refiner) son prácticamente idénticos, y que las diferencias se concentran en las proyecciones `adaln_proj` por bloque.

La propuesta del híbrido es tomar el checkpoint FL como base de toda la red y sustituir únicamente los pesos `adaln_proj` de los bloques 25 a 49 (la mitad posterior) por los del checkpoint REF. La intención es conservar la ruta de condicionamiento por referencia, que se expresa sobre todo en esas AdaLN tardías, manteniendo la fidelidad de FL en el resto de la red. Se distribuye en tres variantes (BF16, INT8 y W4A8) en un repositorio de 73,7 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) conjunto de audio y vídeo, derivado de MiniMax H3 |
| Parametros totales | no disponible (variantes pruned; el autor no publica recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es una ventana de contexto de LLM: condicionamiento por texto, imagen, vídeo y audio |
| Tipos de cuantizacion | BF16, INT8 (ConvRot) y W4A8 (ConvRot) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 para el merge, las cuantizaciones y el repositorio; los pesos originales de MiniMax H3 siguen sujetos a la licencia de MiniMax |
| Formato de pesos | safetensors (tres ficheros: BF16, INT8 y W4A8) |
| Modalidades de entrada | texto, imagen, vídeo y audio (text/image/video/audio-to-video) |
| Regímenes de condicionamiento | primer/último fotograma (FL) y guiado por referencia (REF) en un único checkpoint |
| Pipeline declarado en HuggingFace | image-to-video |
| Tamaño del repositorio | 73,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un diffusion transformer que modela audio y vídeo de forma conjunta, con atención, MLPs, normas, patch projections, rotary embeddings, un token refiner y proyecciones AdaLN de modulación por bloque (`adaln_proj`) que inyectan la señal de condicionamiento en el residual stream de cada bloque. Los dos checkpoints de origen (FL y REF) comparten arquitectura y layout de tensores, lo que hace posible el intercambio directo de pesos sin adaptadores ni capas nuevas.

El proceso de construcción es un merge por selección de tensores a nivel de peso: base FL en toda la red, con los `adaln_proj` de los bloques 25 a 49 tomados de REF; el resto (AdaLN de bloques tempranos, proyección AdaLN final, atención, MLPs, normas y cabezas de salida) permanece en FL. No hubo entrenamiento, fine-tune ni optimización por gradientes. Ambos checkpoints de partida eran ya las variantes "uncensored" y pruned, de modo que el híbrido acumula el recorte de poda y la eliminación de filtrado de los originales. No se documentan en la información disponible el número de tokens, la composición del dataset, ni si MiniMax H3 usó RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto, imagen, vídeo y audio (text/image/video/audio-to-video).
- Generación conjunta de audio y vídeo en un mismo DiT, no como pipeline de dos etapas separadas.
- Condicionamiento por primer y último fotograma (FL) para control temporal de planos.
- Condicionamiento guiado por referencia (REF) con entradas de imagen, vídeo y audio, disponible en el mismo checkpoint que los flujos FL.
- Carga directa en ComfyUI con el loader estándar de MiniMax H3: la arquitectura y el layout de tensores no cambian, no requiere nodos personalizados.
- Tres niveles de precisión intercambiables (BF16, INT8, W4A8) para ajustar VRAM y calidad.
- Capacidades multilingües: no disponible (no se documenta el soporte de idiomas en los prompts).
- Tool calling, function calling, modo thinking o razonamiento multi-paso: no aplica, es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Postproducción con control de fotogramas clave: usar el régimen FL para fijar el primer y el último fotograma de una toma y generar la transición intermedia, útil para insertar planos de continuidad entre dos imágenes ya aprobadas por el cliente.
- Consistencia de personaje o producto mediante referencia: alimentar el modelo con una imagen o un vídeo de referencia y generar nuevas tomas del mismo sujeto, aprovechando la ruta REF heredada de los bloques 25 a 49.
- Sustitución directa del checkpoint REF en workflows existentes de ComfyUI: para usuarios que ya tienen montado un pipeline con referencias y encontraban insuficiente la calidad cruda de REF, el híbrido se carga sin cambiar de nodo ni de arquitectura.
- Generación de vídeo con audio sincronizado: al ser un DiT conjunto de audio y vídeo, permite producir clips con banda sonora o ambiente en una sola pasada, adecuado para prototipos de anuncios, doblaje preliminar o contenido para redes.
- Previz y storyboards animados: iterar rápidamente sobre guiones gráficos a partir de bocetos y prompts de texto, con la opción de referencia visual para mantener el estilo entre planos.
- Investigación sobre merging de pesos: el repositorio documenta explícitamente qué tensores se intercambian y por qué, lo que lo convierte en un caso reproducible para estudiar el efecto de las proyecciones AdaLN por bloque en el condicionamiento.
- Evaluación de cuantización agresiva en modelos de vídeo: las variantes INT8 ConvRot y W4A8 ConvRot sobre el mismo checkpoint BF16 permiten medir la degradación de calidad frente al ahorro de VRAM en un modelo de difusión de gran tamaño.
- Red teaming y análisis de contenido sin filtrado: las variantes de origen son "uncensored", por lo que sirven para estudiar comportamientos de modelos sin alineación de seguridad, siempre en un entorno controlado y con revisión legal previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIP similarity, calidad de audio, etc.) ni comparaciones numéricas entre el híbrido y los checkpoints FL y REF de origen; únicamente afirma de forma cualitativa que el híbrido no debe superar a FL en generación sin referencia, dado que la mayor parte de sus pesos son compartidos con FL.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El recuento de parámetros no se publica y el repositorio solo indica un tamaño total de 73,7 GB repartido entre tres ficheros (BF16, INT8, W4A8), por lo que no es posible derivar una cifra fiable de VRAM sin medir los ficheros.
- GPU recomendadas: no disponible en la información proporcionada; el modelo se distribuye en BF16 y en dos cuantizaciones (INT8 y W4A8) precisamente para ampliar el rango de hardware soportado.
- ¿Cabe en GPU de consumo? No confirmado. La existencia de las variantes INT8 y W4A8 apunta a que el BF16 completo está pensado para GPUs de mayor capacidad, pero no se aportan requisitos mínimos.
- Opciones de despliegue: ComfyUI es la vía documentada. Los ficheros se colocan en `ComfyUI/models/diffusion_models/` y se cargan con el loader estándar de MiniMax H3, sin nodos personalizados. No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponible. No se publican tiempos por clip, resolución, duración de vídeo soportada ni número de pasos de muestreo.
- Almacenamiento: hay que prever espacio para ficheros de gran tamaño; el repositorio completo ocupa 73,7 GB, aunque basta con descargar la variante de precisión elegida.

## Comparativa con modelos similares

Los únicos puntos de comparación documentados son los dos checkpoints de origen de MiniMax H3, que comparten arquitectura y layout de tensores con el híbrido:

| Modelo | Condicionamiento por referencia | Calidad en tareas sin referencia | Entrenamiento adicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cobijada H3 Hybrid | Sí (AdaLN de bloques 25-49 tomadas de REF) | Similar a FL según el autor, no superior | Ninguno (merge por selección de tensores) | Apache 2.0 (merge); pesos base con licencia de MiniMax | Repositorio de 73,7 GB, 0 descargas |
| MiniMax H3 FL | No | La más alta de las dos variantes de origen, según la model card | Entrenamiento oficial | Licencia de MiniMax | Checkpoint oficial |
| MiniMax H3 REF | Sí (imagen, vídeo y audio de referencia) | Inferior a FL de forma explícita, incluso sin referencia | Entrenamiento oficial | Licencia de MiniMax | Checkpoint oficial |

No se dispone de datos en la información proporcionada para comparar con otras familias de modelos abiertos de generación de vídeo (parámetros, contexto, benchmarks o licencia), por lo que esa comparación queda como no disponible.

## Limitaciones y advertencias

- Modelo "uncensored": los checkpoints de partida tenían eliminado el filtrado, de modo que no hay moderación de contenido integrada. Riesgo de generar material NSFW, violento o ilegal; requiere filtrado y revisión propios si se expone a usuarios finales.
- Merge sin evaluación: no se ha entrenado ni validado con métricas. El comportamiento del híbrido en tareas de referencia es una hipótesis de diseño del autor (las AdaLN tardías portan la ruta REF) y no está cuantificado.
- Calidad acotada por el diseño: el propio autor advierte que el modelo no debe superar a FL en generación sin condicionamiento por referencia, porque la mayoría de sus pesos son de FL.
- Poda de origen: las tres variantes son pruned y se desconoce qué se eliminó exactamente y con qué pérdida de calidad asociada.
- Cuantizaciones no evaluadas: INT8 ConvRot y W4A8 ConvRot se obtuvieron del BF16 sin publicación de métricas de degradación; conviene validar contra el BF16 antes de usarlas en producción.
- Licencia en dos capas: el merge y las conversiones son Apache 2.0, pero los pesos subyacentes de MiniMax H3 siguen bajo los términos de MiniMax. Hay que revisar esa licencia por separado antes de cualquier uso comercial; Apache 2.0 en el repositorio no equivale a licencia libre sobre el modelo base.
- Procedencia: la model card acredita el merge y las cuantizaciones a Winnougan, mientras que el repositorio consultado pertenece a taurusduan. Verificar la réplica frente al repositorio original antes de integrarlo en un pipeline.
- Señales de validación nulas: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de comunidad sin uso contrastado.
- Idiomas y prompts: no se documenta qué idiomas acepta el codificador de texto ni si hay degradación en prompts en castellano.
- Especificaciones ausentes: sin recuento de parámetros, sin duración ni resolución de vídeo soportada, sin requisitos de VRAM y sin latencias publicadas. La planificación de infraestructura exige medirlas in situ.
- Dependencia de ComfyUI: el flujo documentado es exclusivamente ComfyUI con el loader de MiniMax H3; integrarlo en otros frameworks requiere trabajo adicional no soportado por el autor.
- Riesgo de alucinación visual: como todo modelo generativo de difusión, puede producir artefactos, incoherencias temporales y desincronización audio-vídeo, sin garantía de fidelidad a la referencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/taurusduan/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI
- Imagen de cabecera referenciada en la model card: https://huggingface.co/Winnougan/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI/resolve/main/H3_Hybrid.png
- Perfil del autor del merge y las cuantizaciones: https://huggingface.co/Winnougan
- Repositorio original del merge (según los créditos de la model card): https://huggingface.co/Winnougan/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI
- Checkpoints oficiales de MiniMax H3 (FL y REF): no disponible en la información proporcionada
- Paper, blog técnico o demo de MiniMax H3: no disponible en la información proporcionada
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores son los únicos verificables a partir de la información disponible.
