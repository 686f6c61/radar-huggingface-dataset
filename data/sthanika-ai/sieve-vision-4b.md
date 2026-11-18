# sthanika-ai/Sieve-Vision-4B

## Resumen

Sieve-Vision-4B es un modelo de decisión visual desarrollado por Sthānika AI, publicado en colaboración con Sieve. A diferencia de un modelo generativo convencional, este sistema recibe una o varias imágenes junto con una pregunta de opción múltiple y devuelve una probabilidad calibrada para cada opción, sin generar texto en ningún momento. El modelo está diseñado específicamente para tareas de decisión, no para conversación ni generación libre.

Técnicamente se trata de un fine-tune completo de Qwen/Qwen3.5-4B-Base (revisión `1001bb4d`) al que se le ha añadido una cabeza de decisión. Conserva el codificador visual del modelo base, pero sustituye la generación autoregresiva por un mecanismo de lectura que puntúa directamente cada opción candidata en una única pasada hacia delante. El resultado es un modelo de 4.539 millones de parámetros con licencia Apache-2.0, orientado a pipelines de evaluación y clasificación visual.

Su relevancia actual radica en que ofrece una alternativa determinista y calibrada a los modelos multimodales generativos para tareas de selección entre opciones, con un coste computacional y de memoria moderado (unos 9,3 GB de pesos en bf16) y una ventana de hasta 6.400 tokens de imagen por petición, lo que permite procesar hasta 100 imágenes en una sola consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-4B-Base) con codificador visual y cabeza de decisión |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 6.400 tokens de imagen por petición; sin truncado de texto |
| Tipos de cuantización | No disponible (pesos publicados en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-4B-Base, del que conserva el codificador visual sin modificaciones y el modelo de texto de 32 capas de decoder. Sobre esa base se ha realizado un fine-tune completo (full fine-tune) de los pesos del modelo de texto, y se ha añadido una cabeza de decisión que lee los estados ocultos en el punto de decisión y en cada una de las opciones para puntuarlas. Una softmax calibrada convierte esas puntuaciones en probabilidades por clave. La inferencia se realiza en una única pasada hacia delante por pregunta, respetando el orden de las opciones proporcionado por el usuario.

El modelo no genera texto en ningún momento: su única salida es un conjunto de probabilidades calibradas. El repositorio incluye el código de inferencia en el directorio `sieve_vision/` y una configuración de temperatura (`decision_config.json`) con T = 1.817, ajustada sobre datos de validación propios del autor. Esa temperatura no altera la respuesta seleccionada, solo la calibración de las probabilidades. El autor recomienda instalar `flash-linear-attention==0.5.2` para reproducir sus resultados, ya que sin esa librería transformers recurre a kernels PyTorch más lentos cuyas probabilidades pueden diferir ligeramente. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Decisión de opción múltiple sobre una o varias imágenes: recibe una pregunta con criterios y devuelve una probabilidad calibrada por cada clave de opción.
- Procesamiento de múltiples imágenes por petición: hasta 100 imágenes, compartiendo un presupuesto de 6.400 tokens de imagen.
- Manejo de resoluciones variables: desde 65.536 px (256×256) hasta 1,6 MP (1.638.400 px) por imagen, con lados en múltiplos de 32; las imágenes fuera de rango se reescalan automáticamente (LANCZOS, manteniendo aspecto).
- Procesamiento por lotes: método `engine.batch(...)` con un presupuesto configurable de tokens acolchados (`batch_tokens`, por defecto 32.000).
- Entrada de imágenes flexible: rutas de fichero, URLs `data:`, base64 en bruto o bytes.
- Calibración de probabilidades mediante temperatura ajustada.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni otras modalidades (audio, vídeo).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Verificación de daños en envíos: el modelo responde a preguntas binarias o de múltiples opciones sobre el estado de un paquete (por ejemplo, "¿está dañada la caja?") devolviendo una probabilidad calibrada, lo que permite fijar umbrales de escalado a revisión humana en logística.
- Control de calidad visual en líneas de producción: clasificación de defectos o conformidad de piezas a partir de una o varias imágenes por petición, aprovechando el presupuesto de 6.400 tokens de imagen para inspeccionar varias vistas de la misma pieza.
- Moderación de contenido visual: evaluación de imágenes frente a criterios predefinidos con opciones explícitas, usando las probabilidades para decidir entre aprobación automática, revisión manual o rechazo.
- Triaje en diagnóstico asistido por imagen: selección entre categorías predefinidas (por ejemplo, presencia o ausencia de un hallazgo) con probabilidad asociada, útil como señal previa en pipelines que requieren intervención de especialistas.
- Enrutamiento de documentos escaneados: clasificación de facturas, albaranes o formularios entre un conjunto cerrado de tipos documentales, con la ventaja de procesar varias páginas en una sola consulta.
- Evaluación de accesibilidad o usabilidad de interfaces: preguntas de opción múltiple sobre capturas de pantalla para auditar contraste, disposición o presencia de elementos, con salida probabilística apta para agregación estadística.
- Benchmarking y evaluación de modelos visuales: uso como componente de decisión dentro de suites de evaluación que requieren respuestas calibradas en lugar de texto libre.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Decision Index 0.4, vision leaderboard | Full score | 58,60 |
| Decision Index 0.4, vision leaderboard | Public vision score | 65,17 |
| Decision Index 0.3, suite pública de visión (12.210 peticiones, 11 benchmarks) | Public vision index (corregido por azar, ejecución propia) | 64,95 |

La ejecución sobre la suite pública de la edición 0.3 cubrió las 12.210 peticiones de los 11 benchmarks sin peticiones no soportadas ni errores, realizada en una única pasada sobre una A100 80GB PCIe.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,3 GB solo para los pesos en bf16, más el espacio para activaciones (variable según el número de imágenes y opciones).
- GPU recomendadas: A100 80GB PCIe (configuración usada por el autor para la ejecución de benchmarks); cualquier GPU con al menos 16-24 GB de VRAM debería poder alojar los pesos con margen para activaciones moderadas.
- GPU de consumo: cabe en tarjetas consumer de gama alta con 16 GB o más (por ejemplo, RTX 4080/4090 o superiores), siempre que el tamaño de lote y el número de imágenes se mantengan moderados.
- Opciones de despliegue: el autor proporciona `SieveVisionEngine` dentro del repositorio, cargable desde un ID de Hub o una carpeta local, con soporte de procesamiento por lotes. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Dependencias: torch 2.8.0, transformers >= 5.16, safetensors, pillow, huggingface_hub y, recomendado, flash-linear-attention 0.5.2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sieve-Vision-4B | 4.539 M | 6.400 tokens de imagen | Decisión visual con opciones múltiples | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B-Base | No disponible | No disponible | Modelo base multimodal generativo | No disponible en la información | Hugging Face |
| Otros modelos de decisión visual de la colección Sieve-Vision | No disponible | No disponible | Decisión visual | No disponible | Hugging Face (colección del autor) |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo no genera texto: no puede usarse para conversación, resumen, traducción ni generación libre; su única salida son probabilidades por opción.
- Solo soporta inglés; no se declara capacidad multilingüe.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- La calibración de probabilidades depende de la temperatura ajustada (T = 1.817) sobre datos propios del autor; puede no transferirse a dominios distintos.
- Sin `flash-linear-attention`, las probabilidades pueden diferir ligeramente de las reportadas, lo que afecta a la reproducibilidad.
- Límite de 100 imágenes por petición y presupuesto compartido de 6.400 tokens de imagen; las imágenes se reescalan automáticamente, lo que puede degradar detalles finos en imágenes de alta resolución.
- Riesgo de sesgos y alucinación no documentado en la información disponible; al tratarse de un fine-tune de un modelo base, puede heredar sesgos del corpus de entrenamiento original.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B-Base y de las dependencias (flash-linear-attention).
- No se documentan garantías de robustez ante imágenes adversariales o fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sthanika-ai/Sieve-Vision-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Colección Sieve-Vision: https://huggingface.co/collections/sthanika-ai/sieve-vision-6ad61203c0d53c2a58cc2f5b
- Sitio del autor (Sthānika AI): https://sthanika.ai/
- Sitio de Sieve: https://sieve.one/
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit oficial de Decision Index: https://github.com/apolinario/decision-index
