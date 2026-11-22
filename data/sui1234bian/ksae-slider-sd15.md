# sui1234bian/ksae-slider-sd15

## Resumen

ksae-slider-sd15 es un checkpoint de autoencoder disperso (k-sparse autoencoder, k-SAE) entrenado sobre las activaciones del codificador de texto CLIP de Stable Diffusion 1.5. Lo desarrolla sui1234bian como proyecto de curso para la asignatura IERG4320/IEMS5726A Data Science in Practice (CUHK, 2026-27 Term 1) y reproduce el trabajo *All-in-One Slider for Attribute Manipulation in Diffusion Models* (CVPR 2026, arXiv:2508.19195). No es un modelo generativo: es un módulo auxiliar de 37 MB que factoriza el espacio de condicionamiento de 768 dimensiones en 6.144 direcciones dispersas y deriva de ellas 52 direcciones de control continuo para atributos faciales.

El problema que resuelve es la edición de atributos en modelos de difusión sin reentrenamiento por atributo ni modificación del UNet. Aplicando una dirección con una fuerza escalar sobre la rama condicional y la opuesta sobre la incondicional en la capa 10 del text encoder, se obtienen sliders continuos para atributos como sonrisa, edad, calvicie, gafas o bigote. La validación reporta una varianza explicada de 0,9504 tras 3.000 pasos.

Es relevante por su enfoque de interpretabilidad y control: un único módulo pequeño habilita 52 atributos con entrenamiento conjunto, lo que contrasta con los enfoques de una dirección por atributo. Su alcance, no obstante, es estrictamente de investigación y coursework, con licencia restringida y sin datos de benchmarks de generación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | k-sparse autoencoder (k-SAE) sobre activaciones de CLIP text encoder de SD1.5; capa 10, token EOS, 768 dimensiones |
| Parametros totales | no disponible (el checkpoint pesa 37 MB; config: d_in=768, n_features=6144, k=32, aux_k=128) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre embeddings de prompt de SD1.5) |
| Tipos de cuantizacion | no disponible (pesos en model.pt, presumiblemente fp32/fp16; no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | research-and-coursework-only (research only; el modelo base SD1.5 no se redistribuye) |
| Formato de pesos | PyTorch (`model.pt`, con `W_enc`, `b_enc`, `W_dec`, `b_dec`, config y steps) y `directions.npz` (52 vectores de 768 dimensiones) |

## Arquitectura y entrenamiento

El módulo es un k-sparse autoencoder con 6.144 características latentes y k=32 (aux_k=128) que se entrena para reconstruir activaciones de 768 dimensiones extraídas del codificador de texto CLIP de SD1.5, concretamente de la capa 10 en el token EOS. La factorización dispersa permite obtener direcciones interpretables: de las 6.144 direcciones del diccionario se derivan 52 direcciones unitarias de steering, una por atributo facial, sin entrenamiento específico por atributo.

El entrenamiento usó el conjunto de prompts contrastivos publicado con el paper de referencia, con 46.824 muestras de entrenamiento y 5.176 de validación, durante 3.000 pasos. Se reporta una varianza explicada de validación de 0,9504 y un coseno medio absoluto entre pares de direcciones de 0,131, lo que indica baja interferencia entre atributos. No se documentan fases de RLHF ni DPO, ni innovaciones de decodificación; la innovación principal es la propia factorización dispersa aplicada al espacio de condicionamiento.

## Capacidades

- Control continuo de 52 atributos faciales en generación con SD1.5 mediante un escalar de fuerza por atributo.
- Edición de atributos sin modificar el UNet ni reentrenar por atributo.
- Extracción de direcciones interpretables del espacio de condicionamiento CLIP (768 dimensiones).
- Aplicación mediante forward hook en `text_model.encoder.layers[9]` del text encoder.
- No realiza generación de texto, código, matemáticas ni razonamiento: es un módulo de steering, no un LLM.
- No soporta tool calling, function calling ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües: no disponibles (dependen del text encoder de SD1.5).

## Casos de uso

- Edición de retratos en investigación: aplicar el slider de sonrisa o edad sobre un prompt y ajustar la fuerza para estudiar la respuesta del modelo, con la ventaja de no requerir entrenamiento adicional por atributo.
- Estudio de interpretabilidad de espacios latentes: analizar las 52 direcciones y su coseno medio (0,131) para investigar la estructura del espacio de condicionamiento de CLIP en SD1.5.
- Reproducción de resultados académicos: replicar las curvas de correlación de CLIP score frente a fuerza del slider reportadas en el paper de referencia.
- Docencia y coursework: demostrar en clase cómo un k-SAE factoriza activaciones y cómo se inyectan direcciones en la rama condicional e incondicional de un pipeline de difusión.
- Experimentos controlados de sesgo: medir cómo atributos como edad o género responden a sliders y documentar sesgos del modelo base.
- Prototipado de interfaces de edición de atributos: construir un front-end de sliders sobre SD1.5 para validar la usabilidad del control continuo antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Varianza explicada de validación (3.000 pasos) | 0,9504 |
| Muestras train / val | 46.824 / 5.176 |
| Direcciones de atributo | 52 |
| Coseno medio absoluto entre pares de direcciones | 0,131 |
| Spearman CLIP score vs fuerza (smile) | +1,000 |
| Spearman CLIP score vs fuerza (age) | +1,000 |
| Spearman CLIP score vs fuerza (bald) | +0,900 |
| Spearman CLIP score vs fuerza (eyeglasses) | +0,900 |
| Spearman CLIP score vs fuerza (mustache) | +0,400 |
| Direcciones del diccionario que nunca entran en el top-k | 81,5 % |

No se han publicado resultados de benchmarks de generación (FID, CLIP score absoluto, MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM del módulo: despreciable (37 MB de pesos); el requisito real lo impone SD1.5, aproximadamente 4-6 GB en fp16 para inferencia básica.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobradas para el módulo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 6 GB o más, ya que el coste adicional sobre SD1.5 es mínimo.
- Despliegue: el módulo se integra en un pipeline de `diffusers` mediante forward hook; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un módulo de difusión).
- Latencia y throughput: no disponibles; el overhead del hook es marginal frente a los pasos de muestreo del UNet.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| ksae-slider-sd15 | k-SAE de steering | no disponible (37 MB) | no disponible | 52 atributos con un solo módulo | research-and-coursework-only |
| All-in-One Slider (paper de referencia) | Slider de atributos | no disponible | no disponible | Método original sobre difusión | no disponible |
| Direcciones por atributo (enfoque clásico) | Steering lineal | 768 por atributo | no disponible | Una dirección entrenada por atributo | variable |
| SD1.5 base | Difusión texto-imagen | ~860 M (UNet) | 77 tokens | Generación sin control de atributos | CreativeML Open RAIL-M |

No se dispone de datos de rendimiento comparativo con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia restringida a investigación y coursework; no se permite uso comercial.
- El modelo base SD1.5 no se redistribuye; el usuario debe obtenerlo por su cuenta y cumplir su licencia.
- El 81,5 % de las direcciones del diccionario nunca entra en el top-k, limitación documentada por el autor.
- La correlación del slider de bigote es baja (Spearman +0,400), lo que indica control poco fiable para ese atributo.
- No se debe pasar `attention_mask` al text encoder: SD1.5 se entrenó sin ella y su uso colapsa la salida a ruido.
- Solo cubre atributos faciales sobre SD1.5; no es transferible sin validación a otros modelos de difusión.
- Riesgo de alucinación y sesgos heredados del modelo base y del conjunto de prompts contrastivos; no se documentan evaluaciones de sesgo.
- Sin benchmarks de calidad de generación publicados; no apto para producción sin evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y mantenimiento no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/sui1234bian/ksae-slider-sd15
- Paper de referencia: https://arxiv.org/abs/2508.19195
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
