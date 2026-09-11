# Veit/M181_multiclass

## Resumen

M181_multiclass es un clasificador de imágenes basado en Vision Transformer desarrollado por el usuario Veit, publicado en HuggingFace bajo licencia MIT. Se trata de la segunda etapa del pipeline PISCO dual-ViT: recibe los recortes (crops) de partículas que la etapa binaria (Veit/M181_binary) ha etiquetado previamente como "living" y los asigna a una de 13 clases taxonómicas de plancton. Parte del checkpoint google/vit-base-patch16-224-in21k, un ViT-base con parches de 16x16 y resolución de 224x224, y se ha afinado sobre recortes validados por expertos de la campaña M181 en el Atlántico tropical (abril-mayo de 2022), alcanzando un 96,17 % de exactitud en test sobre esas 13 clases.

El modelo tiene 85.808.653 parámetros y un peso de repositorio de 0,3 GB en formato safetensors. No es un modelo generativo ni un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües. Su valor está en la clasificación automática de plancton a partir de imágenes de citometría de flujo, un cuello de botella habitual en oceanografía, donde la revisión taxonómica manual de miles de partículas por campaña consume cientos de horas de especialistas.

Su relevancia actual es doble. Por un lado, cubre una tarea de nicho (taxonomía de plancton) con un rendimiento declarado alto y una integración directa en EcoTaxa mediante el script `process_pisco_profiles.py`. Por otro, la propia model card documenta con detalle un acoplamiento fuerte entre el modelo, el algoritmo de deconvolución de imágenes (LUCYD 231204) y el tipo de recorte, hasta el punto de que cambiar solo la deconvolución redujo la tasa de "living" entre un 83 % y un 93 % en el conjunto ATAIR-BSH del Mar del Norte. Es un caso ilustrativo de por qué un clasificador científico debe versionarse junto a su preprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base, patch 16x16, resolucion 224x224), afinado desde google/vit-base-patch16-224-in21k |
| Parametros totales | 85.808.653 (~85,8 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica: modelo de vision con 196 parches de 16x16 mas token CLS para entradas de 224x224 px |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors; no se declaran variantes GGUF, AWQ, GPTQ ni ONNX cuantizado) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; el dominio es la clasificacion de imagenes de plancton) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | image-classification |
| Numero de clases | 13 (Appendicularia, Asteroidea larvae, Bacillariophyceae, Chaetognatha, Cnidaria, Copepoda, Ctenophora, Eumalacostraca, Noctiluca sp., Pyrocystis, Rhizaria, Thaliacea, Trichodesmium) |
| Preprocesado obligatorio | Redimensionar el lado mayor a 224, centrar con padding blanco (255) hasta 224x224, normalizar con media=desviacion=0,5; sin rotacion en inferencia; sin barra de escala |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 2026-09-11 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estandar de la familia ViT-base: división de la imagen en parches de 16x16 píxeles, proyección lineal de cada parche, token CLS, codificador Transformer con atención global y cabeza de clasificación lineal sobre el token CLS. El punto de partida es google/vit-base-patch16-224-in21k, preentrenado en ImageNet-21k, y el ajuste fino se realizó sobre recortes de plancton de la campaña M181 (Atlántico tropical, abril-mayo de 2022) validados por expertos. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, la duración del ajuste ni si se emplearon técnicas de alineación como RLHF o DPO (no aplicables en un clasificador de imagen).

El aspecto técnico más relevante no está en la arquitectura, sino en el acoplamiento con el preprocesado, que el autor describe explícitamente: el modelo se entrenó con recortes generados por la deconvolución LUCYD `lucyd-edof-plankton_231204.pth` (la opción por defecto del pipeline) y con recortes no aislados, es decir, con partículas vecinas presentes en la imagen. Ejecutarlo sobre recortes de otra deconvolución o sobre recortes aislados constituye un cambio de dominio. La medición reportada en el conjunto ATAIR-BSH (Mar del Norte) es que cambiar únicamente la deconvolución hizo caer la tasa de "living" entre un 83 % y un 93 % manteniendo la misma confianza de salida, lo que indica que el modelo no calibra a la baja cuando entra en dominio desconocido. El autor recomienda tratar deconvolución, aislamiento de recortes y clasificador como una unidad versionada.

## Capacidades

- Clasificación de imágenes de plancton en 13 clases taxonómicas cerradas, con una exactitud declarada del 96,17 % en el conjunto de test de la campaña M181.
- Segunda etapa del pipeline PISCO dual-ViT: opera sobre los recortes que la etapa binaria Veit/M181_binary ha marcado como "living", no sobre la imagen completa.
- Salida de etiqueta única por recorte (clasificación multiclase), pensada para alimentar un flujo de importación taxonómica.
- Integración con EcoTaxa: la propia model card indica que las clases obsoletas en EcoTaxa (`Asteroidea larvae`, `Noctiluca sp.`) se remapean a `Asteroidea` y `Noctiluca` en la exportación para que las importaciones sigan siendo validables.
- Robustez aparente frente a recortes con partículas vecinas, siempre que se respete el preprocesado de LUCYD 231204.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No tiene modo "thinking", ni entrada de audio, ni visión general fuera del dominio de plancton.
- No incorpora detección de clases desconocidas: cualquier objeto que no pertenezca a las 13 clases se forzará a una de ellas.

## Casos de uso

- Clasificación taxonómica automatizada en campañas oceanográficas: el modelo actúa como segunda etapa del pipeline PISCO sobre recortes de citometría de flujo, asignando cada partícula viva a una de las 13 clases y generando el inventario taxonómico de la campaña sin intervención manual en la mayor parte de los objetos.
- Reducción del esfuerzo de revisión experta: al preclasificar los recortes con alta exactitud en el dominio de entrenamiento, los taxónomos pueden centrarse en los casos dudosos y en las clases problemáticas conocidas (por ejemplo, larvas de pluteus), en lugar de revisar la totalidad del conjunto.
- Integración en flujos de trabajo con EcoTaxa: la salida se remapea a taxones válidos en la exportación, de modo que el modelo puede insertarse en un pipeline existente de validación sin romper los esquemas de importación de la plataforma.
- Monitorización de series temporales de comunidades planctónicas en el Atlántico tropical: al ser un clasificador determinista y rápido, permite procesar de forma homogénea muestras de distintas fechas y comparar la composición relativa de las 13 clases a lo largo del tiempo.
- Detección de proliferaciones (blooms) de taxones concretos: las clases `Noctiluca sp.`, `Pyrocystis`, `Trichodesmium` y `Bacillariophyceae` son indicadores habituales de eventos de floración; el modelo permite cuantificar su presencia relativa sobre grandes volúmenes de imágenes.
- Análisis retrospectivo de repositorios de imágenes ya existentes: si las imágenes se han procesado con la deconvolución LUCYD 231204 y recortes no aislados, se puede reclasificar un archivo histórico completo para obtener series taxonómicas comparables.
- Control de calidad del propio pipeline: dado que el autor documenta el colapso de la tasa de "living" al cambiar la deconvolución, el clasificador puede usarse como indicador de que el preprocesado se ha aplicado correctamente (una caída anómala de la tasa de "living" delata un desajuste de versión).
- Docencia y divulgación en ciencias marinas: con recortes preprocesados correctamente, el modelo sirve para ilustrar de forma interactiva la clasificación automática de plancton en materiales docentes, siempre con la advertencia de sus limitaciones taxonómicas.

## Benchmarks y rendimiento

Datos publicados en la model card:

| Conjunto | Metrica | Valor | Notas |
|---|---|---|---|
| M181 (test, 13 clases) | Exactitud (accuracy) | 96,17 % | Recortes validados por expertos de la campana M181, Atlantico tropical, abril-mayo de 2022 |

Evaluación en dominio externo (ATAIR-BSH, Mar del Norte), tal como se describe en la model card:

| Observacion | Valor reportado |
|---|---|
| Objetos etiquetados como `Rhizaria` que en validacion resultaron ser mayoritariamente larvas de pluteus | 2.354 objetos |
| Caida de la tasa de "living" al cambiar unicamente la deconvolucion (confianza sin cambios) | 83-93 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable al tratarse de un clasificador de imagen y no de un modelo de lenguaje.

## Requisitos de hardware

- Pesos del modelo: 85.808.653 parametros. En fp32 ocupan aproximadamente 343 MB (327 MiB); en fp16/bf16, aproximadamente 172 MB (164 MiB). Son tamanos derivados del recuento de parametros, no publicados por el autor.
- VRAM estimada para inferencia: inferior a 1-2 GB en fp16 con lotes pequenos, sumando pesos, activaciones y overhead del framework. No hay mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 y H100. En la practica, el modelo esta limitado por el ancho de banda de lectura de imagenes y por el preprocesado, no por la VRAM.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna, e incluso en GPU integradas con soporte CUDA, ROCm o similar. La inferencia en CPU es viable para volumenes moderados, dado que se trata de un ViT-base con 196 parches por imagen.
- Opciones de despliegue: pipeline `image-classification` de HuggingFace Transformers sobre PyTorch, TorchScript, ONNX Runtime, TensorRT o un servidor de inferencia como Triton. Tambien es posible exportarlo a formatos moviles. vLLM y llama.cpp no son opciones adecuadas para este modelo, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de imagenes por segundo en la informacion proporcionada.
- Requisito de entorno: el preprocesado no es opcional. Hay que redimensionar el lado mayor a 224, aplicar padding blanco (255) centrado, normalizar con media=desviacion=0,5, no rotar en inferencia y eliminar la barra de escala (por ejemplo con `utils.strip_scale_bar`) antes de clasificar.

## Comparativa con modelos similares

La busqueda web realizada no ha devuelto informacion sobre clasificadores de plancton comparables, por lo que la comparativa se limita a los elementos directamente relacionados en la informacion disponible.

| Modelo | Parametros | Tipo | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Veit/M181_multiclass | 85,8 M | ViT-base patch16, 13 clases | 224x224 px | 96,17 % de exactitud en test (M181, 13 clases) | MIT | HuggingFace, etapa 2 del pipeline PISCO |
| google/vit-base-patch16-224-in21k | 85,8 M (arquitectura base) | ViT-base patch16 preentrenado | 224x224 px | No aplicable al dominio de plancton (preentrenamiento generico en ImageNet-21k) | No disponible en la informacion proporcionada | HuggingFace |
| Veit/M181_binary | No disponible | ViT, etapa binaria del pipeline PISCO | 224x224 px (mismo preprocesado declarado) | No disponible | No disponible (el autor publica M181_multiclass bajo MIT) | HuggingFace, etapa 1 del pipeline PISCO |

Para el resto de alternativas de la misma tarea (clasificacion taxonomica de plancton con ViT o CNN): no disponible.

## Limitaciones y advertencias

- Larvas de pluteus mal clasificadas: los equinodermos en fase de pluteus se etiquetan sistematicamente como `Rhizaria` porque el modelo no tiene una clase para ellos. En el conjunto ATAIR-BSH, 2.354 objetos llamados `Rhizaria` resultaron ser casi enteramente pluteus en validacion.
- Taxones obsoletos: `Asteroidea larvae` y `Noctiluca sp.` estan marcados como taxones deprecados en EcoTaxa. El pipeline los remapea a `Asteroidea` y `Noctiluca` en la exportacion para que las importaciones sigan siendo validables; conviene no confundir la etiqueta de salida del modelo con el taxon final exportado.
- Brecha de dominio: el modelo se entreno con plancton del Atlantico tropical. En aguas de otras regiones, como el Mar del Norte, cabe esperar degradacion del rendimiento.
- Acoplamiento critico al preprocesado: el modelo depende de la deconvolucion `lucyd-edof-plankton_231204.pth` y de recortes no aislados con particulas vecinas. Cambiar la deconvolucion o usar recortes aislados provoca un desplazamiento de dominio severo: en ATAIR-BSH la tasa de "living" cayo entre un 83 % y un 93 % con la misma confianza de salida. Deconvolucion, aislamiento de recortes y clasificador deben versionarse como una sola unidad.
- Confianza no calibrada fuera de dominio: la caida de rendimiento documentada se produce sin que la confianza de las predicciones disminuya, por lo que no es seguro usar el valor de confianza como criterio de filtrado automatico en dominios nuevos.
- Conjunto de clases cerrado: son 13 clases fijas y el modelo no dispone de mecanismo de rechazo o de deteccion de clases desconocidas; cualquier objeto fuera de esas clases se forzara a la mas parecida.
- Preprocesado obligatorio y fragil: es necesario redimensionar el lado mayor a 224, aplicar padding blanco centrado hasta 224x224, normalizar con media=desviacion=0,5, no rotar y eliminar la barra de escala. Omitir cualquiera de estos pasos invalida las predicciones.
- Ausencia de validacion externa publicada: aparte del test de M181 y de las observaciones cualitativas en ATAIR-BSH, no se han publicado evaluaciones independientes.
- Adopcion muy baja: el repositorio registra 0 descargas y 0 likes, por lo que no existe una comunidad que haya reportado comportamiento en produccion.
- Licencia: MIT, que permite uso comercial y modificacion. La restriccion practica no es legal sino cientifica: cualquier uso en un dominio distinto al de entrenamiento o con otro preprocesado requiere revalidacion con datos etiquetados por expertos antes de tomar decisiones.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe un riesgo analogo de asignar con alta confianza una etiqueta incorrecta a objetos fuera del dominio, especialmente en grupos sin clase propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Veit/M181_multiclass
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Etapa binaria del pipeline PISCO dual-ViT: https://huggingface.co/Veit/M181_binary
- EcoTaxa (plataforma de referencia para la validacion de los taxones exportados): https://ecotaxa.obs-vlfr.fr
- Comandos de uso del pipeline citados en la model card (sin enlace publico en la informacion disponible): `process_pisco_profiles.py --binary-model-hf Veit/M181_binary --living-model-hf Veit/M181_multiclass` y `process_pisco_profiles.py --dualvit-model M181`
- Paper, blog o repositorio adicionales: no disponibles. La busqueda web realizada no devolvio resultados relacionados con el modelo.
