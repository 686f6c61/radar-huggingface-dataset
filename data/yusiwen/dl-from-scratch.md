# yusiwen/dl-from-scratch

## Resumen

`yusiwen/dl-from-scratch` no es un modelo entrenado listo para usar, sino un repositorio didáctico que reimplementa desde cero, en PyTorch y NumPy, un conjunto amplio de arquitecturas de aprendizaje profundo. El autor, yusiwen, lo publica en Hugging Face como espejo de un repositorio Git (GitHub y Hugging Face mantenidos en el mismo commit). El objetivo es educativo: servir como material de referencia reproducible para quien quiera entender la implementación interna de cada familia de modelos.

El repositorio cubre aprendizaje clásico (MLP, regresión, SVM, árboles, GBDT, clustering, PCA, t-SNE), visión por computador (SimpleCNN, ResNet18/34/50, MobileNet, ViT, UNet, YOLO), modelos generativos (autoencoder, DCGAN, VAE, DDPM), aprendizaje autosupervisado (BYOL, DEC, MAE, SimCLR), redes de grafos (GCN), refuerzo (DQN) y procesamiento de lenguaje natural (BERT, GPT, LSTM, Word2Vec, Seq2Seq Transformer, LoRA). Cada directorio incluye su propio `config.yaml`, scripts de entrenamiento y un notebook de demostración.

Es relevante ahora como recurso de formación y verificación de conceptos: no compite como modelo de producción, sino que permite reproducir entrenamientos a pequeña escala (subconjuntos de MNIST, CIFAR-10, CelebA, Cora, IMDB, Pascal VOC, Oxford-IIIT Pet) con semillas fijas, TensorBoard y detección automática de dispositivo (CUDA → MPS → CPU). No hay pesos publicados ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio multiarquitectura: CNN (ResNet, MobileNet), ViT, UNet, YOLO, autoencoders, GAN, VAE, DDPM, BYOL, SimCLR, MAE, GCN, DQN, BERT, GPT, LSTM, Word2Vec, Seq2Seq Transformer, LoRA |
| Parametros totales | no disponible (depende de cada implementación y configuración) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | en (según la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene código y notebooks, no pesos publicados) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura única, sino una colección de implementaciones independientes, cada una con su `config.yaml` (semilla, learning rate, batch size, epochs, etc.) y su script `train.py`. Entre las piezas destacadas: ResNet18 (CelebA, 15 atributos, conexiones residuales), ResNet34 (CelebA, 40 atributos, bloques `[3,4,6,3]`), ResNet50 (bloque bottleneck 1×1→3×3→1×1), MobileNet con convolución depthwise separable, Vision Transformer con patch embedding y encoder tipo BERT, UNet para segmentación en Oxford-IIIT Pet, YOLO para detección en Pascal VOC, DCGAN con convolución transpuesta, VAE con truco de reparametrización y divergencia KL, DDPM con difusión de eliminación de ruido, BYOL con target EMA y sin negativos, SimCLR con aprendizaje contrastivo y linear probe, MAE con modelado de imagen enmascarada, GCN espectral sobre Cora, DQN con experience replay en CartPole, BERT con MLM y fine-tuning de clasificación, GPT decoder-only con atención causal y KV cache, LSTM con puertas escritas a mano sobre IMDB, Word2Vec con CBOW y Skip-gram con negative sampling, Seq2Seq Transformer EN→DE y LoRA para fine-tuning eficiente de GPT.

La infraestructura común incluye carga y guardado de configuración YAML, bloqueo de semillas (`torch`, `numpy`, `random`, `cudnn`) para reproducibilidad, registro en TensorBoard por época en `runs/{model_name}/` y guardado de la configuración junto a los pesos (`_config.yaml`). Los notebooks son de escala demostrativa: por ejemplo, ResNet50 entrena sobre 10 000 de las 162 000 imágenes de CelebA y DDPM sobre 10 000 de las 50 000 de CIFAR-10, para que una pasada completa quepa en una sesión. Para ejecuciones completas se usan los scripts de entrenamiento (`python -m cv.resnet50.train`, `python -m gen.ddpm.train`). No se documentan volúmenes de tokens de entrenamiento, composición de datasets ni etapas de RLHF/DPO.

## Capacidades

- Implementaciones didácticas de modelos de visión: clasificación (CIFAR-10, CelebA), segmentación (Oxford-IIIT Pet) y detección de objetos (Pascal VOC).
- Modelos generativos: autoencoder, DCGAN, VAE y DDPM con entrenamiento completo desde cero.
- Aprendizaje autosupervisado: BYOL, SimCLR, MAE y DEC, con evaluación mediante linear probe.
- Procesamiento de lenguaje natural: BERT (MLM y clasificación), GPT decoder-only con atención causal y KV cache, LSTM para análisis de sentimiento, Word2Vec y traducción EN→DE con Seq2Seq Transformer.
- Fine-tuning eficiente con LoRA sobre GPT.
- Aprendizaje sobre grafos con GCN en el dataset Cora.
- Aprendizaje por refuerzo con DQN en CartPole.
- Aprendizaje clásico en NumPy puro: MLP con retropropagación manual y 14 modelos independientes (regresión lineal y logística, SVM, árboles, GBDT, clustering, PCA, t-SNE).
- Infraestructura de reproducibilidad: semillas fijas, configuración YAML por modelo y registro en TensorBoard.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje desplegable.
- Capacidades multilingües: no disponibles (el repositorio se documenta en inglés).

## Casos de uso

- Formación en aprendizaje profundo: el repositorio sirve como material de curso para estudiar la implementación interna de ResNet, ViT, DDPM o BERT leyendo código PyTorch comentado y ejecutable.
- Verificación de conceptos con reproducibilidad: gracias al bloqueo de semillas y a los `config.yaml`, un investigador puede reproducir un experimento concreto (por ejemplo, SimCLR sobre CIFAR-10) y comparar curvas en TensorBoard.
- Prototipado rápido de arquitecturas: reutilizar los módulos de `cv/`, `nlp/` o `gen/` como punto de partida para experimentos propios antes de adoptar implementaciones de producción.
- Docencia de visión por computador: los notebooks de ResNet18/34/50 sobre CelebA permiten ilustrar clasificación multi-etiqueta y conexiones residuales con datos reales a escala reducida.
- Estudio de modelos generativos: el DDPM y el VAE sobre CIFAR-10 y MNIST permiten experimentar con difusión y con el truco de reparametrización sin infraestructura pesada.
- Aprendizaje autosupervisado: los notebooks de BYOL, SimCLR y MAE con linear probe sirven para comparar paradigmas contrastivos y de enmascaramiento sobre el mismo dataset.
- Práctica de NLP desde cero: el GPT decoder-only con KV cache y el Seq2Seq Transformer EN→DE permiten entender atención causal, caching y decodificación sin depender de frameworks de alto nivel.
- Referencia para despliegue local de JupyterLab: los scripts `jupyter.sh` y `run_notebooks.sh` permiten montar un entorno con GPU y ejecutar notebooks de forma desatendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica pesos ni mide requisitos de inferencia; los notebooks están pensados para entrenamiento a escala demostrativa.
- GPU recomendadas: no se especifican modelos concretos. La infraestructura detecta automáticamente CUDA, MPS o CPU (`utils/device.py`) y el contenedor Docker se basa en la imagen NGC PyTorch para GPU GB10.
- Cabe en GPU de consumo: no confirmado en la información disponible; los subconjuntos de datos (10 000 imágenes de CelebA o CIFAR-10) sugieren que el entrenamiento de demostración está pensado para ser ligero, pero no se dan cifras de memoria.
- Opciones de despliegue: no aplica como modelo de inferencia. Para ejecución de los notebooks se ofrecen `scripts/jupyter.sh` (JupyterLab con token por arranque) y `scripts/run_notebooks.sh` (ejecución headless con timeout configurable), además de un contenedor Docker NGC PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Proyecto | Enfoque | Cobertura | Licencia | Pesos publicados | Disponibilidad |
|---|---|---|---|---|---|
| yusiwen/dl-from-scratch | Repositorio didáctico multiarquitectura | ML clásico, CV, generativos, autosupervisado, GNN, RL, NLP | MIT | No | Hugging Face y GitHub |
| karpathy/nanoGPT | Implementación didáctica de GPT | Solo GPT decoder-only | MIT | No (código) | GitHub |
| karpathy/micrograd | Motor de autograd didáctico | MLP y autograd | MIT | No (código) | GitHub |
| pytorch/examples | Ejemplos oficiales de PyTorch | CV y NLP básicos | BSD-3 | No (código) | GitHub |

La comparativa se limita a proyectos de naturaleza similar (código educativo, no modelos desplegables); no se dispone de datos de benchmarks para comparar rendimiento entre ellos.

## Limitaciones y advertencias

- No es un modelo entrenado ni un checkpoint: no hay pesos publicados, ni pipeline de inferencia, ni tarjeta de modelo con métricas. No debe evaluarse como modelo de producción.
- Los entrenamientos son de escala demostrativa: los notebooks usan subconjuntos (10 000 de 162 000 imágenes en CelebA, 10 000 de 50 000 en CIFAR-10), por lo que las métricas obtenidas no son representativas de un entrenamiento completo.
- Riesgo de alucinación: no aplica directamente, al no ser un modelo generativo de lenguaje desplegable; los GPT y BERT incluidos son implementaciones de referencia para entrenar desde cero, no modelos preentrenados.
- Sesgos: no documentados. Los datasets empleados (CelebA, CIFAR-10, IMDB, Cora) tienen sesgos conocidos en la literatura, pero el repositorio no los analiza.
- Limitaciones de idioma: la documentación y los tags están en inglés; no se declaran capacidades multilingües.
- Licencia MIT: permite uso comercial y modificación con atribución, pero al no haber pesos ni garantías de rendimiento, el uso comercial se limita al código.
- Caveat de seguridad: `scripts/jupyter.sh` escucha en todas las interfaces por defecto; el token por arranque es la única protección de un kernel con acceso al repositorio y a la GPU. Se recomienda `--host 127.0.0.1` en máquinas compartidas.
- Mantenimiento: el repositorio se actualiza con regularidad (última actualización en la información disponible: 2026-11-16) y mantiene dos remotos sincronizados, pero no hay proceso de revisión por pares ni benchmarks publicados.

## Enlaces

- Hugging Face: https://huggingface.co/yusiwen/dl-from-scratch
- GitHub: https://github.com/yusiwen/dl-from-scratch
- Contenedor NGC PyTorch (referenciado en `docker/`): https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch
- Repositorio de referencia nanoGPT: https://github.com/karpathy/nanoGPT
- Repositorio de referencia micrograd: https://github.com/karpathy/micrograd
- Ejemplos oficiales de PyTorch: https://github.com/pytorch/examples
