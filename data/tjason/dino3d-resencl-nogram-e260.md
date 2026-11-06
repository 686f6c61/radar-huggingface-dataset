# TJason/DINO3D-ResEncL-NoGram-E260

## Resumen

DINO3D-ResEncL-NoGram-E260 es un encoder convolucional 3D nativo de tipo DINO, desarrollado por el autor TJason como material complementario del articulo "Benchmarking Self-Supervised 3D Medical Vision Foundation Models and Transferability Estimation" (arXiv:2610.17573v1). Se trata de la release del encoder estudiante correspondiente a la epoca 260 del modelo 772 del benchmark, pensada para extraccion de caracteristicas en imagenes medicas volumetricas.

El modelo resuelve el problema de disponer de un backbone 3D preentrenado de forma auto-supervisada (DINO) que pueda servir como extractor de caracteristicas para tareas medicas volumetricas sin necesidad de reentrenar desde cero. Es relevante porque libera pesos verificables (con SHA256 y comprobacion de ida y vuelta de tensores) de un encoder que, de otro modo, quedaria inaccesible dentro del benchmark.

Arquitecturalmente es una CNN 3D nativa con disposicion de seis etapas estilo ResEncL, con 90.398.529 parametros, entrada monocanal `[B,1,D,H,W]` y salida de seis mapas de caracteristicas 3D con canales `[32,64,128,256,320,320]` y strides acumulados `[1,2,4,8,16,32]`. No es un transformer ni un checkpoint oficial de DINOv3 de Meta; es un modelo PyTorch nativo, no compatible con `AutoModel` de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 3D nativa estilo DINO con disposicion de seis etapas tipo ResEncL (bloques por etapa `[1,3,4,6,6,6]`) |
| Parametros totales | 90.398.529 (incluye el token de mascara nativo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision 3D, no de texto) |
| Tipos de cuantizacion | no disponible (solo se documentan pesos safetensors en precision original) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (carga estricta de estado en PyTorch nativo) |

## Arquitectura y entrenamiento

Se trata de una CNN 3D nativa con preentrenamiento auto-supervisado de tipo DINO. La red tiene seis etapas con canales `[32,64,128,256,320,320]` y strides acumulados `[1,2,4,8,16,32]`, con `[1,3,4,6,6,6]` bloques por etapa. La vista de preentrenamiento registrada es `nnsslPlans_onemmiso`, con parches globales de cubo de 160 y recortes locales de cubo de 96. El plan del benchmark modelo 772 usa remuestreo isótropo de 1 mm y normalizacion Z-score, con el preprocesamiento fuera del loader.

La release contiene unicamente el encoder estudiante de la epoca 260 (extraido de `openmind_resencl_nogram_epoch260.pth`), seleccionado por el loader `load_cnn_dino_encoder` del benchmark. Se excluyen el encoder profesor EMA, ambas cabezas de proyeccion, el optimizador, las listas de muestras de entrenamiento, los logs y los pesos de tareas downstream. La configuracion registrada no incluye checkpoint de inicializacion. El campo generico de variante del codigo de entrenamiento no altera la arquitectura CNN real. El modelo incluye un token de mascara nativo y no proporciona decoder de segmentacion.

## Capacidades

- Extraccion de caracteristicas 3D nativas: genera seis mapas de caracteristicas volumetricos con canales `[32,64,128,256,320,320]` y strides `[1,2,4,8,16,32]`.
- Procesamiento de imagenes medicas volumetricas monocanal `[B,1,D,H,W]` (por ejemplo, TC o RM preprocesadas a 1 mm isótropo y normalizadas con Z-score).
- Representaciones auto-supervisadas de tipo DINO, utiles como backbone congelado para tareas downstream.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente visual.
- No tiene capacidades linguisticas ni multilingues.
- No incluye modo thinking, vision 2D, audio ni generacion de texto.
- Sirve como base para transferencia: el propio articulo evalua la estimacion de transferibilidad de este tipo de encoders.

## Casos de uso

- Segmentacion medica volumetrica: usar el encoder congelado como extractor de caracteristicas y anadir un decoder especifico de la tarea (por ejemplo, U-Net 3D) para segmentar organos o lesiones en TC o RM, aprovechando las seis escalas de caracteristicas.
- Clasificacion de volumenes medicos: agregar las caracteristicas de la ultima etapa (stride 32) mediante pooling global y entrenar un clasificador lineal o MLP para diagnosticos binarios o multiclase.
- Deteccion de anomalias en imagenes medicas: comparar representaciones de estudios con un banco de referencia sano para identificar regiones o volumenes atipicos, gracias a las caracteristicas auto-supervisadas.
- Registro y recuperacion de imagenes medicas: emplear los embeddings globales para busqueda por similitud en bases de datos de estudios volumetricos o para inicializar pipelines de registro.
- Investigacion en transferibilidad: utilizar el encoder como uno de los modelos del benchmark para estimar la transferibilidad a tareas downstream, tal como plantea el articulo asociado.
- Preentrenamiento como inicializacion: partir de estos pesos como inicializacion para fine-tuning en dominios medicos especificos (por ejemplo, resonancia cardiaca o pulmonar) cuando el dataset propio es pequeno.
- Extraccion de caracteristicas para modelos multimodales: combinar los mapas 3D con informacion clinica tabular en pipelines de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 90,4 M de parametros en precision completa (fp32) los pesos ocupan aproximadamente 0,36 GB, a lo que hay que sumar la memoria de activaciones, que depende del tamano del volumen de entrada (cubos de 64 o 160) y del batch.
- GPU recomendadas: no especificadas por el autor; por tamano del modelo, es viable en GPU consumer modernas (por ejemplo, RTX 3090 o RTX 4090) para inferencia con volumenes moderados, y en A100/H100 para lotes grandes o volúmenes de 160 cubo.
- Cabe en GPU consumer: si, previsiblemente, siempre que el volumen de entrada y el batch se ajusten a la memoria disponible; no hay cifras oficiales.
- Opciones de despliegue: PyTorch nativo con el loader incluido (`load_encoder.py`), carga estricta de safetensors; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| DINO3D-ResEncL-NoGram-E260 | 90,4 M | Volumen 3D monocanal, parches de 160/96 cubo | CC BY 4.0 | Hugging Face (25 descargas) |
| Encoder profesor EMA del mismo benchmark | no disponible | misma vista de preentrenamiento | no liberado en esta release | no disponible |
| Checkpoints oficiales DINOv3 de Meta | no disponible en la informacion | 2D (no 3D nativo) | no disponible en la informacion | no aplica como equivalente 3D |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un checkpoint oficial de DINOv3 de Meta ni la arquitectura estandar nnssl ResEncL; no debe tratarse como equivalente.
- El encoder estudiante y el profesor EMA no son intercambiables al reproducir el modelo 772.
- No incluye decoder de segmentacion ni cabezas de proyeccion; requiere anadir componentes downstream.
- El preprocesamiento es externo al loader: hay que replicar el remuestreo isótropo de 1 mm y la normalizacion Z-score del benchmark para obtener resultados comparables.
- El modelo esta pensado para investigacion; no se reclama validacion clinica diagnostica.
- Riesgo de sesgo y alucinacion: no aplica en el sentido linguistico, pero las representaciones pueden heredar sesgos de los datos de preentrenamiento, no documentados en la informacion disponible.
- La licencia CC BY 4.0 permite uso comercial con atribucion al articulo y al repositorio, e indicando modificaciones; las dependencias de terceros conservan sus propias licencias.
- No se reclaman resultados posteriores de desarrollo de transferibilidad como resultados de la version arXiv v1.
- Solo se han registrado 25 descargas y 0 likes, por lo que la comunidad de validacion es muy reducida.

## Enlaces

- Hugging Face: https://huggingface.co/TJason/DINO3D-ResEncL-NoGram-E260
- Articulo: https://arxiv.org/abs/2610.17573v1
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
