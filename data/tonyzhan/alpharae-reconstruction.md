# TonyZhan/AlphaRAE-Reconstruction

## Resumen

AlphaRAE-Reconstruction es un conjunto de checkpoints de reconstrucción para AlphaRAE, un códec de imagen RGBA (color y opacidad) construido sobre autoencoders de representación con un encoder DINOv3-L congelado y un decoder compartido entrenado. El modelo lo publica el usuario TonyZhan y resuelve la compresión y reconstrucción de imágenes con canal alfa (transparencia), un caso que los autoencoders de imagen habituales, entrenados sobre RGB, no cubren de forma nativa.

El repositorio contiene dos variantes: `codec_k7.pt`, con interfaz nativa de 256×256 píxeles, y `codec_k23.pt`, con interfaz de 1024×1024 píxeles. Ambos se entrenaron durante 50.000 actualizaciones y se exportan desde checkpoints originales sin conversión de precisión, verificando tensor a tensor contra los valores de origen. Cada fichero incluye el encoder congelado, el decoder compartido entrenado y los módulos aprendidos de detalle y lectura de reconstrucción, por lo que no requiere un checkpoint DINOv3 separado ni un inicializador RGB para inferencia.

Es relevante ahora porque aborda la reconstrucción conjunta de color y opacidad con autoencoders de representación, una línea de trabajo reciente en generación de imágenes, y porque publica únicamente los códecs de reconstrucción, dejando fuera los priors de generación y adaptadores. El repositorio ocupa 5,8 GB y la licencia es compuesta, derivada de RAEv2 y DINOv3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder de representacion con encoder DINOv3-L congelado y decoder compartido entrenado; modulos de detalle y lectura de reconstruccion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; interfaces nativas de 256×256 y 1024×1024 pixeles) |
| Tipos de cuantizacion | no disponible (checkpoints exportados sin conversion de precision, en precision original) |
| Idiomas soportados | no disponible (modelo de imagen, no linguistico) |
| Licencia | compuesta: alpharae-raev2-and-dinov3 (other), con avisos de RAEv2 y DINOv3 en LICENSE.md |
| Formato de pesos | PyTorch `.pt` (plain-tensor, cargables con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

AlphaRAE se plantea como un codec de reconstruccion RGBA basado en autoencoders de representacion: un encoder DINOv3-L congelado extrae representaciones de la imagen de entrada y un decoder compartido, entrenado junto con modulos de detalle y lectura de reconstruccion, reconstruye la imagen con color y opacidad (canal alfa en straight-alpha). El modelo opera internamente en RGB lineal y guarda PNG sRGB con alfa recto. Existen dos configuraciones: K7 con interfaz nativa de 256×256 y K23 con interfaz de 1024×1024.

El entrenamiento de ambos checkpoints publicados alcanza 50.000 actualizaciones. Los ficheros se exportan desde los checkpoints originales seleccionados sin conversion de precision y cada tensor se compara con su valor original; se omiten estados del optimizador, estado RNG, registros de datos de entrenamiento y rutas especificas de maquina. El repositorio publica solo los codecs de reconstruccion: no incluye priors de generacion ni adaptadores.

## Capacidades

- Reconstruccion de imagenes RGBA de 8 bits con alfa recto (straight-alpha).
- Compresion y decodificacion de color y opacidad de forma conjunta mediante un codec entrenado.
- Dos resoluciones nativas: 256×256 (K7) y 1024×1024 (K23).
- Conversion interna de espacio de color: entrada sRGB, procesamiento en RGB lineal, salida sRGB con alfa recto.
- Inferencia autocontenida: el encoder congelado y el decoder van incluidos en el checkpoint, sin necesidad de pesos DINOv3 externos.
- Pipeline de imagen a imagen (`image-to-image`) en PyTorch.
- No incluye generacion de imagenes desde texto ni priors generativos.
- No dispone de soporte documentado de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Canalizacion de assets con transparencia: reconstruir PNG RGBA de 256×256 o 1024×1024 en pipelines de produccion de graficos, manteniendo color y alfa de forma conjunta en lugar de tratar la opacidad como una mascara aparte.
- Preprocesado para modelos generativos de imagen: usar el codec como etapa de codificacion/decodificacion latente en flujos de edicion o sintesis que necesiten preservar transparencia, ya que el encoder DINOv3-L congelado aporta representaciones robustas.
- Investigacion en autoencoders de representacion: evaluar la calidad de reconstruccion de un codec RGBA frente a alternativas RGB, con dos puntos de resolucion comparables (256 y 1024).
- Compresion de sprites y recursos de interfaz: reducir el coste de almacenamiento de imagenes con alfa en catalogos de assets, reconstruyendo a la resolucion nativa del codec.
- Validacion de pipelines de color: comprobar el comportamiento de conversion sRGB/lineal y alfa recto en herramientas de procesado de imagen, usando los checkpoints como referencia reproducible.
- Reproduccion de experimentos: el repositorio incluye scripts de descarga e inferencia (`scripts.download_weights`, `scripts.infer`) que permiten reproducir la reconstruccion con `--codec k7` o `--codec k23` sin token de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 5,8 GB e incluye encoder DINOv3-L congelado, decoder y modulos auxiliares en dos checkpoints; el consumo real depende del codec cargado y de la resolucion (256×256 frente a 1024×1024).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del encoder DINOv3-L y la resolucion de 1024×1024 sugieren requisitos superiores a los de codecs ligeros, pero no hay datos publicados.
- Opciones de despliegue: inferencia mediante el repositorio oficial `TonyZhan10/AlphaRAE` (PyTorch), con `python -m scripts.infer --codec k7|k23`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de imagen de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de reconstruccion RGBA.

## Limitaciones y advertencias

- Solo se publican codecs de reconstruccion; no hay priors de generacion ni adaptadores, por lo que no sirve para sintetizar imagenes desde cero.
- Interfaces de resolucion fijas: 256×256 para K7 y 1024×1024 para K23; no se documenta soporte de otras resoluciones.
- Entrada restringida a PNG RGBA de 8 bits con alfa recto; otros formatos o espacios de color requieren conversion previa.
- Licencia compuesta (`other`, alpharae-raev2-and-dinov3) con materiales derivados de RAEv2 y DINOv3: es imprescindible revisar `LICENSE.md` y los avisos de atribucion antes de cualquier uso comercial.
- Sin datos publicados de sesgos, tasas de alucinacion (no aplica en sentido linguistico) ni evaluacion cuantitativa de calidad de reconstruccion.
- Repositorio sin descargas ni likes en el momento de la consulta (0 y 0), lo que limita la evidencia de uso en produccion.
- Ausencia de estados del optimizador y registros de entrenamiento en los checkpoints: no es posible reanudar el entrenamiento desde estos ficheros.

## Enlaces

- Hugging Face: https://huggingface.co/TonyZhan/AlphaRAE-Reconstruction
- Repositorio de codigo: https://github.com/TonyZhan10/AlphaRAE
- Licencia: LICENSE.md en el repositorio de Hugging Face
