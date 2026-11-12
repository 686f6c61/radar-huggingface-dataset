# theblackcat102/clip-vit-base-patch16-task-experts-ep10

## Resumen

`theblackcat102/clip-vit-base-patch16-task-experts-ep10` es una coleccion de diez fine-tunes completos del codificador de imagenes de `openai/clip-vit-base-patch16` sobre las ocho tareas de vision habituales en la literatura de model merging y task arithmetic: SUN397, Stanford Cars, RESISC45, EuroSAT, GTSRB, DTD, Food101 y FER2013. El autor es theblackcat102 y el repositorio se publico en noviembre de 2026. No es un modelo unico listo para produccion, sino un conjunto de expertos por tarea pensado como material de partida para estudios de task vectors, merging de pesos y seleccion de checkpoints.

La arquitectura subyacente es CLIP ViT-B/16: un transformer de vision con parches de 16x16, 12 capas y ancho oculto de 768, que produce un embedding de 512 dimensiones tras una proyeccion visual. Cada run anade una cabeza lineal congelada inicializada a partir de los embeddings de texto zero-shot de los prompts de clase multiplicados por `logit_scale`, de modo que solo se entrena la torre visual (`vision_model` y `visual_projection`). La torre de texto permanece intacta respecto al modelo base.

La relevancia del repositorio es metodologica: ofrece diez entrenamientos con receta identica (AdamW, fp16, batch 32, 10 epochs, sin data augmentation, semilla 42) en los que solo varia la tasa de aprendizaje, y guarda un checkpoint por epoch. Eso permite reproducir experimentos de duracion de entrenamiento, seleccion de checkpoint y aritmetica de tareas con un control fino que rara vez se publica. El tamano del repo, 59,9 GB, refleja precisamente esa acumulacion de checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/16 (transformer de vision con parches 16x16, 12 capas, ancho 768) mas cabeza lineal congelada |
| Parametros totales | no disponible (el modelo base CLIP ViT-B/16 ronda los 150 M en la torre visual; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; la torre de texto admite 77 tokens, no declarado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp16/fp32) |
| Idiomas soportados | no disponible (la torre de texto no se reentrena; hereda los del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` por run y `checkpoint-<step>/` por epoch) |

## Arquitectura y entrenamiento

Cada experto es un `CLIPModel` completo en el que se sustituye la clasificacion zero-shot por una cabeza lineal: `logits = head(normalize(clip.get_image_features(x)))`. La cabeza se inicializa con los embeddings de texto de los prompts de clase por `logit_scale`, con sesgo a cero, y se congela; solo se actualizan `vision_model` y `visual_projection`. El optimizador es AdamW fusionado de torch con betas (0,9, 0,999), weight decay 0 y recorte de gradiente a 1,0. El scheduler es decaimiento lineal con un 10 % de warmup sobre 10 epochs, batch 32, precision mixta fp16 y semilla 42. El preprocesado usa unicamente el `CLIPImageProcessor` (resize a 224, center crop, normalizacion) y, pese a que el log imprima `Data augmentation: True`, la model card aclara que ese flag no se aplica en ningun punto.

La evaluacion se hace una vez por epoch sobre el split de evaluacion, que es el test en siete de las ocho tareas y el validation en Food101 (sin test). La seleccion de modelo usa `load_best_model_at_end=True` con `metric_for_best_model=accuracy` sobre ese mismo split, lo que introduce una fuga optimista: el `model.safetensors` de nivel superior corresponde a la mejor epoch medida sobre el test. El autor advierte explicitamente de ello y recomienda usar una epoch fija (por ejemplo el ultimo checkpoint) para comparaciones sin sesgo de seleccion. El software empleado es transformers 4.57.6 y torch 2.9.1. La innovacion tecnica no esta en el modelo sino en el diseno del artefacto: diez runs con receta controlada, dos tasas de aprendizaje para EuroSAT y Stanford Cars, y checkpoints por epoch con `trainer_state.json` (sin estado del optimizador).

## Capacidades

- Clasificacion de imagenes en las ocho tareas entrenadas: escenas (SUN397), coches (Stanford Cars), uso del suelo en imagenes aereas (RESISC45), satelite (EuroSAT), senales de trafico (GTSRB), texturas (DTD), comida (Food101) y expresiones faciales (FER2013).
- Extraccion de embeddings visuales de 512 dimensiones mediante `get_image_features`, reutilizables para busqueda, clustering o clasificacion con cabezas propias.
- Clasificacion zero-shot con la torre de texto original, ya que el checkpoint conserva el `text_model` sin modificar.
- Base para task arithmetic y model merging: los pesos de cada experto son directamente combinables con los del modelo base para construir task vectors.
- Seleccion de checkpoint y estudios de duracion de entrenamiento gracias a los diez checkpoints por run.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un clasificador de imagenes, no un modelo generativo de proposito general.
- No se declaran capacidades multilingues ni modos especiales (thinking, vision generativa, audio).

## Casos de uso

- Investigacion en model merging: los diez expertos permiten calcular task vectors (diferencia respecto a `openai/clip-vit-base-patch16`) y evaluar tecnicas como TIES, DARE o model soups sobre un benchmark estandarizado de ocho tareas.
- Estudios de task arithmetic: sumar o restar los vectores de tarea y medir la degradacion en cada dominio con las tablas por epoch ya publicadas como referencia.
- Seleccion de checkpoint y sobreajuste: al guardar cada epoch con su `trainer_state.json`, se puede trazar la curva de accuracy y estudiar cuando conviene detener el entrenamiento en tareas pequenas como Stanford Cars (8.144 imagenes de entrenamiento) frente a Food101 (75.750).
- Clasificacion especializada en produccion con fine-tuning ligero: usar el experto de GTSRB o RESISC45 como inicializacion para un clasificador propio, aprovechando que la cabeza congelada acelera la convergencia (GTSRB alcanza 94,15 % ya en la primera epoch).
- Deteccion de expresiones faciales en analisis de comportamiento: el experto de FER2013 ofrece 72,14 % sobre 7.178 imagenes de test, util como linea base frente a modelos especificos de afecto.
- Etiquetado automatico de datasets: aplicar el experto de DTD o SUN397 para preetiquetar texturas y escenas antes de una revision humana, dado que la cabeza congelada evita desajustes con los prompts originales.
- Benchmarking de infraestructura: el repo de 59,9 GB y los diez runs completos sirven para medir throughput de carga y evaluacion en pipelines de transformers 4.57 con torch 2.9.

## Benchmarks y rendimiento

Los datos publicados son de accuracy (%) sobre el split de evaluacion indicado (test salvo Food101, que usa validation). La columna `model.safetensors` corresponde a la mejor epoch por accuracy sobre ese split y es, por tanto, optimista.

| Carpeta | Tarea | LR | Train | Eval | `model.safetensors` | Mejor epoch | Epoch 10 |
|---|---|---|---|---|---|---|---|
| `dtd_..._lr3e-5` | dtd | 3e-5 | 3.760 | 1.880 (test) | 79,84 | 10 | 79,84 |
| `eurosat_..._lr1e-5` | eurosat | 1e-5 | 21.600 | 2.700 (test) | 99,15 | 9 | 99,04 |
| `eurosat_..._lr3e-5` | eurosat | 3e-5 | 21.600 | 2.700 (test) | 98,89 | 10 | 98,89 |
| `fer2013_..._lr3e-5` | fer2013 | 3e-5 | 28.709 | 7.178 (test) | 72,14 | 10 | 72,14 |
| `food101_..._lr3e-5` | food101 | 3e-5 | 75.750 | 25.250 (val) | 89,94 | 10 | 89,94 |
| `gtsrb_..._lr3e-5` | gtsrb | 3e-5 | 26.640 | 12.630 (test) | 99,07 | 8 | 98,99 |
| `resisc45_..._lr1e-5` | resisc45 | 1e-5 | 18.900 | 6.300 (test) | 96,60 | 10 | 96,60 |
| `stanford-cars_..._lr1e-5` | stanford-cars | 1e-5 | 8.144 | 8.041 (test) | 88,37 | 9 | 88,37 |
| `stanford-cars_..._lr3e-5` | stanford-cars | 3e-5 | 8.144 | 8.041 (test) | 87,27 | 10 | 87,27 |
| `sun397_..._lr3e-5` | sun397 | 3e-5 | 19.850 | 19.850 (test) | 74,61 | 10 | 74,61 |

No se han publicado resultados de benchmarks en la informacion disponible comparando con otros modelos (MMLU, HumanEval o similares no aplican a un clasificador de imagenes), ni cifras de throughput o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Para una torre visual ViT-B/16 en fp16 el orden de magnitud habitual es de 1 a 2 GB incluyendo activaciones de un batch pequeno; el autor no publica mediciones.
- GPU recomendadas: no disponibles. Cualquier GPU con al menos 8 GB permite cargar un unico experto en fp16; para entrenar con batch 32 a 224x224 conviene una GPU de 24 GB o superior (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, un experto individual es manejable en tarjetas consumer modernas; el repo completo de 59,9 GB requiere almacenamiento en disco, no VRAM simultanea.
- Opciones de despliegue: transformers (CLIPModel y CLIPImageProcessor, tal como muestra la model card), con carga via `hf_hub_download` y `safetensors.torch.load_file`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a clasificacion de imagenes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (task experts) | no disponible | no disponible | 8 tareas de vision | no disponible | Hugging Face, 0 descargas |
| `openai/clip-vit-base-patch16` | no disponible en la informacion | no disponible | zero-shot general | no disponible en la informacion | Hugging Face (modelo base) |
| Alternativas de model merging (p. ej. CLIP task arithmetic) | no disponible | no disponible | mismo benchmark de 8 tareas | no disponible | no disponible en la informacion |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Fuga en la seleccion de modelo: el `model.safetensors` superior se elige por accuracy sobre el split de test en siete de las ocho tareas, de modo que sus cifras son optimistas. Para comparaciones honestas hay que usar una epoch fija.
- Sin data augmentation: el log imprime `Data augmentation: True` pero el flag no se aplica, lo que limita la robustez frente a variaciones de iluminacion, encuadre o resolucion.
- Cabeza congelada: la clasificacion depende de los prompts de clase originales; cambiar el conjunto de etiquetas exige reentrenar o sustituir la cabeza.
- Licencia no disponible: no se puede confirmar el uso comercial. Al derivar de `openai/clip-vit-base-patch16`, habria que verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Idiomas no declarados: la torre de texto no se modifica, pero el autor no documenta el soporte linguistico resultante.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay riesgo de clasificaciones erroneas confiadas en dominios fuera de distribucion (por ejemplo, imagenes medicas o industriales no representadas en las ocho tareas).
- Sesgos: no documentados por el autor; FER2013, en particular, es conocido por desequilibrios demograficos, pero la model card no aporta analisis.
- Uso previsto de investigacion: con 0 descargas y 0 likes, el repositorio no tiene validacion comunitaria; conviene tratarlo como artefacto experimental.
- Tamano del repo: 59,9 GB por los diez checkpoints completos, lo que complica su descarga y almacenamiento en entornos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theblackcat102/clip-vit-base-patch16-task-experts-ep10
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch16
- Paper de CLIP: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
