# wtfkedar/qwen3vl-32b-helmet-verifier-nf4-lora

## Resumen

El modelo `wtfkedar/qwen3vl-32b-helmet-verifier-nf4-lora` es un adaptador LoRA (QLoRA en NF4) sobre `Qwen/Qwen3-VL-32B-Instruct`, un modelo vision-language de 32 mil millones de parámetros desarrollado por Alibaba Qwen. El adaptador ha sido entrenado por el usuario wtfkedar para una tarea muy concreta: clasificar recortes de personas procedentes de cámaras CCTV en cuatro categorías relacionadas con el uso de casco de seguridad (`helmet`, `no_helmet`, `unclear`, `no_person`). No es un modelo generalista, sino un verificador especializado pensado como segunda etapa de una cascada de detección.

La relevancia del modelo reside en su enfoque de despliegue: en lugar de generar texto libre, la inferencia lee los logits de los primeros tokens de cuatro palabras respuesta y los convierte en probabilidades calibradas de cuatro clases. Se marca una violación cuando `p(no_helmet) ≥ 0.104`, umbral elegido en validación para obtener una precisión de `no_helmet` ≥ 0.90. Está diseñado para ejecutarse en hardware con memoria unificada, concretamente una NVIDIA Jetson AGX Thor de 128 GB, y el checkpoint publicado corresponde al paso 400 de 450 de entrenamiento.

El modelo se distribuye únicamente como adaptadores PEFT (no como pesos completos), requiere el modelo base cuantizado en NF4 y está etiquetado como repositorio privado en la model card. Su utilidad práctica está acotada a la verificación de cumplimiento de casco en entornos de videovigilancia, y su valor técnico está en la calibración de probabilidades y en el diseño de cascada con un clasificador rápido previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL) con adaptadores LoRA sobre base cuantizada NF4 |
| Parametros totales | 32 000 millones (modelo base Qwen3-VL-32B-Instruct); adaptadores LoRA r=16, α=32 sobre 448 módulos lineales del LLM y 108 bloques ViT, más el merger visión-lenguaje completo en fp32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base NF4 con doble cuantización (bitsandbytes), cómputo en bf16; torre de visión y `lm_head` en bf16; merger en fp32 |
| Idiomas soportados | no disponible (la tarea es clasificación visual con respuesta de una palabra en inglés) |
| Licencia | no disponible (el modelo base Qwen3-VL-32B-Instruct es Apache-2.0, pero la licencia del adaptador no se especifica) |
| Formato de pesos | safetensors (adaptadores PEFT), más `merger.safetensors` con los pesos del merger visión-lenguaje |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre el modelo base congelado en NF4 (doble cuantización de bitsandbytes, cómputo en bf16). Se aplican adaptadores LoRA con r=16 y α=32 sobre todas las capas lineales del LLM (448 módulos) y sobre los bloques del ViT (108 módulos), además de afinar por completo el merger visión-lenguaje en fp32. La torre de visión y el `lm_head` se mantienen en bf16. El entrenamiento se realizó en una única NVIDIA Jetson AGX Thor con 128 GB de memoria unificada, durante 9,2 horas, a 70,6 segundos por paso de optimizador. El checkpoint publicado es el paso 400 de 450, seleccionado por recall de `no_helmet` en el conjunto difícil con precisión ≥ 0.90 y, en segundo lugar, por macro-F1 en validación.

La innovación técnica principal no está en la arquitectura, sino en el protocolo de inferencia: el modelo no genera texto, sino que se leen los logits del primer token de cuatro palabras respuesta (`helmet`, `bare`, `unclear`, `none`) y se convierten en probabilidades de cuatro clases. Las probabilidades se escalan por temperatura (T = 0.363, ajustada en validación) para corregir el exceso de confianza (ECE bruto de 0.185, ECE calibrado de 0.024 en validación). El conjunto de entrenamiento consta de 1 713 recortes de un único emplazamiento, lo que limita la generalización a nuevas cámaras.

## Capacidades

- Clasificación visual de recortes de personas en cuatro clases: `helmet`, `no_helmet`, `unclear`, `no_person`.
- Salida de probabilidades calibradas de cuatro vías mediante lectura de logits de los primeros tokens de las palabras respuesta.
- Detección de violaciones de cumplimiento con umbral configurable (`p(no_helmet) ≥ 0.104` para precisión ≥ 0.90 en validación).
- Integración como segunda etapa de una cascada: un clasificador rápido decide la mayoría de recortes y este verificador resuelve los inciertos y de baja calidad.
- Servicio HTTP listo para producción (`prod_deployment.py --serve`) que acepta bytes de imagen y devuelve JSON.
- API de Python (`HelmetVerifier.predict`) para integración en pipelines.
- Capacidad de ejecución en hardware de borde con memoria unificada (Jetson AGX Thor).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades generales del modelo base en este adaptador; la tarea está restringida a la clasificación de casco.

## Casos de uso

- Verificación de cumplimiento de casco en obras y plantas industriales: el modelo recibe recortes de personas detectadas por un sistema de CCTV y emite una probabilidad calibrada de `no_helmet`, lo que permite generar alertas con un umbral ajustable a la precisión deseada.
- Segunda etapa de una cascada de detección: un clasificador ligero procesa todos los recortes y solo los inciertos o de baja calidad se envían a este verificador de 32B, reduciendo el coste computacional frente a ejecutar el modelo grande sobre todo el flujo.
- Despliegue en borde en instalaciones remotas: al ejecutarse en una Jetson AGX Thor con 128 GB de memoria unificada, puede integrarse en un nodo local de videovigilancia sin depender de la nube.
- Auditoría de seguridad laboral: el modelo puede procesar lotes de recortes históricos y producir probabilidades por clase para revisar incidentes o generar informes de cumplimiento.
- Filtrado de falsos positivos de un detector previo: los recortes marcados como sospechosos por un sistema más simple se revalidan con este verificador, que aporta una probabilidad calibrada y un umbral documentado.
- Servicio HTTP interno de clasificación: mediante `prod_deployment.py --serve`, se puede exponer un endpoint que reciba bytes de imagen y devuelva JSON con probabilidades, predicción, indicador de violación y confianza, para integrarlo en un sistema de gestión de alarmas.
- Investigación en calibración de modelos vision-language: el repositorio incluye diagramas de fiabilidad, curvas PR, matrices de confusión y configuración de entrenamiento, útiles para estudiar calibración con temperature scaling en tareas de clasificación visual.

## Benchmarks y rendimiento

| Split | Recortes | Accuracy | Macro-F1 | Recall `no_helmet` con P ≥ 0.90 | ECE |
|---|---|---|---|---|---|
| Validación | 313 | 0.965 | 0.888 | 1.000 | 0.024 |
| Test difícil (recortes pequeños, IR, borrosos) | 116 | 0.853 | 0.744 | 0.986 | 0.096 |

Por clase:

| Clase | Precisión val | Recall val | F1 val | Precisión difícil | Recall difícil | F1 difícil |
|---|---|---|---|---|---|---|
| helmet | 0.972 | 0.979 | 0.975 | 0.848 | 0.966 | 0.903 |
| no_helmet | 0.975 | 0.994 | 0.984 | 0.957 | 0.930 | 0.943 |
| unclear | 0.800 | 0.632 | 0.706 | 0.500 | 0.313 | 0.385 |
| no_person | no evaluado (sin muestras) | | | | | |

Matrices de confusión (filas clase real, columnas predicha en orden helmet, no_helmet, unclear, no_person):

| Clase real | Validación | Difícil |
|---|---|---|
| helmet | 137 · 1 · 2 · 0 | 28 · 0 · 1 · 0 |
| no_helmet | 0 · 153 · 1 · 0 | 1 · 66 · 4 · 0 |
| unclear | 4 · 3 · 12 · 0 | 4 · 3 · 5 · 4 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible, ya que el adaptador está especializado en una única tarea de clasificación visual.

## Requisitos de hardware

- VRAM estimada: aproximadamente 40 GB libres en GPU CUDA. La base NF4 ocupa unos 20 GB; la torre de visión en bf16 y las activaciones consumen el resto.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, o hardware con memoria unificada como la Jetson AGX Thor de 128 GB usada en el entrenamiento. En consumer GPU de 24 GB (RTX 4090) no cabe con esta configuración.
- Cabe en consumer GPU: no, con la configuración documentada (base NF4 + torre de visión bf16 + activaciones). Se requeriría una cuantización adicional no documentada.
- Opciones de despliegue: el repositorio incluye `prod_deployment.py` con CLI, API de Python y servicio HTTP. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la integración es mediante PEFT sobre el modelo base cuantizado con bitsandbytes.
- Latencia y throughput: no disponibles. El entrenamiento requirió 70,6 s por paso de optimizador en Jetson Thor, pero no se publican métricas de inferencia. En Jetson Thor se recomienda ejecutar un solo trabajo de modelo a la vez.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wtfkedar/qwen3vl-32b-helmet-verifier-nf4-lora | 32B (base) + LoRA | no disponible | Clasificación de casco en 4 clases | no disponible (base Apache-2.0) | HuggingFace (repo privado) |
| Qwen/Qwen3-VL-32B-Instruct | 32B | no disponible | Vision-language general | Apache-2.0 | HuggingFace |
| Clasificadores CNN específicos de casco | típicamente < 100M | N/A | Detección/clasificación de casco | variable | variable |

La comparación con clasificadores CNN específicos es cualitativa: este adaptador ofrece probabilidades calibradas y aprovecha el conocimiento visual de un modelo de 32B, a cambio de un coste de hardware muy superior (≈40 GB de VRAM frente a pocos cientos de MB de un CNN). No se dispone de datos de benchmarks de alternativas en la información proporcionada.

## Limitaciones y advertencias

- `no_person` no está entrenada: solo había 2 ejemplos en entrenamiento y ninguno en evaluación. Las predicciones de `no_person` deben tratarse como `unclear`; en el conjunto difícil, 4 recortes `unclear` se predijeron como `no_person`.
- La clase `unclear` es débil: recall de 0.63 en validación y 0.31 en el conjunto difícil. La mayoría de los fallos se asignan a `helmet` o `no_helmet`.
- Los recortes en infrarrojo alcanzan solo 0.44 de accuracy en el conjunto difícil (9 recortes). Los recortes pequeños (< 70 px de alto) alcanzan 0.81 y los borrosos 0.91.
- Calibración: las puntuaciones en bruto son sobreconfiadas (ECE 0.185). Es obligatorio aplicar la temperatura de `deployment_config.json`; `prod_deployment.py` lo hace por defecto.
- Datos escasos: 1 713 recortes de entrenamiento de un único emplazamiento. Debe verificarse la accuracy con imágenes de nuevas cámaras antes de confiar en el modelo.
- La precisión de la base debe coincidir: los adaptadores se ajustaron a la base cuantizada en NF4. Cargarlos sobre la base bf16 o fusionarlos en ella cambia las salidas; es necesario volver a evaluar tras cualquier cambio de este tipo.
- Licencia del adaptador no especificada: aunque el modelo base es Apache-2.0, el uso comercial del adaptador requiere verificar los términos con el autor.
- El repositorio aparece como privado en la model card y requiere un token de lectura de HuggingFace para su descarga.
- Riesgo de alucinación en la clase `unclear`: el modelo puede forzar una decisión binaria cuando la imagen no es concluyente, por lo que el umbral y la temperatura deben validarse en el dominio de despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/wtfkedar/qwen3vl-32b-helmet-verifier-nf4-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Resultados y plots: `results/plots/` y `results/SUMMARY.md` dentro del repositorio de HuggingFace
- Código de despliegue: `prod_deployment.py` dentro del repositorio de HuggingFace
- Código de entrenamiento y evaluación: `helmet_vlm/` dentro del repositorio de HuggingFace
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
