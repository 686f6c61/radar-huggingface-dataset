# thelamapi/Next-Shift

## Resumen

Next Shift es un modelo de clasificación de imágenes publicado por el usuario thelamapi en Hugging Face (ID `thelamapi/Next-Shift`). No es un modelo de lenguaje ni un transformer generativo: se trata de una red convolucional pequeña (dos bloques convolucionales con BatchNorm, ReLU y max-pooling, seguidos de una capa densa de 64 dimensiones y una cabeza de 10 clases) diseñada para reconocer dígitos. Su propósito concreto es la adaptación de dominio (*domain adaptation*) en régimen *few-shot*: parte de un reconocedor entrenado sobre escaneos limpios de dígitos del conjunto UCI y lo adapta a un entorno visual nuevo (gris, bajo contraste, texturizado, rotado y desenfocado) usando solo un puñado de imágenes etiquetadas del dominio destino.

El modelo resuelve un problema clásico de puesta en producción: un clasificador que funciona bien en el dominio de origen se degrada drásticamente cuando cambian las condiciones de captura. En este caso, la precisión sobre el split de validación de origen es de 0,973, pero cae a 0,401 sobre el test del dominio destino sin adaptación. La técnica empleada combina AdaBN (reestimación de las estadísticas de BatchNorm con imágenes no etiquetadas del destino) y un ajuste fino de las capas superiores (el MLP) con las pocas etiquetas disponibles.

Es relevante ahora como ejemplo reproducible y didáctico de adaptación de dominio de bajo coste: el repositorio incluye pesos en safetensors, un cuaderno con la arquitectura, un espacio de Hugging Face que ejecuta el ajuste fino en el navegador mediante `nlrt.js` y una evaluación con cinco semillas. Su escala es mínima (imágenes de 16x16 píxeles, 900 imágenes de origen) y su licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN: 2 bloques convolucionales (16 y 32 canales, BatchNorm, ReLU, max-pool) → 512 características → fc 64 → 10 clases |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 16x16 píxeles) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (clasificación de dígitos) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (`source_model.safetensors`); inferencia en NumPy puro |
| Pipeline | image-classification |
| Etiquetas | domain-adaptation, few-shot, image-classification, next-lab |
| Tamaño del repositorio | 0,0 GB |
| Fecha de creación | 2026-11-19 |

## Arquitectura y entrenamiento

La arquitectura es una CNN compacta: dos bloques convolucionales con 16 y 32 canales respectivamente, cada uno con BatchNorm, ReLU y max-pooling, que producen una representación de 512 características; a continuación una capa densa de 64 dimensiones y una capa de salida de 10 clases (dígitos 0-9). El modelo fuente se preentrenó sobre 900 imágenes de origen del conjunto UCI de dígitos. No se especifica el número total de tokens ni una composición de dataset más allá de esa cifra de imágenes.

El procedimiento de adaptación de Next Shift consta de dos fases. Primero aplica AdaBN: reestima las estadísticas de BatchNorm sobre un pool de 350 imágenes de destino no etiquetadas. Después ajusta el MLP superior con 50 pasos de descenso de gradiente de lote completo y tasa de aprendizaje 0,05 sobre las etiquetas disponibles. El modelo compara este enfoque con tres alternativas: ajuste fino de la cabeza sin AdaBN, cabeza lineal sobre características de origen congeladas (200 pasos, lr 0,1) e inicialización aleatoria de toda la red con Adam (100 pasos, lr 0,001). Los pasos y tasas de aprendizaje se seleccionaron por método sobre un split de desarrollo de 100 imágenes de destino (semillas 100-102), nunca sobre el test. La implementación de navegador usa `nlrt.js` para las convoluciones y un port línea a línea del ajuste fino, con paridad verificada frente a Node (diferencia absoluta máxima de 5,41e-16).

## Capacidades

- Clasificación de imágenes de dígitos (10 clases, entrada de 16x16 píxeles en [0,1]).
- Adaptación de dominio few-shot: ajuste de las capas superiores con k etiquetas por clase (k=0, 1, 5, 10).
- Adaptación no supervisada de estadísticas mediante AdaBN sobre un pool de imágenes de destino sin etiquetar.
- Inferencia en NumPy puro a través de las funciones `load`, `adapt` y `predict`.
- Ejecución del ajuste fino en el navegador mediante el espacio de Hugging Face y `nlrt.js`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de visión de propósito específico.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- Reconocimiento de dígitos en capturas degradadas: adaptar un OCR de dígitos entrenado con escaneos limpios a fotos con bajo contraste, rotación o desenfoque usando diez etiquetas por clase, sin reentrenar desde cero.
- Digitalización de formularios y documentos históricos: el ajuste con AdaBN sobre un lote de imágenes del nuevo escáner permite recuperar precisión cuando cambian las condiciones de captura.
- Lectura de dígitos en entornos industriales: sensores o cámaras con iluminación distinta a la del conjunto de entrenamiento original; el modelo reestima estadísticas de normalización con imágenes no etiquetadas de la planta.
- Prototipado rápido en el navegador: el espacio de Hugging Face permite etiquetar unas pocas imágenes de destino y ver cómo se actualizan las predicciones sin infraestructura de GPU.
- Material docente sobre adaptación de dominio: el repositorio incluye ablaciones, cinco semillas y un split de desarrollo separado, lo que lo hace útil para explicar AdaBN y fine-tuning few-shot con resultados reproducibles.
- Validación de pipelines de etiquetado: sirve como referencia de línea base para comparar métodos de adaptación de dominio en clasificación de imágenes de pequeño tamaño.

## Benchmarks y rendimiento

Precisión en el test de destino (297 imágenes, 5 semillas, media ± desviación típica), según la model card:

| Método | k=0 | k=1 | k=5 | k=10 (etiquetas por clase) |
|---|---:|---:|---:|---:|
| Next Shift (AdaBN + fine-tune top) | 0,394 ± 0,000 | 0,489 ± 0,033 | 0,588 ± 0,021 | 0,661 ± 0,010 |
| Ablación: fine-tune top sin AdaBN | 0,401 ± 0,000 | 0,459 ± 0,042 | 0,589 ± 0,014 | 0,673 ± 0,009 |
| Características de origen congeladas + cabeza lineal | 0,401 ± 0,000 | 0,358 ± 0,031 | 0,558 ± 0,019 | 0,613 ± 0,022 |
| Inicialización aleatoria, mismas etiquetas y pasos | 0,099 ± 0,023 | 0,211 ± 0,022 | 0,467 ± 0,026 | 0,636 ± 0,050 |

Precisión solo con el modelo de origen: 0,973 en el split de validación de origen y 0,401 en el test de destino.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el modelo es una CNN de dos bloques convolucionales con imágenes de 16x16, ejecutable en CPU y en NumPy puro sin GPU.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una NVIDIA L4 según la model card.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el espacio de Hugging Face ejecuta el ajuste fino en el navegador.
- Opciones de despliegue: inferencia en NumPy mediante `inference.py` (`load`, `adapt`, `predict`), pesos en safetensors para PyTorch y ejecución en navegador con `nlrt.js`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Las alternativas internas evaluadas en la propia model card son ablaciones del mismo método, no modelos independientes:

| Alternativa | Tipo | Resultado en test de destino (k=10) | Licencia |
|---|---|---:|---|
| Next Shift | AdaBN + fine-tune top | 0,661 ± 0,010 | CC-BY-4.0 |
| Ablación sin AdaBN | Fine-tune top | 0,673 ± 0,009 | CC-BY-4.0 |
| Cabeza lineal congelada | Linear probe | 0,613 ± 0,022 | CC-BY-4.0 |
| Inicialización aleatoria | Entrenamiento desde cero | 0,636 ± 0,050 | CC-BY-4.0 |

## Limitaciones y advertencias

- El cambio de dominio es sintético (transformación de dígitos UCI reales) y las imágenes son diminutas (16x16); los cambios reales de sensores, iluminación o poblaciones pueden ser más difíciles.
- AdaBN requiere un lote de imágenes de destino sin etiquetar; el `conv_target` publicado se estimó sobre el pool de destino, lo que puede introducir dependencia del conjunto concreto.
- Con k=10 y semilla 0, 96 de las 297 imágenes del test de destino siguen clasificándose mal (precisión 0,661).
- La ablación sin AdaBN obtiene resultados ligeramente superiores en k=10 (0,673 frente a 0,661), por lo que la ventaja de AdaBN no es uniforme en todos los regímenes de etiquetas.
- No hay información sobre sesgos demográficos ni de otro tipo; al operar sobre dígitos, el riesgo de sesgo se limita a estilos de escritura y condiciones de captura.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea fuera de la distribución de entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos exactos antes de integrarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks externos independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next-Shift
- Espacio de demostración: https://huggingface.co/spaces/thelamapi/Next-Shift
- Conjunto de datos UCI Digits (origen de los datos): no disponible en la información proporcionada
- Artículo o blog del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
