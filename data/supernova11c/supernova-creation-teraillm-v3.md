# Supernova11c/Supernova-Creation-TeraiLLM-V3

## Resumen

Supernova Creation TeraiLLM V3 es un modelo de generación de imágenes desarrollado desde cero por el usuario Supernova11c, publicado en HuggingFace bajo licencia Apache 2.0. A pesar de que la etiqueta de pipeline del repositorio indica `text-to-image`, el propio autor especifica en la model card que el modelo no acepta prompts de texto ni utiliza codificador textual alguno: se trata en realidad de un autoencoder variacional (VAE) convolucional que aprende una representación latente de 128 dimensiones y genera imágenes de 128 × 128 píxeles muestreando vectores aleatorios en ese espacio latente o reconstruyendo imágenes de entrada.

El modelo cuenta con 30.676.611 parámetros y una arquitectura convolucional compacta con bloques residuales, normalización GroupNorm y activación SiLU. El cuello de botella es una representación de 8 × 8 × 512 que se proyecta a una latente de 128 dimensiones mediante una parametrización probabilística (media y log-varianza). Se entrenó íntegramente con PyTorch sobre 2.000 imágenes seleccionadas del dataset BHI Mini (1.800 de entrenamiento y 200 de test disjuntas), durante 200 épocas con optimizador AdamW.

Su relevancia es fundamentalmente experimental y educativa: demuestra que es posible construir un pipeline completo de generación y reconstrucción de imágenes sin depender de backbones preentrenados (Stable Diffusion, encoders o decoders externos, GANs o codificadores de texto). No está pensado para competir con sistemas de generación texto-a-imagen a gran escala, sino como hito interno del autor y como artefacto didáctico de arquitecturas VAE. El repositorio ocupa 0,1 GB y acumula 0 descargas y 1 like en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional (VAE) convolucional con bloques residuales |
| Parámetros totales | 30.676.611 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (no documentados por el autor) |
| Idiomas soportados | no disponible (el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (implementado en PyTorch; la model card no especifica safetensors, GGUF ni .pt/.pth) |
| Resolución de imagen | 128 × 128 |
| Canales de entrada | 3 (RGB) |
| Dimensión latente | 128 |
| Canales base | 64 |
| Cuello de botella | 8 × 8 × 512 |
| Activación principal | SiLU |
| Normalización | GroupNorm |
| Condicionamiento textual | No |
| Soporte CUDA | Sí |
| Inferencia en CPU | Sí |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un VAE convolucional construido a mano. El encoder aplica convoluciones de 3 canales de entrada y escala progresivamente a 64, 128, 256 y 512 canales hasta obtener una representación de 8 × 8 × 512, que se proyecta en dos cabezas: la media (μ) y el logaritmo de la varianza (logvar). De ahí se obtiene una latente de 128 dimensiones. El decoder invierte el proceso: una capa lineal lleva la latente de nuevo a 8 × 8 × 512, se aplican bloques residuales y se reconstruye una imagen RGB de 128 × 128 × 3. Todo el flujo usa GroupNorm y SiLU, sin mecanismos de atención ni condicionamiento externo.

El entrenamiento se realizó sobre 2.000 imágenes procedentes del dataset BHI Mini (4.500 imágenes disponibles, selección con semilla 20261003). El split quedó en 1.800 imágenes de entrenamiento y 200 de test completamente disjuntas. Las imágenes se convirtieron a RGB y se redimensionaron a 128 × 128 con remuestreo LANCZOS preservando la imagen completa. La configuración fue: 200 épocas, batch size 16, learning rate 0,0002, optimizador AdamW con weight decay 0,0001, coeficiente KL de 0,001 (valor bajo, lo que prioriza la fidelidad de reconstrucción sobre la regularidad del espacio latente), gradient clipping de 1,0 y semilla 20261003. No se menciona uso de RLHF, DPO ni fine-tuning posterior. Tampoco se documentan aumentos de datos, scheduler de learning rate ni técnicas de decodificación especulativa, que en este tipo de modelo no aplican.

## Capacidades

- Generación de imágenes nuevas a partir de vectores latentes aleatorios de 128 dimensiones, sin prompt de texto.
- Reconstrucción de imágenes: codifica una imagen en su latente (usando μ para reconstrucción determinista) y la decodifica de vuelta a 128 × 128 RGB.
- Codificación de imágenes a una representación latente compacta de 128 dimensiones, reutilizable como embedding para tareas posteriores.
- Aprendizaje de estructura y composición visual global a partir de los datos de entrenamiento.
- Inferencia tanto en CPU como en GPU compatible con CUDA.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo "thinking", visión descriptiva, audio ni ninguna otra modalidad adicional.
- No acepta condicionamiento textual, etiquetas, clases ni máscaras: la única vía de control es el vector latente.

## Casos de uso

- Investigación y docencia sobre VAEs: el modelo permite ilustrar de forma completa el ciclo encoder–μ/logvar–decoder, la pérdida de reconstrucción más KL y el muestreo en el espacio latente, con un coste computacional mínimo.
- Reconstrucción y compresión de imágenes a baja resolución: útil para estudiar cuánta información visual se conserva al comprimir una imagen de 128 × 128 a solo 128 valores en lugar de 49.152 valores de píxel.
- Aumento de datos sintéticos: muestrear latentes aleatorios para generar imágenes adicionales de 128 × 128 que amplíen un dataset pequeño, siempre que el dominio coincida con el de entrenamiento (BHI Mini).
- Detección de anomalías por error de reconstrucción: comparar la MAE o MSE de reconstrucción entre imágenes normales y atípicas para marcar candidatas a revisión en un pipeline de control de calidad visual.
- Exploración e interpolación del espacio latente: recorrer trayectorias entre dos latentes para estudiar cómo varía la composición de la imagen generada, con fines de visualización o análisis.
- Extracción de características ligeras: usar la latente de 128 dimensiones como descriptor compacto para clustering, búsqueda de similitud o clasificación con un modelo sencillo encima.
- Componente didáctico en entornos con pocos recursos: al ejecutarse en CPU y ocupar menos de 0,5 GB en memoria, sirve como banco de pruebas en portátiles, máquinas virtuales o dispositivos embebidos sin GPU.
- Prototipado de pipelines generativos en dos etapas: emplear este decoder como VAE independiente para validar una arquitectura antes de escalar a resoluciones mayores o añadir un modelo de difusión sobre la latente.

## Benchmarks y rendimiento

La model card solo publica métricas de reconstrucción a nivel de píxel sobre el conjunto de test de 200 imágenes no vistas, a resolución 128 × 128. No hay resultados de benchmarks estándar de generación de imágenes como FID, IS, CLIP score ni de tareas de lenguaje (MMLU, HumanEval, GSM8K no aplican a este modelo).

| Métrica | Resultado (test de 200 imágenes) |
|---|---|
| MAE | 0,068876 |
| MSE | 0,010961 |
| RMSE | 0,104694 |

Adicionalmente, el autor reporta un experimento con siete imágenes de una colección de calles, con MAE 0,041101 y MSE 0,004684, pero advierte explícitamente que corresponde al conjunto de entrenamiento y no debe interpretarse como capacidad de generalización. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (30,7 millones de parámetros ≈ 123 MB de pesos, más activaciones de imágenes de 128 × 128, que son muy reducidas). En FP16 los pesos ocuparían aproximadamente 61 MB.
- GPU recomendadas: cualquier GPU CUDA, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 o superiores; no requiere A100, H100 ni VRAM de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en iGPU con memoria compartida.
- Inferencia en CPU: soportada explícitamente por el autor; es viable en portátiles y en dispositivos con memoria limitada.
- Opciones de despliegue: ejecución directa con PyTorch; vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje. La model card no documenta exportación a ONNX, TorchScript ni TensorRT.
- Latencia y throughput: no disponibles. No se proporcionan mediciones de tiempo por imagen ni de imágenes por segundo en ninguna configuración de hardware.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Cualitativamente, el propio autor indica que V3 no pretende competir en escala ni en comprensión de prompts con los grandes sistemas texto-a-imagen, y que su valor está en ser una arquitectura compacta construida íntegramente desde cero, sin backbone preentrenado, sin encoder de texto y sin entrenamiento adversarial. Los sistemas comparables de la categoría (VAEs de compresión de imagen o autoencoders convolucionales) no aparecen referenciados en la model card, por lo que cualquier cifra de comparación sería especulativa.

| Modelo | Parámetros | Resolución | Condicionamiento textual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supernova Creation TeraiLLM V3 | 30.676.611 | 128 × 128 | No | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Discrepancia entre la etiqueta del repositorio y el comportamiento real: el pipeline está marcado como `text-to-image`, pero el modelo no procesa texto ni acepta prompts. Cualquier usuario que espere generación guiada por descripción textual se llevará una decepción.
- Resolución muy baja: 128 × 128 píxeles, insuficiente para la mayoría de aplicaciones de producción gráfica.
- Dataset de entrenamiento pequeño y de dominio desconocido: 1.800 imágenes de BHI Mini. La composición, la procedencia y la diversidad del dataset no se detallan, por lo que los sesgos visuales heredados son difíciles de auditar.
- Sesgos conocidos: no documentados por el autor, pero al entrenar sobre un corpus reducido es previsible un sesgo hacia las temáticas y estilos dominantes de BHI Mini.
- Riesgo de alucinación: en el sentido estricto del término no aplica, pero sí existe el riesgo de generar imágenes plausibles pero sin coherencia semántica cuando se muestrean latentes aleatorios alejados de la distribución de entrenamiento.
- Ausencia de métricas de calidad generativa: no se publican FID, IS ni evaluaciones perceptuales, solo errores de reconstrucción a nivel de píxel, que correlacionan mal con la calidad visual percibida.
- El coeficiente KL de 0,001 es muy bajo, lo que puede producir un espacio latente poco regular y con huecos donde el decoder genera salidas sin sentido.
- Validación comunitaria nula: 0 descargas y 1 like. No hay terceros que hayan reproducido los resultados ni informes independientes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se atribuya la autoría. No se documentan restricciones adicionales ni cláusulas de uso aceptable.
- Formato de pesos no especificado ni cuantizaciones publicadas, lo que complica la integración en runtimes optimizados sin trabajo previo de conversión.
- Para producción: no se recomienda su uso en pipelines que requieran fidelidad fotográfica, control por prompt o resoluciones superiores a 128 × 128.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Supernova11c/Supernova-Creation-TeraiLLM-V3
- Dataset de entrenamiento: https://huggingface.co/datasets/Phips/BHI_mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
