# SyntheticMDProductions/ADiM_1.0_Image_Model

## Resumen

ADiM 1.0 es un modelo experimental de generación de imágenes texto-a-imagen desarrollado por SyntheticMDProductions. Se trata de un modelo extremadamente compacto, con 3.296.867 parámetros, que genera imágenes de 128 × 128 píxeles a partir de un prompt en inglés y una semilla. El modelo se distribuye como un checkpoint de PyTorch (`ADiM 1.0.pt`) acompañado de scripts de inferencia (`engine.py`) y una aplicación de escritorio (`desktop.py`) basada en Tkinter.

La relevancia del modelo es fundamentalmente didáctica: demuestra una implementación completa de flow matching en espacio de píxeles con un backbone convolucional tipo U-Net, entrenada durante 99.000 pasos acumulados. No compite con modelos de difusión de gran escala; su interés reside en la simplicidad de la arquitectura y en que todo el pipeline cabe en un único fichero de pesos y dos scripts de Python.

El modelo solo admite prompts en inglés y, según su propia model card, captura razonablemente la paleta y la distribución de una escena, pero los objetos individuales pueden quedar ambiguos. No se ha publicado información sobre la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching en espacio de píxeles con backbone convolucional tipo U-Net |
| Parametros totales | 3.296.867 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (condicionamiento por suma de embeddings de palabras) |
| Tipos de cuantizacion | No disponible (checkpoint PyTorch en precisión nativa) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

ADiM 1.0 emplea flow matching en espacio de píxeles: durante el entrenamiento el modelo aprende el campo de velocidad que transforma ruido en imagen, en lugar de predecir ruido como en los modelos de difusión clásicos. El backbone es una U-Net convolucional de pequeñas dimensiones, coherente con el recuento de 3,3 millones de parámetros. El muestreo utiliza 40 pasos de Euler sobre los pesos crudos del checkpoint, sin destilación ni aceleradores de muestreo adicionales.

El condicionamiento textual es deliberadamente simple: el codificador de texto suma embeddings de palabras aprendidos, de modo que reordenar las mismas palabras deja el vector de condicionamiento invariante. Esto implica que el modelo no modela orden sintáctico ni relaciones espaciales entre términos. El entrenamiento acumuló 99.000 pasos y las muestras publicadas incluyen bordes negros, lo que el autor atribuye a imágenes con padding usadas durante el ajuste fino. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución fija de 128 × 128 píxeles.
- Generación determinista por semilla: la misma semilla y prompt producen la misma imagen.
- Captura de paleta de color y distribución general de la escena en descripciones simples.
- Condicionamiento por bolsa de palabras: el vector de texto es invariante al orden de las palabras.
- Ejecución en CPU y GPU (CUDA cuando está disponible) mediante el script `engine.py`.
- Interfaz gráfica de escritorio con Tkinter para generación por lotes y guardado en PNG.
- No soporta tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento.
- No soporta otros idiomas distintos del inglés.

## Casos de uso

- Docencia sobre flow matching: el modelo sirve para explicar paso a paso el entrenamiento y el muestreo por integración de Euler en un caso real y de tamaño manejable, sin necesidad de infraestructura de GPU.
- Experimentación con condicionamiento textual: al usar suma de embeddings de palabras, permite estudiar de forma aislada cómo afecta el vocabulario al resultado sin la confusión que introduce un codificador transformer.
- Pruebas de pipelines de inferencia: su reducido tamaño permite validar scripts de generación, gestión de semillas y guardado de imágenes en entornos locales o de integración continua sin coste de cómputo relevante.
- Generación de miniaturas o placeholders de 128 × 128 para maquetas de interfaz, donde la fidelidad semántica no es crítica y prima la rapidez.
- Estudio de sesgos y limitaciones en modelos generativos pequeños: la ambigüedad de objetos documentada por el autor lo convierte en un caso de análisis sobre qué aprende y qué no aprende un modelo de 3,3 millones de parámetros.
- Reproducibilidad de experimentos: la generación determinista por semilla facilita comparar variaciones de prompt manteniendo constante el resto de factores, tal como propone el propio autor al cambiar "bus" por "bicycle".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 3,3 millones de parámetros el checkpoint ocupa unos pocos megabytes y las activaciones a 128 × 128 son mínimas.
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1050, RTX 3060 o superiores; el modelo no aprovecha las capacidades de tarjetas de gama alta como A100 o H100.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU; el autor indica que la aplicación de escritorio usa CUDA cuando está disponible y, en caso contrario, CPU.
- Opciones de despliegue: scripts propios `engine.py` y `desktop.py` con PyTorch, NumPy y Pillow; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de imagen de este tipo.
- Latencia y throughput: no disponibles; con 40 pasos de Euler y 3,3 millones de parámetros se espera una latencia muy baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto/condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ADiM 1.0 | 3.296.867 | 128 × 128 | Suma de embeddings de palabras, inglés | No disponible | Hugging Face (checkpoint `.pt`) |
| Modelos de difusión de gran escala (p. ej. SDXL, Flux) | Miles de millones | 1024 × 1024 o superior | Codificador de texto transformer | Varía según modelo | Hugging Face, APIs comerciales |
| Modelos de difusión pequeños tipo pixel-space U-Net | Decenas de millones | 32 × 32 a 64 × 64 | Embeddings de clase o texto simple | Varía | Repositorios académicos |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Resolución muy baja (128 × 128) y calidad limitada: el propio autor reconoce que los objetos individuales pueden quedar ambiguos.
- El condicionamiento por suma de embeddings ignora el orden de las palabras, por lo que no modela relaciones espaciales ni sintaxis; descripciones complejas no se traducirán en composiciones fieles.
- Dificultad documentada con anatomía fina y formas precisas de objetos (por ejemplo, ruedas y cuadros de bicicleta).
- Presencia de bordes negros en algunas muestras, atribuida al padding de las imágenes de ajuste fino.
- Solo admite inglés; no hay soporte multilingüe.
- Licencia no disponible: no puede asumirse permiso para uso comercial sin consultar al autor.
- Riesgo de sesgos desconocido: no se documenta la composición del dataset de entrenamiento ni análisis de sesgos.
- Modelo experimental con 0 descargas y un único "like" en el momento de la consulta; no hay evidencia de validación por la comunidad.
- No apto para producción en tareas que requieran fidelidad semántica o resolución utilizable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SyntheticMDProductions/ADiM_1.0_Image_Model
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
