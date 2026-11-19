# TonyZhan/AlphaRAE-ImageNet

## Resumen

AlphaRAE-ImageNet es un modelo de difusion condicionado por clase que genera activos RGBA de 256×256 píxeles a partir de un ID de clase de ImageNet (0-999) y una semilla aleatoria. Lo desarrolla el autor independiente TonyZhan y se publica bajo el paraguas del proyecto AlphaRAE, cuyo código está disponible en GitHub. El modelo no requiere imagen objetivo, canal alfa objetivo ni profesor de matting en inferencia: primero muestrea un DiT RGB condicionado por clase sin modificar y después aplica un adaptador específico de imagen y un decodificador RGBA K7 congelado.

La relevancia de esta publicación es acotada pero específica: cubre la generación de imágenes con canal alfa (transparencia) directamente desde un espacio latente, un caso que la mayoría de modelos de difusión de texto a imagen no resuelven de forma nativa. El repositorio ocupa 3,6 GB e incluye pesos del DiT, el adaptador RGBA, estadísticas latentes y un manifiesto con tamaños y ajustes de muestreo.

No se dispone de información sobre arquitectura interna detallada, número de parámetros, longitud de contexto (no aplica a un modelo de imagen) ni idiomas soportados. La model card es explícita sobre el alcance: generación condicionada por clase de ImageNet, sin generación condicionada por texto, y con licencias de componentes que deben revisarse antes de cualquier reutilización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) condicionado por clase + adaptador RGBA + decodificador K7 congelado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (sin condicionamiento por texto) |
| Licencia | other, nombre `alpharae-raev2-and-dinov3` (ver LICENSE.md) |
| Formato de pesos | `.pt` (PyTorch, cargables con `weights_only=True`) |
| Resolución de salida | 256×256 RGBA |
| Condicionamiento | ID de clase ImageNet (0-999, orden torchvision) + semilla |
| Pasos de muestreo | 100 pasos Euler, CFG=1, guidance interno=1.78 en [0.1,1], shift de transporte nativo 8 |
| Tamaño del repositorio | 3,6 GB |
| Librería | pytorch |

## Arquitectura y entrenamiento

El pipeline se compone de tres etapas encadenadas. En primer lugar, un DiT RGB condicionado por clase de ImageNet (exportado como EMA, solo modelo) muestrea una imagen RGB. A continuación, un adaptador específico de imagen (EMA del adaptador seleccionado) transforma esa representación para incorporar información de transparencia. Finalmente, un decodificador RGBA K7 congelado produce el canal alfa y la imagen RGBA final. El adaptador se entrenó durante 8.000 actualizaciones en su etapa final y 47.500 actualizaciones secuenciales en total.

El autor indica que todos los tensores exportados del prior y del adaptador se compararon exactamente con sus valores originales seleccionados, y que los estados del optimizador, registros de datos y rutas de la máquina de entrenamiento se omitieron. El decodificador RGB compartido (`training/rgb_k7_init.pt`) tiene sus 456 tensores de estado idénticos al decodificador RGB nativo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de ImageNet, ni si hubo RLHF/DPO (no aplica habitualmente a difusión, pero no se confirma).

La innovación técnica destacable es la generación nativa de RGBA sin profesor de matting ni imagen objetivo en inferencia, apoyada en un decodificador K7 y un adaptador entrenado sobre el prior RGB congelado. El muestreo usa 100 pasos Euler con CFG=1 y guidance interno de 1.78, lo que sugiere un esquema de guiado interno en lugar de classifier-free guidance clásico.

## Capacidades

- Generación de imágenes RGB de 256×256 condicionadas por ID de clase de ImageNet (0-999).
- Generación de canal alfa (transparencia) de forma nativa, produciendo RGBA en lugar de solo RGB.
- Salida de vistas auxiliares: RGB muestreado, RGBA con alfa directo, alfa predicho, vistas de fondo y un informe.
- Muestreo determinista por semilla, con ajustes fijos de pasos, CFG y guidance.
- No incluye generación condicionada por texto (el autor lo indica explícitamente).
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no aplican a este tipo de modelo).

## Casos de uso

- Generación de assets con transparencia para prototipado: dado un ID de clase (por ejemplo, 985 para margarita o 849 para tetera) y una semilla, se obtiene un PNG RGBA de 256×256 listo para composición sobre fondos, útil para maquetas y pruebas de interfaz.
- Aumento de datos con alfa sintético: el modelo puede generar variantes RGBA por clase para entrenar o evaluar pipelines de segmentación y matting, ya que produce alfa predicho junto a la imagen.
- Investigación en generación con transparencia: sirve como referencia reproducible para estudiar la incorporación de alfa en modelos de difusión sin profesor de matting, comparando el alfa directo con el alfa predicho.
- Evaluación de decodificadores latentes: al exponer el decodificador K7 y las estadísticas latentes, permite analizar la fidelidad de reconstrucción y la normalización de detalles.
- Composición sobre fondos en pipelines gráficos: las vistas de fondo y el RGBA permiten integrar los resultados en herramientas de composición sin trabajo manual de recorte.
- Docencia y demostraciones de difusión condicionada por clase: el muestreo con semilla fija y ajustes documentados facilita reproducir resultados en clases y entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las imágenes son muestras cualitativas y no reconstrucciones emparejadas con ground-truth, por lo que no se aportan métricas como FID, IS ni precisión de alfa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio pesa 3,6 GB, lo que da una cota inferior orientativa para cargar los pesos, pero no se especifica el consumo en ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; no se indica si cabe en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: el autor proporciona scripts propios (`scripts.download_generation_weights` y `scripts.generate_imagenet`) sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de este tipo).
- Latencia y throughput: no disponibles. Solo se conoce el coste de muestreo en pasos (100 pasos Euler).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de generación RGBA condicionada por clase ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo solo acepta IDs de clase de ImageNet (0-999); no admite prompts de texto ni condicionamiento semántico libre.
- La resolución de salida está fijada en 256×256; no se documenta soporte para otras resoluciones.
- Las imágenes son muestras cualitativas, no reconstrucciones emparejadas con ground-truth, por lo que no deben usarse como referencia de fidelidad exacta.
- La licencia es `other` con nombre `alpharae-raev2-and-dinov3`; es imprescindible revisar LICENSE.md y las licencias de los componentes (incluido DINOv3 y el codec K7) antes de cualquier uso comercial.
- Riesgo de sesgos y alucinación: no evaluado en la información disponible; al entrenar sobre ImageNet, hereda los sesgos de representación de dicho dataset.
- No se documentan limitaciones idiomáticas ni multilingües porque el modelo no procesa texto.
- Para producción, conviene verificar la reproducibilidad del muestreo (semilla, pasos y guidance fijos) y el coste computacional real, que no se detalla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TonyZhan/AlphaRAE-ImageNet
- Repositorio de código AlphaRAE: https://github.com/TonyZhan10/AlphaRAE
- Modelo de reconstrucción relacionado: https://huggingface.co/TonyZhan/AlphaRAE-Reconstruction
