# timm/qwen3_vit_306m_enc.qwen3_5_4b

## Resumen

qwen3_vit_306m_enc.qwen3_5_4b es un encoder de características de imagen extraído del modelo multimodal Qwen3.5-4B y reempaquetado por el equipo de timm (PyTorch Image Models). No es un modelo nuevo ni ha sido entrenado de forma independiente: se trata de los pesos nativos de la torre de visión de Qwen3.5-4B, incluyendo el merger espacial y la proyección al ancho del modelo de lenguaje, remapeados al formato de timm con un kernel convolucional temporal colapsado. El checkpoint resultante tiene 332.727.808 parámetros (332,7 M) y no contiene pesos de lenguaje ni cabeza de clasificación entrenada.

Su problema objetivo es la extracción de características visuales en pipelines multimodales: recibe una imagen de 768×768 píxeles y devuelve 576 tokens espaciales proyectados a un ancho de 2560, exactamente el formato que consumiría el LLM de Qwen3.5-4B. Esto lo hace relevante para quienes necesitan reproducir, auditar o reutilizar la parte visual de Qwen3.5-4B fuera del stack completo, o para construir sistemas de recuperación y clasificación de imágenes sobre embeddings ya alineados con ese modelo.

La arquitectura es un vision transformer (ViT) con MLPs GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial. El repo ocupa 1,3 GB en safetensors y se distribuye bajo licencia Apache 2.0. En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 likes, por lo que no existe validación comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) con MLPs GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial; incluye merger espacial y proyeccion al ancho del LLM |
| Parametros totales | 332.727.808 (332,7 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. No es un modelo de lenguaje; una imagen de 768×768 produce 576 tokens espaciales proyectados |
| Tipos de cuantizacion | No disponible. El repo solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | No disponible / no aplica. Es un encoder de imagen sin capacidades linguisticas |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (checkpoint timm, 1,3 GB) |
| Tamano de imagen | 768 × 768 (entradas rectangulares admitidas si cada dimension es divisible por 16; por 32 si se usa el merger 2×2) |
| Ancho del backbone | 1024 |
| Ancho de proyeccion | 2560 |
| GMACs | 974,8 |
| Activaciones | 2610,9 M (cifra agregada reportada por timm) |
| Normalizacion de entrada | mean = (0.5, 0.5, 0.5), std = (0.5, 0.5, 0.5) |
| Modelo base | Qwen/Qwen3.5-4B (revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a) |
| Libreria | timm |
| Tarea (pipeline) | image-feature-extraction |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo es un transformer de visión puro, sin componentes de estado (no es SSM ni híbrido). El backbone tiene un ancho de 1024 y produce mapas de características de 48×48 para una entrada de 768×768 (es decir, parcheo de 16 píxeles). Sobre ese backbone se aplica un merger espacial y una proyección lineal que llevan los tokens hasta un ancho de 2560, que es la dimensión de entrada esperada por el LLM de Qwen3.5-4B. Las MLP usan activación GELU-tanh, las posiciones son absolutas y aprendidas (interpoladas para la rejilla de entrada real) y se añade RoPE 2D axial regenerado en cada resolución.

No ha habido entrenamiento adicional: la model card indica explícitamente que es un remapeo nativo de los pesos de visión originales. La adaptación a imagen única implica colapsar el kernel temporal Conv3d sumando sus pesos en un Conv2d, de modo que la entrada de imagen replica un único fotograma a lo largo del kernel temporal original. Tampoco se publica la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO en el modelo origen; toda esa información queda fuera del alcance de esta ficha. No se documenta ninguna innovación adicional de decodificación o atención (por ejemplo, atención lineal o decodificación especulativa), ya que el checkpoint es un extractor de características y no genera tokens.

## Capacidades

- Extraccion de caracteristicas de imagen: `forward()` devuelve tokens espaciales fusionados y proyectados con forma (1, 576, 2560).
- Caracteristicas crudas del backbone: `forward_features()` devuelve un tensor NHWC de forma (1, 48, 48, 1024) sin normalizar.
- Mapas de caracteristicas intermedios: `forward_intermediates()` permite obtener activaciones de capas concretas, por ejemplo (1, 1024, 48, 48) con formato NCHW.
- Soporte de entradas rectangulares, siempre que cada dimension sea divisible por 16 (o por 32 en variantes con merger 2×2).
- Interpolacion de posiciones absolutas y regeneracion de RoPE 2D para la rejilla de entrada concreta.
- Integracion nativa con timm: creacion via `timm.create_model('hf-hub:timm/qwen3_vit_306m_enc.qwen3_5_4b', pretrained=True)` y data config resuelta automaticamente.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa ni genera texto.
- No incluye cabeza de clasificacion entrenada; el pooling para clasificacion queda a cargo del usuario.
- No procesa video ni senal temporal: el kernel temporal Conv3d original se ha sumado en un Conv2d para uso con imagen unica.

## Casos de uso

- Preprocesado visual en pipelines multimodales: reutilizar exactamente la torre de visión de Qwen3.5-4B para alimentar un LLM con los 576 tokens de 2560 dimensiones que espera, sin cargar el modelo completo durante las fases de indexado o precomputo de embeddings.
- Recuperacion de imagenes (image retrieval): generar embeddings de 576×2560 por imagen y construir un indice vectorial para busqueda por similitud, aprovechando que los vectores están alineados con el espacio de Qwen3.5-4B.
- Clasificacion de imagenes con cabeza propia: congelar el encoder y entrenar una cabeza lineal o MLP sobre las caracteristicas crudas de 48×48×1024, una aproximacion habitual cuando se dispone de pocos datos etiquetados.
- Segmentacion y tareas densas: usar `forward_intermediates()` para obtener mapas a resolucion espacial completa (48×48) y alimentar cabezas de segmentacion semantica o deteccion ligera.
- Auditoria y reproducibilidad del componente visual de Qwen3.5-4B: al ser un remapeo sin entrenamiento adicional, permite comparar el comportamiento del encoder aislado frente al modelo completo y verificar que la extraccion de caracteristicas se mantiene.
- Destilacion y alineamiento vision-lenguaje: usar los tokens proyectados como objetivo o como entrada para entrenar adaptadores, proyectores o modelos estudiantes mas pequenos.
- Control de calidad visual en entornos industriales: extraer caracteristicas a 768×768 de imagenes de linea de produccion y detectar anomalias mediante distancia a un centroide o a un modelo de densidad entrenado sobre caracteristicas normales.
- Indexacion de corpus fotograficos a gran escala: precomputar embeddings con `torch.inference_mode()` en lotes, ya que el modelo es lo bastante pequeno (332,7 M de parametros) para ejecutarse en GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ImageNet, COCO, retrieval ni ninguna otra tarea de evaluacion, y la busqueda web solo devuelve documentacion general de la libreria timm. Los unicos datos cuantitativos publicados son de coste computacional, no de calidad:

| Metrica | Valor |
|---|---|
| Parametros | 332,7 M |
| GMACs | 974,8 |
| Activaciones | 2610,9 M |
| Resolucion de entrada | 768 × 768 |
| Tokens de salida proyectados | 576 |
| Ancho de proyeccion | 2560 |

## Requisitos de hardware

- Peso del checkpoint: 332,7 M de parametros. En fp32 ocupa aproximadamente 1,33 GB (coincide con el tamano de repo de 1,3 GB); en bf16/fp16 baja a unos 0,67 GB.
- Memoria durante la inferencia: el modelo declara 2610,9 M de activaciones agregadas, por lo que el pico de memoria intermedio supera al de los pesos. Para lote 1 a 768×768 conviene reservar entre 8 y 12 GB de VRAM, dependiendo del backend y de si se usan mapas intermedios.
- GPU recomendadas: cualquier GPU con 12 GB o mas. Una RTX 3060 de 12 GB o una RTX 4070 son suficientes para lote 1; una RTX 4090 o una A100/H100 permiten lotes grandes con margen amplio.
- Cabe en GPU de consumo: si. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes ejecutan el modelo sin problemas en fp16/bf16.
- Opciones de despliegue: timm sobre PyTorch es la via soportada de forma nativa (incluye `timm.data.resolve_model_data_config` y `create_transform`). Es exportable a ONNX y compatible con `torch.compile`. vLLM, TGI, llama.cpp y Ollama no aplican, porque no es un modelo generativo de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imagenes por segundo en ninguna GPU concreta.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este checkpoint, por lo que la comparacion se limita a caracteristicas estructurales. Las cifras de los modelos alternativos provienen de sus fichas publicas habituales y no han sido verificadas en la busqueda realizada para esta ficha.

| Modelo | Parametros | Entrada tipica | Licencia | Enfoque |
|---|---|---|---|---|
| qwen3_vit_306m_enc.qwen3_5_4b | 332,7 M | 768 × 768 | Apache 2.0 | Encoder nativo de un LLM multimodal, con proyeccion a ancho 2560 |
| DINOv2 ViT-L/14 | aprox. 300 M | 518 × 518 (interpolable) | Apache 2.0 | Auto-supervisado, orientado a caracteristicas genericas |
| CLIP ViT-L/14 | aprox. 428 M | 224 × 224 | MIT | Contrastivo imagen-texto, con torre de texto |
| SigLIP So400m/14 | aprox. 878 M | 384 × 384 | Apache 2.0 | Contrastivo sigmoide imagen-texto, con torre de texto |

Diferencias clave: a diferencia de DINOv2, CLIP o SigLIP, este checkpoint no es un modelo autocontenido de proposito general, sino el extractor de la torre de vision de un modelo mayor, con la ventaja de que sus embeddings son directamente compatibles con Qwen3.5-4B y la desventaja de que carece de cabeza de clasificacion y de evaluacion publica. Ademas, su entrada base de 768×768 es mayor que la de CLIP ViT-L/14, lo que encarece cada inferencia (974,8 GMACs) frente a alternativas a 224 píxeles.

## Limitaciones y advertencias

- No contiene pesos de modelo de lenguaje ni cabeza de clasificacion entrenada: cualquier tarea supervisada requiere anadir y entrenar una cabeza.
- Sin procesamiento temporal: el kernel Conv3d original se ha colapsado en Conv2d, por lo que no admite video ni secuencias de fotogramas.
- Restricciones de forma de entrada: cada dimension debe ser divisible por 16, y por 32 si se usa una variante con merger 2×2. Las imagenes que no cumplan esto deben redimensionarse o recortarse.
- Normalizacion fija: la transformacion de timm usa media y desviacion 0.5 en los tres canales. Aplicar otra normalizacion degrada las caracteristicas sin aviso explicito.
- `forward_features()` devuelve caracteristicas crudas sin normalizar; usarlas directamente para similitud coseno o como entrada a una cabeza puede requerir una normalizacion previa.
- Sesgos conocidos: no disponibles. Al ser un remapeo sin entrenamiento adicional, hereda los sesgos del dataset de entrenamiento de Qwen3.5-4B, cuya composicion no se documenta en esta ficha.
- Riesgo de alucinacion: no aplica en sentido estricto, porque el modelo no genera texto. Si puede producir embeddings poco fiables en dominios alejados de su distribucion de entrenamiento, lo que se traduce en recuperaciones o clasificaciones erroneas.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Licencia: Apache 2.0, que permite uso comercial y modificacion. Conviene verificar igualmente la licencia del modelo origen Qwen/Qwen3.5-4B enlazada en la model card, ya que el checkpoint la declara como fuente.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de redactar la ficha, sin issues ni evaluaciones de terceros.
- Fecha de publicacion reciente (2026-09-10) y sin historial de revisiones mas alla de la revision de origen citada.
- No se documentan versiones cuantizadas ni formatos alternativos (ONNX, GGUF), por lo que el despliegue en entornos con memoria muy limitada exige una conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/qwen3_vit_306m_enc.qwen3_5_4b
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Revision de origen: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Licencia del modelo origen: https://huggingface.co/Qwen/Qwen3.5-4B/blob/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio de PyTorch Image Models: https://github.com/huggingface/pytorch-image-models
- Organizacion timm en HuggingFace: https://huggingface.co/timm
- Documentacion de timm en HuggingFace: https://huggingface.co/docs/timm/index
- Documentacion de timm: https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/
