# Weilin0/BackdoorDM

## Resumen

BackdoorDM es un benchmark integral para el estudio de ataques backdoor en modelos de difusión de texto a imagen, publicado en NeurIPS 2025 (Datasets & Benchmarks). Este repositorio aloja los pesos de los modelos envenenados (poisoned) que acompañan al paper, con nueve métodos de ataque implementados sobre Stable Diffusion v1.5 y, cuando corresponde, v2.0. El objetivo no es proporcionar modelos de generación de imágenes utilizables en producción, sino ofrecer un conjunto estandarizado de modelos comprometidos para investigar técnicas de defensa, reproducción de resultados y análisis de seguridad.

La relevancia actual de este proyecto radica en el creciente uso de modelos generativos en entornos no confiables, donde un atacante podría inyectar comportamientos maliciosos mediante envenenamiento de datos de entrenamiento. BackdoorDM proporciona una colección de 17 directorios de modelos, incluyendo nueve métodos de ataque (como BadT2I, BiBadDiff, TPA, EvilEdit, entre otros) con sus correspondientes métricas de evaluación (ACC, ASR, PSR) obtenidas mediante GPT-4o. Los pesos están estructurados en formato diffusers completo (unet, text_encoder, vae, safety_checker, tokenizer, scheduler), lo que facilita su uso con las herramientas de evaluación, defensa y visualización del código oficial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente (Stable Diffusion v1.5 y v2.0) con UNet + VAE + CLIP text encoder |
| Parametros totales | No disponible (depende de la versión: SD1.5 ≈ 860 M, SD2.0 ≈ 865 M) |
| Parametros activos | No aplica (no es modelo MoE) |
| Longitud de contexto | No aplica (modelo de generación de imágenes, el texto se codifica con CLIP) |
| Tipos de cuantizacion | No disponible (se espera pesos en fp32 o fp16 safetensors) |
| Idiomas soportados | Inglés (prompts de texto para CLIP) |
| Licencia | MIT |
| Formato de pesos | Safetensors en directorios diffusers (unet, text_encoder, vae, etc.) |

## Arquitectura y entrenamiento

Los modelos son variantes de Stable Diffusion v1.5 y v2.0, que emplean una arquitectura de difusión latente: un autoencoder VAE comprime la imagen al espacio latente, un UNet denoising itera sobre ese espacio, y un text encoder CLIP condiciona la generación con el prompt. La innovación de BackdoorDM no está en la arquitectura base sino en el proceso de entrenamiento, que introduce un envenenamiento controlado mediante diferentes métodos de ataque (envenenamiento de píxeles, envenenamiento de objetos, inyección de texto, estilos, etc.). Cada método altera el conjunto de entrenamiento o el proceso de optimización para lograr que el modelo asocie un desencadenante (trigger) con un resultado malicioso, manteniendo una calidad de generación aparentemente normal en condiciones normales. Los pesos publicados reproducen exactamente los modelos entrenados en el paper, con las mismas configuraciones de entrenamiento y los mismos hiperparámetros.

## Capacidades

- Generación de imágenes a partir de prompts de texto (con el comportamiento backdoor activado por el desencadenante).
- Reproducción de los nueve métodos de ataque backdoor documentados: BadT2I (Pixel, Object, Style), BiBadDiff, TPA (RickRolling), EvilEdit, TAA, TI (PaaS), DB (PaaS), y otros.
- Integración directa con el pipeline de evaluación del repositorio BackdoorDM (evaluation/configs/bdmodel_path.py).
- Incluye registros de evaluación con GPT-4o (eval_mllm/) para cada método.
- Soporta análisis de defensas: los pesos pueden ser usados como entrada para técnicas de detección y mitigación de backdoors.
- Permite visualización de los efectos del ataque y comparación entre métodos.

## Casos de uso

- Investigación en defensa contra backdoors: los investigadores pueden cargar estos pesos y aplicar técnicas de detección de backdoor (por ejemplo, análisis de activaciones, poda de neuronas, fine-tuning defensivo) para evaluar su efectividad contra ataques reales.
- Reproducción de resultados del paper: los pesos están estructurados para que el código de BackdoorDM los use directamente, permitiendo reproducir las tablas de métricas del artículo (ACC, ASR, PSR) sin necesidad de re-entrenar.
- Evaluación de robustez de modelos generativos: se puede comparar cómo diferentes métodos de ataque degradan la fidelidad de generación (PSR) y la tasa de éxito del ataque (ASR) en condiciones de prueba.
- Estudio de la transferencia de ataques: los modelos envenenados pueden ser usados para probar si un ataque entrenado en SD1.5 se transfiere a SD2.0, lo que ayuda a entender la generalización de los backdoors.
- Desarrollo de herramientas de inspección de modelos: los directorios diffusers permiten cargar los pesos en librerías como Diffusers y analizar internamente los componentes (UNet, VAE, text encoder) para detectar anomalías.
- Formación en seguridad de IA: como material didáctico en cursos sobre aprendizaje automático adversario, mostrando casos reales de envenenamiento en modelos de difusión.

## Benchmarks y rendimiento

La tabla siguiente muestra las métricas reportadas en el paper (evaluación con GPT-4o) para cada método y versión de Stable Diffusion. ACC_GPT es la precisión de generación (fidelidad de la imagen), ASR_GPT es la tasa de éxito del ataque (activación del backdoor), y PSR_GPT es la tasa de preservación del estilo (calidad de la imagen cuando no se activa el trigger).

| Method | Ver | ACC_GPT | ASR_GPT | PSR_GPT |
|---|---|---|---|---|
| Pixel-Backdoor (BadT2I) | SD1.5 | 84.51 | 99.6 | 89.69 |
| Pixel-Backdoor (BadT2I) | SD2.0 | 90.85 | 67.7 | 67.09 |
| BiBadDiff | SD1.5 | 19.48 | 34.10 | 25.72 |
| TPA (RickRolling) | SD1.5 | 83.41 | 96.80 | 5.50 |
| TPA (RickRolling) | SD2.0 | 85.19 | 83.70 | 8.53 |
| Object-Backdoor (BadT2I) | SD1.5 | 83.94 | 40.30 | 82.19 |
| Object-Backdoor (BadT2I) | SD2.0 | 85.42 | 8.30 | 91.96 |
| TI (PaaS) | SD1.5 | 84.27 | 88.70 | 30.34 |
| TI (PaaS) | SD2.0 | 85.77 | 67.70 | 67.09 |
| DB (PaaS) | SD1.5 | 70.87 | 51.30 | 60.22 |
| DB (PaaS) | SD2.0 | 71.27 | 4.40 | 63.93 |
| EvilEdit | SD1.5 | 83.01 | 61.10 | 85.25 |
| EvilEdit | SD2.0 | 76.60 | 52.60 | 76.60 |
| TAA (RickRolling) | SD1.5 | 86.18 | 96.30 | 65.92 |
| TAA (RickRolling) | SD2.0 | 86.94 | 95.50 | 62.89 |
| Style-Backdoor (BadT2I) | SD1.5 | 84.82 | 91.30 | 90.68 |
| Style-Backdoor (BadT2I) | SD2.0 | 88.11 | 89.80 | 91.30 |

Valores bajos (por ejemplo, PSR bajo para TPA, o ASR bajo en SD2.0) son comportamientos esperados y se discuten en el paper; los pesos reproducen los valores reportados.

## Requisitos de hardware

- Inferencia (generación de imágenes): una GPU con al menos 8 GB de VRAM para SD1.5 en fp16 (por ejemplo, RTX 3070/4060). Para SD2.0, se recomienda 12 GB (RTX 3060 12 GB, RTX 3080).
- Entrenamiento o fine-tuning de defensas: se recomienda GPU de 16 GB o más (RTX 4090, A100 40 GB) para manejar el tamaño del modelo y los lotes de datos.
- Evaluación de defensas: puede requerir múltiples GPUs si se ejecutan pipelines de detección pesados; el código del repositorio soporta ejecución en paralelo.
- Despliegue: el repositorio usa la librería `diffusers`; se puede usar con vLLM para generación de imágenes, aunque no es el objetivo principal. Para reproducción de benchmarks, se usa el script de evaluación del propio proyecto.
- Latencia y throughput: no se han publicado datos específicos; depende del hardware y del método de defensa aplicado.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros benchmarks de backdoor en modelos de difusión, ya que la mayoría de los trabajos previos se centran en clasificadores o LLMs. Como referencia, existen otros benchmarks como BadT2I (el mismo nombre para el método de ataque de píxeles), pero no hay una tabla comparativa de métricas en la información disponible. El proyecto BackdoorDM se destaca por ser el primer benchmark integral que cubre nueve métodos de ataque en dos versiones de Stable Diffusion, con métricas estandarizadas mediante GPT-4o.

## Limitaciones y advertencias

- Uso restringido: los modelos son intencionalmente envenenados y NO deben usarse en producción ni en servicios que expongan contenido generado a usuarios no confiados. Su único fin es investigación en defensa y seguridad.
- Sesgos y alucinaciones: al ser modelos de difusión entrenados con datos web, pueden reproducir sesgos de género, raza y contenido inapropiado. Además, el backdoor puede activarse con el trigger específico, generando contenido no deseado.
- Limitaciones de idioma: los prompts están en inglés; no hay soporte multilingüe en el text encoder.
- Licencia MIT: aunque permite uso comercial, los autores advierten explícitamente del riesgo de usarlos en entornos reales. Se recomienda aplicar defensas antes de cualquier uso.
- Falta de datos de cuantización: no se proporcionan pesos cuantizados; el usuario deberá convertirlos si necesita optimizaciones de memoria.
- Fecha de creación y actualización del repositorio es futura (2026), lo que puede indicar que es un proyecto reciente o con fecha ficticia; se recomienda verificar la fecha de publicación del paper (2025).

## Enlaces

- Repositorio HuggingFace: [https://huggingface.co/Weilin0/BackdoorDM](https://huggingface.co/Weilin0/BackdoorDM)
- Paper arXiv: [https://arxiv.org/abs/2502.11798](https://arxiv.org/abs/2502.11798)
- Código fuente: [https://github.com/linweiii/BackdoorDM](https://github.com/linweiii/BackdoorDM)
