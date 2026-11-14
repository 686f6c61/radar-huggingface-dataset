# ycrainyu/spotclue-clip-vit-l14-q4

## Resumen

`spotclue-clip-vit-l14-q4` es una versión cuantizada a 4 bits en formato ONNX del codificador de imágenes de `openai/clip-vit-large-patch14`, publicada por el usuario `ycrainyu` para el proyecto SpotClue. No se ha reentrenado ningún componente: se parte de la revisión `32bd64288804d66eefd0ccbe215aa642df71cc41` del modelo original de OpenAI, se exporta a ONNX y se aplica cuantización `MatMulNBits` con bloques de 32 y esquema simétrico. El resultado es un único peso de 199 MB que produce embeddings de imagen de 768 dimensiones a partir de entradas de 1 × 3 × 224 × 224.

La motivación práctica es el despliegue en navegador: Transformers.js 4.3.2 carga el modelo con `CLIPVisionModelWithProjection` y `dtype: 'q4'` sobre WebGPU o WASM, de modo que la inferencia ocurre en el dispositivo del usuario sin enviar la imagen a ningún servidor. SpotClue añade una cabeza lineal propia sobre el embedding para sugerir los cinco países más probables y el sentido de circulación de una fotografía de calle.

El modelo es relevante para desarrolladores que necesitan extracción de características visuales ligera y privada en el cliente, no como modelo generativo ni como clasificador de propósito general. Su licencia declarada es MIT, aunque la model card del autor advierte que OpenAI sitúa fuera de alcance cualquier uso desplegado del CLIP original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-L/14 (codificador de visión de CLIP), exportado a ONNX |
| Parametros totales | no disponible (repo de 0,2 GB; peso ONNX de 199 MB en q4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 1 × 3 × 224 × 224) |
| Tipos de cuantizacion | 4 bits (`MatMulNBits`, bloques de 32, simétrico); el modelo base admite otras cuantizaciones no incluidas aquí |
| Idiomas soportados | no disponible (modelo de visión; no procesa texto) |
| Licencia | MIT (según el repositorio openai/CLIP); uso desplegado desaconsejado por OpenAI |
| Formato de pesos | ONNX (`onnx/vision_model_q4.onnxx`), más `config.json` del modelo base |

## Arquitectura y entrenamiento

Se trata de la torre visual de CLIP ViT-L/14, un Vision Transformer con parches de 14 píxeles y dimensión de embedding de 768, tal como se describe en Radford et al. (ICML 2021). El proceso aplicado aquí es exclusivamente de compresión y empaquetado: exportación a ONNX del codificador de imagen y cuantización de las operaciones MatMul a 4 bits con granularidad de bloque de 32 y cuantización simétrica. No hay ajuste fino, destilación ni cambios en los pesos más allá de la cuantización.

El preprocesado es el del modelo base: redimensionado del lado más corto a 224 píxeles con interpolación bicúbica, recorte central a 224 × 224, escalado a rango 0–1 y normalización con la media y desviación estándar de CLIP. La innovación destacable no está en el entrenamiento, sino en el formato: un peso único de 199 MB cargable por Transformers.js en el navegador, con soporte de WebGPU y WASM, que habilita inferencia local sin backend.

## Capacidades

- Extracción de características visuales: genera un embedding de 768 dimensiones por imagen (`image_embeds`).
- Clasificación zero-shot de imágenes cuando se combina con la torre de texto de CLIP (no incluida en este repositorio, que solo contiene el codificador visual).
- Base para cabezas lineales personalizadas, como la cabeza de país y sentido de circulación usada por SpotClue.
- Inferencia en el navegador mediante Transformers.js 4.3.2, con ejecución en WebGPU o WASM.
- Procesamiento local: la imagen no abandona el dispositivo del usuario.
- No soporta tool calling, agentes, generación de texto, razonamiento multi-turno ni capacidades multilingües: es un codificador visual puro.

## Casos de uso

- Sugerencia de ubicación geográfica a partir de fotografías de calle: cargar el modelo en el cliente, extraer el embedding y aplicar una cabeza lineal entrenada sobre una lista fija de países; el autor reporta un 55,5 % de acierto en primera opción y 79,3 % en top-5 sobre su conjunto G1 de 1.000 fotos.
- Búsqueda visual en aplicaciones web sin backend: indexar embeddings de 768 dimensiones generados en el navegador y comparar por similitud coseno contra un catálogo precalculado.
- Moderación o filtrado de imágenes en el cliente: usar el embedding como entrada a un clasificador ligero para descartar contenido antes de subirlo, manteniendo la privacidad.
- Etiquetado automático de fotos en aplicaciones de escritorio o PWA: generar características visuales offline y alimentar un modelo de tags entrenado localmente.
- Prototipado rápido de pipelines de visión: al ser ONNX y compatible con Transformers.js, permite validar ideas en demos web sin infraestructura GPU.
- Preprocesado para sistemas de recomendación visual: calcular embeddings de usuario e ítem en el dispositivo y reducir la carga del servidor.
- Aplicaciones de realidad aumentada o captura móvil: inferencia WASM/WebGPU con latencia aceptable para clasificación de escenas en tiempo casi real.

## Benchmarks y rendimiento

| Conjunto | Metrica | Resultado |
|---|---|---|
| SpotClue G1 (1.000 fotos de calle, test split de OpenStreetView-5M) | Acierto top-1 con cabeza de país de SpotClue | 55,5 % |
| SpotClue G1 (1.000 fotos de calle, test split de OpenStreetView-5M) | Acierto top-5 con cabeza de país de SpotClue | 79,3 % |

No se han publicado resultados de benchmarks estándar (ImageNet zero-shot, MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores corresponden a una tarea concreta con una cabeza lineal propietaria y no son comparables con evaluaciones genéricas de CLIP.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el peso ONNX q4 ocupa 199 MB, por lo que la memoria necesaria en GPU es del orden de unos pocos cientos de MB incluyendo activaciones y buffers.
- GPU recomendadas: cualquier GPU con soporte WebGPU para ejecución en navegador; en servidor, tarjetas con suficiente memoria para ONNX Runtime (A100, H100, RTX 4090, RTX 3090) aunque el modelo está sobredimensionado para ellas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con WebGPU; también en CPU vía WASM.
- Opciones de despliegue: Transformers.js 4.3.2 (WebGPU o WASM), ONNX Runtime, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles. El autor no publica cifras de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ycrainyu/spotclue-clip-vit-l14-q4` | no disponible (ViT-L/14, peso q4 de 199 MB) | Imagen 224 × 224, embedding 768 | Top-1 55,5 % / top-5 79,3 % en G1 de SpotClue | MIT (con advertencia de OpenAI) | Hugging Face, ONNX |
| `openai/clip-vit-large-patch14` | ViT-L/14 (aprox. 428 M en el codificador visual, no confirmado en la información) | Imagen 224 × 224, embedding 768 | Referencia completa en precisión original; cifras no disponibles aquí | MIT (con advertencia de OpenAI) | Hugging Face, PyTorch |
| `openai/clip-vit-base-patch32` | ViT-B/32 (aprox. 150 M, no confirmado) | Imagen 224 × 224, embedding 512 | Menor capacidad que ViT-L/14; cifras no disponibles aquí | MIT (con advertencia de OpenAI) | Hugging Face, PyTorch |
| `Xenova/clip-vit-base-patch32` (Transformers.js) | ViT-B/32 | Imagen 224 × 224, embedding 512 | No disponible | MIT | Hugging Face, ONNX |

La comparativa se limita a variantes de CLIP porque no se han proporcionado datos de otros codificadores visuales comparables en la información disponible.

## Limitaciones y advertencias

- La model card de OpenAI para CLIP declara fuera de alcance cualquier uso desplegado del modelo, comercial o no; la licencia MIT del repositorio no elimina esa advertencia.
- Solo contiene el codificador visual: no incluye la torre de texto, por lo que no permite clasificación zero-shot por sí solo sin un modelo de texto CLIP compatible.
- Solo se ha medido sobre fotos de calle del conjunto G1; el rendimiento en otros dominios (retratos, interiores, imágenes médicas) no está evaluado.
- Riesgo de sesgo geográfico y cultural: la cabeza de país de SpotClue se entrena sobre una lista fija de países y puede fallar en regiones poco representadas.
- Riesgo de alucinación en sentido amplio: el embedding no es interpretable y la cabeza lineal puede producir predicciones seguras pero erróneas.
- No debe usarse para reconocimiento de personas; el autor indica explícitamente que SpotClue no lo emplea con ese fin.
- La cuantización a 4 bits introduce pérdida de precisión respecto al modelo original; no se han publicado métricas de degradación.
- Sin datos de latencia ni throughput, no es posible garantizar requisitos de tiempo real en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ycrainyu/spotclue-clip-vit-l14-q4
- Modelo base: https://huggingface.co/openai/clip-vit-large-patch14
- Repositorio oficial de CLIP: https://github.com/openai/CLIP
- Paper de referencia: Radford et al., "Learning Transferable Visual Models From Natural Language Supervision", ICML 2021 (https://arxiv.org/abs/2103.00020)
- Transformers.js: https://github.com/huggingface/transformers.js
- Conjunto OpenStreetView-5M (origen de las fotos de evaluación): no disponible en la información proporcionada.
