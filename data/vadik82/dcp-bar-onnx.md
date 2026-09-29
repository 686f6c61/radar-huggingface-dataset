# vadik82/dcp-bar-onnx

## Resumen

dcp-bar-onnx (identificador `vadik82/dcp-bar-onnx`) es una conversion a formato ONNX del checkpoint TensorFlow de la version beta de DeepCreamPy v2, concretamente la red de inpainting conocida como "bar net". DeepCreamPy es un proyecto historico de la comunidad dedicado a reconstruir automaticamente las zonas de las imagenes de manga y anime que han sido censuradas mediante barras, mosaicos o marcas solidas. El autor de esta ficha, vadik82, no es el creador del modelo original, sino que publica una conversion para su uso con herramientas que consumen ONNX.

El modelo no es un modelo de lenguaje ni un modelo generativo generalista: se trata de una red de inpainting de imagen especializada. Su contrato de entrada es una recorte (crop) de 1x256x256x3 con valores normalizados en el rango [-1,1], acompanado de una mascara `input_mask` donde el valor 1 indica "conservar" y el valor 0 indica "reconstruir". La salida, `output_image`, es una imagen reconstruida en el mismo rango [-1,1]. Esto lo situa en el ambito del procesado de imagen por parche, no en el de la generacion de texto o codigo.

La relevancia de esta publicacion es practica: el release original de DeepCreamPy v2.2.0-beta solo distribuia checkpoints en formato TensorFlow y no incluia licencia explicita, lo que dificultaba su integracion en pipelines modernos basados en ONNX. Esta conversion permite reutilizar los pesos dentro de herramientas compatibles (en concreto, la cadena de procesado `mangosh`) sin depender de TensorFlow. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano reportado de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de inpainting de imagenes (arquitectura interna no detallada en la informacion disponible; procede de la red "bar" de DeepCreamPy v2 beta) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto; procesa entradas de 256x256x3) |
| Tipos de cuantizacion | no disponible (se distribuye en formato ONNX) |
| Idiomas soportados | no disponible (modelo de imagen, no procesa lenguaje) |
| Licencia | other (los pesos originales de DeepCreamPy no incluyen licencia explicita; se atribuyen a los autores originales y se replica para uso personal e interoperabilidad) |
| Formato de pesos | ONNX (convertido desde checkpoint TensorFlow mediante `mangosh tools/convert-dcp-onnx.py`) |

## Arquitectura y entrenamiento

Segun la model card, este artefacto es una conversion del checkpoint TensorFlow de la red de inpainting "bar" incluida en el release DeepCreamPy v2.2.0-beta (el checkpoint identificado como "09-11-2019 DCPv2 model"). La conversion se realiza con la herramienta `tools/convert-dcp-onnx.py` del proyecto `mangosh`, que transforma el checkpoint de TensorFlow a un grafo ONNX. No se detalla en la informacion proporcionada ni el numero de parametros, ni la arquitectura concreta de la red (numero de capas, uso de U-Net u otra topologia), ni la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas de refinamiento como RLHF o DPO (que, en cualquier caso, no son habituales en modelos de inpainting).

La interfaz del modelo es una innovacion relevante desde el punto de vista de integracion: en lugar de reconstruir toda la imagen, trabaja por parches de 256x256 con una mascara binaria de conservacion/reconstruccion. Esto permite aplicar el modelo localmente sobre las regiones censuradas de un panel de manga, conservando intacto el resto de la imagen. El rango de valores [-1,1] tanto en entrada como en salida es coherente con la normalizacion tipica de las redes generativas de imagen de esa epoca. No se documenta en la informacion disponible si el modelo usa atencion, convoluciones dilatadas, decodificacion especulativa (concepto no aplicable aqui) ni ninguna otra tecnica interna adicional.

## Capacidades

- Inpainting de imagenes: reconstruye regiones marcadas por la mascara a partir de un parche de 256x256 pixeles.
- Eliminacion de censura en manga y anime: esta especializado en reconstruir zonas ocultas por barras solidas (de ahi el nombre "bar net").
- Procesado por regiones: gracias a la mascara `input_mask`, solo reconstruye las zonas indicadas y conserva el resto del parche.
- Integracion en pipelines ONNX: al estar en formato ONNX, puede ejecutarse en runtimes compatibles (ONNX Runtime, etc.) sin dependencia de TensorFlow.
- Integracion en la herramienta mangosh: el modelo se descarga via `mangosh models download` como `decensor_bar.onnx` en `assets/model/dcp-bar/` y se usa en la etapa `decensor` con la clave de registro `dcp-bar`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, agentes ni razonamiento multi-paso. No es un modelo multimodal en el sentido de entrada de lenguaje: su unica entrada es imagen mas mascara.
- Capacidades multilingues: no aplica.

## Casos de uso

- Limpieza de scans de manga para scanlation: aplicar el modelo sobre paneles con censura por barra para reconstruir la zona oculta antes de publicar la traduccion, conservando el resto del arte intacto gracias a la mascara de conservacion.
- Restauracion de archivos de manga censurados en ediciones locales: recuperar el dibujo original en colecciones digitales que han sufrido censura editorial, procesando la imagen por parches de 256x256.
- Preprocesado para pipelines de vision por computador: generar imagenes "limpias" a partir de material censurado para usarlas como entrada de otros modelos de deteccion o clasificacion, evitando que las barras contaminen el dataset.
- Automatizacion dentro de mangosh: integrar la etapa `decensor` con la clave `dcp-bar` en un flujo de procesado por lotes de capitulos completos, descargando el modelo con `mangosh models download`.
- Investigacion en inpainting de dominio especifico: usar el modelo como referencia o baseline para comparar tecnicas modernas de inpainting (LaMa, MAT, etc.) en el dominio concreto del manga y el anime.
- Construccion de datasets de entrenamiento: producir pares (imagen censurada, imagen reconstruida) para entrenar o evaluar modelos de inpainting posteriores.
- Prototipado rapido en CPU: al ser un modelo pequeno por parche y en formato ONNX, permite probar el flujo de decensurado en equipos sin GPU dedicada.
- Conservacion de patrimonio digital: reconstruir ediciones antiguas o danadas donde parte del contenido fue tapado o reemplazado, manteniendo el estilo grafico original del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (PSNR, SSIM, LPIPS ni similares) ni comparaciones numericas con otros modelos de inpainting.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Al trabajar sobre parches de 256x256x3 y ser una red de inpainting pequena, el consumo es bajo y cabe holgadamente en GPUs de gama baja o incluso en CPU.
- GPU recomendadas: no especificadas en la informacion disponible. Por el tamano del parche de entrada, cualquier GPU con unos pocos GB de VRAM (incluidas integradas modernas) deberia ser suficiente; no se requiere una A100 ni una H100.
- Compatibilidad con GPU de consumo: previsiblemente si en practicamente cualquier GPU de consumo reciente, dado el tamano reducido de la entrada. No confirmado con datos oficiales.
- Opciones de despliegue: ONNX Runtime (principal, dado el formato de pesos), y la herramienta `mangosh` mediante `mangosh models download` y la etapa `decensor`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| dcp-bar-onnx (este modelo) | Red de inpainting ONNX (DeepCreamPy v2 bar net) | Parche 256x256x3 + mascara | other (upstream sin licencia explicita) | HuggingFace (vadik82/dcp-bar-onnx) |
| DeepCreamPy v2.2.0-beta (original) | Red de inpainting TensorFlow | Parche con mascara | Sin licencia explicita en el release | GitHub (Deepshift/DeepCreamPy) |
| Modelos de inpainting genericos (LaMa, MAT) | Redes de inpainting modernas | Variable, mayor resolucion | Diversas | Repositorios publicos |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a aspectos de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia ambigua: el release original de DeepCreamPy no incluye licencia explicita. Los pesos pertenecen a los autores originales y esta conversion se ofrece para uso personal e interoperabilidad. El uso comercial es juridicamente arriesgado y no esta autorizado de forma clara.
- Riesgo de reconstruccion imprecisa: al ser un modelo de inpainting, la zona reconstruida es una estimacion; la alucinacion de detalles anatomicos o de lineas de dibujo puede producir resultados que no coinciden con la intencion del autor original.
- Ambito muy restringido: el modelo solo hace inpainting de imagenes en el dominio manga/anime y solo con entradas de 256x256 con mascara. No sirve para otras tareas.
- Resolucion limitada: trabaja por parches de 256x256, lo que exige trocear imagenes grandes y puede generar costuras (seams) entre parches si no se solapan o se mezclan adecuadamente.
- Sin datos de entrenamiento documentados: no se especifica el dataset, el numero de tokens/pasos ni el proceso de entrenamiento, lo que dificulta evaluar sesgos o comportamientos esperados.
- Idiomas: no aplica, pero no debe esperarse ningun soporte de texto ni de indicaciones en lenguaje natural.
- Cero traccion en el repositorio: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Mantenimiento incierto: no se documenta si el autor actualizara la conversion ni si hay soporte para incidencias.
- Posible obsolescencia tecnica: DeepCreamPy es de 2019; los modelos de inpainting modernos suelen ofrecer mejor calidad en la mayoria de escenarios.

## Enlaces

- HuggingFace: https://huggingface.co/vadik82/dcp-bar-onnx
- Repositorio upstream DeepCreamPy: https://github.com/Deepshift/DeepCreamPy
- Release DeepCreamPy v2.2.0-beta (checkpoint "09-11-2019 DCPv2 model"): disponible dentro del repositorio de GitHub anterior
- Herramienta de conversion `mangosh tools/convert-dcp-onnx.py`: no se proporciona URL en la informacion disponible
