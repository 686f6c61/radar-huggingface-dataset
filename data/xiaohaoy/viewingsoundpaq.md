# xiaohaoy/ViewingSoundPAQ

## Resumen

ViewingSoundPAQ es un modelo que predice las cualidades afectivas percibidas (PAQ, *perceived affective qualities*) del sonido de un lugar a partir de una unica fotografia. Las PAQ son las ocho dimensiones definidas en la norma ISO/TS 12913: pleasant, eventful, chaotic, vibrant, uneventful, calm, annoying y monotonous. Para cada una, el modelo devuelve un valor medio estimado en escala 1-5 junto con un intervalo de prediccion del 80 %, lo que permite cuantificar la incertidumbre de la estimacion.

El modelo lo publica el usuario xiaohaoy en Hugging Face. No es una red neuronal entrenada de extremo a extremo, sino una regresion ridge con kernel RBF que opera sobre caracteristicas visuales congeladas extraidas por dos codificadores: SigLIP 2 giant (3072 dimensiones, pooled + media de tokens) y Perception Encoder PE-Core bigG/14 a 448 px (1280 dimensiones). El vector de entrada resultante es de 4352 dimensiones. El objetivo de entrenamiento son las PAQ que el modelo de audio SoundAQNet asigna a un clip de 10 segundos grabado en el mismo lugar que la foto.

Es relevante porque aborda un problema poco explorado (estimar la cualidad sonora de un entorno a partir de su apariencia) con un enfoque ligero y calibrado: el repositorio ocupa unos 0,3 GB y la inferencia solo necesita la foto. Los resultados de validacion cruzada de 10 pliegues muestran un Spearman medio de 0,621 y un RMSE medio de 0,47, superando de forma consistente a metodos foto-solo previos y a un modelo vision-lenguaje zero-shot como Qwen3-VL-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion ridge con kernel RBF sobre caracteristicas visuales congeladas (SigLIP 2 giant + Perception Encoder PE-Core bigG/14) |
| Parametros totales | No disponible (el modelo ajustado se almacena como matriz de kernel en `model_siglip_krr_pe.npz`; los codificadores visuales son congelados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada: una imagen; panoramas se dividen en 4 vistas) |
| Tipos de cuantizacion | No disponible (no es un modelo de pesos transformer; el artefacto es un `.npz` con el modelo de kernel ridge) |
| Idiomas soportados | No disponible (la salida son valores numericos por PAQ) |
| Licencia | No disponible |
| Formato de pesos | `.npz` (modelo de kernel ridge); codificadores base en safetensors via Hugging Face |
| Dimension de caracteristicas | 4.352 (3.072 SigLIP 2 + 1.280 PE-Core) |
| Salida | 8 medias PAQ + rango del 80 % por PAQ (escala 1-5) |

## Arquitectura y entrenamiento

El modelo combina dos extractores de caracteristicas visuales congelados: SigLIP 2 giant, del que se usan tanto el embedding pooled como la media de los embeddings de tokens (3072 dimensiones), y Perception Encoder PE-Core bigG/14 a 448 px (1280 dimensiones). Sobre ese vector de 4352 dimensiones se ajusta una regresion ridge con kernel RBF. El ancho del kernel se fija en 0,5 veces la distancia cuadratica mediana entre fotos de entrenamiento estandarizadas, y el parametro de regularizacion lambda se selecciona mediante validacion cruzada agrupada de 5 pliegues en el lado de entrenamiento.

El objetivo de entrenamiento no son etiquetas humanas directas, sino las PAQ que SoundAQNet asigna al clip de audio de 10 segundos grabado en el mismo lugar que cada foto. El modelo aprende, por tanto, a imitar la prediccion de un modelo de audio a partir de la imagen. Ademas, un segundo kernel ridge sobre el mismo kernel predice el tamano del error esperado para cada foto; ese error se calibra sobre los residuos out-of-fold y define el intervalo del 80 % (percentiles 10 y 90 del error esperado). El intervalo es especifico por foto: lugares visualmente consistentes producen intervalos estrechos y lugares cuyo sonido varia mucho producen intervalos anchos.

Los datos de entrenamiento provienen de varios conjuntos de pares foto-audio (tau, urban, lion, UrbanSound8K con SAS, Singapore, 360x outdoor, ETH binaural y pares abiertos foto-sonido construidos por el propio autor). El numero exacto de tokens o pares no se detalla en la informacion disponible. No se emplea RLHF ni DPO: el ajuste es puramente de regresion supervisada sobre caracteristicas congeladas.

## Capacidades

- Prediccion de las 8 PAQ de ISO/TS 12913 (pleasant, eventful, chaotic, vibrant, uneventful, calm, annoying, monotonous) a partir de una unica foto.
- Estimacion de incertidumbre por foto mediante un intervalo de prediccion del 80 % calibrado (cobertura observada de 0,810 en validacion cruzada).
- Manejo de panoramas: se dividen en 4 vistas antes de la inferencia mediante `scripts/model/inference/split_panoramas.py`.
- Inferencia solo-imagen: no requiere audio en el momento de la prediccion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de regresion, no un LLM.
- No tiene capacidades multilingues ni de generacion de texto.
- No incluye modo thinking, vision generativa, audio ni otras capacidades propias de modelos fundacionales.

## Casos de uso

- Planificacion urbana y paisajismo: dado un catalogo de fotos de calles, plazas o parques, el modelo estima el perfil sonoro percibido de cada ubicacion para priorizar intervenciones (por ejemplo, detectar lugares con alta `annoying` y baja `calm`).
- Evaluacion de disenos arquitectonicos: comparar renders o fotos de propuestas de diseno antes de construir, estimando como sonaria el espacio resultante y detectando configuraciones con riesgo de sonido caotico.
- Turismo y seleccion de alojamiento: etiquetar fotos de hoteles, apartamentos o playas con un perfil PAQ estimado para enriquecer fichas con informacion sonora sin necesidad de grabar audio.
- Monitorizacion de espacios publicos a partir de imagenes existentes: reutilizar fotos de camaras o bancos de imagenes para inferir el caracter sonoro de zonas y detectar cambios tras reformas.
- Investigacion en percepcion ambiental: generar hipotesis sobre la relacion entre apariencia y sonido percibido en estudios de psicologia ambiental, usando los intervalos del 80 % para filtrar predicciones fiables.
- Filtrado previo en pipelines de datos audiovisuales: priorizar que fotos o lugares merecen una grabacion de audio real, reduciendo coste de campo.
- Analisis de escenas y eventos transitorios: comparar grupos de fotos por tipo de escena o evento (como muestra el autor en `scene_type_contrasts.png`) para estudiar contrastes de PAQ entre categorias.

## Benchmarks y rendimiento

Resultados de validacion cruzada de 10 pliegues reportados en la model card:

| Medida | Resultado |
|---|---|
| Spearman por PAQ | pleasant 0,59; eventful 0,68; chaotic 0,66; vibrant 0,56; uneventful 0,66; calm 0,64; annoying 0,58; monotonous 0,60 (media 0,621) |
| Pearson por PAQ | pleasant 0,59; eventful 0,69; chaotic 0,65; vibrant 0,58; uneventful 0,67; calm 0,64; annoying 0,58; monotonous 0,62 (media 0,626) |
| RMSE / MAE (escala 1-5, media de 8 PAQ) | 0,47 / 0,38 |
| Cobertura / anchura media / Winkler del rango del 80 % | 0,810 / 1,24 / 1,620 |

Comparativa con metodos foto-solo existentes (media de las 8 PAQ, Spearman):

| Metodo | Media | Pleasant | Eventful | Chaotic | Vibrant | Uneventful | Calm | Annoying | Monotonous | Delta vs. el modelo [IC 95 %] |
|---|---|---|---|---|---|---|---|---|---|---|
| Ours (SigLIP 2 + PE + kernel ridge) | 0,607 | 0,584 | 0,659 | 0,641 | 0,554 | 0,634 | 0,628 | 0,566 | 0,590 | - |
| CLIP ViT-B/16 + ridge | 0,552 | 0,513 | 0,613 | 0,580 | 0,505 | 0,593 | 0,557 | 0,501 | 0,553 | -0,055 [-0,071; -0,043] |
| ResNet-50 (ImageNet) + ridge | 0,492 | 0,426 | 0,576 | 0,520 | 0,451 | 0,548 | 0,481 | 0,434 | 0,499 | -0,115 [-0,135; -0,099] |
| Zhao et al. 2023: gradient-boosted trees | 0,493 | 0,442 | 0,565 | 0,519 | 0,439 | 0,542 | 0,492 | 0,443 | 0,501 | -0,114 [-0,132; -0,099] |
| Zhao et al. 2023: random forest | 0,489 | 0,439 | 0,567 | 0,522 | 0,433 | 0,536 | 0,490 | 0,442 | 0,482 | -0,118 [-0,139; -0,099] |
| Composicion de vistas (19 ratios de segmentacion) + regresion lineal | 0,351 | 0,260 | 0,460 | 0,365 | 0,338 | 0,420 | 0,327 | 0,272 | 0,369 | -0,256 [-0,286; -0,229] |
| Qwen3-VL-8B zero-shot PAQ rating | 0,318 | 0,209 | 0,455 | 0,407 | 0,297 | 0,329 | 0,379 | 0,236 | 0,233 | -0,289 [-0,318; -0,261] |
| Media del target de entrenamiento por dataset | 0,252 | 0,169 | 0,311 | 0,216 | 0,240 | 0,310 | 0,194 | 0,211 | 0,364 | -0,355 [-0,392; -0,318] |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 0,3 GB y el modelo es un `.npz` de kernel ridge, pero los codificadores SigLIP 2 giant y PE-Core bigG/14 se ejecutan en inferencia y dominan el consumo de memoria (orden de varios GB en funcion de la precision).
- GPU recomendadas: no especificadas. Por el tamano de los codificadores, una GPU consumer con 8-16 GB de VRAM deberia ser suficiente; GPU de datacenter (A100, H100) no son necesarias para inferencia.
- Cabe en GPU consumer: probablemente si (RTX 3060 12 GB o superior), aunque no se confirma en la documentacion.
- Opciones de despliegue: scripts propios del repositorio (`predict_photo_aq.py`), entorno conda creado con `setup_env.sh` con backend torch `cu126 | cu128 | cu130 | cpu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento (media 8 PAQ, Spearman) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ViewingSoundPAQ | Kernel ridge sobre SigLIP 2 + PE | No disponible (codificadores congelados) | Una foto (panoramas en 4 vistas) | 0,607 | No disponible | Hugging Face (`xiaohaoy/ViewingSoundPAQ`) |
| CLIP ViT-B/16 + ridge | Ridge sobre CLIP | ~150 M (codificador) | Una foto | 0,552 | No disponible | Baseline del propio autor |
| ResNet-50 + ridge | Ridge sobre ResNet-50 | ~25 M (codificador) | Una foto | 0,492 | No disponible | Baseline del propio autor |
| Qwen3-VL-8B zero-shot | VLM generativo | ~8 B | Imagen + prompt | 0,318 | No disponible en la informacion | Modelo publico de terceros |

## Limitaciones y advertencias

- El objetivo de entrenamiento son las PAQ de SoundAQNet, no etiquetas humanas: el modelo hereda los sesgos y errores del modelo de audio que genera las etiquetas.
- La prediccion es una estimacion estadistica con incertidumbre: el intervalo del 80 % cubre tanto lo que la foto no revela como la variabilidad temporal del sonido real (un autobus que pasa, un momento de silencio).
- Rendimiento moderado: Spearman medio de 0,621 y RMSE de 0,47 en escala 1-5; no es adecuado para decisiones que exijan precision alta sin validacion adicional.
- Dependencia de la apariencia visual: lugares cuyo sonido no correlaciona con su aspecto (por ejemplo, fuentes ocultas o trafico no visible) produciran predicciones poco fiables.
- Los panoramas requieren un preprocesado especifico (division en 4 vistas); no se aceptan directamente.
- La licencia no esta disponible en la informacion, por lo que no se puede confirmar el uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-28: no hay evidencia de uso en produccion ni de validacion independiente.
- DINOv3, usado en el flujo de entrenamiento, esta restringido (gated) en Hugging Face y requiere aceptar su licencia.
- No es un LLM: no genera texto, no soporta tool calling ni razonamiento multi-paso, y no debe compararse con modelos de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiaohaoy/ViewingSoundPAQ
- Paper ISO/TS 12913 (referencia normativa de las PAQ): no disponible como enlace directo en la informacion
- arXiv 2404.00989: https://arxiv.org/abs/2404.00989
- arXiv 2505.12734: https://arxiv.org/abs/2505.12734
- arXiv 2406.05914: https://arxiv.org/abs/2406.05914
- arXiv 2207.01078: https://arxiv.org/abs/2207.01078
- Documentacion de datasets del repo: `docs/DATASETS.md` (dentro del repositorio)
- Script de inferencia: `scripts/model/inference/predict_photo_aq.py` (dentro del repositorio)
- Script de division de panoramas: `scripts/model/inference/split_panoramas.py` (dentro del repositorio)
- Figuras de resultados: `docs/figures/place_average.png` y `docs/figures/scene_type_contrasts.png` (dentro del repositorio)
