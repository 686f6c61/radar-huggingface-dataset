# yhz-linearalgebra/TKCAM

## Resumen

TKCAM (Text and Keyframe to CAMera trajectory) es un modelo generativo que produce trayectorias de cámara —rotación y traslación a lo largo del tiempo— a partir de una descripción textual en lenguaje natural, opcionalmente condicionada por un primer fotograma o por hasta cuatro keyframes situados en instantes concretos. Lo desarrolla un equipo académico (Haozhe Yang, Zhiyang Dou, Zekai Gu, Cheng Lin, Wenping Wang, Yuan Liu y Taku Komura) y se presenta en NeurIPS 2026; el problema que aborda es el control de movimiento de cámara para cinematografía asistida, síntesis de vídeo y comprensión de escenas 3D, donde hasta ahora el movimiento solía especificarse a mano o mediante control numérico poco intuitivo.

Técnicamente no es un modelo de lenguaje: adapta la receta MoMask de movimiento humano a trayectorias de cámara continuas mediante modelado generativo enmascarado en tres etapas (VQ-VAE residual, transformer enmascarado y transformer residual). El texto se codifica con un `t5-base` congelado y las imágenes con un codificador visual CLIP ViT-B/32 también congelado (`openai/clip-vit-base-patch32`); los pesos de ambos codificadores no se incluyen en el repositorio y se descargan del Hub en el primer uso.

El repositorio publicado contiene únicamente checkpoints (0,3 GB) con tres modos de condicionamiento —`noframe`, `firstframe` y `xframe`— más el VQ-VAE residual compartido. Es relevante ahora porque ofrece una interfaz texto+cámara directamente consumible en pipelines de render y de generación de vídeo, con licencia MIT y código abierto, aunque sus métricas de recuperación texto-trayectoria son todavía modestas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelado generativo enmascarado en tres etapas (MoMask): VQ-VAE residual + transformer enmascarado + transformer residual; texto con `t5-base` congelado e imagen con CLIP ViT-B/32 congelado |
| Parametros totales | no disponible (el `MANIFEST.json` del repo incluye el recuento por checkpoint, no reproducido en la información disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como modelo de lenguaje; el VQ-VAE residual usa ventana de 128 tokens; las trayectorias generadas van de 3 a 11 s a 30 fps (los clips de entrenamiento, 4,0–9,3 s) |
| Tipos de cuantizacion | no disponible (se distribuyen `state_dict` de PyTorch en `.tar`; no se documentan versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (el texto pasa por `t5-base`, pero la model card no documenta cobertura idiomática) |
| Licencia | MIT (igual que el código; los pesos de T5 y CLIP se descargan aparte con sus propias licencias) |
| Formato de pesos | `.tar` con el `state_dict` de PyTorch y la época; configuración en `opt.txt`; salidas en `.npy` (`(T,9)` y `(T,4,4)`), `.mp4` y `meta.json` |

## Arquitectura y entrenamiento

TKCAM sigue la receta MoMask de tres etapas trasladada del movimiento humano a trayectorias de cámara: un VQ-VAE residual (`rvq_w128_nq4_cb256_25kfixed_60ep`, 4 cuantizadores, 256 códigos, ventana 128, época 25) tokeniza la trayectoria; un transformer enmascarado predice los tokens a partir del texto y, opcionalmente, de las imágenes de condicionamiento; y un transformer residual refina la predicción. Las condiciones visuales entran por el primer fotograma (`firstframe`) o por entre 0 y 4 keyframes muestreados aleatoriamente por clip (`xframe`). Según el abstract del paper, la dinámica de cámara se formula como una característica cinemática de 12 dimensiones que combina posición, velocidad y una rotación continua; los checkpoints publicados exportan la trayectoria como rotación 6D más traslación (`[rot6d(6), x, y, z]`) y como matriz cámara-a-mundo de 4×4 relativa al primer fotograma, con ejes OpenGL (+X derecha, +Y arriba, −Z adelante) a 30 fps.

El entrenamiento usa el split `train` del dataset RealEstate10K-Cap (21.250 clips) durante 600 épocas por transformer con tasa de aprendizaje 5e-5. La selección de checkpoints es destacable: el VQ-VAE se elige por error de reconstrucción en validación, y para cada transformer se re-puntuaron por FID sobre el split de validación (2.500 clips) con un evaluador CLaTr —cuyos datos de entrenamiento excluyen las particiones de validación y test de RealEstate10K-Cap— los checkpoints guardados de la ejecución (mejor FID, mejor accuracy, mejor pérdida y última época), publicando el mejor como `net_best_fid.tar`. La model card advierte explícitamente de que estos checkpoints se reentrenaron tras el envío del paper y no son los que producen las tablas del artículo.

## Capacidades

- Generación de trayectorias de cámara (rotación + traslación) a partir de texto libre, en modo `noframe`.
- Condicionamiento por primer fotograma (modo `firstframe`): la trayectoria arranca desde la pose observada en una imagen RGB.
- Condicionamiento por hasta 4 keyframes con marca temporal explícita (modo `xframe`, sintaxis `imagen@segundos`), lo que permite fijar inicio, final e intermedios e interpolar el movimiento.
- Control de duración: la CLI acepta `--duration` y el sistema recorta el valor al rango de 3–11 s.
- Salida en tres formatos simultáneos por muestra: `sample{i}_9d.npy` con rotación 6D y traslación, `sample{i}_c2w.npy` con matrices cámara-a-mundo 4×4, animación MP4 y `meta.json`.
- Inferencia por lotes sobre un fichero de prompts (documentada en el repositorio de código).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje ni un asistente.
- Sin capacidades de audio, vídeo de salida (solo render de la trayectoria) ni generación de imagen.

## Casos de uso

- **Previsualización de movimiento de cámara en cine y animación**: el director escribe "la cámara retrocede lentamente revelando el salón" y obtiene una trayectoria concreta en matrices cámara-a-mundo que puede cargar en Blender o Unreal para validar el plano antes de rodar o animar.
- **Interpolación entre keyframes al estilo animador**: con el modo `xframe` se fijan dos o tres fotogramas en instantes concretos (`hall.jpg@0`, `stairs.jpg@4.5`) y el modelo genera el recorrido coherente intermedio, útil para bloqueo de animática.
- **Condicionamiento de modelos de generación de vídeo**: las matrices `c2w` por fotograma a 30 fps sirven como control de cámara para pipelines de vídeo-difusión que aceptan poses explícitas, evitando especificar el movimiento a mano fotograma a fotograma.
- **Prototipado rápido de planos en producción virtual**: dado que la salida es relativa al primer fotograma y en ejes OpenGL, se integra directamente en motores de render que ya trabajan con esa convención, sin conversiones intermedias.
- **Generación de datos sintéticos de movimiento de cámara para investigación en 3D**: permite aumentar datasets de vídeo interior con trayectorias etiquetadas por texto, útil para evaluar SLAM, odometría visual o modelos de comprensión de escena.
- **Evaluación comparativa de control de cámara**: al publicar checkpoints por modo y métricas FID/R@k sobre un split fijo, sirve como línea base reproducible frente a métodos que controlan cámara dentro de un modelo de vídeo.
- **Docencia y divulgación sobre modelado generativo de movimiento**: la separación explícita en VQ-VAE, transformer enmascarado y transformer residual, con configuraciones `opt.txt` incluidas, hace el pipeline inspeccionable etapa por etapa.

## Benchmarks y rendimiento

Métricas de validación publicadas en la model card (split de 2.500 clips, evaluador CLaTr; R@k = recuperación texto-a-trayectoria sobre todo el split, en %):

| Modo | FID ↓ | R@1 | R@3 | R@10 | Matching |
|---|---|---|---|---|---|
| `noframe` | 0,042 | 2,1 | 5,2 | 13,5 | 0,289 |
| `firstframe` | 0,045 | 2,5 | 5,6 | 13,6 | 0,279 |
| `xframe` | 0,045 | 2,6 | 5,7 | 14,7 | 0,288 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K y similares no aplican a esta tarea), ni las tablas del paper para estos checkpoints, que fueron reentrenados con posterioridad al envío.

## Requisitos de hardware

- No se han publicado cifras oficiales de VRAM ni de latencia o throughput en la información disponible.
- El repositorio completo de checkpoints ocupa 0,3 GB, a lo que hay que sumar los pesos de `t5-base` y CLIP ViT-B/32 que se descargan del Hub en el primer uso; por ese orden de magnitud es previsible que la inferencia quepa en GPU consumer, pero se trata de una estimación por tamaño de artefactos, no de un dato publicado.
- GPU recomendadas: no disponible. No hay indicación de requisitos de precisión (fp32/fp16/bf16) ni de memoria mínima en la model card.
- Despliegue: la vía documentada es el repositorio oficial (`pip install -r requirements.txt`, `pip install -e .`, o `conda env create -f environment.yml`) más `hf download yhz-linearalgebra/TKCAM --local-dir checkpoints`, invocando `scripts/generate.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Los ficheros `.tar` contienen solo el `state_dict` y la época, sin estado del optimizador, lo que reduce el espacio en disco para despliegue.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos directamente comparables (misma tarea de generación de trayectorias de cámara condicionada por texto y keyframes con métricas publicadas). Como referencias contextuales:

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TKCAM | Generación de trayectorias de cámara (texto + keyframes) | no disponible | ventana VQ-VAE de 128 tokens; 3–11 s a 30 fps | MIT | checkpoints en HuggingFace + código en GitHub |
| MoMask | Generación de movimiento humano (receta base) | no disponible en esta información | no disponible | MIT | código abierto (base de TKCAM) |
| CLaTr | Evaluador contraste texto-trayectoria | no disponible | no disponible | no disponible | usado como métrica en este trabajo |

## Limitaciones y advertencias

- La recuperación texto-a-trayectoria es baja en términos absolutos: R@1 entre el 2,1 % y el 2,6 % sobre 2.500 clips. El control por texto es, por tanto, grueso; el condicionamiento visual (primer fotograma o keyframes) es el mecanismo fiable para dirigir el resultado.
- Dominio restringido: entrenado solo con el split `train` de RealEstate10K-Cap (21.250 clips de recorridos inmobiliarios en interiores). El comportamiento en exteriores, escenas con mucha gente o movimientos de cámara atípicos no está documentado.
- Riesgo de inconsistencias geométricas: el modelo genera trayectorias sin conocer la geometría 3D de la escena, por lo que puede producir recorridos que atraviesen paredes u obstáculos aunque el texto y los keyframes sean coherentes. No hay verificación de colisiones en el pipeline descrito.
- Duración acotada: las peticiones se recortan al rango 3–11 s, y los clips de entrenamiento están entre 4,0 y 9,3 s, por lo que fuera de ese intervalo la fiabilidad disminuye.
- Los checkpoints publicados no son los del paper: fueron reentrenados con la versión liberada del dataset y con selección del VQ-VAE por error de reconstrucción, de modo que los números del artículo no deben atribuirse a estos ficheros.
- Idiomas: no se documenta cobertura lingüística del codificador de texto. No hay garantía de funcionamiento equivalente en castellano frente a inglés; conviene validar los prompts en el idioma de uso.
- Licencia MIT para los pesos y el código, pero los codificadores T5 y CLIP se descargan por separado y quedan sujetos a sus propias licencias, que hay que revisar antes de un uso comercial.
- Sesgos: al derivar de un dataset inmobiliario, las trayectorias aprendidas reflejan los estilos de cámara y la distribución de estancias de ese corpus; no se han publicado análisis de sesgo.
- El repositorio no incluye scripts de cuantización ni versiones optimizadas, así que el coste de inferencia en producción debe medirse empíricamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yhz-linearalgebra/TKCAM
- Paper (arXiv:2610.11105): https://arxiv.org/abs/2610.11105
- PDF del paper: https://arxiv.org/pdf/2610.11105
- Código: https://github.com/linearalgebrayhz/TKCAM
- Página del proyecto: https://linearalgebrayhz.github.io/projects/TKCAM/
- Dataset RealEstate10K-Cap: https://huggingface.co/datasets/yhz-linearalgebra/RealEstate10K-Cap
- Publicaciones del primer autor: https://linearalgebrayhz.github.io/publications/
- MoMask (receta base, MIT): https://github.com/EricGuo5513/momask-codes
- Codificador de texto `t5-base`: https://huggingface.co/t5-base
- Codificador visual CLIP ViT-B/32: https://huggingface.co/openai/clip-vit-base-patch32
