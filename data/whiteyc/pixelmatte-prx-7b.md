# WhiteYC/PixelMatte-PRX-7B

## Resumen

PixelMatte-PRX-7B es un checkpoint especializado en *image matting* de alta fidelidad, es decir, la estimación de una máscara alfa continua (alpha matte) que separa primer plano y fondo en una imagen, incluyendo zonas semitransparentes como pelo, pelaje o cristal. Lo desarrolla Baihan Yang y colaboradores (entre ellos Xiaohui Xie y Truong Nguyen) y se publica bajo el identificador `WhiteYC/PixelMatte-PRX-7B`. El modelo resuelve el problema clásico del matting mediante un *diffusion transformer* en espacio de píxeles que predice la alfa a partir de una imagen y un trimap en una sola evaluación de red, sin VAE ni codificador de texto.

La relevancia técnica está en que evita el cuello de botella de los autoencoders latentes: al operar directamente en píxeles, conserva el detalle fino que los métodos latentes suelen perder en los bordes. El checkpoint parte del modelo base `Photoroom/prxpixel-t2i` (modelo texto-a-imagen de Photoroom) y le incorpora dos componentes propios, LayerShift y un High-Pass Refiner, todo empaquetado en un único fichero de pesos.

Con 7.004.979.873 parámetros (aproximadamente 7B) y 14 GB de pesos en bfloat16, es un modelo grande para una tarea de visión específica, lo que condiciona sus requisitos de hardware: unos 16 GB de VRAM para una entrada de 1024 x 1024. Su licencia Apache 2.0 facilita el uso comercial, aunque la información publicada es muy escasa en cuanto a benchmarks, idiomas y datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer en espacio de píxeles (sin VAE), con LayerShift y High-Pass Refiner |
| Parametros totales | 7.004.979.873 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada de imagen, lado corto 1024, lados múltiplos del tamaño de parche) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (modelo de visión, sin codificador de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 14.0 GB) y `config.json` |

## Arquitectura y entrenamiento

PixelMatte es un *diffusion transformer* que opera directamente sobre píxeles en lugar de en un espacio latente comprimido. La red recibe la imagen y el trimap (canal único del mismo tamaño que la foto: 0 fondo, 255 primer plano, valores intermedios, habitualmente 128, para la región desconocida) y predice la máscara alfa en una sola evaluación de red, sin VAE ni codificador de texto. El checkpoint integra en un único fichero el backbone heredado de `Photoroom/prxpixel-t2i`, el módulo LayerShift y el High-Pass Refiner, que presumiblemente refuerza las frecuencias altas responsables de los bordes finos.

La entrada se normaliza a un lado corto de 1024 píxeles, con ambos lados múltiplos del tamaño de parche, y la inferencia se ejecuta en bfloat16. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco se detalla el procedimiento exacto de ajuste fino sobre el modelo base. La model card remite al paper (arXiv:2611.34929) y al repositorio de código para los detalles de entrenamiento y evaluación.

## Capacidades

- Estimación de alpha matte de alta fidelidad a partir de imagen y trimap, con salida en coma flotante `[H, W]` en el rango `[0, 1]`.
- Predicción en una sola evaluación de red (*single network evaluation*), sin proceso iterativo de muestreo difusivo visible en la interfaz de uso.
- Manejo de regiones semitransparentes y bordes complejos (pelo, pelaje, cristal) gracias al refinador de altas frecuencias.
- Procesamiento en espacio de píxeles, sin VAE, lo que evita artefactos de reconstrucción en los bordes.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente visual de una sola tarea.
- No tiene capacidades multilingües ni de generación de texto; no incluye codificador de texto.
- No se documentan capacidades de visión general (VQA, detección, segmentación semántica) más allá del matting guiado por trimap.

## Casos de uso

- **Postproducción audiovisual y VFX**: extracción de alfa de alta calidad en planos con pelo o movimiento para composición sobre nuevos fondos; el modelo trabaja a 1024 px de lado corto, adecuado para planos de resolución media que luego se reescalan.
- **Comercio electrónico y fotografía de producto**: generación de recortes con bordes realistas para catálogos, sustitución de fondos y creación de imágenes de marketing; la licencia Apache 2.0 permite integrarlo en pipelines comerciales.
- **Edición fotográfica profesional**: separación de sujeto y fondo con control fino mediante trimap, útil en herramientas de retoque donde el usuario marca regiones conocidas y el modelo resuelve la zona desconocida.
- **Generación de datasets sintéticos**: producción de máscaras alfa de referencia para entrenar modelos de segmentación o matting más ligeros, usando PixelMatte como profesor.
- **Videoconferencia y *background replacement* de alta gama**: sustitución de fondo en tiempo casi real si se dispone de GPU con ~16 GB de VRAM; el coste por fotograma debe validarse empíricamente, ya que no se publican cifras de latencia.
- **Restauración y archivo de material histórico**: recuperación de recortes en imágenes escaneadas con bordes degradados, donde el refinador de altas frecuencias ayuda a preservar detalles.
- **Investigación en matting**: reproducción de los cuatro conjuntos de test del paper mediante el script de evaluación del repositorio, como línea base para comparar nuevos métodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que el repositorio de código contiene los comandos y el script de evaluación para los cuatro conjuntos de test del paper, pero no reproduce las cifras en la ficha de Hugging Face.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB para una entrada de 1024 x 1024 según la model card (pesos en bfloat16).
- GPU recomendadas: no se especifican modelos concretos; por memoria, encajan GPU de 24 GB o más (RTX 3090, RTX 4090, A100 40/80 GB, H100).
- En GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB); en tarjetas de 16 GB el margen es muy ajustado y no está garantizado. No cabe en GPU de 8-12 GB sin cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: el autor proporciona `PixelMattePipeline` en el repositorio `github.com/White-YC/pixelmatte` sobre PyTorch; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PixelMatte-PRX-7B | ~7B | Diffusion transformer en píxeles, sin VAE | Imagen + trimap, lado corto 1024 | Apache 2.0 | Hugging Face + código en GitHub |
| Modelos de matting clásicos (p. ej. basados en CNN o ViT) | no disponible | Regresión directa de alfa | Resolución variable | variable | no disponible |
| Modelos de matting latentes (basados en difusión con VAE) | no disponible | Difusión en espacio latente | Resolución variable | variable | no disponible |

No se dispone en la información proporcionada de cifras comparativas de rendimiento (SAD, MSE, Grad, Conn) frente a alternativas, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Requiere un trimap de entrada del mismo tamaño que la imagen; no funciona en modo totalmente automático sin guía del usuario.
- No se documentan sesgos; al ser un modelo de matting, los sesgos potenciales se relacionan con la distribución del dataset de entrenamiento (no publicada), que puede afectar a tipos de pelo, tonos de piel o materiales poco representados.
- Riesgo de artefactos en bordes o regiones ambiguas cuando el trimap es impreciso; la calidad depende críticamente de la calidad del trimap.
- Sin datos publicados de benchmarks, idiomas ni composición del dataset: la evaluación independiente es imprescindible antes de producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `Photoroom/prxpixel-t2i` y de cualquier dependencia del repositorio de código.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y la fecha de creación es muy reciente: no hay evidencia de comunidad ni de validación externa.
- El coste computacional (~16 GB de VRAM, 7B parámetros) es alto para una tarea de visión específica; en entornos con restricciones de memoria puede no ser viable.

## Enlaces

- [Hugging Face: WhiteYC/PixelMatte-PRX-7B](https://huggingface.co/WhiteYC/PixelMatte-PRX-7B)
- [Paper (arXiv:2611.34929)](https://arxiv.org/abs/2611.34929)
- [Project page](https://white-yc.github.io/pixelmatte/)
- [Código en GitHub](https://github.com/White-YC/pixelmatte)
- [Modelo base: Photoroom/prxpixel-t2i](https://huggingface.co/Photoroom/prxpixel-t2i)
