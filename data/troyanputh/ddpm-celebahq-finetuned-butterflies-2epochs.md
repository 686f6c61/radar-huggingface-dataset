# Troyanputh/ddpm-celebahq-finetuned-butterflies-2epochs

## Resumen

El modelo `Troyanputh/ddpm-celebahq-finetuned-butterflies-2epochs` es un modelo de difusion incondicional de imagenes publicado en Hugging Face por el usuario Troyanputh. Se trata de un fine-tuning del checkpoint base `ddpm-celebahq-256` (un DDPM entrenado sobre el dataset CelebA-HQ a 256x256) sobre un dataset de mariposas durante 2 epocas, siguiendo el flujo de trabajo del curso Diffusion Models Class de Hugging Face (unidad 2). El resultado es un modelo que genera imagenes de mariposas sinteticas sin condicionamiento textual ni de otro tipo.

Arquitectura: es un DDPM (Denoising Diffusion Probabilistic Model) clasico con una U-Net como red de ruido, integrado en la libreria `diffusers` mediante `DDPMPipeline`. Cuenta con 113.673.219 parametros (segun los pesos en safetensors) y el repositorio ocupa aproximadamente 0,5 GB. No dispone de ventana de contexto en el sentido de los modelos de lenguaje: opera sobre tensores de imagen de 256x256 pixeles.

Su relevancia es limitada y de caracter educativo: se trata de un experimento de fine-tuning de pocas epocas, con 0 descargas y 0 likes en el momento de la consulta, y una model card practicamente vacia (solo incluye la plantilla del curso y un ejemplo de uso). No esta pensado para produccion ni para tareas generales, sino como demostracion del proceso de ajuste de un modelo de difusion sobre un dataset propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDPM con U-Net para prediccion de ruido (difusion incondicional) |
| Parametros totales | 113.673.219 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, salida 256x256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria diffusers, framework PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la formulacion estandar de los DDPM: un proceso directo que anade ruido gaussiano a la imagen de forma progresiva y un proceso inverso aprendido por una U-Net que predice el ruido en cada paso temporal. La inferencia se realiza con `DDPMPipeline` de `diffusers`, que aplica el sampler de denoising por defecto del pipeline. No hay condicionamiento (ni texto, ni clase, ni imagen de referencia): la generacion parte de ruido puro.

El entrenamiento consiste en un fine-tuning del checkpoint `ddpm-celebahq-256` sobre un dataset de mariposas durante 2 epocas, segun indica el propio nombre del modelo. No se especifican en la informacion disponible el numero de imagenes del dataset, el numero de tokens o pasos de entrenamiento, la composicion del dataset, la tasa de aprendizaje, el tamano de batch ni si se aplicaron tecnicas adicionales como EMA o decodificacion especulativa. Tampoco se documenta el uso de RLHF, DPO ni preferencias humanas, algo por otra parte ajeno a este tipo de modelos. No se han publicado innovaciones tecnicas destacables.

## Capacidades

- Generacion de imagenes incondicionales de mariposas a 256x256 pixeles.
- Muestreo estocastico mediante el sampler DDPM integrado en `DDPMPipeline`.
- Integracion directa con la libreria `diffusers` (carga con `from_pretrained`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision por prompt, audio ni otras modalidades.
- No admite control por texto, clase o imagen de referencia (es estrictamente incondicional).

## Casos de uso

- Experimentacion educativa: reproducir el flujo de la unidad 2 del curso Diffusion Models Class, cargando el pipeline y generando muestras para comparar el efecto del fine-tuning sobre el checkpoint base.
- Generacion de datasets sinteticos de mariposas: producir imagenes de relleno para pruebas de pipelines de vision por computador (aumento de datos, tests de carga de imagenes) sin depender de datos reales.
- Prototipado de interfaces de generacion de imagenes: usar el modelo como backend minimo en una demo o notebook para validar la integracion de `diffusers` antes de migrar a un modelo mayor.
- Estudio del olvido catastrofico y del sesgo del fine-tuning: comparar visualmente las muestras tras 2 epocas con las del modelo base `ddpm-celebahq-256` para analizar como se desplaza la distribucion aprendida.
- Benchmarking de infraestructura de inferencia: al ser un modelo pequeno (113,7 M de parametros, repo de 0,5 GB), sirve para medir tiempos de carga y throughput de `diffusers` en GPU consumer o incluso en CPU.
- Docencia y talleres: material de partida para explicar el funcionamiento interno de un DDPM, el rol de la U-Net y el proceso de denoising paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa aproximadamente 0,5 GB en precision de entrenamiento (fp32); en la practica, la U-Net a 256x256 requiere del orden de 2-4 GB de VRAM para un batch pequeno, aunque no se dispone de mediciones publicadas para este modelo concreto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la mayoria de configuraciones; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque las dos ultimas estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna (GTX 1660 en adelante); tambien puede ejecutarse en CPU con latencias mayores.
- Opciones de despliegue: `diffusers` con PyTorch (via `DDPMPipeline`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. Es posible exportar a ONNX de forma manual, aunque no esta documentado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Troyanputh/ddpm-celebahq-finetuned-butterflies-2epochs | 113,7 M | 256x256 | Ninguno | MIT | Hugging Face |
| google/ddpm-celebahq-256 (checkpoint base) | no disponible en la informacion | 256x256 | Ninguno | no disponible | Hugging Face |
| google/ddpm-cifar10-32 | no disponible en la informacion | 32x32 | Ninguno | no disponible | Hugging Face |
| CompVis/stable-diffusion-v1-4 | no disponible en la informacion | 512x512 | Texto | CreativeML OpenRAIL-M | Hugging Face |

La comparacion cuantitativa de rendimiento no esta disponible: no se han publicado metricas (FID, IS, precision/recall) para este modelo ni para los alternativos en la informacion proporcionada. La diferencia principal frente a los modelos con condicionamiento textual es que este DDPM no acepta prompts, lo que limita su utilidad practica a experimentacion y generacion incondicional.

## Limitaciones y advertencias

- Model card practicamente vacia: el autor no documenta dataset, hiperparametros ni resultados, lo que impide reproducir el entrenamiento.
- Fine-tuning de solo 2 epocas: es probable que el modelo conserve rasgos del dataset original (CelebA-HQ) y que la calidad de las mariposas generadas sea limitada, aunque no hay evaluacion publicada que lo confirme.
- Sesgos conocidos: no documentados; al derivar de CelebA-HQ, podria arrastrar sesgos de ese dataset, pero no hay analisis disponible.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si en forma de artefactos visuales y muestras poco realistas, esperables en un DDPM pequeno con poco fine-tuning.
- Limitaciones de idioma: no procesa texto, por lo que no hay soporte multilingue que evaluar.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; conviene verificar la licencia del checkpoint base y del dataset de mariposas utilizado, no documentados en la ficha.
- Caveat para produccion: con 0 descargas y 0 likes, no hay evidencia de uso en produccion; no se recomienda como dependencia critica sin una evaluacion propia de calidad y sin fijar una revision concreta del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Troyanputh/ddpm-celebahq-finetuned-butterflies-2epochs
- Curso Diffusion Models Class (unidad 2): https://github.com/huggingface/diffusion-models-class
- Checkpoint base de referencia: https://huggingface.co/google/ddpm-celebahq-256
- Documentacion de `DDPMPipeline`: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
- Documentacion de `diffusers`: https://huggingface.co/docs/diffusers
