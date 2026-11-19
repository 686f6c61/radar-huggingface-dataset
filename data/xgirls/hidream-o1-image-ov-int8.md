# xgirls/HiDream-O1-Image-ov-int8

## Resumen

HiDream-O1-Image-ov-int8 es una exportación comunitaria a OpenVINO con cuantización INT8 del modelo de difusión de píxeles HiDream-O1-Image, desarrollado originalmente por HiDream-ai. El paquete, publicado por el usuario xgirls, no contiene los pesos originales en PyTorch, sino el núcleo de denoising compilado en formato OpenVINO junto con el tokenizador, el procesador, un runner de inferencia (`infer.py`) y los módulos de pipeline mínimos necesarios para ejecutarlo. Está pensado para generación texto-a-imagen local en hardware Intel, tanto CPU como GPU Arc.

La relevancia de esta conversión radica en que permite ejecutar un pipeline de difusión de píxeles de aproximadamente 10,2 GiB en entornos sin CUDA, usando compresión de pesos NNCF por canal y simétrica en INT8 para las proyecciones feed-forward, mientras que las proyecciones de atención Q/K/V/output se mantienen en BF16 para preservar calidad. El grafo exportado es de forma dinámica: el runner acepta anchos y altos divisibles por 32, y la predicción de píxeles y el condicionamiento textual forman parte del propio grafo, sin VAE separado.

Se trata de un artefacto de inferencia, no de un modelo entrenado desde cero: hereda las capacidades y limitaciones del modelo base HiDream-O1-Image y añade las restricciones propias de la cuantización y del backend OpenVINO. La licencia es MIT y el repositorio es público y sin gating.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de píxeles (pixel diffusion) HiDream-O1 con núcleo de denoising exportado a OpenVINO; grafo de forma dinámica |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | INT8 simétrico por canal (NNCF) en proyecciones feed-forward; atención Q/K/V/output en BF16 |
| Idiomas soportados | en |
| Licencia | MIT (módulos de scheduler de Diffusers conservan aviso Apache-2.0) |
| Formato de pesos | OpenVINO (IR); no incluye checkpoint PyTorch original |
| Tamano del repo | 10,9 GB (aproximadamente 10,2 GiB en 26 archivos) |
| Resolucion | Dimensiones de imagen dinámicas, divisibles por 32 |
| Pasos de muestreo de referencia | 28 |
| Revision de exportacion | `ea02ab583b5ad33e7038566c927e6f4843629ce9` |

## Arquitectura y entrenamiento

El modelo base HiDream-O1-Image emplea un pipeline de difusión de píxeles: en lugar de operar en un espacio latente comprimido con un VAE separado, el grafo exportado integra el condicionamiento textual y la predicción de píxeles directamente, de modo que no se requiere un VAE independiente en tiempo de inferencia. La exportación a OpenVINO mantiene un núcleo de denoising con formas dinámicas, lo que permite variar resolución sin recompilar el grafo, siempre que ancho y alto sean múltiplos de 32.

En cuanto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO; estos datos corresponden al modelo base y no se reproducen en esta conversión. La innovación técnica de este paquete es la compresión NNCF: se aplica cuantización INT8 simétrica por canal a las proyecciones feed-forward, dejando la atención en BF16, una decisión de compromiso entre reducción de memoria y fidelidad de salida. La validación incluida es una imagen fija de 1024×1024 a 28 pasos y semilla 42, generada con el núcleo OpenVINO en CPU y el scheduler en CUDA sobre un host con A100.

## Capacidades

- Generación de imágenes a partir de descripciones textuales en inglés (text-to-image).
- Resolución dinámica: acepta anchos y altos divisibles por 32, con 1024×1024 como configuración validada.
- Control de muestreo mediante número de pasos (28 en la referencia) y semilla para reproducibilidad.
- Ejecución en CPU y en GPU Intel mediante OpenVINO, con selección de dispositivo separada para el scheduler (`--torch-device`) y para el núcleo OpenVINO (`--ov-device`).
- Descarga directa desde el Hub con fijación de revisión para descargas reproducibles, o uso de copia local con `--model`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo: es exclusivamente un pipeline de imagen.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Generación de ilustraciones conceptuales en estaciones de trabajo sin GPU NVIDIA: el paquete se ejecuta con OpenVINO en CPU, lo que permite obtener imágenes de 1024×1024 en 28 pasos en equipos Intel convencionales.
- Prototipado de pipelines texto-a-imagen en portátiles con gráfica Intel Arc: el runner permite alternar `--ov-device` entre CPU y GPU sin cambiar el código, útil para comparar latencia y calidad.
- Producción de assets para documentación técnica y blogs: con semilla fija y revisión fijada (`--revision`) se obtienen resultados reproducibles, adecuados para regenerar una misma imagen en integración continua.
- Evaluación de cuantización INT8 en difusión: investigadores pueden medir la degradación de calidad frente al modelo base en BF16 manteniendo la atención sin cuantizar.
- Generación por lotes en servidores sin CUDA: al ser un grafo OpenVINO de forma dinámica, se puede exponer mediante un servicio interno que reciba prompt, alto, ancho, pasos y semilla.
- Creación de maquetas y moodboards en inglés para equipos de diseño: el modelo acepta descripciones detalladas de escena, iluminación y materiales, como el ejemplo de la tetera de cerámica azul sobre mesa de madera mojada.
- Pruebas de compatibilidad de hardware Intel: el paquete documenta un caso de validación en Intel Arc B390 con OpenVINO 2026.4.1, útil como referencia para verificar controladores y precisión de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento aportados son operativos: en la validación experimental en Intel Arc B390 (Windows, OpenVINO 2026.4.1, driver 32.0.101.9033), con un transformer de reemplazo con las 258 capas MatMul objetivo comprimidas a INT8, la precisión de inferencia GPU por defecto produjo una salida gris plana a 1024×1024 y 28 pasos; con una indicación de ejecución en FP32 se recuperaron imágenes reconocibles en 80,62 segundos en caliente. El autor advierte que esos resultados corresponden a un transformer experimental cuyos pesos difieren del paquete publicado y que no validan Iris Xe ni una configuración gráfica Intel interactiva.

## Requisitos de hardware

- VRAM/RAM estimada: el paquete ocupa aproximadamente 10,2 GiB en disco; la inferencia requiere cargar el grafo OpenVINO completo, por lo que se recomienda al menos 16 GB de memoria del dispositivo de ejecución para trabajar con holgura a 1024×1024.
- GPU recomendadas: Intel Arc (validación documentada en Arc B390); el autor no valida Iris Xe ni configuraciones gráficas Intel interactivas.
- CPU: el paquete está validado en CPU con el núcleo OpenVINO; la validación de referencia se generó con inferencia OpenVINO en CPU sobre un host con A100 para el scheduler.
- Cabe en GPU de consumo: sí, en el caso de gráficas Intel Arc con memoria suficiente; no se documenta soporte para GPU NVIDIA o AMD a través de este paquete.
- Opciones de despliegue: runner incluido (`infer.py`) sobre OpenVINO; requiere instalar `requirements.txt`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia: 80,62 segundos en caliente a 1024×1024 y 28 pasos en Intel Arc B390 con el transformer experimental en FP32; no hay cifras publicadas para CPU ni para el paquete publicado.
- Nota importante: en la GPU Arc B390, la precisión de inferencia por defecto produjo salida gris plana; se necesitó una indicación de ejecución en FP32 para obtener imágenes válidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Formato y backend | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HiDream-O1-Image-ov-int8 (este) | no disponible | Resolucion dinamica multiple de 32; 1024×1024 validada | OpenVINO IR, INT8 + BF16 | MIT | Publico, sin gating, 0 descargas |
| HiDream-ai/HiDream-O1-Image (base) | no disponible | no disponible | PyTorch/Diffusers | MIT | Publico en Hugging Face |
| Alternativas de difusion texto-a-imagen de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de parámetros del modelo base en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una conversión comunitaria, no un lanzamiento oficial de HiDream ni de OpenVINO; el soporte y la validación corren a cargo del autor del repositorio.
- No incluye el checkpoint PyTorch original: no sirve para fine-tuning ni para reexportar a otros formatos sin recurrir al modelo base.
- Solo admite prompts en inglés según la model card.
- La cuantización INT8 en las proyecciones feed-forward puede introducir degradación de calidad frente al modelo en BF16; no se publican métricas de fidelidad.
- En Intel Arc B390 la configuración por defecto produjo salida gris plana; es necesario verificar la precisión de ejecución y usar FP32 si aparece ese fallo.
- El caso validado en GPU usa un transformer experimental con pesos distintos a los del paquete publicado, por lo que sus resultados no garantizan el comportamiento del artefacto distribuido.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir anatomías, textos y geometrías incoherentes, especialmente con prompts ambiguos.
- Sesgos: no se documentan análisis de sesgo del modelo base ni de esta conversión; se heredan los del dataset de entrenamiento original, no disponible en esta ficha.
- Restricciones de licencia: MIT permite uso comercial, pero los módulos de scheduler de Diffusers incluidos conservan avisos Apache-2.0 que deben mantenerse.
- Fijar la revisión `ea02ab583b5ad33e7038566c927e6f4843629ce9` para descargas reproducibles; el runner descarga el repositorio en el primer uso.
- Requiere dependencias de OpenVINO y Diffusers compatibles; no se especifican versiones mínimas en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xgirls/HiDream-O1-Image-ov-int8
- Modelo base: https://huggingface.co/HiDream-ai/HiDream-O1-Image
